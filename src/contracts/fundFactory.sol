// SPDX-License-Identifier: UNLICENSED
/*
ENDAOMENT V0.1 DONOR-ADVISED FUND CONTRACTS: 
*/

pragma solidity 0.6.8;


// INTERFACES
interface OrgFactory {
    function getAllowedOrgs(address recipient) external view returns (bool);
}

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


// FUND FACTORY CONTRACT
/**
 * @title FundFactory
 * @author rheeger
 * @notice FundFactory is a contract that allows the EndaomentAdmin to 
 * instantiate new Fund contracts. It also provides for fetching of 
 * individual Org contract addresses as well as a list of all 
 * allowedOrgs. 
 */
contract FundFactory {
    
    // ========== STATE VARIABLES ==========
    
    Fund[] public createdFunds;
    event fundCreated(address indexed newAddress);
    
    
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
    function createFund(address managerAddress, address adminContractAddress) public onlyAdminOrRole(adminContractAddress, EndaomentAdmin.Role.ACCOUNTANT){
        Fund newFund = new Fund(managerAddress);
        createdFunds.push(newFund);
        emit fundCreated(address(newFund));
    }

    function countFunds() public view returns (uint) {
        return createdFunds.length;
    }

    function getFund(uint index) public view returns (address) {
        return address(createdFunds[index-1]); 
    }

}



// FUND CONTRACT
/**
 * @title Fund
 * @author rheeger
 * @notice Fund is a contract that serves as an on-chain US Donor-Advised Fund.
 * It holds the proceeds of gifted cryptocurrency as ERC20 tokens, 
 * and allows for the manager to submit Grant reccomendations to the contract. 
 * The EndaomentAdmin can then chose to approve the Grant reccomendation, triggering
 * a SafeMath transfer of a 1% fee to the EndaomentAdmin and the remainder to the 
 * recipient Org contract.
 */
contract Fund {
    using SafeMath for uint256;

    // ========== STATE VARIABLES ==========
    
    struct Grant {
        string description;
        uint value;
        address recipient;
        bool complete;
    }
    
    address public manager;
    address public admin;
    mapping(address => bool) public contributors;
    Grant[] public grants;
    uint public totalContributors;


    // ========== CONSTRUCTOR ==========    
    
        /**
        * @notice Create new Fund
        * @param creator Address of the Fund's Primary Advisor
        */
        constructor(address creator) public {
            manager = creator;
    
        }
    

    // ========== Admin Management ==========
    
        modifier restricted() {
        require(msg.sender == manager);
        _;
        }
        
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
    
        
    // ========== Fund Management & Info ==========
    
    /**
     * @notice Change Fund Primary Advisor
     * @param  newManager The address of the new PrimaryAdvisor.
     * @param  adminContractAddress Address of the EndaomentAdmin contract. 
     */
    function changeManager (address newManager, address adminContractAddress) public onlyAdminOrRole(adminContractAddress, EndaomentAdmin.Role.REVIEWER){
        manager = newManager;
    }

    function checkRecipient(address recipient, address orgFactoryContractAddress) public view returns (bool) {
        OrgFactory x = OrgFactory ( orgFactoryContractAddress );
    
        return x.getAllowedOrgs(recipient);

    }

     function getSummary(address tokenAddress) public view returns (uint, uint, uint, address) {
            ERC20 t = ERC20(tokenAddress);
            uint bal = t.balanceOf(address(this));

        return (
            bal,
            address(this).balance,
            grants.length,
            manager
        );
    }
    
    /**
     * @notice Create new Grant Reccomendation
     * @param  description The address of the Owner.
     * @param  value The value of the grant in base units.
     * @param  recipient The address of the recieving organization's contract.
     * @param  orgFactoryContractAddress Address of the orgFactory Contract.
     */
    function createGrant(string memory description, uint256 value, address recipient, address orgFactoryContractAddress) public restricted {
        require(checkRecipient(recipient, orgFactoryContractAddress) == true);

        Grant memory newGrant = Grant({
            description: description,
            value: value,
            recipient: recipient,
            complete: false
        });

        grants.push(newGrant);
    }

    /**
     * @notice Approve Grant Reccomendation
     * @param  index This Grant's index position
     * @param  tokenAddress The stablecoin's token address. 
     * @param  adminContractAddress Address of the EndaomentAdmin contract. 
     */
    function finalizeGrant(uint index, address tokenAddress, address adminContractAddress) public onlyAdminOrRole(adminContractAddress, EndaomentAdmin.Role.ACCOUNTANT){
        EndaomentAdmin x = EndaomentAdmin(adminContractAddress);
        admin = x.getAdmin();
        Grant storage grant = grants[index];
        require(grant.complete == false);
        ERC20 t = ERC20(tokenAddress);
        
        

        //Process fees:
        uint256 fee = (grant.value)/100;
        uint256 finalGrant = (grant.value * 99)/100;
        t.transfer(admin, fee);
        
        t.transfer(grant.recipient, finalGrant);

        grant.complete = true;
    }


    function getGrantsCount() public view returns (uint) {
        return grants.length;
    }
}