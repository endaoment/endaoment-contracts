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

const EndaomentAdmin = contract.fromArtifact("EndaomentAdmin");
const Org = contract.fromArtifact("Org");
const OrgFactory = contract.fromArtifact("OrgFactory");
const ERC20Mock = contract.fromArtifact('ERC20Mock');

describe("Org", function() {
  const name = 'TestToken';
  const symbol = 'TTKN';
  const initSupply = new BN(100);
  const ein = 999999999;

  const [initHolder, admin, accountant, pauser, reviewer, user, other_user] = accounts;

  beforeEach(async function() {
    this.endaomentAdmin = await EndaomentAdmin.new({ from: admin });
    this.token = await ERC20Mock.new(name, symbol, initHolder, initSupply);
    await this.endaomentAdmin.setRole(6, admin, { from: admin });
    await this.endaomentAdmin.setRole(1, pauser, { from: admin });
    await this.endaomentAdmin.setRole(2, accountant, { from: admin });
    await this.endaomentAdmin.setRole(3, reviewer, { from: admin });
    
    this.orgFactory = await OrgFactory.new(this.endaomentAdmin.address, { from: admin});
    await this.endaomentAdmin.setRole(5, this.orgFactory.address, { from: admin });
    const receipt = await this.orgFactory.createOrg(ein, {from: admin});
    this.org = await Org.at(receipt.logs[0].args.newAddress)
  });

  it("allows ADMIN to construct", async function() {
    const org = await Org.new(ein, this.orgFactory.address, { from: admin });
    assert.isDefined(org.address);
  });

  it("does not allow invalid EINs", async function () {
    const invalidEins = [0, 1, 9999999, 1000000000];
    invalidEins.forEach(async (ein) => {
      await expectRevert(
        this.orgFactory.createOrg(ein, {from: admin}),
        "Org: Must provide a valid EIN"
      );
    });
  });

  it("allows valid EINs", async function () {
    const validEins = [10000000, 999999999];
    validEins.forEach(async (ein) => {
      const orgReceipt = await this.orgFactory.createOrg(ein, {from: admin});
      assert.isDefined(orgReceipt.logs[0].args.newAddress);
    });
  });
  
  it("registers valid claim requests", async function() {
    const claimRequestReceipt = await this.org.claimRequest("John", "Doe", "john@doe.com", user, { from: user });
    const claimCount = await this.org.getClaimsCount({ from: user });
    assert.equal(claimCount, 1);
    const claim = await this.org.claims(0, {from: user});
    expectEvent(claimRequestReceipt, "ClaimCreated", 
        { claim: [
            claim.firstName,
            claim.lastName,
            claim.eMail,
            claim.desiredWallet,
            claim.filesSubmitted,
        ]}
    );
    assert.equal(claim.firstName, "John");
    assert.equal(claim.lastName, "Doe");
    assert.equal(claim.eMail, "john@doe.com");
    assert.equal(claim.desiredWallet, user);
    assert.equal(claim.filesSubmitted, true);
  });

  it("blocks claim requests that are missing parameters", async function() {
    await expectRevert(
      this.org.claimRequest("", "Doe", "john@doe.com", user, {from: user}),
      "Org: Must provide the first name of the administrator"
    );
    await expectRevert(
      this.org.claimRequest("John", "", "john@doe.com", user, {from: user}),
      "Org: Must provide the last name of the administrator"
    );
    await expectRevert(
      this.org.claimRequest("John", "Doe", "", user, {from: user}),
      "Org: Must provide the email address of the administrator"
    );
  });
  
  it("allows ADMIN to approve claims", async function() {
    const claimRequestReceipt = await this.org.claimRequest("John", "Doe", "john@doe.com", user, { from: user });
    
    const claim = await this.org.claims(0, {from: user});
    const claimEventData = { claim: [
        claim.firstName,
        claim.lastName,
        claim.eMail,
        claim.desiredWallet,
        claim.filesSubmitted
    ]};
    expectEvent(claimRequestReceipt, "ClaimCreated", claimEventData);
    const approveClaimReceipt = await this.org.approveClaim(0, { from: admin });
    expectEvent(approveClaimReceipt, "ClaimApproved", claimEventData);
    assert.equal(user, await this.org.orgWallet({ from: user }));

  });
  
  it("allows REVIEWER to approve claims", async function() {
    const claimRequestReceipt = await this.org.claimRequest("John", "Doe", "john@doe.com", user, { from: user });
    const claim = await this.org.claims(0, {from: user});
    const claimEventData = { claim: [
        claim.firstName,
        claim.lastName,
        claim.eMail,
        claim.desiredWallet,
        claim.filesSubmitted
    ]};
    expectEvent(claimRequestReceipt, "ClaimCreated", claimEventData);
    const approveClaimReceipt = await this.org.approveClaim(0, { from: reviewer });
    expectEvent(approveClaimReceipt, "ClaimApproved", claimEventData);
    assert.equal(user, await this.org.orgWallet({ from: user }));
  });
  
  it("denies USER to approve claims", async function() {
    const claimRequestReceipt = await this.org.claimRequest("John", "Doe", "john@doe.com", user, { from: user });
    const claim = await this.org.claims(0, {from: user});
    await expectRevert.unspecified(this.org.approveClaim(0, { from: user }));
  });

  it('blocks claim approval if an invalid index is provided', async function() {
    const claimRequestReceipt = await this.org.claimRequest("John", "Doe", "john@doe.com", user, { from: user });
    const claim = await this.org.claims(0, {from: user});
    await expectRevert(
      this.org.approveClaim(1, {from: admin}),
      "Org: Index out of range"
    );
  });

  it("checks token balance", async function() {
    const tokenBalance0 = await this.org.getTokenBalance(this.token.address, { from: this.org.address });
    assert(tokenBalance0.eq(new BN(0)));
    await this.token.transfer(this.org.address, 1, { from: initHolder });
    const tokenBalance1 = await this.org.getTokenBalance(this.token.address, { from: this.org.address });
    assert(tokenBalance1.eq(new BN(1)));
  });

  it("allows ADMIN to cash out org", async function() {
    await this.token.transfer(this.org.address, 1, { from: initHolder });
    const orgTokenBalance0 = await this.org.getTokenBalance(this.token.address, { from: other_user });
    assert(orgTokenBalance0.eq(new BN(1)));

    const claimRequestReceipt = await this.org.claimRequest("John", "Doe", "john@doe.com", other_user, { from: user });
    const approveClaimReceipt = await this.org.approveClaim(0, { from: admin });

    const cashOutOrgReceipt = await this.org.cashOutOrg(this.token.address, { from: admin });
    expectEvent(cashOutOrgReceipt, "CashOutComplete", { cashOutAmount: new BN(1) });
    const orgTokenBalance1 = await this.org.getTokenBalance(this.token.address, { from: other_user });
    
    assert(orgTokenBalance1.eq(new BN(0)));
    assert((await this.token.balanceOf(other_user)).eq(new BN(1)));
  });
  
  it("allows ACCOUNTANT to cash out org", async function() {
    await this.token.transfer(this.org.address, 1, { from: initHolder });
    const orgTokenBalance0 = await this.org.getTokenBalance(this.token.address, { from: other_user });
    assert(orgTokenBalance0.eq(new BN(1)));

    const claimRequestReceipt = await this.org.claimRequest("John", "Doe", "john@doe.com", other_user, { from: user });
    const approveClaimReceipt = await this.org.approveClaim(0, { from: admin });
    
    const cashOutOrgReceipt = await this.org.cashOutOrg(this.token.address, { from: accountant });
    expectEvent(cashOutOrgReceipt, "CashOutComplete", { cashOutAmount: new BN(1) });
    const orgTokenBalance1 = await this.org.getTokenBalance(this.token.address, { from: other_user });
    
    assert(orgTokenBalance1.eq(new BN(0)));
    assert((await this.token.balanceOf(other_user)).eq(new BN(1)));
  });

  it("denies USER to cash out org", async function() {
    await this.token.transfer(this.org.address, 1, { from: initHolder });
    await expectRevert.unspecified(this.org.cashOutOrg(this.token.address, { from: user }));
  });
  
  it("prevents cashing out org if token address is the zero address", async function() {
    await this.token.transfer(this.org.address, 1, { from: initHolder });
    const orgTokenBalance0 = await this.org.getTokenBalance(this.token.address, { from: other_user });

    const claimRequestReceipt = await this.org.claimRequest("John", "Doe", "john@doe.com", other_user, { from: user });
    const approveClaimReceipt = await this.org.approveClaim(0, { from: admin });

    await expectRevert(
      this.org.cashOutOrg(constants.ZERO_ADDRESS, { from: admin }),
      "Org: Token address cannot be the zero address"
    );
  });
  
  it("gets claim count", async function() {
    const claimCount0 = await this.org.getClaimsCount({ from: user });
    assert.equal(claimCount0, 0);
    const claimRequestReceipt = await this.org.claimRequest("John", "Doe", "john@doe.com", user, { from: user });
    const claimCount1 = await this.org.getClaimsCount({ from: user });
    assert.equal(claimCount1, 1);
  });
});
