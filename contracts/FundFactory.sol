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
  address public endaomentAdmin;
  Fund[] public createdFunds;
  event FundCreated(address indexed newAddress);
  event EndaomentAdminChanged(address indexed oldAddress, address indexed newAddress);

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

  /**
   * @notice Update address of the endaomentAdmin contract
   * @param newAdmin New address of the endaomentAdmin contract
   */
  function updateEndaomentAdmin(address newAdmin) public onlyAdmin(endaomentAdmin) {
    // Validate that contract has a valid admin address set
    require(newAdmin != address(0), "FundFactory: New admin cannot be the zero address");
    EndaomentAdmin endaomentAdminContract = EndaomentAdmin(newAdmin);
    address admin = endaomentAdminContract.getRoleAddress(IEndaomentAdmin.Role.ADMIN);
    require(admin != address(0), "FundFactory: Admin cannot be the zero address");

    emit EndaomentAdminChanged(endaomentAdmin, newAdmin);
    endaomentAdmin = newAdmin;
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
    createdFunds.push(newFund);
    emit FundCreated(address(newFund));
  }

  /**
   * @notice Returns total number of funds created by the factory.
   */
  function countFunds() external view returns (uint256) {
    return createdFunds.length;
  }
}
