# 6. Project: Building a Structured API

Welcome to the final project! In this section, we will build on everything we've learned to create a more structured and maintainable API. This project will demonstrate a common application architecture that separates concerns into different layers.

## Project Structure

We will organize our code into the following directories:

-   **`src/`**: The root directory for our source code.
    -   **`routes/`**: Defines the API routes (e.g., `/users`). It maps HTTP endpoints to controller functions.
    -   **`controllers/`**: Handles the incoming requests, validates data, and calls the appropriate service functions. It acts as the bridge between the routes and the business logic.
    -   **`services/`**: Contains the business logic of the application. It interacts with the data layer (in our case, a simple in-memory store).
    -   **`index.ts`**: The main entry point of our application, where we set up the Express server and wire everything together.

This separation of concerns makes the application easier to test, debug, and scale.

## API Endpoints

We will implement the same user management API as before, but with a much cleaner structure:

-   `GET /api/users`
-   `GET /api/users/:id`
-   `POST /api/users`
-   `PUT /api/users/:id`
-   `DELETE /api/users/:id`

## Running the Project

All the necessary files are provided in this directory.

1.  **Install dependencies**:
    ```bash
    npm install
    ```
2.  **Build and start the server**:
    ```bash
    npm run build && npm start
    ```

Once running, you can test the API using `curl` or Postman.

## What's Next?

Congratulations on completing this learning path! You now have a strong foundation in building backend applications with Node.js and TypeScript.

From here, you can explore:
-   Connecting to a real database (like PostgreSQL with Prisma, or MongoDB with Mongoose).
-   Adding authentication and authorization (e.g., with JSON Web Tokens).
-   Writing automated tests (e.g., with Jest and Supertest).
-   Deploying your application to the cloud.

Happy coding!
