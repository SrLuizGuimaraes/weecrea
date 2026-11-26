// Nova campanha. Dono: M5.
import Link from 'next/link';
import { CabecalhoPagina } from '@/componentes';
import { exigirLoja } from '@/lib/acesso';
import { FormCampanha } from '@/modulos/m5-campanhas/form-campanha';
import { opcoesDoFormulario } from '@/modulos/m5-campanhas/dados';

export default async function NovaCampanha() {
  const { lojaId } = await exigirLoja();
  const o = opcoesDoFormulario(lojaId);
  return (
    <>
      <CabecalhoPagina titulo="Nova campanha" voltar={<Link href="/loja/campanhas">← Campanhas</Link>} />
      <FormCampanha produtos={o.produtos} beneficios={o.beneficios} />
    </>
  );
}
