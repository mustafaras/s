#!/usr/bin/env bash
# D3F-09 · inceleme damgası ↔ metin değişimi ve --apply-review mutasyon sınaması (yeniden üretilebilir; ağ yok, depoya yazmaz).
# HEAD $TMPDIR'e klonlanır; araç, iki test, metin kaynağı, sayfalar ve modül ÇALIŞMA AĞACINDAKİ hâliyle klona kopyalanır.
#   bash kao2-duzeltme/denetim-3/evidence/D3F-09/damga-mutasyon.sh
set -u
REPO="$(cd "$(dirname "$0")/../../../.." && pwd)"
TOOL=tools/kao2-curriculum-build.mjs
TR=tests/kao/test_kao2_text_review.js
TA=tests/kao/test_kao2_review_apply.js
TEXTS=docs/kuran-ogreniyorum/kao2/content/texts.tr.json
FILES="$TOOL $TR $TA $TEXTS docs/kuran-ogreniyorum/kao2/inceleme/INCELEME-KAO2-17.md docs/kuran-ogreniyorum/kao2/inceleme/INCELEME-KAO2-18.md app/content/quranCurriculumV2.js"
H="$(mktemp -d "${TMPDIR:-/tmp}/d3f09-mut.XXXXXX")"
BAD=0
fresh() { local d="$H/$1"; git clone -q "$REPO" "$d" && for f in $FILES; do cp "$REPO/$f" "$d/$f"; done; printf '%s' "$d"; }
mutate() { # mutate <dizin> <dosya> <eski> <yeni>
  (cd "$1" && OLD="$3" NEW="$4" node -e "const fs=require('fs');const p=process.argv[1];const s=fs.readFileSync(p,'utf8');
    if(!s.includes(process.env.OLD)){console.error('mutasyon noktası yok: '+process.env.OLD);process.exit(2)}
    fs.writeFileSync(p,s.split(process.env.OLD).join(process.env.NEW))" "$2")
}
edit() { (cd "$1" && JS="$2" node -e "const fs=require('fs');const p='$TEXTS';const t=JSON.parse(fs.readFileSync(p,'utf8'));eval(process.env.JS);fs.writeFileSync(p,JSON.stringify(t,null,2)+'\n')"); }
expect() { # expect <ad> <PASS|FAIL> <dizin> <test> [çıktıda aranacak metin]
  local out rc; out="$(cd "$3" && node "$4" 2>&1)"; rc=$?
  local got=PASS; [ "$rc" -ne 0 ] && got=FAIL
  if [ "$got" = "$2" ] && { [ -z "${5:-}" ] || printf '%s' "$out" | grep -q -- "$5"; }; then echo "PASS  $1 → $got"
  else echo "FAIL  $1 → beklenen $2${5:+ (\"$5\")}, gelen $got"; printf '%s\n' "$out" | grep -v '^PASS' | sed 's/^/      /' | head -6; BAD=1; fi
}

# M0 · düzeltilmiş hâl: iki test yeşil
d=$(fresh M0); expect "M0 text_review" PASS "$d" "$TR"; expect "M0 review_apply" PASS "$d" "$TA"

# M1 · u09.01 eski damgaya döner (F-09'un kendisi)
d=$(fresh M1); edit "$d" "t.lessons['u09.01'].review.at='2026-10-02'"
expect "M1 u09.01 eski damga" FAIL "$d" "$TR" 'u09.01.at=2026-10-02 < metin 2026-10-07'

# M2 · başka bir dersin metni commit'lenmeden değişir, damgası değişmez → bugünün tarihiyle yakalanır
d=$(fresh M2); edit "$d" "t.lessons['u02.01'].goal=t.lessons['u02.01'].goal+' (değişti)'"
expect "M2 commit'lenmemiş metin değişikliği" FAIL "$d" "$TR" 'u02.01.at='

# M3 · araç: açık --at görünür kaydı güncellemez (eski davranış)
d=$(fresh M3); mutate "$d" "$TOOL" "    } else if (at) {" "    } else if (false) {" || BAD=1
expect "M3 --at yok sayılır" FAIL "$d" "$TA" 'açık --at yazılmadı'

# M4 · araç: apply yolu önceki işaretleri taşımaz (eski davranış)
d=$(fresh M4); mutate "$d" "$TOOL" "markApprovedBoxes(withCarriedMarks(OUT_TEXT_REVIEW, outDir, renderTextReview(data)), approved)" "markApprovedBoxes(renderTextReview(data), approved)" || BAD=1
expect "M4 kısmi sayfa işaret düşürür" FAIL "$d" "$TA" 'çıktı sayfasında işaret sayısı düştü'

rm -rf "$H"
[ "$BAD" = 0 ] && echo "d3f09 mutasyon: 6/6 PASS" || { echo "d3f09 mutasyon: FAIL"; exit 1; }
