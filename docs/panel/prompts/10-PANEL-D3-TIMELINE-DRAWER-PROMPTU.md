# PANEL-10 — D3 Son Değişiklikler Timeline ve Drawer Prompt’u

## Amaç

Event log’u kullanıcı tarafından kolay takip edilen, filtrelenebilir ve
kanıta dayalı bir değişiklik zaman çizelgesine dönüştür.

## Timeline

Her satır: saat, feature icon, kısa özet, source, status, revision ve drawer
eylemi taşır. Retry/merge/accepted zincirleri tek grup olarak gösterilir.

## Filtreler

- tümü,
- dikkat gerektiren,
- senkron,
- terapi/profil,
- Kur’an/video,
- iletişim,
- kullanıcı girdisi,
- türetilmiş,
- dış kaynak.

## Drawer

- mobil tam ekran,
- desktop sağdan 420–520px,
- focus trap, Esc, close button,
- ana scroll konumu korunur,
- seviye 1 hızlı özet, seviye 2 feature ayrıntısı, seviye 3 audit.

## Kabul kapısı

- Event sırası ve duplicate davranışı doğru.
- Sensitive event raw metin sızdırmıyor.
- Yeni event geldiğinde taslak/input bozulmuyor.
- Drawer keyboard ve screen reader ile kullanılabiliyor.

İki ledger’a eş sequence kaydı ekle, test kanıtını yaz ve DUR.
