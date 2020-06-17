const { accounts, contract } = require("@openzeppelin/test-environment");
const { BN, constants, expectEvent, expectRevert } = require('@openzeppelin/test-helpers');
const { assert } = require("chai");

const EndaomentAdmin = contract.fromArtifact("EndaomentAdmin");
const FundFactory = contract.fromArtifact("FundFactory");
const Fund = contract.fromArtifact("Fund");

describe("FundFactory", function () {
  const [admin, manager, accountant, pauser] = accounts;

  before(async function () {
    this.EndaomentAdmin = await EndaomentAdmin.new({ from: admin });
  });

  beforeEach(async function () {
    await this.EndaomentAdmin.setRole(0, admin, { from: admin });
    await this.EndaomentAdmin.setRole(1, pauser, { from: admin });
    await this.EndaomentAdmin.setRole(2, accountant, { from: admin });
    this.FundFactory = await FundFactory.new(this.EndaomentAdmin.address, {
      from: admin,
    });
  });

  it("has defined contract address post-init", async function () {
      assert.isDefined(this.FundFactory.address);
  });
  
  it("allows admin contract to construct", async function () {
      const fund_factory = await FundFactory.new(this.EndaomentAdmin.address, { from: admin });
      assert.isDefined(fund_factory.address);
  });
  
  it("denies invalid admin contract to construct", async function () {
      await expectRevert.unspecified(FundFactory.new(constants.ZERO_ADDRESS, { from: admin }));
  });


  it("admin can create funds with correct manager", async function () {
    const fund = await this.FundFactory.createFund(
      manager,
      this.EndaomentAdmin.address,
      { from: admin }
    );
    const fund_contract = await Fund.at(fund.logs[0].args.newAddress);
    const fund_manager = await fund_contract.manager();

    assert.equal(fund_manager, manager);
    assert.isDefined(fund.logs[0].args.newAddress);
  });

  it("accountant can create funds with correct manager, only if not paused", async function () {
    const fund = await this.FundFactory.createFund(
      manager,
      this.EndaomentAdmin.address,
      { from: accountant }
    );
    const fund_contract = await Fund.at(fund.logs[0].args.newAddress);
    const fund_manager = await fund_contract.manager();

    assert.equal(fund_manager, manager);
    assert.isDefined(fund.logs[0].args.newAddress);

    // await this.EndaomentAdmin.pause(2, { from: pauser });

    // assert.Throw(async () => {
    //   await this.FundFactory.createFund(manager, this.EndaomentAdmin.address, {
    //     from: accountant,
    //   });
    // });
  });

  it("returns count of total funds", async function () {
    const before_count = await this.FundFactory.countFunds();
    assert.equal(before_count, 0);

    await this.FundFactory.createFund(manager, this.EndaomentAdmin.address, {
      from: admin,
    });

    const after_count = await this.FundFactory.countFunds();
    assert.equal(after_count, 1);
  });

  it("gets fund address via index", async function () {
    const fund = await this.FundFactory.createFund(
      manager,
      this.EndaomentAdmin.address,
      { from: accountant }
    );

    const getFundAddress = await this.FundFactory.getFund(1);

    assert.equal(fund.logs[0].args.newAddress, getFundAddress);
  });
});
