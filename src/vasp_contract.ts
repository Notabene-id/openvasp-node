import { VASP } from ".";
import Tools from "./tools";
import Web3 from "web3";
import { provider } from "web3-core";

import { setupLoader } from "@openzeppelin/contract-loader";

interface PostalAddress {
  streetName: string;
  buildingNumber: string;
  addressLine: string;
  postCode: string;
  town: string;
  country: string;
}

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
    const owner = await this.getOwner(_address);
    const name = await this.getName(_address);
    const channels = await this.getChannels(_address);
    const handshakeKey = await this.getHandshakeKey(_address);
    const postalAddress: PostalAddress = await this.getPostalAddress(_address);
    const signingKey = await this.getSigningKey(_address);

    return {
      address: _address,
      code: Tools.addressToVaspCode(_address),
      owner,
      name,
      channels,
      handshakeKey,
      signingKey,
      postalAddress: {
        street: postalAddress.streetName || undefined,
        number: postalAddress.buildingNumber || undefined,
        adrline: postalAddress.addressLine || undefined,
        postcode: postalAddress.postCode,
        town: postalAddress.town,
        country: postalAddress.country,
      },
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

  async getPostalAddress(_address: string): Promise<PostalAddress> {
    const VASPContract = this.getVASPContractInstance(_address);
    return await VASPContract.methods.postalAddress().call();
  }

  async getEmail(_address: string): Promise<string> {
    const VASPContract = this.getVASPContractInstance(_address);
    return await VASPContract.methods.email().call();
  }

  async getWebsite(_address: string): Promise<string> {
    const VASPContract = this.getVASPContractInstance(_address);
    return await VASPContract.methods.website().call();
  }

  async getTrustedPeers(_address: string): Promise<Array<string>> {
    const VASPContract = this.getVASPContractInstance(_address);
    return await VASPContract.methods
      .trustedPeers(0, await VASPContract.methods.trustedPeersCount().call())
      .call();
  }

  async getIdentityClaims(_address: string): Promise<Array<string>> {
    const VASPContract = this.getVASPContractInstance(_address);
    return await VASPContract.methods
      .identityClaims(
        0,
        await VASPContract.methods.identityClaimsCount().call()
      )
      .call();
  }
}
