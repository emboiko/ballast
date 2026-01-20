import path from "path"
import { fileURLToPath } from "url"

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

/** @type {import('next').NextConfig} */
const nextConfig = {
  devIndicators: false,
  compiler: {
    styledComponents: true,
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
