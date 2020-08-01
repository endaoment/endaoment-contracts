// SPDX-License-Identifier: BSD 3-Clause

pragma solidity ^0.6.10;

import "./Administratable.sol";
import "./Fund.sol";

// FUND FACTORY CONTRACT
/**
 * @title FundFactory
 * @author rheeger
 * @notice FundFactory is a contract that allows the EndaomentAdmin to
 * instantiate new Fund contracts. It also provides for fetching of
 * individual Org contract addresses as well as a list of all
 * allowedOrgs.
 */
contract FundFactory is Administratable {
  // ========== STATE VARIABLES ==========
  Fund[] public createdFunds;
  event FundCreated(address indexed newAddress);

  // ========== CONSTRUCTOR ==========
  /**
   * @notice Create new Fund Factory
   * @param adminContractAddress Address of EndaomentAdmin contract.
   */
  constructor(address adminContractAddress) public onlyAdmin(adminContractAddress) {}

  // ========== Fund Creation & Management ==========
  /**
   * @notice Creates new Fund and emits FundCreated event.
   * @param managerAddress The address of the Fund's Primary Advisor
   * @param adminContractAddress Address of EndaomentAdmin contract.
   */
  function createFund(address managerAddress, address adminContractAddress)
    public
    onlyAdminOrRole(adminContractAddress, IEndaomentAdmin.Role.ACCOUNTANT)
  {
    Fund newFund = new Fund(managerAddress, adminContractAddress);
    createdFunds.push(newFund);
    emit FundCreated(address(newFund));
  }

  /**
   * @notice Returns total number of funds created by the factory.
   */
  function countFunds() public view returns (uint256) {
    return createdFunds.length;
  }

  /**
   * @notice Returns address of a specific fund in createdFunds[]
   * @param index The index position of the Fund
   */
  function getFund(uint256 index) public view returns (address) {
    return address(createdFunds[index]);
  }
}
