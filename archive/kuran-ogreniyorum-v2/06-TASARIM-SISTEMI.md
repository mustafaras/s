# 06 — KAO tasarım sistemi (Apple HIG uyumlu)

Temel ayrım: **kabuk sistemsel, içerik özenli.** Kabuk (gezinme, liste,
düğme, panel) iOS dilini birebir izler; güzellik ve saygı Arapça tipografide,
boşlukta ve seste yaşar. Bağlayıcı çerçeve: [`docs/apple-design/IOS27-TASARIM-PLANI.md`](../docs/apple-design/IOS27-TASARIM-PLANI.md).

## 1. Tokenlar

Yeni tokenlar yalnız `app/kao.css` içinde, `.kao-dialog, .kao-hub-card`
kapsamında tanımlanır; açık ve koyu değerleri `--quran*` ailesinden türetilir
(yeni renk ailesi yok). Her token çifti kontrast aracıyla ölçülür (§7).

| Token | Rol | Açık | Koyu |
|---|---|---|---|
| `--kao-bg` | Ekran zemini (grouped background) | `--quran-bg`'ye yakın, düz | koyu yüzey |
| `--kao-surface` | Kart / liste hücresi (opak, AD-38) | `--quran-surface` | `--quran-surface` |
| `--kao-label` | Birincil metin | `--quran-ink` | `--quran-ink` |
| `--kao-label-2` | İkincil metin | ink %68 | ink %70 |
| `--kao-sep` | Ayırıcı çizgi | ink %12 | ink %16 |
| `--kao-tint` | Etkileşim rengi (düğme, bağlantı, seçili) | `--quran-mid` | `--quran-mid` |
| `--kao-accent` | Yalnız başarı anı ve taş (altın) | `--quran2` | `--quran2` |
| `--kao-ok` / `--kao-ok-bg` | Doğru durumu | `--quran-ok` | `--quran-ok` |
| `--kao-fix` / `--kao-fix-bg` | Düzeltme durumu (turuncu; kırmızı değil) | `--quran-warn` | `--quran-warn` |

Ölçüler (4 pt ızgara):

| Token | Değer | Kullanım |
|---|---|---|
| `--kao-r-card` | 16px | Kart, liste grubu |
| `--kao-r-ctl` | 12px | Şık, düğme |
| `--kao-r-pill` | 999px | Kapsül düğme, hap |
| `--kao-gutter` | 16px | Yatay kenar boşluğu |
| `--kao-gap-1…4` | 8 / 12 / 20 / 32px | İç boşluk kademeleri |
| `--kao-row` | min 44px | Liste satırı |

Tipografi (uygulamanın `--f-*` Dynamic Type ölçeği aynen kullanılır):

| Rol | Token | Ağırlık |
|---|---|---|
| Large title | `--f-large` | 700 |
| Başlık | `--f-title2` / `--f-title3` | 600 |
| Satır başlığı | `--f-headline` | 600 |
| Gövde | `--f-body` | 400 |
| Açıklama | `--f-subhead` / `--f-footnote` | 400 |
| Bölüm üstbilgisi | `--f-footnote`, büyük harf yok, `--kao-label-2` | 400 |
| Rakam (ilerleme) | `--f-title1`, `font-variant-numeric: tabular-nums` | 600 |

**Yalnız 4 ağırlık:** 400, 500, 600, 700. Serif arayüz başlığı yok. Büyük
harf + harf aralığı yok.

Arapça (içerik) tipografisi korunur ve güçlendirilir:

| Bağlam | Boyut | Satır aralığı |
|---|---|---|
| Tanış kartı kelimesi | `clamp(2.5rem, 12vw, 3.5rem)` | 1.9 |
| Görev sorusu | `clamp(2rem, 9vw, 2.5rem)` | 1.9 |
| Okuyucu satırı | `clamp(1.6rem, 7vw, 1.9rem)` | `--kao-ar-lh` (kullanıcı ayarı 1.9/2.2/2.5) |
| Şık / liste | `--f-title3` | 1.8 |

Okunuş satırı Arapçanın altında, `--f-subhead`, `--kao-label-2`, 400; italik yok.

## 2. Bileşenler

| Bileşen | Kalıp | Notlar |
|---|---|---|
| **NavBar** | Sol: `‹ Önceki` ya da `Kapat` · orta: inline başlık (kaydırınca) · sağ: isteğe bağlı tek eylem | Yükseklik 44 + safe-area; zemin `--kao-bg`, kaydırınca ince `--kao-sep` çizgisi |
| **LargeTitle** | Ekran başındaki büyük başlık + isteğe bağlı alt açıklama | Her ekranın kendi başlığı (01 O-01) |
| **FocusBar** | Ders/tekrar modunda: `✕` + ince ilerleme çubuğu | Kapatınca onay sorulmaz, doğrudan çıkılır (ilerleme her cevapta zaten kaydediliyor) |
| **HeroCard** (Sıradaki) | Bölüm etiketi · başlık · alt satır · tam genişlik dolgulu düğme | Ekranda tek; gölge yok, `--kao-surface` + 1px `--kao-sep` |
| **GroupedList** | Başlık (footnote) + yuvarlatılmış grup + satırlar (29px kare ikon, başlık, sağda değer/chevron) + footer notu | iOS Settings kalıbı; satır ayırıcısı ikondan sonra başlar |
| **ProgressRing** | 28/44/64 px; `stroke-linecap: round`; yüzde içeride ya da yanda | Gerçek veri zorunlu |
| **ProgressBar** | 4px yükseklik, kapsül | Odak modunda üstte |
| **Choice** | Tam genişlik, min 52px, `--kao-r-ctl`, 1px çerçeve; durumlar: normal · basılı (`scale(.98)`) · doğru (✓ + yeşil zemin) · seçilen yanlış (✕ + turuncu) · soluk | Renk + simge + metin; yalnız renk yok |
| **FeedbackSheet** | Alt panel; başlık (Doğru ✓ / Yakın), 1–2 cümle açıklama, ses düğmesi, "Devam" | `role="status"`, `aria-live="polite"`; odak "Devam"a gider |
| **PrimaryButton** | Dolgulu kapsül, min 50px, `--kao-tint` zemin, beyaz 600 | Ekran başına en çok bir |
| **SecondaryButton** | Tint renkli metin ya da ince çerçeveli | |
| **Switch** | `role="switch"` + `aria-checked`, iOS anahtar görünümü (51×31) | Ayarların tümü |
| **Segmented** | Mevcut `kao-seg` sadeleştirilir: gri zemin, seçili beyaz kapsül | Günlük süre, ses stili, okunuş katmanı |
| **ArabicWord** | Arapça + okunuş dikey yığın (mevcut `kao-arabic-stack`) | Korunur |
| **WordChip** (okuyucu) | Kenarlıksız; bilinen: normal; bilinmeyen: altı noktalı çizgi; dokununca anlam alt panelde | Mushaf akışı korunur (02 T-20) |
| **StepList** | Ünite ders listesi: ✓ tamam · ● şimdiki · ○ sırada | `aria-current="step"` |

## 3. Hareket

- Ekran geçişi (yığın): sağdan 12px kayma + solma, `--dur-3`, `cubic-bezier(.2,.8,.2,1)`.
- Görev geçişi: solma + 8px yukarı (mevcut `SeyFx.enter`).
- Geri bildirim paneli: alttan açılır (`--dur-3`); şık durumu anında değişir.
- Doğru: `SeyHaptics.tap` + `SeyAudio.tap` (mevcut kapılar). Ders/ünite sonu: tek, sakin kutlama; konfeti yalnız ünite ve taşta.
- `prefers-reduced-motion` ve uygulama hareket ayarı: tüm geçişler anında; içerik **hiçbir zaman** gizli başlamaz (`kao-audio-pending` kaldırılır, 02 T-26).

## 4. Kaldırılacaklar (bugünkü CSS)

`.kao-hub-spine`, `.kao-hub-frame`, `.kao-hub-ornament`, `.kao-hub-card::before/::after`,
`.kao-dialog::before` (ızgara deseni), `.kao-dialog-frame`, `.kao-header::after`,
`.kao-header-mark`, `.kao-hero-rosette`, `.kao-summary-mark`, `.kao-done-mark` ✦,
tüm `text-transform:uppercase` + `letter-spacing`, 750–950 ağırlıkları, serif
arayüz başlıkları, `:hover` kaldırma efektleri, `.kao-levels` etkisiz kutuları.

## 5. Hub kartı sözleşmesi

```
┌──────────────────────────────────────────┐
│ [▢]  Kur'an Arapçası               ◔ 41% │   ← 32px kare ikon, başlık 600, halka
│      Sıradaki: Din gününün sahibi · 7 dk │   ← subhead 400, label-2
│                           [ Devam  › ]   │   ← kapsül, tint
└──────────────────────────────────────────┘
```

Yükseklik içeriğe göre (~112–128 px), `--kao-r-card`, `--kao-surface`, 1px
`--kao-sep`, gölge yok. Tüm kart tek düğmedir (mevcut `id="kao-hub-entry"` ve
`aria-haspopup="dialog"` korunur).

## 6. Erişilebilirlik sözleşmesi

- Tüm hedefler ≥44×44; şıklar ≥52 yükseklik.
- Odak halkası 3px `--kao-tint`, 3:1 kontrast.
- Her ekran açılışında odak LargeTitle'a (odak modunda soruya) gider; geri dönüşte tetikleyiciye.
- Dinamik metin %200'de, 320 px genişlikte yatay kaydırma yok; sabit px yükseklik yok (min-height).
- `aria-live`: geri bildirim paneli, ders özeti. `aria-current="step"`: StepList. `role="switch"`: ayarlar.
- Arapça öğeler `lang="ar" dir="rtl"`; ekran okuyucu etiketi okunuşu içerir.
- Increase Contrast / forced-colors: ayırıcı ve çerçeveler `CanvasText`'e düşer (IOS27 B2/B3).

## 7. Kabul ölçümleri (tasarım)

| Ölçüm | Hedef | Araç |
|---|---|---|
| Farklı font-weight | ≤4 | CSS tarama fixture'ı |
| Dekoratif sözde öğe (`::before/::after`, içerik dışı) | 0 | CSS tarama |
| `text-transform:uppercase` | 0 | CSS tarama |
| Metin kontrastı (açık/koyu, tüm token çiftleri) | ≥4.5:1 (küçük), ≥3:1 (büyük/ikon) | `kao-verify-contrast.mjs` genişletilir |
| Ekran başına dolgulu birincil düğme | ≤1 | render fixture'ı |
| Hub kartı yüksekliği (390 px, varsayılan metin) | ≤136 px | görsel QA (CLAUDE.md'deki izinli yerel yöntem, port 9000) |
