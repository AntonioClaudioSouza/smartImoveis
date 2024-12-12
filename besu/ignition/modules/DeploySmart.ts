import { buildModule } from "@nomicfoundation/hardhat-ignition/modules";

const BRLAndSmartImoveisModule = buildModule("BRLAndSmartImoveisModule", (m) => {
  // Parameters for the deployment
  const initialOwner = m.getParameter("initialOwner", "0xfe3b557e8fb62b89f4916b721be55ceb828dbd73");

  // Deploy the BRLToken contract
  const brlToken = m.contract("BRLToken", [initialOwner]);

  // Deploy the SmartImoveis contract, passing the BRLToken deployment future
  const smartImoveis = m.contract("SmartImoveis", [brlToken]);

  return { brlToken, smartImoveis };
});

export default BRLAndSmartImoveisModule;
