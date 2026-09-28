# KAO-02 · Devir

**Tarih:** 2026-09-23 · **Başlangıç HEAD:** `aee9ec219dbd03f806a76bb38bc01c040b323705`
· **Durum:** done (kullanıcı görevi bekliyor) · **Ajan:** GitHub Copilot (deepseek-v4.1-flash:cloud)

## Ne yapıldı

- `--draft` / `--review-md` / `--import-md` modları eklendi; seçim kuralı 03 §9'un
  sıra eşikleri (parçacık ≤100, içerik ≤500, çapa sıralamadan bağımsız) uygular.
- Korpustan **503 aday** üretildi: kovalar A=22 · B=0 · C=418 · D=63; hiçbir satır
  doğrulanmadı (`verified:false`, `tr1`/`cognateTr`/`ex1_tr` boş).
- `semNeighbors[]` ÖNERİ olarak üretildi: aynı kök kardeşleri + 12 anlam kümesi
  (korpustan doğrulanmış 42 kök; bilinmeyen kök sessizce varsayılmadı, raporlandı).
- İki katmanlı mekanik transliterasyon (`tr` okunuş / `dia` DİA), şedde ikilemesi,
  uzun ünlü soğurması ve sözcük başı glide kurallarıyla.
- **Tanzil bütünlük kapısı onarıldı:** sabitlenmiş tam-dosya SHA-256 hiçbir gerçek
  indirmeyle eşleşmiyordu (telif bloğunda dinamik yıl). Kapı, yorumsuz **gövde
  SHA-256** + **yapısal kapıya** çevrildi.
- Kapsam ölçüldü: **%78.7** (LEM havuzu). Hedef %80; eşiği yükseltme kararı
  kullanıcıya bırakıldı (D-11) — araç kendi kendine değiştirmedi, alternatifleri raporladı.

## Kontrol sonuçları

| Komut | Exit | Sonuç |
|---|---|---|
| `node --check tools/kao-lexicon-build.mjs` | 0 | syntax PASS |
| `node tools/kao-lexicon-build.mjs --self-test` | 0 | PASS (gömülü 50 satır + Tanzil/taslak/inceleme regresyonları) |
| `... --inputs kuran-ogreniyorum/content/inputs` | 0 | token=77429 lemma=4832 root=1642 verse=6236 |
| `... --inputs … --draft` | 0 | candidates=503 · bucket {A:22,B:0,C:418,D:63} · verified=0 |
| `... --review-md` | 0 | `lexicon.review.md` 503 satır / 18 sütun |
| `... --import-md` | 0 | verified=0 → waiting_user (çıktı dosyası silindi) |
| `... --inputs <girdi yok>` | 2 | fail-closed eksik-girdi (adres + tarif + hash) |
| `... --inputs <hash uyuşmazlığı>` | 3 | fail-closed bütünlük dalı |
| `node kuran-ogreniyorum/tools/kao-plan-check.mjs` | 0 | PASS (0 warn) |
| `node tests/quran/test_quran_catalog.js` | 0 | 70/70 PASS |
| `node .claude/skills/run-seyma/verify-state-migration-boundary.mjs` | 0 | 67/67 PASS |
| `node tests/app/test_state_rebind_boundary.js` | 0 | 37/37 PASS |
| `git -c core.fsmonitor=false diff --check` | 0 | çıktı yok |

## Gereksinim kapanışı

| R-id | Durum | Kanıt |
|---|---|---|
| R-A5 | **partial** | `semNeighbors[]` üretildi (aynı kök + anlam kümesi, `proposed:true`); 3-gün serpiştirme kuralı kuyruk motorunda (KAO-09) |
| R-A8 | **partial** | Şema + inceleme sütunları hazır (`cognate`, `cognateTr`, `cognateShift`, `pattern`); ≥60 kök listesi insan içeriği → KAO-03/KAO-04 |

## Kalan iş / bilinen sınır

- **Kullanıcı görevi:** `lexicon.review.md` satır satır doldurulacak (tr1/tr2,
  cognateTr/cognateShift, ex1_tr, verifiedBy). 06 §3 onay kuralı: iki bağımsız göz
  ya da iki ayrı günde kontrol. `verifiedBy` boş = onaysız.
- B kovası boştur; kognat kararı insan girdisi bekler.
- Kapsam %78.7 < hedef %80 → D-11 kararı (eşik 500→600 hedefi tutturur).
- D-02 (Tanzil lisans/atıf kabulü) açık kalır; yayına girmeden kullanıcı onayı gerekir.
- Arapça/transliterasyon mekaniktir (`auto:true`), insan doğrulaması şarttır.

## Sonraki yetkili eylem

`node kuran-ogreniyorum/tools/kao-plan-check.mjs --card KAO-03` → sıradaki prompt
**KAO-03** ("İnsan doğrulaması (kullanıcı görevi) ve içe alma"). KAO-03, KAO-02'nin
inceleme tablosunu tüketir ve **kullanıcı girdisi olmadan kapanamaz**.

Push/merge/tag/deploy yapılmadı; `releaseApproval` = `NOT_APPROVED`.

## Sertleştirme turu (2026-09-23) — 7 kusur kapatıldı

"Tam ve kusursuz" iddiası bağımsız denetimle çürütülmeye çalışıldı; gerçek kusurlar bulundu:

| # | Kusur | Düzeltme |
|---|---|---|
| H1 | `lemmaId` çakışması (5 örnek) — Buckwalter `i`/`a` iki farklı harfi temsil eder | kimlik = `l_<slug>_<sha256[:6]>` (deterministik, çakışmasız) |
| H2 | İnceleme tablosunda 3 örnek sütunundan 1'i vardı; `verifiedAt` yoktu | 25 sütun: ex1/2/3 + verifiedAt |
| H3 | Yinelenen `lemmaId` sessizce ezilebiliyordu | ilk kayıt kazanır + `duplicated` raporlanır; boş-tablo uyarısı |
| H4 | 10 satır 05 §1'in ≥3 örnek kuralını tutmuyordu ve bildirilmiyordu | `exampleStats` + uyarı; alan uydurulmadı |
| H5 | Tabloda girilen `verifiedAt` yok sayılıyordu (06 §3 iki-ayrı-gün kaydı) | girilen tarih korunur |
| H6 | Araç "B kovasını elle incele" diyordu ama B'yi kendisi atayabilirdi | kognatlı satır B'ye atanır (D>A>B>C önceliği) |
| H7 | Self-test hermetik değildi (gerçek depo dosyasını okuyordu) | IO kenara taşındı; insan girdisi parametre (`carryHuman`) |

**Ek güvence:** yeniden `--draft` koşmak insan girdisini (tr1/tr2, kognat, kalıp,
örnek çevirisi, verifiedBy/At) **korumaz** değil — korur; bu davranış regresyonla bağlandı
(`carryHuman:false` test modu). Aksi halde KAO-03 işi kaybolurdu.

**Doğrulama:** self-test PASS · 22 maddelik denetim 0 açık bulgu · 12/12 kapı exit 0.
