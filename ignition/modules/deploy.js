const { ethers, run, network } = require("hardhat");

async function main() {
    const RelayChainFactory = await ethers.getContractFactory("RelayChain");
    console.log("Deploying contract...");
    const relayChain = await RelayChainFactory.deploy();
    console.log(`Deployed contract to: ${relayChain.target}`);
    //如果是测试网络，才会验证，如果是localhost，不会验证
    if (network.config.chainId === 11155111 && process.env.ETHERSCAN_API_KEY) {
        console.log("Waiting for block confirmations...");

        // Not functionable in version 6^ ethers ----->
        await relayChain.deploymentTransaction().wait(6);
        await verify(relayChain.target, []);
    }
}

//发布合约后自动验证合约，使用了@nomicfoundation/hardhat-verify插件
//用到etherscan网站的API keys
const verify = async (contractAddress, args) => {
    console.log("Verifying contract...");
    try {
        await run("verify:verify", {
            address: contractAddress,
            constructorArguments: args, //构造函数参数，如果智能合约有构造参数的话
        });
    } catch (e) {
        if (e.message.toLowerCase().includes("already verified")) {
            //如果合约已经被etherscan验证，会报错
            console.log("Already Verified!");
        } else {
            console.log(e);
        }
    }
};

main()
    .then(() => process.exit(0))
    .catch((error) => {
        console.error(error);
        process.exit(1);
    });

//如果报错了想重新运行，把cache和artifacts文件夹删掉
