const path = require("path");
const solc = require("solc");
const fs = require("fs-extra");

const buildPath = path.resolve(__dirname, "../abis");

const endaomentAdminPath = path.resolve(
  __dirname,
  "../contracts",
  "endaomentAdmin.sol"
);

const endaomentAdminSource = fs.readFileSync(endaomentAdminPath, "utf8");

var endaomentAdminInput = {
  language: "Solidity",
  sources: {
    "endaomentAdmin.sol": {
      content: endaomentAdminSource,
    },
  },
  settings: {
    outputSelection: {
      "*": {
        "*": ["*"],
      },
    },
  },
};

const endaomentAdminOutput = JSON.parse(
  solc.compile(JSON.stringify(endaomentAdminInput))
);

if (endaomentAdminOutput.errors) {
  endaomentAdminOutput.errors.forEach((err) => {
    console.log(err.formattedMessage);
  });
} else {
  const contracts = endaomentAdminOutput.contracts["endaomentAdmin.sol"];
  for (let contractName in contracts) {
    const contract = contracts[contractName];
    fs.writeFileSync(
      path.resolve(buildPath, `${contractName}.json`),
      JSON.stringify(contract.abi, null, 2),
      "utf8"
    );
  }
}

const fundFactory = path.resolve(__dirname, "../contracts", "fundFactory.sol");
const fundFactorySource = fs.readFileSync(fundFactory, "utf8");

var fundFactoryInput = {
  language: "Solidity",
  sources: {
    "fundFactory.sol": {
      content: fundFactorySource,
    },
  },
  settings: {
    outputSelection: {
      "*": {
        "*": ["*"],
      },
    },
  },
};

const fundFactoryOutput = JSON.parse(
  solc.compile(JSON.stringify(fundFactoryInput))
);

if (fundFactoryOutput.errors) {
  fundFactoryOutput.errors.forEach((err) => {
    console.log(err.formattedMessage);
  });
} else {
  const contracts = fundFactoryOutput.contracts["fundFactory.sol"];
  for (let contractName in contracts) {
    const contract = contracts[contractName];
    fs.writeFileSync(
      path.resolve(buildPath, `${contractName}.json`),
      JSON.stringify(contract.abi, null, 2),
      "utf8"
    );
  }
}
const orgFactory = path.resolve(__dirname, "../contracts", "orgFactory.sol");
const orgFactorySource = fs.readFileSync(orgFactory, "utf8");

var orgFactoryInput = {
  language: "Solidity",
  sources: {
    "orgFactory.sol": {
      content: orgFactorySource,
    },
  },
  settings: {
    outputSelection: {
      "*": {
        "*": ["*"],
      },
    },
  },
};

const orgFactoryOutput = JSON.parse(
  solc.compile(JSON.stringify(orgFactoryInput))
);

if (orgFactoryOutput.errors) {
  orgFactoryOutput.errors.forEach((err) => {
    console.log(err.formattedMessage);
  });
} else {
  const contracts = orgFactoryOutput.contracts["orgFactory.sol"];
  for (let contractName in contracts) {
    const contract = contracts[contractName];
    fs.writeFileSync(
      path.resolve(buildPath, `${contractName}.json`),
      JSON.stringify(contract.abi, null, 2),
      "utf8"
    );
  }
}
