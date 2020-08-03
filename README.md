# Endaoment Contracts
Endaoment is a public, tax-exempt 501(c)(3) charity providing smart contract powered Donor-Advised Funds. <br />

The solidity contracts in this repository govern the creation, operation and flow-of-funds of Endaoment's Donor-Advised Funds and Nonprofit Organization Escrow Contracts. 
<br />

## Table of Contents
- [Usage](#usage)
- [Installation](#installation)
- [Contracts](#contracts)
- [Testing](#testing)
- [Additional Documentation](#additional_documentation)
- [License](#license)
<br />

## Usage
These contracts should be used exclusively in conjunction with the Endaoment Client (repo) and Endaoment API (repo), in order to replicate proper behavior.  
<br />

## Installation
To install, clone this repository using: 

### `git clone https://github.com/endaoment/endaoment-contracts.git`

Then run: 

### `npm install` 

Once installed, in the project directory run:

### `npm run build`

This builds all contracts in `/contracts` directory using `oz compile`.<br/>

Outputs `/artifcts`, `/build` and `/cache` to root directory.
<br />

## Testing
After installation, you can run: 

### `npm run test`

Launches the test runner and runs the associated test suite.
<br />

## Contracts
The Endaoment ecosystem uses serveral contracts to govern the movement of finances between DAFs and organizations:

### `EndaomentAdmin.sol`
In order to comply with US nonprofit regulations and increase system security, Endaoment uses several different Admin accounts to manage actions throughout the gifting and grantmaking processes. <br />

The `EndaomentAdmin` contract creates the Roles necessary to execute the oversight of the Endaoment ecosystem, as well as providing for the ability to change or pause the current holder of a given role.  <br />

Several "getter" functions are also available to allow for querying of current role status or holder. 

### `Administratable.sol`
Provides an interface containing key modifiers for administering the `FundFactory` and `OrgFactory` that reference the `EndaomentAdmin` contract. 

### `FundFactory.sol`
Provides method for creating/deploying a new `Fund` contract. Methods are also available for retrieving the total number of Funds deployed by the factory and the address of any given Fund at a specific Index position in the list of created `Funds[]`. 

### `Fund.sol`
Provides all methods for the administration of any specific Fund in the Endaoment ecosystem. <br />

Includes a `Grants` mapping that allows for the `manager` to create a new `Grant` recommendation data struct whereby they provide a recipeint organization address to send funds from their DAF. Any new `Grant` must have a recipient that was created by decalred `OrgFactory` role in the enumerated `EndaomentAdmin`. If approved, the `amount` of tokens prescribed in the `Grant` struct is transferred to the desired recipient.  

### `OrgFactory.sol`
Provides method for creating/deploying a new `Org` contract. Methods are also available for retrieving the total number of Orgs deployed by the factory and the address of any given Org at a specific Index position in the list of created `Orgs[]`. 

### `Org.sol`
Provides all methods for the administration of any specific Org in the Endaoment ecosystem. <br />

Includes a `Claims` mapping that allows for any address to create a new `Claim` data struct whereby they provide a `orgWallet` address and contact info. If a `Claim` is approved, a subset of Admin accounts can release granted funds from the Org contract to the desired wallet via the `cashOutOrg()` method.
<br />

## Additional Documentation
Full technical documentation of our contracts can be found in our doucmentation repository: 

### Read: [endaoment-docs](https://github.com/endaoment/endaoment-docs)

### Other Resources
- Website: [endaoment.org](https://endaoment.org)
- Twitter: [@endaomentdotorg](https://twitter.com/endaomentdotorg)
- Discord: [Join Server >](https://discord.gg/9xZCgca)
<br/>

## License
[BSD 3-Clause](LICENSE)
