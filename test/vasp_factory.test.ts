import VASPFactory, { VASPCodeConflictError } from "../src/vasp_factory";

import { web3, accounts, contract } from "@openzeppelin/test-environment";
import { provider } from "web3-core";
import Tools from "../src/tools";

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
    const options = {
      provider: web3.currentProvider as provider,
      defaultSender: owner,
      vaspIndexAddress,
      vaspOwner: owner,
    };
    sut = new VASPFactory(options);
    done();
  });

  it("should create a provider with rpcUrl and privKey", () => {
    const options = {
      vaspIndexAddress: "0xd7d2852De4B15aBe9e4FeaDA798C466fdb228d6E",
      rpcUrl: "https://rinkeby.infura.io/",
      privateKey: Tools.generateKeyPair().privateKey.replace("0x", ""),
    };
    const vf = new VASPFactory(options);
    expect(vf).toBeDefined();
  });

  it("should fail if no provider", () => {
    const options = {
      vaspIndexAddress: "0x",
    };
    try {
      new VASPFactory(options);
      fail();
    } catch (err) {
      expect(err).toBeDefined();
      expect(err.message).toEqual("unable to create a web3 provider");
    }
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

    it("should create a VASP (no vaspOwner)", async () => {
      const vaspIndexAddress = instanceVASPIndexContract.address;
      const options = {
        provider: web3.currentProvider as provider,
        defaultSender: owner,
        vaspIndexAddress,
      };
      const vf = new VASPFactory(options);
      const vaspCode = "0x0123456789abcdee";
      const ret = await vf.createVASP(vaspCode);
      expect(ret.vaspAddress).toBeDefined();
      expect(ret.handshakeKeys).toBeDefined();
      expect(ret.handshakeKeys.publicKey).toBeDefined();
      expect(ret.handshakeKeys.privateKey).toBeDefined();
      expect(ret.signingKeys.publicKey).toBeDefined();
      expect(ret.signingKeys.privateKey).toBeDefined();
    });
  });
});
