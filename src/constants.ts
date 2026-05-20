// Logging
export const LOG_PREFIX = '[ANTIGRAVITY-MCP]';

// Error messages
export const ERROR_MESSAGES = {
  TOOL_NOT_FOUND: 'not found in registry',
  NO_PROMPT_PROVIDED:
    "Please provide a prompt for analysis. Use @ syntax to include files (e.g., '@largefile.js explain what this does') or ask general questions",
  QUOTA_EXCEEDED: 'Rate limit exceeded',
  AUTHENTICATION_FAILED: 'Authentication failed - please check your Gemini CLI credentials or API key',
  GEMINI_NOT_FOUND: "Gemini CLI not found - please make sure 'gemini' is installed and in your PATH",
  SANDBOX_VIOLATION: 'Operation blocked by sandbox policy',
  UNSAFE_COMMAND: 'Command requires approval or elevated permissions',
} as const;

// Status messages
export const STATUS_MESSAGES = {
  SANDBOX_EXECUTING: '🔒 Executing Gemini CLI command in sandbox/auto mode...',
  GEMINI_RESPONSE: 'Antigravity response:',
  AUTHENTICATION_SUCCESS: '✅ Authentication successful',
  // Timeout prevention messages
  PROCESSING_START: '🔍 Starting analysis (may take 5-15 minutes for large codebases)',
  PROCESSING_CONTINUE: '⏳ Still processing...',
  PROCESSING_COMPLETE: '✅ Analysis completed successfully',
} as const;

// Models
export const MODELS = {
  GEMINI_2_5_PRO: 'gemini-2.5-pro',
  GEMINI_2_5_FLASH: 'gemini-2.5-flash',
  GEMINI_1_5_PRO: 'gemini-1.5-pro',
  GEMINI_1_5_FLASH: 'gemini-1.5-flash',
} as const;

// Sandbox modes
export const SANDBOX_MODES = {
  READ_ONLY: 'read-only',
  WORKSPACE_WRITE: 'workspace-write',
  DANGER_FULL_ACCESS: 'danger-full-access',
} as const;

// Approval policies / modes
export const APPROVAL_MODES = {
  DEFAULT: 'default',
  AUTO_EDIT: 'auto_edit',
  YOLO: 'yolo',
  PLAN: 'plan',
} as const;

// MCP Protocol Constants
export const PROTOCOL = {
  // Message roles
  ROLES: {
    USER: 'user',
    ASSISTANT: 'assistant',
  },
  // Content types
  CONTENT_TYPES: {
    TEXT: 'text',
  },
  // Status codes
  STATUS: {
    SUCCESS: 'success',
    ERROR: 'error',
    FAILED: 'failed',
    REPORT: 'report',
  },
  // Notification methods
  NOTIFICATIONS: {
    PROGRESS: 'notifications/progress',
  },
  // Timeout prevention
  KEEPALIVE_INTERVAL: 25000, // 25 seconds
} as const;

// CLI Constants
export const CLI = {
  // Command names
  COMMANDS: {
    GEMINI: process.env.GEMINI_PATH || 'gemini',
    ECHO: 'echo',
  },
  // Command flags
  FLAGS: {
    MODEL: '-m',
    SANDBOX: '-s',
    YOLO: '-y',
    APPROVAL_MODE: '--approval-mode',
    INCLUDE_DIRECTORIES: '--include-directories',
    POLICY: '--policy',
    ADMIN_POLICY: '--admin-policy',
    OUTPUT_FORMAT: '-o',
    VERSION: '-v',
    HELP: '-h',
    PROMPT: '-p',
  },
  // Default values
  DEFAULTS: {
    MODEL: 'default', // Fallback model used when no specific model is provided
    BOOLEAN_TRUE: 'true',
    BOOLEAN_FALSE: 'false',
  },
  // Environment variables for working directory resolution
  ENV_VARS: {
    GEMINI_MCP_CWD: 'GEMINI_MCP_CWD', // Primary: Set in MCP client configuration
    PWD: 'PWD', // Secondary: Standard Unix variable
    INIT_CWD: 'INIT_CWD', // Tertiary: Node.js initial directory
  },
} as const;

// (merged PromptArguments and ToolArguments)
export interface ToolArguments {
  prompt?: string;
  model?: string;
  sandbox?: boolean | string;
  approvalMode?: 'default' | 'auto_edit' | 'yolo' | 'plan';
  yolo?: boolean | string;
  workingDir?: string;
  includeDirectories?: string[];
  policy?: string[];
  adminPolicy?: string[];
  outputFormat?: 'text' | 'json' | 'stream-json';
  timeout?: number;
  includeThinking?: boolean;
  includeMetadata?: boolean;

  // Brainstorming tool
  methodology?: string; // Brainstorming framework to use
  domain?: string; // Domain context for specialized brainstorming
  constraints?: string; // Known limitations or requirements
  existingContext?: string; // Background information to build upon
  ideaCount?: number; // Target number of ideas to generate
  includeAnalysis?: boolean; // Include feasibility and impact analysis

  [key: string]: string | boolean | number | string[] | Record<string, any> | undefined; // Allow additional properties
}
