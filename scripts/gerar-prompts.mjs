// Gera docs/PROMPTS.md (um prompt por módulo) a partir de modulos/modulos.json
import { readFileSync, writeFileSync } from 'node:fs';
const { modulos } = JSON.parse(readFileSync('modulos/modulos.json', 'utf8'));
const telas = {
  m1:'(sem tela do protótipo; faça login e as 3 áreas vazias)',
  m2:'o estilo geral do protótipo (cores, botões, tabelas, abas, cartões, menu lateral, tema claro/escuro)',
  m3:'Loja > Conexões e Loja > Produtos e cupons',
  m4:'(sem tela; alimenta Painel e Financeiro)',
  m5:'Loja > Campanhas (abas Ativas, Futuras, Encerradas, Todas, Benefícios) e Creator > Campanhas',
  m6:'Loja > Configurações > Página de cadastro e Creator > Página de cadastro',
  m7:'Loja > Configurações (critérios) e Loja > Creators (abas Aprovação e Ativos)',
  m8:'Loja > Menções e Creator > Conteúdos',
  m9:'Loja > Painel e Creator > Início',
  m10:'Loja > Financeiro (Visão geral, Faturas, Carteira de creators) e Creator > Financeiro',
  m11:'toda a visão Weethub (Painel, Empresas, Creators, Receita)'
};
const nome = id => modulos.find(m => m.id === id)?.nome ?? id;
let out = `# Prompts por módulo

Como usar: instale o Claude Code (ou use o Claude), abra a pasta do projeto clonado (\`git clone https://github.com/SrLuizGuimaraes/weecrea\`), copie **só o prompt do seu módulo** e cole.
O protótipo (arquivo \`Weethub Creators, protótipo.html\`) não está no GitHub: peça o arquivo ao grupo e deixe-o aberto no navegador para comparar.

`;
for (const m of modulos) {
  const recebe = m.recebe.length ? m.recebe.map(i => `${i.toUpperCase()} (${nome(i)})`).join(', ') : 'ninguém';
  const entrega = m.entrega.map(i => (/^m\d+$/.test(i) ? `${i.toUpperCase()} (${nome(i)})` : i)).join(', ');
  out += `## ${m.id.toUpperCase()}. ${m.nome}

\`\`\`text
Você é meu par de programação no projeto WEECREA (plataforma para lojas Nuvemshop gerirem creators de UGC: campanhas, cupons, vídeos, comissões). Stack: Next.js (App Router) + TypeScript + Prisma + Postgres (Neon) + Vercel. Entrega em 02/12/2026.

Eu sou responsável SÓ pelo módulo ${m.id.toUpperCase()}: ${m.nome}.
Trabalhe somente na pasta modulos/${m.pasta}/ e na branch ${m.id}-${m.pasta.split('-').slice(1).join('-')}. Não altere pastas de outros módulos. Se precisar mudar algo de outro módulo ou de contratos/tipos.ts, pare e me avise.

Antes de começar, leia: README.md, docs/COMO-INTEGRAR.md, modulos/${m.pasta}/README.md, contratos/tipos.ts e dados-exemplo/dados.json.

O que é: ${m.oque}
Tela do protótipo para reproduzir: ${telas[m.id]}.
Pronto quando: ${m.pronto}
Eu dependo de: ${recebe}. Enquanto não existirem, use os dados de dados-exemplo/dados.json atrás de uma função simples que depois possa ser trocada pelo dado real.
Eu entrego para: ${entrega}. Exponha funções/rotas claras e documente em 5 linhas no README do módulo como usá-las.

Regras: use os tipos de contratos/tipos.ts; comissão só conta pedido PAGO (cancelado/devolvido estorna); nunca coloque senhas ou chaves no código (use variáveis de ambiente e .env.example); texto da interface em português do Brasil; use o visual do M2 quando existir.

Tarefas (marque na issue do GitHub conforme concluir):
${m.tarefas.map((t, i) => `${i + 1}. ${t}`).join('\n')}

Trabalhe uma tarefa por vez, explique em linguagem simples o que fez, rode o projeto para testar, faça commits pequenos e, ao fim de cada tarefa, me diga qual caixinha da issue marcar. Ao terminar uma parte, me ajude a abrir o Pull Request usando o modelo do repositório.
\`\`\`

`;
}
writeFileSync('docs/PROMPTS.md', out);
console.log('ok');
