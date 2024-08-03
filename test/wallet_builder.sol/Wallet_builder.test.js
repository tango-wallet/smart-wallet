const { ethers } = require("hardhat");
const chai = require("chai");
const { solidity } = require("ethereum-waffle");
chai.use(solidity);
const { expect } = chai;

const fs = require('fs');
const path = require('path');

const confirmations_number = 1;
const zeroAddress = '0x0000000000000000000000000000000000000000';
const oneEther = ethers.utils.parseEther("1");
let signer, owner1, owner2, notAnOwner1, notAnOwner2;
let tx, provider, wallet_Builder;

describe("Contract tests", () => {
    before(async () => {
        console.log("-----------------------------------------------------------------------------------");
        console.log(" -- Contract tests start");
        console.log("-----------------------------------------------------------------------------------");

        // Get Signer and provider
        [signer, owner1, owner2, notAnOwner1, notAnOwner2] = await ethers.getSigners();
        provider = ethers.provider;

        // Deploy contract
        const contractPath = "src/contracts/Wallet_Builder.sol:Wallet_Builder";
        const contractFactory = await ethers.getContractFactory(contractPath, signer);
        wallet_Builder = await contractFactory.deploy();

        // Wait for the transaction to be mined
        await provider.waitForTransaction(wallet_Builder.deployTransaction.hash, confirmations_number);
    });

    describe("Initialization tests", () => {
        it("wallet_Builder contract test", async () => {
            expect(await wallet_Builder.isAnOwner(signer.address)).to.be.true;
        });
    });

    describe("addOwner function tests", () => {
        it("Try addOwner with unauthorized account ", async () => {
            const wallet_Builder_aux = wallet_Builder.connect(notAnOwner1);
            await expect(wallet_Builder_aux.addOwner(owner2.address)).to.be.revertedWith("OnlyOwner");
        });

        it("Try addOwner with already owner address ", async () => {
            await expect(wallet_Builder.addOwner(signer.address)).to.be.revertedWith("OwnerExists");
        });

        it("Try addOwner with zero address ", async () => {
            await expect(wallet_Builder.addOwner(zeroAddress)).to.be.revertedWith("ZeroAddress");
        });

        it("addOwner test", async () => {
            tx = await wallet_Builder.addOwner(owner2.address);
            await provider.waitForTransaction(tx.hash, confirmations_number);

            expect(await wallet_Builder.isAnOwner(owner2.address)).to.be.true;
        });
    });

    describe("getOwners function tests", () => {
        it("getOwners test", async () => {
            const owners = await wallet_Builder.getOwners();
            expect(owners).to.have.lengthOf(2);
            expect(owners[0]).to.be.equal(signer.address);
            expect(owners[1]).to.be.equal(owner2.address);
        });
    });

    describe("removeOwner function tests", () => {
        it("Try removeOwner with unauthorized account ", async () => {
            const wallet_Builder_aux = wallet_Builder.connect(notAnOwner1);
            await expect(wallet_Builder_aux.removeOwner(owner2.address)).to.be.revertedWith("OnlyOwner");
        });

        it("Try removeOwner with non owner address ", async () => {
            await expect(wallet_Builder.removeOwner(notAnOwner1.address)).to.be.revertedWith("NotAnOwner");
        });

        it("removeOwner test", async () => {
            tx = await wallet_Builder.removeOwner(owner2.address);
            await provider.waitForTransaction(tx.hash, confirmations_number);

            expect(await wallet_Builder.isAnOwner(owner2.address)).to.be.false;
        });
    });

    describe("getOwners function tests", () => {
        it("getOwners test", async () => {
            const owners = await wallet_Builder.getOwners();
            expect(owners).to.have.lengthOf(1);
            expect(owners[0]).to.be.equal(signer.address);
        });
    });

    describe("createWallet function tests", () => {
        it("Try createWallet with unauthorized account ", async () => {
            const wallet_Builder_aux = wallet_Builder.connect(notAnOwner1);
            await expect(wallet_Builder_aux.createWallet(notAnOwner1.address)).to.be.revertedWith("OnlyOwner");
        });

        it("createWallet test", async () => {
            const wallet_index = await wallet_Builder.wallet_index();

            tx = await wallet_Builder.createWallet(owner1.address);
            await provider.waitForTransaction(tx.hash, confirmations_number);

            // Get address
            const wallet_address = await wallet_Builder.wallets(wallet_index+1);
            expect(wallet_address).to.not.be.equal(zeroAddress);

            // GEt abi
            const contractPath = 'artifacts/src/contracts/Wallet_Builder.sol/Wallet_Builder.json';
            const contractJson = JSON.parse(fs.readFileSync(contractPath, 'utf8'));
            const abi = contractJson.abi;
            
            // Instantiate the wallet contract
            const smart_wallet  = new ethers.Contract(wallet_address, abi, signer);

            // Check owner
            expect(await smart_wallet.isAnOwner(owner1.address)).to.be.true;
        });
    });
});