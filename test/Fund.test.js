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

describe("Fund", function() {
  const [admin, manager, newManager, accountant, pauser, reviewer] = accounts;

  beforeEach(async function() {
    this.endaomentAdmin = await EndaomentAdmin.new({ from: admin });
    await this.endaomentAdmin.setRole(0, admin, { from: admin });
    await this.endaomentAdmin.setRole(1, pauser, { from: admin });
    await this.endaomentAdmin.setRole(2, accountant, { from: admin });
    await this.endaomentAdmin.setRole(3, reviewer, { from: admin });
    this.fund = await Fund.new(manager, this.endaomentAdmin.address, {
      from: admin,
    });
  });

  it("has defined fund contract address post-init", async function() {
    assert.isDefined(this.fund.address);
  });

  it("allows ADMIN to construct Fund contract", async function() {
    const fund = await Fund.new(manager, this.endaomentAdmin.address, {
      from: admin,
    });
    assert.isDefined(fund.address);
  });

  it("allows FUND_FACTORY to construct Fund contract via ACCOUNTANT", async function() {
    const fundFactory = await FundFactory.new(this.endaomentAdmin.address, {
      from: admin,
    });
    await this.endaomentAdmin.setRole(4, fundFactory.address, { from: admin });
    const fund = await fundFactory.createFund(
      manager,
      this.endaomentAdmin.address,
      {
        from: accountant,
      }
    );
    assert.isDefined(fund.logs[0].args.newAddress);
  });

  it("denies invalid admin contract to construct fund contract", async function() {
    await expectRevert.unspecified(
      Fund.new(constants.ZERO_ADDRESS, this.endaomentAdmin.address, {
        from: admin,
      })
    );
  });

  it("denies invalid non-ADMIN wallet to construct fund contract", async function() {
    await expectRevert.unspecified(
      Fund.new(manager, this.endaomentAdmin.address, { from: manager })
    );
  });

  it("creates funds with correct manager", async function() {
    const fund_contract = await Fund.at(this.fund.address);
    const fund_manager = await fund_contract.manager();

    assert.equal(fund_manager, manager);
    assert.isDefined(this.fund.address);
  });

  it("allows ADMIN to change manager", async function() {
    const fund_contract = await Fund.at(this.fund.address);
    const fund_manager = await fund_contract.manager();

    assert.equal(fund_manager, manager);

    await fund_contract.changeManager(newManager, this.endaomentAdmin.address, {
      from: admin,
    });
    const new_manager = await fund_contract.manager();

    await assert.equal(new_manager, newManager);
  });

  it("allows REVIEWER to change manager, only if not paused", async function() {
    const fund_contract = await Fund.at(this.fund.address);
    const fund_manager = await fund_contract.manager();

    assert.equal(fund_manager, manager);

    await fund_contract.changeManager(newManager, this.endaomentAdmin.address, {
      from: reviewer,
    });
    const new_manager = await fund_contract.manager();

    await assert.equal(new_manager, newManager);

    await this.endaomentAdmin.pause(3, { from: pauser });

    await expectRevert.unspecified(
      fund_contract.changeManager(newManager, this.endaomentAdmin.address, {
        from: reviewer,
      })
    );
  });

  it("denies non-ADMIN, non-REVIEWER from changing manager", async function() {
    const fund_contract = await Fund.at(this.fund.address);
    const fund_manager = await fund_contract.manager();

    assert.equal(fund_manager, manager);

    await expectRevert.unspecified(
      fund_contract.changeManager(newManager, this.endaomentAdmin.address, {
        from: accountant,
      })
    );
  });

  it("returns count of total grants", async function() {
    const before_count = await this.fund.getGrantsCount();
    assert.equal(before_count, 0);

    // await this.fund.createGrant(manager, this.endaomentAdmin.address, {
    //   from: admin,
    // });

    // const after_count = await this.fund.getGrantsCount();
    // assert.equal(after_count, 1);
  });
});
