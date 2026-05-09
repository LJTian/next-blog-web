/** @type {import('next').NextConfig} */
const nextConfig = {
  /** 关闭 Segment Explorer，避免 dev 下 “SegmentViewNode … Client Manifest” 已知 bundler 报错 */
  experimental: {
    devtoolSegmentExplorer: false,
  },
  transpilePackages: ["react-notion-x"],
  images: {
    remotePatterns: [
      { protocol: "https", hostname: "www.notion.so", pathname: "/**" },
      { protocol: "https", hostname: "notion.so", pathname: "/**" },
      {
        protocol: "https",
        hostname: "prod-files-secure.s3.us-west-2.amazonaws.com",
        pathname: "/**",
      },
      { protocol: "https", hostname: "s3.us-west-2.amazonaws.com", pathname: "/**" },
      { protocol: "https", hostname: "images.unsplash.com", pathname: "/**" },
      { protocol: "https", hostname: "pbs.twimg.com", pathname: "/**" },
    ],
  },
};

export default nextConfig;
