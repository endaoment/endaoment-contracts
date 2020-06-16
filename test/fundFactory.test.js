const { accounts, contract } = require("@openzeppelin/test-environment");
const { assert, expect, should } = require("chai");

const EndaomentAdminInterface = contract.fromArtifact("IEndaomentAdmin");
const EndaomentAdmin = contract.fromArtifact("EndaomentAdmin");
const FundFactory = contract.fromArtifact("FundFactory");
const Fund = contract.fromArtifact("Fund");
const TwoStepOwnable = contract.fromArtifact("TwoStepOwnable");

describe("FundFactory contract", function () {
  const [admin, manager, accountant, pauser] = accounts;

  before(async function () {
    this.admin_contract = await EndaomentAdmin.new({ from: admin });
  });

  beforeEach(async function () {
    await this.admin_contract.setRole(0, admin, { from: admin });
    await this.admin_contract.setRole(1, pauser, { from: admin });
    await this.admin_contract.setRole(2, accountant, { from: admin });
    this.contract = await FundFactory.new(this.admin_contract.address, {
      from: admin,
    });
  });

  it("admin can create funds with correct manager", async function () {
    assert.isDefined(this.contract.address);

    const fund = await this.contract.createFund(
      manager,
      this.admin_contract.address,
      { from: admin }
    );
    const fund_contract = await Fund.at(fund.logs[0].args.newAddress);
    const fund_manager = await fund_contract.manager();

    assert.equal(fund_manager, manager);
    assert.isDefined(fund.logs[0].args.newAddress);
  });

  it("accountant can create funds with correct manager, only if not paused", async function () {
    assert.isDefined(this.contract.address);

    const fund = await this.contract.createFund(
      manager,
      this.admin_contract.address,
      { from: accountant }
    );
    const fund_contract = await Fund.at(fund.logs[0].args.newAddress);
    const fund_manager = await fund_contract.manager();

    assert.equal(fund_manager, manager);
    assert.isDefined(fund.logs[0].args.newAddress);

    await this.admin_contract.pause(2, { from: pauser });
    const secondFund = await this.contract.createFund(
      manager,
      this.admin_contract.address,
      { from: accountant }
    );
    assert.Throw(secondFund);
  });



  

//   it("returns count of total funds", async function () {
//     const fundFactory = await FundFactory.new();
//     assert.isDefined(fundFactory.address);

//     const count = await fundFactory.countFunds();
//     console.log(count);
//     assert.isDefined(count);
//   });
//   it("grabs a fund address using getFund()", async function () {
//     const fundFactory = await FundFactory.new();
//     assert.isDefined(fundFactory.address);

//     const fund = await fundFactory.createFund(
//       accounts[0]
//       //NEED DEPLOYED ADMINCONTRACTADDRESS
//     );

//     const getFundAddress = await fundFactory.getFund(2);

//     assert.equal(fund.address, getFundAddress);
//   });
// });
