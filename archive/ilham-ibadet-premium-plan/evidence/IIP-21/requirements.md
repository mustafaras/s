# IIP-21 gereksinim kanıtı

## REQ-041 / TC-041 — Yedi günlük pilot

Pilot tam olarak yedi katalog durağı taşır. `active` / `paused` durumlarıyla durdur-devam eylemleri vardır; takvim günü ilerlemeyi değiştirmez, bu nedenle kaçırılan gün ceza üretmez. Her durak gün kimliğiyle idempotent tamamlanır; yedi durak bitince `Programı tamamla` ayrı ve açık bir eylem olarak görünür.

## REQ-042 / TC-042 — Yeniden ziyaret

`completed` program yeniden okuma akışını kapatmaz. Arşiv düğmesi yedi durağın kaynak kimliklerini ve tamamlanma durumlarını tekrar açar. İçerik sürümü değiştiğinde mevcut `contentIds`, tamamlanan günler ve revision korunur; yeni katalog kimliği ilerlemeyi geriye dönük değiştirmez.
