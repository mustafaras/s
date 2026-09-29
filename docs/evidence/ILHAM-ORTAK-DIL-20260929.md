# İlham & İbadet · Bugün sekmesi ortak kart dili (2026-09-29)

Kullanıcı isteği: Bugün sekmesindeki kartların tasarım ve renkleri dağınık; açık ve koyu temada premium, ortak bir dile çekilsin. Karar: **zengin premium** (ortak iskelet + çok hafif modül tonu), önce/sonra ekran görüntüsüyle doğrulama.

## Önce (ölçüm)
| Kart | Köşe | Zemin | Gölge | Vurgu |
|---|---|---|---|---|
| faith-v2-nav | 17 | düz | renkli | faith |
| sg-spirit-bar | 20 | cam blur | — | kandil |
| saygi-source-card | 15 | kaynak tonu | — | alan adı tonu |
| iip17-reader | 24/20 | 150° gradient | renkli | accent-ink; koyu temada parlak mavi Arapça panel/düğme (#4777B6) |
| iip21-program | 22 | düz + ışıma | 0 16 38 quran | quran; 5px şerit |
| quran-v2-preview | 22 | quran-surface | 0 16 38 quran | 5px quran2 şerit |
| kao-hub-card | kao-r-card | düz | yok | quran-mid; şerit yok (aykırı) |
| zikr-v2-preview | 23 (!important) | zikr paleti | 0 18 42 sabit rgba | 5px zikir altını; hover translateY |

## Sonra
`app/styles.css` sonuna `.saygi-page` kapsamlı, yalnız ekleme yapan blok (mevcut kurallar değişmedi):
- Tokenlar (açık/koyu ayrı): `--ib-surface` #FFFDF8/#15171C, `--ib-line`, `--ib-gold` #A9852A/#DCC27A, `--ib-eyebrow` #7D5F18/#DCC27A, `--ib-navy` #1C3A5F/#22395A, `--ib-on-navy`, `--ib-arabic`, modül tonu (Kur'an lacivert, zikir teal), `--ib-r` 22, `--ib-r-sm` 18, `--ib-r-ctl` 14, tek `--ib-shadow`.
- Büyük kartlar (iip17, iip21, Kur'an Yolculuğu, KAO hub, zikir, hub-v2): aynı kenar, 4px altın şerit, 22px köşe, %6/%10 modül tonlu zemin, tek gölge; hover kaldırma yok.
- Yardımcı satırlar (sekme çubuğu, ruh çubuğu, günlük odak): aynı yüzey/kenar/gölge, şeritsiz, 18px.
- Etiket, durum hapı, ikon rozeti ve birincil düğme tek biçim; Arapça panel ve düğmeler koyu temada derin gece laciverti + altın.
- KAO hub: 44px rozet, başlık 800, altın halka (KAO2 06 §5 "gölge yok" kuralından bu yüzeyde bilinçli sapma; KAO2 LEDGER seq41).

## Kontrast (hesaplanan)
Açık: etiket/tonlu zemin 5,27 · etiket/hap 5,43 · düğme 10,90 · Arapça altın/lacivert 7,45 · şerit 3,40. Koyu: etiket 9,29 · hap 8,45 · düğme 11,01 · Arapça 7,53 · şerit 10,28.

## Kapılar
KAO 26/26 · app 77/77 · panel 23/23 · panel-v2 27/27 · Quran 9/9 · reminders PASS · driver PASS · zikr 95/95 · KAO kontrast 414/0 · AD kontrast 30/0 · fx-coverage metrikleri önce/sonra birebir (M7 onaylı tavanda). Cache pini `app/styles.css?v=20260929a` (`index.html`, `sw.js`, iki başlık testi).

## Görsel kanıt
Kontrollü yerel QA (CLAUDE.md kural 1): yalnız 127.0.0.1:9000, geçici Chrome profili, sentetik tohum (token boş, `seyma-sync-force` yok, Guard 1 testi PASS), sentetik konum; sunucu iş sonunda durduruldu. 390 px, açık+koyu, önce/sonra görüntüler yerel scratchpad'de tutuldu (depoya eklenmedi). Kaynak-görsel kanıttır; cihaz kabulü değildir.
