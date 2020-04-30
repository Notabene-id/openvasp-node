import Web3 from "web3";
import { provider } from "web3-core";

import { setupLoader } from "@openzeppelin/contract-loader";

/**
 * Allows to create VASP contracts and query the registry
 */
export default class VASPFacade {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  private facadeArtifact: any;

  /**
   *
   * @param _provider Web3 Provider (signing capabilities needed if creating VASP contracts)
   * @param _address Address of the VASPFacade contract
   */
  constructor(_provider: provider, _address: string) {
    const loader = setupLoader({ provider: new Web3(_provider) }).web3;
    loader.artifactsDir = "./node_modules/openvasp-contracts/build/contracts";
    this.facadeArtifact = loader.fromArtifact("VaspFacade");
    this.setAddress(_address);
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  private setAddress(_address: string): any {
    this.facadeArtifact.options.address = _address;
    return this.facadeArtifact;
  }

  async getVaspByCode(_code: string): Promise<string> {
    return await this.facadeArtifact.methods.getVaspByCode().call(_code);
  }

  async build(
    _name: string,
    _handshakeKey: string,
    _signingKey: string,
    _email: string,
    _website: string
  ): Promise<string> {
    return await this.facadeArtifact.methods.build(
      _name,
      _handshakeKey,
      _signingKey,
      _email,
      _website
    );
  }
}
