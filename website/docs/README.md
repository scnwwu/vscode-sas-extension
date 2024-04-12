# SAS Extension for Visual Studio Code

Welcome to the SAS Extension for Visual Studio Code! This extension provides support for the [SAS language](https://go.documentation.sas.com/doc/en/pgmsascdc/9.4_3.5/lrcon/titlepage.htm), including the following features:

## Installation

Install latest VS Code (version 1.82 at minimum). To install the SAS extension, open the Extensions view by clicking the Extensions icon in the Activity Bar on the left side of the Visual Studio Code window. Search for the 'Official' SAS extension, and click the Install button. Once the installation is complete, the Install button changes to the Manage button.

## Features

### Configuring the SAS Extension

Before running SAS code, you must configure the SAS extension to access a SAS 9.4 (remote or local) or Viya server. You must license SAS 9.4 or Viya to run SAS code.

1. When first configuring, open up a file with the SAS language. "No Profile" can be located on the Status Bar located at the bottom left of your VSCode window

   ![No Active Profiles Found](/images/NoActiveProfilesStatusBar.png)

2. Either select the "No Profile" Status Bar Item or open the command palette (`F1`, or `Ctrl+Shift+P` on Windows or Linux, or `Shift+CMD+P` on OSX) and locate `SAS: Add New Connection Profile`
3. Please refer to the [Add SAS Connection Profile](#add-new-sas-profile) section below to add a profile
4. After a profile is created, the Status Bar Item will be changed from "No Profile" to the name of the new profile.

   ![Status Bar Profile](/images/StatusBarProfileItem.png)

5. If you do not want to generate results in HTML format, clear the `Enable/disable ODS HTML5 output` setting. This option is enabled by default.

### Running SAS Code

After configuring the SAS extension for your SAS environment, run your SAS program and view the log and results.

Details on running code is available on the [Connect and Run page](connect-and-run.md).

### SAS Log

Its possible to customize when the SAS log gets shown in the bottom panel by using the following extension settings. These settings will apply to all connection profiles:
| Name | Description | Additional Notes |
| ---------------------------------| --------------------------------------- | ----------------------------- |
| **SAS.log.showOnExecutionStart** | Show SAS log on start of execution | default: true |
| **SAS.log.showOnExecutionFinish**| Show SAS log on end of execution | default: true |

Example

```json title="settings.json"
{
  "SAS.log.showOnExecutionFinish": true,
  "SAS.log.showOnExecutionStart": false,
  "SAS.connectionProfiles": {
    "activeProfile": "viyaServer",
    "profiles": {
      "viya4": {
        "endpoint": "https://example-endpoint.com",
        "connectionType": "rest",
        "sasOptions": ["NONEWS", "ECHOAUTO"],
        "autoExec": [
          {
            "type": "line",
            "line": "ods graphics / imagemap;"
          },
          {
            "type": "file",
            "filePath": "/my/local/autoexec.sas"
          }
        ]
      }
    }
  }
}
```
