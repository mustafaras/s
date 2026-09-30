# KAO2-FIX — LEDGER (yalnız ekleme)

Kurallar: kayıtlar **yalnız sona eklenir**, eski kayıt düzenlenmez ve silinmez. `seq` 1'den kesintisiz
artar; son kaydın `seq`'i `FIX-STATE.json.ledgerLastSeq` ve CURRENT-STATE `lastSeq` ile aynıdır; son
kaydın `- next:` satırı `FIX-STATE.json.nextPrompt` ile aynıdır (`none` = program bitti).
Başlık biçimi (araç bunu okur): `## seq N · YYYY-MM-DD · TÜR · kimlik`
Türler: `AUDIT` · `DECISION` · `MOVE` · `PLAN` · `PROMPT` · `GATE` · `BLOCKED` · `FIX` · `NOTE` · `RELEASE`
Denetim: `node kao2-duzeltme/tools/fix-sync-check.mjs --repro`

---

## seq 1 · 2026-09-30 · AUDIT · —
- summary: KAO2 (28 kart) tam denetimi yapıldı; 49 bulgu (4 kritik · 11 yüksek · 24 orta · 10 düşük).
- critical: K4-01 ustalık hiç kaydedilmiyor (Ünite 1 kilidi) · K4-02 gramer görevleri yanlış öğretiyor (78 görevin 45'i) · K5-01 S0 ana yolu boş · K5-02 S0 yüzeyi çalışmıyor (App.kaoS0 tanımsız, 6/12 çökme).
- evidence: kao2-duzeltme/denetim/KUSUR-RAPORU.md · repro: kao2-duzeltme/denetim/tekrar-uret.cjs (0/10 PASS)
- evidence-levels: kaynak/test ✓ (node:vm, gerçek handler) · yayın — · cihaz —
- next: K2F-00

## seq 2 · 2026-09-30 · DECISION · —
- summary: Kullanıcı düzeltme planındaki KR-1…KR-7 önerilerini kabul etti; uygulayıcı Claude Sonnet 5.5; yayın adımları onay kapılı.
- decisions: KR-1 ustalık 07 §3 · KR-2 v1 kullanıcı 'şimdilik atla' · KR-3 kelimeler başlıklara göre yeniden dağıtılır · KR-4 inceleme bitene kadar draft · KR-5 contextTr kaldırılır · KR-6 plan-check taban commit · KR-7 Dalga 1 sonrası ayrı yayın
- record: FIX-STATE.json.decisions
- next: K2F-00

## seq 3 · 2026-09-30 · MOVE · —
- summary: Eski program arşive taşındı; canlı girdiler kalıcı yere alındı. Çalışma ağacında, COMMIT EDİLMEDİ (K2F-00 commit eder).
- moves: `kuran-ogreniyorum-v2/` → `archive/kuran-ogreniyorum-v2/` · `…/content/` → `docs/kuran-ogreniyorum/kao2/content/` · `…/inceleme/` → `docs/kuran-ogreniyorum/kao2/inceleme/` · `…/denetim/` → `kao2-duzeltme/denetim/`
- repointed: tools/kao2-curriculum-build.mjs (satır 4–17 yol sabitleri; 291/302 üretilen başlık metni bilerek eski — K2F-20'de güncellenir) · tests/kao/test_kao2_{explain,curriculum,review_apply,text_review,kabul,perf_budget,syllable_audio}.js · docs/kuran-ogreniyorum/content/audio-manifest.json · .github/workflows/pages.yml (+`kao2-duzeltme` hariç tutma ve koruma listesi) · CLAUDE.md · AGENTS.md
- verified: KAO 45/45 · app 77/77 · panel 23/23 · panel-v2 27/27 · quran 9/9 · reminders/driver/zikr/kontrast PASS · arşiv KAO2 sync PASS · curriculum aracı 5/5 çıktı bayt-eşit
- not-moved: `docs/evidence/LOCATION-GATE-20260928.json` eski yolları tarihsel kanıt olarak taşır (değiştirilmedi).
- next: K2F-00

## seq 4 · 2026-09-30 · PLAN · —
- summary: KAO2-FIX programı kuruldu: 44 sıralı prompt (K2F-00…K2F-43), 6 dalga, 4 kullanıcı kapısı (K2F-18, 20, 22, 43).
- files: README.md · PROMPTLAR.md · BAGLAM-YONETIMI.md · FIX-STATE.json · .anti-amnesia/{CURRENT-STATE,LEDGER}.md · tools/{fix-sync-check.mjs,kapilar.sh}
- repro-flip-plan: R-09→K2F-02 · R-10→K2F-04 · R-01/R-02→K2F-06 · R-03→K2F-10 · R-05→K2F-12 · R-06→K2F-13 · R-04→K2F-15 · R-07→K2F-16 · R-08→K2F-23
- next: K2F-00

## seq 5 · 2026-09-30 · PROMPT · K2F-00
- status: done
- title: Başlangıç: dal, taşıma commit'i, taban ölçüm
- prev-commit: 07802fa6
- evidence: kao2-duzeltme/evidence/K2F-00/KANIT.md
- closes: — (altyapı)
- repro: değişmedi · toplam 0/10
- gates: kapilar.sh YEŞİL (kao 45 · app 77 · panel 23 · panel-v2 27 · quran 9 · reminders · driver · zikr · kontrast · plan-check ATLANDI · sync)
- pins: App.kao* 42 · yüzey 763 · atama 601 · yayın 20260930l
- changed-tests: yok
- evidence-levels: kaynak/test ✓ · yayın — · cihaz —
- surprises: yok (sandbox'ta `mktemp -d` ve `diff -` reddedildi; $TMPDIR altında geçici dosya kullanıldı)
- next: K2F-01
