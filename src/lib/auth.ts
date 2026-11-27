// Login com e-mail e senha (Auth.js). Dono: M1.
// Sessão guarda usuarioId, perfil e lojaId ou creatorId.
import NextAuth, { CredentialsSignin } from 'next-auth';
import Credentials from 'next-auth/providers/credentials';
import { authConfig } from './auth.config';
import { db } from './db';
import { conferirSenha } from './senha';

class LoginInvalido extends CredentialsSignin {
  code = 'login_invalido';
}

export const { handlers, auth, signIn, signOut } = NextAuth({
  ...authConfig,
  providers: [
    Credentials({
      credentials: { email: { label: 'E-mail', type: 'email' }, senha: { label: 'Senha', type: 'password' } },
      async authorize(credenciais) {
        const email = String(credenciais?.email ?? '').trim().toLowerCase();
        const senha = String(credenciais?.senha ?? '');
        if (!email || !senha) throw new LoginInvalido();
        const usuario = await db.usuario.findUnique({
          where: { email },
          include: { creator: { select: { id: true, bloqueado: true } } },
        });
        if (!usuario?.senhaHash || !(await conferirSenha(senha, usuario.senhaHash))) throw new LoginInvalido();
        if (usuario.creator?.bloqueado) throw new LoginInvalido();
        return {
          id: usuario.id, email: usuario.email, name: usuario.nome, perfil: usuario.perfil,
          lojaId: usuario.lojaId ?? undefined, creatorId: usuario.creator?.id ?? undefined,
        };
      },
    }),
  ],
});
