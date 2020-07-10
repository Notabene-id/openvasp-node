import VASPIndexContract from "./vasp_index_contract";
import VASPContract from "./vasp_contract";
import Tools, { KeyPair } from "./tools";

import PrivateKeyProvider from "truffle-privatekey-provider";

import { provider } from "web3-core";
import Web3 from "web3";

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

export type VASPFactoryOptions = {
  provider?: provider;
  defaultSender?: string;
  rpcUrl?: string;
  privateKey?: string;
  vaspIndexAddress: string;
  vaspOwner?: string;
};

/**
 * Creates VASP contracts thru VASPIndex and sets the
 * handshake and signing keys
 */
export default class VASPFactory {
  private web3Provider: provider;
  private vaspIndexContract: VASPIndexContract;
  private vaspOwner?: string;

  /**
   *
   * @param options
   */
  constructor(options: VASPFactoryOptions) {
    if (options.provider) {
      this.web3Provider = options.provider;
    } else if (options.rpcUrl && options.privateKey) {
      //PrivateKeyProvider
      this.web3Provider = new PrivateKeyProvider(
        options.privateKey,
        options.rpcUrl
      );
    } else {
      throw new Error("unable to create a web3 provider");
    }

    this.vaspOwner = options.vaspOwner;

    //Init VASPIndexContract
    this.vaspIndexContract = new VASPIndexContract(
      this.web3Provider,
      options.vaspIndexAddress,
      options.defaultSender
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

    //Define VASP Contract Owner
    const owner = this.vaspOwner
      ? this.vaspOwner
      : (await new Web3(this.web3Provider).eth.personal.getAccounts())[0];

    //Create VASP Contract
    await this.vaspIndexContract.createVASPContract(owner, _vaspCode);

    //Get VASP address
    vaspAddress = await this.vaspIndexContract.getVASPAddressByCode(_vaspCode);

    //Create Handshake and Signing Keys
    const handshakeKeys = Tools.generateKeyPair();
    const signingKeys = Tools.generateKeyPair();

    //Store keys in contract
    const vaspContract = new VASPContract(this.web3Provider, owner);
    await vaspContract.setHandshakeKey(vaspAddress, handshakeKeys.publicKey);
    await vaspContract.setSigningKey(vaspAddress, signingKeys.publicKey);

    return { vaspAddress, handshakeKeys, signingKeys };
  }
}
