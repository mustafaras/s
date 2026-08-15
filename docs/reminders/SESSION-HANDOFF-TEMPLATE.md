# APP-REMINDER-UX — Session Handoff Şablonu

Bu şablon her prompt sonunda doldurulur. Ham kullanıcı verisi, token, raw
notification body veya gerçek sync payload’ı yazılmaz.

## Handoff

- **Tarih / ajan:** YYYY-MM-DD / agent-id
- **Prompt:** REM-XX
- **Faz:** RX
- **Başlangıç HEAD:** SHA
- **Bitiş HEAD:** SHA veya `commit yok`
- **Canonical closure commit:** SHA veya `commit yok`
- **Ledger durumu:** done / blocked / deferred
- **Çalışma ağacı:** clean / known user changes / blocked
- **Release approval:** NOT_APPROVED / approved (exact evidence required)
- **Approval scope:** `none` veya yalnız kullanıcı mesajında açıkça verilen eylemler
- **Closure gate:** `node docs/reminders/verify-reminder-closure.mjs REM-XX` — PASS / FAIL

### Değişen dosyalar

- `path/to/file` — neden

### Yapılan iş

- Bir cümlelik sonuç.
- Kapsam dışı bırakılan konu.

### Doğrulama kanıtı

| Kanıt | Komut / receipt | Sonuç |
|---|---|---|
| Syntax | `command` | PASS / FAIL |
| Headless | `command` | PASS / FAIL |
| Migration | `command` | PASS / FAIL / N/A |
| Privacy | `command` | PASS / FAIL / N/A |
| Panel | `command` | PASS / FAIL / N/A |
| Diff scope | `git diff --check` | PASS / FAIL |
| Context parity | `node docs/reminders/verify-reminder-context.mjs` | PASS / FAIL |

### Açık risk / discrepancy

- `none` veya exact ID + kısa açıklama.

### Context / auto-compact checkpoint

- **Context durumu:** normal / checkpoint alındı / yeni session gerekli
- **Son güvenilir kanıt:** kısa komut + sonuç
- **Yeni session ilk adımı:** canonical dosyaları ve Git durumunu yeniden oku;
  önceki sohbet özetini tek başına kanıt sayma.

### Sonraki güvenli adım

- Prompt ID ve ilk okunacak dosya / komut.

### Sert sınır teyidi

- [ ] Browser açılmadı.
- [ ] Server başlatılmadı veya kapatıldı.
- [ ] Gerçek data repo’ya yazılmadı.
- [ ] Secret / token istenmedi veya kaydedilmedi.
- [ ] Push / merge / deploy yapılmadı; yapıldıysa ayrı kanıt yazıldı.
- [ ] Kullanıcı onayı exact mesaj, tarih ve scope ile doğrulandı; doğrulanmadıysa release `NOT_APPROVED` kaldı.
- [ ] `mustafaras/seyma-data` yazılmadı; yazıldıysa ayrıca açık veri yazma onayı ve ayrı kanıt mevcut.
- [ ] Evidence dosyası, ledger satırı, STATE alanları ve `state.closure` aynı promptu gösteriyor.
- [ ] Closure validator PASS olmadan `done`, sonraki `ready` veya tamamlanmış handoff raporlanmadı.
