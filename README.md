# SAS Language Server for VSCode

A VS Code extension with rich support for the [SAS language](https://www.sas.com/), including features such as syntax highlighting, code completion, hover help, and run sas code.

## Features

### SAS Syntax Highlighting

It provides 3 color themes. Select one of them from `Manage > Color Theme` to gain colors for SAS syntax elements.

- SAS Illuminate (light theme)

<img src="doc/images/Illuminate.PNG"/>

- SAS Ignite (dark theme)

<img src="doc/images/Ignite.PNG"/>

- SAS High Contrast

<img src="doc/images/HighContrast.PNG"/>

### Code completion and hover help

Provides code completion and mouse hover help for SAS keywords.

<img src="doc/images/CodeCompletion.PNG"/>

Tip: Click the link on the help panel to navigate to the documentation.

### Code folding and outline

Provides code folding and outline for data steps, procedures, macro sections and user-defined regions.

<img src="doc/images/Folding.PNG"/>

Tip: Define custom region with `/*region*/` and `/*endregion*/`

### Run SAS code

Submit SAS code to Viya server.

- Before you can run, please go to `Settings > Extensions > SAS` to configure your Viya server, Client ID/Secret and user name to login with password.

  - Please contact your SAS administrator for the Client ID and Client Secret. Refers to [Register a New Client ID](https://go.documentation.sas.com/doc/en/sasadmincdc/v_019/calauthmdl/p1gq6q7zzt52win1jwhc2b5kuc1z.htm#n0brttsp1nuzzkn1njvr535txk86).
  - Alternatively you can get access token by your own preferred way and store it in a file. Set the path to the token file in settings, the extension will use it.

- Click the Run<img src="icons/light/submitSASCode.svg"/> icon on the top right on a SAS file.
- Enter password when prompted
- You'll see SAS log when done and HTML output if any

<img src="doc/images/RunResult.PNG"/>

- Notes
  - A session will be created the first time you run, which may take some time.
  - Currently only HTML output is supported to show. By default it will wrap `ods html5` to the code submitted. You can disable it by uncheck `Get ODS HTML5 output` in settings.
  - The code in "current" editor will be submitted. Please be sure to focus the editor you want before click the Run button.
  - You can run `Close current session` command to reset connection if anything wrong.
