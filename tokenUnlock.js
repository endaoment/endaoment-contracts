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
    "tokenAddress": "",
    "tokenDecimals": 18,
    "tokenSymbol": "",
    "tokenName": "",
  },
]

const unlockToken = async (tokenContractAddress) => {
  const tokenContract = await new web3.eth.Contract(ERC20.abi, tokenContractAddress)
  const receipt = await tokenContract.methods.approve("0x7a250d5630b4cf539739df2c5dacb4c659f2488d", "115792089237316195423570985008687907853269984665640564039457584007913129639935").send({ from: accountant })

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
      const unlock = await unlockToken(token.tokenAddress)
      return console.log("Unlocked " + token.tokenSymbol, unlock)
    }
    catch (err) {
      console.log(err)
    }
    return
  })

  return
};


deploy();

