// SPDX-License-Identifier: MIT
pragma solidity 0.8.24;

import "src/interfaces/IWallet_Template_v1.sol";
import "openzeppelin-contracts/cryptography/ECDSA.sol";
import "openzeppelin-contracts/token/ERC20/IERC20.sol";


contract Wallet_Template_v1 is IWallet_Template_v1 {

    /// STATE VARIABLES

    uint256 public constant VERSION = 1;
    uint256 public owner_index;
    uint256 public owner_count;

    mapping(address _ownerAddress => bool _isOwner) private owners;
    mapping(uint256 _ownerId => address _ownerAddress) private owner_addresses;
    
    /// MODIFIERS

    modifier onlyOwner() {
        if (!owners[msg.sender]) {
            revert OnlyOwner();
        }
        _;
    }

    modifier isOwner(address _owner) {
        if (!owners[_owner]) {
            revert NotAnOwner(_owner);
        }
        _;
    }

    modifier isNotOwner(address _owner) {
        if (owners[_owner]) {
            revert OwnerExists();
        }
        _;
    }

    modifier isEnoughBalance(uint256 _amount) {
        if(address(this).balance < _amount) revert InsufficientBalance();
        _;
    }

    modifier isZeroAddress(address _address) {
        if (_address == address(0)) revert ZeroAddress();
        _;
    }

    /// CONSTRUCTOR

    constructor(address _owner) {
        _addOwner(_owner);
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

    /**
     * @notice Add a new owner to the smart wallet with a signature.
     * @param _data CallData information.
     */
    function addOwnerWithSignature(bytes memory _data, bytes memory _signature) external {
        // Get function selector
        bytes4 selector = _getFunctionSelector(_data);

        // Check selector
        bytes4 expectedSelector = bytes4(keccak256("addOwner(address)"));
        if (selector != expectedSelector) revert WrongSelector(selector);

        // Create params array
        bytes memory params = new bytes(_data.length - 4);
        for (uint i = 0; i < _data.length - 4; i++) {
            params[i] = _data[i + 4];
        }

        // Get parameter
        (address _newOwner) = abi.decode(params, (address));
        if (owners[_newOwner]) revert OwnerExists();

        // Get signer
        address _signer = _getSignerFromSignature(_data, _signature);

        // Check signer
        if (!owners[_signer]) revert InvalidSigner(_signer);

        // Perform operation
        _addOwner(_newOwner);
    }

    /**
     * @notice Remove an owner to the smart wallet with a signature.
     * @param _data CallData information.
     */
    function removeOwnerWithSignature(bytes memory _data, bytes memory _signature) external {
        // Get function selector
        bytes4 selector = _getFunctionSelector(_data);

        // Check selector
        bytes4 expectedSelector = bytes4(keccak256("removeOwner(address)"));
        if (selector != expectedSelector) revert WrongSelector(selector);

        // Create params array
        bytes memory params = new bytes(_data.length - 4);
        for (uint i = 0; i < _data.length - 4; i++) {
            params[i] = _data[i + 4];
        }

        // Get parameter
        (address _owner) = abi.decode(params, (address));
        if (!owners[_owner]) revert NotAnOwner(_owner);

        // Get signer
        address _signer = _getSignerFromSignature(_data, _signature);

        // Check signer
        if (!owners[_signer]) revert InvalidSigner(_signer);

        // Perform operation
        _removeOwner(_owner);
    }

    /**
     * @notice Return the balance of the smart wallet in native tokens.
     * @return The balance of the smart wallet.
     */
    function getBalance() external view returns (uint256){
        return address(this).balance;
    }

    /**
     * @notice Return the balance of the smart wallet in native tokens.
     * @return The balance of the smart wallet.
     */
    function getBalanceFrom(address _token) external view returns (uint256){
        // ToDo: Check if the token is an ERC20
        return IERC20(_token).balanceOf(address(this));
    }

    /**
     * @notice Send `amount` of native tokens to `recipient`.
     * @param _recipient Address that will receive the funds.
     * @param _amount Amount of native tokens to send.
     */
    function sendNativeToken(address payable _recipient, uint256 _amount) external onlyOwner isZeroAddress(_recipient) isEnoughBalance(_amount) {
        _recipient.transfer(_amount);

        // ToDo: Consider
        //(bool success, ) = _recipient.call{value: _amount}("");
        //if(!success), revert TransferFailed();
    }

    /**
     * @notice Send `amount` of native tokens to `recipient` authorized by signature.
     * @param _data CallData information.
     */
    function sendNativeTokenWithSignature(bytes memory _data, bytes memory _signature) external {
        // Get function selector
        bytes4 selector = _getFunctionSelector(_data);

        // Check selector
        bytes4 expectedSelector = bytes4(keccak256("sendNativeToken(address,uint256)"));
        if (selector != expectedSelector) revert WrongSelector(selector);

        // Create params array
        bytes memory params = new bytes(_data.length - 4);
        for (uint i = 0; i < _data.length - 4; i++) {
            params[i] = _data[i + 4];
        }

        // Get parameter
        (address payable _recipient, uint256 _amount) = abi.decode(params, (address,uint256));
        if (_recipient == address(0)) revert ZeroAddress();
        if(address(this).balance < _amount) revert InsufficientBalance();

        // Get signer
        address _signer = _getSignerFromSignature(_data, _signature);

        // Check signer
        if (!owners[_signer]) revert InvalidSigner(_signer);

        // Perform operation
        _recipient.transfer(_amount);
    }

    /**
     * @notice Execute an arbitrary transaction from the smart wallet.
     * @param _target Address of the contract being called.
     * @param _value Amount of ether to send.
     * @param _signature Signature of the owner authorizing the execution
     * @param _data Transaction data (function call).
     */
    function executeTransaction(address _target, uint256 _value, bytes memory _signature, bytes memory _data) external payable returns (bytes memory){
        // Get signer
        address _signer = _getSignerFromSignature(_data, _signature);

        // Check signer
        if (!owners[_signer]) revert InvalidSigner(_signer);

        // Perform operation
        (bool _success, bytes memory _returnData) = _target.call{value: _value}(_data);
        if (!_success) revert callFailed();

        return _returnData;
    }

    /**
     * @notice Allows the smart wallet to receive native tokens.
     */
    receive() external payable{}

    /// PRIVATE FUNCTIONS

    function _addOwner(address _owner) private {
        owner_index++;
        owner_count++;
        owners[_owner] = true;
        owner_addresses[owner_index] = _owner;
    }

    function _removeOwner(address _owner) private {
        owner_count--;
        delete owners[_owner];
        delete owner_addresses[owner_index];
    }

    function _getFunctionSelector(bytes memory _data) private pure returns (bytes4){
        bytes4 selector;
        assembly {
            selector := mload(add(_data, 32))
        }
        return selector;
    }

    function _getSignerFromSignature(bytes memory _data, bytes memory _signature) private pure returns (address){
        bytes32 _messageHash = keccak256(_data);
        bytes32 _ethSignedMessageHash = ECDSA.toEthSignedMessageHash(_messageHash);
        address _signer = ECDSA.recover(_ethSignedMessageHash, _signature);
        return _signer;
    } 

    /// ERRORS

    error OnlyOwner();
    error OwnerExists();
    error InvalidSigner(address _signer);
    error WrongSelector(bytes4 _selector);
    error NotAnOwner(address _owner);
    error InsufficientBalance();
    error ZeroAddress();
    error callFailed();
}
