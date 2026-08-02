# REPO-M0 — Markdown Envanteri ve Canonical Belge Manifestosu

**Tarih:** 2026-08-02
**Durum:** `completed` — yalnızca read-only envanter
**Kapsam:** Kök ve `docs/` altındaki Markdown belgeleri
**Dosya taşıma:** Yapılmadı
**Kullanıcı verisi:** Okunmadı/yazılmadı

## Kanıt sınırı

Bu manifestoyu oluştururken yalnız dosya adları, satır sayıları, Markdown
link hedefleri ve mevcut Git çalışma ağacı okundu. `data/` altında kullanıcı
verisi aranmadı; Git’te `data/**` yolu bulunmadığı yalnızca dosya listesi
seviyesinde kontrol edildi. `seyma-data` reposuna, localStorage’a veya ağa
yazım yapılmadı.

## Kök Markdown envanteri

| Dosya | Satır | Sınıf | Hedef karar | Gerekçe/risk |
|---|---:|---|---|---|
| `AGENTS.md` | 3.830 | operational + handoff | Kurallar kökte; tarihçe ayrı fazda arşiv adayı | AI çalışma sözleşmesi ve append-only handoff içeriyor |
| `CLAUDE.md` | 245 | operational | Kökte kalır | Mimari/verification giriş talimatı |
| `GELISTIRME-PLANI.md` | 753 | canonical-roadmap | Kökte kalır | Ana roadmap ve teknik ilkeler tarafından referanslanıyor |
| `SEYMA-V2-PLAN.md` | 82 | canonical-roadmap | `docs/roadmaps/` adayı | Ürün roadmap’i, runtime değil |
| `ILHAM-IBADET-GELISTIRME-PLANI.md` | 388 | canonical-roadmap | `docs/roadmaps/` adayı | Panel/app referansları güncellenmeden taşınamaz |
| `KURAN-YOLCULUGU-GELISTIRME-PLANI.md` | 1.140 | canonical-roadmap | `docs/roadmaps/` adayı | Çok sayıda tarihsel handoff referansı var |
| `ZIKIRMATIK-GELISTIRME-PLANI.md` | 619 | canonical-roadmap | `docs/roadmaps/` adayı | Prompt paketi ve ana roadmap ile bağlı |
| `KURAN-YOLCULUGU-YENI-OTURUM-PROMPTU.md` | 226 | historical-prompt | `docs/prompts/legacy/` adayı | Eski oturum başlangıç metni |
| `ZIKIRMATIK-IPHONE16-PREMIUM-PROMPT-PAKETI.md` | 844 | historical-prompt | `docs/prompts/legacy/` adayı | Eski faz prompt paketi |
| `ZIKIRMATIK-REDESIGN-DENETIMI.md` | 322 | audit | `docs/audits/` adayı | Denetim/karar belgesi, roadmap değil |

### Taşıma önceliği

1. Düşük risk: üç historical/audit dosyası.
2. Orta risk: dört ürün roadmap’i; tüm güncel linkler ve prompt yolları
   güncellendikten sonra.
3. Yüksek risk: `AGENTS.md` handoff bölümlerinin ayrı append-only arşive
   alınması; byte/hash karşılaştırması olmadan başlanmayacak.

## Mevcut `docs/` yapısı

| Dizin | İçerik | Canonical durum |
|---|---|---|
| `docs/panel/plans/` | Panel gözlemlenebilirlik ve tasarım planları | Canonical |
| `docs/panel/prompts/` | Panel `00–13` sıralı promptlar | Canonical |
| `docs/panel/ledgers/` | Panel paired ledger’ları | Canonical |
| `docs/` kökü | Index ve repo organizasyon planı | Canonical |
| `docs/roadmaps/` | Henüz oluşturulmadı | M1’de açılacak |
| `docs/prompts/legacy/` | Henüz oluşturulmadı | M1’de açılacak |
| `docs/audits/` | Henüz oluşturulmadı | M1’de açılacak |
| `docs/archive/` | Henüz oluşturulmadı | M2’de açılacak |

## Link sonucu

Read-only Markdown taraması:

- Toplam Markdown dosyası: **35** (10 kök + 25 `docs/` altında; bu manifestolar ve ledger’lar dahil).
- Yerel Markdown linki: **73**.
- Yeni paket kaynaklı kırık link: **0**.
- Önceden var olan tek kırık hedef: `AGENTS.md` içindeki
  `seyma_motivation_v2_package/README.md`; ilgili yerel paket mevcut olmadığı
  için bu fazda oluşturulmadı veya değiştirilmedi.

Bu eski kırık hedef, taşıma yapıldığı anlamına gelmez ve M1’e başlamadan önce
ayrı bir kullanıcı kararı gerektirir.

## M0 kabul kapısı

- [x] Kök Markdown dosyaları sınıflandırıldı.
- [x] Her dosya için hedef dizin ve risk belirlendi.
- [x] `docs/` canonical panel yapısı korunuyor.
- [x] 66 yerel link tarandı; yeni kırık link yok.
- [x] Dosya taşıma/silme yapılmadı.
- [x] Kullanıcı verisi, `seyma-data`, localStorage ve ağ yazımı yok.

**M0 sonucu:** `completed`; M1 historical belge taşıması bu kapının dışında
ve ayrıca başlatılmayı bekliyor.
