# CSS TSX Split View

A VS Code extension that automatically opens paired CSS and TSX files in a split view. When you open a TSX file, it appears on the left side, and the corresponding CSS file opens on the right side (and vice versa).

## Features

- **Automatic Pair Detection**: When you open a CSS or TSX file, the extension automatically looks for a corresponding paired file in the same directory
- **Smart Split View**: TSX/JSX files always open on the left (ViewColumn.One), CSS files always open on the right (ViewColumn.Two)
- **Multiple Extension Support**: Works with various file extensions:
  - CSS: `.css`, `.scss`, `.sass`, `.less`, `.module.css`, `.module.scss`
  - TSX: `.tsx`, `.jsx`, `.ts`, `.js`
- **Naming Pattern Matching**: Handles common naming patterns like `Component.tsx` / `Component.css` or `Component.tsx` / `Component.module.css`
- **Manual Command**: Use the command palette to manually trigger paired file opening

## Usage

1. Simply open any CSS or TSX file
2. The extension will automatically find and open the corresponding paired file in a split view
3. TSX files appear on the left, CSS files on the right

### Manual Command

You can also manually trigger the paired file opening:

1. Open the Command Palette (`Cmd+Shift+P` on macOS, `Ctrl+Shift+P` on Windows/Linux)
2. Type "Open Paired CSS/TSX File"
3. Press Enter

## Extension Settings

This extension contributes the following settings:

- `cssTsxSplitView.enabled`: Enable/disable automatic split view for CSS/TSX file pairs (default: `true`)
- `cssTsxSplitView.cssExtensions`: Array of CSS file extensions to match (default: `[".css", ".scss", ".sass", ".less", ".module.css", ".module.scss"]`)
- `cssTsxSplitView.tsxExtensions`: Array of TSX/JSX file extensions to match (default: `[".tsx", ".jsx", ".ts", ".js"]`)

## Examples

The extension will pair files like:

- `Button.tsx` ↔ `Button.css`
- `Card.jsx` ↔ `Card.scss`
- `Modal.tsx` ↔ `Modal.module.css`
- `Header.ts` ↔ `Header.less`

## Requirements

No additional requirements or dependencies.

## Known Issues

- The extension only looks for paired files in the same directory
- If multiple potential pairs exist, the first match is used

## Release Notes

### 0.0.1

Initial release of CSS TSX Split View:

- Automatic paired file detection
- Split view opening (TSX left, CSS right)
- Configurable file extensions
- Manual command for paired file opening
