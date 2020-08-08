## Contract: `FundFactory.sol`
FundFactory is a contract that allows the Endaoment ADMIN or ACCOUNTANT to
instantiate new Fund contracts.



## Methods
### `constructor(address adminContractAddress)` - public
Create new Fund Factory



_Parameters:_
 - `adminContractAddress`: Address of EndaomentAdmin contract.

### `createFund(address managerAddress)` - public
Creates new Fund and emits a `FundCreated` event.



_Parameters:_
 - `managerAddress`: The address of the Fund's Primary Advisor


## Events
- `FundCreated(address newAddress)`
