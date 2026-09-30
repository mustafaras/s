# KAO2 — CURRENT STATE

<!-- kao2-sync
nextCard: KAO2-26
lastSeq: 81
status: active
-->

Son güncelleme: 2026-09-29 · LEDGER seq71

## Şu an neredeyiz
**KAO2-00…25 tamamlandı (26/28).** KAO2-25 kelime kartını **tek kaydırmalı detaya**
çevirdi (katman sayfalaması yok) ve **Y-11'i kapattı**: doğrulanmamış örnek artık hiç
gösterilmiyor, iç kalite kuralı kullanıcıya sızmıyor. Panel aynası nerede kalındığını
(ünite/ders/taşlar) gösteriyor — anlatı metni olmadan, katı süzülmüş.

## Sıradaki kartın tek cümlesi
Sıradaki **KAO2-26** — Erişilebilirlik ve kontrast denetimi: tüm KAO görünümleri ×
{boş, tohumlu} için klavye döngüsü, odak yönetimi, `lang/dir`, sabit px yükseklik ve
token kontrastı (06 §6, §7 · T-24…T-26).

## Canlı gerçekler
- Dal: `kao2-yeniden-tasarim` = `main`; canlı pin **`20260930i`** (KAO2-25 bu turda yayınlanacak).
- `KAO2-STATE.json`: KAO2-25 `done`; `nextCard=KAO2-26`; `ledgerLastSeq=81`;
  `releaseApproval=approved_through_KAO2-25`.
- **Bütçe:** çalışma zamanı **92.431 / 128 KiB** · içerik 177.657/256 · css 12.824/14.
- Kimlik pinleri: App yüzeyi **763** · `App.kao*` **42** · atama **601** · `onclick` **393**.
  (KAO2-25 bir handler'ı kaldırdı: `kaoWordLayer`.)
- Kaynak/test: PASS · yayın: KAO2-25 sonrası · cihaz: **doğrulanmadı**.

## Açık riskler ve bekleyen kullanıcı işleri
- **G3 metin incelemesi kullanıcıda:** `kuran-ogreniyorum-v2/inceleme/INCELEME-KAO2-17.md`
  doldurulmalı (L1 proje sahibi + dinî bağlamlılar için L2 alan uzmanı). Onaya kadar
  tüm metinler `draft` kalır ve uygulamada görünmez — kartın öngördüğü güvenli durum.
- **Cihaz kabulü** hiç doğrulanmadı (KAO2-15/16 dâhil).
- **Bütçe:** KAO2-18+ için ~0,6 KiB; yeni kod kart başında ölçülmeli, gerekirse K-1
  bütçesi kullanıcı kararıyla güncellenmeli.
- KAO2-17 dâhil yayınlanmamış işler var; yayın için açık talimat gerekir.
