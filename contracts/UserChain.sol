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
        bool received; //是否已收到药品
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
    // 手动设置用户数据
    function setUser(address userAddress, string memory username, string memory idNumber) public {
        users[userAddress] = User(username, idNumber, userAddress, 0);
    }
    // 新增：获取用户捐赠药品数量
    function getDonationCount(address userAddress) public view returns (uint256) {
        return donations[userAddress].length;
    }

    // 新增：获取用户捐赠药品信息
    function getDonation(address userAddress, uint256 index) public view returns (Medicine memory) {
        require(index < donations[userAddress].length, "Index out of bounds");
        return donations[userAddress][index];
    }
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
        // 注册用户信息:不能存到链上，（用户地址   
        users[msg.sender] = User(username, idNumber, msg.sender, 0);
    }
   // 捐赠药品
    function donateMedicine(string memory name, string memory batchNumber, uint256 expirationDate, string memory productionLocation) public {
        // 确保用户已注册
        require(users[msg.sender].userAddress != address(0), "User not registered");
        Medicine memory newMedicine = Medicine(name, msg.sender, expirationDate, productionLocation, batchNumber,false);
        donations[msg.sender].push(newMedicine);
         // 触发药品捐赠事件
        emit MedicineDonated(msg.sender, name, batchNumber, block.timestamp);
        // 通知Relay Chain
        (bool relaySuccess,) = relayChainAddress.call(
            abi.encodeWithSignature("recordDonation(address,string,string)", msg.sender, name, batchNumber)
        );
        require(relaySuccess, "Failed to notify Relay Chain");

        // 直接调用 LogisticsChain 合约的方法
        (bool logisticsSuccess,) = logisticsChainAddress.call(
            abi.encodeWithSignature("createTransport(address,string)", msg.sender, "Initial logistics info")
        );
        require(logisticsSuccess, "Failed to notify LogisticsChain");
    }

    // 被捐赠者收到了药品
    function receiveMedicine(string memory name, string memory batchNumber) public {
        // 找到对应的药品记录并更新为已接收
        bool found = false;
        for (uint i = 0; i < donations[msg.sender].length; i++) {
            if (keccak256(abi.encodePacked(donations[msg.sender][i].name)) == keccak256(abi.encodePacked(name)) &&
                keccak256(abi.encodePacked(donations[msg.sender][i].batchNumber)) == keccak256(abi.encodePacked(batchNumber))) {
                donations[msg.sender][i].received = true;
                found = true;
                break;
            }
        }
        require(found, "Medicine not found");

        // 触发药品接收事件
        emit MedicineReceived(msg.sender, name, batchNumber, block.timestamp);

        // 通知Relay Chain
        (bool success,) = relayChainAddress.call(
            abi.encodeWithSignature("recordMedicineReceived(address,string,string)", msg.sender, name, batchNumber)
        );
        require(success, "Failed to notify Relay Chain");
    }

    // 接收捐赠事件:有用到吗？
    function receiveDonation(address from, string memory medicineName, string memory batchNumber) public {
        require(msg.sender == relayChainAddress, "Only Relay Chain can call this function");
        // 记录捐赠信息
        Medicine memory receivedMedicine = Medicine(medicineName, from, 0, "", batchNumber,false);
        donations[from].push(receivedMedicine);
    }

//信用分更新：当用户在UserChain上完成药品捐赠或领取，更新后的信用分通过RelayChain提交到Layer 1进行最终确认。

// // UserChain Contract
// function updateUserCredit(address user, uint256 newCreditScore) public {
//     require(msg.sender == relayChainAddress, "Only Relay Chain can call this function");
//     users[user].creditScore = newCreditScore;

//     // 通知Layer 1进行最终确认
//     (bool success, ) = relayChainAddress.call(
//         abi.encodeWithSignature("recordUserCreditUpdate(address,uint256)", user, newCreditScore)
//     );
//     require(success, "Failed to notify Relay Chain");
// }
}

// pragma solidity ^0.8.18;

// import "./IL1Messenger.sol"; // 引入 L1Messenger 的接口定义

// contract UserChain {
//     address public relayChainAddress;
//     address public governmentChainAddress;
//     address public logisticsChainAddress;
//     IL1Messenger public l1Messenger;  // L1 Messenger 接口

//     constructor(address _relayChainAddress, address _governmentChainAddress, address _logisticsChainAddress, address _l1MessengerAddress) {
//         relayChainAddress = _relayChainAddress;
//         governmentChainAddress = _governmentChainAddress;
//         logisticsChainAddress = _logisticsChainAddress;
//         l1Messenger = IL1Messenger(_l1MessengerAddress); // 初始化 L1 Messenger 地址
//     }

//     struct Medicine {
//         string name;
//         address donor;
//         uint256 expirationDate;
//         string productionLocation;
//         string batchNumber;
//         bool received; // 是否已收到药品
//     }

//     struct User {
//         string username;
//         string idNumber;
//         address userAddress;
//         uint256 creditScore;
//     }

//     mapping(address => User) public users;
//     mapping(address => Medicine[]) public donations;

//     event MedicineDonated(address indexed donor, string name, string batchNumber, uint256 timestamp);
//     event MedicineReceived(address indexed receiver, string name, string batchNumber, uint256 timestamp);

//     // 捐赠药品
//     function donateMedicine(string memory name, string memory batchNumber, uint256 expirationDate, string memory productionLocation) public {
//         require(users[msg.sender].userAddress != address(0), "User not registered");
//         Medicine memory newMedicine = Medicine(name, msg.sender, expirationDate, productionLocation, batchNumber, false);
//         donations[msg.sender].push(newMedicine);

//         emit MedicineDonated(msg.sender, name, batchNumber, block.timestamp);

//         // 将捐赠信息编码并发送到 L1
//         bytes memory donationInfo = abi.encode(name, batchNumber, msg.sender);
//         l1Messenger.sendToL1(donationInfo); // 调用 L1 Messenger 合约的方法
//     }

//     // 其他方法...
// }
