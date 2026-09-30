# KAO2 — CURRENT STATE

<!-- kao2-sync
nextCard: KAO2-23
lastSeq: 78
status: active
-->

Son güncelleme: 2026-09-29 · LEDGER seq71

## Şu an neredeyiz
**KAO2-00…22 tamamlandı (23/28).** KAO2-22 K-3 kademe A hece sesi **hattını** kurdu
(ses değil): `tools/kao2-syllable-audio.mjs` envanteri (115 klip × 2 ses = **230**),
ad biçimini (`y-<harf>_<mark>-<m|f>`), sha256/lisans kurallarını ve ffmpeg `loudnorm`
ölçüm kapısını (`−18 LUFS ±1`, `−1 dBTP`, `≥48 kHz`) zorlar. Kayıt yoksa
`awaiting-recording` der; **uygulama K-3 kademe B** ile (harf gerçek kelime içinde,
KAO2-21'in 28/28 kelime sesi) çalışmaya devam eder.

## Sıradaki kartın tek cümlesi
Sıradaki **KAO2-23** — Ayarlar (S-13) ve "Hakkında ve kaynaklar" (inset grouped
list, switch, alt sayfa; T-22/T-23, O-04).

## Canlı gerçekler
- Dal: `kao2-yeniden-tasarim` = `main`; canlı pin **`20260930e`** (KAO2-22 bu turda yayınlanacak).
- `KAO2-STATE.json`: KAO2-22 `done`; `nextCard=KAO2-23`; `ledgerLastSeq=78`;
  `releaseApproval=approved_through_KAO2-22`.
- **⛔ BÜTÇE KRİTİK:** çalışma zamanı **87.900 / 88 KiB** (pay **0.1 KiB**) ·
  içerik 175.459/256 · ses 10.9/24 MB · css 11.911/14. **Sonraki kart yeni çalışma
  zamanı kodu getirmemeli**; gerekirse önce veri taşıma ya da kullanıcı kararı.
- Ortam: **ffmpeg 8.1.2 kurulu** → kayıt günü doğrulama koşabilir.
- Kimlik pinleri: App yüzeyi 764 · `App.kao*` 43 · atama 602 · `onclick` 393.
- Kaynak/test: PASS · yayın: KAO2-22 sonrası · cihaz: **doğrulanmadı**.

## Bekleyen kullanıcı işleri
- **K-3 kademe A kaydı:** 230 hece klibi (28 harf × 3 hareke + 28 sükûn + 3 med,
  iki ses), nitelikli muallim, stüdyo protokolü, **CC BY 4.0 / süresiz kullanım**
  lisansı + atıf metni. Sonra: `node tools/kao2-syllable-audio.mjs --check
  --source <dizin>` → temizse `assets/kao/audio/`, `planned[]` → `datasets[]`.
  L2 mahreç dinlemesi gereklidir.

## Açık riskler ve bekleyen kullanıcı işleri
- **G3 metin incelemesi kullanıcıda:** `kuran-ogreniyorum-v2/inceleme/INCELEME-KAO2-17.md`
  doldurulmalı (L1 proje sahibi + dinî bağlamlılar için L2 alan uzmanı). Onaya kadar
  tüm metinler `draft` kalır ve uygulamada görünmez — kartın öngördüğü güvenli durum.
- **Cihaz kabulü** hiç doğrulanmadı (KAO2-15/16 dâhil).
- **Bütçe:** KAO2-18+ için ~0,6 KiB; yeni kod kart başında ölçülmeli, gerekirse K-1
  bütçesi kullanıcı kararıyla güncellenmeli.
- KAO2-17 dâhil yayınlanmamış işler var; yayın için açık talimat gerekir.
