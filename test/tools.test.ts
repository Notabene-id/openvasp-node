import Tools from "../src/tools";

describe("Tools", () => {
  let sut: Tools;
  const vaspAddress = "0x36D706A02fE35C64Ba21cF7Ed51695FC8DD00E63";

  beforeAll(() => {
    sut = new Tools();
  });

  describe("addressToVaspCode", () => {
    it("should work", () => {
      const res = sut.addressToVaspCode(vaspAddress);
      expect(res).toEqual("8dd00e63");
    });
  });
});
