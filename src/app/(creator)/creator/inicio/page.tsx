// Provisório do M1. Dono desta rota: M9 (Início do creator).
import { exigirCreator } from '@/lib/acesso';
import { db } from '@/lib/db';

export default async function InicioCreator() {
  const { creatorId, nome } = await exigirCreator();
  const cupons = await db.cupom.findMany({ where: { creatorId }, include: { loja: { select: { nome: true } } } });
  return (
    <section>
      <h1 className="text-2xl font-semibold">Olá, {nome.split(' ')[0]}</h1>
      <ul className="mt-2 opacity-70">
        {cupons.map((c) => <li key={c.id}>{c.loja.nome}: cupom {c.codigo}</li>)}
      </ul>
    </section>
  );
}
