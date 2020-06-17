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
const Fund = contract.fromArtifact("Fund");

describe("FundFactory.sol", function() {
  const [admin, manager, accountant, pauser] = accounts;

  beforeEach(async function() {
    this.endaomentAdmin = await EndaomentAdmin.new({ from: admin });
    await this.endaomentAdmin.setRole(0, admin, { from: admin });
    await this.endaomentAdmin.setRole(1, pauser, { from: admin });
    await this.endaomentAdmin.setRole(2, accountant, { from: admin });
    this.fundFactory = await FundFactory.new(this.endaomentAdmin.address, {
      from: admin,
    });
    await this.endaomentAdmin.setRole(4, this.fundFactory.address, {
      from: admin,
    });
  });

  it("has defined contract address post-init", async function() {
    assert.isDefined(this.fundFactory.address);
  });

  it("allows ADMIN to construct factory contract", async function() {
    const fund_factory = await FundFactory.new(this.endaomentAdmin.address, {
      from: admin,
    });
    assert.isDefined(fund_factory.address);
  });

  it("denies invalid admin contract to construct factory", async function() {
    await expectRevert.unspecified(
      FundFactory.new(constants.ZERO_ADDRESS, { from: admin })
    );
  });

  it("denies invalid non-ADMIN wallet to construct factory", async function() {
    await expectRevert.unspecified(
      FundFactory.new(this.endaomentAdmin.address, { from: manager })
    );
  });

  it("ADMIN can create funds with correct manager", async function() {
    const fund = await this.fundFactory.createFund(
      manager,
      this.endaomentAdmin.address,
      { from: admin }
    );
    const fund_contract = await Fund.at(fund.logs[0].args.newAddress);
    const fund_manager = await fund_contract.manager();

    assert.equal(fund_manager, manager);
    assert.isDefined(fund.logs[0].args.newAddress);
  });

  it("ACCOUNTANT can create funds with correct manager, only if not paused", async function() {
    const fund = await this.fundFactory.createFund(
      manager,
      this.endaomentAdmin.address,
      { from: accountant }
    );
    const fund_contract = await Fund.at(fund.logs[0].args.newAddress);
    const fund_manager = await fund_contract.manager();

    assert.equal(fund_manager, manager);
    assert.isDefined(fund.logs[0].args.newAddress);

    await this.endaomentAdmin.pause(2, { from: pauser });

    await expectRevert.unspecified(
      this.fundFactory.createFund(manager, this.endaomentAdmin.address, {
        from: accountant,
      })
    );
  });

  it("returns count of total funds", async function() {
    const before_count = await this.fundFactory.countFunds();
    assert.equal(before_count, 0);

    await this.fundFactory.createFund(manager, this.endaomentAdmin.address, {
      from: admin,
    });

    const after_count = await this.fundFactory.countFunds();
    assert.equal(after_count, 1);
  });

  it("gets fund address via index", async function() {
    const fund = await this.fundFactory.createFund(
      manager,
      this.endaomentAdmin.address,
      { from: accountant }
    );

    const getFundAddress = await this.fundFactory.getFund(1);

    assert.equal(fund.logs[0].args.newAddress, getFundAddress);
  });
});
