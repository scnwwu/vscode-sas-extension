import { initStore } from "@sassoftware/restaf";
import {
  computeSetup,
  computeRun,
  computeResults,
} from "@sassoftware/restaflib";
import { getAuthConfig } from "./auth";

const store = initStore();

let authConfig, computeSession;

export interface LogLine {
  type: string;
  line: string;
}

export interface Results {
  log: LogLine[];
  ods: string;
}

export async function setup(): Promise<void> {
  if (!authConfig) {
    authConfig = await getAuthConfig();
  }
  if (!computeSession) {
    computeSession = await computeSetup(store, null, authConfig);
  }
}

export async function run(code: string): Promise<Results> {
  const computeSummary = await computeRun(store, computeSession, code);

  const log = await computeResults(store, computeSummary, "log");
  const ods = await computeResults(store, computeSummary, "ods");
  return {
    log,
    ods,
  };
}

export function closeSession(): Promise<void> {
  if (computeSession)
    return store.apiCall(computeSession.links("delete")).finally(() => {
      computeSession = undefined;
      authConfig = undefined;
    });
}
