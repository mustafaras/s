# Şeyma Premium FX Planı — Claude Opus 5 Devir Promptu

**Tarih:** 2026-08-30
**Gönderen:** Claude Code (kimi-k2.7-code:cloud)
**Alıcı:** Claude Opus 5
**Proje:** Şeyma — private Turkish wellness/mood PWA
**Repo:** `/Users/m_ras/Desktop/seyma`

---

## 🎯 Devredilen Görev

Şeyma uygulamasına **pro-premium görsel ve işitsel FX planı** hazırlamak. Plan artık yalnızca efekt değil; aynı zamanda ~18.805 satırlık `app.js` monolitinin **modülerleştirilmesini** de kapsıyor. **Henüz hiçbir uygulama koduna dokunulmadı.** Sadece plan/spec/test iskelesi üretildi.

---

## 📁 Plan Klasörü

Tüm belgeler şu dizinde:

```
/Users/m_ras/Desktop/seyma/premium-fx-plan/
```

İçindekiler:
- `PLAN.md` — ana plan (v2.0)
- `CODE-MAP.md` — gerçek app.js fonksiyon/satır eşleştirmesi
- `ROADMAP.md` — Faz -1 (modülerleştirme) + Faz 0..6
- `FX-LIBRARY.md` — ses/haptik/görsel kataloğu
- `MODULARIZATION.md` — `app.js` bölme stratejisi
- `SAFEGUARDS.md` — veri güvenliği ve erişilebilirlik kuralları
- `MIGRATE-SPEC.md` — yeni settings alanları için migrate spec
- `REDUCED-MOTION-SPEC.md` — reduced-motion uyumu
- `REVIEW-CHECKLIST.md` — review listesi
- `deliverables/SPEC-FAZ-0..6.md` — faz spec’leri
- `.anti-amnesia/CURRENT-STATE.md` — anti-amnesia durum
- `.anti-amnesia/LEDGER.md` — değişiklik kaydı
- `app-function-map.json` — app.js makine ayrıştırması (18.805 satır, 1.893 fonksiyon)

---

## 🔍 Kod Keşfi (Şu Ana Kadar)

### app.js Gerçekleri

| Ölçüm | Değer |
|-------|-------|
| Toplam satır | 18.805 |
| Üst düzey fonksiyon | 1.893 |
| Render motoru | `render()` ~satır 9688 |
| Tek ses üreteci | `zikrTickSound()` ~satır 8502 |
| Haptic sarmalayıcı | `haptic()` ~satır 6375 |
| Sync başarı girişi | `SeyOnSynced()` ~satır 17.999 |
| Mevcut CSS keyframes | `seyPop`, `seyFloatIn`, `seyShine`, `seyAurora`, `seyRoomGlow`, `seyWordSheen`, `seySynapseDrift` |
| Reduced-motion | Zaten mevcut `@media (prefers-reduced-motion: reduce)` |

### Doğal Modül Sınırları (Tahmini)

constants / prayer / zikir / saygi / quran / motivation / crisis / journal / health / library / report / map / messaging / reminders / profile / settings / sync / render / appSurface / helpers / state / dateUtils.

---

## ✅ Tamamlanan İşler

1. `premium-fx-plan/` klasörü oluşturuldu.
2. `PLAN.md` v2.0 yazıldı (modülerleştirme ön koşulu dahil).
3. `CODE-MAP.md` v2.0 yazıldı (gerçek satır/fonksiyon referansları).
4. `ROADMAP.md` v2.0 yazıldı (Faz -1 eklendi).
5. `FX-LIBRARY.md` v2.0 yazıldı (`SeyAudio`, `SeyHaptics` arayüzüne oturtuldu).
6. `MODULARIZATION.md` v1.0 oluşturuldu (`app.js` bölme stratejisi + `index.html` yükleme sırası + risk tablosu).
7. `app-function-map.json` önceden üretilmişti.

---

## ❌ Devreden İşler (Opus 5’te Devam Edecek)

1. **Plan belgelerini okuyup tutarlılık kontrolü yap.** Özellikle `PLAN.md`, `CODE-MAP.md`, `ROADMAP.md`, `MODULARIZATION.md`, `FX-LIBRARY.md` arasındaki çelişkileri gider.
2. **`app.js`’in henüz derinlemesine okunmamış bölümlerini** (health, report, settings, map, profile, reminders) tara ve `CODE-MAP.md`’ye tam fonksiyon/satır eşleştirmesi ekle.
3. **Her faz için spec’leri** (`deliverables/SPEC-FAZ-0..6.md`) tamamla; spec’ler gerçek fonksiyon adları ve satır numaraları içermeli.
4. **Test fixture iskeletlerini** oluştur:
   - `tests/app/test_premium_audio_fx.js`
   - `tests/app/test_premium_haptics_fx.js`
   - `tests/app/test_modularization_boundary.js`
5. **MIGRATE-SPEC.md** ve **REDUCED-MOTION-SPEC.md**’yi doğrula/genişlet.
6. **Anti-amnesia ledger’ı güncelle.** `.anti-amnesia/LEDGER.md` ve `CURRENT-STATE.md`’ye bu devir kaydı ekle.
7. **Son kullanıcıya özet sun.** Plan tamamlandığında kısa, somut, Türkçe özet çıkar.

---

## ⚠️ Kritik Kısıtlamalar (Kesinlikle Bozulmamalı)

1. **Uygulama koduna dokunma.** Bu aşama plan/spec/test only.
2. **Veri güvenliği:** `data`, `migrate()`, `sync.js`, `save()`, GitHub Contents API akışını, `localStorage` key’lerini değiştirme.
3. **AGENTS.md / CLAUDE.md kurallarına uygundur.** Özellikle:
   - Browser ile generic “çalışıyor mu” doğrulaması yapma.
   - `mustafaras/seyma-data`’ya yazma yok.
   - Başlatılan yerel sunucu varsa kapat.
   - Headless `run-seyma` harness’leri kullan.
4. **Erişilebilirlik:** `prefers-reduced-motion: reduce` ve kullanıcı ayarlarına saygılı kal.
5. **Dil/Ton:** UI metinleri Türkçe, sıcak, emoji-destekli; teknik spec İngilizce/Türkçe karışık olabilir ama tutarlı.

---

## 🛠️ Doğrulama Komutları

```bash
# Sadece syntax check (app.js'e dokunulmadı, ama yeni testler için kullanılabilir)
node --check app.js

# Mevcut headless testler (değişiklik yoksa geçmeli)
node tests/app/test_faz10_sync.js
node tests/app/test_aeon_message_expand.js
node .claude/skills/run-seyma/driver.mjs
node .claude/skills/run-seyma/zikr-harness.mjs
node tests/panel/test_faz11_panel.js
```

---

## 🧠 Bağlam Özeti (Kompakt)

- Şeyma = vanilla JS/HTML/CSS PWA, GitHub Pages, no build, no package.json.
- `app.js` tek monolit; FX planı onu modüllere ayırmayı öneriyor.
- FX = ses (Web Audio API), haptic (`navigator.vibrate`), mikro-animasyon (CSS keyframes), splash, saat bazlı tema, seasonal tema, sesli rehberlik.
- Kontrol merkezi: `settings.premiumAtmosphere` + alt ayarlar.
- Test: headless Node `vm` harness’leri + yeni FX fixture’ları.

---

## 💬 Kullanıcı Tarafından Vurgulananlar

- “hiper odak” ve “hiper detay” isteniyor.
- app.js 20bin satıra yakın; toparlama/modüler hale getirme plana dahil edildi.
- Süreç Claude Opus 5’te devam edecek.
- Kod değiştirmeden plan hazırlanıyor.

---

**Devre hazır. Opus 5: lütfen önce `PLAN.md`, `MODULARIZATION.md`, `CODE-MAP.md`, `ROADMAP.md`, `FX-LIBRARY.md` oku; ardından devreden iş listesini sırayla tamamla.**
