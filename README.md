# Kekspace Contract API - Contract Event Listener

See install.txt for quick setup instructions.

This project listens to smart contract events using ethers.js v5.

## Setup

Strongly recommended to run this under a separate user (useradd -m -s /bin/bash myuser)

1. **Install dependencies:**
   ```bash
   npm install
   ```

2. **Contract Configuration:**
   - Contract Address: `0x551982C4141144802c940bdE90C0Ac1667b018CC`
   - Network: Sepolia Testnet
   - WebSocket RPC: `wss://sepolia.gateway.tenderly.co`

## Usage

### Listen to TransferSingle Events

Run the event listener to monitor TransferSingle events in real-time:

```bash
npm run listen
```

Start the API endpoint 
```bash
npm run listen
```
Or directly:

```bash
node listener.js
```

### Running with PM2

The listener is configured to run as a managed process using PM2. PM2 keeps the listener running continuously, automatically restarts it if it crashes, and ensures it starts on system boot.

**What PM2 does here:**

PM2 runs `listener.js` as a background daemon. If the WebSocket connection drops or the process crashes, PM2 restarts it automatically. This is critical for a real-time event listener—any downtime means missed events. PM2 also handles log rotation and lets you monitor the process without keeping a terminal session open.

The listener is configured to start automatically on system boot via systemd. After a server restart, PM2 will automatically restore and start the listener process.

**Useful PM2 commands:**

```bash
# Start the listener
pm2 start listener.js --name listener

# Start the endpoint API (also see below)
pm2 start api.js --name kekapi

# Check status
pm2 status

# View logs (real-time)
pm2 logs listener

# View last 100 log lines
pm2 logs listener --lines 100

# Stop the listener
pm2 stop listener

# Restart the listener
pm2 restart listener

# Monitor CPU/memory usage
pm2 monit

# Remove from PM2 (stops and deletes)
pm2 delete listener

# Save current process list (needed after adding/removing processes)
pm2 save

# Stop pm2 and all processes
pm2 kill
```

**Note:** If you need to reconfigure the startup script, run `pm2 startup systemd` and execute the generated command with sudo.

### API Server

The `api.js` file runs an Express HTTP server that receives TransferSingle event data from the listener. Start it before running the listener:

```bash
node api.js
```

The server runs on port 3000 by default (configurable via `PORT` environment variable). It exposes two endpoints:

- `POST /Web3Data` - Receives TransferSingle event payloads from `listener.js`. Validates required fields (block_number, tx_hash, operator, from, to, token_id, value) and returns a processed response with timestamp.
- `GET /health` - Health check endpoint that returns server status and uptime.

When `listener.js` detects a TransferSingle event, it sends a POST request to the API endpoint with the event data. The API validates the payload structure and responds with a success confirmation. If the API is unavailable or returns an error, the listener logs the failure to `log.txt` but continues monitoring for new events.

**Note:** The API server must be running for `listener.js` to successfully process events. If the API is down, events will still be detected but won't be persisted—they'll only appear in console logs and error logs.

### What the listener does:

- Connects to the Sepolia testnet via WebSocket
- Creates a contract instance using the provided ABI
- Listens for `TransferSingle` events from the ERC-1155 contract
- Logs detailed event information including:
  - Block number
  - Transaction hash
  - Operator address
  - From address
  - To address
  - Token ID
  - Transfer value
  - Gas used

### Example Output:

```
🔄 TransferSingle Event Detected!
=====================================
Block Number: 4521234
Transaction Hash: 0x1234567890abcdef...
Operator: 0x1234567890123456789012345678901234567890
From: 0x0000000000000000000000000000000000000000
To: 0x9876543210987654321098765432109876543210
Token ID: 1
Value: 100
Gas Used: 21000
=====================================
```

## Files

- `listener.js` - Main script that listens for TransferSingle events
- `api.js` - Express API server that receives and processes event data
- `abi.json` - Contract ABI for the ERC-1155 token contract
- `package.json` - Project dependencies and scripts
- `log.txt` - Error log file

## Critical: Live Event Tracking

The `listener.js` script is responsible for capturing all live TransferSingle events from the contract. This is a real-time monitoring system that operates on a continuous basis.

**Important:** If the script is not running, TransferSingle events occurring during downtime will not be recorded. The listener only captures events that occur while it is actively running. There is no historical event replay mechanism—events are processed in real-time as they are emitted on-chain.

## Notes

- The listener runs continuously as a PM2-managed process
- Requires a stable internet connection for WebSocket connectivity
- The script handles connection errors and graceful shutdowns
- Events are logged to the console in real-time
- Failed API calls are logged to `log.txt` for debugging
- PM2 automatically restarts the listener if it crashes or the connection drops

## Troubleshooting

If you encounter connection issues:

1. Verify the WebSocket URL is accessible
2. Check your internet connection
3. Ensure the contract address is correct
4. Make sure the ABI file is properly formatted

To stop the listener when running with PM2, use `pm2 stop listener`. If running directly with `node listener.js`, press `Ctrl+C` in the terminal. 
