import Web3 from "web3";
// eslint-disable-next-line @typescript-eslint/no-unused-vars
import { provider } from "web3-core";

import { setupLoader } from "@openzeppelin/contract-loader";

/**
 * Allows to create VASP contracts and query the registry
 */
export default class VASPIndexContract {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  private contractArtifact: any;

  /**
   *
   * @param _provider Web3 Provider (signing capabilities needed if creating VASP contracts)
   * @param _address Address of the VASPFacade contract
   * @param _defaultSender default "from"
   */
  constructor(_provider: provider, _address: string, _defaultSender?: string) {
    const provider = new Web3(_provider);
    const loader = setupLoader({
      provider,
      defaultSender: _defaultSender,
      defaultGas: 3000000,
    });
    loader.web3.artifactsDir =
      "./node_modules/openvasp-contracts/build/contracts";
    this.contractArtifact = loader.web3.fromArtifact("VASPIndex");
    this.setAddress(_address);
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  private setAddress(_address: string): any {
    this.contractArtifact.options.address = _address;
    return this.contractArtifact;
  }

  /**
   * Creates a new VASP contract
   *
   * @param _owner Address of VASP Contract owner
   * @param _vaspCode VASPCode
   */
  async createVASPContract(
    _owner: string,
    _vaspCode: string
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
  ): Promise<any> {
    const res = await this.contractArtifact.methods
      .createVASPContract(_owner, _vaspCode)
      .send();
    return res;
  }

  /**
   * Get VASP contract address by VASP code
   * @param _code VASP code
   */
  async getVASPAddressByCode(_code: string): Promise<string> {
    return await this.contractArtifact.methods
      .getVASPAddressByCode(_code)
      .call();
  }

  /**
   * Get VASP contract code by VASP contract address
   * @param _address VASP contract address
   */
  async getVASPCodeByAddress(_address: string): Promise<string> {
    return await this.contractArtifact.methods
      .getVASPCodeByAddress(_address)
      .call();
  }
}
