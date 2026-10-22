# K3PD-16 — Okuyucunun gerçek kelime vurgusunu ve tekli indeksini düzelt

## Durum: `ready_for_audit` / `NOT_MEASURED`

Kusur doğrulandı, düzeltme uygulandı ve doğrulandı. Kart bağımsız denetime hazır;
hüküm `NOT_MEASURED` (bağımsız denetim yapılmadı, PASS değildir).

Bütçe engeli **kullanıcı onayıyla** çözüldü: runtime L9 tavanı **137,25 → 137,5 KiB**
(K3PD-11/13/14 emsali). Gerekçe ve ölçüm aşağıda "Bütçe" bölümünde.

## Bulgu (F-07 / K3P-23) — doğrulandı

`kaoReaderPlayWords` iki ayrı kusur taşıyordu:

1. **Tekli çalma yanlış indeks:** `words` alt dizi olarak (`[words[openWord]]`)
   geçiriliyor, `onStart(index)` ise **alt dizi indeksini** yazıyordu. 3. kelime
   seçilip "Kelimeyi dinle" denince `ui.kaoReaderPlaying = 0` oluyordu → yanlış
   kelime altın halkayla işaretleniyordu (ölçüm: beklenen 3, gerçek 0).
2. **Vurgu hiç güncellenmiyordu:** `kaoPlayList` `onStart` çağırıyor ama motor
   `render()` istemiyordu. `aria-current` DOM'da hiç kaymıyordu — yalnız ilk
   kelime işaretli kalıyor, `ui.kaoReaderPlaying` değişse bile ekran sabit kalıyordu.
3. **İptal yoktu:** son `ended`, `error`, görünümden çıkış, başka sûre ve
   yeniden çalma durumlarında eski callback yeni ekranı değiştirebiliyor, çalan
   ses susturulmuyordu (iki ses üst üste binebiliyordu).

Kırmızı kanıt — düzeltme öncesi `HEAD` kodunda 7 senaryonun **6'sı kırmızı**:

| # | Senaryo | HEAD | Düzeltmeyle |
| --- | --- | --- | --- |
| A | `ended` sonrası gerçek vurgu kayar (0→1) + çizim istenir | RED | GREEN |
| B | tekli çalma satır indeksi (3 → 3) | RED | GREEN |
| C | son `ended` vurguyu temizler | RED | GREEN |
| D | `error` vurguyu temizler | GREEN | GREEN |
| E | görünümden çıkış vurguyu temizler | RED | GREEN |
| F | eski `ended` yeni okuyucuya dokunmaz | RED | GREEN |
| G | aynı anda tek ses (yeni çalma öncekini susturur) | RED | GREEN |

## Hazırlanan düzeltme (uygulandı, doğrulandı, commit edilmedi)

- `kaoPlayList` zaten `onStart/onAudio/onFail/onDone/alive` kancalarını taşıyor
  (K3PD-15'te bu şekilde genişletilmişti). Okuyucu artık:
  - vurguyu `offset + k` ile **satırın gerçek indeksine** yazıyor,
  - her audio olayından sonra `quranLearnDeps.render()` çağırıyor,
  - `alive()` kimliğiyle eski callback'i etkisizleştiriyor,
  - `kaoAudioStop()` ile (K3PD-15'in paylaşılan sınırı, kopyalanmadı) çıkışta
    / görünüm değişiminde / kapatmada / kelime açmada temizleniyor.
- Yeni `App.kao*` handler **yok** (45 sabit), yeni app/core modülü yok,
  şema/`migrate()`/`sync.js` değişmedi.

Doğrulanan testler (hepsi exit 0): `test_k3p_23` (19 kontrol, 11'i yeni),
`test_kao2_reader`, `test_k3p_mount`, `test_kao2_a11y`, `test_kao_migration`,
`test_kao2_migration`, `test_k3p_lesson_ayah`, `test_k3p_audio_buttons`,
`test_kao_queue`, `test_kao_requirements`, `driver`, `zikr-harness` (95/95),
`asset_pin_freshness`, `iip_22`, `local_visual_qa_guard`.

## Bütçe — ölçülmüş ve karara bağlanmış

| Ölçüm | Değer |
| --- | --- |
| HEAD runtime L9 | 140.522 B = **137,229 KiB** |
| Tavan (G1, `test_kao2_perf_budget`) | 140.544 B = **137,25 KiB** |
| **HEAD'de kalan pay** | **22 B** |
| Bu kartın en yalın düzeltmesiyle | 140.731 B = 137,433 KiB (**+209 B**) |
| Tavanı aşma | **187 B** |

**Karar:** tavan `137,25 → 137,5 KiB` yükseltildi (kullanıcı onayı, 2026-10-22;
K3PD-11/13/14 aynı yolu izlemişti). Yeni ölçüm **137,450 / 137,5 KiB**, pay 51 B.
`test_kao2_perf_budget` ve `test_kao2_mastery` aynı tavanı ve aynı gerekçeyi taşır.
Allowlist dışına çıkılmadı (ör. `quranLearnFlow.js`'teki ölü `FLOOR_PER_TASK`,
`app.js`'teki 13 kullanılmayan fonksiyon **temizlenmedi**).

Denenen ve **kazanç sağlamayan** gerçek sadeleştirmeler (ölçüldü):

- dört kopya çalma döngüsünün tek yola alınması (K3PD-15'te zaten yapıldı),
- `kaoAudioStop`'un tek fonksiyona indirgenmesi (+12 … −44 B arası, kararsız),
- `ui.kaoGildRun` + `ui.kaoReaderRun` tek `kaoPlayRun` anahtarına birleştirme (−47 B),
- ölü `fsrsRequestRetention` export'unun kaldırılması (−20 B),
- `kaoReaderAdd`'in tek çağrı yerine gömülmesi (−7 B),
- `card.state='learning'…` çiftinin yardımcıya alınması (−78 B **kötüleşti**),
- `.map(kaoScoreAyah(d))` çıkarımı (−54 B **kötüleşti**).

Hiçbiri tek başına açığı kapatmıyor; birleştirildiğinde de kalan açık ~180 B
civarında kalıyor. Ölçüm oynatılmadı: `KAO2_ACCEPT_SLOW_HOST`,
`KAO2_WRITE_BASELINE` ve taban dosyası **kullanılmadı/değiştirilmedi**.

## Uygulanan düzeltme (özet)

- `kaoReaderPlayWords(words,onFail,off)` — `off` satır başı; vurgu `off + index` ile
  **satırın gerçek indeksine** yazılır (3 seçilirse 3).
- Her audio olayında `quranLearnDeps.render()` → `aria-current` gerçekten kayar.
- Tek oturum alanı: yaldız ve okuyucu `ui.kaoGildRun`'ı paylaşır; `kaoGildStop()`
  kimliği null'lar, timer'ı bırakır, çalan sesi `pause()` eder.
- İptal noktaları: yeni çalma, kelime açma, görünüm değişimi (`kaoApplyView`),
  kapatma (`kaoClose`), ders çıkışı (`kaoLesson`) — hepsi mevcut çağrı noktaları.
- Yeni `App.kao*` yok (45), şema/`migrate()`/`sync.js`/içerik/CSS/pin değişmedi.

## Doğrulama sonuçları

| Komut | Exit |
| --- | ---: |
| `tests/kao/test_k3p_23.js` | 0 (19 kontrol, 7 yeni K3PD-16) |
| `tests/kao/test_kao2_reader.js` | 0 |
| `tests/kao/test_k3p_mount.js` · `test_kao2_a11y.js` | 0 · 0 |
| `tests/kao/test_kao_migration.js` · `test_kao2_migration.js` | 0 · 0 |
| `tests/kao/test_kao2_perf_budget.js` | 0 (137,450 / 137,5 KiB, p95 4,827 ms) |
| `tests/kao/test_kao2_mastery.js` | 0 (45 kontrol) |
| `tests/kao/test_k3p_lesson_ayah.js` · `test_k3p_audio_buttons.js` | 0 · 0 |
| `tests/kao/test_kao_queue.js` · `test_kao_requirements.js` | 0 · 0 |
| `driver.mjs` · `zikr-harness.mjs` | 0 · 95/95 |
| `tests/kao` tamamı | 83 dosya, **4 kırmızı — dördü de HEAD'de kırmızı** |

HEAD'de de kırmızı olanlar (kapsam dışı, gizlenmedi): `test_kao2_components`,
`test_kao2_curriculum`, `test_kao2_feedback` ve bu üçünü içeren `test_kao2_kabul`
(ayrıca `tests/app/test_app_surface_boot_boundary.js` ve
`test_app_surface_domain_boundary.js` HEAD'de kırmızı).

## Sınırlar

- Ağ, gerçek kullanıcı verisi, token, `seyma-data`, tarayıcı kullanılmadı;
  tüm koşumlar ağsız sentetik Node/VM.
- Ses dosyalarına ve `app/kao.css`'e dokunulmadı (CSS zaten doğru kuralı taşıyor).
- Bu oturumdaki değişiklikler **commit edilmedi**; `git status` ile görülür.
- Görsel/cihaz/ekran okuyucu kabulü yapılmadı.
