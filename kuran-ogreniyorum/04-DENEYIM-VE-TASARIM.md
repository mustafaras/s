# 04 — Deneyim ve tasarım (mevcut uygulamaya uyum)

Kural: Şeyma'nın **tek `data`**, **`App.*` handler**, **overlay şablonu**,
**modal klavye sözleşmesi**, **CSS değişkenleri** ve **Türkçe sıcak ton**
kalıpları aynen sürer. Bu belge yeni bir görsel marka tanımlamaz; Kur'an
Yolculuğu'nun lacivert-altın ailesini ve IIP'nin "sıcak kütüphane" yönünü
paylaşır.

## 0. Bağımsızlık

KAO, İlham & İbadet Premium (IIP) programından bağımsızdır; hub'daki tek
temas noktası bir karttır — sözleşme [11-BAGIMSIZLIK-SOZLESMESI](11-BAGIMSIZLIK-SOZLESMESI.md).

## 1. Uygulamada yeri

| Aşama | Giriş noktası | Dokunulan dosya | Neden |
|---|---|---|---|
| Geçici (Dalga 1–4) | **Ayarlar → "Kur'an Arapçası Öğreniyorum"** satırı (düz `<a>`/buton, `App.kaoOpen()`) | `app/core/settings.js` (1 satır) | IIP programı `saygi.js`/`render.js`/`app.js`'yi yoğun yazıyor; çakışmasız başlangıç |
| Kalıcı (Dalga 5, IIP nav'ı yerleştikten sonra) | İlham & İbadet → Kur'an alanında, Kur'an Yolculuğu kartının altında **"Kelimelerini öğren"** hub kartı | `saygi.js` `saygiHTML` bileşimine 1 satır (`kaoHubCard()`), IIP ile koordineli | Bağlam: aynı yerde yolculuk (izle) + dil (öğren) |
| Köprüler | Kur'an Yolculuğu overlay'inde ilgili sûre satırında "kelimelerini öğren" bağlantısı; Zikir/Esmâ kartında kök notu | quran.js/zikir.js *okuma*, yazma yok | Çapraz tanıma |

Modülün gövdesi **tam ekran overlay hub**tur (Zikirmatik gibi): `ui.kaoOpen`,
`ui.kaoView`, `App.kaoOpen()/App.kaoClose()`, `#sey-ov-back` + `#sey-ov-card`
`role="dialog" aria-modal="true"` `onkeydown="App.onModalKeydown(event,App.kaoClose)"`,
`reminderLockBodyScroll()/Unlock`, `focusModalDialog('sey-ov-card')`,
`SeyFx.sheetClose` ile kapanış — okuma/izleme/dinleme şablonunun birebir
kopyası.

## 2. Ekranlar (11)

| # | View (`ui.kaoView`) | Görev | Ana eylem |
|---|---|---|---|
| E1 | `home` | Bugün: vadesi gelen tekrar sayısı, yeni kelime bütçesi, kapsam yüzdesi, ünite | **Bugünkü oturuma başla** |
| E2 | `session` | 12–16 görev, tek görev tek ekran, ilerleme çizgisi | Cevap çipleri / "Devam" |
| E3 | `done` | Oturum özeti: doğru/yanlış, yeni öğrenilen, yarın kaç kart | "Bugün yeter" / "5 dakika daha" |
| E4 | `units` | 12 ünite + Seviye 0/5/6 kartları; kilit yok, sıra önerilir | Ünite aç |
| E5 | `word` | Kelime detayı: hareke'li büyük Arapça, kök ağacı, kognat notu, 3 âyet parçası, tarihçe | Sesli oku (opsiyonel) |
| E6 | `reader` | Sûre okuyucu: kelime kelime dokunma, bilinen açık / bilinmeyen kapalı | "Anladım" |
| E7 | `settings` | Günlük yeni kelime (5/10/15), ses stili (yavaş/doğal), hareke/soldurma, transliterasyon katmanı (okunuş/DİA), Seviye 0'ı tekrar aç | — |
| E8 | `phonics` | Telaffuz stüdyosu: harf kovaları, mahreç şeması (inline SVG), minimal çift dinleme, gölgeleme (geçici yerel kayıt) | Dinle / Söyle |
| E10 | `map` | Mushaf ısı haritası: 114 sûre × anlaşılan âyet oranı (R-B1) | Sûre aç |
| E11 | `prayer` | "Namazda ne diyorum": rekât sırası, bilinen açık / bilinmeyen kapalı (R-B2) | Kelimeyi öğren |
| E9 | `ayah` | "Bugün anlayabildiğin âyet": kelimelerinin ≥%95'i bilinen bir âyet, kelime kelime ses + Türkçe | Anladım |

## 3. Wireframe'ler (390 px)

```text
E1 · HOME                              E2 · SESSION (anlam seç)
┌──────────────────────────────┐       ┌──────────────────────────────┐
│ ‹ Kapat   Kur'an Arapçası    │       │ ‹        ●●●●●○○○○○○○   7/14 │
│                               │       │                              │
│  KAPSAM                       │       │         رَبِّ                 │
│  %38  ▓▓▓▓▓▓▓░░░░░░░░░░░      │       │       (rab · ر-ب-ب)           │
│  Kur'an kelimelerinin         │       │                              │
│  38'ini tanıyorsun            │       │  Bu kelime ne demek?         │
│                               │       │  ┌──────────┐ ┌──────────┐   │
│  BUGÜN                        │       │  │ Rab, sahip│ │ Gün      │   │
│  23 tekrar · 10 yeni · ~9 dk  │       │  └──────────┘ └──────────┘   │
│  [ Oturuma başla ]            │       │  ┌──────────┐ ┌──────────┐   │
│                               │       │  │ Yol      │ │ Nimet    │   │
│  ÜNİTE 2 · Tesbihat & tekbir  │       │  └──────────┘ └──────────┘   │
│  18/31 kelime · G3 · G4       │       │                              │
│                               │       │  Fâtiha 1:2 · Kur'an'da 975  │
│  Fâtiha'yı anlıyorum ✓        │       │                              │
└──────────────────────────────┘       └──────────────────────────────┘

E5 · WORD                              E6 · READER
┌──────────────────────────────┐       ┌──────────────────────────────┐
│ ‹                    ♡  🔊    │       │ ‹  İhlâs · 4 âyet   [Aa] [◌] │
│                               │       │                              │
│          كِتَاب                │       │  قُلْ  هُوَ  ٱللَّهُ  أَحَدٌ        │
│          kitâb                │       │  de   o    Allah   birdir    │
│        kitap · yazılı şey     │       │                              │
│                               │       │  ٱللَّهُ  ٱلصَّمَدُ               │
│  KÖK  ك-ت-ب                   │       │  Allah  Samed'dir            │
│  kâtib · mektûb · kitâbet ·   │       │       ▲ dokun: "her şey ona  │
│  mektep · kitap (Türkçe ✓)    │       │         muhtaç, o kimseye"   │
│                               │       │                              │
│  KUR'AN'DA                    │       │  لَمْ يَلِدْ وَلَمْ يُولَدْ          │
│  ذَٰلِكَ ٱلْكِتَٰبُ لَا رَيْبَ فِيهِ │       │  ░░░  ░░░░  ░░░░  ░░░░ (kapalı) │
│  "İşte bu kitap, onda şüphe  │       │                              │
│   yok" · Bakara 2:2           │       │  [ Anladım ]                 │
│  + 2 örnek daha               │       └──────────────────────────────┘
│                               │
│  Sonraki tekrar: 4 gün        │
└──────────────────────────────┘
```

Gösterilen sayılar sentetik örnektir. Arapça örnekler yalnız tasarım
okunabilirliği içindir; üretimde korpustan gelir.

## 3b. Bağlayıcı etkileşim kuralları (12-EK-GEREKSINIMLER)

- **Üç dokunuş** (R-B3): E5 katmanlı açılır; ilk görünümde yalnız Arapça+ses+Türkçe.
- **Geri al 3 s** (R-C3): her cevaptan sonra toast içinde "Geri al"; FSRS geri sarılır.
- **Tek düğme iki hız** (R-B8): dokun yavaş / basılı tut doğal; klavye eşdeğeri.
- **Kognat rozeti** (R-B7): pastil + simge + metin; anlam kaymasında `--quran-warn`.
- **Renkli hareke** (R-A9): fetha/kesra/damme üç ton, açık/koyu çift, Seviye 0–1 varsayılan açık; satır aralığı ve kelime boşluğu ayarı.
- **Hareke soldurma** (R-B5): `--dur-5`, dokununca geri, reduced-motion'da anında.
- **Vakıf noktaları** (R-A6): okuyucuda renkli nokta düğmeleri, dokununca açıklama.
- **Oturum sonu tek sayı** (R-B4): "Bugün N kelime daha kalıcı oldu"; puan/XP yok.
- **Gece tekrarı önerisi** (R-A1): uyku saatinden önceki 90 dk'da hub kartı/E1 satırı.
- **İlk sunumda ses önce** (R-A4): yeni kelimede ses başlar, Arapça ≤150 ms sonra görünür.

## 4. Tasarım sözleşmesi

### Renk ve yüzey
- Aile: `--quran` (#1C3A5F lacivert) · `--quran2` (#C9A227 altın) ·
  `--quran-surface` · `--quran-ink` · `--quran-gold-ink` · `--quran-ok/--quran-warn`
  (QY-17'de AA ölçülmüş çiftler). Koyu tema karşılıkları `#root[data-theme="dark"]`
  bloğunda **zaten var**; yeni token gerekirse `--kao-*` adıyla açık/koyu çift.
- Doğru/yanlış geri bildirimi **renk + simge + metin**; yalnız renk değil.
- Kartlar opak `--card-solid` (AD-38: içerik katmanında cam yok).

### Tipografi
- Arapça: mevcut yığın `"Noto Naskh Arabic","Amiri","Scheherazade New","Times New Roman",serif`;
  `lang="ar" dir="rtl"`, letter-spacing yok. Boyut: oturum kartında 30–34 px
  (`clamp(1.75rem, 8vw, 2.125rem)` ≈ `--f-large`), okuyucuda 26–28 px, listede
  `--f-title3`; satır yüksekliği **1.9–2.1** (hareke kırpılması test edilir —
  IIP ölçüsüyle aynı).
- Transliterasyon `--f-footnote`, `--muted`, italik yok (Türkçe okunuş: "kitâb"
  şapkalı uzun ünlü; TDK/Diyanet transkripsiyonu; tutarlılık için tek tablo).
- Türkçe anlam `--f-body`, satır 1.55–1.7.

### Hareket ve FX
- `--dur-2` çip basma, `--dur-3` görev geçişi (yatay kaydırma yok; fade+8px
  yukarı, `.sey-enter`/`SeyFx.enter`), `--dur-4` overlay.
- Doğru: `SeyHaptics.tap` + `SeyAudio.tap` (kendi kapıları; sessiz saat).
  Kilometre taşı: `SeyFx.countUp` kapsam sayacı; konfeti yalnız 6 taşta.
- `prefers-reduced-motion` + uygulama hareket ayarı → geçiş yok, anında.

### Erişilebilirlik
- Çipler `<button>`; ≥44×44; odak halkası 3:1; `aria-live="polite"` doğru/yanlış.
- Okuyucuda kapalı kelime `aria-label="bilinmeyen kelime, dokunarak aç"`.
- Tab/Shift+Tab/Escape sözleşmesi; kapanışta tetikleyiciye odak dönüşü.
- Metin %200 büyütmede 320 px'de yatay kaydırma yok; Arapça satır kırılması
  kelime sınırında (`overflow-wrap:normal` — harf ortasından kırılmaz).

### Ton ve metin
- Başlık dili: "Bugün 23 tekrar var, 9 dakika sürer." — emir yok, sayı
  şeffaf. Hata: "Yakın. رَبّ 'sahip, terbiye eden' demek; Türkçedeki *Rab*
  aynı kelime." Kutlama: tek cümle, emoji ölçülü (uygulama sesi).
- Dinî ifadelerde Diyanet imlâsı (Kur'an, âyet, sûre, Fâtiha, Esmâ).

## 5. Etkileşim sözleşmesi (App yüzeyi — plan; henüz kod yok)

| Handler | Görev |
|---|---|
| `App.kaoOpen(view?)` / `App.kaoClose()` | Overlay aç/kapat, odak yönetimi |
| `App.kaoSetView(v)` | home/session/done/units/word/reader/settings |
| `App.kaoStart()` | Oturum kuyruğunu kur (`ui.kaoQueue`), ilk görevi çiz |
| `App.kaoAnswer(taskId, choiceId)` | Değerlendir → FSRS güncelle → `save()` → sonraki |
| `App.kaoSkipGate()` | Seviye 0'ı atla |
| `App.kaoOpenWord(lemmaId)` | E5 |
| `App.kaoOpenSurah(surahId)` / `App.kaoRevealWord(i)` / `App.kaoMarkUnderstood()` | E6 |
| `App.kaoSetDailyNew(n)` / `App.kaoToggleAudio()` / `App.kaoToggleHarakat()` | E7 |
| `App.kaoPlay(clipId, style)` | Paketli okuyucu sesi (`assets/kao/audio`, `<audio preload="none">`); TTS değil |
| `App.kaoRecordStart()` / `App.kaoRecordStop()` / `App.kaoRecordPlay()` / `App.kaoRecordDiscard()` | Gölgeleme: `MediaRecorder` yalnız bellekte (Blob URL), `data`'ya/depoya yazılmaz, overlay kapanınca atılır; mikrofon izni ilk kullanımda ve açıklamayla |
| `App.kaoOpenPhonics(letterId?)` / `App.kaoOpenAyah()` / `App.kaoOpenMap()` / `App.kaoOpenPrayer()` | E8 / E9 / E10 / E11 |
| `App.kaoUndo()` | Son cevabı 3 s içinde geri al (R-C3) |
| `App.kaoWordLayer(n)` | E5 üç dokunuş katmanı (R-B3) |
| `App.kaoFlag(cardId, kind)` | İçerik hata bildirimi (R-C1) |
| `App.kaoExportCsv()` | Yerel CSV (Blob) (R-C4) |
| `App.kaoNightReview()` | Gece tekrarı (≤8 review kart) (R-A1) |

Handler sayısı ~27; fx2 fixture'ları App yüzeyini (718) ve tıklama
sayısını (391) **düz metin taramasıyla** sabitler → ilgili kartta pin güncellenir
(yorum satırında `App.kao…=` yazılmaz — CLAUDE.md tuzağı).
