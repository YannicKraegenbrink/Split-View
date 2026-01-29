// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below
import * as vscode from "vscode";
import * as path from "path";
import * as fs from "fs";

// Track files we're currently opening to prevent infinite loops
let isOpeningPairedFile = false;

// Default extensions
const DEFAULT_CSS_EXTENSIONS = [
  ".css",
  ".scss",
  ".sass",
  ".less",
  ".module.css",
  ".module.scss",
];
const DEFAULT_TSX_EXTENSIONS = [".tsx", ".jsx", ".ts", ".js"];

/**
 * Get configuration values
 */
function getConfig() {
  const config = vscode.workspace.getConfiguration("cssTsxSplitView");
  return {
    enabled: config.get<boolean>("enabled", true),
    cssExtensions: config.get<string[]>(
      "cssExtensions",
      DEFAULT_CSS_EXTENSIONS,
    ),
    tsxExtensions: config.get<string[]>(
      "tsxExtensions",
      DEFAULT_TSX_EXTENSIONS,
    ),
  };
}

/**
 * Check if a file is a CSS file
 */
function isCssFile(filePath: string, cssExtensions: string[]): boolean {
  const lowerPath = filePath.toLowerCase();
  return cssExtensions.some((ext) => lowerPath.endsWith(ext.toLowerCase()));
}

/**
 * Check if a file is a TSX/JSX file
 */
function isTsxFile(filePath: string, tsxExtensions: string[]): boolean {
  const lowerPath = filePath.toLowerCase();
  return tsxExtensions.some((ext) => lowerPath.endsWith(ext.toLowerCase()));
}

/**
 * Get the base name without extension (handles compound extensions like .module.css)
 */
function getBaseName(filePath: string, extensions: string[]): string {
  const fileName = path.basename(filePath);
  const lowerFileName = fileName.toLowerCase();

  // Sort extensions by length (longest first) to match compound extensions first
  const sortedExtensions = [...extensions].sort((a, b) => b.length - a.length);

  for (const ext of sortedExtensions) {
    if (lowerFileName.endsWith(ext.toLowerCase())) {
      return fileName.slice(0, -ext.length);
    }
  }

  // Fallback: remove last extension
  return path.parse(fileName).name;
}

/**
 * Find a paired file in the same directory
 */
async function findPairedFile(
  filePath: string,
  isCss: boolean,
  cssExtensions: string[],
  tsxExtensions: string[],
): Promise<string | null> {
  const dir = path.dirname(filePath);
  const allExtensions = [...cssExtensions, ...tsxExtensions];
  const baseName = getBaseName(filePath, allExtensions);

  // Determine which extensions to search for
  const targetExtensions = isCss ? tsxExtensions : cssExtensions;

  // Look for matching files
  for (const ext of targetExtensions) {
    const candidatePath = path.join(dir, baseName + ext);
    if (fs.existsSync(candidatePath) && candidatePath !== filePath) {
      return candidatePath;
    }
  }

  // Also try common naming patterns
  const namingPatterns = isCss
    ? [
        baseName,
        baseName.replace(/\.module$/, ""),
        baseName.replace(/\.styles$/, ""),
      ]
    : [baseName, `${baseName}.module`, `${baseName}.styles`];

  for (const pattern of namingPatterns) {
    for (const ext of targetExtensions) {
      const candidatePath = path.join(dir, pattern + ext);
      if (fs.existsSync(candidatePath) && candidatePath !== filePath) {
        return candidatePath;
      }
    }
  }

  return null;
}

/**
 * Open file in split view
 * - TSX files open on the left (ViewColumn.One)
 * - CSS files open on the right (ViewColumn.Two)
 */
async function openInSplitView(
  filePath: string,
  isCss: boolean,
): Promise<void> {
  const viewColumn = isCss ? vscode.ViewColumn.Two : vscode.ViewColumn.One;
  const document = await vscode.workspace.openTextDocument(filePath);
  await vscode.window.showTextDocument(document, {
    viewColumn,
    preserveFocus: true,
    preview: false,
  });
}

/**
 * Handle when a text editor becomes active
 */
async function handleEditorChange(
  editor: vscode.TextEditor | undefined,
): Promise<void> {
  if (!editor || isOpeningPairedFile) {
    return;
  }

  const config = getConfig();
  if (!config.enabled) {
    return;
  }

  const filePath = editor.document.uri.fsPath;

  // Check if this is a CSS or TSX file
  const isCss = isCssFile(filePath, config.cssExtensions);
  const isTsx = isTsxFile(filePath, config.tsxExtensions);

  if (!isCss && !isTsx) {
    return;
  }

  // Find the paired file
  const pairedFilePath = await findPairedFile(
    filePath,
    isCss,
    config.cssExtensions,
    config.tsxExtensions,
  );

  if (!pairedFilePath) {
    return;
  }

  // Check if paired file is already open in visible editors
  const visibleEditors = vscode.window.visibleTextEditors;
  const isPairedFileVisible = visibleEditors.some(
    (e) => e.document.uri.fsPath === pairedFilePath,
  );

  if (isPairedFileVisible) {
    return;
  }

  // Open the paired file in split view
  try {
    isOpeningPairedFile = true;

    // First, ensure the current file is in the correct column
    const currentViewColumn = isCss
      ? vscode.ViewColumn.Two
      : vscode.ViewColumn.One;
    if (editor.viewColumn !== currentViewColumn) {
      await vscode.window.showTextDocument(editor.document, {
        viewColumn: currentViewColumn,
        preserveFocus: false,
        preview: false,
      });
    }

    // Then open the paired file
    await openInSplitView(pairedFilePath, !isCss);

    // Focus back on the original file
    await vscode.window.showTextDocument(editor.document, {
      viewColumn: currentViewColumn,
      preserveFocus: false,
      preview: false,
    });
  } finally {
    // Small delay before allowing next paired file open
    setTimeout(() => {
      isOpeningPairedFile = false;
    }, 500);
  }
}

/**
 * Command to manually open paired file
 */
async function openPairedFileCommand(): Promise<void> {
  const editor = vscode.window.activeTextEditor;
  if (!editor) {
    vscode.window.showWarningMessage("No active editor");
    return;
  }

  const config = getConfig();
  const filePath = editor.document.uri.fsPath;

  const isCss = isCssFile(filePath, config.cssExtensions);
  const isTsx = isTsxFile(filePath, config.tsxExtensions);

  if (!isCss && !isTsx) {
    vscode.window.showWarningMessage("Current file is not a CSS or TSX file");
    return;
  }

  const pairedFilePath = await findPairedFile(
    filePath,
    isCss,
    config.cssExtensions,
    config.tsxExtensions,
  );

  if (!pairedFilePath) {
    vscode.window.showWarningMessage(
      `No paired ${isCss ? "TSX" : "CSS"} file found`,
    );
    return;
  }

  try {
    isOpeningPairedFile = true;

    // Move current file to correct column
    const currentViewColumn = isCss
      ? vscode.ViewColumn.Two
      : vscode.ViewColumn.One;
    await vscode.window.showTextDocument(editor.document, {
      viewColumn: currentViewColumn,
      preserveFocus: false,
      preview: false,
    });

    // Open paired file
    await openInSplitView(pairedFilePath, !isCss);
  } finally {
    setTimeout(() => {
      isOpeningPairedFile = false;
    }, 500);
  }
}

// This method is called when your extension is activated
export function activate(context: vscode.ExtensionContext) {
  // Register the manual command
  const commandDisposable = vscode.commands.registerCommand(
    "css-tsx-split-view.openPairedFile",
    openPairedFileCommand,
  );
  context.subscriptions.push(commandDisposable);

  // Listen for active editor changes
  const editorChangeDisposable =
    vscode.window.onDidChangeActiveTextEditor(handleEditorChange);
  context.subscriptions.push(editorChangeDisposable);

  // Also handle the current active editor on activation
  if (vscode.window.activeTextEditor) {
    handleEditorChange(vscode.window.activeTextEditor);
  }
}

// This method is called when your extension is deactivated
export function deactivate() {}
