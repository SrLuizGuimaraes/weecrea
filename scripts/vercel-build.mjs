// Build na Vercel. Dono: M1.
// Em produção, aplica as migrações do Prisma antes do build (prisma migrate deploy só aplica as que faltam).
// Nos previews (PRs), não mexe no banco: só faz o build.
import { execSync } from 'node:child_process';

const rodar = (comando) => execSync(comando, { stdio: 'inherit' });

if (process.env.VERCEL_ENV === 'production' && process.env.DATABASE_URL) {
  rodar('npx prisma migrate deploy');
} else {
  console.log('[build] sem migração (não é produção ou sem DATABASE_URL)');
}
rodar('npx next build');
