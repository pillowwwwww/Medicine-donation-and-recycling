// SPDX-License-Identifier: MIT
pragma solidity ^0.8.18;

contract GovernmentChain {
    struct User {
        string username;
        uint256 creditScore;
    }
    struct Donation {
        string medicineName;
        string batchNumber;
        uint256 timestamp;
    }
    struct LogisticsInfo {
        string status;
        uint256 timestamp;
        string location;
    }
    address public relayChainAddress;
    constructor(address _relayChainAddress) {
        relayChainAddress = _relayChainAddress;
    }
    // 存储用户信息的映射
    mapping(address => User) public users;
    
    // 存储用户捐赠记录的映射
    mapping(address => Donation[]) public donations;

     // 存储物流信息的映射
    mapping(address => LogisticsInfo[]) public logisticsRecords;

    event UserVerified(address indexed user, string username, uint256 creditScore);
    event MedicineReceived(address indexed receiver, string medicineName, string batchNumber, uint256 timestamp);
    event MedicineApproved(address indexed receiver, string medicineName, string batchNumber, uint256 timestamp);

    modifier onlyRelayChain() {
        require(msg.sender == relayChainAddress, "Only Relay Chain can call this function");
        _;
    }
    function verifyUser(address user, string memory username, string memory idNumber) public returns (bool) {
        // 暂时为空白函数，实际应该调用政府数据库验证身份证号码和名字是否匹配
        // 假设验证通过
        bool isVerified = true;
        if (isVerified) {
            users[user] = User(username, 0);
            emit UserVerified(user, username, 0);
        }
        return isVerified;
    }
    // 更新用户信用分数
    function updateUserCredit(address user, uint256 newCreditScore) public {
        require(bytes(users[user].username).length != 0, "User not found");
        users[user].creditScore = newCreditScore;
        //emit UserVerified(user, users[user].username, newCreditScore);
    }

    function getDonations(address from) public view returns (Donation[] memory) {
        return donations[from];
    }
    function getLogistics(address from) public view returns (LogisticsInfo[] memory) {
        return logisticsRecords[from];
    }

    // 定义与Relay Chain事件对应的方法
    // 接收捐赠事件
    function receiveDonation(address from, string memory medicineName, string memory batchNumber) public {
        require(msg.sender == relayChainAddress, "Only Relay Chain can call this function");
        // 增加用户的信用分数
        updateUserCredit(from, users[from].creditScore + 10);
        // 记录捐赠详细信息
        donations[from].push(Donation(medicineName, batchNumber, block.timestamp));
    }


    // 更新物流事件
    function updateLogistics(address from, string memory status, string memory location) public {
        require(msg.sender == relayChainAddress, "Only Relay Chain can call this function");
        // 记录物流信息
        logisticsRecords[from].push(LogisticsInfo(status, block.timestamp, location));
    }

    // 处理Relay Chain的药品接收事件
    function handleMedicineReceived(address receiver, string memory medicineName, string memory batchNumber) public onlyRelayChain {
        emit MedicineReceived(receiver, medicineName, batchNumber, block.timestamp);
        // 更新用户信用分数+5
        updateUserCredit(receiver, users[receiver].creditScore + 5);
    }

    //新增功能： 药品回收批准请求
    function approveMedicineRecovery(address receiver, string memory medicineName, string memory batchNumber) public {
        require(msg.sender == relayChainAddress, "Only Relay Chain can call this function");

        // 模拟检查过程，实际应用中应包含更详细的检查逻辑
        bool isApproved = true; // 假设检查通过

        if (isApproved) {
            // 通知LogisticsChain
            (bool success,) = relayChainAddress.call(
                abi.encodeWithSignature("updateLogisticsStatus(address,string,string,string,string)", receiver, medicineName, batchNumber, "Approved", "Government")
            );
            require(success, "Failed to notify LogisticsChain");
            
            // 通知UserChain
            (success,) = relayChainAddress.call(
                abi.encodeWithSignature("updateUserStatus(address,string,string)", receiver, medicineName, batchNumber)
            );
            require(success, "Failed to notify UserChain");

            emit MedicineApproved(receiver, medicineName, batchNumber, block.timestamp);
        }
    }
    
}
