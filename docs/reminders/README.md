# Hatırlatma Programı — Ajan Yürütme Kiti

Bu klasör, [`plans/APP-HATIRLATMA-VE-BILDIRIM-UX-PLANI.md`](../plans/APP-HATIRLATMA-VE-BILDIRIM-UX-PLANI.md)
dosyasını session bağımsız, kanıt temelli ve kontrollü biçimde uygulamak için
oluşturuldu.

## Tek güvenli giriş noktası

Yeni bir ajan şu sırayı izler:

1. Root [`AGENTS.md`](../../AGENTS.md).
2. [`GELISTIRME-PLANI.md`](../../GELISTIRME-PLANI.md) — yalnız ilgili bölüm,
   fakat ilk kez gelen ajan §0 ve teknik ilkeleri mutlaka okur.
3. [`.claude/skills/run-seyma/SKILL.md`](../../.claude/skills/run-seyma/SKILL.md)
   ve [`tests/README.md`](../../tests/README.md).
4. Bu dosya.
5. [`APP-REMINDER-CONTEXT.md`](APP-REMINDER-CONTEXT.md).
6. [`APP-REMINDER-STATE.json`](APP-REMINDER-STATE.json).
7. [`APP-REMINDER-ANTI-AMNESIA-LEDGER.md`](APP-REMINDER-ANTI-AMNESIA-LEDGER.md).
8. Ledger’daki `activePrompt` ile aynı ID’li promptu
   [`APP-REMINDER-PROMPTLARI.md`](APP-REMINDER-PROMPTLARI.md) içinden oku.
9. O promptun işaret ettiği test matrisi satırlarını ve yalnız ilgili kaynak
    bölümlerini oku.
10. Prompt REM-44 veya daha sonrasıysa [`APP-REMINDER-APP-PANEL-SURFACE-MAP.md`](APP-REMINDER-APP-PANEL-SURFACE-MAP.md)
    içinden yalnız ilgili app / panel surface bölümünü oku; `app.js` ve
    `panel.js` dosyalarını bütünüyle context'e alma.
11. Release veya canlılık kelimesi geçiyorsa önce
    [`APP-REMINDER-APPROVAL-GATE.md`](APP-REMINDER-APPROVAL-GATE.md) dosyasını
    oku; varsayılan durum `NOT_APPROVED`.

`STATE.json`, `LEDGER.md` ve prompt listesi çelişirse ajan durur. Öncelik:

1. root `AGENTS.md` güvenlik ve kapsam kuralları,
2. güncel kaynak kod + test sonucu,
3. ledger’daki en son kanıtlı durum,
4. plan,
5. prompt metni,
6. tarihsel notlar.

Belge, mevcut kod veya testle çelişiyorsa belgeye körü körüne uyulmaz; fark
ledger’a blocker / discrepancy olarak yazılır.

## Canonical dosyalar

| Dosya | Rol | Kim günceller? |
|---|---|---|
| [`APP-HATIRLATMA-VE-BILDIRIM-UX-PLANI.md`](../plans/APP-HATIRLATMA-VE-BILDIRIM-UX-PLANI.md) | Ürün ve teknik plan | Plan kapsamı değişirse yetkili plan sahibi |
| [`APP-REMINDER-PROMPTLARI.md`](APP-REMINDER-PROMPTLARI.md) | Sıralı uygulanabilir prompt sözleşmeleri | Plan / sıra değişirse; rutin sonuç burada yazılmaz |
| [`APP-REMINDER-ANTI-AMNESIA-LEDGER.md`](APP-REMINDER-ANTI-AMNESIA-LEDGER.md) | İnsan tarafından okunabilir durum ve kanıt | Her prompt ajanı, yalnız kendi satırı |
| [`APP-REMINDER-STATE.json`](APP-REMINDER-STATE.json) | Makinece okunabilir aktif durum | Her prompt ajanı, ledger ile birlikte |
| [`APP-REMINDER-CONTEXT.md`](APP-REMINDER-CONTEXT.md) | Okuma sırası, kapsam, context bütçesi | Kapsam veya authority değişirse |
| [`APP-REMINDER-APP-PANEL-SURFACE-MAP.md`](APP-REMINDER-APP-PANEL-SURFACE-MAP.md) | Gerçek app runtime, current panel ve Panel-v2 surface sahipliği / gap register | App veya panel owner / lineage değişirse |
| [`APP-REMINDER-TEST-MATRIX.md`](APP-REMINDER-TEST-MATRIX.md) | Test / acceptance gate matrisi | Yeni gate veya test yolu eklenirse |
| [`APP-REMINDER-TRACEABILITY-MATRIX.md`](APP-REMINDER-TRACEABILITY-MATRIX.md) | Plan → prompt → test izlenebilirliği | Kapsam veya prompt sırası değişirse |
| [`APP-REMINDER-APPROVAL-GATE.md`](APP-REMINDER-APPROVAL-GATE.md) | Canlı / dış sistem release kilidi | Yalnız açık kullanıcı onayıyla state değişir |
| [`APP-REMINDER-DECISIONS.md`](APP-REMINDER-DECISIONS.md) | Append-only karar ve discrepancy günlüğü | Geriye dönük önemli karar / intentional removal olduğunda |
| [`SESSION-HANDOFF-TEMPLATE.md`](SESSION-HANDOFF-TEMPLATE.md) | Oturum kapanış formatı | Template değişirse |
| [`EVIDENCE-RECEIPT-TEMPLATE.md`](EVIDENCE-RECEIPT-TEMPLATE.md) | Kanıt makbuzu formatı | Kanıt alanları değişirse |
| [`verify-reminder-context.mjs`](verify-reminder-context.mjs) | State / prompt / ledger / link consistency checker | Her prompt gate’inden önce |

## Sert yürütme kuralları

- Aynı anda yalnız bir reminder promptu `in-progress` olabilir.
- `blocked` bir prompt çözülmeden sonraki prompt başlatılamaz.
- Her prompt tek dominant risk ve bağımsız done condition taşır.
- Her prompt için ayrı, dar kapsamlı commit tercih edilir; `git add -A` ve
  ilgisiz dosya staging’i yasaktır.
- Faz tamamlanmadan `main`e push / Pages deployment yapılmaz.
- Kullanıcı bu konuşmada açık ve güncel şekilde istemeden canlıya alma,
  `main` push, merge, Pages deploy, release tag veya dış sistem write yapılmaz.
- Kullanıcının açık ve güncel onayı olmadan hiçbir koşulda canlı sürüm
  değiştirilemez. Yeşil test, local commit, “hazır” durumu veya eski sohbet
  mesajı bu onayın yerine geçmez.
- `APP-REMINDER-APPROVAL-GATE.md` içindeki `NOT_APPROVED` durumu test veya
  local commit ile değiştirilemez. `mustafaras/seyma-data` için ayrıca açık
  veri yazma onayı gerekir; canlıya alma onayı veri yazma yetkisi vermez.
- Kullanıcı açıkça istemedikçe bu yürütme kitinin hiçbir promptu gerçek veri
  repo’suna, kullanıcı localStorage’ına, token’a veya dış iletişime dokunmaz.
- Browser açılmaz. Uygulama yalnız headless VM / mock / sentetik fixture ile
  doğrulanır.
- Her ajan sonunda [`SESSION-HANDOFF-TEMPLATE.md`](SESSION-HANDOFF-TEMPLATE.md)
  biçiminde özet verir; hassas veri yazmaz.
- Her prompt öncesi `node docs/reminders/verify-reminder-context.mjs`
  çalıştırılır.
- REM-44–REM-54 yalnız Şeyma app runtime hattıdır; REM-55–REM-66 yalnız
  current ÆON observer panel hattıdır; REM-67–REM-72 iki yüzeyin integration
  acceptance hattıdır. Panel-v2 bu ayrımın dışında, ayrı fixture ve ayrı
  kanıt olarak raporlanır.

## Program durumu

Bu kit oluşturulduğunda uygulama kodu değiştirilmiş değildir. Başlangıç
durumu `APP-REMINDER-STATE.json` içinde `planned`, `activePrompt: REM-00` ve
`releaseApproval.status: not_approved` olarak tutulur. İlk güvenli eylem,
REM-00 ile canlı repo / plan / test baseline’ını kaydetmektir.

Surface map’teki gap’ler kapanmadan app veya panel promptu `done` sayılamaz.
Validator prompt envanterini REM-00…REM-72 olarak ve state / ledger / traceability
parity’sini birlikte kontrol eder; bu planlama kitinin kendisi henüz runtime
uygulaması veya deployment değildir.
