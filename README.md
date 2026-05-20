# Antigravity MCP Server

An open‑source Model Context Protocol (MCP) server that connects your AI assistants (Claude, Cursor, etc.) to the **Gemini CLI** (running the **Antigravity** agentic framework). 

By wrapping the Gemini CLI, other AI assistants can delegate complex coding tasks, directory analyses, and autonomous workflows to Antigravity, which executes them locally in the project directory.

## Features

- **Ask Antigravity**: Run any prompt or coding instruction through the Gemini CLI.
- **Batch Processing**: Run multiple independent tasks sequentially.
- **Structured Brainstorming**: Generate creative solutions with methodologies like SCAMPER, lateral thinking, or design thinking.
- **Workspace Aware**: Automatically executes tasks inside the resolved project directories.

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

You can configure this MCP server in your Claude Desktop or Cursor settings.

### One-Line CLI Setup for Claude Code
```bash
claude mcp add antigravity-cli -- npx -y @theralley/antigravity-mcp
```

### Claude Desktop Configuration
Add the following to your `claude_desktop_config.json`:

```json
{
  "mcpServers": {
    "antigravity-mcp": {
      "command": "npx",
      "args": ["-y", "@theralley/antigravity-mcp"]
    }
  }
}
```

### Cursor Configuration
Add a new MCP server in Cursor settings:
- **Name**: `antigravity-mcp`
- **Type**: `command`
- **Command**: `npx -y @theralley/antigravity-mcp`

### Environment Variables
- `GEMINI_PATH`: (Optional) Path to the `gemini` executable if it is not in your system PATH.
- `GEMINI_MCP_CWD`: (Optional) Root directory where the tool will execute commands by default.

---

## Tools Exposed

### 1. `ask-antigravity` (alias: `ask-gemini`)
Runs the Gemini CLI in headless, non-interactive mode.
- **Arguments**:
  - `prompt` (string, required): The task or question. Use `@` syntax to reference files (e.g. `@src/index.ts explain this code`).
  - `model` (string, optional): Model override (e.g., `gemini-2.5-pro`, `gemini-2.5-flash`).
  - `sandbox` (boolean, optional): Run the agent in sandbox mode.
  - `yolo` (boolean, optional): Automatically accept all agent actions.
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
