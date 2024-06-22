// SPDX-License-Identifier: MIT
pragma solidity ^0.8.7;

// 引入RelayChain合约接口
interface IRelayChain {
    function recordDonation(uint256 _medicineId, string memory _name, address _donor, uint256 _expirationDate, string memory _productionLocation) external;
}

contract UserChain {
    // RelayChain合约地址
    address public relayChain;

    // 构造函数，初始化RelayChain合约地址
    constructor(address _relayChain) {
        relayChain = _relayChain;
    }

    // 捐赠药品
    function donateMedicine(uint256 _medicineId, string memory _name, uint256 _expirationDate, string memory _productionLocation) public {
        // 在RelayChain上记录捐赠
        IRelayChain(relayChain).recordDonation(_medicineId, _name, msg.sender, _expirationDate, _productionLocation);
    }
}
