/* eslint-disable */
import { arrayToMap } from "./utils";
import { Lexer } from "./Lexer";
import { SyntaxDataProvider } from "./SyntaxDataProvider";

/**
 * SasLexerEx constructor
 * CodeEditor has not semantic parsing function,
 * so using this module to handle basic semantic related problems.
 */

var FoldingBlock = function () {
  if (arguments.length === 1) {
    //copy constructor
    this.startLine = arguments[0].startLine;
    this.startCol = arguments[0].startCol;
    this.endLine = arguments[0].endLine;
    this.endCol = arguments[0].endCol;
    this.type = arguments[0].type;
    this.name = arguments[0].name;
    this.endFoldingLine = arguments[0].endFoldingLine;
    this.endFoldingCol = arguments[0].endFoldingCol;
  } else if (arguments.length >= 4) {
    this.startLine = arguments[0];
    this.startCol = arguments[1];
    this.endLine = arguments[2];
    this.endCol = arguments[3];
    this.type = arguments[4];
    this.name = arguments[5] ? arguments[5] : "";
  } else {
    this.startLine = -1;
    this.startCol = -1;
    this.endLine = -1;
    this.endCol = -1;
    this.type = -1;
    this.name = "";
    this.endFoldingLine = -1;
    this.endFoldingCol = -1;
  }
};

//var StmtBlock = FoldingBlock;
var TknBlock = FoldingBlock;

export var LexerEx = function (model) {
  var blockDepth = 0,
    sections = [],
    tailSections = [],
    currSection,
    stmts = [],
    //currStmt,
    //isStmtStart = true,
    tokens = [],
    tknBlks = [],
    tailTknBlks = null,
    changedLineCount = 0,
    changedColCount = 0;
  this.model = model;
  this.lexer = new Lexer(model);
  this.expr = new Expression(this);
  this.langSrv = new SyntaxDataProvider();
  this.SEC_TYPE = LexerEx.SEC_TYPE;
  this.PARSING_STATE = {
    IN_GBL: 0,
    IN_MACRO: 1,
    IN_PROC: 2,
    IN_DATA: 3,
  };
  this.isTokenWithScopeMarks = {
    comment: 1,
    "macro-comment": 1,
    string: 1,
    date: 1,
    time: 1,
    dt: 1,
    bitmask: 1,
    namelit: 1,
    hex: 1,
  };
  this.CARDS_STATE = {
    IN_NULL: 0,
    IN_CMD: 1,
    IN_DATA: 2,
    IN_DATA_WAITING: 3,
  };
  this.cardsState = this.CARDS_STATE.IN_NULL;
  this.startLineForCardsData = 0;
  this.stack = null;
  this.curr = null;
  this.lookAheadTokens = [];
  this.sectionCache = [];
  this.lastToken = null;
  // support to cache collapsible block
  sections = [];
  currSection = new FoldingBlock(); //this is ref to FoldingBlock obj
  //currStmt = new StmtBlock();

  var stmtAlias = {
    OPTION: "OPTIONS",
    GOPTION: "GOPTIONS",
  };

  this._cleanKeyword = function (keyword) {
    if (/^(TITLE|FOOTNOTE|AXIS|LEGEND|PATTERN|SYMBOL)\d{0,}$/.test(keyword)) {
      var results = keyword.match(
          /(^(TITLE|FOOTNOTE|AXIS|LEGEND|PATTERN|SYMBOL)|\d{0,}$)/g
        ),
        nbr = parseInt(results[1], 10),
        isKeyword = false;

      switch (results[0]) {
        case "TITLE":
        case "FOOTNOTE":
          isKeyword = nbr < 11 && nbr > 0;
          break;
        case "AXIS":
        case "LEGEND":
          isKeyword = nbr < 100 && nbr > 0;
          break;
        case "PATTERN":
        case "SYMBOL":
          isKeyword = nbr < 256 && nbr > 0;
          break;
      }
      if (isKeyword) {
        keyword = results[0];
      }
    } else {
      var alias = stmtAlias[keyword];
      if (alias) {
        keyword = alias;
      }
    }

    return keyword;
  };
  this.adjustFoldingEnd_ = function (prevBlock, currBlock) {
    if (
      prevBlock.endLine > prevBlock.startLine &&
      prevBlock.endLine === currBlock.startLine
    ) {
      prevBlock.endFoldingLine = prevBlock.endLine - 1;
      prevBlock.endFoldingCol = this.model.getColumnCount(
        prevBlock.endFoldingLine
      );
    } else {
      prevBlock.endFoldingLine = prevBlock.endLine;
      prevBlock.endFoldingCol = prevBlock.endCol;
    }
  };
  this.push_ = function (block) {
    this.trimBlock_(block);
    // folding end
    this.sectionCache[block.startLine] = null; // clear cached block, it must try to get the last
    block.endFoldingLine = block.endLine;
    block.endFoldingCol = block.endCol;
    // adjujst previous block
    if (sections.length) {
      this.adjustFoldingEnd_(sections[sections.length - 1], block);
    }
    // add
    sections.push(block);
    tokens = [];
  };
  //TODO: IMPROVE
  this._changeCardsDataToken = function (token) {
    tokens.pop();
    tokens.push(token);
    return token;
  };
  this._clonePos = function (pos) {
    return { line: pos.line, column: pos.column };
  };
  this.startFoldingBlock_ = function (type, pos, name) {
    blockDepth++;
    if (blockDepth === 1) {
      currSection.startLine = pos.line;
      currSection.startCol = pos.column;
      currSection.type = type;
      currSection.name = name;
      currSection.specialBlks = null;
    }
  };
  this.endFoldingBlock_ = function (type, pos, explicitEnd, start, name) {
    // positively end
    var add = false;
    blockDepth--;
    if (blockDepth === 0) {
      add = true;
    }
    if (add) {
      if (pos.line >= currSection.startLine) {
        currSection.endLine = pos.line;
        currSection.endCol = pos.column;
        //currSection.type = type;
        var block = new FoldingBlock(currSection);
        //var block = {};
        //jQuery.extend(true, block, currSection);
        block.explicitEnd = explicitEnd;
        if (explicitEnd) {
          block.explicitEndStmt = {};
          block.explicitEndStmt.start = start.start;
          block.explicitEndStmt.name = name;
        }
        if (currSection.specialBlks) {
          block.specialBlks = currSection.specialBlks;
          currSection.specialBlks = null;
        }
        this.push_(block);
      }
      //sas.log.info('block('+currSection.startLine + ',' + currSection.endLine + ')');
      currSection.startLine = -1;
    }
  };
  this.hasFoldingBlock_ = function () {
    return currSection.startLine >= 0;
  };
  // The definition of return value is same to getBlockPos1_
  // FIXID S1178400
  function getBlockPos2_(blocks, currentIdx, line, col) {
    var i = currentIdx,
      block = blocks[i],
      pos = { line: line, column: col };

    if (!block || _isBetween(pos, _startPos(block), _endPos(block))) {
      return currentIdx;
    }

    if (_isBefore(pos, _startPos(block))) {
      /*
                 |[] <-
                 */
      do {
        i--;
        block = blocks[i];
      } while (block && !_isBefore(_endPos(block), pos)); // []|

      return ++i;
    } else {
      /*
                 []| ->
                 */
      do {
        i++;
        block = blocks[i];
      } while (block && !_isBefore(pos, _startPos(block))); // |[]
      return --i;
    }
  }
  this.getLastNormalFoldingBlockInLine_ = function (currentIdx, line) {
    var i = currentIdx,
      block = sections[i],
      idx = currentIdx;
    // find forward
    while (block && (block.startLine === line || block.endLine === line)) {
      if (block.type !== this.SEC_TYPE.GBL) {
        idx = i;
      } else idx = -1;
      i++;
      block = sections[i];
    }
    // find backward
    if (idx < 0) {
      i = currentIdx - 1;
      block = sections[i];
      while (block && (block.startLine === line || block.endLine === line)) {
        if (block.type !== this.SEC_TYPE.GBL) {
          idx = i;
          break;
        } else idx = -1;
        i--;
        block = sections[i];
      }
    }
    // ignore global
    if (sections[idx] && sections[idx].type === this.SEC_TYPE.GBL) {
      idx = -1;
    }
    return sections[idx];
    //return sections[idx]?sections[idx]:null; //we return null if no
  };
  this.getFoldingBlock_ = function (line, col, strict) {
    var idx = this.getBlockPos_(sections, line, col),
      block = sections[idx];
    if (strict) {
      return block;
    }
    if (block && block.startLine <= line && block.endLine >= line) {
      return this.getLastNormalFoldingBlockInLine_(idx, line);
    } else if (col) {
      // for last block, the input position is the last
      block = sections[sections.length - 1];
      if (
        block &&
        !_isBefore({ line: line, column: col }, _endPos(block)) &&
        !block.explictEnd
      ) {
        // must use !
        return block;
      }
    }
    return null;
  };
  this.getFoldingBlock = function (line, col, strict) {
    if (col === undefined) {
      if (!this.sectionCache[line]) {
        var section = this.getFoldingBlock_(line);
        if (section && line <= section.endFoldingLine) {
          this.sectionCache[line] = section;
        } else {
          this.sectionCache[line] = null;
        }
      }
      return this.sectionCache[line];
    }
    return this.getFoldingBlock_(line, col, strict);
  };
  this.getBlockPos_ = function (blocks, line, col) {
    var idx = this.getBlockPos1_(blocks, line);
    if (col || col === 0) {
      idx = getBlockPos2_(blocks, idx, line, col); // multiple blocks are in one same lines
    }

    return idx;
  };
  //SUPPORT CODE FOLDING
  //we define global statments as a kind of block, so the return will always be the first form.
  //
  this.getBlockPos1_ = function (blocks, line) {
    var len = blocks.length,
      m = Math.floor(len / 2),
      l = 0,
      r = len - 1,
      flags = {};
    if (len) {
      for (;;) {
        flags[m] = true;
        if (line <= blocks[m].endLine) {
          if (line >= blocks[m].startLine) {
            return m;
          } else {
            r = m;
            m = Math.floor((l + r) / 2); // to left
          }
        } else {
          l = m;
          m = Math.ceil((l + r) / 2); //to right
        }
        if (flags[m]) {
          if (line >= blocks[m].endLine) {
            return m + 1;
          } else {
            return m;
          }
        }
      }
    } //sas.log.info('BlockRange:'+first+'-'+second);
    return 0;
  };
  this.resetFoldingBlockCache_ = function () {
    sections = [];
    blockDepth = 0;
  };
  this.tryEndFoldingBlock_ = function (pos) {
    if (this.hasFoldingBlock_()) {
      // handle text end
      var secType = this.SEC_TYPE.PROC;
      if (this.curr.state === this.PARSING_STATE.IN_DATA) {
        secType = this.SEC_TYPE.DATA;
      } else if (this.curr.state === this.PARSING_STATE.IN_MACRO) {
        secType = this.SEC_TYPE.MACRO;
      } else if (this.curr.state === this.PARSING_STATE.IN_GBL) {
        secType = this.SEC_TYPE.GBL;
      }
      this.endFoldingBlock_(secType, pos);

      while (blockDepth > 0) {
        this.endFoldingBlock_(secType, pos);
        blockDepth--;
      }
    }
  };
  this.tryStop_ = function (token) {
    var len = tailSections.length;
    //this.tryToAddStmtBlock_(token);
    this.tryToAddTknBlock_(token);
    //this.tryToAddCardsBlock_(token);
    if (token && len && !_isBefore(token.start, _startPos(tailSections[0]))) {
      if (this.hasFoldingBlock_()) {
        if (currSection.type === this.SEC_TYPE.MACRO) {
          tailSections.splice(0, 1);
          return;
        }
        this.tryEndFoldingBlock_(this.lastToken.end);
      }
      // adjust the associated information
      var blkIdx = tknBlks.length;
      var sectionIdx = sections.length;
      var i,
        len,
        j = 0;
      tailSections.forEach(function (section) {
        if (section.specialBlks) {
          i = 0;
          len = section.specialBlks.length;
          for (; i < len; i++) {
            section.specialBlks[i] = blkIdx;
            if (tailTknBlks[j]) {
              tailTknBlks[j].sectionIdx = sectionIdx;
            }
            j++;
            blkIdx++;
          }
        }
        sectionIdx++;
      });
      if (sections.length && tailSections.length) {
        this.adjustFoldingEnd_(sections[sections.length - 1], tailSections[0]);
      }
      // merge
      sections = sections.concat(tailSections);
      tknBlks = tknBlks.concat(tailTknBlks);
      this.lastToken = null;
      throw {
        changedLineCount: changedLineCount,
        changedColCount: changedColCount,
        type: "skip-syntax-parsing",
        token: token,
      };
    }
    if (token) tokens.push(token);
  };
  this.printBlocks = function () {
    for (var i = 0; i < sections.length; i++) {
      //sas.log.info(sections[i].startLine + '-'+sections[i].endLine);
    }
  };
  function _startPos(block) {
    return { line: block.startLine, column: block.startCol };
  }
  function _endPos(block) {
    return { line: block.endLine, column: block.endCol };
  }
  function _setStart(block, pos) {
    block.startLine = pos.line;
    block.startCol = pos.column;
  }
  function _setEnd(block, pos) {
    block.endLine = pos.line;
    block.endCol = pos.column;
  }
  function _sectionEndPos(block) {
    return { line: block.endFoldingLine, column: block.endFoldingCol };
  }
  function _setSectionEnd(block, pos) {
    block.endFoldingLine = pos.line;
    block.endFoldingCol = pos.column;
  }
  this._docEndPos = function () {
    var line = this.model.getLineCount() - 1;
    return { line: line, column: this.model.getColumnCount(line) };
  };
  this._getParseText = function (change, parseRange) {
    var startSection = sections[parseRange.removedBlocks.start],
      endSection = sections[parseRange.removedBlocks.end],
      start,
      end,
      tmpBlks = [],
      tmpBlk,
      prevSection,
      nextSection;
    if (!startSection) {
      return change.text;
    }

    prevSection = sections[parseRange.removedBlocks.start - 1];
    if (prevSection) {
      start = _endPos(prevSection);
    } else {
      start = { line: 0, column: 0 };
    }

    if (change.type === "textChanged") {
      nextSection = sections[parseRange.removedBlocks.end + 1];
      if (
        nextSection /*&& _isBefore(change.newRange.end, _startPos(nextSection))*/
      ) {
        tmpBlk = new FoldingBlock(nextSection);
        tmpBlks.push(tmpBlk);
        _adjustBlocksCoord(tmpBlks, change, parseRange);
        end = _startPos(tmpBlk);
      } else {
        end = this._docEndPos();
      }
      return this.model.getText({ start: start, end: end });
    } else {
      var part1 = this.model.getText({
          start: start,
          end: change.oldRange.start,
        }),
        part2;

      end = endSection ? _endPos(endSection) : this._docEndPos();
      part2 = this.model.getText({ start: change.oldRange.end, end: end });

      return part1 + change.text + part2;
    }
  };
  function _getNextValidTknBlkIdx(startIndex) {
    // section index
    var i = startIndex,
      max = sections.length - 1,
      section;
    while (i <= max) {
      section = sections[i];
      if (section && section.specialBlks) {
        return section.specialBlks[0];
      }
      i++;
    }
    return -1;
  }
  this._getNextComment = function (startIndex) {
    // section index
    var i = _getNextValidTknBlkIdx(startIndex);
    while (tknBlks[i] && tknBlks[i].blockComment !== true) {
      i++;
    }
    return tknBlks[i];
  };
  this._getNextCards4 = function (startIndex) {
    var i = _getNextValidTknBlkIdx(startIndex);
    while (
      tknBlks[i] &&
      !Lexer.isCards4[tknBlks[i].name] &&
      !Lexer.isParmcards4[tknBlks[i].name]
    ) {
      i++;
    }
    return tknBlks[i];
  };
  function _checkCards4(regExp, text) {
    var start,
      cards = null;

    start = regExp.start.exec(text); //find start statement
    if (start) {
      text = text.substring(start.index + start[0].length);
      cards = regExp.cards.exec(text); // find cards statement
    }

    return cards;
  }
  function _saveRemoveDataLines(regExp, text) {
    var done;

    function _removeDataLines(text) {
      var start,
        cards,
        end,
        parts = [],
        len;
      //if (sap.ui.Device.browser.msie) {
      //    CollectGarbage();
      //}
      done = true;
      for (;;) {
        start = regExp.start.exec(text); //find start statement
        if (start) {
          len = start.index + start[0].length;
          parts.push(text.substring(0, len));
          text = ";" + text.substring(len); //NOTE: add ;
          cards = regExp.cards.exec(text); // find cards statement
          if (cards) {
            parts.push(text.substring(0, cards.index + 1));
            text = text.substring(cards.index + cards[0].length); //remove cards;
            end = regExp.end.exec(text); //find end position of cards data
            if (end) {
              text = text.substring(end.index + end[0].length);

              if (parts.length > 400) {
                // jump out to release memory
                done = false;
                break;
              }
            } else {
              parts.push(cards[0]);
              //text = "";
              break;
            }
          } else {
            parts.push(text.substring(1)); // no cards, we should keep the remaining
            break;
          }
        } else {
          parts.push(text);
          break;
        }
      }
      return parts.join("");
    }

    do {
      text = _removeDataLines(text);
    } while (!done);
    return text;
  }
  var regComment =
      /(\/\*[\s\S]*?\*\/)|(^\s*\*[\s\S]*?;)|(;\s*\*[\s\S]*?;)|(%\*[\s\S]*?;)/i,
    regConst = /('|")([\s\S]*?)(\1)/i,
    regMacro = /%macro\b(?!.+%mend;)/i,
    regCardsStart = /(^\s*|;\s*)(data)(;|[\s]+[^;]*;)/i, //first ;
    regCards = /(;[\s]*)(cards|lines|datalines)(;|[\s]+[^;]*;)/i, //TODO: for the code having label
    regCards4 = /(;[\s]*)(cards4|lines4|datalines4)(;|[\s]+[^;]*;)/i,
    regParmcardsStart =
      /(^\s*|;\s*)(proc)(\s*\/\*[\s\S]+\*\/\s*|\s+)(explode)(;|[\s]+[^;]*;)/i,
    regParmcards = /(;[\s]*)(parmcards)(;|[\s]+[^;]*;)/i,
    regParmcards4 = /(;[\s]*)(parmcards4)(;|[\s]+[^;]*;)/i,
    regCardsEnd = /([^;]*;)/im,
    regCards4End = /(\n^;;;;)/im,
    cards = {
      start: regCardsStart,
      cards: regCards,
      end: regCardsEnd,
    },
    cards4 = {
      start: regCardsStart,
      cards: regCards4,
      end: regCards4End,
    },
    parmcards = {
      start: regParmcardsStart,
      cards: regParmcards,
      end: regCardsEnd,
    },
    parmcards4 = {
      start: regParmcardsStart,
      cards: regParmcards4,
      end: regCards4End,
    };

  function _remove(reg, text, replacement) {
    var parts = [],
      matched;
    for (;;) {
      matched = reg.exec(text);
      if (matched) {
        parts.push(text.substring(0, matched.index));
        if (replacement) {
          parts.push(replacement);
        }
        text = text.substring(matched.index + matched[0].length);
      } else {
        parts.push(text);
        break;
      }
    }
    return parts.join("");
  }

  function _removeComment(text) {
    return _remove(regComment, text);
  }

  function _removeConst(text) {
    return _remove(regConst, text, "x");
  }

  this._checkSpecialChange = function (change, parseRange) {
    var regQuotesStart = /['"]/gim,
      regBlockCommentStart = /\/\*/gim,
      text = this._getParseText(change, parseRange),
      nextBlockComment = null,
      nextBlockCards4 = null,
      sectionToChange = -1,
      change;
    //sas.log.info("changed special tokens:" + tknParseRange);
    // text is of the blocks impacted directly
    // clean up text
    text = _removeComment(text); //remove normal comments
    text = _removeConst(text);
    // NOTE:
    // (1) cards contain comment-like data, and matched token is outside
    // (2) cards contain const-like data, and matched token is ourside
    text = _saveRemoveDataLines(cards, text);
    text = _saveRemoveDataLines(cards4, text);
    text = _saveRemoveDataLines(parmcards, text);
    text = _saveRemoveDataLines(parmcards4, text);
    text = text.replace(/\n/g, " ");
    //text = text.replace(regConst, "x");

    // check comment
    change = regBlockCommentStart.test(text);
    if (change) {
      //if (tknParseRange.removedBlocks) { // the block comment will stop to the next block comment if the current is not end normally
      nextBlockComment = this._getNextComment(parseRange.removedBlocks.end + 1);
      if (nextBlockComment) {
        text += " /**/"; //with a space before /**/
        sectionToChange = nextBlockComment.sectionIdx;
        text = _removeComment(text);
        regBlockCommentStart.lastIndex = 0;
        change = regBlockCommentStart.test(text);
      }
      //}
      if (change) {
        return sections.length; // always reparse all
      }
    }

    // check const
    change = regQuotesStart.test(text);
    if (change) {
      return sections.length;
    }

    // check macro
    change = regMacro.test(text);
    if (change) {
      return sections.length;
    }

    if (text.lastIndexOf("*") > 0) {
      // S1454652: *comment need following ';'
      sectionToChange = parseRange.removedBlocks.end + 1;
      if (sectionToChange > sections.length) {
        return sections.length;
      }
    }
    if (sectionToChange > 0) {
      return sectionToChange;
    }

    // check cards
    change = _checkCards4(cards4, text);
    if (change) {
      if (parseRange.removedBlocks) {
        nextBlockCards4 = this._getNextCards4(parseRange.removedBlocks.end + 1);
        if (nextBlockCards4) {
          text += " \n;;;;\n";
          sectionToChange = nextBlockCards4.sectionIdx;
          text = _saveRemoveDataLines(cards4, text);
          change = _checkCards4(cards4, text);
        }
      }
      if (change) {
        return sections.length;
      }
    }
    // check parmcards
    change = _checkCards4(parmcards4, text);
    if (change) {
      if (parseRange.removedBlocks) {
        nextBlockCards4 = this._getNextCards4(parseRange.removedBlocks.end + 1);
        if (nextBlockCards4) {
          text += " \n;;;;\n";
          sectionToChange = nextBlockCards4.sectionIdx;
          text = _saveRemoveDataLines(parmcards4, text);
          change = _checkCards4(parmcards4, text);
        }
      }
      if (change) {
        return sections.length;
      }
    }
    if (sectionToChange > 0) {
      return sectionToChange;
    }

    return -1;
  };
  function _isBlank(text) {
    return /^\s*$/.test(text);
  }
  function _isHeadDestroyed(change, block) {
    var oldRange = change.oldRange,
      blank = _isBlank(change.text + change.removedText);
    if (_isBefore(oldRange.start, _startPos(block)) && !blank) {
      //PROC PROCEDURE DATA %MACRO
      return true;
    } else if (oldRange.start.line === block.startLine) {
      var offset = oldRange.start.column - block.startCol;
      if (change.text === "=") {
        var text = model
          .getLine(block.startLine)
          .slice(block.startCol, oldRange.start.column);
        return /(PROC|PROCEDURE|DATA)\s*/i.test(_removeComment(text));
      }
      if (offset === 0 && blank) {
        return false;
      } else if (offset <= block.name.length) {
        return true;
      }
    }
    return false;
  }
  function _isTailDestroyed(change, block) {
    var oldRange = change.oldRange;
    if (
      !_isBefore(oldRange.end, _endPos(block)) ||
      (block.type !== LexerEx.SEC_TYPE.GBL &&
        block.explicitEnd &&
        _isBefore(block.explicitEndStmt.start, oldRange.end))
    ) {
      return true;
    }
    return false;
  }
  function _isCollapsedPartially(block) {
    return block && block.collapsed && block.endLine !== block.endFoldingLine;
  }
  function _isBetween(pos, start, end) {
    return _isBefore(start, pos) && _isBefore(pos, end);
  }
  function _isBefore(pos1, pos2) {
    if (pos1.line < pos2.line) {
      return true;
    } else if (pos1.line === pos2.line) {
      if (pos1.column < pos2.column) {
        return true;
      }
    }
    return false;
  }
  this.normalizeStart_ = function (block) {
    if (
      block.startCol !== 0 &&
      block.startCol === this.model.getColumnCount(block.startLine) &&
      block.startLine + 1 < this.model.getLineCount()
    ) {
      block.startLine++;
      block.startCol = 0;
    }
  };
  this.normalizeEnd_ = function (block) {
    if (
      block.endCol <= 0 &&
      block.endLine > 0 &&
      this.model.getColumnCount(block.endCol) > 0
    ) {
      block.endLine--;
      block.endCol = this.model.getColumnCount(block.endLine);
    }
  };
  this.normalizeBlock_ = function (block) {
    this.normalizeStart_(block);
    this.normalizeEnd_(block);
  };
  this.trimBlock_ = function (block) {
    var lastToken = this.getLastToken_(block);
    if (lastToken) {
      block.endLine = lastToken.end.line;
      block.endCol = lastToken.end.column;
    }
    this.normalizeBlock_(block);
    //if (block.type === this.SEC_TYPE.GBL && this.isBlank_(block)) {
    //    block.blank = true;
    //}
  };
  this.getLastToken_ = function (block) {
    var i = tokens.length - 1;
    // skip the tokens belonging to next block
    // while(i >= 0 && this.getWord_(tokens[i]) !== ';') {
    while (
      tokens[i] &&
      (tokens[i].start.line > block.endLine ||
        (tokens[i].start.line === block.endLine &&
          tokens[i].start.column >= block.endCol))
    ) {
      i--;
    }
    while (i >= 0 && /^\s*$/g.test(this.lexer.getText(tokens[i]))) {
      i--;
    }
    if (i >= 0) {
      return tokens[i];
    }
    return null;
  };
  this.getChange_ = function (blocks, origPos) {
    var idx = this.getBlockPos_(blocks, origPos.line, origPos.column),
      blockIdx = idx,
      block = {
        startLine: 0,
        startCol: 0,
        endLine: 0,
        endCol: 0,
      };

    if (blocks[idx]) {
      block = blocks[idx];
    } else if (blocks.length > 0 && idx >= blocks.length) {
      blockIdx = blocks.length - 1;
      block = blocks[blockIdx];
      if (block.explicitEnd) {
        block = {
          startLine: block.endLine,
          startCol: block.endCol,
          endLine: this.model.getLineCount() - 1,
          endCol: 0,
        };
        block.endCol = this.model.getColumnCount(block.endLine);

        if (_isBefore(_endPos(block), _startPos(block))) {
          block.endLine = block.startLine;
          block.endCol = block.startCol;
        }

        blockIdx++; //no block
      }
    }

    return {
      startLine: block.startLine,
      startCol: block.startCol,
      endLine: block.endLine,
      endCol: block.endCol,
      blockIdx: blockIdx,
    };
  };
  this._getParseRange = function (blocks, change) {
    var oldRange = change.oldRange,
      changeStart = this.getChange_(blocks, oldRange.start),
      changeEnd,
      removedBlocks = {},
      range = changeStart;
    if (
      oldRange.start.line === oldRange.end.line &&
      oldRange.start.column === oldRange.end.column
    ) {
      //no removed
      changeStart.removedBlocks = {
        start: changeStart.blockIdx,
        end: changeStart.blockIdx,
      };
      //return changeStart;
    } else {
      changeEnd = this.getChange_(blocks, oldRange.end); //TODO: May improve some situations
      if (
        changeEnd.startLine > changeStart.startLine &&
        changeEnd.endLine < changeStart.endLine
      ) {
        // end is in start
        changeStart.removedBlocks = {
          start: changeStart.blockIdx,
          end: changeStart.blockIdx,
        };
        //return changeStart;
      } else {
        var startLine, startCol, endLine, endCol;

        if (changeEnd.startLine > changeStart.startLine) {
          //gbl-head -> in-block
          startLine = changeStart.startLine;
          startCol = changeStart.startCol;
        } else if (changeStart.startLine === changeEnd.startLine) {
          //exist, two blocks is in one same line,
          startLine = changeStart.startLine;
          startCol =
            changeStart.startCol > changeEnd.startCol
              ? changeEnd.startCol
              : changeStart.startCol; // the latter does not exist
        } else {
          //exist
          startLine = changeEnd.startLine;
          startCol = changeEnd.startCol;
        }

        if (changeStart.endLine > changeEnd.endLine) {
          //not exist
          endLine = changeStart.endLine;
          endCol = changeStart.endCol;
          //assert('error');
        } else if (changeStart.endLine === changeEnd.endLine) {
          //exist, two blocks is in one same line
          endLine = changeStart.endLine;
          endCol =
            changeStart.endCol > changeEnd.endCol
              ? changeStart.endCol
              : changeEnd.endCol; //the former does not exist
        } else {
          //exist
          endLine = changeEnd.endLine;
          endCol = changeEnd.endCol;
        }

        removedBlocks.start = changeStart.blockIdx;
        removedBlocks.end = changeEnd.blockIdx;

        range = {
          startLine: startLine,
          startCol: startCol,
          endLine: endLine,
          endCol: endCol,
          removedBlocks: removedBlocks,
        };
      }
    }
    return range;
  };
  //API
  this.getParseRange = function (change) {
    return this.getParseRangeBySections_(change);
  };
  this.getParseRangeBySections_ = function (change) {
    var blocks = sections;
    var range = this._getParseRange(blocks, change);
    // include the previous part
    var currBlock = blocks[range.removedBlocks.start - 1],
      prevBlock = null;

    if (currBlock) {
      range.startLine = currBlock.endLine;
      range.startCol = currBlock.endCol;
    } else {
      //if (currBlock && _isBefore(change.oldRange.start, _startPos(range))) {
      range.startLine = 0; //change.oldRange.start.line;
      range.startCol = 0; //change.oldRange.start.column;
    }

    currBlock = blocks[range.removedBlocks.start];

    if (currBlock) {
      prevBlock = blocks[range.removedBlocks.start - 1];
      if (
        prevBlock &&
        ((_isHeadDestroyed(change, currBlock) && !prevBlock.explicitEnd) ||
          _isCollapsedPartially(prevBlock))
      ) {
        //check whether re-parse the previous block
        range.startLine = prevBlock.startLine;
        range.startCol = prevBlock.startCol;
        range.removedBlocks.start--;
      } else if (
        !_isBefore(change.oldRange.start, _endPos(currBlock)) &&
        currBlock.explicitEnd
      ) {
        // use '!'
        range.removedBlocks.start++;
        range.startLine = currBlock.endLine;
        range.startCol = currBlock.endCol;
      }
    }
    // const, comment
    var sectionToChange = this._checkSpecialChange(change, range);
    if (sectionToChange >= 0) {
      if (sectionToChange === sections.length) {
        range.endLine = this.model.getLineCount() - 1;
        range.endCol = this.model.getColumnCount(range.endLine);
        range.removedBlocks.end = blocks.length - 1;
      } else if (sectionToChange > range.removedBlocks.end) {
        range.endLine = sections[sectionToChange].endLine;
        range.endCol = sections[sectionToChange].endCol;
        range.removedBlocks.end = sectionToChange;
      }
    } else {
      var nextBlockIdx = range.removedBlocks.end,
        nextBlock = null;
      currBlock = blocks[nextBlockIdx];
      if (currBlock && _isTailDestroyed(change, currBlock)) {
        do {
          nextBlockIdx++;
          nextBlock = blocks[nextBlockIdx];
        } while (nextBlock && nextBlock.type === this.SEC_TYPE.GBL); //we should parse the subsequent global block

        if (nextBlock) {
          nextBlockIdx--;
          if (nextBlockIdx === range.removedBlocks.end) {
            // neighbor
            nextBlockIdx++;
          }
          nextBlock = blocks[nextBlockIdx];
          range.endLine = nextBlock.endLine;
          range.endCol = nextBlock.endCol;
        } else {
          // all are global blocks after the current
          range.endLine = this.model.getLineCount() - 1;
          range.endCol = this.model.getColumnCount(range.endLine);
        }
        range.removedBlocks.end = nextBlockIdx;
      }
    }
    if (range.removedBlocks.end >= blocks.length) {
      range.removedBlocks.end = blocks.length - 1;
    }
    if (
      range.removedBlocks.start >= 0 &&
      range.removedBlocks.start < blocks.length
    ) {
      range.removedBlocks.count =
        range.removedBlocks.end - range.removedBlocks.start + 1;
    } else {
      range.removedBlocks.count = 0;
    }

    // collect blocks
    if (blocks.length > 0 && range.removedBlocks.count > 0) {
      range.removedBlocks.blocks = [];
      for (
        var i = range.removedBlocks.start;
        i >= 0 && i <= range.removedBlocks.end;
        i++
      ) {
        range.removedBlocks.blocks.push(blocks[i]);
      }
    }

    //sas.log.info("parseRange:("+range.startLine+","+range.startCol+")-("+range.endLine+","+range.endCol+");blocks:["+range.removedBlocks.start+"-"+range.removedBlocks.end+"]");
    return range;
  };
  this.trimRange_ = function (range) {
    if (range.endLine > this.model.getLineCount()) {
      range.endLine = this.model.getLineCount() - 1;
      if (range.endLine < 0) {
        range.endCol = 0;
      }
    }
    while (range.endCol <= 0) {
      range.endLine--;
      if (range.endLine < 0) {
        range.endLine = 0;
        range.endCol = 0;
        break;
      } else {
        range.endCol = this.model.getColumnCount(range.endLine); //has problem when deleting
      }
    }
  };
  this.start_ = function (change) {
    var parseRange = this.getParseRangeBySections_(change);

    //this.trimRange_(parseRange);
    this._handleTokens(change, parseRange);
    //this._handleStmts(change, parseRange);
    this._handleSections(change, parseRange); // this must be called at last

    this.stack = [{ parse: this.readProg_, state: this.PARSING_STATE.IN_GBL }];
    this.curr = null;
    blockDepth = 0;
    this.sectionCache.splice(
      parseRange.startLine,
      this.sectionCache.length - parseRange.startLine
    );
    this.lexer.startFrom(parseRange.startLine, parseRange.startCol);
    return parseRange;
  };
  this._handleSections = function (change, parseRange) {
    // keep the blocks not changed
    tailSections = sections;
    sections = tailSections.splice(0, parseRange.removedBlocks.start);
    if (parseRange.removedBlocks !== undefined) {
      tailSections.splice(0, parseRange.removedBlocks.count);
    }
    changedColCount = 0;
    if (tailSections.length) {
      var oldCol = tailSections[0].startCol;
      _adjustBlocksCoord(tailSections, change, parseRange);
      changedColCount = tailSections[0].startCol - oldCol;
    }
  };
  this._handleStmts = function (change, parseRange) {
    var parseRange = this._getParseRange(stmts, change);
    //sas.log.info("changed statement:" + parseRange);
  };
  function _getBlkIndex(startSectionIdx, containerName, blocks) {
    var i = startSectionIdx,
      section = sections[i],
      blockIdxs = null;
    while (section && !section[containerName]) {
      i++;
      section = sections[i];
    }
    if (section) {
      blockIdxs = section[containerName];
    }
    return blockIdxs ? blockIdxs[0] : blocks.length;
  }
  function _handleSpecialBlocks(change, parseRange, getBlkIndex, blocks) {
    if (sections.length <= 0 || parseRange.removedBlocks.count <= 0) {
      return;
    }
    var startIdx, endIdx;
    //find start idx
    startIdx = getBlkIndex(parseRange.removedBlocks.start);
    // find end idx
    endIdx = getBlkIndex(parseRange.removedBlocks.end + 1); // must be here

    var unchangedBlocks = blocks;
    blocks = unchangedBlocks.splice(0, startIdx);
    // t1 t2 t3 [] t4 ...
    // no tokens are destroyed if i > end
    // t1 [t2 t3 t4] t5 ...
    // t1 [t2 .....
    // t1 [t2 ...) ti...
    if (unchangedBlocks.length > 0 && endIdx > startIdx) {
      // remove blocks
      unchangedBlocks.splice(0, endIdx - startIdx);

      // adjust token coordinate
      _adjustBlocksCoord(unchangedBlocks, change, parseRange);
    }
    return { blocks: blocks, unchangedBlocks: unchangedBlocks };
  }
  function _getTknBlkIndex(startSectionIdx) {
    return _getBlkIndex(startSectionIdx, "specialBlks", tknBlks);
  }
  this._handleTokens = function (change, parseRange) {
    var ret = _handleSpecialBlocks(
      change,
      parseRange,
      _getTknBlkIndex,
      tknBlks
    );
    if (ret) {
      tknBlks = ret.blocks;
      tailTknBlks = ret.unchangedBlocks;
    }
  };
  function _adjustPosCoord(change, pos) {
    if (pos.line === change.oldRange.end.line) {
      var index = -1,
        col,
        addedCount = change.text.length,
        len1 = change.oldRange.start.column,
        len2 = pos.column - change.oldRange.end.column;

      index = change.text.lastIndexOf("\n");
      if (index >= 0) {
        // multiple lines
        col =
          change.text[change.text.length - 1] === "\n"
            ? len2
            : addedCount - index - 1 + len2;
      } else {
        col = len1 + addedCount + len2;
      }

      pos.column = col;
    } //ignore pos.line <> change.oldRange.end.line

    pos.line +=
      change.newRange.end.line -
      change.newRange.start.line -
      change.oldRange.end.line +
      change.oldRange.start.line;
  }
  var isSection = arrayToMap([
    LexerEx.SEC_TYPE.DATA,
    LexerEx.SEC_TYPE.PROC,
    LexerEx.SEC_TYPE.MACRO,
  ]);
  function _adjustBlocksCoord(blocks, change, parseRange) {
    var len = blocks.length,
      i,
      pos;
    changedLineCount =
      change.newRange.end.line -
      change.newRange.start.line -
      change.oldRange.end.line +
      change.oldRange.start.line;

    for (i = 0; i < len; i++) {
      if (blocks[i].startLine > parseRange.endLine && changedLineCount === 0) {
        break;
      }
      pos = _startPos(blocks[i]);
      _adjustPosCoord(change, pos);
      _setStart(blocks[i], pos);

      pos = _endPos(blocks[i]);
      _adjustPosCoord(change, pos);
      _setEnd(blocks[i], pos);
      // TODO: not very good, folding block end
      if (isSection[blocks[i].type]) {
        pos = _sectionEndPos(blocks[i]);
        _adjustPosCoord(change, pos);
        _setSectionEnd(blocks[i], pos);
      }
    }
  }
  //this.adjustTokenType_ = function(token){//FIX S0891785 : Not all procs color code
  this.setKeyword_ = function (token, isKeyword) {
    //assert(token, "Token must be valid.");
    //assert(SasLexer.isWord[token.type], "Token must be word type.");
    if (isKeyword && token.type === "text") {
      token.type = Lexer.TOKEN_TYPES.KEYWORD;
      token.notCheckKeyword = true;
    }
    return token;
  };
  this.addTknBlock_ = function (block) {
    if (!currSection.specialBlks) {
      //const with quotes, comment, cards data
      currSection.specialBlks = [];
    }
    currSection.specialBlks.push(tknBlks.length);

    tknBlks.push(block);
  };
  this.tryToAddTknBlock_ = function (token) {
    if (token && this.isTokenWithScopeMarks[token.type]) {
      var block = new TknBlock(
        token.start.line,
        token.start.column,
        token.end.line,
        token.end.column,
        token.type,
        this.lexer.getText(token)
      );
      block.sectionIdx = sections.length; //TODO: Improve this
      block.blockComment =
        this.model.getLine(token.start.line)[token.start.column] === "/"
          ? true
          : false;

      this.addTknBlock_(block);
    }
  };
  this.tryToAddCardsBlock_ = function (token) {
    if (token && token.type === Lexer.TOKEN_TYPES.CARDSDATA) {
      var block = new TknBlock(
        token.start.line,
        token.start.column,
        token.end.line,
        token.end.column,
        token.type,
        this.curr.name
      );
      block.sectionIdx = sections.length; //TODO: Improve this

      this.addTknBlock_(block);
    }
  };
  /*this.tryToAddStmtBlock_ = function(token) {
            if (!token) {
                if (!isStmtStart) {
                    this.endStmtBlock_();
                }
                return;
            }
            if (isStmtStart) {
                currStmt.startLine = token.start.line;
                currStmt.startCol = token.start.column;
                isStmtStart = false;
            }
            //TODO: Not always do this
            currStmt.endLine = token.end.line;
            currStmt.endCol = token.end.column;
            if (this.isTokenWithScopeMarks[token.type]) {
                if (!currStmt.specialBlks) {
                    currStmt.specialBlks = [];
                }
                currStmt.specialBlks.push(token);
            }

            if (token.text ===";") {
                this.endStmtBlock_();
            }
        };
        this.endStmtBlock_ = function() {
            isStmtStart = true;
            stmts.push(new StmtBlock(currStmt));
            currStmt.endLine = -1;
        };*/
};

LexerEx.prototype = {
  /*
   * public method definitions
   */
  start: function (oldRange, newRange) {
    this.lookAheadTokens = [];
    return this.start_(oldRange, newRange);
    //this.stack = [{parse:this.readProg_, state:this.PARSING_STATE.IN_GBL}];
    //this.curr = null;
  },
  end: function () {
    return this.lexer.end() && this.lookAheadTokens.length === 0;
  },
  reset: function () {
    this.resetFoldingBlockCache_();
    return this.lexer.reset();
  },
  getNext: function () {
    this.curr = this.stack[this.stack.length - 1];
    var token = this.curr.parse.apply(this);
    this.curr = this.stack[this.stack.length - 1];
    this.tryToAddCardsBlock_(token);
    if (!token || this.end()) {
      var line = this.model.getLineCount() - 1,
        col = line >= 0 ? this.model.getColumnCount(line) : 0;
      this.tryEndFoldingBlock_({ line: line, column: col });
    }
    this.lastToken = token;
    return token;
  },
  /*
   * private method definitions
   */
  getNext_: function () {
    var ret = null;
    if (this.lookAheadTokens.length > 0) {
      ret = this.lookAheadTokens.shift();
    } else {
      var token = this.lexer.getNext();
      ret = token
        ? {
            type: token.type,
            text: token.text,
            start: Object.assign({}, token.start),
            end: Object.assign({}, token.end),
          }
        : token;
    }
    this.tryStop_(ret);
    return ret;
  },
  cacheToken_: function (token) {
    if (token) {
      var cache = {
        type: token.type,
        text: token.text,
        start: Object.assign({}, token.start),
        end: Object.assign({}, token.end),
      };
      this.lookAheadTokens.push(cache);
    }
    return cache;
  },
  prefetch0_: function (pos) {
    // 1, 2, 3,...  not ignore comments
    var next = null;
    if (this.lookAheadTokens.length >= pos) {
      next = this.lookAheadTokens[pos - 1];
    } else {
      var len = pos - this.lookAheadTokens.length;
      for (var i = 0; i < len; i++) {
        next = this.cacheToken_(this.lexer.getNext());
      }
    }
    return next;
  },
  prefetch_: function (it) {
    // it: iterator, it.pos starts from 1, ignore comments
    var next = null;

    do {
      next = this.prefetch0_(it.pos);
      it.pos++;
    } while (next && Lexer.isComment[next.type]);

    return next;
  },
  isNextTokenColon_: function () {
    var nextToken = this.prefetch0_(1);
    if (nextToken) {
      if (nextToken.text === ":") {
        return true;
      }
    }
    return false;
  },
  isStmtEnd_: function (token) {},
  getWord_: function (token) {
    //always uppercase
    return this.lexer.getWord(token).toUpperCase();
  },
  isLabel_: function (token) {
    //ATTENTION: The precondition must be that token is a word, for performance
    var next = this.prefetch_({ pos: 1 });
    return /*SasLexer.isWord[token.type] && */ next && next.text === ":";
  },
  isAssignment_: function (token) {
    if (
      token.text === "PROC" ||
      token.text === "PROCEDURE" ||
      token.text === "DATA" ||
      token.text === "RUN" ||
      token.text === "QUIT"
    ) {
      var next = this.prefetch_({ pos: 1 });
      return next && next.text === "=";
    }
    return false;
  },
  readProg_: function () {
    var word = "",
      gbl = true,
      token = this.getNext_(),
      isLabel,
      isAssignment;

    if (!token) return null;
    if (Lexer.isWord[token.type]) {
      isLabel = this.isLabel_(token);
      isAssignment = this.isAssignment_(token);
      if (!isLabel && !isAssignment) {
        word = token.text;
        switch (word) {
          case "PROC":
          case "PROCEDURE":
            this.startFoldingBlock_(this.SEC_TYPE.PROC, token.start, word);
            token.type = Lexer.TOKEN_TYPES.SKEYWORD;
            var procName = this.handleProcName_();
            this.stack.push({
              parse: this.readProc_,
              state: this.PARSING_STATE.IN_PROC,
              name: procName,
            });
            this.stack.push({
              parse: this.readProcDef_,
              state: this.PARSING_STATE.IN_PROC,
              name: procName,
            });
            gbl = false;
            break;
          case "%MACRO":
            this.startFoldingBlock_(this.SEC_TYPE.MACRO, token.start, word);
            token.type = Lexer.TOKEN_TYPES.MSKEYWORD;
            this.stack.push({
              parse: this.readMacro_,
              state: this.PARSING_STATE.IN_MACRO,
            });
            this.stack.push({
              parse: this.readMacroDef_,
              state: this.PARSING_STATE.IN_MACRO,
            });
            gbl = false;
            break;
          case "DATA":
            this.startFoldingBlock_(this.SEC_TYPE.DATA, token.start, word);
            token.type = Lexer.TOKEN_TYPES.SKEYWORD;
            this.stack.push({
              parse: this.readData_,
              state: this.PARSING_STATE.IN_DATA,
            });
            this.stack.push({
              parse: this.readDataDef_,
              state: this.PARSING_STATE.IN_DATA,
            });
            gbl = false;
            break;
        }
      }
    }

    if (gbl) {
      this.startFoldingBlock_(this.SEC_TYPE.GBL, token.start, word);
      this.stack.push({
        parse: this.readGbl_,
        state: this.PARSING_STATE.IN_GBL,
      });
      if (isLabel) {
        this.stack.push({
          parse: this.readLabel_,
          state: this.PARSING_STATE.IN_GBL,
        });
      } else if (token.type === Lexer.TOKEN_TYPES.MREF) {
        this.handleMref_(this.PARSING_STATE.IN_GBL);
      } else if (!Lexer.isComment[token.type] && token.text !== ";") {
        // not the start of a statement
        var validName = this._cleanKeyword(word);
        var state = {
          parse: this.readGblStmt_,
          state: this.PARSING_STATE.IN_GBL,
          name: validName,
        };
        this.stack.push(state);
        if (
          !isAssignment &&
          Lexer.isWord[token.type] &&
          !this.tryToHandleSectionEnd_(token)
        ) {
          //this.setKeyword_(token, this.langSrv.isStatementKeyword(this._cleanKeyword(word)));
          var obj = this.handleLongStmtName_("", validName);
          state.name = obj.stmtName;
          this.setKeyword_(token, obj.isKeyword);
          state.hasSlashOptionDelimiter = this.langSrv.hasOptionDelimiter(
            "",
            obj.stmtName
          );
        }
      }
    }
    return token;
  },
  stmtWithDatasetOption_: arrayToMap([
    //special
    "DATA/SET",
    "DATA/MERGE",
    "DATA/MODIFY",
    "DATA/UPDATE",
    //These are in IF statement, not SET statement. The syntax files are strange.
    //'CALIS/SET','COMPUTAB/SET','DSTRANS/SET','GENMOD/SET','GLIMMIX/SET','HPNLIN/SET','HPNLMOD/SET','IML/SET','MSMC/SET',
    //'MODEL/SET','NLIN/SET','NLMIXED/SET','OPTMODEL/SET','PHREG/SET','TCALIS/SET',
    "DOCUMENT/IMPORT",
    "JSON/EXPORT",
    "SERVER/ALLOCATE SASFILE",
    //'EXPORT','FSBROWSE','FSEDIT','FSLETTER','FSVIEW','HPSUMMARY','SUMMARY'// define option will be handled correctly as options, ignored here.
  ]),
  OptionCheckers_: {
    "proc-def": {
      getOptionType: function (optName) {
        return this.langSrv.getProcedureOptionType(this.curr.name, optName);
      },
      checkSubOption: function (optName, subOptName) {
        return this.langSrv.isProcedureSubOptKeyword(
          this.curr.name,
          optName,
          subOptName
        );
      },
      checkOption: function (optName) {
        return this.langSrv.isProcedureOptionKeyword(this.curr.name, optName);
      },
    },
    "proc-stmt": {
      getOptionType: function (optName) {
        return this.langSrv.getProcedureStatementOptionType(
          this.curr.procName,
          this.curr.name,
          optName
        );
      },
      checkSubOption: function (optName, subOptName, pos) {
        // pos is the relative position of subOptName to optName
        return (
          this.handleLongStmtSubOptionName_(
            this.curr.procName,
            this.curr.name,
            optName,
            subOptName,
            pos
          ).isKeyword ||
          this.handleLongStmtOptionName_(
            this.curr.procName,
            this.curr.name,
            subOptName,
            pos
          ).isKeyword ||
          (this.stmtWithDatasetOption_[
            this.curr.procName + "/" + this.curr.name
          ]
            ? this.langSrv.isDatasetKeyword(subOptName)
            : false)
        );
        //e.g. proc sql;    create view proclib.jobs(pw=red) as ....
      },
      checkOption: function (optName) {
        var obj = this.handleLongStmtOptionName_(
          this.curr.procName,
          this.curr.name,
          optName
        );
        return obj.isKeyword;
        //return this.langSrv.isProcedureStatementKeyword(this.curr.procName, this.curr.name, optName);
      },
    },
    "data-def": {
      getOptionType: function (optName) {
        return "";
      },
      checkSubOption: function (optName, subOptName) {
        return this.langSrv.isDatasetKeyword(subOptName);
      },
      checkOption: function (optName) {
        return this.langSrv.isProcedureOptionKeyword("DATA", optName);
      },
    },
    "data-stmt": {
      getOptionType: function (optName) {
        return this.langSrv.getProcedureStatementOptionType(
          "DATA",
          this.curr.name,
          optName
        );
      },
      checkSubOption: function (optName, subOptName) {
        var isKeyword = this.langSrv.isProcedureStatementSubOptKeyword(
          "DATA",
          this.curr.name,
          optName,
          subOptName
        );
        if (!isKeyword) {
          if (this.stmtWithDatasetOption_["DATA/" + this.curr.name]) {
            isKeyword = this.langSrv.isDatasetKeyword(subOptName);
          }
        }
        return isKeyword;
      },
      checkOption: function (optName) {
        return this.langSrv.isProcedureStatementKeyword(
          "DATA",
          this.curr.name,
          optName
        );
      },
    },
    "macro-def": {
      getOptionType: function (optName) {
        return this.langSrv.getProcedureOptionType("MACRO", optName);
      },
      checkSubOption: function (optName, subOptName) {
        return this.langSrv.isProcedureSubOptKeyword(
          "MACRO",
          optName,
          subOptName
        );
      },
      checkOption: function (optName) {
        return this.langSrv.isProcedureOptionKeyword("MACRO", optName);
      },
    },
    "macro-stmt": {
      getOptionType: function (optName) {
        return this.langSrv.getProcedureStatementOptionType(
          "MACRO",
          this.curr.name,
          optName
        );
      },
      checkSubOption: function (optName, subOptName) {
        return this.langSrv.isProcedureStatementSubOptKeyword(
          "MACRO",
          this.curr.name,
          optName,
          subOptName
        );
      },
      checkOption: function (optName) {
        return this.langSrv.isProcedureStatementKeyword(
          "MACRO",
          this.curr.name,
          optName
        );
      },
    },
    "gbl-stmt": {
      getOptionType: function (optName) {
        return this.langSrv.getStatementOptionType(
          this._cleanKeyword(this.curr.name),
          optName
        );
      },
      checkSubOption: function (optName, subOptName) {
        return this.langSrv.isStatementSubOptKeyword(
          this._cleanKeyword(this.curr.name),
          optName,
          subOptName
        );
      },
      checkOption: function (optName) {
        var isGlobal = this.langSrv.isStatementKeyword(
          "global",
          this._cleanKeyword(this.curr.name),
          optName
        );
        if (!isGlobal) {
          return this.langSrv.isStatementKeyword(
            "standalone",
            this._cleanKeyword(this.curr.name),
            optName
          );
        }
        return isGlobal;
      },
    },
    "sg-def": {
      // statgraph
      getOptionType: function (optName) {
        return this.langSrv.getProcedureStatementOptionType(
          "TEMPLATE",
          "BEGINGRAPH",
          optName
        );
      },
      checkSubOption: function (optName, subOptName) {
        return this.langSrv.isProcedureStatementSubOptKeyword(
          "TEMPLATE",
          "BEGINGRAPH",
          optName,
          subOptName
        );
      },
      checkOption: function (optName) {
        return this.langSrv.isProcedureStatementKeyword(
          "TEMPLATE",
          "BEGINGRAPH",
          optName
        );
      },
    },
    "sg-stmt": {
      getOptionType: function (optName) {
        return this.langSrv.getProcedureStatementOptionType(
          "STATGRAPH",
          this.curr.name,
          optName
        );
      },
      checkSubOption: function (optName, subOptName) {
        return this.langSrv.isProcedureStatementSubOptKeyword(
          "STATGRAPH",
          this.curr.name,
          optName,
          subOptName
        );
      },
      checkOption: function (optName) {
        return this.langSrv.isProcedureStatementKeyword(
          "STATGRAPH",
          this.curr.name,
          optName
        );
      },
    },
    "dt-def": {
      // dt = define tagset
      getOptionType: function (optName) {
        return this.langSrv.getProcedureStatementOptionType(
          "TEMPLATE",
          "DEFINE TAGSET",
          optName
        );
      },
      checkSubOption: function (optName, subOptName) {
        return this.langSrv.isProcedureStatementSubOptKeyword(
          "TEMPLATE",
          this.curr.name,
          optName,
          subOptName
        );
      },
      checkOption: function (optName) {
        return this.langSrv.isProcedureStatementKeyword(
          "TEMPLATE",
          "DEFINE TAGSET",
          optName
        );
      },
    },
    "dt-stmt": {
      getOptionType: function (optName) {
        return this.langSrv.getProcedureStatementOptionType(
          "DEFINE_TAGSET",
          this.curr.name,
          optName
        );
      },
      checkSubOption: function (optName, subOptName) {
        return this.langSrv.isProcedureStatementSubOptKeyword(
          "DEFINE_TAGSET",
          this.curr.name,
          optName,
          subOptName
        );
      },
      checkOption: function (optName) {
        return this.langSrv.isProcedureStatementKeyword(
          "DEFINE_TAGSET",
          this.curr.name,
          optName
        );
      },
    },
    "de-def": {
      // de = define event
      getOptionType: function (optName) {
        return this.langSrv.getProcedureStatementOptionType(
          "TEMPLATE",
          "DEFINE EVENT",
          optName
        );
      },
      checkSubOption: function (optName, subOptName) {
        return this.langSrv.isProcedureStatementSubOptKeyword(
          "TEMPLATE",
          "DEFINE EVENT",
          optName,
          subOptName
        );
      },
      checkOption: function (optName) {
        return this.langSrv.isProcedureStatementKeyword(
          "TEMPLATE",
          "DEFINE EVENT",
          optName
        );
      },
    },
    "de-stmt": {
      getOptionType: function (optName) {
        return this.langSrv.getProcedureStatementOptionType(
          "DEFINE_EVENT",
          this.curr.name,
          optName
        );
      },
      checkSubOption: function (optName, subOptName) {
        return this.langSrv.isProcedureStatementSubOptKeyword(
          "DEFINE_EVENT",
          this.curr.name,
          optName,
          subOptName
        );
      },
      checkOption: function (optName) {
        return this.langSrv.isProcedureStatementKeyword(
          "DEFINE_EVENT",
          this.curr.name,
          optName
        );
      },
    },
  },
  handleProcName_: function () {
    var token = this.prefetch_({ pos: 1 }),
      name = "";
    if (token) {
      name = token.text;
      token.type = Lexer.TOKEN_TYPES.PROCNAME; // procedure name
      token.notCheckKeyword = true;
    }
    return name;
  },
  readProcDef_: function () {
    return this.handleStatement_(this.OptionCheckers_["proc-def"]);
  },
  readDataDef_: function () {
    return this.handleStatement_(this.OptionCheckers_["data-def"]);
  },
  readMacroDef_: function () {
    return this.handleStatement_(this.OptionCheckers_["macro-def"]);
  },
  handleODSStmt_: function (token) {
    var isKeyword = false,
      currName = token.text;
    var procName = "ODS",
      stmtName = procName;

    if (this.curr.fullName === undefined) {
      var obj = this.handleLongStmtName_(procName, stmtName + " " + currName); //e.g. ODS CHTML
      if (obj.stmtNameLen === 1 && !obj.isKeyword) {
        // try it in general statments
        this.curr.fullName = stmtName;
        isKeyword = this.langSrv._isStatementKeyword(stmtName, currName);
      } else {
        this.curr.fullName = obj.stmtName;
        isKeyword = obj.isKeyword;
      }
    } else {
      if (this.curr.fullName === this.curr.name) {
        // "ODS"
        isKeyword = this.langSrv._isStatementKeyword(stmtName, currName);
      } else {
        isKeyword = this.langSrv.isProcedureStatementKeyword(
          procName,
          this.curr.fullName,
          currName
        );
      }
    }
    this.setKeyword_(token, isKeyword);

    return isKeyword;
  },
  handleLongStmtName_: function (procName, startWord) {
    var isKeyword = false,
      name1 = startWord,
      name2 = null,
      name3 = null,
      name4 = null,
      next1,
      next2,
      next3,
      stmtNameLen = 1,
      fullStmtName = name1,
      it = { pos: 1 };

    next1 = this.prefetch_(it);
    if (next1 && Lexer.isWord[next1.type]) {
      name2 = name1 + " " + next1.text; // the keyword has 2 words
      next2 = this.prefetch_(it);
      if (next2 && Lexer.isWord[next2.type]) {
        name3 = name2 + " " + next2.text; // the keyword has 3 words
        next3 = this.prefetch_(it);
        if (next3 && Lexer.isWord[next3.type]) {
          name4 = name3 + " " + next3.text;
        }
      }
    }

    if (name4) {
      isKeyword = this.langSrv.isProcedureStatementKeyword(procName, name4);
      if (isKeyword) {
        stmtNameLen = 4;
        fullStmtName = name4;
        this.setKeyword_(next1, true);
        this.setKeyword_(next2, true);
        this.setKeyword_(next3, true);
      }
    }
    if (!isKeyword && name3) {
      isKeyword = this.langSrv.isProcedureStatementKeyword(procName, name3);
      if (isKeyword) {
        stmtNameLen = 3;
        fullStmtName = name3;
        this.setKeyword_(next1, true);
        this.setKeyword_(next2, true);
      }
    }
    if (!isKeyword && name2) {
      isKeyword = this.langSrv.isProcedureStatementKeyword(procName, name2);
      if (isKeyword) {
        stmtNameLen = 2;
        fullStmtName = name2;
        this.setKeyword_(next1, true);
      }
    }
    if (!isKeyword) {
      isKeyword = this.langSrv.isProcedureStatementKeyword(procName, name1);
    }
    return {
      isKeyword: isKeyword,
      stmtName: fullStmtName,
      stmtNameLen: stmtNameLen,
    };
  },
  handleLongStmtOptionName_: function (procName, stmtName, startWord, pos) {
    var context = {
      procName: procName,
      stmtName: stmtName,
      startWord: startWord,
      pos: pos,
      checkKeyword: function (context, name) {
        return this.langSrv.isProcedureStatementKeyword(
          context.procName,
          context.stmtName,
          name
        );
      },
    };
    return this.handleLongOptionName_(context);
  },
  handleLongStmtSubOptionName_: function (
    procName,
    stmtName,
    optName,
    startWord,
    pos
  ) {
    var context = {
      procName: procName,
      stmtName: stmtName,
      optName: optName,
      startWord: startWord,
      pos: pos,
      checkKeyword: function (context, name) {
        return this.langSrv.isProcedureStatementSubOptKeyword(
          context.procName,
          context.stmtName,
          context.optName,
          name
        );
      },
    };
    return this.handleLongOptionName_(context);
  },
  //TODO: The pos argument looks ugly. pos is the offest of startWord from the current token in the state machine
  handleLongOptionName_: function (context) {
    //procName, stmtName, startWord, cb, pos
    var isKeyword = false,
      name1 = context.startWord,
      name2 = null, // longest option names generally include two word, and only occur in Statement Options
      next,
      nameLen = 1,
      fullName = name1,
      it = { pos: 1 }; //option names with 3 words are special situation, they can be covered, so we may ignore them.

    if (context.pos) {
      it.pos = context.pos + 1;
    }
    next = this.prefetch_(it);
    if (next && Lexer.isWord[next.type]) {
      name2 = name1 + " " + next.text; // The keyword has 2 words
    }

    if (name2) {
      isKeyword = context.checkKeyword.call(this, context, name2);
      if (isKeyword) {
        nameLen = 2;
        this.setKeyword_(next, true);
        fullName = name2;
      }
    }
    if (!isKeyword) {
      isKeyword = context.checkKeyword.call(this, context, name1);
    }
    return {
      isKeyword: isKeyword,
      name: fullName,
      nameLen: nameLen,
    };
  },
  sectionEndStmts_: {
    RUN: 1,
    "RUN CANCEL": 1,
    QUIT: 1,
  },
  tryToHandleSectionEnd_: function (token) {
    var ret = false;
    if (this.sectionEndStmts_[token.text]) {
      token.type = Lexer.TOKEN_TYPES.SKEYWORD;
      var next = this.prefetch_({ pos: 1 });
      if (next && next.text === "CANCEL") {
        next.type = Lexer.TOKEN_TYPES.SKEYWORD;
      }
      ret = true;
    }
    return ret;
  },
  tryToHandleExpr_: function (token, optChecker) {
    if (this.curr.exprTokenCount) {
      // 1, 2, ...
      token.notCheckKeyword = true;
      //this.curr.exprTokenCount--;

      this.curr.exprTokenIndex++;
      if (this.curr.exprTokenIndex > this.curr.exprTokenCount) {
        this.curr.exprTokenCount = 0;
        token.notCheckKeyword = false;
      }
    }
    if (!this.curr.exprTokenCount) {
      var needToHandleExpr = false,
        startPos = 0;
      if (Lexer.isWord[token.type]) {
        var next = this.prefetch_({ pos: 1 }),
          exprBeg = { "=": 1, "(": 1 };
        if (next && exprBeg[next.text]) {
          if (next.text === "=") {
            startPos = 1;
          }
          needToHandleExpr = true;
        }
        if (next && next.text === "(") {
          if (this.langSrv.isSasFunction(token.text)) {
            this.setKeyword_(token, true);
          }
        }
      } else if (token.text === "=") {
        needToHandleExpr = true;
      }
      if (needToHandleExpr) {
        var self = this;
        var ret = this.expr.parse(
          this.curr.hasSlashOptionDelimiter,
          startPos,
          function (subOptToken, pos) {
            var type = optChecker.getOptionType.call(self, token.text) || "",
              isKeyword;
            if (self.langSrv.isDataSetType(type)) {
              isKeyword = self.langSrv.isDatasetKeyword(subOptToken.text);
            } else {
              isKeyword = optChecker.checkSubOption.call(
                self,
                token.text,
                subOptToken.text,
                pos
              );
            }
            self.setKeyword_(subOptToken, isKeyword);
          }
        );
        this.curr.exprTokenCount = ret.pos;
        this.curr.exprTokenIndex = 0;
      }
    }
  },
  readGblStmt_: function () {
    return this.handleStatement_(this.OptionCheckers_["gbl-stmt"]);
  },
  specialStmts_: {
    "DATASETS/IC CREATE": 1,
    "TRANSREG/MODEL": 1, //HTMLCOMMONS-3829
  },
  readProcStmt_: function () {
    var token = this.handleStatement_(this.OptionCheckers_["proc-stmt"]);
    if (
      token &&
      Lexer.isWord[token.type] &&
      this.specialStmts_[this.curr.procName + "/" + this.curr.name]
    ) {
      //A ugly but simple way to handle this condition :)
      var isKeyword = false;
      //TODO: Imrove this
      if (this.curr.optNameLen !== undefined && this.curr.optNameLen > 1) {
        isKeyword = true;
        this.curr.optNameLen--;
      } else {
        var obj = this.handleLongStmtOptionName_(
          this.curr.procName,
          this.curr.name,
          token.text
        );
        this.curr.optNameLen = obj.nameLen;
        isKeyword = obj.isKeyword;
      }

      this.setKeyword_(token, isKeyword);
    }
    return token;
  },
  readDataStmt_: function () {
    return this.handleStatement_(this.OptionCheckers_["data-stmt"]);
  },
  readMacroStmt_: function () {
    return this.handleStatement_(this.OptionCheckers_["macro-stmt"]);
  },
  popSMTo_: function (level) {
    // SM = state machine, level = 1, 2, 3...
    var deep = this.stack.length - level;
    while (deep > 0) {
      this.stack.pop();
      deep--;
    }
  },
  handleBlock_: function (fn) {
    var word = "",
      token = this.getNext_();
    if (!token) return null;

    if (Lexer.isWord[token.type]) {
      if (this.isLabel_()) {
        this.stack.push({
          parse: this.readLabel_,
          state: this.PARSING_STATE.IN_PROC,
        });
      } else if (this.isAssignment_(token)) {
        fn.call(this, token);
      } else {
        word = token.text;
        switch (word) {
          case "RUN":
          case "QUIT":
            token.type = Lexer.TOKEN_TYPES.SKEYWORD;
            this.popSMTo_(2);
            this.stack.push({
              parse: this.readEnd_,
              state: this.PARSING_STATE.IN_PROC,
              start: token,
              name: word,
            });
            break;
          case "PROC":
          case "PROCEDURE":
            this.endFoldingBlock_(this.SEC_TYPE.PROC, this.lastToken.end);
            this.startFoldingBlock_(this.SEC_TYPE.PROC, token.start, word);
            token.type = Lexer.TOKEN_TYPES.SKEYWORD;
            this.popSMTo_(1);
            var procName = this.handleProcName_();
            this.stack.push({
              parse: this.readProc_,
              state: this.PARSING_STATE.IN_PROC,
              name: procName,
            });
            this.stack.push({
              parse: this.readProcDef_,
              state: this.PARSING_STATE.IN_PROC,
              name: procName,
            });
            break;
          case "DATA":
            this.endFoldingBlock_(this.SEC_TYPE.PROC, this.lastToken.end);
            this.startFoldingBlock_(this.SEC_TYPE.DATA, token.start, word);
            token.type = Lexer.TOKEN_TYPES.SKEYWORD;
            this.popSMTo_(1);
            this.stack.push({
              parse: this.readData_,
              state: this.PARSING_STATE.IN_DATA,
            });
            this.stack.push({
              parse: this.readDataDef_,
              state: this.PARSING_STATE.IN_DATA,
            });
            break;
          case "%MACRO":
            this.endFoldingBlock_(this.SEC_TYPE.PROC, this.lastToken.end);
            this.startFoldingBlock_(this.SEC_TYPE.MACRO, token.start, word);
            token.type = Lexer.TOKEN_TYPES.MSKEYWORD;
            this.popSMTo_(1);
            this.stack.push({
              parse: this.readMacro_,
              state: this.PARSING_STATE.IN_MACRO,
            });
            this.stack.push({
              parse: this.readMacroDef_,
              state: this.PARSING_STATE.IN_MACRO,
            });
            break;
          default:
            fn.call(this, token);
        }
      }
    }
    return token;
  },
  /*
      OptionInforVisitor {
          getOptionType: function(optName){},
          checkSubOption: function(optName, subOptName){}
      }
    */
  handleStatement_: function (optChecker) {
    var token = this.getNext_();
    if (token) {
      this.tryToHandleExpr_(token, optChecker);

      if (token.text === ";") {
        //statement ends
        this.stack.pop();
      } else if (Lexer.isWord[token.type] && !token.notCheckKeyword) {
        if (this.curr.name === "ODS") {
          this.handleODSStmt_(token);
        } else {
          if (optChecker.checkOption) {
            this.setKeyword_(
              token,
              optChecker.checkOption.call(this, token.text)
            );
          }
        }
      }
    }
    return token;
  },
  handleEnd_: function () {
    var token = this.getNext_();
    if (token && token.text === ";") {
      this.stack.pop();
      this.stack.pop();
    }
    return token;
  },
  handleMref_: function (state) {
    var next = this.prefetch_({ pos: 1 });
    if (next && next.text === "(") {
      this.stack.push({ parse: this.readMRef_, state: state });
    }
  },
  readLabel_: function () {
    var token = this.getNext_();
    if (token && token.text === ":") {
      this.stack.pop();
    }
    return token;
  },
  readMRef_: function () {
    var token = this.getNext_();
    if (token && token.text === ")") {
      this.stack.pop();
    } else {
      var next = this.prefetch_({ pos: 1 });
      if (next && next.text === "(") {
        this.stack.push(this.curr);
      }
    }
    return token;
  },
  readComment_: function () {
    //ignore
  },
  readStatGraph_: function () {
    return this.handleBlock_(function (token) {
      if (token.text === "ENDGRAPH") {
        this.setKeyword_(token, true);
        this.stack.push({
          parse: this.readStatGraphEnd_,
          state: this.PARSING_STATE.IN_PROC,
          start: token,
          name: token.text,
        });
      } else {
        var state = {
          parse: this.readStatGraphStmt_,
          state: this.PARSING_STATE.IN_PROC,
          name: token.text,
        };
        this.stack.push(state);
        var next = null,
          isKeyword = this.langSrv.isProcedureStatementKeyword(
            "STATGRAPH",
            this._cleanKeyword(token.text)
          );
        if (!isKeyword) {
          next = this.prefetch_({ pos: 1 });
          if (next) {
            var word = token.text + " " + next.text;
            isKeyword = this.langSrv.isProcedureStatementKeyword(
              "STATGRAPH",
              word
            );
            if (isKeyword) {
              state.name = word;
              this.setKeyword_(next, true);
            }
          }
        }
        this.setKeyword_(token, isKeyword);
      }
    });
  },
  readStatGraphDef_: function () {
    return this.handleStatement_(this.OptionCheckers_["sg-def"]);
  },
  readStatGraphStmt_: function () {
    return this.handleStatement_(this.OptionCheckers_["sg-stmt"]);
  },
  readStatGraphEnd_: function () {
    return this.handleEnd_();
  },
  readDefineTagset_: function () {
    return this.handleBlock_(function (token) {
      var word = token.text;
      if (token.text === "END") {
        this.setKeyword_(token, true);
        this.stack.push({
          parse: this.readDefineTagsetEnd_,
          state: this.PARSING_STATE.IN_PROC,
          start: token,
          name: word,
        });
      } else {
        var generalTagsetStmt = true;
        var next = this.prefetch_({ pos: 1 });

        if (next) {
          var fullName = word + " " + next.text;
          if (fullName === "DEFINE EVENT") {
            this.stack.push({
              parse: this.readDefineEvent_,
              state: this.PARSING_STATE.IN_PROC,
              name: fullName,
            });
            this.stack.push({
              parse: this.readDefineEventDef_,
              state: this.PARSING_STATE.IN_PROC,
              name: fullName,
            });
            generalTagsetStmt = false;
            this.setKeyword_(next, true);
            this.setKeyword_(token, true);
          }
        }

        if (generalTagsetStmt) {
          var state = {
            parse: this.readDefineTagsetStmt_,
            state: this.PARSING_STATE.IN_PROC,
            name: word,
          };
          this.stack.push(state);
          // keyword checking
          var isKeyword = this.langSrv.isProcedureStatementKeyword(
            "DEFINE_TAGSET",
            this._cleanKeyword(word)
          );
          if (!isKeyword) {
            if (next) {
              word += " " + next.text;
              isKeyword = this.langSrv.isProcedureStatementKeyword(
                "DEFINE_TAGSET",
                word
              );
              if (isKeyword) {
                state.name = word;
                this.setKeyword_(next, true);
              }
            }
          }
          this.setKeyword_(token, isKeyword);
        }
      }
    });
  },
  readDefineTagsetDef_: function () {
    return this.handleStatement_(this.OptionCheckers_["dt-def"]);
  },
  readDefineTagsetStmt_: function () {
    return this.handleStatement_(this.OptionCheckers_["dt-stmt"]);
  },
  readDefineTagsetEnd_: function () {
    return this.handleEnd_();
  },
  readDefineEvent_: function () {
    return this.handleBlock_(function (token) {
      var word = token.text;
      if (word === "END") {
        this.setKeyword_(token, true);
        this.stack.push({
          parse: this.readDefineEventEnd_,
          state: this.PARSING_STATE.IN_PROC,
          start: token,
          name: word,
        });
      } else {
        var state = {
          parse: this.readDefineEventStmt_,
          state: this.PARSING_STATE.IN_PROC,
          name: word,
        };
        this.stack.push(state);
        var next = null,
          isKeyword = this.langSrv.isProcedureStatementKeyword(
            "DEFINE_EVENT",
            this._cleanKeyword(word)
          );
        if (!isKeyword) {
          next = this.prefetch_({ pos: 1 });
          if (next) {
            word += " " + next.text;
            isKeyword = this.langSrv.isProcedureStatementKeyword(
              "DEFINE_EVENT",
              word
            );
            if (isKeyword) {
              this.setKeyword_(next, true);
              state.name = word;
            }
          }
        }
        this.setKeyword_(token, isKeyword);
      }
    });
  },
  readDefineEventDef_: function () {
    return this.handleStatement_(this.OptionCheckers_["de-def"]);
  },
  readDefineEventStmt_: function () {
    return this.handleStatement_(this.OptionCheckers_["de-stmt"]);
  },
  readDefineEventEnd_: function () {
    return this.handleEnd_();
  },
  /*            readProc_
         *  DATA, %MACRO ----> pop + push
         PROC ----> ignore
         *
         */
  DS2_: {
    DS2: 1,
    HPDS2: 1,
  },

  readProc_: function () {
    var word = "",
      token = this.getNext_(),
      procName = this.curr.name || "";

    if (!token) return;

    if (Lexer.isWord[token.type]) {
      if (this.isLabel_()) {
        this.stack.push({
          parse: this.readLabel_,
          state: this.PARSING_STATE.IN_PROC,
        });
      } else if (this.isAssignment_(token)) {
        var validName = this._cleanKeyword(word);
        this.stack.push({
          parse: this.readProcStmt_,
          state: this.PARSING_STATE.IN_PROC,
          name: validName,
          procName: procName,
        });
      } else {
        word = token.text;
        switch (word) {
          case this.langSrv.isInteractiveProc(procName) ? "QUIT" : "RUN":
          case "QUIT":
            //normal section end
            token.type = Lexer.TOKEN_TYPES.SKEYWORD;
            this.stack.push({
              parse: this.readEnd_,
              state: this.PARSING_STATE.IN_PROC,
              start: token,
              name: word,
            });
            break;
          case "%MEND":
            //error:
            token.type = Lexer.TOKEN_TYPES.MSKEYWORD;
            if (
              this.stack.length > 2 &&
              this.stack[this.stack.length - 2].state ===
                this.PARSING_STATE.IN_MACRO
            ) {
              this.endFoldingBlock_(this.SEC_TYPE.PROC, this.lastToken.end); // end this proc
              this.stack.pop();
              this.stack.push({
                parse: this.readMend_,
                state: this.PARSING_STATE.IN_MACRO,
                start: token,
                name: word,
              });
            }
            //this.stack.push({parse:this.readMend_, state:this.PARSING_STATE.IN_MACRO});
            break;
          case "PROC":
          case "PROCEDURE":
            //no normal end, and another proc meet, there are syntax errors
            // ignore
            this.endFoldingBlock_(this.SEC_TYPE.PROC, this.lastToken.end);
            this.startFoldingBlock_(this.SEC_TYPE.PROC, token.start, word);

            token.type = Lexer.TOKEN_TYPES.SKEYWORD;
            this.stack.pop();
            procName = this.handleProcName_();
            this.stack.push({
              parse: this.readProc_,
              state: this.PARSING_STATE.IN_PROC,
              name: procName,
            });
            this.stack.push({
              parse: this.readProcDef_,
              state: this.PARSING_STATE.IN_PROC,
              name: procName,
            });
            break;
          case "%MACRO":
            this.endFoldingBlock_(this.SEC_TYPE.PROC, this.lastToken.end);
            this.startFoldingBlock_(this.SEC_TYPE.MACRO, token.start, word);

            token.type = Lexer.TOKEN_TYPES.MSKEYWORD;
            this.stack.pop();
            this.stack.push({
              parse: this.readMacro_,
              state: this.PARSING_STATE.IN_MACRO,
            });
            this.stack.push({
              parse: this.readMacroDef_,
              state: this.PARSING_STATE.IN_MACRO,
            });
            break;
          case "DATA":
            if (!this.DS2_[procName]) {
              this.endFoldingBlock_(this.SEC_TYPE.PROC, this.lastToken.end);
              this.startFoldingBlock_(this.SEC_TYPE.DATA, token.start, word);

              token.type = Lexer.TOKEN_TYPES.SKEYWORD;
              this.stack.pop();
              this.stack.push({
                parse: this.readData_,
                state: this.PARSING_STATE.IN_DATA,
              });
              this.stack.push({
                parse: this.readDataDef_,
                state: this.PARSING_STATE.IN_DATA,
              });
              break;
            } // not break
          default:
            this.tryToHandleSectionEnd_(token);
            var generalProcStmt = true;
            if (procName === "TEMPLATE") {
              if (word === "BEGINGRAPH") {
                this.stack.push({
                  parse: this.readStatGraph_,
                  state: this.PARSING_STATE.IN_PROC,
                });
                this.stack.push({
                  parse: this.readStatGraphDef_,
                  state: this.PARSING_STATE.IN_PROC,
                });
                this.setKeyword_(token, true);
                generalProcStmt = false;
              } else {
                var next = this.prefetch_({ pos: 1 });
                if (next && next.text === "TAGSET" && word === "DEFINE") {
                  this.stack.push({
                    parse: this.readDefineTagset_,
                    state: this.PARSING_STATE.IN_PROC,
                  });
                  this.stack.push({
                    parse: this.readDefineTagsetDef_,
                    state: this.PARSING_STATE.IN_PROC,
                  });
                  this.setKeyword_(next, true);
                  this.setKeyword_(token, true);
                  generalProcStmt = false;
                }
              }
            } else if (procName === "EXPLODE") {
              // TODO: we must modify block merging algorithm to support this.
              if (Lexer.isParmcards[word]) {
                this.cardsState = this.CARDS_STATE.IN_CMD;
                this.stack.push({
                  parse: this.readCards_,
                  state: this.PARSING_STATE.IN_DATA,
                  name: word,
                  token: token,
                });
                this.setKeyword_(token, true);
                generalProcStmt = false;
              }
            } else if (token.type === Lexer.TOKEN_TYPES.MREF) {
              this.handleMref_(this.PARSING_STATE.IN_PROC);
              generalProcStmt = false;
            }
            if (generalProcStmt) {
              var validName = this._cleanKeyword(word);
              var state = {
                parse: this.readProcStmt_,
                state: this.PARSING_STATE.IN_PROC,
                name: validName,
                procName: procName,
              };
              this.stack.push(state);
              var obj = this.handleLongStmtName_(procName, validName);
              state.name = obj.stmtName;
              this.setKeyword_(token, obj.isKeyword);
              state.hasSlashOptionDelimiter = this.langSrv.hasOptionDelimiter(
                procName,
                obj.stmtName
              );
            }
        }
      }
    }
    return token;
  },
  hasRunCancelFollowed_: function () {
    var next1,
      next2,
      ret = false,
      it = { pos: 1 };
    do {
      next1 = this.prefetch_(it);
    } while (next1 && next1.text !== ";");
    if (next1) {
      next1 = this.prefetch_(it);
      next2 = this.prefetch_(it);

      if (next1 && next2) {
        if (Lexer.isWord[next1.type] && next2.text === ":") {
          // label
          next1 = this.prefetch_(it);
          next2 = this.prefetch_(it);
        }
        if (next1 && next2 && next1.text === "RUN" && next2.text === "CANCEL") {
          ret = true;
        }
      }
    }
    return ret;
  },
  /*
   *              readData_
   *  %MACRO, PROC  ----> pop + push
   *           DATA ----> ignore
   */
  readData_: function () {
    var word = "",
      token = this.getNext_();

    if (!token) return;

    if (Lexer.isWord[token.type]) {
      if (this.isLabel_()) {
        this.stack.push({
          parse: this.readLabel_,
          state: this.PARSING_STATE.IN_DATA,
        });
      } else if (this.isAssignment_(token)) {
        var validName = this._cleanKeyword(word);
        this.stack.push({
          parse: this.readDataStmt_,
          state: this.PARSING_STATE.IN_DATA,
          name: validName,
        });
      } else {
        word = token.text;
        switch (word) {
          case "%MEND":
            //error
            token.type = Lexer.TOKEN_TYPES.MSKEYWORD;
            if (
              this.stack.length > 2 &&
              this.stack[this.stack.length - 2].state ===
                this.PARSING_STATE.IN_MACRO
            ) {
              this.endFoldingBlock_(this.SEC_TYPE.DATA, this.lastToken.end); // end this data section
              this.stack.pop();
              this.stack.push({
                parse: this.readMend_,
                state: this.PARSING_STATE.IN_MACRO,
                start: token,
                name: word,
              });
            }
            //this.stack.push({parse:this.readMend_, state:this.PARSING_STATE.IN_DATA});
            break;
          case "DATA":
            //no normal end, and another data meet, there are syntax errors
            // ignore
            this.endFoldingBlock_(this.SEC_TYPE.DATA, this.lastToken.end);
            this.startFoldingBlock_(this.SEC_TYPE.DATA, token.start, word);

            token.type = Lexer.TOKEN_TYPES.SKEYWORD;
            this.stack.push({
              parse: this.readDataDef_,
              state: this.PARSING_STATE.IN_DATA,
            });
            break;
          case "PROC":
          case "PROCEDURE":
            this.endFoldingBlock_(this.SEC_TYPE.DATA, this.lastToken.end);
            this.startFoldingBlock_(this.SEC_TYPE.PROC, token.start, word);

            token.type = Lexer.TOKEN_TYPES.SKEYWORD;
            this.stack.pop(); //end data section
            var procName = this.handleProcName_();
            this.stack.push({
              parse: this.readProc_,
              state: this.PARSING_STATE.IN_PROC,
              name: procName,
            });
            this.stack.push({
              parse: this.readProcDef_,
              state: this.PARSING_STATE.IN_PROC,
              name: procName,
            });
            break;
          case "%MACRO":
            this.endFoldingBlock_(this.SEC_TYPE.DATA, this.lastToken.end);
            this.startFoldingBlock_(this.SEC_TYPE.MACRO, token.start, word);

            token.type = Lexer.TOKEN_TYPES.MSKEYWORD;
            this.stack.pop(); //end data section
            this.stack.push({
              parse: this.readMacro_,
              state: this.PARSING_STATE.IN_MACRO,
            });
            this.stack.push({
              parse: this.readMacroDef_,
              state: this.PARSING_STATE.IN_MACRO,
            });
            break;
          case "RUN":
          case "QUIT":
            //normal section end
            token.type = Lexer.TOKEN_TYPES.SKEYWORD;
            if (!this.hasRunCancelFollowed_()) {
              this.tryToHandleSectionEnd_(token);
              this.stack.push({
                parse: this.readEnd_,
                state: this.PARSING_STATE.IN_DATA,
                start: token,
                name: word,
              });
              break;
            } // attention: not break here
          default:
            if (Lexer.isCards[word]) {
              this.cardsState = this.CARDS_STATE.IN_CMD;
              this.stack.push({
                parse: this.readCards_,
                state: this.PARSING_STATE.IN_DATA,
                name: word,
                token: token,
              });
              this.setKeyword_(
                token,
                this.langSrv.isProcedureStatementKeyword("DATA", word)
              );
            } else if (token.type === Lexer.TOKEN_TYPES.MREF) {
              this.handleMref_(this.PARSING_STATE.IN_DATA);
            } else {
              //handle the statements in data section
              var validName = this._cleanKeyword(word);
              var state = {
                parse: this.readDataStmt_,
                state: this.PARSING_STATE.IN_DATA,
                name: validName,
              };
              this.stack.push(state);
              if (!this.tryToHandleSectionEnd_(token)) {
                //this.setKeyword_(token, this.langSrv.isProcedureStatementKeyword("DATA", validName));
                var obj = this.handleLongStmtName_("DATA", validName);
                state.name = obj.stmtName;
                this.setKeyword_(token, obj.isKeyword);
                state.hasSlashOptionDelimiter = this.langSrv.hasOptionDelimiter(
                  "DATA",
                  obj.stmtName
                );
              }
            }
        }
      }
    }
    return token;
  },
  /*
   *            readMacro_
   *  PROC, DATA %MACRO -----> ignore
   */
  readMacro_: function () {
    var word = "",
      token = this.getNext_();

    if (!token) return;

    if (Lexer.isWord[token.type]) {
      if (this.isLabel_()) {
        this.stack.push({
          parse: this.readLabel_,
          state: this.PARSING_STATE.IN_MACRO,
        });
      } else if (this.isAssignment_(token)) {
        var validName = this._cleanKeyword(word);
        this.stack.push({
          parse: this.readMacroStmt_,
          state: this.PARSING_STATE.IN_MACRO,
          name: validName,
        });
      } else {
        word = token.text;
        switch (word) {
          case "%MEND":
            //normal section end
            token.type = Lexer.TOKEN_TYPES.MSKEYWORD;
            this.stack.push({
              parse: this.readMend_,
              state: this.PARSING_STATE.IN_MACRO,
              start: token,
              name: word,
            });
            break;
          case "%MACRO":
            //no normal end, and another proc meet, there are syntax errors
            // ignore
            this.startFoldingBlock_(this.SEC_TYPE.MACRO, token.start, word);
            token.type = Lexer.TOKEN_TYPES.MSKEYWORD;
            this.stack.push({
              parse: this.readMacro_,
              state: this.PARSING_STATE.IN_MACRO,
            });
            this.stack.push({
              parse: this.readMacroDef_,
              state: this.PARSING_STATE.IN_MACRO,
            });
            break;
          case "PROC":
          case "PROCEDURE":
            this.startFoldingBlock_(this.SEC_TYPE.PROC, token.start, word);
            token.type = Lexer.TOKEN_TYPES.SKEYWORD;
            var procName = this.handleProcName_();
            this.stack.push({
              parse: this.readProc_,
              state: this.PARSING_STATE.IN_PROC,
              name: procName,
            });
            this.stack.push({
              parse: this.readProcDef_,
              state: this.PARSING_STATE.IN_PROC,
              name: procName,
            });
            break;
          case "DATA":
            this.startFoldingBlock_(this.SEC_TYPE.DATA, token.start, word);
            token.type = Lexer.TOKEN_TYPES.SKEYWORD;
            this.stack.push({
              parse: this.readData_,
              state: this.PARSING_STATE.IN_DATA,
            });
            this.stack.push({
              parse: this.readDataDef_,
              state: this.PARSING_STATE.IN_DATA,
            });
            break;
          default: {
            var validName = this._cleanKeyword(word);
            var state = {
              parse: this.readMacroStmt_,
              state: this.PARSING_STATE.IN_MACRO,
              name: validName,
            };
            this.stack.push(state);
            //this.setKeyword_(token, this.langSrv.isProcedureStatementKeyword("MACRO", validName));
            var obj = this.handleLongStmtName_("MACRO", validName);
            state.name = obj.stmtName;
            this.setKeyword_(token, obj.isKeyword);
            state.hasSlashOptionDelimiter = this.langSrv.hasOptionDelimiter(
              "DATA",
              obj.stmtName
            );
          }
        }
      }
    }
    return token;
  },
  readGbl_: function () {
    var word = "",
      token = this.getNext_();

    if (!token) return;

    if (Lexer.isWord[token.type]) {
      if (this.isLabel_()) {
        this.stack.push({
          parse: this.readLabel_,
          state: this.PARSING_STATE.IN_GBL,
        });
      } else if (this.isAssignment_(token)) {
        var validName = this._cleanKeyword(word);
        this.stack.push({
          parse: this.readGblStmt_,
          state: this.PARSING_STATE.IN_GBL,
          name: validName,
        });
      } else {
        word = token.text;
        if (word === "PROC" || word === "PROCEDURE") {
          this.endFoldingBlock_(this.SEC_TYPE.GBL, this.lastToken.end);
          this.startFoldingBlock_(this.SEC_TYPE.PROC, token.start, word);
          token.type = Lexer.TOKEN_TYPES.SKEYWORD;
          this.stack.pop();
          var procName = this.handleProcName_();
          this.stack.push({
            parse: this.readProc_,
            state: this.PARSING_STATE.IN_PROC,
            name: procName,
          });
          this.stack.push({
            parse: this.readProcDef_,
            state: this.PARSING_STATE.IN_PROC,
            name: procName,
          });
        } else if (word === "%MACRO") {
          this.endFoldingBlock_(this.SEC_TYPE.GBL, this.lastToken.end);
          this.startFoldingBlock_(this.SEC_TYPE.MACRO, token.start, word);
          token.type = Lexer.TOKEN_TYPES.MSKEYWORD;
          this.stack.pop();
          this.stack.push({
            parse: this.readMacro_,
            state: this.PARSING_STATE.IN_MACRO,
          });
          this.stack.push({
            parse: this.readMacroDef_,
            state: this.PARSING_STATE.IN_MACRO,
          });
        } else if (word === "DATA") {
          this.endFoldingBlock_(this.SEC_TYPE.GBL, this.lastToken.end);
          this.startFoldingBlock_(this.SEC_TYPE.DATA, token.start, word);
          token.type = Lexer.TOKEN_TYPES.SKEYWORD;
          this.stack.pop();
          this.stack.push({
            parse: this.readData_,
            state: this.PARSING_STATE.IN_DATA,
          });
          this.stack.push({
            parse: this.readDataDef_,
            state: this.PARSING_STATE.IN_DATA,
          });
        } else if (token.type === Lexer.TOKEN_TYPES.MREF) {
          this.handleMref_(this.PARSING_STATE.IN_GBL);
        } else {
          var validName = this._cleanKeyword(word);
          var state = {
            parse: this.readGblStmt_,
            state: this.PARSING_STATE.IN_GBL,
            name: validName,
          };
          this.stack.push(state);
          if (!this.tryToHandleSectionEnd_(token)) {
            //this.setKeyword_(token, this.langSrv.isStatementKeyword(validName));
            var obj = this.handleLongStmtName_("", validName);
            state.name = obj.stmtName;
            this.setKeyword_(token, obj.isKeyword);
            state.hasSlashOptionDelimiter = this.langSrv.hasOptionDelimiter(
              "",
              obj.stmtName
            );
          }
        }
      }
    }
    return token;
  },
  readCards_: function () {
    var word = "",
      totalLines,
      line,
      text,
      endExp =
        Lexer.isCards4[this.curr.name] || Lexer.isParmcards4[this.curr.name]
          ? /^;;;;/
          : /;/,
      token = null;

    if (this.cardsState === this.CARDS_STATE.IN_CMD) {
      token = this.getNext_();
      if (token && token.type === Lexer.TOKEN_TYPES.SEP) {
        word = token.text;
        if (word === ";") {
          //the data will start from the next line
          this.startLineForCardsData = token.end.line + 1;
          this.cardsState = this.CARDS_STATE.IN_DATA_WAITING;
        }
      }
    } else if (this.cardsState === this.CARDS_STATE.IN_DATA_WAITING) {
      token = this.getNext_();
      if (token && token.start.line >= this.startLineForCardsData) {
        //this line is data
        this.cardsState = this.CARDS_STATE.IN_DATA;
        //get data range
        this.startLineForCardsData = token.start.line; //ignore blank lines
        totalLines = this.model.getLineCount();
        line = token.start.line;
        text = "";
        do {
          text = this.model.getLine(line);
          //find ';;;;' and it must be the start of a line
          // or find ';'
          if (endExp.test(text)) {
            break;
          } else {
            line++;
          }
        } while (line < totalLines);

        // FIXID S0890608: data in "datalines" statement does not change color when I input the SAS code in CE
        // No matter whether found, always returns cardsdata
        line--;
        this.lexer.start.line = this.startLineForCardsData;
        this.lexer.start.column = 0;
        this.lexer.curr.line = line;
        this.lexer.curr.column = this.model.getLine(line).length;
        //TODO: IMPROVE
        return this._changeCardsDataToken({
          type: Lexer.TOKEN_TYPES.CARDSDATA,
          start: this._clonePos(this.lexer.start),
          end: this._clonePos(this.lexer.curr),
        });
      }
    } else if (this.cardsState === this.CARDS_STATE.IN_DATA) {
      token = this.getNext_();
      if (token && token.text === ";") {
        // for datalines4, we also do this even there are 4 ;;;;
        this.cardsState = this.CARDS_STATE.IN_NULL;
        this.stack.pop();
      }
    } else {
      //IN_NULL, error
    }
    return token;
  },
  readEnd_: function () {
    var token = this.getNext_();
    if (token && token.text === ";") {
      if (
        this.curr.state === this.PARSING_STATE.IN_PROC ||
        this.curr.state === this.PARSING_STATE.IN_DATA
      ) {
        this.stack.pop();
        this.stack.pop();
        this.endFoldingBlock_(
          this.curr.state === this.PARSING_STATE.IN_PROC
            ? this.SEC_TYPE.PROC
            : this.SEC_TYPE.DATA,
          token.end,
          true,
          this.curr.start,
          this.curr.name
        );
      }
    }
    return token;
  },
  readMend_: function () {
    var token = this.getNext_();
    if (token && token.text === ";") {
      if (this.curr.state === this.PARSING_STATE.IN_MACRO) {
        this.stack.pop();
        this.stack.pop();
        this.endFoldingBlock_(
          this.SEC_TYPE.MACRO,
          token.end,
          true,
          this.curr.start,
          this.curr.name
        );
      }
    }
    return token;
  },
};
/*
How to handle this kind of statement?
  scatterplot x=horsepower y=mpg_city / group=origin name="cars";

  '/' is not an operator.

*/
var Expression = function (parser) {
  var isScopeBeginMark = arrayToMap(["[", "{", "("]);

  function _copyContext(src, dst) {
    dst.pos = src.pos;
  }

  function _cloneContext(src) {
    return {
      pos: src.pos,
    };
  }

  function _next0(context) {
    context.pos++;
    var token = parser.prefetch0_(context.pos);
    if (!token) {
      var end = parser._docEndPos();
      token = {
        type: "text",
        text: "",
        start: end,
        end: end,
      };
    }
    return token;
  }

  function _next(context) {
    var token;
    do {
      token = _next0(context);
    } while (Lexer.isComment[token.type]);
    return token;
  }

  function _tryGetOpr(context) {
    var tmpContext = _cloneContext(context),
      token = _next(tmpContext);

    return { token: token, context: tmpContext };
  }
  /*
   *  output out= tmp*ginv((CovVarR-CovVarU),b=a)*tmp*(a+b)*(f(a,b))
   *
   */
  // get the token count in an expression
  function _expr(context, ends, optionNameCandidate) {
    var token,
      text,
      ret,
      tmpContext = _cloneContext(context);

    token = _next(tmpContext);
    if (ends && ends[token.text]) {
      return;
    } else if (isScopeBeginMark[token.text]) {
      // not consume this mark
      _argList(context, ends);
    } else if (Lexer.isUnaryOpr[token.text]) {
      _copyContext(tmpContext, context); // consume this operator
      _expr(context, ends);
    } else {
      _copyContext(tmpContext, context); // consume this token
      if (optionNameCandidate && Lexer.isWord[token.type]) {
        context.onMeetTarget(token, context.pos);
      }
    }

    for (;;) {
      ret = _tryGetOpr(context);
      text = ret.token.text;
      if (Lexer.isBinaryOpr[text]) {
        _copyContext(ret.context, context);
        if (Lexer.isWord[ret.token.type]) {
          //may always be keyword, but we take the general flow (HTMLCOMMONS-3812)
          context.onMeetTarget(ret.token, context.pos);
        }
        _expr(context, ends);
      } else if (isScopeBeginMark[text]) {
        if (Lexer.isWord[token.type] && text === "(") {
          //TODO: Improve this
          //function call
          if (parser.langSrv.isSasFunction(token.text)) {
            parser.setKeyword_(token, true);
          }
        }
        _argList(context, ends);
      } else {
        return;
      }
    }
  }

  function _argList(context, ends) {
    var token = _next(context), //consume left mark
      tmpContext = null,
      exit = false,
      marks = { "(": ")", "[": "]", "{": "}" },
      lmark = token.text,
      rmark = marks[lmark];

    ends = { ";": 1 };
    ends[rmark] = 1;
    do {
      _expr(context, ends, true); //complex expression
      tmpContext = _cloneContext(context);
      token = _next(tmpContext);
      switch (token.text) {
        case "":
        case ";":
          exit = true;
          break;
        case rmark:
          _copyContext(tmpContext, context); // consume right mark
          exit = true;
          break;
        case "=":
          _copyContext(tmpContext, context);
          _expr(context, ends); //option value
          break;
        case ",":
          _copyContext(tmpContext, context);
          break;
      }
    } while (!exit);
  }

  this.parse = function (ignoreDivision, startPos, onMeetTarget) {
    var context = {
        pos: startPos,
        onMeetTarget: onMeetTarget,
      },
      ret = { pos: 0 };
    try {
      if (ignoreDivision === undefined) {
        ignoreDivision = true;
      }
      Lexer.isBinaryOpr["/"] = !ignoreDivision;
      _expr(context, { ";": 1 });
      ret.pos = context.pos;
      Lexer.isBinaryOpr["/"] = 1;
    } catch (e) {
      //ignore any errors
      //assert('parse expression error'); // eslint-disable-line shikari/sas-i18n-ems
    }
    return ret;
  };
};

LexerEx.SEC_TYPE = {
  DATA: 0,
  PROC: 1,
  MACRO: 2,
  GBL: 3,
};
