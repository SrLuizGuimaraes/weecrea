'use client';
// Formulário público de cadastro do creator. Dono: M6.
// Por enquanto simula o resultado (aprovado com cupom ou em análise) com os critérios da loja; não grava nada.
import { useState } from 'react';
import { CheckCircle2, Clock } from 'lucide-react';
import type { CriteriosAprovacao } from '@/contratos/tipos';
import { AreaTexto, Botao, CaixaSelecao, Campo, Selecao } from '@/componentes';
import { BotaoCopiar } from '@/componentes/em-breve';

const UFS = 'AC AL AP AM BA CE DF ES GO MA MT MS MG PA PB PR PE PI RJ RN RS RO RR SC SP SE TO'.split(' ');
const SEGMENTOS = ['Moda', 'Beleza', 'Lifestyle', 'Casa', 'Decoração', 'Fitness', 'Gastronomia', 'Maternidade', 'Pets', 'Tecnologia'];

type Resultado = { tipo: 'aprovado'; cupom: string } | { tipo: 'analise'; motivo: string };

function maiorDeIdade(nascimento: string) {
  const d = new Date(`${nascimento}T12:00:00`);
  const limite = new Date(); limite.setFullYear(limite.getFullYear() - 18);
  return d <= limite;
}

export function FormCadastro({ lojaNome, desconto, criterios }: { lojaNome: string; desconto: number; criterios: CriteriosAprovacao }) {
  const [resultado, setResultado] = useState<Resultado | null>(null);
  const [erro, setErro] = useState<string | null>(null);
  const [segmentos, setSegmentos] = useState<string[]>([]);

  function enviar(form: FormData) {
    setErro(null);
    if (form.get('site')) return; // campo isca contra robôs
    const ig = Number(form.get('igSeguidores') || 0), tt = Number(form.get('ttSeguidores') || 0);
    const bio = String(form.get('bio') ?? '');
    if (!form.get('igPerfil') && !form.get('ttPerfil')) return setErro('Informe ao menos um perfil, do Instagram ou do TikTok.');
    if (!maiorDeIdade(String(form.get('nascimento')))) return setErro('O cadastro é só para maiores de 18 anos.');
    if (bio.length < 30 || bio.length > 500) return setErro('Fale sobre você em 30 a 500 caracteres.');
    if (segmentos.length < 1 || segmentos.length > 3) return setErro('Escolha de 1 a 3 segmentos.');
    const seguidores = Math.max(criterios.redesAceitas.includes('instagram') ? ig : 0, criterios.redesAceitas.includes('tiktok') ? tt : 0);
    const falhas = [
      ...(seguidores < criterios.seguidoresMin ? [`Seguidores abaixo do mínimo de ${criterios.seguidoresMin.toLocaleString('pt-BR')}`] : []),
      ...(criterios.segmentosAceitos.length && !segmentos.some((s) => criterios.segmentosAceitos.includes(s)) ? ['Segmento fora do perfil da loja'] : []),
      ...(criterios.exigeTerProduto && !form.get('temProduto') ? ['A loja pede que você já tenha o produto'] : []),
    ];
    if (criterios.aprovacaoAutomatica && !falhas.length) {
      const nome = String(form.get('nome')).trim().split(/\s+/)[0]!.normalize('NFD').replace(/[̀-ͯ]/g, '').toUpperCase().replace(/[^A-Z]/g, '').slice(0, 12);
      setResultado({ tipo: 'aprovado', cupom: `${nome || 'CREATOR'}${desconto}` });
    } else {
      setResultado({ tipo: 'analise', motivo: falhas[0] ?? 'A loja analisa cada cadastro.' });
    }
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  if (resultado) {
    return resultado.tipo === 'aprovado' ? (
      <div className="space-y-4 rounded-2xl border border-borda bg-superficie p-6 text-center">
        <CheckCircle2 size={40} className="mx-auto text-sucesso" />
        <h2 className="text-xl font-semibold">Você foi aprovada(o)!</h2>
        <p className="text-sm text-suave">Seu cupom exclusivo da {lojaNome}:</p>
        <p className="font-mono text-3xl font-bold tracking-wider">{resultado.cupom}</p>
        <BotaoCopiar texto={resultado.cupom} rotulo="Copiar cupom" />
        <p className="text-sm text-suave">Enviamos um e-mail com o link para você definir a senha e ver as campanhas. (Simulação: nada foi gravado.)</p>
      </div>
    ) : (
      <div className="space-y-3 rounded-2xl border border-borda bg-superficie p-6 text-center">
        <Clock size={40} className="mx-auto text-aviso" />
        <h2 className="text-xl font-semibold">Cadastro em análise</h2>
        <p className="text-sm">A {lojaNome} vai olhar o seu perfil e você recebe a resposta por e-mail.</p>
        <p className="text-xs text-suave">(Simulação: nada foi gravado.)</p>
      </div>
    );
  }

  return (
    <form method="post" onSubmit={(e) => { e.preventDefault(); enviar(new FormData(e.currentTarget)); }} className="space-y-4">
      {erro && <p role="alert" className="rounded-lg bg-perigo-fraco px-3 py-2 text-sm text-perigo">{erro}</p>}
      <input type="text" name="site" tabIndex={-1} autoComplete="off" className="hidden" aria-hidden="true" />
      <Campo rotulo="Nome completo" name="nome" required autoComplete="name" />
      <Campo rotulo="E-mail" name="email" type="email" required autoComplete="email" ajuda="Se você já tem cadastro em outra loja, use o mesmo e-mail." />
      <div className="grid grid-cols-2 gap-3">
        <Campo rotulo="WhatsApp" name="whatsapp" type="tel" required placeholder="(11) 99999-9999" autoComplete="tel" />
        <Campo rotulo="Nascimento" name="nascimento" type="date" required />
      </div>
      <div className="grid grid-cols-[96px_1fr] gap-3">
        <Selecao rotulo="UF" name="uf" required defaultValue=""><option value="" disabled>UF</option>{UFS.map((u) => <option key={u}>{u}</option>)}</Selecao>
        <Campo rotulo="Cidade" name="cidade" required />
      </div>
      <fieldset className="space-y-3 rounded-xl border border-borda p-3">
        <legend className="px-1 text-sm font-medium">Redes (ao menos uma)</legend>
        <div className="grid grid-cols-[1fr_120px] gap-3">
          <Campo rotulo="Instagram" name="igPerfil" placeholder="@seuperfil" />
          <Campo rotulo="Seguidores" name="igSeguidores" type="number" min="0" />
          <Campo rotulo="TikTok" name="ttPerfil" placeholder="@seuperfil" />
          <Campo rotulo="Seguidores" name="ttSeguidores" type="number" min="0" />
        </div>
      </fieldset>
      <AreaTexto rotulo="Fale sobre você" name="bio" required minLength={30} maxLength={500} rows={4} ajuda="De 30 a 500 caracteres: que conteúdo você cria e para quem." />
      <fieldset>
        <legend className="mb-2 text-sm font-medium">Segmentos (1 a 3)</legend>
        <div className="flex flex-wrap gap-2">
          {SEGMENTOS.map((s) => {
            const ativo = segmentos.includes(s);
            return (
              <button type="button" key={s} aria-pressed={ativo}
                onClick={() => setSegmentos(ativo ? segmentos.filter((x) => x !== s) : segmentos.length < 3 ? [...segmentos, s] : segmentos)}
                className={`rounded-full border px-3 py-1 text-sm ${ativo ? 'border-texto bg-texto text-fundo' : 'border-borda bg-superficie'}`}>{s}</button>
            );
          })}
        </div>
      </fieldset>
      <CaixaSelecao name="temProduto" rotulo={`Já tenho produto da ${lojaNome}`} />
      <Campo rotulo="Sua foto" name="foto" type="file" accept="image/*" />
      <CaixaSelecao name="termos" required rotulo="Li e aceito os termos de participação e a política de privacidade" />
      <Botao type="submit" largo tamanho="g">Quero participar</Botao>
    </form>
  );
}
