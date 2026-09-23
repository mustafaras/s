# IIP-04 devir

IIP-04 tamamlandı: beşli/dörtlü İlham & İbadet navı aynı çağrı ve sıra sözleşmesiyle responsive auto-fit grid'e alındı; seçili bölüm renk+şekil+metin ve `aria-current`/`aria-pressed` ile belirginleştirildi; kart durum/metrik/footer metinleri 320px ve yüzde 200 metinde sarılabilir hale getirildi. Ortak hub aralığı 12px olarak birleştirildi.

Değişen üretim/test yüzeyi: `app/core/saygi.js`, `app/styles.css`, `tests/app/test_iip_04.js`; state/ledger/evidence ve generated tracking views de güncellendi. Hesap, data/migration, handler gövdesi ve hub çağrı sırası değişmedi.

REQ-007/008, source/style contract, Saygı boundary, plan-check, zikr headless ve shell gate PASS. Static visual render contract vardır; browser screenshot, VoiceOver ve gerçek cihaz kabulü yoktur. IIP-03 teslimi `fe8b35a` olarak remote/Pages'te yayındadır; IIP-04 commit/push/merge/deploy zinciri bu oturumdaki açık kullanıcı yetkisiyle yürütülmektedir.

Sonraki yetkili eylem: IIP-05 için yeni açık kullanıcı yetkisi. `kuran-ogreniyorum/` kullanıcı untracked klasörü korunmalı, release kapsamına alınmamalıdır.
