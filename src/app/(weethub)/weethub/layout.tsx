import { MoldeArea } from '@/componentes/cabecalho-pagina';
import { MenuLateral } from '@/componentes/menu-lateral';
import { exigirWeethub } from '@/lib/acesso';
import { sair } from '@/app/entrar/acoes';

export default async function LayoutWeethub({ children }: { children: React.ReactNode }) {
  const u = await exigirWeethub();
  return (
    <MoldeArea menu={<MenuLateral perfil="WEETHUB" titulo="Weethub" nome={u.nome} sair={sair} />}>{children}</MoldeArea>
  );
}
