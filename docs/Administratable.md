## Contract: `Administratable.sol`

Provides two modifiers allowing contracts administered
by the EndaomentAdmin contract to properly restrict method calls
based on the a given role.

### `onlyAdmin(address adminContractAddress)`
onlyAdmin checks that the caller is the EndaomentAdmin



_Parameters:_

- `adminContractAddress`: is the supplied EndaomentAdmin contract address

### `onlyAdminOrRole(address adminContractAddress, enum IEndaomentAdmin.Role role)`
onlyAdminOrRole checks that the caller is either the Admin or the provided role.



_Parameters:_

- `adminContractAddress`: supplied EndaomentAdmin address



- `role`: The role to require unless the caller is the owner. Permitted
roles are admin (0), accountant (2), and reviewer (3).



