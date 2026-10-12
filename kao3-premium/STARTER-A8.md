# K3P · K3P-A8 oturum başlatıcısı (Dalga A sonu)

**Bu dosya kimin için:** K3P-A8'i uygulayacak yeni oturumun **ilk mesajı** olarak yapıştırılır.
Genel başlatıcı [STARTER.md](STARTER.md)'dir; bu dosya **dalga sonu** ve **dar çalışma zamanı
bütçesi** uyarılarını ekler.

---

```text
K3P programındasın (Kur'an Arapçası modalı · "Tezhip"). Repo kökü: /Users/m_ras/Desktop/seyma

1. Önce kao3-premium/BAGLAM-YONETIMI.md belgesini oku. §1–§6 bağlayıcıdır.
2. Şunu çalıştır: node kao3-premium/araclar/senkron.mjs --sonraki
   Çıktıdaki prompt bu oturumun TEK görevidir. Beklenen kimlik: K3P-A8 ("Edilgin ekran bütçesi —
   D-4; Dalga A sonu"). Farklı bir kimlik çıkarsa uygulama, bana bildir.
3. Senkron UYUMSUZ derse ya da çalışma ağacı beklenmedik biçimde kirliyse DUR ve bana bildir.
4. Bu kart DALGA SONU: §3 kapanış protokolüne ek olarak
   `KAO2_ACCEPT_SLOW_HOST=1 bash tools/kapi/kapilar.sh` koş ve "TÜM KAPILAR YEŞİL" çıktısını gör.
   LEDGER'a Dalga A özeti yaz: AKIS §6 tablosunu yeniden ölçüp sayıları güncelle.
5. Bağlam yetmezse §4 devir protokolünü uygula: commit yok, devir notu yaz.

⚠️ KRİTİK BÜTÇE UYARISI (devralınan ölçüm, 2026-10-12):
- Çalışma zamanı 127,45 / 128 KiB → yalnız ~0,5 KiB pay kaldı (tests/kao/test_kao2_perf_budget.js).
- K3P-A8 sunum ağırlıklı bir karttır (içerik metni değişmez); yine de HER commit'ten önce
  `node tests/kao/test_kao2_perf_budget.js` ile runtime'ı ölç ve sayıyı LEDGER'a yaz.
- Pay yetmezse §5 gereği DUR ve tavan kararını bana sor. Kodu büyütmeden önce aynı işi gören
  eski kodu sil.

Kartın özü (prompt metnini senkron çıktısından oku, burası yalnız hatırlatma):
- `akis-olc.cjs` sözcük sayımı `<details>` içeriğini saymaz, yalnız `<summary>` sayar
  (ilk görünüm ölçüsü olduğunu yoruma yaz).
- Hedef + tanış + kavram ekranlarının ilk görünümü ≤ 45 sözcük; zirve (apply) muaftır.
- Fazlası yerel `<details><summary>Daha fazla</summary>…</details>` içine taşınır.
- Handler eklenmez; içerik metni değişmez, yalnız sunum.
- `<summary>` ≥ 44 px ve klavyeyle açılabilir olmalı; bunu `test_kao2_a11y` içine ekle.
- Kabul: `kapi-hizli --kart K3P-A8` yeşil + tam kapı "TÜM KAPILAR YEŞİL".

Değişmez kurallar:
- Push, merge ve deploy yok. Bunlar yalnız K3P-27'de, benim AÇIK onayımla yapılır. (Yayın
  onayını ben ayrıca veririm; sen kendiliğinden push etme.)
- Uygulamayı tarayıcıda açma (CLAUDE.md DATA SAFETY).
- mustafaras/seyma-data deposuna yazma.
- Token ya da parola isteme.
- Yeni App.kao* handler ekleme (45'te kalır); gerekiyorsa mevcut eylem çoğaltıcılarını kullan.
```

---

**İlerlemeyi görmek için:** `node kao3-premium/araclar/senkron.mjs --liste`
**Bu kartın tam metni:** `node kao3-premium/araclar/senkron.mjs --prompt K3P-A8`
**Dalga A'nın tamamı:** K3P-A1…A8 (A8 kapanışta dalga denetimi ve AKIS §6 ölçümünü yazar).
