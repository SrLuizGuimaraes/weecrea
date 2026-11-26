// Cartão vertical de vídeo (9:16). Dono: M2.
// <CartaoVideo miniaturaUrl=".." perfil="@marina" formato="reels" status="aprovado" selecao={{ name: 'videoIds', value: v.id }} />
import { Play } from 'lucide-react';
import type { ReactNode } from 'react';
import { EtiquetaStatus } from './etiquetas';

export function CartaoVideo({ miniaturaUrl, perfil, formato, rede, status, titulo, href, selecao, rodape }: {
  miniaturaUrl?: string; perfil?: string; formato?: string; rede?: string; status?: string; titulo?: string;
  href?: string; selecao?: { name: string; value: string; defaultChecked?: boolean; form?: string }; rodape?: ReactNode;
}) {
  return (
    <article className="group relative overflow-hidden rounded-cartao border border-borda bg-superficie">
      <div className="relative aspect-[9/16] bg-superficie-2">
        {miniaturaUrl ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={miniaturaUrl} alt={titulo ?? 'Miniatura do vídeo'} className="absolute inset-0 size-full object-cover" loading="lazy" />
        ) : (
          <div className="absolute inset-0 flex items-center justify-center text-suave"><Play size={32} /></div>
        )}
        <div className="absolute inset-x-0 top-0 z-10 flex items-start justify-between p-2">
          {selecao ? (
            <label className="rounded-md bg-black/50 p-1">
              <input type="checkbox" name={selecao.name} value={selecao.value} defaultChecked={selecao.defaultChecked} form={selecao.form}
                aria-label="Selecionar vídeo" className="size-4 accent-[var(--cor-destaque)]" />
            </label>
          ) : <span />}
          {status && <EtiquetaStatus status={status} />}
        </div>
        <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/70 to-transparent p-2 text-white">
          {perfil && <p className="truncate text-sm font-medium">{perfil}</p>}
          <p className="text-xs opacity-80">{[rede, formato].filter(Boolean).join(' · ')}</p>
        </div>
        {href && <a href={href} target="_blank" rel="noreferrer" className="absolute inset-0 z-0" aria-label="Abrir vídeo" />}
      </div>
      {rodape && <div className="relative z-10 p-2 text-xs">{rodape}</div>}
    </article>
  );
}
