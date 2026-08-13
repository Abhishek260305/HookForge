import type { CodegenConfig } from "@graphql-codegen/cli";

const config: CodegenConfig = {
  schema: "src/lib/graphql/schema.graphql",
  documents: ["src/**/*.{graphql,ts,tsx}"],
  ignoreNoDocuments: true,
  generates: {
    "src/lib/graphql/generated/": {
      preset: "client",
      plugins: [],
      presetConfig: {
        gqlTagName: "gql",
      },
    },
  },
};

export default config;
