import { provider } from "web3-core";
import {
  VASPContract,
  PrivateVASP,
  WhisperTransport,
  CallbackFunction,
} from ".";
import {
  MessageFactory,
  SessionRequest,
  SessionReply,
  SessionReplyCode,
} from "./messages";

export class OpenVASP {
  myVASP: PrivateVASP;
  vaspContract: VASPContract;
  whisperTransport: WhisperTransport;

  constructor(
    _myVASP: PrivateVASP,
    _contractProvider: provider,
    _whisperProvider: provider
  ) {
    this.myVASP = _myVASP;
    this.vaspContract = new VASPContract(_contractProvider);
    this.whisperTransport = new WhisperTransport(_whisperProvider);
  }

  async checkMyVASP(fix: boolean): Promise<Array<string>> {
    //Get MyVASP data from smart contract
    const myVASPdata = await this.vaspContract.getAllFields(
      this.myVASP.address
    );

    const errors: Array<string> = [];

    if (this.myVASP.handshakeKey != myVASPdata.handshakeKey) {
      errors.push("Handshakey are not the same");
      if (fix) {
        this.myVASP.handshakeKey = myVASPdata.handshakeKey;
      }
    }

    //TODO. Derive publicKey from privateKey
    if (this.myVASP.handshakeKeyPrivate != myVASPdata.handshakeKey) {
      errors.push("HandshakeKeyPrivate does not derive HandshakeKey");
    }

    return errors;
  }

  /**
   * Send a Session Request
   *
   * @param _beneficiaryVASPAddress Address of the Beneficiary VASP
   * @param replyCallback Function to call when Session Reply arrives
   */
  async sessionRequest(
    _beneficiaryVASPAddress: string,
    topicAcallback: CallbackFunction
  ): Promise<{ sessionRequest: SessionRequest; topicAwaitId: string }> {
    //Get BeneficiaryVASP data from smart contract
    const benificiaryVASP = await this.vaspContract.getAllFields(
      _beneficiaryVASPAddress
    );

    //TODO: Check if BeneficiaryVASP is trusted

    //SessionRequest Msg
    const sessionRequest = MessageFactory.createSessionRequest(this.myVASP);

    //Shared key ? (don't know how to create it. Derived from ecdhpk?
    const sharedKey = sessionRequest.handshake.ecdhpk;

    // Listen to session reply
    const topicAwaitId = await this.whisperTransport.waitForTopicMessage(
      sessionRequest.handshake.topica,
      sharedKey,
      topicAcallback
    );

    //Send Request
    await this.whisperTransport.sendSessionRequest(
      benificiaryVASP,
      sessionRequest
    );

    return { sessionRequest, topicAwaitId };
  }

  /**
   * Waits for a Session Request
   *
   * @param requestCallback Function to call when Session Request arrives
   */
  async waitForSessionRequest(
    requestCallback: CallbackFunction
  ): Promise<string> {
    //Wait for Session Request
    const sessionRequestWaitId = await this.whisperTransport.waitForSessionRequest(
      this.myVASP,
      requestCallback
    );

    return sessionRequestWaitId;
  }

  /**
   * Send a Session Reply
   *
   * @param sessionRequest Request to be replied
   * @param sessionReplyCode Reply Answer
   * @param topicBcallback  Function to call when messages arrives.
   */
  async sessionReply(
    sessionRequest: SessionRequest,
    sessionReplyCode: SessionReplyCode,
    topicBcallback: CallbackFunction
  ): Promise<{ sessionReply: SessionReply; topicBwaitId: string | undefined }> {
    //SessionReply Msg
    const sessionReply = MessageFactory.createSessionReply(
      sessionRequest.msg.session,
      sessionReplyCode,
      this.myVASP
    );
    //Shared key ? (don't know how to create it. Derived from ecdhpk?
    const sharedKey = sessionRequest.handshake.ecdhpk;

    let topicBwaitId;

    //Wait for messages on topic
    if (sessionReplyCode == SessionReplyCode.SessionAccepted) {
      // Listen to topicB
      topicBwaitId = await this.whisperTransport.waitForTopicMessage(
        sessionReply.handshake.topicb,
        sharedKey,
        topicBcallback
      );
    }
    //Send Reply
    await this.whisperTransport.sendToTopic(
      sessionRequest.handshake.topica,
      sharedKey,
      JSON.stringify(sessionReply)
    );
    return { sessionReply, topicBwaitId };
  }
}
