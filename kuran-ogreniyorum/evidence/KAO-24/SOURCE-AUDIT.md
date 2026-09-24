# KAO-24 · D-08 ses kaynağı denetimi

**Tarih:** 2026-09-23 · **Sonuç:** `SUFFICIENT — APPROVED` · **Denetleyen:** gpt-5-codex

## Yetki ve eşik

Kullanıcının “yap tum yetkileri veriyorum” ve “çözmeliyiiizzzz ne gerekiyorsa yap” talimatları D-08 için kaynak seçimi, D-09 için repo içi alt küme ve KAO-24 uygulamasını yetkilendirir. Kullanıcı yetkisi üçüncü taraf hakkı yaratmadığı için yalnız veri kümesi yayıncısının ses baytları üzerinde açık yeniden-dağıtım lisansı verdiği kaynaklar kabul edildi.

## Reddedilen ilk aday

`zaibihassan/Quranic-Word-By-Word-Audio-Data` kartı Apache-2.0 etiketi ve iki stil bildirir; okuyucu adı, orijinal master kaynağı ve kayıt hakkı zinciri yayımlamaz. Aynı yayıncının `Quranic-Recitation-Data/DATA_LICENSE.md` belgesi hakların okuyucu/stüdyo/kaynakta kalabileceğini ve ayrıca doğrulanması gerektiğini söyler. Bu aday kullanılmadı.

- https://huggingface.co/datasets/zaibihassan/Quranic-Word-By-Word-Audio-Data
- https://huggingface.co/datasets/zaibihassan/Quranic-Recitation-Data/blob/main/DATA_LICENSE.md

## Kabul edilen kaynak 1 — Tadabur

- **Yayıncı/katalog:** Faisal Alherran, `FaisaI/tadabur`; https://huggingface.co/datasets/FaisaI/tadabur
- **Sürüm izi:** indirilen Parquet kaynaklarının dosya adları ve seçim raporundaki 12 parça listesi korunur.
- **Lisans:** veri kümesi kartında ve repo açıklamasında ses dâhil veri kümesi `CC BY-NC 4.0`, araştırma/eğitim kullanımı ve atıf şartıyla yayımlanır.
- **Kapsam:** kart 600+ okuyuculu Kur'an seslerini bildirir; canlı Parquet taramasında sûre kimlikleri 2–114 çıktı (Fâtiha yok), âyet sesi ve otomatik kelime zaman hizaları vardır.
- **Okuyucu kökeni:** her satır `reciter_id` ve kaynak `audio_filename` taşır; yayıncının `sheikh_dict.json` dosyası `reciter_id` değerlerini yayımlanmış okuyucu adlarına bağlar.
- **Sınır:** kelime hizaları otomatik türetilmiştir. Manifest bunu `dataset-word-alignment` olarak açıklar; insan doğrulaması iddia edilmez.
- **Hak zinciri sınırı:** yayıncı ses dâhil veri kümesini açıkça CC BY-NC 4.0 ile dağıtır; buna dayanılır. Tek tek kaynak kayıtların yayıncıdan önceki stüdyo/master sözleşmeleri kartta kalem kalem yayımlanmamıştır; bu nedenle kanıt “yayınlanan veri nesnesi + okuyucu/dosya izi” düzeyindedir, daha geniş bir upstream hak garantisi değildir.

Bu kaynak 523/524 doğrulanmış lemma ile 95–114 arasındaki 20 kısa sûrenin tamamını karşılar. Fâtiha veri kümesinde bulunmadığı için tek lemma ayrı, açık lisanslı kaynaktan tamamlanır.

## Kabul edilen kaynak 2 — AQQD v2

- **Yayıncı/depo:** Linda Smail ve diğerleri, Harvard Dataverse DOI `10.7910/DVN/A8GM5Y`; https://doi.org/10.7910/DVN/A8GM5Y
- **Lisans:** Dataverse veri kümesi ve eşlik eden makale, 24.183 ses kaydının `CC0 1.0 Public Domain` altında yayımlandığını bildirir.
- **Kayıt kökeni:** R000, Taibah University (Madinah) akademik girişiminden sağlanan, aynı tek okuyucunun kontrollü 1.072 kaydıdır.
- **Okuyucu sınırı:** kişisel ad yayımlanmamıştır. Manifest okuyucuyu tahmin etmez; `AQQD R000 controlled reciter (name not published)` ve kurum kökenini taşır.
- **Kullanılan kesit:** yalnız Fâtiha 1:7 için R000/S9 ve R000/S10. Arşivin merkez dizini HTTP Range ile okunmuş, iki WAV kendi yerel başlık/ofsetlerinden çıkarılmıştır.
- **Hizalama:** iki kayıt yerel Whisper token zamanlarıyla hizalanmış; hedef kelime sınırı kaynak âyet ve ses üzerinde denetlenip manifestte `local-whisper-alignment` olarak açıklanır.

Birincil veri açıklaması: https://pmc.ncbi.nlm.nih.gov/articles/PMC13285623/

## D-08 karşılama matrisi

| Koşul | Sonuç | Kanıt |
|---|---|---|
| Ses baytlarına açık yeniden-dağıtım lisansı | PASS | Tadabur CC BY-NC 4.0; AQQD CC0 1.0 |
| Okuyucu/kayıt kökeni | PASS | Tadabur adı + `reciter_id` + dosya; AQQD kurum + kararlı R000 kodu |
| Yayınlanan ses nesnesi izi | PASS | HF Parquet kaynak dosyası veya Dataverse split-ZIP üye yolu |
| Kelime kesim izi | PASS | Tadabur otomatik kelime hizası; iki AQQD kesiti için yerel Whisper zaman raporu |
| Manifestte lisans/atıf | PASS | Her klipte kaynak; üst düzey veri kümesi atıfları |

## Karar

D-08 karşılandı; D-09'un repo içi 16 MiB üst sınırı uygulanır. Operasyonel `measured`/`flowing` etiketleri, 0,20–4,00 saniyelik kalite penceresindeki adayların sırasıyla 75. ve 25. yüzdeliklerine yakın kayıtları anlatır; murattal/mujawwad veya kanonik kıraat sınıfı iddiası değildir. Derleme aracı ağ kullanmaz ve yalnız yerel kaynak klasörünü okur.
