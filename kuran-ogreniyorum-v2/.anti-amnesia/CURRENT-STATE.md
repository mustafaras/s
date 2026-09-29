# KAO2 — CURRENT STATE

<!-- kao2-sync
nextCard: KAO2-19
lastSeq: 72
status: active
-->

Son güncelleme: 2026-09-29 · LEDGER seq71

## Şu an neredeyiz
**KAO2-00…18 tamamlandı (19/28).** KAO2-18 hata açıklamalarını (`kaoExplain`) ve 25
kavramın çözümlü örneğini ekledi; ayrıca kullanıcının bildirdiği **üç yönlendirme
kusuru** (Y-01/02/03) düzeltildi. K-1 çalışma zamanı bütçesi kullanıcı onayıyla
80 → 88 KiB. **KAO2-17'ye kadar olan iş canlıda** (pin `20260929f`); KAO2-18 bu turda
yayınlanacak.

## Sıradaki kartın tek cümlesi
Sıradaki **KAO2-19** — "Sûre bağlamı ve okuyucu v2": sûre ekranına bağlam (nüzul sırası,
indiriliş yeri, kısa giriş) ve okuyucu görünümüne v2 yerleşimi ekler.

## Canlı gerçekler
- Dal: `kao2-yeniden-tasarim` **= main = `ef480b6b`** (KAO2-18 değişiklikleri `main`
  çalışma ağacında, commit bekliyor). Pin: `20260929f` → KAO2-18 yayınında **`20260929g`**.
- `KAO2-STATE.json`: program `active`; KAO2-18 `done`; `nextCard=KAO2-19`;
  `ledgerLastSeq=72`; `releaseApproval=approved_through_KAO2-18`.
- G0 kapalı, G1 sunulmuş, G2 kapalı, G3 sunuldu (kavram metinleri L1'de), G4 açık.
- **Bütçe rahatladı:** çalışma zamanı **81.032 / 88 KiB** · içerik 173.726/256 ·
  curriculum 14.926/48 · CSS 10.728/14 · p95 4.651–6.104 ms.
- Kaynak/test: PASS · yayın: KAO2-18 sonrası yapılacak · cihaz: **doğrulanmadı**.

## Açık riskler ve bekleyen kullanıcı işleri
- **G3 metin incelemesi kullanıcıda:** `kuran-ogreniyorum-v2/inceleme/INCELEME-KAO2-17.md`
  doldurulmalı (L1 proje sahibi + dinî bağlamlılar için L2 alan uzmanı). Onaya kadar
  tüm metinler `draft` kalır ve uygulamada görünmez — kartın öngördüğü güvenli durum.
- **Cihaz kabulü** hiç doğrulanmadı (KAO2-15/16 dâhil).
- **Bütçe:** KAO2-18+ için ~0,6 KiB; yeni kod kart başında ölçülmeli, gerekirse K-1
  bütçesi kullanıcı kararıyla güncellenmeli.
- KAO2-17 dâhil yayınlanmamış işler var; yayın için açık talimat gerekir.
