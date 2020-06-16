// SPDX-License-Identifier: UNLICENSED

/*
ENDAOMENT V0.1 ADMIN CONTRACT: 
    EndaomentAdmin acts as a admin user state gatekeeper for the FundFactory, Fund, OrgFactory and Org Contracts. 
    On deployment, the admin is set by the deployer. Once set, only the admin can change the admin role. 

*/
pragma solidity ^0.6.10;

import "./interfaces/IEndaomentAdmin.sol";

/**
 * @dev Contract module which provides a basic access control mechanism, where
 * there is an account (an owner) that can be granted exclusive access to
 * specific functions.
 *
 * This module is used through inheritance. It will make available the modifier
 * `onlyOwner`, which can be aplied to your functions to restrict their use to
 * the owner.
 *
 * In order to transfer ownership, a recipient must be specified, at which point
 * the specified recipient can call `acceptOwnership` and take ownership.
 */
contract TwoStepOwnable {
  address private _owner;
  address private _newPotentialOwner;

  event OwnershipTransferred(
    address indexed previousOwner,
    address indexed newOwner
  );

  /**
   * @dev Initialize contract by setting transaction submitter as initial owner.
   */
  constructor() internal {
    _owner = tx.origin;
    emit OwnershipTransferred(address(0), _owner);
  }

  /**
   * @dev Returns the address of the current owner.
   */
  function getOwner()  public view returns (address) {
    return _owner;
  }

  /**
   * @dev Throws if called by any account other than the owner.
   */
  modifier onlyOwner() {
    require(isOwner(), "TwoStepOwnable: caller is not the owner.");
    _;
  }

  /**
   * @dev Returns true if the caller is the current owner.
   */
  function isOwner() public view returns (bool) {
    return msg.sender == _owner;
  }

  /**
   * @dev Allows a new account (`newOwner`) to accept ownership.
   * Can only be called by the current owner.
   */
  function transferOwnership(address newOwner) public onlyOwner {
    require(
      newOwner != address(0),
      "TwoStepOwnable: new potential owner is the zero address."
    );

    _newPotentialOwner = newOwner;
  }

  /**
   * @dev Cancel a transfer of ownership to a new account.
   * Can only be called by the current owner.
   */
  function cancelOwnershipTransfer() public onlyOwner {
    delete _newPotentialOwner;
  }

  /**
   * @dev Transfers ownership of the contract to the caller.
   * Can only be called by a new potential owner set by the current owner.
   */
  function acceptOwnership() public {
    require(
      msg.sender == _newPotentialOwner,
      "TwoStepOwnable: current owner must set caller as new potential owner."
    );

    delete _newPotentialOwner;

    emit OwnershipTransferred(_owner, msg.sender);

    _owner = msg.sender;
  }
}

contract EndaomentAdmin is IEndaomentAdmin, TwoStepOwnable {
  // Maintain a role status mapping with assigned accounts and paused states.
  mapping(uint256 => RoleStatus) private _roles;
  
  /**
   * @notice Set a new account on a given role and emit a `RoleModified` event
   * if the role holder has changed. Only the owner may call this function.
   * @param role The role that the account will be set for.
   * @param account The account to set as the designated role bearer.
   */
  function setRole(Role role, address account) public override onlyOwner {
    require(account != address(0), "Must supply an account.");
    _setRole(role, account);
  }

  /**
   * @notice Remove any current role bearer for a given role and emit a
   * `RoleModified` event if a role holder was previously set. Only the owner
   * may call this function.
   * @param role The role that the account will be removed from.
   */
  function removeRole(Role role) public override onlyOwner {
    _setRole(role, address(0));
  }
  
  /**
   * @notice Pause a currently unpaused role and emit a `RolePaused` event. Only
   * the owner or the designated pauser may call this function. Also, bear in
   * mind that only the owner may unpause a role once paused.
   * @param role The role to pause.
   */
  function pause(Role role) public override onlyAdminOr(Role.PAUSER) {
    RoleStatus storage storedRoleStatus = _roles[uint256(role)];
    require(!storedRoleStatus.paused, "Role in question is already paused.");
    storedRoleStatus.paused = true;
    emit RolePaused(role);
  }

  /**
   * @notice Unpause a currently paused role and emit a `RoleUnpaused` event.
   * Only the owner may call this function.
   * @param role The role to pause.
   */
  function unpause(Role role) public override onlyOwner {
    RoleStatus storage storedRoleStatus = _roles[uint256(role)];
    require(storedRoleStatus.paused, "Role in question is already unpaused.");
    storedRoleStatus.paused = false;
    emit RoleUnpaused(role);
  }
  
  /**
   * @notice External view function to check whether or not the functionality
   * associated with a given role is currently paused or not. The owner or the
   * pauser may pause any given role (including the pauser itself), but only the
   * owner may unpause functionality. Additionally, the owner may call paused
   * functions directly.
   * @param role The role to check the pause status on.
   * @return paused A boolean to indicate if the functionality associated with
   * the role in question is currently paused.
   */
  function isPaused(Role role) public override view returns (bool paused) {
    paused = _isPaused(role);
  }

  /**
   * @notice External view function to check whether the caller is the current
   * role holder.
   * @param role The role to check for.
   * @return hasRole A boolean indicating if the caller has the specified role.
   */
  function isRole(Role role) public override view returns (bool hasRole) {
    hasRole = _isRole(role);
  }

  /**
   * @notice External view function to check the account currently holding the
   * admin role. The admin can execute and cancel limit orders.
   * @return admin The address of the current admin, or the null
   * address if none is set.
   */
  function getAdmin() public override view returns (
    address admin
  ) {
    admin = _roles[uint256(Role.ADMIN)].account;
  }

  /**
   * @notice External view function to check the account currently holding the
   * pauser role. The pauser can pause any role from taking its standard action,
   * though the owner will still be able to call the associated function in the
   * interim and is the only entity able to unpause the given role once paused.
   * @return pauser The address of the current pauser, or the null address if
   * none is set.
   */
  function getPauser() public override view returns (address pauser) {
    pauser = _roles[uint256(Role.PAUSER)].account;
  }
  
  /**
   * @notice External view function to check the account currently holding the
   * accountant role.
   */
  function getAccountant() public override view returns (address accountant) {
    accountant = _roles[uint256(Role.ACCOUNTANT)].account;
  }
  
  /**
   * @notice External view function to check the account currently holding the
   * reviewer role.
   */
  function getReviewer() public override view returns (address reviewer) {
    reviewer = _roles[uint256(Role.REVIEWER)].account;
  }
  
  /**
   * @notice Private function to set a new account on a given role and emit a
   * `RoleModified` event if the role holder has changed.
   * @param role The role that the account will be set for.
   * @param account The account to set as the designated role bearer.
   */
  function _setRole(Role role, address account) private {
    RoleStatus storage storedRoleStatus = _roles[uint256(role)];

    if (account != storedRoleStatus.account) {
      storedRoleStatus.account = account;
      emit RoleModified(role, account);
    }
  }

  /**
   * @notice Private view function to check whether the caller is the current
   * role holder.
   * @param role The role to check for.
   * @return hasRole A boolean indicating if the caller has the specified role.
   */
  function _isRole(Role role) private view returns (bool hasRole) {
    hasRole = msg.sender == _roles[uint256(role)].account;
  }

  /**
   * @notice Private view function to check whether the given role is paused or
   * not.
   * @param role The role to check for.
   * @return paused A boolean indicating if the specified role is paused or not.
   */
  function _isPaused(Role role) private view returns (bool paused) {
    paused = _roles[uint256(role)].paused;
  }
  
    /**
   * @notice Modifier that throws if called by any account other than the owner
   * or the supplied role, or if the caller is not the owner and the role in
   * question is paused.
   * @param role The role to require unless the caller is the owner. Permitted
   * roles are bot commander (0) and pauser (1).
   */
  modifier onlyAdminOr(Role role) {
    if (!isOwner()) {
      require(_isRole(role), "Caller does not have a required role.");
      require(!_isPaused(role), "Role in question is currently paused.");
    }
    _;
  }

}


