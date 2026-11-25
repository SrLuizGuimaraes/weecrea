#!/usr/bin/env bash
# Atualiza o título e o texto das 11 issues que já existem no GitHub, a partir de scripts/issues/.
# Use depois de mudar modulos/modulos.json e rodar: node scripts/gerar.mjs
# Pré-requisito: gh auth login (com permissão de escrita no repositório)
# Atenção: o texto da issue é substituído, então caixinhas já marcadas voltam a ficar vazias.
set -e
node -e '
const {modulos}=JSON.parse(require("fs").readFileSync("modulos/modulos.json","utf8"));
for(const m of modulos) console.log(m.id+"|"+m.nome);
' | while IFS='|' read -r id nome; do
  ID=$(echo "$id" | tr a-z A-Z)
  num=$(gh issue list --label modulo --state all --limit 100 --json number,title \
        --jq ".[] | select(.title | test(\"^${ID}\\.\"; \"i\")) | .number" | head -1)
  if [ -n "$num" ]; then
    gh issue edit "$num" --title "$ID. $nome" --body-file "scripts/issues/$id.md"
    echo "$ID: issue #$num atualizada"
  else
    echo "$ID: issue não encontrada (rode scripts/criar-issues.sh)"
  fi
done
