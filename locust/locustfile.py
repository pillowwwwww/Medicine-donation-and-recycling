from locust import HttpUser, task, between
import json
from web3 import Web3
from web3.exceptions import ContractLogicError
from dotenv import load_dotenv
import os

# 加载 .env 文件中的环境变量
load_dotenv()

class MedicineDonationUser(HttpUser):
    wait_time = between(1, 5)

    def on_start(self):
        # 设置 Web3 连接
        self.web3 = Web3(Web3.HTTPProvider('http://localhost:8545'))
           
        # 读取 ABI 文件
        with open('../artifacts/contracts/RelayChain.sol/RelayChain.json') as f:
            self.relay_chain_abi = json.load(f)['abi']
        
        with open('../artifacts/contracts/UserChain.sol/UserChain.json') as f:
            self.user_chain_abi = json.load(f)['abi']
        
        with open('../artifacts/contracts/LogisticsChain.sol/LogisticsChain.json') as f:
            self.logistics_chain_abi = json.load(f)['abi']
        
        with open('../artifacts/contracts/GovernmentChain.sol/GovernmentChain.json') as f:
            self.government_chain_abi = json.load(f)['abi']

        # 智能合约地址
        self.relay_chain_address = os.getenv('RELAY_CHAIN_ADDRESS_ON_LOCALHOST')
        self.user_chain_address = os.getenv('USER_CHAIN_ADDRESS_ON_LOCALHSOT')
        self.logistics_chain_address = os.getenv('LOGISTICS_CHAIN_ADDRESS_ON_LOCALHOST')
        self.government_chain_address = os.getenv('GOVERNMENT_CHAIN_ADDRESS_ON_LOCALHOST')
         # 验证地址是否正确读取
        assert self.relay_chain_address, "RELAY_CHAIN_ADDRESS_ON_LOCALHOST is missing"
        assert self.user_chain_address, "USER_CHAIN_ADDRESS_ON_LOCALHOST is missing"
        assert self.logistics_chain_address, "LOGISTICS_CHAIN_ADDRESS_ON_LOCALHOST is missing"
        assert self.government_chain_address, "GOVERNMENT_CHAIN_ADDRESS_ON_LOCALHOST is missing"
        
        # 用户的私钥，用于签署交易
        self.private_key = os.getenv('HARDHAT_LOCALHOST_PRIVATE_KEY_0')
        assert self.private_key, "HARDHAT_LOCALHOST_PRIVATE_KEY_0 is missing"

        # 从私钥派生地址
        self.account_address = self.web3.eth.account.from_key(self.private_key).address

        # 使用合约地址和 ABI 创建合约实例
        self.relay_chain_contract = self.web3.eth.contract(
            address=self.relay_chain_address,
            abi=self.relay_chain_abi
        )
        self.user_chain_contract = self.web3.eth.contract(
            address=self.user_chain_address,
            abi=self.user_chain_abi
        )
        self.logistics_chain_contract = self.web3.eth.contract(
            address=self.logistics_chain_address,
            abi=self.logistics_chain_abi
        )
        self.government_chain_contract = self.web3.eth.contract(
            address=self.government_chain_address,
            abi=self.government_chain_abi
        )


    # @task
    # def donate_medicine(self):
    #     try:
    #         # 构建并发送捐赠请求到 UserChain
    #         tx = self.user_chain_contract.functions.donateMedicine(
    #             "Medicine A",  # 药品名称
    #             "1234567890",  # 批次号
    #             1672531199,    # 过期日期（时间戳）
    #             "Location A"   # 生产地点
    #         ).transact({
    #             'from': self.account_address,
    #             'gas': 70000,  # 交易的 gas 限制
    #             'gasPrice': self.web3.eth.gas_price,  # 使用当前的 gas 价格
    #             'nonce': self.web3.eth.get_transaction_count(self.account_address),  # 账户的 nonce 值
    #         })
    #          # 等待交易被挖掘
    #         receipt = self.web3.eth.wait_for_transaction_receipt(tx)
    #         print(f"Transaction receipt: {receipt}")
    #     except ContractLogicError as e:
    #         print(f"Contract call failed: {e}")
    #     except Exception as e:
    #         print(f"An error occurred: {e}")

    # @task
    # def update_logistics(self):
    #     try:
    #         # 构建并发送捐赠请求到 UserChain
    #         tx = self.logistics_chain_contract.functions.updateLogisticsStatus(
    #             "0xReceiverAddress",  # 接收者地址
    #             "Medicine A",  # 药品名称
    #             "1234567890",  # 批次号
    #             "In Transit",  # 物流状态
    #             "Location B"   # 当前位置
    #         ).transact({
    #             'from': self.account_address,
    #             'gas': 70000,  # 交易的 gas 限制
    #             'gasPrice': self.web3.eth.gas_price,  # 使用当前的 gas 价格
    #             'nonce': self.web3.eth.get_transaction_count(self.account_address),  # 账户的 nonce 值
    #         })
    #          # 等待交易被挖掘
    #         receipt = self.web3.eth.wait_for_transaction_receipt(tx)
    #         print(f"Transaction receipt: {receipt}")
    #     except ContractLogicError as e:
    #         print(f"Contract call failed: {e}")
    #     except Exception as e:
    #         print(f"An error occurred: {e}")
    # @task
    # def update_logistics(self):
    #     # 构建并发送物流更新请求到 LogisticsChain
    #     tx = self.logistics_chain_contract.functions.updateLogisticsStatus(
    #         "0xReceiverAddress",  # 接收者地址
    #         "Medicine A",  # 药品名称
    #         "1234567890",  # 批次号
    #         "In Transit",  # 物流状态
    #         "Location B"   # 当前位置
    #     ).buildTransaction({
    #         'chainId': 31337,  # 网络链ID，本地测试网络的ID
    #         'gas': 70000,  # 交易的 gas 限制
    #         'gasPrice': self.web3.toWei('1', 'gwei'),  # gas 价格
    #         'nonce': self.web3.eth.getTransactionCount(self.web3.eth.accounts[0]),  # 账户的 nonce 值
    #     })
    #     signed_tx = self.web3.eth.account.signTransaction(tx, private_key=self.private_key)
    #     self.web3.eth.sendRawTransaction(signed_tx.rawTransaction)


    # @task
    # def create_transport(self):
    #     receiver_address = os.getenv('HARDHAT_LOCALHOST_ADDRESS_1')  # Update this to a valid address
    #     medicine_name = "Aspirin"
    #     batch_number = "11111111"
    #     print
    #     try:
    #         # 构建并发送创建运输请求到 LogisticsChain
    #         tx = self.logistics_chain_contract.functions.createTransport(
    #             receiver_address,
    #             medicine_name,
    #             batch_number
    #         ).transact({
    #             'from': self.account_address,
    #             'gas': 70000,
    #             'gasPrice': self.web3.eth.gas_price,
    #             'nonce': self.web3.eth.get_transaction_count(self.account_address)
    #         })
    #         # 等待交易被挖掘
    #         receipt = self.web3.eth.wait_for_transaction_receipt(tx)
    #         print(f"Transaction receipt: {receipt}")
    #     except ContractLogicError as e:
    #         print(f"Contract call failed: {e}")
    #     except Exception as e:
    #         print(f"An error occurred: {e}")
        # 合约地址和 ABI
        self.simple_contract_address = os.getenv('SIMPLE_CONTRACT_ADDRESS')
        self.simple_contract_abi = [
            {
                "constant": True,
                "inputs": [],
                "name": "getValue",
                "outputs": [
                    {
                        "name": "",
                        "type": "string"
                    }
                ],
                "payable": False,
                "stateMutability": "view",
                "type": "function"
            }
        ]
    @task
    def get_value(self):
        try:
            # 调用 getValue 函数
            value = self.simple_contract.functions.getValue().call({
                'from': self.account_address
            })
            print(f"Value from contract: {value}")
        except ContractLogicError as e:
            print(f"Contract call failed: {e}")
        except Exception as e:
            print(f"An error occurred: {e}")