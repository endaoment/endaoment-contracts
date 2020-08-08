## Contract: `Org.sol`
Org is a contract that serves as a smart wallet for US nonprofit
organizations. It holds the organization's federal Tax ID number as taxID,
and allows for an address to submit a Claim struct to the contract whereby
the organization can directly receive grant awards from Endaoment Funds.



## Methods
### `constructor(uint256 ein, address orgFactory)` - public
Create new Organization Contract



_Parameters:_
 - `ein`: The U.S. Tax Identification Number for the Organization
 - `orgFactory`: Address of the Factory contract.

### `claimRequest(string claimId, string fName, string lName, string eMail, address orgAdminWalletAddress)` - public
Creates Organization Claim and emits a `ClaimCreated` event



_Parameters:_
 - `claimId`: UUID representing this claim
 - `fName`: First name of Administrator
 - `lName`: Last name of Administrator
 - `eMail`: Email contact for Organization Administrator.
 - `orgAdminWalletAddress`: Wallet address of Organization's Administrator.

### `approveClaim(string claimId)` - public
Approves an Organization Claim and emits a `ClaimApproved` event



_Parameters:_
 - `claimId`: UUID of the claim being approved

### `rejectClaim(string claimId)` - public
Rejects an Organization Claim and emits a 'ClaimRejected` event



_Parameters:_
 - `claimId`: UUID of the claim being rejected

### `cashOutOrg(address tokenAddress)` - public
Cashes out Organization Contract and emits a `CashOutComplete` event



_Parameters:_
 - `tokenAddress`: ERC20 address of desired token withdrawal

### `getTokenBalance(address tokenAddress) → uint256` - external
Retrieves Token Balance of Org Contract



_Parameters:_
 - `tokenAddress`: Address of desired token to query for balance


### `orgWallet() → address` - public
Org Wallet convenience accessor







## Events
- `CashOutComplete(uint256 cashOutAmount)`
- `ClaimCreated(string claimId, struct Org.Claim claim)`
- `ClaimApproved(string claimId, struct Org.Claim claim)`
- `ClaimRejected(string claimId, struct Org.Claim claim)`
