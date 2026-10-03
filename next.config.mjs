/** @type {import('next').NextConfig} */
const nextConfig = {
  serverExternalPackages: ['sharp', 'pg'],
  experimental: { serverActions: { bodySizeLimit: '10mb' } },
  poweredByHeader: false,
};
export default nextConfig;
