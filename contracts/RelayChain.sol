// SPDX-License-Identifier: MIT
pragma solidity ^0.8.18;

contract RelayChain {
    // 映射存储每个链的合约地址
    mapping(string => address) public chains;

    // 事件：注册新链
    event ChainRegistered(string chainName, address chainAddress);

    // 事件：记录捐赠
    event DonationRecorded(address indexed from, string medicineName, string batchNumber, uint256 timestamp);

    // 事件：更新物流
    event LogisticsUpdated(address indexed from, string logisticsInfo, uint256 timestamp);

    // 注册新链
    function registerChain(string memory chainName, address chainAddress) public {
        chains[chainName] = chainAddress;
        emit ChainRegistered(chainName, chainAddress);
    }

    // 记录捐赠事件
    function recordDonation(string memory medicineName, string memory batchNumber) public {
        emit DonationRecorded(msg.sender, medicineName, batchNumber, block.timestamp);
    }

    // 更新物流事件，参数为物流信息
    function updateLogistics(string memory logisticsInfo) public {
        emit LogisticsUpdated(msg.sender, logisticsInfo, block.timestamp); // 触发更新物流事件
    }
}
