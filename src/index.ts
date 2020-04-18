import Tools from "./tools";
import VASPContract from "./vasp_contract";
import WhisperTransport from "./whisper";

export interface VASP {
  code: string;
  owner: string;
  name: string;
  channels: Array<string>;
  handshakeKey: string;
  signingKey: string;
}

export interface PrivateVASP extends VASP {
  handshakeKeyPrivate: string;
}

export { Tools, VASPContract, WhisperTransport };
