#!/bin/sh
# Builds the Chrome Web Store upload: only the files the extension needs.
set -e
cd "$(dirname "$0")/.."
version=$(sed -n 's/.*"version": *"\([^"]*\)".*/\1/p' manifest.json)
mkdir -p dist
out="dist/discuss-on-hn-$version.zip"
rm -f "$out"
zip -qr "$out" manifest.json background.js overlay.js icons -x '.*'
echo "$out"
unzip -l "$out"
