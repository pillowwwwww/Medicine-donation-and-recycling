//不需要main了
const { network } = require("hardhat");
require("dotenv").config();
const { verify } = require("../utils/verify.js");
//1.导入网络配置
const {
    networkConfig,
    developmentChains,
} = require("../helper-hardhat-config"); //提取networkConfig，从helper-hardhat-config.js文件中

//方法1： hre是hardhat运行环境
// async function deployfuc(hre) {
//     console.log("============");
// }
// module.exports.default = deployfuc;

//方法2:
//匿名函数module.exports = async() => {}
// module.exports = async (hre) => {
//     const { getNamedAccounts, deployments }=hre
// };

//方法三：
module.exports = async ({ getNamedAccounts, deployments }) => {
    //作为默认导出
    const { deploy, log } = deployments;
    const { deployer } = await getNamedAccounts(); //在hardhat.config.js中设置namedAccounts
    const chainId = network.config.chainId;

    const args = process.env.Sepolia_PRIVATE_KEY;
    //const ethUsdPriceFeedAddress = networkConfig[chainId]["ethUsdPriceFeed"];
    log("----------------------------------------------------");
    log("Deploying Relay Chain and waiting for confirmations...");
    //2. 部署
    const relayChain = await deploy("RelayChain", {
        from: deployer,
        //args: [ethUsdPriceFeedAddress], //构造函数的参数，priceFeedAddress
        args: [],
        //我们不想使用硬编码，希望实现if chainId is X use address Y, if chinaId is Z, use address C
        //所以使用aave，部署到多个链上并使用多个不同的地址helper-hardhat-config.js
        log: true,
        // we need to wait if on a live network so we can verify properly
        waitConfirmations: network.config.blockConfirmations || 1, //等待6个区块，没设置的话等待一个
    });
    log(`RelayChain deployed at ${relayChain.address}`);

    //3. 在合约部署完成后，自动验证合约
    if (
        !developmentChains.includes(network.name) &&
        process.env.ETHERSCAN_API_KEY
    ) {
        //await verify(relayChain.address, [ethUsdPriceFeedAddress]);
        await verify(relayChain.address, []);
    }
};

module.exports.tags = ["all", "relaychain"];
