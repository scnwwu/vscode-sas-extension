# SAS Extension for Visual Studio Code

This VS Code extension provides support for the [SAS language](https://go.documentation.sas.com/doc/en/pgmsascdc/9.4_3.5/lrcon/titlepage.htm), including features such as SAS syntax highlighting, code completion, hover help, code folding, outline, SAS code snippets and run SAS code.

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
- CALL routines
- Formats and informats
- Macro variables
- SAS colors
- Style elements and style attributes
- Comment
- Various constants
- Options, enumerated option values, sub-options and sub-option values for various procedure definitions and statements

### Theme
Provides 3 color themes that control the coloring for the SAS syntax elements.  To choose a color theme, select one of them from `Manage > Color Theme` 

- SAS Illuminate (light theme)

<img src="doc/images/Illuminate.PNG"/>

- SAS Ignite (dark theme)

<img src="doc/images/Ignite.PNG"/>

- SAS High Contrast

<img src="doc/images/HighContrast.PNG"/>

### Code completion and hover help

Provides code completion and mouse hover help for SAS keywords. The extension can display brief SAS syntax documents when editing SAS code. The help can be displayed in any of the following ways:

- Move the mouse cursor over a valid SAS keyword in the code.
- Start to type a valid SAS keyboard, and navigate the focus via the up/down arrows to a keyword in the autocompletion popup list.

Syntax help will display a brief description of a keyword.  Additional help can be obtained by clicking the links in the syntax help.
 
In the following example, the panel displays help for the data option in the PROC Print procedure.
_Tip_: Click the link on the help panel to navigate to the SAS online help.

<img src="doc/images/CodeCompletion.PNG"/>


### Snippets
A snippet is a one or more defined words that are recognized by the extension and then replaced with a block of text.  The extension defines a large number of built in snippets for SAS functions and procedures to help users quickly input SAS code blocks.

The extension defines a large number of snippets for SAS functions and procedures to help users input SAS code blocks. Type the name of a function or procedure directly to show them. The first line in the following screenshot is a snippet.

<img src="doc/images/Snippets.PNG"/>

### Code folding and outline

Provides code folding and outline for data steps, procedures, macro sections and user-defined regions.

<img src="doc/images/Folding.PNG"/>

_Tip_: Define custom region with `/*region*/` and `/*endregion*/`

### Run SAS code

Submit SAS code to Viya server. (A licensed Viya 4 system is needed to run SAS Code.)

- Before running SAS code, go to `Settings > Extensions > SAS` to configure the Viya server, client ID/Secret and User name. Currently, only Viya 4 servers are supported.

  - Please contact your SAS administrator for the Client ID and Client Secret. [Register a New Client ID](https://go.documentation.sas.com/doc/en/sasadmincdc/v_019/calauthmdl/p1gq6q7zzt52win1jwhc2b5kuc1z.htm#n0brttsp1nuzzkn1njvr535txk86).
  - Alternatively the access token can be stored in a file. Set the path to the token file in the settings, the extension will use it.

- Click the Run<img src="icons/light/submitSASCode.svg"/> icon on the top right on a SAS file.
- Enter password when prompted.
- The SAS log and HTML output will be displayed if there is any.

<img src="doc/images/RunResult.PNG"/>

- Notes
  - A session will be created the first time when running SAS code, which may take 10-60 seconds based on the server connections.
  - Currently only HTML output is supported. By default it will wrap `ods html5` to the code submitted. Can disable it by unchecking `Get ODS HTML5 output` in the settings.
  - The code in the "current" editor will be submitted. Please make sure to focus on the code tab before clicking the `Run` button.
  - User can run `Close current session` command to reset the connections if anything goes wrong.
