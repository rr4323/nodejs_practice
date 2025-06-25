# 4. Building a Simple API with Node.js, Express, and TypeScript

In this section, we will build a simple RESTful API to solidify your understanding of Node.js and TypeScript. We will use the Express framework, which is the most popular web framework for Node.js.

## Project Goal

We will create a simple API with a few endpoints to manage a list of users. The API will support the following operations:

-   `GET /users`: Get a list of all users.
-   `GET /users/:id`: Get a single user by their ID.
-   `POST /users`: Create a new user.

## Steps

1.  **Project Setup**: We will set up a new Node.js project with TypeScript, similar to the previous section.
2.  **Install Dependencies**: We'll install `express` and its type definitions (`@types/express`).
3.  **Create the Express Server**: We will create a basic Express server and make it listen on a specific port.
4.  **Define Routes**: We will create routes to handle the API requests.
5.  **Run the Server**: Finally, we'll compile and run the server.

I will create all the necessary files for this project in this directory. You can then follow the instructions to run it.

## Running the API

1.  **Install dependencies**:
    ```bash
    npm install
    ```
2.  **Build the project** (compile TypeScript to JavaScript):
    ```bash
    npm run build
    ```
3.  **Start the server**:
    ```bash
    npm start
    ```

Once the server is running, you can test the endpoints using a tool like `curl` or Postman.

-   `curl http://localhost:3000/users`
-   `curl http://localhost:3000/users/1`
-   `curl -X POST -H "Content-Type: application/json" -d '{"name": "Charlie"}' http://localhost:3000/users`

---

Next, in the **Advanced Concepts** section, we will explore topics like middleware and error handling.
