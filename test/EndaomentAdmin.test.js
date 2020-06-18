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
const FundFactory = contract.fromArtifact("FundFactory");

describe("EndaomentAmin", function () {
  const [admin, pauser, accountant, reviewer, newOwner] = accounts;

  beforeEach(async function () {
    this.endaomentAdmin = await EndaomentAdmin.new({ from: admin });
  });

  it("has defined contract address post-init", async function () {
    assert.isDefined(this.endaomentAdmin.address);
  });

  it("sets originator as Owner, retrieves owner address", async function () {
    const owner = await this.endaomentAdmin.getOwner({ from: admin });
    assert.equal(owner, admin);
  });

  it("returns correct boolean for Owner based on provided address", async function () {
    const isOwner = await this.endaomentAdmin.isOwner({ from: admin });
    assert.isTrue(isOwner);
    const isNotOwner = await this.endaomentAdmin.isOwner({ from: newOwner });
    assert.isFalse(isNotOwner);
  });

  it("allows Owner to intiate ownership transfer", async function () {
    const transferReceipt = await this.endaomentAdmin.transferOwnership(
      newOwner,
      { from: admin }
    );
    expectEvent(transferReceipt, "TransferInitiated", { newOwner });
  });

  it("denies non-Owner to intiate ownership transfer", async function () {
    await expectRevert.unspecified(
      this.endaomentAdmin.transferOwnership(newOwner, { from: newOwner })
    );
  });

  it("denies non-Owner from cancelling ownership transfer", async function () {
    await expectRevert.unspecified(
      this.endaomentAdmin.cancelOwnershipTransfer({ from: newOwner })
    );
  });

  it("allows Owner to cancel ownership transfer", async function () {
    await this.endaomentAdmin.transferOwnership(newOwner, { from: admin });

    const cancelReceipt = await this.endaomentAdmin.cancelOwnershipTransfer({ from: admin });

    expectEvent(cancelReceipt, "TransferCancelled", {
      newPotentialOwner: newOwner,
    });
  });

  it("denies non-Owner from cancelling ownership transfer", async function () {
    await this.endaomentAdmin.transferOwnership(newOwner, { from: admin });

    await expectRevert.unspecified(
      this.endaomentAdmin.cancelOwnershipTransfer({ from: newOwner })
    );
  });

  it("denies non-newOwner to accept ownership transfer", async function () {
    await this.endaomentAdmin.transferOwnership(newOwner, { from: admin });

    await expectRevert.unspecified(
      this.endaomentAdmin.acceptOwnership({ from: admin })
    );
  });

  it("allows only newOwner to accept ownership transfer, and updates Owner successfully", async function () {
    await this.endaomentAdmin.transferOwnership(newOwner, { from: admin });

    await expectRevert.unspecified(
      this.endaomentAdmin.acceptOwnership({ from: admin })
    );

    const ownershipTransferReciept = await this.endaomentAdmin.acceptOwnership({
      from: newOwner,
    });
    expectEvent(ownershipTransferReciept, "OwnershipTransferred", {
      previousOwner: admin,
      newOwner,
    });
    const updatedOwner = await this.endaomentAdmin.getOwner({ from: newOwner });

    assert.equal(newOwner, updatedOwner);
  });

  it("denies non-Owner from setting a role", async function () {
    await expectRevert.unspecified(
      this.endaomentAdmin.setRole(0, admin, { from: newOwner })
    );
  });

  it("allows Owner to set Role, allows retrieval of Role address", async function () {
    await this.endaomentAdmin.setRole(0, admin, { from: admin });
    const adminRole = await this.endaomentAdmin.getRoleAddress(0, { from: admin });

    assert.equal(adminRole, admin);
  });

  it("allows Owner to remove Role", async function () {
    await this.endaomentAdmin.setRole(0, admin, { from: admin });
    const assignedAddress = await this.endaomentAdmin.getRoleAddress(0);

    assert.equal(assignedAddress, admin);

    await this.endaomentAdmin.removeRole(0, { from: admin });

    await expectRevert.unspecified(
      this.endaomentAdmin.getRoleAddress(0)
    )
  });

  it("denies non-Owner from removing role", async function () {
    await this.endaomentAdmin.setRole(0, admin, { from: admin });
    const beforeRole = await this.endaomentAdmin.getRoleAddress(0);
    await expectRevert.unspecified(
      this.endaomentAdmin.removeRole(0, { from: newOwner })
    );
    const afterRole = await this.endaomentAdmin.getRoleAddress(0);

    assert.equal(beforeRole, afterRole);
  });

  it("allows Owner to pause a given role", async function () {
    await this.endaomentAdmin.setRole(2, accountant, { from: admin });
    const pauseReceipt = await this.endaomentAdmin.pause(2, { from: admin });

    expectEvent(pauseReceipt, "RolePaused", { role: "2" });
  });

  it("allows Pauser to pause a given role", async function () {
    await this.endaomentAdmin.setRole(1, pauser, { from: admin });
    await this.endaomentAdmin.setRole(2, accountant, { from: admin });
    const pauseReceipt = await this.endaomentAdmin.pause(2, { from: pauser });

    expectEvent(pauseReceipt, "RolePaused", { role: "2" });
  });

  it("denies non-Owner/Pauser to pause a given role", async function () {
    await this.endaomentAdmin.setRole(1, pauser, { from: admin });
    await this.endaomentAdmin.setRole(2, accountant, { from: admin });

    await expectRevert.unspecified(
      this.endaomentAdmin.pause(2, { from: newOwner })
    );
  });

  it("allows Owner to unpause a given role", async function () {
    await this.endaomentAdmin.setRole(1, pauser, { from: admin });
    await this.endaomentAdmin.setRole(2, accountant, { from: admin });
    await this.endaomentAdmin.pause(2, { from: admin });
    const unpauseReceipt = await this.endaomentAdmin.unpause(2, {
      from: admin,
    });

    expectEvent(unpauseReceipt, "RoleUnpaused", { role: "2" });
  });

  it("denies non-Owner to unpause a given role", async function () {
    await this.endaomentAdmin.setRole(1, pauser, { from: admin });
    await this.endaomentAdmin.setRole(2, accountant, { from: admin });
    await this.endaomentAdmin.pause(2, { from: pauser });

    await expectRevert.unspecified(
      this.endaomentAdmin.pause(2, { from: pauser })
    );
  });

  it("allows caller to check if given role is paused", async function () {
    await this.endaomentAdmin.setRole(1, pauser, { from: admin });
    await this.endaomentAdmin.setRole(2, accountant, { from: admin });
    const isNotPaused = await this.endaomentAdmin.isPaused(2);

    assert.isFalse(isNotPaused);

    await this.endaomentAdmin.pause(2, { from: admin });
    const isPaused = await this.endaomentAdmin.isPaused(2);

    assert.isTrue(isPaused);
  });

  it("confirms if caller holds role ", async function () {
    await this.endaomentAdmin.setRole(0, admin, { from: admin });
    const holdsAdminRole = await this.endaomentAdmin.isRole(0, { from: admin });

    assert.isTrue(holdsAdminRole);
  });

  it("confirms if caller does not hold role ", async function () {
    await this.endaomentAdmin.setRole(0, admin, { from: admin });
    const holdsAdminRole = await this.endaomentAdmin.isRole(0, { from: pauser });

    assert.isFalse(holdsAdminRole);
  });
});