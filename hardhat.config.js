require('dotenv').config();
require('@nomiclabs/hardhat-ethers');

/** @type import('hardhat/config').HardhatUserConfig */
module.exports = {
    solidity: "0.8.24",
    paths: {
        sources: "./src",
        tests: "./test",
        cache: "./cache",
        artifacts: "./artifacts"
    },
    networks: {
        /*
        scroll_devnet: {
            chainId:  process.env.SCROLL_CHAIN_ID,
            timeout:  20000,
            gasPrice: 8000000000,
            gas:      "auto",
            name:     "Scroll Devnet",		
            url:      process.env.SCROLL_ACCESSPOINT_URL,
            from:     process.env.SCROLL_ACCOUNT,
            accounts: [process.env.SCROLL_PRIVATE_KEY]
        }
        */
    }
};
