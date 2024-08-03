const { ethers } = require("hardhat");

async function main() {

    console.log("---------------------------------------------------------------------------------------");
    console.log("-- Deploy contracts process start...");
    console.log("---------------------------------------------------------------------------------------");

    // Get Signer
    [signer] = await ethers.getSigners();
    const provider = ethers.provider;

    // Deploy contract
    const contractPath = "src/contracts/Wallet_Template_v1.sol:Wallet_Template_v1";
    const contractFactory = await ethers.getContractFactory(contractPath, signer);
    const wallet_Template = await contractFactory.deploy(signer.address);

    // Wait for the transaction to be mined
    const confirmations_number = 1;
    await provider.waitForTransaction(wallet_Template.deployTransaction.hash, confirmations_number);

    console.log("---------------------------------------------------------------------------------------");
    console.log("-- Contract Address:\t", wallet_Template.address);
    console.log("---------------------------------------------------------------------------------------");    
}

main()
    .then(() => process.exit(0))
    .catch(error => {
        console.error(error);
        process.exit(1);
    });