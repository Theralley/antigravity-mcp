import { spawn } from 'child_process';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const projectRoot = join(__dirname, '..');

console.log('🚀 Starting MCP E2E Test Client...');
console.log(`Working directory: ${projectRoot}`);

// Spawn the MCP server process
const server = spawn('node', ['dist/index.js'], { cwd: projectRoot });

let buffer = '';
let step = 'initialize';

server.stdout.on('data', (data) => {
  buffer += data.toString();
  
  // MCP protocol uses newline-separated JSON messages
  const lines = buffer.split('\n');
  for (let i = 0; i < lines.length - 1; i++) {
    const line = lines[i].trim();
    if (!line) continue;
    
    try {
      const response = JSON.parse(line);
      console.log(`\n📥 Received JSON-RPC message (ID: ${response.id || 'none'}, Method/Result: ${response.method || 'result'}):`);
      console.log(JSON.stringify(response, null, 2));

      // Handle message based on current step
      if (step === 'initialize' && response.id === 1) {
        console.log('\n✅ Server initialized successfully!');
        
        // Send initialized notification
        console.log('📤 Sending initialized notification...');
        const initializedNotification = {
          jsonrpc: '2.0',
          method: 'notifications/initialized'
        };
        server.stdin.write(JSON.stringify(initializedNotification) + '\n');
        
        // Transition to listing tools
        step = 'list_tools';
        console.log('📤 Sending tools/list request (ID: 2)...');
        const listRequest = {
          jsonrpc: '2.0',
          id: 2,
          method: 'tools/list',
          params: {}
        };
        server.stdin.write(JSON.stringify(listRequest) + '\n');
      } 
      else if (step === 'list_tools' && response.id === 2) {
        console.log('\n✅ Tools listed successfully!');
        const tools = response.result?.tools || [];
        console.log(`Found ${tools.length} registered tools:`);
        tools.forEach(t => console.log(` - ${t.name}: ${t.description}`));

        // Verify ask-antigravity exists
        const hasTool = tools.some(t => t.name === 'ask-antigravity');
        if (!hasTool) {
          console.error('❌ Error: ask-antigravity tool not found in list!');
          process.exit(1);
        }

        // Transition to calling tool
        step = 'call_tool';
        console.log('\n📤 Sending tools/call request for ask-antigravity (ID: 3)...');
        const callRequest = {
          jsonrpc: '2.0',
          id: 3,
          method: 'tools/call',
          params: {
            name: 'ask-antigravity',
            arguments: {
              prompt: "Hello, say 'E2E verification success' and nothing else."
            }
          }
        };
        server.stdin.write(JSON.stringify(callRequest) + '\n');
      }
      else if (step === 'call_tool' && response.id === 3) {
        console.log('\n✅ Tool call returned result!');
        const content = response.result?.content?.[0]?.text;
        console.log(`Response content:\n"${content}"`);
        
        if (content && content.includes('E2E verification success')) {
          console.log('\n🎉 E2E TEST PASSED SUCCESSFULLY!');
          server.kill();
          process.exit(0);
        } else {
          console.error('\n❌ E2E TEST FAILED: Response did not match expected output.');
          server.kill();
          process.exit(1);
        }
      }
    } catch (e) {
      console.error(`Failed to parse server line: ${line}`, e);
    }
  }
  buffer = lines[lines.length - 1];
});

server.stderr.on('data', (data) => {
  console.log(`[Server Log] ${data.toString().trim()}`);
});

server.on('close', (code) => {
  console.log(`\nServer process exited with code ${code}`);
});

// Start the handshake by sending initialize request
console.log('📤 Sending initialize request (ID: 1)...');
const initializeRequest = {
  jsonrpc: '2.0',
  id: 1,
  method: 'initialize',
  params: {
    protocolVersion: '2024-11-05',
    capabilities: {},
    clientInfo: {
      name: 'e2e-test-client',
      version: '1.0.0'
    }
  }
};
server.stdin.write(JSON.stringify(initializeRequest) + '\n');

// Timeout safety after 30 seconds
setTimeout(() => {
  console.error('\n❌ E2E Test timed out after 30s!');
  server.kill();
  process.exit(1);
}, 30000);
