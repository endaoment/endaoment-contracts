const { accounts, contract } = require("@openzeppelin/test-environment");
const {
  BN,
  constants,
  expectEvent,
  expectRevert,
} = require("@openzeppelin/test-helpers");
const { assert } = require("chai");

const EndaomentAdmin = contract.fromArtifact("EndaomentAdmin");

describe("EndaomentAmin.sol", function() {
  const [admin, pauser, accountant, reviewer, newOwner] = accounts;

  before(async function() {
    this.endaomentAdmin = await EndaomentAdmin.new({ from: admin });
  });

  it("has defined contract address post-init", async function() {
    assert.isDefined(this.endaomentAdmin.address);
  });

  it("set originator as the Owner on construct, allows retrieval of owner address", async function() {
    const owner = await this.endaomentAdmin.getOwner({ from: admin });
    assert.equal(owner, admin);
  });

  it("returns correct boolean for Owner based on provided address", async function() {
    const isOwner = await this.endaomentAdmin.isOwner({ from: admin });
    assert.isTrue(isOwner);
    const isntOwner = await this.endaomentAdmin.isOwner({ from: accountant });
    assert.isFalse(isntOwner);
  });

  it("allows only Owner to intiate ownership transfer", async function() {
    await this.endaomentAdmin.transferOwnership(newOwner, { from: admin });

    await expectRevert.unspecified(
      this.endaomentAdmin.transferOwnership(newOwner, { from: admin })
    );
  });

  it("allows only Owner to cancel ownership transfer", async function() {
    await expectRevert.unspecified(
      this.endaomentAdmin.transferOwnership(newOwner, { from: newOwner })
    );

    await this.endaomentAdmin.cancelOwnershipTransfer(newOwner, {
      from: admin,
    });

    await expectRevert.unspecified(
      this.endaomentAdmin.acceptOwnership({ from: newOwner })
    );
  });

  it("allows only newOwner to accept ownership transfer, and transfers successfully", async function() {
    await this.endaomentAdmin.transferOwnership(newOwner, { from: admin });

    await expectRevert.unspecified(
      this.endaomentAdmin.acceptOwnership({ from: admin })
    );

    await this.endaomentAdmin.acceptOwnership({ from: newOwner });
    const updatedOwner = this.endaomentAdmin.getOwner({ from: newOwner });

    assert.equal(newOwner, updatedOwner);
  });

  it("allows only Owner to set Role.ADMIN, allows retrieval of ADMIN address", async function() {
    await expectRevert.unspecified(
      this.endaomentAdmin.acceptOwnership({ from: admin })
    );
    await this.endaomentAdmin.setRole(0, admin, { from: newOwner });
    const adminRole = await this.endaomentAdmin.getAdmin({ from: newOwner });

    assert.equal(adminRole, admin);
  });
});
