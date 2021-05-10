/* eslint-disable */
import { arrayToMap } from "./utils";

const getBaseUrl = () => "../..";

// ResLoader
var ResLoader = (function () {
  return {
    get: function (url, cb, async) {
      /*jQuery.ajax({
                    //type: "get",
                    url: url,
                    dataType: "json",
                    async: !!async,
                    success: function(data, textStatus, xhr) {
                        if (cb) {
                            cb(data);
                        }
                    },
                    error: function(xhr, textStatus, error) {
                        if (cb) {
                            cb(null);
                        }
                    }
                });*/
      cb(require(url));
    },
  };
})();

// SasLanguageService
var SasLanguageService = function () {};
(function () {
  var db = {
      procOpts: {},
      procStmts: {},
      kwPool: {},
      stmts: {},
      functions: {},
      sasColors: [],
    },
    ID_HELP = "_$help",
    ID_TYPE = "_$type",
    ID_OPTS = "_$options",
    ID_OPTS_REQ = "_$optionsReq",
    ID_VALS = "_$values",
    ID_STMTS = "_$stms",
    ID_HAS_OPT_DELIMITER = "_$hasOptDelimiter",
    ID_SUB_OPTS = "_$subOpts",
    ID_KEYWORDS = "_$keywords",
    ID_ALIAS = "_$alias",
    ID_ATTR = "_$attr",
    ID_SYNTAX = "_$syntax",
    ID_SUPPORT_SITE = "_$supportSite",
    stmtTable = arrayToMap([
      "ABORT",
      "ARRAY",
      "ATTRIB",
      "AXIS",
      "ENDRSUBMIT",
      "FILE",
      "FILENAME",
      "FOOTNOTE",
      "FORMAT",
      "GOPTIONS",
      "INFILE",
      "INFORMAT",
      "KILLTASK",
      "LEGEND",
      "LIBNAME",
      "LISTTASK",
      "LOCK",
      "NOTE",
      "ODS",
      "OPTIONS",
      "PATTERN",
      "RDISPLAY",
      "RGET",
      "RSUBMIT",
      "RUN",
      "SIGNOFF",
      "SIGNON",
      "SYMBOL",
      "SYSTASK",
      "TITLE",
      "CAS",
      "CASLIB",
      "WAITFOR",
      "WHERE",
      "DATA-SET",
      "DATA-STEP",
    ]),
    procTable = arrayToMap([
      "MACRO",
      "ODS",
      "DATA",
      "STATGRAPH",
      "DEFINE_TAGSET",
      "DEFINE_EVENT",
    ]),
    libService;

  // Utilities
  function _uniq(arr) {
    var a = [],
      o = {},
      i,
      v,
      len = arr.length;
    if (len < 2) {
      return arr;
    }
    for (i = 0; i < len; i++) {
      v = arr[i];
      if (!o[v]) {
        a.push(v);
        o[v] = true;
      }
    }
    return a;
  }

  function _notify(cb, data) {
    if (cb) {
      setTimeout(function () {
        cb(data);
      }, 0);
    }
    return data;
  }

  function _obj(root) {
    var i = 1,
      obj = root;
    for (
      ;
      obj && (arguments[i] !== undefined || arguments[i + 1] !== undefined);
      i++
    ) {
      obj = obj[arguments[i]];
    }
    return obj;
  }

  function _removeEqu(name) {
    return name.replace("=", "");
  }
  function _cleanName(name) {
    var matched = /^\((.*)\)$/.exec(name);
    if (matched) {
      return matched[1];
    } else {
      return name.replace(/(\(.*\))|=/g, "");
    }
  }
  function _resolveAliasFromPubs(alias, item) {
    var cloneItem = JSON.parse(JSON.stringify(item)); // deep clone
    cloneItem.name = alias;
    var index = cloneItem.aliases.indexOf(alias);
    cloneItem.aliases.splice(index, 1, item.name);
    return cloneItem;
  }
  function _resolveAlias(name, pool) {
    return pool.split("|").filter(function (item) {
      return item && _removeEqu(item) !== name;
    });
  }

  function _stmtOptSupportSite(context, stmtName, optName) {
    var supportSite = _procStmtObj(context, stmtName)[ID_SUPPORT_SITE];
    if (supportSite) {
      var optionSite = _procStmtObj(context, stmtName, optName)[
        ID_SUPPORT_SITE
      ];
      if (optionSite && optionSite.docsetTargetFile) {
        return optionSite;
      }
      supportSite = Object.assign({}, supportSite);
      supportSite.supportSiteTargetFile = supportSite.docsetTargetFile;
      supportSite.supportSiteTargetFragment = optionSite;
    }
    return supportSite;
  }

  function _procOptSupportSite(procName, optName) {
    var supportSite = _procOptObj(procName)[ID_SUPPORT_SITE];
    if (supportSite) {
      supportSite = Object.assign({}, supportSite);
      supportSite.supportSiteTargetFragment = _procOptObj(
        procName,
        _removeEqu(optName)
      )[ID_SUPPORT_SITE];
    }
    return supportSite;
  }

  function _procStmtOptSupportSite(procName, stmtName, optName) {
    var supportSite = _procOptObj(procName)[ID_SUPPORT_SITE];
    if (supportSite) {
      supportSite = Object.assign({}, supportSite);
      supportSite.supportSiteTargetFile = _procStmtObj(procName, stmtName)[
        ID_SUPPORT_SITE
      ];
      supportSite.supportSiteTargetFragment = _procStmtObj(
        procName,
        stmtName,
        optName
      )[ID_SUPPORT_SITE];
    }
    return supportSite;
  }

  function _procOptObj(procName, optName, valName, subOptName) {
    if (optName) {
      optName = _removeEqu(optName);
    }
    if (subOptName) {
      subOptName = _removeEqu(subOptName);
    }
    return _obj(db.procOpts, procName, optName, valName, subOptName);
  }

  function _procStmtObj(procName, stmtName, optName, valName, subOptName) {
    if (optName) {
      optName = _removeEqu(optName);
    }
    if (subOptName) {
      subOptName = _removeEqu(subOptName);
    }
    return _obj(db.procStmts, procName, stmtName, optName, valName, subOptName);
  }

  function _keywordObj(type, name) {
    return _obj(db.kwPool, type, name);
  }

  function _stmtObj(stmtName, optName, valName) {
    if (optName) {
      optName = _removeEqu(optName);
    }
    return _obj(db.stmts, stmtName, optName, valName);
  }

  function _funcObj(funcName, context) {
    return _obj(db.functions, context, funcName);
  }

  var Type2File = {
    formats: "SASFormats.json",
    informats: "SASInformats.json",
    "macro-func": "SASMacroFunctions.json",
    "macro-stmt": "SASMacroStatements.json",
    "macro-def-opt": "MacroDefinitionOptions.json",
    "ods-tagsets": "ODS_Tagsets.json",
    "auto-var": "SASAutoVariables.json",
    "autocall-macro": "SASAutocallMacros.json",
    "arm-macro": "SASARMMacros.json",
    "call-routines": "SASCallRoutines.json",
    "hash-pack-method": "HashPackageMethods.json",
    "stat-kw": "StatisticsKeywords.json",
    "style-loc": "StyleLocations.json",
    "style-att": "StyleAttributes.json",
    "style-ele": "StyleElements.json",
    func: "SASFunctions.json",
    "ds-stmt": "SASDataStepStatements.json",
    "ds-option": "SASDataSetOptions.json",
    "gbl-stmt": "SASGlobalStatements.json",
    "gbl-proc-stmt": "SASGlobalProcedureStatements.json",
    proc: "SASProcedures.json",
    "datastep-option": "SASDataStepOptions.json",
    "datastep-option2": "SASDataStepOptions2.json",
    sql: "SQLKeywords.json",
  };
  function _resolveURL(type, stmtName) {
    var url = getBaseUrl() + "/data/";
    if (Type2File[type]) {
      url += Type2File[type];
    } else {
      url = null;
    }
    return url;
  }

  function _getSubOptKeywords(obj, data) {
    //obj must be an object
    var keywords = data.split("|"),
      list;
    if (!obj[ID_KEYWORDS]) {
      obj[ID_KEYWORDS] = [];
    }
    list = obj[ID_KEYWORDS];
    keywords.forEach(function (item) {
      item =
        typeof item === "string"
          ? item.trim()
          : item !== null
          ? String(item).trim()
          : "";
      if (item === "") return;
      obj[_removeEqu(item)] = true;
      list.push(item);
    });
    return obj;
  }

  function _getHelp(data) {
    return data ? data["#cdata"] : "";
  }

  function _iterateValues(values, tooltips, cb) {
    var i = 1,
      j = 0,
      name = "@Value" + i,
      names;
    while (values[name]) {
      names = values[name].split("|");
      for (j = 0; j < names.length; j++) {
        cb(j, names[j], tooltips ? tooltips["@ToolTip" + i] : undefined);
      }
      i++;
      name = "@Value" + i;
    }
  }

  function _iterateKeywords(keywords, cb) {
    var count = keywords.length;
    for (var i = 0; i < count; i++) {
      if (!keywords[i]["Name"]) continue;
      var names = keywords[i]["Name"].split("|");
      for (var j = 0; j < names.length; j++) {
        cb(i, names[j], keywords[i]);
      }
    }
  }

  function _tryToLoad(config) {
    if (!config.needToLoad()) {
      //data is ready
      return _notify(config.userCb, config.getData());
    } else {
      // data is not ready
      var async = !!config.userCb;
      if (async) {
        // async mode
        config.load(function () {
          config.userCb(config.getData());
        });
      } else {
        config.load();
        return config.getData();
      }
    }
  }

  // Sas Colors
  function _setColors(values, tooltips) {
    _iterateValues(values, null, function (i, name, tooltip) {
      db.sasColors.push(name);
    });
  }
  function _loadColors(cb) {
    var url = getBaseUrl() + "/data/SASColorValues.json";
    ResLoader.get(
      url,
      function (data) {
        if (data && data.Color) {
          _setColors(data.Color.Values);
          if (cb) cb();
        }
      },
      cb
    ); //if cb exists, use async mode
  }
  function _sasColorsLoaded() {
    return db.sasColors.length > 0;
  }

  function _tryToLoadColors(userCb) {
    return _tryToLoad({
      userCb: userCb,
      getData: function () {
        return db.sasColors;
      },
      needToLoad: function () {
        return !_sasColorsLoaded();
      },
      load: function (cb) {
        _loadColors(cb);
      },
    });
  }

  function _getFunctionHelp(funcName, context, userCb) {
    return _tryToLoadFunctionsFromPubs(context, userCb, function () {
      var data = _funcObj(funcName, context);
      if (data) {
        data = {
          key: funcName,
          data: data[ID_HELP],
          syntax: data[ID_SYNTAX],
          supportSite: data[ID_SUPPORT_SITE],
        };
      }
      return data;
    });
  }
  function _setFunctionsFromPubs(data, context) {
    if (!db.functions[context]) {
      db.functions[context] = {};
    }
    var list = [];
    data.forEach(function (fun) {
      list.push(fun.name);
      db.functions[context][fun.name] = {};
      db.functions[context][fun.name][ID_HELP] = fun.description;
      db.functions[context][fun.name][ID_SYNTAX] =
        fun.syntax && fun.syntax.help;
      db.functions[context][fun.name][ID_SUPPORT_SITE] =
        fun.supportSiteInformation;
    });
    db.functions[context][ID_KEYWORDS] = list;
  }
  function _loadFunctionsFromPubs(context, cb) {
    var url = getBaseUrl() + "/pubsdata/Functions/en/" + context + ".json";
    ResLoader.get(
      url,
      function (data) {
        if (data && data.length) {
          _setFunctionsFromPubs(data, context);
          if (cb) cb();
        }
      },
      cb
    ); //if cb exists, use async mode
  }
  function _FunctionsLoadedFromPubs(context) {
    return db.functions[context];
  }
  function _tryToLoadFunctionsFromPubs(context, userCb, getDataFunc) {
    return _tryToLoad({
      userCb: userCb,
      getData: getDataFunc,
      needToLoad: function () {
        return !_FunctionsLoadedFromPubs(context);
      },
      load: function (cb) {
        _loadFunctionsFromPubs(context, cb);
      },
    });
  }

  function _loadProceduresFromPubs(cb) {
    var url = getBaseUrl() + "/pubsdata/procedures.json";
    ResLoader.get(
      url,
      function (data) {
        if (data && data.length) {
          if (db.kwPool["proc"] === undefined) {
            db.kwPool["proc"] = {};
          }
          data.forEach(function (item) {
            db.kwPool["proc"][item] = {};
          });
          db.kwPool["proc"][ID_KEYWORDS] = data;
          if (cb) cb();
        }
      },
      cb
    ); //if cb exists, use async mode
  }
  function _tryToLoadProceduresFromPubs(userCb, getDataFunc) {
    return _tryToLoad({
      userCb: userCb,
      getData: getDataFunc,
      needToLoad: function () {
        return !_keywordLoaded("proc");
      },
      load: function (cb) {
        _loadProceduresFromPubs(cb);
      },
    });
  }

  // Context Prompt
  /*function _loadContextPrompt() {
        }*/

  // Statements
  function _setStatementOptionValueHelp(stmtName, optName, valName, help) {
    if (db.stmts[stmtName][optName][valName] === undefined) {
      db.stmts[stmtName][optName][valName] = {};
    }
    db.stmts[stmtName][optName][valName][ID_HELP] = help;
  }

  function _setStatementOptionValues(stmtName, optName, values, tooltips) {
    var list = [];
    _iterateValues(values, tooltips, function (i, name, tooltip) {
      list.push(name);
      if (tooltips) {
        _setStatementOptionValueHelp(
          stmtName,
          optName,
          name.toUpperCase(),
          tooltip
        );
      }
    });
    db.stmts[stmtName][optName][ID_VALS] = list;
  }
  function _setStatementOptionHelp(stmtName, optName, data) {
    db.stmts[stmtName][optName][ID_HELP] = _getHelp(data);
  }
  function _setStatementOptionType(stmtName, optName, data) {
    db.stmts[stmtName][optName][ID_TYPE] = data;
  }
  function _setStatementOptionAlias(stmtName, optName, data) {
    db.stmts[stmtName][optName][ID_ALIAS] = _resolveAlias(optName, data);
  }
  function _setStatementSubOptions(stmtName, optName, data) {
    var list = db.stmts[stmtName][optName][ID_SUB_OPTS] || {};
    _getSubOptKeywords(list, data);
    db.stmts[stmtName][optName][ID_SUB_OPTS] = list;
  }
  function _setStatementOption(stmtName, optName, data) {
    optName = _removeEqu(optName);
    if (db.stmts[stmtName][optName] === undefined) {
      db.stmts[stmtName][optName] = {};
    }
    _setStatementOptionHelp(stmtName, optName, data.Help);
    _setStatementOptionType(stmtName, optName, data.Type);
    _setStatementOptionAlias(stmtName, optName, data.Name);
    if (data.Values) {
      _setStatementOptionValues(stmtName, optName, data.Values, data.ToolTips);
    }
    if (data.SubOptionsKeywords) {
      _setStatementSubOptions(stmtName, optName, data.SubOptionsKeywords);
    }
  }

  function _setStatementOptions(stmtName, keywords) {
    var list = [];
    if (db.stmts[stmtName] === undefined) {
      db.stmts[stmtName] = {};
    }
    _iterateKeywords(keywords, function (i, name, data) {
      list.push(name);
      _setStatementOption(stmtName, name, data);
    });
    db.stmts[stmtName][ID_OPTS] = list;
  }

  function _loadStatementOptions(stmtName, cb) {
    var url = getBaseUrl() + "/data/";
    if (stmtName === "DATA-SET") url += "SASDataSetOptions";
    else if (stmtName === "DATA-STEP") url += "SASDataStepOptions";
    else url += "Statements/" + stmtName.toUpperCase();
    url += ".json";
    ResLoader.get(
      url,
      function (data) {
        if (data && data.Keywords) {
          _setStatementOptions(stmtName, data.Keywords.Keyword);
          if (cb) cb();
        }
      },
      cb
    );
  }

  function _statementLoaded(stmtName) {
    return db.stmts[stmtName];
  }

  function _tryToLoadStatementOptions(stmtName, userCb, getDataFunc) {
    return _tryToLoad({
      userCb: userCb,
      getData: getDataFunc,
      needToLoad: function () {
        return stmtTable[stmtName] && !_statementLoaded(stmtName);
      },
      load: function (cb) {
        _loadStatementOptions(stmtName, cb);
      },
    });
  }

  function _getStatementHelp(context, stmtName, userCb) {
    return _tryToLoadStatementsFromPubs(context, userCb, function () {
      var data = _procStmtObj(context, stmtName);
      if (data) {
        data = {
          key: stmtName,
          data: data[ID_HELP],
          alias: data[ID_ALIAS],
          syntax: data[ID_SYNTAX],
          supportSite: data[ID_SUPPORT_SITE],
        };
      }
      return data;
    });
  }
  function _setStatementsFromPubs(data, context) {
    if (!db.procStmts[context]) {
      db.procStmts[context] = {};
    }
    var list = [];
    data.forEach(function (stmt) {
      var stmtName = stmt.name;
      list.push(stmtName);
      if (db.procStmts[context][stmtName] === undefined) {
        db.procStmts[context][stmtName] = {};
        db.procStmts[context][stmtName][ID_HAS_OPT_DELIMITER] = false;
      }
      db.procStmts[context][stmtName][ID_HELP] = stmt.description;
      db.procStmts[context][stmtName][ID_SYNTAX] = stmt.help;
      db.procStmts[context][stmtName][ID_SUPPORT_SITE] =
        stmt.supportSiteInformation;
      db.procStmts[context][stmtName][ID_ALIAS] = stmt.aliases;
      var opts = stmt.arguments;
      if (opts && opts.length) {
        _setProcedureStatementOptionsFromPubs(context, stmtName, opts);
      }
      if (stmt.aliases) {
        stmt.aliases.forEach(function (alias) {
          list.push(alias);
          db.procStmts[context][alias] = JSON.parse(
            JSON.stringify({}, db.procStmts[context][stmtName])
          ); // deep clone
          db.procStmts[context][alias][ID_ALIAS] = _resolveAliasFromPubs(
            alias,
            stmt
          ).aliases;
        });
      }
    });
    db.procStmts[context][ID_STMTS] = list;
  }
  function _loadStatementsFromPubs(context, cb) {
    var url = getBaseUrl() + "/pubsdata/Statements/en/" + context + ".json";
    ResLoader.get(
      url,
      function (data) {
        if (data && data.length) {
          _setStatementsFromPubs(data, context);
          if (cb) cb();
        }
      },
      cb
    ); //if cb exists, use async mode
  }
  function _StatementsLoadedFromPubs(context) {
    return db.procStmts[context];
  }
  function _tryToLoadStatementsFromPubs(context, userCb, getDataFunc) {
    return _tryToLoad({
      userCb: userCb,
      getData: getDataFunc,
      needToLoad: function () {
        return !_StatementsLoadedFromPubs(context);
      },
      load: function (cb) {
        _loadStatementsFromPubs(context, cb);
      },
    });
  }

  // Keywords
  function _setKeywordHelp(type, name, data) {
    db.kwPool[type][name][ID_HELP] = _getHelp(data);
  }
  function _setKeywordAlias(type, name, data) {
    db.kwPool[type][name][ID_ALIAS] = _resolveAlias(name, data);
  }
  function _setKeywordAttr(type, name, data) {
    db.kwPool[type][name][ID_ATTR] = data;
  }
  function _setKeyword(type, name, data) {
    //TODO:
    if (db.kwPool[type][name] === undefined) {
      db.kwPool[type][name] = {};
    }
    _setKeywordHelp(type, name, data.Help);
    _setKeywordAlias(type, name, data.Name);
    _setKeywordAttr(type, name, data.Attributes);
  }
  function _setKeywords(type, keywords) {
    var list = [];
    if (db.kwPool[type] === undefined) {
      db.kwPool[type] = {};
    }
    _iterateKeywords(keywords, function (i, name, data) {
      list.push(name);
      _setKeyword(type, _removeEqu(name).toUpperCase(), data);
    });
    db.kwPool[type][ID_KEYWORDS] = list;
  }

  function _loadKeywords(type, cb) {
    var url = _resolveURL(type);
    ResLoader.get(
      url,
      function (data) {
        if (data && data.Keywords) {
          _setKeywords(type, data.Keywords.Keyword);
          if (cb) cb.apply(this);
        }
      },
      cb
    );
  }
  function _keywordLoaded(type) {
    return db.kwPool[type];
  }

  function _tryToLoadKeywords(type, userCb, getDataFunc) {
    return _tryToLoad({
      userCb: userCb,
      getData: getDataFunc,
      needToLoad: function () {
        return !_keywordLoaded(type);
      },
      load: function (cb) {
        _loadKeywords(type, cb);
      },
    });
  }

  function _getKeywords(type, userCb) {
    return _tryToLoadKeywords(type, userCb, function () {
      var data = _keywordObj(type);
      if (data) {
        data = data[ID_KEYWORDS];
      }
      return data;
    });
  }
  function _getKeywordHelp(name, type, userCb) {
    return _tryToLoadKeywords(type, userCb, function () {
      var data = _keywordObj(type, _removeEqu(name).toUpperCase());
      if (data) {
        data = { key: name, data: data[ID_HELP], alias: data[ID_ALIAS] };
      }
      return data;
    });
  }

  // Procedures
  function _loadProcedureFromPubs(procName, cb) {
    var url = getBaseUrl() + "/pubsdata/Procedures/en/" + procName + ".json";
    ResLoader.get(
      url,
      function (data) {
        if (data && data.statements) {
          _setProcedureFromPubs(
            procName,
            data.statements,
            data.supportSiteInformation
          );
          if (data.interactive) {
            _setKeywordAttr("proc", data.name, "InteractivePROC");
          }
          if (cb) {
            cb();
          }
        }
      },
      cb
    );
  }
  function _loadProcedure(procName, cb) {
    if (procTable[procName]) {
      var url = getBaseUrl() + "/data/Procedures/" + procName + ".json";
      return ResLoader.get(
        url,
        function (data) {
          if (data && data.Procedure) {
            _setProcedure(procName, data.Procedure);
            if (cb) {
              cb();
            }
          }
        },
        cb
      );
    }
    return _loadProcedureFromPubs(procName, cb);
  }

  function _procedureLoaded(procName) {
    return db.procStmts[procName];
  }

  function _tryToLoadProcedure(procName, userCb, getDataFunc) {
    return _tryToLoad({
      userCb: userCb,
      getData: getDataFunc,
      needToLoad: function () {
        var procs = _tryToLoadProceduresFromPubs(null, function () {
          return _keywordObj("proc");
        });
        return (
          procs &&
          (procs[procName] || procTable[procName]) &&
          !_procedureLoaded(procName)
        );
      },
      load: function (cb) {
        _loadProcedure(procName, cb);
      },
    });
  }

  function _setProcedureFromPubs(procName, data, supportSite) {
    if (db.procOpts[procName] === undefined) {
      db.procOpts[procName] = {};
    }
    if (db.procStmts[procName] === undefined) {
      db.procStmts[procName] = {};
    }
    if (data[0]) {
      if (supportSite) {
        supportSite.supportSiteTargetFile = data[0].supportSiteTargetFile;
        db.procOpts[procName][ID_SUPPORT_SITE] = supportSite;
      }
      _setProcedureHelpFromPubs(procName, data[0]);
      var opts = data[0].arguments;
      if (opts && opts.length) {
        _setProcedureOptionsFromPubs(procName, opts);
      }
    }
    data.splice(0, 1);
    if (data.length) {
      _setProcedureStatementsFromPubs(procName, data);
    }
  }
  function _setProcedure(procName, data) {
    if (db.procOpts[procName] === undefined) {
      db.procOpts[procName] = {};
    }
    if (db.procStmts[procName] === undefined) {
      db.procStmts[procName] = {};
    }
    _setProcedureHelp(procName, data.ProcedureHelp);
    if (!!data.ProcedureOptions) {
      var opts = data.ProcedureOptions;
      if (!(opts instanceof Array)) {
        opts = [opts];
      }
      opts.forEach(function (item) {
        _setProcedureOptions(procName, item.ProcedureOption);
      });
    }
    if (!!data.ProcedureStatements) {
      var stmts = data.ProcedureStatements;
      if (!(stmts instanceof Array)) {
        stmts = [stmts];
      }
      stmts.forEach(function (item) {
        if (item) {
          _setProcedureStatements(procName, item.ProcedureStatement);
        }
      });
    }
  }
  function _setProcedureHelpFromPubs(procName, data) {
    // data is json format
    db.procOpts[procName][ID_HELP] = data.description;
    db.procOpts[procName][ID_SYNTAX] = data.help;
  }
  function _setProcedureHelp(procName, data) {
    // data is json format
    db.procOpts[procName][ID_HELP] = _getHelp(data);
  }
  function _setProcedureOptionHelpFromPubs(procName, optName, data) {
    db.procOpts[procName][optName][ID_HELP] = data.description;
    db.procOpts[procName][optName][ID_SYNTAX] = data.help;
    db.procOpts[procName][optName][ID_SUPPORT_SITE] =
      data.supportSiteTargetFragment;
  }
  function _setProcedureOptionHelp(procName, optName, data) {
    db.procOpts[procName][optName][ID_HELP] = _getHelp(data);
  }
  function _setProcedureOptionType(procName, optName, data) {
    db.procOpts[procName][optName][ID_TYPE] = data;
  }
  function _setProcedureOptionAliasFromPubs(procName, optName, data) {
    db.procOpts[procName][optName][ID_ALIAS] = data;
  }
  function _setProcedureOptionAlias(procName, optName, data) {
    db.procOpts[procName][optName][ID_ALIAS] = _resolveAlias(optName, data);
  }
  function _setProcedureOptionSubOptKeywordsFromPubs(procName, optName, data) {
    var list = db.procOpts[procName][optName][ID_SUB_OPTS] || {};
    if (!list[ID_KEYWORDS]) {
      list[ID_KEYWORDS] = [];
    }
    data.forEach(function (arg) {
      if (arg.placeholder || arg.type === "standalone") return;
      var name = arg.name;
      list[ID_KEYWORDS].push(name);
      list[_removeEqu(name)] = true;
      if (db.procOpts[procName][optName][name] === undefined) {
        db.procOpts[procName][optName][name] = {};
      }
      if (arg.description) {
        db.procOpts[procName][optName][name][ID_HELP] = arg.description;
      }
    });
    db.procOpts[procName][optName][ID_SUB_OPTS] = list;
  }
  function _setProcedureOptionSubOptKeywords(procName, optName, data) {
    //db.procOpts[procName][optName][ID_SUB_OPTS] = _getSubOptKeywords(data);;
    //we store all sub option keywords in single place
    var list = db.procOpts[procName][optName][ID_SUB_OPTS] || {};
    _getSubOptKeywords(list, data);
    db.procOpts[procName][optName][ID_SUB_OPTS] = list;
  }
  function _setProcedureOptionValueHelp(procName, optName, valName, data) {
    db.procOpts[procName][optName][valName][ID_HELP] = data;
  }
  function _setProcedureOptionValueFromPubs(procName, optName, val) {
    var name = val.name;
    if (db.procOpts[procName][optName][name] === undefined) {
      db.procOpts[procName][optName][name] = {};
    }
    db.procOpts[procName][optName][name][ID_ALIAS] = val.aliases;
    if (val.description) {
      _setProcedureOptionValueHelp(procName, optName, name, val.description);
    }
  }
  function _setProcedureOptionValuesFromPubs(procName, optName, values) {
    var list = [];
    values.forEach(function (val) {
      if (val.placeholder || val.type !== "standalone") return;
      var name = val.name;
      list.push(name);
      _setProcedureOptionValueFromPubs(procName, optName, val);
      if (val.aliases && val.aliases.length) {
        val.aliases.forEach(function (alias) {
          list.push(alias);
          _setProcedureOptionValueFromPubs(
            procName,
            optName,
            _resolveAliasFromPubs(alias, val)
          );
        });
      }
    });

    db.procOpts[procName][optName][ID_VALS] = list;
  }
  function _setProcedureOptionValues(procName, optName, values, tooltips) {
    var list = [];
    _iterateValues(values, tooltips, function (i, name, tooltip) {
      list.push(name);
      if (db.procOpts[procName][optName][name] === undefined) {
        db.procOpts[procName][optName][name] = {};
      }
      if (tooltip) {
        _setProcedureOptionValueHelp(procName, optName, name, tooltip);
      }
    });

    db.procOpts[procName][optName][ID_VALS] = list;
  }
  function _setProcedureOptionFromPubs(procName, data) {
    var optName = _removeEqu(data.name);
    if (db.procOpts[procName][optName] === undefined) {
      db.procOpts[procName][optName] = {};
    }
    _setProcedureOptionHelpFromPubs(procName, optName, data);
    _setProcedureOptionType(procName, optName, data.type);
    _setProcedureOptionAliasFromPubs(procName, optName, data.aliases);
    var args = data.arguments;
    if (args && args.length) {
      //if (data.type === 'choice') {
      _setProcedureOptionValuesFromPubs(procName, optName, args);
      _setProcedureOptionSubOptKeywordsFromPubs(procName, optName, args);
    }
  }
  function _setProcedureOption(procName, optName, data) {
    optName = _removeEqu(optName);
    if (db.procOpts[procName][optName] === undefined) {
      db.procOpts[procName][optName] = {};
    }
    _setProcedureOptionHelp(procName, optName, data.ProcedureOptionHelp);
    _setProcedureOptionType(procName, optName, data.ProcedureOptionType);
    _setProcedureOptionAlias(procName, optName, data.ProcedureOptionName);
    if (data.SubOptionsKeywords) {
      _setProcedureOptionSubOptKeywords(
        procName,
        optName,
        data.SubOptionsKeywords
      );
    }
    if (data.ProcedureOptionValues) {
      _setProcedureOptionValues(
        procName,
        optName,
        data.ProcedureOptionValues,
        data.ProcedureOptionToolTips
      );
    }
  }
  function _setProcedureOptionsFromPubs(procName, data) {
    var keywords = [];
    data.forEach(function (item) {
      if (!item.placeholder) {
        _setProcedureOptionFromPubs(procName, item);
        keywords.push(item.name);
        if (item.aliases && item.aliases.length) {
          item.aliases.forEach(function (alias) {
            _setProcedureOptionFromPubs(
              procName,
              _resolveAliasFromPubs(alias, item)
            );
            keywords.push(alias);
          });
        }
      }
    });
    db.procOpts[procName][ID_OPTS] = keywords;
  }
  function _setProcedureOptions(procName, data) {
    if (data) {
      var keywords = [];
      if (!(data instanceof Array)) data = [data];
      for (var i = 0; i < data.length; i++) {
        if (!data[i]["ProcedureOptionName"]) continue;
        var names = data[i]["ProcedureOptionName"].split("|");
        if (names[names.length - 1] === "") names.pop();
        for (var j = 0; j < names.length; j++) {
          _setProcedureOption(procName, names[j], data[i]);
        }

        keywords = keywords.concat(names);
      }
      db.procOpts[procName][ID_OPTS] = keywords;
    }
  }
  function _setProcedureStatementHelpFromPubs(procName, stmtName, data) {
    db.procStmts[procName][stmtName][ID_HELP] = data.description;
    db.procStmts[procName][stmtName][ID_SYNTAX] = data.help;
    db.procStmts[procName][stmtName][ID_SUPPORT_SITE] =
      data.supportSiteTargetFile;
  }
  function _setProcedureStatementHelp(procName, stmtName, data) {
    db.procStmts[procName][stmtName][ID_HELP] = _getHelp(data);
  }
  function _setProcedureStatementAliasFromPubs(procName, stmtName, data) {
    db.procStmts[procName][stmtName][ID_ALIAS] = data;
  }
  function _setProcedureStatementAlias(procName, stmtName, data) {
    db.procStmts[procName][stmtName][ID_ALIAS] = _resolveAlias(stmtName, data);
  }
  function _setProcedureStatementOptionFromPubs(procName, stmtName, data) {
    var optName = _cleanName(data.name); //optName.replace('=','');
    if (db.procStmts[procName][stmtName][optName] === undefined) {
      db.procStmts[procName][stmtName][optName] = {};
    }
    _setProcedureStatementOptionHelpFromPubs(procName, stmtName, optName, data);
    _setProcedureStatementOptionType(procName, stmtName, optName, data.type);
    _setProcedureStatementOptionAliasFromPubs(
      procName,
      stmtName,
      optName,
      data.aliases
    );
    var args = data.arguments;
    if (args && args.length) {
      //if (data.type === 'choice') {
      _setProcedureStatementOptionValuesFromPubs(
        procName,
        stmtName,
        optName,
        args
      );
      //} else {
      _setProcedureStatementSubOptKeywordsFromPubs(
        procName,
        stmtName,
        optName,
        args
      );
      //}
    }
  }
  function _setProcedureStatementOption(procName, stmtName, optName, data) {
    optName = _cleanName(optName); //optName.replace('=','');
    if (db.procStmts[procName][stmtName][optName] === undefined) {
      db.procStmts[procName][stmtName][optName] = {};
    }
    _setProcedureStatementOptionHelp(
      procName,
      stmtName,
      optName,
      data.StatementOptionHelp
    );
    _setProcedureStatementOptionType(
      procName,
      stmtName,
      optName,
      data.StatementOptionType
    );
    _setProcedureStatementOptionAlias(
      procName,
      stmtName,
      optName,
      data.StatementOptionName
    );
    if (data.SubOptionsKeywords) {
      _setProcedureStatementSubOptKeywords(
        procName,
        stmtName,
        optName,
        data.SubOptionsKeywords
      );
    }
    if (data.StatementOptionValues) {
      //StatementOptionValues
      _setProcedureStatementOptionValues(
        procName,
        stmtName,
        optName,
        data.StatementOptionValues,
        data.StatementOptionToolTips
      );
    }
  }
  function _setProcedureStatementOptionHelpFromPubs(
    procName,
    stmtName,
    optName,
    data
  ) {
    db.procStmts[procName][stmtName][optName][ID_HELP] = data.description;
    db.procStmts[procName][stmtName][optName][ID_SYNTAX] = data.help;
    db.procStmts[procName][stmtName][optName][ID_SUPPORT_SITE] =
      data.supportSiteTargetFragment || data.supportSiteInformation;
  }
  function _setProcedureStatementOptionHelp(procName, stmtName, optName, data) {
    db.procStmts[procName][stmtName][optName][ID_HELP] = _getHelp(data);
  }
  function _setProcedureStatementOptionType(procName, stmtName, optName, data) {
    db.procStmts[procName][stmtName][optName][ID_TYPE] = data;
  }
  function _setProcedureStatementOptionAliasFromPubs(
    procName,
    stmtName,
    optName,
    data
  ) {
    db.procStmts[procName][stmtName][optName][ID_ALIAS] = data;
  }
  function _setProcedureStatementOptionAlias(
    procName,
    stmtName,
    optName,
    data
  ) {
    db.procStmts[procName][stmtName][optName][ID_ALIAS] = _resolveAlias(
      optName,
      data
    );
  }
  function _setProcedureStatementSubOptKeywordFromPubs(
    procName,
    stmtName,
    optName,
    subOptName,
    arg
  ) {
    if (db.procStmts[procName][stmtName][optName][subOptName] === undefined) {
      db.procStmts[procName][stmtName][optName][subOptName] = {};
    }
    if (arg.description) {
      db.procStmts[procName][stmtName][optName][subOptName][ID_HELP] =
        arg.description;
    }
    if (arg.help) {
      db.procStmts[procName][stmtName][optName][subOptName][ID_SYNTAX] =
        arg.help;
    }
    if (arg.aliases) {
      db.procStmts[procName][stmtName][optName][subOptName][ID_ALIAS] =
        arg.aliases;
    }
  }
  function _setProcedureStatementSubOptKeywordsFromPubs(
    procName,
    stmtName,
    optName,
    data
  ) {
    var list = db.procStmts[procName][stmtName][optName][ID_SUB_OPTS] || {};
    if (!list[ID_KEYWORDS]) {
      list[ID_KEYWORDS] = [];
    }
    data.forEach(function (arg) {
      if (arg.placeholder || arg.type === "standalone") return;
      var name = arg.name;
      list[ID_KEYWORDS].push(name);
      list[_removeEqu(name)] = true;
      _setProcedureStatementSubOptKeywordFromPubs(
        procName,
        stmtName,
        optName,
        name,
        arg
      );
      if (arg.aliases) {
        arg.aliases.forEach(function (alias) {
          list[ID_KEYWORDS].push(alias);
          list[_removeEqu(alias)] = true;
          _setProcedureStatementSubOptKeywordFromPubs(
            procName,
            stmtName,
            optName,
            alias,
            _resolveAliasFromPubs(alias, arg)
          );
        });
      }
    });
    db.procStmts[procName][stmtName][optName][ID_SUB_OPTS] = list;
  }
  function _setProcedureStatementSubOptKeywords(
    procName,
    stmtName,
    optName,
    data
  ) {
    //db.procStmts[procName][stmtName][optName][ID_SUB_OPTS] = _getSubOptKeywords(data);
    //we store all sub option keywords in single place
    var list = db.procStmts[procName][stmtName][optName][ID_SUB_OPTS] || {};
    _getSubOptKeywords(list, data);
    db.procStmts[procName][stmtName][optName][ID_SUB_OPTS] = list;
  }
  function _setProcedureStatementOptionValueHelp(
    procName,
    stmtName,
    optName,
    valName,
    data
  ) {
    db.procStmts[procName][stmtName][optName][valName][ID_HELP] = data;
  }
  function _setProcedureStatementOptionValueFromPubs(
    procName,
    stmtName,
    optName,
    val
  ) {
    var name = val.name;
    if (db.procStmts[procName][stmtName][optName][name] === undefined) {
      db.procStmts[procName][stmtName][optName][name] = {};
    }
    db.procStmts[procName][stmtName][optName][name][ID_ALIAS] = val.aliases;
    if (val.description) {
      _setProcedureStatementOptionValueHelp(
        procName,
        stmtName,
        optName,
        name,
        val.description
      );
    }
  }
  function _setProcedureStatementOptionValuesFromPubs(
    procName,
    stmtName,
    optName,
    values
  ) {
    var list = [];
    values.forEach(function (val) {
      if (val.placeholder || val.type !== "standalone") return;
      var name = val.name;
      list.push(name);
      _setProcedureStatementOptionValueFromPubs(
        procName,
        stmtName,
        optName,
        val
      );
      if (val.aliases && val.aliases.length) {
        val.aliases.forEach(function (alias) {
          list.push(alias);
          _setProcedureStatementOptionValueFromPubs(
            procName,
            stmtName,
            optName,
            _resolveAliasFromPubs(alias, val)
          );
        });
      }
    });

    db.procStmts[procName][stmtName][optName][ID_VALS] = list;
  }
  function _setProcedureStatementOptionValues(
    procName,
    stmtName,
    optName,
    values,
    tooltips
  ) {
    var list = [];
    _iterateValues(values, tooltips, function (i, name, tooltip) {
      list.push(name);
      if (db.procStmts[procName][stmtName][optName][name] === undefined) {
        db.procStmts[procName][stmtName][optName][name] = {};
      }
      if (tooltips) {
        _setProcedureStatementOptionValueHelp(
          procName,
          stmtName,
          optName,
          name,
          tooltip
        );
      }
    });

    db.procStmts[procName][stmtName][optName][ID_VALS] = list;
  }
  function _setProcedureStatementOptionsFromPubs(procName, stmtName, data) {
    var keywords = [],
      keywordsReq = [];
    data.forEach(function (item) {
      if (!item.placeholder) {
        _setProcedureStatementOptionFromPubs(procName, stmtName, item);
        if (item.followsDelimiter) {
          keywords.push(item.name);
        } else {
          keywordsReq.push(item.name);
        }
        if (item.aliases && item.aliases.length) {
          item.aliases.forEach(function (alias) {
            _setProcedureStatementOptionFromPubs(
              procName,
              stmtName,
              _resolveAliasFromPubs(alias, item)
            );
            if (item.followsDelimiter) {
              keywords.push(alias);
            } else {
              keywordsReq.push(alias);
            }
          });
        }
      }
    });
    if (keywords.length > 0) {
      db.procStmts[procName][stmtName][ID_HAS_OPT_DELIMITER] = true;
    } else {
      keywords = keywordsReq;
      keywordsReq = [];
    }
    db.procStmts[procName][stmtName][ID_OPTS] = keywords;
    db.procStmts[procName][stmtName][ID_OPTS_REQ] = keywordsReq;
  }
  function _setProcedureStatementOptions(procName, stmtName, data) {
    if (data) {
      var keywords = [];
      if (!(data instanceof Array)) data = [data];
      for (var i = 0; i < data.length; i++) {
        var names = data[i]["StatementOptionName"];
        if (!names) continue;
        names = names.split("|");
        if (names[names.length - 1] === "") names.pop();
        for (var j = 0; j < names.length; j++) {
          _setProcedureStatementOption(procName, stmtName, names[j], data[i]);
        }
        keywords = keywords.concat(names);
      }
      db.procStmts[procName][stmtName][ID_OPTS] = keywords;
    }
  }
  function _setProcedureStatementFromPubs(procName, stmtName, data) {
    if (db.procStmts[procName][stmtName] === undefined) {
      db.procStmts[procName][stmtName] = {};
      db.procStmts[procName][stmtName][ID_HAS_OPT_DELIMITER] = false;
    }
    _setProcedureStatementHelpFromPubs(procName, stmtName, data);
    _setProcedureStatementAliasFromPubs(procName, stmtName, data.aliases);
    var opts = data.arguments;
    if (opts && opts.length) {
      _setProcedureStatementOptionsFromPubs(procName, stmtName, opts);
    }
  }
  function _setProcedureStatement(procName, stmtName, data) {
    if (db.procStmts[procName][stmtName] === undefined) {
      db.procStmts[procName][stmtName] = {};
    }
    _setProcedureStatementHelp(procName, stmtName, data.StatementHelp);
    _setProcedureStatementAlias(procName, stmtName, data.StatementName);
    if (data.StatementOptions) {
      _setProcedureStatementOptions(
        procName,
        stmtName,
        data.StatementOptions.StatementOption
      );
    }
  }
  function _setProcedureStatementsFromPubs(procName, data) {
    var keywords = [];
    data.forEach(function (item) {
      _setProcedureStatementFromPubs(
        procName,
        _removeEqu(item.name.toUpperCase()),
        item
      );
      keywords.push(item.name);
    });
    db.procStmts[procName][ID_STMTS] = keywords;
  }
  function _setProcedureStatements(procName, data) {
    if (data) {
      var keywords = [];
      if (!(data instanceof Array)) data = [data];
      for (var i = 0; i < data.length; i++) {
        var names = data[i]["StatementName"];
        if (!names) continue;
        names = names.split("|");
        if (names[names.length - 1] === "") names.pop();
        for (var j = 0; j < names.length; j++) {
          _setProcedureStatement(
            procName,
            _removeEqu(names[j].toUpperCase()),
            data[i]
          );
        }
        keywords = keywords.concat(names);
      }
      db.procStmts[procName][ID_STMTS] = keywords;
    }
  }
  // private functions
  this._handleOptionValues = function (data, cb) {
    // support async behavior
    if (this.isColorType(data.type)) {
      // color value
      data.values = this.getSasColors();
      _notify(cb, data);
    } else if (this.isDataSetType(data.type)) {
      // library value
      data.values = this.getLibraryList(cb, data.type); // It always is asynchronous
    } else {
      _notify(cb, data);
    }
    return data;
  };
  /* ************************************************************************
   * PUBLIC INTERFACES
   * ************************************************************************/
  this.setLibService = function (fn) {
    libService = fn;
  };
  /*
   *  If cb is valid, the call will work in asynchronous mode;
   *  if cb is invalid, the call will work in synchronous mode.
   */
  this.getProcedures = function (cb) {
    //return _loadKeywords(/*'procedures'*/'proc', cb);
    return _tryToLoadProceduresFromPubs(cb, function () {
      var data = _keywordObj("proc");
      if (data) {
        data = data[ID_KEYWORDS];
      }
      return data;
    });
  };

  this.getProcedureHelp = function (procName, cb) {
    procName = procName.toUpperCase();
    return _tryToLoadProcedure(procName, cb, function () {
      var data = _procOptObj(procName);
      if (data) {
        data = {
          data: data[ID_HELP],
          key: procName,
          syntax: data[ID_SYNTAX],
          supportSite: data[ID_SUPPORT_SITE],
        };
      }
      return data;
    });
  };
  this.getProcedureOptions = function (procName, cb) {
    procName = procName.toUpperCase();
    return _tryToLoadProcedure(procName, cb, function () {
      var data = _procOptObj(procName);
      if (data) {
        data = data[ID_OPTS];
      }
      return data;
    });
  };
  this.getProcedureOptionHelp = function (procName, optName, cb) {
    procName = procName.toUpperCase();
    optName = optName.toUpperCase();
    return _tryToLoadProcedure(procName, cb, function () {
      var data = _procOptObj(procName, _removeEqu(optName));
      if (data) {
        data = {
          data: data[ID_HELP],
          key: optName,
          alias: data[ID_ALIAS],
          syntax: data[ID_SYNTAX],
          supportSite: _procOptSupportSite(procName, optName),
        };
      }
      return data;
    });
  };
  this.getProcedureOptionType = function (procName, optName) {
    procName = procName.toUpperCase();
    optName = optName.toUpperCase();
    return _tryToLoadProcedure(procName, null, function () {
      var data = _procOptObj(procName, _removeEqu(optName));
      if (data) {
        data = data[ID_TYPE];
      }
      return data;
    });
  };
  this.getProcedureOptionValueHelp = function (procName, optName, valName, cb) {
    return _tryToLoadProcedure(procName, cb, function () {
      procName = procName.toUpperCase();
      optName = optName.toUpperCase();
      valName = valName.toUpperCase();
      var data = _procOptObj(procName, optName, valName);
      if (data) {
        data = {
          key: valName,
          data: data[ID_HELP],
          alias: data[ID_ALIAS],
          supportSite: _procOptSupportSite(procName, optName),
        };
      }
      return data;
    });
  };
  this.getProcedureOptionValues = function (procName, optName, cb) {
    var that = this;
    var ret = _tryToLoadProcedure(procName, null, function () {
      //sync
      procName = procName.toUpperCase();
      optName = optName.toUpperCase();
      var data = _procOptObj(procName, optName);
      if (data) {
        var type = that.getProcedureOptionType(procName, optName);
        data = { type: type, values: data[ID_VALS] };
      }
      return data;
    });
    if (ret) {
      ret = this._handleOptionValues(ret, cb);
    }
    return ret;
  };
  this.getProcedureSubOptions = function (procName, optName, cb) {
    return _tryToLoadProcedure(procName, cb, function () {
      procName = procName.toUpperCase();
      optName = optName.toUpperCase();
      var data = _procOptObj(procName, optName, ID_SUB_OPTS);

      data = data ? data[ID_KEYWORDS] : [];

      return data;
    });
  };
  this.getProcedureSubOptionHelp = function (
    procName,
    optName,
    subOptName,
    cb
  ) {
    return _tryToLoadProcedure(procName, cb, function () {
      procName = procName.toUpperCase();
      optName = optName.toUpperCase();
      subOptName = subOptName.toUpperCase();
      var data = _procOptObj(procName, optName, subOptName);
      if (data) {
        data = {
          key: subOptName,
          data: data[ID_HELP],
          alias: data[ID_ALIAS],
          syntax: data[ID_SYNTAX],
          supportSite: _procOptSupportSite(procName, optName),
        };
      }
      return data;
    });
  };
  this.getProcedureStatements = function (procName, cb) {
    procName = procName.toUpperCase();
    var that = this;
    return _tryToLoadProcedure(procName, cb, function () {
      var data = _procStmtObj(procName);
      if (data) {
        data = data[ID_STMTS];
      } else {
        data = [];
      }
      if (!that.noGlobal) {
        var gps = that.getGlobalProcedureStatements();
        if (gps) {
          data = data.concat(gps);
          data = _uniq(data);
        }
      }
      return data.length > 0 ? data : null;
    });
  };
  this.getProcedureStatementHelp = function (procName, stmtName, cb) {
    procName = procName.toUpperCase();
    stmtName = stmtName.toUpperCase();
    var that = this;
    return _tryToLoadProcedure(procName, cb, function () {
      var data = _procStmtObj(procName, stmtName);
      if (data) {
        var supportSite = _procOptObj(procName)[ID_SUPPORT_SITE];
        if (supportSite) {
          supportSite = Object.assign({}, supportSite);
          supportSite.supportSiteTargetFile = data[ID_SUPPORT_SITE];
        }
        data = {
          key: stmtName,
          data: data[ID_HELP],
          alias: data[ID_ALIAS],
          syntax: data[ID_SYNTAX],
          supportSite: supportSite,
        };
      } else {
        data = that.getKeywordHelp(stmtName, null, "gbl-proc-stmt");
        if (data) data.isGlobal = true;
      }
      return data;
    });
  };
  this.getProcedureStatementOptions = function (procName, stmtName, cb, req) {
    procName = procName.toUpperCase();
    stmtName = stmtName.toUpperCase();
    var that = this;
    return _tryToLoadProcedure(procName, cb, function () {
      var data = _procStmtObj(procName, stmtName);
      if (data) {
        data = req ? data[ID_OPTS_REQ] : data[ID_OPTS];
      } else {
        data = that.getStatementOptions("global", stmtName, undefined, req);
      }
      return data;
    });
  };
  this.getProcedureStatementOptionHelp = function (
    procName,
    stmtName,
    optName,
    cb
  ) {
    procName = procName.toUpperCase();
    stmtName = stmtName.toUpperCase();
    optName = optName.toUpperCase();
    var that = this;
    return _tryToLoadProcedure(procName, cb, function () {
      var data = _procStmtObj(procName, stmtName, optName);
      if (data) {
        data = {
          key: optName,
          data: data[ID_HELP],
          alias: data[ID_ALIAS],
          syntax: data[ID_SYNTAX],
          supportSite: _procStmtOptSupportSite(procName, stmtName, optName),
        };
      } else {
        data = that.getStatementOptionHelp("global", stmtName, optName);
      }
      return data;
    });
  };
  this.getProcedureStatementOptionType = function (
    procName,
    stmtName,
    optName
  ) {
    procName = procName.toUpperCase();
    stmtName = stmtName.toUpperCase();
    optName = optName.toUpperCase();
    var that = this;
    return _tryToLoadProcedure(procName, null, function () {
      var data = _procStmtObj(procName, stmtName, optName);
      if (data) {
        data = data[ID_TYPE];
      } else {
        data = that.getStatementOptionType(stmtName, optName);
      }

      return data;
    });
  };
  this.getProcedureStatementSubOptions = function (
    procName,
    stmtName,
    optName,
    cb
  ) {
    procName = procName.toUpperCase();
    stmtName = stmtName.toUpperCase();
    optName = optName.toUpperCase();
    var that = this;
    return _tryToLoadProcedure(procName, cb, function () {
      var data = _procStmtObj(procName, stmtName, optName, ID_SUB_OPTS);
      if (data) {
        data = data[ID_KEYWORDS];
      } else {
        data = that.getStatementSubOptions("global", stmtName, optName);
      }
      return data;
    });
  };
  this.getProcedureStatementSubOptionHelp = function (
    procName,
    stmtName,
    optName,
    subOptName,
    cb
  ) {
    procName = procName.toUpperCase();
    stmtName = stmtName.toUpperCase();
    optName = optName && optName.toUpperCase();
    subOptName = subOptName && subOptName.toUpperCase();
    var that = this;
    return _tryToLoadProcedure(procName, cb, function () {
      var data = _procStmtObj(procName, stmtName, optName, subOptName);
      if (data) {
        data = {
          key: subOptName,
          data: data[ID_HELP],
          alias: data[ID_ALIAS],
          syntax: data[ID_SYNTAX],
          supportSite: _procStmtOptSupportSite(procName, stmtName, optName),
        };
      } else {
        data = that.getStatementSubOptionHelp(
          "global",
          stmtName,
          optName,
          subOptName
        );
      }

      return data;
    });
  };
  this.getProcedureStatementOptionValueHelp = function (
    procName,
    stmtName,
    optName,
    valName,
    cb
  ) {
    procName = procName.toUpperCase();
    stmtName = stmtName.toUpperCase();
    optName = optName && optName.toUpperCase();
    var that = this;
    return _tryToLoadProcedure(procName, cb, function () {
      var data = _procStmtObj(procName, stmtName, optName, valName);
      if (data) {
        data = {
          key: valName,
          data: data[ID_HELP],
          alias: data[ID_ALIAS],
          supportSite: _procStmtOptSupportSite(procName, stmtName, optName),
        };
      } else {
        data = that.getStatementOptionValueHelp(
          "global",
          stmtName,
          optName,
          valName
        );
      }

      return data;
    });
  };
  this.getProcedureStatementOptionValues = function (
    procName,
    stmtName,
    optName,
    cb
  ) {
    if (!optName) return null;
    stmtName = stmtName.toUpperCase();
    procName = procName.toUpperCase();
    optName = optName.toUpperCase();
    var that = this;
    var ret = _tryToLoadProcedure(procName, null, function () {
      //sync
      var data = _procStmtObj(procName, stmtName, optName);
      if (data) {
        var type = that.getProcedureStatementOptionType(
          procName,
          stmtName,
          optName
        );
        data = { type: type, values: data[ID_VALS] };
      } else {
        data = that.getStatementOptionValues("global", stmtName, optName);
      }
      return data;
    });

    if (ret) {
      ret = this._handleOptionValues(ret, cb);
    }
    return ret;
  };
  this.addUserDefinedAbbr = function (abbr) {
    //TODO:
  };
  this.getUserDefinedAbbr = function () {
    //TODO:
  };
  this.getFilenameOrLibnameOptions = function () {
    //TODO:
  };
  /*
   * How to use parameter 'type'?
   * The caller may use 'type' parameter or not, if to set this parameter, please use the following values :
   *      automatic_variable
   *      c  //not used
   *      call_routine
   *      datapassword_option_v
   *      dataset_option_cv
   *      dataset_option_v
   *      datasetindex_option_s
   *      datastep_definition
   *      datastep_option
   *      datastep_option_v
   *      datastep_or_proc_statement
   *      datastep_statement
   *      dataviewpgm_option_s
   *      gbl-stmt //global_statement
   *      gbl-proc-stmt //added
   *      hash_package
   *      hashiterator_package
   *      hashorhiter_package
   *      macro_arm
   *      macro_autocall
   *      macro_definition_option
   *      macro_function
   *      macrodefonly
   *      opencode
   *      opencode_or_macrodef
   *      package_method
   *      s  //not used
   *      s|v  //not used
   *      sas_formats
   *      sas_function
   *      sas_informat
   *      sas_procedure
   *      setkey_option_s
   *      setstatement_option_v
   *      special_saskeyword
   *      table_option
   *      v //not used
   *      validanywhere
   *
   */
  // access Statements/*.xml, mainly global statements or global procedure statements
  this.getStatementOptions = function (context, stmtName, cb, req) {
    stmtName = stmtName.toUpperCase();
    return _tryToLoadStatementsFromPubs(context, cb, function () {
      var data = _procStmtObj(context, stmtName);
      if (data) {
        data = req ? data[ID_OPTS_REQ] : data[ID_OPTS];
      }
      return data;
    });
  };
  // access Statements/*.xml, mainly global statements or global procedure statements
  this.getStatementOptionHelp = function (context, stmtName, optName, cb) {
    return _tryToLoadStatementsFromPubs(context, cb, function () {
      stmtName = stmtName.toUpperCase();
      optName = optName && optName.toUpperCase();
      var data = _procStmtObj(context, stmtName, optName);
      if (data) {
        data = {
          key: optName,
          data: data[ID_HELP],
          alias: data[ID_ALIAS],
          syntax: data[ID_SYNTAX],
          supportSite: _stmtOptSupportSite(context, stmtName, optName),
        };
      }
      return data;
    });
  };
  this.getStatementOptionValueHelp = function (
    context,
    stmtName,
    optName,
    valName,
    cb
  ) {
    return _tryToLoadStatementsFromPubs(context, cb, function () {
      stmtName = stmtName.toUpperCase();
      optName = optName && optName.toUpperCase();
      valName = valName && valName.toUpperCase();
      var data = _procStmtObj(context, stmtName, optName, valName);
      if (data) {
        data = {
          key: valName,
          data: data[ID_HELP],
          alias: data[ID_ALIAS],
          supportSite: _stmtOptSupportSite(context, stmtName, optName),
        };
      }
      return data;
    });
  };
  // old data is still used by some places
  this._getStatementOptionValueHelp = function (
    stmtName,
    optName,
    valName,
    cb
  ) {
    return _tryToLoadStatementOptions(stmtName, cb, function () {
      stmtName = stmtName.toUpperCase();
      optName = optName && optName.toUpperCase();
      valName = valName.toUpperCase();
      var data = _stmtObj(stmtName, optName, valName);
      if (data) {
        data = { key: valName, data: data[ID_HELP] };
      }
      return data;
    });
  };
  this.getStatementOptionType = function (stmtName, optName, cb) {
    return _tryToLoadStatementOptions(stmtName, cb, function () {
      stmtName = stmtName.toUpperCase();
      optName = optName.toUpperCase();
      var data = _stmtObj(stmtName, optName);
      if (data) {
        data = data[ID_TYPE];
      }
      return data;
    });
  };
  this.getStatementOptionValues = function (context, stmtName, optName, cb) {
    var ret = _tryToLoadStatementsFromPubs(context, null, function () {
      stmtName = stmtName.toUpperCase();
      optName = optName && optName.toUpperCase();
      var data = _procStmtObj(context, stmtName, optName);
      if (data) {
        data = { type: data[ID_TYPE], values: data[ID_VALS] };
      }
      return data;
    });
    if (ret) {
      ret = this._handleOptionValues(ret, cb);
    }
    return ret;
  };
  // old data is still used by some places
  this._getStatementOptionValues = function (stmtName, optName, cb) {
    var that = this;
    var ret = _tryToLoadStatementOptions(stmtName, null, function () {
      //sync
      stmtName = stmtName.toUpperCase();
      optName = optName && optName.toUpperCase();
      var data = _stmtObj(stmtName, optName);
      if (data) {
        var type = that.getStatementOptionType(stmtName, optName);
        data = { type: type, values: data[ID_VALS] };
      }
      return data;
    });

    if (ret) {
      ret = this._handleOptionValues(ret, cb);
    }
    return ret;
  };
  this.getStatementSubOptions = function (context, stmtName, optName, cb) {
    return _tryToLoadStatementsFromPubs(context, cb, function () {
      stmtName = stmtName.toUpperCase();
      optName = optName && optName.toUpperCase();
      var data = _procStmtObj(context, stmtName, optName, ID_SUB_OPTS);
      if (data) {
        data = data[ID_KEYWORDS];
      } else {
        data = [];
      }
      return data;
    });
  };
  this.getStatementSubOptionHelp = function (
    context,
    stmtName,
    optName,
    subOptName,
    cb
  ) {
    return _tryToLoadStatementsFromPubs(context, cb, function () {
      stmtName = stmtName.toUpperCase();
      optName = optName && optName.toUpperCase();
      var data = _procStmtObj(context, stmtName, optName, subOptName);
      if (data) {
        data = {
          key: subOptName,
          data: data[ID_HELP],
          alias: data[ID_ALIAS],
          syntax: data[ID_SYNTAX],
          supportSite: _stmtOptSupportSite(context, stmtName, optName),
        };
      }
      return data;
    });
  };
  this.getStatementSyntax = function (stmtName, cb) {
    //TODO:
  };
  this.getDataStepOptions = function (cb) {
    return _getKeywords("datastep-option", cb);
  };
  this.getDataStepOptionHelp = function (optName, cb, type) {
    return _getKeywordHelp(optName, type, cb);
  };
  this.getDataStepOptionValueHelp = function (optName, valName, cb) {
    this.getStatementOptionValueHelp("datastep", "DATA", optName, valName, cb);
  };
  this.getDataStepOptionValues = function (optName, cb) {
    this.getStatementOptionValues("datastep", "DATA", optName, cb);
  };
  this.getDataSetOptionValueHelp = function (optName, valName, cb) {
    this._getStatementOptionValueHelp("DATA-SET", optName, valName, cb);
  };
  this.getDataSetOptionValues = function (optName, cb) {
    this._getStatementOptionValues("DATA-SET", optName, cb);
  };
  // get all keyword's help, not only global statement, or global procedure statement
  this.getKeywordHelp = function (name, cb, type) {
    if (type === "func") {
      // from pubsdata
      var data = _getFunctionHelp(name, "base");
      return _notify(cb, data);
    }
    if (type === "macro-func") {
      // from pubsdata
      var data = _getFunctionHelp(name, "macro");
      return _notify(cb, data);
    }
    if (type === "gbl-proc-stmt") {
      var data = _getStatementHelp("global", name);
      return _notify(cb, data);
    }
    if (type === "gbl-stmt") {
      var data = _getStatementHelp("standalone", name);
      if (!data) {
        data = _getStatementHelp("global", name);
      }
      return _notify(cb, data);
    }
    if (type === "ds-stmt") {
      var data = _getStatementHelp("datastep", name);
      return _notify(cb, data);
    }
    if (type === "macro-stmt") {
      var data = _getStatementHelp("macro", name);
      if (!data) {
        data = _getStatementHelp("global", name);
      }
      return _notify(cb, data);
    }
    var data = _getKeywordHelp(name, type, null); //handle synchronously
    if (!data) {
      if (type === "datastep-option") {
        data = _getKeywordHelp(name, "datastep-option2", null);
      } else if (type === "ds-stmt") {
        data = _getKeywordHelp(name, "gbl-stmt", null);
      } else if (type === "macro-stmt") {
        data = _getKeywordHelp(name, "arm-macro", null);
      }
    }

    return _notify(cb, data);
  };
  // the name parameter can be the name of call routines or functions
  this.getContextPrompt = function (name, cb) {
    //var url = Utils.getBaseUrl() + '/data/SASContextPrompt.json';
    //TODO:
  };
  this.getSasColors = function (cb) {
    /*_loadKeywords('colorValues',cb);*/
    return _tryToLoadColors(cb);
  };
  //ODS tagsets
  this.getODSTagsets = function (cb) {
    return _getKeywords(/*'ODSTagsets'*/ "ods-tagsets", cb);
  };
  //Style
  this.getStyleAttributes = function (cb) {
    return _getKeywords(/*'styleAttributes'*/ "style-att", cb);
  };
  this.getStyleElements = function (cb) {
    return _getKeywords(/*'styleElements'*/ "style-ele", cb);
  };
  this.getStyleLocations = function (cb) {
    return _getKeywords(/*'styleLocations'*/ "style-loc", cb);
  };
  // macro
  this.getARMMacros = function (cb) {
    return _getKeywords(/*'ARMMacros'*/ "arm-macro", cb);
  };
  this.getAutocallMacros = function (cb) {
    return _getKeywords(/*'autocallMacros'*/ "autocall-macro", cb);
  };
  this.getAutoVariables = function (cb) {
    return _getKeywords(/*'autoVariables'*/ "auto-var", cb);
  };
  this.getMacroDefinitionOptions = function (cb) {
    return _getKeywords("macro-def-opt", cb);
  };
  this.getGlobalStatements = function (cb) {
    var globalProcStatements = this.getGlobalProcedureStatements();
    return _tryToLoadStatementsFromPubs("standalone", cb, function () {
      var data = _procStmtObj("standalone");
      return data[ID_STMTS].concat(globalProcStatements);
    });
  };
  this.getGlobalProcedureStatements = function (cb) {
    return _tryToLoadStatementsFromPubs("global", cb, function () {
      var data = _procStmtObj("global");
      return data[ID_STMTS];
    });
  };
  this.getMacroStatements = function (cb) {
    return _tryToLoadStatementsFromPubs("macro", cb, function () {
      var data = _procStmtObj("macro");
      return data[ID_STMTS];
    });
  };
  this.getFunctions = function (cb) {
    return _tryToLoadFunctionsFromPubs("base", cb, function () {
      var data = db.functions["base"][ID_KEYWORDS];
      return data;
    });
  };
  this.getCallRoutines = function (cb) {
    return _getKeywords(/*'callRoutines'*/ "call-routines", cb);
  };
  this.getMacroFunctions = function (cb) {
    return _tryToLoadFunctionsFromPubs("macro", cb, function () {
      var data = db.functions["macro"][ID_KEYWORDS];
      return data;
    });
  };
  this.getHashPackageMethods = function (cb) {
    return _getKeywords(/*'hashPackageMethods'*/ "hash-pack-method", cb);
  };
  this.getFormats = function (cb) {
    return _getKeywords("formats", cb);
  };
  this.getInformats = function (cb) {
    return _getKeywords("informats", cb);
  };
  this.getStatisticsKeywords = function (cb) {
    return _getKeywords(/*'statisticsKeywords'*/ "stat-kw", cb);
  };
  this.getDSStatements = function (cb) {
    return _tryToLoadStatementsFromPubs("datastep", cb, function () {
      var data = _procStmtObj("datastep");
      return data[ID_STMTS];
    });
  };
  this.getDSOptions = function (cb) {
    return _getKeywords(/*'datasetOptions'*/ "ds-option", cb);
  };
  this.getDSOptionHelp = function (optName, cb) {
    return _getKeywordHelp(optName, "ds-option", cb);
  };
  this.getDS2Keywords = function (cb) {
    //TODO:
  };
  this.getDS2Functions = function (cb) {
    //TODO:
  };
  this.getLibraryList = function (cb, type) {
    if (typeof libService === "function") {
      libService(null, function (data) {
        _notify(cb, { values: data, type: type });
      });
    } else {
      _notify(cb, { values: [], type: type });
    }
  };
  this.getDataSetNames = function (libId, cb) {
    if (libId && typeof libService === "function") {
      libService(libId, function (data) {
        if (data && data.length !== 0) {
          _notify(cb, data);
          return;
        }
        _notify(cb, null);
      });
    }
  };
  this.getDocumentVariables = function () {
    //TODO:
  };
  this.getMacroDefinitions = function () {
    //TODO:
  };
  this.getMacroVariables = function () {
    //TODO:
  };
  this.hasOptionDelimiter = function (procName, stmtName) {
    var obj,
      ret = false;
    var help = this.getProcedureStatementHelp(procName, stmtName); // try to load

    if (help) {
      if (help.isGlobal) {
        obj = _procStmtObj("global", stmtName); //_keywordObj('gbl-proc-stmt',stmtName);
      } else {
        obj = _procStmtObj(procName, stmtName);
      }
      if (obj[ID_HAS_OPT_DELIMITER] === undefined) {
        obj[ID_HAS_OPT_DELIMITER] = /Syntax:(.|\n)*\/(.|\n)*;/i.test(help.data);
      }
      ret = obj[ID_HAS_OPT_DELIMITER];
    }
    return ret;
  };
  function _loadProcedureImmediately(procName) {
    if (_procOptObj(procName)) return; //for performance
    _tryToLoadProcedure(procName, null, function () {
      return _procOptObj(procName);
    });
  }
  function _loadKeywordsImmediately(type) {
    if (_keywordObj(type)) return;
    _tryToLoadKeywords(type, null, function () {
      return _keywordObj(type);
    });
  }
  function _tryToLoadStatementOptionsImmediately(stmtName) {
    if (_stmtObj(stmtName)) return;
    _tryToLoadStatementOptions(stmtName, null, function () {
      return _stmtObj(stmtName);
    });
  }
  this.isProcedureOptionKeyword = function (procName, optName, valName) {
    _loadProcedureImmediately(procName);
    return !!_procOptObj(procName, optName, valName);
  };
  this.isProcedureSubOptKeyword = function (procName, optName, subOptName) {
    _loadProcedureImmediately(procName);
    return !!_procOptObj(procName, optName, ID_SUB_OPTS, subOptName);
    //return !!_procOptObj(procName, ID_SUB_OPTS, subOptName);
  };
  this.isProcedureStatementKeyword = function (
    procName,
    stmtName,
    optName,
    valName
  ) {
    _loadProcedureImmediately(procName);
    var ret = _procStmtObj(procName, stmtName, optName, valName);
    if (stmtName && !ret) {
      // var type = 'gbl-proc-stmt';
      //NOTE: It seems that it is reasonable to use 'gbl-proc-stmt',
      // but the result is different form EG, so here we use 'gbl-stmt'.
      //var type = 'gbl-proc-stmt';
      //_loadKeywordsImmediately(type);
      //if (optName === undefined) {
      //    ret = _keywordObj(type, stmtName);
      //    if (!ret) {
      //        type = 'gbl-stmt';
      //        _loadKeywordsImmediately(type);
      //        ret = _keywordObj(type, stmtName);
      //    }
      //} else {
      //    if (_keywordObj(type, stmtName)) {
      ret = this.isStatementKeyword("global", stmtName, optName, valName);
      if (!ret && (procName === "" || procName === "DATA")) {
        var type = procName === "DATA" ? "datastep" : "standalone";
        ret = this.isStatementKeyword(type, stmtName, optName, valName);
      }
      //    }
      //}
    }
    return !!ret;
  };
  this.isProcedureStatementSubOptKeyword = function (
    procName,
    stmtName,
    optName,
    subOptName
  ) {
    _loadProcedureImmediately(procName);
    return (
      !!_procStmtObj(procName, stmtName, optName, ID_SUB_OPTS, subOptName) ||
      !!_stmtObj(stmtName, optName, ID_SUB_OPTS, subOptName)
    );
    //return !!_procStmtObj(procName, stmtName, ID_SUB_OPTS, subOptName);
  };
  this.isStatementKeyword = function (context, stmtName, optName, valName) {
    return _tryToLoadStatementsFromPubs(context, null, function () {
      return !!_procStmtObj(context, stmtName, optName, valName);
    });
  };
  this._isStatementKeyword = function (stmtName, optName, valName) {
    _tryToLoadStatementOptionsImmediately(stmtName);
    var ret = !!_stmtObj(stmtName, optName, valName);
    if (!ret && !optName) {
      var type = "gbl-stmt";
      _loadKeywordsImmediately(type);
      ret = !!_keywordObj(type, stmtName);
    }
    return ret;
  };
  this.isStatementSubOptKeyword = function (stmtName, optName, subOptName) {
    _tryToLoadStatementOptionsImmediately(stmtName);
    return !!_stmtObj(stmtName, optName, ID_SUB_OPTS, subOptName);
  };
  this.isGeneralKeyword = function (name) {
    //TODO:
  };
  this.isDatasetKeyword = function (name) {
    var type = "ds-option";
    _loadKeywordsImmediately(type);
    return !!_keywordObj(type, name);
  };
  this.isSasFunction = function (name) {
    return _tryToLoadFunctionsFromPubs("base", null, function () {
      return db.functions["base"][ID_KEYWORDS].indexOf(name) !== -1;
    });
  };
  this.isDataSetType = function (type) {
    return /\bDV\b/.test(type) || type.toLowerCase() === "dataset";
  };
  this.isColorType = function (type) {
    return /\bC\b/.test(type) || type.toLowerCase() === "color";
  };
  this.isInteractiveProc = function (name) {
    _tryToLoadProceduresFromPubs(null, function () {});
    var data = _keywordObj("proc", name);
    return data && data[ID_ATTR] === "InteractivePROC";
  };
}.call(SasLanguageService.prototype));

exports.SasLanguageService = SasLanguageService;
