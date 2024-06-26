// SPDX-License-Identifier: MIT
pragma solidity ^0.8.7;

contract LogisticsChain {
    struct LogisticsInfo {
        string status;
        uint256 timestamp;
        string location;
    }

    struct TransportRecord {
        address sender;
        address receiver;
        LogisticsInfo[] logistics;
    }
    modifier onlyRelayChain() {
        require(msg.sender == relayChainAddress, "Only Relay Chain can call this function");
        _;
    }
    address public relayChainAddress;
    constructor(address _relayChainAddress) {
        relayChainAddress = _relayChainAddress;
    }
    mapping(uint256 => TransportRecord) public transportRecords;
    uint256 public transportCount;

    event TransportCreated(uint256 indexed transportId, address indexed sender, address receiver, uint256 timestamp);
    //记录和更新物流信息，同时通知 Layer 2 上的其他组件或合约。
    event LogisticsUpdated(uint256 indexed transportId, string status, string location, uint256 timestamp);
    event MedicineReceived(address indexed receiver, string medicineName, string batchNumber, uint256 timestamp);

    // 创建运输记录函数
    function createTransport(address receiver) public {
        transportCount++;
        // 初始化一个空的LogisticsInfo数组。Solidity 当前版本不支持从 memory 到 storage 的直接数组复制，我们需要采用另一种方法来初始化和填充结构体数组。
        // LogisticsInfo[] memory emptyLogistics;
        // transportRecords[transportCount] = TransportRecord({
        //     sender: msg.sender,
        //     receiver: receiver,
        //     logistics: emptyLogistics
        // });
        TransportRecord storage record = transportRecords[transportCount];
        record.sender = msg.sender;
        record.receiver = receiver;
        emit TransportCreated(transportCount, msg.sender, receiver, block.timestamp);
    }
    // 更新物流信息
    function updateLogistics(uint256 transportId, string memory status, string memory location) public {
        require(transportRecords[transportId].sender != address(0), "Transport record not found");
        LogisticsInfo memory info = LogisticsInfo(status, block.timestamp, location);
        transportRecords[transportId].logistics.push(info);
        emit LogisticsUpdated(transportId, status, location, block.timestamp);

        // 通知Relay Chain
        (bool success,) = relayChainAddress.call(
            abi.encodeWithSignature("recordLogisticsUpdate(uint256,string,string,uint256)", transportId, status, location, block.timestamp)
        );
        require(success, "Failed to notify Relay Chain");
    }

    // 处理Relay Chain的物流更新事件
    function relayUpdate(uint256 transportId, string memory status, string memory location, uint256 timestamp) public onlyRelayChain {
        // 确保运输记录已存在
        require(transportRecords[transportId].sender != address(0), "Transport record not found");

        // 创建新的物流信息并添加到现有运输记录中
        LogisticsInfo memory info = LogisticsInfo(status, timestamp, location);
        transportRecords[transportId].logistics.push(info);

        // 触发物流信息更新事件
        emit LogisticsUpdated(transportId, status, location, timestamp);
    }

    // 接收捐赠事件
    function receiveDonation(address from, string memory medicineName, string memory batchNumber) public {
        require(msg.sender == relayChainAddress, "Only Relay Chain can call this function");
        // 创建运输记录
        createTransport(from);
    }

    // 处理Relay Chain的药品接收事件
    function handleMedicineReceived(address receiver, string memory medicineName, string memory batchNumber) public onlyRelayChain {
        emit MedicineReceived(receiver, medicineName, batchNumber, block.timestamp);
    // 更新物流状态
        updateLogisticsStatus(receiver, medicineName, batchNumber, "Received by recipient", "Recipient's address");
    }

    // 更新物流状态为已完成
    function updateLogisticsStatus(address receiver, string memory medicineName, string memory batchNumber, string memory status, string memory location) internal {
        // 查找运输记录，假设每个运输记录有唯一的 receiver 和 batchNumber
        for (uint256 i = 1; i <= transportCount; i++) {
            if (transportRecords[i].receiver == receiver) {
                for (uint256 j = 0; j < transportRecords[i].logistics.length; j++) {
                    if (keccak256(abi.encodePacked(transportRecords[i].logistics[j].status)) == keccak256(abi.encodePacked(batchNumber))) {
                        // 更新物流信息
                        LogisticsInfo memory info = LogisticsInfo(status, block.timestamp, location);
                        transportRecords[i].logistics.push(info);
                        emit LogisticsUpdated(i, status, location,block.timestamp);
                        return;
                    }
                }
            }
        }
    }


}
