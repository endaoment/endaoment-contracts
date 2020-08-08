// SPDX-License-Identifier: BSD 3-Clause

pragma solidity ^0.6.10;
pragma experimental ABIEncoderV2;

import "./Administratable.sol";
import "./OrgFactory.sol";
import "./IFactory.sol";
import "@openzeppelin/contracts/math/SafeMath.sol";

// FUND CONTRACT
/**
 * @title Fund
 * @author rheeger
 * @notice Fund is a contract that serves as an on-chain US Donor-Advised Fund.
 * It holds the proceeds of gifted cryptocurrency as ERC20 tokens,
 * and allows for the manager to submit Grant recommendations to the contract.
 * The EndaomentAdmin can then chose to approve the Grant recommendation, triggering
 * a SafeMath transfer of a 1% fee to the EndaomentAdmin and the remainder to the
 * recipient Org contract.
 */
contract Fund is Administratable {
  using SafeMath for uint256;
  using SafeERC20 for IERC20;

  // ========== STRUCTS & EVENTS ==========

  struct Grant {
    string description;
    uint256 value;
    address recipient;
    bool complete;
  }

  event ManagerChanged(address newManager);
  event GrantCreated(string grantId, Grant grant);
  event GrantUpdated(string grantId, Grant grant);
  event GrantRejected(string grantId);
  event GrantFinalized(string grantId, Grant grant);

  // ========== STATE VARIABLES ==========

  address public manager;
  IFactory public fundFactoryContract;
  mapping(string => Grant) public pendingGrants; // grant UUID to Grant

  // ========== CONSTRUCTOR ==========
  /**
   * @notice Create new Fund
   * @param fundManager Address of the Fund's Primary Advisor
   * @param fundFactory Address of the Factory contract.
   */
  constructor(address fundManager, address fundFactory) public {
    require(fundManager != address(0), "Fund: Creator cannot be null address.");
    require(fundFactory != address(0), "Fund: Factory cannot be null address.");
    manager = fundManager;
    fundFactoryContract = IFactory(fundFactory);
  }

  // ========== Fund Management & Info ==========
  /**
   * @notice Change Fund Primary Advisor
   * @param  newManager The address of the new PrimaryAdvisor.
   */
  function changeManager(address newManager)
    public
    onlyAdminOrRole(fundFactoryContract.endaomentAdmin(), IEndaomentAdmin.Role.REVIEWER)
  {
    require(newManager != address(0), "Fund: New manager cannot be the zero address");
    emit ManagerChanged(newManager);
    manager = newManager;
  }

  /**
   * @notice Checks recipient of a Grant is an address created by the OrgFactory
   * @param  recipient The address of the Grant recipient.
   * @param  orgFactoryContractAddress Address of the OrgFactory contract.
   * @return Boolean of status of given recipient status.
   */
  function checkRecipient(address recipient, address orgFactoryContractAddress)
    public
    view
    returns (bool)
  {
    require(recipient != address(0), "Fund: Recipient cannot be the zero address");
    require(orgFactoryContractAddress != address(0), "Fund: OrgFactory cannot be the zero address");
    OrgFactory orgFactory = OrgFactory(orgFactoryContractAddress);

    return orgFactory.allowedOrgs(recipient);
  }

  /**
   * @notice Returns summary of details about the fund [tokenBalance, number of grants, managerAddress].
   * @param  tokenAddress The token address of the ERC20 being used by the web-server.
   * @return Returns the token balance of the given tokenAddress and the address of the Fund's manager.
   */
  function getSummary(address tokenAddress) external view returns (uint256, address) {
    require(tokenAddress != address(0), "Fund: Token address cannot be the zero address");
    IERC20 tokenContract = IERC20(tokenAddress);
    uint256 balance = tokenContract.balanceOf(address(this));

    return (balance, manager);
  }

  /**
   * @notice Creates new Grant Recommendation and emits GrantCreated event.
   * @param  grantId UUID representing this grant
   * @param  description The address of the Owner.
   * @param  value The value of the grant in base units.
   * @param  recipient The address of the recieving organization's contract.
   */
  function createGrant(
    string calldata grantId,
    string calldata description,
    uint256 value,
    address recipient
  ) public onlyAddressOrAdminOrRole(manager, fundFactoryContract.endaomentAdmin(), IEndaomentAdmin.Role.REVIEWER) {
    require(!isEqual(grantId, ""), "Fund: Must provide a grantId");
    require(!isEqual(description, ""), "Fund: Must provide a description");
    EndaomentAdmin endaomentAdmin = EndaomentAdmin(fundFactoryContract.endaomentAdmin());
    require(
      checkRecipient(recipient, endaomentAdmin.getRoleAddress(IEndaomentAdmin.Role.ORG_FACTORY)) == true,
      "Fund: Recipient contract was not created by the OrgFactory and is not allowed."
    );
    require(pendingGrants[grantId].recipient == address(0), "Fund: Grant was already created.");

    Grant memory newGrant = Grant({
      description: description,
      value: value,
      recipient: recipient,
      complete: false
    });
    emit GrantCreated(grantId, newGrant);
    pendingGrants[grantId] = newGrant;
  }

  /**
   * @notice Updates Grant Recommendation and emits GrantUpdated event.
   * @param  grantId UUID representing this grant
   * @param  description The address of the Owner.
   * @param  value The value of the grant in base units.
   * @param  recipient The address of the recieving organization's contract.
   */
  function updateGrant(
    string calldata grantId,
    string calldata description,
    uint256 value,
    address recipient
  ) public onlyAddressOrAdminOrRole(manager, fundFactoryContract.endaomentAdmin(), IEndaomentAdmin.Role.REVIEWER) {
    require(!isEqual(grantId, ""), "Fund: Must provide a grantId");
    require(!isEqual(description, ""), "Fund: Must provide a description");
    EndaomentAdmin endaomentAdmin = EndaomentAdmin(fundFactoryContract.endaomentAdmin());
    require(
      checkRecipient(recipient, endaomentAdmin.getRoleAddress(IEndaomentAdmin.Role.ORG_FACTORY)) == true,
      "Fund: Recipient contract was not created by the OrgFactory and is not allowed."
    );
    require(pendingGrants[grantId].recipient != address(0), "Fund: Grant does not exist.");
    require(pendingGrants[grantId].complete == false, "Fund: Grant is already finalized.");
    Grant memory replacementGrant = Grant({
      description: description,
      value: value,
      recipient: recipient,
      complete: false
    });
    pendingGrants[grantId] = replacementGrant;
    emit GrantUpdated(grantId, replacementGrant);
  }

  /**
   * @notice Rejects Grant Recommendation and emits GrantRejected event.
   * @param  grantId UUID representing this grant
   */
  function rejectGrant(string calldata grantId)
    public
    onlyAddressOrAdminOrRole(
      manager,
      fundFactoryContract.endaomentAdmin(),
      IEndaomentAdmin.Role.REVIEWER
    )
  {
    require(!isEqual(grantId, ""), "Fund: Must provide a grantId");
    require(pendingGrants[grantId].recipient != address(0), "Fund: Grant does not exist.");
    require(pendingGrants[grantId].complete == false, "Fund: Grant is already finalized.");

    delete pendingGrants[grantId];
    emit GrantRejected(grantId);
  }

  /**
   * @notice Approves Grant Recommendation and emits GrantFinalized event.
   * @param  grantId UUID of the grant being finalized
   * @param  tokenAddress The ERC20 token address of the token prescribed by the web-server.
   */
  function finalizeGrant(string calldata grantId, address tokenAddress)
    public
    onlyAdminOrRole(fundFactoryContract.endaomentAdmin(), IEndaomentAdmin.Role.ACCOUNTANT)
  {
    require(!isEqual(grantId, ""), "Fund: Must provide a grantId");
    require(tokenAddress != address(0), "Fund: Token address cannot be the zero address");
    Grant storage grant = pendingGrants[grantId];
    require(grant.recipient != address(0), "Fund: Grant does not exist");
    // Checks
    require(grant.complete == false, "Fund: Grant is already finalized.");
    // Effects
    IERC20 tokenContract = IERC20(tokenAddress);

    // Process fees:
    uint256 fee = grant.value.div(100);
    uint256 finalGrant = grant.value.sub(fee);
    grant.complete = true;
    emit GrantFinalized(grantId, grant);
    // Interactions
    address endaomentAdminAdminAddress = EndaomentAdmin(fundFactoryContract.endaomentAdmin())
      .getRoleAddress(IEndaomentAdmin.Role.ADMIN);
    tokenContract.safeTransfer(endaomentAdminAdminAddress, fee);
    tokenContract.safeTransfer(grant.recipient, finalGrant);
  }
}
