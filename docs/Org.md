## Contract: `Org.sol`
Org is a contract that serves as a smart wallet for US nonprofit
organizations. It holds the organization's federal Tax ID number as taxID,
and allows for an address to submit a Claim struct to the contract whereby
the organization can directly receive grant awards from Endaoment Funds.



### `constructor(uint256 ein, address adminContractAddress)` (public)
Create new Organization Contract



_Parameters:_
- `ein`: The U.S. Tax Identification Number for the Organization

- `adminContractAddress`: Contract Address for Endaoment Admin

### `claimRequest(string fName, string lName, string eMail, address orgAdminWalletAddress)` (public)
Create Organization Claim



_Parameters:_
- `fName`: First name of Administrator

- `lName`: Last name of Administrator

- `eMail`: Email contact for Organization Administrator.

- `orgAdminWalletAddress`: Wallet address of Organization's Administrator.

### `approveClaim(uint256 index, address adminContractAddress)` (public)
Approving Organization Claim



_Parameters:_
- `index`: Index value of Claim.

- `adminContractAddress`: Contract Address for Endaoment Admin

### `cashOutOrg(address tokenAddress, address adminContractAddress)` (public)
Cashing out Organization Contract



_Parameters:_
- `tokenAddress`: Stablecoin address of desired token withdrawal

- `adminContractAddress`: Contract Address for Endaoment Admin

### `getTokenBalance(address tokenAddress) → uint256` (external)
Retrieves Token Balance of Org Contract



_Parameters:_
- `tokenAddress`: Address of desired token to query for balance


### `getClaimsCount() → uint256` (external)
Retrieves Count of Claims Made






### `CashOutComplete(uint256 cashOutAmount)`


### `ClaimCreated(struct Org.Claim claim)`


### `ClaimApproved(struct Org.Claim claim)`


