# SKY-00 — ÖN BİLGİ (her kart öncesi bir kez oku)

Bu dosya SKY ve PREM serisinin **ortak kurallarıdır**. Her kartta tekrar
edilmez. Bir karta başlamadan önce bunu oku, sonra yalnız o kartı uygula.

---

## 1. ALTIN KURAL — SADECE KARTTAKİ İŞ

Kart ne diyorsa **yalnız onu** yap. Fazladan iyileştirme yapma, başka dosyaya
dokunma, "bu arada şunu da düzelteyim" deme. Her kart tek bir commit'tir.

**Karar verme.** Kartta belirtilmemiş bir seçim gerekiyorsa **DUR** ve
kullanıcıya sor. Tahmin etme, uydurma.

---

## 2. VERİ GÜVENLİĞİ — PAZARLIK YOK

1. `mustafaras/seyma-data` reposuna **YAZMA**. Okuma serbest.
2. Gerçek token / parola / 2FA **isteme, doldurma, otomatikleştirme**.
3. `?forceSync=1` kullanma, `localStorage['seyma-sync-force']` **set etme**.
4. Yerel sunucu **yalnız `127.0.0.1:9000`**. **Turn bitmeden durdur:**
   `pkill -f nocache.py`
5. `git push` **YOK**. `git commit` serbest.
6. Test verisi **daima sentetik**, tarayıcıda **izole bağlam**.

---

## 3. ASLA DEĞİŞMEYECEK SAYILAR

Her commit'ten önce çalıştır. Biri bile tutmuyorsa **DUR**, değişikliğini
geri al ve kullanıcıya bildir.

```bash
grep -oE 'App\.[A-Za-z0-9_]+\s*=[^=]' app.js | grep -oE 'App\.[A-Za-z0-9_]+' | sort -u | wc -l   # 718
grep -o 'onclick=' app.js | wc -l                        # 391
grep -c '<script src="app.js' index.html                 # 1
grep -c 'preventDefault' app/core/mediaFx.js             # 0
grep -c 'setInterval'    app/core/timeTheme.js           # 0
grep -c 'fetch('         app/core/timeTheme.js           # 0
grep -c 'createElement'  app/core/timeTheme.js           # 0
```

---

## 4. HER KARTTAN SONRA ÇALIŞTIRILACAK KAPI

```bash
node --check app/core/skyFx.js
node tests/app/test_sky_fx.js
for t in tests/app/*.js tests/panel/*.js tests/quran/*.js; do
  node "$t" >/dev/null 2>&1 || echo "FAIL $t"; done
node .claude/skills/run-seyma/driver.mjs 2>&1 | grep -c '^FAIL'
```

Beklenen: `test_sky_fx.js` PASS · başka hiçbir `FAIL` satırı yok · driver `0`.

---

## 5. ÜÇ TUZAK — BUNLARA DÜŞME

**Tuzak 1 — CSS yorumu.** `app/styles.css` içinde bir **yorum satırında**
`amb-wx-` veya `amb-time-` yazarsan `tests/app/test_fx2_ambience.js` düşer.
Sözleşme testi düz metin taraması yapıyor. Yorumlarda bu ekleri **kullanma**.

**Tuzak 2 — Sözleşme.** `amb-wx-*` seçicileri **yalnız** `#sey-aurora::after`
hedefleyebilir ve opaklıkları **≤ 0,30** olmalı. Header bu yüzden ayrı
`sky-time-*` / `sky-wx-*` ad alanında. Bu ayrımı **bozma**.

**Tuzak 3 — Pipe'tan sonra `$?`.** `komut | tail; echo $?` sana `tail`'in
çıkış kodunu verir. `node tools/fx-coverage.mjs --gate` gerçekten `exit 1`
döner (M7 = 0,62, onaylı tavan) — bu **normaldir**, panik yapma.

---

## 6. DÜRÜSTLÜK

- Ölçmediğin şeye "çalışıyor" **deme**. "Ölçülemedi + neden" yaz.
- Test seni düşürürse **testi gevşetme** — kodunu düzelt. Testi değiştirmen
  gerektiğini düşünüyorsan **DUR ve kullanıcıya sor**.
- "Cihazda düzeldi" **deme**. Cihaz kabulü yalnız kullanıcıdan gelir.

---

## 7. COMMIT BİÇİMİ

```
sky: SKY-07 bulut katmanı

<2-3 satır ne yapıldı>
Doğrulama: test_sky_fx PASS, 94 fixture 0 FAIL, driver 0.

Co-Authored-By: Claude Opus 5 <noreply@anthropic.com>
```

Commit sonrası `premium-fx-plan/.anti-amnesia/SKY-STATE.json` içinde o kartı
`"done"` yap.
