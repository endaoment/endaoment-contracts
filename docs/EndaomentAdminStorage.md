## Contract: `EndaomentAdminStorage.sol`
Stores the contract address of the EndaomentAdmin,
for use in references by the Org and Fund factories and
subsequently deployed Org and Fund contracts.



## Methods
### `updateEndaomentAdmin(address newAdmin)` (public)
Updates address of the endaomentAdmin contract and emits `EndaomentAdminChanged` event.



_Parameters:_
- `newAdmin`: New address of the endaomentAdmin contract


## Events
- `EndaomentAdminChanged(address oldAddress, address newAddress)`
