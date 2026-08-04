# ÆON Panel-v2 Premium — Context / Token Yönetimi

> Bu dosya, 40 promptluk uygulama boyunca context penceresini ve token bütçesini yönetmek için kullanılan kuralları içerir.  
> Her ajan, çalışmaya başlamadan önce mevcut context durumunu değerlendirmeli ve bu kurallara uymalıdır.

---

## Context Bütçesi

- **Model:** Claude Sonnet / kimi-k2.7-code:cloud (200K context window varsayılan)
- **Güvenli bölge:** Context kullanımı %70’i (≈140K tokens) geçmemeli
- **Sarı alarm:** %75 (≈150K tokens)
- **Kırmızı alarm:** %85 (≈170K tokens) — derhal `/compact` veya yeni oturum
- **Testli context:** Tüm test çıktıları, büyük HTML dump’lar ve uzun diffs context’i hızla doldurur

---

## Stratejik Compact Noktaları

Aşağıdaki geçişlerde `/compact` veya yeni oturum önerilir:

| Geçiş | Compact? | Neden |
|-------|----------|-------|
| Planlama → Uygulama | Evet | Araştırma/plan context’i yerine dosya tabanlı plan kalsın |
| Her 5 prompt sonrası | Evet | ~5 prompt = çok sayıda tool call + test çıktısı birikir |
| Faz değişimi (Faz 0 → Faz 1 gibi) | Evet | Fazların implementasyon detayları birbirine karışmasın |
| Hata ayıklama → Yeni özellik | Evet | Debug izleri yeni özellik context’ini kirletir |
| Büyük render/debug dump sonrası | Evet | HTML dump’lar binlerce token kaplar |
| Implementasyon ortasında | Hayır | Değişken isimleri, dosya yolları ve kısmi state kaybolabilir |

---

## Her Prompt İçin Context Rotasyonu

Her prompt, tek bir oturumda tamamlanabilir olmalı. Eğer prompt büyükse (örn. Prompt 18, 19, 20 sayfa yenilemeleri) şu rotasyonu kullan:

1. **Açılış:** Sadece `LEDGER.md`, `AGENT-CONTEXT.md`, ilgili Prompt bölümü.
2. **Keşif:** Gerekli dosyaları oku (genellikle `panel-v2.js/css/html`).
3. **Uygulama:** Değişiklikleri yap.
4. **Test:** Testleri çalıştır; çıktı büyükse sonuç özetiyle yetin, tam çıktıyı dosyaya yaz.
5. **Kapanış:** `HANDOFF-TEMPLATE.md` doldur, `LEDGER.md` güncelle.
6. **Compact:** Eğer context >%70 ise `/compact` ile yeni prompta geç, veya yeni oturum başlat.

---

## Faz Başına Tahmini Context Maliyeti

| Faz | Promptlar | Tahmini Token Maliyeti / Prompt | Notlar |
|-----|-----------|-----------------------------------|--------|
| Faz 0 | 1-6 | 8K-15K | CSS token ve animasyon, çok dosya okuma |
| Faz 1 | 7-12 | 10K-18K | Yeni komponentler, mevcut render fonksiyonları |
| Faz 2 | 13-17 | 12K-20K | SVG grafikler, sparkline hesaplama |
| Faz 3 | 18-23 | 15K-25K | Tüm sayfaların yeniden yazımı |
| Faz 4 | 24-27 | 8K-12K | Touch, responsive, bottom tab bar |
| Faz 5 | 28-35 | 15K-25K | Polling, event log, audit, notification lifecycle |
| Faz 6 | 36-38 | 8K-15K | Kontrast, a11y, performans |
| Faz 7 | 39-40 | 10K-18K | Test yazımı, QA, deploy |

---

## Ajanlar Arası Context Yönetimi

- **LEDGER.md:** Minimum 1K tokens — her ajan okur.
- **AGENT-CONTEXT.md:** ~2K tokens — yeni ajanlar okur.
- **HANDOFF-TEMPLATE.md:** ~500 tokens — prompt sonrası doldurulur.
- **04-40-PROMPT.md:** Prompt içeriğine göre değişken; her ajan sadece kendi promptunu okumalı.
- **Panel-v2.js:** ~8K-12K tokens — yalnızca ilgili render fonksiyonları okunmalı, tüm dosya okunmamalı.
- **Panel-v2.css:** ~3K-5K tokens — ilgili bölümler okunmalı.

---

## context-budget Skill Kullanımı

Eğer context şişkinliği hissedilirse:

```
/context-budget --verbose
```

Bu skill, ajan tanımları, skill’ler, kurallar ve MCP sunucularının token maliyetini özetler. Premium panel çalışması için gerekli minimum dışındaki ağır bileşenleri geçici olarak devre dışı bırakmayı düşün.

---

## unified-memory Skill Kullanımı

Eğer ajan değişimi zorunluysa veya uzun bir handoff gerekiyorsa:

1. `ecc memory save` ile el sıkışma kaydı oluştur (varsa `ecc-universal` kuruluysa).
2. Alternatif olarak `handoff-PROMPT-XX.md` dosyasını `.anti-amnesia/` altına yaz.
3. Her iki durumda da `LEDGER.md`’ye bağlantı/ID ekle.

Not: `ecc-universal` kurulu değilse sadece dosya tabanlı handoff yeterlidir.

---

## Token Tasarrufu İpuçları

1. **Büyük dosyaları parçalı oku:** `panel-v2.js`’in tamamını okuma; `grep_search` veya `read_file` ile ilgili fonksiyon aralığını oku.
2. **Test çıktılarını kısa tut:** Tüm test çıktısını mesaja yapıştırma; özet ve `PASS/FAIL` sayısı yeterli.
3. **HTML dump’ları dosyaya yaz:** `--dump` çıktılarını `/tmp/`’ye yaz, sadece ilgili satır aralığını oku.
4. **Yinelenen açıklamaları tekrar etme:** `AGENT-CONTEXT.md` zaten var; her promptta yeniden yazma.
5. **Kısa commit mesajları kullan:** Detay `HANDOFF-TEMPLATE.md`’de kalsın.

---

## Acil Durum: Context Kırmızı Alarm

Eğer context %85’i geçerse:

1. Derhal `task_complete` ile bitir veya `/compact` kullan.
2. `HANDOFF-TEMPLATE.md`’yi doldur (kısa tut).
3. `LEDGER.md`’yi güncelle.
4. Bir sonraki promptu yeni oturumda başlat.
5. Yeni ajanın ilk işi `LEDGER.md` + son `handoff-PROMPT-XX.md` dosyasını okumak olsun.

---

## Özet

- Hedef: Her prompt tek oturumda, context <%70 ile tamamlanacak.
- Her 5 promptta ve faz geçişlerinde `/compact` veya yeni oturum.
- Büyük dosyaları parçalı oku, test çıktılarını dosyaya yaz.
- `LEDGER.md` ve `handoff-PROMPT-XX.md` dosyaları context dışı durum taşıyıcısıdır.
