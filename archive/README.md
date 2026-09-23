# Repo tarihsel arşivi

Bu klasör, tamamlanmış ve artık günlük ajan başlangıcında okunmaması gereken
işlerin kısa, agent-okunabilir özetlerini tutar.

- `panel-denetim-merkezi/README.md` — eski Panel 1 çalışmasının özeti
- `PANEL-V2-PREMIUM-TASARIM/WORK-SUMMARY.md` — Panel-v2 40/40 kapanış özeti
- `monolit-bolumlenme-plan/` — MON serisi (60/60, Dalga 1–12, 2026-09-13 kapandı):
  `app.js` 18.957 → ~13.1k satır, 24 `app/core/*` registry. Kapanış:
  `deliverables/MON-SERI-KAPANIS-BELGESI.md`; makine durumu `MON-STATE.json`.
- `monolit-bolumlenme-plan-2/` — MON2 serisi (8/8, 2026-09-15 kapandı): 13.139 →
  7.603 satır, kabuk bütçesi `MON2-STATE.json` (**hâlâ canlı sözleşme**:
  `tools/shell-inventory.mjs --gate` ve `tests/app/test_modularization_boundary.js`
  bu dosyayı buradan okur). Kapanış: `deliverables/MON2-SERI-KAPANIS.md`.
  Her iki klasör 2026-09-16'da kökten buraya taşındı; yeni bir bölümleme
  programı kendi klasörü ve onayıyla başlar.
- `premium-fx-plan/` — FX2 (28 kart) + SKY/PREM (15 kart) premium FX serileri
  (2026-09-06→09-09 kapandı): TESHIS/PLAN-FX2/KAPSAM-OLCUMU/RENK-VE-ZEMIN,
  `.anti-amnesia/` (FX2-STATE.json + coverage.json — `tools/fx-coverage.mjs`
  buradan okur), `deliverables/FX2-KAPANIS.md`, HEADER-V2 ekran görüntüleri
  (`assets/`). `MODULARIZATION.md` **düzenlenmez**
  (`tests/app/test_modularization_boundary.js` içeriğini pinler). 2026-09-16'da
  kökten taşındı; klasör içi göreli bağlantılar tarihsel olarak kök varsayar.

## Kapanmış ve TAŞINMIŞ program: IIP

- **İlham & İbadet Premium (IIP)** — 24 kart + P00–P17 düzeltmeleri
  (**2026-09-22 kapandı**, **2026-09-23'te bu arşive taşındı**). Kapanış:
  [`docs/IIP-KAPANIS.md`](../docs/IIP-KAPANIS.md).
  Klasör: [`archive/ilham-ibadet-premium-plan/`](ilham-ibadet-premium-plan/README.md).

  **Taşıma nasıl mımkün oldu:** bağımlılık araç kodundaydı, kanıtta değil;
  dört nokta arşiv-farkındalıklı hâle getirildi → `plan-check.mjs` kart dosyası
  ve link çözümü, `tools/evidence-reconcile.mjs` yol sabiti,
  `plan-check.integration.py` kök çözümü, `tests/app/test_iip_17.js` yazma yolu.
  **41 makbuz komutu yeniden yazılmadı** (hash'ler komut yolunu kapsamaz).

  **Doğrulama:** taşıma sonrası **6 kapı exit 0** (plan-check · --self-test ·
  integration.py · evidence-reconcile · fixture-map · test_iip_17) ve
  **156 fixture PASS / 0 FAIL**. Ölçüm: kapanış belgesi §9.

  Önceki “taşınmaz” değerlendirmesi (2026-09-22 simülasyonu) **geçersiz**;
  bağımlılık araç kodunda olduğu için çözülebilirdi.

Güncel Panel-v2 başlangıç noktası
[`PANEL-V2-PREMIUM-TASARIM/.anti-amnesia/CURRENT-STATE.md`](PANEL-V2-PREMIUM-TASARIM/.anti-amnesia/CURRENT-STATE.md)
dosyasıdır; ardından `LEDGER.md` okunur. Ayrıntılı tarihsel belgeler çalışma
ağacından temizlendi ve gerektiğinde Git geçmişinden geri alınabilir.
