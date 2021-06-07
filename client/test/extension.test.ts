import * as assert from "assert";
import * as vscode from "vscode";
import { getUri, openDoc } from "./utils";

let docUri;

describe("basic", () => {
  beforeEach(async () => {
    docUri = getUri("SampleCode.sas");
    await openDoc(docUri);
  });

  it("provides completion items", async () => {
    // Executing the command `vscode.executeCompletionItemProvider` to simulate triggering completion
    const actualCompletionList = (await vscode.commands.executeCommand(
      "vscode.executeCompletionItemProvider",
      docUri,
      new vscode.Position(0, 0)
    )) as vscode.CompletionList;
    assert.ok(actualCompletionList.items.length > 0);
  });
});
