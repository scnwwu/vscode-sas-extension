import { createConnection, ProposedFeatures } from "vscode-languageserver/node";

import { init } from "../server";

// Create a connection for the server, using Node's IPC as a transport.
// Also include all preview / proposed LSP features.
const connection = createConnection(ProposedFeatures.all);

// platform independant initialization
init(connection);
