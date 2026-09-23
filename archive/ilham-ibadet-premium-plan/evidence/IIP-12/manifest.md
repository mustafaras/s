# IIP-12 · Kanıt manifesti — Günlük odak ve devam et

- **Kart:** IIP-12 · paket B · rol `frontend` · boyut M
- **Bağımlılıklar:** IIP-09 `done`, IIP-11 `done`
- **Gerekli gate:** scope, requirements, review, source, visual
- **Veri etkili yazıcı:** `false` — yeni kalıcı alan, migration veya sync değişimi yok
- **Fixture:** `tests/app/test_iip_12.js` (92 kontrol)
- **Sentetik görsel artifact:** `render-matrix.html` (8 sahne, gerçek registry
  çıktısı). Bu, üretildiği andaki **statik bir anlık görüntüdür**; onu üreten
  tek seferlik araç kanıt dizinine dahil edilmemiştir. Yeniden üretim için
  `saygiDailyFocusHTML` / `saygiContinueRows` / `saygiPreviewHubHTML` çağrıları
  sentetik bir VM bağlamında çalıştırılmalıdır (fixture §1–§8 tam örneği taşır).

## Ne yapıldı

Bugün (Öz) sekmesine iki katman eklendi:

1. **Günlük odak** — kabul edilmiş kataloglardan türetilen **tek** öneri kartı.
   Kaynak (`Günün öncüsü` / `Âyet vitrini`), tahmini süre (`5–10 dk` / `2–3 dk`) ve
   **seçim gerekçesi** görünür. Seçim, gün + katalog kimliğinden türetilen 31
   tabanlı bir karma (`saygiDaySeed`) ile **deterministiktir**; aynı gün tekrar
   render seçimi değiştirmez.
2. **Devam et** — en çok iki satır; sabit sıra **Zikir → Kur’an**. Yalnız gerçek
   durum yazılır (`% oran · hatim ilerliyor`, `İzleniyor · kaldığın yer`); sahte
   ilerleme yüzdesi yoktur.

## Değişen davranış (kart kimliğiyle)

| Durum | Önce | Sonra |
|---|---|---|
| Bugün sekmesi | rota rayı + zikir kartı | **odak kartı** + rota rayı + zikir kartı + **Devam satırları** |
| Aktif zikir hatimi varken | görünmezdi | Devam satırı: gerçek oranla |
| Kur’an `watching` | yalnız rotada | Devam satırı: "İzleniyor · kaldığın yer" |
| Kur’an `ready` | yalnız rotada | Devam satırı → `App.quranJourneyWatch()` |
| Kur’an `watched` | yalnız rotada | Devam satırı → `App.quranJourneyQuestion()` |
| Kur’an `queued/notified/awaiting_reply` | — | **Devam satırı YOK** (bekleme ≠ devam) |
| Kur’an bozuk/başarısız | — | **Devam satırı YOK** (düğme üretilmez) |
| Arşivlenmiş hatim | — | **Devam satırı YOK** |
| İçerik yokken odak | — | dürüst boş hâl + gerekçe, CTA yok |

## Değişmeyen sözleşmeler (korundu)

- **IIP-09 bilgi mimarisi:** `data-faith-tab`, `iip-09-route-rail`,
  `iip-09-today-continue`, Bugün'de `quran-journey-card` + `zikr-v2-preview`,
  İbadet'te `qibla-card`. Fixture 22/22 geçer.
- **IIP-11 okuyucu:** ölçek/bölüm/konum/RTL/kapsayıcı alternatif dokunulmadı.
  55/55 geçer.
- **`saygiPreviewCardHTML`** çıktısı **bit bit aynı** (`test_saygi_boundary.js`
  pinlenmiş sha256 = `c69bee63…`). 20/20 geçer.
- **Modal klavye sözleşmesi** ve okuma kapısı (A) korundu.

## Sınır: yeni `App.*` üyesi ve yeni CSS YOK

`app.js` ve `app/styles.css` bu kartın izin listesinde **değildir**. Bu yüzden:

- Yeni `App.*` handler **açılmadı**; yalnız **mevcut** handlerlar çağrılır
  (`App.openSaygiPreview`, `App.openQuranJourney`, `App.quranJourneyWatch`,
  `App.quranJourneyQuestion`, `App.openZikr`). `App.*` yüzeyi **720'de sabittir**.
- Yeni CSS sınıfı **yazılmadı**; hub katmanı stilli mevcut deseni yeniden kullanır
  (`saygi-source-card` + `saygi-link-*`). Yalnız buton font eşitlemesi
  (`font:inherit`) satır içi verilir.

## Tematik seçki içeriği ÜRETİLMEDİ (bilinçli)

`specs/03` kürasyon kuralı "tema sırası altı tema arasında döner" der (sabır,
şükür, merhamet, emanet, öğrenme, umut). Ancak `04-ICERIK-STRATEJISI.md` kesin
konuşur: *"Pilot sayıları hedef hacimleridir; **bu planla içerik
yazılmış/onaylanmış değildir**"* ve *"Yeni katalog dosyası açma yetkisi vermez"*.

Bu nedenle öneri **yalnız kabul edilmiş kataloglardan** (100 öncü + âyet vitrini)
türetilir ve **tema içeriği uydurulmaz**. Tema döngüsü, editoryal içerik IIP-16
kabulünü aldığında aynı fonksiyona kaynak listesi eklenerek açılır; mimari bunu
zaten destekler (`SAYGI_DAILY_SOURCES`).

## Bilinen kapsam dışı

- "Geç / başka içerik" eylemi **eklenmedi**: `specs/03` bunu koşullu ve
  oturumluk tanımlar, ancak REQ-023/TC-023 kapsamında **değildir** ve `app.js`
  izinli olmadığı için yeni handler gerektirirdi. Karar kaydı `review.md`'dedir.
- Cihaz, ekran okuyucu, gerçek tarayıcı ve yayın kabulü **yapılmadı**; bunlar bu
  receipt'lerin kapsamı dışındadır.
