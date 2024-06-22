// SPDX-License-Identifier: MIT
pragma solidity ^0.8.7;

contract RelayChain {
    // 用户结构体，存储用户信息
    struct User {
        string name; // 用户名
        string id; // 用户ID
        uint256 creditScore; // 用户信用评分
    }
    
    // 药品结构体，存储药品信息
    struct Medicine {
        string name; // 药品名称
        address donor; // 捐赠者地址
        uint256 expirationDate; // 药品过期日期
        string productionLocation; // 药品生产地
    }
    
    // 物流结构体，存储物流信息
    struct Logistics {
        string pickupLocation; // 取货地点
        string collectionPoint; // 收集点
        string deliveryStatus; // 交付状态
    }

    // 映射存储用户信息，地址为键。直接访问： 通过用户地址可以直接访问 mapping 中的用户信息。例如，可以使用 users[msg.sender] 获取调用合约的用户信息。
    mapping(address => User) public users;
    
    // 映射存储药品信息，药品ID为键
    mapping(uint256 => Medicine) public medicines;
    
    // 映射存储物流信息，药品ID为键
    mapping(uint256 => Logistics) public logistics;

    // 用户注册事件
    event UserRegistered(address indexed userAddress, string name, string id);
    // 药品捐赠事件
    event MedicineDonated(uint256 indexed medicineId, string name, address donor);
    // 物流更新事件
    event LogisticsUpdated(uint256 indexed medicineId, string pickupLocation, string collectionPoint, string deliveryStatus);

    // 从政府链注册用户
    function registerUser(address _userAddress, string memory _name, string memory _id, uint256 _creditScore) public {
        // 存储用户信息到映射中
        users[_userAddress] = User(_name, _id, _creditScore);
        // 触发用户注册事件
        emit UserRegistered(_userAddress, _name, _id);
    }

    // 从用户链记录捐赠
    function recordDonation(uint256 _medicineId, string memory _name, address _donor, uint256 _expirationDate, string memory _productionLocation) public {
        // 存储药品信息到映射中
        medicines[_medicineId] = Medicine(_name, _donor, _expirationDate, _productionLocation);
        // 触发药品捐赠事件
        emit MedicineDonated(_medicineId, _name, _donor);
    }

    // 从物流链更新物流信息
    function updateLogistics(uint256 _medicineId, string memory _pickupLocation, string memory _collectionPoint, string memory _deliveryStatus) public {
        // 存储物流信息到映射中
        logistics[_medicineId] = Logistics(_pickupLocation, _collectionPoint, _deliveryStatus);
        // 触发物流更新事件
        emit LogisticsUpdated(_medicineId, _pickupLocation, _collectionPoint, _deliveryStatus);
    }
}
