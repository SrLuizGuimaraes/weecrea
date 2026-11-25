import { MenuArea } from '@/componentes/menu-area';
import { exigirWeethub } from '@/lib/acesso';
import { sair } from '@/app/entrar/acoes';

export default async function LayoutWeethub({ children }: { children: React.ReactNode }) {
  const u = await exigirWeethub();
  return (
    <div className="md:flex">
      <MenuArea perfil="WEETHUB" titulo="Weethub" nome={u.nome} sair={sair} />
      <main className="flex-1 p-4 md:p-8">{children}</main>
    </div>
  );
}
