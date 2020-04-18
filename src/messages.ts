import { v4 as uuidv4 } from "uuid";
import { PrivateVASP } from ".";

interface OpenVASPMessage {
  /** Comment */
  comment?: string;
  /** VASP information incl. public signing key */
  vasp: VASPInformation;
  /** Message signed with actor’s private signing key */
  sig: string;
}

enum MessageType {
  SessionRequest = "110",
  SessionReply = "150",
  TransferRequest = "210",
  TransferReply = "250",
  TransferDispatch = "310",
  TransferConfirmation = "350",
  Termination = "910",
}

/** 
 * ## 7.3 Session Request
 * 
 * Message number: 110
 * 
 * Actor: Originator VASP
 * 
 * Message Purpose:
 * Initiates a session between two VASPs. First part of a two-way handshake between VASPs to finally
generate a shared symmetric session key based on the Diffie–Hellman key-exchange protocol
 */
interface SessionRequest extends OpenVASPMessage {
  /** Message */
  msg: {
    /** Message type. Fixed Value 110 */
    type: MessageType.SessionRequest;
    /** Message identifier. Randomly set. Hex(128 bit) */
    msgid: string;
    /** Session identifier. Randomly set and used for entire session. Hex(128 bit) */
    session: string;
    /** Message code. Currently not used, fixed value ‘1’ */
    code: "1";
  };
  /** Handshake */
  handshake: {
    /** Topic A.  Randomly set. Hex(32 bit) */
    topica: string;
    /** ECDH public key. According to specified domain parameters. Hex(256 bit) */
    ecdhpk: string;
  };
}

/**
 * ## 7.4 Session Reply
 *
 * Message number: 150
 *
 * Actor: Beneficiary VASP
 *
 * Message Purpose:
 * Response (positive or negative) to a previous request for initiating a session between two VASPs. Second part of a two-way handshake.
 */
interface SessionReply extends OpenVASPMessage {
  /** Message */
  msg: {
    /** Message type. Fixed Value 150 */
    type: MessageType.SessionReply;
    /** Message identifier. Randomly set. Hex(128 bit) */
    msgid: string;
    /** Session identifier. As set in message 110. Hex(128 bit) */
    session: string;
    /** Message code */
    code: SessionReplyCode;
  };
  /** Handshake */
  handshake: {
    /** Topic B.  Randomly set. Hex(32 bit) */
    topicb: string;
  };
}

enum SessionReplyCode {
  SessionAccepted = "1",
  SessionDeclinedRequestNotValid = "2",
  SessionDeclinedOriginatorVASPCouldNotBeAuthenticated = "3",
  SessionDeclinedOriginatorVASPDeclined = "4",
  SessionDeclinedTemporaryDisruptionOfService = "5",
}

/**
 * ## 7.5 Transfer Request
 *
 * Message number: 210
 *
 * Actor: Originator VASP
 *
 * Message Purpose:
 * Seeking approval from the beneficiary VASP for a virtual asset transfer by specifying transfer details including originator and beneficiary information.
 */
interface TransferRequest extends OpenVASPMessage {
  /** Message */
  msg: {
    /** Message type. Fixed Value 210 */
    type: MessageType.TransferRequest;
    /** Message identifier. Randomly set. Hex(128 bit) */
    msgid: string;
    /** Session identifier. As set in message 110. Hex(128 bit) */
    session: string;
    /** Message code. Currently not used, fixed value ‘1’ */
    code: "1";
  };
  /** Originator */
  originator: OriginatorInformation;
  /** Beneficiary */
  beneficiary: BeneficiaryInformation;
  /** Transfer */
  transfer: {
    /** Virtual asset type */
    va: VirtualAssetType;
    /** Transfer type */
    ttype: TransferType;
    /** Amount. 18 digits */
    amount: BigInt;
  };
}

enum VirtualAssetType {
  Bitcoin = "BTC",
  Ethereum = "ETH",
}

enum TransferType {
  BlockchainTransaction = 1,
}

/**
 * ## 7.6 Transfer Reply
 *
 * Message number: 250
 *
 * Actor: Beneficiary VASP
 *
 * Message Purpose:
 * Response (positive or negative) to an originator VASP having sought approval for a virtual asset transfer by specifying transfer details including originator and beneficiary information.
 */
interface TransferReply extends OpenVASPMessage {
  /** Message */
  msg: {
    /** Message type. Fixed Value 250 */
    type: MessageType.TransferReply;
    /** Message identifier. Randomly set. Hex(128 bit) */
    msgid: string;
    /** Session identifier. As set in message 110. Hex(128 bit) */
    session: string;
    /** Message code. */
    code: TransferReplyCode;
  };
  /** Originator */
  originator: OriginatorInformation;
  /** Beneficiary */
  beneficiary: BeneficiaryInformation;
  /** Transfer */
  transfer: {
    /** Virtual asset type */
    va: VirtualAssetType;
    /** Transfer type */
    ttype: TransferType;
    /** Amount. 18 digits */
    amount: BigInt;
    /** Destination Address */
    destination?: string;
  };
}

enum TransferReplyCode {
  TransferAccepted = "1",
  TransferDeclinedRequestNotValid = "2",
  TransferDeclinedNoSuchBeneficiary = "3",
  TransferDeclinedVirtualAssetNotSupported = "4",
  TransferDeclinedTransferNotAuthorized = "5",
  TransferDeclinedTemporaryDisruptionOfService = "6",
}

/**
 * ## 7.7 Transfer Dispatch
 *
 * Message number: 310
 *
 * Actor: Originator VASP
 *
 * Message Purpose:
 * Notifies the beneficiary VASP that a virtual asset transaction has been committed to the blockchain.
 */
interface TransferDispatch extends OpenVASPMessage {
  /** Message */
  msg: {
    /** Message type. Fixed Value 310 */
    type: MessageType.TransferDispatch;
    /** Message identifier. Randomly set. Hex(128 bit) */
    msgid: string;
    /** Session identifier. As set in message 110. Hex(128 bit) */
    session: string;
    /** Message code. Currently not used, fixed value ‘1’ */
    code: "1";
  };
  /** Originator */
  originator: OriginatorInformation;
  /** Beneficiary */
  beneficiary: BeneficiaryInformation;
  /** Transfer */
  transfer: {
    /** Virtual asset type */
    va: VirtualAssetType;
    /** Transfer type */
    ttype: TransferType;
    /** Amount. 18 digits */
    amount: BigInt;
    /** Destination Address */
    destination?: string;
  };
  /** Transaction */
  tx: {
    /** Transaction identifier. Format specific to virtual asset / transfer type */
    txid?: string;
    /** Transaction datetime. ISO 8601 (YYYY-MM-DDThh:mm:ssZ) */
    datetime: string;
    /** Sending address. Blockchain-specific format, sending address used for transaction (non-UTXO systems)*/
    sendingadr?: string;
  };
}

/** 
 * ## 7.8 Transfer Confirmation
 * 
 * Message number: 350
 * 
 * Actor: Beneficiary VASP
 * 
 * Message Purpose:
 * Positive or negative acknowledgement to the originator VASP about the receipt of virtual assets
transferred via a blockchain transaction.
 */
interface TransferConfirmation extends OpenVASPMessage {
  /** Message */
  msg: {
    /** Message type. Fixed Value 350 */
    type: MessageType.TransferConfirmation;
    /** Message identifier. Randomly set. Hex(128 bit) */
    msgid: string;
    /** Session identifier. As set in message 110. Hex(128 bit) */
    session: string;
    /** Message code. */
    code: TransferConfirmationCodes;
  };
  /** Originator */
  originator: OriginatorInformation;
  /** Beneficiary */
  beneficiary: BeneficiaryInformation;
  /** Transfer */
  transfer: {
    /** Virtual asset type */
    va: VirtualAssetType;
    /** Transfer type */
    ttype: TransferType;
    /** Amount. 18 digits */
    amount: BigInt;
    /** Destination Address */
    destination?: string;
  };
  /** Transaction */
  tx: {
    /** Transaction identifier. Format specific to virtual asset / transfer type */
    txid?: string;
    /** Transaction datetime. ISO 8601 (YYYY-MM-DDThh:mm:ssZ) */
    datetime: string;
    /** Sending address. Blockchain-specific format, sending address used for transaction (non-UTXO systems)*/
    sendingadr?: string;
  };
}

enum TransferConfirmationCodes {
  TransferConfirmed = "1",
  TransferNotConfirmedDispatchNotValid = "2",
  TransferNotConfirmedAssetsNotReceived = "3",
  TransferNotConfirmedWrongAmount = "4",
  TransferNotConfirmedWrongAsset = "5",
  TransferNotConfirmedTransactionDataMismatch = "6",
}

/**
 * ## 7.9 Termination
 *
 * Message number: 910
 *
 * Actor: Originator VASP
 *
 * Message Purpose:
 * Terminates a session between two VASPs.
 */
interface Termination extends OpenVASPMessage {
  /** Message */
  msg: {
    /** Message type. Fixed Value 910 */
    type: MessageType.Termination;
    /** Message identifier. Randomly set. Hex(128 bit) */
    msgid: string;
    /** Session identifier. As set in message 110. Hex(128 bit) */
    session: string;
    /** Message code. */
    code: TerminationCodes;
  };
}

enum TerminationCodes {
  SessionClosedTransferOccurred = "1",
  SessionClosedTransferDeclinedByBeneficiaryVASP = "2",
  SessionClosedTransferCanceledByOriginatorVASP = "3",
}

enum NaturalPersonIdType {
  PassportNumber = 1,
  NationalIdentityNumber = 2,
  SocialSecurityNumber = 3,
  TaxIdentificationNumber = 4,
  AlienRegistrationNumber = 5,
  DriversLicenseNumber = 6,
  Other = 7,
}

enum JuridicalPersonIdType {
  CountryIdentificationNumber = 1,
  TaxIdentificationNumber = 2,
  CertificateIncorporationNumber = 3,
  LegalEntityIdentifier = 4,
  BankPartyIdentification = 5,
  Other = 6,
}

/**
 * ## 7.10 VASP Information
 * 
 * Mandatory and optional elements for transmitting information about the VASPs involved in the virtual
asset transfer.
 */
interface VASPInformation {
  /** Name. Legal name */
  name: string;
  /** VASP identity. Ethereum address of VASP contract */
  id: string;
  /** VASP public key. Ethereum public key */
  pk: string;
  /** Postal address */
  address: {
    /** Street name */
    street?: string;
    /** Building number */
    number?: string;
    /** Address line. Alternative to street/number */
    adrline?: string;
    /** Post code */
    postcode: string;
    /** Town name */
    town: string;
    /** Country. ISO 3166-1 alpha-2 code */
    country: string;
  };
  /** Date / place of birth */
  birth?: {
    /** Birth date. ISO 8601 (yyyymmdd) */
    birthdate: string;
    /** City of birth */
    birthcity: string;
    /** Country of birth. ISO 3166-1 alpha-2 code */
    birthcountry: string;
  };
  /** Natural person ID */
  nat?: {
    /** Identification type */
    natid_type: NaturalPersonIdType;
    /** Identifier */
    natid: string;
    /** Issuing country. ISO 3166-1 alpha-2 code */
    natid_country?: string;
    /** Non-state issuer */
    natid_issuer?: string;
  };
  /** Juridical person ID */
  jur?: {
    /** Identification type */
    jurid_type: JuridicalPersonIdType;
    /** Identifier */
    jurid: string;
    /** Issuing country. ISO 3166-1 alpha-2 code */
    jurid_country?: string;
    /** Non-state issuer */
    jurid_issuer?: string;
  };
  /** BIC. ISO 9362 Bank Identifier Code  */
  bic?: string;
}

/**
 * ## 7.11 Originator Information
 * 
 * Mandatory and optional elements for transmitting originator information to be included in message
types 210, 250, 310 and 350.
 */
interface OriginatorInformation {
  /** Name. */
  name: string;
  /** VAAN. Assigned by VASP. Hex(96-bit) */
  vaan: string;
  /** Postal address */
  address: {
    /** Street name */
    street?: string;
    /** Building number */
    number?: string;
    /** Address line. Alternative to street/number */
    adrline?: string;
    /** Post code */
    postcode: string;
    /** Town name */
    town: string;
    /** Country. ISO 3166-1 alpha-2 code */
    country: string;
  };
  /** Date / place of birth */
  birth?: {
    /** Birth date. ISO 8601 (yyyymmdd) */
    birthdate: string;
    /** City of birth */
    birthcity: string;
    /** Country of birth. ISO 3166-1 alpha-2 code */
    birthcountry: string;
  };
  /** Natural person ID */
  nat?: {
    /** Identification type */
    natid_type: NaturalPersonIdType;
    /** Identifier */
    natid: string;
    /** Issuing country. ISO 3166-1 alpha-2 code */
    natid_country?: string;
    /** Non-state issuer */
    natid_issuer?: string;
  };
  /** Juridical person ID */
  jur?: {
    /** Identification type */
    jurid_type: JuridicalPersonIdType;
    /** Identifier */
    jurid: string;
    /** Issuing country. ISO 3166-1 alpha-2 code */
    jurid_country?: string;
    /** Non-state issuer */
    jurid_issuer?: string;
  };
  /** BIC. ISO 9362 Bank Identifier Code  */
  bic?: string;
}

/**
 * ## 7.12 Beneficiary Information
 * 
 * Mandatory and optional elements for transmitting originator data to be included in message types 210,
250, 310 and 350.
 */
interface BeneficiaryInformation {
  /** Name. */
  name: string;
  /** VAAN. Assigned by VASP. Hex(96-bit) */
  vaan: string;
}

class MessageFactory {
  static createSessionRequest(_originatorVASP: PrivateVASP): SessionRequest {
    const msgid = uuidv4().replace("-", ""); //Hex(128bit);
    const session = uuidv4().replace("-", ""); //Hex(128bit);
    const topica = "0x" + uuidv4().substring(0, 8); //Hex(64bit);

    const ecdhpk = "0x"; //
    const sig = "0xfakesig"; //TODO Sign?

    const sessionRequest: SessionRequest = {
      msg: {
        type: MessageType.SessionRequest,
        msgid,
        session,
        code: "1",
      },
      handshake: {
        topica,
        ecdhpk,
      },
      vasp: {
        name: _originatorVASP.name,
        id: _originatorVASP.address,
        pk: _originatorVASP.signingKey,
        address: _originatorVASP.postalAddress,
      },
      sig,
    };
    return sessionRequest;
  }

  static createSessionReply(
    session: string,
    code: SessionReplyCode,
    _beneficiaryVASP: PrivateVASP
  ): SessionReply {
    const msgid = uuidv4().replace("-", ""); //Hex(128bit);
    const topicb = "0x" + uuidv4().substring(0, 8); //Hex(64bit);
    const sig = "0xfakesig"; //TODO Sign?

    const sessionReply: SessionReply = {
      msg: {
        type: MessageType.SessionReply,
        msgid,
        session,
        code,
      },
      handshake: {
        topicb,
      },
      vasp: {
        name: _beneficiaryVASP.name,
        id: _beneficiaryVASP.address,
        pk: _beneficiaryVASP.signingKey,
        address: _beneficiaryVASP.postalAddress,
      },
      sig,
    };

    return sessionReply;
  }
}

export {
  MessageType,
  SessionRequest,
  SessionReply,
  SessionReplyCode,
  TransferRequest,
  TransferReply,
  TransferDispatch,
  TransferConfirmation,
  Termination,
  MessageFactory,
};
