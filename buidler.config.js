usePlugin("@nomiclabs/buidler-truffle5");
usePlugin("solidity-coverage");

task("accounts", "Prints the list of accounts", async () => {
  const accounts = await web3.eth.getAccounts();

  for (const account of accounts) {
    console.log(account);
  }
});

module.exports = {
  defaultNetwork: "rinkeby",
  solc: {
    version: "0.5.15",
  },
  networks: {
    mainnet: {
      url: `https://mainnet.infura.io/v3/${process.env.INFURA_KEY}`,
      chainId: 1,
      accounts: process.env.PRIVATE_KEY ? [process.env.PRIVATE_KEY] : "remote",
    },
    rinkeby: {
      url: `https://rinkeby.infura.io/v3/${process.env.INFURA_KEY}`,
      chainId: 4,
      accounts: process.env.PRIVATE_KEY ? [process.env.PRIVATE_KEY] : "remote",
    },
    coverage: {
      url: "http://localhost:8555",
    },
  },
};
