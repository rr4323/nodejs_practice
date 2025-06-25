# 12. TypeScript Configuration

This section covers the TypeScript compiler configuration options, project references, and best practices for setting up TypeScript projects.

## Table of Contents
- [tsconfig.json Overview](#tsconfigjson-overview)
- [Compiler Options](#compiler-options)
- [Project References](#project-references)
- [Type Acquisition](#type-acquisition)
- [Build Configuration](#build-configuration)
- [Module Resolution](#module-resolution)
- [Type Checking](#type-checking)
- [Source Maps](#source-maps)
- [Key Takeaways](#key-takeaways)
- [Exercises](#exercises)

## tsconfig.json Overview

The `tsconfig.json` file specifies the root files and compiler options required to compile a TypeScript project.

### Basic tsconfig.json

```json
{
  "compilerOptions": {
    /* Base Options: */
    "target": "es6",
    "module": "commonjs",
    "strict": true,
    "esModuleInterop": true,
    "skipLibCheck": true,
    "forceConsistentCasingInFileNames": true,
    
    /* Additional Checks */
    "noUnusedLocals": true,
    "noUnusedParameters": true,
    "noImplicitReturns": true,
    "noFallthroughCasesInSwitch": true,
    
    /* Module Resolution Options */
    "moduleResolution": "node",
    "baseUrl": ".",
    "paths": {
      "@app/*": ["src/*"]
    },
    
    /* Emit Options */
    "outDir": "./dist",
    "rootDir": "./src",
    
    /* Source Map Options */
    "sourceMap": true,
    "inlineSources": true,
    "inlineSourceMap": false,
    "mapRoot": "./",
    
    /* Experimental Options */
    "experimentalDecorators": true,
    "emitDecoratorMetadata": true
  },
  "include": ["src/**/*"],
  "exclude": ["node_modules", "**/*.spec.ts"]
}
```

## Compiler Options

### Core Options

| Option | Description | Default |
|--------|-------------|---------|
| `target` | Specify ECMAScript target version | `es3` |
| `module` | Specify module code generation | `commonjs` (tsc) or `esnext` (tsc with `module: nodenext` or `node16`) |
| `strict` | Enable all strict type-checking options | `false` |
| `esModuleInterop` | Emit additional JavaScript to ease support for importing CommonJS modules | `false` |
| `skipLibCheck` | Skip type checking of declaration files | `false` |

### Module Resolution

| Option | Description | Default |
|--------|-------------|---------|
| `moduleResolution` | Determine how modules get resolved | `classic` (tsc) or `node` (tsc with `module: commonjs`) |
| `baseUrl` | Base directory to resolve non-relative module names | |
| `paths` | A series of entries which re-map imports to lookup locations relative to the `baseUrl` | |
| `rootDirs` | List of root folders whose combined content represents the structure of the project at runtime | |

### Emit Options

| Option | Description | Default |
|--------|-------------|---------|
| `outDir` | Redirect output structure to the directory | |
| `rootDir` | Specify the root directory of input files | Computed from the list of input files |
| `outFile` | Concatenate and emit output to single file | |
| `removeComments` | Do not emit comments to output | `false` |
| `noEmit` | Do not emit outputs | `false` |

### Type Checking

| Option | Description | Default |
|--------|-------------|---------|
| `noImplicitAny` | Raise error on expressions and declarations with an implied `any` type | `false` (unless `strict`) |
| `strictNullChecks` | Enable strict null checks | `false` (unless `strict`) |
| `strictFunctionTypes` | Enable strict checking of function types | `false` (unless `strict`) |
| `strictBindCallApply` | Enable strict `bind`, `call`, and `apply` methods on functions | `false` (unless `strict`) |
| `strictPropertyInitialization` | Enable strict checking of property initialization in classes | `false` (unless `strict`) |
| `noImplicitThis` | Raise error on `this` expressions with an implied `any` type | `false` (unless `strict`) |
| `alwaysStrict` | Parse in strict mode and emit "use strict" for each source file | `false` |

## Project References

Project references allow TypeScript projects to depend on other TypeScript projects by referencing their `tsconfig.json` files.

### Example Project Structure

```
my-project/
├── src/
│   ├── core/
│   │   ├── index.ts
│   │   └── tsconfig.json
│   ├── app/
│   │   ├── index.ts
│   │   └── tsconfig.json
│   └── tsconfig.base.json
├── test/
│   └── tsconfig.json
└── tsconfig.json
```

### Root tsconfig.json

```json
{
  "files": [],
  "references": [
    { "path": "./src/core" },
    { "path": "./src/app" },
    { "path": "./test" }
  ]
}
```

### Core Project (src/core/tsconfig.json)

```json
{
  "extends": "../../tsconfig.base.json",
  "compilerOptions": {
    "composite": true,
    "outDir": "../../dist/core",
    "rootDir": "."
  },
  "include": ["**/*.ts"]
}
```

### App Project (src/app/tsconfig.json)

```json
{
  "extends": "../../tsconfig.base.json",
  "compilerOptions": {
    "composite": true,
    "outDir": "../../dist/app",
    "rootDir": "."
  },
  "references": [
    { "path": "../core" }
  ],
  "include": ["**/*.ts"]
}
```

### Building with Project References

```bash
# Build all projects
tsc -b

# Build a specific project and its dependencies
tsc -b src/app

# Build in watch mode
tsc -b -w

# Clean the outputs of a project
tsc -b --clean src/app
```

## Type Acquisition

TypeScript can automatically install type definitions for JavaScript libraries using `@types` packages.

### types and typeRoots

```json
{
  "compilerOptions": {
    // Specify type package names to be included without being referenced in a source file
    "types": ["node", "jest", "express"],
    
    // List of folders to include type definitions from
    "typeRoots": [
      "./node_modules/@types",
      "./custom_types"
    ]
  }
}
```

### Type Acquisition for JavaScript Projects

For JavaScript projects, you can enable type acquisition in `jsconfig.json`:

```json
{
  "typeAcquisition": {
    "enable": true,
    "include": ["lodash"],
    "exclude": ["jquery"]
  }
}
```

## Build Configuration

### Incremental Builds

```json
{
  "compilerOptions": {
    "incremental": true,
    "tsBuildInfoFile": "./buildcache"
  }
}
```

### Build Mode

```bash
# Build with specific tsconfig
# (useful for different environments like development, production, test)
tsc -p tsconfig.prod.json

# Build with specific compiler options
tsc --target es2020 --module commonjs
```

## Module Resolution

### Classic vs Node

- **Classic**: Used when `module` is not `commonjs` or `es2015`/`esnext`
- **Node**: Follows Node.js module resolution (default for `commonjs`)
- **Node16**/**NodeNext**: For Node.js ESM support

### Path Mapping

```json
{
  "compilerOptions": {
    "baseUrl": ".",
    "paths": {
      "@app/*": ["src/*"],
      "@components/*": ["src/components/*"],
      "@utils/*": ["src/utils/*"]
    }
  }
}
```

## Type Checking

### Strict Mode Flags

```json
{
  "compilerOptions": {
    /* Strict Type-Checking Options */
    "strict": true,  /* Enable all strict type-checking options. */
    "noImplicitAny": true,  /* Raise error on expressions and declarations with an implied 'any' type. */
    "strictNullChecks": true,  /* Enable strict null checks. */
    "strictFunctionTypes": true,  /* Enable strict checking of function types. */
    "strictBindCallApply": true,  /* Enable strict 'bind', 'call', and 'apply' methods on functions. */
    "strictPropertyInitialization": true,  /* Enable strict checking of property initialization in classes. */
    "noImplicitThis": true,  /* Raise error on 'this' expressions with an implied 'any' type. */
    "alwaysStrict": true,  /* Parse in strict mode and emit "use strict" for each source file. */
    
    /* Additional Checks */
    "noUnusedLocals": true,  /* Report errors on unused locals. */
    "noUnusedParameters": true,  /* Report errors on unused parameters. */
    "noImplicitReturns": true,  /* Report error when not all code paths in function return a value. */
    "noFallthroughCasesInSwitch": true,  /* Report errors for fallthrough cases in switch statement. */
    "noUncheckedIndexedAccess": true,  /* Add 'undefined' to a type when accessed using an index. */
    "noImplicitOverride": true,  /* Ensure overriding members in derived classes are marked with an 'override' modifier. */
    "noPropertyAccessFromIndexSignature": true  /* Require index signatures to be accessed with the bracket notation. */
  }
}
```

## Source Maps

### Source Map Options

```json
{
  "compilerOptions": {
    "sourceMap": true,  /* Generate .map files. */
    "inlineSources": true,  /* Include sourcemap files inside the emitted JavaScript. */
    "inlineSourceMap": false,  /* Emit a single file with source maps instead of having a separate file. */
    "sourceRoot": "",  /* Specify the location where debugger should locate TypeScript files instead of source locations. */
    "mapRoot": "",  /* Specify the location where debugger should locate map files instead of generated locations. */
    "declarationMap": true  /* Generates a sourcemap for each corresponding '.d.ts' file. */
  }
}
```

## Key Takeaways

1. **Configuration File**: The `tsconfig.json` file is the central configuration file for TypeScript projects.
2. **Strict Mode**: Enable `strict: true` to catch more potential errors at compile time.
3. **Project References**: Use project references to split large codebases into smaller, more manageable projects.
4. **Module Resolution**: Understand the difference between `classic` and `node` module resolution strategies.
5. **Type Acquisition**: Leverage `@types` packages for better JavaScript library support.
6. **Source Maps**: Configure source maps for better debugging experience.
7. **Incremental Builds**: Use `incremental` flag for faster subsequent builds.
8. **Path Mapping**: Use path aliases to avoid relative path hell.

## Exercises

1. Create a `tsconfig.json` from scratch with strict type checking enabled.
2. Set up a multi-project TypeScript repository using project references.
3. Configure path aliases for a cleaner import structure.
4. Create different build configurations for development and production.
5. Set up a TypeScript project with React and test your configuration.

## Next Steps

Now that you understand TypeScript configuration, you're ready to explore how to work with the TypeScript compiler API in the next section.
