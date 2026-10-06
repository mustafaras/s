# K2F-37 ek — Metin taşma taraması (kontrollü yerel görsel QA, 2026-10-06)
**Yöntem:** gerçek Chromium (boş geçici profil, sunucu/token/forceSync yok, Guard 1; K2F-35 `EKRAN.md`) + `shoot-modal.mjs` `KAO_QA_SCAN=1`. Her yüzeyde diyalogun TÜM alt öğeleri taranır: (1) diyalog dışına taşan metin, (2) `overflow:hidden/clip` ile kırpılan yatay/dikey metin, (3) üç nokta / satır sınırı, (4) kutusundan taşan metin (`scrollWidth>clientWidth`), (5) `nowrap` taşması, (6) gövdede yatay kaydırma. Kaydırmalı alanlar (bilerek) ayrı "bilgi" olarak sayılır; ekran okuyucuya özel (`kao-sr-only`) hariç.
**Yüzeyler:** 15 görünüm + ders oynatıcı (hedef/tanış/kavram/13 görev/panel doğru-yanlış/kelime dizme/uygula/özet) + S0 + ustalık + ilk açılış (5 ekran, yerleştirme dahil). **Genişlikler:** 390 px, 320 px (WCAG 1.4.10 yeniden akış ölçütü) ve **200 px** (≈ %200 yakınlaştırma / büyük metin stres durumu).

| Genişlik | ÖNCE (bulgu) | SONRA (bulgu) | Not |
|---|---|---|---|
| 390 px | 0 metin taşması + 3 kaydırmalı alan | 0 + 3 | kaydırmalı: sûre seçici (bilerek), gramer tablosu, ders kavram tablosu |
| 320 px | 0 + 3 | 0 + 3 | aynı üç alan; sayfa/gövde yatay taşması yok |
| 200 px | **322** | **4** (3 kaydırmalı alan + `kao-stats-table` kaydırmalı) | metin kırpılması/taşması 0 |

**Not (tarayıcı hatası bulgusu):** ilk tarama sürümünde gövdenin kendi `overflow:auto`'su "kaydırma atası" sayıldığından dışarı taşma denetimi bastırılıyordu; düzeltildikten sonra ölçümler yukarıdaki gibidir (390/320 değişmedi).

## 200 px'te bulunan kök nedenler ve düzeltmeler (yalnız `app/kao.css`, +≈0,22 KiB)
1. **Izgara kapları içeriğe göre genişliyordu:** `.kao-stats/.kao-prayer/.kao-map` tek sütun `minmax(0,1fr)` (186+71 bulgu).
2. **Geniş İlerleme tablosu (10 R-bandı):** `.kao-stats-table` kaydırmalı blok.
3. **Başlıklarda uzun sözcük kırılmıyordu** ("söylediklerini", "anlamını"): `.kao-body h2,h3 {overflow-wrap:anywhere}`.
4. **Uygula/Özet satırı** iki eşit dar sütun (Arapça ↔ anlam): ≤260 px'te tek sütun.
5. **Hafta şeridi** 7 sütun `minmax(0,1fr)`; **harf kontrolü mini ders düğmeleri** ve **okuma görünümü düğmeleri** sarar.
6. **NavBar** ≤260 px'te başlık ikinci satıra iner ("‹ Kur'an Arapçası" 12 px'e eziliyordu).
Koruma: `test_kao2_design_contract.js` (altı CSS sözleşmesi) + tarayıcı taraması (`shoot-modal.mjs`).

## Dosyalar
`kiyas-2-metin-tasma-200px-1.png` (stats, prayer, apply), `kiyas-3-metin-tasma-200px-2.png` (görev, ilk açılış, harf kontrolü) — ÖNCE|SONRA; ham bulgu listeleri `tasma-{390,320,200px-once,200px-sonra}-issues.txt`.
**Sınırlar:** 200 px'te çok büyük başlıklar sözcük içinde kırılabilir (okunur, kırpılmaz; son çare); kavram/gramer tabloları dar ekranda yatay kaydırır; gerçek cihaz yakınlaştırması, dinamik yazı boyutu ve VoiceOver yok; CSS payı 13,87/14 KiB (≈0,13 KiB kaldı).
