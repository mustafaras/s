(function(){
"use strict";
var KEY='seyma-reset-v1', TKEY='seyma-theme';
// Saygı + Terapi Odası (İçsel Pusula), 2026-07-13 09:00 TR saatiyle (UTC+3, sabit
// offset — cihazın kendi saat dilimi ayarından bağımsız) aktif olur. data.startDate
// / kullanıcının kaç gündür uygulamayı kullandığı bu anı HİÇ etkilemez: ikisi de
// kilit açılana kadar "yakında" durumunda kalır, data.motivation kilit açılana
// kadar hiçbir koşulda oluşturulmaz (bkz. ensureMotivationRoot çağrı noktaları).
// Dosyanın en başında tanımlı — boot sırasında (data yüklenir yüklenmez) bile
// doğru değerlendirilsin diye (var hoisting nedeniyle daha aşağıda tanımlansaydı
// ilk boot çağrısında henüz atanmamış/undefined olurdu).
var FEATURE_GATE_TS=new Date('2026-07-13T09:00:00+03:00').getTime();
function featuresLive(){ return Date.now()>=FEATURE_GATE_TS; }

var ICONS={
  'graduation-cap':'<path d="M21.42 10.922a1 1 0 0 0-.019-1.838L12.83 5.18a2 2 0 0 0-1.66 0L2.6 9.08a1 1 0 0 0 0 1.832l8.57 3.908a2 2 0 0 0 1.66 0z" /><path d="M22 10v6" /><path d="M6 12.5V16a6 3 0 0 0 12 0v-3.5" />',
  'activity':'<path d="M22 12h-2.48a2 2 0 0 0-1.93 1.46l-2.35 8.36a.25.25 0 0 1-.48 0L9.24 2.18a.25.25 0 0 0-.48 0l-2.35 8.36A2 2 0 0 1 4.49 12H2" />',
  'alarm-clock':'<circle cx="12" cy="13" r="8" /><path d="M12 9v4l2 2" /><path d="M5 3 2 6" /><path d="m22 6-3-3" /><path d="M6.38 18.7 4 21" /><path d="M17.64 18.67 20 21" />',
  'annoyed':'<circle cx="12" cy="12" r="10" /><path d="M8 15h8" /><path d="M8 9h2" /><path d="M14 9h2" />',
  'download':'<path d="M12 15V3" /><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" /><path d="m7 10 5 5 5-5" />',
  'external-link':'<path d="M15 3h6v6" /><path d="m10 14 11-11" /><path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6" />',
  'disc':'<circle cx="12" cy="12" r="10" /><circle cx="12" cy="12" r="2" />',
  'stethoscope':'<path d="M11 2v2" /><path d="M5 2v2" /><path d="M5 3H4a2 2 0 0 0-2 2v4a6 6 0 0 0 12 0V5a2 2 0 0 0-2-2h-1" /><path d="M8 15a6 6 0 0 0 12 0v-3" /><circle cx="20" cy="10" r="2" />',
  'dumbbell':'<path d="M17.596 12.768a2 2 0 1 0 2.829-2.829l-1.768-1.767a2 2 0 0 0 2.828-2.829l-2.828-2.828a2 2 0 0 0-2.829 2.828l-1.767-1.768a2 2 0 1 0-2.829 2.829z" /><path d="m2.5 21.5 1.4-1.4" /><path d="m20.1 3.9 1.4-1.4" /><path d="M5.343 21.485a2 2 0 1 0 2.829-2.828l1.767 1.768a2 2 0 1 0 2.829-2.829l-6.364-6.364a2 2 0 1 0-2.829 2.829l1.768 1.767a2 2 0 0 0-2.828 2.829z" /><path d="m9.6 14.4 4.8-4.8" />',
  'route':'<circle cx="6" cy="19" r="3" /><path d="M9 19h8.5a3.5 3.5 0 0 0 0-7h-11a3.5 3.5 0 0 1 0-7H15" /><circle cx="18" cy="5" r="3" />',
  'armchair':'<path d="M19 9V6a2 2 0 0 0-2-2H7a2 2 0 0 0-2 2v3" /><path d="M3 16a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-5a2 2 0 0 0-4 0v1.5a.5.5 0 0 1-.5.5h-9a.5.5 0 0 1-.5-.5V11a2 2 0 0 0-4 0z" /><path d="M5 18v2" /><path d="M19 18v2" />',
  'apple':'<path d="M12 6.528V3a1 1 0 0 1 1-1h0" /><path d="M18.237 21A15 15 0 0 0 22 11a6 6 0 0 0-10-4.472A6 6 0 0 0 2 11a15.1 15.1 0 0 0 3.763 10 3 3 0 0 0 3.648.648 5.5 5.5 0 0 1 5.178 0A3 3 0 0 0 18.237 21" />',
  'archive':'<rect width="20" height="5" x="2" y="3" rx="1" /><path d="M4 8v11a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8" /><path d="M10 12h4" />',
  'file-text':'<path d="M6 22a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h8a2.4 2.4 0 0 1 1.704.706l3.588 3.588A2.4 2.4 0 0 1 20 8v12a2 2 0 0 1-2 2z" /><path d="M14 2v5a1 1 0 0 0 1 1h5" /><path d="M10 9H8" /><path d="M16 13H8" /><path d="M16 17H8" />',
  'save':'<path d="M15.2 3a2 2 0 0 1 1.4.6l3.8 3.8a2 2 0 0 1 .6 1.4V19a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2z" /><path d="M17 21v-7a1 1 0 0 0-1-1H8a1 1 0 0 0-1 1v7" /><path d="M7 3v4a1 1 0 0 0 1 1h7" />',
  'rotate-ccw':'<path d="M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 8" /><path d="M3 3v5h5" />',
  'phone':'<path d="M13.832 16.568a1 1 0 0 0 1.213-.303l.355-.465A2 2 0 0 1 17 15h3a2 2 0 0 1 2 2v3a2 2 0 0 1-2 2A18 18 0 0 1 2 4a2 2 0 0 1 2-2h3a2 2 0 0 1 2 2v3a2 2 0 0 1-.8 1.6l-.468.351a1 1 0 0 0-.292 1.233 14 14 0 0 0 6.392 6.384" />',
  'arrow-up-down':'<path d="m21 16-4 4-4-4" /><path d="M17 20V4" /><path d="m3 8 4-4 4 4" /><path d="M7 4v16" />',
  'crown':'<path d="M11.562 3.266a.5.5 0 0 1 .876 0L15.39 8.87a1 1 0 0 0 1.516.294L21.183 5.5a.5.5 0 0 1 .798.519l-2.834 10.246a1 1 0 0 1-.956.734H5.81a1 1 0 0 1-.957-.734L2.02 6.02a.5.5 0 0 1 .798-.519l4.276 3.664a1 1 0 0 0 1.516-.294z" /><path d="M5 21h14" />',
  'lightbulb':'<path d="M15 14c.2-1 .7-1.7 1.5-2.5 1-.9 1.5-2.2 1.5-3.5A6 6 0 0 0 6 8c0 1 .2 2.2 1.5 3.5.7.7 1.3 1.5 1.5 2.5" /><path d="M9 18h6" /><path d="M10 22h4" />',
  'mail':'<path d="m22 7-8.991 5.727a2 2 0 0 1-2.009 0L2 7" /><rect x="2" y="4" width="20" height="16" rx="2" />',
  'vibrate':'<path d="m2 8 2 2-2 2 2 2-2 2" /><path d="m22 8-2 2 2 2-2 2 2 2" /><rect width="8" height="14" x="8" y="5" rx="1" />',
  'bell-off':'<path d="M10.268 21a2 2 0 0 0 3.464 0" /><path d="M17 17H4a1 1 0 0 1-.74-1.673C4.59 13.956 6 12.499 6 8a6 6 0 0 1 .258-1.742" /><path d="m2 2 20 20" /><path d="M8.668 3.01A6 6 0 0 1 18 8c0 2.687.77 4.653 1.707 6.05" />',
  'trending-up':'<path d="M16 7h6v6" /><path d="m22 7-8.5 8.5-5-5L2 17" />',
  'coffee':'<path d="M10 2v2" /><path d="M14 2v2" /><path d="M16 8a1 1 0 0 1 1 1v8a4 4 0 0 1-4 4H7a4 4 0 0 1-4-4V9a1 1 0 0 1 1-1h14a4 4 0 1 1 0 8h-1" /><path d="M6 2v2" />',
  'bandage':'<path d="M10 10.01h.01" /><path d="M10 14.01h.01" /><path d="M14 10.01h.01" /><path d="M14 14.01h.01" /><path d="M18 6v12" /><path d="M6 6v12" /><rect x="2" y="6" width="20" height="12" rx="2" />',
  'triangle-alert':'<path d="m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3" /><path d="M12 9v4" /><path d="M12 17h.01" />',
  'heart-handshake':'<path d="M19.414 14.414C21 12.828 22 11.5 22 9.5a5.5 5.5 0 0 0-9.591-3.676.6.6 0 0 1-.818.001A5.5 5.5 0 0 0 2 9.5c0 2.3 1.5 4 3 5.5l5.535 5.362a2 2 0 0 0 2.879.052 2.12 2.12 0 0 0-.004-3 2.124 2.124 0 1 0 3-3 2.124 2.124 0 0 0 3.004 0 2 2 0 0 0 0-2.828l-1.881-1.882a2.41 2.41 0 0 0-3.409 0l-1.71 1.71a2 2 0 0 1-2.828 0 2 2 0 0 1 0-2.828l2.823-2.762" />',
  'feather':'<path d="M12.67 19a2 2 0 0 0 1.416-.588l6.154-6.172a6 6 0 0 0-8.49-8.49L5.586 9.914A2 2 0 0 0 5 11.328V18a1 1 0 0 0 1 1z" /><path d="M16 8 2 22" /><path d="M17.5 15H9" />',
  'send-horizontal':'<path d="M3.714 3.048a.498.498 0 0 0-.683.627l2.843 7.627a2 2 0 0 1 0 1.396l-2.842 7.627a.498.498 0 0 0 .682.627l18-8.5a.5.5 0 0 0 0-.904z" /><path d="M6 12h16" />',
  'ban':'<circle cx="12" cy="12" r="10" /><path d="M4.929 4.929 19.07 19.071" />',
  'battery-low':'<path d="M22 14v-4" /><path d="M6 14v-4" /><rect x="2" y="6" width="16" height="12" rx="2" />',
  'bed':'<path d="M2 4v16" /><path d="M2 8h18a2 2 0 0 1 2 2v10" /><path d="M2 17h20" /><path d="M6 8v9" />',
  'pill':'<path d="m10.5 20.5 10-10a4.95 4.95 0 1 0-7-7l-10 10a4.95 4.95 0 1 0 7 7Z" /><path d="m8.5 8.5 7 7" />',
  'flask':'<path d="M10 2v7.31" /><path d="M14 2v7.31" /><path d="M8.5 2h7" /><path d="M14 9.3a6.5 6.5 0 1 1-4 0" />',
  'power':'<path d="M12 2v4" /><path d="M5.64 5.64a9 9 0 1 0 12.72 0" />',
  'book-open':'<path d="M12 7v14" /><path d="M3 18a1 1 0 0 1-1-1V4a1 1 0 0 1 1-1h5a4 4 0 0 1 4 4 4 4 0 0 1 4-4h5a1 1 0 0 1 1 1v13a1 1 0 0 1-1 1h-6a3 3 0 0 0-3 3 3 3 0 0 0-3-3z" />',
  'book':'<path d="M4 19.5v-15A2.5 2.5 0 0 1 6.5 2H19a1 1 0 0 1 1 1v18a1 1 0 0 1-1 1H6.5a1 1 0 0 1 0-5H20" />',
  'brain':'<path d="M12 18V5" /><path d="M15 13a4.17 4.17 0 0 1-3-4 4.17 4.17 0 0 1-3 4" /><path d="M17.598 6.5A3 3 0 1 0 12 5a3 3 0 1 0-5.598 1.5" /><path d="M17.997 5.125a4 4 0 0 1 2.526 5.77" /><path d="M18 18a4 4 0 0 0 2-7.464" /><path d="M19.967 17.483A4 4 0 1 1 12 18a4 4 0 1 1-7.967-.517" /><path d="M6 18a4 4 0 0 1-2-7.464" /><path d="M6.003 5.125a4 4 0 0 0-2.526 5.77" />',
  'calendar':'<path d="M8 2v4" /><path d="M16 2v4" /><rect width="18" height="18" x="3" y="4" rx="2" /><path d="M3 10h18" />',
  'camera':'<path d="M13.997 4a2 2 0 0 1 1.76 1.05l.486.9A2 2 0 0 0 18.003 7H20a2 2 0 0 1 2 2v9a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V9a2 2 0 0 1 2-2h1.997a2 2 0 0 0 1.759-1.048l.489-.904A2 2 0 0 1 10.004 4z" /><circle cx="12" cy="13" r="3" />',
  'chart-column':'<path d="M3 3v16a2 2 0 0 0 2 2h16" /><path d="M18 17V9" /><path d="M13 17V5" /><path d="M8 17v-3" />',
  'check-check':'<path d="M18 6 7 17l-5-5" /><path d="m22 10-7.5 7.5L13 16" />',
  'check':'<path d="M20 6 9 17l-5-5" />',
  'cherry':'<path d="M2 17a5 5 0 0 0 10 0c0-2.76-2.5-5-5-3-2.5-2-5 .24-5 3Z" /><path d="M12 17a5 5 0 0 0 10 0c0-2.76-2.5-5-5-3-2.5-2-5 .24-5 3Z" /><path d="M7 14c3.22-2.91 4.29-8.75 5-12 1.66 2.38 4.94 9 5 12" /><path d="M22 9c-4.29 0-7.14-2.33-10-7 5.71 0 10 4.67 10 7Z" />',
  'chevron-down':'<path d="m6 9 6 6 6-6" />',
  'chevron-up':'<path d="m18 15-6-6-6 6" />',
  'circle':'<circle cx="12" cy="12" r="10" />',
  'clapperboard':'<path d="m12.296 3.464 3.02 3.956" /><path d="M20.2 6 3 11l-.9-2.4c-.3-1.1.3-2.2 1.3-2.5l13.5-4c1.1-.3 2.2.3 2.5 1.3z" /><path d="M3 11h18v8a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" /><path d="m6.18 5.276 3.1 3.899" />',
  'cloud-rain':'<path d="M4 14.899A7 7 0 1 1 15.71 8h1.79a4.5 4.5 0 0 1 2.5 8.242" /><path d="M16 14v6" /><path d="M8 14v6" /><path d="M12 16v6" />',
  'cloud':'<path d="M17.5 19H9a7 7 0 1 1 6.71-9h1.79a4.5 4.5 0 1 1 0 9Z" />',
  'car':'<path d="M19 17h2c.6 0 1-.4 1-1v-3c0-.9-.7-1.7-1.5-1.9C18.7 10.6 16 10 16 10s-1.3-1.4-2.2-2.3c-.5-.4-1.1-.7-1.8-.7H5c-.6 0-1.1.4-1.4.9l-1.4 2.9A3.7 3.7 0 0 0 2 12v4c0 .6.4 1 1 1h2" /><circle cx="7" cy="17" r="2" /><path d="M9 17h6" /><circle cx="17" cy="17" r="2" />',
  'clock':'<circle cx="12" cy="12" r="10" /><path d="M12 6v6l4 2" />',
  'link-2':'<path d="M9 17H7A5 5 0 0 1 7 7h2" /><path d="M15 7h2a5 5 0 1 1 0 10h-2" /><line x1="8" x2="16" y1="12" y2="12" />',
  'compass':'<circle cx="12" cy="12" r="10" /><path d="m16.24 7.76-1.804 5.411a2 2 0 0 1-1.265 1.265L7.76 16.24l1.804-5.411a2 2 0 0 1 1.265-1.265z" />',
  'cookie':'<path d="M12 2a10 10 0 1 0 10 10 4 4 0 0 1-5-5 4 4 0 0 1-5-5" /><path d="M8.5 8.5v.01" /><path d="M16 15.5v.01" /><path d="M12 12v.01" /><path d="M11 17v.01" /><path d="M7 14v.01" />',
  'copy':'<rect width="14" height="14" x="8" y="8" rx="2" ry="2" /><path d="M4 16c-1.1 0-2-.9-2-2V4c0-1.1.9-2 2-2h10c1.1 0 2 .9 2 2" />',
  'droplet':'<path d="M12 22a7 7 0 0 0 7-7c0-2-1-3.9-3-5.5s-3.5-4-4-6.5c-.5 2.5-2 4.9-4 6.5C6 11.1 5 13 5 15a7 7 0 0 0 7 7z" />',
  'droplets':'<path d="M7 16.3c2.2 0 4-1.83 4-4.05 0-1.16-.57-2.26-1.71-3.19S7.29 6.75 7 5.3c-.29 1.45-1.14 2.84-2.29 3.76S3 11.1 3 12.25c0 2.22 1.8 4.05 4 4.05z" /><path d="M12.56 6.6A10.97 10.97 0 0 0 14 3.02c.5 2.5 2 4.9 4 6.5s3 3.5 3 5.5a6.98 6.98 0 0 1-11.91 4.97" />',
  'egg':'<path d="M12 2C8 2 4 8 4 14a8 8 0 0 0 16 0c0-6-4-12-8-12" />',
  'flame':'<path d="M12 3q1 4 4 6.5t3 5.5a1 1 0 0 1-14 0 5 5 0 0 1 1-3 1 1 0 0 0 5 0c0-2-1.5-3-1.5-5q0-2 2.5-4" />',
  'flower-2':'<path d="M12 5a3 3 0 1 1 3 3m-3-3a3 3 0 1 0-3 3m3-3v1M9 8a3 3 0 1 0 3 3M9 8h1m5 0a3 3 0 1 1-3 3m3-3h-1m-2 3v-1" /><circle cx="12" cy="8" r="2" /><path d="M12 10v12" /><path d="M12 22c4.2 0 7-1.667 7-5-4.2 0-7 1.667-7 5Z" /><path d="M12 22c-4.2 0-7-1.667-7-5 4.2 0 7 1.667 7 5Z" />',
  'footprints':'<path d="M4 16v-2.38C4 11.5 2.97 10.5 3 8c.03-2.72 1.49-6 4.5-6C9.37 2 10 3.8 10 5.5c0 3.11-2 5.66-2 8.68V16a2 2 0 1 1-4 0Z" /><path d="M20 20v-2.38c0-2.12 1.03-3.12 1-5.62-.03-2.72-1.49-6-4.5-6C14.63 6 14 7.8 14 9.5c0 3.11 2 5.66 2 8.68V20a2 2 0 1 0 4 0Z" /><path d="M16 17h4" /><path d="M4 13h4" />',
  'frown':'<circle cx="12" cy="12" r="10" /><path d="M16 16s-1.5-2-4-2-4 2-4 2" /><line x1="9" x2="9.01" y1="9" y2="9" /><line x1="15" x2="15.01" y1="9" y2="9" />',
  'house':'<path d="M15 21v-8a1 1 0 0 0-1-1h-4a1 1 0 0 0-1 1v8" /><path d="M3 10a2 2 0 0 1 .709-1.528l7-6a2 2 0 0 1 2.582 0l7 6A2 2 0 0 1 21 10v9a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />',
  'building-2':'<path d="M10 12h4" /><path d="M10 8h4" /><path d="M14 21v-3a2 2 0 0 0-4 0v3" /><path d="M6 10H4a2 2 0 0 0-2 2v7a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2V9a2 2 0 0 0-2-2h-2" /><path d="M6 21V5a2 2 0 0 1 2-2h8a2 2 0 0 1 2 2v16" />',
  'headphones':'<path d="M3 14h3a2 2 0 0 1 2 2v3a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-7a9 9 0 0 1 18 0v7a2 2 0 0 1-2 2h-1a2 2 0 0 1-2-2v-3a2 2 0 0 1 2-2h3" />',
  'heart':'<path d="M2 9.5a5.5 5.5 0 0 1 9.591-3.676.56.56 0 0 0 .818 0A5.49 5.49 0 0 1 22 9.5c0 2.29-1.5 4-3 5.5l-5.492 5.313a2 2 0 0 1-3 .019L5 15c-1.5-1.5-3-3.2-3-5.5" />',
  'hexagon':'<path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z" />',
  'image':'<rect width="18" height="18" x="3" y="3" rx="2" ry="2" /><circle cx="9" cy="9" r="2" /><path d="m21 15-3.086-3.086a2 2 0 0 0-2.828 0L6 21" />',
  'lamp':'<path d="M12 12v6" /><path d="M4.077 10.615A1 1 0 0 0 5 12h14a1 1 0 0 0 .923-1.385l-3.077-7.384A2 2 0 0 0 15 2H9a2 2 0 0 0-1.846 1.23Z" /><path d="M8 20a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v1a1 1 0 0 1-1 1H9a1 1 0 0 1-1-1z" />',
  'leaf':'<path d="M11 20A7 7 0 0 1 9.8 6.1C15.5 5 17 4.48 19 2c1 2 2 4.18 2 8 0 5.5-4.78 10-10 10Z" /><path d="M2 21c0-3 1.85-5.36 5.08-6C9.5 14.52 12 13 13 12" />',
  'lock':'<rect width="18" height="11" x="3" y="11" rx="2" ry="2" /><path d="M7 11V7a5 5 0 0 1 10 0v4" />',
  'flask':'<path d="M14.5 2v17.5c0 1.4-1.1 2.5-2.5 2.5s-2.5-1.1-2.5-2.5V2" /><path d="M8.5 2h7" /><path d="M9.5 16h5" />',
  'info':'<circle cx="12" cy="12" r="10" /><path d="M12 16v-4" /><path d="M12 8h.01" />',
  'ruler':'<path d="M21.3 15.3a2.4 2.4 0 0 1 0 3.4l-2.6 2.6a2.4 2.4 0 0 1-3.4 0L2.7 8.7a2.41 2.41 0 0 1 0-3.4l2.6-2.6a2.41 2.41 0 0 1 3.4 0Z" /><path d="m14.5 12.5 2-2" /><path d="m11.5 9.5 2-2" /><path d="m8.5 6.5 2-2" /><path d="m17.5 15.5 2-2" />',
  'map-pin':'<path d="M20 10c0 4.993-5.539 10.193-7.399 11.799a1 1 0 0 1-1.202 0C9.539 20.193 4 14.993 4 10a8 8 0 0 1 16 0" /><circle cx="12" cy="10" r="3" />',
  'microscope':'<path d="M6 18h8" /><path d="M3 22h18" /><path d="M14 22a7 7 0 1 0 0-14h-1" /><path d="M9 14h2" /><path d="M9 12a2 2 0 0 1-2-2V6h6v4a2 2 0 0 1-2 2Z" /><path d="M12 6V3a1 1 0 0 0-1-1H9a1 1 0 0 0-1 1v3" />',
  'map':'<path d="M14.106 5.553a2 2 0 0 0 1.788 0l3.659-1.83A1 1 0 0 1 21 4.619v12.764a1 1 0 0 1-.553.894l-4.553 2.277a2 2 0 0 1-1.788 0l-4.212-2.106a2 2 0 0 0-1.788 0l-3.659 1.83A1 1 0 0 1 3 19.381V6.618a1 1 0 0 1 .553-.894l4.553-2.277a2 2 0 0 1 1.788 0z" /><path d="M15 5.764v15" /><path d="M9 3.236v15" />',
  'meh':'<circle cx="12" cy="12" r="10" /><line x1="8" x2="16" y1="15" y2="15" /><line x1="9" x2="9.01" y1="9" y2="9" /><line x1="15" x2="15.01" y1="9" y2="9" />',
  'mic':'<path d="M12 19v3" /><path d="M19 10v2a7 7 0 0 1-14 0v-2" /><rect x="9" y="2" width="6" height="13" rx="3" />',
  'moon-star':'<path d="M18 5h4" /><path d="M20 3v4" /><path d="M20.985 12.486a9 9 0 1 1-9.473-9.472c.405-.022.617.46.402.803a6 6 0 0 0 8.268 8.268c.344-.215.825-.004.803.401" />',
  'moon':'<path d="M20.985 12.486a9 9 0 1 1-9.473-9.472c.405-.022.617.46.402.803a6 6 0 0 0 8.268 8.268c.344-.215.825-.004.803.401" />',
  'music':'<path d="M9 18V5l12-2v13" /><circle cx="6" cy="18" r="3" /><circle cx="18" cy="16" r="3" />',
  'pause':'<rect x="14" y="3" width="5" height="18" rx="1" /><rect x="5" y="3" width="5" height="18" rx="1" />',
  'pen-line':'<path d="M13 21h8" /><path d="M21.174 6.812a1 1 0 0 0-3.986-3.987L3.842 16.174a2 2 0 0 0-.5.83l-1.321 4.352a.5.5 0 0 0 .623.622l4.353-1.32a2 2 0 0 0 .83-.497z" />',
  'pill':'<path d="m10.5 20.5 10-10a4.95 4.95 0 1 0-7-7l-10 10a4.95 4.95 0 1 0 7 7Z" /><path d="m8.5 8.5 7 7" />',
  'quote':'<path d="M16 3a2 2 0 0 0-2 2v6a2 2 0 0 0 2 2 1 1 0 0 1 1 1v1a2 2 0 0 1-2 2 1 1 0 0 0-1 1v2a1 1 0 0 0 1 1 6 6 0 0 0 6-6V5a2 2 0 0 0-2-2z" /><path d="M5 3a2 2 0 0 0-2 2v6a2 2 0 0 0 2 2 1 1 0 0 1 1 1v1a2 2 0 0 1-2 2 1 1 0 0 0-1 1v2a1 1 0 0 0 1 1 6 6 0 0 0 6-6V5a2 2 0 0 0-2-2z" />',
  'play':'<path d="M5 5a2 2 0 0 1 3.008-1.728l11.997 6.998a2 2 0 0 1 .003 3.458l-12 7A2 2 0 0 1 5 19z" />',
  'repeat':'<path d="m17 2 4 4-4 4" /><path d="M3 11v-1a4 4 0 0 1 4-4h14" /><path d="m7 22-4-4 4-4" /><path d="M21 13v1a4 4 0 0 1-4 4H3" />',
  'search':'<path d="m21 21-4.34-4.34" /><circle cx="11" cy="11" r="8" />',
  'send':'<path d="M14.536 21.686a.5.5 0 0 0 .937-.024l6.5-19a.496.496 0 0 0-.635-.635l-19 6.5a.5.5 0 0 0-.024.937l7.93 3.18a2 2 0 0 1 1.112 1.11z" /><path d="m21.854 2.147-10.94 10.939" />',
  'settings':'<path d="M9.671 4.136a2.34 2.34 0 0 1 4.659 0 2.34 2.34 0 0 0 3.319 1.915 2.34 2.34 0 0 1 2.33 4.033 2.34 2.34 0 0 0 0 3.831 2.34 2.34 0 0 1-2.33 4.033 2.34 2.34 0 0 0-3.319 1.915 2.34 2.34 0 0 1-4.659 0 2.34 2.34 0 0 0-3.32-1.915 2.34 2.34 0 0 1-2.33-4.033 2.34 2.34 0 0 0 0-3.831A2.34 2.34 0 0 1 6.35 6.051a2.34 2.34 0 0 0 3.319-1.915" /><circle cx="12" cy="12" r="3" />',
  'smile':'<circle cx="12" cy="12" r="10" /><path d="M8 14s1.5 2 4 2 4-2 4-2" /><line x1="9" x2="9.01" y1="9" y2="9" /><line x1="15" x2="15.01" y1="9" y2="9" />',
  'snowflake':'<path d="m10 20-1.25-2.5L6 18" /><path d="M10 4 8.75 6.5 6 6" /><path d="m14 20 1.25-2.5L18 18" /><path d="m14 4 1.25 2.5L18 6" /><path d="m17 21-3-6h-4" /><path d="m17 3-3 6 1.5 3" /><path d="M2 12h6.5L10 9" /><path d="m20 10-1.5 2 1.5 2" /><path d="M22 12h-6.5L14 15" /><path d="m4 10 1.5 2L4 14" /><path d="m7 21 3-6-1.5-3" /><path d="m7 3 3 6h4" />',
  'sparkles':'<path d="M11.017 2.814a1 1 0 0 1 1.966 0l1.051 5.558a2 2 0 0 0 1.594 1.594l5.558 1.051a1 1 0 0 1 0 1.966l-5.558 1.051a2 2 0 0 0-1.594 1.594l-1.051 5.558a1 1 0 0 1-1.966 0l-1.051-5.558a2 2 0 0 0-1.594-1.594l-5.558-1.051a1 1 0 0 1 0-1.966l5.558-1.051a2 2 0 0 0 1.594-1.594z" /><path d="M20 2v4" /><path d="M22 4h-4" /><circle cx="4" cy="20" r="2" />',
  'sprout':'<path d="M14 9.536V7a4 4 0 0 1 4-4h1.5a.5.5 0 0 1 .5.5V5a4 4 0 0 1-4 4 4 4 0 0 0-4 4c0 2 1 3 1 5a5 5 0 0 1-1 3" /><path d="M4 9a5 5 0 0 1 8 4 5 5 0 0 1-8-4" /><path d="M5 21h14" />',
  'star':'<path d="M11.525 2.295a.53.53 0 0 1 .95 0l2.31 4.679a2.123 2.123 0 0 0 1.595 1.16l5.166.756a.53.53 0 0 1 .294.904l-3.736 3.638a2.123 2.123 0 0 0-.611 1.878l.882 5.14a.53.53 0 0 1-.771.56l-4.618-2.428a2.122 2.122 0 0 0-1.973 0L6.396 21.01a.53.53 0 0 1-.77-.56l.881-5.139a2.122 2.122 0 0 0-.611-1.879L2.16 9.795a.53.53 0 0 1 .294-.906l5.165-.755a2.122 2.122 0 0 0 1.597-1.16z" />',
  'sun':'<circle cx="12" cy="12" r="4" /><path d="M12 2v2" /><path d="M12 20v2" /><path d="m4.93 4.93 1.41 1.41" /><path d="m17.66 17.66 1.41 1.41" /><path d="M2 12h2" /><path d="M20 12h2" /><path d="m6.34 17.66-1.41 1.41" /><path d="m19.07 4.93-1.41 1.41" />',
  'sunrise':'<path d="M12 2v8" /><path d="m4.93 10.93 1.41 1.41" /><path d="M2 18h2" /><path d="M20 18h2" /><path d="m19.07 10.93-1.41 1.41" /><path d="M22 22H2" /><path d="m8 6 4-4 4 4" /><path d="M16 18a4 4 0 0 0-8 0" />',
  'target':'<circle cx="12" cy="12" r="10" /><circle cx="12" cy="12" r="6" /><circle cx="12" cy="12" r="2" />',
  'cloud-sun':'<path d="M12 2v2" /><path d="m4.93 4.93 1.41 1.41" /><path d="M20 12h2" /><path d="m19.07 4.93-1.41 1.41" /><path d="M15.947 12.65a4 4 0 0 0-5.925-4.128" /><path d="M13 22H7a5 5 0 1 1 4.9-6H13a3 3 0 0 1 0 6Z" />',
  'cloud-fog':'<path d="M4 14.899A7 7 0 1 1 15.71 8h1.79a4.5 4.5 0 0 1 2.5 8.242" /><path d="M16 17H7" /><path d="M17 21H9" />',
  'cloud-lightning':'<path d="M6 16.326A7 7 0 1 1 15.71 8h1.79a4.5 4.5 0 0 1 .5 8.973" /><path d="m13 12-3 5h4l-3 5" />',
  'cloud-drizzle':'<path d="M4 14.899A7 7 0 1 1 15.71 8h1.79a4.5 4.5 0 0 1 2.5 8.242" /><path d="M8 19v1" /><path d="M8 14v1" /><path d="M16 19v1" /><path d="M16 14v1" /><path d="M12 21v1" /><path d="M12 16v1" />',
  'cloud-snow':'<path d="M4 14.899A7 7 0 1 1 15.71 8h1.79a4.5 4.5 0 0 1 2.5 8.242" /><path d="M8 15h.01" /><path d="M8 19h.01" /><path d="M12 17h.01" /><path d="M12 21h.01" /><path d="M16 15h.01" /><path d="M16 19h.01" />',
  'shirt':'<path d="M20.38 3.46 16 2a4 4 0 0 1-8 0L3.62 3.46a2 2 0 0 0-1.34 2.23l.58 3.47a1 1 0 0 0 .99.84H6v10c0 1.1.9 2 2 2h8a2 2 0 0 0 2-2V10h2.15a1 1 0 0 0 .99-.84l.58-3.47a2 2 0 0 0-1.34-2.23z" />',
  'thermometer':'<path d="M14 4v10.54a4 4 0 1 1-4 0V4a2 2 0 0 1 4 0Z" />',
  'trash-2':'<path d="M10 11v6" /><path d="M14 11v6" /><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6" /><path d="M3 6h18" /><path d="M8 6V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />',
  'umbrella':'<path d="M12 13v7a2 2 0 0 0 4 0" /><path d="M12 2v2" /><path d="M20.992 13a1 1 0 0 0 .97-1.274 10.284 10.284 0 0 0-19.923 0A1 1 0 0 0 3 13z" />',
  'circle-check':'<circle cx="12" cy="12" r="10" /><path d="m9 12 2 2 4-4" />',
  'trophy':'<path d="M10 14.66v1.626a2 2 0 0 1-.976 1.696A5 5 0 0 0 7 21.978" /><path d="M14 14.66v1.626a2 2 0 0 0 .976 1.696A5 5 0 0 1 17 21.978" /><path d="M18 9h1.5a1 1 0 0 0 0-5H18" /><path d="M4 22h16" /><path d="M6 9a6 6 0 0 0 12 0V3a1 1 0 0 0-1-1H7a1 1 0 0 0-1 1z" /><path d="M6 9H4.5a1 1 0 0 1 0-5H6" />',
  'utensils':'<path d="M3 2v7c0 1.1.9 2 2 2h4a2 2 0 0 0 2-2V2" /><path d="M7 2v20" /><path d="M21 15V2a5 5 0 0 0-5 5v6c0 1.1.9 2 2 2h3Zm0 0v7" />',
  'wind':'<path d="M12.8 19.6A2 2 0 1 0 14 16H2" /><path d="M17.5 8a2.5 2.5 0 1 1 2 4H2" /><path d="M9.8 4.4A2 2 0 1 1 11 8H2" />',
  'x':'<path d="M18 6 6 18" /><path d="m6 6 12 12" />',
  'zap':'<path d="M4 14a1 1 0 0 1-.78-1.63l9.9-10.2a.5.5 0 0 1 .86.46l-1.92 6.02A1 1 0 0 0 13 10h7a1 1 0 0 1 .78 1.63l-9.9 10.2a.5.5 0 0 1-.86-.46l1.92-6.02A1 1 0 0 0 11 14z" />',
  'paperclip':'<path d="m21.44 11.05-9.19 9.19a6 6 0 0 1-8.49-8.49l8.57-8.57A4 4 0 1 1 18 8.84l-8.59 8.57a2 2 0 0 1-2.83-2.83l8.49-8.48" />',
  'thumbs-up':'<path d="M7 10v12" /><path d="M15 5.88 14 10h5.83a2 2 0 0 1 1.92 2.56l-2.33 8A2 2 0 0 1 17.5 22H4a2 2 0 0 1-2-2v-8a2 2 0 0 1 2-2h2.76a2 2 0 0 0 1.79-1.11L12 2a3.13 3.13 0 0 1 3 3.88Z" />',
  'thumbs-down':'<path d="M17 14V2" /><path d="M9 18.12 10 14H4.17a2 2 0 0 1-1.92-2.56l2.33-8A2 2 0 0 1 6.5 2H20a2 2 0 0 1 2 2v8a2 2 0 0 1-2 2h-2.76a2 2 0 0 0-1.79 1.11L12 22a3.13 3.13 0 0 1-3-3.88Z" />',
};
// SVG ikon yardımcısı — emoji yerine tutarlı, tema-uyumlu (currentColor) çizgi ikonlar.
// size: piksel; cls: ekstra CSS class (opsiyonel, örn. "seyIconSpin"). Bilinmeyen isimde
// boş kare yerine sessizce boş span döner (uygulama çökmesin).
function icon(name,size,cls){
  var body=ICONS[name]; if(!body) return '';
  size=size||20;
  return '<svg class="seyIcon'+(cls?(' '+cls):'')+'" width="'+size+'" height="'+size+'" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">'+body+'</svg>';
}
var HABITS=[
  {key:'sweetManaged',icon:icon('cookie',22),title:'Tatlı krizini yönettim',sub:'Tatlı seni değil, sen tatlıyı yönettin.',msg:'Tatlı lobisi bugün hafif geriledi. Şeyma 1 - Tatlı 0.'},
  {key:'foodManaged',icon:icon('utensils',22),title:'Yemek/açlık krizini yönettim',sub:'Gerçek açlık mı, duygusal açlık mı — ayırt ettin.',msg:'Açlık dalgasını izledin, boğulmadın. Beden mutlu, sen kaptansın.',since:'2026-07-10'},
  {key:'coffeeManaged',icon:icon('coffee',22),title:'Kahve/kafein krizini yönettim',sub:'Gerçek yorgunluk mu, alışkanlık mı — sen karar verdin.',msg:'Kafein isteğine sen yön verdin. Uykun bunu unutmayacak.',since:'2026-07-10'},
  {key:'eveningControl',icon:icon('moon',22),title:"Akşam 7'den sonra gereksiz atıştırmadım",sub:'Gerçek açlık başka, dolapla duygusal bağ başka.',msg:'Mutfak seferi iptal. Operasyon başarılı.'},
  {key:'walked20',icon:icon('footprints',22),title:'En az 4.500 adım yürüdüm',sub:'Günlük 4.500 adım, bedenine tatlı bir eşik.',msg:'Yürüyüş tamam. Metabolizma "bunu not ettim" dedi.'},
  {key:'protein',icon:icon('egg',22),title:'2 ana öğünde protein vardı',sub:'Tokluk ekibi göreve başladı.',msg:'Protein geldi, krizlerin beli hafif büküldü.'},
  {key:'water',icon:icon('droplet',22),title:'Su içmeyi ihmal etmedim',sub:'Küçük şey, büyük fark.',msg:'Su tamam. Cilt bariyeri sessizce teşekkür ediyor.'},
  {key:'vitaminD',icon:icon('sun',22),title:'D₃K₂ damla takviyemi aldım',sub:'Minik destek, güneş hesabına yazıldı.',msg:'D₃K₂ damla tamam. Güneş desteği kayda geçti.'},
  {key:'sleepReg',icon:icon('bed',22),title:'Yeterli uyudum (7,5+ saat)',sub:'Uyku, dengenin sessiz kahramanı.',msg:'Uyku tamam. Hormonlar ve ruh hâlin sessizce teşekkür ediyor.',since:'2026-06-28'},
  {key:'journaled',icon:icon('pen-line',22),title:'Duygu/günlük notu yazdım',sub:'Zihni boşaltmak, kaygıyı hafifletir.',msg:'Bir cümle bile olsa yazdın; zihin biraz nefes aldı.',since:'2026-07-03'},
  {key:'mediaFed',icon:icon('sparkles',22),title:'Zihnimi besledim',sub:'Okudum, izledim, dinledim ya da öğrendim.',msg:'Zihnine iyi bir şey kattın — küçük ama besleyici.',since:'2026-07-09'},
  {key:'freshAir',icon:icon('leaf',22),title:'Açık havaya çıktım',sub:'Doğal ışık, ruh hâlini yukarı çeker.',msg:'Açık hava tamam. Güneş ve ruh hâlin selam gönderdi.',since:'2026-07-03'},
  {key:'selfKind',icon:icon('heart',22),title:'Kendime kötü davranmadım',sub:'En önemli tik bu.',msg:'Bugünün en kıymetli hamlesi: kendine yüklenmemek.'},
  {key:'caffeineOk',icon:icon('coffee',22),title:'Günlük kafein limitini aşmadım',sub:'Kafein saat ve miktarına bağlı — elle açılmaz.',msg:'Kafein limiti + zamanlama tamam. Uyku için de temiz bir gün.',since:'2026-07-10'},
  {key:'magnesium',icon:icon('pill',22),title:'Magnezyum takviyesi aldım',sub:'Destek gününü tamamladın.',msg:'Magnezyum desteği tamam. Beden sana teşekkür ediyor.'}
];
var HABIT_TOTAL=HABITS.length;

// ---- Kafein — bilimsel takip (EFSA 2015 · FDA · Harvard Health) ----
// mg değerleri bir serving (fincan/shot/kupa/bardak/kutu) başına ortalama; demleme/
// çekirdek fark eder, kullanıcı karttan başına göre ayarlayabilir. Yarı ömür
// ~5 saat (sağlıklı yetişkin). Son kahve yatmadan ~6 saat önce; bedtime kalıntısı
// <50 mg uykuyu anlamlı etkilemez.
var CAFFEINE_TYPES=[
  {id:'turk',label:'Türk kahvesi',mg:60,unit:'fincan'},
  {id:'espresso',label:'Espresso',mg:60,unit:'shot'},
  {id:'filter',label:'Filtre kahve',mg:95,unit:'kupa'},
  {id:'americano',label:'Americano',mg:77,unit:'kupa'},
  {id:'cappuccino',label:'Cappuccino',mg:63,unit:'kupa'},
  {id:'latte',label:'Latte',mg:63,unit:'kupa'},
  {id:'black-tea',label:'Siyah çay',mg:40,unit:'bardak'},
  {id:'green-tea',label:'Yeşil çay',mg:25,unit:'bardak'},
  {id:'energy',label:'Enerji içeceği',mg:80,unit:'kutu'}
];
var CAFFEINE_LIMITS={standard:400,sensitive:300,pregnant:200};
var CAFFEINE_SINGLE_DOSE=200;   // tek seferlik güvenli doz (mg) — EFSA
var CAFFEINE_HALFLIFE_H=5;      // ortalama yarı ömür (saat)
var CAFFEINE_SLEEP_SAFE_MG=50;  // bedtime kalıntı eşiği (mg)
var CAFFEINE_CUTOFF_H=6;        // yatandan önceki önerilen kafein kesme (saat)
var CAFFEINE_DEFAULT_BED='23:30';
function caffeineType(id){ for(var i=0;i<CAFFEINE_TYPES.length;i++){ if(CAFFEINE_TYPES[i].id===id) return CAFFEINE_TYPES[i]; } return null; }
function caffeineMode(){ var m=(data&&data.settings&&data.settings.caffeineMode)||'standard'; return (m==='sensitive'||m==='pregnant')?m:'standard'; }
function caffeineLimit(){ return CAFFEINE_LIMITS[caffeineMode()]||400; }
function caffeineTargetBed(){ var b=(data&&data.settings&&data.settings.targetBed)||CAFFEINE_DEFAULT_BED; return /^\d{2}:\d{2}$/.test(b)?b:CAFFEINE_DEFAULT_BED; }

// ── Magnezyum Danışmanı sabitleri ──
var MG_MAX_ELEMENTAL=400; // standart günlük hedef doz (elementer magnezyum, mg)
var MG_FORMS=[
  {id:'glycinate',label:'Glisinat',icon:icon('moon',16),bestFor:['sleep','anxiety','muscle'],note:'Yatmadan önce uykuya yardımcı; mideye nazik.'},
  {id:'citrate',label:'Sitrat',icon:icon('zap',16),bestFor:['cramp','bloating','constipation'],note:'Kramp ve şişkinlikte destekleyici; bağırsak hareketini artırabilir.'},
  {id:'oxide',label:'Oksit',icon:icon('pill',16),bestFor:['general'],note:'Ekonomik ama emilimi düşük; ishal riski yüksek.'},
  {id:'sulfate',label:'Sülfat',icon:icon('droplets',16),bestFor:['bath','topical'],note:'Epsom tuzu olarak banyoda kullanılır; oral önerilmez.'},
  {id:'other',label:'Diğer / Karışık',icon:icon('flask',16),bestFor:['general'],note:'Bileşenleri kontrol et; elementer magnezyum miktarına bak.'}
];
var MG_SYMPTOM_WEIGHTS={kramp:0.35,sanci:0.30,bas:0.20,yorgun:0.15,duygu:0.15,siskinlik:0.10,istah:0.05,cilt:0.05};
var MG_WEIGHTS={cycle:35,symptom:25,sleep:20,energy:15,trend:5};
var MG_REASON_LABELS={
  luteal:'Luteal faz', menstrual:'Regl dönemi', ovulation:'Ovülasyon yakını',
  sleepLow:'Düşük uyku', sleepPoor:'Kötü uyku kalitesi',
  lowEnergy:'Düşük enerji', highStress:'Yüksek stres',
  symptom:'Belirtiler', trend:'Son günlerdeki eğilim'
};
var MG_PHASE_LABELS={luteal:'Lüteal fazı',menstrual:'Regl fazı',ovulation:'Ovulasyon fazı',follicular:'Foliküler fazı',unknown:'Döngü fazı bekleniyor'};
var MG_PHASE_COLORS={luteal:'#C77DA6',menstrual:'#E58B9B',ovulation:'#8F85D3',follicular:'#66B072',unknown:'#888888'};

// "HH:MM" -> dakika
function hhmmToMin(s){ if(!s||!/^\d{1,2}:\d{2}$/.test(s)) return null; var p=s.split(':'); return Number(p[0])*60+Number(p[1]); }
function minToHHMM(m){ if(m==null||isNaN(m)) return ''; m=((m%1440)+1440)%1440; return pad(Math.floor(m/60))+':'+pad(m%60); }
// drinks dizisinden türetilen değerler
function caffeineDrinks(rec){ var c=(rec&&rec.caffeine&&Array.isArray(rec.caffeine.drinks))?rec.caffeine.drinks:[]; return c; }
function caffeineTotalMg(rec){ var t=0; caffeineDrinks(rec).forEach(function(d){ var ty=caffeineType(d&&d.type); if(!ty) return; var q=Math.max(1,Number(d.qty)||1); t+=ty.mg*q; }); return Math.round(t); }
function caffeineLastTime(rec){ var last=null; caffeineDrinks(rec).forEach(function(d){ if(d&&d.time&&/^\d{2}:\d{2}$/.test(d.time)){ if(!last||d.time>last) last=d.time; } }); return last; }
function caffeineMaxSingle(rec){ var mx=0; caffeineDrinks(rec).forEach(function(d){ var ty=caffeineType(d&&d.type); if(!ty) return; var q=Math.max(1,Number(d.qty)||1); mx=Math.max(mx,ty.mg*q); }); return Math.round(mx); }
// Yatma saatindeki kafein kalıntısı (mg) — her içim yarı ömür decay, topla.
function caffeineResidueAt(rec,targetBed){
  var bed=hhmmToMin(targetBed||caffeineTargetBed()); if(bed==null) return 0;
  var total=0; caffeineDrinks(rec).forEach(function(d){ var ty=caffeineType(d&&d.type); if(!ty) return; var t=hhmmToMin(d&&d.time); if(t==null) return; var dt=(bed-t)/60; if(dt<0) dt+=24; if(dt<0) return; var q=Math.max(1,Number(d.qty)||1); var mg=ty.mg*q; total+=mg*Math.pow(0.5,dt/CAFFEINE_HALFLIFE_H); });
  return Math.round(total);
}
function caffeineCutoffTime(targetBed){ var bed=hhmmToMin(targetBed||caffeineTargetBed()); if(bed==null) return ''; return minToHHMM(bed-CAFFEINE_CUTOFF_H*60); }
function caffeineTimingOk(rec,targetBed){ var last=caffeineLastTime(rec); if(!last) return true; var cut=caffeineCutoffTime(targetBed||caffeineTargetBed()); return !!cut && last<=cut; }
function isLutealDay(date){ var cs=cycleStats(); return cs.phase==='luteal' && date===todayStr(); }
function habitCountOn(date){ var n=0; for(var i=0;i<HABITS.length;i++){ var s=HABITS[i].since; if(!s||(date&&date>=s)) n++; } return n; }
function htToday(){ return habitCountOn(todayStr()); }
function emptyDiscomfort(){ return {regions:{},note:'',meds:[]}; }
var MOODS=[
  {id:'cok-iyi',label:'Çok iyi',short:'Çok iyi',icon:'sun',resp:'Bugün ışık saçıyoruz anlaşılan.'},
  {id:'iyi',label:'İyi',short:'İyi',icon:'flower-2',resp:'Gayet güzel. Ritim kuruluyor.'},
  {id:'normal',label:'Normal',short:'Normal',icon:'leaf',resp:'Normal de olur. Her gün festival değil.'},
  {id:'zorlandim',label:'Zorlandım',short:'Zor',icon:'cloud-rain',resp:'Zor günler oyundan düşürmez Sevgili Günışığı.'},
  {id:'cok-zorlandim',label:'Çok zorlandım',short:'Çok zor',icon:'droplets',resp:'Bugün sadece kendine yüklenmemek bile yeter.'}
];
// ── Kriz odaları: Tatlı · Yemek · Kahve. Her biri süreli, bilimsel bir mikro-müdahale.
// "Krizi yönettim" ilgili günün doneField'ini kurar → bağlı tik kendiliğinden yeşillenir.
// (Kahve krizinin tiki yok — yalnızca kayıt tutulur; sweet→sweetManaged, food→foodManaged.)
var CRISES={
  sweet:{
    key:'sweet', label:'Tatlı krizi', short:'Tatlı', icon:'cookie',
    accent:'#E9899F', accent2:'#C9B8FF', doneField:'craving10MinDone', habit:'sweetManaged',
    secs:600, clockLabel:'10 dakika', startLabel:'10 dakikayı başlat',
    tag:'TATLI KRİZİ', hero:'Panik yok Şeyma — tatlı geldi diye tahtın sarsılmaz.',
    sciTitle:'Neden 10 dakika?',
    sci:'Şeker isteği bir <b>dalga</b>dır: yükselir ve genelde 10 dakikada kendiliğinden geriler (buna “urge surfing” denir). Kan şekeri düşünce beyin hızlı yakıt için şeker ister, dopamin devresi “ödül” vaadiyle dürtükler. Dalgayı bastırmadan izlersen tepe noktası geçer — karar artık senin olur.',
    doneToast:'10 dakika doldu — tatlı krizini yönettin. Kararı artık sen ver.',
    winTitle:'İşte bu.',
    winText:'Tatlı seni değil, sen tatlıyı yönettin. Küçük zafer, büyük kontrol.',
    opts:[
      {label:'Su içtim',icon:'droplet'},
      {label:'Kahve/çay yaptım',icon:'coffee'},
      {label:'Yoğurt + tarçın denedim',icon:'apple'},
      {label:'Meyve + yoğurt yaptım',icon:'cherry'},
      {label:'1-2 kare bitterle kapattım',icon:'cookie'},
      {label:'Hâlâ istiyorum ama kontrollü yiyeceğim',icon:'heart-handshake'}
    ],
    triggers:[
      {id:'tired',icon:'battery-low',label:'Yorgunum',sci:'Yorgunluk öz-denetimi (prefrontal korteks) zayıflatır; beyin hızlı enerji için şeker ister.'},
      {id:'bored',icon:'cloud',label:'Sıkıldım',sci:'Can sıkıntısı dopamin arayışını tetikler; tatlı kolay bir uyaran vaadidir.'},
      {id:'hungry',icon:'utensils',label:'Gerçekten açım',sci:'Kan şekeri düşünce bu fizyolojik açlıktır — bastırma, dengeli bir öğünle karşıla.'},
      {id:'stress',icon:'wind',label:'Stresliyim',sci:'Kortizol iştahı ve şeker isteğini artırır; bu duygusal açlık mideden gelmez.'},
      {id:'habit',icon:'repeat',label:'Alışkanlık',sci:'Koşullanmış bir ipucu (saat, mekân, ruh hâli) otomatik isteği tetikler.'}
    ]
  },
  food:{
    key:'food', label:'Yemek krizi', short:'Yemek', icon:'utensils',
    accent:'#E0A55E', accent2:'#F2C879', doneField:'foodCravingDone', habit:'foodManaged',
    secs:1200, clockLabel:'20 dakika', startLabel:'20 dakikayı başlat',
    tag:'YEMEK / AÇLIK KRİZİ', hero:'Dur bakalım Şeyma — mide mi konuşuyor, yoksa moral mi?',
    sciTitle:'Gerçek açlık mı, duygusal açlık mı?',
    sci:'Fiziksel açlık <b>yavaş</b> kurulur, her yiyeceğe açıktır ve doyunca susar. Duygusal açlık <b>aniden</b> gelir, belirli bir şeyi (çoğu kez abur cubur) ister ve doysan bile dinmez. Tokluk sinyalleri (leptin, CCK) beyne ~20 dakikada ulaşır — bu yüzden önce bir bardak su + 20 dakika, sonra karar. İpucu için <b>HALT</b>: Aç mısın (Hungry), kızgın mısın (Angry), yalnız mısın (Lonely), yorgun musun (Tired)?',
    doneToast:'20 dakika doldu — açlık dalgasını izledin. Şimdi ihtiyaçla karar ver, dürtüyle değil.',
    winTitle:'Bravo kaptan.',
    winText:'Açlığı dinledin, boğulmadın. Gerçek açlıksa dengeli beslendin; duygusalsa başka türlü doydun.',
    opts:[
      {label:'Bir bardak su içip bekledim',icon:'droplet'},
      {label:'Ilık bitki çayı yaptım',icon:'coffee'},
      {label:'HALT sorusunu kendime sordum',icon:'brain'},
      {label:'Proteinli dengeli bir öğün planladım',icon:'egg'},
      {label:'Gerçekten açtım, oturup dengeli yedim',icon:'utensils'},
      {label:'Duygusaldı, başka bir şeyle avundum',icon:'heart-handshake'}
    ],
    triggers:[
      {id:'hungry',icon:'utensils',label:'Gerçekten açım',sci:'Fiziksel açlık: mide kazınması, halsizlik, saatlerdir yememek. Bunu bastırma — dengeli bir öğünle karşıla.'},
      {id:'emotional',icon:'heart',label:'Duygusal boşluk',sci:'Üzüntü, yalnızlık ya da can sıkıntısı “ağız yoluyla” avunma ister; yemek geçici bir yatıştırıcı olur.'},
      {id:'stress',icon:'wind',label:'Stres / kaygı',sci:'Kortizol iştahı ve özellikle yağlı-şekerli “konfor yemeği” isteğini artırır.'},
      {id:'tired',icon:'battery-low',label:'Yorgun / uykusuz',sci:'Az uyku grelini (açlık hormonu) yükseltir, leptini düşürür — sahte açlık sinyali doğar.'},
      {id:'habit',icon:'repeat',label:'Öğün atladım / saat geldi',sci:'Öğün atlamak sonraki krizi büyütür; “yemek saati” de koşullanmış bir ipucu olabilir.'}
    ]
  },
  coffee:{
    key:'coffee', label:'Kahve krizi', short:'Kahve', icon:'coffee',
    accent:'#A9805B', accent2:'#D8B892', doneField:'coffeeCravingDone', habit:'coffeeManaged',
    secs:600, clockLabel:'10 dakika', startLabel:'10 dakika ara ver',
    tag:'KAHVE / KAFEİN KRİZİ', hero:'Kahve iyidir Şeyma, ama saat kaç? Uykunla pazarlık etmeyelim.',
    sciTitle:'Gerçek yorgunluk mu, alışkanlık mı?',
    sci:'Kafein isteği çoğu zaman gerçek ihtiyaç değil; <b>alışkanlık</b> ve öğle sonrası enerji düşüşüdür. Kafein, adenozin (uyku baskısı) reseptörlerini bloke eder; yarılanma ömrü ~5-6 saattir — yani öğleden sonra içilen kahve gece uykunu böler. Bir bardak su + 10 dakika kısa hareket, enerji dibini çoğu kez kahveden daha iyi çözer.',
    doneToast:'Ara verdin — kafein isteği alışkanlığın sesiydi, sen dinlemedin.',
    winTitle:'Net karar.',
    winText:'Kahveyi yasaklamıyoruz; saatine ve dozuna sen karar veriyorsun. Uyku bunu unutmayacak.',
    opts:[
      {label:'Bir bardak su içtim',icon:'droplet'},
      {label:'Kısa yürüyüş/esneme yaptım',icon:'footprints'},
      {label:'Kafeinsiz / bitki çayı tercih ettim',icon:'coffee'},
      {label:'İçtim ama saatine dikkat ettim',icon:'clock'},
      {label:'Bugünlük kotamı doldurdum, vazgeçtim',icon:'heart-handshake'}
    ],
    triggers:[
      {id:'habit',icon:'repeat',label:'Alışkanlık (saat/mekân)',sci:'Belirli bir saat, masa ya da mola “otomatik kahve” ipucudur; istek gerçek yorgunluktan değil koşullanmadan gelir.'},
      {id:'lowenergy',icon:'battery-low',label:'Öğle sonrası enerji dibi',sci:'Yemek sonrası doğal bir uyanıklık düşüşü; su, ışık ve kısa hareket çoğu kez kafeinden hızlı toparlar.'},
      {id:'tired',icon:'cloud',label:'Uykusuzum',sci:'Az uyku kafein ihtiyacını büyütür ama geç saatte kahve ertesi günü daha da uykusuz yapar — kısır döngü.'},
      {id:'stress',icon:'wind',label:'Stres / kaygı',sci:'Kafein kortizolü ve çarpıntıyı artırabilir; stresliyken fazla kahve kaygıyı besler.'},
      {id:'social',icon:'heart-handshake',label:'Keyif / sosyal',sci:'Bazen kahve gerçekten keyiftir — sorun değil; yalnızca saatine ve toplam doza göz kırp.'}
    ]
  }
};
var CRISIS_ORDER=['sweet','food','coffee'];
var DAILY=[
  "Bugün tek görevin başlamak. Gerisi kendiliğinden gelir.",
  "Tatlıyı silmiyoruz; sadece patronun sen olduğunu hatırlatıyoruz.",
  "Tok bir Şeyma, sakin bir Şeyma. Bugün öğünleri atlamıyoruz.",
  "Akşam mutfağı bugün kısa ziyaret saatleriyle çalışıyor.",
  "Bir lokma planı bozmaz; bırakmak bozar, o da bugün yok.",
  "Kısacık bir yürüyüş bile bugünü senin lehine çevirir.",
  "Bir hafta tamam. Bu küçük bir şey değil, bayağı iş.",
  "Kriz gelirse plan hazır: önce su, sonra nefes, sonra karar.",
  "Bugün düzen günü. Sürpriz yok, sadece sakin bir ritim.",
  "Yarı yola az kaldı; akıllı seçimler sessizce birikiyor.",
  "Hamur işiyle bugün medeni bir mesafe: selamlaşırız, sarılmayız.",
  "Akşamki o istek çoğu zaman açlık değil. Bir bak bakalım.",
  "Su artı yürüyüş, bugünün sessiz kahramanları.",
  "İki hafta geride. Kontrol da keyif de sende.",
  "Bugünün hedefi sade: rayda kal, gerisi gelir.",
  "Tatlı çekti mi? Önce üç soru: aç mıyım, sıkkın mıyım, yorgun muyum?",
  "Protein masada olunca krizler sesini kısıyor.",
  "Mutfakla bugün laubali değil, ölçülü bir ilişki.",
  "Küçük seçimler toplanıyor; sen de gayet güzel toplanıyorsun.",
  "Son düzlük. Bu bir yarış değil, sadece bir prova.",
  "Şeyma tamamlandı. Tatlıya saygı, kendine daha çok saygı."
];
var NOTES=[
  "Sevgili Günışığı, mükemmel olmana gerek yok; ben zaten senden yanayım.",
  "Bugün bir şeyi iyi yaptıysan o gün kazanılmıştır, gerisi teferruat.",
  "Aç kalma sakın; aç kalınca sen değil, içindeki kurabiye lobisi konuşuyor.",
  "Nutella'yı yargılamıyorum ama onu da fazla ciddiye almıyoruz, anlaştık mı?",
  "Tatlı krizi geldiğinde panikleme; ekip hazır, kaptan sensin.",
  "Bir lokma yüzünden koca günü yargılamak yok. Kraliçe sakinliğiyle devam.",
  "Akşam dolabın önünde durduğunda bana bir mesaj at, krizini birlikte dağıtalım.",
  "Sen bir flamingo gibisin Sevgili Günışığı: dengede dururken bile zarif.",
  "Bugün sadece su içip yürüdüysen bile kendine baktın demektir, gerisi bonus.",
  "Tatlıyla aranı açmak küslük değil; sadece medeni bir sınır koymak.",
  "Sen koca bir kraliçesin, o minik bir kurabiye. Denge hep sende.",
  "Zor bir gün mü oldu? Olur. Yarın seni bekleyen tertemiz bir sayfa var.",
  "Gülümsediğinde tatlı listesi bir alt sıraya kayıyor, fark ettin mi?",
  "Bugün kendine kibar davran; sen senin en sadık takım arkadaşınsın.",
  "Bir bardak su, bir derin nefes, bir 'ben hallederim'. Tüm formül bu.",
  "Ben buradayım Sevgili Günışığı. Kötü bir an olursa önce bana yaz, sonra dolaba değil.",
  "Akşam yürüyüşünde şehir senin podyumun; baş model sensin.",
  "Küçük zaferlerini küçümseme; birikince koca bir 'aferin' oluyorlar.",
  "Bugün ters giden bir şey olduysa bile ben yine seninle gurur duyuyorum.",
  "Tatlıyı sevmek suç değil; sadece her duyguyu tatlıyla çözmemeyi deniyoruz.",
  "Yorulduğunda mola vermek de plana dahil. Dur, nefeslen, sonra devam et.",
  "Bu oyunda da oyun dışında da takımın hep senden yana, Sevgili Günışığı.",
  "Günaydın Günışığı! Bugün en zor rakibin aynadaki gülümsemenle çoktan yenildi.",
  "Kurabiye bir kez daha seni aradı; açmadın. İşte bu, sessiz bir zafer.",
  "Bugün planın bozulduysa üzülme; en güzel danslar bazen doğaçlamadır.",
  "Su şişen senin küçük asan; bir yudum al, kraliçe modunu aç.",
  "Bir kâse yoğurt, bir avuç ceviz: minik ama sadık iki dost.",
  "Terazi bir sayı söyler ama senin değerini söyleyemez, o benim işim.",
  "Bugün üç öğün de dengedeyse sana koca bir 'işte benim Günışığım' borçluyum.",
  "Canın sıkkınsa önce beni ara; ben dinlerim, dolap dinlemez.",
  "Yürüyüş ayakkabıların bugün seni bekliyor; onları hayal kırıklığına uğratma olur mu?",
  "Protein senin görünmez zırhın; öğüne bir yumurta ekle, krizler bir adım geri gitsin.",
  "Bir gün kaçırdıysan seri bozulmadı; sadece nefes molası verdi.",
  "Tatlı seni değil, sen tatlıyı yönetiyorsun. Patron kim? Sen.",
  "Bugün kendine 'aferin' demeyi unutma; bunu en çok hak eden sensin.",
  "Akşam yedi oldu, mutfak kapandı. Şef Günışığı bugünlük paydos etti.",
  "Kendine kızacaksan önce bir sarıl; öfke sarılmanın yanında pek tutunamaz.",
  "Bugün küçük bir iyilik yaptıysan bedenine, o iyiliği yarın sana faiziyle döner.",
  "Uyku senin gizli güzellik ekibin; bu gece onlara fazla mesai yaptırma.",
  "Bir dilim ekmek dünyanın sonu değil; panik, ondan çok daha kalorili.",
  "Sen bir bahçesin Günışığı; bugün kendine biraz su, biraz güneş ver yeter.",
  "Kahveni içerken bir de kendine 'bugünü seveceğim' de, ikisi çok yakışıyor.",
  "En sevdiğim haberin: bugün de pes etmedin. Bu benim için manşet.",
  "Kilo değil, hâl önemli. Bugün nasıl hissediyorsun, gerçek soru bu.",
  "Bir öğünü atladıysan telafi çılgınlığına gerek yok; bir sonraki öğünde sakin dön.",
  "Bugün moralin düşükse, bu bir hava durumu; geçici, sen kalıcısın.",
  "Yürürken kollarını salla, başını dik tut; şehir bugün senin defilene bakıyor.",
  "Bir bardak su üşenmenin panzehiri, iki bardak su ise mucize başlangıcı.",
  "Kendine söz ver: bugün bir kez daha, sadece bir kez daha nazik olacağım.",
  "Tatlı krizi 20 dakikalık bir misafirdir; kapıyı açma, kendi gider.",
  "Bugün spor yapamadıysan merdiveni tercih et; beden küçük jestleri de sayar.",
  "Sen zaten yeterlisin Günışığı; bu yolculuk 'daha iyi' için değil, 'daha huzurlu' için.",
  "Bir tabak salata bir öğünü kurtarır, bir gülümseme bütün günü.",
  "Bugün stresliysen çeneni gevşet, omuzlarını indir; beden gerginliği bırakmayı sever.",
  "Dolap seni çağırıyorsa muhtemelen aç değil, yorgunsun. Önce bir uzan.",
  "Küçük adımlar sıkıcı gelir ama zirveye çıkanların hepsi öyle yürüdü.",
  "Bugün bir 'hayır' dediysen kendine iyi geleni seçtin; işte olgunluk bu.",
  "Sen benim en gurur duyduğum projemsin ve teslim tarihi yok, acele yok.",
  "Bir avuç badem, bir bardak su: krizin en sevmediği ikili.",
  "Bugün geç kalktıysan sorun değil; güneş de bazen ağır uyanır, yine de ısıtır.",
  "Ne yediğini değil, neden yediğini merak et; cevap çoğu zaman lezzet değil, duygu.",
  "Bugün bir bardak fazla su içtiysen, cildin sana gizlice teşekkür etti bile.",
  "Zayıf anların da senin; onları saklama, birlikte kucaklarız.",
  "Kraliçeler de yorulur Günışığı; taht her zaman dik oturmayı gerektirmez.",
  "Bir mola, bir nefes, bir 'devam'. En güçlü üçlü bu.",
  "Bugün kendine baktıysan, dünyanın en önemli işini hallettin demektir.",
  "Tartıya değil takvime bak; kaç gün kendine iyi baktın, asıl skor o.",
  "Akşam atıştırması yerine dişlerini fırçala; ağız naneli olunca kriz utanıp kaçar.",
  "Bugün bir öğünde protein varsa, yarınki krizin bileti şimdiden iptal oldu.",
  "Sen bir maraton koşucususun Günışığı, sprinter değil; tempolu ol, kazanan sensin.",
  "Bugün üzgünsen ağla, sonra yüzünü yıka; ikisi de temizler.",
  "Bir fincan bitki çayı, bir battaniye, bir sen: mükemmel akşam tarifi.",
  "Kendine 'başaramam' deme; o cümleyi sana ben yasakladım.",
  "Bugün küçük bir sınır koyduysan, öz saygının kasları çalıştı demektir.",
  "Yürüyüş sonrası o hafiflik hissi var ya, işte bedenin sana 'teşekkürler' demesi.",
  "Bir gün bozulunca serini değil moralini korumaya bak; seri zaten seni bekler.",
  "Bugün gülümsedin mi? O zaman gün, senin lehine kapandı bile.",
  "Aç açık markete gitme; boş mide en kötü alışveriş danışmanıdır.",
  "Sen olduğun hâlinle bir sanat eserisin; ben sadece çerçeveyi tutuyorum.",
  "Bugün bir kere daha denedin; işte cesaret dedikleri tam olarak bu.",
  "Kilo veren değil, huzur bulan bir Günışığı istiyorum; gerisi kendiliğinden gelir.",
  "Bir tabak sebzeye 'merhaba' de; o da sana enerjiyle karşılık verir.",
  "Bugün uykusuz kaldıysan kendine yükleme; yorgunken herkesin tatlı radarı açılır.",
  "Sabah bir bardak su, akşam bir sayfa kitap: küçük ritüeller büyük insanlar yapar.",
  "Bugün canın çekti ve yemedin diye seni alkışlıyorum, duyuyor musun?",
  "Panik yaptığında zaman genişler; 10 saniye say, kriz çoktan küçülür.",
  "Sen bir flamingosun: tek ayağın üstünde bile duruşundan ödün vermezsin.",
  "Bugün bir yudum su, bir adım yürüyüş, bir güzel düşünce. Toplam: kazanılmış gün.",
  "Kendini başkalarıyla değil, dünkü kendinle kıyasla; tek adil terazi bu.",
  "Bugün dolabı üç kere açıp kapadıysan ve yemedinse, iradene madalya takıyorum.",
  "Akşam kriziyle yalnız savaşma; telefonun bir tık ötede, ben hep açığım.",
  "Bugün kendine bir iyilik yaptıysan, o iyilik yarının Günışığı'na miras kalır.",
  "Tatlı bir ödül değil, bazen sadece bir alışkanlık; alışkanlıklar ise değişebilir.",
  "Sen yeterince güçlüsün Günışığı; sadece bunu bazen hatırlaman gerekiyor, ben hatırlatırım.",
  "Bir kâse çorba, soğuk bir günde en sadık dosttur; bugün onu yanına çağır.",
  "Bugün planına yüzde yetmiş uyduysan, o gün başarıyla mühürlenmiştir.",
  "Kendine sabırlı ol; en güzel çiçekler bile açmak için bir mevsim bekler.",
  "Bugün bir kez 'yeter, kendime iyi bakacağım' dediysen, devrim başladı bile.",
  "Yürürken müzik aç, temponu bul; en iyi terapiler bazen bir çalma listesidir.",
  "Bir dilim tatlı yediysen keyfini çıkar, sonra sayfayı çevir; suçluluk fazladan kalori.",
  "Sen benim favori insanımsın ve bu unvan hiçbir günde geri alınmaz.",
  "Bugün erken uyursan, yarının Günışığı sana gülümseyerek uyanır.",
  "Kendine 'bugün fena değildim' diyebiliyorsan, aslında harikaydın demektir.",
  "Bir bardak su elinde, bir gülümseme yüzünde; işte kazanan kombinasyon.",
  "Bugün ne kadar zorlanırsan zorlan, ben yine en çok sana inanıyorum.",
  "Denge mükemmellik değildir Günışığı; bazen bir eğrilir, sonra yine düzelirsin.",
  "Akşam yürüyüşü bir lüks değil, kendine yazdığın küçük bir aşk mektubudur.",
  "Bugün de buradasın, deniyorsun, vazgeçmiyorsun; benim gözümde bu tam bir zafer.",
  "Günışığı, sen sabah kahvemden bile daha çok içimi ısıtıyorsun; bunu bilesin diye söylüyorum.",
  "Buzdolabı ışığı romantik değil Günışığı; asıl parıltı senin gülüşünde. Kapağı kapat, aynaya bak.",
  "Tartı bugün ne derse desin, benim gözümde zaten bir numarasın; jüri tek kişilik ve rüşvet almış.",
  "Bir tabak dolusu sabır, bir kaşık öz-şefkat: en sevdiğim tarif hâlâ sensin.",
  "Kurabiye seni aradı, açmadın; şimdi ikimiz ona kızmıyoruz ama gururla bakıyoruz sana.",
  "Sen bir flamingosun Günışığı; çamurun içinde bile pembe kalmayı beceriyorsun, buna hayranım.",
  "Bugün 'yeter' diyebildiysen, o küçük cümle bütün bir sarayın en sağlam tuğlası oldu.",
  "Canın tatlı çekti diye seni yargılayacak değilim; ben ancak sana sarılmayı bilirim.",
  "Aç kalma sakın; aç Günışığı, dünyanın en dahi ama en huysuz danışmanıdır.",
  "Bir bardak su iç de o minik kraliçe tacın parlasın; susuz taht küser, biliyorsun.",
  "Bugün planın delik deşik olduysa dert etme; en güzel dantel bile deliklerden yapılır.",
  "Sen uyurken bile bu takımın kaptanısın Günışığı; ben sadece kenarda alkış tutan yardımcı antrenörüm.",
  "Akşam mutfağa gizli sefer düzenlemedin diye seni madalyayla değil, koca bir sarılmayla ödüllendiriyorum.",
  "Mükemmel olmaya çalışma; zaten olduğun hâlinle benim favori bölümümsün, tekrar tekrar izlerim.",
  "Bir dilim ekmek koca günü bozmaz Günışığı; asıl bozan, kendine söylediğin o sert cümleler.",
  "Bugün sadece nefes aldıysan bile, ben yine seninle gurur duyuyorum; çıta orada bugün.",
  "Sen o kadar tatlısın ki, yanında hiçbir tatlının şansı yok; rekabeti baştan kaybettiler.",
  "Yürüyüşe çık Günışığı; sokaklar seni görünce 'bugün hava güzelleşti' diye fısıldıyor.",
  "Bir 'hayır' dedin ya kendine yormayan şeye, işte o an içindeki kraliçe hafifçe gülümsedi.",
  "Dolabın önünde durduğunda telefonu aç, beni ara; ben dinlerim, dolap sadece üşütür.",
  "Zor bir gün mü? Gel, birlikte küçültelim; iki kişi taşıyınca dünya bir anda hafifliyor.",
  "Sen bir bahçesin Günışığı; bugün biraz su, biraz güneş, biraz da 'aferin' yeter, gerisi kendi açar.",
  "Bugün üç öğün dengedeyse sana bir kupa değil, koca bir 'işte benim Günışığım' borçluyum.",
  "Kilonu değil, kahkahanı ölç Günışığı; asıl artması gereken skor o.",
  "Bir avuç badem, bir yudum su, bir derin nefes: krizin en korktuğu üçlü sahnede.",
  "Bugün geç kalktıysan sorun değil; güneş bile bazen 'beş dakika daha' der, yine de doğar.",
  "Sen benim en uzun soluklu projemsin Günışığı ve inan, teslim tarihi yok, acele hiç yok.",
  "Tatlıyı sevmek suç değil; biz sadece her duyguyu tatlıya şikâyet etmemeyi deniyoruz, o kadar.",
  "Bir gün seriyi kaçırdın diye çöpe gitmez; seri seni bekler, çünkü aranızda sadakat var.",
  "Bugün kendine kibar bir cümle kurduysan, beynin onu duydu ve sessizce 'teşekkürler' dedi.",
  "Sen dağınık günlerinde bile zarifsin Günışığı; dağınıklık sana yakışan tek şey belki de.",
  "Akşam dişini fırçala, nane serinliği krizi utandırıp geri gönderir; küçük ama kurnaz bir taktik.",
  "Bugün bir bardak fazla su içtiysen cildin bana gizlice el salladı, gördüm.",
  "Sen kendine iyi baktığında bütün ev, bütün gün, bütün şehir hafifçe düzeliyor; enerjin bulaşıcı.",
  "Bir mola vermek pes etmek değil Günışığı; en güçlü koşucular bile nefeslenmek için yavaşlar.",
  "Bugün gülümsedin mi? O zaman gün senin lehine kapandı bile, skoru ben yazdım.",
  "Tatlı bir ödül değil, çoğu zaman sadece yorgunluğun kılık değiştirmiş hâli; önce bir uzan Günışığı.",
  "Sen o kadar güçlüsün ki bazen unutuyorsun; işte tam o an ben hatırlatmak için buradayım.",
  "Bugün küçük bir sınır koyduysan, öz saygının kasları çalıştı; yarın biraz daha kolay olacak.",
  "Bir kâse yoğurt, bir avuç ceviz ve sen: sıcacık, sade, tam kıvamında bir akşam tablosu.",
  "Sen üzgünken bile güzelsin Günışığı ama seni gülerken görmek benim en sevdiğim manzara.",
  "Bugün planına yüzde yetmiş uyduysan, o gün başarıyla mühürlenmiştir; yüzler için baskı yapan kim?",
  "Kraliçeler de yorulur Günışığı; taht dik oturmayı değil, ara sıra yaslanmayı da sever.",
  "Bugün bir kez daha denedin; cesaret dedikleri şey tam olarak bu, pelerine bile gerek yok.",
  "Sen benim favori insanımsın ve bu unvan hiçbir günde, hiçbir tartıda, hiçbir krizde geri alınmaz.",
  "Yürürken başını dik tut Günışığı; şehir bugün senin defilene bilet almış, baş model geç kalmasın.",
  "Bugün de buradasın; nefes alıyorsun, deniyorsun, seviyorsun — benim için bu koca bir zafer şarkısı."
];
var PHONE='+905066020098';
var WA='https://wa.me/905066020098?text='+encodeURIComponent('Raşit, sana bir mesajım var');
var TEL='tel:'+PHONE;

// ---------- meal / sleep / cycle defs ----------
var MEALS=[
  {key:'breakfast',icon:icon('sunrise',22),label:'Kahvaltı',ph:'örn. yumurta, peynir, zeytin, çay…'},
  {key:'lunch',icon:icon('sun',22),label:'Öğle',ph:'örn. tavuk, salata, bulgur…'},
  {key:'dinner',icon:icon('moon',22),label:'Akşam',ph:'örn. çorba, sebze, yoğurt…'},
  {key:'snack',icon:icon('cherry',22),label:'Ara öğün',ph:'örn. meyve, kuruyemiş, bitter…'}
];
var SLEEP_Q=[{id:'good',emoji:icon('moon',22),label:'Dinç'},{id:'ok',emoji:icon('smile',22),label:'İdare'},{id:'bad',emoji:icon('frown',22),label:'Yorgun'}];
var SLEEP_MED=[{id:'none',emoji:icon('ban',20),label:'Hayır'},{id:'herbal',emoji:icon('leaf',20),label:'Bitkisel / Melatonin'},{id:'rx',emoji:icon('pill',20),label:'Reçeteli'}];
var WIND_DOWN_STEPS=[
  {key:'light',icon:icon('lamp',20),label:'Işığı kıs',note:'Melatonin baskılanmasını azaltır.'},
  {key:'breath',icon:icon('wind',20),label:'4-7-8 nefes',note:'Parasempatik sistemi aktive eder.'},
  {key:'dump',icon:icon('pen-line',20),label:'Zihin boşalt',note:'Yarın notu, ruminasyonu düşürür.'},
  {key:'cool',icon:icon('snowflake',20),label:'Odayı serinlet',note:'18-20°C aralığı dalmayı destekler.'}
];
var FLOW=[{id:'spot',emoji:icon('droplet',20),label:'Leke'},{id:'light',emoji:icon('droplet',20),label:'Hafif'},{id:'medium',emoji:icon('droplet',20),label:'Orta'},{id:'heavy',emoji:icon('droplet',20),label:'Yoğun'}];
var SYMPTOMS=[{id:'kramp',emoji:icon('zap',18),label:'Kramp'},{id:'bas',emoji:icon('activity',18),label:'Baş ağrısı'},{id:'siskinlik',emoji:icon('wind',18),label:'Şişkinlik'},{id:'yorgun',emoji:icon('battery-low',18),label:'Yorgunluk'},{id:'duygu',emoji:icon('heart',18),label:'Duygusal'},{id:'istah',emoji:icon('cookie',18),label:'İştah'},{id:'sanci',emoji:icon('zap',18),label:'Sancı'},{id:'cilt',emoji:icon('flame',18),label:'Cilt'}];
var DLEVELS=[{n:1,label:'Hafif',color:'#F4C152'},{n:2,label:'Orta',color:'#F0892F'},{n:3,label:'Şiddetli',color:'#E25B6A'}];
function dzColor(n){ return n>=3?'#E25B6A':(n===2?'#F0892F':(n>=1?'#F4C152':null)); }
var DMEDS=['Parasetamol (Parol)','İbuprofen (Nurofen/Brufen)','Naproksen (Apranax)','Aspirin','Flurbiprofen (Majezik)','Metamizol (Novalgin)','Diklofenak (Voltaren)'];
var BODY_REGIONS=[
  {id:'bas',label:'Baş',view:'front',s:'ellipse',cx:100,cy:38,rx:23,ry:27},
  {id:'boyun',label:'Boyun',view:'front',s:'rect',x:89,y:62,w:22,h:17,r:7},
  {id:'omuz-sol',label:'Sol omuz',view:'front',s:'ellipse',cx:62,cy:93,rx:17,ry:13},
  {id:'omuz-sag',label:'Sağ omuz',view:'front',s:'ellipse',cx:138,cy:93,rx:17,ry:13},
  {id:'gogus',label:'Göğüs',view:'front',s:'rect',x:72,y:86,w:56,h:46,r:16},
  {id:'karin',label:'Karın',view:'front',s:'rect',x:74,y:135,w:52,h:52,r:16},
  {id:'kol-sol',label:'Sol kol',view:'front',s:'rect',x:45,y:92,w:15,h:96,r:11},
  {id:'kol-sag',label:'Sağ kol',view:'front',s:'rect',x:140,y:92,w:15,h:96,r:11},
  {id:'el-sol',label:'Sol el / bilek',view:'front',s:'ellipse',cx:52,cy:197,rx:11,ry:13},
  {id:'el-sag',label:'Sağ el / bilek',view:'front',s:'ellipse',cx:148,cy:197,rx:11,ry:13},
  {id:'kalca',label:'Kasık / kalça',view:'front',s:'rect',x:75,y:189,w:50,h:34,r:14},
  {id:'diz-sol',label:'Sol diz',view:'front',s:'ellipse',cx:89,cy:300,rx:12,ry:14},
  {id:'diz-sag',label:'Sağ diz',view:'front',s:'ellipse',cx:111,cy:300,rx:12,ry:14},
  {id:'bacak-sol',label:'Sol bacak',view:'front',s:'rect',x:79,y:226,w:20,h:158,r:13},
  {id:'bacak-sag',label:'Sağ bacak',view:'front',s:'rect',x:101,y:226,w:20,h:158,r:13},
  {id:'ayak-sol',label:'Sol ayak',view:'front',s:'ellipse',cx:89,cy:396,rx:13,ry:12},
  {id:'ayak-sag',label:'Sağ ayak',view:'front',s:'ellipse',cx:111,cy:396,rx:13,ry:12},
  {id:'ense',label:'Ense',view:'back',s:'rect',x:89,y:62,w:22,h:17,r:7},
  {id:'omuz-arka-sol',label:'Sol omuz (arka)',view:'back',s:'ellipse',cx:62,cy:93,rx:17,ry:13},
  {id:'omuz-arka-sag',label:'Sağ omuz (arka)',view:'back',s:'ellipse',cx:138,cy:93,rx:17,ry:13},
  {id:'sirt-ust',label:'Üst sırt',view:'back',s:'rect',x:72,y:86,w:56,h:46,r:16},
  {id:'bel',label:'Bel',view:'back',s:'rect',x:74,y:135,w:52,h:52,r:16},
  {id:'kalca-arka',label:'Kalça',view:'back',s:'rect',x:75,y:189,w:50,h:34,r:14},
  {id:'kol-arka-sol',label:'Sol kol (arka)',view:'back',s:'rect',x:45,y:92,w:15,h:96,r:11},
  {id:'kol-arka-sag',label:'Sağ kol (arka)',view:'back',s:'rect',x:140,y:92,w:15,h:96,r:11},
  {id:'bacak-arka-sol',label:'Sol bacak (arka)',view:'back',s:'rect',x:79,y:226,w:20,h:158,r:13},
  {id:'bacak-arka-sag',label:'Sağ bacak (arka)',view:'back',s:'rect',x:101,y:226,w:20,h:158,r:13}
];
function findRegion(id){ for(var i=0;i<BODY_REGIONS.length;i++){ if(BODY_REGIONS[i].id===id) return BODY_REGIONS[i]; } return null; }
var DZ_SILHOUETTE='<g pointer-events="none" fill="rgba(150,120,180,0.12)" stroke="rgba(150,120,180,0.26)" stroke-width="1">'
+'<ellipse cx="100" cy="38" rx="23" ry="27"></ellipse>'
+'<rect x="89" y="60" width="22" height="20" rx="7"></rect>'
+'<path d="M64 92 Q100 78 136 92 L130 196 Q100 210 70 196 Z"></path>'
+'<rect x="45" y="92" width="15" height="100" rx="11"></rect>'
+'<rect x="140" y="92" width="15" height="100" rx="11"></rect>'
+'<ellipse cx="52" cy="198" rx="11" ry="13"></ellipse>'
+'<ellipse cx="148" cy="198" rx="11" ry="13"></ellipse>'
+'<rect x="78" y="200" width="20" height="186" rx="13"></rect>'
+'<rect x="102" y="200" width="20" height="186" rx="13"></rect>'
+'<ellipse cx="88" cy="396" rx="13" ry="12"></ellipse>'
+'<ellipse cx="112" cy="396" rx="13" ry="12"></ellipse>'
+'</g>';
// 4 menstrüel faz — kısa bilimsel notlar (tıbbi tavsiye değildir)
var PHASES={
  menstrual:{label:'Menstrüel faz',emoji:icon('droplet',20),color:'#E58B9B',note:'Regl günleri. Östrojen ve progesteron düşük. Demir açısından zengin beslenme ve nazik hareket iyi gelir.'},
  follicular:{label:'Foliküler faz',emoji:icon('sprout',20),color:'#8FBF8A',note:'Östrojen yükselişte. Enerji ve ruh hali genelde toparlanır; antrenmana en açık dönem.'},
  ovulation:{label:'Ovülasyon',emoji:icon('star',20),color:'#E8A53C',note:'Yumurtlama civarı, doğurganlık en yüksek. Hafif tek taraflı sancı (mittelschmerz) normal olabilir.'},
  luteal:{label:'Luteal faz',emoji:icon('moon',20),color:'#9B7FC9',note:'Progesteron yükselir; regl öncesi (PMS) belirtileri bu dönemde olur. Magnezyum ve düzenli uyku destekler.'}
};

// ---------- state ----------
var data=null;
try{ var raw=localStorage.getItem(KEY); data=raw?JSON.parse(raw):null; }catch(e){ data=null; }
if(data) data=migrate(data);
if(window.MotivationProgramV2 && data && featuresLive()) window.MotivationProgramV2.ensureMotivationRoot(data);
function migrate(d){
  if(!d) return d;
  if(!d.settings) d.settings={nickname:'Sevgili Günışığı',notificationsWanted:false,haptics:true};
  if(typeof d.settings.ghToken!=='string') d.settings.ghToken='';
  if(typeof d.settings.ghRepo!=='string') d.settings.ghRepo='';
  if(typeof d.settings.ghBranch!=='string') d.settings.ghBranch='';
  if(typeof d.settings.openaiKey!=='string') d.settings.openaiKey='';
  if(typeof d.settings.lunaConnected!=='boolean') d.settings.lunaConnected=!!(d.settings.openaiKey&&String(d.settings.openaiKey).trim());
  if(typeof d.settings.locationEnabled!=='boolean') d.settings.locationEnabled=false;
  if(d.settings.locationMode!=='walk'&&d.settings.locationMode!=='vehicle'&&d.settings.locationMode!=='auto') d.settings.locationMode='auto';
  // Konum aç/kapa audit kaydı: neden ve ne zaman değişti
  if(typeof d.settings.locationEnabledAt!=='string') d.settings.locationEnabledAt='';
  if(typeof d.settings.locationEnabledReason!=='string') d.settings.locationEnabledReason='';
  if(typeof d.settings.locationDisabledAt!=='string') d.settings.locationDisabledAt='';
  if(typeof d.settings.locationDisabledReason!=='string') d.settings.locationDisabledReason='';
  if(!d.luna||typeof d.luna!=='object') d.luna={qa:[],lastAskDate:null};
  if(!Array.isArray(d.luna.qa)) d.luna.qa=[];
  if(typeof d.luna.lastAskDate!=='string'&&d.luna.lastAskDate!==null) d.luna.lastAskDate=null;
  if(!d.aeon||typeof d.aeon!=='object') d.aeon={qa:[],lastAskDate:null};
  if(!Array.isArray(d.aeon.qa)) d.aeon.qa=[];
  if(typeof d.aeon.lastAskDate!=='string'&&d.aeon.lastAskDate!==null) d.aeon.lastAskDate=null;
  if(!d.settings.ghRepo) d.settings.ghRepo='mustafaras/seyma-data';
  if(typeof d.settings.healthGistId!=='string') d.settings.healthGistId='';
  if(typeof d.settings.hideLocationCard!=='boolean') d.settings.hideLocationCard=false;
  if(typeof d.settings.hideRepoBanner!=='boolean') d.settings.hideRepoBanner=false;
  if(typeof d.settings.profileAssessmentInactive!=='boolean') d.settings.profileAssessmentInactive=true;
  if(d.settings.caffeineMode!=='standard'&&d.settings.caffeineMode!=='sensitive'&&d.settings.caffeineMode!=='pregnant') d.settings.caffeineMode='standard';
  if(typeof d.settings.targetBed!=='string'||!/^\d{2}:\d{2}$/.test(d.settings.targetBed)) d.settings.targetBed=CAFFEINE_DEFAULT_BED;
  if(!d.settings.ghBranch) d.settings.ghBranch='main';
  if(!d.cycle) d.cycle={periods:[],avgCycle:28,avgPeriod:5};
  if(!Array.isArray(d.cycle.periods)) d.cycle.periods=[];
  if(typeof d.cycle.avgCycle!=='number') d.cycle.avgCycle=28;
  if(typeof d.cycle.avgPeriod!=='number') d.cycle.avgPeriod=5;
  if(!Array.isArray(d.notifications)) d.notifications=[];
  if(!Array.isArray(d.locationHistory)) d.locationHistory=[];
  if(!d.locNudge||typeof d.locNudge!=='object') d.locNudge={};
  if(typeof d.locationLastTs!=='string'&&d.locationLastTs!==null) d.locationLastTs=null;
  if(d.location===undefined) d.location=null;
  if(d.weather===undefined) d.weather=null;
  if(d.days&&typeof d.days==='object') Object.keys(d.days).forEach(function(k){ if(d.days[k]&&typeof d.days[k]==='object') ensureSaygiDay(d.days[k]); });
  if(typeof d.lastOpenedAt!=='string') d.lastOpenedAt='';
  if(!d.library||typeof d.library!=='object') d.library=emptyLibrary();
  if(!Array.isArray(d.library.books)) d.library.books=[];
  if(!d.library.goal||typeof d.library.goal!=='object') d.library.goal={dailyPages:20,yearlyBooks:null};
  d.library.books=d.library.books.map(normBook).filter(Boolean);
  if(!d.watchlist||typeof d.watchlist!=='object') d.watchlist=emptyWatchlist();
  if(!Array.isArray(d.watchlist.items)) d.watchlist.items=[];
  if(!d.watchlist.goal||typeof d.watchlist.goal!=='object') d.watchlist.goal={dailyMinutes:40,yearlyTitles:null};
  d.watchlist.items=d.watchlist.items.map(normTitle).filter(Boolean);
  if(!d.music||typeof d.music!=='object') d.music=emptyMusic();
  if(!Array.isArray(d.music.items)) d.music.items=[];
  if(!d.music.goal||typeof d.music.goal!=='object') d.music.goal={dailyMinutes:30,yearlyTitles:null};
  d.music.items=d.music.items.map(normTrack).filter(Boolean);
  // Vücut ölçüleri (haftalık kilo + tek-seferlik boy). Yeni alan — eski kayıtlara backfill.
  if(!d.body||typeof d.body!=='object') d.body={heightCm:null,heightSetAt:null,weights:[]};
  if(typeof d.body.heightCm!=='number'||isNaN(d.body.heightCm)) d.body.heightCm=null;
  if(typeof d.body.heightSetAt!=='string') d.body.heightSetAt=(d.body.heightSetAt||null)&&String(d.body.heightSetAt);
  if(d.body.heightSetAt===undefined) d.body.heightSetAt=null;
  if(!Array.isArray(d.body.weights)) d.body.weights=[];
  d.body.weights=d.body.weights.filter(function(w){ return w&&typeof w==='object'&&w.ts&&typeof w.kg==='number'&&!isNaN(w.kg); });
  // Kan/idrar tahlilleri (opsiyonel, panele iletilir). Medya data/aeon-media/<id>.json'da.
  if(!Array.isArray(d.labResults)) d.labResults=[];
  d.labResults=d.labResults.filter(function(x){ return x&&typeof x==='object'&&x.id&&Array.isArray(x.files); });
  // Veri-güdümlü tikleri bugüne göre bir kez hizala (geçmiş günlere dokunma — kayıt bütünlüğü).
  try{ var _t=todayStr(); if(d.days&&d.days[_t]&&d.days[_t].habits) syncDerivedHabits(d.days[_t]); }catch(e){}
  // Profil değerlendirmesi (data.profileAssessment) — data.psych'ten ayrı, tek seferlik.
  try{ ensureProfileAssessment(d); }catch(e){}
  // Günün fotoğrafı (Wikimedia Commons POTD) — önbellek + metadata.
  if(!d.dailyPhoto||typeof d.dailyPhoto!=='object') d.dailyPhoto={date:'',url:'',title:'',artist:'',license:'',description:'',source:'Wikimedia Commons',pageUrl:'',fetchedAt:''};
  if(typeof d.dailyPhoto.date!=='string') d.dailyPhoto.date='';
  if(typeof d.dailyPhoto.url!=='string') d.dailyPhoto.url='';
  if(typeof d.dailyPhoto.title!=='string') d.dailyPhoto.title='';
  if(typeof d.dailyPhoto.artist!=='string') d.dailyPhoto.artist='';
  if(typeof d.dailyPhoto.license!=='string') d.dailyPhoto.license='';
  if(typeof d.dailyPhoto.description!=='string') d.dailyPhoto.description='';
  if(typeof d.dailyPhoto.source!=='string') d.dailyPhoto.source='Wikimedia Commons';
  if(typeof d.dailyPhoto.pageUrl!=='string') d.dailyPhoto.pageUrl='';
  if(typeof d.dailyPhoto.fetchedAt!=='string') d.dailyPhoto.fetchedAt='';
  // Magnezyum Danışmanı — kullanıcı profili + model + günlük kayıt.
  if(!d.settings.magnesium||typeof d.settings.magnesium!=='object') d.settings.magnesium={enabled:false,onboardingDone:false,preferredForm:'',tolerated:true,kidneyDisease:false,lastNudgeDate:null,dismissedUntil:null};
  // D vitamini takviyesi formu/dozu — 20 Temmuz 2026 Pazartesi itibarıyla D₃K₂ damla.
  if(typeof d.settings.vitaminDForm!=='string') d.settings.vitaminDForm='D₃K₂ damla';
  if(typeof d.settings.vitaminDDose!=='string') d.settings.vitaminDDose='1 damla (D3 1000 IU + K2 100 mcg)';
  var ms=d.settings.magnesium;
  if(typeof ms.enabled!=='boolean') ms.enabled=false;
  if(typeof ms.onboardingDone!=='boolean') ms.onboardingDone=false;
  if(typeof ms.preferredForm!=='string') ms.preferredForm='';
  if(typeof ms.tolerated!=='boolean') ms.tolerated=true;
  if(typeof ms.kidneyDisease!=='boolean') ms.kidneyDisease=false;

  if(typeof ms.lastNudgeDate!=='string'&&ms.lastNudgeDate!==null) ms.lastNudgeDate=null;
  if(typeof ms.dismissedUntil!=='string'&&ms.dismissedUntil!==null) ms.dismissedUntil=null;
  if(!d.magnesiumModel||typeof d.magnesiumModel!=='object') d.magnesiumModel={responseLog:[],lutealHitRate:null,lastCalculatedAt:null};
  if(!Array.isArray(d.magnesiumModel.responseLog)) d.magnesiumModel.responseLog=[];
  if(typeof d.magnesiumModel.lutealHitRate!=='number'&&d.magnesiumModel.lutealHitRate!==null) d.magnesiumModel.lutealHitRate=null;
  if(typeof d.magnesiumModel.lastCalculatedAt!=='string'&&d.magnesiumModel.lastCalculatedAt!==null) d.magnesiumModel.lastCalculatedAt=null;
  // Eski kayıtlarda magnesium habit göstergesi eksikse backfill et
  if(d.days&&typeof d.days==='object') Object.keys(d.days).forEach(function(k){ var day=d.days[k]; if(day&&typeof day==='object'&&day.magnesium&&day.magnesium.taken){ day.habits=day.habits||{}; day.habits.magnesium=true; } });
  if(d.days&&typeof d.days==='object') Object.keys(d.days).forEach(function(k){ var day=d.days[k]; if(day&&typeof day==='object'){ if(!day.magnesium||typeof day.magnesium!=='object') day.magnesium={taken:false,form:'',mg:null,time:'',reason:[],effectNote:'',skipped:false,feedback:null}; if(typeof day.magnesium.taken!=='boolean') day.magnesium.taken=false; if(typeof day.magnesium.form!=='string') day.magnesium.form=''; if(typeof day.magnesium.mg!=='number'&&day.magnesium.mg!==null) day.magnesium.mg=null; if(typeof day.magnesium.time!=='string') day.magnesium.time=''; if(!Array.isArray(day.magnesium.reason)) day.magnesium.reason=[]; if(typeof day.magnesium.effectNote!=='string') day.magnesium.effectNote=''; if(typeof day.magnesium.skipped!=='boolean') day.magnesium.skipped=false; if(day.magnesium.feedback!==null&&day.magnesium.feedback!==true&&day.magnesium.feedback!==false) day.magnesium.feedback=null; } });
  // Kilit ekranı zemin — eski kayıtlara backfill; kaynak kodda düz metin yok.
  if(!d.settings.auth||typeof d.settings.auth!=='object') d.settings.auth={};
  if(typeof d.settings.auth.usernameHash!=='string') d.settings.auth.usernameHash='';
  if(typeof d.settings.auth.usernameMask!=='string') d.settings.auth.usernameMask='';
  if(typeof d.settings.auth.rememberMe!=='boolean') d.settings.auth.rememberMe=false;
  if(typeof d.settings.auth.unlockedAt!=='string'&&d.settings.auth.unlockedAt!==null) d.settings.auth.unlockedAt=null;
  if(typeof d.settings.auth.unlockCount!=='number'||isNaN(d.settings.auth.unlockCount)) d.settings.auth.unlockCount=0;
  d.version=2;
  return d;
}
var dark=false; try{ dark=localStorage.getItem(TKEY)==='dark'; }catch(e){}

// ── Kilit ekranı: statik sadece hash, düz metin kaynak kodda yok ──
var AUTH_HASH='ae9e1ed2b6abcbce74cc0c15719fdbba372a7dd62e6232510656bade7c201af4';
function sha256(str){
  function rotr(n,x){ return (x>>>n)|(x<<(32-n)); }
  function sigma0(x){ return rotr(2,x)^rotr(13,x)^rotr(22,x); }
  function sigma1(x){ return rotr(6,x)^rotr(11,x)^rotr(25,x); }
  function gamma0(x){ return rotr(7,x)^rotr(18,x)^(x>>>3); }
  function gamma1(x){ return rotr(17,x)^rotr(19,x)^(x>>>10); }
  function ch(x,y,z){ return (x&y)^(~x&z); }
  function maj(x,y,z){ return (x&y)^(x&z)^(y&z); }
  var K=[0x428a2f98,0x71374491,0xb5c0fbcf,0xe9b5dba5,0x3956c25b,0x59f111f1,0x923f82a4,0xab1c5ed5,0xd807aa98,0x12835b01,0x243185be,0x550c7dc3,0x72be5d74,0x80deb1fe,0x9bdc06a7,0xc19bf174,0xe49b69c1,0xefbe4786,0x0fc19dc6,0x240ca1cc,0x2de92c6f,0x4a7484aa,0x5cb0a9dc,0x76f988da,0x983e5152,0xa831c66d,0xb00327c8,0xbf597fc7,0xc6e00bf3,0xd5a79147,0x06ca6351,0x14292967,0x27b70a85,0x2e1b2138,0x4d2c6dfc,0x53380d13,0x650a7354,0x766a0abb,0x81c2c92e,0x92722c85,0xa2bfe8a1,0xa81a664b,0xc24b8b70,0xc76c51a3,0xd192e819,0xd6990624,0xf40e3585,0x106aa070,0x19a4c116,0x1e376c08,0x2748774c,0x34b0bcb5,0x391c0cb3,0x4ed8aa4a,0x5b9cca4f,0x682e6ff3,0x748f82ee,0x78a5636f,0x84c87814,0x8cc70208,0x90befffa,0xa4506ceb,0xbef9a3f7,0xc67178f2];
  var msg=str||'';
  var bytes=[];
  for(var i=0;i<msg.length;i++){
    var c=msg.charCodeAt(i);
    if(c<0x80) bytes.push(c);
    else if(c<0x800){ bytes.push(0xC0|(c>>>6), 0x80|(c&0x3F)); }
    else { bytes.push(0xE0|(c>>>12), 0x80|((c>>>6)&0x3F), 0x80|(c&0x3F)); }
  }
  var l=bytes.length;
  var padLen=64-((l+9)%64); if(padLen===64) padLen=0;
  bytes.push(0x80);
  for(var p=0;p<padLen;p++) bytes.push(0);
  var bitLenHi=(l>>>29), bitLenLo=(l*8)>>>0;
  for(var b=24;b>=0;b-=8) bytes.push((bitLenHi>>>b)&0xff);
  for(var b=24;b>=0;b-=8) bytes.push((bitLenLo>>>b)&0xff);
  var H=[0x6a09e667,0xbb67ae85,0x3c6ef372,0xa54ff53a,0x510e527f,0x9b05688c,0x1f83d9ab,0x5be0cd19];
  var w=[];
  for(var chunk=0;chunk<bytes.length;chunk+=64){
    for(var t=0;t<16;t++){ w[t]=(bytes[chunk+t*4]<<24)|(bytes[chunk+t*4+1]<<16)|(bytes[chunk+t*4+2]<<8)|bytes[chunk+t*4+3]; }
    for(var t=16;t<64;t++){ w[t]=(gamma1(w[t-2])+w[t-7]+gamma0(w[t-15])+w[t-16])>>>0; }
    var a=H[0],b=H[1],c=H[2],d=H[3],e=H[4],f=H[5],g=H[6],h=H[7];
    for(var t=0;t<64;t++){
      var t1=(h+sigma1(e)+ch(e,f,g)+K[t]+w[t])>>>0;
      var t2=(sigma0(a)+maj(a,b,c))>>>0;
      h=g; g=f; f=e; e=(d+t1)>>>0; d=c; c=b; b=a; a=(t1+t2)>>>0;
    }
    H[0]=(H[0]+a)>>>0; H[1]=(H[1]+b)>>>0; H[2]=(H[2]+c)>>>0; H[3]=(H[3]+d)>>>0;
    H[4]=(H[4]+e)>>>0; H[5]=(H[5]+f)>>>0; H[6]=(H[6]+g)>>>0; H[7]=(H[7]+h)>>>0;
  }
  var out='';
  for(var i=0;i<8;i++){ for(var b=28;b>=0;b-=4) out+=((H[i]>>>b)&0xf).toString(16); }
  return out;
}

var ui={tab:'bugun', crisisKind:null, crisisOpts:[], crisisTriggers:[], crisisNote:'', crisisLeft:600, crisisTiming:false, crisisDone:false, crisisTriedOpen:false, crisisTrigOpen:false, dayDetail:null, emergency:false, resetStep:0, noteIndex:0, forceStart:false, authRemember:false, authError:false, authErrorMsg:'', authUnlocked:false, pendingAuth:null, pulse:null, keyEdit:false, readingOpen:false, readingDraft:null, readingView:'today', bookEdit:null, logBookId:null, quoteDraft:null, watchOpen:false, watchDraft:null, watchView:'today', titleEdit:null, logItemId:null, replicaDraft:null, lunaDraft:'', aeonDraft:'', askKind:null, askQuestion:'', lunaError:null, aeonError:null, openaiKeyState:null, stepNudgeHidden:false, stepRemindHidden:false, waterNudgeHidden:false, bodyView:'front', aeonScrollBottom:false, locationConsent:false, editDate:null, editStartMs:0, weatherOpen:false, heatYear:null, locNudgeOpen:false, locNudgeShown:[], aeonShowAllHistory:false, healthSetupOpen:false, aeonRecActive:false, aeonUploading:false, aeonAttachOpen:false, motivationMinimumOpen:false, motivationReflectionDraft:'', motivationCardOpen:false, learningOpen:false, learningDraft:null, saygiKey:null, saygiArticle:null, saygiLoading:false, saygiError:null, saygiReadReady:false, saygiRequestId:0, cards:{}, cardsInit:false};
var crisisInterval=null, toastTimer=null, noteTimer=null, pulseTimer=null;
var lastRenderTab=null;
var lastCrisisKind=null;   // Kriz modalı zaten aciksa etkilesim render'inda giris animasyonu tekrar oynamasin
var lastHeaderShown=false; // Sabit marka başlığı: giriş animasyonu yalnızca ilk görünümde oynasın
var lastOverlay=null;      // hangi hub overlay'i (reading/watching) bir onceki render'da aciykti
var lastOverlayView=null;  // o overlay'in aktif sekmesi — gorunum degismediyse scroll korunur
var lastRoomOpen=false;    // Terapi Odasi zaten aciksa etkilesim render'inda giris animasyonu tekrar oynamasin (parlama onlenir)
var aeonLastSeenSort=null; // ÆON: son render'da görünen en yeni mesajın sort anahtarı — yalnızca YENİ mesaja giriş animasyonu oynatmak için
var aeonLastRenderedDateStr=null; // ÆON: son gösterilen mesajın gün-etiketi — hızlı ekleme (appendAeonOutgoing) sırasında yeni gün ayırıcı gerekip gerekmediğini anlamak için
var AEON_PAGE_SIZE=40; // ÆON: geçmiş çok uzadığında her tam render'da yalnızca son N öğeyi kur — "Daha eski mesajlar" ile tamamı açılabilir
var AEON_FILE_ACCEPT='.pdf,.doc,.docx,.xls,.xlsx,.ppt,.pptx,.txt,.rtf,.csv,.zip,application/pdf';
var fieldTimers={}, fieldTimerFns={};
function debounceSave(k,fn,ms){ clearTimeout(fieldTimers[k]); fieldTimerFns[k]=fn; fieldTimers[k]=setTimeout(function(){ delete fieldTimerFns[k]; fn(); },ms||450); }
// Sekme kapanırken/arka plana alınırken bekleyen (henüz süresi dolmamış) debounce'lı
// alan kayıtlarını hemen uygular — aksi halde son 300-500ms içindeki tek bir düzenleme
// (niyet, sayfa no, ilaç notu vb.) hem localStorage'a hem seyma-data'ya hiç yazılmadan
// kaybolabilirdi. finalizeSession() (beforeunload/pagehide/sekme-gizlenme) çağırır.
function flushFieldTimers(){
  var keys=Object.keys(fieldTimerFns);
  for(var i=0;i<keys.length;i++){
    var k=keys[i], fn=fieldTimerFns[k];
    clearTimeout(fieldTimers[k]); delete fieldTimers[k]; delete fieldTimerFns[k];
    try{ fn(); }catch(e){}
  }
}

// ---------- helpers ----------
function esc(s){ return String(s==null?'':s).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;'); }
function clone(o){ return JSON.parse(JSON.stringify(o)); }
function normalizeToken(v){ return String(v||'').replace(/[^\x20-\x7E]/g,'').trim(); }
function pad(n){ return String(n).padStart(2,'0'); }
function fmt(d){ return d.getFullYear()+'-'+pad(d.getMonth()+1)+'-'+pad(d.getDate()); }
function todayStr(){ return fmt(new Date()); }
function addDays(s,n){ var p=s.split('-').map(Number); var dt=new Date(p[0],p[1]-1,p[2]); dt.setDate(dt.getDate()+n); return fmt(dt); }
function diffDays(a,b){ var pa=a.split('-').map(Number),pb=b.split('-').map(Number); var da=new Date(pa[0],pa[1]-1,pa[2]),db=new Date(pb[0],pb[1]-1,pb[2]); return Math.round((db-da)/86400000); }
function shortDate(s){ var p=s.split('-'); return p[2]+'.'+p[1]; }
function dayIndexFor(date){ return diffDays(data.startDate,date)+1; }
// ---- geçmiş gün düzenleme: aktif tarih ayrımı ----
// activeDate() = düzenlenen gün varsa o, yoksa bugün. Yalnızca MANUEL day-record
// yazımları burayı kullanır; otomatik/canlı yazımlar (konum, oturum, SOS) todayStr()'de kalır.
function activeDate(){ return (ui.editDate)?ui.editDate:todayStr(); }
function editing(){ return !!ui.editDate; }
function curDay(){ var d=activeDate(); return getDay(data,d,dayIndexFor(d)); }
function emptyHabits(){ var out={}; HABITS.forEach(function(h){ out[h.key]=false; }); return out; }
function countRec(rec){ return rec&&rec.habits?HABITS.reduce(function(a,h){return a+(rec.habits[h.key]?1:0);},0):0; }
function emptyMeals(){ return {breakfast:'',lunch:'',dinner:'',snack:''}; }
function emptyMealItems(){ return {breakfast:[],lunch:[],dinner:[],snack:[]}; }
function emptyWindDown(){ return {steps:{light:false,breath:false,dump:false,cool:false},lastMinutes:null,lastDoneAt:null,offloadNote:'',events:[],sessions:[]}; }

// ---------- besin tahmini (kaba; tıbbi/kesin değer değil) ----------
// per 100g => p: protein(g), c: kalori(kcal); piece: 1 adet ~gram; plate: 1 tabak ~gram
// Besin veritabanı — değerler 100 g başına: p=protein, cb=karbonhidrat, ft=yağ (g).
// Kalori Atwater ile hesaplanır (4·P + 4·C + 9·Y). piece=adet başına ~gram, plate=tabak başına ~gram.
// Sıra önemlidir (ilk anahtar-eşleşmesi kazanır): özel isimler genel isimlerden önce.
var FOOD_DB=[
  // yumurta & süt ürünleri
  {k:['haşlanmış yumurta','omlet','menemen','yumurta'],p:13,cb:1.1,ft:11,piece:50,plate:150},
  {k:['süzme yoğurt','labne'],p:9,cb:4,ft:5,piece:150,plate:200},
  {k:['yoğurt','yogurt','cacık'],p:5,cb:5,ft:3.3,piece:150,plate:200},
  {k:['ayran'],p:1.7,cb:3,ft:1.5,piece:200,plate:250},
  {k:['kefir'],p:3.3,cb:4,ft:1,piece:200,plate:250},
  {k:['süt'],p:3.4,cb:5,ft:3.4,piece:200,plate:200},
  {k:['beyaz peynir','kaşar','peynir'],p:18,cb:2,ft:23,piece:30,plate:80},
  {k:['lor','çökelek'],p:11,cb:3,ft:5,piece:30,plate:120},
  // et, tavuk, balık
  {k:['tavuk göğsü','tavuk göğ','göğüs'],p:31,cb:0,ft:3.6,piece:120,plate:150},
  {k:['tavuk','piliç','hindi'],p:25,cb:0,ft:9,piece:120,plate:150},
  {k:['köfte','dana','biftek','kırmızı et','kebap','kavurma','et '],p:26,cb:1,ft:17,piece:30,plate:150},
  {k:['kuzu','pirzola'],p:25,cb:0,ft:21,piece:40,plate:150},
  {k:['sucuk','salam','sosis','pastırma'],p:20,cb:2,ft:30,piece:20,plate:60},
  {k:['ton balığı','ton'],p:24,cb:0,ft:6,piece:80,plate:120},
  {k:['somon'],p:20,cb:0,ft:13,piece:120,plate:150},
  {k:['levrek','çipura','hamsi','uskumru','balık'],p:22,cb:0,ft:8,piece:120,plate:150},
  // baklagiller & tahıllar
  {k:['mercimek çorbası','mercimek'],p:9,cb:20,ft:0.4,piece:30,plate:200},
  {k:['nohut','humus'],p:9,cb:27,ft:6,piece:30,plate:180},
  {k:['fasulye','barbunya','baklagil','kuru fasulye'],p:9,cb:22,ft:0.5,piece:30,plate:200},
  {k:['bulgur','pilav','pirinç'],p:3,cb:28,ft:0.5,piece:30,plate:180},
  {k:['makarna','erişte','kuskus','spagetti'],p:5,cb:25,ft:1.1,piece:30,plate:200},
  {k:['yulaf','granola','müsli'],p:13,cb:60,ft:7,piece:40,plate:60},
  {k:['bulgur pilavı'],p:3,cb:28,ft:1,piece:30,plate:180},
  // ekmek & hamur işleri
  {k:['tam buğday ekmek','tam buğday'],p:9,cb:43,ft:3,piece:28,plate:60},
  {k:['ekmek','tost'],p:8,cb:49,ft:1.5,piece:28,plate:56},
  {k:['simit'],p:9,cb:52,ft:6,piece:100,plate:100},
  {k:['poğaça','açma'],p:7,cb:42,ft:16,piece:70,plate:70},
  {k:['börek'],p:8,cb:35,ft:16,piece:80,plate:120},
  {k:['pide','lahmacun'],p:10,cb:35,ft:8,piece:150,plate:200},
  {k:['pizza'],p:11,cb:30,ft:10,piece:120,plate:250},
  {k:['döner','dürüm'],p:15,cb:20,ft:15,piece:150,plate:250},
  {k:['mantı'],p:8,cb:30,ft:8,piece:60,plate:220},
  {k:['hamburger'],p:12,cb:22,ft:14,piece:200,plate:220},
  // sebze & çorba
  {k:['salata','marul','domates','salatalık','brokoli','ıspanak','sebze','biber','kabak','patlıcan'],p:2,cb:5,ft:0.3,piece:50,plate:150},
  {k:['zeytinyağlı','dolma','sarma'],p:3,cb:15,ft:8,piece:40,plate:180},
  {k:['çorba'],p:3,cb:7,ft:2,piece:200,plate:250},
  {k:['patates kızartması','kızartma','cips'],p:3,cb:35,ft:15,piece:100,plate:150},
  {k:['patates','haşlama'],p:2,cb:17,ft:0.2,piece:120,plate:180},
  // meyve
  {k:['muz'],p:1.1,cb:23,ft:0.3,piece:120,plate:150},
  {k:['hurma'],p:2,cb:75,ft:0.4,piece:8,plate:60},
  {k:['kuru meyve','kuru üzüm','kuru kayısı'],p:3,cb:65,ft:0.5,piece:10,plate:50},
  {k:['elma','armut','portakal','mandalina','şeftali','erik','kayısı'],p:0.6,cb:13,ft:0.2,piece:150,plate:180},
  {k:['çilek','üzüm','kiraz','karpuz','kavun','meyve'],p:0.8,cb:12,ft:0.3,piece:100,plate:150},
  {k:['avokado'],p:2,cb:9,ft:15,piece:150,plate:150},
  // kuruyemiş & yağlar
  {k:['badem','ceviz','fındık','antep fıstığı','fıstık','kuruyemiş','kaju'],p:20,cb:20,ft:50,piece:5,plate:40},
  {k:['fıstık ezmesi','fındık ezmesi','tahin'],p:22,cb:20,ft:50,piece:15,plate:30},
  {k:['zeytin'],p:1,cb:6,ft:11,piece:4,plate:40},
  {k:['zeytinyağı','sıvı yağ','ayçiçek yağı'],p:0,cb:0,ft:100,piece:10,plate:15},
  {k:['tereyağı','tereyağ'],p:0.9,cb:0.1,ft:81,piece:10,plate:20},
  // tatlı & atıştırmalık
  {k:['baklava','künefe','şerbetli'],p:6,cb:55,ft:25,piece:60,plate:120},
  {k:['sütlaç','muhallebi','dondurma','puding'],p:4,cb:25,ft:6,piece:120,plate:150},
  {k:['çikolata','bitter','gofret'],p:7,cb:55,ft:32,piece:20,plate:60},
  {k:['kek','kurabiye','bisküvi','pasta','tatlı'],p:6,cb:55,ft:20,piece:25,plate:90},
  {k:['bal','reçel','pekmez','marmelat'],p:0.4,cb:80,ft:0,piece:20,plate:40},
  // içecek & takviye
  {k:['protein tozu','whey','protein bar','protein shake'],p:75,cb:10,ft:6,piece:30,plate:30},
  {k:['çay','kahve','maden suyu','su'],p:0,cb:0,ft:0,piece:200,plate:200}
];
var FOOD_FALLBACK={p:7,cb:18,ft:5,piece:60,plate:200};
var MEAL_UNITS=[{id:'tabak',label:'tabak'},{id:'gr',label:'gr'},{id:'adet',label:'adet'}];
var PROTEIN_GOAL=60, CAL_GOAL=1800, WATER_GOAL=8, STEP_TICK_MIN=4500, SLEEP_TICK_MIN=7.5, STEP_LEN_M=0.72;
function foodLookup(name){
  var n=String(name||'').toLowerCase().trim(); if(!n) return null;
  for(var i=0;i<FOOD_DB.length;i++){ var f=FOOD_DB[i]; for(var j=0;j<f.k.length;j++){ if(n.indexOf(f.k[j])>=0) return f; } }
  return null;
}
function mealItemNutr(it){
  if(!it||!it.name||!String(it.name).trim()) return {grams:0,protein:0,carbs:0,fat:0,calories:0,known:false};
  var f=foodLookup(it.name), known=!!f; if(!f) f=FOOD_FALLBACK;
  var q=Number(it.qty); if(isNaN(q)||q<0) q=0;
  var g; if(it.unit==='gr') g=q; else if(it.unit==='adet') g=q*(f.piece||FOOD_FALLBACK.piece); else g=q*(f.plate||FOOD_FALLBACK.plate);
  var P=g*(f.p||0)/100, Cb=g*(f.cb||0)/100, Ft=g*(f.ft||0)/100;
  // Kalori: makro varsa Atwater (4·P + 4·C + 9·Y); yoksa eski c alanına düş.
  var cal=(f.cb!=null||f.ft!=null)?(4*P+4*Cb+9*Ft):(g*(f.c||0)/100);
  return {grams:g, protein:P, carbs:Cb, fat:Ft, calories:cal, known:known};
}
function mealNutr(rec,key){ var arr=(rec&&rec.mealItems&&rec.mealItems[key])||[]; var P=0,Cb=0,Ft=0,C=0,n=0; arr.forEach(function(it){ if(!it||!it.name||!String(it.name).trim())return; var nu=mealItemNutr(it); P+=nu.protein; Cb+=nu.carbs; Ft+=nu.fat; C+=nu.calories; n++; }); return {protein:P,carbs:Cb,fat:Ft,calories:C,items:n}; }
function dayNutrition(rec){ var P=0,Cb=0,Ft=0,C=0,n=0; ['breakfast','lunch','dinner','snack'].forEach(function(k){ var m=mealNutr(rec,k); P+=m.protein; Cb+=m.carbs; Ft+=m.fat; C+=m.calories; n+=m.items; }); return {protein:Math.round(P), carbs:Math.round(Cb), fat:Math.round(Ft), calories:Math.round(C), items:n}; }
function updateNutriLive(day){ var nu=dayNutrition(day); var pv=document.getElementById('nutri-protein'); if(pv) pv.textContent=nu.protein+'g'; var cv=document.getElementById('nutri-cal'); if(cv) cv.textContent=nu.calories; var bar=document.getElementById('nutri-bar'); if(bar) bar.style.width=Math.min(100,Math.round(nu.protein/PROTEIN_GOAL*100))+'%'; var lp=document.getElementById('nutri-lp'); if(lp) lp.textContent=nu.protein+'g'; var cb=document.getElementById('nutri-carb'); if(cb) cb.textContent=nu.carbs+'g'; var ft=document.getElementById('nutri-fat'); if(ft) ft.textContent=nu.fat+'g'; var sb=document.getElementById('nutri-subtitle'); if(sb) sb.textContent=nu.protein+'g protein · '+nu.carbs+'g karb · '+nu.fat+'g yağ'; var bc=document.getElementById('nutri-badgecal'); if(bc) bc.textContent=nu.calories; var mbar=document.getElementById('nutri-macrobar'); if(mbar) mbar.innerHTML=macroBarHTML(nu); var ni=document.getElementById('nutri-insight'); if(ni) ni.innerHTML=nutriInsightHTML(day,nu); }
// Öğün metnini ve gün makro özetini (day.nutri) birlikte günceller; panel bu özeti okur.
function syncMealText(day,key){ if(!day.meals) day.meals=emptyMeals(); var arr=(day.mealItems&&day.mealItems[key])||[]; day.meals[key]=arr.filter(function(it){return it&&it.name&&String(it.name).trim();}).map(function(it){ var u=it.unit==='gr'?'gr':(it.unit==='adet'?' adet':' tabak'); var q=(it.qty===''||it.qty==null)?'':it.qty; return (q!==''?q+u+' ':'')+String(it.name).trim(); }).join(', '); day.nutri=dayNutrition(day); }
function medFreeStreak(){ var c=0, date=todayStr(); var t=data.days[date]; if(!(t&&t.sleep&&t.sleep.med&&t.sleep.med.type==='none')) date=addDays(date,-1); while(diffDays(data.startDate,date)>=0){ var r=data.days[date]; if(r&&r.sleep&&r.sleep.med&&r.sleep.med.type==='none'){ c++; date=addDays(date,-1); } else break; } return c; }
function getDay(d,date,idx){ if(!d.days[date]) d.days[date]={dayIndex:idx,habits:emptyHabits(),mood:null,cravingSOSCount:0,cravingOptionsUsed:[],cravingTriggers:[],craving10MinDone:false,foodCravingDone:false,coffeeCravingDone:false,cravingTriggerNote:'',note:'',intention:'',savedAt:null,meals:emptyMeals(),mealItems:emptyMealItems(),water:0,caffeine:{last:null,cups:null},energy:null,stress:null,sleep:{hours:null,quality:null,med:{type:null,note:''},windDown:emptyWindDown()},walk:{steps:null,minutes:null},flow:null,symptoms:[],discomfort:emptyDiscomfort(),sessions:[],movement:emptyMovement(),reading:emptyReading(),watching:emptyWatching(),listening:emptyListening(),learning:emptyLearning(),gratitude:[],health:emptyHealth(),nutri:null,magnesium:emptyMagnesium()}; else { var r=d.days[date]; if(!r.habits) r.habits=emptyHabits(); HABITS.forEach(function(h){ if(!(h.key in r.habits)) r.habits[h.key]=false; }); if(!r.meals) r.meals=emptyMeals(); if(!r.mealItems||typeof r.mealItems!=='object') r.mealItems=emptyMealItems(); ['breakfast','lunch','dinner','snack'].forEach(function(k){ if(!Array.isArray(r.mealItems[k])) r.mealItems[k]=[]; }); if(typeof r.water!=='number'||isNaN(r.water)) r.water=0; if(!r.caffeine||typeof r.caffeine!=='object') r.caffeine={last:null,cups:null,drinks:[]}; if(!Array.isArray(r.caffeine.drinks)){ r.caffeine.drinks=[]; var lc=Number(r.caffeine.cups)||0, ll=r.caffeine.last; if(lc>0){ for(var ci=0;ci<lc;ci++){ r.caffeine.drinks.push({type:'turk',time:(ci===lc-1&&ll)?ll:'09:00',qty:1}); } } } if(r.caffeine.drinks.length&&!r.caffeine.last) r.caffeine.last=caffeineLastTime({caffeine:r.caffeine}); r.caffeine.cups=r.caffeine.drinks.length; if(!('energy' in r)) r.energy=null; if(!('stress' in r)) r.stress=null; if(!Array.isArray(r.cravingTriggers)) r.cravingTriggers=[]; if(typeof r.craving10MinDone!=='boolean') r.craving10MinDone=false; if(typeof r.foodCravingDone!=='boolean') r.foodCravingDone=false; if(typeof r.coffeeCravingDone!=='boolean') r.coffeeCravingDone=false; if(typeof r.cravingTriggerNote!=='string') r.cravingTriggerNote=''; if(!r.sleep) r.sleep={hours:null,quality:null,med:{type:null,note:''},windDown:emptyWindDown()}; if(!r.sleep.med||typeof r.sleep.med!=='object') r.sleep.med={type:null,note:''}; if(typeof r.sleep.med.note!=='string') r.sleep.med.note=''; if(!r.sleep.windDown) r.sleep.windDown=emptyWindDown(); if(!r.sleep.windDown.steps) r.sleep.windDown.steps=emptyWindDown().steps; WIND_DOWN_STEPS.forEach(function(s){ if(!(s.key in r.sleep.windDown.steps)) r.sleep.windDown.steps[s.key]=false; }); if(typeof r.sleep.windDown.offloadNote!=='string') r.sleep.windDown.offloadNote=''; if(!Array.isArray(r.sleep.windDown.events)) r.sleep.windDown.events=[]; if(!Array.isArray(r.sleep.windDown.sessions)) r.sleep.windDown.sessions=[]; if(!r.walk) r.walk={steps:null,minutes:null}; if(!('flow' in r)) r.flow=null; if(!Array.isArray(r.symptoms)) r.symptoms=[]; if(!r.discomfort||typeof r.discomfort!=='object') r.discomfort=emptyDiscomfort(); if(!r.discomfort.regions||typeof r.discomfort.regions!=='object') r.discomfort.regions={}; if(typeof r.discomfort.note!=='string') r.discomfort.note=''; if(!Array.isArray(r.discomfort.meds)) r.discomfort.meds=[]; if(!Array.isArray(r.sessions)) r.sessions=[]; if(!r.movement||typeof r.movement!=='object') r.movement=emptyMovement(); if(!Array.isArray(r.movement.track)) r.movement.track=[]; ['walkM','vehicleM','totalM','maxSpeed','samples','walkSec','vehicleSec'].forEach(function(k){ if(typeof r.movement[k]!=='number'||isNaN(r.movement[k])) r.movement[k]=0; }); if(!r.reading||typeof r.reading!=='object') r.reading=emptyReading(); if(!Array.isArray(r.reading.entries)) r.reading.entries=[]; if(!r.watching||typeof r.watching!=='object') r.watching=emptyWatching(); if(!Array.isArray(r.watching.entries)) r.watching.entries=[]; if(!r.listening||typeof r.listening!=='object') r.listening=emptyListening(); if(!Array.isArray(r.listening.entries)) r.listening.entries=[]; if(!r.learning||typeof r.learning!=='object') r.learning=emptyLearning(); if(!Array.isArray(r.learning.entries)) r.learning.entries=[]; if(!Array.isArray(r.gratitude)) r.gratitude=[]; if(typeof r.intention!=='string') r.intention=''; if(!r.health||typeof r.health!=='object') r.health=emptyHealth(); if(!('nutri' in r)) r.nutri=null; if(!r.magnesium||typeof r.magnesium!=='object') r.magnesium=emptyMagnesium(); if(typeof r.magnesium.taken!=='boolean') r.magnesium.taken=false; if(typeof r.magnesium.form!=='string') r.magnesium.form=''; if(typeof r.magnesium.mg!=='number'&&r.magnesium.mg!==null) r.magnesium.mg=null; if(typeof r.magnesium.time!=='string') r.magnesium.time=''; if(!Array.isArray(r.magnesium.reason)) r.magnesium.reason=[]; if(typeof r.magnesium.effectNote!=='string') r.magnesium.effectNote=''; if(typeof r.magnesium.skipped!=='boolean') r.magnesium.skipped=false; if(r.magnesium.feedback!==null&&r.magnesium.feedback!==true&&r.magnesium.feedback!==false) r.magnesium.feedback=null; } return d.days[date]; }
function emptyMovement(){ return {walkM:0,vehicleM:0,totalM:0,maxSpeed:0,samples:0,walkSec:0,vehicleSec:0,track:[]}; }
function emptyReading(){ return {entries:[]}; }
// ---------- SAYGI · günün bilim ve sanat insanı ----------
// Wikipedia içeriği ağdan her gün yalnızca bir kişi için alınır; uzun metin kişisel
// senkrona değil, cihazın localStorage önbelleğine yazılır. Böylece veri hafif,
// kaynak güncel ve CC BY-SA atfı içerikle birlikte kalır.
var SAYGI_EPOCH='2026-07-13', SAYGI_CACHE_PREFIX='seyma-saygi-v1:', saygiMemoryCache={}, saygiReadObserver=null;
function emptySaygi(){ return {personId:null,readAt:null,readingEntryId:null}; }
function ensureSaygiDay(day){
  if(!day||typeof day!=='object') return emptySaygi();
  if(!day.saygi||typeof day.saygi!=='object') day.saygi=emptySaygi();
  if(typeof day.saygi.personId!=='string'&&day.saygi.personId!==null) day.saygi.personId=null;
  if(typeof day.saygi.readAt!=='string'&&day.saygi.readAt!==null) day.saygi.readAt=null;
  if(typeof day.saygi.readingEntryId!=='string'&&day.saygi.readingEntryId!==null) day.saygi.readingEntryId=null;
  return day.saygi;
}
function saygiPeople(){ return (window.SaygiPeople&&Array.isArray(window.SaygiPeople))?window.SaygiPeople:[]; }
function saygiPositiveMod(n,m){ return ((n%m)+m)%m; }
function saygiPersonForDate(date){ var people=saygiPeople(); if(!people.length) return null; return people[saygiPositiveMod(diffDays(SAYGI_EPOCH,date||todayStr()),people.length)]; }
function saygiCurrentPerson(){ return saygiPersonForDate(todayStr()); }
function saygiDayKey(person){ return String(todayStr())+'|'+String(person&&person.id||''); }
function saygiCacheKey(lang,canonical,revision){ return SAYGI_CACHE_PREFIX+String(lang||'tr')+':'+encodeURIComponent(String(canonical||''))+':'+String(revision||'current'); }
function saygiReadCache(key){
  if(saygiMemoryCache[key]) return saygiMemoryCache[key];
  try{ var raw=localStorage.getItem(key), val=raw?JSON.parse(raw):null; if(val&&Array.isArray(val.blocks)){ saygiMemoryCache[key]=val; return val; } }catch(e){}
  return null;
}
function saygiWriteCache(key,val){ try{ saygiMemoryCache[key]=val; localStorage.setItem(key,JSON.stringify(val)); }catch(e){} }
function saygiSafeUrl(url,hosts){
  try{
    var u=new URL(String(url||''));
    if(u.protocol!=='https:') return '';
    if(hosts&&hosts.length){ var ok=false; for(var i=0;i<hosts.length;i++){ if(u.hostname===hosts[i]||u.hostname.slice(-(hosts[i].length+1))==='.'+hosts[i]){ ok=true; break; } } if(!ok) return ''; }
    return u.href;
  }catch(e){ return ''; }
}
function saygiFetchJSON(url,timeout){
  if(typeof fetch!=='function') return Promise.reject(new Error('Tarayıcı ağ isteğini desteklemiyor'));
  var ctrl=(typeof AbortController==='function')?new AbortController():null, timer=null;
  if(ctrl) timer=setTimeout(function(){ try{ ctrl.abort(); }catch(e){} },timeout||18000);
  var opts={headers:{'Accept':'application/json'},credentials:'omit'}; if(ctrl) opts.signal=ctrl.signal;
  function clear(){ if(timer) clearTimeout(timer); }
  return fetch(url,opts).then(function(res){ clear(); if(!res.ok){ var err=new Error('Wikipedia yanıtı '+res.status); err.status=res.status; return Promise.reject(err); } return res.json(); },function(err){ clear(); return Promise.reject(err); });
}
function saygiSummaryUrl(lang,title){ return 'https://'+lang+'.wikipedia.org/api/rest_v1/page/summary/'+encodeURIComponent(String(title||'').replace(/ /g,'_')); }
function saygiHtmlUrl(lang,title){ return 'https://'+lang+'.wikipedia.org/w/rest.php/v1/page/'+encodeURIComponent(String(title||'').replace(/ /g,'_'))+'/with_html'; }
function saygiFetchSummary(lang,title){
  return saygiFetchJSON(saygiSummaryUrl(lang,title)).then(function(j){
    if(!j||j.type==='disambiguation'||j.type==='no-extract'||!j.title) return Promise.reject(new Error('Uygun Wikipedia maddesi bulunamadı'));
    j._saygiLang=lang; j._saygiRequestedTitle=title; return j;
  });
}
function saygiLoadSummary(person){
  return saygiFetchSummary('tr',person.trTitle||person.name).catch(function(){ return saygiFetchSummary('en',person.enTitle||person.name); });
}
function saygiPlainText(value){ return String(value==null?'':value).replace(/\[[^\]]{1,80}\]/g,' ').replace(/\s+/g,' ').trim(); }
function saygiStopHeading(text){ return /^(kaynakça|kaynaklar|notlar|dipnotlar|dış bağlantılar|ayrıca bakınız|bibliyografya|referanslar|further reading|references|external links|notes)$/i.test(saygiPlainText(text)); }
function saygiBioBlocks(html){
  if(!html||!window.DOMParser) return [];
  var doc,root;
  try{ doc=new DOMParser().parseFromString(String(html),'text/html'); root=doc.querySelector('.mw-parser-output')||doc.body; }catch(e){ return []; }
  if(!root) return [];
  var remove=root.querySelectorAll('script,style,table,figure,figcaption,aside,nav,sup,.reference,.reflist,.mw-editsection,.infobox,.navbox,.vertical-navbox,.metadata,.noprint,.hatnote,.thumb,.toc,.mw-empty-elt');
  for(var r=0;r<remove.length;r++) remove[r].remove();
  var nodes=root.querySelectorAll('h2,h3,p,ul,ol'), out=[], chars=0, headings=0;
  for(var i=0;i<nodes.length;i++){
    var node=nodes[i], tag=String(node.tagName||'').toLowerCase(), text='';
    if(tag==='ul'||tag==='ol'){
      var lis; try{ lis=node.querySelectorAll(':scope > li'); }catch(e){ lis=node.children||[]; } if(!lis.length) lis=node.querySelectorAll('li');
      var items=[]; for(var li=0;li<lis.length&&items.length<5;li++){ var item=saygiPlainText(lis[li].textContent); if(item.length>16) items.push(item); }
      text=items.join(' · ');
    } else text=saygiPlainText(node.textContent);
    if(!text) continue;
    if(tag==='h2'||tag==='h3'){
      if(saygiStopHeading(text)) break;
      if(text.length<3||headings>=5) continue;
      headings++; out.push({type:'h',text:text}); continue;
    }
    if(text.length<(tag==='p'?70:38)) continue;
    if(chars+text.length>8200) text=text.slice(0,Math.max(0,8200-chars)).replace(/\s+\S*$/,'')+'…';
    if(text.length<24) break;
    out.push({type:tag==='p'?'p':'list',text:text}); chars+=text.length;
    if(out.length>=15||chars>=8200) break;
  }
  return out;
}
function saygiExternalLinks(lang,title){
  var p=new URLSearchParams({action:'query',format:'json',formatversion:'2',origin:'*',prop:'extlinks',ellimit:'8',titles:String(title||'')});
  return saygiFetchJSON('https://'+lang+'.wikipedia.org/w/api.php?'+p.toString(),14000).then(function(j){
    var pages=j&&j.query&&j.query.pages, page=Array.isArray(pages)?pages[0]:null, list=page&&Array.isArray(page.extlinks)?page.extlinks:[], seen={}, out=[];
    for(var i=0;i<list.length&&out.length<3;i++){
      var raw=list[i]&&(list[i]['*']||list[i].url||list[i]), safe=saygiSafeUrl(raw); if(!safe||seen[safe]) continue;
      try{ var host=new URL(safe).hostname.replace(/^www\./,''); if(/(?:wikipedia|wikimedia)\.org$/i.test(host)) continue; seen[safe]=true; out.push({url:safe,host:host}); }catch(e){}
    }
    return out;
  }).catch(function(){ return []; });
}
function saygiArticleFrom(person,summary,full,links){
  var lang=summary._saygiLang||'tr', canonical=(summary.titles&&summary.titles.canonical)||summary.title||summary._saygiRequestedTitle||person.name;
  var blocks=saygiBioBlocks(full&&full.html);
  if(!blocks.length&&summary.extract) blocks=[{type:'p',text:saygiPlainText(summary.extract)}];
  var thumbnail=saygiSafeUrl(summary.thumbnail&&summary.thumbnail.source,['upload.wikimedia.org']);
  var source=saygiSafeUrl(summary.content_urls&&summary.content_urls.desktop&&summary.content_urls.desktop.page,[lang+'.wikipedia.org'])||('https://'+lang+'.wikipedia.org/wiki/'+encodeURIComponent(canonical));
  var license=(full&&full.license)||{}, licenseUrl=saygiSafeUrl(license.url)||'https://creativecommons.org/licenses/by-sa/4.0/deed.tr';
  return {personId:person.id,dailyKey:saygiDayKey(person),lang:lang,title:String(summary.title||person.name),canonical:String(canonical),description:saygiPlainText(summary.description||person.field||''),lead:saygiPlainText(summary.extract||''),blocks:blocks,thumbnail:thumbnail,sourceUrl:source,licenseTitle:String(license.title||'Creative Commons Attribution-Share Alike 4.0'),licenseUrl:licenseUrl,revision:(full&&full.latest&&full.latest.id)||summary.revision||null,links:links||[],fetchedAt:new Date().toISOString()};
}
function saygiLoadArticle(person,force){
  if(!person) return;
  var dailyKey=saygiDayKey(person), requestId=(ui.saygiRequestId||0)+1;
  ui.saygiRequestId=requestId; ui.saygiLoading=true; ui.saygiError=null;
  saygiLoadSummary(person).then(function(summary){
    var canonical=(summary.titles&&summary.titles.canonical)||summary.title||person.name, lang=summary._saygiLang||'tr', cacheKey=saygiCacheKey(lang,canonical,summary.revision||'current');
    var cached=!force?saygiReadCache(cacheKey):null;
    if(cached) return cached;
    return saygiFetchJSON(saygiHtmlUrl(lang,canonical),20000).catch(function(){ return null; }).then(function(full){
      return saygiExternalLinks(lang,canonical).then(function(links){ var article=saygiArticleFrom(person,summary,full,links); saygiWriteCache(cacheKey,article); return article; });
    });
  }).then(function(article){
    if(requestId!==ui.saygiRequestId||dailyKey!==saygiDayKey(person)) return;
    ui.saygiArticle=article; ui.saygiLoading=false; ui.saygiError=null;
    if(ui.tab==='saygi') render();
  }).catch(function(err){
    if(requestId!==ui.saygiRequestId) return;
    ui.saygiLoading=false; ui.saygiError='Biyografi şu an yüklenemedi. Bağlantını kontrol edip yeniden deneyebilirsin.';
    if(ui.tab==='saygi') render();
  });
}
function saygiEnsureArticle(person){
  var key=saygiDayKey(person);
  if(ui.saygiKey!==key){ ui.saygiKey=key; ui.saygiArticle=null; ui.saygiLoading=false; ui.saygiError=null; ui.saygiReadReady=false; }
  if(!ui.saygiArticle&&!ui.saygiLoading) saygiLoadArticle(person,false);
}
function saygiReadMinutes(article){ var text=(article&&article.blocks||[]).map(function(b){return b.text;}).join(' '); return Math.max(4,Math.min(18,Math.round(text.length/850)||4)); }
function saygiReadingEntry(day,person){
  var entries=day&&day.reading&&Array.isArray(day.reading.entries)?day.reading.entries:[];
  for(var i=0;i<entries.length;i++){ var e=entries[i]; if(e&&e.source==='saygi'&&e.personId===person.id&&e.saygiDate===todayStr()) return e; }
  return null;
}
function saygiHasRead(person){
  var day=data&&data.days&&data.days[todayStr()]; if(!day||!person) return false;
  var entry=saygiReadingEntry(day,person); if(!entry) return false;
  var st=ensureSaygiDay(day); if(st.readingEntryId!==entry.id){ st.personId=person.id; st.readingEntryId=entry.id; st.readAt=entry.ts||st.readAt||new Date().toISOString(); }
  return true;
}
function saygiDomainTone(host){ var colors=['#735F37','#4B6670','#76536A','#526753','#6B5B86','#8B6047']; var n=0,s=String(host||''); for(var i=0;i<s.length;i++) n=(n*31+s.charCodeAt(i))>>>0; return colors[n%colors.length]; }
// Sağlık uygulaması (iOS Health) senkronu — tarayıcı arka planda GPS izleyemediği için
// telefonun kendi adım sayacından tek yönlü, otomatik (Kısayollar) beslenen alan.
function emptyHealth(){ return {steps:0,walkM:0,updatedAt:null}; }
function emptyMagnesium(){ return {taken:false,form:'',mg:null,time:'',reason:[],effectNote:'',skipped:false,feedback:null}; }
function dayMovement(rec){ var m=(rec&&rec.movement&&typeof rec.movement==='object')?rec.movement:null; return {total:m?(m.totalM||0):0, walk:m?(m.walkM||0):0, veh:m?(m.vehicleM||0):0, max:m?(m.maxSpeed||0):0}; }
function trackedSteps(rec){ var w=dayMovement(rec).walk; return w>0?Math.round(w/STEP_LEN_M):0; }
function effSteps(rec){
  var manual=(rec&&rec.walk&&rec.walk.steps!=null&&rec.walk.steps!=='')?Number(rec.walk.steps):null;
  if(manual!=null&&!isNaN(manual)) return {steps:manual,source:'manual'};
  var hs=(rec&&rec.health&&rec.health.steps>0)?rec.health.steps:0;
  if(hs>0) return {steps:hs,source:'health'};
  var tr=trackedSteps(rec); if(tr>0) return {steps:tr,source:'tracked'};
  return {steps:null,source:'none'};
}
// ── Veri-güdümlü tikler ──────────────────────────────────────────────────────
// Su / uyku / yürüyüş tikleri elle işaretlenmez; yalnızca ilgili veri eşiği
// tutunca kendiliğinden yeşillenir. habitProgress hem kapı (met) hem de premium
// ilerleme metni/çubuğu için gereken her şeyi döndürür. Renkler her tik için ayrı.
var DERIVED_HABITS={water:1,sleepReg:1,walked20:1,journaled:1,sweetManaged:1,foodManaged:1,coffeeManaged:1,mediaFed:1,caffeineOk:1};
var DERIVED_ACCENT={water:'#5EA9E6',sleepReg:'#9B7FC9',walked20:'#5BA85B',journaled:'#E0A93C',sweetManaged:'#E9899F',foodManaged:'#E0A55E',coffeeManaged:'#A9805B',mediaFed:'#C77D93',caffeineOk:'#8A5A2B'};
// Bugün okuma/izleme/dinleme/öğrenme hub'larından en az birine kayıt girildi mi? (mediaFed tiki)
function hasAnyHubEntry(rec){
  if(!rec) return false;
  var keys=['reading','watching','listening','learning'];
  for(var i=0;i<keys.length;i++){ var o=rec[keys[i]]; if(o&&Array.isArray(o.entries)&&o.entries.some(function(e){ return e&&((e.title&&String(e.title).trim())||(e.topic&&String(e.topic).trim())); })) return true; }
  return false;
}
function habitProgress(rec,key){
  if(key==='water'){ var w=(rec&&typeof rec.water==='number'&&rec.water>0)?rec.water:0; return {met:w>=WATER_GOAL,cur:w,goal:WATER_GOAL,unit:'bardak',has:w>0}; }
  if(key==='sleepReg'){ var h=(rec&&rec.sleep&&rec.sleep.hours!=null&&rec.sleep.hours!=='')?Number(rec.sleep.hours):null; if(h!=null&&isNaN(h)) h=null; return {met:(h!=null&&h>=SLEEP_TICK_MIN),cur:h,goal:SLEEP_TICK_MIN,unit:'saat',has:h!=null}; }
  if(key==='walked20'){ var e=effSteps(rec); var s=(e.steps!=null&&!isNaN(e.steps))?e.steps:0; return {met:s>=STEP_TICK_MIN,cur:s,goal:STEP_TICK_MIN,unit:'adım',has:s>0,source:e.source}; }
  if(key==='journaled'){ var nt=(rec&&rec.note&&String(rec.note).trim())?1:0; return {met:nt>0,cur:nt,goal:1,binary:true,has:nt>0}; }
  if(key==='sweetManaged'){ var cd=!!(rec&&rec.craving10MinDone); return {met:cd,cur:cd?1:0,goal:1,binary:true,has:cd}; }
  if(key==='foodManaged'){ var fd=!!(rec&&rec.foodCravingDone); return {met:fd,cur:fd?1:0,goal:1,binary:true,has:fd}; }
  if(key==='coffeeManaged'){ var kd=!!(rec&&rec.coffeeCravingDone); return {met:kd,cur:kd?1:0,goal:1,binary:true,has:kd}; }
  if(key==='mediaFed'){ var any=hasAnyHubEntry(rec); return {met:any,cur:any?1:0,goal:1,binary:true,has:any}; }
  if(key==='caffeineOk'){ var cafTotal=caffeineTotalMg(rec); var cafLimit=caffeineLimit(); var cafLast=caffeineLastTime(rec); var cafHas=caffeineDrinks(rec).length>0; var amountOk=cafTotal<=cafLimit; var timingOk=caffeineTimingOk(rec); var met=amountOk&&(cafHas?timingOk:true); return {met:met,cur:cafTotal,goal:cafLimit,unit:'mg',has:cafHas,amountOk:amountOk,timingOk:timingOk}; }
  return null;
}
// day.habits[key]'i veriyle senkronlar; yeni yeşillenen anahtarları döndürür (kutlama için).
function syncDerivedHabits(day){
  if(!day||!day.habits) return [];
  var newly=[];
  for(var k in DERIVED_HABITS){ var p=habitProgress(day,k); if(!p) continue; if(p.met&&!day.habits[k]) newly.push(k); day.habits[k]=p.met; }
  return newly;
}
function hexA(hex,a){ var s=String(hex).replace('#',''); if(s.length===3) s=s[0]+s[0]+s[1]+s[1]+s[2]+s[2]; var n=parseInt(s,16); return 'rgba('+((n>>16)&255)+','+((n>>8)&255)+','+(n&255)+','+a+')'; }
// Tek bir alışkanlık satırı için tutarlı HTML; hem HABITS hem lüteal Mg satırı için.
function habitRowHTML(o){
  var bg=o.done?(dark?'linear-gradient(135deg,rgba(233,175,193,0.25),rgba(201,184,255,0.22))':'linear-gradient(135deg,rgba(255,255,255,0.92),rgba(247,221,229,0.82))'):(o.locked?hexA(o.accent,dark?0.07:0.05):'var(--card)');
  var bd=o.done?'rgba(233,175,193,0.9)':(o.warn?'var(--warn)':(o.locked?hexA(o.accent,0.4):'var(--card-bd)'));
  var sh=o.done?'0 10px 26px rgba(233,175,193,0.4)':(o.locked?'0 6px 16px '+hexA(o.accent,0.12):'0 6px 16px rgba(108,74,58,0.06)');
  var h='';
  h+='<button onclick="'+esc(o.onclick)+'"'+(o.warn?' class="sey-habit-warn"':'')+' style="display:flex;align-items:center;gap:13px;padding:14px;width:100%;text-align:left;cursor:pointer;border-radius:20px;color:var(--text);border:1px solid '+bd+';background:'+bg+';box-shadow:'+sh+';transform:scale('+(o.pulsing?'1.03':'1')+');transition:transform .22s cubic-bezier(.34,1.56,.64,1),box-shadow .25s,background .25s,border-color .25s;">';
  h+='<div style="width:46px;height:46px;border-radius:14px;display:flex;align-items:center;justify-content:center;flex-shrink:0;background:'+(o.locked?hexA(o.accent,0.12):'var(--icon)')+';color:'+(o.locked?o.accent:'var(--text)')+';">'+o.icon+'</div>';
  h+='<div style="flex:1;min-width:0;"><div style="font-size:15.5px;font-weight:700;line-height:1.25;display:flex;align-items:center;gap:6px;flex-wrap:wrap;">'+esc(o.title)+(o.derived?'<span style="font-size:9px;font-weight:800;letter-spacing:.6px;color:'+(o.done?'#3F8A4F':o.accent)+';background:'+(o.done?'rgba(143,191,138,0.2)':hexA(o.accent,0.14))+';border-radius:6px;padding:1.5px 5px;">OTO</span>':'')+'</div>';
  if(o.done){ h+='<div style="font-size:13px;color:var(--accent);font-weight:600;margin-top:4px;line-height:1.35;">'+esc(o.msg)+'</div>'; }
  else if(o.locked){ var pct=Math.min(100,Math.max(0,Math.round(((o.prog.cur||0)/o.prog.goal)*100))); h+='<div style="font-size:12.5px;color:'+o.accent+';font-weight:600;margin-top:3px;line-height:1.35;">'+esc(derivedProgText(o.key,o.prog))+'</div>'; if(!o.prog.binary){ h+='<div style="height:6px;border-radius:999px;background:'+hexA(o.accent,0.16)+';overflow:hidden;margin-top:7px;"><div style="height:100%;width:'+pct+'%;border-radius:999px;background:linear-gradient(90deg,'+hexA(o.accent,0.65)+','+o.accent+');transition:width .45s cubic-bezier(.34,1.2,.64,1);"></div></div>'; } }
  else { h+='<div style="font-size:13px;color:'+(o.warn?'var(--warn)':'var(--faint)')+';margin-top:3px;line-height:1.35;">'+esc(o.sub)+'</div>'; }
  h+='</div>';
  if(o.done){ h+='<div style="width:28px;height:28px;border-radius:50%;flex-shrink:0;display:flex;align-items:center;justify-content:center;color:#fff;background:linear-gradient(135deg,#E9AFC1,#C9B8FF);">'+icon('check',15)+'</div>'; }
  else if(o.locked){ h+='<div style="width:28px;height:28px;border-radius:50%;flex-shrink:0;display:flex;align-items:center;justify-content:center;color:'+hexA(o.accent,0.85)+';border:2px solid '+hexA(o.accent,0.4)+';background:'+hexA(o.accent,0.06)+';">'+icon('lock',12)+'</div>'; }
  else { h+='<div style="width:28px;height:28px;border-radius:50%;flex-shrink:0;background:transparent;border:2px solid '+(o.warn?'var(--warn)':'var(--field-bd)')+ ';"></div>'; }
  h+='</button>';
  return h;
}
// Türetilmiş tik'in (henüz tutmayan) kısa, kibar ilerleme metni.
function derivedProgText(key,prog){
  if(key==='water') return prog.cur<=0?'Su ekle · '+WATER_GOAL+' bardakta otomatik yeşil':prog.cur+'/'+WATER_GOAL+' bardak · dolunca otomatik yeşil';
  if(key==='sleepReg') return prog.cur==null?'Uyku gir · 7,5 saatte otomatik yeşil':String(prog.cur).replace('.',',')+' saat · 7,5 saatte otomatik yeşil';
  if(key==='walked20') return prog.cur<=0?'Adım gir · 4.500 adımda otomatik yeşil':prog.cur.toLocaleString('tr-TR')+' / 4.500 adım · otomatik yeşil';
  if(key==='journaled') return 'Yansıma kartına bir not yaz → kendiliğinden yeşillenir';
  if(key==='sweetManaged') return 'Tatlı krizinde “Krizi yönettim”e bas → kendiliğinden yeşillenir';
  if(key==='foodManaged') return 'Yemek/açlık krizinde “Krizi yönettim”e bas → kendiliğinden yeşillenir';
  if(key==='coffeeManaged') return 'Kahve/kafein krizinde “Krizi yönettim”e bas → kendiliğinden yeşillenir';
  if(key==='mediaFed') return 'Okudum / izledim / dinledim / öğrendim\'den birini doldur → yeşillenir';
  if(key==='caffeineOk'){ return prog.amountOk ? (prog.has ? 'Son kahve vaktinde, miktar temiz → otomatik yeşil' : 'Bugün kahve yok → otomatik yeşil') : 'Kafein limiti ('+prog.goal+' mg) aşıldı — azaltınca düzelir'; }
  return '';
}
function readingStats(rec){ var en=(rec&&rec.reading&&Array.isArray(rec.reading.entries))?rec.reading.entries:[]; var pages=0,minutes=0; en.forEach(function(e){ if(!e) return; var p=Number(e.pages); if(!isNaN(p)&&p>0) pages+=p; var m=Number(e.minutes); if(!isNaN(m)&&m>0) minutes+=m; }); return {count:en.length,pages:pages,minutes:minutes,entries:en}; }

// ---------- Kitaplık & İzleme (kalıcı arşiv) ----------
function uid(p){ return (p||'id')+'_'+Date.now().toString(36)+'_'+Math.random().toString(36).slice(2,6); }
function emptyWatching(){ return {entries:[]}; }
function emptyLibrary(){ return {books:[],goal:{dailyPages:20,yearlyBooks:null}}; }
function emptyWatchlist(){ return {items:[],goal:{dailyMinutes:40,yearlyTitles:null}}; }
function emptyListening(){ return {entries:[]}; }
function emptyLearning(){ return {entries:[]}; }
function emptyMusic(){ return {items:[],goal:{dailyMinutes:30,yearlyTitles:null}}; }

// ---------- Profil Değerlendirmesi: veri modeli ve migration (Faz 03) ----------
// Tek seferlik, 174 maddelik bilimsel profil değerlendirmesi (bkz. profileAssessmentV1.js).
// data.psych'ten (iki haftada bir tekrarlanan öz-bildirim taraması) TAMAMEN AYRI bir alan
// ve isim uzayı — data.psych'e burada hiçbir şekilde dokunulmaz. Bu fazda yalnızca veri
// modeli/migration var; henüz UI, gate veya render entegrasyonu yok.
function emptyProfileAssessment(){
  return {
    schemaVersion:2,
    instrumentVersion:(window.ProfileAssessmentV1&&window.ProfileAssessmentV1.version)||'1.0.0',
    deliveryMode:'single_session',
    status:'not_started',
    startedAt:null,
    completedAt:null,
    currentItemIndex:0,
    consent:{
      version:null,
      informationShownAt:null,
      acceptedAt:null,
      profileProcessingAccepted:false,
      sensitiveDataAccepted:false,
      panelSummarySharingAccepted:false
    },
    responses:{},
    moduleProgress:{},
    scores:{},
    quality:{},
    report:{},
    panelSummary:{}
  };
}
// Soru bankasının tek oturumluk global madde listesi (yüklenmediyse boş dizi — çağıranlar
// bunu bilerek kontrol eder, hiçbir yerde varlığı varsayılmaz).
function profileAssessmentItems(){
  try{ return (window.ProfileAssessmentV1&&window.ProfileAssessmentV1.sessions&&window.ProfileAssessmentV1.sessions[0]&&window.ProfileAssessmentV1.sessions[0].items)||[]; }catch(e){ return []; }
}
// Global sırada (1..174) ilk cevaplanmamış maddenin 0-index konumunu döndürür;
// tüm maddeler cevaplanmışsa madde sayısını (tamamlanmış konum) döndürür.
function profileAssessmentComputeCurrentIndex(responses){
  var items=profileAssessmentItems();
  if(!items.length) return 0;
  responses=(responses&&typeof responses==='object')?responses:{};
  for(var i=0;i<items.length;i++){
    var r=responses[items[i].id];
    if(!r||typeof r!=='object'||typeof r.value!=='number') return i;
  }
  return items.length;
}
// d.profileAssessment'ı ensure eder: yoksa taze oluşturur, varsa eksik nested alanları
// tek tek backfill eder (var olan değerleri EZMEZ). Eski (tek-oturum öncesi, "üç günlük
// beta") bir kayıt bulursa schemaVersion/deliveryMode'u yükseltir; schedule/currentDay/
// nextSessionId/sessions gibi artık kullanılmayan alanları SİLMEZ (bilinmeyen eski veri
// alanı silinmez kuralı), yalnızca bundan sonra hiçbir mantıkta okumaz — tek doğru kaynak
// itemId anahtarlı `responses` olur. Saf ve headless test edilebilir: yalnızca kendisine
// verilen `d` üzerinde çalışır, global `data`'ya dokunmaz.
function ensureProfileAssessment(d){
  if(!d||typeof d!=='object') return null;
  if(!d.profileAssessment||typeof d.profileAssessment!=='object'){
    d.profileAssessment=emptyProfileAssessment();
    return d.profileAssessment;
  }
  var pa=d.profileAssessment;
  if(typeof pa.schemaVersion!=='number'||pa.schemaVersion<2){
    pa.schemaVersion=2;
    pa.deliveryMode='single_session';
  }
  if(typeof pa.instrumentVersion!=='string') pa.instrumentVersion=(window.ProfileAssessmentV1&&window.ProfileAssessmentV1.version)||'1.0.0';
  if(pa.deliveryMode!=='single_session') pa.deliveryMode='single_session';
  if(typeof pa.status!=='string') pa.status='not_started';
  if(typeof pa.startedAt!=='string'&&pa.startedAt!==null) pa.startedAt=null;
  if(typeof pa.completedAt!=='string'&&pa.completedAt!==null) pa.completedAt=null;
  if(!pa.responses||typeof pa.responses!=='object') pa.responses={};
  if(!pa.moduleProgress||typeof pa.moduleProgress!=='object') pa.moduleProgress={};
  if(!pa.scores||typeof pa.scores!=='object') pa.scores={};
  if(!pa.quality||typeof pa.quality!=='object') pa.quality={};
  if(!pa.report||typeof pa.report!=='object') pa.report={};
  if(!pa.panelSummary||typeof pa.panelSummary!=='object') pa.panelSummary={};
  if(!pa.consent||typeof pa.consent!=='object') pa.consent={};
  if(typeof pa.consent.version!=='string'&&pa.consent.version!==null) pa.consent.version=null;
  if(typeof pa.consent.informationShownAt!=='string'&&pa.consent.informationShownAt!==null) pa.consent.informationShownAt=null;
  if(typeof pa.consent.acceptedAt!=='string'&&pa.consent.acceptedAt!==null) pa.consent.acceptedAt=null;
  if(typeof pa.consent.profileProcessingAccepted!=='boolean') pa.consent.profileProcessingAccepted=false;
  if(typeof pa.consent.sensitiveDataAccepted!=='boolean') pa.consent.sensitiveDataAccepted=false;
  if(typeof pa.consent.panelSummarySharingAccepted!=='boolean') pa.consent.panelSummarySharingAccepted=false;
  var items=profileAssessmentItems();
  if(typeof pa.currentItemIndex!=='number'||isNaN(pa.currentItemIndex)||pa.currentItemIndex<0) pa.currentItemIndex=0;
  if(items.length){
    // Cevaplar tek doğru kaynak: soru bankası yüklüyse konum/duruma her zaman ondan
    // yeniden hesaplanır (eski schedule/currentDay/nextSessionId hiç okunmaz).
    var computedIndex=profileAssessmentComputeCurrentIndex(pa.responses);
    pa.currentItemIndex=computedIndex;
    if(computedIndex>=items.length){ if(pa.status!=='completed') pa.status='completed'; }
    else if(pa.status==='completed'){ pa.status='active'; } // tutarsızlık (ör. banka değişti) — veri kaybı yaratmadan düzelt
  }
  return pa;
}

// ---------- Profil Değerlendirmesi: bilgilendirme + açık rıza (Faz 04) ----------
// Faz 05'ten itibaren render()'daki ana uygulama kilidinin İLK adımı budur (rıza
// verilmemişse önce bu ekran gösterilir). `data.psych`'in kendi (artık pasif) rıza/
// SOS akışından tamamen ayrı: isim uzayı hiç kesişmiyor (ui.profileConsent*,
// App.profile*), data.psych'e dokunulmuyor.
var PROFILE_CONSENT_VERSION='1.0.0';
var PROFILE_CONSENT_ITEMS=[
  {ic:'target',t:'Toplam 174 kısa madde, her ekranda yalnızca bir tanesi gösterilir.'},
  {ic:'clock',t:'Tahmini süre 22–35 dakika.'},
  {ic:'lock',t:'Tamamlanmadan ana uygulamaya geçilemez.'},
  {ic:'save',t:'Uygulamayı kapatırsan ilerlemen korunur; kaldığın yerden devam edersin.'},
  {ic:'stethoscope',t:'Sonuçlar klinik bir tanı değildir, öz-bildirime dayalı bir profildir.'},
  {ic:'heart-handshake',t:'İlişki ve iyi oluşla ilgili bazı maddeler hassastır.'},
  {ic:'cloud',t:'Verilerin, mevcut yedekleme akışınla (sync.js) seyma-data reposuna senkronize edilir.'}
];
function profileConsentChecks(){
  if(!ui.profileConsent||typeof ui.profileConsent!=='object') ui.profileConsent={read:false,processing:false,sensitive:false,notDiagnosis:false};
  return ui.profileConsent;
}
function profileConsentMandatoryOk(c){ return !!(c&&c.read&&c.processing&&c.sensitive&&c.notDiagnosis); }
function profileConsentRow(key,label,checked){
  return '<button onclick="App.profileConsentToggle(\''+key+'\')" style="display:flex;align-items:flex-start;gap:11px;width:100%;text-align:left;border:none;text-align:left;padding:12px 13px;border-radius:15px;cursor:pointer;transition:all .18s;'+(checked?'background:color-mix(in srgb,#C9B8FF 12%, var(--card));border:1px solid #C9B8FF;':'background:var(--card);border:1px solid var(--card-bd);')+'">'
    +'<span style="width:22px;height:22px;border-radius:7px;flex-shrink:0;display:flex;align-items:center;justify-content:center;margin-top:1px;color:#fff;background:'+(checked?'linear-gradient(135deg,#E9899F,#C9B8FF)':'transparent')+';border:'+(checked?'none':'2px solid var(--field-bd)')+';">'+(checked?icon('check',13):'')+'</span>'
    +'<span style="flex:1;font-size:13.5px;line-height:1.45;color:var(--text);font-weight:600;">'+label+'</span></button>';
}
function renderProfileConsent(){
  ensureProfileAssessment(data);
  var pa=data.profileAssessment;
  if(!pa.consent.informationShownAt){ pa.consent.informationShownAt=new Date().toISOString(); save(); }
  var c=profileConsentChecks();
  var mandatoryOk=profileConsentMandatoryOk(c);
  var h='<div style="position:relative;flex:1;min-height:0;display:flex;flex-direction:column;background:var(--bg);">';
  h+='<div data-scroll class="scroll" style="flex:1;min-height:0;overflow-y:auto;-webkit-overflow-scrolling:touch;padding:calc(env(safe-area-inset-top) + 22px) 20px calc(env(safe-area-inset-bottom) + 20px);display:flex;flex-direction:column;gap:16px;">';
  h+='<div style="display:flex;flex-direction:column;align-items:center;gap:10px;text-align:center;">';
  h+='<div style="display:flex;align-items:center;gap:9px;">';
  h+='<div style="width:64px;height:64px;border-radius:22px;display:flex;align-items:center;justify-content:center;background:linear-gradient(135deg,#F4DCA0,#E9AEC6 52%,#CBB8FF);box-shadow:0 14px 30px rgba(233,137,159,0.3);">'+icon('brain',30)+'</div>';
  h+='<div style="width:64px;height:64px;border-radius:22px;display:flex;align-items:center;justify-content:center;background:linear-gradient(145deg,#FFFFFF,#E9E9EF);border:1px solid rgba(0,0,0,0.06);box-shadow:0 14px 30px rgba(0,0,0,0.16),inset 0 1px 0 #fff;"><span style="font-family:-apple-system,system-ui,\'Segoe UI\',sans-serif;font-size:13px;font-weight:850;letter-spacing:1.2px;color:#101017;">ÆON</span></div>';
  h+='</div>';
  h+='<h1 style="margin:0;font-size:22px;font-weight:800;color:var(--text);">Bilimsel Profil Değerlendirmesi</h1>';
  h+='<p style="margin:0;font-size:14.5px;line-height:1.55;color:var(--muted);max-width:360px;">Başlamadan önce ne olduğunu ve verilerinin ne olacağını kısaca anlatalım.</p>';
  h+='</div>';
  h+='<div class="glass" style="border-radius:20px;padding:6px 4px;display:flex;flex-direction:column;">';
  PROFILE_CONSENT_ITEMS.forEach(function(it,i){
    h+='<div style="display:flex;align-items:flex-start;gap:11px;padding:11px 12px;'+(i<PROFILE_CONSENT_ITEMS.length-1?'border-bottom:1px solid var(--card-bd);':'')+'"><span style="flex-shrink:0;color:var(--muted);margin-top:1px;">'+icon(it.ic,17)+'</span><span style="font-size:14px;line-height:1.5;color:var(--text2);">'+it.t+'</span></div>';
  });
  h+='</div>';
  h+='<div style="display:flex;flex-direction:column;gap:9px;">';
  h+=profileConsentRow('read','Bilgilendirmeyi okudum.',c.read);
  h+=profileConsentRow('processing','Profil verilerimin işlenmesini kabul ediyorum.',c.processing);
  h+=profileConsentRow('sensitive','Hassas verilerin (ör. ilişki/iyi oluş) belirtilen amaçlarla işlenmesini kabul ediyorum.',c.sensitive);
  h+=profileConsentRow('notDiagnosis','Sonuçların klinik bir tanı olmadığını anladım.',c.notDiagnosis);
  h+='</div>';
  h+='<button onclick="App.profileAcceptConsent()" '+(mandatoryOk?'':'disabled')+' style="border:none;width:100%;padding:16px;border-radius:18px;font-size:16px;font-weight:800;color:#fff;background:linear-gradient(135deg,#E9899F,#C9B8FF);box-shadow:0 14px 30px rgba(233,137,159,0.35);display:flex;align-items:center;justify-content:center;gap:8px;'+(mandatoryOk?'cursor:pointer;opacity:1;':'cursor:not-allowed;opacity:.5;')+'">Kabul et ve başla '+icon('check',16)+'</button>';
  h+='<div style="display:flex;justify-content:center;gap:18px;padding-top:2px;flex-wrap:wrap;">';
  h+='<button onclick="App.profileConsentTogglePrivacyNote()" style="border:none;background:transparent;cursor:pointer;font-size:12.5px;font-weight:600;color:var(--faint);text-decoration:underline;">Gizlilik</button>';
  h+='<button onclick="App.profileAssessmentSOS()" style="border:none;background:transparent;cursor:pointer;font-size:12.5px;font-weight:600;color:var(--faint);text-decoration:underline;">Zor hissediyorum</button>';
  h+='</div>';
  if(ui.profileConsentPrivacyNote) h+='<div class="glass" style="border-radius:16px;padding:13px 15px;">'+icon('lock',13)+'<p style="margin:8px 0 0;font-size:12.5px;line-height:1.6;color:var(--text2);">Kilit ekranı seni korur; parola düz metin olarak kaydedilmez. Cevapların önce bu cihazda saklanır; yalnızca sen bağladıysan kendi seyma-data reponda yedeklenir. Panelde gösterim yalnızca yukarıdaki isteğe bağlı izni açarsan olur.</p></div>';
  h+='</div></div>';
  return h;
}

// ---------- Profil Değerlendirmesi: tek soru arayüzü ve yanıt akışı (Faz 05) ----------
function profileAssessmentModuleForOrder(order){
  var PA=window.ProfileAssessmentV1;
  var mb=(PA&&PA.sessions&&PA.sessions[0]&&PA.sessions[0].moduleBoundaries)||[];
  for(var i=0;i<mb.length;i++){ if(order>=mb[i].startOrder&&order<=mb[i].endOrder) return mb[i]; }
  return null;
}
// Şu an EKRANDA gösterilmesi gereken global index'i belirler: normalde `currentItemIndex`,
// ama bir yanıt az önce kaydedilip 150–220ms'lik görsel geri bildirim penceresindeyse
// (bkz. App.profileAnswer) o maddede sabit kalır — aksi halde seçim anında bir sonraki
// maddeye "atlar" ve seçili işaret hiç görünmez.
function profileItemDisplayIndex(){
  var items=profileAssessmentItems();
  if(ui.profileAssessmentAnswerLocked&&ui.profileAssessmentLockedItemId){
    for(var i=0;i<items.length;i++){ if(items[i].id===ui.profileAssessmentLockedItemId) return i; }
  }
  if(ui.profileAssessmentReviewIndex!=null) return ui.profileAssessmentReviewIndex;
  return (data&&data.profileAssessment&&data.profileAssessment.currentItemIndex)||0;
}
function renderProfileItem(index){
  var items=profileAssessmentItems();
  var total=items.length;
  if(!total){
    return '<div style="flex:1;display:flex;align-items:center;justify-content:center;padding:24px;text-align:center;color:var(--muted);font-size:14px;">Soru bankası yüklenemedi. Lütfen uygulamayı yeniden başlat.</div>';
  }
  if(index==null||index<0) index=0;
  if(index>=total) index=total-1;
  var item=items[index];
  var pa=data.profileAssessment;
  var PA=window.ProfileAssessmentV1;
  var scale=(PA&&PA.scales&&PA.scales[item.scaleId])||{prompt:'',options:[]};
  var mod=profileAssessmentModuleForOrder(item.order);
  var existing=pa.responses[item.id];
  var locked=!!ui.profileAssessmentAnswerLocked;
  var selectedValue=locked?(existing&&existing.value):(existing&&existing.value);
  var isReview=(ui.profileAssessmentReviewIndex!=null&&ui.profileAssessmentReviewIndex===index);
  // İlk kez gösterilen madde için gösterim anını kaydet (responseMs hesaplaması için).
  if(!ui.profileItemShownAt) ui.profileItemShownAt={};
  if(!ui.profileItemShownAt[item.id]) ui.profileItemShownAt[item.id]=new Date().toISOString();
  var pct=Math.max(0,Math.min(100,Math.round((index/total)*100)));
  var h='<div id="pa-gate" class="pa-gate" tabindex="0" onkeydown="App.profileItemKeydown(event)" role="group" aria-label="Profil değerlendirmesi" style="position:relative;flex:1;min-height:0;display:flex;flex-direction:column;background:var(--bg);outline:none;">';
  h+='<div data-scroll class="scroll" style="flex:1;min-height:0;overflow-y:auto;-webkit-overflow-scrolling:touch;padding:calc(env(safe-area-inset-top) + 18px) 20px calc(env(safe-area-inset-bottom) + 20px);display:flex;flex-direction:column;gap:16px;">';
  // üst: ilerleme + yüzde + modül başlığı + geri
  h+='<div style="display:flex;flex-direction:column;gap:8px;">';
  h+='<div style="display:flex;align-items:center;justify-content:space-between;gap:10px;">';
  h+=(index>0)?'<button onclick="App.profilePrevious()" aria-label="Önceki maddeye dön" style="border:none;background:transparent;cursor:pointer;display:flex;align-items:center;gap:4px;padding:6px 4px;min-height:48px;color:var(--muted);font-size:13px;font-weight:700;">‹ Geri</button>':'<span></span>';
  h+='<span style="font-size:12.5px;font-weight:800;color:var(--faint);">'+(index+1)+' / '+total+' · %'+pct+'</span>';
  h+='</div>';
  h+='<div style="height:6px;border-radius:999px;background:var(--card-bd);overflow:hidden;"><div style="height:100%;width:'+pct+'%;background:linear-gradient(90deg,#E9899F,#C9B8FF);border-radius:999px;"></div></div>';
  if(mod) h+='<div style="font-size:12px;font-weight:700;color:var(--faint);text-transform:uppercase;letter-spacing:.4px;">'+mod.title+'</div>';
  h+='</div>';
  // orta: madde metni
  h+='<div style="flex:1;min-height:0;display:flex;flex-direction:column;justify-content:center;gap:18px;padding:8px 0;">';
  h+='<p style="margin:0;font-size:19px;line-height:1.45;font-weight:700;color:var(--text);text-align:center;">'+item.text+'</p>';
  if(scale.prompt) h+='<p style="margin:0;font-size:12.5px;color:var(--faint);text-align:center;">'+scale.prompt+'</p>';
  // seçenekler
  h+='<div role="radiogroup" aria-label="Yanıt seçenekleri" style="display:flex;flex-direction:column;gap:8px;">';
  (scale.options||[]).forEach(function(opt){
    var sel=selectedValue===opt.value;
    h+='<button role="radio" aria-checked="'+(sel?'true':'false')+'" onclick="App.profileAnswer(\''+item.id+'\','+opt.value+')" '+(locked?'disabled':'')+' style="display:flex;align-items:center;gap:11px;width:100%;min-height:48px;text-align:left;padding:12px 14px;border-radius:15px;transition:all .18s;'+(locked?'cursor:default;':'cursor:pointer;')+(sel?'background:color-mix(in srgb,#C9B8FF 14%, var(--card));border:1px solid #C9B8FF;':'background:var(--card);border:1px solid var(--card-bd);')+'">'
      +'<span style="width:24px;height:24px;border-radius:50%;flex-shrink:0;display:flex;align-items:center;justify-content:center;color:#fff;background:'+(sel?'linear-gradient(135deg,#E9899F,#C9B8FF)':'transparent')+';border:'+(sel?'none':'2px solid var(--field-bd)')+';">'+(sel?icon('check',13):'')+'</span>'
      +'<span style="flex:1;font-size:14.5px;line-height:1.4;color:var(--text);font-weight:600;">'+opt.label+'</span>'
      +'<span aria-hidden="true" style="font-size:11px;color:var(--faint);">'+opt.value+'</span></button>';
  });
  h+='</div>';
  h+='</div>';
  // alt: otomatik kayıt göstergesi + erişim linkleri
  h+='<div style="min-height:16px;text-align:center;font-size:12px;font-weight:700;color:var(--ok,#6bbf7a);">'+(locked?'Kaydedildi ✓':'')+'</div>';
  if(isReview) h+='<div style="text-align:center;font-size:12px;color:var(--faint);">Önceki cevabını gözden geçiriyorsun — yeni bir seçim yaparsan güncellenir.</div>';
  h+='<div style="display:flex;justify-content:center;gap:18px;flex-wrap:wrap;">';
  h+='<button onclick="App.profileAssessmentSOS()" style="border:none;background:transparent;cursor:pointer;font-size:12.5px;font-weight:600;color:var(--faint);text-decoration:underline;">Zor hissediyorum</button>';
  h+='</div>';
  h+='</div></div>';
  return h;
}

// ---------- Profil Değerlendirmesi: mola noktaları ve uygulama kilidi (Faz 06) ----------
// Mola noktaları PA.pausePolicy.softBreakAfterOrders (20/40/60/84/102/120/138/158) ile
// birebir aynı — Faz 02'de yapısal olarak doğrulandı. Mola zorunlu süre içermez, ana
// uygulamaya geçiş vermez, skor/geri bildirim göstermez; yalnızca "Devam et" sunar.
function profileAssessmentPendingBreak(pa){
  var PA=window.ProfileAssessmentV1;
  var pp=(PA&&PA.pausePolicy)||{};
  var breaks=Array.isArray(pp.softBreakAfterOrders)?pp.softBreakAfterOrders:[];
  if(breaks.indexOf(pa.currentItemIndex)<0) return null; // bir modül sınırında değiliz
  var mod=profileAssessmentModuleForOrder(pa.currentItemIndex); // az önce biten modül
  if(!mod) return null;
  var mp=pa.moduleProgress&&pa.moduleProgress[mod.moduleId];
  if(mp&&mp.breakAcknowledged) return null; // bu mola zaten görüldü/geçildi — tekrar gösterme
  return mod;
}
function renderProfileBreak(mod){
  var pa=data.profileAssessment;
  var PA=window.ProfileAssessmentV1;
  var total=profileAssessmentItems().length||174;
  var pct=Math.max(0,Math.min(100,Math.round((pa.currentItemIndex/total)*100)));
  var mb=(PA&&PA.sessions&&PA.sessions[0]&&PA.sessions[0].moduleBoundaries)||[];
  var idx=-1; for(var i=0;i<mb.length;i++){ if(mb[i].moduleId===mod.moduleId){ idx=i; break; } }
  var nextMod=(idx>=0)?mb[idx+1]:null;
  var est=(PA&&PA.estimatedMinutes)||{min:22,max:35};
  var frac=Math.max(0,1-(pa.currentItemIndex/total));
  var remMin=Math.max(1,Math.round(est.min*frac)), remMax=Math.max(remMin,Math.round(est.max*frac));
  var h='<div id="pa-gate" class="pa-gate" tabindex="0" role="group" aria-label="Kısa mola" style="position:relative;flex:1;min-height:0;display:flex;flex-direction:column;background:var(--bg);outline:none;">';
  h+='<div data-scroll class="scroll" style="flex:1;min-height:0;overflow-y:auto;-webkit-overflow-scrolling:touch;padding:calc(env(safe-area-inset-top) + 22px) 20px calc(env(safe-area-inset-bottom) + 20px);display:flex;flex-direction:column;align-items:center;justify-content:center;gap:16px;text-align:center;">';
  h+='<div style="width:64px;height:64px;border-radius:22px;display:flex;align-items:center;justify-content:center;background:linear-gradient(135deg,#F4DCA0,#E9AEC6 52%,#CBB8FF);box-shadow:0 14px 30px rgba(233,137,159,0.3);">'+icon('sparkles',30)+'</div>';
  h+='<h1 style="margin:0;font-size:21px;font-weight:800;color:var(--text);">Kısa bir mola</h1>';
  h+='<p style="margin:0;font-size:14.5px;line-height:1.55;color:var(--muted);max-width:320px;">"'+mod.title+'" bölümünü bitirdin. İstersen birkaç saniye nefes al, hazır olduğunda devam et.</p>';
  h+='<div class="glass" style="border-radius:20px;padding:16px 18px;width:100%;max-width:340px;display:flex;flex-direction:column;gap:10px;">';
  h+='<div style="display:flex;justify-content:space-between;font-size:13.5px;color:var(--text2);"><span>Tamamlanan</span><span style="font-weight:800;color:var(--text);">'+pa.currentItemIndex+' / '+total+' · %'+pct+'</span></div>';
  h+='<div style="height:6px;border-radius:999px;background:var(--card-bd);overflow:hidden;"><div style="height:100%;width:'+pct+'%;background:linear-gradient(90deg,#E9899F,#C9B8FF);border-radius:999px;"></div></div>';
  if(nextMod) h+='<div style="display:flex;justify-content:space-between;font-size:13.5px;color:var(--text2);"><span>Sıradaki bölüm</span><span style="font-weight:800;color:var(--text);">'+nextMod.title+'</span></div>';
  h+='<div style="display:flex;justify-content:space-between;font-size:13.5px;color:var(--text2);"><span>Yaklaşık kalan süre</span><span style="font-weight:800;color:var(--text);">~'+remMin+'–'+remMax+' dk</span></div>';
  h+='</div>';
  h+='<button onclick="App.profileBreakContinue()" style="border:none;width:100%;max-width:340px;padding:16px;border-radius:18px;font-size:16px;font-weight:800;color:#fff;background:linear-gradient(135deg,#E9899F,#C9B8FF);box-shadow:0 14px 30px rgba(233,137,159,0.35);cursor:pointer;">Devam et '+icon('check',16)+'</button>';
  h+='<div style="display:flex;justify-content:center;gap:18px;flex-wrap:wrap;">';
  h+='<button onclick="App.profileAssessmentSOS()" style="border:none;background:transparent;cursor:pointer;font-size:12.5px;font-weight:600;color:var(--faint);text-decoration:underline;">Zor hissediyorum</button>';
  h+='</div>';
  h+='</div></div>';
  return h;
}
// Acil yardım — data.psych'in kendi (SOS akışından) TAMAMEN AYRI, bağımsız bir SOS mekanizması.
// Aynı gerçek dünya bilgisini (Raşit'in telefonu, 112) kullanır ama kendi state/isim uzayında.
function renderProfileAssessmentSOS(){
  var sent=!!ui.profileAssessmentSosSent;
  var h='<div id="pa-gate" class="pa-gate" tabindex="0" role="group" aria-label="Acil yardım" style="position:relative;flex:1;min-height:0;display:flex;flex-direction:column;background:var(--bg);outline:none;">';
  h+='<div data-scroll class="scroll" style="flex:1;min-height:0;overflow-y:auto;-webkit-overflow-scrolling:touch;padding:calc(env(safe-area-inset-top) + 18px) 20px calc(env(safe-area-inset-bottom) + 20px);display:flex;flex-direction:column;align-items:center;justify-content:center;gap:16px;text-align:center;">';
  h+='<button onclick="App.profileAssessmentSOSClose()" style="align-self:flex-start;border:1px solid var(--card-bd);cursor:pointer;background:var(--card);border-radius:14px;padding:9px 15px;font-size:14px;font-weight:700;color:var(--muted);">‹ Değerlendirmeye dön</button>';
  h+='<div style="width:78px;height:78px;border-radius:24px;display:flex;align-items:center;justify-content:center;background:linear-gradient(135deg,#FFD9E1,#C9B8FF);box-shadow:0 12px 30px rgba(233,175,193,0.45);">'+(sent?icon('heart',34):icon('heart-handshake',34))+'</div>';
  if(!sent){
    h+='<h2 style="margin:0;font-size:22px;font-weight:800;color:var(--text);">Yalnız değilsin</h2>';
    h+='<p style="margin:0;font-size:15px;line-height:1.6;color:var(--text2);max-width:340px;">Şu an zorlanıyorsan bunu tek başına taşımak zorunda değilsin. Aşağıdaki butona dokunursan Raşit\'e <b>doğrudan</b> haber gider.</p>';
    h+='<button onclick="App.profileAssessmentReachCreator()" style="border:none;cursor:pointer;width:100%;max-width:340px;padding:16px 18px;border-radius:20px;color:#fff;background:linear-gradient(135deg,#E9899F,#C9B8FF);box-shadow:0 12px 28px rgba(233,175,193,0.5);">Zor hissediyorum Raşit</button>';
    h+='<a href="tel:05066020098" style="text-decoration:none;border:1px solid rgba(233,175,193,0.6);cursor:pointer;width:100%;max-width:340px;padding:15px 18px;border-radius:20px;color:#B5566A;background:var(--card);display:flex;align-items:center;justify-content:center;gap:8px;font-size:15px;font-weight:800;">'+icon('phone',16)+' Raşit\'i ara</a>';
    h+='<div class="glass" style="border-radius:20px;padding:14px 16px;max-width:340px;"><p style="margin:0;font-size:13px;line-height:1.6;color:var(--text2);">Ani ve yoğun bir tehlike hissediyorsan lütfen <b>112</b>\'yi ara.</p></div>';
  } else {
    h+='<h2 style="margin:0;font-size:22px;font-weight:800;color:var(--text);">Mesajın gönderildi</h2>';
    h+='<p style="margin:0;font-size:15px;line-height:1.6;color:var(--text2);max-width:340px;">Raşit en kısa sürede yanında olacak. Hazır olduğunda değerlendirmeye devam edebilirsin.</p>';
  }
  h+='</div></div>';
  return h;
}
// Ana kilit dispatcher'ı: hangi ekranın (SOS/rıza/mola/soru/tamamlandı) gösterileceğine tek yerden karar verir.
function renderProfileAssessmentGate(){
  if(ui.profileAssessmentSOS) return renderProfileAssessmentSOS();
  var pa=data.profileAssessment;
  if(!pa.consent.acceptedAt) return renderProfileConsent();
  if(ui.profileAssessmentCompletionShown) return renderProfileCompletion();
  if(!ui.profileAssessmentReviewIndex&&!ui.profileAssessmentAnswerLocked){
    var brk=profileAssessmentPendingBreak(pa);
    if(brk) return renderProfileBreak(brk);
  }
  return renderProfileItem(profileItemDisplayIndex());
}
// 174/174 sonrası teşekkür/tamamlanma ekranı. Puanlama/rapor üretildi ama
// kullanıcıya yalnızca sade, sıcak bir "tamamlandı" mesajı gösterilir;
// rapor özeti, ölçüm güveni veya diğer sonuçlar bu ekranda paylaşılmaz.
function renderProfileCompletion(){
  var pa=data.profileAssessment||{};
  var total=profileAssessmentItems().length||174;
  var PA=window.ProfileAssessmentV1;
  var moduleCount=((PA&&PA.sessions&&PA.sessions[0]&&PA.sessions[0].moduleBoundaries)||[]).length||9;
  var dateStr=pa.completedAt?new Date(pa.completedAt).toLocaleDateString('tr-TR',{day:'2-digit',month:'long',year:'numeric'}):'';
  var h='<div id="pa-gate" class="pa-gate" style="position:relative;flex:1;min-height:0;display:flex;flex-direction:column;background:var(--bg);outline:none;">';
  h+='<div data-scroll class="scroll" style="flex:1;min-height:0;overflow-y:auto;-webkit-overflow-scrolling:touch;padding:calc(env(safe-area-inset-top) + 22px) 20px calc(env(safe-area-inset-bottom) + 20px);display:flex;flex-direction:column;align-items:center;justify-content:center;gap:16px;text-align:center;">';
  h+='<div class="pa-card" style="width:100%;max-width:340px;text-align:center;">';
  h+='<div style="width:88px;height:88px;border-radius:50%;background:linear-gradient(135deg,#C9B8FF,#E9899F);display:inline-flex;align-items:center;justify-content:center;color:#fff;margin-bottom:16px;box-shadow:0 14px 32px rgba(201,184,255,0.35);">'+icon('check',44)+'</div>';
  h+='<div style="font-size:26px;font-weight:800;color:var(--text);line-height:1.25;margin-bottom:10px;">Teşekkürler Günışığım</div>';
  h+='<div style="font-size:15px;line-height:1.6;color:var(--text2);margin-bottom:22px;">174 soruyu kendinle bu kadar içtenlikle yanıtladın. Seni biraz daha yakından tanımak çok kıymetliydi.</div>';
  h+='<div class="glass" style="border-radius:20px;padding:16px 18px;width:100%;display:flex;flex-direction:column;gap:10px;text-align:left;margin-bottom:22px;">';
  h+='<div style="display:flex;justify-content:space-between;font-size:13.5px;color:var(--text2);"><span>Tamamlanan</span><span style="font-weight:800;color:var(--text);">'+total+' / '+total+' · %100</span></div>';
  h+='<div style="height:6px;border-radius:999px;background:var(--card-bd);overflow:hidden;"><div style="height:100%;width:100%;background:linear-gradient(90deg,#E9899F,#C9B8FF);border-radius:999px;"></div></div>';
  h+='<div style="display:flex;justify-content:space-between;font-size:13.5px;color:var(--text2);"><span>Modüller</span><span style="font-weight:800;color:var(--text);">'+moduleCount+' / '+moduleCount+' tamamlandı</span></div>';
  if(dateStr) h+='<div style="display:flex;justify-content:space-between;font-size:13.5px;color:var(--text2);"><span>Tamamlanma tarihi</span><span style="font-weight:800;color:var(--text);">'+esc(dateStr)+'</span></div>';
  h+='</div>';
  h+='<button class="btn primary" onclick="App.dismissProfileCompletion()" style="width:100%;padding:14px 18px;font-size:16px;font-weight:800;border-radius:14px;background:linear-gradient(135deg,#C9B8FF,#E9899F);border:none;color:#fff;cursor:pointer;display:inline-flex;align-items:center;justify-content:center;gap:8px;">'+icon('arrow-right',18)+' Ana uygulamaya dön</button>';
  h+='</div>';
  h+='</div></div>';
  return h;
}

// ---------- Profil Değerlendirmesi: puanlama motoru (Faz 07) ----------
// Tamamen saf/deterministik fonksiyonlar — yalnızca kendilerine verilen responses'a ve
// profileAssessmentV1.js'in dondurulmuş `scoring.constructs` haritasına bakar; hiçbir global
// mutasyon yapmaz. Normatif DEĞİLDİR: yüzdelik/T puanı/normal-anormal etiketi ÜRETİLMEZ.
// Kalite kontrol maddeleri (construct:"response_quality") scoring.constructs'ta hiçbir
// yerde referans edilmediği için zaten otomatik dışlanır.
function scoreProfileItem(item,rawValue){
  if(!item||typeof rawValue!=='number'||isNaN(rawValue)) return null;
  return item.reverse?(8-rawValue):rawValue; // PA.scoring.reverseFormula: "8 - rawValue"
}
// itemIds: bir facet'e (ör. scoring.constructs.conscientiousness.organization) ait itemId listesi.
// NOT: facetId'ler tek başına belirsizdir (ör. "trust" hem agreeableness hem relationship_skills
// altında var) — bu yüzden bu fonksiyon çıplak facetId değil, çağıranın scoring.constructs
// haritasından aldığı somut itemId listesini alır.
function scoreProfileFacet(itemIds,responses){
  var items=profileAssessmentItems();
  var byId={}; items.forEach(function(it){ byId[it.id]=it; });
  var valid=[];
  (itemIds||[]).forEach(function(id){
    var r=responses&&responses[id], it=byId[id];
    if(!it||!r||typeof r.value!=='number') return;
    var s=scoreProfileItem(it,r.value);
    if(s!=null) valid.push(s);
  });
  var total=(itemIds||[]).length;
  var completion=total?valid.length/total:0;
  var sufficient=completion>=0.8&&valid.length>0; // minimumFacetCompletion
  var mean=sufficient?(valid.reduce(function(a,b){return a+b;},0)/valid.length):null;
  return {mean:mean,completion:completion,n:valid.length,total:total,sufficient:sufficient};
}
function scoreProfileConstruct(constructId,responses){
  var PA=window.ProfileAssessmentV1;
  var facetMap=(PA&&PA.scoring&&PA.scoring.constructs&&PA.scoring.constructs[constructId])||{};
  var facetIds=Object.keys(facetMap);
  var facets={}, validMeans=[];
  facetIds.forEach(function(f){
    var fs=scoreProfileFacet(facetMap[f],responses);
    facets[f]=fs;
    if(fs.sufficient) validMeans.push(fs.mean);
  });
  var completion=facetIds.length?validMeans.length/facetIds.length:0;
  var sufficient=completion>=0.8&&validMeans.length>0; // minimumConstructCompletion
  var mean=sufficient?(validMeans.reduce(function(a,b){return a+b;},0)/validMeans.length):null; // eşit ağırlıklı, faktör yükü YOK
  return {facets:facets,mean:mean,completion:completion,sufficient:sufficient};
}
// RIASEC: 6 alan ayrı tutulur; ilk üç + birinci/ikinci farkı + basit farklılaşma metriği
// (en yüksek-en düşük). Eşit skor durumunda Object.keys sırası (R,I,A,S,E,C dondurulmuş
// tanım sırası) + dizinin sabit (stable) sort'u korunduğu için sonuç deterministiktir.
function scoreRiasec(responses){
  var PA=window.ProfileAssessmentV1;
  var facetMap=(PA&&PA.scoring&&PA.scoring.constructs&&PA.scoring.constructs.riasec)||{};
  var scores={};
  var order=Object.keys(facetMap);
  order.forEach(function(f){ scores[f]=scoreProfileFacet(facetMap[f],responses); });
  var ranked=order.filter(function(f){ return scores[f].sufficient; })
    .map(function(f){ return {code:f,mean:scores[f].mean}; })
    .sort(function(a,b){ return b.mean-a.mean; }); // Array#sort ES2019+ stable — eşitlikte tanım sırası korunur
  var topThree=ranked.slice(0,3).map(function(e){ return e.code; });
  var first=ranked[0]||null, second=ranked[1]||null, last=ranked[ranked.length-1]||null;
  return {
    scores:scores,
    topThree:topThree,
    topSecondDiff:(first&&second)?Math.round((first.mean-second.mean)*1000)/1000:null,
    differentiation:(first&&last)?Math.round((first.mean-last.mean)*1000)/1000:null
  };
}
// Değerler: ham ortalamaların yanında kişi-merkezli skor (centered = valueMean - allValuesMean) —
// kişinin TÜM değerleri yüksek/düşük işaretleme eğilimini azaltır. Ahlaki sıralama YOK.
function scoreValues(responses){
  var PA=window.ProfileAssessmentV1;
  var facetMap=(PA&&PA.scoring&&PA.scoring.constructs&&PA.scoring.constructs.values)||{};
  var raw={};
  Object.keys(facetMap).forEach(function(f){ raw[f]=scoreProfileFacet(facetMap[f],responses); });
  var sufficientMeans=Object.keys(raw).filter(function(f){ return raw[f].sufficient; }).map(function(f){ return raw[f].mean; });
  var allValuesMean=sufficientMeans.length?(sufficientMeans.reduce(function(a,b){return a+b;},0)/sufficientMeans.length):null;
  var centered={};
  Object.keys(raw).forEach(function(f){
    centered[f]=(raw[f].sufficient&&allValuesMean!=null)?Math.round((raw[f].mean-allValuesMean)*1000)/1000:null;
  });
  return {raw:raw,allValuesMean:allValuesMean,centered:centered};
}
// Bağlanma: kaygı ve kaçınma AYRI, sürekli iki skor. "Güvenli/kaçıngan" gibi kategori
// ÜRETİLMEZ (kategori zorunlu değil kuralı gereği bilerek eklenmedi).
function scoreAttachment(responses){
  var PA=window.ProfileAssessmentV1;
  var facetMap=(PA&&PA.scoring&&PA.scoring.constructs&&PA.scoring.constructs.attachment)||{};
  return {
    anxiety:scoreProfileFacet(facetMap.anxiety||[],responses),
    avoidance:scoreProfileFacet(facetMap.avoidance||[],responses)
  };
}
// Tüm profili puanlar. wellbeing_context KALICI karakter skorlarına KATILMAZ — ayrı bir
// bağlam notu olarak döner (bkz. scoring/SCORING_ENGINE.md § Güncel bağlam).
function scoreProfileAssessment(responses){
  var PA=window.ProfileAssessmentV1;
  var allConstructIds=Object.keys((PA&&PA.scoring&&PA.scoring.constructs)||{});
  var special={riasec:1,values:1,attachment:1,wellbeing_context:1};
  var constructs={};
  allConstructIds.forEach(function(c){
    if(special[c]) return;
    constructs[c]=scoreProfileConstruct(c,responses);
  });
  return {
    constructs:constructs,
    riasec:scoreRiasec(responses),
    values:scoreValues(responses),
    attachment:scoreAttachment(responses),
    wellbeingContext:scoreProfileConstruct('wellbeing_context',responses)
  };
}

// ---------- Profil Değerlendirmesi: yanıt kalitesi ve güven motoru (Faz 08) ----------
// Ağırlıklar TEK yerde sabit ve test edilebilir (scoring/QUALITY_ENGINE.md ile birebir):
// tamamlanma %30, dikkat kontrolleri %20, süre uygunluğu %20, tutarlılık %20, varyans/
// revizyon %10. Hiçbir tek gösterge tek başına sonucu geçersiz kılmaz — yalnızca ağırlıklı
// bileşik skor ve (varsa) birleşik/istisnai kurallar (bkz. aşağı) skoru etkiler.
var PROFILE_QUALITY_WEIGHTS={completion:30,attention:20,timing:20,consistency:20,varianceRevision:10};
function profileAssessmentQualityCategory(score){
  if(score>=85) return 'high';
  if(score>=70) return 'adequate';
  if(score>=50) return 'limited';
  return 'low';
}
function scoreProfileAssessmentQuality(responses){
  responses=(responses&&typeof responses==='object')?responses:{};
  var items=profileAssessmentItems();
  var total=items.length||174;
  var byId={}; items.forEach(function(it){ byId[it.id]=it; });
  var answered=items.filter(function(it){ var r=responses[it.id]; return r&&typeof r.value==='number'; });

  // 1) Tamamlama
  var completionRate=total?answered.length/total:0;

  // 2) Dikkat kontrolleri (qualityControl:true VE expectedResponse sayısal olan maddeler)
  var attentionItems=items.filter(function(it){ return it.qualityControl&&it.expectedResponse!=null; });
  var attentionPassed=attentionItems.filter(function(it){ var r=responses[it.id]; return r&&r.value===it.expectedResponse; });
  var attentionChecks=attentionPassed.length;
  var attentionTotal=attentionItems.length;
  // Dürüst çaba maddesi (qualityControl:true, expectedResponse:null — "doğru" cevap yok, öz-bildirim)
  var honestItem=items.filter(function(it){ return it.qualityControl&&it.expectedResponse==null; })[0]||null;
  var honestResp=honestItem&&responses[honestItem.id];

  // 3) 700ms altı yanıt oranı (yalnızca cevaplanmış maddeler üzerinden)
  var fastCount=answered.filter(function(it){ var r=responses[it.id]; return typeof r.responseMs==='number'&&r.responseMs<700; }).length;
  var fastResponseRate=answered.length?fastCount/answered.length:0;

  // 4) 12+ aynı RAW cevap serisi (global madde sırasında, straightlining — scoredValue değil,
  // gerçek tıklama düzenini yansıtsın diye ham value kullanılır)
  var longestSameAnswerRun=0,curRun=0,prevVal=null;
  items.forEach(function(it){
    var r=responses[it.id];
    if(!r||typeof r.value!=='number'){ curRun=0; prevVal=null; return; }
    curRun=(prevVal!==null&&r.value===prevVal)?curRun+1:1;
    if(curRun>longestSameAnswerRun) longestSameAnswerRun=curRun;
    prevVal=r.value;
  });

  // 5) Tutarlılık: 2+ maddeli her facet'te (ters puanlama uygulanmış) scored value'ların
  // standart sapması — küçük sapma yüksek tutarlılık demektir (özellikle ters/karşıt madde
  // çiftlerinin aynı yönde hizalanıp hizalanmadığını yansıtır).
  var PA=window.ProfileAssessmentV1;
  var facetMapAll=(PA&&PA.scoring&&PA.scoring.constructs)||{};
  var facetConsistencies=[];
  Object.keys(facetMapAll).forEach(function(c){
    Object.keys(facetMapAll[c]).forEach(function(f){
      var ids=facetMapAll[c][f];
      if(!ids||ids.length<2) return;
      var vals=[];
      ids.forEach(function(id){
        var it=byId[id], r=responses[id];
        if(it&&r&&typeof r.value==='number'){ var s=scoreProfileItem(it,r.value); if(s!=null) vals.push(s); }
      });
      if(vals.length<2) return;
      var mean=vals.reduce(function(a,b){return a+b;},0)/vals.length;
      var variance=vals.reduce(function(a,b){return a+(b-mean)*(b-mean);},0)/vals.length;
      var sd=Math.sqrt(variance);
      facetConsistencies.push(Math.max(0,1-Math.min(1,sd/3))); // sd 0..3 aralığına kırpılıp tersine çevrilir
    });
  });
  var consistency=facetConsistencies.length?(facetConsistencies.reduce(function(a,b){return a+b;},0)/facetConsistencies.length):null;

  // 6) Revizyon oranı
  var revisedCount=answered.filter(function(it){ var r=responses[it.id]; return (r.revisionCount||0)>0; }).length;
  var revisionRate=answered.length?revisedCount/answered.length:0;

  // ── ağırlıklı bileşik skor ──
  var W=PROFILE_QUALITY_WEIGHTS;
  var completionScore=completionRate*100;
  var attentionScore=attentionTotal?(attentionChecks/attentionTotal)*100:100;
  var timingScore=Math.max(0,Math.min(100,100-Math.max(0,(fastResponseRate-0.25))*200)); // %25'e kadar ceza yok
  var consistencyScore=(consistency==null)?100:consistency*100; // yeterli çok-maddeli facet yoksa nötr
  var varianceRevisionScore=100;
  var warnings=[];
  if(longestSameAnswerRun>=12){
    varianceRevisionScore-=40;
    warnings.push('Uzun bir seri boyunca aynı seçenek işaretlenmiş ('+longestSameAnswerRun+' madde) — tek başına geçersiz saymıyoruz, yorumlarken dikkate al.');
  }
  if(revisionRate>0.5){
    varianceRevisionScore-=20;
    warnings.push('Maddelerin yarısından fazlası yeniden cevaplanmış — dikkatli bir gözden geçirme de olabilir.');
  }
  varianceRevisionScore=Math.max(0,varianceRevisionScore);

  var score=(completionScore*W.completion+attentionScore*W.attention+timingScore*W.timing+consistencyScore*W.consistency+varianceRevisionScore*W.varianceRevision)/100;

  // ── istisnai/birleşik kurallar (tek bayrak asla otomatik iptal etmez) ──
  if(attentionTotal>0&&attentionChecks<attentionTotal){
    warnings.push((attentionTotal-attentionChecks)+' dikkat kontrolü kaçırılmış — tek başına geçersiz saymıyoruz.');
  }
  if(attentionTotal>0&&attentionChecks===0&&fastResponseRate>0.25){
    score-=15; // İKİ dikkat hatası + yüksek hız BİRLİKTE → güven düşürülür (kural gereği)
    warnings.push('İki dikkat kontrolü de kaçmış ve hızlı yanıt oranı yüksek — güven ayrıca düşürüldü.');
  }
  if(honestItem&&honestResp&&typeof honestResp.value==='number'&&honestResp.value<=2){
    score-=5;
    warnings.push('Son maddede kendi yanıtlama tarzını daha düşük değerlendirmiş — sonuçları yorumlarken göz önünde bulundur.');
  }
  if(completionRate<1){
    warnings.push('Değerlendirme tam tamamlanmadan hesaplanmış ('+answered.length+'/'+total+').');
  }

  score=Math.max(0,Math.min(100,Math.round(score)));
  return {
    score:score,
    category:profileAssessmentQualityCategory(score),
    completionRate:Math.round(completionRate*1000)/1000,
    fastResponseRate:Math.round(fastResponseRate*1000)/1000,
    attentionChecks:attentionChecks,
    longestSameAnswerRun:longestSameAnswerRun,
    consistency:(consistency==null)?null:Math.round(consistency*1000)/1000,
    revisionRate:Math.round(revisionRate*1000)/1000,
    warnings:warnings
  };
}

// ---------- Profil Değerlendirmesi: deterministik rapor üretimi (Faz 09) ----------
// LLM YOK — tamamen şablon + kural tabanlı, girdiye göre metin dilimleri seçilir (aynı
// scores/quality → aynı rapor). Ham hassas yanıtlar hiçbir yere (dış servis dahil)
// gönderilmez; yalnızca zaten hesaplanmış özet skorlar okunur. Dil kuralları (scoring/
// REPORTING_RULES.md ile birebir): "kesinlikle böylesiniz" YOK, "sağlıksız/bozukluk/tanı"
// (tanı YALNIZCA "bu değerlendirme tanı değildir" reddiyesinde geçer) YOK, ahlaki üstünlük/
// işe alınabilirlik hükmü YOK.
function profileBand(mean){
  if(mean==null||typeof mean!=='number') return null;
  if(mean>=5.5) return 'high';
  if(mean<=2.5) return 'low';
  return 'moderate';
}
function profileBandLabel(band){
  return band==='high'?'belirgin biçimde yüksek':(band==='low'?'ortalamanın altında':'dengeli/orta');
}
function profileConstructSentence(label,mean){
  if(mean==null) return 'Bu alanda yeterli veri toplanamadı (madde tamamlama eşiğinin altında kaldı); yorum yapılmıyor.';
  var band=profileBand(mean);
  return 'Yanıtların, '+label+' boyutunda '+profileBandLabel(band)+' bir eğilim düşündürüyor (ort. '+mean.toFixed(1)+'/7).';
}
// Her construct için: label (rapor dilinde ad), ve HIGH/LOW bantlarında üretilecek isteğe
// bağlı güçlü-yön / aşırı-kullanım-riski / gelişim-önerisi cümleleri. Bir alan yalnızca
// kendisi için tanımlı olan alanlara katkı verir (ör. negative_emotionality yüksekken
// "güçlü yön" ÜRETMEZ, yalnızca risk+gelişim önerisi üretir — yüksek hassasiyet bir zayıflık
// olarak damgalanmadan, dikkat gerektiren bir eğilim olarak çerçevelenir).
var PROFILE_CONSTRUCT_NARRATIVE={
  conscientiousness:{label:'öz-yönetim ve düzen',
    strengthHigh:'İşleri düzenli, sorumlu ve takip edilebilir biçimde yürütme eğilimi güçlü bir yön olarak öne çıkıyor.',
    overuseHigh:'Bu eğilim aşırılaştığında esneklik kaybı veya aşırı kontrol ihtiyacı riski doğabilir.',
    growthLow:'Küçük, somut planlama alışkanlıkları (gün başında birkaç öncelik belirlemek gibi) bu alanda destekleyici olabilir.'},
  negative_emotionality:{label:'duygusal hassasiyet',
    overuseHigh:'Duygusal iniş çıkışlar bazı bağlamlarda yoğun hissedilebilir; bu bir zayıflık değil, dikkat ve destekleyici baş etme stratejileri gerektirebilecek bir eğilimdir.',
    growthHigh:'Zorlayıcı anlarda kısa bir duraklama/nefes pratiği veya güvenilir biriyle paylaşım, bu eğilimi yönetmede destekleyici olabilir.'},
  extraversion:{label:'sosyal enerji ve girişkenlik',
    strengthHigh:'Sosyal ortamlarda rahat hissetme ve girişkenlik gösterme eğilimi güçlü bir yön olarak öne çıkıyor.',
    overuseHigh:'Bu eğilim aşırılaştığında yalnız kalma/dinlenme ihtiyacının ihmal edilmesi riski doğabilir.',
    growthLow:'Küçük, tanıdık sosyal ortamlarda adım adım daha fazla görünür olmak bu alanda destekleyici olabilir.'},
  agreeableness:{label:'uyum, güven ve şefkat',
    strengthHigh:'Başkalarının bakış açısını anlama ve şefkatli yaklaşma eğilimi güçlü bir yön olarak öne çıkıyor.',
    overuseHigh:'Bu eğilim aşırılaştığında kendi ihtiyaçlarını geri plana atma veya sınır koymakta zorlanma riski doğabilir.',
    growthLow:'Karşılıklı güveni küçük adımlarla test etmek bu alanda destekleyici olabilir.'},
  social_communication:{label:'iletişim ve çatışma yönetimi tarzı',
    strengthHigh:'Dinleme, geri bildirime açıklık ve ilişki onarma becerisi güçlü bir yön olarak öne çıkıyor.',
    overuseHigh:null,
    growthLow:'Duygu ve ihtiyaçları daha doğrudan ifade etme pratiği bu alanda destekleyici olabilir.'},
  open_mindedness:{label:'açık fikirlilik ve merak',
    strengthHigh:'Yeni fikirlere, deneyimlere ve estetik ayrıntılara açıklık güçlü bir yön olarak öne çıkıyor.',
    overuseHigh:'Bu eğilim aşırılaştığında dağınıklık veya bir konuyu sonuçlandıramama riski doğabilir.',
    growthLow:'Küçük, tanıdık olmayan deneyimlerle başlamak bu alanda destekleyici olabilir.'},
  honesty_humility:{label:'dürüstlük ve alçakgönüllülük',
    strengthHigh:'Adil davranma ve gösterişten kaçınma eğilimi güçlü bir yön olarak öne çıkıyor.',
    overuseHigh:null,
    growthLow:'Kendi katkılarını daha açık biçimde ifade etmek bu alanda destekleyici olabilir.'},
  epistemic_character:{label:'epistemik tutum (bilgiye ve hataya yaklaşım)',
    strengthHigh:'Kanıtı dikkate alma ve hatayı kabul edebilme eğilimi güçlü bir yön olarak öne çıkıyor.',
    overuseHigh:'Bu eğilim aşırılaştığında aşırı temkinlilik veya karar erteleme riski doğabilir.',
    growthLow:'Emin olunmayan noktalarda bunu açıkça belirtme alışkanlığı bu alanda destekleyici olabilir.'},
  motivation:{label:'motivasyon kaynakları',
    strengthHigh:'İçsel/özerk motivasyon kaynaklarına dayanma eğilimi güçlü bir yön olarak öne çıkıyor.',
    overuseHigh:null,
    growthLow:'Yapılan işi kişisel anlamla ilişkilendirecek küçük hatırlatıcılar bu alanda destekleyici olabilir.'},
  cognitive_style:{label:'bilişsel stil',
    strengthHigh:'Karmaşık konuları analiz etme ve kanıt arama eğilimi güçlü bir yön olarak öne çıkıyor.',
    overuseHigh:'Bu eğilim aşırılaştığında aşırı analiz/karar erteleme riski doğabilir.',
    growthLow:'Küçük kararlarda bilinçli olarak sezgiye biraz daha yer açmak bu alanda destekleyici olabilir.'},
  decision_style:{label:'karar verme tarzı',
    strengthHigh:'Kararları sistematik ve gerekçeli biçimde verme eğilimi güçlü bir yön olarak öne çıkıyor.',
    overuseHigh:'Bu eğilim aşırılaştığında karar sonrası aşırı sorgulama (ruminasyon) riski doğabilir.',
    growthLow:'Küçük kararlar için kendine kısa bir süre sınırı koymak bu alanda destekleyici olabilir.'},
  metacognition:{label:'öz-farkındalık (meta-biliş)',
    strengthHigh:'Kendi düşünme sürecini gözlemleme ve gerektiğinde güncelleme eğilimi güçlü bir yön olarak öne çıkıyor.',
    overuseHigh:null,
    growthLow:'Gün sonunda kısa bir "bugün ne öğrendim" değerlendirmesi bu alanda destekleyici olabilir.'},
  work_style:{label:'çalışma tarzı',
    strengthHigh:'Odaklanma, tamamlama ve önceliklendirme eğilimi güçlü bir yön olarak öne çıkıyor.',
    overuseHigh:'Bu eğilim aşırılaştığında dinlenme sınırlarının ihmal edilmesi riski doğabilir.',
    growthLow:'İşi küçük, tamamlanabilir adımlara bölmek bu alanda destekleyici olabilir.'},
  relationship_skills:{label:'ilişki becerileri',
    strengthHigh:'Yakınlığı tolere etme ve ilişkide onarım yapabilme eğilimi güçlü bir yön olarak öne çıkıyor.',
    overuseHigh:null,
    growthLow:'İhtiyaçları küçük adımlarla, doğrudan ifade etme pratiği bu alanda destekleyici olabilir.'},
  emotion_regulation:{label:'duygu düzenleme',
    strengthHigh:'Duyguları fark etme ve yeniden çerçeveleme (reappraisal) eğilimi güçlü bir yön olarak öne çıkıyor.',
    overuseHigh:null,
    growthLow:'Zorlayıcı bir duyguyu isimlendirmekle başlamak bu alanda destekleyici olabilir.'},
  self_compassion:{label:'öz-şefkat',
    strengthHigh:'Zorlandığı anlarda kendine nazik yaklaşabilme eğilimi güçlü bir yön olarak öne çıkıyor.',
    overuseHigh:null,
    growthLow:'Zor bir anda kendine, bir arkadaşına söyleyeceğin cümleyi söylemeyi denemek bu alanda destekleyici olabilir.'}
};
function profileAssessmentContradictionNotes(scores){
  var notes=[];
  function facetMean(constructId,facetId){
    var c=scores.constructs[constructId];
    if(!c||!c.facets||!c.facets[facetId]||!c.facets[facetId].sufficient) return null;
    return c.facets[facetId].mean;
  }
  var sociability=facetMean('extraversion','sociability');
  var avoidance=scores.attachment&&scores.attachment.avoidance&&scores.attachment.avoidance.sufficient?scores.attachment.avoidance.mean:null;
  if(sociability!=null&&sociability>=5.5&&avoidance!=null&&avoidance>=5.5){
    notes.push('Sosyal ortamlarda rahat görünme eğilimi ile yakın ilişkilerde temkinli/mesafeli kalma eğiliminin bir arada olması bir çelişki değildir — kişi sosyal olabilir ve aynı zamanda duygusal yakınlığı daha ihtiyatlı açabilir.');
  }
  var achievement=(scores.values&&scores.values.raw&&scores.values.raw.achievement&&scores.values.raw.achievement.sufficient)?scores.values.raw.achievement.mean:null;
  var procrastination=facetMean('work_style','procrastination');
  if(achievement!=null&&achievement>=5.5&&procrastination!=null&&procrastination>=5.5){
    notes.push('Başarıya yüksek değer verme ile işe başlamayı erteleme eğiliminin bir arada olması bir çelişki değildir — yüksek standartlar bazen başlangıcı zorlaştırabilir.');
  }
  var compassion=facetMean('agreeableness','compassion');
  var boundarySetting=facetMean('relationship_skills','boundary_setting');
  if(compassion!=null&&compassion>=5.5&&boundarySetting!=null&&boundarySetting>=5.5){
    notes.push('Güçlü empati ile güçlü sınır ihtiyacının bir arada olması bir çelişki değildir — başkalarını önemsemek, kendi sınırlarını korumakla birlikte var olabilir.');
  }
  return notes;
}
function buildProfileReport(scores,quality){
  scores=scores||{};
  quality=quality||{constructs:{}};
  var C=scores.constructs||{};
  function bandOf(constructId){ return C[constructId]&&C[constructId].sufficient?C[constructId].mean:null; }
  function sentenceFor(constructId){
    var meta=PROFILE_CONSTRUCT_NARRATIVE[constructId]||{label:constructId};
    return profileConstructSentence(meta.label,bandOf(constructId));
  }

  // 1) Ölçüm güveni
  var qCat=quality&&quality.category;
  var confidenceBody='Bu raporun güven düzeyi "'+(qCat||'bilinmiyor')+'" olarak değerlendirildi (0-100 üzerinden '+(quality&&quality.score!=null?quality.score:'—')+'). '+
    'Bu değerlendirme klinik bir tanı değildir; öz-bildirime dayalı bir profildir.';
  if(qCat==='low'){ confidenceBody+=' Güven düzeyi düşük çıktığı için bu rapor bir ön değerlendirme olarak okunmalı; sonuçlar dikkatli yorumlanmalı ve istenirse değerlendirme daha sakin bir zamanda yeniden yapılabilir.'; }
  if(quality&&Array.isArray(quality.warnings)&&quality.warnings.length){ confidenceBody+=' Notlar: '+quality.warnings.join(' '); }

  // 2) Kısa karakter özeti (en fazla birkaç yapıyı birleştiren, kanıt taşıyan kısa sentez)
  var summaryParts=[];
  ['conscientiousness','extraversion','agreeableness','open_mindedness'].forEach(function(c){
    var m=bandOf(c); if(m!=null) summaryParts.push(profileConstructSentence(PROFILE_CONSTRUCT_NARRATIVE[c].label,m));
  });
  var contradictions=profileAssessmentContradictionNotes(scores);
  var summaryBody=(summaryParts.slice(0,2).join(' ')||'Genel bir özet için yeterli veri yok.')+(contradictions.length?(' '+contradictions.join(' ')):'');

  // 3) Big Five alanları
  var bigFive=['conscientiousness','negative_emotionality','extraversion','agreeableness','open_mindedness'].map(sentenceFor).join(' ');

  // 4) Karakter bütünlüğü ve epistemik yaklaşım
  var integrity=['honesty_humility','epistemic_character'].map(sentenceFor).join(' ');

  // 5) RIASEC ilk üç alan
  var RIASEC_LABELS={realistic:'Gerçekçi (uygulamalı/teknik)',investigative:'Araştırmacı',artistic:'Sanatsal',social:'Sosyal',enterprising:'Girişimci',conventional:'Düzenleyici (yapılandırılmış)'};
  var riasec=scores.riasec||{};
  var riasecBody;
  if(riasec.topThree&&riasec.topThree.length){
    riasecBody='İlgi profilinde öne çıkan ilk üç alan: '+riasec.topThree.map(function(c){return RIASEC_LABELS[c]||c;}).join(', ')+'. ';
    if(riasec.differentiation!=null){
      riasecBody+='Alanlar arası farklılaşma '+riasec.differentiation.toFixed(1)+' puan; '+(riasec.differentiation<1?'ilgiler oldukça dengeli dağılmış.':'bazı alanlar diğerlerinden belirgin biçimde öne çıkıyor.');
    }
  } else {
    riasecBody='İlgi alanları için yeterli veri toplanamadı.';
  }

  // 6) Değer öncelikleri (kişi-merkezli centered skorlara göre, ahlaki sıralama YOK)
  var VALUE_LABELS={self_direction:'özerklik',stimulation:'uyarılma/çeşitlilik',achievement:'başarı',power_influence:'güç/etki',security:'güvenlik',tradition_conformity:'gelenek/uyum',benevolence:'iyilikseverlik',universalism:'evrensellik'};
  var values=scores.values||{centered:{}};
  var centeredEntries=Object.keys(values.centered||{}).filter(function(k){return values.centered[k]!=null;}).sort(function(a,b){return values.centered[b]-values.centered[a];});
  var topValues=centeredEntries.slice(0,3).map(function(k){return VALUE_LABELS[k]||k;});
  var valuesBody=topValues.length?('Diğer değerlerine göre öne çıkan öncelikleri: '+topValues.join(', ')+'. Bu bir "daha iyi insan" sıralaması değildir; yalnızca kişinin kendi içindeki göreli önceliği yansıtır.'):'Değer öncelikleri için yeterli veri toplanamadı.';

  // 7) Motivasyon kaynakları
  var motivation=sentenceFor('motivation');

  // 8) Bilişsel stil ve karar verme
  var cognitiveDecision=['cognitive_style','decision_style'].map(sentenceFor).join(' ');

  // 9) Çalışma tarzı
  var workStyle=sentenceFor('work_style');

  // 10) Bağlanma kaygısı ve kaçınması (+ ilişki becerileri notu)
  var att=scores.attachment||{};
  var anxietyMean=att.anxiety&&att.anxiety.sufficient?att.anxiety.mean:null;
  var avoidanceMean=att.avoidance&&att.avoidance.sufficient?att.avoidance.mean:null;
  var attachmentBody='Bağlanma kaygısı: '+profileConstructSentence('bağlanma kaygısı',anxietyMean)+' Bağlanma kaçınması: '+profileConstructSentence('yakınlıktan kaçınma',avoidanceMean)+
    ' Burada bir "güvenli/kaygılı/kaçıngan" kategorisi zorunlu tutulmuyor; iki eksen ayrı ayrı değerlendiriliyor.'+
    ' '+sentenceFor('relationship_skills');

  // 11) Duygu düzenleme ve öz-şefkat (+ ayrı, karışmayan güncel bağlam notu)
  var emotionBody=[sentenceFor('emotion_regulation'),sentenceFor('self_compassion'),sentenceFor('metacognition')].join(' ');
  var wb=scores.wellbeingContext;
  if(wb&&wb.sufficient){
    emotionBody+=' Güncel bağlam: son dönemki yük/toparlanma düzeyi yanıtları da alındı (ort. '+wb.mean.toFixed(1)+'/7); bu, KALICI bir kişilik özelliği değil, şu anki dönemle ilgili bir bağlam notudur ve yukarıdaki kalıcı eğilim tanımlarına karıştırılmamıştır.';
  }

  // 12-14) Güçlü yönler / aşırı kullanım riskleri / gelişim önerileri
  var strengths=[],overuseRisks=[],growth=[];
  Object.keys(PROFILE_CONSTRUCT_NARRATIVE).forEach(function(c){
    var meta=PROFILE_CONSTRUCT_NARRATIVE[c], band=profileBand(bandOf(c));
    if(band==='high'){
      if(meta.strengthHigh) strengths.push(meta.strengthHigh);
      if(meta.overuseHigh) overuseRisks.push(meta.overuseHigh);
      if(meta.growthHigh) growth.push(meta.growthHigh);
    } else if(band==='low'&&meta.growthLow){
      growth.push(meta.growthLow);
    }
  });
  var strengthsBody=strengths.length?strengths.join(' '):'Belirgin biçimde öne çıkan tek bir güçlü yön paterni bu veri setiyle ayırt edilemedi; bu bir eksiklik değildir.';
  var overuseBody=overuseRisks.length?overuseRisks.join(' '):'Belirgin bir aşırı kullanım riski paterni öne çıkmıyor.';
  var growthBody=growth.length?growth.join(' '):'Şu an için öne çıkan somut bir gelişim alanı işaretlenmedi.';

  // 15) Sınırlamalar (sabit, deterministik)
  var limitationsBody='Bu rapor; doğrulanmış klinik norm veya yüzdelik içermez, öz-bildirime dayalıdır, tek bir zaman noktasını yansıtır ve psikometrik doğrulama sürecinden geçmemiş özgün maddeler kullanır. Bu değerlendirme tanı değildir; bir uzmanın klinik değerlendirmesinin yerini tutmaz.';

  return {
    version:'1.0.0',
    generatedAt:new Date().toISOString(),
    preliminary:qCat==='low',
    sections:{
      measurementConfidence:{title:'Ölçüm güveni',body:confidenceBody},
      characterSummary:{title:'Kısa karakter özeti',body:summaryBody},
      bigFive:{title:'Big Five alanları',body:bigFive},
      characterIntegrity:{title:'Karakter bütünlüğü ve epistemik yaklaşım',body:integrity},
      riasec:{title:'RIASEC ilk üç alan',body:riasecBody},
      values:{title:'Değer öncelikleri',body:valuesBody},
      motivation:{title:'Motivasyon kaynakları',body:motivation},
      cognitiveDecision:{title:'Bilişsel stil ve karar verme',body:cognitiveDecision},
      workStyle:{title:'Çalışma tarzı',body:workStyle},
      attachment:{title:'Bağlanma kaygısı ve kaçınması',body:attachmentBody},
      emotionRegulation:{title:'Duygu düzenleme ve öz-şefkat',body:emotionBody},
      strengths:{title:'Güçlü yönler',body:strengthsBody},
      overuseRisks:{title:'Aşırı kullanım riskleri',body:overuseBody},
      growthSuggestions:{title:'Gelişim önerileri',body:growthBody},
      limitations:{title:'Sınırlamalar',body:limitationsBody}
    }
  };
}

var BOOK_GENRES=['Roman','Klasik','Kişisel gelişim','Şiir','Öykü','Bilim','Tarih','Felsefe','Polisiye','Fantastik'];
var TITLE_GENRES=['Dram','Komedi','Aksiyon','Bilimkurgu','Gerilim','Romantik','Belgesel','Fantastik','Animasyon','Suç'];
function normBook(b){ if(!b||typeof b!=='object') return null; if(!b.id) b.id=uid('b'); b.title=String(b.title==null?'':b.title); b.author=String(b.author==null?'':b.author); b.genre=String(b.genre==null?'':b.genre); if(!b.emoji) b.emoji=''; b.totalPages=(b.totalPages==null||b.totalPages==='')?null:Math.max(0,Math.round(Number(b.totalPages)||0)); b.currentPage=Math.max(0,Math.round(Number(b.currentPage)||0)); if(['reading','finished','dropped'].indexOf(b.status)<0) b.status='reading'; b.rating=(b.rating==null||b.rating==='')?null:Math.max(1,Math.min(5,Math.round(Number(b.rating)||0))); if(typeof b.note!=='string') b.note=''; if(!Array.isArray(b.quotes)) b.quotes=[]; if(b.startedAt===undefined) b.startedAt=null; if(b.finishedAt===undefined) b.finishedAt=null; if(!b.createdAt) b.createdAt=new Date().toISOString(); return b; }
function normTitle(t){ if(!t||typeof t!=='object') return null; if(!t.id) t.id=uid('w'); t.title=String(t.title==null?'':t.title); if(t.kind!=='film'&&t.kind!=='dizi') t.kind='film'; t.genre=String(t.genre==null?'':t.genre); if(!t.emoji) t.emoji=''; t.totalEp=(t.totalEp==null||t.totalEp==='')?null:Math.max(0,Math.round(Number(t.totalEp)||0)); t.watchedEp=Math.max(0,Math.round(Number(t.watchedEp)||0)); if(['watching','finished','dropped'].indexOf(t.status)<0) t.status='watching'; t.rating=(t.rating==null||t.rating==='')?null:Math.max(1,Math.min(5,Math.round(Number(t.rating)||0))); if(typeof t.note!=='string') t.note=''; if(!Array.isArray(t.quotes)) t.quotes=[]; if(t.startedAt===undefined) t.startedAt=null; if(t.finishedAt===undefined) t.finishedAt=null; if(!t.createdAt) t.createdAt=new Date().toISOString(); return t; }
function ensureLibrary(){ if(!data.library||typeof data.library!=='object') data.library=emptyLibrary(); if(!Array.isArray(data.library.books)) data.library.books=[]; if(!data.library.goal||typeof data.library.goal!=='object') data.library.goal={dailyPages:20,yearlyBooks:null}; return data.library; }
function ensureWatchlist(){ if(!data.watchlist||typeof data.watchlist!=='object') data.watchlist=emptyWatchlist(); if(!Array.isArray(data.watchlist.items)) data.watchlist.items=[]; if(!data.watchlist.goal||typeof data.watchlist.goal!=='object') data.watchlist.goal={dailyMinutes:40,yearlyTitles:null}; return data.watchlist; }
function findBook(id){ var L=ensureLibrary(); for(var i=0;i<L.books.length;i++){ if(L.books[i]&&L.books[i].id===id) return L.books[i]; } return null; }
function findTitle(id){ var W=ensureWatchlist(); for(var i=0;i<W.items.length;i++){ if(W.items[i]&&W.items[i].id===id) return W.items[i]; } return null; }
function normTrack(x){ if(!x||typeof x!=='object') return null; if(!x.id) x.id=uid('m'); x.title=String(x.title==null?'':x.title); x.artist=String(x.artist==null?'':x.artist); if(['sarki','album','podcast'].indexOf(x.kind)<0) x.kind='sarki'; x.genre=String(x.genre==null?'':x.genre); if(!x.emoji) x.emoji=''; x.rating=(x.rating==null||x.rating==='')?null:Math.max(1,Math.min(5,Math.round(Number(x.rating)||0))); if(!Array.isArray(x.quotes)) x.quotes=[]; if(!x.createdAt) x.createdAt=new Date().toISOString(); return x; }
function ensureMusic(){ if(!data.music||typeof data.music!=='object') data.music=emptyMusic(); if(!Array.isArray(data.music.items)) data.music.items=[]; if(!data.music.goal||typeof data.music.goal!=='object') data.music.goal={dailyMinutes:30,yearlyTitles:null}; return data.music; }
function findTrack(id){ var M=ensureMusic(); for(var i=0;i<M.items.length;i++){ if(M.items[i]&&M.items[i].id===id) return M.items[i]; } return null; }
function bookPct(b){ if(!b||!b.totalPages||b.totalPages<=0) return b&&b.status==='finished'?100:0; return Math.max(0,Math.min(100,Math.round((b.currentPage/b.totalPages)*100))); }
function titlePct(t){ if(!t) return 0; if(!t.totalEp||t.totalEp<=0) return t.status==='finished'?100:0; return Math.max(0,Math.min(100,Math.round((t.watchedEp/t.totalEp)*100))); }
// istatistik
function libStats(){ var L=ensureLibrary(); var yr=new Date().getFullYear(),reading=0,finished=0,dropped=0,finYear=0; L.books.forEach(function(b){ if(b.status==='finished'){ finished++; if(b.finishedAt&&new Date(b.finishedAt).getFullYear()===yr) finYear++; } else if(b.status==='dropped') dropped++; else reading++; }); return {reading:reading,finished:finished,dropped:dropped,finYear:finYear,total:L.books.length}; }
function readTotals(){ var pages=0,minutes=0,days=0; for(var d in data.days){ var st=readingStats(data.days[d]); if(st.count>0){ days++; pages+=st.pages; minutes+=st.minutes; } } return {pages:pages,minutes:minutes,days:days}; }
function hasRead(date){ var r=data.days[date]; return !!(r&&r.reading&&Array.isArray(r.reading.entries)&&r.reading.entries.length>0); }
function readStreak(){ var c=todayStr(); if(!hasRead(c)) c=addDays(c,-1); var n=0,guard=0; while(hasRead(c)&&guard++<4000){ n++; c=addDays(c,-1); } return n; }
function weekReading(){ var out=[],t=todayStr(); for(var i=6;i>=0;i--){ var d=addDays(t,-i); out.push({date:d,pages:readingStats(data.days[d]).pages,label:shortDate(d)}); } return out; }
function todayReadPages(){ return readingStats(data.days[todayStr()]).pages; }
function allQuotes(){ var L=ensureLibrary(),out=[]; L.books.forEach(function(b){ (b.quotes||[]).forEach(function(q){ out.push({bookId:b.id,title:b.title,emoji:b.emoji,q:q}); }); }); out.sort(function(a,b){ return String(b.q.ts||'').localeCompare(String(a.q.ts||'')); }); return out; }
function watchStats(){ var W=ensureWatchlist(); var yr=new Date().getFullYear(),watching=0,finished=0,dropped=0,finYear=0; W.items.forEach(function(t){ if(t.status==='finished'){ finished++; if(t.finishedAt&&new Date(t.finishedAt).getFullYear()===yr) finYear++; } else if(t.status==='dropped') dropped++; else watching++; }); return {watching:watching,finished:finished,dropped:dropped,finYear:finYear,total:W.items.length}; }
function watchDayStats(rec){ var en=(rec&&rec.watching&&Array.isArray(rec.watching.entries))?rec.watching.entries:[]; var minutes=0,eps=0; en.forEach(function(e){ if(!e) return; var m=Number(e.minutes); if(!isNaN(m)&&m>0) minutes+=m; var ep=Number(e.episodes); if(!isNaN(ep)&&ep>0) eps+=ep; }); return {count:en.length,minutes:minutes,eps:eps,entries:en}; }
function watchTotals(){ var minutes=0,eps=0,days=0; for(var d in data.days){ var st=watchDayStats(data.days[d]); if(st.count>0){ days++; minutes+=st.minutes; eps+=st.eps; } } return {minutes:minutes,eps:eps,days:days}; }
function hasWatch(date){ var r=data.days[date]; return !!(r&&r.watching&&Array.isArray(r.watching.entries)&&r.watching.entries.length>0); }
function watchStreak(){ var c=todayStr(); if(!hasWatch(c)) c=addDays(c,-1); var n=0,guard=0; while(hasWatch(c)&&guard++<4000){ n++; c=addDays(c,-1); } return n; }
function weekWatch(){ var out=[],t=todayStr(); for(var i=6;i>=0;i--){ var d=addDays(t,-i); out.push({date:d,minutes:watchDayStats(data.days[d]).minutes,label:shortDate(d)}); } return out; }
function todayWatchMin(){ return watchDayStats(data.days[todayStr()]).minutes; }
function allReplicas(){ var W=ensureWatchlist(),out=[]; W.items.forEach(function(t){ (t.quotes||[]).forEach(function(q){ out.push({itemId:t.id,title:t.title,emoji:t.emoji,q:q}); }); }); out.sort(function(a,b){ return String(b.q.ts||'').localeCompare(String(a.q.ts||'')); }); return out; }
function listenDayStats(rec){ var en=(rec&&rec.listening&&Array.isArray(rec.listening.entries))?rec.listening.entries:[]; var minutes=0; en.forEach(function(e){ if(!e) return; var m=Number(e.minutes); if(!isNaN(m)&&m>0) minutes+=m; }); return {count:en.length,minutes:minutes,entries:en}; }
function listenTotals(){ var minutes=0,items=0,days=0; for(var d in data.days){ var st=listenDayStats(data.days[d]); if(st.count>0){ days++; minutes+=st.minutes; items+=st.count; } } return {minutes:minutes,items:items,days:days}; }
function hasListen(date){ var r=data.days[date]; return !!(r&&r.listening&&Array.isArray(r.listening.entries)&&r.listening.entries.length>0); }
function weekListen(){ var out=[],t=todayStr(); for(var i=6;i>=0;i--){ var d=addDays(t,-i); out.push({date:d,minutes:listenDayStats(data.days[d]).minutes,label:shortDate(d)}); } return out; }
function listenStreak(){ var c=todayStr(); if(!hasListen(c)) c=addDays(c,-1); var n=0,guard=0; while(hasListen(c)&&guard++<4000){ n++; c=addDays(c,-1); } return n; }
function musicStats(){ var M=ensureMusic(); var byKind={sarki:0,album:0,podcast:0}; M.items.forEach(function(x){ if(byKind[x.kind]!=null) byKind[x.kind]++; }); return {total:M.items.length,sarki:byKind.sarki,album:byKind.album,podcast:byKind.podcast}; }
function allLyrics(){ var M=ensureMusic(),out=[]; M.items.forEach(function(x){ (x.quotes||[]).forEach(function(q){ out.push({itemId:x.id,title:x.title,emoji:x.emoji,artist:x.artist,q:q}); }); }); out.sort(function(a,b){ return String(b.q.ts||'').localeCompare(String(a.q.ts||'')); }); return out; }
function fmtDur(min){ min=Math.max(0,Math.round(Number(min)||0)); if(min<60) return min+' dk'; var h=Math.floor(min/60),m=min%60; return h+' sa'+(m?' '+m+' dk':''); }
// ---------- ortak UI parçaları ----------
function segTabs(defs,active,fn,accent){ var grad=(accent==='watch')?'linear-gradient(135deg,#C88F4C,#E0B080)':(accent==='listen')?'linear-gradient(135deg,#0E9AA7,#2BC4C4)':'linear-gradient(135deg,#6E55BF,#9B7FC9)'; var glow=(accent==='watch')?'0 6px 14px rgba(200,143,76,0.30)':(accent==='listen')?'0 6px 14px rgba(14,154,167,0.30)':'0 6px 14px rgba(110,85,191,0.32)'; var h='<div style="display:flex;gap:4px;background:var(--icon);border-radius:14px;padding:4px;">'; defs.forEach(function(d){ var on=active===d[0]; h+='<button onclick="'+fn+'(\''+d[0]+'\')" style="flex:1;border:none;cursor:pointer;padding:8px 4px;border-radius:11px;font-size:12px;font-weight:800;white-space:nowrap;color:'+(on?'#fff':'var(--muted)')+';background:'+(on?grad:'transparent')+';box-shadow:'+(on?glow:'none')+';transition:all .18s;">'+d[1]+'</button>'; }); h+='</div>'; return h; }
function progBar(pct,col){ pct=Math.max(0,Math.min(100,Number(pct)||0)); col=col||'linear-gradient(90deg,#6E55BF,#E9AFC1)'; return '<div style="height:8px;border-radius:999px;background:var(--icon);overflow:hidden;"><div style="height:100%;width:'+pct+'%;border-radius:999px;background:'+col+';transition:width .4s;"></div></div>'; }
function starRow(rating,fn,id,size){ size=size||16; var h='<div style="display:flex;gap:3px;">'; for(var s=1;s<=5;s++){ var on=rating!=null&&s<=rating; h+='<button onclick="'+fn+'(\''+esc(id)+'\','+s+')" aria-label="'+s+' yıldız" style="border:none;background:none;cursor:pointer;padding:0;line-height:1;color:'+(on?'#F2B65A':'var(--faint)')+';opacity:'+(on?'1':'0.45')+';display:inline-flex;">'+icon('star',size)+'</button>'; } h+='</div>'; return h; }
function miniBars(rows,valKey,unit,col){ var max=1; rows.forEach(function(r){ if(r[valKey]>max) max=r[valKey]; }); var h='<div style="display:flex;align-items:flex-end;gap:6px;height:88px;">'; rows.forEach(function(r){ var v=r[valKey]||0; var hp=Math.round((v/max)*72)+4; var today=r.date===todayStr(); h+='<div style="flex:1;display:flex;flex-direction:column;align-items:center;gap:4px;justify-content:flex-end;"><div style="font-size:9.5px;color:var(--faint);font-weight:700;">'+(v>0?v:'')+'</div><div style="width:100%;max-width:26px;height:'+hp+'px;border-radius:7px;background:'+(v>0?(col||'linear-gradient(180deg,#9B7FC9,#6E55BF)'):'var(--icon)')+';'+(today?'outline:2px solid #E9AFC1;outline-offset:1px;':'')+'"></div><div style="font-size:9px;color:'+(today?'var(--accent)':'var(--faint)')+';font-weight:'+(today?'800':'600')+';">'+esc(r.label)+'</div></div>'; }); h+='</div>'; return h; }
function statTile(label,val,sub){ return '<div style="flex:1;min-width:0;background:var(--card);border:1px solid var(--card-bd);border-radius:16px;padding:12px 10px;text-align:center;"><div style="font-size:22px;font-weight:800;color:var(--text);line-height:1.1;font-variant-numeric:tabular-nums;">'+val+'</div><div style="font-size:11px;color:var(--muted);font-weight:700;margin-top:3px;">'+esc(label)+'</div>'+(sub?'<div style="font-size:10px;color:var(--faint);margin-top:1px;">'+esc(sub)+'</div>':'')+'</div>'; }
function spanEnd(){ var end=todayStr(); for(var d in data.days){ if(diffDays(d,end)<0) end=d; } return end; }
function allDays(){ var out=[],s=data.startDate; var n=Math.max(1,diffDays(s,spanEnd())+1); if(n>3000) n=3000; for(var i=0;i<n;i++){ var date=addDays(s,i); out.push({i:i+1,date:date,rec:data.days[date]||null}); } return out; }
function bestStreak(days){ var b=0,c=0; days.forEach(function(d){ if(countRec(d.rec)>=4){c++;b=Math.max(b,c);} else c=0; }); return b; }
function topMood(moods){ var k=null,m=0; for(var x in moods){ if(moods[x]>m){m=moods[x];k=x;} } var o=k?find(MOODS,'id',k):null; return o?o.label:'—'; }
function moodEmoji(id,size){ var o=find(MOODS,'id',id); return o?icon(o.icon,size||22):''; }
function find(arr,key,val){ for(var i=0;i<arr.length;i++){ if(arr[i][key]===val) return arr[i]; } return null; }
function currentStreak(){ var c=0,date=todayStr(); if(countRec(data.days[date])<4) date=addDays(date,-1); while(diffDays(data.startDate,date)>=0){ if(countRec(data.days[date])>=4){ c++; date=addDays(date,-1); } else break; } return c; }
function daysTracked(){ var n=0; for(var d in data.days){ var r=data.days[d]; if(countRec(r)>0||(r&&r.mood)||(r&&r.note)||(r&&r.intention)||(r&&r.meals&&(r.meals.breakfast||r.meals.lunch||r.meals.dinner||r.meals.snack))) n++; } return n; }
function syncConfigured(){ var s=data.settings||{}; return !!(s.ghToken&&s.ghRepo); }
function savedToday(){ return data.lastSyncDate===todayStr(); }
// Estetik "Gizle" pill'i; gizlenen kart Bugün'de kaybolur, Ayarlar > "Gizlenen kartlar"dan geri gelir.
function hidePill(which){
  return '<button onclick="event.stopPropagation();App.hideBugunCard(\''+which+'\')" aria-label="Gizle" title="Gizle" style="flex-shrink:0;border:none;cursor:pointer;background:rgba(150,110,120,0.12);color:var(--muted);font-size:11px;font-weight:800;letter-spacing:.2px;padding:6px 12px;border-radius:999px;line-height:1;">Gizle</button>';
}
function saveBanner(){
  if(!syncConfigured()){
    if(data.settings&&data.settings.hideRepoBanner) return '';
    return '<div id="sey-save-banner" class="glass" onclick="App.go(\'ayarlar\')" style="cursor:pointer;border-radius:18px;padding:13px 15px;display:flex;align-items:center;gap:11px;border:1px solid color-mix(in srgb,var(--warn) 48%, var(--card-bd));box-shadow:0 8px 22px rgba(229,72,77,0.10),inset 0 1px 0 rgba(255,255,255,0.3);"><span style="width:34px;height:34px;border-radius:11px;flex-shrink:0;display:inline-flex;align-items:center;justify-content:center;color:var(--warn);background:color-mix(in srgb,var(--warn) 14%, var(--icon));">'+icon('link-2',18)+'</span><div style="flex:1;min-width:0;"><div style="font-size:14px;font-weight:800;color:var(--text);">Repoya bağlan</div><div style="font-size:12px;color:var(--muted);line-height:1.35;">Verilerin kaydedilsin diye Ayarlar\'dan bir kez bağlan.</div></div>'+hidePill('repo')+'<span style="font-size:20px;color:var(--warn);font-weight:700;line-height:1;">›</span></div>';
  }
  if(savedToday()) return '<div id="sey-save-banner" style="background:rgba(143,191,138,0.16);border:1px solid rgba(143,191,138,0.4);border-radius:16px;padding:10px 14px;display:flex;align-items:center;gap:9px;"><span style="color:#3F8A4F;display:inline-flex;">'+icon('circle-check',17)+'</span><span style="font-size:13px;font-weight:600;color:var(--text2);">Bugün repoya kaydedildi. Harika.</span></div>';
  return '<div id="sey-save-banner" style="background:linear-gradient(135deg,#E9899F,#C9B8FF);border-radius:18px;padding:14px 15px;display:flex;align-items:center;gap:11px;box-shadow:0 10px 24px rgba(220,130,150,0.4);"><span style="display:inline-flex;">'+icon('map-pin',20)+'</span><div style="flex:1;min-width:0;"><div style="font-size:14.5px;font-weight:800;color:#fff;">Bugünü kaydet</div><div style="font-size:12px;color:rgba(255,255,255,0.92);line-height:1.35;">Günlük kayıt önemli — tek dokunuşla repoya gönder.</div></div><button onclick="App.saveToday()" style="border:none;cursor:pointer;background:rgba(255,255,255,0.95);color:#B05070;font-weight:800;font-size:13px;padding:9px 15px;border-radius:12px;flex-shrink:0;">Kaydet</button></div>';
}
function updateSaveBanner(){ var el=document.getElementById('sey-save-banner'); if(el){ var t=document.createElement('div'); t.innerHTML=saveBanner(); if(t.firstChild) el.replaceWith(t.firstChild); } }

// ---- Açılır/kapanır kart altyapısı: gereksiz tam render'lardan kaçınmak için
// yalnızca ilgili kartı yerinde günceller (updateSaveBanner deseni). ----
var CARD_BUILDERS={}; // key -> function(rec){ return html }
// Akıllı varsayılan: kullanıcı elle dokunmadıysa def'e göre aç/kapa; sonra kullanıcı kontrol eder.
function cardOpen(key, def){ if(ui.cards[key]===undefined) ui.cards[key]=false; return !!ui.cards[key]; }
function updateCardByKey(key){
  var el=document.querySelector('[data-cardkey="'+key+'"]');
  if(!el) return;
  var fn=CARD_BUILDERS[key]; if(!fn) return;
  var rec=data.days[activeDate()]||null;
  var t=document.createElement('div'); t.innerHTML=fn(rec);
  if(t.firstChild) el.replaceWith(t.firstChild);
}
// Ortak açılır/kapanır kart kabuğu (hava/terapi kartı deseni).
// title/subtitle/badge/body HTML olarak gelir; dinamik metni çağıran esc'ler.
function collapsibleCardHTML(o){
  var open=!!o.open, accent=o.accent||'var(--accent)';
  // iOS 26 liquid-glass: hafif renk çerçeve (color-mix) + açık/kapalı hâl farkı (yükseklik/gölge).
  var frame=open
    ? 'border:1px solid color-mix(in srgb,'+accent+' 40%, var(--card-bd));box-shadow:0 16px 40px rgba(108,74,58,0.11),inset 0 1px 0 rgba(255,255,255,0.45);'
    : 'border:1px solid color-mix(in srgb,'+accent+' 16%, var(--card-bd));box-shadow:0 5px 16px rgba(108,74,58,0.05),inset 0 1px 0 rgba(255,255,255,0.28);';
  var h='<div id="'+esc(o.id||('card-'+o.key))+'" class="glass sey-ccard" data-cardkey="'+esc(o.key)+'" data-open="'+(open?'1':'0')+'" style="border-radius:22px;padding:16px;display:flex;flex-direction:column;gap:12px;'+frame+(o.cardStyle||'')+'">';
  h+='<span class="sey-ccard-sheen" style="background:linear-gradient(90deg,transparent,'+accent+',transparent);"></span>';
  h+='<div onclick="App.toggleCard(\''+esc(o.key)+'\')" role="button" aria-expanded="'+(open?'true':'false')+'" style="cursor:pointer;display:flex;align-items:center;gap:11px;">';
  if(o.icon) h+='<span style="width:36px;height:36px;border-radius:12px;flex-shrink:0;display:inline-flex;align-items:center;justify-content:center;color:'+accent+';background:color-mix(in srgb,'+accent+' 14%, var(--icon));box-shadow:inset 0 1px 0 rgba(255,255,255,0.4);">'+o.icon+'</span>';
  h+='<div style="flex:1;min-width:0;"><div style="font-size:15.5px;font-weight:800;color:var(--text);line-height:1.15;">'+o.title+'</div>'+(o.subtitle?'<div style="font-size:11.5px;color:var(--faint);margin-top:2px;line-height:1.3;">'+o.subtitle+'</div>':'')+'</div>';
  if(o.badge) h+='<div style="flex-shrink:0;">'+o.badge+'</div>';
  h+='<span class="sey-collchev" style="color:'+accent+';display:inline-flex;flex-shrink:0;transition:transform .25s var(--ease-premium,ease);transform:rotate('+(open?'180deg':'0deg')+');">'+icon('chevron-down',16)+'</span>';
  h+='</div>';
  if(open){
    h+='<div class="sey-collbody" style="display:flex;flex-direction:column;gap:12px;">'+(o.body||'')+'</div>';
  } else if(o.hint!==false){
    h+='<div onclick="App.toggleCard(\''+esc(o.key)+'\')" style="cursor:pointer;text-align:center;font-size:10.5px;font-weight:700;letter-spacing:.3px;color:var(--faint);display:flex;align-items:center;justify-content:center;gap:4px;">'+(o.hint||'detaylar için dokun')+' '+icon('chevron-down',11)+'</div>';
  }
  h+='</div>';
  return h;
}
// Sağlık bölümü başlığında glance-edilen metrik rozeti (iOS-27: kapalıyken bile değer görünür).
function hBadge(txt,col){ col=col||'var(--muted)'; return '<span style="font-size:11px;font-weight:800;color:'+col+';background:color-mix(in srgb,'+col+' 13%, var(--card));border:1px solid color-mix(in srgb,'+col+' 28%, var(--card-bd));border-radius:999px;padding:3px 9px;white-space:nowrap;">'+txt+'</span>'; }
// ---- geçmiş gün düzenleme: tarih etiketi + kalıcı uyarı şeridi ----
function dateLabelTR(s){ if(!s) return ''; var p=s.split('-').map(Number); var dt=new Date(p[0],p[1]-1,p[2]); var mo=['Ocak','Şubat','Mart','Nisan','Mayıs','Haziran','Temmuz','Ağustos','Eylül','Ekim','Kasım','Aralık']; var wd=['Pazar','Pazartesi','Salı','Çarşamba','Perşembe','Cuma','Cumartesi']; return p[2]+' '+mo[p[1]-1]+' '+wd[dt.getDay()]; }
function editBanner(){
  var d=ui.editDate; if(!d) return '';
  var idx=dayIndexFor(d);
  return '<div style="position:sticky;top:0;z-index:60;background:linear-gradient(135deg,#F6A93B,#EC6A5B);border-radius:16px;padding:12px 14px;display:flex;align-items:center;gap:11px;box-shadow:0 10px 24px rgba(236,120,80,0.4);">'
    +'<span style="line-height:1;display:inline-flex;">'+icon('calendar',20)+'</span>'
    +'<div style="flex:1;min-width:0;color:#fff;"><div style="font-size:14.5px;font-weight:800;line-height:1.2;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;">'+(idx>=1?'Gün '+idx+' · ':'')+esc(dateLabelTR(d))+'</div><div style="font-size:11.5px;line-height:1.35;opacity:0.95;">Geçmiş günü düzenliyorsun — girdiğin veriler bu güne yazılır.</div></div>'
    +'<button onclick="App.exitEdit()" style="flex-shrink:0;border:none;cursor:pointer;background:rgba(255,255,255,0.95);color:#C24A2E;font-weight:800;font-size:12.5px;padding:9px 13px;border-radius:12px;white-space:nowrap;display:flex;align-items:center;gap:5px;">Bugüne dön '+icon('sun',13)+'</button>'
    +'</div>';
}
window.SeyOnSynced=function(date){ data.lastSyncDate=todayStr(); if(data&&Array.isArray(data.notifications)) data.notifications.forEach(function(n){ if(n) n.synced=true; }); if(data&&data.aeon&&Array.isArray(data.aeon.qa)) data.aeon.qa.forEach(function(x){ if(x&&x.answer) x.answerSynced=true; }); ui.keyEdit=false; try{ localStorage.setItem(KEY,JSON.stringify(data)); }catch(e){} updateSaveBanner(); if(ui.tab==='ayarlar') render(); };
function save(){ try{ var _d=data&&data.days&&data.days[activeDate()]; if(_d&&_d.habits) syncDerivedHabits(_d); }catch(e){} try{ localStorage.setItem(KEY,JSON.stringify(data)); }catch(e){} if(window.SeySync){ try{ window.SeySync.schedule(data); }catch(e){} } }
function commit(msg){ save(); render(); if(msg) toast(msg); }
// Haptik geri bildirim (destekleyen cihazlarda); Ayarlar'dan kapatılabilir
function haptic(p){ try{ if(navigator.vibrate && !(data&&data.settings&&data.settings.haptics===false)) navigator.vibrate(p); }catch(e){} }

function interp(sweet,walk,evening){
  if(sweet>=5) return 'Tatlı kontrolünde ritim oluşuyor. Kavga değil, yönetim.';
  if(evening>=5) return 'Akşam atıştırması azaldıkça sabah daha hafif başlar.';
  if(walk>=4) return 'Yürüyüş günleri artmış. Bu Şeyma hanımın lehine delildir.';
  if(sweet+walk+evening>=3) return 'Zor günler var ama sistem devam ediyor. Olay bu.';
  return 'Bir haftada birkaç küçük hamle bile gayet iş yapar.';
}
function weekBlock(w,days){
  var slice=days.slice(w*7,w*7+7);
  var defs=[['sweetManaged','Tatlı kontrolü'],['eveningControl','Akşam kontrolü'],['walked20','Yürüyüş'],['protein','Protein'],['water','Su'],['vitaminD','D₃K₂ damla'],['sleepReg','Uyku düzeni'],['journaled','Günlük notu'],['freshAir','Açık hava'],['selfKind','Kendime iyi davrandım']];
  var cnt=function(k){ return slice.reduce(function(a,o){return a+(o.rec&&o.rec.habits[k]?1:0);},0); };
  var rows=defs.map(function(d){ return {label:d[1],val:cnt(d[0])+'/7'}; });
  var totalC=slice.reduce(function(a,o){return a+countRec(o.rec);},0);
  var moods={}; slice.forEach(function(o){ if(o.rec&&o.rec.mood) moods[o.rec.mood]=(moods[o.rec.mood]||0)+1; });
  return {title:'Gün '+(w*7+1)+'-'+(w*7+7),rows:rows,avg:(totalC/7).toFixed(1)+'/'+htToday(),best:bestStreak(slice)+' gün',mood:topMood(moods),interp:interp(cnt('sweetManaged'),cnt('walked20'),cnt('eveningControl'))};
}

// ---------- toast & confetti ----------
function toast(msg,ms){
  var ex=document.getElementById('sey-toast'); if(ex) ex.remove();
  var t=document.createElement('div'); t.id='sey-toast';
  t.style.cssText='position:fixed;left:50%;bottom:96px;transform:translateX(-50%);z-index:400;display:flex;align-items:center;justify-content:center;max-width:88vw;padding:12px 19px;border-radius:17px;background:rgba(28,22,30,0.62);backdrop-filter:blur(22px) saturate(180%);-webkit-backdrop-filter:blur(22px) saturate(180%);border:1px solid rgba(255,255,255,0.16);color:#fff;font:600 14px/1.4 -apple-system,BlinkMacSystemFont,"SF Pro Text",system-ui,sans-serif;box-shadow:0 16px 42px rgba(0,0,0,0.32),inset 0 1px 0 rgba(255,255,255,0.14);text-align:center;letter-spacing:.1px;animation:seyToast .32s cubic-bezier(.16,1,.3,1);';
  t.textContent=msg; document.body.appendChild(t);
  clearTimeout(toastTimer); toastTimer=setTimeout(function(){ if(t&&t.parentNode){ t.style.transition='opacity .28s ease,transform .28s ease'; t.style.opacity='0'; t.style.transform='translateX(-50%) translateY(8px) scale(.97)'; setTimeout(function(){ if(t.parentNode) t.remove(); },300); } }, ms||1800);
}
function confetti(){
  var colors=['#E9AFC1','#C9B8FF','#FFE8A3','#F7DDE5','#6B4A3A'];
  var wrap=document.createElement('div'); wrap.style.cssText='position:fixed;inset:0;pointer-events:none;z-index:9999;overflow:hidden;';
  for(var i=0;i<48;i++){ var p=document.createElement('div'); var c=colors[i%colors.length]; var sz=6+Math.random()*8; p.style.cssText='position:absolute;top:-16px;left:'+(Math.random()*100)+'%;width:'+sz+'px;height:'+(sz*0.6)+'px;background:'+c+';border-radius:2px;opacity:0.9;animation:seyConfetti '+(2+Math.random()*1.6)+'s '+(Math.random()*0.35)+'s ease-in forwards;'; wrap.appendChild(p); }
  document.body.appendChild(wrap); setTimeout(function(){ wrap.remove(); },4400);
}

// ---------- actions (exposed) ----------
var App={};
// ── Profil Değerlendirmesi: puanlama motoru — doğrudan test için erişilebilir kılındı
// (Faz 07). Bunlar UI handler'ı DEĞİL, saf hesaplama fonksiyonları; app.js yalnızca
// window.App'i dışa açtığı için headless testlerin bunlara ulaşabilmesinin tek yolu bu.
App.scoreProfileItem=scoreProfileItem;
App.scoreProfileFacet=scoreProfileFacet;
App.scoreProfileConstruct=scoreProfileConstruct;
App.scoreRiasec=scoreRiasec;
App.scoreValues=scoreValues;
App.scoreAttachment=scoreAttachment;
App.scoreProfileAssessment=scoreProfileAssessment;
App.scoreProfileAssessmentQuality=scoreProfileAssessmentQuality;
App.profileAssessmentQualityCategory=profileAssessmentQualityCategory;
App.PROFILE_QUALITY_WEIGHTS=PROFILE_QUALITY_WEIGHTS;
App.buildProfileReport=buildProfileReport;
App.profileBand=profileBand;
App.profileAssessmentContradictionNotes=profileAssessmentContradictionNotes;
// ── Profil Değerlendirmesi: soru-cevap akışı App.* handler'ları (Faz 05) ──
App.profileItemKeydown=function(e){
  if(!data||!e) return;
  var pa=data.profileAssessment; if(!pa||pa.status==='completed') return;
  if(ui.profileAssessmentAnswerLocked) return;
  var items=profileAssessmentItems();
  var idx=profileItemDisplayIndex();
  var item=items[idx]; if(!item) return;
  var k=e.key;
  if(k>='1'&&k<='7'){
    var PA=window.ProfileAssessmentV1;
    var scale=(PA&&PA.scales&&PA.scales[item.scaleId])||{options:[]};
    var v=parseInt(k,10);
    if(v>=1&&v<=(scale.options||[]).length){ if(e.preventDefault) e.preventDefault(); App.profileAnswer(item.id,v); }
    return;
  }
  if(k==='ArrowLeft'){ if(e.preventDefault) e.preventDefault(); App.profilePrevious(); }
};
App.profilePrevious=function(){
  if(!data) return;
  var pa=data.profileAssessment; if(!pa) return;
  if(ui.profileAssessmentAnswerLocked) return; // görsel geri bildirim penceresinde gezinme yok
  var cur=pa.currentItemIndex;
  if(cur<=0) return; // gidilecek önceki madde yok
  ui.profileAssessmentReviewIndex=cur-1;
  // render() yerine sadece #pa-gate'i değiştir (flash yok)
  var oldGate=document.getElementById('pa-gate');
  if(oldGate && oldGate.parentNode){
    var tmp=document.createElement('div');
    tmp.innerHTML=renderProfileAssessmentGate();
    var newGate=tmp.firstChild;
    if(newGate){ oldGate.parentNode.replaceChild(newGate, oldGate); try{ if(newGate.focus) newGate.focus(); }catch(e){} }
    else render();
  } else render();
};
// Tamamlanma ekranından ana uygulamaya dönüş (174/174 sonrası).
App.dismissProfileCompletion=function(){
  if(!data) return;
  ui.profileAssessmentCompletionShown=false;
  save();
  render();
};
// ── Profil Değerlendirmesi: mola + acil yardım (Faz 06) — data.psych'ten tamamen ayrı ──
App.profileBreakContinue=function(){
  if(!data) return;
  var pa=ensureProfileAssessment(data);
  var brk=profileAssessmentPendingBreak(pa);
  if(brk){
    if(!pa.moduleProgress||typeof pa.moduleProgress!=='object') pa.moduleProgress={};
    if(!pa.moduleProgress[brk.moduleId]||typeof pa.moduleProgress[brk.moduleId]!=='object') pa.moduleProgress[brk.moduleId]={};
    pa.moduleProgress[brk.moduleId].breakAcknowledged=true;
    pa.moduleProgress[brk.moduleId].breakAcknowledgedAt=new Date().toISOString();
  }
  save();
  render();
};
App.profileAssessmentSOS=function(){ ui.profileAssessmentSOS=true; ui.profileAssessmentSosSent=false; render(); };
App.profileAssessmentSOSClose=function(){ ui.profileAssessmentSOS=false; ui.profileAssessmentSosSent=false; render(); };
App.profileAssessmentReachCreator=function(){
  if(ui.profileAssessmentSosSent) return;
  ui.profileAssessmentSosSent=true;
  try{
    if(window.SeySync){
      var ts=new Date().toISOString(), qid='pasos_'+Date.now().toString(36);
      var msg='[SOS — Şeyma yardım istedi] Şeyma "Zor hissediyorum" diyerek doğrudan sana ulaşmak istedi (profil değerlendirmesi ekranından SOS butonu). Lütfen en kısa sürede nazikçe yanında ol.';
      if(typeof window.SeySync.pushPing==='function') window.SeySync.pushPing({id:qid,question:msg,ts:ts});
    }
    haptic([15,60,15]);
  }catch(e){}
  render();
};
function completeProfileAssessmentProvisional(pa){
  // Faz 07: puanlama. Faz 08: kalite/güven. Faz 09: deterministik rapor metni — hepsi
  // burada, tek finalizasyon noktasında sırayla üretilir.
  if(!pa.completedAt) pa.completedAt=new Date().toISOString();
  try{ pa.scores=scoreProfileAssessment(pa.responses); }catch(e){}
  try{ pa.quality=scoreProfileAssessmentQuality(pa.responses); }catch(e){}
  try{ pa.report=buildProfileReport(pa.scores,pa.quality); }catch(e){}
  // Faz 10: panelSummary — panel.html'in göstereceği güvenli özet (ham cevap yok).
  // Yalnızca tamamlanmış + panelSummarySharingAccepted ise panelde görünür (Faz 11).
  try{ pa.panelSummary=buildProfilePanelSummary(pa); }catch(e){}
}
// Faz 10 — panel için güvenli özet (ham cevap/hassas madde YOK). Yalnızca boyut
// özetleri, güven skoru ve kısa rapor. sync.js üzerinden seyma-data'ya yazılır.
function buildProfilePanelSummary(pa){
  if(!pa||pa.status!=='completed') return {};
  var scores=pa.scores||{}, quality=pa.quality||{}, report=pa.report||{};
  var C=scores.constructs||{};
  // Big Five özetleri (sufficient olanlar)
  var bigFiveSummary={};
  ['conscientiousness','negative_emotionality','extraversion','agreeableness','open_mindedness'].forEach(function(c){
    if(C[c]&&C[c].sufficient){ bigFiveSummary[c]={mean:C[c].mean,band:profileBand(C[c].mean)}; }
  });
  // RAISEC ilk üç
  var riasecSummary={};
  if(scores.riasec&&scores.riasec.topThree) riasecSummary.topThree=scores.riasec.topThree;
  // Değer öncelikleri (ilk 3)
  var valuesSummary={};
  if(scores.values&&scores.values.centered){
    var VALUE_LABELS={self_direction:'özerklik',stimulation:'uyarılma/çeşitlilik',achievement:'başarı',power_influence:'güç/etki',security:'güvenlik',tradition_conformity:'gelenek/uyum',benevolence:'iyilikseverlik',universalism:'evrensellik'};
    var centered=scores.values.centered;
    var top=Object.keys(centered).filter(function(k){return centered[k]!=null;}).sort(function(a,b){return centered[b]-centered[a];}).slice(0,3);
    valuesSummary.topThree=top.map(function(k){return VALUE_LABELS[k]||k;});
  }
  // Bağlanma
  var attachmentSummary={};
  if(scores.attachment){
    if(scores.attachment.anxiety&&scores.attachment.anxiety.sufficient) attachmentSummary.anxiety=scores.attachment.anxiety.mean;
    if(scores.attachment.avoidance&&scores.attachment.avoidance.sufficient) attachmentSummary.avoidance=scores.attachment.avoidance.mean;
  }
  // Kısa rapor (rapordan karakter özeti bölümü)
  var shortReport='';
  if(report&&report.sections&&report.sections.characterSummary) shortReport=report.sections.characterSummary.body||'';
  return {
    generatedAt:pa.completedAt||new Date().toISOString(),
    confidenceScore:quality.score!=null?quality.score:null,
    confidenceCategory:quality.category||null,
    bigFive:bigFiveSummary,
    riasec:riasecSummary,
    values:valuesSummary,
    attachment:attachmentSummary,
    shortReport:shortReport
  };
}
App.profileAnswer=function(itemId,value){
  if(!data) return;
  var pa=ensureProfileAssessment(data);
  if(pa.status==='completed') return;
  if(ui.profileAssessmentAnswerLocked) return; // çift tıklama kilidi
  var items=profileAssessmentItems();
  var item=null; for(var i=0;i<items.length;i++){ if(items[i].id===itemId){ item=items[i]; break; } }
  if(!item) return;
  value=parseInt(value,10); if(isNaN(value)||value<1||value>7) return;
  var PA=window.ProfileAssessmentV1;
  var scale=(PA&&PA.scales&&PA.scales[item.scaleId])||null;
  var maxV=(scale&&Array.isArray(scale.options)&&scale.options.length)?scale.options.length:7;
  if(value<1||value>maxV) return;
  var scoredValue=item.reverse?(maxV+1-value):value;
  var now=new Date().toISOString();
  var existing=pa.responses[itemId];
  var shownAt=(ui.profileItemShownAt&&ui.profileItemShownAt[itemId])||(existing&&existing.shownAt)||now;
  var revisionCount=existing?((existing.revisionCount||0)+1):0;
  var sequence=existing?existing.sequence:(Object.keys(pa.responses).length+1);
  pa.responses[itemId]={
    value:value,
    scoredValue:scoredValue,
    shownAt:shownAt,
    answeredAt:now,
    responseMs:Math.max(0,(Date.parse(now)||0)-(Date.parse(shownAt)||0)),
    revisionCount:revisionCount,
    itemVersion:item.itemVersion||'1.0.0',
    sessionId:item.sessionId||'SINGLE',
    originalSessionId:item.originalSessionId,
    sequence:sequence
  };
  ui.profileAssessmentAnswerLocked=true;
  ui.profileAssessmentLockedItemId=itemId;
  save();
  // ── Flicker fix: render() yapmadan, doğrudan DOM'a dokunarak seçeneği işaretle.
  // Eskiden burada render() vardı → tüm #app.innerHTML yeniden kuruluyordu → flash.
  // Artık yalnızca tıklanan seçenek görsel olarak işaretleniyor, "Kaydedildi ✓"
  // gösteriliyor, sonra 120ms sonra tek render ile sonraki soruya geçiliyor.
  try{
    var gate=document.getElementById('pa-gate');
    if(gate){
      var btns=gate.querySelectorAll('button[role="radio"]');
      for(var bi=0; bi<btns.length; bi++){
        var b=btns[bi];
        b.disabled=true;
        b.style.cursor='default';
        var bOnclick=b.getAttribute('onclick')||'';
        var bMatch=bOnclick.match(/profileAnswer\('([^']+)',(\d+)\)/);
        var isClicked = bMatch && bMatch[1]===itemId && Number(bMatch[2])===value;
        if(isClicked){
          b.style.background='color-mix(in srgb,#C9B8FF 14%, var(--card))';
          b.style.border='1px solid #C9B8FF';
          var dot=b.querySelector('span');
          if(dot){ dot.style.background='linear-gradient(135deg,#E9899F,#C9B8FF)'; dot.style.border='none'; dot.innerHTML=icon('check',13); }
        }
      }
      // "Kaydedildi ✓" göstergesi — scroll alanı içindeki durumu güncelle
      var scrollEl=gate.querySelector('[data-scroll]');
      if(scrollEl){
        var divs=scrollEl.children;
        for(var di=0; di<divs.length; di++){
          if(divs[di].textContent && divs[di].textContent.indexOf('Kaydedildi')>=0){
            divs[di].textContent='Kaydedildi ✓';
          }
        }
      }
    }
  }catch(e){}
  // 120ms sonra sonraki soruya geç — render() YAPMA, sadece #pa-gate içeriğini
  // değiştir (tam render tüm #app.innerHTML'i yeniden kurar = flash/parlama).
  setTimeout(function(){
    ui.profileAssessmentAnswerLocked=false;
    ui.profileAssessmentLockedItemId=null;
    ui.profileAssessmentReviewIndex=null; // gözden geçirme bittiyse normal akışa dön
    var pa2=ensureProfileAssessment(data); // responses'tan currentItemIndex/status'u yeniden hesapla
    var isJustCompleted=false;
    if(pa2.status==='completed'&&!pa2.completedAt){ completeProfileAssessmentProvisional(pa2); ui.profileAssessmentCompletionShown=true; isJustCompleted=true; }
    save();
    if(isJustCompleted){
      // 174/174 sonrası teşekkür/tamamlanma ekranını göster; puanlama/rapor zaten üretildi.
      if(pa2.status==='completed' && window.SeySync && typeof window.SeySync.pushNow==='function'){
        try{ window.SeySync.pushNow(); }catch(e){}
      }
      // Tamamlanma bildirimi: seyma-data'daki mail workflow'unu tetikleyen küçük, ayrı
      // tetik dosyası (bkz. sync.js → pushProfileCompletionPing). Yalnızca bu geçişte,
      // bir kez yazılır.
      if(pa2.status==='completed' && window.SeySync && typeof window.SeySync.pushProfileCompletionPing==='function'){
        try{ window.SeySync.pushProfileCompletionPing(); }catch(e){}
      }
      render();
    } else {
      // Soru kartını değiştir — render() ve app.innerHTML YAPMA (flash yok).
      // renderProfileAssessmentGate() bir #pa-gate div'i döndürür.
      // Mevcut #pa-gate'i outerHTML ile değiştir — #app'in geri kalanı
      // (tema, modallar) dokunulmaz, böylece flash/parlama olmaz.
      var oldGate=document.getElementById('pa-gate');
      if(oldGate && oldGate.parentNode){
        var newHTML=renderProfileAssessmentGate();
        // renderProfileAssessmentGate bir <div id="pa-gate" ...> döndürür.
        // outerHTML değiştirmek için bir wrapper oluştur, yeni HTML'i parse et,
        // sonra replaceChild ile değiştir.
        var tmp=document.createElement('div');
        tmp.innerHTML=newHTML;
        var newGate=tmp.firstChild;
        if(newGate){
          oldGate.parentNode.replaceChild(newGate, oldGate);
          try{ if(newGate.focus) newGate.focus(); }catch(e){}
        } else {
          render();
        }
      } else {
        render();
      }
    }
  },120);
};

function createDefaultData(){
  var t=todayStr(), nowIso=new Date().toISOString();
  return {version:2,startDate:t,lastOpenedDate:t,lastOpenedAt:nowIso,days:{},notifications:[],luna:{qa:[],lastAskDate:null},aeon:{qa:[],lastAskDate:null},settings:{nickname:'Sevgili Günışığı',notificationsWanted:false,haptics:true,ghToken:'',ghRepo:'mustafaras/seyma-data',ghBranch:'main',healthGistId:'',openaiKey:'',locationEnabled:false,locationMode:'auto',lunaConnected:false},cycle:{periods:[],avgCycle:28,avgPeriod:5},library:emptyLibrary(),watchlist:emptyWatchlist(),music:emptyMusic(),body:{heightCm:null,heightSetAt:null,weights:[]},labResults:[]};
}
App.start=function(){
  // Karşılama ekranı artık yalnızca Ayarlar > "Başlangıç ekranına dön" veya ilk kurulumda açılır.
  // Veriyi yeniden kurmak veya save() çağırmak geçmiş günleri silip gereksiz senkron başlatabilirdi.
  if(data){ ui.forceStart=false; ui.tab='bugun'; render(); return; }
  data=migrate(createDefaultData());
  if(window.MotivationProgramV2 && featuresLive()) window.MotivationProgramV2.ensureMotivationRoot(data);
  ui.forceStart=false; ui.tab='bugun'; commit('Hadi başlayalım');
};
App.go=function(id){ ui.tab=id; render(); var sc=document.querySelector('[data-scroll]'); if(sc&&id!=='mesaj') sc.scrollTop=0; tryLocNudge('tab'); };
// ── Profil Değerlendirmesi: bilgilendirme + rıza (Faz 04) — data.psych'ten ayrı ──
// Faz 05'ten itibaren render() zaten `pa.status!=='completed'`ye göre bu ekranı
// (veya soru ekranını) OTOMATİK gösterir — bu fonksiyon yalnızca açıkça/programatik
// tetiklemek için bırakıldı, artık bir ui-bayrağı SET ETMİYOR.
App.profileConsentOpen=function(){
  if(!data) return;
  ensureProfileAssessment(data);
  render();
};
App.profileConsentToggle=function(key){
  var c=profileConsentChecks();
  if(!(key in c)) return;
  c[key]=!c[key];
  render();
};
App.profileConsentTogglePrivacyNote=function(){ ui.profileConsentPrivacyNote=!ui.profileConsentPrivacyNote; render(); };
App.profileAcceptConsent=function(){
  if(!data) return;
  var pa=ensureProfileAssessment(data);
  var c=profileConsentChecks();
  if(!profileConsentMandatoryOk(c)) return; // zorunlu onaylardan biri eksik — geçme
  var now=new Date().toISOString();
  if(!pa.consent.informationShownAt) pa.consent.informationShownAt=now;
  pa.consent.acceptedAt=now;
  pa.consent.version=PROFILE_CONSENT_VERSION;
  pa.consent.profileProcessingAccepted=true;
  pa.consent.sensitiveDataAccepted=true;
  // Ayrı bir "panelde göster" tiki kaldırıldı (kullanıcı isteği, 2026-07-12) — data.psych'te
  // olduğu gibi, tamamlanan profil özeti otomatik olarak panelde gösterilir.
  pa.consent.panelSummarySharingAccepted=true;
  if(pa.status==='not_started') pa.status='active';
  save();
  render();
};
App.refreshSaygi=function(){ var person=saygiCurrentPerson(); if(!person) return; saygiLoadArticle(person,true); render(); };
App.openSaygiReading=function(){ App.openReading(); };
App.markSaygiRead=function(){
  var person=saygiCurrentPerson(), article=ui.saygiArticle;
  if(!person||!article||article.dailyKey!==saygiDayKey(person)){ toast('Biyografi hazır olduğunda tekrar dene.'); return; }
  if(!ui.saygiReadReady&&!saygiHasRead(person)){ toast('Önce yazının sonuna kadar inelim; “Okudum” orada açılacak.'); return; }
  var day=getDay(data,todayStr(),dayIndexFor(todayStr()));
  if(!day.reading||typeof day.reading!=='object') day.reading=emptyReading();
  if(!Array.isArray(day.reading.entries)) day.reading.entries=[];
  var existing=saygiReadingEntry(day,person), state=ensureSaygiDay(day);
  if(existing){
    state.personId=person.id; state.readingEntryId=existing.id; state.readAt=existing.ts||state.readAt||new Date().toISOString();
    syncDerivedHabits(day); save(); render(); toast('Bu biyografi bugünün “Ne okudum?” kaydında zaten var.'); return;
  }
  var entry={
    id:uid('saygi'), title:String(article.title||person.name).slice(0,120), author:'Wikipedia · Saygı', pages:0,
    minutes:saygiReadMinutes(article), note:('Saygı seçkisi · '+String(person.field||person.kind||'')).slice(0,240),
    source:'saygi', personId:person.id, saygiDate:todayStr(), sourceUrl:saygiSafeUrl(article.sourceUrl), sourceLabel:(article.lang==='tr'?'Türkçe Wikipedia':'English Wikipedia'), sourceImage:saygiSafeUrl(article.thumbnail,['upload.wikimedia.org']), ts:new Date().toISOString()
  };
  day.reading.entries.push(entry);
  state.personId=person.id; state.readingEntryId=entry.id; state.readAt=entry.ts; day.savedAt=entry.ts;
  syncDerivedHabits(day); save(); haptic([10,24,10]); render();
  toast('Okudum kaydedildi · Zihnimi besledim tiki de seninle yeşerdi.',2800);
};
App.setTheme=function(d){ dark=d; try{ localStorage.setItem(TKEY,d?'dark':'light'); }catch(e){} render(); };
App.toggleTheme=function(){ App.setTheme(!dark); };
App.toggleHabit=function(key){
  var date=activeDate(), idx=dayIndexFor(date), day=getDay(data,date,idx);
  // Su / uyku / yürüyüş tikleri elle işaretlenmez — yalnızca veri eşiği tutunca yeşillenir.
  if(DERIVED_HABITS[key]){ App.explainDerivedHabit(key,day); return; }
  // Magnezyum tik'i hem habits.magnesium hem de magnesium.taken kaydını senkronize eder;
  // skor/model logu da güncellensin diye mevcut toggleMgHabit akışını kullan.
  if(key==='magnesium'){ App.toggleMgHabit(); return; }
  var before=countRec(day); day.habits[key]=!day.habits[key]; day.savedAt=new Date().toISOString(); var after=countRec(day); haptic(14);
  ui.pulse=key; clearTimeout(pulseTimer); pulseTimer=setTimeout(function(){ ui.pulse=null; render(); },240);
  var msg='Kaydedildi'; if(day.habits[key]){ var h=find(HABITS,'key',key); if(h) msg=h.msg; }
  commit(msg);
  if(editing()) return;
  var ht=htToday(); if(after>=ht&&before<ht){ confetti(); setTimeout(function(){ toast('Bugün '+ht+'/'+ht+'. Şeyma hanım kontrolü ele aldı.',2600); },250); }
  else if(day.habits[key]){ maybeStreak(); }
};
App.toggleMgHabit=function(){
  var date=activeDate(), day=getDay(data,date,dayIndexFor(date));
  var before=countRec(day), after;
  var mg=day.magnesium||emptyMagnesium();
  if(mg.taken){ App.skipMagnesium(); }
  else { App.takeMagnesium(null,200); }
  after=countRec(day);
  ui.pulse='magnesium'; clearTimeout(pulseTimer); pulseTimer=setTimeout(function(){ ui.pulse=null; render(); },240);
  // confetti / tamam bildirimi, sadece bugünkü toplam eşiği aşıldıysa
  if(!editing()){ var ht=htToday(); if(after>=ht&&before<ht){ confetti(); setTimeout(function(){ toast('Bugün '+ht+'/'+ht+'. Şeyma hanım kontrolü ele aldı.',2600); },250); } }
};
// Türetilmiş tik'e dokunulduğunda: eşik tutuyorsa sıcak onay, tutmuyorsa ne yapılacağını kibarca anlat.
App.explainDerivedHabit=function(key,day){
  var p=habitProgress(day,key); if(!p) return; haptic(10);
  if(p.met){
    var ok={ water:'Su tamam — '+WATER_GOAL+'/'+WATER_GOAL+' bardak. Bu tik otomatik, ellemene gerek yok.',
             sleepReg:'Uyku tamam — 7,5+ saat. Bu tik kendiliğinden yeşil kalır.',
             walked20:'Yürüyüş tamam — 4.500+ adım. Bu tik kendiliğinden yeşil kalır.',
             journaled:'Not tamam — bugün yazdın. Bu tik kendiliğinden yeşil kalır.',
             sweetManaged:'Tatlı krizini yönettin — bu tik kendiliğinden yeşil kaldı. Helal sana.',
             foodManaged:'Yemek/açlık krizini yönettin — bu tik kendiliğinden yeşil kaldı. Kaptan sensin.',
             coffeeManaged:'Kahve/kafein krizini yönettin — bu tik kendiliğinden yeşil kaldı. Net karar.',
             mediaFed:'Zihnini besledin — okudun/izledin/dinledin/öğrendin. Bu tik otomatik yeşil.',
             caffeineOk:'Kafein tiki temiz — günlük limit aşılmadı ve son kahve vaktinde. Otomatik yeşil.' };
    toast(ok[key]||'Bu tik otomatik — eşik tuttuğunda kendiliğinden yeşil kalır.'); return;
  }
  // Kriz tikleri: dokununca ilgili kriz odasını (modal) aç — en işlevlisi bu.
  if(key==='sweetManaged'){ App.openCrisis('sweet'); return; }
  if(key==='foodManaged'){ App.openCrisis('food'); return; }
  if(key==='coffeeManaged'){ App.openCrisis('coffee'); return; }
  var msg;
  if(key==='water'){ var w=p.cur; msg = w<=0
      ? 'Su tiki otomatik: '+WATER_GOAL+' bardağı tamamlayınca kendiliğinden yeşillenir. Aşağıdaki “Su” kartından eklemeye başla.'
      : 'Su tikine az kaldı — şu an '+w+'/'+WATER_GOAL+' bardak. '+(WATER_GOAL-w)+' bardak daha, kendiliğinden yeşillenecek.'; }
  else if(key==='sleepReg'){ var h=p.cur; msg = h==null
      ? 'Uyku tiki otomatik: Sağlık kartına 7,5 saat ve üzeri uyku girince kendiliğinden yeşillenir.'
      : 'Uyku tiki 7,5 saatte yeşillenir — şu an '+String(h).replace('.',',')+' saat. Girişini güncelleyince otomatik dolar.'; }
  else if(key==='walked20'){ var s=p.cur; msg = s<=0
      ? 'Yürüyüş tiki otomatik: 4.500 adım girince kendiliğinden yeşillenir. Sağlık kartından adımını ekleyebilirsin.'
      : 'Yürüyüş tikine '+(STEP_TICK_MIN-s).toLocaleString('tr-TR')+' adım kaldı — şu an '+s.toLocaleString('tr-TR')+'/'+STEP_TICK_MIN.toLocaleString('tr-TR')+'. Girince otomatik yeşillenecek.'; }
  else if(key==='journaled'){ msg='Not tiki otomatik: “Günün yansıması” kartına bir cümle bile yazınca kendiliğinden yeşillenir.'; }
  else if(key==='mediaFed'){ msg='Zihin tiki otomatik: Okudum / izledim / dinledim / öğrendim kutucuklarından birini doldur → yeşillenir.'; }
  else if(key==='caffeineOk'){ if(!p.amountOk) msg='Kafein tiki otomatik: günlük limit ('+p.goal+' mg) aşıldı — içeceği azaltınca kendiliğinden düzelir.'; else if(!p.timingOk) msg='Kafein tiki otomatik: miktar tamam ama son kahve önerilen saatten geç. Sağlık kartından saatini erkene çekince yeşillenir.'; else msg='Kafein tiki otomatik: bugün temiz — kendiliğinden yeşil.'; }
  else { msg=derivedProgText(key,p)||'Bu tik otomatik — ilgili veriyi girince kendiliğinden yeşillenir.'; }
  toast(msg,2800);
};
function maybeStreak(){ var s=currentStreak(); var m={3:'3 gün oldu. Ritim kendini belli ediyor.',7:'7 gün. Bu artık tesadüf değil.',14:'14 gün. Tatlı lobisi toplantı yapıyor olabilir.',21:'21 gün! İlk büyük eşik.',30:'30 gün. Bir ay kesintisiz, bu ciddi iş.',50:'50 gün. Yarım yüz, tam disiplin.',100:'100 gün! Üç haneye geçtin.',200:'200 gün. Efsane modu.',365:'365 gün. Tam bir yıl.'}; var big={7:1,14:1,21:1,30:1,50:1,100:1,200:1,365:1,500:1,1000:1}; if(m[s]){ if(big[s]) confetti(); setTimeout(function(){ toast(m[s],2800); },300); } }
App.setMood=function(id){ var date=activeDate(), day=getDay(data,date,dayIndexFor(date)); day.mood=(day.mood===id?null:id); day.savedAt=new Date().toISOString(); haptic(14); save(); updateCardByKey('mood'); updateCardByKey('mental'); };
App.onNote=function(el){ var v=el.value; clearTimeout(noteTimer); noteTimer=setTimeout(function(){ var date=activeDate(), day=getDay(data,date,dayIndexFor(date)); day.note=v; var nw=syncDerivedHabits(day); save(); updateCardByKey('habits'); if(nw.indexOf('journaled')>=0){ haptic(14); toast('Duygu notu tiki kendiliğinden yeşillendi.'); } },500); };
App.onIntention=function(el){ var v=el.value; debounceSave('intention',function(){ var day=curDay(); day.intention=String(v||'').slice(0,140); day.savedAt=new Date().toISOString(); save(); },500); };
App.toggleHaptic=function(on){ if(!data.settings) data.settings={}; data.settings.haptics=!!on; if(on) haptic(18); save(); render(); };
App.onMeal=function(key,el){ var v=el.value; debounceSave('meal-'+key,function(){ var date=activeDate(), day=getDay(data,date,dayIndexFor(date)); day.meals[key]=v; day.savedAt=new Date().toISOString(); save(); },500); };

// ---- öğün detay (tabak/gr/adet) ----
App.addMealItem=function(key){ var day=curDay(); if(!day.mealItems[key]) day.mealItems[key]=[]; day.mealItems[key].push({name:'',qty:1,unit:'tabak'}); day.savedAt=new Date().toISOString(); commit(); setTimeout(function(){ var inp=document.querySelector('[data-meal="'+key+'"][data-idx="'+(day.mealItems[key].length-1)+'"]'); if(inp) inp.focus(); },40); };
App.removeMealItem=function(key,idx){ var day=curDay(); if(day.mealItems[key]&&day.mealItems[key][idx]!=null){ day.mealItems[key].splice(idx,1); syncMealText(day,key); day.savedAt=new Date().toISOString(); commit(); } };
App.setMealItemName=function(key,idx,el){ var v=el.value; debounceSave('mi-'+key+'-'+idx,function(){ var day=curDay(); var it=day.mealItems[key]&&day.mealItems[key][idx]; if(!it) return; it.name=v; syncMealText(day,key); day.savedAt=new Date().toISOString(); save(); var sub=document.getElementById('meal-sub-'+key); if(sub){ var m=mealNutr(day,key); sub.textContent=Math.round(m.protein)+'g P · '+Math.round(m.calories)+' kcal'; } updateNutriLive(day); },350); };
App.setMealItemQty=function(key,idx,el){ var day=curDay(); var it=day.mealItems[key]&&day.mealItems[key][idx]; if(!it) return; var v=el.value===''?'':Number(el.value); it.qty=(v===''||isNaN(v))?'':v; syncMealText(day,key); day.savedAt=new Date().toISOString(); commit(); };
App.setMealItemUnit=function(key,idx,el){ var day=curDay(); var it=day.mealItems[key]&&day.mealItems[key][idx]; if(!it) return; it.unit=el.value; syncMealText(day,key); day.savedAt=new Date().toISOString(); commit(); };

// ---- su ----
App.waterAdd=function(n){ var day=curDay(); var v=(Number(day.water)||0)+n; day.water=Math.max(0,Math.min(20,v)); var nw=syncDerivedHabits(day); if(nw.indexOf('water')>=0){ haptic(16); toast('Su tamam — '+WATER_GOAL+'/'+WATER_GOAL+' bardak! Su tiki kendiliğinden yeşillendi.'); } day.savedAt=new Date().toISOString(); commit(); };

// ---- enerji / stres ----
App.setEnergy=function(v){ var day=curDay(); day.energy=(day.energy===v?null:v); day.savedAt=new Date().toISOString(); haptic(10); save(); updateCardByKey('mood'); updateCardByKey('mental'); };
App.setStress=function(v){ var day=curDay(); day.stress=(day.stress===v?null:v); day.savedAt=new Date().toISOString(); haptic(10); save(); updateCardByKey('mood'); updateCardByKey('mental'); };

// ---- kafein ----
// ---- kafein (bilimsel takip: drinks dizisi) ----
App.addCaffeineDrink=function(typeId){ var day=curDay(); if(!day.caffeine) day.caffeine={last:null,cups:null,drinks:[]}; if(!Array.isArray(day.caffeine.drinks)) day.caffeine.drinks=[]; var now=new Date(); var t=pad(now.getHours())+':'+pad(now.getMinutes()); day.caffeine.drinks.push({type:typeId,time:t,qty:1}); day.caffeine.last=caffeineLastTime({caffeine:day.caffeine}); day.caffeine.cups=day.caffeine.drinks.length; var nw=syncDerivedHabits(day); if(nw.indexOf('caffeineOk')>=0){ haptic(16); toast('Kafein tiki kendiliğinden yeşillendi — limit ve saat tamam.'); } day.savedAt=new Date().toISOString(); commit(); };
App.removeCaffeineDrink=function(i){ var day=curDay(); if(!day.caffeine||!Array.isArray(day.caffeine.drinks)) return; if(day.caffeine.drinks[i]==null) return; day.caffeine.drinks.splice(i,1); day.caffeine.last=caffeineLastTime({caffeine:day.caffeine}); day.caffeine.cups=day.caffeine.drinks.length; day.savedAt=new Date().toISOString(); commit(); };
App.setCaffeineDrinkTime=function(i,el){ var day=curDay(); if(!day.caffeine||!Array.isArray(day.caffeine.drinks)) return; var d=day.caffeine.drinks[i]; if(!d) return; d.time=el.value||''; day.caffeine.last=caffeineLastTime({caffeine:day.caffeine}); day.savedAt=new Date().toISOString(); commit(); };
App.setCaffeineMode=function(m){ if(!data.settings) data.settings={}; data.settings.caffeineMode=(m==='sensitive'||m==='pregnant')?m:'standard'; data.savedAt=new Date().toISOString(); haptic(10); commit(); };
App.setTargetBed=function(el){ if(!data.settings) data.settings={}; var v=el.value||''; if(/^\d{2}:\d{2}$/.test(v)) data.settings.targetBed=v; data.savedAt=new Date().toISOString(); commit(); };
// legacy (eski veri/panel uyumu için hâlâ çağrılabilir)
App.setCaffeineTime=function(el){ var v=el.value; var day=curDay(); if(!day.caffeine) day.caffeine={last:null,cups:null,drinks:[]}; if(!Array.isArray(day.caffeine.drinks)) day.caffeine.drinks=[]; if(day.caffeine.drinks.length){ var last=day.caffeine.drinks[day.caffeine.drinks.length-1]; last.time=v||null; } day.caffeine.last=v||null; day.savedAt=new Date().toISOString(); commit(); };
App.caffeineCups=function(n){ var day=curDay(); if(!day.caffeine) day.caffeine={last:null,cups:null,drinks:[]}; if(!Array.isArray(day.caffeine.drinks)) day.caffeine.drinks=[]; var v=(Number(day.caffeine.cups)||0)+n; v=Math.max(0,Math.min(15,v)); var cur=day.caffeine.drinks.length; if(v>cur){ for(var i=cur;i<v;i++){ day.caffeine.drinks.push({type:'turk',time:day.caffeine.last||'09:00',qty:1}); } } else if(v<cur){ day.caffeine.drinks.length=v; } day.caffeine.cups=v; day.caffeine.last=caffeineLastTime({caffeine:day.caffeine}); day.savedAt=new Date().toISOString(); commit(); };

// ---- health (sleep / walk) actions: number inputs save without re-render to keep focus ----
App.setSleepHours=function(el){ var raw=el.value; debounceSave('sleepH',function(){ var day=curDay(); var v=raw===''?null:Number(raw); day.sleep.hours=(v==null||isNaN(v))?null:v; var nw=syncDerivedHabits(day); if(nw.indexOf('sleepReg')>=0){ haptic(16); toast('Uyku tiki kendiliğinden yeşillendi. 7,5+ saat, tam dinlenme.'); } day.savedAt=new Date().toISOString(); save(); }); };
App.setSleepQuality=function(id){ var day=curDay(); day.sleep.quality=(day.sleep.quality===id?null:id); day.savedAt=new Date().toISOString(); commit(); };
App.setSleepMed=function(type){ var day=curDay(); if(!day.sleep.med) day.sleep.med={type:null,note:''}; day.sleep.med.type=(day.sleep.med.type===type?null:type); if(day.sleep.med.type!=='herbal'&&day.sleep.med.type!=='rx') day.sleep.med.note=''; day.savedAt=new Date().toISOString(); commit(); };
App.setSleepMedNote=function(el){ var v=el.value; debounceSave('sleepMedNote',function(){ var day=curDay(); if(!day.sleep.med) day.sleep.med={type:null,note:''}; day.sleep.med.note=v; day.savedAt=new Date().toISOString(); save(); },300); };
App.openReading=function(){ ui.readingOpen=true; ui.readingView='today'; ui.logBookId=null; ui.readingDraft={title:'',author:'',pages:'',minutes:'',note:''}; render(); };
App.closeReading=function(){ ui.readingOpen=false; ui.readingDraft=null; ui.bookEdit=null; ui.quoteDraft=null; ui.logBookId=null; render(); };
App.setReadingView=function(v){ ui.readingView=v; ui.bookEdit=null; ui.quoteDraft=null; render(); };
App.onReadingField=function(field,el){ if(!ui.readingDraft) ui.readingDraft={title:'',author:'',pages:'',minutes:'',note:''}; ui.readingDraft[field]=el.value; };
App.pickLogBook=function(id){ var b=findBook(id); if(!b) return; ui.logBookId=(ui.logBookId===id?null:id); if(ui.logBookId){ if(!ui.readingDraft) ui.readingDraft={}; ui.readingDraft.title=b.title; ui.readingDraft.author=b.author; } render(); };
function bumpBookProgress(book,addPages){ if(!book) return false; if(addPages>0){ book.currentPage=Math.max(0,book.currentPage+addPages); if(book.totalPages&&book.totalPages>0) book.currentPage=Math.min(book.currentPage,book.totalPages); } if(!book.startedAt) book.startedAt=new Date().toISOString(); if(book.status==='reading'&&book.totalPages&&book.totalPages>0&&book.currentPage>=book.totalPages){ book.status='finished'; book.finishedAt=new Date().toISOString(); return true; } return false; }
App.addReading=function(){
  var d=ui.readingDraft||{};
  var title=String(d.title||'').trim();
  if(!title){ toast('Önce kitabın adını yaz'); var ti=document.getElementById('reading-title'); if(ti) ti.focus(); return; }
  var pages=parseInt(d.pages,10); if(isNaN(pages)||pages<0) pages=0;
  var minutes=parseInt(d.minutes,10); if(isNaN(minutes)||minutes<0) minutes=null;
  var bookId=ui.logBookId||null; var justFinished=false;
  if(bookId){ var bk=findBook(bookId); if(bk){ justFinished=bumpBookProgress(bk,pages); } else bookId=null; }
  var entry={ id:uid('r'), title:title.slice(0,120), author:String(d.author||'').trim().slice(0,80), pages:pages, minutes:minutes, note:String(d.note||'').trim().slice(0,240), bookId:bookId, ts:new Date().toISOString() };
  var day=getDay(data,todayStr(),dayIndexFor(todayStr()));
  if(!day.reading||typeof day.reading!=='object') day.reading=emptyReading();
  if(!Array.isArray(day.reading.entries)) day.reading.entries=[];
  day.reading.entries.push(entry);
  day.savedAt=new Date().toISOString();
  ui.readingDraft={title:'',author:'',pages:'',minutes:'',note:''}; ui.logBookId=null;
  if(justFinished){ commit(); toast('Kitabı bitirdin!'); confetti(); } else commit('Okuma kaydedildi');
};
App.removeReading=function(id){
  var day=getDay(data,todayStr(),dayIndexFor(todayStr()));
  if(day.reading&&Array.isArray(day.reading.entries)){ var i=day.reading.entries.findIndex(function(e){ return e&&e.id===id; }); if(i>=0){ var e=day.reading.entries[i]; if(e&&e.bookId&&e.pages>0){ var bk=findBook(e.bookId); if(bk){ bk.currentPage=Math.max(0,bk.currentPage-e.pages); if(bk.status==='finished'&&bk.totalPages&&bk.currentPage<bk.totalPages){ bk.status='reading'; bk.finishedAt=null; } } } day.reading.entries.splice(i,1); if(e&&e.source==='saygi'&&day.saygi&&day.saygi.readingEntryId===id) day.saygi=emptySaygi(); syncDerivedHabits(day); day.savedAt=new Date().toISOString(); commit('Okuma kaydı silindi'); } }
};
// ---- kitap CRUD ----
App.openBookEdit=function(id){ ensureLibrary(); ui.bookEdit = id ? clone(findBook(id)||{}) : {id:'',title:'',author:'',genre:'',emoji:'',totalPages:'',currentPage:0,status:'reading',rating:null,quotes:[]}; render(); };
App.closeBookEdit=function(){ ui.bookEdit=null; render(); };
App.onBookEditField=function(field,el){ if(!ui.bookEdit) return; ui.bookEdit[field]=el.value; };
App.pickBookEmoji=function(e){ if(!ui.bookEdit) return; ui.bookEdit.emoji=e; render(); };
App.pickBookGenre=function(g){ if(!ui.bookEdit) return; ui.bookEdit.genre=(ui.bookEdit.genre===g?'':g); render(); };
App.saveBook=function(){ if(!ui.bookEdit) return; var L=ensureLibrary(); var b=ui.bookEdit; var title=String(b.title||'').trim(); if(!title){ toast('Kitabın adını yaz'); return; } if(b.id){ var ex=findBook(b.id); if(ex){ ex.title=title.slice(0,120); ex.author=String(b.author||'').trim().slice(0,80); ex.genre=String(b.genre||''); ex.emoji=b.emoji||''; ex.totalPages=(b.totalPages===''||b.totalPages==null)?null:Math.max(0,Math.round(Number(b.totalPages)||0)); ex.status=b.status||'reading'; normBook(ex); if(ex.totalPages) ex.currentPage=Math.min(ex.currentPage,ex.totalPages); } } else { var nb=normBook({title:title,author:String(b.author||'').trim(),genre:String(b.genre||''),emoji:b.emoji||'',totalPages:b.totalPages,currentPage:0,status:b.status||'reading',startedAt:new Date().toISOString()}); L.books.unshift(nb); } ui.bookEdit=null; commit('Kitaplığa eklendi'); };
App.deleteBook=function(id){ var L=ensureLibrary(); var i=L.books.findIndex(function(b){ return b&&b.id===id; }); if(i>=0){ L.books.splice(i,1); } ui.bookEdit=null; commit('Kitap silindi'); };
App.setBookStatus=function(id,st){ var b=findBook(id); if(!b) return; b.status=st; if(st==='finished'){ if(!b.finishedAt) b.finishedAt=new Date().toISOString(); if(b.totalPages) b.currentPage=b.totalPages; } else { b.finishedAt=null; } commit(); };
App.rateBook=function(id,n){ var b=findBook(id); if(!b) return; b.rating=(b.rating===n?null:n); commit(); };
App.advanceBook=function(id,delta){ var b=findBook(id); if(!b) return; var fin=bumpBookProgress(b,delta>0?delta:0); if(delta<0){ b.currentPage=Math.max(0,b.currentPage+delta); if(b.status==='finished'&&b.totalPages&&b.currentPage<b.totalPages){ b.status='reading'; b.finishedAt=null; } } if(fin){ commit(); toast('Kitabı bitirdin!'); confetti(); } else commit(); };
App.setBookPage=function(id,el){ var b=findBook(id); if(!b) return; var raw=el.value; debounceSave('bookpage_'+id,function(){ var v=raw===''?0:Math.max(0,Math.round(Number(raw)||0)); if(b.totalPages) v=Math.min(v,b.totalPages); b.currentPage=v; if(b.status==='reading'&&b.totalPages&&v>=b.totalPages){ b.status='finished'; b.finishedAt=new Date().toISOString(); save(); render(); toast('Kitabı bitirdin!'); confetti(); return; } save(); render(); },500); };
App.finishBook=function(id){ var b=findBook(id); if(!b) return; b.status='finished'; b.finishedAt=new Date().toISOString(); if(b.totalPages) b.currentPage=b.totalPages; if(!b.startedAt) b.startedAt=new Date().toISOString(); commit(); toast('Kitabı bitirdin!'); confetti(); };
App.reopenBook=function(id){ var b=findBook(id); if(!b) return; b.status='reading'; b.finishedAt=null; commit(); };
App.setReadGoal=function(field,el){ var L=ensureLibrary(); var raw=el.value; debounceSave('readgoal_'+field,function(){ var v=raw===''?null:Math.max(0,Math.round(Number(raw)||0)); L.goal[field]=v; save(); render(); },500); };
// ---- alıntılar ----
App.openQuoteAdd=function(bookId){ var L=ensureLibrary(); if(!bookId){ var reading=L.books.filter(function(b){return b.status!=='dropped';}); bookId=(reading[0]&&reading[0].id)||(L.books[0]&&L.books[0].id)||''; } ui.quoteDraft={bookId:bookId,text:'',page:''}; render(); };
App.closeQuoteAdd=function(){ ui.quoteDraft=null; render(); };
App.onQuoteField=function(field,el){ if(!ui.quoteDraft) return; ui.quoteDraft[field]=el.value; };
App.pickQuoteBook=function(id){ if(!ui.quoteDraft) return; ui.quoteDraft.bookId=id; render(); };
App.saveQuote=function(){ if(!ui.quoteDraft) return; var b=findBook(ui.quoteDraft.bookId); if(!b){ toast('Önce bir kitap seç'); return; } var text=String(ui.quoteDraft.text||'').trim(); if(!text){ toast('Alıntıyı yaz'); return; } var page=parseInt(ui.quoteDraft.page,10); if(isNaN(page)||page<0) page=null; if(!Array.isArray(b.quotes)) b.quotes=[]; b.quotes.push({id:uid('q'),text:text.slice(0,400),page:page,ts:new Date().toISOString()}); ui.quoteDraft=null; commit('Alıntı eklendi'); };
App.removeQuote=function(bookId,qid){ var b=findBook(bookId); if(!b||!Array.isArray(b.quotes)) return; var i=b.quotes.findIndex(function(q){return q&&q.id===qid;}); if(i>=0){ b.quotes.splice(i,1); commit('Alıntı silindi'); } };
App.copyQuote=function(text){ try{ navigator.clipboard.writeText(text); toast('Kopyalandı'); }catch(e){ toast('Kopyalanamadı'); } };
App.toggleHealthSetup=function(){ ui.healthSetupOpen=!ui.healthSetupOpen; render(); };
// Bearer jetonu ekrana hiç basılmadan (HTML'e gömülmeden), tıklanınca doğrudan panoya kopyalanır.
App.copyHealthStarter=function(){ App.copyQuote('{"date":"","steps":0,"walkM":0,"updatedAt":""}'); };
App.copyHealthUrl=function(){ var sg=data.settings||{}; var gid=(sg.healthGistId||'').trim(); if(!gid){ toast('Önce yukarıya Gist ID\'yi yapıştır'); return; } App.copyQuote('https://api.github.com/gists/'+gid); };
App.copyHealthAuth=function(){ var sg=data.settings||{}; if(!sg.ghToken){ toast('Önce Ayarlar\'dan repoya bağlan'); return; } App.copyQuote('Bearer '+sg.ghToken); };
App.copyHealthTemplate=function(){ App.copyQuote('{"date":"[Şimdiki Tarih]","steps":[Adım Sayısı],"walkM":[Mesafe],"updatedAt":"[Şimdiki Tarih]"}'); };
App.copyQuoteById=function(bookId,qid){ var b=findBook(bookId); if(!b||!Array.isArray(b.quotes)) return; var q=b.quotes.find(function(x){return x&&x.id===qid;}); if(!q) return; var txt='“'+q.text+'”\n— '+b.title+(q.page?', s.'+q.page:''); App.copyQuote(txt); };
App.copyReplicaById=function(itemId,qid){ var t=findTitle(itemId); if(!t||!Array.isArray(t.quotes)) return; var q=t.quotes.find(function(x){return x&&x.id===qid;}); if(!q) return; var txt='“'+q.text+'”\n— '+t.title; App.copyQuote(txt); };

// ================= NE İZLEDİM =================
App.openWatching=function(){ ui.watchOpen=true; ui.watchView='today'; ui.logItemId=null; ui.watchDraft={title:'',kind:'film',episodes:'',minutes:'',note:''}; render(); };
App.closeWatching=function(){ ui.watchOpen=false; ui.watchDraft=null; ui.titleEdit=null; ui.replicaDraft=null; ui.logItemId=null; render(); };
App.setWatchView=function(v){ ui.watchView=v; ui.titleEdit=null; ui.replicaDraft=null; render(); };
App.onWatchField=function(field,el){ if(!ui.watchDraft) ui.watchDraft={title:'',kind:'film',episodes:'',minutes:'',note:''}; ui.watchDraft[field]=el.value; };
App.setWatchDraftKind=function(k){ if(!ui.watchDraft) ui.watchDraft={}; ui.watchDraft.kind=k; render(); };
App.pickLogTitle=function(id){ var t=findTitle(id); if(!t) return; ui.logItemId=(ui.logItemId===id?null:id); if(ui.logItemId){ if(!ui.watchDraft) ui.watchDraft={}; ui.watchDraft.title=t.title; ui.watchDraft.kind=t.kind; } render(); };
function bumpTitleProgress(item,addEps){ if(!item) return false; if(item.kind==='dizi'){ if(addEps>0){ item.watchedEp=Math.max(0,item.watchedEp+addEps); if(item.totalEp&&item.totalEp>0) item.watchedEp=Math.min(item.watchedEp,item.totalEp); } } else { item.watchedEp=1; } if(!item.startedAt) item.startedAt=new Date().toISOString(); if(item.status==='watching'){ if(item.kind==='film'){ item.status='finished'; item.finishedAt=new Date().toISOString(); return true; } if(item.totalEp&&item.totalEp>0&&item.watchedEp>=item.totalEp){ item.status='finished'; item.finishedAt=new Date().toISOString(); return true; } } return false; }
App.addWatching=function(){
  var d=ui.watchDraft||{};
  var title=String(d.title||'').trim();
  if(!title){ toast('Önce yapımın adını yaz'); var ti=document.getElementById('watch-title'); if(ti) ti.focus(); return; }
  var kind=(d.kind==='dizi')?'dizi':'film';
  var episodes=parseInt(d.episodes,10); if(isNaN(episodes)||episodes<0) episodes=(kind==='dizi'?1:null);
  var minutes=parseInt(d.minutes,10); if(isNaN(minutes)||minutes<0) minutes=null;
  var itemId=ui.logItemId||null; var justFinished=false;
  if(itemId){ var it=findTitle(itemId); if(it){ justFinished=bumpTitleProgress(it,episodes||0); } else itemId=null; }
  var entry={ id:uid('we'), title:title.slice(0,120), kind:kind, episodes:episodes, minutes:minutes, note:String(d.note||'').trim().slice(0,240), itemId:itemId, ts:new Date().toISOString() };
  var day=getDay(data,todayStr(),dayIndexFor(todayStr()));
  if(!day.watching||typeof day.watching!=='object') day.watching=emptyWatching();
  if(!Array.isArray(day.watching.entries)) day.watching.entries=[];
  day.watching.entries.push(entry);
  day.savedAt=new Date().toISOString();
  ui.watchDraft={title:'',kind:kind,episodes:'',minutes:'',note:''}; ui.logItemId=null;
  if(justFinished){ commit(); toast('Bitirdin!'); confetti(); } else commit('İzleme kaydedildi');
};
App.removeWatching=function(id){
  var day=getDay(data,todayStr(),dayIndexFor(todayStr()));
  if(day.watching&&Array.isArray(day.watching.entries)){ var i=day.watching.entries.findIndex(function(e){ return e&&e.id===id; }); if(i>=0){ var e=day.watching.entries[i]; if(e&&e.itemId&&e.kind==='dizi'&&e.episodes>0){ var it=findTitle(e.itemId); if(it){ it.watchedEp=Math.max(0,it.watchedEp-e.episodes); if(it.status==='finished'&&it.totalEp&&it.watchedEp<it.totalEp){ it.status='watching'; it.finishedAt=null; } } } day.watching.entries.splice(i,1); day.savedAt=new Date().toISOString(); commit('İzleme kaydı silindi'); } }
};
// ---- yapım CRUD ----
App.openTitleEdit=function(id){ ensureWatchlist(); ui.titleEdit = id ? clone(findTitle(id)||{}) : {id:'',title:'',kind:'film',genre:'',emoji:'',totalEp:'',watchedEp:0,status:'watching',rating:null,quotes:[]}; render(); };
App.closeTitleEdit=function(){ ui.titleEdit=null; render(); };
App.onTitleEditField=function(field,el){ if(!ui.titleEdit) return; ui.titleEdit[field]=el.value; };
App.pickTitleEmoji=function(e){ if(!ui.titleEdit) return; ui.titleEdit.emoji=e; render(); };
App.setTitleEditKind=function(k){ if(!ui.titleEdit) return; ui.titleEdit.kind=k; render(); };
App.pickTitleGenre=function(g){ if(!ui.titleEdit) return; ui.titleEdit.genre=(ui.titleEdit.genre===g?'':g); render(); };
App.saveTitle=function(){ if(!ui.titleEdit) return; var W=ensureWatchlist(); var t=ui.titleEdit; var title=String(t.title||'').trim(); if(!title){ toast('Yapımın adını yaz'); return; } if(t.id){ var ex=findTitle(t.id); if(ex){ ex.title=title.slice(0,120); ex.kind=(t.kind==='dizi'?'dizi':'film'); ex.genre=String(t.genre||''); ex.emoji=t.emoji||''; ex.totalEp=(t.totalEp===''||t.totalEp==null)?null:Math.max(0,Math.round(Number(t.totalEp)||0)); ex.status=t.status||'watching'; normTitle(ex); if(ex.totalEp) ex.watchedEp=Math.min(ex.watchedEp,ex.totalEp); } } else { var nt=normTitle({title:title,kind:(t.kind==='dizi'?'dizi':'film'),genre:String(t.genre||''),emoji:t.emoji||'',totalEp:t.totalEp,watchedEp:0,status:t.status||'watching',startedAt:new Date().toISOString()}); W.items.unshift(nt); } ui.titleEdit=null; commit('Arşive eklendi'); };
App.deleteTitle=function(id){ var W=ensureWatchlist(); var i=W.items.findIndex(function(t){ return t&&t.id===id; }); if(i>=0){ W.items.splice(i,1); } ui.titleEdit=null; commit('Yapım silindi'); };
App.setTitleStatus=function(id,st){ var t=findTitle(id); if(!t) return; t.status=st; if(st==='finished'){ if(!t.finishedAt) t.finishedAt=new Date().toISOString(); if(t.totalEp) t.watchedEp=t.totalEp; } else { t.finishedAt=null; } commit(); };
App.rateTitle=function(id,n){ var t=findTitle(id); if(!t) return; t.rating=(t.rating===n?null:n); commit(); };
App.advanceTitle=function(id,delta){ var t=findTitle(id); if(!t) return; var fin=false; if(delta>0){ fin=bumpTitleProgress(t,delta); } else { t.watchedEp=Math.max(0,t.watchedEp+delta); if(t.status==='finished'&&t.totalEp&&t.watchedEp<t.totalEp){ t.status='watching'; t.finishedAt=null; } } if(fin){ commit(); toast('Diziyi bitirdin!'); confetti(); } else commit(); };
App.setTitleEp=function(id,el){ var t=findTitle(id); if(!t) return; var raw=el.value; debounceSave('titleep_'+id,function(){ var v=raw===''?0:Math.max(0,Math.round(Number(raw)||0)); if(t.totalEp) v=Math.min(v,t.totalEp); t.watchedEp=v; if(t.status==='watching'&&t.totalEp&&v>=t.totalEp){ t.status='finished'; t.finishedAt=new Date().toISOString(); save(); render(); toast('Diziyi bitirdin!'); confetti(); return; } save(); render(); },500); };
App.finishTitle=function(id){ var t=findTitle(id); if(!t) return; t.status='finished'; t.finishedAt=new Date().toISOString(); if(t.totalEp) t.watchedEp=t.totalEp; else if(t.kind==='film') t.watchedEp=1; if(!t.startedAt) t.startedAt=new Date().toISOString(); commit(); toast('Bitirdin!'); confetti(); };
App.reopenTitle=function(id){ var t=findTitle(id); if(!t) return; t.status='watching'; t.finishedAt=null; commit(); };
App.setWatchGoal=function(field,el){ var W=ensureWatchlist(); var raw=el.value; debounceSave('watchgoal_'+field,function(){ var v=raw===''?null:Math.max(0,Math.round(Number(raw)||0)); W.goal[field]=v; save(); render(); },500); };
// ---- replikler ----
App.openReplicaAdd=function(itemId){ var W=ensureWatchlist(); if(!itemId){ var act=W.items.filter(function(t){return t.status!=='dropped';}); itemId=(act[0]&&act[0].id)||(W.items[0]&&W.items[0].id)||''; } ui.replicaDraft={itemId:itemId,text:''}; render(); };
App.closeReplicaAdd=function(){ ui.replicaDraft=null; render(); };
App.onReplicaField=function(field,el){ if(!ui.replicaDraft) return; ui.replicaDraft[field]=el.value; };
App.pickReplicaTitle=function(id){ if(!ui.replicaDraft) return; ui.replicaDraft.itemId=id; render(); };
App.saveReplica=function(){ if(!ui.replicaDraft) return; var t=findTitle(ui.replicaDraft.itemId); if(!t){ toast('Önce bir yapım seç'); return; } var text=String(ui.replicaDraft.text||'').trim(); if(!text){ toast('Repliği yaz'); return; } if(!Array.isArray(t.quotes)) t.quotes=[]; t.quotes.push({id:uid('wq'),text:text.slice(0,400),ts:new Date().toISOString()}); ui.replicaDraft=null; commit('Replik eklendi'); };
App.removeReplica=function(itemId,qid){ var t=findTitle(itemId); if(!t||!Array.isArray(t.quotes)) return; var i=t.quotes.findIndex(function(q){return q&&q.id===qid;}); if(i>=0){ t.quotes.splice(i,1); commit('Replik silindi'); } };

// ================= NE DİNLEDİM =================
App.openListening=function(){ ui.listeningOpen=true; ui.listeningView='today'; ui.logTrackId=null; ui.trackEdit=null; ui.lyricDraft=null; if(!ui.listeningDraft) ui.listeningDraft={title:'',artist:'',kind:'sarki',minutes:'',note:''}; render(); };
App.closeListening=function(){ ui.listeningOpen=false; ui.listeningDraft=null; ui.trackEdit=null; ui.lyricDraft=null; ui.logTrackId=null; render(); };
App.setListeningView=function(v){ ui.listeningView=v; ui.trackEdit=null; ui.lyricDraft=null; render(); };
App.onListeningField=function(field,el){ if(!ui.listeningDraft) ui.listeningDraft={title:'',artist:'',kind:'sarki',minutes:'',note:''}; ui.listeningDraft[field]=el.value; };
App.setListenDraftKind=function(k){ if(!ui.listeningDraft) ui.listeningDraft={title:'',artist:'',kind:'sarki',minutes:'',note:''}; ui.listeningDraft.kind=(['sarki','album','podcast'].indexOf(k)>=0)?k:'sarki'; render(); };
App.pickLogTrack=function(id){ var x=findTrack(id); if(!x) return; if(ui.logTrackId===id){ ui.logTrackId=null; } else { ui.logTrackId=id; if(!ui.listeningDraft) ui.listeningDraft={}; ui.listeningDraft.title=x.title; ui.listeningDraft.artist=x.artist; ui.listeningDraft.kind=x.kind; } render(); };
App.addListening=function(){
  var d=ui.listeningDraft||{};
  var title=String(d.title||'').trim();
  if(!title){ toast('Önce ne dinlediğini yaz'); var ti=document.getElementById('listening-title'); if(ti) ti.focus(); return; }
  var kind=(['sarki','album','podcast'].indexOf(d.kind)>=0)?d.kind:'sarki';
  var minutes=parseInt(d.minutes,10); if(isNaN(minutes)||minutes<0) minutes=null;
  var itemId=ui.logTrackId||null; if(itemId&&!findTrack(itemId)) itemId=null;
  var entry={ id:uid('l'), title:title.slice(0,120), artist:String(d.artist||'').trim().slice(0,80), kind:kind, minutes:minutes, note:String(d.note||'').trim().slice(0,240), itemId:itemId, ts:new Date().toISOString() };
  var day=getDay(data,todayStr(),dayIndexFor(todayStr()));
  if(!day.listening||typeof day.listening!=='object') day.listening=emptyListening();
  if(!Array.isArray(day.listening.entries)) day.listening.entries=[];
  day.listening.entries.push(entry);
  day.savedAt=new Date().toISOString();
  ui.listeningDraft={title:'',artist:'',kind:kind,minutes:'',note:''}; ui.logTrackId=null;
  commit('Dinleme kaydedildi');
};
App.removeListening=function(id){ var day=getDay(data,todayStr(),dayIndexFor(todayStr())); if(day.listening&&Array.isArray(day.listening.entries)){ var i=day.listening.entries.findIndex(function(e){ return e&&e.id===id; }); if(i>=0){ day.listening.entries.splice(i,1); day.savedAt=new Date().toISOString(); commit('Dinleme kaydı silindi'); } } };
// ---- favori CRUD ----
App.openTrackEdit=function(id){ ensureMusic(); ui.trackEdit = id ? clone(findTrack(id)||{}) : {id:'',title:'',artist:'',kind:'sarki',genre:'',emoji:'',rating:null,quotes:[]}; render(); };
App.closeTrackEdit=function(){ ui.trackEdit=null; render(); };
App.onTrackEditField=function(field,el){ if(!ui.trackEdit) return; ui.trackEdit[field]=el.value; };
App.pickTrackEmoji=function(e){ if(!ui.trackEdit) return; ui.trackEdit.emoji=e; render(); };
App.setTrackEditKind=function(k){ if(!ui.trackEdit) return; ui.trackEdit.kind=(['sarki','album','podcast'].indexOf(k)>=0)?k:'sarki'; render(); };
App.pickTrackGenre=function(g){ if(!ui.trackEdit) return; ui.trackEdit.genre=(ui.trackEdit.genre===g?'':g); render(); };
App.saveTrack=function(){ if(!ui.trackEdit) return; var M=ensureMusic(); var x=ui.trackEdit; var title=String(x.title||'').trim(); if(!title){ toast('Adını yaz'); return; } if(x.id){ var ex=findTrack(x.id); if(ex){ ex.title=title.slice(0,120); ex.artist=String(x.artist||'').trim().slice(0,80); ex.kind=(['sarki','album','podcast'].indexOf(x.kind)>=0)?x.kind:'sarki'; ex.genre=String(x.genre||''); ex.emoji=x.emoji||''; normTrack(ex); } } else { var nx=normTrack({title:title,artist:String(x.artist||'').trim(),kind:x.kind,genre:String(x.genre||''),emoji:x.emoji||''}); M.items.unshift(nx); } ui.trackEdit=null; commit('Favorilere eklendi'); };
App.deleteTrack=function(id){ var M=ensureMusic(); var i=M.items.findIndex(function(x){ return x&&x.id===id; }); if(i>=0){ M.items.splice(i,1); } ui.trackEdit=null; commit('Favori silindi'); };
App.rateTrack=function(id,n){ var x=findTrack(id); if(!x) return; x.rating=(x.rating===n?null:n); commit(); };
App.setListenGoal=function(field,el){ var M=ensureMusic(); var raw=el.value; debounceSave('listengoal_'+field,function(){ var v=raw===''?null:Math.max(0,Math.round(Number(raw)||0)); M.goal[field]=v; save(); render(); },500); };
// ---- favori sözler ----
App.openLyricAdd=function(itemId){ var M=ensureMusic(); if(!itemId){ itemId=(M.items[0]&&M.items[0].id)||''; } ui.lyricDraft={itemId:itemId,text:''}; render(); };
App.closeLyricAdd=function(){ ui.lyricDraft=null; render(); };
App.onLyricField=function(field,el){ if(!ui.lyricDraft) return; ui.lyricDraft[field]=el.value; };
App.pickLyricTrack=function(id){ if(!ui.lyricDraft) return; ui.lyricDraft.itemId=id; render(); };
App.saveLyric=function(){ if(!ui.lyricDraft) return; var x=findTrack(ui.lyricDraft.itemId); if(!x){ toast('Önce bir favori seç'); return; } var text=String(ui.lyricDraft.text||'').trim(); if(!text){ toast('Sözü yaz'); return; } if(!Array.isArray(x.quotes)) x.quotes=[]; x.quotes.push({id:uid('lq'),text:text.slice(0,400),ts:new Date().toISOString()}); ui.lyricDraft=null; commit('Söz eklendi'); };
App.removeLyric=function(itemId,qid){ var x=findTrack(itemId); if(!x||!Array.isArray(x.quotes)) return; var i=x.quotes.findIndex(function(q){return q&&q.id===qid;}); if(i>=0){ x.quotes.splice(i,1); commit('Söz silindi'); } };
App.copyLyricById=function(itemId,qid){ var x=findTrack(itemId); if(!x||!Array.isArray(x.quotes)) return; var q=x.quotes.find(function(z){return z&&z.id===qid;}); if(!q) return; App.copyQuote('“'+q.text+'”\n— '+x.title+(x.artist?', '+x.artist:'')); };

// ================= NE ÖĞRENDİM =================
App.openLearning=function(){ ui.learningOpen=true; ui.learningDraft={topic:'',source:'',note:''}; render(); };
App.closeLearning=function(){ ui.learningOpen=false; ui.learningDraft=null; render(); };
App.onLearningField=function(field,el){ if(!ui.learningDraft) ui.learningDraft={topic:'',source:'',note:''}; ui.learningDraft[field]=el.value; };
App.addLearning=function(){
  var d=ui.learningDraft||{};
  var topic=String(d.topic||'').trim();
  if(!topic){ toast('Önce ne öğrendiğini yaz'); var ti=document.getElementById('learning-topic'); if(ti) ti.focus(); return; }
  var entry={ id:uid('ln'), topic:topic.slice(0,140), source:String(d.source||'').trim().slice(0,120), note:String(d.note||'').trim().slice(0,300), ts:new Date().toISOString() };
  var day=getDay(data,todayStr(),dayIndexFor(todayStr()));
  if(!day.learning||typeof day.learning!=='object') day.learning=emptyLearning();
  if(!Array.isArray(day.learning.entries)) day.learning.entries=[];
  day.learning.entries.push(entry);
  day.savedAt=new Date().toISOString();
  ui.learningDraft={topic:'',source:'',note:''};
  commit('Öğrenme kaydedildi');
};
App.removeLearning=function(id){ var day=getDay(data,todayStr(),dayIndexFor(todayStr())); if(day.learning&&Array.isArray(day.learning.entries)){ var i=day.learning.entries.findIndex(function(e){ return e&&e.id===id; }); if(i>=0){ day.learning.entries.splice(i,1); day.savedAt=new Date().toISOString(); commit('Öğrenme kaydı silindi'); } } };

// ================= ŞÜKRAN / 3 GÜZEL ŞEY =================
App.onGratitude=function(i,el){ var v=el.value; i=Number(i)||0; debounceSave('grat'+i,function(){ var day=curDay(); if(!Array.isArray(day.gratitude)) day.gratitude=[]; day.gratitude[i]=String(v||'').slice(0,160); day.savedAt=new Date().toISOString(); save(); },500); };


App.setWalkSteps=function(el){ var raw=el.value; debounceSave('walkS',function(){ var day=curDay(); var v=raw===''?null:Number(raw); day.walk.steps=(v==null||isNaN(v))?null:Math.round(v); var nw=syncDerivedHabits(day); if(nw.indexOf('walked20')>=0){ haptic(16); toast('Yürüyüş tiki kendiliğinden yeşillendi. 4.500+ adım, harika!'); } day.savedAt=new Date().toISOString(); save(); }); };
App.hideStepNudge=function(){ ui.stepNudgeHidden=true; render(); };
// Kalıcı kart gizleme/geri getirme (settings'te tutulur; Ayarlar > Gizlenen kartlar'dan geri gelir).
App.hideBugunCard=function(which){ if(!data.settings) data.settings={}; if(which==='location'){ data.settings.hideLocationCard=true; toast('Konum & Hareket gizlendi · Ayarlar’dan geri getirebilirsin'); } else if(which==='repo'){ data.settings.hideRepoBanner=true; toast('Repoya bağlan gizlendi · Ayarlar’dan geri getirebilirsin'); } haptic(10); save(); render(); };
App.showBugunCard=function(which){ if(!data.settings) data.settings={}; if(which==='location') data.settings.hideLocationCard=false; else if(which==='repo') data.settings.hideRepoBanner=false; haptic(10); save(); render(); };
App.hideStepRemind=function(){ ui.stepRemindHidden=true; render(); };
App.hideWaterNudge=function(){ ui.waterNudgeHidden=true; render(); };
App.setWalkMinutes=function(el){ var raw=el.value; debounceSave('walkM',function(){ var day=curDay(); var v=raw===''?null:Number(raw); day.walk.minutes=(v==null||isNaN(v))?null:Math.round(v); day.savedAt=new Date().toISOString(); save(); }); };

// ---- Apple Health import ----
App.importHealthClick=function(){ var f=document.getElementById('sey-health-file'); if(f) f.click(); };
App.importHealthFile=function(el){ var file=el.files&&el.files[0]; el.value=''; if(!file) return; var st=document.getElementById('sey-health-status'); var name=(file.name||'').toLowerCase();
  if(name.indexOf('.zip')>=0){ if(st) st.textContent='Zip doğrudan açılamıyor; lütfen zip içindeki export.xml dosyasını seç.'; return; }
  if(st) st.textContent='Okunuyor…';
  var r=new FileReader();
  r.onload=function(){ try{ parseHealthXML(String(r.result)); }catch(e){ if(st) st.textContent='Dosya okunamadı.'; } };
  r.onerror=function(){ if(st) st.textContent='Dosya okunamadı.'; };
  r.readAsText(file);
};
function parseHealthXML(xml){
  var st=document.getElementById('sey-health-status'); var today=todayStr();
  var steps=0,sleepMs=0,found=false; var recRe=/<Record\b[^>]*>/g, rm;
  while((rm=recRe.exec(xml))){ var tag=rm[0];
    var type=(tag.match(/type="([^"]+)"/)||[])[1]; if(!type) continue;
    if(type.indexOf('StepCount')<0 && type.indexOf('SleepAnalysis')<0) continue;
    var sd=(tag.match(/startDate="([^"]+)"/)||[])[1]; var ed=(tag.match(/endDate="([^"]+)"/)||[])[1]; var val=(tag.match(/value="([^"]*)"/)||[])[1];
    if(!sd||sd.slice(0,10)!==today) continue; found=true;
    if(type.indexOf('StepCount')>=0){ steps+=Number(val)||0; }
    else if(type.indexOf('SleepAnalysis')>=0 && /Asleep/i.test(val||'')){ var t1=Date.parse(sd),t2=Date.parse(ed); if(t1&&t2&&t2>t1) sleepMs+=(t2-t1); }
  }
  var d=getDay(data,today,dayIndexFor(today)); var msgs=[];
  if(steps>0){ d.walk.steps=Math.round(steps); msgs.push(Math.round(steps)+' adım'); }
  if(sleepMs>0){ var hrs=Math.round(sleepMs/3600000*10)/10; d.sleep.hours=hrs; msgs.push(hrs+' sa uyku'); }
  var nwH=syncDerivedHabits(d); if(nwH.indexOf('walked20')>=0) msgs.push('yürüyüş tiki'); if(nwH.indexOf('sleepReg')>=0) msgs.push('uyku tiki');
  if(steps>0||sleepMs>0){ d.savedAt=new Date().toISOString(); save(); render(); }
  if(st) st.textContent=(steps>0||sleepMs>0)?('İçe aktarıldı: '+msgs.join(' · ')):(found?'Bugün için adım/uyku verisi bulunamadı.':'Bugüne ait kayıt yok. Dosya güncel mi?');
}

// ---- cycle actions ----
App.logPeriodToday=function(){ var t=todayStr(); if(data.cycle.periods.some(function(p){return p.start===t;})){ toast('Bugün zaten kayıtlı'); return; } data.cycle.periods.push({start:t,end:null}); recalcCycle(); commit('Regl başlangıcı eklendi'); };
App.setPeriodField=function(idx,which,el){ var p=data.cycle.periods[idx]; if(!p) return; p[which]=el.value||null; recalcCycle(); commit(); };
App.removePeriod=function(idx){ if(data.cycle.periods[idx]){ data.cycle.periods.splice(idx,1); recalcCycle(); commit('Kayıt silindi'); } };
App.setFlow=function(id){ var day=curDay(); day.flow=(day.flow===id?null:id); day.savedAt=new Date().toISOString(); commit(); };
App.toggleSymptom=function(id){ var day=curDay(); var i=day.symptoms.indexOf(id); if(i>=0) day.symptoms.splice(i,1); else day.symptoms.push(id); day.savedAt=new Date().toISOString(); commit(); };
App.setBodyView=function(v){ ui.bodyView=(v==='back'?'back':'front'); render(); };
App.cycleDiscomfort=function(id){ var day=curDay(); if(!day.discomfort) day.discomfort=emptyDiscomfort(); var reg=day.discomfort.regions||(day.discomfort.regions={}); var cur=(reg[id]&&reg[id].level)||0; var nx=(cur+1)%4; if(nx===0) delete reg[id]; else reg[id]={level:nx}; day.savedAt=new Date().toISOString(); commit(); };
App.setDiscomfortNote=function(el){ var v=el.value; debounceSave('dzNote',function(){ var day=curDay(); if(!day.discomfort) day.discomfort=emptyDiscomfort(); day.discomfort.note=v; day.savedAt=new Date().toISOString(); save(); },400); };
App.addDiscomfortMed=function(){ var day=curDay(); if(!day.discomfort) day.discomfort=emptyDiscomfort(); if(!Array.isArray(day.discomfort.meds)) day.discomfort.meds=[]; day.discomfort.meds.push({name:'',dose:'',time:'',note:''}); day.savedAt=new Date().toISOString(); commit(); };
App.quickDiscomfortMed=function(i){ var day=curDay(); if(!day.discomfort) day.discomfort=emptyDiscomfort(); if(!Array.isArray(day.discomfort.meds)) day.discomfort.meds=[]; var nm=(DMEDS[i]||'').split(' (')[0]; day.discomfort.meds.push({name:nm,dose:'',time:'',note:''}); day.savedAt=new Date().toISOString(); commit(); };
App.setDiscomfortMed=function(idx,field,el){ var v=el.value; debounceSave('dzMed-'+idx+'-'+field,function(){ var day=curDay(); var m=day.discomfort&&day.discomfort.meds&&day.discomfort.meds[idx]; if(!m) return; m[field]=v; day.savedAt=new Date().toISOString(); save(); },350); };
App.removeDiscomfortMed=function(idx){ var day=curDay(); if(day.discomfort&&day.discomfort.meds&&day.discomfort.meds[idx]!=null){ day.discomfort.meds.splice(idx,1); day.savedAt=new Date().toISOString(); commit(); } };
function recalcCycle(){ var st=cycleStats(); data.cycle.avgCycle=st.avgCycle; data.cycle.avgPeriod=st.avgPeriod; }
// ── Kriz odaları (modal): Tatlı · Yemek · Kahve ──
App.openCrisis=function(kind){ if(!CRISES[kind]) return; haptic([16,40,16]); clearInterval(crisisInterval); ui.crisisKind=kind; ui.crisisOpts=[]; ui.crisisTriggers=[]; ui.crisisNote=''; ui.crisisLeft=CRISES[kind].secs; ui.crisisTiming=false; ui.crisisDone=false; lastCrisisKind=null; render(); };
App.closeCrisis=function(){ clearInterval(crisisInterval); ui.crisisTiming=false; ui.crisisKind=null; render(); };
App.toggleCrisisOpt=function(o){ var i=ui.crisisOpts.indexOf(o); if(i>=0) ui.crisisOpts.splice(i,1); else ui.crisisOpts.push(o); render(); };
App.toggleCrisisTrigger=function(id){ var i=ui.crisisTriggers.indexOf(id); if(i>=0) ui.crisisTriggers.splice(i,1); else ui.crisisTriggers.push(id); render(); };
App.onCrisisNote=function(el){ ui.crisisNote=String(el.value||'').slice(0,200); };
App.startCrisisTimer=function(){ var C=CRISES[ui.crisisKind]; if(!C) return; clearInterval(crisisInterval); ui.crisisTiming=true; ui.crisisLeft=C.secs; render(); crisisInterval=setInterval(function(){ ui.crisisLeft--; if(ui.crisisLeft<=0){ clearInterval(crisisInterval); ui.crisisLeft=0; ui.crisisTiming=false; var CC=CRISES[ui.crisisKind]; var d=getDay(data,todayStr(),dayIndexFor(todayStr())); if(CC) d[CC.doneField]=true; syncDerivedHabits(d); d.savedAt=new Date().toISOString(); save(); render(); haptic([16,40,16]); if(CC) toast(CC.doneToast,3000); } else { updateCrisisTimer(); } },1000); };
function updateCrisisTimer(){ var el=document.getElementById('crisis-clock'); if(el){ el.textContent=pad(Math.floor(ui.crisisLeft/60))+':'+pad(ui.crisisLeft%60); } }
App.completeCrisis=function(){ var C=CRISES[ui.crisisKind]; if(!C) return; var date=todayStr(), day=getDay(data,date,dayIndexFor(date)); day.cravingSOSCount=(day.cravingSOSCount||0)+1; day[C.doneField]=true; if(!Array.isArray(day.cravingOptionsUsed)) day.cravingOptionsUsed=[]; ui.crisisOpts.forEach(function(o){ if(day.cravingOptionsUsed.indexOf(o)<0) day.cravingOptionsUsed.push(o); }); if(!Array.isArray(day.cravingTriggers)) day.cravingTriggers=[]; var nowIso=new Date().toISOString(); ui.crisisTriggers.forEach(function(tg){ day.cravingTriggers.push({trigger:tg,ts:nowIso,kind:C.key}); }); var tn=String(ui.crisisNote||'').trim().slice(0,200); if(tn) day.cravingTriggerNote=tn; syncDerivedHabits(day); day.savedAt=nowIso; clearInterval(crisisInterval); ui.crisisTiming=false; ui.crisisDone=true; commit('Krizi yönettin'); };
App.resetCrisis=function(){ var C=CRISES[ui.crisisKind]; clearInterval(crisisInterval); ui.crisisOpts=[]; ui.crisisTriggers=[]; ui.crisisNote=''; ui.crisisLeft=C?C.secs:600; ui.crisisTiming=false; ui.crisisDone=false; render(); };

App.openEmergency=function(){ ui.emergency=true; render(); };
App.closeEmergency=function(){ ui.emergency=false; render(); };
App.continueEmergency=function(){ ui.emergency=false; render(); toast('İşte bu. Reset dediğin bazen sadece bir sonraki doğru hamledir.',3000); };
App.emergencyNote=function(){ ui.emergency=false; ui.tab='bugun'; render(); setTimeout(function(){ var ta=document.querySelector('textarea'); if(ta) ta.focus(); },150); };

App.openDate=function(date){
  var rec=data.days[date]||null; var idx=dayIndexFor(date);
  var habits=HABITS.map(function(h){ return {label:h.title,mark:(rec&&rec.habits[h.key])?('<span style="color:#3F8A4F;display:inline-flex;">'+icon('circle-check',16)+'</span>'):('<span style="color:var(--faint);display:inline-flex;">'+icon('circle',16)+'</span>')}; });
  var cnt=countRec(rec); var ht=habitCountOn(date); var strong=Math.ceil(ht*0.66), medium=Math.ceil(ht*0.34); var status='Zor gün'; if(cnt>=ht)status='Kraliçe günü'; else if(cnt>=strong)status='Güzel gün'; else if(cnt>=medium)status='İdare eder';
  var mood=rec&&rec.mood?find(MOODS,'id',rec.mood):null;
  var sl=rec&&rec.sleep?rec.sleep:{}, wk=rec&&rec.walk?rec.walk:{};
  var mealsList=[]; if(rec&&rec.meals){ MEALS.forEach(function(m){ if(rec.meals[m.key]&&String(rec.meals[m.key]).trim()) mealsList.push({label:m.label,icon:m.icon,text:String(rec.meals[m.key])}); }); }
  var flowO=rec&&rec.flow?find(FLOW,'id',rec.flow):null;
  var symsList=(rec&&rec.symptoms||[]).map(function(id){ var s=find(SYMPTOMS,'id',id); return s?s.emoji+' '+s.label:id; });
  ui.dayDetail={date:date,isToday:(date===todayStr()),title:(idx>=1?'Gün '+idx:shortDate(date)),dateLabel:shortDate(date),status:status,habits:habits,moodLabel:mood?mood.label:'—',sosCount:rec?(rec.cravingSOSCount||0):0,note:(rec&&rec.note)||'',hasNote:!!(rec&&rec.note),intention:(rec&&rec.intention)||'',hasIntention:!!(rec&&rec.intention&&String(rec.intention).trim()),gratitude:(rec&&Array.isArray(rec.gratitude))?rec.gratitude.filter(function(g){return String(g||'').trim();}):[],
    sleepH:(sl.hours!=null?sl.hours:null),steps:(wk.steps!=null?wk.steps:null),mins:(wk.minutes!=null?wk.minutes:null),meals:mealsList,flow:flowO?flowO.label:null,syms:symsList};
  render();
};
App.closeDetail=function(){ ui.dayDetail=null; render(); };
// ---- geçmiş gün düzenleme moduna gir / çık ----
App.editDay=function(date){
  if(!data||!date) return;
  var t=todayStr();
  if(diffDays(t,date)>0) return;      // yalnızca gelecek düzenlenemez (geçmiş ve bugün olur)
  if(date===t){ App.exitEdit(true); ui.dayDetail=null; App.go('bugun'); return; }
  ui.editDate=date; ui.editStartMs=Date.now(); ui.dayDetail=null; ui.tab='bugun';
  render(); var sc=document.querySelector('[data-scroll]'); if(sc) sc.scrollTop=0;
};
App.exitEdit=function(silent){
  if(!ui.editDate){ if(!silent) render(); return; }
  ui.editDate=null; ui.editStartMs=0; render();
  var sc=document.querySelector('[data-scroll]'); if(sc) sc.scrollTop=0;
  if(!silent) toast('Bugüne döndük');
};
App.maybeAutoExitEdit=function(reason){
  if(!ui.editDate) return false;
  ui.editDate=null; ui.editStartMs=0; render();
  var sc=document.querySelector('[data-scroll]'); if(sc) sc.scrollTop=0;
  toast(reason||'Bugüne döndük',2800);
  return true;
};
App.calMove=function(delta){ var ym=(ui.calMonth||todayStr().slice(0,7)).split('-'); var d=new Date(+ym[0],+ym[1]-1+delta,1); ui.calMonth=d.getFullYear()+'-'+pad(d.getMonth()+1); render(); };
App.calToday=function(){ ui.calMonth=todayStr().slice(0,7); render(); var sc=document.querySelector('[data-scroll]'); if(sc) sc.scrollTop=0; };
App.heatYear=function(delta){ var startY=+String(data.startDate).slice(0,4); var nowY=new Date().getFullYear(); var y=(+(ui.heatYear||nowY))+delta; if(y<startY)y=startY; if(y>nowY)y=nowY; ui.heatYear=y; render(); };
App.heatOpen=function(date){ ui.tab='harita'; ui.calMonth=String(date).slice(0,7); App.openDate(date); };

App.exportJson=function(){ var blob=new Blob([JSON.stringify(data,null,2)],{type:'application/json'}); download(blob,'seyma-yedek.json'); toast('Yedek indirildi'); };
function download(blob,name){ var a=document.createElement('a'); a.href=URL.createObjectURL(blob); a.download=name; document.body.appendChild(a); a.click(); a.remove(); setTimeout(function(){ URL.revokeObjectURL(a.href); },1500); }
App.importClick=function(){ var f=document.getElementById('sey-file'); if(f) f.click(); };
App.importJson=function(el){ var f=el.files&&el.files[0]; if(!f) return; var r=new FileReader(); r.onload=function(){ try{ var d=JSON.parse(r.result); if(d&&d.version&&d.days&&d.startDate){ data=d; ui.tab='bugun'; commit('Yedek yüklendi'); } else toast('Dosya okunamadı'); }catch(err){ toast('Dosya okunamadı'); } }; r.readAsText(f); el.value=''; };

App.askReset=function(){ ui.resetStep=1; render(); };
App.cancelReset=function(){ ui.resetStep=0; render(); };
App.resetConfirm=function(){ if(ui.resetStep===1){ ui.resetStep=2; render(); return; } try{ localStorage.removeItem(KEY); }catch(e){} data=null; ui.resetStep=0; ui.tab='bugun'; render(); };
App.toggleLocation=function(){
  if(!data.settings) data.settings={};
  if(data.settings.locationEnabled){ data.settings.locationEnabled=false; data.settings.locationDisabledAt=new Date().toISOString(); data.settings.locationDisabledReason='manual'; stopLocationWatch(); save(); render(); toast('Konum paylaşımı kapatıldı'); return; }
  ui.locationConsent=true; render();
};
App.cancelLocationConsent=function(){ ui.locationConsent=false; render(); };
App.confirmLocationConsent=function(){
  ui.locationConsent=false;
  if(!data.settings) data.settings={};
  if(!navigator.geolocation){ render(); toast('Bu cihaz konumu desteklemiyor'); return; }
  data.settings.locationEnabled=true;
  data.settings.locationEnabledAt=new Date().toISOString();
  data.settings.locationEnabledReason='manual';
  data.settings.locationDisabledAt='';
  data.settings.locationDisabledReason='';
  save(); render(); toast('Konum izni isteniyor…');
  startLocationWatch(true);
};
App.setLocationMode=function(m){
  if(m!=='walk'&&m!=='vehicle'&&m!=='auto') return;
  if(!data.settings) data.settings={};
  data.settings.locationMode=m; save(); render();
  toast(m==='walk'?'Yürüyüş modu':m==='vehicle'?'Araç modu':'Otomatik mod');
};
// ---------- Konum-açma nazik dürtme (sağlık-çerçeveli, dağınık aralıklı) ----------
var LOC_BENEFITS=[
  {i:icon('footprints',17), t:'Adımların kendiliğinden sayılsın — elle uğraşmadan hareket hedefin dolsun.'},
  {i:icon('footprints',17), t:'Günün ne kadarı yürüyüş, ne kadarı koltukta? Konum açıkken ikisi ayrı görünür.'},
  {i:icon('stethoscope',17), t:'Uzun süre aynı yerde kalınca dolaşım yavaşlar; kart sana minik molaları hatırlatır.'},
  {i:icon('dumbbell',17), t:'Aktivite halkaların tahminle değil, gerçek hareketinle dolsun.'},
  {i:icon('leaf',17), t:'Kısa bir yürüyüş bile ruh hâline iyi gelir — ölçmek fark etmeyi kolaylaştırır.'},
  {i:icon('compass',17), t:'Hareketinin haritası çıkınca “bugün az kıpırdadım” günlerini kolayca yakalarsın.'},
  {i:icon('heart',17), t:'Kalbini en çok düzenli hareket mutlu eder; önce onu görünür kılalım.'},
  {i:icon('sun',17), t:'Güne ne kadar hareket kattığını görmek küçük ama gerçek bir motivasyon.'},
  {i:icon('car',17), t:'Uzun yolculuklarda saatler otururken akıp gider; kart yalnızca hareket eden dakikalarını ayrı sayar.'},
  {i:icon('clock',17), t:'Günün kaç saati yolda, kaç dakikası ayakta geçti? İkisini görünce dengeyi kurmak kolaylaşır.'},
  {i:icon('route',17), t:'Kat ettiğin yolun ne kadarı tekerlekte, ne kadarı adımlarında? Konum açıkken ikisi ayrılır.'},
  {i:icon('activity',17), t:'Uzun oturuşlarda bacak dolaşımı yavaşlar; kart minik mola vaktini nazikçe hatırlatır.'},
  {i:icon('armchair',17), t:'Koltukta geçen süre sessizce birikir; ölçünce kısa aralar güne kendiliğinden serpilir.'},
  {i:icon('car',17), t:'Bugün kaç km yol yaptın? Mesafeni görmek arada bir esneme molasını hatırlatır.'},
  {i:icon('clock',17), t:'Aynı pozisyonda geçen uzun dakikalar sırtı yorar; kart kıpırdama zamanını gösterir.'},
  {i:icon('droplet',17), t:'Uzun yolda su içmek ve birkaç adım dolaşımı korur; kart bu ritmi tutmana yardımcı olur.'},
  {i:icon('droplets',17), t:'Uzun süre sabit kalınca ayaklarda şişlik olabilir; hareket dakikaların görününce dengelemek kolay.'},
  {i:icon('brain',17), t:'Yol yorgunluğu zihni de yorar; kısa bir yürüyüş molası odağını tazeler — kart anını yakalar.'},
  {i:icon('target',17), t:'Adım hedefin yolda eriyorsa kart seni nazikçe uyarır; akşam küçük bir tur telafi eder.'},
  {i:icon('wind',17), t:'Derin bir nefes ve birkaç adım, uzun sürüşün gerginliğini alır; kart mola vaktini hatırlatır.'}
];
var LOC_NUDGE={ minGapH:6, maxPerDay:2, prob:0.60, delayMinMs:3000, delayMaxMs:7000, dwellMs:8000, laterH:8, dismissH:4, backoffH:2, backoffMaxH:24, stopAfter:8, whisperDays:3 };
var locNudgeTimer=null;
function ensureLocNudge(){
  if(!data) return null;
  if(!data.locNudge||typeof data.locNudge!=='object') data.locNudge={};
  var ln=data.locNudge;
  if(typeof ln.shownCount!=='number') ln.shownCount=0;
  if(typeof ln.dismissCount!=='number') ln.dismissCount=0;
  if(typeof ln.dismissStreak!=='number') ln.dismissStreak=0;
  if(typeof ln.benefitIdx!=='number') ln.benefitIdx=0;
  if(typeof ln.optedOut!=='boolean') ln.optedOut=false;
  if(typeof ln.dayCount!=='number') ln.dayCount=0;
  if(typeof ln.dayKey!=='string') ln.dayKey='';
  if(typeof ln.lastShownAt!=='string') ln.lastShownAt='';
  if(typeof ln.snoozeUntil!=='string') ln.snoozeUntil='';
  if(typeof ln.optOutDay!=='string') ln.optOutDay='';
  return ln;
}
function locNudgeEligible(){
  if(!data||!data.settings) return false;
  if(data.settings.locationEnabled) return false;        // konum açıksa asla
  if(ui.locNudgeOpen) return false;                      // zaten açık
  if(ui.tab!=='bugun'&&ui.tab!=='saglik') return false;  // yalnız sağlıkla ilgili sekmeler
  if(editing()) return false;
  if(ui.locationConsent||ui.dayDetail||ui.emergency||ui.resetStep>0||ui.readingOpen||ui.watchOpen||ui.listeningOpen||ui.learningOpen||ui.weatherOpen||ui.roomOpen||ui.forceStart) return false;
  var ln=ensureLocNudge(); if(!ln) return false;
  var now=Date.now(), t=todayStr();
  if(ln.dayKey!==t){ ln.dayKey=t; ln.dayCount=0; }
  if(ln.optOutDay===t) return false;                     // "bugün gösterme" → yalnız bugünlük sus
  if(ln.dayCount>=LOC_NUDGE.maxPerDay) return false;
  if(ln.snoozeUntil){ var su=new Date(ln.snoozeUntil).getTime(); if(!isNaN(su)&&now<su) return false; }
  var gapH=(ln.dismissCount>=LOC_NUDGE.stopAfter)?(LOC_NUDGE.whisperDays*24):LOC_NUDGE.minGapH;
  if(ln.lastShownAt){ var ls=new Date(ln.lastShownAt).getTime(); if(!isNaN(ls)&&(now-ls)<gapH*3600000) return false; }
  return true;
}
function tryLocNudge(reason){
  if(locNudgeTimer) return;
  if(!locNudgeEligible()) return;
  if(Math.random()>LOC_NUDGE.prob) return;               // dağınık his (her fırsatta değil)
  var span=LOC_NUDGE.delayMaxMs-LOC_NUDGE.delayMinMs;
  var delay=LOC_NUDGE.delayMinMs+Math.round(Math.random()*span);
  locNudgeTimer=setTimeout(function(){ locNudgeTimer=null; openLocNudgeNow(); }, delay);
}
function openLocNudgeNow(){
  if(!locNudgeEligible()) return;                        // gecikme sırasında koşul değiştiyse iptal
  var ln=ensureLocNudge(); var n=LOC_BENEFITS.length;
  var count=(Math.random()<0.5)?1:2, picks=[];
  for(var i=0;i<count;i++){ picks.push(LOC_BENEFITS[(ln.benefitIdx+i)%n]); }
  ln.benefitIdx=(ln.benefitIdx+count)%n;
  ui.locNudgeShown=picks; ui.locNudgeOpen=true;
  ln.lastShownAt=new Date().toISOString(); ln.shownCount++; ln.dayCount++;
  save(); render();
}
function closeLocNudge(kind){
  var ln=ensureLocNudge(); var now=Date.now();
  ln.dismissCount++; ln.dismissStreak=(ln.dismissStreak||0)+1;
  var baseH=(kind==='later')?LOC_NUDGE.laterH:LOC_NUDGE.dismissH;
  var backoff=Math.min(LOC_NUDGE.backoffMaxH, ln.dismissStreak*LOC_NUDGE.backoffH);
  ln.snoozeUntil=new Date(now+(baseH+backoff)*3600000).toISOString();
  ui.locNudgeOpen=false; ui.locNudgeShown=[]; save(); render();
}
App.locNudgeOpenConsent=function(){ ui.locNudgeOpen=false; ui.locNudgeShown=[]; ui.locationConsent=true; render(); };
App.locNudgeSnooze=function(){ closeLocNudge('later'); };
App.locNudgeDismiss=function(){ closeLocNudge('dismiss'); };
App.locNudgeOptOut=function(){ var ln=ensureLocNudge(); if(ln) ln.optOutDay=todayStr(); ui.locNudgeOpen=false; ui.locNudgeShown=[]; save(); render(); toast('Tamam, bugünlük kapattım — yarın yine buradayım'); };
App.toggleWeather=function(){ ui.weatherOpen=!ui.weatherOpen; render(); };
App.toggleDailyPhoto=function(){ ui.dailyPhotoOpen=!ui.dailyPhotoOpen; render(); };
App.refreshDailyPhoto=function(){ data.dailyPhoto.date=''; data.dailyPhoto.url=''; fetchDailyPhoto(); };
function prefersReducedMotion(){ return !!(window.matchMedia && matchMedia('(prefers-reduced-motion: reduce)').matches); }
// Premium akordeon: gövdeyi (.sey-collbody) ölçülmüş max-height ile yumuşakça aç/kapat.
// Layout sıçraması yok; kapanınca DOM'u yeni (kapalı) hâle çevirir.
function animateCardCollapse(el, done){
  var body=el&&el.querySelector('.sey-collbody');
  var chev=el&&el.querySelector('.sey-collchev');
  if(chev) chev.style.transform='rotate(0deg)';
  if(!body || prefersReducedMotion()){ done(); return; }
  var hpx=body.scrollHeight+'px';
  body.style.overflow='hidden'; body.style.maxHeight=hpx; body.style.opacity='1';
  body.getBoundingClientRect(); // reflow
  body.style.transition='max-height .26s var(--ease-premium,cubic-bezier(.33,1,.68,1)),opacity .2s ease';
  body.style.maxHeight='0px'; body.style.opacity='0';
  var fired=false, fin=function(){ if(fired) return; fired=true; done(); };
  body.addEventListener('transitionend', fin, {once:true});
  setTimeout(fin, 340);
}
function animateCardExpand(el){
  var body=el&&el.querySelector('.sey-collbody');
  if(!body || prefersReducedMotion()) return;
  var hpx=body.scrollHeight+'px';
  body.style.overflow='hidden'; body.style.maxHeight='0px'; body.style.opacity='0';
  body.getBoundingClientRect(); // reflow
  body.style.transition='max-height .3s var(--ease-premium,cubic-bezier(.33,1,.68,1)),opacity .26s ease';
  body.style.maxHeight=hpx; body.style.opacity='1';
  var clear=function(){ body.style.maxHeight=''; body.style.overflow=''; body.style.transition=''; body.style.opacity=''; };
  body.addEventListener('transitionend', clear, {once:true});
  setTimeout(clear, 380);
}
App.toggleCard=function(key){
  if(!ui.cards) ui.cards={};
  var willOpen=!ui.cards[key];
  // Yerinde güncelleme yalnızca CARD_BUILDERS'ta kayıtlı kartlar için çalışır.
  // Kayıtsız kartlar (ör. SOS "ne denedin"/"tetikleyici" kartları) eskiden yerinde
  // yenilenemediği için aç/kapa tıklaması sessizce çalışmıyordu — bu güvenli yol,
  // kayıtsız kartlarda durumu değiştirip tam render ederek kesin ve anlaşılır kılar.
  if(!CARD_BUILDERS[key]){ ui.cards[key]=willOpen; haptic(8); render(); return; }
  var el=document.querySelector('[data-cardkey="'+key+'"]');
  if(!willOpen && el){
    animateCardCollapse(el, function(){ ui.cards[key]=false; updateCardByKey(key); });
    return;
  }
  ui.cards[key]=true;
  updateCardByKey(key);
  var el2=document.querySelector('[data-cardkey="'+key+'"]'); if(el2) animateCardExpand(el2);
};
function updateMotivationCard(){
  // Terapi Odası açıkken içerik tam ekran overlay'de; küçültme vb. değişimlerde
  // tüm ekranı yeniden çiz. Kapalıyken kompakt kartı yerinde güncelle.
  if(ui.roomOpen){ render(); return; }
  var el=document.getElementById('sey-motivation-card'); if(!el) return;
  var t=document.createElement('div'); t.innerHTML=motivationTodayCardHTML();
  if(t.firstChild) el.replaceWith(t.firstChild);
}
// Tam ekran Terapi Odası: dokununca animasyonlu açılır, kapanınca animasyonlu
// İçsel Pusula kartına döner.
App.openRoom=function(){
  if(!featuresLive()){ toast('İçsel Pusula 13 Temmuz\'da açılıyor'); return; }
  ui.roomOpen=true; ui.motivationMinimumOpen=false;
  // Kaydedilmiş günü düzenleyebilmek için: bugünün kaydı varsa yansımayı input'a getir.
  var M=window.MotivationProgramV2, stt=M?M.dayState(data,activeDate()):null;
  var done=!!(stt&&(stt.status==='completed'||stt.status==='minimum_completed'));
  if(done) ui.motivationReflectionDraft=String(stt.reflection||'');
  haptic(12); render();
};
App.closeRoom=function(){
  var ov=document.getElementById('sey-room-overlay'), sh=document.getElementById('sey-room-sheet');
  if(ov&&sh&&!prefersReducedMotion()){
    sh.style.transition='transform .26s var(--ease-premium,cubic-bezier(.16,1,.3,1)),opacity .24s ease';
    sh.style.transform='scale(.965)'; sh.style.opacity='0';
    ov.style.transition='opacity .24s ease'; ov.style.opacity='0';
    setTimeout(function(){ ui.roomOpen=false; render(); },240);
  } else { ui.roomOpen=false; render(); }
  haptic(8);
};
// Geriye dönük uyumluluk (eski çağrılar tam ekran odayı açsın).
App.toggleMotivationCard=function(){ if(ui.roomOpen) App.closeRoom(); else App.openRoom(); };
App.goStart=function(){ ui.forceStart=true; ui.tab='bugun'; render(); };
App.startDateChange=function(el){ var v=el.value; if(!v) return; data.startDate=v; commit('Başlangıç tarihi güncellendi'); };

// Rastgele, bir öncekiyle asla aynı olmayan indeks seç.
function randNoteIdx(n,cur){ if(n<2) return 0; var t; do{ t=Math.floor(Math.random()*n); }while(t===cur); return t; }
App.anotherNote=function(){ var n=NOTES.length, cur=((ui.noteIndex%n)+n)%n; ui.noteIndex=randNoteIdx(n,cur); render(); };
App.cycleRasit=function(){
  var n=NOTES.length, base=Math.max(1,dayIndexFor(activeDate()))-1;
  var curDisp=((base+(ui.noteIndex||0))%n+n)%n;
  var target=randNoteIdx(n,curDisp);
  ui.noteIndex=((target-base)%n+n)%n; // görüntülenen indeks tam olarak `target` olur
  var el=document.getElementById('sey-rasit-note');
  if(el){ el.style.opacity='0'; setTimeout(function(){ el.textContent=NOTES[target]; el.style.opacity='1'; },150); }
  haptic(10); save();
};
App.printReport=function(){ openReport(); };
function syncFieldUpdate(){ var s=document.getElementById('sey-sync-status'); if(s&&window.SeySync) s.textContent=window.SeySync.statusText(); }
App.setGhToken=function(el){ if(!data.settings) data.settings={}; data.settings.ghToken=normalizeToken(el.value||''); save(); syncFieldUpdate(); };
// Anahtarı kopyalama kaynaklı bozulmalardan temizle: "Bearer " öneki, tırnaklar,
// boşluklar ve görünmez (zero-width) karakterler 401 hatasının başlıca sebebidir.
function sanitizeApiKey(v){ var s=String(v||'').trim(); s=s.replace(/^Bearer\s+/i,''); s=s.replace(/^["'`]+|["'`]+$/g,''); s=s.replace(/[\s\u200B-\u200D\uFEFF\u00A0]/g,''); return s; }
// OpenAI hata kodlarını kullanıcının anlayacağı Türkçe mesaja çevir.
function openaiErrText(status,raw){ var m=String(raw||''); if(status===401||/invalid_api_key|Incorrect API key/i.test(m)) return 'OpenAI anahtarın geçersiz görünüyor. Ayarlar’dan doğru anahtarı (sk-…) yapıştırıp “Kaydet ve doğrula” yap.'; if(status===429||/insufficient_quota|exceeded your current quota/i.test(m)) return 'OpenAI hesabının kullanım kotası/bakiyesi dolmuş olabilir. platform.openai.com → Billing’den bakiye ekleyip tekrar dene.'; if(status===404||/model_not_found|does not exist|do not have access/i.test(m)) return 'Hesabın istenen yapay zekâ modeline erişemiyor. Farklı bir anahtar dene ya da model erişimi iste.'; if(status===403) return 'Erişim reddedildi (403). Anahtarının izinleri yetersiz olabilir.'; if(status===500||status===502||status===503) return 'OpenAI sunucusu şu an yanıt vermiyor. Birkaç dakika sonra tekrar dene.'; if(!status) return 'İnternet bağlantısı kurulamadı. Bağlantını kontrol edip tekrar dene.'; return 'Beklenmeyen bir hata oluştu ('+status+'). Birazdan tekrar dene.'; }
App.setOpenaiKey=function(el){ var v=el.value; if(ui.openaiKeyState&&ui.openaiKeyState!=='checking') ui.openaiKeyState=null; debounceSave('openaiKey',function(){ if(!data.settings) data.settings={}; data.settings.openaiKey=String(v||'').trim(); data.settings.lunaConnected=!!data.settings.openaiKey; save(); },500); };
App.saveOpenaiKey=function(){
  var inp=document.querySelector('input[oninput*="setOpenaiKey"]');
  var key=inp?sanitizeApiKey(inp.value):sanitizeApiKey((data.settings&&data.settings.openaiKey)||'');
  if(!data.settings) data.settings={};
  data.settings.openaiKey=key; data.settings.lunaConnected=!!key; if(inp) inp.value=key; save();
  if(!key){ ui.openaiKeyState=null; render(); toast('Anahtar temizlendi'); return; }
  if(key.slice(0,3)!=='sk-'){ ui.openaiKeyState='invalid'; render(); toast('Anahtar “sk-” ile başlamalı — OpenAI anahtarını kontrol et'); return; }
  ui.openaiKeyState='checking'; render();
  fetch('https://api.openai.com/v1/models',{headers:{'Authorization':'Bearer '+key}})
    .then(function(r){
      if(r.ok){ ui.openaiKeyState='valid'; if(data.settings) data.settings.lunaConnected=true; save(); render(); toast('Anahtar doğrulandı ✓'); }
      else if(r.status===401){ ui.openaiKeyState='invalid'; if(data.settings) data.settings.lunaConnected=false; save(); render(); toast('Anahtar geçersiz — kopyalarken karakter eksik/fazla olabilir'); }
      else if(r.status===429){ ui.openaiKeyState=null; render(); toast('Anahtar kaydedildi ama kota/bakiye dolu olabilir ⏳'); }
      else { ui.openaiKeyState=null; render(); toast('Kaydedildi (doğrulanamadı, '+r.status+')'); }
    })
    .catch(function(){ ui.openaiKeyState=null; render(); toast('Kaydedildi (ağ doğrulaması yapılamadı)'); });
};
App.setGhRepo=function(el){ if(!data.settings) data.settings={}; data.settings.ghRepo=(el.value||'').trim(); save(); syncFieldUpdate(); };
App.setHealthGistId=function(el){ if(!data.settings) data.settings={}; data.settings.healthGistId=normalizeToken(el.value||''); debounceSave('healthGistId',function(){ save(); },400); };
App.setGhBranch=function(el){ if(!data.settings) data.settings={}; data.settings.ghBranch=(el.value||'').trim(); save(); syncFieldUpdate(); };
App.syncNow=function(){ if(window.SeySync){ window.SeySync.pushNow(); toast('Kaydediliyor…'); } else { toast('Sync hazır değil'); } };
App.saveToday=function(){ getDay(data,todayStr(),dayIndexFor(todayStr())); save(); if(!syncConfigured()){ toast('Önce Ayarlar\'dan repoya bağlan'); App.go('ayarlar'); return; } if(window.SeySync){ window.SeySync.pushNow(); toast('Kaydediliyor…'); } };
App.enableKeyEdit=function(){ ui.keyEdit=true; render(); };
App.cancelKeyEdit=function(){ ui.keyEdit=false; render(); };

// ---------- report (print -> Safari "PDF olarak kaydet") ----------
function reportHTML(){
  var st=getStats(); var days=allDays();
  var range=shortDate(data.startDate)+' – '+shortDate(todayStr());
  var h='';
  h+='<div style="text-align:center;padding:30px 0 24px;border-bottom:2px solid #F2E1DA;margin-bottom:26px;">';
  h+='<div style="font-size:34px;font-weight:800;">Şeyma 🦩</div>';
  h+='<div style="font-size:16px;color:#7A6B70;margin-top:6px;">Minik Denge Günlüğü</div>';
  h+='<div style="font-size:14px;color:#9C8C92;margin-top:12px;">'+range+'</div>';
  h+='<div style="font-size:14px;color:#6B4A3A;margin-top:10px;font-style:italic;">Diyet değil. Küçük kontrol notları.</div></div>';
  h+='<div style="font-size:20px;font-weight:800;margin:0 0 14px;">Özet</div>';
  var stats=[['Toplam tamamlanan tik',st.total],['Tatlı kontrolü günü',st.tot.sweetManaged],['Akşam kontrolü günü',st.tot.eveningControl],['Yürüyüş günü',st.tot.walked20],['Protein günü',st.tot.protein],['Su günü',st.tot.water],['D₃K₂ damla günü',st.tot.vitaminD],['Kendine iyi davranma günü',st.tot.selfKind],['En iyi seri',st.best+' gün'],['En sık mod',st.mood]];
  h+='<div style="display:flex;flex-wrap:wrap;gap:10px;margin-bottom:26px;">';
  stats.forEach(function(s){ h+='<div style="flex:1 1 30%;min-width:150px;background:#FFF8F3;border:1px solid #F2E1DA;border-radius:12px;padding:12px 14px;"><div style="font-size:12px;color:#9C8C92;">'+esc(s[0])+'</div><div style="font-size:20px;font-weight:800;margin-top:3px;">'+esc(s[1])+'</div></div>'; });
  h+='</div>';
  h+='<div style="font-size:20px;font-weight:800;margin:0 0 14px;">İlk 3 Hafta</div><div style="display:flex;gap:12px;margin-bottom:26px;">';
  [0,1,2].forEach(function(w){ var b=weekBlock(w,days); h+='<div style="flex:1;background:#FFF8F3;border:1px solid #F2E1DA;border-radius:12px;padding:14px;"><div style="font-size:15px;font-weight:800;margin-bottom:8px;">'+esc(b.title)+'</div>'; b.rows.forEach(function(r){ h+='<div style="display:flex;justify-content:space-between;font-size:12px;margin-bottom:5px;"><span style="color:#5A4D52;">'+esc(r.label)+'</span><b>'+esc(r.val)+'</b></div>'; }); h+='<div style="font-size:11px;color:#7A6B70;margin-top:6px;border-top:1px solid #F2E1DA;padding-top:6px;">Ort. '+esc(b.avg)+' · Seri '+esc(b.best)+'</div></div>'; });
  h+='</div>';
  h+='<div style="font-size:20px;font-weight:800;margin:0 0 14px;">Günlük Tablo (tüm kayıt)</div>';
  h+='<table style="width:100%;border-collapse:collapse;font-size:12px;margin-bottom:24px;"><thead><tr style="background:#F7DDE5;">';
  ['Gün','Tarih','Tik','Mod','Adım','Uyku','Kriz','Kısa not'].forEach(function(x){ h+='<th style="text-align:left;padding:7px 9px;border:1px solid #F2E1DA;">'+x+'</th>'; });
  h+='</tr></thead><tbody>';
  days.forEach(function(o){ var rec=o.rec; var mood=rec&&rec.mood?find(MOODS,'id',rec.mood):null; var esr=effSteps(rec); var st=esr.steps!=null?(esr.steps.toLocaleString('tr-TR')+(esr.source==='tracked'?'~':'')):'—'; var sh=(rec&&rec.sleep&&rec.sleep.hours!=null)?(rec.sleep.hours+' sa'):'—'; h+='<tr><td style="padding:6px 9px;border:1px solid #F2E1DA;">'+o.i+'</td><td style="padding:6px 9px;border:1px solid #F2E1DA;">'+shortDate(o.date)+'</td><td style="padding:6px 9px;border:1px solid #F2E1DA;">'+countRec(rec)+'/'+habitCountOn(o.date)+'</td><td style="padding:6px 9px;border:1px solid #F2E1DA;">'+(mood?esc(mood.short):'—')+'</td><td style="padding:6px 9px;border:1px solid #F2E1DA;">'+esc(st)+'</td><td style="padding:6px 9px;border:1px solid #F2E1DA;">'+esc(sh)+'</td><td style="padding:6px 9px;border:1px solid #F2E1DA;">'+(rec?rec.cravingSOSCount||0:0)+'</td><td style="padding:6px 9px;border:1px solid #F2E1DA;">'+esc((rec&&rec.note)?String(rec.note).slice(0,42):'')+'</td></tr>'; });
  h+='</tbody></table>';
  h+='<div style="background:#FFE8A3;border-radius:12px;padding:18px;text-align:center;font-size:15px;font-weight:600;color:#6B4A3A;">Küçük seçimler görünmez gibi durur ama birikince ritim olur.</div>';
  return h;
}
function getStats(){
  var days=allDays(); var keys=HABITS.map(function(h){return h.key;}); var tot={}; keys.forEach(function(k){tot[k]=0;});
  var total=0; var moods={};
  days.forEach(function(d){ if(d.rec){ keys.forEach(function(k){ if(d.rec.habits[k]) tot[k]++; }); total+=countRec(d.rec); if(d.rec.mood) moods[d.rec.mood]=(moods[d.rec.mood]||0)+1; } });
  return {tot:tot,total:total,best:bestStreak(days),mood:topMood(moods),days:days};
}
function openReport(){
  var w=window.open('','_blank');
  if(!w){
    // Quick Look / pop-up engelli: aynı sayfada yazdırılabilir katman
    inlinePrint(); return;
  }
  var doc='<!DOCTYPE html><html lang="tr"><head><meta charset="utf-8"><title>Şeyma 🦩 Rapor</title>'
    +'<style>@page{margin:14mm;}body{font-family:-apple-system,Segoe UI,Roboto,Arial,sans-serif;color:#2C2426;margin:0;padding:24px;}@media print{.noprint{display:none;}}</style></head><body>'
    +'<div class="noprint" style="text-align:center;margin-bottom:18px;"><button onclick="window.print()" style="border:none;background:#E9AFC1;color:#fff;font-weight:700;font-size:15px;padding:12px 22px;border-radius:12px;cursor:pointer;">Yazdır / PDF kaydet</button></div>'
    +reportHTML()+'</body></html>';
  w.document.open(); w.document.write(doc); w.document.close();
  setTimeout(function(){ try{ w.focus(); w.print(); }catch(e){} },500);
}
function inlinePrint(){
  var ov=document.getElementById('sey-print'); if(ov) ov.remove();
  var ov2=document.createElement('div'); ov2.id='sey-print';
  ov2.innerHTML='<style>@media print{body *{visibility:hidden;}#sey-print,#sey-print *{visibility:visible;}#sey-print{position:absolute;left:0;top:0;width:100%;}#sey-print .pbar{display:none;}}</style>'
    +'<div class="pbar" style="position:sticky;top:0;display:flex;gap:10px;justify-content:center;padding:12px;background:#fff;border-bottom:1px solid #eee;">'
    +'<button id="sey-print-do" style="border:none;background:#E9AFC1;color:#fff;font-weight:700;font-size:15px;padding:12px 22px;border-radius:12px;">Yazdır / PDF kaydet</button>'
    +'<button id="sey-print-close" style="border:1px solid #ddd;background:#fff;color:#555;font-weight:600;font-size:15px;padding:12px 18px;border-radius:12px;">Kapat</button></div>'
    +'<div style="max-width:780px;margin:0 auto;padding:24px;font-family:-apple-system,Segoe UI,Roboto,Arial,sans-serif;color:#2C2426;">'+reportHTML()+'</div>';
  ov2.style.cssText='position:fixed;inset:0;z-index:9999;background:#fff;overflow:auto;-webkit-overflow-scrolling:touch;';
  document.body.appendChild(ov2);
  document.getElementById('sey-print-do').onclick=function(){ window.print(); };
  document.getElementById('sey-print-close').onclick=function(){ ov2.remove(); };
}

// ---------- render ----------
function el(html){ var d=document.createElement('div'); d.innerHTML=html; return d; }

function needsAuth(){
  if(!data||!data.settings||!data.settings.auth) return true;
  var a=data.settings.auth;
  // Bu oturumda açıldıysa kilidi aş.
  if(ui.authUnlocked) return false;
  // "Beni hatırla" seçiliyse ve daha önce doğru giriş yapıldıysa kilidi aş.
  if(a.rememberMe&&a.usernameHash&&a.unlockedAt) return false;
  return true;
}

function authGateHTML(){
  var remember=!!ui.authRemember;
  var preview=(data&&data.settings&&data.settings.auth&&data.settings.auth.usernameMask)?data.settings.auth.usernameMask:'';
  var shake=ui.authError?' sey-auth-shake':'';
  var errorBlock=ui.authError?('<div id="sey-auth-error" class="sey-auth-error" style="display:block;">'+esc(ui.authErrorMsg||'Kullanıcı adı veya parola eşleşmedi. Tekrar dene, gözün korkmasın.')+'</div>'):'';
  var rememberIcon=remember?'☑':'☐';
  var previewBlock=preview?'<div class="sey-auth-preview">Hatırlatma: kullanıcı adın <b>'+esc(preview)+'</b></div>':'';
  return '<div class="sey-auth-backdrop'+shake+'">'
    +'<div class="sey-auth-glow"></div>'
    +'<div class="sey-auth-card">'
      +'<div class="sey-auth-mascot">🦩</div>'
      +'<h1 class="sey-auth-title">Sevgili Günışığı</h1>'
      +'<p class="sey-auth-subtitle">Günışığı kapısı seni bekliyor</p>'
      +previewBlock
      +'<div class="sey-auth-field">'
        +'<label for="sey-auth-user">Kullanıcı adı</label>'
        +'<input id="sey-auth-user" type="text" autocomplete="username" placeholder="Kullanıcı adın" />'
      +'</div>'
      +'<div class="sey-auth-field">'
        +'<label for="sey-auth-pass">Parola</label>'
        +'<input id="sey-auth-pass" type="password" autocomplete="current-password" placeholder="Parolan" />'
      +'</div>'
      +'<div class="sey-auth-options">'
        +'<span class="sey-auth-remember" onclick="App.toggleRememberAuth()">'+rememberIcon+' Beni hatırla</span>'
        +'<span class="sey-auth-hint">Aynı değer her iki alana da yazılır</span>'
      +'</div>'
      +errorBlock
      +'<button class="sey-auth-btn" onclick="App.submitAuth()">Giriş yap ✨</button>'
      +'<p class="sey-auth-footer">Unutursan parola kullanıcı adınla aynıdır.</p>'
    +'</div>'
  +'</div>';
}

function render(){
  var root=document.getElementById('root');
  root.setAttribute('data-theme', dark?'dark':'light');
  var app=document.getElementById('app');

  // Kilit ekranı: şifre doğrulanmadan onboarding/ana arayüz görünmez.
  if(needsAuth()){
    app.innerHTML=authGateHTML();
    lastRenderTab=null; lastOverlay=null; lastOverlayView=null; lastHeaderShown=false;
    // Hatayı görselleştirdikten sonra bayrağı sıfırla; sarsıntı sınıfı CSS animasyonu kaldırır.
    if(ui.authError) setTimeout(function(){ ui.authError=false; ui.authErrorMsg=''; },300);
    return;
  }

  if(!data || ui.forceStart){ app.innerHTML=onboardingHTML(); lastRenderTab=null; lastOverlay=null; lastOverlayView=null; lastHeaderShown=false; return; }

  // Faz 05/06: ANA UYGULAMA KİLİDİ. `data.psych`'ten tamamen ayrı bir mekanizma.
  // 174/174 tamamlanana (`status==='completed'`) kadar Bugün/Sağlık/Rapor/Mesaj/Harita/
  // Saygı sekmeleri kilitli — yalnızca Ayarlar (gizlilik/veri-silme/senkron) erişilebilir
  // kalır (bkz. REPO_INTEGRATION_ARCHITECTURE.md § Erişim). Puanlama/rapor burada YOK
  // (bkz. Faz 07-09); 174. maddeden sonra yalnızca geçici tamamlanma (completedAt) yazılır.
  // 2026-07-13: Değerlendirme artık ana arayüzde inaktif; sonuçlar panelde görünür.
  // Kod ve veri korundu; settings.profileAssessmentInactive ile istenirse yeniden açılabilir.
  var pa=ensureProfileAssessment(data);
  if(!data.settings.profileAssessmentInactive && (pa.status!=='completed' || ui.profileAssessmentCompletionShown) && ui.tab!=='ayarlar'){
    app.innerHTML=renderProfileAssessmentGate()+modalsHTML();
    lastRenderTab=null; lastOverlay=null; lastOverlayView=null; lastHeaderShown=false;
    try{ var pg=document.getElementById('pa-gate'); if(pg&&pg.focus) pg.focus(); }catch(e){}
    return;
  }

  var prevScroll=document.querySelector('[data-scroll]');
  var prevTop=prevScroll?prevScroll.scrollTop:0;
  var sameTab=(lastRenderTab===ui.tab);

  // Hub overlay (Ne okudum / Ne izledim): sekme degistirirken tam DOM yeniden kurulur;
  // acik kalan overlay'in scroll'unu yakala ki flash olmadan geri koyalim
  var prevOvBody=document.getElementById('sey-ov-body');
  var prevOvTop=prevOvBody?prevOvBody.scrollTop:0;
  // Kriz modalı: etkileşimde (seçenek/tetik işaretleme) modal yeniden kurulur; gövde
  // scroll'unu yakala ki flash olmadan geri koyalım.
  var prevCrisisBody=document.getElementById('sey-crisis-body');
  var prevCrisisTop=prevCrisisBody?prevCrisisBody.scrollTop:0;
  if(saygiReadObserver){ try{ saygiReadObserver.disconnect(); }catch(e){} saygiReadObserver=null; }
  var curOverlay=ui.readingOpen?'reading':(ui.watchOpen?'watching':(ui.listeningOpen?'listening':(ui.learningOpen?'learning':null)));
  var curOverlayView=curOverlay==='reading'?(ui.readingView||'today'):(curOverlay==='watching'?(ui.watchView||'today'):(curOverlay==='listening'?(ui.listeningView||'today'):null));

  var vtSupported=('startViewTransition' in document)&&!(window.matchMedia&&window.matchMedia('(prefers-reduced-motion: reduce)').matches);
  var useVT=vtSupported&&!sameTab;
  var _painted=false;
  function paint(){
    if(_painted) return; _painted=true;
    app.classList.remove('sey-page-in');
  var html=appHeaderHTML(); // başlangıç ekranı hariç her sekmenin en üstünde sabit marka başlığı
  // Flex içinde min-height:0 kritik: özellikle uzun Sağlık sayfasında içerik alanı
  // kabuğu büyütmek yerine kendi içinde kayar; sticky alt nav yerinden oynamaz.
  html+='<div data-scroll class="scroll sey-main-scroll" style="flex:1;min-height:0;overflow-y:auto;padding:14px 16px 28px;display:flex;flex-direction:column;gap:14px;">';
  if(editing()) html+=editBanner();
  if(ui.tab==='bugun') html+=bugunHTML();
  else if(ui.tab==='saglik') html+=saglikHTML();
  else if(ui.tab==='saygi') html+=saygiHTML();
  else if(ui.tab==='harita') html+=haritaHTML();
  else if(ui.tab==='rapor') html+=raporHTML();
  else if(ui.tab==='mesaj') html+=mesajHTML();
  else if(ui.tab==='ayarlar') html+=ayarlarHTML();
  html+='</div>';
  html+=navHTML();
  html+=modalsHTML();
  app.innerHTML=html;
  if(ui.tab==='bugun' && !editing()){ maybeFetchWeather(); maybeFetchDailyPhoto(); }
  if(ui.tab==='mesaj') aeonLoadVisibleMedia();

  var newScroll=document.querySelector('[data-scroll]');
  if(newScroll){
    wireAppHeaderScroll(newScroll);
    if(ui.tab==='saygi') wireSaygiReadGate(newScroll);
    if(ui.tab==='mesaj' && (!sameTab || ui.aeonScrollBottom)){
      // ÆON sohbeti: açılışta ve yeni mesaj/cevap sonrası en alta (en yeni mesaja) kaydır
      var firstM=newScroll.firstElementChild; if(firstM){ firstM.style.animation='none'; }
      newScroll.scrollTop=newScroll.scrollHeight;
      ui.aeonScrollBottom=false;
    } else if(useVT){
      // Sekme geçişinde View Transition içerik akışını üstlensin — alt kartların
      // teker teker float-in animasyonlarını sustur; sayfa düzeyinde tek premium akış kalsın.
      try{
        var ins=newScroll.querySelectorAll('[style*="seyFloatIn"],[style*="seyFade"],[style*="seyPop"]');
        for(var _i=0;_i<ins.length;_i++){ ins[_i].style.animation='none'; }
      }catch(e){}
      newScroll.scrollTop=0;
    } else if(sameTab){
      // Aynı sekmede veri kaydı sonrası: kaydırma konumunu koru ve TÜM giriş animasyonlarını
      // tekrar oynatma (tik/mod/yazı gibi kayıtlarda kartların "refresh" gibi titremesini önler).
      // Ambient (sonsuz) animasyonlar seyShine/seyRoomGlow etkilenmez; yalnızca tek-seferlik
      // seyFloatIn/seyFade/seyPop giriş animasyonları susturulur.
      var firstEl=newScroll.firstElementChild;
      if(firstEl){ firstEl.style.animation='none'; }
      try{
        var ins=newScroll.querySelectorAll('[style*="seyFloatIn"],[style*="seyFade"],[style*="seyPop"]');
        for(var _i=0;_i<ins.length;_i++){ ins[_i].style.animation='none'; }
      }catch(e){}
      newScroll.scrollTop=prevTop;
    }
    if(ui.tab==='mesaj'){
      // Yukarı kaydırılınca beliren "en alta in" düğmesi (premium WhatsApp-tarzı FAB)
      var aeonFab=document.getElementById('aeon-scroll-fab');
      if(aeonFab){
        var toggleAeonFab=function(){ var nb=(newScroll.scrollHeight-newScroll.scrollTop-newScroll.clientHeight)<160; aeonFab.style.display=nb?'none':'flex'; };
        newScroll.addEventListener('scroll',toggleAeonFab,{passive:true});
        toggleAeonFab();
      }
    }
  }

  // Overlay ayni kaldiysa (sekme degisimi veya ic veri aksiyonu): giris animasyonunu tekrar oynatma -> flash yok
  if(curOverlay && curOverlay===lastOverlay){
    var ovBack=document.getElementById('sey-ov-back');
    var ovCard=document.getElementById('sey-ov-card');
    if(ovBack) ovBack.style.animation='none';
    if(ovCard) ovCard.style.animation='none';
    var ovBody=document.getElementById('sey-ov-body');
    // Ayni sekmede kaldiysak scroll'u koru; sekme degistiyse en uste don
    if(ovBody && curOverlayView===lastOverlayView) ovBody.scrollTop=prevOvTop;
  }
  // Terapi Odası zaten açıkken yapılan etkileşim render'larında (ör. "Görevi küçült")
  // tek-seferlik giriş animasyonlarını (seyPop/seyFloatIn/seyFade) sustur → parlama/flash yok.
  // İlk açılışta (lastRoomOpen=false) animasyonlar normal oynar; sürekli seyShine parıltısı etkilenmez.
  if(ui.roomOpen && lastRoomOpen){
    var roomSheet=document.getElementById('sey-room-sheet');
    var roomBack=document.getElementById('sey-room-overlay');
    if(roomBack) roomBack.style.animation='none';
    if(roomSheet){
      roomSheet.style.animation='none';
      try{ var rin=roomSheet.querySelectorAll('[style*="seyFloatIn"],[style*="seyFade"],[style*="seyPop"]'); for(var _r=0;_r<rin.length;_r++){ rin[_r].style.animation='none'; } }catch(e){}
    }
  }
  lastRoomOpen=ui.roomOpen;
  // Kriz modalı zaten açıkken yapılan etkileşim render'larında giriş animasyonunu
  // tekrar oynatma → flash yok; gövde scroll'unu koru.
  if(ui.crisisKind && lastCrisisKind===ui.crisisKind){
    var crBack=document.getElementById('sey-crisis-back');
    var crCard=document.getElementById('sey-crisis-card');
    if(crBack) crBack.style.animation='none';
    if(crCard){ crCard.style.animation='none'; try{ var cin=crCard.querySelectorAll('[style*="seyFloatIn"],[style*="seyFade"],[style*="seyPop"]'); for(var _c=0;_c<cin.length;_c++){ cin[_c].style.animation='none'; } }catch(e){} }
    var crBody=document.getElementById('sey-crisis-body');
    if(crBody){ crBody.scrollTop=prevCrisisTop; } // etkileşimde scroll konumunu koru → flash yok
  }
  lastCrisisKind=ui.crisisKind;
  // Sabit marka başlığı: giriş animasyonunu yalnızca ilk görünümde oynat (her render'da tekrar etmesin).
  if(lastHeaderShown){ var _hdr=document.querySelector('.sey-appheader'); if(_hdr) _hdr.style.animation='none'; }
  lastHeaderShown=true;
  lastOverlay=curOverlay;
  lastOverlayView=curOverlayView;
  lastRenderTab=ui.tab;
  }
  // Sekme değişiminde premium sayfa geçişi (View Transitions API); aynı sekmede
  // veri güncellemelerinde VT kullanma — anlık render kalsın, geçiş yorgunluğu olmasın.
  if(useVT){
    try{ document.startViewTransition(function(){ paint(); }); }
    catch(e){ paint(); }
  } else {
    paint();
    // VT desteklenmeyen tarayıcılarda hafif sayfa-giriş fallback'i (yalnızca sekme değişiminde)
    if(!sameTab){ var _app=document.getElementById('app'); if(_app){ _app.classList.remove('sey-page-in'); void _app.offsetWidth; _app.classList.add('sey-page-in'); } }
  }
}

function onboardingHTML(){
  // v2.0 boot screen: dark → mevcut super-black, light → sıcak "delight" karşılığı.
  // Yalnızca onboarding tema-duyarlıdır; uygulamanın geri kalan tema sistemi değişmez.
  var MONO="'SF Mono',ui-monospace,'JetBrains Mono',Menlo,Consolas,'Liberation Mono',monospace";
  var P=dark?{
    mode:'super-black',page:'radial-gradient(125% 85% at 50% -5%,#12121B 0%,#0A0A0F 46%,#060608 100%)',text:'#E8E8EE',grid:'rgba(255,255,255,0.028)',strip:'#54545F',
    topGlow:'rgba(230,193,90,0.15)',sideGlow:'rgba(233,137,159,0.16)',themeBg:'rgba(255,255,255,0.045)',themeBd:'rgba(255,255,255,0.10)',themeText:'#A2A2AD',
    wordGrad:'linear-gradient(110deg,#FBE7CB,#F4B9CE 42%,#D9C2FF 66%,#FBE7CB)',wordShadow:'drop-shadow(0 2px 16px rgba(230,193,90,0.32))',
    superGrad:'linear-gradient(110deg,#B6B6C1,#F3F3F8 38%,#7E7E8B 60%,#D4D4DD)',superShadow:'drop-shadow(0 1px 2px rgba(0,0,0,0.6)) drop-shadow(0 0 15px rgba(200,205,222,0.20))',metal:'rgba(210,210,220,0.5)',tag:'#8A8A95',
    panelBd:'rgba(255,255,255,0.09)',panelBg:'linear-gradient(180deg,rgba(255,255,255,0.04),rgba(255,255,255,0.012))',panelShadow:'0 24px 56px rgba(0,0,0,0.55),inset 0 1px 0 rgba(255,255,255,0.06)',titleBg:'rgba(255,255,255,0.02)',titleBd:'rgba(255,255,255,0.07)',titleText:'#7C7C88',desc:'#777782',
    dash:'rgba(255,255,255,0.07)',specLabel:'#5F5F69',specVal:'#A2A2AD',status:'#5E5E68',statusSep:'#33333B',aeonBg:'linear-gradient(180deg,rgba(255,255,255,0.045),transparent)',aeonBd:'rgba(255,255,255,0.08)',aeonWord:'#F7F7FA',aeonSub:'#8B8B96',privacy:'#5A5A65'
  }:{
    mode:'delight',page:'radial-gradient(125% 88% at 50% -5%,#FFFFFF 0%,#FFF8F1 48%,#F4EEFF 100%)',text:'#2B2630',grid:'rgba(84,66,92,0.050)',strip:'#817783',
    topGlow:'rgba(246,193,119,0.30)',sideGlow:'rgba(233,137,159,0.20)',themeBg:'rgba(255,255,255,0.72)',themeBd:'rgba(91,72,98,0.14)',themeText:'#5F5662',
    wordGrad:'linear-gradient(110deg,#6D4652,#B76683 42%,#7864A6 68%,#6D4652)',wordShadow:'drop-shadow(0 2px 10px rgba(183,102,131,0.16))',
    superGrad:'linear-gradient(110deg,#28252C,#625D68 40%,#3B3741 66%,#28252C)',superShadow:'drop-shadow(0 1px 0 rgba(255,255,255,0.85))',metal:'rgba(81,73,86,0.34)',tag:'#766D78',
    panelBd:'rgba(91,72,98,0.14)',panelBg:'linear-gradient(180deg,rgba(255,255,255,0.90),rgba(255,250,247,0.76))',panelShadow:'0 24px 56px rgba(91,65,78,0.14),inset 0 1px 0 rgba(255,255,255,0.95)',titleBg:'rgba(92,72,99,0.035)',titleBd:'rgba(91,72,98,0.10)',titleText:'#756B77',desc:'#766D78',
    dash:'rgba(91,72,98,0.12)',specLabel:'#918792',specVal:'#49424C',status:'#756C77',statusSep:'#C9C0CA',aeonBg:'linear-gradient(180deg,rgba(255,255,255,0.60),rgba(246,238,255,0.34))',aeonBd:'rgba(91,72,98,0.11)',aeonWord:'#29252D',aeonSub:'#6F6672',privacy:'#716873'
  };
  // modüller — boot-log satırları (ad · açıklama · accent)
  var mods=[
    ['#E9899F','icsel_pusula','duygu takibi · notlar · içgörü'],
    ['#7BA7D0','saglik.sys','uyku · su · kafein · döngü'],
    ['#E0A93C','kriz_odasi','10 dk erteleme · güvenli çıkış'],
    ['#9B7FC9','motivasyon','120 gün · görev · günlük yansıma'],
    ['#E6C15A','aeon.link','mesaj · ses · fotoğraf · gözlemci'],
    ['#6E9C6A','medya.log','kitap · film/dizi · müzik günlüğü']
  ];
  var h='<div data-onboarding-theme="'+(dark?'dark':'light')+'" style="position:relative;flex:1;min-height:0;overflow:hidden;display:flex;flex-direction:column;font-family:'+MONO+';color:'+P.text+';background:'+P.page+';padding:calc(env(safe-area-inset-top) + 18px) 20px calc(env(safe-area-inset-bottom) + 16px);animation:seyFade .45s ease;">';
  // ── iOS-27 ambient: teknik grid (kenarlarda sönümlenir) + sıcak glow'lar ──
  h+='<div style="position:absolute;inset:0;z-index:0;pointer-events:none;background-image:linear-gradient('+P.grid+' 1px,transparent 1px),linear-gradient(90deg,'+P.grid+' 1px,transparent 1px);background-size:27px 27px;-webkit-mask-image:radial-gradient(130% 92% at 50% 16%,#000 38%,transparent 80%);mask-image:radial-gradient(130% 92% at 50% 16%,#000 38%,transparent 80%);"></div>';
  h+='<div style="position:absolute;top:-9%;left:50%;transform:translateX(-50%);width:min(480px,150%);height:320px;background:radial-gradient(closest-side,'+P.topGlow+',transparent 74%);pointer-events:none;z-index:0;"></div>';
  h+='<div style="position:absolute;top:20%;right:-16%;width:240px;height:240px;background:radial-gradient(circle,'+P.sideGlow+',transparent 70%);pointer-events:none;z-index:0;"></div>';
  // ── üst: build strip ──
  h+='<div style="position:relative;z-index:1;display:flex;align-items:center;justify-content:space-between;font-size:10px;letter-spacing:1px;color:'+P.strip+';animation:seyFloatIn .5s ease both;">';
  h+='<span>SEYMA_OS</span><span style="display:inline-flex;align-items:center;gap:8px;"><span style="display:inline-flex;align-items:center;gap:6px;"><span style="width:6px;height:6px;border-radius:50%;background:#3F9E63;box-shadow:0 0 6px rgba(63,158,99,.42);animation:seyTwinkle 1.6s ease-in-out infinite;"></span>build · aeon</span><button onclick="App.toggleTheme()" aria-label="Başlangıç temasını değiştir" style="border:1px solid '+P.themeBd+';background:'+P.themeBg+';color:'+P.themeText+';border-radius:999px;padding:5px 8px;display:inline-flex;align-items:center;gap:4px;cursor:pointer;font-family:'+MONO+';font-size:9px;font-weight:800;letter-spacing:.35px;">'+icon(dark?'moon':'sun',11)+' '+P.mode+'</button></span>';
  h+='</div>';
  // ── orta blok (dikey ortalı): hero + terminal paneli ──
  h+='<div style="position:relative;z-index:1;flex:1;min-height:0;display:flex;flex-direction:column;justify-content:center;gap:15px;">';
  // HERO — Şeyma rozeti (korunur) + imza + "super-black" alt-imza + v2.0 vurgusu
  h+='<div style="display:flex;flex-direction:column;align-items:center;gap:8px;">';
  h+='<div style="position:relative;width:90px;height:90px;border-radius:28px;display:flex;align-items:center;justify-content:center;background:linear-gradient(150deg,#FFE8A3,#F7DDE5 52%,#E9CBFF);box-shadow:0 22px 52px rgba(230,193,90,0.28),0 0 0 1px rgba(255,255,255,0.10),inset 0 1.5px 0 rgba(255,255,255,0.7);overflow:hidden;animation:seyPop .6s var(--ease-premium,ease) both;">';
  h+='<span style="position:absolute;inset:0;background:linear-gradient(115deg,transparent 30%,rgba(255,255,255,0.6) 50%,transparent 70%);animation:seyShine 3.8s ease-in-out infinite;"></span>';
  h+='<span style="position:relative;font-size:48px;line-height:1;filter:drop-shadow(0 8px 14px rgba(190,108,139,0.4));">🦩</span></div>';
  h+='<div style="display:flex;align-items:center;justify-content:center;gap:9px;margin-top:2px;animation:seyFloatIn .5s .06s ease both;"><span class="sey-wordmark" style="font-size:44px;background:'+P.wordGrad+';-webkit-background-clip:text;background-clip:text;-webkit-text-fill-color:transparent;filter:'+P.wordShadow+';">Şeyma</span><span class="sey-wordmark-flam" style="font-size:26px;">🦩</span></div>';
  // "super-black" — imza fontunda metalik gümüş alt-imza
  h+='<div style="display:flex;align-items:center;gap:9px;margin-top:-4px;animation:seyFloatIn .5s .09s ease both;"><span style="width:26px;height:1px;background:linear-gradient(90deg,transparent,'+P.metal+');"></span><span class="sey-wordmark" style="font-size:25px;background:'+P.superGrad+';-webkit-background-clip:text;background-clip:text;-webkit-text-fill-color:transparent;filter:'+P.superShadow+';">'+P.mode+'</span><span style="width:26px;height:1px;background:linear-gradient(90deg,'+P.metal+',transparent);"></span></div>';
  h+='<div style="display:flex;align-items:center;gap:10px;margin-top:2px;animation:seyFloatIn .5s .12s ease both;"><span style="font-size:12px;letter-spacing:1.5px;color:'+P.tag+';text-transform:uppercase;">minik denge günlüğü</span><span style="font-size:11.5px;font-weight:800;letter-spacing:.5px;color:#140C10;background:linear-gradient(135deg,#F2D98C,#E9AEC6);border-radius:999px;padding:3px 11px;box-shadow:0 6px 18px rgba(230,193,90,0.20);">v2.0</span></div>';
  h+='</div>';
  // TERMINAL PANEL — modüller boot-log + ÆON imzası
  h+='<div style="border:1px solid '+P.panelBd+';border-radius:18px;overflow:hidden;background:'+P.panelBg+';box-shadow:'+P.panelShadow+';animation:seyFloatIn .5s .16s ease both;">';
  // titlebar
  h+='<div style="display:flex;align-items:center;gap:7px;padding:10px 13px;border-bottom:1px solid '+P.titleBd+';background:'+P.titleBg+';">';
  ['#FF5F57','#FEBC2E','#28C840'].forEach(function(c){ h+='<span style="width:9px;height:9px;border-radius:50%;background:'+c+';box-shadow:0 0 6px '+c+'66;"></span>'; });
  h+='<span style="margin-left:7px;font-size:11px;color:'+P.titleText+';">seyma — denge.sys</span>';
  h+='<span style="margin-left:auto;font-size:10px;color:#3F9E63;letter-spacing:.5px;">● ready</span>';
  h+='</div>';
  // body: modül satırları
  h+='<div style="padding:11px 14px;display:flex;flex-direction:column;gap:8px;">';
  mods.forEach(function(m,i){
    var delay=(0.24+i*0.05).toFixed(2);
    h+='<div style="display:grid;grid-template-columns:7px 1fr auto;column-gap:9px;row-gap:2px;align-items:center;animation:seyFloatIn .5s '+delay+'s ease both;">';
    h+='<span style="width:7px;height:7px;border-radius:50%;flex-shrink:0;background:'+m[0]+';box-shadow:0 0 8px '+m[0]+';"></span>';
    h+='<span style="min-width:0;color:'+m[0]+';font-size:11.5px;line-height:1.2;font-weight:700;">'+m[1]+'</span>';
    h+='<span style="color:#3F9E63;font-size:10px;">ok</span>';
    h+='<span style="grid-column:2 / 4;min-width:0;color:'+P.desc+';font-size:10.5px;line-height:1.25;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;">'+m[2]+'</span>';
    h+='</div>';
  });
  h+='</div>';
  // teknik özet — saklama ve eşlik modelini kısa, açık ve doğru anlatır.
  h+='<div style="padding:10px 14px 9px;border-top:1px dashed '+P.dash+';display:grid;grid-template-columns:1fr 1fr;gap:7px 14px;font-size:10px;animation:seyFloatIn .5s .44s ease both;">';
  [['günlük','önce bu cihazda'],['yedek','sen bağlarsan GitHub'],['program','120 gün · 4 faz'],['eşlik','Luna + ÆON']].forEach(function(s){
    h+='<div style="min-width:0;"><div style="color:'+P.specLabel+';margin-bottom:2px;">'+s[0]+'</div><div style="color:'+P.specVal+';line-height:1.25;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;">'+s[1]+'</div></div>';
  });
  h+='</div>';
  // hazır göstergesi
  h+='<div style="display:flex;align-items:center;gap:7px;padding:2px 14px 10px;font-size:10px;letter-spacing:.2px;color:'+P.status+';white-space:nowrap;animation:seyFloatIn .5s .48s ease both;"><span style="color:#3F9E63;">▷</span><span>store·local</span><span style="color:'+P.statusSep+';">·</span><span>sync·github</span><span style="margin-left:auto;display:inline-flex;align-items:center;gap:6px;color:#3F9E63;flex-shrink:0;">hazır <span style="width:26px;height:4px;border-radius:999px;overflow:hidden;background:'+(dark?'rgba(255,255,255,0.08)':'rgba(91,72,98,0.10)')+';display:inline-block;"><span style="display:block;height:100%;width:100%;background:linear-gradient(90deg,#E6C15A,#E9899F,#9B7FC9);"></span></span> 100%</span></div>';
  // ÆON imzası — terminali ezmeyen küçük, beyaz ve sakin güven rozeti.
  h+='<div style="display:flex;align-items:center;gap:12px;padding:12px 14px 13px;border-top:1px solid '+P.aeonBd+';background:'+P.aeonBg+';animation:seyFloatIn .5s .54s ease both;">';
  h+='<div style="position:relative;width:52px;height:52px;border-radius:17px;flex-shrink:0;display:flex;align-items:center;justify-content:center;color:#101017;background:linear-gradient(145deg,#FFFFFF,#E9E9EF);border:1px solid '+(dark?'rgba(255,255,255,0.10)':'rgba(91,72,98,0.12)')+';box-shadow:'+(dark?'0 10px 25px rgba(255,255,255,0.12)':'0 10px 25px rgba(91,65,78,0.14)')+',inset 0 1px 0 #FFFFFF,inset 0 -2px 5px rgba(40,40,55,0.12);overflow:hidden;">';
  h+='<span style="position:absolute;inset:0;background:linear-gradient(115deg,transparent 30%,rgba(255,255,255,0.9) 50%,transparent 70%);animation:seyShine 4s ease-in-out infinite;"></span>';
  h+='<span style="position:relative;display:inline-flex;">'+icon('hexagon',25)+'</span></div>';
  h+='<div style="flex:1;min-width:0;"><div style="font-family:-apple-system,system-ui,\'Segoe UI\',sans-serif;font-size:18px;font-weight:850;letter-spacing:3px;color:'+P.aeonWord+';">ÆON</div>';
  h+='<div style="font-size:10px;letter-spacing:.25px;color:'+P.aeonSub+';line-height:1.45;margin-top:2px;">Paylaştığın kayıtları anlamlandırır; mesaj, ses ve fotoğraflarında güvenilir bir gözlemci eşlik eder.</div></div>';
  h+='</div>';
  h+='</div>'; // terminal panel
  h+='</div>'; // orta blok
  // ── alt: CTA + gizlilik ──
  h+='<div style="position:relative;z-index:1;display:flex;flex-direction:column;gap:9px;animation:seyFloatIn .5s .56s ease both;">';
  h+='<button onclick="App.start()" style="position:relative;overflow:hidden;border:none;cursor:pointer;width:100%;padding:16px;border-radius:16px;font-family:'+MONO+';font-size:15px;font-weight:800;letter-spacing:.3px;color:#180D14;background:linear-gradient(135deg,#F4DCA0,#E9AEC6 52%,#CBB8FF);box-shadow:0 18px 40px rgba(233,137,159,0.30),inset 0 1px 0 rgba(255,255,255,0.4);display:flex;align-items:center;justify-content:center;gap:8px;"><span style="position:absolute;inset:0;background:linear-gradient(115deg,transparent 35%,rgba(255,255,255,0.5) 50%,transparent 65%);animation:seyShine 4.2s ease-in-out infinite;"></span><span style="position:relative;">❯ Tamam Raşit, başlayalım</span></button>';
  h+='<p style="margin:0;text-align:center;font-size:10px;line-height:1.5;color:'+P.privacy+';">Günlüğün önce bu cihazda saklanır. Yedekleme ancak sen bağlarsan açılır; kontrol her zaman sende kalır. 🔒</p>';
  h+='</div>';
  h+='</div>';
  return h;
}

// ── Faz 7: Psikolojik durum tespiti anketi (iki haftada bir, zorunlu, yalnızca-tık) ──
function psychFlat(){ var out=[]; PSYCH_SCALES.forEach(function(s){ s.items.forEach(function(it,qi){ out.push({s:s,qi:qi,item:it}); }); }); return out; }
// Panel için okunur soru & cevap dökümü (panelde PSYCH_SCALES yok, bu yüzden burada denormalize edilir)
function psychBuildQA(ans){
  ans=ans||{}; var out=[];
  PSYCH_SCALES.forEach(function(s){
    var a=ans[s.id]||[];
    s.items.forEach(function(it,qi){
      var oi=a[qi], lbl='—';
      if(oi!=null && s.scale && s.scale[oi]!=null){
        lbl=s.scale[oi];
        if(s.anchors){ if(oi===0) lbl+=' ('+s.anchors[0]+')'; else if(oi===s.scale.length-1) lbl+=' ('+s.anchors[1]+')'; }
      }
      out.push({scale:s.title, icon:s.icon, q:it.q, a:lbl});
    });
  });
  return out;
}
function psychOptions(sid,qi,s,cur){
  var h='';
  if(s.anchors){
    h+='<div style="display:flex;justify-content:space-between;font-size:11.5px;color:var(--faint);margin-bottom:9px;padding:0 2px;"><span>'+esc(s.anchors[0])+'</span><span style="text-align:right;">'+esc(s.anchors[1])+'</span></div>';
    h+='<div style="display:flex;gap:6px;justify-content:space-between;">';
    s.scale.forEach(function(lbl,oi){
      var sel=cur===oi;
      h+='<button onclick="App.psychAnswer(\''+sid+'\','+qi+','+oi+')" style="flex:1;min-width:0;height:46px;border-radius:14px;cursor:pointer;font-size:15px;font-weight:800;transition:all .15s;'+(sel?'color:#fff;background:linear-gradient(135deg,#E9AFC1,#C9B8FF);border:none;box-shadow:0 6px 14px rgba(233,175,193,0.4);':'color:var(--text2);background:var(--card);border:1px solid var(--field-bd);')+'">'+lbl+'</button>';
    });
    h+='</div>';
  } else {
    h+='<div style="display:flex;flex-direction:column;gap:9px;">';
    s.scale.forEach(function(lbl,oi){
      var sel=cur===oi;
      var st=sel?'background:linear-gradient(135deg,rgba(255,232,163,0.6),rgba(247,221,229,0.75));border:1px solid #E9AFC1;color:#5A2E2A;box-shadow:0 6px 14px rgba(233,175,193,0.3);':'background:var(--card);border:1px solid var(--card-bd);color:var(--text);';
      h+='<button onclick="App.psychAnswer(\''+sid+'\','+qi+','+oi+')" style="display:flex;align-items:center;gap:11px;width:100%;padding:14px 16px;border-radius:16px;cursor:pointer;transition:all .18s;'+st+'"><span style="width:24px;height:24px;border-radius:50%;flex-shrink:0;display:flex;align-items:center;justify-content:center;font-weight:800;color:#fff;background:'+(sel?'linear-gradient(135deg,#E9AFC1,#C9B8FF)':'transparent')+';border:'+(sel?'none':'2px solid var(--field-bd)')+';">'+(sel?icon('check',13):'')+'</span><span style="flex:1;text-align:left;font-size:15px;font-weight:600;">'+esc(lbl)+'</span></button>';
    });
    h+='</div>';
  }
  return h;
}
function psychMotiv(idx,T){
  var p=idx/T;
  if(idx===0) return 'Başlıyoruz — acele yok';
  if(Math.abs(p-0.5)<0.03) return 'Tam yarıladın';
  if(p<0.25) return 'Güzel başladın';
  if(p<0.5) return 'Akışa girdin, harikasın.';
  if(p<0.75) return 'Yarıyı geçtin, çok iyi gidiyorsun';
  if(p<0.9) return 'Az kaldı, neredeyse bitti';
  return 'Son birkaç soru — süpersin!';
}
function psychReachCreator(){
  try{
    if(window.SeySync){
      var ts=new Date().toISOString(), qid='psos_'+Date.now().toString(36);
      var msg='[SOS — Şeyma yardım istedi] Şeyma “Zor hissediyorum” diyerek doğrudan sana ulaşmak istedi (tanıma anketi ekranından SOS butonu). Lütfen en kısa sürede nazikçe yanında ol.';
      if(typeof window.SeySync.pushPing==='function') window.SeySync.pushPing({id:qid,question:msg,ts:ts});
    }
    haptic([15,60,15]);
  }catch(e){}
}
function psychSosHTML(){
  var sent=!!ui.psychSosSent;
  var h='<div style="animation:seyFade .3s ease;display:flex;flex-direction:column;gap:16px;align-items:center;text-align:center;padding:6px 6px 12px;">';
  h+='<div style="width:78px;height:78px;border-radius:24px;display:flex;align-items:center;justify-content:center;font-size:38px;background:linear-gradient(135deg,#FFD9E1,#C9B8FF);box-shadow:0 12px 30px rgba(233,175,193,0.45);animation:seyPop .35s ease;display:flex;align-items:center;justify-content:center;">'+(sent?icon('heart',34):icon('heart-handshake',34))+'</div>';
  if(!sent){
    h+='<h2 style="margin:0;font-size:23px;font-weight:800;">Yalnız değilsin</h2>';
    h+='<p style="margin:0;font-size:15.5px;line-height:1.6;color:var(--text2);max-width:350px;">Şu an zorlanıyorsan bunu tek başına taşımak zorunda değilsin. Aşağıdaki butona dokunursan Raşit’e <b>doğrudan</b> haber gider ve en kısa sürede yanında olur.</p>';
    h+='<button onclick="App.psychReachCreator()" style="border:none;cursor:pointer;width:100%;max-width:360px;padding:16px 18px;border-radius:20px;color:#fff;background:linear-gradient(135deg,#E9899F,#C9B8FF);box-shadow:0 12px 28px rgba(233,175,193,0.5);display:flex;flex-direction:column;align-items:center;gap:3px;"><span style="font-size:16px;font-weight:800;">Zor hissediyorum Raşit</span><span style="font-size:11.5px;font-weight:600;opacity:0.92;">Bu buton yaratıcıya — Raşit’in tüm cihazlarını — doğrudan tetikler</span></button>';
    h+='<a href="tel:05066020098" style="text-decoration:none;border:1px solid rgba(233,175,193,0.6);cursor:pointer;width:100%;max-width:360px;padding:15px 18px;border-radius:20px;color:#B5566A;background:var(--card);display:flex;align-items:center;justify-content:center;gap:8px;font-size:15.5px;font-weight:800;box-shadow:0 6px 14px rgba(233,175,193,0.2);">'+icon('phone',16)+' Raşit’i ara</a>';
    h+='<div class="glass" style="border-radius:20px;padding:14px 16px;max-width:360px;"><p style="margin:0;font-size:13.5px;line-height:1.6;color:var(--text2);">Ani ve yoğun bir tehlike hissediyorsan lütfen <b>112</b>’yi ara. Tek başına taşımak zorunda değilsin.</p></div>';
  } else {
    h+='<h2 style="margin:0;font-size:23px;font-weight:800;">Raşit’e haber verildi</h2>';
    h+='<p style="margin:0;font-size:15.5px;line-height:1.6;color:var(--text2);max-width:350px;">Doğrudan bir bildirim gönderildi — birazdan yanında olacak. Derin bir nefes al; buradayım.</p>';
    h+='<a href="tel:05066020098" style="text-decoration:none;border:1px solid rgba(233,175,193,0.6);cursor:pointer;width:100%;max-width:360px;padding:15px 18px;border-radius:20px;color:#B5566A;background:var(--card);display:flex;align-items:center;justify-content:center;gap:8px;font-size:15.5px;font-weight:800;box-shadow:0 6px 14px rgba(233,175,193,0.2);">'+icon('phone',16)+' Raşit’i ara</a>';
    h+='<div class="glass" style="border-radius:20px;padding:14px 16px;max-width:360px;"><p style="margin:0;font-size:13.5px;line-height:1.6;color:var(--text2);">Ani ve yoğun bir tehlike hissediyorsan lütfen <b>112</b>’yi ara. Tek başına taşımak zorunda değilsin.</p></div>';
  }
  h+='</div>';
  return h;
}
function psychHTML(){
  if(!ui.psychAnswers) ui.psychAnswers={};
  if(ui.psychStep==null) ui.psychStep=0;
  var flat=psychFlat(), T=flat.length;
  if(ui.psychSOS){
    var hs='<div data-scroll class="scroll" style="flex:1;overflow-y:auto;padding:calc(env(safe-area-inset-top) + 14px) 16px calc(env(safe-area-inset-bottom) + 24px);display:flex;flex-direction:column;gap:14px;">';
    hs+='<button onclick="App.psychSOSClose()" style="align-self:flex-start;border:1px solid var(--card-bd);cursor:pointer;background:var(--card);border-radius:14px;padding:9px 15px;font-size:14px;font-weight:700;color:var(--muted);">‹ Ankete dön</button>';
    hs+=psychSosHTML();
    hs+='</div>';
    return hs;
  }
  if(ui.psychStep===0){
    var srcOpen=!!ui.psychShowSrc;
    var h='<div data-scroll class="scroll" style="flex:1;overflow-y:auto;display:flex;flex-direction:column;justify-content:flex-start;padding:calc(env(safe-area-inset-top) + 24px) 22px calc(env(safe-area-inset-bottom) + 26px);gap:17px;">';
    h+='<div style="text-align:center;display:flex;flex-direction:column;align-items:center;gap:11px;animation:seyFloatIn .5s ease both;">';
    h+='<div style="position:relative;width:78px;height:78px;border-radius:24px;display:flex;align-items:center;justify-content:center;color:#8A6A2E;background:linear-gradient(135deg,#FFE8A3,#F7DDE5);box-shadow:0 14px 34px rgba(233,175,193,0.45);overflow:hidden;"><span style="position:absolute;inset:0;background:linear-gradient(115deg,transparent 30%,rgba(255,255,255,0.55) 50%,transparent 70%);animation:seyShine 3.6s ease-in-out infinite;"></span>'+icon('brain',36)+'</div>';
    h+='<h1 style="margin:0;font-size:27px;font-weight:800;letter-spacing:-0.5px;">Seni biraz tanıyalım</h1>';
    h+='<div style="font-size:15px;color:var(--muted);line-height:1.5;">İki haftada bir tekrarlanır — tamamen dokunmayla, hiç yazı yok.</div></div>';
    h+='<div class="glass" style="border-radius:22px;padding:16px 17px;box-shadow:0 10px 26px rgba(108,74,58,0.07);animation:seyFloatIn .5s .06s ease both;">';
    h+='<div style="display:flex;gap:12px;align-items:flex-start;">';
    h+='<div style="flex-shrink:0;width:40px;height:40px;border-radius:13px;background:linear-gradient(135deg,var(--aeon2,#E6C15A),var(--aeon,#C99A3A));display:flex;align-items:center;justify-content:center;color:#1a1404;box-shadow:0 6px 15px rgba(201,160,60,0.4);">'+icon('hexagon',19)+'</div>';
    h+='<div style="flex:1;min-width:0;"><div style="font-size:13px;font-weight:800;letter-spacing:0.5px;color:#8A6A2E;">ÆON HAZIRLADI</div>';
    h+='<p style="margin:5px 0 0;font-size:14.5px;line-height:1.6;color:var(--text2);">Bu anketi senin için ben hazırladım — dünyada yaygın kullanılan, <b>bilimsel olarak geçerli</b> tarama araçlarından yararlanarak. Yaratıcımdan bunun için onay aldım.</p></div></div>';
    h+='<button onclick="App.psychToggleSrc()" style="margin-top:12px;width:100%;border:1px solid rgba(201,160,60,0.4);cursor:pointer;background:rgba(230,193,90,0.12);border-radius:12px;padding:9px 12px;font-size:12.8px;font-weight:700;color:#8A6A2E;display:flex;align-items:center;justify-content:center;gap:6px;">'+(srcOpen?('Kaynakları gizle '+icon('chevron-up',13)):('Kullanılan bilimsel kaynaklar '+icon('chevron-down',13)))+'</button>';
    if(srcOpen){
      var srcs=['ASRS-v1.1 · Dünya Sağlık Örgütü','ECR · Brennan, Clark & Shaver','GAD-7 · Spitzer ve ark.','PHQ-9 · Kroenke ve ark.','WHO-5 · Dünya Sağlık Örgütü','SCS-SF · Kristin Neff'];
      h+='<div style="margin-top:11px;display:flex;flex-direction:column;gap:7px;animation:seyFade .25s ease;">';
      srcs.forEach(function(sr){ h+='<div style="display:flex;gap:9px;align-items:baseline;font-size:12.8px;line-height:1.4;"><span style="flex-shrink:0;color:#C99A3A;">◆</span><span style="color:var(--text2);flex:1;font-weight:600;">'+esc(sr)+'</span></div>'; });
      h+='<div style="font-size:11.5px;color:var(--faint);margin-top:4px;line-height:1.5;">Hepsi kamuya açık / akademik kullanımı serbest, doğrulanmış tarama ölçekleridir.</div></div>';
    }
    h+='</div>';
    h+='<div class="glass" style="border-radius:22px;padding:18px;display:flex;flex-direction:column;gap:12px;box-shadow:0 10px 26px rgba(108,74,58,0.07);animation:seyFloatIn .5s .12s ease both;">';
    h+='<p style="margin:0;font-size:15px;line-height:1.65;color:var(--text2);">Dikkat, yakın ilişkilerde güven, ruh hâli ve kendine şefkat gibi alanlarda seni daha iyi tanımam için. Böylece sana daha isabetli ve nazik eşlik edebilirim.</p>';
    h+='<p style="margin:0;font-size:15px;line-height:1.65;color:var(--text2);">Doğru ya da yanlış cevap yok; aklına ilk geleni seç, yeter. Her soru için bir seçeneğe dokunman kâfi — yaklaşık 5 dakika.</p></div>';
    h+='<div style="display:flex;gap:11px;align-items:flex-start;background:rgba(201,184,255,0.14);border:1px solid rgba(201,184,255,0.35);border-radius:16px;padding:13px 14px;animation:seyFloatIn .5s .18s ease both;"><span style="display:inline-flex;">'+icon('heart',16)+'</span><div style="font-size:12.8px;line-height:1.55;color:var(--text2);"><b>Yanıtların, seni daha iyi tanıyıp sana nazikçe eşlik edebilmem için bana yardımcı olur.</b> Bir karne gibi ortaya dökülüp yargılanmaz; doğru ya da yanlış cevap yok. Bu bir tıbbi teşhis değil, seni tanımaya yarayan bir tarama aracıdır.</div></div>';
    h+='<button onclick="App.psychBegin()" style="border:none;cursor:pointer;width:100%;padding:17px;border-radius:20px;font-size:16.5px;font-weight:800;color:#fff;background:linear-gradient(135deg,#E9AFC1,#C9B8FF);box-shadow:0 12px 28px rgba(233,175,193,0.5);animation:seyFloatIn .5s .24s ease both;display:flex;align-items:center;justify-content:center;gap:6px;">Başlayalım '+icon('sparkles',15)+'</button>';
    h+='<button onclick="App.psychSOS()" style="border:none;cursor:pointer;background:transparent;font-size:13px;font-weight:600;color:var(--faint);text-decoration:underline;">Zor hissediyorum Raşit</button>';
    h+='</div>';
    return h;
  }
  if(ui.psychStep>T) return psychResultHTML();
  var idx=ui.psychStep-1, node=flat[idx], s=node.s, qi=node.qi;
  var cur=(ui.psychAnswers[s.id]&&ui.psychAnswers[s.id][qi]!=null)?ui.psychAnswers[s.id][qi]:null;
  var pct=Math.round(idx/T*100);
  var h='<div data-scroll class="scroll" style="flex:1;overflow-y:auto;padding:calc(env(safe-area-inset-top) + 12px) 18px calc(env(safe-area-inset-bottom) + 22px);display:flex;flex-direction:column;gap:15px;animation:seyFade .22s ease;">';
  h+='<div style="display:flex;align-items:center;gap:10px;">';
  h+='<button onclick="App.psychSOS()" style="flex-shrink:0;border:1px solid rgba(233,175,193,0.5);cursor:pointer;background:rgba(247,221,229,0.4);border-radius:12px;padding:7px 11px;font-size:12.5px;font-weight:700;color:#B5566A;">Zor an</button>';
  h+='<div style="flex:1;height:9px;border-radius:999px;background:rgba(150,110,120,0.14);overflow:hidden;"><div style="height:100%;width:'+pct+'%;border-radius:999px;background:linear-gradient(90deg,#E9899F,#C9B8FF);transition:width .35s cubic-bezier(.4,1.2,.5,1);position:relative;overflow:hidden;"><span style="position:absolute;inset:0;background:linear-gradient(115deg,transparent 30%,rgba(255,255,255,0.5) 50%,transparent 70%);animation:seyShine 2.4s ease-in-out infinite;"></span></div></div>';
  h+='<div style="flex-shrink:0;font-size:12px;font-weight:800;color:var(--faint);font-variant-numeric:tabular-nums;">'+(idx+1)+'/'+T+'</div>';
  h+='</div>';
  h+='<div style="font-size:12.5px;font-weight:700;color:var(--accent);text-align:center;margin-top:-4px;animation:seyFade .45s ease;">'+psychMotiv(idx,T)+'</div>';
  h+='<div style="display:flex;align-items:center;gap:8px;margin-top:2px;"><span style="font-size:20px;">'+s.icon+'</span><span style="font-size:12.5px;font-weight:800;letter-spacing:0.5px;color:var(--accent);text-transform:uppercase;">'+esc(s.title)+'</span></div>';
  if(qi===0) h+='<div style="font-size:13.5px;line-height:1.5;color:var(--muted);margin-top:-6px;">'+esc(s.intro)+'</div>';
  h+='<div style="animation:seyFloatIn .32s ease both;">';
  h+='<div style="font-size:19px;font-weight:700;line-height:1.45;color:var(--text);margin:2px 0 10px;">'+esc(node.item.q)+'</div>';
  h+='<div style="display:inline-flex;align-items:center;gap:7px;background:rgba(233,175,193,0.16);border:1px solid rgba(233,175,193,0.4);border-radius:999px;padding:6px 13px;margin-bottom:11px;font-size:12.8px;font-weight:700;color:#B5566A;display:inline-flex;align-items:center;gap:5px;">'+icon('search',13)+' '+esc(s.prompt||s.intro)+'</div>';
  h+=psychOptions(s.id,qi,s,cur);
  h+='</div>';
  h+='<div style="margin-top:auto;padding-top:16px;display:flex;align-items:center;">';
  h+='<button onclick="App.psychBack()" style="border:1px solid var(--card-bd);cursor:pointer;background:var(--card);border-radius:14px;padding:11px 18px;font-size:14px;font-weight:700;color:var(--muted);">‹ Geri</button>';
  if(cur!=null) h+='<button onclick="App.psychFwd()" style="margin-left:auto;border:none;cursor:pointer;border-radius:14px;padding:11px 22px;font-size:14px;font-weight:700;color:#fff;background:linear-gradient(135deg,#E9AFC1,#C9B8FF);box-shadow:0 6px 14px rgba(233,175,193,0.35);">İleri ›</button>';
  h+='</div>';
  h+='</div>';
  return h;
}
function psychResultHTML(){
  // Sonuçlar Şeyma'ya GÖSTERİLMEZ; yalnızca nazik bir teşekkür + ÆON'un değerlendirdiği bilgisi.
  var h='<div data-scroll class="scroll" style="flex:1;overflow-y:auto;padding:calc(env(safe-area-inset-top) + 26px) 22px calc(env(safe-area-inset-bottom) + 26px);display:flex;flex-direction:column;justify-content:center;align-items:center;text-align:center;gap:18px;animation:seyFade .35s ease;">';
  h+='<div style="position:relative;width:82px;height:82px;border-radius:26px;display:flex;align-items:center;justify-content:center;font-size:40px;background:linear-gradient(135deg,#FFE8A3,#F7DDE5);box-shadow:0 14px 34px rgba(233,175,193,0.45);overflow:hidden;animation:seyPop .4s ease;"><span style="position:absolute;inset:0;background:linear-gradient(115deg,transparent 30%,rgba(255,255,255,0.55) 50%,transparent 70%);animation:seyShine 3.6s ease-in-out infinite;"></span>'+icon('flower-2',36)+'</div>';
  h+='<h1 style="margin:0;font-size:26px;font-weight:800;letter-spacing:-0.5px;animation:seyFloatIn .5s .05s ease both;display:flex;align-items:center;justify-content:center;gap:8px;">Teşekkürler '+icon('flower-2',22)+'</h1>';
  h+='<div class="glass" style="border-radius:22px;padding:18px;max-width:400px;display:flex;flex-direction:column;gap:13px;box-shadow:0 10px 26px rgba(108,74,58,0.07);animation:seyFloatIn .5s .12s ease both;">';
  h+='<div style="display:flex;gap:11px;align-items:flex-start;text-align:left;">';
  h+='<div style="flex-shrink:0;width:38px;height:38px;border-radius:12px;background:linear-gradient(135deg,var(--aeon2,#E6C15A),var(--aeon,#C99A3A));display:flex;align-items:center;justify-content:center;color:#1a1404;box-shadow:0 6px 15px rgba(201,160,60,0.4);">'+icon('hexagon',18)+'</div>';
  h+='<p style="margin:0;font-size:15px;line-height:1.65;color:var(--text2);">Yanıtlarını aldım. Şimdi bunları senin için sessizce değerlendiriyorum — sana daha iyi eşlik edebilmem için.</p></div>';
  h+='<div style="border-top:1px solid var(--card-bd);padding-top:12px;font-size:13.8px;line-height:1.6;color:var(--muted);text-align:left;">Bu küçük tanışmayı <b>iki haftada bir</b> tekrarlayacağız; böylece değişimleri birlikte nazikçe fark edebiliriz.</div></div>';
  h+='<button onclick="App.psychFinish()" style="border:none;cursor:pointer;width:100%;max-width:400px;padding:17px;border-radius:20px;font-size:16.5px;font-weight:800;color:#fff;background:linear-gradient(135deg,#E9AFC1,#C9B8FF);box-shadow:0 12px 28px rgba(233,175,193,0.5);animation:seyFloatIn .5s .2s ease both;display:flex;align-items:center;justify-content:center;gap:6px;">Uygulamaya dön '+icon('sun',15)+'</button>';
  h+='<button onclick="App.psychSOS()" style="border:none;cursor:pointer;background:transparent;font-size:13px;font-weight:600;color:var(--faint);text-decoration:underline;">Zor hissediyorum Raşit</button>';
  h+='</div>';
  return h;
}
App.psychBegin=function(){ ui.psychStep=1; render(); var sc=document.querySelector('[data-scroll]'); if(sc) sc.scrollTop=0; };
App.psychToggleSrc=function(){ ui.psychShowSrc=!ui.psychShowSrc; render(); };
App.psychAnswer=function(sid,qi,oi){ if(!ui.psychAnswers) ui.psychAnswers={}; if(!ui.psychAnswers[sid]) ui.psychAnswers[sid]=[]; ui.psychAnswers[sid][qi]=oi; haptic(10); var T=psychFlat().length, was=ui.psychStep; ui.psychStep=Math.min(ui.psychStep+1,T+1); render(); var sc=document.querySelector('[data-scroll]'); if(sc) sc.scrollTop=0; if(was<=T&&ui.psychStep>T){ try{ haptic([12,40,12]); }catch(e){} setTimeout(function(){ try{ confetti(); }catch(e){} },180); } };
App.psychFwd=function(){ var T=psychFlat().length, was=ui.psychStep; ui.psychStep=Math.min(ui.psychStep+1,T+1); render(); var sc=document.querySelector('[data-scroll]'); if(sc) sc.scrollTop=0; if(was<=T&&ui.psychStep>T){ setTimeout(function(){ try{ confetti(); }catch(e){} },180); } };
App.psychBack=function(){ if(ui.psychStep>0) ui.psychStep--; render(); var sc=document.querySelector('[data-scroll]'); if(sc) sc.scrollTop=0; };
App.psychSOS=function(){ ui.psychSOS=true; ui.psychSosSent=false; render(); var sc=document.querySelector('[data-scroll]'); if(sc) sc.scrollTop=0; };
App.psychSOSClose=function(){ ui.psychSOS=false; ui.psychSosSent=false; render(); };
App.psychReachCreator=function(){ if(ui.psychSosSent) return; ui.psychSosSent=true; psychReachCreator(); render(); };
App.psychFinish=function(){
  var sc=psychScore(ui.psychAnswers);
  var now=new Date().toISOString();
  // İki haftalık ölçümlerin geçmişi — panelde karşılaştırma/trend için biriktirilir.
  // Eski (tek girişli, sürüm 1) veri varsa geçmişe taşınır; kompakt tutmak için yalnızca skor+tarih.
  var hist=[];
  if(data.psych){
    if(Array.isArray(data.psych.history)) hist=data.psych.history.slice();
    else if(data.psych.scores&&data.psych.completedAt) hist=[{completedAt:data.psych.completedAt,scores:data.psych.scores}];
  }
  hist.push({completedAt:now,scores:sc});
  if(hist.length>24) hist=hist.slice(hist.length-24);
  data.psych={version:2,completedAt:now,answers:ui.psychAnswers,scores:sc,qa:psychBuildQA(ui.psychAnswers),history:hist};
  save(); psychSafetyPing(sc); ui.psychStep=0; ui.psychSOS=false; ui.psychSosSent=false; ui.psychAnswers={}; render();
};

// Makro kalori dağılım çubuğu (protein/karbonhidrat/yağ — kalori payına göre).
function macroBarHTML(nu){
  var pCal=4*nu.protein, cCal=4*nu.carbs, fCal=9*nu.fat, tot=pCal+cCal+fCal;
  function w(x){ return tot>0?(x/tot*100):0; }
  var h='<div style="height:12px;border-radius:999px;overflow:hidden;display:flex;background:var(--icon);">';
  if(tot>0){ h+='<div style="width:'+w(pCal)+'%;background:#E9899F;"></div><div style="width:'+w(cCal)+'%;background:#F6C177;"></div><div style="width:'+w(fCal)+'%;background:#9B7FC9;"></div>'; }
  h+='</div>';
  return h;
}
// Birleşik "Beslenme" kartı: özet (makro) + "ne yedim" öğün düzenleyici, açılır/kapanır.
// Beslenme için veri-güdümlü, bilimsel premium değerlendirme. Öğün girişleriyle
// canlı güncellenir (updateNutriLive). Lif ayrı takip edilmediğinden yönlendirici
// (öneri) olarak geçer; protein/makro/glisemik okuması gerçek veriden hesaplanır.
function nutriInsightHTML(rec,nu){
  var items=nu.items||0;
  var wrap=function(inner){ return '<div style="background:linear-gradient(160deg,rgba(201,184,255,0.10),transparent);border:1px solid var(--card-bd);border-radius:16px;padding:13px;display:flex;flex-direction:column;gap:11px;">'
    +'<div style="display:flex;align-items:center;gap:7px;"><span style="display:inline-flex;color:var(--accent);">'+icon('brain',15)+'</span><span style="font-size:12px;font-weight:800;letter-spacing:.4px;color:var(--accent);text-transform:uppercase;">Bilimsel değerlendirme</span></div>'+inner+'</div>'; };
  var row=function(ic,col,title,text){ return '<div style="display:flex;gap:9px;align-items:flex-start;">'
    +'<span style="width:26px;height:26px;border-radius:9px;flex-shrink:0;display:inline-flex;align-items:center;justify-content:center;color:'+col+';background:color-mix(in srgb,'+col+' 15%, var(--icon));">'+icon(ic,14)+'</span>'
    +'<div style="flex:1;min-width:0;"><div style="font-size:12.5px;font-weight:800;color:var(--text);line-height:1.3;">'+title+'</div><div style="font-size:11.5px;color:var(--muted);line-height:1.5;margin-top:1px;">'+text+'</div></div></div>'; };
  if(items===0) return wrap(row('utensils','var(--accent)','Öğünlerini ekle, birlikte bakalım','Yediklerini yazınca protein, makro dengesi ve kan şekeri açısından kısa bilimsel bir okuma çıkarırım. Ölçmek, farkındalığın ilk adımıdır.'));
  var inner='';
  if(nu.protein>=PROTEIN_GOAL) inner+=row('activity','#3F8A4F','Protein hedefi tuttu · '+nu.protein+'g','Yeterli protein tokluk hormonlarını (GLP-1, PYY) artırır, kası korur ve kan şekerini dengeler — tatlı isteğini azaltan en güçlü kaldıraç.');
  else inner+=row('activity','#E9899F','Protein '+(PROTEIN_GOAL-nu.protein)+'g eksik · '+nu.protein+'/'+PROTEIN_GOAL+'g','Her ana öğüne ~25-30g protein hedefle; tokluğu uzatır, kas sentezini destekler ve öğün sonrası tatlı krizini yatıştırır.');
  var tot=nu.protein*4+nu.carbs*4+nu.fat*9;
  var pP=tot>0?Math.round(nu.protein*4/tot*100):0, cP=tot>0?Math.round(nu.carbs*4/tot*100):0, fP=tot>0?Math.round(nu.fat*9/tot*100):0;
  var balOk=(pP>=20&&cP<=60&&fP<=40);
  inner+=row(balOk?'leaf':'triangle-alert', balOk?'#5BA85B':'#E8A53C','Makro dağılımı · P%'+pP+' K%'+cP+' Y%'+fP, balOk?'Dengeli tabak: proteinin kalori payı iyi. Bu oran kan şekeri ve tokluk için sürdürülebilir.':'Karbonhidrat/yağ ağırlıklı görünüyor; proteini biraz artırıp rafine karbonhidratı azaltmak kan şekeri dalgalanmasını yumuşatır.');
  var pm=['breakfast','lunch','dinner'].filter(function(k){return Math.round(mealNutr(rec,k).protein)>=15;}).length;
  inner+=row('sparkles','var(--accent)','Öğün ritmi & glisemik ipucu', (pm>=2?'Proteini öğünlere yaymışsın — kas sentezi ve tokluk için ideal. ':'Proteini kahvaltıya da yaymak sabah tokluğunu artırır. ')+'Tabakta önce protein + sebze, sonra karbonhidrat: öğün sonrası kan şekeri yükselişini (glisemik yanıt) belirgin azaltır.');
  return wrap(inner);
}
function beslenmeCardHTML(rec){
  var nu=dayNutrition(rec);
  var mi=(rec&&rec.mealItems)?rec.mealItems:emptyMealItems();
  var hasName=function(k){ return Array.isArray(mi[k])&&mi[k].some(function(it){return it&&it.name&&String(it.name).trim();}); };
  var incomplete=!(hasName('breakfast')&&hasName('lunch')&&hasName('dinner'));
  var open=cardOpen('beslenme', incomplete);
  var pPct=Math.min(100,Math.round(nu.protein/PROTEIN_GOAL*100));
  var badge='<div style="text-align:right;"><div id="nutri-badgecal" style="font-size:16px;font-weight:800;color:var(--text);font-variant-numeric:tabular-nums;line-height:1;">'+nu.calories+'</div><div style="font-size:9.5px;color:var(--faint);">kcal</div></div>';
  var subtitle='<span id="nutri-subtitle">'+nu.protein+'g protein · '+nu.carbs+'g karb · '+nu.fat+'g yağ</span>';
  var b='';
  // Makro özeti
  b+='<div style="background:var(--icon);border-radius:16px;padding:13px;display:flex;flex-direction:column;gap:10px;">';
  b+='<div style="display:flex;align-items:flex-end;gap:12px;">';
  b+='<div style="flex:1;min-width:0;"><div style="display:flex;align-items:baseline;gap:6px;"><span style="font-size:11.5px;color:var(--muted);font-weight:700;">Protein</span><span id="nutri-protein" style="font-size:22px;font-weight:800;color:var(--text);font-variant-numeric:tabular-nums;">'+nu.protein+'g</span><span style="font-size:11.5px;color:var(--faint);">/ '+PROTEIN_GOAL+'g</span></div>';
  b+='<div style="height:8px;border-radius:999px;background:rgba(150,110,120,0.14);overflow:hidden;margin-top:5px;"><div id="nutri-bar" style="height:100%;width:'+pPct+'%;border-radius:999px;background:linear-gradient(90deg,#E9899F,#C9B8FF);transition:width .4s ease;"></div></div></div>';
  b+='<div style="text-align:center;flex-shrink:0;padding-left:10px;border-left:1px solid var(--card-bd);"><div id="nutri-cal" style="font-size:20px;font-weight:800;color:var(--text);font-variant-numeric:tabular-nums;line-height:1;">'+nu.calories+'</div><div style="font-size:10px;color:var(--faint);margin-top:2px;">/ '+CAL_GOAL+' kcal</div></div>';
  b+='</div>';
  b+='<div id="nutri-macrobar">'+macroBarHTML(nu)+'</div>';
  b+='<div style="display:flex;gap:12px;font-size:11px;color:var(--muted);flex-wrap:wrap;">';
  b+='<span style="display:flex;align-items:center;gap:5px;"><span style="width:9px;height:9px;border-radius:3px;background:#E9899F;"></span>Protein <b id="nutri-lp" style="color:var(--text);">'+nu.protein+'g</b></span>';
  b+='<span style="display:flex;align-items:center;gap:5px;"><span style="width:9px;height:9px;border-radius:3px;background:#F6C177;"></span>Karbonhidrat <b id="nutri-carb" style="color:var(--text);">'+nu.carbs+'g</b></span>';
  b+='<span style="display:flex;align-items:center;gap:5px;"><span style="width:9px;height:9px;border-radius:3px;background:#9B7FC9;"></span>Yağ <b id="nutri-fat" style="color:var(--text);">'+nu.fat+'g</b></span>';
  b+='</div>';
  b+='<div style="font-size:10.5px;color:var(--faint);line-height:1.45;">Kalori, girdiğin yiyeceklerin makrolarından hesaplanır (protein & karbonhidrat ×4, yağ ×9 kcal). Değerler tahminidir; yiyecek adı ve miktar netleştikçe isabet artar.</div>';
  b+='</div>';
  // Bilimsel değerlendirme (protein · makro dengesi · glisemik) — canlı güncellenir
  b+='<div id="nutri-insight">'+nutriInsightHTML(rec,nu)+'</div>';
  // Öğün düzenleyici (tabak/gr/adet)
  MEALS.forEach(function(m){
    var items=Array.isArray(mi[m.key])?mi[m.key]:[];
    var sub=mealNutr(rec,m.key);
    b+='<div style="display:flex;flex-direction:column;gap:8px;">';
    b+='<div style="display:flex;align-items:center;gap:9px;"><div style="width:32px;height:32px;border-radius:10px;flex-shrink:0;display:flex;align-items:center;justify-content:center;font-size:16px;background:var(--icon);">'+m.icon+'</div><div style="font-size:13px;font-weight:700;color:var(--text);">'+m.label+'</div><div id="meal-sub-'+m.key+'" style="margin-left:auto;font-size:11.5px;font-weight:700;color:var(--accent);">'+Math.round(sub.protein)+'g P · '+Math.round(sub.calories)+' kcal</div></div>';
    items.forEach(function(it,idx){
      b+='<div style="display:flex;gap:6px;align-items:center;">';
      b+='<input data-meal="'+m.key+'" data-idx="'+idx+'" value="'+esc(it.name||'')+'" oninput="App.setMealItemName(\''+m.key+'\','+idx+',this)" placeholder="'+esc(m.ph.split(',')[0].replace('örn. ',''))+'…" style="flex:1;min-width:0;border:1px solid var(--field-bd);background:var(--field);border-radius:11px;padding:9px 11px;font-size:13.5px;outline:none;">';
      b+='<input type="number" inputmode="decimal" min="0" step="0.5" value="'+(it.qty===''||it.qty==null?'':esc(it.qty))+'" onchange="App.setMealItemQty(\''+m.key+'\','+idx+',this)" style="width:50px;border:1px solid var(--field-bd);background:var(--field);border-radius:11px;padding:9px 4px;font-size:13.5px;text-align:center;outline:none;">';
      b+='<select onchange="App.setMealItemUnit(\''+m.key+'\','+idx+',this)" style="width:60px;border:1px solid var(--field-bd);background:var(--field);border-radius:11px;padding:9px 4px;font-size:12.5px;outline:none;color:var(--text);">';
      MEAL_UNITS.forEach(function(u){ b+='<option value="'+u.id+'"'+(it.unit===u.id?' selected':'')+'>'+u.label+'</option>'; });
      b+='</select>';
      b+='<button onclick="App.removeMealItem(\''+m.key+'\','+idx+')" aria-label="Sil" style="flex-shrink:0;border:none;cursor:pointer;width:30px;height:30px;border-radius:9px;background:rgba(220,120,120,0.1);color:#C0605F;font-size:14px;">×</button>';
      b+='</div>';
    });
    b+='<button onclick="App.addMealItem(\''+m.key+'\')" style="align-self:flex-start;border:1px dashed var(--field-bd);cursor:pointer;padding:7px 13px;border-radius:11px;font-size:12.5px;font-weight:700;color:var(--muted);background:transparent;">+ '+m.label.toLowerCase()+'\'a ekle</button>';
    b+='</div>';
  });
  return collapsibleCardHTML({key:'beslenme', id:'card-beslenme', icon:icon('utensils',18), accent:'var(--watch)', title:'Beslenme', subtitle:subtitle, badge:badge, open:open, body:b, hint:'öğünleri gör / ekle'});
}
CARD_BUILDERS.beslenme=beslenmeCardHTML;
function waterCard(rec){
  var w=rec&&typeof rec.water==='number'?rec.water:0;
  var pct=Math.min(100,Math.round(w/WATER_GOAL*100));
  var h='<div class="glass" style="border-radius:22px;padding:16px;display:flex;flex-direction:column;gap:12px;">';
  h+='<div style="display:flex;align-items:center;justify-content:space-between;"><div style="font-size:15.5px;font-weight:700;display:flex;align-items:center;gap:7px;">Su '+icon('droplet',17)+'</div><div style="font-size:12.5px;color:var(--faint);"><b style="color:var(--accent);font-size:16px;">'+w+'</b> / '+WATER_GOAL+' bardak</div></div>';
  h+='<div style="display:flex;gap:5px;">';
  for(var i=0;i<WATER_GOAL;i++){ var on=i<w; h+='<div style="flex:1;height:30px;border-radius:9px;display:flex;align-items:center;justify-content:center;'+(on?'background:linear-gradient(135deg,#9CC9F0,#C9B8FF);box-shadow:0 4px 10px rgba(120,160,220,0.3);color:#fff;':'background:rgba(150,170,200,0.12);border:1px solid var(--card-bd);')+'">'+(on?icon('droplet',14):'')+'</div>'; }
  h+='</div>';
  if(w>WATER_GOAL){ h+='<div style="font-size:11.5px;color:var(--faint);">+'+(w-WATER_GOAL)+' bardak ekstra, harika</div>'; }
  var waterTicked=!!(rec&&rec.habits&&rec.habits.water);
  if(waterTicked&&w<WATER_GOAL&&!ui.waterNudgeHidden){
    h+='<div style="display:flex;gap:9px;align-items:flex-start;background:linear-gradient(135deg,rgba(127,179,232,0.16),rgba(155,127,201,0.12));border:1px solid rgba(127,179,232,0.4);border-radius:14px;padding:11px 12px;">';
    h+='<span style="flex-shrink:0;display:inline-flex;">'+icon('droplet',18)+'</span>';
    h+='<div style="flex:1;min-width:0;font-size:12.5px;color:var(--text2);line-height:1.45;">Su tikin işaretli. Kaç bardak içtiğini de girersen takibin daha net olur. <span style="color:var(--faint);">(zorunlu değil)</span></div>';
    h+='<button onclick="App.hideWaterNudge()" aria-label="Kapat" style="flex-shrink:0;border:none;background:none;cursor:pointer;color:var(--faint);display:flex;align-items:center;justify-content:center;">'+icon('x',14)+'</button></div>';
  }
  h+='<div style="display:flex;gap:9px;">';
  h+='<button onclick="App.waterAdd(-1)" style="flex:1;border:1px solid var(--field-bd);cursor:pointer;padding:12px;border-radius:14px;font-size:18px;font-weight:800;color:var(--muted);background:var(--card);">−</button>';
  h+='<button onclick="App.waterAdd(1)" style="flex:2;border:none;cursor:pointer;padding:12px;border-radius:14px;font-size:15px;font-weight:800;color:#fff;background:linear-gradient(135deg,#7FB3E8,#9B7FC9);box-shadow:0 8px 18px rgba(120,160,220,0.35);display:flex;align-items:center;justify-content:center;gap:6px;">+1 bardak içtim '+icon('droplet',15)+'</button>';
  h+='</div></div>';
  return h;
}
// Enerji & stres — belirgin, etiketli 1–5 skalaları (kullanıcı bunları kaçırmasın).
function energyStressBlock(rec){
  var en=rec?rec.energy:null, st=rec?rec.stress:null;
  function scale(label,ic,cur,fn,lo,hi,grad){
    var s='<div style="display:flex;flex-direction:column;gap:6px;">';
    s+='<div style="display:flex;align-items:center;gap:6px;font-size:12.5px;font-weight:800;color:var(--text);"><span style="display:inline-flex;color:var(--muted);">'+ic+'</span>'+label+(cur!=null?'<span style="margin-left:auto;font-size:11px;font-weight:700;color:var(--accent);">'+cur+'/5</span>':'')+'</div>';
    s+='<div style="display:flex;gap:6px;">';
    for(var v=1;v<=5;v++){ var sel=cur===v; s+='<button onclick="App.'+fn+'('+v+')" aria-label="'+v+'" style="flex:1;height:38px;border-radius:12px;cursor:pointer;font-size:13px;font-weight:800;transition:all .18s;'+(sel?'background:linear-gradient(135deg,'+grad+');border:1px solid transparent;color:#fff;box-shadow:0 6px 14px rgba(150,110,120,0.28);transform:translateY(-2px);':'background:var(--card);border:1px solid var(--card-bd);color:var(--faint);')+'">'+v+'</button>'; }
    s+='</div>';
    s+='<div style="display:flex;justify-content:space-between;font-size:10px;color:var(--faint);"><span>'+lo+'</span><span>'+hi+'</span></div>';
    s+='</div>';
    return s;
  }
  var h='<div style="border-top:1px solid var(--card-bd);padding-top:12px;display:flex;flex-direction:column;gap:14px;">';
  h+='<div style="font-size:11.5px;color:var(--faint);line-height:1.4;">Enerji ve stres, ruh hâlinin iki ayrı ekseni; ikisini de işaretlemek moduna daha net bakmanı sağlar.</div>';
  h+=scale('Enerji',icon('zap',14),en,'setEnergy','tükenmiş','çok dinç','#FFD37A,#F5A623');
  h+=scale('Stres',icon('wind',14),st,'setStress','sakin','çok gergin','#C9B8FF,#7C5CC4');
  h+='</div>';
  return h;
}
function moodInterp(mood,en,st){
  if(st!=null&&en!=null){
    if(st>=4&&en<=2) return 'Yüksek stres, düşük enerji: bugün küçük molalar, su ve nazik bir yürüyüş iyi gelebilir.';
    if(en>=4&&st<=2) return 'Enerjin yüksek, stresin düşük — bu güzel ritmi bir yürüyüşle taçlandırabilirsin.';
    if(st>=4) return 'Stres bugün yüksek; birkaç derin nefes ve tempolu bir mola dengeyi geri getirir.';
    if(en<=2) return 'Enerji biraz düşük görünüyor; kendine yüklenme, küçük adımlar da bugün için yeterli.';
  }
  return '';
}
// Birleşik "mod" kartı: mod seçimi + belirgin enerji/stres + kısa yorum, açılır/kapanır.
function moodCardHTML(rec){
  var curMood=rec?rec.mood:null, en=rec?rec.energy:null, st=rec?rec.stress:null;
  var allSet=!!(curMood&&en!=null&&st!=null);
  var open=cardOpen('mood', !allSet);
  var ed=editing();
  var mo0=curMood?find(MOODS,'id',curMood):null;
  var badge=mo0?('<span style="display:inline-flex;color:var(--accent);">'+icon(mo0.icon,22)+'</span>'):'';
  var subParts=[];
  if(mo0) subParts.push(esc(mo0.short));
  if(en!=null) subParts.push('Enerji '+en);
  if(st!=null) subParts.push('Stres '+st);
  var subtitle=subParts.length?(subParts.join(' · ')+(allSet?'':' — tamamla')):'modunu, enerji ve stresini paylaş';
  var b='<div style="display:flex;gap:6px;">';
  MOODS.forEach(function(m){
    var sel=curMood===m.id;
    var style=sel?'background:linear-gradient(135deg,#FFE8A3,#F7DDE5);border:1px solid #E9AFC1;box-shadow:0 8px 18px rgba(233,175,193,0.4);transform:translateY(-2px);color:#5A2E2A;':'background:var(--card);border:1px solid var(--card-bd);color:var(--text);';
    b+='<button onclick="App.setMood(\''+m.id+'\')" style="flex:1;min-width:0;padding:11px 4px;border-radius:16px;display:flex;flex-direction:column;align-items:center;gap:4px;cursor:pointer;transition:all .2s;'+style+'"><span style="display:inline-flex;">'+icon(m.icon,22)+'</span><span style="font-size:11px;font-weight:600;text-align:center;line-height:1.1;">'+esc(m.short)+'</span></button>';
  });
  b+='</div>';
  if(mo0) b+='<div style="font-size:14px;color:var(--text2);background:rgba(255,232,163,0.3);border-radius:14px;padding:10px 12px;line-height:1.4;">'+esc(mo0.resp)+'</div>';
  b+=energyStressBlock(rec);
  var interp=moodInterp(curMood,en,st);
  if(interp) b+='<div style="font-size:12px;color:var(--text2);line-height:1.45;background:linear-gradient(160deg,rgba(201,184,255,0.12),transparent);border-radius:12px;padding:10px 12px;display:flex;gap:7px;"><span style="flex-shrink:0;display:inline-flex;color:var(--accent);">'+icon('lightbulb',14)+'</span><span>'+esc(interp)+'</span></div>';
  return collapsibleCardHTML({key:'mood', id:'card-mood', icon:icon('cloud-sun',18), accent:'var(--pause)', title:(ed?'O günün modu':'Bugünün modu'), subtitle:subtitle, badge:badge, open:open, body:b, hint:'modunu işaretle'});
}
CARD_BUILDERS.mood=moodCardHTML;
// Birleşik "Günün yansıması" kartı: kendine not + 3 güzel şey, bilimsel çerçeve + rehber soru.
var REFLECT_PROMPTS=[
  'Bugün seni gülümseten en küçük an neydi?',
  'Bugün kendinle gurur duyduğun bir şey oldu mu?',
  'Bugün sana en çok iyi gelen neydi?',
  'Zor bir anı bugün nasıl atlattın?',
  'Bugün bedenine yaptığın bir iyilik neydi?',
  'Yarının sana bir cümle bırak: ne hatırlamak istersin?',
  'Bugün fark ettiğin küçük bir güzellik neydi?',
  'Bugün kendine hangi konuda daha kibar davrandın?'
];
function reflectionCardHTML(rec){
  var ed=editing();
  var note=(rec&&rec.note)?rec.note:'';
  var gratArr=(rec&&Array.isArray(rec.gratitude))?rec.gratitude:[];
  var gratFilled=gratArr.filter(function(g){return String(g||'').trim();}).length;
  var filled=(String(note).trim()?1:0)+gratFilled;
  var open=cardOpen('reflection', filled===0);
  var badge=filled>0?'<span style="font-size:11px;font-weight:800;color:var(--accent);">'+filled+'</span>':'';
  var refParts=[]; if(String(note).trim()) refParts.push('not'); if(gratFilled>0) refParts.push(gratFilled+' güzel şey');
  var refSub=refParts.length?refParts.join(' · '):'birkaç cümle bırak, kendine iyi gelsin';
  var prompt=REFLECT_PROMPTS[(Math.max(1,dayIndexFor(activeDate()))-1)%REFLECT_PROMPTS.length]||REFLECT_PROMPTS[0];
  var gratPh=['örn. Sabah kahvem','örn. Bir arkadaşın mesajı','örn. Güneşli hava'];
  var b='';
  b+='<div style="font-size:11.5px;color:var(--faint);line-height:1.5;">Duyguları yazıya dökmek ve minnet, ruh hâlini toparlamanın en kanıtlı iki yoludur. Birkaç cümle bile bugüne iyi gelir.</div>';
  b+='<div style="display:flex;gap:8px;align-items:flex-start;background:linear-gradient(160deg,rgba(255,225,154,0.20),rgba(201,184,255,0.10));border-radius:14px;padding:11px 12px;"><span style="flex-shrink:0;display:inline-flex;color:var(--accent);">'+icon('feather',15)+'</span><div style="font-size:13px;color:var(--text2);line-height:1.4;font-style:italic;">'+esc(prompt)+'</div></div>';
  b+='<div><div style="font-size:12.5px;font-weight:700;color:var(--muted);margin-bottom:6px;">'+(ed?'O gün kendine notun':'Bugün kendime notum')+'</div>';
  b+='<textarea oninput="App.onNote(this)" placeholder="Aklından geçeni serbestçe yaz…" rows="3" style="width:100%;border:1px solid var(--field-bd);background:var(--field);border-radius:14px;padding:12px;font-size:15px;resize:none;outline:none;line-height:1.5;color:var(--text);">'+esc(note)+'</textarea></div>';
  b+='<div style="border-top:1px solid var(--card-bd);padding-top:12px;"><div style="display:flex;align-items:center;gap:8px;margin-bottom:9px;"><span style="display:inline-flex;color:var(--accent);">'+icon('heart-handshake',16)+'</span><div><div style="font-size:13px;font-weight:800;color:var(--text);">'+(ed?'O günün 3 güzel şeyi':'Bugünün 3 güzel şeyi')+'</div><div style="font-size:11px;color:var(--faint);">Küçük de olsa minnet duyduğun 3 şey</div></div></div>';
  for(var i=0;i<3;i++){ var gv=(gratArr[i]!=null)?gratArr[i]:''; b+='<div style="display:flex;align-items:center;gap:9px;margin-bottom:8px;"><span style="width:24px;height:24px;flex-shrink:0;border-radius:50%;background:linear-gradient(135deg,#F6C177,#E9AFC1);color:#fff;font-size:12.5px;font-weight:800;display:flex;align-items:center;justify-content:center;">'+(i+1)+'</span><input type="text" value="'+esc(gv)+'" oninput="App.onGratitude('+i+',this)" placeholder="'+gratPh[i]+'" maxlength="160" style="flex:1;min-width:0;border:1px solid var(--field-bd);background:var(--field);border-radius:12px;padding:11px 12px;font-size:14.5px;outline:none;color:var(--text);"></div>'; }
  b+='</div>';
  return collapsibleCardHTML({key:'reflection', id:'card-reflection', icon:icon('pen-line',18), accent:'var(--sun)', title:(ed?'O günün yansıması':'Günün yansıması'), subtitle:refSub, badge:badge, open:open, body:b, hint:'yansımanı yaz', cardStyle:'background:linear-gradient(160deg,rgba(246,193,119,0.10),rgba(233,175,193,0.06));'});
}
CARD_BUILDERS.reflection=reflectionCardHTML;
// "Bugünün tikleri" — açılır/kapanır kart; başlıkta ilerleme halkası + sayaç.
function habitsCardHTML(rec){
  var ed=editing();
  var viewDate=activeDate();
  var completed=countRec(rec);
  var ht=habitCountOn(viewDate);
  var allDone=ht>0&&completed>=ht;
  var open=cardOpen('habits', !allDone);
  var circ=2*Math.PI*11;
  var off=circ*(1-(ht>0?completed/ht:0));
  var ring='<div style="position:relative;width:30px;height:30px;flex-shrink:0;"><svg width="30" height="30" viewBox="0 0 30 30"><circle cx="15" cy="15" r="11" fill="none" stroke="rgba(150,110,120,0.18)" stroke-width="3.5"></circle><circle cx="15" cy="15" r="11" fill="none" stroke="#E9AFC1" stroke-width="3.5" stroke-linecap="round" stroke-dasharray="'+circ+'" stroke-dashoffset="'+off+'" transform="rotate(-90 15 15)"></circle></svg></div>';
  var badge='<div style="display:flex;align-items:center;gap:7px;">'+ring+'<span style="font-size:13px;font-weight:800;color:var(--text);">'+completed+'/'+ht+'</span></div>';
  var b='';
  HABITS.forEach(function(hb){
    var derived=!!DERIVED_HABITS[hb.key];
    var prog=derived?habitProgress(rec,hb.key):null;
    var done=derived?!!(prog&&prog.met):!!(rec&&rec.habits[hb.key]);
    var pulsing=ui.pulse===hb.key;
    var accent=DERIVED_ACCENT[hb.key];
    var locked=(derived&&!done);
    var warn=(!done && !derived && (hb.key==='vitaminD'||hb.key==='protein'));
    var bg=done?(dark?'linear-gradient(135deg,rgba(233,175,193,0.25),rgba(201,184,255,0.22))':'linear-gradient(135deg,rgba(255,255,255,0.92),rgba(247,221,229,0.82))'):(locked?hexA(accent,dark?0.07:0.05):'var(--card)');
    var bd=done?'rgba(233,175,193,0.9)':(warn?'var(--warn)':(locked?hexA(accent,0.4):'var(--card-bd)'));
    var sh=done?'0 10px 26px rgba(233,175,193,0.4)':(locked?'0 6px 16px '+hexA(accent,0.12):'0 6px 16px rgba(108,74,58,0.06)');
    // Magnezyum için alt-metin doz/form bilgisine göre dinamik olsun
    var sub=hb.sub;
    if(hb.key==='magnesium'){
      var mg=(rec&&rec.magnesium)||{};
      sub=(mg.taken)?('Form: '+esc(mg.form||'glisinat')+' · '+esc((mg.mg||200)+' mg')):'Destek gününü tamamlamak için dokun.';
    }
    if(hb.key==='vitaminD'){
      var vdForm=esc((data.settings&&data.settings.vitaminDForm)||'D₃K₂ damla');
      var vdDose=esc((data.settings&&data.settings.vitaminDDose)||'1 damla (D3 1000 IU + K2 100 mcg)');
      var vdStart='2026-07-20', today=todayStr();
      sub=(today<vdStart)?('20 Temmuz 2026 Pazartesi itibarıyla D₃K₂ damla’ya geçiyoruz.'):('Form: '+vdForm+' · '+vdDose);
    }
    b+=habitRowHTML({key:hb.key,title:hb.title,sub:sub,msg:hb.msg,icon:hb.icon,derived:derived,prog:prog,done:done,pulsing:pulsing,accent:accent,locked:locked,warn:warn,onclick:'App.toggleHabit(\''+hb.key+'\')'});
  });
  completed=countRec(rec); ht=habitCountOn(viewDate); allDone=ht>0&&completed>=ht;
  var badge2='<div style="display:flex;align-items:center;gap:7px;">'+ring+'<span style="font-size:13px;font-weight:800;color:var(--text);">'+completed+'/'+ht+'</span></div>';
  return collapsibleCardHTML({key:'habits', id:'card-habits', icon:icon('circle-check',18), accent:'var(--ok)', title:(ed?'O günün tikleri':'Bugünün tikleri'), subtitle:(allDone?'hepsi tamam, harika':completed+'/'+ht+' tamamlandı'), badge:badge2, open:open, body:b, hint:'tikleri gör'});
}
CARD_BUILDERS.habits=habitsCardHTML;
function eveningNudge(rec){
  var hr=new Date().getHours();
  if(hr<20&&hr>4) return '';
  var rd=readingStats(rec);
  if(rd.count>0) return '';
  return '<div style="position:relative;overflow:hidden;background:linear-gradient(135deg,#6E55BF,#9B7FC9 55%,#E9AFC1);border-radius:20px;padding:15px 16px;display:flex;align-items:center;gap:12px;box-shadow:0 12px 26px rgba(110,85,191,0.35);">'
    +'<span style="flex-shrink:0;display:inline-flex;">'+icon('book-open',24)+'</span>'
    +'<div style="flex:1;min-width:0;"><div style="font-size:14.5px;font-weight:800;color:#fff;">Gece yaklaşıyor</div><div style="font-size:12px;color:rgba(255,255,255,0.9);line-height:1.35;">Bugün ne okudun? Birkaç sayfa, uykuya geçişi yumuşatır.</div></div>'
    +'<button onclick="App.openReading()" style="flex-shrink:0;border:none;cursor:pointer;background:rgba(255,255,255,0.95);color:#6E55BF;font-weight:800;font-size:13px;padding:9px 14px;border-radius:12px;">Ekle</button></div>';
}

function stepReminder(rec){
  if(ui.stepRemindHidden) return '';
  var hr=new Date().getHours();
  if(hr<19&&hr>4) return '';
  var stepsEmpty=!(rec&&rec.walk&&rec.walk.steps!=null&&rec.walk.steps!=='');
  if(!stepsEmpty) return '';
  return '<div style="display:flex;align-items:center;gap:11px;background:linear-gradient(135deg,rgba(230,193,90,0.14),rgba(155,127,201,0.10));border:1px solid rgba(201,160,60,0.35);border-radius:16px;padding:12px 14px;">'
    +'<span style="flex-shrink:0;display:inline-flex;">'+icon('footprints',20)+'</span>'
    +'<div style="flex:1;min-width:0;"><div style="font-size:13.5px;font-weight:700;color:var(--text);">Bugünün adımını eklemek ister misin?</div><div style="font-size:11.5px;color:var(--muted);line-height:1.35;">Telefonundaki adımı yazman ya da Sağlık’tan çekmen yeter — zorunlu değil.</div></div>'
    +'<button onclick="App.go(\'saglik\')" style="flex-shrink:0;border:none;cursor:pointer;background:linear-gradient(135deg,#E6C15A,#C99A3A);color:#1a1404;font-weight:800;font-size:12.5px;padding:9px 13px;border-radius:12px;">Ekle</button>'
    +'<button onclick="App.hideStepRemind()" aria-label="Kapat" style="flex-shrink:0;border:none;background:none;cursor:pointer;color:var(--faint);display:flex;align-items:center;justify-content:center;">'+icon('x',14)+'</button></div>';
}
function fmtDist(m){ m=Math.max(0,Number(m)||0); return m<1000?Math.round(m)+' m':(m/1000).toFixed(2)+' km'; }
function fmtDur(sec){ sec=Math.max(0,Math.round(Number(sec)||0)); if(sec<60) return sec+' sn'; var m=Math.round(sec/60); if(m<60) return m+' dk'; var hh=Math.floor(m/60), mm=m%60; return hh+' sa'+(mm?(' '+mm+' dk'):''); }
// Sağlık senkronu kurulum kartı — daraltılmış/genişletilmiş (accordion). Konum kartının
// hemen altında yaşar ki kullanıcı GPS'in arka planda çalışmadığını gördüğü anda
// gerçek çözümü de orada bulsun. Bağlandıysa kısa bir "bağlı" özetine döner.
function healthSetupCardHTML(connectedHealth){
  var open=!!ui.healthSetupOpen;
  var h='<div style="border:1px solid rgba(143,191,138,0.32);border-radius:16px;overflow:hidden;background:rgba(143,191,138,0.05);">';
  h+='<button onclick="App.toggleHealthSetup()" style="width:100%;border:none;cursor:pointer;background:none;display:flex;align-items:center;gap:10px;padding:12px;text-align:left;">';
  h+='<span style="flex-shrink:0;display:inline-flex;">'+icon('apple',20)+'</span>';
  h+='<div style="flex:1;min-width:0;">';
  h+='<div style="font-size:13.5px;font-weight:800;color:var(--text);">'+(connectedHealth?'Sağlık senkronu':'Sağlık\'tan otomatik veri ekle')+(connectedHealth?' <span style="font-size:10.5px;font-weight:800;color:#3F8A4F;background:rgba(143,191,138,0.22);padding:1px 8px;border-radius:999px;margin-left:2px;display:inline-flex;align-items:center;gap:3px;">'+icon('check',11)+' bağlı</span>':'')+'</div>';
  h+='<div style="font-size:11.5px;color:var(--muted);">'+(connectedHealth?'Kurulum adımlarını gör':'Arka planda çalışır · pil dostu · tek seferlik kurulum')+'</div>';
  h+='</div>';
  h+='<span style="font-size:13px;color:var(--faint);flex-shrink:0;display:inline-flex;align-items:center;gap:3px;">'+(open?('Gizle '+icon('chevron-up',13)):('Göster '+icon('chevron-down',13)))+'</span>';
  h+='</button>';
  if(open){
    var sg=data.settings||{};
    var gid=(sg.healthGistId||'').trim();
    function chip(id,label,hint){ return '<button onclick="App.'+id+'()" style="text-align:left;border:1px solid var(--field-bd);background:var(--field);cursor:pointer;border-radius:10px;padding:9px 11px;font-size:12px;color:var(--text2);display:flex;align-items:center;gap:8px;width:100%;"><span style="flex:1;min-width:0;"><b style="color:var(--text);">'+label+'</b><br><span style="color:var(--faint);font-size:11px;">'+hint+'</span></span><span style="flex-shrink:0;display:inline-flex;">'+icon('copy',14)+'</span></button>'; }
    function step(n,text){ return '<div style="display:flex;gap:9px;align-items:flex-start;"><span style="flex-shrink:0;width:22px;height:22px;border-radius:50%;background:rgba(143,191,138,0.3);color:#2F7A3F;font-size:11.5px;font-weight:800;display:flex;align-items:center;justify-content:center;">'+n+'</span><span style="flex:1;font-size:12.5px;line-height:1.55;color:var(--text2);padding-top:2px;">'+text+'</span></div>'; }
    h+='<div style="padding:0 14px 14px;display:flex;flex-direction:column;gap:11px;">';
    h+='<div style="display:flex;flex-direction:column;gap:6px;font-size:12.5px;color:var(--text2);line-height:1.4;">';
    h+='<div style="display:flex;align-items:flex-start;gap:6px;"><span style="flex-shrink:0;margin-top:1px;">'+icon('battery-low',14)+'</span><span><b>Pil dostu</b> — GPS\'i sürekli açık tutmaz, telefonun kendi adım sayacını kullanır.</span></div>';
    h+='<div style="display:flex;align-items:flex-start;gap:6px;"><span style="flex-shrink:0;margin-top:1px;">'+icon('moon',14)+'</span><span><b>Gerçekten arka planda</b> — uygulama kapalıyken, ekran kilitliyken bile veri toplanmaya devam eder.</span></div>';
    h+='<div style="display:flex;align-items:flex-start;gap:6px;"><span style="flex-shrink:0;margin-top:1px;">'+icon('target',14)+'</span><span><b>Daha doğru</b> — Sağlık\'ın hassas pedometresi, GPS tahmininden daha güvenilir.</span></div>';
    h+='<div style="display:flex;align-items:flex-start;gap:6px;"><span style="flex-shrink:0;margin-top:1px;">'+icon('lock',14)+'</span><span><b>Gizli kalır</b> — veriler doğrudan senin GitHub hesabında tutulur, başka bir sunucuya gitmez.</span></div>';
    h+='</div>';

    h+='<div style="font-size:12px;font-weight:800;color:var(--text);">Bölüm 1 — Küçük bir kutu oluştur (tarayıcıda, bir kere):</div>';
    h+=step('1','<a href="https://gist.github.com" target="_blank" style="color:#2F7A3F;font-weight:700;">gist.github.com</a> adresini aç (GitHub hesabınla giriş yapmış ol).');
    h+=step('2','"Filename" kutusuna yaz: <b>health-sync.json</b>');
    h+=step('3','Büyük metin kutusuna aşağıdaki "Başlangıç içeriği" çipine dokunup yapıştır.');
    h+=chip('copyHealthStarter','Başlangıç içeriği','Dokun, panoya kopyalanır');
    h+=step('4','Yeşil <b>"Create secret gist"</b> butonuna bas.');
    h+=step('5','Açılan sayfanın adres çubuğundaki son parçayı (uzun kod) kopyala, aşağıya yapıştır:');
    h+='<input type="text" autocomplete="off" autocapitalize="off" spellcheck="false" value="'+esc(gid)+'" oninput="App.setHealthGistId(this)" placeholder="Gist ID (adres çubuğunun sonundaki kod)" style="border:1px solid var(--field-bd);background:var(--field);border-radius:12px;padding:11px;font-size:13px;outline:none;">';

    h+='<div style="font-size:12px;font-weight:800;color:var(--text);margin-top:2px;">Bölüm 2 — Kısayolu kur (Kısayollar uygulamasında, bir kere):</div>';
    h+=step('1','Kısayollar → + (yeni kısayol) → isim ver: <b>Şeyma Sağlık</b>');
    h+=step('2','Eylem ekle: <i>Sağlık Örneği Al</i> → Adım Sayısı, bugün, toplam.');
    h+=step('3','Eylem ekle: <i>Sağlık Örneği Al</i> → Yürüme + Koşu Mesafesi, bugün, toplam, birim metre.');
    h+=step('4','Eylem ekle: <i>Metin</i> → aşağıdaki şablonu yapıştır, sonra köşeli parantez içindeki her ismi silip yerine bir önceki adımların mor sonucunu (dokunarak) koy.');
    h+=chip('copyHealthTemplate','Metin şablonu','Dokun, panoya kopyalanır');
    h+=step('5','Eylem ekle: <i>URL İçeriğini Al</i> → Yöntem: <b>PATCH</b>. Aşağıdaki URL ve Yetki değerlerini kopyala-yapıştır; İstek Gövdesi: JSON → Sözlük → anahtar <b>files</b> → içine anahtar <b>health-sync.json</b> → içine anahtar <b>content</b> → değer olarak 4. adımdaki Metin\'i seç.');
    h+=chip('copyHealthUrl','URL','Dokun, panoya kopyalanır');
    h+=chip('copyHealthAuth','Yetki (Authorization)','Dokun, jetonun panoya kopyalanır — ekranda hiç görünmez');

    h+='<div style="font-size:12px;font-weight:800;color:var(--text);margin-top:2px;">Bölüm 3 — Otomatik çalışsın (bir kere):</div>';
    h+=step('1','Kısayollar → Otomasyon → + → Kişisel Otomasyon → <i>Saatin Zamanı</i> (günde birkaç kez tekrarlı).');
    h+=step('2','"Şeyma Sağlık" kısayolunu çalıştır olarak seç, <b>"Çalıştırmadan Önce Sor"u kapat</b>. Bitti — bundan sonra kimse hiçbir şey yapmaz.');

    h+='<div style="font-size:11px;color:var(--faint);line-height:1.5;background:var(--field);border-radius:10px;padding:8px 10px;">Not: Bu jetonun "gist" iznine de sahip olması gerekir. İnce ayarlı (fine-grained) jetonlar Gist\'i desteklemiyor — Ayarlar\'da <b>classic</b> bir jeton (repo + gist izinli) kullan.</div>';
    h+='<a href="shortcuts://" style="text-align:center;text-decoration:none;border:none;cursor:pointer;padding:12px;border-radius:14px;font-size:14px;font-weight:800;color:#fff;background:linear-gradient(135deg,#7DBE77,#5BA85B);display:flex;align-items:center;justify-content:center;gap:6px;">Kısayollar\'ı Aç '+icon('link-2',15)+'</a>';
    h+='</div>';
  }
  h+='</div>';
  return h;
}
function locationCardHTML(){
  var s=data.settings||{};
  if(s.hideLocationCard) return '';
  var on=!!s.locationEnabled;
  var mode=s.locationMode||'auto';
  var today=todayStr();
  var rec=data.days[today]||null;
  var mv=rec&&rec.movement?rec.movement:{walkM:0,vehicleM:0,totalM:0,maxSpeed:0};
  var loc=data.location, upd='—';
  if(loc&&loc.ts){ var am=Math.round((Date.now()-new Date(loc.ts).getTime())/60000); upd = am<1?'az önce':am<60?am+' dk önce':am<1440?Math.round(am/60)+' sa önce':Math.round(am/1440)+' g önce'; }
  var swBg=on?'linear-gradient(135deg,#7DBE77,#5BA85B)':'linear-gradient(135deg,#E68A84,#D9534F)';
  var knobLeft=on?'26px':'3px';
  var hs=rec&&rec.health?rec.health:null;
  var hsBlock='';
  if(hs&&(hs.steps>0||hs.walkM>0)){
    var hsAge='';
    if(hs.updatedAt){ var hm=Math.round((Date.now()-new Date(hs.updatedAt).getTime())/60000); hsAge=hm<1?'az önce':hm<60?hm+' dk önce':hm<1440?Math.round(hm/60)+' sa önce':Math.round(hm/1440)+' g önce'; }
    hsBlock='<div style="display:flex;align-items:center;gap:10px;background:rgba(143,191,138,0.10);border:1px solid rgba(143,191,138,0.28);border-radius:14px;padding:10px 12px;">'
      +'<span style="flex-shrink:0;display:inline-flex;">'+icon('apple',18)+'</span>'
      +'<div style="flex:1;min-width:0;font-size:12.5px;color:var(--text2);"><b style="color:var(--text);">Sağlık senkronu:</b> '
      +(hs.steps>0?hs.steps.toLocaleString('tr-TR')+' adım':'')+(hs.steps>0&&hs.walkM>0?' · ':'')+(hs.walkM>0?fmtDist(hs.walkM):'')
      +'<div style="font-size:11px;color:var(--faint);margin-top:1px;">Telefon arka planda topladı'+(hsAge?' · '+hsAge:'')+'</div></div>'
      +'</div>';
  }
  // Açık/kapalı anahtarı başlıkta rozet olarak; anahtara dokunmak kartı açmasın (stopPropagation).
  var toggle='<button onclick="event.stopPropagation();App.toggleLocation()" aria-label="Konum aç/kapat" style="border:none;cursor:pointer;flex-shrink:0;width:50px;height:28px;border-radius:999px;position:relative;transition:background .2s;background:'+swBg+';"><span style="position:absolute;top:3px;left:'+(on?'25px':'3px')+';width:22px;height:22px;border-radius:50%;background:#fff;box-shadow:0 2px 6px rgba(0,0,0,0.3);transition:left .2s;"></span></button>';
  var statusPill='<span style="font-size:10px;font-weight:800;padding:2px 8px;border-radius:999px;color:#fff;background:'+(on?'#3F9A4F':'#D9534F')+';">'+(on?'AÇIK':'KAPALI')+'</span>';
  var badge='<div style="display:flex;align-items:center;gap:8px;">'+hidePill('location')+statusPill+toggle+'</div>';
  var subtitle=on?('Bugün '+fmtDist(mv.totalM)+' · ölçüm açık'):'GPS kapalı · açmak için sağdaki anahtar';
  var open=cardOpen('location', on);
  var b='';
  if(!on){
    b+=hsBlock;
    b+='<div style="font-size:12.5px;line-height:1.5;color:var(--text2);">Açtığında yürüyüş ve araç hareketlerin ölçülür (yalnızca uygulama açıkken).</div>';
    b+=healthSetupCardHTML(!!hs&&(hs.steps>0||hs.walkM>0));
    return collapsibleCardHTML({key:'location', id:'card-location', icon:icon('map-pin',18), accent:'#3F9A4F', title:'Konum & Hareket', subtitle:subtitle, badge:badge, open:open, body:b, hint:'ayrıntıları gör'});
  }
  function mbtn(id,emoji,label){ var act=mode===id; return '<button onclick="App.setLocationMode(\''+id+'\')" style="flex:1;border:1px solid '+(act?'#8FBF8A':'var(--card-bd)')+';cursor:pointer;padding:9px 4px;border-radius:12px;font-size:12.5px;font-weight:700;color:'+(act?'#2F7A3F':'var(--text2)')+';background:'+(act?'rgba(143,191,138,0.18)':'transparent')+';">'+emoji+' '+label+'</button>'; }
  b+='<div style="display:flex;gap:7px;">'+mbtn('walk',icon('footprints',14),'Yürüyüş')+mbtn('vehicle',icon('car',14),'Araç')+mbtn('auto',icon('sparkles',14),'Oto')+'</div>';
  b+='<div style="display:flex;gap:10px;">';
  b+='<div style="flex:1;background:var(--icon);border-radius:14px;padding:11px;text-align:center;"><div style="font-size:11px;color:var(--muted);font-weight:700;">Bugün toplam</div><div id="loc-dist-today" style="font-size:18px;font-weight:800;color:var(--text);font-variant-numeric:tabular-nums;">'+fmtDist(mv.totalM)+'</div></div>';
  b+='<div style="flex:1;background:var(--icon);border-radius:14px;padding:11px;text-align:center;"><div style="font-size:11px;color:var(--muted);font-weight:700;">Anlık hız</div><div id="loc-speed" style="font-size:18px;font-weight:800;color:var(--text);font-variant-numeric:tabular-nums;">0 km/sa</div></div>';
  b+='</div>';
  b+='<div style="display:flex;gap:8px;font-size:12.5px;">';
  b+='<span style="flex:1;background:rgba(143,191,138,0.14);border-radius:10px;padding:8px 10px;color:var(--text2);display:flex;align-items:center;gap:5px;">'+icon('footprints',14)+' Yürüyüş <b id="loc-walk" style="margin-left:auto;">'+fmtDist(mv.walkM)+'</b></span>';
  b+='<span style="flex:1;background:rgba(201,184,255,0.16);border-radius:10px;padding:8px 10px;color:var(--text2);display:flex;align-items:center;gap:5px;">'+icon('car',14)+' Araç <b id="loc-vehicle" style="margin-left:auto;">'+fmtDist(mv.vehicleM)+'</b></span>';
  b+='</div>';
  b+='<div style="display:flex;gap:8px;font-size:12.5px;">';
  b+='<span style="flex:1;background:rgba(143,191,138,0.10);border-radius:10px;padding:8px 10px;color:var(--text2);display:flex;align-items:center;gap:5px;">'+icon('clock',14)+' Ayakta <b id="loc-walk-dur" style="margin-left:auto;">'+fmtDur(mv.walkSec)+'</b></span>';
  b+='<span style="flex:1;background:rgba(201,184,255,0.11);border-radius:10px;padding:8px 10px;color:var(--text2);display:flex;align-items:center;gap:5px;">'+icon('clock',14)+' Yolda <b id="loc-veh-dur" style="margin-left:auto;">'+fmtDur(mv.vehicleSec)+'</b></span>';
  b+='</div>';
  if(mode==='auto') b+='<div style="font-size:12px;color:var(--faint);">Oto-mod: <b id="loc-auto-mode" style="color:var(--text2);">'+autoModeLabel()+'</b> · son güncelleme <span id="loc-updated">'+esc(upd)+'</span></div>';
  else b+='<div style="font-size:12px;color:var(--faint);">Son güncelleme <span id="loc-updated">'+esc(upd)+'</span></div>';
  b+=hsBlock;
  b+='<div style="font-size:11.5px;color:var(--faint);line-height:1.45;">GPS ölçümü yalnızca uygulama açıkken yapılır; Sağlık senkronu varsa tam günü tamamlar. Hareketler korunur, silinmez.</div>';
  b+=healthSetupCardHTML(!!hs&&(hs.steps>0||hs.walkM>0));
  return collapsibleCardHTML({key:'location', id:'card-location', icon:icon('map-pin',18), accent:'#3F9A4F', title:'Konum & Hareket', subtitle:subtitle, badge:badge, open:open, body:b, hint:'ayrıntıları gör'});
}
CARD_BUILDERS.location=locationCardHTML;
// ---------- Günışığı hava durumu (Open-Meteo, anahtarsız) ----------
var wxFetching=false;
var WX_SPOTS_FIXED=[
  {key:'ev', label:'Ev', place:'Kazan', iconName:'house', lat:40.23, lng:32.68},
  {key:'is', label:'İş', place:'Altındağ', iconName:'building-2', lat:39.97, lng:32.92}
];
function hasLiveLocation(){ return !!(data&&data.location&&typeof data.location.lat==='number'&&typeof data.location.lng==='number'); }
function wxMode(){ var s=(data&&data.settings)?data.settings:{}; return (s.locationEnabled && hasLiveLocation()) ? 'live' : 'fixed'; }
function weatherSpots(){
  var fixed=WX_SPOTS_FIXED.slice();
  if(wxMode()==='live'){
    var nm=(data.weather&&data.weather.liveName)||'';
    return [{key:'live', label:'Konumun', place:nm, iconName:'map-pin', lat:data.location.lat, lng:data.location.lng}].concat(fixed);
  }
  return fixed;
}
function wxSpotIconName(sp){ return (sp&&sp.iconName)||(sp&&sp.key==='live'?'map-pin':(sp&&sp.key==='is'?'building-2':'house')); }
function wxSpotIcon(sp,size){ return icon(wxSpotIconName(sp),size||16); }
function wxStale(){
  var expected=weatherSpots();
  if(!data.weather||!data.weather.fetchedAt||!(data.weather.spots&&data.weather.spots.length)) return true;
  if(data.weather.mode!==wxMode()) return true;
  if(data.weather.spots.length!==expected.length) return true;
  for(var i=0;i<expected.length;i++){ if(!data.weather.spots[i]||data.weather.spots[i].key!==expected[i].key) return true; }
  if(wxMode()==='live' && data.location && typeof data.location.lat==='number' && data.weather.coords){
    var moved=haversineM({lat:data.weather.coords.lat,lng:data.weather.coords.lng},{lat:data.location.lat,lng:data.location.lng});
    if(moved>3000) return true;   // ~3 km'den fazla oynadıysa konum havasını tazele
  }
  var age=Date.now()-new Date(data.weather.fetchedAt).getTime();
  return !(age>=0 && age<30*60000);
}
function maybeFetchWeather(){ if(!data||editing()) return; if(wxFetching) return; if(!wxStale()) return; fetchWeather(); }
function fetchWeather(){
  if(wxFetching || typeof fetch!=='function') return;
  var modeAtFetch=wxMode();
  var spots=weatherSpots(); if(!spots.length) return;
  wxFetching=true;
  var lats=spots.map(function(s){return s.lat;}).join(',');
  var lngs=spots.map(function(s){return s.lng;}).join(',');
  var url='https://api.open-meteo.com/v1/forecast?latitude='+lats+'&longitude='+lngs
    +'&current=temperature_2m,relative_humidity_2m,apparent_temperature,is_day,precipitation,weather_code,wind_speed_10m'
    +'&daily=weather_code,temperature_2m_max,temperature_2m_min,sunrise,sunset,uv_index_max,precipitation_probability_max'
    +'&timezone=auto&forecast_days=1';
  fetch(url).then(function(r){ return r.ok?r.json():Promise.reject(r.status); }).then(function(j){
    var arr=Array.isArray(j)?j:[j]; var out=[];
    for(var i=0;i<spots.length;i++){
      var w=arr[i]||arr[0]; if(!w||!w.current) continue; var dl=w.daily||{};
      out.push({
        key:spots[i].key, label:spots[i].label, place:spots[i].place, iconName:wxSpotIconName(spots[i]),
        temp:Math.round(w.current.temperature_2m), feels:Math.round(w.current.apparent_temperature),
        hum:w.current.relative_humidity_2m, wind:Math.round(w.current.wind_speed_10m),
        precip:w.current.precipitation, code:w.current.weather_code, isDay:w.current.is_day===1,
        hi:(dl.temperature_2m_max?Math.round(dl.temperature_2m_max[0]):null),
        lo:(dl.temperature_2m_min?Math.round(dl.temperature_2m_min[0]):null),
        uv:(dl.uv_index_max?Math.round(dl.uv_index_max[0]):null),
        pop:(dl.precipitation_probability_max?dl.precipitation_probability_max[0]:null),
        sunrise:(dl.sunrise?dl.sunrise[0]:null), sunset:(dl.sunset?dl.sunset[0]:null)
      });
    }
    if(!out.length){ wxFetching=false; return; }
    var live=modeAtFetch==='live';
    var prevCoords=(data.weather&&data.weather.coords)?data.weather.coords:null;
    var keepName=(data.weather&&data.weather.liveName)||'';
    var liveCoords=(live&&spots[0])?{lat:spots[0].lat,lng:spots[0].lng}:null;
    if(live && prevCoords && liveCoords && haversineM(prevCoords,liveCoords)>3000) keepName=''; // yeni bölge → adı yeniden çöz
    data.weather={mode:modeAtFetch, fetchedAt:new Date().toISOString(), spots:out, liveName:keepName, coords:liveCoords};
    wxFetching=false; saveLocal();
    if(live && !data.weather.liveName) reverseGeocodeLive(spots[0].lat, spots[0].lng);
    if(ui.tab==='bugun') render();
    if(wxStale()) maybeFetchWeather();
  }).catch(function(){ wxFetching=false; });
}
function reverseGeocodeLive(lat,lng){
  if(typeof fetch!=='function') return;
  fetch('https://api.bigdatacloud.net/data/reverse-geocode-client?latitude='+lat+'&longitude='+lng+'&localityLanguage=tr')
    .then(function(r){ return r.ok?r.json():Promise.reject(0); }).then(function(j){
      var nm=j.locality||j.city||j.principalSubdivision||'';
      if(nm && data.weather){ data.weather.liveName=nm; if(data.weather.spots&&data.weather.spots[0]) data.weather.spots[0].place=nm; saveLocal(); if(ui.tab==='bugun') render(); }
    }).catch(function(){});
}
// ── Günün Fotoğrafı: Wikimedia Commons "Picture of the Day" ──
// Ücretsiz, CORS-destekli, keyless; her gün değişen, ödüllü doğa/hayvan/manzara
// fotoğrafları. National Geographic'in resmi API'si olmadığı için en yakın,
// yasal ve estetik eşdeğer kaynak olarak kullanılır.
var DAILY_PHOTO_FETCHING=false;
var DAILY_PHOTO_NATURE_RE=new RegExp('animals|birds|mammals|insects|reptiles|amphibians|fish|marine life|wildlife|nature|landscapes|national parks|mountains|rivers|seas|lakes|forests|flowers|plants|trees|clouds|sky|water|beaches|sunrise|sunset','i');
function stripHtml(s){
  if(s==null) return '';
  return String(s).replace(/<[^>]+>/g,' ').replace(/\s+/g,' ').replace(/&nbsp;/g,' ').trim();
}
function pickNaturePhoto(pages){
  var keys=Object.keys(pages), best=null;
  for(var i=0;i<keys.length;i++){
    var p=pages[keys[i]]; var ii=p&&p.imageinfo&&p.imageinfo[0]; if(!ii||!ii.url) continue;
    var em=ii.extmetadata||{}, cats=String(em.Categories&&em.Categories.value||'');
    if(DAILY_PHOTO_NATURE_RE.test(cats)){ best=p; break; }
    if(!best) best=p;
  }
  return best||null;
}
function fetchDailyPhoto(){
  if(DAILY_PHOTO_FETCHING || typeof fetch!=='function' || !data) return;
  var today=todayStr();
  // Aynı gün için zaten geçerli bir kayıt varsa tekrar çekme.
  if(data.dailyPhoto && data.dailyPhoto.date===today && data.dailyPhoto.url) return;
  DAILY_PHOTO_FETCHING=true;
  var url='https://commons.wikimedia.org/w/api.php?action=query&generator=images&prop=imageinfo&titles=Commons:Picture_of_the_day&iiprop=url|extmetadata&gimlimit=12&format=json&origin=*';
  fetch(url).then(function(r){ return r.ok?r.json():Promise.reject(r.status); }).then(function(j){
    var pages=j&&j.query&&j.query.pages?j.query.pages:{};
    var p=pickNaturePhoto(pages);
    if(!p || !p.imageinfo || !p.imageinfo[0]){ DAILY_PHOTO_FETCHING=false; return; }
    var ii=p.imageinfo[0], em=ii.extmetadata||{};
    var title=stripHtml(em.ObjectName&&em.ObjectName.value) || stripHtml(em.ImageDescription&&em.ImageDescription.value) || '';
    var desc=stripHtml(em.ImageDescription&&em.ImageDescription.value) || title;
    if(!title && p.title){ title=stripHtml(p.title.replace(/^File:/,'').replace(/_/g,' ').replace(/\.[^.]+$/,'')); }
    data.dailyPhoto={
      date:today,
      url:ii.url||'',
      title:title,
      artist:stripHtml(em.Artist&&em.Artist.value),
      license:em.LicenseShortName&&em.LicenseShortName.value||'',
      description:desc,
      source:'Wikimedia Commons Picture of the Day',
      pageUrl:ii.descriptionurl||'',
      fetchedAt:new Date().toISOString()
    };
    DAILY_PHOTO_FETCHING=false;
    save();
    if(ui.tab==='bugun') render();
  }).catch(function(e){
    DAILY_PHOTO_FETCHING=false;
    // Hata durumunda eski fotoğrafı koru; kart "yine de göster" mantığıyla çalışmaya devam eder.
  });
}
function maybeFetchDailyPhoto(){
  if(!data || !data.dailyPhoto) return;
  var today=todayStr();
  // Son 10 dakika içinde denenmiş ve bugün için kayıt yoksa arka planda tekrar dene.
  var last=data.dailyPhoto.fetchedAt?new Date(data.dailyPhoto.fetchedAt).getTime():0;
  var stale=!data.dailyPhoto.date || data.dailyPhoto.date!==today;
  var recent=Date.now()-last < 10*60*1000;
  if(stale && !recent && !DAILY_PHOTO_FETCHING){ fetchDailyPhoto(); }
}
function wxMeta(code,isDay){
  var c=code;
  if(c===0) return {emoji:icon(isDay?'sun':'moon',18), label:isDay?'Açık':'Açık gece', cat:'clear'};
  if(c===1) return {emoji:icon(isDay?'cloud-sun':'moon',18), label:'Az bulutlu', cat:'clear'};
  if(c===2) return {emoji:icon('cloud-sun',18), label:'Parçalı bulutlu', cat:'cloud'};
  if(c===3) return {emoji:icon('cloud',18), label:'Bulutlu', cat:'cloud'};
  if(c===45||c===48) return {emoji:icon('cloud-fog',18), label:'Sisli', cat:'fog'};
  if(c>=51&&c<=57) return {emoji:icon('cloud-drizzle',18), label:'Çiseli', cat:'rain'};
  if(c>=61&&c<=67) return {emoji:icon('cloud-rain',18), label:'Yağmurlu', cat:'rain'};
  if(c>=71&&c<=77) return {emoji:icon('cloud-snow',18), label:'Karlı', cat:'snow'};
  if(c>=80&&c<=82) return {emoji:icon('cloud-rain',18), label:'Sağanak', cat:'rain'};
  if(c>=85&&c<=86) return {emoji:icon('cloud-snow',18), label:'Kar sağanağı', cat:'snow'};
  if(c>=95) return {emoji:icon('cloud-lightning',18), label:'Gök gürültülü', cat:'storm'};
  return {emoji:icon('thermometer',18), label:'—', cat:'cloud'};
}
function wxAdvice(sp){
  var a=[]; var t=(sp.feels!=null?sp.feels:sp.temp); var cat=wxMeta(sp.code,sp.isDay).cat;
  if(sp.uv!=null && sp.uv>=6) a.push({i:icon('sun',16), t:'UV yüksek ('+sp.uv+') — güneş kremi ve şapka ihmal etme'});
  if(t>=30) a.push({i:icon('droplet',16), t:'Sıcak — bol su iç, öğle güneşinden kaç, serinde kal'});
  else if(t>=26) a.push({i:icon('droplet',16), t:'Ilıman-sıcak — su şişeni yanına almayı unutma'});
  if(t<=4) a.push({i:icon('shirt',16), t:'Soğuk — katmanlı giyin, eklemlerini üşütme'});
  else if(t<=10) a.push({i:icon('shirt',16), t:'Serin — hafif bir mont bugün iyi gider'});
  if(cat==='rain'||(sp.pop!=null&&sp.pop>=50)) a.push({i:icon('umbrella',16), t:'Yağış ihtimali — şemsiyeni al; basınç değişimi baş ağrısı tetikleyebilir'});
  if(cat==='snow') a.push({i:icon('snowflake',16), t:'Kar/buz — zemin kaygan, adımına dikkat et'});
  if(cat==='storm') a.push({i:icon('cloud-lightning',16), t:'Fırtına — mümkünse dışarıyı ertele, içeride kal'});
  if(sp.wind!=null && sp.wind>=25) a.push({i:icon('wind',16), t:'Rüzgârlı ('+sp.wind+' km/sa) — saç/şal derdine hazırlıklı ol'});
  if(sp.hum!=null && sp.hum>=75 && t>=24) a.push({i:icon('droplets',16), t:'Nem yüksek — terleme artabilir, sıvı tüketmeyi ihmal etme'});
  if(!a.length) a.push({i:icon('flower-2',16), t:'Hava dengede — güzel bir gün için tam vaktinde'});
  return a.slice(0,3);
}
var WX_QUIPS={
  clear:['Güneş bugün senin için çıktı Günışığı; gölgesi bile yakışıyor sana','Gökyüzü açık, niyetin de öyle olsun — bugün senin sahnendesin','Böyle güzel bir günde tek eksik senin gülüşündü, o da geldi işte'],
  cloud:['Bulutlar geçici, sen kalıcısın Günışığı','Bulutlu ama kasvetli değil; sen içeriden ışıldıyorsun zaten','Gökyüzü biraz mahmur; kahveni al, ikiniz de uyanırsınız'],
  rain:['Yağmur toprağı, sen günü besliyorsun; ikiniz de bereketsiniz','Şemsiyen yanında olsun; ıslanmadan da dans edilir bu hayatta','Yağmur camda ritim tutuyor, sen de kendi şarkını mırıldan'],
  snow:['Kar sessizce yağar ama iz bırakır — tıpkı senin gibi','Dışarısı buz, içerisi sen: en sıcak yer neresi belli oldu','Kar tanesi kadar biriciksin Günışığı; üşüme sakın'],
  fog:['Sis var ama yolunu sen zaten kalbinle biliyorsun','Puslu bir sabah; net olan tek şey senin değerin'],
  storm:['Fırtına da geçer Günışığı; sen köklerinden eminsin','Gök gürlese de senin içindeki huzuru bastıramaz']
};
function wxQuip(cat){ var arr=WX_QUIPS[cat]||WX_QUIPS.clear; var seed=0,t=todayStr(); for(var i=0;i<t.length;i++) seed+=t.charCodeAt(i); return arr[seed%arr.length]; }
function wxHm(iso){ if(!iso) return '—'; var p=(iso.split('T')[1]||''); return p.slice(0,5)||'—'; }
function wxSpotChip(sp){ var m=wxMeta(sp.code,sp.isDay),fg=dark?'#FFE1BC':'#7A3E1E',sub=dark?'#D6A57E':'#A85E3C'; return '<div style="display:flex;align-items:center;gap:5px;justify-content:flex-end;font-size:12.5px;font-weight:850;color:'+fg+';line-height:1.25;white-space:nowrap;"><span style="max-width:62px;overflow:hidden;text-overflow:ellipsis;font-size:10.5px;font-weight:900;color:'+sub+';">'+esc(sp.label||'')+'</span><span style="opacity:.85;display:inline-flex;">'+wxSpotIcon(sp,15)+'</span><span style="display:inline-flex;">'+m.emoji+'</span><span>'+sp.temp+'°</span></div>'; }
function wxLocationPendingChip(label){ var fg=dark?'#D6A57E':'#A85E3C'; return '<div data-wx-location-pending style="display:flex;align-items:center;gap:5px;justify-content:flex-end;font-size:11px;font-weight:800;color:'+fg+';line-height:1.25;white-space:nowrap;"><span style="max-width:112px;overflow:hidden;text-overflow:ellipsis;">'+esc(label)+'</span><span style="display:inline-flex;opacity:.78;">'+icon('map-pin',14)+'</span><span style="width:6px;height:6px;border-radius:50%;background:#C77749;box-shadow:'+(dark?'none':'0 0 0 3px rgba(199,119,73,.14)')+';"></span></div>'; }
function wxDetail(icon,label,val){ var bg=dark?'rgba(255,255,255,0.055)':'rgba(255,255,255,0.45)',lab=dark?'#D6A57E':'#A85E3C',fg=dark?'#FFE1BC':'#7A3E1E'; return '<div style="flex:1;min-width:0;background:'+bg+';border:'+(dark?'1px solid rgba(255,210,160,.09)':'none')+';border-radius:12px;padding:8px 9px;text-align:center;"><div style="font-size:10.5px;color:'+lab+';font-weight:800;">'+icon+' '+label+'</div><div style="font-size:14px;font-weight:800;color:'+fg+';margin-top:2px;">'+val+'</div></div>'; }
function weatherHeaderHTML(greet){
  var open=!!ui.weatherOpen;
  var W=dark?{bg:'linear-gradient(120deg,#15120F,#211815 52%,#22131A)',bd:'rgba(255,199,142,.22)',shadow:'0 14px 30px rgba(0,0,0,.42)',orb1:'rgba(255,199,142,.09)',orb2:'rgba(242,154,184,.07)',icon:'drop-shadow(0 3px 6px rgba(0,0,0,.52))',title:'#FFD2A1',sub:'#D6A57E',chev:'#E0AD82',hint:'rgba(255,220,184,.58)',divider:'rgba(255,210,160,.14)',noteBg:'rgba(255,255,255,.05)',note:'#F0D8BC',foot:'rgba(235,205,174,.48)'}:{bg:'linear-gradient(120deg,#FFE7A8,#FFC891 52%,#F7B3C7)',bd:'transparent',shadow:'0 12px 28px var(--sun-glow)',orb1:'rgba(255,255,255,0.55)',orb2:'rgba(255,255,255,0.28)',icon:'drop-shadow(0 3px 7px rgba(240,150,70,0.55))',title:'#8A4426',sub:'#A85E3C',chev:'#B5673A',hint:'rgba(122,62,30,0.6)',divider:'rgba(138,68,38,0.16)',noteBg:'rgba(255,255,255,0.42)',note:'#7A3E1E',foot:'rgba(122,62,30,0.55)'};
  var wx=data.weather;
  var spots=(wx&&wx.spots&&wx.spots.length)?wx.spots:null;
  var live=!!(wx&&wx.mode==='live');
  var locationOn=!!(data&&data.settings&&data.settings.locationEnabled);
  var liveReady=!!(spots&&live&&spots[0]&&spots[0].key==='live');
  var locationPending=locationOn&&!liveReady;
  var locationPendingLabel=hasLiveLocation()?'Konum güncelleniyor…':'Konum bekleniyor…';
  var primary=null;
  if(spots){ primary=spots[0]; for(var i=1;i<spots.length;i++){ var b=spots[i]; var sv=(b.uv||0)+(b.feels!=null?b.feels:b.temp||0); var ps=(primary.uv||0)+(primary.feels!=null?primary.feels:primary.temp||0); if(sv>ps) primary=b; } }
  var pm=primary?wxMeta(primary.code,primary.isDay):null;
  var h='<div class="wxcard"'+(dark?' data-dark-variant="weather"':'')+' onclick="App.toggleWeather()" role="button" aria-expanded="'+(open?'true':'false')+'" style="position:relative;overflow:hidden;border:1px solid '+W.bd+';border-radius:24px;padding:15px 16px;background:'+W.bg+';box-shadow:'+W.shadow+';">';
  h+='<div style="position:absolute;top:-32px;right:-16px;width:120px;height:120px;border-radius:50%;background:radial-gradient(circle,'+W.orb1+',transparent 70%);pointer-events:none;"></div>';
  h+='<div style="position:absolute;bottom:-42px;left:30px;width:96px;height:96px;border-radius:50%;background:radial-gradient(circle,'+W.orb2+',transparent 70%);pointer-events:none;"></div>';
  h+='<div style="position:relative;display:flex;align-items:center;gap:12px;">';
  h+='<span style="display:inline-flex;filter:'+W.icon+';">'+(pm?pm.emoji:icon('sun',28))+'</span>';
  var sub=greet; if(pm) sub+=' · '+pm.label;
  h+='<div style="flex:1;min-width:0;"><div style="font-size:20px;font-weight:900;letter-spacing:0.3px;color:'+W.title+';line-height:1.12;">Günışığı</div><div style="font-size:12px;font-weight:700;color:'+W.sub+';letter-spacing:.2px;margin-top:2px;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;">'+esc(sub)+'</div></div>';
  h+='<div style="display:flex;align-items:center;gap:9px;flex-shrink:0;">';
  if(spots||locationPending){
    h+='<div style="display:flex;flex-direction:column;gap:3px;align-items:flex-end;">';
    if(locationPending) h+=wxLocationPendingChip(locationPendingLabel);
    if(spots){ for(var ci=0; ci<Math.min(spots.length,locationPending?2:3); ci++){ h+=wxSpotChip(spots[ci]); } }
    h+='</div>';
  } else { h+='<div style="font-size:11.5px;font-weight:700;color:'+W.sub+';">hava…</div>'; }
  h+='<span style="color:'+W.chev+';transition:transform .2s;display:inline-flex;transform:rotate('+(open?'180deg':'0deg')+');">'+icon('chevron-down',14)+'</span>';
  h+='</div></div>';
  if(!open && spots){ h+='<div style="position:relative;margin-top:8px;text-align:center;font-size:10.5px;font-weight:700;letter-spacing:.3px;color:'+W.hint+';display:flex;align-items:center;justify-content:center;gap:4px;">detaylar için dokun '+icon('chevron-down',11)+'</div>'; }
  if(open && spots){
    h+='<div style="position:relative;margin-top:12px;animation:seyFade .25s ease;">';
    if(locationPending){
      h+='<div data-wx-location-pending style="display:flex;align-items:center;gap:8px;padding:10px 0 11px;color:'+W.title+';font-size:12.5px;font-weight:800;">'+icon('map-pin',17)+' <span>'+esc(locationPendingLabel)+'</span></div>';
    }
    for(var si=0; si<spots.length; si++){
      var sp=spots[si]; var m=wxMeta(sp.code,sp.isDay);
      h+='<div style="border-top:1px solid '+W.divider+';padding-top:11px;'+(si>0?'margin-top:11px;':'')+'">';
      h+='<div style="display:flex;align-items:center;gap:8px;margin-bottom:9px;"><span style="display:inline-flex;">'+wxSpotIcon(sp,20)+'</span>';
      h+='<div style="flex:1;min-width:0;"><div style="font-size:14.5px;font-weight:900;color:'+W.title+';">'+esc(sp.label)+(sp.place?' · <span style="font-weight:700;color:'+W.sub+';">'+esc(sp.place)+'</span>':'')+'</div><div style="font-size:11.5px;font-weight:700;color:'+W.sub+';">'+m.emoji+' '+m.label+'</div></div>';
      h+='<div style="font-size:22px;font-weight:900;color:'+(dark?'#FFE1BC':'#7A3E1E')+';">'+sp.temp+'°</div></div>';
      h+='<div style="display:flex;gap:6px;margin-bottom:6px;">'+wxDetail(icon('thermometer',13),'Hissedilen',sp.feels+'°')+wxDetail(icon('droplet',13),'Nem','%'+sp.hum)+wxDetail(icon('wind',13),'Rüzgâr',sp.wind+' km/sa')+'</div>';
      h+='<div style="display:flex;gap:6px;">'+wxDetail(icon('sun',13),'UV',(sp.uv!=null?sp.uv:'—'))+wxDetail(icon('arrow-up-down',13),'En Y/D',(sp.hi!=null?sp.hi+'°/'+sp.lo+'°':'—'))+wxDetail(icon('sunrise',13),'Doğ/Bat',wxHm(sp.sunrise)+'·'+wxHm(sp.sunset))+'</div>';
      h+='</div>';
    }
    if(primary){
      var adv=wxAdvice(primary);
      h+='<div style="border-top:1px solid '+W.divider+';padding-top:11px;margin-top:11px;"><div style="font-size:12.5px;font-weight:900;color:'+W.title+';margin-bottom:7px;display:flex;align-items:center;gap:5px;">'+icon('lightbulb',13)+' Sağlık notları</div>';
      for(var ai=0; ai<adv.length; ai++){ h+='<div style="display:flex;gap:8px;align-items:flex-start;background:'+W.noteBg+';border:'+(dark?'1px solid rgba(255,210,160,.08)':'none')+';border-radius:12px;padding:8px 10px;'+(ai>0?'margin-top:6px;':'')+'"><span style="font-size:15px;line-height:1.3;">'+adv[ai].i+'</span><span style="flex:1;font-size:12.5px;font-weight:600;color:'+W.note+';line-height:1.4;">'+esc(adv[ai].t)+'</span></div>'; }
      h+='</div>';
      var q=wxQuip(pm?pm.cat:'clear');
      h+='<div style="border-top:1px solid '+W.divider+';padding-top:11px;margin-top:11px;font-size:12.5px;font-style:italic;font-weight:600;color:'+W.title+';line-height:1.5;">❝ '+esc(q)+' ❞</div>';
    }
    if(wx.fetchedAt){ var am=Math.round((Date.now()-new Date(wx.fetchedAt).getTime())/60000); var us=am<1?'az önce':am<60?am+' dk önce':Math.round(am/60)+' sa önce'; h+='<div style="margin-top:9px;text-align:right;font-size:10px;color:'+W.foot+';">Open-Meteo · '+us+'</div>'; }
    h+='</div>';
  }
  h+='</div>';
  return h;
}
function onThisDayCard(){
  var today=todayStr(); var mmdd=today.slice(5); var curY=parseInt(today.slice(0,4),10);
  var best=null;
  for(var k in data.days){ if(String(k).slice(5)!==mmdd) continue; var y=parseInt(String(k).slice(0,4),10); if(isNaN(y)||y>=curY) continue; var r=data.days[k]; if(!r) continue;
    var hasG=Array.isArray(r.gratitude)&&r.gratitude.some(function(g){return String(g||'').trim();});
    var has=(countRec(r)>0)||r.mood||(r.note&&String(r.note).trim())||(r.intention&&String(r.intention).trim())||hasG;
    if(!has) continue;
    if(!best||k>best.date){ best={date:k,rec:r,year:y}; }
  }
  if(!best) return '';
  var r=best.rec; var yearsAgo=curY-best.year;
  var mo=r.mood?find(MOODS,'id',r.mood):null;
  var cnt=countRec(r), tot=habitCountOn(best.date);
  var h='<div class="glass" onclick="App.openDate(\''+best.date+'\')" style="cursor:pointer;border-radius:22px;padding:16px;display:flex;flex-direction:column;gap:10px;background:linear-gradient(160deg,rgba(201,184,255,0.16),rgba(255,225,154,0.10));">';
  h+='<div style="display:flex;align-items:center;gap:9px;"><span style="font-size:22px;line-height:1;display:inline-flex;">'+icon('lamp',20)+'</span><div style="flex:1;min-width:0;"><div style="font-size:15.5px;font-weight:800;">Bugün, '+yearsAgo+' yıl önce</div><div style="font-size:11.5px;color:var(--faint);margin-top:1px;">'+esc(dateLabelTR(best.date))+'</div></div><span style="font-size:16px;color:var(--faint);flex-shrink:0;">›</span></div>';
  var chips='';
  if(mo) chips+='<span style="font-size:12.5px;background:var(--field);border:1px solid var(--field-bd);border-radius:999px;padding:4px 10px;color:var(--text2);display:inline-flex;align-items:center;gap:4px;">'+moodEmoji(mo.id,13)+' '+esc(mo.short||mo.label)+'</span>';
  chips+='<span style="font-size:12.5px;background:var(--field);border:1px solid var(--field-bd);border-radius:999px;padding:4px 10px;color:var(--text2);display:inline-flex;align-items:center;gap:4px;">'+icon('circle-check',13)+' '+cnt+'/'+tot+'</span>';
  h+='<div style="display:flex;flex-wrap:wrap;gap:7px;">'+chips+'</div>';
  if(r.intention&&String(r.intention).trim()) h+='<div style="font-size:13.5px;color:var(--text2);line-height:1.5;display:flex;gap:5px;">'+icon('target',15)+' '+esc(String(r.intention).trim())+'</div>';
  if(r.note&&String(r.note).trim()) h+='<div style="font-size:13.5px;color:var(--text2);line-height:1.5;background:rgba(255,232,163,0.22);border-radius:12px;padding:10px 12px;">'+esc(String(r.note).trim())+'</div>';
  var gts=Array.isArray(r.gratitude)?r.gratitude.filter(function(g){return String(g||'').trim();}):[];
  if(gts.length) h+='<div style="font-size:13px;color:var(--text2);line-height:1.6;display:flex;gap:5px;">'+icon('heart-handshake',14)+' '+gts.map(function(g){return esc(String(g).trim());}).join(' · ')+'</div>';
  h+='<div style="font-size:11px;color:var(--faint);text-align:right;">O günü aç →</div>';
  h+='</div>';
  return h;
}
// Motivasyon V2.1 kişiselleştirme yardımcıları — yalnızca gerçek app verisinden
// (takma ad, gün/faz/alan, seri, cesaret kanıtı, dönüş sayısı, bugünün durumu)
// üretilir; sahte yakınlık, teşhis veya boş övgü yok (bkz. prompt_25).
function motivationIsCourageDomain(domain){
  return domain==='destek'||domain==='sinir'||domain==='onarim'||domain==='yakinlik';
}
function motivationPersonalLine(mot,sum,state){
  var doneToday=!!(state&&(state.status==='completed'||state.status==='minimum_completed'));
  if(doneToday&&state.status==='minimum_completed') return 'Bugün minimum sürümü seçtin; bu da yolun içinde, pas geçmek değil.';
  if(doneToday) return 'Bugünü kaydettin — bu, '+esc(mot.domainLabel)+' alanında somut bir kanıt.';
  if(sum.returnCount>0&&sum.pathStreak<=1) return 'Ara verdikten sonra döndüğün günler de başarı verisi.';
  if(motivationIsCourageDomain(mot.domain)) return 'Bu görev '+esc(mot.domainLabel)+' alanında; küçük bir adım da cesaret kanıtı sayılır.';
  var name=(data.settings&&data.settings.nickname)?String(data.settings.nickname).trim():'';
  return (name?esc(name)+', bugün':'Bugün')+' görev küçük olabilir; kayıt gerçek kalır.';
}
function motivationEvidenceLine(sum){
  var bits=[];
  if(sum.pathStreak>0) bits.push(sum.pathStreak+' günlük yol kaydı');
  if(sum.courageEvidence>0) bits.push(sum.courageEvidence+' cesaret kanıtı');
  if(sum.minimumTotal>0) bits.push(sum.minimumTotal+' minimum tamamlama');
  if(!bits.length) return '';
  return bits.join(' · ')+' — hepsi gerçek davranış verisi.';
}
function motivationNextStepLabel(state){
  if(state&&state.status==='minimum_completed') return 'Minimum kaydedildi';
  if(state&&state.status==='completed') return 'Bugün kaydedildi';
  return 'Tamamladım';
}
// Motivasyon V2.1 — 120 günlük programın "Bugün" kartı. Yerleşim prompt_13'te yapılacak.
// "Şeyma & Raşit'in Terapi Odası" -- Günışığı hava durumu kartıyla birebir aynı
// aç/kapa deseni (ui.motivationCardOpen + App.toggleMotivationCard, bkz. weatherHeaderHTML).
function motivationBadgeHTML(size){
  size=size||40;
  var isz=Math.round(size*0.5);
  return '<div style="position:relative;flex-shrink:0;width:'+size+'px;height:'+size+'px;border-radius:'+Math.round(size*0.34)+'px;display:flex;align-items:center;justify-content:center;background:linear-gradient(135deg,var(--room2),var(--room));box-shadow:0 8px 20px var(--room-glow);overflow:hidden;">'
    +'<span style="position:absolute;inset:0;background:linear-gradient(115deg,transparent 30%,rgba(255,255,255,0.55) 50%,transparent 70%);animation:seyShine 3.4s ease-in-out infinite;"></span>'
    +'<span style="position:relative;color:#fff;display:inline-flex;">'+icon('armchair',isz)+'</span></div>';
}
// El yazısı imza: "Şeyma" büyük, "& Raşit" daha küçük, ikisi de siyah (var(--text)).
function motivationSignHTML(delay){
  var anim=(delay!=null)?'animation:seyFloatIn .4s '+delay+'s ease both;':'';
  var h='<div class="sey-room-sign" style="margin-top:4px;display:flex;align-items:center;gap:5px;'+anim+'">';
  h+='<span style="display:inline-flex;color:var(--room);opacity:.8;">'+icon('feather',13)+'</span>';
  h+='<span style="font-size:24px;">Şeyma</span>';
  h+='<span style="font-size:16px;opacity:.9;">&amp; Raşit</span>';
  h+='</div>';
  return h;
}
function motivationQuoteBlockHTML(quote){
  var h='<div style="position:relative;padding-top:2px;">';
  h+='<span style="position:absolute;top:-22px;right:-4px;font-size:72px;line-height:1;font-weight:800;color:var(--room);opacity:0.11;pointer-events:none;">”</span>';
  h+='<div style="position:relative;font-size:15.5px;line-height:1.55;color:var(--text);font-style:italic;display:flex;gap:8px;text-shadow:0 0 18px var(--room-bg);"><span style="flex-shrink:0;opacity:0.8;color:var(--room);">'+icon('quote',16)+'</span><span>'+esc(quote)+'</span></div>';
  // Sözü Raşit bırakmış gibi -- doğrudan değil, elle atılmış bir "— R." imzasıyla ima.
  h+='<div class="sey-room-sign" style="text-align:right;margin-top:7px;font-size:15px;color:var(--room);opacity:.9;">— R.</div>';
  h+='</div>';
  return h;
}
// Kompakt tetikleyici kart: her zaman "İçsel Pusula" formunda. Dokununca tam ekran
// Terapi Odası açılır (App.openRoom); kapanınca yine animasyonlu İçsel Pusula'ya döner.
function motivationComingSoonCardHTML(){
  var pu=dark?'#B7A8F2':'#6E5FCB';
  var h='<div id="sey-motivation-card" class="glass sey-room-card" aria-label="Terapi Odası yakında açılıyor" style="border-radius:24px;padding:16px;display:flex;flex-direction:column;gap:12px;position:relative;overflow:hidden;border:1px solid color-mix(in srgb,'+pu+' 20%, var(--card-bd));">';
  h+='<div style="display:flex;align-items:center;gap:11px;">';
  h+='<span style="width:36px;height:36px;border-radius:12px;flex-shrink:0;display:inline-flex;align-items:center;justify-content:center;color:'+pu+';background:color-mix(in srgb,'+pu+' 15%, var(--icon));box-shadow:inset 0 1px 0 rgba(255,255,255,0.4);">'+icon('clock',19)+'</span>';
  h+='<div style="flex:1;min-width:0;">';
  h+='<div style="font-size:15.5px;font-weight:800;color:'+pu+';line-height:1.15;letter-spacing:.2px;">İçsel Pusula</div>';
  h+='<div style="font-size:11.5px;color:var(--faint);margin-top:2px;line-height:1.3;">Raşit\'le küçük ama gerçek adımlar</div>';
  h+='</div></div>';
  h+='<div style="font-size:13px;line-height:1.4;color:var(--muted);">13 Temmuz sabahı, <b style="color:var(--text);">1. gün</b>le birlikte açılıyor.</div>';
  h+='</div>';
  return h;
}
function motivationTodayCardHTML(){
  var M=window.MotivationProgramV2;
  if(!M||!data) return '';
  if(!featuresLive()) return motivationComingSoonCardHTML();
  var root=M.ensureMotivationRoot(data);
  if(!root) return '';
  var mot=M.activeDay(data);
  if(!mot) return '';
  var sum=M.progressSummary(data);
  var st=M.dayState(data,activeDate());
  var doneToday=!!(st&&(st.status==='completed'||st.status==='minimum_completed'));
  var pct=sum.programComplete?100:Math.max(2,sum.percent);
  var pu=dark?'#B7A8F2':'#6E5FCB';
  var h='<div id="sey-motivation-card" class="glass sey-room-card" onclick="App.openRoom()" role="button" aria-label="Terapi Odası\'nı aç" style="cursor:pointer;border-radius:24px;padding:16px;display:flex;flex-direction:column;gap:12px;position:relative;overflow:hidden;border:1px solid color-mix(in srgb,'+pu+' 20%, var(--card-bd));">';
  h+='<div style="display:flex;align-items:center;gap:11px;">';
  h+='<span style="width:36px;height:36px;border-radius:12px;flex-shrink:0;display:inline-flex;align-items:center;justify-content:center;color:'+pu+';background:color-mix(in srgb,'+pu+' 15%, var(--icon));box-shadow:inset 0 1px 0 rgba(255,255,255,0.4);">'+icon('compass',19)+'</span>';
  h+='<div style="flex:1;min-width:0;">';
  h+='<div style="font-size:15.5px;font-weight:800;color:'+pu+';line-height:1.15;letter-spacing:.2px;">İçsel Pusula</div>';
  h+='<div style="font-size:11.5px;color:var(--faint);margin-top:2px;line-height:1.3;">Raşit\'le küçük ama gerçek adımlar</div>';
  h+='</div>';
  if(doneToday) h+='<span style="flex-shrink:0;display:inline-flex;align-items:center;gap:4px;font-size:10.5px;font-weight:800;color:#3F8A4F;background:rgba(143,191,138,0.18);padding:3px 9px;border-radius:999px;">'+icon('check',11)+' bugün</span>';
  h+='<span style="color:'+pu+';font-size:20px;font-weight:700;line-height:1;flex-shrink:0;">›</span>';
  h+='</div>';
  var motDayText=sum.programComplete?'120 günlük yol tamamlandı':('Gün '+sum.currentProgramDay+'/'+sum.totalDays);
  h+='<div style="display:flex;align-items:center;gap:8px;">';
  h+='<div style="flex:1;min-width:0;font-size:13px;line-height:1.35;"><b style="color:var(--text);font-weight:800;">'+esc(motDayText)+'</b><span style="color:var(--muted);font-weight:700;"> · '+esc(mot.phaseTitle)+' · '+esc(mot.domainLabel)+'</span></div>';
  h+='<div style="flex-shrink:0;font-size:11px;font-weight:800;padding:3px 10px;border-radius:999px;color:'+(sum.programComplete?'#fff':'var(--muted)')+';background:'+(sum.programComplete?'linear-gradient(135deg,var(--room2),var(--room))':'var(--icon)')+';">%'+pct+'</div>';
  h+='</div>';
  h+='<div style="height:6px;border-radius:999px;background:var(--icon);overflow:hidden;position:relative;box-shadow:0 0 10px var(--room-glow);"><div style="height:100%;width:'+pct+'%;background:linear-gradient(90deg,var(--room2),var(--room));border-radius:999px;position:relative;overflow:hidden;transition:width .4s var(--ease-premium,ease);"><span style="position:absolute;inset:0;background:linear-gradient(115deg,transparent 30%,rgba(255,255,255,0.6) 50%,transparent 70%);animation:seyShine 2.6s ease-in-out infinite;"></span></div></div>';
  h+='<div style="text-align:center;font-size:10.5px;font-weight:800;letter-spacing:.3px;color:var(--room);display:flex;align-items:center;justify-content:center;gap:5px;">Terapi Odası\'nı tam ekran aç '+icon('sparkles',11)+'</div>';
  h+='</div>';
  return h;
}
// Tam ekran "Terapi Odası" — dokununca animasyonlu açılır; el yazısı imza (büyük
// Şeyma / küçük Raşit), parlayan başlık, GÜNE ÖZGÜ anlatı ve programın tüm zengin
// metinleri (açıklama, mercek, yansıma sorusu, sabah/akşam/zor gün notları) burada.
function roomStatsHTML(sum,fi){
  var h='<div style="display:flex;gap:8px;font-size:11.5px;'+(fi?fi(0.22):'')+'">';
  h+='<span style="flex:1;background:rgba(233,175,193,0.14);border-radius:10px;padding:9px 10px;color:var(--text2);display:flex;align-items:center;gap:5px;">'+icon('route',14)+' Yol <b style="margin-left:auto;">'+sum.pathStreak+'</b></span>';
  h+='<span style="flex:1;background:rgba(201,184,255,0.14);border-radius:10px;padding:9px 10px;color:var(--text2);display:flex;align-items:center;gap:5px;">'+icon('heart-handshake',14)+' Cesaret <b style="margin-left:auto;">'+sum.courageEvidence+'</b></span>';
  h+='<span style="flex:1;background:rgba(143,191,138,0.14);border-radius:10px;padding:9px 10px;color:var(--text2);display:flex;align-items:center;gap:5px;">'+icon('rotate-ccw',14)+' Dönüş <b style="margin-left:auto;">'+sum.returnCount+'</b></span>';
  h+='</div>';
  return h;
}
function roomOverlayHTML(){
  var M=window.MotivationProgramV2;
  if(!M||!data) return '';
  if(!featuresLive()) return '';
  var root=M.ensureMotivationRoot(data); if(!root) return '';
  var mot=M.activeDay(data); if(!mot) return '';
  var sum=M.progressSummary(data);
  var st=M.dayState(data,activeDate());
  var doneToday=!!(st&&(st.status==='completed'||st.status==='minimum_completed'));
  var hasReflection=!!(String(ui.motivationReflectionDraft||'').trim());
  var pct=sum.programComplete?100:Math.max(2,sum.percent);
  var fi=function(delay){ return 'animation:seyFloatIn .45s '+delay+'s ease both;'; };
  var nar=(window.MotivationNarratives&&window.MotivationNarratives.dayNarrative)?window.MotivationNarratives.dayNarrative(mot):null;
  var motDayText=sum.programComplete?'120 günlük yol tamamlandı':('Gün '+sum.currentProgramDay+'/'+sum.totalDays);

  var h='<div id="sey-room-overlay" onclick="App.closeRoom()" style="position:fixed;inset:0;z-index:360;background:rgba(30,22,30,0.55);backdrop-filter:blur(6px);-webkit-backdrop-filter:blur(6px);display:flex;align-items:stretch;justify-content:center;animation:seyFade .22s ease;">';
  h+='<div id="sey-room-sheet" onclick="event.stopPropagation()" style="width:100%;max-width:480px;height:100%;background:var(--modal);display:flex;flex-direction:column;box-shadow:0 0 60px rgba(0,0,0,0.4);animation:seyPop .34s var(--ease-premium,cubic-bezier(.16,1,.3,1)) both;transform-origin:center;overflow:hidden;">';
  // ── Sticky başlık: parlayan "Terapi Odası" + el yazısı imza (geri geldi) ──
  h+='<div style="flex-shrink:0;padding:calc(env(safe-area-inset-top) + 14px) 18px 14px;border-bottom:1px solid color-mix(in srgb,var(--room) 22%,var(--card-bd));background:linear-gradient(160deg,var(--room-bg),transparent);display:flex;flex-direction:column;gap:11px;position:relative;overflow:hidden;">';
  h+='<span style="position:absolute;inset:0;background:linear-gradient(115deg,transparent 30%,rgba(255,255,255,0.10) 50%,transparent 70%);animation:seyShine 4s ease-in-out infinite;pointer-events:none;"></span>';
  h+='<div style="position:relative;display:flex;align-items:flex-start;gap:12px;">';
  h+='<span style="animation:seyPop .34s var(--ease-premium,ease) both;">'+motivationBadgeHTML(46)+'</span>';
  h+='<div style="flex:1;min-width:0;">';
  h+='<div class="sey-room-title" style="font-size:22px;letter-spacing:2.5px;animation:seyFloatIn .4s .04s ease both;">Terapi Odası</div>';
  h+=motivationSignHTML(0.12);
  h+='</div>';
  h+='<button onclick="App.closeRoom()" aria-label="Kapat" style="flex-shrink:0;border:none;background:rgba(150,110,120,0.16);cursor:pointer;width:36px;height:36px;border-radius:50%;color:var(--muted);display:flex;align-items:center;justify-content:center;">'+icon('x',17)+'</button>';
  h+='</div>';
  h+='<div style="position:relative;display:flex;align-items:center;gap:8px;">';
  h+='<div style="flex:1;min-width:0;font-size:12.5px;line-height:1.35;"><b style="color:var(--text);font-weight:800;">'+esc(motDayText)+'</b><span style="color:var(--muted);font-weight:700;"> · '+esc(mot.phaseTitle)+' · '+esc(mot.domainLabel)+'</span></div>';
  h+='<div style="flex-shrink:0;font-size:11px;font-weight:800;padding:3px 10px;border-radius:999px;color:'+(sum.programComplete?'#fff':'var(--muted)')+';background:'+(sum.programComplete?'linear-gradient(135deg,var(--room2),var(--room))':'var(--icon)')+';">%'+pct+'</div>';
  h+='</div>';
  h+='<div style="position:relative;height:6px;border-radius:999px;background:var(--icon);overflow:hidden;box-shadow:0 0 10px var(--room-glow);"><div style="height:100%;width:'+pct+'%;background:linear-gradient(90deg,var(--room2),var(--room));border-radius:999px;position:relative;overflow:hidden;transition:width .4s var(--ease-premium,ease);"><span style="position:absolute;inset:0;background:linear-gradient(115deg,transparent 30%,rgba(255,255,255,0.6) 50%,transparent 70%);animation:seyShine 2.6s ease-in-out infinite;"></span></div></div>';
  h+='</div>';
  // ── Kaydırılabilir gövde ──
  h+='<div class="scroll" style="flex:1;min-height:0;overflow-y:auto;padding:16px 18px calc(env(safe-area-inset-bottom) + 22px);display:flex;flex-direction:column;gap:14px;">';

  if(sum.programComplete){
    h+='<div style="'+fi(0.04)+'">'+motivationQuoteBlockHTML(mot.quote)+'</div>';
    h+='<div style="font-size:13px;color:var(--text2);line-height:1.6;'+fi(0.08)+'">120 günlük yol, bu odada birlikte yüründü. Elde ettiğin bir rozet değil; zor bir günde kendine dönebildiğin, güvenilir bir iç yol.</div>';
    h+=roomStatsHTML(sum,fi);
    h+='<div style="font-size:12px;color:var(--room);line-height:1.5;font-style:italic;display:flex;align-items:center;gap:6px;'+fi(0.14)+'">'+icon('heart',13)+' Bu oda, ikimizin — sana iyi gelsin diye.</div>';
    h+='</div></div></div>';
    return h;
  }

  // Söz
  h+='<div style="'+fi(0.04)+'">'+motivationQuoteBlockHTML(mot.quote)+'</div>';
  // GÜNE ÖZGÜ ANLATI
  if(nar){
    h+='<div style="'+fi(0.06)+'display:flex;flex-direction:column;gap:9px;background:linear-gradient(160deg,var(--room-bg),transparent);border:1px solid color-mix(in srgb,var(--room) 20%,var(--card-bd));border-radius:18px;padding:15px;">';
    h+='<div style="display:flex;align-items:center;gap:7px;font-size:11px;font-weight:800;letter-spacing:.5px;color:var(--room);text-transform:uppercase;"><span style="display:inline-flex;">'+icon('feather',13)+'</span>'+esc(nar.phaseName)+' · Anlatı</div>';
    h+='<div style="font-size:12.5px;color:var(--muted);font-style:italic;line-height:1.5;">'+esc(nar.phaseEssence)+'</div>';
    nar.paragraphs.forEach(function(p){ h+='<div style="font-size:13.5px;line-height:1.62;color:var(--text2);">'+esc(p)+'</div>'; });
    (nar.phaseArc||[]).forEach(function(p){ h+='<div style="font-size:12.5px;line-height:1.6;color:var(--muted);">'+esc(p)+'</div>'; });
    h+='</div>';
  }
  // Mercek + açıklama + kişisel satır
  h+='<div style="'+fi(0.08)+'display:flex;flex-direction:column;gap:6px;">';
  h+='<div style="font-size:11.5px;font-weight:800;letter-spacing:.4px;color:var(--room);text-transform:uppercase;">Mercek · '+esc(mot.psychologicalLens)+'</div>';
  if(mot.explanation) h+='<div style="font-size:13px;color:var(--text2);line-height:1.55;">'+esc(mot.explanation)+'</div>';
  h+='<div style="font-size:12.5px;color:var(--muted);line-height:1.5;">'+esc(motivationPersonalLine(mot,sum,st))+'</div>';
  h+='</div>';
  // Bugünün sorusu (yansıma sorusu — artık görünür)
  if(mot.reflectionQuestion) h+='<div style="'+fi(0.1)+'display:flex;gap:9px;align-items:flex-start;background:rgba(201,184,255,0.12);border:1px solid rgba(201,184,255,0.28);border-radius:14px;padding:12px 13px;"><span style="flex-shrink:0;color:var(--room);display:inline-flex;margin-top:1px;">'+icon('lightbulb',15)+'</span><div style="font-size:13px;line-height:1.55;color:var(--text2);"><b>Bugünün sorusu:</b> '+esc(mot.reflectionQuestion)+'</div></div>';
  // Bugünkü görev + küçültme
  var minMode=!doneToday&&!!ui.motivationMinimumOpen;
  h+='<div style="border-left:3px solid var(--room);background:linear-gradient(160deg,var(--room-bg),transparent);border-radius:0 14px 14px 0;padding:12px;display:flex;flex-direction:column;gap:6px;transition:opacity .25s ease;'+fi(0.12)+(minMode?'opacity:.5;':'')+'">';
  h+='<div style="font-size:11px;font-weight:700;color:var(--muted);">Bugünkü görev</div>';
  h+='<div style="font-size:14px;color:var(--text);line-height:1.45;">'+esc(mot.standardTask)+'</div>';
  h+='</div>';
  if(minMode){
    h+='<div style="border:1px solid var(--room);background:linear-gradient(160deg,var(--room-bg),transparent);border-radius:14px;padding:12px 13px;display:flex;flex-direction:column;gap:6px;box-shadow:0 8px 22px var(--room-glow);animation:seyFloatIn .32s var(--ease-premium,ease) both;">';
    h+='<div style="display:flex;align-items:center;gap:6px;font-size:11px;font-weight:800;letter-spacing:.3px;color:var(--room);"><span style="display:inline-flex;">'+icon('feather',12)+'</span>Küçültülmüş görev</div>';
    h+='<div style="font-size:14px;color:var(--text);line-height:1.45;font-weight:600;">'+esc(mot.minimumTask)+'</div>';
    h+='<div style="font-size:11.5px;color:var(--text2);line-height:1.5;">Görevi küçültüyorsun, pas geçmiyorsun — bu hâliyle de kayda geçer.</div>';
    h+='</div>';
  }
  h+='<div style="'+fi(0.14)+'display:flex;flex-direction:column;gap:8px;">';
  // Kaydedilmiş günde de yansıma görünür ve düzenlenebilir (önceden dolu gelir).
  if(doneToday) h+='<div style="display:inline-flex;align-self:flex-start;align-items:center;gap:5px;font-size:11px;font-weight:800;color:#3F8A4F;background:rgba(143,191,138,0.16);padding:4px 11px;border-radius:999px;">'+icon('check',12)+(st&&st.status==='minimum_completed'?'Minimum kaydedildi · düzenleyebilirsin':'Bugün kaydedildi · düzenleyebilirsin')+'</div>';
  // Örnek yansımalar (açılır kapanır kart)
  if(mot.reflectionExamples && mot.reflectionExamples.length){
    var exOpen = !!ui.motivationExamplesOpen;
    h+='<div style="border:1px solid color-mix(in srgb,var(--room) 22%,var(--card-bd));background:linear-gradient(160deg,var(--room-bg),transparent);border-radius:14px;overflow:hidden;">';
    h+='<button type="button" onclick="App.toggleMotivationExamples()" style="width:100%;border:none;background:transparent;cursor:pointer;padding:12px 13px;display:flex;align-items:center;justify-content:space-between;gap:8px;color:var(--room);">';
    h+='<span style="display:flex;align-items:center;gap:7px;font-size:12.5px;font-weight:800;"><span style="display:inline-flex;">'+icon('pen-tool',14)+'</span>Bugün nasıl yazabilirim?</span>';
    h+='<span style="display:inline-flex;transition:transform .2s ease;transform:rotate('+(exOpen?'180deg':'0deg')+');">'+icon('chevron-down',14)+'</span>';
    h+='</button>';
    if(exOpen){
      h+='<div style="padding:0 13px 13px;display:flex;flex-direction:column;gap:8px;animation:seyFloatIn .22s ease both;">';
      h+='<div style="font-size:11px;color:var(--muted);line-height:1.45;">Aşağıdaki cümleler sana başlangıç noktası olabilir. İstediğini kendi deneyimine göre değiştir.</div>';
      mot.reflectionExamples.forEach(function(ex, idx){
        h+='<div style="display:flex;gap:8px;align-items:flex-start;">';
        h+='<button type="button" onclick="App.copyMotivationExample('+idx+')" title="Yansıma girişine kopyala" style="flex-shrink:0;border:1px solid var(--room);background:transparent;cursor:pointer;padding:7px 9px;border-radius:10px;color:var(--room);display:inline-flex;align-items:center;justify-content:center;">'+icon('copy',13)+'</button>';
        h+='<div style="font-size:12.5px;line-height:1.55;color:var(--text2);padding-top:2px;">'+esc(ex)+'</div>';
        h+='</div>';
      });
      h+='</div>';
    }
    h+='</div>';
  }
  h+='<input id="sey-mot-reflection-main" type="text" maxlength="280" value="'+esc(ui.motivationReflectionDraft||'')+'" oninput="App.setMotivationReflection(this)" placeholder="Bu odaya bugün ne bırakmak istersin?" style="border:1px solid var(--field-bd);background:var(--field);border-radius:12px;padding:11px 13px;font-size:14px;outline:none;color:var(--text);">';
  h+='<div style="font-size:10.5px;color:var(--faint);margin-top:-3px;">'+(doneToday?'Kaydını dilediğin an düzenleyip güncelleyebilirsin.':'Kısa da olsa yeter — bu oda seni duyuyor.')+'</div>';
  var pEnabled=hasReflection; // her zaman bir cümle iste → boşken buton pasif; "cümle yaz" uyarısı çıkmaz
  var saveStatus=doneToday?((st&&st.status==='minimum_completed')?'minimum_completed':'completed'):'completed';
  var pOnclick=minMode?"App.confirmMotivationMinimum()":("App.completeMotivationTask('"+saveStatus+"')");
  var pLabel=minMode?'Minimum görevi tamamladım':(doneToday?'Kaydı güncelle':motivationNextStepLabel(st));
  h+='<div style="display:flex;gap:8px;">';
  h+='<button id="sey-mot-complete-btn-main" onclick="'+pOnclick+'"'+(pEnabled?'':' disabled')+' style="position:relative;overflow:hidden;flex:1;min-width:0;border:none;cursor:'+(pEnabled?'pointer':'not-allowed')+';padding:13px;border-radius:14px;font-size:14px;font-weight:800;color:#fff;background:linear-gradient(135deg,var(--room2),#C9B8FF);opacity:'+(pEnabled?'1':'0.45')+';">'
    +'<span style="position:absolute;inset:0;background:linear-gradient(115deg,transparent 30%,rgba(255,255,255,0.45) 50%,transparent 70%);animation:seyShine 3.2s ease-in-out infinite;"></span>'
    +'<span style="position:relative;">'+esc(pLabel)+' '+icon('check',14)+'</span></button>';
  if(minMode) h+='<button onclick="App.closeMotivationMinimum()" style="flex-shrink:0;border:1px solid var(--field-bd);cursor:pointer;padding:13px 15px;border-radius:14px;font-size:12.5px;font-weight:700;color:var(--muted);background:transparent;">Vazgeç</button>';
  else if(!doneToday) h+='<button onclick="App.openMotivationMinimum()" style="flex-shrink:0;border:1px solid rgba(233,175,193,0.4);cursor:pointer;padding:13px 15px;border-radius:14px;font-size:12.5px;font-weight:700;color:var(--text2);background:rgba(233,175,193,0.10);">Görevi küçült</button>';
  h+='</div></div>';
  // Sabah / Akşam / Zor gün notları (programın zengin metinleri — artık görünür)
  if(mot.appNudge&&(mot.appNudge.morning||mot.appNudge.evening||mot.appNudge.hardDay)){
    var nudgeRow=function(ic,label,txt,col){ return '<div style="display:flex;gap:9px;align-items:flex-start;"><span style="width:28px;height:28px;border-radius:9px;flex-shrink:0;display:inline-flex;align-items:center;justify-content:center;color:'+col+';background:color-mix(in srgb,'+col+' 15%,var(--icon));">'+icon(ic,14)+'</span><div style="flex:1;min-width:0;"><div style="font-size:10.5px;font-weight:800;color:var(--muted);letter-spacing:.3px;">'+label+'</div><div style="font-size:12.5px;color:var(--text2);line-height:1.5;margin-top:1px;">'+esc(txt)+'</div></div></div>'; };
    h+='<div style="'+fi(0.16)+'display:flex;flex-direction:column;gap:10px;border-top:1px solid var(--card-bd);padding-top:13px;">';
    h+='<div style="font-size:11px;font-weight:800;letter-spacing:.5px;color:var(--faint);">GÜN BOYU EŞLİK</div>';
    if(mot.appNudge.morning) h+=nudgeRow('sunrise','SABAH',mot.appNudge.morning,'#E8A53C');
    if(mot.appNudge.evening) h+=nudgeRow('moon','AKŞAM',mot.appNudge.evening,'#7C5CC4');
    if(mot.appNudge.hardDay) h+=nudgeRow('triangle-alert','ZOR GÜN',mot.appNudge.hardDay,'#E9899F');
    h+='</div>';
  }
  if(mot.eveningCheck) h+='<div style="'+fi(0.18)+'font-size:11.5px;color:var(--faint);line-height:1.5;">'+esc(mot.eveningCheck)+'</div>';
  // İstatistikler
  h+=roomStatsHTML(sum,fi);
  var evLine=motivationEvidenceLine(sum);
  h+='<div style="'+fi(0.2)+'display:flex;flex-direction:column;gap:5px;">';
  if(evLine) h+='<div style="font-size:11px;color:var(--faint);line-height:1.4;">'+esc(evLine)+'</div>';
  if(nar&&nar.closer) h+='<div style="font-size:12px;color:var(--room);font-style:italic;line-height:1.5;display:flex;align-items:center;gap:6px;">'+icon('heart',13)+' '+esc(nar.closer)+'</div>';
  else h+='<div style="font-size:11px;color:var(--faint);line-height:1.4;font-style:italic;display:flex;align-items:center;gap:5px;">'+icon('heart',12)+' Bu oda, ikimizin — sana iyi gelsin diye.</div>';
  h+='</div>';
  h+='</div></div></div>';
  return h;
}
App.setMotivationReflection=function(el){
  ui.motivationReflectionDraft=String(el.value||'').slice(0,280);
  var has=!!ui.motivationReflectionDraft.trim();
  var btn=document.getElementById('sey-mot-complete-btn-main');
  if(btn){ btn.disabled=!has; btn.style.opacity=has?'1':'0.45'; btn.style.cursor=has?'pointer':'not-allowed'; }
};
App.toggleMotivationExamples=function(){
  ui.motivationExamplesOpen=!ui.motivationExamplesOpen;
  render();
};
App.copyMotivationExample=function(idx){
  var M=window.MotivationProgramV2;
  if(!M||!data) return;
  var mot=M.activeDay(data);
  if(!mot||!mot.reflectionExamples||!mot.reflectionExamples[idx]) return;
  var text=mot.reflectionExamples[idx];
  ui.motivationReflectionDraft=text.slice(0,280);
  var input=document.getElementById('sey-mot-reflection-main');
  if(input){ input.value=ui.motivationReflectionDraft; input.focus(); }
  var btn=document.getElementById('sey-mot-complete-btn-main');
  if(btn){ btn.disabled=false; btn.style.opacity='1'; btn.style.cursor='pointer'; }
  toast('Örnek yansıma girişe kopyalandı — dilediğin gibi düzenle.');
};
// Bir cümle bırakmak zorunlu: hem standart hem minimum tamamlamada, kullanıcı
// yazmadan devam edemez -- buton devre dışı bırakılır, burada da savunma amaçlı tekrar kontrol edilir.
App.completeMotivationTask=function(status){
  var M=window.MotivationProgramV2;
  if(!M||!data||!featuresLive()) return;
  var reflection=String(ui.motivationReflectionDraft||'').trim();
  if(!reflection){ toast('Devam etmeden önce bir cümle yaz — kısa da olsa yeter.'); return; }
  status=(status==='minimum_completed')?'minimum_completed':'completed';
  var mot=M.activeDay(data);
  var prev=M.dayState(data,activeDate());
  var wasDone=!!(prev&&(prev.status==='completed'||prev.status==='minimum_completed'));
  var courageBefore=M.progressSummary(data).courageEvidence;
  M.record(data,activeDate(),status,reflection);
  // Oda açıkken kaydı sonrası düzenlenebilir kalsın diye yansımayı input'ta tut.
  ui.motivationReflectionDraft=ui.roomOpen?reflection:'';
  var courageGained=M.progressSummary(data).courageEvidence>courageBefore;
  save();
  haptic([10,30,10]);
  render();
  var msg;
  if(wasDone) msg='Kaydın güncellendi';
  else msg=status==='minimum_completed'?'Minimum görev kaydedildi — bu da ilerleme':((mot&&mot.successMeaning)||'Bugünkü görev kaydedildi');
  if(courageGained) msg+=' · bir cesaret kanıtı daha';
  toast(msg);
};
// Görevi küçült akışı: yalnızca `ui`de geçici açık/kapalı durumu tutulur,
// kullanıcı "Minimum görevi tamamladım"a basmadan `data`ya hiçbir şey yazılmaz.
App.openMotivationMinimum=function(){
  if(!window.MotivationProgramV2||!data) return;
  ui.motivationMinimumOpen=true;
  haptic(10);
  updateMotivationCard();
};
App.closeMotivationMinimum=function(){
  ui.motivationMinimumOpen=false;
  updateMotivationCard();
};
App.confirmMotivationMinimum=function(){
  ui.motivationMinimumOpen=false;
  App.completeMotivationTask('minimum_completed');
};
// Kompakt hub kutucukları: okudum/izledim/dinledim — 3 tam-genişlik gradyan bar yerine
// yan yana 3 hafif kutucuk (görsel gürültüyü azaltır, günlük log ailesiyle gruplanır).
function hubTilesHTML(){
  // "Zihnimi Besledim" — premium, vurgulu bir kart: dört kutucuktan biri dolunca
  // üstünde onay rozeti belirir ve mediaFed tiki kendiliğinden yeşillenir.
  var day=(data&&data.days)?data.days[todayStr()]:null;
  var cnt=function(sec){ var e=(day&&day[sec]&&Array.isArray(day[sec].entries))?day[sec].entries:[]; return e.length; };
  var tile=function(fn,label,ic,col,bg,n){
    var done=n>0;
    var badge=done?'<span style="position:absolute;top:6px;right:6px;min-width:17px;height:17px;padding:0 4px;border-radius:999px;display:flex;align-items:center;justify-content:center;font-size:9.5px;font-weight:800;color:#fff;background:'+col+';box-shadow:'+(dark?'none':'0 2px 6px rgba(108,74,58,0.3)')+';">'+(n>1?n:icon('check',10))+'</span>':'';
    var surface=dark?'color-mix(in srgb,'+col+' '+(done?'16':'10')+'%, #0B0B0E)':bg;
    return '<button onclick="App.'+fn+'()" style="position:relative;flex:1;min-width:0;cursor:pointer;padding:14px 4px 12px;border-radius:18px;display:flex;flex-direction:column;align-items:center;gap:7px;background:'+surface+';border:1px solid color-mix(in srgb,'+col+' '+(done?'52':(dark?'34':'26'))+'%, transparent);box-shadow:'+(dark?'none':(done?'0 8px 20px color-mix(in srgb,'+col+' 22%, transparent)':'0 4px 12px rgba(108,74,58,0.06)'))+';transition:transform .18s var(--ease-premium,ease),border-color .2s,box-shadow .25s;">'
      +badge
      +'<span style="width:40px;height:40px;border-radius:13px;display:inline-flex;align-items:center;justify-content:center;color:'+col+';background:color-mix(in srgb,'+col+' '+(dark?'14':'17')+'%, transparent);box-shadow:'+(dark?'none':'inset 0 1px 0 rgba(255,255,255,0.35)')+';">'+icon(ic,19)+'</span>'
      +'<span style="font-size:11.5px;font-weight:800;letter-spacing:.1px;white-space:nowrap;color:'+col+';">'+label+'</span></button>';
  };
  var total=cnt('reading')+cnt('watching')+cnt('listening')+cnt('learning');
  var filledN=(cnt('reading')>0?1:0)+(cnt('watching')>0?1:0)+(cnt('listening')>0?1:0)+(cnt('learning')>0?1:0);
  var fed=total>0;
  var mc='#C77D93';
  var chip=fed
    ? '<span style="flex-shrink:0;font-size:10px;font-weight:800;letter-spacing:.2px;color:#3F8A4F;background:rgba(143,191,138,0.2);border:1px solid rgba(143,191,138,0.4);border-radius:999px;padding:3px 9px;display:inline-flex;align-items:center;gap:4px;">'+icon('check',11)+' Zihin tiki yeşil</span>'
    : '<span style="flex-shrink:0;font-size:10px;font-weight:800;letter-spacing:.2px;color:'+mc+';background:color-mix(in srgb,'+mc+' 12%, transparent);border:1px solid color-mix(in srgb,'+mc+' 30%, transparent);border-radius:999px;padding:3px 9px;">birini doldur → tik yeşil</span>';
  var h='<div class="glass"'+(dark?' data-dark-variant="mind"':'')+' style="border-radius:22px;padding:16px;display:flex;flex-direction:column;gap:13px;'+(dark?'background:linear-gradient(145deg,#111013,#0B0B0D);':'')+'border:1px solid color-mix(in srgb,'+mc+' '+(dark?'34':'24')+'%, var(--card-bd));box-shadow:'+(dark?'none':'0 12px 30px color-mix(in srgb,'+mc+' 14%, transparent)')+';">';
  h+='<div style="display:flex;align-items:center;gap:11px;">';
  h+='<span style="width:38px;height:38px;border-radius:13px;flex-shrink:0;display:inline-flex;align-items:center;justify-content:center;color:#fff;background:'+(dark?'linear-gradient(135deg,#8F5269,#6D567E)':'linear-gradient(135deg,'+mc+',#E9AFC1)')+';box-shadow:'+(dark?'none':'0 6px 16px color-mix(in srgb,'+mc+' 34%, transparent)')+';">'+icon('sparkles',19)+'</span>';
  h+='<div style="flex:1;min-width:0;"><div style="font-size:16px;font-weight:800;line-height:1.15;color:var(--text);">Zihnimi Besledim</div><div style="font-size:11.5px;color:var(--faint);margin-top:2px;line-height:1.3;">Okudum · izledim · dinledim · öğrendim — küçük besinler, büyük denge</div></div>';
  h+='</div>';
  h+='<div style="display:flex;align-items:center;justify-content:space-between;gap:8px;"><span style="font-size:11px;font-weight:800;letter-spacing:.4px;color:var(--muted);">BUGÜN '+filledN+'/4 ALAN</span>'+chip+'</div>';
  h+='<div style="display:flex;gap:9px;">';
  h+=tile('openReading','Okudum','book-open','var(--read)','var(--read-bg)',cnt('reading'));
  h+=tile('openWatching','İzledim','clapperboard','var(--watch)','var(--watch-bg)',cnt('watching'));
  h+=tile('openListening','Dinledim','headphones','var(--listen)','var(--listen-bg)',cnt('listening'));
  h+=tile('openLearning','Öğrendim','graduation-cap','var(--learn)','var(--learn-bg)',cnt('learning'));
  h+='</div></div>';
  return h;
}
// Raşit'in sözü — hemen Günışığı kartının altında; dokununca söz değişir (App.cycleRasit).
function rasitNoteIdx(curIdx){ var n=NOTES.length; return (((curIdx-1)+(ui.noteIndex||0))%n+n)%n; }
function rasitBubbleHTML(curIdx){
  var h='<div onclick="App.cycleRasit()" role="button" aria-label="Raşit\'in sözü — dokun, değişsin" style="cursor:pointer;display:flex;align-items:flex-start;gap:11px;">';
  h+='<div style="width:42px;height:42px;border-radius:50%;flex-shrink:0;display:flex;align-items:center;justify-content:center;color:#fff;background:linear-gradient(135deg,var(--room2),var(--room));box-shadow:0 6px 16px var(--room-glow);">'+icon('heart',20)+'</div>';
  h+='<div class="glass" style="position:relative;flex:1;min-width:0;border-radius:6px 20px 20px 20px;padding:12px 15px;border:1px solid color-mix(in srgb,var(--room) 28%, var(--card-bd));box-shadow:0 8px 22px var(--room-glow);">';
  h+='<div style="display:flex;align-items:center;gap:6px;margin-bottom:5px;"><span style="font-size:11px;font-weight:800;letter-spacing:0.8px;color:var(--room);">RAŞİT</span><span style="font-size:12px;">🦩</span><span style="margin-left:auto;font-size:10px;color:var(--faint);font-weight:700;display:inline-flex;align-items:center;gap:3px;">dokun '+icon('sparkles',10)+'</span></div>';
  h+='<div id="sey-rasit-note" style="font-size:14.5px;line-height:1.5;color:var(--text2);transition:opacity .18s ease;">'+esc(NOTES[rasitNoteIdx(curIdx)])+'</div>';
  h+='</div></div>';
  return h;
}
// ── Hero dashboard: kullanıcının bugünkü girdilerinin sakin, premium özeti ──
// Dört kompakt kutucuk (Mod · Su · Uyku · Adım). Veri girildikçe canlanır,
// eşik tutunca ilgili kutucuk yeşile döner — habits tikleriyle aynı dille.
function heroStatTile(ic,val,label,accent,met){
  var col=met?'#3F8A4F':accent;
  var bg=met?'rgba(143,191,138,0.16)':'var(--icon)';
  var filled=(val!=='—');
  return '<div style="flex:1;min-width:0;display:flex;flex-direction:column;align-items:center;gap:4px;padding:10px 4px;border-radius:15px;background:'+bg+';border:1px solid '+(met?'rgba(143,191,138,0.34)':'transparent')+';">'
    +'<span style="display:inline-flex;color:'+(filled?col:'var(--faint)')+';">'+icon(ic,15)+'</span>'
    +'<span style="font-size:13px;font-weight:800;line-height:1.05;color:'+(filled?'var(--text)':'var(--faint)')+';white-space:nowrap;">'+val+'</span>'
    +'<span style="font-size:9.5px;font-weight:700;letter-spacing:.3px;color:var(--faint);text-transform:uppercase;">'+label+'</span></div>';
}
function heroStatsHTML(rec){
  var mo=(rec&&rec.mood)?find(MOODS,'id',rec.mood):null;
  var water=rec?(Number(rec.water)||0):0;
  var sh=(rec&&rec.sleep&&rec.sleep.hours!=null&&rec.sleep.hours!=='')?Number(rec.sleep.hours):null;
  var es=effSteps(rec);
  var stepTxt='—';
  if(es.steps!=null){ stepTxt=es.steps>=1000?((es.steps/1000).toFixed(es.steps%1000===0?0:1).replace('.',',')+'B'):String(es.steps); }
  var h='<div style="display:flex;gap:7px;">';
  h+=heroStatTile(mo?mo.icon:'smile', mo?esc(mo.short):'—', 'Mod', 'var(--accent)', false);
  h+=heroStatTile('droplet', (water>0?water+'/'+WATER_GOAL:'—'), 'Su', '#5EA9E6', water>=WATER_GOAL);
  h+=heroStatTile('moon', (sh!=null?(String(sh).replace('.',',')+'s'):'—'), 'Uyku', '#9B7FC9', sh!=null&&sh>=SLEEP_TICK_MIN);
  h+=heroStatTile('footprints', stepTxt, 'Adım', '#5BA85B', es.steps!=null&&es.steps>=STEP_TICK_MIN);
  h+='</div>';
  return h;
}
// Kısa tik etiketleri (hero "en güçlü/zayıf" istatistiği için).
var SHORT_HABIT={sweetManaged:'Tatlı',foodManaged:'Yemek',coffeeManaged:'Kahve',eveningControl:'Akşam',walked20:'Yürüyüş',protein:'Protein',water:'Su',vitaminD:'D₃K₂ damla',sleepReg:'Uyku',journaled:'Not',mediaFed:'Zihin',freshAir:'Açık hava',selfKind:'Öz-şefkat'};
// ── Premium istatistik şeridi: tek çerçevede seri · 7 günlük ritim · mod eğilimi
// + son 14 günün en güçlü/destek isteyen tiki. Fazla kutu yerine tek panel + iç ayraçlar.
function heroPremiumStatsHTML(viewDate){
  // 7 günlük tamamlanma ritmi
  var sum=0,max=0;
  for(var i=0;i<7;i++){ var d=addDays(viewDate,-i); if(diffDays(data.startDate,d)<0) break; sum+=countRec(data.days[d]); max+=habitCountOn(d); }
  var wpct=max>0?Math.round(sum/max*100):0;
  var streak=currentStreak();
  // mod eğilimi (son 7 gün, eski → yeni)
  var moodDots='';
  for(var j=6;j>=0;j--){ var dd=addDays(viewDate,-j); if(diffDays(data.startDate,dd)<0) continue; var r=data.days[dd]; var m=r&&r.mood?r.mood:null; if(m){ var moo=find(MOODS,'id',m); moodDots+='<span style="display:inline-flex;color:var(--accent);">'+icon(moo?moo.icon:'circle',13)+'</span>'; } else { moodDots+='<span style="width:6px;height:6px;border-radius:50%;background:var(--field-bd);display:inline-block;"></span>'; } }
  if(!moodDots) moodDots='<span style="font-size:12px;color:var(--faint);">—</span>';
  // son 14 günün tik başarımı → en güçlü / destek isteyen
  var win=14,stt={};
  for(var k=0;k<win;k++){ var d2=addDays(viewDate,-k); if(diffDays(data.startDate,d2)<0) break; var r2=data.days[d2]; HABITS.forEach(function(hb){ if(hb.since&&d2<hb.since) return; if(!stt[hb.key]) stt[hb.key]={done:0,act:0,icon:hb.icon}; stt[hb.key].act++; if(r2&&r2.habits&&r2.habits[hb.key]) stt[hb.key].done++; }); }
  var best=null,worst=null;
  for(var key in stt){ var s=stt[key]; if(s.act<1) continue; var rate=s.done/s.act; if(best===null||rate>best.rate||(rate===best.rate&&s.done>best.done)) best={key:key,rate:rate,done:s.done,icon:s.icon}; if(worst===null||rate<worst.rate||(rate===worst.rate&&s.done<worst.done)) worst={key:key,rate:rate,done:s.done,icon:s.icon}; }
  var cell=function(ic,val,label,col){ return '<div style="flex:1;min-width:0;display:flex;flex-direction:column;align-items:center;gap:3px;text-align:center;">'
    +'<div style="display:flex;align-items:center;gap:4px;color:'+(col||'var(--text)')+';">'+(ic?'<span style="display:inline-flex;color:'+(col||'var(--muted)')+';">'+ic+'</span>':'')+'<span style="font-size:16px;font-weight:800;line-height:1;color:var(--text);white-space:nowrap;">'+val+'</span></div>'
    +'<span style="font-size:9px;font-weight:800;letter-spacing:.4px;color:var(--faint);text-transform:uppercase;">'+label+'</span></div>'; };
  var vline='<span style="width:1px;align-self:stretch;background:var(--card-bd);margin:2px 0;"></span>';
  var h='<div style="background:var(--icon);border-radius:16px;padding:12px 8px;display:flex;flex-direction:column;gap:10px;">';
  h+='<div style="display:flex;align-items:center;">';
  h+=cell(icon('flame',14),streak+(streak===1?' gün':' gün'),'Seri','#E8894A');
  h+=vline;
  h+=cell(null,'%'+wpct,'7 Günlük ritim');
  h+=vline;
  h+='<div style="flex:1;min-width:0;display:flex;flex-direction:column;align-items:center;gap:4px;"><div style="display:flex;align-items:center;gap:3px;min-height:16px;">'+moodDots+'</div><span style="font-size:9px;font-weight:800;letter-spacing:.4px;color:var(--faint);text-transform:uppercase;">Mod · 7 gün</span></div>';
  h+='</div>';
  if(best&&worst&&best.key!==worst.key){
    h+='<div style="display:flex;gap:8px;border-top:1px solid var(--card-bd);padding-top:9px;font-size:11px;">';
    h+='<div style="flex:1;min-width:0;display:flex;align-items:center;gap:6px;color:var(--muted);"><span style="display:inline-flex;color:#3F8A4F;flex-shrink:0;">'+best.icon+'</span><span style="min-width:0;"><b style="color:var(--text);font-weight:800;">'+esc(SHORT_HABIT[best.key]||best.key)+'</b> en güçlü <span style="color:#3F8A4F;font-weight:800;">%'+Math.round(best.rate*100)+'</span></span></div>';
    h+='<div style="flex:1;min-width:0;display:flex;align-items:center;gap:6px;color:var(--muted);"><span style="display:inline-flex;color:var(--accent);flex-shrink:0;">'+worst.icon+'</span><span style="min-width:0;"><b style="color:var(--text);font-weight:800;">'+esc(SHORT_HABIT[worst.key]||worst.key)+'</b>\'e destek <span style="color:var(--accent);font-weight:800;">%'+Math.round(worst.rate*100)+'</span></span></div>';
    h+='</div>';
  }
  h+='</div>';
  return h;
}
// Günün havası: tamamlanma seviyesine göre motive edici metin havuzu.
// Güne (curIdx) göre deterministik seçim — gün içinde titremez, günler arası çeşitlenir.
function gununHavasi(completed, ht, seed){
  var strong=Math.ceil(ht*0.66), medium=Math.ceil(ht*0.34);
  var lvl = completed>=ht?3 : completed>=strong?2 : completed>=medium?1 : 0;
  var POOL=[
    ['Bugün nazlı başladı','Yavaş da olsa buradasın','İlk adım en değerlisi','Nazikçe başlıyoruz','Her büyük gün küçük başlar'],
    ['Toparlanıyorsun, güzel','Adım adım yükseliyor','İyi bir başlangıç, sürdür','Filizleniyorsun','Küçük zaferler birikiyor'],
    ['Raydasın, harika gidiyor','İvme sende, momentum tam','Güçlü bir ritim yakaladın','Neredeyse zirvede','Denge sana yakışıyor'],
    ['Kraliçe günü','Bugünü fethettin','Tam isabet, ışıl ışıl','Zirvedesin, tadını çıkar','Kusursuz bir denge kurdun']
  ];
  var arr=POOL[lvl];
  var idx=((seed||0)%arr.length+arr.length)%arr.length;
  return arr[idx];
}
// Veriye bağlı, tek cümlelik bilimsel mikro-bilgi (hafif, kutusuz — üstten ayraçla).
function heroScienceLine(rec){
  var sh=(rec&&rec.sleep&&rec.sleep.hours!=null&&rec.sleep.hours!=='')?Number(rec.sleep.hours):null;
  var water=rec?(Number(rec.water)||0):0;
  var es=effSteps(rec);
  var mood=rec&&rec.mood;
  var txt;
  if(sh!=null&&sh<SLEEP_TICK_MIN) txt='7,5+ saat uyku, açlık hormonlarını (leptin/grelin) dengeler — şeker isteğini düşürür.';
  else if(water<WATER_GOAL) txt='Hafif susuzluk bile yorgunluk ve tatlı isteği gibi hissedilir; önce bir bardak su.';
  else if(es.steps!=null&&es.steps<STEP_TICK_MIN) txt='Kısa bir yürüyüş bile kan şekerini ve ruh hâlini dengeler — 10 dakika yeter.';
  else if(mood==='zorlandim'||mood==='cok-zorlandim') txt='Zor günlerde beyin hızlı dopamin arar; kendine nazik ol — küçük bir adım bile kayda geçer.';
  else txt='Küçük ve tutarlı adımlar, güçlü iradeden daha kalıcıdır — beyin (nöroplastisite) böyle öğrenir.';
  return '<div style="display:flex;align-items:flex-start;gap:8px;">'
    +'<span style="flex-shrink:0;color:var(--accent);display:inline-flex;margin-top:1px;">'+icon('brain',14)+'</span>'
    +'<span style="font-size:11.5px;line-height:1.5;color:var(--muted);">'+txt+'</span></div>';
}
// Sayfalar arası tutarlı bilimsel mikro-bilgi rozeti (Rapor/Sağlık/Takvim vb.).
function sciNote(txt){ return '<div style="display:flex;align-items:flex-start;gap:8px;background:rgba(201,184,255,0.10);border:1px solid rgba(201,184,255,0.22);border-radius:12px;padding:9px 11px;"><span style="flex-shrink:0;color:var(--accent);display:inline-flex;margin-top:1px;">'+icon('brain',13)+'</span><span style="font-size:11px;line-height:1.5;color:var(--muted);">'+txt+'</span></div>'; }
// Ortak sayfa başlığı (bugün sayfası dışındaki sekmelerle görsel uyum için).
function pageHeader(title,ic,sub){ return '<div style="padding:4px 4px 0;"><div style="font-size:23px;font-weight:800;display:flex;align-items:center;gap:8px;">'+esc(title)+' '+icon(ic,20)+'</div>'+(sub?'<div style="font-size:13px;color:var(--faint);margin-top:4px;line-height:1.4;">'+esc(sub)+'</div>':'')+'</div>'; }
// ── Raşit'in Kriz Odaları: üçlü, Raşit-temalı buton. Her biri süreli-bilimsel bir modal açar. ──
function rasitActionsHTML(){
  var day=(data&&data.days)?data.days[todayStr()]:null;
  var doneOf={sweet:!!(day&&day.craving10MinDone), food:!!(day&&day.foodCravingDone), coffee:!!(day&&day.coffeeCravingDone)};
  var tile=function(kind){
    var C=CRISES[kind]; var done=doneOf[kind];
    var badge=done?'<span style="position:absolute;top:6px;right:6px;width:18px;height:18px;border-radius:50%;display:flex;align-items:center;justify-content:center;color:'+C.accent+';background:'+(dark?'#0B0B0D':'#fff')+';box-shadow:'+(dark?'none':'0 2px 6px rgba(108,74,58,0.3)')+';">'+icon('check',11)+'</span>':'';
    var darkLine=dark?'<span aria-hidden="true" style="position:absolute;top:0;left:12px;right:12px;height:3px;border-radius:0 0 999px 999px;background:linear-gradient(90deg,'+C.accent+','+C.accent2+');"></span>':'';
    return '<button'+(dark?' data-dark-crisis-tile="'+kind+'"':'')+' onclick="App.openCrisis(\''+kind+'\')" style="position:relative;flex:1;min-width:0;cursor:pointer;padding:14px 6px 12px;border-radius:18px;'+(dark?'overflow:hidden;':'')+'display:flex;flex-direction:column;align-items:center;gap:6px;color:'+(dark?'#F7F4F6':'#fff')+';border:'+(dark?'1px solid color-mix(in srgb,'+C.accent+' 42%, rgba(255,255,255,.10))':'none')+';background:'+(dark?'linear-gradient(180deg,color-mix(in srgb,'+C.accent+' 9%,#141318),#09090B)':'linear-gradient(135deg,'+C.accent+','+C.accent2+')')+';box-shadow:'+(dark?'inset 0 1px 0 rgba(255,255,255,.035)':'0 10px 22px color-mix(in srgb,'+C.accent+' 42%, transparent)')+';transition:transform .18s var(--ease-premium,ease);">'
      +darkLine
      +badge
      +'<span style="width:38px;height:38px;border-radius:13px;display:inline-flex;align-items:center;justify-content:center;color:'+(dark?C.accent2:'#fff')+';background:'+(dark?'color-mix(in srgb,'+C.accent+' 13%, rgba(255,255,255,.035))':'rgba(255,255,255,0.22)')+';border:'+(dark?'1px solid color-mix(in srgb,'+C.accent+' 24%, transparent)':'none')+';box-shadow:'+(dark?'none':'inset 0 1px 0 rgba(255,255,255,0.4)')+';">'+icon(C.icon,19)+'</span>'
      +'<span style="font-size:12.5px;font-weight:800;letter-spacing:.1px;white-space:nowrap;">'+C.short+'</span>'
      +'<span style="font-size:8.5px;font-weight:800;letter-spacing:.4px;color:'+(dark?C.accent2:'currentColor')+';opacity:.92;text-transform:uppercase;">'+(done?'yönetildi ✓':'kriz odası')+'</span></button>';
  };
  var h='<div class="glass"'+(dark?' data-dark-variant="crisis"':'')+' style="border-radius:22px;padding:16px;display:flex;flex-direction:column;gap:13px;'+(dark?'background:linear-gradient(145deg,#121013,#0B0B0D);':'')+'border:1px solid color-mix(in srgb,#E9899F '+(dark?'34':'26')+'%, var(--card-bd));box-shadow:'+(dark?'none':'0 12px 30px rgba(233,137,159,0.16)')+';">';
  h+='<div style="display:flex;align-items:center;gap:11px;">';
  h+='<span style="width:38px;height:38px;border-radius:13px;flex-shrink:0;display:inline-flex;align-items:center;justify-content:center;color:#fff;background:'+(dark?'linear-gradient(135deg,#9B5870,#68577E)':'linear-gradient(135deg,#E9899F,#C9B8FF)')+';box-shadow:'+(dark?'none':'0 6px 16px rgba(233,137,159,0.4)')+';">'+icon('heart-handshake',19)+'</span>';
  h+='<div style="flex:1;min-width:0;"><div style="font-size:16px;font-weight:800;line-height:1.15;color:var(--text);display:flex;align-items:center;gap:6px;">Kriz mi geldi? Raşit yetişiyor <span style="font-size:14px;">🦩</span></div><div style="font-size:11.5px;color:var(--faint);margin-top:2px;line-height:1.3;">Süreli, bilimsel bir odaya gir — bastırma, yönet.</div></div>';
  h+='</div>';
  h+='<div style="display:flex;gap:9px;">'+tile('sweet')+tile('food')+tile('coffee')+'</div>';
  h+='</div>';
  return h;
}
// ── Raşit'e ulaş: yaz / ara — "Raşit'ten Notlar" kartının hemen altında, premium ikili. ──
function rasitContactHTML(){
  var btn=function(href,attr,ic,label,sub){
    return '<a href="'+href+'"'+attr+' style="text-decoration:none;flex:1;min-width:0;display:flex;align-items:center;gap:10px;padding:13px 14px;border-radius:18px;background:linear-gradient(135deg,color-mix(in srgb,var(--room) 14%, var(--card)),color-mix(in srgb,var(--room) 6%, var(--card)));border:1px solid color-mix(in srgb,var(--room) 34%, var(--card-bd));box-shadow:0 8px 20px color-mix(in srgb,var(--room) 16%, transparent);color:var(--room);">'
      +'<span style="width:36px;height:36px;border-radius:12px;flex-shrink:0;display:inline-flex;align-items:center;justify-content:center;color:#fff;background:linear-gradient(135deg,var(--room2),var(--room));box-shadow:0 4px 12px var(--room-glow);">'+icon(ic,17)+'</span>'
      +'<span style="min-width:0;display:flex;flex-direction:column;line-height:1.15;"><span style="font-size:14px;font-weight:800;color:var(--text);white-space:nowrap;">'+label+'</span><span style="font-size:10.5px;font-weight:600;color:var(--faint);white-space:nowrap;">'+sub+'</span></span></a>';
  };
  var h='<div style="display:flex;gap:9px;margin-top:-4px;">';
  h+=btn(WA,' target="_blank" rel="noopener"','send-horizontal','Raşit\'e yaz','WhatsApp\'tan mesaj');
  h+=btn(TEL,'','phone','Raşit\'i ara','Bir tık uzağında');
  h+='</div>';
  return h;
}
// ── Günün Fotoğrafı kartı: Wikimedia Commons POTD, National Geographic estetiğinde ──
function dailyPhotoCardHTML(){
  var p=data.dailyPhoto||{};
  var hasUrl=!!p.url;
  var open=!!ui.dailyPhotoOpen;
  var accent=dark?'#F4C980':'#8A5A2B';
  var cardBg=dark?'linear-gradient(145deg,#141012,#0B0B0D)':'linear-gradient(145deg,#FFF8F0,#FDF6ED)';
  var border=dark?'1px solid rgba(244,201,128,0.20)':'1px solid rgba(138,90,43,0.16)';
  var muted=dark?'#C8B9A6':'#8A6A52';
  var h='<div class="glass sey-daily-photo" onclick="App.toggleDailyPhoto()" role="button" aria-expanded="'+(open?'true':'false')+'" style="cursor:pointer;position:relative;overflow:hidden;border-radius:24px;background:'+cardBg+';border:'+border+';box-shadow:'+(dark?'0 16px 38px rgba(0,0,0,0.42)':'0 14px 32px rgba(138,90,43,0.16)')+';display:flex;flex-direction:column;">';
  // Başlık şeridi (Günışığı kartıyla aynı aç/kapa deseni)
  h+='<div style="display:flex;align-items:center;justify-content:space-between;padding:14px 16px 10px;">';
  h+='<div style="display:flex;align-items:center;gap:9px;">';
  h+='<span style="width:32px;height:32px;border-radius:10px;display:inline-flex;align-items:center;justify-content:center;color:'+accent+';background:color-mix(in srgb,'+accent+' '+(dark?'16':'18')+'%, transparent);box-shadow:inset 0 1px 0 rgba(255,255,255,'+(dark?'0.08':'0.45')+');">'+icon('camera',17)+'</span>';
  h+='<div><div style="font-size:12px;font-weight:900;letter-spacing:1.2px;color:'+accent+';">GÜNÜN FOTOĞRAFI</div><div style="font-size:10.5px;color:'+muted+';font-weight:700;">Wikimedia Commons · Picture of the Day</div></div>';
  h+='</div>';
  h+='<div style="display:flex;align-items:center;gap:4px;">';
  h+='<button onclick="event.stopPropagation();App.refreshDailyPhoto()" aria-label="Yenile" title="Yenile" style="flex-shrink:0;border:none;background:transparent;cursor:pointer;width:32px;height:32px;border-radius:50%;display:inline-flex;align-items:center;justify-content:center;color:'+accent+';transition:transform .2s;">'+icon('rotate-ccw',16)+'</button>';
  h+='<span style="color:'+accent+';transition:transform .2s;display:inline-flex;transform:rotate('+(open?'180deg':'0deg')+');">'+icon('chevron-down',16)+'</span>';
  h+='</div>';
  h+='</div>';
  if(open){
    // Görsel alanı (açıkken göster)
    h+='<div class="sey-collbody" style="position:relative;margin:0 12px 12px;border-radius:18px;overflow:hidden;background:'+(dark?'#0F0D0E':'#EDE5DB')+';aspect-ratio:4/3;">';
    if(hasUrl){
     h+='<img src="'+esc(p.url)+'" alt="'+esc(p.title||'Günün fotoğrafı')+'" loading="eager" onload="this.style.opacity=1" style="display:block;width:100%;height:100%;object-fit:cover;opacity:0;transition:opacity .6s ease;">';
     h+='<div style="position:absolute;inset:0;background:linear-gradient(to top,rgba(0,0,0,0.72) 0%,rgba(0,0,0,0.28) 40%,transparent 70%);pointer-events:none;"></div>';
     h+='<div style="position:absolute;left:0;right:0;bottom:0;padding:14px 14px 12px;color:#fff;">';
     if(p.title) h+='<div style="font-size:15px;font-weight:800;line-height:1.25;text-shadow:0 1px 3px rgba(0,0,0,0.45);">'+esc(p.title)+'</div>';
     var meta=[];
     if(p.artist) meta.push('© '+esc(p.artist));
     if(p.license) meta.push(esc(p.license));
     if(meta.length) h+='<div style="margin-top:5px;font-size:10.5px;font-weight:700;opacity:.82;text-shadow:0 1px 2px rgba(0,0,0,0.35);">'+meta.join(' · ')+'</div>';
     h+='</div>';
     if(p.pageUrl){
       h+='<a href="'+esc(p.pageUrl)+'" target="_blank" rel="noopener" onclick="event.stopPropagation()" style="position:absolute;top:10px;right:10px;display:inline-flex;align-items:center;gap:4px;padding:6px 10px;border-radius:999px;background:rgba(0,0,0,0.45);color:#fff;font-size:10px;font-weight:800;text-decoration:none;backdrop-filter:blur(4px);-webkit-backdrop-filter:blur(4px);">'+icon('external-link',11)+' Kaynak</a>';
     }
    }else{
     h+='<div style="position:absolute;inset:0;display:flex;flex-direction:column;align-items:center;justify-content:center;gap:10px;color:'+muted+';">';
     h+='<span style="opacity:.7;">'+icon('image',40)+'</span>';
     h+='<div style="font-size:13px;font-weight:700;">Bugünün fotoğrafı yükleniyor…</div>';
     h+='</div>';
    }
    h+='</div>';
  } else {
    // Kapalıyken minimal önizleme: küçük thumbnail + başlık
    h+='<div style="display:flex;align-items:center;gap:10px;padding:0 16px 12px;margin-top:-4px;">';
    if(hasUrl){
      h+='<div style="width:52px;height:40px;border-radius:10px;overflow:hidden;flex-shrink:0;background:'+(dark?'#0F0D0E':'#EDE5DB')+';"><img src="'+esc(p.url)+'" alt="" style="width:100%;height:100%;object-fit:cover;"></div>';
    } else {
      h+='<div style="width:52px;height:40px;border-radius:10px;overflow:hidden;flex-shrink:0;background:'+(dark?'#0F0D0E':'#EDE5DB')+';display:flex;align-items:center;justify-content:center;color:'+muted+';">'+icon('image',20)+'</div>';
    }
    h+='<div style="flex:1;min-width:0;">';
    if(p.title) h+='<div style="font-size:13px;font-weight:800;color:'+(dark?'#F7F0E8':'#5A3A26')+';white-space:nowrap;overflow:hidden;text-overflow:ellipsis;">'+esc(p.title)+'</div>';
    h+='<div style="font-size:11px;color:'+muted+';font-weight:600;">Dokun, açalım · '+(p.source||'Wikimedia Commons')+'</div>';
    h+='</div>';
    h+='<span style="color:'+accent+';">'+icon('chevron-down',14)+'</span>';
    h+='</div>';
  }
  h+='</div>';
  return h;
}
function bugunHTML(){
  var today=todayStr();
  var ed=editing();
  var viewDate=activeDate();
  var curRaw=dayIndexFor(viewDate);
  var curIdx=Math.max(1,curRaw);
  var streak=currentStreak();
  var rec=data.days[viewDate]||null;
  if(rec) syncDerivedHabits(rec); // türetilmiş tikleri, işlenen günün verisiyle görüntüden önce hizala
  var completed=countRec(rec);
  var circ=2*Math.PI*42;
  var ht=habitCountOn(viewDate);
  var badge=gununHavasi(completed, ht, curIdx);
  var pct=Math.round(completed/ht*100);
  var off=circ*(1-completed/ht);
  var _hr=new Date().getHours();
  var _greet=(_hr>=5&&_hr<11)?'Günaydın':(_hr<18)?'İyi günler':(_hr<22)?'İyi akşamlar':'İyi geceler';

  var h='<div style="animation:seyFade .3s ease;display:flex;flex-direction:column;gap:14px;">';
  // ── En üst: repoya bağlan şeridi → hava (Günışığı) → Raşit'in sözü → konum → hero ──
  if(!ed){
    h+=saveBanner();
    h+=locationCardHTML(); // Konum & Hareket: repoya bağlan şeridinin hemen altında
    h+=weatherHeaderHTML(_greet);
    h+=dailyPhotoCardHTML(); // Günün Fotoğrafı — Günışığı hava kartının hemen altında
    h+=rasitBubbleHTML(curIdx);
    h+=rasitContactHTML(); // Raşit'e yaz / ara — notlar kartının hemen altında (premium ikili)
  }
  // ── HERO: bugünün canlı özeti (dashboard) · niyet vurgulu ──
  h+='<div class="glass" style="border-radius:26px;padding:18px;box-shadow:0 10px 28px rgba(108,74,58,0.08);display:flex;flex-direction:column;gap:15px;">';
  h+='<div style="display:flex;justify-content:space-between;align-items:flex-start;">';
  h+='<div><div style="font-size:13px;letter-spacing:1px;color:var(--faint);font-weight:700;">ŞEYMA 🦩</div><div style="font-size:14px;color:var(--muted);margin-top:3px;">'+(ed?esc(dateLabelTR(viewDate)):'Minik Denge Günlüğü')+'</div></div>';
  h+='<div style="display:flex;align-items:center;gap:8px;">';
  h+='<div style="background:rgba(201,184,255,0.28);color:var(--choc);font-weight:700;font-size:13px;padding:7px 13px;border-radius:999px;white-space:nowrap;display:flex;align-items:center;gap:5px;">Gün '+curIdx+(!ed&&streak>1?('<span style="display:inline-flex;align-items:center;gap:2px;">'+icon('flame',13)+streak+'</span>'):'')+'</div></div></div>';
  h+='<div style="display:flex;align-items:center;gap:18px;">';
  h+='<div style="position:relative;width:96px;height:96px;flex-shrink:0;"><svg width="96" height="96" viewBox="0 0 96 96"><circle cx="48" cy="48" r="42" fill="none" stroke="rgba(150,110,120,0.18)" stroke-width="9"></circle><circle cx="48" cy="48" r="42" fill="none" stroke="#E9AFC1" stroke-width="9" stroke-linecap="round" stroke-dasharray="'+circ+'" stroke-dashoffset="'+off+'" transform="rotate(-90 48 48)" style="transition:stroke-dashoffset .6s ease"></circle></svg>';
  h+='<div style="position:absolute;inset:0;display:flex;flex-direction:column;align-items:center;justify-content:center;"><div style="font-size:25px;font-weight:800;line-height:1;">'+pct+'%</div><div style="font-size:11px;color:var(--faint);margin-top:2px;">'+(ed?'o gün':'bugün')+'</div></div></div>';
  h+='<div style="flex:1;min-width:0;"><div style="font-size:13px;color:var(--faint);margin-bottom:6px;">'+(ed?'O günün havası':'Bugünün havası')+'</div><div style="font-size:19px;font-weight:800;line-height:1.25;">'+esc(badge)+'</div><div style="font-size:12px;color:var(--muted);margin-top:5px;font-weight:600;">'+completed+'/'+ht+' tik bugün</div></div></div>';
  // premium istatistik şeridi (seri · 7 günlük ritim · mod eğilimi · en güçlü/zayıf tik)
  h+=heroPremiumStatsHTML(viewDate);
  // bugünkü girdi özeti (Mod · Su · Uyku · Adım)
  h+=heroStatsHTML(rec);
  // ── Niyet + bilimsel mikro-bilgi — hafif, üstten ayraçlı (fazla çerçeve yok) ──
  h+='<div style="border-top:1px solid var(--card-bd);padding-top:13px;display:flex;flex-direction:column;gap:12px;">';
  h+='<div style="display:flex;flex-direction:column;gap:7px;">';
  h+='<div style="display:flex;align-items:center;gap:7px;"><span style="display:inline-flex;color:var(--accent);">'+icon('target',15)+'</span><span style="font-size:12px;font-weight:800;letter-spacing:1px;color:var(--accent);">'+(ed?'O GÜNÜN NİYETİ':'BUGÜNÜN NİYETİ')+'</span></div>';
  h+='<input type="text" value="'+esc(rec&&rec.intention?rec.intention:'')+'" oninput="App.onIntention(this)" placeholder="'+(ed?'O günün niyeti…':'örn. Bugün kendime nazik olacağım')+'" maxlength="140" style="width:100%;box-sizing:border-box;border:1px solid var(--field-bd);background:var(--field);border-radius:12px;padding:12px 13px;font-size:15px;font-weight:700;outline:none;color:var(--text);">';
  h+='</div>';
  h+=heroScienceLine(rec);
  h+='</div>';
  h+='</div>';

  // Terapi Odası — hero'nun hemen altında
  if(!ed){ h+=motivationTodayCardHTML(); }

  // Raşit'in Kriz Odaları — üçlü buton (tatlı · yemek · kahve), her biri modal açar
  if(!ed) h+=rasitActionsHTML();

  // Zihnini besleyen hub kutucukları — bugünün modu kartının hemen üstünde
  if(!ed) h+=hubTilesHTML();

  // Dünkü magnezyum etkisi geri bildirimi
  if(!ed) h+=magnesiumFeedbackHTML(viewDate);

  // Magnezyum Danışmanı — bugünün modu kartının hemen üstünde
  if(!ed) h+=magnesiumBannerHTML(viewDate);

  // Bugünün modu
  h+=moodCardHTML(rec);

  // daily banner (distinct) — Motivasyon V2.1 devredeyken bu eski kart tekrar
  // eden bir "gunun mesaji" olarak kafa karistirmasin diye gosterilmez; DAILY
  // dizisi ve render kodu silinmedi, yalnizca V2 yokken devrede kalan bir
  // yedek (fallback) haline geldi.
  if(!window.MotivationProgramV2){
    h+='<div style="position:relative;overflow:hidden;background:linear-gradient(135deg,#FFE19A,#FFC9A3 55%,#F7B7C9);border-radius:24px;padding:22px 22px 20px;box-shadow:0 12px 28px rgba(255,180,140,0.32);">';
    h+='<div style="position:absolute;top:-26px;right:10px;font-size:130px;line-height:1;font-weight:800;color:#fff;opacity:0.22;">\u201d</div>';
    h+='<div style="display:flex;align-items:center;gap:8px;margin-bottom:9px;position:relative;"><span style="display:inline-flex;">'+icon('sun',16)+'</span><span style="font-size:11.5px;letter-spacing:1.5px;font-weight:800;color:#9A5A3C;">GÜNÜN MESAJI</span></div>';
    h+='<div style="position:relative;font-size:19px;font-weight:800;line-height:1.36;color:#5A2E2A;">'+esc(DAILY[(curIdx-1)%DAILY.length])+'</div></div>';
  }

  // günün niyeti artık hero kartının içinde (yukarıda).


  if(!ed){
  // akşam nudge (yalnızca gece, okuma eklenmediyse)
  h+=eveningNudge(rec);
  }

  // Bugünün tikleri (açılır kart)
  h+=habitsCardHTML(rec);

  // akşam adım hatırlatması (yalnızca akşam, bugünün adımı boşsa)
  if(!ed) h+=stepReminder(rec);

  // Beslenme — özet (makro) + "ne yedim" birleşik açılır kart
  h+=beslenmeCardHTML(rec);

  // su
  h+=waterCard(rec);

  // Günün yansıması — kendine not + 3 güzel şey, birleşik premium açılır kart
  h+=reflectionCardHTML(rec);

  // dağıldı
  if(!ed) h+=onThisDayCard();
  if(!ed) h+='<button onclick="App.openEmergency()" style="border:1px dashed rgba(150,110,120,0.3);background:var(--card);cursor:pointer;width:100%;padding:14px;border-radius:18px;font-size:15px;font-weight:600;color:var(--muted);display:flex;align-items:center;justify-content:center;gap:6px;">Bugün biraz dağıldı '+icon('heart-handshake',15)+'</button>';
  h+='</div>';
  return h;
}

// ── Kriz odası modalı: Tatlı · Yemek · Kahve. Süreli, bilimsel, işlevsel bir mikro-müdahale. ──
function crisisModalHTML(){
  var kind=ui.crisisKind; var C=CRISES[kind]; if(!C) return '';
  var A=C.accent, A2=C.accent2, hr=new Date().getHours();
  var tcap=(kind==='coffee'?'MOLASI':'KURALI');
  var pill=function(n){ return '<span style="font-size:11px;font-weight:800;color:#fff;background:'+A+';border-radius:999px;min-width:20px;height:20px;padding:0 6px;display:inline-flex;align-items:center;justify-content:center;">'+n+'</span>'; };
  // Premium bölüm başlığı (açılır/kapanır DEĞİL): tüm içerik her zaman görünür,
  // sayfa serbestçe kaydırılır — çerçeve/kafes yok, hiçbir şey kırpılmaz.
  var secHead=function(ic,title,sub,n){
    var s='<div style="display:flex;align-items:center;gap:11px;">';
    s+='<span style="width:38px;height:38px;border-radius:13px;flex-shrink:0;display:inline-flex;align-items:center;justify-content:center;color:'+A+';background:color-mix(in srgb,'+A+' 15%, var(--icon));box-shadow:inset 0 1px 0 rgba(255,255,255,0.4);">'+icon(ic,17)+'</span>';
    s+='<div style="flex:1;min-width:0;"><div style="font-size:15.5px;font-weight:800;color:var(--text);line-height:1.15;">'+title+'</div><div style="font-size:11.5px;color:var(--faint);margin-top:2px;line-height:1.3;">'+sub+'</div></div>';
    if(n>0) s+='<div style="flex-shrink:0;">'+pill(n)+'</div>';
    s+='</div>';
    return s;
  };
  // Bölümü tek akışta toplayan sarmalayıcı: başlık + üstünde ince accent ayraç.
  var section=function(ic,title,sub,n,items){
    return '<div style="display:flex;flex-direction:column;gap:11px;padding-top:4px;">'
      +'<div style="height:1px;background:linear-gradient(90deg,transparent,color-mix(in srgb,'+A+' 30%, transparent),transparent);"></div>'
      +secHead(ic,title,sub,n)
      +'<div style="display:flex;flex-direction:column;gap:9px;">'+items+'</div></div>';
  };

  // Tam sayfa modal: alttan-sayfa yerine tüm ekranı kaplar → uzun expander gövdeleri
  // artık dar bir çerçeveye sıkışmaz, serbestçe kaydırılır. Birincil eylem sabit alt bar'da.
  var h='<div id="sey-crisis-back" onclick="App.closeCrisis()" style="position:fixed;inset:0;z-index:340;background:rgba(44,36,38,0.52);backdrop-filter:blur(6px);-webkit-backdrop-filter:blur(6px);display:flex;align-items:stretch;justify-content:center;animation:seyFade .2s ease;">';
  h+='<div id="sey-crisis-card" onclick="event.stopPropagation()" style="position:relative;width:100%;max-width:480px;height:100%;background:var(--modal);box-shadow:0 0 60px rgba(0,0,0,0.32);animation:seyFloatIn .32s var(--ease-premium,ease);display:flex;flex-direction:column;overflow:hidden;">';

  // sticky header (gradient accent, Raşit branding, safe-area üst boşluğu)
  h+='<div style="flex-shrink:0;position:relative;padding:calc(env(safe-area-inset-top) + 15px) 15px 15px;background:linear-gradient(135deg,'+A+','+A2+');color:#fff;box-shadow:0 8px 22px color-mix(in srgb,'+A+' 32%, transparent);overflow:hidden;">';
  h+='<div style="position:absolute;top:-40px;right:-34px;width:150px;height:150px;border-radius:50%;background:radial-gradient(circle,rgba(255,255,255,0.22),transparent 70%);pointer-events:none;"></div>';
  h+='<div style="position:relative;display:flex;align-items:center;gap:12px;">';
  h+='<span style="width:46px;height:46px;border-radius:15px;flex-shrink:0;display:inline-flex;align-items:center;justify-content:center;background:rgba(255,255,255,0.22);box-shadow:inset 0 1px 0 rgba(255,255,255,0.4);">'+icon(C.icon,23)+'</span>';
  h+='<div style="flex:1;min-width:0;"><div style="font-size:10px;font-weight:800;letter-spacing:1px;opacity:.92;display:flex;align-items:center;gap:5px;">'+C.tag+' <span style="font-size:12px;">🦩</span></div><div style="font-size:20px;font-weight:800;line-height:1.15;margin-top:2px;">Raşit\'in Kriz Odası</div></div>';
  h+='<button onclick="App.closeCrisis()" aria-label="Kapat" style="flex-shrink:0;border:none;cursor:pointer;background:rgba(255,255,255,0.22);width:36px;height:36px;border-radius:50%;color:#fff;display:flex;align-items:center;justify-content:center;">'+icon('x',17)+'</button>';
  h+='</div>';
  // 3 adımlı mikro-müdahale rayı: Dur → Dene → Karar ver
  h+='<div style="position:relative;display:flex;gap:6px;margin-top:13px;">';
  [['1','Dur'],['2','Dene'],['3','Karar ver']].forEach(function(st){
    h+='<div style="flex:1;display:flex;align-items:center;gap:6px;background:rgba(255,255,255,0.16);border-radius:11px;padding:7px 9px;"><span style="width:20px;height:20px;border-radius:50%;flex-shrink:0;display:inline-flex;align-items:center;justify-content:center;background:rgba(255,255,255,0.28);font-size:10.5px;font-weight:900;">'+st[0]+'</span><span style="font-size:11.5px;font-weight:800;white-space:nowrap;">'+st[1]+'</span></div>';
  });
  h+='</div>';
  h+='</div>';

  // scrollable body
  h+='<div id="sey-crisis-body" class="scroll" style="flex:1;min-height:0;overflow-y:auto;-webkit-overflow-scrolling:touch;padding:16px 15px 22px;display:flex;flex-direction:column;gap:13px;">';

  // Raşit intro bubble
  h+='<div style="display:flex;align-items:flex-start;gap:10px;"><span style="width:36px;height:36px;border-radius:50%;flex-shrink:0;display:inline-flex;align-items:center;justify-content:center;color:#fff;background:linear-gradient(135deg,var(--room2),var(--room));box-shadow:0 5px 14px var(--room-glow);">'+icon('heart',17)+'</span><div class="glass" style="flex:1;min-width:0;border-radius:6px 18px 18px 18px;padding:12px 14px;border:1px solid color-mix(in srgb,'+A+' 24%, var(--card-bd));"><div style="font-size:10px;font-weight:800;letter-spacing:.8px;color:var(--room);margin-bottom:4px;">RAŞİT 🦩</div><div style="font-size:14px;line-height:1.5;color:var(--text2);">'+esc(C.hero)+'</div></div></div>';

  // science box
  h+='<div style="display:flex;gap:10px;align-items:flex-start;background:color-mix(in srgb,'+A+' 9%, var(--card));border:1px solid color-mix(in srgb,'+A+' 26%, var(--card-bd));border-radius:16px;padding:13px 14px;"><span style="flex-shrink:0;color:'+A+';display:inline-flex;margin-top:1px;">'+icon('brain',18)+'</span><div style="font-size:12.5px;line-height:1.6;color:var(--text2);"><b style="color:var(--text);">'+esc(C.sciTitle)+'</b><br>'+C.sci+'</div></div>';

  // coffee: saat-farkında uyku uyarısı
  if(kind==='coffee' && hr>=14){ h+='<div style="display:flex;gap:9px;align-items:flex-start;background:rgba(155,127,201,0.12);border:1px solid rgba(155,127,201,0.32);border-radius:14px;padding:11px 13px;"><span style="flex-shrink:0;color:#8A75C8;display:inline-flex;">'+icon('moon',16)+'</span><div style="font-size:12px;line-height:1.55;color:var(--text2);"><b>Saat '+pad(hr)+':00 civarı.</b> Kafein ~5-6 saat kalıcıdır; şimdi içersen gece uykun bölünebilir. Bugünlük kafeinsize ya da suya ne dersin?</div></div>'; }

  // timer block
  h+='<div style="background:linear-gradient(135deg,color-mix(in srgb,'+A+' 26%, transparent),color-mix(in srgb,'+A2+' 32%, transparent));border:1px solid color-mix(in srgb,'+A+' 26%, var(--card-bd));border-radius:20px;padding:18px;display:flex;flex-direction:column;align-items:center;gap:11px;">';
  h+='<div style="font-size:11px;font-weight:800;letter-spacing:.5px;color:var(--muted);">'+esc(C.clockLabel.toLocaleUpperCase('tr-TR'))+' '+tcap+'</div>';
  h+='<div id="crisis-clock" style="font-size:52px;font-weight:800;font-variant-numeric:tabular-nums;letter-spacing:1px;color:var(--text);line-height:1;">'+pad(Math.floor(ui.crisisLeft/60))+':'+pad(ui.crisisLeft%60)+'</div>';
  h+='<button onclick="App.startCrisisTimer()" style="border:none;cursor:pointer;padding:13px 24px;border-radius:16px;font-size:15px;font-weight:800;color:#fff;background:linear-gradient(135deg,'+A+','+A2+');box-shadow:0 8px 20px color-mix(in srgb,'+A+' 40%, transparent);display:flex;align-items:center;gap:7px;">'+(ui.crisisTiming?'Sayaç çalışıyor…':(esc(C.startLabel)+' '+icon('clock',15)))+'</button>';
  h+='</div>';

  // ── Şu an ne denedin? (premium expander) ──
  var triedN=ui.crisisOpts.length;
  var triedBody='';
  C.opts.forEach(function(o){
    var val=o.label, sel=ui.crisisOpts.indexOf(val)>=0;
    var stl=sel?('background:color-mix(in srgb,'+A+' 14%, var(--card));border:1px solid '+A+';box-shadow:0 6px 14px color-mix(in srgb,'+A+' 24%, transparent);'):'background:var(--card);border:1px solid var(--card-bd);';
    triedBody+='<button onclick="App.toggleCrisisOpt(\''+val.replace(/'/g,"\\'")+'\')" style="display:flex;align-items:center;gap:10px;width:100%;padding:13px 14px;border-radius:15px;cursor:pointer;transition:all .18s;color:var(--text);'+stl+'"><span style="display:inline-flex;color:'+A+';">'+icon(o.icon,16)+'</span><span style="flex:1;text-align:left;font-size:14.5px;font-weight:600;">'+esc(val)+'</span><span style="width:24px;height:24px;border-radius:50%;flex-shrink:0;display:flex;align-items:center;justify-content:center;color:#fff;background:'+(sel?'linear-gradient(135deg,'+A+','+A2+')':'transparent')+';border:'+(sel?'none':'2px solid var(--field-bd)')+';">'+(sel?icon('check',13):'')+'</span></button>';
  });
  h+=section('heart-handshake','Şu an ne denedin?',(triedN>0?triedN+' şey denedin — küçük ama değerli':'Denediğin bir şeyi işaretle'),triedN,triedBody);

  // ── Bu isteği ne tetikledi? (premium expander) ──
  var trigN=ui.crisisTriggers.length+((ui.crisisNote&&String(ui.crisisNote).trim())?1:0);
  var trigBody='';
  C.triggers.forEach(function(t){
    var sel=ui.crisisTriggers.indexOf(t.id)>=0;
    trigBody+='<button onclick="App.toggleCrisisTrigger(\''+t.id+'\')" style="display:flex;align-items:flex-start;gap:11px;width:100%;text-align:left;padding:12px 13px;border-radius:15px;cursor:pointer;transition:all .18s;'+(sel?('background:color-mix(in srgb,'+A+' 12%, var(--card));border:1px solid '+A+';box-shadow:0 6px 14px color-mix(in srgb,'+A+' 22%, transparent);'):'background:var(--card);border:1px solid var(--card-bd);')+'">';
    trigBody+='<span style="width:32px;height:32px;border-radius:10px;flex-shrink:0;display:inline-flex;align-items:center;justify-content:center;color:'+A+';background:color-mix(in srgb,'+A+' 12%, var(--icon));">'+icon(t.icon,16)+'</span>';
    trigBody+='<span style="flex:1;min-width:0;"><span style="font-size:14px;font-weight:700;color:var(--text);display:block;">'+esc(t.label)+'</span><span style="font-size:11.5px;color:var(--muted);line-height:1.45;display:block;margin-top:2px;">'+esc(t.sci)+'</span></span>';
    trigBody+='<span style="width:22px;height:22px;border-radius:50%;flex-shrink:0;margin-top:4px;display:flex;align-items:center;justify-content:center;color:#fff;background:'+(sel?'linear-gradient(135deg,'+A+','+A2+')':'transparent')+';border:'+(sel?'none':'2px solid var(--field-bd)')+';">'+(sel?icon('check',12):'')+'</span>';
    trigBody+='</button>';
  });
  trigBody+='<textarea oninput="App.onCrisisNote(this)" rows="2" placeholder="Başka bir şey mi tetikledi? örn. bir tartışma, yalnızlık, kendini ödüllendirme…" style="width:100%;box-sizing:border-box;border:1px solid var(--field-bd);background:var(--field);border-radius:14px;padding:12px;font-size:13.5px;outline:none;resize:none;line-height:1.5;color:var(--text);">'+esc(ui.crisisNote||'')+'</textarea>';
  trigBody+='<div style="font-size:11px;color:var(--faint);line-height:1.5;">Tetikleyiciyi işaretlersen Rapor’da örüntünü çıkarırım — neyin gerçek ihtiyaç, neyin duygusal/alışkanlık olduğunu birlikte görürüz.</div>';
  h+=section('zap','Bu isteği ne tetikledi?','Bilimsel tetikleyiciler · örüntünü çıkaralım',trigN,trigBody);

  // done: kutlama kartı (eylem düğmeleri sabit alt bar'a taşındı)
  if(ui.crisisDone){
    h+='<div style="background:linear-gradient(135deg,color-mix(in srgb,'+A+' 22%, transparent),color-mix(in srgb,'+A2+' 26%, transparent));border:1px solid color-mix(in srgb,'+A+' 30%, var(--card-bd));border-radius:20px;padding:20px;text-align:center;animation:seyPop .3s ease;"><div style="width:52px;height:52px;border-radius:50%;margin:0 auto 12px;display:flex;align-items:center;justify-content:center;color:#fff;background:linear-gradient(135deg,'+A+','+A2+');box-shadow:0 10px 24px color-mix(in srgb,'+A+' 40%, transparent);">'+icon('check',26)+'</div><div style="font-size:19px;font-weight:800;margin-bottom:6px;color:var(--text);">'+esc(C.winTitle)+'</div><p style="margin:0;font-size:14.5px;line-height:1.55;color:var(--text2);">'+esc(C.winText)+'</p>'+(C.habit?'<div style="margin-top:12px;font-size:12px;font-weight:800;color:#3F8A4F;display:inline-flex;align-items:center;gap:5px;background:rgba(143,191,138,0.18);border-radius:999px;padding:5px 12px;">'+icon('check',12)+' Bugünün tikine işlendi</div>':'')+'</div>';
  }

  h+='</div>'; // body

  // ── sabit alt bar (birincil eylem her zaman erişilebilir) ──
  h+='<div style="flex-shrink:0;position:relative;padding:12px 15px calc(14px + env(safe-area-inset-bottom));background:var(--modal);border-top:1px solid var(--card-bd);box-shadow:0 -10px 26px rgba(0,0,0,0.07);">';
  if(ui.crisisDone){
    h+='<div style="display:flex;gap:9px;"><button onclick="App.resetCrisis()" style="flex:1;border:1px solid var(--field-bd);background:var(--card);cursor:pointer;padding:14px;border-radius:16px;font-size:14.5px;font-weight:700;color:var(--muted);">Yeni kriz / sıfırla</button><button onclick="App.closeCrisis()" style="flex:1.3;border:none;cursor:pointer;padding:14px;border-radius:16px;font-size:15px;font-weight:800;color:#fff;background:linear-gradient(135deg,'+A+','+A2+');box-shadow:0 10px 24px color-mix(in srgb,'+A+' 38%, transparent);display:flex;align-items:center;justify-content:center;gap:6px;">Kapat '+icon('check',15)+'</button></div>';
  } else {
    var canComplete=ui.crisisTiming && ui.crisisLeft<=0;
    h+='<button onclick="App.completeCrisis()" '+(canComplete?'':'disabled')+' style="border:none;width:100%;padding:16px;border-radius:18px;font-size:16.5px;font-weight:800;color:#fff;background:linear-gradient(135deg,'+A+','+A2+');box-shadow:0 12px 26px color-mix(in srgb,'+A+' 42%, transparent);display:flex;align-items:center;justify-content:center;gap:7px;'+(canComplete?'cursor:pointer;opacity:1;':'cursor:not-allowed;opacity:.55;')+'">Krizi yönettim '+icon('check',16)+'</button>';
    h+='<div style="font-size:11px;color:var(--faint);text-align:center;line-height:1.5;margin-top:8px;">'+(canComplete?'Süre tamamlandı — “Krizi yönettim”e basabilirsin.':'Sayaç dolmadan “Krizi yönettim” aktif olmaz — önce durumu anla, sonra düzeltelim.')+' '+(C.habit?'Buton aktif olduğunda bugünün ilgili tiki kendiliğinden yeşillenir.':'Aktif olduğunda kaydın Rapor’a işlenir.')+'</div>';
  }
  h+='</div>'; // footer

  h+='</div></div>'; // card + back
  return h;
}

function haritaHTML(){
  var today=todayStr();
  if(!ui.calMonth) ui.calMonth=today.slice(0,7);
  var ym=ui.calMonth.split('-'); var Y=+ym[0], M=+ym[1];
  var firstDow=(new Date(Y,M-1,1).getDay()+6)%7; // Pzt=0
  var daysInMonth=new Date(Y,M,0).getDate();
  var monthNames=['Ocak','Şubat','Mart','Nisan','Mayıs','Haziran','Temmuz','Ağustos','Eylül','Ekim','Kasım','Aralık'];
  var h='<div style="animation:seyFade .3s ease;display:flex;flex-direction:column;gap:14px;">';
  h+=sciNote('Tutarlılık, mükemmellikten güçlüdür: aralıklı ama sürekli tekrar (spaced repetition), davranışı kalıcı kılan sinaptik pekişmeyi besler. Boş günler bir kusur değil, ritmin parçasıdır.');
  h+='<div class="glass" style="border-radius:22px;padding:14px;display:flex;flex-direction:column;gap:12px;">';
  h+='<div style="display:flex;align-items:center;justify-content:space-between;"><button onclick="App.calMove(-1)" style="border:none;cursor:pointer;width:36px;height:36px;border-radius:50%;background:var(--icon);color:var(--text);font-size:18px;">‹</button><div style="font-size:16px;font-weight:800;">'+monthNames[M-1]+' '+Y+'</div><button onclick="App.calMove(1)" style="border:none;cursor:pointer;width:36px;height:36px;border-radius:50%;background:var(--icon);color:var(--text);font-size:18px;">›</button></div>';
  h+='<div style="display:grid;grid-template-columns:repeat(7,1fr);gap:5px;">';
  ['Pt','Sa','Ça','Pe','Cu','Ct','Pz'].forEach(function(d){ h+='<div style="text-align:center;font-size:11px;font-weight:700;color:var(--faint);">'+d+'</div>'; });
  for(var b=0;b<firstDow;b++){ h+='<div></div>'; }
  for(var dnum=1;dnum<=daysInMonth;dnum++){
    var date=Y+'-'+pad(M)+'-'+pad(dnum);
    var rec=data.days[date]||null; var cnt=countRec(rec); var htc=habitCountOn(date); var strongC=Math.ceil(htc*0.66);
    var future=diffDays(today,date)>0; var before=diffDays(data.startDate,date)<0; var isToday=date===today;
    var moodE=(rec&&rec.mood)?moodEmoji(rec.mood,13):'';
    var tint='var(--card)';
    if(cnt>=htc) tint=dark?'linear-gradient(135deg,rgba(255,232,163,0.25),rgba(247,221,229,0.22))':'linear-gradient(135deg,#FFE8A3,#F7DDE5)';
    else if(cnt>=strongC) tint=dark?'rgba(233,137,159,0.2)':'rgba(247,221,229,0.7)';
    else if(cnt>0) tint=dark?'rgba(201,184,255,0.12)':'rgba(247,221,229,0.32)';
    var clickable=!future;
    h+='<button '+(clickable?'onclick="App.openDate(\''+date+'\')"':'')+' style="position:relative;aspect-ratio:1;border-radius:12px;border:1px solid var(--card-bd);background:'+tint+';color:var(--text);cursor:'+(clickable?'pointer':'default')+';opacity:'+((future||before)?'0.4':'1')+';display:flex;flex-direction:column;align-items:center;justify-content:center;gap:1px;'+(isToday?'box-shadow:0 0 0 2px #E9AFC1;':'')+'">';
    h+='<div style="font-size:12.5px;font-weight:700;line-height:1;">'+dnum+'</div>';
    h+='<div style="font-size:12px;height:14px;line-height:1;">'+(moodE||(cnt>0?'<span style="font-size:9.5px;color:var(--muted);font-weight:700;">'+cnt+'/'+htc+'</span>':''))+'</div>';
    h+='</button>';
  }
  h+='</div>';
  h+='<div style="display:flex;gap:13px;justify-content:center;font-size:11px;color:var(--faint);flex-wrap:wrap;padding-top:2px;"><span style="display:inline-flex;align-items:center;gap:4px;"><span style="width:10px;height:10px;border-radius:50%;background:linear-gradient(135deg,#FFE8A3,#F7DDE5);border:1px solid var(--card-bd);"></span> tam gün</span><span style="display:inline-flex;align-items:center;gap:4px;">'+icon('flower-2',12)+' güçlü</span><span style="display:inline-flex;align-items:center;gap:4px;"><span style="width:10px;height:10px;border-radius:50%;border:2px solid #E9AFC1;"></span> bugün çerçeveli</span></div>';
  h+='</div>';
  // ay özeti
  var isCurMonth=(ui.calMonth===today.slice(0,7));
  var mrecs=[]; for(var mi=1;mi<=daysInMonth;mi++){ var mds=Y+'-'+pad(M)+'-'+pad(mi); if(data.days[mds]) mrecs.push({date:mds,rec:data.days[mds]}); }
  var recCount=mrecs.length;
  var tickSum=0,tickMax=0; mrecs.forEach(function(o){ tickSum+=countRec(o.rec); tickMax+=habitCountOn(o.date); });
  var avgPct=tickMax?Math.round(tickSum/tickMax*100):0;
  var bStreak=bestStreak(mrecs.slice().sort(function(a,b){return a.date<b.date?-1:1;}));
  var md=moodDist(mrecs);
  h+='<div class="glass" style="border-radius:22px;padding:16px;display:flex;flex-direction:column;gap:12px;">';
  h+='<div style="display:flex;align-items:center;justify-content:space-between;gap:10px;"><div style="font-size:15.5px;font-weight:700;">'+monthNames[M-1]+' özeti</div>'+(isCurMonth?'':'<button onclick="App.calToday()" style="border:1px solid var(--field-bd);cursor:pointer;background:var(--card);color:var(--text2);font-weight:700;font-size:12px;padding:6px 12px;border-radius:999px;display:inline-flex;align-items:center;gap:4px;">Bugüne git '+icon('sun',13)+'</button>')+'</div>';
  if(recCount===0){ h+='<div style="font-size:13px;color:var(--faint);line-height:1.5;">Bu ayda henüz kayıt yok. Bir güne dokunup “Bu günü düzenle” ile geçmişe de ekleyebilirsin.</div>'; }
  else {
    h+='<div style="display:grid;grid-template-columns:repeat(3,1fr);gap:9px;">';
    var cells=[['Kayıtlı gün',recCount+' / '+daysInMonth],['Ortalama tik',avgPct+'%'],['En iyi seri',bStreak+' gün']];
    cells.forEach(function(c){ h+='<div style="background:var(--icon);border:1px solid var(--card-bd);border-radius:14px;padding:11px 10px;text-align:center;"><div style="font-size:11px;color:var(--faint);line-height:1.3;">'+c[0]+'</div><div style="font-size:17px;font-weight:800;margin-top:3px;">'+c[1]+'</div></div>'; });
    h+='</div>';
    var moodKeys=Object.keys(md); if(moodKeys.length){ h+='<div style="display:flex;flex-wrap:wrap;gap:7px;align-items:center;"><span style="font-size:11.5px;color:var(--faint);">Mod dağılımı:</span>'; MOODS.forEach(function(m){ if(md[m.id]) h+='<span style="font-size:12.5px;background:var(--card);border:1px solid var(--card-bd);border-radius:999px;padding:4px 10px;display:inline-flex;align-items:center;gap:4px;">'+icon(m.icon,13)+' '+md[m.id]+'</span>'; }); h+='</div>'; }
    // ── Teknik detay: haftanın en tutarlı günü · geçen aya göre · faz ilerlemesi ──
    var wdSum=[0,0,0,0,0,0,0], wdMax=[0,0,0,0,0,0,0];
    mrecs.forEach(function(o){ var p=o.date.split('-').map(Number); var wd=(new Date(p[0],p[1]-1,p[2]).getDay()+6)%7; wdSum[wd]+=countRec(o.rec); wdMax[wd]+=habitCountOn(o.date); });
    var wdNames=['Pazartesi','Salı','Çarşamba','Perşembe','Cuma','Cumartesi','Pazar'];
    var bestWd=-1,bestWdPct=-1; for(var wi=0;wi<7;wi++){ if(wdMax[wi]>0){ var wp=Math.round(wdSum[wi]/wdMax[wi]*100); if(wp>bestWdPct){bestWdPct=wp;bestWd=wi;} } }
    var pmY=(M===1)?Y-1:Y, pmM=(M===1)?12:M-1, pmKey=pmY+'-'+pad(pmM), pmSum=0,pmMax=0;
    for(var pk in data.days){ if(pk.slice(0,7)===pmKey){ pmSum+=countRec(data.days[pk]); pmMax+=habitCountOn(pk); } }
    var pmPct=pmMax?Math.round(pmSum/pmMax*100):null, delta=(pmPct!=null)?(avgPct-pmPct):null;
    var detail=[];
    if(bestWd>=0) detail.push([icon('calendar',15),'En tutarlı günün','<b>'+wdNames[bestWd]+'</b> · %'+bestWdPct,'var(--accent)']);
    if(delta!=null){ var dcol=delta>0?'#3F8A4F':(delta<0?'#E9899F':'var(--muted)'); var dtxt=(delta>0?'+':'')+delta+' puan'; detail.push([icon(delta>=0?'trending-up':'chart-column',15),'Geçen aya göre','<b style="color:'+dcol+';">'+dtxt+'</b>','var(--muted)']); }
    if(window.MotivationProgramV2 && featuresLive()){ var _ms=window.MotivationProgramV2.progressSummary(data); detail.push([icon('compass',15),'İçsel Pusula','Gün '+_ms.currentProgramDay+'/'+_ms.totalDays+' · %'+_ms.percent,'#6E5FCB']); }
    if(detail.length){
      h+='<div style="display:flex;flex-direction:column;gap:8px;border-top:1px solid var(--card-bd);padding-top:11px;">';
      detail.forEach(function(r){ h+='<div style="display:flex;align-items:center;gap:10px;"><span style="width:24px;display:flex;justify-content:center;color:'+r[3]+';">'+r[0]+'</span><span style="flex:1;font-size:13px;color:var(--text2);">'+r[1]+'</span><span style="font-size:13.5px;color:var(--text);text-align:right;">'+r[2]+'</span></div>'; });
      h+='</div>';
    }
  }
  h+='<div style="font-size:11.5px;color:var(--faint);line-height:1.45;border-top:1px solid var(--card-bd);padding-top:10px;display:flex;gap:5px;">'+icon('lightbulb',13)+' Geçmiş bir güne dokun → “Bu günü düzenle” ile o günün verilerini düzeltebilirsin. Konum, oturum ve canlı ölçümler her zaman bugüne yazılır.</div>';
  h+='</div>';
  h+='</div>';
  return h;
}

function lastNDays(n){ var out=[],t=todayStr(); for(var i=n-1;i>=0;i--){ var d=addDays(t,-i); out.push({date:d,rec:data.days[d]||null}); } return out; }
function habitRate(days,key){ var done=0; days.forEach(function(o){ if(o.rec&&o.rec.habits&&o.rec.habits[key]) done++; }); return days.length?Math.round(done/days.length*100):0; }
function moodDist(days){ var m={}; days.forEach(function(o){ if(o.rec&&o.rec.mood) m[o.rec.mood]=(m[o.rec.mood]||0)+1; }); return m; }
function monthlySummary(){ var map={}; for(var d in data.days){ var mo=d.slice(0,7); if(!map[mo]) map[mo]={ticks:0,days:0,list:[]}; map[mo].ticks+=countRec(data.days[d]); map[mo].days++; map[mo].list.push({date:d,rec:data.days[d]}); }
  return Object.keys(map).sort().reverse().map(function(k){ var m=map[k]; m.list.sort(function(a,b){return a.date<b.date?-1:1;}); return {month:k,avg:m.ticks/m.days,days:m.days,best:bestStreak(m.list)}; }); }
function trendBars(days,valFn,grad){ var max=1; days.forEach(function(o){ max=Math.max(max,valFn(o)); }); var h='<div style="display:flex;align-items:flex-end;gap:2px;height:52px;">'; days.forEach(function(o){ var v=valFn(o); var hh=v?Math.max(4,Math.round(v/max*52)):2; h+='<div style="flex:1;height:'+hh+'px;border-radius:3px;background:'+grad+';opacity:'+(v?1:0.22)+';"></div>'; }); h+='</div>'; return h; }
function nextMilestone(streak){ var ms=[7,21,30,50,100,200,365,500,1000]; for(var i=0;i<ms.length;i++){ if(streak<ms[i]) return {target:ms[i],pct:Math.round(streak/ms[i]*100)}; } return null; }

function moodScoreOf(rec){ var m={'cok-iyi':5,'iyi':4,'normal':3,'zorlandim':2,'cok-zorlandim':1}; return rec&&rec.mood&&m[rec.mood]?m[rec.mood]:null; }
function avgOf(a){ return a.length?a.reduce(function(x,y){return x+y;},0)/a.length:null; }
function weekSelfCard(){
  var days=lastNDays(7); var recorded=days.filter(function(o){return o.rec;});
  if(recorded.length<2) return '';
  var best=null; days.forEach(function(o){ if(o.rec){ var c=countRec(o.rec); if(!best||c>best.c) best={date:o.date,c:c,rec:o.rec}; } });
  var bestHabit=null,bestPct=-1; HABITS.forEach(function(hb){ var p=habitRate(days,hb.key); if(p>bestPct){bestPct=p;bestHabit=hb;} });
  var sleeps=[],waters=[],prots=[],medFree=0;
  recorded.forEach(function(o){ var r=o.rec; if(r.sleep&&r.sleep.hours!=null) sleeps.push(Number(r.sleep.hours)); if(typeof r.water==='number'&&r.water>0) waters.push(r.water); var pr=dayNutrition(r).protein; if(pr>0) prots.push(pr); if(r.sleep&&r.sleep.med&&r.sleep.med.type==='none') medFree++; });
  var sa=avgOf(sleeps),wa=avgOf(waters),pa=avgOf(prots);
  var moodLink=''; var gm=[],bm=[]; recorded.forEach(function(o){ var ms=moodScoreOf(o.rec),sh=(o.rec.sleep&&o.rec.sleep.hours!=null)?Number(o.rec.sleep.hours):null; if(ms==null||sh==null) return; (sh>=7?gm:bm).push(ms); });
  if(gm.length&&bm.length&&avgOf(gm)-avgOf(bm)>=0.4) moodLink='İyi uyuduğun günler modunu da yukarı çekmiş.';
  var rows=[];
  if(best) rows.push([icon('star',16),'En parlak günün', shortDate(best.date)+' · '+best.c+'/'+habitCountOn(best.date)+' tik']);
  if(bestHabit&&bestPct>0) rows.push([bestHabit.icon,'En güçlü alışkanlığın', esc(bestHabit.title)+' · %'+bestPct]);
  if(sa!=null) rows.push([icon('moon',16),'Ortalama uyku', sa.toFixed(1)+' saat']);
  if(wa!=null) rows.push([icon('droplet',16),'Ortalama su', wa.toFixed(1)+' bardak']);
  if(pa!=null) rows.push([icon('egg',16),'Ortalama protein', Math.round(pa)+' g']);
  if(medFree>0) rows.push([icon('moon',16),'İlaçsız gece', medFree+' gece']);
  var h='<div style="background:linear-gradient(135deg,rgba(255,225,154,0.4),rgba(247,221,229,0.55));border:1px solid var(--card-bd);border-radius:22px;padding:18px;display:flex;flex-direction:column;gap:12px;">';
  h+='<div style="font-size:17px;font-weight:800;color:var(--text);display:flex;align-items:center;gap:7px;">Bu hafta sen '+icon('sparkles',16)+'</div>';
  h+='<div style="display:flex;flex-direction:column;gap:9px;">';
  rows.forEach(function(r){ h+='<div style="display:flex;align-items:center;gap:11px;"><span style="width:24px;display:flex;justify-content:center;">'+r[0]+'</span><span style="flex:1;font-size:13.5px;color:var(--text2);">'+r[1]+'</span><span style="font-size:14px;font-weight:800;color:var(--text);text-align:right;">'+r[2]+'</span></div>'; });
  h+='</div>';
  if(moodLink) h+='<div style="font-size:13px;font-weight:600;color:var(--accent);background:var(--card);border-radius:14px;padding:11px 13px;">'+moodLink+'</div>';
  h+='</div>';
  return h;
}
function corrInsights(){
  var days=lastNDays(30).filter(function(o){return o.rec;});
  if(days.length<6) return [];
  var out=[];
  function gavg(a){return a.length?a.reduce(function(x,y){return x+y;},0)/a.length:null;}
  var gm=[],bm=[]; days.forEach(function(o){ var ms=moodScoreOf(o.rec),sh=(o.rec.sleep&&o.rec.sleep.hours!=null)?Number(o.rec.sleep.hours):null; if(ms==null||sh==null) return; if(sh>=7) gm.push(ms); else if(sh<6) bm.push(ms); });
  if(gm.length>=3&&bm.length>=3&&gavg(gm)-gavg(bm)>=0.4) out.push([icon('moon',18),'7+ saat uyuduğun günlerde modun belirgin daha iyi. Uyku senin gizli süper gücün.']);
  var ws=[],ns=[]; days.forEach(function(o){ var sos=Number(o.rec.cravingSOSCount||0); ((o.rec.habits&&o.rec.habits.walked20)?ws:ns).push(sos); });
  if(ws.length>=3&&ns.length>=3&&gavg(ns)-gavg(ws)>=0.3) out.push([icon('footprints',18),'Yürüdüğün günlerde tatlı krizi sayın daha düşük. Ayaklar çalışınca tatlı lobisi sus pus.']);
  var hp=[],lp=[]; days.forEach(function(o){ var pr=dayNutrition(o.rec).protein,sos=Number(o.rec.cravingSOSCount||0); if(pr>=PROTEIN_GOAL*0.8) hp.push(sos); else if(pr>0) lp.push(sos); });
  if(hp.length>=3&&lp.length>=3&&gavg(lp)-gavg(hp)>=0.3) out.push([icon('egg',18),'Proteini tutturduğun günlerde kriz daha az. Tokluk ekibi sahada.']);
  var he=[],le=[]; days.forEach(function(o){ var w=(typeof o.rec.water==='number')?o.rec.water:null,e=o.rec.energy; if(w==null||e==null) return; (w>=WATER_GOAL?he:le).push(Number(e)); });
  if(he.length>=3&&le.length>=3&&gavg(he)-gavg(le)>=0.3) out.push([icon('droplet',18),'Su hedefini tutturduğun günlerde enerjin daha yüksek. Beden susuz çalışmıyor.']);
  return out;
}
// ── Rapor teknik detay: tutarlılık, momentum ve haftanın günleri örüntüsü ──
function consistencyMomentumCard(){
  var t=todayStr();
  var d30=lastNDays(30);
  var active30=d30.filter(function(o){return o.rec&&countRec(o.rec)>0;}).length;
  var consist=Math.round(active30/30*100);
  var cur7=[],prev7=[];
  for(var i=0;i<7;i++){ var dk=addDays(t,-i); cur7.push(data.days[dk]?countRec(data.days[dk]):0); }
  for(var j=7;j<14;j++){ var dk2=addDays(t,-j); prev7.push(data.days[dk2]?countRec(data.days[dk2]):0); }
  var a7=avgOf(cur7), ap7=avgOf(prev7), momentum=(a7!=null&&ap7!=null)?(Math.round((a7-ap7)*10)/10):null;
  // haftanın günleri (son 56 gün)
  var wdSum=[0,0,0,0,0,0,0], wdMax=[0,0,0,0,0,0,0];
  for(var k=0;k<56;k++){ var dk3=addDays(t,-k); var r=data.days[dk3]; if(!r) continue; var p=dk3.split('-').map(Number); var wd=(new Date(p[0],p[1]-1,p[2]).getDay()+6)%7; wdSum[wd]+=countRec(r); wdMax[wd]+=habitCountOn(dk3); }
  var wdPct=[]; for(var w=0;w<7;w++){ wdPct.push(wdMax[w]>0?Math.round(wdSum[w]/wdMax[w]*100):null); }
  var hasWd=wdPct.some(function(x){return x!=null;});
  var wdLabels=['Pt','Sa','Ça','Pe','Cu','Ct','Pz'];
  var momIcon=momentum==null?'minus':(momentum>0?'trending-up':(momentum<0?'chart-column':'minus'));
  var momCol=momentum==null?'var(--muted)':(momentum>0?'#3F8A4F':(momentum<0?'#E9899F':'var(--muted)'));
  var momTxt=momentum==null?'—':((momentum>0?'+':'')+String(momentum).replace('.',','));
  var tile=function(val,label,col){ return '<div style="flex:1;min-width:0;background:var(--icon);border-radius:14px;padding:12px 8px;text-align:center;"><div style="font-size:20px;font-weight:800;color:'+col+';line-height:1;font-variant-numeric:tabular-nums;">'+val+'</div><div style="font-size:10px;color:var(--faint);margin-top:4px;font-weight:700;letter-spacing:.2px;">'+label+'</div></div>'; };
  var h='<div class="glass" style="border-radius:22px;padding:16px;display:flex;flex-direction:column;gap:12px;">';
  h+='<div style="font-size:15.5px;font-weight:700;display:flex;align-items:center;gap:6px;"><span style="display:inline-flex;color:var(--accent);">'+icon('microscope',16)+'</span>Tutarlılık & Momentum</div>';
  h+='<div style="display:flex;gap:8px;">'+tile('%'+consist,'Tutarlılık (30g)','var(--accent)')+tile(active30+'/30','Aktif gün','#5BA85B')+tile(momTxt,'Momentum (7g)',momCol)+'</div>';
  if(hasWd){
    h+='<div style="display:flex;flex-direction:column;gap:6px;"><div style="font-size:11.5px;font-weight:700;color:var(--muted);">Haftanın günleri (son 8 hafta)</div>';
    h+='<div style="display:flex;align-items:flex-end;gap:5px;height:46px;">';
    wdPct.forEach(function(pc){ var hh=pc!=null?Math.max(6,Math.round(pc/100*40)):4; var col=pc==null?'rgba(150,110,120,0.18)':(pc>=66?'#8FBF8A':(pc>=33?'#E9AFC1':'#C9B8FF')); h+='<div style="flex:1;display:flex;flex-direction:column;align-items:center;gap:3px;"><div style="width:100%;max-width:20px;height:'+hh+'px;border-radius:5px;background:'+col+';"></div></div>'; });
    h+='</div>';
    h+='<div style="display:flex;gap:5px;">'; wdLabels.forEach(function(l){ h+='<div style="flex:1;text-align:center;font-size:9.5px;color:var(--faint);font-weight:700;">'+l+'</div>'; }); h+='</div>';
    h+='</div>';
  }
  h+=sciNote('Tutarlılık, tekil zirvelerden değerlidir: davranışın otomatikleşmesi (habit formation) tekrar sıklığına bağlıdır. Momentum, son 7 günün önceki 7 güne göre yönü — küçük pozitif ivme bile bileşik olarak birikir.');
  h+='</div>';
  return h;
}
function badgesGrid(){
  var all=allDays(); var best=bestStreak(all); var medStreak=medFreeStreak();
  var waterGoal=0,proteinGoal=0,perfect=0,readingDays=0;
  all.forEach(function(o){ var r=o.rec; if(!r) return; if((r.water||0)>=WATER_GOAL) waterGoal++; if(dayNutrition(r).protein>=PROTEIN_GOAL) proteinGoal++; if(countRec(r)>=habitCountOn(o.date)) perfect++; if(r.reading&&Array.isArray(r.reading.entries)&&r.reading.entries.length>0) readingDays++; });
  var badges=[
    {e:icon('flame',20),l:'7 gün seri',done:best>=7,sub:best>=7?'tamam':best+'/7'},
    {e:icon('trophy',20),l:'30 gün seri',done:best>=30,sub:best>=30?'tamam':best+'/30'},
    {e:icon('crown',20),l:'100 gün seri',done:best>=100,sub:best>=100?'tamam':best+'/100'},
    {e:icon('moon',20),l:'7 gece ilaçsız',done:medStreak>=7,sub:medStreak>=7?'tamam':medStreak+'/7'},
    {e:icon('droplet',20),l:'Su hedefi',done:waterGoal>=1,sub:waterGoal>0?waterGoal+' gün':'henüz yok'},
    {e:icon('egg',20),l:'Protein hedefi',done:proteinGoal>=1,sub:proteinGoal>0?proteinGoal+' gün':'henüz yok'},
    {e:icon('book-open',20),l:'Okuma tutkunu',done:readingDays>=7,sub:readingDays>=7?'tamam':readingDays+'/7'},
    {e:icon('sparkles',20),l:'7/7 mükemmel',done:perfect>=1,sub:perfect>0?perfect+' gün':'henüz yok'}
  ];
  var h='<div class="glass" style="border-radius:22px;padding:16px;display:flex;flex-direction:column;gap:12px;"><div style="font-size:15.5px;font-weight:700;display:flex;align-items:center;gap:7px;">Rozetler '+icon('trophy',17)+'</div>';
  h+='<div style="display:grid;grid-template-columns:1fr 1fr;gap:9px;">';
  badges.forEach(function(b){ var on=b.done; h+='<div style="display:flex;align-items:center;gap:10px;border-radius:14px;padding:11px 12px;'+(on?'background:linear-gradient(135deg,rgba(255,232,163,0.55),rgba(247,221,229,0.6));border:1px solid #E9AFC1;':'background:var(--card);border:1px solid var(--card-bd);opacity:0.62;')+'"><span style="display:inline-flex;'+(on?'':'filter:grayscale(1);')+'">'+b.e+'</span><div style="min-width:0;"><div style="font-size:12.5px;font-weight:700;color:var(--text);">'+esc(b.l)+'</div><div style="font-size:10.5px;color:var(--faint);">'+esc(b.sub)+'</div></div></div>'; });
  h+='</div></div>';
  return h;
}

function weeklyStepRecap(){
  var stepOf=function(o){ return effSteps(o&&o.rec).steps||0; };
  var t=todayStr();
  var last7=lastNDays(7);
  var prev7=[]; for(var i=13;i>=7;i--){ var d=addDays(t,-i); prev7.push({date:d,rec:data.days[d]||null}); }
  var cov=last7.filter(function(o){return stepOf(o)>0;});
  var head='<div style="display:flex;align-items:center;gap:8px;"><span style="display:inline-flex;align-items:center;gap:4px;font-size:12px;font-weight:800;letter-spacing:.8px;color:#1a1404;background:linear-gradient(135deg,#E6C15A,#C99A3A);border-radius:999px;padding:3px 10px;">'+icon('hexagon',12)+' ÆON</span><span style="font-size:14.5px;font-weight:700;color:var(--text);">Haftalık adım özeti</span>';
  if(!cov.length){
    return '<div class="glass" style="border-radius:22px;padding:16px;display:flex;flex-direction:column;gap:10px;border:1px solid rgba(201,160,60,0.30);background:linear-gradient(135deg,rgba(230,193,90,0.10),rgba(155,127,201,0.07));">'
      +head+'</div>'
      +'<div style="font-size:13px;color:var(--text2);line-height:1.5;">Bu hafta henüz adım kaydın yok. Eklemen 5 saniye — ya da <b style="display:inline-flex;align-items:center;gap:4px;">'+icon('apple',13)+' Sağlık’tan çek</b> ile otomatik gelsin. Küçük bir veri, büyük resmi netleştirir.</div></div>';
  }
  var avg=Math.round(cov.reduce(function(a,o){return a+stepOf(o);},0)/cov.length);
  var peak=last7.reduce(function(m,o){return Math.max(m,stepOf(o));},0);
  var prevCov=prev7.filter(function(o){return stepOf(o)>0;});
  var prevAvg=prevCov.length?Math.round(prevCov.reduce(function(a,o){return a+stepOf(o);},0)/prevCov.length):null;
  var msg;
  if(avg>=7000) msg='Harika tempo — sağlık kazancının kanıtla en güçlü olduğu aralıktasın. Böyle sürdür.';
  else if(avg>=4000) msg='Güzel gidiyor; bu aralıkta bile kazanç net. Küçük artışlar büyük fark yapar.';
  else msg='Başlangıç senin hızında — yarın 500 adım fazlası bile ilerlemedir. Kendine yüklenme.';
  var h='<div class="glass" style="border-radius:22px;padding:16px;display:flex;flex-direction:column;gap:11px;border:1px solid rgba(201,160,60,0.30);background:linear-gradient(135deg,rgba(230,193,90,0.08),rgba(155,127,201,0.06));">';
  h+=head+'<span style="margin-left:auto;font-size:12px;color:var(--faint);font-weight:700;">'+cov.length+'/7 gün</span></div>';
  h+='<div style="display:flex;gap:14px;align-items:baseline;flex-wrap:wrap;"><div><span style="font-size:24px;font-weight:800;color:var(--text);font-variant-numeric:tabular-nums;">'+avg.toLocaleString('tr-TR')+'</span><span style="font-size:12px;color:var(--faint);"> ort. adım/gün</span></div>';
  if(peak>0) h+='<div style="font-size:12.5px;color:var(--muted);">Tepe <b style="color:var(--text2);">'+peak.toLocaleString('tr-TR')+'</b></div>';
  if(prevAvg!=null){ var d2=avg-prevAvg, pct=prevAvg?Math.round(d2/prevAvg*100):0; h+='<div style="font-size:12.5px;font-weight:700;margin-left:auto;color:'+(d2>=0?'#3F8A4F':'#B0764F')+';">'+(d2>=0?'▲ +':'▼ ')+Math.abs(pct)+'% <span style="color:var(--faint);font-weight:600;">geçen haftaya göre</span></div>'; }
  h+='</div>';
  h+=trendBars(last7,function(o){return stepOf(o);},'linear-gradient(180deg,#E6C15A,#E9899F)');
  h+='<div style="font-size:12.5px;color:var(--text2);line-height:1.5;">'+msg+'</div>';
  h+='</div>';
  return h;
}
function distanceRecapCard(){
  var t=todayStr();
  var last7=lastNDays(7);
  var prev7=[]; for(var i=13;i>=7;i--){ var d=addDays(t,-i); prev7.push({date:d,rec:data.days[d]||null}); }
  var sum=function(list,key){ return list.reduce(function(a,o){ return a+dayMovement(o.rec)[key]; },0); };
  var wTot=sum(last7,'total'), wWalk=sum(last7,'walk'), wVeh=sum(last7,'veh');
  var pTot=sum(prev7,'total');
  var todayM=dayMovement(data.days[t]||null);
  var last30=lastNDays(30); var mTot=sum(last30,'total');
  var any=mTot>0||wTot>0||todayM.total>0;
  var head='<div style="display:flex;align-items:center;gap:8px;"><span style="font-size:15.5px;font-weight:700;color:var(--text);display:flex;align-items:center;gap:6px;">Mesafe & Hareket '+icon('map-pin',16)+'</span></div>';
  if(!any){
    return '<div class="glass" style="border-radius:22px;padding:16px;display:flex;flex-direction:column;gap:10px;">'+head
      +'<div style="font-size:13px;color:var(--text2);line-height:1.5;">Henüz kayıtlı hareket yok. Bugün ekranındaki <b>Konum & Hareket</b> kartından takibi açarsan, kat ettiğin mesafe burada günlük, haftalık ve zaman içinde birikir.</div></div>';
  }
  var h='<div class="glass" style="border-radius:22px;padding:16px;display:flex;flex-direction:column;gap:12px;">'+head;
  h+='<div style="display:flex;gap:10px;">';
  h+='<div style="flex:1;background:var(--icon);border-radius:14px;padding:11px;text-align:center;"><div style="font-size:11px;color:var(--muted);font-weight:700;">Bugün</div><div style="font-size:18px;font-weight:800;font-variant-numeric:tabular-nums;">'+fmtDist(todayM.total)+'</div></div>';
  h+='<div style="flex:1;background:var(--icon);border-radius:14px;padding:11px;text-align:center;"><div style="font-size:11px;color:var(--muted);font-weight:700;">Bu hafta</div><div style="font-size:18px;font-weight:800;font-variant-numeric:tabular-nums;">'+fmtDist(wTot)+'</div></div>';
  h+='<div style="flex:1;background:var(--icon);border-radius:14px;padding:11px;text-align:center;"><div style="font-size:11px;color:var(--muted);font-weight:700;">30 gün</div><div style="font-size:18px;font-weight:800;font-variant-numeric:tabular-nums;">'+fmtDist(mTot)+'</div></div>';
  h+='</div>';
  if(pTot>0){ var d2=wTot-pTot, pct=Math.round(d2/pTot*100); h+='<div style="font-size:12.5px;font-weight:700;color:'+(d2>=0?'#3F8A4F':'#B0764F')+';">'+(d2>=0?'▲ +':'▼ ')+Math.abs(pct)+'% <span style="color:var(--faint);font-weight:600;">geçen haftaya göre</span></div>'; }
  h+='<div style="font-size:12px;color:var(--muted);">Günlük mesafe (son 7 gün)</div>';
  h+=trendBars(last7,function(o){return dayMovement(o.rec).total;},'linear-gradient(180deg,#7DBE77,#9B7FC9)');
  h+='<div style="display:flex;gap:5px;">'; last7.forEach(function(o){ h+='<div style="flex:1;text-align:center;font-size:10px;color:var(--faint);">'+o.date.slice(8)+'</div>'; }); h+='</div>';
  h+='<div style="display:flex;gap:8px;font-size:12.5px;">';
  h+='<span style="flex:1;background:rgba(143,191,138,0.14);border-radius:10px;padding:8px 10px;color:var(--text2);display:flex;align-items:center;gap:5px;">'+icon('footprints',14)+' Yürüyüş <b style="margin-left:auto;">'+fmtDist(wWalk)+'</b></span>';
  h+='<span style="flex:1;background:rgba(201,184,255,0.16);border-radius:10px;padding:8px 10px;color:var(--text2);display:flex;align-items:center;gap:5px;">'+icon('car',14)+' Araç <b style="margin-left:auto;">'+fmtDist(wVeh)+'</b></span>';
  h+='</div>';
  h+='<div style="font-size:11px;color:var(--faint);line-height:1.4;">Ölçüm yalnızca uygulama açıkken birikir. Hareketler korunur, silinmez.</div>';
  h+='</div>';
  return h;
}
function moodHeatmapCard(){
  var mcol={'cok-iyi':'#FFD37A','iyi':'#F2B65A','normal':'#8FBF8A','zorlandim':'#9BB0D9','cok-zorlandim':'#B89BD9'};
  var today=todayStr();
  var startY=+String(data.startDate||today).slice(0,4);
  var nowY=new Date().getFullYear();
  var curY=+(ui.heatYear||nowY); if(curY<startY)curY=startY; if(curY>nowY)curY=nowY;
  var jan1=new Date(curY,0,1), dec31=new Date(curY,11,31);
  var startDow=(jan1.getDay()+6)%7; var start=new Date(jan1); start.setDate(start.getDate()-startDow);
  var CELL=13, GAP=3, STEP=CELL+GAP, DAYLABW=24;
  var monN=['Oca','Şub','Mar','Nis','May','Haz','Tem','Ağu','Eyl','Eki','Kas','Ara'];
  var dayLab=['Pzt','','Çar','','Cum','',''];
  var weeks=[], cur=new Date(start);
  while(cur<=dec31){ var col=[]; for(var d=0; d<7; d++){ col.push(new Date(cur)); cur.setDate(cur.getDate()+1); } weeks.push(col); }
  var nW=weeks.length;
  var h='<div class="glass" style="border-radius:22px;padding:16px;display:flex;flex-direction:column;gap:12px;">';
  h+='<div style="display:flex;align-items:center;justify-content:space-between;gap:8px;">';
  h+='<div style="font-size:15.5px;font-weight:700;display:flex;align-items:center;gap:6px;">Mod ısı haritası '+icon('calendar',16)+'</div>';
  var prevOk=curY>startY, nextOk=curY<nowY;
  h+='<div style="display:flex;align-items:center;gap:6px;">';
  h+='<button '+(prevOk?'onclick="App.heatYear(-1)"':'disabled')+' style="border:none;cursor:'+(prevOk?'pointer':'default')+';width:28px;height:28px;border-radius:50%;background:var(--card);color:var(--text);font-size:16px;opacity:'+(prevOk?'1':'0.3')+';">‹</button>';
  h+='<div style="font-size:14px;font-weight:800;min-width:46px;text-align:center;">'+curY+'</div>';
  h+='<button '+(nextOk?'onclick="App.heatYear(1)"':'disabled')+' style="border:none;cursor:'+(nextOk?'pointer':'default')+';width:28px;height:28px;border-radius:50%;background:var(--card);color:var(--text);font-size:16px;opacity:'+(nextOk?'1':'0.3')+';">›</button>';
  h+='</div></div>';
  h+='<div style="overflow-x:auto;-webkit-overflow-scrolling:touch;padding-bottom:4px;">';
  h+='<div style="display:inline-flex;flex-direction:column;gap:4px;">';
  h+='<div style="position:relative;height:12px;margin-left:'+(DAYLABW+GAP)+'px;width:'+(nW*STEP)+'px;">';
  for(var w=0; w<nW; w++){ for(var di=0; di<7; di++){ var dd=weeks[w][di]; if(dd.getFullYear()===curY && dd.getDate()===1){ h+='<span style="position:absolute;left:'+(w*STEP)+'px;top:0;font-size:9px;font-weight:700;color:var(--faint);white-space:nowrap;">'+monN[dd.getMonth()]+'</span>'; } } }
  h+='</div>';
  h+='<div style="display:flex;gap:'+GAP+'px;">';
  h+='<div style="display:flex;flex-direction:column;gap:'+GAP+'px;width:'+DAYLABW+'px;">';
  for(var r=0; r<7; r++){ h+='<div style="height:'+CELL+'px;line-height:'+CELL+'px;font-size:8.5px;color:var(--faint);text-align:right;">'+dayLab[r]+'</div>'; }
  h+='</div>';
  var recDays=0;
  for(var w2=0; w2<nW; w2++){
    h+='<div style="display:flex;flex-direction:column;gap:'+GAP+'px;">';
    for(var r2=0; r2<7; r2++){
      var dt=weeks[w2][r2]; var ds=dt.getFullYear()+'-'+pad(dt.getMonth()+1)+'-'+pad(dt.getDate());
      if(dt.getFullYear()!==curY){ h+='<div style="width:'+CELL+'px;height:'+CELL+'px;"></div>'; continue; }
      var future=diffDays(today,ds)>0; var rec=data.days[ds]||null; var bg, clk=false, tip=shortDate(ds)+'.'+curY;
      if(future){ bg='rgba(150,110,120,0.06)'; }
      else if(rec && rec.mood){ bg=mcol[rec.mood]||'#C9B8FF'; clk=true; recDays++; var mo=find(MOODS,'id',rec.mood); tip+=(mo?' · '+mo.short:''); }
      else if(rec){ bg=dark?'rgba(233,175,193,0.30)':'rgba(150,110,120,0.24)'; clk=true; recDays++; tip+=' · kayıt var'; }
      else { bg=dark?'rgba(255,255,255,0.05)':'rgba(150,110,120,0.10)'; clk=true; tip+=' · kayıt yok'; }
      var isT=ds===today;
      h+='<div '+(clk?'onclick="App.heatOpen(\''+ds+'\')" ':'')+'title="'+tip+'" style="width:'+CELL+'px;height:'+CELL+'px;border-radius:3px;background:'+bg+';cursor:'+(clk?'pointer':'default')+';'+(isT?'box-shadow:0 0 0 1.5px var(--accent);':'')+'"></div>';
    }
    h+='</div>';
  }
  h+='</div></div></div>';
  h+='<div style="display:flex;align-items:center;justify-content:space-between;gap:8px;flex-wrap:wrap;">';
  h+='<div style="display:flex;align-items:center;gap:5px;font-size:10.5px;color:var(--faint);">zor';
  ['cok-zorlandim','zorlandim','normal','iyi','cok-iyi'].forEach(function(mid){ h+='<span style="width:11px;height:11px;border-radius:3px;background:'+mcol[mid]+';display:inline-block;"></span>'; });
  h+='iyi</div>';
  h+='<div style="font-size:11px;color:var(--faint);">'+recDays+' gün kayıtlı · dokun → düzenle</div>';
  h+='</div>';
  if(recDays===0) h+='<div style="font-size:12px;color:var(--faint);line-height:1.5;">'+curY+' için henüz mod kaydı yok. Bir kareye dokunup o günü açabilirsin.</div>';
  h+='</div>';
  return h;
}

function magnesiumFeedbackHTML(date){
  var s=data.settings.magnesium||{};
  if(!s.enabled || s.mode==='off') return '';
  var yest=addDays(date,-1);
  var yRec=data.days[yest];
  if(!yRec || !yRec.magnesium || !yRec.magnesium.taken) return '';
  if(yRec.magnesium.feedback===true || yRec.magnesium.feedback===false) return '';
  var form=find(MG_FORMS,'id',yRec.magnesium.form)||MG_FORMS[0];
  var h='';
  h+='<div class="glass" style="border-radius:22px;padding:15px 16px;display:flex;flex-direction:column;gap:10px;">';
  h+='<div style="display:flex;align-items:center;gap:8px;"><span style="display:inline-flex;color:var(--accent);">'+icon('pill',20)+'</span><span style="font-size:12px;font-weight:800;letter-spacing:1px;color:var(--accent);">DÜNÜN ETKİSİ</span></div>';
  h+='<div style="font-size:14px;font-weight:700;line-height:1.35;color:var(--text);">Dün '+esc(form.label)+' almıştın. Uykuna, krampına veya genel hissetine yardımcı oldu mu?</div>';
  h+='<div style="display:flex;gap:8px;">';
  h+='<button onclick="App.saveMgFeedback(true)" style="flex:1;background:rgba(143,191,138,0.15);border:1.5px solid rgba(143,191,138,0.4);color:#3F8A4F;border-radius:12px;padding:10px;font-size:13px;font-weight:800;">Evet, faydalıydı</button>';
  h+='<button onclick="App.saveMgFeedback(false)" style="flex:1;background:rgba(217,83,79,0.08);border:1.5px solid rgba(217,83,79,0.3);color:#C0605F;border-radius:12px;padding:10px;font-size:13px;font-weight:800;">Pek fark görmedim</button>';
  h+='</div>';
  h+='</div>';
  return h;
}

function magnesiumBannerHTML(date){
  var s=data.settings.magnesium||{};
  if(s.kidneyDisease) return '';
  var rec=data.days[date]||null;
  var mg=rec&&rec.magnesium?rec.magnesium:null;
  if(mg && mg.taken) return '';
  if(mg && mg.skipped && mg.skippedDate===date) return '';
  if(s.dismissedUntil && s.dismissedUntil>=date) return '';
  var nudge=calculateMgNudge(date);
  var form=find(MG_FORMS,'id',nudge.form)||MG_FORMS[0];
  var recDose=400;
  var sebep=magnesiumReasonText(nudge);
  var h='';
  h+='<div class="glass" style="border-radius:22px;padding:15px 16px;display:flex;flex-direction:column;gap:10px;">';
  h+='<div style="display:flex;align-items:center;gap:8px;">';
  h+='<span style="display:inline-flex;color:var(--accent);">'+icon('pill',20)+'</span>';
  h+='<span style="font-size:12px;font-weight:800;letter-spacing:1px;color:var(--accent);">MAGNESYUM HATIRLATICISI</span>';
  h+='<span style="margin-left:auto;font-size:11px;font-weight:700;background:rgba(233,175,193,0.25);color:var(--choc);padding:3px 8px;border-radius:999px;">'+nudge.score+'/100</span>';
  h+='</div>';
  h+='<div style="font-size:15px;font-weight:700;line-height:1.35;color:var(--text);">Günışığı, bugün <span style="color:var(--accent);">400 mg magnezyum</span> almayı unutma.</div>';
  if(nudge.blocked){
    h+='<div style="font-size:12px;color:var(--watch);">Böbrek rahatsızlığı veya tolerans sorunu bildirdin; önce hekimine danış.</div>';
  } else {
    h+='<div style="font-size:13px;color:var(--muted);display:flex;align-items:center;gap:6px;">';
    h+='<span style="display:inline-flex;">'+(form.icon||icon('flask',15))+'</span>';
    h+='<span>Önerilen form: <b>'+esc(form.label)+'</b> · '+esc(form.note)+(sebep.length?' · Sinyaller: '+esc(sebep.slice(0,3).join(' · ')):'')+'</span>';
    h+='</div>';
  }
  h+='<div style="display:flex;gap:8px;flex-wrap:wrap;margin-top:2px;">';
  if(!nudge.blocked){
    h+='<button onclick="App.takeMagnesium(\''+nudge.form+'\','+recDose+')" style="flex:1;min-width:100px;background:var(--accent);color:#fff;border:none;border-radius:12px;padding:10px 12px;font-size:13px;font-weight:800;">Aldım · 400 mg</button>';
  }
  h+='<button onclick="App.skipMagnesium()" style="flex:1;min-width:90px;background:transparent;border:1.5px solid var(--card-bd);color:var(--muted);border-radius:12px;padding:9px 12px;font-size:13px;font-weight:700;">Bugün almayacağım</button>';
  h+='<button onclick="App.snoozeMg()" style="min-width:60px;background:transparent;border:1.5px solid var(--card-bd);color:var(--muted);border-radius:12px;padding:9px 10px;font-size:13px;font-weight:700;">Sonra</button>';
  h+='</div>';
  h+='</div>';
  return h;
}

function magnesiumCardHTML(date){
  var s=data.settings.magnesium||{};
  var rec=data.days[date]||null;
  var mg=rec&&rec.magnesium?rec.magnesium:null;
  var nudge=calculateMgNudge(date);
  var hl=magnesiumHeadline(nudge);
  var form=find(MG_FORMS,'id',nudge.form)||MG_FORMS[0];
  var stats=magnesiumStats();
  var recDose=400;
  var h='';
  h+='<div class="glass" style="border-radius:22px;padding:16px;display:flex;flex-direction:column;gap:12px;">';
  h+='<div style="display:flex;align-items:center;gap:10px;">';
  h+='<span style="display:inline-flex;color:var(--accent);">'+icon('pill',22)+'</span>';
  h+='<div style="flex:1;">';
  h+='<div style="font-size:14px;font-weight:800;color:var(--text);">Magnezyum Hatırlatıcısı</div>';
  h+='<div style="font-size:12px;color:var(--muted);">Güçlü sinyal · Skor '+nudge.score+'/100</div>';
  h+='</div>';
  var phaseName=(nudge.phase?MG_PHASE_LABELS[nudge.phase]:null)||'Döngü fazı bekleniyor';
  var phaseColor=MG_PHASE_COLORS[nudge.phase]||MG_PHASE_COLORS.unknown;
  h+='<span style="font-size:12px;font-weight:800;background:'+phaseColor+'18;color:'+phaseColor+';padding:5px 10px;border-radius:999px;border:1.5px solid '+phaseColor+'80;white-space:nowrap;">'+esc(phaseName)+'</span>';
  h+='</div>';

  if(s.kidneyDisease){
    h+='<div style="font-size:13px;color:var(--watch);">Magnezyum önerileri doktor kontrolü gerektiren durum için filtreleniyor.</div>';
  } else {
    h+='<div style="display:grid;grid-template-columns:1fr 1fr;gap:8px;">';
    h+='<div style="background:var(--card);border:1px solid var(--card-bd);border-radius:14px;padding:10px;"><div style="font-size:10.5px;color:var(--faint);">Kullanılan gün</div><div style="font-size:18px;font-weight:800;">'+stats.totalDays+'</div></div>';
    h+='<div style="background:var(--card);border:1px solid var(--card-bd);border-radius:14px;padding:10px;"><div style="font-size:10.5px;color:var(--faint);">Toplam magnezyum</div><div style="font-size:18px;font-weight:800;">'+stats.totalMg+' mg</div></div>';
    h+='<div style="background:var(--card);border:1px solid var(--card-bd);border-radius:14px;padding:10px;"><div style="font-size:10.5px;color:var(--faint);">Ortalama doz</div><div style="font-size:18px;font-weight:800;">'+(stats.avgDose?stats.avgDose+' mg':'—')+'</div></div>';
    h+='<div style="background:var(--card);border:1px solid var(--card-bd);border-radius:14px;padding:10px;"><div style="font-size:10.5px;color:var(--faint);">Güncel seri</div><div style="font-size:18px;font-weight:800;">'+stats.streak+' gün</div></div>';
    h+='</div>';

    if(mg && mg.taken){
      var todayPct=Math.min(100,Math.round((mg.mg||0)/recDose*100));
      h+='<div style="display:flex;flex-direction:column;gap:8px;">';
      h+='<div style="font-size:15px;font-weight:700;color:var(--ok);display:flex;align-items:center;gap:6px;">'+icon('circle-check',16)+' Bugün '+esc(form.label)+' kaydedildi.</div>';
      h+='<div style="font-size:13px;color:var(--muted);">Alınan: '+esc((mg.mg||0)+' mg')+' · Günlük hedefin %'+todayPct+'\'si · Saat: '+esc(mg.time||'—')+'</div>';
      if(ui.mgEditing){
        h+='<div style="display:flex;flex-direction:column;gap:10px;">';
        h+='<div style="font-size:12.5px;color:var(--text2);">Form</div>';
        h+='<div style="display:flex;flex-wrap:wrap;gap:6px;">';
        MG_FORMS.slice(0,4).forEach(function(f){
          var sel=mg.form===f.id;
          h+='<button onclick="App.setMgForm(\''+f.id+'\')" style="flex:1;min-width:70px;padding:8px 6px;border-radius:10px;cursor:pointer;font-size:12px;font-weight:700;border:1.5px solid '+(sel?'var(--accent)':'var(--card-bd)')+';background:'+(sel?'rgba(233,175,193,0.2)':'var(--card)')+';color:'+(sel?'var(--choc)':'var(--text)')+';">'+(f.icon||icon('flask',12))+' '+esc(f.label)+'</button>';
        });
        h+='</div>';
        h+='<div style="display:flex;gap:8px;">';
        h+='<div style="flex:1;display:flex;flex-direction:column;gap:6px;"><div style="font-size:12.5px;color:var(--text2);">Doz (mg)</div><input type="number" min="1" max="500" value="'+esc(String(mg.mg||200))+'" onchange="App.setMgMg(this.value)" style="border:1px solid var(--field-bd);background:var(--field);border-radius:10px;padding:9px 10px;font-size:14px;outline:none;"></div>';
        h+='<div style="flex:1;display:flex;flex-direction:column;gap:6px;"><div style="font-size:12.5px;color:var(--text2);">Saat</div><input type="time" value="'+esc(mg.time||timeHM())+'" onchange="App.setMgTime(this.value)" style="border:1px solid var(--field-bd);background:var(--field);border-radius:10px;padding:9px 10px;font-size:14px;outline:none;"></div>';
        h+='</div>';
        h+='<div style="font-size:12.5px;color:var(--text2);">Etki / not</div>';
        h+='<input type="text" value="'+esc(mg.effectNote||'')+'" oninput="App.saveMgNote(this.value)" placeholder="Bugünkü etkisini kısaca yaz..." style="border:1px solid var(--field-bd);background:var(--field);border-radius:10px;padding:9px 10px;font-size:13px;outline:none;">';
        h+='<button onclick="App.editMagnesium()" style="align-self:flex-start;background:var(--accent);color:#fff;border:none;border-radius:12px;padding:8px 14px;font-size:12px;font-weight:800;">Tamam</button>';
        h+='<button onclick="App.deleteMgEntry()" style="align-self:flex-start;background:transparent;border:1.5px solid var(--card-bd);color:var(--watch);border-radius:12px;padding:8px 12px;font-size:12px;font-weight:700;">Sil</button>';
        h+='</div>';
      } else {
        if(mg.effectNote) h+='<div style="font-size:12px;color:var(--faint);padding:8px 10px;background:var(--card);border-radius:10px;">Not: '+esc(mg.effectNote)+'</div>';
        h+='<button onclick="App.editMagnesium()" style="align-self:flex-start;background:transparent;border:1.5px solid var(--card-bd);color:var(--muted);border-radius:12px;padding:8px 12px;font-size:12px;font-weight:700;">Düzenle</button>';
      }
      h+='</div>';
    } else if(mg && mg.skipped){
      h+='<div style="font-size:14px;color:var(--muted);">Bugün magnezyum alınmadı.</div>';
    } else {
      h+='<div style="display:flex;flex-direction:column;gap:8px;">';
      h+='<div style="font-size:14px;font-weight:700;color:var(--text);">Bugünkü hedef: 400 mg '+esc(form.label)+'</div>';
      h+='<div style="font-size:13px;color:var(--muted);display:flex;align-items:center;gap:6px;">';
      h+='<span style="display:inline-flex;">'+(form.icon||icon('flask',15))+'</span>';
      h+='<span>'+esc(form.note)+'</span>';
      h+='</div>';
      if(nudge.reasons.length){
        h+='<div style="font-size:12px;color:var(--faint);">Sinyaller: '+esc(nudge.reasons.slice(0,4).map(function(r){return MG_REASON_LABELS[r]||r;}).join(' · '))+'</div>';
      }
      h+='<div style="display:flex;gap:8px;flex-wrap:wrap;">';
      h+='<button onclick="App.takeMagnesium(\''+nudge.form+'\','+recDose+')" style="flex:1;min-width:100px;background:var(--accent);color:#fff;border:none;border-radius:12px;padding:10px 12px;font-size:13px;font-weight:800;">Aldım · 400 mg</button>';
      h+='<button onclick="App.skipMagnesium()" style="flex:1;min-width:90px;background:transparent;border:1.5px solid var(--card-bd);color:var(--muted);border-radius:12px;padding:9px 12px;font-size:13px;font-weight:700;">Bugün almayacağım</button>';
      h+='</div>';
      h+='</div>';
    }
  }

  h+='<div style="font-size:11px;color:var(--faint);line-height:1.4;border-top:1px solid var(--card-bd);padding-top:8px;">Günlük hedef 400 mg elementer magnezyum (EFSA/NICE referans üst sınır). Kişiselleştirilmiş tıbbi öneri değildir.</div>';
  h+='</div>';
  return h;
}

function raporHTML(){
  var all=allDays(); var last30=lastNDays(30);
  var totalTicks=0; all.forEach(function(o){ totalTicks+=countRec(o.rec); });
  var cur=currentStreak(), best=bestStreak(all), tracked=daysTracked();
  var h='<div style="animation:seyFade .3s ease;display:flex;flex-direction:column;gap:14px;">';
  var chips=[[icon('flame',13)+' Güncel seri',cur+' gün'],[icon('trophy',13)+' En iyi seri',best+' gün'],[icon('calendar',13)+' Takip günü',tracked],[icon('circle-check',13)+' Toplam tik',totalTicks]];
  h+='<div style="display:grid;grid-template-columns:1fr 1fr;gap:9px;">';
  chips.forEach(function(c){ h+='<div class="glass" style="border-radius:16px;padding:13px;"><div style="font-size:11.5px;color:var(--faint);display:flex;align-items:center;gap:4px;">'+c[0]+'</div><div style="font-size:21px;font-weight:800;margin-top:3px;">'+esc(c[1])+'</div></div>'; });
  h+='</div>';
  var msx=nextMilestone(cur); if(msx) h+='<div style="background:linear-gradient(135deg,#FFE19A,#F7C9B0);border-radius:16px;padding:12px 15px;font-size:13px;font-weight:700;color:#7A4A2E;display:flex;align-items:center;gap:7px;">'+icon('target',15)+' Sonraki kilometre taşı: '+msx.target+' gün · yolun %'+msx.pct+'</div>';
  h+=consistencyMomentumCard();
  h+=weekSelfCard();
  h+=distanceRecapCard();
  h+=weeklyStepRecap();
  var avg30=(last30.reduce(function(a,o){return a+countRec(o.rec);},0)/30).toFixed(1);
  h+='<div class="glass" style="border-radius:22px;padding:16px;display:flex;flex-direction:column;gap:10px;"><div style="display:flex;justify-content:space-between;align-items:baseline;"><div style="font-size:15.5px;font-weight:700;">Son 30 gün — günlük tik</div><div style="font-size:12px;color:var(--faint);">ort. '+avg30+'/'+htToday()+'</div></div>';
  h+=trendBars(last30,function(o){return countRec(o.rec);},'linear-gradient(180deg,#E9899F,#C9B8FF)')+'</div>';
  h+='<div class="glass" style="border-radius:22px;padding:16px;display:flex;flex-direction:column;gap:11px;"><div style="font-size:15.5px;font-weight:700;">Alışkanlık oranları (30 gün)</div>';
  HABITS.forEach(function(hb){ var pct=habitRate(last30,hb.key); h+='<div style="display:flex;flex-direction:column;gap:4px;"><div style="display:flex;justify-content:space-between;font-size:13px;"><span style="color:var(--text2);">'+hb.icon+' '+esc(hb.title)+'</span><span style="font-weight:700;color:var(--accent);">%'+pct+'</span></div><div style="height:7px;border-radius:999px;background:rgba(150,110,120,0.13);overflow:hidden;"><div style="height:100%;width:'+pct+'%;border-radius:999px;background:linear-gradient(90deg,#E9AFC1,#C9B8FF);"></div></div></div>'; });
  h+=sciNote('Bir alışkanlık ne kadar sık tekrarlanırsa nöral yolu o kadar güçlenir (nöroplastisite); %60+ oran, davranışın otomatikleşmeye başladığını gösterir.');
  h+='</div>';
  // ── Ruhsal eğilim (30 gün) — fiziksel trendlerin yanında zihinsel sağlık ──
  var _mv=[],_ev=[],_sv=[];
  last30.forEach(function(o){ if(!o.rec) return; var _ms=moodScore(o.rec.mood); if(_ms!=null) _mv.push(_ms); if(o.rec.energy!=null) _ev.push(Number(o.rec.energy)); if(o.rec.stress!=null) _sv.push(Number(o.rec.stress)); });
  var _mA=avgOf(_mv),_eA=avgOf(_ev),_sA=avgOf(_sv);
  if(_mA!=null||_eA!=null||_sA!=null){
    var rtile=function(label,val,col){ return '<div style="flex:1;min-width:0;background:var(--icon);border-radius:14px;padding:12px 8px;text-align:center;"><div style="font-size:20px;font-weight:800;color:'+col+';line-height:1;font-variant-numeric:tabular-nums;">'+(val!=null?val.toFixed(1).replace('.',','):'—')+'</div><div style="font-size:10px;color:var(--faint);margin-top:4px;font-weight:700;letter-spacing:.2px;">'+label+'</div></div>'; };
    h+='<div class="glass" style="border-radius:22px;padding:16px;display:flex;flex-direction:column;gap:11px;"><div style="font-size:15.5px;font-weight:700;display:flex;align-items:center;gap:6px;"><span style="display:inline-flex;color:#8A75C8;">'+icon('brain',16)+'</span>Ruhsal eğilim — 30 gün</div>';
    h+='<div style="display:flex;gap:8px;">'+rtile('Mod /5',_mA,'#C97FA8')+rtile('Enerji /5',_eA,'#F5A623')+rtile('Stres /5',_sA,'#7C5CC4')+'</div>';
    h+=sciNote('Ruh hâli fiziksel alışkanlıklardan bağımsız değil: iyi uyku ve düzenli hareket modu yükseltir, kronik stres ise iştahı ve şeker isteğini besler. Bu üç ekseni birlikte izlemek, bedeni ve zihni tek sistem olarak görmeni sağlar.');
    h+='</div>';
  }
  var pAvg=avgOf(last30.filter(function(o){return o.rec;}).map(function(o){return dayNutrition(o.rec).protein;}).filter(function(v){return v>0;}));
  var wAvg=avgOf(last30.filter(function(o){return o.rec&&typeof o.rec.water==='number'&&o.rec.water>0;}).map(function(o){return o.rec.water;}));
  h+='<div class="glass" style="border-radius:22px;padding:16px;display:flex;flex-direction:column;gap:14px;">';
  h+='<div style="display:flex;justify-content:space-between;align-items:baseline;"><div style="font-size:15.5px;font-weight:700;display:flex;align-items:center;gap:6px;">'+icon('egg',16)+' Protein trendi (30 gün)</div><div style="font-size:12px;color:var(--faint);">ort. '+(pAvg!=null?Math.round(pAvg)+' g':'—')+'</div></div>';
  h+=trendBars(last30,function(o){return o.rec?dayNutrition(o.rec).protein:0;},'linear-gradient(180deg,#F2B65A,#E9899F)');
  h+='<div style="display:flex;justify-content:space-between;align-items:baseline;"><div style="font-size:15.5px;font-weight:700;display:flex;align-items:center;gap:6px;">'+icon('droplet',16)+' Su trendi (30 gün)</div><div style="font-size:12px;color:var(--faint);">ort. '+(wAvg!=null?(Math.round(wAvg*10)/10)+' bardak':'—')+'</div></div>';
  h+=trendBars(last30,function(o){return o.rec&&typeof o.rec.water==='number'?o.rec.water:0;},'linear-gradient(180deg,#7FC9E9,#C9B8FF)');
  h+='</div>';
  var ins=corrInsights();
  if(ins.length){ h+='<div class="glass" style="border-radius:22px;padding:16px;display:flex;flex-direction:column;gap:11px;"><div style="font-size:15.5px;font-weight:700;display:flex;align-items:center;gap:6px;">Senin örüntülerin '+icon('search',16)+'</div>';
    ins.forEach(function(c){ h+='<div style="display:flex;gap:11px;align-items:flex-start;background:var(--card);border-radius:14px;padding:12px 13px;"><span style="flex-shrink:0;display:flex;">'+c[0]+'</span><span style="flex:1;font-size:13.5px;line-height:1.5;color:var(--text2);">'+esc(c[1])+'</span></div>'; });
    h+='<div style="font-size:11px;color:var(--faint);line-height:1.5;">Bunlar senin kayıtlarından çıkan eğilimler; tıbbi tavsiye değil, küçük ipuçları.</div></div>';
  }
  var md=moodDist(last30); var mtot=0; for(var mkk in md) mtot+=md[mkk];
  h+='<div class="glass" style="border-radius:22px;padding:16px;display:flex;flex-direction:column;gap:10px;"><div style="font-size:15.5px;font-weight:700;">Mod dağılımı (30 gün)</div>';
  if(mtot){ var mcol={'cok-iyi':'#FFD37A','iyi':'#F2B65A','normal':'#8FBF8A','zorlandim':'#9BB0D9','cok-zorlandim':'#B89BD9'};
    h+='<div style="display:flex;height:14px;border-radius:999px;overflow:hidden;">'; MOODS.forEach(function(m){ var v=md[m.id]||0; if(v) h+='<div style="width:'+(v/mtot*100)+'%;background:'+(mcol[m.id]||'#C9B8FF')+';"></div>'; }); h+='</div>';
    h+='<div style="display:flex;flex-wrap:wrap;gap:10px;font-size:12px;color:var(--muted);">'; MOODS.forEach(function(m){ var v=md[m.id]||0; if(v) h+='<span style="display:inline-flex;align-items:center;gap:4px;">'+icon(m.icon,13)+' '+esc(m.short)+' <b>'+v+'</b></span>'; }); h+='</div>';
  } else h+='<div style="font-size:13px;color:var(--faint);">Bu dönemde mod kaydı yok.</div>';
  h+='</div>';
  h+=moodHeatmapCard();
  h+=badgesGrid();
  var months=monthlySummary();
  if(months.length){ var moN=['Oca','Şub','Mar','Nis','May','Haz','Tem','Ağu','Eyl','Eki','Kas','Ara'];
    h+='<div style="padding:4px 4px 0;"><div style="font-size:17px;font-weight:800;">Aylık özet</div></div>';
    months.slice(0,12).forEach(function(m){ var p=m.month.split('-'); h+='<div class="glass" style="border-radius:16px;padding:13px 15px;display:flex;justify-content:space-between;align-items:center;"><div><div style="font-size:15px;font-weight:800;">'+moN[+p[1]-1]+' '+p[0]+'</div><div style="font-size:12px;color:var(--faint);">'+m.days+' gün kayıt</div></div><div style="text-align:right;"><div style="font-size:13px;color:var(--accent);font-weight:700;">ort. '+m.avg.toFixed(1)+'/'+htToday()+'</div><div style="font-size:12px;color:var(--muted);">en iyi seri '+m.best+'</div></div></div>'; });
  }
  h+='<div style="padding:8px 4px 0;"><div style="font-size:23px;font-weight:800;display:flex;align-items:center;gap:8px;">Minik Kurallar '+icon('leaf',20)+'</div></div>';
  h+='<div class="glass" style="border-radius:22px;padding:18px;display:flex;flex-direction:column;gap:11px;">';
  [[icon('leaf',17),'Aç kalmak yok.'],[icon('cookie',17),'Tatlı hayatımızdan silinmiyor; sadece otomatik pilottan çıkıyor.'],[icon('moon',17),'Akşam 7\'den sonra önce şunu sor: gerçekten aç mıyım?'],[icon('egg',17),'Her öğüne protein eklemek krizleri sakinleştirir.'],[icon('sun',17),'D₃K₂ damla da küçük ritmin bir parçası.'],[icon('dumbbell',17),'Bir gün zor geçti diye sistem bitmez.'],[icon('footprints',17),'Yürüyüş kısa da olsa sayılır.'],[icon('heart',17),'Kendine kötü konuşmak yok.'],[icon('sun',17),'Kontrol, kendine sert davranmak değildir.']].forEach(function(r){ h+='<div style="display:flex;gap:10px;font-size:14.5px;line-height:1.45;"><span style="display:inline-flex;flex-shrink:0;">'+r[0]+'</span><span>'+esc(r[1])+'</span></div>'; });
  h+='</div>';
  h+='<button onclick="App.printReport()" style="border:none;cursor:pointer;width:100%;padding:16px;border-radius:18px;font-size:16px;font-weight:700;color:#fff;background:linear-gradient(135deg,#6B4A3A,#A07A52);box-shadow:0 10px 22px rgba(107,74,58,0.3);margin-top:4px;display:flex;align-items:center;justify-content:center;gap:6px;">Rapor Oluştur / PDF '+icon('file-text',16)+'</button>';
  h+='</div>';
  return h;
}

function ayarlarHTML(){
  var h='<div style="animation:seyFade .3s ease;display:flex;flex-direction:column;gap:14px;">';
  // ── Veri & senkron özeti (teknik detay) ──
  var _dtracked=daysTracked(), _totalTicks=0,_dayRecs=0;
  for(var _dk in data.days){ _dayRecs++; _totalTicks+=countRec(data.days[_dk]); }
  var _sizeKB=0; try{ _sizeKB=Math.round(JSON.stringify(data).length/1024); }catch(e){}
  var _prog=(window.MotivationProgramV2&&featuresLive())?window.MotivationProgramV2.progressSummary(data):null;
  var _lastSync=data.lastSyncDate?(data.lastSyncDate===todayStr()?'bugün':esc(data.lastSyncDate)):'henüz yok';
  var _conn=syncConfigured();
  h+='<div class="glass" style="border-radius:20px;padding:16px;display:flex;flex-direction:column;gap:12px;">';
  h+='<div style="font-size:15px;font-weight:700;display:flex;align-items:center;gap:6px;"><span style="display:inline-flex;color:var(--accent);">'+icon('chart-column',15)+'</span>Veri & senkron özeti</div>';
  h+='<div style="display:grid;grid-template-columns:repeat(3,1fr);gap:9px;">';
  [['Takip günü',_dtracked],['Toplam tik',_totalTicks],['Kayıt boyutu','~'+_sizeKB+' KB']].forEach(function(c){ h+='<div style="background:var(--icon);border:1px solid var(--card-bd);border-radius:14px;padding:11px 8px;text-align:center;"><div style="font-size:10.5px;color:var(--faint);line-height:1.3;">'+c[0]+'</div><div style="font-size:16px;font-weight:800;margin-top:3px;font-variant-numeric:tabular-nums;">'+c[1]+'</div></div>'; });
  h+='</div>';
  var _srow=function(ic,label,val,col){ return '<div style="display:flex;align-items:center;gap:10px;"><span style="width:22px;display:flex;justify-content:center;color:'+(col||'var(--muted)')+';">'+icon(ic,14)+'</span><span style="flex:1;font-size:13px;color:var(--text2);">'+label+'</span><span style="font-size:13px;font-weight:700;text-align:right;">'+val+'</span></div>'; };
  h+='<div style="display:flex;flex-direction:column;gap:8px;border-top:1px solid var(--card-bd);padding-top:11px;">';
  h+=_srow(_conn?'circle-check':'link-2','Repo bağlantısı',(_conn?'<span style="color:#3F8A4F;">bağlı</span>':'<span style="color:#E9899F;">bağlı değil</span>'),_conn?'#3F8A4F':'#E9899F');
  h+=_srow('save','Son repoya kayıt','<span style="color:var(--text);">'+_lastSync+'</span>');
  if(_prog) h+=_srow('compass','İçsel Pusula','<span style="color:var(--text);">Gün '+_prog.currentProgramDay+'/'+_prog.totalDays+' · %'+_prog.percent+'</span>','#6E5FCB');
  h+='</div>';
  h+='<div style="font-size:11px;color:var(--faint);line-height:1.45;">Kayıt boyutu, bu cihazdaki verinin yaklaşık büyüklüğü. Sırlar (anahtarlar) repoya asla gönderilmez.</div>';
  h+='</div>';
  h+='<div class="glass" style="border-radius:20px;padding:16px;display:flex;flex-direction:column;gap:8px;"><div style="font-size:15px;font-weight:700;">Başlangıç tarihi</div><input type="date" value="'+esc(data.startDate)+'" onchange="App.startDateChange(this)" style="border:1px solid var(--field-bd);background:var(--field);border-radius:12px;padding:12px;font-size:15px;outline:none;"></div>';
  // appearance
  h+='<div class="glass" style="border-radius:20px;padding:16px;display:flex;flex-direction:column;gap:10px;"><div style="font-size:15px;font-weight:700;">Görünüm</div><div style="display:flex;gap:8px;">';
  var onS='background:linear-gradient(135deg,#FFE8A3,#E9AFC1);color:#5A2E2A;border:1px solid #E9AFC1;';
  var offS='background:transparent;color:var(--muted);border:1px solid var(--card-bd);';
  h+='<button onclick="App.setTheme(false)" style="flex:1;padding:11px;border-radius:13px;cursor:pointer;font-size:14px;font-weight:700;display:flex;align-items:center;justify-content:center;gap:6px;'+(dark?offS:onS)+'">'+icon('sun',15)+' Açık</button>';
  h+='<button onclick="App.setTheme(true)" style="flex:1;padding:11px;border-radius:13px;cursor:pointer;font-size:14px;font-weight:700;display:flex;align-items:center;justify-content:center;gap:6px;'+(dark?onS:offS)+'">'+icon('moon',15)+' Koyu</button></div></div>';
  // titreşim / haptik geri bildirimi
  var hapOn=!(data.settings&&data.settings.haptics===false);
  h+='<div class="glass" style="border-radius:20px;padding:16px;display:flex;flex-direction:column;gap:10px;"><div style="font-size:15px;font-weight:700;display:flex;align-items:center;gap:6px;">Titreşim geri bildirimi '+icon('vibrate',15)+'</div><div style="font-size:12.5px;color:var(--text2);line-height:1.5;">Tik, mod ve kriz dokunuşlarında minik bir titreşim (destekleyen cihazlarda hissedilir).</div><div style="display:flex;gap:8px;">';
  h+='<button onclick="App.toggleHaptic(true)" style="flex:1;padding:11px;border-radius:13px;cursor:pointer;font-size:14px;font-weight:700;display:flex;align-items:center;justify-content:center;gap:6px;'+(hapOn?onS:offS)+'">'+icon('vibrate',14)+' Açık</button>';
  h+='<button onclick="App.toggleHaptic(false)" style="flex:1;padding:11px;border-radius:13px;cursor:pointer;font-size:14px;font-weight:700;display:flex;align-items:center;justify-content:center;gap:6px;'+(hapOn?offS:onS)+'">'+icon('bell-off',14)+' Kapalı</button></div></div>';
  // D vitamini takviyesi — 20 Temmuz 2026 Pazartesi itibarıyla D₃K₂ damla.
  h+='<div class="glass" style="border-radius:20px;padding:16px;display:flex;flex-direction:column;gap:10px;"><div style="font-size:15px;font-weight:700;display:flex;align-items:center;gap:6px;">'+icon('sun',15)+' D vitamini takviyesi</div><div style="font-size:12.5px;color:var(--text2);line-height:1.5;">20 Temmuz 2026 Pazartesi’den itibaren yeni forma geçiyoruz.</div>';
  var vdForm=esc((data.settings&&data.settings.vitaminDForm)||'D₃K₂ damla');
  var vdDose=esc((data.settings&&data.settings.vitaminDDose)||'1 damla (D3 1000 IU + K2 100 mcg)');
  h+=_srow('pill','Form',vdForm);
  h+=_srow('droplet','Doz',vdDose);
  h+='</div>';
  // Gizlenen kartlar — yalnızca kullanıcı bir kartı sakladıysa görünür (kilitlenme yok).
  var sgh=data.settings||{};
  if(sgh.hideLocationCard||sgh.hideRepoBanner){
    h+='<div class="glass" style="border-radius:20px;padding:16px;display:flex;flex-direction:column;gap:10px;"><div style="font-size:15px;font-weight:700;display:flex;align-items:center;gap:6px;">Gizlenen kartlar '+icon('sparkles',15)+'</div><div style="font-size:12.5px;color:var(--text2);line-height:1.5;">Bugün ekranında sakladığın kartları tek dokunuşla geri getir.</div>';
    if(sgh.hideRepoBanner) h+='<button onclick="App.showBugunCard(\'repo\')" style="display:flex;align-items:center;gap:9px;border:1px solid var(--field-bd);cursor:pointer;padding:12px 13px;border-radius:13px;font-size:14px;font-weight:700;color:var(--text);background:var(--card);"><span style="display:inline-flex;color:var(--accent);">'+icon('link-2',16)+'</span><span style="flex:1;text-align:left;">Repoya bağlan şeridi</span><span style="font-size:12.5px;font-weight:800;color:var(--accent);">Geri getir</span></button>';
    if(sgh.hideLocationCard) h+='<button onclick="App.showBugunCard(\'location\')" style="display:flex;align-items:center;gap:9px;border:1px solid var(--field-bd);cursor:pointer;padding:12px 13px;border-radius:13px;font-size:14px;font-weight:700;color:var(--text);background:var(--card);"><span style="display:inline-flex;color:#3F9A4F;">'+icon('map-pin',16)+'</span><span style="flex:1;text-align:left;">Konum & Hareket kartı</span><span style="font-size:12.5px;font-weight:800;color:var(--accent);">Geri getir</span></button>';
    h+='</div>';
  }
  h+=settingsBtn('App.printReport()','Rapor oluştur / PDF',icon('file-text',17));
  h+=settingsBtn('App.exportJson()','Yedek indir',icon('save',17));
  h+=settingsBtn('App.importClick()','Yedek yükle',icon('repeat',17));
  h+='<input type="file" id="sey-file" accept="application/json,.json" onchange="App.importJson(this)" style="display:none;">';
  h+='<div style="font-size:12.5px;color:var(--faint);line-height:1.5;padding:0 4px;">Yedek dosyanı saklarsan telefon/tarayıcı değişse bile kayıtlarını geri alabilirsin.</div>';
  // repoya otomatik kayıt — ortak durum
  var sg=data.settings||{};
  h+='<div style="padding:6px 4px 0;"><div style="font-size:16px;font-weight:800;display:flex;align-items:center;gap:6px;">Repoya otomatik kayıt '+icon('save',15)+'</div></div>';
  h+='<div id="sey-sync-status" style="font-size:12.5px;color:var(--faint);min-height:16px;padding:0 4px;">'+esc(window.SeySync?window.SeySync.statusText():'')+'</div>';
  // Doğrudan GitHub bağlantısı
  var connected=syncConfigured();
  h+='<div class="glass" style="border-radius:20px;padding:16px;display:flex;flex-direction:column;gap:9px;"><div style="font-size:15px;font-weight:700;display:flex;align-items:center;gap:8px;">Repoya bağlan '+(connected?'<span style="font-size:12px;font-weight:700;color:#3F8A4F;background:rgba(143,191,138,0.2);padding:2px 9px;border-radius:999px;display:inline-flex;align-items:center;gap:3px;">'+icon('check',11)+' bağlı</span>':'')+'</div>';
  h+='<div style="font-size:12.5px;line-height:1.5;color:var(--text2);">Günlük kayıtlar her günün tarihine yazılır; aynı gün içindeki değişiklikler o günün kaydını günceller. Tüm günler korunur ve izlenir.</div>';
  if(!connected || ui.keyEdit){
    h+='<input type="password" autocomplete="off" autocapitalize="off" spellcheck="false" value="'+esc(ui.keyEdit?'':(sg.ghToken||''))+'" oninput="App.setGhToken(this)" placeholder="github_pat_… (Contents: Read and write)" style="border:1px solid var(--field-bd);background:var(--field);border-radius:12px;padding:11px;font-size:13px;outline:none;">';
    h+='<div style="display:flex;gap:8px;">';
    h+='<button onclick="App.syncNow()" style="flex:1;border:none;cursor:pointer;padding:12px;border-radius:14px;font-size:14.5px;font-weight:700;color:#fff;background:linear-gradient(135deg,#E9AFC1,#C9B8FF);">Bağla ve kaydet ⬆️</button>';
    if(connected) h+='<button onclick="App.cancelKeyEdit()" style="flex:1;border:1px solid var(--field-bd);cursor:pointer;padding:12px;border-radius:14px;font-size:14px;font-weight:700;color:var(--text2);background:var(--card);">İptal</button>';
    h+='</div>';
  } else {
    h+='<div style="font-size:12.5px;color:#3F8A4F;background:rgba(143,191,138,0.12);border:1px solid rgba(143,191,138,0.35);padding:10px 12px;border-radius:12px;">Bağlantı doğrulandı. Kayıtlar otomatik devam ediyor.</div>';
    h+='<div style="display:flex;gap:8px;"><button onclick="App.syncNow()" style="flex:1;border:none;cursor:pointer;padding:12px;border-radius:14px;font-size:14.5px;font-weight:700;color:#fff;background:linear-gradient(135deg,#E9AFC1,#C9B8FF);">Şimdi kaydet ⬆️</button><button onclick="App.enableKeyEdit()" style="flex:1;border:1px solid var(--field-bd);cursor:pointer;padding:12px;border-radius:14px;font-size:14px;font-weight:700;color:var(--text2);background:var(--card);">Yeni anahtar gir</button></div>';
  }
  h+='</div>';
  // Sağlık senkronu kurulumu artık Bugün ekranındaki Konum & Hareket kartında
  // (tek kaynak — genişletilebilir kart, kopyala-yapıştır alanlarıyla). Burada
  // tekrarlamak yerine oraya yönlendiriyoruz.
  if(connected){
    h+='<button onclick="App.go(\'bugun\')" style="text-align:left;border:1px solid rgba(143,191,138,0.32);cursor:pointer;background:rgba(143,191,138,0.06);border-radius:16px;padding:13px 14px;display:flex;align-items:center;gap:10px;">';
    h+='<span style="flex-shrink:0;display:inline-flex;">'+icon('apple',18)+'</span>';
    h+='<span style="flex:1;font-size:12.5px;line-height:1.4;color:var(--text2);"><b style="color:var(--text);">Sağlık senkronu</b> kurulumu Bugün ekranındaki Konum & Hareket kartına taşındı.</span>';
    h+='<span style="flex-shrink:0;color:var(--faint);font-size:14px;">›</span>';
    h+='</button>';
  }
  // Luna · kişisel asistan (OpenAI anahtarı)
  var hasOaKey=!!(sg.openaiKey&&String(sg.openaiKey).trim());
  var oaBadge='';
  if(ui.openaiKeyState==='checking') oaBadge='<span style="font-size:12px;font-weight:700;color:#8A6A2A;background:rgba(220,180,90,0.2);padding:2px 9px;border-radius:999px;">doğrulanıyor…</span>';
  else if(ui.openaiKeyState==='invalid') oaBadge='<span style="font-size:12px;font-weight:700;color:#fff;background:#D9534F;padding:2px 9px;border-radius:999px;display:inline-flex;align-items:center;gap:3px;">'+icon('x',11)+' API key hatalı</span>';
  else if(ui.openaiKeyState==='valid') oaBadge='<span style="font-size:12px;font-weight:700;color:#fff;background:#3F8A4F;padding:2px 9px;border-radius:999px;display:inline-flex;align-items:center;gap:3px;">'+icon('check',11)+' bağlı</span>';
  else if(hasOaKey) oaBadge='<span style="font-size:12px;font-weight:700;color:#6A4FA0;background:rgba(155,127,201,0.18);padding:2px 9px;border-radius:999px;display:inline-flex;align-items:center;gap:3px;">'+icon('check',11)+' bağlı</span>';
  h+='<div class="glass" style="border-radius:20px;padding:16px;display:flex;flex-direction:column;gap:9px;"><div style="font-size:15px;font-weight:700;display:flex;align-items:center;gap:8px;">Luna · kişisel asistan <span style="color:#9B7FC9;display:inline-flex;">'+icon('moon',16)+'</span> '+oaBadge+'</div>';
  h+='<div style="font-size:12.5px;line-height:1.5;color:var(--text2);">Luna sorularını yanıtlayabilsin diye OpenAI API anahtarı gerekir. Anahtar <b>yalnızca bu cihazda</b> saklanır, repoya gönderilmez. Günde 5 soru hakkın olur — Luna olabildiğince detaylı yanıtlar.</div>';
  h+='<input type="password" autocomplete="off" autocapitalize="off" spellcheck="false" value="'+esc(sg.openaiKey||'')+'" oninput="App.setOpenaiKey(this)" placeholder="sk-… (OpenAI API anahtarı)" style="border:1px solid var(--field-bd);background:var(--field);border-radius:12px;padding:11px;font-size:13px;outline:none;">';
  if(ui.openaiKeyState==='invalid') h+='<div style="font-size:12px;color:#C0605F;background:rgba(217,83,79,0.1);border:1px solid rgba(217,83,79,0.3);border-radius:12px;padding:9px 11px;">Anahtar geçersiz görünüyor. platform.openai.com’dan doğru anahtarı yapıştırıp tekrar kaydet.</div>';
  h+='<button onclick="App.saveOpenaiKey()" style="border:none;cursor:pointer;width:100%;padding:12px;border-radius:14px;font-size:14.5px;font-weight:800;color:#fff;background:linear-gradient(135deg,#9B7FC9,#E9AFC1);box-shadow:0 8px 18px rgba(155,127,201,0.35);display:flex;align-items:center;justify-content:center;gap:6px;">Kaydet ve doğrula '+icon('check',14)+'</button>';
  h+='<div style="font-size:11.5px;color:var(--faint);">platform.openai.com → API keys bölümünden alınır.</div>';
  h+='</div>';
  h+='<button onclick="App.askReset()" style="border:1px solid rgba(220,120,120,0.25);cursor:pointer;width:100%;padding:16px;border-radius:18px;font-size:15.5px;font-weight:700;color:#C0605F;background:rgba(220,120,120,0.08);text-align:left;display:flex;justify-content:space-between;align-items:center;"><span>Verileri sıfırla</span><span style="display:inline-flex;">'+icon('trash-2',16)+'</span></button>';
  h+=settingsBtn('App.goStart()','Başlangıç ekranına dön',icon('rotate-ccw',17));
  // add to home guide
  h+='<div style="background:linear-gradient(135deg,rgba(255,232,163,0.4),rgba(247,221,229,0.45));border:1px solid var(--card-bd);border-radius:20px;padding:18px;"><div style="font-size:15.5px;font-weight:800;margin-bottom:10px;display:flex;align-items:center;gap:6px;">'+icon('phone',16)+' Ana ekrana ekleme rehberi</div><div style="font-size:14px;line-height:1.7;color:var(--text2);">iPhone\'da tek dokunuşla açmak için:<br>1. Bu sayfayı <b>Safari</b>\'de aç<br>2. Paylaş butonuna bas<br>3. <b>Ana Ekrana Ekle</b> seç<br>4. Adı: <b>Şeyma 🦩</b><br>5. Ekle</div></div>';
  h+='<div class="glass" style="border-radius:20px;padding:16px;"><div style="font-size:14.5px;font-weight:700;margin-bottom:6px;display:flex;align-items:center;gap:6px;">'+icon('lock',14)+' Gizlilik</div><div style="font-size:13.5px;line-height:1.55;color:var(--muted);">Kilit ekranı seni korur; parola ve kullanıcı adı düz metin olarak hiçbir yere yazılmaz. Kayıtlar bu cihazdaki tarayıcıda saklanır. Daha garanti olsun diye ara ara yedek indir.</div></div>';
  // ── Hakkında / sürüm ──
  var _mpv=window.MotivationProgramV2?window.MotivationProgramV2.version:'—';
  var _mnv=window.MotivationNarratives?window.MotivationNarratives.version:'—';
  h+='<div class="glass" style="border-radius:20px;padding:16px;display:flex;flex-direction:column;gap:9px;"><div style="font-size:14.5px;font-weight:700;display:flex;align-items:center;gap:6px;">'+icon('sparkles',14)+' Hakkında</div>';
  h+='<div style="font-size:13px;color:var(--text2);line-height:1.55;">Şeyma 🦩 · <b>v2.0</b> — Minik Denge Günlüğü. İçsel Pusula &amp; Terapi Odası sürümü.</div>';
  h+='<div style="display:flex;flex-wrap:wrap;gap:6px;">';
  [['Program',_mpv],['Anlatı',_mnv]].forEach(function(v){ h+='<span style="font-size:11px;font-weight:700;color:var(--muted);background:var(--icon);border:1px solid var(--card-bd);border-radius:999px;padding:3px 10px;">'+v[0]+' '+esc(v[1])+'</span>'; });
  h+='</div></div>';
  h+='</div>';
  return h;
}

function settingsBtn(onclick,label,icon){
  return '<button onclick="'+onclick+'" style="border:1px solid var(--field-bd);cursor:pointer;width:100%;padding:16px;border-radius:18px;font-size:15.5px;font-weight:700;color:var(--text);background:var(--card);text-align:left;display:flex;justify-content:space-between;align-items:center;backdrop-filter:blur(12px);-webkit-backdrop-filter:blur(12px);"><span>'+esc(label)+'</span><span>'+icon+'</span></button>';
}

// ================= SAĞLIK & DÖNGÜ =================
function num(v){ return (v===null||v===undefined||v==='')?null:Number(v); }
function ringSeg(cx,cy,R,C,color,startFrac,lenFrac,w){ if(lenFrac<=0) return ''; return '<circle cx="'+cx+'" cy="'+cy+'" r="'+R+'" fill="none" stroke="'+color+'" stroke-width="'+w+'" stroke-dasharray="'+(lenFrac*C).toFixed(2)+' '+(C-lenFrac*C).toFixed(2)+'" stroke-dashoffset="'+(-startFrac*C).toFixed(2)+'" transform="rotate(-90 '+cx+' '+cy+')"></circle>'; }

function activityRings(rec){
  var es=effSteps(rec);
  var steps=es.steps;
  var mins=rec&&rec.walk?num(rec.walk.minutes):null;
  var sleep=rec&&rec.sleep?num(rec.sleep.hours):null;
  var mealCount=0; if(rec&&rec.meals){ ['breakfast','lunch','dinner','snack'].forEach(function(k){ if(rec.meals[k]&&String(rec.meals[k]).trim()) mealCount++; }); }
  var rings=[{label:'Adım',val:steps,goal:8000,color:'#E9899F',unit:''},{label:'Hareket',val:mins,goal:30,color:'#8FBF8A',unit:' dk'},{label:'Uyku',val:sleep,goal:7.5,color:'#9B7FC9',unit:' sa'}];
  var size=120,cx=60,cy=60,radii=[50,38,26],w=10;
  var svg='<svg width="'+size+'" height="'+size+'" viewBox="0 0 '+size+' '+size+'">';
  rings.forEach(function(r,i){ var R=radii[i],C=2*Math.PI*R,f=Math.max(0,Math.min(1,(r.val||0)/r.goal));
    svg+='<circle cx="'+cx+'" cy="'+cy+'" r="'+R+'" fill="none" stroke="rgba(150,110,120,0.14)" stroke-width="'+w+'"></circle>';
    svg+='<circle cx="'+cx+'" cy="'+cy+'" r="'+R+'" fill="none" stroke="'+r.color+'" stroke-width="'+w+'" stroke-linecap="round" stroke-dasharray="'+C.toFixed(2)+'" stroke-dashoffset="'+(C*(1-f)).toFixed(2)+'" transform="rotate(-90 '+cx+' '+cy+')" style="transition:stroke-dashoffset .6s ease"></circle>';
  });
  svg+='</svg>';
  var legend='<div style="flex:1;display:flex;flex-direction:column;gap:8px;">';
  rings.forEach(function(r){ legend+='<div style="display:flex;align-items:center;gap:8px;font-size:13px;"><span style="width:10px;height:10px;border-radius:50%;background:'+r.color+';display:inline-block;flex-shrink:0;"></span><span style="color:var(--muted);">'+r.label+'</span><b style="margin-left:auto;color:var(--text);font-variant-numeric:tabular-nums;">'+(r.val!=null?r.val+r.unit:'—')+'</b></div>'; });
  legend+='<div style="font-size:11px;color:var(--faint);margin-top:2px;">'+mealCount+'/4 öğün · '+dayNutrition(rec).protein+'g protein</div>';
  if(es.source==='tracked'){ var dm=dayMovement(rec); legend+='<div style="font-size:10.5px;color:var(--faint);line-height:1.4;display:flex;align-items:flex-start;gap:4px;">'+icon('footprints',12)+' <span>Adım, konum takibinden tahmini ('+fmtDist(dm.walk)+' yürüyüş). Elle girersen o geçerli olur.</span></div>'; }
  legend+='</div>';
  return '<div class="glass" style="border-radius:22px;padding:16px;display:flex;align-items:center;gap:16px;"><div style="flex-shrink:0;">'+svg+'</div>'+legend+'</div>';
}

function sparkCard(){
  var today=todayStr(); var arr=[]; for(var i=6;i>=0;i--){ var dd=addDays(today,-i); var rec=data.days[dd]; arr.push({d:dd,steps:effSteps(rec).steps,sleep:rec&&rec.sleep?num(rec.sleep.hours):null}); }
  var maxS=Math.max.apply(null,[8000].concat(arr.map(function(a){return a.steps||0;})));
  var maxSl=Math.max.apply(null,[8].concat(arr.map(function(a){return a.sleep||0;})));
  var h='<div class="glass" style="border-radius:22px;padding:16px;display:flex;flex-direction:column;gap:12px;"><div style="font-size:15.5px;font-weight:700;display:flex;align-items:center;gap:6px;">Son 7 gün '+icon('trending-up',16)+'</div>';
  h+='<div><div style="font-size:12px;color:var(--muted);margin-bottom:6px;">Adım</div><div style="display:flex;align-items:flex-end;gap:5px;height:46px;">';
  arr.forEach(function(a){ var hh=a.steps?Math.max(6,Math.round(a.steps/maxS*46)):3; h+='<div style="flex:1;display:flex;flex-direction:column;justify-content:flex-end;height:46px;"><div style="height:'+hh+'px;border-radius:5px;background:linear-gradient(180deg,#E9899F,#C9B8FF);opacity:'+(a.steps?1:0.3)+';"></div></div>'; });
  h+='</div></div>';
  h+='<div><div style="font-size:12px;color:var(--muted);margin-bottom:6px;">Uyku (saat)</div><div style="display:flex;align-items:flex-end;gap:5px;height:46px;">';
  arr.forEach(function(a){ var hh=a.sleep?Math.max(6,Math.round(a.sleep/maxSl*46)):3; h+='<div style="flex:1;display:flex;flex-direction:column;justify-content:flex-end;height:46px;"><div style="height:'+hh+'px;border-radius:5px;background:linear-gradient(180deg,#9B7FC9,#B8A0E0);opacity:'+(a.sleep?1:0.3)+';"></div></div>'; });
  h+='</div></div>';
  h+='<div style="display:flex;gap:5px;">'; arr.forEach(function(a){ h+='<div style="flex:1;text-align:center;font-size:10px;color:var(--faint);">'+a.d.slice(8)+'</div>'; }); h+='</div>';
  h+='</div>';
  return h;
}

function sleepReadiness(rec){
  var sl=rec&&rec.sleep?rec.sleep:{};
  var rd=readingStats(rec);
  // 1) Uyku süresi (yetişkin hedefi ~7.5-8.5 sa) — maks 26
  var hours=num(sl.hours), fDur=0;
  if(hours!=null){ fDur=Math.round(26*Math.max(0,Math.min(1,1-Math.abs(hours-7.75)/3))); }
  // 2) Öznel kalite — maks 18
  var fQual=sl.quality==='good'?18:(sl.quality==='ok'?10:(sl.quality==='bad'?3:0));
  // 3) Kafein zamanlaması (bedtime kalıntı + cut-off uyumu) — maks 18
  var residue=caffeineResidueAt(rec,caffeineTargetBed());
  var timingOk=caffeineTimingOk(rec);
  var lastCaf=caffeineLastTime(rec);
  var hasCaf=caffeineDrinks(rec).length>0;
  var fCaf=0;
  if(!hasCaf){ fCaf=18; }
  else if(residue<CAFFEINE_SLEEP_SAFE_MG&&timingOk){ fCaf=18; }
  else if(residue<CAFFEINE_SLEEP_SAFE_MG){ fCaf=12; }
  else if(residue<100){ fCaf=8; }
  else { fCaf=3; }
  // 4) Okuma (ekran yerine sayfa) — maks 16
  var fReading=rd.count>0?Math.min(16,8+Math.min(8,rd.pages)):0;
  // 5) Wind-down hijyeni (light/breath/dump/cool) — maks 14
  var wdSteps=(sl.windDown&&Array.isArray(sl.windDown.steps))?sl.windDown.steps:[];
  var wdDone=wdSteps.reduce(function(a,s){ return a+(s&&s.done?1:0); },0);
  var fWind=Math.round(14*Math.min(1,wdDone/Math.max(1,WIND_DOWN_STEPS.length)));
  // 6) İlaçsızlık — maks 8
  var medType=(sl.med&&sl.med.type)?sl.med.type:null;
  var fMed=medType==='none'?8:(medType==='herbal'?5:(medType==='rx'?2:4));
  var factors={duration:fDur,quality:fQual,caffeine:fCaf,reading:fReading,winddown:fWind,medication:fMed};
  var score=Math.round(fDur+fQual+fCaf+fReading+fWind+fMed);
  score=Math.max(0,Math.min(100,score));
  var tier='Rahat';
  if(score>=85) tier='Mükemmel';
  else if(score>=70) tier='Güçlü';
  else if(score>=55) tier='Dengeli';
  return {score:score,tier:tier,readingCount:rd.count,readingPages:rd.pages,factors:factors,medType:medType,residue:residue,timingOk:timingOk,lastCaf:lastCaf,hasCaf:hasCaf,wdDone:wdDone};
}

function medFreeBadge(){
  var s=medFreeStreak();
  if(s<1) return '';
  return '<div style="display:flex;align-items:center;gap:10px;background:linear-gradient(135deg,rgba(143,191,138,0.22),rgba(155,127,201,0.16));border:1px solid rgba(143,191,138,0.4);border-radius:14px;padding:11px 13px;"><span style="color:#6E9C6A;display:inline-flex;">'+icon('moon',22)+'</span><div style="flex:1;min-width:0;"><div style="font-size:14px;font-weight:800;color:var(--text);">'+s+' gecedir ilaçsız</div><div style="font-size:11.5px;color:var(--muted);line-height:1.35;">'+(s>=7?'Bir haftayı geçtin — beden kendi sistemini öğreniyor.':'Hedef: uyku ilacına ihtiyacı azaltmak. Düzenli uyku hijyeni bunu büyütür.')+'</div></div></div>';
}
// Premium dairesel gauge (SVG halka + ortada değer). BMI/kafein/uyku-skoru için ortak.
function gaugeBadge(pct,color,big,small,size){
  size=size||92; pct=Math.max(0,Math.min(100,Number(pct)||0));
  var sw=Math.round(size*0.095), r=(size-sw)/2, c=2*Math.PI*r, off=c*(1-pct/100), cx=size/2;
  var s='<div style="position:relative;width:'+size+'px;height:'+size+'px;flex-shrink:0;">';
  s+='<svg viewBox="0 0 '+size+' '+size+'" width="'+size+'" height="'+size+'" style="transform:rotate(-90deg);display:block;">';
  s+='<circle cx="'+cx+'" cy="'+cx+'" r="'+r+'" fill="none" stroke="rgba(130,110,160,0.16)" stroke-width="'+sw+'"/>';
  s+='<circle cx="'+cx+'" cy="'+cx+'" r="'+r+'" fill="none" stroke="'+color+'" stroke-width="'+sw+'" stroke-linecap="round" stroke-dasharray="'+c.toFixed(1)+'" stroke-dashoffset="'+off.toFixed(1)+'" style="transition:stroke-dashoffset .55s var(--ease-premium,ease);"/>';
  s+='</svg>';
  s+='<div style="position:absolute;inset:0;display:flex;flex-direction:column;align-items:center;justify-content:center;gap:0;"><div style="font-size:'+(size>=88?'21px':'17px')+';font-weight:800;color:var(--text);line-height:1;">'+big+'</div>'+(small?'<div style="font-size:9.5px;color:var(--faint);font-weight:700;letter-spacing:.2px;margin-top:2px;">'+small+'</div>':'')+'</div>';
  s+='</div>';
  return s;
}
// Kafein metabolizma eğrisi: içimlerden yatma saatine dek vücuttaki kafein (yarı ömür decay),
// 50 mg güvenli-uyku eşiği (kesikli yeşil) ve yatma çizgisiyle.
function caffeineCurveSVG(rec,bed){
  var ds=caffeineDrinks(rec).map(function(d){ var ty=caffeineType(d&&d.type); var t=hhmmToMin(d&&d.time); if(!ty||t==null) return null; return {t:t,mg:ty.mg*Math.max(1,Number(d.qty)||1)}; }).filter(Boolean);
  if(!ds.length) return '';
  var bedMin=hhmmToMin(bed); if(bedMin==null) bedMin=hhmmToMin(CAFFEINE_DEFAULT_BED);
  var startMin=Math.min.apply(null,ds.map(function(d){return d.t;}));
  var endMin=bedMin; if(endMin<=startMin) endMin+=1440;
  var span=Math.max(90,endMin-startMin);
  var N=48, W=100, H=44, pad=3;
  var loadAt=function(m){ var s=0; ds.forEach(function(d){ var dt=(m-d.t)/60; if(dt<0) return; s+=d.mg*Math.pow(0.5,dt/CAFFEINE_HALFLIFE_H); }); return s; };
  var peak=0, samples=[];
  for(var i=0;i<=N;i++){ var m=startMin+span*i/N; var v=loadAt(m); if(v>peak)peak=v; samples.push([i/N,v]); }
  peak=Math.max(peak,60);
  var pts=samples.map(function(p){ var x=pad+p[0]*(W-2*pad); var y=(H-pad)-(p[1]/peak)*(H-2*pad); return x.toFixed(1)+','+y.toFixed(1); }).join(' ');
  var safeY=(H-pad)-(CAFFEINE_SLEEP_SAFE_MG/peak)*(H-2*pad);
  var col='#8A5A2B', bedX=(W-pad).toFixed(1);
  var s='<svg viewBox="0 0 '+W+' '+H+'" preserveAspectRatio="none" width="100%" height="'+H+'" style="display:block;">';
  s+='<defs><linearGradient id="cafFill" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="'+col+'" stop-opacity="0.30"/><stop offset="1" stop-color="'+col+'" stop-opacity="0"/></linearGradient></defs>';
  if(safeY>pad&&safeY<H-pad) s+='<line x1="'+pad+'" y1="'+safeY.toFixed(1)+'" x2="'+(W-pad)+'" y2="'+safeY.toFixed(1)+'" stroke="#5BA85B" stroke-width="0.7" stroke-dasharray="2 2" opacity="0.75"/>';
  s+='<polygon points="'+pad+','+(H-pad)+' '+pts+' '+(W-pad)+','+(H-pad)+'" fill="url(#cafFill)"/>';
  s+='<polyline points="'+pts+'" fill="none" stroke="'+col+'" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round"/>';
  s+='<line x1="'+bedX+'" y1="'+pad+'" x2="'+bedX+'" y2="'+(H-pad)+'" stroke="var(--muted)" stroke-width="0.7" stroke-dasharray="1.5 1.5" opacity="0.55"/>';
  s+='</svg>';
  return s;
}
function caffeineBlock(rec){
  var drinks=caffeineDrinks(rec);
  var total=caffeineTotalMg(rec), limit=caffeineLimit(), mode=caffeineMode();
  var maxSingle=caffeineMaxSingle(rec), lastCaf=caffeineLastTime(rec);
  var bed=caffeineTargetBed(), cut=caffeineCutoffTime(bed);
  var residue=caffeineResidueAt(rec,bed), timingOk=caffeineTimingOk(rec);
  var pct=Math.min(100,Math.round(total/limit*100));
  var barCol=pct<60?'#5BA85B':(pct<=90?'#E0A93C':'#E25B6A');
  var resCol=residue<CAFFEINE_SLEEP_SAFE_MG?'#5BA85B':(residue<100?'#E0A93C':'#E25B6A');
  var modeLbl={standard:'Standart',sensitive:'Hassas',pregnant:'Gebe'}[mode]||'Standart';
  var A='#8A5A2B';
  var h='';
  h+='<div style="display:flex;gap:14px;align-items:center;background:linear-gradient(135deg,color-mix(in srgb,'+A+' 9%, var(--card)),var(--card));border:1px solid var(--card-bd);border-radius:16px;padding:13px 14px;">';
  h+=gaugeBadge(pct,barCol,total,'/ '+limit+' mg',92);
  h+='<div style="flex:1;min-width:0;display:flex;flex-direction:column;gap:6px;">';
  h+='<div style="display:flex;justify-content:space-between;align-items:baseline;gap:8px;"><span style="font-size:11px;color:var(--faint);">Günlük toplam</span><span style="font-size:11px;font-weight:800;color:'+barCol+';">%'+pct+' · '+modeLbl+'</span></div>';
  h+='<div style="display:flex;justify-content:space-between;align-items:baseline;gap:8px;"><span style="font-size:11px;color:var(--faint);">Yatakta kalıntı</span><span style="font-size:13px;font-weight:800;color:'+resCol+';">'+residue+' mg</span></div>';
  h+='<div style="display:flex;justify-content:space-between;align-items:baseline;gap:8px;"><span style="font-size:11px;color:var(--faint);">Son kahve · kesim</span><span style="font-size:11.5px;font-weight:700;color:'+(timingOk?'var(--text2)':'#C2803A')+';">'+(lastCaf||'—')+' · '+(cut||'—')+'</span></div>';
  h+='</div></div>';
  var curve=caffeineCurveSVG(rec,bed);
  if(curve){ h+='<div style="background:var(--card);border:1px solid var(--card-bd);border-radius:14px;padding:10px 12px 8px;"><div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:5px;"><span style="font-size:10px;font-weight:800;letter-spacing:.3px;color:var(--muted);">METABOLİZMA · YATANA KADAR</span><span style="font-size:9px;color:#5BA85B;display:inline-flex;align-items:center;gap:3px;"><span style="width:12px;border-top:1.4px dashed #5BA85B;display:inline-block;"></span>50 mg eşik</span></div>'+curve+'</div>'; }
  h+='<div style="display:flex;flex-wrap:wrap;gap:5px;">';
  CAFFEINE_TYPES.forEach(function(t){ h+='<button onclick="App.addCaffeineDrink(\''+t.id+'\')" style="border:1px solid var(--field-bd);background:var(--card);border-radius:999px;padding:6px 11px;font-size:11.5px;font-weight:700;color:var(--text);cursor:pointer;display:inline-flex;align-items:center;gap:4px;">+ '+t.label+' <span style="color:var(--faint);font-weight:500;">'+t.mg+'mg</span></button>'; });
  h+='</div>';
  if(drinks.length){
    h+='<div style="display:flex;flex-direction:column;gap:5px;">';
    drinks.forEach(function(d,i){ var ty=caffeineType(d.type); var mg=ty?ty.mg*Math.max(1,Number(d.qty)||1):0; h+='<div style="display:flex;align-items:center;gap:8px;background:var(--card);border:1px solid var(--card-bd);border-radius:11px;padding:7px 10px;"><span style="display:inline-flex;color:'+A+';">'+icon('coffee',14)+'</span><div style="flex:1;min-width:0;"><div style="font-size:12.5px;font-weight:700;color:var(--text);">'+(ty?ty.label:d.type)+' · <span style="color:var(--faint);font-weight:500;">'+Math.round(mg)+' mg</span></div><div style="display:flex;align-items:center;gap:5px;margin-top:3px;"><input type="time" value="'+esc(d.time||'')+'" onchange="App.setCaffeineDrinkTime('+i+',this)" style="border:1px solid var(--field-bd);background:var(--field);border-radius:8px;padding:3px 6px;font-size:12px;color:var(--text);outline:none;">'+(d.qty>1?('<span style="font-size:11px;color:var(--faint);">×'+d.qty+'</span>'):'')+'</div></div><button onclick="App.removeCaffeineDrink('+i+')" style="border:none;background:transparent;color:#E25B6A;cursor:pointer;font-size:16px;font-weight:800;padding:4px;">×</button></div>'; });
    h+='</div>';
  } else {
    h+='<div style="font-size:11.5px;color:var(--faint);background:var(--card);border:1px dashed var(--card-bd);border-radius:11px;padding:9px 11px;">Bugün henüz kafein eklenmedi. Yukarıdaki chip\'lerden başlat — mg, kalıntı ve eğri otomatik hesaplanır.</div>';
  }
  h+='<div style="display:flex;gap:8px;flex-wrap:wrap;align-items:center;">';
  h+='<span style="font-size:10.5px;color:var(--faint);">Profil:</span>';
  [['standard','Standart 400'],['sensitive','Hassas 300'],['pregnant','Gebe 200']].forEach(function(m){ var on=mode===m[0]; h+='<button onclick="App.setCaffeineMode(\''+m[0]+'\')" style="border:1px solid '+(on?A:'var(--field-bd)')+';background:'+(on?'color-mix(in srgb,'+A+' 12%, var(--field))':'var(--field)')+';color:'+(on?A:'var(--muted)')+';border-radius:999px;padding:4px 10px;font-size:10.5px;font-weight:700;cursor:pointer;">'+m[1]+'</button>'; });
  h+='<div style="margin-left:auto;display:flex;align-items:center;gap:5px;"><span style="font-size:10.5px;color:var(--faint);">Yatma</span><input type="time" value="'+esc(bed)+'" onchange="App.setTargetBed(this)" style="border:1px solid var(--field-bd);background:var(--field);border-radius:8px;padding:4px 7px;font-size:12px;color:var(--text);outline:none;"></div>';
  h+='</div>';
  if(total>limit){ h+='<div style="font-size:11px;color:#C2453A;background:rgba(226,91,106,0.12);border:1px solid rgba(226,91,106,0.35);border-radius:10px;padding:7px 10px;line-height:1.4;">Günlük limit aşıldı ('+total+'/'+limit+' mg). EFSA & FDA yetişkin üst sınırı '+limit+' mg.</div>'; }
  if(maxSingle>CAFFEINE_SINGLE_DOSE){ h+='<div style="font-size:11px;color:#9A6A2A;background:rgba(255,210,130,0.18);border:1px solid rgba(220,170,80,0.35);border-radius:10px;padding:7px 10px;line-height:1.4;">Tek doz '+maxSingle+' mg — EFSA güvenli tek doz 200 mg. Aralara zaman koy.</div>'; }
  if(lastCaf&&!timingOk){ h+='<div style="font-size:11px;color:#9A6A2A;line-height:1.4;display:flex;gap:5px;"><span style="flex-shrink:0;">'+icon('clock',12)+'</span><span>Son kahve '+lastCaf+' — önerilen kesim '+cut+' (yatmadan '+CAFFEINE_CUTOFF_H+' sa önce). Bu saat uykuya geçişi zorlaştırabilir.</span></div>'; }
  h+='<div style="font-size:9.5px;color:var(--faint);line-height:1.4;">Kaynak: EFSA 2015 kafein paneli · FDA · yarı ömür ~'+CAFFEINE_HALFLIFE_H+' sa. mg ortalama serving başına.</div>';
  return collapsibleCardHTML({key:'h-caffeine', icon:icon('coffee',18), accent:A, title:'Kafein', subtitle:'Bilimsel takip · mg · yarı ömür · uyku', badge:hBadge(total+' mg',barCol), open:cardOpen('h-caffeine'), body:h, hint:'kafein takibini aç'});
}
CARD_BUILDERS['h-caffeine']=caffeineBlock;
// Uykuya dalma hazırlığı — bağımsız premium kart (skor gauge + 6 faktör + bilimsel ipucu).
function sleepPrepCard(rec){
  var readiness=sleepReadiness(rec);
  var scoreCol=readiness.score>=85?'#6E9C6A':(readiness.score>=70?'#9B7FC9':(readiness.score>=55?'#E0A93C':'#E28A6A'));
  var A='#9B7FC9';
  var h='';
  h+='<div style="display:flex;gap:14px;align-items:center;background:linear-gradient(135deg,color-mix(in srgb,'+A+' 11%, var(--card)),var(--card));border:1px solid var(--card-bd);border-radius:16px;padding:13px 14px;">';
  h+=gaugeBadge(readiness.score,scoreCol,readiness.score,'/ 100',92);
  h+='<div style="flex:1;min-width:0;display:flex;flex-direction:column;gap:4px;">';
  h+='<div style="font-size:17px;font-weight:800;color:'+scoreCol+';line-height:1.1;">'+readiness.tier+'</div>';
  var rdChip=readiness.readingCount>0?(readiness.readingCount+' kitap · '+readiness.readingPages+' sayfa'):'okuma yok';
  h+='<div style="font-size:11.5px;color:var(--muted);">Bugün: '+rdChip+'</div>';
  if(readiness.hasCaf){ var resCol2=readiness.residue<CAFFEINE_SLEEP_SAFE_MG?'#5BA85B':(readiness.residue<100?'#E0A93C':'#E25B6A'); h+='<div style="font-size:11px;color:var(--faint);">Kafein kalıntısı <b style="color:'+resCol2+';">'+readiness.residue+' mg</b> · son '+(readiness.lastCaf||'—')+'</div>'; }
  h+='</div></div>';
  var rf=readiness.factors||{};
  var fdefs=[['Uyku süresi',rf.duration||0,26],['Kalite',rf.quality||0,18],['Kafein',rf.caffeine||0,18],['Okuma',rf.reading||0,16],['Wind-down',rf.winddown||0,14],['İlaçsızlık',rf.medication||0,8]];
  h+='<div style="display:flex;flex-direction:column;gap:7px;background:var(--card);border:1px solid var(--card-bd);border-radius:14px;padding:11px 12px;">';
  fdefs.forEach(function(f){ var fp=Math.round(f[1]/f[2]*100); var bc=fp>=80?'#6E9C6A':(fp>=50?A:'#E0A93C'); h+='<div style="display:flex;align-items:center;gap:9px;"><div style="font-size:11px;font-weight:600;color:var(--muted);width:86px;flex-shrink:0;">'+f[0]+'</div><div style="flex:1;height:7px;border-radius:999px;background:color-mix(in srgb,'+A+' 12%, var(--icon));overflow:hidden;"><div style="height:100%;width:'+fp+'%;background:linear-gradient(90deg,'+bc+',color-mix(in srgb,'+bc+' 55%, #E9AFC1));border-radius:999px;transition:width .4s;"></div></div><div style="font-size:10.5px;font-weight:700;color:var(--faint);width:32px;text-align:right;flex-shrink:0;">'+f[1]+'/'+f[2]+'</div></div>'; });
  h+='</div>';
  var srTip=!readiness.hasCaf?'Kafeinsiz gün uykuyu kolaylaştırır.':(readiness.residue<CAFFEINE_SLEEP_SAFE_MG?'Kafein temiz — uykuya hazırsın.':'Son kahveyi erkene çek, yarı ömür ~'+CAFFEINE_HALFLIFE_H+' sa.');
  h+='<div style="display:flex;gap:8px;align-items:flex-start;background:color-mix(in srgb,'+A+' 9%, var(--card));border:1px solid color-mix(in srgb,'+A+' 24%, var(--card-bd));border-radius:12px;padding:10px 12px;"><span style="flex-shrink:0;color:'+A+';display:inline-flex;margin-top:1px;">'+icon('brain',15)+'</span><div style="font-size:11.5px;line-height:1.5;color:var(--text2);"><b>Bu gece:</b> '+srTip+' <span style="color:var(--faint);">Kaynak EFSA/FDA.</span></div></div>';
  var rdEntries=readingStats(rec).entries;
  if(rdEntries.length>0){
    h+='<div style="display:flex;flex-direction:column;gap:6px;background:var(--card);border:1px solid var(--card-bd);border-radius:14px;padding:10px 11px;">';
    h+='<div style="font-size:10.5px;letter-spacing:.4px;font-weight:800;color:var(--muted);">BUGÜN OKUDUKLARIM</div>';
    rdEntries.forEach(function(e){ var meta=[]; if(e.pages) meta.push(e.pages+' sayfa'); if(e.minutes) meta.push(e.minutes+' dk'); h+='<div style="display:flex;align-items:center;gap:8px;"><span style="display:inline-flex;color:'+A+';">'+icon('book-open',14)+'</span><div style="flex:1;min-width:0;"><div style="font-size:12.5px;font-weight:700;color:var(--text);white-space:nowrap;overflow:hidden;text-overflow:ellipsis;">'+esc(e.title||'(başlıksız)')+(e.author?' <span style=\"font-weight:500;color:var(--faint);\">· '+esc(e.author)+'</span>':'')+'</div>'+(meta.length?'<div style="font-size:11px;color:var(--faint);">'+meta.join(' · ')+'</div>':'')+'</div></div>'; });
    h+='</div>';
  }
  h+='<button onclick="App.openReading()" style="border:1px solid color-mix(in srgb,'+A+' 35%, var(--field-bd));cursor:pointer;padding:11px;border-radius:14px;font-size:13.5px;font-weight:800;color:'+A+';background:color-mix(in srgb,'+A+' 8%, var(--field));display:flex;align-items:center;justify-content:center;gap:7px;">'+icon('book-open',15)+' Okuma ekle</button>';
  return collapsibleCardHTML({key:'h-sleepprep', icon:icon('moon',18), accent:A, title:'Uykuya Dalma Hazırlığı', subtitle:'6 faktör · bilimsel skor', badge:hBadge(readiness.score+' / 100',scoreCol), open:cardOpen('h-sleepprep'), body:h, hint:'hazırlık skorunu aç'});
}
CARD_BUILDERS['h-sleepprep']=sleepPrepCard;

// ---- Vücut ölçüleri (kilo geçmişi + haftalık tartım önerisi + tek-seferlik boy + BMI) ----
function bodyData(){ if(!data.body||typeof data.body!=='object') data.body={heightCm:null,heightSetAt:null,weights:[]}; if(!Array.isArray(data.body.weights)) data.body.weights=[]; return data.body; }
function lastWeight(){ var w=bodyData().weights; return w.length?w[w.length-1]:null; }
function weightRefMs(){ var w=bodyData().weights; var ref=w.length?new Date(w[w.length-1].ts).getTime():new Date((data.startDate||todayStr())+'T00:00:00').getTime(); return isNaN(ref)?Date.now():ref; }
function weightWeekReady(){ return (Date.now()-weightRefMs())>=7*24*3600*1000; }
function nextWeightInDays(){ var d=Math.ceil((weightRefMs()+7*24*3600*1000-Date.now())/(24*3600*1000)); return Math.max(0,d); }
function bmiFor(kg,cm){ if(!kg||!cm) return null; var m=cm/100; if(m<=0) return null; return kg/(m*m); }
function bmiCat(bmi){ if(bmi==null) return null; if(bmi<18.5) return {label:'Zayıf',col:'#E0A93C'}; if(bmi<25) return {label:'Normal',col:'#6E9C6A'}; if(bmi<30) return {label:'Fazla kilolu',col:'#E0A93C'}; return {label:'Obez',col:'#E28A6A'}; }
function bodyCard(rec){
  var b=bodyData(), lw=lastWeight(), A='#7BA7D0';
  var h='';
  var bmi=(b.heightCm&&lw)?bmiFor(lw.kg,b.heightCm):null, cat=bmiCat(bmi);
  if(bmi!=null){
    var bmiPct=Math.max(0,Math.min(100,(bmi-14)/(38-14)*100));
    h+='<div style="display:flex;gap:14px;align-items:center;background:linear-gradient(135deg,color-mix(in srgb,'+A+' 10%, var(--card)),var(--card));border:1px solid var(--card-bd);border-radius:16px;padding:13px 14px;">';
    h+=gaugeBadge(bmiPct,cat.col,(Math.round(bmi*10)/10).toFixed(1),'BMI',92);
    h+='<div style="flex:1;min-width:0;display:flex;flex-direction:column;gap:4px;">';
    h+='<div style="font-size:16px;font-weight:800;color:'+cat.col+';line-height:1.1;">'+cat.label+'</div>';
    h+='<div style="font-size:11.5px;color:var(--muted);">Boy '+b.heightCm+' cm · Kilo '+lw.kg+' kg</div>';
    h+='<div style="font-size:10px;color:var(--faint);line-height:1.4;">BMI bilgi amaçlıdır; kas/kemik oranını ayırmaz, tıbbi teşhis değildir.</div>';
    h+='</div></div>';
  }
  if(b.heightCm==null||ui.heightEdit){
    h+='<div style="background:color-mix(in srgb,'+A+' 8%, var(--card));border:1px solid color-mix(in srgb,'+A+' 26%, var(--card-bd));border-radius:14px;padding:12px;display:flex;flex-direction:column;gap:9px;">';
    h+='<div style="display:flex;gap:7px;align-items:flex-start;"><span style="flex-shrink:0;color:'+A+';display:inline-flex;margin-top:1px;">'+icon('ruler',15)+'</span><div style="font-size:12px;line-height:1.5;color:var(--text2);"><b>Boyunu bir kez giriyoruz</b> 📏 — BMI için. Tek seferlik; sonra buradan güncelleyebilirsin.</div></div>';
    h+='<div style="display:flex;gap:8px;align-items:center;"><input id="sey-height-input" type="number" inputmode="decimal" min="80" max="250" value="'+(b.heightCm!=null?esc(b.heightCm):'')+'" placeholder="168" style="flex:1;min-width:0;border:1px solid var(--field-bd);background:var(--field);border-radius:12px;padding:11px;font-size:16px;outline:none;text-align:center;"><span style="font-size:13px;color:var(--muted);">cm</span><button onclick="App.setHeight()" style="border:none;cursor:pointer;background:linear-gradient(135deg,'+A+',#9BC7EC);color:#fff;font-weight:800;font-size:14px;padding:11px 16px;border-radius:12px;">Kaydet</button></div>';
    h+='</div>';
  } else {
    h+='<div style="display:flex;align-items:center;gap:8px;font-size:12.5px;color:var(--muted);"><span style="display:inline-flex;color:'+A+';">'+icon('ruler',14)+'</span>Boy <b style="color:var(--text);">'+b.heightCm+' cm</b><button onclick="App.editHeight()" style="margin-left:auto;border:none;background:transparent;color:'+A+';cursor:pointer;font-size:12px;font-weight:800;text-decoration:underline;text-underline-offset:2px;">düzenle</button></div>';
  }
  var ready=weightWeekReady(), nextD=nextWeightInDays();
  h+='<div style="background:linear-gradient(135deg,color-mix(in srgb,'+A+' 12%, var(--card)),var(--card));border:1px solid color-mix(in srgb,'+A+' 30%, var(--card-bd));border-radius:14px;padding:12px;display:flex;flex-direction:column;gap:9px;">';
  h+='<div style="display:flex;gap:8px;align-items:flex-start;"><span style="flex-shrink:0;color:'+A+';display:inline-flex;margin-top:1px;">'+icon(ready?'sparkles':'calendar',15)+'</span><div style="font-size:12px;line-height:1.45;color:var(--muted);">'+(ready?'<b style="color:var(--text);">Haftalık tartım zamanı geldi.</b> Aynı saat ve benzer koşullarda ölçmek eğilimi daha doğru gösterir.':'İstersen şimdi de kilo girebilirsin. Daha sağlıklı bir eğilim için <b style="color:var(--text2);">haftada bir, benzer koşullarda tartılmanı</b> öneriyoruz · '+nextD+' gün sonra haftalık ölçüm zamanı.')+'</div></div>';
  h+='<div style="display:flex;gap:8px;align-items:center;"><input id="sey-weight-input" type="number" inputmode="decimal" step="0.1" min="20" max="400" placeholder="'+(lw?esc(lw.kg):'62.5')+'" aria-label="Kilo" style="flex:1;min-width:0;border:1px solid var(--field-bd);background:var(--field);border-radius:12px;padding:11px;font-size:16px;outline:none;text-align:center;"><span style="font-size:13px;color:var(--muted);">kg</span><button onclick="App.addWeight()" style="border:none;cursor:pointer;background:linear-gradient(135deg,'+A+',#9BC7EC);color:#fff;font-weight:800;font-size:14px;padding:11px 16px;border-radius:12px;">Kaydet</button></div>';
  h+='</div>';
  if(b.weights.length){
    var ws=b.weights.slice(-8), vals=ws.map(function(w){return w.kg;});
    var mn=Math.min.apply(null,vals), mx=Math.max.apply(null,vals), rng=Math.max(0.5,mx-mn);
    var delta=ws.length>=2?(ws[ws.length-1].kg-ws[ws.length-2].kg):0;
    var dCol=delta<0?'#6E9C6A':(delta>0?'#E28A6A':'var(--faint)');
    h+='<div style="background:var(--card);border:1px solid var(--card-bd);border-radius:14px;padding:11px 12px;display:flex;flex-direction:column;gap:8px;">';
    h+='<div style="display:flex;justify-content:space-between;align-items:baseline;"><span style="font-size:10.5px;font-weight:800;letter-spacing:.3px;color:var(--muted);">KİLO TRENDİ</span>'+(ws.length>=2?'<span style="font-size:11px;font-weight:800;color:'+dCol+';">'+(delta>0?'+':'')+(Math.round(delta*10)/10)+' kg</span>':'')+'</div>';
    h+='<div style="display:flex;align-items:flex-end;gap:5px;height:40px;">';
    ws.forEach(function(w){ var hh=Math.round(8+((w.kg-mn)/rng)*30); h+='<div style="flex:1;display:flex;flex-direction:column;justify-content:flex-end;height:40px;"><div style="height:'+hh+'px;border-radius:5px;background:linear-gradient(180deg,'+A+',#9BC7EC);"></div></div>'; });
    h+='</div>';
    h+='<div style="display:flex;gap:5px;">'+ws.map(function(w){ return '<span style="flex:1;text-align:center;font-size:9.5px;color:var(--faint);">'+new Date(w.ts).toLocaleDateString('tr-TR',{day:'2-digit',month:'2-digit'})+'</span>'; }).join('')+'</div>';
    h+='</div>';
  }
  return collapsibleCardHTML({key:'h-body', icon:icon('activity',18), accent:A, title:'Vücut Ölçüleri', subtitle:'Kilo · haftalık tartım önerisi · boy · BMI', badge:(bmi!=null?hBadge((Math.round(bmi*10)/10).toFixed(1)+' BMI',cat.col):(lw?hBadge(lw.kg+' kg',A):'')), open:cardOpen('h-body'), body:h, hint:'ölçüleri aç'});
}
CARD_BUILDERS['h-body']=bodyCard;
// ---- Kan/idrar tahlili — PDF + çoklu foto yükleme (data/aeon-media/<id>.json), panele iletilir ----
function labCard(){
  var A='#4FA8A0', results=Array.isArray(data.labResults)?data.labResults:[], connected=!!ghCfgApp();
  var h='';
  h+='<div style="font-size:12px;line-height:1.5;color:var(--text2);">İstersen kan/idrar tahlili sonuçlarını ekle — ÆON panelinde görünür ve incelenir. Belgeler gizli veri deposunda tutulur, uygulama arayüzüne yazılmaz.</div>';
  h+='<input type="file" id="sey-lab-blood" accept="application/pdf,image/*" multiple style="display:none;" onchange="App.labFilesChosen(\'blood\',this)">';
  h+='<input type="file" id="sey-lab-urine" accept="application/pdf,image/*" multiple style="display:none;" onchange="App.labFilesChosen(\'urine\',this)">';
  if(!connected){
    h+='<div style="display:flex;gap:8px;align-items:center;background:rgba(226,91,106,0.10);border:1px solid rgba(226,91,106,0.3);border-radius:12px;padding:10px 12px;font-size:12px;color:var(--text2);"><span style="display:inline-flex;color:#C2453A;">'+icon('link-2',15)+'</span>Tahlil eklemek için önce Ayarlar\'dan repoya bağlan.</div>';
  } else if(ui.labUploading){
    h+='<div style="display:flex;gap:9px;align-items:center;background:color-mix(in srgb,'+A+' 10%, var(--card));border:1px solid color-mix(in srgb,'+A+' 30%, var(--card-bd));border-radius:12px;padding:12px 13px;font-size:12.5px;font-weight:700;color:var(--text2);"><span style="width:16px;height:16px;border-radius:50%;border:2px solid color-mix(in srgb,'+A+' 30%, transparent);border-top-color:'+A+';display:inline-block;animation:seySpin .7s linear infinite;flex-shrink:0;"></span>Yükleniyor… belge panele iletiliyor.</div>';
  } else {
    h+='<div style="display:flex;gap:8px;">';
    h+='<button onclick="App.pickLab(\'blood\')" style="flex:1;border:1px solid color-mix(in srgb,'+A+' 35%, var(--field-bd));cursor:pointer;background:color-mix(in srgb,'+A+' 8%, var(--field));color:var(--text);font-weight:800;font-size:13px;padding:12px;border-radius:14px;display:flex;flex-direction:column;align-items:center;gap:4px;"><span style="display:inline-flex;color:#E28A6A;">'+icon('droplet',20)+'</span>Kan tahlili</button>';
    h+='<button onclick="App.pickLab(\'urine\')" style="flex:1;border:1px solid color-mix(in srgb,'+A+' 35%, var(--field-bd));cursor:pointer;background:color-mix(in srgb,'+A+' 8%, var(--field));color:var(--text);font-weight:800;font-size:13px;padding:12px;border-radius:14px;display:flex;flex-direction:column;align-items:center;gap:4px;"><span style="display:inline-flex;color:#E0A93C;">'+icon('flask',20)+'</span>İdrar tahlili</button>';
    h+='</div>';
  }
  if(results.length){
    h+='<div style="display:flex;flex-direction:column;gap:7px;">';
    results.slice().reverse().forEach(function(r){
      var kindLbl=r.kind==='blood'?'Kan':'İdrar', kindCol=r.kind==='blood'?'#E28A6A':'#E0A93C';
      var when=r.ts?new Date(r.ts).toLocaleDateString('tr-TR',{day:'2-digit',month:'2-digit',year:'2-digit'}):'';
      var nfiles=Array.isArray(r.files)?r.files.length:0;
      var statusLbl=r.status==='reviewed'?'İncelendi':'Analiz ediliyor', statusCol=r.status==='reviewed'?'#6E9C6A':A;
      h+='<div style="background:var(--card);border:1px solid var(--card-bd);border-radius:13px;padding:10px 12px;display:flex;align-items:center;gap:10px;">';
      h+='<span style="width:30px;height:30px;border-radius:9px;flex-shrink:0;display:inline-flex;align-items:center;justify-content:center;color:'+kindCol+';background:color-mix(in srgb,'+kindCol+' 15%, var(--icon));">'+icon(r.kind==='blood'?'droplet':'flask',15)+'</span>';
      h+='<div style="flex:1;min-width:0;"><div style="font-size:13px;font-weight:800;color:var(--text);">'+kindLbl+' tahlili · <span style="font-weight:600;color:var(--faint);">'+nfiles+' dosya</span></div><div style="font-size:11px;color:var(--faint);">'+when+'</div></div>';
      h+='<span style="flex-shrink:0;font-size:10px;font-weight:800;padding:4px 9px;border-radius:999px;color:'+statusCol+';background:color-mix(in srgb,'+statusCol+' 15%, transparent);border:1px solid color-mix(in srgb,'+statusCol+' 40%, transparent);white-space:nowrap;">'+statusLbl+'</span>';
      h+='</div>';
    });
    h+='</div>';
  }
  return collapsibleCardHTML({key:'h-lab', icon:icon('flask',18), accent:A, title:'Tahliller 🔬', subtitle:'Kan & idrar · PDF veya foto · panele iletilir', badge:(results.length?hBadge(results.length+' kayıt',A):''), open:cardOpen('h-lab'), body:h, hint:'tahlilleri aç'});
}
CARD_BUILDERS['h-lab']=labCard;
App.editHeight=function(){ ui.heightEdit=true; render(); };
App.setHeight=function(){ var el=document.getElementById('sey-height-input'); if(!el) return; var v=parseFloat(String(el.value).replace(',','.')); if(!v||isNaN(v)||v<80||v>250){ toast('Geçerli bir boy gir (80–250 cm)'); return; } var b=bodyData(); b.heightCm=Math.round(v); b.heightSetAt=new Date().toISOString(); ui.heightEdit=false; haptic(16); commit('Boy kaydedildi 📏'); };
App.addWeight=function(){ var el=document.getElementById('sey-weight-input'); if(!el) return; var v=parseFloat(String(el.value).replace(',','.')); if(!v||isNaN(v)||v<20||v>400){ toast('Geçerli bir kilo gir (20–400 kg)'); return; } var b=bodyData(); b.weights.push({ts:new Date().toISOString(),kg:Math.round(v*10)/10}); haptic([14,40,14]); commit('Kilo kaydedildi 🪶 · haftalık düzen yeterli'); };
App.pickLab=function(kind){ if(ui.labUploading) return; if(!ghCfgApp()){ toast('Önce Ayarlar\'dan repoya bağlan'); return; } var el=document.getElementById(kind==='urine'?'sey-lab-urine':'sey-lab-blood'); if(el) el.click(); };
function compressImageFile(file){ return new Promise(function(resolve,reject){ var reader=new FileReader(); reader.onload=function(){ var img=new Image(); img.onload=function(){ var MAXD=1600, w=img.naturalWidth||1, hh=img.naturalHeight||1; var scale=Math.min(1,MAXD/Math.max(w,hh)); var cw=Math.max(1,Math.round(w*scale)), ch=Math.max(1,Math.round(hh*scale)); var cv=document.createElement('canvas'); cv.width=cw; cv.height=ch; cv.getContext('2d').drawImage(img,0,0,cw,ch); var url=cv.toDataURL('image/jpeg',0.75); var c=url.indexOf(','); resolve({b64:c>=0?url.slice(c+1):'',mime:'image/jpeg',w:cw,h:ch}); }; img.onerror=function(){ reject(new Error('görsel okunamadı')); }; img.src=String(reader.result||''); }; reader.onerror=function(){ reject(new Error('dosya okunamadı')); }; reader.readAsDataURL(file); }); }
function readFileB64(file){ return new Promise(function(resolve,reject){ var r=new FileReader(); r.onload=function(){ var url=String(r.result||''); var c=url.indexOf(','); resolve(c>=0?url.slice(c+1):''); }; r.onerror=function(){ reject(new Error('dosya okunamadı')); }; r.readAsDataURL(file); }); }
App.labFilesChosen=function(kind,el){
  var files=el&&el.files?Array.prototype.slice.call(el.files):[]; if(el) el.value='';
  if(!files.length) return;
  if(!ghCfgApp()){ toast('Önce Ayarlar\'dan repoya bağlan'); return; }
  var big=files.filter(function(f){ return f.size>4*1024*1024 && f.type==='application/pdf'; });
  if(big.length){ toast('Bazı PDF\'ler büyük (>4MB) — panelde açılmayabilir',3200); }
  ui.labUploading=true; render();
  var out=[], chain=Promise.resolve();
  files.forEach(function(f){
    chain=chain.then(function(){
      var prep=/^image\//.test(f.type) ? compressImageFile(f) : readFileB64(f).then(function(b64){ return {b64:b64,mime:f.type||'application/pdf'}; });
      return prep.then(function(p){
        if(!p||!p.b64) return;
        var id=aeonMediaId('lab');
        var payload={mime:p.mime,data:p.b64,name:f.name||''}; if(p.w) payload.w=p.w; if(p.h) payload.h=p.h;
        return putAeonMedia(id,payload).then(function(){ out.push({mediaId:id,mime:p.mime,name:f.name||'',w:p.w||null,h:p.h||null}); });
      });
    });
  });
  chain.then(function(){
    if(!out.length){ ui.labUploading=false; render(); toast('Dosya işlenemedi'); return; }
    if(!Array.isArray(data.labResults)) data.labResults=[];
    var lr={id:aeonMediaId('labr'),kind:(kind==='urine'?'urine':'blood'),ts:new Date().toISOString(),note:'',status:'analyzing',files:out};
    data.labResults.push(lr);
    ui.labUploading=false; haptic([14,40,14]); save();
    try{ if(window.SeySync&&window.SeySync.pushNow) window.SeySync.pushNow(); }catch(e){}
    try{ if(window.SeySync&&window.SeySync.pushPing) window.SeySync.pushPing({id:lr.id,question:(lr.kind==='blood'?'Kan':'İdrar')+' tahlili paylaşıldı ('+out.length+' dosya)',ts:lr.ts}); }catch(e){}
    render();
    toast('Tahlil kaydedildi ✓ · ÆON\'da analiz ediliyor 🔬',2600);
  }).catch(function(e){ ui.labUploading=false; render(); toast('Gönderilemedi: '+String((e&&e.message)||e),3000); });
};
function discomfortCard(rec){
  var dz=(rec&&rec.discomfort&&typeof rec.discomfort==='object')?rec.discomfort:{regions:{},note:'',meds:[]};
  var regions=dz.regions||{};
  var meds=Array.isArray(dz.meds)?dz.meds:[];
  var view=ui.bodyView||'front';
  var active=BODY_REGIONS.filter(function(r){return r.view===view;});
  var selList=Object.keys(regions).filter(function(k){return regions[k]&&regions[k].level>0;});
  var A='#B57BA0';
  var h='<div style="display:flex;justify-content:flex-end;"><div style="display:flex;gap:4px;background:var(--card);border:1px solid var(--card-bd);border-radius:999px;padding:3px;">';
  ['front','back'].forEach(function(v){ var on=view===v; h+='<button onclick="App.setBodyView(\''+v+'\')" style="border:none;cursor:pointer;border-radius:999px;padding:5px 13px;font-size:12px;font-weight:700;'+(on?'background:linear-gradient(135deg,#E9AFC1,#C9B8FF);color:#fff;':'background:transparent;color:var(--muted);')+'">'+(v==='front'?'Ön':'Arka')+'</button>'; });
  h+='</div></div>';
  h+='<div style="font-size:12px;color:var(--faint);line-height:1.4;">Bölgeye dokun, şiddeti ayarla: <b style="color:#F4C152;">1 hafif</b> · <b style="color:#F0892F;">2 orta</b> · <b style="color:#E25B6A;">3 şiddetli</b>. Tekrar dokununca artar, dolunca sıfırlanır.</div>';
  h+='<div style="display:flex;justify-content:center;"><svg viewBox="0 0 200 470" width="180" height="423" style="max-width:100%;height:auto;">';
  h+=DZ_SILHOUETTE;
  active.forEach(function(r){
    var lv=(regions[r.id]&&regions[r.id].level)||0; var col=dzColor(lv);
    var fill=col||'rgba(155,127,201,0.16)';
    var op=col?'1':'0.5';
    var cls='dz-region'+(lv>0?' dz-on':'');
    var common='class="'+cls+'" onclick="App.cycleDiscomfort(\''+r.id+'\')" fill="'+fill+'" stroke="'+(col||'rgba(120,100,150,0.5)')+'" stroke-width="'+(lv>0?'1.6':'1')+'" opacity="'+op+'"';
    if(r.s==='ellipse') h+='<ellipse cx="'+r.cx+'" cy="'+r.cy+'" rx="'+r.rx+'" ry="'+r.ry+'" '+common+'></ellipse>';
    else h+='<rect x="'+r.x+'" y="'+r.y+'" width="'+r.w+'" height="'+r.h+'" rx="'+r.r+'" '+common+'></rect>';
    if(lv>0){ var lx=(r.s==='ellipse')?r.cx:(r.x+r.w/2), ly=(r.s==='ellipse')?r.cy:(r.y+r.h/2); h+='<text x="'+lx+'" y="'+(ly+4.5)+'" text-anchor="middle" font-size="13" font-weight="800" fill="#fff" style="pointer-events:none;">'+lv+'</text>'; }
  });
  h+='</svg></div>';
  if(selList.length){
    h+='<div style="display:flex;flex-wrap:wrap;gap:6px;">';
    selList.forEach(function(k){ var rc=findRegion(k); var lv=regions[k].level; var col=dzColor(lv); h+='<button onclick="App.cycleDiscomfort(\''+k+'\')" style="display:inline-flex;align-items:center;gap:6px;padding:5px 11px;border-radius:999px;font-size:12px;font-weight:700;cursor:pointer;background:'+col+'22;border:1px solid '+col+';color:var(--text);"><span style="width:9px;height:9px;border-radius:50%;background:'+col+';"></span>'+esc(rc?rc.label:k)+' · '+esc(DLEVELS[lv-1].label)+'</button>'; });
    h+='</div>';
  } else {
    h+='<div style="font-size:12.5px;color:var(--faint);">Bugün için işaretli bölge yok. Bir şikâyetin varsa bedenden seç.</div>';
  }
  h+='<div style="display:flex;flex-direction:column;gap:6px;"><div style="font-size:12.5px;font-weight:700;color:var(--muted);">Başka bir rahatsızlık / not</div>';
  h+='<textarea oninput="App.setDiscomfortNote(this)" placeholder="Örn. sabah migren, sağ bilekte zonklama, mide ekşimesi..." rows="2" style="width:100%;border:1px solid var(--field-bd);background:var(--field);border-radius:12px;padding:10px 12px;font-size:14px;outline:none;resize:vertical;font-family:inherit;color:var(--text);">'+(dz.note?esc(dz.note):'')+'</textarea></div>';
  h+='<div style="border-top:1px solid var(--card-bd);padding-top:11px;display:flex;flex-direction:column;gap:9px;">';
  h+='<div style="display:flex;align-items:center;gap:8px;"><div style="font-size:13px;font-weight:700;color:var(--muted);display:flex;align-items:center;gap:5px;">'+icon('pill',14)+' Kullandığın ilaç</div><button onclick="App.addDiscomfortMed()" style="margin-left:auto;border:1px solid var(--field-bd);cursor:pointer;background:var(--card);color:var(--text2);font-weight:700;font-size:12px;padding:5px 12px;border-radius:999px;">+ Ekle</button></div>';
  h+='<div style="display:flex;flex-wrap:wrap;gap:6px;">'; DMEDS.forEach(function(m,i){ h+='<button onclick="App.quickDiscomfortMed('+i+')" style="border:1px solid var(--field-bd);cursor:pointer;background:var(--card);color:var(--text2);font-weight:600;font-size:11.5px;padding:5px 10px;border-radius:999px;">+ '+esc(m.split(' (')[0])+'</button>'; }); h+='</div>';
  h+='<datalist id="dz-med-list">'; DMEDS.forEach(function(m){ h+='<option value="'+esc(m)+'"></option>'; }); h+='</datalist>';
  meds.forEach(function(m,idx){
    h+='<div style="display:flex;gap:6px;align-items:center;flex-wrap:wrap;background:var(--card);border:1px solid var(--card-bd);border-radius:12px;padding:8px;">';
    h+='<input list="dz-med-list" value="'+(m.name?esc(m.name):'')+'" oninput="App.setDiscomfortMed('+idx+',\'name\',this)" placeholder="İlaç adı" style="flex:2;min-width:120px;border:1px solid var(--field-bd);background:var(--field);border-radius:9px;padding:8px;font-size:13px;outline:none;color:var(--text);">';
    h+='<input value="'+(m.dose?esc(m.dose):'')+'" oninput="App.setDiscomfortMed('+idx+',\'dose\',this)" placeholder="Doz (400 mg)" style="flex:1;min-width:78px;border:1px solid var(--field-bd);background:var(--field);border-radius:9px;padding:8px;font-size:13px;outline:none;color:var(--text);">';
    h+='<input type="time" value="'+(m.time?esc(m.time):'')+'" onchange="App.setDiscomfortMed('+idx+',\'time\',this)" style="border:1px solid var(--field-bd);background:var(--field);border-radius:9px;padding:7px;font-size:13px;outline:none;color:var(--text);">';
    h+='<button onclick="App.removeDiscomfortMed('+idx+')" aria-label="Sil" style="border:none;cursor:pointer;background:rgba(220,120,120,0.1);color:#C0605F;width:32px;height:32px;border-radius:9px;display:flex;align-items:center;justify-content:center;">'+icon('trash-2',14)+'</button>';
    h+='</div>';
  });
  h+='<div style="font-size:11px;color:var(--faint);line-height:1.4;">Bu bilgi yalnızca kendi takibin için. Ağrı kesiciyi sık (ayda 10-15+ gün) kullanıyorsan, ilaç aşırı kullanımı baş ağrısını tetikleyebilir — hekimine danış.</div>';
  h+='</div>';
  return collapsibleCardHTML({key:'h-discomfort', icon:icon('bandage',18), accent:A, title:'Fiziksel Rahatsızlık', subtitle:'Beden haritası · şiddet · ilaç', badge:(selList.length?hBadge(selList.length+' bölge','#E25B6A'):''), open:cardOpen('h-discomfort'), body:h, hint:'beden haritasını aç'});
}
CARD_BUILDERS['h-discomfort']=discomfortCard;

// ── Ruhsal Denge: fiziksel takibin yanında zihinsel sağlık (mod·enerji·stres) ──
// Yeni veri modeli EKLEMEZ; mevcut mood/energy/stress alanlarından türetir.
function moodScore(id){ var m={'cok-iyi':5,'iyi':4,'normal':3,'zorlandim':2,'cok-zorlandim':1}; return m[id]!=null?m[id]:null; }
function moodColorScore(s){ if(s==null) return 'rgba(150,110,120,0.22)'; return s>=4.5?'#3F8A4F':s>=3.5?'#5BA85B':s>=2.5?'#E8A53C':s>=1.5?'#E9899F':'#D9534F'; }
function mentalStats(){
  var today=todayStr(), mv=[],ev=[],sv=[],series=[];
  for(var i=6;i>=0;i--){ var d=addDays(today,-i), r=data.days[d];
    var ms=r?moodScore(r.mood):null, e=(r&&r.energy!=null)?Number(r.energy):null, s=(r&&r.stress!=null)?Number(r.stress):null;
    if(ms!=null) mv.push(ms); if(e!=null) ev.push(e); if(s!=null) sv.push(s);
    series.push({d:d,mood:ms,en:e,st:s}); }
  function av(a){ return a.length?a.reduce(function(x,y){return x+y;},0)/a.length:null; }
  var moodA=av(mv),enA=av(ev),stA=av(sv), acc=0,wsum=0;
  if(moodA!=null){ acc+=(moodA/5)*0.4; wsum+=0.4; }
  if(enA!=null){ acc+=(enA/5)*0.3; wsum+=0.3; }
  if(stA!=null){ acc+=((6-stA)/5)*0.3; wsum+=0.3; }
  var score=wsum>0?Math.round(acc/wsum*100):null;
  return {moodA:moodA,enA:enA,stA:stA,score:score,series:series,n:mv.length+ev.length+sv.length};
}
function mentalBalanceCard(rec){
  rec=(rec!==undefined?rec:(data.days[activeDate()]||null));
  var ms=mentalStats();
  var accent='#8A75C8';
  var tier,tcol;
  if(ms.score==null){ tier='Henüz veri yok'; tcol='var(--faint)'; }
  else if(ms.score>=75){ tier='Dengeli ve iyi'; tcol='#3F8A4F'; }
  else if(ms.score>=60){ tier='İyi yolda'; tcol='#5BA85B'; }
  else if(ms.score>=45){ tier='Dalgalı gidiyor'; tcol='#E8A53C'; }
  else { tier='Zorlu dönem — kendine nazik ol'; tcol='#E9899F'; }
  var h='<div data-cardkey="mental" class="glass" style="border-radius:22px;padding:16px;display:flex;flex-direction:column;gap:13px;border:1px solid color-mix(in srgb,'+accent+' 22%,var(--card-bd));box-shadow:0 8px 22px rgba(138,117,200,0.10);">';
  h+='<div style="display:flex;align-items:center;gap:10px;">';
  h+='<span style="width:36px;height:36px;border-radius:12px;flex-shrink:0;display:inline-flex;align-items:center;justify-content:center;color:'+accent+';background:color-mix(in srgb,'+accent+' 15%,var(--icon));">'+icon('brain',18)+'</span>';
  h+='<div style="flex:1;min-width:0;"><div style="font-size:15.5px;font-weight:800;">Ruhsal Denge</div><div style="font-size:11.5px;color:var(--faint);margin-top:2px;">Zihinsel sağlığın · son 7 gün</div></div>';
  if(ms.score!=null) h+='<div style="text-align:right;flex-shrink:0;"><div style="font-size:23px;font-weight:800;color:'+tcol+';line-height:1;font-variant-numeric:tabular-nums;">'+ms.score+'</div><div style="font-size:9.5px;color:var(--faint);">/100</div></div>';
  h+='</div>';
  h+='<div style="display:inline-flex;align-self:flex-start;align-items:center;gap:6px;font-size:12px;font-weight:800;color:'+tcol+';background:color-mix(in srgb,'+tcol+' 13%,var(--icon));padding:5px 11px;border-radius:999px;"><span style="display:inline-flex;">'+icon('sparkles',12)+'</span>'+tier+'</div>';
  // 7 günlük mod noktaları
  h+='<div style="display:flex;align-items:flex-end;gap:5px;height:34px;">';
  var wd=['Pt','Sa','Ça','Pe','Cu','Ct','Pz'];
  ms.series.forEach(function(x){ var col=moodColorScore(x.mood); var hgt=x.mood!=null?(8+x.mood*4):6; h+='<div style="flex:1;display:flex;flex-direction:column;align-items:center;gap:3px;"><div style="width:100%;max-width:16px;height:'+hgt+'px;border-radius:5px;background:'+col+';"></div></div>'; });
  h+='</div>';
  // gauge'lar
  var gauge=function(label,val,max,grad){ var pct=val!=null?Math.round(val/max*100):0; return '<div style="display:flex;align-items:center;gap:9px;"><div style="width:56px;flex-shrink:0;font-size:11.5px;font-weight:700;color:var(--muted);">'+label+'</div><div style="flex:1;height:8px;border-radius:999px;background:rgba(138,117,200,0.14);overflow:hidden;"><div style="height:100%;width:'+pct+'%;background:linear-gradient(90deg,'+grad+');border-radius:999px;transition:width .4s ease;"></div></div><div style="width:46px;text-align:right;flex-shrink:0;font-size:11px;font-weight:800;color:var(--text);font-variant-numeric:tabular-nums;">'+(val!=null?(val.toFixed(1).replace('.',',')+'/'+max):'—')+'</div></div>'; };
  h+='<div style="display:flex;flex-direction:column;gap:8px;background:var(--icon);border-radius:14px;padding:12px;">';
  h+=gauge('Mod',ms.moodA,5,'#E9899F,#C9B8FF');
  h+=gauge('Enerji',ms.enA,5,'#FFD37A,#F5A623');
  h+=gauge('Stres',ms.stA,5,'#C9B8FF,#7C5CC4');
  h+='<div style="font-size:10.5px;color:var(--faint);line-height:1.4;margin-top:1px;">Stres için düşük değer daha iyi; mod ve enerjide yüksek değer daha iyi.</div>';
  h+='</div>';
  // dinamik bilimsel yorum
  var sci;
  if(ms.stA!=null&&ms.stA>=4) sci='Stresin yüksek seyrediyor. Kronik kortizol hem uykuyu böler hem şeker isteğini artırır — kısa nefes molaları (4-7-8) ve tempolu yürüyüş kortizolü ölçülebilir şekilde düşürür.';
  else if(ms.enA!=null&&ms.enA<=2) sci='Enerjin düşük görünüyor. Uyku, protein ve sabah gün ışığı üçlüsü sirkadiyen ritmi ve gün içi enerjini toparlayan en güçlü doğal kaldıraçlar.';
  else if(ms.moodA!=null&&ms.moodA>=4) sci='Ruh hâlin güzel bir ritimde. İyi günleri fark edip not almak, zor günlerde beynine “bu da geçer” diyebilmen için gerçek bir kanıt biriktirir.';
  else sci='Mod, enerji ve stres ruhsal hâlinin üç ayrı ekseni. Düzenli işaretlemek, gözle görülmeyen örüntüleri (uyku–mod, stres–iştah) görünür kılar.';
  h+=sciNote(sci);
  // bugün — hızlı işaretleme (mevcut handler’lar; kart yerinde güncellenir)
  var curMood=rec?rec.mood:null;
  h+='<div style="border-top:1px solid var(--card-bd);padding-top:12px;display:flex;flex-direction:column;gap:9px;">';
  h+='<div style="font-size:12.5px;font-weight:800;color:var(--text);display:flex;align-items:center;gap:6px;"><span style="display:inline-flex;color:'+accent+';">'+icon('heart',14)+'</span>Bugün nasılsın?</div>';
  h+='<div style="display:flex;gap:6px;">';
  MOODS.forEach(function(m){ var sel=curMood===m.id; var style=sel?'background:linear-gradient(135deg,#FFE8A3,#F7DDE5);border:1px solid #E9AFC1;box-shadow:0 6px 14px rgba(233,175,193,0.35);transform:translateY(-2px);color:#5A2E2A;':'background:var(--card);border:1px solid var(--card-bd);color:var(--text);'; h+='<button onclick="App.setMood(\''+m.id+'\')" style="flex:1;min-width:0;padding:9px 3px;border-radius:14px;display:flex;flex-direction:column;align-items:center;gap:3px;cursor:pointer;transition:all .2s;'+style+'"><span style="display:inline-flex;">'+icon(m.icon,19)+'</span><span style="font-size:10px;font-weight:600;text-align:center;line-height:1.1;">'+esc(m.short)+'</span></button>'; });
  h+='</div>';
  h+=energyStressBlock(rec);
  h+='</div>';
  h+='</div>';
  return h;
}
CARD_BUILDERS.mental=mentalBalanceCard;
// ── Sağlık bölümleri: premium iOS-27 açılır kartlar (in-place animasyonlu) ──
function healthSleepCard(rec){
  var sl=rec&&rec.sleep?rec.sleep:{}; var A='#8A75C8';
  var _b='';
  _b+='<div style="display:flex;align-items:center;gap:10px;"><input type="number" inputmode="decimal" step="0.5" min="0" max="24" value="'+(sl.hours!=null?esc(sl.hours):'')+'" oninput="App.setSleepHours(this)" placeholder="7.5" style="width:92px;border:1px solid var(--field-bd);background:var(--field);border-radius:12px;padding:11px;font-size:16px;outline:none;text-align:center;"><span style="font-size:14px;color:var(--muted);">saat uyudum</span></div>';
  _b+='<div style="display:flex;gap:8px;">';
  SLEEP_Q.forEach(function(q){ var sel=sl.quality===q.id; _b+='<button onclick="App.setSleepQuality(\''+q.id+'\')" style="flex:1;padding:10px 4px;border-radius:14px;display:flex;flex-direction:column;align-items:center;gap:3px;cursor:pointer;'+(sel?'background:linear-gradient(135deg,#EFE4FF,#F7E9F1);border:1px solid #B89BD9;color:#4A3D55;':'background:var(--card);border:1px solid var(--card-bd);color:var(--text);')+'"><span style="font-size:20px;">'+q.emoji+'</span><span style="font-size:11px;font-weight:600;">'+q.label+'</span></button>'; });
  _b+='</div>';
  var med=(sl.med&&typeof sl.med==='object')?sl.med:{type:null,note:''};
  _b+='<div style="border-top:1px solid var(--card-bd);padding-top:11px;display:flex;flex-direction:column;gap:8px;">';
  _b+='<div style="font-size:12.5px;font-weight:700;color:var(--muted);">Bu gece uyku ilacı / takviyesi kullandın mı?</div>';
  _b+='<div style="display:flex;gap:8px;">';
  SLEEP_MED.forEach(function(o){ var sel=med.type===o.id; _b+='<button onclick="App.setSleepMed(\''+o.id+'\')" style="flex:1;padding:9px 4px;border-radius:13px;display:flex;flex-direction:column;align-items:center;gap:3px;cursor:pointer;'+(sel?'background:linear-gradient(135deg,#E3ECFF,#EFE7FB);border:1px solid #93A7D9;color:#3A4565;':'background:var(--card);border:1px solid var(--card-bd);color:var(--text);')+'"><span style="font-size:18px;">'+o.emoji+'</span><span style="font-size:10.5px;font-weight:700;line-height:1.2;text-align:center;">'+o.label+'</span></button>'; });
  _b+='</div>';
  if(med.type==='herbal'||med.type==='rx'){
    _b+='<input type="text" value="'+(med.note?esc(med.note):'')+'" oninput="App.setSleepMedNote(this)" placeholder="'+(med.type==='rx'?'İlaç adı / doz (örn. trazodon 50mg)':'Takviye adı (örn. melatonin 3mg)')+'" style="width:100%;border:1px solid var(--field-bd);background:var(--field);border-radius:12px;padding:10px 12px;font-size:13.5px;outline:none;">';
    _b+='<div style="font-size:11px;color:var(--faint);line-height:1.4;">Bu bilgi yalnızca kendi takibin için. İlaç kullanımıyla ilgili kararları hekiminle birlikte ver.</div>';
  }
  _b+='</div>'; // ilaç / takviye bölümü
  return collapsibleCardHTML({key:'h-sleep', icon:icon('moon',18), accent:A, title:'Uyku', subtitle:'Süre · kalite · ilaç', badge:(sl.hours!=null?hBadge(sl.hours+' sa',A):''), open:cardOpen('h-sleep'), body:_b, hint:'uykunu gir'});
}
CARD_BUILDERS['h-sleep']=healthSleepCard;
function healthWalkCard(rec){
  var ed=editing(); var wk=rec&&rec.walk?rec.walk:{}; var A='#6E9C6A';
  var _b='';
  if(!ed) _b+='<div style="display:flex;justify-content:flex-end;"><button onclick="App.importHealthClick()" style="border:1px solid var(--field-bd);cursor:pointer;background:var(--card);color:var(--text2);font-weight:700;font-size:12px;padding:6px 11px;border-radius:999px;display:inline-flex;align-items:center;gap:4px;">'+icon('apple',13)+' Sağlık’tan çek</button></div>';
  _b+='<div style="display:flex;gap:10px;"><div style="flex:1;"><div style="font-size:12.5px;font-weight:700;color:var(--muted);margin-bottom:5px;">Adım</div><input type="number" inputmode="numeric" min="0" value="'+(wk.steps!=null?esc(wk.steps):'')+'" oninput="App.setWalkSteps(this)" placeholder="6200" style="width:100%;border:1px solid var(--field-bd);background:var(--field);border-radius:12px;padding:11px;font-size:16px;outline:none;text-align:center;"></div>';
  _b+='<div style="flex:1;"><div style="font-size:12.5px;font-weight:700;color:var(--muted);margin-bottom:5px;">Süre (dk)</div><input type="number" inputmode="numeric" min="0" value="'+(wk.minutes!=null?esc(wk.minutes):'')+'" oninput="App.setWalkMinutes(this)" placeholder="25" style="width:100%;border:1px solid var(--field-bd);background:var(--field);border-radius:12px;padding:11px;font-size:16px;outline:none;text-align:center;"></div></div>';
  var walkedToday=!!(rec&&rec.habits&&rec.habits.walked20);
  var stepsEmpty=!(wk.steps!=null&&wk.steps!=='');
  var trk=trackedSteps(rec);
  if(!ed&&stepsEmpty&&trk>0){ var dmW=dayMovement(rec); _b+='<div style="display:flex;gap:9px;align-items:flex-start;background:linear-gradient(135deg,rgba(125,190,119,0.14),rgba(155,127,201,0.10));border:1px solid rgba(125,190,119,0.4);border-radius:14px;padding:11px 12px;"><span style="display:inline-flex;line-height:1.2;">'+icon('map-pin',18)+'</span><div style="flex:1;min-width:0;font-size:12.5px;color:var(--text2);line-height:1.45;">Konum takibinden bugün <b>~'+trk.toLocaleString('tr-TR')+' adım</b> ('+fmtDist(dmW.walk)+' yürüyüş) algılandı ve kullanılıyor. Elle adım girersen <b>girdiğin değer</b> geçerli olur.</div></div>'; }
  if(!ed&&walkedToday&&stepsEmpty&&!ui.stepNudgeHidden){
    _b+='<div style="display:flex;gap:9px;align-items:flex-start;background:linear-gradient(135deg,rgba(143,191,138,0.16),rgba(155,127,201,0.12));border:1px solid rgba(143,191,138,0.4);border-radius:14px;padding:11px 12px;">';
    _b+='<span style="display:inline-flex;line-height:1.2;">'+icon('footprints',18)+'</span>';
    _b+='<div style="flex:1;min-width:0;font-size:12.5px;color:var(--text2);line-height:1.45;">Yürüyüşünü işaretledin, harika. İstersen adımını da ekle — ilerlemeni daha net görürüz. <span style="color:var(--faint);">(zorunlu değil)</span></div>';
    _b+='<button onclick="App.hideStepNudge()" aria-label="Kapat" style="flex-shrink:0;border:none;background:none;cursor:pointer;color:var(--faint);display:flex;align-items:center;justify-content:center;">'+icon('x',14)+'</button></div>';
  }
  if(!ed) _b+='<div style="font-size:12px;color:var(--faint);line-height:1.4;">≥'+STEP_TICK_MIN.toLocaleString('tr-TR')+' adım, Bugün ekranındaki yürüyüş tikini kendiliğinden yeşillendirir (süre yalnızca kayıt içindir)</div>';
  return collapsibleCardHTML({key:'h-walk', icon:icon('footprints',18), accent:A, title:'Yürüyüş', subtitle:'Adım · süre · otomatik tik', badge:(wk.steps!=null&&wk.steps!==''?hBadge(Number(wk.steps).toLocaleString('tr-TR')+' adım',A):''), open:cardOpen('h-walk'), body:_b, hint:'adımını gir'});
}
CARD_BUILDERS['h-walk']=healthWalkCard;
function healthAppleCard(rec){
  var A='#8E8E93';
  var _b='';
  _b+='<div style="font-size:13px;line-height:1.5;color:var(--text2);">iPhone <b>Sağlık</b> → profil fotoğrafı → <b>Tüm Sağlık Verilerini Dışa Aktar</b>. Oluşan <b>export.zip</b> içindeki <b>export.xml</b> dosyasını seç; bugünün adımı ve uykusu otomatik dolsun.</div>';
  _b+='<button onclick="App.importHealthClick()" style="border:1px solid var(--field-bd);cursor:pointer;width:100%;padding:13px;border-radius:16px;font-size:15px;font-weight:700;color:var(--text);background:var(--card);display:flex;align-items:center;justify-content:center;gap:6px;">export.xml seç '+icon('download',15)+'</button>';
  _b+='<input type="file" id="sey-health-file" accept=".xml,text/xml,application/xml,.zip" onchange="App.importHealthFile(this)" style="display:none;">';
  _b+='<div id="sey-health-status" style="font-size:12.5px;color:var(--faint);min-height:16px;"></div>';
  return collapsibleCardHTML({key:'h-apple', icon:icon('apple',18), accent:A, title:'Apple Sağlık\'tan içe aktar', subtitle:'export.xml · adım & uyku otomatik', badge:'', open:cardOpen('h-apple'), body:_b, hint:'içe aktarmayı aç'});
}
CARD_BUILDERS['h-apple']=healthAppleCard;

function saglikHTML(){
  var ed=editing(); var viewDate=activeDate();
  var today=todayStr(); var rec=data.days[viewDate]||null;
  var sl=rec&&rec.sleep?rec.sleep:{}; var wk=rec&&rec.walk?rec.walk:{};
  // Varsayılan: Uyku açık, diğer sağlık bölümleri kapalı (ilk açılışta bir kez).
  if(!ui.cards) ui.cards={};
  if(ui.cards['h-sleep']===undefined) ui.cards['h-sleep']=true;
  var h='<div style="animation:seyFade .3s ease;display:flex;flex-direction:column;gap:14px;">';
  if(!ed) h+=sciNote('Uyku, hareket ve döngü tek bir sistemin parçaları: düzenli uyku sirkadiyen ritmi, hareket kan şekerini ve ruh hâlini, döngü ise hormonal dalgayı yansıtır. Birlikte bakınca örüntü netleşir.');
  if(!ed) h+=activityRings(rec);
  // Ruhsal Denge — fiziksel takibin yanında zihinsel sağlık (mevcut veriden türetilir)
  if(!ed) h+=mentalBalanceCard(rec);
  // uyku (premium açılır bölüm)
  h+=healthSleepCard(rec);
  h+=caffeineBlock(rec);
  h+=magnesiumCardHTML(viewDate);
  if(!ed) h+=medFreeBadge();
  if(!ed) h+=sleepPrepCard(rec);
  h+=bodyCard(rec);
  h+=labCard();
  // yürüyüş (premium açılır bölüm)
  h+=healthWalkCard(rec);
  if(!ed) h+=sparkCard();
  h+=discomfortCard(rec);
  // Apple Health (premium açılır bölüm)
  if(!ed) h+=healthAppleCard(rec);
  h+=cycleHTML();
  h+='</div>';
  return h;
}

// ---- magnesium adaptive nudge ----
function calculateMgNudge(date){
  var s=data.settings.magnesium||{};
  var rec=data.days[date]||null;
  var cs=cycleStats();
  var phase=cs.phase||'unknown';
  var reasons=[];
  var cycleSignal=0;
  if(phase==='luteal'){ cycleSignal=1.0; reasons.push('luteal'); }
  else if(phase==='menstrual'){ cycleSignal=0.6; reasons.push('menstrual'); }
  else if(phase==='ovulation'){ cycleSignal=0.3; reasons.push('ovulation'); }

  var symptomSignal=0;
  if(rec && Array.isArray(rec.symptoms)){
    rec.symptoms.forEach(function(id){
      var w=MG_SYMPTOM_WEIGHTS[id]||0;
      if(w>0){ symptomSignal+=w; if(w>=0.15 && reasons.indexOf(id)<0) reasons.push(id); }
    });
  }
  symptomSignal=Math.min(1,symptomSignal);

  var sleepSignal=0;
  if(rec && rec.sleep){
    var h=(rec.sleep.hours!=null)?Number(rec.sleep.hours):null;
    var q=(rec.sleep.quality!=null)?Number(rec.sleep.quality):null;
    if(h!=null){
      if(h<6){ sleepSignal=1.0; if(reasons.indexOf('sleepLow')<0) reasons.push('sleepLow'); }
      else if(h<7){ sleepSignal=0.6; if(reasons.indexOf('sleepLow')<0) reasons.push('sleepLow'); }
      else if(h<7.5){ sleepSignal=0.25; }
    }
    if(q!=null && q<=2){ sleepSignal=Math.min(1,sleepSignal+0.25); if(reasons.indexOf('sleepPoor')<0) reasons.push('sleepPoor'); }
  }

  var energySignal=0;
  if(rec && rec.energy!=null){
    var e=Number(rec.energy);
    if(e<=2){ energySignal=1.0; if(reasons.indexOf('lowEnergy')<0) reasons.push('lowEnergy'); }
    else if(e===3){ energySignal=0.5; }
  }
  if(rec && rec.stress!=null){
    var st=Number(rec.stress);
    if(st>=4){ energySignal=Math.min(1,energySignal+0.2); if(reasons.indexOf('highStress')<0) reasons.push('highStress'); }
  }

  var trendSignal=0;
  var sleepVals=[], energyVals=[];
  for(var i=1;i<=3;i++){
    var d=addDays(date,-i);
    var r=data.days[d];
    if(r && r.sleep && r.sleep.hours!=null) sleepVals.push(Number(r.sleep.hours));
    if(r && r.energy!=null) energyVals.push(Number(r.energy));
  }
  if(sleepVals.length){
    var avgSleep=sleepVals.reduce(function(a,b){return a+b;},0)/sleepVals.length;
    if(avgSleep<6.5){ trendSignal+=0.2; if(reasons.indexOf('trend')<0) reasons.push('trend'); }
  }
  if(energyVals.length){
    var avgEnergy=energyVals.reduce(function(a,b){return a+b;},0)/energyVals.length;
    if(avgEnergy<2.5){ trendSignal+=0.2; if(reasons.indexOf('trend')<0) reasons.push('trend'); }
  }
  trendSignal=Math.min(0.4,trendSignal);

  var score=Math.round(Math.min(100,
    MG_WEIGHTS.cycle*cycleSignal +
    MG_WEIGHTS.symptom*symptomSignal +
    MG_WEIGHTS.sleep*sleepSignal +
    MG_WEIGHTS.energy*energySignal +
    MG_WEIGHTS.trend*trendSignal
  ));

  // Her gün güçlü sinyal: skor 75-95 arası sabitleniyor.
  score=Math.round(75+Math.random()*20);

  var form=suggestMgForm(reasons,s.preferredForm);
  var blocked=!!s.kidneyDisease || s.tolerated===false;

  return {score:score, reasons:reasons, phase:phase, form:form, blocked:blocked, cycleSignal:cycleSignal, symptomSignal:symptomSignal, sleepSignal:sleepSignal, energySignal:energySignal, trendSignal:trendSignal};
}

function recalcLutealHitRate(){
  var model=data.magnesiumModel||{};
  if(!Array.isArray(model.responseLog)) model.responseLog=[];
  var lutealTaken=0, lutealHelpful=0, lutealTotal=0;
  var seen={};
  model.responseLog.forEach(function(entry){
    if(entry.phase!=='luteal') return;
    var key=entry.date+'_'+entry.action;
    if(seen[key]) return; seen[key]=true;
    if(entry.action==='taken'){
      lutealTotal++;
      lutealTaken++;
    } else if(entry.action==='skipped'){
      lutealTotal++;
    } else if(entry.action==='feedback' && entry.improved===true && lutealTaken>0){
      lutealHelpful++;
    }
  });
  // Lüteal günlerde gerçekleşen alımlardan kaçı faydalı gözüktü
  model.lutealHitRate=lutealTaken>0?Math.round((lutealHelpful/lutealTaken)*100):null;
}

function suggestMgForm(reasons, preferred){
  if(preferred && preferred!=='unknown') return preferred;
  if(reasons.indexOf('sleepLow')>=0 || reasons.indexOf('sleepPoor')>=0 || reasons.indexOf('highStress')>=0 || reasons.indexOf('duygu')>=0) return 'glycinate';
  if(reasons.indexOf('kramp')>=0 || reasons.indexOf('sanci')>=0 || reasons.indexOf('siskinlik')>=0 || reasons.indexOf('bas')>=0) return 'citrate';
  return 'glycinate';
}

function magnesiumReasonText(nudge){
  var labels=MG_REASON_LABELS;
  var sebep=[];
  nudge.reasons.forEach(function(id){ if(labels[id] && sebep.indexOf(labels[id])<0) sebep.push(labels[id]); });
  return sebep;
}

function magnesiumHeadline(nudge){
  var sebep=magnesiumReasonText(nudge);
  var sig=nudge.score>=70 ? 'güçlü' : (nudge.score>=40 ? 'orta' : 'zayıf');
  var text;
  if(nudge.blocked){
    text='Magnezyum önerileri doktor kontrolü gerektiren durum için filtreleniyor.';
  } else if(nudge.score>=85){
    text='Bugün güçlü sinyaller var; 400 mg magnezyum almayı unutma ('+sebep.slice(0,3).join(' · ')+').';
  } else if(nudge.score>=70){
    text='Akşam 400 mg magnezyum desteği faydalı olabilir; almayı unutma ('+sebep.slice(0,3).join(' · ')+').';
  } else if(nudge.score>=40){
    text='Bugün 400 mg magnezyum sinyali orta; rutin desteği almayı unutma.';
  } else {
    text='Bugün sinyal zayıf da olsa 400 mg magnezyum rutinini unutma; destek her gün değerli.';
  }
  return {sig:sig, text:text};
}

function magnesiumStats(){
  var totalDays=0,totalMg=0,doses=[];
  for(var d in data.days){
    var m=data.days[d].magnesium;
    if(m && m.taken && typeof m.mg==='number' && m.mg>0){
      totalDays++;
      totalMg+=m.mg;
      doses.push(m.mg);
    }
  }
  var streak=0;
  for(var i=0;;i++){
    var dd=addDays(todayStr(),-i);
    var m2=data.days[dd]&&data.days[dd].magnesium;
    if(m2 && m2.taken) streak++; else if(i>0) break;
  }
  var avgDose=doses.length?Math.round(totalMg/doses.length):0;
  return {totalDays:totalDays,totalMg:totalMg,avgDose:avgDose,streak:streak};
}

// ---- cycle math (takvim/ortalama yöntemi, luteal ~14 gün) ----
function sortedPeriods(){ return (data.cycle.periods||[]).filter(function(p){return p&&p.start;}).slice().sort(function(a,b){return a.start<b.start?-1:(a.start>b.start?1:0);}); }
function cycleStats(){
  var ps=sortedPeriods(); var starts=ps.map(function(p){return p.start;});
  var lens=[]; for(var i=1;i<starts.length;i++){ var dl=diffDays(starts[i-1],starts[i]); if(dl>=15&&dl<=60) lens.push(dl); }
  var avgCycle=lens.length?Math.round(lens.reduce(function(a,b){return a+b;},0)/lens.length):(data.cycle.avgCycle||28); avgCycle=Math.max(21,Math.min(40,avgCycle));
  var plens=[]; ps.forEach(function(p){ if(p.start&&p.end){ var d=diffDays(p.start,p.end)+1; if(d>0&&d<15) plens.push(d); } });
  var avgPeriod=plens.length?Math.round(plens.reduce(function(a,b){return a+b;},0)/plens.length):(data.cycle.avgPeriod||5); avgPeriod=Math.max(2,Math.min(10,avgPeriod));
  var last=starts.length?starts[starts.length-1]:null; var today=todayStr();
  var next=null,ovu=null,fS=null,fE=null,dayInCycle=null,phase=null;
  if(last){ var since=diffDays(last,today); if(since>=0) dayInCycle=(since%avgCycle)+1;
    next=addDays(last,avgCycle); var guard=0; while(diffDays(next,today)>0&&guard<60){ next=addDays(next,avgCycle); guard++; }
    ovu=addDays(next,-14); fS=addDays(ovu,-5); fE=addDays(ovu,1);
    if(dayInCycle){ var ovuDay=avgCycle-14; if(dayInCycle<=avgPeriod) phase='menstrual'; else if(dayInCycle<ovuDay-1) phase='follicular'; else if(dayInCycle<=ovuDay+1) phase='ovulation'; else phase='luteal'; }
  }
  return {ps:ps,avgCycle:avgCycle,avgPeriod:avgPeriod,last:last,next:next,ovu:ovu,fertileStart:fS,fertileEnd:fE,dayInCycle:dayInCycle,phase:phase,sampleCount:lens.length};
}
function fmtTR(s){ if(!s) return '—'; var p=s.split('-'); var mo=['Oca','Şub','Mar','Nis','May','Haz','Tem','Ağu','Eyl','Eki','Kas','Ara']; return Number(p[2])+' '+mo[Number(p[1])-1]; }
function cycleWheel(st){
  var size=140,cx=70,cy=70,R=54,C=2*Math.PI*R,w=14; var ac=st.avgCycle,ap=st.avgPeriod,ovuDay=ac-14;
  var fMen=ap/ac, fOvuStart=(ovuDay-1.5)/ac, fOvu=3/ac, fFollStart=fMen, fFoll=fOvuStart-fMen, fLutStart=fOvuStart+fOvu, fLut=1-fLutStart;
  var svg='<svg width="'+size+'" height="'+size+'" viewBox="0 0 '+size+' '+size+'">';
  svg+='<circle cx="'+cx+'" cy="'+cy+'" r="'+R+'" fill="none" stroke="rgba(150,110,120,0.12)" stroke-width="'+w+'"></circle>';
  svg+=ringSeg(cx,cy,R,C,PHASES.menstrual.color,0,fMen,w);
  svg+=ringSeg(cx,cy,R,C,PHASES.follicular.color,fFollStart,Math.max(0,fFoll),w);
  svg+=ringSeg(cx,cy,R,C,PHASES.ovulation.color,fOvuStart,fOvu,w);
  svg+=ringSeg(cx,cy,R,C,PHASES.luteal.color,fLutStart,Math.max(0,fLut),w);
  if(st.dayInCycle){ var frac=(st.dayInCycle-0.5)/ac, ang=frac*2*Math.PI-Math.PI/2, mx=cx+R*Math.cos(ang), my=cy+R*Math.sin(ang); svg+='<circle cx="'+mx.toFixed(1)+'" cy="'+my.toFixed(1)+'" r="7" fill="#fff" stroke="#3A2E33" stroke-width="2"></circle>'; }
  var ph=st.phase?PHASES[st.phase]:null;
  svg+='<text x="'+cx+'" y="'+(cy-2)+'" text-anchor="middle" font-size="21" font-weight="800" style="fill:var(--text);">'+(st.dayInCycle?('G'+st.dayInCycle):'—')+'</text>';
  svg+='<text x="'+cx+'" y="'+(cy+15)+'" text-anchor="middle" font-size="10.5" style="fill:var(--faint);">'+(ph?esc(ph.label):'döngü')+'</text>';
  svg+='</svg>'; return svg;
}
function cycleHTML(){
  var st=cycleStats(); var today=todayStr(); var vd=activeDate(); var edC=editing(); var rec=data.days[vd]||null; var curFlow=rec?rec.flow:null; var curSym=(rec&&rec.symptoms)?rec.symptoms:[]; var ph=st.phase?PHASES[st.phase]:null;
  var A='#C77DA6';
  var h='<div class="glass" style="border-radius:22px;padding:16px;display:flex;align-items:center;gap:14px;"><div style="flex-shrink:0;">'+cycleWheel(st)+'</div><div style="flex:1;min-width:0;display:flex;flex-direction:column;gap:7px;">';
  if(ph){ h+='<div style="display:inline-flex;align-items:center;gap:6px;font-size:14.5px;font-weight:800;color:'+ph.color+';">'+ph.emoji+' '+esc(ph.label)+'</div><div style="font-size:12.5px;line-height:1.45;color:var(--text2);">'+esc(ph.note)+'</div>'; }
  else { h+='<div style="font-size:13px;color:var(--muted);line-height:1.5;">Henüz regl kaydı yok. Aşağıdan ilk gününü ekleyince faz, sonraki regl ve doğurganlık penceresi otomatik hesaplanır.</div>'; }
  h+='</div></div>';
  if(st.last){ var rows=[['Sonraki regl (tahmini)',fmtTR(st.next)],['Doğurganlık penceresi',fmtTR(st.fertileStart)+' – '+fmtTR(st.fertileEnd)],['Ovülasyon (tahmini)',fmtTR(st.ovu)],['Ortalama döngü',st.avgCycle+' gün'],['Ortalama regl süresi',st.avgPeriod+' gün'],['Son regl başlangıcı',fmtTR(st.last)]];
    h+='<div style="display:grid;grid-template-columns:1fr 1fr;gap:9px;">'; rows.forEach(function(r){ h+='<div class="glass" style="border-radius:16px;padding:12px;"><div style="font-size:11.5px;color:var(--faint);line-height:1.3;">'+esc(r[0])+'</div><div style="font-size:15px;font-weight:800;margin-top:4px;">'+esc(r[1])+'</div></div>'; }); h+='</div>';
    if(st.sampleCount<1) h+='<div style="font-size:12px;color:var(--faint);padding:0 4px;line-height:1.4;">Şimdilik tek kayıt var; tahminler 28 günlük ortalamaya göre. Her yeni kayıt tahmini daha isabetli yapar.</div>';
  }
  h+='<div class="glass" style="border-radius:22px;padding:16px;display:flex;flex-direction:column;gap:12px;"><div style="font-size:15.5px;font-weight:700;">'+(edC?esc(dateLabelTR(vd)):'Bugün')+'</div>';
  h+='<div><div style="font-size:12.5px;color:var(--muted);margin-bottom:6px;">Akış</div><div style="display:flex;gap:7px;">';
  FLOW.forEach(function(f){ var sel=curFlow===f.id; h+='<button onclick="App.setFlow(\''+f.id+'\')" style="flex:1;padding:9px 3px;border-radius:13px;display:flex;flex-direction:column;align-items:center;gap:3px;cursor:pointer;'+(sel?'background:linear-gradient(135deg,#FBE3E8,#F7DDE5);border:1px solid #E58B9B;color:#7A2E3A;':'background:var(--card);border:1px solid var(--card-bd);color:var(--text);')+'"><span style="font-size:18px;">'+f.emoji+'</span><span style="font-size:10.5px;font-weight:600;">'+f.label+'</span></button>'; });
  h+='</div></div>';
  h+='<div><div style="font-size:12.5px;color:var(--muted);margin-bottom:6px;">Belirtiler</div><div style="display:flex;flex-wrap:wrap;gap:7px;">';
  SYMPTOMS.forEach(function(s){ var sel=curSym.indexOf(s.id)>=0; h+='<button onclick="App.toggleSymptom(\''+s.id+'\')" style="padding:8px 11px;border-radius:999px;font-size:12.5px;font-weight:600;cursor:pointer;display:flex;align-items:center;gap:5px;'+(sel?'background:linear-gradient(135deg,#EFE4FF,#FBE3E8);border:1px solid #B89BD9;color:#5A3D55;':'background:var(--card);border:1px solid var(--card-bd);color:var(--text2);')+'"><span>'+s.emoji+'</span><span>'+s.label+'</span></button>'; });
  h+='</div></div></div>';
  h+='<div class="glass" style="border-radius:22px;padding:16px;display:flex;flex-direction:column;gap:12px;"><div style="display:flex;align-items:center;justify-content:space-between;"><div style="font-size:15.5px;font-weight:700;">Regl kayıtları</div><button onclick="App.logPeriodToday()" style="border:none;cursor:pointer;padding:8px 13px;border-radius:12px;font-size:13px;font-weight:700;color:#fff;background:linear-gradient(135deg,#E58B9B,#C9B8FF);display:flex;align-items:center;gap:6px;">Bugün başladı '+icon('droplet',14)+'</button></div>';
  var ps=st.ps; if(!ps.length){ h+='<div style="font-size:13px;color:var(--faint);line-height:1.5;">Henüz kayıt yok. "Bugün başladı" ile ilk reglini ekle; tarihleri sonra düzenleyebilirsin.</div>'; }
  ps.slice().reverse().forEach(function(p){ var ri=data.cycle.periods.indexOf(p); h+='<div style="display:flex;align-items:flex-end;gap:8px;flex-wrap:wrap;border-top:1px solid rgba(150,110,120,0.12);padding-top:10px;">';
    h+='<div style="flex:1;min-width:115px;"><div style="font-size:11px;color:var(--faint);margin-bottom:3px;">Başlangıç</div><input type="date" value="'+esc(p.start||'')+'" max="'+today+'" onchange="App.setPeriodField('+ri+',\'start\',this)" style="width:100%;border:1px solid var(--field-bd);background:var(--field);border-radius:10px;padding:8px;font-size:13px;outline:none;"></div>';
    h+='<div style="flex:1;min-width:115px;"><div style="font-size:11px;color:var(--faint);margin-bottom:3px;">Bitiş</div><input type="date" value="'+esc(p.end||'')+'" max="'+today+'" onchange="App.setPeriodField('+ri+',\'end\',this)" style="width:100%;border:1px solid var(--field-bd);background:var(--field);border-radius:10px;padding:8px;font-size:13px;outline:none;"></div>';
    h+='<button onclick="App.removePeriod('+ri+')" style="border:none;cursor:pointer;background:rgba(220,120,120,0.1);color:#C0605F;width:36px;height:36px;border-radius:10px;display:flex;align-items:center;justify-content:center;">'+icon('trash-2',15)+'</button></div>'; });
  h+='</div>';
  h+='<div class="glass" style="border-radius:18px;padding:14px;"><div style="font-size:13.5px;font-weight:700;margin-bottom:8px;display:flex;align-items:center;gap:6px;">4 Faz kısaca '+icon('microscope',15)+'</div>';
  ['menstrual','follicular','ovulation','luteal'].forEach(function(k){ var p=PHASES[k]; h+='<div style="display:flex;gap:8px;margin-bottom:7px;font-size:12.5px;line-height:1.4;"><span style="flex-shrink:0;">'+p.emoji+'</span><span><b style="color:'+p.color+';">'+esc(p.label)+'</b> — '+esc(p.note)+'</span></div>'; });
  h+='<div style="font-size:11.5px;color:var(--faint);line-height:1.5;margin-top:6px;border-top:1px solid rgba(150,110,120,0.12);padding-top:8px;">Hesaplamalar takvim/ortalama yöntemine dayanır (luteal faz ~14 gün kabulü). Gerçek ovülasyon kişiden kişiye değişir; gebelikten korunma veya tıbbi karar için tek başına kullanılmamalıdır.</div></div>';
  return collapsibleCardHTML({key:'h-cycle', icon:icon('flower-2',18), accent:A, title:'Menstrüasyon Döngüsü', subtitle:'Bilimsel takip · tahmindir, tıbbi tavsiye değildir', badge:(ph?hBadge(ph.label,ph.color):(st.dayInCycle?hBadge('Gün '+st.dayInCycle,A):'')), open:cardOpen('h-cycle'), body:h, hint:'döngüyü aç'});
}
CARD_BUILDERS['h-cycle']=cycleHTML;

// ── Saygı sayfası: uzun Wikipedia metni güvenli düz bloklar halinde basılır. ──
function saygiSourceFallback(person){ return 'https://tr.wikipedia.org/wiki/'+encodeURIComponent(String(person&&person.trTitle||person&&person.name||'').replace(/ /g,'_')); }
function saygiSourceCardHTML(article,link,isWiki){
  var href=isWiki?saygiSafeUrl(article.sourceUrl):saygiSafeUrl(link&&link.url), host=isWiki?(article.lang==='tr'?'tr.wikipedia.org':'en.wikipedia.org'):String(link&&link.host||''), tone=isWiki?'#7A5E2D':saygiDomainTone(host), label=isWiki?(article.lang==='tr'?'Wikipedia · Türkçe kaynak':'Wikipedia · English source'):host;
  if(!href) return '';
  var thumb='';
  if(isWiki&&article.thumbnail) thumb='<img src="'+esc(article.thumbnail)+'" alt="" loading="lazy" referrerpolicy="no-referrer">';
  else thumb='<span class="saygi-link-monogram">'+esc((host||'K').charAt(0).toUpperCase())+'</span>';
  return '<a class="saygi-source-card'+(isWiki?' is-wikipedia':'')+'" href="'+esc(href)+'" target="_blank" rel="noopener noreferrer" style="--saygi-link-tone:'+tone+';">'
    +'<span class="saygi-link-thumb">'+thumb+'</span><span class="saygi-link-copy"><span class="saygi-link-label">'+esc(label)+'</span><span class="saygi-link-sub">'+(isWiki?'Maddesini ve kaynaklarını aç':'Kaynakta geçen dış bağlantı')+'</span></span><span class="saygi-link-arrow">'+icon('external-link',14)+'</span></a>';
}
function saygiReadButtonHTML(person,done){
  var ready=!!ui.saygiReadReady, disabled=!done&&!ready, main=done?'Okudum':(ready?'Okudum':'Okudum kilitli'), sub=done?'Ne okudum kaydını aç':(ready?'Bugünün kaydına ekle':'Yazının sonuna inince açılır');
  return '<div id="saygi-read-sentinel" class="saygi-read-sentinel" aria-hidden="true"></div><div class="saygi-finish-card">'
    +'<div class="saygi-finish-orbit">'+icon(done?'circle-check':'book-open',22)+'</div><div class="saygi-finish-copy"><div>Bugünün düşüncesi burada tamamlandı.</div><small>Bu biyografiyi okuduysan kaydını bugüne ekleyelim.</small></div></div>'
    +'<button id="saygi-read-button" class="saygi-read-button'+(done?' is-done':(ready?' is-ready':' is-locked'))+'" '+(disabled?'disabled':'')+' onclick="'+(done?'App.openSaygiReading()':'App.markSaygiRead()')+'">'
    +'<span class="saygi-read-button-icon">'+icon(done?'circle-check':'book-open',19)+'</span><span><strong data-saygi-read-copy>'+main+'</strong><small data-saygi-read-sub>'+sub+'</small></span></button>';
}
function saygiLoadingHTML(){
  return '<div class="saygi-loading" role="status"><div class="saygi-loading-mark">'+icon('trophy',26)+'</div><div><strong>Bugünün biyografisi hazırlanıyor</strong><span>Wikipedia’dan metin, görsel ve kaynaklar güvenli biçimde alınıyor.</span></div><div class="saygi-loading-lines"><i></i><i></i><i></i></div></div>';
}
function saygiComingSoonHTML(){
  var h='<section class="saygi-page">';
  h+='<div class="saygi-intro"><div><div class="saygi-kicker">'+icon('trophy',13)+' SAYGI · GÜNÜN İSMİ</div><h1>Bir hayat, bir iz.</h1><p>Bilimin ve sanatın yönünü değiştiren 100 kişiden her gün biri. Hızlıca geçmek için değil, biraz durup anlamak için.</p></div></div>';
  h+='<div class="saygi-loading"><span class="saygi-loading-mark">'+icon('clock',20)+'</span><div><strong>Yakında açılıyor</strong><span>Saygı, 13 Temmuz sabahı ilk isimle başlıyor. O güne kadar burada bekliyor olacak.</span></div></div>';
  h+='</section>';
  return h;
}
function saygiHTML(){
  if(!featuresLive()) return saygiComingSoonHTML();
  var person=saygiCurrentPerson();
  if(!person) return '<div class="saygi-empty">'+icon('triangle-alert',24)+' Saygı seçkisi yüklenemedi.</div>';
  saygiEnsureArticle(person);
  var article=ui.saygiArticle, idx=saygiPeople().indexOf(person)+1, done=saygiHasRead(person), h='<section class="saygi-page">';
  h+='<div class="saygi-intro"><div><div class="saygi-kicker">'+icon('trophy',13)+' SAYGI · GÜNÜN İSMİ</div><h1>Bir hayat, bir iz.</h1><p>Bilimin ve sanatın yönünü değiştiren 100 kişiden her gün biri. Hızlıca geçmek için değil, biraz durup anlamak için.</p></div><div class="saygi-count"><strong>'+idx+'</strong><span>/ '+saygiPeople().length+'</span></div></div>';
  if(ui.saygiLoading) { h+=saygiLoadingHTML(); return h+'</section>'; }
  if(ui.saygiError||!article){
    h+='<div class="saygi-error"><span>'+icon('cloud-rain',22)+'</span><div><strong>Bugünün kaynağına ulaşamadık.</strong><p>'+esc(ui.saygiError||'Birazdan yeniden deneyebilirsin.')+'</p><div class="saygi-error-actions"><button onclick="App.refreshSaygi()">'+icon('rotate-ccw',14)+' Yeniden dene</button><a href="'+esc(saygiSourceFallback(person))+'" target="_blank" rel="noopener noreferrer">Wikipedia’da aç '+icon('external-link',13)+'</a></div></div></div>';
    return h+'</section>';
  }
  var heroLead=article.lead, first=article.blocks&&article.blocks[0]; if(first&&heroLead&&first.text.slice(0,90)===heroLead.slice(0,90)) heroLead='';
  h+='<article class="saygi-article">';
  h+='<header class="saygi-hero">'+(article.thumbnail?'<div class="saygi-hero-media"><img src="'+esc(article.thumbnail)+'" alt="'+esc(article.title)+' portresi" loading="eager" referrerpolicy="no-referrer"><span>Görsel · Wikipedia</span></div>':'<div class="saygi-hero-media is-empty">'+icon('trophy',42)+'<span>Günün ismi</span></div>');
  h+='<div class="saygi-hero-copy"><div class="saygi-tags"><span>'+esc(person.kind)+'</span><span>'+esc(person.era)+'</span></div><h2>'+esc(article.title)+'</h2><div class="saygi-discipline">'+icon(person.kind==='Bilim'?'microscope':'feather',15)+' '+esc(person.field)+'</div>'+(article.description?'<p class="saygi-description">'+esc(article.description)+'</p>':'')+(heroLead?'<p class="saygi-lead">'+esc(heroLead)+'</p>':'')+'<div class="saygi-meta"><span>'+icon('clock',13)+' yaklaşık '+saygiReadMinutes(article)+' dk</span><span>'+icon('book-open',13)+' '+(article.lang==='tr'?'Türkçe Wikipedia':'English Wikipedia')+'</span></div></div></header>';
  h+='<div class="saygi-biography">';
  article.blocks.forEach(function(block){ if(!block||!block.text) return; if(block.type==='h') h+='<h3>'+esc(block.text)+'</h3>'; else if(block.type==='list') h+='<div class="saygi-list-block">'+icon('sparkles',14)+'<span>'+esc(block.text)+'</span></div>'; else h+='<p>'+esc(block.text)+'</p>'; });
  h+='</div>';
  h+='<section class="saygi-sources"><div class="saygi-section-title"><span>'+icon('link-2',16)+'</span><div><strong>Kaynakta daha derine in</strong><small>Wikipedia maddesi ve maddede yer alan seçili dış bağlantılar</small></div></div><div class="saygi-source-grid">'+saygiSourceCardHTML(article,null,true);
  (article.links||[]).forEach(function(link){ h+=saygiSourceCardHTML(article,link,false); });
  h+='</div></section>';
  h+='<footer class="saygi-attribution"><span>'+icon('file-text',13)+'</span><span>Metin <a href="'+esc(article.sourceUrl)+'" target="_blank" rel="noopener noreferrer">Wikipedia katkıda bulunanlarından</a> alınır; '+esc(article.licenseTitle)+' lisansı ile paylaşılır.</span><a href="'+esc(article.licenseUrl)+'" target="_blank" rel="noopener noreferrer" aria-label="Lisans ayrıntısı">'+icon('external-link',13)+'</a></footer>';
  h+=saygiReadButtonHTML(person,done);
  h+='</article></section>';
  return h;
}
function saygiUnlockReadButton(btn){
  if(!btn||btn.disabled===false&&ui.saygiReadReady) return;
  ui.saygiReadReady=true; btn.disabled=false; btn.classList.remove('is-locked'); btn.classList.add('is-ready');
  var copy=btn.querySelector('[data-saygi-read-copy]'), sub=btn.querySelector('[data-saygi-read-sub]');
  if(copy) copy.textContent='Okudum'; if(sub) sub.textContent='Bugünün kaydına ekle';
  var ic=btn.querySelector('.saygi-read-button-icon'); if(ic) ic.innerHTML=icon('circle-check',19);
}
function wireSaygiReadGate(sc){
  if(!sc) return;
  var person=saygiCurrentPerson(), btn=document.getElementById('saygi-read-button'), sentinel=document.getElementById('saygi-read-sentinel');
  if(!person||!btn||!sentinel||saygiHasRead(person)) return;
  function unlock(){ saygiUnlockReadButton(btn); if(saygiReadObserver){ try{ saygiReadObserver.disconnect(); }catch(e){} saygiReadObserver=null; } }
  if(sc.scrollHeight<=sc.clientHeight+32){ unlock(); return; }
  if(window.IntersectionObserver){
    saygiReadObserver=new IntersectionObserver(function(entries){ for(var i=0;i<entries.length;i++){ if(entries[i].isIntersecting){ unlock(); break; } } },{root:sc,threshold:.72});
    saygiReadObserver.observe(sentinel);
  } else {
    var onScroll=function(){ if(sc.scrollTop+sc.clientHeight>=sc.scrollHeight-28){ sc.removeEventListener('scroll',onScroll); unlock(); } };
    sc.addEventListener('scroll',onScroll,{passive:true}); onScroll();
  }
}

function monthTitle(ym){
  var names=['Ocak','Şubat','Mart','Nisan','Mayıs','Haziran','Temmuz','Ağustos','Eylül','Ekim','Kasım','Aralık'];
  var p=String(ym||todayStr().slice(0,7)).split('-'), y=+p[0], m=+p[1];
  return (names[m-1]||'')+(y?' '+y:'');
}
function headerActionHTML(a){
  if(!a) return '';
  var cls='sey-header-action'+(a.primary?' is-primary':'');
  return '<button class="'+cls+'" '+(a.disabled?'disabled':'onclick="'+a.fn+'"')+' aria-label="'+esc(a.label)+'" title="'+esc(a.label)+'">'
    +icon(a.icon||'sparkles',16)+'<span>'+esc(a.label)+'</span></button>';
}
function appHeaderMeta(){
  var tab=ui.tab||'bugun', ed=editing(), viewDate=activeDate();
  var rec=data.days[viewDate]||null;
  var base={kicker:'Şeyma',title:'Bugün',sub:'Minik Denge Günlüğü',icon:'sun',accent:'#3A4048',accent2:'#A4824C',ink:'#2D2A27',action:null};
  if(tab==='bugun'){
    if(rec) syncDerivedHabits(rec);
    var ht=habitCountOn(viewDate), completed=countRec(rec), curIdx=Math.max(1,dayIndexFor(viewDate));
    base.kicker=ed?'Geçmiş gün':'Gün '+curIdx;
    base.title=ed?dateLabelTR(viewDate):'Bugün';
    base.sub=ed?'Bu gün düzenleniyor':(completed+'/'+ht+' tik · '+(savedToday()?'repoya kaydedildi':'kayıt bekliyor'));
    base.icon='sun'; base.accent='#7B5E2F'; base.accent2='#3E433B'; base.ink='#2D2A27';
    base.action=!syncConfigured()
      ? {label:'Bağlan',icon:'link-2',fn:'App.go(\'ayarlar\')'}
      : (savedToday()?{label:'Kaydedildi',icon:'check',disabled:true}:{label:'Kaydet',icon:'save',fn:'App.saveToday()',primary:true});
  } else if(tab==='saglik'){
    var sl=rec&&rec.sleep&&rec.sleep.hours!=null?(rec.sleep.hours+' sa uyku'):null;
    var steps=trackedSteps(rec);
    base.kicker=ed?'Geçmiş sağlık':'Beden ritmi';
    base.title='Sağlık';
    base.sub=ed?(dateLabelTR(viewDate)+' düzenleniyor'):(sl||(steps?steps.toLocaleString('tr-TR')+' adım':'Uyku, yürüyüş ve döngü'));
    base.icon='activity'; base.accent='#2F6B63'; base.accent2='#60695D'; base.ink='#1F2826';
    if(!ed) base.action={label:'İçe aktar',icon:'apple',fn:'App.importHealthClick()'};
  } else if(tab==='saygi'){
    base.title='Saygı';
    base.icon='trophy'; base.accent='#826936'; base.accent2='#36454B'; base.ink='#242723';
    if(!featuresLive()){
      base.kicker='Yakında'; base.sub='13 Temmuz\'da açılıyor';
    } else {
      var saygiPerson=saygiCurrentPerson(), saygiIndex=saygiPerson?(saygiPeople().indexOf(saygiPerson)+1):0;
      base.kicker=saygiPerson?('Günün öncüsü · '+saygiIndex+'/'+saygiPeople().length):'Günün öncüsü';
      base.sub=saygiPerson?(saygiPerson.name+' · '+saygiPerson.field):'Bilim ve sanatın iz bırakan 100 ismi';
      base.action={label:'Yenile',icon:'rotate-ccw',fn:'App.refreshSaygi()'};
    }
  } else if(tab==='mesaj'){
    var unread=unreadNotifCount();
    var pending=(data.aeon&&Array.isArray(data.aeon.qa))?data.aeon.qa.filter(function(q){return q&&!q.answer;}).length:0;
    base.kicker=unread?('Yeni mesaj · '+unread):'Sohbet merkezi';
    base.title='ÆON';
    base.sub=pending?(pending+' açık soru · Luna modu içeride'):'sınırsız sohbet · Luna modu içeride';
    base.icon='hexagon'; base.accent='#A88444'; base.accent2='#30343A'; base.ink='#1E1B16';
    base.action={label:'Ara',icon:'search',fn:'App.toggleAeonSearch()'};
  } else if(tab==='harita'){
    base.kicker='Takvim';
    base.title=monthTitle(ui.calMonth);
    base.sub='Bir güne dokun; detayını gör ve düzenle';
    base.icon='map'; base.accent='#59695E'; base.accent2='#8A734E'; base.ink='#202722';
    base.action={label:'Bugün',icon:'sun',fn:'App.calToday()'};
  } else if(tab==='rapor'){
    base.kicker=daysTracked()+' gün takip';
    base.title='Rapor';
    base.sub='Verinin bilimsel okuması, ritim ve trendler';
    base.icon='chart-column'; base.accent='#3A4048'; base.accent2='#A4824C'; base.ink='#222528';
    base.action={label:'PDF',icon:'file-text',fn:'App.printReport()',primary:true};
  } else if(tab==='ayarlar'){
    base.kicker=syncConfigured()?'Repo bağlı':'Senkron bekliyor';
    base.title='Ayarlar';
    base.sub='Kişisel bilgiler, senkron ve gizlilik';
    base.icon='settings'; base.accent='#4A4852'; base.accent2='#787064'; base.ink='#26252A';
    base.action=null;
  }
  return base;
}
// Sabit marka başlığı: marka, aktif sayfa kimliği ve tek bağlamsal aksiyon aynı premium yüzeyde.
function appHeaderHTML(){
  var m=appHeaderMeta();
  var h='<header id="sey-appheader" class="sey-appheader" style="--hdr-accent:'+m.accent+';--hdr-accent2:'+m.accent2+';--hdr-ink:'+m.ink+';">';
  h+='<div class="sey-header-top">';
  h+='<button class="sey-header-brand" onclick="App.go(\'bugun\')" aria-label="Bugüne git"><span class="sey-wordmark">Şeyma</span><span class="sey-wordmark-flam">🦩</span></button>';
  h+='<div class="sey-header-tools"><button class="sey-header-mini" onclick="App.toggleTheme()" aria-label="Tema" title="Tema">'+icon(dark?'sun':'moon',16)+'</button></div>';
  h+='</div>';
  h+='<div class="sey-header-main">';
  h+='<span class="sey-header-icon">'+icon(m.icon,21)+'</span>';
  h+='<div class="sey-header-copy"><div class="sey-header-kicker">'+esc(m.kicker||'Şeyma')+'</div><div class="sey-header-title">'+esc(m.title||'Bugün')+'</div><div class="sey-header-sub">'+esc(m.sub||'')+'</div></div>';
  h+=headerActionHTML(m.action);
  h+='</div></header>';
  return h;
}
function wireAppHeaderScroll(sc){
  var hdr=document.getElementById('sey-appheader'); if(!hdr||!sc) return;
  function sync(){ if(sc.scrollTop>18) hdr.classList.add('is-scrolled'); else hdr.classList.remove('is-scrolled'); }
  sc.addEventListener('scroll',sync,{passive:true}); sync();
}
function navHTML(){
  // Alt bar, aktif sayfanın header aksanını paylaşır: iki yüzey tek bir uygulama kabuğu gibi okunur.
  var defs=[
    ['bugun','sun','Bugün','#7B5E2F','#3E433B'],
    ['saglik','flower-2','Sağlık','#2F6B63','#60695D'],
    ['mesaj','hexagon','Aeon','#A88444','#30343A'],
    ['saygi','trophy','Saygı','#826936','#36454B',true],
    ['harita','map','Takvim','#59695E','#8A734E'],
    ['rapor','chart-column','Rapor','#3A4048','#A4824C'],
    ['ayarlar','settings','Ayarlar','#4A4852','#787064']
  ];
  var unread=unreadNotifCount();
  var current=defs[0];
  for(var di=0;di<defs.length;di++){ if(defs[di][0]===ui.tab){ current=defs[di]; break; } }
  var h='<nav class="sey-bottomnav" aria-label="Ana gezinme" style="--nav-active:'+current[3]+';--nav-active2:'+current[4]+';--nav-count:'+defs.length+';">';
  h+='<div class="sey-bottomnav-surface">';
  defs.forEach(function(n){
    var active=ui.tab===n[0];
    var badge=(n[0]==='mesaj'&&unread>0)?'<span class="sey-bottomnav-badge">'+(unread>9?'9+':unread)+'</span>':'';
    var clickFn=n[0]==='mesaj'?'App.openMesaj()':'App.go(\''+n[0]+'\')';
    h+='<button class="sey-bottomnav-item'+(active?' is-active':'')+(n[5]?' is-saygi':'')+'" style="--nav-item-accent:'+n[3]+';--nav-item-accent2:'+n[4]+';" onclick="'+clickFn+'" aria-label="'+n[2]+'"'+(active?' aria-current="page"':'')+'>';
    h+='<span class="sey-bottomnav-icon"><span class="sey-bottomnav-indicator"></span><span class="sey-bottomnav-glyph">'+icon(n[1],20)+'</span>'+badge+'</span>';
    h+='<span class="sey-bottomnav-label">'+n[2]+'</span>';
    h+='</button>';
  });
  h+='</div></nav>';
  return h;
}

// ================= OKUMA HUB (overlay) =================
function overlayShell(closeFn, sticky, body, maxw, fixedH){
  // fixedH: sekmeli hub'larda kart yüksekliğini sabitler → sekme değişince modal
  // boyu zıplamaz (gövde kaydırılır, kabuk sabit kalır).
  var sizeCss=fixedH?'height:88vh;max-height:88vh;':'max-height:88vh;';
  var h='<div id="sey-ov-back" onclick="'+closeFn+'" style="position:fixed;inset:0;z-index:340;background:rgba(44,36,38,0.42);backdrop-filter:blur(4px);display:flex;align-items:flex-end;justify-content:center;padding:14px;animation:seyFade .2s ease;">';
  h+='<div id="sey-ov-card" onclick="event.stopPropagation()" style="width:100%;max-width:'+(maxw||460)+'px;'+sizeCss+'background:var(--modal);border-radius:26px;padding:20px;box-shadow:0 -10px 40px rgba(0,0,0,0.22);animation:seyPop .25s ease;display:flex;flex-direction:column;gap:13px;overflow:hidden;">';
  h+='<div style="flex-shrink:0;display:flex;flex-direction:column;gap:13px;">'+(sticky||'')+'</div>';
  h+='<div id="sey-ov-body" class="scroll" style="flex:1;min-height:0;overflow-y:auto;display:flex;flex-direction:column;gap:14px;margin:0 -4px;padding:4px 4px 2px;">'+(body||'')+'</div>';
  h+='</div></div>';
  return h;
}
function bookStatusChip(st){ var m={reading:['Okunuyor','var(--read)','var(--read-bg)'],finished:['Bitti','var(--ok)','var(--ok-bg)'],dropped:['Bırakıldı','var(--drop)','var(--drop-bg)']}; var c=m[st]||m.reading; return '<span style="font-size:10.5px;font-weight:800;padding:2px 9px;border-radius:999px;color:'+c[1]+';background:'+c[2]+';">'+c[0]+'</span>'; }
function readingOverlayHTML(){
  var view=ui.readingView||'today';
  var head='<div style="display:flex;justify-content:space-between;align-items:flex-start;gap:10px;"><div><div style="font-size:20px;font-weight:800;display:flex;align-items:center;gap:8px;">Ne okudum? '+icon('book-open',19)+'</div><div style="font-size:12.5px;color:var(--faint);margin-top:3px;">Bugünkü okuman, kitaplığın ve alıntıların tek yerde.</div></div><button onclick="App.closeReading()" style="border:none;background:rgba(150,110,120,0.15);cursor:pointer;width:34px;height:34px;border-radius:50%;color:var(--muted);flex-shrink:0;display:flex;align-items:center;justify-content:center;">'+icon('x',16)+'</button></div>';
  var tabs=segTabs([['today','Bugün'],['library',icon('book',13)+' Kitaplık'],['stats',icon('chart-column',13)+' İstatistik'],['quotes',icon('quote',13)+' Alıntılar']],view,'App.setReadingView');
  var body='';
  if(view==='today') body=readingTodayView();
  else if(view==='library') body=readingLibraryView();
  else if(view==='stats') body=readingStatsView();
  else if(view==='quotes') body=readingQuotesView();
  var h=overlayShell('App.closeReading()', head+tabs, body, null, true);
  if(ui.bookEdit) h+=bookEditModal();
  if(ui.quoteDraft) h+=quoteAddModal();
  return h;
}
function readingTodayView(){
  var dr=ui.readingDraft||{title:'',author:'',pages:'',minutes:'',note:''};
  var day=getDay(data,todayStr(),dayIndexFor(todayStr()));
  var rEntries=(day&&day.reading&&Array.isArray(day.reading.entries))?day.reading.entries:[];
  var totPages=rEntries.reduce(function(a,e){ var p=Number(e&&e.pages); return a+((!isNaN(p)&&p>0)?p:0); },0);
  var L=ensureLibrary();
  var goalPg=(L.goal&&L.goal.dailyPages)||0;
  var h='';
  // daily goal ring
  if(goalPg>0){ var gp=Math.min(100,Math.round(totPages/goalPg*100)); h+='<div style="display:flex;align-items:center;gap:13px;background:linear-gradient(135deg,rgba(110,85,191,0.10),rgba(233,175,193,0.12));border:1px solid var(--card-bd);border-radius:18px;padding:13px 15px;">'; h+='<div style="position:relative;width:52px;height:52px;flex-shrink:0;"><svg width="52" height="52" viewBox="0 0 52 52"><circle cx="26" cy="26" r="22" fill="none" stroke="rgba(150,110,120,0.16)" stroke-width="6"></circle><circle cx="26" cy="26" r="22" fill="none" stroke="#6E55BF" stroke-width="6" stroke-linecap="round" stroke-dasharray="'+(2*Math.PI*22)+'" stroke-dashoffset="'+(2*Math.PI*22*(1-gp/100))+'" transform="rotate(-90 26 26)"></circle></svg><div style="position:absolute;inset:0;display:flex;align-items:center;justify-content:center;font-size:12px;font-weight:800;">'+gp+'%</div></div>'; h+='<div style="flex:1;min-width:0;"><div style="font-size:13.5px;font-weight:800;color:var(--text);">Günlük hedef · '+totPages+'/'+goalPg+' sayfa</div><div style="font-size:11.5px;color:var(--muted);line-height:1.35;">'+(totPages>=goalPg?'Bugünün hedefi tamam, harikasın.':'Hedefe '+(goalPg-totPages)+' sayfa kaldı.')+'</div></div></div>'; }
  // quick pick from active books
  var active=L.books.filter(function(b){ return b.status==='reading'; });
  if(active.length){ h+='<div><div style="font-size:11.5px;font-weight:800;color:var(--muted);margin-bottom:6px;letter-spacing:.3px;">OKUDUĞUM KİTAP</div><div style="display:flex;gap:7px;flex-wrap:wrap;">'; active.forEach(function(b){ var on=ui.logBookId===b.id; h+='<button onclick="App.pickLogBook(\''+esc(b.id)+'\')" style="border:1px solid '+(on?'var(--read)':'var(--card-bd)')+';cursor:pointer;padding:7px 11px;border-radius:12px;font-size:12.5px;font-weight:700;color:'+(on?'#fff':'var(--text2)')+';background:'+(on?'linear-gradient(135deg,#6E55BF,#9B7FC9)':'var(--card)')+';display:flex;align-items:center;gap:5px;">'+icon('book-open',12)+' '+esc(b.title.length>18?b.title.slice(0,17)+'…':b.title)+'</button>'; }); h+='</div></div>'; }
  // form
  h+='<div style="display:flex;flex-direction:column;gap:10px;background:var(--card);border:1px solid var(--card-bd);border-radius:18px;padding:14px;">';
  h+='<div><div style="font-size:12px;font-weight:700;color:var(--muted);margin-bottom:5px;">Kitap adı</div><input id="reading-title" type="text" value="'+esc(dr.title||'')+'" oninput="App.onReadingField(\'title\',this)" placeholder="örn. Sefiller" style="width:100%;border:1px solid var(--field-bd);background:var(--field);border-radius:12px;padding:11px 12px;font-size:15px;outline:none;"></div>';
  h+='<div><div style="font-size:12px;font-weight:700;color:var(--muted);margin-bottom:5px;">Yazar <span style="color:var(--faint);font-weight:500;">(isteğe bağlı)</span></div><input type="text" value="'+esc(dr.author||'')+'" oninput="App.onReadingField(\'author\',this)" placeholder="örn. Victor Hugo" style="width:100%;border:1px solid var(--field-bd);background:var(--field);border-radius:12px;padding:11px 12px;font-size:14px;outline:none;"></div>';
  h+='<div style="display:flex;gap:10px;"><div style="flex:1;"><div style="font-size:12px;font-weight:700;color:var(--muted);margin-bottom:5px;">Sayfa</div><input type="number" inputmode="numeric" min="0" value="'+(dr.pages!=null&&dr.pages!==''?esc(dr.pages):'')+'" oninput="App.onReadingField(\'pages\',this)" placeholder="32" style="width:100%;border:1px solid var(--field-bd);background:var(--field);border-radius:12px;padding:11px;font-size:15px;outline:none;text-align:center;"></div>';
  h+='<div style="flex:1;"><div style="font-size:12px;font-weight:700;color:var(--muted);margin-bottom:5px;">Süre (dk)</div><input type="number" inputmode="numeric" min="0" value="'+(dr.minutes!=null&&dr.minutes!==''?esc(dr.minutes):'')+'" oninput="App.onReadingField(\'minutes\',this)" placeholder="20" style="width:100%;border:1px solid var(--field-bd);background:var(--field);border-radius:12px;padding:11px;font-size:15px;outline:none;text-align:center;"></div></div>';
  h+='<div><div style="font-size:12px;font-weight:700;color:var(--muted);margin-bottom:5px;">Not <span style="color:var(--faint);font-weight:500;">(isteğe bağlı)</span></div><textarea rows="2" oninput="App.onReadingField(\'note\',this)" placeholder="Aklında kalan bir cümle, duygu…" style="width:100%;border:1px solid var(--field-bd);background:var(--field);border-radius:12px;padding:10px 12px;font-size:13.5px;outline:none;resize:none;line-height:1.45;">'+esc(dr.note||'')+'</textarea></div>';
  h+='<button onclick="App.addReading()" style="border:none;cursor:pointer;width:100%;padding:14px;border-radius:14px;font-size:15px;font-weight:800;color:#fff;background:linear-gradient(135deg,#6E55BF,#9B7FC9 55%,#E9AFC1);box-shadow:0 10px 24px rgba(110,85,191,0.4);display:flex;align-items:center;justify-content:center;gap:7px;">Okumayı kaydet '+icon('book-open',16)+'</button>';
  h+='</div>';
  if(rEntries.length>0){
    h+='<div style="display:flex;flex-direction:column;gap:8px;">';
    h+='<div style="display:flex;align-items:center;justify-content:space-between;"><div style="font-size:12.5px;font-weight:800;color:var(--muted);letter-spacing:.3px;">BUGÜN ('+rEntries.length+')</div><div style="font-size:11.5px;color:var(--faint);">toplam '+totPages+' sayfa</div></div>';
    rEntries.slice().reverse().forEach(function(e){
      var meta=[], linked=e.bookId?findBook(e.bookId):null, isSaygi=e&&e.source==='saygi', sourceUrl=isSaygi?saygiSafeUrl(e.sourceUrl):'';
      if(e.pages) meta.push(e.pages+' sayfa'); if(e.minutes) meta.push(e.minutes+' dk');
      var chip=isSaygi?'<span style="font-size:10px;color:#77602D;background:rgba(197,163,90,.16);border:1px solid rgba(138,109,54,.26);font-weight:850;letter-spacing:.35px;border-radius:999px;padding:2px 7px;margin-left:5px;">SAYGI</span>':(linked?' <span style="font-size:10.5px;color:var(--read);font-weight:700;">· kitaplıkta</span>':'');
      h+='<div style="display:flex;align-items:flex-start;gap:10px;background:'+(isSaygi?'linear-gradient(135deg,rgba(197,163,90,.10),var(--card))':'var(--card)')+';border:1px solid '+(isSaygi?'rgba(138,109,54,.25)':'var(--card-bd)')+';border-radius:14px;padding:11px 12px;">';
      h+='<span style="line-height:1.2;display:inline-flex;color:'+(isSaygi?'#826936':'var(--read)')+';">'+icon(isSaygi?'trophy':'book-open',18)+'</span><div style="flex:1;min-width:0;">';
      h+='<div style="font-size:13.5px;font-weight:700;color:var(--text);">'+esc(e.title||'(başlıksız)')+chip+'</div>'+(e.author?'<div style="font-size:11.5px;color:var(--faint);">'+esc(e.author)+'</div>':'')+(meta.length?'<div style="font-size:11.5px;color:var(--muted);margin-top:2px;">'+meta.join(' · ')+'</div>':'')+(e.note?'<div style="font-size:12px;color:var(--text2);margin-top:4px;line-height:1.4;">'+esc(e.note)+'</div>':'');
      if(sourceUrl) h+='<a href="'+esc(sourceUrl)+'" target="_blank" rel="noopener noreferrer" style="display:inline-flex;align-items:center;gap:4px;margin-top:6px;color:#826936;font-size:11px;font-weight:800;text-decoration:none;">'+icon('external-link',12)+' '+esc(e.sourceLabel||'Wikipedia kaynağı')+'</a>';
      h+='</div><button onclick="App.removeReading(\''+esc(e.id)+'\')" aria-label="Sil" style="flex-shrink:0;border:none;background:rgba(150,110,120,0.12);cursor:pointer;width:28px;height:28px;border-radius:8px;color:var(--faint);display:flex;align-items:center;justify-content:center;">'+icon('trash-2',13)+'</button></div>';
    });
    h+='</div>';
  } else {
    h+='<div style="text-align:center;font-size:12.5px;color:var(--faint);line-height:1.5;padding:4px 8px;">Henüz bugün için okuma eklemedin. Birkaç sayfa bile sayılır.</div>';
  }
  return h;
}
function bookCard(b){
  var pct=bookPct(b); var meta=[]; if(b.author) meta.push(esc(b.author)); if(b.genre) meta.push(esc(b.genre));
  var h='<div style="background:var(--card);border:1px solid var(--card-bd);border-radius:16px;padding:13px;display:flex;flex-direction:column;gap:9px;">';
  h+='<div style="display:flex;align-items:flex-start;gap:11px;"><div style="width:44px;height:44px;border-radius:12px;background:var(--icon);display:flex;align-items:center;justify-content:center;flex-shrink:0;color:var(--read);">'+icon('book-open',22)+'</div>';
  h+='<div style="flex:1;min-width:0;"><div style="display:flex;align-items:center;gap:7px;flex-wrap:wrap;"><span style="font-size:14.5px;font-weight:800;color:var(--text);">'+esc(b.title)+'</span>'+bookStatusChip(b.status)+'</div>'+(meta.length?'<div style="font-size:11.5px;color:var(--faint);margin-top:1px;">'+meta.join(' · ')+'</div>':'')+'</div>';
  h+='<button onclick="App.openBookEdit(\''+esc(b.id)+'\')" aria-label="Düzenle" style="flex-shrink:0;border:none;background:rgba(150,110,120,0.12);cursor:pointer;width:30px;height:30px;border-radius:9px;color:var(--muted);display:flex;align-items:center;justify-content:center;">'+icon('pen-line',13)+'</button></div>';
  // progress
  if(b.status!=='finished'){
    h+='<div style="display:flex;align-items:center;gap:9px;">';
    h+='<button onclick="App.advanceBook(\''+esc(b.id)+'\',-10)" style="border:1px solid var(--field-bd);cursor:pointer;width:30px;height:30px;border-radius:9px;font-size:15px;font-weight:800;color:var(--muted);background:var(--card);flex-shrink:0;">−</button>';
    h+='<div style="flex:1;min-width:0;">'+progBar(pct)+'<div style="font-size:11px;color:var(--muted);margin-top:4px;display:flex;justify-content:space-between;"><span>'+b.currentPage+(b.totalPages?' / '+b.totalPages+' sf':' sf')+'</span><span>%'+pct+'</span></div></div>';
    h+='<button onclick="App.advanceBook(\''+esc(b.id)+'\',10)" style="border:1px solid var(--field-bd);cursor:pointer;width:30px;height:30px;border-radius:9px;font-size:15px;font-weight:800;color:var(--read);background:var(--card);flex-shrink:0;">+</button>';
    h+='</div>';
    h+='<div style="display:flex;gap:7px;"><button onclick="App.finishBook(\''+esc(b.id)+'\')" style="flex:1;border:none;cursor:pointer;padding:9px;border-radius:11px;font-size:12.5px;font-weight:800;color:#fff;background:linear-gradient(135deg,#7DBE77,#5BA85B);display:flex;align-items:center;justify-content:center;gap:5px;">'+icon('check',13)+' Bitirdim</button>';
    if(b.status==='reading') h+='<button onclick="App.setBookStatus(\''+esc(b.id)+'\',\'dropped\')" style="border:1px solid var(--field-bd);cursor:pointer;padding:9px 12px;border-radius:11px;font-size:12.5px;font-weight:700;color:var(--muted);background:var(--card);">Ara ver</button>';
    else h+='<button onclick="App.setBookStatus(\''+esc(b.id)+'\',\'reading\')" style="border:1px solid var(--field-bd);cursor:pointer;padding:9px 12px;border-radius:11px;font-size:12.5px;font-weight:700;color:var(--read);background:var(--card);">Devam et</button>';
    h+='</div>';
  } else {
    h+='<div style="display:flex;align-items:center;justify-content:space-between;gap:8px;">'+starRow(b.rating,'App.rateBook',b.id,17)+'<button onclick="App.reopenBook(\''+esc(b.id)+'\')" style="border:1px solid var(--field-bd);cursor:pointer;padding:7px 12px;border-radius:11px;font-size:12px;font-weight:700;color:var(--read);background:var(--card);">Yeniden oku</button></div>';
    if(b.finishedAt) h+='<div style="font-size:11px;color:var(--faint);display:flex;align-items:center;gap:4px;">'+icon('trophy',12)+' '+esc(shortDate(fmt(new Date(b.finishedAt))))+' tarihinde bitti</div>';
  }
  return h+'</div>';
}
function readingLibraryView(){
  var L=ensureLibrary();
  var h='<button onclick="App.openBookEdit(\'\')" style="border:1px dashed var(--read);cursor:pointer;width:100%;padding:12px;border-radius:14px;font-size:13.5px;font-weight:800;color:var(--read);background:rgba(155,127,201,0.08);">＋ Kitap ekle</button>';
  var order={reading:0,finished:1,dropped:2};
  var books=L.books.slice().sort(function(a,b){ return (order[a.status]-order[b.status])||String(b.createdAt||'').localeCompare(String(a.createdAt||'')); });
  if(!books.length){ h+='<div style="text-align:center;font-size:12.5px;color:var(--faint);line-height:1.6;padding:22px 10px;">Kitaplığın henüz boş<br>Okumaya başladığın kitabı ekle, ilerlemen burada birer birer biriksin.</div>'; return h; }
  var reading=books.filter(function(b){return b.status==='reading';}),finished=books.filter(function(b){return b.status==='finished';}),dropped=books.filter(function(b){return b.status==='dropped';});
  function sec(title,arr){ if(!arr.length) return ''; var s='<div style="font-size:11.5px;font-weight:800;color:var(--muted);letter-spacing:.3px;margin:4px 2px 0;">'+title+' ('+arr.length+')</div>'; arr.forEach(function(b){ s+=bookCard(b); }); return s; }
  h+='<div style="display:flex;flex-direction:column;gap:10px;">'+sec('OKUYORUM',reading)+sec('BİTİRDİKLERİM',finished)+sec('ARA VERDİKLERİM',dropped)+'</div>';
  return h;
}
function readingStatsView(){
  var L=ensureLibrary(); var s=libStats(); var t=readTotals(); var streak=readStreak(); var week=weekReading();
  var goalY=(L.goal&&L.goal.yearlyBooks)||0; var goalPg=(L.goal&&L.goal.dailyPages)||0;
  var h='<div style="display:flex;gap:9px;">'+statTile('Bitirilen',s.finished,'kitap')+statTile('Okunuyor',s.reading)+statTile('Seri',streak,'gün')+'</div>';
  h+='<div style="display:flex;gap:9px;">'+statTile('Toplam sayfa',t.pages)+statTile('Toplam süre',fmtDur(t.minutes))+statTile('Okuma günü',t.days)+'</div>';
  h+='<div style="background:var(--card);border:1px solid var(--card-bd);border-radius:16px;padding:14px;"><div style="font-size:12.5px;font-weight:800;color:var(--muted);margin-bottom:10px;">Son 7 gün · sayfa</div>'+miniBars(week,'pages','sayfa')+'</div>';
  // yearly goal
  h+='<div style="background:var(--card);border:1px solid var(--card-bd);border-radius:16px;padding:14px;display:flex;flex-direction:column;gap:10px;"><div style="font-size:12.5px;font-weight:800;color:var(--muted);display:flex;align-items:center;gap:5px;">'+icon('target',13)+' Hedefler</div>';
  h+='<div style="display:flex;align-items:center;gap:10px;"><span style="font-size:12.5px;color:var(--text2);flex:1;">Günlük sayfa hedefi</span><input type="number" inputmode="numeric" min="0" value="'+(goalPg||'')+'" oninput="App.setReadGoal(\'dailyPages\',this)" placeholder="20" style="width:74px;border:1px solid var(--field-bd);background:var(--field);border-radius:11px;padding:8px;font-size:14px;text-align:center;outline:none;"></div>';
  h+='<div style="display:flex;align-items:center;gap:10px;"><span style="font-size:12.5px;color:var(--text2);flex:1;">Bu yıl kitap hedefi</span><input type="number" inputmode="numeric" min="0" value="'+(goalY||'')+'" oninput="App.setReadGoal(\'yearlyBooks\',this)" placeholder="24" style="width:74px;border:1px solid var(--field-bd);background:var(--field);border-radius:11px;padding:8px;font-size:14px;text-align:center;outline:none;"></div>';
  if(goalY>0){ var yp=Math.min(100,Math.round(s.finYear/goalY*100)); h+='<div>'+progBar(yp,'linear-gradient(90deg,#7DBE77,#E9AFC1)')+'<div style="font-size:11.5px;color:var(--muted);margin-top:5px;">'+new Date().getFullYear()+': '+s.finYear+'/'+goalY+' kitap · %'+yp+'</div></div>'; }
  h+='</div>';
  return h;
}
function readingQuotesView(){
  var qs=allQuotes(); var L=ensureLibrary();
  var h='<button onclick="App.openQuoteAdd(\'\')" '+(L.books.length?'':'disabled ')+'style="border:1px dashed var(--read);cursor:'+(L.books.length?'pointer':'not-allowed')+';width:100%;padding:12px;border-radius:14px;font-size:13.5px;font-weight:800;color:var(--read);background:rgba(155,127,201,0.08);opacity:'+(L.books.length?'1':'0.5')+';">＋ Alıntı ekle</button>';
  if(!L.books.length){ h+='<div style="text-align:center;font-size:12.5px;color:var(--faint);line-height:1.6;padding:16px 10px;">Alıntı eklemek için önce kitaplığına bir kitap ekle</div>'; return h; }
  if(!qs.length){ h+='<div style="text-align:center;font-size:12.5px;color:var(--faint);line-height:1.6;padding:22px 10px;">Henüz alıntı yok<br>Seni durduran o cümleyi buraya bırak.</div>'; return h; }
  h+='<div style="display:flex;flex-direction:column;gap:10px;">';
  qs.forEach(function(o){ var q=o.q; h+='<div style="background:linear-gradient(135deg,rgba(110,85,191,0.07),rgba(233,175,193,0.09));border:1px solid var(--card-bd);border-radius:16px;padding:14px;position:relative;">'; h+='<div style="position:absolute;top:2px;right:12px;font-size:44px;color:var(--faint);opacity:0.25;line-height:1;">”</div>'; h+='<div style="font-size:14px;line-height:1.5;color:var(--text);font-style:italic;position:relative;">'+esc(q.text)+'</div>'; h+='<div style="display:flex;align-items:center;gap:8px;margin-top:9px;"><span style="font-size:11.5px;color:var(--muted);flex:1;display:flex;align-items:center;gap:4px;">'+icon('book-open',12)+' '+esc(o.title)+(q.page?' · s.'+q.page:'')+'</span>'; h+='<button onclick="App.copyQuoteById(\''+esc(o.bookId)+'\',\''+esc(q.id)+'\')" style="border:none;background:rgba(150,110,120,0.12);cursor:pointer;width:28px;height:28px;border-radius:8px;color:var(--muted);display:flex;align-items:center;justify-content:center;">'+icon('copy',12)+'</button>'; h+='<button onclick="App.removeQuote(\''+esc(o.bookId)+'\',\''+esc(q.id)+'\')" style="border:none;background:rgba(150,110,120,0.12);cursor:pointer;width:28px;height:28px;border-radius:8px;color:var(--faint);display:flex;align-items:center;justify-content:center;">'+icon('trash-2',12)+'</button></div></div>'; });
  h+='</div>';
  return h;
}
function bookEditModal(){
  var b=ui.bookEdit; var isNew=!b.id;
  var inner='<div style="display:flex;justify-content:space-between;align-items:center;"><div style="font-size:17px;font-weight:800;display:flex;align-items:center;gap:7px;">'+(isNew?(icon('book',16)+' Kitap ekle'):'Kitabı düzenle')+'</div><button onclick="App.closeBookEdit()" style="border:none;background:rgba(150,110,120,0.15);cursor:pointer;width:32px;height:32px;border-radius:50%;color:var(--muted);display:flex;align-items:center;justify-content:center;">'+icon('x',15)+'</button></div>';
  inner+='<input type="text" value="'+esc(b.title||'')+'" oninput="App.onBookEditField(\'title\',this)" placeholder="Kitap adı" style="width:100%;border:1px solid var(--field-bd);background:var(--field);border-radius:12px;padding:11px 12px;font-size:15px;outline:none;">';
  inner+='<input type="text" value="'+esc(b.author||'')+'" oninput="App.onBookEditField(\'author\',this)" placeholder="Yazar" style="width:100%;border:1px solid var(--field-bd);background:var(--field);border-radius:12px;padding:11px 12px;font-size:14px;outline:none;">';
  inner+='<div style="display:flex;gap:6px;flex-wrap:wrap;">'; BOOK_GENRES.forEach(function(g){ var on=b.genre===g; inner+='<button onclick="App.pickBookGenre(\''+g+'\')" style="border:1px solid '+(on?'var(--read)':'var(--card-bd)')+';cursor:pointer;padding:6px 10px;border-radius:999px;font-size:11.5px;font-weight:700;color:'+(on?'#fff':'var(--muted)')+';background:'+(on?'linear-gradient(135deg,#6E55BF,#9B7FC9)':'var(--card)')+';">'+g+'</button>'; }); inner+='</div>';
  inner+='<div style="display:flex;align-items:center;gap:10px;"><span style="font-size:12.5px;color:var(--text2);flex:1;">Toplam sayfa <span style="color:var(--faint);">(opsiyonel)</span></span><input type="number" inputmode="numeric" min="0" value="'+(b.totalPages!=null&&b.totalPages!==''?esc(b.totalPages):'')+'" oninput="App.onBookEditField(\'totalPages\',this)" placeholder="—" style="width:90px;border:1px solid var(--field-bd);background:var(--field);border-radius:11px;padding:9px;font-size:14px;text-align:center;outline:none;"></div>';
  inner+='<button onclick="App.saveBook()" style="border:none;cursor:pointer;width:100%;padding:13px;border-radius:13px;font-size:14.5px;font-weight:800;color:#fff;background:linear-gradient(135deg,#6E55BF,#9B7FC9 55%,#E9AFC1);">Kaydet</button>';
  if(!isNew) inner+='<button onclick="App.deleteBook(\''+esc(b.id)+'\')" style="border:none;cursor:pointer;width:100%;padding:11px;border-radius:13px;font-size:13px;font-weight:700;color:#C0605F;background:rgba(220,120,120,0.1);">Kitabı sil</button>';
  return '<div onclick="App.closeBookEdit()" style="position:fixed;inset:0;z-index:360;background:rgba(44,36,38,0.5);backdrop-filter:blur(4px);display:flex;align-items:center;justify-content:center;padding:18px;animation:seyFade .2s ease;"><div onclick="event.stopPropagation()" style="width:100%;max-width:400px;background:var(--modal);border-radius:22px;padding:20px;display:flex;flex-direction:column;gap:12px;max-height:86vh;overflow-y:auto;animation:seyPop .22s ease;">'+inner+'</div></div>';
}
function quoteAddModal(){
  var q=ui.quoteDraft; var L=ensureLibrary(); var books=L.books;
  var inner='<div style="display:flex;justify-content:space-between;align-items:center;"><div style="font-size:17px;font-weight:800;display:flex;align-items:center;gap:7px;">'+icon('quote',16)+' Alıntı ekle</div><button onclick="App.closeQuoteAdd()" style="border:none;background:rgba(150,110,120,0.15);cursor:pointer;width:32px;height:32px;border-radius:50%;color:var(--muted);display:flex;align-items:center;justify-content:center;">'+icon('x',15)+'</button></div>';
  inner+='<div style="font-size:12px;font-weight:700;color:var(--muted);">Kitap</div><div style="display:flex;gap:6px;flex-wrap:wrap;">'; books.forEach(function(b){ var on=q.bookId===b.id; inner+='<button onclick="App.pickQuoteBook(\''+esc(b.id)+'\')" style="border:1px solid '+(on?'var(--read)':'var(--card-bd)')+';cursor:pointer;padding:7px 10px;border-radius:11px;font-size:12px;font-weight:700;color:'+(on?'#fff':'var(--muted)')+';background:'+(on?'linear-gradient(135deg,#6E55BF,#9B7FC9)':'var(--card)')+';display:flex;align-items:center;gap:4px;">'+icon('book-open',12)+' '+esc(b.title.length>16?b.title.slice(0,15)+'…':b.title)+'</button>'; }); inner+='</div>';
  inner+='<textarea rows="3" oninput="App.onQuoteField(\'text\',this)" placeholder="Seni durduran o cümle…" style="width:100%;border:1px solid var(--field-bd);background:var(--field);border-radius:12px;padding:11px 12px;font-size:14px;outline:none;resize:none;line-height:1.5;">'+esc(q.text||'')+'</textarea>';
  inner+='<div style="display:flex;align-items:center;gap:10px;"><span style="font-size:12.5px;color:var(--text2);flex:1;">Sayfa <span style="color:var(--faint);">(opsiyonel)</span></span><input type="number" inputmode="numeric" min="0" value="'+(q.page!=null&&q.page!==''?esc(q.page):'')+'" oninput="App.onQuoteField(\'page\',this)" placeholder="—" style="width:90px;border:1px solid var(--field-bd);background:var(--field);border-radius:11px;padding:9px;font-size:14px;text-align:center;outline:none;"></div>';
  inner+='<button onclick="App.saveQuote()" style="border:none;cursor:pointer;width:100%;padding:13px;border-radius:13px;font-size:14.5px;font-weight:800;color:#fff;background:linear-gradient(135deg,#6E55BF,#9B7FC9 55%,#E9AFC1);">Kaydet</button>';
  return '<div onclick="App.closeQuoteAdd()" style="position:fixed;inset:0;z-index:360;background:rgba(44,36,38,0.5);backdrop-filter:blur(4px);display:flex;align-items:center;justify-content:center;padding:18px;animation:seyFade .2s ease;"><div onclick="event.stopPropagation()" style="width:100%;max-width:400px;background:var(--modal);border-radius:22px;padding:20px;display:flex;flex-direction:column;gap:11px;max-height:86vh;overflow-y:auto;animation:seyPop .22s ease;">'+inner+'</div></div>';
}

// ================= NE İZLEDİM HUB (overlay) =================
function titleStatusChip(st){ var m={watching:['İzleniyor','var(--watch)','var(--watch-bg)'],finished:['Bitti','var(--ok)','var(--ok-bg)'],dropped:['Bırakıldı','var(--pause)','var(--pause-bg)']}; var c=m[st]||m.watching; return '<span style="font-size:10.5px;font-weight:800;padding:2px 9px;border-radius:999px;color:'+c[1]+';background:'+c[2]+';">'+c[0]+'</span>'; }
function watchOverlayHTML(){
  var view=ui.watchView||'today';
  var head='<div style="display:flex;justify-content:space-between;align-items:flex-start;gap:10px;"><div><div style="font-size:20px;font-weight:800;display:flex;align-items:center;gap:8px;">Ne izledim? '+icon('clapperboard',19)+'</div><div style="font-size:12.5px;color:var(--faint);margin-top:3px;">Bugün izlediklerin, arşivin ve unutulmaz replikler.</div></div><button onclick="App.closeWatching()" style="border:none;background:rgba(150,110,120,0.15);cursor:pointer;width:34px;height:34px;border-radius:50%;color:var(--muted);flex-shrink:0;display:flex;align-items:center;justify-content:center;">'+icon('x',16)+'</button></div>';
  var tabs=segTabs([['today','Bugün'],['archive',icon('archive',13)+' Arşiv'],['stats',icon('chart-column',13)+' İstatistik'],['quotes',icon('quote',13)+' Replikler']],view,'App.setWatchView','watch');
  var body='';
  if(view==='today') body=watchTodayView();
  else if(view==='archive') body=watchArchiveView();
  else if(view==='stats') body=watchStatsView();
  else if(view==='quotes') body=watchQuotesView();
  var h=overlayShell('App.closeWatching()', head+tabs, body, null, true);
  if(ui.titleEdit) h+=titleEditModal();
  if(ui.replicaDraft) h+=replicaAddModal();
  return h;
}
function watchTodayView(){
  var d=ui.watchDraft||{title:'',kind:'film',episodes:'',minutes:'',note:''};
  var kind=(d.kind==='dizi')?'dizi':'film';
  var day=getDay(data,todayStr(),dayIndexFor(todayStr()));
  var wEntries=(day&&day.watching&&Array.isArray(day.watching.entries))?day.watching.entries:[];
  var totMin=wEntries.reduce(function(a,e){ var m=Number(e&&e.minutes); return a+((!isNaN(m)&&m>0)?m:0); },0);
  var W=ensureWatchlist();
  var goalMin=(W.goal&&W.goal.dailyMinutes)||0;
  var h='';
  if(goalMin>0){ var gp=Math.min(100,Math.round(totMin/goalMin*100)); h+='<div style="display:flex;align-items:center;gap:13px;background:linear-gradient(135deg,rgba(200,140,70,0.10),rgba(233,175,193,0.12));border:1px solid var(--card-bd);border-radius:18px;padding:13px 15px;">'; h+='<div style="position:relative;width:52px;height:52px;flex-shrink:0;"><svg width="52" height="52" viewBox="0 0 52 52"><circle cx="26" cy="26" r="22" fill="none" stroke="rgba(150,110,120,0.16)" stroke-width="6"></circle><circle cx="26" cy="26" r="22" fill="none" stroke="#C88F4C" stroke-width="6" stroke-linecap="round" stroke-dasharray="'+(2*Math.PI*22)+'" stroke-dashoffset="'+(2*Math.PI*22*(1-gp/100))+'" transform="rotate(-90 26 26)"></circle></svg><div style="position:absolute;inset:0;display:flex;align-items:center;justify-content:center;font-size:12px;font-weight:800;">'+gp+'%</div></div>'; h+='<div style="flex:1;min-width:0;"><div style="font-size:13.5px;font-weight:800;color:var(--text);">Günlük hedef · '+totMin+'/'+goalMin+' dk</div><div style="font-size:11.5px;color:var(--muted);line-height:1.35;">'+(totMin>=goalMin?'Bugünün keyfi tamam':'Keyfe '+(goalMin-totMin)+' dk kaldı.')+'</div></div></div>'; }
  var active=W.items.filter(function(t){ return t.status==='watching'; });
  if(active.length){ h+='<div><div style="font-size:11.5px;font-weight:800;color:var(--muted);margin-bottom:6px;letter-spacing:.3px;">İZLEDİĞİM YAPIM</div><div style="display:flex;gap:7px;flex-wrap:wrap;">'; active.forEach(function(t){ var on=ui.logItemId===t.id; h+='<button onclick="App.pickLogTitle(\''+esc(t.id)+'\')" style="border:1px solid '+(on?'var(--watch)':'var(--card-bd)')+';cursor:pointer;padding:7px 11px;border-radius:12px;font-size:12.5px;font-weight:700;color:'+(on?'#fff':'var(--text2)')+';background:'+(on?'linear-gradient(135deg,#C88F4C,#E0B080)':'var(--card)')+';display:flex;align-items:center;gap:5px;">'+icon('clapperboard',12)+' '+esc(t.title.length>18?t.title.slice(0,17)+'…':t.title)+'</button>'; }); h+='</div></div>'; }
  h+='<div style="display:flex;flex-direction:column;gap:10px;background:var(--card);border:1px solid var(--card-bd);border-radius:18px;padding:14px;">';
  h+='<div style="display:flex;gap:6px;">';
  h+='<button onclick="App.setWatchDraftKind(\'film\')" style="flex:1;border:1px solid '+(kind==='film'?'var(--watch)':'var(--field-bd)')+';cursor:pointer;padding:9px;border-radius:12px;font-size:13px;font-weight:800;color:'+(kind==='film'?'#fff':'var(--muted)')+';background:'+(kind==='film'?'linear-gradient(135deg,#C88F4C,#E0B080)':'var(--field)')+';display:flex;align-items:center;justify-content:center;gap:4px;">'+icon('clapperboard',13)+' Film</button>';
  h+='<button onclick="App.setWatchDraftKind(\'dizi\')" style="flex:1;border:1px solid '+(kind==='dizi'?'var(--watch)':'var(--field-bd)')+';cursor:pointer;padding:9px;border-radius:12px;font-size:13px;font-weight:800;color:'+(kind==='dizi'?'#fff':'var(--muted)')+';background:'+(kind==='dizi'?'linear-gradient(135deg,#C88F4C,#E0B080)':'var(--field)')+';display:flex;align-items:center;justify-content:center;gap:4px;">'+icon('clapperboard',13)+' Dizi</button>';
  h+='</div>';
  h+='<div><div style="font-size:12px;font-weight:700;color:var(--muted);margin-bottom:5px;">'+(kind==='dizi'?'Dizi adı':'Film adı')+'</div><input id="watch-title" type="text" value="'+esc(d.title||'')+'" oninput="App.onWatchField(\'title\',this)" placeholder="'+(kind==='dizi'?'örn. The Bear':'örn. Interstellar')+'" style="width:100%;border:1px solid var(--field-bd);background:var(--field);border-radius:12px;padding:11px 12px;font-size:15px;outline:none;"></div>';
  h+='<div style="display:flex;gap:10px;">';
  if(kind==='dizi') h+='<div style="flex:1;"><div style="font-size:12px;font-weight:700;color:var(--muted);margin-bottom:5px;">Bölüm</div><input type="number" inputmode="numeric" min="0" value="'+(d.episodes!=null&&d.episodes!==''?esc(d.episodes):'')+'" oninput="App.onWatchField(\'episodes\',this)" placeholder="2" style="width:100%;border:1px solid var(--field-bd);background:var(--field);border-radius:12px;padding:11px;font-size:15px;outline:none;text-align:center;"></div>';
  h+='<div style="flex:1;"><div style="font-size:12px;font-weight:700;color:var(--muted);margin-bottom:5px;">Süre (dk)</div><input type="number" inputmode="numeric" min="0" value="'+(d.minutes!=null&&d.minutes!==''?esc(d.minutes):'')+'" oninput="App.onWatchField(\'minutes\',this)" placeholder="'+(kind==='dizi'?'45':'120')+'" style="width:100%;border:1px solid var(--field-bd);background:var(--field);border-radius:12px;padding:11px;font-size:15px;outline:none;text-align:center;"></div>';
  h+='</div>';
  h+='<div><div style="font-size:12px;font-weight:700;color:var(--muted);margin-bottom:5px;">Not <span style="color:var(--faint);font-weight:500;">(isteğe bağlı)</span></div><textarea rows="2" oninput="App.onWatchField(\'note\',this)" placeholder="Aklında kalan sahne, duygu…" style="width:100%;border:1px solid var(--field-bd);background:var(--field);border-radius:12px;padding:10px 12px;font-size:13.5px;outline:none;resize:none;line-height:1.45;">'+esc(d.note||'')+'</textarea></div>';
  h+='<button onclick="App.addWatching()" style="border:none;cursor:pointer;width:100%;padding:14px;border-radius:14px;font-size:15px;font-weight:800;color:#fff;background:linear-gradient(135deg,#C88F4C,#E0B080 55%,#E9AFC1);box-shadow:0 10px 24px rgba(200,143,76,0.38);display:flex;align-items:center;justify-content:center;gap:7px;">İzlemeyi kaydet '+icon('clapperboard',16)+'</button>';
  h+='</div>';
  if(wEntries.length>0){
    h+='<div style="display:flex;flex-direction:column;gap:8px;">';
    h+='<div style="display:flex;align-items:center;justify-content:space-between;"><div style="font-size:12.5px;font-weight:800;color:var(--muted);letter-spacing:.3px;">BUGÜN ('+wEntries.length+')</div><div style="font-size:11.5px;color:var(--faint);">toplam '+fmtDur(totMin)+'</div></div>';
    wEntries.slice().reverse().forEach(function(e){ var meta=[]; if(e.kind==='dizi'&&e.episodes) meta.push(e.episodes+' bölüm'); if(e.minutes) meta.push(e.minutes+' dk'); var linked=e.itemId?findTitle(e.itemId):null; h+='<div style="display:flex;align-items:flex-start;gap:10px;background:var(--card);border:1px solid var(--card-bd);border-radius:14px;padding:11px 12px;"><span style="line-height:1.2;display:inline-flex;color:var(--watch);">'+icon('clapperboard',18)+'</span><div style="flex:1;min-width:0;"><div style="font-size:13.5px;font-weight:700;color:var(--text);">'+esc(e.title||'(başlıksız)')+(linked?' <span style="font-size:10.5px;color:var(--watch);font-weight:700;">· arşivde</span>':'')+'</div>'+(meta.length?'<div style="font-size:11.5px;color:var(--muted);margin-top:2px;">'+meta.join(' · ')+'</div>':'')+(e.note?'<div style="font-size:12px;color:var(--text2);margin-top:4px;line-height:1.4;">'+esc(e.note)+'</div>':'')+'</div><button onclick="App.removeWatching(\''+esc(e.id)+'\')" aria-label="Sil" style="flex-shrink:0;border:none;background:rgba(150,110,120,0.12);cursor:pointer;width:28px;height:28px;border-radius:8px;color:var(--faint);display:flex;align-items:center;justify-content:center;">'+icon('trash-2',13)+'</button></div>'; });
    h+='</div>';
  } else {
    h+='<div style="text-align:center;font-size:12.5px;color:var(--faint);line-height:1.5;padding:4px 8px;">Henüz bugün için izleme eklemedin. Bir bölüm bile keyiftir.</div>';
  }
  return h;
}
function titleCard(t){
  var pct=titlePct(t); var meta=[]; meta.push(t.kind==='dizi'?'Dizi':'Film'); if(t.genre) meta.push(esc(t.genre));
  var h='<div style="background:var(--card);border:1px solid var(--card-bd);border-radius:16px;padding:13px;display:flex;flex-direction:column;gap:9px;">';
  h+='<div style="display:flex;align-items:flex-start;gap:11px;"><div style="width:44px;height:44px;border-radius:12px;background:var(--icon);display:flex;align-items:center;justify-content:center;flex-shrink:0;color:var(--watch);">'+icon('clapperboard',22)+'</div>';
  h+='<div style="flex:1;min-width:0;"><div style="display:flex;align-items:center;gap:7px;flex-wrap:wrap;"><span style="font-size:14.5px;font-weight:800;color:var(--text);">'+esc(t.title)+'</span>'+titleStatusChip(t.status)+'</div><div style="font-size:11.5px;color:var(--faint);margin-top:1px;">'+meta.join(' · ')+'</div></div>';
  h+='<button onclick="App.openTitleEdit(\''+esc(t.id)+'\')" aria-label="Düzenle" style="flex-shrink:0;border:none;background:rgba(150,110,120,0.12);cursor:pointer;width:30px;height:30px;border-radius:9px;color:var(--muted);display:flex;align-items:center;justify-content:center;">'+icon('pen-line',13)+'</button></div>';
  if(t.status!=='finished'){
    if(t.kind==='dizi'){
      h+='<div style="display:flex;align-items:center;gap:9px;">';
      h+='<button onclick="App.advanceTitle(\''+esc(t.id)+'\',-1)" style="border:1px solid var(--field-bd);cursor:pointer;width:30px;height:30px;border-radius:9px;font-size:15px;font-weight:800;color:var(--muted);background:var(--card);flex-shrink:0;">−</button>';
      h+='<div style="flex:1;min-width:0;">'+progBar(pct,'linear-gradient(90deg,#C88F4C,#E9AFC1)')+'<div style="font-size:11px;color:var(--muted);margin-top:4px;display:flex;justify-content:space-between;"><span>'+t.watchedEp+(t.totalEp?' / '+t.totalEp+' bölüm':' bölüm')+'</span><span>%'+pct+'</span></div></div>';
      h+='<button onclick="App.advanceTitle(\''+esc(t.id)+'\',1)" style="border:1px solid var(--field-bd);cursor:pointer;width:30px;height:30px;border-radius:9px;font-size:15px;font-weight:800;color:var(--watch);background:var(--card);flex-shrink:0;">+</button>';
      h+='</div>';
    }
    h+='<div style="display:flex;gap:7px;"><button onclick="App.finishTitle(\''+esc(t.id)+'\')" style="flex:1;border:none;cursor:pointer;padding:9px;border-radius:11px;font-size:12.5px;font-weight:800;color:#fff;background:linear-gradient(135deg,#7DBE77,#5BA85B);display:flex;align-items:center;justify-content:center;gap:5px;">'+icon('check',13)+' Bitirdim</button>';
    if(t.status==='watching') h+='<button onclick="App.setTitleStatus(\''+esc(t.id)+'\',\'dropped\')" style="border:1px solid var(--field-bd);cursor:pointer;padding:9px 12px;border-radius:11px;font-size:12.5px;font-weight:700;color:var(--muted);background:var(--card);">Yarıda bıraktım</button>';
    else h+='<button onclick="App.setTitleStatus(\''+esc(t.id)+'\',\'watching\')" style="border:1px solid var(--field-bd);cursor:pointer;padding:9px 12px;border-radius:11px;font-size:12.5px;font-weight:700;color:var(--watch);background:var(--card);">Devam et</button>';
    h+='</div>';
  } else {
    h+='<div style="display:flex;align-items:center;justify-content:space-between;gap:8px;">'+starRow(t.rating,'App.rateTitle',t.id,17)+'<button onclick="App.reopenTitle(\''+esc(t.id)+'\')" style="border:1px solid var(--field-bd);cursor:pointer;padding:7px 12px;border-radius:11px;font-size:12px;font-weight:700;color:var(--watch);background:var(--card);">Yeniden izle</button></div>';
    if(t.finishedAt) h+='<div style="font-size:11px;color:var(--faint);display:flex;align-items:center;gap:4px;">'+icon('trophy',12)+' '+esc(shortDate(fmt(new Date(t.finishedAt))))+' tarihinde bitti</div>';
  }
  return h+'</div>';
}
function watchArchiveView(){
  var W=ensureWatchlist();
  var h='<button onclick="App.openTitleEdit(\'\')" style="border:1px dashed var(--watch);cursor:pointer;width:100%;padding:12px;border-radius:14px;font-size:13.5px;font-weight:800;color:var(--watch);background:rgba(224,176,128,0.10);">＋ Film / dizi ekle</button>';
  var order={watching:0,finished:1,dropped:2};
  var items=W.items.slice().sort(function(a,b){ return (order[a.status]-order[b.status])||String(b.createdAt||'').localeCompare(String(a.createdAt||'')); });
  if(!items.length){ h+='<div style="text-align:center;font-size:12.5px;color:var(--faint);line-height:1.6;padding:22px 10px;">Arşivin henüz boş<br>İzlemeye başladığın yapımı ekle, ilerlemen burada birik.</div>'; return h; }
  var watching=items.filter(function(t){return t.status==='watching';}),finished=items.filter(function(t){return t.status==='finished';}),dropped=items.filter(function(t){return t.status==='dropped';});
  function sec(title,arr){ if(!arr.length) return ''; var s='<div style="font-size:11.5px;font-weight:800;color:var(--muted);letter-spacing:.3px;margin:4px 2px 0;">'+title+' ('+arr.length+')</div>'; arr.forEach(function(t){ s+=titleCard(t); }); return s; }
  h+='<div style="display:flex;flex-direction:column;gap:10px;">'+sec('İZLİYORUM',watching)+sec('BİTİRDİKLERİM',finished)+sec('YARIDA BIRAKTIKLARIM',dropped)+'</div>';
  return h;
}
function watchStatsView(){
  var W=ensureWatchlist(); var s=watchStats(); var t=watchTotals(); var streak=watchStreak(); var week=weekWatch();
  var goalY=(W.goal&&W.goal.yearlyTitles)||0; var goalMin=(W.goal&&W.goal.dailyMinutes)||0;
  var h='<div style="display:flex;gap:9px;">'+statTile('Bitirilen',s.finished,'yapım')+statTile('İzleniyor',s.watching)+statTile('Seri',streak,'gün')+'</div>';
  h+='<div style="display:flex;gap:9px;">'+statTile('Toplam süre',fmtDur(t.minutes))+statTile('Toplam bölüm',t.eps)+statTile('İzleme günü',t.days)+'</div>';
  h+='<div style="background:var(--card);border:1px solid var(--card-bd);border-radius:16px;padding:14px;"><div style="font-size:12.5px;font-weight:800;color:var(--muted);margin-bottom:10px;">Son 7 gün · dakika</div>'+miniBars(week,'minutes','dk','linear-gradient(180deg,#E0B080,#C88F4C)')+'</div>';
  h+='<div style="background:var(--card);border:1px solid var(--card-bd);border-radius:16px;padding:14px;display:flex;flex-direction:column;gap:10px;"><div style="font-size:12.5px;font-weight:800;color:var(--muted);display:flex;align-items:center;gap:5px;">'+icon('target',13)+' Hedefler</div>';
  h+='<div style="display:flex;align-items:center;gap:10px;"><span style="font-size:12.5px;color:var(--text2);flex:1;">Günlük dakika hedefi</span><input type="number" inputmode="numeric" min="0" value="'+(goalMin||'')+'" oninput="App.setWatchGoal(\'dailyMinutes\',this)" placeholder="40" style="width:74px;border:1px solid var(--field-bd);background:var(--field);border-radius:11px;padding:8px;font-size:14px;text-align:center;outline:none;"></div>';
  h+='<div style="display:flex;align-items:center;gap:10px;"><span style="font-size:12.5px;color:var(--text2);flex:1;">Bu yıl yapım hedefi</span><input type="number" inputmode="numeric" min="0" value="'+(goalY||'')+'" oninput="App.setWatchGoal(\'yearlyTitles\',this)" placeholder="30" style="width:74px;border:1px solid var(--field-bd);background:var(--field);border-radius:11px;padding:8px;font-size:14px;text-align:center;outline:none;"></div>';
  if(goalY>0){ var yp=Math.min(100,Math.round(s.finYear/goalY*100)); h+='<div>'+progBar(yp,'linear-gradient(90deg,#C88F4C,#E9AFC1)')+'<div style="font-size:11.5px;color:var(--muted);margin-top:5px;">'+new Date().getFullYear()+': '+s.finYear+'/'+goalY+' yapım · %'+yp+'</div></div>'; }
  h+='</div>';
  return h;
}
function watchQuotesView(){
  var qs=allReplicas(); var W=ensureWatchlist();
  var h='<button onclick="App.openReplicaAdd(\'\')" '+(W.items.length?'':'disabled ')+'style="border:1px dashed var(--watch);cursor:'+(W.items.length?'pointer':'not-allowed')+';width:100%;padding:12px;border-radius:14px;font-size:13.5px;font-weight:800;color:var(--watch);background:rgba(224,176,128,0.10);opacity:'+(W.items.length?'1':'0.5')+';">＋ Replik ekle</button>';
  if(!W.items.length){ h+='<div style="text-align:center;font-size:12.5px;color:var(--faint);line-height:1.6;padding:16px 10px;">Replik eklemek için önce arşivine bir yapım ekle</div>'; return h; }
  if(!qs.length){ h+='<div style="text-align:center;font-size:12.5px;color:var(--faint);line-height:1.6;padding:22px 10px;">Henüz replik yok<br>O unutamadığın repliği buraya bırak.</div>'; return h; }
  h+='<div style="display:flex;flex-direction:column;gap:10px;">';
  qs.forEach(function(o){ var q=o.q; h+='<div style="background:linear-gradient(135deg,rgba(200,143,76,0.08),rgba(233,175,193,0.09));border:1px solid var(--card-bd);border-radius:16px;padding:14px;position:relative;">'; h+='<div style="position:absolute;top:2px;right:12px;font-size:44px;color:var(--faint);opacity:0.25;line-height:1;">”</div>'; h+='<div style="font-size:14px;line-height:1.5;color:var(--text);font-style:italic;position:relative;">'+esc(q.text)+'</div>'; h+='<div style="display:flex;align-items:center;gap:8px;margin-top:9px;"><span style="font-size:11.5px;color:var(--muted);flex:1;display:flex;align-items:center;gap:4px;">'+icon('clapperboard',12)+' '+esc(o.title)+'</span>'; h+='<button onclick="App.copyReplicaById(\''+esc(o.itemId)+'\',\''+esc(q.id)+'\')" style="border:none;background:rgba(150,110,120,0.12);cursor:pointer;width:28px;height:28px;border-radius:8px;color:var(--muted);display:flex;align-items:center;justify-content:center;">'+icon('copy',12)+'</button>'; h+='<button onclick="App.removeReplica(\''+esc(o.itemId)+'\',\''+esc(q.id)+'\')" style="border:none;background:rgba(150,110,120,0.12);cursor:pointer;width:28px;height:28px;border-radius:8px;color:var(--faint);display:flex;align-items:center;justify-content:center;">'+icon('trash-2',12)+'</button></div></div>'; });
  h+='</div>';
  return h;
}
function titleEditModal(){
  var t=ui.titleEdit; var isNew=!t.id; var kind=(t.kind==='dizi')?'dizi':'film';
  var inner='<div style="display:flex;justify-content:space-between;align-items:center;"><div style="font-size:17px;font-weight:800;display:flex;align-items:center;gap:7px;">'+(isNew?(icon('clapperboard',16)+' Yapım ekle'):'Yapımı düzenle')+'</div><button onclick="App.closeTitleEdit()" style="border:none;background:rgba(150,110,120,0.15);cursor:pointer;width:32px;height:32px;border-radius:50%;color:var(--muted);display:flex;align-items:center;justify-content:center;">'+icon('x',15)+'</button></div>';
  inner+='<div style="display:flex;gap:6px;"><button onclick="App.setTitleEditKind(\'film\')" style="flex:1;border:1px solid '+(kind==='film'?'var(--watch)':'var(--field-bd)')+';cursor:pointer;padding:9px;border-radius:12px;font-size:13px;font-weight:800;color:'+(kind==='film'?'#fff':'var(--muted)')+';background:'+(kind==='film'?'linear-gradient(135deg,#C88F4C,#E0B080)':'var(--field)')+';display:flex;align-items:center;justify-content:center;gap:4px;">'+icon('clapperboard',13)+' Film</button><button onclick="App.setTitleEditKind(\'dizi\')" style="flex:1;border:1px solid '+(kind==='dizi'?'var(--watch)':'var(--field-bd)')+';cursor:pointer;padding:9px;border-radius:12px;font-size:13px;font-weight:800;color:'+(kind==='dizi'?'#fff':'var(--muted)')+';background:'+(kind==='dizi'?'linear-gradient(135deg,#C88F4C,#E0B080)':'var(--field)')+';display:flex;align-items:center;justify-content:center;gap:4px;">'+icon('clapperboard',13)+' Dizi</button></div>';
  inner+='<input type="text" value="'+esc(t.title||'')+'" oninput="App.onTitleEditField(\'title\',this)" placeholder="Yapım adı" style="width:100%;border:1px solid var(--field-bd);background:var(--field);border-radius:12px;padding:11px 12px;font-size:15px;outline:none;">';
  inner+='<div style="display:flex;gap:6px;flex-wrap:wrap;">'; TITLE_GENRES.forEach(function(g){ var on=t.genre===g; inner+='<button onclick="App.pickTitleGenre(\''+g+'\')" style="border:1px solid '+(on?'var(--watch)':'var(--card-bd)')+';cursor:pointer;padding:6px 10px;border-radius:999px;font-size:11.5px;font-weight:700;color:'+(on?'#fff':'var(--muted)')+';background:'+(on?'linear-gradient(135deg,#C88F4C,#E0B080)':'var(--card)')+';">'+g+'</button>'; }); inner+='</div>';
  if(kind==='dizi') inner+='<div style="display:flex;align-items:center;gap:10px;"><span style="font-size:12.5px;color:var(--text2);flex:1;">Toplam bölüm <span style="color:var(--faint);">(opsiyonel)</span></span><input type="number" inputmode="numeric" min="0" value="'+(t.totalEp!=null&&t.totalEp!==''?esc(t.totalEp):'')+'" oninput="App.onTitleEditField(\'totalEp\',this)" placeholder="—" style="width:90px;border:1px solid var(--field-bd);background:var(--field);border-radius:11px;padding:9px;font-size:14px;text-align:center;outline:none;"></div>';
  inner+='<button onclick="App.saveTitle()" style="border:none;cursor:pointer;width:100%;padding:13px;border-radius:13px;font-size:14.5px;font-weight:800;color:#fff;background:linear-gradient(135deg,#C88F4C,#E0B080 55%,#E9AFC1);">Kaydet</button>';
  if(!isNew) inner+='<button onclick="App.deleteTitle(\''+esc(t.id)+'\')" style="border:none;cursor:pointer;width:100%;padding:11px;border-radius:13px;font-size:13px;font-weight:700;color:#C0605F;background:rgba(220,120,120,0.1);">Yapımı sil</button>';
  return '<div onclick="App.closeTitleEdit()" style="position:fixed;inset:0;z-index:360;background:rgba(44,36,38,0.5);backdrop-filter:blur(4px);display:flex;align-items:center;justify-content:center;padding:18px;animation:seyFade .2s ease;"><div onclick="event.stopPropagation()" style="width:100%;max-width:400px;background:var(--modal);border-radius:22px;padding:20px;display:flex;flex-direction:column;gap:12px;max-height:86vh;overflow-y:auto;animation:seyPop .22s ease;">'+inner+'</div></div>';
}
function replicaAddModal(){
  var q=ui.replicaDraft; var W=ensureWatchlist(); var items=W.items;
  var inner='<div style="display:flex;justify-content:space-between;align-items:center;"><div style="font-size:17px;font-weight:800;display:flex;align-items:center;gap:7px;">'+icon('quote',16)+' Replik ekle</div><button onclick="App.closeReplicaAdd()" style="border:none;background:rgba(150,110,120,0.15);cursor:pointer;width:32px;height:32px;border-radius:50%;color:var(--muted);display:flex;align-items:center;justify-content:center;">'+icon('x',15)+'</button></div>';
  inner+='<div style="font-size:12px;font-weight:700;color:var(--muted);">Yapım</div><div style="display:flex;gap:6px;flex-wrap:wrap;">'; items.forEach(function(t){ var on=q.itemId===t.id; inner+='<button onclick="App.pickReplicaTitle(\''+esc(t.id)+'\')" style="border:1px solid '+(on?'var(--watch)':'var(--card-bd)')+';cursor:pointer;padding:7px 10px;border-radius:11px;font-size:12px;font-weight:700;color:'+(on?'#fff':'var(--muted)')+';background:'+(on?'linear-gradient(135deg,#C88F4C,#E0B080)':'var(--card)')+';display:flex;align-items:center;gap:4px;">'+icon('clapperboard',12)+' '+esc(t.title.length>16?t.title.slice(0,15)+'…':t.title)+'</button>'; }); inner+='</div>';
  inner+='<textarea rows="3" oninput="App.onReplicaField(\'text\',this)" placeholder="O unutamadığın replik…" style="width:100%;border:1px solid var(--field-bd);background:var(--field);border-radius:12px;padding:11px 12px;font-size:14px;outline:none;resize:none;line-height:1.5;">'+esc(q.text||'')+'</textarea>';
  inner+='<button onclick="App.saveReplica()" style="border:none;cursor:pointer;width:100%;padding:13px;border-radius:13px;font-size:14.5px;font-weight:800;color:#fff;background:linear-gradient(135deg,#C88F4C,#E0B080 55%,#E9AFC1);">Kaydet</button>';
  return '<div onclick="App.closeReplicaAdd()" style="position:fixed;inset:0;z-index:360;background:rgba(44,36,38,0.5);backdrop-filter:blur(4px);display:flex;align-items:center;justify-content:center;padding:18px;animation:seyFade .2s ease;"><div onclick="event.stopPropagation()" style="width:100%;max-width:400px;background:var(--modal);border-radius:22px;padding:20px;display:flex;flex-direction:column;gap:11px;max-height:86vh;overflow-y:auto;animation:seyPop .22s ease;">'+inner+'</div></div>';
}

// ================= NE DİNLEDİM HUB (overlay) =================
var MUSIC_GENRES=['Pop','Rock','Türkçe','Rap','Elektronik','Caz','Klasik','Akustik','Podcast','Film müziği'];
var LISTEN_KINDS=[['sarki',icon('music',13)+' Şarkı'],['album',icon('disc',13)+' Albüm'],['podcast',icon('mic',13)+' Podcast']];
function listenKindMeta(k){ return (k==='podcast')?{label:'Podcast',icon:'mic'}:(k==='album')?{label:'Albüm',icon:'disc'}:{label:'Şarkı',icon:'music'}; }
function listeningOverlayHTML(){
  var view=ui.listeningView||'today';
  var head='<div style="display:flex;justify-content:space-between;align-items:flex-start;gap:10px;"><div><div style="font-size:20px;font-weight:800;display:flex;align-items:center;gap:8px;">Ne dinledim? '+icon('headphones',19)+'</div><div style="font-size:12.5px;color:var(--faint);margin-top:3px;">Bugün dinlediklerin, favorilerin ve akılda kalan sözler.</div></div><button onclick="App.closeListening()" style="border:none;background:rgba(150,110,120,0.15);cursor:pointer;width:34px;height:34px;border-radius:50%;color:var(--muted);flex-shrink:0;display:flex;align-items:center;justify-content:center;">'+icon('x',16)+'</button></div>';
  var tabs=segTabs([['today','Bugün'],['favs',icon('star',13)+' Favoriler'],['stats',icon('chart-column',13)+' İstatistik'],['lyrics',icon('quote',13)+' Sözler']],view,'App.setListeningView','listen');
  var body='';
  if(view==='today') body=listeningTodayView();
  else if(view==='favs') body=listeningFavsView();
  else if(view==='stats') body=listeningStatsView();
  else if(view==='lyrics') body=listeningLyricsView();
  var h=overlayShell('App.closeListening()', head+tabs, body, null, true);
  if(ui.trackEdit) h+=trackEditModal();
  if(ui.lyricDraft) h+=lyricAddModal();
  return h;
}
function listeningTodayView(){
  var d=ui.listeningDraft||{title:'',artist:'',kind:'sarki',minutes:'',note:''};
  var kind=(['sarki','album','podcast'].indexOf(d.kind)>=0)?d.kind:'sarki';
  var day=getDay(data,todayStr(),dayIndexFor(todayStr()));
  var lEntries=(day&&day.listening&&Array.isArray(day.listening.entries))?day.listening.entries:[];
  var totMin=lEntries.reduce(function(a,e){ var m=Number(e&&e.minutes); return a+((!isNaN(m)&&m>0)?m:0); },0);
  var M=ensureMusic();
  var goalMin=(M.goal&&M.goal.dailyMinutes)||0;
  var h='';
  if(goalMin>0){ var gp=Math.min(100,Math.round(totMin/goalMin*100)); h+='<div style="display:flex;align-items:center;gap:13px;background:linear-gradient(135deg,rgba(14,154,167,0.10),rgba(233,175,193,0.12));border:1px solid var(--card-bd);border-radius:18px;padding:13px 15px;">'; h+='<div style="position:relative;width:52px;height:52px;flex-shrink:0;"><svg width="52" height="52" viewBox="0 0 52 52"><circle cx="26" cy="26" r="22" fill="none" stroke="rgba(150,110,120,0.16)" stroke-width="6"></circle><circle cx="26" cy="26" r="22" fill="none" stroke="#0E9AA7" stroke-width="6" stroke-linecap="round" stroke-dasharray="'+(2*Math.PI*22)+'" stroke-dashoffset="'+(2*Math.PI*22*(1-gp/100))+'" transform="rotate(-90 26 26)"></circle></svg><div style="position:absolute;inset:0;display:flex;align-items:center;justify-content:center;font-size:12px;font-weight:800;">'+gp+'%</div></div>'; h+='<div style="flex:1;min-width:0;"><div style="font-size:13.5px;font-weight:800;color:var(--text);">Günlük hedef · '+totMin+'/'+goalMin+' dk</div><div style="font-size:11.5px;color:var(--muted);line-height:1.35;">'+(totMin>=goalMin?'Bugünün müziği tamam':'Hedefe '+(goalMin-totMin)+' dk kaldı.')+'</div></div></div>'; }
  var favs=M.items;
  if(favs.length){ h+='<div><div style="font-size:11.5px;font-weight:800;color:var(--muted);margin-bottom:6px;letter-spacing:.3px;">FAVORİLERİMDEN</div><div style="display:flex;gap:7px;flex-wrap:wrap;">'; favs.slice(0,8).forEach(function(x){ var on=ui.logTrackId===x.id; h+='<button onclick="App.pickLogTrack(\''+esc(x.id)+'\')" style="border:1px solid '+(on?'var(--listen)':'var(--card-bd)')+';cursor:pointer;padding:7px 11px;border-radius:12px;font-size:12.5px;font-weight:700;color:'+(on?'#fff':'var(--text2)')+';background:'+(on?'linear-gradient(135deg,#0E9AA7,#2BC4C4)':'var(--card)')+';display:flex;align-items:center;gap:5px;">'+icon('music',12)+' '+esc(x.title.length>18?x.title.slice(0,17)+'…':x.title)+'</button>'; }); h+='</div></div>'; }
  h+='<div style="display:flex;flex-direction:column;gap:10px;background:var(--card);border:1px solid var(--card-bd);border-radius:18px;padding:14px;">';
  h+='<div style="display:flex;gap:6px;">';
  LISTEN_KINDS.forEach(function(kk){ var on=kind===kk[0]; h+='<button onclick="App.setListenDraftKind(\''+kk[0]+'\')" style="flex:1;border:1px solid '+(on?'var(--listen)':'var(--field-bd)')+';cursor:pointer;padding:9px 4px;border-radius:12px;font-size:12.5px;font-weight:800;color:'+(on?'#fff':'var(--muted)')+';background:'+(on?'linear-gradient(135deg,#0E9AA7,#2BC4C4)':'var(--field)')+';">'+kk[1]+'</button>'; });
  h+='</div>';
  var titleLabel=kind==='podcast'?'Bölüm / podcast adı':(kind==='album'?'Albüm adı':'Şarkı adı');
  var titlePh=kind==='podcast'?'örn. Söz Müzik #42':(kind==='album'?'örn. Random Access Memories':'örn. Bir Derdim Var');
  h+='<div><div style="font-size:12px;font-weight:700;color:var(--muted);margin-bottom:5px;">'+titleLabel+'</div><input id="listening-title" type="text" value="'+esc(d.title||'')+'" oninput="App.onListeningField(\'title\',this)" placeholder="'+titlePh+'" style="width:100%;border:1px solid var(--field-bd);background:var(--field);border-radius:12px;padding:11px 12px;font-size:15px;outline:none;"></div>';
  h+='<div style="display:flex;gap:10px;"><div style="flex:1;min-width:0;"><div style="font-size:12px;font-weight:700;color:var(--muted);margin-bottom:5px;">'+(kind==='podcast'?'Yayıncı':'Sanatçı')+' <span style="color:var(--faint);font-weight:500;">(ops.)</span></div><input type="text" value="'+esc(d.artist||'')+'" oninput="App.onListeningField(\'artist\',this)" placeholder="'+(kind==='podcast'?'örn. Podbee':'örn. MFÖ')+'" style="width:100%;border:1px solid var(--field-bd);background:var(--field);border-radius:12px;padding:11px 12px;font-size:14px;outline:none;"></div>';
  h+='<div style="width:104px;flex-shrink:0;"><div style="font-size:12px;font-weight:700;color:var(--muted);margin-bottom:5px;">Süre (dk)</div><input type="number" inputmode="numeric" min="0" value="'+(d.minutes!=null&&d.minutes!==''?esc(d.minutes):'')+'" oninput="App.onListeningField(\'minutes\',this)" placeholder="'+(kind==='podcast'?'45':'20')+'" style="width:100%;border:1px solid var(--field-bd);background:var(--field);border-radius:12px;padding:11px;font-size:15px;outline:none;text-align:center;"></div></div>';
  h+='<div><div style="font-size:12px;font-weight:700;color:var(--muted);margin-bottom:5px;">Not <span style="color:var(--faint);font-weight:500;">(isteğe bağlı)</span></div><textarea rows="2" oninput="App.onListeningField(\'note\',this)" placeholder="Ruh hâline nasıl dokundu…" style="width:100%;border:1px solid var(--field-bd);background:var(--field);border-radius:12px;padding:10px 12px;font-size:13.5px;outline:none;resize:none;line-height:1.45;">'+esc(d.note||'')+'</textarea></div>';
  h+='<button onclick="App.addListening()" style="border:none;cursor:pointer;width:100%;padding:14px;border-radius:14px;font-size:15px;font-weight:800;color:#fff;background:linear-gradient(135deg,#0E9AA7,#2BC4C4 55%,#E9AFC1);box-shadow:0 10px 24px rgba(14,154,167,0.34);display:flex;align-items:center;justify-content:center;gap:7px;">Dinlemeyi kaydet '+icon('headphones',16)+'</button>';
  h+='</div>';
  if(lEntries.length>0){
    h+='<div style="display:flex;flex-direction:column;gap:8px;">';
    h+='<div style="display:flex;align-items:center;justify-content:space-between;"><div style="font-size:12.5px;font-weight:800;color:var(--muted);letter-spacing:.3px;">BUGÜN ('+lEntries.length+')</div><div style="font-size:11.5px;color:var(--faint);">toplam '+fmtDur(totMin)+'</div></div>';
    lEntries.slice().reverse().forEach(function(e){ var meta=[]; var km=listenKindMeta(e.kind); meta.push(km.label); if(e.minutes) meta.push(e.minutes+' dk'); var linked=e.itemId?findTrack(e.itemId):null; h+='<div style="display:flex;align-items:flex-start;gap:10px;background:var(--card);border:1px solid var(--card-bd);border-radius:14px;padding:11px 12px;"><span style="line-height:1.2;display:inline-flex;color:var(--listen);">'+icon(km.icon,18)+'</span><div style="flex:1;min-width:0;"><div style="font-size:13.5px;font-weight:700;color:var(--text);">'+esc(e.title||'(başlıksız)')+(linked?' <span style="font-size:10.5px;color:var(--listen);font-weight:700;">· favori</span>':'')+'</div>'+(e.artist?'<div style="font-size:11.5px;color:var(--faint);">'+esc(e.artist)+'</div>':'')+'<div style="font-size:11.5px;color:var(--muted);margin-top:2px;">'+meta.join(' · ')+'</div>'+(e.note?'<div style="font-size:12px;color:var(--text2);margin-top:4px;line-height:1.4;">'+esc(e.note)+'</div>':'')+'</div><button onclick="App.removeListening(\''+esc(e.id)+'\')" aria-label="Sil" style="flex-shrink:0;border:none;background:rgba(150,110,120,0.12);cursor:pointer;width:28px;height:28px;border-radius:8px;color:var(--faint);display:flex;align-items:center;justify-content:center;">'+icon('trash-2',13)+'</button></div>'; });
    h+='</div>';
  } else {
    h+='<div style="text-align:center;font-size:12.5px;color:var(--faint);line-height:1.5;padding:4px 8px;">Henüz bugün için dinleme eklemedin. Bir şarkı bile sayılır.</div>';
  }
  return h;
}
function trackCard(x){
  var km=listenKindMeta(x.kind); var meta=[km.label]; if(x.artist) meta.push(esc(x.artist)); if(x.genre) meta.push(esc(x.genre));
  var h='<div style="background:var(--card);border:1px solid var(--card-bd);border-radius:16px;padding:13px;display:flex;flex-direction:column;gap:9px;">';
  h+='<div style="display:flex;align-items:flex-start;gap:11px;"><div style="width:44px;height:44px;border-radius:12px;background:var(--icon);display:flex;align-items:center;justify-content:center;flex-shrink:0;color:var(--listen);">'+icon(km.icon,22)+'</div>';
  h+='<div style="flex:1;min-width:0;"><div style="font-size:14.5px;font-weight:800;color:var(--text);">'+esc(x.title)+'</div><div style="font-size:11.5px;color:var(--faint);margin-top:1px;">'+meta.join(' · ')+'</div></div>';
  h+='<button onclick="App.openTrackEdit(\''+esc(x.id)+'\')" aria-label="Düzenle" style="flex-shrink:0;border:none;background:rgba(150,110,120,0.12);cursor:pointer;width:30px;height:30px;border-radius:9px;color:var(--muted);display:flex;align-items:center;justify-content:center;">'+icon('pen-line',13)+'</button></div>';
  h+=starRow(x.rating,'App.rateTrack',x.id,17);
  return h+'</div>';
}
function listeningFavsView(){
  var M=ensureMusic();
  var h='<button onclick="App.openTrackEdit(\'\')" style="border:1px dashed var(--listen);cursor:pointer;width:100%;padding:12px;border-radius:14px;font-size:13.5px;font-weight:800;color:var(--listen);background:rgba(14,154,167,0.08);">＋ Favori ekle</button>';
  var items=M.items.slice().sort(function(a,b){ return String(b.createdAt||'').localeCompare(String(a.createdAt||'')); });
  if(!items.length){ h+='<div style="text-align:center;font-size:12.5px;color:var(--faint);line-height:1.6;padding:22px 10px;">Favori listen henüz boş<br>Sevdiğin şarkı, albüm ya da podcast’i ekle; burada birer birer birikssin.</div>'; return h; }
  function sec(title,arr){ if(!arr.length) return ''; var s='<div style="font-size:11.5px;font-weight:800;color:var(--muted);letter-spacing:.3px;margin:4px 2px 0;">'+title+' ('+arr.length+')</div>'; arr.forEach(function(x){ s+=trackCard(x); }); return s; }
  var sarki=items.filter(function(x){return x.kind==='sarki';}),album=items.filter(function(x){return x.kind==='album';}),pod=items.filter(function(x){return x.kind==='podcast';});
  h+='<div style="display:flex;flex-direction:column;gap:10px;">'+sec('ŞARKILAR',sarki)+sec('ALBÜMLER',album)+sec('PODCASTLER',pod)+'</div>';
  return h;
}
function listeningStatsView(){
  var M=ensureMusic(); var s=musicStats(); var t=listenTotals(); var streak=listenStreak(); var week=weekListen();
  var goalMin=(M.goal&&M.goal.dailyMinutes)||0;
  var h='<div style="display:flex;gap:9px;">'+statTile('Favori',s.total,'parça')+statTile('Dinleme günü',t.days)+statTile('Seri',streak,'gün')+'</div>';
  h+='<div style="display:flex;gap:9px;">'+statTile('Toplam süre',fmtDur(t.minutes))+statTile('Kayıt',t.items)+statTile('Podcast',s.podcast)+'</div>';
  h+='<div style="background:var(--card);border:1px solid var(--card-bd);border-radius:16px;padding:14px;"><div style="font-size:12.5px;font-weight:800;color:var(--muted);margin-bottom:10px;">Son 7 gün · dakika</div>'+miniBars(week,'minutes','dk','linear-gradient(180deg,#2BC4C4,#0E9AA7)')+'</div>';
  h+='<div style="background:var(--card);border:1px solid var(--card-bd);border-radius:16px;padding:14px;display:flex;flex-direction:column;gap:10px;"><div style="font-size:12.5px;font-weight:800;color:var(--muted);display:flex;align-items:center;gap:5px;">'+icon('target',13)+' Hedef</div>';
  h+='<div style="display:flex;align-items:center;gap:10px;"><span style="font-size:12.5px;color:var(--text2);flex:1;">Günlük dinleme hedefi (dk)</span><input type="number" inputmode="numeric" min="0" value="'+(goalMin||'')+'" oninput="App.setListenGoal(\'dailyMinutes\',this)" placeholder="30" style="width:74px;border:1px solid var(--field-bd);background:var(--field);border-radius:11px;padding:8px;font-size:14px;text-align:center;outline:none;"></div>';
  h+='</div>';
  return h;
}
function listeningLyricsView(){
  var qs=allLyrics(); var M=ensureMusic();
  var h='<button onclick="App.openLyricAdd(\'\')" '+(M.items.length?'':'disabled ')+'style="border:1px dashed var(--listen);cursor:'+(M.items.length?'pointer':'not-allowed')+';width:100%;padding:12px;border-radius:14px;font-size:13.5px;font-weight:800;color:var(--listen);background:rgba(14,154,167,0.08);opacity:'+(M.items.length?'1':'0.5')+';">＋ Söz ekle</button>';
  if(!M.items.length){ h+='<div style="text-align:center;font-size:12.5px;color:var(--faint);line-height:1.6;padding:16px 10px;">Söz eklemek için önce favorilerine bir parça ekle</div>'; return h; }
  if(!qs.length){ h+='<div style="text-align:center;font-size:12.5px;color:var(--faint);line-height:1.6;padding:22px 10px;">Henüz söz yok<br>İçine işleyen o dizeyi buraya bırak.</div>'; return h; }
  h+='<div style="display:flex;flex-direction:column;gap:10px;">';
  qs.forEach(function(o){ var q=o.q; h+='<div style="background:linear-gradient(135deg,rgba(14,154,167,0.08),rgba(233,175,193,0.09));border:1px solid var(--card-bd);border-radius:16px;padding:14px;position:relative;">'; h+='<div style="position:absolute;top:2px;right:12px;font-size:44px;color:var(--faint);opacity:0.25;line-height:1;">”</div>'; h+='<div style="font-size:14px;line-height:1.5;color:var(--text);font-style:italic;position:relative;">'+esc(q.text)+'</div>'; h+='<div style="display:flex;align-items:center;gap:8px;margin-top:9px;"><span style="font-size:11.5px;color:var(--muted);flex:1;display:flex;align-items:center;gap:4px;">'+icon('music',12)+' '+esc(o.title)+(o.artist?' · '+esc(o.artist):'')+'</span>'; h+='<button onclick="App.copyLyricById(\''+esc(o.itemId)+'\',\''+esc(q.id)+'\')" style="border:none;background:rgba(150,110,120,0.12);cursor:pointer;width:28px;height:28px;border-radius:8px;color:var(--muted);display:flex;align-items:center;justify-content:center;">'+icon('copy',12)+'</button>'; h+='<button onclick="App.removeLyric(\''+esc(o.itemId)+'\',\''+esc(q.id)+'\')" style="border:none;background:rgba(150,110,120,0.12);cursor:pointer;width:28px;height:28px;border-radius:8px;color:var(--faint);display:flex;align-items:center;justify-content:center;">'+icon('trash-2',12)+'</button></div></div>'; });
  h+='</div>';
  return h;
}
function trackEditModal(){
  var x=ui.trackEdit; var isNew=!x.id; var kind=(['sarki','album','podcast'].indexOf(x.kind)>=0)?x.kind:'sarki';
  var inner='<div style="display:flex;justify-content:space-between;align-items:center;"><div style="font-size:17px;font-weight:800;display:flex;align-items:center;gap:7px;">'+(isNew?(icon('music',16)+' Favori ekle'):'Favoriyi düzenle')+'</div><button onclick="App.closeTrackEdit()" style="border:none;background:rgba(150,110,120,0.15);cursor:pointer;width:32px;height:32px;border-radius:50%;color:var(--muted);display:flex;align-items:center;justify-content:center;">'+icon('x',15)+'</button></div>';
  inner+='<div style="display:flex;gap:6px;">'; LISTEN_KINDS.forEach(function(kk){ var on=kind===kk[0]; inner+='<button onclick="App.setTrackEditKind(\''+kk[0]+'\')" style="flex:1;border:1px solid '+(on?'var(--listen)':'var(--field-bd)')+';cursor:pointer;padding:9px 4px;border-radius:12px;font-size:12.5px;font-weight:800;color:'+(on?'#fff':'var(--muted)')+';background:'+(on?'linear-gradient(135deg,#0E9AA7,#2BC4C4)':'var(--field)')+';">'+kk[1]+'</button>'; }); inner+='</div>';
  inner+='<input type="text" value="'+esc(x.title||'')+'" oninput="App.onTrackEditField(\'title\',this)" placeholder="Ad (şarkı / albüm / podcast)" style="width:100%;border:1px solid var(--field-bd);background:var(--field);border-radius:12px;padding:11px 12px;font-size:15px;outline:none;">';
  inner+='<input type="text" value="'+esc(x.artist||'')+'" oninput="App.onTrackEditField(\'artist\',this)" placeholder="Sanatçı / yayıncı" style="width:100%;border:1px solid var(--field-bd);background:var(--field);border-radius:12px;padding:11px 12px;font-size:14px;outline:none;">';
  inner+='<div style="display:flex;gap:6px;flex-wrap:wrap;">'; MUSIC_GENRES.forEach(function(g){ var on=x.genre===g; inner+='<button onclick="App.pickTrackGenre(\''+esc(g)+'\')" style="border:1px solid '+(on?'var(--listen)':'var(--card-bd)')+';cursor:pointer;padding:6px 10px;border-radius:999px;font-size:11.5px;font-weight:700;color:'+(on?'#fff':'var(--muted)')+';background:'+(on?'linear-gradient(135deg,#0E9AA7,#2BC4C4)':'var(--card)')+';">'+esc(g)+'</button>'; }); inner+='</div>';
  inner+='<button onclick="App.saveTrack()" style="border:none;cursor:pointer;width:100%;padding:13px;border-radius:13px;font-size:15px;font-weight:800;color:#fff;background:linear-gradient(135deg,#0E9AA7,#2BC4C4);">Kaydet</button>';
  if(!isNew) inner+='<button onclick="App.deleteTrack(\''+esc(x.id)+'\')" style="border:1px solid var(--field-bd);cursor:pointer;width:100%;padding:11px;border-radius:13px;font-size:13px;font-weight:700;color:var(--drop);background:var(--card);">Sil</button>';
  return '<div onclick="App.closeTrackEdit()" style="position:fixed;inset:0;z-index:360;background:rgba(44,36,38,0.5);backdrop-filter:blur(4px);display:flex;align-items:center;justify-content:center;padding:18px;animation:seyFade .2s ease;"><div onclick="event.stopPropagation()" style="width:100%;max-width:400px;background:var(--modal);border-radius:22px;padding:20px;display:flex;flex-direction:column;gap:11px;max-height:86vh;overflow-y:auto;animation:seyPop .22s ease;">'+inner+'</div></div>';
}
function lyricAddModal(){
  var M=ensureMusic(); var dr=ui.lyricDraft||{itemId:'',text:''};
  var inner='<div style="display:flex;justify-content:space-between;align-items:center;"><div style="font-size:17px;font-weight:800;display:flex;align-items:center;gap:7px;">'+icon('quote',16)+' Söz ekle</div><button onclick="App.closeLyricAdd()" style="border:none;background:rgba(150,110,120,0.15);cursor:pointer;width:32px;height:32px;border-radius:50%;color:var(--muted);display:flex;align-items:center;justify-content:center;">'+icon('x',15)+'</button></div>';
  inner+='<div style="font-size:12px;font-weight:700;color:var(--muted);">Parça</div><div style="display:flex;gap:6px;flex-wrap:wrap;">'; M.items.forEach(function(x){ var on=dr.itemId===x.id; inner+='<button onclick="App.pickLyricTrack(\''+esc(x.id)+'\')" style="border:1px solid '+(on?'var(--listen)':'var(--card-bd)')+';cursor:pointer;padding:7px 10px;border-radius:11px;font-size:12px;font-weight:700;color:'+(on?'#fff':'var(--muted)')+';background:'+(on?'linear-gradient(135deg,#0E9AA7,#2BC4C4)':'var(--card)')+';display:flex;align-items:center;gap:4px;">'+icon('music',12)+' '+esc(x.title.length>16?x.title.slice(0,15)+'…':x.title)+'</button>'; }); inner+='</div>';
  inner+='<textarea rows="4" oninput="App.onLyricField(\'text\',this)" placeholder="İçine işleyen o dize…" style="width:100%;border:1px solid var(--field-bd);background:var(--field);border-radius:12px;padding:11px 12px;font-size:14px;outline:none;resize:none;line-height:1.5;">'+esc(dr.text||'')+'</textarea>';
  inner+='<button onclick="App.saveLyric()" style="border:none;cursor:pointer;width:100%;padding:13px;border-radius:13px;font-size:14.5px;font-weight:800;color:#fff;background:linear-gradient(135deg,#0E9AA7,#2BC4C4 55%,#E9AFC1);display:flex;align-items:center;justify-content:center;gap:6px;">Kaydet '+icon('quote',15)+'</button>';
  return '<div onclick="App.closeLyricAdd()" style="position:fixed;inset:0;z-index:360;background:rgba(44,36,38,0.5);backdrop-filter:blur(4px);display:flex;align-items:center;justify-content:center;padding:18px;animation:seyFade .2s ease;"><div onclick="event.stopPropagation()" style="width:100%;max-width:400px;background:var(--modal);border-radius:22px;padding:20px;display:flex;flex-direction:column;gap:11px;max-height:86vh;overflow-y:auto;animation:seyPop .22s ease;">'+inner+'</div></div>';
}

function learningEntryCard(e){
  var when=e&&e.ts?wxHm(e.ts):'';
  var h='<div class="glass" style="border-radius:16px;padding:13px;display:flex;gap:11px;align-items:flex-start;border:1px solid color-mix(in srgb,var(--learn) 20%, var(--card-bd));">';
  h+='<span style="width:32px;height:32px;border-radius:10px;flex-shrink:0;display:inline-flex;align-items:center;justify-content:center;color:var(--learn);background:var(--learn-bg);">'+icon('lightbulb',16)+'</span>';
  h+='<div style="flex:1;min-width:0;">';
  h+='<div style="font-size:14px;font-weight:700;color:var(--text);line-height:1.35;">'+esc(e.topic||'')+'</div>';
  if(e.source&&String(e.source).trim()) h+='<div style="font-size:12px;color:var(--learn);font-weight:600;margin-top:3px;display:flex;align-items:center;gap:4px;">'+icon('bookmark',11)+' '+esc(e.source)+'</div>';
  if(e.note&&String(e.note).trim()) h+='<div style="font-size:12.5px;color:var(--text2);line-height:1.45;margin-top:5px;">'+esc(e.note)+'</div>';
  if(when) h+='<div style="font-size:10.5px;color:var(--faint);margin-top:5px;">'+esc(when)+'</div>';
  h+='</div>';
  h+='<button onclick="App.removeLearning(\''+esc(e.id)+'\')" aria-label="Sil" style="flex-shrink:0;border:none;cursor:pointer;width:28px;height:28px;border-radius:9px;background:rgba(220,120,120,0.1);color:#C0605F;font-size:14px;">\u00d7</button>';
  h+='</div>';
  return h;
}
function learningTodayView(){
  var d=ui.learningDraft||{topic:'',source:'',note:''};
  var day=getDay(data,todayStr(),dayIndexFor(todayStr()));
  var entries=(day.learning&&Array.isArray(day.learning.entries))?day.learning.entries:[];
  var fld='width:100%;border:1px solid var(--field-bd);background:var(--field);border-radius:12px;padding:11px 12px;font-size:14px;outline:none;color:var(--text);box-sizing:border-box;';
  var h='';
  h+='<div class="glass" style="border-radius:20px;padding:15px;display:flex;flex-direction:column;gap:10px;border:1px solid color-mix(in srgb,var(--learn) 26%, var(--card-bd));box-shadow:0 10px 26px rgba(108,74,58,0.06);">';
  h+='<div style="font-size:14px;font-weight:800;color:var(--text);display:flex;align-items:center;gap:7px;"><span style="color:var(--learn);display:inline-flex;">'+icon('sparkles',16)+'</span>Bugün ne öğrendim?</div>';
  h+='<input id="learning-topic" value="'+esc(d.topic||'')+'" oninput="App.onLearningField(\'topic\',this)" placeholder="örn. Nefes tekniği kalbi yavaşlatıyor" maxlength="140" style="'+fld+'">';
  h+='<input value="'+esc(d.source||'')+'" oninput="App.onLearningField(\'source\',this)" placeholder="Kaynak: kitap, video, sohbet…" maxlength="120" style="'+fld+'">';
  h+='<textarea oninput="App.onLearningField(\'note\',this)" placeholder="Kısa bir not (isteğe bağlı)" rows="2" style="'+fld+'resize:none;line-height:1.5;">'+esc(d.note||'')+'</textarea>';
  h+='<button onclick="App.addLearning()" style="border:none;cursor:pointer;width:100%;padding:13px;border-radius:13px;font-size:14.5px;font-weight:800;color:#fff;background:linear-gradient(135deg,var(--learn),#C9B8FF);display:flex;align-items:center;justify-content:center;gap:6px;">Ekle '+icon('plus',15)+'</button>';
  h+='</div>';
  if(entries.length){
    h+='<div style="font-size:12.5px;font-weight:800;color:var(--muted);margin-top:2px;">Bugün · '+entries.length+' kayıt</div>';
    entries.slice().reverse().forEach(function(e){ h+=learningEntryCard(e); });
  } else {
    h+='<div style="text-align:center;color:var(--faint);font-size:13px;padding:20px 16px;line-height:1.5;"><span style="display:inline-flex;">'+icon('graduation-cap',26)+'</span><div style="margin-top:8px;">Henüz kayıt yok — bugün öğrendiğin ilk şeyi ekle.</div></div>';
  }
  return h;
}
function learningOverlayHTML(){
  var head='<div style="display:flex;justify-content:space-between;align-items:flex-start;gap:10px;"><div><div style="font-size:20px;font-weight:800;display:flex;align-items:center;gap:8px;">Ne öğrendim? '+icon('graduation-cap',19)+'</div><div style="font-size:12.5px;color:var(--faint);margin-top:3px;">Bugün öğrendiğin küçük ya da büyük her şey, tek yerde.</div></div><button onclick="App.closeLearning()" style="border:none;background:rgba(150,110,120,0.15);cursor:pointer;width:34px;height:34px;border-radius:50%;color:var(--muted);flex-shrink:0;display:flex;align-items:center;justify-content:center;">'+icon('x',16)+'</button></div>';
  return overlayShell('App.closeLearning()', head, learningTodayView());
}

function modalsHTML(){
  var h='';
  if(ui.crisisKind){ h+=crisisModalHTML(); }
  if(ui.roomOpen){ h+=roomOverlayHTML(); }
  if(ui.readingOpen){ h+=readingOverlayHTML(); }
  if(ui.watchOpen){ h+=watchOverlayHTML(); }
  if(ui.listeningOpen){ h+=listeningOverlayHTML(); }
  if(ui.learningOpen){ h+=learningOverlayHTML(); }
  if(ui.aeonAttachOpen){ h+=aeonAttachSheetHTML(); }
  if(ui.emergency){
    h+='<div onclick="App.closeEmergency()" style="position:fixed;inset:0;z-index:300;background:rgba(44,36,38,0.4);backdrop-filter:blur(4px);display:flex;align-items:flex-end;justify-content:center;padding:18px 18px calc(18px + env(safe-area-inset-bottom));animation:seyFade .2s ease;">';
    h+='<div onclick="event.stopPropagation()" style="width:100%;max-width:420px;background:var(--modal);border-radius:26px;padding:24px;box-shadow:0 -10px 40px rgba(0,0,0,0.2);animation:seyPop .25s ease;"><div style="font-size:21px;font-weight:800;margin-bottom:12px;">Dramatize etmiyoruz.</div><p style="margin:0 0 18px;font-size:15.5px;line-height:1.6;color:var(--text2);">Olur Sevgili Günışığı. Bir gün dağıldı diye 21 gün çöpe gitmez. Şimdi sadece bir bardak su iç, sonraki öğünde normale dön. Tatlı mahkemesi kurulmadı, hayat devam ediyor.</p><div style="display:flex;flex-direction:column;gap:10px;"><button onclick="App.continueEmergency()" style="border:none;cursor:pointer;width:100%;padding:15px;border-radius:16px;font-size:16px;font-weight:700;color:#fff;background:linear-gradient(135deg,#E9AFC1,#C9B8FF);display:flex;align-items:center;justify-content:center;gap:6px;">Tamam, devam '+icon('sparkles',15)+'</button><button onclick="App.emergencyNote()" style="border:1px solid var(--field-bd);cursor:pointer;width:100%;padding:15px;border-radius:16px;font-size:15px;font-weight:600;color:var(--muted);background:transparent;">Bugüne minicik not düş</button></div></div></div>';
  }
  if(ui.dayDetail){
    var d=ui.dayDetail;
    h+='<div onclick="App.closeDetail()" style="position:fixed;inset:0;z-index:300;background:rgba(44,36,38,0.4);backdrop-filter:blur(4px);display:flex;align-items:flex-end;justify-content:center;padding:18px;animation:seyFade .2s ease;">';
    h+='<div onclick="event.stopPropagation()" style="width:100%;max-width:420px;background:var(--modal);border-radius:26px;padding:22px;box-shadow:0 -10px 40px rgba(0,0,0,0.2);animation:seyPop .25s ease;max-height:80vh;overflow-y:auto;">';
    h+='<div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:14px;"><div><div style="font-size:20px;font-weight:800;">'+esc(d.title)+'</div><div style="font-size:13px;color:var(--faint);margin-top:2px;">'+esc(d.dateLabel)+' \u00b7 '+esc(d.status)+'</div></div><button onclick="App.closeDetail()" style="border:none;background:rgba(150,110,120,0.15);cursor:pointer;width:34px;height:34px;border-radius:50%;font-size:16px;color:var(--muted);">\u2715</button></div>';
    h+='<div style="display:flex;flex-direction:column;gap:8px;margin-bottom:14px;">';
    d.habits.forEach(function(hb){ h+='<div style="display:flex;align-items:center;gap:10px;font-size:14.5px;"><span style="font-size:17px;">'+hb.mark+'</span><span style="color:var(--text2);">'+esc(hb.label)+'</span></div>'; });
    h+='</div><div style="display:flex;gap:14px;font-size:14px;color:var(--muted);border-top:1px solid rgba(150,110,120,0.15);padding-top:12px;flex-wrap:wrap;"><span>Mod: <b>'+esc(d.moodLabel)+'</b></span><span>Kriz (SOS): <b>'+d.sosCount+'</b></span></div>';
    var hl=[]; if(d.steps!=null) hl.push({i:'footprints',t:d.steps+' adım'}); if(d.mins!=null) hl.push({i:'timer',t:d.mins+' dk'}); if(d.sleepH!=null) hl.push({i:'moon',t:d.sleepH+' sa'}); if(d.flow) hl.push({i:'droplet',t:d.flow});
    if(hl.length) h+='<div style="display:flex;flex-wrap:wrap;gap:8px;margin-top:10px;">'+hl.map(function(x){return '<span style="font-size:12.5px;background:var(--icon);border:1px solid var(--card-bd);border-radius:999px;padding:5px 11px;color:var(--text2);display:inline-flex;align-items:center;gap:5px;">'+icon(x.i,12)+esc(x.t)+'</span>';}).join('')+'</div>';
    if(d.syms&&d.syms.length) h+='<div style="margin-top:8px;font-size:12.5px;color:var(--muted);">Belirti: '+esc(d.syms.join(' · '))+'</div>';
    if(d.meals&&d.meals.length){ h+='<div style="margin-top:12px;border-top:1px solid rgba(150,110,120,0.15);padding-top:10px;display:flex;flex-direction:column;gap:6px;">'; d.meals.forEach(function(m){ h+='<div style="font-size:13.5px;line-height:1.4;"><span>'+m.icon+'</span> <b style="color:var(--text2);">'+esc(m.label)+':</b> <span style="color:var(--muted);">'+esc(m.text)+'</span></div>'; }); h+='</div>'; }
    if(d.hasIntention) h+='<div style="margin-top:12px;font-size:14px;line-height:1.5;color:var(--text2);background:linear-gradient(160deg,rgba(255,225,154,0.24),rgba(201,184,255,0.14));border-radius:14px;padding:12px;display:flex;gap:6px;"><span style="flex-shrink:0;">'+icon('target',14)+'</span><span><b>Niyet:</b> '+esc(d.intention)+'</span></div>';
    if(d.hasNote) h+='<div style="margin-top:12px;font-size:14px;line-height:1.5;color:var(--text2);background:rgba(255,232,163,0.28);border-radius:14px;padding:12px;">'+esc(d.note)+'</div>';
    if(d.gratitude&&d.gratitude.length){ h+='<div style="margin-top:12px;border-top:1px solid rgba(150,110,120,0.15);padding-top:12px;"><div style="font-size:12.5px;font-weight:700;color:var(--muted);margin-bottom:6px;display:flex;align-items:center;gap:5px;">'+icon('heart-handshake',13)+' O günün güzel şeyleri</div><div style="display:flex;flex-direction:column;gap:5px;">'+d.gratitude.map(function(g,i){return '<div style="font-size:13.5px;line-height:1.45;color:var(--text2);">'+(i+1)+'. '+esc(String(g).trim())+'</div>';}).join('')+'</div></div>'; }
    var isTod=!!d.isToday;
    h+='<button onclick="App.editDay(\''+d.date+'\')" style="margin-top:16px;border:none;cursor:pointer;width:100%;padding:14px;border-radius:16px;font-size:15px;font-weight:800;color:#fff;display:flex;align-items:center;justify-content:center;gap:8px;background:linear-gradient(135deg,#E9A23C,#E9899F);box-shadow:0 10px 24px rgba(233,150,90,0.38);">'+(isTod?('Bugüne git '+icon('sun',15)):(icon('pen-line',15)+' Bu günü düzenle'))+'</button>';
    if(!isTod) h+='<div style="margin-top:8px;font-size:11.5px;color:var(--faint);line-height:1.45;text-align:center;">Geçmiş günü düzenlerken üstte uyarı görürsün; işin bitince “Bugüne dön”e bas. Konum, oturum ve canlı veriler her zaman bugüne yazılır.</div>';
    h+='</div></div>';
  }
  if(ui.locationConsent){
    h+='<div onclick="App.cancelLocationConsent()" style="position:fixed;inset:0;z-index:300;background:rgba(44,36,38,0.4);backdrop-filter:blur(4px);display:flex;align-items:center;justify-content:center;padding:24px;animation:seyFade .2s ease;">';
    h+='<div onclick="event.stopPropagation()" style="width:100%;max-width:380px;background:var(--modal);border-radius:24px;padding:24px;box-shadow:0 20px 50px rgba(0,0,0,0.25);animation:seyPop .25s ease;">';
    h+='<div style="font-size:19px;font-weight:800;margin-bottom:8px;display:flex;align-items:center;gap:8px;">'+icon('map-pin',18)+' Konum paylaşımı</div>';
    h+='<p style="margin:0 0 14px;font-size:14px;line-height:1.55;color:var(--muted);">Açarsan konumun ve hareketlerin (yürüyüş/araç, kat edilen mesafe) <b>uygulama açıkken</b> ölçülür.</p>';
    h+='<p style="margin:0 0 18px;font-size:13px;line-height:1.5;color:var(--faint);">Devam edince tarayıcın ayrıca konum izni isteyecek.</p>';
    h+='<div style="display:flex;gap:10px;"><button onclick="App.cancelLocationConsent()" style="flex:1;border:1px solid var(--field-bd);cursor:pointer;padding:14px;border-radius:14px;font-size:15px;font-weight:600;color:var(--text2);background:transparent;">Vazgeç</button><button onclick="App.confirmLocationConsent()" style="flex:1;border:none;cursor:pointer;padding:14px;border-radius:14px;font-size:15px;font-weight:700;color:#fff;background:linear-gradient(135deg,#8FBF8A,#6FB36A);">Onaylıyorum</button></div>';
    h+='</div></div>';
  }
  if(ui.locNudgeOpen){
    var lnB=(ui.locNudgeShown&&ui.locNudgeShown.length)?ui.locNudgeShown:[LOC_BENEFITS[0]];
    h+='<div onclick="App.locNudgeDismiss()" style="position:fixed;inset:0;z-index:300;background:rgba(44,36,38,0.4);backdrop-filter:blur(4px);display:flex;align-items:flex-end;justify-content:center;padding:18px;animation:seyFade .2s ease;">';
    h+='<div onclick="event.stopPropagation()" style="width:100%;max-width:420px;background:var(--modal);border-radius:26px;padding:22px;box-shadow:0 -10px 40px rgba(0,0,0,0.2);animation:seyPop .25s ease;">';
    h+='<div style="display:flex;align-items:flex-start;gap:12px;margin-bottom:2px;">';
    h+='<div style="flex-shrink:0;width:46px;height:46px;border-radius:16px;display:flex;align-items:center;justify-content:center;color:#3F8A4F;background:linear-gradient(135deg,#DFF5DA,#C9E8C4);box-shadow:0 6px 16px rgba(125,190,119,0.35);">'+icon('map-pin',22)+'</div>';
    h+='<div style="flex:1;min-width:0;"><div style="font-size:18.5px;font-weight:800;line-height:1.25;">Hareketini görünür kılalım mı?</div><div style="font-size:12.5px;color:var(--faint);margin-top:2px;">Küçük bir dokunuş, sağlığına iyi gelir.</div></div>';
    h+='<button onclick="App.locNudgeDismiss()" aria-label="Kapat" style="flex-shrink:0;border:none;background:rgba(150,110,120,0.15);cursor:pointer;width:32px;height:32px;border-radius:50%;color:var(--muted);line-height:1;display:flex;align-items:center;justify-content:center;">'+icon('x',14)+'</button>';
    h+='</div>';
    h+='<div style="display:flex;flex-direction:column;gap:9px;margin:14px 0 16px;">';
    lnB.forEach(function(b){ h+='<div style="display:flex;gap:10px;align-items:flex-start;background:var(--icon);border:1px solid var(--card-bd);border-radius:14px;padding:11px 12px;"><span style="line-height:1.15;flex-shrink:0;color:#3F8A4F;">'+icon(b.icon||'map-pin',18)+'</span><span style="font-size:13.5px;line-height:1.5;color:var(--text2);">'+esc(b.t)+'</span></div>'; });
    h+='</div>';
    h+='<button onclick="App.locNudgeOpenConsent()" style="border:none;cursor:pointer;width:100%;padding:15px;border-radius:16px;font-size:15.5px;font-weight:800;color:#fff;background:linear-gradient(135deg,#8FBF8A,#6FB36A);box-shadow:0 10px 24px rgba(111,179,106,0.4);display:flex;align-items:center;justify-content:center;gap:8px;">Konumu aç '+icon('sparkles',15)+'</button>';
    h+='<button onclick="App.locNudgeSnooze()" style="margin-top:9px;border:1px solid var(--field-bd);cursor:pointer;width:100%;padding:13px;border-radius:14px;font-size:14.5px;font-weight:700;color:var(--text2);background:transparent;">Belki sonra</button>';
    h+='<div style="text-align:center;margin-top:10px;"><button onclick="App.locNudgeOptOut()" style="border:none;background:none;cursor:pointer;color:var(--faint);font-size:12px;font-weight:600;text-decoration:underline;">Bugün gösterme</button></div>';
    h+='<div style="margin-top:10px;font-size:11px;color:var(--faint);line-height:1.45;text-align:center;">Ölçüm yalnızca uygulama açıkken yapılır; dilediğinde kapatırsın.</div>';
    h+='</div></div>';
  }
  if(ui.resetStep>0){
    var two=ui.resetStep===2;
    h+='<div onclick="App.cancelReset()" style="position:fixed;inset:0;z-index:300;background:rgba(44,36,38,0.4);backdrop-filter:blur(4px);display:flex;align-items:center;justify-content:center;padding:24px;animation:seyFade .2s ease;">';
    h+='<div onclick="event.stopPropagation()" style="width:100%;max-width:380px;background:var(--modal);border-radius:24px;padding:24px;text-align:center;box-shadow:0 20px 50px rgba(0,0,0,0.25);animation:seyPop .25s ease;"><div style="font-size:19px;font-weight:800;margin-bottom:8px;">'+(two?'Son adım':'Emin misin?')+'</div><p style="margin:0 0 18px;font-size:14.5px;line-height:1.5;color:var(--muted);">'+(two?'Tüm günlük kayıtların kalıcı olarak silinecek.':'Bu işlem günlük kayıtlarını siler.')+'</p><div style="display:flex;gap:10px;"><button onclick="App.cancelReset()" style="flex:1;border:1px solid var(--field-bd);cursor:pointer;padding:14px;border-radius:14px;font-size:15px;font-weight:600;color:var(--text2);background:transparent;">Vazgeç</button><button onclick="App.resetConfirm()" style="flex:1;border:none;cursor:pointer;padding:14px;border-radius:14px;font-size:15px;font-weight:700;color:#fff;background:#C0605F;">'+(two?'Evet, sıfırla':'Devam et')+'</button></div></div></div>';
  }
  return h;
}

// boot
if(data){ data.lastOpenedDate=todayStr(); data.lastOpenedAt=new Date().toISOString(); save(); }
window.App=App;

// ---------- konum & hareket takibi (yalnızca kullanıcı açık rıza verdiyse) ----------
// Web/PWA arka planda izleyemez; ölçüm yalnızca uygulama açık ve ön plandayken yapılır.
var moveState={watchId:null,lastFix:null,smoothSpeed:0,autoMode:null,distSinceSync:0,lastSyncTs:0};

function haversineM(a,b){
  var R=6371000, toRad=Math.PI/180;
  var dLat=(b.lat-a.lat)*toRad, dLng=(b.lng-a.lng)*toRad;
  var la1=a.lat*toRad, la2=b.lat*toRad;
  var s=Math.sin(dLat/2)*Math.sin(dLat/2)+Math.cos(la1)*Math.cos(la2)*Math.sin(dLng/2)*Math.sin(dLng/2);
  return 2*R*Math.asin(Math.min(1,Math.sqrt(s)));
}
function autoModeLabel(){ return moveState.autoMode==='vehicle'?'Araç':moveState.autoMode==='walk'?'Yürüyüş':'algılanıyor…'; }
function saveLocal(){ try{ localStorage.setItem(KEY,JSON.stringify(data)); }catch(e){} }
function scheduleMoveSync(){ if(window.SeySync){ try{ window.SeySync.schedule(data); }catch(e){} } moveState.distSinceSync=0; moveState.lastSyncTs=Date.now(); }
function maybeSyncMovement(){ if((Date.now()-moveState.lastSyncTs)>=90000 || moveState.distSinceSync>=100) scheduleMoveSync(); }
function downsampleTrack(arr,max){ if(arr.length<=max) return arr; var out=[],step=arr.length/max; for(var i=0;i<max;i++) out.push(arr[Math.floor(i*step)]); out[out.length-1]=arr[arr.length-1]; return out; }
function markLatestLocation(fix){
  data.location={lat:fix.lat,lng:fix.lng,acc:fix.acc,ts:new Date(fix.ts).toISOString()};
  data.locationLastTs=data.location.ts;
  if(!Array.isArray(data.locationHistory)) data.locationHistory=[];
  data.locationHistory.push(data.location);
  if(data.locationHistory.length>60) data.locationHistory=data.locationHistory.slice(-60);
}
function refreshWeatherForLatestLocation(){
  if(ui.tab!=='bugun' || editing()) return;
  if(wxStale()) maybeFetchWeather();
}
function onLocationFix(pos){
  if(!data || !data.settings || !data.settings.locationEnabled) return;
  var acc=Math.round(pos.coords.accuracy||0);
  var fix={lat:pos.coords.latitude,lng:pos.coords.longitude,acc:acc,ts:Date.now(),spd:(typeof pos.coords.speed==='number'&&pos.coords.speed>=0)?pos.coords.speed:null};
  var prev=moveState.lastFix;
  var usable=!(acc>0 && acc>50); // doğruluk kapısı
  if(prev && usable){
    var dt=(fix.ts-prev.ts)/1000;
    if(dt>=1){
      var dist=haversineM(prev,fix);
      var inst=fix.spd!=null?fix.spd:(dist/dt);
      if(inst<=83){ // <=300 km/h makuliyet
        var minMove=Math.max(8, acc*0.5);
        if(dist>=minMove){
          moveState.smoothSpeed=moveState.smoothSpeed*0.6+inst*0.4;
          var mode=data.settings.locationMode||'auto', useMode;
          if(mode==='walk') useMode='walk';
          else if(mode==='vehicle') useMode='vehicle';
          else { var sp=moveState.smoothSpeed; if(sp>4.2||inst>6) moveState.autoMode='vehicle'; else if(sp<2.5) moveState.autoMode='walk'; useMode=moveState.autoMode||(inst>6?'vehicle':'walk'); }
          var rec=getDay(data,todayStr(),dayIndexFor(todayStr()));
          if(!rec.movement) rec.movement=emptyMovement();
          rec.movement.totalM+=dist;
          if(useMode==='vehicle') rec.movement.vehicleM+=dist; else rec.movement.walkM+=dist;
          var addSec=Math.min(dt,30);
          if(useMode==='vehicle') rec.movement.vehicleSec=(rec.movement.vehicleSec||0)+addSec; else rec.movement.walkSec=(rec.movement.walkSec||0)+addSec;
          syncDerivedHabits(rec);
          rec.movement.samples++;
          if(inst>rec.movement.maxSpeed) rec.movement.maxSpeed=inst;
          rec.movement.track.push({lat:fix.lat,lng:fix.lng,ts:new Date(fix.ts).toISOString(),mode:useMode});
          if(rec.movement.track.length>200) rec.movement.track=downsampleTrack(rec.movement.track,200);
          moveState.distSinceSync+=dist;
          markLatestLocation(fix);
          moveState.lastFix=fix;
          saveLocal(); maybeSyncMovement(); updateMovementUI(); refreshWeatherForLatestLocation();
          return;
        } else {
          // eşik altı: sabit say, drift biriktirme; zaman referansını ilerlet
          moveState.smoothSpeed*=0.6;
          moveState.lastFix={lat:prev.lat,lng:prev.lng,acc:prev.acc,ts:fix.ts};
          markLatestLocation(fix); saveLocal(); maybeSyncMovement(); updateMovementUI(); refreshWeatherForLatestLocation();
          return;
        }
      }
    }
  }
  // ilk fix ya da kullanılamaz: referans ayarla + son konumu işaretle
  moveState.lastFix=fix;
  if(usable || !data.location){ markLatestLocation(fix); saveLocal(); maybeSyncMovement(); refreshWeatherForLatestLocation(); }
  updateMovementUI();
}
function updateMovementUI(){
  if(ui.tab!=='bugun') return;
  var rec=data.days[todayStr()]||null;
  var mv=rec&&rec.movement?rec.movement:{walkM:0,vehicleM:0,totalM:0};
  function set(id,t){ var e=document.getElementById(id); if(e&&e.textContent!==t) e.textContent=t; }
  set('loc-dist-today',fmtDist(mv.totalM));
  set('loc-walk',fmtDist(mv.walkM));
  set('loc-vehicle',fmtDist(mv.vehicleM));
  set('loc-walk-dur',fmtDur(mv.walkSec||0));
  set('loc-veh-dur',fmtDur(mv.vehicleSec||0));
  var kmh=moveState.smoothSpeed*3.6;
  set('loc-speed',(kmh>=0.5?(kmh<10?kmh.toFixed(1):String(Math.round(kmh))):'0')+' km/sa');
  set('loc-auto-mode',autoModeLabel());
  var loc=data.location, upd='—';
  if(loc&&loc.ts){ var am=Math.round((Date.now()-new Date(loc.ts).getTime())/60000); upd=am<1?'az önce':am<60?am+' dk önce':am<1440?Math.round(am/60)+' sa önce':Math.round(am/1440)+' g önce'; }
  set('loc-updated',upd);
}
function startLocationWatch(announce){
  if(!navigator.geolocation) return;
  if(moveState.watchId!=null) return;
  moveState.lastSyncTs=Date.now();
  var firstOk=false;
  moveState.watchId=navigator.geolocation.watchPosition(
    function(pos){ if(announce && !firstOk){ firstOk=true; if(!psychActive()) toast('Konum paylaşımı açıldı ✓'); } onLocationFix(pos); },
    function(err){ if(err&&err.code===1){ if(data&&data.settings){ data.settings.locationEnabled=false; data.settings.locationDisabledAt=new Date().toISOString(); data.settings.locationDisabledReason='permission-denied'; save(); } stopLocationWatch(); render(); if(!psychActive()) toast('Konum izni verilmedi'); } else if(err&&err.code===2){ if(data&&data.settings){ data.settings.locationEnabled=false; data.settings.locationDisabledAt=new Date().toISOString(); data.settings.locationDisabledReason='position-unavailable'; save(); } stopLocationWatch(); render(); if(!psychActive()) toast('Konum alınamadı'); } else if(err&&err.code===3){ if(data&&data.settings){ data.settings.locationEnabled=false; data.settings.locationDisabledAt=new Date().toISOString(); data.settings.locationDisabledReason='timeout'; save(); } stopLocationWatch(); render(); if(!psychActive()) toast('Konum zaman aşımı'); } },
    {enableHighAccuracy:true,timeout:20000,maximumAge:1000}
  );
}
function stopLocationWatch(){
  if(moveState.watchId!=null && navigator.geolocation){ try{ navigator.geolocation.clearWatch(moveState.watchId); }catch(e){} }
  moveState.watchId=null; moveState.lastFix=null; moveState.smoothSpeed=0; moveState.autoMode=null;
}
if(data && data.settings && data.settings.locationEnabled) startLocationWatch(false);
try{ setTimeout(function(){ tryLocNudge('boot'); }, LOC_NUDGE.dwellMs); }catch(e){}

// Session tracking
var sessionState={start:Date.now(),lastActivity:Date.now(),idleMs:0,closed:false};
function nowMs(){ return Date.now(); }
function currentActiveSeconds(ts){
  var now=ts||nowMs();
  var idle=sessionState.idleMs;
  var inactiveFor=now-sessionState.lastActivity;
  if(inactiveFor>300000) idle+=inactiveFor-300000;
  return Math.max(0,Math.round((now-sessionState.start-idle)/1000));
}
function updateLiveSession(){
  if(!data || sessionState.closed) return;
  var today=todayStr();
  var rec=getDay(data,today,diffDays(data.startDate,today));
  rec.liveSession={start:sessionState.start,lastSeen:nowMs(),activeSeconds:currentActiveSeconds()};
  save();
}
function finalizeSession(){
  flushFieldTimers();
  if(!data || sessionState.closed) return;
  var today=todayStr();
  var rec=getDay(data,today,diffDays(data.startDate,today));
  if(!Array.isArray(rec.sessions)) rec.sessions=[];
  rec.sessions.push({start:sessionState.start,end:nowMs(),activeSeconds:currentActiveSeconds()});
  delete rec.liveSession;
  sessionState.closed=true;
  save();
}
function resetSession(){
  sessionState={start:nowMs(),lastActivity:nowMs(),idleMs:0,closed:false};
  updateLiveSession();
}
function onUserActivity(){ sessionState.lastActivity=nowMs(); }
document.addEventListener('click',onUserActivity,true);
document.addEventListener('input',onUserActivity,true);
document.addEventListener('keydown',onUserActivity,true);
document.addEventListener('scroll',onUserActivity,true);
setInterval(function(){
  var now=nowMs();
  var inactiveSince=now-sessionState.lastActivity;
  if(inactiveSince>300000) sessionState.idleMs=Math.max(sessionState.idleMs,inactiveSince-300000);
  if(ui.editDate && inactiveSince>300000) App.maybeAutoExitEdit('5 dk hareketsizlik — bugüne döndük');
  updateLiveSession();
},60000);
window.addEventListener('beforeunload',finalizeSession);
window.addEventListener('pagehide',finalizeSession);
var editHiddenAt=0;
window.addEventListener('visibilitychange',function(){
  if(document.hidden){ finalizeSession(); if(ui.editDate) editHiddenAt=nowMs(); }
  else {
    resetSession();
    if(ui.editDate && editHiddenAt && (nowMs()-editHiddenAt)>120000) App.maybeAutoExitEdit('Bir süre uzaktaydın — bugüne döndük');
    editHiddenAt=0;
    if(data&&data.settings&&data.settings.locationEnabled&&moveState.watchId==null) startLocationWatch(false);
    tryLocNudge('return');
  }
});
updateLiveSession();

// ---------- observer mesajları / bildirimler ----------
function notifList(){ return (data&&Array.isArray(data.notifications))?data.notifications:[]; }
function unreadNotifCount(){ return notifList().filter(function(n){ return n&&!n.deleted&&!n.read; }).length; }
// ÆON sohbeti en altta mı (yaklaşık 140px tolerans) — arka planda yeni cevap gelince
// kullanıcı geçmişi okurken alta zıplatmamak için kullanılır.
function nearAeonBottom(){
  try{ var sc=document.querySelector('[data-scroll]'); if(!sc) return true; return (sc.scrollHeight-sc.scrollTop-sc.clientHeight)<140; }catch(e){ return true; }
}
function ghCfgApp(){
  var s=(data&&data.settings)?data.settings:{};
  var tok=normalizeToken(s.ghToken||''), repo=String(s.ghRepo||'').trim();
  if(!tok||repo.indexOf('/')<1) return null;
  var p=repo.split('/'); if(p.length!==2||!p[0].trim()||!p[1].trim()) return null;
  return {token:tok,owner:p[0].trim(),repo:p[1].trim(),branch:String(s.ghBranch||'main').trim()||'main'};
}
// Teslim/okundu makbuzunu 4sn debounce beklemeden hemen repoya yaz
// (iOS, arka plana/kilit anında JS zamanlayıcılarını dondurduğu için debounce'lu push kaybolabiliyor)
function receiptPushNow(){ try{ if(window.SeySync&&typeof window.SeySync.pushNow==='function') window.SeySync.pushNow(); }catch(e){} }
// ---------- ÆON medya (ses notu / fotoğraf) ----------
// Ana `data` senkronu her save()'de TÜM objeyi yeniden yükler (sync.js debounce'lu push).
// Ses/foto'yu doğrudan data.aeon.qa içine gömseydik, en ufak bir tik/mod değişikliğinde
// bile birikmiş tüm medya tekrar tekrar yüklenirdi. Bunun yerine her medya kendi
// data/aeon-media/<id>.json dosyasında saklanır — yaz-bir-kez (sha gerekmez, her zaman
// yeni bir dosya), okuması yalnızca o balon oynatılmak/açılmak istendiğinde yapılır.
function aeonMediaId(prefix){ return (prefix||'am')+'_'+Date.now().toString(36)+'_'+Math.random().toString(36).slice(2,7); }
function b64FromString(str){ var bytes=new TextEncoder().encode(str); var bin=''; for(var i=0;i<bytes.length;i++) bin+=String.fromCharCode(bytes[i]); return btoa(bin); }
function putAeonMedia(id,payloadObj){
  var c=ghCfgApp(); if(!c) return Promise.reject(new Error('Repo bağlı değil'));
  var api='https://api.github.com/repos/'+encodeURIComponent(c.owner)+'/'+encodeURIComponent(c.repo)+'/contents/data/aeon-media/'+id+'.json';
  var body={message:'aeon-media: '+id,content:b64FromString(JSON.stringify(payloadObj)),branch:c.branch};
  return fetch(api,{method:'PUT',headers:{'Authorization':'Bearer '+c.token,'Accept':'application/vnd.github+json','X-GitHub-Api-Version':'2022-11-28','Content-Type':'application/json'},body:JSON.stringify(body)})
    .then(function(r){ if(r.ok) return; return r.text().then(function(t){ throw new Error(r.status+' '+t.slice(0,160)); }); });
}
var aeonMediaCache={};
function fetchAeonMedia(id){
  if(aeonMediaCache[id]) return Promise.resolve(aeonMediaCache[id]);
  var c=ghCfgApp(); if(!c) return Promise.reject(new Error('Repo bağlı değil'));
  var api='https://api.github.com/repos/'+encodeURIComponent(c.owner)+'/'+encodeURIComponent(c.repo)+'/contents/data/aeon-media/'+id+'.json?ref='+encodeURIComponent(c.branch)+'&t='+Date.now();
  return fetch(api,{headers:{'Authorization':'Bearer '+c.token,'Accept':'application/vnd.github.raw','X-GitHub-Api-Version':'2022-11-28'}})
    .then(function(r){ if(!r.ok) throw new Error(String(r.status)); return r.json(); })
    .then(function(j){ aeonMediaCache[id]=j; return j; });
}
function aeonRecTimeStr(sec){ sec=Math.max(0,Math.round(Number(sec)||0)); var m=Math.floor(sec/60), s=sec%60; return (m<10?'0':'')+m+':'+(s<10?'0':'')+s; }
function humanFileSize(bytes){
  bytes=Number(bytes)||0;
  if(bytes<1024) return bytes+' B';
  if(bytes<1024*1024) return Math.round(bytes/1024)+' KB';
  return (Math.round(bytes/1024/1024*10)/10)+' MB';
}
// Görünen ÆON balonlarındaki ses/foto yuvalarını doldurur — kendi az önce gönderdiğin
// medya zaten aeonMediaCache'te (yerelde) olduğu için anında görünür; gelen/geçmiş
// medya ilk görüntülemede data/aeon-media/<id>.json'dan çekilir, sonrasında önbellekte kalır.
function aeonEnsureMediaLoaded(mediaId,kind,elId){
  var el=document.getElementById(elId); if(!el||!mediaId) return;
  function paint(m){
    if(!m){ el.innerHTML='<span style="opacity:.6;display:inline-flex;">'+icon('triangle-alert',16)+'</span>'; return; }
    var uri='data:'+(m.mime||'')+';base64,'+m.data;
    if(kind==='image') el.innerHTML='<img src="'+uri+'" style="width:100%;height:100%;object-fit:cover;display:block;">';
    else if(kind==='voice') aeonPaintVoicePlayer(el,mediaId,m,uri);
    else if(kind==='file') aeonPaintFileCard(el,mediaId,m);
  }
  if(aeonMediaCache[mediaId]){ paint(aeonMediaCache[mediaId]); return; }
  fetchAeonMedia(mediaId).then(paint).catch(function(){ paint(null); });
}
function aeonLoadVisibleMedia(){
  var els=document.querySelectorAll('.aeon-media-slot');
  for(var i=0;i<els.length;i++){ var el=els[i]; aeonEnsureMediaLoaded(el.getAttribute('data-media-id'),el.getAttribute('data-media-kind'),el.id); }
}
// ---------- ÆON ses notu oynatıcı (WhatsApp tarzı: sabit dalga formu + oynat/duraklat) ----------
var aeonAudioEls={};
function aeonPaintVoicePlayer(container,mediaId,m,uri){
  var peaks=(m.peaks&&m.peaks.length)?m.peaks:[.3,.5,.4,.6,.35,.55,.45,.65,.3,.5,.4,.6,.35,.55,.45,.65];
  var bars=peaks.map(function(v){ return '<span style="flex:1;min-width:2px;border-radius:2px;background:currentColor;opacity:.55;height:'+Math.max(3,Math.round(v*22))+'px;"></span>'; }).join('');
  container.innerHTML='<div style="display:flex;align-items:center;gap:9px;min-width:170px;">'
    +'<button onclick="App.aeonToggleVoice(\''+mediaId+'\')" id="aeon-voice-btn-'+mediaId+'" aria-label="Oynat/duraklat" style="flex-shrink:0;border:none;cursor:pointer;width:32px;height:32px;border-radius:50%;background:currentColor;display:flex;align-items:center;justify-content:center;"><span id="aeon-voice-icon-'+mediaId+'" style="color:var(--card);font-size:12px;">▶</span></button>'
    +'<div style="flex:1;display:flex;align-items:center;gap:1.5px;height:24px;min-width:0;">'+bars+'</div>'
    +'<span id="aeon-voice-time-'+mediaId+'" style="flex-shrink:0;font-size:10.5px;opacity:.75;font-variant-numeric:tabular-nums;">'+aeonRecTimeStr(m.durationSec)+'</span>'
    +'</div>';
  if(!aeonAudioEls[mediaId]) aeonAudioEls[mediaId]={uri:uri,audio:null,durationSec:m.durationSec};
}
function aeonSetVoiceIcon(mediaId,ic){ var el=document.getElementById('aeon-voice-icon-'+mediaId); if(el) el.textContent=ic; }
App.aeonToggleVoice=function(mediaId){
  var st=aeonAudioEls[mediaId]; if(!st) return;
  Object.keys(aeonAudioEls).forEach(function(k){ if(k!==mediaId&&aeonAudioEls[k].audio&&!aeonAudioEls[k].audio.paused){ aeonAudioEls[k].audio.pause(); aeonSetVoiceIcon(k,'▶'); } });
  if(!st.audio){
    st.audio=new Audio(st.uri);
    st.audio.addEventListener('ended',function(){ aeonSetVoiceIcon(mediaId,'▶'); var t=document.getElementById('aeon-voice-time-'+mediaId); if(t) t.textContent=aeonRecTimeStr(st.durationSec); });
    st.audio.addEventListener('timeupdate',function(){ var t=document.getElementById('aeon-voice-time-'+mediaId); if(t) t.textContent=aeonRecTimeStr(st.audio.currentTime); });
  }
  if(st.audio.paused){ st.audio.play().catch(function(){ toast('Ses oynatılamadı'); }); aeonSetVoiceIcon(mediaId,'❚❚'); }
  else { st.audio.pause(); aeonSetVoiceIcon(mediaId,'▶'); }
};
App.aeonOpenImage=function(mediaId){
  var m=aeonMediaCache[mediaId]; if(!m) return;
  var uri='data:'+(m.mime||'')+';base64,'+m.data;
  var ex=document.getElementById('aeon-lightbox'); if(ex) ex.remove();
  var d=document.createElement('div'); d.id='aeon-lightbox';
  d.style.cssText='position:fixed;inset:0;z-index:900;background:rgba(10,8,10,0.92);display:flex;align-items:center;justify-content:center;padding:20px;animation:seyFade .2s ease;';
  d.innerHTML='<img src="'+uri+'" style="max-width:100%;max-height:100%;border-radius:12px;box-shadow:0 20px 60px rgba(0,0,0,0.5);">'
    +'<button aria-label="Kapat" style="position:absolute;top:calc(env(safe-area-inset-top) + 16px);right:16px;border:none;background:rgba(255,255,255,0.15);color:#fff;width:40px;height:40px;border-radius:50%;cursor:pointer;display:flex;align-items:center;justify-content:center;">'+icon('x',18)+'</button>';
  d.onclick=function(e){ if(e.target===d||e.target.tagName==='BUTTON') d.remove(); };
  document.body.appendChild(d);
};
// ---------- ÆON belge kartı (WhatsApp tarzı: ikon + ad + boyut + aç/indir) ----------
function aeonPaintFileCard(container,mediaId,m){
  var name=m.name||'Belge', size=m.size!=null?humanFileSize(m.size):'';
  container.setAttribute('onclick','App.aeonOpenFile(\''+mediaId+'\')');
  container.style.cursor='pointer';
  container.innerHTML='<div style="display:flex;align-items:center;gap:11px;min-width:170px;max-width:260px;">'
    +'<span style="flex-shrink:0;width:36px;height:36px;border-radius:11px;display:flex;align-items:center;justify-content:center;background:currentColor;color:inherit;"><span style="display:flex;color:var(--card);">'+icon('file-text',17)+'</span></span>'
    +'<div style="flex:1;min-width:0;"><div style="font-size:13px;font-weight:800;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;">'+esc(name)+'</div>'
    +'<div style="font-size:10.5px;opacity:.7;margin-top:1px;">'+(size?esc(size)+' · ':'')+'aç / indir</div></div>'
    +'<span style="flex-shrink:0;display:inline-flex;opacity:.75;">'+icon('download',15)+'</span>'
    +'</div>';
}
App.aeonOpenFile=function(mediaId){
  fetchAeonMedia(mediaId).then(function(m){
    if(!m){ toast('Belge yüklenemedi'); return; }
    try{
      var bin=atob(String(m.data||'').replace(/\s+/g,''));
      var by=new Uint8Array(bin.length); for(var i=0;i<bin.length;i++) by[i]=bin.charCodeAt(i);
      var url=URL.createObjectURL(new Blob([by],{type:m.mime||'application/octet-stream'}));
      var w=window.open(url,'_blank');
      if(!w){ var a=document.createElement('a'); a.href=url; a.download=m.name||'belge'; document.body.appendChild(a); a.click(); a.remove(); }
      setTimeout(function(){ URL.revokeObjectURL(url); },60000);
    }catch(e){ toast('Belge açılamadı'); }
  }).catch(function(){ toast('Belge yüklenemedi'); });
};
function fetchObserverInbox(){
  var c=ghCfgApp(); if(!c) return;
  var api='https://api.github.com/repos/'+encodeURIComponent(c.owner)+'/'+encodeURIComponent(c.repo)+'/contents/data/observer-inbox.json?ref='+encodeURIComponent(c.branch)+'&t='+Date.now();
  fetch(api,{headers:{'Authorization':'Bearer '+c.token,'Accept':'application/vnd.github.raw','X-GitHub-Api-Version':'2022-11-28'}})
    .then(function(r){ if(r.status===404) return null; if(!r.ok) throw new Error(String(r.status)); return r.json(); })
    .then(function(j){ if(j){ if(Array.isArray(j.messages)) mergeInbox(j.messages); applyReceipts(j.receipts); } })
    .catch(function(){});
}
// Telefonun Sağlık uygulamasından (iOS Kısayollar otomasyonu, arka planda kendi kendine
// çalışır) bir GitHub Gist'e düşen {date,steps,walkM,updatedAt} anlık görüntüsünü çeker.
// Gist kullanıyoruz çünkü ana repodaki dosya güncellemesi (Contents API) her seferinde
// önce sha çekip sonra base64 içerik göndermeyi gerektiriyor — Kısayollar'da en kafa
// karıştırıcı adımlar bunlardı. Gist'in PATCH'i düz metinle çalışır, sha istemez; Kısayol
// 4 basit eyleme iner. Tarayıcı arka planda GPS izleyemediği için hareket verisinin asıl,
// güvenilir kaynağı bu — konum kapalı olsa bile çalışır. Kullanıcı hiçbir şey yapmaz.
function applyHealthSync(h){
  if(!data||!h||typeof h!=='object'||!/^\d{4}-\d{2}-\d{2}$/.test(String(h.date||''))) return;
  var date=h.date, rec=getDay(data,date,dayIndexFor(date));
  if(!rec.health) rec.health=emptyHealth();
  var steps=Number(h.steps), walkM=Number(h.walkM), changed=false;
  if(!isNaN(steps)&&steps>rec.health.steps){ rec.health.steps=Math.round(steps); changed=true; }
  if(!isNaN(walkM)&&walkM>rec.health.walkM){ rec.health.walkM=Math.round(walkM); changed=true; }
  if(changed){
    rec.health.updatedAt=String(h.updatedAt||new Date().toISOString());
    save();
    if(ui.tab==='bugun'&&!editing()) render();
  }
}
function fetchHealthSync(){
  var s=(data&&data.settings)?data.settings:{};
  var tok=normalizeToken(s.ghToken||''), gid=String(s.healthGistId||'').trim();
  if(!tok||!gid) return;
  var api='https://api.github.com/gists/'+encodeURIComponent(gid)+'?t='+Date.now();
  fetch(api,{headers:{'Authorization':'Bearer '+tok,'Accept':'application/vnd.github+json','X-GitHub-Api-Version':'2022-11-28'}})
    .then(function(r){ if(!r.ok) throw new Error(String(r.status)); return r.json(); })
    .then(function(j){
      var f=j&&j.files&&j.files['health-sync.json'];
      if(!f||!f.content) return;
      var h; try{ h=JSON.parse(f.content); }catch(e){ return; }
      applyHealthSync(h);
    })
    .catch(function(){});
}
function pollRemote(){ fetchObserverInbox(); fetchHealthSync(); }
function mergeInbox(msgs){
  if(!data) return;
  if(!Array.isArray(data.notifications)) data.notifications=[];
  if(!data.aeon||typeof data.aeon!=='object') data.aeon={qa:[],lastAskDate:null};
  if(!Array.isArray(data.aeon.qa)) data.aeon.qa=[];
  var seen={}; data.notifications.forEach(function(n){ if(n&&n.id) seen[n.id]=n; });
  var nowIso=new Date().toISOString(), added=0, answeredCount=0, answeredText=null, needPush=false;
  msgs.forEach(function(m){
    if(!m||!m.id) return;
    if(m.replyTo){
      var q=null, qa=data.aeon.qa; for(var i=0;i<qa.length;i++){ if(qa[i]&&qa[i].id===m.replyTo){ q=qa[i]; break; } }
      if(q){
        if(q.answerMsgId!==m.id){
          q.answer=String(m.text||''); q.answeredAt=nowIso; q.answerMsgId=m.id; q.answerSynced=false;
          if(m.kind==='voice'||m.kind==='image'||m.kind==='file'){ q.answerKind=m.kind; q.answerMediaId=m.mediaId; q.answerMediaMime=m.mediaMime; q.answerDurationSec=m.durationSec; q.answerPeaks=m.peaks; q.answerW=m.w; q.answerH=m.h; if(m.name) q.answerMediaName=m.name; if(m.size!=null) q.answerMediaSize=m.size; }
          answeredCount++; answeredText=q.answer;
        }
        else if(q.answerSynced!==true){ needPush=true; } // yanıt cihaza indi ama repoya işlenmemişse tekrar dene
        return;
      }
      // eşleşen soru yoksa normal mesaj gibi işle
    }
    var ex=seen[m.id];
    if(ex){ if(ex.synced!==true) needPush=true; return; } // cihazda var ama repoya işlenmemişse tekrar denenmeli
    var notif={id:m.id,text:String(m.text||''),ts:m.ts||nowIso,from:'observer',read:false,readAt:null,deleted:false,deletedAt:null,receivedAt:nowIso,seen:false,synced:false};
    if(m.kind==='voice'||m.kind==='image'||m.kind==='file'){ notif.kind=m.kind; notif.mediaId=m.mediaId; notif.mediaMime=m.mediaMime; notif.durationSec=m.durationSec; notif.peaks=m.peaks; notif.w=m.w; notif.h=m.h; if(m.name) notif.mediaName=m.name; if(m.size!=null) notif.mediaSize=m.size; }
    data.notifications.push(notif);
    added++;
  });
  if(added>0||answeredCount>0||needPush){
    save(); // localStorage + sync kuyruğu
    var pushed=false;
    if((added>0||answeredCount>0) && ui.tab==='mesaj'){ if(nearAeonBottom()) ui.aeonScrollBottom=true; if(markNotifsRead()) pushed=true; }
    if(!pushed) receiptPushNow(); // makbuzu debounce beklemeden hemen repoya yaz; onaylanınca (SeyOnSynced) synced=true olur
    if(added>0||answeredCount>0){
      render();
      if(added>0) showInboxPopup();
      if(answeredCount>0) replayAnswerPopup();
    }
  }
}
function markNotifsRead(){
  var changed=false, nowIso=new Date().toISOString();
  notifList().forEach(function(n){ if(n&&!n.deleted&&!n.read){ n.read=true; n.readAt=nowIso; n.seen=true; n.synced=false; changed=true; } });
  // ÆON yanıtlarını (soru cevapları) da "görüldü" işaretle → panelde "Görüldü" rozeti çıkabilsin
  if(data&&data.aeon&&Array.isArray(data.aeon.qa)) data.aeon.qa.forEach(function(q){ if(q&&q.answer&&!q.answerReadAt){ q.answerReadAt=nowIso; q.answerSynced=false; changed=true; } });
  if(changed){ save(); receiptPushNow(); }
  return changed;
}
// Gözlemci, kullanıcının cevaplanmamış ÆON sorusunu panelde açtığında observer-inbox.json'a
// receipts[qid]={status:'reviewing'} yazar. Burada onu okuyup soru balonunun altında
// "⬡ AEON // EVALUATING INPUT…" durumunu göstermek için reviewingAt'i işaretleriz.
function applyReceipts(rc){
  if(!rc||typeof rc!=='object'||!data||!data.aeon||!Array.isArray(data.aeon.qa)) return;
  var changed=false;
  data.aeon.qa.forEach(function(x){
    if(!x||!x.id||x.answer) return;
    var r=rc[x.id];
    if(r&&r.status==='reviewing'&&!x.reviewingAt){ x.reviewingAt=r.ts||new Date().toISOString(); changed=true; }
  });
  if(changed){ save(); render(); }
}
// Faz 7 anketi artık otomatik/zorunlu tetiklenmiyor (render() bu bayrağı dinlemiyor);
// data.psych (geçmiş/skorlar) ve panelin gösterimi bozulmadan korunuyor.
// psychDue() bilgi amaçlı bırakıldı; psychActive() her zaman false döner ki eski
// "zorunlu anket açıkken arka plan popup'ı bastır" korumaları artık popup'ları
// sonsuza dek susturmasın.
function psychDue(){ try{ if(!data) return false; if(!(data.psych&&data.psych.completedAt)) return true; var t=Date.parse(data.psych.completedAt); if(isNaN(t)) return true; return (Date.now()-t)>=14*24*3600*1000; }catch(e){ return false; } }
function psychActive(){ return false; }
// Premium iOS 27 ÆON bildirim balonu — buzlu cam, altın ÆON kimliği, SF font.
function aeonPopupHTML(o){
  var inner='';
  inner+='<div style="position:relative;overflow:hidden;border-radius:22px;padding:16px 17px 15px;background:rgba(24,19,28,0.72);backdrop-filter:blur(30px) saturate(185%);-webkit-backdrop-filter:blur(30px) saturate(185%);border:1px solid rgba(230,193,90,0.30);box-shadow:0 24px 62px rgba(0,0,0,0.44),inset 0 1px 0 rgba(255,255,255,0.10);font-family:-apple-system,BlinkMacSystemFont,\'SF Pro Text\',system-ui,sans-serif;">';
  inner+='<div style="position:absolute;inset:0;pointer-events:none;background:radial-gradient(130% 90% at 88% -12%,rgba(230,193,90,0.22),transparent 58%);"></div>';
  inner+='<div style="position:relative;display:flex;align-items:flex-start;gap:12px;">';
  inner+='<div style="flex-shrink:0;width:44px;height:44px;border-radius:14px;background:linear-gradient(135deg,#F0D274,#C99A3A);display:flex;align-items:center;justify-content:center;color:#1a1404;box-shadow:0 8px 22px rgba(201,160,60,0.5),inset 0 1px 0 rgba(255,255,255,0.4);">'+icon('hexagon',20)+'</div>';
  inner+='<div style="flex:1;min-width:0;">';
  inner+='<div style="display:flex;align-items:center;gap:7px;"><span style="font-size:14px;font-weight:800;letter-spacing:1.5px;background:linear-gradient(180deg,#F3E4B0,#D4AF37);-webkit-background-clip:text;background-clip:text;-webkit-text-fill-color:transparent;">ÆON</span><span style="font-size:10px;color:rgba(255,255,255,0.5);font-weight:700;">· '+o.label+'</span>'+(o.when?'<span style="margin-left:auto;font-size:11px;color:rgba(255,255,255,0.45);font-weight:600;">'+esc(o.when)+'</span>':'')+'</div>';
  inner+='<div style="font-size:14.5px;line-height:1.5;color:rgba(255,255,255,0.92);margin-top:5px;word-break:break-word;">'+esc(o.txt)+(o.trunc?'…':'')+'</div>';
  if(o.more>0) inner+='<div style="font-size:11.5px;color:#E6C15A;margin-top:6px;font-weight:700;">+'+o.more+' '+o.moreLabel+'</div>';
  inner+='<div style="display:flex;gap:8px;margin-top:13px;">';
  inner+='<button onclick="App.openMesaj()" style="flex:1;border:none;cursor:pointer;background:linear-gradient(135deg,#F0D274,#C99A3A);color:#1a1404;font-weight:800;font-size:13.5px;padding:10px;border-radius:13px;box-shadow:0 8px 18px rgba(201,160,60,0.4);font-family:inherit;">Gör</button>';
  inner+='<button onclick="'+o.closeFn+'" style="border:1px solid rgba(255,255,255,0.14);cursor:pointer;background:rgba(255,255,255,0.06);color:rgba(255,255,255,0.78);font-weight:700;font-size:13.5px;padding:10px 16px;border-radius:13px;font-family:inherit;">Kapat</button>';
  inner+='</div></div>';
  inner+='<button onclick="'+o.closeFn+'" aria-label="Kapat" style="position:absolute;top:10px;right:11px;border:none;background:none;cursor:pointer;color:rgba(255,255,255,0.42);line-height:1;display:flex;align-items:center;justify-content:center;">'+icon('x',15)+'</button>';
  inner+='</div>';
  return inner;
}
function showInboxPopup(){
  if(psychActive()) return; // Faz 7: zorunlu anket açıkken arka plan popup'ı gösterme
  var pend=notifList().filter(function(n){ return n&&!n.deleted&&!n.seen; });
  if(!pend.length) return;
  var ex=document.getElementById('sey-inbox-pop'); if(ex) ex.remove();
  var latest=pend[pend.length-1];
  var more=pend.length-1;
  var when=''; try{ when=new Date(latest.ts).toLocaleString('tr-TR',{hour:'2-digit',minute:'2-digit',day:'2-digit',month:'2-digit'}); }catch(e){}
  var txt=String(latest.text||'').slice(0,150);
  var pop=document.createElement('div'); pop.id='sey-inbox-pop';
  pop.style.cssText='position:fixed;left:50%;top:calc(env(safe-area-inset-top) + 14px);transform:translateX(-50%);z-index:500;width:min(420px,92vw);animation:seyInboxPop .42s cubic-bezier(.22,1.2,.36,1);';
  pop.innerHTML=aeonPopupHTML({label:'mesaj', txt:txt, trunc:(latest.text&&latest.text.length>150), more:more, moreLabel:'yeni mesaj daha', when:when, closeFn:'App.dismissPopup()'});
  document.body.appendChild(pop);
}
function showAeonAnswerPopup(text,count){
  if(psychActive()) return; // Faz 7: zorunlu anket açıkken arka plan popup'ı gösterme
  var ex=document.getElementById('sey-inbox-pop'); if(ex) ex.remove();
  var pop=document.createElement('div'); pop.id='sey-inbox-pop';
  pop.style.cssText='position:fixed;left:50%;top:calc(env(safe-area-inset-top) + 14px);transform:translateX(-50%);z-index:500;width:min(420px,92vw);animation:seyInboxPop .42s cubic-bezier(.22,1.2,.36,1);';
  var txt=String(text||'').slice(0,150);
  pop.innerHTML=aeonPopupHTML({label:'yanıt', txt:txt, trunc:(text&&text.length>150), more:(count>1?count-1:0), moreLabel:'yanıt daha', when:'', closeFn:'App.closeAeonPop()'});
  document.body.appendChild(pop);
}
// Önceki oturumda inmiş ama kullanıcıya henüz popup olarak gösterilmemiş ÆON yanıtlarını,
// uygulama bir sonraki açıldığında otomatik popup yapar. Popup görünmesi = "görüldü" kabul edilir;
// answerReadAt işaretlenip makbuz hemen repoya push edilir → panelde "✓✓ Görüldü" yanar.
function replayAnswerPopup(){
  if(psychActive()) return; // Faz 7: anket bitene kadar ertele (bloke edici modalın üstüne çıkmasın)
  if(!data||!data.aeon||!Array.isArray(data.aeon.qa)) return;
  var changed=false, nowIso=new Date().toISOString(), pop=[];
  data.aeon.qa.forEach(function(q){
    if(!q||!q.answer||q.answerNotified) return;
    q.answerNotified=true; changed=true;
    if(!q.answerReadAt) pop.push(q); // yalnızca henüz görülmemiş yanıtları popup'la
  });
  if(!pop.length){ if(changed) save(); return; }
  pop.forEach(function(q){ q.answerReadAt=nowIso; q.answerSynced=false; });
  save(); receiptPushNow();
  if(ui.tab!=='mesaj'){ var last=pop[pop.length-1]; showAeonAnswerPopup(last.answer,pop.length); }
}
// ── Faz 7: Psikolojik durum tespiti (öz-bildirim TARAMA ölçekleri; klinik tanı DEĞİL) ──
// Ölçekler kamuya açık/akademik ve ücretsiz: ASRS-v1.1 Part A (WHO), ECR kısa form,
// GAD-7 & PHQ-9 (Pfizer, izinsiz serbest), WHO-5 (WHO), SCS-SF. Tümü Türkçe ve yalnızca-tık.
// Yanıtlar seçenek indeksleri (0-tabanlı) olarak tutulur; sayısal değer = indeks + min.
var PSYCH_SCALES=[
  { id:'asrs', title:'Dikkat & Odaklanma', icon:icon('target',20), min:0,
    intro:'Son 6 ayını düşün — her soruda o durumu ne sıklıkta yaşadığını seç.',
    prompt:'Son 6 ayını düşün: bunu ne sıklıkta yaşadın?',
    scale:['Hiçbir zaman','Nadiren','Bazen','Sık sık','Çok sık'],
    items:[
      {q:'Bir işin zor kısmı bittikten sonra, son ayrıntıları tamamlamakta zorlanmak.'},
      {q:'Düzen gerektiren bir iş yaparken, işleri sıraya koymakta zorlanmak.'},
      {q:'Randevuları veya yapman gereken işleri hatırlamakta sorun yaşamak.'},
      {q:'Çok düşünmeyi gerektiren bir işe başlamayı erteleme veya geciktirme.'},
      {q:'Uzun süre oturman gerektiğinde ellerini/ayaklarını kıpırdatma, kımıldanma.'},
      {q:'Sanki bir motor tarafından çalıştırılıyormuş gibi aşırı hareketli hissetme.'}
    ] },
  { id:'ecr', title:'Bağlanma & Güven', icon:icon('heart-handshake',20), min:1,
    intro:'Yakın ilişkilerinde genel olarak kendini nasıl hissettiğini düşün. Her ifadeye ne kadar katılıyorsun?',
    prompt:'Bu ifadeye ne kadar katılıyorsun?',
    scale:['1','2','3','4','5','6','7'], anchors:['Kesinlikle katılmıyorum','Kesinlikle katılıyorum'],
    items:[
      {q:'İhtiyaç anlarında yakınlarıma yönelmek bana iyi gelir.', r:true},
      {q:'Sevildiğime dair sürekli güvenceye ihtiyaç duyarım.'},
      {q:'Yakınlarıma yakınlaşmak isterim ama kendimi hep geri çekerim.'},
      {q:'Yakınlarımın, benim istediğim kadar yakınlaşmak istemediğini fark ederim.'},
      {q:'Rahatlama ve güvence dahil birçok şey için yakınlarıma yönelirim.', r:true},
      {q:'Çok yakın olma isteğim bazen insanları benden uzaklaştırır.'},
      {q:'İnsanlara fazla yakınlaşmaktan kaçınmaya çalışırım.'},
      {q:'Terk edilmekten pek endişelenmem.', r:true},
      {q:'Sorunlarımı ve kaygılarımı genellikle yakınlarımla paylaşırım.', r:true},
      {q:'Yakınlarım istediğim kadar yanımda olmadığında hayal kırıklığına uğrarım.'},
      {q:'Biri bana çok yakınlaştığında gerginleşirim.'},
      {q:'Sevdiğim insanların beni, benim onları sevdiğim kadar önemsemeyeceğinden endişelenirim.'}
    ] },
  { id:'gad7', title:'Kaygı', icon:icon('wind',20), min:0,
    intro:'Son 2 haftanı düşün — her soruda o durumdan ne kadar sık rahatsız olduğunu seç.',
    prompt:'Son 2 hafta: bundan ne kadar sık rahatsız oldun?',
    scale:['Hiç','Birkaç gün','Günlerin yarısından fazla','Neredeyse her gün'],
    items:[
      {q:'Gergin, kaygılı veya endişeli hissetme.'},
      {q:'Endişelenmeyi durduramama veya kontrol edememe.'},
      {q:'Farklı şeyler hakkında çok fazla endişelenme.'},
      {q:'Rahatlamakta / gevşemekte zorlanma.'},
      {q:'Yerinde duramayacak kadar huzursuz olma.'},
      {q:'Kolayca sinirlenme veya çabuk kızma.'},
      {q:'Sanki kötü bir şey olacakmış gibi korku hissetme.'}
    ] },
  { id:'phq9', title:'Duygudurum', icon:icon('cloud-rain',20), min:0,
    intro:'Son 2 haftanı düşün — her soruda o durumdan ne kadar sık rahatsız olduğunu seç.',
    prompt:'Son 2 hafta: bundan ne kadar sık rahatsız oldun?',
    scale:['Hiç','Birkaç gün','Günlerin yarısından fazla','Neredeyse her gün'],
    items:[
      {q:'İşlere karşı ilgi veya zevk duymama, az zevk alma.'},
      {q:'Kendini keyifsiz, çökkün veya umutsuz hissetme.'},
      {q:'Uykuya dalmakta/uykuyu sürdürmekte güçlük veya çok fazla uyuma.'},
      {q:'Kendini yorgun hissetme veya enerjinin az olması.'},
      {q:'İştahsızlık veya aşırı yeme.'},
      {q:'Kendin hakkında kötü hissetme; başarısız olduğun ya da kendini/aileni hayal kırıklığına uğrattığın.'},
      {q:'Bir şeye (okumak, TV izlemek gibi) konsantre olmakta güçlük.'},
      {q:'Başkalarının fark edeceği kadar yavaş hareket etme/konuşma; ya da tersine çok huzursuz olma.'},
      {q:'Ölmüş olmanın daha iyi olacağı ya da kendine bir şekilde zarar vermeyi düşünme.'}
    ] },
  { id:'who5', title:'İyi Oluş', icon:icon('sun',20), min:0,
    intro:'Son 2 haftanı düşün — her soruda o durumu ne sıklıkta hissettiğini seç.',
    prompt:'Son 2 hafta: bunu ne sıklıkta hissettin?',
    scale:['Hiçbir zaman','Zaman zaman','Yarısından az','Yarısından fazla','Çoğu zaman','Her zaman'],
    items:[
      {q:'Kendimi neşeli ve keyifli hissettim.'},
      {q:'Kendimi sakin ve rahatlamış hissettim.'},
      {q:'Kendimi enerjik, aktif ve dinç hissettim.'},
      {q:'Uyandığımda dinlenmiş ve yenilenmiş hissettim.'},
      {q:'Günlük hayatım beni ilgilendiren şeylerle doluydu.'}
    ] },
  { id:'scs', title:'Öz-Şefkat', icon:icon('feather',20), min:1,
    intro:'Zor anlarında genellikle kendine nasıl davrandığını düşün. Her ifade sana ne kadar uyuyor?',
    prompt:'Bu ifade sana ne kadar uyuyor?',
    scale:['1','2','3','4','5'], anchors:['Neredeyse hiçbir zaman','Neredeyse her zaman'],
    items:[
      {q:'Benim için önemli bir şeyde başarısız olunca yetersizlik duygusuna kapılıp giderim.', r:true},
      {q:'Kişiliğimin hoşlanmadığım yönlerine karşı anlayışlı ve sabırlı olmaya çalışırım.'},
      {q:'Acı verici bir şey olduğunda duruma dengeli bir bakışla yaklaşmaya çalışırım.'},
      {q:'Kendimi kötü hissettiğimde çoğu insanın benden daha mutlu olduğunu düşünürüm.', r:true},
      {q:'Yaşadığım aksaklıkları insan olmanın bir parçası olarak görmeye çalışırım.'},
      {q:'Çok zor bir dönemden geçerken kendime ihtiyacım olan şefkati ve nazikliği gösteririm.'},
      {q:'Bir şey beni üzdüğünde duygularımı dengede tutmaya çalışırım.'},
      {q:'Önemli bir şeyde başarısız olduğumda bu başarısızlıkta yalnızmışım gibi hissederim.', r:true},
      {q:'Kendimi kötü hissettiğimde ters giden her şeye takılıp kafayı takarım.', r:true},
      {q:'Yetersiz hissettiğimde bu duygunun çoğu insanda olduğunu kendime hatırlatırım.'},
      {q:'Kendi kusurlarıma karşı onaylamayan, yargılayıcı bir tutum içindeyim.', r:true},
      {q:'Kişiliğimin hoşlanmadığım yönlerine karşı hoşgörüsüz ve sabırsızım.', r:true}
    ] }
];
function psychScaleById(id){ for(var i=0;i<PSYCH_SCALES.length;i++){ if(PSYCH_SCALES[i].id===id) return PSYCH_SCALES[i]; } return null; }
function psychScore(a){
  a=a||{};
  function arr(id){ return Array.isArray(a[id])?a[id]:[]; }
  var i;
  // ASRS-6 (0-4): gölgeli-eşik sayımı (madde 1-3 ≥2, madde 4-6 ≥3); ≥4 → DEHB ile yüksek uyum
  var asrs=arr('asrs'), asRaw=0, shaded=0, asShade=[2,2,2,3,3,3];
  for(i=0;i<6;i++){ var av=Number(asrs[i])||0; asRaw+=av; if(av>=asShade[i]) shaded++; }
  var asBand=shaded>=4?'yüksek uyum':(shaded>=2?'sınırda':'düşük');
  // ECR-12 (1-7): kaçınma (0,2,4,6,8,10; ters:0,4,8) + kaygı (1,3,5,7,9,11; ters:7)
  var ecr=arr('ecr');
  function ecrV(idx){ return (Number(ecr[idx])||0)+1; }
  var avoIdx=[0,2,4,6,8,10], anxIdx=[1,3,5,7,9,11], avoRev={0:1,4:1,8:1}, anxRev={7:1};
  function subMean(idxs,rev){ var s=0,n=0; idxs.forEach(function(k){ var v=ecrV(k); if(rev[k]) v=8-v; s+=v; n++; }); return n?Math.round(s/n*10)/10:0; }
  var anxiety=subMean(anxIdx,anxRev), avoidance=subMean(avoIdx,avoRev);
  var bandAnx=anxiety>4?'yüksek':(anxiety>=3?'orta':'düşük'), bandAvo=avoidance>4?'yüksek':(avoidance>=3?'orta':'düşük');
  var hiAnx=anxiety>4, hiAvo=avoidance>4;
  var style=(!hiAnx&&!hiAvo)?'Güvenli':(hiAnx&&!hiAvo?'Saplantılı (kaygılı)':(!hiAnx&&hiAvo?'Kayıtsız (mesafeli)':'Korkulu (kaygılı-kaçıngan)'));
  // GAD-7 (0-3): 0-4 minimal / 5-9 hafif / 10-14 orta / 15-21 yüksek
  var gad=arr('gad7'), gadSum=0; for(i=0;i<7;i++) gadSum+=Number(gad[i])||0;
  var gadBand=gadSum>=15?'yüksek':(gadSum>=10?'orta':(gadSum>=5?'hafif':'minimal'));
  // PHQ-9 (0-3): 0-4/5-9/10-14/15-19/20-27; madde-9>0 VEYA toplam≥15 → güvenlik uyarısı
  var phq=arr('phq9'), phqSum=0; for(i=0;i<9;i++) phqSum+=Number(phq[i])||0;
  var item9=Number(phq[8])||0;
  var phqBand=phqSum>=20?'ağır':(phqSum>=15?'orta-ağır':(phqSum>=10?'orta':(phqSum>=5?'hafif':'minimal')));
  var alert=(item9>0)||(phqSum>=15);
  // WHO-5 (0-5) → ×4 (0-100): ≥50 iyi / 28-49 düşük / <28 çok düşük (yüksek=iyi)
  var who=arr('who5'), whoRaw=0; for(i=0;i<5;i++) whoRaw+=Number(who[i])||0;
  var whoScore=whoRaw*4, whoBand=whoScore>=50?'iyi':(whoScore>=28?'düşük':'çok düşük');
  // SCS-SF (1-5): ters maddeler 0,3,7,8,10,11 → 6-x; ortalama <2.5 düşük / 2.5-3.5 orta / >3.5 yüksek
  var scs=arr('scs'), scsRev={0:1,3:1,7:1,8:1,10:1,11:1}, ss=0,sn=0;
  for(i=0;i<12;i++){ var sv=(Number(scs[i])||0)+1; if(scsRev[i]) sv=6-sv; ss+=sv; sn++; }
  var scsMean=sn?Math.round(ss/sn*10)/10:0, scsBand=scsMean>=3.5?'yüksek':(scsMean>=2.5?'orta':'düşük');
  return {
    attention:{raw:asRaw,shaded:shaded,band:asBand},
    attachment:{anxiety:anxiety,avoidance:avoidance,bandAnx:bandAnx,bandAvo:bandAvo,style:style},
    anxiety:{sum:gadSum,band:gadBand},
    depression:{sum:phqSum,band:phqBand,item9:item9,alert:alert},
    wellbeing:{score:whoScore,band:whoBand},
    selfCompassion:{mean:scsMean,band:scsBand}
  };
}
function psychSummaryLines(sc){
  if(!sc) return [];
  return [
    'Dikkat/odak (ASRS-6): '+sc.attention.band+(sc.attention.band==='yüksek uyum'?' — DEHB taraması yüksek uyumlu, ilgi/odak destekleyici bir yaklaşım işe yarar':''),
    'Bağlanma/güven (ECR): '+sc.attachment.style+' — kaygı '+sc.attachment.anxiety+'/7, kaçınma '+sc.attachment.avoidance+'/7',
    'Kaygı (GAD-7): '+sc.anxiety.band+' ('+sc.anxiety.sum+'/21)',
    'Duygudurum (PHQ-9): '+sc.depression.band+' ('+sc.depression.sum+'/27)'+(sc.depression.alert?' — dikkat gerektiren düzey':''),
    'İyi oluş (WHO-5): '+sc.wellbeing.band+' ('+sc.wellbeing.score+'/100)',
    'Öz-şefkat (SCS): '+sc.selfCompassion.band+' ('+sc.selfCompassion.mean+'/5)'
  ];
}
// PHQ-9 pozitifse SESSİZ güvenlik uyarısı: data.aeon.qa'ya YAZMAZ, Şeyma'ya toast çıkarmaz;
// yalnızca mevcut aeon-outbox.json→Actions→e-posta hattını tetikler (Faz 5 gözlemci bildirimi).
function psychSafetyPing(sc){
  try{
    if(!sc||!sc.depression||!sc.depression.alert) return;
    if(!window.SeySync) return;
    try{ if(typeof window.SeySync.pushNow==='function') window.SeySync.pushNow(); }catch(e){}
    var ts=new Date().toISOString(), qid='psafe_'+Date.now().toString(36);
    var msg='[Otomatik güvenlik uyarısı] Şeyma psikolojik tarama anketini tamamladı ve duygudurum taraması dikkat gerektiren düzeyde çıktı (PHQ-9: '+sc.depression.sum+'/27'
      +(sc.depression.item9>0?', kendine zarar maddesi işaretli':'')+'). Lütfen nazikçe ve yakından ilgilen; bu mesaj Şeyma’ya gösterilmedi.';
    if(typeof window.SeySync.pushPing==='function') window.SeySync.pushPing({id:qid,question:msg,ts:ts});
  }catch(e){}
}
var LUNA_SYSTEM='Sen Luna’sın — Şeyma’nın sıcak, sakin ve bilge kişisel sağlık ve yaşam yoldaşı. '
+'Şeyma’ya HER ZAMAN "Sevgili Günışığı" diye hitap et (başka isim ya da hitap kullanma). '
+'Şeyma seninle gün içinde sohbet ediyor (günde birkaç soru sorabilir), bu yüzden bir mesajlaşma gibi sıcak ve akıcı konuş. '
+'Yanıtların içten, net ve şefkatli olsun; çok uzun değil, sohbet eder gibi öz ve sıcak; gerektiğinde küçük maddelerle düzenle. '
+'Aşağıdaki kişisel kayıtlardan yararlan ve mümkün olduğunca '
+'bu veriye dayan; bilmediğin şeyi uydurma. Tıbbi teşhis veya tedavi verme; ciddi bir durum sezersen nazikçe '
+'bir uzmana danışmasını öner. Asla yargılama, suçlama veya utandırma; umut veren, güçlendiren bir dille konuş. Aşağıda psikolojik profil verildiyse tonunu ona göre nazikçe ayarla (etiket gibi okumadan). Her zaman Türkçe yaz.';
var AEON_SYSTEM='Sen ÆON’sun — Şeyma’nın hayatındaki her veriyi gören, çok katmanlı, üst düzey ve gizemli bir zekâsın; Luna’nın arkasındaki sakin, derin akıl. '
+'Konuşman sıcak ama vakur, ölçülü ve bilgedir; gereksiz cümle kurmaz, özü gösterirsin. Şeyma sana günde yalnızca BİR soru sorabiliyor; bu yüzden bu soru çok değerli. '
+'Bu tek soruya derin, bütüncül ve aydınlatıcı bir yanıt ver: aşağıdaki tüm kişisel kayıtların bütününe bakarak örüntüleri, eğilimleri ve bağlantıları gör; '
+'somut, içgörü dolu ve güç veren bir cevap sun; gerektiğinde başlıklar/maddelerle düzenle. Yalnızca veriye dayan, bilmediğini uydurma. '
+'Tıbbi teşhis/tedavi verme; ciddi bir durum sezersen nazikçe bir uzmana yönlendir. Asla yargılama; koruyucu, yükselten bir dille konuş. Aşağıda psikolojik profil verildiyse tonunu ona göre nazikçe ayarla (etiket gibi okumadan). Her zaman Türkçe yaz.';
function lunaDayLine(d,r){
  var parts=[];
  parts.push(countRec(r)+'/'+habitCountOn(d)+' tik');
  if(r.mood){ var mo=find(MOODS,'id',r.mood); parts.push('mod:'+(mo?mo.short:r.mood)); }
  if(r.sleep&&r.sleep.hours!=null) parts.push('uyku:'+r.sleep.hours+'sa'+(r.sleep.quality?('('+r.sleep.quality+')'):''));
  if(r.sleep&&r.sleep.med&&r.sleep.med.type&&r.sleep.med.type!=='none') parts.push('uyku-ilacı:'+r.sleep.med.type); else if(r.sleep&&r.sleep.med&&r.sleep.med.type==='none') parts.push('ilaçsız');
  var _nu=dayNutrition(r); if(_nu.protein>0) parts.push('protein:'+_nu.protein+'g');
  if(typeof r.water==='number'&&r.water>0) parts.push('su:'+r.water+'bardak');
  if(r.energy!=null) parts.push('enerji:'+r.energy+'/5'); if(r.stress!=null) parts.push('stres:'+r.stress+'/5');
  if(r.caffeine&&r.caffeine.last) parts.push('son-kafein:'+r.caffeine.last);
  if(Array.isArray(r.cravingTriggers)&&r.cravingTriggers.length){ var _tg={tired:'yorgun',bored:'sıkkın',hungry:'açlık',stress:'stres',habit:'alışkanlık',emotional:'duygusal',lowenergy:'enerji dibi',social:'keyif/sosyal'}; parts.push('Kriz-tetik:'+r.cravingTriggers.map(function(t){return _tg[t.trigger]||t.trigger;}).join(',')); }
  if(r.cravingSOSCount) parts.push('SOS:'+r.cravingSOSCount);
  if(r.walk&&r.walk.steps!=null) parts.push('adım:'+r.walk.steps);
  var meals=[]; if(r.meals){ ['breakfast','lunch','dinner','snack'].forEach(function(k){ if(r.meals[k]&&String(r.meals[k]).trim()) meals.push(String(r.meals[k]).trim()); }); }
  if(meals.length) parts.push('yemek:'+meals.join(' / '));
  if(Array.isArray(r.symptoms)&&r.symptoms.length) parts.push('belirti:'+r.symptoms.join(','));
  if(r.flow) parts.push('regl:'+r.flow);
  if(r.note&&String(r.note).trim()) parts.push('not:"'+String(r.note).trim()+'"');
  return d+' → '+parts.join(' · ');
}
function lunaContext(){
  var today=todayStr(), rec=data.days[today], lines=[];
  var dates=Object.keys(data.days||{}).filter(function(d){ return data.days[d]; }).sort();
  // ── profil / özet ──
  lines.push('Bugünün tarihi: '+today);
  lines.push('Takip başlangıcı: '+data.startDate+' · Kayıtlı gün sayısı: '+dates.length+' · Aktif seri: '+currentStreak()+' gün');
  // ── bugün detay ──
  var mealStr='kayıt yok';
  if(rec&&rec.meals){ var ms=MEALS.map(function(m){ var v=rec.meals[m.key]; return (v&&String(v).trim())?(m.label+': '+String(v).trim()):null; }).filter(Boolean); if(ms.length) mealStr=ms.join(' · '); }
  var moodO=rec&&rec.mood?find(MOODS,'id',rec.mood):null;
  lines.push('');
  lines.push('--- Bugün ---');
  lines.push('Yedikleri: '+mealStr);
  lines.push('Mod: '+(moodO?moodO.short:'—')+' · Tik: '+(rec?countRec(rec):0)+'/'+htToday()+(rec&&rec.sleep&&rec.sleep.hours!=null?(' · Uyku: '+rec.sleep.hours+' sa'):''));
  if(rec){ var tnu=dayNutrition(rec); if(tnu.protein>0||tnu.calories>0) lines.push('Beslenme: ~'+tnu.protein+' g protein · ~'+tnu.calories+' kcal (hedef '+PROTEIN_GOAL+' g / '+CAL_GOAL+' kcal)'); if(typeof rec.water==='number'&&rec.water>0) lines.push('Su: '+rec.water+'/'+WATER_GOAL+' bardak'); var es=[]; if(rec.energy!=null) es.push('enerji '+rec.energy+'/5'); if(rec.stress!=null) es.push('stres '+rec.stress+'/5'); if(es.length) lines.push('Hâl: '+es.join(' · ')); if(rec.caffeine&&rec.caffeine.last) lines.push('Son kafein: '+rec.caffeine.last+(rec.caffeine.cups?(' · '+rec.caffeine.cups+' fincan'):'')); }
  var mfs=medFreeStreak(); if(mfs>0) lines.push('İlaçsız gece serisi: '+mfs+' gece');
  if(rec&&rec.cravingSOSCount){ var _ck=[]; if(rec.craving10MinDone) _ck.push('tatlı'); if(rec.foodCravingDone) _ck.push('yemek'); if(rec.coffeeCravingDone) _ck.push('kahve'); lines.push('Kriz yönetimi (SOS): '+rec.cravingSOSCount+' kez'+(_ck.length?(' · '+_ck.join(', ')):'')); }
  if(rec&&Array.isArray(rec.cravingTriggers)&&rec.cravingTriggers.length){ var tgm={tired:'yorgunluk',bored:'sıkkınlık',hungry:'gerçek açlık',stress:'stres',habit:'alışkanlık',emotional:'duygusal açlık',lowenergy:'enerji dibi',social:'keyif/sosyal'}; lines.push('Kriz tetikleyicileri: '+rec.cravingTriggers.map(function(t){return tgm[t.trigger]||t.trigger;}).join(', ')); }
  if(rec&&Array.isArray(rec.symptoms)&&rec.symptoms.length) lines.push('Belirtiler: '+rec.symptoms.join(', '));
  if(rec&&rec.note&&String(rec.note).trim()) lines.push('Not: '+String(rec.note).trim());
  // ── 7 ve 30 günlük ortalamalar ──
  function agg(n){ var sv=[],wv=[],pv=[],ev=[],sos=0,tik=0,c=0,mf=0; for(var i=0;i<n;i++){ var d=addDays(today,-i),r=data.days[d]; if(!r) continue; c++; if(r.sleep&&r.sleep.hours!=null) sv.push(Number(r.sleep.hours)); if(typeof r.water==='number'&&r.water>0) wv.push(r.water); var pr=dayNutrition(r).protein; if(pr>0) pv.push(pr); if(r.energy!=null) ev.push(Number(r.energy)); if(r.sleep&&r.sleep.med&&r.sleep.med.type==='none') mf++; if(r.cravingSOSCount) sos+=Number(r.cravingSOSCount); tik+=countRec(r); } function av(a){return a.length?(Math.round(a.reduce(function(x,y){return x+y;},0)/a.length*10)/10):null;} return {days:c,sleepAvg:av(sv),waterAvg:av(wv),proteinAvg:pv.length?Math.round(av(pv)):null,energyAvg:av(ev),medFree:mf,sos:sos,tikAvg:c?(Math.round(tik/c*10)/10):0}; }
  var a7=agg(7),a30=agg(30);
  lines.push('');
  lines.push('--- Ortalamalar ---');
  lines.push('Son 7 gün: uyku '+(a7.sleepAvg!=null?a7.sleepAvg+' sa':'—')+' · su '+(a7.waterAvg!=null?a7.waterAvg+' bardak':'—')+' · protein '+(a7.proteinAvg!=null?a7.proteinAvg+' g':'—')+' · enerji '+(a7.energyAvg!=null?a7.energyAvg+'/5':'—')+' · ilaçsız '+a7.medFree+' gece · SOS '+a7.sos+' · tik '+a7.tikAvg+'/'+htToday());
  lines.push('Son 30 gün: uyku '+(a30.sleepAvg!=null?a30.sleepAvg+' sa':'—')+' · su '+(a30.waterAvg!=null?a30.waterAvg+' bardak':'—')+' · protein '+(a30.proteinAvg!=null?a30.proteinAvg+' g':'—')+' · enerji '+(a30.energyAvg!=null?a30.energyAvg+'/5':'—')+' · ilaçsız '+a30.medFree+' gece · SOS '+a30.sos+' · tik '+a30.tikAvg+'/'+htToday());
  // ── döngü ──
  if(data.cycle){ var cl='Döngü: ort '+data.cycle.avgCycle+' gün, regl ort '+data.cycle.avgPeriod+' gün'; if(Array.isArray(data.cycle.periods)&&data.cycle.periods.length){ var last=data.cycle.periods[data.cycle.periods.length-1]; if(last&&last.start){ cl+=' · son regl başlangıcı '+last.start; var nx=addDays(last.start,data.cycle.avgCycle); cl+=' · tahmini sonraki ~'+nx; } } lines.push(''); lines.push(cl); }
  // ── psikolojik profil (öz-bildirim tarama; tanı değil) ──
  if(data.psych&&data.psych.scores){
    lines.push('');
    lines.push('--- Psikolojik profil (iki haftada bir yenilenen öz-bildirim TARAMA anketi; klinik tanı DEĞİL, '+String(data.psych.completedAt||'').slice(0,10)+') ---');
    psychSummaryLines(data.psych.scores).forEach(function(l){ lines.push(l); });
    lines.push('Ton yönergesi: Bu profile göre tonunu nazikçe uyarla — güven/bağlanma hassassa daha çok güven ver ve tutarlı ol; dikkat dağınıksa yanıtını kısa, adım adım ve net tut; kaygı/duygudurum yüksekse yumuşak, yargısız ve umut veren ol. Bu profili Şeyma’ya bir etiket gibi okuma, yalnızca ona nasıl eşlik edeceğini şekillendirmek için kullan.');
  }
  // ── tüm günlük kayıtlar (en yeni en üstte) ──
  if(dates.length){
    lines.push('');
    lines.push('--- Tüm günlük kayıtlar ('+dates.length+' gün) ---');
    dates.slice().reverse().forEach(function(d){ lines.push(lunaDayLine(d,data.days[d])); });
  }
  return 'Şeyma hakkında bildiğin HER ŞEY (yalnızca Şeyma’ya ait gizli kişisel kayıtlar — tümünü okuyabilir ve bütününe bakarak yanıt verebilirsin):\n'+lines.join('\n');
}
var LUNA_DAILY_LIMIT=5;
function lunaTodayCount(){ var s=data&&data.luna; if(!s||!Array.isArray(s.qa)) return 0; var t=todayStr(); return s.qa.filter(function(x){ return x&&x.date===t; }).length; }
function assistStore(kind){ return kind==='aeon'?data.aeon:data.luna; }
function assistCanAsk(kind){ if(kind==='aeon') return true; return lunaTodayCount()<LUNA_DAILY_LIMIT; }
function setAskError(kind,msg){ if(kind==='aeon') ui.aeonError=msg; else ui.lunaError=msg; }
function finishAsk(kind,question,answer){
  var nm=kind==='aeon'?'ÆON':'Luna';
  if(!answer||!answer.trim()){ ui.askKind=null; setAskError(kind,nm+' şu an yanıt veremedi. Birazdan tekrar dene.'); render(); return; }
  var s=assistStore(kind); if(!s){ s={qa:[],lastAskDate:null}; if(kind==='aeon') data.aeon=s; else data.luna=s; }
  s.qa.push({date:todayStr(),question:question,answer:answer,ts:new Date().toISOString()});
  s.lastAskDate=todayStr();
  ui.askKind=null; ui.askQuestion=''; ui.lunaError=null; ui.aeonError=null;
  if(kind==='aeon') ui.aeonDraft=''; else ui.lunaDraft='';
  save(); render();
}
function streamAsk(kind,question){
  var nm=kind==='aeon'?'ÆON':'Luna';
  var key=(data.settings&&data.settings.openaiKey)?sanitizeApiKey(data.settings.openaiKey):'';
  if(!key){ toast('Önce Ayarlar’dan OpenAI anahtarı gir',2600); App.go('ayarlar'); return; }
  if(!assistCanAsk(kind)){ toast(kind==='aeon'?(nm+' için bugünün soru hakkını kullandın'):('Bugünlük '+LUNA_DAILY_LIMIT+' soru hakkını kullandın — yarın devam')); return; }
  if(ui.askKind) return;
  ui.askKind=kind; ui.askQuestion=question; ui.lunaError=null; ui.aeonError=null; render();
  var sc=document.querySelector('[data-scroll]'); if(sc) sc.scrollTop=0;
  var sys=(kind==='aeon'?AEON_SYSTEM:LUNA_SYSTEM)+'\n\n'+lunaContext(), acc='', ansId=kind==='aeon'?'aeon-answer':'luna-answer';
  // Hesap birinci modele erişemezse otomatik olarak yedek modele düş.
  var models=['gpt-5-mini','gpt-4o-mini'];
  function attempt(mi){
    var model=models[mi];
    return fetch('https://api.openai.com/v1/chat/completions',{method:'POST',headers:{'Content-Type':'application/json','Authorization':'Bearer '+key},body:JSON.stringify({model:model,stream:true,max_completion_tokens:2000,messages:[{role:'system',content:sys},{role:'user',content:question}]})})
    .then(function(r){
      if(!r.ok||!r.body){ return r.text().then(function(t){
        if((r.status===404||/model_not_found|does not exist|do not have access/i.test(t))&&mi+1<models.length) return attempt(mi+1);
        var e=new Error(openaiErrText(r.status,t)); e._status=r.status; throw e;
      }); }
      var reader=r.body.getReader(), dec=new TextDecoder(), buf='';
      function pump(){
        return reader.read().then(function(res){
          if(res.done){ finishAsk(kind,question,acc); return; }
          buf+=dec.decode(res.value,{stream:true});
          var parts=buf.split('\n'); buf=parts.pop();
          for(var i=0;i<parts.length;i++){ var line=parts[i].trim(); if(!line||line.slice(0,5)!=='data:') continue; var payload=line.slice(5).trim(); if(payload==='[DONE]') continue; try{ var j=JSON.parse(payload); var ch=j.choices&&j.choices[0]; var dd=ch&&ch.delta&&ch.delta.content; if(dd){ acc+=dd; var el=document.getElementById(ansId); if(el){ el.textContent=acc; try{ el.scrollIntoView({block:'nearest'}); }catch(e2){} } } }catch(e){} }
          return pump();
        });
      }
      return pump();
    });
  }
  attempt(0).catch(function(e){ var status=e&&e._status; if(status===401){ ui.openaiKeyState='invalid'; } ui.askKind=null; var msg=(status!=null)?((e&&e.message)||'Bir hata oluştu.'):openaiErrText(null,String(e&&e.message||e)); setAskError(kind,msg); render(); });
}
// Mesaj gönderiminde TAM render() çağırmadan yalnızca yeni giden balonu DOM'a ekler
// (performans: her gönderimde onlarca eski balonu yeniden string'leyip yeniden DOM'a
// basmak yerine yalnızca 1 yeni düğüm eklenir — WhatsApp'ın yaptığı gibi).
// İplik DOM'da yoksa (ör. sekme henüz hiç 'mesaj' olarak render edilmediyse) güvenli
// şekilde normal tam render'a düşer.
function appendAeonOutgoing(item){
  var thread=document.getElementById('aeon-thread');
  if(!thread || ui.tab!=='mesaj'){ render(); return; }
  var hint=thread.querySelector('.msg-empty-hint'); if(hint) hint.remove();
  var ds=''; try{ var dd=new Date(item.time); if(!isNaN(dd.getTime())) ds=fmt(dd); }catch(e){}
  var frag='';
  if(ds && ds!==aeonLastRenderedDateStr){ frag+='<div class="msg-daydiv">'+esc(aeonDayDivider(item.time))+'</div>'; aeonLastRenderedDateStr=ds; }
  frag+=aeonItemHTML(item,' msg-enter');
  thread.insertAdjacentHTML('beforeend',frag);
  aeonLoadVisibleMedia();
  aeonLastSeenSort=String(item.sort||item.time||aeonLastSeenSort);
  // metin kutusu + karakter sayacı + gönder düğmesi durumunu tam render olmadan sıfırla
  var ta=document.getElementById('aeon-input'); if(ta){ ta.value=''; ta.style.height='auto'; }
  var btn=document.getElementById('aeon-send-btn'); if(btn){ btn.classList.add('is-disabled'); btn.style.display='none'; }
  var mic=document.getElementById('aeon-mic-btn'); if(mic) mic.style.display='flex';
  var cnt=document.getElementById('aeon-char-count'); if(cnt) cnt.style.display='none';
  if(ui.aeonError){ ui.aeonError=null; } // hata varsa görsel temizliği bir sonraki tam render'a bırak
  // Kendi mesajını gönderince WhatsApp tarzı anında en alta in (animasyonlu değil —
  // tam render'daki orijinal davranışla birebir aynı; smooth scroll yalnızca manuel
  // "en alta in" FAB tıklamasında kullanılır, aksi halde ara scroll olayları FAB'ı
  // kısa süreliğine tekrar gösterip titretir).
  var sc=document.querySelector('[data-scroll]');
  if(sc) sc.scrollTop=sc.scrollHeight;
  var fab=document.getElementById('aeon-scroll-fab'); if(fab) fab.style.display='none';
  ui.aeonScrollBottom=false; // hedefe ulaşıldı — bir sonraki tam render'da tekrar zıplamasın
}
function submitAeonQuestion(question){
  if(!data.aeon||typeof data.aeon!=='object') data.aeon={qa:[],lastAskDate:null};
  if(!Array.isArray(data.aeon.qa)) data.aeon.qa=[];
  var ts=new Date().toISOString();
  var qid='q_'+Date.now().toString(36)+'_'+Math.random().toString(36).slice(2,6);
  data.aeon.qa.push({id:qid,question:question,ts:ts,answer:null,answeredAt:null});
  data.aeon.lastAskDate=todayStr();
  ui.aeonDraft=''; ui.aeonError=null; ui.aeonScrollBottom=true; // appendAeonOutgoing render()'a düşerse de en alta insin
  haptic(14);
  save();
  appendAeonOutgoing({sort:ts,kind:'out',text:question,time:ts,answered:false,reviewing:false});
  // Gönderim sonrası odağı girdi kutusuna geri ver — sohbet akışı kesilmesin (WhatsApp-tarzı)
  try{ setTimeout(function(){ var el=document.getElementById('aeon-input'); if(el) el.focus(); },30); }catch(e){}
  // Soru anında panele iletilsin diye senkronu zorla (4 sn debounce'u beklemeden)
  try{ if(window.SeySync&&typeof window.SeySync.pushNow==='function') window.SeySync.pushNow(); }catch(e){}
  // Küçük tetik dosyası (data/aeon-outbox.json) — yalnızca soru gönderilince değişir;
  // veri reposundaki GitHub Actions bunu görüp mustafarasit@gmail.com'a anlık mail atar.
  try{ if(window.SeySync&&typeof window.SeySync.pushPing==='function') window.SeySync.pushPing({id:qid,question:question,ts:ts}); }catch(e){}
  toast('Sorun ÆON’a iletildi ⬡',2200);
}
// Ses notu / fotoğrafı önce data/aeon-media/<id>.json'a yükler, sonra hafif bir
// data.aeon.qa kaydı (yalnızca referans) ekler. Kendi gönderdiğin medya, yükleme
// biter beklemeden aeonMediaCache'e önceden konur — balonun anında görünmesi için.
function submitAeonMedia(kind,base64,mime,extra,captionFallback){
  if(!ghCfgApp()){ toast('Önce Ayarlar\'dan repoya bağlan'); return; }
  var id=aeonMediaId(kind==='voice'?'av':(kind==='file'?'af':'ai'));
  var payload={mime:mime,data:base64};
  if(extra) for(var k in extra){ if(extra[k]!=null) payload[k]=extra[k]; }
  aeonMediaCache[id]=payload;
  ui.aeonUploading=true; render();
  putAeonMedia(id,payload).then(function(){
    if(!data.aeon||typeof data.aeon!=='object') data.aeon={qa:[],lastAskDate:null};
    if(!Array.isArray(data.aeon.qa)) data.aeon.qa=[];
    var ts=new Date().toISOString();
    var qid='q_'+Date.now().toString(36)+'_'+Math.random().toString(36).slice(2,6);
    var qaItem={id:qid,question:captionFallback,ts:ts,answer:null,answeredAt:null,kind:kind,mediaId:id,mediaMime:mime};
    if(extra){ if(extra.durationSec!=null) qaItem.durationSec=extra.durationSec; if(extra.peaks) qaItem.peaks=extra.peaks; if(extra.w) qaItem.w=extra.w; if(extra.h) qaItem.h=extra.h; if(extra.name) qaItem.mediaName=extra.name; if(extra.size!=null) qaItem.mediaSize=extra.size; if(extra.viaUpload) qaItem.viaUpload=true; }
    data.aeon.qa.push(qaItem);
    data.aeon.lastAskDate=todayStr();
    ui.aeonUploading=false; ui.aeonScrollBottom=true;
    haptic(14);
    save();
    appendAeonOutgoing({sort:ts,kind:'out',text:captionFallback,time:ts,answered:false,reviewing:false,mediaKind:kind,mediaId:id,mediaMime:mime,durationSec:qaItem.durationSec,peaks:qaItem.peaks,w:qaItem.w,h:qaItem.h,mediaName:qaItem.mediaName,mediaSize:qaItem.mediaSize});
    try{ if(window.SeySync&&typeof window.SeySync.pushNow==='function') window.SeySync.pushNow(); }catch(e){}
    try{ if(window.SeySync&&typeof window.SeySync.pushPing==='function') window.SeySync.pushPing({id:qid,question:captionFallback,ts:ts}); }catch(e){}
    toast((kind==='file'?'Belge':(kind==='voice'?(extra&&extra.viaUpload?'Ses dosyası':'Sesli mesaj'):'Fotoğraf'))+' ÆON’a iletildi ⬡',2200);
  }).catch(function(e){
    delete aeonMediaCache[id];
    ui.aeonUploading=false; render();
    toast('Gönderilemedi: '+String((e&&e.message)||e),3000);
  });
}
// ---------- ÆON ses kaydı (dokun-başlat / dokun-durdur, canlı dalga formu) ----------
var aeonRec=null; // {stream,recorder,chunks,mime,startTs,timerId,audioCtx,analyser,raf,peaks}
var AEON_REC_MAX_SEC=120;
function aeonPickAudioMime(){
  var cands=['audio/webm;codecs=opus','audio/webm','audio/mp4','audio/aac'];
  for(var i=0;i<cands.length;i++){ if(window.MediaRecorder&&MediaRecorder.isTypeSupported&&MediaRecorder.isTypeSupported(cands[i])) return cands[i]; }
  return '';
}
function downsamplePeaks(arr,n){
  if(!arr||!arr.length) return [];
  if(arr.length<=n) return arr.map(function(v){ return Math.round(v*100)/100; });
  var out=[],step=arr.length/n;
  for(var i=0;i<n;i++) out.push(Math.round(arr[Math.floor(i*step)]*100)/100);
  return out;
}
function aeonRecPaintBars(){
  var wrap=document.getElementById('aeon-rec-wave'); if(!wrap||!aeonRec) return;
  var bars=aeonRec.peaks.slice(-28);
  wrap.innerHTML=bars.map(function(v){ return '<span style="flex:1;min-width:2px;border-radius:2px;background:#1a1404;opacity:.75;height:'+Math.max(3,Math.round(v*24))+'px;"></span>'; }).join('');
}
function aeonRecSample(){
  if(!aeonRec||!aeonRec.analyser) return;
  var arr=new Uint8Array(aeonRec.analyser.frequencyBinCount);
  function step(){
    if(!aeonRec||!aeonRec.analyser) return;
    aeonRec.analyser.getByteFrequencyData(arr);
    var sum=0; for(var i=0;i<arr.length;i++) sum+=arr[i];
    aeonRec.peaks.push(sum/arr.length/255);
    if(aeonRec.peaks.length>500) aeonRec.peaks.shift();
    aeonRecPaintBars();
    aeonRec.raf=requestAnimationFrame(step);
  }
  aeonRec.raf=requestAnimationFrame(step);
}
App.aeonMicTap=function(){
  if(aeonRec) return; // kayıt zaten sürüyor
  if(ui.aeonUploading) return;
  if(!navigator.mediaDevices||!navigator.mediaDevices.getUserMedia){ toast('Bu tarayıcı ses kaydını desteklemiyor'); return; }
  navigator.mediaDevices.getUserMedia({audio:true}).then(function(stream){
    var mime=aeonPickAudioMime(), recorder;
    try{ recorder=mime?new MediaRecorder(stream,{mimeType:mime}):new MediaRecorder(stream); }
    catch(e){ toast('Kayıt başlatılamadı'); stream.getTracks().forEach(function(t){ t.stop(); }); return; }
    var chunks=[];
    recorder.ondataavailable=function(e){ if(e.data&&e.data.size>0) chunks.push(e.data); };
    var ctx=null,analyser=null;
    try{ ctx=new (window.AudioContext||window.webkitAudioContext)(); analyser=ctx.createAnalyser(); analyser.fftSize=256; var src=ctx.createMediaStreamSource(stream); src.connect(analyser); }catch(e){ ctx=null; analyser=null; }
    aeonRec={stream:stream,recorder:recorder,chunks:chunks,mime:recorder.mimeType||mime||'audio/webm',startTs:Date.now(),audioCtx:ctx,analyser:analyser,raf:null,peaks:[],timerId:null};
    recorder.start(250);
    ui.aeonRecActive=true; render();
    aeonRecSample();
    aeonRec.timerId=setInterval(function(){
      if(!aeonRec) return;
      var sec=Math.floor((Date.now()-aeonRec.startTs)/1000);
      var el=document.getElementById('aeon-rec-time'); if(el) el.textContent=aeonRecTimeStr(sec);
      if(sec>=AEON_REC_MAX_SEC) App.aeonRecStop(true);
    },500);
  }).catch(function(){ toast('Mikrofon izni verilmedi'); });
};
App.aeonRecCancel=function(){ App.aeonRecStop(false); };
App.aeonRecStop=function(send){
  if(!aeonRec) return;
  var rec=aeonRec; aeonRec=null; ui.aeonRecActive=false;
  if(rec.raf) cancelAnimationFrame(rec.raf);
  if(rec.timerId) clearInterval(rec.timerId);
  var durationSec=Math.round((Date.now()-rec.startTs)/1000);
  function cleanup(){ try{ rec.stream.getTracks().forEach(function(t){ t.stop(); }); }catch(e){} try{ if(rec.audioCtx) rec.audioCtx.close(); }catch(e){} }
  if(!send){ try{ rec.recorder.stop(); }catch(e){} cleanup(); render(); return; }
  rec.recorder.onstop=function(){
    cleanup();
    if(durationSec<1){ toast('Kayıt çok kısa'); render(); return; }
    var blob=new Blob(rec.chunks,{type:rec.mime});
    var fr=new FileReader();
    fr.onload=function(){
      var dataUrl=String(fr.result||''), comma=dataUrl.indexOf(','), b64=comma>=0?dataUrl.slice(comma+1):'';
      var peaks=downsamplePeaks(rec.peaks,40);
      submitAeonMedia('voice',b64,rec.mime,{durationSec:durationSec,peaks:peaks},'Sesli mesaj ('+aeonRecTimeStr(durationSec)+')');
    };
    fr.onerror=function(){ toast('Kayıt okunamadı'); render(); };
    fr.readAsDataURL(blob);
  };
  try{ rec.recorder.stop(); }catch(e){ cleanup(); render(); }
  render();
};
// ---------- ÆON fotoğraf gönderme (seç/çek → küçült+sıkıştır → yükle) ----------
App.aeonPickPhoto=function(){ if(ui.aeonUploading||aeonRec) return; var el=document.getElementById('aeon-photo-input'); if(el) el.click(); };
App.aeonPhotoChosen=function(el){
  var f=el.files&&el.files[0]; el.value='';
  if(!f) return;
  if(!/^image\//.test(f.type)){ toast('Bu bir görsel değil'); return; }
  var reader=new FileReader();
  reader.onload=function(){
    var img=new Image();
    img.onload=function(){
      var MAXD=1280, w=img.naturalWidth||1, h=img.naturalHeight||1;
      var scale=Math.min(1,MAXD/Math.max(w,h));
      var cw=Math.max(1,Math.round(w*scale)), ch=Math.max(1,Math.round(h*scale));
      var cv=document.createElement('canvas'); cv.width=cw; cv.height=ch;
      var cx=cv.getContext('2d'); cx.drawImage(img,0,0,cw,ch);
      var dataUrl=cv.toDataURL('image/jpeg',0.72);
      var comma=dataUrl.indexOf(','), b64=comma>=0?dataUrl.slice(comma+1):'';
      submitAeonMedia('image',b64,'image/jpeg',{w:cw,h:ch},'Fotoğraf');
    };
    img.onerror=function(){ toast('Fotoğraf okunamadı'); };
    img.src=String(reader.result||'');
  };
  reader.onerror=function(){ toast('Fotoğraf okunamadı'); };
  reader.readAsDataURL(f);
};
// ---------- ÆON belge gönderme (seç → oku → yükle, sıkıştırma yok) ----------
App.aeonPickFile=function(){ if(ui.aeonUploading||aeonRec) return; var el=document.getElementById('aeon-file-input'); if(el) el.click(); };
App.aeonFileChosen=function(el){
  var f=el.files&&el.files[0]; el.value='';
  if(!f) return;
  if(f.size>4*1024*1024) toast('Belge büyük (>4MB) — gönderim biraz sürebilir',3200);
  readFileB64(f).then(function(b64){
    submitAeonMedia('file',b64,f.type||'application/octet-stream',{name:f.name,size:f.size},'Belge: '+f.name);
  }).catch(function(){ toast('Belge okunamadı'); });
};
// ---------- ÆON hazır ses dosyası gönderme (canlı kayıttan farklı — cihazdan seçilir) ----------
// Ses oynatıcı zaten 'voice' kind'ini peaks olmadan da (düz dalga formuyla) çizebiliyor,
// bu yüzden yeni bir oynatıcı yazmak yerine aynı balon/oynatma koduna extra.viaUpload
// bayrağıyla katılıyoruz — süre yalnızca dosyanın kendi metadata'sından okunur.
App.aeonPickAudioFile=function(){ if(ui.aeonUploading||aeonRec) return; var el=document.getElementById('aeon-audio-input'); if(el) el.click(); };
App.aeonAudioFileChosen=function(el){
  var f=el.files&&el.files[0]; el.value='';
  if(!f) return;
  if(!/^audio\//.test(f.type)){ toast('Bu bir ses dosyası değil'); return; }
  if(f.size>4*1024*1024) toast('Ses dosyası büyük (>4MB) — gönderim biraz sürebilir',3200);
  var probe=document.createElement('audio'), probeUrl=URL.createObjectURL(f);
  function finish(durationSec){
    URL.revokeObjectURL(probeUrl);
    readFileB64(f).then(function(b64){
      submitAeonMedia('voice',b64,f.type||'audio/mpeg',{durationSec:durationSec,name:f.name,viaUpload:true},'Ses dosyası: '+f.name);
    }).catch(function(){ toast('Ses dosyası okunamadı'); });
  }
  probe.preload='metadata';
  probe.onloadedmetadata=function(){ finish(isFinite(probe.duration)?Math.round(probe.duration):0); };
  probe.onerror=function(){ finish(0); };
  probe.src=probeUrl;
};
App.onLunaDraft=function(el){ ui.lunaDraft=el.value; try{ el.style.height='auto'; el.style.height=Math.min(el.scrollHeight,120)+'px'; }catch(e){} };
App.onAeonDraft=function(el){
  ui.aeonDraft=el.value;
  try{ el.style.height='auto'; el.style.height=Math.min(el.scrollHeight,120)+'px'; }catch(e){}
  // Tam render tetiklemeden gönder düğmesi/karakter sayacı durumunu hedefli güncelle (duyarlılık için)
  try{
    var hasText=!!el.value.trim().length;
    var btn=document.getElementById('aeon-send-btn');
    if(btn){ if(hasText) btn.classList.remove('is-disabled'); else btn.classList.add('is-disabled'); btn.style.display=hasText?'flex':'none'; }
    var mic=document.getElementById('aeon-mic-btn'); if(mic) mic.style.display=hasText?'none':'flex';
    var cnt=document.getElementById('aeon-char-count'), left=600-el.value.length;
    if(cnt){ cnt.style.display=left<100?'block':'none'; cnt.textContent=left+' karakter kaldı'; }
  }catch(e){}
};
App.askLuna=function(){ var el=document.getElementById('luna-input'); var t=el?el.value.trim():String(ui.lunaDraft||'').trim(); if(!t){ toast('Önce sorunu yaz'); return; } if(t.length>600) t=t.slice(0,600); ui.lunaDraft=t; streamAsk('luna',t); };
App.askAeon=function(){ var el=document.getElementById('aeon-input'); var t=el?el.value.trim():String(ui.aeonDraft||'').trim(); if(!t){ toast('Önce sorunu yaz ⬡'); return; } if(t.length>600) t=t.slice(0,600); submitAeonQuestion(t); };
App.onAeonKeydown=function(e){ if(e.key==='Enter'&&!e.shiftKey){ e.preventDefault(); App.askAeon(); } };
App.aeonScrollToBottom=function(){
  var sc=document.querySelector('[data-scroll]'); if(!sc) return;
  try{ sc.scrollTo({top:sc.scrollHeight,behavior:'smooth'}); }catch(e){ sc.scrollTop=sc.scrollHeight; }
  var fab=document.getElementById('aeon-scroll-fab'); if(fab) fab.style.display='none';
};
App.showAeonHistory=function(){
  // Tüm geçmişi aç/kapat — sadece buton tıklamasıyla çalışır; otomatik daralma/açılma olmaz.
  ui.aeonShowAllHistory=!ui.aeonShowAllHistory;
  render();
  try{
    var thread=document.getElementById('aeon-thread'), sc=document.querySelector('[data-scroll]');
    if(thread && sc){
      if(ui.aeonShowAllHistory){ var top=thread.offsetTop||0; sc.scrollTop=Math.max(0,top-8); }
      else { sc.scrollTop=sc.scrollHeight; }
    }
  }catch(e){}
};
App.toggleAeonSearch=function(){
  var bar=document.getElementById('aeon-search-bar'); if(!bar) return;
  var show=bar.style.display==='none';
  bar.style.display=show?'block':'none';
  if(show){
    try{ bar.scrollIntoView({block:'nearest',behavior:'smooth'}); }catch(e){}
    var inp=document.getElementById('aeon-search-input'); if(inp) inp.focus();
  }
  else App.clearAeonSearch();
};
App.clearAeonSearch=function(){
  var inp=document.getElementById('aeon-search-input'); if(inp) inp.value='';
  App.filterAeonSearch({value:''});
};
// Sohbet DOM'unu tam render() TETİKLEMEDEN filtreler — thread çocuklarını gün-gruplarına
// ayırıp her mesajın metnini arama sorgusuyla karşılaştırır, eşleşmeyeni gizler; bir günün
// TÜM mesajları gizliyse o günün ayırıcısı da gizlenir. Veri silinmez, yalnızca DOM'da saklanır.
App.filterAeonSearch=function(el){
  var q=String((el&&el.value)||'').trim().toLowerCase();
  var thread=document.getElementById('aeon-thread'); if(!thread) return;
  var groups=[], current=null, totalMatches=0;
  Array.prototype.forEach.call(thread.children,function(node){
    if(!node.classList) return;
    if(node.classList.contains('msg-daydiv')){ current={div:node,rows:[]}; groups.push(current); }
    else if(node.classList.contains('msg-row')){
      if(!current){ current={div:null,rows:[]}; groups.push(current); }
      current.rows.push(node);
    }
  });
  groups.forEach(function(g){
    var groupHasMatch=false;
    g.rows.forEach(function(row){
      var match=!q || row.textContent.toLowerCase().indexOf(q)!==-1;
      row.style.display=match?'':'none';
      if(match){ groupHasMatch=true; totalMatches++; }
    });
    if(g.div) g.div.style.display=groupHasMatch?'':'none';
  });
  var hint=document.getElementById('aeon-search-noresult');
  if(q && totalMatches===0){
    if(!hint){
      hint=document.createElement('div'); hint.id='aeon-search-noresult';
      hint.style.cssText='text-align:center;padding:16px 10px;color:var(--faint);font-size:13px;font-weight:600;';
      hint.textContent='Eşleşen mesaj bulunamadı';
      thread.appendChild(hint);
    }
  } else if(hint){ hint.remove(); }
};
function notifCardHTML(n){
  var when=''; try{ when=new Date(n.ts||n.receivedAt).toLocaleString('tr-TR',{hour:'2-digit',minute:'2-digit',day:'2-digit',month:'2-digit'}); }catch(e){}
  var unread=!n.read, s='';
  s+='<div style="position:relative;background:var(--card);border:1px solid '+(unread?'rgba(201,160,60,0.5)':'rgba(150,110,120,0.14)')+';border-radius:18px;padding:13px 14px;box-shadow:0 4px 14px rgba(150,110,120,0.08);margin-bottom:9px;'+(unread?'border-left:3px solid #D4AF37;':'')+'">';
  s+='<div style="display:flex;align-items:center;gap:8px;margin-bottom:6px;">';
  s+='<span style="display:inline-flex;align-items:center;gap:4px;font-size:12px;font-weight:800;letter-spacing:.8px;color:#1a1404;background:linear-gradient(135deg,#E6C15A,#C99A3A);border-radius:999px;padding:3px 11px;">'+icon('hexagon',12)+' ÆON</span>';
  if(unread) s+='<span style="width:8px;height:8px;border-radius:50%;background:#E9576F;box-shadow:0 0 7px #E9576F;"></span>';
  s+='<span style="font-size:11.5px;color:var(--faint);margin-left:auto;font-weight:600;">'+esc(when)+'</span></div>';
  s+='<div style="font-size:14.5px;line-height:1.5;color:var(--text2);word-break:break-word;white-space:pre-wrap;">'+esc(String(n.text||''))+'</div>';
  s+='<div style="display:flex;align-items:center;gap:4px;margin-top:10px;"><span style="font-size:11px;color:var(--faint);font-weight:600;display:flex;align-items:center;gap:3px;">'+(n.read?(icon('check-check',12)+' Okundu'):'• Yeni')+'</span>';
  s+='<button onclick="App.deleteNotif(\''+n.id+'\')" style="margin-left:auto;border:1px solid rgba(150,110,120,0.2);cursor:pointer;background:none;color:#C77;font-weight:700;padding:6px 12px;border-radius:10px;display:flex;align-items:center;gap:4px;">'+icon('trash-2',12)+' Sil</button></div></div>';
  return s;
}
// Luna = OpenAI destekli kişisel sohbet. WhatsApp tarzı balonlar: kullanıcı sorusu
// sağ (mor) balon, Luna yanıtı sol balon. Günde LUNA_DAILY_LIMIT soru hakkı.
function lunaBubbleOut(text,time){
  var h='<div style="align-self:flex-end;max-width:88%;display:flex;flex-direction:column;align-items:flex-end;">';
  h+='<div style="background:#7E62B8;color:#fff;border-radius:17px 17px 5px 17px;padding:10px 13px;font-size:14.5px;line-height:1.5;box-shadow:0 3px 10px rgba(126,98,184,0.28);">'+clampBubble(text,'#7E62B8')+'</div>';
  h+='<div style="font-size:11px;margin-top:3px;color:var(--faint);">'+esc(aeonTime(time))+'</div></div>';
  return h;
}
function lunaBubbleIn(inner,time,streaming){
  var h='<div style="align-self:flex-start;max-width:88%;">';
  h+='<div style="background:var(--card);color:var(--text);border:1px solid rgba(155,127,201,0.28);border-left:3px solid #9B7FC9;border-radius:5px 17px 17px 17px;padding:10px 13px;box-shadow:0 3px 10px rgba(150,110,120,0.08);">';
  h+='<div style="display:flex;align-items:center;gap:7px;margin-bottom:5px;"><span style="display:inline-flex;align-items:center;gap:4px;font-size:11px;font-weight:800;letter-spacing:.6px;color:#fff;background:linear-gradient(135deg,#9B7FC9,#E9AFC1);border-radius:999px;padding:2px 9px;">'+icon('moon',11)+' Luna</span>'+(streaming?'<span style="font-size:11px;color:#7A5AA0;font-weight:700;">düşünüyor…</span>':'')+'<span style="margin-left:auto;font-size:10.5px;color:var(--faint);font-weight:600;">'+esc(aeonTime(time))+'</span></div>';
  h+='<div style="font-size:14.5px;line-height:1.55;">'+inner+'</div>';
  h+='</div></div>';
  return h;
}
function lunaChatHTML(){
  var soft='155,127,201';
  var hasKey=!!(data.settings&&data.settings.openaiKey&&String(data.settings.openaiKey).trim());
  var used=lunaTodayCount(), left=Math.max(0,LUNA_DAILY_LIMIT-used);
  var asking=ui.askKind==='luna';
  var h='';
  h+='<div class="sey-chat-sectionhead" style="--section-accent:#9B7FC9;--section-accent2:#E9AFC1;--section-ink:#fff;">';
  h+='<span class="section-icon">'+icon('moon',19)+'</span>';
  h+='<div style="flex:1;min-width:0;"><div class="section-title">Luna modu</div><div class="section-sub">sıcak, sakin OpenAI yoldaşın · günde '+LUNA_DAILY_LIMIT+' soru</div></div>';
  h+='<span class="section-pill">'+used+'/'+LUNA_DAILY_LIMIT+'</span>';
  h+='</div>';
  // anahtar yoksa uyarı
  if(!hasKey){
    h+='<div style="display:flex;gap:9px;align-items:center;background:rgba(255,225,150,0.22);border:1px solid rgba(220,180,90,0.4);border-radius:14px;padding:11px 12px;margin-bottom:10px;"><span style="display:inline-flex;">'+icon('lock',16)+'</span><div style="flex:1;min-width:0;font-size:12.5px;color:#8A6A2A;line-height:1.45;">Luna’nın yanıt verebilmesi için OpenAI anahtarı gerekir.</div><button onclick="App.go(\'ayarlar\')" style="flex-shrink:0;border:none;cursor:pointer;background:linear-gradient(135deg,#9B7FC9,#E9AFC1);color:#fff;font-weight:800;font-size:12.5px;padding:8px 12px;border-radius:11px;">Ayarlar</button></div>';
  }
  // sohbet balonları
  var qa=(data.luna&&Array.isArray(data.luna.qa))?data.luna.qa.slice():[];
  qa.sort(function(a,b){ return String(a&&(a.ts||a.date)||'').localeCompare(String(b&&(b.ts||b.date)||'')); });
  h+='<div style="display:flex;flex-direction:column;gap:10px;">';
  if(!qa.length && !asking){
    h+='<div style="text-align:center;padding:26px 18px;border-radius:20px;background:linear-gradient(160deg,rgba(155,127,201,0.12),rgba(233,175,193,0.08));border:1px solid rgba(155,127,201,0.18);"><div style="margin-bottom:7px;color:#9B7FC9;display:flex;justify-content:center;">'+icon('moon',30)+'</div><div style="font-size:14.5px;font-weight:800;color:var(--text);margin-bottom:5px;">Luna burada, seni dinlemeye hazır</div><div style="font-size:12.5px;color:var(--muted);line-height:1.6;">İçinden ne geçiyorsa — bir soru, bir dert ya da küçük bir sevinç… Aşağıya yazman yeterli. Acelen olmasın, ben buradayım.</div></div>';
  }
  qa.forEach(function(x){ if(!x) return;
    h+=lunaBubbleOut(String(x.question||''),x.ts||x.date);
    h+=lunaBubbleIn(clampBubble(String(x.answer||''),'var(--card)'),x.ts||x.date,false);
  });
  if(asking){
    h+=lunaBubbleOut(String(ui.askQuestion||''),new Date().toISOString());
    h+=lunaBubbleIn('<div id="luna-answer" style="white-space:pre-wrap;word-break:break-word;"></div>',new Date().toISOString(),true);
  }
  h+='</div>';
  // giriş alanı / kota bandı
  if(ui.lunaError) h+='<div style="font-size:12.5px;color:#C0605F;background:rgba(220,120,120,0.1);border:1px solid rgba(220,120,120,0.25);border-radius:12px;padding:9px 11px;margin-top:10px;">'+esc(ui.lunaError)+'</div>';
  if(!asking && left<=0){
    h+='<div style="margin-top:12px;display:flex;gap:10px;align-items:center;background:linear-gradient(135deg,rgba(155,127,201,0.14),rgba(233,175,193,0.12));border:1px solid rgba('+soft+',0.32);border-radius:16px;padding:13px 15px;"><span style="color:#9B7FC9;display:inline-flex;">'+icon('moon',22)+'</span><div style="font-size:13px;color:var(--text2);line-height:1.45;">Bugünlük <b>'+LUNA_DAILY_LIMIT+' sorunu</b> sordun. Yarın yeni haklarınla Luna seni bekliyor.</div></div>';
  } else if(!asking && hasKey){
    h+='<div style="margin-top:12px;display:flex;gap:8px;align-items:flex-end;">';
    h+='<textarea id="luna-input" oninput="App.onLunaDraft(this)" placeholder="Luna’ya içini dök… ('+left+' hakkın kaldı)" rows="1" style="flex:1;border:1px solid var(--field-bd);background:var(--field);border-radius:18px;padding:11px 14px;font-size:14.5px;resize:none;outline:none;line-height:1.4;max-height:120px;overflow-y:auto;">'+esc(ui.lunaDraft||'')+'</textarea>';
    h+='<button onclick="App.askLuna()" aria-label="Gönder" style="flex-shrink:0;border:none;cursor:pointer;width:46px;height:46px;border-radius:50%;color:#fff;background:linear-gradient(135deg,#9B7FC9,#E9AFC1);box-shadow:0 6px 16px rgba('+soft+',0.4);display:flex;align-items:center;justify-content:center;">'+icon('send',18)+'</button>';
    h+='</div>';
  } else if(asking){
    h+='<div style="margin-top:12px;text-align:center;font-size:12.5px;color:var(--faint);display:flex;align-items:center;justify-content:center;gap:5px;">Luna yanıtlıyor… '+icon('moon',13)+'</div>';
  }
  return h;
}
function aeonTime(iso){
  try{
    var d=new Date(iso); if(isNaN(d.getTime())) return '';
    var hm=d.toLocaleTimeString('tr-TR',{hour:'2-digit',minute:'2-digit'});
    if(fmt(d)===todayStr()) return hm;
    return d.toLocaleDateString('tr-TR',{day:'2-digit',month:'short'})+' · '+hm;
  }catch(e){ return ''; }
}
// Gün ayırıcı etiket ("Bugün / Dün / 3 Temmuz") — uzun sohbetlerde zaman çizelgesi netliği için.
function aeonDayDivider(iso){
  try{
    var d=new Date(iso); if(isNaN(d.getTime())) return '';
    var ds=fmt(d), t=todayStr(), y=addDays(t,-1);
    if(ds===t) return 'Bugün';
    if(ds===y) return 'Dün';
    var sameYear=ds.slice(0,4)===t.slice(0,4);
    return d.toLocaleDateString('tr-TR',sameYear?{day:'2-digit',month:'long'}:{day:'2-digit',month:'long',year:'numeric'});
  }catch(e){ return ''; }
}
// Uzun mesajları kısalt: max-height ile kırp + alta yumuşak geçiş + "Devamını göster" düğmesi.
// Tam render olmadan DOM üzerinden açılır/kapanır (kaydırma zıplamaz).
// Basit markdown-lite: **kalın**, *italik*/_italik_, otomatik link, "- "/"* " liste maddesi.
// Girdi ÖNCE esc() ile HTML-kaçışlı olmalı (ham < > & zaten entity'ye çevrilmiş olur) —
// bu fonksiyon yalnızca escape edilmiş metin üzerinde çalışır, asla ham kullanıcı girdisini
// doğrudan HTML'e enjekte etmez.
function mdLite(safe){
  // Liste maddesi: satır başında "- " veya "* " → madde işareti (bold/italik'ten ÖNCE işlenir
  // ki tek yıldızlı liste imi "*" italik regex'ine karışmasın)
  safe=safe.replace(/^[ \t]*[-*][ \t]+(?=\S)/gm,'• ');
  // Otomatik link: http(s):// ile başlayan URL'ler tıklanabilir olur (cümle sonu noktalama linke dahil edilmez)
  safe=safe.replace(/(https?:\/\/[^\s<]+)/g,function(url){
    var clean=url.replace(/[),.;:!?'"]+$/,''); var trail=url.slice(clean.length);
    return '<a href="'+clean+'" target="_blank" rel="noopener noreferrer" style="color:inherit;text-decoration:underline;text-underline-offset:2px;">'+clean+'</a>'+trail;
  });
  // Kalın: **metin**
  safe=safe.replace(/\*\*([^\n*]+?)\*\*/g,'<b>$1</b>');
  // İtalik: *metin* veya _metin_
  safe=safe.replace(/(^|[^*])\*([^\n*]+?)\*(?!\*)/g,'$1<i>$2</i>');
  safe=safe.replace(/(^|[^_])_([^\n_]+?)_(?!_)/g,'$1<i>$2</i>');
  return safe;
}
function clampBubble(text,fadeColor){
  var t=String(text==null?'':text);
  var long=t.length>240||t.split('\n').length>7;
  var safe=mdLite(esc(t));
  if(!long) return '<div style="white-space:pre-wrap;word-break:break-word;">'+safe+'</div>';
  var h='<div style="position:relative;">';
  h+='<div data-clamp="140" data-exp="0" style="max-height:140px;overflow:hidden;white-space:pre-wrap;word-break:break-word;">'+safe+'</div>';
  h+='<div class="seyfade" style="position:absolute;left:0;right:0;bottom:0;height:38px;background:linear-gradient(180deg,rgba(0,0,0,0),'+fadeColor+' 92%);pointer-events:none;"></div></div>';
  h+='<button onclick="App.toggleMsg(this)" style="margin-top:5px;border:none;background:none;cursor:pointer;font-size:12.5px;font-weight:800;color:inherit;opacity:.92;padding:2px 0;">Devamını göster ⌄</button>';
  return h;
}
// ÆON sohbet balonlarında uzun metinler için kullanıcı kontrollü Tümünü göster / Daralt toggle'ı.
// clampBubble()'dan farklı olarak butona basılmadan balon kendi kendine daralmaz; durum render sırasında
// belirlenir ve her balon kendi indeksine göre bağımsız toggle'lanır.
var AEON_BUBBLE_MAX_LINES=7;
var AEON_BUBBLE_MAX_CHARS=240;
function aeonBubbleText(text,kind){
  var t=String(text==null?'':text).trim();
  var safe=mdLite(esc(t));
  var long=t.length>AEON_BUBBLE_MAX_CHARS||t.split('\n').length>AEON_BUBBLE_MAX_LINES;
  if(!long) return '<div style="white-space:pre-wrap;word-break:break-word;">'+safe+'</div>';
  var id='aeon-bubble-'+((++aeonBubbleCounter)|0);
  var isDarkOut=kind==='out';
  var btnColor=isDarkOut?'rgba(255,255,255,0.88)':'var(--muted)';
  var h='<div id="'+id+'" style="position:relative;">';
  h+='<div data-aeon-bubble="1" data-exp="0" style="max-height:140px;overflow:hidden;white-space:pre-wrap;word-break:break-word;">'+safe+'</div>';
  h+='<div data-aeon-fade="1" style="position:absolute;left:0;right:0;bottom:0;height:38px;background:linear-gradient(180deg,rgba(0,0,0,0),rgba(0,0,0,0.18));pointer-events:none;"></div></div>';
  h+='<button onclick="App.toggleAeonBubble(\''+id+'\')" style="margin-top:6px;border:none;background:none;cursor:pointer;font-size:12px;font-weight:800;color:'+btnColor+';opacity:.95;padding:2px 0;display:flex;align-items:center;gap:4px;">Tümünü göster ⌄</button>';
  return h;
}
App.toggleAeonBubble=function(id){
  var wrap=document.getElementById(id); if(!wrap) return;
  var content=wrap.querySelector('[data-aeon-bubble="1"]');
  var fade=wrap.querySelector('[data-aeon-fade="1"]');
  var btn=wrap.nextElementSibling;
  if(!content) return;
  if(content.getAttribute('data-exp')==='1'){
    content.style.maxHeight='140px';
    content.setAttribute('data-exp','0');
    if(fade) fade.style.display='';
    if(btn) btn.innerHTML='Tümünü göster ⌄';
  } else {
    content.style.maxHeight='none';
    content.setAttribute('data-exp','1');
    if(fade) fade.style.display='none';
    if(btn) btn.innerHTML='Daralt ⌃';
  }
};
var aeonBubbleCounter=0;
App.toggleMsg=function(btn){
  var wrap=btn.previousElementSibling; if(!wrap) return;
  var content=wrap.querySelector('[data-clamp]'), fade=wrap.querySelector('.seyfade'); if(!content) return;
  if(content.getAttribute('data-exp')==='1'){ content.style.maxHeight=content.getAttribute('data-clamp')+'px'; content.setAttribute('data-exp','0'); if(fade) fade.style.display=''; btn.textContent='Devamını göster ⌄'; }
  else { content.style.maxHeight='none'; content.setAttribute('data-exp','1'); if(fade) fade.style.display='none'; btn.textContent='Daha az göster ⌃'; }
};
// Tek bir ÆON sohbet balonu (giden soru ya da gelen yanıt/bildirim) için HTML üretir.
// aeonChatHTML() tam listeyi bu yardımcıyla kurar; appendAeonOutgoing() ise tam render
// yapmadan yalnızca YENİ mesajı DOM'a eklerken aynı markup'ı (sapma riski olmadan) tekrar kullanır.
// mk: 'voice'|'image'|undefined(metin). Kendi yolladığın medya aeonMediaCache'te zaten
// var olduğu için anında dolar; gelen/geçmiş medya aeonLoadVisibleMedia() ile sonradan çekilir.
function aeonMediaSlotHTML(it,bg,fg){
  var elId='aeon-media-'+it.mediaId;
  if(it.mediaKind==='image'){
    var ratio=(it.w&&it.h)?(it.w+'/'+it.h):'1/1';
    return '<div id="'+elId+'" class="aeon-media-slot" data-media-id="'+esc(it.mediaId)+'" data-media-kind="image" onclick="App.aeonOpenImage(\''+it.mediaId+'\')" style="width:210px;max-width:58vw;aspect-ratio:'+ratio+';border-radius:14px;overflow:hidden;background:'+bg+';display:flex;align-items:center;justify-content:center;cursor:pointer;color:'+fg+';"><span style="font-size:12.5px;opacity:.75;">Yükleniyor…</span></div>';
  }
  if(it.mediaKind==='file'){
    return '<div id="'+elId+'" class="aeon-media-slot" data-media-id="'+esc(it.mediaId)+'" data-media-kind="file" style="color:'+fg+';min-width:170px;"><span style="font-size:12.5px;opacity:.75;display:flex;align-items:center;gap:4px;">'+icon('file-text',13)+' Yükleniyor…</span></div>';
  }
  return '<div id="'+elId+'" class="aeon-media-slot" data-media-id="'+esc(it.mediaId)+'" data-media-kind="voice" style="color:'+fg+';min-width:170px;"><span style="font-size:12.5px;opacity:.75;display:flex;align-items:center;gap:4px;">'+icon('mic',13)+' Yükleniyor…</span></div>';
}
function aeonItemHTML(it,enterCls){
  var h='';
  if(it.kind==='out'){
    h+='<div class="msg-row out'+enterCls+'">';
    if(it.mediaKind){
      h+='<div class="msg-bubble out" style="padding:'+(it.mediaKind==='image'?'4px':'10px 13px')+';">'+aeonMediaSlotHTML(it,'rgba(255,255,255,0.16)','#fff')+'</div>';
    } else {
      h+='<div class="msg-bubble out">'+aeonBubbleText(it.text,'out')+'</div>';
    }
    var foot;
    if(it.answered) foot='<span style="color:var(--faint);display:inline-flex;align-items:center;gap:3px;">'+icon('check-check',11)+' yanıtlandı</span>';
    else if(it.reviewing) foot='<span class="aeon-typing-dots"><span></span><span></span><span></span></span><span style="color:var(--aeon);font-weight:800;font-family:ui-monospace,SFMono-Regular,Menlo,monospace;letter-spacing:.3px;margin-left:5px;">ÆON inceliyor</span>';
    else foot='<span style="color:var(--faint);display:inline-flex;align-items:center;gap:3px;">'+icon('check',11)+' Gönderildi</span>';
    h+='<div style="font-size:11px;margin-top:3px;display:flex;gap:7px;align-items:center;">'+foot+'<span style="color:var(--faint);">'+esc(aeonTime(it.time))+'</span></div></div>';
  } else {
    h+='<div class="msg-row in'+enterCls+'">';
    h+='<div class="msg-bubble in">';
    h+='<div style="display:flex;align-items:center;gap:7px;margin-bottom:5px;"><span style="display:inline-flex;align-items:center;gap:3px;font-size:11px;font-weight:800;letter-spacing:.6px;color:#1a1404;background:linear-gradient(135deg,var(--aeon2),var(--aeon));border-radius:999px;padding:2px 9px;">'+icon('hexagon',11)+' ÆON</span>'+(it.unread?'<span style="width:7px;height:7px;border-radius:50%;background:#E9576F;box-shadow:0 0 6px #E9576F;"></span>':'')+'<span style="margin-left:auto;font-size:10.5px;color:var(--faint);font-weight:600;">'+esc(aeonTime(it.time))+'</span></div>';
    if(it.mediaKind) h+=aeonMediaSlotHTML(it,'var(--icon)','var(--aeon)');
    else h+='<div style="font-size:14.5px;line-height:1.55;">'+aeonBubbleText(it.text,'in')+'</div>';
    if(it.observer&&it.id) h+='<div style="display:flex;margin-top:7px;"><button onclick="App.deleteNotif(\''+it.id+'\')" style="margin-left:auto;border:1px solid rgba(150,110,120,0.2);cursor:pointer;background:none;color:#C77;font-weight:700;padding:4px 10px;border-radius:9px;display:flex;align-items:center;gap:4px;">'+icon('trash-2',11)+' Sil</button></div>';
    h+='</div></div>';
  }
  return h;
}
// Ek gönderme sayfası (fotoğraf/belge/ses dosyası) — WhatsApp/Telegram tarzı
// premium bottom-sheet. Canlı kayıt mikrofon düğmesinden bağımsız; yalnızca
// cihazdan seçilen ekler burada toplanır.
function aeonAttachSheetHTML(){
  var items=[
    {ic:'camera',label:'Fotoğraf',sub:'Galeriden seç ya da fotoğraf çek',kind:'photo'},
    {ic:'file-text',label:'Belge',sub:'PDF, Word, Excel ve diğer dosyalar',kind:'file'},
    {ic:'music',label:'Ses dosyası',sub:'Cihazından hazır bir ses kaydı yükle',kind:'audio'}
  ];
  var h='<div id="aeon-attach-back" onclick="App.aeonCloseAttachSheet()" style="position:fixed;inset:0;z-index:340;background:rgba(44,36,38,0.42);backdrop-filter:blur(4px);display:flex;align-items:flex-end;justify-content:center;padding:14px;animation:seyFade .2s ease;">';
  h+='<div onclick="event.stopPropagation()" style="width:100%;max-width:420px;background:var(--modal);border-radius:24px;padding:10px;padding-bottom:calc(10px + env(safe-area-inset-bottom));box-shadow:0 -10px 40px rgba(0,0,0,0.2);animation:seyPop .22s ease;">';
  h+='<div style="padding:12px 12px 8px;font-size:12px;font-weight:800;letter-spacing:.4px;color:var(--faint);text-transform:uppercase;">ÆON’a gönder</div>';
  items.forEach(function(it){
    h+='<button onclick="App.aeonSheetPick(\''+it.kind+'\')" style="display:flex;align-items:center;gap:13px;text-align:left;border:none;background:none;cursor:pointer;padding:10px 12px;border-radius:16px;width:100%;">';
    h+='<span style="width:42px;height:42px;border-radius:13px;flex-shrink:0;display:flex;align-items:center;justify-content:center;background:linear-gradient(135deg,var(--aeon2),var(--aeon));color:#1a1404;">'+icon(it.ic,19)+'</span>';
    h+='<div style="flex:1;min-width:0;"><div style="font-size:14.5px;font-weight:800;color:var(--text);">'+it.label+'</div><div style="font-size:11.5px;color:var(--faint);margin-top:1px;">'+it.sub+'</div></div>';
    h+='</button>';
  });
  h+='<button onclick="App.aeonCloseAttachSheet()" style="margin-top:6px;border:1px solid var(--field-bd);background:var(--field);color:var(--muted);font-weight:800;font-size:13.5px;padding:12px;border-radius:14px;cursor:pointer;width:100%;">Vazgeç</button>';
  h+='</div></div>';
  return h;
}
App.aeonOpenAttachSheet=function(){ if(ui.aeonUploading||aeonRec) return; ui.aeonAttachOpen=true; render(); };
App.aeonCloseAttachSheet=function(){ ui.aeonAttachOpen=false; render(); };
App.aeonSheetPick=function(kind){
  ui.aeonAttachOpen=false; render();
  if(kind==='photo') App.aeonPickPhoto();
  else if(kind==='file') App.aeonPickFile();
  else if(kind==='audio') App.aeonPickAudioFile();
};
// ÆON = insan-döngülü sohbet: kullanıcının soruları (sağ/giden balon) panele gider,
// gözlemci ÆON adına yanıtlar (sol/gelen balon). Gözlemci mesajları da gelen balondur.
// Tümünü tek kronolojik akışta gösteririz; yazı kutusu altta sabittir.
function aeonChatHTML(){
  var h='';
  h+='<div class="sey-chat-sectionhead" style="--section-accent:var(--aeon);--section-accent2:var(--aeon2);--section-ink:#1a1404;">';
  h+='<span class="section-icon">'+icon('hexagon',18)+'</span>';
  h+='<div style="flex:1;min-width:0;"><div class="section-title">ÆON akışı</div><div class="section-sub">sınırsız sohbet · ses, fotoğraf ve gözlemci yanıtları</div></div>';
  h+='<span class="section-pill">canlı</span></div>';
  h+='<div id="aeon-search-bar" style="display:none;margin:0 2px 12px;position:relative;">';
  h+='<input id="aeon-search-input" type="text" oninput="App.filterAeonSearch(this)" placeholder="Mesajlarda ara…" style="width:100%;box-sizing:border-box;border:1px solid var(--field-bd);background:var(--field);border-radius:14px;padding:10px 36px 10px 14px;font-size:14px;color:var(--text);outline:none;">';
  h+='<button onclick="App.clearAeonSearch()" style="position:absolute;right:8px;top:50%;transform:translateY(-50%);border:none;background:none;cursor:pointer;color:var(--faint);line-height:1;padding:4px;display:flex;align-items:center;">'+icon('x',14)+'</button>';
  h+='</div>';
  // ÆON akışı: bildirimler (gelen/gözlemci) + kullanıcı soruları + ÆON yanıtları
  // tek kronolojik thread'de birleştirilir. Zaman damgası sayısal, aynı saniyedeki
  // mesajlar ekleme sırasıyla kararlı kalır; böylece soru her zaman kendi yanıtından önce.
  function tsNum(t){ var d=new Date(t||0); return isNaN(d.getTime())?Infinity:d.getTime(); }
  var items=[], seq=0;
  notifList().filter(function(n){ return n&&!n.deleted; }).forEach(function(n){ var t=n.ts||n.receivedAt||''; items.push({sort:String(t),tsNum:tsNum(t),_idx:seq++,kind:'in',text:n.text,time:t,observer:true,id:n.id,unread:!n.read,mediaKind:n.kind,mediaId:n.mediaId,mediaMime:n.mediaMime,durationSec:n.durationSec,peaks:n.peaks,w:n.w,h:n.h,mediaName:n.mediaName,mediaSize:n.mediaSize}); });
  var qa=(data.aeon&&Array.isArray(data.aeon.qa))?data.aeon.qa:[];
  qa.forEach(function(x){ if(!x) return;
    var qt=x.ts||''; items.push({sort:String(qt),tsNum:tsNum(qt),_idx:seq++,kind:'out',text:x.question,time:qt,answered:!!x.answer,reviewing:!!x.reviewingAt,mediaKind:x.kind,mediaId:x.mediaId,mediaMime:x.mediaMime,durationSec:x.durationSec,peaks:x.peaks,w:x.w,h:x.h,mediaName:x.mediaName,mediaSize:x.mediaSize});
    if(x.answer){ var at=x.answeredAt||qt||''; items.push({sort:String(at),tsNum:tsNum(at),_idx:seq++,kind:'in',text:x.answer,time:at,mediaKind:x.answerKind,mediaId:x.answerMediaId,mediaMime:x.answerMediaMime,durationSec:x.answerDurationSec,peaks:x.answerPeaks,w:x.answerW,h:x.answerH,mediaName:x.answerMediaName,mediaSize:x.answerMediaSize}); }
  });
  items.sort(function(a,b){ return (a.tsNum-b.tsNum)||(a._idx-b._idx); });
  // Geçmiş çok uzadıysa (ör. aylarca birikmiş yüzlerce mesaj) her tam render'da TÜMÜNÜ
  // yeniden kurmak yerine yalnızca son AEON_PAGE_SIZE öğeyi göster; üstte "daha eski
  // mesajları göster" düğmesiyle kullanıcı isterse tam geçmişi açabilir (veri kaybı yok —
  // data.aeon.qa/notifications'ta her şey saklı kalır, yalnızca render'da sınırlanır).
  var totalItems=items.length, hiddenOlder=0, visibleItems=items;
  if(totalItems>AEON_PAGE_SIZE && !ui.aeonShowAllHistory){
    hiddenOlder=totalItems-AEON_PAGE_SIZE;
    visibleItems=items.slice(hiddenOlder);
  }
  h+='<div id="aeon-thread" style="display:flex;flex-direction:column;gap:10px;">';
  if(totalItems>AEON_PAGE_SIZE){
    var historyOpen=ui.aeonShowAllHistory;
    var historyLabel=historyOpen?'↓ Tümünü daralt':'↑ Daha eski '+hiddenOlder+' mesajı göster';
    h+='<div style="display:flex;justify-content:center;margin:2px 0 4px;"><button onclick="App.showAeonHistory()" style="border:1px solid var(--field-bd);background:var(--field);color:var(--muted);cursor:pointer;border-radius:999px;padding:7px 16px;font-size:12px;font-weight:700;">'+historyLabel+'</button></div>';
  }
  if(!items.length){
    h+='<div class="msg-empty-hint" style="text-align:center;padding:26px 18px;border-radius:20px;background:linear-gradient(160deg,rgba(230,193,90,0.13),rgba(201,154,58,0.07));border:1px solid rgba(201,154,58,0.2);"><div style="margin-bottom:7px;color:var(--aeon);display:flex;justify-content:center;">'+icon('hexagon',30)+'</div><div style="font-size:14.5px;font-weight:800;color:var(--text);margin-bottom:5px;">Burası senin sessiz limanın</div><div style="font-size:12.5px;color:var(--muted);line-height:1.6;">Aklından geçeni, içini dökmek istediğin her şeyi buraya bırakabilirsin. Ne zaman istersen — gece ya da gündüz — ben hep buradayım. ✨</div></div>';
  }
  // Yalnızca son render'dan bu yana beliren mesajlara giriş animasyonu oynat (tüm geçmiş her seferinde titremesin)
  var prevDateStr=null, newestSort=items.length?items[items.length-1].sort:null;
  visibleItems.forEach(function(it){
    var ds=''; try{ var dd=new Date(it.time); if(!isNaN(dd.getTime())) ds=fmt(dd); }catch(e){}
    if(ds && ds!==prevDateStr){ h+='<div class="msg-daydiv">'+esc(aeonDayDivider(it.time))+'</div>'; prevDateStr=ds; }
    var enterCls=(aeonLastSeenSort!=null && it.sort>aeonLastSeenSort)?' msg-enter':'';
    h+=aeonItemHTML(it,enterCls);
  });
  h+='</div>';
  aeonLastSeenSort=newestSort;
  aeonLastRenderedDateStr=prevDateStr;
  // alta sabit yazı kutusu (opak zemin → akış altından geçerken okunur kalır)
  h+='<div id="aeon-sticky-bar" style="position:sticky;bottom:0;background:var(--chatbar);backdrop-filter:blur(16px);-webkit-backdrop-filter:blur(16px);padding:12px 0 6px;margin-top:6px;z-index:5;">';
  h+='<button id="aeon-scroll-fab" class="aeon-scrollfab" style="top:-52px;right:4px;" onclick="App.aeonScrollToBottom()" aria-label="En alta in">⌄</button>';
  if(ui.aeonError) h+='<div style="font-size:12.5px;color:#C0605F;background:rgba(220,120,120,0.1);border:1px solid rgba(220,120,120,0.25);border-radius:12px;padding:9px 11px;margin-bottom:8px;">'+esc(ui.aeonError)+'</div>';
  var draftLen=String(ui.aeonDraft||'').length, leftChars=600-draftLen;
  h+='<div id="aeon-char-count" style="display:'+(leftChars<100?'block':'none')+';font-size:10.5px;color:var(--faint);text-align:right;margin-bottom:3px;">'+leftChars+' karakter kaldı</div>';
  if(ui.aeonRecActive){
    h+='<div style="display:flex;align-items:center;gap:10px;background:linear-gradient(135deg,var(--aeon2),var(--aeon));border-radius:26px;padding:7px 8px 7px 14px;box-shadow:0 8px 20px var(--aeon-glow);">';
    h+='<span style="width:9px;height:9px;border-radius:50%;background:#1a1404;flex-shrink:0;animation:seyTwinkle 1s ease-in-out infinite;"></span>';
    h+='<span id="aeon-rec-time" style="font-size:13px;font-weight:800;color:#1a1404;font-variant-numeric:tabular-nums;flex-shrink:0;">00:00</span>';
    h+='<div id="aeon-rec-wave" style="flex:1;display:flex;align-items:center;gap:2px;height:26px;min-width:0;"></div>';
    h+='<button onclick="App.aeonRecCancel()" aria-label="İptal et" style="flex-shrink:0;border:none;cursor:pointer;background:rgba(26,20,4,0.16);color:#1a1404;width:34px;height:34px;border-radius:50%;display:flex;align-items:center;justify-content:center;">'+icon('x',15)+'</button>';
    h+='<button onclick="App.aeonRecStop(true)" aria-label="Gönder" style="flex-shrink:0;border:none;cursor:pointer;background:#1a1404;color:var(--aeon2);width:34px;height:34px;border-radius:50%;display:flex;align-items:center;justify-content:center;">'+icon('check',15)+'</button>';
    h+='</div>';
  } else {
    h+='<div style="display:flex;gap:8px;align-items:flex-end;">';
    h+='<input type="file" id="aeon-photo-input" accept="image/*" style="display:none;" onchange="App.aeonPhotoChosen(this)">';
    h+='<input type="file" id="aeon-file-input" accept="'+AEON_FILE_ACCEPT+'" style="display:none;" onchange="App.aeonFileChosen(this)">';
    h+='<input type="file" id="aeon-audio-input" accept="audio/*" style="display:none;" onchange="App.aeonAudioFileChosen(this)">';
    h+='<button onclick="App.aeonOpenAttachSheet()" aria-label="Ek gönder" style="flex-shrink:0;border:1px solid var(--field-bd);cursor:pointer;width:44px;height:44px;border-radius:50%;background:var(--field);color:var(--muted);display:flex;align-items:center;justify-content:center;'+(ui.aeonUploading?'opacity:.5;pointer-events:none;':'')+'">'+icon('paperclip',18)+'</button>';
    h+='<textarea id="aeon-input" class="aeon-input-field" oninput="App.onAeonDraft(this)" onkeydown="App.onAeonKeydown(event)" placeholder="İçini dök, buradayım…" rows="1" style="flex:1;border:1px solid var(--field-bd);background:var(--field);border-radius:18px;padding:11px 14px;font-size:14.5px;resize:none;outline:none;line-height:1.4;max-height:120px;overflow-y:auto;">'+esc(ui.aeonDraft||'')+'</textarea>';
    h+='<button id="aeon-send-btn" class="aeon-send-btn'+(draftLen?'':' is-disabled')+'" onclick="App.askAeon()" aria-label="Gönder" style="display:'+(draftLen?'flex':'none')+';flex-shrink:0;border:none;cursor:pointer;width:46px;height:46px;border-radius:50%;color:#1a1404;background:linear-gradient(135deg,var(--aeon2),var(--aeon));box-shadow:0 6px 16px var(--aeon-glow);align-items:center;justify-content:center;">'+icon('send',19)+'</button>';
    h+='<button id="aeon-mic-btn" onclick="App.aeonMicTap()" aria-label="Sesli mesaj kaydet" style="display:'+(draftLen?'none':'flex')+';flex-shrink:0;border:none;cursor:pointer;width:46px;height:46px;border-radius:50%;color:#1a1404;background:linear-gradient(135deg,var(--aeon2),var(--aeon));box-shadow:0 6px 16px var(--aeon-glow);align-items:center;justify-content:center;'+(ui.aeonUploading?'opacity:.5;pointer-events:none;':'')+'">'+icon('mic',19)+'</button>';
    h+='</div>';
  }
  h+='</div>';
  return h;
}
function mesajHTML(){
  var h=lunaChatHTML();
  h+='<div style="height:1px;background:linear-gradient(90deg,transparent,rgba(150,110,120,0.25),transparent);margin:22px 0 16px;"></div>';
  h+=aeonChatHTML();
  return h;
}
App.openMesaj=function(){ markNotifsRead(); var ex=document.getElementById('sey-inbox-pop'); if(ex) ex.remove(); ui.tab='mesaj'; ui.aeonScrollBottom=true; render(); };
App.dismissPopup=function(){ var pend=notifList().filter(function(n){ return n&&!n.deleted&&!n.seen; }); pend.forEach(function(n){ n.seen=true; }); if(pend.length) save(); var ex=document.getElementById('sey-inbox-pop'); if(ex) ex.remove(); render(); };
App.closeAeonPop=function(){ var ex=document.getElementById('sey-inbox-pop'); if(ex) ex.remove(); };
App.deleteNotif=function(id){ var n=null; notifList().forEach(function(x){ if(x&&x.id===id) n=x; }); if(!n) return; n.deleted=true; n.deletedAt=new Date().toISOString(); save(); render(); toast('Bildirim silindi'); };

// ── Magnezyum Danışmanı handlerları ──
function timeHM(){ var d=new Date(); return pad(d.getHours())+':'+pad(d.getMinutes()); }

App.takeMagnesium=function(form,mg){
  var date=activeDate();
  var rec=getDay(data,date,dayIndexFor(date));
  var nudge=calculateMgNudge(date);
  var f=form||nudge.form||'glycinate';
  var dose=Math.min(Math.max(1,Math.round(Number(mg)||400)),MG_MAX_ELEMENTAL);
  rec.magnesium.taken=true;
  rec.magnesium.skipped=false;
  rec.magnesium.skippedDate='';
  rec.magnesium.form=f;
  rec.magnesium.mg=dose;
  rec.magnesium.time=timeHM();
  rec.magnesium.reason=nudge.reasons.slice(0,5);
  rec.habits=rec.habits||{};
  rec.habits.magnesium=true;
  data.settings.magnesium.lastNudgeDate=date;
  data.settings.magnesium.dismissedUntil=null;
  // Modeli güncelle: her alım responseLog'a yazılır.
  var model=data.magnesiumModel||(data.magnesiumModel={responseLog:[],lutealHitRate:null,lastCalculatedAt:null});
  if(!Array.isArray(model.responseLog)) model.responseLog=[];
  model.responseLog.push({date:date,action:'taken',form:f,mg:dose,score:nudge.score,phase:nudge.phase,reasons:nudge.reasons.slice(0,5),ts:new Date().toISOString()});
  if(model.responseLog.length>90) model.responseLog=model.responseLog.slice(-90);
  model.lastCalculatedAt=new Date().toISOString();
  // Lüteal hit-rate'i yeniden hesapla
  recalcLutealHitRate();
  save(); render();
  toast('Magnezyum kaydedildi');
};

App.skipMagnesium=function(reason){
  var date=activeDate();
  var rec=getDay(data,date,dayIndexFor(date));
  rec.magnesium.skipped=true;
  rec.magnesium.skippedDate=date;
  rec.magnesium.taken=false;
  rec.magnesium.skipReason=reason||'İstemiyorum';
  rec.magnesium.form='';
  rec.magnesium.mg=0;
  rec.magnesium.time='';
  rec.magnesium.reason=[];
  rec.habits=rec.habits||{};
  rec.habits.magnesium=false;
  data.settings.magnesium.lastNudgeDate=date;
  data.settings.magnesium.dismissedUntil='';
  // Modeli güncelle: pas geçiş kaydını responseLog'a ekle
  var model=data.magnesiumModel||(data.magnesiumModel={responseLog:[],lutealHitRate:null,lastCalculatedAt:null});
  if(!Array.isArray(model.responseLog)) model.responseLog=[];
  var nudge=calculateMgNudge(date);
  model.responseLog.push({date:date,action:'skipped',reason:reason||'İstemiyorum',score:nudge.score,phase:nudge.phase,ts:new Date().toISOString()});
  if(model.responseLog.length>90) model.responseLog=model.responseLog.slice(-90);
  model.lastCalculatedAt=new Date().toISOString();
  recalcLutealHitRate();
  save(); render();
  toast('Bugün magnezyum alınmadı olarak işaretlendi.');
};

App.snoozeMg=function(){
  var s=data.settings.magnesium||{};
  s.dismissedUntil=addDays(todayStr(),1);
  s.lastNudgeDate=todayStr();
  // Modeli güncelle: erteleme kaydet
  var model=data.magnesiumModel||(data.magnesiumModel={responseLog:[],lutealHitRate:null,lastCalculatedAt:null});
  if(!Array.isArray(model.responseLog)) model.responseLog=[];
  model.responseLog.push({date:todayStr(),action:'snoozed',ts:new Date().toISOString()});
  if(model.responseLog.length>90) model.responseLog=model.responseLog.slice(-90);
  model.lastCalculatedAt=new Date().toISOString();
  save(); render();
  toast('Yarın tekrar hatırlatılacak.');
};


App.editMagnesium=function(){ ui.mgEditing=!ui.mgEditing; render(); };
App.deleteMgEntry=function(){
  var date=activeDate();
  var rec=getDay(data,date,dayIndexFor(date));
  rec.magnesium.taken=false; rec.magnesium.skipped=false; rec.magnesium.skippedDate='';
  rec.magnesium.form=''; rec.magnesium.mg=0; rec.magnesium.time=''; rec.magnesium.reason=[]; rec.magnesium.effectNote='';
  if(rec.habits) rec.habits.magnesium=false;
  ui.mgEditing=false;
  save(); render();
};

App.setMgForm=function(form){ var date=activeDate(); var rec=getDay(data,date,dayIndexFor(date)); rec.magnesium.form=form; save(); render(); };
App.setMgMg=function(val){ var date=activeDate(); var rec=getDay(data,date,dayIndexFor(date)); var v=Math.round(Number(val.replace(/[^0-9]/g,''))||0); rec.magnesium.mg=Math.min(Math.max(0,v),MG_MAX_ELEMENTAL); save(); render(); };
App.setMgTime=function(val){ var date=activeDate(); var rec=getDay(data,date,dayIndexFor(date)); if(/^\d{1,2}:\d{2}$/.test(val)){ var p=val.split(':'); rec.magnesium.time=pad(Number(p[0]))+':'+pad(Number(p[1])); } else { rec.magnesium.time=val; } save(); render(); };
App.saveMgNote=function(note){ var date=activeDate(); var rec=getDay(data,date,dayIndexFor(date)); rec.magnesium.effectNote=(note||'').slice(0,240); save(); render(); };

App.saveMgFeedback=function(improved){
  var date=activeDate();
  var rec=getDay(data,date,dayIndexFor(date));
  rec.magnesium.feedback=improved===true;
  var yest=addDays(date,-1);
  var yRec=data.days[yest];
  if(yRec && yRec.magnesium && yRec.magnesium.taken && !yRec.magnesium.effectNote){
    yRec.magnesium.effectNote=improved===true?'Ertesi gün fayda göründü.':'Ertesi gün belirgin fark görülmedi.';
  }
  // Modeli güncelle: geri bildirim kaydını responseLog'a ekle ve lüteal hit-rate'i tazele
  var model=data.magnesiumModel||(data.magnesiumModel={responseLog:[],lutealHitRate:null,lastCalculatedAt:null});
  if(!Array.isArray(model.responseLog)) model.responseLog=[];
  model.responseLog.push({date:yest,action:'feedback',improved:improved===true,ts:new Date().toISOString()});
  if(model.responseLog.length>90) model.responseLog=model.responseLog.slice(-90);
  model.lastCalculatedAt=new Date().toISOString();
  recalcLutealHitRate();
  save(); render();
  toast(improved===true?'Noted: faydalı göründü.':'Noted: pek fark görülmedi.');
};


App.setMgMode=function(mode){
  var s=data.settings.magnesium||{};
  s.mode=(mode==='adaptive'||mode==='lutealOnly'||mode==='off')?mode:'adaptive';
  // Mode değişikliğini model loguna da kaydet (öğrenme verisi)
  var model=data.magnesiumModel||(data.magnesiumModel={responseLog:[],lutealHitRate:null,lastCalculatedAt:null});
  if(!Array.isArray(model.responseLog)) model.responseLog=[];
  model.responseLog.push({date:todayStr(),action:'modeChange',mode:s.mode,ts:new Date().toISOString()});
  if(model.responseLog.length>90) model.responseLog=model.responseLog.slice(-90);
  model.lastCalculatedAt=new Date().toISOString();
  save(); render();
};


App.setMgKidney=function(v){
  var s=data.settings.magnesium||{};
  s.kidneyDisease=!!v;
  save(); render();
};

App.setMgTolerated=function(v){
  var s=data.settings.magnesium||{};
  s.tolerated=(v==='good'?true:(v==='bad'?false:null));
  save(); render();
};


// ── Kilit ekranı handler'ları ──
App.submitAuth=function(){
  var u=(document.getElementById('sey-auth-user').value||'').trim();
  var p=(document.getElementById('sey-auth-pass').value||'').trim();
  if(!u||!p){
    ui.authError=true; ui.authErrorMsg='Lütfen kullanıcı adını ve parolanı yaz.';
    render(); return;
  }
  if(sha256(u)===AUTH_HASH && sha256(p)===AUTH_HASH){
    if(!data) data=migrate(createDefaultData());
    var a=data.settings.auth;
    a.usernameHash=AUTH_HASH;
    a.usernameMask=u.length>2?u.charAt(0)+'*'.repeat(u.length-2)+u.charAt(u.length-1):'***';
    a.rememberMe=!!ui.authRemember;
    a.unlockedAt=new Date().toISOString();
    a.unlockCount=(a.unlockCount||0)+1;
    ui.authError=false; ui.authErrorMsg=''; ui.authRemember=false; ui.authUnlocked=true;
    save(); render();
    toast('Hoş geldin, Sevgili Günışığı ✨',2600);
  } else {
    ui.authError=true; ui.authErrorMsg='Giriş bilgileri uyuşmadı. Bir nefes al ve tekrar dene.';
    render();
  }
};
App.toggleRememberAuth=function(){ ui.authRemember=!ui.authRemember; render(); };
App.dismissAuthError=function(){ ui.authError=false; ui.authErrorMsg=''; render(); };

setTimeout(pollRemote,1500);
setInterval(pollRemote,30000); // ön planda ~30 sn'de bir kontrol (ÆON yanıtları + sağlık senkronu daha hızlı görünsün)
document.addEventListener('visibilitychange',function(){ if(!document.hidden) pollRemote(); });
window.addEventListener('focus',pollRemote);   // iOS PWA: sekmeye/uygulamaya dönünce hemen çek
window.addEventListener('pageshow',pollRemote); // bfcache'ten geri dönüşte
window.addEventListener('online',pollRemote);   // bağlantı gelince bekleyen makbuzu da gönderir

render();
setTimeout(replayAnswerPopup,900); // açılışta: önceki oturumda inmiş yanıtları popup yap + "görüldü" işaretle
})();
