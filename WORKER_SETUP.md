# Repoya otomatik kayıt 💾

Şeyma 🦩 verileri varsayılan olarak yalnızca cihazın tarayıcısında (`localStorage`)
tutar. Aşağıdaki yöntemlerden biriyle her değişiklik birkaç saniye içinde
**GitHub repoya JSON dosyası olarak** otomatik kaydedilir:

- `data/latest.json` — her zaman en güncel tam veri
- `data/seyma-YYYY-AA-GG.json` — o güne ait anlık kayıt

İki yöntem var. **Çoğu kişi için Yöntem A yeterli ve çok daha kolay.**

---

## ⭐ Yöntem A — Doğrudan GitHub (Worker YOK, 2 adım)

Uygulama veriyi tarayıcıdan **doğrudan** GitHub'a yazar. Cloudflare gerekmez.

**1) Token üret (1 dk):**
GitHub → **Settings** → **Developer settings** → **Personal access tokens** →
**Fine-grained tokens** → **Generate new token**.
- Repository access → *Only select repositories* → `mustafaras/s`
- Permissions → Repository permissions → **Contents** → **Read and write**
- Oluştur, token'ı kopyala (`github_pat_...`).

**2) Uygulamaya gir:**
Uygulama → **Ayarlar** → **Doğrudan GitHub (Worker yok)** kartı:
- Token kutusuna token'ı yapıştır
- Repo: `mustafaras/s` (hazır gelir) · Branch: `data` (hazır gelir)
- **Şimdi kaydet ⬆️** → durum **"Repoya kaydedildi ✓"** olmalı.

Bundan sonra her değişiklik otomatik kaydolur. Verileri görmek için:
GitHub repo → branch **`data`** → `data/latest.json`.

> **Güvenlik notu:** Token yalnızca **bu cihazın tarayıcısında** saklanır; repoya
> veya sayfaya yazılmaz, kimseyle paylaşılmaz. Yine de token sızarsa bu repoya
> yazılabilir — bu yüzden **sadece `mustafaras/s` reposuna ve sadece Contents
> iznine** sahip fine-grained token kullan. Token'ı tamamen sunucuda gizlemek
> istersen Yöntem B'ye geç.

---

## ☁️ Yöntem B — Cloudflare Worker (token'ı sunucuda gizler)

Token'ın cihazda bile durmasını istemiyorsan, araya küçük bir Worker koyarsın;
token Cloudflare'de secret olarak kalır. Aşağıdaki adımlar bunun içindir.

Kimlik bilgisi (token) **uygulamada değil, Worker'da gizli** kalır.

---

## 1) GitHub token (fine-grained PAT) oluştur

1. GitHub → **Settings** → **Developer settings** → **Personal access tokens** →
   **Fine-grained tokens** → **Generate new token**.
2. **Repository access** → *Only select repositories* → `mustafaras/s`.
3. **Permissions** → **Repository permissions** → **Contents** → **Read and write**.
4. Oluştur ve token'ı kopyala (`github_pat_...`). Bir daha gösterilmez.

## 2) `data` branch'ini oluştur (önerilir)

Pages siteni her kayıtta yeniden derlememek için veriyi ayrı bir branch'e yazıyoruz:

```bash
git checkout --orphan data
git rm -rf .            # boş bir branch
git commit --allow-empty -m "data branch"
git push -u origin data
git checkout main
```

> İstersen bu adımı atlayıp `GH_BRANCH=main` da kullanabilirsin; o zaman her kayıt
> Pages dağıtımını tetikler (kişisel kullanım için sorun değil ama gürültülü olur).

## 3) Cloudflare Worker oluştur

1. [dash.cloudflare.com](https://dash.cloudflare.com) → **Workers & Pages** →
   **Create** → **Create Worker**. Bir isim ver (örn. `seyma-sync`) → **Deploy**.
2. **Edit code** → açılan editöre bu depodaki **`cloudflare-worker.js`** dosyasının
   içeriğini yapıştır → **Deploy**.

## 4) Değişkenleri / secret'ı tanımla

Worker → **Settings** → **Variables and Secrets**:

| Ad | Tür | Değer |
|----|-----|-------|
| `GITHUB_TOKEN` | **Secret** | 1. adımdaki token |
| `GH_OWNER` | Text | `mustafaras` |
| `GH_REPO` | Text | `s` |
| `GH_BRANCH` | Text | `data` |
| `ALLOWED_ORIGIN` | Text | `https://mustafaras.github.io` |

> `ALLOWED_ORIGIN`, uygulamanın açıldığı adrestir (yalnızca şema + alan adı, sonuna
> `/` veya yol koyma). Özel alan adı kullanıyorsan onu yaz. Emin değilsen geçici
> olarak `*` koyabilirsin ama açık adres daha güvenlidir.

**Deploy** et. Worker adresini kopyala — şuna benzer:
`https://seyma-sync.<hesabın>.workers.dev`

## 5) Uygulamaya adresi gir

Uygulama → **Ayarlar** → **Repoya otomatik kayıt** → kutuya Worker adresini yapıştır.
Altındaki durum satırı **"Repoya kaydedildi ✓"** olunca çalışıyor demektir.
**Şimdi gönder ⬆️** ile elle de tetikleyebilirsin.

## 6) Verileri görüntüle

GitHub'da repo → **branch: `data`** → `data/latest.json` ve `data/seyma-*.json`.

---

### Sık sorulanlar

- **Token sayfada görünür mü?** Hayır. Uygulama yalnızca Worker adresini bilir;
  token Cloudflare'de secret olarak durur.
- **Sync hatası görüyorum.** Ayarlar'daki durum satırı HTTP kodunu yazar:
  `401/403` → token izni/yetkisi; `404` → owner/repo/branch yanlış veya `data`
  branch'i yok; `CORS` → `ALLOWED_ORIGIN` adresi sayfanın adresiyle birebir aynı değil.
- **Sync'i kapatmak istiyorum.** Ayarlar'daki adres kutusunu boşalt; veriler yine
  cihazda tutulmaya devam eder.
