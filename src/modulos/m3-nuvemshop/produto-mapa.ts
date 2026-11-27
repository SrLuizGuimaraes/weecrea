// Tradução do produto da Nuvemshop para o nosso formato (M3). Função pura, com testes.
import { centavosDe, textoI18n } from './cliente';

export interface ProdutoApi {
  id: number; name?: unknown; categories?: { name?: unknown }[]; images?: { src?: string }[];
  variants?: { price?: string | number | null; promotional_price?: string | number | null }[];
}

/** Preço = o da primeira variante (a documentação traz price como texto "123.45"). */
export function mapearProduto(p: ProdutoApi) {
  return {
    nuvemshopId: p.id,
    nome: textoI18n(p.name).trim() || `Produto ${p.id}`,
    categoria: textoI18n(p.categories?.[0]?.name).trim() || null,
    precoCentavos: centavosDe(p.variants?.[0]?.price),
    imagemUrl: p.images?.[0]?.src ?? null,
  };
}
