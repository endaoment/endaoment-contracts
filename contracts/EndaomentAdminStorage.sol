// SPDX-License-Identifier: BSD 3-Clause

pragma solidity ^0.6.10;

import "./Administratable.sol";

// ENDAOMENT ADMIN STORAGE CONTRACT
/**
 * @title EndaomentAdminStorage
 * @author rheeger
 * @notice Stores the contract address of the EndaomentAdmin,
 * for use in references by the Org and Fund factories and
 * subsequently deployed Org and Fund contracts.
 */
contract EndaomentAdminStorage is Administratable {
  address public endaomentAdmin;
  event EndaomentAdminChanged(address indexed oldAddress, address indexed newAddress);

  /**
   * @notice Updates address of the endaomentAdmin contract and emits `EndaomentAdminChanged` event.
   * @param newAdmin New address of the endaomentAdmin contract
   */
  function updateEndaomentAdmin(address newAdmin) public onlyAdmin(endaomentAdmin) {
    // Validate that contract has a valid admin address set
    require(newAdmin != address(0), "EndaomentAdminStorage: New admin cannot be the zero address");
    EndaomentAdmin endaomentAdminContract = EndaomentAdmin(newAdmin);

    address admin = endaomentAdminContract.getRoleAddress(IEndaomentAdmin.Role.ADMIN);
    require(admin != address(0), "EndaomentAdminStorage: Admin cannot be the zero address");

    emit EndaomentAdminChanged(endaomentAdmin, newAdmin);
    endaomentAdmin = newAdmin;
  }
}
