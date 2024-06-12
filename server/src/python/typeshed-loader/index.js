/**
 * A webpack loader gathering typeshed for intellisense features
 */
const fs = require("fs/promises");
const path = require("path");

const dirs = ["stdlib"];
const result = [];

async function* walk(dir) {
  for await (const d of await fs.opendir(dir)) {
    const entry = path.join(dir, d.name);
    if (d.isDirectory()) yield* walk(entry);
    else if (d.isFile()) yield entry;
  }
}

async function loader() {
  const callback = this.async();

  for (const dir of dirs) {
    const entry = path.resolve(
      __dirname,
      "../../../node_modules/pyright-internal-lsp/dist/packages/pyright-internal/typeshed-fallback",
      dir,
    );
    const prefixLength = entry.indexOf("typeshed-fallback") - 1;
    for await (const filename of walk(entry)) {
      if (filename.endsWith(".pyi")) {
        const content = await fs.readFile(filename);
        result.push({
          content: content.toString(),
          filePath: filename.slice(prefixLength).replace(/\\/g, "/"),
        });
      }
    }
  }

  callback(null, `export const typeShed = ${JSON.stringify(result)}`);
}

module.exports = loader;
