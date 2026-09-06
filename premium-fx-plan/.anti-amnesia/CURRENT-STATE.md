# Premium FX — Güncel Durum

**Tarih:** 2026-09-06
**Seri:** **FX-2 — "Hissedilir Premium"** (yeni seri açıldı)
**Dal:** `premium-fx-gorsel-yuzey` · **LOCAL ONLY** (push/merge/deploy yok)
**Plan sürümü:** FX-2 v1.0

---

## Şu An Neredeyiz

| | |
|---|---|
| Son tamamlanan prompt | **yok** (seri henüz başlamadı) |
| Sıradaki prompt | **FX2-P-01** — kapsam denetçisi + taban çizgisi |
| Aşama | Dalga 0 — Ölçüm ve Sözleşme |
| Bloklu | yok |
| Uygulama tamamlandı | hayır |

**Durum makinesi:** [`FX2-STATE.json`](FX2-STATE.json)

---

## Neden Yeni Bir Seri Açıldı

FX-1 (91 prompt, ~70 fixture, "DEPLOY-A-HAZIR" kararı) **kapandı** ama
kullanıcı geri bildirimi net: *"tüm fx promptları uygulamama karşın uygulama
hâlâ premium bir his vermiyor."*

2026-09-06'da yapılan kod denetimi bunu doğruladı
([`../TESHIS.md`](../TESHIS.md)):

- `SeyAudio.tap` → `app.js`'te **0 çağrı**
- `SeyFx.ripple` → 1 çağrı, **tetiklenemez** (hiçbir `onclick` `event` geçmiyor)
- `.sey-ripple` / `.sey-shimmer` / `.sey-enter` → markup'ta **0 kullanım**
- `SeyHaptics` 21 çağrı → **iOS Safari'de tamamı no-op**
- 361 butonun 277'si satır içi stille yazılı, **ortak sınıf yok**
- 4 premium ayar varsayılan **kapalı**; bulut TTS anahtar olmadan sessiz
- 717 `App.*` handler'ının **~%3,5'i** herhangi bir FX tetikliyor
- Buna rağmen **9/9 premium fixture yeşil** ← asıl kök neden

**Ders:** Fixture'lar modülü test etti, **bağlantıyı** test etmedi.
FX-2 bu yüzden birim olarak API'yi değil **kapsamı** alır
([`../KAPSAM-OLCUMU.md`](../KAPSAM-OLCUMU.md)).

---

## Taban Çizgisi (2026-09-06, commit `33995dc`)

| Metrik | Taban | Hedef |
|---|---:|---:|
| M1 etkileşimli eleman | 387 | — |
| M2 basma geri bildirimi | **0** | ≥ 343 |
| M3 ses bağlı etkileşim | 13 | ≥ 200 |
| M4 ripple konteyneri | **0** | ≥ 325 |
| M5 canlandırılan sayaç | 1 | ≥ 8 |
| M6 çıkış animasyonlu overlay | **0** | ≥ 10 |
| M7 hareket token uyumu | 0,21 | ≥ 0,80 |
| M8 kapalı gelen premium ayar | 4 | 0 |
| M9 iOS geri bildirim kanalı | **0** | ≥ 2 |

Testler taban anında **yeşil**: syntax OK, `driver.mjs` fail=0,
premium ailesi 9/9.

---

## Sıradaki Oturum İçin

1. Oku: [`../TESHIS.md`](../TESHIS.md) → [`../PLAN-FX2.md`](../PLAN-FX2.md)
   → [`FX2-STATE.json`](FX2-STATE.json)
2. Kart: [`../.prompts/FX2-P-01.md`](../.prompts/FX2-P-01.md)
3. Sözleşme: S1–S8 (`PLAN-FX2.md` §3) · Değişmezler: I1–I8 (§2)
4. **S8 kuralı:** kapsam yükselmediyse kart BLOKLU, seri durur.

---

## Engeller / Bekleyenler

- **Push/merge/deploy:** kullanıcı onayı bekliyor (LOCAL-ONLY)
- **Cihaz kabulü (K3):** iPhone'da ses/basma doğrulaması yalnız kullanıcıdan
- **FX-1 ertelenmiş kartlar (FX-P-66/67):** FX-2 kapsamına **alınmadı**
- **FX-P-88 (hava modu):** FX-1'de bloklu kalmıştı; FX-2 kapsamı dışında
- **`panel.html` / `panel-v2.html`:** bu seride kapsam dışı

---

## FX-1 Arşivi

Tarihsel kayıt korunuyor:
- [`../deliverables/FX-SERI-KAPANIS-BELGESI.md`](../deliverables/FX-SERI-KAPANIS-BELGESI.md)
- [`FX-PROMPT-STATE.json`](FX-PROMPT-STATE.json) (kapalı seri)
- [`LEDGER.md`](LEDGER.md) (append-only, seq 1–70 FX-1)
- [`../arsiv/FX1-OZET.md`](../arsiv/FX1-OZET.md) (ne yapıldı / ne tutmadı)

`monolit-bolumlenme-plan/` bu dosyaların bazılarına atıf yapar — **silinmezler.**
