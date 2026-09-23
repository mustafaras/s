# IIP-20 gereksinim kanıtı

## REQ-039 / TC-039 — Yer imi kalıcılığı

`bookmarks`, `reader` ve `programs` kökleri additive/idempotent migration ile oluşur. Yer imleri `bookmarkId` ve artan `revision` ile birleşir; silme tombstone olarak kalır. İki cihaz çatışması, eski istemcinin namespace göndermemesi ve migration’ın ikinci çalışması `tests/app/test_iip_20.js` içinde doğrulanmıştır.

## REQ-040 / TC-040 — Okuma konumu sürümü

Konum `contentId + revision + blockId + ratio` ile saklanır. İçerik revision’ı uyuşmazsa eski paragraf numarası uygulanmaz; güvenli başlangıç konumu kullanılır. Ölçek tercihi de aynı reader namespace’inde revision ile birleşir. Boş, eski ve tombstone durumları sentetik fixture’da kapsanmıştır.
