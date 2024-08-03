// SPDX-License-Identifier: MIT
pragma solidity 0.8.24;

import "src/abstract_contracts/Owner.sol";
import "src/contracts/Wallet_Template_v1.sol";

contract Wallet_Builder is Owner {

    /// EVENTS

    event WalletCreated(address indexed _wallet, address indexed _owner);

    /// STATE VARIABLES

    uint256 public wallet_index;
    mapping(uint256 wallet_index => address wallet_address) public wallets;
    mapping(address wallet_address => bool isWallet) public wallet_addresses;

    /// CONSTRUCTOR

    constructor() {
        _addOwner(msg.sender);
    }

    /// EXTERNAL FUNCTIONS

    /**
     * @notice Create a new smart wallet.
     * @param _owner Address to add as owner.
     * @return Address of the new smart wallet.
     */
    function createWallet(address _owner) external onlyOwner returns (address) {
        wallet_index++;
        Wallet_Template_v1 _wallet = new Wallet_Template_v1(_owner);
        wallets[wallet_index] = address(_wallet);
        wallet_addresses[address(_wallet)] = true;

        emit WalletCreated(address(_wallet), _owner);
        return address(_wallet);
    }
}