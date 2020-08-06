// SPDX-License-Identifier: BSD 3-Clause

pragma solidity ^0.6.10;
pragma experimental ABIEncoderV2;

import "./Administratable.sol";
import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/token/ERC20/SafeERC20.sol";

interface IOrgFactory {
  function endaomentAdmin() external view returns (address);
}

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
  using SafeERC20 for IERC20;
  // ========== STATE VARIABLES ==========

  struct Claim {
    string firstName;
    string lastName;
    string eMail;
    address desiredWallet;
    bool filesSubmitted;
  }

  IOrgFactory public orgFactoryContract;
  uint256 public taxId;
  address public orgWallet;
  Claim[] public claims;

  event CashOutComplete(uint256 cashOutAmount);
  event ClaimCreated(Claim claim);
  event ClaimApproved(Claim claim);

  // ========== CONSTRUCTOR ==========

  /**
   * @notice Create new Organization Contract
   * @param ein The U.S. Tax Identification Number for the Organization
   * @param orgFactory Address of the Factory contract.
   */
  constructor(uint256 ein, address orgFactory) public {
    require(ein >= 10000000 && ein <= 999999999, "Org: Must provide a valid EIN");
    require(orgFactory != address(0), "Org: Factory cannot be null address.");
    taxId = ein;
    orgFactoryContract = IOrgFactory(orgFactory);
  }

  // ========== Org Management & Info ==========

  /**
   * @notice Create Organization Claim
   * @param  fName First name of Administrator
   * @param  lName Last name of Administrator
   * @param  eMail Email contact for Organization Administrator.
   * @param  orgAdminWalletAddress Wallet address of Organization's Administrator.
   */
  function claimRequest(
    string memory fName,
    string memory lName,
    string memory eMail,
    address orgAdminWalletAddress
  ) public {
    require(!isEqual(fName, ""), "Org: Must provide the first name of the administrator");
    require(!isEqual(lName, ""), "Org: Must provide the last name of the administrator");
    require(!isEqual(eMail, ""), "Org: Must provide the email address of the administrator");
    require(orgAdminWalletAddress != address(0), "Org: Wallet address cannot be the zero address");
    Claim memory newClaim = Claim({
      firstName: fName,
      lastName: lName,
      eMail: eMail,
      desiredWallet: orgAdminWalletAddress,
      filesSubmitted: true
    });
    emit ClaimCreated(newClaim);
    claims.push(newClaim);
  }

  /**
   * @notice Approving Organization Claim
   * @param  index Index value of Claim.
   */
  function approveClaim(uint256 index)
    public
    onlyAdminOrRole(orgFactoryContract.endaomentAdmin(), IEndaomentAdmin.Role.REVIEWER)
  {
    require(index < claims.length, "Org: Index out of range");
    Claim storage claim = claims[index];
    emit ClaimApproved(claim);
    orgWallet = claim.desiredWallet;
  }

  /**
   * @notice Cashing out Organization Contract
   * @param tokenAddress Stablecoin address of desired token withdrawal
   */
  function cashOutOrg(address tokenAddress)
    public
    onlyAdminOrRole(orgFactoryContract.endaomentAdmin(), IEndaomentAdmin.Role.ACCOUNTANT)
  {
    require(tokenAddress != address(0), "Org: Token address cannot be the zero address");
    IERC20 tokenContract = IERC20(tokenAddress);
    uint256 cashOutAmount = tokenContract.balanceOf(address(this));

    tokenContract.safeTransfer(orgWallet, cashOutAmount);
    emit CashOutComplete(cashOutAmount);
  }

  /**
   * @notice Retrieves Token Balance of Org Contract
   * @param tokenAddress Address of desired token to query for balance
   * @return Balance of conract in token base unit of provided tokenAddress
   */

  function getTokenBalance(address tokenAddress) external view returns (uint256) {
    IERC20 tokenContract = IERC20(tokenAddress);
    uint256 balance = tokenContract.balanceOf(address(this));

    return balance;
  }

  /**
   * @notice Retrieves Count of Claims Made
   * @return Length of Claims[] as uint
   */
  function getClaimsCount() external view returns (uint256) {
    return claims.length;
  }
}
