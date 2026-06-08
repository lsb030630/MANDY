const isGithubPages = process.env.GITHUB_PAGES === "true";

/** @type {import('next').NextConfig} */
const nextConfig = {
  output: isGithubPages ? "export" : undefined,
  basePath: isGithubPages ? "/MANDY" : undefined,
  assetPrefix: isGithubPages ? "/MANDY/" : undefined,
  images: {
    unoptimized: true,
  },
};

export default nextConfig;
