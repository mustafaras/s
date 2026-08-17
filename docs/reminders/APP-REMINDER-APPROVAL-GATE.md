# APP-REMINDER-UX — Canlıya Alma Onay Kapısı

Bu dosya, hatırlatma programının dış sistemlere ve canlı GitHub Pages
ortamına ulaşmasını kilitleyen canonical release authority belgesidir.

## Varsayılan durum

**Release approval:** `NOT_APPROVED` (ad hoc/final release kilidi)
**Standing prompt delivery:** `after_each_prompt` (yalnız closure PASS sonrası `main` → Pages)
**Merge / tag / release:** standing scope dışında yasak
**Gerçek veri repo’suna yazma:** ayrıca ve açık veri onayı olmadan yasak
**Kullanıcı cihazı kabulü:** henüz yapılmadı

## Standing prompt delivery policy — 2026-08-17

Kullanıcının exact talimatı “her prompttan sonra bu yapılsın bunu düzenler
misin” olarak kaydedilmiştir. `STATE.json.promptDeliveryPolicy` aktif olduğu
sürece, başarılı her prompt closure’ından sonra aşağıdaki bounded sıra otomatik
olarak uygulanır:

1. Evidence, ledger, STATE ve `verify-reminder-closure.mjs REM-XX` PASS.
2. Prompt ID’li dar commit ve temiz diff.
3. `git push origin main`; mevcut branch `main` ise fast-forward merge yolu.
4. GitHub Pages workflow validate/deploy; geçici action download hatasında
   bounded retry, kalıcı hatada `blocked`.
5. Remote equality, deployment status ve live HTTP/cache-bust receipt.
6. Receipt commit gerekiyorsa aynı `main` zincirinde kaydedilir.

Bu policy `releaseApproval` alanını `approved` yapmaz; ad hoc/final release
kilidi her teslimattan sonra `not_approved` kalır. Scope yalnız current `main`,
`origin/main`, GitHub Pages ve read-only release kanıtıdır. `mustafaras/seyma-data`,
başka remote, tag, force-push, history rewrite, arbitrary external write ve
kullanıcı cihazı acceptance kapsam dışıdır. Fail/blocked prompt dışarı teslim
edilmez.

## Program-level release timing policy

2026-08-13 itibarıyla kullanıcı talimatı gereği programın geri kalanında:

- `REM-02`–`REM-72` boyunca dar kapsamlı local commit’ler düzenli olarak
  yapılabilir; local commit canlıya alma değildir.
- Her promptun kendi closure gate’i, ilgili testleri ve local doğrulaması
  tamamlanmadan delivery çalışmaz. Kullanıcı cihazı kontrolü S5 kanıtıdır ve
  otomatik prompt teslimatını bekletmez.
- Final local server doğrulaması gerekiyorsa yalnız repository güvenlik
  kurallarındaki port `9000` istisnası kullanılır. Kullanıcı server’ı kendi
  browser’ında açar; ajan browser açmaz ve başlattığı server’ı kapatır.
- Standing scope dışındaki canlıya alma ancak mevcut konuşmada verilen yeni,
  açık ve kapsamı belirli onayla başlatılabilir. `STATE.json.releaseApproval.status`
  standing teslimatlarda `not_approved` kalır.

Standing policy exact kullanıcı kaydıyla değiştirilmiştir; bunun dışındaki
testler, local commit, eski sohbet veya ajan yorumu yeni release yetkisi
oluşturmaz.

## Kullanıcı onayı olmadan yasak olan işlemler

Aşağıdaki işlemler standing prompt teslimat scope’u dışında, kullanıcı bu
konuşmada açık ve güncel şekilde istemeden başlatılamaz:

- `git push` ile `main` veya herhangi bir dış remote’u değiştirmek,
- branch merge, pull request merge veya release tag yayımlamak,
- GitHub Pages workflow’unu tetiklemek veya canlı sürümü değiştirmek,
- production webhook, deploy servisi veya dış bildirim altyapısına yazmak,
- canlı uygulamayı açarak cihaz / production davranışı doğrulamak,
- `mustafaras/seyma-data` veya başka gerçek veri deposuna yazmak.

Son madde için canlıya alma onayına ek olarak veri deposuna yazma amacı da
ayrıca açıkça yetkilendirilmelidir. Bir onay diğerini örtük olarak vermez.

## Geçerli onay standardı

Release promptu ancak aşağıdaki üç şartın tamamı sağlanırsa yürütülebilir:

1. Kullanıcı mevcut konuşmada açık bir eylem cümlesi verir. Örnekler:
   “Bu sürümü canlıya al”, “push commit merge deploy yap”.
2. Onay hangi kapsamı kapsadığını belirtir: `main`, Pages, belirli branch veya
   yalnız local commit gibi.
3. Ajan onayı release state’e exact kullanıcı mesajı, tarih ve izin verilen
   eylemler olarak kaydeder; onayı kendisi üretemez.

“Tamam”, “devam”, “güzel”, “hazırla”, “bakalım”, “test et” ve benzeri belirsiz
ifadeler canlıya alma onayı sayılmaz. Belirsizlikte varsayılan `NOT_APPROVED`
kalır.

## Standing policy dışında onaydan önce yapılabilecekler

- Local çalışma ve üretim kodu değişikliği,
- sentetik test ve headless doğrulama,
- local commit,
- release packet / evidence receipt hazırlama,
- kullanıcıdan eksik karar veya açık onay isteme.

Bunlar canlıya alınmış, remote’a gönderilmiş veya kullanıcı cihazında
doğrulanmış sayılmaz.

## Ad hoc approval sonrası zorunlu sıra

Onay alındıktan sonra bile sıra şöyledir:

1. `APP-REMINDER-STATE.json` release approval alanını exact evidence ile güncelle.
2. Approval gate, ledger ve traceability validator’ını çalıştır.
3. Son full test matrix’ini yeniden çalıştır; eski PASS kanıtını kullanma.
4. Yalnız izin verilen dosyaları stage et ve commit SHA’sını kaydet.
5. Kullanıcı onayı kapsamına giriyorsa push / merge işlemini yap.
6. Git remote equality’yi doğrula.
7. Pages workflow ve deployment kanıtını ayrı doğrula.
8. Canlı HTTP / cache-bust içerik kanıtını ayrı yaz.
9. Kullanıcı cihazı acceptance’ını S5 olarak bekle; ajan cihaz doğrulamasını
   kendi adına tamamlanmış saymaz.

Bir adım fail olursa sonraki adıma geçilmez; ledger `blocked` olur.

## Makinece okunabilir kayıt sözleşmesi

State içindeki release approval varsayılan olarak şu şekildedir:

    "releaseApproval": {
      "status": "not_approved",
      "scope": [],
      "evidence": null,
      "approvedAt": null,
      "approvedBy": "user"
    }

`approvedBy` hiçbir zaman `agent`, `test`, `ci` veya `system` olamaz. Onay
gelmeden bu alanı `approved` yapmak kontrol ihlalidir.
