# OpenVASP Client

OpenVASP Typescript Library

[![Build Status](https://github.com/notabene-id/openvasp-node-client/workflows/build/badge.svg)](https://github.com/notabene-id/openvasp-node-client/actions)
[![License](https://img.shields.io/github/license/notabene-id/openvasp-node-client.svg?color=blue)](./LICENSE.md)
![npm](https://img.shields.io/npm/v/openvasp-client)
![GitHub last commit](https://img.shields.io/github/last-commit/notabene-id/openvasp-node-client)

Documentation: https://notabene-id.github.io/openvasp-node-client/

## Getting OpenVASP Client Library

To install:

```
$ npm i --save openvasp-client
```

## Usage

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
