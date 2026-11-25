// Autoriza o upload direto do navegador para o Vercel Blob. Dono: M1.
// O arquivo NÃO passa por aqui: esta rota só entrega um token de curta duração.
// Quem usa: enviarArquivo() de src/lib/upload-cliente.ts.
import { handleUpload, type HandleUploadBody } from '@vercel/blob/client';
import { NextResponse } from 'next/server';
import { usuarioAtual } from '@/lib/acesso';
import { PASTAS_UPLOAD, pastaDoCaminho } from '@/lib/blob-config';

export async function POST(request: Request): Promise<NextResponse> {
  if (!process.env.BLOB_READ_WRITE_TOKEN) {
    return NextResponse.json({ error: 'Upload indisponível: BLOB_READ_WRITE_TOKEN não configurado.' }, { status: 503 });
  }
  const body = (await request.json()) as HandleUploadBody;
  try {
    const resposta = await handleUpload({
      body,
      request,
      onBeforeGenerateToken: async (caminho) => {
        const usuario = await usuarioAtual();
        if (!usuario) throw new Error('Entre na sua conta para enviar arquivos.');
        const pasta = pastaDoCaminho(caminho);
        if (!pasta) throw new Error('Pasta de upload não permitida.');
        if (pasta === 'testes' && usuario.perfil !== 'WEETHUB' && process.env.NODE_ENV === 'production') {
          throw new Error('Pasta de testes só para a Weethub.');
        }
        const { tipos, maxBytes } = PASTAS_UPLOAD[pasta];
        return {
          allowedContentTypes: [...tipos],
          maximumSizeInBytes: maxBytes,
          addRandomSuffix: true,
          validUntil: Date.now() + 2 * 3600_000, // 2 horas: dá tempo de subir vídeos grandes no 4G
          tokenPayload: JSON.stringify({ usuarioId: usuario.id, perfil: usuario.perfil }),
        };
      },
      // Chamado pela Vercel depois do upload (não funciona em localhost). Os módulos gravam a URL
      // no banco pela resposta do upload no navegador; aqui só registramos.
      onUploadCompleted: async ({ blob, tokenPayload }) => {
        console.info('[upload] concluído', blob.pathname, tokenPayload);
      },
    });
    return NextResponse.json(resposta);
  } catch (e) {
    return NextResponse.json({ error: e instanceof Error ? e.message : 'Falha no upload' }, { status: 400 });
  }
}
