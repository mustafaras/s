# KAO2 — CURRENT STATE

<!-- kao2-sync
nextCard: KAO2-21
lastSeq: 75
status: active
-->

Son güncelleme: 2026-09-29 · LEDGER seq71

## Şu an neredeyiz
**KAO2-00…20 tamamlandı (21/28).** KAO2-20 kök aileleri ekranını (S-11) getirdi:
73 `unit11` ailesi öğrenme sırasında, 301 köklük sözlük isteğe bağlı keşif katmanında;
kök sayfası harfler/okunuş/anlam, kalıp etiketli Türkçe türevler ve durum rozetli
kelime satırları gösterir. Keşif satırı yalnız kartı olan kullanıcıda görünür.

## Sıradaki kartın tek cümlesi
Sıradaki **KAO2-21** — kademe B (ses): K-3 kararına bağlı muallim kaydı hattı.

## Canlı gerçekler
- Dal: `kao2-yeniden-tasarim` = `main`; KAO2-19 canlı (`f801540d`, pin `20260930a`),
  KAO2-20 bu turda yayınlanacak.
- `KAO2-STATE.json`: KAO2-20 `done`; `nextCard=KAO2-21`; `ledgerLastSeq=75`;
  `releaseApproval=approved_through_KAO2-20`.
- **⛔ BÜTÇE %98 DOLU:** çalışma zamanı **86.032 / 88 KiB** (pay ~2 KiB) · içerik
  173.298/256 · css 11.574/14 · p95 4.479 ms. Sonraki çalışma zamanı artışı
  **kullanıcı onayı ister** (80→88 bir kez onaylandı).
- Kimlik pinleri: App yüzeyi **764** · `App.kao*` **43** · `app.js` ataması **602** ·
  `onclick` 393.
- Kaynak/test: PASS · yayın: KAO2-20 sonrası · cihaz: **doğrulanmadı**.

## Açık riskler ve bekleyen kullanıcı işleri
- **G3 metin incelemesi kullanıcıda:** `kuran-ogreniyorum-v2/inceleme/INCELEME-KAO2-17.md`
  doldurulmalı (L1 proje sahibi + dinî bağlamlılar için L2 alan uzmanı). Onaya kadar
  tüm metinler `draft` kalır ve uygulamada görünmez — kartın öngördüğü güvenli durum.
- **Cihaz kabulü** hiç doğrulanmadı (KAO2-15/16 dâhil).
- **Bütçe:** KAO2-18+ için ~0,6 KiB; yeni kod kart başında ölçülmeli, gerekirse K-1
  bütçesi kullanıcı kararıyla güncellenmeli.
- KAO2-17 dâhil yayınlanmamış işler var; yayın için açık talimat gerekir.
