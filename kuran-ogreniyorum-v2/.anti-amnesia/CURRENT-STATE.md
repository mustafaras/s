# KAO2 — CURRENT STATE

<!-- kao2-sync
nextCard: KAO2-20
lastSeq: 74
status: active
-->

Son güncelleme: 2026-09-29 · LEDGER seq71

## Şu an neredeyiz
**KAO2-00…19 tamamlandı (20/28).** KAO2-19 okuyucuyu yeniledi ve üç açık bulguyu kapattı:
Y-12 (öz-beyan öncesi 3 soruluk kontrol), T-20 (kenarlıksız WordChip + anlam alt panelde),
T-21 (seçili sûre kaydırma hedefi motorda). Ek olarak okuma sesi uygulamanın genel sessiz
saat kuralına (23:00–07:00) uyduruldu. Ayrıca KAO2-18'in açık kusuru kapatıldı:
inceleme sayfasının vaat ettiği `--apply-review` yolu araçta **yoktu**, yazıldı (seq 73).

## Sıradaki kartın tek cümlesi
Sıradaki **KAO2-20** — "Kök aileleri (S-11)": `QuranGrammarV1.unit11.roots` (73) +
`QuranLexiconV1.roots` (301) verisinden kök ailesi ekranı.

## Canlı gerçekler
- Dal: `kao2-yeniden-tasarim` = `main`; KAO2-18 canlı (`2ad13a5f`, pin `20260929g`),
  KAO2-19 bu turda yayınlanacak.
- `KAO2-STATE.json`: KAO2-19 `done`; `nextCard=KAO2-20`; `ledgerLastSeq=74`;
  `releaseApproval=approved_through_KAO2-19`.
- **Bütçe:** çalışma zamanı **83.962 / 88 KiB** · içerik 173.298/256 · css 11.074/14 ·
  p95 4.443 ms. (Kalan pay ~4 KiB — KAO2-20 önce ölçülmeli.)
- Kimlik pinleri: App yüzeyi **762** · `App.kao*` **41** · `app.js` ataması **600** · `onclick` 393.
- Kaynak/test: PASS · yayın: KAO2-19 sonrası · cihaz: **doğrulanmadı**.

## Açık riskler ve bekleyen kullanıcı işleri
- **G3 metin incelemesi kullanıcıda:** `kuran-ogreniyorum-v2/inceleme/INCELEME-KAO2-17.md`
  doldurulmalı (L1 proje sahibi + dinî bağlamlılar için L2 alan uzmanı). Onaya kadar
  tüm metinler `draft` kalır ve uygulamada görünmez — kartın öngördüğü güvenli durum.
- **Cihaz kabulü** hiç doğrulanmadı (KAO2-15/16 dâhil).
- **Bütçe:** KAO2-18+ için ~0,6 KiB; yeni kod kart başında ölçülmeli, gerekirse K-1
  bütçesi kullanıcı kararıyla güncellenmeli.
- KAO2-17 dâhil yayınlanmamış işler var; yayın için açık talimat gerekir.
