# app.js Monolit Bölümleme — Anti-Amnesia Ledger

Bu kayıt **yalnız eklemelidir**. Başarısız veya bloke prompt da satır alır;
eski satır silinmez, değiştirilmez. Her uygulama promptunun aynı yerel
commit'inde `MON-STATE.json` ve `CURRENT-STATE.md` güncellenir.

| Seq | Tarih | Ajan | Tip | Durum | Commit | S-kapı | Açıklama |
|-----|-------|------|-----|-------|--------|--------|----------|
| 1 | 2026-09-02 | Codex | planlama-yeniden-kurulum | ✅ TAMAMLANDI | yerel plan commit'i | plan öz-denetimi | Eski taslak planlama artefaktları sıfırdan yazıldı: 60 prompt/12 dalga, ölçülebilir kart sözleşmesi, canlı baseline, 24 modül matrisi, FX mirası ve ayrı onay kapıları. Kod, `app/`, `tests/`, `docs/` ve canlı veri değişmedi; hiçbir MON uygulama promptu çalıştırılmadı. |
| 2 | 2026-09-02 | Codex | planlama-derinlestirme | ✅ TAMAMLANDI | yerel plan commit'i | yapı/kanıt denetimi bekliyor | 60 kartın her birine sekiz aşamalı çalışma sayfası eklendi: canlı grep çıpası, kaynak/çıktı/izin matrisi, dependency sınıflama, registry+shim sırası, index/harness/fixture geçişi, değişmezlik manifesti, kapı paketi ve fail-closed handoff. Uygulama kodu, gerçek veri, tarayıcı, remote ve deploy değişmedi; MON ilerlemesi 0/60 kaldı. |
| 3 | 2026-09-02 | Codex | MON-01 | ✅ TAMAMLANDI | yerel MON-01 commit'i | kaynak baseline + karar | Canlı kaynak yeniden ölçüldü ve `deliverables/MON-S1-DELEGASYON-KARARI.md` oluşturuldu. MON-S1 kabulü: load-safe registry + app.js imza-koruyan shim; dinamik `this`/gizli closure/yan etki varsa taşıma yok, karar yeniden açılır. Baseline: 18.957 satır, B1 7 getter, 9 data kaynak satırı/11 token (başlangıç dahil), App function 545/tüm App 704, onclick 415/321, FX 26/21/2/2. `data` rebind, 6079 finally, sync callback sahipliği ve Guard 1/2 dokunulmaz. Kod, index, harness, fixture, data, browser, remote ve deploy değişmedi. Sonraki: MON-02, yeni açık onayla. |
