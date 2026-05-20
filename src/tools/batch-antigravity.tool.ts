import { z } from 'zod';
import { UnifiedTool } from './registry.js';
import { executeGemini } from '../utils/geminiExecutor.js';
import { MODELS } from '../constants.js';

// Define task type for batch operations
const batchTaskSchema = z.object({
  task: z.string().describe('Atomic task description'),
  target: z.string().optional().describe('Target files/directories (use @ syntax)'),
  priority: z.enum(['high', 'normal', 'low']).default('normal').describe('Task priority'),
});

const batchAntigravityArgsSchema = z.object({
  tasks: z.array(batchTaskSchema).min(1).describe('Array of atomic tasks to delegate to Gemini'),
  model: z
    .string()
    .optional()
    .describe(`Model to use: ${Object.values(MODELS).join(', ')}`),
  sandbox: z
    .boolean()
    .optional()
    .describe(`Run in sandbox mode`),
  yolo: z
    .boolean()
    .optional()
    .describe('Automatically accept all actions'),
  approvalMode: z
    .enum(['default', 'auto_edit', 'yolo', 'plan'])
    .optional()
    .describe('Set approval mode'),
  parallel: z.boolean().default(false).describe('Execute tasks in parallel (experimental)'),
  stopOnError: z.boolean().default(true).describe('Stop execution if any task fails'),
  timeout: z.number().optional().describe('Maximum execution time per task in milliseconds'),
  workingDir: z.string().optional().describe('Working directory for execution'),
});

export const batchAntigravityTool: UnifiedTool = {
  name: 'batch-antigravity',
  description:
    'Delegate multiple atomic tasks to Gemini/Antigravity for batch processing. Ideal for repetitive operations and mass refactoring.',
  zodSchema: batchAntigravityArgsSchema,
  prompt: {
    description: 'Execute multiple atomic Gemini/Antigravity tasks in batch mode',
  },
  category: 'codex',
  execute: async (args, onProgress) => {
    const {
      tasks,
      model,
      sandbox,
      yolo,
      approvalMode,
      parallel,
      stopOnError,
      timeout,
      workingDir,
    } = args;
    const taskList = tasks as Array<{
      task: string;
      target?: string;
      priority: string;
    }>;

    if (!taskList || taskList.length === 0) {
      throw new Error('No tasks provided for batch execution');
    }

    const results: Array<{
      task: string;
      status: 'success' | 'failed' | 'skipped';
      output?: string;
      error?: string;
    }> = [];
    let failedCount = 0;
    let successCount = 0;

    // Sort tasks by priority
    const sortedTasks = [...taskList].sort((a, b) => {
      const priorityOrder = { high: 0, normal: 1, low: 2 };
      return (
        priorityOrder[a.priority as keyof typeof priorityOrder] -
        priorityOrder[b.priority as keyof typeof priorityOrder]
      );
    });

    if (onProgress) {
      onProgress(`🚀 Starting batch execution of ${sortedTasks.length} tasks...`);
    }

    // Execute tasks sequentially
    for (let i = 0; i < sortedTasks.length; i++) {
      const task = sortedTasks[i];
      const taskPrompt = task.target ? `${task.task} in ${task.target}` : task.task;

      if (onProgress) {
        onProgress(`\n[${i + 1}/${sortedTasks.length}] Executing: ${taskPrompt}`);
      }

      // Skip remaining tasks if stopOnError is true and we have failures
      if (stopOnError && failedCount > 0) {
        results.push({
          task: taskPrompt,
          status: 'skipped',
          error: 'Skipped due to previous failure',
        });
        continue;
      }

      try {
        const result = await executeGemini(
          taskPrompt,
          {
            model: model as string,
            sandbox: sandbox as boolean,
            yolo: yolo as boolean,
            approvalMode: approvalMode as any,
            timeout: timeout as number,
            workingDir: workingDir as string,
          },
          undefined // No progress for individual tasks to keep output clean
        );

        results.push({
          task: taskPrompt,
          status: 'success',
          output: result.substring(0, 500), // Truncate for summary
        });
        successCount++;

        if (onProgress) {
          onProgress(`✅ Completed: ${task.task}`);
        }
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : String(error);
        results.push({
          task: taskPrompt,
          status: 'failed',
          error: errorMessage,
        });
        failedCount++;

        if (onProgress) {
          onProgress(`❌ Failed: ${task.task} - ${errorMessage}`);
        }
      }
    }

    // Generate summary report
    let report = `\n📊 **Batch Execution Summary**\n`;
    report += `\n- Total tasks: ${sortedTasks.length}`;
    report += `\n- Successful: ${successCount} ✅`;
    report += `\n- Failed: ${failedCount} ❌`;
    report += `\n- Skipped: ${sortedTasks.length - successCount - failedCount} ⏭️`;

    report += `\n\n**Task Results:**\n`;
    for (const result of results) {
      const icon = result.status === 'success' ? '✅' : result.status === 'failed' ? '❌' : '⏭️';
      report += `\n${icon} **${result.task}**`;
      if (result.status === 'success' && result.output) {
        report += `\n   Output: ${result.output.substring(0, 100)}...`;
      } else if (result.error) {
        report += `\n   Error: ${result.error}`;
      }
    }

    // If all tasks failed, throw an error
    if (failedCount === sortedTasks.length) {
      throw new Error(`All ${failedCount} tasks failed. See report above for details.`);
    }

    return report;
  },
};

// Expose batch-gemini as an alias tool pointing to the same implementation
export const batchGeminiTool: UnifiedTool = {
  ...batchAntigravityTool,
  name: 'batch-gemini',
  description: 'Alias for batch-antigravity tool.',
};
