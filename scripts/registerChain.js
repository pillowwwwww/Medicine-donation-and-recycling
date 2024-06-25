const { ethers } = require("ethers");
const hre = require("hardhat");

async function main() {
    const [deployer] = await hre.ethers.getSigners();

    const relayChainAddress = "RELAY_CHAIN_DEPLOYED_ADDRESS"; // 替换为实际的RelayChain合约地址

    const relayChain = new ethers.Contract(
        relayChainAddress,
        [
            "function registerChain(string memory chainName, address chainAddress) public",
            "event ChainRegistered(string chainName, address chainAddress)",
        ],
        deployer,
    );

    const governmentChainAddress = "GOVERNMENT_CHAIN_DEPLOYED_ADDRESS"; // 替换为实际的GovernmentChain合约地址
    const userChainAddress = "USER_CHAIN_DEPLOYED_ADDRESS"; // 替换为实际的UserChain合约地址
    const logisticsChainAddress = "LOGISTICS_CHAIN_DEPLOYED_ADDRESS"; // 替换为实际的LogisticsChain合约地址

    // 注册 GovernmentChain
    let tx = await relayChain.registerChain(
        "GovernmentChain",
        governmentChainAddress,
    );
    await tx.wait();
    console.log("GovernmentChain registered");

    // 注册 UserChain
    tx = await relayChain.registerChain("UserChain", userChainAddress);
    await tx.wait();
    console.log("UserChain registered");

    // 注册 LogisticsChain
    tx = await relayChain.registerChain(
        "LogisticsChain",
        logisticsChainAddress,
    );
    await tx.wait();
    console.log("LogisticsChain registered");
}

main()
    .then(() => process.exit(0))
    .catch((error) => {
        console.error(error);
        process.exit(1);
    });
