# KAO-03 · Devir — **KULLANICI GÖREVİ** (arada durum: waiting_user)

**Tarih:** 2026-09-23 · **Başlangıç HEAD:** `f6964fc45429fff775b4903ebc493ae6a12428b5`
· **Durum:** `waiting_user` · **Ajan:** GitHub Copilot (deepseek-v4.1-flash:cloud)

---

## 🧑‍💻 SENDEN İSTENEN (kademeli — istediğin seviyeden başla)

**Dosya:** `kuran-ogreniyorum/content/lexicon.workbook.md`

| Seviye | Bant | Kelime | Ne olur |
|---|---|---|---|
| **1** | Kova D | **63** | KAO-05 açılır; Fâtiha + kısa sûreler + tesbihat öğretilebilir hâle gelir |
| **2** | + A + C₁ | ~140 | Kur'an'ın en sık kelimeleri hazır |
| **3** | + C₂ + C₃ | 524 | %80,9 kapsam (plan hedefi %80 ✓) |

Her satırda doldurulacak: `tr1` (zorunlu), `tr2`, `pattern`, `cognateTr`,
`cognateShift`, `context_tr` (cümlenin çevirisi), `verifiedBy`, `verifiedAt`.

**Onay kuralı (06 §3):** iki bağımsız göz **ya da** aynı kişinin iki ayrı günü
(ikinci durumda `verifiedAt`'e iki tarih: `insan-1 (2026-09-23; 2026-09-24)`).

Doldurduktan sonra (birincil doldurma yolu `lexicon.review.md`'dir; workbook okuma
kolaylığı içindir):
```sh
node tools/kao-lexicon-build.mjs --import-md    # lexicon.review.md → lexicon.verified.json
```
Kısmi onay da geçerlidir: `--import-md` yalnız **doğrulanmış** satırları sayar;
kalan satırlar `waiting_user` olarak kalır ve kademeli açılır.

---

## Ne yapıldı (ajan tarafı)

- Tablo **600 satıra** çıkarıldı (D-11: sıra eşiği 500→600, kapsam **%78,7 → %81,0** — hedef %80 tuttu).
- Tabloya **sütun kılavuzu** gömüldü (kim yazar / ne yazılır / onay kuralı).
- `--import-md`'ye **tutarlılık denetimi** eklendi: ≥3 örnek, `S:A` ref biçimi,
  Arapça blok bütünlüğü, doğrulanmış satırda Türkçe anlam + örnek çevirisi.
- **İki-göz kuralı makine-doğrulanabilir** hale getirildi.
- **Bekçi:** boş/uyumsuz tablo uyarır; yinelenen `lemmaId` atlanır ve raporlanır.
- freq 1–2 lemma için "≥3 örnek" kuralı **gerekçeli istisna** olarak kaydedildi
  (`examplesException: corpus_windows_exhausted`) — **eksik alan uydurulmadı**.

## Kontrol sonuçları

| Komut | Exit | Sonuç |
|---|---|---|
| `node --check tools/kao-lexicon-build.mjs` | 0 | syntax PASS |
| `node tools/kao-lexicon-build.mjs --self-test` | 0 | PASS (iki-göz, tutarlılık, istisna, determinizm) |
| `… --draft` | 0 | 600 aday · A=22 B=0 C=515 D=63 · kapsam **%81,0** (goalMet ✓) |
| `… --import-md` | 0 | verified=0 rows=600 duplicates=0 → waiting_user |
| `node kuran-ogreniyorum/tools/kao-plan-check.mjs` | 0 | PASS (0 warn) |
| `git -c core.fsmonitor=false diff --check` | 0 | çıktı yok |

## Gereksinim kapanışı

| R-id | Durum | Kanıt |
|---|---|---|
| R-A8 | **partial** | Şema + kalıp/kognat sütunları hazır ve doğrulanabilir; ≥60 kök listesi **insan girdisi** (0 satır doğrulandı) |

## Kalan iş / bilinen sınır

- **Bu kart kullanıcı girdisi olmadan kapanamaz**; ajan içerik yazmadı.
- 10 lemma (freq 1–2) 3. örnek penceresi vermiyor → gerekçeli istisna.
- **D-05** (repo LICENSE) ve **D-08** (ses köken doğrulaması) **yayın kapısında
  sana aittir**; `releaseApproval = NOT_APPROVED` olarak kalır.

## Sonraki yetkili eylem

1. `lexicon.review.md`'yi doldur → `--import-md` → `verifiedBy` boş = 0 olunca kart `done`.
2. Sonra: `node kuran-ogreniyorum/tools/kao-plan-check.mjs --card KAO-04` (gramer içeriği, KAO-01'e bağlı, başlanabilir).

Push/merge/tag/deploy yapılmadı.
