// SPDX-License-Identifier: UNLICENSED

pragma solidity ^0.6.10;

interface IEndaomentAdmin {
  event RoleModified(Role indexed role, address account);
  event RolePaused(Role indexed role);
  event RoleUnpaused(Role indexed role);

  enum Role {
    ADMIN,
    PAUSER,
    ACCOUNTANT,
    REVIEWER,
    FUND_FACTORY,
    ORG_FACTORY
  }

  struct RoleStatus {
    address account;
    bool paused;
  }
  
  function setRole(Role role, address account) external;
  function removeRole(Role role) external;
  function pause(Role role) external;
  function unpause(Role role) external;
  function isPaused(Role role) external view returns (bool paused);
  function isRole(Role role) external view returns (bool hasRole);
  function getAdmin() external view returns (address admin);
  function getPauser() external view returns (address pauser);
  function getAccountant() external view returns (address accountant);
  function getReviewer() external view returns (address reviewer);
  function getFundFactory() external view returns (address fundFactory);
  function getOrgFactory() external view returns (address orgFactory);
}
