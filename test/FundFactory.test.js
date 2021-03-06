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

describe("FundFactory", function () {
  const [admin, manager, accountant, pauser] = accounts;

  beforeEach(async function () {
    this.endaomentAdmin = await EndaomentAdmin.new({ from: admin });
    await this.endaomentAdmin.setRole(6, admin, { from: admin });
    await this.endaomentAdmin.setRole(1, pauser, { from: admin });
    await this.endaomentAdmin.setRole(2, accountant, { from: admin });
    this.fundFactory = await FundFactory.new(this.endaomentAdmin.address, { from: admin });
    await this.endaomentAdmin.setRole(4, this.fundFactory.address, { from: admin });
  });

  it('sets the endaomentAdmin address when deployed', async function() {
    assert.equal(await this.fundFactory.endaomentAdmin(), this.endaomentAdmin.address)
  });

  it('does not allow deployments when admin address is the zero address', async function() {
    await expectRevert(
      FundFactory.new(constants.ZERO_ADDRESS, { from: admin }),
      "FundFactory: Admin cannot be the zero address"
    );
  });

  it("has defined contract address post-init", async function () {
    assert.isDefined(this.fundFactory.address);
  });

  it("allows ADMIN to construct factory contract", async function () {
    const fund_factory = await FundFactory.new(this.endaomentAdmin.address, { from: admin });
    assert.isDefined(fund_factory.address);
  });

  it("ADMIN can create funds with correct manager", async function () {
    const fund = await this.fundFactory.createFund(manager, {from: admin});
    const fund_contract = await Fund.at(fund.logs[0].args.newAddress);
    const fund_manager = await fund_contract.manager();

    assert.equal(fund_manager, manager);
    assert.isDefined(fund.logs[0].args.newAddress);
  });

  it("ACCOUNTANT can create funds with correct manager, only if not paused", async function () {
    const fund = await this.fundFactory.createFund(manager, {from: accountant});
    const fund_contract = await Fund.at(fund.logs[0].args.newAddress);
    const fund_manager = await fund_contract.manager();

    assert.equal(fund_manager, manager);
    assert.isDefined(fund.logs[0].args.newAddress);

    await this.endaomentAdmin.pause(2, { from: pauser });

    await expectRevert.unspecified(
      this.fundFactory.createFund(manager, { from: accountant })
    );
  });

  it("does not allow the manager of a new fund to be the zero address", async function () {
    await expectRevert(
      this.fundFactory.createFund(constants.ZERO_ADDRESS, { from: admin } ),
      "FundFactory: Manager cannot be the zero address"
    );
  });
});
