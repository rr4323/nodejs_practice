# 3.1. Setting up a TypeScript Project

This guide will walk you through setting up a new Node.js project with TypeScript from scratch.

## Step 1: Initialize a Node.js Project

First, create a new directory for your project and initialize it with npm. This will create a `package.json` file.

```bash
npm init -y
```

## Step 2: Install Dependencies

Next, you need to install TypeScript and the type definitions for Node.js as development dependencies.

-   `typescript`: The TypeScript compiler.
-   `@types/node`: Provides type definitions for the Node.js API, allowing TypeScript to understand Node.js-specific objects like `require` and `process`.

```bash
npm install typescript @types/node --save-dev
```

## Step 3: Create a TypeScript Configuration File

The `tsconfig.json` file specifies the root files and the compiler options required to compile a TypeScript project. You can generate a default `tsconfig.json` file with the following command:

```bash
npx tsc --init
```

This will create a `tsconfig.json` file with many options. For a basic Node.js project, you can use a simpler configuration. I have provided a sample `tsconfig.json` in this directory.

## Step 4: Write Some TypeScript Code

Create a `src` directory and add an `index.ts` file with some TypeScript code. I have provided a sample `src/index.ts` file.

## Step 5: Configure `package.json` Scripts

Add `build` and `start` scripts to your `package.json` to compile and run your TypeScript code.

-   **build**: Compiles the TypeScript code from the `src` directory into JavaScript in a `dist` directory.
-   **start**: Runs the compiled JavaScript code from the `dist` directory.

I have provided a sample `package.json` with these scripts.

## Step 6: Compile and Run

Now you can compile your TypeScript code by running:

```bash
npm run build
```

And then run the compiled code:

```bash
npm start
```

You should see `Hello, TypeScript!` logged to the console.

---

Next, we will explore the basic types in TypeScript.
