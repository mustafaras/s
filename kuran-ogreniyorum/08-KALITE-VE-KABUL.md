# 08 — Kalite ve kabul

## Kanıt düzeyleri (CLAUDE.md kural 7)

| Düzey | Ne sayılır | Ne sayılmaz |
|---|---|---|
| Kaynak/test | `node --check`, `tests/kao/*`, driver/zikr-harness, shell-inventory gate, kontrast ölçümü | "Çalışıyor gibi" |
| Yerel görsel QA | Yalnız CLAUDE.md kural 1 istisnasıyla (127.0.0.1:9000, tek kullanımlık profil, token yok, forceSync yok, server durdurulur) | localhost'ta gerçek veriyle açma |
| Cihaz kabulü | Kullanıcının telefonda gerçek kullanımı (K3) | Ajan beyanı |
| Yayın | Push/deploy/tag ayrı onay | — |

## Pedagojik kabul ölçütleri (yerel `daily` verisiyle, 4 hafta sonra)

| Ölçüt | Hedef |
|---|---|
| Tekrar doğruluğu (review kartlar) | %85–92 (0,90 hedefinin etrafında; >%95 = çok kolay, <%80 = yük fazla) |
| Günlük süre medyanı | 7–12 dk |
| Kapsam ilerlemesi | 4. hafta sonunda ≥%35 (Ünite 1–3) |
| Terk | 7 gün ardışık boşluk oranı raporlanır; yargı yok |
| Gecikmeli sûre testi (7 gün, 5 soru; R-C6) | ≥4/5 |
| Tutunma eğrisi (R-A3) | 2 ve 6 haftalık gerçek doğruluk, FSRS öngörüsüne göre kalibrasyon farkı ≤ %5 (10 R-bandı) |
| Gece tekrarı etkisi (R-A1) | Raporlanır; hedef koyulmaz (gözlem) |

Ölçüt tutmazsa **içerik/algoritma parametresi** ayarlanır (dailyNew,
çeldirici zorluğu), kullanıcı suçlanmaz.

## Üç kullanıcı görevi (R-C9) — her kapanışta

| Görev | Ölçüt |
|---|---|
| (a) Bugünkü oturuma başlama | Hub kartından ≤2 dokunuş, headless ≤3 adım; cihazda ≤90 sn |
| (b) Kelime kartından kök ağacına | 2 dokunuş (üç dokunuş kuralı) |
| (c) Ses kapalı tam oturum | Hiçbir görev sese bağımlı değil; oturum biter |

## Teknik kapılar (her kartta)

- `node --check` ilgili dosyalar.
- `node .claude/skills/run-seyma/driver.mjs` ve `zikr-harness.mjs` exit 0.
- `node tests/app/test_state_rebind_boundary.js` (yükleme listeleri eşit).
- `tests/kao/*` yeşil; içerik fixture'ı `verified:false` satırda **fail**.
- `node tools/shell-inventory.mjs --gate` PASS (app.js shim bütçesi ≤ +30 satır).
- fx2 fixture'ları güncel pinle yeşil; `fx-coverage --gate`'in M7 tavanı bilinir
  (`$?` boru sonrası okunmaz).
- Kontrast: KAO çiftleri `verify-contrast.mjs` kalıbıyla ölçülür, tablo kartta.

## Erişilebilirlik kontrol listesi

- Dialog/aria-modal, Tab/Shift+Tab/Escape, odak dönüşü (fixture).
- Çip ≥44×44, odak halkası 3:1, doğru/yanlış renk+simge+metin.
- `lang="ar" dir="rtl"`, hareke kırpılmıyor (satır 1.9–2.1), letter-spacing yok.
- `aria-live="polite"` görev sonucu; okuyucuda kapalı kelime etiketi.
- `prefers-reduced-motion` + uygulama ayarı → animasyon yok.

## İçerik doğruluğu kapısı

- Her lemma `verifiedBy` + `verifiedAt`; toplu bayrak yok.
- Anlam: sözlük düzeyi; tefsir hükmü yok; tartışmalı yerde not.
- Diyanet imlâsı; transliterasyon tek tablo.
- Bir hata bildiriminde (kullanıcı "yanlış" der) kart `flagged:true` → sonraki
  içerik sürümünde düzeltme; runtime'da düzeltme yok (içerik donmuş).
