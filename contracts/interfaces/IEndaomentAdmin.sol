// SPDX-License-Identifier: BSD 3-Clause

pragma solidity ^0.6.10;

/**
 * @dev Interface of the EndaomentAdmin contract
 */
interface IEndaomentAdmin {
  event RoleModified(Role indexed role, address account);
  event RolePaused(Role indexed role);
  event RoleUnpaused(Role indexed role);

  enum Role {
    EMPTY,
    PAUSER,
    ACCOUNTANT,
    REVIEWER,
    FUND_FACTORY,
    ORG_FACTORY,
    ADMIN
  }

  struct RoleStatus {
    address account;
    bool paused;
  }

  function setRole(Role role, address account) external;

  function removeRole(Role role) external;

  function pause(Role role) external;

  function unpause(Role role) external;

  function isPaused(Role role) external view returns (bool);

  function isRole(Role role) external view returns (bool);

  function getRoleAddress(Role role) external view returns (address);
}
