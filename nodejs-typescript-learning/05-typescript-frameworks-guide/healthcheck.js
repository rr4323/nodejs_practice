#!/usr/bin/env node

const http = require('http');
const { URL } = require('url');

// Default values can be overridden by environment variables
const HOST = process.env.HOST || 'localhost';
const PORT = process.env.PORT || 3000;
const TIMEOUT = process.env.HEALTHCHECK_TIMEOUT_MS || 5000; // 5 seconds default timeout
const HEALTH_ENDPOINT = process.env.HEALTH_ENDPOINT || '/health';

// Parse URL to handle different formats (e.g., http://host:port/health)
let healthUrl;
try {
  // If the health endpoint is a full URL, use it directly
  const url = new URL(HEALTH_ENDPOINT);
  healthUrl = HEALTH_ENDPOINT;
} catch (e) {
  // If not a valid URL, construct it from host and port
  healthUrl = `http://${HOST}:${PORT}${HEALTH_ENDPOINT.startsWith('/') ? '' : '/'}${HEALTH_ENDPOINT}`;
}

// Set up request timeout
const controller = new AbortController();
const timeoutId = setTimeout(() => controller.abort(), TIMEOUT);

// Request options
const options = {
  signal: controller.signal,
  timeout: TIMEOUT,
  headers: {
    'User-Agent': 'HealthCheck/1.0',
    'Accept': 'application/json',
    'Connection': 'close'
  }
};

// Make the health check request
const req = http.get(healthUrl, options, (res) => {
  clearTimeout(timeoutId);
  
  let data = '';
  res.on('data', (chunk) => {
    data += chunk;
  });

  res.on('end', () => {
    try {
      const response = JSON.parse(data);
      
      // Check if the status is 'ok' or similar
      const isHealthy = res.statusCode === 200 && 
                      (response.status === 'ok' || response.status === 'healthy' || 
                       response.status === 'up' || response.healthy === true);
      
      if (isHealthy) {
        console.log(`Health check passed: ${res.statusCode} - ${JSON.stringify(response)}`);
        process.exit(0);
      } else {
        console.error(`Health check failed with status ${res.statusCode}: ${JSON.stringify(response)}`);
        process.exit(1);
      }
    } catch (e) {
      console.error('Error parsing health check response:', e.message);
      process.exit(1);
    }
  });
});

// Handle errors
req.on('error', (e) => {
  clearTimeout(timeoutId);
  console.error(`Health check request failed: ${e.message}`);
  process.exit(1);
});

// Set a timeout for the entire request
req.setTimeout(TIMEOUT, () => {
  req.destroy(new Error(`Request timed out after ${TIMEOUT}ms`));
});

// Ensure the request is sent
req.end();
