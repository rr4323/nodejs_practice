import type { CodegenConfig } from '@graphql-codegen/cli';

const config: CodegenConfig = {
  schema: './src/graphql/schema.ts',
  documents: './src/**/*.graphql',
  generates: {
    './src/graphql/types/generated.ts': {
      plugins: [
        'typescript',
        'typescript-resolvers',
      ],
      config: {
        contextType: '../context#GraphQLContext',
        mappers: {
          // Add any mappers here if needed
        },
      },
    },
  },
};

export default config;
