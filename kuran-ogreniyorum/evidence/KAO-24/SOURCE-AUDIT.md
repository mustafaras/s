# KAO-24 · D-08 ses kaynağı denetimi

**Tarih:** 2026-09-23 · **Sonuç:** `INSUFFICIENT — BLOCKED` · **Denetleyen:** gpt-5-codex

## Kullanıcı yetkisi

Kullanıcı 2026-09-23 tarihinde “yap tum yetkileri veriyorum” diyerek KAO-24 için kaynak araştırması, D-08/D-09 değerlendirmesi ve kanıt yeterliyse uygulama yetkisi verdi. Bu yetki kullanıcıya ait repo/uygulama kararlarını kapsar; üçüncü taraf okuyucu, yapımcı veya kayıt stüdyosunun yeniden dağıtım hakkını oluşturmaz.

## Birincil kaynak bulguları

1. Hedef veri seti `zaibihassan/Quranic-Word-By-Word-Audio-Data`, Hugging Face kartında `apache-2.0` etiketi taşıyor ve Muallim + Mujawwad olmak üzere iki 77K+ kelime setini anlatıyor. Fakat kart, okuyucuların adını, orijinal master kaynağını veya hak zincirini vermiyor.
   - https://huggingface.co/datasets/zaibihassan/Quranic-Word-By-Word-Audio-Data
   - https://huggingface.co/datasets/zaibihassan/Quranic-Word-By-Word-Audio-Data/blob/main/README.md
2. Aynı yayıncının ayrı `Quranic-Recitation-Data` lisans belgesi, seslerin depoya ait olmadığını; hakların okuyucu/stüdyo/kaynaklarda kaldığını; kullanıcının yeniden kullanım hakkını ayrıca doğrulaması gerektiğini ve bazı kayıt kökenlerinin karışık/bilinmeyen olabileceğini söylüyor. Bu belge hedef veri setinin eksik hak zincirini tamamlamıyor; tersine riskin gerçek olduğunu gösteriyor.
   - https://huggingface.co/datasets/zaibihassan/Quranic-Recitation-Data/blob/main/DATA_LICENSE.md
3. QUL/Tarteel kataloğu okuyucu adlarını ve kelime zamanlamalarını sağlıyor, ancak incelenen sayfalarda ses baytları için açık, yeniden dağıtılabilir lisans yok.
   - https://qul.tarteel.ai/resources/recitation
   - https://qul.tarteel.ai/docs/tutorial-recitation-end-to-end
4. QuranLab lisans denetimi ses kayıtlarını okuyucu/yapımcı telifinde `reference-only` tutuyor; CC BY 4.0 lisansı yalnız kelime zamanlamalarına uygulanıyor ve ses baytları paketlenmiyor.
   - https://huggingface.co/datasets/quranlab/quran-audio
   - https://huggingface.co/datasets/quranlab/quran-audio-text/blob/main/LICENSES.md
5. `Buraaq/quran-audio-text-dataset` kaynak/pipeline açıklıyor fakat yeniden kullanım hakları için açılmış resmî tartışma yanıtsız; KAO için temiz lisans zinciri değil.
   - https://huggingface.co/datasets/Buraaq/quran-audio-text-dataset
   - https://huggingface.co/datasets/Buraaq/quran-audio-text-dataset/discussions/1

## D-08 karşılama matrisi

| Koşul | Sonuç | Kanıt |
|---|---|---|
| Veri seti etiketi/lisans beyanı | Kısmi | Hedef HF kartı `apache-2.0` diyor |
| Okuyucu kimliği | FAIL | Muallim/Mujawwad stil adı var; okuyucu adı yok |
| Orijinal kayıt/master kökeni | FAIL | Kaynak ve hak sahibi zinciri açıklanmıyor |
| Ses baytlarını yeniden dağıtma izni | FAIL | Okuyucu/yapımcıdan açık izin bulunamadı |
| KAO manifestindeki `readerOrigin` | FAIL | Dürüstçe doldurulamaz |

## Karar

D-08 kanıt eşiği karşılanmadı. D-09'un repo içi ≤16 MB kararı teknik olarak açık olsa da D-08 bağımsız ve zorunlu kapıdır. Bu nedenle:

- `gateApproval` oluşturulmadı;
- ses indirilmedi veya dönüştürülmedi;
- `kao-audio-build.mjs`, manifest ve `.m4a` varlıkları üretilmedi;
- sessiz/sentetik klipler gerçek kıraat gibi sunulmadı;
- KAO-24 `blocked` kalır ve R-C2 metinle devam garantisi sonraki runtime kartlarında korunur.

Kapı ancak adlandırılmış okuyucu + kayıt/master kaynağı + ses baytlarını paketleyip yeniden dağıtma izni birlikte kanıtlanırsa açılabilir.
