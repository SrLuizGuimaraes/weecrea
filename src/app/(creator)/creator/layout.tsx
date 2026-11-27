import { MoldeArea } from '@/componentes/cabecalho-pagina';
import { MenuLateral } from '@/componentes/menu-lateral';
import { exigirCreator } from '@/lib/acesso';
import { sair } from '@/app/entrar/acoes';

export default async function LayoutCreator({ children }: { children: React.ReactNode }) {
  const u = await exigirCreator();
  return (
    <MoldeArea menu={<MenuLateral perfil="CREATOR" titulo="Área do creator" nome={u.nome} sair={sair} />}>{children}</MoldeArea>
  );
}
