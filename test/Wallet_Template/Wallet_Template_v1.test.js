const { ethers } = require("hardhat");
const chai = require("chai");
const { solidity } = require("ethereum-waffle");
chai.use(solidity);
const { expect } = chai;

const confirmations_number = 1;
const zeroAddress = '0x0000000000000000000000000000000000000000';
const oneEther = ethers.utils.parseEther("1");
let signer, owner1, owner2, notAnOwner1, notAnOwner2;
let tx, provider, wallet_Template;

describe("Contract tests", () => {
    before(async () => {
        console.log("-----------------------------------------------------------------------------------");
        console.log(" -- Contract tests start");
        console.log("-----------------------------------------------------------------------------------");

        // Get Signer and provider
        [signer, owner1, owner2, notAnOwner1, notAnOwner2] = await ethers.getSigners();
        provider = ethers.provider;

        // Deploy contract
        const contractPath = "src/contracts/Wallet_Template_v1.sol:Wallet_Template_v1";
        const contractFactory = await ethers.getContractFactory(contractPath, signer);
        wallet_Template = await contractFactory.deploy(owner1.address);

        // Wait for the transaction to be mined
        await provider.waitForTransaction(wallet_Template.deployTransaction.hash, confirmations_number);
    });

    describe("Initialization tests", () => {
        it("wallet_Template contract test", async () => {
            expect(await wallet_Template.isAnOwner(owner1.address)).to.be.true;
        });
    });

    describe("addOwner function tests", () => {
        it("Try addOwner with unauthorized account ", async () => {
            const wallet_Template_aux = wallet_Template.connect(notAnOwner1);
            await expect(wallet_Template_aux.addOwner(owner2.address)).to.be.revertedWith("OnlyOwner");
        });

        it("Try addOwner with already owner address ", async () => {
            const wallet_Template_aux = wallet_Template.connect(owner1);
            await expect(wallet_Template_aux.addOwner(owner1.address)).to.be.revertedWith("OwnerExists");
        });

        it("Try addOwner with zero address ", async () => {
            const wallet_Template_aux = wallet_Template.connect(owner1);
            await expect(wallet_Template_aux.addOwner(zeroAddress)).to.be.revertedWith("ZeroAddress");
        });

        it("addOwner test", async () => {
            const wallet_Template_aux = wallet_Template.connect(owner1);
            tx = await wallet_Template_aux.addOwner(owner2.address);
            await provider.waitForTransaction(tx.hash, confirmations_number);

            expect(await wallet_Template.isAnOwner(owner2.address)).to.be.true;
        });
    });

    describe("getOwners function tests", () => {
        it("getOwners test", async () => {
            const owners = await wallet_Template.getOwners();
            expect(owners).to.have.lengthOf(2);
            expect(owners[0]).to.be.equal(owner1.address);
            expect(owners[1]).to.be.equal(owner2.address);
        });
    });

    describe("removeOwner function tests", () => {
        it("Try removeOwner with unauthorized account ", async () => {
            const wallet_Template_aux = wallet_Template.connect(notAnOwner1);
            await expect(wallet_Template_aux.removeOwner(owner2.address)).to.be.revertedWith("OnlyOwner");
        });

        it("Try removeOwner with non owner address ", async () => {
            const wallet_Template_aux = wallet_Template.connect(owner1);
            await expect(wallet_Template_aux.removeOwner(notAnOwner1.address)).to.be.revertedWith("NotAnOwner");
        });

        it("removeOwner test", async () => {
            const wallet_Template_aux = wallet_Template.connect(owner1);
            tx = await wallet_Template_aux.removeOwner(owner2.address);
            await provider.waitForTransaction(tx.hash, confirmations_number);

            expect(await wallet_Template.isAnOwner(owner2.address)).to.be.false;
        });
    });

    describe("getOwners function tests", () => {
        it("getOwners test", async () => {
            const owners = await wallet_Template.getOwners();
            expect(owners).to.have.lengthOf(1);
            expect(owners[0]).to.be.equal(owner1.address);
        });
    });

    describe("addOwnerWithSignature function tests", () => {
        it("try ddOwnerWithSignature with wrong selector test", async () => {
            const functionSignature = wallet_Template.interface.getSighash("removeOwner(address)");
            const encodedParams = ethers.utils.defaultAbiCoder.encode(["address"], [owner2.address]);
            const data = functionSignature + encodedParams.slice(2); // Concatenar el selector y los parámetros

            // Sign tx
            const messageHash = ethers.utils.keccak256(data);
            const signature = await owner1.signMessage(ethers.utils.arrayify(messageHash));

            // Call `addOwnerWithSignature` function with signer
            await expect(wallet_Template.addOwnerWithSignature(data, signature)).to.be.revertedWith("WrongSelector");
        });

        it("try addOwnerWithSignature with already owner address test", async () => {
            const functionSignature = wallet_Template.interface.getSighash("addOwner(address)");
            const encodedParams = ethers.utils.defaultAbiCoder.encode(["address"], [owner1.address]);
            const data = functionSignature + encodedParams.slice(2); // Concatenar el selector y los parámetros

            // Sign tx
            const messageHash = ethers.utils.keccak256(data);
            const signature = await owner1.signMessage(ethers.utils.arrayify(messageHash));

            // Call `addOwnerWithSignature` function with signer
            await expect(wallet_Template.addOwnerWithSignature(data, signature)).to.be.revertedWith("OwnerExists");
        });

        it("try addOwnerWithSignature with unauthorized account test", async () => {
            const functionSignature = wallet_Template.interface.getSighash("addOwner(address)");
            const encodedParams = ethers.utils.defaultAbiCoder.encode(["address"], [owner2.address]);
            const data = functionSignature + encodedParams.slice(2); // Concatenar el selector y los parámetros

            // Sign tx
            const messageHash = ethers.utils.keccak256(data);
            const signature = await notAnOwner1.signMessage(ethers.utils.arrayify(messageHash));

            // Call `addOwnerWithSignature` function with signer
            await expect(wallet_Template.addOwnerWithSignature(data, signature)).to.be.revertedWith("InvalidSigner");
        });
        
        it("addOwnerWithSignature test", async () => {
            const functionSignature = wallet_Template.interface.getSighash("addOwner(address)");
            const encodedParams = ethers.utils.defaultAbiCoder.encode(["address"], [owner2.address]);
            const data = functionSignature + encodedParams.slice(2); // Concatenar el selector y los parámetros

            // Sign tx
            const messageHash = ethers.utils.keccak256(data);
            const signature = await owner1.signMessage(ethers.utils.arrayify(messageHash));

            // Call `addOwnerWithSignature` function with signer
            tx = await wallet_Template.addOwnerWithSignature(data, signature);
            await provider.waitForTransaction(tx.hash, confirmations_number);

            // Verificar que el nuevo dueño fue agregado
            expect(await wallet_Template.isAnOwner(owner2.address)).to.be.true;
        });
    });

    describe("removeOwnerWithSignature function tests", () => {
        it("try removeOwnerWithSignature with wrong selector test", async () => {
            const functionSignature = wallet_Template.interface.getSighash("addOwner(address)");
            const encodedParams = ethers.utils.defaultAbiCoder.encode(["address"], [owner2.address]);
            const data = functionSignature + encodedParams.slice(2); // Concatenar el selector y los parámetros

            // Sign tx
            const messageHash = ethers.utils.keccak256(data);
            const signature = await owner1.signMessage(ethers.utils.arrayify(messageHash));

            // Call `removeOwnerWithSignature` function with signer
            await expect(wallet_Template.removeOwnerWithSignature(data, signature)).to.be.revertedWith("WrongSelector");
        });

        it("try removeOwnerWithSignature with not an owner address test", async () => {
            const functionSignature = wallet_Template.interface.getSighash("removeOwner(address)");
            const encodedParams = ethers.utils.defaultAbiCoder.encode(["address"], [notAnOwner1.address]);
            const data = functionSignature + encodedParams.slice(2); // Concatenar el selector y los parámetros

            // Sign tx
            const messageHash = ethers.utils.keccak256(data);
            const signature = await owner1.signMessage(ethers.utils.arrayify(messageHash));

            // Call `removeOwnerWithSignature` function with signer
            await expect(wallet_Template.removeOwnerWithSignature(data, signature)).to.be.revertedWith("NotAnOwner");
        });

        it("try removeOwnerWithSignature with unauthorized account test", async () => {
            const functionSignature = wallet_Template.interface.getSighash("removeOwner(address)");
            const encodedParams = ethers.utils.defaultAbiCoder.encode(["address"], [owner2.address]);
            const data = functionSignature + encodedParams.slice(2); // Concatenar el selector y los parámetros

            // Sign tx
            const messageHash = ethers.utils.keccak256(data);
            const signature = await notAnOwner1.signMessage(ethers.utils.arrayify(messageHash));

            // Call `removeOwnerWithSignature` function with signer
            await expect(wallet_Template.removeOwnerWithSignature(data, signature)).to.be.revertedWith("InvalidSigner");
        });
        
        it("removeOwnerWithSignature test", async () => {
            const functionSignature = wallet_Template.interface.getSighash("removeOwner(address)");
            const encodedParams = ethers.utils.defaultAbiCoder.encode(["address"], [owner2.address]);
            const data = functionSignature + encodedParams.slice(2); // Concatenar el selector y los parámetros

            // Sign tx
            const messageHash = ethers.utils.keccak256(data);
            const signature = await owner1.signMessage(ethers.utils.arrayify(messageHash));

            // Call `removeOwnerWithSignature` function with signer
            tx = await wallet_Template.removeOwnerWithSignature(data, signature);
            await provider.waitForTransaction(tx.hash, confirmations_number);

            // Verificar que el nuevo dueño fue agregado
            expect(await wallet_Template.isAnOwner(owner2.address)).to.be.false;
        });
    });

    describe("getBalance function tests", () => {
        it("getBalance test", async () => {
            const balance = await wallet_Template.getBalance();
            expect(balance).to.be.equal(0);

            tx = await owner1.sendTransaction({ to: wallet_Template.address, value: oneEther });
            await provider.waitForTransaction(tx.hash, confirmations_number);

            const balance2 = await wallet_Template.getBalance();
            expect(balance2).to.be.equal(oneEther);
        });
    });

    describe("sendNativeToken function tests", () => {
        it("try sendNativeToken with unauthrized account", async () => {
            const wallet_Template_aux = wallet_Template.connect(notAnOwner1);
            await expect(wallet_Template_aux.sendNativeToken(owner1.address, oneEther)).to.be.revertedWith("OnlyOwner");
        });

        it("try sendNativeToken to zero address test", async () => {
            const wallet_Template_aux = wallet_Template.connect(owner1);
            await expect(wallet_Template_aux.sendNativeToken(zeroAddress, oneEther)).to.be.revertedWith("ZeroAddress");
        });

        it("try sendNativeToken with insufficient balance test", async () => {
            const wallet_Template_aux = wallet_Template.connect(owner1);
            await expect(wallet_Template_aux.sendNativeToken(owner1.address, oneEther.mul(2))).to.be.revertedWith("InsufficientBalance");
        });

        it("sendNativeToken test", async () => {
            const balance = await wallet_Template.getBalance();
            expect(balance).to.be.equal(oneEther);

            const wallet_Template_aux = wallet_Template.connect(owner1);
            tx = await wallet_Template_aux.sendNativeToken(owner1.address, oneEther);
            await provider.waitForTransaction(tx.hash, confirmations_number);

            const balance2 = await wallet_Template.getBalance();
            expect(balance2).to.be.equal(0);
        });
    });

    describe("getBalance function tests", () => {
        it("getBalance test", async () => {
            const balance = await wallet_Template.getBalance();
            expect(balance).to.be.equal(0);

            tx = await owner1.sendTransaction({ to: wallet_Template.address, value: oneEther });
            await provider.waitForTransaction(tx.hash, confirmations_number);

            const balance2 = await wallet_Template.getBalance();
            expect(balance2).to.be.equal(oneEther);
        });
    });

    describe("getUSDC function tests", () => {
        it("USDC test", async () => {
            const usdc = await wallet_Template.getUSDC();
            console.log(usdc);
        })
    })


    describe("sendNativeTokenWithSignature function tests", () => {
        it("try sendNativeTokenWithSignature with wrong selector test", async () => {
            const functionSignature = wallet_Template.interface.getSighash("removeOwner(address)");
            const encodedParams = ethers.utils.defaultAbiCoder.encode(["address", "uint256"], [owner2.address, oneEther]);
            const data = functionSignature + encodedParams.slice(2); // Concatenar el selector y los parámetros

            // Sign tx
            const messageHash = ethers.utils.keccak256(data);
            const signature = await owner1.signMessage(ethers.utils.arrayify(messageHash));

            // Call `sendNativeTokenWithSignature` function with signer
            await expect(wallet_Template.sendNativeTokenWithSignature(data, signature)).to.be.revertedWith("WrongSelector");
        });

        it("try sendNativeTokenWithSignature with InsufficientBalance test", async () => {
            const functionSignature = wallet_Template.interface.getSighash("sendNativeToken(address,uint256)");
            const encodedParams = ethers.utils.defaultAbiCoder.encode(["address", "uint256"], [owner2.address, oneEther.mul(2)]);
            const data = functionSignature + encodedParams.slice(2); // Concatenar el selector y los parámetros

            // Sign tx
            const messageHash = ethers.utils.keccak256(data);
            const signature = await owner1.signMessage(ethers.utils.arrayify(messageHash));

            // Call `sendNativeTokenWithSignature` function with signer
            await expect(wallet_Template.sendNativeTokenWithSignature(data, signature)).to.be.revertedWith("InsufficientBalance");
        });

        it("try sendNativeTokenWithSignature with unauthorized account test", async () => {
            const functionSignature = wallet_Template.interface.getSighash("sendNativeToken(address,uint256)");
            const encodedParams = ethers.utils.defaultAbiCoder.encode(["address", "uint256"], [owner2.address, oneEther]);
            const data = functionSignature + encodedParams.slice(2); // Concatenar el selector y los parámetros

            // Sign tx
            const messageHash = ethers.utils.keccak256(data);
            const signature = await notAnOwner1.signMessage(ethers.utils.arrayify(messageHash));

            // Call `sendNativeTokenWithSignature` function with signer
            await expect(wallet_Template.sendNativeTokenWithSignature(data, signature)).to.be.revertedWith("InvalidSigner");
        });
        
        it("sendNativeTokenWithSignature test", async () => {
            const functionSignature = wallet_Template.interface.getSighash("sendNativeToken(address,uint256)");
            const encodedParams = ethers.utils.defaultAbiCoder.encode(["address", "uint256"], [owner2.address, oneEther]);
            const data = functionSignature + encodedParams.slice(2); // Concatenar el selector y los parámetros

            // Sign tx
            const messageHash = ethers.utils.keccak256(data);
            const signature = await owner1.signMessage(ethers.utils.arrayify(messageHash));

            // Call `sendNativeTokenWithSignature` function with signer
            tx = await wallet_Template.sendNativeTokenWithSignature(data, signature);
            await provider.waitForTransaction(tx.hash, confirmations_number);

            // Check balance
            const balance = await wallet_Template.getBalance();
            expect(balance).to.be.equal(0);
        });
    });
});