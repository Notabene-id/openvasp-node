import Tools from "../src/tools";

describe("Tools", () => {
  const vaspAddress = "0x36D706A02fE35C64Ba21cF7Ed51695FC8DD00E63";

  describe("addressToVaspCode", () => {
    it("should work", () => {
      const res = Tools.addressToVaspCode(vaspAddress);
      expect(res).toEqual("8dd00e63");
    });
  });

  describe("deriveSharedKey", () => {
    const pubKey =
      "040b56fd6ac6647192760467fcc29ef05db21c622fe3f6e82eacbdcfa34c6ef003370c3a01918151c187b9978b6e35cb22e13450d8a7eafe31b3295551161e9f75";
    const privKey =
      "1c63d518dc301bece0ebde5fba8b5fc95f8d161eb2bc2f533d9112cd9bb64191";

    const sharedKey =
      "fd8fc21fb6f5f49930a49642f958ee590ca0caeeb6c40eede50fa2287d2e5406";

    it("should work", () => {
      const res = Tools.deriveSharedKey(pubKey, privKey);
      expect(res).toEqual(sharedKey);
    });

    it("should work with 0x", () => {
      const res = Tools.deriveSharedKey("0x" + pubKey, "0x" + privKey);
      expect(res).toEqual(sharedKey);
    });

    it("should cross work", () => {
      const { privateKey, publicKey } = Tools.generateKeyPair();

      const sharedKeyA = Tools.deriveSharedKey(pubKey, privateKey);
      const sharedKeyB = Tools.deriveSharedKey(publicKey, privKey);

      expect(sharedKeyA).toEqual(sharedKeyB);
    });
  });

  describe("generateKeyPair", () => {
    it("should work", () => {
      const res = Tools.generateKeyPair();
      expect(res.privateKey).toBeDefined();
      expect(res.privateKey.length).toEqual(64);
      expect(res.publicKey).toBeDefined();
      expect(res.publicKey.length).toEqual(130);
    });
  });

  describe("publicFromPrivateKey", () => {
    it("should work", () => {
      const { publicKey, privateKey } = Tools.generateKeyPair();
      expect(publicKey).toEqual(Tools.publicFromPrivateKey(privateKey));
    });
  });
});
