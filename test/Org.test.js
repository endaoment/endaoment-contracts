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
const { v4: uuidv4 } = require('uuid');

const EndaomentAdmin = contract.fromArtifact("EndaomentAdmin");
const Org = contract.fromArtifact("Org");
const OrgFactory = contract.fromArtifact("OrgFactory");
const ERC20Mock = contract.fromArtifact('ERC20Mock');

const EmptyClaim = {
  firstName: "",
  lastName: "",
  eMail: "",
  desiredWallet: constants.ZERO_ADDRESS,
};

function assertEqualClaims(claim1, claim2, message = "Invalid claim") {
  assert.equal(claim1.firstName, claim2.firstName, message);
  assert.equal(claim1.lastName, claim2.lastName, message);
  assert.equal(claim1.eMail, claim2.eMail, message);
  assert.equal(claim1.desiredWallet, claim2.desiredWallet, message);
}

describe("Org", function() {
  const name = 'TestToken';
  const symbol = 'TTKN';
  const initSupply = new BN(100);
  const ein = 999999999;
  const claimId = uuidv4();

  const [initHolder, admin, accountant, pauser, reviewer, user, other_user] = accounts;

  const ExpectedClaim = {
    firstName: "John",
    lastName: "Doe",
    eMail: "john@doe.com",
    desiredWallet: user,
  };

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
    const claimRequestReceipt = await this.org.claimRequest(claimId, "John", "Doe", "john@doe.com", user, { from: user });
    expectEvent(claimRequestReceipt, "ClaimCreated",
          {
            claimId,
            claim: [
              "John",
              "Doe",
              "john@doe.com",
              user,
            ],
          });

    const claim = await this.org.pendingClaims(claimId);

    assert.equal(claim.firstName, "John");
    assert.equal(claim.lastName, "Doe");
    assert.equal(claim.eMail, "john@doe.com");
    assert.equal(claim.desiredWallet, user);
  });

  it("blocks claim requests that are missing parameters", async function() {
    await expectRevert(
      this.org.claimRequest(claimId, "", "Doe", "john@doe.com", user, {from: user}),
      "Org: Must provide the first name of the administrator"
    );
    await expectRevert(
      this.org.claimRequest(claimId, "John", "", "john@doe.com", user, {from: user}),
      "Org: Must provide the last name of the administrator"
    );
    await expectRevert(
      this.org.claimRequest(claimId, "John", "Doe", "", user, {from: user}),
      "Org: Must provide the email address of the administrator"
    );
  });
  
  it("allows ADMIN to approve claims", async function() {
    const claimRequestReceipt = await this.org.claimRequest(claimId, "John", "Doe", "john@doe.com", user, { from: user });
    
    const claim = await this.org.pendingClaims(claimId, {from: user});
    const claimEventData = { claimId, claim: [
        claim.firstName,
        claim.lastName,
        claim.eMail,
        claim.desiredWallet,
    ]};
    expectEvent(claimRequestReceipt, "ClaimCreated", claimEventData);
    const approveClaimReceipt = await this.org.approveClaim(claimId, { from: admin });
    expectEvent(approveClaimReceipt, "ClaimApproved", claimEventData);
    assert.equal(user, await this.org.orgWallet({ from: user }));
  });

  it("rejects a duplicate claimId", async function () {
    const claimRequest = await this.org.claimRequest(claimId, "John", "Doe", "john@doe.com", user, { from: user });
    assert.isTrue(claimRequest.receipt.status, "Failed to deploy claim");

    const secondClaimRequestTx = this.org.claimRequest(claimId, "John", "Doe", "john@doe.com", user, { from: user });

    await expectRevert(
      secondClaimRequestTx,
      "Org: Pending Claim with Id already exists",
    );
  });

  it("allows ADMIN to approve claims", async function() {
    const claimRequestReceipt = await this.org.claimRequest(claimId, "John", "Doe", "john@doe.com", user, { from: user });

    const claimEventData = { claimId,
                              claim: [
                                "John",
                                "Doe",
                                "john@doe.com",
                                user,
                              ],
                          };
    expectEvent(claimRequestReceipt, "ClaimCreated", claimEventData);

    const approveClaimReceipt = await this.org.approveClaim(claimId, { from: admin });
    expectEvent(approveClaimReceipt, "ClaimApproved", claimEventData);
    assert.equal(user, await this.org.orgWallet({ from: user }));
  });

  it("allows REVIEWER to approve claims", async function() {
    const claimRequestReceipt = await this.org.claimRequest(claimId, "John", "Doe", "john@doe.com", user, { from: user });

    const claimEventData = { claimId,
      claim: [
        "John",
        "Doe",
        "john@doe.com",
        user,
      ],
    };
    expectEvent(claimRequestReceipt, "ClaimCreated", claimEventData);

    const approveClaimReceipt = await this.org.approveClaim(claimId, { from: reviewer });
    expectEvent(approveClaimReceipt, "ClaimApproved", claimEventData);

    const activeClaim = await this.org.activeClaim();
    assertEqualClaims(activeClaim, ExpectedClaim, "Active Claim failed to update");

    assert.equal(user, await this.org.orgWallet({ from: user }));

    const pendingClaim = await this.org.pendingClaims(claimId);
    assertEqualClaims(pendingClaim, EmptyClaim, "Pending claim not deleted");
  });

  it("denies USER to approve claims", async function() {
    await expectRevert(
        this.org.approveClaim(claimId, { from: user }),
        "Administratable: only REVIEWER can access -- Reason given: Administratable: only REVIEWER can access.",
      );
  });

  it('blocks claim approval if an invaid claimId is provided', async function() {
    const badUuid = uuidv4();
    await expectRevert(
      this.org.approveClaim(badUuid, {from: admin}),
      "Org: claim does not exist"
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

    const claimRequestReceipt = await this.org.claimRequest(claimId, "John", "Doe", "john@doe.com", other_user, { from: user });
    const approveClaimReceipt = await this.org.approveClaim(claimId, { from: admin });

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

    const claimRequestReceipt = await this.org.claimRequest(claimId, "John", "Doe", "john@doe.com", other_user, { from: user });
    const approveClaimReceipt = await this.org.approveClaim(claimId, { from: admin });

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

    const claimRequestReceipt = await this.org.claimRequest(claimId, "John", "Doe", "john@doe.com", other_user, { from: user });
    const approveClaimReceipt = await this.org.approveClaim(claimId, { from: admin });

    await expectRevert(
      this.org.cashOutOrg(constants.ZERO_ADDRESS, { from: admin }),
      "Org: Token address cannot be the zero address"
    );
  });

});
