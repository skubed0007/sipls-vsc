import * as vscode from "vscode";

interface Snippet {
  prefix: string;
  body: string[];
  description: string;
}

// Cache for completion items
const completionCache = new Map<string, vscode.CompletionItem[]>();

// Pre-define snippets for better performance
const snippets = new Map<string, Snippet>([
  ["if", {
    prefix: "if",
    body: ["if (${1:condition}) {", "  ${0:body}", "}"],
    description: "if statement"
  }],
  ["while", {
    prefix: "while",
    body: ["while (${1:condition}) {", "  ${0:body}", "}"],
    description: "while loop"
  }],
  ["comment", {
    prefix: "//",
    body: ["// ${1:comment_text}"],
    description: "Single line comment"
  }],
  ["block", {
    prefix: "/*",
    body: ["/* ${1:comment_block} */"],
    description: "Block comment"
  }],
  ["let", {
    prefix: "let",
    body: ["let ${1:variable_name} @ ${2:variable_type} = ${3:value}"],
    description: "Variable declaration"
  }],
  ["const", {
    prefix: "const",
    body: ["const ${1:constant_name} @ ${2:constant_type} = ${3:value}"],
    description: "Constant declaration"
  }],
  ["global", {
    prefix: "global",
    body: ["global ${1:variable_name} @ ${2:variable_type} = ${3:value}"],
    description: "Global variable declaration"
  }],
  ["fun", {
    prefix: "fun",
    body: ["fun ${1:function_name}(${2:params}) @ ${3:return_type} {", "  ${4:body}", "  ret ${5:return_value}", "}"],
    description: "Function declaration"
  }],
  ["param", {
    prefix: "param",
    body: ["${1:type} ${2:param_name}"],
    description: "Function parameter"
  }],
  ["assign", {
    prefix: "=",
    body: ["${1:variable_name} = ${2:new_value}"],
    description: "Variable assignment"
  }],
  ["comp", {
    prefix: "comp",
    body: ["${1:left_operand} ${2|==,!=,<,<=,>,>=|} ${3:right_operand}"],
    description: "Comparison"
  }],
  ["logic", {
    prefix: "logic",
    body: ["${1:left_operand} ${2|&&,||,!|} ${3:right_operand}"],
    description: "Logical operator"
  }]
]);

// Pre-compute common patterns for better performance
const commonPatterns = {
  lineEnd: /\s*$/,
  wordEnd: /([a-zA-Z_]\w*)$/,
  commentStart: /^\s*\/\//,
  blockCommentStart: /^\s*\/\*/,
  blockCommentEnd: /\*\//,
  functionStart: /^\s*fun\b/,
  constStart: /^\s*const\b/,
  globalStart: /^\s*global\b/,
  letStart: /^\s*let\b/
};

export function activate(context: vscode.ExtensionContext) {
  vscode.window.showInformationMessage("Sip Language Extension activated");

  // Register completion provider
  const provider = vscode.languages.registerCompletionItemProvider('sip', {
    provideCompletionItems(document: vscode.TextDocument, position: vscode.Position) {
      const line = document.lineAt(position);
      const linePrefix = line.text.substring(0, position.character);
      
      // Check cache first
      const cached = completionCache.get(linePrefix);
      if (cached) return cached;

      // Skip if we're in a comment
      if (commonPatterns.commentStart.test(line.text) || 
          (commonPatterns.blockCommentStart.test(line.text) && !commonPatterns.blockCommentEnd.test(line.text))) {
        return [];
      }

      const items: vscode.CompletionItem[] = [];
      
      // Use for...of for better performance with Map
      for (const [key, snippet] of snippets) {
        if (linePrefix.endsWith(snippet.prefix)) {
          const item = new vscode.CompletionItem(key, vscode.CompletionItemKind.Snippet);
          item.insertText = new vscode.SnippetString(snippet.body.join("\n"));
          item.documentation = snippet.description;
          items.push(item);
        }
      }

      // Cache the results
      completionCache.set(linePrefix, items);
      return items;
    }
  });

  context.subscriptions.push(provider);
}

export function deactivate() {
  // Clear cache on deactivate
  completionCache.clear();
}
