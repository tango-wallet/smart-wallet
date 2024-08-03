// SPDX-License-Identifier: MIT
pragma solidity 0.8.24;

interface IWallet_Template_v1 {


    /**
     * @notice Return is _owner is an owner of the smart wallet.
     * @return True if _owner is an owner of the smart wallet.
     * @param _owner Address to check.
     */
    function isOwner(address _owner) external view returns (bool);

    /**
     * @notice Return the owners of the smart wallet.
     * @return Owners array of the smart wallet.
     */
    function getOwners() external view returns (address[] memory);

    /**
     * @notice Add a new owner to the smart wallet.
     * @param _owner Address to add as owner.
     */
    function addOwner(address _owner) external;

    /**
     * @notice Remove an owner from the smart wallet.
     * @param _owner Address to remove as owner.
     */
    function removeOwner(address _owner) external;

    /**
     * @notice Return the balance of the smart wallet in native tokens.
     * @return The balance of the smart wallet.
     */
    function getBalance() external view returns (uint256);

    /**
     * @notice Send `amount` of ether to `recipient`.
     * @param _recipient Address that will receive the funds.
     * @param _amount Amount of ether to send.
     */
    function sendEther(address payable _recipient, uint256 _amount) external;

    /**
     * @notice Execute an arbitrary transaction from the smart wallet.
     * @param _target Address of the contract being called.
     * @param _value Amount of ether to send.
     * @param _signature Signature of the owner authorizing the execution
     * @param _data Transaction data (function call).
     */
    function executeTransaction(address _target, uint256 _value, string memory _signature, bytes memory _data) external payable returns (bytes memory);

    /**
     * @notice Allows the smart wallet to receive native tokens.
     */
    receive() external payable;
}
