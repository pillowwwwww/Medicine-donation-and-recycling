require("@nomicfoundation/hardhat-toolbox");
require("dotenv").config();
require("@nomicfoundation/hardhat-verify");
require("hardhat-gas-reporter");
require("solidity-coverage");
require("hardhat-deploy");

//如果没有api key的话，hardhat可能会报错，所以我们在后面随便放一串字符串，这里放的是来源
//prettier-ignore
const Sepolia_RPC_URL = process.env.Sepolia_RPC_URL || "https://dashboard.alchemy.com/apps/pxzfptm1q8cuo6ow";
//prettier-ignore
const Sepolia_PRIVATE_KEY = process.env.Sepolia_PRIVATE_KEY || "https://dashboard.alchemy.com/apps/pxzfptm1q8cuo6ow";
//prettier-ignore
const ETHERSCAN_API_KEY = process.env.ETHERSCAN_API_KEY || "https://etherscan.io/login";
//prettier-ignore
const COINMARKETCAP_API_KEY = process.env.COINMARKETCAP_API_KEY || "https://pro.coinmarketcap.com/accou";
//prettier-ignore
const Optisim_Sepolia_RPC_URL = process.env.Optisim_Sepolia_RPC_URL || "https://dashboard.alchemy.com/apps/pxzfptm1q8cuo6ow";

/** @type import('hardhat/config').HardhatUserConfig */
module.exports = {
    defaultNetwork: "hardhat",
    networks: {
        Sepolia: {
            url: Sepolia_RPC_URL,
            accounts: [Sepolia_PRIVATE_KEY],
            chainId: 11155111,
        },
        Optisim_Sepolia: {
            url: Optisim_Sepolia_RPC_URL,
            accounts: [Sepolia_PRIVATE_KEY],
            chainId: 11155420,
        },
        //使用localhost更快，并且有可视化的node终端页面，有十个账号
        localhost: {
            url: "http://127.0.0.1:8545/",
            //accounts:hardhat免费给了10个账户
            chainId: 31337, //即使是本地的，也被认为是hardhat
        },
    },
    solidity: "0.8.24",
    etherscan: {
        apiKey: ETHERSCAN_API_KEY,
    },
    gasReporter: {
        enabled: true,
        outputFile: "gas-report.txt",
        noColors: true,
        currency: "USD",
        coinmarketcap: COINMARKETCAP_API_KEY, //为了获取货币
        //token,
    },
    namedAccounts: {
        deployer: {
            default: 0, // here this will by default take the first account as deployer
            1: 0, // similarly on mainnet it will take the first account as deployer. Note though that depending on how hardhat network are configured, the account 0 on one network can be different than on another
        },
    },
};
