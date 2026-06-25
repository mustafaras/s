# Repoya otomatik kayıt + uzaktan panel (özel/private veri)

Veriler **özel (private)** bir repoda saklanır; böylece öğün/mod/menstrüasyon
gibi kişisel kayıtlar **kimseye açık olmaz**. Uygulama (Pages) public kalır, o
yüzden **ek ücret yok** — private repodan Pages yayınlamıyoruz, sadece veri
saklıyoruz (private repolar GitHub'da ücretsiz). **Cloudflare/Worker gerekmez.**

## Kurulum

### 0) Özel veri reposunu oluştur (1 kez)
GitHub → **New repository** → ad: `seyma-data` → **Private** seç →
**Add a README** işaretle → **Create**. (Boş private repo; Pages açmana gerek yok.)

### 1) Token üret (1 dk)
GitHub → **Settings** → **Developer settings** → **Personal access tokens** →
**Fine-grained tokens** → **Generate new token**:
- Repository access → *Only select repositories* → `mustafaras/seyma-data`
- Permissions → Repository permissions → **Contents** → **Read and write**
- Oluştur, token'ı kopyala (`github_pat_...`).

> Aynı token hem uygulamada (yazma) hem panelde (okuma) kullanılabilir.

### 2) Uygulamaya bir kez gir (yazma)
Uygulama → **Ayarlar** → **Repoya bağlan**:
- Token'ı yapıştır (repo `mustafaras/seyma-data`, branch `main` hazır gelir)
- **Şimdi kaydet** → durum **"Repoya kaydedildi ✓"** olmalı.

Artık her değişiklik otomatik kaydolur. Şeyma token'ı hiç görmez. Token
**yalnızca o cihazın tarayıcısında** saklanır; repoya/sayfaya **yazılmaz**
(token gibi hassas alanlar kayıttan otomatik çıkarılır).

Yazılan dosyalar (`main` branch'i):
- `data/latest.json` — en güncel tam veri
- `data/gunluk/YYYY-AA-GG.json` — o güne ait anlık kayıt

## Uzaktan gözlem paneli 🖥️

Yayındaki panel:

> **https://mustafaras.github.io/s/panel.html**

Veri özel repoda olduğundan panel ilk açılışta **okuma token'ı** ister (yukarıdaki
token'ı kullanabilirsin). Token **senin tarayıcında** saklanır. Panel; streak, son
14 gün, 30 günlük trendler, alışkanlık oranları, mod dağılımı, adım/uyku grafiği,
döngü & sonraki regl tahmini ve bugünün öğün/mod/notunu gösterir; 5 dakikada bir
otomatik yenilenir.

Farklı repo/branch için: `panel.html?repo=kullanıcı/repo&branch=dal`

## Notlar
- Token sızarsa yalnızca `seyma-data` reposuna erişilir (uygulama kodu/siten ayrı
  public repoda). Token'ı bir yerde paylaştıysan GitHub'dan **Revoke** edip
  yenisini üret.
- Veriyi tekrar public yapmak istersen Ayarlar'daki repo alanını public bir repoya
  çevirmen yeterli (panel o durumda token istemeden de okuyabilir).
