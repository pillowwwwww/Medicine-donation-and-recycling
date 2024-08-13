from locust import HttpUser, task, between
import json
from web3 import Web3
from web3.exceptions import ContractLogicError
from dotenv import load_dotenv
import os

# 加载 .env 文件中的环境变量
load_dotenv()

class SimpleContractUser(HttpUser):
    wait_time = between(1, 5)

    def on_start(self):
        # 设置 Web3 连接
        self.web3 = Web3(Web3.HTTPProvider('http://localhost:8545'))

        # 合约地址和 ABI
        self.simple_contract_address = Web3.to_checksum_address(os.getenv('SIMPLE_CONTRACT_ADDRESS'))
        self.simple_contract_abi = [
                {
                "inputs": [],
                "name": "getStaticNumber",
                "outputs": [
                    {
                    "internalType": "uint256",
                    "name": "",
                    "type": "uint256"
                    }
                ],
                "stateMutability": "pure",
                "type": "function"
                }
            ]
        # 从私钥派生地址
        self.private_key = os.getenv('HARDHAT_LOCALHOST_PRIVATE_KEY_0')
        self.account_address = self.web3.eth.account.from_key(self.private_key).address

        # 使用合约地址和 ABI 创建合约实例
        self.simple_contract = self.web3.eth.contract(
            address=self.simple_contract_address,
            abi=self.simple_contract_abi
        )

    @task
    def get_value(self):
        try:
            # 调用 getValue 函数
            value = self.simple_contract.functions.getStaticNumber().call({
                'from': self.account_address
            })
            print(f"Value from contract: {value}")
        except ContractLogicError as e:
            print(f"Contract call failed: {e}")
        except Exception as e:
            print(f"An error occurred: {e}")
