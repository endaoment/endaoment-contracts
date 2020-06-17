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

describe("OrgFactory", function() {
  const [admin, manager, accountant, pauser] = accounts;

  beforeEach(async function() {
    this.endaomentAdmin = await EndaomentAdmin.new({ from: admin });
    await this.endaomentAdmin.setRole(0, admin, { from: admin });
    await this.endaomentAdmin.setRole(1, pauser, { from: admin });
    await this.endaomentAdmin.setRole(2, accountant, { from: admin });
    this.orgFactory = await OrgFactory.new(this.endaomentAdmin.address, {
      from: admin,
    });
  });

  it("has defined contract address post-init", async function() {
    assert.isDefined(this.orgFactory.address);
  });

  it("allows admin contract to construct", async function() {
    const org_factory = await OrgFactory.new(this.endaomentAdmin.address, {
      from: admin,
    });
    assert.isDefined(org_factory.address);
  });

  it("denies invalid admin contract to construct", async function() {
    await expectRevert.unspecified(
      OrgFactory.new(constants.ZERO_ADDRESS, { from: admin })
    );
  });

  it("denies invalid non-admin wallet to construct", async function() {
    await expectRevert.unspecified(
      OrgFactory.new(this.endaomentAdmin.address, { from: manager })
    );
  });

  it("admin can create orgs", async function() {
    assert.isDefined(this.orgFactory.address);

    const org = await this.orgFactory.createOrg(
      123456789,
      this.endaomentAdmin.address,
      { from: accountant }
    );

    const org_contract = await Org.at(org.logs[0].args.newOrg);
    const org_EIN = await org_contract.taxId();

    assert.equal(org_EIN, 123456789);
    assert.isDefined(org.logs[0].args.newOrg);
  });

  it("accountant can create orgs, only if not paused", async function() {
    assert.isDefined(this.orgFactory.address);

    const org = await this.orgFactory.createOrg(
      123456789,
      this.endaomentAdmin.address,
      { from: accountant }
    );
    const org_contract = await Org.at(org.logs[0].args.newOrg);
    const org_manager = await org_contract.manager();

    assert.equal(org_manager, manager);
    assert.isDefined(org.logs[0].args.newOrg);

    await this.endaomentAdmin.pause(2, { from: pauser });

    await expectRevert.unspecified(
      this.orgFactory.createFund(123456789, this.endaomentAdmin.address, {
        from: accountant,
      })
    );
  });

  it("returns count of total orgs", async function() {
    assert.isDefined(this.orgFactory.address);

    await this.orgFactory.createOrg(123456789, this.endaomentAdmin.address, {
      from: admin,
    });

    const count = await this.orgFactory.countDeployedOrgs();

    assert.equal(count, 1);
  });

  it("grabs a org address using getDeployedOrg()", async function() {
    assert.isDefined(this.orgFactory.address);

    const org = await this.orgFactory.createOrg(
      123456789,
      this.EndaomentAdmin.address,
      { from: accountant }
    );

    const getFundAddress = await this.orgFactory.getDeployedOrg(1);

    assert.equal(org.logs[0].args.newOrg, getFundAddress);
  });

  it("returns if an address is an existing org or not", async function() {
    assert.isDefined(this.orgFactory.address);

    const org = await this.orgFactory.createOrg(
      123456789,
      this.EndaomentAdmin.address,
      { from: accountant }
    );

    const getFundAddress = await this.orgFactory.getDeployedOrg(
      org.logs[0].args.newOrg
    );

    assert.isTrue(getFundAddress);
  });
});
