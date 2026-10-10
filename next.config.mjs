/** @type {import('next').NextConfig} */
const nextConfig = {
  typescript: {
    ignoreBuildErrors: true,
  },
  images: {
    unoptimized: true,
  },
  async redirects() {
    return [
      { source: '/dashboard', destination: '/app', permanent: false },
      { source: '/dashboard/:path*', destination: '/app', permanent: false },
      { source: '/app/:path+', destination: '/app', permanent: false },
      { source: '/login/:path+', destination: '/login', permanent: false },
      { source: '/signup', destination: '/login', permanent: false },
      { source: '/registro', destination: '/login', permanent: false },
    ]
  },
}

export default nextConfig
