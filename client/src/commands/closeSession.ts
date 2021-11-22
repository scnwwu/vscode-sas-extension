// Copyright © 2021, SAS Institute Inc., Cary, NC, USA.  All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0

import { window } from "vscode";
import { closeSession as computeCloseSession } from "../viya/compute";

export async function closeSession(): Promise<void> {
  await computeCloseSession();
  window.showInformationMessage("Session closed!");
}
