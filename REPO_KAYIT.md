# Repoya otomatik kayıt + uzaktan panel

Şeyma 🦩 verileri varsayılan olarak yalnızca cihazın tarayıcısında tutulur.
Aşağıdaki **2 adımlık** kurulumla her gün otomatik olarak GitHub repoya yazılır
ve sen uzaktan izleyebilirsin. **Cloudflare/Worker gerekmez.**

## Kurulum (2 adım)

**1) Token üret (1 dk)**
GitHub → **Settings** → **Developer settings** → **Personal access tokens** →
**Fine-grained tokens** → **Generate new token**:
- Repository access → *Only select repositories* → `mustafaras/s`
- Permissions → Repository permissions → **Contents** → **Read and write**
- Oluştur, token'ı kopyala (`github_pat_...`).

**2) Uygulamaya bir kez gir**
Uygulama → **Ayarlar** → **Repoya bağlan**:
- Token kutusuna yapıştır (repo `mustafaras/s`, branch `data` hazır gelir)
- **Şimdi kaydet** → durum **"Repoya kaydedildi ✓"** olmalı.

Artık her değişiklik otomatik kaydolur. Şeyma token'ı hiç görmez; sen bir kez
girersin, gerisi otomatiktir. Token **yalnızca o cihazın tarayıcısında** saklanır,
repoya/sayfaya **yazılmaz** (token gibi hassas alanlar kayıttan otomatik çıkarılır).

Yazılan dosyalar (`data` branch'i):
- `data/latest.json` — en güncel tam veri
- `data/gunluk/YYYY-AA-GG.json` — o güne ait anlık kayıt

## Uzaktan gözlem paneli 🖥️

Yayındaki panel:

> **https://mustafaras.github.io/s/panel.html**

Bu salt-okunur sayfa `data/latest.json`'ı okuyup Şeyma'nın **streak'ini, son 14
gününü, 30 günlük trendlerini, alışkanlık oranlarını, mod dağılımını, adım/uyku
grafiğini, döngü & sonraki regl tahminini ve bugünün öğün/mod/notunu** gösterir.
5 dakikada bir otomatik yenilenir. Telefonundan açıp uzaktan izleyebilirsin.

Farklı repo/branch için: `panel.html?repo=kullanıcı/repo&branch=dal`

## Güvenlik & gizlilik notu

- Repo **herkese açık** olduğundan `data/` içindeki kayıtlar (öğün, mod,
  menstrüasyon vb.) **herkesçe okunabilir**. Gizli kalmasını istersen veriyi
  ayrı bir **private repoya** taşıyabiliriz (Ayarlar'daki repo alanını değiştirip
  o repoya yetkili bir token kullanmak yeterli).
- Token sızarsa yalnızca yetkilendirdiğin repoya yazılabilir; bu yüzden token'ı
  **sadece tek repoya + Contents iznine** scope'la. Token'ı bir yerde paylaştıysan
  GitHub'dan **Revoke** edip yenisini üret.
