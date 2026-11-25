import { MenuArea } from '@/componentes/menu-area';
import { exigirLoja } from '@/lib/acesso';
import { db } from '@/lib/db';
import { sair } from '@/app/entrar/acoes';

export default async function LayoutLoja({ children }: { children: React.ReactNode }) {
  const u = await exigirLoja();
  const loja = await db.loja.findUniqueOrThrow({ where: { id: u.lojaId }, select: { nome: true } });
  return (
    <div className="md:flex">
      <MenuArea perfil="LOJA" titulo={loja.nome} nome={u.nome} sair={sair} />
      <main className="flex-1 p-4 md:p-8">{children}</main>
    </div>
  );
}
