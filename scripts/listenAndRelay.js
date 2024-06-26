const { ethers } = require("ethers");
require("dotenv").config();
/**
 * 用于监听中继链的事件，并在接收到事件时调用相应的平行链方法，实现跨链通信。
 */

//注意：除了userChain，其余的还没有实现！
// Layer 1 provider (Sepolia)
const l1Provider = new ethers.providers.JsonRpcProvider(
    process.env.Sepolia_RPC_URL,
);

// Layer 2 provider (zkSync)
const l2Provider = new ethers.providers.JsonRpcProvider(process.env.L2_RPC_URL);

// RelayChain ABI and address
const relayChainAbi = [
    "event DonationRecorded(address indexed from, string medicineName, string batchNumber, uint256 timestamp)",
    "event LogisticsUpdated(address indexed from, string logisticsInfo, uint256 timestamp)",
];
const relayChainAddress = "RELAY_CHAIN_ADDRESS_ON_SEPOLIA";

// GovernmentChain ABI and address
const governmentChainAbi = [
    "function receiveDonation(address from, string memory medicineName, string memory batchNumber) public",
    "function updateLogistics(address from, string memory logisticsInfo) public",
];
const governmentChainAddress = "GOVERNMENT_CHAIN_ADDRESS_ON_ZKSYNC";

// UserChain ABI and address
const userChainAbi = [
    "function receiveDonation(address from, string memory medicineName, string memory batchNumber) public",
    "function updateLogistics(address from, string memory logisticsInfo) public",
];
const userChainAddress = "USER_CHAIN_ADDRESS_ON_ZKSYNC";

// LogisticsChain ABI and address
const logisticsChainAbi = [
    "function receiveDonation(address from, string memory medicineName, string memory batchNumber) public",
    "function updateLogistics(address from, string memory logisticsInfo) public",
];
const logisticsChainAddress = "LOGISTICS_CHAIN_ADDRESS_ON_ZKSYNC";

// Create contracts
const relayChain = new ethers.Contract(
    relayChainAddress,
    relayChainAbi,
    l1Provider,
);
const governmentChain = new ethers.Contract(
    governmentChainAddress,
    governmentChainAbi,
    l2Provider.getSigner(),
);
const userChain = new ethers.Contract(
    userChainAddress,
    userChainAbi,
    l2Provider.getSigner(),
);
const logisticsChain = new ethers.Contract(
    logisticsChainAddress,
    logisticsChainAbi,
    l2Provider.getSigner(),
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
relayChain.on("LogisticsUpdated", async (transportId, status, location, timestamp) => {
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
        timestamp
    );
    await tx.wait();
    console.log(`Logistics update relayed to Layer 2`);
});

relayChain.on("MedicineReceived", async (receiver, medicineName, batchNumber, timestamp) => {
    console.log(`Medicine received by ${receiver}: ${medicineName} ${batchNumber} at ${timestamp}`);

    // Call handleMedicineReceived on GovernmentChain
    const tx1 = await governmentChain.handleMedicineReceived(receiver, medicineName, batchNumber);
    await tx1.wait();
    console.log("Medicine received recorded on GovernmentChain");

    // Call handleMedicineReceived on LogisticsChain
    const tx2 = await logisticsChain.handleMedicineReceived(receiver, medicineName, batchNumber);
    await tx2.wait();
    console.log("Medicine received recorded on LogisticsChain");
});
