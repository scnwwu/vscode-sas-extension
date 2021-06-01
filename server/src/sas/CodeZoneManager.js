/* eslint-disable */
import { arrayToMap } from "./utils";
import { LexerEx } from "./LexerEx";
import { Lexer } from "./Lexer";

var CodeZoneManager = function (model, syntaxDb, langServ) {
  var ZONE_TYPE = CodeZoneManager.ZONE_TYPE,
    SEC_TYPE = LexerEx.SEC_TYPE,
    _langServ = langServ,
    _model = model,
    _syntaxDb = syntaxDb,
    _lexer = new Lexer(model),
    _isBlockEnd = { RUN: 1, QUIT: 1, "%MEND": 1 },
    _secStarts = { PROC: 1, DATA: 1 },
    _secEnds = { "%MACRO": 1, RUN: 1, QUIT: 1 },
    _secType = {
      PROC: SEC_TYPE.PROC,
      DATA: SEC_TYPE.DATA,
      "%MACRO": SEC_TYPE.MACRO,
      BEGINGRAPH: "statgraph",
    },
    _procName = "",
    _stmtName = "",
    _optName = "",
    _subOptName = "",
    _isScopeBeginMark = { "[": 1, "{": 1, "(": 1 },
    _topZone = null,
    _sectionMode = null,
    //_typeWithArgs = Utils.arrayToMap([ZONE_TYPE.OBJECT, ZONE_TYPE.MACRO_FUNC, ZONE_TYPE.SAS_FUNC]),
    _specialStmt = { STYLE: _style, ODS: _ods, IF: _if, WHERE: _where },
    _stmtCache = {},
    _stmtWithOptionDelimiter = {},
    _tagsets = arrayToMap([
      "CHTML",
      "CORE",
      "CSV",
      "CSVALL",
      "CVSBYLINE",
      "DEFAULT",
      "DOCBOOK",
      "ExcelXP",
      "HTML4",
      "HTMLCSS",
      "HTMLPANEL",
      "HTMLSCROLL",
      "IMODE",
      "MSOFFICE2K",
      "MVSHTML",
      "PHTML",
      "PYX",
      "RTF",
      "SASREPORT",
      "SQL",
      "SUPERMAP",
      "TABLEEDITOR",
      "WML",
      "WMLOLIST",
      "XBRL",
      "XHTML",
      "EVENT_HTML",
      "NAMEDHTML",
      "SHORT_MAP",
      "STYLE_DISPLAY",
      "STYLE_POPUP",
      "TEXT_MAP",
      "TPL_STYLE_LIST",
      "TPL_STYLE_MAP",
    ]),
    _dummyToken = { line: 0, col: 0, type: "text", pos: -1 };
  // private functions
  function _reset() {
    _procName = "";
    _stmtName = "";
    _optName = "";
    _subOptName = "";
  }
  function _needOptionDelimiter() {
    if (!_stmtWithOptionDelimiter[_procName]) {
      _stmtWithOptionDelimiter[_procName] = {};
    }

    if (_stmtWithOptionDelimiter[_procName][_stmtName] === undefined) {
      _stmtWithOptionDelimiter[_procName][_stmtName] =
        _syntaxDb.hasOptionDelimiter(_procName, _stmtName);
    }
    return _stmtWithOptionDelimiter[_procName][_stmtName];
  }
  function _isDatasetOpt(name) {
    var type = null;
    if (_topZone === ZONE_TYPE.PROC_DEF) {
      type = _syntaxDb.getProcedureOptionType(_procName, name);
    } else if (_topZone === ZONE_TYPE.PROC_STMT) {
      type = _syntaxDb.getProcedureStatementOptionType(
        _procName,
        _stmtName,
        name
      );
    }
    if (type && _syntaxDb.isDataSetType(type)) {
      return true;
    }
    return false;
  }
  function _getStmts(procName) {
    var stmts, setCache;

    if (!_stmtCache[procName]) {
      stmts = _syntaxDb.getProcedureStatements(procName);
      setCache = function (stmts) {
        if (stmts && stmts.length > 0) {
          _stmtCache[procName] = arrayToMap(stmts);
        }
      };
      //if (!stmts) {
      //    _syntaxDb.getProcedureStatements(procName,function(stmts){
      //        setCache(stmts);
      //    });
      //}
      setCache(stmts);
    }
    return _stmtCache[procName];
  }
  function _getFullStmtName(context, procName, stmt) {
    var stmts = _getStmts(procName),
      tmpContext2 = _cloneContext(context),
      token2 = _getNextEx(tmpContext2),
      tmpContext3 = _cloneContext(tmpContext2),
      token3 = _getNextEx(tmpContext3),
      tmpContext4 = _cloneContext(tmpContext3),
      token4 = _getNextEx(tmpContext4),
      name2 = stmt.text.toUpperCase() + " " + token2.text,
      name3 = name2 + " " + token3.text,
      name4 = name3 + " " + token4.text;
    if (stmts) {
      if (stmts[name4]) {
        _copyContext(tmpContext4, context);
        stmt.text = name4;
        stmt.pos = token4.pos > 0 ? 1 : token4.pos;
      } else if (stmts[name3]) {
        _copyContext(tmpContext3, context);
        stmt.text = name3;
        stmt.pos = token3.pos > 0 ? 1 : token3.pos;
      } else if (stmts[name2]) {
        _copyContext(tmpContext2, context);
        stmt.text = name2;
        stmt.pos = token2.pos > 0 ? 1 : token2.pos;
      }
    }
    if (procName === "ODS" && _tagsets[token2.text.replace("TAGSETS.", "")]) {
      _copyContext(tmpContext2, context);
      stmt.text = name2;
      stmt.pos = token2.pos > 0 ? 1 : token2.pos;
    }
  }
  function _ended(token) {
    var line,
      start,
      end,
      ret = true,
      reg = null,
      regs = {
        comment: /(^\*.*;$|^\/\*.*\*\/$)/i,
        "macro-comment": /(^%\*.*;$)/i,
        string: /(^'.*'$|^".*"$)/i,
        date: /(^'.*'d$|^".*"d$)/i,
        time: /(^'.*'t$|^".*"t$)/i,
        dt: /(^'.*'dt$|^".*"dt$)/i,
        bitmask: /(^'.*'b$|^".*"b$)/i,
        namelit: /(^'.*'n$|^".*"n$)/i,
        hex: /(^'.*'x$|^".*"x$)/i,
      };
    if (token.endLine) {
      start = _model.getLine(token.line).substr(token.col, 2);
      end = _model.getLine(token.endLine).substring(0, token.endCol);
    } else {
      start = token.text;
      end = token.text;
    }
    line = start.substr(0, 2);
    if (end.length <= 2) line += end;
    else line += end.substr(end.length - 2, 2);

    if (Lexer.isComment[token.type] || Lexer.isLiteral[token.type]) {
      reg = regs[token.type];
      if (reg && !reg.test(line)) {
        ret = false;
      }
    }
    return ret;
  }
  function _token(line, col) {
    var syntax = _langServ.getSyntax(line),
      len = syntax.length,
      i = 1,
      j = -1,
      type = "text",
      currLine = line;
    for (; i < len; i++) {
      if (syntax[i].start >= col) {
        if (syntax[i - 1].start <= col) {
          j = i - 1;
          type = syntax[j].style;
          break;
        } else {
          break; //not found, not continue
        }
      }
    }

    if (Lexer.isComment[type] || Lexer.isLiteral[type]) {
      while (currLine >= 0) {
        if (syntax[j].state instanceof Object) {
          return {
            type: type,
            text: null,
            line: currLine,
            col: syntax[j].start,
            endLine: syntax[j].state.line,
            endCol: syntax[j].state.col,
          };
        } else if (syntax[j].state === 1) {
          //met the start of the node
          break;
        } else {
          j--;
          if (j < 0) {
            do {
              currLine--;
              syntax = _langServ.getSyntax(currLine); //skip the line without syntax
            } while (currLine >= 0 && syntax.length === 0);
            j = syntax.length - 1;
          }
        }
      }
    }
    if (i > 0) {
      var lineText = _model.getLine(line),
        endCol = 0,
        startCol = 0;
      syntax = _langServ.getSyntax(line);
      if (syntax.length !== 0) {
        endCol = syntax[i] ? syntax[i].start : lineText.length;
        startCol = syntax[i - 1].start;
      }
      return {
        type: type,
        text: lineText.substring(startCol, endCol),
        line: line,
        col: startCol,
      };
    }
    return null;
  }
  function _getPrev(context) {
    //var line = _model.getLine(context.line), lineLen = line.length,
    //    syntax = _langServ.getSyntax(context.line), syntaxLen = syntax.length,
    var line = "",
      lineLen = 0,
      syntax = [],
      syntaxLen = 0,
      text = "",
      col = 0,
      type = "text",
      i = 0,
      lineCount = _model.getLineCount(),
      token = null;
    if (context.line >= lineCount) {
      context.line = lineCount - 1;
      context.col = _model.getLine(context.line).length;
    }
    line = _model.getLine(context.line);
    lineLen = line.length;
    syntax = _langServ.getSyntax(context.line);
    syntaxLen = syntax.length;
    // syntaxIdx is used to cache the index of syntax node in syntax table,
    // if syntaxIdx is less than 0, we must initialize it
    if (context.syntaxIdx < 0) {
      context.syntaxIdx = _langServ.getSyntax(context.line).length - 2;
    }
    do {
      // skip backward
      while (context.col < 0 || syntax.length === 0) {
        context.line--; // the previous line
        if (context.line < 0) {
          return null; // no any token
        }
        line = _model.getLine(context.line);
        lineLen = line.length;
        context.col = lineLen - 1;
        syntax = _langServ.getSyntax(context.line);
        syntaxLen = syntax.length;
        context.syntaxIdx = syntaxLen - 2;
      }

      // find the node
      if (
        /*syntax[syntaxLen-1].state !== 0 && */ // for the line without normal end mark.
        syntax[syntaxLen - 1].start <= context.col &&
        lineLen >= context.col
      ) {
        i = syntaxLen - 1;
      } else {
        for (i = context.syntaxIdx; i >= 0; i--) {
          if (
            syntax[i].start <= context.col &&
            syntax[i + 1].start >= context.col
          ) {
            break;
          }
        }
      }
      // get the text and type
      if (context.syntaxIdx < 0 || i < 0) {
        //this line is special, no normal end mark,
        col = 0;
        type = syntax[0].style;
        text = line.substring(0, lineLen);
      } else {
        col = syntax[i].start;
        type = syntax[i].style;
        text = line.substring(
          col,
          syntax[i + 1] ? syntax[i + 1].start : lineLen
        );
      }
      // adjust pointer
      if (i < 1) {
        context.col = -1;
        context.syntaxIdx = -1;
      } else {
        context.col = syntax[i - 1].start;
        context.syntaxIdx = i - 1;
      }
    } while (/^\s*$/.test(text));

    if (Lexer.isComment[type] || Lexer.isLiteral[type]) {
      token = _token(context.line, col + 1);
      if (
        token.endLine &&
        (token.line !== context.line || token.col !== context.col)
      ) {
        context.col = token.col - 1;
        context.line = token.line;
        context.syntaxIdx = -1;
      }
      if (Lexer.isComment[type]) {
        return _getPrev(context);
      }
      return token;
    }

    return {
      type: type,
      text: text,
      line: context.line,
      col: col,
    };
  }
  function _getNext(context) {
    var token,
      tmpToken = null,
      pos;
    if (context.tokens) {
      if (context.tokenIdx < context.tokens.length) {
        tmpToken = context.tokens[context.tokenIdx];
        if (tmpToken.endLine) {
          context.line = tmpToken.endLine;
          context.col = tmpToken.endCol;
        } else {
          context.line = tmpToken.line;
          context.col = tmpToken.col + tmpToken.text.length;
        }
        context.tokenIdx++;
      }
    } else {
      pos = _normalize(context.line, context.col);
      context.lexer.startFrom(pos.line, pos.col);
      token = context.lexer.getNext();
      if (token) {
        context.line = token.end.line;
        context.col = token.end.column;
        tmpToken = _transToken(token);
      }
    }
    while (tmpToken && Lexer.isComment[tmpToken.type]) {
      //skip comments
      tmpToken = _getNext(context);
    }
    if (tmpToken && tmpToken.type === Lexer.TOKEN_TYPES.MREF) {
      // skip macro-ref S1405245
      var mRefToken = tmpToken;
      tmpToken = _getNext(context);
      if (tmpToken && tmpToken.text === "(") {
        while (
          tmpToken &&
          tmpToken.text !== ")" &&
          _pos(context.cursor, tmpToken) === -1
        ) {
          tmpToken = _getNext(context);
        }
        if (_pos(context.cursor, tmpToken) === -1) {
          tmpToken = _getNext(context);
        } else {
          tmpToken = mRefToken;
        }
      }
    }
    return tmpToken;
  }
  function _getNextEx(context) {
    var token = _getNext(context),
      lc,
      tmpContext,
      next;

    if (token && token.text === "&") {
      tmpContext = _cloneContext(context);
      next = _getNext(tmpContext);
      if (next && next.text !== "" && Lexer.isWord[next.type]) {
        //macro variables
        token.text = "&" + next.text;
        token.type = "text";
        _copyContext(tmpContext, context);
      }
    }
    if (!token) {
      lc = _model.getLineCount() - 1;
      token = {
        type: "text",
        text: "",
        line: lc,
        col: _model.getColumnCount(lc),
      };
    }
    token.pos = _pos(context.cursor, token);
    token.text = token.text.toUpperCase();
    return token;
  }
  function _transToken(token) {
    if (token) {
      var nToken = {
        type: token.type,
        line: token.start.line,
        col: token.start.column,
        text: token.text,
      };
      if (token.start.line !== token.end.line) {
        nToken["endLine"] = token.end.line;
        nToken["endCol"] = token.end.column;
      }
      return nToken;
    }
    return token;
  }
  function _tokenizeStmt(line, col) {
    var token,
      tokens = [];
    _lexer.startFrom(line, col);
    do {
      token = _lexer.getNext();
      if (token) {
        token = _transToken(token);
        tokens.push(token);
        if (token.text === ";") {
          break;
        }
      }
    } while (token);
    return tokens;
  }
  function _emit(token, zone, force) {
    //if (force || !_typeWithArgs[token.zone]) {
    // NOTE: bigger zone indicates it should be used.
    if (force || !token.zone || zone > token.zone) {
      token.zone = zone;
    }
  }
  function _emit1(token, lZone, rZone) {
    if (token.pos === 0) {
      token.zone = rZone;
    } else if (token.pos >= 2) {
      token.zone = lZone;
    }
  }
  function _blockName(block) {
    var token = null,
      context = {
        line: block.startLine,
        col: block.startCol,
        syntaxIdx: 0,
        lexer: _lexer,
      };
    _getNext(context); //section keyword
    token = _getNext(context);
    return token ? token.text.toUpperCase() : "";
  }
  /* return values:
     c c[c]c c
     3 2 1 0 -1
    */
  function _pos(cursor, token) {
    var l1 = token.line,
      c1 = token.col,
      l2,
      c2;
    if (token.endLine === undefined) {
      l2 = l1;
      c2 = c1 + token.text.length;
    } else {
      l2 = token.endLine;
      c2 = token.endCol;
    }
    if (cursor.line > l2) {
      return -1;
    } else if (cursor.line < l1) {
      return 3;
    } else if (l2 === l1) {
      // token in a line
      if (cursor.col < c1) return 3;
      else if (cursor.col === c1) return 2;
      else if (cursor.col === c2) return 0;
      else if (cursor.col > c2) return -1;
      else return 1;
    } else {
      // token cross multiple lines
      if (cursor.line === l1) {
        //start line
        if (cursor.col < c1) return 3;
        else if (cursor.col === c1) return 2;
        else return 1;
      } else if (cursor.line === l2) {
        //end line
        if (cursor.col > c2) return -1;
        else if (cursor.col === c2) return 0;
        else return 1;
      } else return 1;
    }
  }
  /*
   * return value:
   * 1: overlap
   * 0: token in block
   * -1: token outside of block
   */
  function _inBlock(block, token) {
    if (token.endLine && token.endLine !== token.line) {
      //multiple line token
      //TODO: not implemented
    } else {
      //token in a line
      //TODO: not implement all conditions
      if (
        (token.line === block.endLine && token.col >= block.endCol) ||
        (token.line === block.startLine &&
          token.col + token.text.length <= block.startCol) ||
        token.line > block.endLine ||
        token.line < block.startLine
      ) {
        return -1;
      } else {
        return 0; //TODO: include overlap
      }
    }
  }
  function _isBlockStart(block, token) {
    /* FOR S1182067*/
    return block.startLine === token.line && block.startCol === token.col;
  }
  function _endedReally(block) {
    var token = null,
      context = {
        line: block.endLine,
        col: block.endCol,
        syntaxIdx: -1,
        lexer: _lexer,
      },
      word = null;
    do {
      token = _getPrev(context);
    } while (token && token.text !== ";");
    if (token) {
      token = _getPrev(context);
      if (token && token.text) {
        word = token.text.toUpperCase();
        if (_isBlockEnd[word]) return true;
        else if (word === "CANCEL") {
          token = _getPrev(context);
          if (token && token.text && _isBlockEnd[token.text.toUpperCase()])
            return true;
        }
      }
    }
    return false;
  }
  function _skipToStmtStart(context, tokenizing) {
    var token = null,
      tokens = [],
      len = 0;
    context.syntaxIdx = -1;
    context.tokens = null;
    do {
      token = _getPrev(context);
      tokens.push(token);
    } while (token && token.text !== ";");
    if (token) {
      context.line = token.line;
      context.col = token.col + 1;
      context.syntaxIdx = -1;
      context.lastStmtEnd = { line: token.line, col: token.col };
    } else {
      context.line = 0;
      context.col = 0;
      context.syntaxIdx = -1;
      context.lastStmtEnd = null;
    }
    // ignore label
    len = tokens.length;
    if (
      len > 3 &&
      Lexer.isWord[tokens[len - 2].type] &&
      tokens[len - 3].text === ":"
    ) {
      _getNext(context);
      _getNext(context);
    }
    if (tokenizing) {
      context.tokens = _tokenizeStmt(context.line, context.col);
    }
    context.tokenIdx = 0;
  }
  function _isStatgraph(parentBlock, cursor, stmtName) {
    var block = _findEmbeddedBlock(
      parentBlock,
      cursor,
      { BEGINGRAPH: 1 },
      { ENDGRAPH: 1 }
    );
    if (block && block.type === "statgraph" && stmtName !== "BEGINGRAPH") {
      return true;
    }
    return false;
  }
  function _embeddedBlock(parentBlock, cursor) {
    return _findEmbeddedBlock(parentBlock, cursor, _secStarts, _secEnds);
  }
  function _findEmbeddedBlock(parentBlock, cursor, starts, ends) {
    var token = null,
      secName = null,
      stmtCount = 0,
      context = {
        //'block': block,
        line: cursor.line,
        col: cursor.col,
        syntaxIdx: -1,
        cursor: cursor,
        lexer: _lexer,
      };
    do {
      _skipToStmtStart(context, false);
      stmtCount++;
      token = _getNext(context);

      if (token) {
        secName = token.text.toUpperCase();
        if (starts[secName]) {
          return {
            startLine: token.line,
            startCol: token.col,
            endLine: cursor.line,
            endCol:
              token.col + 4 > cursor.col && token.line === cursor.line
                ? token.col + 4
                : cursor.col, // not real in most conditions
            type: _secType[secName],
          };
        } else if (ends[secName]) {
          if (stmtCount > 1) {
            return null;
          }
        }
      } else {
        token = { line: context.line, col: context.col };
      }
      if (context.lastStmtEnd) {
        context.col = context.lastStmtEnd.col - 1;
        context.line = context.lastStmtEnd.line;
        context.lastStmtEnd = null;
      }
    } while (
      token.line > parentBlock.startLine ||
      (token.line === parentBlock.startLine && token.col > parentBlock.startCol)
    );
    return null;
  }
  function _globalStmt(context) {
    var token = null,
      tmpContext = null,
      block = null,
      zone;
    _skipToStmtStart(context, true);
    tmpContext = {
      line: context.line,
      col: context.col,
      cursor: context.cursor,
      syntaxIdx: -1,
      lexer: _lexer,
    };
    token = _getNextEx(context); // procedure name
    if (token.pos >= 0) {
      block = _langServ.getFoldingBlock(tmpContext.line, tmpContext.col);
      if (block) {
        if (_inBlock(block, token) < 0 && !_endedReally(block)) {
          //not in block
          if (token.text === "%MACRO") {
            return ZONE_TYPE.MACRO_STMT;
          }
          switch (block.type) {
            case SEC_TYPE.PROC:
              if (_isStatgraph(block, context.cursor, token.text)) {
                _procName = "STATGRAPH";
              } else {
                _procName = _blockName(block);
                _stmtName = token.text;
              }
              return ZONE_TYPE.PROC_STMT;
            case SEC_TYPE.DATA:
              return ZONE_TYPE.DATA_STEP_STMT;
            //case SEC_TYPE.MACRO: return ZONE_TYPE.GBL_STMT;
          }
        }
      }
      if (token.text[0] === "%") {
        return ZONE_TYPE.MACRO_STMT; //TODO: need to differ among ARM macro, autocall macro, macro function, macro statement
      } else {
        return ZONE_TYPE.GBL_STMT;
      }
    }

    switch (token.text.toUpperCase()) {
      case "PROC":
      case "PROCEDURE":
        return _procDef(context);
      case "DATA":
        return _dataDef(context, token);
      case "%MACRO":
        return _macroDef(context);
    }
    _stmtName = token.text.toUpperCase();
    _topZone = ZONE_TYPE.GBL_STMT;
    zone = _stmtEx(context, token);
    if (_isCall(zone)) {
      return ZONE_TYPE.RESTRICTED;
    } else if (zone.type === ZONE_TYPE.OPT_NAME) {
      return ZONE_TYPE.GBL_STMT_OPT;
    } else if (zone.type === ZONE_TYPE.OPT_VALUE) {
      return ZONE_TYPE.GBL_STMT_OPT_VALUE;
    } else if (zone.type === ZONE_TYPE.SUB_OPT_NAME) {
      if (
        _syntaxDb.isStatementSubOptKeyword(_stmtName, _optName, _subOptName) ||
        _subOptName
      ) {
        return ZONE_TYPE.GBL_STMT_SUB_OPT_NAME;
      }
    } else if (_stmtName === "%SYSCALL" && /^%SYSCALL\b/.test(token.text)) {
      return _callStmt(context);
    }
    return zone.type;
  }
  function _procSec(context) {
    var token = null,
      text = null,
      inBlock = false;
    _skipToStmtStart(context, true);
    token = _getNextEx(context);
    if (Lexer.isWord[token.type]) {
      text = token.text.toUpperCase();
      if (token.pos >= 0) {
        //the token has been right side of the cursor
        inBlock = _inBlock(context.block, token) >= 0;
        if (
          (inBlock && text !== "PROC") ||
          (!inBlock && //not in block
            !_endedReally(context.block))
        ) {
          //not really end the last block
          _procName = _blockName(context.block);
          if (text[0] === "%") {
            return ZONE_TYPE.MACRO_STMT;
          } else {
            if (_isStatgraph(context.block, context.cursor, text)) {
              _procName = "STATGRAPH";
            }
            var zone = _procStmt(context, token); //some procedure statments' name includes several words.
            return zone === ZONE_TYPE.ODS_STMT ? zone : ZONE_TYPE.PROC_STMT;
          }
        } else {
          return ZONE_TYPE.GBL_STMT;
        }
      } else {
        switch (text) {
          case "PROC":
          case "PROCEDURE":
            return _procDef(context);
          case "DATA":
            return _dataDef(context, token);
          default: {
            if (_isStatgraph(context.block, context.cursor, text)) {
              _procName = "STATGRAPH";
            } else _procName = _blockName(context.block);
            return _procStmt(context, token);
          }
        }
      }
    } else {
      _procName = _blockName(context.block);
      return _procStmt(context, token);
    }
  }
  function _procDef(context) {
    var token = null,
      zone;
    token = _getNextEx(context); // procedure name
    if (token.pos >= 0 && token.text !== "=") {
      return ZONE_TYPE.PROC_DEF;
    }
    _procName = token.text.toUpperCase();
    _topZone = ZONE_TYPE.PROC_DEF;
    zone = _stmtEx(context, token);
    if (_isCall(zone)) {
      return ZONE_TYPE.RESTRICTED;
    } else if (zone.type === ZONE_TYPE.OPT_NAME) {
      return ZONE_TYPE.PROC_OPT;
    } else if (zone.type === ZONE_TYPE.OPT_VALUE) {
      return ZONE_TYPE.PROC_OPT_VALUE;
    } else if (zone.type === ZONE_TYPE.SUB_OPT_NAME) {
      if (
        _syntaxDb.isProcedureSubOptKeyword(_procName, _optName, _subOptName)
      ) {
        return ZONE_TYPE.PROC_SUB_OPT_NAME;
      }
    }
    return zone.type;
  }
  /*
   * e.g.
   * root stmt_name arglist argitem ...
   */
  function _context(root, stack, obj) {
    var i,
      len,
      found = false;
    if (!obj) {
      obj = { type: "root" };
    }
    obj.value = root;
    stack.push(obj);
    if (root instanceof Array) {
      //options
      i = 0;
      len = root.length;
      for (; i < len; i++) {
        found = _context(root[i], stack, { type: "argitem", argIndex: i });
        if (found) break;
        stack.pop();
      }
    } else if (root instanceof Object) {
      //operation
      if (root.op2 !== undefined) {
        found = _context(root.op1, stack, { type: "lvalue" });
        if (!found) {
          found = _context(root.op, stack, { type: "operator" });
          if (!found) {
            found = _context(root.op2, stack, { type: "rvalue" });
            if (!found) {
              stack.pop();
              stack.pop();
              stack.pop();
            }
          }
        }
      } else if (root.op1 !== undefined) {
        found = _context(root.op, stack, { type: "obj" });
        if (!found) {
          found = _context(root.op1, stack, { type: "arglist" });
          if (!found) {
            stack.pop();
            stack.pop();
          }
        }
      } else {
        if (root.pos >= 0) {
          found = true;
        }
      }
    }
    return found;
  }

  function _setOptName(node) {
    if (node.op === undefined) {
      _optName = node.text;
    } else if (node.op && node.op2 === undefined) {
      _optName = node.op.text;
    } else {
      _setOptName(node.op1);
    }
  }

  function _zone(stack, context) {
    var zone = {},
      type,
      text,
      curr;

    // stack.length must be > 0
    curr = stack[stack.length - 1].value;
    type = curr.zone;
    text = curr.text;
    _optName = curr.text;
    _subOptName = curr.text;

    // a
    // a=
    // a=b
    // a=b(...)

    var MAIN_OPT_INDEX = 3;

    if (stack.length > MAIN_OPT_INDEX) {
      _setOptName(stack[MAIN_OPT_INDEX].value);
    }

    if (curr.pos !== 1) {
      _subOptName = undefined; //NOTE: must be undefined for _syntaxDb query.
    }

    if (type === ZONE_TYPE.OBJECT /* && text === 'STYLE'*/) {
      type = ZONE_TYPE.OPT_NAME;
    }
    if (type === ZONE_TYPE.SIMPLE_ITEM) {
      type = ZONE_TYPE.OPT_VALUE; //!
    }
    // "nofcout(where=(substr(_var_,1,6)='Assign' and round(_value_) = 1)) as p " in 'create table ' statement
    // the 'and' keyword should be treated as speical.
    // maybe we should have another checking mechanism.
    if (!type && stack[stack.length - 1].type === "operator") {
      type = ZONE_TYPE.SUB_OPT_NAME; //if we set SUB_OPT_NAME, the _procStmt will check whether it is an OPT_NAME
    }

    //UGLY!!
    if (
      _stmtName.match(/ODS TAGSETS.\w*/gi) ||
      (_stmtName === "ODS" && _optName.match(/TAGSETS.\w*/gi))
    ) {
      text = _model.getLine(context.cursor.line);
      text = text.substring(0, context.cursor.col);
      if (text.match(/TAGSETS.\w*$/gi)) {
        type = ZONE_TYPE.TAGSETS_NAME;
      } else if (
        text.match(/ods\s+\w+$/gi) ||
        (text.match(/((^\s*$)|(^\s*\w+$))/) && type === ZONE_TYPE.STMT_NAME) ||
        text.match(/ods\s+$/gi)
      ) {
        type = ZONE_TYPE.ODS_STMT;
      }
    }

    if (_stmtName[0] === "%") {
      if (type === ZONE_TYPE.OPT_NAME || type === ZONE_TYPE.OPT_VALUE) {
        type = ZONE_TYPE.MACRO_STMT_BODY;
      }
    }

    //sas.log.info('zone:'+_getZoneName(type));
    //sas.log.info('call:'+zone['callName']+',current arg:'+zone['argIdx']);

    zone["type"] = type;
    return zone;
  }
  function _isCall(zone) {
    /*if (zone.callName && (zone.type === ZONE_TYPE.OPT_NAME || zone.type === ZONE_TYPE.OPT_VALUE)) {
            return true;
        }*/ // S1224156
    return false;
  }
  function _procStmt(context, stmt) {
    var zone, type;
    _topZone = ZONE_TYPE.PROC_STMT;
    _getFullStmtName(context, _procName, stmt);
    zone = _stmtEx(context, stmt);
    type = zone.type;
    if (_isCall(zone)) {
      type = ZONE_TYPE.RESTRICTED;
    } else if (zone.type === ZONE_TYPE.STMT_NAME) {
      type = ZONE_TYPE.PROC_STMT;
    } else if (zone.type === ZONE_TYPE.OPT_NAME) {
      if (_stmtName === "CALL" && /^CALL\b/.test(stmt.text)) {
        return _callStmt(context);
      }
      type = ZONE_TYPE.PROC_STMT_OPT;
    } else if (zone.type === ZONE_TYPE.OPT_NAME_REQ) {
      type = ZONE_TYPE.PROC_STMT_OPT_REQ;
    } else if (zone.type === ZONE_TYPE.OPT_VALUE) {
      type = ZONE_TYPE.PROC_STMT_OPT_VALUE;
    } else if (zone.type === ZONE_TYPE.SUB_OPT_NAME) {
      var stmtWithDatasetOption = LexerEx.prototype.stmtWithDatasetOption_;
      if (stmtWithDatasetOption[_procName + "/" + stmt.text]) {
        type = ZONE_TYPE.DATA_SET_OPT_NAME;
      } else if (
        _syntaxDb.isProcedureStatementSubOptKeyword(
          _procName,
          _stmtName,
          _optName,
          _subOptName
        )
      ) {
        type = ZONE_TYPE.PROC_STMT_SUB_OPT;
      } else if (
        _syntaxDb.isProcedureStatementKeyword(_procName, _stmtName, _subOptName)
      ) {
        type = ZONE_TYPE.PROC_STMT_OPT;
      }
    } else if (zone.type === ZONE_TYPE.SUB_OPT_VALUE) {
      type = ZONE_TYPE.PROC_STMT_SUB_OPT_VALUE;
    }
    return type;
  }
  function _stmtEx(context, stmt) {
    var tokens = _stmt(context, stmt),
      stack = [],
      zone;
    _context(tokens, stack);
    zone = _zone(stack, context);
    return zone;
  }
  function _emit3(context, tree, type) {
    _traverse(tree, function (i) {
      if (Lexer.isWord[i.type] || i.type === "text") {
        _emit(i, type);
      }
    });
  }
  function _if(context, stmt, type) {
    var opts = [],
      expr = _expr(context),
      token,
      token2;

    token = _getNextEx(context);
    if (token.text === "IN") {
      //special case IN operator, because we ignore IN always in _expr
      expr = { op: token, op1: expr, op2: _expr(context) };
      token = _getNextEx(context);
    }
    _emit3(context, expr, type);
    opts.push(expr);

    _emit(token, type);
    if (
      (token.text === "THEN" && type === ZONE_TYPE.DATA_STEP_STMT_OPT) ||
      (token.text === "%THEN" && type === ZONE_TYPE.MACRO_STMT_OPT)
    ) {
      token2 = _getNextEx(context);
      //adjust statement name
      opts.push({ op: token, op1: _stmt(context, token2) });
      if (token.pos >= 0) _stmtName = stmt.text;
    } else {
      opts.push(token);
    }
    return { op: stmt, op1: opts };
  }

  function _where(context, stmt) {
    return { op: stmt, op1: _expr(context) };
  }

  function _style(context, stmt) {
    var ret = { op: stmt },
      styleElemNames = [],
      from = null,
      existing,
      op1,
      token;
    /*
        STYLE style-element-name(s)
        <FROM existing-style-element-name | _SELF_ ><"text">
        </ style-attribute-specification(s)>;
        style-attribute-specification(s):
        style-attribute-name=<|>style-attribute-value
         */
    // style element names
    do {
      token = _getNextEx(context);
      _emit(token, ZONE_TYPE.STYLE_ELEMENT);
      styleElemNames.push(token);
      token = _getNextEx(context);
    } while (token.text === ",");
    //ret['op1'] = styleElemNames;

    if (token.text === "FROM") {
      from = token;
      _emit(token, "from");
      existing = _getNextEx(context);
      _emit(existing, "existing");
      //ret['op1'] = {'op':token, 'op1': styleElemNames, 'op2':_getNextEx(context)};
      token = _getNextEx(context, "text");
      if (token.text === '"text"' || token.text === "'text'") {
        _emit(token, "text");
        token = _getNextEx(context); //ignore
      }
    }
    if (token.text === "/") {
      if (from) {
        op1 = { op: from, op1: styleElemNames, op2: existing };
      } else {
        op1 = styleElemNames;
      }
      _emit1(token, ZONE_TYPE.RESTRICTED, ZONE_TYPE.STYLE_ATTR);
      ret["op1"] = {
        op: token,
        op1: op1,
        op2: _stmtOptions(
          context,
          null,
          ZONE_TYPE.STYLE_ATTR,
          ZONE_TYPE.RESTRICTED
        ),
      };
    } else {
      ret["op1"] = styleElemNames;
    }
    return ret;
  }
  function _ods(context, stmt) {
    var nameType, optType, opts, opt;
    _getFullStmtName(context, "ODS", stmt);
    _stmtName = stmt.text.toUpperCase();
    _emit(stmt, ZONE_TYPE.ODS_STMT);
    if (_stmtName === "ODS") {
      nameType = ZONE_TYPE.RESTRICTED;
      optType = ZONE_TYPE.RESTRICTED;
    } else {
      nameType = ZONE_TYPE.ODS_STMT_OPT;
      optType = ZONE_TYPE.ODS_STMT_OPT_VALUE;
    }
    opts = _stmtOptions(context, stmt, nameType, optType);
    opt = _firstToken(opts);
    if (_stmtName === "ODS" && opt.pos >= 0) _emit(opt, ZONE_TYPE.ODS_STMT);
    return { op: stmt, op1: opts };
  }
  function _traverse(top, cb) {
    if (top instanceof Array) {
      top.forEach(function (i) {
        _traverse(i, cb);
      });
    } else if (top.op === undefined) {
      cb(top);
    } else if (top.op2 === undefined) {
      _traverse(top.op, cb);
      _traverse(top.op1, cb);
    } else {
      _traverse(top.op1, cb);
      _traverse(top.op, cb);
      _traverse(top.op2, cb);
    }
  }
  function _firstToken(opt) {
    if (opt instanceof Array) {
      return _firstToken(opt[0]);
    } else if (opt.op === undefined) return opt;
    else if (opt.op2 === undefined) {
      return _firstToken(opt.op);
    } else return _firstToken(opt.op1);
  }
  var _normalStmts = {
    SELECT: 1,
  };
  function _isNormalStmt(stmt) {
    //TODO: we should improve this when we get enough information about SAS language
    return _normalStmts[stmt.text];
  }
  function _checkFuncType(token) {
    return token.text[0] === "%"
      ? ZONE_TYPE.MACRO_FUNC
      : _syntaxDb.isSasFunction(token.text)
      ? ZONE_TYPE.SAS_FUNC
      : ZONE_TYPE.OBJECT;
  }
  function _stmt(context, stmt) {
    var ret = _tryGetOpr(context),
      token;
    if (ret.token.text === "/") {
      //
      _copyContext(ret.context, context); //ignore '/'
    } else if (Lexer.isBinaryOpr[ret.token.text]) {
      //This statement is only a expression.
      _copyContext(ret.context, context);
      if (!_isNormalStmt(stmt)) {
        //S1224156
        _emit(stmt, ZONE_TYPE.SIMPLE_ITEM);
        _stmtName = stmt.text;
        return { op: ret.token, op1: stmt, op2: _expr(context) };
      }
    }
    _emit(stmt, ZONE_TYPE.STMT_NAME);
    _stmtName = stmt.text;
    if (_specialStmt[_stmtName]) {
      return _specialStmt[_stmtName].call(
        this,
        context,
        stmt,
        ZONE_TYPE.DATA_STEP_STMT_OPT
      );
    } else if (_needOptionDelimiter()) {
      token = ret.token;
      if (token.text === "/") {
        _emit1(token, ZONE_TYPE.OPT_NAME_REQ, ZONE_TYPE.OPT_NAME);
        return {
          op: stmt,
          op1: [token].concat(_stmtOptions(context, stmt, ZONE_TYPE.OPT_NAME)),
        };
      }
    }
    return { op: stmt, op1: _stmtOptions(context, stmt) };
  }
  function _startScope(context, scope, obj) {
    if (!context.scopes) {
      context.scopes = [];
    }
    context.scopes.push({ t: scope, o: obj });
  }
  function _endScope(context) {
    context.scopes.pop();
  }
  function _styleOptionAllowed() {
    if (
      _procName === "PRINT" ||
      _procName === "REPORT"
      /*|| _stmtName.match(/^ODS/gi)*/
    ) {
      return true;
    }
    return false;
  }
  /* list is array
   * e.g. : (a=b,b=c,d=e)
   * e.g. : stmtname a1 b(c=d e(f=g h=i)=j(k=l m=n))=o(p=q r(s=t u=v) w(x=y aa)=bb(cc=dd ee=ff));
   */
  function _emitArgList(list, ltype, rtype) {
    var i = 1,
      count = list.length - 1;
    if (list[0].pos === 0) _emit(list[0], ltype);
    if (list[count].pos >= 2) _emit(list[count], ltype);
    for (; i < count; i++) {
      if (list[i].op === undefined) {
        //only a token, no value
        _emit(list[i], ltype);
      } else if (list[i].op2 === undefined) {
        //complicated, call or config
        _emit(list[i].op, ltype);
      } else {
        //with value
        if (list[i].op1.op1 instanceof Array) {
          _emit(list[i].op1.op, ltype); // e(f=g h=i)=j(k=l m=n), ignore the nested
        } else {
          _emit(list[i].op1, ltype);
        }
        _emit1(list[i].op, ltype, rtype);
        if (list[i].op2.op1 instanceof Array) {
          _emit(list[i].op2.op, rtype);
        } else {
          if (list[i].op1.text && list[i].op1.text.match(/color/gi)) {
            rtype = ZONE_TYPE.COLOR;
          }
          _emit(list[i].op2, rtype);
        }
      }
    }
  }
  /*
   * e.g.:
   * (1) a
   * (2) (a=b,b=c,d=e)
   * (3) a(a=b,b=c,d=e)
   */
  function _emitTree(context, expr, type) {
    var opt, deep, subOpts, curr;
    if (!context.scopes || context.scopes.length <= 0) {
      return;
    }
    deep = context.scopes.length;
    opt = context.scopes[0];
    curr = context.scopes[deep - 1];
    if (
      (opt.o && opt.o.text === "STYLE") ||
      (opt.o && opt.o.op && opt.o.op.text === "STYLE")
    ) {
      // special for style
      if (!_styleOptionAllowed()) return;
      if (curr.t === ZONE_TYPE.OPT_ITEM) {
        if (expr.op1) {
          //having options
          _emit(expr.op, type);
          if (expr.op1 instanceof Array)
            _emitArgList(expr.op1, ZONE_TYPE.STYLE_LOC, ZONE_TYPE.RESTRICTED);
        } else {
          _emit(expr, type);
        }
      } else if (curr.t === ZONE_TYPE.OPT_VALUE) {
        if (expr.op1 || expr instanceof Array) {
          if (expr.op1) {
            subOpts = expr.op1;
            _emit(expr.op, ZONE_TYPE.STYLE_ELEMENT);
          } else {
            subOpts = expr;
          }
          if (subOpts instanceof Array) {
            _emitArgList(subOpts, ZONE_TYPE.STYLE_ATTR, ZONE_TYPE.RESTRICTED);
          }
        } else {
          _emit(expr, ZONE_TYPE.STYLE_ELEMENT);
        }
      }
    } else if (_stmtName === "DATA" && opt.o) {
      if (curr.t === ZONE_TYPE.OPT_ITEM) {
        if (expr.op === undefined) {
          _emit(expr, ZONE_TYPE.DATA_STEP_OPT_NAME);
        }
      } else if (curr.t === ZONE_TYPE.OPT_VALUE) {
        if (opt.o.text === "VIEW" || opt.o.text === "PGM") {
          if (expr.op) {
            _emit(expr.op, ZONE_TYPE.VIEW_OR_PGM_NAME);
            if (expr.op1 instanceof Array) {
              _emitArgList(
                expr.op1,
                ZONE_TYPE.VIEW_OR_PGM_OPT_NAME,
                ZONE_TYPE.VIEW_OR_PGM_OPT_VALUE
              );
            }
          } else {
            _emit(expr, ZONE_TYPE.VIEW_OR_PGM_NAME);
          }
        } else {
          if (expr.op === undefined) {
            _emit(expr, ZONE_TYPE.DATA_STEP_OPT_VALUE);
          }
        }
      }
    } else if (opt.o && opt.o.text && opt.o.text.match(/color/gi)) {
      if (curr.t === ZONE_TYPE.OPT_VALUE && expr instanceof Array) {
        _emitArgList(expr, ZONE_TYPE.COLOR, ZONE_TYPE.RESTRICTED);
      }
    } else if (expr.op1 instanceof Array) {
      _emitArgList(expr.op1, ZONE_TYPE.SUB_OPT_NAME, ZONE_TYPE.SUB_OPT_VALUE);
    }
  }
  function _stmtOptions(context, stmt, nameType, valType) {
    var name,
      next,
      tmpContext,
      opts = [],
      val,
      exit = false;
    if (!nameType)
      nameType = _needOptionDelimiter()
        ? ZONE_TYPE.OPT_NAME_REQ
        : ZONE_TYPE.OPT_NAME;
    if (!valType) valType = ZONE_TYPE.OPT_VALUE;
    for (;;) {
      // option name
      tmpContext = _cloneContext(context);
      name = _getNextEx(tmpContext);
      if (name.text === "") {
        _emit(name, nameType);
        opts.push(name);
        exit = true;
      } else if (name.text === ";") {
        if (name.pos >= 2) _emit(name, nameType);
        opts.push(name);
        exit = true;
      } else {
        if (nameType === ZONE_TYPE.OPT_NAME_REQ && name.text === "/") {
          nameType = ZONE_TYPE.OPT_NAME;
        }
        _emit(name, nameType);
        _copyContext(tmpContext, context);
        tmpContext = _cloneContext(context);
        next = _getNextEx(tmpContext);
        if (name.text === "(" || next.text === "(") {
          _emit(name, _checkFuncType(name));
          name = { op: name, op1: _argList(context, name) };
          tmpContext = _cloneContext(context);
          next = _getNextEx(tmpContext);
        }
      }
      _startScope(context, ZONE_TYPE.OPT_ITEM, name);
      _emitTree(context, name, nameType);
      if (exit) {
        _endScope(context);
        break;
      }
      switch (next.text) {
        case "{":
          break; // TODO:
        case "=":
          _emit1(next, nameType, valType);
          _copyContext(tmpContext, context);
          _startScope(context, ZONE_TYPE.OPT_VALUE);
          if (
            name.text === "DATA" ||
            _isDatasetOpt(name.op === undefined ? name.text : name.op.text)
          ) {
            val = _dsExpr(context);
          } else {
            val = _expr(context, {}, true);
          }
          // The first part after '=' is always treated as option value
          if (val.type) {
            //TODO: need to be improved
            _emit(val, valType);
          } else if (val.op && val.op.zone === ZONE_TYPE.OBJECT) {
            // FIXID S1271196
            val.op.zone = valType; // Not use _emit, we force to set valType
          }
          _emitTree(context, val);
          opts.push({ op: next, op1: name, op2: val });
          _endScope(context);
          break;
        default: {
          opts.push(name);
        }
      }
      _endScope(context);
    }
    return opts;
  }
  function _dsExpr(context) {
    var token1 = _getNextEx(context),
      tmpContext = _cloneContext(context),
      token2 = _getNextEx(tmpContext);
    if (token2.text === "(") {
      _emit(token1, ZONE_TYPE.OBJECT);
      return { op: token1, op1: _datasetOptions(context) };
    } else {
      _emit(token1, ZONE_TYPE.OPT_VALUE);
      return token1;
    }
  }
  function _argList(context, obj, nameType, valType) {
    var token = _getNextEx(context),
      tmpContext = null,
      items = [],
      lopd,
      exit = false,
      val,
      marks = { "(": ")", "[": "]", "{": "}" },
      lmark = token.text,
      rmark = marks[lmark],
      ends = {};

    if (!nameType) nameType = ZONE_TYPE.SUB_OPT_NAME;
    if (!valType) valType = ZONE_TYPE.SUB_OPT_VALUE;
    ends[rmark] = 1;
    _emit1(token, obj ? obj.zone : ZONE_TYPE.RESTRICTED, nameType);
    _startScope(context, ZONE_TYPE.ARG_LIST, obj);
    items.push(token);
    do {
      lopd = _expr(context, ends); //complex expression
      if (lopd.op === undefined) {
        //token
        _emit(lopd, nameType);
      } else if (lopd.op.text === "=") {
        if (lopd.op1.op === undefined) {
          _emit(lopd.op1, nameType);
        }
        _emit1(lopd.op, nameType, valType);
        if (lopd.op2.op === undefined) {
          _emit(lopd.op2, valType);
        }
      }
      //tmpContext = _cloneContext(context);
      //lopd = _getNextEx(tmpContext);//simple name
      //_emit(lopd, nameType);
      exit = true;
      switch (lopd.text) {
        case rmark:
          if (lopd.pos < 2) _emit(lopd, ZONE_TYPE.RESTRICTED);
          _copyContext(tmpContext, context);
          break;
        case ";":
          if (lopd.pos < 2) _emit(lopd, ZONE_TYPE.RESTRICTED);
          break;
        case "":
          break;
        default: {
          exit = false;
        }
      }
      if (exit) {
        items.push(lopd);
        break;
      }

      //_copyContext(tmpContext, context);
      tmpContext = _cloneContext(context);
      token = _getNextEx(tmpContext);
      switch (token.text) {
        case "":
          _emit(token, nameType);
          items.push(lopd, token); // the '' token
          exit = true;
          break;
        case ";":
          if (token.pos >= 2) _emit(token, nameType);
          items.push(lopd, token);
          exit = true;
          break;
        case rmark:
          _emit1(token, nameType, ZONE_TYPE.RESTRICTED);
          items.push(lopd, token);
          _copyContext(tmpContext, context);
          exit = true;
          break;
        case "=":
          _copyContext(tmpContext, context);
          _emit1(token, nameType, valType);
          val = _expr(context);
          if (val.op === undefined) {
            _emit(val, valType);
          }
          items.push({
            op: token,
            op1: lopd,
            op2: val,
          });
          break;
        case ",":
          items.push(lopd);
          _copyContext(tmpContext, context);
          break;
        default:
          items.push(lopd);
      }
    } while (!exit);
    _endScope(context);
    return items;
  }
  function _tryGetOpr(context) {
    var tmpContext = _cloneContext(context),
      token = _getNextEx(tmpContext);

    return { token: token, context: tmpContext };
  }

  function _expr(context, ends, one) {
    var token1,
      text,
      ret,
      item = null,
      tmpContext = _cloneContext(context);
    //e.g.: left(symget('dmktdesopts'));
    token1 = _getNextEx(tmpContext);
    if (ends && ends[token1.text]) {
      return _dummyToken;
    } else if (_isScopeBeginMark[token1.text]) {
      //item = {'op': token1,'op1':_argList(context,null)};// complicated expression
      item = _argList(context, null);
      //return item; //not return
    } else if (Lexer.isUnaryOpr[token1.text]) {
      _copyContext(tmpContext, context);
      item = { op: token1, op1: _expr(context, ends, true) }; //not return
    } else {
      item = token1;
      _emit(
        token1,
        token1.text[0] === "%" ? ZONE_TYPE.MACRO_FUNC : ZONE_TYPE.SIMPLE_ITEM
      );
      _copyContext(tmpContext, context);
    }
    for (;;) {
      ret = _tryGetOpr(context);
      text = ret.token.text;
      if (Lexer.isBinaryOpr[text] && !one /*|| SasLexer.isUnaryOpr[text]*/) {
        //ATTENTION: not concern the priority
        _copyContext(ret.context, context);
        item = { op: ret.token, op1: item, op2: _expr(context, ends) };
      } else if (_isScopeBeginMark[text]) {
        _emit(token1, _checkFuncType(token1)); //call or config
        item = { op: token1, op1: _argList(context, token1) };
      } else {
        return item;
      }
    }
  }
  //function _func(context,name) {
  //TODO:
  //}
  function _dataSec(context) {
    var token = null,
      text = null,
      inBlock = false;
    _skipToStmtStart(context, true);
    token = _getNextEx(context);

    if (Lexer.isWord[token.type]) {
      text = token.text.toUpperCase();
      if (token.pos >= 0) {
        inBlock = _inBlock(context.block, token) >= 0;
        if (
          (inBlock && text !== "DATA") ||
          (!inBlock && //not in block
            !_endedReally(context.block))
        ) {
          //not really end the last block
          _procName = _blockName(context.block);
          if (text[0] === "%") {
            return ZONE_TYPE.MACRO_STMT;
          } else {
            return ZONE_TYPE.DATA_STEP_STMT;
          }
        } else {
          return ZONE_TYPE.GBL_STMT;
        }
      } else {
        _stmtName = text;
        switch (text) {
          case "PROC":
          case "PROCEDURE":
            return _procDef(context);
          case "DATA":
            return _dataDef(context, token);
          //case '%SYSCALL':
          //case 'CALL': return _callStmt(context);
          case "SET":
          case "MERGE":
          case "MODIFY":
          case "UPDATE":
            return _setStmt(context, token);
          default:
            return _dataStmt(context, token);
        }
      }
    } else return _dataStmt(context, token);
  }
  function _dataDef(context, stmt) {
    var token1,
      token2,
      tmpContext,
      opts = [],
      viewOrPrg,
      stack = [],
      name;
    _topZone = ZONE_TYPE.DATA_STEP_DEF;
    token1 = _getNextEx(context);
    tmpContext = _cloneContext(context);
    token2 = _getNextEx(tmpContext);
    if (Lexer.isWord[token1.type] || token1.type === "string") {
      switch (token2.text) {
        case "/": //data step option
          _emit(
            token1,
            token1.text === "_NULL_"
              ? ZONE_TYPE.DATA_STEP_DEF_OPT
              : ZONE_TYPE.DATA_SET_NAME
          );
          _emit1(token2, ZONE_TYPE.DATA_SET_NAME, ZONE_TYPE.DATA_STEP_OPT_NAME);
          _copyContext(tmpContext, context);
          opts.push(token1, token2, _datastepOptions(context));
          break;
        case "=": // view name or program name
          _emit(token1, ZONE_TYPE.DATA_STEP_DEF_OPT);
          _emit1(
            token2,
            ZONE_TYPE.DATA_STEP_DEF_OPT,
            ZONE_TYPE.VIEW_OR_PGM_NAME
          );
          name = token1.text;
          viewOrPrg = { op: token2, op1: token1 };
          opts.push(viewOrPrg);
          _copyContext(tmpContext, context);
          token1 = _getNextEx(context); // view name or program name
          viewOrPrg["op2"] = token1;
          if (Lexer.isWord[token1.type]) {
            _emit(token1, ZONE_TYPE.VIEW_OR_PGM_NAME);
            tmpContext = _cloneContext(context);
            token2 = _getNextEx(tmpContext);
            if (token2.text === "(") {
              _emit(token1, ZONE_TYPE.OBJECT);
              viewOrPrg["op2"] = {
                op: token1,
                op1: _argList(
                  context,
                  token1,
                  ZONE_TYPE.VIEW_OR_PGM_OPT_NAME,
                  ZONE_TYPE.VIEW_OR_PGM_OPT_VALUE
                ),
              };
              token2 = _getNextEx(context);
            }
            if (
              (token2.text === ";" || Lexer.isWord[token2.type]) &&
              (name === "VIEW" || name === "PGM")
            ) {
              _emit(token2, ZONE_TYPE.VIEW_OR_PGM_SUB_OPT_NAME); //NOLIST
              opts.push(token2);
            }
          }
          break;
        case "":
          _emit(token1, ZONE_TYPE.DATA_STEP_DEF_OPT);
          opts.push(token1);
          break;
        default: {
          for (;;) {
            _emit(
              token1,
              token1.text === "_NULL_"
                ? ZONE_TYPE.DATA_STEP_DEF_OPT
                : ZONE_TYPE.VIEW_OR_DATA_SET_NAME
            );
            if (token2.text === "(") {
              // data set option
              _emit(token1, ZONE_TYPE.DATA_SET_NAME);
              opts.push({ op: token1, op1: _datasetOptions(context) });
            } else {
              opts.push(token1);
            }
            token1 = _getNextEx(context);
            tmpContext = _cloneContext(context);
            token2 = _getNextEx(tmpContext);
            if (token1.text === "") {
              _emit(token1, ZONE_TYPE.VIEW_OR_DATA_SET_NAME);
              opts.push(token1);
              break;
            } else if (token1.text === "/") {
              _emit1(
                token1,
                ZONE_TYPE.VIEW_OR_DATA_SET_NAME,
                ZONE_TYPE.DATA_STEP_OPT_NAME
              );
              opts.push(token1, _datastepOptions(context));
              break;
            } else if (token1.text === ";") {
              break;
            }
          }
        }
      }
    } else if (token1.text === "/") {
      _emit1(token1, ZONE_TYPE.STMT_NAME, ZONE_TYPE.DATA_STEP_OPT_NAME);
      opts.push(token1, _datastepOptions(context));
    } else {
      // error
    }

    _context({ op: "DATA", op1: opts }, stack);
    var zone = _zone(stack, context);
    return zone.type;
  }
  //only for debug
  //function _getZoneName(zone) {
  //    for(var attr in ZONE_TYPE) {
  //        if (ZONE_TYPE.hasOwnProperty(attr)) {
  //            if (ZONE_TYPE[attr] === zone) {
  //                return attr;
  //            }
  //        }
  //    }
  //}
  function _datasetOptions(context, stmt) {
    var token1 = _getNextEx(context),
      equal,
      tmpContext,
      optVal,
      simpleVal,
      moreVals = [],
      opts = []; // ignore '('
    _emit1(
      token1,
      ZONE_TYPE.VIEW_OR_DATA_SET_NAME,
      ZONE_TYPE.DATA_SET_OPT_NAME
    );
    opts.push(token1);
    for (;;) {
      tmpContext = _cloneContext(context);
      token1 = _getNextEx(tmpContext); //optiona name
      _emit(token1, ZONE_TYPE.DATA_SET_OPT_NAME);
      switch (token1.text) {
        case "":
        case ";":
          opts.push(token1);
          return opts;
        case ")":
          _emit1(token1, ZONE_TYPE.DATA_SET_OPT_NAME, ZONE_TYPE.RESTRICTED);
          opts.push(token1);
          _copyContext(tmpContext, context);
          return opts;
        default:
          if (Lexer.isWord[token1.type] === undefined) {
            return opts;
          }
      }
      _copyContext(tmpContext, context);
      //tmpContext = _cloneContext(context);
      equal = _getNextEx(tmpContext);

      if (equal.text !== "=") {
        opts.push(token1);
        continue;
      }
      _copyContext(tmpContext, context);
      _emit1(equal, ZONE_TYPE.DATA_SET_OPT_NAME, ZONE_TYPE.DATA_SET_OPT_VALUE);

      switch (token1.text) {
        case "INDEX":
        case "RENAME":
        case "WHERE":
          //token2 = _getNextEx(tmpContext);
          //if (token2.text === '(') {
          //    optVal = _argList(context, token1);
          //}
          optVal = _expr(context);
          break;
        case "SORTEDBY":
          optVal = _expr(context);
          if (optVal.op === undefined) {
            _emit(optVal, ZONE_TYPE.DATA_SET_OPT_VALUE);
          }
          break;
        default: {
          //optVal = _getNextEx(context);
          optVal = _expr(context);
          simpleVal = _firstToken(optVal);
          if (simpleVal.pos >= 0)
            _emit(simpleVal, ZONE_TYPE.DATA_SET_OPT_VALUE);
          if (token1.text === "DROP" || token1.text === "KEEP") {
            moreVals = _tryGetMoreVals(context, ZONE_TYPE.DATA_SET_OPT_VALUE);
            if (moreVals.length) {
              optVal = [optVal].concat(moreVals);
            }
          }
        }
      }
      opts.push({ op: equal, op1: token1, op2: optVal });
      if (optVal.text === ")") {
        break;
      }
    }
    return opts;
  }
  function _tryGetMoreVals(context, emitType) {
    var tmpContext1 = _cloneContext(context),
      token1,
      tmpContext2,
      token2,
      vals = [],
      notExpected = /[\/\);]/;
    for (;;) {
      token1 = _getNextEx(tmpContext1);
      tmpContext2 = _cloneContext(tmpContext1);
      token2 = _getNextEx(tmpContext2);
      if (
        token2.text === "=" ||
        notExpected.test(token1.text) ||
        token1.text === ""
      ) {
        return vals;
      } else {
        _emit(token1, emitType);
        vals.push(token1);
        _copyContext(tmpContext1, context);
      }
    }
  }
  function _datastepOptions(context) {
    return _stmtOptions(
      context,
      null,
      ZONE_TYPE.DATA_STEP_OPT_NAME,
      ZONE_TYPE.DATA_STEP_OPT_VALUE
    );
  }
  function _dataStmt(context, stmt) {
    var token = null,
      text = null,
      zone,
      newContext = {
        block: context.block,
        line: context.cursor.line,
        col: context.cursor.col,
        syntaxIdx: -1,
        cursor: context.cursor,
        lexer: _lexer,
      };
    _topZone = ZONE_TYPE.DATA_STEP_STMT;
    _stmtName = stmt.text.toUpperCase();
    //special for call statement, and ignore others currently
    token = _getPrev(newContext); // current
    text = token.text.toUpperCase();
    if ((_stmtName === "IF" || _stmtName === "CALL") && /^CALL\b/.test(text)) {
      return _callStmt(newContext);
    }
    zone = _stmtEx(context, stmt);
    if (_isCall(zone)) {
      return ZONE_TYPE.RESTRICTED;
    } else if (zone.type === ZONE_TYPE.STMT_NAME) {
      return ZONE_TYPE.DATA_STEP_STMT;
    } else if (zone.type === ZONE_TYPE.OPT_NAME) {
      return ZONE_TYPE.DATA_STEP_STMT_OPT;
    } else if (zone.type === ZONE_TYPE.OPT_VALUE) {
      return ZONE_TYPE.DATA_STEP_STMT_OPT_VALUE;
    }
    return zone.type;
  }
  function _callStmt(context) {
    return ZONE_TYPE.CALL_ROUTINE;
  }
  function _setStmt(context, stmt) {
    var item,
      next,
      tmpContext,
      opts = [],
      allowOption = false,
      stack = [],
      zone,
      exit = false;
    _stmtName = stmt.text;
    do {
      item = _getNextEx(context);
      if (item.text === "") {
        //if (!allowOption) _emit(item, ZONE_TYPE.RESTRICTED);
        //else {
        _emit(item, ZONE_TYPE.DATA_STEP_STMT_OPT);
        //}
        exit = true;
      } else if (item.text === ";") {
        if (item.pos >= 2 && allowOption) {
          _emit(item, ZONE_TYPE.DATA_STEP_STMT_OPT);
        }
        exit = true;
      } else if (Lexer.isWord[item.type]) {
        tmpContext = _cloneContext(context);
        next = _getNextEx(tmpContext);
        if (next.text === "(") {
          //data set options
          item = { op: item, op1: _datasetOptions(context) };
        } else if (next.text === "=") {
          //set options
          _emit(item, ZONE_TYPE.DATA_STEP_STMT_OPT);
          _emit1(
            next,
            ZONE_TYPE.DATA_STEP_STMT_OPT,
            ZONE_TYPE.DATA_STEP_STMT_OPT_VALUE
          );
          _copyContext(tmpContext, context);
          item = { op: next, op1: item, op2: _expr(context) };
        } else {
          _emit(item, ZONE_TYPE.DATA_STEP_STMT_OPT);
        }
        allowOption = true;
      }
      opts.push(item);
    } while (!exit);
    _context({ op: stmt, op1: opts }, stack);
    zone = _zone(stack, context);
    if (zone.type === ZONE_TYPE.OPT_VALUE) {
      zone.type = ZONE_TYPE.DATA_STEP_STMT_OPT_VALUE;
    } else if (zone.type === undefined) {
      // dataset
      zone.type = ZONE_TYPE.DATA_STEP_STMT_OPT;
    }
    return zone.type;
  }
  function _macroSec(context) {
    var token = null,
      text = null,
      embeddedBlock = null;
    _skipToStmtStart(context, true);
    token = _getNextEx(context);
    _stmtName = token.text;
    if (Lexer.isWord[token.type]) {
      text = token.text;
      if (token.pos >= 0) {
        if (_inBlock(context.block, token) >= 0) {
          // in block
          embeddedBlock = _embeddedBlock(context.block, {
            line: token.line,
            col: token.col - 1,
          });
          if (embeddedBlock) {
            context.block = embeddedBlock;
            context.line = context.cursor.line;
            context.col = context.cursor.col - 1;
            if (embeddedBlock.type === SEC_TYPE.PROC) {
              return _procSec(context, text);
            } else return _dataSec(context, text);
          }
        }
        if (text[0] === "%") {
          return ZONE_TYPE.MACRO_STMT;
        } else {
          return ZONE_TYPE.GBL_STMT;
        }
      } else {
        switch (text) {
          case "%MACRO":
            return _macroDef(context);
          case "PROC":
            return _procDef(context);
          case "DATA":
            return _dataDef(context, token);
          default: {
            embeddedBlock = _embeddedBlock(context.block, {
              line: token.line,
              col: token.col - 1,
            });
            if (embeddedBlock) {
              context.block = embeddedBlock;
              context.line = context.cursor.line;
              context.col = context.cursor.col - 1;
              if (embeddedBlock.type === SEC_TYPE.PROC) {
                return _procSec(context, text);
              } else return _dataSec(context, text);
            } else return _macroStmt(context, token);
          }
        }
      }
    } else return _macroStmt(context, token);
  }
  function _macroDef(context) {
    var name = _getNextEx(context),
      token,
      tmpContext,
      opts = [],
      stack = [],
      zone;

    _emit(name, ZONE_TYPE.RESTRICTED); // macro name

    tmpContext = _cloneContext(context);
    token = _getNextEx(tmpContext);
    if (token.text === "(") {
      opts.push({ op: name, op1: _argList(context) });
      token = _getNextEx(context);
    } else {
      _copyContext(tmpContext, context);
      opts.push(name);
    }
    if (token.text === "/") {
      _emit1(token, ZONE_TYPE.RESTRICTED, ZONE_TYPE.MACRO_DEF_OPT);
      opts.push(
        token,
        _stmtOptions(
          context,
          null,
          ZONE_TYPE.MACRO_DEF_OPT,
          ZONE_TYPE.RESTRICTED
        )
      );
    }
    _context({ op: "%MACRO", op1: opts }, stack);
    zone = _zone(stack, context);
    return zone.type;
  }
  function _macroStmt(context, stmt) {
    var embeddedBlock = _embeddedBlock(context.block, context.cursor),
      tokens,
      stack = [],
      zone,
      name;
    if (embeddedBlock) {
      if (_isStatgraph(context.block, context.cursor, stmt.text)) {
        _procName = "STATGRAPH";
      } else _procName = _blockName(context.block);
      return _procStmt(context, stmt.text);
    } else if (stmt.text[0] === "%") {
      name = stmt.text.substring(1);
      if (_specialStmt[name]) {
        tokens = _specialStmt[name].call(
          this,
          context,
          stmt,
          ZONE_TYPE.MACRO_STMT_OPT
        );
      } else if (_stmtName === "%SYSCALL" && /^%SYSCALL\b/.test(stmt.text)) {
        return _callStmt(context);
      } else {
        var tmpContext = _cloneContext(context);
        var next = _getNextEx(tmpContext);
        if (next.text === "%WHILE" || next.text === "%UNTIL") {
          //adjust statement name
          //_stmtName += " ";
          //_stmtName += next.text;
          _stmtName = next.text;
          _copyContext(tmpContext, context);
          tokens = { op: next, op1: _expr(context) }; //ignore %do
          _emit(next, ZONE_TYPE.MACRO_STMT);
        } else {
          tokens = {
            op: stmt,
            op1: _stmtOptions(
              context,
              null,
              ZONE_TYPE.MACRO_STMT_OPT,
              ZONE_TYPE.MACRO_STMT_OPT_VALUE
            ),
          };
        }
      }
      _context(tokens, stack);
      zone = _zone(stack, context);
      if (zone.type === ZONE_TYPE.STMT_NAME) {
        return _stmtName[0] === "%" ? ZONE_TYPE.MACRO_STMT : ZONE_TYPE.GBL_STMT;
      }
      return zone.type;
    }

    return _globalStmt(context);
  }
  function _normalize(line, col) {
    if (col < 0) {
      if (line < 1) {
        line = 0;
        col = 0;
      } else {
        line--;
        col = _model.getLine(line).length;
      }
    }
    return { line: line, col: col };
  }
  function _cloneContext(context) {
    var obj = {};
    for (var attr in context) {
      if (context.hasOwnProperty(attr)) {
        obj[attr] = context[attr]; //not deep clone
      }
    }
    return obj;
  }
  function _copyContext(src, dst) {
    for (var attr in src) {
      if (src.hasOwnProperty(attr)) {
        dst[attr] = src[attr];
      }
    }
  }
  function _currentZone(line, col) {
    var newToken = _token(line, col),
      newPos,
      type = newToken.type, //self.type(line,col),
      context = null,
      pos = _normalize(line, col - 1),
      tmpLine = pos.line,
      tmpCol = pos.col,
      token = _token(tmpLine, tmpCol),
      block = _langServ.getFoldingBlock(tmpLine, tmpCol);
    /* first check type to determine zone, some special conditions
     * 1) for bringing up auto completion popup by shortcut,
     * 2) input at the end of a line in comment or literal
     */
    pos = _pos({ line: line, col: col }, token);
    newPos = _pos({ line: line, col: col }, newToken);
    if (pos === 1 || newPos === 1 || !_ended(token)) {
      //&& (SasLexer.isComment[type] || SasLexer.isLiteral[type])
      ///*|| SasLexer.isComment[type] || SasLexer.isLiteral[type]*/) {
      //return ZONE_TYPE.RESTRCITED;
      if (Lexer.isComment[type]) return ZONE_TYPE.COMMENT;
      if (type === "string") return ZONE_TYPE.QUOTED_STR;
      if (type === "cards-data") return ZONE_TYPE.DATALINES;
      if (Lexer.isLiteral[type]) return ZONE_TYPE.LITERAL;
    }
    context = {
      block: block,
      line: line,
      col: col - 1, //
      syntaxIdx: -1,
      cursor: { line: line, col: col },
      lexer: _lexer,
    };
    _reset();
    //_skipToStmtStart(context,true);
    if (_sectionMode) {
      if (_sectionMode.secType === SEC_TYPE.PROC) {
        _skipToStmtStart(context, true);
        token = _getNextEx(context);
        _procName = _sectionMode.procName.toUpperCase();
        return _procStmt(context, token);
      }
    }
    if (!block || _isBlockStart(block, token)) {
      return _globalStmt(context);
    } else if (block.type === SEC_TYPE.PROC) {
      return _procSec(context);
    } else if (block.type === SEC_TYPE.DATA) {
      return _dataSec(context);
    } else if (block.type === SEC_TYPE.MACRO) {
      return _macroSec(context);
    }
  }
  /* The followings are the APIs for code zone manager.*/
  this.getProcName = function () {
    return _procName;
  };
  this.getStmtName = function () {
    return _stmtName;
  };
  this.getOptionName = function () {
    return _optName;
  };
  this.getSubOptionName = function () {
    return _subOptName;
  };
  this.getCurrentZone = function (line, col) {
    try {
      return _currentZone(line, col);
    } catch (e) {
      return ZONE_TYPE.RESTRCITED;
    }
  };
  this.getContextPrompt = function (line, col) {
    this.getCurrentZone(line, col);
  };
  this.setSectionMode = function (secType, procName) {
    _sectionMode = {
      secType: secType,
      procName: procName,
    };
  };
};
CodeZoneManager.ZONE_TYPE = {
  RESTRICTED: 10,
  SIMPLE_ITEM: 11,
  STMT_NAME: 12,
  OPT_ITEM: 13,
  OPT_NAME: 14,
  OPT_NAME_REQ: 114,
  OPT_VALUE: 15,
  CALL_OR_CONFIG: 16,
  OBJECT: 17,
  SUB_OPT_NAME: 18,
  SUB_OPT_VALUE: 19,
  // global statement related
  GBL_STMT: 500,
  GBL_STMT_OPT: 501,
  GBL_STMT_OPT_VALUE: 502,
  GBL_STMT_SUB_OPT_NAME: 503,
  // procedure related
  PROC_DEF: 510,
  PROC_OPT: 511,
  PROC_OPT_VALUE: 512,
  PROC_SUB_OPT_NAME: 509, //
  PROC_STMT: 515,
  PROC_STMT_OPT: 516,
  PROC_STMT_OPT_REQ: 514,
  PROC_STMT_OPT_VALUE: 517,
  PROC_STMT_SUB_OPT: 518,
  PROC_STMT_SUB_OPT_VALUE: 519,
  // data step related
  DATA_STEP_DEF: 520,
  DATA_STEP_DEF_OPT: 521,
  DATA_STEP_OPT_NAME: 522,
  DATA_STEP_OPT_VALUE: 523,
  DATA_SET_NAME: 524,
  VIEW_OR_DATA_SET_NAME: 525,
  DATA_SET_OPT_NAME: 526,
  DATA_SET_OPT_VALUE: 530,
  VIEW_OR_PGM_NAME: 531,
  VIEW_OR_PGM_OPT_NAME: 532,
  VIEW_OR_PGM_OPT_VALUE: 533,
  VIEW_OR_PGM_SUB_OPT_NAME: 534,
  DATA_STEP_STMT: 540,
  DATA_STEP_STMT_OPT: 541,
  DATA_STEP_STMT_OPT_VALUE: 542,
  // macro related
  MACRO_DEF: 545,
  MACRO_DEF_OPT: 546,
  MACRO_STMT: 547,
  MACRO_STMT_OPT: 548,
  MACRO_STMT_OPT_VALUE: 549,
  MACRO_STMT_BODY: 550,
  // style related
  STYLE_LOC: 555,
  STYLE_ELEMENT: 556,
  STYLE_ATTR: 557,
  // literals or comment
  QUOTED_STR: 600,
  COMMENT: 601,
  LITERAL: 602,
  COLOR: 605,
  FORMAT: 606,
  INFORMAT: 607,
  MACRO_FUNC: 608,
  SAS_FUNC: 609,
  STAT_KW: 610,
  AUTO_MACRO_VAR: 611,
  MACRO_VAR: 612,
  DATALINES: 613,
  LIB: 614,
  // misc
  CALL_ROUTINE: 700,
  ARG_LIST: 701,
  ARG_LIST_START: 702,
  ARG_LIST_END: 703,
  TAGSETS_NAME: 704,
  ODS_STMT: 705,
  ODS_STMT_OPT: 706,
  ODS_STMT_OPT_VALUE: 707,
};
const _CodeZoneManager = CodeZoneManager;
export { _CodeZoneManager as CodeZoneManager };
