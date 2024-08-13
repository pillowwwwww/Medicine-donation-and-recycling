const { expect } = require("chai");
const { ethers } = require("hardhat");

describe("UserChain", function () {
    let UserChain, userChain, owner, addr1;

    beforeEach(async function () {
        [owner, addr1] = await ethers.getSigners();
        UserChain = await ethers.getContractFactory("UserChain");
        userChain = await UserChain.deploy(
            owner.address,
            owner.address,
            owner.address,
        );
        await userChain.deploymentTransaction().wait();

        // 使用 setUser 方法手动设置用户数据
        const username = "Alice";
        const idNumber = "1234567890";
        await userChain.setUser(owner.address, username, idNumber);

        // 验证用户数据是否已设置
        const user = await userChain.users(owner.address);
        expect(user.username).to.equal(username);
        expect(user.idNumber).to.equal(idNumber);
        expect(user.userAddress).to.equal(owner.address);
        expect(user.creditScore).to.equal(0);
    });

    it("Should donate medicine", async function () {
        const medicineName = "Medicine A";
        const batchNumber = "Batch123";
        const expirationDate = Math.floor(Date.now() / 1000) + 3600; // 1 hour from now
        const productionLocation = "Factory A";

        // 忽略跨链交互和事件触发部分，只测试 donateMedicine 逻辑
        await userChain
            .connect(owner)
            .donateMedicine(
                medicineName,
                batchNumber,
                expirationDate,
                productionLocation,
            );

        const donationCount = await userChain.getDonationCount(owner.address);
        expect(donationCount).to.equal(1);

        const donation = await userChain.getDonation(owner.address, 0);
        expect(donation.name).to.equal(medicineName);
        expect(donation.batchNumber).to.equal(batchNumber);
    });

    it("Should receive medicine", async function () {
        const medicineName = "Medicine A";
        const batchNumber = "Batch123";
        const expirationDate = Math.floor(Date.now() / 1000) + 3600; // 1 hour from now
        const productionLocation = "Factory A";

        await userChain
            .connect(owner)
            .donateMedicine(
                medicineName,
                batchNumber,
                expirationDate,
                productionLocation,
            );

        // 忽略跨链交互和事件触发部分，只测试 receiveMedicine 逻辑
        await userChain
            .connect(owner)
            .receiveMedicine(medicineName, batchNumber);

        const donation = await userChain.getDonation(owner.address, 0);
        expect(donation.received).to.equal(true);
    });
});
