/*eslint-disable*/
import { Hover, MarkupKind } from "vscode-languageserver";
import { Position } from "vscode-languageserver-textdocument";
import { CodeZoneManager } from "./CodeZoneManager";
import { SasModel } from "./SasModel";
import { arrayToMap } from "./utils";

const ZONE_TYPE = CodeZoneManager.ZONE_TYPE;

//TODO: please improve tagsets, that's dup.
const tagsets = arrayToMap([
  "CHTML",
  "CORE",
  "CSV",
  "CSVALL",
  "CVSBYLINE",
  "DEFAULT",
  "DOCBOOK",
  "EXCELXP",
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
]);

function _buildKwMap() {
  const KW_MAP = [
    [ZONE_TYPE.FORMAT, "formats"],
    [ZONE_TYPE.INFORMAT, "informats"],
    [ZONE_TYPE.MACRO_FUNC, "macro-func"],
    [ZONE_TYPE.MACRO_STMT, "macro-stmt"],
    [ZONE_TYPE.AUTO_MACRO_VAR, "auto-var"],
    [ZONE_TYPE.MACRO_VAR, "auto-var"],
    [ZONE_TYPE.CALL_ROUTINE, "call-routines"],
    [ZONE_TYPE.SAS_FUNC, "func"],
    [ZONE_TYPE.STAT_KW, "stat-kw"],
    [ZONE_TYPE.STYLE_LOC, "style-loc"],
    [ZONE_TYPE.STYLE_ELEMENT, "style-ele"],
    [ZONE_TYPE.STYLE_ATTR, "style-att"],
    [ZONE_TYPE.GBL_STMT, "gbl-stmt"],
    [ZONE_TYPE.DATA_STEP_STMT, "ds-stmt"],
    [ZONE_TYPE.DATA_SET_OPT_NAME, "ds-option"],
    [ZONE_TYPE.DATA_SET_OPT_VALUE, "ds-option"],
    [ZONE_TYPE.TAGSETS_NAME, "ods-tagsets"],
  ];
  var map: any = {};
  KW_MAP.forEach(function (item) {
    map[item[0]] = item[1];
  });
  return map;
}
const KW_MAP = _buildKwMap();

function getText(str: string, arg?: any) {
  return str + (arg ?? "");
}

function _notify(cb: any, data: any) {
  if (cb) {
    setTimeout(function () {
      cb(data);
    }, 0);
  }
}

function _cleanUpODSStmtName(name: any) {
  name = name.replace(/(ODS\s*)/gi, "");
  if (name.indexOf("TAGSETS.") !== -1 && name.indexOf("TAGSETS.RTF") === -1) {
    name = name.replace("TAGSETS.", "");
    if (tagsets[name]) {
      name = "MARKUP";
    }
  }
  return name === "" ? "ODS" : "ODS " + name;
}

function _cleanUpKeyword(keyword: string) {
  if (keyword === undefined) {
    //TODO: this check will be removed in the future.
    return keyword;
  }
  keyword = keyword.replace(/(^\s+|\s+$)/g, "");
  if (/^(TITLE|FOOTNOTE|AXIS|LEGEND|PATTERN|SYMBOL)\d{0,}$/i.test(keyword)) {
    var results = keyword.match(
        /^(TITLE|FOOTNOTE|AXIS|LEGEND|PATTERN|SYMBOL)|\d{0,}$/gi
      )!,
      nbr = 0,
      upperLimit = 0;
    nbr = parseInt(results[1], 10);
    switch (results[0].toUpperCase()) {
      case "TITLE":
      case "FOOTNOTE":
        upperLimit = 10;
        break;
      case "AXIS":
      case "LEGEND":
        upperLimit = 99;
        break;
      case "PATTERN":
      case "SYMBOL":
        upperLimit = 255;
        break;
    }
    if (nbr > 0 && nbr <= upperLimit) {
      keyword = results[0];
    }
  }
  return keyword.toUpperCase();
}

function _getContextMain(zone: any, keyword: string) {
  var context,
    wd = keyword.toUpperCase();
  switch (zone) {
    case ZONE_TYPE.GBL_STMT:
    case ZONE_TYPE.DATA_STEP_STMT:
    case ZONE_TYPE.PROC_STMT:
    case ZONE_TYPE.MACRO_STMT:
    case ZONE_TYPE.ODS_STMT:
      context = getText("ce_ac_statement.fmt", wd);
      break;
    case ZONE_TYPE.PROC_DEF:
      context = getText("ce_ac_proc.fmt", wd);
      break;
    case ZONE_TYPE.GBL_STMT_OPT_VALUE:
    case ZONE_TYPE.PROC_OPT_VALUE:
    case ZONE_TYPE.PROC_STMT_OPT_VALUE:
    case ZONE_TYPE.VIEW_OR_PGM_OPT_VALUE:
    case ZONE_TYPE.DATA_STEP_OPT_VALUE:
    case ZONE_TYPE.DATA_STEP_STMT_OPT_VALUE:
    case ZONE_TYPE.DATA_SET_OPT_VALUE:
    case ZONE_TYPE.MACRO_STMT_OPT_VALUE:
    case ZONE_TYPE.ODS_STMT_OPT_VALUE:
    case ZONE_TYPE.OPT_VALUE:
      context = wd;
      break;
    default:
      context = getText("ce_ac_option.fmt", wd);
  }
  return context;
}

export class SasAutoCompleter {
  private czMgr;
  private loader;

  constructor(private model: SasModel, private syntaxColor: any) {
    this.loader = syntaxColor.lexer.langSrv;
    this.czMgr = new CodeZoneManager(model, this.loader, syntaxColor);
  }

  getHelp(position: Position): Promise<Hover | undefined> | undefined {
    const line = this.model.getLine(position.line);
    const tokens = this.syntaxColor.getSyntax(position.line);
    for (let j = 0; j < tokens.length; j++) {
      const type = tokens[j].style;
      const start = tokens[j].start;
      const end = j === tokens.length - 1 ? line.length : tokens[j + 1].start;
      if (end >= position.character) {
        const range = {
          start: { line: position.line, character: start },
          end: { line: position.line, character: end },
        };
        const keyword = this.model.getText(range);
        const zone = this.czMgr.getCurrentZone(
          position.line,
          position.character
        );
        return new Promise((resolve) => {
          this._loadHelp({
            keyword: keyword,
            type,
            zone,
            procName: this.czMgr.getProcName(),
            stmtName: this.czMgr.getStmtName(),
            optName: this.czMgr.getOptionName(),
            cb: (data: any) => {
              if (data && data.data) {
                resolve({
                  contents: {
                    kind: MarkupKind.Markdown,
                    value: this._addLinkContext(zone, data),
                  },
                  range,
                });
              } else {
                resolve(undefined);
              }
            },
          });
        });
      }
    }
  }

  private _loadHelp(context: any) {
    var keyword = _cleanUpKeyword(context.keyword),
      help = null,
      zone = context.zone,
      cb = context.cb,
      type = context.type;

    switch (zone) {
      case ZONE_TYPE.PROC_DEF:
        help = this.loader.getProcedureHelp(keyword, cb);
        break;
      case ZONE_TYPE.PROC_OPT:
        help = this.loader.getProcedureOptionHelp(
          context.procName,
          keyword,
          cb
        );
        break;
      case ZONE_TYPE.PROC_SUB_OPT_NAME:
        help = this.loader.getProcedureSubOptionHelp(
          context.procName,
          context.optName,
          keyword,
          cb
        );
        break;
      case ZONE_TYPE.PROC_OPT_VALUE:
        help = this.loader.getProcedureOptionValueHelp(
          context.procName,
          context.optName,
          keyword,
          cb
        );
        break;
      case ZONE_TYPE.PROC_STMT:
        if (type === "hint") keyword = _cleanUpKeyword(context.stmtName); //not use the real parameter value for hint
        if (context.procName === "ODS") {
          keyword = "ODS " + keyword;
        }
        help = this.loader.getProcedureStatementHelp(
          context.procName,
          keyword,
          cb
        );
        break;
      case ZONE_TYPE.PROC_STMT_OPT:
      case ZONE_TYPE.PROC_STMT_OPT_REQ:
        context.stmtName = _cleanUpKeyword(context.stmtName);
        if (context.procName === "ODS") {
          context.stmtName = "ODS " + context.stmtName;
        }
        help = this.loader.getProcedureStatementOptionHelp(
          context.procName,
          context.stmtName,
          keyword,
          cb
        );
        break;
      case ZONE_TYPE.PROC_STMT_SUB_OPT:
        help = this.loader.getProcedureStatementSubOptionHelp(
          context.procName,
          context.stmtName,
          context.optName,
          keyword,
          cb
        );
        break;
      case ZONE_TYPE.PROC_STMT_OPT_VALUE:
        if (context.procName === "ODS") {
          context.stmtName = "ODS " + context.stmtName;
        }
        help = this.loader.getProcedureStatementOptionValueHelp(
          context.procName,
          context.stmtName,
          context.optName,
          keyword,
          cb
        );
        break;
      case ZONE_TYPE.GBL_STMT_SUB_OPT_NAME:
        help = this.loader.getStatementSubOptionHelp(
          "global",
          _cleanUpKeyword(context.stmtName),
          context.optName,
          keyword
        );
        if (help) {
          _notify(cb, help);
        } else {
          help = this.loader.getStatementSubOptionHelp(
            "standalone",
            _cleanUpKeyword(context.stmtName),
            context.optName,
            keyword,
            cb
          );
        }
        break;
      case ZONE_TYPE.GBL_STMT_OPT:
        help = this.loader.getStatementOptionHelp(
          "global",
          _cleanUpKeyword(context.stmtName),
          keyword,
          cb
        );
        if (help) {
          _notify(cb, help);
        } else {
          help = this.loader.getStatementOptionHelp(
            "standalone",
            _cleanUpKeyword(context.stmtName),
            keyword,
            cb
          );
        }
        break;
      case ZONE_TYPE.GBL_STMT_OPT_VALUE:
        help = this.loader.getStatementOptionValueHelp(
          "global",
          context.stmtName,
          context.optName,
          keyword
        );
        if (help) {
          _notify(cb, help);
        } else {
          help = this.loader.getStatementOptionValueHelp(
            "standalone",
            context.stmtName,
            context.optName,
            keyword,
            cb
          );
        }
        break;
      case ZONE_TYPE.DATA_STEP_STMT:
        help = this.loader.getKeywordHelp(keyword, undefined, KW_MAP[zone]); // always sync
        if (help) {
          _notify(cb, help);
        } else {
          help = this.loader.getProcedureStatementHelp("DATA", keyword, cb);
        }
        break;
      case ZONE_TYPE.DATA_STEP_STMT_OPT:
        help = this.loader.getStatementOptionHelp(
          "datastep",
          context.stmtName,
          keyword,
          cb
        );
        if (help) {
          _notify(cb, help);
        } else {
          if (context.stmtName === "SET") {
            help = this.loader.getDataStepOptionHelp(
              keyword,
              cb,
              "datastep-option"
            );
          } else {
            help = this.loader.getProcedureStatementOptionHelp(
              "DATA",
              context.stmtName,
              keyword
            ); // always sync
          }
        }
        break;
      case ZONE_TYPE.DATA_STEP_STMT_OPT_VALUE:
        help = this.loader.getStatementOptionValueHelp(
          "datastep",
          context.stmtName,
          context.optName,
          keyword,
          cb
        );
        if (help) {
          _notify(cb, help);
        } else {
          if (context.stmtName === "SET") {
            help = this.loader.getDataStepOptionValueHelp(
              context.optName,
              keyword,
              cb
            );
          } else {
            help = this.loader.getProcedureStatementOptionValueHelp(
              "DATA",
              context.stmtName,
              context.optName,
              keyword
            ); // sync
            if (!help) {
              help = this.loader.getStatementOptionValueHelp(
                "global",
                context.stmtName,
                context.optName,
                keyword,
                cb
              );
            } else {
              _notify(cb, help);
            }
          }
        }
        break;
      case ZONE_TYPE.DATA_SET_OPT_VALUE:
        help = this.loader.getDataSetOptionValueHelp(
          context.optName,
          keyword,
          cb
        );
        break;
      case ZONE_TYPE.DATA_STEP_DEF_OPT:
      case ZONE_TYPE.VIEW_OR_PGM_OPT_NAME:
        help = this.loader.getDataStepOptionHelp(
          keyword,
          cb,
          "datastep-option2"
        );
        break;
      case ZONE_TYPE.DATA_SET_OPT_NAME:
        help = this.loader.getDSOptionHelp(keyword, cb);
        break;
      case ZONE_TYPE.DATA_STEP_OPT_NAME:
        help = this.loader.getDataStepOptionHelp(
          keyword,
          cb,
          "datastep-option"
        );
        break;
      case ZONE_TYPE.DATA_STEP_OPT_VALUE:
      case ZONE_TYPE.VIEW_OR_PGM_OPT_VALUE:
        help = this.loader.getDataStepOptionValueHelp(
          context.optName,
          keyword,
          cb
        );
        break;
      case ZONE_TYPE.MACRO_DEF_OPT:
        help = this.loader.getProcedureOptionHelp("MACRO", keyword, cb);
        break;
      case ZONE_TYPE.MACRO_STMT_OPT:
        help = this.loader.getStatementOptionHelp(
          "macro",
          context.stmtName,
          keyword,
          cb
        );
        break;
      case ZONE_TYPE.MACRO_STMT_OPT_VALUE:
        help = this.loader.getStatementOptionValueHelp(
          "macro",
          context.stmtName,
          context.optName,
          keyword,
          cb
        );
        break;
      case ZONE_TYPE.ODS_STMT:
        keyword = _cleanUpODSStmtName(keyword);
        /*if (keyword === 'ODS MARKUP') {
                        preparingHelper = name; //TODO: this is not very good!
                    }
                    help = this.loader.getProcedureStatementHelp('ODS', keyword, cb);*/
        help = this.loader.getKeywordHelp(keyword, cb, "gbl-proc-stmt");
        break;
      case ZONE_TYPE.ODS_STMT_OPT:
        var stmtName = _cleanUpODSStmtName(context.stmtName);
        help = this.loader.getStatementOptionHelp(
          "global",
          stmtName,
          keyword,
          cb
        );
        //stmtName = context.stmtName.replace('TAGSETS.','');
        //this.loader.getProcedureStatementOptionHelp('ODS', stmtName, keyword, cb);
        break;
      case ZONE_TYPE.ODS_STMT_OPT_VALUE:
        var stmtName = _cleanUpODSStmtName(context.stmtName);
        help = this.loader.getStatementOptionValueHelp(
          "global",
          stmtName,
          context.optName,
          keyword,
          cb
        );
        break;
      default: {
        if (KW_MAP[zone] === undefined) {
          if (cb) {
            _notify(cb, null);
          }
        } else {
          help = this.loader.getKeywordHelp(keyword, cb, KW_MAP[zone]);
        }
      }
    }
    return help;
  }

  private _addLinkContext(zone: any, content: any) {
    var context: any = {},
      contextText,
      linkTail,
      keyword,
      productDocumentation,
      sasNote,
      papers,
      tmpHintInfo,
      help,
      alias = "",
      sasReleaseParam = "fq=releasesystem%3AViya&";
    keyword = _cleanUpKeyword(content.key);
    // tmpHintInfo = {
    //   text: keyword,
    //   line: pos ? pos.line : hintInfo.line,
    //   column: pos ? pos.column : hintInfo.column,
    // };
    //if (type === "hint") {
    context.procName = this.czMgr.getProcName();
    context.stmtName = this.czMgr.getStmtName();
    context.optName = this.czMgr.getOptionName();
    //context = hintContext;
    //}
    if (context.procName === "STATGRAPH") {
      // S1481483
      context.procName = "TEMPLATE";
    }
    switch (zone) {
      case ZONE_TYPE.GBL_STMT:
        contextText = getText("ce_ac_global_statement_txt");
        linkTail = "%22" + keyword + "+STATEMENT%22";
        break;
      case ZONE_TYPE.GBL_STMT_OPT:
      case ZONE_TYPE.GBL_STMT_SUB_OPT_NAME:
        if (zone === ZONE_TYPE.GBL_STMT_SUB_OPT_NAME) keyword = context.optName;
        contextText = getText("ce_ac_statement.fmt", context.stmtName);
        linkTail =
          "%22SYSTEM+" + context.stmtName.toUpperCase() + "%22+" + keyword;
        break;
      case ZONE_TYPE.GBL_STMT_OPT_VALUE:
        contextText = getText("ce_ac_option.fmt", context.optName + "=");
        linkTail =
          "%22SYSTEM+" +
          context.stmtName +
          "%22+" +
          context.optName +
          "= " +
          keyword;
        break;
      case ZONE_TYPE.PROC_DEF:
        contextText = getText("ce_ac_procedure_definition_txt");
        linkTail = "%22PROC " + keyword + "%22";
        break;
      case ZONE_TYPE.PROC_OPT:
      case ZONE_TYPE.PROC_STMT:
        if (content.isGlobal) {
          contextText = getText("ce_ac_global_statement_txt");
          linkTail = "%22" + keyword + "+STATEMENT%22";
        } else {
          contextText = getText("ce_ac_proc.fmt", context.procName);
          linkTail = "PROC+" + context.procName + "+" + keyword;
        }
        break;
      case ZONE_TYPE.PROC_SUB_OPT_NAME:
        contextText =
          getText("ce_ac_proc.fmt", context.procName) +
          ", " +
          getText("ce_ac_option.fmt", context.optName + "=");
        linkTail = "%22PROC+" + context.procName + "%22+" + context.optName;
        break;
      case ZONE_TYPE.PROC_OPT_VALUE:
        contextText =
          getText("ce_ac_proc.fmt", context.procName) +
          ", " +
          getText("ce_ac_option.fmt", context.optName + "=");
        linkTail =
          "%22PROC+" +
          context.procName +
          "%22+%22" +
          context.optName +
          "= " +
          keyword +
          "%22";
        break;
      case ZONE_TYPE.PROC_STMT_OPT:
      case ZONE_TYPE.PROC_STMT_SUB_OPT:
        if (zone === ZONE_TYPE.PROC_STMT_SUB_OPT) keyword = context.optName;
        if (content.isGlobal) {
          contextText = getText("ce_ac_statement.fmt", context.stmtName);
          linkTail = "%22" + context.stmtName + "+STATEMENT%22";
        } else {
          contextText =
            getText("ce_ac_proc.fmt", context.procName) +
            ", " +
            getText("ce_ac_statement.fmt", context.stmtName);
          linkTail =
            "%22PROC+" +
            context.procName +
            "%22+%22" +
            context.stmtName +
            "+STATEMENT%22+" +
            keyword;
        }
        break;
      case ZONE_TYPE.PROC_STMT_OPT_VALUE:
        if (content.isGlobal) {
          contextText =
            getText("ce_ac_global_statement_txt") +
            ", " +
            getText("ce_ac_option.fmt", context.optName + "=");
          linkTail =
            "%22SYSTEM+" +
            context.stmtName +
            "%22+" +
            context.optName +
            "= " +
            keyword;
        } else {
          contextText =
            getText("ce_ac_proc.fmt", context.procName) +
            ", " +
            getText("ce_ac_statement.fmt", context.stmtName) +
            ", " +
            getText("ce_ac_option.fmt", context.optName + "=");
          linkTail =
            "PROC+" +
            context.procName +
            "+" +
            context.stmtName +
            "+STATEMENT+" +
            context.optName +
            "= " +
            keyword;
        }
        break;
      case ZONE_TYPE.DATA_STEP_STMT:
        contextText = getText("ce_ac_data_step_txt");
        linkTail = "%22DATA+STEP%22+%22" + keyword + "+" + "STATEMENT%22";
        break;
      case ZONE_TYPE.DATA_STEP_OPT_NAME:
      case ZONE_TYPE.DATA_STEP_DEF_OPT:
        contextText = getText("ce_ac_data_step_txt");
        linkTail = "%22DATA STATEMENT%22 "; // + _getOptionName(tmpHintInfo);
        break;
      case ZONE_TYPE.DATA_STEP_OPT_VALUE:
        contextText = getText("ce_ac_data_step_option_value_txt");
        linkTail = "%22DATA STATEMENT%22 " + context.optName + "= " + keyword;
        break;
      case ZONE_TYPE.VIEW_OR_PGM_OPT_NAME:
        contextText = getText("ce_ac_data_step_txt");
        linkTail = "%22DATA STEP PASSWORD= OPTION%22 "; // + _getOptionName(tmpHintInfo);
        break;
      case ZONE_TYPE.VIEW_OR_PGM_OPT_VALUE:
        contextText = getText("ce_ac_data_step_txt");
        linkTail =
          "%22DATA STEP PASSWORD= OPTION%22 " +
          context.optName +
          "= " +
          keyword;
        break;
      // case ZONE_TYPE.VIEW_OR_PGM_SUB_OPT_NAME:
      // contextText = 'DATA STEP VIEW PGM SUB OPTION NAME';
      // var nameParts = _getContextMain(zone, _cleanUpKeyword(_getOptionName(tmpHintInfo))).split(' ');
      // linkTail = "%22DATA STEP%22" + "%OPTIONS%22"+"%22" + nameParts[0] + "%22";
      // break;
      case ZONE_TYPE.DATA_SET_OPT_NAME:
        contextText = getText("ce_ac_data_set_option_txt");
        linkTail = "%22DATA SET OPTIONS%22 "; // + _getOptionName(tmpHintInfo);
        break;
      case ZONE_TYPE.DATA_SET_OPT_VALUE:
        contextText = getText("ce_ac_data_set_option_value_txt");
        linkTail = "%22DATA SET OPTIONS%22 " + context.optName + "= " + keyword;
        break;
      case ZONE_TYPE.MACRO_DEF:
        contextText = getText("ce_ac_macro_definition_txt");
        break;
      case ZONE_TYPE.MACRO_STMT:
        contextText = getText("ce_ac_macro_statement_txt");
        linkTail = "%22" + keyword.replace("%", "") + "+STATEMENT%22";
        break;
      case ZONE_TYPE.MACRO_DEF_OPT:
        contextText = getText("ce_ac_macro_definition_option_txt");
        linkTail =
          "%22" +
          context.stmtName.toUpperCase().replace("%", "") +
          " " +
          keyword.replace("%", "") +
          "%22";
        break;
      case ZONE_TYPE.MACRO_STMT_OPT:
        contextText = getText("ce_ac_macro_statement_option_txt");
        linkTail =
          "%22" +
          context.stmtName.toUpperCase().replace("%", "") +
          " " +
          keyword.replace("%", "") +
          "%22";
        break;
      case ZONE_TYPE.ODS_STMT:
        contextText = getText("ce_ac_ods_txt");
        linkTail = keyword;
        break;
      case ZONE_TYPE.ODS_STMT_OPT:
        contextText = _cleanUpODSStmtName(context.stmtName);
        linkTail = contextText + "+" + keyword;
        contextText = getText("ce_ac_statement.fmt", contextText);
        break;
      case ZONE_TYPE.ODS_STMT_OPT_VALUE:
        contextText = _cleanUpODSStmtName(context.stmtName);
        linkTail = contextText + "+" + context.optName + "= " + keyword;
        contextText =
          getText("ce_ac_statement.fmt", contextText) +
          ", " +
          getText("ce_ac_option.fmt", context.optName + "=");
        break;
      case ZONE_TYPE.TAGSETS_NAME:
        contextText = getText("ce_ac_ods_markup_txt");
        linkTail = "ODS " + keyword;
        break;
      case ZONE_TYPE.CALL_ROUTINE:
        contextText = getText("ce_ac_call_routine_txt");
        linkTail = "CALL " + keyword;
        break;
      case ZONE_TYPE.STYLE_LOC:
        contextText = getText("ce_ac_style_option_txt");
        linkTail = "STYLE%28" + keyword + "%29%22";
        break;
      case ZONE_TYPE.STYLE_ELEMENT:
        contextText = getText("ce_ac_style_option_txt");
        linkTail = "STYLE " + keyword;
        break;
      case ZONE_TYPE.STYLE_ATTR:
        contextText = getText("ce_ac_style_option_txt");
        linkTail = "STYLE " + keyword;
        break;
      // case ZONE_TYPE.MACRO_STMT:
      // contextText = 'MACRO STATEMENT';
      // linkTail = '%22' + keyword + '+STATEMENT%22';
      // break;
      default:
        contextText = ""; //zone;
        linkTail = keyword.replace("%", "");
    }
    var addr =
      "https://support.sas.com/en/search.html?" +
      sasReleaseParam +
      "q=" +
      linkTail;
    if (content.supportSite) {
      addr =
        "https://documentation.sas.com/?docsetId=" +
        content.supportSite.docsetId +
        "&docsetVersion=" +
        content.supportSite.docsetVersion +
        "&docsetTarget=";
      if (
        zone === ZONE_TYPE.PROC_DEF ||
        zone === ZONE_TYPE.SAS_FUNC ||
        !content.supportSite.supportSiteTargetFile
      ) {
        addr += content.supportSite.docsetTargetFile;
      } else {
        addr += content.supportSite.supportSiteTargetFile;
        if (content.supportSite.supportSiteTargetFragment) {
          addr += "#" + content.supportSite.supportSiteTargetFragment;
        }
      }
    }
    keyword =
      // "<a href = '" +
      // addr +
      // "' target = '_blank'>" +
      // _cleanUpKeyword(content.key.toUpperCase()) +
      // "</a>";
      "[" + _cleanUpKeyword(content.key.toUpperCase()) + "](" + addr + ")";
    productDocumentation =
      "<a href = 'https://support.sas.com/en/search.html?" +
      sasReleaseParam +
      "fq=siteArea%3ADocumentation&q=" +
      linkTail +
      "' target = '_blank'>" +
      getText("ce_ac_product_documentation_txt") +
      "</a>";
    sasNote =
      "<a href = 'https://support.sas.com/en/search.html?" +
      sasReleaseParam +
      "fq=siteArea%3A%22Samples%20%26%20SAS%20Notes%22&q=" +
      linkTail +
      "' target = '_blank'>" +
      getText("ce_ac_samples_and_sas_notes_txt") +
      "</a>";
    papers =
      "<a href = 'https://support.sas.com/en/search.html?" +
      sasReleaseParam +
      "fq=siteArea%3A%22Papers%20%26%20Proceedings%22&q=" +
      linkTail +
      "' target = '_blank'>" +
      getText("ce_ac_papers_txt") +
      "</a>";
    contextText = contextText.toUpperCase();
    if (contextText === "") {
      contextText = "\n\n";
    } else {
      contextText =
        "<b>" +
        getText("ce_ac_context_txt") +
        " [" +
        contextText +
        "] " +
        _getContextMain(
          zone,
          _cleanUpKeyword(/*_getOptionName(tmpHintInfo)*/ keyword)
        ) +
        "</b>\n\n";
    }
    if (content.alias && content.alias.length) {
      alias =
        getText("ce_ac_alias_txt") + " " + content.alias.join(", ") + "\n\n";
    }
    help = "&lt;no help>";
    if (content.data) {
      if (content.supportSite) {
        help = "";
        if (content.syntax) {
          help =
            "```" +
            getText("ce_ac_syntax_txt") +
            " " +
            content.syntax +
            "\n```\n\n";
        }
        help +=
          '<span style="white-space:pre-wrap;">' + content.data + "</span>";
      } else {
        help = content.data.replace(/\</g, "&lt;");
      }
    }
    return (
      getText("ce_ac_keyword_txt") +
      "  " +
      keyword +
      "\n\n" +
      alias +
      contextText +
      help
      // "\n<br />" +
      // getText("ce_ac_search_txt") +
      // "   " +
      // productDocumentation +
      // "     " +
      // sasNote +
      // "     " +
      // papers
    );
  }
}
