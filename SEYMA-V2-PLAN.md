# Şeyma 🦩 · v2.0 "İçsel Pusula & Terapi Odası" — Premium Yükseltme Planı

> Kapsamlı, çok premium, iOS 27 diliyle yeniden tasarım + tüm sayfaların
> bilimsel zenginleştirilmesi. **Hiçbir kullanıcı verisine zarar vermeden.**
> Bu belge yaşayan bir yol haritasıdır; her madde tamamlandıkça işaretlenir.

## 0. Değişmez ilkeler (bkz. CLAUDE.md · GELISTIRME-PLANI.md)
- Tek `data` nesnesi; yeni alan → `migrate()` her zaman genişler.
- Tema CSS değişkenleriyle (light + `#root[data-theme="dark"]`), sabit hex yok.
- Overlay/hub deseni birebir korunur.
- Panel aynası: yeni kalıcı kayıt panele de yansır.
- Cache-bust: `index.html` `?v=` bump.
- Gizlilik: sırlar (`ghToken`,`openaiKey`) sync `sanitize()`'te kalır.
- Dil & ton: Türkçe, sıcak, samimi, flamingo/"Sevgili Günışığı".
- **Veri güvenliği: bu sürümde veri modeli değişmez; yalnızca türetilmiş
  (derived) UI + iki gizli-kart tercihi (`settings.hideLocationCard`,
  `settings.hideRepoBanner`) eklenir. Eski kayıtlar `migrate()` ile bozulmaz.**

## 1. İçsel Pusula → "Terapi Odası" dönüşümü ✅
- Kart kapalıyken: sakin `compass` çipi + "İçsel Pusula" başlığı.
- Karta dokununca (açık): ikon `armchair` parıltılı rozete (`motivationBadgeHTML`),
  başlık `.sey-room-title` ile parlayan/gradyanlı **"Terapi Odası"** yazısına
  dönüşür; alt satır "Şeyma & Raşit'in güvenli alanı".
- Mevcut CSS animasyonları (`seyRoomSheen`, `seyShine`) yeniden kullanılır.

## 2. Konum & Hareket kartı + gizleme ✅
- `bugunHTML` sırası: **Repoya bağlan → Konum & Hareket** → hava → Raşit.
- "Repoya bağlan" şeridine küçük **Sakla** (×) → `settings.hideRepoBanner`.
- Konum & Hareket başlığına **Sakla** (×) → `settings.hideLocationCard`.
- Ayarlar'a "Gizlenen kartlar" bölümü → tek dokunuşla geri getir (kilitlenme yok).

## 3. Raşit'in sözleri: rastgele + zengin ✅
- Dokununca **rastgele** (bir öncekiyle aynı olmayacak) not.
- Dizi 150+ nota çıkar; sevgi dolu, destekçi, esprili/nüktedan ton korunur.

## 4. Başlangıç ekranı — iOS 27 yeniden tasarım ✅
- Katmanlı liquid-glass, flamingo 🦩 vurgulu hero, rafine tipografi.
- Dikkat çekmeyen **v2.0** sürüm çipi + üç sade "yenilik" satırı.

## 5. Premium iOS 27 sekme çubuğu ✅
- Yüzen/segment "pill" nav; aktif sekme dolgulu highlight + yumuşak geçiş.

## 6. Bugün dışı sayfaların bilimsel + premium zenginleştirilmesi
- **Sağlık**: fiziksel (uyku/adım/döngü) yanında **Ruhsal Denge** premium kartı —
  7 günlük mod·enerji·stres özeti + bilimsel mikro-notlar (mevcut veriden türetilir).
- **SOS / Harita / Rapor / Luna / Ayarlar**: premium başlık dili + `sciNote`
  bilimsel kartları; fiziksel & ruhsal takibin "Bugün" premium diline hizalanması.

## 7. Veri akışı & panel
- `migrate()`: iki yeni `settings` bool'u güvenle geriye dönük eklenir.
- `sync.js sanitize()`: yeni alanlar sır değil → panele/veri-repoya güvenle akar.
- Panel: türetilmiş/aggregat zenginleştirmeler yeni kalıcı alan gerektirmez;
  gerektiğinde ilgili gün-detayına ayna eklenir.

## Doğrulama
- `node --check app.js` + Node vm + tarayıcı stub ile headless render (light+dark).
- Eski (v1) kayıttan `migrate()` geçerli nesne üretir; panel yeni alan yokken bozulmaz.

## v2.1 — Terapi Odası tam ekran + bilimsel derinleştirme (2026-07-09, 2. tur)
1. **Terapi Odası tam ekran overlay** — kompakt "İçsel Pusula" kartına dokununca
   animasyonlu (seyPop/seyFloatIn) tam ekran açılır; kapanınca (scale+fade) yine
   animasyonlu İçsel Pusula'ya döner (`App.openRoom`/`App.closeRoom`, `ui.roomOpen`,
   `roomOverlayHTML`, `modalsHTML`).
2. **El yazısı imza geri geldi** — overlay başlığında `motivationSignHTML`
   (büyük "Şeyma", küçük "& Raşit") + parlayan `.sey-room-title` "Terapi Odası".
3. **120 günlük metinsel zenginleştirme** — yeni `motivationNarratives.js`:
   4 faz yayı + 12 alan bilimsel notu + güne-özgü anlatı composer (`dayNarrative`).
   Overlay ayrıca programın gizli kalan zengin alanlarını yüzeye çıkarır:
   açıklama, mercek, **bugünün sorusu** (reflectionQuestion), sabah/akşam/zor gün
   notları (appNudge), akşam kontrolü (eveningCheck).
4. **SOS/kriz aç-kapa bug'ı düzeldi** — `App.toggleCard`, `CARD_BUILDERS`'ta kayıtlı
   olmayan kartlarda (SOS "ne denedin"/"tetikleyici") artık durum değiştirip tam
   render eder (eskiden yerinde güncellenemediği için sessizce çalışmıyordu).
5. **Harita** — ay özetine teknik detay: haftanın en tutarlı günü, geçen aya göre
   delta, İçsel Pusula faz ilerlemesi.
6. **Rapor** — yeni "Tutarlılık & Momentum" kartı: 30 günlük tutarlılık %, aktif gün,
   7g momentum + haftanın günleri örüntü grafiği + bilimsel not.
7. **Ayarlar** — "Veri & senkron özeti" (takip günü, toplam tik, kayıt boyutu, bağlantı,
   son kayıt, faz) + "Hakkında / sürüm" (v2.0, modül sürümleri) kartları.
- `index.html`: `motivationNarratives.js?v=…` eklendi, `app.js?v=` bump.
- Doğrulama: `node --check` + genişletilmiş headless harness (27/27 geçti, light+dark).
