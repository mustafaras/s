# KAO2 — CURRENT STATE

<!-- kao2-sync
nextCard: KAO2-15
lastSeq: 60
status: active
-->

Son güncelleme: 2026-09-29 · LEDGER seq60

## Şu an neredeyiz
KAO2-00…14 tamamlandı ve KAO2-14 yerel commit ile kapandı (`86e646be`). **KAO2-15
engelli (BLOCKED):** S-10 gramer notları kütüphanesi (12 ünite grubu, 25 kavram,
kavram sayfası, Keşfet ve ünite kavram girişleri) yazıldı, CSS ve fikstür eklendi;
yeni fikstür yönlendirici dışında **5/5 yeşil**. Kartın kabulü kartın Dokun
listesinde olmayan tek bir dosyaya bağlı: `app/core/quranLearnFlow.js` satır 4'teki
`VIEWS` beyaz listesinde `grammar` yok.

## Sıradaki kartın tek cümlesi
Sıradaki iş yeni kart değil: **KAO2-15**'in engelini çözmek. Onay gelirse `VIEWS`
listesine `grammar` anahtarı eklenir, P3 kapılarının tamamı çalıştırılır ve kart P4
ile kapanır; yeni kart ancak ondan sonra başlar.

## Canlı gerçekler
- Dal: `kao2-yeniden-tasarim`; KAO2-14 kapanış commit'i `86e646be` (kart başında
  HEAD `c1ebe168` idi). Uzakla eşitlenme yalnız KAO2-13'e kadar yapıldı.
- `KAO2-STATE.json`: program `active`; KAO2-15 `blocked`; `nextCard=KAO2-15`;
  `ledgerLastSeq=60`.
- `releaseApproval=approved_through_KAO2-13`; KAO2-14/15 için push, main'e
  fast-forward, tag veya Pages deploy yetkisi yoktur. Cihaz kabulü doğrulanmadı.
- G0 kapalı, G1 sunulmuş, G2 kapalı; G3/G4 açık.
- KAO2-15 yalnız `app/core/quranLearn.js`, `app/core/quranLearnViews.js`,
  `app/kao.css`, yeni `tests/kao/test_kao2_grammar_notes.js` ve P2.4 kaydı olarak
  `tests/kao/test_kao2_today.js`'i değiştirdi. Yeni `App.kao*` handler'ı yok
  (`App.kaoNav`/`App.kaoSetView` shim'leri kullanılır); fx2/v3/surface pinleri ve
  `index.html`/`sw.js`/`test_iip_22.js` yayın pini değişmedi.
- `app/core/quranLearnFlow.js` **değişmedi**: geçici teşhis yaması geri alındı
  (`grep -c 'grammar:true'` = 0).
- Bütçe: içerik 168.483 KiB · runtime 78.0 KiB (<=80) · CSS 10.1 KiB (<=14) ·
  yalıtılmış p95 ~4,7 ms — K-1 sınırları içinde.
- Kaynak/test: kısmi PASS · yayın: yapılmadı · cihaz: doğrulanmadı.

## Açık riskler ve bekleyen kullanıcı işleri
- **Kapsam kararı bekleniyor:** KAO2-15 kabulü `app/core/quranLearnFlow.js` router
  listesine tek belirteç eklemeyi gerektiriyor; bu dosya kartın Dokun listesinde
  değil (P6). Onay/ret kullanıcıya ait; ret hâlinde kart blocked kalır.
- Gerçek cihaz kabulü doğrulanmadı; kullanıcı cihazı doğrulamasının yerine headless
  test geçmez. 320 px/%200 metin koşulu kaynak fikstürüyle denetlendi, tarayıcıda
  açılmadı (veri güvenliği/P5).
- G3/G4 kapıları açık kalıyor ve sonraki kartlarda kendi karar/inceleme koşulları
  geçerli.
- Yeni bir yayın için açık kullanıcı talimatı gerekir; mevcut release approval
  yalnız KAO2-13'e kadar.
