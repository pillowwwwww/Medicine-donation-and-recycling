// SPDX-License-Identifier: MIT
pragma solidity ^0.8.18;
//事件图、结构图
contract RelayChain {

    address public owner;
    // 映射存储每个链的合约地址
    mapping(string => address) public chains;

    // 事件：注册新链
    event ChainRegistered(string chainName, address chainAddress);

    // 事件：记录捐赠
    event DonationRecorded(address indexed from, string medicineName, string batchNumber, uint256 timestamp);

    //记录药品接收
    event MedicineReceived(address indexed receiver, string medicineName, string batchNumber, uint256 timestamp);

    // 事件：更新物流，通知跨链中间件。不写时间戳，避免跨链时间戳不一致
    event LogisticsUpdated(uint256 transportId, string status, string location);

      constructor() {
        owner = msg.sender;
    }

    modifier onlyOwner() {
        require(msg.sender == owner, "Only owner can call this function");
        _;
    }

    modifier onlyAuthorized(string memory chainName) {
        require(msg.sender == chains[chainName], "Only authorized chain can call this function");
        _;
    }

    //把三个链的地址存入chains
    // function initializeChains(address _governmentChain, address _userChain, address _logisticsChain) external onlyOwner {
    //         chains["GovernmentChain"] = _governmentChain;
    //         chains["UserChain"] = _userChain;
    //         chains["LogisticsChain"] = _logisticsChain;
    //     }
    // // 注册新链
    // function registerChain(string memory chainName, address chainAddress) public {
    //     chains[chainName] = chainAddress;
    //     emit ChainRegistered(chainName, chainAddress);
    // }

    // 记录捐赠事件
    function recordDonation(string memory medicineName, string memory batchNumber) public {
        emit DonationRecorded(msg.sender, medicineName, batchNumber, block.timestamp);
    }

    //记录收到药品
    function recordMedicineReceived(address receiver, string memory medicineName, string memory batchNumber) external {
        emit MedicineReceived(receiver, medicineName, batchNumber, block.timestamp);
    }

   
    // 更新物流事件，参数为物流信息
    function updateLogistics(uint256 transportId, string memory status, string memory location) public {
        emit LogisticsUpdated(transportId, status, location); // 触发更新物流事件
    }
}
