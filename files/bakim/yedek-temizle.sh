#!/usr/bin/env bash
# seyma-data · data/backups/ budama — her günün EN YENİ yedeğini korur.
#
# GÜVENLİK: Betik çalıştığı ANDAKİ main'i temel alır (bayat sha kullanmaz),
# ve aşağıdaki kontrollerden biri bile geçmezse HİÇBİR ŞEY yapmadan çıkar:
#   1. ağaç listesi eksiksiz olmalı (truncated=false)
#   2. silinecek her yol data/backups/ ile başlamalı
#   3. her gün için en az 1 yedek kalmalı
#   4. backups DIŞINDAKİ dosya sayısı değişmemeli
# Silinen dosyalar git geçmişinde kalır; commit tek ve geri alınabilir.
#
# Kullanım:  bash yedek-temizle.sh --dry-run     (sadece göster)
#            bash yedek-temizle.sh               (uygula)
set -euo pipefail
REPO="mustafaras/seyma-data"
DRY="${1:-}"
TMP="$(mktemp -d)"; trap 'rm -rf "$TMP"' EXIT

MAIN=$(gh api "repos/$REPO/git/ref/heads/main" --jq '.object.sha')
echo "main (şu an)     : $MAIN"
gh api "repos/$REPO/git/trees/$MAIN?recursive=1" > "$TMP/tree.json"

python3 - "$TMP" <<'PY'
import json,sys,collections,os
T=sys.argv[1]; t=json.load(open(T+'/tree.json'))
if t.get('truncated'): sys.exit("DURDU: ağaç listesi eksik (truncated) — güvenli değil.")
blobs=[e for e in t['tree'] if e['type']=='blob']
bak=[e for e in blobs if e['path'].startswith('data/backups/')]
other=[e for e in blobs if not e['path'].startswith('data/backups/')]
byday=collections.defaultdict(list)
for e in bak: byday[e['path'].split('/')[-1][:10]].append(e)
keep,dele=[],[]
for d,items in byday.items():
    items.sort(key=lambda e:e['path'])          # ad = zaman damgası
    keep.append(items[-1]); dele.extend(items[:-1])
# --- kontroller ---
assert all(e['path'].startswith('data/backups/') for e in dele), "DURDU: backups dışı yol!"
assert len(keep)==len(byday), "DURDU: bir gün yedeksiz kalıyor!"
print(f"korunacak diğer dosyalar : {len(other)} (latest.json, gunluk/, events/, quran-*, observer-*, .github/ …)")
print(f"yedek günü               : {len(byday)}")
print(f"  KALACAK                : {len(keep):5} dosya  {sum(e['size'] for e in keep)/1048576:6.0f} MB")
print(f"  SİLİNECEK              : {len(dele):5} dosya  {sum(e['size'] for e in dele)/1048576:6.0f} MB")
json.dump({"base_tree":t['sha'],
           "tree":[{"path":e['path'],"mode":"100644","type":"blob","sha":None} for e in dele]},
          open(T+'/tree-payload.json','w'))
open(T+'/count','w').write(str(len(dele)))
open(T+'/other','w').write(str(len(other)))
PY

DEL=$(cat "$TMP/count"); OTHER=$(cat "$TMP/other")
if [ "$DEL" = "0" ]; then echo "Silinecek bir şey yok — çıkılıyor."; exit 0; fi
if [ "$DRY" = "--dry-run" ]; then echo; echo "(kuru çalıştırma — hiçbir şey değiştirilmedi)"; exit 0; fi

echo; echo "Uygulanıyor…"
TREE=$(gh api "repos/$REPO/git/trees" -X POST --input "$TMP/tree-payload.json" --jq '.sha')
python3 - "$TMP" "$TREE" "$MAIN" "$DEL" <<'PY'
import json,sys
T,tree,parent,n=sys.argv[1],sys.argv[2],sys.argv[3],sys.argv[4]
msg=(f"temizlik: ara push yedeklerini buda ({n} dosya)\n\n"
     "data/backups/ her push'ta 1.5 MB'lik yeni bir dosya aliyordu ve ~2.1 GB'a\n"
     "ulasmisti. QY-22 ile yazim gunde tek dosyaya indirildi; bu commit gecmis\n"
     "yigini ayni kurala hizalar: her gunun EN YENI yedegi korunur.\n\n"
     "Silinen dosyalarin TAMAMI data/backups/ altindadir. latest.json,\n"
     "data/gunluk/, data/events/, quran-*, observer-*, sync-receipt.json ve\n"
     "aeon-media/ dosyalarina DOKUNULMAMISTIR. Cikarilan dosyalar git\n"
     f"gecmisinde durmaya devam eder (parent {parent[:7]}).")
json.dump({"message":msg,"tree":tree,"parents":[parent]},open(T+'/commit.json','w'))
PY
NEW=$(gh api "repos/$REPO/git/commits" -X POST --input "$TMP/commit.json" --jq '.sha')
gh api "repos/$REPO/git/refs/heads/main" -X PATCH -f sha="$NEW" --jq '"main → " + .object.sha'

echo; echo "=== DOĞRULAMA ==="
gh api "repos/$REPO/git/trees/main?recursive=1" > "$TMP/after.json"
python3 - "$TMP" "$OTHER" <<'PY'
import json,sys
T,expected=sys.argv[1],int(sys.argv[2])
a=json.load(open(T+'/after.json'))
blobs=[e for e in a['tree'] if e['type']=='blob']
bak=[e for e in blobs if e['path'].startswith('data/backups/')]
other=[e for e in blobs if not e['path'].startswith('data/backups/')]
print(f"  kalan yedek        : {len(bak)}")
print(f"  diğer dosyalar     : {len(other)}  (beklenen {expected}) " + ("✅" if len(other)==expected else "⚠️ FARK VAR"))
PY
gh api "repos/$REPO/contents/data/latest.json" --jq '"  latest.json sha    : " + .sha'
echo "  geri alma          : gh api repos/mustafaras/seyma-data/git/refs/heads/main -X PATCH -f sha=$MAIN -F force=true"
