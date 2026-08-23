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
| **Son tamamlanan** | `AD-08` — --warn metin taşındı |
| **Sıradaki** | `AD-09` |
| **Güncel dalga** | `2` |
| **Bloke** | yok |
| **Son güncelleme** | 2026-08-23 |

**Uygulanan promptlar:** AD-01 … AD-08. Her biri kendi commit'inde; `git revert <commit>` ile tek tek geri alinabilir (I6).

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
node tests/app/test_faz10_sync.js
node tests/panel/test_faz11_panel.js
for f in tests/panel-v2/test_panel_v2_*.js; do node "$f" || echo "FAIL: $f"; done
```

Görsel inceleme: `node .claude/skills/run-seyma/driver.mjs --dump <sekme>`

---

## Onay kapıları

Dalga 1–5 (AD-01 … AD-29) ek onay istemez: ölçülmüş ihlaller, düşük risk, görsel kimliğe dokunmuyor.

Dalga 6–9 **kullanıcı onayı ister.** Onay alınmadan ilk promptu çalıştırma:

| Dalga | İlk prompt | Neden onay |
| --- | --- | --- |
| 6 | AD-30 | Tema davranışı değişiyor; handler'a dokunma ihtimali var (I2 riski) |
| 7 | AD-33 | 11pt tabanı dar rozetlerde düzen taşması yapabilir |
| 8 | AD-38 | Planın görsel olarak en görünür değişikliği; reddedilmesi meşru |
| 9 | AD-43 | 1400+ site; aylara yayılır |

**Push, deploy, tag ve `mustafaras/seyma-data` yazımı bu programın kapsamı dışında ve ayrıca onaya tabidir.**

---

## Bilinen açık kapı

Şu an yok. Bir prompt bir öğeyi `ERTELENDI` işaretlerse veya düzeltilemeyen bir düzen taşması bırakırsa **buraya yazılır** — ledger satırı tek başına yeterli değildir, sonraki ajan bu bölümü okur.

---

## Bu düzenlemenin özeti

2026-08-23 — `apple-design` skill'iyle Şeyma ve ÆON yüzeylerinde HIG denetimi yapıldı. Ölçülen: açık temada 9 renk tokenı 4.5:1'in altında (`--faint` 3.06:1 ve 316 metin kullanımı), 65 adet 11pt altı font, `maximum-scale=1` yakınlaştırma kilidi, 54 klavye-erişilemez `<div onclick>`, ve Liquid Glass'ın içerik katmanında kullanımı (69 site) — HIG'in açıkça yasakladığı kalıp.

Koyu tema (14/14 AAA/AA) ve Panel-v2 (her iki temada tümü AA+, adlandırılmış tipografi ölçeği) denetimden temiz çıktı; ikisi de bu programda **referans**, değiştirilmiyor.

Bulgular 52 sıralı prompta dönüştürüldü; 8 tanesi uygulandı.
