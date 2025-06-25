# 2.4. The HTTP Module

Before diving into frameworks like Express, it's helpful to understand how to create a basic web server using Node.js's built-in `http` module. This module provides the foundation for handling HTTP requests and responses.

## Creating a Simple Web Server

The `http` module contains the `createServer` method, which takes a callback function that is executed for each incoming request. This callback receives two arguments: a `request` object and a `response` object.

-   **`request` (`http.IncomingMessage`)**: Contains information about the incoming request, such as the URL, headers, and any data sent in the request body.
-   **`response` (`http.ServerResponse`)**: Used to send a response back to the client. You can set the status code, headers, and the body of the response.

**Example: `server.js`**

```javascript
const http = require('http');

const hostname = '127.0.0.1';
const port = 3000;

const server = http.createServer((req, res) => {
  res.statusCode = 200;
  res.setHeader('Content-Type', 'text/plain');
  res.end('Hello, World!\n');
});

server.listen(port, hostname, () => {
  console.log(`Server running at http://${hostname}:${port}/`);
});
```

## Running the Example

1.  Create a file named `server.js` in this directory.
2.  Copy the code from the example above into the file.
3.  Run the server from your terminal:

    ```bash
    node server.js
    ```

4.  Open your web browser and navigate to `http://127.0.0.1:3000/`. You should see the message "Hello, World!".

---

Understanding the `http` module gives you a deeper appreciation for the abstractions and conveniences that frameworks like Express provide.
