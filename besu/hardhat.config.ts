import { HardhatUserConfig } from "hardhat/config";
import "@nomicfoundation/hardhat-toolbox";

const config: HardhatUserConfig = {
  solidity: "0.8.28",
  networks: {
    besu: {
      url: "http://127.0.0.1:8545",
      gas: "auto",
      gasPrice: "auto",
      accounts: [
        "8f2a55949038a9610f50fb23b5883af3b4ecb3c3bb792cbcefbd1542c692be63", // Chave privada da conta
      ],
    },
  },
};

export default config;
