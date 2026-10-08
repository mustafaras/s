#!/usr/bin/env bash
# D3F-14 (denetim-3 F-14) · D2F-05 ve D2F-09 mutasyon kanıtlarının depoya alınmış, yeniden üretilebilir hâli.
# D2F-05 KANIT'ı iki mutasyonu komutlarıyla yazmış ama betik commit'lenmemişti; D2F-09 harness'i scratchpad'de kalmıştı.
# D2F-09'un a ve kapanış-sonrası önek kuralları D3F-04/d2f-mutasyon.sh'ta; burada b (×2), c, d (×3), e (×2), f ve kontrol vakası var.
# Ağ yok, depoya yazmaz: her vaka $TMPDIR'de taze klon. Beklenen sonuç ya da gerekçe tutmazsa çıkış 1.
#   bash kao2-duzeltme/denetim-3/evidence/D3F-14/d2f-0509-mutasyon.sh
set -u
REPO="$(cd "$(dirname "$0")/../../../.." && pwd)"
D2=kao2-duzeltme/denetim-2
TOOL=$D2/tools/d2f-sync-check.mjs
STATE=$D2/D2F-STATE.json
H="$(mktemp -d "${TMPDIR:-/tmp}/d3f14-mut.XXXXXX")"
BAD=0
G() { git -c user.name=mut -c user.email=mut@example.invalid "$@"; }
CLOSE="$(node -e "process.stdout.write(require('$REPO/$STATE').closeCommit||'')")"
fresh() { # fresh <ad> [kapanış] → klon yolu (kapanış verilirse klon D2F kapanış commit'ine alınır)
  local d="$H/$1"
  git clone -q "$REPO" "$d" && { [ -z "${2:-}" ] || (cd "$d" && git checkout -q "$CLOSE"); }
  printf '%s' "$d"
}
close_at_head() { node -e "const fs=require('fs');const p='$STATE';const s=JSON.parse(fs.readFileSync(p,'utf8'));s.closeCommit=require('child_process').execSync('git rev-parse HEAD').toString().trim();fs.writeFileSync(p,JSON.stringify(s,null,2)+'\n')"; }
sub() { # sub <dosya> <eski> <yeni> — eski metin yoksa senaryo geçersiz (çıkış 2)
  OLD="$2" NEW="$3" node -e "const fs=require('fs');const p=process.argv[1];const s=fs.readFileSync(p,'utf8');
    if(!s.includes(process.env.OLD)){console.error('mutasyon noktası yok: '+process.env.OLD.slice(0,80));process.exit(2)}
    fs.writeFileSync(p,s.split(process.env.OLD).join(process.env.NEW))" "$1"
}
expect() { # expect <ad> <PASS|FAIL> <dizin> <komut…> -- <çıktıda aranacak metin>
  local name="$1" want="$2" dir="$3"; shift 3; local cmd=(); while [ "$1" != "--" ]; do cmd+=("$1"); shift; done; shift; local needle="${1:-}"
  local out rc; out="$(cd "$dir" && "${cmd[@]}" 2>&1)"; rc=$?
  local got=PASS; [ "$rc" -ne 0 ] && got=FAIL
  if [ "$got" = "$want" ] && { [ -z "$needle" ] || printf '%s' "$out" | grep -qF -- "$needle"; }; then echo "PASS  $name → $got"
  else echo "FAIL  $name → beklenen $want${needle:+ (\"$needle\")}, gelen $got"; printf '%s\n' "$out" | grep -E 'strict-|Assertion|FAIL|noktası' | sed 's/^/      /' | head -5; BAD=1; fi
}
STRICT=(node "$TOOL" --strict)

echo "── D2F-09 (d2f-sync-check --strict) ──"
# K0 · kontrol: gerçek durum yeşil
d=$(fresh K0); expect "K0 kontrol (gerçek durum)" PASS "$d" "${STRICT[@]}" -- "D2F senkron: PASS"

# b · kapanmış aralıkta öneksiz commit / bilinmeyen önek (D3F-04 yalnız kapanış SONRASI önekleri sınar)
d=$(fresh B1 kapanış); (cd "$d" && G commit -q --allow-empty -m "ek düzeltme" && close_at_head)
expect "b  öneksiz commit" FAIL "$d" "${STRICT[@]}" -- "öneksiz commit: \"ek düzeltme\""
d=$(fresh B2 kapanış); (cd "$d" && G commit -q --allow-empty -m "D2F-99: bilinmeyen" && close_at_head)
expect "b  bilinmeyen önek D2F-99" FAIL "$d" "${STRICT[@]}" -- "bilinmeyen önek D2F-99"

# c · kapanmış aralıkta D2F-15 olmayan bir commit pin (?v=) değiştirir
d=$(fresh C1 kapanış); (cd "$d" && perl -pi -e 's/(app\/core\/quranLearn\.js\?v=)\w+/${1}mut0000x/' index.html && G commit -qam "D2F-14: pin" && close_at_head)
expect "c  D2F-14 pin değiştirir" FAIL "$d" "${STRICT[@]}" -- "[strict-c]"

# d · KANIT: "Oturum:" satırı yok / bölüm eksik / oturum adresi başka prompt'la paylaşılıyor
d=$(fresh D1); (cd "$d" && sub $D2/evidence/D2F-14/KANIT.md "Oturum: claude-code:b9936220-be4d-4f19-8846-806b9a508105" "Oturum yazılmadı")
expect "d  Oturum satırı yok" FAIL "$d" "${STRICT[@]}" -- "[strict-d] D2F-14: KANIT'ta \"Oturum:\" satırı yok"
d=$(fresh D2); (cd "$d" && sub $D2/evidence/D2F-14/KANIT.md "## Sürprizler" "## Ek notlar")
expect "d  bölüm eksik (Sürprizler)" FAIL "$d" "${STRICT[@]}" -- "[strict-d] D2F-14: KANIT bölümü eksik: Sürprizler"
d=$(fresh D3); (cd "$d" && sub $D2/evidence/D2F-14/KANIT.md "Oturum: claude-code:b9936220-be4d-4f19-8846-806b9a508105" "Oturum: claude-code:a2d84e3d-c707-467c-81b6-d166368fce15")
expect "d  oturum paylaşılıyor" FAIL "$d" "${STRICT[@]}" -- "ile paylaşılıyor"

# e · onay kapısı: D2F-15 GATE kaydı closed değil
d=$(fresh E1); (cd "$d" && node -e "const fs=require('fs');const p='$D2/LEDGER.md';const s=fs.readFileSync(p,'utf8');const i=s.indexOf('· GATE · D2F-15');if(i<0)process.exit(2);const j=s.indexOf('- status: closed',i);fs.writeFileSync(p,s.slice(0,j)+'- status: done'+s.slice(j+'- status: closed'.length))")
expect "e  D2F-15 GATE closed değil" FAIL "$d" "${STRICT[@]}" -- "[strict-e] D2F-15"

# e · onay kapısı: D2F-14 GATE kaydı waiting değil
d=$(fresh E2); (cd "$d" && node -e "const fs=require('fs');const p='$D2/LEDGER.md';const s=fs.readFileSync(p,'utf8');const i=s.indexOf('· GATE · D2F-14');if(i<0)process.exit(2);const j=s.indexOf('- status: waiting',i);fs.writeFileSync(p,s.slice(0,j)+'- status: closed'+s.slice(j+'- status: waiting'.length))")
expect "e  D2F-14 GATE waiting değil" FAIL "$d" "${STRICT[@]}" -- "[strict-e] D2F-14"

# f · "Canlı gerçekler" tarihi son LEDGER kaydından eski
d=$(fresh F1); (cd "$d" && perl -0pi -e 's/^(## Canlı gerçekler \()\d{4}-\d{2}-\d{2}/${1}2026-10-01/m' $D2/CURRENT-STATE.md)
expect "f  Canlı gerçekler bayat" FAIL "$d" "${STRICT[@]}" -- "[strict-f] CURRENT-STATE"

echo "── D2F-05 (tests/kao/test_kao2_denetim.js) ──"
DEN=(node tests/kao/test_kao2_denetim.js)
d=$(fresh M0); expect "M0 kontrol (gerçek durum)" PASS "$d" "${DEN[@]}" -- "PASS"
# (a) masteryAt yazımı kapatılır → R-01 kırmızı (D2F-05 KANIT'ındaki sed'in birebir karşılığı)
d=$(fresh MA); (cd "$d" && sub app/core/quranLearn.js "next.masteryAt=stamp; next.masteryScore=score; next.repair=null;" "next.masteryScore=score; next.repair=null;")
expect "D2F-05 (a) masteryAt yazılmaz" FAIL "$d" "${DEN[@]}" -- "R-01 (K4-01) · doğru: masteryAt=false"
# (b) test_kao2_kabul.js'e girintili koşulsuz kanıt yazımı eklenir → R-10 kırmızı
d=$(fresh MB); (cd "$d" && sub tests/kao/test_kao2_kabul.js "  const report = md.join('\n') + '\n';" "  const report = md.join('\n') + '\n';
  fs.writeFileSync(path.join(repoRoot, 'kao2-duzeltme/evidence/K2F-36/A-KABUL.md'), report);")
expect "D2F-05 (b) koşulsuz kanıt yazımı" FAIL "$d" "${DEN[@]}" -- "KAO2_EVIDENCE_OUT koşulsuz=1"

rm -rf "$H"
[ "$BAD" = 0 ] && echo "d3f14 mutasyon: 13/13 PASS" || { echo "d3f14 mutasyon: FAIL"; exit 1; }
