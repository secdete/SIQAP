/** @type {import('next').NextConfig} */
const nextConfig = {
  transpilePackages: ["@siqap/shared", "@siqap/db"],
  reactStrictMode: true,
};

export default nextConfig;
