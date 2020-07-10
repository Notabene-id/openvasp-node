import VASPIndexContract from "./vasp_index_contract";
import VASPContract from "./vasp_contract";
import Tools from "./tools";

import { provider } from "web3-core";

export class VASPCodeConflictError extends Error {}

export type CreateVASPReturn = {
  vaspAddress: string;
  handshakeKeys: {
    privateKey: string;
    publicKey: string;
  };
  signingKeys: {
    privateKey: string;
    publicKey: string;
  };
};

export default class VASPFactory {
  private vaspIndexContract: VASPIndexContract;
  private vaspOwner: string;
  private provider: provider;

  constructor(_provider: provider, _address: string, _defaultSender: string) {
    this.provider = _provider;
    this.vaspOwner = _defaultSender;
    this.vaspIndexContract = new VASPIndexContract(
      _provider,
      _address,
      _defaultSender
    );
  }

  async createVASP(_vaspCode: string): Promise<CreateVASPReturn> {
    //Check if _vaspCode exists
    let vaspAddress = await this.vaspIndexContract.getVASPAddressByCode(
      _vaspCode
    );
    if (vaspAddress !== "0x0000000000000000000000000000000000000000") {
      throw new VASPCodeConflictError(
        "VASP Code " + _vaspCode + " conflict with existing"
      );
    }

    const owner = this.vaspOwner;
    //Create VASP Contract
    await this.vaspIndexContract.createVASPContract(owner, _vaspCode);

    //Get VASP address
    vaspAddress = await this.vaspIndexContract.getVASPAddressByCode(_vaspCode);

    //Create Handshake and Signing Keys
    const handshakeKeys = Tools.generateKeyPair();
    const signingKeys = Tools.generateKeyPair();

    //Store keys in contract
    const vaspContract = new VASPContract(this.provider, this.vaspOwner);
    await vaspContract.setHandshakeKey(vaspAddress, handshakeKeys.publicKey);
    await vaspContract.setSigningKey(vaspAddress, signingKeys.publicKey);

    return { vaspAddress, handshakeKeys, signingKeys };
  }
}
