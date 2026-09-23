# IIP-10 · karar onayı — arama dispatcher'ı ve pin güncellemeleri

## DEC-07 · Öncü arama dispatcher'ı ve pin güncellemesi

**Durum:** approved · **Sahip kart:** IIP-10 · **Reviewer:** User (ürün/yetki sahibi; bu turda açık onay)

### Karar 1 — tek dispatcher handler

IIP-10 bir arama alanı ve iki filtre grubu getirir. Markup kuralı gereği bu
etkileşimler `onclick`/`oninput`/`onkeydown` nitelikleriyle bağlanır ve her nitelik
`App.<ad>` biçiminde bir handler gerektirir. Altı ayrı handler eklemek yerine
**tek bir dispatcher** (`App.saygiLens(action,value)`) kullanılır:

- Yeni bir arama alanı eklemek **yeni bir App üyesi gerektirmez**; dispatcher'ın
  eylem listesine bir dal eklenir.
- Bilinmeyen bir eylem (bayat HTML, eski bir nitelik) sessiz ve güvenli bir
  no-op'tur.

Buna rağmen `App` yüzeyi matematiksel olarak **+1** büyür (tek yeni handler). Bu
artış kartın kaçınılmaz çıktısıdır ve **beş** donmuş fixture'ın pinini
güncellemeyi gerektirir. Aşağıdaki tablo **yalnız bu kartın neden olduğu**
değişimi listeler; ölçümler `HEAD` ile çalışma ağacı karşılaştırılarak alındı.

| Fixture | Pin | HEAD | Sonuç |
|---|---|---|---|
| `test_fx2_overlay_motion.js` (FX2-16.2) | `App.*` 718 | 718 ✓ | 719 |
| `test_fx2_tab_transition.js` (FX2-15.7) | `App.*` 718 | 718 ✓ | 719 |
| `test_fx2_touch_coverage.js` (FX2-10.9) | `App.*` 718 | 718 ✓ | 719 |
| `test_app_surface_daily_boundary.js` | `App` atama 556 / yüzey 718 | 556 / 718 ✓ | 557 / 719 |
| `test_v3_welcome.js` | `App.*` 554 / yüzey 718 | 554 / 718 ✓ | 555 / 719 |

**Değişmeyen:** `onclick=391` pini ilgili fixture'larda aynen korunur; `app/core/saygi.js`
bu pinlerin ölçüm kaynağına hiç girmez.

### Karar 2 — bayat pin onarımı (kartın neden olmadığı)

`index.html`'de `app.js?v=20260921a` ve `app/core/appSurface.js?v=20260920a`
canlıdır, fakat dört fixture daha eski değerleri bekliyordu. Bu uyuşmazlık **bu
karttan önce** de vardı (HEAD'de doğrulandı: bu fixture'lar orada da başarısızdı).
Yayın öncesi zinciri yeşile çekmek için beklenen değerler canlı değere getirildi:

| Fixture | Bayat pin | Canlı değer |
|---|---|---|
| `test_app_surface_boot_boundary.js` | `app.js?v=20260916a` | `20260921a` |
| `test_app_surface_domain_boundary.js` | `appSurface?v=20260915c`, `app.js?v=20260916a` | `20260920a`, `20260921a` |
| `test_app_surface_lifecycle_boundary.js` | aynı | aynı |
| `test_app_surface_overlay_boundary.js` | aynı | aynı |
| `test_v3_welcome.js` | `appSurface?v=20260915c` | `20260920a` |

`index.html` **değiştirilmedi**: kartın kapsamı dışındadır ve bump gerekmedi —
kartın dokunduğu üç asset'in (`app/styles.css`, `app/core/saygi.js`, `app.js`)
pinleri zaten `20260921a` idi.

### Düzeltme kaydı (önemli)

Bu oturumun ilk raporunda bu uyuşmazlıkların **altısı da** "önceden var olan"
sayılmıştı. Bu **yanlıştı**: `test_app_surface_daily_boundary.js` (556/718) ve
`test_v3_welcome.js` (554/718) pinleri HEAD'de **geçiyordu** ve yalnız yeni
dispatcher handler'ı yüzünden kırıldı. Hata, HEAD'de ayrı bir iş ağacı kurulup
pinler doğrudan karşılaştırılarak bulundu ve burada düzeltildi.

### Sınırlar

- Yeni handler sayısı **bir**dir; altı ayrı `App.setSaygi*` handler'ı reddedildi.
- `app/core/saygi.js` hâlâ hiç `App.*` ataması içermez.
- Kalıcı veri, geçiş (migration), sync, depolama yazımı ve panel sözleşmesi
  değişmez; arama sorgusu yalnız `ui` oturumluk kanalında yaşar.
- Bu karar cihaz kabulü veya canlı veri yazımı yetkisi vermez.
