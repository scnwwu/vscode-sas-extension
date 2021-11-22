// Copyright © 2021, SAS Institute Inc., Cary, NC, USA.  All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0

import {
  OutputChannel,
  ProgressLocation,
  ViewColumn,
  window,
  workspace,
} from "vscode";
import { setup, run as computeRun } from "../viya/compute";

let outputChannel: OutputChannel;

function getCode(outputHtml: boolean): string {
  const code = window.activeTextEditor.document.getText();
  return outputHtml ? "ods html5;\n" + code + "\n;quit;ods html5 close;" : code;
}

async function _run() {
  const outputHtml: boolean = workspace
    .getConfiguration("SAS.session")
    .get("outputHtml");
  const code = getCode(outputHtml);

  await window.withProgress(
    {
      location: ProgressLocation.Notification,
      title: "Connecting to SAS session...",
    },
    setup
  );

  await window.withProgress(
    {
      location: ProgressLocation.Notification,
      title: "SAS code running...",
    },
    () =>
      computeRun(code).then((results) => {
        if (!outputChannel)
          outputChannel = window.createOutputChannel("SAS Log");
        outputChannel.show();
        for (const line of results.log) {
          outputChannel.appendLine(line.line);
        }
        if (outputHtml) {
          const odsResult = window.createWebviewPanel(
            "SASSession", // Identifies the type of the webview. Used internally
            "Result", // Title of the panel displayed to the user
            ViewColumn.Two, // Editor column to show the new webview panel in.
            {} // Webview options. More on these later.
          );
          odsResult.webview.html = results.ods;
        }
      })
  );
}

export function run(): void {
  _run().catch((err) => {
    window.showErrorMessage(
      (err.get ? err.get("detail") : err.detail ?? err).toString()
    );
  });
}
