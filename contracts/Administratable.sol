// SPDX-License-Identifier: UNLICENSED

pragma solidity ^0.6.10;

import "./EndaomentAdmin.sol";

contract Administratable {

    // ========== Admin Management ==========
        /**
         * @notice onlyAdmin checks that the caller is the EndaomentAdmin
         * @param adminContractAddress is the supplied EndaomentAdmin contract address
         */
        modifier onlyAdmin(address adminContractAddress) {
            EndaomentAdmin x = EndaomentAdmin(adminContractAddress);
            
            require(msg.sender == x.getAdmin(), "Only admins can access.");
            _;
        }
     
        /**
        * @notice onlyAdminOrRole checks that the caller is either the Admin or the provided role.
        * @param adminContractAddress supplied EndaomentAdmin address
        * @param role The role to require unless the caller is the owner. Permitted
        * roles are admin (0), accountant (2), and reviewer (3).
        */     
        modifier onlyAdminOrRole(address adminContractAddress, IEndaomentAdmin.Role role) {
            EndaomentAdmin x = EndaomentAdmin(adminContractAddress);
            
            if (msg.sender != x.getAdmin()) {
                if (!x.isPaused(role)) {
                     if (role == IEndaomentAdmin.Role.ACCOUNTANT ){
                         require(msg.sender == x.getAccountant());
                    }
                     if (role == IEndaomentAdmin.Role.REVIEWER ){
                         require(msg.sender == x.getReviewer());
                     }
                } else {
                    require(msg.sender == x.getAdmin());
                }
          }
          _;
         }
}
