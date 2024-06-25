const { ethers } = require("ethers");

//注意：除了userChain，其余的还没有实现！
// Layer 1 provider (Sepolia)
const l1Provider = new ethers.providers.JsonRpcProvider(
    "https://sepolia.infura.io/v3/YOUR_INFURA_PROJECT_ID",
);

// Layer 2 provider (zkSync)
const l2Provider = new ethers.providers.JsonRpcProvider(
    "https://zksync2-testnet.zksync.dev",
);

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

relayChain.on("LogisticsUpdated", async (from, logisticsInfo, timestamp) => {
    console.log(
        `Logistics updated from ${from}: ${logisticsInfo} at ${timestamp}`,
    );

    // Call updateLogistics on GovernmentChain
    const tx1 = await governmentChain.updateLogistics(from, logisticsInfo);
    await tx1.wait();
    console.log("Logistics updated on GovernmentChain");

    // Call updateLogistics on LogisticsChain
    const tx2 = await logisticsChain.updateLogistics(from, logisticsInfo);
    await tx2.wait();
    console.log("Logistics updated on LogisticsChain");
});
