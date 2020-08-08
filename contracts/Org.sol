// SPDX-License-Identifier: BSD 3-Clause

pragma solidity ^0.6.10;
pragma experimental ABIEncoderV2;

import "./Administratable.sol";
import "./IFactory.sol";
import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/token/ERC20/SafeERC20.sol";

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

  // ========== STRUCTS & EVENTS ==========

  struct Claim {
    string firstName;
    string lastName;
    string eMail;
    address desiredWallet;
  }
  event CashOutComplete(uint256 cashOutAmount);
  event ClaimCreated(string claimId, Claim claim);
  event ClaimApproved(string claimId, Claim claim);
  event ClaimRejected(string claimId, Claim claim);

  // ========== STATE VARIABLES ==========
  
  IFactory public orgFactoryContract;
  uint256 public taxId;
  mapping(string => Claim) public pendingClaims; // claim UUID to Claim
  Claim public activeClaim;

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
    orgFactoryContract = IFactory(orgFactory);
  }

  // ========== Org Management & Info ==========

  /**
   * @notice Create Organization Claim
   * @param  claimId UUID representing this claim
   * @param  fName First name of Administrator
   * @param  lName Last name of Administrator
   * @param  eMail Email contact for Organization Administrator.
   * @param  orgAdminWalletAddress Wallet address of Organization's Administrator.
   */
  function claimRequest(
    string calldata claimId,
    string calldata fName,
    string calldata lName,
    string calldata eMail,
    address orgAdminWalletAddress
  ) public {
    require(!isEqual(claimId, ""), "Org: Must provide claimId");
    require(!isEqual(fName, ""), "Org: Must provide the first name of the administrator");
    require(!isEqual(lName, ""), "Org: Must provide the last name of the administrator");
    require(!isEqual(eMail, ""), "Org: Must provide the email address of the administrator");
    require(orgAdminWalletAddress != address(0), "Org: Wallet address cannot be the zero address");
    require(
      pendingClaims[claimId].desiredWallet == address(0),
      "Org: Pending Claim with Id already exists"
    );

    Claim memory newClaim = Claim({
      firstName: fName,
      lastName: lName,
      eMail: eMail,
      desiredWallet: orgAdminWalletAddress
    });

    emit ClaimCreated(claimId, newClaim);
    pendingClaims[claimId] = newClaim;
  }

  /**
   * @notice Approving Organization Claim
   * @param claimId UUID of the claim being approved
   */
  function approveClaim(string calldata claimId)
    public
    onlyAdminOrRole(orgFactoryContract.endaomentAdmin(), IEndaomentAdmin.Role.REVIEWER)
  {
    require(!isEqual(claimId, ""), "Fund: Must provide a claimId");
    Claim storage claim = pendingClaims[claimId];
    require(claim.desiredWallet != address(0),
      "Org: claim does not exist"
    );
    emit ClaimApproved(claimId, claim);
    activeClaim = claim;
    delete pendingClaims[claimId];
  }

  /**
   * @notice Rejecting Organization Claim
   * @param claimId UUID of the claim being rejected
   */
  function rejectClaim(string calldata claimId)
    public
    onlyAdminOrRole(orgFactoryContract.endaomentAdmin(), IEndaomentAdmin.Role.REVIEWER)
  {
    require(!isEqual(claimId, ""), "Fund: Must provide a claimId");
    Claim storage claim = pendingClaims[claimId];
    require(claim.desiredWallet != address(0),
      "Org: claim does not exist"
    );

    emit ClaimRejected(claimId, claim);

    delete pendingClaims[claimId];
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
    address payoutAddr = orgWallet();
    require(payoutAddr != address(0), "Org: Cannot cashout unclaimed Org");

    IERC20 tokenContract = IERC20(tokenAddress);
    uint256 cashOutAmount = tokenContract.balanceOf(address(this));

    tokenContract.safeTransfer(orgWallet(), cashOutAmount);
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
   * @notice Org Wallet convenience accessor
   * @return The wallet specified in the active, approved claim
   */
  function orgWallet() public view returns (address) {
    return activeClaim.desiredWallet;
  }
}
