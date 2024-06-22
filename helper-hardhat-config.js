const networkConfig = {
    31337: {
        name: "localhost",
    },
    // Price Feed Address, values can be obtained at https://docs.chain.link/data-feeds/price-feeds/addresses
    11155111: {
        name: "sepolia",
        ethUsdPriceFeed: "0x694AA1769357215DE4FAC081bf1f309aDC325306", //optimisim sepolia的ETH/USD地址为 0x61Ec26aA57019C486B10502285c5A3D4A4750AD7
    },
};

const developmentChains = ["hardhat", "localhost"];

//导出这个networkConfig，以便别的脚本可以使用它
module.exports = {
    networkConfig,
    developmentChains,
};
