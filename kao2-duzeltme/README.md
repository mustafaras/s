# KAO2-FIX — Kur'an Arapçası modülü denetim düzeltmeleri

> **Durum:** K2F-00…42 tamam (43/44), sıradaki K2F-43 (YAYIN-2) · tekrar-uret 10/10 · kapanış belgesi [`deliverables/KAO2-FIX-KAPANIS.md`](deliverables/KAO2-FIX-KAPANIS.md)
> **Uygulayıcı:** Claude Sonnet 5.5 — her prompt ayrı oturum, tek commit.
> **Başlamak için:** [`PROMPTLAR.md`](PROMPTLAR.md) §0'daki oturum başlatıcıyı yeni bir oturuma yapıştır.
> **Makine durumu:** [`FIX-STATE.json`](FIX-STATE.json) · **Şu an:** [`.anti-amnesia/CURRENT-STATE.md`](.anti-amnesia/CURRENT-STATE.md) ·
> **Geçmiş:** [`.anti-amnesia/LEDGER.md`](.anti-amnesia/LEDGER.md) · **Bağlam kuralları:** [`BAGLAM-YONETIMI.md`](BAGLAM-YONETIMI.md)

## Neden bu program var

KAO2 (28 kart) "kapandı" olarak işaretlenmişti ama tam denetim **49 bulgu** çıkardı; dördü kritik ve
canlıda: ünite ustalığı hiç kaydedilmediği için kullanıcı Ünite 1'de kilitleniyor; gramer alıştırmalarının
%58'i yanlış eşleme öğretiyor; okuyamayan kullanıcının Seviye 0 yolu içeriksiz; Seviye 0 ekranı tanımsız
handler ve çökmeler yüzünden çalışmıyor. Ayrıntı ve kanıt: [`denetim/KUSUR-RAPORU.md`](denetim/KUSUR-RAPORU.md).

## Klasör haritası

| Yol | Ne |
|---|---|
| `PROMPTLAR.md` | 44 sıralı prompt + ortak protokol P1–P14 + bulgu eşlemesi + pin çizelgesi |
| `BAGLAM-YONETIMI.md` | Sonnet 5.5 oturumlarının okuma bütçesi, kontrol noktaları, yarıda kalma ve devir kuralları |
| `FIX-STATE.json` | Tek makine durumu: nextPrompt, prompt durumları, pinler, R durumları, kararlar |
| `.anti-amnesia/CURRENT-STATE.md` | Tek sayfa "şu an" (her prompt sonunda baştan yazılır) |
| `.anti-amnesia/LEDGER.md` | Yalnız eklenen kayıt defteri |
| `tools/fix-sync-check.mjs` | STATE ↔ CURRENT-STATE ↔ LEDGER ↔ PROMPTLAR ↔ koddaki pinler uyumu (`--repro`, `--clean`) |
| `tools/kapilar.sh` | Tüm kapıları tek komutla koşar, tek çıkış kodu verir |
| `denetim/KUSUR-RAPORU.md` | 49 bulgunun kanıtlı raporu |
| `denetim/DUZELTME-PLANI.md` | Düzeltme planı (KR-1…KR-7 kararları kabul edildi) |
| `denetim/tekrar-uret.cjs` | Kritik/yüksek bulguları yeniden üreten 10 kontrol (hedef 10/10 PASS) |
| `evidence/K2F-NN/` | Her promptun KANIT.md'si (ve yayın promptlarında YAYIN.md) |
| `deliverables/` | Kapanış belgesi (K2F-42) |

İlgili yerler: eski program `archive/kuran-ogreniyorum-v2/` (donmuş) · canlı içerik girdileri
`docs/kuran-ogreniyorum/kao2/content/` · inceleme sayfaları `docs/kuran-ogreniyorum/kao2/inceleme/`.

## Dalgalar

| Dalga | Promptlar | Amaç |
|---|---|---|
| W0 Hazırlık | K2F-00…04 | dal, plan-check, test düzeneği, handler fixture'ı, kabul testi yan etkisi |
| W1 Acil | K2F-05…18 | ustalık kilidi, gramer doğruluğu, Seviye 0, niyet · **YAYIN-1** (onay kapılı) |
| W2 İçerik | K2F-19…26 | başlık–kelime uyumu (G2 + L1 kullanıcı kapıları), Uygula adımı, tanış kartı, sûre bağlamı |
| W3 Arayüz | K2F-27…35 | tek başlık, odak modu, ayarlar, süre, küçük düzeltmeler |
| W4 Ölçüm | K2F-36…38 | kabul testi gerçek ölçüm, a11y matrisi, kalıcı denetim fixture'ı |
| W5 Kapanış | K2F-39…43 | temizlik, kayıtlar, kapanış · **YAYIN-2** (onay kapılı) |

## Değişmez kurallar (özet — tam hali PROMPTLAR.md §1)

1. Tarayıcı/sunucu yok, `seyma-data`'ya yazım yok (CLAUDE.md DATA SAFETY).
2. Tek prompt = tek oturum = tek commit; sıradaki promptu yalnız `FIX-STATE.json` söyler.
3. Test önce ve davranışla; durumu elle kurup davranışı atlayan test yasak.
4. Motor (FSRS, kuyruk kuralları), `migrate()` ve kullanıcı verisi korunur; yalnız ekleme ve normalizasyon.
5. Arapça içerik elle yazılmaz; yalnız içerik modülleri ve araç çıktısı.
6. Push/deploy yalnız YAYIN promptlarında ve açık kullanıcı onayıyla.
7. Her prompt sonunda `kapilar.sh` yeşil ve `fix-sync-check --repro` PASS; `tekrar-uret` PASS sayısı hiç azalmaz.

## Kullanıcıdan beklenecekler

- **K2F-18 / K2F-43:** yayın onayı ("YAYIN-1 onaylı" / "YAYIN-2 onaylı" ya da "ertele").
- **K2F-20:** yeni müfredat eşlemesinin onayı ("G2 onaylı").
- **K2F-22:** inceleme sayfasındaki metin kutularını işaretleme ve "L1 işaretlendi".
- Program sonunda: cihaz kabulü (A-11/A-12), ekran okuyucu turu, L2 listeleri, K-3 ses kayıtları.
