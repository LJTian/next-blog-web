/** @type {import('next').NextConfig} */
/** 局域网 IP 访问 dev（如 http://10.x.x.x:3000）时避免 /_next 跨域告警；逗号或空格分隔多个 hostname */
const nextDevAllowedOrigins =
  process.env.NEXT_DEV_ALLOWED_ORIGINS?.split(/[\s,]+/).filter(Boolean) ?? [];

const nextConfig = {
  ...(nextDevAllowedOrigins.length ? { allowedDevOrigins: nextDevAllowedOrigins } : {}),
  async redirects() {
    return [
      {
        source: "/blog/ljtian-blog",
        destination: "/blog",
        permanent: true,
      },
    ];
  },
  /** 关闭 Segment Explorer，避免 dev 下 “SegmentViewNode … Client Manifest” 已知 bundler 报错 */
  experimental: {
    devtoolSegmentExplorer: false,
  },
  transpilePackages: ["react-notion-x"],
  webpack: (config, { dev, isServer }) => {
    /**
     * dev + SSR：禁用分包，避免出现 Cannot find module './vendor-chunks/react-notion-x.js'
     *（static-paths-worker / HMR 与 vendor chunk 写入顺序竞态）。
     * 仅影响开发环境服务端打包；生产构建仍使用默认 splitChunks。
     */
    if (dev && isServer) {
      config.optimization = {
        ...(config.optimization ?? {}),
        splitChunks: false,
      };
    }
    return config;
  },
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
