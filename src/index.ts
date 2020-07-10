import Tools from "./tools";
import VASPContract from "./vasp_contract";
import WhisperTransport from "./whisper";
import { OpenVASP } from "./openvasp";
import VASPIndexContract from "./vasp_index_contract";
import {
  MessageType,
  TransferReplyCode,
  TransferConfirmationCode,
} from "./messages";
import VASPFactory from "./vasp_factory";

export interface VASP {
  address: string;
  code: string;
  owner: string;
  name: string;
  channels: Array<string>;
  handshakeKey: string;
  signingKey: string;
  postalAddress: {
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
}

export interface PrivateVASP extends VASP {
  handshakeKeyPrivate: string;
  signingKeyPrivate: string;
}

export interface CallbackFunction {
  (error: null | Error, message?: string): void | Promise<void>;
}

export {
  Tools,
  VASPContract,
  VASPIndexContract,
  VASPFactory,
  WhisperTransport,
  OpenVASP,
  MessageType,
  TransferReplyCode,
  TransferConfirmationCode,
};
