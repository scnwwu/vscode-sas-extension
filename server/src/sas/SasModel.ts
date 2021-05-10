import { Range, TextDocument } from "vscode-languageserver-textdocument";

export class SasModel {
  constructor(private doc: TextDocument) {}

  getLine(line: number): string {
    return this.doc.getText({
      start: { line, character: 0 },
      end: { line: line + 1, character: 0 },
    });
  }

  getLineCount(): number {
    return this.doc.lineCount;
  }

  getText(range: Range): string {
    return this.doc.getText(range);
  }

  getColumnCount(line: number): number {
    return (
      this.doc.offsetAt({ line: line + 1, character: 0 }) -
      this.doc.offsetAt({ line, character: 0 })
    );
  }
}
