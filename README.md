# OpenVASP Client

OpenVASP Typescript Library

[![Build Status](https://github.com/notabene-id/openvasp-node-client/workflows/build/badge.svg)](https://github.com/notabene-id/openvasp-node-client/actions)
[![License](https://img.shields.io/github/license/notabene-id/openvasp-node-client.svg?color=blue)](./LICENSE.md)
![npm](https://img.shields.io/npm/v/openvasp-client)
![GitHub last commit](https://img.shields.io/github/last-commit/notabene-id/openvasp-node-client)
[![codecov](https://codecov.io/gh/Notabene-id/openvasp-node-client/branch/master/graph/badge.svg)](https://codecov.io/gh/Notabene-id/openvasp-node-client)

Documentation: https://notabene-id.github.io/openvasp-node-client/

## Getting OpenVASP Client Library

To install:

```
$ npm i --save openvasp-client
```

## Usage

### Create a VASP Contract

A VASPCode with the corresponding VASP contract (to store the handshake and signing keys) needs to be created to use OpenVASP.

To create a VASPCode and Contract:

```javascript
import { VASPFactory, Tools } from "openvasp-client";

//Create a random VASP Code
const vaspCode = Tools.randomVASPCode();

//Initialize VASP Factory
cont vaspFactory = new VASPFactory({
    rpcUrl: process.env.NODE_URL. // "https://rinkeby.infura.io/",
    privateKey: process.env.PRIVATE_KEY, //0x....
    vaspIndexAddress: process.env.VASP_INDEX_ADDRESS //0x....
})

//Create VASP
const ret = vaspFactory.createVASP(vaspCode);

/*
 ret = {
  vaspAddress: "0x...", // Address of deployed VASP contract
  handshakeKeys: { //Handshake Keys
      privateKey: "0x...",
      publicKey : "0x...",
  }
  signingKeys:{ // Signing Keys
      privateKey: "0x...",
      publicKey : "0x...",
  }
 }
 */

```

### Tool

```javascript
import { Tools } from "openvasp-client";

const vaspAddress = "0x36D706A02fE35C64Ba21cF7Ed51695FC8DD00E63";
const vaspCode = Tools.addressToVaspCode(vaspAddress);
```

## Development

Instal dependencies

```
$ npm install
```

Build

```
$ npm run build
```

Test

```
$ npm test
```

To publish to NPM:

```
$ pika publish
```

To publish dosc:

```
$ npm run docs
```

## Contributing

Contributions are welcome!

Want to file a bug, request a feature or contribute some code?

- Check out the [Code of Conduct](./CODE_OF_CONDUCT.md)
- Check that there is no existing [issue](https://github.com/Notabene-id/openvasp-node-client/issues) corresponding to your bug or feature
- Before implementing a new feature, discuss your changes in an issue first!

## License

[MIT](./LICENSE.md) © Notabene
