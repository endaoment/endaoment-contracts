const { accounts, contract } = require("@openzeppelin/test-environment");
const {
  BN,
  constants,
  expectEvent,
  expectRevert,
} = require("@openzeppelin/test-helpers");
const { assert } = require("chai");

const EndaomentAdmin = contract.fromArtifact("EndaomentAdmin");
const OrgFactory = contract.fromArtifact("OrgFactory");
const Org = contract.fromArtifact("Org");
const FundFactory = contract.fromArtifact("FundFactory");
const Fund = contract.fromArtifact("Fund");
const IFactory = contract.fromArtifact("IFactory");

describe("EndaomentAdminStorage", function () {
  const [admin, manager, accountant, pauser, newAdmin] = accounts;
  const ein = 999999999;

  beforeEach(async function () {
    this.endaomentAdmin = await EndaomentAdmin.new({ from: admin });
    await this.endaomentAdmin.setRole(6, admin, { from: admin });
    await this.endaomentAdmin.setRole(1, pauser, { from: admin });
    await this.endaomentAdmin.setRole(2, accountant, { from: admin });
    this.fundFactory = await FundFactory.new(this.endaomentAdmin.address, { from: admin });

    await this.endaomentAdmin.setRole(4, this.fundFactory.address, { from: admin });
    const receipt = await this.fundFactory.createFund(manager, {
      from: admin,
    });
    this.fund = await Fund.at(receipt.logs[0].args.newAddress)
  });

  it('sets the endaomentAdmin address when deployed', async function() {
    assert.equal(await this.fundFactory.endaomentAdmin(), this.endaomentAdmin.address)
  });
  
  it('allows the admin to change the endaomentAdmin address', async function() {
    const newEndaomentAdmin = await EndaomentAdmin.new({ from: admin });
    await newEndaomentAdmin.setRole(6, newAdmin, { from: admin });
    await this.fundFactory.updateEndaomentAdmin(newEndaomentAdmin.address, { from: admin });
    assert.equal(await newEndaomentAdmin.getRoleAddress(6), newAdmin);
  });
  
  it('prevents changing the endaomentAdmin address to the zero address', async function() {
    await expectRevert(
      this.fundFactory.updateEndaomentAdmin(constants.ZERO_ADDRESS, { from: admin }),
      "FundFactory: New admin cannot be the zero address"
    )
  });
  
  it('prevents changing the endaomentAdmin address if target contract has no admin', async function() {
    // This will throw in EndaomentAdmin when we try to read the current admin
    const newEndaomentAdmin = await EndaomentAdmin.new({ from: admin });
    await expectRevert(
      this.fundFactory.updateEndaomentAdmin(newEndaomentAdmin.address, { from: admin }),
      "EndaomentAdmin: Role bearer is null address."
    )
  });
  
  it('prevents changing the endaomentAdmin address to an ordinary EOA', async function() {
    // This will throw in EndaomentAdmin when we try to read the current admin
    await expectRevert.unspecified(
      this.fundFactory.updateEndaomentAdmin(admin, { from: admin }),
      "EndaomentAdmin: Role bearer is null address."
    )
  });

  it('allows FundFactory and it\'s children to update independently of OrgFactory and it\'s children', async function() {
    // FundFactory and it's child are already deployed, so let's deploy Org now with the
    // same endaoment admin
    this.orgFactory = await OrgFactory.new(this.endaomentAdmin.address, { from: admin});
    await this.endaomentAdmin.setRole(5, this.orgFactory.address, { from: admin });
    const receipt = await this.orgFactory.createOrg(ein, {from: admin});
    this.org = await Org.at(receipt.logs[0].args.newAddress)

    // All four contracts should have the same endaoment admin
    assert.equal(this.endaomentAdmin.address, await this.fundFactory.endaomentAdmin());
    const fundFactoryContract = await IFactory.at(await this.fund.fundFactoryContract());
    assert.equal(await fundFactoryContract.endaomentAdmin(), this.endaomentAdmin.address)
    
    assert.equal(this.endaomentAdmin.address, await this.orgFactory.endaomentAdmin());
    const orgFactoryContract = await IFactory.at(await this.org.orgFactoryContract());
    assert.equal(await orgFactoryContract.endaomentAdmin(), this.endaomentAdmin.address)

    // Deploy a new endaoment admin
    const newEndaomentAdmin = await EndaomentAdmin.new({ from: admin });
    await newEndaomentAdmin.setRole(6, newAdmin, { from: admin });

    // Assign it to the FundFactory contract
    await this.fundFactory.updateEndaomentAdmin(newEndaomentAdmin.address, { from: admin });

    // FundFactory and it's child should have new address, and org should have the original
    assert.equal(newEndaomentAdmin.address, await this.fundFactory.endaomentAdmin());
    const fundFactoryContract2 = await IFactory.at(await this.fund.fundFactoryContract());
    assert.equal(await fundFactoryContract2.endaomentAdmin(), newEndaomentAdmin.address)

    assert.equal(this.endaomentAdmin.address, await this.orgFactory.endaomentAdmin());
    const orgFactoryContract2 = await IFactory.at(await this.org.orgFactoryContract());
    assert.equal(await orgFactoryContract2.endaomentAdmin(), this.endaomentAdmin.address)
  })

});
