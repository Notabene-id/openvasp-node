import { provider } from "web3-core";
import {
  VASPContract,
  PrivateVASP,
  WhisperTransport,
  CallbackFunction,
  Tools,
  WaitId,
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

  /**
   * Check MyVASP data against data stored on the contract
   *
   * @param fix Fix MyVASP data with contract data?
   * @returns Array of errors.
   */
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

    //Derive publicKey from privateKey
    const handshakeKeyPublic = Tools.publicFromPrivateKey(
      this.myVASP.handshakeKeyPrivate
    );
    if (handshakeKeyPublic != myVASPdata.handshakeKey) {
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
  ): Promise<{ sessionRequest: SessionRequest; topicAwaitId: WaitId }> {
    //Get BeneficiaryVASP data from smart contract
    const benificiaryVASP = await this.vaspContract.getAllFields(
      _beneficiaryVASPAddress
    );

    //TODO: Check if BeneficiaryVASP is trusted

    //SessionRequest Msg
    const sessionRequest = MessageFactory.createSessionRequest(this.myVASP);

    //Create ephemereal keys
    const { privateKey, publicKey } = Tools.generateKeyPair();

    //Create ECDH Shared key
    const sharedKey = Tools.deriveSharedKey(
      benificiaryVASP.handshakeKey,
      privateKey
    );

    //Send publicKey to Beneficiary so they can create the same shared key
    sessionRequest.handshake.ecdhpk = publicKey;

    //TODO: Sign message. Sign what?
    sessionRequest.sig = "??";

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
  ): Promise<WaitId> {
    //Wait for Session Request
    const sessionRequestWaitId = await this.whisperTransport.waitForSessionRequest(
      this.myVASP,
      requestCallback
    );

    return sessionRequestWaitId;
  }

  /**
   * Creates a handler for a session Request.
   * The handler authenticates the OriginatorVASP and sends a SessionReply.
   * Set the callback for the Topic messages (Transfer Requests)
   *
   * @param cb
   */
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  handleSessionRequest(cb: any) {
    return async (
      err: CallbackFunction,
      sessionRequest: SessionRequest
    ): Promise<void> => {
      if (!err) {
        const errors: Array<string> = [];

        const originatorVASP = sessionRequest.vasp;
        //Get MyVASP data from smart contract

        try {
          const originatorVASPsmartContract = await this.vaspContract.getAllFields(
            originatorVASP.id
          );

          //Authenticate originatorVASP (check sig with signingKey in Smart Contract)
          //Check if publicKey match
          if (originatorVASP.pk != originatorVASPsmartContract.signingKey) {
            errors.push("Key in contract don't match key in request");
          }

          //TODO: Check signature
          //sessionRequest.sig
          //originatorVASP.pk / originatorVASPsmartContract.signingKey

          //TODO: Check if VASP is "trusted"
        } catch (err) {
          errors.push("Can't authenticate Originator VASP");
          errors.push(err.message);
        }

        let replyCode: SessionReplyCode;
        if (errors.length == 0) {
          replyCode = SessionReplyCode.SessionAccepted;
        } else {
          replyCode =
            SessionReplyCode.SessionDeclinedOriginatorVASPCouldNotBeAuthenticated;
        }

        await this.sessionReply(sessionRequest, replyCode, cb);
      }
      return;
    };
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
  ): Promise<{ sessionReply: SessionReply; topicBwaitId: WaitId | undefined }> {
    //SessionReply Msg
    const sessionReply = MessageFactory.createSessionReply(
      sessionRequest.msg.session,
      sessionReplyCode,
      this.myVASP
    );
    //Create ECDH Shared key
    const sharedKey = Tools.deriveSharedKey(
      sessionRequest.handshake.ecdhpk,
      this.myVASP.signingKeyPrivate
    );

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
