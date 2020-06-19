require('dotenv').config();
const Web3 = require("web3");
const HDWalletProvider = require("@truffle/hdwallet-provider");
const EndaomentAdmin = require("./build/contracts/EndaomentAdmin.json");
const OrgFactory = require("./build/contracts/OrgFactory.json");
const FundFactory = require("./build/contracts/FundFactory.json");

const mnemonic = process.env.ADMIN_MNEMONIC;
const infuraKey = process.env.INFURA_KEY;
const infuraPrefix = process.env.INFURA_PREFIX;
const admin = process.env.ADMIN_ADDRESS;
const pauser = process.env.PAUSER_ADDRESS;
const accountant = process.env.ACCOUNTANT_ADDRESS;
const reviewer = process.env.REVIEWER_ADDRESS;
const infuraEndpoint = "https://" + infuraPrefix + ".infura.io/v3/" + infuraKey;
const provider = new HDWalletProvider(mnemonic, infuraEndpoint);
const web3 = new Web3(provider);

const attemptRoleSet = async (roleIndex, roleAddress, adminContract, ownerAddress) => {
  const receipt = await adminContract.methods.setRole(roleIndex, roleAddress).send({ from: ownerAddress })

  return receipt
}

const deploy = async () => {
  accounts = await web3.eth.getAccounts();


  //Deploy EndamentAdmin contract
  console.log("Deploying EndaomentAdmin from account", accounts[0]);
  const endaomentAdmin = await new web3.eth.Contract(
    EndaomentAdmin.abi
  )
    .deploy({ data: EndaomentAdmin.bytecode })
    .send({ from: accounts[0] });
  console.log("EndaomentAdmin deployed to", endaomentAdmin.options.address);


  //Set roles for wallet addresses
  console.log("Setting roles...");
  const adminReciept = await attemptRoleSet(0, admin, endaomentAdmin, accounts[0])
  console.log("EndaomentAdmin.Role.ADMIN set to:", adminReciept.events.RoleModified.returnValues.account);

  const pauserReceipt = await attemptRoleSet(1, pauser, endaomentAdmin, accounts[0])
  console.log("EndaomentAdmin.Role.PAUSER set to:", pauserReceipt.events.RoleModified.returnValues.account);

  const accountantReceipt = await attemptRoleSet(2, accountant, endaomentAdmin, accounts[0])
  console.log("EndaomentAdmin.Role.ACCOUNTANT set to:", accountantReceipt.events.RoleModified.returnValues.account);

  const reviewerReceipt = await attemptRoleSet(3, reviewer, endaomentAdmin, accounts[0])
  console.log("EndaomentAdmin.Role.REVIEWER set to:", reviewerReceipt.events.RoleModified.returnValues.account);


  //Deploy FundFactory and set address as FUND_FACTORY role
  console.log("Deploying FundFactory from account", accounts[0]);
  const fundFactory = await new web3.eth.Contract(
    FundFactory.abi
  )
    .deploy({ data: FundFactory.bytecode, arguments: [endaomentAdmin.options.address] })
    .send({ from: accounts[0] });

  console.log("FundFactory deployed to", fundFactory.options.address);

  const fundFactoryReceipt = await attemptRoleSet(4, fundFactory.options.address, endaomentAdmin, accounts[0])
  console.log("EndaomentAdmin.Role.FUND_FACTORY set to:", fundFactoryReceipt.events.RoleModified.returnValues.account);


  //Deploy OrgFactory and set address as ORG_FACTORY role
  console.log("Deploying OrgFactory from account", accounts[0]);
  const orgFactory = await new web3.eth.Contract(
    OrgFactory.abi
  )
    .deploy({ data: OrgFactory.bytecode, arguments: [endaomentAdmin.options.address] })
    .send({ from: accounts[0] });

  console.log("OrgFactory deployed to", orgFactory.options.address);

  const orgFactoryReceipt = await attemptRoleSet(5, orgFactory.options.address, endaomentAdmin, accounts[0])
  console.log("EndaomentAdmin.Role.ORG_FACTORY set to:", orgFactoryReceipt.events.RoleModified.returnValues.account);



  return console.log("Contract suite sucessfully deployed");

};


deploy();
