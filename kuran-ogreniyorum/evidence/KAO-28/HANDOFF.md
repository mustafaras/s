# KAO-28 · Devir

**Tarih:** 2026-09-25 · **Doğrulama tabanı:** `e9f01ecf7de8be21471de88470a3ae432beb7e22` · **Durum:** done

## Ne yapıldı

- E9 “Bugün anlayabildiğin âyet” (`App.kaoOpenAyah()`): kısa sûrelerden kelimelerinin ≥%95'i bilinen bir âyet; kelime kelime okunuş + Türkçe + dokununca ses, “Âyeti kelime kelime dinle”, “Anladım”.
- Günün âyeti gün boyu sabit; görülmemiş âyetler önce; hazır âyet yoksa en yakın âyet ve kalan kelime sayısı gösterilir.
- E1'de “Bugün anlayabildiğin âyet” bölümü ve anlaşılan âyet sayacı; hub kartında âyet satırı.
- Ortak `kaoCoverage` / `kaoKnownLemmaSet`: E1 kapsam yüzdesi artık belgedeki gibi token kapsamı (QAC 77.430).

## Davranış değişikliği

E1 yüzdesi daha düşük ama doğru görünür: tüm sözlük bilinse bile üst sınır %77 (eski hesap %100 diyordu).

## Sınırlar

Cihaz kabulü yok; bu commit henüz yayınlanmadı.

## Sonraki yetkili eylem

`node kuran-ogreniyorum/tools/kao-plan-check.mjs --card KAO-28b`.
