require('dotenv').config();
require('@nomiclabs/hardhat-ethers');
require("@nomicfoundation/hardhat-verify");

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
        scroll_devnet: {
            chainId:  2227728,
            timeout:  20000,
            gasPrice: 8000000000,
            gas:      "auto",
            name:     "Scroll Devnet",		
            url:      process.env.SCROLL_ACCESSPOINT_URL,
            from:     process.env.SCROLL_ACCOUNT,
            accounts: [process.env.SCROLL_PRIVATE_KEY]
        }
    },
    etherscan: {
        // Etherscan API key 
        apiKey: {
            scroll_devnet: "scroll_devnet",
        },
        customChains: [
            {
              network: "scroll_devnet",
              chainId: 2227728,
              urls: {
                apiURL: "https://l1sload-blockscout.scroll.io/api",
                browserURL: "https://l1sload-blockscout.scroll.io/"
              }
            }
        ]
    },
    sourcify: {
        // Disabled by default
        // Doesn't need an API key
        enabled: false
    }
};
