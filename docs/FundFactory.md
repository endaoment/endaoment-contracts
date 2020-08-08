## Contract: `FundFactory.sol`
FundFactory is a contract that allows the EndaomentAdmin to
instantiate new Fund contracts. It also provides for fetching of
individual Org contract addresses as well as a list of all
allowedOrgs.



### `constructor(address adminContractAddress)` (public)
Create new Fund Factory



_Parameters:_
- `adminContractAddress`: Address of EndaomentAdmin contract.

### `createFund(address managerAddress, address adminContractAddress)` (public)
Creates new Fund and emits FundCreated event.



_Parameters:_
- `managerAddress`: The address of the Fund's Primary Advisor

- `adminContractAddress`: Address of EndaomentAdmin contract.

### `countFunds() → uint256` (external)
Returns total number of funds created by the factory.





### `FundCreated(address newAddress)`


