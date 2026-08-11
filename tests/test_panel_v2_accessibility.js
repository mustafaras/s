// PROMPT-37 — Klavye navigasyonu ve screen reader sözleşmesi.
// Gerçek tarayıcı, ağ, token veya kullanıcı verisi kullanılmaz.
"use strict";

const { boot, read, assert } = require("./helpers/panel-v2-test-helper");

function event(id) {
  return {
    eventId: id,
    correlationId: id,
    sequence: 1,
    occurredAt: "2026-08-11T08:00:00.000Z",
    persistedAt: "2026-08-11T08:00:00.000Z",
    submittedAt: "2026-08-11T08:00:00.000Z",
    acceptedAt: "2026-08-11T08:00:00.000Z",
    section: "wellness",
    path: "data.days.*.mood",
    operation: "record",
    summary: "Güvenli özet",
    source: "app",
    sourceDeviceId: "fixture",
    privacyClass: "summary",
    snapshotRevision: "a".repeat(40)
  };
}

function keyEvent(key, target) {
  let prevented = false;
  return {
    event: {
      key,
      target,
      preventDefault: function() { prevented = true; },
      getDefaultPrevented: function() { return prevented; }
    },
    prevented: function() { return prevented; }
  };
}

function makeNode(attrs, doc) {
  attrs = attrs || {};
  const node = {
    id: attrs.id || "",
    parentElement: attrs.parentElement || null,
    getAttribute: function(name) { return attrs[name] || ""; },
    focus: function() { doc.activeElement = node; },
    hidden: false
  };
  return node;
}

async function main() {
  const helper = boot();
  const baseDoc = helper.ctx.document;
  const app = baseDoc.getElementById("app");
  const rootEl = baseDoc.getElementById("root");
  const live = {
    textContent: "",
    setAttribute: function() {}
  };
  const listeners = {};
  const a11yDoc = {
    activeElement: null,
    addEventListener: function(type, listener) {
      if (!listeners[type]) listeners[type] = [];
      listeners[type].push(listener);
    },
    getElementById: function(id) {
      if (id === "app") return app;
      if (id === "root") return rootEl;
      if (id === "ae-live-region") return live;
      return null;
    },
    querySelector: function(selector) {
      if (selector.indexOf("data-focus-trap") !== -1 && helper.AeonV2.ui.selectedEventId) return trap;
      return null;
    },
    querySelectorAll: function(selector) {
      if (selector.indexOf("button, a, input") === 0) return [eventRow];
      return [];
    }
  };
  helper.ctx.document = a11yDoc;

  helper.AeonV2.init();
  assert(helper.AeonV2.getAccessibilityState().keyboardBound === true, "document klavye dinleyicisi bağlanıyor");
  assert(helper.AeonV2.getAccessibilityState().liveMessage === "", "başlangıçta gereksiz canlı duyuru yapılmıyor");

  let html = app.innerHTML;
  assert((html.match(/role="tab"/g) || []).length === 5, "ana navigasyonda beş semantik tab var");
  assert(html.includes('id="ae-tab-today"') && html.includes('tabindex="0"'), "aktif ana tab roving tabindex=0 taşıyor");
  assert((html.match(/tabindex="-1"/g) || []).length >= 4, "pasif ana tablar tab sırasından çıkarılıyor");
  assert(html.includes('id="ae-live-region"') === false, "canlı bölge app içeriğiyle yeniden yaratılmıyor");
  assert(read("panel-v2.html").includes('id="ae-live-region"') && read("panel-v2.html").includes('aria-live="polite"'), "kalıcı screen-reader canlı bölgesi shell içinde");
  assert(read("panel-v2.css").includes(".ae-sr-only"), "canlı bölge görsel olarak gizli yardımcı sınıfa sahip");

  const tablist = { getAttribute: function(name) { return name === "role" ? "tablist" : ""; }, querySelectorAll: function() { return tabs; } };
  const today = makeNode({ role: "tab", "data-tab": "today", id: "ae-tab-today", parentElement: tablist }, a11yDoc);
  const trends = makeNode({ role: "tab", "data-tab": "trends", id: "ae-tab-trends", parentElement: tablist }, a11yDoc);
  const day = makeNode({ role: "tab", "data-tab": "day", id: "ae-tab-day", parentElement: tablist }, a11yDoc);
  const tabs = [today, trends, day];
  let press = keyEvent("ArrowRight", today);
  assert(helper.AeonV2.handleKeyboardNavigation(press.event) && press.prevented(), "ArrowRight ana tabı ilerletiyor ve varsayılanı durduruyor");
  assert(helper.AeonV2.ui.tab === "trends" && helper.AeonV2.getAccessibilityState().liveMessage === "Sekme açıldı: Trendler", "klavye tab değişimi odağı ve canlı duyuruyu güncelliyor");
  press = keyEvent("End", trends);
  helper.AeonV2.handleKeyboardNavigation(press.event);
  assert(helper.AeonV2.ui.tab === "day", "End son ana taba gidiyor");
  press = keyEvent("ArrowLeft", day);
  helper.AeonV2.handleKeyboardNavigation(press.event);
  assert(helper.AeonV2.ui.tab === "trends", "ArrowLeft önceki ana taba dönüyor");

  helper.AeonV2.setTab("system");
  html = app.innerHTML;
  assert(html.includes('id="ae-system-subtab-status"') && html.includes('aria-controls="ae-system-panel-status"'), "system sub-tab panel ilişkisi adlandırılmış");
  assert(html.includes('id="ae-system-panel-status"') && html.includes('tabindex="0"'), "system paneli keyboard giriş noktası taşıyor");
  const systemList = { getAttribute: function(name) { return name === "role" ? "tablist" : ""; }, querySelectorAll: function() { return systemTabs; } };
  const systemStatus = makeNode({ role: "tab", "data-subtab-id": "status", "data-a11y-scope": "system", parentElement: systemList }, a11yDoc);
  const systemEvents = makeNode({ role: "tab", "data-subtab-id": "events", "data-a11y-scope": "system", parentElement: systemList }, a11yDoc);
  const systemTabs = [systemStatus, systemEvents];
  press = keyEvent("ArrowRight", systemStatus);
  helper.AeonV2.handleKeyboardNavigation(press.event);
  assert(helper.AeonV2.ui.systemSubTab === "events", "system sub-tab ok tuşuyla değişiyor");

  helper.AeonV2.setTab("archives");
  html = app.innerHTML;
  assert(html.includes('id="ae-archive-subtab-library"') && html.includes('aria-controls="ae-archive-panel-library"'), "arşiv alt tabı panelini controls ile bağlıyor");
  assert(html.includes('id="ae-archive-panel-library"') && html.includes('role="tabpanel"'), "arşiv paneli semantik tabpanel olarak render ediliyor");

  helper.AeonV2.setData({ days: {}, eventLog: { events: [event("evt-a11y")] } });
  helper.AeonV2.setTab("system");
  helper.AeonV2.setSystemSubTab("events");
  const eventRow = makeNode({ "data-event-id": "evt-a11y", "aria-label": "Güvenli özet" }, a11yDoc);
  const close = makeNode({ "aria-label": "Olay detayını kapat" }, a11yDoc);
  const secondary = makeNode({ "aria-label": "İkinci trap odağı" }, a11yDoc);
  const trap = {
    focus: function() { a11yDoc.activeElement = trap; },
    querySelectorAll: function() { return [close, secondary]; }
  };
  eventRow.focus();
  helper.AeonV2.selectEvent("evt-a11y");
  html = app.innerHTML;
  assert(html.includes('role="dialog"') && html.includes('aria-modal="true"') && html.includes('data-focus-trap="true"'), "olay drawerı modal erişilebilirlik semantiği taşıyor");
  assert(helper.AeonV2.getAccessibilityState().focusTrapActive === true && a11yDoc.activeElement === close, "drawer açılınca focus ilk kapatma kontrolüne taşınıyor");
  press = keyEvent("Tab", close);
  helper.AeonV2.handleKeyboardNavigation(press.event);
  assert(press.prevented() && a11yDoc.activeElement === secondary, "trap içinde Tab odağı sıradaki elemana geçiriyor");
  press = keyEvent("Tab", secondary);
  helper.AeonV2.handleKeyboardNavigation(press.event);
  assert(a11yDoc.activeElement === close, "trap son odağı ilk elemana sarıyor");
  press = keyEvent("Escape", close);
  helper.AeonV2.handleKeyboardNavigation(press.event);
  assert(!helper.AeonV2.ui.selectedEventId && !helper.AeonV2.getAccessibilityState().focusTrapActive, "Escape drawerı kapatıyor");
  assert(a11yDoc.activeElement === eventRow, "drawer kapanınca tetikleyici odağı geri alıyor");

  helper.AeonV2.setTab("system");
  helper.AeonV2.setSystemSubTab("messages");
  html = app.innerHTML;
  assert(html.includes('id="ae-token-input"') && html.includes('aria-label="GitHub panel tokenı"'), "token input screen reader için açıkça adlandırılmış");
  const buttons = html.match(/<button\b[^>]*>/g) || [];
  assert(buttons.length > 0 && buttons.every(function(button) { return /aria-label="[^"]+"/.test(button); }), "render edilen tüm butonların erişilebilir adı var");
  assert(buttons.every(function(button) { return /tabindex="(?:0|-1)"/.test(button); }), "render edilen tüm butonların güvenli tabindex değeri var");
  assert(!/tabindex="[1-9]\d*"/.test(html), "pozitif tabindex kullanılmıyor");

  console.log("\n✅ Prompt 37 accessibility fixture — TÜM TESTLER BAŞARILI");
}

main().catch(function(error) {
  console.error("❌ FAIL: " + error.message);
  process.exitCode = 1;
});
