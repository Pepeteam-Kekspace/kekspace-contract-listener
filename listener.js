const { ethers } = require('ethers');
const fs = require('fs');
const axios = require('axios');

// Contract configuration
//prod=0x551982C4141144802c940bdE90C0Ac1667b018CC
//local=0x145Ef9F6a4324A181537Dfb7074F6E4B3E19Ec70
const CONTRACT_ADDRESS = '0x551982C4141144802c940bdE90C0Ac1667b018CC';
const CONTRACT_ABI = JSON.parse(fs.readFileSync('./abi.json', 'utf8'));

// API configuration
//prod=http://localhost:3000/KekSpace/Web3ItemTransfer
//local=http://localhost:3000/Web3Data
const API_ENDPOINT = `http://localhost:${process.env.KEKAPI_PORT || 3000}/KekSpace/Web3ItemTransfer`;

const WSS_RPC_URL = 'wss://ethereum-sepolia-rpc.publicnode.com';

async function listenToTransferSingleEvents() {
    try {
        console.log('Connecting to WebSocket provider...');
        const provider = new ethers.providers.WebSocketProvider(WSS_RPC_URL);
        const contract = new ethers.Contract(CONTRACT_ADDRESS, CONTRACT_ABI, provider);
        
        console.log(`Connected to contract: ${CONTRACT_ADDRESS}`);
        console.log('Listening for TransferSingle events...\n');
        
        contract.on('TransferSingle', async (operator, from, to, id, value, event) => {
            console.log('🔄 TransferSingle Event Detected!');
            console.log('=====================================');
            console.log(`Block Number: ${event.blockNumber}`);
            console.log(`Transaction Hash: ${event.transactionHash}`);
            console.log(`Operator: ${operator}`);
            console.log(`From: ${from}`);
            console.log(`To: ${to}`);
            console.log(`Token ID: ${id.toString()}`);
            console.log(`Value: ${value.toString()}`);
            console.log(`Gas Used: ${event.gasUsed ? event.gasUsed.toString() : 'N/A'}`);
            console.log('=====================================\n');
            
            const eventData = {
                block_number: event.blockNumber.toString(),
                tx_hash: event.transactionHash,
                operator: operator,
                from: from,
                to: to,
                token_id: id.toString(),
                value: value.toString()
            };
            
            try {
                console.log('📤 Sending data to API...');
                const response = await axios.post(API_ENDPOINT, eventData, {
                    headers: {
                        'Content-Type': 'application/json'
                    }
                });
                console.log('✅ Data sent successfully:', response.status);
                console.log('Response:', response.data);
            } catch (error) {
                console.error('❌ Error sending data to API:', error.message);
                if (error.response) {
                    console.error('Response status:', error.response.status);
                    console.error('Response data:', error.response.data);
                }
                
                const logEntry = {
                    timestamp: new Date().toISOString(),
                    error_message: error.message,
                    error_type: error.name || 'Unknown',
                    post_body: eventData,
                    response_status: error.response ? error.response.status : null,
                    response_data: error.response ? error.response.data : null
                };
                
                const logLine = `${JSON.stringify(logEntry)}\n`;
                
                try {
                    fs.appendFileSync('log.txt', logLine);
                    console.log('📝 Error logged to log.txt');
                } catch (logError) {
                    console.error('❌ Failed to write to log.txt:', logError.message);
                }
            }
            console.log('=====================================\n');
        });
        
        provider.on('error', (error) => {
            console.error('WebSocket error:', error);
        });
        
        process.on('SIGINT', () => {
            console.log('\nShutting down gracefully...');
            provider.removeAllListeners();
            process.exit(0);
        });
        
    } catch (error) {
        console.error('Error setting up event listener:', error);
        process.exit(1);
    }
}

listenToTransferSingleEvents(); 