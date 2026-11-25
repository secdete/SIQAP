import { fileURLToPath } from "node:url";

// The monorepo keeps one .env at the repository root, but Next.js only reads
// .env files from this project directory. Load the root file explicitly so
// route handlers see GEMINI_API_KEY, DATABASE_URL and the rest. A missing
// file is fine: the app still boots and the AI route answers AI_NOT_CONFIGURED.
try {
  process.loadEnvFile(fileURLToPath(new URL("../../.env", import.meta.url)));
} catch {
  // no root .env yet (fresh clone) — run with whatever the shell provides
}

/** @type {import('next').NextConfig} */
const nextConfig = {
  transpilePackages: ["@siqap/shared", "@siqap/db"],
  // Keep Prisma out of the server bundle: with pnpm's symlinked store the
  // native query engine (.so.node) is not traced into the lambda and Prisma
  // throws "could not locate the Query Engine for runtime rhel-openssl-3.0.x".
  serverExternalPackages: ["@prisma/client", "prisma"],
  reactStrictMode: true,
};

export default nextConfig;
