import { TextDocument } from "vscode-languageserver-textdocument";
import { SyntaxColor } from "./SyntaxColor";
import { SasModel } from "./SasModel";
import { SasAutoCompleter } from "./SasAutoCompleter";
import { DocumentSymbol, SymbolKind } from "vscode-languageserver-types";

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
  public autoCompleter;

  constructor(doc: TextDocument) {
    this.model = new SasModel(doc);
    this.syntaxColor = new SyntaxColor(this.model);
    this.autoCompleter = new SasAutoCompleter(this.model, this.syntaxColor);

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

  getFoldingBlocks(): DocumentSymbol[] {
    const lineCount = this.model.getLineCount();
    const result = [];
    let customBlock;

    for (let i = 0; i < lineCount; i++) {
      const block = this.syntaxColor.getFoldingBlock(i);

      if (block && block.startLine === i) {
        const range = {
          start: { line: block.startLine, character: block.startCol },
          end: { line: block.endFoldingLine, character: block.endFoldingCol },
        };
        result.push({
          name: block.name,
          kind: SymbolKind.Module,
          range,
          selectionRange: range,
        });
        i = block.endFoldingLine;
        continue;
      }
      let token = this.syntaxColor.getSyntax(i)[0];
      if (token && token.style === "text") {
        token = this.syntaxColor.getSyntax(i)[1];
      }
      if (token && /comment/.test(token.style)) {
        if (/^\s*[%/]?\*\s*region\b/i.test(this.model.getLine(i))) {
          customBlock = {
            start: { line: i, character: 0 },
            end: {
              line: this.model.getLineCount(),
              character: 0,
            },
          };
        } else if (
          customBlock &&
          /^\s*[%/]?\*\s*endregion\b/i.test(this.model.getLine(i))
        ) {
          customBlock.end = {
            line: i,
            character: this.model.getColumnCount(i),
          };
          result.push({
            name: "User-defined region",
            kind: SymbolKind.Module,
            range: customBlock,
            selectionRange: customBlock,
          });
          customBlock = undefined;
        }
      }
    }
    return result;
  }
}
