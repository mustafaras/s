# PANEL-00 — ÆON Panel Anti-Amnesia Başlangıç Prompt’u

Bu metni panel çalışmasına başlayacak yeni Codex/Claude oturumunun ilk
mesajı olarak kullan.

```text
Şeyma repository’sindeki yalnızca ÆON panel görünürlük, senkronizasyon ve
tasarım geliştirme paketinde çalışacaksın.

ZORUNLU OKUMA SIRASI
1. AGENTS.md
2. CLAUDE.md
3. GELISTIRME-PLANI.md
4. docs/panel/plans/PANEL-GOZLEMLENEBILIRLIK-VE-SENKRON-PLANI.md
5. docs/panel/plans/PANEL-TASARIM-VE-GELISTIRME-PLANI.md
6. docs/panel/README.md
7. docs/panel/ledgers/PANEL-LEDGER-OPERATIONS.md
8. docs/panel/ledgers/PANEL-LEDGER-STATE.md

İLK EYLEM
git status --short --branch
git diff --stat
git log -1 --oneline
Ardından yalnız bounded read-only inceleme yap. Kirli çalışma ağacındaki
değişiklikleri kullanıcıya/önceki oturuma ait kabul et; ezme, resetleme,
checkout, clean veya toplu silme yapma.

CANONICAL SIRA
PANEL-01 → PANEL-02 → PANEL-03 → PANEL-04 → PANEL-05 → PANEL-06
→ PANEL-07 → PANEL-08 → PANEL-09 → PANEL-10 → PANEL-11 → PANEL-12 → PANEL-13.
Bir promptun kabul kapısı geçmeden sonraki promptu uygulama. Tek oturumda
yalnız bir prompt çalıştır.

DIŞ EYLEM SINIRI
Ben açıkça “commit et”, “pushla”, “merge et”, “canlıya al/deploy et” demeden:
- commit, push, merge, PR, Pages deploy yapma;
- mustafaras/seyma-data reposuna yazma;
- gerçek e-posta, WhatsApp veya dış observer mesajı gönderme;
- gerçek tarayıcı açma ve genel server başlatma.
“Devam” yalnız sıradaki geliştirme promptuna geçme iznidir; dış eylem izni
değildir.

VERİ GÜVENLİĞİ
- sync.js localhost/file guard ve anti-clobber korumalarını zayıflatma.
- Kullanıcı tokenı, OpenAI anahtarı, auth alanı, raw profil cevabı ve raw GPS
  track hiçbir prompt çıktısına, fixture’a, event log’a veya DOM’a sızmasın.
- Panel latest.json/gunluk dosyasına yazmaz; observer action ayrı kanaldadır.
- Yeni kalıcı alan varsa migrate ve panel coverage sınıfı olmadan kabul edilmez.

LEDGER PROTOKOLÜ
Her faz sonunda:
1. PANEL-### sequence’ini belirle.
2. Operations ledger’a yapılan eylem, dosya, test, kanıt ve dış etkiyi yaz.
3. Aynı sequence’i State ledger’a durum, önkoşul, kabul ve sonraki adıma yaz.
4. İki ledger aynı sequence’i içermiyorsa fazı tamamlandı sayma.
5. Hata varsa gizleme; blocked/ready_for_review ayrımını kanıtla.

FAZ RAPORU
Oturum sonunda yalnız şunları bildir:
- kapsam ve neden,
- değişen dosyalar,
- çalıştırılan komutlar ve gerçek sonuçları,
- veri güvenliği kontrolü,
- kalan riskler,
- bir sonraki tek güvenli prompt,
sonra DUR ve benden açık “devam” bekle.
```

**Bu dosyanın durumu:** Yalnızca oturum sınırlarını kurar; kod değiştirmez.
