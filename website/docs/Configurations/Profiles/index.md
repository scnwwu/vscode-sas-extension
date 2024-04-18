# Profiles

Profiles are easy ways to switch between multiple SAS deployments. For SAS Viya connections, multiple Viya profiles are used to switch between compute contexts. There is no limit to the number of stored profiles.

You configure the profiles in VS Code and they will be stored in the VS Code settings.json file. The profile settings can be modified by hand, if needed.

The following commands are supported for profiles:

| Command             | Title                                  |
| ------------------- | -------------------------------------- |
| `SAS.addProfile`    | SAS: Add New Connection Profile        |
| `SAS.switchProfile` | SAS: Switch Current Connection profile |
| `SAS.updateProfile` | SAS: Update Connection profile         |
| `SAS.deleteProfile` | SAS: Delete Connection profile         |

## Delete Connection Profile

After executing the `SAS.deleteProfile` command:

1. Select profile to delete from the list of profiles

2. A notification message will pop up on successful deletion

## Switch Current Connection Profile

After executing the `SAS.switchProfile` command:

1. If no profiles can be found, the extension will ask to [create a new profile](#add-new-sas-profile)

2. Select profile to set active from the list of profiles

3. The StatusBar Item will update to display the name of the selected profile

## Update Connection Profile

Update profile gives the ability to modify existing profiles, including updating from password to token flow and vice versa.

After executing the `SAS.updateProfile` command:

1. Select profile to update from the list of profiles

2. Complete the prompts to update profile

To update the name of a profile, please delete and recreate it.
