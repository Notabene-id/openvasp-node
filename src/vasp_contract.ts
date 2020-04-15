import { provider } from "web3-core";
import { ZWeb3, Contracts, Contract } from "@openzeppelin/upgrades";

interface VASPContractFields {
  owner: string;
  name: string;
  channels: Array<string>;
  handshakeKey: string;
  signingKey: string;
}
export default class VASPContract {
  private VASPContractArtifact: Contract;

  constructor(_provider: provider) {
    ZWeb3.initialize(_provider);
    this.VASPContractArtifact = Contracts.getFromNodeModules(
      "openvasp-contracts",
      "VASP"
    );
  }

  async getAllFields(_address: string): Promise<VASPContractFields> {
    //TODO: I think all the queries can be done in parallel (Promise.all())
    return {
      owner: await this.getOwner(_address),
      name: await this.getName(_address),
      channels: await this.getChannels(_address),
      handshakeKey: await this.getHandshakeKey(_address),
      signingKey: await this.getSigningKey(_address),
    };
  }

  async getOwner(_address: string): Promise<string> {
    const VASPContract = this.VASPContractArtifact.at(_address);
    return await VASPContract.methods.owner().call();
  }

  async getName(_address: string): Promise<string> {
    const VASPContract = this.VASPContractArtifact.at(_address);
    return await VASPContract.methods.name().call();
  }

  async getChannels(_address: string): Promise<Array<string>> {
    const VASPContract = this.VASPContractArtifact.at(_address);
    return await VASPContract.methods
      .channels(0, await VASPContract.methods.channelsCount().call())
      .call();
  }

  async getHandshakeKey(_address: string): Promise<string> {
    const VASPContract = this.VASPContractArtifact.at(_address);
    return await VASPContract.methods.handshakeKey().call();
  }

  async getSigningKey(_address: string): Promise<string> {
    const VASPContract = this.VASPContractArtifact.at(_address);
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
