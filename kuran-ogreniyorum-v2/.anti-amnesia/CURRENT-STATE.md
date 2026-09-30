# KAO2 — CURRENT STATE

<!-- kao2-sync
nextCard: KAO2-24
lastSeq: 79
status: active
-->

Son güncelleme: 2026-09-29 · LEDGER seq71

## Şu an neredeyiz
**KAO2-00…23 tamamlandı (24/28).** KAO2-23 Ayarlar'ı iOS kalıbına çekti: 7 dağınık
bölüm → **3 ana grup** (Günlük hedef · Ses · Okuma) + alt başlıklar; kaynak/lisans
listesi Ayarlar gövdesinden **ayrı "Hakkında ve kaynaklar" alt sayfasına** taşındı.
Ayrıca **bütçe 128 KiB'e** yükseltildi (kullanıcı yetkisi) ve **metin katmanı açıkları**
kapatıldı: 20 `contextTr` taslağı (donmuş veriden türetilmiş, atıflı), 25 kavrama
gerçek kaynak atıfı, `elif` için 07 §2 uzlaştırması.

## Sıradaki kartın tek cümlesi
Sıradaki **KAO2-24** — İlerleme (S-12): taşlar, kapsam eğrisi, harita ve istatistik
tek ekranda birleşir (05 §2, 03 §1).

## Canlı gerçekler
- Dal: `kao2-yeniden-tasarim` = `main`; canlı pin **`20260930g`** (KAO2-23 bu turda yayınlanacak).
- `KAO2-STATE.json`: KAO2-23 `done`; `nextCard=KAO2-24`; `ledgerLastSeq=79`;
  `releaseApproval=approved_through_KAO2-23`.
- **Bütçe (revizyon 2, kullanıcı yetkisi):** çalışma zamanı tavanı **128 KiB**.
  Ölçüm **88.529 / 128 KiB** · içerik 177.657/256 · css 12.142/14 · p95 4.7 ms.
- Kimlik pinleri: App yüzeyi 764 · `App.kao*` **43** · atama 602 · `onclick` 393.
- Kaynak/test: PASS · yayın: KAO2-23 sonrası · cihaz: **doğrulanmadı**.

## Açık riskler ve bekleyen kullanıcı işleri
- **G3 metin incelemesi kullanıcıda:** `kuran-ogreniyorum-v2/inceleme/INCELEME-KAO2-17.md`
  doldurulmalı (L1 proje sahibi + dinî bağlamlılar için L2 alan uzmanı). Onaya kadar
  tüm metinler `draft` kalır ve uygulamada görünmez — kartın öngördüğü güvenli durum.
- **Cihaz kabulü** hiç doğrulanmadı (KAO2-15/16 dâhil).
- **Bütçe:** KAO2-18+ için ~0,6 KiB; yeni kod kart başında ölçülmeli, gerekirse K-1
  bütçesi kullanıcı kararıyla güncellenmeli.
- KAO2-17 dâhil yayınlanmamış işler var; yayın için açık talimat gerekir.
