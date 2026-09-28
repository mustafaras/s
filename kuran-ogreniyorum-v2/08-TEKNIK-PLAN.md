# 08 — Teknik plan

Hedef: yeni deneyimi, motoru ve veri güvenliğini bozmadan kurmak. Tüm
değişiklikler `data.quranLearn` altında kalır ve geri uyumludur.

## 1. Veri modeli eklemeleri (`data.quranLearn`)

Yalnız **ekleme**; mevcut alanların anlamı değişmez. Örnek değerler sentetiktir.

```js
quranLearn: {
  // … mevcut: schemaVersion, lexiconVersion, settings, cards, units, surahs,
  //           daily, milestones, phonics, errors, gate, readability, ayahs, transfer …

  onboarding: {                  // YENİ
    doneAt: null,                // ISO-8601 dize (örn. "2026-10-01T18:04:11.000Z") | 'legacy' | null
    start: null,                 // 's0' | 'placement' | 'level1' | null
    minutes: 5,                  // 5 | 10 | 15  (dailyNew bundan türetilir: 5→5, 10→10, 15→15)
    intent: null,                // 'fajr'|'dhuhr'|'asr'|'maghrib'|'isha'|'custom'|null
    whatsNewAt: null             // mevcut kullanıcıya "Yeni düzen" notu gösterildi mi (ISO | null)
  },
  path: {                        // YENİ: müfredat ilerlemesi
    lessons: {                   // anahtar: ders kimliği ("u1.l3", "s0.07", "s5.ihlas")
      "u1.l1": { startedAt: "2026-10-01T18:05:00.000Z", doneAt: "2026-10-01T18:11:30.000Z", score: 0.9 }
    },
    units: {                     // anahtar: "1".."12"
      "1": { masteryAt: null, masteryScore: null }
    }
  },
  settings: { …, autoAdvance: false }   // YENİ alan; varsayılan false
}
```

Kurallar:
- `ensureQuranLearn()` (dolayısıyla `migrate()` yolu) eksik `onboarding`/`path`
  alanlarını varsayılanla doldurur; bozuk tipleri normalize eder (mevcut
  `objectOr/boolOr` kalıbı).
- **Mevcut kullanıcı tespiti:** `cards` boş değilse `onboarding.doneAt`
  normalizasyonda `'legacy'` değeriyle doldurulur (ilk açılış gösterilmez).
- `path.lessons` **türetilebilir** olmalıdır: bir dersin "tamam" sayılması,
  derse ait tüm lemmaların ar>tr kartının var olmasıyla da hesaplanabilir. Böylece
  eski kullanıcı ilerlemesi eşleme tablosundan yeniden kurulur, veri kaybolmaz.
- Eski `q.units` (hiç yazılmamış boş nesne) dokunulmadan kalır; yeni yapı `path.units`.
- `milestones`'a yeni anahtarlar: `besmele`, `u1`…`u12`. Panel projeksiyonu
  (`kaoPanelSummary`) bilinmeyen anahtarı yok sayar; yeni anahtarlar panel
  aynasına eklenir (§6).
- Boyut: `test_kao_state_budget.js` bütçesi `path` için yeniden ölçülür
  (~75 ders × ~90 bayt ≈ 7 KB üst sınır).

## 2. Geçici UI durumu (`ui`, kalıcı değil)

| Alan | Tip | Amaç |
|---|---|---|
| `kaoStack` | `[{view, param, title}]` | Gezinme yığını; `kaoView` yığının tepesinden türetilir (geri uyum) |
| `kaoOnboard` | `{step, choice, placement}` | İlk açılış adımı |
| `kaoLesson` | `{id, phase, index, items, results}` | Ders oynatıcı |
| `kaoPanel` | `{open, correct, choiceId, explanation}` | Geri bildirim paneli (mevcut `kaoFeedback` dizesi okuma için korunur) |

`ui` `app.js` içinde tanımlı; yeni alanlar yalnız `quranLearn.js` içinde,
`objectOr` ile tembel başlatılır (app.js'teki `ui` literaline dokunulmaz).

## 3. Saf fonksiyonlar (yeni, test edilebilir)

| Fonksiyon | Girdi → çıktı |
|---|---|
| `kaoCurriculum()` | `window.QuranCurriculumV2` → normalize edilmiş seviye/ünite/ders ağacı |
| `kaoLessonOf(lemmaId)` | lemma → ders kimliği |
| `kaoLessonProgress(d, lessonId)` | `{total, introduced, settled, done}` |
| `kaoUnitProgress(d, unitId)` | `{words, known, lessonsDone, lessons, mastery}` |
| `kaoNextStep(d, now)` | 05 §4 tablosu → `{kind, title, subtitle, minutes, action, param}` |
| `kaoLessonPlan(d, lessonId, now)` | Tanış + Kavram + Pekiştir + Uygula öğe listesi (mevcut `kaoBuildTask` ile) |
| `kaoExplain(task, choice)` | 07 §4 şablonları → geri bildirim metni |
| `kaoEstimateMinutes(d, items)` | Son 7 günün ortalama görev süresi |

`kaoBuildQueue` **korunur**; günlük dersin "Tekrar" bölümü onu yeni kelime
bütçesi 0 ile çağırır; yeni kelimeler artık ders oynatıcıdan gelir. Böylece
FSRS, serpiştirme ve anlamsal ayrım kuralları (R-A2, R-A5, KF-9) aynen işler.

## 4. Handler yüzeyi

Yeni `App.kao*` handler'ları **en aza indirilir** (her biri fx2/v3/surface
pinini kaydırır):

| Handler | Görev |
|---|---|
| `App.kaoNav(view, param)` | Yığına it (tüm "›" satırları) |
| `App.kaoBack()` | Yığından çek |
| `App.kaoOnboard(action, value)` | İlk açılış adımları + yerleştirme |
| `App.kaoLesson(action, value)` | Ders oynatıcı: `start`, `next`, `answer`, `exit` |
| `App.kaoContinue()` | Geri bildirim panelinden "Devam" (tekrar turu + ders) |

Toplam **+5 handler**. Mevcut 35 handler korunur (geri uyum; eski çağrılar
yeni yığına yönlenir). `kaoSetView` yığını sıfırlayıp tek görünüm iter.

Pin güncellemesi aynı committe yapılır: `tests/app/test_fx2_*` App yüzeyi
sayısı, v3 tıklama sayısı, `test_iip_22.js` yayın pini, `index.html` + `sw.js`
`?v=` dizeleri. **Yorumlarda handler ataması ya da tıklama niteliği adı yazılmaz**
(düz metin tarayıcısı sayar).

## 5. Dosya düzeni

> **KARARLAŞTI (2026-09-28): [10-KARARLAR K-2](10-KARARLAR.md)** — üçe bölünür;
> iskelet KAO2-04'te kurulur, görünümler ekran ekran yeniden yazılırken
> `quranLearnViews.js`'e taşınır. Aşağıdaki "Alternatif" paragrafı tarihsel kayıttır.

`app/core/quranLearn.js` 1.899 satır (kural: ≤800). Program bölmeyi **yalnız
gerektiği kadar** yapar:

| Dosya | İçerik | Tahmini satır |
|---|---|---|
| `app/core/quranLearn.js` | Motor: FSRS, kuyruk, görev kurucu, durum, migrate yolu, handler gövdeleri | ~1.300 (görünümler taşınınca) |
| `app/core/quranLearnViews.js` (YENİ) | Tüm HTML kurucuları (Bugün, Yol, Ünite, Ders, Özet, Kelime, Okuyucu, Ayarlar…) | ~900 |
| `app/core/quranLearnFlow.js` (YENİ) | `kaoNextStep`, müfredat, ders planı, açıklama şablonları (saf) | ~350 |
| `app/content/quranCurriculumV2.js` (YENİ) | Araç çıktısı: ünite/ders ağacı, lemma eşlemesi, Türkçe anlatılar | veri |

**MON-25 dersi:** her yeni `app/core/*` dosyası aynı committe **dört listeye**
eklenir: `index.html` betik sırası, `.claude/skills/run-seyma/driver.mjs` FILES,
`.claude/skills/run-seyma/zikr-harness.mjs` FILES, `tests/app/test_state_rebind_boundary.js`
açılış listesi. (Not: `.claude/skills/` bu oturumun sandbox'ında yazmaya
kapalı; o iki dosya kullanıcı onayıyla düzenlenir.)
Alternatif (daha az risk): yeni `app/core` dosyası açmadan yalnız içerik modülü
eklenir, görünümler `quranLearn.js` içinde yeniden yazılır. **Karar W0'da** (09 KAO2-00).

## 6. Panel aynası (Konvansiyon 4)

`kaoPanelSummary` genişler: `onboarding.start`, mevcut ünite/ders, tamamlanan
ders sayısı, ünite taşları. Panel yalnız sayısal ve etiket alanlarını görür; Türkçe
anlatı metinleri panele gitmez. `tests/kao/test_kao_panel_projection.js` genişletilir.
`sync.js sanitize()` değişmez (yeni gizli alan yok).

## 7. Test stratejisi

**Mevcut 17 KAO fixture'ı yeşil kalır.** Davranışı *bilerek* değişenler
(ana ekran render'ı, oturum geri bildirimi) aynı kartta güncellenir ve
değişiklik kanıt notunda gerekçelendirilir.

Yeni fixture ailesi `tests/kao/test_kao2_*.js`:

| Fixture | Doğrular |
|---|---|
| `test_kao2_migration.js` | Eski 3 örnek durum (boş, kısmi, zengin) → `migrate` → tüm kartlar derin eşit; `onboarding.doneAt` doğru; `path` türetilebilir |
| `test_kao2_curriculum.js` | 524/524 lemma tam 1 derste; ünite 20–45 kelime; her dersin kavram kimliği `QuranGrammarV1`'de var; Fâtiha dersleri prayerTexts ile kesişiyor |
| `test_kao2_next_step.js` | 05 §4'ün 7 satırı × sentetik durumlar → beklenen tek adım |
| `test_kao2_onboarding.js` | 3 seçim × yönlendirme; Atla varsayılanları; mevcut kullanıcıda gösterilmez |
| `test_kao2_lesson_flow.js` | Her yeni kelimede Tanış sınavdan önce; ilk görev 2 şık; Uygula adımı çapa metnini içerir; özet doğru sayılar |
| `test_kao2_feedback.js` | Cevap sonrası indeks **ilerlemez**; doğru şık işaretli; açıklama hata sınıfından; `Devam` ilerletir; autoAdvance ayarı |
| `test_kao2_navigation.js` | Yığın itme/çekme; her ekranın geri hedefi geldiği yer; Escape sözleşmesi |
| `test_kao2_milestones.js` | Fâtiha taşı yalnız Fâtiha lemmalarıyla; eski kazanılmış taş korunur |
| `test_kao2_design_contract.js` | 06 §7 CSS ölçümleri (ağırlık ≤4, uppercase 0, dekoratif sözde öğe 0); ekran başına ≤1 `.kao-primary`; ayarlarda `role="switch"` |
| `test_kao2_a11y.js` | Odak yönetimi, `aria-live`, `aria-current="step"`, Tab/Shift+Tab/Escape |

Kapı komutları (her kart sonu):

```bash
for f in tests/kao/*.js; do node "$f" || exit 1; done
node .claude/skills/run-seyma/driver.mjs
node .claude/skills/run-seyma/zikr-harness.mjs
for f in tests/app/test_*.js; do node "$f" || exit 1; done
node docs/kuran-ogreniyorum/tools/kao-plan-check.mjs
node docs/kuran-ogreniyorum/tools/kao-verify-contrast.mjs
node --check app/core/quranLearn.js
```

## 8. Riskler

| Risk | Olasılık | Etki | Önlem |
|---|---|---|---|
| Pin kayması (fx2/v3/iip_22) | Yüksek | Orta | Handler +5 ile sınırlı; pin güncellemesi aynı committe; tarama yorumlara duyarlı |
| Eski kullanıcı ilerlemesinin "kaybolmuş" görünmesi | Orta | Yüksek | `path` türetilebilir; migration fixture'ı; "Yeni düzen" notu |
| İçerik boyut bütçesi | Kesin | Orta | 07 §7 karar kapısı |
| Türkçe dinî metin hatası | Orta | Yüksek | İnceleme kaydı zorunlu; kaynaklı `contextTr`; kullanıcı onayı |
| Hece ses lisansı | Orta | Orta | Ses işi ayrı kart (KAO2-22); lisans netleşmeden S0 görsel modla çalışır |
| Tarayıcıda gerçek veriyle doğrulama cazibesi | — | Kritik | CLAUDE.md DATA SAFETY; yalnız headless harness ve port 9000 izinli yerel QA |
