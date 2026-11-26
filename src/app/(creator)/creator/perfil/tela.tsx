'use client';
// Perfil do creator (tela do protótipo). Estado da demonstração.
import { useState } from 'react';
import { AreaTexto, Avatar, Botao, CabecalhoPagina, Campo, Cartao, Selecao } from '@/componentes';
import { useDemo } from '@/lib/demo/estado';
import { atualizarPerfil } from '@/modulos/m6-cadastro/acoes';

const UFS = 'AC AL AP AM BA CE DF ES GO MA MT MS MG PA PB PR PE PI RJ RN RS RO RR SC SP SE TO'.split(' ');
const SEGMENTOS = ['Moda', 'Beleza', 'Lifestyle', 'Casa', 'Decoração', 'Fitness', 'Gastronomia', 'Maternidade', 'Pets', 'Tecnologia', 'Dia a dia', 'Viagem'];

export function TelaPerfil({ creatorId }: { creatorId: string }) {
  const { D, mudar } = useDemo();
  const c = D.creators.find((x) => x.id === creatorId)!;
  const [segmentos, setSegmentos] = useState<string[]>(c.segmentos);
  const rede = (f: FormData, r: string) => {
    const perfil = String(f.get(`${r}Perfil`) ?? '').replace(/^@/, '').trim();
    return perfil ? { perfil, seguidores: Number(f.get(`${r}Seguidores`) || 0) } : undefined;
  };
  return (
    <>
      <CabecalhoPagina titulo="Perfil" descricao="É o que as lojas veem quando você se candidata." />
      <form key={JSON.stringify(c)} className="grid gap-4 lg:grid-cols-[1fr_2fr]" onSubmit={(e) => {
        e.preventDefault();
        const f = new FormData(e.currentTarget);
        mudar((d) => atualizarPerfil(d, creatorId, {
          nome: String(f.get('nome')), whatsapp: String(f.get('whatsapp')), uf: String(f.get('uf')), cidade: String(f.get('cidade')),
          bio: String(f.get('bio')), segmentos, instagram: rede(f, 'ig'), tiktok: rede(f, 'tt'),
        }), 'Perfil salvo');
      }}>
        <Cartao>
          <div className="flex flex-col items-center gap-2 text-center">
            <Avatar nome={c.nome} tamanho={72} />
            <p className="font-semibold">{c.nome}</p>
            <p className="text-sm text-suave">{c.email}</p>
            <p className="text-xs text-suave">O e-mail é o seu login e não muda por aqui.</p>
          </div>
        </Cartao>
        <Cartao titulo="Seus dados">
          <div className="grid gap-4 sm:grid-cols-2">
            <Campo rotulo="Nome" name="nome" required defaultValue={c.nome} />
            <Campo rotulo="WhatsApp" name="whatsapp" required defaultValue={c.whatsapp} />
            <Selecao rotulo="UF" name="uf" defaultValue={c.uf} opcoes={UFS.map((u) => ({ valor: u, rotulo: u }))} />
            <Campo rotulo="Cidade" name="cidade" required defaultValue={c.cidade} />
            <Campo rotulo="Instagram" name="igPerfil" defaultValue={c.instagram?.perfil} placeholder="@seuperfil" />
            <Campo rotulo="Seguidores no Instagram" name="igSeguidores" type="number" min="0" defaultValue={c.instagram?.seguidores} />
            <Campo rotulo="TikTok" name="ttPerfil" defaultValue={c.tiktok?.perfil} placeholder="@seuperfil" />
            <Campo rotulo="Seguidores no TikTok" name="ttSeguidores" type="number" min="0" defaultValue={c.tiktok?.seguidores} />
            <AreaTexto rotulo="Fale sobre você" name="bio" required minLength={30} maxLength={500} defaultValue={c.bio} className="sm:col-span-2" ajuda="De 30 a 500 caracteres." />
            <fieldset className="sm:col-span-2">
              <legend className="mb-2 text-sm font-medium">Segmentos (1 a 3)</legend>
              <div className="flex flex-wrap gap-2">
                {SEGMENTOS.map((s) => {
                  const ativo = segmentos.includes(s);
                  return <button type="button" key={s} aria-pressed={ativo} onClick={() => setSegmentos(ativo ? segmentos.filter((x) => x !== s) : segmentos.length < 3 ? [...segmentos, s] : segmentos)}
                    className={`rounded-full border px-3 py-1 text-sm ${ativo ? 'border-texto bg-texto text-fundo' : 'border-borda bg-superficie'}`}>{s}</button>;
                })}
              </div>
            </fieldset>
          </div>
          <div className="mt-4 flex justify-end"><Botao type="submit">Salvar perfil</Botao></div>
        </Cartao>
      </form>
    </>
  );
}
