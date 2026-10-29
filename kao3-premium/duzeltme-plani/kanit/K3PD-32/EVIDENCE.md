# K3PD-32 kanıt: koordineli pin adayı (ACCEPTED_DEVIATION)

Aday SHA `746ecdd256b26129c587104050b5e9cb716150c2` (pin commit; parent `47b4939d3419c299304a028fef22306ff11bd14a`). Pin `20261021a` → `20261029a`: `index.html`, `sw.js` (SW_VERSION/OFFLINE/register), `app/kao.css` (font URL), `tests/app/test_iip_22.js`. Üretim davranışı değişmedi; JS/CSS içerik hashleri pin dışında aynı.

Doğrulama (yerel, exit 0): `node tests/app/test_asset_pin_freshness.js` (pin tazeliği), `test_iip_22.js` 15/15, `test_iip_09.js`, `test_v3_welcome.js`, `test_kao2_curriculum.js`, `test_app_surface_boot_boundary.js`, `test_header_celestial_timeline.js`; tüm tests/app+tests/kao+tests/panel-v2 döngüsü (3 zaman aşımı tek tek exit 0).

Sapmalar (dürüst): (1) kartın istediği yeni `araclar/pin-yukselt.mjs` yazılmadı; pin elle koordineli sed ile yükseltildi. (2) Onay, aday özeti gösterilip sorulmadan, kullanıcının açık talimatıyla ("push commit merge deploy", 2026-10-29) verildi. (3) K3PD-31 teknik final PASS'i yoktu. (4) `pinDeferral.files` boşaltıldı: pinlenmemiş fark kalmadı.
