# ÆON Panel-v2 Premium — Güncel Ajan Durumu

> Bu dosya, 40 promptluk uygulama kapandıktan sonraki canonical başlangıç
> noktasıdır. Yeni ajan önce bu dosyayı, sonra `LEDGER.md`’yi okur. Eski
> prompt/handoff kayıtları `.anti-amnesia/archive/` altında append-only tarihsel
> kanıt olarak tutulur; yeni ajanın ilk okuma akışına dahil değildir.

## Durum

- Proje: ÆON Panel-v2 Premium
- Checkout: `/Users/m_ras/Desktop/seyma`
- Branch: `main`
- Düzenleme başlangıcında: `main...origin/main`, çalışma ağacı temiz; bu düzenleme
  yerel ve henüz commit edilmemiş değişiklikler oluşturdu
- Prompt durumu: 40/40 tamamlandı; `currentStep: 41`; Prompt 41 başlatılmadı
- Son üretim cache-bust kaydı: `panel-v2.css/js?v=20260812c`
- Kullanıcı cihazı kabulü: ajan tarafından yapılmadı; ayrı kanıt seviyesidir

## Canonical kapsam

Üretim Panel-v2 yüzeyi:

- `panel-v2.html`
- `panel-v2.js`
- `panel-v2.css`
- `panelCoverageManifest.js`

Headless test yüzeyi:

- `tests/panel-v2/test_panel_v2_*.js` — 27 fixture
- `tests/panel-v2/helpers/panel-v2-test-helper.js` — ortak VM/DOM helper
- `tests/panel-v2/README.md` — test envanteri ve çalıştırma kuralları

Legacy Panel 1 / Şeyma uygulaması kapsamı bu düzenleme sırasında değiştirilmedi.
`panel.html`, `panel.js`, `panel.css`, `app.js`, `sync.js`, `index.html`,
`data/` ve `mustafaras/seyma-data` bu çalışmanın dışındadır.

## İlk okuma sırası

1. Kök [`AGENTS.md`](../../../AGENTS.md) — veri güvenliği ve repo kuralları
2. Kök [`CLAUDE.md`](../../../CLAUDE.md) — ayrıntılı doğrulama sınırları
3. Bu dosya — güncel kapsam ve kalan iş
4. [`LEDGER.md`](LEDGER.md) — prompt/commit/test/Pages kanıtı
5. Son post-close handoff: [`handoff-POST-CLOSE-REPO-ORGANIZATION.md`](handoff-POST-CLOSE-REPO-ORGANIZATION.md)
6. Yeni bir değişiklik istenirse ilgili plan bölümü; Prompt 41 yoktur

Arşivdeki tamamlanmış plan, prompt, context ve handoff dosyaları yalnızca geçmiş
kanıt veya eski kararların izlenmesi gerektiğinde açılır:

- `PANEL-V2-PREMIUM-TASARIM/archive/`
- `.anti-amnesia/archive/`

## Güvenli doğrulama

Panel-v2 testleri gerçek tarayıcı açmadan çalıştırılır:

```bash
for f in tests/panel-v2/test_panel_v2_*.js; do node "$f"; done
node --check panel-v2.js
node --check panelCoverageManifest.js
```

Şeyma uygulamasını tarayıcıda açma. Üretim veri/senkron dosyalarına yazma.
Deploy veya `git push` bu düzenleme için yapılmadı; sonraki değişiklikte ayrıca
yetkilendirilmelidir.

## Bilinen açık kapı

- Kullanıcı cihazı/browser kabulü ve cihaz üzerindeki kesin performans ölçümleri
  kullanıcı tarafından ayrıca yapılabilir.
- Yeni bir Panel-v2 bakım işi başlamadan önce çalışma ağacı, cache-bust ve
  `LEDGER.md` tekrar doğrulanmalıdır.
- Yeni test dosyası yalnızca `tests/panel-v2/` altına eklenmelidir.

## Bu düzenlemenin özeti

- 27 Panel-v2 fixture’ı root `tests/` dağınıklığından çıkarılıp
  `tests/panel-v2/` altına taşındı.
- Ortak helper aynı klasörün `helpers/` altına taşındı ve repository root
  çözümlemesi yeni derinliğe göre düzeltildi.
- Root test rehberi, Panel-v2 README’si ve ajan talimatları güncel yolları
  gösterecek şekilde hizalandı.
- Plan dokümanlarının eski “henüz uygulanmadı” durumu kapanış kanıtıyla
  güncellendi; tarihsel handoff dosyaları geriye dönük değiştirilmedi.
- Tamamlanmış promptbook, tasarım referansı, eski context/token kartları ve
  tarihsel handoff’lar arşive taşındı; canlı başlangıç yüzeyi küçültüldü.
