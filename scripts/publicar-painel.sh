#!/usr/bin/env bash
# Publica o painel de acompanhamento (dashboard/) na Vercel, no projeto "weecrea-painel".
# Pré-requisito: vercel login. Rode na pasta do repositório.
# Quando o projeto estiver ligado ao GitHub (Root Directory = dashboard), cada push na main publica sozinho
# e este script vira só um atalho manual.
set -e
DEST=$(mktemp -d)
cp dashboard/index.html "$DEST/"
cp -r dashboard/api "$DEST/api"
cp -r dashboard/marca "$DEST/marca"
cp -r dashboard/fonte "$DEST/fonte"
cp modulos/modulos.json "$DEST/modulos.json"
cd "$DEST"
vercel link --yes --project weecrea-painel >/dev/null
vercel deploy --prod --yes
