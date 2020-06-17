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
            EndaomentAdmin endaomentAdmin = EndaomentAdmin(adminContractAddress);
            
            require(msg.sender == endaomentAdmin.getAdmin(), "Only ADMIN can access.");
            _;
        }
     
        /**
        * @notice onlyAdminOrRole checks that the caller is either the Admin or the provided role.
        * @param adminContractAddress supplied EndaomentAdmin address
        * @param role The role to require unless the caller is the owner. Permitted
        * roles are admin (0), accountant (2), and reviewer (3).
        */     
        modifier onlyAdminOrRole(address adminContractAddress, IEndaomentAdmin.Role role) {
            EndaomentAdmin endaomentAdmin = EndaomentAdmin(adminContractAddress);
            
            if (msg.sender != endaomentAdmin.getAdmin()) {
                if (!endaomentAdmin.isPaused(role)) {
                     if (role == IEndaomentAdmin.Role.ACCOUNTANT ){
                         require(msg.sender == endaomentAdmin.getAccountant(), "Only ACCOUNTANT can access");
                    }
                     if (role == IEndaomentAdmin.Role.REVIEWER ){
                         require(msg.sender == endaomentAdmin.getReviewer(), "Only REVIEWER can access");
                     }
                     if (role == IEndaomentAdmin.Role.FUND_FACTORY ){
                         require(msg.sender == endaomentAdmin.getFundFactory(), "Only FUND_FACTORY can access");
                     }
                     if (role == IEndaomentAdmin.Role.ORG_FACTORY ){
                         require(msg.sender == endaomentAdmin.getOrgFactory(), "Only ORG_FACTORY can access");
                     }
                } else {
                    require(msg.sender == endaomentAdmin.getAdmin(), "Only ADMIN can access");
                }
          }
          _;
         }
}
