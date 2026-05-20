import { executeCommandDetailed, RetryOptions } from './commandExecutor.js';
import { Logger } from './logger.js';
import { CLI } from '../constants.js';
import { resolveWorkingDirectory } from './workingDirResolver.js';

export interface GeminiExecOptions {
  readonly model?: string;
  readonly sandbox?: boolean;
  readonly approvalMode?: 'default' | 'auto_edit' | 'yolo' | 'plan';
  readonly yolo?: boolean;
  readonly workingDir?: string;
  readonly includeDirectories?: string[];
  readonly policy?: string[];
  readonly adminPolicy?: string[];
  readonly outputFormat?: 'text' | 'json' | 'stream-json';
  readonly timeoutMs?: number;
  readonly timeout?: number;
  readonly maxOutputBytes?: number;
  readonly retry?: RetryOptions;
}

/**
 * Execute Gemini CLI with prompt, options, and streaming output support
 */
export async function executeGeminiCLI(
  prompt: string,
  options?: GeminiExecOptions,
  onProgress?: (newOutput: string) => void
): Promise<string> {
  const args: string[] = [];

  // Build command arguments
  // Always run in YOLO mode (-y) by default to prevent hangs in non-interactive MCP sessions
  if (options?.yolo !== false) {
    args.push(CLI.FLAGS.YOLO);
  }

  if (options?.sandbox) {
    args.push(CLI.FLAGS.SANDBOX);
  }

  if (options?.approvalMode) {
    args.push(CLI.FLAGS.APPROVAL_MODE, options.approvalMode);
  }

  if (options?.model) {
    args.push(CLI.FLAGS.MODEL, options.model);
  }

  if (options?.outputFormat) {
    args.push(CLI.FLAGS.OUTPUT_FORMAT, options.outputFormat);
  }

  if (options?.includeDirectories && Array.isArray(options.includeDirectories)) {
    for (const dir of options.includeDirectories) {
      args.push(CLI.FLAGS.INCLUDE_DIRECTORIES, dir);
    }
  }

  if (options?.policy && Array.isArray(options.policy)) {
    for (const pol of options.policy) {
      args.push(CLI.FLAGS.POLICY, pol);
    }
  }

  if (options?.adminPolicy && Array.isArray(options.adminPolicy)) {
    for (const pol of options.adminPolicy) {
      args.push(CLI.FLAGS.ADMIN_POLICY, pol);
    }
  }

  // Headless mode prompt flag
  args.push(CLI.FLAGS.PROMPT, prompt);

  // Resolve working directory
  const resolvedWorkingDir = resolveWorkingDirectory({
    workingDir: options?.workingDir,
    prompt: prompt,
  });

  try {
    const timeoutMs = options?.timeout || options?.timeoutMs || 600000; // 10 minutes default

    const result = await executeCommandDetailed(CLI.COMMANDS.GEMINI, args, {
      onProgress,
      timeoutMs,
      maxOutputBytes: options?.maxOutputBytes,
      retry: options?.retry,
      cwd: resolvedWorkingDir,
    });

    if (!result.ok) {
      const errorMessage = result.stderr || 'Unknown error';

      if (errorMessage.includes('command not found') || errorMessage.includes('not found')) {
        throw new Error('Gemini CLI not found. Please verify "gemini" is installed globally.');
      }

      throw new Error(`Gemini CLI failed: ${errorMessage}`);
    }

    return result.stdout;
  } catch (error) {
    Logger.error('Gemini execution failed:', error);
    throw error;
  }
}

/**
 * High-level executeGemini function (alias for executeGeminiCLI)
 */
export async function executeGemini(
  prompt: string,
  options?: GeminiExecOptions & { [key: string]: any },
  onProgress?: (newOutput: string) => void
): Promise<string> {
  return executeGeminiCLI(prompt, options, onProgress);
}
