#!/usr/bin/env python3
"""QY-21 — data/quran-delivery.json için çakışma-güvenli birleştirme.

NEDEN VAR (gerçek üretim vakası, 2026-08-15 ve 2026-08-17):
Uygulama arka arkaya birkaç istek yazınca quran-mail workflow'unun birden
fazla çalıştırması aynı anda `data/quran-delivery.json`'u değiştiriyor.
Eski adım çakışmada `git pull --rebase` deniyordu; iki çalıştırma da AYNI
JSON satırlarına dokunduğu için rebase CONFLICT veriyor, adım hata ile
düşüyor ve o çalıştırmanın teslim kaydı KAYBOLUYORDU. Mail zaten gitmiş
olduğu halde istek "hâlâ bekliyor" görünüp bir sonraki tetiklemede TEKRAR
maillendi (fatiha isteği 15 Ağustos'ta gönderilip 17 Ağustos'ta ikinci kez
gönderildi).

ÇÖZÜM: metin düzeyinde rebase yerine ALAN düzeyinde birleştirme. İki taraf
da aynı sözleşmeyi (QuranTransportV1 delivery) paylaştığı için birleşme
kuralları belirsiz değildir:
  • requestId'ler birleşir (union) — hiçbir teslim kaydı düşmez,
  • 'sent' KESİNDİR: bir 'failed' asla bir 'sent'i ezemez
    (quranTransportV1.js applyDeliveryReceipt'teki `sent_is_final` ile aynı),
  • aynı statüde uzak kayıt korunur (yazma savaşı çıkmaz),
  • updatedAt iki taraftan büyük olanı olur.

Kullanım (workflow'un commit adımından çağrılır):
    python .github/scripts/merge_delivery.py <bizim.json> <uzak.json> <cikti.json>

Ağ erişimi yoktur, yalnız üç dosya okur/yazar. data/latest.json'a ASLA
dokunmaz.
"""
import json
import sys

SCHEMA_VERSION = 1
EMPTY = {"schemaVersion": SCHEMA_VERSION, "updatedAt": None, "requests": {}}


def read_json(path):
    """Bozuk/eksik dosya çökertmez: boş sözleşme döner (parse fonksiyonları
    ASLA throw etmez ilkesi — quranTransportV1.js ile aynı)."""
    try:
        with open(path, "r", encoding="utf-8") as handle:
            value = json.load(handle)
    except (OSError, ValueError):
        return dict(EMPTY)
    if not isinstance(value, dict):
        return dict(EMPTY)
    return value


def requests_of(doc):
    value = doc.get("requests")
    return value if isinstance(value, dict) else {}


def newer(a, b):
    """İki ISO damgasından büyüğü; biri yoksa diğeri."""
    if not isinstance(a, str):
        return b if isinstance(b, str) else None
    if not isinstance(b, str):
        return a
    return a if a > b else b


def merge(ours, theirs):
    """Uzak kaydın üzerine kendi kayıtlarımızı güvenle uygular."""
    merged = dict(requests_of(theirs))
    for request_id, receipt in requests_of(ours).items():
        if not isinstance(receipt, dict):
            continue
        current = merged.get(request_id)
        if isinstance(current, dict) and current.get("status") == "sent":
            # 'sent' geri alınamaz — kendi 'failed'imiz onu ezemez.
            continue
        merged[request_id] = receipt
    return {
        "schemaVersion": SCHEMA_VERSION,
        "updatedAt": newer(ours.get("updatedAt"), theirs.get("updatedAt")),
        "requests": merged,
    }


def main():
    if len(sys.argv) != 4:
        print("kullanım: merge_delivery.py <bizim.json> <uzak.json> <cikti.json>", file=sys.stderr)
        return 2
    ours_path, theirs_path, out_path = sys.argv[1], sys.argv[2], sys.argv[3]
    result = merge(read_json(ours_path), read_json(theirs_path))
    with open(out_path, "w", encoding="utf-8") as handle:
        json.dump(result, handle, ensure_ascii=False, indent=2)
        handle.write("\n")
    print("delivery birlestirildi: %d kayit" % len(result["requests"]))
    return 0


if __name__ == "__main__":
    sys.exit(main())
