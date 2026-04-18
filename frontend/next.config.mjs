/** @type {import('next').NextConfig} */
const nextConfig = {
  /* config options here */
  reactCompiler: true,
  async redirects() {
    return [
      {
        source: '/',
        destination: '/login',
        permanent: true,
      },
      {
        source: '/worker',
        destination: '/worker/dashboard',
        permanent: true,
      },
      {
        source:'/advocate',
        destination:'/advocate/dashboard',
        permanent:true,
      }
    ];
  },
};

export default nextConfig;
