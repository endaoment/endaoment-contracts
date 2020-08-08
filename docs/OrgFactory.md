## Contract: `OrgFactory.sol`
OrgFactory is a contract that allows the EndaomentAdmin to
instantiate new Org contracts. It also provides for fetching of
individual Org contract addresses as well as a list of all
allowedOrgs.



## Methods
### `constructor(address adminContractAddress)` - public
Creates new Org Factory and emits a `EndaomentAdminChanged` event



_Parameters:_
 - `adminContractAddress`: Address of EndaomentAdmin contract.

### `createOrg(uint256 ein)` - public
Creates new Org Contract and emits a `OrgCreated` event



_Parameters:_
 - `ein`: The U.S. Tax Identification Number for the Organization

### `toggleOrg(address orgAddress)` - public
Toggles whether Org is allowed and emits a `OrgStatusChanged` event



_Parameters:_
 - `orgAddress`: THe address of the Org contract.


## Events
- `OrgCreated(address newAddress)`
- `OrgStatusChanged(address orgAddress, bool isAllowed)`
