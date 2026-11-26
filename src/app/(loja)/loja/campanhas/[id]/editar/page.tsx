// Editar campanha. Dono: M5.
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { CabecalhoPagina } from '@/componentes';
import { exigirLoja } from '@/lib/acesso';
import { FormCampanha } from '@/modulos/m5-campanhas/form-campanha';
import { campanhaDaLoja, opcoesDoFormulario } from '@/modulos/m5-campanhas/dados';

export default async function EditarCampanha({ params }: { params: Promise<{ id: string }> }) {
  const { lojaId } = await exigirLoja();
  const { id } = await params;
  const k = campanhaDaLoja(lojaId, id);
  if (!k) notFound();
  const o = opcoesDoFormulario(lojaId);
  return (
    <>
      <CabecalhoPagina titulo={`Editar: ${k.campanha.nome}`} voltar={<Link href={`/loja/campanhas/${id}`}>← Voltar para a campanha</Link>} />
      <FormCampanha campanha={k.campanha} produtos={o.produtos} beneficios={o.beneficios} />
    </>
  );
}
