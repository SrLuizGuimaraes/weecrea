// Nova campanha. Dono: M5.
import { exigirLoja } from '@/lib/acesso';
import { FormCampanha } from '@/modulos/m5-campanhas/form-campanha';

export default async function NovaCampanha() {
  const { lojaId } = await exigirLoja();
  return <FormCampanha lojaId={lojaId} />;
}
