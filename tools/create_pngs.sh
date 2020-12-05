#!/bin/sh

rsvg-convert -v > /dev/null 2>&1 || { echo "rsvg-convert is not installed, use: brew install librsvg." >&2; exit 1; }
outdir=assets
outfile=src/images_generated.ts

echo "" > $outfile

for filePath in $(find svg -name '*.svg'); do
  pathNoExt="${filePath%.*}"
  echo $filePath 
  rsvg-convert $filePath -o "${outdir}/${pathNoExt}.png"
  rsvg-convert $filePath -x 2 -y 2 -o "${outdir}/${pathNoExt}@2x.png"
  rsvg-convert $filePath -x 3 -y 3 -o "${outdir}/${pathNoExt}@3x.png"
  echo "export const $(echo $pathNoExt | sed "s/svg\///g" | sed "s/-/_/g" | tr '[:lower:]' '[:upper:]')=require(\"../${outdir}/${pathNoExt}.png\")" >> $outfile
done
