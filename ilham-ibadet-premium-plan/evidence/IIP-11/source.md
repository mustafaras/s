# IIP-11 kaynak kanıtı

Repo kökünden; tam çıktı `evidence/IIP-11/commands.log` (15 komut, **hepsi exit 0**).
Ağsız/headless; gerçek kişisel veri, token, `localStorage`, ağ ve tarayıcı yok.

| Komut | Sonuç |
|---|---|
| `node ilham-ibadet-premium-plan/tools/plan-check.mjs` | PASS |
| `node --check app/core/saygi.js` | PASS |
| `node --check app.js` | PASS |
| `node --check tests/app/test_iip_11.js` | PASS |
| `node tests/app/test_iip_11.js` | **55/55 PASS** |
| `node tests/app/test_saygi_boundary.js` | 20/20 PASS |
| `node tests/app/test_iip_10.js` | 61/61 PASS |
| `node tests/app/test_iip_04.js` | PASS (26 kontrol) |
| `node tests/app/test_iip_05.js` | 28/28 PASS |
| `node tests/app/test_iip_09.js` | 22/22 PASS |
| `node tests/app/test_modal_focus_containment.js` | PASS |
| `node .claude/skills/run-seyma/zikr-harness.mjs` | 95/95 PASS |
| `node .claude/skills/run-seyma/driver.mjs` | PASS |
| `node tools/shell-inventory.mjs --gate` | PASS |
| `git -c core.fsmonitor=false diff --check` | PASS |

## Tam regresyon

`tests/app` **61/61**, `tests/panel` 23/23, `tests/panel-v2` 27/27, `tests/quran`
9/9, reminder smoke PASS.

## App yüzeyi pinleri (DÜZELTME)

İlk devirde "yeni App üyesi eklenmedi, hiçbir pin gerekmedi" yazılmıştı. **Bu
yanlıştı.** Okuma dispatcher'ı `App.saygiReader` gerçekten eklendi, yani yüzey
719 → **720** oldu. Sorun şuydu: aynı anda `App.openSaygiReading` yanlışlıkla
silindiği için **sayı 719=719 kaldı** ve sapma görünmedi. Düzeltme sonrası gerçek
durum ve güncellenen pinler:

| Metrik | HEAD | Şimdi | Pinlenen |
|---|---|---|---|
| `App.*` benzersiz yüzey | 719 | **720** | fx2 (3) + app_surface_daily + v3_welcome |
| `app.js` `App` atama | 557 | **558** | app_surface_daily |
| `app.js` `^App` handler | 555 | **556** | v3_welcome |
| `onclick=` | 391 | **391** (değişmedi) | fx2 (3) |

## Bu kartta bulunan ve düzeltilen ÜÇ kusur

**IIP11-REV-01.** Okuma konumu oranı `[0,1]`'e kırpılıyordu; doğru aralık
`[-1,1]`dir (negatif = ankraj görünümün üstünde). Kırpma negatif yarıyı yok
ediyor ve Aa sonrası geri dönüşü bozuyordu. Fixture yakaladı, düzeltildi.

**IIP11-REV-02 (yüksek).** `App.openSaygiReading` yanlışlıkla silinmişti; ama
`saygi.js` markup'ı onu **iki yerde** çağırıyor (okunmuş içerikte "Okudum" →
"Ne okundum kaydını aç"). Yüzey sayısı 719=719 kaldığı için **hiçbir pin
yakalamadı** ve hata yalnız elle denetimde ortaya çıktı. HANDOFF'taki "yeni App
üyesi eklenmedi" iddiası da bu yüzden yanlıştı. Düzeltme: handler orijinal
gövdesiyle (`App.openReading()` köprüsü) geri kondu, altı pin doğru değere
çekildi ve **yetim-handler bekçisi** eklendi (aşağıda).

**IIP11-REV-03 (yüksek).** Ölçek CSS'i yanlış sarmalayıcıyı hedefliyordu:
okuyucu modal'ı `.saygi-article-modal` kullanır, kural ise `.saygi-article`ı
hedefliyordu → **ölçek asıl okuyucu yüzeyinde hiç uygulanmıyordu**. Ayrıca
`font-size:calc(1em * var(--saygi-scale))` iki şekilde bozuktu: (a) özgün taban
boyutu (`clamp(.9375rem,1.8vw,1.0625rem)` / `var(--f-callout)` / `var(--f-footnote)`)
eziyordu, (b) `1em` ebeveynin boyutuna göre çözüldüğü için %100'de bile taban
kayıyordu. Düzeltme: ölçek **her bloğun GERÇEK tabanıyla** çarpılır
(`calc(clamp(...) * var(--saygi-scale,1))`), kural iki sarmalayıcıyı da kapsar,
hero başlığı ve açıklaması ölçeklenmez, dar ekran tabanı korunur.

## Bu kusurun kalıcı bekçisi

Ölçek içeren **her** CSS kuralı ayrı ayrı denetlenir ve modal sarmalayıcıyı
içermek zorundadır (`includes` yeterli değildi — kural iki yerde geçtiği için
biri bozulsa bile test geçiyordu; mutasyonla görüldü). İki mutasyonla doğrulandı:
modal sınıfı bozulunca `FAIL — modal içermeyen kural: 1`, `1em` tuzağı geri
konunca 3 FAIL.

## Ölçek CSS sözleşmesi (test edilen)

- İki sarmalayıcı da kapsanır: `.saygi-article`, `.saygi-article-modal`.
- Her blok kendi tabanıyla çarpılır: `p` → `clamp(...)`, `h3` → `--f-callout`,
  liste/alıntı → `--f-footnote`.
- `1em * scale` formu **yasak** (ebeveyne bağlı çözülür).
- Varsayılan adımda çarpan tam `1`.
- Hero başlığı (`h2`) ve açıklaması ölçeklenmez.

## Yayın notu (yetki dışı, integratöre)

Cache-bust pinleri `app/styles.css`, `app/core/saygi.js`, `app.js` için
`20260921a` — ama bu değer **IIP-10 yayınında** konuldu ve IIP-11 aynı üç dosyayı
yeniden değiştirdi. IIP-10'dan sonra siteyi açmış bir tarayıcı `20260921a`'yı
önbelleğe almış olabilir ve **IIP-11 arayüzünü göremeyebilir**. `index.html`
bu kartın allowlist'inde değildir (protokol: cache-bust bump'ı integratör yapar);
bump yayından önce yapılmalıdır.

## Yeni kalıcı bekçi (bu hatanın dersi)

`tests/app/test_iip_11.js` artık yüzey SAYISINDAN bağımsız bir kontrol içerir:
markup dosyalarında `App.x(` diye çağrılıp `app.js`'te **tanımsız** kalan her
handler'ı yakalar. Mutasyon testiyle doğrulandı: handler silinince bekçi
`FAIL — tanımsız: App.openSaygiReading` verir, geri konunca 48/48 geçer.
