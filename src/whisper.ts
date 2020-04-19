import { PrivateVASP, VASP, CallbackFunction } from ".";
import { SessionRequest } from "./messages";
import Web3 from "web3";
import { provider } from "web3-core";
import { setIntervalAsync } from "set-interval-async/dynamic";

export default class WhisperTransport {
  web3: Web3;

  constructor(_provider: provider) {
    const web3 = new Web3(_provider);
    this.web3 = web3;
  }

  private async waitForMessage(
    filter: any,
    cb: CallbackFunction
  ): Promise<string> {
    /*
    filter={
        ttl: 20,
        minPow: 0.8,
        ...filter,
    }
    */

    const filterId = await this.web3.shh.newMessageFilter(filter);

    //Polls every half second for msg.
    setIntervalAsync(async () => {
      try {
        const messages = await this.web3.shh.getFilterMessages(filterId);
        for (const msg of messages) {
          const msgStr = this.web3.utils.hexToAscii(msg.payload);
          cb(null, JSON.parse(msgStr));
        }
      } catch (err) {
        cb(err);
      }
    }, 500);

    return filterId;
  }

  /**
   * Wait for Session Requests
   *
   * @param originator VASP waiting for session request
   * @param cb Function to call when SessionRequest message arrives
   * @returns waitId. Needed to finish listening.
   */
  async waitForSessionRequest(
    originator: PrivateVASP,
    cb: CallbackFunction
  ): Promise<string> {
    const originatorPrivateKeyId = await this.web3.shh.addPrivateKey(
      originator.handshakeKeyPrivate
    );

    const filter = {
      privateKeyID: originatorPrivateKeyId,
      topics: ["0x" + originator.code],
    };

    return this.waitForMessage(filter, cb);
  }

  /**
   * Wait for Topic Message
   *
   * @param topic Topic to listen to
   * @param sharedKey Shared key previously agreed
   * @param cb Function to call when message arrives
   * @returns waitId. Needed to finish listening.
   */
  async waitForTopicMessage(
    topic: string,
    sharedKey: string,
    cb: CallbackFunction
  ): Promise<string> {
    const sharedKeyId = await this.web3.shh.addSymKey(sharedKey);

    const filter = {
      symKeyID: sharedKeyId,
      topics: [topic],
    };

    return this.waitForMessage(filter, cb);
  }

  /**
   * Send Session Request Message.
   *
   * @param beneficiary BeneficiaryVASP destination of the message
   * @param sessionRequestMsg SessionRequest message to send
   * @returns Hash of message
   */
  async sendSessionRequest(
    beneficiary: VASP,
    sessionRequestMsg: SessionRequest
  ): Promise<string> {
    //TODO: Check if VASP.channels, support whisper

    // encrypts using the beneficiary VASP handshake key
    return await this.web3.shh.post({
      pubKey: beneficiary.handshakeKey,
      ttl: 10,
      topic: "0x" + beneficiary.code,
      payload: this.web3.utils.asciiToHex(JSON.stringify(sessionRequestMsg)),
      powTime: 3,
      powTarget: 0.5,
    });
  }

  /**
   * Send message to specific topic
   *
   * @param topic Topic where to send message
   * @param sharedKey Shared key previously agreed
   * @param message Message to send
   * @returns hash
   */
  async sendToTopic(
    topic: string,
    sharedKey: string,
    message: string
  ): Promise<string> {
    const sharedKeyId = await this.web3.shh.addSymKey(sharedKey);

    return await this.web3.shh.post({
      symKeyID: sharedKeyId,
      ttl: 10,
      topic: "0x" + topic,
      payload: this.web3.utils.asciiToHex(message),
      powTime: 3,
      powTarget: 0.5,
    });
  }

  /**
   * Generate Whisper Keypairs
   *
   * The Tools.generateKeyPaid does the same but in pure JS. No Whisper node query.
   */
  async newKeyPair(): Promise<{ publicKey: string; privateKey: string }> {
    const keyId = await this.web3.shh.newKeyPair();

    const publicKey = await this.web3.shh.getPublicKey(keyId);
    const privateKey = await this.web3.shh.getPrivateKey(keyId);

    await this.web3.shh.deleteKeyPair(keyId);

    return { publicKey, privateKey };
  }
}
