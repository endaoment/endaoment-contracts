## Contract: `Fund.sol`
Fund is a contract that serves as an on-chain US Donor-Advised Fund.
It holds the proceeds of gifted cryptocurrency as ERC20 tokens,
and allows for the manager to submit Grant recommendations to the contract.
The EndaomentAdmin can then chose to approve the Grant recommendation, triggering
a SafeMath transfer of a 1% fee to the EndaomentAdmin and the remainder to the
recipient Org contract.


### `restricted()`
Restricts method access to fund's manager




### `constructor(address fundManager, address adminContractAddress)` (public)
Create new Fund



_Parameters:_
- `fundManager`: Address of the Fund's Primary Advisor

- `adminContractAddress`: Address of the EndaomentAdmin contract.

### `changeManager(address newManager, address adminContractAddress)` (public)
Change Fund Primary Advisor



_Parameters:_
- `newManager`: The address of the new PrimaryAdvisor.

- `adminContractAddress`: Address of the EndaomentAdmin contract.

### `checkRecipient(address recipient, address orgFactoryContractAddress) → bool` (public)
Checks recipient of a Grant is an address created by the OrgFactory



_Parameters:_
- `recipient`: The address of the Grant recipient.

- `orgFactoryContractAddress`: Address of the OrgFactory contract.

### `getSummary(address tokenAddress) → uint256, uint256, address` (external)
Returns summary of details about the fund [tokenBalance, number of grants, managerAddress].



_Parameters:_
- `tokenAddress`: The token address of the stablecoin being used by the web-server.

### `createGrant(string description, uint256 value, address recipient, address orgFactoryContractAddress)` (public)
Create new Grant Recommendation



_Parameters:_
- `description`: The address of the Owner.

- `value`: The value of the grant in base units.

- `recipient`: The address of the recieving organization's contract.

- `orgFactoryContractAddress`: Address of the orgFactory Contract.

### `finalizeGrant(uint256 index, address tokenAddress, address adminContractAddress)` (public)
Approve Grant Recommendation



_Parameters:_
- `index`: This Grant's index position

- `tokenAddress`: The stablecoin's token address.

- `adminContractAddress`: Address of the EndaomentAdmin contract.

### `getGrantsCount() → uint256` (external)
Returns total number of grants submitted to the fund.





### `ManagerChanged(address newManager)`


### `GrantCreated(struct Fund.Grant grant)`


### `GrantFinalized(struct Fund.Grant grant)`


