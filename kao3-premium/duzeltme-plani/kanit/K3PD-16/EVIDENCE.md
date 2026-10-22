# K3PD-16 — Okuyucunun gerçek kelime vurgusunu ve tekli indeksini düzelt

## Durum: `blocked` / `NOT_MEASURED`

Kusur **gerçekten var ve düzeltmesi doğrulandı**, ancak kartın zorunlu
doğrulaması olan G1 içindeki `test_kao2_perf_budget` runtime tavanı aşılıyor.
Plan §2 tavanı yükseltmeyi açıkça yasaklıyor ve kartın yazma allowlist'i
(`quranLearn.js`, `test_k3p_23.js`, `test_kao2_reader.js`, gerekirse `kao.css`)
allowlist dışı dosyalardan bayt kazanmaya izin vermiyor. Bu yüzden kart
`blocked` olarak durduruldu; kod commit edilmedi.

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

## Blokaj — ölçülmüş bütçe

| Ölçüm | Değer |
| --- | --- |
| HEAD runtime L9 | 140.522 B = **137,229 KiB** |
| Tavan (G1, `test_kao2_perf_budget`) | 140.544 B = **137,25 KiB** |
| **HEAD'de kalan pay** | **22 B** |
| Bu kartın en yalın düzeltmesiyle | 140.731 B = 137,433 KiB (**+209 B**) |
| Tavanı aşma | **187 B** |

Tavan `+187 B` yükseltilseydi kart yeşile dönerdi; **§2 bunu yasaklıyor**
("Tavanı kod/testi geçsin diye artırma"). Allowlist dışına çıkmadan
(ör. `quranLearnFlow.js`'teki gerçek ölü `FLOOR_PER_TASK` sabiti −40 B,
`app.js`'te 13 kullanılmayan fonksiyon) bayt kazanmak da yasak.

Denenen ve **kazanç sağlamayan** gerçek sadeleştirmeler (ölçüldü):

- dört kopya çalma döngüsünün tek yola alınması (K3PD-15'te zaten yapıldı),
- `kaoAudioStop`'un tek fonksiyona indirgenmesi (+12 … −44 B arası, kararsız),
- `ui.kaoGildRun` + `ui.kaoReaderRun` tek `kaoPlayRun` anahtarına birleştirme (−47 B),
- ölü `fsrsRequestRetention` export'unun kaldırılması (−20 B),
- `kaoReaderAdd`'in tek çağrı yerine gömülmesi (−7 B),
- `card.state='learning'…` çiftinin yardımcıya alınması (−78 B **kötüleşti**),
- `.map(kaoScoreAyah(d))` çıkarımı (−54 B **kötüleşti**).

Hiçbiri tek başına 187 B'yi kapatmıyor; birleştirildiğinde de kalan açık
~180 B civarında kalıyor. Ölçüm oynatılmadı: `KAO2_ACCEPT_SLOW_HOST`,
`KAO2_WRITE_BASELINE` ve taban dosyası **kullanılmadı/değiştirilmedi**.

## Kullanıcı kararı gerekiyor (bu kart için)

1. **Tavanı yükselt** — 137,25 → 137,5 KiB (≈+256 B pay). K3PD-11/13/14'te
   olduğu gibi açık kullanıcı onayı ister; tek başına kartı yeşile döndürür.
2. **Allowlist'i genişlet** — `app/core/quranLearnFlow.js` ve/veya `app.js`'e
   yazma izni; oradaki gerçek ölü kod (ör. `FLOOR_PER_TASK`) temizlenerek pay
   açılır. Yeni kapsam kararı olmadan yapılamaz.
3. **Kartı ertele** — K3PD-32'deki pinli yayın adayı hazırlanırken bütçe
   yeniden ölçülür; K3PD-16 o adayla birlikte değerlendirilir.

## Sınırlar

- Ağ, gerçek kullanıcı verisi, token, `seyma-data`, tarayıcı kullanılmadı;
  tüm koşumlar ağsız sentetik Node/VM.
- Ses dosyalarına ve `app/kao.css`'e dokunulmadı (CSS zaten doğru kuralı taşıyor).
- Bu oturumdaki değişiklikler **commit edilmedi**; `git status` ile görülür.
- Görsel/cihaz/ekran okuyucu kabulü yapılmadı.
