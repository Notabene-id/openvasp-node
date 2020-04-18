import { VASP } from ".";
import Tools from "./tools";
import Web3 from "web3";
import { provider } from "web3-core";

import { setupLoader } from "@openzeppelin/contract-loader";

export default class VASPContract {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  private contractArtifact: any;

  constructor(_provider: provider) {
    const loader = setupLoader({ provider: new Web3(_provider) }).web3;
    loader.artifactsDir = "./node_modules/openvasp-contracts/build/contracts";
    this.contractArtifact = loader.fromArtifact("VASP");
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  private getVASPContractInstance(_address: string): any {
    this.contractArtifact.options.address = _address;
    return this.contractArtifact;
  }

  async getAllFields(_address: string): Promise<VASP> {
    //TODO: I think all the queries can be done in parallel (Promise.all())
    return {
      code: Tools.addressToVaspCode(_address),
      owner: await this.getOwner(_address),
      name: await this.getName(_address),
      channels: await this.getChannels(_address),
      handshakeKey: await this.getHandshakeKey(_address),
      signingKey: await this.getSigningKey(_address),
    };
  }

  async getOwner(_address: string): Promise<string> {
    const VASPContract = this.getVASPContractInstance(_address);
    return await VASPContract.methods.owner().call();
  }

  async getName(_address: string): Promise<string> {
    const VASPContract = this.getVASPContractInstance(_address);
    return await VASPContract.methods.name().call();
  }

  async getChannels(_address: string): Promise<Array<string>> {
    const VASPContract = this.getVASPContractInstance(_address);
    return await VASPContract.methods
      .channels(0, await VASPContract.methods.channelsCount().call())
      .call();
  }

  async getHandshakeKey(_address: string): Promise<string> {
    const VASPContract = this.getVASPContractInstance(_address);
    return await VASPContract.methods.handshakeKey().call();
  }

  async getSigningKey(_address: string): Promise<string> {
    const VASPContract = this.getVASPContractInstance(_address);
    return await VASPContract.methods.signingKey().call();
  }

  /*
    const { streetName,
              buildingNumber,
              addressLine,
              postCode, 
              town, 
              country
          }=(await VASPContract.postalAddress())
          email: (await VASPContract.email())[0],
          website: (await VASPContract.website())[0],
          trustedPeers: (await VASPContract.trustedPeers(0,(await VASPContract.trustedPeersCount())[0]))[0],
          identityClaims: (await VASPContract.identityClaims(0,(await VASPContract.identityClaimsCount())[0]))[0],
      }
      */
}
