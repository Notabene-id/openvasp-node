import VASPIndexContract from "../src/vasp_index_contract";

import { web3, accounts, contract } from "@openzeppelin/test-environment";
import { provider } from "web3-core";

const [owner, vaspContractOwner] = accounts;

/**
 * VASPIndexContract test
 */
describe("VASPIndexContract test", () => {
  let sut: VASPIndexContract;

  const vaspData = {
    owner: vaspContractOwner,
    vaspCode: "0x0123456789abcdef",
    vaspAddress: "",
  };

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  let instanceVASPIndexContract: any;

  beforeAll(async done => {
    // Deploy demo VASPIndex contract
    contract.artifactsDir = "./node_modules/openvasp-contracts/build/contracts";
    const VASPIndexArtifact = contract.fromArtifact("VASPIndex");
    instanceVASPIndexContract = await VASPIndexArtifact.new();
    const vaspIndexAddress = instanceVASPIndexContract.address;
    sut = new VASPIndexContract(
      web3.currentProvider as provider,
      vaspIndexAddress,
      owner
    );
    done();
  });

  describe("createVASPContract", () => {
    it("should create a VASPContract", async () => {
      const tx = await sut.createVASPContract(
        vaspData.owner,
        vaspData.vaspCode
      );
      expect(tx.events.VASPcontractCreated).toBeDefined();
      expect(
        tx.events.VASPcontractCreated.returnValues.vaspAddress
      ).toBeDefined();
      expect(tx.events.VASPcontractCreated.returnValues.vaspCode).toEqual(
        vaspData.vaspCode
      );
      vaspData.vaspAddress =
        tx.events.VASPcontractCreated.returnValues.vaspAddress;
      expect(tx.events[0].address).toEqual(vaspData.vaspAddress);
    });
  });

  describe("getVASPAddressByCode", () => {
    it("should get the address", async () => {
      const res = await sut.getVASPAddressByCode(vaspData.vaspCode);
      expect(res).toEqual(vaspData.vaspAddress);
    });
  });

  describe("getVASPCodeByAddress", () => {
    it("should get the code", async () => {
      const res = await sut.getVASPCodeByAddress(vaspData.vaspAddress);
      expect(res).toEqual(vaspData.vaspCode);
    });
  });
});
