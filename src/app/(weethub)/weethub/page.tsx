// Provisório do M1. Dono desta rota: M11 (Visão Weethub).
import { exigirWeethub } from '@/lib/acesso';
import { db } from '@/lib/db';

export default async function PainelWeethub() {
  await exigirWeethub();
  const lojas = await db.loja.findMany({ select: { id: true, nome: true, status: true } });
  return (
    <section>
      <h1 className="text-2xl font-semibold">Painel Weethub</h1>
      <ul className="mt-2 opacity-70">
        {lojas.map((l) => <li key={l.id}>{l.nome} ({l.status})</li>)}
      </ul>
    </section>
  );
}
