import Debug from "debug";
import { provider } from "web3-core";
import {
  VASPContract,
  PrivateVASP,
  WhisperTransport,
  CallbackFunction,
  Tools,
} from ".";
import {
  MessageFactory,
  SessionRequest,
  SessionReply,
  SessionReplyCode,
  TransferRequest,
  OriginatorInformation,
  BeneficiaryInformation,
  Transfer,
  TransferReply,
  TransferReplyCode,
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
      console.log("handshakeKeyPublic:" + handshakeKeyPublic);
      console.log("myVASPdata.handshakeKey:" + myVASPdata.handshakeKey);
      errors.push("HandshakeKeyPrivate does not derive HandshakeKey");
    }

    if (this.myVASP.signingKey != myVASPdata.signingKey) {
      errors.push("SigningKey are not the same");
      if (fix) {
        this.myVASP.signingKey = myVASPdata.signingKey;
      }
    }

    //Derive publicKey from privateKey
    const signingKeyPublic = Tools.publicFromPrivateKey(
      this.myVASP.signingKeyPrivate
    );
    if (signingKeyPublic != myVASPdata.signingKey) {
      errors.push("SigningKeyPrivate does not derive SigningKey");
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
  ): Promise<{
    sessionRequest: SessionRequest;
    topicAwaitId: string;
    sharedKey: string;
  }> {
    const debug = Debug("openvasp-client:openvasp:sessionRequest");

    debug("Getting VASP data for: %s", _beneficiaryVASPAddress);
    //Get BeneficiaryVASP data from smart contract
    const benificiaryVASP = await this.vaspContract.getAllFields(
      _beneficiaryVASPAddress
    );

    //TODO: Check if BeneficiaryVASP is trusted

    //SessionRequest Msg
    const sessionRequest = MessageFactory.createSessionRequest(this.myVASP);

    //Create ephemereal keys
    const { privateKey, publicKey } = Tools.generateKeyPair();
    debug("Originator Ephemereal privateKey: %s", privateKey);
    debug("Benificiary handshake pubKey: %s", benificiaryVASP.handshakeKey);

    //Create ECDH Shared key
    const sharedKey = Tools.deriveSharedKey(
      benificiaryVASP.handshakeKey,
      privateKey
    );
    debug("sharedKey: %s", sharedKey);

    //Send publicKey to Beneficiary so they can create the same shared key
    sessionRequest.handshake.ecdhpk = publicKey;
    debug("Originator Ephemereal pubKey (handshake.ecdhpk): %s", publicKey);

    //TODO: Sign message. Sign what?
    sessionRequest.sig = "??";

    // Listen to session reply
    const topicAwaitId = await this.whisperTransport.waitForTopicMessage(
      sessionRequest.handshake.topica,
      sharedKey,
      topicAcallback
    );
    debug(
      "Waiting for Session Reply on topic: %s",
      sessionRequest.handshake.topica
    );
    debug("topicAwaitId: %s", topicAwaitId);

    //Send Request
    await this.whisperTransport.sendSessionRequest(
      benificiaryVASP,
      sessionRequest
    );
    debug(
      "Session Request: %s, sent to VASP: %s (%s)",
      sessionRequest.msg.session,
      benificiaryVASP.code,
      benificiaryVASP.name
    );

    return { sessionRequest, topicAwaitId, sharedKey };
  }

  /**
   * Waits for a Session Request
   *
   * @param requestCallback Function to call when Session Request arrives
   */
  async waitForSessionRequest(
    requestCallback: CallbackFunction
  ): Promise<string> {
    const debug = Debug("openvasp-client:openvasp:waitForSessionRequest");

    //Wait for Session Request
    const sessionRequestWaitId = await this.whisperTransport.waitForSessionRequest(
      this.myVASP,
      requestCallback
    );
    debug(
      "Waiting for Session Request for VASP: %s (%s)",
      this.myVASP.code,
      this.myVASP.name
    );
    debug("sessionRequestWaitId: %s", sessionRequestWaitId);

    return sessionRequestWaitId;
  }

  /**
   * Creates a handler for a session Request.
   * The handler authenticates the OriginatorVASP and sends a SessionReply.
   * Set the callback for the Topic messages (Transfer Requests)
   *
   * @param cb Callback when topic messages arrives
   */
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  handleSessionRequest(cb: any, storeSessionInfo: any) {
    return async (
      err: Error,
      sessionRequest: SessionRequest
    ): Promise<void> => {
      const debug = Debug("openvasp-client:openvasp:handleSessionRequest");

      if (!err) {
        const errors: Array<string> = [];

        debug(
          "Got Session Request: %s, from VASP: %s",
          sessionRequest.msg.session,
          sessionRequest.vasp.id
        );

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
          debug("Errors in authentication: %j", errors);
          replyCode =
            SessionReplyCode.SessionDeclinedOriginatorVASPCouldNotBeAuthenticated;
        }

        debug("Replying with code: %s", replyCode);
        const {
          sessionReply,
          topicBwaitId,
          sharedKey,
        } = await this.sessionReply(sessionRequest, replyCode, cb);

        await storeSessionInfo({
          sessionRequest,
          sessionReply,
          topicBwaitId,
          sharedKey,
        });
      } else {
        throw err;
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
  ): Promise<{
    sessionReply: SessionReply;
    topicBwaitId: string | undefined;
    sharedKey: string;
  }> {
    const debug = Debug("openvasp-client:openvasp:sessionReply");

    //SessionReply Msg
    const sessionReply = MessageFactory.createSessionReply(
      sessionRequest.msg.session,
      sessionReplyCode,
      this.myVASP
    );

    //Create ECDH Shared key
    debug(
      "Originator Ephemereal pubKey (handshake.ecdhpk): %s",
      sessionRequest.handshake.ecdhpk
    );
    debug("Benificiary handshake privKey: %s", this.myVASP.handshakeKeyPrivate);
    const sharedKey = Tools.deriveSharedKey(
      sessionRequest.handshake.ecdhpk,
      this.myVASP.handshakeKeyPrivate
    );
    debug("sharedKey: %s", sharedKey);

    let topicBwaitId;

    //Wait for messages on topic
    if (sessionReplyCode == SessionReplyCode.SessionAccepted) {
      // Listen to topicB
      topicBwaitId = await this.whisperTransport.waitForTopicMessage(
        sessionReply.handshake.topicb,
        sharedKey,
        topicBcallback
      );

      debug("Waiting for Messages on topic: %s", sessionReply.handshake.topicb);
      debug("topicAwaitId: %s", topicBwaitId);
    }

    //Send Reply
    await this.whisperTransport.sendToTopic(
      sessionRequest.handshake.topica,
      sharedKey,
      JSON.stringify(sessionReply)
    );

    debug(
      "Session Reply: %s, sent to topic: %s",
      sessionReply.msg.session,
      sessionRequest.handshake.topica
    );

    return { sessionReply, topicBwaitId, sharedKey };
  }

  /**
   *
   * Send a transfer request to a Beneficiary VASP
   *
   * @param session Session data
   * @param transferData Transfer data
   */
  async transferRequest(
    session: { id: string; topic: string; sharedKey: string },
    transferData: {
      originator: OriginatorInformation;
      beneficiary: BeneficiaryInformation;
      transfer: Transfer;
    }
  ): Promise<TransferRequest> {
    const debug = Debug("openvasp-client:openvasp:transferRequest");
    debug("sessionId: %j", session.id);

    //Create Transfer Request
    const transferRequest = MessageFactory.createTransferRequest(
      session.id,
      this.myVASP,
      transferData
    );

    //Send to beneficiary topic
    await this.whisperTransport.sendToTopic(
      session.topic,
      session.sharedKey,
      JSON.stringify(transferRequest)
    );

    debug(
      "TransferRequest: %s, sent to topic: %s",
      transferRequest.msg.msgid,
      session.topic
    );

    return transferRequest;
  }

  /**
   * Send a Transfer Reply Message
   *
   * @param session
   * @param transferRequest
   * @param transferReplyCode
   */
  async transferReply(
    session: { topic: string; sharedKey: string },
    transferRequest: TransferRequest,
    transferReplyCode: TransferReplyCode
  ): Promise<TransferReply> {
    const debug = Debug("openvasp-client:openvasp:transferRequest");

    //Reply Msg
    const transferReply = MessageFactory.createTransferReply(
      transferRequest,
      this.myVASP,
      transferReplyCode
    );

    //Send to originator topic
    await this.whisperTransport.sendToTopic(
      session.topic,
      session.sharedKey,
      JSON.stringify(transferReply)
    );

    debug(
      "TransferRequest: %s, sent to topic: %s",
      transferRequest.msg.msgid,
      session.topic
    );

    return transferReply;
  }

  /**
   * Stop waiting for a topic
   *
   * @param _id
   */
  async stopWaiting(_id: string): Promise<void> {
    return await this.whisperTransport.stopWaiting(_id);
  }
}
