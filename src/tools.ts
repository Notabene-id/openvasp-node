export default class Tools {
  /**
   * Converts VASP Smart Contract addres to code.
   *
   * @param _address  VASP Smart Contract address to be converted.
   * @returns VASP Code corresponding to the address
   *
   */
  addressToVaspCode(_address: string): string {
    // TODO: Check address
    return _address.substring(34).toLowerCase();
  }
}
