# IIP-04 gereksinim kapısı

## REQ-007 / TC-007 — hiyerarşi ve erişim

PASS. Mevcut nav ve hub çağrı sırası korunurken ortak 12px aralık, auto-fit dört/beşli grid ve 320px/yüzde 200 metin sarma kuralları uygulandı. Status, metric ve footer içerikleri dar alanda kesilmek yerine sarılabilir.

Olumsuz senaryo PASS: dar görünüm için `white-space:nowrap` zorlaması kaldırıldı; kart eylemi görünür kalacak şekilde 44px minimum footer yüksekliği korunuyor.

## REQ-008 / TC-008 — navigasyon semantiği

PASS. Seçili bölüm metinle görünür, `.on` renk/şekil vurgusu taşır, `aria-current="page"` ve `aria-pressed` üretilir; seçili olmayanlarda `aria-current=false` kullanılmaz. Mevcut `App.setFaithTab` çağrısı ve keyboard `:focus-visible` kuralı korunur.

Olumsuz senaryo PASS: yarım `role="tab"` modeli eklenmedi; mevcut button/nav sözleşmesi sürdürülüyor.
