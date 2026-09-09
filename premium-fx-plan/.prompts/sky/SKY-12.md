# SKY-12 — Ölçüm matrisi ve rapor

**Kart 12/15 · Faz 3 · Kod değişikliği YOK — yalnız ölçüm ve rapor**

> **Önce `SKY-00-ONBILGI.md` oku.** Bu kartta SADECE aşağıdaki iş var.
> Başka dosyaya dokunma. Karar gerekiyorsa DUR ve kullanıcıya sor.

---

## 1. AMAÇ

Yaptığın işin **gerçekten görünür** olduğunu ölç ve belgele. Bu projede
"fixture yeşil ama özellik görünmüyor" hatası iki kez yaşandı — bu kart
onu engeller.

## 2. ORTAM

```bash
cat > "$TMPDIR/nocache.py" <<'PY'
import functools, http.server
class H(http.server.SimpleHTTPRequestHandler):
    protocol_version = "HTTP/1.1"
    def end_headers(self):
        self.send_header("Cache-Control","no-store, no-cache, must-revalidate, max-age=0")
        super().end_headers()
    def log_message(self,*a): pass
h=functools.partial(H, directory="/Users/m_ras/Desktop/seyma")
http.server.ThreadingHTTPServer(("127.0.0.1",9000),h).serve_forever()
PY
python3 "$TMPDIR/nocache.py" &
```

Tarayıcı: **izole bağlam**, viewport `414x896x2,mobile,touch`, sentetik veri
(gerçek token/parola YOK).

## 3. ÖLÇÜM MATRİSİ

7 hava × 4 vakit × 2 tema = **56 ekran görüntüsü**.
Kayıt yeri: `premium-fx-plan/assets/header-v2-<YYYYMMDD>/`
Ad: `hdr-<hava>-<vakit>-<tema>.png`

Sahneyi değiştirmek için tarayıcı konsolunda:

```javascript
document.querySelector('.sey-hdr-sky').className =
  'sey-hdr-sky sky-time-<vakit> sky-wx-<hava>';
window.SeySkyFx.update({time:'amb-time-<vakit>', weather:'amb-wx-<hava>',
  isDay:true, intensity:0.6, seed:0.42, solar:0.5, wind:15});
```

## 4. HESAPLANACAK METRİKLER

| Metrik | Nasıl | Eşik |
|---|---|---|
| Sahne ayrımı | Header bölgesi (üst 340 pt) ortalama mutlak piksel farkı | **≥ 3**, hedef ≥ 5 |
| Kare hızı | `performance_start_trace` 5 sn | **≥ 55 fps** |
| Okunabilirlik | Header metni × en parlak sahne | **≥ 4,5:1** |
| reduced-motion | `matchMedia` stub | hareket durur, renk kalır |
| Gating | `premiumAtmosphere=false` | canvas mount **edilmez** |

Piksel farkı için:

```python
from PIL import Image; import numpy as np
def load(p): return np.asarray(Image.open(p).convert('RGB')).astype(np.int16)
d = np.abs(load('a.png')[:680] - load('b.png')[:680]).mean()
```

**Karşılaştırma tabanı (önceki sürüm, ölçülmüş):**
zaman ayrımı 10,872 · hava açık↔fırtına 5,092 · hava açık↔kar 4,420

## 5. RAPOR

`premium-fx-plan/deliverables/HEADER-V2-<YYYYMMDD>.md`:

1. Seçilen teknik yaklaşım ve gerekçesi
2. 7 hava × 4 vakit sahne sözleşmesi — ne çizildiği
3. **Önce/sonra piksel farkı tablosu**
4. Performans (fps, uzun görev)
5. Erişilebilirlik (kontrast, reduced-motion, gating)
6. Hangi kartlar yapıldı / atlandı, gerekçesiyle
7. Değişmezlik kanıtları (718/391/1/0/0/0/0)
8. Kanıt seviyesi: K1 kaynak/test · K2 yerel görsel · K3 cihaz ⏳

## 6. ⚠️ BİTİRMEDEN ÖNCE

```bash
pkill -f nocache.py
lsof -nP -iTCP:9000 -sTCP:LISTEN || echo "sunucu durduruldu ✅"
```

**Sunucuyu durdurmadan turu bitirme.**

## 7. DÜRÜSTLÜK

- Ölçmediğin metriği "geçti" **yazma**.
- Bir sahne eşiğin altında kalırsa **rapora yaz**, gizleme.
- "Cihazda düzeldi" **deme** — K3 yalnız kullanıcıdan gelir.

## 8. BİTİRME

```bash
git add premium-fx-plan/
git commit -m "sky: SKY-12 header v2 olcum matrisi ve rapor

56 ekran goruntusu (7 hava x 4 vakit x 2 tema), piksel farki tablosu,
fps ve kontrast olcumu.

Co-Authored-By: Claude Opus 5 <noreply@anthropic.com>"
```

`SKY-STATE.json` → `"SKY-12": "done"`
