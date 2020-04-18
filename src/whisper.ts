import { PrivateVASP, VASP } from ".";
import { SessionRequest } from "./messages";
import Web3 from "web3";
import { provider } from "web3-core";
import { setIntervalAsync } from "set-interval-async/dynamic";

interface CallbackFunction {
  (error: null | Error, message?: string): void;
}

export default class WhisperTransport {
  web3: Web3;

  constructor(_provider: provider) {
    const web3 = new Web3(_provider);
    this.web3 = web3;
  }

  /**
   * Wait for Session Requests
   */
  waitForSessionRequest = async (
    originator: PrivateVASP,
    cb: CallbackFunction
  ): Promise<string> => {
    const originatorPrivateKeyId = await this.web3.shh.addPrivateKey(
      originator.handshakeKeyPrivate || ""
    );

    //Polls for messages
    const filter = {
      privateKeyID: originatorPrivateKeyId,
      ttl: 20,
      topics: ["0x" + originator.code],
      //minPow: 0.8,
    };

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
  };

  /**
   * Send Session Request Message.
   *
   * @returns Promise<string>: Hash of message
   */
  sendSessionRequest = async (
    beneficiary: VASP,
    sessionRequestMsg: SessionRequest
  ): Promise<string> => {
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
  };
}
