import type { DefaultSession } from 'next-auth';
import type { Perfil } from '@/contratos/tipos';

declare module 'next-auth' {
  interface User { perfil: Perfil; lojaId?: string; creatorId?: string }
  interface Session {
    user: { id: string; perfil: Perfil; lojaId?: string; creatorId?: string } & DefaultSession['user'];
  }
}

declare module 'next-auth/jwt' {
  interface JWT { usuarioId?: string; perfil?: Perfil; lojaId?: string; creatorId?: string }
}
