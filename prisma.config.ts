import 'dotenv/config';
import { defineConfig } from 'prisma/config';

// DATABASE_URL vem do .env (local) ou das variáveis da Vercel (Neon).
// Sem ela, os comandos que não tocam no banco (generate, migrate diff) continuam funcionando.
export default defineConfig({
  schema: 'prisma/schema.prisma',
  migrations: { path: 'prisma/migrations', seed: 'tsx prisma/seed.ts' },
  datasource: { url: process.env.DATABASE_URL ?? 'postgresql://localhost:5432/postgres' },
});
