# Denetim-2 düzeltmeleri · ortak kurallar (her prompt bunu okur)

Bu dosya ajan içindir. Her prompt "önce ORTAK-KURALLAR.md'yi oku" der; kurallar her promptta aynen geçerlidir.
Kaynak rapor: `kao2-duzeltme/denetim-2/DENETIM-RAPORU.md`. Prompt listesi: `kao2-duzeltme/denetim-2/DUZELTME-PROMPTLARI.md`.

## 1. Güvenlik
- CLAUDE.md "DATA SAFETY": tarayıcı açma, sunucu başlatma, `mustafaras/seyma-data`'ya yazma **yok**.
  Doğrulama yalnız headless Node (`node:vm`) testleriyle.
- `main` geçmişi yeniden yazılmaz; `push --force`, `reset --hard`, `git stash` yok.

## 2. Sıra ve kayıt
- Sıradaki prompt yalnız `kao2-duzeltme/denetim-2/D2F-STATE.json` → `nextPrompt`. Yapıştırılan prompt bu değilse **dur** ve
  kullanıcıya hangi promptun sırada olduğunu söyle. (Prompt 1'de dosya henüz yoktur; Prompt 1 onu kurar.)
- Başlarken: `node kao2-duzeltme/denetim-2/tools/d2f-sync-check.mjs --clean` → PASS olmalı (Prompt 1 hariç).
- Kayıtlar `kao2-duzeltme/denetim-2/` altında:
  - `D2F-STATE.json` — prompt durumları, `nextPrompt`, pinler, N-01…N-09 durumları.
  - `CURRENT-STATE.md` — her prompt sonunda **baştan** yazılır; içindeki sayılar o oturumda araçla ölçülür ve tarihlenir.
  - `LEDGER.md` — yalnız sona ekleme. Kayıt başlığı: `## seq N · YYYY-MM-DD · PROMPT|GATE|NOTE|BLOCKED · D2F-NN`.
  - `evidence/D2F-NN/KANIT.md` — bölümler: İlerleme günlüğü · Yapılan · TDD · Kapılar · Ölçümler · Bilerek değişen
    testler · Kanıt düzeyleri · Sürprizler. Başlıkta `Oturum: <Claude-Session adresi>` satırı zorunlu.
- Prompt N'nin commit öneki `D2F-NN:` (iki haneli, ör. Prompt 3 → `D2F-03:`).

## 3. Bir oturum = bir prompt = bir commit
- Bu oturumda **yalnız** yapıştırılan promptu yap. Kullanıcı "devam", "sıradakine geç" dese bile commit et ve yeni oturum aç demesini söyle.
- Tek commit: kod + test + KANIT + LEDGER + CURRENT-STATE + D2F-STATE birlikte. "Ek tur", "ara durum", ayrı "kayıt" commit'i yok.
- Commit'ten sonra bir hata görürsen düzeltme: LEDGER'a `NOTE` yaz, kullanıcıya yeni prompt gerektiğini söyle.
- Yalnız promptun **Dokunulacak dosyalar** listesindeki dosyaları değiştir (+ `kao2-duzeltme/denetim-2/`). Başka dosya gerekirse
  **dur**: LEDGER `BLOCKED` (neden, önerilen çözüm), D2F-STATE'te prompt `blocked`, commit `D2F-NN: BLOCKED — <neden>`, kullanıcıya bildir.

## 4. Test önce
- Önce testi yaz/genişlet, **değişiklikten önceki kodla** koş, kırmızıyı gör, ilk anlamlı hata satırını KANIT'a kopyala.
- Sonra en küçük kod değişikliğiyle yeşile çek. Var olan testi gevşetme; davranışı bilerek değişen test varsa KANIT'a
  `eski → yeni · gerekçe` yaz.
- Kontrol testlerinde en az bir **mutasyon kanıtı**: scratchpad'de kodun kopyasında düzeltmeyi geri al → test FAIL (çalışma ağacında değil).
- Testlerde durum elle kurulmaz (`masteryAt`, yığın, `ui.kaoPanel`); akış `tests/kao/helpers/kao-harness.js` ile gerçek handler'larla sürülür.

## 5. Kapılar (her prompt sonunda, commit'ten önce)
```bash
KAO2_ACCEPT_SLOW_HOST=1 bash kao2-duzeltme/tools/kapilar.sh   # TAM koşu, ~12 dk; "SONUÇ: TÜM KAPILAR YEŞİL"
node kao2-duzeltme/denetim-2/tekrar-uret-2.cjs                 # PASS sayısı hiçbir promptta azalmaz
node kao2-duzeltme/denetim/tekrar-uret.cjs                     # 10/10 kalır
node kao2-duzeltme/denetim-2/tools/d2f-sync-check.mjs          # PASS (Prompt 1'den sonra)
```
- `KAO2_ACCEPT_SLOW_HOST` Prompt 2'den önce `kapilar.sh`'a geçmez; Prompt 1'de kapılar bayraksız koşulur ve yalnız
  `test_kao2_kabul.js` + `test_kao2_perf_budget.js` kırmızı beklenir (yavaş makine).
- "Eşdeğer paralel koşu" kabul edilmez. Koşu sürerken dosya değiştirme. Çıkış kodunu boru (`|`) sonrasında okuma.
- Sonuç satırlarını KANIT "Kapılar" bölümüne olduğu gibi kopyala.

## 6. Yasaklar
- `?v=` pinleri, `sw.js` sürümleri ve pin testleri **yalnız Prompt 15'te** değişir. Kullanıcı "önce canlıya al" dese bile:
  "programın tek yayın noktası Prompt 15" de; ısrar ederse dur (`BLOCKED`).
- Yeni `App.kao*` handler yok (45 · App yüzeyi 766 · atama 604 · onclick 393 sabit). `app.js`'e dokunulmaz.
- `migrate()`, FSRS (`kaoSchedule`), `kaoBuildQueue` kuralları, ses kaydı gizliliği değişmez.
- Elle Arapça metin/hareke/okunuş yazılmaz; yalnız içerik modülleri ve `tools/kao*.mjs` çıktısı.
- Yeni ya da değişen Türkçe metin `review.level:"draft"` ile başlar; `sourced` yalnız Prompt 12'de kullanıcının kararıyla.
- Yorumlarda `App.<ad>=` biçimi ya da `onclick` kelimesi yazılmaz (pin tarayıcıları yorumları da sayar).

## 7. Kullanıcı onayı
- Onay **asla çıkarılmaz**. Kullanıcı kararı gereken promptlarda (11→12, 14→15, 16) yalnız promptta yazan cevaplar geçerlidir.
  "Tamam", "olur", "canlıya al", oturum başındaki genel talimat onay sayılmaz — kullanıcıya beklenen cümleyi tekrar sor.
- Karar soran promptta: işi commit et, LEDGER `GATE status: waiting` (beklenen cümle yazılı) ekle, kullanıcıya tek mesajla
  soruyu sor ve **dur**. Cevabı uygulayan prompt LEDGER'a `GATE status: closed` + cevabın birebir alıntısını yazar.

## 8. Kanıt düzeyleri
KANIT ve kullanıcıya rapor: **kaynak/test** (bu oturumda koşturdun) · **yayın** (git/Actions kaydı) · **cihaz** (yalnız kullanıcı
beyanı) ayrı yazılır. "Cihazda çalışıyor" ya da "canlıda doğru" yalnız ilgili kanıt varsa yazılır.

## 9. Tek seferlik istisna (2026-10-07, kullanıcı kararı)
Kullanıcı ortam değiştireceği için programın yayın kuralını bir kereliğine değiştirdi (birebir: "programı tek seferlik değiştirelim
ortam değiştireceğiz buyuzden tumu push commit ve merge ve deploy yapılmalı"). Bu istisna D2F-04 sonrasında **erken yayın** (pin
`20261007a`, `main` ff-only) için geçerlidir; §6 ("pin yalnız Prompt 15") ve §7 (onay çıkarılmaz) bu yayın için uygulanmadı.
**Program kapanmadı:** D2F-05…16 `pending` kalır, N-02…N-08 açık; kullanıcı kapıları (D2F-12 iki karar, D2F-16 canlı doğrulama)
geçerlidir. D2F-15 artık "yeni pin yok" olarak yapılır (yayın zaten çıktı) ya da yeni kod olursa tekrar pin; kararı o prompt verir.
İstisna başka yayın için geçerli değildir.
