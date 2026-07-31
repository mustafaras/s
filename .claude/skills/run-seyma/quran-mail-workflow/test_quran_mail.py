#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""QY-09 kabul kapısı: quran_mail.py'ın fixture/dry-run testleri.

GERÇEK SMTP BAĞLANTISI YOK — smtplib.SMTP_SSL tamamen sahte bir sınıfla
değiştirilir, hiçbir ağ çağrısı yapılmaz. Gerçek dosya sistemine de
dokunulmaz: read_json/dosya-yazma çağrıları saf process()/pending_requests()
üzerinden, in-memory fixture'larla test edilir.

Çalıştırma: python test_quran_mail.py
            (bu klasörden VEYA repo kökünden çalışabilir)
"""
import os
import sys
import unittest

sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
import quran_mail as qm  # noqa: E402

AT = "2026-07-31T09:00:00.000Z"
NOW = "2026-07-31T10:00:00.000Z"
TOKEN = "a" * 40


def entry(surah_id, order, mushaf=None, name=None, at=AT, token=TOKEN, request_id=None):
    e = {
        "requestId": request_id,
        "surahId": surah_id,
        "revelationOrder": order,
        "surahName": name or surah_id,
        "requestedAt": at,
        "replyToken": token,
    }
    if mushaf is not None:
        e["mushafOrder"] = mushaf
    return e


def outbox_of(**entries):
    return {"schemaVersion": 1, "updatedAt": AT, "requests": entries}


def empty_delivery():
    return {"schemaVersion": 1, "updatedAt": None, "requests": {}}


class FakeSMTP:
    """smtplib.SMTP_SSL yerine geçer — hiçbir ağ çağrısı yapmaz, gönderilen
    mesajları sınıf düzeyinde bir listede toplar (test bunu okur)."""
    sent = []          # [(subject, to, body), ...]
    fail_next = False  # bir sonraki send_message çağrısını fırlat

    def __init__(self, host, port, context=None, timeout=None):
        pass

    def __enter__(self):
        return self

    def __exit__(self, *a):
        return False

    def login(self, user, pwd):
        if FakeSMTP.fail_next:
            FakeSMTP.fail_next = False
            import smtplib
            # Bazı gerçek SMTP sunucuları auth hatasında kullanıcı adını/parolayı
            # metne gömer — kasıtlı olarak GERÇEKÇİ ve SIZDIRAN bir mesaj üretiyoruz;
            # send_mail()'in bunu redact_secrets ile temizlediğini kanıtlamak için.
            raise smtplib.SMTPAuthenticationError(
                535, b"5.7.8 Username and Password not accepted for user=%s pass=%s" % (
                    user.encode(), pwd.encode()))

    def send_message(self, msg):
        FakeSMTP.sent.append((msg["Subject"], msg["To"], msg.get_content()))


class QuranMailTests(unittest.TestCase):
    def setUp(self):
        FakeSMTP.sent = []
        FakeSMTP.fail_next = False
        self._orig_smtp = qm.smtplib.SMTP_SSL
        qm.smtplib.SMTP_SSL = FakeSMTP

    def tearDown(self):
        qm.smtplib.SMTP_SSL = self._orig_smtp

    # ── 1) Boş outbox: hiçbir şey göndermez, delivery değişmez ─────────────
    def test_empty_outbox_sends_nothing(self):
        delivery, changed = qm.process(outbox_of(), empty_delivery(), self._sender(), NOW)
        self.assertEqual(changed, 0)
        self.assertEqual(delivery["requests"], {})
        self.assertEqual(len(FakeSMTP.sent), 0)

    # ── 2) Tek bekleyen istek: e-posta gönderilir, subject/body plan §8'e uyar ─
    def test_single_pending_request_sends_correct_email(self):
        rid = "qr_" + "b" * 24
        ob = outbox_of(**{rid: entry("fatiha", 5, mushaf=1, name="Fâtiha", request_id=rid)})
        delivery, changed = qm.process(ob, empty_delivery(), self._sender(), NOW)
        self.assertEqual(changed, 1)
        self.assertEqual(len(FakeSMTP.sent), 1)
        subject, to, body = FakeSMTP.sent[0]

        self.assertIn("[KURAN-REQ:%s:%s]" % (rid, TOKEN), subject)
        self.assertIn("5. Durak", subject)
        self.assertIn("Fâtiha", subject)
        self.assertIn("Sûre: Fâtiha", body)
        self.assertIn("Nüzul sırası: 5", body)
        self.assertIn("Mushaf sırası: 1", body)
        self.assertIn("İstek zamanı:", body)
        self.assertIn("https://www.youtube.com/watch?v=...", body)
        self.assertIn("https://youtu.be/...", body)

        rec = delivery["requests"][rid]
        self.assertEqual(rec["status"], "sent")
        self.assertEqual(rec["sentAt"], NOW)
        self.assertTrue(rec["providerMessageId"])
        self.assertIsNone(rec["error"])

    # ── 3) mushafOrder yoksa satır atlanır, "None" yazılmaz ────────────────
    def test_missing_mushaf_order_omits_line_gracefully(self):
        rid = "qr_" + "c" * 24
        ob = outbox_of(**{rid: entry("ihlas", 22, name="İhlâs", request_id=rid)})
        qm.process(ob, empty_delivery(), self._sender(), NOW)
        subject, to, body = FakeSMTP.sent[0]
        self.assertNotIn("Mushaf sırası", body)
        self.assertNotIn("None", body)

    # ── 4) Idempotency: zaten 'sent' olan istek İKİNCİ KEZ mail almaz ──────
    def test_already_sent_request_is_not_resent(self):
        rid = "qr_" + "d" * 24
        ob = outbox_of(**{rid: entry("kalem", 2, request_id=rid)})
        already_sent = {"schemaVersion": 1, "updatedAt": AT,
                         "requests": {rid: {"status": "sent", "sentAt": AT, "providerMessageId": "x", "error": None}}}
        delivery, changed = qm.process(ob, already_sent, self._sender(), NOW)
        self.assertEqual(changed, 0)
        self.assertEqual(len(FakeSMTP.sent), 0)
        self.assertEqual(delivery["requests"][rid]["sentAt"], AT)  # değişmedi

    def test_retry_run_twice_sends_exactly_once(self):
        rid = "qr_" + "e" * 24
        ob = outbox_of(**{rid: entry("asr", 13, request_id=rid)})
        d1, c1 = qm.process(ob, empty_delivery(), self._sender(), NOW)
        self.assertEqual(c1, 1)
        d2, c2 = qm.process(ob, d1, self._sender(), "2026-07-31T11:00:00.000Z")
        self.assertEqual(c2, 0, "ikinci çalıştırma yeni bir gönderim üretmemeli")
        self.assertEqual(len(FakeSMTP.sent), 1, "toplamda tek mail gitmeli")

    # ── 5) Çoklu bekleyen istek: bir tanesi zaten sent, diğeri yeni ────────
    def test_mixed_pending_and_sent_only_sends_pending(self):
        rid_sent = "qr_" + "f" * 24
        rid_pending = "qr_" + "g" * 24
        ob = outbox_of(**{
            rid_sent: entry("kadir", 25, at="2026-07-31T08:00:00.000Z", request_id=rid_sent),
            rid_pending: entry("kadir", 25, at="2026-07-31T09:30:00.000Z", request_id=rid_pending),
        })
        pre = {"schemaVersion": 1, "updatedAt": AT,
               "requests": {rid_sent: {"status": "sent", "sentAt": AT, "providerMessageId": "x", "error": None}}}
        delivery, changed = qm.process(ob, pre, self._sender(), NOW)
        self.assertEqual(changed, 1)
        self.assertEqual(delivery["requests"][rid_pending]["status"], "sent")
        self.assertEqual(delivery["requests"][rid_sent]["sentAt"], AT)  # önceki kayıt korunuyor

    # ── 6) SMTP hatası: 'failed' kaydı, diğer istekler yine de işlenir ─────
    def test_smtp_failure_marks_failed_and_continues_batch(self):
        rid_fail = "qr_" + "h" * 24
        rid_ok = "qr_" + "i" * 24
        ob = outbox_of(**{
            rid_fail: entry("duha", 11, at="2026-07-31T08:00:00.000Z", request_id=rid_fail),
            rid_ok: entry("insirah", 12, at="2026-07-31T08:30:00.000Z", request_id=rid_ok),
        })
        FakeSMTP.fail_next = True  # yalnız ilk gönderim (eskiden yeniye sıralı) başarısız olsun
        delivery, changed = qm.process(ob, empty_delivery(), self._sender(), NOW)
        self.assertEqual(changed, 2)
        self.assertEqual(delivery["requests"][rid_fail]["status"], "failed")
        self.assertIsNone(delivery["requests"][rid_fail]["providerMessageId"])
        self.assertTrue(delivery["requests"][rid_fail]["error"])
        self.assertLessEqual(len(delivery["requests"][rid_fail]["error"]), 80)
        self.assertEqual(delivery["requests"][rid_ok]["status"], "sent", "bir istek başarısız olsa da diğeri işlenmeli")
        self.assertEqual(len(FakeSMTP.sent), 1)

    # ── 7) Hata mesajında secret/adres SIZMAZ (redact_secrets, salt truncation değil) ─
    def test_error_message_never_leaks_secret(self):
        rid = "qr_" + "j" * 24
        ob = outbox_of(**{rid: entry("nas", 21, request_id=rid)})
        FakeSMTP.fail_next = True
        delivery, _ = qm.process(ob, empty_delivery(), self._sender(), NOW)
        err = delivery["requests"][rid]["error"]
        self.assertNotIn("app-password", err, "parolanın kendisi hata mesajında olmamalı")
        self.assertNotIn("seyma@example.com", err, "gönderen adres hata mesajında olmamalı")
        self.assertIn("[REDACTED]", err, "gerçekten redact edildiği kanıtlanmalı")

    # ── 8) Bozuk/eksik outbox kaydı çökertmez, atlanır ─────────────────────
    def test_malformed_entries_are_skipped_not_crashed(self):
        good_rid = "qr_" + "k" * 24
        ob = {
            "schemaVersion": 1, "updatedAt": AT,
            "requests": {
                good_rid: entry("tin", 28, request_id=good_rid),
                "kotu-id": entry("tin", 28, request_id="kotu-id"),          # requestId deseni bozuk
                "qr_" + "l" * 24: {"surahId": "BÜYÜK HARF", "revelationOrder": 1, "requestedAt": AT, "replyToken": TOKEN},
                "qr_" + "m" * 24: entry("tin", 999, request_id="qr_" + "m" * 24),  # sıra dışı
            },
        }
        delivery, changed = qm.process(ob, empty_delivery(), self._sender(), NOW)
        self.assertEqual(changed, 1)
        self.assertIn(good_rid, delivery["requests"])
        self.assertEqual(len(delivery["requests"]), 1)

    # ── 9) fmt_ist İstanbul saatine doğru çeviriyor ────────────────────────
    def test_fmt_ist_converts_to_istanbul_time(self):
        # 09:00 UTC -> 12:00 İstanbul (UTC+3)
        self.assertEqual(qm.fmt_ist("2026-07-31T09:00:00.000Z"), "31.07.2026 12:00")
        self.assertEqual(qm.fmt_ist(None), "-")
        self.assertEqual(qm.fmt_ist("bozuk-tarih"), "bozuk-tarih")

    # ── 10) main(): secret yokken hiç göndermez, delivery dosyasına dokunmaz ─
    def test_main_without_secrets_touches_nothing(self):
        import tempfile
        import json
        rid = "qr_" + "n" * 24
        with tempfile.TemporaryDirectory() as d:
            cwd = os.getcwd()
            os.chdir(d)
            try:
                os.makedirs("data", exist_ok=True)
                with open(qm.OUTBOX_PATH, "w", encoding="utf-8") as f:
                    json.dump(outbox_of(**{rid: entry("alak", 1, request_id=rid)}), f)
                env_backup = {k: os.environ.pop(k, None) for k in ("MAIL_USERNAME", "MAIL_PASSWORD", "MAIL_TO")}
                try:
                    rc = qm.main()
                finally:
                    for k, v in env_backup.items():
                        if v is not None:
                            os.environ[k] = v
                self.assertEqual(rc, 0)
                self.assertFalse(os.path.exists(qm.DELIVERY_PATH), "secret yokken delivery.json HİÇ oluşturulmamalı")
                self.assertEqual(len(FakeSMTP.sent), 0)
            finally:
                os.chdir(cwd)

    # ── 11) main(): outbox hiç yoksa (dosya bulunamadı) çökmez ─────────────
    def test_main_with_no_outbox_file_is_safe(self):
        import tempfile
        with tempfile.TemporaryDirectory() as d:
            cwd = os.getcwd()
            os.chdir(d)
            try:
                os.environ["MAIL_USERNAME"] = "seyma@example.com"
                os.environ["MAIL_PASSWORD"] = "not-a-real-password"
                try:
                    rc = qm.main()
                finally:
                    del os.environ["MAIL_USERNAME"]
                    del os.environ["MAIL_PASSWORD"]
                self.assertEqual(rc, 0)
                self.assertFalse(os.path.exists(qm.DELIVERY_PATH))
            finally:
                os.chdir(cwd)

    def _sender(self):
        def sender(subject, body):
            return qm.send_mail("seyma@example.com", "app-password", "rasit@example.com", subject, body)
        return sender


if __name__ == "__main__":
    unittest.main(verbosity=2)
