import Tools from "../src/tools";

describe("Tools", () => {
  const vaspAddress = "0x36D706A02fE35C64Ba21cF7Ed51695FC8DD00E63";

  describe("addressToVaspCode", () => {
    it("should work", () => {
      const res = Tools.addressToVaspCode(vaspAddress);
      expect(res).toEqual("8dd00e63");
    });
  });
});
