# K3P-05 · deney-rapor sızıntı kanıtı (grep)

Kaynak düzeyi, 2026-10-11. Gerçek veri okunmadı; yalnız `--ornek` (sentetik yedek) kullanıldı.
Sentetik yedekte izin dışı alanlarda bilerek **sızıntı yemi** var: Arapça dize (`daily[*].note`,
`cards[*].ar`), kimlik biçimli kart/ders anahtarları (`w:…`, `s:1:…`, `s0.0…`, `u01.0…`) ve sır
benzeri ayar (`settings.ghToken`). Aynı `grep` girdide bunları bulur, çıktıda bulamaz.

```bash
export LC_ALL=en_US.UTF-8
AR='[؀-ۿݐ-ݿࢠ-ࣿﭐ-﷿ﹰ-﻿]'          # U+0600–06FF, 0750–077F, 08A0–08FF, FB50–FDFF, FE70–FEFF
ID='[ws]:[A-Za-z0-9:]+|s0\.[0-9]|u[0-9]{2}\.[0-9]{2}|sample[0-9]|ghp_'
node kao3-premium/araclar/deney-rapor.cjs --ornek > kao3-premium/kanit/K3P-05/deney-rapor-ornek.txt
grep -cE "$AR" kao3-premium/kanit/K3P-05/deney-rapor-ornek.txt   # 0
grep -cE "$ID" kao3-premium/kanit/K3P-05/deney-rapor-ornek.txt   # 0
```

| | Arapça | Kimlik/sır |
| --- | --- | --- |
| Girdi (sentetik yedek, `JSON.stringify(…, null, 1)`) | 40 satır | 26 eşleşme |
| Çıktı (`deney-rapor-ornek.txt`) | **0** | **0** |

Aynı denetim `tests/kao/test_k3p_deney_rapor.js` içinde kalıcıdır (her kapıda koşar).
