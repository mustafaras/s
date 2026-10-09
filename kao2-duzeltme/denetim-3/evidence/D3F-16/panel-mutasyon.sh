#!/usr/bin/env bash
# D3F-16 · okuyucu anlam paneli (role=region + aria-live, disclosure odağı) mutasyon sınaması (ağ yok, depoya yazmaz).
# HEAD $TMPDIR'e klonlanır; quranLearn.js ve iki test ÇALIŞMA AĞACINDAKİ hâliyle klona kopyalanır.
#   bash kao2-duzeltme/denetim-3/evidence/D3F-16/panel-mutasyon.sh
set -u
REPO="$(cd "$(dirname "$0")/../../../.." && pwd)"
SRC=app/core/quranLearn.js
A11Y=tests/kao/test_kao2_a11y.js
READER=tests/kao/test_kao2_reader.js
H="$(mktemp -d "${TMPDIR:-/tmp}/d3f16-mut.XXXXXX")"
BAD=0; N=0
fresh() { local d="$H/$1"; git clone -q "$REPO" "$d" && for f in "$SRC" "$A11Y" "$READER"; do cp "$REPO/$f" "$d/$f"; done; printf '%s' "$d"; }
mutate() { # mutate <dizin> <eski> <yeni>
  (cd "$1" && OLD="$2" NEW="$3" node -e "const fs=require('fs');const p='$SRC';const s=fs.readFileSync(p,'utf8');
    if(!s.includes(process.env.OLD)){console.error('mutasyon noktası yok: '+process.env.OLD);process.exit(2)}
    fs.writeFileSync(p,s.split(process.env.OLD).join(process.env.NEW))") || { echo "mutasyon noktası yok — betik eski"; rm -rf "$H"; exit 2; }
}
expect() { # expect <ad> <test> <PASS|FAIL> <dizin> [çıktıda aranacak metin]
  N=$((N+1))
  local out rc; out="$(cd "$4" && node "$2" 2>&1)"; rc=$?
  local got=PASS; [ "$rc" -ne 0 ] && got=FAIL
  if [ "$got" = "$3" ] && { [ -z "${5:-}" ] || printf '%s' "$out" | grep -q -- "$5"; }; then echo "PASS  $1 → $got"
  else echo "FAIL  $1 → beklenen $3${5:+ (\"$5\")}, gelen $got"; printf '%s\n' "$out" | grep -E 'Error|FAIL' | sed 's/^/      /' | head -4; BAD=1; fi
}

# M0 · düzeltilmiş hâl: iki test de yeşil
d=$(fresh M0); expect "M0 düzeltilmiş (a11y)" "$A11Y" PASS "$d" 'kontrol PASS'
expect "M0 düzeltilmiş (okuyucu)" "$READER" PASS "$d" 'KAO2 reader: PASS'

# M1 · F-16'nın kendisi: panel yeniden role=dialog → matris kuralı (h) iki diyalog görür; okuyucu testi bölge ister
d=$(fresh M1); mutate "$d" 'role="region" aria-live="polite" aria-label="Kelime anlamı"' 'role="dialog" aria-label="Kelime anlamı"'
expect "M1 role=dialog (a11y matrisi)" "$A11Y" FAIL "$d" 'anlam-paneli: diyalog kabuğu: 2 adet'
expect "M1 role=dialog (okuyucu)" "$READER" FAIL "$d" 'panel erişilebilir bölge'

# M2 · kelimeye dokununca odak geri verilmez (yeniden çizim düğmeyi siler, odak gövdeye düşer)
d=$(fresh M2); mutate "$d" 'if(shown) kaoReaderFocusWord(ui.kaoReaderWord);' ''
expect "M2 açılışta odak dönmez" "$A11Y" FAIL "$d" 'yeniden çizimden sonra odak açan kelimeye dönmedi'

# M3 · "Kapat" sonrası odak açan kelimeye dönmez
d=$(fresh M3); mutate "$d" 'kaoReaderFocusWord(opened);' ''
expect "M3 kapanışta odak dönmez" "$A11Y" FAIL "$d" 'sonrası odak açan kelimeye dönmedi'

# M4 · açan düğme panele bağlanmaz (aria-controls yok)
d=$(fresh M4); mutate "$d" ' aria-expanded="true" aria-controls="kao-reader-panel"' ' aria-expanded="true"'
expect "M4 aria-controls yok" "$A11Y" FAIL "$d" 'açan düğme panele bağlı değil'

# M5 · panel kimliği yok → aria-controls kırık hedef (genel matris kuralı c yakalar)
d=$(fresh M5); mutate "$d" '<section id="kao-reader-panel" class="kao-reader-panel"' '<section class="kao-reader-panel"'
expect "M5 kırık aria-controls hedefi" "$A11Y" FAIL "$d" 'aria-controls hedefi yok: kao-reader-panel'

# M6 · canlı bölge kalkar (bölge kalır)
d=$(fresh M6); mutate "$d" 'role="region" aria-live="polite" aria-label="Kelime anlamı"' 'role="region" aria-label="Kelime anlamı"'
expect "M6 aria-live yok (a11y)" "$A11Y" FAIL "$d" 'panel aria-live=polite değil'
expect "M6 aria-live yok (okuyucu)" "$READER" FAIL "$d" 'panel erişilebilir bölge'

# M7 · kelime düğmesinin kimliği yok → odak dönüş hedefi bulunamaz
d=$(fresh M7); mutate "$d" "id=\"kao-reader-w-'+index+'\" " ''
expect "M7 düğme kimliği yok" "$A11Y" FAIL "$d" 'açan kelime düğmesinin kimliği yok'

rm -rf "$H"
[ "$BAD" = 0 ] && echo "d3f16 mutasyon: $N/$N PASS" || { echo "d3f16 mutasyon: FAIL"; exit 1; }
