/* eslint-disable */
import { LexerEx } from "./LexerEx";

export class SyntaxProvider {
  constructor(model) {
    var self = this,
      parsingQueue = [],
      parsingState = 2,
      syntaxTable = [],
      lexer = new LexerEx(model),
      lastToken = null,
      currTokenIndex = 0,
      parsedRange = {},
      tailUnchangedSyntaxTable = [],
      timer,
      removedSyntaxTable;

    this.blockComment = { start: "/*", end: "*/" };
    this.lexer = lexer;

    // private functions
    function _push(range) {
      parsingQueue.push(range);
    }
    function _startParse(change) {
      var startLine = 0;
      currTokenIndex = 0;
      lastToken = null;
      parsingState = 1; //LanguageService.ParsingState.STARTING;
      parsedRange = lexer.start(change);
      // jQuery(self).triggerHandler({type: "parsingStateEvent", state: parsingState, change: change, parsedRange: parsedRange});
      startLine = parsedRange.endLine + 1;
      tailUnchangedSyntaxTable = syntaxTable.splice(
        startLine,
        syntaxTable.length - startLine
      );
      removedSyntaxTable = syntaxTable.splice(
        parsedRange.startLine,
        startLine - parsedRange.startLine
      );

      /*
               (1) ^ removed
               -----^^^^^     //keep the head part
               ^^^^^^^^^^
               ^^^-------   //keep the tail part
               (2)
               ---^^^^---    //keep the tail part and the head part
               (3)
               ----|-----   //no removed. keep the head part and tail part
               (4)
               --------
               ~~~~~~~~  // parsed
               ~~~~~~~~
               --------
               */
      var syntaxLine = [];
      var i = 0;
      var tmpSyntaxLine = removedSyntaxTable[0];
      // keep the head part
      if (parsedRange.startCol > 0 && tmpSyntaxLine) {
        while (
          tmpSyntaxLine[i] &&
          tmpSyntaxLine[i].start < parsedRange.startCol
        ) {
          syntaxLine.push(tmpSyntaxLine[i]);
          i++;
        }
        tmpSyntaxLine.splice(0, i); //remove

        var endCol = parsedRange.startCol;
        if (tmpSyntaxLine.length) {
          endCol = tmpSyntaxLine[0].start;
        }
        var tmp = syntaxLine[syntaxLine.length - 1];
        lastToken = {
          start: { line: parsedRange.startLine, column: tmp.start },
          end: { line: parsedRange.startLine, column: endCol },
          type: tmp.style,
        };
        currTokenIndex = syntaxLine.length;
        syntaxTable[parsedRange.startLine] = syntaxLine;
      }

      // remove changed (middle part)
      i = 0;
      if (parsedRange.startLine === parsedRange.endLine && tmpSyntaxLine) {
        while (
          tmpSyntaxLine[i] &&
          tmpSyntaxLine[i].start < parsedRange.endCol
        ) {
          i++;
        }
        tmpSyntaxLine.splice(0, i);
      }
      // for multiple lines, keep the last line for late usage, we handle it in _parse
      _parse(change);
    }
    function _endParse(change) {
      parsingState = 2; //LanguageService.ParsingState.ENDED;

      // jQuery(self).triggerHandler({type: "parsingStateEvent", state:parsingState, change: change});
      _schedule();
    }
    function _schedule() {
      if (
        parsingState === 2 /*LanguageService.ParsingState.ENDED*/ &&
        parsingQueue.length
      ) {
        var change = parsingQueue.shift();
        _startParse(change);
      }
    }
    function _parse(change) {
      var time = new Date().getTime() + 100,
        token = null;
      try {
        for (;;) {
          token = lexer.getNext();
          _addItem(token);
          if (!token || lexer.end()) {
            _endParse(change);
            break;
          }
          // if (new Date().getTime() > time) {
          //   timer = setTimeout(_parse.bind(self), 0, change);
          //   break;
          // }
        }
      } catch (e) {
        if (e && e.changedLineCount !== undefined) {
          if (lastToken) {
            token = lastToken;
          } else if (syntaxTable.length === 0) {
            token = {
              type: "text",
              start: { line: 0, column: 0 },
              end: { line: 0, column: 0 },
            };
          } else {
            //ignored
          }

          // merge tokens
          var tailPart,
            len = removedSyntaxTable.length,
            validPos = 0,
            line = e.token.start.line;
          if (len >= 1 && line === parsedRange.endLine + e.changedLineCount) {
            tailPart = removedSyntaxTable[len - 1];
            tailPart.forEach(function (item) {
              item.start += e.changedColCount;
              if (item.start < e.token.start.column) {
                validPos++;
              }
            });
            tailPart.splice(0, validPos);
            if (syntaxTable[line]) {
              //TODO: This is ugly.
              //add blank token.
              _tryToAddBlank(line, syntaxTable[line], tailPart);
              //
              syntaxTable[line] = syntaxTable[line].concat(tailPart);
            }
          } /*else if (parsedRange.startLine === parsedRange.endLine) {
                                 tailPart = removedSyntaxTable[0];
                                 tailPart.forEach(function(item) {
                                 item.start += e.changedColCount;
                                 });
                                 if (syntaxTable[parsedRange.startLine]) {//FIXID S1159519
                                 syntaxTable[parsedRange.startLine] = syntaxTable[parsedRange.startLine].concat(tailPart);
                                 }
                                 }*/

          // merge syntax table
          //_addEndMarkForSkippedLines(token, e.token.start.line);
          syntaxTable = syntaxTable.concat(tailUnchangedSyntaxTable);
          _endParse(change);
        } else {
          throw e;
        }
      }
    }
    function _tryToAddBlank(line, syntax, added) {
      if (syntax.length) {
        var token = syntax[syntax.length - 1];
        if (added.length) {
          var text = model.getLine(line).substring(token.start, added[0].start);
          var matches = /\s+$/.exec(text);
          if (matches) {
            syntax.push({
              start: token.start + text.length - matches[0].length,
              state: null,
              style: "text",
            });
          }
        }
      }
    }
    function _addEndMarkForSkippedLines(token, endLine) {
      var line = 0,
        column = 0,
        syntaxLine = null;
      if (token.end.line !== endLine) {
        line = token.end.line;
        column = token.end.column;
        do {
          syntaxLine = syntaxTable[line] = syntaxTable[line] || [];
          if (currTokenIndex < syntaxLine.length) {
            syntaxLine.splice(
              currTokenIndex,
              syntaxLine.length - currTokenIndex
            ); //clear the garbages
          }
          //add end marks
          syntaxLine.push({ start: column, state: 0, style: "text" });
          line++;
          column = 0;
        } while (line < endLine);
        currTokenIndex = 0;
        lastToken = null;
      }
    }
    function _addItem(token) {
      var line = 0,
        syntaxLine = null,
        addRange = false,
        addStartTag = true;
      if (lastToken) {
        // (1) line changed, handle the end marks
        // (2) end all, add marks for all skipped lines
        _addEndMarkForSkippedLines(
          lastToken,
          token ? token.start.line : model.getLineCount()
        );
      }
      if (!token) {
        return;
      }
      // handle new token
      line = token.start.line;
      //add blank to the head for old format requirement
      //(1) there are space(s) before the first token
      //(2) the token is a middle token,
      if (
        (lastToken === null && token.start.column > 0) ||
        (lastToken &&
          lastToken.end.column !== token.start.column &&
          lastToken.end.line === token.start.line)
      ) {
        syntaxLine = syntaxTable[line] = syntaxTable[line] || [];
        if (currTokenIndex < syntaxLine.length) {
          syntaxLine.splice(currTokenIndex, syntaxLine.length - currTokenIndex);
        }
        syntaxLine.push({
          start: lastToken ? lastToken.end.column : 0,
          state: null,
          style: "text",
        });
        currTokenIndex++;
      }
      // ATTENTION: multiple lines condition
      if (token.end.line !== token.start.line) {
        addRange = true;
      }
      do {
        syntaxLine = syntaxTable[line] = syntaxTable[line] || [];
        //add the token
        if (currTokenIndex < syntaxLine.length) {
          //clear the unused elements
          syntaxLine.splice(currTokenIndex, syntaxLine.length - currTokenIndex);
        }
        syntaxLine.push({
          start: line === token.start.line ? token.start.column : 0,
          state: addStartTag
            ? addRange
              ? { line: token.end.line, col: token.end.column }
              : 1
            : null,
          style: token.type,
        });
        currTokenIndex++;
        addRange = false;
        addStartTag = false;
        //next line
        if (line < token.end.line) {
          //add end marks, ignore the last line
          syntaxLine.push({
            start: model.getLine(line).length,
            state: 0,
            style: "text",
          });
          currTokenIndex = 0;
        }
        line++;
      } while (line <= token.end.line); //end do

      //currTokenIndex++;
      lastToken = {
        type: token.type,
        start: { line: token.start.line, column: token.start.column },
        end: { line: token.end.line, column: token.end.column },
      }; // jpnjfk

      /*if (self.tokens) {    // The property "tokens" is added by only SASCodeChecker.// jpnjfk
                        self.tokens.push({text: lexer.lexer.getWord(token), type: token.type,    // jpnjfk
                            start: {line: token.start.line, column: token.start.column},             // jpnjfk
                            end: {line: token.end.line, column: token.end.column}});                 // jpnjfk
                    }*/ if (self._tokenCallback) {
        self._tokenCallback({
          text: model.getText(token),
          type: token.type,
          start: { line: token.start.line, column: token.start.column },
          end: { line: token.end.line, column: token.end.column },
        });
      }
    }
    // public functions
    self.getSyntax = function (line) {
      return syntaxTable[line] ? syntaxTable[line] : [];
    };
    self.getParseRange = function (change) {
      return lexer.getParseRange(change);
    };
    self.getFoldingBlock = function (line, col, strict) {
      return lexer.getFoldingBlock(line, col, strict);
    };
    self.add = function (change) {
      _push(change);
      _schedule();
    };
    self.type = function (line, col) {
      var syntax = self.getSyntax(line),
        len = syntax.length,
        i = 1;
      for (; i < len; i++) {
        // TODO: improve algorithm
        if (syntax[i].start >= col) {
          if (syntax[i - 1].start <= col) {
            return syntax[i - 1].style;
          } else {
            return "text";
          }
        }
      } //try our best to get real type
      return syntax &&
        syntax.length === 2 &&
        syntax[0].start === 0 &&
        syntax[1].state === 0
        ? syntax[0].style
        : "text";
    };
    self.setTokenCallback = function (cb) {
      self._tokenCallback = cb;
    };
    self.destroy = function () {
      if (timer) {
        clearTimeout(timer);
        timer = null;
      }
    };
  }
}
