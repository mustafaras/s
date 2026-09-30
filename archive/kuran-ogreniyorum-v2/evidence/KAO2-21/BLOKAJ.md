# KAO2-21 — BLOCKED raporu (kullanıcı kararı gerekiyor)
Tarih: 2026-09-30 · Dal: kao2-yeniden-tasarim (= main) · Sıradaki commit tabanı: `98c1ff1f`

Kart `blocked` işaretlendi (P6 durma koşulu: *"kullanıcı kararı gerekiyor"* ve
*"bir düzeltmenin başka bir alanın davranışını değiştirmesi"*).
**Çalışma zamanı bütçesi engeli AYRICA ÇÖZÜLDÜ** (aşağıda §0) — kart artık bütçeden
dolayı değil, bu iki karar nedeniyle duruyor.

---

## §0 Bütçe engeli çözüldü (bu turda, `98c1ff1f`)
Bütçeyi artırmak yerine önce kodu sıkıştırdım ve **veriyi doğru bütçeye** taşıdım:

| Hamle | Kazanç |
|---|---|
| Ölü kod: `kaoTodayStats`, `kaoUnitLabel`, `lemmaSurahId` (hiç çağrılmıyor, dışa aktarılmıyor) | −0.703 KiB |
| `KAO_MAHREC_SVG` (13 SVG, ~5.9 KB) → `app/content/quranMahrecSchemasV1.js` (**salt veri**) | −0.946 KiB |

**Sonuç:** çalışma zamanı **86.032 → 84.745 KiB** (pay 2.0 → **3.34 KiB**), içerik 173.298/256.
Davranış birebir korundu: ders ekranının SVG çıktısı HEAD ile aynı (1 `kao-mahrec`, aynı
`<svg>` markup) — `git stash` ile karşılaştırılarak kanıtlandı. Yeni modül beş yükleme
listesine + SW izin listesine eklendi; iki fixture'ın yükleme listesi güncellendi.

**İkinci bütçe artışına gerek kalmadı** — kullanıcı onayı bekleyen bir engel kalmadı.

---

## §1 ENGEL A — elif (ا) harfi içerikte yok (yeni içerik işi)

07 §2 · ders **0.5** der: *"Bağlanmayan harfler: **ا** د ذ ر ز و — sonraki harfe
bağlanmayan 6 harf"*.

**Ölçüm (gerçek veri):** `QuranPhonicsV1.letters` 28 harf taşır:
`بتثجحخدذرزسشصضطظعغفقكلمنهويء` — **ا (elif) YOKTUR** (elif yalnız `elif-lâm` kuralında
metin olarak geçer). Bağlanmayan küme veriyle: **د ذ ر ز و** (5 harf) + ء (hemze, elif değil).

**Neden ajan çözemez:**
- elif eklemek `quranPhonicsV1.js`'e **yeni harf kaydı** (mahreç, tipTr, ses, SVG) yazmak
  demektir → bu **yeni içerik** üretimidir, K-4 L0/L1 incelemesi ve donmuş içerik
  sürümlemesi ister. KAO/KF programlarının en sert kuralı: **Arapça içerik elle yazılmaz**;
  yalnız araç çıktısı ve donmuş modüllerden atıf.
- Mevcut 28 harfin 28'i `letters` dizisinde tanımlı; 29. harfi uydurmak dosyanın
  `version`/donmuşluk sözleşmesini bozar.

**Seçenekler (kullanıcı):**
- **(A1)** elif'i içerik üretim hattına al: yeni donmuş modül sürümü + L1 onayı + ses klibi.
- **(A2)** Ders 0.5'i veriye uydur: *"Bağlanmayan harfler: د ذ ر ز و"* + elif'i ayrı bir
  kart olarak not et. **07 §2 metni değişir** → plan belgesi düzeltmesi gerekir.
- **(A3)** elif'i sonraki karta bırak, KAO2-21'in (a) maddesini veriyle sınırla.

---

## §2 ENGEL B — (f) maddesi commit'li bir sözleşmeyi kırıyor

Kart (f) der: *"kapı (`kaoGate`) yalnız yerleştirme olarak kalır; **eski 12 mini ders
listesi kaldırılır**"*.

**Ölçüm:** `tests/kao/test_kao_render.js:342` bunu **sabitliyor**:
```
assert.equal(gateTasks.lessons.length, 12, 'Seviye 0 tam 12 mini ders taşımalı');
assert.ok(gateTasks.lessons.every((lesson) => lesson.sounds.length <= 3), 'ders başına en çok üç yeni ses olmalı');
```
Ayrıca `tests/kao/test_kao_requirements.js` ve `test_kao2_onboarding.js` kapının ders
yapısını kullanıyor.

**Neden ajan çözemez:** Bu, **başka bir alanın davranışını değiştiren** bir kaldırmadır
(P6 durma koşulu). Ayrıca commit'li pinleri tersine çevirmek, KAO2-16'daki "taş
mimarisi" ve kapı sözleşmesiyle çelişip çelişmediği **kullanıcı kararıdır**: mini dersler
kapıdan kaldırılınca kullanıcıya kalan yol nedir?

**Seçenekler (kullanıcı):**
- **(B1)** (f)'yi uygula: mini dersleri kapıdan kaldır, S0 akışına devret, üç fixture'daki
  pinleri güncelle (kapı yalnız 20 okunuş + 12 minimal çift).
- **(B2)** (f)'yi ertele: mini dersler kapıda kalsın, yeni S0 akışı **ayrı** yüzey olarak
  eklensin (kapı = yerleştirme, S0 = öğretim). Çelişki doğmaz, kartın (a)–(e) maddeleri
  uygulanır.
- **(B3)** Kapı ile S0'ı birleştir (daha büyük tasarım kararı).

---

## §3 Bu turda hazırlanan (bloke olmayan) malzeme
- `kuran-ogreniyorum-v2/evidence/KAO2-21/HEDEF-SPEC-TESTI.js` — kartın (a)–(f) kabul
  ölçütlerini **çalıştırılabilir spec** olarak kilitler: 07 §2 sırası, 28×4 konum tablosu
  (ZWJ kuralları, bağlanmayan harflerde "biçim yok" işareti), harf başına kelime sesi
  (diskte var + ≈≤3 hece), ders akışı (açıklama → dinle-gör → 6–8 alıştırma → gerçek
  kelime), sessiz saat/ses-yok davranışı, S0.12 okuma provası, (f) kapı daralması.
  **`tests/kao/` altında DEĞİL** — kırmızı kalacağı için test glob'unu kirletmez.
  Karar verilince `tests/kao/test_kao2_s0.js` olarak yerine konur ve yeşile getirilir.
- Ölçümler: S0 dersleri spec'te 07 §2 sırasında ✅ ama `texts.tr.json` eski başlıkları
  taşıyor (0.9 "Şedde ve uzatma", 0.10 "Boğaz harfleri", 0.11 "'el' takısı",
  0.12 "Vakıf ve akıcı okuma") → metin katmanı da güncellenmeli (L1 onayı ile).

## §4 Öneri
**B2 + A2/A3** en düşük riskli yol: yeni S0 akışı ayrı yüzey olarak eklenir (kapı
dokunulmaz), elif kararı kullanıcıya bırakılır. Böylece kartın öğretim değeri
(dinle-gör, konum tablosu, kelime sesi, gerçek kelime okuma) **çelişki doğurmadan**
hayata geçer. A1/B1 seçilirse ek içerik ve üç fixture güncellemesi gerekir.
