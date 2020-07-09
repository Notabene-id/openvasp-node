import Web3 from "web3";
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

export default class VASPContract {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  private contractArtifact: any;

  constructor(_provider: provider, defaultSender?: string) {
    const provider = new Web3(_provider);
    const loader = setupLoader({ provider, defaultSender });
    loader.web3.artifactsDir =
      "./node_modules/openvasp-contracts/build/contracts";
    this.contractArtifact = loader.web3.fromArtifact("VASP");
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  private getVASPContractInstance(_address: string): any {
    this.contractArtifact.options.address = _address;
    return this.contractArtifact;
  }

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

  async getHandshakeKey(_address: string): Promise<string> {
    const vaspContractInstance = this.getVASPContractInstance(_address);
    return await vaspContractInstance.methods.handshakeKey().call();
  }

  async getSigningKey(_address: string): Promise<string> {
    const vaspContractInstance = this.getVASPContractInstance(_address);
    return await vaspContractInstance.methods.signingKey().call();
  }

  async setHandshakeKey(
    _address: string,
    _handshakeKey: string
  ): Promise<void> {
    const vaspContractInstance = this.getVASPContractInstance(_address);
    console.log(vaspContractInstance.methods.setHandshakeKey);
    await vaspContractInstance.methods.setHandshakeKey(_handshakeKey).send();
    return;
  }

  async setSigningKey(_address: string, _signingKey: string): Promise<void> {
    const vaspContractInstance = this.getVASPContractInstance(_address);
    await vaspContractInstance.methods.setSigningKey(_signingKey).send();
    return;
  }
}
