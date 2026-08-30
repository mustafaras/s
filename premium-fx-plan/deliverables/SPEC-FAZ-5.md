# Faz 5: Sesli Rehberlik Anları — Detay Spec

**Sürüm:** 2.1  
**Güncellendi:** 2026-08-30  
**Hedef:** Duygusal bağ ve mindfulness desteği kazandırmak.

---

## 5.1 Web Speech API Entegrasyonu

### 5.1.1 `SeyAudio.voice()` Fonksiyonu

**Dosya:** `app/core/mediaFx.js` içine eklenir (`SeyAudio` artık `mediaFx.js` modülünde tanımlı).

```js
function speak(text){
  if(!window.speechSynthesis) return;
  if(!isAllowed()) return;
  var s = (window.SeymaConstants && window.SeymaConstants.data && window.SeymaConstants.data.settings) || {};
  if(s.voiceGuidance !== true) return;
  var u = new SpeechSynthesisUtterance(text);
  u.lang = 'tr-TR';
  u.rate = 0.92;
  u.pitch = 1.05;
  u.volume = 0.7;
  try {
    var voices = window.speechSynthesis.getVoices();
    var tr = voices.find(function(v){ return v.lang === 'tr-TR'; });
    if(tr) u.voice = tr;
  } catch(e){}
  window.speechSynthesis.cancel();
  window.speechSynthesis.speak(u);
}
```

**Not:** `speechSynthesis.getVoices()` async olabilir; voices henüz yüklenmemişse default ses çalışır.

### 5.1.2 Güvenlik Kuralları

- `speak()` sadece kullanıcı etkileşimi (buton tıklaması) ile çağrılmalı.
- Sayfa yüklenince otomatik konuşma yapılmamalı.
- `settings.voiceGuidance` varsayılan **false**.

---

## 5.2 Rehberlik Anları

### 5.2.1 Günlük Işığı Açılış Sorusu

**Konum:** `App.openJournalModal(options)` — `app.js:9109` açılışında.

**Mesaj:** `ui.journalPromptUsed` veya `journalPhasePrompt(mode)` — tanım `app.js:12366` civarı.

```js
function openJournalModal(){
  // ... mevcut kod ...
  var prompt = ui.journalPromptUsed || journalPhasePrompt(mode);
  if(window.SeyAudio) SeyAudio.speak(prompt);
}
```

**Koşul:** Sadece kullanıcı “Günlük Işığı” butonuna tıkladığında; otomatik değil.

---

### 5.2.2 Mod / Stres Yüksekse Yatıştırıcı Mesaj

**Konum:** `App.setStress(v)` — `app.js:8310` veya `App.setMood(id)` — `app.js:8291` sonrası.

**Koşullar:**
- `st >= 4` veya `st >= 4 && en <= 2`
- Kullanıcı mod/stres butonuna tıkladığında
- `settings.voiceGuidance === true`

**Mesaj örnekleri:**
- “Bugün stres yüksek görünüyor. Küçük bir nefes molası iyi gelebilir.”
- “Enerji biraz düşük; kendine yüklenme.”

**Önlem:** Aynı oturumda tekrar tekrar okumamak için `ui.voiceNudgeGiven` bayrağı kullanılabilir.

---

### 5.2.3 Gece Selamı

**Konum:** Uygulama açılışında, eğer saat 22:00+ ise.

**Mesaj:** “İyi geceler, Günışığı. Bugünü bırak, yarın devam ederiz.”

**Koşul:**
- Saat >= 22:00 veya < 05:00
- `settings.voiceGuidance === true`
- `settings.launchRitual === true` (splash gösteriliyorsa)

**Önlem:** Sadece splash’te “dokunarak devam et” butonu varsa, dokununca okunur. Otomatik değil.

---

### 5.2.4 Motivasyon Kartı Onay Mesajı

**Konum:** `motivationTodayCardHTML()` — `app.js:11018` üzerindeki “Tamamladım” aksiyonu veya `roomOverlayHTML()` — `app.js:11062` içindeki kayıt butonu (`App.completeMotivationTask()` — `app.js:11812`).

**Mesaj:** `motivationPersonalLine()` çıktısı özetlenebilir.

- “Bugün kaydettin. Cesaret kanıtı.”

---

## 5.3 Nefes Eşlikçisi

### 5.3.1 Konum

İlham & İbadet sekmesi veya zikir overlay içine entegre edilebilir.

### 5.3.2 4-7-8 Nefes Ritmi

| Faz | Süre | Ses |
|-----|------|-----|
| Nefes al | 4 sn | Yükselen sine tone (440 → 528 Hz) |
| Tut | 7 sn | Sabit hafif drone |
| Ver | 8 sn | Alçalan sine tone (528 → 440 Hz) |

### 5.3.3 Görsel

- Ekran ortasında yavaşça büyüyen/daralan daire.
- Daire büyüyor = nefes al, sabit = tut, daralıyor = ver.

### 5.3.4 Kontrol

- Kullanıcı başlat/durdur butonu.
- `settings.voiceGuidance` veya ayrı `settings.breathGuide` aç/kapa.

---

## 5.4 Reduce Motion Uyumu

- Ses, reduce motion ile doğrudan kapatılmayabilir; ama `settings.voiceGuidance` ayrıca kontrol edilir.
- Nefes dairesi animasyonu reduce motion aktifse anında büyüyüp küçülebilir veya pasif olabilir.

---

## 5.5 Test Planı

### `tests/app/test_premium_voice_guidance.js`

**Seneryolar:**
1. `settings.voiceGuidance === true` iken `speak()` çağrıldığında `SpeechSynthesisUtterance` oluşturur.
2. `settings.voiceGuidance === false` iken hiçbir şey yapmaz.
3. `speechSynthesis` yoksa graceful no-op.
4. `lang` değeri `'tr-TR'`.

### `tests/app/test_premium_breath_guide.js`

**Seneryolar:**
1. Nefes modu başlatıldığında görsel daire elementi oluşur.
2. Reduce motion aktifse animasyon yok.
3. Sesli rehberlik açıkken tone sequence üretilir.

---

## 5.6 Çıktı Listesi

- [ ] `SeyAudio.speak()` fonksiyon spec’i
- [ ] Günlük Işığı sorusu seslendirme entegrasyonu
- [ ] Mod/stres yatıştırıcı mesaj entegrasyonu
- [ ] Gece selamı entegrasyonu
- [ ] Motivasyon kartı onay seslendirmesi
- [ ] Nefes eşlikçisi spec’i
- [ ] Test skeleton’ları
