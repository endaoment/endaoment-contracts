const { accounts, contract } = require("@openzeppelin/test-environment");
const {
  BN,
  constants,
  expectEvent,
  expectRevert,
} = require("@openzeppelin/test-helpers");
const { assert } = require("chai");
const { v4: uuidv4 } = require('uuid');

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
  const grantId = uuidv4();
  const ein = 999999999;

  const [initHolder, admin, manager, newManager, accountant, pauser, reviewer] = accounts;

  beforeEach(async function () {
    this.endaomentAdmin = await EndaomentAdmin.new({ from: admin });
    this.token = await ERC20Mock.new(name, symbol, initHolder, initSupply);
    await this.endaomentAdmin.setRole(6, admin, { from: admin });
    await this.endaomentAdmin.setRole(1, pauser, { from: admin });
    await this.endaomentAdmin.setRole(2, accountant, { from: admin });
    await this.endaomentAdmin.setRole(3, reviewer, { from: admin });
    
    this.fundFactory = await FundFactory.new(this.endaomentAdmin.address, { from: admin });
    await this.endaomentAdmin.setRole(4, this.fundFactory.address, { from: admin });
    const receipt = await this.fundFactory.createFund(manager, {
      from: admin,
    });
    this.fund = await Fund.at(receipt.logs[0].args.newAddress)
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
    const fund = await fundFactory.createFund(manager, {
      from: accountant,
    });
    assert.isDefined(fund.logs[0].args.newAddress);
  });

  it("denies invalid admin contract to construct fund contract", async function () {
    await expectRevert.unspecified(
      Fund.new(constants.ZERO_ADDRESS, this.endaomentAdmin.address, {
        from: admin,
      })
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

    const changeManagerReceipt = await fundContract.changeManager(newManager, { from: admin });
    expectEvent(changeManagerReceipt, "ManagerChanged", { newManager: newManager });
    const newFundManager = await fundContract.manager();
    await assert.equal(newFundManager, newManager);
  });

  it("allows REVIEWER to change manager", async function () {
    const fundContract = await Fund.at(this.fund.address);
    const fundManager = await fundContract.manager();

    assert.equal(fundManager, manager);

    const changeManagerReceipt = await fundContract.changeManager(newManager, { from: reviewer });
    expectEvent(changeManagerReceipt, "ManagerChanged", { newManager: newManager });
    const newFundManager = await fundContract.manager();

    await assert.equal(newFundManager, newManager);
  });

  it("denies REVIEWER to change manager when REVIEWER is paused", async function () {
    const fundContract = await Fund.at(this.fund.address);
    const fundManager = await fundContract.manager();

    assert.equal(fundManager, manager);

    await fundContract.changeManager(newManager, { from: reviewer });
    const newFundManager = await fundContract.manager();

    await assert.equal(newFundManager, newManager);

    await this.endaomentAdmin.pause(3, { from: pauser });

    await expectRevert.unspecified(
      fundContract.changeManager(newManager, { from: reviewer })
    );
  });

  it("denies USER from changing manager", async function () {
    const fundContract = await Fund.at(this.fund.address);
    const fundManager = await fundContract.manager();

    assert.equal(fundManager, manager);

    await expectRevert.unspecified(
      fundContract.changeManager(newManager, { from: accountant })
    );
  });

  it("does not allow manager to be changed to the zero address", async function () {
    const fundContract = await Fund.at(this.fund.address);
    await expectRevert(
      fundContract.changeManager(constants.ZERO_ADDRESS, { from: admin }),
      "Fund: New manager cannot be the zero address"
    );
  });

  it("checks the recipient of a grant with the OrgFactory", async function () {
    //Open a new OrgFacotry using EndaomentAdmin
    const orgFactory = await OrgFactory.new(this.endaomentAdmin.address, { from: admin });

    //Set the new OrgFactory as the ORG_FACTORY role
    await this.endaomentAdmin.setRole(5, orgFactory.address, { from: admin });

    //Deploy an org contract using the OrgFactory
    const org = await orgFactory.createOrg(ein, {from: accountant});

    //Check that the new org's address passes the checkRecipient() function on the Fund contract
    const orgChecked = await this.fund.checkRecipient(
      org.logs[0].args.newAddress,
      orgFactory.address,
      { from: admin }
    );

    assert.isTrue(orgChecked);

    //Check that a zero address doesn't pass the checkRecipient() function
    await expectRevert(
      this.fund.checkRecipient(constants.ZERO_ADDRESS, orgFactory.address, {
        from: admin,
      }),
      "Fund: Recipient cannot be the zero address"
    );
    await expectRevert(
      this.fund.checkRecipient(org.logs[0].args.newAddress, constants.ZERO_ADDRESS, {
        from: admin,
      }),
      "Fund: OrgFactory cannot be the zero address"
    );
  });


  it("allows only MANAGER to create a grant", async function () {
    //Open a new OrgFactory using EndaomentAdmin
    const orgFactory = await OrgFactory.new(this.endaomentAdmin.address, {
      from: admin,
    });

    //Set the new OrgFactory as the ORG_FACTORY role
    await this.endaomentAdmin.setRole(5, orgFactory.address, {
      from: admin,
    });

    //Deploy an org contract using the OrgFactory
    const org = await orgFactory.createOrg(ein, {from: accountant});

    //Create new grant on the Fund contract
    const createGrantReceipt = await this.fund.createGrant(
      grantId,
      "test grant",
      1,
      org.logs[0].args.newAddress,
      orgFactory.address,
      { from: manager }
    );

    const grant = await this.fund.pendingGrants(grantId);
    expectEvent(createGrantReceipt, "GrantCreated", 
      { grantId, grant: [
        grant.description,
        "1",
        grant.recipient,
        grant.complete,
      ]}
    );

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

    // Should revert if anyone besides the manager calls the function
    await expectRevert(
      this.fund.createGrant(grantId, "test grant", 1, org.logs[0].args.newAddress, orgFactory.address, { from: admin } ),
      "Fund: This method is only callable by the fund manager."
    );
    // Should revert if no description is given
    await expectRevert(
      this.fund.createGrant(grantId, "", 1, org.logs[0].args.newAddress, orgFactory.address, { from: manager } ),
      "Fund: Must provide a description"
    );
  });

  it("allows ADMIN to finalize grant", async function () {
    const fund = this.fund; 
    const orgFactory = await OrgFactory.new(this.endaomentAdmin.address, { from: admin });
    await this.endaomentAdmin.setRole(5, orgFactory.address, { from: admin });

    const org = await orgFactory.createOrg(ein, {from: accountant});

    await this.token.transfer(fund.address, 100, { from: initHolder });

    await fund.createGrant(
      grantId,
      "test grant",
      100,
      org.logs[0].args.newAddress,
      orgFactory.address,
      { from: manager }
    );

    const grant = await fund.pendingGrants(grantId);
    
    const finalizeGrantReceipt = await fund.finalizeGrant(grantId, this.token.address, { from: admin });
    expectEvent(finalizeGrantReceipt, "GrantFinalized",
      { grantId, grant: [
        grant.description,
        "100",
        grant.recipient,
        true,
      ]}
    );

    const orgBalance = await this.token.balanceOf(org.logs[0].args.newAddress);
    const adminBalance = await this.token.balanceOf(admin);
    assert(orgBalance.eq(new BN(99)));
    assert(adminBalance.eq(new BN(1)));
  });

  it("allows ACCOUNTANT to finalize grant", async function () {
    const fund = this.fund; 
    const orgFactory = await OrgFactory.new(this.endaomentAdmin.address, { from: admin });
    await this.endaomentAdmin.setRole(5, orgFactory.address, { from: admin });

    const org = await orgFactory.createOrg(ein, {from: accountant});

    await this.token.transfer(fund.address, 100, { from: initHolder });

    await fund.createGrant(
      grantId,
      "test grant",
      100,
      org.logs[0].args.newAddress,
      orgFactory.address,
      { from: manager }
    );
    
    const grant = await fund.pendingGrants(grantId);
    
    const finalizeGrantReceipt = await fund.finalizeGrant(grantId, this.token.address, { from: accountant });
    const finalizeEventData = {
      grantId,
      grant: [
        grant.description,
        "100",
        grant.recipient,
        true,
      ]
    }
    expectEvent(finalizeGrantReceipt, "GrantFinalized", finalizeEventData);

    const orgBalance = await this.token.balanceOf(org.logs[0].args.newAddress);
    const adminBalance = await this.token.balanceOf(admin);
    assert(orgBalance.eq(new BN(99)));
    assert(adminBalance.eq(new BN(1)));
  });

  it("denies USER to finalize grant", async function () {
    const fund = this.fund;
    const orgFactory = await OrgFactory.new(this.endaomentAdmin.address, { from: admin });
    await this.endaomentAdmin.setRole(5, orgFactory.address, { from: admin });

    const org = await orgFactory.createOrg(ein, {from: accountant});

    await this.token.transfer(fund.address, 100, { from: initHolder });

    await fund.createGrant(
      grantId,
      "test grant",
      100,
      org.logs[0].args.newAddress,
      orgFactory.address,
      { from: manager }
    );

    await expectRevert(
      fund.finalizeGrant(grantId, this.token.address, { from: manager }),
      "Administratable: only ACCOUNTANT can access"
    );
  });

  it("blocks finalizing grant with invalid inputs", async function () {
    const fund = this.fund;
    const orgFactory = await OrgFactory.new(this.endaomentAdmin.address, { from: admin });
    await this.endaomentAdmin.setRole(5, orgFactory.address, { from: admin });

    const org = await orgFactory.createOrg(ein, {from: accountant});
    await this.token.transfer(fund.address, 100, { from: initHolder });
    await fund.createGrant(
      grantId,
      "test grant",
      100,
      org.logs[0].args.newAddress,
      orgFactory.address,
      { from: manager }
    );
    const badUuid = uuidv4();
    await expectRevert(
      fund.finalizeGrant(badUuid, this.token.address, { from: admin }),
      "Fund: Grant does not exist"
    );
    await expectRevert(
      fund.finalizeGrant(grantId, constants.ZERO_ADDRESS, { from: admin } ),
      "Fund: Token address cannot be the zero address"
    );
  });

  it("gets fund summary", async function () {
    const fund = await Fund.new(manager, this.endaomentAdmin.address, { from: admin });
    await this.token.transfer(fund.address, 1, { from: initHolder });
    const fundSummary = await fund.getSummary(this.token.address);
    assert(fundSummary[0].eq(new BN(1)));
    assert.equal(fundSummary[1], await fund.manager());
  });

  it("does not allow zero address to be used with getSummary", async function () {
    const fund = await Fund.new(manager, this.endaomentAdmin.address, { from: admin });
    await this.token.transfer(fund.address, 1, { from: initHolder });
    await expectRevert(
      fund.getSummary(constants.ZERO_ADDRESS),
      "Fund: Token address cannot be the zero address"
    );
  });
});
