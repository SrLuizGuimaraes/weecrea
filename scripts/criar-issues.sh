#!/usr/bin/env bash
# Cria os rótulos e as 11 issues (uma por módulo) no GitHub. Rode UMA vez, na pasta do repositório.
# Pré-requisito: gh auth login  e  node scripts/gerar.mjs
set -e
for l in "modulo:5B3DF5" "fazendo:F0B050" "feito:0B7F53" "travado:D42A62"; do
  gh label create "${l%%:*}" --color "${l##*:}" --force >/dev/null
done
node -e '
const {modulos}=JSON.parse(require("fs").readFileSync("modulos/modulos.json","utf8"));
for(const m of modulos) console.log(m.id+"|"+m.nome);
' | while IFS='|' read -r id nome; do
  ID=$(echo "$id" | tr a-z A-Z)
  gh issue create --title "$ID. $nome" --label modulo --body-file "scripts/issues/$id.md"
done
