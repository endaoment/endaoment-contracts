// SPDX-License-Identifier: BSD 3-Clause

pragma solidity ^0.6.10;

import "./Administratable.sol";
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
contract OrgFactory is Administratable {
// ========== STATE VARIABLES==========
    Org[] public deployedOrgs;
    mapping(address => bool) public allowedOrgs;
    event orgCreated(address indexed newAddress);

// ========== CONSTRUCTOR ==========        
    /**
    * @notice Create new Org Factory
    * @param adminContractAddress Address of EndaomentAdmin contract. 
    */
    constructor(address adminContractAddress) public onlyAdmin(adminContractAddress) {}

// ========== Org Creation & Management ==========
    /**
    * @notice  Create new Org Contract
    * @param ein The U.S. Tax Identification Number for the Organization
    * @param adminContractAddress Contract address for Endaoment Admin
    */
    function createOrg(uint ein, address adminContractAddress) public onlyAdminOrRole(adminContractAddress, IEndaomentAdmin.Role.ACCOUNTANT){
        Org newOrg = new Org(ein, adminContractAddress);
        deployedOrgs.push(newOrg);
        allowedOrgs[address(newOrg)] = true;
        emit orgCreated(address(newOrg));
    }

    /**
    * @notice Returns total number Org contracts created by the factory. 
    */
    function countDeployedOrgs() public view returns (uint) {
        return deployedOrgs.length;
    }

    /**
    * @notice Returns address of given index postiion in deployedOrgs[]. 
    * @param index Array position of requested org
    */
    function getDeployedOrg(uint index) public view returns (address) {
        return address(deployedOrgs[index]);
    }

    /**
    * @notice Returns boolean is provided address is present in allowedOrgs[]. 
    * @param Org address of the organization contract requested.
    */
    function getAllowedOrg(address Org) public view returns (bool){
        return allowedOrgs[Org];
    }
}
