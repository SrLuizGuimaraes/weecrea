// Nova campanha. Dono: M5.
import { exigirLoja } from '@/lib/acesso';
import { carregarDadosLoja } from '@/lib/dados-reais';
import { ProvedorDados } from '@/lib/dados-reais-cliente';
import { hojeSP } from '@/lib/datas';
import { FormCampanha } from '@/modulos/m5-campanhas/form-campanha';

export default async function NovaCampanha() {
  const { lojaId } = await exigirLoja();
  const D = await carregarDadosLoja(lojaId, hojeSP());
  return <ProvedorDados D={D}><FormCampanha lojaId={lojaId} /></ProvedorDados>;
}
