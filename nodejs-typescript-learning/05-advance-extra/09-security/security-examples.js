const crypto = require('crypto');
const bcrypt = require('bcrypt');
const helmet = require('helmet');
const express = require('express');
const rateLimit = require('express-rate-limit');
const { body, validationResult } = require('express-validator');
const { exec } = require('child_process');
const util = require('util');
const execPromise = util.promisify(exec);

console.log('=== Security Best Practices Examples ===\n');

// 1. Hashing passwords with bcrypt
async function hashPasswordExample() {
  console.log('1. Password Hashing with bcrypt:');
  const password = 'mySecurePassword123';
  
  try {
    // Generate a salt
    const saltRounds = 10;
    const salt = await bcrypt.genSalt(saltRounds);
    
    // Hash the password
    const hash = await bcrypt.hash(password, salt);
    console.log('Hashed password:', hash);
    
    // Verify password
    const isMatch = await bcrypt.compare(password, hash);
    console.log('Password matches hash:', isMatch);
    
    const isWrongMatch = await bcrypt.compare('wrongPassword', hash);
    console.log('Wrong password matches hash:', isWrongMatch);
  } catch (err) {
    console.error('Error hashing password:', err);
  }
}

// 2. Encryption/Decryption
function encryptionExample() {
  console.log('\n2. Encryption/Decryption:');
  
  // Generate a secure key and IV
  const algorithm = 'aes-256-cbc';
  const key = crypto.randomBytes(32); // 256 bits
  const iv = crypto.randomBytes(16);   // 128 bits
  
  function encrypt(text) {
    const cipher = crypto.createCipheriv(algorithm, key, iv);
    let encrypted = cipher.update(text, 'utf8', 'hex');
    encrypted += cipher.final('hex');
    return { iv: iv.toString('hex'), encryptedData: encrypted };
  }
  
  function decrypt(encrypted) {
    const decipher = crypto.createDecipheriv(
      algorithm, 
      Buffer.from(key), 
      Buffer.from(encrypted.iv, 'hex')
    );
    let decrypted = decipher.update(encrypted.encryptedData, 'hex', 'utf8');
    decrypted += decipher.final('utf8');
    return decrypted;
  }
  
  const secretMessage = 'This is a secret message';
  console.log('Original:', secretMessage);
  
  const encrypted = encrypt(secretMessage);
  console.log('Encrypted:', encrypted.encryptedData);
  
  const decrypted = decrypt(encrypted);
  console.log('Decrypted:', decrypted);
}

// 3. Secure HTTP Headers with Helmet
function secureHeadersExample() {
  console.log('\n3. Secure HTTP Headers with Helmet:');
  const app = express();
  
  // Use Helmet to set various HTTP headers for security
  app.use(helmet());
  
  // Rate limiting
  const limiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 100 // limit each IP to 100 requests per windowMs
  });
  app.use(limiter);
  
  // Input validation
  app.post('/user', 
    [
      body('username').isEmail(),
      body('password').isLength({ min: 5 })
    ],
    (req, res) => {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
      }
      res.json({ message: 'User created successfully' });
    }
  );
  
  console.log('  - Helmet middleware added for security headers');
  console.log('  - Rate limiting enabled (100 requests per 15 minutes)');
  console.log('  - Input validation middleware added');
  
  return app;
}

// 4. Secure File Operations
async function secureFileOperations() {
  console.log('\n4. Secure File Operations:');
  const fs = require('fs').promises;
  const path = require('path');
  
  try {
    // Always resolve paths to prevent directory traversal
    const safePath = path.resolve('safe-directory', 'file.txt');
    
    // Validate the resolved path is within the intended directory
    if (!safePath.startsWith(path.resolve('safe-directory'))) {
      throw new Error('Invalid path');
    }
    
    // Write file with secure permissions (read/write for owner, read for others)
    await fs.writeFile(safePath, 'Secure content', { mode: 0o644 });
    console.log('  - File written with secure permissions');
    
    // Read file
    const content = await fs.readFile(safePath, 'utf8');
    console.log('  - File content read successfully');
    
  } catch (err) {
    console.error('  - File operation error:', err.message);
  }
}

// 5. Secure Child Processes
async function secureChildProcess() {
  console.log('\n5. Secure Child Process Execution:');
  
  // UNSAFE: Directly using user input in exec
  const userInput = 'example.com; rm -rf /';
  
  try {
    // SAFE: Using exec with proper escaping
    const { stdout } = await execPromise(`ping -c 1 ${userInput.replace(/[^a-zA-Z0-9.-]/g, '')}`);
    console.log('  - Command executed safely');
  } catch (err) {
    console.error('  - Command execution failed:', err.message);
  }
}

// 6. Environment Variables Security
function environmentSecurity() {
  console.log('\n6. Environment Variables Security:');
  
  // Never commit .env files
  // Use dotenv-safe or similar to require all variables to be defined
  require('dotenv-safe').config();
  
  // Access environment variables
  console.log('  - Environment:', process.env.NODE_ENV || 'development');
  
  // Sensitive data should never be logged
  if (process.env.API_KEY) {
    console.log('  - API Key:', '**********');
  }
}

// Run all examples
async function runExamples() {
  await hashPasswordExample();
  encryptionExample();
  secureHeadersExample();
  await secureFileOperations();
  await secureChildProcess();
  environmentSecurity();
  
  console.log('\n=== Security Examples Complete ===');
  console.log('\nAdditional Security Tips:');
  console.log('1. Always validate and sanitize user input');
  console.log('2. Use HTTPS in production');
  console.log('3. Keep dependencies updated');
  console.log('4. Implement proper authentication and authorization');
  console.log('5. Use CSRF protection for web forms');
  console.log('6. Set secure cookie flags (HttpOnly, Secure, SameSite)');
  console.log('7. Implement proper CORS policies');
  console.log('8. Use security headers (configured via helmet)');
  console.log('9. Regular security audits and dependency scanning');
  console.log('10. Follow the principle of least privilege');
}

runExamples().catch(console.error);
