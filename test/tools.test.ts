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
      expect(res).toEqual("0x" + sharedKey);
    });

    it("should work with 0x", () => {
      const res = Tools.deriveSharedKey("0x" + pubKey, "0x" + privKey);
      expect(res).toEqual("0x" + sharedKey);
    });

    it("should cross work", () => {
      const { privateKey, publicKey } = Tools.generateKeyPair();

      const sharedKeyA = Tools.deriveSharedKey(pubKey, privateKey);
      const sharedKeyB = Tools.deriveSharedKey(publicKey, privKey);

      expect(sharedKeyA).toEqual(sharedKeyB);
    });
  });

  describe("generateKeyPair", () => {
    it("should work", done => {
      const res = Tools.generateKeyPair();
      expect(res.privateKey).toBeDefined();
      expect(res.privateKey.length).toEqual(66); //'0x'+64
      expect(res.publicKey).toBeDefined();
      expect(res.publicKey.length).toEqual(132); //'0x'+130

      //console.log(res);
      done();
    });
  });

  describe("publicFromPrivateKey", () => {
    it("should work", () => {
      const { publicKey, privateKey } = Tools.generateKeyPair();
      expect(publicKey).toEqual(Tools.publicFromPrivateKey(privateKey));
    });
  });

  describe("sign", () => {
    it("should sign", () => {
      //Data from https://github.com/LykkeBusiness/openvasp-message-samples/blob/master/session-request.txt
      const message =
        '{"handshake":{"topica":"0xa4356c40","ecdhpk":"0xcaf60628b7b009439928890398cb11c7ff5c4d880f7c5304834576f3e5de0679a6a64b5e6b423a369a3c6a7e756c133118994d94906a490840881e7b0acc1674"},"vasp":{"name":"TestVaspContractPerson","id":"0x6befaf0656b953b188a0ee3bf3db03d07dface61","pk":"0x043061dce78a75a970fe7ff297870023931983982cb8615bfd9fe72c52f0040b6bf5e1a6c15085170eac9c584b2bf72d6296949e7ed60caaccf0c4f6ec0d330a5d","address":{"street":"Some StreetName ","number":"64","adrline":"Some AddressLine","postcode":"310031","town":"TownN","country":"DE"},"birth":{"birthdate":"20200428","birthcity":"Town X","birthcountry":"DE"},"nat":[{"natid_type":1,"natid":"ID","natid_country":"DE","natid_issuer":""}]},"msg":{"type":"110","msgid":"0xda770238290a75408b8397d0905d21bf","session":"0x8e8667b04d7ef44b8ae5617b472a0108","code":"1"},"comment":""}';
      const payloadWithSignature =
        "0x7b2268616e647368616b65223a7b22746f70696361223a2230786134333536633430222c2265636468706b223a2230786361663630363238623762303039343339393238383930333938636231316337666635633464383830663763353330343833343537366633653564653036373961366136346235653662343233613336396133633661376537353663313333313138393934643934393036613439303834303838316537623061636331363734227d2c2276617370223a7b226e616d65223a225465737456617370436f6e7472616374506572736f6e222c226964223a22307836626566616630363536623935336231383861306565336266336462303364303764666163653631222c22706b223a22307830343330363164636537386137356139373066653766663239373837303032333933313938333938326362383631356266643966653732633532663030343062366266356531613663313530383531373065616339633538346232626637326436323936393439653765643630636161636366306334663665633064333330613564222c2261646472657373223a7b22737472656574223a22536f6d65205374726565744e616d6520222c226e756d626572223a223634222c226164726c696e65223a22536f6d6520416464726573734c696e65222c22706f7374636f6465223a22333130303331222c22746f776e223a22546f776e4e222c22636f756e747279223a224445227d2c226269727468223a7b22626972746864617465223a223230323030343238222c22626972746863697479223a22546f776e2058222c226269727468636f756e747279223a224445227d2c226e6174223a5b7b226e617469645f74797065223a312c226e61746964223a224944222c226e617469645f636f756e747279223a224445222c226e617469645f697373756572223a22227d5d7d2c226d7367223a7b2274797065223a22313130222c226d73676964223a2230786461373730323338323930613735343038623833393764303930356432316266222c2273657373696f6e223a2230783865383636376230346437656634346238616535363137623437326130313038222c22636f6465223a2231227d2c22636f6d6d656e74223a22227dcd53938760e6585d3e1a9b428d27f8c33a81061e45bc3aca2ebe3b95fe55fbce637365cd1288a3f1326506563244e6b5412b8a6f186dc47a7a881415a86954371b";
      const privateKey =
        "0x790a3437381e0ca44a71123d56dc64a6209542ddd58e5a56ecdb13134e86f7c6";

      const payloadWithoutSignature = payloadWithSignature.substr(
        0,
        payloadWithSignature.length - 130
      );
      const signature = payloadWithSignature.substring(
        payloadWithSignature.length - 130
      );

      expect(signature.length).toEqual(130);

      const sig = Tools.sign(payloadWithoutSignature, privateKey);
      const sigWeb3 = Tools.signWeb3(message, privateKey);
      const sigWeb2 = Tools.signWeb3(payloadWithoutSignature, privateKey);

      expect(sigWeb2).toEqual(sigWeb3);
      expect(sigWeb3).toEqual(sig);
      expect(sigWeb3).toEqual("0x" + signature);
    });
  });
});
