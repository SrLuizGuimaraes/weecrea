// Gera os guias de cada módulo e o texto das issues a partir de modulos/modulos.json
// Uso: node scripts/gerar.mjs
// O prompt do Claude Code de cada módulo fica em docs/GUIA-CLAUDE.md (escrito à mão).
import { readFileSync, writeFileSync, mkdirSync } from 'node:fs';
const { modulos } = JSON.parse(readFileSync('modulos/modulos.json', 'utf8'));
const nome = id => modulos.find(m => m.id === id)?.nome ?? id;
const datas = { 1: 'sex 27/11', 2: 'dom 29/11', 3: 'seg 30/11' };

mkdirSync('scripts/issues', { recursive: true });
for (const m of modulos) {
  mkdirSync(`modulos/${m.pasta}`, { recursive: true });
  const recebe = m.recebe.length ? m.recebe.map(i => `${i.toUpperCase()} (${nome(i)})`).join(', ') : 'ninguém, você começa já';
  const entrega = m.entrega.map(i => (/^m\d+$/.test(i) ? `${i.toUpperCase()} (${nome(i)})` : i)).join(', ');
  const checklist = m.tarefas.map(t => `- [ ] ${t}`).join('\n');
  const branch = `${m.id}-${m.pasta.split('-').slice(1).join('-')}`;
  const juncao = m.juncao ? `Junção ${m.juncao} (${datas[m.juncao]})` : 'a combinar';
  const ID = m.id.toUpperCase();
  const guia = `# ${ID}. ${m.nome}

**O que é:** ${m.oque}

**Pronto quando:** ${m.pronto}

**Você precisa de:** ${recebe}. Enquanto isso, use os dados de mentira em \`dados-exemplo/\`.

**Você entrega para:** ${entrega}.

**Sua junção:** ${juncao}.

**Prompt para o Claude Code:** cole o *prompt base* e, logo abaixo, o bloco *${ID}* de [\`docs/GUIA-CLAUDE.md\`](../../docs/GUIA-CLAUDE.md). Lá estão as rotas e pastas que são suas, as tarefas em detalhe e as regras de negócio.

## Checklist
Marque as caixinhas na **issue do seu módulo** no GitHub (o painel lê de lá).

${checklist}

## Regras
- Mexa só nas suas rotas e pastas, listadas no bloco ${ID} do guia. Precisa mudar algo de outro módulo? Peça na issue dele.
- Trabalhe na sua branch \`${branch}\`.
- Terminou uma parte? Abra um Pull Request (veja \`docs/COMO-INTEGRAR.md\`).
`;
  writeFileSync(`modulos/${m.pasta}/README.md`, guia);
  writeFileSync(`scripts/issues/${m.id}.md`,
`**O que é:** ${m.oque}

**Pronto quando:** ${m.pronto}

**Precisa de:** ${recebe}
**Entrega para:** ${entrega}
**Junção:** ${juncao}
**Branch:** \`${branch}\`

Prompt e tarefas em detalhe: bloco ${ID} de \`docs/GUIA-CLAUDE.md\`
Guia do módulo: \`modulos/${m.pasta}/README.md\`

## Checklist
${checklist}
`);
}
console.log(`${modulos.length} módulos gerados`);
