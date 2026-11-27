// Provisório do M1. Dono desta rota: M9 (Painel de vendas).
import { exigirLoja } from '@/lib/acesso';
import { db } from '@/lib/db';

export default async function PainelLoja() {
  const { lojaId } = await exigirLoja();
  const [pedidos, creators] = await Promise.all([
    db.pedido.count({ where: { lojaId } }),
    db.afiliacao.count({ where: { lojaId, status: 'aprovado' } }),
  ]);
  return (
    <section>
      <h1 className="text-2xl font-semibold">Painel</h1>
      <p className="mt-2 opacity-70">{pedidos} pedidos e {creators} creators aprovados nesta loja.</p>
    </section>
  );
}
