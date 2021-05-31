/* eslint-disable @typescript-eslint/no-var-requires */
console.log("start");
const dev = process.argv[2];
require("esbuild")
  .build({
    entryPoints: {
      "./client/dist/extension": "./client/src/extension.ts",
      "./server/dist/server": "./server/src/server.ts",
    },
    bundle: true,
    outdir: ".",
    platform: "node",
    external: ["vscode"],
    sourcemap: !!dev,
    watch: dev
      ? {
          onRebuild() {
            // for VS Code task tracking
            console.log("start");
            console.log("end");
          },
        }
      : false,
    minify: !dev,
  })
  .finally(() => console.log("end"));
