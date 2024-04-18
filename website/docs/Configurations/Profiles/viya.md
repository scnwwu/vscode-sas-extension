---
sidebar_position: 1
---

# Profile: SAS Viya

## Profile Anatomy

The parameters listed below make up the profile settings for configuring a connection to SAS Viya.

| Name                | Description                           | Additional Notes                                                                                                                                      |
| ------------------- | ------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------- |
| **Name**            | Name of the profile                   | This will display on the status bar                                                                                                                   |
| **Endpoint**        | Viya endpoint                         | This will appear when hovering over the status bar                                                                                                    |
| **Compute Context** | Context for Compute Server            | Please see [SAS Documentation](https://go.documentation.sas.com/doc/en/sasadmincdc/v_014/evfun/p1dkdadd9rkbmdn1fpv562l2p5vy.htm) for more information |
| **Client ID**       | Registered Client ID for SAS Viya     | Please see your SAS administrator. `authorization_code` and `refresh_token` grant types are required.<br /> _Leave empty for Viya4 2022.11 and later_ |
| **Client Secret**   | Registered Client Secret for SAS Viya | Please see your SAS administrator.<br /> _Leave empty for Viya4 2022.11 and later_                                                                    |

## Add New SAS Viya Profile

Open the command palette (`F1`, or `Ctrl+Shift+P` on Windows or Linux, or `Shift+CMD+P` on OSX). After executing the `SAS.addProfile` command, select the SAS Viya connection type and complete the prompts (with info from the preceeding table) to create a new profile. For SAS Viya Connections, depending on your SAS version, the values for the prompts differ slightly.

- For SAS Viya 2022.11 and later, you can leave Client ID and Client Secret prompts empty and simply press Enter. (The built-in Client ID `vscode` will be used.)
- For SAS Viya 2022.10 and before (including SAS Viya 3.5), you need to provide a Client ID and secret.

For more information about Client IDs and the authentication process, please see the blog post [Authentication to SAS Viya: a couple of approaches](https://blogs.sas.com/content/sgf/2021/09/24/authentication-to-sas-viya/). A SAS administrator can follow the Steps 1 and 2 in the post to register a new client.
