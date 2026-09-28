# KAO-12 handoff

KAO-12 tamamlandı. `QuranGrammarV1.templates` içinden seçilen Ek çöz, Çekim tablosu, Kök bul ve Kalıp eşle görevleri aynı karma oturumda yer alır. Yeni kartın dört-tür kabulü nedeniyle gramer görev bütçesi 3’ten 4’e ilerletildi.

Görevlerin tamamı en az 44 px düğme çipleriyle ve klavyesiz çalışır. Doğru/yanlış geri bildirimi mevcut `aria-live` bölgesini kullanır. Yanlış cevaplar `affix`, `root` veya `rule` sayacını artırır; KAO-11 geri alma anlık görüntüsü bu sayaçları da eksiksiz geri yükler.

Kart kapıları headless olarak geçti. Sonraki kart KAO-13’tür. KAO-12 yerel commit olarak kalır; push/merge/tag/deploy ve kullanıcı-cihaz kabulü yapılmadı.
