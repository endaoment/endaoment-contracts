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
  event OrgAllowed(address indexed orgAddress);
  event OrgDisallowed(address indexed orgAddress);

  // ========== STATE VARIABLES==========
  
  mapping(address => bool) public allowedOrgs;

  // ========== CONSTRUCTOR ==========
  /**
   * @notice Create new Org Factory
   * @param adminContractAddress Address of EndaomentAdmin contract.
   */
  constructor(address adminContractAddress) public {
    require(adminContractAddress != address(0), "OrgFactory: Admin cannot be the zero address");
    endaomentAdmin = adminContractAddress;
    emit EndaomentAdminChanged(address(0), adminContractAddress);
  }

  // ========== Org Creation & Management ==========
  /**
   * @notice  Create new Org Contract
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

  // function allowOrg(address orgAddress)
  //   public
  //   onlyAdminOrRole(endaomentAdmin, IEndaomentAdmin.Role.ACCOUNTANT)
  //   {
  //     require(
  //       Org(orgAddress).taxId() != 0,
  //       "OrgFactory: Not a valid org."
  //     );
  //     require(
  //       allowedOrgs[orgAddress] == false,
  //       "OrgFactory: Org already allowed."
  //     );
  //     allowedOrgs[orgAddress] = true;
  //     emit OrgAllowed(orgAddress);
  //   }

  // function disallowOrg(address orgAddress)
  //   public
  //   onlyAdminOrRole(endaomentAdmin, IEndaomentAdmin.Role.ACCOUNTANT)
  //   {
  //     require(
  //       Org(orgAddress).taxId() != 0,
  //       "OrgFactory: Not a valid org."
  //     );
  //     require(
  //       allowedOrgs[orgAddress] == true,
  //       "OrgFactory: Org already disallowed."
  //     );
  //     allowedOrgs[orgAddress] = false;
  //     emit OrgDisallowed(orgAddress);
  //   } 
}
