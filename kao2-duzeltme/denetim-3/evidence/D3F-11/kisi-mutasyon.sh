#!/usr/bin/env bash
# D3F-11 · kişi tanıma sorusu (gramPersonRecipe) mutasyon sınaması (yeniden üretilebilir; ağ yok, depoya yazmaz).
# HEAD $TMPDIR'e klonlanır; quranLearn.js ve gramer görevleri testi ÇALIŞMA AĞACINDAKİ hâliyle klona kopyalanır.
#   bash kao2-duzeltme/denetim-3/evidence/D3F-11/kisi-mutasyon.sh
set -u
REPO="$(cd "$(dirname "$0")/../../../.." && pwd)"
SRC=app/core/quranLearn.js
TEST=tests/kao/test_kao2_grammar_tasks.js
H="$(mktemp -d "${TMPDIR:-/tmp}/d3f11-mut.XXXXXX")"
BAD=0
fresh() { local d="$H/$1"; git clone -q "$REPO" "$d" && cp "$REPO/$SRC" "$d/$SRC" && cp "$REPO/$TEST" "$d/$TEST"; printf '%s' "$d"; }
mutate() { # mutate <dizin> <eski> <yeni>
  (cd "$1" && OLD="$2" NEW="$3" node -e "const fs=require('fs');const p='$SRC';const s=fs.readFileSync(p,'utf8');
    if(!s.includes(process.env.OLD)){console.error('mutasyon noktası yok: '+process.env.OLD);process.exit(2)}
    fs.writeFileSync(p,s.split(process.env.OLD).join(process.env.NEW))")
}
expect() { # expect <ad> <PASS|FAIL> <dizin> [çıktıda aranacak metin]
  local out rc; out="$(cd "$3" && node "$TEST" 2>&1)"; rc=$?
  local got=PASS; [ "$rc" -ne 0 ] && got=FAIL
  if [ "$got" = "$2" ] && { [ -z "${4:-}" ] || printf '%s' "$out" | grep -q -- "$4"; }; then echo "PASS  $1 → $got"
  else echo "FAIL  $1 → beklenen $2${4:+ (\"$4\")}, gelen $got"; printf '%s\n' "$out" | grep -E 'Error|FAIL' | sed 's/^/      /' | head -4; BAD=1; fi
}

# M0 · düzeltilmiş hâl
d=$(fresh M0); expect "M0 düzeltilmiş" PASS "$d" 'kontrol PASS'

# M1 · eski davranış: şık ham tablo etiketi (anlam notu dahil) — F-11'in kendisi
d=$(fresh M1); mutate "$d" "unique.map(function(item){ return gramPersonKey(item.row.label); })" "unique.map(function(item){ return String(item.row.label); })" || BAD=1
mutate "$d" "answer=gramPersonKey(chosen.row.label)" "answer=String(chosen.row.label)" || BAD=1
expect "M1 ham etiket (anlam notlu şık)" FAIL "$d" 'şık anlam notu taşıyor: "siz'

# M2 · kişi anahtarı cinsiyeti de atar → "o (erkek)" ile "o (kadın)" aynı kişi sayılır, cinsiyet bilgisi kaybolur (g13/g15 bozulur)
d=$(fresh M2); mutate "$d" "replace(/\\s*\\((?!(?:erkek|kadın)\\))[^)]*\\)/g,'')" "replace(/\\s*\\([^)]*\\)/g,'')" || BAD=1
expect "M2 cinsiyet notu atılır" FAIL "$d" 'g:g13:g13-k3'

# M3 · yönerge eski hâline döner (kişiyi sorduğunu söylemez). Not: "aynı kişi iki şık" mutasyonu EŞDEĞERDİR — choiceList şıkları
# etikete göre zaten tekilleştirir (doğru cevap önce girer); ilk sürümdeki o M3 hayatta kaldı ve tarifteki gereksiz tekilleştirme kaldırıldı.
d=$(fresh M3); mutate "$d" "g17:'Bu emir kime söylenmiş? (tek kişiye mi, topluluğa mı?)'" "g17:'Bu emir kime söylenmiş?'" || BAD=1
expect "M3 eski yönerge" FAIL "$d" 'yönerge kişiyi (tek/topluluk) sorduğunu söylemiyor'

rm -rf "$H"
[ "$BAD" = 0 ] && echo "d3f11 mutasyon: 4/4 PASS" || { echo "d3f11 mutasyon: FAIL"; exit 1; }
