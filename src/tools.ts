import secp256k1 from "secp256k1";
import { randomBytes } from "crypto";

export default class Tools {
  /**
   * Converts VASP Smart Contract addres to code.
   *
   * @param _address  VASP Smart Contract address to be converted.
   * @returns VASP Code corresponding to the address
   *
   */
  static addressToVaspCode(_address: string): string {
    // TODO: Check address
    return _address.substring(34).toLowerCase();
  }

  /**
   * Generate public and private key
   *
   */
  static generateKeyPair(): { publicKey: string; privateKey: string } {
    let privKey;
    do {
      privKey = randomBytes(32);
    } while (!secp256k1.privateKeyVerify(privKey));

    const pubKey = secp256k1.publicKeyCreate(privKey, false);

    const privateKey = Buffer.from(privKey).toString("hex");
    const publicKey = Buffer.from(pubKey).toString("hex");

    return { privateKey, publicKey };
  }

  /**
   * Get PublicKey from Private Key
   *
   * @param _privKey
   */
  static publicFromPrivateKey(_privKey: string): string {
    const privateKey = _privKey.replace("0x", "");
    const privKey = Uint8Array.from(Buffer.from(privateKey, "hex"));

    const pubKey = secp256k1.publicKeyCreate(privKey, false);
    const publicKey = Buffer.from(pubKey).toString("hex");

    return publicKey;
  }

  /**
   *  Symmetric ECDH key derivation
   *
   * @param _publicKeyA
   * @param _privateKeyB
   */
  static deriveSharedKey(_publicKeyA: string, _privateKeyB: string): string {
    const publicKeyA = _publicKeyA.replace("0x", "");
    const privateKeyB = _privateKeyB.replace("0x", "");

    const pubKey = Uint8Array.from(Buffer.from(publicKeyA, "hex"));
    const privKey = Uint8Array.from(Buffer.from(privateKeyB, "hex"));

    // get X point of ecdh
    const ecdhPointX = secp256k1.ecdh(pubKey, privKey);
    return Buffer.from(ecdhPointX).toString("hex");
  }
}
