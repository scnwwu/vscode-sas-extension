# SAS Extension for Visual Studio Code

This VS Code extension provides support for the [SAS language](https://www.sas.com), including features such as SAS syntax highlighting, code completion, hover help, code folding, outline, SAS code snippets and run SAS code.

## Features

### SAS Syntax Highlighting

Highlights the following syntax elements:

- Global statements
- SAS procedures
- SAS procedure statements
- Data step definition
- Data step statements
- SAS data sets
- Macro definition
- Macro statements
- Functions
- CALL routins
- Formats and informats
- Macro variables
- SAS colors
- Style elements and style attributes
- Comment
- Various constants
- Options, enumerated option values, sub-options and sub-option values for various procedure definitions and statements

Provides 3 color themes. Select one of them from `Manage > Color Theme` to gain colors for SAS syntax elements.

- SAS Illuminate (light theme)

<img src="doc/images/Illuminate.PNG"/>

- SAS Ignite (dark theme)

<img src="doc/images/Ignite.PNG"/>

- SAS High Contrast

<img src="doc/images/HighContrast.PNG"/>

### Code completion and hover help

Provides code completion and mouse hover help for SAS keywords. The extension can display brief SAS syntax documents when you are editing your SAS code. You can display the help in any of the following ways:

- Move the mouse cursor over a valid SAS keyword in your code.
- Start to type a valid SAS keyboard, and navigate the focus to a suggested keyword in the autocompletion popup list.

Our syntax help will give you a brief description of a keyword. You can get additional help by clicking the links in the syntax help.

In the following example, the panel displays help for the data option in the PROC Print procedure.
Tip: Click the link on the help panel to navigate to the SAS online help.

<img src="doc/images/CodeCompletion.PNG"/>


### Snippets

The extension defines a lot of snippets for SAS functions and procedures to help users input SAS code blocks. You can type the name of a function or procedure directly to show them. The first line in the following screenshot is a snippet.

<img src="doc/images/Snippets.PNG"/>

### Code folding and outline

Provides code folding and outline for data steps, procedures, macro sections and user-defined regions.

<img src="doc/images/Folding.PNG"/>

Tip: Define custom region with `/*region*/` and `/*endregion*/`

### Run SAS code

Submit SAS code to Viya server.

- Before you run SAS code, please go to `Settings > Extensions > SAS` to configure your Viya server, client ID/Secret and user name to login with password.

  - Please contact your SAS administrator for the Client ID and Client Secret. Refers to [Register a New Client ID](https://go.documentation.sas.com/doc/en/sasadmincdc/v_019/calauthmdl/p1gq6q7zzt52win1jwhc2b5kuc1z.htm#n0brttsp1nuzzkn1njvr535txk86).
  - Alternatively you can get access token by your own preferred way and store it in a file. Set the path to the token file in settings, the extension will use it.

- Click the Run<img src="icons/light/submitSASCode.svg"/> icon on the top right on a SAS file.
- Enter password when prompted
- You'll see the SAS log and HTML output if any

<img src="doc/images/RunResult.PNG"/>

- Notes
  - A session will be created the first time you run, which may take some time.
  - Currently only HTML output is supported. By default it will wrap `ods html5` to the code submitted. You can disable it by uncheck `Get ODS HTML5 output` in the settings.
  - The code in "current" editor will be submitted. Please be sure to focus the editor you want before clicking the Run button.
  - You can run `Close current session` command to reset connections if anything goes wrong.
