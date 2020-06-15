const FundFactory = artifacts.require("FundFactory.json");

describe("FundFactory contract", function () {
  let accounts;

  before(async function () {
    accounts = await web3.eth.getAccounts();
  });

  it("deploys funds", async function () {
    const fundFactory = await FundFactory.new();
    assert.isNotNull(fundFactory.address);

    const fund = await fundFactory.createFund(
      accounts[0]
      //NEED DEPLOYED ADMINCONTRACTADDRESS
    );

    assert.isNotNull(fund.address);
  });
  it("returns count of total funds", async function () {
    const fundFactory = await FundFactory.new();
    assert.isNotNull(fundFactory.address);

    const count = await fundFactory.countFunds();

    assert.isNotNull(count);
  });
  it("grabs a fund address using getFund()", async function () {
    const fundFactory = await FundFactory.new();
    assert.isNotNull(fundFactory.address);

    const fund = await fundFactory.createFund(
      accounts[0]
      //NEED DEPLOYED ADMINCONTRACTADDRESS
    );

    const getFundAddress = await fundFactory.getFund(2);

    assert.equal(fund.address, getFundAddress);
  });
});
