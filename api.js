const express = require('express');
const app = express();
const PORT = process.env.PORT || 3000;

// Middleware to parse JSON requests
app.use(express.json());

// Web3Data endpoint
app.post('/Web3Data', (req, res) => {
    try {
        const {
            block_number,
            tx_hash,
            operator,
            from,
            to,
            token_id,
            value
        } = req.body;

        // Validate required fields
        const requiredFields = ['block_number', 'tx_hash', 'operator', 'from', 'to', 'token_id', 'value'];
        const missingFields = requiredFields.filter(field => !req.body[field]);
        
        if (missingFields.length > 0) {
            return res.status(400).json({
                error: 'Missing required fields',
                missing_fields: missingFields
            });
        }

        // Log the received data
        console.log('🔄 Web3Data Received!');
        console.log('=====================================');
        console.log(`Block Number: ${block_number}`);
        console.log(`Transaction Hash: ${tx_hash}`);
        console.log(`Operator: ${operator}`);
        console.log(`From: ${from}`);
        console.log(`To: ${to}`);
        console.log(`Token ID: ${token_id}`);
        console.log(`Value: ${value}`);
        console.log('=====================================\n');

        const processedData = {
            block_number,
            tx_hash,
            operator,
            from,
            to,
            token_id,
            value,
            processed_at: new Date().toISOString()
        };

        // Send success response
        res.status(200).json({
            message: 'Web3Data processed successfully',
            data: processedData
        });

    } catch (error) {
        console.error('Error processing Web3Data:', error);
        res.status(500).json({
            error: 'Internal server error',
            message: error.message
        });
    }
});

// Health check endpoint
app.get('/health', (req, res) => {
    res.status(200).json({
        status: 'OK',
        timestamp: new Date().toISOString(),
        uptime: process.uptime()
    });
});

// Start the server
app.listen(PORT, () => {
    console.log(`🚀 Express API server running on port ${PORT}`);
    console.log(`📡 Web3Data endpoint: http://localhost:${PORT}/Web3Data`);
    console.log(`🔍 Health check: http://localhost:${PORT}/health`);
});

module.exports = app;
