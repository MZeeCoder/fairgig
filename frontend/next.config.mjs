/** @type {import('next').NextConfig} */
const nextConfig = {
  /* config options here */
  reactCompiler: true,
  async redirects() {
    return [
      {
        source: '/worker',
        destination: '/worker/dashboard',
        permanent: true,
      },
    ];
  },
};

export default nextConfig;
