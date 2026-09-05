---
code: FX-P-91
name: Emoji-ikon temizligi (premium yuzeyler → icon() SVG)
phase: FX-WAVE-2 / Dalga 9.5
agent: integration
prerequisites:
  - FX-P-87 tamamlandi
input_files:
  - /Users/m_ras/Desktop/seyma/app.js
output_files:
  - /Users/m_ras/Desktop/seyma/app.js
forbidden:
  - genel marka emojilerine dokunma (🦩 maskot, toast ✨, onboarding metinleri — kapsam DIŞI)
  - App.* yuzeyini degistirme (yalniz render string'leri)
  - yeni bagimlilik/ikon kutuphanesi (mevcut icon() helper)
  - git push / PR / deploy
---

# FX-P-91 · Emoji-ikon temizliği (premium FX yüzeyleri)

## Amaç

**K1 kuralının temizlik kartı:** Premium FX'in kendi oluşturduğu yüzeylerde emoji **ikon** olarak kullanılmış; bunlar mevcut `icon()` (Lucide SVG) helper'ına çevrilir. Kullanıcının kuralı: **emoji ikon kesinlikle kullanılmaz; kullanılmışsa düzeltilir.**

## Kapsam Kararı (kritik — genişletme yasak)

**DÜZELTİLECEK (premium FX'in ürettiği yüzeyler):**

| Konum | Mevcut | Yerine |
|---|---|---|
| `app.js:12524` — `fxRows` satırı | `'🎙️ Sesli rehberlik'` | `icon('mic',15)+' Sesli rehberlik'` (row[1] render noktasında icon eklenir, veri satırında emoji silinir) |
| `app.js:12542` — sesli rehberlik kartı başlığı | `'🎙️ Sesli rehberlik'` | `icon('mic',15)+' Sesli rehberlik'` |
| `app.js:12527` — Premium Atmosfer kartı başlığı | `'✨ Premium Atmosfer'` | `icon('sparkles',15)+' Premium Atmosfer'` |

**DOKUNULMAZ (kapsam DIŞI — uygulama geneli marka dili):**

- 🦩 maskot (wordmark, auth, splash amblem, kriz odası kicker'ları, rapor başlığı, `<title>`)
- Toast/buton metinlerinin içindeki üslup emojileri (`'...yeşillendi ✨'`, `'Giriş yap ✨'`, `'Bu durak tamam 🦩'`)
- `app/styles.css:662` `.sg-faith-preview-card::after` 🌙 (Saygı modülü, FX değil)
- Bunların sahibi FX serisi değil; değiştirmek I2/render regresyon riski taşır ve kullanıcı kuralı FX yüzeyleriyle sınırlıdır. İstenirse ayrı kart açılır.

## Kesin Bağlantı Noktaları (doğrulanmış)

- `icon()` helper'ı app.js'te global mevcut (ör. `app.js:12625` `icon('phone',16)`, `app.js:11873` `icon('pencil',15)`) — yeni bağımlılık YOK.
- `app.js:12524`: `fxRows` dizisi `['voiceGuidance','🎙️ Sesli rehberlik','Kritik anlarda...']` biçiminde; satır render'ı `row[1]`'i doğrudan basıyor (`app.js:12528` civarı).
- `app.js:12527` ve `12542`: iki kart başlığı yukarıdaki tabloda.

## Adımlar

1. **`FX-PROMPT-STATE.json`:** `activePrompt: "FX-P-91"`.

2. **`app.js:12524`** veri satırında emoji'yi kaldır:
   ```js
   ['voiceGuidance','Sesli rehberlik','Kritik anlarda kısa sesli yönlendirmeler'],
   ```
   ve aynı `fxRows` render döngüsünde `row[1]` basılan noktayı `icon('mic',14)+' '+row[1]` yap (tek nokta; diğer satırların ikonu satır türüne göre — uiSounds→`volume-2`, richHaptics→`vibrate`, launchRitual→`sparkles`, ambientSounds→`cloud-drizzle` şeklinde küçük bir map objesi kurulabilir; en az karışımı: diziye 4. eleman olarak ikon adı ekle ve render'da `row[3]?icon(row[3],14):''`).

3. **`app.js:12527`** Premium Atmosfer başlığı:
   ```js
   ...gap:6px;">'+icon('sparkles',15)+' Premium Atmosfer</div>...
   ```

4. **`app.js:12542`** Sesli rehberlik kartı başlığı:
   ```js
   ...gap:6px;">'+icon('mic',15)+' Sesli rehberlik</div>...
   ```

5. **Kendi eklediklerini tara (bu seri):** `grep -nP '[\x{1F300}-\x{1FAFF}\x{2600}-\x{27BF}]' app.js` çalıştır; çıktıda **FX-P-85 splash notu** ve **FX-P-87 yeni kontrolleri** emoji içermemeli (zaten temiz). Bu serinin eklediği hiçbir satırda emoji kalmadığını kanıt olarak not et.

6. **Cache-bump (S9):** `index.html` → `app.js?v=20260906a`.

## Yasaklar

Kapsam dışı listedeki emojilere dokunmak; `icon()` helper'ını değiştirmek; yeni settings alanı; `App.*` yüzeyi.

## Test / Kanıt

```bash
cd /Users/m_ras/Desktop/seyma
node --check app.js
node .claude/skills/run-seyma/driver.mjs
node .claude/skills/run-seyma/zikr-harness.mjs          # 95/95
node tests/app/test_premium_settings.js
node tests/app/test_premium_voice.js
```

Fixture kanıtı (`test_premium_settings.js`'e 2 assertion):
1. Ayarlar render çıktısında `'🎙️'` geçmiyor; `'Sesli rehberlik'` metni + `icon('mic'` çağrısı geçiyor.
2. `'✨ Premium Atmosfer'` geçmiyor; `icon('sparkles'` + `'Premium Atmosfer'` geçiyor.

## S6 Değişmezlik Kanıtı

```bash
grep -o 'App\.[a-zA-Z0-9_]*\s*=' app.js | sort -u | wc -l   # değişmedi
grep -o 'onclick="App\.[a-zA-Z0-9_]*' app.js | sort | uniq -c  # değişmedi
```

## Bitiş (S7/S8)

LEDGER + `CURRENT-STATE.md` + durum makinesi; commit: `premium-fx: FX-P-91 premium yüzeylerde emoji-ikon temizliği`. **Push yok.**