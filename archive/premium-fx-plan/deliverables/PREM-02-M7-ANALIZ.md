# PREM-02 — Motion Token Migrasyonu (M7) · Analiz Notu

**Tarih:** 2026-09-09 · **Sonuç: UYGULANAMAZ — migrasyon zaten tamamlanmış (FX-2)**

## Özet

PREM-02 kartı `app/styles.css` içindeki "elle yazılmış" süre/eğri değerlerini
(`.3s ease` gibi) `--dur-*`/`--ease-*` token'larına taşımayı hedefliyordu.
Kaldırmadan önce yapılan analiz, **dönüştürülecek tek bir bildirim bile
kalmadığını** gösterdi. Kod değişikliği yapılmadı; M7 **0.62'de korundu**
(kullanıcının onaylı tavanı).

## M7 anatomisi (fx-coverage.mjs ile birebir mantık)

```
M7 = token'li (transition|animation) bildirimi / TÜM (transition|animation) bildirimleri
şu an: 124 / 201 = 0.62
```

| Grup | Sayı | Token'li |
|---|---|---|
| Gerçek değerli bildirimler (süre/eğri içeren) | 124 | **124/124 = %100** ✅ |
| `none` bildirimleri (`transition:none`/`animation:none`, çoğu `!important`) | 77 | — |

- Gerçek değerli **tüm** bildirimler zaten `var(--dur-*)`/`var(--ease-*)` kullanıyor.
  Elle yazılmış süre/eğri kalmamış — FX-2 serisinde bu migrasyon tamamlanmıştı
  (M7'nin taban 0.13 → 0.62'ye çıkmasının nedeni).
- Paydayı 77'ye yükselten 77 öğenin tamamı **erişilebilirlik/batarya kuralları**:
  `@media (prefers-reduced-motion)` blokları, `#root.amb-paused` duraklatmaları ve
  diğer `none!important` geçersiz kılmalar. `none` bildirimi süre/eğri taşımaz;
  token'sız olması doğaldır. PREM-02 §5 bu bloklara **dokunmamayı** emreder.

## Reddedilen alternatifler

1. **77 `none` bildirimine sahte token eklemek** (örn. `animation:none var(--dur-1) var(--ease-linear)`)
   → geçersiz/anlamsız CSS üretir, erişilebilirlik kurallarına dokunur, skoru ölçüm
   hilesiyle yükseltir. **Reddedildi.**
2. **`fx-coverage.mjs`'i none'ları paydadan çıkarmak** (M7 → 1.00 gösterir)
   → araç ve taban değerleri (0.13/0.62) tarihî kayıtlara bağlı; kart kapsamı dışı.
   Kullanıcı onayı olmadan dokunulmadı. İstenirse ayrı bir kart olarak ele alınabilir.

## Durum

- M7: **0.62** (değişmedi; onaylı tavan)
- M13: **8** (= 8 ✅)
- Kod değişikliği: **0** (yalnızca bu not + durum dosyası)
- `SKY-STATE.json`: `"PREM-02": "done (M7=0.62 korundu; dönüştürülebilir bildirim yok — detay bu belgede)"`

## Kanıt komutları

```bash
node tools/fx-coverage.mjs | grep -E '^M7|^M13'
# M7 0.62 · M13 8

node -e "/* M7 fonksiyonuyla birebir sayım */"
# real-valued: 124 | non-compliant real: 0
# none payda: 77
```