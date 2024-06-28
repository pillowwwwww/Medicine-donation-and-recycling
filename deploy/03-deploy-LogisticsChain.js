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

    //手动提供 Sepolia 上的 RelayChain 地址!
    const relayChainAddressOnSepolia =
        "0x5fbdb2315678afecb367f032d93f642f64180aa3"; //此时为hardhat本地relaychain地址
    //Sepolia测试网地址：process.env.RELAY_CHAIN_ADDRESS_ON_SEPOLIA;

    // 部署LogisticsChain合约
    log("Deploying Logistics Chain...");
    const logisticsChain = await deploy("LogisticsChain", {
        from: deployer, // 部署者地址
        args: [relayChainAddressOnSepolia], // 构造函数参数
        log: true, // 日志记录
        waitConfirmations: network.config.blockConfirmations || 1, // 等待确认的区块数
    });
    log(`LogisticsChain deployed at ${logisticsChain.address}`);
    if (network.config.zksync) {
        await hre.run("verify:verify", {
            address: logisticsChain.address,
            contract: "contracts/LogisticsChain.sol:LogisticsChain",
            constructorArguments: [relayChainAddressOnSepolia],
        });
    } else if (
        !developmentChains.includes(network.name) &&
        process.env.ETHERSCAN_API_KEY
    ) {
        await verify(logisticsChain.address, [relayChainAddressOnSepolia]);
    }
};

module.exports.tags = ["all", "logisticschain"];
