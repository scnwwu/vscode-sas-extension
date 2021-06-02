import { initStore } from "@sassoftware/restaf";
import {
  computeSetup,
  computeRun,
  computeResults,
} from "@sassoftware/restaflib";
import { window } from "vscode";
import { getAuthConfig } from "./auth";

const store = initStore();

export async function setup(): Promise<void> {
  const authConfig = await getAuthConfig();
  const msg = await store.logon(authConfig);
  window.showInformationMessage(msg);
  const computeSession = await computeSetup(store, null);
  const computeSummary = await computeRun(
    store,
    computeSession,
    window.activeTextEditor.document.getText(),
    null,
    15,
    2 /*just a place holder values for checking job status */
  );

  const log = await computeResults(store, computeSummary, "log");
  await store.apiCall(computeSession.links("delete"));
  const outputChannel = window.createOutputChannel("SAS Log");
  outputChannel.show();
  outputChannel.appendLine(log.map((line) => line["line"]).join("\n"));
}
