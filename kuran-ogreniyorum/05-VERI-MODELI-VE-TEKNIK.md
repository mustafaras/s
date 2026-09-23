# 05 — Veri modeli ve teknik sözleşme

Kaynak baseline `0436405` (`main`, 2026-09-20). Aşağıdaki her madde, koda
dokunmadan önce onaylanacak **plan**dır; hiçbir dosya değişmedi.

## 1. Yeni dosyalar (dört yükleme listesine aynı commit'te)

| Dosya | Tür | Boyut hedefi | Sorumluluk |
|---|---|---|---|
| `app/content/quranLexiconV1.js` | Donmuş içerik (`window.QuranLexiconV1`) | ≤ 260 KB | ~530 lemma: Arapça (harekeli), transliterasyon, Türkçe anlam(lar), kök, kalıp, POS, sıklık, kognat notu, ≥3 âyet parçası (Arapça + Türkçe + referans; D-13: gerekirse aynı kökten `source:'root'`, kök Kur'an'da <3 geçiyorsa kökün tüm geçişleri), `verified` |
| `app/content/quranGrammarV1.js` | Donmuş içerik (`window.QuranGrammarV1`) | ≤ 60 KB | 24 mikro-kavram: açıklama (Türkçe, terimsiz + terimli), tablolar (zamir/çekim), alıştırma şablonları |
| `app/content/quranShortSurahsV1.js` | Donmuş içerik (`window.QuranShortSurahsV1`) | ≤ 90 KB | Seviye 5'in 20 kısa sûresi kelime kelime: `{surahId, ayah, i, ar, lemmaId, tr}` |
| `app/content/quranPhonicsV1.js` | Donmuş içerik (`window.QuranPhonicsV1`) | ≤ 40 KB | 28 harf × kova/mahreç/Türkçe ipucu/SVG id, minimal çift listesi, 7 okuma kuralı, transliterasyon tablosu (okunuş + DİA) |
| `assets/kao/audio/**` · `assets/kao/svg/**` | Ses (AAC .m4a) + mahreç şemaları | ≤ 16 MB (D-09) | Kelime/harf/âyet klipleri; `<audio preload="none">`, aynı-origin GET |
| `app/core/quranLearn.js` | Domain registry (`window.SeymaQuranLearn`) | ≤ 800 satır | Şema, `ensureQuranLearn`, FSRS zamanlayıcı, kuyruk kurucu, görev üretici, çeldirici seçici, kapsam hesabı, HTML gövdeleri (`kaoHubCardHTML`, `kaoOverlayHTML`, view gövdeleri) |
| `app/kao.css` **veya** `app/styles.css` ek bloğu | Stil | ≤ 18 KB | Karar D-03: eş zamanlı IIP çalışması sürerken ayrı dosya (çakışma yok); IIP kapanınca `styles.css`'e taşınabilir |
| `tools/kao-lexicon-build.mjs` | Derleme aracı (Node, ağsız) | — | Bkz. [06](06-ICERIK-URETIM-HATTI.md) |
| `tests/kao/*.js` | Fixture ailesi | — | Bkz. §8 |

Yükleme sırası: `index.html` (`quranLexiconV1.js` içerik bloğunda,
`quranLearn.js` `quran.js`'ten sonra `saygi.js`'ten önce),
`.claude/skills/run-seyma/driver.mjs FILES`, `zikr-harness.mjs FILES`,
`tests/app/test_state_rebind_boundary.js FILES` (MON-25 dersi). `?v=` cache-bust
dört dosyada.

Registry sözleşmesi (MON-19…43 kalıbı): yükte yalnız `window.SeymaQuranLearn`
yazar; DOM/ağ/zamanlayıcı/depo erişimi **yok**; `registerQuranLearn(deps)`
fail-closed (`data`, `ui`, `save`, `render`, `todayStr`, `esc`, `icon`,
`getDay` fonksiyon değilse `false`); app.js 1-satır shim'ler ve `App.kao*`
atamaları.

## 2. `data.quranLearn` şeması (v1)

```js
data.quranLearn = {
  schemaVersion: 1,
  lexiconVersion: 'quran-lexicon-tr-v1',   // içerik sürümü; kart id'leri buna bağlı
  startedAt: null,                         // ISO
  gate: { passed: false, skipped: false, score: null, at: null },   // Seviye 0
  settings: { dailyNew: 10, audio: false, harakat: true, translit: true },
  cards: {                                 // anahtar: cardId (aşağıda)
    // 'w:rabb:ar>tr': { s: 12.4, d: 5.1, r: '2026-09-20', due: '2026-10-02', n: 7, l: 1, st: 'review' }
  },
  units: { u1: { startedAt, completedAt } /* … u12, g0, s5 */ },
  surahs: { ihlas: { understoodAt, delayedTestAt, delayedScore } },
  daily: {                                 // son 90 gün, gün başına 1 satır (rolling)
    // '2026-09-20': { rev: 23, new: 10, ok: 29, bad: 4, ms: 411000, cov: 0.38 }
  },
  milestones: { fatiha: null, namaz: null, half: null, twoThirds: null, eighty: null, shortSurahs: null },
  phonics: {                               // telaffuz algı kartları — harf/çift başına FSRS durumu
    // 'p:Ha-ha': { s, d, r, due, n, l, st }   (kova B/C çiftleri, med, şedde)
    style: 'muallim'                       // varsayılan model sesi
  },
  errors: { sound: 0, root: 0, affix: 0, cognate: 0, rule: 0 },   // hata taksonomisi sayaçları (rolling 30 gün, daily içinde de)
  ayahs: { understood: [] },               // "anlayabildiğin âyet" — ref listesi ('112:1'), en çok 400
  // 12-EK-GEREKSINIMLER alanları
  // cards[id].flagged = { at, kind }      (R-C1; kind ∈ meaning|arabic|audio|translit)
  // daily[date].nightRev, daily[date].calib = { pred: Σ öngörülen R, ok: Σ doğru, n }   (R-A1, R-A3)
  // surahs[sid].delayedScore (0–5), delayedTestAt   (R-C6)
  // errors.order  (R-A7 sıra hatası)
  readability: { lineHeight: 'normal', wordSpacing: 'normal', coloredHarakat: true, fadeHarakat: false }   // R-A9, R-B5
};
```

Kart id'leri: `w:<lemmaId>:ar>tr` · `w:<lemmaId>:tr>ar` · `r:<root>` ·
`g:<conceptId>:<slot>` · `s:<surahId>:<ayah>:<i>`. Kısa anahtarlar (s/d/r/due/
n/l/st) sync bütçesi için. ~1.100 kart × ~80 B ≈ **90 KB** üst sınır;
`daily` 90 satır ≈ 8 KB. Tam tekrar geçmişi **tutulmaz** (FSRS'ye gerekmez).

`ensureQuranLearn(d)` — additive ve idempotent: eksik alanı varsayılanla
doldurur, bilinmeyen kart id'lerini (lexiconVersion değişince) **silmez**,
`orphan:true` işaretler. `MIGRATE_DEPENDENCIES` listesine `'ensureQuranLearn'`
eklenir; `migrate()` içinde `try{ ensureQuranLearn(d) }catch…` (Kur'an
Yolculuğu satırıyla aynı kalıp). `ui.kao*` alanları kalıcı değildir (`ui.kaoUndo`: son cevabın önceki kart
kopyası + daily farkı, 3 s; `ui.kaoWordLayer`).

## 3. Kur'an Yolculuğu ile köprü (yalnız okuma)

- `quranJourney.requests[sid].status ∈ {watched, question_opened}` → KAO
  ünite kartında "izlendi" rozeti. KAO `surahs[sid].understoodAt` →
  Yolculuk satırında "anlaşıldı" notu (Yolculuk tarafındaki 1 satırlık
  okuma, IIP/QY sahipliğiyle koordineli; Dalga 5).
- Zikir/Esmâ: `EsmaulHusnaV1` kökleri ile `QuranLexiconV1.roots` kesişimi;
  Esmâ kartında "bu kök Kur'an'da N kez" (okuma).

## 4. Ağ ve güvenlik

- **Ses klipleri dışında ağ yok.** Klipler aynı-origin statik GET (`assets/kao/audio/`),
  token/yazma yok; sync ve Guard'larla ilişkisi yok. Ağ yoksa görev sessiz
  moda düşer ("ses yüklenemedi, metinle devam").
- **Mikrofon kaydı** yalnız bellekte (`Blob`), en çok 10 s, `data`'ya,
  `localStorage`'a veya sync'e **hiçbir zaman** yazılmaz; overlay kapanınca
  `URL.revokeObjectURL`. Fixture bunu kaynak taramasıyla doğrular
  (`test_kao_privacy.js`: `quranLearn.js` içinde `MediaRecorder` → `save(`/`localStorage` yolu yok).
- İçerik paketlenmiş; Türkçe açıklama sesi için mevcut `SeyAudio.voice`
  (yerel) / `SeyAudio.speak` (bulut; kullanıcının kendi ayarı ve anahtarı —
  KAO yeni anahtar tanımlamaz, Kur'an Arapçası için TTS kullanmaz).
- `sync.js` `sanitize()`: KAO'da gizli alan yok; değişiklik gerekmez.
- Guard 1/2 aynen; KAO `save()` çağırır, `SeySync.schedule` doğal akış.
- Panel manifest satırı: `{path:"quranLearn",owner:"quranLearn",source:"state",
  privacy:"summary",mode:"summary",fallback:"latest"}` + özet projeksiyon
  (kapsam %, bugün çalışıldı mı, seri, ünite). Serbest metin yok.

## 5. Zamanlayıcı — FSRS saf JS portu

`kaoSchedule(card, grade, now)` → yeni kart. Varsayılan FSRS-4.5 parametre
vektörü (19 sayı) sabit; hedef R=0,90; `s`→aralık: `interval = s · (ln(0.9)/ln(0.9))`
biçiminde değil, FSRS'in `next_interval(s, r)` formülü. Grade eşlemesi:
yanlış→Again; doğru & tepki > 8 s→Hard; doğru→Good; doğru & < 2,5 s & n≥3→Easy.
Referans uygulama: ts-fsrs (MIT) — port edilir, bağımlılık eklenmez. Fixture
ts-fsrs'in yayımlanmış örnek vektörleriyle karşılaştırır (§8).

## 6. Görev üretimi ve çeldiriciler

Kuyruk: `due` kartlar (≤60) + yeni (≤dailyNew) + gramer (≤3) + parça (≤2);
serpiştirme kuralı ardışık aynı tür ≤2. Çeldirici seçimi: aynı POS, farklı
kök, benzer sıklık bandı; kök görevlerinde aynı ailenin diğer üyeleri.
Deterministik seed (gün + kart id) → fixture'da tekrarlanabilir.

## 7. Performans

`render()` tam string üretimi; oturum görevi geçişinde yalnız
`#kao-task` alt ağacı güncellenir (`zikr-live-*` hedefli DOM kalıbı gibi) —
her cevapta tam `render()` çağrılmaz, yalnız `save()`. Arapça hareke
render'ı için `will-change` yok; 60 fps ölçümü SKY kalıbıyla.

## 8. Fixture ailesi `tests/kao/` (hepsi ağsız Node/VM)

| Fixture | Ne doğrular |
|---|---|
| `test_kao_lexicon_contract.js` | İçerik şeması: her lemma id benzersiz, Arapça yalnız Arapça blok + hareke, `verified` bayrağı, ≥3 örnek (ya da D-13 `examplesException.final`), kaynak/atıf alanı, boyut bütçesi |
| `test_kao_lexicon_coverage.js` | Sıklık toplamı / 77.430 hedef kapsam bantları (ünite eşikleri) |
| `test_kao_migration.js` | `ensureQuranLearn` boş/eski/bozuk/idempotent; orphan koruması |
| `test_kao_fsrs.js` | Zamanlayıcı ts-fsrs referans vektörleriyle ±1e-6; monotonluk |
| `test_kao_queue.js` | Kuyruk bütçesi, serpiştirme, deterministik seed |
| `test_kao_render.js` | Overlay HTML: dialog/aria, Tab/Shift+Tab/Escape, odak dönüşü, `lang=ar dir=rtl`, 44 px hedef |
| `test_kao_boundary.js` | Registry yükte DOM/ağ/depo dokunmaz; app.js shim sayısı; 4 yükleme listesi eşit |
| `test_kao_panel_projection.js` | Panel özetinde serbest metin yok; alan eksikken çökmez |
| `test_kao_phonics_contract.js` | 28 harf eksiksiz, her B/C harfinde ≥1 minimal çift + ses klip id'si var, transliterasyon tablosu iki katmanlı ve çakışmasız |
| `test_kao_privacy.js` | Mikrofon kaydı kalıcı yola çıkmaz; ses istekleri yalnız aynı-origin `assets/kao/`; `fetch`/`XMLHttpRequest` başka host yok |
| `test_kao_requirements.js` | 12-EK-GEREKSINIMLER R-A2 (çeldirici güvenliği 1.000 oturum), R-A5 (komşu ≥3 gün), R-A1 (gece penceresi), R-B3 (katman), R-B4 ("puan/XP" yok), R-C3 (undo bit-bit), R-C4 (CSV başlık), R-C2 (audio=false tam oturum), R-C8 (panel izinli alanlar) |
| `test_kao_user_tasks.js` | R-C9 üç kullanıcı görevi headless senaryo (oturuma başlama ≤ N adım, kök ağacı 2 dokunuş, ses kapalı oturum) |
| `test_kao_independence.js` | `quranLearn.js` IIP dosyalarına/`SeymaSaygi` iç fonksiyonlarına referans vermez; `kaoHubCardHTML` yokken hub HTML'i değişmez |

Mevcut pinler güncellenir: fx2 App yüzeyi/tıklama sayısı, `tools/shell-inventory.mjs --gate`
(app.js satır bütçesi: KAO shim'leri ≤ 30 satır ekler — ölçülür).
