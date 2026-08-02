# PANEL-06 — P2 Polling, ETag ve Relay Kararı Prompt’u

## Amaç

Panelin ne kadar hızlı ve hangi maliyetle güncelleneceğini kanıtla; GitHub
Pages’in polling sınırı ile gerçek zamanlı relay ihtiyacını birbirinden ayır.

## Mevcut davranış denetimi

- 4 saniyelik app debounce,
- 15 saniyelik panel polling,
- input/textarea odağında polling skip,
- `panelSig` ile gereksiz render engeli,
- GitHub API/Contents rate limit ve cache davranışı.

## Yapılacaklar

1. ETag veya SHA conditional fetch uygulanabilirliğini ölç.
2. Panel poll zamanı, kaynak revision ve görünür revision’ı ayrı ölç.
3. Input taslağı korunurken arka plan data güncellemesini tasarla.
4. Polling p50/p95 gecikmesini fixture/mock ile hesapla.
5. SSE/WebSocket relay gereksinimini yazılı karar kapısına bağla.
6. Gerçek relay uygulanmadıysa UI’da “anlık” değil “yakın takip” kullan.

## Kabul kapısı

- Değişmeyen snapshot tekrar indirilmez veya tekrar render edilmez.
- Taslak yazarken yeni veri sessizce kaybolmaz.
- Stale/poll skipped durumu görünürdür.
- Relay önerisi güvenlik, auth, maliyet ve rollback ile belgelenmiştir.

İki ledger’a sonuçları ekle; dış servis açma; kullanıcı incelemesi bekleyerek DUR.
