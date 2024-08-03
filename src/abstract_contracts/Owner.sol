// SPDX-License-Identifier: MIT
pragma solidity 0.8.24;

import "src/interfaces/IOwner.sol";

abstract contract Owner is IOwner {

    /// STATE VARIABLES

    uint256 public owner_index;
    uint256 public owner_count;

    mapping(address _ownerAddress => bool _isOwner) internal owners;
    mapping(uint256 _ownerId => address _ownerAddress) internal owner_addresses;
    
    /// MODIFIERS

    modifier onlyOwner() {
        if (!owners[msg.sender]) revert OnlyOwner();
        _;
    }

    modifier isOwner(address _owner) {
        if (!owners[_owner]) revert NotAnOwner(_owner);
        _;
    }

    modifier isNotOwner(address _owner) {
        if (owners[_owner]) revert OwnerExists();
        _;
    }

    modifier isZeroAddress(address _address) {
        if (_address == address(0)) revert ZeroAddress();
        _;
    }

    /// EXTERNAL FUNCTIONS

    /**
     * @notice Return is _owner is an owner of the smart wallet.
     * @return True if _owner is an owner of the smart wallet.
     * @param _owner Address to check.
     */
    function isAnOwner(address _owner) external view returns (bool){
        return owners[_owner];
    }

    /**
     * @notice Return the owners of the smart wallet.
     * @return _owners Array of the smart wallet.
     */
    function getOwners() external view returns (address[] memory _owners){
        _owners = new address[](owner_count);
        for(uint256 i = 0; i < owner_count; i++){
            _owners[i] = owner_addresses[i+1];
        }
        return _owners;
    }

    /**
     * @notice Add a new owner to the smart wallet.
     * @param _newOwner Address to add as owner.
     */
    function addOwner(address _newOwner) public onlyOwner isNotOwner(_newOwner) isZeroAddress(_newOwner) {
        _addOwner(_newOwner);
    }

    /**
     * @notice Remove an owner from the smart wallet.
     * @param _owner Address to remove as owner.
     */
    function removeOwner(address _owner) public onlyOwner isOwner(_owner) {
        _removeOwner(_owner);
    }

    /// PRIVATE FUNCTIONS

    function _addOwner(address _owner) internal {
        owner_index++;
        owner_count++;
        owners[_owner] = true;
        owner_addresses[owner_index] = _owner;
    }

    function _removeOwner(address _owner) internal {
        owner_count--;
        delete owners[_owner];
        delete owner_addresses[owner_index];
    }
}