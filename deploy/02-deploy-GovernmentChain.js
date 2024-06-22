// 引入所需模块和配置
const { network } = require("hardhat");
const { verify } = require("../utils/verify");
const {
    networkConfig,
    developmentChains,
} = require("../helper-hardhat-config");

module.exports = async ({ getNamedAccounts, deployments }) => {
    // 获取部署和日志记录方法
    const { deploy, log } = deployments;
    // 获取部署账户
    const { deployer } = await getNamedAccounts();
    // 获取当前网络的chainId
    const chainId = network.config.chainId;

    // 获取RelayChain合约地址
    const relayChain = await deployments.get("RelayChain");

    // 部署GovernmentChain合约
    log("Deploying Government Chain...");
    const governmentChain = await deploy("GovernmentChain", {
        from: deployer, // 部署者地址
        args: [relayChain.address], // 构造函数参数
        log: true, // 日志记录
        waitConfirmations: network.config.blockConfirmations || 1, // 等待确认的区块数
    });
    log(`GovernmentChain deployed at ${governmentChain.address}`);

    // 部署完成后验证合约
    if (
        !developmentChains.includes(network.name) &&
        process.env.ETHERSCAN_API_KEY
    ) {
        await verify(governmentChain.address, [relayChain.address]); // 验证合约
    }
};

module.exports.tags = ["all", "governmentchain"];
