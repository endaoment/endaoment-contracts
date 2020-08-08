## Contract: `Administratable.sol`
Provides two modifiers allowing contracts administered
by the EndaomentAdmin contract to properly restrict method calls
based on the a given role. Also provides a utility function for
validating string input arguments.


## Modifiers
### `onlyAdmin(address adminContractAddress)`
onlyAdmin checks that the caller is the EndaomentAdmin



_Parameters:_

- `adminContractAddress`: is the supplied EndaomentAdmin contract address

### `onlyAdminOrRole(address adminContractAddress, enum IEndaomentAdmin.Role role)`
onlyAdminOrRole checks that the caller is either the Admin or the provided role.



_Parameters:_

- `adminContractAddress`: supplied EndaomentAdmin address



- `role`: The role to require unless the caller is the owner. Permitted
roles are ADMIN (6), ACCOUNTANT (2), REVIEWER (3), FUND_FACTORY (4) and ORG_FACTORY(5).

### `onlyAddressOrAdminOrRole(address allowedAddress, address adminContractAddress, enum IEndaomentAdmin.Role role)`
Checks that the caller is either a provided adress, admin or role.



_Parameters:_

- `allowedAddress`: An exempt address provided that shall be allowed to proceed.  



- `adminContractAddress`: The EndaomentAdmin contract address.



- `role`: The desired IEndaomentAdmin.Role to check against. Permitted
roles are ADMIN (6), ACCOUNTANT (2), REVIEWER (3), FUND_FACTORY (4) and ORG_FACTORY(5).


## Methods
### `isEqual(string s1, string s2) → bool` (internal)
Returns true if two strings are equal, false otherwise



_Parameters:_
- `s1`: First string to compare

- `s2`: Second string to compare


