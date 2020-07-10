import secp256k1 from "secp256k1";
import { randomBytes } from "crypto";
import { ecsign, hashPersonalMessage, toRpcSig } from "ethereumjs-util";
import Web3 from "web3";

export type KeyPair = {
  publicKey: string;
  privateKey: string;
};

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
   * Checks is VAAN is well formed
   *
   * @param _vaan
   */
  static checkVaan(_vaan: string): void {
    if (_vaan.length != 24) throw new Error("invalid length");
    //TODO: Check if hex string
    //TODO: CheckSum8 Modulo 256
    return;
  }

  /**
   * Gets the VASP Code from the VAAN (first 4 bytes)
   *
   * @param _vaan
   */
  static vaspCodeFromVaan(_vaan: string): string {
    return _vaan.substr(0, 8);
  }

  /**
   * Generate public and private key
   *
   */
  static generateKeyPair(): KeyPair {
    let privKey;
    do {
      privKey = randomBytes(32);
    } while (!secp256k1.privateKeyVerify(privKey));

    const pubKey = secp256k1.publicKeyCreate(privKey, false);

    const privateKey = "0x" + Buffer.from(privKey).toString("hex");
    const publicKey = "0x" + Buffer.from(pubKey).toString("hex");

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
    const publicKey = "0x" + Buffer.from(pubKey).toString("hex");

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
    return "0x" + Buffer.from(ecdhPointX).toString("hex");
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  static jsonToHex(_jsonMsg: any): string {
    return (
      "0x" + Buffer.from(JSON.stringify(_jsonMsg), "utf-8").toString("hex")
    );
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  static hexToJson(_hexStr: string): any {
    //TODO: stripHexPrefix()
    const msgHex = _hexStr.replace("0x", "");
    return JSON.parse(Buffer.from(msgHex, "hex").toString());
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  static sign(_msgHex: string, _privKey: string): any {
    const msgHex = _msgHex.replace("0x", "");
    const msg = Buffer.from(msgHex, "hex");

    const privateKey = _privKey.replace("0x", "");
    const privKey = Buffer.from(privateKey, "hex");

    const sig = ecsign(hashPersonalMessage(msg), privKey);

    return toRpcSig(sig.v, sig.r, sig.s);
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  static signWeb3(_msg: string, _privKey: string): any {
    const web3 = new Web3();
    const sig = web3.eth.accounts.sign(_msg, _privKey);
    return sig.signature;
  }

  static randomVASPCode(): string {
    const vaspCode = randomBytes(8);
    return "0x" + Buffer.from(vaspCode).toString("hex");
  }
}
