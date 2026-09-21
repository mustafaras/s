# IIP-09 devir

- Ajan / rol / tarih: Codex / frontend-integrator / 2026-09-21.
- Yetki: kullanıcının “düzelt” talimatıyla yalnız IIP-09 inceleme bulguları; commit/push/deploy yok.
- CWD / branch / HEAD: `/Users/m_ras/Desktop/seyma` / `main` / `6a8729312d70121d11bb5549e2521941df1162a9`.
- Kart durumu: `done`; IIP-08 done, DEC-02 approved, IIP-10 başlatılmadı; aktif lock yok.
- Davranış: tam Kur’an kartı yalnız Bugün’de, kıble yalnız İbadet araçlarında. Açan kontrol, seçili sekme ve ana scroll geri yükleniyor; hızlı çift aç/kapa idempotent; `popstate` açık Kur’an/kıble modalını bir kez kapatıyor.
- Test: IIP-09 22/22, Saygı 20/20, IIP-04 26/26 ve zikir harness 95/95 PASS; syntax, driver, modal-focus, state-rebind, shell gate ve diff-check PASS.
- Eksik kabul: yok. Ortak regresyon fixture’ları kullanıcının IIP-01–09 bütününü düzeltme yetkisiyle DEC-02’ye uyarlandı.
- Kanıt sınırı: ağsız sentetik VM; browser/VoiceOver/cihaz/yayın kanıtı yok, gerçek veri/token kullanılmadı.
- Sunucu başlatılmadı. Sonraki yetkili eylem yalnız ayrıca yetkilendirilirse IIP-10; bu oturumda başlanmadı.
