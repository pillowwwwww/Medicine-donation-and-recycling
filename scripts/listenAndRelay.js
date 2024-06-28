const { ethers } = require("ethers");
require("dotenv").config();

/**
 * 监听中继链的事件，并在接收到事件时调用相应的平行链方法，实现跨链通信。
 */

// Layer 1 provider (Sepolia)
const L1Provider = new ethers.providers.JsonRpcProvider(
    process.env.Sepolia_RPC_URL,
);

// Layer 2 provider (zkSync)
const L2Provider = new ethers.providers.JsonRpcProvider(
    process.env.L2_Alchemy_RPC_URL,
);

// RelayChain ABI and address
const relayChainAbiPath =
    "./artifacts/contracts/RelayChain.sol/RelayChain.json";
const relayChainAbiJson = JSON.parse(
    fs.readFileSync(relayChainAbiPath, "utf8"),
);
const relayChainAbi = relayChainAbiJson.abi;

//relay chain在Sepolia上的地址，如果需要本地测试，要手动修改地址
const relayChainAddress = process.env.RELAY_CHAIN_ADDRESS_ON_SEPOLIA;

// GovernmentChain ABI and address
const governmentChainAbiPath =
    "./artifacts/contracts/RelayChain.sol/GovernmentChain.json";
const governmentChainAbiJson = JSON.parse(
    fs.readFileSync(governmentChainAbiPath, "utf8"),
);
const governmentChainAbi = relayChainAbiJson.abi;
const governmentChainAddress =
    process.env.GOVERNMENT_CHAIN_ADDRESS_ON_LOCALHOST;

// UserChain ABI and address
const userChainAbiPath = "./artifacts/contracts/RelayChain.sol/UserChain.json";
const userChainAbiJson = JSON.parse(fs.readFileSync(userChainAbiPath, "utf8"));
const userChainAbi = userChainAbiJson.abi;
const userChainAddress = process.env.USER_CHAIN_ADDRESS_ON_LOCALHOST;

// LogisticsChain ABI and address
const logisticsChainAbiPath =
    "./artifacts/contracts/RelayChain.sol/LogisticsChain.json";
const logisticsChainAbiJson = JSON.parse(
    fs.readFileSync(logisticsChainAbiPath, "utf8"),
);
const logisticsChainAbi = logisticsChainAbiJson.abi;
const logisticsChainAddress = process.env.LOGISTICS_CHAIN_ADDRESS_ON_LOCALHOST;

// Create contracts
const relayChain = new ethers.Contract(
    relayChainAddress,
    relayChainAbi,
    L1Provider,
);
const governmentChain = new ethers.Contract(
    governmentChainAddress,
    governmentChainAbi,
    L2Provider.getSigner(),
);
const userChain = new ethers.Contract(
    userChainAddress,
    userChainAbi,
    L2Provider.getSigner(),
);
const logisticsChain = new ethers.Contract(
    logisticsChainAddress,
    logisticsChainAbi,
    L2Provider.getSigner(),
);
//Relay Chain触发DonationRecorded
relayChain.on(
    "DonationRecorded",
    async (from, medicineName, batchNumber, timestamp) => {
        console.log(
            `Donation recorded from ${from}: ${medicineName} ${batchNumber} at ${timestamp}`,
        );

        // Call receiveDonation on GovernmentChain
        const tx1 = await governmentChain.receiveDonation(
            from,
            medicineName,
            batchNumber,
        );
        await tx1.wait();
        console.log("Donation recorded on GovernmentChain");

        // Call receiveDonation on UserChain
        const tx2 = await userChain.receiveDonation(
            from,
            medicineName,
            batchNumber,
        );
        await tx2.wait();
        console.log("Donation recorded on UserChain");
    },
);
//监听物流信息更新
relayChain.on(
    "LogisticsUpdated",
    async (transportId, status, location, timestamp) => {
        console.log(
            `Logistics updated: Transport ID ${transportId}, Status ${status}, Location ${location}`,
        );

        // 调用 LogisticsChain 的 relayUpdate 方法
        const tx = await logisticsChain.relayUpdate(
            transportId,
            relayChainAddress,
            relayChainAddress,
            status,
            location,
            timestamp,
        );
        await tx.wait();
        console.log(`Logistics update relayed to Layer 2`);
    },
);

relayChain.on(
    "MedicineReceived",
    async (receiver, medicineName, batchNumber, timestamp) => {
        console.log(
            `Medicine received by ${receiver}: ${medicineName} ${batchNumber} at ${timestamp}`,
        );

        // Call handleMedicineReceived on GovernmentChain
        const tx1 = await governmentChain.handleMedicineReceived(
            receiver,
            medicineName,
            batchNumber,
        );
        await tx1.wait();
        console.log("Medicine received recorded on GovernmentChain");

        // Call handleMedicineReceived on LogisticsChain
        const tx2 = await logisticsChain.handleMedicineReceived(
            receiver,
            medicineName,
            batchNumber,
        );
        await tx2.wait();
        console.log("Medicine received recorded on LogisticsChain");
    },
);
