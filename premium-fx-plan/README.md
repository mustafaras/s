# Şeyma Premium FX

**Aktif seri:** **FX-2 — "Hissedilir Premium"** · v2.0 · 28 kart · 2026-09-06
**Dal:** `premium-fx-gorsel-yuzey` · **LOCAL ONLY** (push/merge/deploy yok)
**Durum:** 🟡 Dalga 0 · sıradaki kart **FX2-01**

---

## Bu Klasör Ne İçin Var

FX-1 serisi (91 prompt) bir **FX API'si** üretti; kullanıcı geri bildirimi
ise net oldu: *uygulama hâlâ premium hissettirmiyor.* 2026-09-06'da yapılan
kod denetimi nedeni buldu — motor yazılmış ama **prize takılmamıştı**.

FX-2, aynı hatayı yapmamak için birim olarak API'yi değil **kapsamı** alır:
her prompt, ölçülebilir bir kapsam sayısını yükseltmek zorundadır.

> **Tek cümlelik teşhis:** `SeyAudio.tap` uygulamanın hiçbir yerinden
> çağrılmıyor, `SeyFx.ripple` çağrılamayacak şekilde bağlı,
> `.sey-ripple/.sey-shimmer/.sey-enter` sınıfları hiç basılmıyor ve haptik
> katmanının tamamı iPhone'da sessiz bir no-op.

---

## Okuma Sırası

**Her oturumun başında (bu sırayla):**

1. [`TESHIS.md`](TESHIS.md) — **önce bunu oku.** Kanıtlı kök neden analizi.
2. [`PLAN-FX2.md`](PLAN-FX2.md) — dalgalar, değişmezler (I1–I8), sözleşme (S1–S8).
3. [`.anti-amnesia/CURRENT-STATE.md`](.anti-amnesia/CURRENT-STATE.md) — şu an nerede durulduğu.
4. [`.anti-amnesia/FX2-STATE.json`](.anti-amnesia/FX2-STATE.json) — makine-okur durum.
5. [`.prompts/FX2-KATALOG.md`](.prompts/FX2-KATALOG.md) — sıradaki kart.

**Konuya göre:**

| Konu | Belge |
|---|---|
| Ölçüm, eşikler, "bitti" tanımı | [`KAPSAM-OLCUMU.md`](KAPSAM-OLCUMU.md) |
| **Renk kararı + canlı zemin** | [`RENK-VE-ZEMIN.md`](RENK-VE-ZEMIN.md) |
| Ses motoru ve palet | [`SES-TASARIMI.md`](SES-TASARIMI.md) |
| Token'lar, geçişler, malzeme | [`HAREKET-SISTEMI.md`](HAREKET-SISTEMI.md) |
| Veri güvenliği, erişilebilirlik | [`SAFEGUARDS.md`](SAFEGUARDS.md) |
| Push/deploy yasağı | [`LOCAL-ONLY-IMPLEMENTATION.md`](LOCAL-ONLY-IMPLEMENTATION.md) |
| `app.js` bölme stratejisi (ayrı program) | [`MODULARIZATION.md`](MODULARIZATION.md) |
| FX-1 tarihçesi | [`arsiv/FX1-OZET.md`](arsiv/FX1-OZET.md) |

---

## Seri Haritası

| Dalga | Kartlar | Konu | Ana hedef |
|---|---|---|---|
| 0 | 01–02 | Ölçüm + hareket/renk token'ları | araç kurulur |
| **1** 🎨 | 03–05 | **Pembe → Şampanya Altını** | **M10 11→0, M11 5→2** |
| **2** ⭐ | 06–10 | **Delege dokunma katmanı** | **M2 %0 → ≥%95** |
| 3 🔊 | 11–14 | Ses kimliği v2 (11 ses) | M3 13 → ≥200 |
| 4 | 15–18 | Hareket sistemi | M5 ≥8, M6 ≥10 |
| **5** 🌦️ | 19–23 | **Canlı zemin (hava+mevsim+güneş)** | **M12 0 → ≥18** |
| 6 | 24–25 | Malzeme + aurora v2 | M7 ≥0,80 |
| 7 | 26–28 | Varsayılanlar + kapanış | M8 → 0 |

**En yüksek etkili kart:** [`FX2-06`](.prompts/FX2-06.md) — tek delege
katmanla 361 butonun tamamı tek seferde kapsanır.

**En görünür kart:** [`FX2-03`](.prompts/FX2-03.md) — pembe salt token
seviyesinde (11 hex); ~11 tanım 65 kullanım noktasını birden değiştirir.

**En çok "sıkılmayı önleyen" kart:** [`FX2-21`](.prompts/FX2-21.md) —
`data.weather` zaten canlı; **yeni ağ çağrısı olmadan** 8 hava sahnesi.

---

## Kapsam Tablosu (taban → hedef)

| Metrik | Taban | Hedef |
|---|---:|---:|
| Basma geri bildirimi alan buton | **0 / 361** | ≥ 343 |
| Ses çıkaran etkileşim | 13 | ≥ 200 |
| Ripple çalışan buton | **0** | ≥ 325 |
| Canlandırılan sayaç | 1 | ≥ 8 |
| Çıkış animasyonlu overlay | **0 / 13** | ≥ 10 |
| Hareket token uyumu | 0,21 | ≥ 0,80 |
| Kapalı gelen premium ayar | 4 | **0** |
| iOS'ta çalışan geri bildirim kanalı | **0** | ≥ 2 |
| **Pembe token** | 11 | **0** |
| **Palet ailesi** | 5 | **≤ 2** |
| **Canlı zemin sahnesi** | **0** | **≥ 18** (192 kombinasyon) |
| **Kontrast (8 çift)** | — | **8/8** |

---

## Hızlı Komutlar

```bash
# durum
cat premium-fx-plan/.anti-amnesia/FX2-STATE.json
sed -n '1,30p' premium-fx-plan/.anti-amnesia/CURRENT-STATE.md

# doğrulama (her kart sonunda)
node --check app.js && node --check app/core/mediaFx.js
node .claude/skills/run-seyma/driver.mjs 2>&1 | grep -c '^FAIL'
for f in tests/app/test_premium_*.js tests/app/test_fx2_*.js; do
  [ -e "$f" ] || continue; printf '%-46s ' "$(basename $f)"
  node "$f" >/dev/null 2>&1 && echo PASS || echo FAIL; done
node tools/fx-coverage.mjs --gate     # FX2-01'den sonra
```

---

## Kurallar

- **Push / merge / deploy / tag yok** — kullanıcı onayı şart.
- `mustafaras/seyma-data` reposuna **yazılmaz**; okuma serbest.
- Uygulamayı doğrulamak için tarayıcı açma — `run-seyma` headless harness'leri
  kullan (bkz. kök `CLAUDE.md` "DATA SAFETY").
- `MODULARIZATION.md` **değiştirilmez** —
  `tests/app/test_modularization_boundary.js` içeriğine bağlı.
- Cihaz kabulü (K3) yalnız kullanıcıdan gelir; hiçbir rapor K1 kanıtıyla
  "cihazda düzeldi" demez.
