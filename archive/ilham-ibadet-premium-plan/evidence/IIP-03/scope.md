# IIP-03 kapsam kapısı

## İzinli uygulama yüzeyi

- `app/core/saygi.js`
- `panel/panel.js`

## İzinli test yüzeyi

- `tests/app/test_saygi_boundary.js`
- `tests/app/test_prayer_boundary.js`
- `tests/app/test_iip_03.js`

## Gerçekleşen değişiklik

- Saygı haftalık kartında yalnızca `uyum` etiketi `kayıtlı vakit payı` olarak düzeltildi.
- Panel aynasında aynı kavram `kayıtlı vakit` ve gün kapsamı olarak düzeltildi.
- IIP-03 sentetik kaynak sözleşmesi eklendi.
- `prayer.js`, `state.js`, veri dosyaları ve hesap gövdeleri değiştirilmedi.

## Kapsam dışı

Payda yeniden tanımı, tarihsel migration, yeni alan, remote/device verification, browser QA, commit, push, merge, deploy ve IIP-04+ kapsam dışıdır.

Scope reviewer: Codex / integrator
