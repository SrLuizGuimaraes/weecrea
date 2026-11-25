import { MenuArea } from '@/componentes/menu-area';
import { exigirCreator } from '@/lib/acesso';
import { sair } from '@/app/entrar/acoes';

export default async function LayoutCreator({ children }: { children: React.ReactNode }) {
  const u = await exigirCreator();
  return (
    <div className="md:flex">
      <MenuArea perfil="CREATOR" titulo="Área do creator" nome={u.nome} sair={sair} />
      <main className="flex-1 p-4 md:p-8">{children}</main>
    </div>
  );
}
