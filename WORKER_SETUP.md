# Repoya otomatik kayıt — Cloudflare Worker kurulumu ☁️

Şeyma 🦩 uygulaması verileri varsayılan olarak yalnızca cihazın tarayıcısında
(`localStorage`) tutar. Aşağıdaki kurulumu yaparsan, her değişiklik birkaç saniye
içinde **GitHub repoya JSON dosyası olarak** otomatik kaydedilir. Böylece:

- Veriler `data/` klasöründe birikir — sen (tasarımcı) GitHub'dan takip edebilirsin.
- Telefon/tarayıcı değişse bile kayıtlar güvende olur.
- Kimlik bilgisi (token) **uygulamada değil, Worker'da gizli** kalır — güvenli.

Yazılan dosyalar (seçtiğin branch'te):
- `data/latest.json` — her zaman en güncel tam veri.
- `data/seyma-YYYY-AA-GG.json` — o güne ait anlık kayıt.

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
