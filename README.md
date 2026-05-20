# Antigravity MCP Server

An open‑source Model Context Protocol (MCP) server that connects your AI assistants (Claude Code, Cursor, Claude Desktop, etc.) to the **Gemini CLI** (running the **Antigravity** agentic framework). 

By wrapping the Gemini CLI, other AI assistants can delegate complex coding tasks, codebase editing, directory analyses, and autonomous workflows to Antigravity, which executes them locally in the project workspace.

---

## Features

- **Ask Antigravity**: Run any prompt or coding instruction through the Gemini CLI.
- **Batch Processing**: Run multiple independent tasks sequentially.
- **Structured Brainstorming**: Generate creative solutions with methodologies like SCAMPER, lateral thinking, or design thinking.
- **Workspace Aware**: Automatically executes tasks inside resolved project directories.
- **Auto-YOLO**: Defaults to YOLO mode (`-y`) to prevent hangs during non-interactive, headless execution.

---

## Prerequisites

1. **Node.js** (v18.0.0 or higher)
2. **Gemini CLI** (`gemini` command line tool) installed globally and authenticated on your system:
   ```bash
   # Verify installation
   gemini --version
   ```

---

## Setup & Configuration

You can run this MCP server either via the published `npx` package or a local build.

### A. Local Setup (Recommended for Customizations)

1. Clone the repository and build:
   ```bash
   git clone https://github.com/Theralley/antigravity-mcp.git
   cd antigravity-mcp
   npm install
   npm run build
   ```

2. Register with **Claude Code** (User/Global scope):
   ```bash
   claude mcp add --scope user antigravity-mcp -- node /path/to/antigravity-mcp/dist/index.js
   ```

3. Register with **Claude Desktop**:
   Add the following to your `claude_desktop_config.json` (located at `~/Library/Application Support/Claude/claude_desktop_config.json` on macOS):
   ```json
   {
     "mcpServers": {
       "antigravity-mcp": {
         "command": "node",
         "args": ["/path/to/antigravity-mcp/dist/index.js"]
       }
     }
   }
   ```

4. Register with **Cursor**:
   Add a new MCP server in Cursor settings:
   - **Name**: `antigravity-mcp`
   - **Type**: `command`
   - **Command**: `node /path/to/antigravity-mcp/dist/index.js`

---

### B. Setup via NPX (Published Package)

* **Claude Code**:
  ```bash
  claude mcp add antigravity-cli -- npx -y @theralley/antigravity-mcp
  ```

* **Claude Desktop**:
  ```json
  "antigravity-mcp": {
    "command": "npx",
    "args": ["-y", "@theralley/antigravity-mcp"]
  }
  ```

---

## Environment Variables
- `GEMINI_PATH`: (Optional) Absolute path to the `gemini` executable if it is not in your system PATH.
- `GEMINI_MCP_CWD`: (Optional) Root directory where the tool will execute commands by default.

---

## Tools Exposed

### 1. `ask-antigravity` (alias: `ask-gemini`)
Runs the Gemini CLI in headless, non-interactive mode.
- **Arguments**:
  - `prompt` (string, required): The task or question. Use `@` syntax to reference files (e.g. `@src/index.ts explain this code`).
  - `model` (string, optional): Model override (e.g., `gemini-2.5-pro`, `gemini-2.5-flash`).
  - `sandbox` (boolean, optional): Run the agent in sandbox mode.
  - `yolo` (boolean, optional): Automatically accept all agent actions (defaults to `true`).
  - `approvalMode` (string, optional): `'default'`, `'auto_edit'`, `'yolo'`, or `'plan'`.
  - `workingDir` (string, optional): Execution workspace directory.

### 2. `batch-antigravity` (alias: `batch-gemini`)
Runs multiple tasks sequentially.
- **Arguments**:
  - `tasks` (array, required): Array of task objects containing `task`, `target`, and `priority`.
  - `stopOnError` (boolean, optional): Stop processing if a task fails.

### 3. `brainstorm`
Runs a structured brainstorming session using chosen methodology.
- **Arguments**:
  - `prompt` (string, required): The challenge.
  - `methodology` (string, optional): `'divergent'`, `'convergent'`, `'scamper'`, `'design-thinking'`, `'lateral'`, `'auto'`.
  - `domain` (string, optional): The industry or field.
  - `ideaCount` (number, optional): Target number of ideas.

### 4. Simple Health & System Tools
- **`ping`**: Echoes back a test message to verify stdio transport health.
- **`version`**: Reports System details, Gemini CLI version, and `@theralley/antigravity-mcp` version.
- **`Help`**: Returns the help output of the underlying Gemini CLI.
