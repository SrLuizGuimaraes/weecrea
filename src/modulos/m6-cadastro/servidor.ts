'use server';
// Ações do cadastro de creators no banco (M6): cadastro público, página da loja e convite por e-mail.
import { revalidatePath } from 'next/cache';
import { headers } from 'next/headers';
import { avaliarCriterios, decidirAprovacao, podeCadastrarDeNovo } from '@/dominio/criterios';
import { comoAcao, ErroDeRegra, type Resultado } from '@/lib/acao';
import { exigirLoja } from '@/lib/acesso';
import { mapAfiliacao, mapCreator, mapLoja } from '@/lib/dados-reais';
import { diaEmSaoPaulo } from '@/lib/datas';
import { db } from '@/lib/db';
import { enviarEmail, escaparHtml, moldeEmail } from '@/lib/email';
import { urlDoApp } from '@/lib/link-senha';
import { aprovarAfiliacaoNoBanco } from '@/modulos/m7-aprovacao/aprovacao-db';

export interface FormularioCadastro {
  nome: string; email: string; whatsapp: string; nascimento: string; uf: string; cidade: string;
  instagram?: { perfil: string; seguidores: number }; tiktok?: { perfil: string; seguidores: number };
  bio: string; segmentos: string[]; temProduto: boolean; origem: 'link' | 'qr_code' | 'email' | 'pagina'; campanhaId?: string;
}
export type ResultadoCadastro = { status: 'aprovado'; cupom: string } | { status: 'pendente'; motivo: string };

const UFS = new Set('AC AL AP AM BA CE DF ES GO MA MT MS MG PA PB PR PE PI RJ RN RS RO RR SC SP SE TO'.split(' '));
const ORIGENS = new Set(['link', 'qr_code', 'email', 'pagina']);
const EMAIL = /^[^@\s]+@[^@\s]+\.[^@\s]+$/;

// Limite simples por IP (5 envios a cada 10 minutos). Fica na memória do servidor: segura contra uso
// descuidado, mas não contra ataque distribuído (isso fica para um serviço próprio, depois do 02/12).
const envios = new Map<string, number[]>();
async function limitarPorIp() {
  const h = await headers();
  const ip = (h.get('x-forwarded-for') ?? h.get('x-real-ip') ?? 'local').split(',')[0]!.trim();
  const agora = Date.now();
  const recentes = (envios.get(ip) ?? []).filter((t) => agora - t < 600_000);
  if (recentes.length >= 5) throw new ErroDeRegra('Muitos envios em pouco tempo. Tente de novo em alguns minutos.');
  envios.set(ip, [...recentes, agora]);
}

function maiorDeIdade(nascimento: string) {
  const d = new Date(`${nascimento}T12:00:00Z`);
  if (Number.isNaN(d.getTime())) return false;
  const limite = new Date(); limite.setUTCFullYear(limite.getUTCFullYear() - 18);
  return d <= limite;
}

function validarRede(r?: { perfil: string; seguidores: number }) {
  if (!r) return undefined;
  const perfil = r.perfil.replace(/^@/, '').trim();
  if (!perfil) return undefined;
  if (!/^[A-Za-z0-9._]{1,40}$/.test(perfil)) throw new ErroDeRegra('Perfil de rede inválido. Use só letras, números, ponto e sublinhado.');
  if (!Number.isInteger(r.seguidores) || r.seguidores < 0 || r.seguidores > 1_000_000_000) throw new ErroDeRegra('Número de seguidores inválido.');
  return { perfil, seguidores: r.seguidores };
}

export async function cadastrarCreatorServidor(slug: string, f: FormularioCadastro): Promise<Resultado<ResultadoCadastro>> {
  return comoAcao(async () => {
    await limitarPorIp();
    const lojaDb = await db.loja.findUnique({ where: { slug } });
    if (!lojaDb) throw new ErroDeRegra('Loja não encontrada.');
    if (!lojaDb.paginaAberta || lojaDb.status === 'suspensa' || lojaDb.status === 'cancelada') throw new ErroDeRegra('Inscrições fechadas.');
    const loja = mapLoja(lojaDb);

    const email = f.email.trim().toLowerCase();
    const nome = f.nome.trim();
    const instagram = validarRede(f.instagram), tiktok = validarRede(f.tiktok);
    if (nome.length < 3 || nome.length > 120) throw new ErroDeRegra('Informe seu nome completo.');
    if (!EMAIL.test(email) || email.length > 160) throw new ErroDeRegra('Informe um e-mail válido.');
    if (f.whatsapp.replace(/\D/g, '').length < 10) throw new ErroDeRegra('Informe um WhatsApp válido, com DDD.');
    if (!UFS.has(f.uf) || !f.cidade.trim() || f.cidade.length > 80) throw new ErroDeRegra('Informe a cidade e a UF.');
    if (!maiorDeIdade(f.nascimento)) throw new ErroDeRegra('O cadastro é só para maiores de 18 anos.');
    if (!instagram && !tiktok) throw new ErroDeRegra('Informe ao menos um perfil, do Instagram ou do TikTok.');
    if (f.bio.length < 30 || f.bio.length > 500) throw new ErroDeRegra('Fale sobre você em 30 a 500 caracteres.');
    const segmentos = [...new Set(f.segmentos)];
    if (segmentos.length < 1 || segmentos.length > 3) throw new ErroDeRegra('Escolha de 1 a 3 segmentos.');
    const origem = ORIGENS.has(f.origem) ? f.origem : 'pagina';

    // Só aceita a campanha do convite se for desta loja e já publicada.
    const campanhaId = f.campanhaId
      ? (await db.campanha.findFirst({ where: { id: f.campanhaId, lojaId: lojaDb.id, status: { notIn: ['rascunho', 'cancelada'] } }, select: { id: true } }))?.id
      : undefined;

    const dadosCreator = {
      bio: f.bio.trim(), segmentos,
      instagramPerfil: instagram?.perfil ?? null, instagramSeguidores: instagram?.seguidores ?? null,
      tiktokPerfil: tiktok?.perfil ?? null, tiktokSeguidores: tiktok?.seguidores ?? null,
    };
    // E-mail já cadastrado: reaproveita o creator e atualiza só o que é dele. E-mail de loja ou Weethub não serve.
    const usuario = await db.usuario.findUnique({ where: { email }, include: { creator: true } });
    if (usuario && (usuario.perfil !== 'CREATOR' || !usuario.creator)) throw new ErroDeRegra('Este e-mail já é usado em outra conta. Use outro e-mail.');
    let creatorId: string;
    if (usuario?.creator) {
      creatorId = usuario.creator.id;
      await db.creator.update({ where: { id: creatorId }, data: dadosCreator });
    } else {
      const novo = await db.usuario.create({
        data: {
          email, nome, perfil: 'CREATOR',
          creator: { create: { nome, email, whatsapp: f.whatsapp.trim(), uf: f.uf, cidade: f.cidade.trim(), nascimento: new Date(`${f.nascimento}T00:00:00Z`), ...dadosCreator } },
        },
        include: { creator: true },
      });
      creatorId = novo.creator!.id;
    }

    const existente = await db.afiliacao.findUnique({ where: { lojaId_creatorId: { lojaId: lojaDb.id, creatorId } } });
    if (existente) {
      if (existente.status === 'aprovado' || existente.status === 'pausado') throw new ErroDeRegra('Você já participa desta loja. Entre com o seu e-mail.');
      if (existente.status === 'pendente') throw new ErroDeRegra('Seu cadastro já está em análise nesta loja.');
      if (!podeCadastrarDeNovo(mapAfiliacao(existente), diaEmSaoPaulo())) throw new ErroDeRegra('Você poderá se cadastrar de novo 30 dias depois da última resposta.');
    }
    const afDados = { status: 'pendente' as const, origem, temProduto: f.temProduto, decisao: null, decididaEm: null, ...(campanhaId ? { campanhaConviteId: campanhaId } : {}) };
    const af = existente
      ? await db.afiliacao.update({ where: { id: existente.id }, data: afDados })
      : await db.afiliacao.create({ data: { ...afDados, lojaId: lojaDb.id, creatorId } });

    const creator = await db.creator.findUniqueOrThrow({ where: { id: creatorId } });
    const falhas = avaliarCriterios(mapCreator(creator), mapAfiliacao(af), loja.criterios);
    await db.afiliacao.update({ where: { id: af.id }, data: { falhasCriterios: falhas } });

    if (decidirAprovacao(falhas, loja.criterios) === 'aprovado') {
      const cupom = await aprovarAfiliacaoNoBanco(lojaDb.id, creatorId, 'automatica');
      if (campanhaId) {
        await db.participacao.upsert({
          where: { campanhaId_creatorId: { campanhaId, creatorId } }, create: { campanhaId, creatorId, status: 'convidado' }, update: {},
        });
      }
      revalidatePath('/loja/creators');
      return { status: 'aprovado' as const, cupom };
    }
    revalidatePath('/loja/creators');
    return { status: 'pendente' as const, motivo: falhas[0] ?? 'A loja analisa cada cadastro.' };
  });
}

export async function salvarPaginaCadastroServidor(p: { titulo: string; texto: string; aberta: boolean }): Promise<Resultado> {
  return comoAcao(async () => {
    const { lojaId } = await exigirLoja();
    if (!p.titulo.trim() || p.titulo.length > 120) throw new ErroDeRegra('Informe um título de até 120 caracteres.');
    if (p.texto.length > 600) throw new ErroDeRegra('O texto pode ter até 600 caracteres.');
    await db.loja.update({ where: { id: lojaId }, data: { paginaTitulo: p.titulo.trim(), paginaTexto: p.texto.trim(), paginaAberta: p.aberta } });
    revalidatePath('/loja/configuracoes');
  });
}

/** Convite por e-mail para até 50 endereços. Devolve quantos foram enviados e quantos endereços eram inválidos. */
export async function enviarConvitesEmailServidor(emails: string[], campanhaId?: string): Promise<Resultado<{ enviados: number; invalidos: number }>> {
  return comoAcao(async () => {
    const { lojaId } = await exigirLoja();
    const lista = [...new Set(emails.map((e) => e.trim().toLowerCase()).filter(Boolean))];
    const validos = lista.filter((e) => EMAIL.test(e));
    if (!validos.length) throw new ErroDeRegra('Informe ao menos um e-mail válido.');
    if (validos.length > 50) throw new ErroDeRegra('No máximo 50 endereços por vez.');
    const loja = await db.loja.findUniqueOrThrow({ where: { id: lojaId } });
    const camp = campanhaId ? await db.campanha.findFirst({ where: { id: campanhaId, lojaId }, select: { id: true } }) : null;
    const link = `${urlDoApp()}/c/${loja.slug}?origem=email${camp ? `&campanha=${camp.id}` : ''}`;
    const m = moldeEmail({
      titulo: `${escaparHtml(loja.nome)} convida você para ser creator`,
      paragrafos: ['Cadastre-se na página da loja, ganhe um cupom exclusivo e comissão por cada venda.'],
      botao: { texto: 'Quero participar', url: link },
    });
    let enviados = 0;
    for (const para of validos) {
      try { await enviarEmail({ para, assunto: `Convite: seja creator da ${loja.nome}`, ...m }); enviados += 1; } catch (e) { console.error('[m6] convite falhou', e); }
    }
    return { enviados, invalidos: lista.length - validos.length };
  });
}
