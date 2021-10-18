# SAS Language Server for VSCode

## Features

### SAS Syntax Highlighting

It provides 3 color themes.

- SAS Illuminate (light theme)
  <img src="doc/images/Illuminate.PNG"/>
- SAS Ignite (dark theme)
  <img src="doc/images/Ignite.PNG"/>
- SAS High Contrast
  <img src="doc/images/HighContrast.PNG"/>

### Code completion and hover help

<img src="doc/images/CodeCompletion.PNG"/>

Tip: Click the link on the help panel to navigate to the documentation.

### Code folding and outline

<img src="doc/images/Folding.PNG"/>

Tip: Define custom region with `/*region*/` and `/*endregion*/`

### Run SAS code

- Before you can run, please go to `Settings > Extensions > SAS` to configure your Viya server, Client ID/Secret, User name or token file.
- Click the Run<img src="icons/light/submitSASCode.svg"/> icon on the top right on a SAS file.
- Enter password when prompted
- You'll see SAS log when done and HTML output if any
  <img src="doc/images/RunResult.PNG"/>

## Structure

```
.
├── client // Language Client
│   ├── src
│   │   └── extension.ts // Language Client entry point
├── package.json // The extension manifest.
└── server // Language Server
    └── src
        └── server.ts // Language Server entry point
```

## Development

- Run `npm install` in this folder. This installs all necessary npm modules in both the client and server folder
- Open VS Code on this folder.
- Press Ctrl+Shift+B to compile the client and server.
- Switch to the Debug viewlet.
- Select `Launch Client` from the drop down.
- Run the launch config.
- If you want to debug the server as well use the launch configuration `Attach to Server`
- In the [Extension Development Host] instance of VSCode, open a SAS file.
