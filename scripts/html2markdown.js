/* eslint-disable */
const fs = require("fs");
const path = require("path");

const dir = "../server/pubsdata/Procedures/en";

function convert(str) {
  return str
    .replace(/<i>|<\/i>/g, "")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">");
}

function gothrough(syntax) {
  for (const data of syntax) {
    if (data.arguments) gothrough(data.arguments);
    if (data.help) data.help = convert(data.help);
  }
}

fs.readdir(dir, (err, files) => {
  for (const file of files) {
    fs.readFile(path.join(dir, file), (err, data) => {
      const syntax = JSON.parse(data);
      gothrough(syntax.statements ? syntax.statements : syntax);
      fs.writeFileSync(path.join(dir, file), JSON.stringify(syntax));
    });
  }
});
