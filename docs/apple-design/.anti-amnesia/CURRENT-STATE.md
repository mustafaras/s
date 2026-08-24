# iOS 27 Tasarım Programı — Güncel Ajan Durumu

> Oturum, model veya ajan değiştiğinde **önce bu dosya okunur.** Sonra kendi adımını çalıştır, bitince **bu dosyayı güncelle.**
> Bu dosya insan içindir; makine karşılığı [`../APPLE-DESIGN-STATE.json`](../APPLE-DESIGN-STATE.json).

---

## Durum

| | |
| --- | --- |
| **Program** | `APPLE-DESIGN-IOS27` |
| **Durum** | `in_progress` |
| **Aktif prompt** | yok |
| **Son tamamlanan** | `AD-42` — dalga 8 kapanışı |
| **Sıradaki** | `AD-43` ⚠️ **onay gerekir** (dalga 9 · tipografi ölçeği) |
| **Güncel dalga** | `9` (onay bekliyor) |
| **Bloke** | yok |
| **Güncellendi** | 2026-08-24 |

**Uygulanan promptlar:** AD-01 … AD-42 (+ AD-19-FIX, AD-25-FIX, AD-31-FIX, AD-36-FIX onarımları). **Dalga 1–8 tamamlandı: 42/52.** Dalga 5+6 `04b83ca`, dalga 7 `dd5f50d` ile deploy edildi (2026-08-24); **dalga 8 henüz deploy edilmedi.** Her biri kendi commit'inde; `git revert <commit>` ile tek tek geri alınabilir.

**Program dışı onarım — `AD-31-FIX` (2026-08-24):** Dalga 6 kapanışı yeşildi ama AD-31'in yeni çalışma zamanı mantığını koruyan kalıcı bir fixture yoktu (doğrulama yalnızca oturum scratchpad'indeydi) ve [`../IOS27-TASARIM-PLANI.md`](../IOS27-TASARIM-PLANI.md) başlığı hâlâ "uygulama başlamadı" diyordu. `docs/apple-design/verify-theme-tristate.mjs` (18 assertion) commit edildi ve doğrulama kapısına eklendi; plan başlığı düzeltilip §4 puan tablosunun dondurulmuş denetim kaydı olduğu yazıldı. Ayrıntı: [`LEDGER.md`](LEDGER.md) `AD-31-FIX`. Prompt sayacı değişmedi — onarım, yeni prompt değil.

**Program dışı onarım — `AD-25-FIX` (2026-08-23):** Dalga 4 doğrulamasında iki erişilebilirlik kusuru bulundu ve düzeltildi: 19 olay-yutan kapsayıcıdan yanlış `role="button"`/`tabindex`/`onkeydown` kaldırıldı, `role="dialog"` overlay'i Enter/Space yerine Escape ile kapanır oldu. Ayrıntı: [`LEDGER.md`](LEDGER.md) `AD-25-FIX`. Prompt sayacı değişmedi — onarım, yeni prompt değil.

**Program dışı onarım — `AD-19-FIX` (2026-08-23):** AD-19'un native `<button>` dönüşümü, kart başlığında iç içe buton üretiyordu (konum kartı rozeti). HTML5 ayrıştırıcı kart yığınını `.sey-main-scroll` dışına düşürdüğü için Bugün sekmesindeki `overflow:hidden` kartlar eziliyordu. Rozet başlık butonunun dışına alındı, chevron ayrı `tabindex=-1 aria-hidden` butona taşındı; `motivationTodayCardHTML` içindeki yer değiştirmiş `</div>`/`</button>` düzeltildi. Ayrıntı ve kanıt: [`LEDGER.md`](LEDGER.md) `AD-19-FIX` satırı. Prompt sayacı değişmedi — bu bir onarım, yeni prompt değil.

---

## Canonical kapsam

| Dosya | Rol |
| --- | --- |
| [`../IOS27-TASARIM-PLANI.md`](../IOS27-TASARIM-PLANI.md) | Denetim bulguları, ölçümler, HIG atıfları, I1–I6 işlevsellik sözleşmesi |
| [`../UYGULAMA-PROMPTLARI.md`](../UYGULAMA-PROMPTLARI.md) | 52 sıralı prompt (AD-01 … AD-52), ortak sözleşme S1–S8 |
| [`LEDGER.md`](LEDGER.md) | Her promptun sonucu, commit'i, test kanıtı |
| [`../APPLE-DESIGN-STATE.json`](../APPLE-DESIGN-STATE.json) | Makine-okunur durum — ajanın ilk okuduğu şey |

---

## İlk okuma sırası (soğuk başlangıç)

1. `../APPLE-DESIGN-STATE.json` — `blockedPrompt` / `activePrompt` / `lastCompletedPrompt`
2. Bu dosyanın **Durum** tablosu
3. `LEDGER.md` — son 5 satır
4. `../UYGULAMA-PROMPTLARI.md` §1 (ortak sözleşme) + çalıştırılacak promptun gövdesi
5. `../IOS27-TASARIM-PLANI.md` — yalnızca promptun **Kaynak** alanında gösterdiği bölüm

Planın tamamını okumak gerekmez; her prompt kendi bağlamını taşır.

---

## Değişmezler (ihlal = commit iptal)

| | |
| --- | --- |
| I1 | `data` nesnesinin şekli değişmez |
| I2 | `App.<name>` yüzeyi değişmez |
| I3 | `migrate()` dokunulmaz |
| I4 | `render()` çağrı grafiği değişmez |
| I5 | `sync.js`, Guard 1, Guard 2 dokunulmaz |
| I6 | Tek prompt = tek commit |

---

## Güvenli doğrulama

**Uygulamayı tarayıcıda açma** — [CLAUDE.md](../../../CLAUDE.md) veri güvenliği kuralı 1. Görsel doğrulama yalnızca headless harness çıktısı okunarak yapılır.

```bash
node --check app.js && node --check sync.js
node .claude/skills/run-seyma/driver.mjs
node .claude/skills/run-seyma/zikr-harness.mjs
node docs/apple-design/verify-theme-tristate.mjs
node tests/app/test_faz10_sync.js
node tests/panel/test_faz11_panel.js
for f in tests/panel-v2/test_panel_v2_*.js; do node "$f" || echo "FAIL: $f"; done
```

Görsel inceleme: `node .claude/skills/run-seyma/driver.mjs --dump <sekme>`

---

## Onay kapıları

Dalga 1–5 (AD-01 … AD-29) ek onay istemez: ölçülmüş ihlaller, düşük risk, görsel kimliğe dokunmuyor.
**Dalga 6, 7 ve 8 (AD-30 … AD-42) 2026-08-24'te onaylandı ve tamamlandı.**

Dalga 6–9 **kullanıcı onayı ister.** Onay alınmadan ilk promptu çalıştırma:

| Dalga | İlk prompt | Neden onay |
| --- | --- | --- |
| 6 | AD-30 | ✅ onaylandı + tamamlandı 2026-08-24. AD-31 için ikinci onay da alındı (A seçeneği — aşağı bak) |
| 7 | AD-33 | ✅ onaylandı + tamamlandı 2026-08-24. Kapsam 65 → 167 siteye genişletildi (ayrı onay) |
| 8 | AD-38 | ✅ onaylandı + tamamlandı 2026-08-24. Görsel etki beklenenden çok küçük çıktı (aşağı bak) |
| 9 | AD-43 | 1400+ site; aylara yayılır |

**Push, deploy, tag ve `mustafaras/seyma-data` yazımı bu programın kapsamı dışında ve ayrıca onaya tabidir.**

---

## Bilinen açık kapı

**Dalga 9 (AD-43) kullanıcı onayı bekliyor — onay alınmadan çalıştırma.** 1400+ site, planın kendi
ifadesiyle **"acil değil"**: dalga 1–8 sonrası uygulama zaten erişilebilir; dalga 9 onu *sürdürülebilir*
yapar (ham px → adlandırılmış ölçek tokenları, Panel-v2'deki kalıp). Dalga 8 tamamlandı, bloke bir şey yok.

**Dalga 8 sonucu ve sürpriz:** `.glass` içerik katmanında **68 → 0**. Ama görsel etki beklenenden **çok
küçük** çıktı, çünkü [`app/styles.css:397`](../../../app/styles.css#L397) boot sonrası `.glass` blur'ünü
**zaten kapatıyordu** (2026-07-28 flaş düzeltmesi). Yani dalga 8 pratikte "cam kaldırma" değil,
**saydamlığı opaklaştırma** oldu: açık temada kart (254,250,250) → (255,253,252), koyu temada fark
**1.008:1** yani ayırt edilemez. Fonksiyonel katman (header, alt nav, chatbar, yüzen aksiyon) `.glass`
kullanmıyordu zaten — kendi `backdrop-filter` kuralları var ve **camlı kaldılar**.

**Kontrast opaklaşmayla İYİLEŞTİ:** `--faint` ve üç `-ink` tokenı 4.5:1 eşiğinin 0.01 üstünde
(4.51:1) duruyordu; opak zeminde 4.63:1'e çıktılar. `verify-contrast.mjs` artık kart zeminini
`--card-solid` tokenından okuyor ve token kaybolursa uyarı basıyor.

⚠️ **`.glass` kuralı artık kullanıcısız ölü CSS** — bilinçli olarak silinmedi (AD-39 kararı): sınıf,
ileride eklenecek fonksiyonel yüzeyler için sözleşmeyi taşıyor. Sonraki ajan bunu "unutulmuş kod"
sanıp temizlemesin.

⚠️ **Görsel doğrulama hâlâ cihazda yapılmadı.** Kart sınırları **sayısal** olarak doğrulandı
(kart↔zemin kontrastı 1.10 → 1.12, yani sınır korundu ve hafifçe belirginleşti), gözle değil.

Kapanmış kapılar (kayıt için): AD-25-FIX ile Dalga 4'ün iki erişilebilirlik kusuru kapatıldı.
AD-19…AD-24 boyunca hiçbir hedef `ERTELENDI` olarak bırakılmadı; nested-control yüzeyleri native
buton yerine klavye destekli `role=button` olarak korundu.

Bir sonraki ajan **AD-43**'ü ancak kullanıcı onayından sonra çalıştırır.

---

## Bu düzenlemenin özeti

2026-08-23 — `apple-design` skill'iyle Şeyma ve ÆON yüzeylerinde HIG denetimi yapıldı. Ölçülen: açık temada 9 renk tokenı 4.5:1'in altında (`--faint` 3.06:1 ve 316 metin kullanımı), 65 adet 11pt altı font, `maximum-scale=1` yakınlaştırma kilidi, 54 klavye-erişilemez `<div onclick>`, ve Liquid Glass'ın içerik katmanında kullanımı (69 site) — HIG'in açıkça yasakladığı kalıp. AD-19…AD-23 app dönüşümleri ve AD-24 panel v1 dönüşümü tamamlandı; literal app `<div onclick>` sayısı 0, panelde iki nested-control role kabuğu kaldı. AD-25 kapanış gate'leri S8+S4+S5+S6+S7 olarak yeniden çalıştırıldı.

Koyu tema (14/14 AAA/AA) ve Panel-v2 (her iki temada tümü AA+, adlandırılmış tipografi ölçeği) denetimden temiz çıktı; ikisi de bu programda **referans**, değiştirilmiyor.

Bulgular 52 sıralı prompta dönüştürüldü; 42 tanesi uygulandı (AD-30 salt okuma denetimidir, kod değiştirmez).
