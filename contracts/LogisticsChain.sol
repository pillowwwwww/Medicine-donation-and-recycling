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

    address public relayChainAddress;
    constructor(address _relayChainAddress) {
        relayChainAddress = _relayChainAddress;
    }
    mapping(uint256 => TransportRecord) public transportRecords;
    uint256 public transportCount;

    event TransportCreated(uint256 indexed transportId, address indexed sender, address receiver, uint256 timestamp);
    event LogisticsUpdated(uint256 indexed transportId, string status, string location, uint256 timestamp);

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
    // 更新物流信息函数
    function updateLogistics(uint256 transportId, string memory status, string memory location) public {
        require(transportRecords[transportId].sender != address(0), "Transport record not found");
        LogisticsInfo memory info = LogisticsInfo({
            status: status,
            timestamp: block.timestamp,
            location: location
        });
        transportRecords[transportId].logistics.push(info);
        emit LogisticsUpdated(transportId, status, location, block.timestamp);
    }
    // 中间件调用的函数，用于处理 RelayChain 事件
    function relayUpdate(uint256 transportId, address sender, address receiver, string memory status, string memory location) public {
        // 如果运输记录不存在，则创建一个新的运输记录
        if (transportRecords[transportId].sender == address(0)) {
            transportRecords[transportId] = TransportRecord(sender, receiver, new LogisticsInfo[](0));
        }
        // 创建新的物流信息
        LogisticsInfo memory info = LogisticsInfo(status, block.timestamp, location);
        // 将新的物流信息添加到对应的运输记录中
        transportRecords[transportId].logistics.push(info);
        // 触发物流信息更新事件
        emit LogisticsUpdated(transportId, status, location, block.timestamp);
}
}
