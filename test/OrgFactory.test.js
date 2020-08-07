const { accounts, contract } = require("@openzeppelin/test-environment");
const { assert } = require("chai");
const {
  BN,
  constants,
  expectEvent,
  expectRevert,
} = require("@openzeppelin/test-helpers");

const EndaomentAdmin = contract.fromArtifact("EndaomentAdmin");
const OrgFactory = contract.fromArtifact("OrgFactory");
const Org = contract.fromArtifact("Org");

describe("OrgFactory", function () {
  const [admin, manager, accountant, pauser] = accounts;
  const ein = 999999999;

  beforeEach(async function () {
    this.endaomentAdmin = await EndaomentAdmin.new({ from: admin });
    await this.endaomentAdmin.setRole(6, admin, { from: admin });
    await this.endaomentAdmin.setRole(1, pauser, { from: admin });
    await this.endaomentAdmin.setRole(2, accountant, { from: admin });
    this.orgFactory = await OrgFactory.new(this.endaomentAdmin.address, { from: admin });
    await this.endaomentAdmin.setRole(5, this.orgFactory.address, { from: admin });
  });

  it('sets the endaomentAdmin address when deployed', async function() {
    assert.equal(await this.orgFactory.endaomentAdmin(), this.endaomentAdmin.address)
  });

  it('does not allow deployments when admin address is the zero address', async function() {
    await expectRevert(
      OrgFactory.new(constants.ZERO_ADDRESS, { from: admin }),
      "OrgFactory: Admin cannot be the zero address"
    );
  });

  it("has defined contract address post-init", async function () {
    assert.isDefined(this.orgFactory.address);
  });

  it("allows admin contract to construct", async function () {
    const org_factory = await OrgFactory.new(this.endaomentAdmin.address, { from: admin });
    assert.isDefined(org_factory.address);
  });

  it("admin can create orgs", async function () {
    assert.isDefined(this.orgFactory.address);

    const org = await this.orgFactory.createOrg(ein, {from: accountant});
    const org_contract = await Org.at(org.logs[0].args.newAddress);
    const org_EIN = await org_contract.taxId();

    assert.equal(org_EIN, ein);
    assert.isDefined(org.logs[0].args.newAddress);
  });

  it("accountant can create orgs, only if not paused", async function () {
    assert.isDefined(this.orgFactory.address);

    const org = await this.orgFactory.createOrg(ein, {from: accountant});
    assert.isDefined(org.logs[0].args.newAddress);

    await this.endaomentAdmin.pause(2, { from: pauser });
    await expectRevert.unspecified(
      this.orgFactory.createOrg(ein, {
        from: accountant,
      })
    );
  });

  it ('does not allow orgs to be created with invalid EINs', async function() {
    const invalidEins = [0, 1, 9999999, 1000000000];
    invalidEins.forEach(async (ein) => {
      await expectRevert(
        this.orgFactory.createOrg(ein, { from: accountant }),
        "Org: Must provide a valid EIN"
      );
    })
  });

  it ('allows orgs to be created with valid EINs', async function() {
    const validEins = [10000000, 999999999];
    validEins.forEach(async (ein) => {
      const org =  await this.orgFactory.createOrg(ein, { from: accountant });
      assert.isDefined(org.logs[0].args.newAddress);
    })
  });

  it("returns count of total orgs", async function () {
    assert.isDefined(this.orgFactory.address);
    await this.orgFactory.createOrg(123456789, { from: admin });
    const count = await this.orgFactory.countDeployedOrgs(); 
    assert.equal(count, 1);
  });

  it("grabs a org address using getDeployedOrg()", async function () {
    assert.isDefined(this.orgFactory.address);
    const org = await this.orgFactory.createOrg(123456789, {from: accountant});
    const getFundAddress = await this.orgFactory.deployedOrgs(0);
    assert.equal(org.logs[0].args.newAddress, getFundAddress);
  });

  it("returns if an address is an existing org or not", async function () {
    assert.isDefined(this.orgFactory.address);
    const org = await this.orgFactory.createOrg(123456789, {from: accountant});
    const getOrgExistence = await this.orgFactory.deployedOrgs(0, { from: admin });
    assert.equal(getOrgExistence, org.logs[0].args.newAddress);
  });
});
