# IIP-24 — Teslim ve yayın adayı · görsel kanıt

**Kart:** IIP-24 · **Tarih:** 2026-09-22 · **HEAD:** `bc4372fb02d42f89521740569195f0133dc5ee2a`

## Kapsam

Bu makbuz IIP-24 teslim kartının **görsel** gate'ini, kartın kendi
izlenebilirlik sözleşmesiyle (REQ-047/048) uyumlu biçimde kaydeder. IIP-23'ün
görsel kanıtını (8 sahnelik sentetik render matrisi: boş / yükleniyor / hata /
dönüş durumları) miras alır; yeni bir ekran üretmez.

## Temalar ve görünümler

| Eksen | Değer |
|---|---|
| Temalar | light, dark |
| Görünümler | 375px, 390px, 430px |
| Veri | sentetik (kişisel veri okunmadı, ağ kapalı) |

## Gözlem

- `evidence/IIP-23/visual.json` üç hedef için **kullanıcı-beyanı** kaydı taşır
  (iPhone Safari/PWA, Android Chrome, klavye/ekran okuyucu).
- IIP-23 ledger `seq 48` aynı teyidi yazar.
- 16 IIP fixture'ı ve `tests/app` ailesinin tamamı yeşildir; görsel sözleşmeler
  (stil, odak, reduced-motion, kontrast) kaynak düzeyinde doğrulanır.

## KANIT SINIRI — kapatılmamış

| Konu | Durum | Neden |
|---|---|---|
| Cihaz kabulü | **not_verified** | Cihaz onayını yalnız kullanıcı verebilir. IIP-23 makbuzu ve ledger'daki teyit **kullanıcı beyanıdır**; ajan onu doğrulayamaz ve doğrulanmış sayamaz. |
| Hedef cihaz p95 ≤ 200 ms | **ölçülmedi** | Yalnız yerel VM ölçümü var (p50 0.43–0.62 ms, p95 1.14–1.48 ms · `IIP-PERF-LOCAL.json`). Masaüstü Node VM cihaz hızı kanıtı değildir. Protokol: `IIP-PERF-PROTOKOL.md`. |
| Gerçek ekran okuyucu testi | **ajan tarafından yapılmadı** | Ajan tarayıcı/cihaz otomasyonuyla doğrulamaz (kök kural). |

Bu sınırlar kapatılmış gibi raporlanamaz. Görsel gate yalnız **kaynak/sentetik**
seviyeyi kapsar; cihaz ve yayın seviyeleri ayrı kalır.
