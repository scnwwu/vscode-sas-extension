import { readFile } from "fs";
import { window, workspace } from "vscode";

export type AuthConfig =
  | {
      authType: "server";
      host: string;
      token: string;
      tokenType: "bearer";
    }
  | {
      authType: "password";
      host: string;
      clientID: string;
      clientSecret: string;
      user: string;
      password: string;
    };

export function getAuthConfig(): Promise<AuthConfig> {
  return new Promise((resolve, reject) => {
    function error(msg: string) {
      window.showErrorMessage(msg);
      reject();
    }

    const config = workspace.getConfiguration("SAS.server");
    const host: string = config.get("host");
    if (host === "") {
      error("SAS server host in Settings is required.");
      return;
    }

    const tokenPath: string = config.get("tokenPath");
    if (tokenPath.length > 0) {
      readFile(tokenPath, (err, data) => {
        if (err && err.message) {
          error(err.message);
          return;
        }
        resolve({
          authType: "server",
          host,
          token: data.toString(),
          tokenType: "bearer",
        });
      });
      return;
    }

    // no token file found. Go with password flow
    const user: string = config.get("user");
    const clientID: string = config.get("clientId");
    const clientSecret: string = config.get("clientSecret");
    if (user === "" || clientID === "") {
      error(
        "Either token path, or user and client ID/Secret needed for authentication."
      );
      return;
    }
    window
      .showInputBox({
        placeHolder: `password for ${user}`,
        password: true,
      })
      .then((password) =>
        resolve({
          authType: "password",
          host,
          clientID,
          clientSecret,
          user,
          password,
        })
      );
  });
}
