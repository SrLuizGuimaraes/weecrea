// Gera os guias de cada módulo a partir de modulos/modulos.json
// Uso: node scripts/gerar.mjs
import { readFileSync, writeFileSync, mkdirSync } from 'node:fs';
const { modulos } = JSON.parse(readFileSync('modulos/modulos.json', 'utf8'));
const nome = id => modulos.find(m => m.id === id)?.nome ?? id;

mkdirSync('scripts/issues', { recursive: true });
for (const m of modulos) {
  mkdirSync(`modulos/${m.pasta}`, { recursive: true });
  const recebe = m.recebe.length ? m.recebe.map(i => `${i.toUpperCase()} (${nome(i)})`).join(', ') : 'ninguém, você começa já';
  const entrega = m.entrega.map(i => (/^m\d+$/.test(i) ? `${i.toUpperCase()} (${nome(i)})` : i)).join(', ');
  const checklist = m.tarefas.map(t => `- [ ] ${t}`).join('\n');
  const guia = `# ${m.id.toUpperCase()}. ${m.nome}

**O que é:** ${m.oque}

**Pronto quando:** ${m.pronto}

**Você precisa de:** ${recebe}. Enquanto isso, use os dados de mentira em \`dados-exemplo/\`.

**Você entrega para:** ${entrega}.

## Checklist
Marque as caixinhas na **issue do seu módulo** no GitHub (o painel lê de lá).

${checklist}

## Regras
- Mexa só nesta pasta (\`modulos/${m.pasta}/\`). Precisa mudar algo de outro módulo? Peça na issue dele.
- Trabalhe na sua branch \`${m.id}-${m.pasta.split('-').slice(1).join('-')}\`.
- Terminou uma parte? Abra um Pull Request (veja \`docs/COMO-INTEGRAR.md\`).
`;
  writeFileSync(`modulos/${m.pasta}/README.md`, guia);
  writeFileSync(`scripts/issues/${m.id}.md`,
`**O que é:** ${m.oque}

**Pronto quando:** ${m.pronto}

**Precisa de:** ${recebe}
**Entrega para:** ${entrega}

Guia completo: \`modulos/${m.pasta}/README.md\`

## Checklist
${checklist}
`);
}
console.log(`${modulos.length} módulos gerados`);
