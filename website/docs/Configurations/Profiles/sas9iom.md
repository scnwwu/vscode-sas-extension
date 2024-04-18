---
sidebar_position: 3
---

# Profile: SAS 9.4 (remote - IOM)

In order to use this connection type, you'll need to have SAS Integration Technologies Client (ITCLIENT) installed on the client machine (the machine VS Code is installed on).

You can check the SASHOME location on your client machine to see if you already have ITCLIENT installed. For example, ITCLIENT is normally installed in the default path "C:\Program Files\SASHome\x86\Integration Technologies". If that path exists on your machine, you have ITCLIENT. ITCLIENT is automatically installed with some SAS software, such as SAS Enterprise Guide and SAS Add-in for Microsoft Office, so if you have one of those on your machine, you likely already have ITCLIENT as well.

If you do not already have ITCLIENT installed on the client machine, you can install it by running your SAS 9.4 installer and making sure "Integration Technologies Client" is checked, or by visiting the following [link](https://support.sas.com/downloads/browse.htm?fil=&cat=56) to download and install it on the client machine. See the note below for guidance on which version to download and install.

**Note**: If you have no existing SAS software on the client machine, download and install the latest (currently 9.4M8) version of ITCLIENT from the link above. If you have SAS software already installed on the client machine, make sure to download and install the matching version of ITCLIENT. For example, if you already have 9.4M6 SAS software on the client machine (a 9.4M6 SASHOME), download and install the 9.4M6 version of ITCLIENT from the link above.

ITCLIENT is backwards compatible, so any version of ITCLIENT will allow you to connect to the same or earlier version V9 SAS server. For example, if you have 9.4M8 ITCLIENT, you will be able to connect to 9.4M8, 9.4M7, 9.4M6, or earlier 9.4 servers. If you have 9.4M7 ITCLIENT, you will be able to connect to 9.4M7, 9.4M6, or earlier 9.4 servers.

## Profile Anatomy

The parameters listed below make up the profile settings for configuring a connection to a remote SAS 9.4 instance.

| Name         | Description         | Additional Notes                                                     |
| ------------ | ------------------- | -------------------------------------------------------------------- |
| **Name**     | Name of the profile | This will display on the status bar                                  |
| **Host**     | IOM Server Host     | This will appear when hovering over the status bar                   |
| **Username** | IOM Server Username | A username to use when establishing the IOM connection to the server |
| **Port**     | IOM Server Port     | The port of the IOM server. Default value is 8591                    |

## Add New SAS 9.4 (remote - IOM) Profile

Open the command palette (`F1`, or `Ctrl+Shift+P` on Windows). After executing the `SAS.addProfile` command, select the SAS 9.4 (remote - IOM) connection type to create a new profile.
