// SPDX-License-Identifier: BSD 3-Clause

pragma solidity ^0.6.10;

import "./EndaomentAdminStorage.sol";
import "./Org.sol";

//ORG FACTORY CONTRACT
/**
 * @title OrgFactory
 * @author rheeger
 * @notice OrgFactory is a contract that allows the EndaomentAdmin to
 * instantiate new Org contracts. It also provides for fetching of
 * individual Org contract addresses as well as a list of all
 * allowedOrgs.
 */
contract OrgFactory is EndaomentAdminStorage {
  // ========== EVENTS===================

  event OrgCreated(address indexed newAddress);
  event OrgStatusChanged(address indexed orgAddress, bool indexed isAllowed);

  // ========== STATE VARIABLES==========

  mapping(address => bool) public allowedOrgs;

  // ========== CONSTRUCTOR ==========
  /**
   * @notice Creates new Org Factory and emits a `EndaomentAdminChanged` event
   * @param adminContractAddress Address of EndaomentAdmin contract.
   */
  constructor(address adminContractAddress) public {
    require(adminContractAddress != address(0), "OrgFactory: Admin cannot be the zero address");
    endaomentAdmin = adminContractAddress;
    emit EndaomentAdminChanged(address(0), adminContractAddress);
  }

  // ========== Org Creation & Management ==========
  /**
   * @notice Creates new Org Contract and emits a `OrgCreated` event
   * @param ein The U.S. Tax Identification Number for the Organization
   */
  function createOrg(uint256 ein)
    public
    onlyAdminOrRole(endaomentAdmin, IEndaomentAdmin.Role.ACCOUNTANT)
  {
    Org newOrg = new Org(ein, address(this));
    allowedOrgs[address(newOrg)] = true;
    emit OrgCreated(address(newOrg));
  }

  /**
   * @notice Toggles whether Org is allowed and emits a `OrgStatusChanged` event
   * @param orgAddress THe address of the Org contract.
   */
  function toggleOrg(address orgAddress)
    public
    onlyAdminOrRole(endaomentAdmin, IEndaomentAdmin.Role.REVIEWER)
  {
    require(Org(orgAddress).taxId() != 0, "OrgFactory: Not a valid org.");
    allowedOrgs[orgAddress] = !allowedOrgs[orgAddress];
    emit OrgStatusChanged(orgAddress, allowedOrgs[orgAddress]);
  }
}
