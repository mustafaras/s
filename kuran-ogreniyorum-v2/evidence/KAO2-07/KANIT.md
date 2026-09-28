# KAO2-07 — Müfredat derleme aracı ve quranCurriculumV2.js
Tarih: 2026-09-28 · Dal: kao2-yeniden-tasarim · Önceki commit: 944dae6c

## Yapılan
- `tools/kao2-curriculum-build.mjs` (yeni): `curriculum.spec.json` + donmuş `QuranLexiconV1`/`QuranGrammarV1`/`QuranShortSurahsV1` modüllerinden belirlenimci derleme. Zaman damgası yok; `--out-dir` ile geçici dizine yazabilir.
- Algoritma: (i) Ünite 1–3 çapa metin sırası (ilk geçiş), yalnız `l_*` lemmalar (`lp_*`/`ls_*` ek sözlük derslere girmez); (ii) Ünite 4–12 odak listeleri (spec'te yalnız kimlik) + havuz kuralları (spec `poolRules`, ilk eşleşen); eşitlikte sıklık azalan, sonra kimlik; Ünite 10–11 `unit11.roots` sırasıyla kök ailesi gruplu; (iii) derslere bölme: sıra korunarak 3–7'lik, semNeighbors çakışmasız, hedef 5'e en yakın dinamik programlama; ders sayısı ≥ ünite kavram sayısı; sıra birebir korunamıyorsa kararlı erteleme; (iv) son ders `mastery:true`.
- `kuran-ogreniyorum-v2/content/curriculum.spec.json` (yeni, elle, Arapça yok): 7 seviye, 12 ünite (07 §3 tablosu: başlık, vaat, kavram kimlikleri, çapa), odak listeleri kimlikle, Ünite 1 ders başlıkları, S0 12 başlık; tüm metinler `review.level:'draft'`.
- `app/content/quranCurriculumV2.js` (araç çıktısı): `window.QuranCurriculumV2={version:'quran-curriculum-tr-v2', levels, units[{id, level, title, promise, conceptIds, anchor, lessons[{id, title, lemmaIds, conceptId, apply:{kind, ref}, mastery, review}], review}], s0:{lessons}, lemmaToLesson, byLesson(id)}`; derin dondurulmuş.
- `kuran-ogreniyorum-v2/inceleme/MUFREDAT-ESLEME.md` (araç çıktısı): özet tablo, karar bekleyen noktalar, S0, ünite/ders başına kelime tablosu (Arapça + okunuş + anlam içerik modülünden), en altta G2 onay kutuları.
- Yükleme: `index.html` (`quranPhonicsV1.js` sonrası, `?v=20260928b`), `sw.js` önbellek listesi, `tests/app/test_state_rebind_boundary.js`, `.claude/skills/run-seyma/driver.mjs` ve `zikr-harness.mjs` FILES listeleri. İki `.claude/skills` dosyası K-2 kuralı gereği **Edit aracıyla** (izin istemiyle) düzenlendi. Sürüm pini `20260928b` değişmedi.

## TDD
- Kırmızı (`red.txt`): `node tests/kao/test_kao2_curriculum.js` → `AssertionError: app/content/quranCurriculumV2.js eksik` (exit 1); `node tests/kao/test_kao2_perf_budget.js` → `AssertionError: quranCurriculumV2.js eksik` (exit 1).
- Ara kırmızılar: araç ilk sürümde Ünite 10 (49 kelime) ve Ünite 11 (21 kelime) için "çakışmasız derslere bölünemiyor" hatası verdi — aynı kök ailesinin anlam komşuları art arda (ör. 5'li küme). Kararlı erteleme eklendi. Test ilk koşuda VM realm'ından gelen dizilerle `deepStrictEqual` prototip farkına takıldı; diziler ana bağlama kopyalandı (beklenti değişmedi).
- Yeşil (`green.txt`): `node tests/kao/test_kao2_curriculum.js` → `KAO2 curriculum: PASS (12 kontrol)`; perf 5/5 PASS.

## Kapılar (P3)
Tam çıktı: `gates.txt`.

| Komut | Sonuç |
|---|---|
| `node --check` quranLearn.js / quranLearnFlow.js / quranLearnViews.js / quranCurriculumV2.js | PASS ×4 |
| tests/kao | 23/23 PASS |
| tests/app | 77/77 PASS |
| tests/panel | 23/23 PASS |
| tests/panel-v2 | 27/27 PASS |
| tests/quran | 9/9 PASS |
| reminders smoke | PASS (73 sözleşme, 21 fixture) |
| run-seyma driver | PASS (MON-04 sıra paritesi dahil) |
| zikr-harness | 95/95 PASS |
| kao-verify-contrast | 382 çift, 0 ihlal |
| kao2-sync-check | PASS |

## Ölçümler
- (a) 524/524 `l_*` lemma tam birer derste; sözlük dışı kimlik 0.
- (b) 12 ünite · **109 ders** · ders başına 3–7 (çoğunluk 5). Ünite kelime/ders: Ü1 23/5 · Ü2 16/3 · Ü3 28/6 · Ü4 25/5 · Ü5 10/2 · Ü6 196/40 · Ü7 42/9 · Ü8 46/9 · Ü9 57/11 · Ü10 49/10 · Ü11 21/6 · Ü12 11/3.
- (b2) semNeighbors aynı derste: 0.
- (c) Ünite 1 = Fâtiha (Besmele dahil) 23 lemma, ilk geçiş sırası birebir; Ünite 2 çapa bloğu 5 lemma namaz metni sırasıyla başta + 11 spec odak kimliği; Ünite 3 = İhlâs/Felak/Nâs 28 lemma birebir.
- (d) 25/25 kavram ≥1 derse bağlı; tüm `conceptId` geçerli ya da null.
- (e) S0 `s0.01…s0.12`.
- (f) `lemmaToLesson` 524 giriş, `byLesson` tüm dersler için aynı nesne, bilinmeyen → null.
- (g) İki çalıştırma bayt-eşit ve depodaki çıktıyla aynı; SHA-256 modül `77ef3ccb…a97a60`, inceleme `dde9dc80…b403d3`.
- (h) gzip 10,104 KiB ≤ 48 KiB. İçerik toplamı 168,476 KiB ≤ 256 KiB (önce 158,372). VM p95 4,135–4,680 ms (taban 5,088 × 1,25 = 6,36 ms); modülün tek başına yükleme maliyeti ≈0,3 ms.

## Bilerek değişen testler
- `tests/kao/test_kao2_perf_budget.js`: eski beklenti "müfredat modülü varsa ölç" → yeni "müfredat modülü zorunlu ve her zaman ölçülür". Sıkılaştırma; eşikler değişmedi.
- `tests/app/test_state_rebind_boundary.js`: boot listesine `app/content/quranCurriculumV2.js` eklendi (dört liste kuralı). Beklenti değişmedi.

## Kanıt düzeyleri
- Kaynak/test: ✓ · Yayın: yok (releaseApproval yalnız KAO2-06'ya kadar) · Cihaz: yok (kullanıcıda).

## Sürprizler / backlog
- **Ünite 6 = 196 kelime (40 ders)**: kartın "isim → 6" kuralı harfiyen uygulandı; hedef 20–60 dışında. Ünite 5 = 10, Ünite 12 = 11 kelime (hedefin altında). Dengeleme yalnız spec `poolRules` düzenlemesiyle yapılabilir (ör. türemiş isim kalıplarını ism-i fâil/mef'ûl/masdar → Ünite 10 taşımak Ünite 6'yı ≈145'e indirir; ölçüldü, uygulanmadı). G2 kararına bırakıldı.
- **Ünite 2 varsayımı**: namaz metinlerinin çoğu kelimesi `lp_*` (sözlükte yok), sözlükte yalnız 5 `l_*` lemma var; tek ders 2 kavramı (g3, g4) taşıyamaz ve (d) ölçütü düşerdi. Bu yüzden çapa bloğu başta tutulup eski 03-MUFREDAT Ünite 2 odak listesinin sözlük karşılıkları (11 kimlik) eklendi. Test çapa bloğunun sırasını ve ek kelimelerin yalnız spec odak listesinden geldiğini doğrular.
- **Ders sayısı 109, plandaki "~75" değil**: kartın "5'erli" bölme kuralı ve 524 lemma 109 dersi zorunlu kılar; commit başlığı gerçek sayıyı taşır.
- Perf ilk P3 denemesinde soğuk başlangıçta p95 7,446 ms ölçüldü (eşik 6,36); 5 izole tekrar 4,09–4,44 ms ve tam P3 koşusu PASS. Önceki kartlardaki gürültü notuyla aynı.
- İlk P3 aile döngüsü zsh'ta kelime bölünmediği için tek dosya adı gibi koştu (kabuk hatası, test hatası değil); glob'la yeniden koşuldu, `gates.txt` o koşudur.
- README.md'deki eski "sıradaki kart KAO2-03" satırı sürüyor; talimat gereği değiştirilmedi.
- jev-gate CLI bu oturumda `TypeSafeAPIConnectionError` verdi; oturum kancasının aynı istek için verdiği değerlendirme ("yeni özellik · yüksek muhakeme · doğrula") izlendi.

## Ek — FIX (G2 dengeleme, 2026-09-28)
- Kullanıcı G2'de "Onay + Ünite 6 dengele" seçti. Spec `poolRules`'a kök ailesi kuralından sonra yeni kural eklendi: türemiş isimler (`ism-i fâil|mef'ûl|mekân`, `masdar`; N/ADJ/PN) → Ünite 10 (g19 yapan-yapılan, g20 fiilin adı).
- Sonuç: Ü6 196/40 → **147/30**, Ü10 49/10 → **98/20**; diğer üniteler aynı; toplam 109 ders. Müfredat testi 12/12 PASS, gzip 10,111 KiB, perf p95 4,132 ms PASS.
