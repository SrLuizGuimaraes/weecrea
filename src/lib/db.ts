// Conexão única com o banco (Prisma 7 + driver pg). Dono: M1.
// Uso: import { db } from '@/lib/db'; await db.pedido.findMany({ where: { lojaId } })
import { PrismaPg } from '@prisma/adapter-pg';
import { PrismaClient } from '@/generated/prisma/client';

function criarCliente(): PrismaClient {
  const connectionString = process.env.DATABASE_URL;
  if (!connectionString) throw new Error('DATABASE_URL não definida. Veja o .env.example.');
  const adapter = new PrismaPg({ connectionString, max: process.env.NODE_ENV === 'production' ? 5 : 3 });
  return new PrismaClient({ adapter });
}

const global = globalThis as unknown as { __weecreaDb?: PrismaClient };

// Criado só no primeiro uso, para o build funcionar sem banco.
export const db: PrismaClient = new Proxy({} as PrismaClient, {
  get(_alvo, prop) {
    global.__weecreaDb ??= criarCliente();
    const valor = Reflect.get(global.__weecreaDb, prop);
    return typeof valor === 'function' ? valor.bind(global.__weecreaDb) : valor;
  },
});

export * from '@/generated/prisma/client';
