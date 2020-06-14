// SPDX-License-Identifier: UNLICENSED
/*
ENDAOMENT V0.1 ORGANIZATION CONTRACTS: 
*/

pragma solidity 0.6.8;


// INTERFACES
interface EndaomentAdmin {
    enum Role {
    ADMIN,
    PAUSER,
    ACCOUNTANT,
    REVIEWER
    
  }
    struct RoleStatus {
    address account;
    bool paused;
  }
 
    function getAdmin() external view returns (address);
    function getAccountatnt() external view returns (address);
    function getReviewer() external view returns (address);
    function isPaused(Role role) external view returns (bool);
    
}

interface ERC20 {
    function balanceOf(address tokenOwner) external view returns (uint balance);
    function transfer(address to, uint tokens) external returns (bool success);
    event Transfer(address indexed from, address indexed to, uint tokens);
}

// LIBRARY 
library SafeMath {
  function add(uint256 a, uint256 b) internal pure returns (uint256) {
    uint256 c = a + b;
    require(c >= a, "SafeMath: addition overflow");

    return c;
  }

  function sub(uint256 a, uint256 b) internal pure returns (uint256) {
    require(b <= a, "SafeMath: subtraction overflow");

    return a - b;
  }

  function mul(uint256 a, uint256 b) internal pure returns (uint256) {
    if (a == 0) {
      return 0;
    }

    uint256 c = a * b;
    require(c / a == b, "SafeMath: multiplication overflow");

    return c;
  }

  function div(uint256 a, uint256 b) internal pure returns (uint256) {
    require(b > 0, "SafeMath: division by zero");
    return a / b;
  }
}

//ORG FACTORY CONTRACT
/**
 * @title OrgFactory
 * @author rheeger
 * @notice OrgFactory is a contract that allows the EndaomentAdmin to 
 * instantiate new Org contracts. It also provides for fetching of 
 * individual Org contract addresses as well as a list of all 
 * allowedOrgs. 
 */
contract OrgFactory {
    
    // ========== STATE VARIABLES==========

    Org[] public deployedOrgs;
    mapping(address => bool) public allowedOrgs;
    event orgCreated(address indexed newAddress);
    

    // ========== Admin Management ==========
    
        /**
         * @notice onlyAdmin checks that the caller is the EndaomentAdmin
         * @param adminContractAddress is the supplied EndaomentAdmin contract address
         */
        modifier onlyAdmin(address adminContractAddress) {
        EndaomentAdmin x = EndaomentAdmin(adminContractAddress);
            
        require(msg.sender == x.getAdmin());
        _;
        }
     
        /**
        * @notice onlyAdminOrRole checks that the caller is either the Admin or the provided role.
        * @param adminContractAddress supplied EndaomentAdmin address
        * @param role The role to require unless the caller is the owner. Permitted
        * roles are admin (0), accountant (2), and reviewer (3).
        */     
        modifier onlyAdminOrRole(address adminContractAddress, EndaomentAdmin.Role role) {
            EndaomentAdmin x = EndaomentAdmin(adminContractAddress);
            
            if (msg.sender != x.getAdmin()) {
                if (!x.isPaused(role)) {
                     if (role == EndaomentAdmin.Role.ACCOUNTANT ){
                         require(msg.sender == x.getAccountatnt());
                    }
                     if (role == EndaomentAdmin.Role.REVIEWER ){
                         require(msg.sender == x.getReviewer());
                     }
                }
                
            require(msg.sender == x.getAdmin());
          }
          _;
         }  
      
    // ========== CONSTRUCTOR ==========    
    
    /**
    * @notice Create new Org Factory
    * @param adminContractAddress Address of EndaomentAdmin contract. 
    */
    constructor(address adminContractAddress) public onlyAdmin(adminContractAddress){
        
    }


    // ========== Org Creation & Management ==========

    /**
    * @notice  Create new Org Contract
    * @param ein The U.S. Tax Identification Number for the Organization
    * @param adminContractAddress Contract address for Endaoment Admin
    */
    function createOrg(uint ein, address adminContractAddress) public onlyAdminOrRole(adminContractAddress, EndaomentAdmin.Role.ACCOUNTANT){
        Org newOrg = new Org(ein, adminContractAddress);
        deployedOrgs.push(newOrg);
        allowedOrgs[address(newOrg)] = true;
        emit orgCreated(address(newOrg));
    }

    function countDeployedOrgs() public view returns (uint) {
        return deployedOrgs.length;
    }

    function getDeployedOrg(uint index) public view returns (address) {
        return address(deployedOrgs[index-1]);
    }

    function getAllowedOrgs(address Org) public view returns (bool){
        return allowedOrgs[Org];
    }
}

//ORG CONTRACT
/**
 * @title Org
 * @author rheeger
 * @notice Org is a contract that serves as a smart wallet for US nonprofit
 * organizations. It holds the organization's federal Tax ID number as taxID, 
 * and allows for an address to submit a Claim struct to the contract whereby 
 * the organization can direct recieved grant awards from Endaoment Funds.
 */
contract Org {
    using SafeMath for uint256;

    // ========== STATE VARIABLES ==========
    
    struct Claim {
        string firstName;
        string lastName;
        string eMail;
        address desiredWallet;
        bool filesSubmitted;
    }

    uint public taxId;
    address public orgWallet;
    Claim[] public claims;
    event cashOutComplete(uint cashOutAmount);


    // ========== CONSTRUCTOR ==========    
    
    /**
    * @notice Create new Organization Contract
    * @param ein The U.S. Tax Identification Number for the Organization
    * @param adminContractAddress Contract Address for Endaoment Admin
    */
    constructor(uint ein, address adminContractAddress) public onlyAdminOrRole(adminContractAddress, EndaomentAdmin.Role.ACCOUNTANT){
        taxId = ein;
    }


    // ========== Admin Management ==========
    
        /**
         * @notice onlyAdmin checks that the caller is the EndaomentAdmin
         * @param adminContractAddress is the supplied EndaomentAdmin contract address
         */
        modifier onlyAdmin(address adminContractAddress) {
        EndaomentAdmin x = EndaomentAdmin(adminContractAddress);
            
        require(msg.sender == x.getAdmin());
        _;
        }
     
        /**
        * @notice onlyAdminOrRole checks that the caller is either the Admin or the provided role.
        * @param adminContractAddress supplied EndaomentAdmin address
        * @param role The role to require unless the caller is the owner. Permitted
        * roles are admin (0), accountant (2), and reviewer (3).
        */     
        modifier onlyAdminOrRole(address adminContractAddress, EndaomentAdmin.Role role) {
            EndaomentAdmin x = EndaomentAdmin(adminContractAddress);
            
            if (msg.sender != x.getAdmin()) {
                if (!x.isPaused(role)) {
                     if (role == EndaomentAdmin.Role.ACCOUNTANT ){
                         require(msg.sender == x.getAccountatnt());
                    }
                     if (role == EndaomentAdmin.Role.REVIEWER ){
                         require(msg.sender == x.getReviewer());
                     }
                }
                
            require(msg.sender == x.getAdmin());
          }
          _;
         }

    // ========== Org Management & Info ==========
    
    /**
     * @notice Create Organization Claim
     * @param  fName First name of Administrator
     * @param  lName Last name of Administrator
     * @param  fSub Information Submitted successfully.
     * @param  eMail Email contact for Organization Administrator.
     * @param  orgAdminAddress Wallet address of Organization's Administrator.
     */
    function claimRequest(string memory fName, string memory lName, bool fSub, string memory eMail, address orgAdminAddress) public {
        require (fSub == true);
        require (msg.sender == orgAdminAddress);
        
        Claim memory newClaim = Claim({
            firstName: fName,
            lastName: lName,
            eMail: eMail,
            desiredWallet: msg.sender,
            filesSubmitted: true
        });

        claims.push(newClaim);
    }

    /**
     * @notice Approving Organization Claim 
     * @param  index Index value of Claim.
     * @param adminContractAddress Contract Address for Endaoment Admin
     */
    function approveClaim(uint index, address adminContractAddress) public onlyAdminOrRole(adminContractAddress, EndaomentAdmin.Role.REVIEWER){
        Claim storage claim = claims[index]; 
        
        setOrgWallet(claim.desiredWallet, adminContractAddress);
    }

    /**
     * @notice Cashing out Organization Contract 
     * @param  desiredWithdrawlAddress Destination for withdrawl
     * @param tokenAddress Stablecoin address of desired token withdrawl
     * @param adminContractAddress Contract Address for Endaoment Admin
     */
    function cashOutOrg(address desiredWithdrawlAddress, address tokenAddress, address adminContractAddress) public onlyAdminOrRole(adminContractAddress, EndaomentAdmin.Role.ACCOUNTANT){
        ERC20 t = ERC20(tokenAddress);
        uint256 cashOutAmount = t.balanceOf(address(this));

        t.transfer(desiredWithdrawlAddress, cashOutAmount);
        emit cashOutComplete(cashOutAmount);
    }

    function setOrgWallet(address providedWallet, address adminContractAddress) public onlyAdminOrRole(adminContractAddress, EndaomentAdmin.Role.REVIEWER){
        orgWallet = providedWallet;
    }

     function getTokenBalance(address tokenAddress) public view returns (uint) {
            ERC20 t = ERC20(tokenAddress);
            uint256 bal = t.balanceOf(address(this));

        return bal;
     }

       function getClaimsCount() public view returns (uint) {
        return claims.length;
    }

}