import {
  createConnection,
  TextDocuments,
  ProposedFeatures,
  TextDocumentSyncKind,
  InitializeResult,
  SemanticTokensRequest,
} from "vscode-languageserver/node";

import { TextDocument } from "vscode-languageserver-textdocument";
import { LanguageServiceProvider, legend } from "./sas/LanguageServiceProvider";
import { CompletionProvider } from "./sas/CompletionProvider";

// Create a connection for the server, using Node's IPC as a transport.
// Also include all preview / proposed LSP features.
const connection = createConnection(ProposedFeatures.all);

const servicePool: Record<string, LanguageServiceProvider> = {};

let completionProvider: CompletionProvider;

// Create a simple text document manager.
const documents: TextDocuments<TextDocument> = new TextDocuments(TextDocument);

connection.onInitialize(() => {
  const result: InitializeResult = {
    capabilities: {
      textDocumentSync: TextDocumentSyncKind.Incremental,
      semanticTokensProvider: {
        legend,
        full: true,
      },
      documentSymbolProvider: true,
      foldingRangeProvider: true,
      hoverProvider: true,
      completionProvider: {
        triggerCharacters: [" "],
        resolveProvider: true,
      },
    },
  };
  return result;
});

connection.onRequest(SemanticTokensRequest.type, (params) => {
  const languageService = servicePool[params.textDocument.uri];

  return { data: languageService.getTokens() };
});

connection.onHover((params) => {
  const languageService = servicePool[params.textDocument.uri];

  return languageService.completionProvider.getHelp(params.position);
});

connection.onCompletion((params) => {
  const languageService = servicePool[params.textDocument.uri];
  completionProvider = languageService.completionProvider;

  return completionProvider.getCompleteItems(params.position);
});

connection.onCompletionResolve((params) => {
  return completionProvider.getCompleteItemHelp(params);
});

connection.onDocumentSymbol((params) => {
  const languageService = servicePool[params.textDocument.uri];
  return languageService
    .getFoldingBlocks()
    .filter((symbol) => symbol.name !== "custom");
});

connection.onFoldingRanges((params) => {
  const languageService = servicePool[params.textDocument.uri];
  return languageService.getFoldingBlocks().map((block) => ({
    startLine: block.range.start.line,
    endLine: block.range.end.line,
  }));
});

documents.onDidChangeContent((event) => {
  servicePool[event.document.uri] = new LanguageServiceProvider(event.document);
});

// Make the text document manager listen on the connection
// for open, change and close text document events
documents.listen(connection);

// Listen on the connection
connection.listen();
