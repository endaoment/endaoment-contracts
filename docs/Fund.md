## Contract: `Fund.sol`
Fund is a contract that serves as an on-chain US Donor-Advised Fund.
It holds the proceeds of gifted cryptocurrency as ERC20 tokens,
and allows for the manager to submit Grant recommendations to the contract.
The EndaomentAdmin can then chose to approve the Grant recommendation, triggering
a SafeMath transfer of a 1% fee to the EndaomentAdmin and the remainder to the
recipient Org contract.



## Methods
### `constructor(address fundManager, address fundFactory)` - public
Create new Fund



_Parameters:_
 - `fundManager`: Address of the Fund's Primary Advisor
 - `fundFactory`: Address of the Factory contract.

### `changeManager(address newManager)` - public
Changes Fund Primary Advisor and emits a `ManagerChanged` event



_Parameters:_
 - `newManager`: The address of the new PrimaryAdvisor.

### `checkRecipient(address recipient, address orgFactoryContractAddress) → bool` - public
Checks recipient of a Grant is an address created by the OrgFactory



_Parameters:_
 - `recipient`: The address of the Grant recipient.
 - `orgFactoryContractAddress`: Address of the OrgFactory contract.


### `getSummary(address tokenAddress) → uint256, address` - external
Returns summary of details about the fund [tokenBalance, number of grants, managerAddress].



_Parameters:_
 - `tokenAddress`: The token address of the ERC20 being used by the web-server.


### `createGrant(string grantId, string description, uint256 value, address recipient)` - public
Creates new Grant Recommendation and emits a `GrantCreated` event.



_Parameters:_
 - `grantId`: UUID representing this grant
 - `description`: The address of the Owner.
 - `value`: The value of the grant in base units.
 - `recipient`: The address of the recieving organization's contract.

### `updateGrant(string grantId, string description, uint256 value, address recipient)` - public
Updates Grant Recommendation and emits a `GrantUpdated` event.



_Parameters:_
 - `grantId`: UUID representing this grant
 - `description`: The address of the Owner.
 - `value`: The value of the grant in base units.
 - `recipient`: The address of the recieving organization's contract.

### `rejectGrant(string grantId)` - public
Rejects Grant Recommendation and emits a `GrantRejected` event.



_Parameters:_
 - `grantId`: UUID representing this grant

### `finalizeGrant(string grantId, address tokenAddress)` - public
Approves Grant Recommendation and emits a `GrantFinalized` event.



_Parameters:_
 - `grantId`: UUID of the grant being finalized
 - `tokenAddress`: The ERC20 token address of the token prescribed by the web-server.


## Events
- `ManagerChanged(address newManager)`
- `GrantCreated(string grantId, struct Fund.Grant grant)`
- `GrantUpdated(string grantId, struct Fund.Grant grant)`
- `GrantRejected(string grantId)`
- `GrantFinalized(string grantId, struct Fund.Grant grant)`
