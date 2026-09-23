# Riskler ve kontrol sahibi

| ID | Risk / tetikleyici | Önlem / fallback | Kart / rol | Kapanış kanıtı |
|---|---|---|---|---|
| R01 | Sunrise eski anlamı belirsiz | Mutation yok; tarihsel kayıt ayrı, oran yok | 03/14 domain | JSON eşitliği ve UI açıklaması |
| R02 | Görsel iyileştirme mevcut işlevi saklar | Entry matrisi ve eski handler kontratı | 01/08 reviewer | Envanter, fixture ve click path |
| R03 | Arka plan render okuma/not/video bozuyor | Yerel DOM; konum/kimlik assertion | 07/11 reader | Kesinti senaryosu |
| R04 | Yeni metnin kaynağı/hakkı eksik | Draft kalır; UI mevcut onaylı katalogla test | 16 editorial | İnsan inceleme receipt |
| R05 | Paylaşılan dosyada ajan çakışması | Tek writer, lock, integratör | tümü | State + devir + diff |
| R06 | SW kişisel yanıt cache'liyor | Allowlist, tokenlı URL dışlama | 22 platform | Olumsuz sentetik fixture |
| R07 | Eski istemci yeni alanı siliyor | Şema/merge/rollback tasarımı | 19/20 data | Eski istemci senaryosu |
| R08 | A bileşenleri B'de atılıyor | B hedef prototipi önce, ortak bileşen modeli | 02 design | Aynı token/bileşen kataloğu |
| R09 | PASS sadece markup varlığını ölçüyor | Eylem sonrası state/DOM doğrulama | 08/18/23 reviewer | TC somut sonuçları |
| R10 | 24 kartı büyüyen kapsamla bitirme baskısı | Change request; tahmin alanlara ayrılır | 24 integrator | Scope/final trace matrix |
| R11 | Kaynak HEAD aynı, dirty diff farklı | HEAD + diffHash + dosya hash manifesti | tümü | Kanıt üretim revizyonu |
| R12 | Prototip ve cihaz kabulü karışıyor | Receipt türü ve limitations zorunlu | 02/23 reviewer | Ayrı görsel/cihaz kaydı |

Riskin tabloda bulunması kapandığı anlamına gelmez. Şu an tümü planlanan kontrol seviyesindedir; uygulama kanıtı bekler.
