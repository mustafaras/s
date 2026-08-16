# REM-30 — Başarı ölçütleri ve privacy-safe observability evidence

**Tarih:** 2026-08-16<br>
**Durum:** `done` — local contract ve synthetic verification<br>
**Kapsam:** R9-G9-A için kullanıcı kontrolü, sakinlik, erişim, mahremiyet ve
güven kabul kriterlerini dış telemetry olmadan ölçülebilir hale getirmek.

## 1. Source ve plan evidence

- Repository: `/Users/m_ras/Desktop/seyma`
- Başlangıç branch/status: `main...origin/main [ahead 66]`; başlangıç çalışma
  ağacı temizdi.
- Başlangıç HEAD: `ad7d87e2660b4052aa1426af5ab5f01985df0a7c`.
- Canonical kaynaklar: plan §2.1–§2.3, R9 “telemetry’siz observability” çıkış
  kapısı ve §17 P0–P3 öncelikleri. Kullanıcı promptunda anılan `§14.5` alt
  başlığı bu checkout’taki plan metninde yoktur; R9 maddesi ve §17 ile
  eşleştirme yapıldı, yeni plan bölümü uydurulmadı.
- Ön koşul: `node docs/reminders/verify-reminder-context.mjs` →
  `REMINDER CONTEXT PASS: 73 prompts, 67 local links, approval=not_approved`.
- Bu REM-30 teslimi uygulama runtime’ını, sync’i, paneli, `data/`yı veya
  production telemetry’yi değiştirmez.

## 2. Beş ürün hedefi × beş güvenlik boyutu

| Ürün hedefi | Kontrol | Sakinlik | Erişim | Mahremiyet | Güven |
|---|---|---|---|---|---|
| Kullanıcı kontrolü | Kategori, kanal, snooze, bugün sustur ve kapatma geri alınabilir. | Çıkış eylemi cezalandırmaz ve yoğunluğu artırmaz. | Açık etiket, klavye ve ekran okuyucu erişimi korunur. | Kontrol olayı kimlik, occurrence veya hassas kategoriyle ölçülmez. | Uygulanan/bekleyen/desteklenmeyen durum ayrılır. |
| Sakinlik ve düşük yoğunluk | Dismiss/snooze/mute her zaman erişilebilir çıkıştır. | Bütçe, quiet hours ve duplicate sınırı aşılmaz. | Native yoksa tekrar üretmeyen in-app fallback kalır. | Native metin genel, ayrıntı yalnız app içidir. | Sessiz gün/düşük sayı başarısızlık değildir. |
| Eyleme geçiricilik ve erişim | Tek ana adım seçilebilir veya kullanıcı çıkabilir. | Aciliyet, utanç ve zorlayıcı dil yoktur. | Deep-link, focus, metin, kontrast ve hedef alanı fixture’da geçer. | URL/payload hassas gövde ve not taşımaz. | Offline/unsupported durumda fallback ve dürüst durum gösterilir. |
| Mahremiyet ve veri güvenliği | Clear/reset/izin geri alma ölçümden bağımsız çalışır. | Pasif izleme veya analitik izni istenmez. | Sözleşmenin ölçmediği ve yerel kaldığı anlaşılır. | Mood, terapi, journal, ibadet/prayer, ilaç, not, gövde ve kimlik boyutları yasaktır. | Klinik/manevi profil çıkarılmadığı açıkça yazılır. |
| Güven ve dürüst capability | Kullanıcı feedback’i reddedebilir, silebilir veya daha az isteyebilir. | Dismiss/snooze/mute/düşük yoğunluk güvenlik sinyalidir. | Foreground/native/offline/background durumları ayrıdır. | Dış telemetry, gerçek veri ve panel aktarımı zorunlu değildir. | Her metrikte kanıt seviyesi ve yanlış yorum riski vardır. |

Bu kriterler tek bir engagement sonucuna indirgenemez. Click-through ve
completion yalnızca ikincil teşhis sinyalleridir; kullanıcı kontrolü, düşük
yoğunluk, privacy boundary, capability honesty ve açık geri bildirim ile
birlikte okunmadan başarı iddiası oluşturmaz.

## 3. Ölçüm kaynağı ve saklama sınırı

| Kaynak | İzin verilen kullanım | Açık yasak |
|---|---|---|
| `synthetic_fixture` | Headless, deterministik acceptance ve negative privacy cases | Gerçek localStorage, gerçek data, cihaz veya production çağrısı |
| `local_aggregate` | Cihaz içinde veya ephemeral testte bucket/count; native/in-app yoğunluk, dismiss, snooze, mute | Remote sync, panel projection, cross-device identity, raw event veya occurrence geçmişi |
| `explicit_user_feedback` | Kullanıcının gönüllü ve doğrudan verdiği bucket’lanmış geri bildirim | Sessiz kullanıcıyı varsaymak, raw metni metrik olarak saklamak veya profillemek |

Analytics servisi, production telemetry, background tracking, gerçek kullanıcı
verisi, `data/latest.json`, `mustafaras/seyma-data`, user/device/session kimliği
ve dış endpoint bu sözleşmenin dışındadır. Metrik payload’ı raw event, kimlik,
reminder/occurrence ID, kategori, mood, terapi, journal, ibadet/prayer, ilaç,
not, body, free text, konum veya token taşımaz. Ölçüm `data` state’ine,
sync’e veya panel projection’a yeni bir kayıt eklemez.

## 4. Metrik sözleşmesi ve yanlış yorum riski

| Metrik / sinyal | Kaynak | Kullanım | Yanlış yorum riski |
|---|---|---|---|
| `control_reversibility` | synthetic fixture | Aç/kapat, snooze, bugün sustur, reset ve geri alma yollarının varlığını test eder. | Fixture PASS gerçek cihazdaki erişimi kanıtlamaz. |
| `notification_density_under_cap` | local aggregate | Kullanıcı bütçesi, quiet hours ve duplicate sınırına uyumu kontrol eder. | Düşük sayı tek başına memnuniyet veya sakinlik kanıtı değildir. |
| `action_path_reachability` | synthetic fixture | Allowlisted hedefe erişim, fallback ve a11y yolunu test eder. | Hedefe erişim kullanıcının eylemi istediğini veya tamamladığını göstermez. |
| `click_through_and_completion` | synthetic fixture | Yalnız ikincil path teşhisi; birincil release/ürün başarısı değildir. | Click/completion sağlık, ibadet, ruh hâli veya genel başarı sonucu sayılamaz. |
| `privacy_boundary_zero_violations` | synthetic fixture | Hassas alanların native, remote, panel, debug ve metric payload’a girmediğini test eder. | Sentetik PASS bilinmeyen production sızıntısını garanti etmez. |
| `capability_honesty` | synthetic fixture | Permission, offline, foreground ve unsupported fallback dilini test eder. | Headless PASS OS/PWA cihaz davranışının yerine geçmez. |
| `explicit_feedback_bucket` | explicit user feedback | Gönüllü geri bildirimi sınırlı bucket olarak kaydeder; raw metrik değildir. | Yanıt vermeyen kullanıcıları temsil etmez ve genellenemez. |

### Güvenlik sinyalleri

- `dismiss`: Kullanıcının o an istemediğini veya çıkış yolunun işe yaradığını
  gösteren yerel karar sinyalidir; başarısızlık veya daha fazla reminder gerekçesi
  değildir.
- `snooze`: Zamanlama/kapasite uyumsuzluğu sinyalidir; daha sık gönderim nedeni
  olamaz.
- `mute`: Yoğunluğu azaltma veya kategoriyi bırakma tercihidir; retention kaybı
  ya da yeniden kazanım hedefi değildir.
- `low_notification_density`: Kullanıcı bütçesine uyum güvenlik sinyalidir;
  engagement düşüşü veya ürün başarısızlığı değildir.

Bu sinyaller arttığında güvenli yorum daha az, daha sonra veya hiç bildirim
sunmaktır; otomatik davranış profili, hassas kategori çıkarımı veya bildirim
frekansı artırımı değildir.

## 5. Test / traceability evidence

- `tests/reminders/test_reminder_metrics.js` sözleşmeyi 5 hedef × 5 boyut,
  üç izinli kaynak, aggregate-safe alanlar, secondary click/completion,
  dismiss/snooze/mute/düşük yoğunluk sinyalleri ve hassas boyut negatifleriyle
  doğrular.
- Test matrix: `G9-A | test_reminder_metrics.js | Başarı ölçütleri | Ölçüm
  hassas profil / telemetry üretmiyor | REM-30`.
- Traceability: `APP-REMINDER-TRACEABILITY-MATRIX.md` §2 Hedef / başarı satırı,
  `REM-30, REM-40` ve `measurement contract` owner’ına bağlanır. REM-40
  ileride section-level reconciliation yapacaktır; bu evidence yalnız REM-30
  sözleşme kapsamını kapatır.
- Test, network, browser, localStorage, gerçek data veya external write
  kullanmaz.

## 6. Acceptance ve kapanış sınırı

Kabul kriterleri sağlandı: kişisel profil çıkaran boyutlar yasaklandı, dış
telemetry zorunlu değil, her metrik ve safety signal için yanlış yorum riski
yazıldı. Bu kanıt source/test evidence’tır; production, deployment ve cihaz
kanıtı değildir. `releaseApproval.status` `not_approved` kalır; push, merge,
Pages, deploy, browser ve external write yapılmadı.
