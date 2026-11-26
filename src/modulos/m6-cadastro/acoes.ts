// Ações da página de cadastro (M6). Mudam os dados recebidos (D); hoje em memória, depois no banco.
import type { Rede } from '@/contratos/tipos';
import type { DadosExemplo } from '../../../dados-exemplo/gerar';
import { avaliarCriterios, decidirAprovacao, podeCadastrarDeNovo } from '@/dominio/criterios';
import { diaEmSaoPaulo } from '@/lib/datas';
import { novoId } from '@/lib/demo/util';
import { aprovarCreator } from '@/modulos/m7-aprovacao/acoes';

export interface FormularioCadastro {
  nome: string; email: string; whatsapp: string; nascimento: string; uf: string; cidade: string;
  instagram?: { perfil: string; seguidores: number }; tiktok?: { perfil: string; seguidores: number };
  bio: string; segmentos: string[]; temProduto: boolean; origem: 'link' | 'qr_code' | 'email' | 'pagina'; campanhaId?: string;
}

export type ResultadoCadastro = { status: 'aprovado'; cupom: string } | { status: 'pendente'; motivo: string };

export function cadastrarCreator(D: DadosExemplo, slug: string, f: FormularioCadastro): ResultadoCadastro {
  const loja = D.lojas.find((l) => l.slug === slug);
  if (!loja) throw new Error('Loja não encontrada.');
  if (!loja.paginaCadastro.aberta || loja.status === 'suspensa' || loja.status === 'cancelada') throw new Error('Inscrições fechadas.');
  const email = f.email.trim().toLowerCase();

  // E-mail já cadastrado: usa o mesmo creator e atualiza o que é dele (M6, tarefa 3).
  let creator = D.creators.find((c) => c.email.toLowerCase() === email);
  if (!creator) {
    const id = novoId('c');
    D.usuarios.push({ id: `u-${id}`, email, nome: f.nome.trim(), perfil: 'CREATOR', creatorId: id });
    creator = {
      id, usuarioId: `u-${id}`, nome: f.nome.trim(), email, whatsapp: f.whatsapp, uf: f.uf, cidade: f.cidade, bio: f.bio,
      segmentos: f.segmentos, bloqueado: false,
      ...(f.instagram ? { instagram: f.instagram } : {}), ...(f.tiktok ? { tiktok: f.tiktok } : {}),
    };
    D.creators.push(creator);
  } else {
    Object.assign(creator, { bio: f.bio, segmentos: f.segmentos, ...(f.instagram ? { instagram: f.instagram } : {}), ...(f.tiktok ? { tiktok: f.tiktok } : {}) });
  }

  let a = D.afiliacoes.find((x) => x.lojaId === loja.id && x.creatorId === creator!.id);
  if (a) {
    if (a.status === 'aprovado' || a.status === 'pausado') throw new Error('Você já participa desta loja. Entre com o seu e-mail.');
    if (a.status === 'pendente') throw new Error('Seu cadastro já está em análise nesta loja.');
    if (!podeCadastrarDeNovo(a, diaEmSaoPaulo())) throw new Error('Você poderá se cadastrar de novo 30 dias depois da última resposta.');
    Object.assign(a, { status: 'pendente', origem: f.origem, temProduto: f.temProduto, decisao: undefined, decididaEm: undefined });
  } else {
    a = { id: novoId('a'), lojaId: loja.id, creatorId: creator.id, status: 'pendente', origem: f.origem, temProduto: f.temProduto, falhasCriterios: [],
      ...(f.campanhaId ? { campanhaConviteId: f.campanhaId } : {}) };
    D.afiliacoes.push(a);
  }

  a.falhasCriterios = avaliarCriterios(creator, a, loja.criterios);
  if (decidirAprovacao(a.falhasCriterios, loja.criterios) === 'aprovado') {
    const cupom = aprovarCreator(D, loja.id, creator.id, 'automatica');
    if (f.campanhaId && !D.participacoes.some((p) => p.campanhaId === f.campanhaId && p.creatorId === creator!.id)) {
      D.participacoes.push({ campanhaId: f.campanhaId, creatorId: creator.id, status: 'convidado' });
    }
    return { status: 'aprovado', cupom };
  }
  return { status: 'pendente', motivo: a.falhasCriterios[0] ?? 'A loja analisa cada cadastro.' };
}

export function salvarPaginaCadastro(D: DadosExemplo, lojaId: string, p: { titulo: string; texto: string; aberta: boolean }) {
  const loja = D.lojas.find((l) => l.id === lojaId)!;
  loja.paginaCadastro = p;
}

export const REDES: Rede[] = ['instagram', 'tiktok'];
