# Kontrollü yerel görsel QA — auth kapısı

**Tarih:** 2026-09-22 · **Kapsam:** `127.0.0.1:9000` (proje `CLAUDE.md` DATA SAFETY istisnası) · **Araç:** ajan kontrollü tarayıcı

## Seviye ayrımı (KRİTİK — karıştırılmamalı)

| Seviye | Kapsam | Durum |
|---|---|---|
| 1 · Kaynak/headless VM | 154 fixture + 7 araç | ✅ |
| **2 · Yerel görsel QA (bu dosya)** | Masaüstü tarayıcı, auth kapısı, koyu tema | ✅ |
| 3 · Cihaz (kullanıcı) | iPhone Safari/PWA + Android Chrome + klavye/ekran okuyucu | ✅ `user_attested` |
| 4 · Yayın | Pages deploy | ✅ |

> Bu seviye **2**'dir. Proje kuralı (kök `CLAUDE.md`): *"Capture only redacted local
> screenshots, report them **separately from device acceptance**."*
> Masaüstü tarayıcı ölçümü cihaz kabulünün **yerine geçmez**; cihaz kabulü zaten
> kullanıcı beyanıyla (`deviceAcceptance=user_attested`) kayıtlıdır.

## Güvenlik ön koşulları (hepsi doğrulandı)

| Ön koşul | Sonuç |
|---|---|
| Guard 1 kaynağı okundu (`sync.js:1033-1037`) | ✅ yerel kökenden push engelli |
| Guard 1 fixture'ı (`test_local_visual_qa_guard.js`) | ✅ PASS |
| Port yalnız `127.0.0.1:9000` | ✅ (`--bind 127.0.0.1`) |
| URL'de `forceSync=1` | ✅ **yok** |
| `localStorage['seyma-sync-force']` | ✅ **`null`** |
| Kullanıcı profili / gerçek hesap | ✅ **kullanılmadı** (disposable, boş profil) |
| `ghToken` localStorage'da | ✅ **yok** |
| Eski `seyma-reset-v1` verisi | ✅ **yok** — yalnız `seyma-v3-welcome-v1` |
| Token/parola/2FA alanı okundu veya dolduruldu mu? | ✅ **HAYIR** (auth kapısında duruldu) |
| Sunucu tur sonunda kapatıldı | ✅ `9000 KAPALI`, çalışan process yok |

**Auth kapısında duruldu:** parola alanı doldurulmadı. Kök kural (madde 6):
*"Never use browser automation to read or fill token, password, GitHub, Apps
Script, or 2FA fields."* Bu, gerçek hesap gerektiren tüm senaryoları (İlham &
İbadet sekmesi, yolculuk, rapor) kapsam dışı bıraktı — onlar için kanal
**headless VM harness'ları** (154 fixture) ve **kullanıcı cihaz teyidi**dir.

## Ölçülen sonuçlar (auth kapısı, koyu tema)

| Kontrol | Beklenen | Ölçülen | Sonuç |
|---|---|---|---|
| Sayfa yükleme | hatasız | **0 konsol mesajı, 0 pageerror** | ✅ |
| Auth kapısı render | `.sey-auth-backdrop` + `.sey-auth-card` | ikisi de mevcut | ✅ |
| `#app` çocuk sayısı | 1 (kapı) | 1 | ✅ |
| `#root` stil | tam ekran + token'lar | `min-height:100dvh; height:100dvh; display:flex; background:var(--page)` | ✅ |
| `--page` token'ı | koyu | `#000000` | ✅ |
| `--accent` token'ı | champagne gold | `#E3C08A` | ✅ |
| `data-theme` | dark | `dark` | ✅ |
| Odaklanabilir öğe | 3 (kullanıcı, parola, giriş) | 3, doğru sırada | ✅ |
| Backdrop odaklanabilir mi? | **HAYIR** | `tabindex` **yok**, `role` **yok** | ✅ |
| "Beni hatırla" | span + `onclick="App.toggleRememberAuth()"` | aynı | ✅ |
| Görsel (ekran görüntüsü) | koyu zemin + altın accent + kart | eşleşiyor | ✅ |

### Temiz yeniden yükleme testi

`page.reload()` sonrası: "Beni hatırla" **☐** (işaretsiz), konsol **0 mesaj**,
`ghToken` **yok**, `seyma-sync-force` **null**, yalnız `seyma-v3-welcome-v1`.
Önceki gözlemde görülen ☑ işareti **benim DOM sorgularımın yan etkisiydi**,
uygulama kusuru değil — bu yanlış bulgu raporlanmadı.

## Kapsam dışı (bu seviyede doğrulanamadı)

- İlham & İbadet sekmesi ve tüm iç yüzeyler → auth kapısı
- p50/p95 ölçümü (yerel; zaten VM'de ölçüldü: p50 0.43–0.62 ms, p95 1.14–1.48 ms)
- Açık (light) tema → koyu tema görüldü; açık tema headless fixture'larda kapsanıyor
- Gerçek ekran okuyucu, gerçek GPS, PWA kurulumu

## Sonuç

Yerel görsel QA **seviye 2** geçti: auth kapısı koyu temada doğru render ediyor,
konsol temiz, token'lar doğru, backdrop odaklanabilir değil (modal sözleşmesi),
localStorage tertemiz. Cihaz kabulü ayrı kalır ve zaten kullanıcı beyanıyla kayıtlıdır.
