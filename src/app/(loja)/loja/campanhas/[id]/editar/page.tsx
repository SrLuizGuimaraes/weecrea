// Editar campanha. Dono: M5.
import { exigirLoja } from '@/lib/acesso';
import { FormCampanha } from '@/modulos/m5-campanhas/form-campanha';

export default async function EditarCampanha({ params }: { params: Promise<{ id: string }> }) {
  const { lojaId } = await exigirLoja();
  const { id } = await params;
  return <FormCampanha lojaId={lojaId} campanhaId={id} />;
}
