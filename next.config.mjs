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
      {
        source: '/prueba',
        destination:
          'https://wa.me/5215654338979?text=Hola%20PpGrillo,%20quiero%20iniciar%20mi%20prueba%20gratis%20de%2014%20d%C3%ADas',
        permanent: false,
      },
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
