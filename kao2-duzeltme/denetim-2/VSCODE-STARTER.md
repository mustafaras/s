# VS Code devir notu · denetim-2 (2026-10-07, D2F-05 sonrası)

Bu not bir **sonraki oturum** içindir. Yeni oturum önce §1'i koşar, sonra §6'daki cümleyi yapıştırır.

## 1. Konumu doğrula (önce oku)
```bash
cd <yerel-klasör>
git status                       # temiz olmalı; değilse önce yedekle, reset --hard kullanma
git branch --show-current        # d2f-05 olmalı
git log --oneline -3             # en üstte: 467ab6fa D2F-05 ...
node kao2-duzeltme/denetim-2/tools/d2f-sync-check.mjs --clean   # PASS, "5/16 prompt done · nextPrompt D2F-06"
```
- **Uzak geride kaldı (bilerek):** `main` = `origin/main` = `59abe97b` (D2F-04 YAYIN, pin `20261007a`, canlı).
  **D2F-05 commit'i `467ab6fa` henüz push edilmedi** — yalnız bu yerel deponun `d2f-05` dalında, `origin/main`'in 1 önünde.
  Yeni oturum uzak kopyadan başlıyorsa D2F-05'i **görmez**; önce bu yerel depoyu kullan ya da `d2f-05`'i buradan al.
- Yeni prompt için yeni dal: `git switch -c d2f-06` (temel: `d2f-05`). `main` geçmişi yeniden yazılmaz; `push --force`, `reset --hard`,
  `git stash` yok (§1). Prompt bitince yalnız kendi commit'ini at; push/merge kullanıcı kararıdır.
- `git pull`/`switch` çakışırsa **dur ve kullanıcıya göster**.

## 2. Güvenlik (CLAUDE.md DATA SAFETY)
- Uygulamayı tarayıcıda açma, sunucu başlatma yok. Eski localStorage + token `mustafaras/seyma-data`'yı ezebilir.
- Doğrulama yalnız headless Node (`node:vm`): `node tests/kao/test_kao2_components.js` vb.
- Token/parola kimseye yazılmaz; `mustafaras/seyma-data`'ya yazılmaz.

## 3. Sıradaki iş — D2F-06
- `nextPrompt` = **D2F-06** (`kao2-duzeltme/denetim-2/D2F-STATE.json`). Prompt metni: `DUZELTME-PROMPTLARI.md` → "Prompt 6".
- Başlık: **Ses görevinin ekranı teste bağlansın** · commit öneki `D2F-06:` · commit konusu `D2F-06: ses görevi şık ekranı testte`.
- Görev özeti: K2F-40 şık ekranını `Views.choice`'a taşıdı; denetim 6.905 ekranın aynı kaldığını doğruladı ama **"ses" türü görev
  sentetik ortamda üretilemediği için doğrulanamadı**. Bunu kalıcı testle kapat (rapor §8 "doğrulanamayanlar").
- **Dokunulacak dosya (yalnız bu):** `tests/kao/test_kao2_components.js`.
- Adımlar (prompt birebir):
  1. Ses görevini harness'te **gerçek kurucuyla** üret (ses kullanılabilirliği ayar/kayıt yoluyla açılır; görev nesnesi elle yazılmaz).
  2. Cevapsız / doğru / yanlış üç durumda: şıklar `Views.choice` düğme kipinden geliyor; durum sınıfı, `aria-pressed`/`disabled`,
     ses düğmesinin erişilebilir adı doğru.
  3. **Tek seferlik kanıt (commit edilmez):** `git archive` ile `f4c256c7^` ve `HEAD` ağaçlarını scratchpad'e aç, aynı üç durumun
     HTML'i **bayt-eşit mi?** Sonucu `evidence/D2F-06/KANIT.md`'ye yaz. Ses görevi sentetik ortamda hiç kurulamıyorsa **nedenini**
     KANIT'a yaz ve test bunu sınasın.
- **BİTTİ SAYILIR:** `test_kao2_components.js` PASS · eşitlik sonucu KANIT'ta · kapılar yeşil.
- Kurallar tam metin: `kao2-duzeltme/denetim-2/ORTAK-KURALLAR.md` (bir oturum = bir prompt = bir commit; test önce; mutasyon kanıtı;
  kayıtlar aynı commit'te). KANIT başlığında `Oturum: <Claude-Session adresi>` zorunlu.
- Kapılar (commit'ten önce, ~15–22 dk yavaş makinede):
  ```bash
  KAO2_ACCEPT_SLOW_HOST=1 bash kao2-duzeltme/tools/kapilar.sh   # tam koşu
  node kao2-duzeltme/denetim-2/tekrar-uret-2.cjs                # PASS sayısı düşmez (şu an 5/9)
  node kao2-duzeltme/denetim/tekrar-uret.cjs                    # tarihsel kalıp, 10/10
  ```
  Koşu sırasında dosya değiştirme. Yeni konteynerde `rsync` ve tam klon gerekebilir (`git fetch --unshallow`).

### ⚠️ Bu makinede beklenen iki "ortam kırmızısı" (kapıyı KIRMIZI gösterir)
Bunlar D2F-05'te de vardı; **kendi değişikliğinden değil**, ikisi de prompt kapsamı dışı:
- `tests/kao/test_kao2_kabul.js` **A-4** (`night-review`, 8/9): `kaoNightWindow` (`app/core/quranLearn.js:423`) **yerel saat** kullanır;
  bu makine **+03** olduğundan `23:30Z` gece penceresi dışı. `TZ=UTC node tests/kao/test_kao2_kabul.js` ile A-4 geçer.
- `tests/app/test_settings_boundary.js`: `git log --all` ajan ana makinesinin kontrol-noktası kök commit'ini (`625eba07…`, yalnız
  `refs/agents/**`, `main` atası değil) seçip `git show <sha>^` ile çöküyor.
- Normal (UTC, ajan ref'siz) konteynerde ikisi de yeşildir. **Kapıyı yeşil diye kaydetme:** çıktıyı birebir KANIT'a kopyala ve
  kırmızının ortam olduğunu gerekçesiyle yaz.

## 4. Durum özeti
| | |
|---|---|
| Biten | D2F-01…05 (**5/16**) |
| N PASS | N-01, N-02, N-03, N-08, N-09 |
| N açık | N-04 (D2F-11/12) · N-05 (D2F-08) · N-06/N-07 (D2F-10) |
| Denetim testleri | `test_kao2_denetim` 10/10 · `tekrar-uret-2` **5/9** · `tekrar-uret` 10/10 |
| Yayın | pin `20261007a` — D2F-01…04 **canlı** (seq 7 erken yayın, `main` ff-only) |
| Kullanıcı kapıları | D2F-12 (iki karar: L1 onayı + u09.01), D2F-15 (yayın onayı), D2F-16 (canlı doğrulama) |

- D2F-05 ne yaptı: `test_kao2_denetim.js` R-01 (gerçek ustalık geçişi) + R-10 (girintiden bağımsız koşulsuz yazım) güçlendirildi;
  `tekrar-uret-2.cjs` N-03 aynı kalıba getirildi; `denetim/tekrar-uret.cjs` başına tarihsel-kayıt yorumu. `app.js`/`app/core/*`/pinler
  dokunulmadı.
- **Kapsam dışı gözlemler (programda prompt yok, ayrı kapsam onayı ister):**
  - Kısa sûre "parça dizme" çözülmüş açılış (`kaoBuildFragmentTask`, `s:95:4:1` 5/500).
  - Kabul testi saat diliminden bağımsız değil (yukarıdaki A-4).

## 5. Yayın
D2F-01…04 **canlıda** (pin `20261007a`, seq 7, kullanıcı kararıyla tek seferlik erken yayın; ORTAK-KURALLAR §9). D2F-05 yayın
yapmadı (yalnız test). Kalan promptlar (06…16) yeni kodla gelirse yeniden yayın gerekir; §6 ("pin yalnız Prompt 15") ve §7 (onay
çıkarılmaz) yeniden geçerlidir — D2F-15 kararı o promptta verilir. Canlı bayt eşitliği ve cihaz doğrulaması kullanıcıda.

## 6. Claude Code'u VS Code'da başlatma cümlesi
> Şeyma deposunda denetim-2 düzeltmelerinin PROMPT 6'sını yap (commit öneki D2F-06). Önce kao2-duzeltme/denetim-2/ORTAK-KURALLAR.md'yi oku ve uy; nextPrompt "D2F-06" olmalı.
