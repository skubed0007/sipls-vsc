import * as vscode from "vscode";

interface Snippet {
  prefix: string[];
  body: string[];
  description: string;
}

export async function activate(context: vscode.ExtensionContext) {
  vscode.window.showInformationMessage("Neit Language Extension activated");

  vscode.languages.registerCompletionItemProvider('neit', {
    provideCompletionItems(document: vscode.TextDocument, position: vscode.Position) {
      const linePrefix = document.lineAt(position).text.substring(0, position.character);

      const snippets: { [key: string]: Snippet } = {
        "if": {
          prefix: ["if"],
          body: [
            "if (${1:condition}) {",
            "  ${0:body}",
            "}"
          ],
          description: "if statement"
        },
        "while": {
          prefix: ["while"],
          body: [
            "while (${1:condition}) {",
            "  ${0:body}",
            "}"
          ],
          description: "while loop"
        },
        "exit": {
          prefix: ["exit"],
          body: [
            "exit ${1|ok,success,0,fail,failure,1,invalid arg,inv arg,128,not found,nf,127,permission err,perm err,permission denied,126,killed,kill,137,interrupt,int,signal int,130,segfault,seg,segmentation fault,11,out of range,range error,255|}"
          ],
          description: "exit statement with common exit codes"
        },
        "Single Line Comment": {
          prefix: ["#"],
          body: [
            "# ${1:comment_text}"
          ],
          description: "Single line comment"
        },
        "Block Comment": {
          prefix: ["##"],
          body: [
            "## ${1:comment_block} ##"
          ],
          description: "Block comment"
        },
        "Print": {
          prefix: ["print"],
          body: [
            "print ${1:text}"
          ],
          description: "Print statement"
        },
        "Print Line": {
          prefix: ["println"],
          body: [
            "println ${1:text}"
          ],
          description: "Print line statement"
        },
        "Variable Declaration": {
          prefix: ["may"],
          body: [
            "may ${1:variable_name} = ${2:value}"
          ],
          description: "Variable declaration"
        },
        "Function Declaration": {
          prefix: ["cmd"],
          body: [
            "cmd ${1:function_name} {",
            "  (${2:parameters})",
            "  ${0:body}",
            "}"
          ],
          description: "Function declaration with parameters"
        },
        "Function Parameter": {
          prefix: ["param"],
          body: [
            "${1:param_name}: ${2:type}"
          ],
          description: "Function parameter"
        },
        "Function Call": {
          prefix: ["call"],
          body: [
            "${1:function_name}(${2:arguments})"
          ],
          description: "Function call"
        },
        "Take Input": {
          prefix: ["takein"],
          body: [
            "takein(${1:variable_name})"
          ],
          description: "Take input from user"
        },
        "Variable Assignment": {
          prefix: ["="],
          body: [
            "${1:variable_name} = ${2:value}"
          ],
          description: "Variable assignment"
        },
        "Reassign Variable": {
          prefix: ["reassign"],
          body: [
            "${1:variable_name} = ${2:new_value}"
          ],
          description: "Reassign value to an existing variable"
        },
        "Comparison": {
          prefix: ["comp"],
          body: [
            "${1:left_operand} ${2|==,!=,<,<=,>,>=|} ${3:right_operand}"
          ],
          description: "Comparison operation"
        },
        "Logical Operators": {
          prefix: ["logic"],
          body: [
            "${1:left_operand} ${2|&&,||,!|} ${3:right_operand}"
          ],
          description: "Logical operator usage"
        }
      };

      const completionItems: vscode.CompletionItem[] = [];

      Object.keys(snippets).forEach((key) => {
        const snippet = snippets[key];
        if (linePrefix.endsWith(snippet.prefix[0])) {
          const completionItem = new vscode.CompletionItem(key, vscode.CompletionItemKind.Snippet);
          completionItem.insertText = new vscode.SnippetString(snippet.body.join("\n"));
          completionItem.documentation = snippet.description;
          completionItems.push(completionItem);
        }
      });

      return completionItems;
    }
  });
}

export function deactivate(): Thenable<void> | undefined {
  return undefined;
}
