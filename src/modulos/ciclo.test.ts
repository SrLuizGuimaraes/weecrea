// Roteiro de teste do ciclo completo (guia, passos 3 a 14) rodando sobre as ações da demonstração.
import { describe, expect, it } from 'vitest';
import inicial from '../../dados-exemplo/dados.json';
import type { DadosExemplo } from '../../dados-exemplo/gerar';
import { cadastrarCreator, type FormularioCadastro } from './m6-cadastro/acoes';
import { aprovarCreator, salvarCriterios } from './m7-aprovacao/acoes';
import { aceitarCampanha, salvarCampanha } from './m5-campanhas/acoes';
import { aprovarVideos, enviarVideo } from './m8-biblioteca/acoes';
import { cancelarOuDevolver, criarPedidoTeste } from './m4-vendas/acoes';
import { pagarCreator, saldoDoCreator } from './m10-financeiro/acoes';
import { criarEmpresa } from './m11-weethub/acoes';

const novo = () => structuredClone(inicial) as unknown as DadosExemplo;
const form = (p: Partial<FormularioCadastro>): FormularioCadastro => ({
  nome: 'Ana Teste', email: 'ana.teste@exemplo.com', whatsapp: '11999999999', nascimento: '1995-01-01', uf: 'SP', cidade: 'São Paulo',
  instagram: { perfil: 'anateste', seguidores: 12000 }, bio: 'Crio conteúdo de moda para o dia a dia.', segmentos: ['Moda'],
  temProduto: false, origem: 'qr_code', ...p,
});

describe('ciclo completo na demonstração', () => {
  it('cadastro, aprovação, campanha, vídeo, venda, comissão, cancelamento e pagamento', () => {
    const D = novo();
    const loja = D.lojas.find((l) => l.id === 'l1')!;
    // 3. critérios: automática com 5 mil seguidores e retenção 0 (para o teste)
    salvarCriterios(D, 'l1', { ...loja.criterios, aprovacaoAutomatica: true, seguidoresMin: 5000, engajamentoMinBps: 0, segmentosAceitos: [] });
    loja.retencaoDias = 0;
    // 4. campanha ativa com meta individual (hoje), sem produtos = todos
    const hoje = new Date().toISOString().slice(0, 10);
    const k = salvarCampanha(D, 'l1', { nome: 'Teste', produtoIds: [], inicio: hoje, fim: '2099-12-31', metaCentavos: 100000, metaIndividualCentavos: 30000,
      comissaoBps: 1500, visibilidade: 'aberta', entrega: 'publicar', briefing: 'b', tags: ['t'], beneficioIds: ['b1'], publicar: true });
    expect(D.campanhas.find((c) => c.id === k)!.status).toBe('ativa');
    // 6. creator A com 12 mil: aprovado na hora com cupom
    const a = cadastrarCreator(D, 'atelie-jabuticaba', form({}));
    expect(a).toEqual({ status: 'aprovado', cupom: 'ANA10' });
    // 7. creator B com 2 mil: em análise, a loja aprova à mão
    const b = cadastrarCreator(D, 'atelie-jabuticaba', form({ nome: 'Bruno', email: 'bruno@exemplo.com', instagram: { perfil: 'b', seguidores: 2000 } }));
    expect(b.status).toBe('pendente');
    const idB = D.creators.find((c) => c.email === 'bruno@exemplo.com')!.id;
    expect(aprovarCreator(D, 'l1', idB)).toBe('BRUNO10');
    // 8. A aceita a campanha e envia vídeo
    const idA = D.creators.find((c) => c.email === 'ana.teste@exemplo.com')!.id;
    aceitarCampanha(D, idA, k);
    const v = enviarVideo(D, { lojaId: 'l1', origem: 'creator', creatorId: idA, campanhaId: k, rede: 'instagram', link: 'https://instagram.com/reel/x' });
    expect(D.videos.find((x) => x.id === v)!.status).toBe('em_analise');
    // 9. loja aprova
    aprovarVideos(D, 'l1', [v]);
    // 10. compra com o cupom (em minúsculas): pedido atribuído ao creator e à campanha
    const p1 = criarPedidoTeste(D, 'l1', { cupom: 'ana10', itens: [{ produtoId: 'l1-p1', quantidade: 1 }], freteCentavos: 1500, emailComprador: 'cliente@x.com', ufComprador: 'MG', pagar: true });
    const ped1 = D.pedidos.find((x) => x.id === p1.pedidoId)!;
    expect(ped1).toMatchObject({ creatorId: idA, campanhaId: k, estado: 'pago', descontoCentavos: 3899, baseComissaoCentavos: 35091 });
    // 12. comissão certa: 15% de 350,91 = 52,64; retenção 0 → liberada
    const cm1 = D.comissoes.find((c) => c.pedidoId === p1.pedidoId)!;
    expect(cm1).toMatchObject({ valorCentavos: 5264, taxaBps: 1500, status: 'liberada' });
    // 13. segunda compra cancelada: comissão estornada
    const p2 = criarPedidoTeste(D, 'l1', { cupom: 'ANA10', itens: [{ produtoId: 'l1-p2', quantidade: 2 }], freteCentavos: 0, emailComprador: 'c2@x.com', ufComprador: 'SP', pagar: true });
    cancelarOuDevolver(D, 'l1', p2.pedidoId, 'cancelar');
    expect(D.comissoes.find((c) => c.pedidoId === p2.pedidoId)!.status).toBe('estornada');
    // 14. paga: saldo zera e o creator vê o pagamento
    expect(saldoDoCreator(D, 'l1', idA)).toBe(5264);
    pagarCreator(D, 'l1', idA, 'pix', hoje, 'u-l1');
    expect(saldoDoCreator(D, 'l1', idA)).toBe(0);
    expect(D.pagamentos.some((pg) => pg.creatorId === idA && pg.valorCentavos === 5264)).toBe(true);
    // devolução depois de pago: estorno negativo entra no saldo
    cancelarOuDevolver(D, 'l1', p1.pedidoId, 'devolver');
    expect(saldoDoCreator(D, 'l1', idA)).toBe(-5264);
  });

  it('autocompra não gera comissão e cadastro repetido é recusado', () => {
    const D = novo();
    const marina = D.creators.find((c) => c.id === 'c1')!;
    const r = criarPedidoTeste(D, 'l1', { cupom: 'MARINA10', itens: [{ produtoId: 'l1-p1', quantidade: 1 }], freteCentavos: 0, emailComprador: marina.email, ufComprador: 'MG', pagar: true });
    expect(r).toMatchObject({ geraComissao: false, motivo: 'Autocompra' });
    expect(() => cadastrarCreator(D, 'atelie-jabuticaba', form({ email: marina.email }))).toThrow(/já participa/);
    expect(() => cadastrarCreator(D, 'bela-raiz', form({}))).toThrow(/fechadas/);
  });

  it('Weethub cria empresa sem repetir endereço', () => {
    const D = novo();
    criarEmpresa(D, { nome: 'Loja Nova', slug: 'Loja Nova', donoNome: 'Dona', donoEmail: 'dona@nova.com' });
    expect(D.lojas.at(-1)).toMatchObject({ slug: 'loja-nova', status: 'implantacao' });
    expect(() => criarEmpresa(D, { nome: 'X', slug: 'loja-nova', donoNome: 'D', donoEmail: 'x@x.com' })).toThrow(/endereço/);
  });
});
