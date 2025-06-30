import { buildModule } from "@nomicfoundation/hardhat-ignition/modules";

const SertifikatModule = buildModule("SertifikatModule", (m) => {
  const sertifikat = m.contract("SertifikatDonasi");

  return { sertifikat };
});

export default SertifikatModule;