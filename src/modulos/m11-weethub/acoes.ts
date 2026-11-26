// Ações da visão Weethub (M11). Mudam os dados recebidos (D); hoje em memória, depois no banco.
import type { Loja } from '@/contratos/tipos';
import type { DadosExemplo } from '../../../dados-exemplo/gerar';
import { novoId } from '@/lib/demo/util';

export function criarEmpresa(D: DadosExemplo, e: { nome: string; slug: string; donoNome: string; donoEmail: string }): string {
  const slug = e.slug.trim().toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '').replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
  if (!e.nome.trim() || !slug) throw new Error('Informe o nome e o endereço da loja.');
  if (D.lojas.some((l) => l.slug === slug)) throw new Error('Já existe uma loja com esse endereço.');
  const email = e.donoEmail.trim().toLowerCase();
  if (D.usuarios.some((u) => u.email === email)) throw new Error('Este e-mail já tem acesso.');
  const id = novoId('l');
  const loja: Loja = {
    id, nome: e.nome.trim(), slug, status: 'implantacao', nuvemshopConectada: false, comissaoPadraoBps: 1000, cupomDescontoPct: 10, retencaoDias: 7,
    criterios: { aprovacaoAutomatica: false, seguidoresMin: 0, engajamentoMinBps: 0, redesAceitas: ['instagram', 'tiktok'], segmentosAceitos: [], exigeTerProduto: false },
    paginaCadastro: { titulo: `Seja creator da ${e.nome.trim()}`, texto: '', aberta: true },
  };
  D.lojas.push(loja);
  D.usuarios.push({ id: novoId('u'), email, nome: e.donoNome.trim(), perfil: 'LOJA', lojaId: id });
  return id;
}

export function mudarStatusEmpresa(D: DadosExemplo, lojaId: string, status: Loja['status']) {
  const l = D.lojas.find((x) => x.id === lojaId);
  if (!l) throw new Error('Empresa não encontrada.');
  l.status = status;
}
