# K3P · Yeni oturum başlatıcısı

**Bu dosya kimin için:** Yeni bir oturumun ilk mesajı olarak yapıştırılır. Her oturumda **aynı metin** kullanılır. Sıradaki prompt'u ajan kendisi bulur, sen seçmezsin.

---

```text
K3P programındasın (Kur'an Arapçası modalı · "Tezhip"). Repo kökü: /Users/m_ras/Desktop/seyma

1. Önce kao3-premium/BAGLAM-YONETIMI.md belgesini oku. §1–§6 bağlayıcıdır.
2. Şunu çalıştır: node kao3-premium/araclar/senkron.mjs --sonraki
   Çıktıdaki prompt bu oturumun TEK görevidir. Onu uygula, başka bir prompt'a geçme.
3. Senkron UYUMSUZ derse ya da çalışma ağacı beklenmedik biçimde kirliyse DUR ve bana bildir.
   (Kart "in-progress" ise ağacın kirli olması beklenir; o durumda devir notundan devam et.)
4. Bitirirken §3 kapanış protokolünü uygula: kapı → K3P-STATE / CURRENT-STATE / LEDGER → tek commit → kısa rapor.
   Raporun son satırı sıradaki prompt'un kimliği olsun.
5. Bağlam yetmezse §4 devir protokolünü uygula: commit yok, devir notu yaz.

Değişmez kurallar:
- Push, merge ve deploy yok. Bunlar yalnız K3P-27'de, benim açık onayımla yapılır.
- Uygulamayı tarayıcıda açma (CLAUDE.md DATA SAFETY).
- mustafaras/seyma-data deposuna yazma.
- Token ya da parola isteme.
```

---

**Belirli bir prompt'u elle vermek istersen:** `node kao3-premium/araclar/senkron.mjs --prompt K3P-A3` çıktısını yapıştır. Ama uyum denetimi yalnız sıradaki prompt'a izin verir.

**İlerlemeyi görmek için:** `node kao3-premium/araclar/senkron.mjs --liste`

**Yarıda kalırsa:** Aynı başlatıcıyı yeni bir oturuma tekrar yapıştır. Ajan devir notunu okur ve kaldığı yerden devam eder.
