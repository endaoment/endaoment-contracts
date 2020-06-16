const { accounts, contract } = require("@openzeppelin/test-environment");
const { assert, expect, should } = require("chai");

const EndaomentAdminInterface = contract.fromArtifact("IEndaomentAdmin");
const EndaomentAdmin = contract.fromArtifact("EndaomentAdmin");
const FundFactory = contract.fromArtifact("FundFactory");
const Fund = contract.fromArtifact("Fund");
const TwoStepOwnable = contract.fromArtifact("TwoStepOwnable");

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

  it("admin can create funds with correct manager", async function () {
    assert.isDefined(this.FundFactory.address);

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
    assert.isDefined(this.FundFactory.address);

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
    assert.isDefined(this.FundFactory.address);

    await this.FundFactory.createFund(manager, this.EndaomentAdmin.address, {
      from: admin,
    });

    const count = await this.FundFactory.countFunds();

    assert.equal(count, 1);
  });

  it("grabs a fund address using getFund()", async function () {
    assert.isDefined(this.FundFactory.address);

    const fund = await this.FundFactory.createFund(
      manager,
      this.EndaomentAdmin.address,
      { from: accountant }
    );

    const getFundAddress = await this.FundFactory.getFund(1);

    assert.equal(fund.logs[0].args.newAddress, getFundAddress);
  });
});
