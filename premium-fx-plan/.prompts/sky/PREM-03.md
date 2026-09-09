# PREM-03 — `sey-stagger` sınıf/efekt birleştirme

**Kart 15/15 · PREM · Dosya: `app.js` · DÜŞÜK ÖNCELİK**

> **Önce `SKY-00-ONBILGI.md` oku.** Bu kartta SADECE aşağıdaki iş var.
> Başka dosyaya dokunma. Karar gerekiyorsa DUR ve kullanıcıya sor.

---

## 1. ÖNCE ANLA — bu bir bozukluk DEĞİL

Denetim `.sey-stagger` sınıfının 7 ana sekmede de **0** olduğunu ölçtü.
**Ama kademeli giriş EFEKTİ zaten çalışıyor** — `SeyFx.enter()` her elemana
`animationDelay = i * 40ms` veriyor. Yani ölçüm **sınıfı** sayıyordu,
**efekti** değil.

Bu kart tutarlılık kazancıdır, görsel kazanç değil. Zamanın kısıtlıysa
**atla** ve rapora "atlandı, gerekçe: görsel kazanç yok" yaz.

## 2. AMAÇ

Ana sekme kartlarının kademeli girişini inline `animationDelay` yerine
`.sey-stagger` + `--i` sınıf sistemine taşı — böylece tek bir hareket
sistemi kalır.

## 3. NE YAPACAKSIN

### Adım 1 — mevcut çağrıyı bul

`app.js` içinde:

```javascript
      window.SeyFx.enter('#app .sey-hdr-scene, #app .surface', 40);
```

### Adım 2 — sınıf tabanlı sıraya çevir

Bu satırı şununla değiştir:

```javascript
      // PREM-03: kademeli giriş artık tek sistemde — .sey-stagger + --i.
      // (Eskiden SeyFx.enter inline animationDelay yazıyordu; efekt aynıydı
      //  ama iki ayrı hareket sistemi vardı.)
      try{
        var _sf = document.querySelectorAll('#app .sey-hdr-scene, #app .surface');
        for(var _i=0; _i<_sf.length; _i++){
          _sf[_i].style.setProperty('--i', String(Math.min(_i, 8)));
          _sf[_i].classList.add('sey-stagger');
        }
      }catch(e){}
      window.SeyFx.enter('#app .sey-hdr-scene, #app .surface', 40);
```

## 4. DOĞRULAMA

```bash
node --check app.js
for t in tests/app/*.js tests/panel/*.js; do node "$t" >/dev/null 2>&1 || echo "FAIL $t"; done
node .claude/skills/run-seyma/driver.mjs 2>&1 | grep -c '^FAIL'
grep -oE 'App\.[A-Za-z0-9_]+\s*=[^=]' app.js | grep -oE 'App\.[A-Za-z0-9_]+' | sort -u | wc -l
```

**Beklenen:** FAIL yok · driver `0` · handler **718**

## 5. GÖRSEL DOĞRULAMA (zorunlu)

Yerel sunucuda sekmeler arasında geçiş yap. Kartların **sırayla** belirdiğini
gör. Eğer hepsi aynı anda beliriyorsa veya titriyorsa: **DUR**, değişikliği
geri al.

## 6. BİTİRME

```bash
git add app.js index.html
git commit -m "prem: PREM-03 kademeli girisi tek sisteme tasi

Inline animationDelay yerine .sey-stagger + --i. Efekt ayni, sistem tek.

Co-Authored-By: Claude Opus 5 <noreply@anthropic.com>"
```

`SKY-STATE.json` → `"PREM-03": "done"`
