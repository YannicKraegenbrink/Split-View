# CSS TSX Split View - VS Code Extension

## Project Overview

This is a VS Code extension that automatically opens paired CSS and TSX files in a split view.

## Tech Stack

- TypeScript
- VS Code Extension API
- esbuild (bundler)

## Key Files

- `src/extension.ts` - Main extension logic
- `package.json` - Extension manifest with commands and configuration

## Development Commands

- `npm run compile` - Compile the extension
- `npm run watch` - Watch mode for development
- `npm run lint` - Run ESLint
- Press `F5` to launch the extension in debug mode

## Architecture

The extension:

1. Listens for `onDidChangeActiveTextEditor` events
2. Checks if the opened file is a CSS or TSX file
3. Searches for a corresponding paired file in the same directory
4. Opens the paired file in split view (TSX on left, CSS on right)

## Configuration Options

- `cssTsxSplitView.enabled` - Toggle the extension
- `cssTsxSplitView.cssExtensions` - CSS file extensions to match
- `cssTsxSplitView.tsxExtensions` - TSX file extensions to match
