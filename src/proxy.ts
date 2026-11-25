// Proxy (o antigo middleware do Next.js) de acesso. Dono: M1.
// Sem login: vai para /entrar. Perfil errado: volta para a própria área.
// Atenção: isto protege as TELAS. Cada consulta ao banco ainda precisa filtrar pela loja ou creator
// da sessão (use exigirLoja/exigirCreator de src/lib/acesso.ts).
import NextAuth from 'next-auth';
import { NextResponse } from 'next/server';
import { authConfig } from '@/lib/auth.config';
import { INICIO_DO_PERFIL, ROTAS_LOGADAS, areaDaRota, perfilPodeAbrir } from '@/lib/perfis';

const { auth } = NextAuth(authConfig);

export default auth((req) => {
  const { pathname, search } = req.nextUrl;
  const usuario = req.auth?.user;
  const protegida = !!areaDaRota(pathname) || ROTAS_LOGADAS.some((r) => pathname.startsWith(r));

  if (!usuario?.perfil) {
    if (!protegida) return NextResponse.next();
    const entrar = new URL('/entrar', req.nextUrl);
    entrar.searchParams.set('voltar', pathname + search);
    return NextResponse.redirect(entrar);
  }
  if (pathname === '/entrar' || pathname === '/') {
    return NextResponse.redirect(new URL(INICIO_DO_PERFIL[usuario.perfil], req.nextUrl));
  }
  if (!perfilPodeAbrir(usuario.perfil, pathname)) {
    return NextResponse.redirect(new URL(INICIO_DO_PERFIL[usuario.perfil], req.nextUrl));
  }
  return NextResponse.next();
});

export const config = {
  matcher: ['/', '/entrar', '/loja/:path*', '/creator/:path*', '/weethub/:path*', '/upload-teste/:path*'],
};
