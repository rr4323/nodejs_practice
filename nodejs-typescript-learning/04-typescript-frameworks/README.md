# TypeScript with Frameworks

This section covers how to use TypeScript with popular JavaScript/Node.js frameworks, focusing on Express, NestJS, React, and Next.js. Each framework has its own directory with examples and best practices.

## Table of Contents

### Backend Frameworks
1. [Express.js](./01-express/README.md) - Minimalist web framework for Node.js
2. [NestJS](./02-nestjs/README.md) - A progressive Node.js framework for building efficient, reliable and scalable server-side applications

### Frontend Frameworks
3. [React with TypeScript](./03-react/README.md) - A JavaScript library for building user interfaces
4. [Next.js](./06-nextjs/README.md) - The React Framework for Production

## Shared Utilities

The `shared` directory contains common TypeScript utilities and patterns that can be used across different frameworks, including:
- Type definitions
- Utility functions
- Common interfaces
- Configuration presets

## Getting Started

Each framework directory contains:
- `README.md` - Framework-specific documentation and setup instructions
- `package.json` - Dependencies and scripts
- `src/` - Source code with TypeScript examples
- `tsconfig.json` - TypeScript configuration
- `.env.example` - Example environment variables (if applicable)

## Prerequisites

- Node.js 18+ (LTS recommended)
- TypeScript 5.0+
- npm (v9+) or yarn (v1.22+)
- Git (for version control)

## Setup

1. Navigate to the framework directory you're interested in
2. Install dependencies: `npm install` or `yarn`
3. Copy `.env.example` to `.env` and configure environment variables
4. Follow the framework-specific instructions in the README
5. Start the development server: `npm run dev` or `yarn dev`

## Best Practices

### TypeScript Configuration
- Always enable strict mode in `tsconfig.json`
- Use path aliases for cleaner imports
- Enable strict null checks and strict property initialization
- Use `esModuleInterop` and `allowSyntheticDefaultImports` for better module handling

### Code Organization
- Group by feature, not by type
- Keep components/pages small and focused
- Use barrel files (index.ts) for clean exports
- Keep business logic separate from presentation

### Type Safety
- Use TypeScript interfaces for API responses
- Leverage utility types (Partial, Pick, Omit, etc.)
- Use type guards for runtime type checking
- Avoid using `any` - prefer `unknown` when type is uncertain

### Testing
- Write unit tests for business logic
- Use integration tests for API endpoints
- Consider end-to-end tests for critical user flows
- Mock external dependencies in tests

### Performance
- Use code splitting for larger applications
- Implement proper error boundaries
- Optimize bundle size with tree-shaking
- Use React.memo, useMemo, and useCallback appropriately

## Contributing

Contributions are welcome! Please follow these guidelines:
1. Fork the repository and create your feature branch
2. Follow the existing code style and patterns
3. Add tests for new features
4. Update relevant documentation
5. Submit a pull request with a clear description

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## Resources

- [TypeScript Documentation](https://www.typescriptlang.org/docs/)
- [React TypeScript Cheatsheet](https://react-typescript-cheatsheet.netlify.app/)
- [Node.js Best Practices](https://github.com/goldbergyoni/nodebestpractices)
- [TypeScript Deep Dive](https://basarat.gitbook.io/typescript/)
