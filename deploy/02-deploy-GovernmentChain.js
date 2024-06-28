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
    // const relayChain = await deployments.get("RelayChain");
    // console.log(`relaychain的地址为 ${relayChain.address}`);

    //手动提供 Sepolia 上的 RelayChain 地址!
    const relayChainAddressOnSepolia =
        "0x5fbdb2315678afecb367f032d93f642f64180aa3"; //hardhat本地relaychain地址
    //Sepolia测试网地址：process.env.RELAY_CHAIN_ADDRESS_ON_SEPOLIA;

    // 部署GovernmentChain合约
    log("Deploying Government Chain...");
    const governmentChain = await deploy("GovernmentChain", {
        from: deployer, // 部署者地址
        args: [relayChainAddressOnSepolia], // 构造函数参数
        log: true,
        waitConfirmations: network.config.blockConfirmations || 1, // 等待确认的区块数
    });
    log(`GovernmentChain deployed at ${governmentChain.address}`);

    // 部署完成后验证合约
    if (network.config.zksync) {
        log(`zksync验证`);
        await hre.run("verify:verify", {
            address: governmentChain.address,
            contract: "contracts/GovernmentChain.sol:GovernmentChain",
            constructorArguments: [relayChainAddressOnSepolia],
        });
    } else if (
        !developmentChains.includes(network.name) &&
        process.env.ETHERSCAN_API_KEY
    ) {
        log(`etherscan验证`);
        await verify(governmentChain.address, [relayChainAddressOnSepolia]);
    }
};

module.exports.tags = ["all", "governmentchain"];
