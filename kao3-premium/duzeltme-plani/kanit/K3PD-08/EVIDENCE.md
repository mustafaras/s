# K3PD-08 Kanıtı

- Tarih: 2026-10-20
- Durum: `done`; bağımsız denetim `PASS`.
- Başlangıç HEAD: `f2d1041de315954356f85c80b3e5379e1b536b2a`
- Dal: `k3pd-denetim-duzeltmeleri`
- Başlangıç `HEAD...origin/main`: `2 ahead / 0 behind`

## Kapsam ve korunma

Uygulama/test değişiklikleri yalnız `app/core/quranLearn.js`, `tests/kao/test_k3p_dda.js` ve `tests/kao/test_k3p_feedback_copy.js` içindedir. Kullanıcının açık izniyle yalnız K3PD-08’in `PROMPTLAR.md` allowlist satırı exact yollara çevrildi. Kayıt yolları `DURUM.json`, `GUNCEL-DURUM.md`, `KAYIT.md` ve bu kartın kanıt dosyasıdır. CSS gerekmedi; mevcut `.kao-word-example` stilleri kullanıldı.

Önceden kirli dosyalar değişmedi, stage edilmedi ve karta eklenmedi:

- `kao3-premium/KAPANIS.md` — SHA-256 `d8e8419e2849b9eec922e537bca7100149fdfee6120ce850fda77128f8af9bcd`
- `kao3-premium/README.md` — SHA-256 `1aee47cdd05726f4a5966748ae3f786bd79d2e394dd37f3ec7b083f2d36eed0f`
- `kao3-premium/kanit/sonraki/GORSEL-KANIT.md` — SHA-256 `d7627027bba21007550f0a5c76130a4d9f11b7b896d001a60e9333c81ffeed28`

## Davranış değişikliği

- `kaoReintro` örnek verisini var olan `kaoIntroExample` doğrulama kapısından üretir. Kaynak alanları string olmalı; Arapça harf, Latin okunuş, dolu Türkçe karşılık ve `sure:ayet` künye biçimi doğrulanır. Yanlış tip/bozuk alan örnek olarak çizilmez. Ürün içeriği, okunuş veya künye yazılmadı.
- Örnek yalnız gerçek geri bildirim görev HTML’inde `role="group"` ve `aria-label="Doğrulanmış örnek"` ile çizilir. Arapça, okunuş, Türkçe karşılık ve `ref` aynı doğrulanmış içerik kaydından gelir. Kayıt eksik, doğrulanmamış veya bozuksa örnek DOM’a eklenmez; mevcut anlam yedeği kalır.
- Dinleme düğmesi yalnız `kaoAudioEnabled()` true iken görünür ve zaten var olan `App.kaoPlay` handler’ına bağlanır. Üçüncü yanlışta otomatik ses çalmaz.
- Yanıt öncesi UI snapshot’ına yalnız `kaoWindow` ve `kaoWrongStreak` eklendi. Undo, pencereyi ve sayacı yanıt öncesi değerlerine döndürür. Bu geçici arayüz durumudur; kalıcı data alanı değildir.

## Kırmızı → yeşil davranış kanıtı

Yeni negatif sınama ilk olarak eski kaynakla çalıştırıldı: `node tests/kao/test_k3p_dda.js` exit `1`; üçüncü yanlış panelinde `reintro.example` `undefined` iken doğrulanmış `1:1` içerik örneği bekleniyordu.

Son kaynak üzerindeki sonuçlar:

- `node tests/kao/test_k3p_dda.js` — exit `0`, 9 kontrol. İki yanlışta erken açılmama, üç yanlışta doğrulanmış kaynağın dört alanı, eksik/doğrulanmamış/bozuk örnek fallback’i (nesne tipli dört alan, geçersiz künye, Arapça olmayan içerik ve Latin okunuşsuz değer dâhil), ses kapalı/sessiz saat, otomatik çalma olmaması ve undo/yeniden cevap sınandı.
- `node tests/kao/test_k3p_feedback_copy.js` — exit `0`; gerçek ders yürüyüşünde yeniden tanış içeriğinin mevcut feedback/task yüzeyinde görünmesi doğrulandı.
- `node tests/kao/test_kao_pronunciation_contract.js` — exit `0`, içerik ve görevlerde `524/524` okunuş eşleşmesi.
- `node tests/kao/test_kao2_a11y.js` — exit `0`, 14 kontrol; Arapça dil/yön ve görünüm erişilebilirlik sözleşmeleri geçti.
- İlgili G2 `node tests/kao/test_kao2_lesson_flow.js` — exit `0`, 24 kontrol; `node tests/kao/test_k3p_lesson_ayah.js` — exit `0`, 5 kontrol.

## G0 ve G1

DENETLEYICI §4 G0 komutlarının tümü son kaynakta exit `0`: `git diff --check`; `node --check` için `app.js`, `sync.js`, `app/core/quranLearn.js`, `app/core/quranLearnFlow.js`, `app/core/quranLearnViews.js`; run-seyma driver ve zikr harness (95/95); durum `--check`, `--sonraki` ve `test_k3pd_control.js`.

G1’de migration×2, FSRS, queue, requirements, render, navigation, a11y, inventory, design, pronunciation, phonics, mount, focus-lock, asset freshness, IIP-22, plan-check ve contrast komutları exit `0`. Asset pin denetimi `61 fresh / 2 deferred / 0 blocking stale`; iki ertelenmiş pin zaten `pinDeferral` içinde olan K3PD dalı modülleridir. Contrast `756` çift / eşik altında `0`.

Perf ölçümünde `KAO2_WRITE_BASELINE` boştu; baseline dosyasına yazılmadı. İki normal koşu göreli +25% bandını aştı (steady `8.289 ms` ve `13.029 ms`; limit `6.360 ms`), bu yüzden `KAO2_ACCEPT_SLOW_HOST=1` yalnız izinli göreli-band istisnası olarak kullanıldı. Bu koşu exit `0`: içerik `184.591 KiB`, runtime `135.948 KiB`, CSS `15.877 KiB`, p95 `19.032 ms`, steady `10.306 ms`. p95/steady `40 ms` mutlak tavanını ve mutlak boyut tavanlarını geçti; göreli band atlandı ve açıkça kaydedildi.

## Değişmez sınırlar

- Canlı `App.kao*` ataması `45`.
- `app.js`, `sync.js`, `app/core/state.js`, `app/core/quranLearnFlow.js`, `app/core/quranLearnViews.js`, `index.html` ve `sw.js` değişmedi. Schema/migration ve production pin değerleri aynı kaldı.
- Uzak erişim, gerçek browser/profil, kişisel veri, token, screenshot, push, merge, tag veya deploy kullanılmadı. `releaseApproval=NOT_APPROVED`.
- Bu kanıt dosyası tek başına PASS/done veya sonraki karta izin değildir; hüküm ve state kapanışı aşağıdaki bağımsız denetimle birlikte değerlendirilir.

## Bağımsız kapanış denetimi

Denetçi güncel diff’i salt-okur inceledi ve K3PD-08 için `PASS` verdi. Exact allowlist satırı, state/KAYIT kapsam senkronu, üç yanlış sınırı, doğrulanmış örneğin dört kaynağa bağlı alanı, eksik/doğrulanmamış/bozuk örnek fallback’i, ses/otomatik çalma sınırı, undo, DDA 9 kontrol, feedback-copy, pronunciation contract 524/524, a11y 14 kontrol, G0/G1, protected hashler ve değişmeyen `App.kao*` adedi doğrulandı. Yavaş-host göreli perf istisnası açıkça kayıtlı; baseline yazılmadı.

Kart `done/PASS`; `nextPrompt=K3PD-09` yalnız adaydır. Program `releaseApproval=NOT_APPROVED`; push/merge/tag/deploy yapılmadı.
