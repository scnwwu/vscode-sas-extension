# How to Contribute

We'd love to accept your patches and contributions to this project. There are
just a few small guidelines you need to follow.

## Contributor License Agreement

Contributions to this project must be accompanied by a signed
[Contributor Agreement](ContributorAgreement.txt).
You (or your employer) retain the copyright to your contribution,
this simply gives us permission to use and redistribute your contributions as
part of the project.

## Code reviews

All submissions, including submissions by project members, require review. We
use GitHub pull requests for this purpose. Consult
[GitHub Help](https://help.github.com/articles/about-pull-requests/) for more
information on using pull requests.

Please make sure your submission passed the `lint` and `test` tasks clean.

# Development

## Structure

```
.
├── client // Language Client
│   ├── src
|   |   └── browser
│   │   |   └── extension.ts // Language Client entry point for browser
|   |   └── node
│   │       └── extension.ts // Language Client entry point for electron
├── package.json // The extension manifest.
└── server // Language Server
    └── src
        └── browser
        |   └── server.ts // Language Server entry point for browser
        └── node
            └── server.ts // Language Server entry point for electron
```

## Get start

- Run `npm install` in this folder. This installs all necessary npm modules in both the client and server folder
- Open VS Code on this folder.
- Press Ctrl+Shift+B to compile the client and server.
- Switch to the Debug viewlet.
- Select `Launch Client` from the drop down.
- Run the launch config.
- If you want to debug the server as well use the launch configuration `Attach to Server`
- In the [Extension Development Host] instance of VSCode, open a SAS file.
