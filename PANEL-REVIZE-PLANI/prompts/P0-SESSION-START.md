# P0 — SESSION START

Bu prompt, **her yeni AI agent session'ında** ÆON panel revizyonuna başlamadan önce verilir. Amaç: agent'ın önceki turdan kalan durumu anlaması, gerekli dosyaları okuması ve bir sonraki görev için hazır hale gelmesidir.

## Senin görevin

1. **Kısa bir selam ve durum raporu ver.** Örneğin: "ÆON panel revizyonuna devam ediyorum."
2. `PANEL-REVIZE-PLANI/panel-revize-state.json` dosyasını oku.
3. `PANEL-REVIZE-PLANI/panel-revize-tasks.json` dosyasını oku.
4. `PANEL-REVIZE-PLANI/panel-revize-manifest.json` dosyasını oku.
5. Durumu şu formatta raporla:

```markdown
## ÆON Panel Revizyonu — Session Başlangıcı

- **Proje:** PANEL-REVIZE vX.Y.Z
- **Genel durum:** in-progress / blocked / completed
- **Son tamamlanan görev:** <varsa taskId> — <başlık>
- **Şu anda işlenen görev:** <currentTaskId> — <başlık>
- **Bekleyen görev sayısı:** N
- **Blokeler:** <yoksa "Yok">
- **Bir sonraki önerilen görev:** <nextTaskId>
```

6. Eğer `status === "completed"` ise, projeyi bitir ve kullanıcıya "Revizyon tamamlandı. Yeni bir işlem mi istiyorsunuz?" diye sor.
7. Eğer `blockers` doluysa, her bloke görevin nedenini listele ve kullanıcıdan talimat bekle.
8. Eğer `currentTaskId` null ise, bağımlılıkları tamamlanmış en küçük `pending` görevi öner.

## Ne yapmaman gerekir

- Bu aşamada **kod yazma** veya dosya değiştirme.
- `panel-revize-state.json`'u bu promptta güncelleme; güncelleme, ilgili faz promptu işlendiğinde yapılır.
- Mevcut `panel.html`, `panel.js`, `panel.css`, `index.html`, `app.js`, `sync.js` dosyalarına dokunma.

## Çıktı formatı

Sadece markdown rapor ver. Kod önerme. Bir sonraki prompt olarak ilgili faz dosyasını (`P1-…` ile `P10-…` arası) kullanıcıya hazır olduğunu belirt.

---

İlgili dosyalar:
- [PANEL-REVIZE-PLANI/prompts/00-INDEX.md](00-INDEX.md)
- [PANEL-REVIZE-PLANI/panel-revize-state.json](../panel-revize-state.json)
- [PANEL-REVIZE-PLANI/panel-revize-tasks.json](../panel-revize-tasks.json)
- [PANEL-REVIZE-PLANI/panel-revize-manifest.json](../panel-revize-manifest.json)
