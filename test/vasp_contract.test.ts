import VASPContract from "../src/vasp_contract";

import { web3, accounts, contract } from "@openzeppelin/test-environment";
import { provider } from "web3-core";

const [owner] = accounts;

/**
 * VASPContract test
 */
describe("VASPContract test", () => {
  let sut: VASPContract;

  const vaspData = {
    handshakeKey: "0xfakeHS",
    signingKey: "0xfakeSK",
  };

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  let instanceVASPContract: any;
  let vaspAddress: string;

  beforeAll(async done => {
    sut = new VASPContract(web3.currentProvider as provider, owner);

    // Deploy demo VASP contracts
    contract.artifactsDir = "./node_modules/openvasp-contracts/build/contracts";
    const VASPArtifact = contract.fromArtifact("VASP");
    instanceVASPContract = await VASPArtifact.new(owner);
    vaspAddress = instanceVASPContract.address;
    done();
  });

  describe("setHandshakeKey", () => {
    it("should set the handshakeKey", async () => {
      await sut.setHandshakeKey(vaspAddress, vaspData.handshakeKey);
      const hsKey = await instanceVASPContract.handshakeKey();
      expect(hsKey).toEqual(vaspData.handshakeKey);
    });
  });

  describe("getHandshakeKey", () => {
    beforeAll(async done => {
      await instanceVASPContract.setHandshakeKey(vaspData.handshakeKey, {
        from: owner,
      });
      done();
    });

    it("should get the handshakeKey", async () => {
      const res = await sut.getHandshakeKey(vaspAddress);
      expect(res).toEqual(vaspData.handshakeKey);
    });
  });

  describe("setSigningKey", () => {
    it("should set the signingKey", async () => {
      await sut.setSigningKey(vaspAddress, vaspData.signingKey);
      const sKey = await instanceVASPContract.signingKey();
      expect(sKey).toEqual(vaspData.signingKey);
    });
  });

  describe("getSigningKey", () => {
    beforeAll(async done => {
      await instanceVASPContract.setSigningKey(vaspData.signingKey, {
        from: owner,
      });
      done();
    });

    it("should get the signingKey", async () => {
      const res = await sut.getSigningKey(vaspAddress);
      expect(res).toEqual(vaspData.signingKey);
    });
  });

  describe("getAllFields", () => {
    it("should work", async () => {
      const res = await sut.getAllFields(vaspAddress);
      expect(res).toEqual({
        address: vaspAddress,
        ...vaspData,
      });
    });
  });
});
