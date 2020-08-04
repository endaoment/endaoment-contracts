## Contract: `EndaomentAdmin.sol`



### `onlyAdminOr(enum IEndaomentAdmin.Role role)`
Modifier that throws if called by any account other than the owner
or the supplied role, or if the caller is not the owner and the role in
question is paused.



_Parameters:_

- `role`: The role to require unless the caller is the owner. Permitted
roles are bot commander (0) and pauser (1).


### `setRole(enum IEndaomentAdmin.Role role, address account)` (public)
Set a new account on a given role and emit a `RoleModified` event
if the role holder has changed. Only the owner may call this function.



_Parameters:_
- `role`: The role that the account will be set for.

- `account`: The account to set as the designated role bearer.

### `removeRole(enum IEndaomentAdmin.Role role)` (public)
Remove any current role bearer for a given role and emit a
`RoleModified` event if a role holder was previously set. Only the owner
may call this function.



_Parameters:_
- `role`: The role that the account will be removed from.

### `pause(enum IEndaomentAdmin.Role role)` (public)
Pause a currently unpaused role and emit a `RolePaused` event. Only
the owner or the designated pauser may call this function. Also, bear in
mind that only the owner may unpause a role once paused.



_Parameters:_
- `role`: The role to pause.

### `unpause(enum IEndaomentAdmin.Role role)` (public)
Unpause a currently paused role and emit a `RoleUnpaused` event.
Only the owner may call this function.



_Parameters:_
- `role`: The role to pause.

### `isPaused(enum IEndaomentAdmin.Role role) → bool` (external)
External view function to check whether or not the functionality
associated with a given role is currently paused or not. The owner or the
pauser may pause any given role (including the pauser itself), but only the
owner may unpause functionality. Additionally, the owner may call paused
functions directly.



_Parameters:_
- `role`: The role to check the pause status on.


### `isRole(enum IEndaomentAdmin.Role role) → bool` (external)
External view function to check whether the caller is the current
role holder.



_Parameters:_
- `role`: The role to check for.


### `getRoleAddress(enum IEndaomentAdmin.Role role) → address` (external)
External view function to check the account currently holding the
given role.






