# Sample Hardhat Project

This project demonstrates a basic Hardhat use case. It comes with a sample contract, a test for that contract, and a Hardhat Ignition module that deploys that contract.

Try running some of the following tasks:

```shell
npx hardhat help
npx hardhat test
REPORT_GAS=true npx hardhat test
npx hardhat node
npx hardhat ignition deploy ./ignition/modules/Lock.js
```

1. yarn init // yarn add -dev hardhat 创建一个JavaScript项目
2. yarn hardhat
3. yarn add --dev
4. 下载``` yarn add --dev @chainlink/contracts``` 
    ```yarn hardhat compile``` 编译合约:出现cache和artifacts（编译底层的代码信息）
5. ```yarn add --dev prettier prettier-plugin-solidity```添加格式化.    
6. 添加.prettierrc
7. 从hardhat导入ethers
8. 添加deploy.js文件，运行deploy.js，部署合约 `yarn hardhat run ignition/modules/deploy.js --network hardhat` 添加defaultNetwork: "hardhat",
9. 获取rpc_url和private key，可以使用.env添加：
   `yarn add --dev dotenv`
   安装测试工具
   `yarn add hardhat-gas-reporter solidity-coverage`
10. 添加hardhat.config.js中的网络配置
    运行
    `yarn hardhat run ignition/modules/deploy.js --network Sepolia`
    测试sepolia是否部署成功

11. 在deploy中添加verify函数，发布合约后自动验证合约，使用了@nomicfoundation/hardhat-verify插件。需要用到etherscan网站的API keys。
    `yarn add --dev @nomiclabs/hardhat-etherscan`

```Javascript
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
```

    在hardhat.config中添加

` require("@nomicfoundation/hardhat-verify");`
获取Etherscan的 api key 12. 在main函数中添加验证

```JavaScript
//如果是测试网络，才会验证，如果是localhost，不会验证
    if (network.config.chainId === 11155111 && process.env.ETHERSCAN_API_KEY) {
        console.log("Waiting for block confirmations...");

        // Not functionable in version 6^ ethers ----->
        await simpleStorage.deploymentTransaction().wait(6);
        await verify(simpleStorage.target, []);
    }
```

13. 可以使用localhost网络，提供多个账号
    `yarn hardhat node`
14. 打开hardhat控制台，可以不用写deploy文件，在控制台输入指令.
    ` yarn hardhat console --network localhost`
    这个shell里面可以做deploy的所以事情，并且不需要导入包。
    两次ctrl c退出控制台
15. 运行` yarn hardhat clean` 或者手动删除artifacts文件夹清除缓存

16. 测试: test-deploy.js文件.
    安装hardhat-gas-reporter插件
    `yarn add hardhat-gas-reporter --dev`
    在config中添加:
    ```JavaScript
    require("hardhat-gas-reporter");
    gasReporter: {
        enabled: true,
        outputFile: "gas-report.txt",
        noColors: true,
        currency: "USD",
        coinmarketcap: COINMARKETCAP_API_KEY, //为了获取这些比特币对应的美元价格
        //token：,//不同测试网络的token，在hardhat-gas-reporter官网上找
    },
    ```
    运行`yarn hardhat test`
    添加solidity-coverage：```yarn add -dev solidity-coverage```
    和```require("solidity-coverage");```
    遍历我们的测试，获得分析表格：```yarn hardhat coverage```

17. 拿到一个项目 可以输入  ```yarn 和 yarn hardhat deploy```来安装此项目所有的依赖项。
18. solhint：分析代码是否存在潜在错误.
    输入``` yarn solhint contracts/*.sol(这里是你想测试的文件)```
19. 安装hardhat-deploy包进行部署：https://github.com/wighawag/hardhat-deploy?tab=readme-ov-file#installation
    ``` yarn add --dev hardhat-deploy``` 
    在hardhat.config中加入```require("hardhat-deploy")```
    安装
    ```npm install --save-dev @nomicfoundation/hardhat-ethers hardhat-deploy-ethers ethers```
    安装完成后，在deploy文件夹中添加的所有脚本都会在执行"yarn hardhat deploy"时被运行。
20. 使用helper-hardhat-config,使用aave，部署到多个链上并使用多个不同的地址，if chainId is X use address Y, if chinaId is Z, use address C。
    新建helper-hardhat-config.js


21. 当使用localhost作为测试网络时，在运行本地网络时，需要确保Hardhat节点正在运行。
    ```
    npx hardhat node
    ```