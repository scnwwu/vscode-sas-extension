# SAS Extension for Visual Studio Code

Welcome to the SAS extension for Visual Studio Code! This extension provides support for the [SAS language](https://go.documentation.sas.com/doc/en/pgmsascdc/9.4_3.5/lrcon/titlepage.htm), including the following features:
- SAS Syntax highlighting
- Color themes
- Code completion
- Pop-up syntax help
- Snippets
- Code folding 
- Code outline
- The ability to run SAS code



## Features

### SAS Syntax Highlighting

The SAS Extension highlights these syntax elements in your program:
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


### Color Themes
You can choose from among different color themes that control the color of the application and syntax elements.

To specify the color theme:

- Select File > Preferences > Color Theme and select the theme that you want to use.  The SAS Extension includes three color themes:  SAS Illuminate, SAS Ignite, and SAS High Contrast.

Provides 3 color themes that control the coloring for the SAS syntax elements. To choose a color theme, select one of them from `Manage > Color Theme`

- SAS Illuminate (light theme)

<img src="doc/images/Illuminate.PNG"/>

- SAS Ignite (dark theme)

<img src="doc/images/Ignite.PNG"/>

- SAS High Contrast

<img src="doc/images/HighContrast.PNG"/>

### Code completion

The SAS Extension includes automatic code completion and pop-up syntax help for SAS keywords.  The autocomplete, or code completion, feature in the code editor can predict the next word that you want to enter in your SAS program before you actually enter it completely.
 
To use the autocomplete feature: 
- Start to type a valid SAS keyboard. Scroll through the pop-up list of suggested keywords by using your mouse or the up and down arrow keys.  

### Pop-up Syntax Help
The syntax help can get you started with a hint about the syntax or a brief description of the keyword. You can get additional help by clicking the links in the syntax help window.

To view the syntax help:
- Move the mouse pointer over a valid SAS keyword in the code. 

In the following example, the help panel displays syntax help for the DATA= option in the PROC PRINT statement. 
_Tip_: Click the links in the syntax help window to navigate to the SAS online help. 

<img src="doc/images/CodeCompletion.PNG"/>

### Snippets

Snippets are lines of commonly used code or text that you can insert into your program. The SAS Extension includes a large number of snippets for SAS functions and procedures to help you write SAS programs more quickly. 

To access the list of snippets for a function or procedure:
- Type the name of a function or procedure in your SAS program.  This example shows a snippet for the PROC ACCESS statement. 
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

## Contributing

We welcome your contributions! Please read [CONTRIBUTING.md](CONTRIBUTING.md) for details on how to submit contributions to this project.

## License

This project is licensed under the [Apache 2.0 License](LICENSE).
