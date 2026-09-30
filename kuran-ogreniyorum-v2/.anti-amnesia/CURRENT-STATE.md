# KAO2 — CURRENT STATE

<!-- kao2-sync
nextCard: KAO2-27
lastSeq: 82
status: active
-->

Son güncelleme: 2026-09-29 · LEDGER seq71

## Şu an neredeyiz
**KAO2-00…26 tamamlandı (27/28).** KAO2-26 erişilebilirlik ve kontrast denetimini
kırmızıdan yazdı: 11 kontrol, 15 görünüm × {boş, tohumlu}. Üretimde metin taşıyan 20
denetim `height` → `min-height` oldu (dinamik metin artık kırpılmaz); kontrast aracı
726 çiftte 0 ihlal veriyor. Modal klavye sözleşmesi (odak döngüsü, tetikleyiciye dönüş,
backdrop odaklanamaz) test altına alındı.

## Sıradaki kartın tek cümlesi
Sıradaki **KAO2-27** — son kart: regresyon taraması, sürüm pini ve **kapanış**;
09 §2 A-1…A-12 kabul ölçütleri, `KAO2-KAPANIS.md`, README durumu, CLAUDE.md/AGENTS.md
KAO2 satırı ve ölü yüzey taraması.

## Canlı gerçekler
- Dal: `kao2-yeniden-tasarim` = `main`; canlı pin **`20260930j`** (KAO2-26 bu turda yayınlanacak).
- `KAO2-STATE.json`: KAO2-26 `done`; `nextCard=KAO2-27`; `ledgerLastSeq=82`;
  `releaseApproval=approved_through_KAO2-26`.
- **Bütçe:** çalışma zamanı 92.431/128 · içerik 177.657/256 · css 12.815/14 KiB.
- Kimlik pinleri: App yüzeyi 763 · `App.kao*` 42 · atama 601 · `onclick` 393.
- Kaynak/test: PASS · yayın: KAO2-26 sonrası · cihaz: **doğrulanmadı**.

## Açık riskler ve bekleyen kullanıcı işleri
- **G3 metin incelemesi kullanıcıda:** `kuran-ogreniyorum-v2/inceleme/INCELEME-KAO2-17.md`
  doldurulmalı (L1 proje sahibi + dinî bağlamlılar için L2 alan uzmanı). Onaya kadar
  tüm metinler `draft` kalır ve uygulamada görünmez — kartın öngördüğü güvenli durum.
- **Cihaz kabulü** hiç doğrulanmadı (KAO2-15/16 dâhil).
- **Bütçe:** KAO2-18+ için ~0,6 KiB; yeni kod kart başında ölçülmeli, gerekirse K-1
  bütçesi kullanıcı kararıyla güncellenmeli.
- KAO2-17 dâhil yayınlanmamış işler var; yayın için açık talimat gerekir.
