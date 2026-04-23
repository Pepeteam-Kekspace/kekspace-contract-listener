# KekSpace Contract Listener API - Example Calls

This document provides example JSON API calls to the KekSpace Web3 listener service running on `localhost:3030`.

## Health Check Endpoint

### GET /health
Check if the API is running and get server status.

```bash
curl -X GET http://localhost:3030/health
```

**Response:**
```json
{
  "status": "OK",
  "timestamp": "2026-04-23T12:34:56.789Z",
  "uptime": 1234.567
}
```

---

## Web3Data Endpoint

### POST /Web3Data
Submit blockchain transaction data from Web3 events.

#### Example 1: Standard ERC-1155 Transfer

```bash
curl -X POST http://localhost:3030/Kekspace/Web3ItemTransfer \
  -H "Content-Type: application/json" \
  -d '{
    "block_number": 5234891,
    "tx_hash": "0x1234567890abcdef1234567890abcdef1234567890abcdef1234567890abcdef",
    "operator": "0x551982C4141144802c940bdE90C0Ac1667b018CC",
    "from": "0xAbCdEf1234567890AbCdEf1234567890AbCdEf12",
    "to": "0x9876543210FeDcBa9876543210FeDcBa98765432",
    "token_id": "1",
    "value": "100"
  }'
```

**Response:**
```json
{
  "message": "Web3ItemTransfer processed successfully",
  "data": {
    "block_number": 5234891,
    "tx_hash": "0x1234567890abcdef1234567890abcdef1234567890abcdef1234567890abcdef",
    "operator": "0x551982C4141144802c940bdE90C0Ac1667b018CC",
    "from": "0xAbCdEf1234567890AbCdEf1234567890AbCdEf12",
    "to": "0x9876543210FeDcBa9876543210FeDcBa98765432",
    "token_id": "1",
    "value": "100",
    "processed_at": "2026-04-23T12:34:56.789Z"
  }
}
```

---

#### Example 2: High-Value NFT Transfer

```bash
curl -X POST http://localhost:3030/Kekspace/Web3ItemTransfer \
  -H "Content-Type: application/json" \
  -d '{
    "block_number": 5234892,
    "tx_hash": "0xabcdef1234567890abcdef1234567890abcdef1234567890abcdef1234567890",
    "operator": "0xDeadBeefDeadBeefDeadBeefDeadBeefDeadBeef",
    "from": "0x0000000000000000000000000000000000000000",
    "to": "0x1111111111111111111111111111111111111111",
    "token_id": "42",
    "value": "1"
  }'
```

**Response:**
```json
{
  "message": "Web3ItemTransfer processed successfully",
  "data": {
    "block_number": 5234892,
    "tx_hash": "0xabcdef1234567890abcdef1234567890abcdef1234567890abcdef1234567890",
    "operator": "0xDeadBeefDeadBeefDeadBeefDeadBeefDeadBeef",
    "from": "0x0000000000000000000000000000000000000000",
    "to": "0x1111111111111111111111111111111111111111",
    "token_id": "42",
    "value": "1",
    "processed_at": "2026-04-23T12:34:57.001Z"
  }
}
```
---

## Error Handling

### Missing Required Fields

If required fields are missing, the API returns a 400 error:

```bash
curl -X POST http://localhost:3030/Kekspace/Web3ItemTransfer \
  -H "Content-Type: application/json" \
  -d '{
    "block_number": 5234891,
    "tx_hash": "0x1234567890abcdef"
  }'
```

**Response:**
```json
{
  "error": "Missing required fields",
  "missing_fields": ["operator", "from", "to", "token_id", "value"]
}
```

---

## JavaScript Example

```javascript
const axios = require('axios');

async function sendWeb3Data() {
  try {
    const response = await axios.post('http://localhost:3030/Kekspace/Web3ItemTransfer', {
      block_number: 5234891,
      tx_hash: '0x1234567890abcdef1234567890abcdef1234567890abcdef1234567890abcdef',
      operator: '0x551982C4141144802c940bdE90C0Ac1667b018CC',
      from: '0xAbCdEf1234567890AbCdEf1234567890AbCdEf12',
      to: '0x9876543210FeDcBa9876543210FeDcBa98765432',
      token_id: '1',
      value: '100'
    });

    console.log('Success:', response.data);
  } catch (error) {
    console.error('Error:', error.response.data);
  }
}

sendWeb3Data();
```

---

## Python Example

```python
import requests
import json

url = 'http://localhost:3030/Kekspace/Web3ItemTransfer'

payload = {
    'block_number': 5234891,
    'tx_hash': '0x1234567890abcdef1234567890abcdef1234567890abcdef1234567890abcdef',
    'operator': '0x551982C4141144802c940bdE90C0Ac1667b018CC',
    'from': '0xAbCdEf1234567890AbCdEf1234567890AbCdEf12',
    'to': '0x9876543210FeDcBa9876543210FeDcBa98765432',
    'token_id': '1',
    'value': '100'
}

headers = {'Content-Type': 'application/json'}

response = requests.post(url, json=payload, headers=headers)
print(json.dumps(response.json(), indent=2))
```

---

## Testing with Environment Variables

Set the custom port using the `KEKAPI_PORT` environment variable:

```bash
# Use default port 3000
node api.js

# Use custom port
KEKAPI_PORT=3030 node api.js

# Then hit the API
curl -X POST http://localhost:3030/Kekspace/Web3ItemTransfer \
  -H "Content-Type: application/json" \
  -d '{ ... }'
```
