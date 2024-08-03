// SPDX-License-Identifier: MIT
pragma solidity 0.8.24;

interface IOwner {
    /**
     * @notice Return is _owner is an owner of the smart wallet.
     * @return True if _owner is an owner of the smart wallet.
     * @param _owner Address to check.
     */
    function isAnOwner(address _owner) external view returns (bool);

    /**
     * @notice Return the owners of the smart wallet.
     * @return Owners array of the smart wallet.
     */
    function getOwners() external view returns (address[] memory);

    /**
     * @notice Add a new owner to the smart wallet.
     * @param _newOwner Address to add as owner.
     */
    function addOwner(address _newOwner) external;

    /**
     * @notice Remove an owner from the smart wallet.
     * @param _owner Address to remove as owner.
     */
    function removeOwner(address _owner) external;

    /// ERRORS

    error OnlyOwner();
    error OwnerExists();
    error NotAnOwner(address _owner);
    error ZeroAddress();
}