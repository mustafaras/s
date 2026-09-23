# IIP-15 review

Kritik/yüksek açık ürün bulgusu yok. İncelemede iki regresyon düzeltildi: Panel-v2 boş günü bilinmeyen çipi nedeniyle eski boş metni kaybediyordu; tam beş olumlu kayıt mevcut `5/5` sözleşmesini kaybediyordu. Son davranış: yalnız beş açık olumlu kayıtta `5/5`; diğer tarihsel/karma kayıtlarda payda bilinmiyor.

Bilinen fixture borcu: `tests/app/test_iip_03.js`, IIP-15 öncesi tarihsel sözleşme olarak `max:days*6` ve `k.prays+'/'+k.max` metinlerini zorunlu tutar. Bu iki iddia IIP-15 REQ-029 ile bilinçli olarak geçersizleşti. Dosya canlı brief allowlist'inde olmadığı için değiştirilmedi; ölü üretim metniyle kandırılmadı. Diğer tüm `tests/app/test_*.js`, panel ve Panel-v2 aileleri geçti.
