# QY-10 — Gmail Apps Script gelen cevap köprüsü (STAGED, hiçbir yere deploy edilmedi)

**Bu klasör `mustafaras/s`'in ya da `mustafaras/seyma-data`'nın bir parçası
değildir.** İçeriği bir **Google Apps Script projesine** ait — script.google.com
üzerinde, Raşit'in cevaplarının geldiği Gmail hesabına bağlı/yetkili yeni bir
proje olarak elle oluşturulmalı. **Bu, QY-09'dan farklı olarak, benim bu
oturumda deploy edebileceğim bir şey DEĞİL:** `gh` CLI ile GitHub'a push
edebildim ama Google Apps Script'e eşdeğer bir API/CLI erişimim (clasp, OAuth)
yok. Bu yüzden bu klasördeki hiçbir dosya otomatik olarak hiçbir yere
kopyalanmadı — tamamı kullanıcının script.google.com'da elle yapıştırması
gereken bir teslimat.

## Ne yapar

Raşit'in `data/quran-request-outbox.json`'daki bir isteğe verdiği e-posta
cevabını okur, doğrular (izinli gönderici + requestId/replyToken eşleşmesi +
tek geçerli YouTube bağlantısı + YouTube oEmbed varlık kontrolü), ve
doğrulanmış sonucu `data/quran-responses.json`'a idempotent biçimde yazar.
`data/latest.json`'a hiçbir satır dokunmaz.

## Dosyalar

- **`QuranTransportV1.gs`** — `mustafaras/s`'teki `quranTransportV1.js`
  (QY-04) ile **mantık olarak birebir aynı** kopya; tek fark son satırdaki
  dışa aktarım mekanizması (Apps Script'te `window` yok). `test_transport_parity.mjs`
  bunu ÇALIŞTIRARAK kanıtlar — metin karşılaştırması değil.
- **`ReplyBridgeLogic.gs`** — saf karar mantığı (`evaluateReply`). Gmail/
  YouTube/GitHub'a hiç dokunmaz; hepsi enjekte edilir. Bu yüzden gerçek Apps
  Script çalışma zamanı olmadan, düz Node'da tam test edilebilir.
- **`Code.gs`** — Apps Script'e özel "ince yapıştırıcı": Gmail'den okur,
  `evaluateReply`'i çağırır, sonucu GitHub Contents API ile yazar, thread'i
  etiketler. **Birim test EDİLEMEZ** (GmailApp/UrlFetchApp/PropertiesService/
  Utilities gerçek ortam dışında yok) — bilerek olabildiğince ince tutuldu.
- **`test_reply_bridge.mjs`** — 46 testlik, sıfır ağlı fixture paketi. Plan
  QY-10 DOĞRULAMA listesiyle birebir: geçerli cevap, spoof sender, yanlış
  token, iki URL, bozuk URL, tekrar cevap, silinmiş video.
- **`test_transport_parity.mjs`** — 69 testlik "sıfır kayma" kanıtı:
  `QuranTransportV1.gs`'in gerçek `quranTransportV1.js` ile davranışça
  birebir aynı olduğunu, aynı girdi setini her ikisine de vererek kanıtlar.

Çalıştır:

```bash
cd .claude/skills/run-seyma/quran-reply-bridge
node test_reply_bridge.mjs
node test_transport_parity.mjs
```

## Kurulum adımları (yalnız kullanıcı elle yaparsa)

1. [script.google.com](https://script.google.com) → yeni proje.
2. Üç dosyayı sırasıyla yapıştır: `QuranTransportV1.gs`, `ReplyBridgeLogic.gs`, `Code.gs`.
3. **Project Settings → Script Properties**'e ekle:
   | Anahtar | Değer |
   |---|---|
   | `GITHUB_TOKEN` | `seyma-data`'ya Contents API push izni olan bir GitHub PAT |
   | `ALLOWED_SENDER_EMAIL` | Raşit'in **gerçek** e-posta adresi |
   | `GITHUB_OWNER` | (opsiyonel) varsayılan `mustafaras` |
   | `GITHUB_REPO` | (opsiyonel) varsayılan `seyma-data` |
   | `GITHUB_BRANCH` | (opsiyonel) varsayılan `main` |
4. Editörden **bir kez elle** çalıştır: `installTimeTrigger()` — bu,
   `processQuranReplies()`'i her 10 dakikada bir tetikleyen bir zaman
   tetikleyicisi kurar. İlk çalıştırmada Google, Gmail/harici istek izni
   isteyecek — onaylaman gerekir.
5. Bundan sonra Raşit'in QY-09 e-postasına verdiği her geçerli cevap, en
   geç ~10 dakika içinde otomatik işlenir.

## Güvenlik notları

- `GITHUB_TOKEN` yalnız Script Properties'te durur; hiçbir `.gs` dosyasına
  hardcode edilmez, hiçbir GitHub JSON gövdesine girmez (yalnız
  `Authorization` header'ında taşınır).
- Ham e-posta gövdesi/gönderen adresi **hiçbir zaman** GitHub'a yazılmaz;
  `data/quran-responses.json`'a yalnızca sanitize edilmiş alanlar
  (`responseId`, `requestId`, `surahId`, `videoId`, `senderFingerprint` —
  düz adres değil, SHA-256 özeti) gider.
- `Logger.log` çağrıları da yalnız kısa `requestId` + red nedeni kodu
  loglar; gövde/adres asla loglanmaz.
- Belirsiz durumlar (ör. YouTube oEmbed'e geçici ağ hatası) thread'i
  **"işlendi" olarak DAMGALAMAZ** — bir sonraki çalıştırmada tekrar denenir.
  Yalnız kesin bir karar (kabul VEYA e-postanın içeriğinden kaynaklanan bir
  red) thread'i işlendi yapar.

## Kapsam dışı (bilinçli, hata değil)

- Bu köprü yalnız `data/quran-responses.json` yazar; `data/quran-delivery.json`
  (QY-09) ve `data/quran-request-outbox.json`'a (QY-08) hiç yazmaz.
- Uygulamanın bu cevabı okuyup göstermesi QY-11'e (yanıt polling) aittir.
