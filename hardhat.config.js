require("@nomiclabs/hardhat-etherscan");
require('dotenv').config();

module.exports = {
  solidity: {
    version: "0.6.12",
    settings: {
    optimizer: {
        "enabled": false,
        "runs": 999999
      },
    },
  },
  networks: {
      mainnet: {
        url: `https://mainnet.infura.io/v3/${process.env.INFURA_KEY}`,
      }
  },
  etherscan: {
    apiKey: process.env.ETHERSCAN_API_KEY,
  },
};
