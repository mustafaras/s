# U01–U08 başlangıç ölçümü

Bu kartta yapılabilen ölçüm, her görevin mevcut entrypoint ve veri/DOM zincirini belirlemekle sınırlıdır. Görev süresi, dokunuş sayısı, %200 metin davranışı ve cihaz performansı gerçek kullanıcı cihazında çalıştırılmadı. Aşağıdaki “pending” değerler eksik kanıtı temsil eder; PASS değildir.

| Görev | Kaynak başlangıcı | Başlangıç sonucu | Eksik kanıt / sonraki yetkili kart |
|---|---|---|---|
| U01 Vakit kaydını bul | `App.go('saygi')` → `setFaithTab('iman')` → `#faith-preview-card` → `App.openFaithCorner()` → `App.togglePrayer()` | Entry route ve altı vakit satırı bulundu; sentetik route doğrulaması mevcut | ≤2 dokunuş ve yanlış gün=0 cihaz/oturum ölçümü pending; görsel/akış paketi IIP-04/06 |
| U02 Öncü bul | `App.go('saygi')` → `setFaithTab('oncu')` → `saygiPreviewCardHTML()` / collection | 100 kişi, tarih seçimi, collection ve önceki/sonraki var; canlı arama/filtre entrypoint'i baseline'da yok | “İlham araması boş” görevi henüz ölçülebilir bir girişe bağlı değil; arama/filtre IIP-10 kapsamı |
| U03 Okumaya dön | `App.openSaygiPreview()` / collection → `saygiPersonModalHTML()`; `ui.saygi*` ve `data.days[].reading.entries` | Aynı oturum modalı, Okudum kapısı ve mevcut kayıt yolu bulundu | 10. paragraf kapanışı, scroll konumu ve içerik kaybı 0 gerçek cihazda pending; IIP-05/11 |
| U04 Zikre devam | `setFaithTab('zikir')` → `App.openZikr()` → `#zikr-screen` | Aktif preset/hatim/gün kaydı ve reload korunumu headless harness ile doğrulandı | ≤2 dokunuş ve yanlış preset=0 cihaz ölçümü pending; IIP-07/11 |
| U05 Kaynağı anla | Kur'an/Öncü kaynak yüzeyi → `quranViewBodyHTML()` veya `saygiArticleBodyHTML()` | Kaynak, içerik ve açıklama bölgeleri kaynakta ayrışıyor; insan anlama testi çalıştırılmadı | Katılımcının kendi sözüyle açıklama gözlemi ve editoryal review pending; IIP-03/16/17 |
| U06 Ağ hatasından çık | `saygiLoadSummary()` TR→EN fallback → modal hata/`App.refreshSaygi()` | Hata, yeniden dene ve Wikipedia fallback yolu kaynakta mevcut; gerçek timeout testi bu kartta yapılmadı | Kilitlenme=0 ve yanlış başarı=0 için enjekte hata/cihaz kanıtı pending; IIP-05/08 |
| U07 Raporu yorumla | `setFaithTab('rapor')` → `faithRaporCardHTML()` → `faithWeekKPIs()` / heatmap | Eksik gün ayrımı ve rapor entrypoint'i bulundu; mevcut kopyada `% uyum` ve `dayCount*6` riski korunarak kaydedildi | Kullanıcı yorumlama testi ve anlamsal karar pending; IIP-03/14/15 |
| U08 Büyük yazı | `.saygi-page`, zikir, rapor ve modal yüzeyleri; tasarım protokolü %200 metin | Kaynak yüzeyleri ve 389px dar ekran harness kapsamı var | %200 text zoom, yatay taşma/örtülme ve keyboard gerçek cihaz kanıtı pending; IIP-02/05/08/11 |

## Cihaz kanıtı

U01–U08 için cihaz modeli, işletim sistemi/tarayıcı, viewport, tema, cache durumu, 5+30 performans örneği, ekran görüntüsü veya VoiceOver/klavye kaydı yoktur. `deviceAcceptance` plan seviyesinde `not_verified` kalır. Bu eksikliği kapatmak IIP-01'in kaynak envanterini genişletmeden sonraki yetkili görsel/kabul adımlarına bırakılmıştır.
