import { MoldeArea } from '@/componentes/cabecalho-pagina';
import { MenuLateral } from '@/componentes/menu-lateral';
import { exigirLoja } from '@/lib/acesso';
import { db } from '@/lib/db';
import { sair } from '@/app/entrar/acoes';

export default async function LayoutLoja({ children }: { children: React.ReactNode }) {
  const u = await exigirLoja();
  const loja = await db.loja.findUniqueOrThrow({ where: { id: u.lojaId }, select: { nome: true } });
  return (
    <MoldeArea menu={<MenuLateral perfil="LOJA" titulo={loja.nome} nome={u.nome} sair={sair} />}>{children}</MoldeArea>
  );
}
