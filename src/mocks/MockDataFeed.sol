// SPDX-License-Identifier: MIT
pragma solidity 0.8.24;

contract MockDataFeed {
    function latestRoundData() public pure 
    returns (
            uint80 roundId,
            int256 answer,
            uint256 startedAt,
            uint256 updatedAt,
            uint80 answeredInRound
        )
    {
        // Simulate a fixed price of 2000 * 10^8 (like Chainlink would do)
        return (0, 2000 * 10 ** 8, 0, 0, 0);
    }
}