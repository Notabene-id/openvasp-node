import VASPIndexContract from "./vasp_index_contract";
import VASPContract from "./vasp_contract";
import Tools, { KeyPair } from "./tools";

import { provider } from "web3-core";

/** VASP Code already exists in VASPIndex */
export class VASPCodeConflictError extends Error {}

/** Return of VASP creation */
export type CreateVASPReturn = {
  /** Address of deployed VASP contract*/
  vaspAddress: string;
  /** Handshake Keys */
  handshakeKeys: KeyPair;
  /** Signing Keys */
  signingKeys: KeyPair;
};

/**
 * Creates VASP contracts thru VASPIndex and sets the
 * handshake and signing keys
 */
export default class VASPFactory {
  private vaspIndexContract: VASPIndexContract;
  private vaspOwner: string;
  private provider: provider;

  /**
   *
   * @param _provider Web3 Provider (signing capabilities needed for creating VASP contracts)
   * @param _address Address of the VASPFacade contract
   * @param _defaultSender default "from"
   */
  constructor(_provider: provider, _address: string, _defaultSender: string) {
    this.provider = _provider;
    this.vaspOwner = _defaultSender;
    this.vaspIndexContract = new VASPIndexContract(
      _provider,
      _address,
      _defaultSender
    );
  }

  /**
   * Creates a VASP contract, generates keys and store them on the contract
   *
   * @param _vaspCode Desired VASP code
   */
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
