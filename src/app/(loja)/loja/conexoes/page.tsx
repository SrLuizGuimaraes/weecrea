// Conexões (M3) e pedidos recebidos (M4).
import { exigirLoja } from '@/lib/acesso';
import { carregarDadosLoja } from '@/lib/dados-reais';
import { ProvedorDados } from '@/lib/dados-reais-cliente';
import { hojeSP } from '@/lib/datas';
import { db } from '@/lib/db';
import { webhooksRegistrados } from '@/modulos/m3-nuvemshop/loja-nuvemshop';
import { TelaConexoes } from './tela';

export default async function Conexoes({ searchParams }: { searchParams: Promise<{ aba?: string; aviso?: string; erro?: string }> }) {
  const { lojaId } = await exigirLoja();
  const { aba, aviso, erro } = await searchParams;
  const [D, loja, ultimo, comErro] = await Promise.all([
    carregarDadosLoja(lojaId, hojeSP()),
    db.loja.findUniqueOrThrow({ where: { id: lojaId }, select: { nuvemshopConectada: true } }),
    db.avisoWebhook.findFirst({ where: { lojaId }, orderBy: { recebidoEm: 'desc' }, select: { recebidoEm: true } }),
    db.avisoWebhook.count({ where: { lojaId, erro: { not: null }, processadoEm: null } }),
  ]);
  const webhooks = loja.nuvemshopConectada && aba !== 'pedidos' ? await webhooksRegistrados(lojaId) : [];
  return (
    <ProvedorDados D={D}>
      <TelaConexoes lojaId={lojaId} aba={aba} aviso={aviso} erro={erro}
        extras={{ webhooks, ultimoAviso: ultimo?.recebidoEm.toISOString(), avisosComErro: comErro }} />
    </ProvedorDados>
  );
}
