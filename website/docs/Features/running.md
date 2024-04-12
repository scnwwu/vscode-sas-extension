# Running SAS Code

After configuring the SAS extension for your SAS environment, run your SAS program and view the log and results. The connection set up and process is different for SAS Viya and SAS 9. Each is explained in detail below.

## SAS Viya

To run a SAS program connection to a SAS Viya instance:

1. Click the running man icon in the upper right corner of your SAS program window.
2. For a secure connection to SAS Viya we use an authorization code for authentication. Complete these steps to connect.

   2.1. VS Code may prompt you that the extension wants to sign in. Click 'Allow'.

   2.2. VS Code may prompt you about opening an external web site. Click 'Open'.

   2.3. This will take you to a SAS Logon prompt. Log in with your SAS credentials.

   2.4. SAS returns an authorization code. Copy this code.

   2.5. Paste the authorization code in VS Code where indicated at the top of the screen.

3. VS Code connects to SAS and runs the code.

4. The results are displayed in the application. 5. The SAS output log and error information are displayed in the applicaiton.

![runCode2](/images/runCode2.png)

:::info

Your sign in status will persist in VS Code. You can view it and sign out from VS Code's `Accounts` menu.

:::

## SAS 9.4

1. Click the running man icon in the upper right corner of your SAS program window.

2. VS Code connects to SAS and runs the code.

3. The results are displayed in the application.

4. The SAS output log and error information are displayed in the applicaiton.

## Additional notes

To run a piece of SAS code:

- The `Run Selected or All SAS Code` command (`F3`) will automatically run selected code when there's a selection, and run all code when there's no selection.
- When there're multiple selections, The `Run Selected or All SAS Code` command will combine the code from the selections in the order in which they were selected, and then submits the combined code.
- The `Run All SAS Code` command (`F8`) will always run all code regardless of selection.

**Notes**:

- A new session must be created the first time you run SAS code. Connection time will vary depending on the server connection.
- Currently, only HTML output is supported. By default, the ODS HTML5 statement is added to the submitted code. Clear the `Enable/disable ODS HTML5 output` option in the Settings editor for the SAS extension to disable this output.
- When you click `Run`, the code in the active tab in the editor is submitted. Make sure that the correct tab is active when you run your program.
- To reset your connection to SAS, run the `Close Current Session` command in VS Code or click the `Close Session` button from the tooltip of the active profile status bar item.
