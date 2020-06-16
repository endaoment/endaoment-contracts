// SPDX-License-Identifier: UNLICENSED
/*
ENDAOMENT V0.1 DONOR-ADVISED FUND CONTRACTS: 
*/

pragma solidity ^0.6.10;


import "./Administratable.sol";
import "./OrgFactory.sol";
import "./libraries/SafeMath.sol";
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
    event fundCreated(address indexed newAddress);
    
    
     
    // ========== CONSTRUCTOR ==========    
    
    /**
    * @notice Create new Fund Factory
    * @param adminContractAddress Address of EndaomentAdmin contract. 
    */
    constructor(address adminContractAddress) public onlyAdmin(adminContractAddress) {
        
    }
        
    // ========== Fund Creation & Management ==========

    /**
    * @notice  Create new Fund
    * @param managerAddress The address of the Fund's Primary Advisor
    * @param adminContractAddress Address of EndaomentAdmin contract. 
    */
    function createFund(address managerAddress, address adminContractAddress) public onlyAdminOrRole(adminContractAddress, IEndaomentAdmin.Role.ACCOUNTANT)
                                                                              returns (address) {
        Fund newFund = new Fund(managerAddress);
        createdFunds.push(newFund);
        emit fundCreated(address(newFund));
        return address(newFund);
    }

    function countFunds() public view returns (uint) {
        return createdFunds.length;
    }

    function getFund(uint index) public view returns (address) {
        return address(createdFunds[index-1]); 
    }

}



