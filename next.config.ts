import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  // Os vídeos vão direto do navegador para o Vercel Blob; o servidor só autoriza.
  serverExternalPackages: ['@electric-sql/pglite'],
};

export default nextConfig;
