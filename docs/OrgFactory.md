## Contract: `OrgFactory.sol`
OrgFactory is a contract that allows the EndaomentAdmin to
instantiate new Org contracts. It also provides for fetching of
individual Org contract addresses as well as a list of all
allowedOrgs.



### `constructor(address adminContractAddress)` (public)
Create new Org Factory



_Parameters:_
- `adminContractAddress`: Address of EndaomentAdmin contract.

### `createOrg(uint256 ein, address adminContractAddress)` (public)
 Create new Org Contract



_Parameters:_
- `ein`: The U.S. Tax Identification Number for the Organization

- `adminContractAddress`: Contract address for Endaoment Admin

### `countDeployedOrgs() → uint256` (external)
Returns total number Org contracts created by the factory.





### `OrgCreated(address newAddress)`


