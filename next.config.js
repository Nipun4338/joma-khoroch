/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  // @jk/shared is the voice-capture parser, reused from voice/packages/shared.
  // It ships compiled CommonJS; transpiling keeps Next's bundler happy on both
  // server and client.
  transpilePackages: ["@jk/shared"],
};

module.exports = nextConfig;
