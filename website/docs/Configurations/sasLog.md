# SAS Log

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
