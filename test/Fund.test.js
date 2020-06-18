const { accounts, contract } = require("@openzeppelin/test-environment");
const {
  BN,
  constants,
  expectEvent,
  expectRevert,
} = require("@openzeppelin/test-helpers");
const { assert } = require("chai");

const EndaomentAdmin = contract.fromArtifact("EndaomentAdmin");
const FundFactory = contract.fromArtifact("FundFactory");
const OrgFactory = contract.fromArtifact("OrgFactory");
const Org = contract.fromArtifact("Org");
const Fund = contract.fromArtifact("Fund");
const ERC20Mock = contract.fromArtifact('ERC20Mock');


describe("Fund", function () {
  const name = 'TestToken';
  const symbol = 'TTKN';
  const initSupply = new BN(100);

  const [initHolder, admin, manager, newManager, accountant, pauser, reviewer] = accounts;

  beforeEach(async function () {
    this.endaomentAdmin = await EndaomentAdmin.new({ from: admin });
    this.token = await ERC20Mock.new(name, symbol, initHolder, initSupply);
    await this.endaomentAdmin.setRole(0, admin, { from: admin });
    await this.endaomentAdmin.setRole(1, pauser, { from: admin });
    await this.endaomentAdmin.setRole(2, accountant, { from: admin });
    await this.endaomentAdmin.setRole(3, reviewer, { from: admin });
    this.fund = await Fund.new(manager, this.endaomentAdmin.address, {
      from: admin,
    });
  });

  it("has defined fund contract address post-init", async function () {
    assert.isDefined(this.fund.address);
  });

  it("allows ADMIN to construct Fund contract", async function () {
    const fund = await Fund.new(manager, this.endaomentAdmin.address, { from: admin });
    assert.isDefined(fund.address);
  });

  it("allows FUND_FACTORY to construct Fund contract via ACCOUNTANT", async function () {
    const fundFactory = await FundFactory.new(this.endaomentAdmin.address, { from: admin });
    await this.endaomentAdmin.setRole(4, fundFactory.address, { from: admin });
    const fund = await fundFactory.createFund(
      manager,
      this.endaomentAdmin.address,
      {
        from: accountant,
      }
    );
    assert.isDefined(fund.logs[0].args.newAddress);
  });

  it("denies invalid admin contract to construct fund contract", async function () {
    await expectRevert.unspecified(
      Fund.new(constants.ZERO_ADDRESS, this.endaomentAdmin.address, {
        from: admin,
      })
    );
  });

  it("denies invalid non-ADMIN wallet to construct fund contract", async function () {
    await expectRevert.unspecified(
      Fund.new(manager, this.endaomentAdmin.address, { from: manager })
    );
  });

  it("creates funds with correct manager", async function () {
    const fundContract = await Fund.at(this.fund.address);
    const fundManager = await fundContract.manager();

    assert.equal(fundManager, manager);
    assert.isDefined(this.fund.address);
  });

  it("allows ADMIN to change manager", async function () {
    const fundContract = await Fund.at(this.fund.address);
    const fundManager = await fundContract.manager();

    assert.equal(fundManager, manager);

    await fundContract.changeManager(newManager, this.endaomentAdmin.address, { from: admin });
    const newFundManager = await fundContract.manager();
    await assert.equal(newFundManager, newManager);
  });

  it("allows REVIEWER to change manager", async function () {
    const fundContract = await Fund.at(this.fund.address);
    const fundManager = await fundContract.manager();

    assert.equal(fundManager, manager);

    await fundContract.changeManager(newManager, this.endaomentAdmin.address, { from: reviewer });
    const new_manager = await fundContract.manager();

    await assert.equal(new_manager, newManager);
  });

  it("denies REVIEWER to change manager when REVIEWER is paused", async function () {
    const fundContract = await Fund.at(this.fund.address);
    const fundManager = await fundContract.manager();

    assert.equal(fundManager, manager);

    await fundContract.changeManager(newManager, this.endaomentAdmin.address, { from: reviewer });
    const new_manager = await fundContract.manager();

    await assert.equal(new_manager, newManager);

    await this.endaomentAdmin.pause(3, { from: pauser });

    await expectRevert.unspecified(
      fundContract.changeManager(newManager, this.endaomentAdmin.address, { from: reviewer })
    );
  });

  it("denies USER from changing manager", async function () {
    const fundContract = await Fund.at(this.fund.address);
    const fundManager = await fundContract.manager();

    assert.equal(fundManager, manager);

    await expectRevert.unspecified(
      fundContract.changeManager(newManager, this.endaomentAdmin.address, { from: accountant })
    );
  });

  it("checks the recipeint of a grant with the OrgFactory", async function () {
    //Open a new OrgFacotry using EndaomentAdmin
    const orgFactory = await OrgFactory.new(this.endaomentAdmin.address, { from: admin });

    //Set the new OrgFactory as the ORG_FACTORY role
    await this.endaomentAdmin.setRole(5, orgFactory.address, { from: admin });

    //Deploy an org contract using the OrgFactory
    const org = await orgFactory.createOrg(
      123456789,
      this.endaomentAdmin.address,
      { from: accountant }
    );

    //Check that the new org's address passes the checkRecipient() function on the Fund contract
    const orgChecked = await this.fund.checkRecipient(
      org.logs[0].args.newAddress,
      orgFactory.address,
      { from: admin }
    );

    assert.isTrue(orgChecked);

    //Check that a zero address doesn't pass the checkRecipient() function
    const failingOrg = await this.fund.checkRecipient(
      constants.ZERO_ADDRESS,
      orgFactory.address,
      { from: admin }
    );

    assert.isFalse(failingOrg);
  });


  it("allows only MANAGER to create a grant", async function () {
    //Open a new OrgFacotry using EndaomentAdmin
    const orgFactory = await OrgFactory.new(this.endaomentAdmin.address, {
      from: admin,
    });

    //Set the new OrgFactory as the ORG_FACTORY role
    await this.endaomentAdmin.setRole(5, orgFactory.address, {
      from: admin,
    });

    //Deploy an org contract using the OrgFactory
    const org = await orgFactory.createOrg(
      123456789,
      this.endaomentAdmin.address,
      { from: accountant }
    );

    //Create new grant on the Fund contract
    await this.fund.createGrant(
      "test grant",
      1,
      org.logs[0].args.newAddress,
      orgFactory.address,
      { from: manager }
    );

    //Get Grant struct at position 0, confirm values
    const grant = await this.fund.grants(0);

    assert.deepEqual(
      {
        description: grant.description,
        value: grant.value.words[0],
        recipient: grant.recipient,
        complete: grant.complete,
      },
      {
        description: "test grant",
        value: 1,
        recipient: org.logs[0].args.newAddress,
        complete: false,
      }
    );

    await expectRevert.unspecified(
      this.fund.createGrant(
        "test grant",
        1,
        org.logs[0].args.newAddress,
        orgFactory.address,
        { from: admin }
      )
    );
  });


  it("returns correct count of total grants", async function () {
    const before_count = await this.fund.getGrantsCount();
    assert.equal(before_count, 0);

    const orgFactory = await OrgFactory.new(this.endaomentAdmin.address, { from: admin });
    await this.endaomentAdmin.setRole(5, orgFactory.address, { from: admin });

    const org = await orgFactory.createOrg(
      123456789,
      this.endaomentAdmin.address,
      { from: accountant }
    );

    await this.fund.createGrant(
      "test grant",
      1,
      org.logs[0].args.newAddress,
      orgFactory.address,
      { from: manager }
    );

    const after_count = await this.fund.getGrantsCount();
    assert.equal(after_count, 1);
  });

  it("allows ADMIN to finalize grant", async function () {
    const fund = await Fund.new(manager, this.endaomentAdmin.address, { from: admin });
    const orgFactory = await OrgFactory.new(this.endaomentAdmin.address, { from: admin });
    await this.endaomentAdmin.setRole(5, orgFactory.address, { from: admin });

    const org = await orgFactory.createOrg(
      123456789,
      this.endaomentAdmin.address,
      { from: accountant }
    );

    await this.token.transfer(fund.address, 100, { from: initHolder });

    await fund.createGrant(
      "test grant",
      100,
      org.logs[0].args.newAddress,
      orgFactory.address,
      { from: manager }
    );

    await fund.finalizeGrant(0, this.token.address, this.endaomentAdmin.address, { from: admin });

    const orgBalance = await this.token.balanceOf(org.logs[0].args.newAddress);
    const adminBalance = await this.token.balanceOf(admin);
    assert(orgBalance.eq(new BN(99)));
    assert(adminBalance.eq(new BN(1)));
  });

  it("allows ACCOUNTANT to finalize grant", async function () {
    const fund = await Fund.new(manager, this.endaomentAdmin.address, { from: admin });
    const orgFactory = await OrgFactory.new(this.endaomentAdmin.address, { from: admin });
    await this.endaomentAdmin.setRole(5, orgFactory.address, { from: admin });

    const org = await orgFactory.createOrg(
      123456789,
      this.endaomentAdmin.address,
      { from: accountant }
    );

    await this.token.transfer(fund.address, 100, { from: initHolder });

    await fund.createGrant(
      "test grant",
      100,
      org.logs[0].args.newAddress,
      orgFactory.address,
      { from: manager }
    );

    await fund.finalizeGrant(0, this.token.address, this.endaomentAdmin.address, { from: accountant });

    const orgBalance = await this.token.balanceOf(org.logs[0].args.newAddress);
    const adminBalance = await this.token.balanceOf(admin);
    assert(orgBalance.eq(new BN(99)));
    assert(adminBalance.eq(new BN(1)));
  });

  it("denies USER to finalize grant", async function () {
    const fund = await Fund.new(manager, this.endaomentAdmin.address, { from: admin });
    const orgFactory = await OrgFactory.new(this.endaomentAdmin.address, { from: admin });
    await this.endaomentAdmin.setRole(5, orgFactory.address, { from: admin });

    const org = await orgFactory.createOrg(
      123456789,
      this.endaomentAdmin.address,
      { from: accountant }
    );

    await this.token.transfer(fund.address, 100, { from: initHolder });

    await fund.createGrant(
      "test grant",
      100,
      org.logs[0].args.newAddress,
      orgFactory.address,
      { from: manager }
    );

    await expectRevert.unspecified(fund.finalizeGrant(0, this.token.address, this.endaomentAdmin.address, { from: manager }));
  });

  it("gets fund summary", async function () {
    const fund = await Fund.new(manager, this.endaomentAdmin.address, { from: admin });
    await this.token.transfer(fund.address, 1, { from: initHolder });
    const fundSummary = await fund.getSummary(this.token.address);
    assert(fundSummary[0].eq(new BN(1)));
    assert(fundSummary[1].eq(new BN(0)));
    assert(fundSummary[2].eq(new BN(0)));
    assert.equal(fundSummary[3], await fund.manager());
  });
});
