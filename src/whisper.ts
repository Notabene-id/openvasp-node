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
        ...filter,
        ttl: 20,
        minPow: 0.8
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
   * @param topic
   * @param sharedKey
   * @param cb
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
   * @returns Promise<string>: Hash of message
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
}
