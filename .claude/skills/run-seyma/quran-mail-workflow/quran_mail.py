#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""QY-09 — Kur'an Yolculuğu istek maili.

STAGED DOSYA: bu script `mustafaras/s` reposunda ÇALIŞMAZ; `.github/scripts/
quran_mail.py` olarak `mustafaras/seyma-data`'ya kopyalanması içindir (bkz.
bu klasördeki README.md). `aeon_mail.py` ile aynı ilke: yalnız standart
kütüphane (json/os/ssl/smtplib/email), Gmail SSL (465) ile gönderim.

data/quran-request-outbox.json'u okur, data/quran-delivery.json'da henüz
status:'sent' OLMAYAN istekleri bulur, her biri için plan §8'deki konu/gövde
şablonuyla TEK bir e-posta gönderir, sonucu idempotent biçimde delivery
dosyasına yazar.

Idempotency: bir requestId zaten status:'sent' ise BİR DAHA ASLA e-posta
gönderilmez (workflow retry/yeniden çalıştırma çift mail üretmez — plan §9
"Workflow retry aynı isteği iki mail yapmasın" gereksinimi).

Secrets (veri reposunda tanımlı olmalı — MEVCUT, yeni secret gerekmez):
  MAIL_USERNAME  Gmail adresi (gönderen)
  MAIL_PASSWORD  Gmail Uygulama Şifresi (16 haneli)
  MAIL_TO        (opsiyonel) alıcı; boşsa MAIL_USERNAME

Secret eksikse hiçbir şey göndermez, delivery.json'a DOKUNMAZ, exit 0 ile
çıkar (workflow yeşil kalır) — aeon_mail.py ile aynı davranış. Bu, plan
DOĞRULAMA notundaki "gerçek e-posta ancak açık kullanıcı izniyle" ilkesini
teknik olarak da uygular: secret eklenene kadar tek bir gerçek e-posta
gitmez.

data/latest.json'a bu script'in hiçbir satırı dokunmaz.
"""
import json
import os
import re
import smtplib
import ssl
from datetime import datetime, timezone, timedelta
from email.message import EmailMessage
from email.utils import formatdate, make_msgid

OUTBOX_PATH = "data/quran-request-outbox.json"
DELIVERY_PATH = "data/quran-delivery.json"
SCHEMA_VERSION = 1
IST = timezone(timedelta(hours=3))  # İstanbul (UTC+3) — aeon_mail.py ile aynı

REQUEST_ID_RE = re.compile(r"^qr_[A-Za-z0-9_-]{8,64}$")
SURAH_ID_RE = re.compile(r"^[a-z]+(-[a-z]+)*$")
REPLY_TOKEN_RE = re.compile(r"^[A-Za-z0-9_-]{32,128}$")


def read_json(path, default):
    """Bozuk/eksik dosyada ÇÖKMEZ — quranTransportV1.js'in parse* fonksiyonlarıyla
    aynı ilke: güvenli varsayılana düşer, hatayı loglar."""
    try:
        with open(path, "r", encoding="utf-8") as f:
            return json.load(f)
    except FileNotFoundError:
        return default
    except Exception as e:
        print("UYARI: %s okunamadı (%s) — varsayılan kullanılıyor." % (path, e))
        return default


def is_valid_entry(request_id, entry):
    if not isinstance(entry, dict):
        return False
    if entry.get("requestId") not in (None, request_id):
        return False
    if not REQUEST_ID_RE.match(str(request_id)):
        return False
    if not SURAH_ID_RE.match(str(entry.get("surahId") or "")):
        return False
    if not REPLY_TOKEN_RE.match(str(entry.get("replyToken") or "")):
        return False
    order = entry.get("revelationOrder")
    if not isinstance(order, int) or isinstance(order, bool) or not (1 <= order <= 114):
        return False
    if not entry.get("requestedAt"):
        return False
    return True


def pending_requests(outbox, delivery):
    """quranTransportV1.js pendingOutboxRequests ile aynı kural: delivery'de
    status:'sent' OLMAYAN her istek bekliyor sayılır. Eskiden yeniye sıralanır
    (adil işleme sırası, requestedAt üzerinden)."""
    ob = (outbox or {}).get("requests") or {}
    dl = (delivery or {}).get("requests") or {}
    out = []
    for rid, entry in ob.items():
        if not is_valid_entry(rid, entry):
            print("UYARI: geçersiz outbox kaydı atlandı: %s" % rid)
            continue
        receipt = dl.get(rid)
        if receipt and receipt.get("status") == "sent":
            continue  # zaten gönderildi — İKİNCİ KEZ mail YOK (idempotency)
        out.append((rid, entry))
    out.sort(key=lambda kv: kv[1].get("requestedAt") or "")
    return out


def fmt_ist(iso):
    """ISO zaman damgasını İstanbul saatiyle okunur biçime çevirir (aeon_mail.py ile aynı)."""
    if not iso:
        return "-"
    try:
        s = str(iso).replace("Z", "+00:00")
        dt = datetime.fromisoformat(s)
        if dt.tzinfo is None:
            dt = dt.replace(tzinfo=timezone.utc)
        return dt.astimezone(IST).strftime("%d.%m.%Y %H:%M")
    except Exception:
        return str(iso)


def build_email(request_id, entry):
    """Plan §8'deki konu/gövde şablonunun BİREBİR uygulanması."""
    surah_name = str(entry.get("surahName") or entry.get("surahId") or "")
    order = entry.get("revelationOrder")
    mushaf = entry.get("mushafOrder")
    reply_token = str(entry.get("replyToken") or "")
    requested_at = fmt_ist(entry.get("requestedAt"))

    subject = "[KURAN-REQ:%s:%s] %s. Durak · %s" % (request_id, reply_token, order, surah_name)

    lines = [
        "Raşit, Kur’an Yolculuğu için yeni bir anlatım isteği var.",
        "",
        "Sûre: %s" % surah_name,
        "Nüzul sırası: %s" % order,
    ]
    # mushafOrder isteğe bağlıdır (QY-04 şeması); yoksa satır atlanır, "None" yazılmaz.
    if isinstance(mushaf, int) and not isinstance(mushaf, bool) and 1 <= mushaf <= 114:
        lines.append("Mushaf sırası: %s" % mushaf)
    lines += [
        "İstek zamanı: %s" % requested_at,
        "",
        "Cevaplamak için bu e-postaya yalnızca tek bir YouTube video bağlantısıyla",
        "yanıt vermen yeterli.",
        "",
        "Kabul edilen örnekler:",
        "https://www.youtube.com/watch?v=...",
        "https://youtu.be/...",
    ]
    body = "\n".join(lines) + "\n"
    return subject, body


def send_mail(user, pwd, to_addr, subject, body):
    """Gerçek SMTP gönderimi — testlerde smtplib.SMTP_SSL monkeypatch'lenerek
    hiç ağa çıkılmadan doğrulanır (bkz. test_quran_mail.py).

    Herhangi bir SMTP hatası (ör. bazı sunucular auth hatasında kullanıcı adını
    metne gömer) YAKALANIR ve kullanıcı adı/parola değerleri metinden ÇIKARILIR,
    ANCAK sonra tekrar fırlatılır — process() bu sanitize edilmiş mesajı görür.
    Bu, "stack trace/adres/token yasak" kısıtlamasının yalnızca 80 karakter
    kısaltmasına güvenmek yerine gerçekten UYGULANMASINI sağlar."""
    msg = EmailMessage()
    msg["Subject"] = subject
    msg["From"] = user
    msg["To"] = to_addr
    msg["Date"] = formatdate(localtime=True)
    msg["Message-ID"] = make_msgid(domain="seyma.local")
    msg.set_content(body)

    ctx = ssl.create_default_context()
    try:
        with smtplib.SMTP_SSL("smtp.gmail.com", 465, context=ctx, timeout=30) as smtp:
            smtp.login(user, pwd)
            smtp.send_message(msg)
    except Exception as e:
        raise RuntimeError(redact_secrets(str(e), user, pwd)) from None
    return msg["Message-ID"]


def redact_secrets(text, *secrets):
    """Bilinen secret değerlerini (parola, gönderen adres) metinden çıkarır.
    Boş/None değerler atlanır (yanlışlıkla her şeyi silmesin)."""
    out = str(text)
    for s in secrets:
        if s:
            out = out.replace(s, "[REDACTED]")
    return out


def short_error(e):
    """Hata YALNIZ kısa kod olarak taşınır — stack trace/adres/token YASAK
    (quranTransportV1.js normDeliveryEntry ile aynı kısıtlama, plan §7).
    redact_secrets ÇAĞRILDIKTAN SONRA burada yalnız uzunluk sınırlanır."""
    return str(e).replace("\n", " ")[:80]


def process(outbox, delivery, sender, now_iso):
    """Saf iş mantığı: gönderim fonksiyonunu (sender) parametre olarak alır,
    böylece testlerde gerçek SMTP hiç çağrılmaz. Yeni bir delivery sözlüğü
    döndürür; girdiler mutasyona uğramaz."""
    delivery = json.loads(json.dumps(delivery)) if delivery else {"schemaVersion": SCHEMA_VERSION, "updatedAt": None, "requests": {}}
    requests_map = dict(delivery.get("requests") or {})
    pending = pending_requests(outbox, delivery)
    if not pending:
        return delivery, 0

    changed = 0
    for rid, entry in pending:
        subject, body = build_email(rid, entry)
        try:
            provider_id = sender(subject, body)
            requests_map[rid] = {
                "status": "sent",
                "sentAt": now_iso,
                "providerMessageId": provider_id,
                "error": None,
            }
            print("Mail gönderildi -> %s (%s)" % (rid, entry.get("surahName")))
        except Exception as e:
            requests_map[rid] = {
                "status": "failed",
                "sentAt": None,
                "providerMessageId": None,
                "error": short_error(e),
            }
            print("Mail GÖNDERİLEMEDİ -> %s (%s)" % (rid, short_error(e)))
        changed += 1

    delivery["schemaVersion"] = SCHEMA_VERSION
    delivery["updatedAt"] = now_iso
    delivery["requests"] = requests_map
    return delivery, changed


def main():
    user = (os.environ.get("MAIL_USERNAME") or "").strip()
    pwd = os.environ.get("MAIL_PASSWORD") or ""
    to_addr = (os.environ.get("MAIL_TO") or "").strip() or user

    outbox = read_json(OUTBOX_PATH, {"schemaVersion": SCHEMA_VERSION, "updatedAt": None, "requests": {}})
    delivery = read_json(DELIVERY_PATH, {"schemaVersion": SCHEMA_VERSION, "updatedAt": None, "requests": {}})

    pending = pending_requests(outbox, delivery)
    if not pending:
        print("Bekleyen istek yok — atlanıyor.")
        return 0

    if not user or not pwd:
        # aeon_mail.py ile AYNI davranış: secret yoksa delivery.json'a DOKUNMA,
        # istekler pending kalsın (secret eklenince aynı istek yine denenir).
        print("MAIL_USERNAME / MAIL_PASSWORD tanımlı değil — %d bekleyen istek "
              "ATLANDI (secret ekleyince aktif olur)." % len(pending))
        return 0

    def sender(subject, body):
        return send_mail(user, pwd, to_addr, subject, body)

    now_iso = datetime.now(timezone.utc).strftime("%Y-%m-%dT%H:%M:%S.") + \
        ("%03dZ" % (datetime.now(timezone.utc).microsecond // 1000))
    updated, changed = process(outbox, delivery, sender, now_iso)

    if changed:
        with open(DELIVERY_PATH, "w", encoding="utf-8") as f:
            json.dump(updated, f, ensure_ascii=False, indent=2)
            f.write("\n")
        print("%s güncellendi (%d kayıt işlendi)." % (DELIVERY_PATH, changed))
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
