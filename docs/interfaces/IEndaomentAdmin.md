## Contract: `IEndaomentAdmin.sol`

Interface of the EndaomentAdmin contract


## Methods
### `setRole(enum IEndaomentAdmin.Role role, address account)` (external)



### `removeRole(enum IEndaomentAdmin.Role role)` (external)



### `pause(enum IEndaomentAdmin.Role role)` (external)



### `unpause(enum IEndaomentAdmin.Role role)` (external)



### `isPaused(enum IEndaomentAdmin.Role role) → bool` (external)



### `isRole(enum IEndaomentAdmin.Role role) → bool` (external)



### `getRoleAddress(enum IEndaomentAdmin.Role role) → address` (external)




## Events
- `RoleModified(enum IEndaomentAdmin.Role role, address account)`
- `RolePaused(enum IEndaomentAdmin.Role role)`
- `RoleUnpaused(enum IEndaomentAdmin.Role role)`
