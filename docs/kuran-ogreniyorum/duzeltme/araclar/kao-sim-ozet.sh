#!/bin/sh
# KAO 365 gün simülasyonu + tek satır özet (FIX kartları: FIX-06/07/09/10/19).
# Kullanım:  sh docs/kuran-ogreniyorum/duzeltme/araclar/kao-sim-ozet.sh [gün [doğruluk]]
# ~60 sn sürer. JSON $TMPDIR'e yazılır; repo değişmez.
ROOT=$(cd "$(dirname "$0")/../../../.." && pwd)
cd "$ROOT" || exit 1
TMP=${TMPDIR:-/tmp}
DAYS=${1:-365}
ACC=${2:-0.9}
node docs/kuran-ogreniyorum/duzeltme/araclar/kao-sim.js "$ROOT" "$DAYS" "$ACC" >"$TMP/kao-sim-cur.json" 2>&1
echo "sim exit $?"
node -e 'const fs=require("fs");const j=JSON.parse(fs.readFileSync(process.env.TMPDIR+"/kao-sim-cur.json","utf8"));console.log(JSON.stringify({sl:j.sessionLen,maxRun:j.maxSameTypeRun,viol:j.runViolations,g:j.grammarMax,f:j.fragmentMax,n:j.newMax,both:j.lemmasBothDirections,seen:j.lemmasSeen,plan:j.knownByPlanDefinition,code:j.knownByCode,cov:j.codeCoveragePct,err:j.errorCount,tasks:j.tasks,kb:j.size[j.size.length-1].KB,ms:j.milestones}));'
