import { TextDocument } from "vscode-languageserver-textdocument";
import { SyntaxColor } from "./SyntaxColor";
import { SasModel } from "./SasModel";

export const legend = {
  tokenTypes: [
    "sep",
    "keyword",
    "sec-keyword",
    "proc-name",
    "comment",
    "macro-keyword",
    "macro-comment",
    "macro-ref",
    "macro-sec-keyword",
    "cards-data",
    "string",
    "date",
    "time",
    "dt",
    "bitmask",
    "namebit",
    "hex",
    "numeric",
    "format", //, 'text', 'blank'
  ],
  tokenModifiers: [],
};

function getType(type: string) {
  return legend.tokenTypes.indexOf(type);
}

export class SyntaxProvider {
  private model;
  private syntaxColor;

  constructor(doc: TextDocument) {
    this.model = new SasModel(doc);
    this.syntaxColor = new SyntaxColor(this.model);
    const lineCount = this.model.getLineCount();

    this.syntaxColor.add({
      text: "",
      removedText: "",
      oldRange: {
        start: {
          line: 0,
          column: 0,
        },
        end: {
          line: 0,
          column: 0,
        },
      },
      newRange: {
        start: {
          line: 0,
          column: 0,
        },
        end: {
          line: lineCount - 1,
          column: this.model.getColumnCount(lineCount - 1),
        },
      },
    });
  }

  getTokens(): number[] {
    const lineCount = this.model.getLineCount();

    const data: number[] = [];
    let prevLine = 0;
    let prevChar = 0;

    for (let i = 0; i < lineCount; i++) {
      const line = this.model.getLine(i);
      const tokens = this.syntaxColor.getSyntax(i);
      for (let j = 0; j < tokens.length; j++) {
        const type = getType(tokens[j].style);
        const end = j === tokens.length - 1 ? line.length : tokens[j + 1].start;
        if (type < 0) continue;
        data.push(
          i - prevLine,
          prevLine === i ? tokens[j].start - prevChar : tokens[j].start,
          end - tokens[j].start,
          type,
          0
        );
        prevLine = i;
        prevChar = tokens[j].start;
      }
    }

    return data;
  }
}
