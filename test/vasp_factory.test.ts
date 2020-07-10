import VASPFactory, { VASPCodeConflictError } from "../src/vasp_factory";

import { web3, accounts, contract } from "@openzeppelin/test-environment";
import { provider } from "web3-core";

const [owner] = accounts;

/**
 * VASPIndexContract test
 */
describe("VASPFactory test", () => {
  let sut: VASPFactory;

  const vaspCode = "0x0123456789abcdef";

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  let instanceVASPIndexContract: any;

  beforeAll(async done => {
    // Deploy demo VASPIndex contract
    contract.artifactsDir = "./node_modules/openvasp-contracts/build/contracts";
    const VASPIndexArtifact = contract.fromArtifact("VASPIndex");
    instanceVASPIndexContract = await VASPIndexArtifact.new();
    const vaspIndexAddress = instanceVASPIndexContract.address;
    sut = new VASPFactory(
      web3.currentProvider as provider,
      vaspIndexAddress,
      owner
    );
    done();
  });

  describe("createVASP", () => {
    it("should create a VASP", async () => {
      const ret = await sut.createVASP(vaspCode);
      expect(ret.vaspAddress).toBeDefined();
      expect(ret.handshakeKeys).toBeDefined();
      expect(ret.handshakeKeys.publicKey).toBeDefined();
      expect(ret.handshakeKeys.privateKey).toBeDefined();
      expect(ret.signingKeys.publicKey).toBeDefined();
      expect(ret.signingKeys.privateKey).toBeDefined();
    });

    it("should not create a VASP again (same vaspCode)", async () => {
      try {
        await sut.createVASP(vaspCode);
        fail();
      } catch (err) {
        expect(err).toBeDefined();
        expect(err).toBeInstanceOf(VASPCodeConflictError);
      }
    });
  });
});
