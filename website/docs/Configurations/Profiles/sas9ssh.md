---
sidebar_position: 4
---

# Profile: SAS 9.4 (remote - SSH)

For a secure connection to SAS 9.4 remote server, a public / private ssh key pair is required. The socket defined in the environment variable `SSH_AUTH_SOCK` is used to communicate with ssh-agent to authenticate the ssh session. The private key must be registered with the ssh-agent. The steps for configuring ssh follow.

## Profile Anatomy

The parameters listed below make up the profile settings for configuring a connection to a remote SAS 9.4 instance.

| Name         | Description                          | Additional Notes                                                     |
| ------------ | ------------------------------------ | -------------------------------------------------------------------- |
| **Name**     | Name of the profile                  | This will display on the status bar                                  |
| **Host**     | SSH Server Host                      | This will appear when hovering over the status bar                   |
| **Username** | SSH Server Username                  | A username to use when establishing the SSH connection to the server |
| **Port**     | SSH Server Port                      | The ssh port of the SSH server. Default value is 22                  |
| **SAS Path** | Path to SAS Executable on the server | Must be a fully qualified path on the SSH server to a SAS executable |

## Add New SAS 9.4 (remote - SSH) Profile

Open the command palette (`F1`, or `Ctrl+Shift+P` on Windows or Linux, or `Shift+CMD+P` on OSX). After executing the `SAS.addProfile` command, select the SAS 9.4 (remote - SSH) connection type and complete the prompts (using values from the preceeding table) to create a new profile.

## Required setup for connection to SAS 9.4 (remote - SSH)

In order to configure the connection between VS Code and SAS 9, you must configure OpenSSH. Follow the steps below to complete the setup.

### Windows

1. Enable openssh client optional feature; [instructions found here](https://learn.microsoft.com/en-us/windows-server/administration/openssh/openssh_install_firstuse?tabs=gui).

2. [Create an environment variable](https://phoenixnap.com/kb/windows-set-environment-variable) SSH_AUTH_SOCK with value //./pipe/openssh-ssh-agent (windows uses a named pipe for the auth sock).
   **Note**: An attempt to create the varible using Powershell command line did not register; suggest using these GUI instructions.

3. Ensure ssh-agent service is running and set startup type to automatic; commands found in [this link](https://dev.to/aka_anoop/how-to-enable-openssh-agent-to-access-your-github-repositories-on-windows-powershell-1ab8)

4. [Generate ed25519 keys](https://medium.com/risan/upgrade-your-ssh-key-to-ed25519-c6e8d60d3c54) with the following command (email address is not binding; use any):

```sh
ssh-keygen -o -a 100 -t ed25519 -f ~/.ssh/id_ed25519 -C "youremail@company.com"
```

5. You’ll be asked a series of questions. First, if you didn not provide a path, a default one is provided. Also, if you wish to add a passphrase enter it. Pressing the ‘Enter’ key for each question accepts the default key name and does not password protect your key.

   - Enter a file in which to save the key (/c/Users/you/.ssh/id_ed25519):[Press enter]
   - Enter passphrase (empty for no passphrase): [Type a passphrase]
   - Enter same passphrase again: [Type passphrase again]

6. Define an entry in ~/.ssh/config of the form:

```
Host host.machine.name
    AddKeysToAgent yes
    IdentityFile /path/to/private/key/with/passphrase
```

Note: if ~/.ssh/config does not exist, run the following Powershell command to create it: `Out-File -FilePath config`

7. Add the private key to ssh-agent: ssh-add /path/to/private/key/with/passphrase

8. In VS Code, define a connection profile (see detailed instructions below in the [Add New SAS 9.4 (remote - SSH) Profile](#add-new-sas-94-remote---ssh-profile) section). The connection for the remote server is stored in the settings.json file.

```json
"ssh_test": {
    "connectionType": "ssh",
    "host": "host.machine.name",
    "saspath": "/path/to/sas/executable",
    "username": "username",
    "port": 22
}
```

Note: the default path to the SAS executable (saspath) is /opt/sasinside/SASHome/SASFoundation/9.4/bin/sas_u8. Check with your SAS administrator for the exact path.

9. Add the public part of the keypair to the SAS server. Add the contents of the key file to the ~/.ssh/authorized_keys file.

### Mac

1. Start ssh-agent in the background:

```sh
eval "$(ssh-agent -s)"
```

2. Ensure that SSH_AUTH_SOCK has a value

```sh
echo $SSH_AUTH_SOCK
```

3. Define an entry in $HOME/.ssh/config of the form:

```
Host host.machine.name
  AddKeysToAgent yes
  UseKeychain yes
  IdentityFile /path/to/private/key/with/passphrase
```

4. Add the private key to ssh-agent: ssh-add /path/to/private/key/with/passphrase

5. Define a connection profile in settings.json for a remote server (see detailed instructions below in the [Add New SAS 9.4 (remote - SSH) Profile](#add-new-sas-94-remote---ssh-profile) section):

```json
"ssh_test": {
    "connectionType": "ssh",
    "host": "host.machine.name",
    "saspath": "/path/to/sas/executable",
    "username": "username",
    "port": 22
}
```

6. Add the public part of the keypair to the SAS server. Add the contents of the key file to the ~/.ssh/authorized_keys file.
