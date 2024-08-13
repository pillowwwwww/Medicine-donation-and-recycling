const { expect } = require("chai");
const { ethers } = require("hardhat");

describe("GovernmentChain", function () {
    let GovernmentChain, governmentChain, owner, addr1, relayChain;

    beforeEach(async function () {
        [owner, addr1, relayChain] = await ethers.getSigners();
        GovernmentChain = await ethers.getContractFactory("GovernmentChain");
        governmentChain = await GovernmentChain.deploy(relayChain.address);
        await governmentChain.deploymentTransaction().wait();
    });

    it("Should verify user and set initial credit score", async function () {
        const username = "Alice";
        const idNumber = "1234567890";
        const tx = await governmentChain.verifyUser(
            addr1.address,
            username,
            idNumber,
        );
        await tx.wait();

        const user = await governmentChain.users(addr1.address);
        expect(user.username).to.equal(username);
        expect(user.creditScore).to.equal(0);
    });

    it("Should update user credit score", async function () {
        const username = "Alice";
        const idNumber = "1234567890";
        await governmentChain.verifyUser(addr1.address, username, idNumber);

        await governmentChain.updateUserCredit(addr1.address, 50);
        const user = await governmentChain.users(addr1.address);
        expect(user.creditScore).to.equal(50);
    });
    it("Should receive donation and update user credit score", async function () {
        const username = "Alice";
        const idNumber = "1234567890";
        const tx = await governmentChain.verifyUser(
            addr1.address,
            username,
            idNumber,
        );
        await tx.wait();

        const medicineName = "Medicine A";
        const batchNumber = "Batch123";
        const txDonation = await governmentChain
            .connect(relayChain)
            .receiveDonation(addr1.address, medicineName, batchNumber);
        await txDonation.wait();

        const user = await governmentChain.users(addr1.address);
        expect(user.creditScore).to.equal(10);

        // **修改前**: const donations = await governmentChain.donations(addr1.address);
        // **修改后**:
        const donations = await governmentChain.getDonations(addr1.address);
        expect(donations.length).to.equal(1);
        expect(donations[0].medicineName).to.equal(medicineName);
        expect(donations[0].batchNumber).to.equal(batchNumber);
    });

    it("Should receive donation and update user credit score", async function () {
        const username = "Alice";
        const idNumber = "1234567890";
        const tx = await governmentChain.verifyUser(
            addr1.address,
            username,
            idNumber,
        );
        await tx.wait();

        const medicineName = "Medicine A";
        const batchNumber = "Batch123";
        const txDonation = await governmentChain
            .connect(relayChain)
            .receiveDonation(addr1.address, medicineName, batchNumber);
        await txDonation.wait();

        const user = await governmentChain.users(addr1.address);
        expect(user.creditScore).to.equal(10);

        // **修改前**: const donations = await governmentChain.donations(addr1.address);
        // **修改后**:
        const donations = await governmentChain.getDonations(addr1.address);
        expect(donations.length).to.equal(1);
        expect(donations[0].medicineName).to.equal(medicineName);
        expect(donations[0].batchNumber).to.equal(batchNumber);
    });
});
