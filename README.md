# Endaoment Contracts
Endaoment is a public, tax-exempt 501(c)(3) charity providing smart contract powered Donor-Advised Funds. 

The solidity contracts in this repository govern the creation, operation and flow-of-funds of Endaoment's Donor-Advised Funds and Nonprofit Organization Escrow Contracts. 
- - - 
## Table of Contents
- [Usage](#usage)
- [Installation](#installation)
- [Contracts](#contracts)
- [Testing](#testing)
- [Additional Documentation](#additional-documentation)
- [License](#license)
- [Responsible Disclosure](#responsible-disclosure)
- - -

## Usage
These contracts should be used exclusively in conjunction with the Endaoment Client (repo) and Endaoment API (repo), in order to replicate proper behavior.  

## Installation
To install, clone this repository using: 

    git clone https://github.com/endaoment/endaoment-contracts.git

Then run: 

    npm install

Once installed, in the project directory run:

    npm run build  
 
## Available Scripts

In the project directory, you can run:

### `npm run build`

Builds all contracts in `/contracts` directory using `oz compile`.<br/>
Outputs `/artifcts`, `/build` and `/cache` to root directory

### `npm run test`

Launches the test runner.<br />

### Full Docs: [endaoment-docs/developers](https://github.com/endaoment/endaoment-docs/tree/master/developers)

### Other Resources:
- Website: [endaoment.org](https://endaoment.org)
- Twitter: [@endaomentdotorg](https://twitter.com/endaomentdotorg)
- Discord: [Join Server](https://discord.gg/9xZCgca)

## License
[BSD 3-Clause](LICENSE)

## Responsible Disclosue
If you discover a vulnerability, we would like to know about it so we can take steps to address it as quickly as possible.

Please do the following:
 - E-mail your findings to [admin@endaoment.org](mailto:admin@endaoment.org). Encrypt your findings using our [PGP key](https://endaoment.org/pgp.asc) to prevent this critical information from falling into the wrong hands,
 - Do not take advantage of the vulnerability or problem you have discovered, for example by downloading more data than necessary to demonstrate the vulnerability or deleting or modifying other people's data,
 - Do not reveal the problem to others until it has been resolved,
 - Do not use attacks on physical security, social engineering, distributed denial of service, spam or applications of third parties, and
 - Do provide sufficient information to reproduce the problem, so we will be able to resolve it as quickly as possible. Usually, the IP address or the URL of the affected system and a description of the vulnerability will be sufficient, but complex vulnerabilities may require further explanation.

What we promise:
 - We will respond to your report within 3 business days with our evaluation of the report and an expected resolution date,
 - If you have followed the instructions above, we will not take any legal action against you in regard to the report,
 - We will handle your report with strict confidentiality, and not pass on your personal details to third parties without your permission,
 - We will keep you informed of the progress towards resolving the problem,
 - In the public information concerning the problem reported, we will give your name as the discoverer of the problem (unless you desire otherwise), and
 - As a token of our gratitude for your assistance, we offer a reward for every report of a security problem that was not yet known to us. The amount of the reward will be determined based on the severity of the leak and the quality of the report. 
 - We strive to resolve all problems as quickly as possible, and we would like to play an active role in the ultimate publication on the problem after it is resolved.