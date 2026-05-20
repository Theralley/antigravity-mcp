// Tool Registry Index - Registers all tools
import { toolRegistry } from './registry.js';
import { askAntigravityTool, askGeminiTool } from './ask-antigravity.tool.js';
import { batchAntigravityTool, batchGeminiTool } from './batch-antigravity.tool.js';
import { pingTool, helpTool, versionTool } from './simple-tools.js';
import { brainstormTool } from './brainstorm.tool.js';
import { fetchChunkTool } from './fetch-chunk.tool.js';
import { timeoutTestTool } from './timeout-test.tool.js';

toolRegistry.push(
  askAntigravityTool,
  askGeminiTool,
  batchAntigravityTool,
  batchGeminiTool,
  pingTool,
  helpTool,
  versionTool,
  brainstormTool,
  fetchChunkTool,
  timeoutTestTool
);

export * from './registry.js';
