import VASPContract from "../src/vasp_contract";

import { web3, accounts, contract } from  '@openzeppelin/test-environment';
const [ owner, administrator ] = accounts;

/**
 * VASPContract test
 */
describe("VASPContract test", () => {
  let sut :VASPContract;

  const vaspData={
    name: "TestVASP",
    channels: ["8"],
    handshakeKey: "0xfakeHS",
    signingKey: "0xfakeSK",
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  let instanceVASPContract :any;
  let vaspAddress :string;


  beforeAll(async done =>{
    sut = new VASPContract(web3.currentProvider);

    // Deploy demo VASP contracts
    contract.artifactsDir="./node_modules/openvasp-contracts/build/contracts"
    const VASPMArtifact = contract.fromArtifact('VASP');
    instanceVASPContract = await VASPMArtifact.new()
    await instanceVASPContract.initialize(owner,[administrator]);
    vaspAddress=instanceVASPContract.address
    done();
  });

  describe("getOwner", () => {
    
    it("should get the owner", async () => {
      const res = await sut.getOwner(vaspAddress);
      expect(res).toEqual(owner);
    });

  });

  describe("getName", () => {
    
    beforeAll(async done=>{
      await instanceVASPContract.setName(vaspData.name,{from: administrator})
      done();
    })

    it("should get the name", async () => {
      const res = await sut.getName(vaspAddress);
      expect(res).toEqual(vaspData.name);
    });

  });

  describe("getChannels", () => {
    
    beforeAll(async done=>{
      await instanceVASPContract.addChannel(parseInt(vaspData.channels[0]),{from: administrator})
      done();
    })

    it("should get the channels", async () => {
      const res = await sut.getChannels(vaspAddress);
      expect(res).toEqual(vaspData.channels);
    });

  });

  describe("getHandshakeKey", () => {
    
    beforeAll(async done=>{
      await instanceVASPContract.setHandshakeKey(vaspData.handshakeKey,{from: administrator})
      done();
    })

    it("should get the handshakeKey", async () => {
      const res = await sut.getHandshakeKey(vaspAddress);
      expect(res).toEqual(vaspData.handshakeKey);
    });

  });

  describe("getSigningKey", () => {
    
    beforeAll(async done=>{
      await instanceVASPContract.setSigningKey(vaspData.signingKey,{from: administrator})
      done();
    })

    it("should get the signingKey", async () => {
      const res = await sut.getSigningKey(vaspAddress);
      expect(res).toEqual(vaspData.signingKey);
    });

  });

  describe("getAllFields", () => {

    it("should work", async () => {
      const res = await sut.getAllFields(vaspAddress);
      expect(res).toEqual({
        owner,
        ...vaspData
      });
    });

  });


});
