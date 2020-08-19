// SPDX-License-Identifier: BSD 3-Clause

pragma solidity ^0.6.10;

import "./EndaomentAdminStorage.sol";
import "./Org.sol";
import "./ProxyFactory.sol";

//ORG FACTORY CONTRACT
/**
 * @title OrgFactory
 * @author rheeger
 * @notice OrgFactory is a contract that allows the EndaomentAdmin to
 * instantiate new Org contracts. It also provides for fetching of
 * individual Org contract addresses as well as a list of all
 * allowedOrgs.
 */
contract OrgFactory is ProxyFactory, EndaomentAdminStorage {
  // ========== EVENTS===================

  event OrgCreated(address indexed newAddress);
  event OrgStatusChanged(address indexed orgAddress, bool indexed isAllowed);
  event OrgLogicDeployed(address logicAddress);

  // ========== STATE VARIABLES==========

  mapping(address => bool) public allowedOrgs;
  address public immutable orgLogic; // logic template for all Org contracts

  // ========== CONSTRUCTOR ==========
  /**
   * @notice Creates new Org Factory and emits a `EndaomentAdminChanged` event
   * @param adminContractAddress Address of EndaomentAdmin contract.
   */
  constructor(address adminContractAddress) public {
    // Set endaoment admin
    require(adminContractAddress != address(0), "OrgFactory: Admin cannot be the zero address");
    endaomentAdmin = adminContractAddress;
    emit EndaomentAdminChanged(address(0), adminContractAddress);

    // Deploy and initialize Org logic contract (used to deploy minimal proxies in createOrg)
    // We set the EIN to 999999999, since it is unlikely to be a real EIN. Even if it is a real
    // EIN, that is ok because (1) there is no check against duplicate EINs, and (2) this instance
    // is not used as anything other than a logic template, so the EIN value doesn't matter
    Org orgLogicContract = new Org();
    orgLogicContract.initializeOrg(999999999, address(this));

    // Save off address so we can reference for all future deployments
    orgLogic = address(orgLogicContract);
    emit OrgLogicDeployed(address(orgLogicContract));
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
    require(ein >= 10000000 && ein <= 999999999, "Org: Must provide a valid EIN");
    bytes memory payload = abi.encodeWithSignature(
      "initializeOrg(uint256,address)",
      ein,
      address(this)
    );
    address newOrg = deployMinimal(orgLogic, payload);

    allowedOrgs[newOrg] = true;
    emit OrgCreated(newOrg);
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
