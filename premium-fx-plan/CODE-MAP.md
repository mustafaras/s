# Şeyma Premium FX Planı — Kod Haritası (Code-Map)

**Sürüm:** 2.1
**Tarih:** 2026-08-30
**Kaynak:** `app.js` 18.805 satır (~18810'da biter), `app-function-map.json`, `app/styles.css`

Bu belge, FX planının uygulanacağı gerçek fonksiyon/satır noktalarını eşleştirir. Kullanıcı isteği üzerine “hiper detay” hedeflenmiştir. **Kod değiştirilmeden** referans amaçlıdır.

---

## 1. Global Yapı ve Boot

| Sembol | Satır (yaklaşık) | Açıklama | FX ilişkisi |
|--------|------------------|----------|-------------|
| `SEYMA_VERSION` | 1–50 | Sabit, cache-bust | Yeni FX modüllerinin `?v=` güncellemesi ile ilişkili |
| `KEY` / `TKEY` | 50–100 | LocalStorage / sync anahtarları | `save()` ile FX ayarları da persist olur |
| `icon()` | ~80 | SVG ikon üreteci | İkon animasyonları buradan türetilebilir |
| `HABITS` | ~120 | Ana alışkanlık listesi | Tik sesleri her biri için aynı |
| `SOUL_ACTIVITY_CATALOG` | ~130 | Ruhsal aktivite kataloğu | - |
| `PRAYER_NAMES` / `PRAYER_CITIES` | ~160–190 | Namaz vakitleri sabitleri | - |
| `data` / `ui` / `dark` | boot bölümü | Global durumlar | `settings.*` FX anahtarları burada |
| `migrate(d)` | boot bölümü (~4400–4600) | Geriye dönük uyumluluk | Tüm FX ayarları varsayılan değer eklenmeli |
| `save()` | boot civarı | LocalStorage + sync schedule | FX değişiklikleri `save()` sonrası sync etmezse panelde görünmez |
| `render()` | 9688 | Tüm uygulama render motoru | FX modülleri `render`’den önce yüklenmeli |

---

## 2. Yardımcı Fonksiyonlar (Helpers)

| Sembol | Satır | Açıklama | FX giriş noktası |
|--------|-------|----------|------------------|
| `segTabs(...)` | ~4000–4300 | Segment tab UI | Aktif tab geçiş animasyonu |
| `progBar(...)` | ~4500 | İlerleme çubuğu | Shimmer / gradient motion |
| `starRow(...)` | ~4700 | Yıldız satırı | Tap feedback |
| `miniBars(...)` | ~4900 | Mini bar grafik | Pop animasyonu |
| `statTile(...)` | ~5100 | İstatistik karo | Count-up sayılar |
| `collapsibleCardHTML(...)` | ~5300 | Açılır kart | Açılış/kapanış float/fade |
| `toast(...)` | ~6000 | Toast | Ses + haptik |
| `confetti()` | ~6100 | Konfeti | Zaten görsel; haptik eşlik edebilir |
| `haptic(ms)` | 6375 | `navigator.vibrate` | **Tek mevcut haptic noktası** |

**FX stratejisi:** `toast`, `confetti`, `haptic` zaten efekt köprüleri; bunlar `SeyHaptics` / `SeyAudio` çağrılarıyla zenginleştirilecek.

---

## 3. Sensory / Audio

| Sembol | Satır | Açıklama |
|--------|-------|----------|
| `zikrTickSound()` | 8502 | Zikirmatik tiki; uygulamadaki **tek Web Audio API** kullanıcısı |

**FX stratejisi:** `zikrTickSound` mevcut inline Web Audio kullanımını korur; yeni `SeyAudio` modülü tarafından beslenecek. Ortak `AudioContext` kullanımı sağlanacak.

---

## 4. Action Handlers — Efekt Tetikleyicileri

| Sembol | Satır | Tetikleyici | Önerilen FX |
|--------|-------|-------------|-------------|
| `App.toggleHabit(key)` | 8228 | Alışkanlık tik | `SeyAudio.tap()` + `SeyHaptics.tap()` + check morph |
| `App.setMood(id)` | 8291 | Ruh hali seç | `SeyAudio.tap()` + soft pop |
| `App.waterAdd(n)` | 8306 | Su ekle | `SeyAudio.tap()` + `SeyHaptics.water()` + ripple |
| `App.addCaffeineDrink(typeId)` | 8314 | Kafein içeceği ekle | `SeyAudio.tap()` |
| `App.caffeineCups(n)` | 8321 | Kafein fincan adedi | `SeyAudio.tap()` |
| `App.setCaffeineMode(m)` | 8317 | Kafein modu değiştir | `SeyAudio.tap()` |
| `App.zikirTap()` | ~8500 civarı | Zikirmatik | Mevcut `zikrTickSound()` zaten var; haptik ekle |
| `App.openCrisis(kind)` | 9099 | Kriz odası aç | `haptic([16,40,16])` mevcut; FX ile zenginleştirilebilir |
| `App.completeCrisis()` | 9105 | Kriz kaydet | `SeyAudio.success()` + `SeyHaptics.success()` |
| `App.openJournalModal(...)` | 9109 | Günlük modal aç | `haptic([12,28,12])` mevcut |
| `App.saveJournal()` | 9114 | Günlük kaydet | `SeyAudio.success()` + `SeyHaptics.success()` |
| `App.saveQuote()` | 8376 | Alıntı kaydet | `SeyAudio.success()` |
| `App.saveSoulActivity()` | 8943 | Ruhsal aktivite kaydet | `SeyAudio.success()` |
| `App.completeMotivationTask(status)` | 11812 | Motivasyon görevini tamamla | `SeyAudio.success()` + `SeyHaptics.success()` |
| `App.confirmMotivationMinimum()` | 11847 | Motivasyon minimum tamamla | `SeyAudio.tap()` |
| `App.setLocationMode(m)` | 9250 | Konum modu | `SeyAudio.tap()` |
| `App.toggleVacationCard()` | 9117 | Tatil kartı aç/kapa | `SeyAudio.tap()` |
| `App.setActivityLevel(level)` | 9470 | Aktivite seviyesi | `SeyAudio.tap()` |
| `App.markSaygiRead()` | 8195 | Saygı öncüsünü okundu işaretle | `SeyAudio.success()` + `SeyHaptics.success()` |
| `App.openQibla()` | 15932 | Kıble pusulası aç | `SeyAudio.tap()` + `seyFloatIn` |
| `App.setHijriOffset(...)` | ~15900 civarı | Hicri ofset | `SeyAudio.tap()` |
| `App.sendAeonMessage(...)` | ~17.000–17.500 | ÆON mesaj gönder | `SeyAudio.tap()` + balon pop |
| `App.sendLunaVoice(...)` | ~17.500 | Luna ses | `SeyAudio.tap()` |
| `App.syncNow()` | 9513 | Anlık senkronizasyon | `SeyAudio.tap()` + spinner |

**Not:** Handler adları değişmeyecek; yalnızca gövdelerine FX çağrıları eklenecek.

---

## 5. Render Motoru ve Tab Builder’ları

| Sembol | Satır | Açıklama | FX ilişkisi |
|--------|-------|----------|-------------|
| `render()` | 9688 | Sekme yönlendirici ve tam yenileme | Tüm builder'ları çağırır; FX modülleri buradan önce initialize edilmeli |
| `appHeaderHTML()` | 16140 | Üst bar (sync durumu, başlık) | Sync durum ikon animasyonu |
| `navHTML()` | 16159 | Alt navigasyon | Aktif sekme vurgu animasyonu |
| `bugunHTML()` | 12180 | Bugün sekmesi ana builder | Kartların float-in ve stagger'ı |
| `saglikHTML()` | 13886 | Sağlık sekmesi | Halka/pulse animasyonları |
| `saygiHTML()` | 15869 | İlham & İbadet / Saygı sekmesi | Kandil badge glow, kıble açılışı |
| `mesajHTML()` | 18567 | Mesaj / ÆON sekmesi | Balon pop, yeni mesaj ding |
| `raporHTML()` | 13153 | Rapor sekmesi | Grafik/heat-map reveal |
| `ayarlarHTML()` | 13221 | Ayarlar sekmesi | Toggle feedback |
| `modalsHTML()` | 16781 | Tüm modalları toplayan katman | Modal açılış/kapanış animasyonları |

### 5a. Bugün Sekmesi Yapıcıları (~9800–12180)

| Sembol | Satır | Açıklama | FX ilişkisi |
|--------|-------|----------|-------------|
| `onboardingHTML()` | 9890 | İlk kurulum / hoş geldin ekranı | Launch ritual, `seyFloatIn` |
| `psychHTML()` | 10064 | Psikolojik tarama mini kartı | Checklist completion pulse |
| `beslenmeCardHTML(rec)` | 10201 | Beslenme kartı | Meal log tap feedback |
| `waterCard(rec)` | 10292 | Su kartı | Ripple + tick morph |
| `moodCardHTML(rec)` | 10345 | Ruh hali kartı | Soft pop on selection |
| `reflectionCardHTML(rec)` | 10382 | Yansıma kartı | - |
| `habitsCardHTML(rec)` | 10408 | Alışkanlık kartı | Tik morph + haptic |
| `healthSetupCardHTML(...)` | 10478 | Sağlık kurulumu / cihaz bağlantısı | Connect success chime |
| `locationCardHTML()` | 10532 | Konum kartı | - |
| `vacationCardHTML(rec)` | 10869 | Tatil / izin kartı | Expand/collapse float |
| `onThisDayCard()` | 10931 | “Bugün tarihte” kartı | - |
| `motivationTodayCardHTML()` | 11018 | Günlük motivasyon kartı | Task completion confetti |
| `roomOverlayHTML()` | 11062 | Terapi odası overlay kabuğu | `seyRoomGlow`, `seyFloatIn` |
| `roomBodyHTML(...)` | 11106 | Terapi odası gövdesi | Path/progress shimmer |
| `roomPathHTML(...)` | 11111 | Terapi odası yol haritası | Active step glow |
| `hubTilesHTML()` | 11853 | Hub önizleme karoları | Hover lift / tap pop |
| `dailyPhotoCardHTML()` | 12131 | Günün fotoğrafı kartı | Upload success sparkle |
| `journalLightCardHTML(...)` | 12418 | Günlük önizleme kartı | Saved-state glow |
| `journalModalHTML()` | 12424 | Günlük tam ekran modal | `seyFloatIn` açılış |
| `crisisModalHTML()` | 12560 | Kriz odası modal | Urgent haptic + fade |
| `magnesiumBannerHTML(date)` | 13029 | Magnezyum banner | Banner shine |
| `magnesiumCardHTML(date)` | 13068 | Magnezyum kart | - |

### 5b. Hero / Motivasyon Alan Yapıcıları (~11900–12130)

| Sembol | Satır | Açıklama | FX ilişkisi |
|--------|-------|----------|-------------|
| `rasitBubbleHTML(curIdx)` | 11909 | Raşit karakter balonu | Typewriter / balon pop |
| `heroStatsHTML(rec)` | 11930 | Hero istatistikler | Count-up |
| `heroTargetsHTML(rec)` | 11949 | Hedefler özeti | Progress shimmer |
| `heroPremiumStatsHTML(viewDate)` | 12011 | Premium vurgulu hero istatistikler | **Premium FX için ideal giriş noktası** |
| `gununHavasi(...)` | 12049 | Günün havası metni | - |
| `heroScienceLine(rec)` | 12063 | Bilimsel özet satırı | - |
| `rasitActionsHTML()` | 12086 | Raşit aksiyon butonları | Tap feedback |
| `rasitContactHTML()` | 12118 | Raşit iletişim alanı | - |

---

## 6. Sağlık Sekmesi (saglikHTML ~13886)

| Sembol | Satır | Açıklama | FX ilişkisi |
|--------|-------|----------|-------------|
| `saglikHTML()` | 13886 | Sağlık sekmesi ana builder | Sekme açılış float |
| `activityRings(rec)` | 13357 | Aktivite halkaları | Ring fill / pulse |
| `sparkCard()` | 13379 | Spark özet kartı | Shine |
| `sleepReadiness(rec)` | 13395 | Uykuya hazır olma kartı | Bedtime glow |
| `sleepPrepCard(rec)` | 13522 | Uyku hazırlık kartı | Wind-down transition |
| `bodyCard(rec)` | 13562 | Vücut ölçüm kartı | - |
| `labCard()` | 13642 | Tahlil kartı | Upload success |
| `discomfortCard(rec)` | 13713 | Rahatsızlık / semptom kartı | Heat map reveal |
| `mentalBalanceCard(rec)` | 13783 | Mental denge kartı | Balance scale tilt |
| `healthSleepCard(rec)` | 13834 | Uyku detay kartı | - |
| `healthWalkCard(rec)` | 13855 | Yürüyüş kartı | Step milestone |
| `healthAppleCard(rec)` | 13875 | Apple Health bağlantı kartı | Connect chime |

---

## 7. Rapor Sekmesi (raporHTML ~13153 + Helpers ~12780)

| Sembol | Satır | Açıklama | FX ilişkisi |
|--------|-------|----------|-------------|
| `raporHTML()` | 13153 | Rapor sekmesi ana builder | Chart reveal |
| `lastNDays(n)` | 12778 | Son N gün verisi | - |
| `habitRate(days,key)` | 12779 | Alışkanlık başarı oranı | Bar fill |
| `moodDist(days)` | 12780 | Ruh hali dağılımı | Donut / pie morph |
| `monthlySummary()` | 12781 | Aylık özet | - |
| `trendBars(days,valFn,grad)` | 12783 | Trend çubukları | Staggered grow |
| `nextMilestone(streak)` | 12784 | Sonraki kilometre taşı | Milestone pop |
| `moodScoreOf(rec)` | 12786 | Ruh hali skoru | - |
| `avgOf(a)` | 12787 | Ortalama hesap | - |
| `weekSelfCard()` | 12788 | Haftalık öz değerlendirme | Reveal |
| `corrInsights()` | 12814 | Korelasyon içgörüleri | - |
| `consistencyMomentumCard()` | 12830 | Tutarlılık momentumu | Flame / streak glow |
| `badgesGrid()` | 12864 | Rozet ızgarası | Badge unlock pop |
| `weeklyStepRecap()` | 12885 | Haftalık adım özeti | - |
| `distanceRecapCard()` | 12916 | Mesafe özeti | - |
| `moodHeatmapCard()` | 12949 | Ruh hali heat-map | Cell color reveal |

---

## 8. Ayarlar Sekmesi (ayarlarHTML ~13221)

| Sembol | Satır | Açıklama | FX ilişkisi |
|--------|-------|----------|-------------|
| `ayarlarHTML()` | 13221 | Ayarlar sekmesi ana builder | Sekme float |
| `syncFieldUpdate()` | 9485 | Sync durum metnini güncelle | Status morph |
| `App.syncNow()` | 9513 | Anlık senkronizasyon butonu | Success chime on `SeyOnSynced` |

**FX eklemesi:** Ayarlara “Görünüm & Ses” bölümü eklenecek; toggle’ları (`premiumAtmosphere`, `uiSounds`, `voiceGuidance`, `ambientSounds`, `richHaptics`, `launchRitual`) `migrate()` ile varsayılan değer almalı.

---

## 9. İlham & İbadet / Zikirmatik + Kur'an Yolculuğu

### 9a. Zikirmatik Alt Sistemi (~14374–14901)

| Sembol | Satır | Açıklama | FX ilişkisi |
|--------|-------|----------|-------------|
| `zikrCounterViewHTML(p,z)` | 14374 | Zikirmatik sayaç görünümü | **Tap FX burada**: ring pulse, number pop |
| `zikrPresetsResultsHTML(p,z)` | 14431 | Hazır zikir sonuçları | Complete chime |
| `zikrPresetsViewHTML(p,z)` | 14487 | Hazır zikir seçimi | Tap feedback |
| `zikrHatimsViewHTML(p,z)` | 14494 | Hatim listesi | Progress reveal |
| `zikrHistoryViewHTML(z)` | 14527 | Zikir geçmişi | - |
| `zikrSettingsViewHTML(z)` | 14553 | Zikir ayarları | Toggle feedback |
| `zikroverlayHTML()` | 14579 | Zikir overlay kabuğu | `seyFloatIn` |
| `App.zikirTap()` | ~8500 civarı | Sayaç artırma | Mevcut `zikrTickSound()`; eklenecek `SeyHaptics.tap()` |

### 9b. Kur'an Yolculuğu (~14902–15658)

| Sembol | Satır | Açıklama | FX ilişkisi |
|--------|-------|----------|-------------|
| `quranRandomVerseStart()` | 14902 | Rastgele ayet girişi | Discovery shimmer |
| `quranApplyRemoteUpdates(...)` | 15671 | Uzaktan delivery/response uygula | State change bell |
| `quranResponseForSurah(rs,sid)` | 15659 | Sure yanıtı göster | - |
| request/delivery/response state machine | 15448–15670 | QY-04 taşıma sözleşmesi | Success/failure feedback |

### 9c. Saygı / İlham & İbadet (~15659–16140)

| Sembol | Satır | Açıklama | FX ilişkisi |
|--------|-------|----------|-------------|
| `saygiHTML()` | 15869 | Saygı sekmesi ana builder | Holy day badge glow |
| `spiritBarHTML()` | 15887 | Spirit bar / ibadet ilerlemesi | Fill pulse |
| `hijriTodayStr()` | 15900 | Hicri tarih metni | - |
| `kandilBadgeFor(date)` | 15906 | Kandil / mübarek gün rozet | **Glow / aurora FX** |
| `qiblaOverlayHTML()` | 15910 | Kıble overlay | `seyFloatIn`, compass needle settle |
| `saygiArticleBodyHTML(...)` | ~15910–15930 | Vikipedi makale gövdesi | Reading progress sheen |
| `saygiPersonModalHTML(...)` | ~16018–16045 | Öncü koleksiyon modal | Open/close float |
| `saygiFloatingReadHTML(...)` | ~16039 | Yüzen okuma butonu | Read-complete morph |
| `wireSaygiReadGate(...)` | ~16045 | Okuma takip / geçit | Unlock feedback |
| `App.openSaygiPreview()` | 8172 | Saygı önizlemesi aç | - |
| `App.openSaygiCollectionPerson(id)` | 8182 | Koleksiyondan öncü aç | - |
| `App.browseSaygiPerson(delta)` | 8189 | Öncü gezinme | Transition swipe |
| `App.markSaygiRead()` | 8195 | Okundu işaretle | Success chime |
| `App.openSaygiReading()` | 8171 | Öncü ile okuma hub aç | - |
| `App.openQibla()` | 15932 | Kıble aç | `seyFloatIn` |
| `App.closeQibla()` | 15988 | Kıble kapat | Fade |

---

## 10. Overlay Hub’lar (~16204–16780)

| Sembol | Satır | Açıklama | FX ilişkisi |
|--------|-------|----------|-------------|
| `overlayShell(...)` | 16204 | Genel overlay kabuğu | Tüm hub açılış/kapanış animasyonları |
| `soulOverlayShell(...)` | 16215 | Soul overlay kabuğu | - |
| `readingOverlayHTML()` | 16227 | 📖 Okuma hub (today/library/stats/quotes) | `seyFloatIn`, kitap ekle pop |
| `App.openReading(options)` | 8328 | Okuma hub aç | `focusModalDialog('sey-ov-card')` |
| `App.closeReading()` | 8329 | Okuma hub kapat | Fade out |
| `App.openBookEdit(id)` | 8357 | Kitap düzenle | - |
| `App.saveQuote()` | 8376 | Alıntı kaydet | Success |
| `watchingOverlayHTML()` | ~16369 | 🎬 İzleme hub | `seyFloatIn` |
| `App.openWatching()` | 8389 | İzleme hub aç | - |
| `App.closeWatching()` | 8390 | İzleme hub kapat | - |
| `App.openTitleEdit(id)` | 8420 | Film/dizi düzenle | - |
| `listeningOverlayHTML()` | ~16500 | 🎧 Dinleme hub | `seyFloatIn` |
| `App.openListening()` | 8444 | Dinleme hub aç | - |
| `App.closeListening()` | 8445 | Dinleme hub kapat | - |
| `App.openTrackEdit(id)` | 8469 | Parça düzenle | - |
| `learningOverlayHTML()` | 16641 | 🎓 Öğrenme hub | `seyFloatIn` |
| `App.openLearning()` | 9024 | Öğrenme hub aç | - |
| `App.closeLearning()` | 9025 | Öğrenme hub kapat | - |
| `learningTodayView()` | 16620 | Öğrenme bugün görünümü | - |
| `soulPracticePickerHTML()` | 16698 | Soul pratik seçici | - |
| `soulActivityTodayView()` | 16646 | Soul aktivite bugün görünümü | - |
| `App.openSoulActivity(type)` | 8919 | Soul aktivite aç | - |
| `App.closeSoulActivity()` | 8940 | Soul aktivite kapat | - |
| `App.openSoulArchive()` | 8963 | Soul arşiv aç | - |
| `App.closeSoulArchive()` | 8964 | Soul arşiv kapat | - |
| `App.saveSoulActivity()` | 8943 | Soul aktivite kaydet | Success |

**FX fırsatı:** overlay açılışlarında `seyFloatIn`, kapanışta `seyFadeOut`, arka planda `seyRoomGlow` kullanılabilir. Mevcut keyframes yeterli.

---

## 11. Modals / ÆON-Luna Mesajlaşma / App Surface (~16781–18567)

| Sembol | Satır | Açıklama | FX ilişkisi |
|--------|-------|----------|-------------|
| `modalsHTML()` | 16781 | Tüm modalları birleştiren katman | Modal yönetimi |
| `aeonChatHTML()` | 18474 | ÆON/Luna sohbet balonları | Balon pop, uzun mesaj expand kalıcılığı |
| `mesajHTML()` | 18567 | Mesaj sekmesi ana builder | New message badge pop |
| `App.sendAeonMessage(...)` | ~17756–17761 | ÆON mesajı gönder ve sync et | Send whoosh, success bell |
| `App.sendLunaVoice(...)` | ~17936–17939 | Luna ses mesajı gönder | Record/send feedback |

**FX giriş noktası:** Yeni mesaj algılandığında `SeyAudio.bell()` + badge `seyPop`.

---

## 12. Sync ve Başarı Geri Bildirimi

| Sembol | Satır | Açıklama |
|--------|-------|----------|
| `SeyOnSyncState(receipt)` | 6198 | Sync durum değişimi |
| `SeyOnSynced(receipt)` | 6208 | **Sync başarı geri bildirimi** |
| `save()` | boot civarı | LocalStorage + `SeySync.schedule` |
| `App.syncNow()` | 9513 | Anlık push |
| `window.SeySync.pushNow()` | çoklu | Anlık push çağrı noktaları |
| `window.SeySync.schedule(...)` | 6255, 16907 vb. | Debounced push planlama |

**FX giriş noktası:** `SeyOnSynced` başarı durumunda `SeyAudio.bell()` + header check morph + `SeyHaptics.success()`.

---

## 13. Timer / Poll Döngüleri

| Sembol | Satır | Açıklama |
|--------|-------|----------|
| `setInterval` 30 sn ÆON yoklama | ~18780 | Yeni mesaj varsa badge pop |
| `setInterval` 30 sn foreground poll | ~18780 | `SeySync.retryIfPending` |

**FX giriş noktası:** Yeni mesaj algılandığında `SeyAudio.bell()` + badge `seyPop`.

---

## 14. Mevcut CSS Animasyon Kaynakları

`app/styles.css` içinde şu keyframes tanımlı:

- `seyPop`
- `seyFloatIn`
- `seyShine`
- `seyAurora`
- `seyRoomGlow`
- `seyWordSheen`
- `seySynapseDrift`

`@media (prefers-reduced-motion: reduce)` zaten mevcut.

**FX stratejisi:** Yeni efektler bu keyframes’leri yeniden kullanmalı; gereksiz yeni keyframes eklenmemeli.

---

## 15. Ayarlar ve migrate()

| Mevcut | Konum | Eklenecek |
|--------|-------|-----------|
| `ayarlarHTML()` | `app.js` ~13221 | “Görünüm & Ses” yeni bölümü; `premiumAtmosphere`, `uiSounds`, `voiceGuidance`, `ambientSounds`, `richHaptics`, `launchRitual` toggle’ları |
| `migrate()` | `app.js` boot (~4400–4600) | Tüm yeni `settings.*` alanlarına varsayılan değer |

---

## 16. Önerilen İlk 10 FX Giriş Noktası (Hızlı Kazanım)

1. **`App.toggleHabit` (8228)** → `SeyAudio.tap()` + `SeyHaptics.tap()` + check morph.
2. **`App.waterAdd` (8306)** → `SeyAudio.tap()` + `SeyHaptics.water()` + ripple.
3. **`App.setMood` (8291)** → `SeyAudio.tap()` + soft pop.
4. **`App.zikirTap` (~8500)** → `SeyHaptics.tap()` (ses zaten `zikrTickSound` ile var).
5. **`App.completeMotivationTask` (11812)** → `SeyAudio.success()` + `SeyHaptics.success()`.
6. **`App.saveJournal` (9114)** → `SeyAudio.success()` + `SeyHaptics.success()`.
7. **`SeyOnSynced` (6208)** → `SeyAudio.bell()` + header check morph.
8. **`App.markSaygiRead` (8195)** → `SeyAudio.success()` + read-button morph.
9. **`App.openQibla` (15932)** → `SeyAudio.tap()` + `seyFloatIn`.
10. **Overlay açılışları** → `seyFloatIn` zaten var; class yönetimi `fxUtils.js` içinde merkezileştirilecek.

---

## 17. Eşleştirme Kuralları

- Satır numaraları `grep_search` ile `app.js` üzerinde doğrulanmıştır; gerçek uygulama öncesi yeniden doğrulanmalı.
- Bir handler’ın adı değişmeyecek; yalnızca gövdesi başka dosyaya taşınabilir.
- FX çağrıları, inline `onclick` handler’larına dokunmadan, handler gövdesinin içine eklenecek.
- Yeni ses/haptik modülleri `window.SeyAudio` / `window.SeyHaptics` olarak expose edilecek.
- Tüm yeni `settings.*` anahtarları `migrate()` ile varsayılan değer alacak.
- Mevcut CSS keyframes (`seyPop`, `seyFloatIn`, `seyShine`, `seyAurora`, `seyRoomGlow`, `seyWordSheen`, `seySynapseDrift`) önce tüketilecek; yalnızca gerçekten yeni hareket gerekirse eklenecek.
