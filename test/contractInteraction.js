const { expect } = require("chai");

describe("Medicine Donation and Recycling System", function () {
    let deployer,
        user1,
        user2,
        relayChain,
        governmentChain,
        userChain,
        logisticsChain;

    before(async function () {
        [deployer, user1, user2] = await ethers.getSigners();

        // 部署 RelayChain
        const RelayChain = await ethers.getContractFactory("RelayChain");
        relayChain = await RelayChain.deploy();
        await relayChain.deployed();

        // 部署 GovernmentChain
        const GovernmentChain =
            await ethers.getContractFactory("GovernmentChain");
        governmentChain = await GovernmentChain.deploy(relayChain.address);
        await governmentChain.deployed();

        // 部署 LogisticsChain
        const LogisticsChain =
            await ethers.getContractFactory("LogisticsChain");
        logisticsChain = await LogisticsChain.deploy();
        await logisticsChain.deployed();

        // 部署 UserChain
        const UserChain = await ethers.getContractFactory("UserChain");
        userChain = await UserChain.deploy(
            relayChain.address,
            governmentChain.address,
            logisticsChain.address,
        );
        await userChain.deployed();
    });

    it("should allow user1 to donate medicine and trigger events", async function () {
        // 监听 UserChain 上的 MedicineDonated 事件
        await expect(
            userChain
                .connect(user1)
                .donateMedicine("Aspirin", "Batch001", 1693430400, "USA"),
        )
            .to.emit(userChain, "MedicineDonated")
            .withArgs(user1.address, "Aspirin", "Batch001");

        // 验证 GovernmentChain 上的事件
        const userInfo = await governmentChain.users(user1.address);
        expect(userInfo.creditScore).to.equal(10);

        // 验证 LogisticsChain 上的事件
        const transportRecord = await logisticsChain.transportRecords(1);
        expect(transportRecord.sender).to.equal(user1.address);
    });

    it("should allow user2 to receive medicine and trigger events", async function () {
        // 监听 UserChain 上的 MedicineReceived 事件
        await expect(
            userChain.connect(user2).receiveMedicine("Aspirin", "Batch001"),
        )
            .to.emit(userChain, "MedicineReceived")
            .withArgs(user2.address, "Aspirin", "Batch001");

        // 验证 GovernmentChain 上的事件
        const userInfo = await governmentChain.users(user2.address);
        expect(userInfo.creditScore).to.equal(5);
    });
});
