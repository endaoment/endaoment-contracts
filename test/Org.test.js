const { accounts, contract } = require("@openzeppelin/test-environment");
const {
  balance,
  BN,
  constants,
  expectEvent,
  expectRevert,
  send,
} = require("@openzeppelin/test-helpers");
const { assert, expect } = require("chai");

const EndaomentAdmin = contract.fromArtifact("endaomentAdmin");
const Org = contract.fromArtifact("Org");
const ERC20Mock = contract.fromArtifact('ERC20Mock');

describe("Org", function() {
  const name = 'TestToken';
  const symbol = 'TTKN';
  const initSupply = new BN(100);

  const [initHolder, admin, accountant, pauser, reviewer, user, other_user, orgFactory] = accounts;

  beforeEach(async function() {
    this.endaomentAdmin = await EndaomentAdmin.new({ from: admin });
    this.token = await ERC20Mock.new(name, symbol, initHolder, initSupply);
    await this.endaomentAdmin.setRole(6, admin, { from: admin });
    await this.endaomentAdmin.setRole(1, pauser, { from: admin });
    await this.endaomentAdmin.setRole(2, accountant, { from: admin });
    await this.endaomentAdmin.setRole(3, reviewer, { from: admin });
    await this.endaomentAdmin.setRole(5, orgFactory, { from: admin });
  });

  it("allows ADMIN to construct", async function() {
    const org = await Org.new(123, this.endaomentAdmin.address, { from: admin });
    assert.isDefined(org.address);
  });
  
  it("allows ORG_FACTORY to construct", async function() {
    const org = await Org.new(123, this.endaomentAdmin.address, { from: orgFactory });
    assert.isDefined(org.address);
  });
  
  it("denies USER to construct", async function() {
    await expectRevert.unspecified(Org.new(123, this.endaomentAdmin.address, { from: user }));
  });
  
  it("registers valid claim requests", async function() {
    const org = await Org.new(123, this.endaomentAdmin.address, { from: admin });
    const claimRequestReceipt = await org.claimRequest("John", "Doe", true, "john@doe.com", user, { from: user });
    const claimCount = await org.getClaimsCount({ from: user });
    assert.equal(claimCount, 1);
    const claim = await org.claims(0, {from: user});
    assert.equal(claim.firstName, "John");
    assert.equal(claim.lastName, "Doe");
    assert.equal(claim.eMail, "john@doe.com");
    assert.equal(claim.desiredWallet, user);
    assert.equal(claim.filesSubmitted, true);
  });
  
  it("rejects invalid claim requests", async function() {
    const org = await Org.new(123, this.endaomentAdmin.address, { from: admin });
    await expectRevert.unspecified(org.claimRequest("John", "Doe", false, "john@doe.com", user, { from: user }));
    await expectRevert.unspecified(org.claimRequest("John", "Doe", true, "john@doe.com", other_user, { from: user }));
    const claimCount = await org.getClaimsCount({ from: user });
    assert.equal(claimCount, 0);
  });

  it("allows ADMIN to approve claims", async function() {
    const org = await Org.new(123, this.endaomentAdmin.address, { from: admin });
    const claimRequestReceipt = await org.claimRequest("John", "Doe", true, "john@doe.com", user, { from: user });
    const claim = await org.claims(0, {from: user});
    const approveClaimReceipt = await org.approveClaim(0, this.endaomentAdmin.address, { from: admin });
    assert.equal(user, await org.orgWallet({ from: user }));
  });
  
  it("allows REVIEWER to approve claims", async function() {
    const org = await Org.new(123, this.endaomentAdmin.address, { from: admin });
    const claimRequestReceipt = await org.claimRequest("John", "Doe", true, "john@doe.com", user, { from: user });
    const claim = await org.claims(0, {from: user});
    const approveClaimReceipt = await org.approveClaim(0, this.endaomentAdmin.address, { from: reviewer });
    assert.equal(user, await org.orgWallet({ from: user }));
  });
  
  it("denies USER to approve claims", async function() {
    const org = await Org.new(123, this.endaomentAdmin.address, { from: admin });
    const claimRequestReceipt = await org.claimRequest("John", "Doe", true, "john@doe.com", user, { from: user });
    const claim = await org.claims(0, {from: user});
    await expectRevert.unspecified(org.approveClaim(0, this.endaomentAdmin.address, { from: user }));
  });

  it("checks token balance", async function() {
    const org = await Org.new(123, this.endaomentAdmin.address, { from: admin });
    const tokenBalance0 = await org.getTokenBalance(this.token.address, { from: org.address });
    assert(tokenBalance0.eq(new BN(0)));
    await this.token.transfer(org.address, 1, { from: initHolder });
    const tokenBalance1 = await org.getTokenBalance(this.token.address, { from: org.address });
    assert(tokenBalance1.eq(new BN(1)));
  });

  it("allows ADMIN to cash out org", async function() {
    const org = await Org.new(123, this.endaomentAdmin.address, { from: admin });
   
    await this.token.transfer(org.address, 1, { from: initHolder });
    const orgTokenBalance0 = await org.getTokenBalance(this.token.address, { from: other_user });
    assert(orgTokenBalance0.eq(new BN(1)));

    const cashOutOrgReceipt = await org.cashOutOrg(other_user, this.token.address, this.endaomentAdmin.address, { from: admin });
    const orgTokenBalance1 = await org.getTokenBalance(this.token.address, { from: other_user });
    
    assert(orgTokenBalance1.eq(new BN(0)));
    assert((await this.token.balanceOf(other_user)).eq(new BN(1)));
  });
  
  it("allows ACCOUNTANT to cash out org", async function() {
    const org = await Org.new(123, this.endaomentAdmin.address, { from: admin });
    
    await this.token.transfer(org.address, 1, { from: initHolder });
    const orgTokenBalance0 = await org.getTokenBalance(this.token.address, { from: other_user });
    assert(orgTokenBalance0.eq(new BN(1)));
    
    const cashOutOrgReceipt = await org.cashOutOrg(other_user, this.token.address, this.endaomentAdmin.address, { from: accountant });
    const orgTokenBalance1 = await org.getTokenBalance(this.token.address, { from: other_user });
    
    assert(orgTokenBalance1.eq(new BN(0)));
    assert((await this.token.balanceOf(other_user)).eq(new BN(1)));
  });

  it("denies USER to cash out org", async function() {
    const org = await Org.new(123, this.endaomentAdmin.address, { from: admin });
    
    await this.token.transfer(org.address, 1, { from: initHolder });
    
    await expectRevert.unspecified(org.cashOutOrg(other_user, this.token.address, this.endaomentAdmin.address, { from: user }));
  });

  it("gets claim count", async function() {
    const org = await Org.new(123, this.endaomentAdmin.address, { from: admin });
    const claimCount0 = await org.getClaimsCount({ from: user });
    assert.equal(claimCount0, 0);
    const claimRequestReceipt = await org.claimRequest("John", "Doe", true, "john@doe.com", user, { from: user });
    const claimCount1 = await org.getClaimsCount({ from: user });
    assert.equal(claimCount1, 1);
  });

  it("allows ADMIN to set org wallet", async function() {
    const org = await Org.new(123, this.endaomentAdmin.address, { from: admin });
    const setOrgWalletReceipt = await org.setOrgWallet(user, this.endaomentAdmin.address, {from: admin});
    assert.equal(await org.orgWallet(), user);
  });
  
  it("allows REVIEWER to set org wallet", async function() {
    const org = await Org.new(123, this.endaomentAdmin.address, { from: admin });
    const setOrgWalletReceipt = await org.setOrgWallet(user, this.endaomentAdmin.address, { from: reviewer });
    assert.equal(await org.orgWallet(), user);
  });
  
  it("denies USER to set org wallet", async function() {
    const org = await Org.new(123, this.endaomentAdmin.address, { from: admin });
    await expectRevert.unspecified(org.setOrgWallet(user, this.endaomentAdmin.address, { from: user }));
  });
});
