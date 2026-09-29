# Kur’an Arapçası premium sekme yayını

2026-09-29: Kullanıcının “push commit merge deploy canlıya alalım” talebiyle yeni Arapça sekme tasarımı yayımlandı.

Kaynak commit `4dbc89db665645368271c981964fc023075a3946`; `kao2-yeniden-tasarim` ve `main`, `0f3d107e` tabanından fast-forward ile eşitlendi.

GitHub Actions [36568891258](https://github.com/mustafaras/s/actions/runs/36568891258) `success`: `validate` ve `deploy` PASS; runtime-only guard geçti.

Canlı [https://mustafaras.github.io/s/](https://mustafaras.github.io/s/) adresinde değişen dört runtime varlığı yalnız GET ile HTTP 200 verdi; dört dosyanın da SHA-256 değeri yerel kaynakla eşleşti. Tasarım README’si ve önizleme görselleri Pages paketinin dışında, beklenen 404 durumunda.

`app/styles.css` ve `app/core/saygi.js` cache pini `20260929c`. Cihaz kabulü doğrulanmadı; uygulama açılmadı ve kişisel veri deposuna yazılmadı. KAO2-13 başlatılmadı.
