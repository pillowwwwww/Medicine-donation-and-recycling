// 引入所需模块和配置
const { network } = require("hardhat");
const { verify } = require("../utils/verify");
const {
    networkConfig,
    developmentChains,
} = require("../helper-hardhat-config");

module.exports = async ({ getNamedAccounts, deployments }) => {
    // 获取部署和日志记录方法
    const { deploy, log, get } = deployments;
    // 获取部署账户
    const { deployer } = await getNamedAccounts();
    // 获取当前网络的chainId
    const chainId = network.config.chainId;

    // 获取合约地址
    // const relayChain = await get("RelayChain");

    //手动提供 Sepolia 上的 RelayChain 地址!
    const relayChainAddressOnSepolia =
        process.env.RELAY_CHAIN_ADDRESS_ON_SEPOLIA;
    //待测试：是否能获取正确的合约地址？
    // try {
    //     const governmentChain = await get("GovernmentChain");
    //     log(`GovernmentChain address: ${governmentChain.address}`);
    //     const logisticsChain = await deployments.get("LogisticsChain");
    //     console.log(logisticsChain.address);
    // } catch (error) {
    //     log("Error fetching GovernmentChain:", error);
    // }
    const governmentChainAddress =
        process.env.GOVERNMENT_CHAIN_ADDRESS_ON_SEPOLIA;
    const logisticsChainAddress =
        process.env.LOGISTICS_CHAIN_ADDRESS_ON_SEPOLIA;
    // 部署UserChain合约
    log("Deploying User Chain...");
    const userChain = await deploy("UserChain", {
        from: deployer, // 部署者地址
        args: [
            relayChainAddressOnSepolia,
            governmentChainAddress,
            logisticsChainAddress,
        ], // 构造函数参数
        log: true, // 日志记录
        waitConfirmations: network.config.blockConfirmations || 1, // 等待确认的区块数
    });
    log(`UserChain deployed at ${userChain.address}`);

    // 部署完成后验证合约
    if (network.config.zksync) {
        await hre.run("verify:verify", {
            address: userChain.address,
            contract: "contracts/UserChain.sol:UserChain",
            constructorArguments: [
                relayChainAddressOnSepolia,
                governmentChainAddress,
                logisticsChainAddress,
            ],
        });
    } else if (
        !developmentChains.includes(network.name) &&
        process.env.ETHERSCAN_API_KEY
    ) {
        await verify(userChain.address, [
            relayChainAddressOnSepolia,
            governmentChainAddress,
            logisticsChainAddress,
        ]);
    }
};

module.exports.tags = ["UserChain"];
//声明当前脚本依赖于哪些其他部署脚本
module.exports.dependencies = [
    "RelayChain",
    "GovernmentChain",
    "LogisticsChain",
];
