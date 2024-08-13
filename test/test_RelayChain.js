const { expect } = require("chai");
const { ethers } = require("hardhat");

describe("RelayChain", function () {
    let relayChain, owner, addr1;

    beforeEach(async function () {
        [owner, addr1] = await ethers.getSigners();
        const RelayChainFactory = await ethers.getContractFactory("RelayChain");
        relayChain = await RelayChainFactory.deploy();
        await relayChain.deploymentTransaction().wait();
        console.log("Contract deployed at:", relayChain.target);
    });

    it("Should set the right owner", async function () {
        expect(await relayChain.owner()).to.equal(owner.address);
    });

    it("Should call recordDonation without errors", async function () {
        const medicineName = "Medicine A";
        const batchNumber = "Batch123";

        await expect(relayChain.recordDonation(medicineName, batchNumber)).to
            .not.be.reverted;
    });

    it("Should call recordMedicineReceived without errors", async function () {
        const receiver = addr1.address;
        const medicineName = "Medicine B";
        const batchNumber = "Batch456";

        await expect(
            relayChain.recordMedicineReceived(
                receiver,
                medicineName,
                batchNumber,
            ),
        ).to.not.be.reverted;
    });

    it("Should call updateLogistics without errors", async function () {
        const transportId = 1;
        const status = "In Transit";
        const location = "Location A";

        await expect(relayChain.updateLogistics(transportId, status, location))
            .to.not.be.reverted;
    });
    it("Should set the right owner", async function () {
        expect(await relayChain.owner()).to.equal(owner.address);
    });
});
