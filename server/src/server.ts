import {
  createConnection,
  TextDocuments,
  ProposedFeatures,
  TextDocumentSyncKind,
  InitializeResult,
  SemanticTokensRequest,
} from "vscode-languageserver/node";

import { TextDocument } from "vscode-languageserver-textdocument";
import { SyntaxProvider, legend } from "./sas/SyntaxProvider";

// Create a connection for the server, using Node's IPC as a transport.
// Also include all preview / proposed LSP features.
const connection = createConnection(ProposedFeatures.all);

const syntaxPool: Record<string, SyntaxProvider> = {};

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
      hoverProvider: true,
    },
  };
  return result;
});

connection.onRequest(SemanticTokensRequest.type, (params) => {
  const syntaxProvider = syntaxPool[params.textDocument.uri];

  return { data: syntaxProvider.getTokens() };
});

connection.onHover((params) => {
  const syntaxProvider = syntaxPool[params.textDocument.uri];

  return syntaxProvider.autoCompleter.getHelp(params.position);
});

documents.onDidChangeContent((event) => {
  syntaxPool[event.document.uri] = new SyntaxProvider(event.document);
});

// Make the text document manager listen on the connection
// for open, change and close text document events
documents.listen(connection);

// Listen on the connection
connection.listen();
