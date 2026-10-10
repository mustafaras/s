# K3P — Kur'an Arapçası modalı: "Tezhip"

KAO2 ve KAO2-FIX'ten sonra gelen tasarım ve kalite programı. Plan v3, 2026-10-10. v3, **öğrenme akışını** önceliğe aldı.

- Kararların hepsi verildi (K-A…K-O).
- Henüz hiçbir kart uygulanmadı.
- Sıradaki prompt: **K3P-00**.

## Nasıl ilerlenir: prompt'ları tek tek ver

**En kolay yol:** Her yeni oturuma [STARTER.md](STARTER.md) içindeki metni yapıştır. Ajan sıradaki prompt'u kendisi bulur ve yalnız onu uygular.

1. Yeni bir oturum aç ve sıradaki prompt'u yazdır:

   ```bash
   node kao3-premium/araclar/senkron.mjs --sonraki
   ```

2. Çıktının tamamını kopyalayıp oturuma yapıştır. Her oturumda **tek prompt** ver.
3. Sırayı ve durumu görmek için:

   ```bash
   node kao3-premium/araclar/senkron.mjs --liste
   ```

   Sıradaki prompt `▶` ile işaretlidir.
4. Bir prompt yarıda kalırsa aynı prompt'u yeni bir oturumda tekrar ver. Devir notu kaldığı yerden
   sürdürür.

Prompt metinleri [PROMPTLAR.md](PROMPTLAR.md)'dedir (36 prompt). Uygulayıcının kuralları
[BAGLAM-YONETIMI.md](BAGLAM-YONETIMI.md)'dedir: açılış, bağlam bütçesi, kapanış, devir ve durma
koşulları.

**Hafıza (anti-amnezi):** Oturumlar arası hafıza dört dosyada tutulur:

- `K3P-STATE.json`
- `.anti-amnesia/CURRENT-STATE.md`
- `.anti-amnesia/LEDGER.md` (yalnız sona ekleme yapılır)
- `PROMPTLAR.md`

`senkron.mjs` bu dört dosyayı ve `git log`'u birbirine karşı denetler. Uyumsuzlukta prompt
başlamaz.

## Tez

Bugün uygulama bir **kelime kartı uygulaması**; içinde bir de Kur'an var. v2'de uygulama bir
**Mushaf sayfası**; kelime kartları o sayfayı aydınlatmanın aracı.

Bilinen her kelime sayfada altınla işlenir (tezhip). İlerleme kelime sayısıyla değil, **sayfada
aydınlanan anlamla** ölçülür.

## Okuma sırası

0. **[AKIS.md](AKIS.md)** — Öğrenme akışı: bugünkü ritmin ölçümü, akışın koşulları, 5 bölümlü "nefes" ritmi, uyarlanır zorluk, odak kuralları, hedefler ve H7–H9 hipotezleri.
1. **[ANALIZ.md](ANALIZ.md)** — Bulgular (B, E, T serileri), kök neden (§6), ölçüm tabanı (§7).
2. **[KARARLAR.md](KARARLAR.md)** — 10 karar ve kanıtları; önceden kayıtlı hipotezler H1–H6;
   kaynakça.
3. **[TASARIM.md](TASARIM.md)** — v2 tasarım: Tezhip sayfası, 3 perdelik ders, R1–R4 hatırlama
   merdiveni, görsel sistem, hareket grameri, bilerek yapılmayanlar.
4. **[KARTLAR.md](KARTLAR.md)** — 36 kart. Sıra: Dalga 0 (doğruluk) → **Dalga A (akış, 8 kart)** → görsel → Tezhip → öğrenme motoru → ödül → kapanış.
5. **`K3P-STATE.json`** — Taban, hedefler, kararlar, kart durumu, `nextCard`.

## Kararların özeti

| # | Karar |
| --- | --- |
| K-A | Okunuş: bağlamsal telaffuz, kelime sınırında bölünmüş: `bismi · llâhi · r-rahmâni · r-rahîm`. Kurallar: vasl → `i`, şemsî idgâm, vakf. s ≥ 21'de okunuş solar. |
| K-B | Yazı tipi: Scheherazade New (OFL), Arapça alt küme, `unicode-range`, ≤ 150 KiB |
| K-C | Geri bildirim üç kollu: hızlı doğru 600 ms, yavaş doğru 1,6 sn, yanlış tam kart. Mevcut kullanıcıya bir kez seçim sunulur. |
| K-D | Yeni `App.kao*` handler yok (45); mevcut eylem çoğaltıcılar kullanılır |
| K-K…O | Akış: uyarlanır zorluk bandı %70–92 · nefes ritmi (art arda ≤ 1 edilgin ekran) · overlay yerinde güncellenir ve toast ertelenir · "Kaldığın yerden · n/N" · oturum seçilen dakikaya sığar |
| K-E…J | Âyet eşiği %95 + merdiven · Bugün ≤ 5 seçim · Ders âyetle açılıp kapanır · Cezasız haftalık 5/7 · Tanıma ≤ %60 · Konuşma tanıma yok |

## Araçlar

Hepsi salt-okurdur ve ağsız `node:vm` içinde çalışır.

| Komut | Ne yapar |
| --- | --- |
| `node kao3-premium/araclar/cift-sik.cjs` | Çift şık taraması (B-01); bulgu varsa exit 1 |
| `node kao3-premium/araclar/okunus-denetim.cjs` | Vasl ve şemsî okunuş taraması (B-03); bulgu varsa exit 1 |
| `node kao3-premium/araclar/dokunus-olc.cjs [ders]` | Ders başına dokunuş, otomatik geçiş kapalı ve açık (K-C, H1) |
| `node kao3-premium/araclar/akis-olc.cjs [ders]` | Akış: açılıştan ilk soruya, ders ritmi, yarıda bırakıp dönme, yanlışlardan sonra uyum |
| `node kao3-premium/araclar/senkron.mjs [--sonraki \| --liste \| --prompt ID]` | Anti-amnezi uyumu; sıradaki prompt'un tam metni |
| `node kao3-premium/araclar/kapi-hizli.mjs --kart ID` | Her prompt'un kapısı: tests/kao, sözleşme fixture'ları, driver, etkin ölçü kapıları |
| `node kao3-premium/araclar/ekran-dok.cjs "$TMPDIR/kao3-ekran"` | 27 ekranın HTML dökümü ve yoğunluk tablosu |

## Sınırlar

- Çalışma yerel `kao3-premium` dalında yapılır.
- Push, deploy ve tag için kullanıcının açık onayı gerekir (K3P-27).
- `mustafaras/seyma-data` deposuna yazılmaz; gerçek tarayıcı profili ve token kullanılmaz.
- Görsel QA yalnız kullanıcı ekran görüntüsü isterse yapılır (K3P-00, K3P-26; CLAUDE.md kural 1).
- Kanıt düzeyleri ayrı raporlanır: kaynak/headless · görsel QA · cihaz kabulü. Bu klasördeki her
  ölçüm kaynak/headless düzeyindedir.
