const { accounts, contract } = require("@openzeppelin/test-environment");
const { assert } = require("chai");

const EndaomentAdmin = contract.fromArtifact("EndaomentAdmin");
const OrgFactory = contract.fromArtifact("OrgFactory");
const Org = contract.fromArtifact("Org");

describe("OrgFactory", function() {
  const [admin, manager, accountant, pauser] = accounts;

  before(async function() {
    this.EndaomentAdmin = await EndaomentAdmin.new({ from: admin });
  });

  beforeEach(async function() {
    await this.EndaomentAdmin.setRole(0, admin, { from: admin });
    await this.EndaomentAdmin.setRole(1, pauser, { from: admin });
    await this.EndaomentAdmin.setRole(2, accountant, { from: admin });
    this.OrgFactory = await OrgFactory.new(this.EndaomentAdmin.address, {
      from: admin,
    });
  });

  it("admin can create orgs", async function() {
    assert.isDefined(this.OrgFactory.address);
    console.log(this.OrgFactory);

    const org = await this.OrgFactory.createOrg(
      123456789,
      this.EndaomentAdmin.address,
      { from: admin }
    );

    const org_contract = await Org.at(org.logs[0].args.newOrg);
    const org_EIN = await org_contract.taxId();

    assert.equal(org_EIN, 123456789);
    assert.isDefined(org.logs[0].args.newOrg);
  });

  // it("accountant can create orgs, only if not paused", async function() {
  //   assert.isDefined(this.OrgFactory.address);

  //   const org = await this.OrgFactory.createOrg(
  //     123456789,
  //     this.EndaomentAdmin.address,
  //     { from: accountant }
  //   );
  //   const org_contract = await Org.at(org.logs[0].args.newOrg);
  //   const org_manager = await org_contract.manager();

  //   assert.equal(org_manager, manager);
  //   assert.isDefined(org.logs[0].args.newOrg);

  //   // await this.EndaomentAdmin.pause(2, { from: pauser });

  //   // assert.Throw(async () => {
  //   //   await this.OrgFactory.createOrg(manager, this.EndaomentAdmin.address, {
  //   //     from: accountant,
  //   //   });
  //   // });
  // });

  // it("returns count of total orgs", async function() {
  //   assert.isDefined(this.OrgFactory.address);

  //   await this.OrgFactory.createOrg(123456789, this.EndaomentAdmin.address, {
  //     from: admin,
  //   });

  //   const count = await this.OrgFactory.countDeployedOrgs();

  //   assert.equal(count, 1);
  // });

  // it("grabs a org address using getDeployedOrg()", async function() {
  //   assert.isDefined(this.OrgFactory.address);

  //   const org = await this.OrgFactory.createOrg(
  //     123456789,
  //     this.EndaomentAdmin.address,
  //     { from: accountant }
  //   );

  //   const getFundAddress = await this.OrgFactory.getDeployedOrg(1);

  //   assert.equal(org.logs[0].args.newOrg, getFundAddress);
  // });

  // it("returns if an address is an existing org or not", async function() {
  //   assert.isDefined(this.OrgFactory.address);

  //   const org = await this.OrgFactory.createOrg(
  //     123456789,
  //     this.EndaomentAdmin.address,
  //     { from: accountant }
  //   );

  //   const getFundAddress = await this.OrgFactory.getDeployedOrg(
  //     org.logs[0].args.newOrg
  //   );

  //   assert.isTrue(getFundAddress);
  // });
});
