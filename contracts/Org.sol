// SPDX-License-Identifier: BSD 3-Clause

pragma solidity ^0.6.10;

import "./Administratable.sol";

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";

//ORG CONTRACT
/**
 * @title Org
 * @author rheeger
 * @notice Org is a contract that serves as a smart wallet for US nonprofit
 * organizations. It holds the organization's federal Tax ID number as taxID,
 * and allows for an address to submit a Claim struct to the contract whereby
 * the organization can directly receive grant awards from Endaoment Funds.
 */
contract Org is Administratable {
  using SafeMath for uint256;

  // ========== STATE VARIABLES ==========

  struct Claim {
    string firstName;
    string lastName;
    string eMail;
    address desiredWallet;
    bool filesSubmitted;
  }

  uint256 public taxId;
  address public orgWallet;
  Claim[] public claims;
  event CashOutComplete(uint256 cashOutAmount);

  // ========== CONSTRUCTOR ==========

  /**
   * @notice Create new Organization Contract
   * @param ein The U.S. Tax Identification Number for the Organization
   * @param adminContractAddress Contract Address for Endaoment Admin
   */
  constructor(uint256 ein, address adminContractAddress)
    public
    onlyAdminOrRole(adminContractAddress, IEndaomentAdmin.Role.ORG_FACTORY)
  {
    taxId = ein;
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
  function claimRequest(
    string memory fName,
    string memory lName,
    bool fSub,
    string memory eMail,
    address orgAdminAddress
  ) public {
    require(fSub == true, "Org: Information was not submitted successfully.");
    require(msg.sender == orgAdminAddress, "Org: Only callable by organization's administrator.");

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
  function approveClaim(uint256 index, address adminContractAddress)
    public
    onlyAdminOrRole(adminContractAddress, IEndaomentAdmin.Role.REVIEWER)
  {
    Claim storage claim = claims[index];
    orgWallet = claim.desiredWallet;
  }

  /**
   * @notice Cashing out Organization Contract
   * @param  desiredWithdrawalAddress Destination for withdrawal
   * @param tokenAddress Stablecoin address of desired token withdrawal
   * @param adminContractAddress Contract Address for Endaoment Admin
   */
  function cashOutOrg(
    address desiredWithdrawalAddress,
    address tokenAddress,
    address adminContractAddress
  ) public onlyAdminOrRole(adminContractAddress, IEndaomentAdmin.Role.ACCOUNTANT) {
    ERC20 tokenContract = ERC20(tokenAddress);
    uint256 cashOutAmount = tokenContract.balanceOf(address(this));

    tokenContract.transfer(desiredWithdrawalAddress, cashOutAmount);
    emit CashOutComplete(cashOutAmount);
  }

  /**
   * @notice Retrieves Token Balance of Org Contract
   * @param tokenAddress Address of desired token to query for balance
   * @return Balance of conract in token base unit of provided tokenAddress  
   */  
  function getTokenBalance(address tokenAddress) public view returns (uint256) {
    ERC20 tokenContract = ERC20(tokenAddress);
    uint256 balance = tokenContract.balanceOf(address(this));

    return balance;
  }

  /**
   * @notice Retrieves Count of Claims Made 
   * @return Length of Claims[] as uint  
   */
  function getClaimsCount() public view returns (uint256) {
    return claims.length;
  }
}
