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

const tokensToUnlock = [{
  "tokenAddress": "0x8ae2a0bfb3315b63ee8e88ac7d3f6b5a68f01cf5",
  "tokenDecimals": 18,
  "tokenSymbol": "SNX",
  "tokenName": "SNX",
}]
const unlockToken = async (tokenContractAddress) => {
  const nonce = await web3.eth.getTransactionCount(accounts[0])
  const tokenContract = await new web3.eth.Contract(ERC20.abi, tokenContractAddress)
  const receipt = await tokenContract.methods.approve("0xf164fC0Ec4E93095b804a4795bBe1e041497b92a", "115792089237316195423570985008687907853269984665640564039457584007913129639935").send({ from: accountant, nonce, gasPrice: web3.utils.toWei("545", "gwei") })

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

  return console.log("All tokens approved")
};


deploy();

