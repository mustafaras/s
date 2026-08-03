# P10 — FAZ 9: Geçiş ve Deploy

Bu prompt, yeni panelin **canlıya alınmasını** yönetmek için verilir. Faz 8 tamamlanmış olmalıdır.

## Faz hedefi

Eski paneli yedeklemek, yeni paneli aktif hale getirmek, cache-bump yapmak ve GitHub Pages deploy'unu tamamlamak.

## Bu fazda ele alınacak görevler

- `9.1` — Eski panel yedekleme
- `9.2` — panel-v2 → panel rename veya index.html güncelleme
- `9.3` — index.html cache-bump
- `9.4` — sw.js cache listesi güncelleme (gerekirse)
- `9.5` — Final commit ve deploy onayı

## Önceki faz kontrolü

- `completedTasks` içinde `8.1`, `8.2`, `8.3` var mı?
- Tüm fixture'lar PASS mı?
- `PANEL-REVIZE-PLANI/panel-revize-acceptance.json` içinde blocker var mı?
- Eğer blocker varsa, **bu fazı başlatma**; kullanıcıya rapor et.

## Yapılacaklar (checklist)

### 9.1 — Eski panel yedekleme

- `panel-v1-backup/` klasörü oluştur.
- `panel.html`, `panel.js`, `panel.css` dosyalarını buraya kopyala.
- Commit mesajı: `PANEL-REVIZE Faz 9: eski panel yedekleme`.

### 9.2 — panel-v2 → panel rename veya index.html güncelleme

İki stratejeden biri seçilir:

**Strateji A (rename):**
- `panel-v2.html` → `panel.html`
- `panel-v2.js` → `panel.js`
- `panel-v2.css` → `panel.css`
- `index.html` içindeki panel URL'sini güncelle.

**Strateji B (ayrı dosya, index.html güncelleme):**
- `panel-v2.*` dosyalarını olduğu gibi bırak.
- `index.html` veya mevcut `panel.html` shell'ini yeni dosyalara yönlendir.

Hangi strateji kullanılacaksa `PANEL-REVIZE-PLANI/07-UYGULAMA-FAZLARI-VE-KABUL-KAPISI.md` ve kullanıcı tercihi belirler.

### 9.3 — index.html cache-bump

- `styles.css`, `app.js`, `sync.js`, `panelCoverageManifest.js`, `panel.js`, `panel.css` için `?v=YYYYMMDD0N` güncelle.

### 9.4 — sw.js cache listesi

- Eğer `sw.js` statik asset listesi tutuyorsa yeni panel dosyalarını ekle.

### 9.5 — Final commit ve deploy onayı

- Tüm değişiklikleri commit et.
- Commit mesajı örneği: `PANEL-REVIZE Faz 9: yeni panel canliya alindi, cache-bump`.
- `git push origin main` ile GitHub Pages workflow'unu tetikle.
- Deploy workflow başarılı olana kadar bekle (opsiyonel: `gh run list` ile kontrol).
- Kullanıcıdan canlıyı test etmesi istenir.

## Testler

```bash
cd /Users/m_ras/Desktop/seyma
node --check panel.js
node --check panel-v2.js
node tests/test_panel_v2_*.js
```

Ayrıca `index.html`'deki `?v=` query string'lerin güncellendiğini doğrula.

## State güncelleme

```json
{
  "status": "completed",
  "currentTaskId": null,
  "completedTasks": ["...", "9.1", "9.2", "9.3", "9.4", "9.5"],
  "pendingTasks": [],
  "nextTaskId": null,
  "evidence": [
    {
      "recordedAt": "...",
      "taskId": "9.5",
      "kind": "deploy",
      "summary": "Yeni panel main branch'e push edildi; GitHub Pages deploy workflow tetiklendi.",
      "files": ["panel.html", "panel.js", "panel.css", "index.html", "panel-v1-backup/"]
    }
  ]
}
```

## Tur raporu formatı

```markdown
## Faz 9 — Tamamlandı

- **İşlenen görevler:** 9.1, 9.2, 9.3, 9.4, 9.5
- **Değiştirilen dosyalar:** panel.html, panel.js, panel.css, index.html, panel-v1-backup/, panel-revize-state.json
- **Deploy:** https://github.com/mustafaras/s/actions (kontrol edildi)
- **Notlar:** Kullanıcıdan canlı URL'de test yapması bekleniyor.
```

## Çıkış kriterleri

- [ ] Eski panel `panel-v1-backup/` içinde yedeklendi.
- [ ] Yeni panel canlı dosyalarına taşındı.
- [ ] Cache-bump yapıldı.
- [ ] sw.js güncellendi (gerekirse).
- [ ] Değişiklikler `main` branch'e push edildi.
- [ ] `panel-revize-state.json` `status: "completed"` içeriyor.
- [ ] Kullanıcıya canlı test için talimat verildi.

---

Revizyon tamamlandı. Yeni işlem isterseniz yeni bir plan başlatılır.
