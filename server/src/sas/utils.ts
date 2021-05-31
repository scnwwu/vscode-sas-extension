import { readFileSync } from "fs";

export function arrayToMap(arr: string[]): Record<string, 1> {
  const map: Record<string, 1> = {};
  for (const key of arr) {
    map[key] = 1;
  }
  return map;
}

let bundle: Record<string, string>;
export function getText(key: string, arg?: string): string {
  if (!bundle) {
    bundle = {};
    readFileSync(__dirname + "/../messagebundle.properties")
      .toString()
      .split("\n")
      .forEach((pair) => {
        const [key, value] = pair.split("=");
        bundle[key] = value;
      });
  }
  let result = bundle[key];
  if (arg) {
    result = result.replace("{0}", arg);
  }
  return result;
}
