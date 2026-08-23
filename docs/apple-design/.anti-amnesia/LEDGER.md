# iOS 27 Tasarım Programı — Anti-Amnesia Ledger

> Bu dosya, [`../UYGULAMA-PROMPTLARI.md`](../UYGULAMA-PROMPTLARI.md) içindeki 52 promptluk uygulamanın **gerçek kaynak durumunu (source of truth)** tutar.
> Her bağımsız ajan, oturum veya model değişimi sonrası **önce bunu okur**, kendi adımını çalıştırır, bitince **buraya satır ekler.**

---

## Program özeti

- **Repo:** `mustafaras/s` (GitHub Pages, build yok, `main`'e push = deploy)
- **Hedef:** Şeyma ve ÆON yüzeylerini Apple HIG erişilebilirlik tabanına ve iOS 26/27 Liquid Glass katman sözleşmesine hizalamak — **görsel kimliği ve işlevselliği bozmadan.**
- **Plan:** [`../IOS27-TASARIM-PLANI.md`](../IOS27-TASARIM-PLANI.md)
- **Promptbook:** [`../UYGULAMA-PROMPTLARI.md`](../UYGULAMA-PROMPTLARI.md) — 52 prompt, 10 dalga
- **Makine durumu:** [`../APPLE-DESIGN-STATE.json`](../APPLE-DESIGN-STATE.json)
- **Veri güvenliği:** Şeyma'yı asla tarayıcıda açma; `run-seyma` headless harness'leri ve `tests/` fixture'ları kullan.

---

## Ledger formatı

Her satır bir prompta karşılık gelir. Yeni bir ajan devraldığında:

1. `../APPLE-DESIGN-STATE.json` içindeki `lastCompletedPrompt` / `activePrompt` / `blockedPrompt` değerlerini oku.
2. Bu ledger'daki tamamlanmış kanıtları yeniden üretmeye çalışma.
3. Sıradaki promptu (`lastCompletedPrompt` + 1) çalıştır — **atlama yok.**
4. Doğrulama kapısını (promptbook §S4) çalıştır ve sonucu bu ledger'a ekle.
5. `CURRENT-STATE.md` **Durum** tablosunu ve `APPLE-DESIGN-STATE.json`'ı aynı commit'te güncelle.

```markdown
| Prompt | Kısa Ad | Durum | Commit | Testler | Notlar |
|--------|---------|-------|--------|---------|--------|
```

**Durum değerleri:** `✅ TAMAMLANDI` · `❌ BLOKE` · `⏭️ ATLANDI (onay yok)` · `↩️ GERİ ALINDI`

Bir prompt `❌ BLOKE` ise: `APPLE-DESIGN-STATE.json` içine `blockedPrompt` yazılır, `CURRENT-STATE.md`'nin "Bilinen açık kapı" bölümüne bir paragraf düşülür ve **sonraki prompta geçilmez.**

---

## Prompt durum tablosu

| Prompt | Kısa Ad | Durum | Commit | Testler | Notlar |
|--------|---------|-------|--------|---------|--------|
| AD-00 | Program kurulumu | ✅ TAMAMLANDI | `b151d09` | — | Plan, 52 promptluk promptbook, anti-amnesia + ledger + state.json oluşturuldu. Uygulama koduna dokunulmadı. |

| AD-01 | Yakınlaştırma kilidi kaldırıldı | ✅ TAMAMLANDI | `a02284c` | S4+S5 geçti | index.html:5 maximum-scale=1 silindi; viewport-fit=cover korundu. `cb3d2df` yalnızca AD-01 durum metadata düzeltmesidir; ledger artık erişilebilir commit'i gösterir. |

| AD-02 | --faint kontrastı AA | ✅ TAMAMLANDI | `6acbf57` | S4+S5 geçti | Açık tema --faint #9C8C92 (3.06:1) -> #816F76 (4.50:1). Hue/saturation korundu, 316 metin kullanımı etkilendi. Koyu tema #858590 dokunulmadı. |

| AD-03 | Increase Contrast desteği | ✅ TAMAMLANDI | `c4a36a0` | S4+S5 geçti | Dosya sonuna @media (prefers-contrast: more) bloğu; --muted->--text2, --faint->--muted, kenarlık koyulaştı. Varsayılan yol değişmedi. |

| AD-04 | forced-colors güvenlik ağı | ✅ TAMAMLANDI | `ce1d358` | S4+S5 geçti | @media (forced-colors: active): cam kapanır, kenarlık CanvasText'e döner, buton forced-color-adjust:none. Yalnızca zorlanmış renk modunda etkin. |

| AD-05 | Dalga 1 kapanışı | ✅ TAMAMLANDI | `1d5671b` | S4+S5 geçti | Cache-bust styles.css?v=20260823a; --faint 4.50:1 doğrulandı; dalga 1 tablosu 5/5. S4 tam kapı yeşil. |

| AD-06 | -ink token tanımları | ✅ TAMAMLANDI | `c1c4d4f` | S4+S5 geçti | Açık temaya 6 metin varyantı (accent/warn/ok/watch/listen/drop), koyu temaya var() alias. Hiçbir kullanım değişmedi; render birebir aynı. `a8609af` metadata-only ilk denemeydi; final CSS commit'i olarak erişilebilir `c1c4d4f` kaydedildi. |

| AD-07 | --accent metin taşındı | ✅ TAMAMLANDI | `c2d86dc` | S4+S5 geçti | 36 metin kullanımı color:var(--accent-ink) oldu (2.97:1 -> 4.50:1). Dolgu/kenarlık kullanımları dokunulmadı. Negatif lookbehind ile background-color/border-color korundu. |

| AD-08 | --warn metin taşındı | ✅ TAMAMLANDI | `2730918` | S4+S5 geçti | 8 metin kullanımı taşındı (3.76:1 -> 4.50:1). 4 adet background-color/border-color kullanımı bilinçli olarak korundu — dolgu WCAG eşiği 3:1. |

| AD-09 | --ok metin taşındı | ✅ TAMAMLANDI | `b8d5138` | S4+S5 geçti | 11 metin kullanımı taşındı (3.39:1 -> 4.50:1). 4 dolgu/kenarlık kullanımı ve --ok-bg dokunulmadı. |

| AD-10 | --watch metin taşındı | ✅ TAMAMLANDI | `0642668` | S4+S5 geçti | 11 metin kullanımı taşındı (3.69:1 -> 4.50:1). --watch-bg dokunulmadı. |

| AD-11 | --listen metin taşındı | ✅ TAMAMLANDI | `d6e4c09` | S4+S5 geçti | 5 metin kullanımı taşındı (3.71:1 -> 4.50:1). --listen-bg dokunulmadı. |

| AD-12 | --drop metin taşındı | ✅ TAMAMLANDI | `2161154` | S4+S5 geçti | 1 metin kullanımı taşındı (3.79:1 -> 4.50:1). --drop-bg ve dolgu kullanımları dokunulmadı. |

| AD-13 | Kontrast doğrulayıcı + dalga 2 kapanışı | ✅ TAMAMLANDI | `7f99ad1` | S4+S5 geçti | verify-contrast.mjs eklendi (salt okuma, exit 1 = ihlal). Script kendi hesabımdaki 3 yuvarlama hatasını yakaladı: ok/watch/listen-ink 4.49'da kalmıştı, güvenlik payıyla düzeltildi. 20/20 token AA+. |

| AD-14 | Küçük hedefleri şeffaf alanla büyüt | ✅ TAMAMLANDI | `PENDING` | S4+S5 geçti | Dört `min-height:16px` yüzeyine `.sey-tiny-hit` eklendi; görsel HTML farkı yalnızca class attribute'u, dokunma alanı şeffaf olarak genişliyor. |

<!-- Yeni satırlar buraya, sırayla eklenir. AD-01'den başlar. -->

---

## Dalga ilerleme özeti

| Dalga | Promptlar | Tamamlanan | Durum |
| --- | --- | --- | --- |
| 1 · Sıfır risk erişilebilirlik | AD-01 … AD-05 | 5/5 | ✅ tamamlandı |
| 2 · `-ink` renk tokenları | AD-06 … AD-13 | 8/8 | ✅ tamamlandı |
| 3 · Dokunma hedefleri | AD-14 … AD-16 | 1/3 | devam ediyor |
| 4 · Klavye erişimi | AD-17 … AD-25 | 0/9 | beklemede |
| 5 · Malzeme tutarlılığı | AD-26 … AD-29 | 0/4 | beklemede |
| 6 · Sistem teması ⚠️ onay | AD-30 … AD-32 | 0/3 | onay bekliyor |
| 7 · 11pt tabanı ⚠️ onay | AD-33 … AD-37 | 0/5 | onay bekliyor |
| 8 · Liquid Glass katmanı ⚠️ onay | AD-38 … AD-42 | 0/5 | onay bekliyor |
| 9 · Tipografi ölçeği ⚠️ onay | AD-43 … AD-50 | 0/8 | onay bekliyor |
| 10 · Panel + kapanış | AD-51 … AD-52 | 0/2 | beklemede |
| | **Toplam** | **14/52** | |

> Bu tablo her dalga kapanış promptunda (AD-05, AD-13, AD-16, AD-25, AD-29, AD-32, AD-37, AD-42, AD-50, AD-52) güncellenir.

---

## Ölçüm başlangıç değerleri (2026-08-23)

Denetim anındaki sayımlar. Promptlar bunları hedef olarak kullanır; sapma varsa kod denetimden sonra değişmiş demektir — **önce nedenini araştır, sonra devam et.**

| Ölçüm | Başlangıç | Hedef | İlgili prompt |
| --- | --- | --- | --- |
| `maximum-scale` (index.html) | 1 | 0 | AD-01 |
| `--faint` açık tema kontrastı | 3.06:1 | ≥4.50:1 | AD-02 |
| 4.5:1 altı metin tokenı (açık) | 9 | 0 | AD-02, AD-06…AD-12 |
| `prefers-contrast` kuralı | 0 | 1 | AD-03 |
| `forced-colors` kuralı | 0 | 1 | AD-04 |
| `min-height:16px` kontrol | 4 | 0 (hepsi `.sey-tiny-hit`) | AD-14 |
| `min-height:40px` kontrol | 5 | 0 | AD-15 |
| `<div onclick>` — app.js | 54 | 0 | AD-19 … AD-23 |
| `<div onclick>` — panel.js | 8 | 0 | AD-24 |
| Koyu temada `.glass` kapalı | evet | hayır | AD-26 |
| `prefers-color-scheme` (app) | 0 | 1 | AD-31 |
| 11px altı font — styles.css | var | 0 | AD-33 |
| 11px altı font — app.js | 65 | 0 | AD-34 … AD-36 |
| `.glass` içerik katmanında | 69 | 0 | AD-39 … AD-41 |
| Ham `font-size:NNpx` — app.js | ~1400 | 0 | AD-45 … AD-49 |
| `prefers-reduced-motion` — panel-v2 | 1 | kapsam genişletildi | AD-51 |

**Değişmemesi gerekenler** (regresyon nöbetçileri):

| Ölçüm | Değer | Neden |
| --- | --- | --- |
| Koyu tema token kontrastı | 14/14 AAA veya AA | En iyi ölçülen yüzey; bozulmamalı |
| Panel-v2 token kontrastı | tümü AA+ | Referans uygulama |
| `App.<name>` handler sayısı | sabit | I2 |
| `onclick="App.…"` dağılımı | sabit | I2 |
| `safe-area-inset` kullanımı | app 35, panel 4+7 | Zaten doğru |
| Panel-v2 fixture sayısı | 27 geçer | Regresyon kapısı |

---

## Geri alma

Her prompt tek commit'tir (I6). Sorun çıkaran bir prompt:

```bash
git revert <commit>
```

Sonra bu ledger'da o satırı `↩️ GERİ ALINDI` yap, gerekçeyi not düş, `APPLE-DESIGN-STATE.json` içindeki `lastCompletedPrompt`'u bir öncekine çek.
