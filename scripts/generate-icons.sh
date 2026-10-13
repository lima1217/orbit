#!/usr/bin/env bash
# 由 scripts/icons/*.svg 生成 public/ 下的 favicon 与 PWA 图标
# 依赖：Google Chrome（headless 渲染 SVG）、ImageMagick（打包 .ico）
# 用法：bash scripts/generate-icons.sh
set -euo pipefail

ROOT="$(cd "$(dirname "$0")/.." && pwd)"
SRC="$ROOT/scripts/icons"
OUT="$ROOT/public"
CHROME="${CHROME:-/Applications/Google Chrome.app/Contents/MacOS/Google Chrome}"
TMP="$(mktemp -d)"
trap 'rm -rf "$TMP"' EXIT

# render <svg> <size> <out.png>
# 用一个只含该 SVG 的 HTML 页面截图，保证尺寸精确、背景透明
render() {
  local svg="$1" size="$2" out="$3"
  cat > "$TMP/page.html" <<HTML
<!doctype html><html><head><style>
html,body{margin:0;padding:0;background:transparent;overflow:hidden}
img{display:block;width:${size}px;height:${size}px}
</style></head><body><img src="file://$svg"></body></html>
HTML
  "$CHROME" --headless=new --disable-gpu --hide-scrollbars \
    --allow-file-access-from-files \
    --default-background-color=00000000 \
    --force-device-scale-factor=1 \
    --window-size="$size,$size" \
    --screenshot="$out" "file://$TMP/page.html" >/dev/null 2>&1
  echo "  $(basename "$out") ${size}×${size}"
}

echo "Rendering icons…"
render "$SRC/icon-small.svg" 16  "$TMP/favicon-16.png"
render "$SRC/icon-small.svg" 32  "$TMP/favicon-32.png"
render "$SRC/icon-small.svg" 48  "$TMP/favicon-48.png"
render "$SRC/icon-full.svg"  180 "$OUT/apple-touch-icon.png"
render "$SRC/icon-full.svg"  192 "$OUT/icon-192.png"
render "$SRC/icon-full.svg"  512 "$OUT/icon-512.png"

magick "$TMP/favicon-16.png" "$TMP/favicon-32.png" "$TMP/favicon-48.png" "$OUT/favicon.ico"
echo "  favicon.ico 16/32/48"

cp "$SRC/icon-small.svg" "$OUT/favicon.svg"
echo "  favicon.svg"
echo "Done."
