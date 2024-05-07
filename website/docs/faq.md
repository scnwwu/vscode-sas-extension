# Frequently Asked Questions

## Usage questions

### I don't see correct syntax colors on SAS code

Select `File > Preferences > Color Theme` and select a SAS provided theme.

### I don't see error/note colors on SAS log

Select `File > Preferences > Color Theme` and select a SAS provided theme.

### Is there a way to change the default shortcuts to run SAS code?

To manage shortcuts in VS Code, Click the "Manage" button from the left bottom and select `Keyboard Shortcuts`. Type "run sas" or so to filter and you'll see `SAS: Run Selected or All SAS code` command and you can define shortcuts to it.

### The autocomplete pops up too aggressively

To prevent the autocomplete from popping up on pressing spacebar, uncheck the "Suggest On Trigger Characters" option in settings. Then the autocomplete will only show when you type matched text or press Ctrl+spacebar.

Set the "Accept Suggestion On Enter" option to false in settings. Then only Tab key will commit suggestions.

Also note that all settings can be set specific to sas to not impact other languages.
Refers to https://code.visualstudio.com/docs/getstarted/settings#_language-specific-editor-settings

### I can't see word-based suggestions after enabling this extension

VS Code provides a default autocomplete that suggests existing words gathered in opened documents when there's no other autocomplete provider. But when an extension provided some autocomplete items, the default autocomplete will not show up. It's not specific to SAS. Refers to https://github.com/microsoft/vscode/issues/21611

### It took so long to run at first time

A new session must be created the first time you run SAS code. Connection time will vary depending on the server connection. Subsequent runs within the session should be quicker.

## Connection issues

### How to get client ID/Secret?

SAS administrator can refers to this [documentation](https://go.documentation.sas.com/doc/en/sasadmincdc/v_022/calauthmdl/n1iyx40th7exrqn1ej8t12gfhm88.htm#n0brttsp1nuzzkn1njvr535txk86) for how to generate client IDs.

The client ID needs `authorization_code` grant type. If you want it to automatically refresh access token, it also need `refresh_token` grant type.

### I got `unable to verify the first certificate` or `self-signed certificate in certificate chain` error when run

You'll have to manually trust your server's certificate, with below steps:

1. Get your server's certificate file

   1.1. Access your Viya endpoint with Google Chrome or Microsoft Edge

   1.2. Click the "lock" icon on the left of the URL on the address bar. It will popup a panel.

   1.3. Click "Connection is secure", then click "Certificate is valid". It will open Certificate Viewer.

   1.4. Click "Details", then click "Export". Select "Base64-encoded ASCII, certificate chain" and save it to a file.

2. For Mac OS, you can install the certificate file into your Keychain Access and trust the certificate. For other Operating Systems or if you don't want to add the certificate to your system, open VS Code Settings > `SAS: User Provided Certificates`. Add full path of the certificate file to it.

3. Restart VS Code.

If it doesn't work, here's a workaround:

1. Set environment variable [NODE_TLS_REJECT_UNAUTHORIZED](https://nodejs.org/api/cli.html#node_tls_reject_unauthorizedvalue) to 0 (This will bypass the certificate check).
2. Shut down all VS Code instances and restart to pick up the environment variable. If you're connecting to a remote workspace, please set the environment variable on the remote system and kill all vscode server processes (for example, run `ps -aux | grep vscode-server` on the remote Linux to see the processes).

### I got `Invalid endpoint` error

Please specify the correct protocol. For example, if your Viya server is on https, make sure you included `https://` in your `endpoint` setting.

### I got `Unable to parse decrypted password` error

- For Windows, open `Control Panel\All Control Panel Items\Credential Manager`, click `Windows Credentials`, find items start with `vscodesas`, click `Remove`.

- For Mac OS, open `Keychain Access`, select `login` keychain, select `Passwords`, find items start with `vscodesas`, open context menu and select `Delete`.

Then restart VS Code

### I got `See console log for more details` error. Where to see the console log?

Click `Help > Toggle Developer Tools` from the top menu bar.

### I keep getting blank errors

Please try restart your VS Code.
