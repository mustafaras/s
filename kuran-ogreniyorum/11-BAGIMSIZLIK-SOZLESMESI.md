# 11 — Bağımsızlık sözleşmesi (KAO ⟂ İlham & İbadet planı)

Kullanıcı kararı (20 Eylül 2026): KAO, yürüyen İlham & İbadet Premium
(IIP) programından **farklı ve bağımsız** bir modüldür. Hub'a yalnız **bir
kart** eklenir; kartın açtığı her şey KAO'nun kendi overlay'inde yaşar.

## 1. Sahiplik sınırları

| KAO'nun sahibi olduğu | KAO'nun dokunmadığı |
|---|---|
| `app/core/quranLearn.js` (registry + tüm HTML gövdeleri) | `app/core/saygi.js` (1 satırlık kart bileşimi hariç, Dalga 5) |
| `app/content/quranLexiconV1.js` · `quranGrammarV1.js` · `quranShortSurahsV1.js` · `quranPhonicsV1.js` | `app/core/quran.js` (Kur'an Yolculuğu) — yalnız **okunur** |
| `app/kao.css` (bağımsız stil dosyası; `styles.css` tokenlarını **tüketir**, tanımlamaz) | `app/styles.css` — yalnız D-03 kapanınca ve IIP bittikten sonra taşınabilir |
| `assets/kao/audio/**`, `assets/kao/svg/**` | `app/core/render.js`, `appSurface.js` (IIP alanı) |
| `tools/kao-*.mjs` · `tests/kao/**` · `kuran-ogreniyorum/**` | `ilham-ibadet-premium-plan/**` (hiçbir zaman) |
| `data.quranLearn` (tek kök) | `data.saygi`, `data.zikr`, `data.prayer`, `data.quranJourney` — yalnız okunur |
| `App.kao*` (~27 handler) ve `ui.kao*` | Mevcut `App.*` isimleri |

`app.js`, `state.js`, `index.html`, `settings.js`'e yalnız **shim/liste
satırı** düzeyinde dokunulur (CLAUDE.md dört liste kuralı); IIP'nin bu
dosyalardaki bölümleriyle satır çakışması olmaması için KAO satırları
dosya sonuna yakın, kendi yorum başlığı altında eklenir.

## 2. Kart sözleşmesi (tek temas noktası)

```js
// saygi.js içinde (Dalga 5, tek satır):  ... + kaoHubCard() + ...
// saygi dep-bag'e eklenen tek fonksiyon:
kaoHubCardHTML: function(){ return window.SeymaQuranLearn ? window.SeymaQuranLearn.kaoHubCardHTML() : ''; }
```

- Kart **yoksa hiçbir şey kırılmaz** (boş string). KAO yüklenmemişse hub aynen çalışır.
- Kart IIP'nin nav/sekme yapısına **bağlı değildir**: nerede çağrılırsa orada
  çizilir (Öz/İman sekmesi, "Kaldığın yer" bloğu, ne olursa). IIP kartları
  taşırsa çağrı satırı taşınır, KAO değişmez.
- Kart yalnız `data.quranLearn`'den okur; IIP'nin gelecekteki `data` değişikliklerine
  bağımlılık yok.
- Kart görünürlüğü `settings.kaoVisible` (varsayılan `true`) ile kapatılabilir.

Kart içeriği (özet, 1 eylem): başlık "Kur'an Arapçası" + alt satır (kapsam
%, bugün N tekrar / "bugün bitti" / "başla") + tek düğme `App.kaoOpen()`.
Kilometre taşı satırı (son kazanılan). Kart, IIP'nin "devam satırı" bileşen
kuralına (küçük simge, ad, gerçek durum, sahte ilerleme yok) *uyumludur* ama
o bileşeni **kullanmaz**; kendi `.kao-hub-card` sınıfıyla, `--quran*`
tokenlarıyla çizilir.

## 3. Test bağımsızlığı

- `tests/kao/*` IIP fixture'larını çağırmaz; IIP fixture'ları KAO'yu çağırmaz.
- Ortak kapılar (driver, zikr-harness, rebind boundary, shell-inventory) her
  iki program için de yeşil kalmalıdır — bunlar repo kapısıdır, program
  kapısı değil.
- KAO, IIP'nin `plan-check.mjs` aracını kullanmaz; kendi `tools/kao-plan-check.mjs`
  (STATE/LEDGER tutarlılığı, kart sınırı) yazılır (Dalga 1'de).

## 4. Zaman ve sıra bağımsızlığı

- KAO Dalga 1–4, IIP'nin herhangi bir kartına **beklemez**.
- Yalnız Dalga 5 (kart bileşimi) IIP'nin `saygi.js` yazma penceresiyle
  koordine edilir: ya IIP `main`'e girdikten sonra, ya IIP sahibiyle
  anlaşılmış tek satırlık ekleme olarak.
- İki program aynı branch'te değil: KAO `kuran-ogreniyorum` branch'inde
  (LOCAL-ONLY), IIP kendi branch'inde.

## 5. Çatışma çözümü

| Durum | Karar |
|---|---|
| IIP `--quran*` token değerini değiştirir | KAO tüketicidir; kontrast ölçümünü yeniler, değer talep etmez |
| IIP hub'ı yeniden düzenler, Kur'an alanı kalkar | Kart "Kaldığın yer"/eşdeğer bloğa taşınır; KAO içi değişmez |
| IIP `saygi.js` dep-bag adlarını değiştirir | Yalnız `kaoHubCardHTML` adı korunur; başka bağ yok |
| İkisi de `state.js MIGRATE_DEPENDENCIES`'e ekleme yapar | Liste ekleme sırası önemsiz; merge'de iki satır da kalır |
