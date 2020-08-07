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
  // ========== STATE VARIABLES==========
  Org[] public deployedOrgs;
  mapping(address => bool) public allowedOrgs;

  event OrgCreated(address indexed newAddress);
  event OrgDisallowed(address indexed orgAddress);

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
    deployedOrgs.push(newOrg);
    allowedOrgs[address(newOrg)] = true;
    emit OrgCreated(address(newOrg));
  }

  function disallowOrg(address orgAddress)
    public
    onlyAdminOrRole(endaomentAdmin, IEndaomentAdmin.Role.ACCOUNTANT)
    {
      require(
        allowedOrgs[orgAddress] == true,
        "OrgFactory: Org already disallowed."
      );
      allowedOrgs[orgAddress] = false;
      emit OrgDisallowed(orgAddress);
    } 

  /**
   * @notice Returns total number Org contracts created by the factory.
   */
  function countDeployedOrgs() external view returns (uint256) {
    return deployedOrgs.length;
  }
}
