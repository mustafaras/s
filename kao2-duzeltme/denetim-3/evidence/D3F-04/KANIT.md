# D3F-04 — F-04: strictExceptions artık sınırsız muafiyet vermiyor

Oturum: claude-opus-5-5 · 2026-10-08 · D3F-04

## Kök neden
`d2f-sync-check --strict` kural (a) ("bitmiş prompt başına tam 1 commit") istisnayı yalnız `a:<prompt>` anahtarıyla eşliyordu:
istisnalı bir prompt kaç commit'e çıkarsa çıksın muaftı (denetim-3 `evidence/21`: ek `D2F-16:`/`D2F-11:` commit'i PASS).
D3F-00'ın dondurmasıyla ikinci bir boşluk doğdu: kapanış (`128ab06d`) SONRASI atılan `D2F-NN:`/`K2F-NN:` commit'leri hiçbir
kapıya girmiyordu (aralık dondu; plan-check bu önekleri tanıdığı için kabul ediyor).

## Yapılan
- `kao2-duzeltme/denetim-2/tools/d2f-sync-check.mjs`:
  - kural (a) istisnası `commits` hash listesi (en az 2) taşımazsa kayıt geçersiz → FAIL;
  - istisna yalnız prompt'un gerçek commit kümesi listeyle BİREBİR aynıysa uygulanır; fazlası/farklısı FAIL ve mesaj kayıtlı
    ile gerçek kümeyi birlikte yazar;
  - `closeCommit..HEAD` aralığında `D2F-NN`/`K2F-NN` önekli commit → `[strict-kapanış]` FAIL.
- `D2F-STATE.json`: 9 kural-(a) istisnasına gerçek hash'ler eklendi (`git log --grep` ile, `cbe0d604..128ab06d`);
  sayılar kayıtlı gerekçelerle aynı (D2F-03/04: 3, diğerleri: 2). Gerekçe metinleri değişmedi.

## TDD / mutasyon
`d2f-mutasyon.sh` (depoda; HEAD klonlanır, aracın çalışma ağacındaki hâli kopyalanır) → `mutasyon.txt`.
RED (eski araç): T1 ek D2F-16 commit'i PASS · T2 ek D2F-11 commit'i PASS · T4/T5 kapanış sonrası D2F/K2F öneki PASS ·
T7 listesiz istisna PASS. GREEN: 8/8 (T0 gerçek durum PASS, T6 kapanış sonrası D3F öneki PASS).
Betiğin ilk iki taslağı yanlış nedenle FAIL üretiyordu (aralığa giren sahte taban commit'i, sonra D3F commit'leri); klon
kapanış commit'ine alınarak düzeltildi — mutasyonun DOĞRU nedenle kırmızı olduğu çıktıdaki metinle de sınanır.

## Kapılar
`d2f-sync-check --strict --repro`: PASS · 30 commit · 15/15 istisna. Commit sonrası temiz HEAD'de tekrar → aşağıda.

## Ölçümler
9 istisna · 20 muaf commit; kapanış sonrası 7 commit (hepsi D3F) taranır, ihlal 0.

## Bilerek değişen testler
Yok (araç + STATE verisi).

## Kanıt düzeyleri
kaynak/araç ✓ · yayın — · canlı — · cihaz —

## Sürprizler / açık not
Raporun ek notu: ilk dokuz istisnanın gerekçesi "yeni ihlal bu listeye eklenemez, yalnız kullanıcı kararıyla" derken D2F-11/12/13/16
kayıtları sonradan eklendi; D2F-16'nınki açık istisna kararı değil, "yapabildiklerinin hepsini yap" cümlesine dayanıyor. Geçmiş
yeniden yazılmadı; bu kayıtlar artık hash'e bağlı ve genişletilemez. Kararın kendisinin değerlendirmesi kullanıcıya aittir.
