// SPDX-License-Identifier: BSD 3-Clause

pragma solidity ^0.6.10;

import "./EndaomentAdmin.sol";

//ADMINISTRATABLE
/**
 * @title Administratable
 * @author rheeger
 * @notice Provides two modifiers allowing contracts administered
 * by the EndaomentAdmin contract to properly restrict method calls
 * based on the a given role. Also provides a utility function for
 * validating string input arguments.
 */
contract Administratable {
  /**
   * @notice onlyAdmin checks that the caller is the EndaomentAdmin
   * @param adminContractAddress is the supplied EndaomentAdmin contract address
   */
  modifier onlyAdmin(address adminContractAddress) {
    require(
      adminContractAddress != address(0),
      "Administratable: Admin must not be the zero address"
    );
    EndaomentAdmin endaomentAdmin = EndaomentAdmin(adminContractAddress);

    require(
      msg.sender == endaomentAdmin.getRoleAddress(IEndaomentAdmin.Role.ADMIN),
      "Administratable: only ADMIN can access."
    );
    _;
  }

  /**
   * @notice onlyAdminOrRole checks that the caller is either the Admin or the provided role.
   * @param adminContractAddress supplied EndaomentAdmin address
   * @param role The role to require unless the caller is the owner. Permitted
   * roles are ADMIN (6), ACCOUNTANT (2), REVIEWER (3), FUND_FACTORY (4) and ORG_FACTORY(5).
   */
  modifier onlyAdminOrRole(address adminContractAddress, IEndaomentAdmin.Role role) {
    _onlyAdminOrRole(adminContractAddress, role);
    _;
  }

  function _onlyAdminOrRole(address adminContractAddress, IEndaomentAdmin.Role role) private view {
    require(
      adminContractAddress != address(0),
      "Administratable: Admin must not be the zero address"
    );
    EndaomentAdmin endaomentAdmin = EndaomentAdmin(adminContractAddress);
    bool isAdmin = (msg.sender == endaomentAdmin.getRoleAddress(IEndaomentAdmin.Role.ADMIN));

    if (!isAdmin) {
      if (endaomentAdmin.isPaused(role)) {
        revert("Administratable: requested role is paused");
      }

      if (role == IEndaomentAdmin.Role.ACCOUNTANT) {
        require(
          msg.sender == endaomentAdmin.getRoleAddress(IEndaomentAdmin.Role.ACCOUNTANT),
          "Administratable: only ACCOUNTANT can access"
        );
      }
      if (role == IEndaomentAdmin.Role.REVIEWER) {
        require(
          msg.sender == endaomentAdmin.getRoleAddress(IEndaomentAdmin.Role.REVIEWER),
          "Administratable: only REVIEWER can access"
        );
      }
      if (role == IEndaomentAdmin.Role.FUND_FACTORY) {
        require(
          msg.sender == endaomentAdmin.getRoleAddress(IEndaomentAdmin.Role.FUND_FACTORY),
          "Administratable: only FUND_FACTORY can access"
        );
      }
      if (role == IEndaomentAdmin.Role.ORG_FACTORY) {
        require(
          msg.sender == endaomentAdmin.getRoleAddress(IEndaomentAdmin.Role.ORG_FACTORY),
          "Administratable: only ORG_FACTORY can access"
        );
      }
    }
  }

  /**
   @notice Checks that the caller is either a provided adress, admin or role.
   @param allowedAddress An exempt address provided that shall be allowed to proceed.  
   @param adminContractAddress The EndaomentAdmin contract address.
   @param role The desired IEndaomentAdmin.Role to check against.
    */
  modifier onlyAddressOrAdminOrRole(
    address allowedAddress,
    address adminContractAddress,
    IEndaomentAdmin.Role role
  ) {
    require(
      allowedAddress != address(0),
      "Administratable: Allowed address must not be the zero address"
    );

    bool isAllowed = (msg.sender == allowedAddress);

    if (!isAllowed) {
      _onlyAdminOrRole(adminContractAddress, role);
    }
    _;
  }

  /**
   * @notice Returns true if two strings are equal, false otherwise
   * @param s1 First string to compare
   * @param s2 Second string to compare
   */
  function isEqual(string memory s1, string memory s2) internal pure returns (bool) {
    return keccak256(abi.encodePacked(s1)) == keccak256(abi.encodePacked(s2));
  }
}
