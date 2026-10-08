#!/usr/bin/env bash
# D3F-15 · k2f-kanit-envanteri.mjs mutasyon sınaması (yeniden üretilebilir; ağ yok, depoya yazmaz).
# HEAD $TMPDIR'e klonlanır; betiğin, envanterin ve kayıtların ÇALIŞMA AĞACINDAKİ hâli klona kopyalanır.
# Her senaryo kendi klonunda bir dosyayı bozar ve betiği koşar. Beklenen sonuç ya da gerekçe tutmazsa çıkış 1;
# bir mutasyon noktası bulunamazsa (dosya değişmediyse) çıkış 2.
#   bash kao2-duzeltme/denetim-3/evidence/D3F-15/envanter-mutasyon.sh
set -u
REPO="$(cd "$(dirname "$0")/../../../.." && pwd)"
DIR=kao2-duzeltme/denetim-3/evidence/D3F-15
SCRIPT=$DIR/k2f-kanit-envanteri.mjs
LEDGER=kao2-duzeltme/.anti-amnesia/LEDGER.md
CURRENT=kao2-duzeltme/.anti-amnesia/CURRENT-STATE.md
H="$(mktemp -d "${TMPDIR:-/tmp}/d3f15-mut.XXXXXX")"
BAD=0
fresh() { # fresh <ad> → klon yolu
  local d="$H/$1"
  git clone -q "$REPO" "$d" && mkdir -p "$d/$DIR" && for f in "$SCRIPT" "$DIR/K2F-KANIT-ENVANTERI.md" "$LEDGER" "$CURRENT" kao2-duzeltme/FIX-STATE.json; do cp "$REPO/$f" "$d/$f"; done
  printf '%s' "$d"
}
mut() { # mut <dizin> <dosya> <aranan> <yerine> — düz metin, ilk eşleşme; değişmezse çıkış 2
  (cd "$1" && FROM="$3" TO="$4" node -e "const fs=require('fs');const p=process.argv[1];const t=fs.readFileSync(p,'utf8');const i=t.indexOf(process.env.FROM);if(i<0)process.exit(2);fs.writeFileSync(p,t.slice(0,i)+process.env.TO+t.slice(i+process.env.FROM.length))" "$2") \
    || { echo "MUTASYON NOKTASI YOK: $2 içinde \"$3\""; rm -rf "$H"; exit 2; }
}
expect() { # expect <ad> <PASS|FAIL> <dizin> [çıktıda aranacak metin]
  local out rc; out="$(cd "$3" && node "$SCRIPT" 2>&1)"; rc=$?
  local got=PASS; [ "$rc" -ne 0 ] && got=FAIL
  if [ "$got" = "$2" ] && { [ -z "${4:-}" ] || printf '%s' "$out" | grep -qF -- "$4"; }; then echo "PASS  $1 → $got"
  else echo "FAIL  $1 → beklenen $2${4:+ (\"$4\")}, gelen $got"; printf '%s\n' "$out" | grep -v '^PASS' | sed 's/^/      /' | head -6; BAD=1; fi
}

# M0 · düzeltilmiş kayıt yeşil
d=$(fresh M0); expect "M0 düzeltilmiş kayıt" PASS "$d"

# M1 · tarihsel KANIT'a sonradan oturum satırı yazılır (uydurma)
d=$(fresh M1); mut "$d" kao2-duzeltme/evidence/K2F-05/KANIT.md $'\n## ' $'\nOturum: uydurma\n\n## '
expect "M1 K2F-05'e sahte Oturum:" FAIL "$d" "beri değişmedi — kao2-duzeltme/evidence/K2F-05/KANIT.md"

# M2 · NOTE'taki sayı ölçümden saptı
d=$(fresh M2); mut "$d" "$LEDGER" '43/44 dosyada yok' '42/44 dosyada yok'
expect "M2 NOTE sayısı 42/44" FAIL "$d" 'FAIL  NOTE sayıları ölçümle aynı'

# M3 · NOTE bölümü eksik bir KANIT'ı anmıyor
d=$(fresh M3); mut "$d" "$LEDGER" ' · K2F-33 (Ölçümler, Bilerek değişen testler)' ''
expect "M3 NOTE K2F-33'ü anmıyor" FAIL "$d" 'anılmayan: K2F-33'

# M4 · envanter elle düzenlendi
d=$(fresh M4); mut "$d" "$DIR/K2F-KANIT-ENVANTERI.md" '| K2F-30 | Ölçümler |' '| K2F-30 | — |'
expect "M4 envanter elle düzenlendi" FAIL "$d" 'envanter bayat'

# M5 · araçtaki bölüm listesi değişti (betik listeyi araçtan okuyor mu?) → envanter artık bayat
d=$(fresh M5); mut "$d" kao2-duzeltme/denetim-2/tools/d2f-sync-check.mjs ", 'Sürprizler']" ']'
expect "M5 araçtan Sürprizler düştü" FAIL "$d" 'envanter bayat'

# M6 · FIX-STATE.ledgerLastSeq geri alındı (127)
d=$(fresh M6); mut "$d" kao2-duzeltme/FIX-STATE.json '"ledgerLastSeq": 128' '"ledgerLastSeq": 127'
expect "M6 ledgerLastSeq 127" FAIL "$d" 'ledgerLastSeq 127'

# M7 · CURRENT-STATE fix-sync-check satırı bayat
d=$(fresh M7); mut "$d" "$CURRENT" 'PASS (44/44 · seq 128)' 'PASS (44/44 · seq 127)'
expect "M7 Canlı gerçekler seq 127" FAIL "$d" 'satırdaki seq 127'

# M8 · CURRENT-STATE d2f-sync-check satırı bayat (D3F-15 öncesi değer)
d=$(fresh M8); mut "$d" "$CURRENT" 'PASS (16/16 · seq 29' 'PASS (16/16 · seq 25'
expect "M8 d2f satırı seq 25" FAIL "$d" 'satırdaki seq 25'

# M9 · NOTE kaydı F-15'e bağlı değil
d=$(fresh M9); mut "$d" "$LEDGER" '(denetim-3 F-15)' '(denetim-3)'
expect "M9 NOTE başlığı F-15'i anmıyor" FAIL "$d" 'NOTE yok'

rm -rf "$H"
[ "$BAD" = 0 ] && echo "d3f15 mutasyon: 10/10 PASS" || { echo "d3f15 mutasyon: FAIL"; exit 1; }
