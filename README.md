# 🦕 Typesaurus Recovery

[Point-in-time recovery](https://firebase.google.com/docs/firestore/pitr) (PITR) adapter for [Typesaurus](https://github.com/kossnocorp/typesaurus), type-safe Firestore ODM.

→ [Read docs](https://typesaurus.com/integrations/recover/)

## Installation

The library is available as an [npm package](https://www.npmjs.com/package/@typesaurus/recovery).
To install Typesaurus, run:

```sh
npm install --save @typesaurus/recovery typesaurus firebase-admin
```

_Note that although Typesaurus PITR has Typesaurus listed as a peer dependency, `firebase-admin` required fot the package to work isn't listed as a dependency, so they won't install automatically with the Typesaurus package._

## Changelog

See [the changelog](./CHANGELOG.md).

## License

[MIT © Sasha Koss](https://kossnocorp.mit-license.org/)
