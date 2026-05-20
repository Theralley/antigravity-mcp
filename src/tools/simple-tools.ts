import { z } from 'zod';
import { UnifiedTool } from './registry.js';
import { executeCommand } from '../utils/commandExecutor.js';
import { CLI } from '../constants.js';

const pingArgsSchema = z.object({
  prompt: z.string().default('').describe('Message to echo '),
});

export const pingTool: UnifiedTool = {
  name: 'ping',
  description: 'Echo',
  zodSchema: pingArgsSchema,
  prompt: {
    description: 'Echo test message with structured response.',
  },
  category: 'simple',
  execute: async (args, onProgress) => {
    const message = args.prompt || args.message || 'Pong!';
    // Return message directly to avoid cross-platform issues with echo command
    return message as string;
  },
};

const helpArgsSchema = z.object({});

export const helpTool: UnifiedTool = {
  name: 'Help',
  description: 'receive help information',
  zodSchema: helpArgsSchema,
  prompt: {
    description: 'receive help information',
  },
  category: 'simple',
  execute: async (args, onProgress) => {
    return executeCommand(CLI.COMMANDS.GEMINI, [CLI.FLAGS.HELP], onProgress);
  },
};

const versionArgsSchema = z.object({});

export const versionTool: UnifiedTool = {
  name: 'version',
  description: 'Display version and system information',
  zodSchema: versionArgsSchema,
  prompt: {
    description: 'Get version information for Gemini CLI and Antigravity MCP server',
  },
  category: 'simple',
  execute: async (args, onProgress) => {
    try {
      const geminiVersion = await executeCommand(CLI.COMMANDS.GEMINI, [CLI.FLAGS.VERSION], onProgress);
      const nodeVersion = process.version;
      const platform = process.platform;

      return `**System Information:**
- Gemini CLI: ${geminiVersion.trim()}
- Node.js: ${nodeVersion}
- Platform: ${platform}
- MCP Server: @theralley/antigravity-mcp v1.0.0`;
    } catch (error) {
      return `**System Information:**
- Gemini CLI: Not installed or not accessible
- Node.js: ${process.version}
- Platform: ${process.platform}
- MCP Server: @theralley/antigravity-mcp v1.0.0

*Note: Please make sure the 'gemini' CLI tool is installed globally.*`;
    }
  },
};
