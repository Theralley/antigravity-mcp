import { z } from 'zod';
import { UnifiedTool } from './registry.js';
import { executeGemini } from '../utils/geminiExecutor.js';
import { MODELS, ERROR_MESSAGES } from '../constants.js';

const askAntigravityArgsSchema = z.object({
  prompt: z
    .string()
    .min(1)
    .describe("Task or question. Use @ to include files (e.g., '@largefile.ts explain')."),
  model: z
    .string()
    .optional()
    .describe(`Model: ${Object.values(MODELS).join(', ')}. Default: gemini-2.5-pro`),
  sandbox: z
    .boolean()
    .optional()
    .describe('Run in sandbox mode'),
  yolo: z
    .boolean()
    .optional()
    .describe('Automatically accept all actions (YOLO mode)'),
  approvalMode: z
    .enum(['default', 'auto_edit', 'yolo', 'plan'])
    .optional()
    .describe('Approval mode: default, auto_edit, yolo, plan'),
  workingDir: z
    .string()
    .optional()
    .describe('Working directory for execution'),
  includeDirectories: z
    .array(z.string())
    .optional()
    .describe('Additional directories to include in the workspace'),
  policy: z
    .array(z.string())
    .optional()
    .describe('Additional policy files or directories to load'),
  adminPolicy: z
    .array(z.string())
    .optional()
    .describe('Additional admin policy files or directories to load'),
  outputFormat: z
    .enum(['text', 'json', 'stream-json'])
    .optional()
    .describe('The format of the CLI output'),
  timeout: z
    .number()
    .optional()
    .describe('Maximum execution time in milliseconds (optional)'),
});

export const askAntigravityTool: UnifiedTool = {
  name: 'ask-antigravity',
  description:
    'Execute Gemini CLI (Antigravity Agent) with prompt instructions, safety settings, and custom approval modes.',
  zodSchema: askAntigravityArgsSchema,
  prompt: {
    description: 'Execute Gemini CLI with custom parameters',
  },
  category: 'utility',
  execute: async (args, onProgress) => {
    const {
      prompt,
      model,
      sandbox,
      yolo,
      approvalMode,
      workingDir,
      includeDirectories,
      policy,
      adminPolicy,
      outputFormat,
      timeout,
    } = args;

    if (!prompt?.trim()) {
      throw new Error(ERROR_MESSAGES.NO_PROMPT_PROVIDED);
    }

    try {
      const result = await executeGemini(
        prompt as string,
        {
          model: model as string,
          sandbox: sandbox as boolean,
          yolo: yolo as boolean,
          approvalMode: approvalMode as any,
          workingDir: workingDir as string,
          includeDirectories: includeDirectories as string[],
          policy: policy as string[],
          adminPolicy: adminPolicy as string[],
          outputFormat: outputFormat as any,
          timeout: timeout as number,
        },
        onProgress
      );

      return result;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : String(error);

      if (errorMessage.includes('not found') || errorMessage.includes('command not found')) {
        return `❌ **Gemini CLI Not Found**: ${ERROR_MESSAGES.GEMINI_NOT_FOUND}

**Quick Fix:**
Please make sure the \`gemini\` CLI tool is installed and added to your system PATH.`;
      }

      if (errorMessage.includes('authentication') || errorMessage.includes('unauthorized')) {
        return `❌ **Authentication Failed**: ${ERROR_MESSAGES.AUTHENTICATION_FAILED}

Please verify your credentials or API keys configuration for the Gemini CLI.`;
      }

      if (errorMessage.includes('timeout')) {
        return `❌ **Request Timeout**: Operation took longer than expected.
Try breaking complex queries into smaller tasks or increasing the timeout setting.`;
      }

      return `❌ **Gemini Execution Error**: ${errorMessage}`;
    }
  },
};

// Expose ask-gemini as an alias tool pointing to the same implementation
export const askGeminiTool: UnifiedTool = {
  ...askAntigravityTool,
  name: 'ask-gemini',
  description: 'Alias for ask-antigravity tool.',
};
