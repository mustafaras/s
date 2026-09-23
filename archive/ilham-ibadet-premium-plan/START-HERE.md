# Tek giriş — düşük bağlamlı oturum

> ### ⛔ ÖNCE OKU — 2026-09-22 denetimi
> 24/24 done beyanı **doğrulanabilir değil**: `plan-check.mjs` exit 1, `--self-test` exit 1,
> `.integration.py` exit 1, `tests/app` 13 FAIL. IIP-01…24 uygulama zinciri tamamlanmış sayılmaz.
> **Yeni bir oturum açıyorsan önce [DUZELTME-PROMPTLARI.md](DUZELTME-PROMPTLARI.md)** (P00→P17)
> programını oku ve seçtiğin düzeltme adımını uygula. Aşağıdaki IIP akışı ancak düzeltmelerden
> sonra yeniden anlamlıdır.

**Kullanıcı:** [UYGULAMA-PROMPTLARI.md](UYGULAMA-PROMPTLARI.md) dosyasındaki IIP-01 bloğunu yeni oturuma yapıştır. Bittikçe IIP-02…24. Yarım kalırsa aynı blok. Her seferinde bütün dosyayı yapıştırma.

**Ajan:** kök AGENTS ve roadmap'in ilgili teknik ilkelerini uygula; bu klasörün kısa AGENTS yönergesini ve yalnız seçili adımın brief çıktısını oku.

```sh
git -c core.fsmonitor=false status --short --branch
git -c core.fsmonitor=false log -1 --format='%H%n%s'
node ilham-ibadet-premium-plan/tools/plan-check.mjs
node ilham-ibadet-premium-plan/tools/session-brief.mjs IIP-01
```

`IIP-01` yerine kullanıcının seçtiği adımı yaz. Numara verilmemişse `session-brief.mjs --next` ilk bitmemiş adımı **önerir**; kendisi yetki vermez. Kullanıcı sıradaki tek adımı açıkça uygulamanı istemişse bu seçim onun yetkisi kapsamındadır.

Brief görev, durum, önkoşul, izinli dosya, kabul ve komutları birleştirir. Sonra yalnız listelenen ilgili şartname başlıklarını ve gerekli kodu oku. Örnek:

```sh
node ilham-ibadet-premium-plan/tools/session-brief.mjs --section specs/02-EKRAN-SARTNAMESI.md "S03 — Öncü okuyucusu"
```

## Varsayılan olarak yükleme

Tüm README/plan dosyaları, bütün state/ledger, TRACEABILITY/DAG, 24 kart, tam test logları ve geçmiş oturumlar. Bunlar ihtiyaç referansıdır. Görev gerektiren geniş tasarım/nihai denetim adımlarında ilgili kapsamı gerçekten oku.

## Kapanış

Kısa devir + gerçek gate kanıtı + state/ledger; pano üret ve `plan-check` çalıştır. Sonraki adımı kendiliğinden açma. Kaynak/cihaz/yayın kabulünü ayır. Hiçbir uygulama kartı bu rehber hazırlanırken başlamadı.
