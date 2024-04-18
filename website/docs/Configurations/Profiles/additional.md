# Additional settings in a profile

| Name                     | Supported Connection Types                                                    | Description                                 | Additional Notes                                 |
| ------------------------ | ----------------------------------------------------------------------------- | ------------------------------------------- | ------------------------------------------------ |
| **SAS Options Settings** | SAS Viya, SAS 9.4 (local)\*, SAS 9.4 (remote - IOM)\*, SAS 9.4 (remote - SSH) | SAS options to apply to the SAS session     | \* local startup options currently not supported |
| **AutoExec Settings**    | SAS Viya                                                                      | SAS code to execute once at session startup |                                                  |

## SAS Options Settings

SAS System Options can be set per connection profile. Changes made to SAS Options require closing and reopening the session to take effect. See the following examples below for required formats for supported connection profile types.

- SAS Viya Example:

  ```json
  {
    "profiles": {
      "viya4": {
        "endpoint": "https://example-endpoint.com",
        "connectionType": "rest",
        "sasOptions": ["NONEWS", "ECHOAUTO", "PAGESIZE=MAX"]
      }
    }
  }
  ```

- SAS 9.4 (remote - IOM):

  ```json
  {
    "profiles": {
      "sas9IOM": {
        "host": "host",
        "username": "username",
        "port": 8591,
        "sasOptions": ["NONEWS", "ECHOAUTO", "PAGESIZE=MAX"],
        "ConnectionType": "iom"
      }
    }
  }
  ```

- SAS 9.4 (local):

  ```json
  {
    "profiles": {
      "sas9COM": {
        "host": "localhost",
        "sasOptions": ["NONEWS", "ECHOAUTO", "PAGESIZE=MAX"],
        "ConnectionType": "com"
      }
    }
  }
  ```

- SAS 9 (remote - SSH):

  ```json
  {
    "profiles": {
      "SAS9SSH": {
        "host": "hostname",
        "username": "username",
        "port": 22,
        "sasPath": "/remote/path/to/sas_u8",
        "sasOptions": ["-NONEWS", "-ECHOAUTO", "-PAGESIZE MAX"],
        "connectionType": "ssh"
      }
    }
  }
  ```

## AutoExec Settings

For Viya connection profiles, it's possible to setup AutoExec lines that will execute once per session startup. Changes made to the autoexec require closing and reopening the session to take effect. The AutoExec option supports different modes for how to define the SAS lines that should run:

- Line Mode: embed lines directly into the connection profile JSON. This mode is useful if only a few lines are needed to run on session startup. Note that standard JSON escaping rules apply.

  ```json
  "SAS.connectionProfiles": {
    "activeProfile": "viyaServer",
    "profiles": {
      "viya4": {
        "endpoint": "https://example-endpoint.com",
        "connectionType": "rest",
        "autoExec": [
          {
            "type": "line",
            "line": "ods graphics / imagemap;"
          }
        ]
      }
    }
  }
  ```

- File Mode: specify a path to a file containing autoexec lines to execute. The file must be in a location that is readable by the extension. This mode is useful for complex autoexec scenarios:

  ```json
  "SAS.connectionProfiles": {
    "activeProfile": "viyaServer",
    "profiles": {
      "viya4": {
        "endpoint": "https://example-endpoint.com",
        "connectionType": "rest",
        "autoExec": [
          {
            "type": "file",
            "filePath": "/my/local/autoexec.sas"
          }
        ]
      }
    }
  }
  ```

- Mixed Mode: The autoexec option supports an array of entries, so it is possible to use a combination of both embedded lines and files. The lines will be read in sequential order as they occur in the array itself.

  ```json
  "SAS.connectionProfiles": {
    "activeProfile": "viyaServer",
    "profiles": {
      "viya4": {
        "endpoint": "https://example-endpoint.com",
        "connectionType": "rest",
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
  ```
