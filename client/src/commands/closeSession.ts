import { window } from "vscode";
import { closeSession as computeCloseSession } from "../viya/compute";

export async function closeSession(): Promise<void> {
  await computeCloseSession();
  window.showInformationMessage("Session closed!");
}
