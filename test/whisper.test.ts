import WhisperTransport from "../src/whisper";
import { VASP, PrivateVASP } from "../src";
import { SessionRequest, MessageType } from "../src/messages";
import Web3 from "web3";

/**
 * WhisperTransport test
 */
describe("WhisperTransport test", () => {
  let sut: WhisperTransport;
  let web3: Web3;

  const originator: VASP = {
    address: "0x000000000000089abcdef",
    code: "89abcdef",
    name: "FakeOriVASP",
    owner: "0xfakeOwner0",
    channels: ["0"],
    handshakeKey:
      "0x040b56fd6ac6647192760467fcc29ef05db21c622fe3f6e82eacbdcfa34c6ef003370c3a01918151c187b9978b6e35cb22e13450d8a7eafe31b3295551161e9f75",
    signingKey:
      "0x040b56fd6ac6647192760467fcc29ef05db21c622fe3f6e82eacbdcfa34c6ef003370c3a01918151c187b9978b6e35cb22e13450d8a7eafe31b3295551161e9f75",
    postalAddress: {
      country: "",
      postcode: "",
      town: "",
    },
  };

  const originatorPrivate: PrivateVASP = {
    ...originator,
    handshakeKeyPrivate:
      "0x1c63d518dc301bece0ebde5fba8b5fc95f8d161eb2bc2f533d9112cd9bb64191",
  };

  const beneficiary: VASP = {
    address: "0x000000000000089abcdef",
    code: "89abcdef",
    name: "FakeBenVASP",
    owner: "0xfakeOwner1",
    channels: ["0"],
    handshakeKey:
      "0x04a5d1e687a485dc654fd4641c3893108b4393addfca83e25f6cd0156e990180dd079cea5551a1e74e1edb318192e0f2dd00ff5598fa4f8780a49549a3c1f49773",
    signingKey:
      "0x04a5d1e687a485dc654fd4641c3893108b4393addfca83e25f6cd0156e990180dd079cea5551a1e74e1edb318192e0f2dd00ff5598fa4f8780a49549a3c1f49773",
    postalAddress: {
      country: "",
      postcode: "",
      town: "",
    },
  };

  const sessionRequest: SessionRequest = {
    msg: {
      type: MessageType.SessionRequest,
      msgid: "0",
      session: "01234-5678-9012",
      code: "1",
    },
    handshake: {
      topica: "0x01020304",
      ecdhpk: originator.handshakeKey,
    },
    vasp: {
      name: originator.name,
      id: "0x",
      pk: originator.handshakeKey,
      address: {
        postcode: "12345",
        town: "Stgo",
        country: "CL",
      },
    },
    sig: "0xfakesig",
  };

  beforeAll(() => {
    web3 = new Web3("http://localhost:8545");
    sut = new WhisperTransport(web3.currentProvider);
  });

  it("should be defined", () => {
    expect(sut).toBeDefined();
  });

  describe("sendSessionRequest", () => {
    it("should work", async done => {
      const res = await sut.sendSessionRequest(beneficiary, sessionRequest);
      expect(res).toBeDefined();
      done();
    });
  });

  describe("waitForSessionRequest", () => {
    it("should receive session request", async done => {
      const filterId = await sut.waitForSessionRequest(
        originatorPrivate,
        async (err, mesg) => {
          expect(err).toBeNull();
          expect(mesg).toEqual(sessionRequest);
          await web3.shh.deleteMessageFilter(filterId);
          done();
        }
      );
      await sut.sendSessionRequest(originator, sessionRequest);
    });
  });
});
