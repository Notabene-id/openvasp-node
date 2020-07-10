import Web3 from "web3";
// eslint-disable-next-line @typescript-eslint/no-unused-vars
import { provider } from "web3-core";

import { setupLoader } from "@openzeppelin/contract-loader";

/**
 * VASP data that is stored on the VASP contract
 */
export type VASPContractData = {
  /** Address of the contract */
  address?: string;
  /** Owner of the contract (address) */
  owner?: string;
  /** Handshake key */
  handshakeKey?: string;
  /** Signing key */
  signingKey?: string;
};

/**
 * Access to VASPContract Information
 */
export default class VASPContract {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  private contractArtifact: any;

  /**
   * Creates an VASPContract
   *
   * @param _provider Web3Provider
   * @param _defaultSender default "from"
   */
  constructor(_provider: provider, _defaultSender?: string) {
    const provider = new Web3(_provider);
    const loader = setupLoader({ provider, defaultSender: _defaultSender });
    loader.web3.artifactsDir =
      "./node_modules/openvasp-contracts/build/contracts";
    this.contractArtifact = loader.web3.fromArtifact("VASP");
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  private getVASPContractInstance(_address: string): any {
    this.contractArtifact.options.address = _address;
    return this.contractArtifact;
  }

  /**
   * Get all public fields from the contract
   *
   * @param _address VASP contract address
   */
  async getAllFields(_address: string): Promise<VASPContractData> {
    //TODO: I think all the queries can be done in parallel (Promise.all())
    const handshakeKey = await this.getHandshakeKey(_address);
    const signingKey = await this.getSigningKey(_address);

    return {
      address: _address,
      handshakeKey,
      signingKey,
    };
  }

  /**
   * @param _address VASP contract address
   */
  async getHandshakeKey(_address: string): Promise<string> {
    const vaspContractInstance = this.getVASPContractInstance(_address);
    return await vaspContractInstance.methods.handshakeKey().call();
  }

  /**
   * @param _address VASP contract address
   */
  async getSigningKey(_address: string): Promise<string> {
    const vaspContractInstance = this.getVASPContractInstance(_address);
    return await vaspContractInstance.methods.signingKey().call();
  }

  /**
   * @param _address VASP contract address
   * @param _handshakeKey handshakeKey string
   */
  async setHandshakeKey(
    _address: string,
    _handshakeKey: string
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
  ): Promise<any> {
    const vaspContractInstance = this.getVASPContractInstance(_address);
    const res = await vaspContractInstance.methods
      .setHandshakeKey(_handshakeKey)
      .send();
    return res;
  }

  /**
   * @param _address VASP contract address
   * @param _signingKey signingKey string
   */
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  async setSigningKey(_address: string, _signingKey: string): Promise<any> {
    const vaspContractInstance = this.getVASPContractInstance(_address);
    const res = await vaspContractInstance.methods
      .setSigningKey(_signingKey)
      .send();
    return res;
  }
}
