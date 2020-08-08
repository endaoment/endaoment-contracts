// SPDX-License-Identifier: BSD 3-Clause

pragma solidity ^0.6.10;

import "./EndaomentAdminStorage.sol";
import "./Fund.sol";

// FUND FACTORY CONTRACT
/**
 * @title FundFactory
 * @author rheeger
 * @notice FundFactory is a contract that allows the Endaoment ADMIN or ACCOUNTANT to
 * instantiate new Fund contracts.
 */
contract FundFactory is EndaomentAdminStorage {
  // ========== EVENTS ==========
  event FundCreated(address indexed newAddress);

  // ========== CONSTRUCTOR ==========
  /**
   * @notice Create new Fund Factory
   * @param adminContractAddress Address of EndaomentAdmin contract.
   */
  constructor(address adminContractAddress) public {
    require(adminContractAddress != address(0), "FundFactory: Admin cannot be the zero address");
    endaomentAdmin = adminContractAddress;
    emit EndaomentAdminChanged(address(0), adminContractAddress);
  }

  // ========== Fund Creation & Management ==========
  /**
   * @notice Creates new Fund and emits FundCreated event.
   * @param managerAddress The address of the Fund's Primary Advisor
   */
  function createFund(address managerAddress)
    public
    onlyAdminOrRole(endaomentAdmin, IEndaomentAdmin.Role.ACCOUNTANT)
  {
    require(managerAddress != address(0), "FundFactory: Manager cannot be the zero address");
    Fund newFund = new Fund(managerAddress, address(this));
    emit FundCreated(address(newFund));
  }
}
