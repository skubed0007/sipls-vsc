import * as vscode from "vscode";
import { LanguageClient, LanguageClientOptions, ServerOptions } from "vscode-languageclient/node";

const enum NeitCommands {
  RestartServer = "neit.restartServer",
}

let client: LanguageClient | undefined;

export async function activate(context: vscode.ExtensionContext) {
  // Register restart command
  const restartCommand = vscode.commands.registerCommand(
    NeitCommands.RestartServer,
    async () => {
      if (!client) {
        vscode.window.showErrorMessage("Neit client not found");
        return;
      }

      try {
        if (client.isRunning()) {
          await client.restart();
          vscode.window.showInformationMessage("Neit server restarted.");
        } else {
          await client.start();
        }
      } catch (err) {
        client.error("Restarting client failed", err, "force");
      }
    }
  );

  context.subscriptions.push(restartCommand);

  // Create and start the Neit language client (LSP server)
  client = await createLanguageClient();
  client?.start();
}

export function deactivate(): Thenable<void> | undefined {
  return client?.stop();
}

async function createLanguageClient(): Promise<LanguageClient | undefined> {
  const command = "neit"; // Using the "neit" command directly for the LSP server

  const clientOptions: LanguageClientOptions = {
    documentSelector: [{ scheme: "file", language: "neit" }],
  };

  const serverOptions: ServerOptions = {
    command,
    args: ["lsp"], // Assuming "lsp" is the argument to start the server
    options: {
      env: { ...process.env, NEIT_LOG: "info", NEIT_LOG_NOCOLOUR: "1" },
    },
  };

  return new LanguageClient(
    "neit_language_server",
    "Neit Language Server",
    serverOptions,
    clientOptions
  );
}
