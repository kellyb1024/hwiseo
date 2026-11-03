#!/bin/zsh
# 카드 HTML → PNG (시스템 Chrome headless)
cd "${0:A:h}"
for f in card-*.html; do
  "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome" --headless=new --disable-gpu --hide-scrollbars --force-device-scale-factor=1 \
    --window-size=1080,1350 --virtual-time-budget=6000 --screenshot="$PWD/${f%.html}.png" "file://$PWD/$f" 2>/dev/null
done
