# Como todo mundo se junta (guia para leigos)

## A ideia
Cada pessoa cuida de **um módulo**, numa **pasta própria**. Ninguém mexe na pasta do outro, então ninguém atrapalha ninguém. Para juntar tudo, existem 4 "pontes":

| Ponte | Onde fica | Para que serve |
|---|---|---|
| **Lista de módulos** | `modulos/modulos.json` | Diz quem precisa de quem. O painel lê daqui. |
| **Idioma comum** | `src/contratos/tipos.ts` | Todos descrevem pedido, creator, campanha etc. do mesmo jeito. |
| **Dados de mentira** | `dados-exemplo/dados.json` | Você trabalha sem esperar os outros. |
| **Issues + Pull Requests** | GitHub | A issue é sua lista de tarefas; o Pull Request é o "pronto, pode juntar". |

## Passo a passo do dia a dia
1. **Pegue sua issue** (ex.: "M5. Campanhas e benefícios") e coloque seu nome em *Assignees*.
2. **Baixe o projeto** uma vez: `git clone https://github.com/DONO/weecrea` (ou use o GitHub Desktop).
3. **Crie sua branch** (sua "cópia de trabalho"): `git checkout -b m5-campanhas`
4. **Trabalhe só na sua pasta** `modulos/m5-campanhas/`.
5. **Salve e envie**: `git add .` → `git commit -m "campanhas: lista pronta"` → `git push -u origin m5-campanhas`
6. **Marque a caixinha** da tarefa feita na sua issue. O painel sobe sozinho.
7. **Abra um Pull Request** quando uma parte estiver pronta. O M1 confere e junta.
8. **Travou?** Coloque o rótulo `travado` na sua issue e escreva o que falta. Ele aparece em vermelho no painel.

## Rótulos (etiquetas) da issue
- `fazendo`: você começou.
- `feito`: terminou (o painel também entende sozinho quando todas as caixinhas estão marcadas).
- `travado`: precisa de ajuda.

## Como ligar um módulo ao outro
- Precisa de dado de outro módulo (ex.: M9 precisa de pedidos do M4)? Leia de `dados-exemplo/dados.json` agora. Quando o M4 terminar, trocamos pelo real na junção do seu módulo: são três (27/11, 29/11 e 30/11), veja o calendário em `docs/GUIA-CLAUDE.md`.
- Precisa que outro módulo mude algo? Comente na issue dele.
- Precisa mudar `src/contratos/tipos.ts`? Abra Pull Request e avise todo mundo no grupo.

## O que NUNCA colocar no GitHub
Senhas, chaves da Nuvemshop, links secretos, PDFs internos da Weethub. O repositório é público.
