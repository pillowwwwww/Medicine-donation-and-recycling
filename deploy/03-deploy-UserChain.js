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

    // 获取合约地址
    // const relayChain = await get("RelayChain");

    //手动提供 Sepolia 上的 RelayChain 地址!
    const relayChainAddressOnSepolia =
        "0x65D5A72D33b2145538332012F5F18DeCf8FdF706";
        //待测试：是否能获取正确的合约地址？
    const governmentChain = await get("GovernmentChain");
    const logisticsChain = await get("LogisticsChain");

    // 部署UserChain合约
    log("Deploying User Chain...");
    const userChain = await deploy("UserChain", {
        from: deployer, // 部署者地址
        args: [
            relayChainAddressOnSepolia,
            governmentChain.address,
            logisticsChain.address,
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
                governmentChain.address,
                logisticsChain.address,
            ],
        });
    } else if (
        !developmentChains.includes(network.name) &&
        process.env.ETHERSCAN_API_KEY
    ) {
        await verify(userChain.address, [
            relayChainAddressOnSepolia,
            governmentChain.address,
            logisticsChain.address,
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
