// Copyright © 2024, SAS Institute Inc., Cary, NC, USA.  All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0
import { commands } from "vscode";

import { ITCSession } from ".";
import { getSession } from "..";
import { useRunStore } from "../../store";

let wait: Promise<string> | undefined;

export async function query(code: string): Promise<string> {
  const task = () => _query(code);

  wait = wait ? wait.then(task) : task();
  return wait;
}

async function _query(code: string): Promise<string> {
  // If we're already executing code, lets wait for it
  // to finish up.
  let unsubscribe;
  if (useRunStore.getState().isExecutingCode) {
    await new Promise((resolve) => {
      unsubscribe = useRunStore.subscribe(
        (state) => state.isExecutingCode,
        (isExecutingCode) => !isExecutingCode && resolve(true),
      );
    });
  }

  const { setIsExecutingCode } = useRunStore.getState();
  setIsExecutingCode(true);
  commands.executeCommand("setContext", "SAS.running", true);
  const session = getSession();

  try {
    await session.setup(true);

    // eslint-disable-next-line @typescript-eslint/consistent-type-assertions
    return await (session as ITCSession).query(code);
  } finally {
    unsubscribe && unsubscribe();

    setIsExecutingCode(false);
    commands.executeCommand("setContext", "SAS.running", false);
  }
}
