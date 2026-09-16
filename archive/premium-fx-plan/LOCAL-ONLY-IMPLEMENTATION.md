# Şeyma Premium FX Planı — Yerel-Only Uygulama Kuralı

**Sürüm:** 1.0  
**Tarih:** 2026-08-31  
**Geçerlilik:** Bu kural, `premium-fx-plan`'ın uygulama aşaması (`Faz -1` ile `Faz 6` arası) boyunca geçerlidir. Plan/spec/test aşaması bu kuraldan etkilenmez.

---

## 1. Amaç

`seyma` uygulaması statik GitHub Pages üzerinden yayında (`main` dalına her push deploy eder) ve `mustafaras/seyma-data` reposunda canlı kullanıcı verisi tutar. Premium FX uygulaması, canlı siteyi veya canlı veriyi asla etkilememek için **sadece yerel commitlerle** ilerleyecektir.

---

## 2. Yerel-Only Kuralı

### 2.1 Temel Kural

Uygulama aşamasında oluşturulan tüm commitler yalnızca yerel `.git` geçmişinde kalır. Aşağıdaki eylemler yasaktır:

- `git push` (herhangi bir remote'a)
- Pull request açmak
- `git merge` sonrası `main`'e göndermek
- GitHub Pages deploy'ını tetikleyen herhangi bir işlem
- `mustafaras/seyma-data` reposuna yazmak
- Tarayıcıdan canlı `seyma` sitesine veri göndermek veya `forceSync=1` kullanmak

### 2.2 İzin Verilen Yerel İşlemler

- `git status`, `git diff`, `git log`
- `git add` + `git commit` (yerel)
- Yerel branch oluşturmak/atmak: `git checkout -b premium-fx-local`
- `git stash`, `git reset --soft`, `git rebase -i` (yalnızca yerel geçmişte)
- Headless testleri çalıştırmak
- `node --check` ile sözdizimi kontrolü
- Port `127.0.0.1:9000` üzerinde tek kullanımlık, redakteli, agent-kontrollü görsel QA (DATA SAFETY kurallarına uyarak)

### 2.3 Yasak Olmayan Ama Dikkatli Olunan Şeyler

- `premium-fx-plan` klasöründeki belge güncellemeleri bu kuralın dışındadır; bunlar normal şekilde commitlenebilir (ancak yine de push yapılmadan önce onay alınmalıdır).
- Test fixture'larının `tests/app/` altına eklenmesi uygulama koduna dokunmadığı için plan aşamasında da yapılabilir.

---

## 3. Günlük Çalışma Akışı

Her uygulama oturumunda aşağıdaki sıra izlenir:

1. **Önce belge oku:**
   - [`.anti-amnesia/CURRENT-STATE.md`](.anti-amnesia/CURRENT-STATE.md)
   - [`.anti-amnesia/LEDGER.md`](.anti-amnesia/LEDGER.md)
   - [NEXT-STEPS.md](NEXT-STEPS.md)
   - İlgili Faz spec'i (`deliverables/SPEC-FAZ-*.md`)
2. **Yerel branch kontrolü:** `git status` ile `premium-fx-local` veya `main` üzerinde olunduğundan emin ol.
3. **Uygula:** Sadece planlanan dosyaları değiştir.
4. **Test et:** İlgili headless fixture'ları çalıştır.
5. **Yerel commit yap:** Kısa, açıklayıcı, Türkçe commit mesajı (örn. `Faz -1: dateUtils.js ve helpers.js ayrıldı`).
6. **Durum güncelle:** `CURRENT-STATE.md`, `LEDGER.md`, `NEXT-STEPS.md`'de ilerlemeyi işaretle.
7. **Kullanıcıya özet sun:** Ne değişti, hangi testler geçti, ne bekleniyor.
8. **Push yapma.**

---

## 4. Yanlışlıkla Push Olursa

Eğer bir commit yanlışlıkla push edilirse:

1. Hemen kullanıcıya bildir.
2. Canlı siteyi etkilememişse ve sadece `premium-fx-plan` belgeleri içeriyorsa, geri alma stratejisi belirle.
3. Uygulama kodu veya `seyma-data` etkilendiyse kurtarma planı (`CLAUDE.md` §"Recovery") devreye girer.
4. `LOCAL-ONLY-IMPLEMENTATION.md` kuralını tekrar vurgula.

---

## 5. Onay Kontrol Listesi

Uygulama aşamasına geçmeden önce aşağıdaki maddelerin onaylanması gerekir:

- [ ] Kullanıcı, Faz -1 uygulamasına başlamak için açık onay verdi.
- [ ] Çalışma dalı yerel (`premium-fx-local` veya `main` üzerinde ama push yok).
- [ ] `seyma-data` reposuna yazılması gereken senaryo yok.
- [ ] Test güvenlik ağı (headless fixtures) hazır ve çalışıyor.
- [ ] Her oturum sonunda `CURRENT-STATE.md` + `LEDGER.md` güncellenecek.

---

## 6. İlgili Belgeler

- [PLAN.md](PLAN.md) — vizyon, ilkeler, fazlar
- [ROADMAP.md](ROADMAP.md) — fazlı uygulama sırası
- [API-TRANSITION-GUIDE.md](API-TRANSITION-GUIDE.md) — modül API yüzeyleri
- [DEEP-IMPLEMENTATION-GUIDE.md](DEEP-IMPLEMENTATION-GUIDE.md) — atomik adımlar
- [SAFEGUARDS.md](SAFEGUARDS.md) — veri güvenliği ve erişilebilirlik
- [CLAUDE.md](../CLAUDE.md) — repo kök veri güvenliği kuralları
