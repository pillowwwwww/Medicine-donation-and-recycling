// SPDX-License-Identifier: MIT
pragma solidity ^0.8.18;

contract UserChain {
    address public relayChainAddress;
    address public governmentChainAddress;
    address public logisticsChainAddress;
    constructor(address _relayChainAddress, address _governmentChainAddress, address _logisticsChainAddress) {
        relayChainAddress = _relayChainAddress;
        governmentChainAddress = _governmentChainAddress;
        logisticsChainAddress = _logisticsChainAddress;
    }

    struct Medicine {
        string name;
        address donor;
        uint256 expirationDate;
        string productionLocation;
        string batchNumber;
    }

    struct User {
        string username;
        string idNumber;
        address userAddress;
        uint256 creditScore;
    }

    mapping(address => User) public users;
    mapping(address => Medicine[]) public donations;

    event MedicineDonated(address indexed donor, string name, string batchNumber, uint256 timestamp);
    event MedicineReceived(address indexed receiver, string name, string batchNumber, uint256 timestamp);

    function registerUser(string memory username, string memory idNumber) public {
         // 确保用户尚未注册
        require(users[msg.sender].userAddress == address(0), "User already registered");
        // 这里调用 GovernmentChain 进行身份验证，假设 verifyUser 是 GovernmentChain 中的方法
        (bool success, bytes memory data) = governmentChainAddress.call(
            abi.encodeWithSignature("verifyUser(address,string,string)", msg.sender, username, idNumber)
        );
        require(success, "User verification failed");
        bool verified = abi.decode(data, (bool));
        require(verified, "User verification failed");
        // 注册用户信息    
        users[msg.sender] = User(username, idNumber, msg.sender, 0);
    }
   // 捐赠药品
    function donateMedicine(string memory name, string memory batchNumber, uint256 expirationDate, string memory productionLocation) public {
        // 确保用户已注册
        require(users[msg.sender].userAddress != address(0), "User not registered");
        Medicine memory newMedicine = Medicine(name, msg.sender, expirationDate, productionLocation, batchNumber);
        donations[msg.sender].push(newMedicine);
         // 触发药品捐赠事件
        emit MedicineDonated(msg.sender, name, batchNumber, block.timestamp);

        // 直接调用 LogisticsChain 合约的方法
        (bool success,) = logisticsChainAddress.call(
            abi.encodeWithSignature("createTransport(address,string)", msg.sender, "Initial logistics info")
        );
        require(success, "Failed to notify LogisticsChain");
    }
    // 接收药品
    function receiveMedicine(address donor, uint256 index) public {
        require(users[msg.sender].userAddress != address(0), "User not registered");
        require(index < donations[donor].length, "Invalid medicine index");
        Medicine memory medicine = donations[donor][index];
        // 这里可以添加药品接收逻辑
        emit MedicineReceived(msg.sender, medicine.name, medicine.batchNumber, block.timestamp);
        // 直接调用 LogisticsChain 合约的方法
        (bool success,) = logisticsChainAddress.call(
            abi.encodeWithSignature("updateLogistics(address,string)", msg.sender, "MedicineReceived")
        );
        require(success, "Failed to notify LogisticsChain");
    }
}
