// Configuração do Auth.js sem banco (usada também pelo proxy). Dono: M1.
import type { NextAuthConfig } from 'next-auth';
import type { Perfil } from '@/contratos/tipos';

export const authConfig = {
  pages: { signIn: '/entrar' },
  session: { strategy: 'jwt', maxAge: 30 * 24 * 60 * 60 },
  trustHost: true,
  providers: [],
  callbacks: {
    jwt({ token, user }) {
      if (user) {
        token.usuarioId = user.id;
        token.perfil = user.perfil;
        token.lojaId = user.lojaId;
        token.creatorId = user.creatorId;
      }
      return token;
    },
    session({ session, token }) {
      const t = token as { usuarioId?: string; perfil?: Perfil; lojaId?: string; creatorId?: string };
      if (t.usuarioId) session.user.id = t.usuarioId;
      if (t.perfil) session.user.perfil = t.perfil;
      session.user.lojaId = t.lojaId;
      session.user.creatorId = t.creatorId;
      return session;
    },
  },
} satisfies NextAuthConfig;
