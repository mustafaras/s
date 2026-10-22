# K3PD-15 görsel kanıt kontak sayfaları.
# Kullanım (bu dizinden): python3 kontak-olustur.py
# Girdi: onceki/*.png + sonraki/*.png (yeniden-uret-*.mjs betiklerinin çıktısı)
# Çıktı: kontak-*.jpg  (~580 KB toplam; ham PNG'ler repoya alınmaz)
from PIL import Image, ImageDraw, ImageFont
import os

FONT = None
for cand in ['/System/Library/Fonts/Supplemental/Arial.ttf', '/System/Library/Fonts/Helvetica.ttc', '/Library/Fonts/Arial.ttf']:
    if os.path.exists(cand):
        try:
            FONT = ImageFont.truetype(cand, 17); break
        except Exception:
            pass

def contact(pairs, out, cols=4, tile_w=300, label_h=30):
    thumbs = []
    for before, after, title in pairs:
        thumbs.append((before, title + ' · ÖNCEKİ'))
        thumbs.append((after, title + ' · SONRAKİ'))
    im0 = Image.open(thumbs[0][0])
    tile_h = int(tile_w * im0.height / im0.width)
    rows = (len(thumbs) + cols - 1) // cols
    W = cols * tile_w + (cols + 1) * 8
    H = rows * (tile_h + label_h) + (rows + 1) * 8
    sheet = Image.new('RGB', (W, H), (18, 20, 24))
    d = ImageDraw.Draw(sheet)
    for i, (path, label) in enumerate(thumbs):
        r, c = divmod(i, cols)
        x = 8 + c * (tile_w + 8)
        y = 8 + r * (tile_h + label_h + 8)
        im = Image.open(path).convert('RGB').resize((tile_w, tile_h), Image.LANCZOS)
        sheet.paste(im, (x, y + label_h))
        d.text((x + 2, y + 7), label, fill=(226, 232, 240), font=FONT)
    sheet.save(out, quality=84, optimize=True)
    print(out, os.path.getsize(out) // 1024, 'KB', sheet.size)

contact([
    ('onceki/ONCEKI-0-yaldiz-oncesi.png', 'sonraki/SONRAKI-0-yaldiz-oncesi.png', '0 · yaldız öncesi'),
    ('onceki/ONCEKI-1-sentetik-350ms.png', 'sonraki/SONRAKI-1-sentetik-350ms.png', '1 · t=350 ms'),
    ('onceki/ONCEKI-2-sentetik-1850ms.png', 'sonraki/SONRAKI-2-sentetik-1850ms.png', '2 · t=1850 ms (kritik)'),
    ('onceki/ONCEKI-3-cikis-sonrasi.png', 'sonraki/SONRAKI-3-cikis-sonrasi.png', '3 · çıkış sonrası'),
], 'kontak-1-ses-bitmeden-yaldiz.jpg', cols=4)

contact([
    ('onceki/ONCEKI-a2-ended-1.png', 'sonraki/SONRAKI-a2-ended-1.png', 'a2 · 1. ended'),
    ('onceki/ONCEKI-a3-ended-2.png', 'sonraki/SONRAKI-a3-ended-2.png', 'a3 · 2. ended'),
    ('onceki/ONCEKI-a4-ended-3.png', 'sonraki/SONRAKI-a4-ended-3.png', 'a4 · 3. ended'),
    ('onceki/ONCEKI-b1-klipsiz-satir.png', 'sonraki/SONRAKI-b1-klipsiz-satir.png', 'b1 · klipsiz satır'),
], 'kontak-2-ended-ilerleme.jpg', cols=4)

contact([
    ('onceki/ONCEKI-c1-reduced-motion.png', 'sonraki/SONRAKI-c1-reduced-motion.png', 'c1 · hareket azaltma'),
], 'kontak-3-reduced-motion.jpg', cols=2, tile_w=340)
