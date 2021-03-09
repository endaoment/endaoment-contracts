require('dotenv').config();
const Web3 = require("web3");
const HDWalletProvider = require("@truffle/hdwallet-provider");
const ERC20 = require("./build/contracts/ERC20.json")
const { MaxUint256 } = require('@ethersproject/constants')

const mnemonic = process.env.ACCOUNTANT_MNEMONIC;
const infuraKey = process.env.INFURA_KEY;
const infuraPrefix = process.env.INFURA_PREFIX;
const accountant = process.env.ACCOUNTANT_ADDRESS;
const infuraEndpoint = "https://" + infuraPrefix + ".infura.io/v3/" + infuraKey;
const provider = new HDWalletProvider(mnemonic, infuraEndpoint);
const web3 = new Web3(provider);

const tokensToUnlock = [
  {
    "tokenAddress": "0x07865c6E87B9F70255377e024ace6630C1Eaa37F",
    "tokenDecimals": 6,
    "tokenSymbol": "USDC",
    "tokenName": "USD//C",
  },
  {
    "tokenAddress": "0xad6d458402f60fd3bd25163575031acdce07538d",
    "tokenDecimals": 18,
    "tokenSymbol": "DAI",
    "tokenName": "DAI",
  },
  {
    "tokenAddress": "0x8ae2a0bfb3315b63ee8e88ac7d3f6b5a68f01cf5",
    "tokenDecimals": 18,
    "tokenSymbol": "SNX",
    "tokenName": "SNX",
  },
]

const unlockToken = async (tokenContractAddress, account) => {
  const tokenContract = await new web3.eth.Contract(ERC20.abi, tokenContractAddress)
  const receipt = await tokenContract.methods.approve("0x1b02dA8Cb0d097eB8D57A175b88c7D8b47997506", "115792089237316195423570985008687907853269984665640564039457584007913129639935").send({ from: account, chainId: process.env.CHAINID })

  return receipt
}

const deploy = async () => {
  accounts = await web3.eth.getAccounts();

  console.log("///STARTING TOKEN UNLOCK///");
  console.log("Network: " + process.env.INFURA_PREFIX);
  console.log("Account: " + accounts[0]);



  await tokensToUnlock.map(async (token) => {
    try {
      console.log("Unlocking " + token.tokenSymbol)
      const unlock = await unlockToken(token.tokenAddress, accounts[0])
      return console.log("Unlocked " + token.tokenSymbol, unlock)
    }
    catch (err) {
      console.log(`${token.tokenSymbol} ERROR:`, err)
    }
    return
  })

  return
};


deploy();

