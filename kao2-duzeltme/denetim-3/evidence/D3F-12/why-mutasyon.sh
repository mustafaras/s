#!/usr/bin/env bash
# D3F-12 · ünite why onay durumu (inceleme sayfası) mutasyon sınaması (yeniden üretilebilir; ağ yok, depoya yazmaz).
# HEAD $TMPDIR'e klonlanır; araç, test, metin kaynağı ve sayfalar ÇALIŞMA AĞACINDAKİ hâliyle klona kopyalanır.
#   bash kao2-duzeltme/denetim-3/evidence/D3F-12/why-mutasyon.sh
set -u
REPO="$(cd "$(dirname "$0")/../../../.." && pwd)"
TOOL=tools/kao2-curriculum-build.mjs
TEST=tests/kao/test_kao2_text_review.js
TEXTS=docs/kuran-ogreniyorum/kao2/content/texts.tr.json
S17=docs/kuran-ogreniyorum/kao2/inceleme/INCELEME-KAO2-17.md
FILES="$TOOL $TEST $TEXTS $S17 docs/kuran-ogreniyorum/kao2/inceleme/INCELEME-KAO2-18.md"
H="$(mktemp -d "${TMPDIR:-/tmp}/d3f12-mut.XXXXXX")"
BAD=0
fresh() { local d="$H/$1"; git clone -q "$REPO" "$d" && for f in $FILES; do cp "$REPO/$f" "$d/$f"; done; printf '%s' "$d"; }
mutate() { # mutate <dizin> <eski> <yeni>
  (cd "$1" && OLD="$2" NEW="$3" node -e "const fs=require('fs');const p='$TOOL';const s=fs.readFileSync(p,'utf8');
    if(!s.includes(process.env.OLD)){console.error('mutasyon noktası yok: '+process.env.OLD);process.exit(2)}
    fs.writeFileSync(p,s.split(process.env.OLD).join(process.env.NEW))")
}
expect() { # expect <ad> <PASS|FAIL> <dizin> [çıktıda aranacak metin]
  local out rc; out="$(cd "$3" && node "$TOOL" 2>&1 && node "$TEST" 2>&1)"; rc=$?
  local got=PASS; [ "$rc" -ne 0 ] && got=FAIL
  if [ "$got" = "$2" ] && { [ -z "${4:-}" ] || printf '%s' "$out" | grep -q -- "$4"; }; then echo "PASS  $1 → $got"
  else echo "FAIL  $1 → beklenen $2${4:+ (\"$4\")}, gelen $got"; printf '%s\n' "$out" | grep -E 'Error|FAIL|uyar' | sed 's/^/      /' | head -4; BAD=1; fi
}

# M0 · düzeltilmiş hâl
d=$(fresh M0); expect "M0 düzeltilmiş" PASS "$d" 'text review: PASS'

# M1 · Durum bölümündeki why sayımı kaldırılır (F-12'nin kendisi)
d=$(fresh M1); mutate "$d" "  lines.push(\`- Ünite \"Neden önemli\" (\\\`why\\\`) metni, ayrı onay:" "  void (\`- Ünite \"Neden önemli\" (\\\`why\\\`) metni, ayrı onay:" || BAD=1
expect "M1 Durum'da why sayımı yok" FAIL "$d" "why metninin onay durumunu saymıyor"

# M2 · ünite İnceleme satırındaki why düzeyi kaldırılır
d=$(fresh M2); mutate "$d" "\${u.why ? \` · neden önemli: \\\`\${whyLevel(u.review)}\\\`\` : ''}" "" || BAD=1
expect "M2 İnceleme satırında why düzeyi yok" FAIL "$d" "İnceleme satırında yok"

# M3 · veri türetimi: Ünite 1'in why'ı sourced yapılır → sayfa veriyi izler (draft 11 · sourced 1), test yeşil kalır
d=$(fresh M3); (cd "$d" && node -e "const fs=require('fs');const t=JSON.parse(fs.readFileSync('$TEXTS','utf8'));t.units['1'].review.whyReview.level='sourced';fs.writeFileSync('$TEXTS',JSON.stringify(t,null,2)+'\n')")
expect "M3 veri değişince sayfa izler" PASS "$d" 'text review: PASS'
grep -q '`draft` \*\*11\*\* · `sourced` \*\*1\*\*' "$d/$S17" && echo "PASS  M3 sayfa: draft 11 · sourced 1" || { echo "FAIL  M3 sayfa sayımı veriyi izlemedi"; BAD=1; }

rm -rf "$H"
[ "$BAD" = 0 ] && echo "d3f12 mutasyon: 5/5 PASS" || { echo "d3f12 mutasyon: FAIL"; exit 1; }
