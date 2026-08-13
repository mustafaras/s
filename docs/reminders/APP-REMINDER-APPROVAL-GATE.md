# APP-REMINDER-UX — Canlıya Alma Onay Kapısı

Bu dosya, hatırlatma programının dış sistemlere ve canlı GitHub Pages
ortamına ulaşmasını kilitleyen canonical release authority belgesidir.

## Varsayılan durum

**Release approval:** `NOT_APPROVED`
**Pages / main push:** yasak
**Merge / tag / release:** yasak
**Gerçek veri repo’suna yazma:** ayrıca ve açık veri onayı olmadan yasak
**Kullanıcı cihazı kabulü:** henüz yapılmadı

Bu durum testlerin yeşil olmasıyla, local commit ile, eski bir sohbet mesajıyla
veya ajanın kendi yorumu ile değişmez.

## Kullanıcı onayı olmadan yasak olan işlemler

Aşağıdaki işlemler, kullanıcı bu konuşmada açık ve güncel şekilde istemeden
başlatılamaz:

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

## Onaydan önce yapılabilecekler

- Local çalışma ve üretim kodu değişikliği,
- sentetik test ve headless doğrulama,
- local commit,
- release packet / evidence receipt hazırlama,
- kullanıcıdan eksik karar veya açık onay isteme.

Bunlar canlıya alınmış, remote’a gönderilmiş veya kullanıcı cihazında
doğrulanmış sayılmaz.

## Onay sonrası zorunlu sıra

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
