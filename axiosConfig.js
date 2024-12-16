const axios = require('axios');

// Create an axios instance with default headers
const axiosInstance = axios.create({
    baseURL: 'https://fortniteapi.io/', // Base URL for all requests
    headers: {
        Authorization: 'fda3776d-9dfa-4545-9b82-48111d69de8a' // Auth key for all requests
    }
});

module.exports = axiosInstance;