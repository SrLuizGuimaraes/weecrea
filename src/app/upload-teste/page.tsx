// Página de teste do upload para o Blob (pronto do M1: um arquivo de 300 MB sobe).
import type { Metadata } from 'next';
import { usuarioAtual } from '@/lib/acesso';
import { redirect } from 'next/navigation';
import { TesteUpload } from './teste-upload';

export const metadata: Metadata = { title: 'Teste de upload · WEECREA' };

export default async function PaginaTesteUpload() {
  if (!(await usuarioAtual())) redirect('/entrar?voltar=/upload-teste');
  const configurado = !!process.env.BLOB_READ_WRITE_TOKEN;
  return (
    <main className="mx-auto max-w-lg space-y-4 p-6">
      <h1 className="text-2xl font-semibold">Teste de upload</h1>
      {!configurado && (
        <p className="rounded-lg bg-amber-100 px-3 py-2 text-sm text-amber-900">
          BLOB_READ_WRITE_TOKEN não está configurado neste ambiente: o envio vai falhar até a chave do Vercel Blob ser criada.
        </p>
      )}
      <TesteUpload />
    </main>
  );
}
