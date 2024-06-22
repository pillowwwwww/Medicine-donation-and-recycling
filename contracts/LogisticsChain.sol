// SPDX-License-Identifier: MIT
pragma solidity ^0.8.7;

// 引入RelayChain合约接口
interface IRelayChain {
    function updateLogistics(uint256 _medicineId, string memory _pickupLocation, string memory _collectionPoint, string memory _deliveryStatus) external;
}

contract LogisticsChain {
    // RelayChain合约地址
    address public relayChain;

    // 构造函数，初始化RelayChain合约地址
    constructor(address _relayChain) {
        relayChain = _relayChain;
    }

    // 记录物流信息
    function recordLogistics(uint256 _medicineId, string memory _pickupLocation, string memory _collectionPoint, string memory _deliveryStatus) public {
        // 在RelayChain上更新物流信息
        IRelayChain(relayChain).updateLogistics(_medicineId, _pickupLocation, _collectionPoint, _deliveryStatus);
    }
}
