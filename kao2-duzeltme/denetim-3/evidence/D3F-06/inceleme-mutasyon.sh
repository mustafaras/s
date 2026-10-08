#!/usr/bin/env bash
# D3F-06 · inceleme sayfası "onayı kim verdi" mutasyon sınaması (yeniden üretilebilir; ağ yok, depoya yazmaz).
# HEAD $TMPDIR'e klonlanır; aracın, testin ve iki sayfanın ÇALIŞMA AĞACINDAKİ hâli klona kopyalanır. Her senaryo kendi
# klonunda aracı ya da veriyi bozar, sayfaları araçla yeniden üretir ve testi koşar. Beklenen sonuç tutmazsa çıkış 1.
#   bash kao2-duzeltme/denetim-3/evidence/D3F-06/inceleme-mutasyon.sh
set -u
REPO="$(cd "$(dirname "$0")/../../../.." && pwd)"
TOOL=tools/kao2-curriculum-build.mjs
TEST=tests/kao/test_kao2_text_review.js
TEXTS=docs/kuran-ogreniyorum/kao2/content/texts.tr.json
S17=docs/kuran-ogreniyorum/kao2/inceleme/INCELEME-KAO2-17.md
S18=docs/kuran-ogreniyorum/kao2/inceleme/INCELEME-KAO2-18.md
H="$(mktemp -d "${TMPDIR:-/tmp}/d3f06-mut.XXXXXX")"
BAD=0
fresh() { # fresh <ad> → klon yolu
  local d="$H/$1"
  git clone -q "$REPO" "$d" && for f in "$TOOL" "$TEST" "$S17" "$S18"; do cp "$REPO/$f" "$d/$f"; done
  printf '%s' "$d"
}
mutate() { # mutate <dizin> <dosya> <eski> <yeni> — eski metin bulunmazsa senaryo geçersizdir
  (cd "$1" && OLD="$3" NEW="$4" node -e "const fs=require('fs');const p=process.argv[1];const s=fs.readFileSync(p,'utf8');
    if(!s.includes(process.env.OLD)){console.error('mutasyon noktası yok: '+process.env.OLD);process.exit(2)}
    fs.writeFileSync(p,s.split(process.env.OLD).join(process.env.NEW))" "$2")
}
expect() { # expect <ad> <PASS|FAIL> <dizin> [çıktıda aranacak metin]
  local out rc; out="$(cd "$3" && node "$TOOL" 2>&1 && node "$TEST" 2>&1)"; rc=$?
  local got=PASS; [ "$rc" -ne 0 ] && got=FAIL
  if [ "$got" = "$2" ] && { [ -z "${4:-}" ] || printf '%s' "$out" | grep -q -- "$4"; }; then echo "PASS  $1 → $got"
  else echo "FAIL  $1 → beklenen $2${4:+ (\"$4\")}, gelen $got"; printf '%s\n' "$out" | grep -v '^PASS' | sed 's/^/      /' | head -8; BAD=1; fi
}

# M0 · düzeltilmiş araç: yeşil, işaret taşıma uyarısı yok
d=$(fresh M0); expect "M0 düzeltilmiş araç" PASS "$d"
(cd "$d" && node "$TOOL" 2>&1 | grep -q UYARI) && { echo "FAIL  M0 taşınamayan işaret uyarısı"; BAD=1; }

# M1 · sayfa düzeyi açıklama bölümü kaldırılır (F-06'nın kendisi)
d=$(fresh M1); mutate "$d" "$TOOL" "lines.push(...renderReviewAttribution(all.map((t) => t.review)));" "" || BAD=1
expect "M1 INCELEME-17 açıklamasız" FAIL "$d" 'INCELEME-KAO2-17.md: "Onayı kim verdi" bölümü yok'

# M2 · kavram sayfası (INCELEME-18) açıklamasız
d=$(fresh M2); mutate "$d" "$TOOL" "lines.push(...renderReviewAttribution(ids.map(" "void ((ids.map(" || BAD=1
expect "M2 INCELEME-18 açıklamasız" FAIL "$d" 'INCELEME-KAO2-18.md: "Onayı kim verdi" bölümü yok'

# M3 · kayıt başı etiket kaldırılır
d=$(fresh M3); mutate "$d" "$TOOL" "return review.by ? \` · \${review.by}\` : ' · onaylayan kayıtsız';" "return '';" || BAD=1
expect "M3 kayıt başı etiket yok" FAIL "$d" "satırı onaylayanı (ai-delegated) söylemiyor"

# M4 · devir satırı "yapay zekâ" demiyor
d=$(fresh M4); mutate "$d" "$TOOL" "kullanıcı değil, yetki devriyle yapay zekâ koydu" "devirle konuldu" || BAD=1
expect "M4 yapay zekâ ifadesi yok" FAIL "$d" "işareti yapay zekânın koyduğunu söylemiyor"

# M5 · eski çelişen "kutu onayı olmayan" dili geri gelir
d=$(fresh M5); mutate "$d" "$TOOL" "**senin kendi onayını taşımayan**" "**açık kutu onayı olmayan**" || BAD=1
expect "M5 çelişen dil" FAIL "$d" "kutu onayı yok"

# M6 · veri türetimi: u1 kullanıcının kendi onayına çevrilir → sayfa veriyi izler (owner 1, devir 132, u1 yeniden onay listesinde yok)
d=$(fresh M6)
(cd "$d" && node -e "const fs=require('fs');const p='$TEXTS';const t=JSON.parse(fs.readFileSync(p,'utf8'));const r=t.units['1'].review;
  r.by='owner';delete r.delegatedBy;delete r.delegatedAt;fs.writeFileSync(p,JSON.stringify(t,null,2)+'\n')" && node "$TOOL" >/dev/null 2>&1)
if grep -q -- '- `owner` (kullanıcının kendi kutu onayı): \*\*1\*\*' "$d/$S17" && grep -q -- '- `ai-delegated`: \*\*132\*\*' "$d/$S17" \
  && grep -q -- '- İnceleme: `sourced · owner`' "$d/$S17" && ! grep -q 'onayını taşımayan\*\* 133' "$d/$S17" \
  && grep 'onayını taşımayan\*\* 132 metin vardır: u01.01,' "$d/$S17" >/dev/null; then echo "PASS  M6 sayfa veriden türer (owner 1 / devir 132)"
else echo "FAIL  M6 sayfa veriyi izlemedi"; grep -n 'owner\|ai-delegated`:\|taşımayan' "$d/$S17" | head -5 | sed 's/^/      /'; BAD=1; fi

rm -rf "$H"
[ "$BAD" = 0 ] && echo "d3f06 mutasyon: 7/7 PASS" || { echo "d3f06 mutasyon: FAIL"; exit 1; }
