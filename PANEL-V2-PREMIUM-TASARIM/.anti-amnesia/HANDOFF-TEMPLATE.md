# Handoff Şablonu — ÆON Panel-v2 Premium

> Her prompt tamamlandığında bu şablonu kopyalayıp `.anti-amnesia/handoff-PROMPT-XX.md` olarak kaydet.  
> XX yerine ilgili prompt numarasını yaz (örn. `handoff-PROMPT-01.md`).

---

## Prompt Bilgisi

- **Prompt No:** `XX`
- **Prompt Kısa Adı:** *(örn. Renk Paleti & Tasarım Token’ları)*
- **Uygulayan Ajan:** *(örn. GitHub Copilot / kimi-k2.7-code:cloud)*
- **Tarih:** YYYY-MM-DD
- **Oturum ID:** *(isteğe bağlı)*
- **Başlangıç Commit:** `704da96` veya önceki handoff commit’i
- **Bitiş Commit:** `git rev-parse HEAD` değeri

---

## Yapılanlar

- [ ] Ana görev tamamlandı
- [ ] Tüm alt maddeler tamamlandı
- [ ] Testler çalıştırıldı
- [ ] Commit yapıldı
- [ ] Push yapıldı (her 5 promptta bir zorunlu)

### Özet

*(2-3 cümle ile bu promptta ne yapıldığını yaz.)*

### Değiştirilen Dosyalar

- `panel-v2.css` — *(değişen bölümler)*
- `panel-v2.js` — *(değişen fonksiyonlar)*
- `panel-v2.html` — *(varsa)*
- `panelCoverageManifest.js` — *(varsa)*
- `tests/...` — *(varsa)*

### Önemli Teknik Kararlar

| Karar | Gerekçe |
|-------|---------|
| *(örn. Yeni token adlandırması)* | *(neden bu isimlendirme)* |
| *(örn. Bir fonksiyon neden refactor edildi)* | *(neden)* |

---

## Test Sonuçları

```text
Çalıştırılan testler:
- node tests/test_panel_v2_xxx.js  → PASS / FAIL
- node tests/test_panel_v2_yyy.js  → PASS / FAIL
- for f in tests/test_panel_v2_*.js; do node "$f"; done  → X/X PASS
```

### Hatalar ve Çözümleri

*(Eğer hata varsa, neydi ve nasıl çözüldü.)*

---

## Sıradaki Adım

- **Bir sonraki prompt:** `XX + 1`
- **Tahmini risk:** *(örn. Bağımlı olduğu önceki adım stabil mi?)*
- **Öneri:** *(Bir sonraki ajana kısa tavsiye.)*

---

## Context / Token Notu

- Bu prompt sonundaki context kullanımı: *(örn. ~45K / 200K)*
- `/compact` önerisi: Evet / Hayır
- Yeni oturum önerisi: Evet / Hayır

---

## Ek Notlar

*(Kullanıcı geri bildirimi, dikkat edilmesi gereken edge case, görsel notlar, vb.)*
