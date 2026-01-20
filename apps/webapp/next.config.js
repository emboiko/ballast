import path from "path"
import { fileURLToPath } from "url"

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

const getImageRemotePatterns = () => {
  const patterns = []
  const apiUrl = process.env.NEXT_PUBLIC_API_URL
  if (apiUrl) {
    try {
      const url = new URL(apiUrl)
      patterns.push({
        protocol: url.protocol.slice(0, -1) || "http",
        hostname: url.hostname,
        port: url.port || "",
        pathname: "/catalog/images/**",
      })
    } catch {
      // Invalid URL, skip
    }
  }
  if (process.env.NODE_ENV === "development") {
    patterns.push({
      protocol: "http",
      hostname: "localhost",
      port: "3000",
      pathname: "/catalog/images/**",
    })
  }
  return patterns
}

/** @type {import('next').NextConfig} */
const nextConfig = {
  devIndicators: false,
  compiler: {
    styledComponents: true,
  },
  images: {
    remotePatterns: getImageRemotePatterns(),
    unoptimized: process.env.NODE_ENV === "development",
  },
  // Turbopack is default in Next.js 16
  // Empty config acknowledges we have webpack aliases but Turbopack handles them
  turbopack: {},
  webpack: (config) => {
    config.resolve.alias = {
      ...config.resolve.alias,
      "@": path.resolve(__dirname, "./app"),
      "@shared": path.resolve(__dirname, "../../packages/shared/src"),
    }
    return config
  },
}

export default nextConfig
