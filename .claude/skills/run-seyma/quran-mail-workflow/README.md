# QY-09 — Kur'an Yolculuğu istek maili (staged, NOT deployed from here)

**Bu klasör `mustafaras/s`'in bir parçası değildir; içeriği tamamen
`mustafaras/seyma-data` reposuna aittir.** Burada yalnız hazırlanıp
incelenmek üzere duruyor — hiçbir workflow bu dosyaları otomatik olarak
`seyma-data`'ya kopyalamaz veya push etmez. `CLAUDE.md`'nin sabit kuralı
("Never write to `mustafaras/seyma-data` without explicit user consent") ve
planın QY-09 doğrulama notu ("gerçek e-posta ancak açık kullanıcı izniyle")
burada aynen uygulanır.

## Neden ayrı repo?

`data/quran-request-outbox.json`, sync.js'in (QY-08) GitHub Contents API
üzerinden yazdığı dosya `mustafaras/seyma-data` içinde yaşar — bu repo
(`mustafaras/s`) yalnızca uygulama kodunu barındırır. GitHub Actions'ın bu
dosyadaki değişikliği dinleyebilmesi için workflow'un da `seyma-data`'da
olması gerekir; tıpkı mevcut `aeon-mail.yml` / `profile-completion-mail.yml`
çiftinin zaten orada durduğu gibi.

## ⚠️ Önemli: secret'lar ZATEN mevcut

Salt-okunur bir kontrolle doğrulandı: `mustafaras/seyma-data` reposunda
`MAIL_USERNAME`, `MAIL_PASSWORD`, `MAIL_TO` Actions Secret'ları **zaten
tanımlı** (mevcut ÆON/profil mail workflow'ları için). Bu, aşağıdaki
`quran-mail.yml` + `quran_mail.py` çiftini `seyma-data`'ya kopyalayıp
`main`'e merge etmenin **hiçbir ek secret kurulumu gerektirmediği**, ve bir
sonraki gerçek "Raşit'ten iste" tıklamasında **gerçekten** bir e-posta
göndereceği anlamına gelir. Bu yüzden kopyalama/merge adımı kullanıcının
açık onayını bekler; bu oturumda yalnız dosyalar hazırlandı, hiçbir şey
`seyma-data`'ya yazılmadı.

## İçerik

- `quran-mail.yml` — `mustafaras/seyma-data/.github/workflows/quran-mail.yml`
  olarak kopyalanacak workflow. Mevcut `aeon-mail.yml` ile AYNI desen
  (Python 3.12, `on: push: paths: [data/quran-request-outbox.json]`,
  `workflow_dispatch`, `concurrency` grubu, aynı üç secret) + YENİ bir adım:
  değişen `data/quran-delivery.json`'u `GITHUB_TOKEN` ile commit'ler.
- `quran_mail.py` — `mustafaras/seyma-data/.github/scripts/quran_mail.py`
  olarak kopyalanacak script. Yalnız standart kütüphane (`aeon_mail.py` ile
  aynı ilke): `json/os/ssl/smtplib/email`. `data/quran-request-outbox.json`'u
  okur, `data/quran-delivery.json`'da henüz `status:'sent'` OLMAYAN istekleri
  bulur, her biri için plan §8'deki konu/gövde şablonuyla tek bir e-posta
  gönderir, sonucu (`sent`/`failed`) idempotent biçimde delivery dosyasına
  yazar.
- `test_quran_mail.py` — headless fixture/dry-run testi. **Gerçek SMTP
  bağlantısı YOK**; `smtplib.SMTP_SSL` sahte bir sınıfla değiştirilir.
  Çalıştır: `python .claude/skills/run-seyma/quran-mail-workflow/test_quran_mail.py`

## Kopyalama adımları (yalnız kullanıcı açıkça isterse)

1. Bu üç dosyayı `mustafaras/seyma-data`'ya kopyala:
   `quran-mail.yml` → `.github/workflows/quran-mail.yml`,
   `quran_mail.py` → `.github/scripts/quran_mail.py`.
2. `seyma-data`'da bir dal aç, commit'le, PR/merge et (bu repodan değil,
   doğrudan `seyma-data` üzerinde).
3. Yeni bir secret gerekmez — `MAIL_USERNAME`/`MAIL_PASSWORD`/`MAIL_TO`
   zaten tanımlı.
4. Merge sonrası bir sonraki `data/quran-request-outbox.json` değişimi
   (yani uygulamada gerçek bir "Raşit'ten iste" tıklaması) artık gerçekten
   bir e-posta gönderir.

## Kapsam dışı (bilinçli, hata değil)

- Gelen cevabın otomatik işlenmesi (Gmail Apps Script köprüsü) QY-10'a aittir.
- `data/quran-responses.json` burada hiç yazılmaz/okunmaz.
- `data/latest.json`'a bu script'in hiçbir satırı dokunmaz.
