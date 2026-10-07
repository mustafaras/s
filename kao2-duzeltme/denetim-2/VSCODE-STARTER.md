# VS Code devir notu · denetim-2 (2026-10-07, D2F-06 + seq 10 NOTE sonrası)

Bu not bir **sonraki oturum** içindir. Yeni oturum önce §1'i koşar, sonra §6'daki cümleyi yapıştırır.

## 1. Konumu doğrula (önce oku)
```bash
cd <yerel-klasör>
git status                       # temiz olmalı; değilse önce yedekle, reset --hard kullanma
git branch --show-current        # d2f-05 olmalı
git log --oneline -3             # en üstte: 8e583a93 denetim-2: … , 79eca899 D2F-06: …
node kao2-duzeltme/denetim-2/tools/d2f-sync-check.mjs --clean   # PASS, "6/16 prompt done · nextPrompt D2F-07 · ledger seq 10"
```
- **Uzak geride kaldı (bilerek):** `main` = `origin/main` = `59abe97b` (D2F-04 YAYIN, pin `20261007a`, canlı).
  **D2F-05 (`467ab6fa`), D2F-06 (`79eca899`) ve seq 10 NOTE (`8e583a93`) henüz push edilmedi** — yalnız bu yerel deponun
  `d2f-05` dalında. Yeni oturum uzak kopyadan başlıyorsa bunları **görmez**; önce bu yerel depoyu kullan ya da `d2f-05`'i buradan al.
- Yeni prompt için yeni dal: `git switch -c d2f-07` (temel: `d2f-05`). `main` geçmişi yeniden yazılmaz; `push --force`,
  `reset --hard`, `git stash` yok (§1). Prompt bitince yalnız kendi commit'ini at; push/merge kullanıcı kararıdır.
- `git pull`/`switch` çakışırsa **dur ve kullanıcıya göster**.

## 2. Güvenlik (CLAUDE.md DATA SAFETY)
- Uygulamayı tarayıcıda açma, sunucu başlatma yok. Eski localStorage + token `mustafaras/seyma-data`'yı ezebilir.
- Doğrulama yalnız headless Node (`node:vm`): `node tests/kao/test_kao2_components.js` vb.
- Token/parola kimseye yazılmaz; `mustafaras/seyma-data`'ya yazılmaz.

## 3. Sıradaki iş — D2F-07
- `nextPrompt` = **D2F-07** (`kao2-duzeltme/denetim-2/D2F-STATE.json`). Prompt metni: `DUZELTME-PROMPTLARI.md` → "Prompt 7".
- Başlık: **Müfredat eşleme sayfası gerçeği yazsın** · commit öneki `D2F-07:` · commit konusu
  `D2F-07: müfredat eşleme sayfası gerçek onay durumunu yazar`.
- Görev özeti: `docs/kuran-ogreniyorum/kao2/inceleme/MUFREDAT-ESLEME.md` hâlâ "Tüm başlık ve vaatler taslaktır (draft)" ve boş kutulu
  "Karar bekleyen noktalar" yazıyor; oysa taslak metin yok ve **G2 kararı 2026-10-02'de verildi**. Sayfayı **üreten aracı** düzelt
  (rapordaki bulgular: D2-11, K3-07 kalıntısı).
- **Dokunulacak dosyalar (yalnız bunlar):** `tools/kao2-curriculum-build.mjs`,
  `docs/kuran-ogreniyorum/kao2/inceleme/MUFREDAT-ESLEME.md` (yalnız araç çıktısı), `tests/kao/test_kao2_curriculum.js`.
- Adımlar (prompt birebir):
  1. **Önce test (kırmızı gör):** taslak metin sayısı 0 iken sayfada "taslaktır" yok; G2 kararı varsa "Karar bekleyen noktalar"
     yerine "G2 kararı (2026-10-02)" özeti ve işaretli onay satırı; sayfadaki sayılar `texts.tr.json` ile aynı.
  2. Araç sayfayı **veriden** yazsın; sayfayı **elle düzenleme**. Aracı iki kez çalıştır → **bayt-eşit**. Aracın ürettiği diğer
     dosyalar değişmemeli (`git diff --stat` ile göster).
- **BİTTİ SAYILIR:** curriculum testi PASS · iki üretim aynı · yalnız `MUFREDAT-ESLEME.md` değişti.
- Kurallar tam metin: `kao2-duzeltme/denetim-2/ORTAK-KURALLAR.md` (bir oturum = bir prompt = bir commit; test önce; mutasyon kanıtı;
  kayıtlar aynı commit'te). KANIT başlığında `Oturum: <Claude-Session adresi>` zorunlu.
- Kapılar (commit'ten önce, ~15–22 dk yavaş makinede):
  ```bash
  KAO2_ACCEPT_SLOW_HOST=1 bash kao2-duzeltme/tools/kapilar.sh   # tam koşu — artık bu makinede de YEŞİL beklenir
  node kao2-duzeltme/denetim-2/tekrar-uret-2.cjs                # PASS sayısı düşmez (şu an 5/9)
  node kao2-duzeltme/denetim/tekrar-uret.cjs                    # tarihsel kalıp, 10/10
  ```
  Koşu sırasında dosya değiştirme. Yeni konteynerde `rsync` ve tam klon gerekebilir (`git fetch --unshallow`).

### ✅ Ortam kırmızıları çözüldü (seq 10, 2026-10-07)
D2F-05/D2F-06'da kapıyı kırmızı gösteren iki "ortam kırmızısı" **giderildi** (ikisi de test kusuruydu; üretim davranışı doğruydu):
`tests/kao/test_kao2_kabul.js` A-4 artık yerel duvar saati 23:30 kurar; `tests/app/test_settings_boundary.js` artık `git log --all`
kullanmaz. **Bu makinede de tam kapı çıkış 0 "SONUÇ: TÜM KAPILAR YEŞİL".** Ayrıntı: `evidence/D2F-06/EK-KANIT.md`.
Yeni oturumda kapı yine kırmızı olursa çıktıyı birebir KANIT'a kopyala ve nedenini yaz.

## 4. Durum özeti
| | |
|---|---|
| Biten | D2F-01…06 (**6/16**) + seq 10 NOTE (ortam kırmızıları) |
| N PASS | N-01, N-02, N-03, N-08, N-09 |
| N açık | N-04 (D2F-11/12) · N-05 (D2F-08) · N-06/N-07 (D2F-10) |
| Denetim testleri | `test_kao2_denetim` 10/10 · `tekrar-uret-2` **5/9** · `tekrar-uret` 10/10 |
| Kapı (bu makine) | `kapilar.sh` **çıkış 0 YEŞİL** (önceden iki kırmızı) |
| Yayın | pin `20261007a` — D2F-01…04 **canlı** (seq 7 erken yayın, `main` ff-only) |
| Kullanıcı kapıları | D2F-12 (iki karar: L1 onayı + u09.01), D2F-15 (yayın onayı), D2F-16 (canlı doğrulama) |

- D2F-06 ne yaptı: `tests/kao/test_kao2_components.js` ses görevi (audioOnly) şık ekranı gerçek kurucuyla üretilip kalıcı teste
  bağlandı (rapor §8 "doğrulanamayanlar" kapandı). `app.js`/`app/core/*`/pinler dokunulmadı.
- **Kapsam dışı gözlemler (programda prompt yok, ayrı kapsam onayı ister):**
  - Kısa sûre "parça dizme" çözülmüş açılış (`kaoBuildFragmentTask`, `s:95:4:1` 5/500).
  - Ses görevinde aynı etiketli iki çeldirici olabiliyor (ör. iki "yer, yeryüzü"; doğru şık tekil) — belirsizlik doğurmuyor.

## 5. Yayın
D2F-01…04 **canlıda** (pin `20261007a`, seq 7, kullanıcı kararıyla tek seferlik erken yayın; ORTAK-KURALLAR §9). D2F-05 ve D2F-06
yayın yapmadı (yalnız test). Kalan promptlar (07…16) yeni kodla gelirse yeniden yayın gerekir; §6 ("pin yalnız Prompt 15") ve
§7 (onay çıkarılmaz) yeniden geçerlidir — D2F-15 kararı o promptta verilir. Canlı bayt eşitliği ve cihaz doğrulaması kullanıcıda.

## 6. Claude Code'u VS Code'da başlatma cümlesi
> Şeyma deposunda denetim-2 düzeltmelerinin PROMPT 7'sini yap (commit öneki D2F-07). Önce kao2-duzeltme/denetim-2/ORTAK-KURALLAR.md'yi oku ve uy; nextPrompt "D2F-07" olmalı.
