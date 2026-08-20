(function(){
"use strict";
var ICONS={
  'activity':'<path d="M22 12h-2.48a2 2 0 0 0-1.93 1.46l-2.35 8.36a.25.25 0 0 1-.48 0L9.24 2.18a.25.25 0 0 0-.48 0l-2.35 8.36A2 2 0 0 1 4.49 12H2" />',
  'ruler':'<path d="M21.3 15.3a2.4 2.4 0 0 1 0 3.4l-2.6 2.6a2.4 2.4 0 0 1-3.4 0L2.7 8.7a2.41 2.41 0 0 1 0-3.4l2.6-2.6a2.41 2.41 0 0 1 3.4 0Z" /><path d="m14.5 12.5 2-2" /><path d="m11.5 9.5 2-2" /><path d="m8.5 6.5 2-2" /><path d="m17.5 15.5 2-2" />',
  'info':'<circle cx="12" cy="12" r="10" /><path d="M12 16v-4" /><path d="M12 8h.01" />',
  'alarm-clock':'<circle cx="12" cy="13" r="8" /><path d="M12 9v4l2 2" /><path d="M5 3 2 6" /><path d="m22 6-3-3" /><path d="M6.38 18.7 4 21" /><path d="M17.64 18.67 20 21" />',
  'annoyed':'<circle cx="12" cy="12" r="10" /><path d="M8 15h8" /><path d="M8 9h2" /><path d="M14 9h2" />',
  'triangle-alert':'<path d="m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3" /><path d="M12 9v4" /><path d="M12 17h.01" />',
  'apple':'<path d="M12 6.528V3a1 1 0 0 1 1-1h0" /><path d="M18.237 21A15 15 0 0 0 22 11a6 6 0 0 0-10-4.472A6 6 0 0 0 2 11a15.1 15.1 0 0 0 3.763 10 3 3 0 0 0 3.648.648 5.5 5.5 0 0 1 5.178 0A3 3 0 0 0 18.237 21" />',
  'archive':'<rect width="20" height="5" x="2" y="3" rx="1" /><path d="M4 8v11a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8" /><path d="M10 12h4" />',
  'ban':'<circle cx="12" cy="12" r="10" /><path d="M4.929 4.929 19.07 19.071" />',
  'battery-low':'<path d="M22 14v-4" /><path d="M6 14v-4" /><rect x="2" y="6" width="16" height="12" rx="2" />',
  'bed':'<path d="M2 4v16" /><path d="M2 8h18a2 2 0 0 1 2 2v10" /><path d="M2 17h20" /><path d="M6 8v9" />',
  'book-open':'<path d="M12 7v14" /><path d="M3 18a1 1 0 0 1-1-1V4a1 1 0 0 1 1-1h5a4 4 0 0 1 4 4 4 4 0 0 1 4-4h5a1 1 0 0 1 1 1v13a1 1 0 0 1-1 1h-6a3 3 0 0 0-3 3 3 3 0 0 0-3-3z" />',
  'book':'<path d="M4 19.5v-15A2.5 2.5 0 0 1 6.5 2H19a1 1 0 0 1 1 1v18a1 1 0 0 1-1 1H6.5a1 1 0 0 1 0-5H20" />',
  'brain':'<path d="M12 18V5" /><path d="M15 13a4.17 4.17 0 0 1-3-4 4.17 4.17 0 0 1-3 4" /><path d="M17.598 6.5A3 3 0 1 0 12 5a3 3 0 1 0-5.598 1.5" /><path d="M17.997 5.125a4 4 0 0 1 2.526 5.77" /><path d="M18 18a4 4 0 0 0 2-7.464" /><path d="M19.967 17.483A4 4 0 1 1 12 18a4 4 0 1 1-7.967-.517" /><path d="M6 18a4 4 0 0 1-2-7.464" /><path d="M6.003 5.125a4 4 0 0 0-2.526 5.77" />',
  'calendar':'<path d="M8 2v4" /><path d="M16 2v4" /><rect width="18" height="18" x="3" y="4" rx="2" /><path d="M3 10h18" />',
  'camera':'<path d="M13.997 4a2 2 0 0 1 1.76 1.05l.486.9A2 2 0 0 0 18.003 7H20a2 2 0 0 1 2 2v9a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V9a2 2 0 0 1 2-2h1.997a2 2 0 0 0 1.759-1.048l.489-.904A2 2 0 0 1 10.004 4z" /><circle cx="12" cy="13" r="3" />',
  'car':'<path d="M19 17h2c.6 0 1-.4 1-1v-3c0-.9-.7-1.7-1.5-1.9C18.7 10.6 16 10 16 10s-1.3-1.4-2.2-2.3c-.5-.4-1.1-.7-1.8-.7H5c-.6 0-1.1.4-1.4.9l-1.4 2.9A3.7 3.7 0 0 0 2 12v4c0 .6.4 1 1 1h2" /><circle cx="7" cy="17" r="2" /><path d="M9 17h6" /><circle cx="17" cy="17" r="2" />',
  'microscope':'<path d="M6 18h8" /><path d="M3 22h18" /><path d="M14 22a7 7 0 1 0 0-14h-1" /><path d="M9 14h2" /><path d="M9 12a2 2 0 0 1-2-2V6h6v4a2 2 0 0 1-2 2Z" /><path d="M12 6V3a1 1 0 0 0-1-1H9a1 1 0 0 0-1 1v3" />',
  'bandage':'<path d="M10 10.01h.01" /><path d="M10 14.01h.01" /><path d="M14 10.01h.01" /><path d="M14 14.01h.01" /><path d="M18 6v12" /><path d="M6 6v12" /><rect x="2" y="6" width="20" height="12" rx="2" />',
  'chart-column':'<path d="M3 3v16a2 2 0 0 0 2 2h16" /><path d="M18 17V9" /><path d="M13 17V5" /><path d="M8 17v-3" />',
  'check-check':'<path d="M18 6 7 17l-5-5" /><path d="m22 10-7.5 7.5L13 16" />',
  'check':'<path d="M20 6 9 17l-5-5" />',
  'clipboard-list':'<rect width="20" height="20" x="2" y="3" rx="2" /><path d="M8 7h8" /><path d="M8 11h8" /><path d="M8 15h5" />',
  'shield':'<path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />',
  'cherry':'<path d="M2 17a5 5 0 0 0 10 0c0-2.76-2.5-5-5-3-2.5-2-5 .24-5 3Z" /><path d="M12 17a5 5 0 0 0 10 0c0-2.76-2.5-5-5-3-2.5-2-5 .24-5 3Z" /><path d="M7 14c3.22-2.91 4.29-8.75 5-12 1.66 2.38 4.94 9 5 12" /><path d="M22 9c-4.29 0-7.14-2.33-10-7 5.71 0 10 4.67 10 7Z" />',
  'chevron-down':'<path d="m6 9 6 6 6-6" />',
  'chevron-up':'<path d="m18 15-6-6-6 6" />',
  'circle':'<circle cx="12" cy="12" r="10" />',
  'clapperboard':'<path d="m12.296 3.464 3.02 3.956" /><path d="M20.2 6 3 11l-.9-2.4c-.3-1.1.3-2.2 1.3-2.5l13.5-4c1.1-.3 2.2.3 2.5 1.3z" /><path d="M3 11h18v8a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" /><path d="m6.18 5.276 3.1 3.899" />',
  'cloud-rain':'<path d="M4 14.899A7 7 0 1 1 15.71 8h1.79a4.5 4.5 0 0 1 2.5 8.242" /><path d="M16 14v6" /><path d="M8 14v6" /><path d="M12 16v6" />',
  'cloud':'<path d="M17.5 19H9a7 7 0 1 1 6.71-9h1.79a4.5 4.5 0 1 1 0 9Z" />',
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
  'feather':'<path d="M12.67 19a2 2 0 0 0 1.416-.588l6.154-6.172a6 6 0 0 0-8.49-8.49L5.586 9.914A2 2 0 0 0 5 11.328V18a1 1 0 0 0 1 1z" /><path d="M16 8 2 22" /><path d="M17.5 15H9" />',
  'heart-handshake':'<path d="M19.414 14.414C21 12.828 22 11.5 22 9.5a5.5 5.5 0 0 0-9.591-3.676.6.6 0 0 1-.818.001A5.5 5.5 0 0 0 2 9.5c0 2.3 1.5 4 3 5.5l5.535 5.362a2 2 0 0 0 2.879.052 2.12 2.12 0 0 0-.004-3 2.124 2.124 0 1 0 3-3 2.124 2.124 0 0 0 3.004 0 2 2 0 0 0 0-2.828l-1.881-1.882a2.41 2.41 0 0 0-3.409 0l-1.71 1.71a2 2 0 0 1-2.828 0 2 2 0 0 1 0-2.828l2.823-2.762" />',
  'headphones':'<path d="M3 14h3a2 2 0 0 1 2 2v3a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-7a9 9 0 0 1 18 0v7a2 2 0 0 1-2 2h-1a2 2 0 0 1-2-2v-3a2 2 0 0 1 2-2h3" />',
  'heart':'<path d="M2 9.5a5.5 5.5 0 0 1 9.591-3.676.56.56 0 0 0 .818 0A5.49 5.49 0 0 1 22 9.5c0 2.29-1.5 4-3 5.5l-5.492 5.313a2 2 0 0 1-3 .019L5 15c-1.5-1.5-3-3.2-3-5.5" />',
  'hexagon':'<path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z" />',
  'image':'<rect width="18" height="18" x="3" y="3" rx="2" ry="2" /><circle cx="9" cy="9" r="2" /><path d="m21 15-3.086-3.086a2 2 0 0 0-2.828 0L6 21" />',
  'lamp':'<path d="M12 12v6" /><path d="M4.077 10.615A1 1 0 0 0 5 12h14a1 1 0 0 0 .923-1.385l-3.077-7.384A2 2 0 0 0 15 2H9a2 2 0 0 0-1.846 1.23Z" /><path d="M8 20a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v1a1 1 0 0 1-1 1H9a1 1 0 0 1-1-1z" />',
  'leaf':'<path d="M11 20A7 7 0 0 1 9.8 6.1C15.5 5 17 4.48 19 2c1 2 2 4.18 2 8 0 5.5-4.78 10-10 10Z" /><path d="M2 21c0-3 1.85-5.36 5.08-6C9.5 14.52 12 13 13 12" />',
  'lock':'<rect width="18" height="11" x="3" y="11" rx="2" ry="2" /><path d="M7 11V7a5 5 0 0 1 10 0v4" />',
  'coffee':'<path d="M10 2v2" /><path d="M14 2v2" /><path d="M16 8a1 1 0 0 1 1 1v8a4 4 0 0 1-4 4H7a4 4 0 0 1-4-4V9a1 1 0 0 1 1-1h14a4 4 0 1 1 0 8h-1" /><path d="M6 2v2" />',
  'life-buoy':'<circle cx="12" cy="12" r="10" /><path d="m4.93 4.93 4.24 4.24" /><path d="m14.83 9.17 4.24-4.24" /><path d="m14.83 14.83 4.24 4.24" /><path d="m9.17 14.83-4.24 4.24" /><circle cx="12" cy="12" r="4" />',
  'clock':'<circle cx="12" cy="12" r="10" /><path d="M12 6v6l4 2" />',
  'map-pin':'<path d="M20 10c0 4.993-5.539 10.193-7.399 11.799a1 1 0 0 1-1.202 0C9.539 20.193 4 14.993 4 10a8 8 0 0 1 16 0" /><circle cx="12" cy="10" r="3" />',
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
  'rotate-ccw':'<path d="M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 8" /><path d="M3 3v5h5" />',
  'file-text':'<path d="M6 22a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h8a2.4 2.4 0 0 1 1.704.706l3.588 3.588A2.4 2.4 0 0 1 20 8v12a2 2 0 0 1-2 2z" /><path d="M14 2v5a1 1 0 0 0 1 1h5" /><path d="M10 9H8" /><path d="M16 13H8" /><path d="M16 17H8" />',
  'trending-up':'<path d="M16 7h6v6" /><path d="m22 7-8.5 8.5-5-5L2 17" />',
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
};
// SVG ikon yardımcısı — emoji yerine tutarlı, tema-uyumlu (currentColor) çizgi ikonlar.
// size: piksel; cls: ekstra CSS class (opsiyonel, örn. "seyIconSpin"). Bilinmeyen isimde
// boş kare yerine sessizce boş span döner (uygulama çökmesin).
function icon(name,size,cls){
  var body=ICONS[name]; if(!body) return '';
  size=size||20;
  return '<svg class="seyIcon'+(cls?(' '+cls):'')+'" width="'+size+'" height="'+size+'" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">'+body+'</svg>';
}
var qs=new URLSearchParams(location.search);
var DEMO_MODE=qs.get("demo")==="1";
var REPO=qs.get("repo")||"mustafaras/seyma-data";
var BRANCH=qs.get("branch")||"main";
var SYNC_RECEIPT_PATH="data/sync-receipt.json";
var OBSERVER_PROJECTION_PATH="data/observer-snapshot.json";
var EVENT_LOG_DIR="data/events";
var AEON_FILE_ACCEPT=".pdf,.doc,.docx,.xls,.xlsx,.ppt,.pptx,.txt,.rtf,.csv,.zip,application/pdf";
var PTKEY="seyma-panel-token";
var APPKEY="seyma-reset-v1";
var CARDEXPKEY="seyma-panel-expand-v1"; // hangi genişletilebilir kartların açık bırakıldığını hatırlar
var INSTABKEY="seyma-panel-insight-tab-v1"; // "Gelişmiş İçgörüler" kartında hangi sekmenin seçili kaldığını hatırlar
var DENSITYKEY="seyma-panel-density-v1"; // Hızlı/Standart/Audit görünüm yoğunluğu
var AUDITTABKEY="seyma-panel-audit-tab-v1";
var PTOKEN="";
var D=null;
var PANEL_LOCATION_CONTEXT={fix:null,history:[],tracks:{}};
var SYNC_RECEIPT=null;
// Prompt 4.2 (Faz 4, C5): eskiden ayri PROJECTION.snapshot/PROJECTION.state/
// PROJECTION.sections/PROJECTION.sectionFetchState globalleri, manuel senkronize
// edilen (panelSig() dahil) tek bir PROJECTION objesinde birlestirildi.
var PROJECTION={snapshot:null,state:{source:'none',reason:'not_loaded',snapshot:null,data:null,coverage:null},sections:{},sectionFetchState:{ok:true,lastError:null,failedAt:null}};
var PANEL_POLL_AT=null;
var PANEL_POLL_STATE={status:'idle',lastOutcome:'idle',lastPollAt:null,lastFetchStartedAt:null,lastFetchCompletedAt:null,lastDurationMs:null,sourceRevision:null,visibleRevision:null,sourceUpdatedAt:null,etag:null,conditionalMode:'etag',fetchCount:0,notModifiedCount:0,skippedCount:0,draftDeferredCount:0,lastErrorCode:null,pendingRender:false,samples:[]};
var PANEL_LATEST_CACHE={etag:null,sourceRevision:null,sourceUpdatedAt:null};
var PANEL_TRANSPORT_CACHE={};
var LAST_RENDERED_POLL_OUTCOME='idle';
var EVENT_LOG_STATE={source:'missing',events:[],audit:{ok:true,issueCount:0,issues:[],deviceCount:0},loadedAt:null,days:[]};
// Kart tazelik rozeti eşikleri: <1 gün "güncel", 1-7 gün "N gün önce" (uyarı),
// >7 gün "eski" (tehlike). dailyPhoto'nun kendi stale mantığından bağımsızdır.
var STALE_WARN_DAYS=1, STALE_DANGER_DAYS=7;
var UI={range:30,selectedDate:null,month:null,msgDraft:"",msgSending:false,aeonReplies:{},expandedCards:{},insightTab:"usage",density:"standard",showAuditPage:false,auditTab:"root",auditReturnScroll:0,newChanges:0,aeonRecActiveP:false,motivationFilter:"all",soulArchiveExpanded:false,soulArchiveType:null,quranBusyId:"",eventLimit:5,eventFilter:"all",d4SelectedModule:null,curatedLogShowAll:false,devTapCount:0,devTapFirstAt:0};
var D4_DRAWER_RETURN_ID=null;
var OBSINBOX=[], OBSSHA=null, OBSRECEIPTS={}, MARKED_REVIEW={};
var HABITS=[["sweetManaged","Tatlı krizini yönettim"],["foodManaged","Yemek/açlık krizini yönettim","2026-07-10"],["coffeeManaged","Kahve/kafein krizini yönettim","2026-07-10"],["eveningControl","Akşam 7'den sonra gereksiz atıştırmadım"],["walked20","En az 4.500 adım yürüdüm"],["protein","2 ana öğünde protein vardı"],["water","Su içmeyi ihmal etmedim"],["vitaminD","D₃K₂ damla aldım"],["sleepReg","Yeterli uyudum (7,5+ saat)","2026-06-28"],["journaled","Duygu/günlük notu yazdım","2026-07-03"],["mediaFed","Zihnimi besledim","2026-07-09"],["freshAir","Açık havaya çıktım","2026-07-03"],["selfKind","Kendime kötü davranmadım"],["caffeineOk","Günlük kafein limitini aşmadım","2026-07-10"],["magnesium","Magnezyum takviyesi aldım"]];
var HT=HABITS.length;
function responseHeaderP(response,name){
  try{ if(response&&response.headers&&typeof response.headers.get==='function') return response.headers.get(name)||null; }catch(e){}
  return null;
}
function pollConditionalDecisionP(cache,status,etag){
  var known=cache&&typeof cache.etag==='string'&&cache.etag;
  if(status===304&&known) return {kind:'not_modified',etag:known,body:false};
  return {kind:'changed',etag:etag||null,body:true};
}
function pollLatencyStatsP(samples){
  var a=(Array.isArray(samples)?samples:[]).map(Number).filter(function(x){return isFinite(x)&&x>=0;}).sort(function(x,y){return x-y;});
  function at(p){ if(!a.length) return null; return a[Math.min(a.length-1,Math.max(0,Math.ceil(a.length*p)-1))]; }
  return {count:a.length,min:a.length?a[0]:null,max:a.length?a[a.length-1]:null,p50:at(.50),p95:at(.95)};
}
function pollRevisionP(data,receipt,projectionState){
  var r=normalizeSyncReceiptP(receipt), p=projectionState&&projectionState.snapshot?projectionState.snapshot:null;
  return {sourceRevision:(data&&data.syncReceipt&&data.syncReceipt.snapshotRevision)||r.snapshotRevision||null,sourceUpdatedAt:(data&&data.syncReceipt&&data.syncReceipt.sourceUpdatedAt)||r.sourceUpdatedAt||null,visibleRevision:(p&&p.snapshotRevision)||r.snapshotRevision||null};
}
function pollRecordP(outcome,startedAt,meta){
  var now=Date.now(), duration=startedAt?Math.max(0,now-startedAt):null, m=meta||{};
  PANEL_POLL_STATE.status=outcome==='error'?'error':outcome==='skipped_input'||outcome==='deferred_draft'?'deferred':'ok';
  PANEL_POLL_STATE.lastOutcome=outcome;
  PANEL_POLL_STATE.lastPollAt=new Date(now).toISOString();
  PANEL_POLL_STATE.lastFetchCompletedAt=m.completedAt||PANEL_POLL_STATE.lastPollAt;
  PANEL_POLL_STATE.lastDurationMs=duration;
  if(m.etag) PANEL_POLL_STATE.etag=m.etag;
  if(m.errorCode) PANEL_POLL_STATE.lastErrorCode=m.errorCode;
  else if(outcome!=='error') PANEL_POLL_STATE.lastErrorCode=null;
  if(duration!==null){ PANEL_POLL_STATE.samples.push(duration); if(PANEL_POLL_STATE.samples.length>100) PANEL_POLL_STATE.samples=PANEL_POLL_STATE.samples.slice(-100); }
  updatePollRibbonP();
  return pollLatencyStatsP(PANEL_POLL_STATE.samples);
}
function markPollSkippedP(reason){
  PANEL_POLL_STATE.status='deferred'; PANEL_POLL_STATE.lastOutcome=reason||'skipped_input'; PANEL_POLL_STATE.skippedCount++; PANEL_POLL_STATE.lastPollAt=new Date().toISOString();
  if(reason==='deferred_draft') PANEL_POLL_STATE.draftDeferredCount++;
  updatePollRibbonP();
}
function panelDraftActiveP(){ return !!(UI.msgSending||String(UI.msgDraft||'').trim()||panelBusyTyping()); }
// REM-58: poll render'ı yalnızca metin girişi değil, gözlemcinin o an
// etkileşimde olduğu tüm yüzeylerde ertelenir. Drawer, filtre, seçili tarih
// ve açık kart varken tam re-render imleç/odak/scroll'u bozabilir; veri yine
// çekilir (fetch-skip değil), yalnızca render kuyruğa alınır. panelDraftActiveP
// metin girişi kapısıdır (fetch'i tamamen atlar); bu fonksiyon render kapısıdır.
function panelInteractionActiveP(){
  if(panelDraftActiveP()) return true;
  if(D4_DRAWER_RETURN_ID||UI.d4SelectedModule) return true;                 // açık drawer
  if(UI.eventFilter&&UI.eventFilter!=='all') return true;                   // event filtresi
  if(UI.motivationFilter&&UI.motivationFilter!=='all') return true;         // motivasyon filtresi
  if(UI.selectedDate&&UI.selectedDate!==today()) return true;               // bugün dışı seçili tarih
  if(UI.expandedCards&&Object.keys(UI.expandedCards).length>0) return true;  // açık kart
  return false;
}
function pollStatusP(){
  var s=PANEL_POLL_STATE||{}, o=s.lastOutcome||'idle';
  if(o==='skipped_input') return {code:o,cls:'b-warn',label:'Polling atlandı',note:'Input odağı korunuyor; sonraki güvenli tur beklenecek.'};
  if(o==='deferred_draft') return {code:o,cls:'b-warn',label:'Taslak korunuyor',note:'Yeni veri alındı; render taslak gönderilene veya temizlenene kadar ertelendi.'};
  if(o==='error') return {code:o,cls:'b-danger',label:'Polling hatası',note:'Son panel çekimi başarısız; önceki görünüm korunuyor.'};
  if(s.lastPollAt&&Date.now()-new Date(s.lastPollAt).getTime()>45000) return {code:'stale',cls:'b-warn',label:'Polling eski',note:'Son güvenli panel çekimi 45 saniyeyi geçti.'};
  if(o==='not_modified') return {code:o,cls:'b-ok',label:'Yakın takip · değişmedi',note:'ETag 304; snapshot gövdesi yeniden indirilmedi.'};
  if(o==='unchanged') return {code:o,cls:'b-ok',label:'Yakın takip · aynı',note:'Kaynak değişmedi; panel yeniden render edilmedi.'};
  if(o==='changed') return {code:o,cls:'b-ok',label:'Yakın takip · güncel',note:'Yeni kaynak revision’ı güvenli şekilde görünür kılındı.'};
  return {code:o,cls:'b-dim',label:'Yakın takip bekleniyor',note:'İlk panel çekimi bekleniyor.'};
}
function updatePollRibbonP(){
  try{
    var p=pollStatusP(), badge=document.getElementById('poll-ribbon-status'), note=document.getElementById('poll-ribbon-note');
    if(badge){ badge.className='badge status-badge status-'+statusToneP(p.cls)+' '+p.cls; badge.textContent=p.label; }
    if(note) note.textContent=p.note;
  }catch(e){}
}
function updatePollRevisionsP(data,receipt,projectionState){
  var r=pollRevisionP(data,receipt,projectionState);
  PANEL_POLL_STATE.sourceRevision=r.sourceRevision; PANEL_POLL_STATE.sourceUpdatedAt=r.sourceUpdatedAt; PANEL_POLL_STATE.visibleRevision=r.visibleRevision;
  return r;
}
function applyPollRenderP(sig,dataChanged,outcome,startedAt,meta){
  if(panelInteractionActiveP()){
    PANEL_POLL_STATE.pendingRender=true; pollRecordP('deferred_draft',startedAt,meta); return false;
  }
  var hadPending=PANEL_POLL_STATE.pendingRender; PANEL_POLL_STATE.pendingRender=false; pollRecordP(outcome,startedAt,meta);
  var shouldRender=!!dataChanged||hadPending;
  LAST_RENDERED_POLL_OUTCOME=outcome;
  if(shouldRender){ LASTSIG=sig; render(); } else updatePollRibbonP();
  return shouldRender;
}
// ── İman Köşesi — panel aynası ──
var PRAYER_NAMES_P={fajr:'İmsak',sunrise:'Güneş',dhuhr:'Öğle',asr:'İkindi',maghrib:'Akşam',isha:'Yatsı'};
var PRAYER_ORDER_P=['fajr','sunrise','dhuhr','asr','maghrib','isha'];
function emptyPrayerEntryP(){ return {time:'',performed:false,inCongregation:false,late:false,madeUp:false,nafile:0,note:'',savedAt:''}; }
function ensurePrayerDayP(rec){
  if(!rec) return null;
  if(!rec.prayer||typeof rec.prayer!=='object') rec.prayer={};
  var p=rec.prayer;
  PRAYER_ORDER_P.forEach(function(k){ if(!p[k]||typeof p[k]!=='object') p[k]=emptyPrayerEntryP(); var e=p[k]; if(typeof e.time!=='string') e.time=''; if(typeof e.performed!=='boolean') e.performed=false; if(typeof e.inCongregation!=='boolean') e.inCongregation=false; if(typeof e.late!=='boolean') e.late=false; if(typeof e.madeUp!=='boolean') e.madeUp=false; if(typeof e.nafile!=='number'||isNaN(e.nafile)) e.nafile=0; if(typeof e.note!=='string') e.note=''; if(typeof e.savedAt!=='string') e.savedAt=''; });
  if(typeof p.fetchedAt!=='string') p.fetchedAt=''; if(typeof p.fetchedFor!=='string') p.fetchedFor=''; if(typeof p.fetchError!=='string') p.fetchError='';
  return p;
}
function prayerDaySummaryP(p){
  var total=0, performed=0, congregation=0, late=0, madeUp=0, nafile=0;
  PRAYER_ORDER_P.forEach(function(k){ var e=p&&p[k]; if(!e) return; total++; if(e.performed){ performed++; if(e.inCongregation) congregation++; if(e.late) late++; if(e.madeUp) madeUp++; } nafile+=Math.max(0,Number(e.nafile)||0); });
  return {total:total,performed:performed,congregation:congregation,late:late,madeUp:madeUp,nafile:nafile};
}
function prayerPerformedCountP(p){ var n=0; PRAYER_ORDER_P.forEach(function(k){ if(p&&p[k]&&p[k].performed) n++; }); return n; }
function prayerAllDoneP(p){ return prayerPerformedCountP(p)>=5; }
function prayerStreakP(){
  var streak=0, d=today();
  while(true){ var rec=D&&D.days?D.days[d]:null; var p=rec?ensurePrayerDayP(rec):null; if(!p||!prayerAllDoneP(p)) break; streak++; d=addDays(d,-1); if(diff(D.startDate,d)<0) break; }
  return streak;
}
function prayerSummaryRangeP(start,end){
  var total=0, performed=0, congregation=0, late=0, madeUp=0, nafile=0, days=0;
  if(!D||!D.days) return {total:0,performed:0,congregation:0,late:0,madeUp:0,nafile:0,days:0};
  var s=start||addDays(today(),-6), e=end||today();
  if(s>e){ var tmp=s; s=e; e=tmp; }
  for(var d=s; diff(e,d)>=0; d=addDays(d,1)){
    var rec=D.days[d]; if(!rec) continue;
    var p=ensurePrayerDayP(rec); var ps=prayerDaySummaryP(p);
    days++; total+=ps.total; performed+=ps.performed; congregation+=ps.congregation; late+=ps.late; madeUp+=ps.madeUp; nafile+=ps.nafile;
  }
  return {total:total,performed:performed,congregation:congregation,late:late,madeUp:madeUp,nafile:nafile,days:days};
}
function prayerLocationP(){ var s=D&&D.settings&&D.settings.prayer; return s&&s.location?s.location:null; }

// ── İlham & İbadet: zikirmatik + ibadet rapor — panel aynası ──
var ZIKR_SEED_P=[
  {id:'subhanallah',name:'Sübhanallah',target:33},
  {id:'elhamdulillah',name:'Elhamdülillah',target:33},
  {id:'allahu_ekber',name:'Allahü Ekber',target:34},
  {id:'la_ilaha_illallah',name:'Lâ ilâhe illallah',target:100},
  {id:'estagfirullah',name:'Estağfirullah',target:100}
];
// Kullanıcı tarafındaki Zikirmatik yeniden tasarlanırken panel kartı da canlıdan
// gizlidir; veri okunur ve korunur, yalnızca görsel yüzey üretilmez.
var ZIKR_V2_VISIBLE_P=true;
function zikrRootP(){ var z=D&&D.zikr; return (z&&typeof z==='object')?z:null; }
function zikrReflectionsP(date){
  var z=zikrRootP(), list=z&&Array.isArray(z.reflections)?z.reflections:[];
  return list.filter(function(x){ return x&&(!date||x.date===date)&&(x.mood||x.feelings||x.thoughts||x.intention); }).sort(function(a,b){ return String(b.updatedAt||b.createdAt||'').localeCompare(String(a.updatedAt||a.createdAt||'')); });
}
function zikrReflectionArchiveCardP(){
  var list=zikrReflectionsP(), h='<div class="card lift span-12 pad" style="order:38;">';
  h+='<div class="lbl" style="display:flex;align-items:center;gap:7px;">'+icon('pen-line',14)+' Zikir Tefekkürleri <span style="margin-left:auto;font-size:var(--f2);color:var(--zikr);font-weight:850;letter-spacing:0;text-transform:none;">'+list.length+' kayıt</span></div>';
  h+='<div class="scroll" style="max-height:360px;display:flex;flex-direction:column;gap:8px;">';
  if(!list.length) h+='<div class="empty"><span class="ei">'+icon('file-text',20)+'</span>Henüz zikir notu yok</div>';
  else list.slice(0,40).forEach(function(n){
    var mood=n.mood?'<span style="padding:3px 7px;border-radius:999px;background:var(--s2);color:var(--zikr);font-size:var(--f1);font-weight:850;">'+esc(n.mood)+'</span>':'';
    h+='<div onclick="pickDay(\''+esc(n.date)+'\')" style="cursor:pointer;padding:10px 11px;border:1px solid var(--bd2);border-radius:11px;background:var(--s1);">';
    h+='<div style="display:flex;align-items:flex-start;justify-content:space-between;gap:8px;"><div><span style="display:block;color:var(--t4);font-size:var(--f1);font-weight:750;">'+esc(shortD(n.date))+'</span><strong style="display:block;margin-top:2px;color:var(--t1);font-size:var(--f3);">'+esc(n.presetName||((zikrPresetP(n.presetId)||{}).name)||n.presetId)+'</strong></div>'+mood+'</div>';
    if(n.feelings) h+='<div style="margin-top:7px;color:var(--t2);font-size:var(--f2);line-height:1.45;white-space:pre-wrap;word-break:break-word;"><b style="color:var(--zikr);">Hislerim · </b>'+esc(n.feelings)+'</div>';
    if(n.thoughts) h+='<div style="margin-top:5px;color:var(--t2);font-size:var(--f2);line-height:1.45;white-space:pre-wrap;word-break:break-word;"><b style="color:var(--zikr);">Düşüncelerim · </b>'+esc(n.thoughts)+'</div>';
    if(n.intention) h+='<div style="margin-top:5px;color:var(--t2);font-size:var(--f2);line-height:1.45;white-space:pre-wrap;word-break:break-word;"><b style="color:var(--amber);">Duam · niyetim · </b>'+esc(n.intention)+'</div>';
    h+='<div style="margin-top:6px;color:var(--t4);font-size:var(--f1);font-weight:700;">'+(Number(n.wordCount)||0)+' kelime · '+esc(String(n.updatedAt||'').slice(11,16))+'</div></div>';
  });
  h+='</div></div>'; return h;
}
function zikrDayTotalP(date){ var z=zikrRootP(); if(!z||!z.sessions) return 0; var s=z.sessions[date]; return (s&&typeof s.totalCount==='number')?s.totalCount:0; }
function zikrDaySetsP(date){ var z=zikrRootP(); if(!z||!z.sessions) return 0; var s=z.sessions[date]; return (s&&typeof s.completedSets==='number')?s.completedSets:0; }
function zikrStreakP(){ var z=zikrRootP(); return (z&&typeof z.streak==='number')?z.streak:0; }
function zikrPresetP(id){
  var z=zikrRootP(), list=z&&Array.isArray(z.presets)?z.presets:ZIKR_SEED_P;
  for(var i=0;i<list.length;i++) if(list[i]&&list[i].id===id) return list[i];
  return list[0]||null;
}
// ZP-03: app.js'teki zikrMath ile birebir aynı formül sözleşmesi (aynı değişken
// adları/aynı dallanma) kullanılır; UI kendi başına farklı matematik üretmez.
// Not: core (esma-olmayan) presetlerde eskiden `count>=target` (yani base) sınırı
// "bitti" gibi ele alınıyordu; bu, ilk 1 tur'dan sonra ömürlük sayım arttıkça
// cycleNo/cyclePosition'ın 1. turda kilitli kalmasına yol açan gerçek bir
// parity hatasıydı. Şimdi app.js'teki `atBoundary` sözleşmesiyle aynı davranır.
// zikrJourneySummaryP (yalnız aktif preset) ve zikrPresetBreakdownP (her preset)
// AYNI matematiği paylaşır — tek kaynak burası.
function zikrPresetMathP(p,j){
  var isEsma=p&&p.kind==='esma', h=null;
  if(j&&Array.isArray(j.hatims)) for(var i=0;i<j.hatims.length;i++) if(j.hatims[i]&&j.hatims[i].id===j.activeHatimId){ h=j.hatims[i]; break; }
  var base=Math.max(1,Number(isEsma?(p.ebced||p.target):p.target)||1);
  var target=isEsma?base*base:base, rawCount=isEsma?(Number(h&&h.count)||0):(Number(j&&j.lifetimeCount)||0);
  var count=isEsma?Math.max(0,Math.min(rawCount,target)):Math.max(0,rawCount);
  var pos=count%base, cycles=Math.floor(count/base), complete=isEsma&&count>=target, atBoundary=!isEsma&&count>0&&pos===0;
  var cyclePosition=complete||atBoundary?base:pos, cycleNo=complete?base:(atBoundary?cycles:cycles+1);
  var completedCycles=isEsma?Math.min(base,cycles):cycles;
  return {base:base,target:target,count:count,cycleNo:cycleNo,cyclePosition:cyclePosition,completedCycles:completedCycles,complete:complete,status:h&&h.status||''};
}
function zikrJourneySummaryP(){
  var z=zikrRootP(); if(!z) return null;
  var id=z.settings&&z.settings.activePresetId, p=zikrPresetP(id); if(!p) return null;
  var journeys=z.journeys&&typeof z.journeys==='object'?z.journeys:{}, j=journeys[p.id]||null;
  var m=zikrPresetMathP(p,j);
  var completed=0, lifetime=0;
  Object.keys(journeys).forEach(function(k){ var x=journeys[k]||{}; completed+=Math.max(0,Number(x.completedHatims)||0); lifetime+=Math.max(0,Number(x.lifetimeCount)||0); });
  return {name:p.name||p.id,kind:p.kind||'core',base:m.base,target:m.target,count:m.count,cycleNo:m.cycleNo,cyclePosition:m.cyclePosition,completedCycles:m.completedCycles,completedHatims:completed,lifetime:lifetime,status:m.status,lastAt:j&&j.lastAt||''};
}
// Her preset/esma için ömür boyu döküm — zikrJourneySummaryP yalnız o an AKTİF
// olanı özetler, bu ise hiç zikredilmiş her preset'i (lifetimeCount>0) listeler.
function zikrPresetBreakdownP(){
  var z=zikrRootP(); if(!z) return [];
  var journeys=z.journeys&&typeof z.journeys==='object'?z.journeys:{};
  var todaySession=(z.sessions&&z.sessions[today()])||null, perPresetToday=(todaySession&&todaySession.perPreset)||{};
  var out=[];
  Object.keys(journeys).forEach(function(pid){
    var j=journeys[pid], lifetime=Math.max(0,Number(j&&j.lifetimeCount)||0);
    if(!j||!lifetime) return;
    var p=zikrPresetP(pid); if(!p) return;
    var m=zikrPresetMathP(p,j), todayCount=Math.max(0,Number((perPresetToday[pid]||{}).count)||0);
    out.push({id:pid,name:p.name||pid,kind:p.kind||'core',today:todayCount,lifetime:lifetime,completedHatims:Math.max(0,Number(j.completedHatims)||0),cyclePosition:m.cyclePosition,base:m.base,cycleNo:m.cycleNo,lastAt:j.lastAt||''});
  });
  out.sort(function(a,b){ return b.lifetime-a.lifetime; });
  return out;
}
// z.sessions tam geçmişi tutar (budanmıyor) — güncel seri zaten data'da hazır
// (z.streak) ama "en uzun seri" hiç saklanmıyor; salt-okunur panel bunu her
// render'da geçmişten türetir, yeni bir alan yazmaz/persist etmez.
function zikrLongestStreakP(){
  var z=zikrRootP(); if(!z||!z.sessions) return 0;
  var dates=Object.keys(z.sessions).filter(function(d){ var s=z.sessions[d]; return s&&Number(s.totalCount)>0; }).sort();
  if(!dates.length) return 0;
  var longest=1, run=1;
  for(var i=1;i<dates.length;i++){
    var prev=new Date(dates[i-1]+'T00:00:00'), cur=new Date(dates[i]+'T00:00:00');
    var diffDays=Math.round((cur-prev)/86400000);
    run=(diffDays===1)?run+1:1;
    if(run>longest) longest=run;
  }
  return longest;
}
// Gün içi eğilim — her günün SON zikir anına (z.sessions[date].lastAt) bakar;
// tek tek her tekin zaman damgası tutulmuyor, bu yüzden bu bir yaklaşıktır
// ("genelde ne zaman biter"), tam dağılım değil — kartta öyle etiketlenir.
function zikrTimeOfDayP(){
  var z=zikrRootP(); if(!z||!z.sessions) return null;
  var buckets={sabah:0,ogle:0,aksam:0,gece:0}, total=0;
  Object.keys(z.sessions).forEach(function(d){
    var s=z.sessions[d]; if(!s||!s.lastAt) return;
    var dt=new Date(s.lastAt); if(isNaN(dt.getTime())) return;
    var hr=dt.getHours(); total++;
    if(hr>=5&&hr<12) buckets.sabah++; else if(hr>=12&&hr<17) buckets.ogle++; else if(hr>=17&&hr<21) buckets.aksam++; else buckets.gece++;
  });
  return total?{total:total,buckets:buckets}:null;
}
function zikrDetailCardP(){
  if(!ZIKR_V2_VISIBLE_P) return '';
  var breakdown=zikrPresetBreakdownP();
  if(!breakdown.length) return '';
  var streak=zikrStreakP(), longest=zikrLongestStreakP(), tod=zikrTimeOfDayP();
  var h='<div class="card lift span-12 pad" style="order:37;">';
  h+='<div class="lbl" style="display:flex;align-items:center;gap:7px;">'+icon('flame',14)+' Zikir Dökümü <span style="margin-left:auto;font-size:var(--f2);color:var(--zikr);font-weight:850;letter-spacing:0;text-transform:none;">'+breakdown.length+' zikir</span></div>';
  h+='<div style="display:flex;gap:8px;margin:2px 0 12px;flex-wrap:wrap;">';
  h+='<span class="tchip fl">Güncel seri · <b style="color:var(--zikr);">'+streak+'</b> gün</span>';
  h+='<span class="tchip fl">En uzun seri · <b style="color:var(--zikr);">'+longest+'</b> gün</span>';
  h+='</div>';
  h+='<div style="display:flex;flex-direction:column;gap:8px;">';
  breakdown.slice(0,14).forEach(function(x){
    var pct=x.base?Math.min(100,Math.round(x.cyclePosition/x.base*100)):0;
    h+='<div style="padding:9px 11px;border:1px solid var(--bd2);border-radius:11px;background:var(--s1);">';
    h+='<div style="display:flex;align-items:center;justify-content:space-between;gap:8px;"><strong style="color:var(--t1);font-size:var(--f3);">'+esc(x.name)+'</strong><span style="font-size:var(--f1);color:var(--t4);font-weight:700;white-space:nowrap;">'+x.lifetime.toLocaleString('tr-TR')+' ömürlük'+(x.completedHatims?' · '+x.completedHatims+' hatim':'')+'</span></div>';
    h+='<div style="display:flex;align-items:center;gap:8px;margin-top:6px;"><div style="flex:1;height:6px;border-radius:99px;background:var(--bd2);overflow:hidden;"><div style="height:100%;width:'+pct+'%;background:var(--zikr);"></div></div><span style="font-size:var(--f1);color:var(--t4);font-weight:700;white-space:nowrap;">'+x.cyclePosition+'/'+x.base+' · '+x.cycleNo+'. tur</span></div>';
    if(x.today>0) h+='<div style="margin-top:5px;font-size:var(--f1);color:var(--zikr);font-weight:700;">Bugün +'+x.today+'</div>';
    h+='</div>';
  });
  h+='</div>';
  if(tod&&tod.total>=5){
    var b=tod.buckets, mx=Math.max(b.sabah,b.ogle,b.aksam,b.gece,1);
    var row=function(label,v){ return '<div style="display:flex;align-items:center;gap:8px;"><span style="width:44px;font-size:var(--f1);color:var(--t4);font-weight:700;">'+label+'</span><div style="flex:1;height:6px;border-radius:99px;background:var(--bd2);overflow:hidden;"><div style="height:100%;width:'+Math.round(v/mx*100)+'%;background:var(--zikr);"></div></div><span style="width:22px;text-align:right;font-size:var(--f1);color:var(--t4);font-weight:700;">'+v+'</span></div>'; };
    h+='<div style="margin-top:14px;padding-top:12px;border-top:1px solid var(--bd2);">';
    h+='<div style="font-size:var(--f1);color:var(--t4);font-weight:800;text-transform:uppercase;letter-spacing:.4px;margin-bottom:8px;">Genelde ne zaman biter · son '+tod.total+' gün (yaklaşık)</div>';
    h+='<div style="display:flex;flex-direction:column;gap:6px;">'+row('Sabah',b.sabah)+row('Öğle',b.ogle)+row('Akşam',b.aksam)+row('Gece',b.gece)+'</div>';
    h+='</div>';
  }
  h+='</div>';
  return h;
}
function zikrWeekTotalP(date){
  date=date||today(); var total=0, days=0;
  for(var i=0;i<7;i++){ var d=addDays(date,-i); var v=zikrDayTotalP(d); if(v>0) days++; total+=v; }
  return {total:total,days:days};
}
function faithWeekKPIsP(date){
  date=date||today();
  var prays=0, cong=0, made=0, late=0, nafile=0, days=0;
  for(var i=0;i<7;i++){
    var d=addDays(date,-i), rec=D&&D.days?D.days[d]:null;
    if(!rec||!rec.prayer) continue; days++;
    PRAYER_ORDER_P.forEach(function(k){ var e=rec.prayer[k]; if(!e) return; if(e.performed){ prays++; if(e.inCongregation)cong++; if(e.late)late++; if(e.madeUp)made++; } nafile+=Math.max(0,Number(e.nafile)||0); });
  }
  var zw=zikrWeekTotalP(date);
  return {prays:prays,max:days*6,cong:cong,madeUp:made,late:late,nafile:nafile,zikr:zw.total,zikrDays:zw.days};
}
function faithDayHeatP(date){
  var rec=D&&D.days?D.days[date]:null, performed=0;
  if(rec&&rec.prayer) PRAYER_ORDER_P.forEach(function(k){ if(rec.prayer[k]&&rec.prayer[k].performed) performed++; });
  var z=D&&D.zikr&&D.zikr.sessions&&D.zikr.sessions[date], zikr=z&&Number(z.totalCount)||0, sets=z&&Number(z.completedSets)||0;
  var level=performed===0?0:(performed<=2?1:(performed<=4?2:3));
  if(zikr||sets) level=Math.min(4,Math.max(1,level+1));
  return {performed:performed,zikr:zikr,sets:sets,level:level};
}
function faithAnnualPanelCardP(){
  var year=+today().slice(0,4), first=year+'-01-01', last=year+'-12-31';
  var dow=(new Date(year,0,1).getDay()+6)%7, cells='', active=0, prayers=0, zikr=0;
  for(var b=0;b<dow;b++) cells+='<i class="blank"></i>';
  for(var d=first;d<=last;d=addDays(d,1)){
    var x=faithDayHeatP(d); if(x.performed||x.zikr){active++; prayers+=x.performed; zikr+=x.zikr;}
    cells+='<i data-l="'+x.level+'" title="'+esc(shortD(d)+' · '+x.performed+' vakit'+(x.zikr?' · '+x.zikr+' zikir':''))+'"></i>';
  }
  var months='<div class="faith-yheat-months"><span>Oca</span><span>Şub</span><span>Mar</span><span>Nis</span><span>May</span><span>Haz</span><span>Tem</span><span>Ağu</span><span>Eyl</span><span>Eki</span><span>Kas</span><span>Ara</span></div>';
  var map='<div class="faith-yheat-scroll">'+months+'<div class="faith-yheat">'+cells+'</div></div><div class="faith-yheat-legend"><b>'+active+' aktif gün</b><span>· '+prayers+' vakit · '+zikr+' zikir</span></div>';
  var summary='<span class="tchip fl">'+year+'</span><span class="tchip">'+active+' gün</span><span class="tchip">'+prayers+' vakit</span>';
  return cardWrap({key:'faith-year-'+year,icon:icon('calendar',18),title:'Yıllık İbadet Isısı · '+year,span:12,order:20,summary:summary,details:map});
}
function hijriPanelCardP(){
  var offset=D&&D.settings&&D.settings.prayer?Number(D.settings.prayer.hijriOffset)||0:0;
  var cal=window.HijriCalendarV1, label=cal&&cal.todayStr?cal.todayStr(today(),offset):'Hicri tarih bekleniyor';
  var holy=cal&&cal.holyDay?cal.holyDay(today(),offset):'';
  var summary='<span class="tchip fl">'+esc(label)+'</span>'+(holy?'<span class="tchip" style="color:var(--kandil);">'+esc(holy)+'</span>':'');
  var details='<div style="font-size:var(--f3);line-height:1.55;color:var(--t2);">Uygulamadaki Hicri tarih ayarı panelde de aynı görünür.'+(offset?' Kullanıcı farkı: <b>'+(offset>0?'+':'')+offset+' gün</b>.':' Varsayılan hilal farkı kullanılıyor.')+'</div>';
  return cardWrap({key:'hijri-today',icon:'🌙',title:'Hicri Takvim',span:6,order:20,summary:summary,details:details});
}

// ── Kur’an Yolculuğu — panel aynası ve operasyon ekranı (QY-15) ───────────
// D.quranJourney zaten app.js'in hesapladığı durumu taşır (latest.json ile
// gelir) — KPI'lar, sûre/istek durumu ve "gelen video kimliği" doğrudan
// oradan okunur, ekstra çekim gerekmez. Yalnız otomasyon hata nedeni
// (quran-delivery.json'daki kısa `error` alanı) latest.json'da YOKTUR; bu
// yüzden panel onu salt-okunur ayrıca çeker (loadDeliveryP, load() içinde).
// Yazma yalnız iki dosyaya gider — quran-request-outbox.json (tekrar
// bildirim) ve quran-responses.json (manuel video ekle/kaldır) — ikisi de
// ortak QuranTransportV1 doğrulayıcısından (extractSingleVideoId,
// upsertOutboxRequest, applyResponse) geçer; latest.json/gunluk asla
// dokunulmaz (T.isWritableTransportPath tek kapıdır, sync.js'teki QY-08/QY-11
// disiplini burada da aynen uygulanır). replyToken/ghToken hiçbir zaman
// DOM'a yazılmaz — outbox kaydı yeniden kuyruklanırken bile içeriği
// olduğu gibi (parse edilmiş haliyle) taşınır, ekrana asla basılmaz.
var QDELIVERY=null, QRESPONSES=null, QTRANSPORT={delivery:'idle',responses:'idle',errors:[]};
var QURAN_BUCKET_P={
  idle:'unrequested',
  submitting:'waiting',queued:'waiting',notified:'waiting',awaiting_reply:'waiting',validating_reply:'waiting',
  request_error:'waiting',notification_error:'waiting',invalid_reply:'waiting',video_unavailable:'waiting',
  ready:'ready',watching:'ready',
  watched:'watched',question_opened:'watched'
};
// App.js'teki QURAN_ROW_STATES ile bilerek birebir aynı Türkçe etiketler —
// panel app.js'i import etmez (mimari kısıt), bu yüzden küçük eşleme
// tabloları burada yerel olarak yeniden tanımlanır (diğer *_P yardımcıları
// gibi), ama kullanıcıya görünen dil iki yüzeyde de tutarlı kalır.
var QURAN_ROW_P={
  submitting:{tone:'wait',label:'İletiliyor'},
  queued:{tone:'wait',label:'İstek kaydedildi'},
  notified:{tone:'wait',label:'Raşit’e haber verildi'},
  awaiting_reply:{tone:'wait',label:'Cevap bekleniyor'},
  validating_reply:{tone:'wait',label:'Cevap doğrulanıyor'},
  ready:{tone:'ready',label:'Anlatım hazır'},
  watching:{tone:'ready',label:'İzleniyor'},
  watched:{tone:'done',label:'İzlendi'},
  question_opened:{tone:'done',label:'Soru açıldı'},
  request_error:{tone:'warn',label:'İletilemedi'},
  notification_error:{tone:'warn',label:'Bildirilemedi'},
  invalid_reply:{tone:'warn',label:'Bağlantı doğrulanamadı'},
  video_unavailable:{tone:'warn',label:'Anlatım erişilemiyor'}
};
function quranBadgeClassP(tone){ return tone==='wait'?'badge status-badge status-pending b-warn':tone==='ready'?'badge status-badge status-ok b-ok':tone==='done'?'badge status-badge status-ok b-ok':tone==='warn'?'badge status-badge status-danger b-danger':'badge status-badge status-muted b-dim'; }
function quranJourneyRootP(){ return (D&&D.quranJourney&&typeof D.quranJourney==='object')?D.quranJourney:null; }
function quranNoteKindP(kind){ return kind==='listen'?'Dinlerken':kind==='reflection'?'Yansıma':'İzlerken'; }
function quranNoteTimeP(sec){ var n=Number(sec); if(!isFinite(n)||n<0) return ''; n=Math.floor(n); return Math.floor(n/60)+':'+String(n%60).padStart(2,'0'); }
function quranNotesP(req){
  return (req&&Array.isArray(req.notes)?req.notes:[]).filter(function(n){ return n&&typeof n==='object'&&String(n.text||'').trim(); }).slice().sort(function(a,b){ return String(b.updatedAt||b.createdAt||'').localeCompare(String(a.updatedAt||a.createdAt||'')); });
}
// qrr_/qr_ + zaman tabanlı gövde: QuranTransportV1'in kimlik regex'ine
// (8-64 alnum/_/-) rahatça uyar; çakışma riski günlük tek-operatör
// kullanımında ihmal edilebilir (aynı kalıp app.js'in requestId üretiminde
// de kabul edilebilir bulunmuştu).
function quranPanelIdP(prefix){ return prefix+Date.now().toString(36)+Math.random().toString(36).slice(2,10); }

// ── transport dosyası okuma/yazma — observer-inbox.json ile AYNI Contents
// API deseni (loadInbox/putInbox), yalnız yol parametrik ──
function ghTransportApiP(path){ var p=REPO.split("/"); return "https://api.github.com/repos/"+encodeURIComponent(p[0])+"/"+encodeURIComponent(p[1])+"/contents/"+path; }
// REM-63 — Panel observer action boundary.
// Panel gözlemcidir; reminder preference / occurrence / snooze / mute /
// delivery / private state için yazma authority'si DEĞİLDİR. Mevcut scoped
// observer writes (ÆON inbox, ÆON media, Quran transport) korunurken bu guard
// her yazma endpoint'inde (putInbox / putAeonMediaP / putTransportFileP)
// reminder-namespace anahtarlarını denylist / schema guard ile engeller ve
// fail-closed durumları (demo, token yok, expired/malformed token, malformed
// action) reddeder. Saf ve test edilebilir: ağ / DOM / localStorage yok.
// Reminder-namespace token'ları panelCoverageManifest.js'teki reminder kök /
// alan sınıflarıyla (preference, occurrence, delivery, category, privateDetail)
// hizalıdır; Quran transport'un meşru alanlarıyla (deliverySentAt, notifiedAt,
// readyAt, videoId, requestId, surahId, notes) ÇAKIŞMAZ.
var REMINDER_WRITE_TOKENS=/reminder|occurrence|quiethours|catchup|snooze|mute|preference|deliverylog|notificationdelivery|reminderdelivery|reminderdeliveries|reminderhistory/;
function panelTokenValidP(tok){
  var s=String(tok||'').trim();
  if(!s||s.length<20) return false;
  if(/[\s\u0000-\u001f]/.test(s)) return false;
  return true;
}
function findReminderKeyP(value){
  if(Array.isArray(value)){
    for(var i=0;i<value.length;i++){ var r=findReminderKeyP(value[i]); if(r) return r; }
    return null;
  }
  if(value&&typeof value==='object'){
    for(var k in value){
      if(Object.prototype.hasOwnProperty.call(value,k)){
        if(REMINDER_WRITE_TOKENS.test(String(k).toLowerCase())) return k;
        var r2=findReminderKeyP(value[k]); if(r2) return r2;
      }
    }
  }
  return null;
}
function panelWriteGuardP(kind,payload){
  if(DEMO_MODE) return {ok:false,reason:'demo_mode'};
  if(!panelTokenValidP(PTOKEN)) return {ok:false,reason:'no_token'};
  if(payload===null||payload===undefined) return {ok:false,reason:'malformed_action'};
  var hit=findReminderKeyP(payload);
  if(hit) return {ok:false,reason:'reminder_namespace',key:hit};
  return {ok:true};
}
function loadTransportFileP(path){
  var cache=PANEL_TRANSPORT_CACHE[path]||{};
  var H=ghJsonHeaders(); if(cache.etag) H["If-None-Match"]=cache.etag;
  return fetch(ghTransportApiP(path)+"?ref="+encodeURIComponent(BRANCH),{headers:H,cache:"no-store"})
    .then(function(r){
      var etag=responseHeaderP(r,"ETag"), decision=pollConditionalDecisionP(cache,r.status,etag);
      if(decision.kind==='not_modified'){
        if(!cache.raw) throw new Error("transport 304 cache miss");
        return {raw:cache.raw,sha:cache.sha||null,etag:decision.etag,notModified:true};
      }
      if(r.status===404){ PANEL_TRANSPORT_CACHE[path]={etag:etag,raw:null,sha:null}; return {raw:null,sha:null,etag:etag}; }
      if(!r.ok){
        // REM-58: 429 (rate limit) ayrı bir sınıftır; 5xx/network gibi genel
        // "transport <status>" hatasına karışmaz. Gözlemci yalnız okur; bu
        // sınıflandırma yazma yolu açmaz, yalnız hata nedenini dürüstleştirir.
        if(r.status===429){ var rl=new Error("transport rate_limited"); rl.rateLimited=true; throw rl; }
        throw new Error("transport "+r.status);
      }
      return r.json().then(function(g){
        var raw=(g&&typeof g.content==="string"&&g.content)?b64dec(g.content):null, sha=(g&&g.sha)||null;
        // QY-22: Contents API'nin JSON temsili 1 MB ile sinirli; ustundeki
        // dosyalarda 200 doner ama encoding:"none" + content:"" gelir.
        // data/observer-snapshot.json 2.98 MB'a ulasinca panel projeksiyonu
        // tam da bu yuzden "Projection yok" deyip eski latest.json'a
        // dusuyordu. Govde bos ve sha varsa Blobs API'den ham oku (100 MB'a
        // kadar destekler). Yalniz GET; panel hicbir seyi yazmaz.
        if(raw===null && sha){
          var pr=REPO.split("/");
          var blob="https://api.github.com/repos/"+encodeURIComponent(pr[0])+"/"+encodeURIComponent(pr[1])+"/git/blobs/"+encodeURIComponent(sha);
          var H2=ghJsonHeaders(); H2["Accept"]="application/vnd.github.raw";
          return fetch(blob,{headers:H2,cache:"no-store"}).then(function(r2){
            if(!r2.ok) throw new Error("transport blob "+r2.status);
            return r2.text();
          }).then(function(t){
            if(t && t.charAt(0)==="{" && t.indexOf('"encoding"')>=0 && t.indexOf('"content"')>=0){
              try{ var j=JSON.parse(t); if(j && j.encoding==="base64" && typeof j.content==="string") t=b64dec(j.content); }catch(e){}
            }
            PANEL_TRANSPORT_CACHE[path]={etag:etag,raw:t,sha:sha};
            return {raw:t,sha:sha,etag:etag,viaBlob:true};
          });
        }
        PANEL_TRANSPORT_CACHE[path]={etag:etag,raw:raw,sha:sha}; return {raw:raw,sha:sha,etag:etag};
      });
    });
}
function loadSyncReceiptP(){
  return loadTransportFileP(SYNC_RECEIPT_PATH).then(function(x){
    if(!x||!x.raw) return null;
    try{ return normalizeSyncReceiptP(JSON.parse(x.raw)); }catch(e){ return null; }
  }).catch(function(e){
    var m=String(e&&e.message||e).toLowerCase(), code='network';
    if(m.indexOf('401')>=0||m.indexOf('unauthorized')>=0) code='unauthorized';
    else if(m.indexOf('403')>=0||m.indexOf('forbidden')>=0) code='forbidden';
    else if(m.indexOf('404')>=0||m.indexOf('not found')>=0) code='not_found';
    else if(m.indexOf('409')>=0||m.indexOf('422')>=0||m.indexOf('conflict')>=0) code='conflict';
    else if(m.indexOf('429')>=0||m.indexOf('rate')>=0) code='rate_limited';
    return normalizeSyncReceiptP({status:(code==='unauthorized'||code==='forbidden'||code==='not_found')?'permission':'error',lastErrorCode:code});
  });
}
function loadObserverProjectionP(){
  return loadTransportFileP(OBSERVER_PROJECTION_PATH).then(function(x){
    if(!x||!x.raw) return {snapshot:null,sha:null,reason:'projection_missing'};
    var P=window.PanelCoverageV1;
    if(!P||typeof P.parseObserverSnapshot!=='function') return {snapshot:null,sha:x.sha||null,reason:'projection_unavailable'};
    var parsed=P.parseObserverSnapshot(x.raw);
    return parsed&&parsed.ok?{snapshot:parsed.value,sha:x.sha||null,reason:'ready',compatibility:parsed.compatibility||null}:{snapshot:null,sha:x.sha||null,reason:(parsed&&parsed.code)||'projection_invalid',compatibility:parsed&&parsed.compatibility||null};
  }).catch(function(e){
    var m=String(e&&e.message||e).toLowerCase(), code='projection_network';
    if(m.indexOf('401')>=0||m.indexOf('unauthorized')>=0) code='projection_permission';
    else if(m.indexOf('403')>=0||m.indexOf('forbidden')>=0) code='projection_permission';
    else if(m.indexOf('404')>=0||m.indexOf('not found')>=0) code='projection_missing';
    return {snapshot:null,sha:null,reason:code};
  });
}
function eventDayKeysP(root){
  var l=root&&root.eventLog&&typeof root.eventLog==='object'?root.eventLog:{}, keys=[];
  if(l.days&&typeof l.days==='object'&&!Array.isArray(l.days)) Object.keys(l.days).forEach(function(k){if(/^\d{4}-\d{2}-\d{2}$/.test(k)) keys.push(k);});
  if(Array.isArray(l.events)) l.events.forEach(function(e){ if(e&&typeof e.occurredAt==='string'&&/^\d{4}-\d{2}-\d{2}/.test(e.occurredAt)) keys.push(e.occurredAt.slice(0,10)); });
  keys.sort().reverse(); var out=[]; keys.forEach(function(k){if(out.indexOf(k)<0)out.push(k);}); return out.slice(0,120);
}
function buildEventLogStateP(root,files){
  var P=window.PanelCoverageV1, fallback=root&&root.eventLog?root.eventLog:{}, external=[], foundFile=false, hadError=false;
  (Array.isArray(files)?files:[]).forEach(function(x){ if(x&&x.raw){ foundFile=true; var parsed=P&&P.parseEventLog?P.parseEventLog(x.raw,x.date):{events:[]}; external=external.concat(parsed.events||[]); } else if(x&&x.error) hadError=true; });
  var events=external.length?external:(P&&P.parseEventLog?P.parseEventLog(fallback).events:[]);
  if(P&&typeof P.mergeEventLogs==='function') events=P.mergeEventLogs({events:events},{});
  var audit=P&&typeof P.eventSequenceAudit==='function'?P.eventSequenceAudit(events):{ok:true,issueCount:0,issues:[],deviceCount:0};
  return {source:external.length||foundFile?'event_files':(events.length?'latest_fallback':(hadError?'error':'missing')),events:events,audit:audit,loadedAt:new Date().toISOString(),days:eventDayKeysP(root)};
}
function loadEventLogP(root){
  var keys=eventDayKeysP(root), files=[];
  if(!keys.length) return Promise.resolve(buildEventLogStateP(root,files));
  return Promise.all(keys.map(function(day){ return loadTransportFileP(EVENT_LOG_DIR+'/'+day+'.json').then(function(x){ return {date:day,raw:x&&x.raw,sha:x&&x.sha}; }).catch(function(e){ var m=String(e&&e.message||e).toLowerCase(); return {date:day,raw:null,error:!(m.indexOf('404')>=0||m.indexOf('not found')>=0)}; }); })).then(function(rows){ return buildEventLogStateP(root,rows); });
}
function putTransportFileP(path,value,sha){
  var T=window.QuranTransportV1;
  if(!T||!T.isWritableTransportPath(path)) return Promise.reject(new Error("geçersiz transport yolu"));
  // REM-63: reminder-namespace payload'ı transport yazma yolundan geçemez.
  var g=panelWriteGuardP('transport',value);
  if(!g.ok) return Promise.reject(new Error("panel write engellendi: "+g.reason));
  var body={message:"panel: "+path.split("/").pop(),content:b64enc(JSON.stringify(value,null,2)),branch:BRANCH};
  if(sha) body.sha=sha;
  var H=ghJsonHeaders(); H["Content-Type"]="application/json";
  return fetch(ghTransportApiP(path),{method:"PUT",headers:H,body:JSON.stringify(body)})
    .then(function(r){ if(!r.ok) return r.text().then(function(t){ var e=new Error(r.status+" "+t.slice(0,160)); e.status=r.status; throw e; }); return r.json(); });
}
// Salt-okunur — yalnız otomasyon hata nedenini göstermek için. Okunamazsa
// (yetkisiz/ağ) sessizce atlanır: KPI ve istek listesi D.quranJourney'den
// geldiği için bu, panelin geri kalanını hiç etkilemez.
function loadDeliveryP(){
  var T=window.QuranTransportV1; if(!T) return Promise.resolve();
  QTRANSPORT.delivery='checking';
  return loadTransportFileP(T.PATHS.delivery).then(function(cur){
    var parsed=T.parseDelivery(cur.raw); QDELIVERY=parsed.value;
    QTRANSPORT.delivery=parsed.errors.length?'error':'ready';
    if(parsed.errors.length) QTRANSPORT.errors=QTRANSPORT.errors.concat(parsed.errors.map(function(e){return 'delivery:'+e;}));
  }).catch(function(e){ QTRANSPORT.delivery='error'; QTRANSPORT.errors.push('delivery:network'); });
}
function loadResponsesP(){
  var T=window.QuranTransportV1; if(!T) return Promise.resolve();
  QTRANSPORT.responses='checking';
  return loadTransportFileP(T.PATHS.responses).then(function(cur){
    var parsed=T.parseResponses(cur.raw); QRESPONSES=parsed.value;
    QTRANSPORT.responses=parsed.errors.length?'error':'ready';
    if(parsed.errors.length) QTRANSPORT.errors=QTRANSPORT.errors.concat(parsed.errors.map(function(e){return 'responses:'+e;}));
  }).catch(function(e){ QTRANSPORT.responses='error'; QTRANSPORT.errors.push('responses:network'); });
}
function quranDeliveryErrorsP(){
  var q=quranJourneyRootP(); if(!q) return [];
  var reqs=q.requests||{}, dl=(QDELIVERY&&QDELIVERY.requests)||{}, out=[];
  Object.keys(reqs).forEach(function(sid){
    var req=reqs[sid]; if(!req||!req.requestId) return;
    var rec=dl[req.requestId];
    if(rec&&rec.status==='failed') out.push({surahId:sid,error:rec.error||'bilinmeyen hata'});
  });
  return out;
}
function quranTransportNoticeP(){
  var q=quranJourneyRootP(), rs=QRESPONSES&&QRESPONSES.responses||{}, pending=[];
  if(q&&q.requests) Object.keys(q.requests).forEach(function(sid){
    var req=q.requests[sid], remote=req&&req.requestId?rs[req.requestId]:null;
    if(remote&&remote.status==='ready'&&req.status!=='ready'&&req.status!=='watching'&&req.status!=='watched'&&req.status!=='question_opened') pending.push(req.requestId);
  });
  if(QTRANSPORT.errors.length) return 'Transport kaynağı doğrulanamadı; son kanonik uygulama korunuyor.';
  if(pending.length) return 'Uzak cevap hazır; kullanıcı uygulamasının pull/save adımı bekleniyor ('+pending.length+' istek).';
  return '';
}

// ── tekrar bildirim: aynı outbox kaydını değiştirmeden yeniden PUT'lar —
// dosya-seviyeli updatedAt değişir, QY-09 workflow'unun `push` tetikleyicisi
// yeniden ateşlenir; quran_mail.py idempotent olduğu için (aynı requestId
// zaten 'sent'se ikinci kez maillemez) çift postalama riski yoktur ──
window.quranRetryNotifyP=function(surahId){
  if(DEMO_MODE){ alert("Demo modu: yazma kapalı."); return; }
  if(UI.quranBusyId) return;
  var T=window.QuranTransportV1, q=quranJourneyRootP();
  var req=q&&q.requests?q.requests[surahId]:null;
  if(!T||!req||!req.requestId){ alert("Bu sûre için açık istek yok."); return; }
  UI.quranBusyId=surahId; render();
  function attempt(n){
    loadTransportFileP(T.PATHS.outbox).then(function(cur){
      var parsed=T.parseOutbox(cur.raw), entry=parsed.value.requests[req.requestId];
      if(!entry) throw new Error("outbox kaydı bulunamadı (postalanmış olabilir)");
      var res=T.upsertOutboxRequest(parsed.value,entry,new Date().toISOString());
      if(!res.ok) throw new Error("geçersiz outbox kaydı: "+(res.errors||[]).join(","));
      return putTransportFileP(T.PATHS.outbox,res.value,cur.sha);
    }).then(function(){
      UI.quranBusyId=""; render(); alert("Bildirim yeniden kuyruklandı.");
    }).catch(function(e){
      if(e&&(e.status===409||e.status===422)&&n<3) return attempt(n+1);
      UI.quranBusyId=""; render(); alert("Kuyruklanamadı: "+safePanelErrorTextP(e));
    });
  }
  attempt(1);
};

// ── manuel video ekle/kaldır — güvenli yedek yol. Doğrulama TAMAMEN ortak
// QuranTransportV1'den gelir (extractSingleVideoId/applyResponse); panel
// kendi gevşek bir kural icat etmez (plan §12 şartı) ──
window.quranManualAddP=function(surahId){
  if(DEMO_MODE){ alert("Demo modu: yazma kapalı."); return; }
  if(UI.quranBusyId) return;
  var T=window.QuranTransportV1, q=quranJourneyRootP();
  var req=q&&q.requests?q.requests[surahId]:null;
  if(!T||!req||!req.requestId){ alert("Bu sûre için açık istek yok."); return; }
  var el=document.getElementById('qm-url-'+surahId), raw=el?el.value.trim():"";
  var ext=T.extractSingleVideoId(raw);
  if(!ext.ok){ alert(ext.reason==='multiple_videos'?"Metinde birden fazla video bağlantısı var; tek bağlantı gerekli.":"Geçerli bir YouTube bağlantısı bulunamadı."); return; }
  UI.quranBusyId=surahId; render();
  var at=new Date().toISOString();
  var resp={responseId:quranPanelIdP('qrr_'),requestId:req.requestId,surahId:surahId,videoId:ext.videoId,source:'panel_manual',receivedAt:at,validatedAt:at,senderFingerprint:null,status:'ready'};
  function attempt(n){
    loadTransportFileP(T.PATHS.responses).then(function(cur){
      var parsed=T.parseResponses(cur.raw);
      var res=T.applyResponse(parsed.value,resp,at);
      if(!res.ok) throw new Error("geçersiz yanıt: "+(res.errors||[]).join(","));
      return putTransportFileP(T.PATHS.responses,res.value,cur.sha);
    }).then(function(){
      UI.quranBusyId=""; render(); alert("Video kaydedildi. Uygulama bir sonraki güncellemede görecek.");
    }).catch(function(e){
      if(e&&(e.status===409||e.status===422)&&n<3) return attempt(n+1);
      UI.quranBusyId=""; render(); alert("Kaydedilemedi: "+safePanelErrorTextP(e));
    });
  }
  attempt(1);
};
window.quranManualRevokeP=function(surahId){
  if(DEMO_MODE){ alert("Demo modu: yazma kapalı."); return; }
  if(UI.quranBusyId) return;
  var T=window.QuranTransportV1, q=quranJourneyRootP();
  var req=q&&q.requests?q.requests[surahId]:null;
  if(!T||!req||!req.requestId) return;
  if(!confirm("Bu sûre için geçerli videoyu geri çek? Raşit’ten yeni bağlantı beklenecek.")) return;
  UI.quranBusyId=surahId; render();
  var at=new Date().toISOString();
  function attempt(n){
    loadTransportFileP(T.PATHS.responses).then(function(cur){
      var parsed=T.parseResponses(cur.raw);
      var prev=parsed.value.responses[req.requestId];
      var videoId=req.videoId||(prev&&prev.videoId);
      if(!videoId) throw new Error("geri çekilecek video kimliği yok");
      var resp={responseId:quranPanelIdP('qrr_'),requestId:req.requestId,surahId:surahId,videoId:videoId,source:'panel_manual',receivedAt:at,validatedAt:at,senderFingerprint:null,status:'revoked'};
      var res=T.applyResponse(parsed.value,resp,at);
      if(!res.ok) throw new Error("geçersiz yanıt: "+(res.errors||[]).join(","));
      return putTransportFileP(T.PATHS.responses,res.value,cur.sha);
    }).then(function(){
      UI.quranBusyId=""; render(); alert("Video geri çekildi.");
    }).catch(function(e){
      if(e&&(e.status===409||e.status===422)&&n<3) return attempt(n+1);
      UI.quranBusyId=""; render(); alert("Geri çekilemedi: "+safePanelErrorTextP(e));
    });
  }
  attempt(1);
};

function quranJourneyDataP(){
  var T=window.QuranTransportV1, cat=window.QuranRevelationOrderV1, q=quranJourneyRootP();
  if(!T||!cat||!Array.isArray(cat.surahs)||!cat.surahs.length) return {ok:false};
  var reqs=(q&&q.requests&&typeof q.requests==='object')?q.requests:{};
  var surahs=cat.surahs, total=surahs.length;
  var stats={unrequested:0,waiting:0,ready:0,watched:0}, rows=[], deliveredRows=[], noteTotal=0, lastActivity=null;
  surahs.forEach(function(x){
    var req=reqs[x.id]||null, status=(req&&req.status)||'idle', bucket=QURAN_BUCKET_P[status]||'unrequested';
    stats[bucket]++;
    var notes=quranNotesP(req); noteTotal+=notes.length;
    if(req&&/^[A-Za-z0-9_-]{11}$/.test(String(req.videoId||''))) deliveredRows.push({x:x,req:req,status:status,notes:notes});
    if(bucket!=='unrequested'){
      rows.push({x:x,req:req,status:status});
      var u=req&&req.updatedAt; if(u&&(!lastActivity||u>lastActivity)) lastActivity=u;
    }
  });
  rows.sort(function(a,b){ return String((b.req&&b.req.updatedAt)||'').localeCompare(String((a.req&&a.req.updatedAt)||'')); });
  return {ok:true,cat:cat,total:total,stats:stats,rows:rows,deliveredRows:deliveredRows,noteTotal:noteTotal,lastActivity:lastActivity,errs:quranDeliveryErrorsP()};
}
function quranJourneyPanelCardHTML(){
  var QD=quranJourneyDataP();
  if(!QD.ok){
    return cardWrap({key:'quranJourney',icon:icon('book',18),title:'Kur’an Yolculuğu',span:12,order:23,
      summary:'<div class="empty"><span class="ei">'+icon('book',20)+'</span>Kütüphane modülü yüklenemedi</div>'});
  }
  var cat=QD.cat, total=QD.total, stats=QD.stats, rows=QD.rows, deliveredRows=QD.deliveredRows, noteTotal=QD.noteTotal, lastActivity=QD.lastActivity;

  var sum='<div class="dstats" style="grid-template-columns:repeat(4,1fr);margin-bottom:0;">';
  sum+='<div class="dstat"><div class="dv">'+rows.length+'</div><div class="dl">istendi</div></div>';
  sum+='<div class="dstat"><div class="dv" style="color:var(--amber);">'+stats.waiting+'</div><div class="dl">bekliyor</div></div>';
  sum+='<div class="dstat"><div class="dv" style="color:var(--quranp2);">'+stats.ready+'</div><div class="dl">hazır</div></div>';
  sum+='<div class="dstat"><div class="dv" style="color:var(--green);">'+stats.watched+'</div><div class="dl">izlendi</div></div>';
  sum+='</div>';
  sum+='<div style="font-size:var(--f1);color:var(--t3);margin-top:8px;text-align:right;font-weight:700;">'+total+' sûre · '+deliveredRows.length+' kullanıcıya gönderilen video · '+noteTotal+' not · son etkinlik '+(lastActivity?esc(timeAgo(lastActivity)):'—')+'</div>';

  var det='';
  var transportNotice=quranTransportNoticeP();
  if(transportNotice){
    det+='<div style="background:var(--ra);border:1px solid var(--rb);border-radius:12px;padding:10px 12px;margin-bottom:11px;color:var(--t1);font-size:var(--f2);line-height:1.45;">'+icon('info',14)+' '+esc(transportNotice)+'</div>';
  }
  var errs=QD.errs;
  if(errs.length){
    det+='<div style="background:var(--ra);border:1px solid var(--rb);border-radius:12px;padding:10px 12px;margin-bottom:11px;">';
    det+='<div style="font-size:var(--f3);font-weight:800;color:var(--red);margin-bottom:6px;">Otomasyon hatası · '+errs.length+'</div>';
    errs.forEach(function(e){
      var surah=cat.byId(e.surahId);
      det+='<div style="display:flex;align-items:center;justify-content:space-between;gap:8px;padding:7px 0;border-top:1px solid var(--bd2);">';
      det+='<div style="min-width:0;"><div style="font-size:var(--f3);font-weight:700;color:var(--t1);">'+esc(surah?surah.nameTr:e.surahId)+'</div><div style="font-size:var(--f1);color:var(--t4);overflow:hidden;text-overflow:ellipsis;white-space:nowrap;">'+esc(e.error)+'</div></div>';
      det+='<button class="btn" style="font-size:var(--f1);padding:6px 9px;flex:none;" '+(UI.quranBusyId===e.surahId?'disabled':'')+' onclick="quranRetryNotifyP(\''+esc(e.surahId)+'\')">'+(UI.quranBusyId===e.surahId?'…':'Tekrar dene')+'</button>';
      det+='</div>';
    });
    det+='</div>';
  }

  det+='<div style="font-size:var(--f3);font-weight:800;color:var(--t2);margin:14px 0 8px;display:flex;align-items:center;gap:7px;">'+icon('play',14)+' Kullanıcıya gönderilen videolar'+(deliveredRows.length?' · '+deliveredRows.length:'')+'</div>';
  if(!deliveredRows.length){
    det+='<div class="empty"><span class="ei">'+icon('play',20)+'</span>Henüz kullanıcıya gönderilmiş video yok</div>';
  } else {
    det+='<div style="display:flex;flex-direction:column;gap:8px;">';
    deliveredRows.forEach(function(r){
      var rs=QURAN_ROW_P[r.status]||{tone:'idle',label:r.status}, last=r.notes[0];
      det+='<div style="background:linear-gradient(135deg,var(--quranp-bg),var(--s2));border:1px solid rgba(91,135,196,.28);border-radius:12px;padding:11px 12px;">';
      det+='<div style="display:flex;align-items:flex-start;gap:8px;"><div style="flex:1;min-width:0;"><div style="font-size:var(--f3);font-weight:800;color:var(--t1);">'+esc(r.x.nameAr)+' · '+esc(r.x.nameTr)+'</div><div style="font-size:var(--f1);color:var(--t4);">'+r.x.revelationOrder+'. durak · '+esc(r.req.videoId)+'</div></div><span class="'+quranBadgeClassP(rs.tone)+'" data-component="status-badge">'+esc(rs.label)+'</span></div>';
      det+='<div style="display:flex;flex-wrap:wrap;gap:5px 10px;margin-top:8px;font-size:var(--f1);color:var(--t3);">';
      det+='<span>İstek: <code>'+esc(r.req.requestId||'—')+'</code></span><span>Yanıt: <code>'+esc(r.req.responseId||'—')+'</code></span><span>Teslim: '+esc(tsShort(r.req.deliverySentAt||r.req.notifiedAt)||'—')+'</span><span>Hazır: '+esc(tsShort(r.req.readyAt)||'—')+'</span><span>İzleme: '+esc(tsShort(r.req.startedWatchingAt)||'—')+'</span><span>Tamam: '+esc(tsShort(r.req.watchedAt)||'—')+'</span><span style="color:var(--quranp2);font-weight:800;">'+r.notes.length+' not</span></div>';
      if(r.req.responseSource||r.req.responseReceivedAt||r.req.responseValidatedAt){
        det+='<div style="display:flex;flex-wrap:wrap;gap:5px 10px;margin-top:5px;font-size:var(--f1);color:var(--t3);"><span>Provenance: '+esc(r.req.responseSource||'isimsiz kaynak')+'</span><span>Alındı: '+esc(tsShort(r.req.responseReceivedAt)||'—')+'</span><span>Doğrulandı: '+esc(tsShort(r.req.responseValidatedAt)||'—')+'</span></div>';
      }
      det+='<div style="margin-top:8px;display:flex;align-items:center;gap:8px;flex-wrap:wrap;"><a href="https://www.youtube-nocookie.com/embed/'+encodeURIComponent(r.req.videoId)+'" target="_blank" rel="noopener noreferrer" style="font-size:var(--f2);color:var(--quranp2);font-weight:800;text-decoration:none;">'+icon('external-link',12)+' Videoyu aç</a>'+(last?'<span style="font-size:var(--f1);color:var(--t3);">Son not: '+esc(quranNoteKindP(last.kind))+(last.timestampSec!==null&&last.timestampSec!==undefined?' · '+esc(quranNoteTimeP(last.timestampSec)):'')+'</span>':'<span style="font-size:var(--f1);color:var(--t4);">Not bekleniyor</span>')+'</div>';
      if(r.notes.length){
        det+='<div style="margin-top:8px;border-top:1px solid var(--bd2);padding-top:7px;display:flex;flex-direction:column;gap:5px;">';
        r.notes.slice(0,5).forEach(function(n){ var oldVideo=n.videoId&&n.videoId!==r.req.videoId; det+='<div style="font-size:var(--f2);line-height:1.45;color:var(--t2);"><b style="color:var(--quranp2);">'+esc(quranNoteKindP(n.kind))+(n.timestampSec!==null&&n.timestampSec!==undefined?' · '+esc(quranNoteTimeP(n.timestampSec)):'')+(n.updatedAt?' · '+esc(tsShort(n.updatedAt)):'')+(oldVideo?' · eski anlatım':'')+'</b> '+esc(n.text)+(n.tag?' <span style="color:var(--t4);">#'+esc(n.tag)+'</span>':'')+'</div>'; });
        if(r.notes.length>5) det+='<div style="font-size:var(--f1);color:var(--t4);">+'+(r.notes.length-5)+' eski not daha</div>';
        det+='</div>';
      }
      det+='</div>';
    });
    det+='</div>';
  }
  det+='<div style="font-size:var(--f3);font-weight:800;color:var(--t2);margin:16px 0 8px;">Açık istekler'+(rows.length?' · '+rows.length:'')+'</div>';
  if(!rows.length){
    det+='<div class="empty"><span class="ei">'+icon('book',20)+'</span>Henüz istek yok</div>';
  } else {
    det+='<div style="display:flex;flex-direction:column;gap:8px;">';
    rows.forEach(function(r){
      var rs=QURAN_ROW_P[r.status]||{tone:'idle',label:r.status};
      det+='<div style="background:var(--s2);border:1px solid var(--bd);border-radius:12px;padding:10px 11px;">';
      det+='<div style="display:flex;align-items:center;gap:8px;">';
      det+='<div style="flex:1;min-width:0;"><div style="font-size:var(--f3);font-weight:800;color:var(--t1);overflow:hidden;text-overflow:ellipsis;white-space:nowrap;">'+esc(r.x.nameAr)+' · '+esc(r.x.nameTr)+'</div><div style="font-size:var(--f1);color:var(--t4);">'+r.x.revelationOrder+'. durak</div></div>';
      det+='<span class="'+quranBadgeClassP(rs.tone)+'" data-component="status-badge">'+esc(rs.label)+'</span>';
      det+='</div>';
      if(r.req&&r.req.videoId){
        var vurl='https://www.youtube-nocookie.com/embed/'+encodeURIComponent(r.req.videoId);
        det+='<div style="margin-top:9px;display:flex;align-items:center;gap:8px;flex-wrap:wrap;">';
        det+='<a href="'+esc(vurl)+'" target="_blank" rel="noopener noreferrer" style="display:inline-flex;align-items:center;gap:5px;font-size:var(--f2);color:var(--quranp2);font-weight:700;text-decoration:none;">'+icon('play',12)+' Güvenli bağlantı</a>';
        det+='<span class="mono" style="font-size:var(--f1);color:var(--t4);">'+esc(r.req.videoId)+'</span>';
        det+='<button class="btn" style="font-size:var(--f1);padding:5px 8px;margin-left:auto;" '+(UI.quranBusyId===r.x.id?'disabled':'')+' onclick="quranManualRevokeP(\''+esc(r.x.id)+'\')">Yanlış video · kaldır</button>';
        det+='</div>';
      } else {
        det+='<div style="margin-top:9px;display:flex;gap:6px;">';
        det+='<input id="qm-url-'+esc(r.x.id)+'" type="text" placeholder="YouTube bağlantısı yapıştır (manuel yedek)" style="flex:1;font-size:var(--f2);padding:7px 9px;">';
        det+='<button class="btn" style="font-size:var(--f1);padding:7px 10px;flex:none;" '+(UI.quranBusyId===r.x.id?'disabled':'')+' onclick="quranManualAddP(\''+esc(r.x.id)+'\')">Ekle</button>';
        det+='</div>';
      }
      det+='</div>';
    });
    det+='</div>';
  }
  det+='<div style="font-size:var(--f1);color:var(--t4);margin-top:10px;line-height:1.4;">Panel onayı yayın için şart değil; yalnız gözlem ve gerektiğinde geri alma yüzeyi. Manuel işlemler ortak doğrulayıcıdan geçer; secret/token burada hiç görünmez.</div>';

  return cardWrap({key:'quranJourney',icon:icon('book',18),title:'Kur’an Yolculuğu',span:12,order:23,summary:sum,details:det});
}

// ── Zihin-Beden Beslenmesi (kurs & pratik) — panel aynası ──
var SOUL_ACTIVITY_CATALOG_P=[
  {id:"pilates",label:"Pilates",icon:"flower-2",color:"#7EB5A6",sci:"Kortikospinal plastisite, propriyosepsiyon, lumbopelvik stabilite"},
  {id:"ney",    label:"Ney",    icon:"wind",    color:"#C9A86C",sci:"Nefes regülasyonu, HRV artışı, parasempatik aktivasyon"},
  {id:"riding", label:"Binicilik",icon:"heart-handshake",color:"#B89BCA",sci:"Hippoterapi, vestibüler uyarım, duygusal düzenleme, postüral kontrol"}
];
function soulActivityByIdP(id){ for(var i=0;i<SOUL_ACTIVITY_CATALOG_P.length;i++){ if(SOUL_ACTIVITY_CATALOG_P[i].id===id) return SOUL_ACTIVITY_CATALOG_P[i]; } return null; }
function soulActivityMinutesP(rec){ if(!rec||!Array.isArray(rec.soulActivities)) return 0; var t=0; rec.soulActivities.forEach(function(a){ var m=Number(a&&a.duration); if(!isNaN(m)&&m>0) t+=m; }); return t; }
function soulActivityCountsRangeP(start,end){
  var counts={pilates:0,ney:0,riding:0}, mins={pilates:0,ney:0,riding:0}, totalMins=0, totalCount=0;
  if(!D||!D.days) return {counts:counts,mins:mins,totalMins:totalMins,totalCount:totalCount};
  var s=start||addDays(today(),-6), e=end||today();
  if(s>e){ var tmp=s; s=e; e=tmp; }
  for(var d=s; diff(e,d)>=0; d=addDays(d,1)){
    var rec=D.days[d]; if(!rec||!Array.isArray(rec.soulActivities)) continue;
    rec.soulActivities.forEach(function(a){ if(!a||!a.type) return; counts[a.type]=(counts[a.type]||0)+1; var m=Number(a.duration); if(!isNaN(m)&&m>0){ mins[a.type]=(mins[a.type]||0)+m; totalMins+=m; } totalCount++; });
  }
  return {counts:counts,mins:mins,totalMins:totalMins,totalCount:totalCount};
}
function fmtDurationP(min){ if(!min||isNaN(min)||min<=0) return ''; if(min<60) return min+' dk'; var h=Math.floor(min/60), r=min%60; return h+' sa'+(r?' '+r+' dk':''); }

// ── Zihin-Beden Arşivi (panel aynası) ────────────────────────
function emptySoulArchiveP(){ return {items:[]}; }
function ensureSoulArchiveP(){ if(!D) return; if(!D.soulArchive) D.soulArchive=emptySoulArchiveP(); if(!Array.isArray(D.soulArchive.items)) D.soulArchive.items=[]; }
function normSoulItemP(it){ if(!it) return null; return { id:String(it.id||('sa_'+it.type+'_'+uid())), type:String(it.type||''), label:String(it.label||''), icon:String(it.icon||''), sci:String(it.sci||''), totalSessions:Number(it.totalSessions)||0, totalMinutes:Number(it.totalMinutes)||0, startedAt:it.startedAt||'', lastAt:it.lastAt||'', status:it.status==='paused'?'paused':'active', note:String(it.note||'') }; }
function findSoulItemP(type){ if(!D||!D.soulArchive||!Array.isArray(D.soulArchive.items)) return null; for(var i=0;i<D.soulArchive.items.length;i++){ if(D.soulArchive.items[i].type===type) return D.soulArchive.items[i]; } return null; }
function syncEntryToSoulArchiveP(entry){
  if(!entry||!entry.type) return;
  ensureSoulArchiveP();
  var cat=soulActivityByIdP(entry.type);
  var existing=findSoulItemP(entry.type);
  var minutes=Math.max(0,Number(entry.duration)||0);
  var ts=entry.savedAt||new Date().toISOString();
  if(existing){
    existing.totalSessions=(existing.totalSessions||0)+1;
    existing.totalMinutes=(existing.totalMinutes||0)+minutes;
    if(!existing.startedAt||ts<existing.startedAt) existing.startedAt=ts;
    if(!existing.lastAt||ts>existing.lastAt) existing.lastAt=ts;
  } else {
    D.soulArchive.items.push(normSoulItemP({ id:'sa_'+entry.type+'_'+uid(), type:entry.type, label:cat?cat.label:entry.type, icon:cat?cat.icon:'', sci:cat?cat.sci:'', totalSessions:1, totalMinutes:minutes, startedAt:ts, lastAt:ts, status:'active', note:'' }));
  }
}
function unsyncSoulEntryP(entry){
  if(!entry||!entry.type) return;
  ensureSoulArchiveP();
  var it=findSoulItemP(entry.type); if(!it) return;
  it.totalSessions=Math.max(0,(it.totalSessions||0)-1);
  it.totalMinutes=Math.max(0,(it.totalMinutes||0)-Math.max(0,Number(entry.duration)||0));
}
function backfillSoulArchiveFromDaysP(){
  if(!D||!D.days) return;
  ensureSoulArchiveP();
  var temp=[];
  Object.keys(D.days).sort().forEach(function(date){
    var rec=D.days[date]; if(!rec||!Array.isArray(rec.soulActivities)) return;
    rec.soulActivities.forEach(function(a){ if(a) temp.push({entry:a}); });
  });
  temp.forEach(function(o){ syncEntryToSoulArchiveP(o.entry); });
}
function allSoulArchiveSessionsP(){
  if(!D||!D.days) return [];
  var list=[];
  Object.keys(D.days).sort().reverse().forEach(function(date){
    var rec=D.days[date]; if(!rec||!Array.isArray(rec.soulActivities)) return;
    rec.soulActivities.forEach(function(a){ if(!a||!a.type) return; list.push({date:date,type:a.type,duration:a.duration,note:a.note,savedAt:a.savedAt}); });
  });
  return list;
}
function toggleSoulArchiveP(){ UI.soulArchiveExpanded=!UI.soulArchiveExpanded; if(!UI.soulArchiveExpanded) UI.soulArchiveType=null; render(); }
function setSoulArchiveTypeP(type){ UI.soulArchiveType=type; if(!UI.soulArchiveExpanded) UI.soulArchiveExpanded=true; render(); }
window.toggleSoulArchiveP=toggleSoulArchiveP; window.setSoulArchiveTypeP=setSoulArchiveTypeP;

function journalModeLabel(mode){
  var map={free:'Serbest Akış',affect:'Duygu Adlandırma',gratitude:'3 Güzel Şey',win:'Günün Kazanımı',selfCompassion:'Öz-Şefkat',reappraisal:'Yeniden Değerleme',values:'Değer Bağlantısı',urgeSurf:'Dürtü Dalga Geçişi'};
  return map[mode]||'Günlük Işığı';
}
function hasJournalEntry(r){ return !!(r&&((r.note&&String(r.note).trim())||(r.journal&&r.journal.text&&String(r.journal.text).trim()))); }
function journalStreak(){
  if(!D||!D.startDate) return 0;
  var c=0,d=today();
  while(diff(D.startDate,d)>=0){ if(hasJournalEntry(recOf(d))){ c++; d=addDays(d,-1);} else break; }
  return c;
}
function lastJournalDate(){
  var days=allDays().slice().reverse();
  for(var i=0;i<days.length;i++){ if(hasJournalEntry(recOf(days[i]))) return days[i]; }
  return null;
}
function totalJournalWords(){
  if(!D||!D.days) return 0;
  var n=0;
  Object.keys(D.days).forEach(function(d){ var r=D.days[d]; if(r&&r.journal&&typeof r.journal.wordCount==='number') n+=r.journal.wordCount; else if(r&&r.journal&&r.journal.text) n+=String(r.journal.text).trim().split(/\s+/).filter(Boolean).length; });
  return n;
}
function journalDaysThisMonth(){
  if(!D||!D.days) return 0;
  var mk=monthKey(today());
  return Object.keys(D.days).filter(function(d){ return monthKey(d)===mk && hasJournalEntry(D.days[d]); }).length;
}
function journalActivePhaseP(){
  var mp=D&&D.motivationProgramV2;
  if(!mp) return null;
  var active=mp.active;
  if(active&&active.phaseCode) return active;
  if(mp.history&&mp.history.length) return mp.history[mp.history.length-1];
  return null;
}
function isLutealDayP(date){ return cyclePhaseForDate(date)==='luteal'; }
function htOn(date){ var n=0; for(var i=0;i<HABITS.length;i++){ var s=HABITS[i][2]; if(!s||(date&&date>=s)) n++; } return n; }
function cnt(rec){ return rec&&rec.habits?HABITS.reduce(function(a,h){return a+(rec.habits[h[0]]?1:0);},0):0; }
var MOOD_ICON={"cok-iyi":"sun","iyi":"flower-2","normal":"leaf","zorlandim":"cloud-rain","cok-zorlandim":"droplets"};
var MOOD_LABEL={"cok-iyi":"Çok iyi","iyi":"İyi","normal":"Normal","zorlandim":"Zorlandım","cok-zorlandim":"Çok zorlandım"};
function moodIcon(id,size){ return MOOD_ICON[id]?icon(MOOD_ICON[id],size||14):""; }
// ── Veri-güdümlü tikler (app ile aynı eşikler) — gözlemci ilerlemeyi de görsün ──
var WATER_GOAL_P=8, VACATION_WATER_GOAL_P=10, SLEEP_TICK_MIN_P=7.5, STEP_TICK_MIN_P=4500;
function waterGoalCupsP(date){ var d=date||today(); return isVacationDayP(d)?VACATION_WATER_GOAL_P:WATER_GOAL_P; }
var DERIVED_P={water:1,sleepReg:1,walked20:1,journaled:1,sweetManaged:1,foodManaged:1,coffeeManaged:1,mediaFed:1,caffeineOk:1};
var DERIVED_ACCENT_P={water:"#5EA9E6",sleepReg:"#B9A6E6",walked20:"#7DD389",journaled:"#E0A93C",sweetManaged:"#E9899F",foodManaged:"#E0A55E",coffeeManaged:"#C79B6E",mediaFed:"#C77D93",caffeineOk:"#8A5A2B"};
var CAFFEINE_MG_P={turk:60,espresso:60,filter:95,americano:77,cappuccino:63,latte:63,"black-tea":40,"green-tea":25,energy:80};
var CAFFEINE_LABEL_P={turk:"Türk kahvesi",espresso:"Espresso",filter:"Filtre kahve",americano:"Americano",cappuccino:"Cappuccino",latte:"Latte","black-tea":"Siyah çay","green-tea":"Yeşil çay",energy:"Enerji içeceği"};
function hhmmMinP(s){ if(!s||!/^\d{1,2}:\d{2}$/.test(s)) return null; var p=s.split(":"); return Number(p[0])*60+Number(p[1]); }
function caffeineInfoP(rec,date){
  var caf=rec&&rec.caffeine&&typeof rec.caffeine==="object"?rec.caffeine:{};
  var drinks=Array.isArray(caf.drinks)?caf.drinks:[], total=0,last=null,residue=0;
  drinks.forEach(function(d){ var mg=CAFFEINE_MG_P[d&&d.type]||0,q=Math.max(1,Number(d&&d.qty)||1); total+=mg*q; if(d&&d.time&&/^\d{2}:\d{2}$/.test(d.time)&&(!last||d.time>last)) last=d.time; });
  if(!drinks.length&&(Number(caf.cups)||0)>0){ total=(Number(caf.cups)||0)*60; last=caf.last||null; }
  var st=D&&D.settings?D.settings:{}, mode=st.caffeineMode, limit=mode==="pregnant"?200:(mode==="sensitive"?300:400), bed=/^\d{2}:\d{2}$/.test(st.targetBed||"")?st.targetBed:"23:30", bMin=hhmmMinP(bed);
  if(isVacationDayP(date||today())) limit=Math.round(limit*1.25);
  drinks.forEach(function(d){ var t=hhmmMinP(d&&d.time); if(t==null||bMin==null) return; var dt=(bMin-t)/60; if(dt<0)dt+=24; residue+=(CAFFEINE_MG_P[d.type]||0)*Math.max(1,Number(d.qty)||1)*Math.pow(.5,dt/5); });
  var lastMin=hhmmMinP(last), cut=bMin==null||lastMin==null?true:(((bMin-lastMin+1440)%1440)>=360);
  return {drinks:drinks,total:Math.round(total),last:last,residue:Math.round(residue),limit:limit,amountOk:total<=limit,timingOk:cut};
}
function hubEntryCountP(rec){ var n=0; ["reading","watching","listening","learning"].forEach(function(s){ var e=(rec&&rec[s]&&Array.isArray(rec[s].entries))?rec[s].entries:[]; n+=e.length; }); return n; }
function habitProgP(rec,key,date){
  if(key==="water"){ var w=(rec&&typeof rec.water==="number"&&rec.water>0)?rec.water:0; var wg=waterGoalCupsP(date); return {met:w>=wg,cur:w,goal:wg}; }
  if(key==="sleepReg"){ var h=(rec&&rec.sleep&&rec.sleep.hours!=null&&rec.sleep.hours!=="")?Number(rec.sleep.hours):null; if(h!=null&&isNaN(h)) h=null; return {met:(h!=null&&h>=SLEEP_TICK_MIN_P),cur:h,goal:SLEEP_TICK_MIN_P}; }
  if(key==="walked20"){ var s=effStepsP(rec).steps||0; return {met:s>=STEP_TICK_MIN_P,cur:s,goal:STEP_TICK_MIN_P}; }
  if(key==="journaled"){ var nt=(rec&&( (rec.note&&String(rec.note).trim()) || (rec.journal&&rec.journal.text&&String(rec.journal.text).trim()) ))?1:0; return {met:nt>0,cur:nt,goal:1,binary:true}; }
  if(key==="sweetManaged"){ var cd=!!(rec&&rec.craving10MinDone); return {met:cd,cur:cd?1:0,goal:1,binary:true}; }
  if(key==="foodManaged"){ var fd=!!(rec&&rec.foodCravingDone); return {met:fd,cur:fd?1:0,goal:1,binary:true}; }
  if(key==="coffeeManaged"){ var kd=!!(rec&&rec.coffeeCravingDone); return {met:kd,cur:kd?1:0,goal:1,binary:true}; }
  if(key==="mediaFed"){ var hc=hubEntryCountP(rec); return {met:hc>0,cur:hc,goal:1,binary:true}; }
  if(key==="caffeineOk"){ var ci=caffeineInfoP(rec,date); return {met:ci.amountOk&&(ci.drinks.length?ci.timingOk:true),cur:ci.total,goal:ci.limit,has:ci.drinks.length>0,amountOk:ci.amountOk,timingOk:ci.timingOk}; }
  return null;
}
function habitProgLabel(key,p){
  if(key==="water") return p.cur+"/"+p.goal;
  if(key==="sleepReg") return (p.cur==null?"—":String(p.cur).replace(".",",")+" sa");
  if(key==="walked20") return p.cur.toLocaleString("tr-TR")+"/4.500";
  if(key==="journaled") return "not bekliyor";
  if(key==="sweetManaged") return "kriz odası";
  if(key==="foodManaged") return "kriz odası";
  if(key==="coffeeManaged") return "kriz odası";
  if(key==="mediaFed") return "besleme bekliyor";
  if(key==="caffeineOk") return p.amountOk?(p.has?(p.timingOk?"limit + saat temiz":"son içim geç"):"kahve yok"):(p.cur+"/"+p.goal+" mg");
  return "";
}
var SLEEP_Q={good:"Dinç",ok:"Idare",bad:"Yorgun"};
var SLEEP_MED={none:"Hayir",herbal:"Bitkisel/Melatonin",rx:"Receteli"};
var FLOW={spot:"Leke",light:"Hafif",medium:"Orta",heavy:"Yogun"};
var SLEEPQ={good:"Dinç",ok:"İdare",bad:"Yorgun"};
var SYM={kramp:"Kramp",bas:"Bas agrisi",siskinlik:"Siskinlik",yorgun:"Yorgunluk",duygu:"Duygusal",istah:"Istah",sanci:"Sanci",cilt:"Cilt"};
var DZLEVEL=[{label:"Hafif",color:"#F4C152"},{label:"Orta",color:"#F0892F"},{label:"Şiddetli",color:"#E25B6A"}];
function dzCol(n){ return n>=3?"#E25B6A":(n===2?"#F0892F":(n>=1?"#F4C152":"#888")); }
var DZREG={bas:"Baş",boyun:"Boyun","omuz-sol":"Sol omuz","omuz-sag":"Sağ omuz",gogus:"Göğüs",karin:"Karın","kol-sol":"Sol kol","kol-sag":"Sağ kol","el-sol":"Sol el/bilek","el-sag":"Sağ el/bilek",kalca:"Kasık/kalça","diz-sol":"Sol diz","diz-sag":"Sağ diz","bacak-sol":"Sol bacak","bacak-sag":"Sağ bacak","ayak-sol":"Sol ayak","ayak-sag":"Sağ ayak",ense:"Ense","omuz-arka-sol":"Sol omuz (arka)","omuz-arka-sag":"Sağ omuz (arka)","sirt-ust":"Üst sırt",bel:"Bel","kalca-arka":"Kalça","kol-arka-sol":"Sol kol (arka)","kol-arka-sag":"Sağ kol (arka)","bacak-arka-sol":"Sol bacak (arka)","bacak-arka-sag":"Sağ bacak (arka)"};
function dzRegLabel(id){ return DZREG[id]||id; }
// Son 30 günün discomfort.regions verisini tarayıp hangi vücut
// bölgelerinin ne sıklıkla işaretlendiğini özetler — yalnız bölge id'si/
// etiketi ve sayım (meta veri); ham not metni (discomfort.note) hiç
// okunmaz/taşınmaz. days verilmezse üretimde windowDays(30,today())
// kullanılır; testler sabit bir tarih listesi enjekte edebilir.
function discomfortTrendP(days){
  var list=Array.isArray(days)?days:windowDays(30,today());
  var regionCounts={}, totalDaysWithPain=0;
  list.forEach(function(d){
    var r=recOf(d), dz=r&&r.discomfort&&typeof r.discomfort==='object'?r.discomfort:null, regs=dz&&dz.regions&&typeof dz.regions==='object'?dz.regions:null;
    if(!regs) return;
    var keys=Object.keys(regs).filter(function(k){return regs[k]&&regs[k].level>0;});
    if(!keys.length) return;
    totalDaysWithPain++;
    keys.forEach(function(k){ regionCounts[k]=(regionCounts[k]||0)+1; });
  });
  var topRegions=Object.keys(regionCounts).map(function(k){return {id:k,label:dzRegLabel(k),count:regionCounts[k]};}).sort(function(a,b){return b.count-a.count;}).slice(0,3);
  return {regionCounts:regionCounts,totalDaysWithPain:totalDaysWithPain,topRegions:topRegions};
}
// Menstrüel akış emojileri + 4 faz — uygulamadaki app.js tanımlarıyla birebir aynı (panelde salt-gösterim).
var FLOWEMO={spot:icon('droplet',15),light:icon('droplet',15),medium:icon('droplet',15),heavy:icon('droplet',15)};
var CYCPHASES={
  menstrual:{label:"Menstrüel faz",emoji:icon('droplet',18),color:"#E58B9B",note:"Regl günleri. Östrojen ve progesteron düşük; demir açısından zengin beslenme ve nazik hareket iyi gelir."},
  follicular:{label:"Foliküler faz",emoji:icon('sprout',18),color:"#8FBF8A",note:"Östrojen yükselişte. Enerji ve ruh hali genelde toparlanır; antrenmana en açık dönem."},
  ovulation:{label:"Ovülasyon",emoji:icon('star',18),color:"#E8A53C",note:"Yumurtlama civarı, doğurganlık en yüksek. Hafif tek taraflı sancı (mittelschmerz) olabilir."},
  luteal:{label:"Luteal faz",emoji:icon('moon',18),color:"#9B7FC9",note:"Progesteron yükselir; regl öncesi (PMS) belirtileri bu dönemde. Magnezyum ve düzenli uyku destekler."}
};
var MONTH_TR=["Oca","Şub","Mar","Nis","May","Haz","Tem","Ağu","Eyl","Eki","Kas","Ara"];
var DOW_TR=["Paz","Pzt","Sal","Çar","Per","Cum","Cmt"];
function fmtTR(s){ if(!s) return "—"; var p=String(s).split("-"); if(p.length<3) return esc(String(s)); return Number(p[2])+" "+(MONTH_TR[Number(p[1])-1]||""); }
function dowTR(s){ var p=String(s).split("-").map(Number); if(p.length<3) return ""; var d=new Date(p[0],p[1]-1,p[2]); return DOW_TR[d.getDay()]||""; }
function isAnalgesic(name){ if(!name) return false; var s=String(name).toLowerCase(); return ["parol","parasetamol","ibuprofen","ibuprofin","nurofen","brufen","apranax","naproksen","naproxen","aspirin","majezik","flurbiprofen","novalgin","metamizol","voltaren","diklofenak","diclofenac","minoset","gripin","arveles","deksketoprofen","dolorex"].some(function(k){return s.indexOf(k)>=0;}); }
var MEALS=[["breakfast",icon('sunrise',15),"Kahvaltı"],["lunch",icon('sun',15),"Öğle"],["dinner",icon('moon',15),"Akşam"],["snack",icon('cherry',15),"Ara öğün"]];
// Panel'in 5 sabit bölümü — kartların DOM/veri sırası değişmez, yalnızca CSS "order" ile bu sıraya dizilirler (sıfır veri kaybı)
var SECTIONS=[
  {id:"sec-today",ico:icon('target',15),title:"Bugün Özeti",sub:"KPI · mesaj · seçili gün",ord:10},
  {id:"sec-mood",ico:icon('moon',15),title:"Ruh Hali & Enerji",sub:"mod · ısı haritası · tik trendi · döngü",ord:20},
  {id:"sec-move",ico:icon('footprints',15),title:"Hareket & Konum",sub:"canlı konum · kullanım · hareket",ord:30},
  {id:"sec-lab",ico:icon('microscope',15),title:"Vücut & Tahlil",sub:"kilo · boy · BMI · kan/idrar",ord:35},
  {id:"sec-risk",ico:icon('compass',15),title:"İçgörü & Risk",sub:"risk · SOS · notlar",ord:40},
  {id:"sec-arch",ico:icon('archive',15),title:"Arşivler",sub:"kütüphane · izleme · dinleme · alıntı",ord:50}
];

function normalizeToken(v){ return String(v||"").replace(/[^\x20-\x7E]/g,"").trim(); }
function pad(n){ return (n<10?"0":"")+n; }
function fmt(d){ return d.getFullYear()+"-"+pad(d.getMonth()+1)+"-"+pad(d.getDate()); }
function today(){ return fmt(new Date()); }
function addDays(s,n){ var p=s.split("-").map(Number),d=new Date(p[0],p[1]-1,p[2]); d.setDate(d.getDate()+n); return fmt(d); }
function diff(a,b){ var pa=a.split("-").map(Number),pb=b.split("-").map(Number); return Math.round((new Date(pb[0],pb[1]-1,pb[2])-new Date(pa[0],pa[1]-1,pa[2]))/86400000); }
// All panel output is assembled as HTML strings. Keep one context-safe escape
// boundary for text and attributes; callers must not interpolate untrusted
// values around this helper. Quotes are included because several observer
// surfaces use data-* / aria-* / title attributes.
function esc(s){ return String(s==null?"":s).replace(/&/g,"&amp;").replace(/</g,"&lt;").replace(/>/g,"&gt;").replace(/"/g,"&quot;").replace(/'/g,"&#39;").replace(/[\u0000-\u0008\u000B\u000C\u000E-\u001F]/g,""); }
// Inline handlers still exist in this legacy static panel. JSON-encode their
// arguments, then HTML-escape at the attribute boundary. This prevents a
// remote media id / filename from becoming executable JavaScript.
function jsArgP(value){ return JSON.stringify(String(value==null?"":value)).replace(/</g,"\\u003C").replace(/>/g,"\\u003E").replace(/&/g,"\\u0026").replace(/\u2028/g,"\\u2028").replace(/\u2029/g,"\\u2029"); }
function mediaDimensionP(value){ var n=Number(value); return isFinite(n)&&n>0&&n<=10000?String(n):"1"; }
// Network / transport errors are untrusted input. Render only stable,
// allowlisted categories; never expose response bodies, tokens, filenames or
// private user text in alerts or the fail screen.
function safePanelErrorTextP(error,fallback){
  var m=String(error&&error.message||error||'').toLowerCase();
  if(/401|unauthorized|gecersiz|yetkisiz|forbidden|403/.test(m)) return 'Yetki doğrulanamadı.';
  if(/404|not found|bulunamad/.test(m)) return 'Kaynak bulunamadı.';
  if(/409|422|conflict|anti.?clobber/.test(m)) return 'Çakışma nedeniyle işlem durduruldu.';
  if(/429|rate.?limit/.test(m)) return 'Sunucu sınırı nedeniyle sonra yeniden denenecek.';
  if(/reminder_namespace|malformed_action/.test(m)) return 'Bu gözlemci yüzeyinde işlem desteklenmiyor.';
  if(/offline|network|fetch|timeout|econn|failed|sunucu|transport/.test(m)) return 'Bağlantı kurulamadı; güvenli görünüm korunuyor.';
  return fallback||'İşlem tamamlanamadı.';
}
function ucfirst(s){ return String(s==null?"":s).replace(/^\s*/,"").replace(/^(.)/,function(m){return m.toUpperCase();}); }
function cleanEmojiText(s){
  return String(s==null?"":s)
    .replace(/[\u{1F000}-\u{1FAFF}\u{2600}-\u{27BF}]\uFE0F?(?:\u200D[\u{1F000}-\u{1FAFF}\u{2600}-\u{27BF}]\uFE0F?)*/gu,"")
    .replace(/\s+/g," ")
    .trim();
}

// ── Genişletilebilir kart şablonu (Faz 2) ──────────────────────────────────
// Ortak cardWrap() tüm yoğun kartlar için tek merkezi kalıp: özet her zaman
// görünür (veri gözlem kaybı yok), detay chevron ile grid-template-rows
// accordion'u ile açılır/kapanır. toggleCard() tam render() TETİKLEMEZ — yalnızca
// ilgili kartın DOM'unda bir class toggle eder, böylece CSS transition gerçek
// bir yükseklik animasyonu olarak oynar (tam render olsaydı DOM yeniden
// kurulacağı için animasyon atlanırdı) ve sayfa kaydırma konumu korunur.
// Kullanıcının hangi kartları açık bıraktığı localStorage'da kalıcıdır.
function toggleCard(key){
  var open=!UI.expandedCards[key];
  UI.expandedCards[key]=open;
  try{ localStorage.setItem(CARDEXPKEY,JSON.stringify(UI.expandedCards)); }catch(e){}
  var el=document.querySelector('[data-card-key="'+key+'"]');
  if(el){
    el.classList.toggle('is-open',open);
    var trigger=el.querySelector('.card-exp-head');
    if(trigger) trigger.setAttribute('aria-expanded',open?'true':'false');
    var body=el.querySelector('.card-exp-body');
    if(body) body.setAttribute('aria-hidden',open?'false':'true');
  }
}
window.toggleCard=toggleCard;
function cardWrap(o){
  // o: {key, icon, title, badge, summary, details, span, order, cls}
  var key=o.key, open=!!UI.expandedCards[key];
  var span=o.span||12, order=o.order||30;
  var controlId='card-exp-body-'+String(key).replace(/[^a-zA-Z0-9_-]/g,'-');
  // Inline handler legacy'sinde argümanı ayrı JS-string + HTML-attribute
  // sınırlarında kaçır: kart anahtarı normalde sabit olsa da test/gelecek
  // modül girdisi bir tırnak veya satır sonu taşısa XSS bağlamı oluşmasın.
  var keyArg=String(key==null?'':key).replace(/\\/g,'\\\\').replace(/"/g,'\\"').replace(/\r/g,'\\r').replace(/\n/g,'\\n');
  var s='<div class="card lift span-'+span+' pad card-exp'+(open?' is-open':'')+(o.cls?' '+o.cls:'')+'" style="order:'+order+';" data-card-key="'+esc(key)+'">';
  s+='<button type="button" class="card-exp-head" aria-expanded="'+(open?'true':'false')+'" aria-controls="'+controlId+'" onclick=\'toggleCard("'+esc(keyArg)+'")\'>';
  s+='<div class="lbl" style="margin-bottom:0;flex:1;">'+(o.icon?o.icon+' ':'')+esc(o.title)+'</div>';
  if(o.badge) s+=o.badge;
  s+='<span class="card-exp-chevron">▾</span>';
  s+='</button>';
  if(o.summary) s+='<div class="card-exp-summary">'+o.summary+'</div>';
  s+='<div id="'+controlId+'" class="card-exp-body" aria-hidden="'+(open?'false':'true')+'"><div><div class="card-exp-inner">'+(o.details||'')+'</div></div></div>';
  s+='</div>';
  return s;
}

// "Gelişmiş İçgörüler" kartındaki .seg sekmelerini tam render() TETİKLEMEDEN değiştirir
// (toggleCard ile aynı felsefe): yalnızca ilgili .ins-pane'lerin görünürlüğünü ve
// aktif buton class'ını günceller, seçim localStorage'da kalıcı olur.
function switchInsightPane(tab){
  UI.insightTab=tab;
  try{ localStorage.setItem(INSTABKEY,tab); }catch(e){}
  var root=document.querySelector('[data-card-key="insights"]');
  if(!root) return;
  root.querySelectorAll('.ins-pane').forEach(function(p){ p.style.display=(p.getAttribute('data-ins')===tab)?'':'none'; });
  root.querySelectorAll('.ins-seg button').forEach(function(b){ b.classList.toggle('active',b.getAttribute('data-ins-btn')===tab); });
}
window.switchInsightPane=switchInsightPane;

function panelReadiness(rec){
  var sl=rec&&rec.sleep?rec.sleep:{};
  var en=(rec&&rec.reading&&Array.isArray(rec.reading.entries))?rec.reading.entries:[];
  var pages=0; en.forEach(function(e){ var p=Number(e&&e.pages); if(!isNaN(p)&&p>0) pages+=p; });
  var hours=(sl.hours!=null&&!isNaN(Number(sl.hours)))?Number(sl.hours):null;
  var fDur=hours!=null?Math.round(26*Math.max(0,Math.min(1,1-Math.abs(hours-7.75)/3))):0;
  var fQual=sl.quality==="good"?18:(sl.quality==="ok"?10:(sl.quality==="bad"?3:0));
  var ci=caffeineInfoP(rec), fCaf=!ci.drinks.length?18:((ci.residue<50&&ci.timingOk)?18:(ci.residue<50?12:(ci.residue<100?8:3)));
  var medType=(sl.med&&sl.med.type)?sl.med.type:null;
  var fMed=medType==="none"?8:(medType==="herbal"?5:(medType==="rx"?2:4));
  var fReading=en.length>0?Math.min(16,8+Math.min(8,pages)):0;
  var wd=sl.windDown&&sl.windDown.steps, wdDone=0;
  if(Array.isArray(wd)) wdDone=wd.reduce(function(a,x){return a+(x&&x.done?1:0);},0);
  else if(wd&&typeof wd==="object") wdDone=["light","breath","dump","cool"].reduce(function(a,k){return a+(wd[k]?1:0);},0);
  var fWind=Math.round(14*Math.min(1,wdDone/4));
  var score=Math.max(0,Math.min(100,Math.round(fDur+fQual+fCaf+fReading+fWind+fMed)));
  return {score:score,readCount:en.length,readPages:pages,medType:medType,caffeine:ci,windDownDone:wdDone};
}
function readingRecap(dates){
  var readDays=0,totalPages=0,scoreSum=0,scoreDays=0,medDays=0;
  dates.forEach(function(d){ var r=recOf(d); if(!r) return; var en=(r.reading&&Array.isArray(r.reading.entries))?r.reading.entries:[]; if(en.length>0){ readDays++; en.forEach(function(e){ var p=Number(e&&e.pages); if(!isNaN(p)&&p>0) totalPages+=p; }); } var pr=panelReadiness(r); if((r.sleep&&(r.sleep.hours!=null||r.sleep.quality))||en.length>0){ scoreSum+=pr.score; scoreDays++; } if(pr.medType&&pr.medType!=="none") medDays++; });
  return {readDays:readDays,totalPages:totalPages,avgScore:scoreDays?Math.round(scoreSum/scoreDays):0,medDays:medDays,scoreDays:scoreDays};
}
function shortD(s){ var p=s.split("-"); return p[2]+"."+p[1]; }
function vacationSettingsP(){ return (D&&D.settings&&D.settings.vacation)||{enabled:false,startAt:'',endAt:'',preset:'active',reason:'',enabledAt:''}; }
function isVacationDayP(date){ var v=vacationSettingsP(); if(!v.enabled||!v.startAt||!v.endAt) return false; var d=date||today(); return d>=v.startAt&&d<=v.endAt; }
function trTime(iso){ if(!iso) return ''; try{ return new Date(iso).toLocaleTimeString('tr-TR',{timeZone:'Europe/Istanbul',hour:'2-digit',minute:'2-digit'}); }catch(e){ return iso.slice(11,16); } }
function monthKey(d){ return d.slice(0,7); }
function monthLabel(ym){ var p=ym.split("-").map(Number),m=["Ocak","Subat","Mart","Nisan","Mayis","Haziran","Temmuz","Agustos","Eylul","Ekim","Kasim","Aralik"]; return m[p[1]-1]+" "+p[0]; }
function recOf(d){ return D.days[d]||null; }
function avg(days,fn){ if(!days.length) return 0; return days.reduce(function(a,d){return a+fn(d);},0)/days.length; }
function sum(days,fn){ return days.reduce(function(a,d){return a+fn(d);},0); }
function formatDuration(sec){
  if(sec<60) return sec+" sn";
  if(sec<3600) return Math.round(sec/60)+" dk";
  var h=Math.floor(sec/3600), m=Math.round((sec%3600)/60);
  return h+" sa "+m+" dk";
}
function sessionStats(days){
  var totalActive=0, totalOpen=0, sessionCount=0;
  days.forEach(function(d){
    var rec=recOf(d);
    if(rec&&Array.isArray(rec.sessions)){
      rec.sessions.forEach(function(s){
        sessionCount++;
        if(s.activeSeconds) totalActive+=s.activeSeconds;
        if(s.start&&s.end) totalOpen+=(s.end-s.start)/1000;
      });
    }
    if(rec&&rec.liveSession&&rec.liveSession.activeSeconds){
      sessionCount++;
      totalActive+=Number(rec.liveSession.activeSeconds)||0;
      if(rec.liveSession.start&&rec.liveSession.lastSeen){
        totalOpen+=Math.max(0,(Number(rec.liveSession.lastSeen)-Number(rec.liveSession.start))/1000);
      }
    }
  });
  return {sessionCount:sessionCount,totalActive:totalActive,totalOpen:totalOpen,avgActive:sessionCount?Math.round(totalActive/sessionCount):0};
}
function spanEnd(){ var e=today(); for(var k in D.days){ if(diff(k,e)>0) e=k; } return e; }
function moodHeatmapCardHTML(){
  var mcol={"cok-iyi":"#4ade80","iyi":"#a3e635","normal":"#fbbf24","zorlandim":"#fb923c","cok-zorlandim":"#fb7185"};
  var tdy=today();
  var years={}; for(var k in D.days){ if(D.days[k]) years[String(k).slice(0,4)]=1; } years[tdy.slice(0,4)]=1;
  var yrList=Object.keys(years).sort(); var curY=+yrList[yrList.length-1];
  var jan1=new Date(curY,0,1), dec31=new Date(curY,11,31);
  var startDow=(jan1.getDay()+6)%7; var start=new Date(jan1); start.setDate(start.getDate()-startDow);
  var CELL=13, GAP=3, STEP=CELL+GAP, DAYLABW=26;
  var monN=["Oca","Şub","Mar","Nis","May","Haz","Tem","Ağu","Eyl","Eki","Kas","Ara"];
  var dayLab=["Pzt","","Çar","","Cum","",""];
  var weeks=[], cur=new Date(start);
  while(cur<=dec31){ var col=[]; for(var d=0; d<7; d++){ col.push(new Date(cur)); cur.setDate(cur.getDate()+1); } weeks.push(col); }
  var nW=weeks.length;
  var det='<div style="overflow-x:auto;-webkit-overflow-scrolling:touch;padding-bottom:4px;">';
  det+='<div style="display:inline-flex;flex-direction:column;gap:4px;">';
  det+='<div style="position:relative;height:12px;margin-left:'+(DAYLABW+GAP)+'px;width:'+(nW*STEP)+'px;">';
  for(var w=0; w<nW; w++){ for(var di=0; di<7; di++){ var dd=weeks[w][di]; if(dd.getFullYear()===curY && dd.getDate()===1){ det+='<span style="position:absolute;left:'+(w*STEP)+'px;top:0;font-size:9px;font-weight:700;color:var(--t3);white-space:nowrap;">'+monN[dd.getMonth()]+'</span>'; } } }
  det+='</div>';
  det+='<div style="display:flex;gap:'+GAP+'px;">';
  det+='<div style="display:flex;flex-direction:column;gap:'+GAP+'px;width:'+DAYLABW+'px;">';
  for(var r=0; r<7; r++){ det+='<div style="height:'+CELL+'px;line-height:'+CELL+'px;font-size:8.5px;color:var(--t4);text-align:right;">'+dayLab[r]+'</div>'; }
  det+='</div>';
  var recDays=0;
  for(var w2=0; w2<nW; w2++){
    det+='<div style="display:flex;flex-direction:column;gap:'+GAP+'px;">';
    for(var r2=0; r2<7; r2++){
      var dt=weeks[w2][r2]; var ds=dt.getFullYear()+"-"+pad(dt.getMonth()+1)+"-"+pad(dt.getDate());
      if(dt.getFullYear()!==curY){ det+='<div style="width:'+CELL+'px;height:'+CELL+'px;"></div>'; continue; }
      var future=diff(tdy,ds)>0; var rec=D.days[ds]||null; var bg, tip=ds;
      if(future){ bg='rgba(255,255,255,0.03)'; }
      else if(rec && rec.mood){ bg=mcol[rec.mood]||'#a78bfa'; recDays++; tip+=' · '+(MOOD_LABEL[rec.mood]||rec.mood); }
      else if(rec){ bg='rgba(255,255,255,0.16)'; recDays++; tip+=' · kayıt var'; }
      else { bg='rgba(255,255,255,0.06)'; tip+=' · kayıt yok'; }
      var isT=ds===tdy;
      det+='<div title="'+esc(tip)+'" style="width:'+CELL+'px;height:'+CELL+'px;border-radius:3px;background:'+bg+';'+(isT?'box-shadow:0 0 0 1.5px var(--gold);':'')+'"></div>';
    }
    det+='</div>';
  }
  det+='</div></div></div>';
  det+='<div class="moodlegend" style="justify-content:space-between;">';
  det+='<span style="display:flex;align-items:center;gap:5px;font-size:var(--f2);color:var(--t3);">zor';
  ["cok-zorlandim","zorlandim","normal","iyi","cok-iyi"].forEach(function(mid){ det+='<span style="width:11px;height:11px;border-radius:3px;background:'+mcol[mid]+';display:inline-block;"></span>'; });
  det+='iyi</span>';
  det+='<span style="font-size:var(--f2);color:var(--t3);"><b class="mono">'+recDays+'</b> gün kayıtlı</span>';
  det+='</div>';
  var totalD=diff(fmt(jan1),fmt(dec31))+1;
  var sumLine='<b class="mono" style="color:var(--gold);">'+recDays+'</b>/'+totalD+' gün kayıtlı · '+curY+' yılı ısı haritası';
  return cardWrap({key:'heatmap-'+curY,icon:icon('thermometer',18),title:'Mod Isı Haritası · '+curY,span:12,order:20,summary:sumLine,details:det});
}
function allDays(){ var out=[],n=Math.max(1,diff(D.startDate,spanEnd())+1); if(n>3000)n=3000; for(var i=0;i<n;i++) out.push(addDays(D.startDate,i)); return out; }
function windowDays(n,endDate){ var out=[],end=endDate||today(); for(var i=n-1;i>=0;i--) out.push(addDays(end,-i)); return out; }
function currentStreak(){ var c=0,d=today(),paused=false; if(cnt(recOf(d))<4) d=addDays(d,-1); while(diff(D.startDate,d)>=0){ if(cnt(recOf(d))>=4){ c++; paused=false; d=addDays(d,-1);} else if(isVacationDayP(d)){ paused=true; d=addDays(d,-1);} else break; } return c; }
function bestStreak(days){ var b=0,c=0; days.forEach(function(d){ if(cnt(recOf(d))>=4){ c++; if(c>b)b=c; } else if(isVacationDayP(d)){ /* pause: don't break or count */ } else c=0;}); return b; }
function lastSavedAt(){ var b=D&&typeof D.savedAt==='string'&&D.savedAt||null; for(var k in (D&&D.days||{})){ var s=D.days[k]&&typeof D.days[k].savedAt==='string'&&D.days[k].savedAt; if(s&&(!b||s>b)) b=s; } return b; }
var SYNC_STATUS_P={
  accepted:{cls:'b-ok',label:'Uzak kayda alındı'},
  local_saved:{cls:'b-dim',label:'Yerel kayıt var'},
  queued:{cls:'b-warn',label:'Gönderilmek üzere bekliyor'},
  saving:{cls:'b-warn',label:'Kaydediliyor'},
  retrying:{cls:'b-warn',label:'Yeniden deneniyor'},
  offline:{cls:'b-warn',label:'Çevrimdışı'},
  permission:{cls:'b-danger',label:'Yetki gerekli'},
  unauthorized:{cls:'b-danger',label:'Yetki gerekli'},
  forbidden:{cls:'b-danger',label:'Yetki gerekli'},
  not_found:{cls:'b-danger',label:'Repo veya dosya bulunamadı'},
  conflict:{cls:'b-danger',label:'Çakışma durduruldu'},
  anti_clobber:{cls:'b-danger',label:'Veri kaybını önlemek için durduruldu'},
  projection_failed:{cls:'b-danger',label:'Observer projection oluşturulamadı'},
  projection_invalid:{cls:'b-danger',label:'Observer projection bozuk'},
  network:{cls:'b-warn',label:'Ağ bekleniyor'},
  rate_limited:{cls:'b-warn',label:'Sunucu sınırı; sonra yeniden denenecek'},
  receipt_failed:{cls:'b-danger',label:'Uzak kabul makbuzu alınamadı'},
  receipt_missing:{cls:'b-warn',label:'Receipt kanıtı eksik'},
  error:{cls:'b-danger',label:'Senkron hatası'},
  missing:{cls:'b-warn',label:'Uzak kabul makbuzu yok'}
};
function normalizeSyncReceiptP(r){
  var out={schemaVersion:1,status:'idle',snapshotRevision:null,sourceUpdatedAt:null,submittedAt:null,acceptedAt:null,sourceLatestSha:null,lastErrorCode:null,lastErrorDetail:null};
  var x=r&&typeof r==='object'?r:{};
  var statuses={idle:1,local_saved:1,queued:1,saving:1,retrying:1,accepted:1,error:1,offline:1,permission:1,conflict:1,anti_clobber:1};
  var errors={offline:1,unauthorized:1,forbidden:1,not_found:1,conflict:1,anti_clobber:1,validation:1,rate_limited:1,projection_failed:1,media_unavailable:1,network:1,receipt_failed:1,unknown:1};
  function str(v,max){ return typeof v==='string'&&v&&v.length<=(max||160)&&/^[a-f0-9]{7,128}$/i.test(v)?v:null; }
  function iso(v){ if(typeof v!=='string'||!v||v.length>40) return null; var t=Date.parse(v); return isNaN(t)?null:new Date(t).toISOString(); }
  function detail(v){ return typeof v==='string'&&/^[a-z0-9_]{1,24}$/.test(v)?v:null; }
  out.status=statuses[x.status]?x.status:'idle'; out.snapshotRevision=str(x.snapshotRevision,128); out.sourceUpdatedAt=iso(x.sourceUpdatedAt); out.submittedAt=iso(x.submittedAt); out.acceptedAt=iso(x.acceptedAt); out.sourceLatestSha=str(x.sourceLatestSha,128); out.lastErrorCode=errors[x.lastErrorCode]?x.lastErrorCode:null; out.lastErrorDetail=detail(x.lastErrorDetail);
  return out;
}
// REM-68: accepted receipt ancak revision + source SHA + acceptedAt birlikte
// varsa kabul kanıtıdır. Panel bu kontrolü sync.js ile aynı salt-okunur
// sözleşmede uygular; eksik synthetic receipt yeşile yükseltilmez.
function syncReceiptEvidenceP(r){
  var x=normalizeSyncReceiptP(r), missing=[];
  ['snapshotRevision','sourceLatestSha','acceptedAt'].forEach(function(key){ if(!x[key]) missing.push(key); });
  if(x.status==='accepted'&&missing.length) return {ok:false,code:'receipt_missing',reason:'accepted-proof-incomplete',missingProof:missing};
  if(x.status==='accepted') return {ok:true,code:'accepted',reason:null,missingProof:[]};
  if(x.status==='offline'||x.lastErrorCode==='offline') return {ok:false,code:'offline',reason:'sync-offline',missingProof:[]};
  if(x.status==='conflict'||x.lastErrorCode==='conflict') return {ok:false,code:'conflict',reason:'sync-conflict',missingProof:[]};
  if(x.status==='error'||x.lastErrorCode) return {ok:false,code:'error',reason:'sync-error',missingProof:[]};
  if(x.status==='queued'||x.status==='saving'||x.status==='retrying'||x.status==='local_saved') return {ok:false,code:'pending',reason:'sync-pending',missingProof:[]};
  return {ok:false,code:'missing',reason:'sync-not-accepted',missingProof:[]};
}
function syncStatusP(receipt){
  var r=normalizeSyncReceiptP(receipt);
  var code=r.lastErrorCode||r.status;
  if(code&&code!=='accepted'&&SYNC_STATUS_P[code]){
    var pending=SYNC_STATUS_P[code];
    return {code:code,cls:pending.cls,label:pending.label};
  }
  // Bazı eski headless extraction harness'ları yalnız syncStatusP +
  // normalizeSyncReceiptP yükler. Ortak helper mevcutsa onu kullan; yoksa
  // aynı fail-closed üç alan kontrolünü burada koru.
  var evidence=typeof syncReceiptEvidenceP==='function'?syncReceiptEvidenceP(receipt):{ok:code!=='accepted'||!!(r.snapshotRevision&&r.sourceLatestSha&&r.acceptedAt)};
  if(code==='accepted'&&!evidence.ok){
    // Yeni panel yükleme grafiği receipt_missing ayrımını bilir; eski
    // extraction fixture'larında geriye dönük canonical kod `missing` kalır.
    var incompleteCode=typeof syncReceiptEvidenceP==='function'?'receipt_missing':'missing', incomplete=SYNC_STATUS_P[incompleteCode];
    return {code:incompleteCode,cls:incomplete.cls,label:incomplete.label};
  }
  if(!receipt||!r.acceptedAt||!r.sourceLatestSha) return {code:'missing',cls:SYNC_STATUS_P.missing.cls,label:SYNC_STATUS_P.missing.label};
  if(code==='accepted') return {code:code,cls:SYNC_STATUS_P.accepted.cls,label:SYNC_STATUS_P.accepted.label};
  var s=SYNC_STATUS_P[code]||SYNC_STATUS_P.error;
  return {code:SYNC_STATUS_P[code]?code:'error',cls:s.cls,label:s.label};
}
function syncTimesP(receipt,pollAt,projectionState){
  var r=normalizeSyncReceiptP(receipt);
  var p=projectionState&&projectionState.snapshot?projectionState.snapshot:null;
  return {local:r.sourceUpdatedAt,remote:r.acceptedAt,projection:p&&p.projectionBuiltAt||null,panelPoll:pollAt||null};
}
function syncTimeP(v){ return v?tsShort(v):'—'; }
function syncFreshnessP(receipt,pollAt){
  var st=syncStatusP(receipt), r=normalizeSyncReceiptP(receipt);
  var ps=typeof pollStatusP==='function'?pollStatusP():{code:'idle',label:'Yakın takip bekleniyor'};
  if(ps.code==='skipped_input'||ps.code==='deferred_draft') return {klass:'warn',txt:ps.label};
  if(ps.code==='error') return {klass:'danger',txt:ps.label};
  if(ps.code==='stale') return {klass:'warn',txt:ps.label};
  if(st.code!=='accepted') return {klass:st.code==='missing'?'warn':'danger',txt:st.label};
  var age=Math.max(0,Math.round((Date.now()-new Date(r.acceptedAt).getTime())/60000));
  if(age<=30) return {klass:'ok',txt:ps.label};
  if(age<=180) return {klass:'warn',txt:'Yakın takip · uzak kabul hafif gecikmiş'};
  if(age<=2160) return {klass:'warn',txt:'Yakın takip · uzak kabul eski'};
  return {klass:'danger',txt:'Yakın takip · uzak kabul kritik derecede eski'};
}
function canonicalStatusP(receipt,projectionState){
  var st=syncStatusP(receipt), r=normalizeSyncReceiptP(receipt), reason=projectionState&&projectionState.reason||'';
  if(st.code==='anti_clobber'||st.code==='conflict') return {code:st.code,kind:'danger',cls:'b-danger',label:'Canonical conflict',detail:'Uzak kabul bekleniyor; veri kaybı riskinde işlem durdu.',revision:r.snapshotRevision||null};
  if(st.code==='error'||st.code==='permission'||st.code==='unauthorized'||st.code==='forbidden'||st.code==='receipt_failed') return {code:st.code,kind:'danger',cls:'b-danger',label:'Canonical hata',detail:'Receipt/revision doğrulanamadı; önceki güvenli görünüm korunuyor.'+(r.lastErrorDetail?(' Ayrıntı: '+r.lastErrorDetail+'.'):''),revision:r.snapshotRevision||null};
  if(st.code==='missing'||st.code==='receipt_missing') return {code:st.code,kind:'warning',cls:'b-warn',label:'Canonical receipt bekleniyor',detail:'Uzak kabul receipt kanıtı tamamlanmadan başarı iddiası yok.',revision:r.snapshotRevision||null};
  if(st.code==='accepted'&&(reason==='projection_stale'||reason==='projection_invalid'||reason==='projection_parse_failed'||reason==='projection_network'||reason==='projection_permission')) return {code:'projection',kind:'warning',cls:'b-warn',label:'Canonical kabul · projection bekliyor',detail:'Receipt kabul edildi; observer görünümü güvenli fallback ile sürüyor.',revision:r.snapshotRevision||null};
  if(st.code==='accepted') return {code:'accepted',kind:'ok',cls:'b-ok',label:'Canonical kabul edildi',detail:'Receipt + revision kanıtı doğrulandı.',revision:r.snapshotRevision||null};
  if(st.code==='queued'||st.code==='saving'||st.code==='retrying'||st.code==='offline'||st.code==='local_saved') return {code:st.code,kind:'pending',cls:'b-warn',label:'Canonical bekliyor',detail:'Yerel kayıt var; uzak kabul henüz oluşmadı.',revision:r.snapshotRevision||null};
  return {code:st.code||'idle',kind:'muted',cls:'b-dim',label:'Canonical durum bekleniyor',detail:'İlk receipt/revision kontrolü bekleniyor.',revision:r.snapshotRevision||null};
}
// Kanonik status-badge HTML şablonu — tone burada ZATEN çözülmüş kabul
// edilir (yalnız bilinen 5 değere karşı doğrulanır). panelStatusP,
// panelLegacyBadgeHTMLP ve d2StatusBadgeP bu şablonu paylaşır; aralarındaki
// tek fark tone'un nasıl hesaplandığıdır (prompt 3.2).
function panelStatusBadgeHTMLP(label,tone,legacyCls){
  var t=['ok','pending','warning','danger','muted'].indexOf(tone)>=0?tone:'muted';
  return '<span class="badge status-badge status-'+t+' '+(legacyCls||'b-dim')+'" data-component="status-badge" data-status="'+t+'">'+esc(label)+'</span>';
}
function d2StatusBadgeP(label,kind,extra){ return panelStatusBadgeHTMLP(label,kind,extra); }
function countNewEventChangesP(previous,next){
  var oldIds={}; (Array.isArray(previous)?previous:[]).forEach(function(e){ if(e&&e.eventId) oldIds[String(e.eventId)]=true; });
  var count=0; (Array.isArray(next)?next:[]).forEach(function(e){ if(e&&e.eventId&&!oldIds[String(e.eventId)]) count++; });
  return count;
}
function viewNewChangesP(){
  UI.newChanges=0; render();
  setTimeout(function(){ var el=document.getElementById('event-log-card'); if(el&&typeof el.scrollIntoView==='function') el.scrollIntoView({behavior:'smooth',block:'start'}); },0);
}
window.viewNewChangesP=viewNewChangesP;
function syncRibbonHTMLP(receipt,pollAt,projectionState){
  var st=syncStatusP(receipt), r=normalizeSyncReceiptP(receipt), t=syncTimesP(receipt,pollAt,projectionState), pollState=typeof PANEL_POLL_STATE==='object'&&PANEL_POLL_STATE?PANEL_POLL_STATE:{}, ps=typeof pollStatusP==='function'?pollStatusP():{cls:'b-dim',label:'Yakın takip bekleniyor',note:'İlk panel çekimi bekleniyor.'}, revFull=pollState.sourceRevision||r.snapshotRevision||'—', rev=String(revFull).slice(0,12), visibleFull=pollState.visibleRevision||r.snapshotRevision||'—', visible=String(visibleFull).slice(0,12);
  function localStatus(label,legacy,tone){ return panelLegacyBadgeHTMLP(label,legacy,tone); }
  var rows=[['Yerel kayıt',syncTimeP(t.local)],['Uzak kabul',syncTimeP(t.remote)],['Projection',t.projection?'hazır · '+syncTimeP(t.projection):'ayrı model yok'],['Panel çekimi',syncTimeP(t.panelPoll)]];
  var cells=rows.map(function(x){ return '<div class="sync-ribbon-cell"><span>'+esc(x[0])+'</span><b>'+esc(x[1])+'</b></div>'; }).join('');
  var sectionFetchFailed=typeof PROJECTION!=='undefined'&&PROJECTION&&typeof PROJECTION.sectionFetchState==='object'&&PROJECTION.sectionFetchState&&!PROJECTION.sectionFetchState.ok;
  var errorState=['error','permission','unauthorized','forbidden','conflict','anti_clobber','receipt_failed'].indexOf(st.code)>=0||ps.code==='error';
  var staleState=ps.code==='stale'||(projectionState&&projectionState.reason==='projection_stale');
  var noteClass=errorState?' error-state':staleState?' stale-banner':sectionFetchFailed?' stale-banner':'';
  var noteComponent=errorState?'error-state':staleState?'stale-banner':sectionFetchFailed?'stale-banner':'sync-ribbon-note';
  var compatibility=projectionState&&projectionState.compatibility&&typeof projectionState.compatibility==='object'?projectionState.compatibility:{};
  var note=st.code==='missing'?'Receipt yok; panel uzak sunucunun kabul ettiği son snapshot için başarı iddiası kullanmıyor.':st.code==='receipt_missing'?'Receipt var ancak revision/SHA/zaman kanıtı eksik; başarı iddiası yok.':st.code==='anti_clobber'?'Veri kaybı riskinde push durduruldu.':st.code==='conflict'?'Conflict var; eşleşen revision olmadan uzak kabul başarıya yükseltilmiyor.':errorState?('Canonical hata; önceki güvenli görünüm korunuyor.'+(r.lastErrorDetail?(' Ayrıntı: '+r.lastErrorDetail+'.'):'')):staleState?'Kaynak veya projection eski; görünüm güncelmiş gibi sunulmuyor.':compatibility.code==='schema_unsupported'||compatibility.code==='manifest_unsupported'?'Projection sürümü uyumsuz; panel asset güncellenmeli veya projection yeniden oluşturulmalı. Güvenli legacy fallback kullanılıyor.':compatibility.code==='partial_rebuilt'?'Projection kısmi; eksik alanlar güncel manifest ile yeniden kuruldu, başarı iddiası yok.':projectionState&&projectionState.reason==='projection_invalid'?'Projection bozuk; güvenli legacy fallback kullanılıyor.':sectionFetchFailed?'Bazı modüller geçici olarak yüklenemedi, otomatik yeniden denenecek.':'';
  var proof=st.code==='accepted'&&r.acceptedAt&&r.sourceLatestSha&&r.snapshotRevision?'Receipt kabul · '+syncTimeP(r.acceptedAt)+' · SHA '+String(r.sourceLatestSha).slice(0,12):'Receipt/revision kanıtı bekleniyor';
  var pollBadge=localStatus(ps.label,ps.cls).replace('data-component="status-badge"','id="poll-ribbon-status" data-component="status-badge"');
  return '<section class="sync-ribbon" data-component="sync-ribbon" aria-label="Senkron sağlık özeti" aria-live="polite"><div class="sync-ribbon-head">'+localStatus(st.label,st.cls)+pollBadge+'<span class="sync-ribbon-rev">revision · '+esc(rev)+'</span><span class="sync-ribbon-proof">'+esc(proof)+'</span></div><div class="sync-ribbon-grid">'+cells+'</div><div class="sync-ribbon-note'+noteClass+'" data-component="'+noteComponent+'">'+esc(note)+' <span id="poll-ribbon-note">'+esc(ps.note)+'</span><span class="poll-ribbon-meta">Kaynak revision · '+esc(rev)+' · görünür revision · '+esc(visible)+' · conditional · '+esc(pollState.conditionalMode||'etag')+'</span></div></section>';
}
// REM-55: kaynak secim sozlesmesi tek, adlandirilmis ve test edilebilir bir
// yerde yasar. `chooseProjection` yalnizca projection argumanina bakar; bir
// projection HIC CEKILEMEDIYSE (401/403/ag/bozuk govde) ona `null` gelir ve
// kaba `projection_missing` doner. Bu, 'projection yapilandirilmamis' gibi
// ZARARSIZ okunur. Yukleyicinin daha ozgul nedeni burada geri kazandirilir.
//
// Onceki hâli `load()` icine gomuluydu ve yanlislikla sync RECEIPT'ini
// (`res[3]`) okuyordu; normalize edilmis receipt'te `reason` alani hic
// bulunmadigi icin yukseltme ASLA calismiyordu.
function projectionSourceStateP(chosen,projectionLoad){
  if(!chosen||typeof chosen!=='object') return chosen;
  if(chosen.reason!=='projection_missing') return chosen;
  var loaded=projectionLoad&&typeof projectionLoad==='object'?projectionLoad:null;
  var reason=loaded&&typeof loaded.reason==='string'?loaded.reason:'';
  if(!reason||reason==='projection_missing'||reason==='ready') return chosen;
  chosen.reason=reason;
  if(loaded&&loaded.compatibility) chosen.compatibility=loaded.compatibility;
  return chosen;
}
function projectionStatusP(state){
  var s=state&&state.source||'none', reason=state&&state.reason||'projection_missing';
  var compatibility=state&&state.compatibility&&typeof state.compatibility==='object'?state.compatibility:{};
  if(compatibility.code==='schema_unsupported') return {cls:'b-danger',label:'Projection sürümü uyumsuz',note:'Bu panel projection şemasını tanımıyor; paneli güncelle veya projectionı yeniden oluştur. Güvenli legacy fallback kullanılıyor.'};
  if(compatibility.code==='manifest_unsupported') return {cls:'b-danger',label:'Projection manifesti uyumsuz',note:'Projection manifesti bu panelden farklı; güncel asset ile yeniden üretilecek. Güvenli legacy fallback kullanılıyor.'};
  if(compatibility.code==='malformed') return {cls:'b-danger',label:'Projection şeması bozuk',note:'Projection metadata alanı okunamadı; güvenli legacy fallback kullanılıyor.'};
  if(compatibility.code==='legacy') return {cls:'b-warn',label:'Eski projection',note:'Eski projection sürümü başarı sayılmadı; güncel latest.json redaction fallback kullanılıyor.'};
  if(s==='projection'&&compatibility.code==='partial_rebuilt') return {cls:'b-warn',label:'Projection kısmi',note:'Eksik alanlar güncel manifest ile yeniden kuruldu; tüm projection kanıtı hazır sayılmıyor.'};
  if(s==='projection') return {cls:'b-ok',label:'Projection hazır',note:'Panel güvenli observer read-modelini kullanıyor.'};
  if(reason==='projection_stale') return {cls:'b-warn',label:'Projection eski',note:'Revision/SHA eşleşmedi; güvenli legacy fallback kullanılıyor.'};
  if(reason==='projection_invalid'||reason==='projection_parse_failed') return {cls:'b-danger',label:'Projection bozuk',note:'Projection okunamadı; panel güvenli legacy fallback ile açık kaldı.'};
  if(reason==='receipt_missing') return {cls:'b-warn',label:'Receipt bekleniyor',note:'Uzak kabul receipt’i olmadan projection başarıya yükseltilmedi.'};
  if(reason==='projection_permission'||reason==='projection_network') return {cls:'b-warn',label:'Projection okunamadı',note:'Projection çekilemedi; panel güvenli legacy fallback ile açık kaldı.'};
  return {cls:'b-dim',label:'Projection yok',note:'Eski latest.json güvenli redaction fallback olarak kullanılıyor.'};
}
function coverageRibbonHTMLP(state){
  var st=projectionStatusP(state), c=state&&state.coverage||{}, full=Array.isArray(c.full)?c.full.length:0, summary=Array.isArray(c.summary)?c.summary.length:0, redacted=Array.isArray(c.redacted)?c.redacted.length:0, missing=Array.isArray(c.missing)?c.missing.length:0;
  // Not (prompt 3.2 birleştirmesi): bu localStatus eskiden yalnız legacy
  // class'a bakıyordu, syncRibbonHTMLP/eventLogCardInnerHTMLP'nin metin
  // tabanlı 'bekliyor/...' çıkarımını YAPMIYORDU (tutarsızlık). Hiçbir test
  // bu eski davranışı sabitlemiyor; diğer ikisiyle tutarlı olacak şekilde
  // panelLegacyBadgeHTMLP'ye yönlendirildi (tek gerçek fark: 'Receipt
  // bekleniyor' artık tone 'warning' yerine 'pending' — anlamsal olarak
  // daha doğru bir sınıf).
  function localStatus(label,legacy){ return panelLegacyBadgeHTMLP(label,legacy); }
  var cells=[['Tam',full],['Özet',summary],['Redacted',redacted],['Eksik',missing]].map(function(x){ return '<div class="coverage-ribbon-cell"><span>'+esc(x[0])+'</span><b>'+esc(String(x[1]))+'</b></div>'; }).join('');
  return '<section class="coverage-ribbon" data-component="coverage-ribbon" aria-label="Observer coverage özeti"><div class="coverage-ribbon-head">'+localStatus(st.label,st.cls)+'<span class="coverage-ribbon-manifest">manifest · v1</span></div><div class="coverage-ribbon-grid">'+cells+'</div><div class="coverage-ribbon-note">'+esc(st.note)+'</div></section>';
}
function statusToneP(legacy){ return legacy==='b-ok'?'ok':legacy==='b-danger'?'danger':legacy==='b-warn'?'warning':legacy==='b-gold'?'pending':'muted'; }
// Bazı status KODLARI kendi legacy class'ından bağımsız bir tone'a zorlanır
// (örn. 'pending' kodunun legacy class'ı 'b-warn' olsa da tone 'pending'
// olmalı) — panelStatusP ve statusToneForCodeP bu tek listeyi paylaşır.
function panelToneOverrideP(code){
  if(['pending','started','sent','delivered','active'].indexOf(code)>=0) return 'pending';
  if(['incomplete','stale'].indexOf(code)>=0) return 'warning';
  return null;
}
function statusToneForCodeP(status,legacy){ return panelToneOverrideP(status)||statusToneP(legacy); }
// Kanonik status kodu -> {label, cls, tone} eşlemesi (prompt 3.2). Eskiden
// p3StatusP, statusToneP/statusToneForCodeP, d2StatusBadgeP,
// auditRollupStatusP ve syncRibbonHTMLP/coverageRibbonHTMLP/
// eventLogCardInnerHTMLP içindeki üç ayrı localStatus() kapanışı bu
// eşlemeyi (küçük tutarsızlıklarla) ayrı ayrı tekrarlıyordu. Harita
// p3StatusP'ninkinden taşındı — en kapsamlı (en çok status kodunu
// kapsayan) implementasyon oydu.
function panelStatusP(code){
  var m={ready:['Hazır','b-ok'],ok:['Kayıtlı','b-ok'],fresh:['Taze','b-ok'],incomplete:['Eksik metadata','b-warn'],stale:['Eski cache','b-warn'],missing:['Yok','b-dim'],malformed:['Bozuk','b-danger'],error:['Hata','b-danger'],mismatch:['Uyuşmazlık','b-danger'],active:['Sürüyor','b-warn'],completed:['Tamamlandı','b-ok'],not_started:['Başlamadı','b-dim'],unknown:['Bilinmiyor','b-dim'],started:['Başladı','b-warn'],chosen:['Seçildi','b-ok'],sent:['Gönderildi','b-warn'],delivered:['İletildi','b-warn'],created:['Oluşturuldu','b-dim'],deleted:['Silindi','b-danger'],read:['Okundu','b-ok'],pending:['Bekliyor','b-warn']};
  var x=m[code]||['Bekleniyor','b-dim'];
  return {label:x[0],cls:x[1],tone:panelToneOverrideP(code)||statusToneP(x[1])};
}
// label + legacy class (+ opsiyonel açık tone override) alan badge
// üreticisi — syncRibbonHTMLP/coverageRibbonHTMLP/eventLogCardInnerHTMLP'nin
// durum KODU değil serbest metin etiketli rozetleri için ortak yol.
function panelLegacyBadgeHTMLP(label,legacy,explicitTone){
  var inferred=/bekliyor|gönderildi|sürüyor|iletildi|başladı|taslak/.test(String(label||'').toLowerCase())?'pending':null;
  return panelStatusBadgeHTMLP(label,explicitTone||inferred||statusToneP(legacy),legacy);
}
function sourceKindP(text){
  var s=String(text||'').toLowerCase();
  if(/external|wikimedia|youtube|harici/.test(s)) return 'external';
  if(/delivery|teslim|inbox|bildirim|notification/.test(s)) return 'delivery';
  if(/observer|projection|canonical|panel/.test(s)) return 'observer';
  if(/derived|türetil|trend|summary|backoff/.test(s)) return 'derived';
  return 'user';
}
function privacyKindP(text){ return /sensitive|raw|gps|track|base64|redacted|gizli|restricted/.test(String(text||'').toLowerCase())?'restricted':'redacted'; }
function p3BadgeP(text,kind){
  var k=kind||'source', raw=String(text||'').toLowerCase(), variant;
  if(k==='privacy') variant=/sensitive|raw|gps|track|base64|redacted|gizli|restricted/.test(raw)?'restricted':'redacted';
  else variant=/external|wikimedia|youtube|harici/.test(raw)?'external':/delivery|teslim|inbox|bildirim|notification/.test(raw)?'delivery':/observer|projection|canonical|panel/.test(raw)?'observer':/derived|türetil|trend|summary|backoff/.test(raw)?'derived':'user';
  var cls=k==='privacy'?'privacy-badge privacy-'+variant:'source-badge source-'+variant;
  return '<span class="p3-badge '+k+' '+cls+'" data-component="'+(k==='privacy'?'privacy-badge':'source-badge')+'" data-'+k+'-kind="'+variant+'">'+esc(text)+'</span>';
}
function p3TimeP(v){ return v?esc(String(v).slice(0,16).replace('T',' ')):'—'; }
// Bir zaman damgasının GERÇEK ŞİMDİKİ zamana göre ne kadar eski olduğunu
// gösteren küçük, bağımsız rozet. dailyPhoto'nun kendi (referans tarihe göre)
// stale mantığından ayrıdır — bu, panelin açıldığı anki duvar saatine göre
// canlı bir "tazelik" göstergesidir; roomContentHistory/saygiRoot/locNudge/
// locationTiming/notificationTimeline/externalSources gibi ham tarih
// yazdıran kartlara eklenmek üzere tasarlandı.
function stalenessBadgeP(iso){
  var muted='<span class="badge status-badge status-muted b-dim" data-component="status-badge" data-status="muted">Veri yok</span>';
  if(!iso) return muted;
  var t=Date.parse(iso);
  if(isNaN(t)) return muted;
  var days=(Date.now()-t)/86400000;
  if(days<STALE_WARN_DAYS) return '<span class="badge status-badge status-ok b-ok" data-component="status-badge" data-status="ok">Güncel</span>';
  var n=Math.max(1,Math.round(days));
  if(days<=STALE_DANGER_DAYS) return '<span class="badge status-badge status-warning b-warn" data-component="status-badge" data-status="warning">'+n+' gün önce</span>';
  return '<span class="badge status-badge status-danger b-danger" data-component="status-badge" data-status="danger">Eski · '+n+' gün önce</span>';
}
function p3StatusP(status){ var r=panelStatusP(status); return panelStatusBadgeHTMLP(r.label,r.tone,r.cls); }
// Bir modülün 'missing' durumunun KÖK SEBEBİNİ üç kategoriye ayırır —
// "hiç kullanılmadı" (gerçekten hiç veri yok), "senkron bekleniyor" (Faz
// 1.1'in PROJECTION.sectionFetchState'i veya receipt/projection henüz taze değil),
// "hata" (projection açıkça bozuk/yüklenemedi). status 'missing' değilse
// (ok/malformed/stale) null döner — o durumların kendi mesajı zaten var.
// PROJECTION bare global referansı typeof guard'ıyla korunuyor (panel.js:~1187
// civarındaki sectionFetchFailed deseniyle aynı) — test VM context'lerinde
// PROJECTION hiç tanımlı olmasa bile ReferenceError fırlatmaz (typeof obj.prop,
// obj tanımsızsa yine fırlatır; bu yüzden önce PROJECTION'ın kendisi kontrol edilir).
function emptyStateReasonP(status){
  if(status!=='missing') return null;
  var fetchFailed=typeof PROJECTION!=='undefined'&&PROJECTION&&PROJECTION.sectionFetchState&&!PROJECTION.sectionFetchState.ok;
  var reason=typeof PROJECTION!=='undefined'&&PROJECTION&&PROJECTION.state?PROJECTION.state.reason:null;
  if(fetchFailed||reason==='receipt_missing'||reason==='projection_stale') return {kind:'pending',text:'Senkron bekleniyor · veri gelmiş olabilir, henüz panelde görünmüyor.'};
  if(reason==='projection_invalid'||reason==='projection_load_failed') return {kind:'error',text:'Kaynak/projection hatası · önceki güvenli görünüm korunuyor.'};
  return {kind:'unused',text:'Bu özellik henüz kullanılmamış.'};
}
// REM-59: yan kanal (section) fetch hatasının kararını tek, saf ve test
// edilebilir fonksiyonda toplar. Yapılmış başka sağlıklı sections varsa onları
// KORUR ve hata durumunu isaretler; ilk yüklemede (hiç section yokken) normal
// 'missing' davranışına düşer. Dönen sectionFetchState.lastError yalnız sabit
// bir KOD'dur — ham network hatası, token veya kişisel ayrıntı asla burada
// tutulmaz (panel gözlemcidir; hiçbir raw hata gövdesi panel durumuna girmez).
function applySectionFailureP(currentSections,error){
  var hadSections=!!(currentSections&&typeof currentSections==='object'&&Object.keys(currentSections).length>0);
  var sections=hadSections?currentSections:{};
  var m=String(error&&error.message||error||'').toLowerCase(), code='network';
  if(m.indexOf('401')>=0||m.indexOf('unauthorized')>=0||m.indexOf('gecersiz')>=0||m.indexOf('yetkisiz')>=0) code='unauthorized';
  else if(m.indexOf('403')>=0||m.indexOf('forbidden')>=0||m.indexOf('yetki')>=0) code='forbidden';
  else if(m.indexOf('404')>=0||m.indexOf('not found')>=0||m.indexOf('bulunamad')>=0) code='not_found';
  else if(m.indexOf('429')>=0||m.indexOf('rate')>=0) code='rate_limited';
  else if(m.indexOf('409')>=0||m.indexOf('422')>=0||m.indexOf('conflict')>=0) code='conflict';
  return {hadSections:hadSections,sections:sections,sectionFetchState:{ok:false,lastError:code,failedAt:new Date().toISOString()}};
}
// REM-59: reminder system status'unu BEŞ ayrık durumla raporlar —
// unavailable (projeksiyon çekilemedi / hiç kaynak yok), stale (kaynak veya
// projeksiyon eski), error (projeksiyon açıkça bozuk/yüklenemedi),
// pending (veri gelmiş olabilir ama henüz panelde görünmüyor / receipt yok)
// ve ok (sağlıklı, güncel). Yalnızca sabit kod + sabit güvenli metin üretir;
// ham network hatası, token veya kişisel ayrıntı asla dönmez. Panel
// gözlemcidir; bu fonksiyon hiçbir reminder preference / localStorage /
// app state yazmaz.
function reminderSystemStatusP(projectionState,sectionFetchState){
  var p=projectionState&&typeof projectionState==='object'?projectionState:null;
  var reason=p&&typeof p.reason==='string'?p.reason:'';
  var compatibility=p&&p.compatibility&&typeof p.compatibility==='object'?p.compatibility:{};
  var fetchFailed=!!(sectionFetchState&&typeof sectionFetchState==='object'&&sectionFetchState.ok===false);
  if(['schema_unsupported','manifest_unsupported','malformed','legacy'].indexOf(compatibility.code)>=0) return {code:'error',kind:'error',text:'Projection sürümü/manifesti uyumsuz · güncel asset veya yeniden oluşturma gerekiyor; güvenli fallback korunuyor.'};
  if(compatibility.code==='partial_rebuilt') return {code:'stale',kind:'warning',text:'Projection kısmi · eksik alanlar güncel manifest ile yeniden kuruldu; başarı iddiası yok.'};
  if(reason==='projection_invalid'||reason==='projection_parse_failed') return {code:'error',kind:'error',text:'Projeksiyon bozuk · önceki güvenli görünüm korunuyor.'};
  if(reason==='projection_stale') return {code:'stale',kind:'warning',text:'Kaynak veya projeksiyon eski · görünüm güncelmiş gibi sunulmuyor.'};
  if(fetchFailed||reason==='projection_load_failed') return {code:'unavailable',kind:'error',text:'Projeksiyon çekilemedi · önceki güvenli görünüm korunuyor.'};
  if(reason==='projection_missing'||reason==='projection_permission'||reason==='projection_network') return {code:'unavailable',kind:'muted',text:'Kaynak yok · projeksiyon henüz oluşmadı.'};
  if(reason==='receipt_missing') return {code:'pending',kind:'pending',text:'Senkron bekleniyor · veri gelmiş olabilir, henüz panelde görünmüyor.'};
  if(reason==='ready'||(p&&p.source==='projection')) return {code:'ok',kind:'ok',text:'Projeksiyon hazır ve güncel.'};
  return {code:'unavailable',kind:'muted',text:'Kaynak yok · projeksiyon henüz oluşmadı.'};
}
// REM-60: Reminder gözlem durumunu panelde KAYNAK, RECEIPT, CAPABILITY, PRIVACY
// ve CİHAZ (device acceptance) olarak AYRI boyutlara ayırır. Tek yeşil rozetle
// maskeleme yok: her boyut kendi evidence'ını taşır; bir boyutun "ok" olması
// diğerlerini ok yapmaz. Yalnızca sabit kod + sabit güvenli metin üretir; ham
// network hatası, token, kişisel ayrıntı, reminder category/schedule/body asla
// dönmez. Panel gözlemcidir; bu fonksiyonlar hiçbir reminder preference /
// localStorage / app state yazmaz.
//
// 8 ton deterministik olarak haritalanır (Görev 2): accepted, stale, pending,
// missing, projection_invalid, error, unsupported, redacted.
function reminderStatusToneMapP(code){
  var m={
    accepted:{kind:'ok',tone:'ok',cls:'b-ok',label:'Kabul edildi',icon:'✓'},
    stale:{kind:'warning',tone:'warning',cls:'b-warn',label:'Eski kaynak',icon:'△'},
    pending:{kind:'pending',tone:'pending',cls:'b-warn',label:'Bekliyor',icon:'◷'},
    missing:{kind:'muted',tone:'muted',cls:'b-dim',label:'Kaynak yok',icon:'·'},
    projection_invalid:{kind:'danger',tone:'danger',cls:'b-danger',label:'Projection bozuk',icon:'!'},
    error:{kind:'danger',tone:'danger',cls:'b-danger',label:'Hata',icon:'!'},
    unsupported:{kind:'muted',tone:'muted',cls:'b-dim',label:'Destek yok',icon:'·'},
    redacted:{kind:'ok',tone:'ok',cls:'b-ok',label:'Redacted korumalı',icon:'⌑'}
  };
  var x=m[code]||{kind:'muted',tone:'muted',cls:'b-dim',label:'Durum bekleniyor',icon:'·'};
  return {code:code,kind:x.kind,tone:x.tone,cls:x.cls,label:x.label,icon:x.icon};
}
// Receipt boyutu: uzak kabul receipt + revision kanıtı yalnızca 'accepted'
// tonunda başarı iddiası taşır. Eksik / hata / bekleme / yasak tonları ayrışır.
function reminderReceiptStatusP(receipt){
  var st=syncStatusP(receipt);
  var toneMap={accepted:'accepted',missing:'missing',receipt_missing:'pending',error:'error',conflict:'error',anti_clobber:'error',receipt_failed:'error',permission:'error',unauthorized:'error',forbidden:'error',not_found:'error',projection_failed:'error',projection_invalid:'error',network:'pending',rate_limited:'pending',offline:'pending',queued:'pending',saving:'pending',retrying:'pending',local_saved:'pending',idle:'missing'};
  var tone=reminderStatusToneMapP(toneMap[st.code]||'pending');
  return {code:st.code,tone:tone.code,kind:tone.kind,cls:tone.cls,label:tone.label,icon:tone.icon,text:st.code==='accepted'?'Uzak kabul receipt + revision kanıtı doğrulandı.':st.code==='receipt_missing'?'Uzak kabul receipt var ancak kanıt alanları eksik; başarı iddiası yok.':'Uzak kabul receipt bulunamadı; başarı iddiası yok.'};
}
// Capability boyutu: reminder tercih/oluşum/teslim cihaz yereldir (REM-53/REM-56).
// Panel ancak projection contract'ı (reminderCoverageVersion) mevcutsa yalnız
// redacted aggregate gözleyebilir; aksi hâlde capability doğrulanamaz.
function reminderCapabilityStatusP(projectionState){
  var p=projectionState&&typeof projectionState==='object'?projectionState:null;
  var snap=p&&p.snapshot&&typeof p.snapshot==='object'?p.snapshot:null;
  if(!snap||!snap.reminderCoverageVersion){
    var unsupported=reminderStatusToneMapP('unsupported');
    return {code:'unsupported',kind:unsupported.kind,tone:unsupported.tone,cls:unsupported.cls,label:unsupported.label,icon:unsupported.icon,text:'Reminder gözlemi için projection contract yok; capability doğrulanamaz.'};
  }
  var redacted=reminderStatusToneMapP('redacted');
  return {code:'redacted',kind:redacted.kind,tone:redacted.tone,cls:redacted.cls,label:redacted.label,icon:redacted.icon,text:'Reminder tercih/oluşum/teslim cihaz yerel; panel yalnız redacted aggregate gözler.'};
}
// Kaynak boyutu: reminderSystemStatusP'un 5 durumunu 8 tona eşler. Yalnız 'ok'
// → accepted tonu tazelik/başarı iddiası taşır; stale/error/pending/unavailable
// ayrı tonlarda ve metinde kalır.
function reminderSourceStatusP(projectionState,sectionFetchState){
  var sys=reminderSystemStatusP(projectionState,sectionFetchState);
  var fetchFailed=!!(sectionFetchState&&typeof sectionFetchState==='object'&&sectionFetchState.ok===false);
  var tone;
  if(sys.code==='ok') tone='accepted';
  else if(sys.code==='stale') tone='stale';
  else if(sys.code==='error') tone='projection_invalid';
  else if(sys.code==='pending') tone='pending';
  else tone=fetchFailed?'error':'missing';
  var t=reminderStatusToneMapP(tone);
  return {code:sys.code,tone:t.code,kind:t.kind,cls:t.cls,label:t.label,icon:t.icon,text:sys.text};
}
// Cihaz boyutu: S5 kullanıcı cihazı kabulü ajan tarafından üretilemez; her
// durumda 'pending' kalır ve başarı iddiası taşımaz.
function reminderDeviceAcceptanceStatusP(){
  var t=reminderStatusToneMapP('pending');
  return {code:'pending',kind:t.kind,tone:t.tone,cls:t.cls,label:'Cihaz kabulü doğrulanmadı',icon:t.icon,text:'Kullanıcı cihazı kabulü (S5) doğrulanmadı; ajan bu kanıtı üretemez.'};
}
// Privacy boyutu: status card hiçbir raw reminder category/schedule/body
// taşımaz; etiket her zaman yerel/redacted koruma iddiasıdır.
function reminderPrivacyStatusP(projectionState){
  var t=reminderStatusToneMapP('redacted');
  return {code:'redacted',kind:t.kind,tone:t.tone,cls:t.cls,label:'Yerel · redacted',icon:t.icon,text:'Hatırlatma raw ayrıntıları redacted; yalnız güvenli özet gösterilir.'};
}
// "Panelde reminder çalışıyor" iddiası (Görev 4): yalnız KAYNAK accepted +
// RECEIPT accepted + CAPABILITY (projection) mevcut olduğunda doğru olabilir.
// Aksi hâlde reason ile hangi kanıtın eksik olduğu açıkça söylenir; ok iddiası
// kullanılmaz.
function reminderWorkingClaimP(receipt,projectionState,sectionFetchState){
  var src=reminderSourceStatusP(projectionState,sectionFetchState);
  var rcpt=reminderReceiptStatusP(receipt);
  var cap=reminderCapabilityStatusP(projectionState);
  var ok=src.tone==='accepted'&&rcpt.tone==='accepted'&&cap.code==='redacted';
  var reason=src.tone!=='accepted'?'kaynak_kanit_yok':rcpt.tone!=='accepted'?'receipt_kanit_yok':cap.code!=='redacted'?'capability_kanit_yok':null;
  return {ok:ok,reason:reason};
}
// REM-60: Panel reminder durum kartını kaynak / receipt / capability / privacy /
// cihaz boyutlarına ayırarak render eder. Tek yeşil rozet maskelemesi yok: her
// boyut kendi badge + text + (kaynak/panel saati) taşır; working-claim yalnız
// üç kanıt birlikte varsa gösterilir. Status card raw reminder category,
// schedule veya body içermez (Görev 5).
function reminderStatusCardHTMLP(receipt,pollAt,projectionState,sectionFetchState){
  var d={
    source:reminderSourceStatusP(projectionState,sectionFetchState),
    receipt:reminderReceiptStatusP(receipt),
    capability:reminderCapabilityStatusP(projectionState),
    privacy:reminderPrivacyStatusP(projectionState),
    device:reminderDeviceAcceptanceStatusP()
  };
  var wc=reminderWorkingClaimP(receipt,projectionState,sectionFetchState);
  var snap=projectionState&&projectionState.snapshot&&typeof projectionState.snapshot==='object'?projectionState.snapshot:null;
  var builtAt=snap&&snap.projectionBuiltAt||null;
  var srcTime=d.source.tone==='accepted'&&builtAt?('projeksiyon · '+p3TimeP(builtAt)):(pollAt?('panel · '+tsShort(pollAt)):'—');
  var rcptAt=normalizeSyncReceiptP(receipt).acceptedAt;
  var rcptTime=d.receipt.tone==='accepted'&&rcptAt?('kabul · '+tsShort(rcptAt)):'—';
  function cell(kind,label,time,text){
    return '<div class="reminder-status-cell" data-reminder-dim="'+kind+'"><span class="reminder-status-cell-label">'+esc(label)+'</span><span class="reminder-status-cell-badge">'+panelStatusBadgeHTMLP(d[kind].label,d[kind].tone,d[kind].cls)+'</span><span class="reminder-status-cell-time">'+esc(time)+'</span><span class="reminder-status-cell-text">'+esc(text)+'</span></div>';
  }
  var claim=wc.ok
    ?'<div class="reminder-working-claim reminder-working-ok" data-reminder-working="ok" role="status" aria-live="polite">Reminder gözlemi çalışıyor · kaynak + receipt + projection kanıtı birlikte doğrulandı.</div>'
    :'<div class="reminder-working-claim reminder-working-pending" data-reminder-working="pending" role="status" aria-live="polite">Reminder çalışıyor iddiası yok · eksik kanıt: '+esc(wc.reason)+'.</div>';
  return '<section class="reminder-status-card" data-component="reminder-status-card" aria-label="Reminder gözlem durumu"><div class="reminder-status-head">'+panelStatusBadgeHTMLP('Reminder gözlem durumu','muted','b-dim')+'<span class="reminder-status-head-note">'+esc(d.source.text)+'</span></div><div class="reminder-status-grid">'+cell('source','Kaynak',srcTime,d.source.text)+cell('receipt','Receipt',rcptTime,d.receipt.text)+cell('capability','Capability',snap?'contract v1':'projection yok',d.capability.text)+cell('privacy','Privacy','yerel',d.privacy.text)+cell('device','Cihaz kabulü','—',d.device.text)+'</div>'+claim+'</section>';
}
function emptyStateNoteHTMLP(status){
  var r=emptyStateReasonP(status);
  return r?'<div class="p3-muted" data-component="empty-state-reason" data-empty-kind="'+r.kind+'">'+esc(r.text)+'</div>':'';
}
function p3SettingsSummaryP(settings){
  var t=settings&&settings.tracked||{}, labels={locationEnabled:'Konum',locationMode:'Konum modu',caffeineMode:'Kafein modu',targetBed:'Hedef uyku',hideLocationCard:'Konum kartı',hideRepoBanner:'Repo bandı',profileAssessmentInactive:'Profil pasif',aeonNotifyPermission:'ÆON bildirim',prayerMethod:'Namaz yöntemi',prayerRemindersEnabled:'Namaz hatırlatıcı',magnesiumEnabled:'Magnezyum'};
  var keys=Object.keys(labels), out=[];
  keys.forEach(function(k){ if(t[k]===null||t[k]===undefined) return; var v=typeof t[k]==='boolean'?(t[k]?'açık':'kapalı'):String(t[k]); out.push('<span><small>'+esc(labels[k])+'</small><b>'+esc(v)+'</b></span>'); });
  return out.length?'<div class="p3-settings-grid">'+out.join('')+'</div>':'<div class="p3-muted">İzinli ayar özeti yok.</div>';
}
// Saygı root/daily uyuşmazlık kodlarını (panelCoverageManifest.js'in ürettiği
// ham İngilizce/snake_case reason'lar) sade Türkçe cümlelere çevirir. Bilinmeyen
// bir kod gelirse (ör. manifest'e yeni bir reason eklenirse) ham kodu aynen
// gösterir — sessizce kaybolmaz, yalnızca henüz çevrilmemiş olur.
function saygiMismatchReasonTrP(code){
  var m={
    root_lastReadDate_daily_evidence_mismatch:'Kök kayıttaki son okuma tarihi, günlük kayıtlarla uyuşmuyor',
    root_streak_daily_evidence_mismatch:'Kök kayıttaki seri sayısı, günlük kayıtlardan hesaplanan seriyle uyuşmuyor',
    daily_person_not_in_root_collection:'Günlükte okunduğu görünen bir kişi kök koleksiyonda kayıtlı değil'
  };
  return m[code]||code;
}
function rootModulesCardHTMLP(){
  var s=PROJECTION.sections||{}, photo=s.dailyPhoto||{status:'missing'}, room=s.roomContentHistory||{status:'missing',records:[]}, sg=s.saygiRoot||{status:'missing',collectionCount:0}, nud=s.locNudge||{status:'missing'}, lt=s.locationTiming||{}, life=s.lifecycle||{};
  var h='<div class="card lift span-12 pad p3-root-card" style="order:6;display:flex;flex-direction:column;">';
  h+='<div class="lbl" style="display:flex;align-items:center;gap:7px;">'+icon('layers',14)+' Eksik Kök Modüller <span style="margin-left:auto;">'+p3BadgeP('canonical projection','source')+'</span></div>';
  h+='<p class="p3-muted" style="margin:2px 0 12px;">Aşağıdaki 6 kart, uygulamanın kök verisinde (fotoğraf, terapi geçmişi, Saygı, konum, ayarlar) ne olduğunu ve panelin bunu ne zaman/nasıl gördüğünü gösterir — dolu, eski veya eksik her durum aynı düzende görünür.</p>';
  h+='<div class="p3-grid">';
  h+='<div class="p3-module"><div class="p3-module-head"><b>Günün fotoğrafı</b>'+p3StatusP(photo.status)+'</div><div class="p3-muted" style="margin:-4px 0 6px;">Her gün otomatik seçilen, lisansı doğrulanmış bir fotoğraf.</div><div class="p3-source-row">'+p3BadgeP(photo.sourcePath||'data.dailyPhoto','source')+p3BadgeP(photo.privacy||'public metadata','privacy')+'</div>';
  if(photo.title) h+='<div class="p3-value">'+esc(photo.title)+'</div>';
  if(photo.artist) h+='<div class="p3-muted">'+esc(photo.artist)+'</div>';
  h+='<div class="p3-kv"><span>Lisans</span><b>'+esc(photo.license||'—')+'</b></div><div class="p3-kv"><span>Kaynak</span><b>'+esc(photo.source||'—')+'</b></div><div class="p3-kv"><span>Fetched</span><b>'+p3TimeP(photo.fetchedAt)+'</b></div>';
  if(photo.ready&&photo.pageUrl) h+='<a class="p3-link" href="'+esc(photo.pageUrl)+'" target="_blank" rel="noopener noreferrer">Kaynak sayfası →</a>';
  else h+='<div class="p3-warning">Hazır değil — lisans ve kaynak birlikte doğrulanmadı.</div>';
  if(photo.error) h+='<div class="p3-warning">'+esc(photo.error)+'</div>';
  h+='</div>';
  h+='<div class="p3-module"><div class="p3-module-head"><b>Terapi Odası geçmişi</b>'+p3StatusP(room.status)+stalenessBadgeP(room.latestShownAt)+'</div><div class="p3-muted" style="margin:-4px 0 6px;">Terapi Odası\'nda hangi içeriğin ne zaman gösterildiğinin kaydı.</div><div class="p3-source-row">'+p3BadgeP(room.sourcePath||'data.roomContentHistory','source')+p3BadgeP(room.privacy||'public metadata','privacy')+'</div><div class="p3-value">'+esc(String(room.count||0))+' gösterim · '+esc(String(room.invalidCount||0))+' bozuk</div>';
  (Array.isArray(room.records)?room.records.slice(0,4):[]).forEach(function(x){ h+='<div class="p3-history-row"><span>'+esc(x.day||'—')+' · '+esc(x.type||'öğe')+'</span><b>'+esc(x.title||'—')+'</b><small>'+esc(x.source||'kaynak yok')+' · '+p3TimeP(x.shownAt)+'</small></div>'; });
  if(!room.records||!room.records.length) h+=(emptyStateNoteHTMLP(room.status)||'<div class="p3-muted">Gösterim kaydı yok.</div>');
  h+='</div>';
  h+='<div class="p3-module"><div class="p3-module-head"><b>Saygı root · günlük kanıt</b>'+p3StatusP(sg.status)+stalenessBadgeP(sg.dailyLatestReadDate)+'</div><div class="p3-muted" style="margin:-4px 0 6px;">Saygı sekmesinde okunan kişi kaydının, günlük okuma kanıtıyla eşleştiğini doğrular.</div><div class="p3-source-row">'+p3BadgeP('root: data.saygi','source')+p3BadgeP('daily: days.*.saygi','source')+'</div><div class="p3-kpi-line"><b>'+esc(String(sg.collectionCount||0))+'</b><span>koleksiyon · root seri <b>'+esc(String(sg.rootStreak||0))+'</b></span></div><div class="p3-kv"><span>Root lastReadDate</span><b>'+esc(sg.rootLastReadDate||'—')+'</b></div><div class="p3-kv"><span>Daily son kanıt</span><b>'+esc(sg.dailyLatestReadDate||'—')+'</b></div><div class="p3-kv"><span>Daily türetilen seri</span><b>'+esc(String(sg.dailyDerivedStreak||0))+'</b></div>';
  if(sg.mismatch) h+='<div class="p3-warning">⚠ Root ve günlük read kanıtı uyuşmuyor: '+esc((sg.mismatchReasons||[]).map(saygiMismatchReasonTrP).join('; '))+'</div>';
  h+=emptyStateNoteHTMLP(sg.status)+'</div>';
  h+='<div class="p3-module"><div class="p3-module-head"><b>Konum nudge audit</b>'+p3StatusP(nud.status)+stalenessBadgeP(nud.lastShownAt)+'</div><div class="p3-muted" style="margin:-4px 0 6px;">Konumunu açman için gösterilen hatırlatmaların kaç kez görüldüğü ve ertelendiği.</div><div class="p3-source-row">'+p3BadgeP(nud.sourcePath||'data.locNudge','source')+p3BadgeP(nud.privacy||'behavior summary','privacy')+'</div><div class="p3-kpi-line"><b>'+esc(String(nud.shownCount||0))+'</b><span>gösterim · <b>'+esc(String(nud.dismissCount||0))+'</b> dismiss</span></div><div class="p3-kv"><span>Erteleme bitişi</span><b>'+p3TimeP(nud.snoozeUntil)+'</b></div><div class="p3-kv"><span>Türetilmiş backoff</span><b>'+esc(String(nud.derivedBackoffHours||0))+' saat</b></div><div class="p3-kv"><span>Opt-out</span><b>'+esc(nud.optOutDay||(!nud.optedOut?'yok':'aktif'))+'</b></div>'+emptyStateNoteHTMLP(nud.status)+'</div>';
  var ltStatus=lt.status||((lt.sampleTs||lt.processedTs)?'ok':'missing');
  h+='<div class="p3-module"><div class="p3-module-head"><b>Konum zaman ayrımı</b>'+p3StatusP(ltStatus)+stalenessBadgeP(lt.sampleTs||lt.processedTs)+'</div><div class="p3-muted" style="margin:-4px 0 6px;">Ham GPS koordinatı burada hiç görünmez — yalnızca konum örneğinin ne zaman alınıp işlendiği.</div><div class="p3-source-row">'+p3BadgeP('GPS track redacted','privacy')+p3BadgeP('timestamp-only','source')+'</div><div class="p3-kv"><span>Örnek</span><b>'+p3TimeP(lt.sampleTs)+'</b></div><div class="p3-kv"><span>İşlendi</span><b>'+p3TimeP(lt.processedTs)+'</b></div><div class="p3-kv"><span>Uzak kabul</span><b>'+p3TimeP(lt.syncAcceptedAt)+'</b></div>'+emptyStateNoteHTMLP(ltStatus)+'</div>';
  h+='<div class="p3-module"><div class="p3-module-head"><b>Yaşam döngüsü · ayarlar</b>'+p3StatusP(life.rootSavedAt||life.lastOpenedDate?'ok':'missing')+'</div><div class="p3-muted" style="margin:-4px 0 6px;">Uygulamanın en son ne zaman açıldığı ve hangi ayarların açık/kapalı olduğunun özeti.</div><div class="p3-source-row">'+p3BadgeP(life.sourcePath||'root metadata','source')+p3BadgeP('per-key audit yok','privacy')+'</div><div class="p3-kv"><span>Son açılan gün</span><b>'+esc(life.lastOpenedDate||'—')+'</b></div><div class="p3-kv"><span>Root savedAt</span><b>'+p3TimeP(life.rootSavedAt)+'</b></div><div class="p3-kv"><span>Ayar source zaman</span><b>'+p3TimeP(life.settings&&life.settings.changedAt)+'</b></div>'+p3SettingsSummaryP(life.settings)+'<div class="p3-muted">Ayar alanları projection’da izinli özet; tek tek değişiklik geçmişi kaynakta tutulmuyor.</div></div>';
  h+='</div><div class="p3-footnote">Kaynak değerleri ile türetilmiş durumlar ayrı tutulur; panel render’ı backfill yapmaz.</div></div>';
  return h;
}
function p4StageTextP(e){
  if(!e) return '';
  return esc(e.name||'event')+' · '+p3TimeP(e.at);
}
// Bugün terapi kaydı yoksa (thoughtCount 0) ama geçmişte bir kayıt varsa
// ("hiç yapılmamış" değil, "bugün yapılmamış") ayırt eden kısa not döner.
// Hiç kayıt yoksa (lastRecordedDate yok) null döner — mevcut boş durum korunur.
function therapyRecencyTextP(th){
  if(!th||th.thoughtCount||!th.lastRecordedDate) return null;
  var n=th.daysSinceLastRecord;
  return 'Bugün kayıt yok · son kayıt '+(n!=null?n+' gün önce':'geçmişte')+' ('+th.lastRecordedDate+')';
}
function p4ProvenanceCardHTMLP(){
  var s=PROJECTION.sections||{}, th=s.therapyProvenance||{status:'missing',thoughts:[],windDown:{status:'missing',events:[]}}, pp=s.profileProgress||{status:'missing'}, nt=s.notificationTimeline||{status:'missing',events:[],counts:{}}, ex=s.externalSources||{status:'missing',items:[]};
  var tc=th.consent||{}, dc=th.decision||null, sh=th.share||null, wd=th.windDown||{}, counts=nt.counts||{};
  var decisionLabel=dc?(dc.choice||'Seçim yok')+' · '+p3TimeP(dc.completedAt):'Kayıt yok';
  var shareLabel=sh?(sh.status||'Bekliyor')+' · '+p3TimeP(sh.sentAt):'Kayıt yok';
  var deliveredLabel=sh?p3TimeP(sh.deliveredAt):'—';
  var windDownLabel=wd.status==='missing'?'Kayıt yok':String(wd.eventCount||0)+' event · '+String(wd.totalMinutes||0)+' dk';
  var ntTimestamps=(Array.isArray(nt.events)?nt.events:[]).map(function(e){return e&&[e.createdAt,e.deliveredAt,e.readAt,e.retryAt];}).reduce(function(a,x){return a.concat(x||[]);},[]).filter(Boolean).sort(), ntLatest=ntTimestamps.length?ntTimestamps[ntTimestamps.length-1]:null;
  var h='<div class="card lift span-12 pad p4-audit-card" style="order:7;display:flex;flex-direction:column;">';
  h+='<div class="lbl" style="display:flex;align-items:center;gap:7px;">'+icon('shield-check',14)+' Terapi · Bildirim · Provenance <span style="margin-left:auto;">'+p3BadgeP('metadata-first projection','source')+'</span></div>';
  h+='<p class="p3-muted" style="margin:2px 0 12px;">Terapi Odası kullanımın, profil değerlendirmen, bildirimlerin ve dış kaynak (fotoğraf/hava) çekimlerinin NE ZAMAN gerçekleştiğinin kaydı — hassas metinler (düşünce içeriği, cevaplar) burada asla gösterilmez, yalnızca sayaç ve zaman damgası.</p><div class="p3-grid">';
  var thRecency=therapyRecencyTextP(th);
  h+='<div class="p3-module"><div class="p3-module-head"><b>Terapi araçları</b>'+p3StatusP(th.status)+'</div><div class="p3-muted" style="margin:-4px 0 6px;">Terapi Odası\'ndaki düşünce kaydı, karar ve paylaşım adımlarının ne zaman tamamlandığı — metin içeriği gizli kalır.</div><div class="p3-source-row">'+p3BadgeP(th.sourcePath||'data.days.*.therapy','source')+p3BadgeP(th.privacy||'sensitive redacted','privacy')+p3BadgeP('provenance: '+(th.provenance||'redacted'),'source')+'</div><div class="p3-kpi-line"><b>'+esc(String(th.thoughtCount||0))+'</b><span>düşünce · metin <b>redacted</b></span></div>'+(thRecency?'<div class="p3-muted">'+esc(thRecency)+'</div>':'');
  (Array.isArray(th.thoughts)?th.thoughts.slice(0,3):[]).forEach(function(x){ h+='<div class="p3-history-row"><span>Düşünce #'+esc(String(x.index||'—'))+' · '+esc(x.summary||'Metin redacted')+'</span><small>'+p3TimeP(x.createdAt)+' · '+esc(x.provenance||'redacted')+'</small></div>'; });
  h+='<div class="p3-kv"><span>Karar</span><b>'+esc(decisionLabel)+'</b></div><div class="p3-kv"><span>Karar notu</span><b>'+esc(dc?dc.noteStatus||'empty':'Kayıt yok')+'</b></div><div class="p3-kv"><span>Paylaşım</span><b>'+esc(shareLabel)+'</b></div><div class="p3-kv"><span>Teslim</span><b>'+esc(deliveredLabel)+'</b></div><div class="p3-kv"><span>Paylaşım notu</span><b>'+esc(sh?sh.noteStatus||'empty':'Kayıt yok')+'</b></div><div class="p3-kv"><span>Wind-down</span><b>'+esc(windDownLabel)+'</b></div><div class="p3-muted">Consent panel özeti: '+(tc.panelSummarySharingAccepted?'kabul edildi':'kayıtlı değil')+' · hassas metin varsayılan kapalı.</div></div>';
  h+='<div class="p3-module"><div class="p3-module-head"><b>Profil ilerlemesi</b>'+p3StatusP(pp.status)+'</div><div class="p3-muted" style="margin:-4px 0 6px;">174 maddelik bilimsel profil anketinin ne kadarının tamamlandığı — ham cevaplar burada asla görünmez.</div><div class="p3-source-row">'+p3BadgeP(pp.sourcePath||'data.profileAssessment','source')+p3BadgeP(pp.privacy||'sensitive redacted','privacy')+p3BadgeP('raw responses: redacted','privacy')+'</div><div class="p3-kpi-line"><b>'+esc(String(pp.responseCount||0))+'</b><span>cevap anahtarı · madde '+esc(pp.currentItemIndex===null||pp.currentItemIndex===undefined?'—':String(pp.currentItemIndex))+'</span></div><div class="p3-kv"><span>Başlangıç</span><b>'+p3TimeP(pp.startedAt)+'</b></div><div class="p3-kv"><span>Tamamlanma</span><b>'+p3TimeP(pp.completedAt)+'</b></div><div class="p3-kv"><span>Panel paylaşımı</span><b>'+esc(pp.consent&&pp.consent.panelSummarySharingAccepted?'kabul':'kapalı')+'</b></div><div class="p3-kv"><span>Summary</span><b>'+esc(pp.panelSummaryAvailable?'var':'yok')+'</b></div>'+emptyStateNoteHTMLP(pp.status)+'<div class="p3-footnote">Cevap değerleri DOM’a ve observer projection data alanına alınmaz.</div></div>';
  h+='<div class="p3-module"><div class="p3-module-head"><b>Bildirim yaşam döngüsü</b>'+p3StatusP(nt.status)+stalenessBadgeP(ntLatest)+'</div><div class="p3-muted" style="margin:-4px 0 6px;">Bir bildirimin oluşturulmasından okunmasına kadar geçtiği aşamaların (iletildi/okundu/silindi) sayımı.</div><div class="p3-source-row">'+p3BadgeP(nt.sourcePath||'data.notifications + data.aeon.qa','source')+p3BadgeP(nt.privacy||'metadata only','privacy')+p3BadgeP('observer receipt ayrı','source')+'</div><div class="p3-kpi-line"><b>'+esc(String(nt.count||0))+'</b><span>event · oluşturuldu '+esc(String(counts.created||0))+' · iletildi '+esc(String(counts.delivered||0))+' · okundu '+esc(String(counts.read||0))+'</span></div><div class="p3-kv"><span>Silindi</span><b>'+esc(String(counts.deleted||0))+'</b></div><div class="p3-kv"><span>Sync edildi</span><b>'+esc(String(counts.synced||0))+'</b></div><div class="p3-kv"><span>Retry/error</span><b>'+esc(String(counts.error||0))+'</b></div>';
  (Array.isArray(nt.events)?nt.events.slice(0,5):[]).forEach(function(e){ h+='<div class="p3-history-row"><span>'+p3StatusP(e.status)+' '+esc(e.kind||'notification')+' · '+esc(e.id||'—')+'</span><small>'+p4StageTextP(e.stages&&e.stages[0])+(e.readAt?' · okundu '+p3TimeP(e.readAt):' · iletildi '+p3TimeP(e.deliveredAt))+'</small></div>'; });
  h+='<div class="p3-kv"><span>Observer kabul</span><b>'+p3TimeP(nt.observerReceipt&&nt.observerReceipt.acceptedAt)+'</b></div>'+emptyStateNoteHTMLP(nt.status)+'</div>';
  h+='<div class="p3-module"><div class="p3-module-head"><b>Dış kaynak fetch</b>'+p3StatusP(ex.status)+'</div><div class="p3-muted" style="margin:-4px 0 6px;">Günün fotoğrafı ve hava durumu gibi dış kaynaklardan veri çekilirken oluşan hataların ayrı bir kayıt altında tutulduğu yer.</div><div class="p3-source-row">'+p3BadgeP(ex.sourcePath||'external fetch/cache metadata','source')+p3BadgeP(ex.privacy||'metadata','privacy')+p3BadgeP('provenance: external','source')+'</div>';
  (Array.isArray(ex.items)?ex.items:[]).forEach(function(x){ h+='<div class="p3-kv"><span>'+esc(x.name||'external')+'</span><b>'+p3StatusP(x.status)+stalenessBadgeP(x.fetchedAt)+(x.errorCode?' · '+esc(x.errorCode):'')+'</b></div><div class="p3-muted">'+esc(x.source||'external')+' · '+p3TimeP(x.fetchedAt)+'</div>'; });
  h+=emptyStateNoteHTMLP(ex.status)+'<div class="p3-footnote">Fetch hatası, veri yokmuş gibi değil; ayrı hata durumu ve kaynak zamanı olarak gösterilir.</div></div></div><div class="p3-footnote">Provenance sınıfları: user_input · derived · external · delivery · observer · redacted. Hassas terapi/profil metni varsayılan DOM yüzeyinde yoktur.</div></div>';
  return h;
}
function auditRollupStatusP(statuses){
  var list=Array.isArray(statuses)?statuses:[];
  if(list.some(function(x){return ['error','malformed','mismatch'].indexOf(x)>=0;})) return 'error';
  if(list.some(function(x){return ['stale','incomplete','pending'].indexOf(x)>=0;})) return 'incomplete';
  if(list.some(function(x){return ['ok','ready','active','completed'].indexOf(x)>=0;})) return 'ok';
  return 'missing';
}
function auditEntryHTMLP(){
  var s=PROJECTION.sections||{}, photo=s.dailyPhoto||{}, room=s.roomContentHistory||{}, sg=s.saygiRoot||{}, lt=s.locationTiming||{}, th=s.therapyProvenance||{}, pp=s.profileProgress||{}, nt=s.notificationTimeline||{}, ex=s.externalSources||{};
  var externalItems=Array.isArray(ex.items)?ex.items:[];
  var rootStatus=auditRollupStatusP([photo.status,room.status,sg.status,lt.status]);
  var provenanceStatus=auditRollupStatusP([th.status,pp.status,nt.status,ex.status]);
  var rows=[
    {icon:'layers',title:'Eksik Kök Modüller',status:rootStatus,summary:'Fotoğraf '+(photo.title||'bekliyor')+' · Terapi Odası '+String(room.count||0)+' gösterim · Saygı '+String(sg.collectionCount||0)+' kişi',meta:'Kaynak zamanı · '+p3TimeP(s.lifecycle&&s.lifecycle.rootSavedAt)},
    {icon:'shield-check',title:'Terapi · Bildirim · Provenance',status:provenanceStatus,summary:String(th.thoughtCount||0)+' düşünce özeti · profil '+String(pp.responseCount||0)+' cevap anahtarı · '+String(nt.count||0)+' bildirim event’i',meta:'Teslim '+String((nt.counts&&nt.counts.delivered)||0)+' · okundu '+String((nt.counts&&nt.counts.read)||0)+' · dış kaynak '+String(externalItems.filter(function(x){return x&&x.status==='error';}).length)+' hata'},
    {icon:'map-pin',title:'Konum kanıtı',status:auditRollupStatusP([lt.status]),summary:lt.sampleTs?'Son fix '+p3TimeP(lt.sampleTs):'Harita fix’i bekleniyor',meta:'GPS koordinatı projection’da redacted · harita fix’i yalnız panel belleğinde'}
  ];
  var h='<section class="card lift span-12 pad audit-entry" data-component="audit-entry" style="order:6;display:flex;flex-direction:column;">';
  h+='<div class="audit-entry-head"><div><div class="lbl" style="margin-bottom:3px;display:flex;align-items:center;gap:7px;">'+icon('layers',14)+' Denetim Merkezi</div><p>Üç hedef yüzey tek karar özetiyle burada; ayrıntı ve provenance sekmeli görünümde.</p></div><span class="p3-badge source source-observer" data-component="source-badge">canonical projection</span></div>';
  h+='<div class="audit-entry-grid">';
  rows.forEach(function(row){ h+='<div class="audit-entry-row"><span class="audit-entry-icon">'+icon(row.icon,15)+'</span><div class="audit-entry-copy"><div class="audit-entry-title"><b>'+esc(row.title)+'</b>'+p3StatusP(row.status)+'</div><span>'+esc(row.summary)+'</span><small>'+esc(row.meta)+'</small></div></div>'; });
  h+='</div><button type="button" class="btn audit-entry-btn" data-component="audit-entry-action" onclick="toggleAuditPage(true)">Ayrıntılı denetim yüzeyini aç <span aria-hidden="true">→</span></button>';
  h+='<div class="p3-footnote">Ham terapi/profil metni ve raw GPS projection’a girmez; panel yalnız izinli özetleri ve geçici harita fix’ini kullanır.</div></section>';
  return h;
}
function auditPaneHTMLP(tab){
  if(tab==='provenance') return p4ProvenanceCardHTMLP();
  if(tab==='modules') return d4ModuleAtlasHTMLP();
  if(tab==='events') return eventLogCardHTMLP();
  return rootModulesCardHTMLP();
}
function setAuditTab(tab){
  if(['root','provenance','modules','events'].indexOf(tab)<0) return;
  UI.auditTab=tab;
  try{ localStorage.setItem(AUDITTABKEY,tab); }catch(e){}
  var content=document.querySelector('.audit-content');
  if(!content){ render(); return; }
  content.innerHTML=auditPaneHTMLP(tab);
  var descEl=document.getElementById('audit-tab-desc');
  if(descEl) descEl.textContent=auditTabDescriptionP(tab);
  document.querySelectorAll('.audit-tab').forEach(function(button){
    var active=button.getAttribute('data-audit-tab')===tab;
    button.classList.toggle('active',active);
    button.setAttribute('aria-selected',active?'true':'false');
  });
  setTimeout(function(){ if(typeof initClampButtons==='function') initClampButtons(); },0);
}
window.setAuditTab=setAuditTab;
// Her Denetim Merkezi sekmesinin ne gösterdiğini tek cümleyle açıklar —
// sekme adı tek başına yeterince açıklayıcı değildi (kullanıcı geri
// bildirimi: "sekmelerin ne işe yaradığı anlaşılmıyor").
function auditTabDescriptionP(tab){
  var m={
    root:'Uygulamanın temel kayıtları (günün fotoğrafı, Terapi Odası geçmişi, Saygı okuma serisi, konum, ayarlar) burada — her biri güncel mi, eski mi, hiç mi kullanılmamış görürsün.',
    provenance:'Terapi/profil kullanımının ve bildirimlerin NE ZAMAN gerçekleştiği burada özetlenir — hassas metinler (düşünce, cevap) hiçbir zaman gösterilmez, yalnızca sayaç ve zaman.',
    modules:'Yukarıdaki iki sekmenin özetini tek bir karşılaştırılabilir karta indirger — her kartta "asıl kaynak ne diyor" (canonical) ile "çapraz kontrol ne diyor" yan yana.',
    events:'Panelde görünen her değişikliğin (senkron, bildirim, terapi kaydı vb.) kronolojik günlüğü — hangi değişiklik ne zaman, hangi cihazdan geldi.'
  };
  return m[tab]||'';
}
function auditPageHTMLP(){
  var tabs=[['root','Eksik Kök Modüller','layers'],['provenance','Terapi · Bildirim · Provenance','shield-check'],['modules','Eksik ve Özet Modüller','target'],['events','Event Günlüğü','activity']];
  var h='<div class="page audit-page"><section class="audit-page-shell">';
  h+='<div class="audit-page-head"><div><span class="drawer-kicker">Observer coverage</span><h1>Denetim Merkezi</h1><p>Her yüzey tek karar, kaynak zamanı, durum ve güvenli ayrıntı sınırıyla okunur.</p></div><button type="button" class="btn" onclick="toggleAuditPage(false)">Panele dön</button></div>';
  h+='<div class="audit-tabs" role="tablist" aria-label="Denetim sekmeleri">'+tabs.map(function(item){ return '<button type="button" role="tab" data-audit-tab="'+item[0]+'" aria-controls="audit-content" aria-selected="'+(UI.auditTab===item[0]?'true':'false')+'" class="audit-tab '+(UI.auditTab===item[0]?'active':'')+'" onclick="setAuditTab(\''+item[0]+'\')">'+icon(item[2],14)+' '+item[1]+'</button>'; }).join('')+'</div>';
  h+='<p class="p3-muted" id="audit-tab-desc" style="margin:8px 0 0;">'+esc(auditTabDescriptionP(UI.auditTab))+'</p>';
  h+='<div id="audit-content" class="audit-content" role="tabpanel" aria-live="polite">'+auditPaneHTMLP(UI.auditTab)+'</div>';
  h+='</section></div>';
  return h;
}
function toggleAuditPage(show){
  var page=document.querySelector('.page'), currentScroll=page?page.scrollTop:0;
  if(show){ UI.auditReturnScroll=currentScroll; UI.showAuditPage=true; render(); return; }
  var restore=Number(UI.auditReturnScroll)||0;
  UI.showAuditPage=false; UI.d4SelectedModule=null; render();
  var restoreScroll=function(){ var next=document.querySelector('.page'); if(next) next.scrollTop=restore; };
  if(typeof requestAnimationFrame==='function') requestAnimationFrame(restoreScroll); else setTimeout(restoreScroll,0);
}
window.toggleAuditPage=toggleAuditPage;
// D2.1 (PANEL-DENETIM-MERKEZI-PROMPTLARI.md §5) — audit apparatus'un tam
// sayfa görünümüne (auditPageHTMLP/toggleAuditPage, YUKARIDA, DEĞİŞMEDİ)
// gizli bir ikinci giriş yolu. Görünür hiçbir buton/link yok; localStorage'a
// iz bırakmaz, yalnızca bellekte (UI) tutulur, sayfa yenilenince sıfırlanır.
function devLogoTapP(){
  var now=Date.now();
  if(!UI.devTapCount||now-UI.devTapFirstAt>5000){ UI.devTapCount=1; UI.devTapFirstAt=now; return; }
  UI.devTapCount++;
  if(UI.devTapCount>=5){ UI.devTapCount=0; UI.devTapFirstAt=0; toggleAuditPage(true); }
}
window.devLogoTapP=devLogoTapP;
function initDevModeUrlTriggerP(){
  try{
    if(typeof location==='undefined'||typeof URLSearchParams==='undefined') return;
    if(new URLSearchParams(location.search).get('debug')==='1') toggleAuditPage(true);
  }catch(e){}
}
function d4SafeTimeP(v){ return v?String(v).slice(0,16).replace('T',' '):'—'; }
function d4LatestTimeP(values){
  var valid=(Array.isArray(values)?values:[]).filter(function(v){return !!v;}).map(String).sort();
  return valid.length?d4SafeTimeP(valid[valid.length-1]):'—';
}
function d4CoverageBadgeP(mode){
  var m=['full','summary','redacted','missing'].indexOf(mode)>=0?mode:'summary', labels={full:'Tam',summary:'Özet',redacted:'Redacted',missing:'Eksik'};
  return '<span class="d4-coverage-badge d4-coverage-'+m+'" data-component="coverage-badge" data-coverage="'+m+'">'+labels[m]+'</span>';
}
function d4ModuleDescriptorsP(){
  var s=PROJECTION.sections||{}, th=s.therapyProvenance||{status:'missing',thoughts:[],consent:{}}, pp=s.profileProgress||{status:'missing',consent:{}}, nt=s.notificationTimeline||{status:'missing',events:[],counts:{}}, photo=s.dailyPhoto||{status:'missing'}, sg=s.saygiRoot||{status:'missing'}, nud=s.locNudge||{status:'missing'}, lt=s.locationTiming||{status:'missing'}, archives=s.archives||{};
  var q=typeof quranJourneyRootP==='function'?quranJourneyRootP():null, reqs=q&&q.requests&&typeof q.requests==='object'?q.requests:{}, reqIds=Object.keys(reqs), qDelivered=0, qNotes=0, qWaiting=0, qLatest=[];
  reqIds.forEach(function(id){ var r=reqs[id]||{}; if(/^[A-Za-z0-9_-]{11}$/.test(String(r.videoId||''))) qDelivered++; if(Array.isArray(r.notes)) qNotes+=r.notes.length; if(r.status==='waiting'||r.status==='requested') qWaiting++; qLatest.push(r.updatedAt||r.requestedAt||r.createdAt); });
  var qErrors=typeof quranDeliveryErrorsP==='function'?quranDeliveryErrorsP():[], qStatus=!q?'missing':qErrors.length?'error':reqIds.length?'ok':'missing';
  var thStatus=th.status==='malformed'||pp.status==='malformed'?'malformed':(th.status==='missing'&&pp.status==='missing'?'missing':(th.status==='missing'||pp.status==='missing'?'incomplete':(th.status==='stale'||pp.status==='stale'?'stale':'ok')));
  var nCounts=nt.counts||{}, nLatest=(Array.isArray(nt.events)?nt.events:[]).map(function(e){return e&&[e.createdAt,e.deliveredAt,e.readAt,e.retryAt];}).reduce(function(a,x){return a.concat(x||[]);},[]);
  var locationStatus=lt.status==='malformed'||nud.status==='malformed'?'malformed':(lt.status==='missing'&&nud.status==='missing'?'missing':(lt.status==='stale'?'stale':'ok'));
  var soul=D&&D.soulArchive&&Array.isArray(D.soulArchive.items)?D.soulArchive.items:[];
  // Seans/dakika sayısı, KPI kartıyla (Zihin-Beden Arşivi) AYNI kaynaktan
  // (ham günlük seans listesi) türetilir — D.soulArchive.items'ın kendi
  // sayaçları burada KULLANILMAZ, aksi halde iki yüzey birbirinden farklı
  // toplam gösterebilir (kullanıcı geri bildirimi: "174 nereden çıkıyor").
  var soulAllSessions=(typeof allSoulArchiveSessionsP==='function')?allSoulArchiveSessionsP():[];
  var soulSessions=soulAllSessions.length, soulMinutes=soulAllSessions.reduce(function(a,s){ var m=Number(s&&s.duration); return a+((isNaN(m)||m<0)?0:m); },0);
  var lib=archives.library&&Array.isArray(archives.library.books)?archives.library.books:[], watch=archives.watchlist&&Array.isArray(archives.watchlist.items)?archives.watchlist.items:[], music=archives.music&&Array.isArray(archives.music.items)?archives.music.items:[], archiveTotal=lib.length+watch.length+music.length;
  var archiveStatus=(soul.length||archiveTotal)?'ok':'missing';
  var thRecency=therapyRecencyTextP(th), thRows=[['Consent',pp.consent&&pp.consent.panelSummarySharingAccepted?'kabul':'kapalı'],['Profil durumu',pp.status||'missing'],['Ham yanıtlar','redacted'],['Terapi zaman damgası',d4SafeTimeP(th.date)]];
  if(thRecency) thRows.push(['Son terapi kaydı',thRecency]);
  return [
    {key:'therapy-profile',title:'Terapi + Profil',icon:'heart-pulse',decision:'Hassas ilerleme hangi izin ve redaction sınırında?',status:thStatus,coverage:thStatus==='missing'?'missing':'redacted',source:'data.days.*.therapy + data.profileAssessment',time:d4LatestTimeP([th.date,pp.startedAt,pp.completedAt]),privacy:'sensitive_redacted',summary:(thRecency||((th.thoughtCount||0)+' güvenli terapi özeti · '+(pp.responseCount||0)+' profil yanıt anahtarı')),canonical:'Profil ilerlemesi · '+(pp.responseCount||0)+' yanıt',crossCheck:'Terapi düşünce sayısı · '+(th.thoughtCount||0),rows:thRows,note:'Hassas metin, ham yanıt ve karar notu bu kart/drawer yüzeyine alınmaz.'},
    {key:'notification-delivery',title:'Bildirim Teslimatı',icon:'bell',decision:'Bildirim hangi aşamada ve retry/error gerekiyor mu?',status:nt.status||'missing',coverage:nt.status==='missing'?'missing':'summary',source:nt.sourcePath||'data.notifications + data.aeon.qa',time:d4LatestTimeP(nLatest),privacy:nt.privacy||'metadata_only',summary:(nt.count||0)+' event · '+(nCounts.delivered||0)+' iletildi · '+(nCounts.error||0)+' hata',canonical:'Bildirim event sayısı · '+(nt.count||0),crossCheck:'İletildi/okundu/error · '+(nCounts.delivered||0)+' / '+(nCounts.read||0)+' / '+(nCounts.error||0),rows:[['Oluşturuldu',String(nCounts.created||0)],['İletildi',String(nCounts.delivered||0)],['Okundu',String(nCounts.read||0)],['Retry/error',String(nCounts.error||0)]],note:'Bildirim içeriği değil; yalnız lifecycle metadata ve kaynak zamanı gösterilir.'},
    {key:'quran-delivery',title:'Kur’an Teslimatı',icon:'book-open',decision:'İstek, video teslimi ve not zinciri nerede?',status:qStatus,coverage:qStatus==='missing'?'missing':qStatus==='ok'?'full':'summary',source:'data.quranJourney + delivery/response metadata',time:d4LatestTimeP(qLatest),privacy:'summary',summary:reqIds.length+' istek · '+qDelivered+' video · '+qNotes+' not · '+qWaiting+' bekliyor',canonical:'Kullanıcıya teslim video · '+qDelivered,crossCheck:'İstek / not / bekleyen · '+reqIds.length+' / '+qNotes+' / '+qWaiting,rows:[['İstek',String(reqIds.length)],['Teslim video',String(qDelivered)],['Not metadata',String(qNotes)],['Delivery error',String(qErrors.length)]],note:'Kur’an kartı ve panel işlemleri latest full-replace zincirine bağlanmaz; güvenli transport/outbox sınırı korunur.'},
    {key:'saygi-evidence',title:'Saygı Kanıtı',icon:'heart-handshake',decision:'Root collection ve günlük evidence aynı seriyi doğruluyor mu?',status:sg.status||'missing',coverage:sg.status==='missing'?'missing':'summary',source:sg.sourcePath||'data.saygi + data.days.*.saygi',time:d4LatestTimeP([sg.rootLastReadDate,sg.dailyLatestReadDate]),privacy:sg.privacy||'public_metadata',summary:(sg.collectionCount||0)+' kişi · root seri '+(sg.rootStreak||0)+' · daily kanıt '+(sg.dailyEvidenceCount||0),canonical:'Root collection · '+(sg.collectionCount||0),crossCheck:'Daily evidence / derived streak · '+(sg.dailyEvidenceCount||0)+' / '+(sg.dailyDerivedStreak||0),rows:[['Root lastReadDate',sg.rootLastReadDate||'—'],['Daily son kanıt',sg.dailyLatestReadDate||'—'],['Root seri',String(sg.rootStreak||0)],['Türetilmiş seri',String(sg.dailyDerivedStreak||0)]],note:sg.mismatch?'Root ve daily kanıt uyuşmazlığı ayrı alarm olarak korunuyor.':'Root ve daily kanıt aynı projection içinde karşılaştırılıyor.'},
    {key:'daily-photo',title:'Günün Fotoğrafı',icon:'image',decision:'Fotoğraf kaynağı, lisansı ve cache’i yayınlanabilir mi?',status:photo.status||'missing',coverage:photo.status==='missing'?'missing':photo.ready?'full':'summary',source:photo.sourcePath||'data.dailyPhoto · Wikimedia cache',time:d4SafeTimeP(photo.fetchedAt),privacy:photo.privacy||'public_metadata',summary:photo.title||'Fotoğraf metadata’sı bekleniyor',canonical:'Fotoğraf hazır · '+(photo.ready?'evet':'hayır'),crossCheck:'Cache · '+(photo.cacheState||'empty')+' · lisans '+(photo.license||'—'),rows:[['Başlık',photo.title||'—'],['Lisans',photo.license||'—'],['Kaynak',photo.source||'—'],['Cache',photo.cacheState||'empty'],['Fetched',d4SafeTimeP(photo.fetchedAt)]],note:photo.error?'Kaynak hatası hazır içerik gibi gösterilmiyor.':'Lisans + kaynak + zaman birlikte doğrulanmadan hazır iddiası yok.'},
    {key:'location-audit',title:'Konum Audit',icon:'map-pin',decision:'Konum izni, nudge davranışı ve son fix hangi aşamada?',status:locationStatus,coverage:locationStatus==='missing'?'missing':'redacted',source:'data.settings + data.locNudge + timestamp-only location',time:d4LatestTimeP([lt.sampleTs,lt.processedTs,lt.syncAcceptedAt,nud.lastShownAt]),privacy:lt.privacy||'timestamp_only',summary:(nud.shownCount||0)+' nudge · '+(nud.dismissCount||0)+' dismiss · son fix '+d4SafeTimeP(lt.sampleTs),canonical:'Son fix örneği · '+d4SafeTimeP(lt.sampleTs),crossCheck:'İşlendi / uzak kabul · '+d4SafeTimeP(lt.processedTs)+' / '+d4SafeTimeP(lt.syncAcceptedAt),rows:[['Nudge gösterim',String(nud.shownCount||0)],['Dismiss',String(nud.dismissCount||0)],['Snooze',d4SafeTimeP(nud.snoozeUntil)],['Örnek',d4SafeTimeP(lt.sampleTs)],['İşlendi',d4SafeTimeP(lt.processedTs)]],note:'GPS koordinatı ve raw track yok; yalnız izin/davranış ve zaman metadata’sı gösterilir.'},
    {key:'archives-provenance',title:'Zihin-Beden + Arşiv',icon:'archive',decision:'Arşivlerin canonical metriği ve provenance zamanı ne söylüyor?',status:archiveStatus,coverage:archiveStatus==='missing'?'missing':'summary',source:'data.soulArchive + library/watchlist/music',time:d4LatestTimeP(soul.map(function(x){return x&&[x.lastAt,x.startedAt];}).reduce(function(a,x){return a.concat(x||[]);},[])),privacy:'metadata_summary',summary:soulSessions+' seans · '+soulMinutes+' dk · '+archiveTotal+' arşiv öğesi',canonical:'Zihin-Beden seans · '+soulSessions,crossCheck:'Kütüphane / izleme / dinleme · '+lib.length+' / '+watch.length+' / '+music.length,rows:[['Seans',String(soulSessions)],['Dakika',String(soulMinutes)],['Kütüphane',String(lib.length)],['İzleme',String(watch.length)],['Dinleme',String(music.length)]],note:'Arşiv içerik metni değil; provenance, sayaç ve kaynak zamanları özetlenir.'}
  ];
}
function d4ModuleDrawerHTMLP(module){
  if(!module) return '';
  var h='<div class="d4-drawer-backdrop" data-component="detail-drawer" data-open="true" role="presentation" onclick="if(event.target===this)closeD4ModuleDrawerP()">';
  h+='<aside id="d4-module-drawer" class="detail-drawer d4-drawer-panel" role="dialog" aria-modal="true" aria-labelledby="d4-drawer-title" aria-describedby="d4-drawer-desc" tabindex="-1" onkeydown="eventDrawerKeydownP(event)">';
  h+='<div class="d4-drawer-head"><div><span class="drawer-kicker">D4 modül ayrıntısı</span><h2 id="d4-drawer-title">'+esc(module.title)+'</h2></div><button type="button" class="btn d4-drawer-close" onclick="closeD4ModuleDrawerP()" aria-label="'+esc(module.title)+' ayrıntısını kapat">×</button></div>';
  h+='<p id="d4-drawer-desc" class="d4-drawer-decision">'+esc(module.decision)+'</p><div class="d4-drawer-status-row">'+p3StatusP(module.status)+' '+p3BadgeP(module.source,'source')+' '+p3BadgeP(module.privacy,'privacy')+' '+d4CoverageBadgeP(module.coverage)+'</div>';
  h+='<div class="d4-drawer-summary"><span>Güvenli özet</span><b>'+esc(module.summary)+'</b></div><div class="d4-drawer-grid">';
  (Array.isArray(module.rows)?module.rows:[]).forEach(function(row){ h+='<div class="d4-drawer-cell"><span>'+esc(row[0])+'</span><b>'+esc(row[1])+'</b></div>'; });
  h+='</div><div class="d4-drawer-proof"><b>Canonical metric</b><span>'+esc(module.canonical)+'</span><b>Cross-check</b><span>'+esc(module.crossCheck)+'</span><b>Kaynak zamanı</b><span>'+esc(module.time)+'</span></div><div class="d4-drawer-note">'+esc(module.note)+'</div></aside></div>';
  return h;
}
function d4ModuleAtlasHTMLP(){
  var modules=d4ModuleDescriptorsP(), selected=null;
  if(UI.d4SelectedModule) selected=modules.find(function(x){return x.key===UI.d4SelectedModule;})||null;
  var h='<section class="card lift span-12 pad d4-module-atlas" data-component="module-atlas" aria-labelledby="d4-module-atlas-title">';
  h+='<div class="d4-atlas-head"><div><span class="drawer-kicker">Observer coverage</span><h2 id="d4-module-atlas-title">Eksik ve özet modüller</h2><p>Her modül tek canonical metric, kaynak zamanı, durum ve güvenli ayrıntı yüzeyi taşır.</p></div><span class="d4-atlas-count">'+modules.length+' modül · metadata-first</span></div><div class="d4-module-grid">';
  modules.forEach(function(m){ var moduleKeyArg=String(m.key==null?'':m.key).replace(/\\/g,'\\\\').replace(/"/g,'\\"').replace(/\r/g,'\\r').replace(/\n/g,'\\n'); h+='<article class="d4-module-card d4-module-status-'+esc(m.status||'unknown')+'" data-component="module-card" data-module="'+esc(m.key)+'"><div class="d4-module-card-head"><span class="d4-module-icon">'+icon(m.icon,17)+'</span><div><h3>'+esc(m.title)+'</h3><p>'+esc(m.decision)+'</p></div>'+p3StatusP(m.status)+'</div><div class="d4-module-badges">'+p3BadgeP(m.source,'source')+p3BadgeP(m.privacy,'privacy')+d4CoverageBadgeP(m.coverage)+'</div><div class="d4-module-summary">'+esc(m.summary)+'</div><div class="d4-module-meta"><span>'+esc(m.time)+'</span><span class="d4-canonical-label">Canonical metric</span><b>'+esc(m.canonical)+'</b></div><div class="d4-module-cross">Cross-check · '+esc(m.crossCheck)+'</div><button type="button" class="d4-module-detail" aria-controls="d4-module-drawer" aria-expanded="'+(UI.d4SelectedModule===m.key?'true':'false')+'" onclick=\'openD4ModuleDrawerP("'+esc(moduleKeyArg)+'",this)\'>Ayrıntıyı aç <span aria-hidden="true">→</span></button></article>'; });
  h+='</div>';
  if(selected) h+=d4ModuleDrawerHTMLP(selected);
  h+='<p class="d4-atlas-foot">Dolu, eski, eksik, bozuk ve redacted durumlar aynı kart sözleşmesiyle fail-closed gösterilir. Panel render’ı source data’yı backfill etmez.</p></section>';
  return h;
}
function openD4ModuleDrawerP(key,trigger){
  D4_DRAWER_RETURN_ID=trigger&&trigger.closest?((trigger.closest('[data-module]')||{}).getAttribute?((trigger.closest('[data-module]')||{}).getAttribute('data-module')):null):null;
  UI.d4SelectedModule=String(key||''); render();
  setTimeout(function(){ if(typeof document==='undefined') return; var root=document.getElementById('d4-module-drawer'), focusables=eventDrawerFocusableP(root), el=focusables[0]||root; if(el&&typeof el.focus==='function') el.focus(); },0);
}
window.openD4ModuleDrawerP=openD4ModuleDrawerP;
function closeD4ModuleDrawerP(){
  var returnKey=D4_DRAWER_RETURN_ID; UI.d4SelectedModule=null; D4_DRAWER_RETURN_ID=null; render();
  setTimeout(function(){ if(!returnKey||typeof document==='undefined') return; var el=document.querySelector('[data-component="module-card"][data-module="'+returnKey+'"] .d4-module-detail'); if(el&&typeof el.focus==='function') el.focus(); },0);
}
window.closeD4ModuleDrawerP=closeD4ModuleDrawerP;
function eventLogSourceP(){
  var s=EVENT_LOG_STATE||{};
  if(s.source==='event_files') return {cls:'b-ok',label:'Günlük event dosyaları',note:'Canonical append-only günlük kayıtlar okunuyor.'};
  if(s.source==='latest_fallback') return {cls:'b-warn',label:'Latest fallback',note:'Günlük event dosyası yok; latest snapshot recent projection gösteriliyor.'};
  if(s.source==='error') return {cls:'b-danger',label:'Event log okunamadı',note:'Event kaynağı bozuk veya erişilemez; legacy snapshot çalışmaya devam ediyor.'};
  return {cls:'b-dim',label:'Event log yok',note:'Legacy snapshot kullanılabilir; henüz canonical event kaydı alınmadı.'};
}
function eventStatusP(e){
  var code=String(e&&(e.lastErrorCode||e.status||e.syncStatus)||'').toLowerCase();
  if(/conflict|anti[_ -]?clobber|error|failed|forbidden|unauthor/.test(code)) return {cls:'b-danger',kind:'danger',label:'Dikkat gerekli'};
  if(/stale|old|out[_ -]?of[_ -]?date/.test(code)) return {cls:'b-warn',kind:'warning',label:'Eski görünüm'};
  if(e&&e.acceptedAt) return {cls:'b-ok',label:'Uzak kabul'};
  if(e&&e.submittedAt) return {cls:'b-warn',label:'Gönderildi'};
  return {cls:'b-dim',label:'Yerel'};
}
function eventCategoryDefsP(){
  return [
    ['all','Tümü','Tüm alanlardan gelen son kayıtlar'],
    ['attention','Dikkat gereken','Hata, eski görünüm veya kabul kanıtı eksik kayıtlar'],
    ['sync','Senkronizasyon','Makbuz, retry, merge ve uzak kabul zinciri'],
    ['therapy-profile','Terapi & profil','Terapi araçları ve profil ilerlemesi'],
    ['quran-video','Kur’an & içerik','Kur’an, okuma, izleme ve içerik akışı'],
    ['communication','İletişim & bildirim','ÆON mesajları ve bildirim teslimatı'],
    ['reminder','Reminder','Reminder yaşam döngüsü (metadata-only)'],
    ['user','Kullanıcı kayıtları','Günlük yaşamda kullanıcının kaydettiği alanlar'],
    ['derived','Otomatik özet','Panelin veya uygulamanın türettiği özetler'],
    ['external','Dış kaynak','Hava, fotoğraf ve dış servis fetch kayıtları']
  ];
}
function eventPathLabelP(path){
  var raw=String(path||'data'), normalized=raw.replace(/^data\.days\.\*\.?/,'').replace(/^data\./,'');
  var labels={mood:'Ruh hali',journal:'Günlük',note:'Not',intention:'Niyet',gratitude:'Şükür',water:'Su',energy:'Enerji',stress:'Stres',sleep:'Uyku',meals:'Beslenme',mealItems:'Beslenme kalemleri',movement:'Hareket',location:'Konum',locationHistory:'Konum geçmişi',therapy:'Terapi',thoughts:'Düşünceler',decision:'Karar',share:'Paylaşım',firstStep:'İlk adım',selfCompassion:'Öz şefkat',dailyWin:'Günlük kazanım',windDown:'Uykuya geçiş',profileAssessment:'Profil değerlendirmesi',notifications:'Bildirimler',aeon:'ÆON sohbeti',quranJourney:'Kur’an yolculuğu',library:'Kütüphane',watchlist:'İzleme',music:'Dinleme',settings:'Ayarlar',syncReceipt:'Senkron makbuzu',eventLog:'Event günlüğü',weather:'Hava',fetch:'Fetch durumu',dailyPhoto:'Günün fotoğrafı',saygi:'Saygı',zikr:'Zikir',soulArchive:'Zihin-Beden'};
  var parts=normalized.split('.').filter(function(x){return x&&x!=='*';}), mapped=parts.map(function(x){return labels[x]||x;});
  if(raw.indexOf('data.days.')===0) return 'Günlük / '+(mapped[0]||'alan');
  return mapped.join(' / ')||raw;
}
function eventOperationLabelP(operation){
  var labels={create:'Oluşturuldu',record:'Kaydedildi',update:'Güncellendi',delete:'Silindi',complete:'Tamamlandı',accepted:'Kabul edildi',retry:'Yeniden denendi',merge:'Birleştirildi',sync_submitted:'Senkrona gönderildi'};
  return labels[String(operation||'').toLowerCase()]||'İşlendi';
}
function eventChangeDescriptorP(e){
  var path=eventPathLabelP(e&&e.path), subject=path.split(' / ').pop()||'Kayıt', operation=eventOperationLabelP(e&&e.operation);
  var detail=String(e&&e.detail||''), value=String(e&&e.value||''), unit=String(e&&e.unit||'');
  var reminderAction=reminderEventActionP(e), title;
  if(reminderAction) title='Reminder '+reminderEventLabelP(e);
  else if(detail&&value) title=detail+': '+value+(unit?' '+unit:'')+' '+operation.toLocaleLowerCase('tr-TR');
  else if(detail) title=detail+' '+operation.toLocaleLowerCase('tr-TR');
  else title=subject+' '+operation.toLocaleLowerCase('tr-TR');
  return {title:title,pathLabel:path,operationLabel:operation,detail:detail,value:value,unit:unit};
}
function eventClassificationP(e){
  var section=String(e&&e.section||'').toLowerCase(), path=String(e&&e.path||'').toLowerCase(), source=String(e&&(e.source||e.sourceType||e.provenance)||'').toLowerCase(), text=[section,path,source,e&&e.operation,e&&e.summary].join(' ');
  if(isReminderEventP(e)) return {key:'reminder',label:'Reminder',description:'Reminder yaşam döngüsü (metadata-only)'};
  if(/external|wikipedia|wikimedia|youtube|fetch|remote/.test(source)||/external|fetch|weather|dailyphoto|wikimedia/.test(path)) return {key:'external',label:'Dış kaynak',description:'Dış servis veya cache kaydı'};
  if(/derived|projection|inferred|computed/.test(source)||/projection|summary|trend|continuity|backoff/.test(text)) return {key:'derived',label:'Otomatik özet',description:'Türetilmiş panel veya uygulama özeti'};
  if(/therapy|terapi|profile|profil|thought|reflection|room/.test(text)) return {key:'therapy-profile',label:'Terapi & profil',description:'Terapi ve profil ilerlemesi'};
  if(/notification|bildirim|message|mesaj|communication|ileti|aeon|inbox|outbox/.test(text)) return {key:'communication',label:'İletişim & bildirim',description:'Mesaj ve bildirim teslimatı'};
  if(section==='sync'||/sync|receipt|revision|retry|merge|accepted|submit|persist|poll|event/.test(text)) return {key:'sync',label:'Senkronizasyon',description:'Kayıt ve uzak kabul zinciri'};
  if(/quran|kur.?an|video|watch|reading|listening|library|watchlist|music/.test(text)) return {key:'quran-video',label:'Kur’an & içerik',description:'Kur’an ve içerik akışı'};
  return {key:'user',label:'Kullanıcı kayıtları',description:'Kullanıcının uygulamaya kaydettiği alan'};
}
function eventTimeP(v){ return v?p3TimeP(v):'—'; }
function safeEventSummaryP(e){
  var raw=String(e&&e.summary||'Güvenli kayıt özeti');
  var allowed={
    'Kriz desteği kaydı güncellendi':1,
    'Yansıtma/pratik kaydı güncellendi':1,
    'İçerik/arşiv kaydı güncellendi':1,
    'Profil ilerlemesi güncellendi':1,
    'Bildirim yaşam döngüsü güncellendi':1,
    'Konum/hareket kaydı güncellendi':1,
    'İman/okuma kaydı güncellendi':1,
    'Uyku/beden kaydı güncellendi':1,
    'Beslenme kaydı güncellendi':1,
    'Ayarlar güncellendi':1,
    'Uygulama kaydı güncellendi':1,
    'Güvenli kayıt özeti':1
  };
  return allowed[raw]&&!/ghp_|github_pat_|sk-[a-z0-9]|api[_ -]?key|lat(?:itude)?\s*[:=]|lon(?:gitude)?\s*[:=]|profile[_ -]?raw|raw[_ -]?response|base64|bearer\s+/i.test(raw)?raw:'Güvenli kayıt özeti';
}
function eventSourceKindForP(e){
  var s=String(e&&(e.source||e.sourceType||e.provenance)||'').toLowerCase();
  if(/external|wikipedia|youtube|fetch|remote/.test(s)) return {kind:'external',label:'Dış kaynak'};
  if(/derived|projection|inferred|computed/.test(s)) return {kind:'derived',label:'Türetilmiş'};
  if(/delivery|notification|outbox|inbox/.test(s)) return {kind:'delivery',label:'Teslimat'};
  if(/observer|panel/.test(s)) return {kind:'observer',label:'Gözlemci'};
  return {kind:'user',label:'Kullanıcı girdisi'};
}
function eventMatchesFilterP(e,filter){
  var f=String(filter||'all'), t=String(e&&[e.section,e.path,e.operation,e.source,e.summary,e.kind].join(' ')||'').toLowerCase(), st=eventStatusP(e);
  if(f==='all') return true;
  if(f==='attention') return st.kind==='danger'||st.kind==='warning'||!e.acceptedAt;
  return eventClassificationP(e).key===f;
}
function eventFeatureForP(e){
  var t=String(e&&[e.section,e.path,e.operation,e.kind].join(' ')||'').toLowerCase();
  if(isReminderEventP(e)) return {icon:'bell',label:'Reminder'};
  if(/quran|kur.?an|reading/.test(t)) return {icon:'book-open',label:'Kur’an'};
  if(/video|watch/.test(t)) return {icon:'play',label:'Video'};
  if(/therapy|terapi|profile|profil|reflection|thought|room/.test(t)) return {icon:'heart-pulse',label:'Terapi / profil'};
  if(/message|mesaj|aeon|notification|bildirim|inbox|outbox/.test(t)) return {icon:'message-circle',label:'İletişim'};
  if(/sync|receipt|revision|retry|merge|event|poll/.test(t)) return {icon:'refresh-cw',label:'Senkron'};
  return {icon:'activity',label:'Günlük akış'};
}
// REM-62 — Reminder lifecycle event'ini güvenli summary'ye eşler.
// sync.js/app.js sabit section + path + `reminder-v1:<action>:<digest>`
// correlation sözleşmesini üretir. Panel bu sözleşmeyi YALNIZ GÖZLEMLER ve
// reminder event'ini SADECE reminder-v1 correlation önekiyle tanır (path/root
// literal'i hiçbir yerde yoktur, böylece panel kaynağı reminder local-only kök
// sınırını ihlal etmez). Occurrence kimliği üzerinden kişisel içerik üretmez
// ve hiçbir reminder action'ı / remote write başlatmaz. Bilinmeyen bir
// reminder event'i sabit 'lifecycle' sınıfına fail-closed düşer.
var REMINDER_EVENT_LABELS={scheduled:'Planlandı',delivered:'Gösterildi',opened:'Açıldı',snoozed:'Ertelendi',muted:'Susturuldu',dismissed:'Kapatıldı',suppressed:'Sakince tutuldu',error:'Gönderilemedi',enable:'Etkinleştirildi',disable:'Kapatıldı'};
function reminderEventActionP(e){
  if(!isReminderEventP(e)) return null;
  var corr=String(e&&e.correlationId||'');
  if(corr.indexOf('reminder-v1:')===0){
    var seg=corr.split(':')[1]||'';
    if(REMINDER_EVENT_LABELS[seg]) return seg;
  }
  var op=String(e&&e.operation||'').toLowerCase();
  if(op==='complete') return 'delivered';
  return 'lifecycle';
}
function isReminderEventP(e){
  if(!e||typeof e!=='object') return false;
  return String(e&&e.correlationId||'').indexOf('reminder-v1:')===0;
}
function reminderEventLabelP(e){
  var action=reminderEventActionP(e);
  if(!action) return null;
  return REMINDER_EVENT_LABELS[action]||'Yaşam döngüsü';
}
// REM-62 — Timeline satırı için görünür-ama-sakin date/sequence durumu.
// future (occurredAt bugünden ileri), stale (bugünden >7 gün geri), aksi
// halde normal. Sıra bozukluğu/gap/duplicate kart üstü alarmında toplu ve
// sakin gösterilir; satır bazında veri sunulmaz. Uygulama action'ı veya
// remote write tetiklemez.
function eventDateStateP(e,referenceDate){
  var occurred=e&&e.occurredAt?String(e.occurredAt).slice(0,10):null;
  if(!occurred||!/^\d{4}-\d{2}-\d{2}$/.test(occurred)) return {key:'unknown',label:''};
  var ref=String(referenceDate||(typeof today==='function'?today():'')||'');
  if(!ref) return {key:'normal',label:''};
  var dayDiff=Math.round((Date.parse(occurred+'T00:00:00Z')-Date.parse(ref+'T00:00:00Z'))/86400000);
  if(dayDiff>0) return {key:'future',label:'gelecek tarih'};
  if(dayDiff<-(STALE_DANGER_DAYS||7)) return {key:'stale',label:'eski tarih'};
  return {key:'normal',label:''};
}
function eventJsArgP(v){ return String(v==null?'':v).replace(/\\/g,'\\\\').replace(/'/g,"\\'"); }
function eventDrawerFocusableP(root){
  if(!root||typeof root.querySelectorAll!=='function') return [];
  var all=root.querySelectorAll('button,[href],input,select,textarea,[tabindex]:not([tabindex="-1"])');
  return Array.prototype.filter.call(all,function(el){ return !el.disabled&&el.getAttribute('aria-hidden')!=='true'; });
}
function eventDrawerKeydownP(ev){
  if(!ev||!UI.d4SelectedModule) return;
  if(ev.key==='Escape'){ ev.preventDefault(); closeD4ModuleDrawerP(); return; }
  if(ev.key!=='Tab'||typeof document==='undefined') return;
  var root=document.getElementById('d4-module-drawer'), focusables=eventDrawerFocusableP(root);
  if(!focusables.length) return;
  var first=focusables[0], last=focusables[focusables.length-1];
  if(ev.shiftKey&&document.activeElement===first){ ev.preventDefault(); last.focus(); }
  else if(!ev.shiftKey&&document.activeElement===last){ ev.preventDefault(); first.focus(); }
}
window.eventDrawerKeydownP=eventDrawerKeydownP;
function refreshEventLogP(){
  var card=document.getElementById('event-log-card');
  if(!card){ render(); return; }
  var top=Number(card.scrollTop)||0;
  card.innerHTML=eventLogCardInnerHTMLP();
  card.scrollTop=top;
}
window.refreshEventLogP=refreshEventLogP;
function setEventFilterP(filter){
  var allowed=['all','attention','sync','therapy-profile','quran-video','communication','reminder','user','derived','external'];
  UI.eventFilter=allowed.indexOf(filter)>=0?filter:'all';
  refreshEventLogP();
}
window.setEventFilterP=setEventFilterP;
function setEventLimitP(n){ n=Number(n); UI.eventLimit=[5,20,50,100].indexOf(n)>=0?n:5; refreshEventLogP(); } window.setEventLimitP=setEventLimitP;
function showMoreEventsP(){ UI.eventLimit=Math.max(5,Number(UI.eventLimit)||5)+5; refreshEventLogP(); }
window.showMoreEventsP=showMoreEventsP;
function eventLogCardInnerHTMLP(){
  var st=eventLogSourceP(), all=Array.isArray(EVENT_LOG_STATE.events)?EVENT_LOG_STATE.events.slice():[], audit=EVENT_LOG_STATE.audit||{ok:true,issueCount:0,issues:[]};
  function localStatus(label,legacy){ return panelLegacyBadgeHTMLP(label,legacy); }
  function localSourceBadgeP(src){ return '<span class="badge source-badge source-'+esc(src.kind)+'" data-component="source-badge" data-source="'+esc(src.kind)+'">'+esc(src.label)+'</span>'; }
  all.sort(function(a,b){ return String(b.occurredAt||'').localeCompare(String(a.occurredAt||''))||Number(b.sequence||0)-Number(a.sequence||0); });
  var filter=UI.eventFilter||'all', filtered=all.filter(function(e){ return eventMatchesFilterP(e,filter); }), groups=[], groupMap={};
  filtered.forEach(function(e){ var key=String(e.correlationId||e.eventId||'unknown'); if(!groupMap[key]){ groupMap[key]={key:key,event:e,members:[]}; groupMap[key].members.push(e); groups.push(groupMap[key]); } else groupMap[key].members.push(e); });
  groups.forEach(function(g){ g.members.sort(function(a,b){ return String(b.occurredAt||'').localeCompare(String(a.occurredAt||''))||Number(b.sequence||0)-Number(a.sequence||0); }); g.event=g.members[0]; });
  var visible=groups.slice(0,UI.eventLimit||5);
  var h='';
  h+='<div class="lbl event-log-head">'+icon('activity',14)+' Son Değişiklikler <span style="margin-left:auto;">'+localStatus(st.label,st.cls)+'</span></div>';
  h+='<div class="event-log-meta"><span>'+esc(st.note)+'</span><span class="mono">'+all.length+' kayıt · '+(EVENT_LOG_STATE.loadedAt?esc(tsShort(EVENT_LOG_STATE.loadedAt)):'—')+'</span></div>';
  var filters=eventCategoryDefsP(), selectedFilter=filters.filter(function(x){return x[0]===filter;})[0]||filters[0];
  h+='<div class="event-log-toolbar"><div class="timeline-filter" role="group" aria-label="Son değişiklik filtresi">'+filters.map(function(x){ var count=x[0]==='all'?all.length:all.filter(function(e){return eventMatchesFilterP(e,x[0]);}).length; return '<button type="button" class="timeline-filter-btn'+(filter===x[0]?' active':'')+'" data-filter="'+x[0]+'" aria-pressed="'+(filter===x[0]?'true':'false')+'" title="'+esc(x[2])+'" onclick="setEventFilterP(\''+x[0]+'\')">'+esc(x[1])+' <span>'+count+'</span></button>'; }).join('')+'</div><div class="seg event-limit-filter" role="group" aria-label="Event sayısı filtresi">'+[5,20,50,100].map(function(n){return '<button type="button" class="'+(UI.eventLimit===n?'active':'')+'" onclick="setEventLimitP('+n+')">son '+n+'</button>';}).join('')+'</div></div>';
  h+='<div class="event-log-filter-summary" aria-live="polite">'+esc(selectedFilter[1])+' · son '+Math.min(visible.length,groups.length)+' / '+groups.length+' değişiklik · '+filtered.length+' eşleşme</div>';
  if(!audit.ok) h+='<div class="event-log-alarm error-state" data-component="error-state" role="alert">⚠ Event sırası bozuk: '+esc(String(audit.issueCount))+' sıra/duplicate/gap sinyali. Cihaz bazında sequence doğrulaması başarısız.</div>';
  if(!visible.length) h+='<div class="empty empty-state" data-component="empty-state"><span class="ei">'+icon('clipboard-list',20)+'</span>Henüz güvenli event kaydı yok<span style="font-size:var(--f2);color:var(--t4);">Legacy latest snapshot yine kullanılabilir.</span></div>';
  else {
    h+='<div class="event-log-list" aria-live="polite">';
    visible.forEach(function(g){ var e=g.event, es=eventStatusP(e), src=eventSourceKindForP(e), feature=eventFeatureForP(e), category=eventClassificationP(e), change=eventChangeDescriptorP(e), rowId='event-row-'+String(e.eventId||g.key).replace(/[^a-zA-Z0-9_-]/g,'-'), chain=g.members.length>1?'<span class="event-chain-chip">zincir · '+g.members.length+'</span>':'', dateState=eventDateStateP(e), dateNote=dateState.key==='normal'?'':' <span class="event-date-note" data-date-state="'+esc(dateState.key)+'">'+esc(dateState.label)+'</span>', reminderAction=isReminderEventP(e)?reminderEventActionP(e):''; h+='<div id="'+esc(rowId)+'" class="event-log-row" data-component="timeline-row" data-feature="'+esc(feature.label)+'" data-category="'+esc(category.key)+'" data-source="'+esc(src.kind)+'" data-reminder-action="'+esc(reminderAction)+'"><span class="event-log-seq mono">#'+esc(String(e.sequence||'—'))+'</span><span class="timeline-feature-icon" title="'+esc(feature.label)+'">'+icon(feature.icon,16)+'</span><span class="event-log-main" title="'+esc(safeEventSummaryP(e))+'"><b class="event-log-headline"><span class="event-log-time mono">'+esc(eventTimeP(e.occurredAt))+'</span> · '+esc(change.title)+'</b><small>'+esc(category.label)+dateNote+'</small></span><span class="event-log-side">'+localStatus(es.label,es.cls)+'<span class="event-log-revision mono">rev · '+esc(String(e.snapshotRevision||'—').slice(0,12))+'</span></span>'+chain+'</div>'; });
    h+='</div>';
  }
  if(visible.length<groups.length) h+='<button type="button" class="event-log-more" data-event-action="load-more" onclick="showMoreEventsP()">Daha fazla göster · '+(groups.length-visible.length)+' kayıt</button>';
  h+='<div class="event-log-foot">Sıra kaynağı cihaz + sequence’tir; retry/merge/accepted aynı correlation ID ile gruplanır. Reminder yaşam döngüsü (planlandı/gösterildi/açıldı/ertelendi/susturuldu/sakince tutuldu/gönderilemedi) yalnız metadata özeti taşır. Event özeti metadata-only’dir; token, GPS, profil cevabı ve base64 medya yoktur.</div>';
  return h;
}
function eventLogCardHTMLP(){
  return '<section id="event-log-card" class="card lift span-12 pad event-log-card" data-component="timeline" role="region" aria-label="Son değişiklikler" style="order:8;display:flex;flex-direction:column;">'+eventLogCardInnerHTMLP()+'</section>';
}
// D1.2 (PANEL-DENETIM-MERKEZI-PROMPTLARI.md §6.2) — aynı EVENT_LOG_STATE
// kaynağını kullanan ama eventClassificationP(e).key==='user' (rutin gün
// kaydı — 132 kayıttan 129'unu oluşturan gürültü kaynağı) olan grupları
// varsayılan olarak süzen küratörlü liste. eventLogSourceP/loadEventLogP
// veri çekme mantığına dokunmuyor, yalnızca zaten yüklenmiş listeyi filtreliyor.
function curatedChangeLogGroupsP(){
  var all=Array.isArray(EVENT_LOG_STATE.events)?EVENT_LOG_STATE.events.slice():[], groups=[], groupMap={};
  all.sort(function(a,b){ return String(b.occurredAt||'').localeCompare(String(a.occurredAt||''))||Number(b.sequence||0)-Number(a.sequence||0); });
  all.forEach(function(e){ var key=String(e.correlationId||e.eventId||'unknown'); if(!groupMap[key]){ groupMap[key]={key:key,event:e,members:[e]}; groups.push(groupMap[key]); } else groupMap[key].members.push(e); });
  return groups.filter(function(g){ return eventClassificationP(g.event).key!=='user'; });
}
function curatedChangeLogCardInnerHTMLP(){
  var st=eventLogSourceP(), curated=curatedChangeLogGroupsP(), visible=curated.slice(0,10);
  var h='<div class="lbl event-log-head">'+icon('sparkles',14)+' Bu Hafta Değişenler <span style="margin-left:auto;">'+panelLegacyBadgeHTMLP(st.label,st.cls)+'</span></div>';
  h+='<p class="p3-muted" style="margin:2px 0 10px;">Rutin gün kayıtları hariç, dikkat çeken değişiklikler.</p>';
  if(!visible.length){
    h+='<div class="empty empty-state" data-component="empty-state"><span class="ei">'+icon('sparkles',20)+'</span>Rutin dışı bir değişiklik yok</div>';
  } else {
    h+='<div class="event-log-list" aria-live="polite">';
    visible.forEach(function(g){ var e=g.event, es=eventStatusP(e), feature=eventFeatureForP(e), category=eventClassificationP(e), change=eventChangeDescriptorP(e); h+='<div class="event-log-row" data-component="timeline-row" data-category="'+esc(category.key)+'"><span class="timeline-feature-icon" title="'+esc(feature.label)+'">'+icon(feature.icon,16)+'</span><span class="event-log-main"><b class="event-log-headline"><span class="event-log-time mono">'+esc(eventTimeP(e.occurredAt))+'</span> · '+esc(change.title)+'</b><small>'+esc(category.label)+'</small></span><span class="event-log-side">'+panelLegacyBadgeHTMLP(es.label,es.cls)+'</span></div>'; });
    h+='</div>';
  }
  h+='<button type="button" class="event-log-more" data-event-action="toggle-curated-all" onclick="toggleCuratedLogShowAllP()">'+(UI.curatedLogShowAll?'Yalnız öne çıkanları göster':'Tüm kayıtları göster')+'</button>';
  if(UI.curatedLogShowAll) h+='<div class="curated-log-full" style="margin-top:10px;border-top:1px solid var(--bd2);padding-top:10px;">'+eventLogCardInnerHTMLP()+'</div>';
  return h;
}
function curatedChangeLogCardHTMLP(){
  return '<div id="curated-change-log-card" class="card lift span-12 pad event-log-card" data-component="curated-timeline" style="order:7;display:flex;flex-direction:column;">'+curatedChangeLogCardInnerHTMLP()+'</div>';
}
function toggleCuratedLogShowAllP(){
  UI.curatedLogShowAll=!UI.curatedLogShowAll;
  var card=document.getElementById('curated-change-log-card');
  if(!card){ render(); return; }
  card.innerHTML=curatedChangeLogCardInnerHTMLP();
}
window.toggleCuratedLogShowAllP=toggleCuratedLogShowAllP;
// D1.4 (PANEL-DENETIM-MERKEZI-PROMPTLARI.md §12.1 A2) — aylık mood/tik/SOS
// ısı haritası. Yalnızca render — data'ya UI.month (zaten var, panel.js
// içindeki render() UI.month=monthKey(selected) satırı) dışında hiçbir
// kalıcı alan yazılmaz.
function monthDaysP(mk){
  var parts=String(mk||'').split('-').map(Number), y=parts[0], m=parts[1];
  var days=[], last=(y&&m)?new Date(y,m,0).getDate():0;
  for(var d=1;d<=last;d++) days.push(y+'-'+pad(m)+'-'+pad(d));
  return days;
}
function shiftMonthP(mk,delta){
  var parts=String(mk||'').split('-').map(Number), y=parts[0], m=parts[1]+delta;
  while(m<1){ m+=12; y--; }
  while(m>12){ m-=12; y++; }
  return y+'-'+pad(m);
}
// Kullanıcı talebi (2026-08-07): ay değiştirirken tüm sayfa render()
// edilip "gereksiz refresh" hissi vermesin — yalnızca kartın kendi
// innerHTML'i güncellenir (refreshEventLogP/toggleCuratedLogShowAllP ile
// AYNI hedefli-güncelleme deseni). Kart DOM'da yoksa (ör. henüz ilk
// render tamamlanmadıysa) güvenli fallback olarak tam render() yapılır.
function setPanelMonthP(mk){
  UI.month=mk;
  var card=typeof document!=='undefined'?document.getElementById('monthly-heatmap-card'):null;
  if(!card){ render(); return; }
  card.innerHTML=monthlyYearlyRowHTMLP(mk);
}
window.setPanelMonthP=setPanelMonthP;
// D1.5 (PANEL-DENETIM-MERKEZI-PROMPTLARI.md §12.1 A6) — yalnız gerçekten bir
// kilometre taşı geçildiğinde beliren, "her zaman görünen kart" OLMAYAN
// kutlama şeridi. `data`'ya "gösterildi mi" bayrağı YAZMAZ, her render'da
// mevcut duruma göre yeniden hesaplanır.
function sosFreeStreakP(){
  var c=0,d=today();
  while(D&&D.startDate&&diff(D.startDate,d)>=0){
    var r=recOf(d);
    if(r&&r.cravingSOSCount&&Number(r.cravingSOSCount)>0) break;
    c++; d=addDays(d,-1);
  }
  return c;
}
function milestoneRibbonHTMLP(streak,best,therapyUsageCount,sosFreeStreak){
  var badges=[];
  if(streak===best&&best>=7) badges.push({icon:'trophy',text:'Yeni seri rekoru! '+best+' gün'});
  if(sosFreeStreak>=30) badges.push({icon:'shield-check',text:sosFreeStreak+' gündür SOS\'suz'});
  [10,25,50].forEach(function(n){ if(therapyUsageCount===n) badges.push({icon:'heart-handshake',text:'Terapi aracını '+n+'. kez kullandın'}); });
  if(!badges.length) return '';
  var h='<div class="card lift span-12 pad milestone-ribbon-card" data-component="milestone-ribbon" style="order:2;display:flex;gap:10px;flex-wrap:wrap;align-items:center;">';
  badges.forEach(function(b){ h+='<span class="milestone-badge" style="display:inline-flex;align-items:center;gap:6px;padding:7px 12px;border-radius:999px;background:linear-gradient(135deg,rgba(212,175,55,.18),rgba(212,175,55,.08));border:1px solid rgba(212,175,55,.35);font-size:12.5px;font-weight:800;color:var(--gold);">'+icon(b.icon,14)+' '+esc(b.text)+'</span>'; });
  h+='</div>';
  return h;
}
// Aylık ısı grid'inin gövdesi — dış kart div'inden ayrıldı (2026-08-07,
// kullanıcı talebi) ki setPanelMonthP() ay değişiminde tüm sayfayı değil
// yalnızca bu iç içeriği yeniden yazabilsin.
function monthlyHeatmapInnerHTMLP(mk){
  var moodColor={"cok-iyi":"#4ade80","iyi":"#a3e635","normal":"#fbbf24","zorlandim":"#fb923c","cok-zorlandim":"#fb7185"};
  var days=monthDaysP(mk), parts=String(mk||'').split('-');
  var label=parts.length===2?new Date(Number(parts[0]),Number(parts[1])-1,1).toLocaleDateString('tr-TR',{month:'long',year:'numeric'}):mk;
  var h='<div class="myh-col">';
  h+='<div class="lbl" style="display:flex;align-items:center;gap:7px;">'+icon('calendar',14)+' Aylık Görünüm<span style="margin-left:auto;display:flex;align-items:center;gap:8px;"><button type="button" onclick="setPanelMonthP(\''+shiftMonthP(mk,-1)+'\')" aria-label="Önceki ay" style="border:none;background:transparent;cursor:pointer;color:var(--t2);">‹</button><span class="mono" style="font-size:12.5px;">'+esc(label)+'</span><button type="button" onclick="setPanelMonthP(\''+shiftMonthP(mk,1)+'\')" aria-label="Sonraki ay" style="border:none;background:transparent;cursor:pointer;color:var(--t2);">›</button></span></div>';
  h+='<div class="monthly-heatmap-grid" style="display:grid;grid-template-columns:repeat(7,1fr);gap:4px;margin-top:8px;">';
  days.forEach(function(d){
    var r=recOf(d), mood=r&&r.mood, bg=(mood&&moodColor[mood])?moodColor[mood]:'var(--s1)', sos=r&&r.cravingSOSCount?Number(r.cravingSOSCount):0, dayNum=Number(d.slice(8,10));
    h+='<div class="monthly-heatmap-cell" title="'+esc(d)+(mood?' · '+esc(MOOD_LABEL[mood]||mood):'')+(sos?' · '+sos+' SOS':'')+'" style="aspect-ratio:1;border-radius:6px;background:'+bg+';display:flex;align-items:center;justify-content:center;font-size:10.5px;color:'+(mood?'rgba(7,7,9,.6)':'var(--t4)')+';position:relative;">'+dayNum+(sos?'<span style="position:absolute;top:2px;right:2px;width:5px;height:5px;border-radius:50%;background:#fb7185;"></span>':'')+'</div>';
  });
  h+='</div></div>';
  return h;
}
// Yıllık ısı şeridi (2026-08-07, kullanıcı talebi — aylık kartın yanına).
// faithAnnualPanelCardP()'nin (panel.js:340 civarı) GitHub-tarzı
// .faith-yheat ızgara desenini yeniden kullanır — yalnızca renk skalası
// .mood-yheat modifier sınıfıyla (panel.css) mood verisine göre değişir.
function moodDayLevelP(d){
  var r=recOf(d);
  if(!r||!r.mood) return 0;
  var levels={"cok-zorlandim":1,"zorlandim":1,"normal":2,"iyi":3,"cok-iyi":4};
  return levels[r.mood]||0;
}
function yearlyMoodHeatInnerHTMLP(mk){
  var year=Number(String(mk||'').slice(0,4))||Number(today().slice(0,4));
  var first=year+'-01-01', last=year+'-12-31', dow=(new Date(year,0,1).getDay()+6)%7, cells='', active=0;
  for(var b=0;b<dow;b++) cells+='<i class="blank"></i>';
  for(var d=first;d<=last;d=addDays(d,1)){
    var lvl=moodDayLevelP(d), r=recOf(d);
    if(lvl>0) active++;
    cells+='<i data-l="'+lvl+'" title="'+esc(shortD(d)+(r&&r.mood?' · '+(MOOD_LABEL[r.mood]||r.mood):''))+'"></i>';
  }
  var months='<div class="faith-yheat-months"><span>Oca</span><span>Şub</span><span>Mar</span><span>Nis</span><span>May</span><span>Haz</span><span>Tem</span><span>Ağu</span><span>Eyl</span><span>Eki</span><span>Kas</span><span>Ara</span></div>';
  return '<div class="myh-col"><div class="lbl" style="display:flex;align-items:center;gap:7px;">'+icon('calendar',14)+' Yıllık Görünüm · '+year+'</div><div class="faith-yheat-scroll mood-yheat" style="margin-top:8px;">'+months+'<div class="faith-yheat">'+cells+'</div></div><div class="faith-yheat-legend"><b>'+active+' kayıtlı gün</b></div></div>';
}
function monthlyYearlyRowHTMLP(mk){
  return '<div class="monthly-yearly-row">'+monthlyHeatmapInnerHTMLP(mk)+yearlyMoodHeatInnerHTMLP(mk)+'</div>';
}
function monthlyHeatmapCardHTMLP(mk){
  return '<div id="monthly-heatmap-card" class="card lift span-12 pad monthly-heatmap-card" data-component="monthly-heatmap" style="order:29;">'+monthlyYearlyRowHTMLP(mk)+'</div>';
}
function timeAgo(iso){
  if(!iso) return '';
  var t=new Date(iso).getTime(); if(isNaN(t)) return '';
  var sec=Math.max(0,Math.floor((Date.now()-t)/1000));
  if(sec<60) return 'şimdi';
  if(sec<3600){ var m=Math.floor(sec/60); return m+' dk önce'; }
  if(sec<86400){ var h=Math.floor(sec/3600); return h+' sa önce'; }
  var d=Math.floor(sec/86400); return d+' gün önce';
}
function lastOpenedAt(){
  var best=0;
  function up(v){
    if(!v) return;
    var t=typeof v==="number"?v:new Date(v).getTime();
    if(!isNaN(t)&&t>best) best=t;
  }
  if(D&&D.lastOpenedAt) up(D.lastOpenedAt);
  if(D&&D.days){
    for(var k in D.days){
      var r=D.days[k]||{};
      if(r.liveSession&&r.liveSession.start) up(r.liveSession.start);
      if(Array.isArray(r.sessions)) r.sessions.forEach(function(s){ if(s&&s.start) up(s.start); });
    }
  }
  return best?new Date(best).toISOString():null;
}
function freshness(saved, opened){
  var ref=saved||opened;
  if(!ref) return {klass:"warn",txt:"Baglanti var ama kayit bekleniyor"};
  var savedMs=saved?new Date(saved).getTime():0;
  var openedMs=opened?new Date(opened).getTime():0;
  var newestMs=Math.max(savedMs, openedMs);
  var mins=Math.max(0,Math.round((Date.now()-newestMs)/60000));
  if(mins<=180) return {klass:"ok",txt:"Canli takip aktif"};
  if(mins<=1440) return {klass:"warn",txt:"Bugun guncellendi"};
  return {klass:"danger",txt:"Guncelleme gecikmis"};
}
function trend(now,prev){ var d=now-prev; if(Math.abs(d)<0.01) return "↔ "+d.toFixed(1); return (d>=0?"↑ ":"↓ ")+Math.abs(d).toFixed(1); }
function risk(days,saved){
  var a=avg(days,function(d){return cnt(recOf(d));});
  var s=sum(days,function(d){var r=recOf(d);return r&&r.cravingSOSCount?Number(r.cravingSOSCount):0;});
  var m=sum(days,function(d){var r=recOf(d);return r&&(r.mood==="zorlandim"||r.mood==="cok-zorlandim")?1:0;});
  var stale=!saved||(Date.now()-new Date(saved).getTime())>36*60*60*1000;
  var score=0; if(a<2.5)score+=2; else if(a<3.5)score+=1; if(s>=4)score+=2; else if(s>=2)score+=1; if(m>=3)score+=1; if(stale)score+=2;
  if(score<=1) return {klass:"ok",txt:"Dusuk risk"}; if(score<=3) return {klass:"warn",txt:"Orta risk"}; return {klass:"danger",txt:"Yakin takip"};
}
function toMs(v){
  if(v==null) return 0;
  if(typeof v==="number") return v;
  var t=new Date(v).getTime();
  return isNaN(t)?0:t;
}
function haversineKm(a,b){
  var R=6371;
  var dLat=(b.lat-a.lat)*Math.PI/180;
  var dLng=(b.lng-a.lng)*Math.PI/180;
  var sa=Math.sin(dLat/2), sb=Math.sin(dLng/2);
  var q=sa*sa+Math.cos(a.lat*Math.PI/180)*Math.cos(b.lat*Math.PI/180)*sb*sb;
  return 2*R*Math.atan2(Math.sqrt(q),Math.sqrt(1-q));
}
function fmtKmM(m){ m=Math.max(0,Number(m)||0); return m<1000?Math.round(m)+" m":(m/1000).toFixed(2)+" km"; }
function fmtDurP(sec){ sec=Math.max(0,Math.round(Number(sec)||0)); if(sec<60) return sec+" sn"; var m=Math.round(sec/60); if(m<60) return m+" dk"; var hh=Math.floor(m/60), mm=m%60; return hh+" sa"+(mm?(" "+mm+" dk"):""); }
function fmtIsoShort(iso){
  if(!iso) return '—';
  var d=new Date(iso);
  if(isNaN(d.getTime())) return String(iso);
  var now=new Date();
  var sameDay=d.getFullYear()===now.getFullYear()&&d.getMonth()===now.getMonth()&&d.getDate()===now.getDate();
  var time=d.toLocaleTimeString('tr-TR',{hour:'2-digit',minute:'2-digit'});
  if(sameDay) return 'bugün '+time;
  return d.toLocaleDateString('tr-TR',{day:'numeric',month:'short'})+' '+time;
}
function trackedStepsP(r){ var w=(r&&r.movement&&r.movement.walkM>0)?r.movement.walkM:0; return w>0?Math.round(w/0.72):0; }
function effStepsP(r){
  var manual=(r&&r.walk&&r.walk.steps!=null&&r.walk.steps!=="")?Number(r.walk.steps):null;
  if(manual!=null&&!isNaN(manual)) return {steps:manual,source:"manual"};
  var hs=(r&&r.health&&r.health.steps>0)?r.health.steps:0;
  if(hs>0) return {steps:hs,source:"health"};
  var tr=trackedStepsP(r); if(tr>0) return {steps:tr,source:"tracked"};
  return {steps:0,source:"none"};
}
function usagePattern(days){
  var hours=new Array(24), totalActive=0, eveningActive=0;
  for(var i=0;i<24;i++) hours[i]=0;
  days.forEach(function(d){
    var rec=recOf(d)||{};
    var sessions=[];
    if(Array.isArray(rec.sessions)) sessions=sessions.concat(rec.sessions);
    if(rec.liveSession) sessions.push(rec.liveSession);
    sessions.forEach(function(s){
      var st=toMs(s&&s.start);
      if(!st) return;
      var h=new Date(st).getHours();
      var act=Math.max(0,Number(s.activeSeconds)||0);
      hours[h]+=act||1;
      totalActive+=act;
      if(h>=18&&h<=23) eveningActive+=act;
    });
  });
  var peakHour=0, peakVal=hours[0];
  for(var j=1;j<24;j++){ if(hours[j]>peakVal){ peakVal=hours[j]; peakHour=j; } }
  return {peakHour:peakVal>0?peakHour:null,eveningPct:totalActive?Math.round((eveningActive/totalActive)*100):0};
}
function latestActivityAt(days){
  var best=0;
  days.forEach(function(d){
    var rec=recOf(d)||{};
    best=Math.max(best,toMs(rec.savedAt));
    if(rec.liveSession) best=Math.max(best,toMs(rec.liveSession.lastSeen)||toMs(rec.liveSession.start));
    if(Array.isArray(rec.sessions)) rec.sessions.forEach(function(s){ best=Math.max(best,toMs(s&&s.end)||toMs(s&&s.start)); });
  });
  return best?new Date(best).toISOString():null;
}
function missingDays(days){
  var m=0;
  days.forEach(function(d){ var r=recOf(d); if(!r||!r.savedAt) m++; });
  return m;
}
function locationPointP(point){
  if(!point||typeof point!=='object') return null;
  var lat=Number(point.lat), lng=Number(point.lng);
  if(!isFinite(lat)||!isFinite(lng)||lat<-90||lat>90||lng<-180||lng>180) return null;
  var rawTs=point.ts||point.updatedAt||point.savedAt||'', ts='';
  if(rawTs&&!isNaN(Date.parse(String(rawTs)))) ts=new Date(rawTs).toISOString();
  var acc=Number(point.acc);
  return {lat:lat,lng:lng,acc:isFinite(acc)&&acc>=0?acc:null,ts:ts};
}
function locationPointOrderP(a,b){
  var at=a&&a.ts?Date.parse(a.ts):0, bt=b&&b.ts?Date.parse(b.ts):0;
  return (isNaN(at)?0:at)-(isNaN(bt)?0:bt);
}
function googleMapsUrlP(lat,lng){ return 'https://www.google.com/maps/search/?api=1&query='+encodeURIComponent(String(lat))+','+encodeURIComponent(String(lng)); }
function locationContextFromDataP(source){
  var root=source&&typeof source==='object'?source:{}, history=(Array.isArray(root.locationHistory)?root.locationHistory:[]).map(locationPointP).filter(Boolean).sort(locationPointOrderP), tracks={};
  var days=root.days&&typeof root.days==='object'?root.days:{};
  Object.keys(days).forEach(function(date){
    var raw=days[date]&&days[date].movement&&Array.isArray(days[date].movement.track)?days[date].movement.track:[], points=raw.map(locationPointP).filter(Boolean).sort(locationPointOrderP);
    if(points.length) tracks[date]=points;
  });
  var candidates=[], rootPoint=locationPointP(root.location);
  if(rootPoint) candidates.push(rootPoint);
  history.forEach(function(point){ candidates.push(point); });
  Object.keys(tracks).forEach(function(date){ candidates.push(tracks[date][tracks[date].length-1]); });
  candidates.sort(locationPointOrderP);
  return {fix:candidates.length?candidates[candidates.length-1]:null,history:history.slice(-60),tracks:tracks};
}
function setPanelLocationContextP(source){ PANEL_LOCATION_CONTEXT=locationContextFromDataP(source); return PANEL_LOCATION_CONTEXT; }
function panelLocationP(){ return PANEL_LOCATION_CONTEXT.fix||locationPointP(D&&D.location); }
function panelLocationHistoryP(){ return PANEL_LOCATION_CONTEXT.history.length?PANEL_LOCATION_CONTEXT.history:((D&&Array.isArray(D.locationHistory))?D.locationHistory.map(locationPointP).filter(Boolean):[]); }
function panelMovementTrackP(date){
  var key=date||today();
  if(PANEL_LOCATION_CONTEXT.tracks[key]) return PANEL_LOCATION_CONTEXT.tracks[key];
  var rec=D&&D.days&&D.days[key], track=rec&&rec.movement&&Array.isArray(rec.movement.track)?rec.movement.track:[];
  return track.map(locationPointP).filter(Boolean).sort(locationPointOrderP);
}
function locationSummary(hist){
  var points=(Array.isArray(hist)?hist:[]).filter(function(p){ return p&&typeof p.lat==="number"&&typeof p.lng==="number"; });
  points.sort(function(a,b){ return toMs(a.ts)-toMs(b.ts); });
  var now=Date.now(), dayAgo=now-24*60*60*1000;
  var recent=points.filter(function(p){ return toMs(p.ts)>=dayAgo; });
  var dist=0;
  for(var i=1;i<recent.length;i++) dist+=haversineKm(recent[i-1],recent[i]);
  var zones={};
  recent.forEach(function(p){ zones[p.lat.toFixed(3)+","+p.lng.toFixed(3)]=1; });
  var accVals=points.map(function(p){ return Number(p.acc)||0; }).filter(function(v){ return v>0; });
  var accAvg=accVals.length?accVals.reduce(function(a,b){return a+b;},0)/accVals.length:null;
  return {recentCount:recent.length,zoneCount:Object.keys(zones).length,distanceKm:dist,avgAcc:accAvg};
}
function smoothPath(pts){
  if(pts.length<2) return pts.length?("M"+pts[0][0]+","+pts[0][1]):"";
  var d="M"+pts[0][0].toFixed(1)+","+pts[0][1].toFixed(1);
  for(var i=0;i<pts.length-1;i++){
    var p0=pts[i>0?i-1:0],p1=pts[i],p2=pts[i+1],p3=pts[i+2<pts.length?i+2:i+1];
    var c1x=p1[0]+(p2[0]-p0[0])/6,c1y=p1[1]+(p2[1]-p0[1])/6;
    var c2x=p2[0]-(p3[0]-p1[0])/6,c2y=p2[1]-(p3[1]-p1[1])/6;
    d+=" C"+c1x.toFixed(1)+","+c1y.toFixed(1)+" "+c2x.toFixed(1)+","+c2y.toFixed(1)+" "+p2[0].toFixed(1)+","+p2[1].toFixed(1);
  }
  return d;
}
function sparkLine(days,valFn,max,color,h){
  var w=340,ht=h||64,pl=4,pt=6,pb=6,iw=w-pl*2,ih=ht-pt-pb,m=max||1;
  var pts=days.map(function(d,i){ var x=pl+(days.length<=1?iw/2:(i/(days.length-1))*iw), y=pt+ih-(Math.max(0,valFn(d))/m)*ih; return [x,y]; });
  var line=smoothPath(pts);
  var area=line+" L"+(pl+iw).toFixed(1)+","+(pt+ih).toFixed(1)+" L"+pl.toFixed(1)+","+(pt+ih).toFixed(1)+" Z";
  var uid='sg'+Math.random().toString(36).slice(2,8);
  var last=pts[pts.length-1];
  // mid baseline + top guide
  var g='';
  [0.5].forEach(function(f){ var gy=pt+ih*f; g+='<line x1="'+pl+'" y1="'+gy.toFixed(1)+'" x2="'+(pl+iw)+'" y2="'+gy.toFixed(1)+'" stroke="rgba(255,255,255,.05)" stroke-width="1"/>'; });
  return '<svg viewBox="0 0 '+w+' '+ht+'" class="chart" preserveAspectRatio="none" style="border-radius:8px;"><defs><linearGradient id="'+uid+'" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stop-color="'+color+'" stop-opacity=".30"/><stop offset="100%" stop-color="'+color+'" stop-opacity="0"/></linearGradient></defs>'+g+'<path d="'+area+'" fill="url(#'+uid+')"/><path d="'+line+'" fill="none" stroke="'+color+'" stroke-linecap="round" stroke-linejoin="round" stroke-width="2.4"/><circle cx="'+last[0].toFixed(1)+'" cy="'+last[1].toFixed(1)+'" r="3.4" fill="'+color+'" stroke="#0b0b12" stroke-width="2"/></svg>';
}
function sparkBar(days,valFn,max,color,h){
  var w=340,ht=h||52,p=3,iw=w-p*2,ih=ht-p*2,step=iw/Math.max(1,days.length),bw=Math.max(2.5,step-2),m=max||1;
  var g='<line x1="'+p+'" y1="'+(p+ih).toFixed(1)+'" x2="'+(p+iw)+'" y2="'+(p+ih).toFixed(1)+'" stroke="rgba(255,255,255,.06)" stroke-width="1"/>';
  var bars=days.map(function(d,i){ var v=Math.max(0,valFn(d)),bh=v?Math.max(2,(v/m)*ih):0,x=p+i*step+(step-bw)/2,y=p+ih-bh; if(!bh) return ''; return '<rect x="'+x.toFixed(1)+'" y="'+y.toFixed(1)+'" width="'+bw.toFixed(1)+'" height="'+bh.toFixed(1)+'" rx="2" fill="'+color+'" opacity="0.9"/>'; }).join("");
  return '<svg viewBox="0 0 '+w+' '+ht+'" class="chart" preserveAspectRatio="none" style="border-radius:8px;">'+g+bars+'</svg>';
}
function monthDays(ym){
  var p=ym.split("-").map(Number),f=new Date(p[0],p[1]-1,1),l=new Date(p[0],p[1],0),out=[];
  var firstDow=(f.getDay()+6)%7; for(var i=0;i<firstDow;i++) out.push(null);
  for(var d=1;d<=l.getDate();d++) out.push(p[0]+"-"+pad(p[1])+"-"+pad(d));
  while(out.length%7!==0) out.push(null); return out;
}
function monthSummary(all){
  var map={}; all.forEach(function(d){ var k=monthKey(d),r=recOf(d); if(!map[k]) map[k]={days:0,ticks:0,sos:0}; map[k].days++; map[k].ticks+=cnt(r); map[k].sos+=(r&&r.cravingSOSCount?Number(r.cravingSOSCount):0); });
  return Object.keys(map).sort().reverse().map(function(k){ var m=map[k]; m.month=k; m.avg=m.days?m.ticks/m.days:0; return m; });
}

function notifMap(){ var m={}; if(D&&Array.isArray(D.notifications)) D.notifications.forEach(function(n){ if(n&&n.id) m[n.id]=n; }); return m; }
function tsShort(v){ if(!v) return ""; try{ return new Date(v).toLocaleString("tr-TR",{hour:"2-digit",minute:"2-digit",day:"2-digit",month:"2-digit"}); }catch(e){ return ""; } }
function msgStatus(n){
  if(!n) return {cls:"b-dim",txt:"↑ Gönderildi",sub:"cihaza henüz inmedi"};
  if(n.deleted) return {cls:"b-danger",txt:icon('trash-2',11)+' Silindi',sub:"kullanıcı sildi · "+tsShort(n.deletedAt)};
  if(n.read) return {cls:"b-ok",txt:icon('check-check',11)+' Okundu',sub:tsShort(n.readAt)};
  return {cls:"b-warn",txt:icon('check',11)+' İletildi · okunmadı',sub:"kayıtlı · "+tsShort(n.receivedAt)};
}
// ÆON yanıtları (replyTo) cihazda notification değil, ilgili sorunun answer'ı olarak işlenir.
// Bu yüzden durum notification'dan değil, eşleşen sorunun answerMsgId/answer alanından okunmalı;
// aksi halde teslim edilmiş bir yanıt panelde sonsuza dek "cihaza inmedi" görünür.
function replyStatus(m){
  var q=null; if(D&&D.aeon&&Array.isArray(D.aeon.qa)){ for(var i=0;i<D.aeon.qa.length;i++){ if(D.aeon.qa[i]&&D.aeon.qa[i].id===m.replyTo){ q=D.aeon.qa[i]; break; } } }
  var delivered=q&&(q.answerMsgId===m.id||q.answer);
  if(delivered){
    if(q.answerReadAt) return {cls:"b-ok",txt:icon('check-check',11)+' Görüldü',sub:tsShort(q.answerReadAt)};
    return {cls:"b-warn",txt:icon('check',11)+' İletildi · görülmedi',sub:"cihaza indi · "+tsShort(q.answeredAt)};
  }
  return {cls:"b-dim",txt:"↑ Gönderildi",sub:"cihaza henüz inmedi"};
}
// ── WhatsApp benzeri sohbet: yardımcılar (Faz 4) ──────────────────────────
// Kullanıcı tarafındaki (app.js) aeonDayDivider/aeonTime/mdLite mantığının
// panele birebir portu — aynı gün-ayırıcı, saat biçimi ve markdown-lite.
function pmDay(iso){
  try{ var d=new Date(iso); if(isNaN(d.getTime())) return "";
    var ds=fmt(d), t=today(), y=addDays(t,-1);
    if(ds===t) return "Bugün";
    if(ds===y) return "Dün";
    var sameYear=ds.slice(0,4)===t.slice(0,4);
    return d.toLocaleDateString("tr-TR",sameYear?{day:"2-digit",month:"long"}:{day:"2-digit",month:"long",year:"numeric"});
  }catch(e){ return ""; }
}
function pmClock(iso){
  try{ var d=new Date(iso); if(isNaN(d.getTime())) return "";
    var hm=d.toLocaleTimeString("tr-TR",{hour:"2-digit",minute:"2-digit"});
    if(fmt(d)===today()) return hm;
    return d.toLocaleDateString("tr-TR",{day:"2-digit",month:"short"})+" · "+hm;
  }catch(e){ return ""; }
}
// Markdown-lite: ÖNCE esc() edilmiş metin üzerinde çalışır (ham < > & entity'dir);
// **kalın**, *italik*/_italik_, otomatik link, "- "/"* " liste maddesi.
function pmMdLite(safe){
  safe=safe.replace(/^[ \t]*[-*][ \t]+(?=\S)/gm,"• ");
  safe=safe.replace(/(https?:\/\/[^\s<]+)/g,function(url){ var clean=url.replace(/[),.;:!?'"]+$/,""); var trail=url.slice(clean.length); return '<a href="'+clean+'" target="_blank" rel="noopener noreferrer" style="text-decoration:underline;text-underline-offset:2px;">'+clean+'</a>'+trail; });
  safe=safe.replace(/\*\*([^\n*]+?)\*\*/g,"<b>$1</b>");
  safe=safe.replace(/(^|[^*])\*([^\n*]+?)\*(?!\*)/g,"$1<i>$2</i>");
  safe=safe.replace(/(^|[^_])_([^\n_]+?)_(?!_)/g,"$1<i>$2</i>");
  return safe;
}
// Uzun mesajları 3 satırda kırp + "Tümünü göster" düğmesi. Kırpma CSS ile
// (-webkit-line-clamp:3); render sonrası initClampButtons taşan balonlarda
// düğmeyi görünür yapar. pmMdLite ÖNCE esc() edilmiş metin üzerinde çalışır.
function pmClamp(text){
  var safe=pmMdLite(esc(String(text==null?"":text)));
  return '<div class="pm-msg"><div class="pm-clamp pm-collapsed">'+safe+'</div>'+
    '<button class="pm-more" style="display:none" onclick="pmToggleMsg(this)">Tümünü göster ⌄</button></div>';
}
// Tek balon satırı — side:'in'(Şeyma sol) | 'out'(companion sağ), tone:'aeon'|'luna'
function pmRow(side,tone,text,footHtml,enter,grouped){
  var cls=side==="out"?("out-"+(tone||"aeon")):"in";
  var h='<div class="pm-row '+side+(enter?" pm-enter":"")+(grouped?" grouped":"")+'">';
  h+='<div class="pm-bubble '+cls+'">'+pmClamp(text)+'</div>';
  var t=esc(String(text==null?"":text));
  var actions='<button class="pm-msgact" data-text="'+t+'" onclick="copyPmMsg(this)" aria-label="Kopyala">'+icon('copy',11)+'</button><button class="pm-msgact" data-text="'+t+'" onclick="sharePmMsg(this)" aria-label="Paylaş">'+icon('share-2',11)+'</button>';
  h+='<div class="pm-foot">'+(footHtml||"")+actions+'</div>';
  h+='</div>';
  return h;
}
window.copyPmMsg=function(el){
  var t=el&&el.getAttribute("data-text"); if(!t) return;
  try{ navigator.clipboard.writeText(t); }catch(e){ return; }
  pmMsgActFeedback(el);
};
window.sharePmMsg=function(el){
  var t=el&&el.getAttribute("data-text"); if(!t) return;
  try{ if(navigator.share){ navigator.share({text:t,title:"ÆON"}).catch(function(){}); return; } }catch(e){}
  try{ navigator.clipboard.writeText(t); pmMsgActFeedback(el); }catch(e){}
};
function pmMsgActFeedback(el){
  if(!el) return;
  var orig=el.innerHTML; el.innerHTML=icon("check",11);
  setTimeout(function(){ if(el) el.innerHTML=orig; },1200);
}
// Ses/foto balonu — pmRow'un metin/markdown yolunu atlayıp doğrudan medya yuvası basar.
// Yuva boş başlar; aeonLoadVisibleMediaP() (render sonrası) doldurur — kendi az önce
// gönderdiğin medya aeonMediaCacheP'te zaten olduğu için anında görünür.
function pmMediaSlotHTML(mediaKind,mediaId,w,h){
  var elId="pm-media-"+mediaId;
  if(mediaKind==="image"){
    var ratio=(w&&h)?(mediaDimensionP(w)+"/"+mediaDimensionP(h)):"1/1";
    return '<div id="'+esc(elId)+'" class="pm-media-slot" data-media-id="'+esc(mediaId)+'" data-media-kind="image" onclick="aeonOpenImageP('+esc(jsArgP(mediaId))+')" style="width:220px;max-width:70vw;aspect-ratio:'+ratio+';border-radius:12px;overflow:hidden;background:var(--s3);display:flex;align-items:center;justify-content:center;cursor:pointer;color:var(--t3);"><span style="font-size:var(--f2);opacity:.75;">Yükleniyor…</span></div>';
  }
  if(mediaKind==="file"){
    return '<div id="'+esc(elId)+'" class="pm-media-slot" data-media-id="'+esc(mediaId)+'" data-media-kind="file" style="min-width:190px;color:var(--gold);"><span style="font-size:var(--f2);opacity:.75;display:flex;align-items:center;gap:5px;">'+icon('file-text',13)+' Yükleniyor…</span></div>';
  }
  return '<div id="'+esc(elId)+'" class="pm-media-slot" data-media-id="'+esc(mediaId)+'" data-media-kind="voice" style="min-width:190px;color:var(--gold);"><span style="font-size:var(--f2);opacity:.75;">Yükleniyor…</span></div>';
}
function pmRowMedia(side,tone,mediaKind,mediaId,w,h,footHtml,enter,grouped){
  var cls=side==="out"?("out-"+(tone||"aeon")):"in";
  var h2='<div class="pm-row '+side+(enter?" pm-enter":"")+(grouped?" grouped":"")+'">';
  h2+='<div class="pm-bubble '+cls+'" style="padding:4px;">'+pmMediaSlotHTML(mediaKind,mediaId,w,h)+'</div>';
  if(footHtml) h2+='<div class="pm-foot">'+footHtml+'</div>';
  h2+='</div>';
  return h2;
}
// Giden balonun WhatsApp tik durumu (✓ / ✓✓) + saat
function pmStatusFoot(st,iso){
  var color=st.cls==="b-ok"?"var(--green)":(st.cls==="b-warn"?"var(--amber)":(st.cls==="b-danger"?"var(--red)":"var(--t4)"));
  return '<span style="color:'+color+';font-weight:800;">'+st.txt+'</span><span>'+esc(pmClock(iso))+'</span>';
}
// ── ÆON sohbet kartı (etkileşimli) — Şeyma solda gelen, ÆON sağda giden ──────
// D.aeon.qa soruları = Şeyma (gelen). OBSINBOX mesajları = ÆON yanıt/proaktif
// (giden). Altta tek compose çubuğu: bekleyen soru varsa en eskisine replyTo ile
// yanıt verir, yoksa proaktif mesaj gönderir.
function aeonThreadCardHTML(){
  var nm=notifMap();
  var qa=(D&&D.aeon&&Array.isArray(D.aeon.qa))?D.aeon.qa:[];
  var inbox=OBSINBOX.slice();
  var pending=qa.filter(function(x){ return x&&x.id&&!x.answer; });
  var unread=inbox.reduce(function(a,m){ if(m.replyTo) return a; var n=nm[m.id]; return a+((n&&!n.deleted&&!n.read)?1:0); },0);
  var items=[];
  qa.forEach(function(x){ if(!x) return; items.push({sort:String(x.ts||""),side:"in",text:x.question,time:x.ts,reviewing:!x.answer,mediaKind:x.kind,mediaId:x.mediaId,w:x.w,h:x.h}); });
  var shownInbox={};
  inbox.forEach(function(m){ if(!m||!m.id) return; shownInbox[m.id]=true;
    if(m.replyTo){ items.push({sort:String(m.ts||""),side:"out",text:m.text,time:m.ts,st:replyStatus(m),mediaKind:m.kind,mediaId:m.mediaId,w:m.w,h:m.h}); }
    else { var n=nm[m.id]; if(n&&n.deleted) return; items.push({sort:String(m.ts||""),side:"out",text:m.text,time:m.ts,st:msgStatus(n),id:m.id,del:true,mediaKind:m.kind,mediaId:m.mediaId,w:m.w,h:m.h}); }
  });
  // Fallback: yanıt latest.json'da var ama eşleşen inbox mesajı yoksa (ör. başka cihazdan) sentezle
  qa.forEach(function(x){ if(x&&x.answer&&(!x.answerMsgId||!shownInbox[x.answerMsgId])){ items.push({sort:String(x.answeredAt||x.ts||""),side:"out",text:x.answer,time:x.answeredAt||x.ts,st:{cls:x.answerReadAt?"b-ok":"b-warn",txt:x.answerReadAt?(icon('check-check',11)+' Görüldü'):(icon('check',11)+' İletildi')},mediaKind:x.answerKind,mediaId:x.answerMediaId,w:x.answerW,h:x.answerH}); } });
  items.sort(function(a,b){ return a.sort<b.sort?-1:(a.sort>b.sort?1:0); });

  var s='<div class="card span-12 pad" style="order:10;">';
  s+='<div style="display:flex;align-items:center;gap:11px;margin-bottom:11px;">';
  s+='<div style="width:42px;height:42px;border-radius:13px;background:var(--ggrad);display:flex;align-items:center;justify-content:center;color:#1a1404;box-shadow:0 4px 14px rgba(212,175,55,.4);">'+icon('hexagon',22)+'</div>';
  s+='<div style="flex:1;min-width:0;line-height:1.25;"><div style="font-size:var(--f5);font-weight:800;letter-spacing:1.5px;color:var(--t1);">ÆON</div><div style="font-size:var(--f1);color:var(--gold);font-weight:700;letter-spacing:.4px;">hep yanında · sınırsız sohbet</div></div>';
  if(unread) s+='<span class="badge b-warn nodot" style="padding:3px 10px;">'+unread+' okunmadı</span>';
  s+='<button onclick="togglePmSearch()" aria-label="Mesajlarda ara" style="flex-shrink:0;border:1px solid var(--bd);background:var(--s2);color:var(--t2);width:34px;height:34px;border-radius:50%;cursor:pointer;display:flex;align-items:center;justify-content:center;">'+icon('search',15)+'</button>';
  s+='</div>';
  s+='<div id="pm-search-bar" style="display:none;margin:0 0 10px;position:relative;">';
  s+='<input id="pm-search-input" type="text" oninput="filterPmSearch(this)" placeholder="Mesajlarda ara…" style="width:100%;box-sizing:border-box;border:1px solid var(--bd);background:var(--s2);color:var(--t1);border-radius:13px;padding:9px 34px 9px 13px;font-size:var(--f3);outline:none;">';
  s+='<button onclick="clearPmSearch()" style="position:absolute;right:7px;top:50%;transform:translateY(-50%);border:none;background:none;cursor:pointer;color:var(--t4);line-height:1;padding:4px;display:flex;align-items:center;">'+icon('x',13)+'</button>';
  s+='</div>';
  s+='<div class="pm-thread" id="pm-aeon-thread" style="max-height:min(72vh,640px);">';
  if(!items.length){
    s+='<div class="empty" style="padding:26px 14px;"><span class="ei">⬡</span>Şeyma henüz ÆON’a yazmadı</div>';
  } else {
    var prev=null, prevSide=null;
    items.forEach(function(it){
      var ds=""; try{ var dd=new Date(it.time); if(!isNaN(dd.getTime())) ds=fmt(dd); }catch(e){}
      if(ds && ds!==prev){ s+='<div class="pm-daydiv">'+esc(pmDay(it.time))+'</div>'; prev=ds; prevSide=null; }
      var grouped=(prevSide===it.side);
      if(it.side==="in"){
        var f='<span>Şeyma · '+esc(pmClock(it.time))+'</span>';
        if(it.reviewing) f+='<span style="color:var(--amber);font-weight:800;">⏳ yanıt bekliyor</span>';
        s+=it.mediaKind?pmRowMedia("in",null,it.mediaKind,it.mediaId,it.w,it.h,f,false,grouped):pmRow("in",null,it.text,f,false,grouped);
      } else {
        var f2=pmStatusFoot(it.st,it.time);
        if(it.del) f2+='<button class="pm-del" title="Kanaldan kaldır" onclick="delObserverMsg(\''+esc(it.id)+'\')" style="display:inline-flex;align-items:center;">'+icon('trash-2',12)+'</button>';
        s+=it.mediaKind?pmRowMedia("out","aeon",it.mediaKind,it.mediaId,it.w,it.h,f2,false,grouped):pmRow("out","aeon",it.text,f2,false,grouped);
      }
      prevSide=it.side;
    });
  }
  s+='</div>';
  var pendN=pending.length;
  var hint=pendN?(icon('alarm-clock',12)+' Şeyma’nın '+(pendN>1?pendN+' cevaplanmamış sorusu var — yazınca en eskisine ÆON olarak yanıt gider':'cevaplanmamış sorusu var — yazınca ÆON olarak yanıt gider')):(icon('quote',12)+' ÆON olarak yeni mesaj gönder — uygulamada ÆON adıyla belirir');
  var disabled=(UI.msgSending||!String(UI.msgDraft||"").trim());
  var draftHas=!!String(UI.msgDraft||"").trim();
  s+='<div class="pm-composebar">';
  if(UI.aeonRecActiveP){
    s+='<div style="display:flex;align-items:center;gap:10px;background:var(--ggrad);border-radius:22px;padding:6px 7px 6px 13px;">';
    s+='<span style="width:9px;height:9px;border-radius:50%;background:#1a1404;flex-shrink:0;animation:pulse 1s ease-in-out infinite;"></span>';
    s+='<span id="pm-rec-time" style="font-size:var(--f3);font-weight:800;color:#1a1404;font-variant-numeric:tabular-nums;flex-shrink:0;">00:00</span>';
    s+='<div id="pm-rec-wave" style="flex:1;display:flex;align-items:center;gap:2px;height:24px;min-width:0;"></div>';
    s+='<button onclick="aeonRecCancelP()" aria-label="İptal" style="flex-shrink:0;border:none;cursor:pointer;background:rgba(26,20,4,0.16);color:#1a1404;width:32px;height:32px;border-radius:50%;display:flex;align-items:center;justify-content:center;">'+icon('x',14)+'</button>';
    s+='<button onclick="aeonRecStopP(true)" aria-label="Gönder" style="flex-shrink:0;border:none;cursor:pointer;background:#1a1404;color:var(--gold2);width:32px;height:32px;border-radius:50%;display:flex;align-items:center;justify-content:center;">'+icon('check',14)+'</button>';
    s+='</div>';
  } else {
    s+='<div style="font-size:var(--f1);color:'+(pendN?'var(--amber)':'var(--t4)')+';font-weight:700;margin-bottom:6px;line-height:1.4;">'+hint+'</div>';
    s+='<div style="display:flex;gap:8px;align-items:flex-end;">';
    s+='<input type="file" id="pm-photo-input" accept="image/*" style="display:none;" onchange="aeonPhotoChosenP(this)">';
    s+='<input type="file" id="pm-file-input" accept="'+AEON_FILE_ACCEPT+'" style="display:none;" onchange="aeonFileChosenP(this)">';
    s+='<input type="file" id="pm-audio-input" accept="audio/*" style="display:none;" onchange="aeonAudioFileChosenP(this)">';
    s+='<button onclick="openAttachSheetP()" aria-label="Ek gönder" class="pm-send" style="background:var(--s3);color:var(--t2);box-shadow:none;'+(UI.msgSending?'opacity:.5;pointer-events:none;':'')+'">'+icon('paperclip',17)+'</button>';
    s+='<textarea id="pm-aeon-input" oninput="aeonChatDraft(this)" onkeydown="pmAeonKeydown(event)" placeholder="ÆON olarak yaz…" rows="1">'+esc(UI.msgDraft||"")+'</textarea>';
    s+='<button id="pm-aeon-send" class="pm-send'+(disabled?' is-disabled':'')+'" onclick="sendAeonChat()" aria-label="Gönder" style="display:'+(draftHas?'flex':'none')+';">'+(UI.msgSending?'…':icon('send',17))+'</button>';
    s+='<button id="pm-aeon-mic" onclick="aeonMicTapP()" aria-label="Sesli mesaj kaydet" class="pm-send" style="display:'+(draftHas?'none':'flex')+';'+(UI.msgSending?'opacity:.5;pointer-events:none;':'')+'">'+icon('mic',17)+'</button>';
    s+='</div>';
  }
  s+='</div>';
  s+='</div>';
  return s;
}
function coreModules(){
  var loc=panelLocationP();
  var locAgeH=loc?((Date.now()-new Date(loc.ts).getTime())/3600000):null;
  var dayCount=0; for(var k in (D&&D.days||{})) dayCount++;
  var luna=(D&&D.luna&&Array.isArray(D.luna.qa))?D.luna.qa.length:0;
  var aeon=(D&&D.aeon&&Array.isArray(D.aeon.qa))?D.aeon.qa.length:0;
  var presence=false; for(var k2 in (D&&D.days||{})){ var r=D.days[k2]; if(r&&(r.liveSession||(Array.isArray(r.sessions)&&r.sessions.length))){ presence=true; break; } }
  var sv=lastSavedAt(); var cont=!!(sv&&(Date.now()-new Date(sv).getTime()<36*3600*1000));
  var cyc=!!(D&&D.cycle&&((Array.isArray(D.cycle.periods)&&D.cycle.periods.length)||D.cycle.avgCycle));
  var notifyPerm=(D&&D.settings&&D.settings.aeonNotifyPermission)||'';
  var lastNotif=(D&&D.aeon&&D.aeon.lastNotificationShownAt)?new Date(D.aeon.lastNotificationShownAt).getTime():0;
  var notifyRecent=!!(lastNotif && (Date.now()-lastNotif < 7*86400000));
  return [
    {k:"Sensorium",on:!!(loc&&locAgeH!=null&&locAgeH<48)},
    {k:"Vitals",on:dayCount>0},
    {k:"Dialogue",on:(luna+aeon)>0},
    {k:"Presence",on:presence},
    {k:"Continuity",on:cont},
    {k:"Cycle",on:cyc},
    {k:"Notifications",on:notifyPerm==='granted'}
  ];
}
function commandCenterHeroesHTMLP(heroes){
  var h='<section class="d2-hero-grid" data-component="command-heroes" aria-label="ÆON temel durum özeti">';
  (Array.isArray(heroes)?heroes:[]).forEach(function(x){
    h+='<article class="d2-hero d2-hero-'+esc(x.key||'summary')+'" data-hero="'+esc(x.key||'summary')+'">';
    h+='<div class="d2-hero-head"><span class="d2-hero-icon" aria-hidden="true">'+(x.icon||'·')+'</span><span class="d2-hero-label">'+esc(x.label||'Özet')+'</span>'+(x.badge||'')+'</div>';
    h+='<div class="d2-hero-value">'+(x.value||'—')+'</div>';
    h+='<div class="d2-hero-detail">'+(x.detail||'')+'</div>';
    h+='</article>';
  });
  return h+'</section>';
}
function commandRiskHTMLP(riskState,canonical,projectionState){
  var poll=typeof pollStatusP==='function'?pollStatusP():{code:'idle',label:'Yakın takip bekleniyor',note:'İlk panel çekimi bekleniyor.'};
  var tone=riskState&&riskState.klass||'warn', kind=tone==='danger'?'danger':tone==='ok'?'ok':'warning', title=tone==='danger'?'Yakın takip gerekli':tone==='ok'?'Ritim sakin':'Dikkat isteyen bir sinyal var', detail=riskState&&riskState.txt||'Risk özeti bekleniyor';
  if(canonical&&canonical.code==='conflict'){ kind='danger'; title='Senkron conflict'; detail='Uzak kabul ile yerel durum eşleşmiyor; panel güvenli görünümü koruyor.'; }
  else if(poll.code==='error'){ kind='danger'; title='Panel çekimi başarısız'; detail='Önceki görünüm korunuyor; yeni veri doğrulanmadı.'; }
  else if(poll.code==='stale'||(projectionState&&projectionState.reason==='projection_stale')){ kind='warning'; title='Görünüm eski olabilir'; detail='Kaynak veya projection yaşı nedeniyle karar verirken zamanı kontrol et.'; }
  return '<section class="d2-risk-band d2-risk-'+kind+'" data-component="risk-banner" role="'+(kind==='danger'?'alert':'status')+'" aria-live="polite"><div class="d2-risk-copy"><span class="d2-risk-icon" aria-hidden="true">'+(kind==='danger'?'!':kind==='ok'?'✓':'△')+'</span><div><b>'+esc(title)+'</b><span>'+esc(detail)+'</span></div></div><div class="d2-risk-meta">'+d2StatusBadgeP(riskState&&riskState.txt||'Risk bekleniyor',kind,'b-'+(kind==='warning'?'warn':kind==='danger'?'danger':'ok'))+'<span>'+esc(poll.label||'Yakın takip bekleniyor')+'</span></div></section>';
}
// D1.1 (PANEL-DENETIM-MERKEZI-PROMPTLARI.md §6.1) — audit apparatus'un yerini
// alacak, zaten hesaplanan sinyallerden (risk/moodDist/sosRows/missingDays/
// uyku trendi/terapi son kayıt) türetilen, insan-odaklı "bugüne bak" özeti.
// Yeni bir risk motoru DEĞİL — risk()'in kendi eşikleriyle (panel.js:1729)
// tutarlı, yalnızca metne döken bir katman.
function needsAttentionCardHTMLP(riskState,moodDist,sosRows,missingCount,curSleep,prevSleep,therapyText){
  var maddeler=[];
  if(missingCount>=2) maddeler.push(missingCount+' gündür kayıt yok');
  var weekAgo=addDays(today(),-7);
  var sosCount=(Array.isArray(sosRows)?sosRows:[]).filter(function(d){return d>=weekAgo;}).reduce(function(a,d){ var r=recOf(d); return a+(r&&r.cravingSOSCount?Number(r.cravingSOSCount):0); },0);
  if(sosCount>=1) maddeler.push('Son 7 günde '+sosCount+' kez SOS kullanıldı');
  var toughDays=((moodDist&&moodDist['zorlandim'])||0)+((moodDist&&moodDist['cok-zorlandim'])||0);
  if(toughDays>=3) maddeler.push('Bu dönem '+toughDays+' gün zor geçmiş');
  if(curSleep>0&&prevSleep>0&&curSleep<prevSleep-1.5) maddeler.push('Uyku ortalaması düşüyor: '+(Math.round(prevSleep*10)/10)+' → '+(Math.round(curSleep*10)/10)+' sa');
  if(therapyText) maddeler.push(therapyText);
  var calm=maddeler.length===0;
  var tone=calm?'ok':(riskState&&riskState.klass)||'warn';
  var cls=tone==='danger'?'danger':tone==='ok'?'ok':'warning';
  var h='<div class="card lift span-12 pad needs-attention-card needs-attention-'+cls+'" data-component="needs-attention" style="order:6;display:flex;flex-direction:column;">';
  h+='<div class="lbl" style="display:flex;align-items:center;gap:7px;">'+icon('heart-handshake',14)+' Bugün Ne Yapmalıyım</div>';
  if(calm){
    h+='<p class="p3-muted" style="margin:6px 0 0;">Şu an dikkat gereken bir şey görünmüyor · ritim sakin</p>';
  } else {
    h+='<ul style="margin:8px 0 0;padding-left:18px;display:flex;flex-direction:column;gap:5px;">';
    maddeler.slice(0,3).forEach(function(m){ h+='<li style="font-size:13.5px;color:var(--t2);">'+esc(m)+'</li>'; });
    h+='</ul>';
  }
  h+='</div>';
  return h;
}
// D1.3 (PANEL-DENETIM-MERKEZI-PROMPTLARI.md §12.1 A4) — cur/prev pencere
// karşılaştırmalarından türetilmiş, insan diliyle yazılmış haftalık özet.
// LLM/network yok — düz string birleştirme. tc()'nin (render() içi,
// panel.js:3175 civarı) kullandığı fark<0.05 → "→" eşiğiyle tutarlı.
function trendArrowP(now,prev){
  var d=now-prev, a=Math.abs(d);
  if(a<0.05) return '→';
  return d>0?'↑':'↓';
}
function weeklyDigestCardHTMLP(curAvg,prevAvg,curSleep,prevSleep,curSos,prevSos,curSess){
  var ritimArrow=trendArrowP(curAvg,prevAvg);
  var ritimTxt=ritimArrow==='→'?'geçen haftaya göre benzer':(ritimArrow==='↑'?'geçen haftaya göre daha hareketli':'geçen haftaya göre sakin');
  var sleepTxt=curSleep>0?('uyku ortalaması '+(Math.round(curSleep*10)/10)+' saat '+trendArrowP(curSleep,prevSleep)):'uyku kaydı yok';
  var sosTxt=curSos>0?(curSos+' kez SOS oldu '+trendArrowP(curSos,prevSos)):'SOS olmadı';
  var sessionTxt=(curSess&&curSess.sessionCount)?(' '+curSess.sessionCount+' oturumda uygulama kullanıldı.'):'';
  var h='<div class="card lift span-12 pad weekly-digest-card" data-component="weekly-digest" style="order:6;display:flex;flex-direction:column;">';
  h+='<div class="lbl" style="display:flex;align-items:center;gap:7px;">'+icon('calendar',14)+' Bu Hafta Nasıldı</div>';
  h+='<p style="margin:6px 0 0;font-size:13.5px;color:var(--t2);line-height:1.6;">Bu hafta ritim '+esc(ritimTxt)+' · '+esc(sleepTxt)+' · '+esc(sosTxt)+'.'+esc(sessionTxt)+'</p>';
  h+='</div>';
  return h;
}
function coreStripHTML(){
  var mods=coreModules();
  var online=mods.reduce(function(a,m){return a+(m.on?1:0);},0);
  var up=Math.max(1,diff(D.startDate,today())+1);
  var notifyPerm=(D&&D.settings&&D.settings.aeonNotifyPermission)||'';
  var lastNotif=D&&D.aeon&&D.aeon.lastNotificationShownAt;
  var notifAge=lastNotif?(Date.now()-new Date(lastNotif).getTime()):null;
  var s='<div class="card pad d2-core-strip span-12" data-component="command-center" style="order:1;margin-bottom:12px;display:flex;align-items:center;gap:14px;flex-wrap:wrap;border-color:var(--bd-gold);background:linear-gradient(135deg,rgba(212,175,55,.07),rgba(28,28,40,.74));">';
  s+='<div style="display:flex;align-items:center;gap:11px;min-width:0;">';
  s+='<div onclick="devLogoTapP()" style="width:38px;height:38px;border-radius:11px;background:var(--ggrad);display:flex;align-items:center;justify-content:center;font-size:18px;color:#1a1404;font-weight:800;box-shadow:0 3px 12px rgba(212,175,55,.4);cursor:default;">⬡</div>';
  s+='<div style="line-height:1.2;"><div style="font-size:var(--f4);font-weight:800;color:var(--t1);letter-spacing:2px;">ÆON</div><div style="font-size:var(--f1);color:var(--gold);font-weight:800;letter-spacing:.7px;text-transform:uppercase;">Orchestration Core</div></div>';
  s+='</div>';
  s+='<div style="display:flex;flex-wrap:wrap;gap:6px;flex:1;min-width:0;">';
  mods.forEach(function(m){ s+='<span class="badge '+(m.on?"b-ok pulse":"b-dim")+'" style="padding:4px 9px;font-size:var(--f1);" title="'+(m.on?"çevrimiçi":"bekliyor")+'">'+esc(m.k)+'</span>'; });
  if(notifyPerm==='granted'){
    s+='<span class="badge b-ok pulse" style="padding:4px 9px;font-size:var(--f1);" title="Bildirim izni verildi">Bildirim açık · '+esc(timeAgo(lastNotif)||'henüz tetiklenmedi')+'</span>';
  } else if(notifyPerm==='denied'){
    s+='<span class="badge b-warn" style="padding:4px 9px;font-size:var(--f1);" title="Bildirim izni reddedildi">Bildirim kapalı</span>';
  } else {
    s+='<span class="badge b-dim" style="padding:4px 9px;font-size:var(--f1);" title="Bildirim izni bekleniyor">Bildirim bekleniyor</span>';
  }
  s+='</div>';
  s+='<div style="display:flex;align-items:center;gap:16px;margin-left:auto;">';
  s+='<div class="meta"><b class="mono">'+online+'/'+mods.length+'</b><span>Modül</span></div>';
  s+='<div class="meta"><b class="mono">'+up+'g</b><span>Uptime</span></div>';
  s+='</div>';
  s+='</div>';
  return s;
}
// ── Luna sohbet kartı (salt-izleme) — Şeyma solda gelen, Luna sağda mor giden ──
// Luna gerçek yapay zekadır (uygulamada OpenAI ile yanıtlar); gözlemci burada
// yalnızca izler, compose yoktur. Aynı WhatsApp yön/gün-ayırıcı mantığı.
function lunaThreadCardHTML(){
  var luna=(D&&D.luna)?D.luna:null;
  var qa=(luna&&Array.isArray(luna.qa))?luna.qa.slice():[];
  qa.sort(function(a,b){ return String(a&&(a.ts||a.date)||"").localeCompare(String(b&&(b.ts||b.date)||"")); });
  var lunaConn=!!(D&&D.settings&&D.settings.lunaConnected);
  var lunaTodayN=qa.filter(function(x){ return x&&x.date===today(); }).length;
  var s='<div class="card span-6 pad" style="order:10;">';
  s+='<div style="display:flex;align-items:center;gap:11px;margin-bottom:11px;">';
  s+='<div style="width:42px;height:42px;border-radius:13px;background:linear-gradient(135deg,#9B7FC9,#E9AFC1);display:flex;align-items:center;justify-content:center;color:#fff;box-shadow:0 4px 14px rgba(155,127,201,.4);">'+icon('moon',22)+'</div>';
  s+='<div style="flex:1;min-width:0;line-height:1.25;"><div style="font-size:var(--f5);font-weight:800;color:var(--t1);">Luna</div><div style="font-size:var(--f1);color:#C9AEEA;font-weight:700;letter-spacing:.3px;">seni dinleyen yoldaşın · günde 5 soru</div></div>';
  s+='<span style="font-size:var(--f1);font-weight:800;border-radius:999px;padding:3px 10px;color:#fff;background:linear-gradient(135deg,#9B7FC9,#E9AFC1);">bugün '+lunaTodayN+'/5</span>';
  s+='</div>';
  s+='<div style="margin-bottom:9px;"><span style="font-size:var(--f1);font-weight:800;border-radius:999px;padding:3px 10px;'+(lunaConn?'color:#0a2a18;background:var(--green);':'color:var(--t3);background:var(--s2);border:1px solid var(--bd2);')+'"><span style="display:inline-flex;align-items:center;gap:4px;">'+icon('moon',11)+' '+(lunaConn?(icon('check',11)+' bağlı'):'bağlı değil')+'</span></span></div>';
  if(!qa.length){
    s+='<div style="display:flex;gap:8px;align-items:flex-start;background:rgba(155,127,201,0.08);border:1px solid rgba(155,127,201,0.28);border-radius:11px;padding:10px 12px;">';
    s+='<span style="line-height:1.2;display:inline-flex;">'+icon('moon',14)+'</span>';
    s+='<span style="font-size:var(--f2);color:var(--t3);line-height:1.5;font-weight:600;">Luna’dan henüz kayıt yok. Luna yalnızca uygulamada <b style="color:var(--t2);">OpenAI anahtarı</b> girildiğinde ve <b style="color:var(--t2);">günde 5 soru</b> ile çalışır — boş olması kullanılmadığı anlamına gelmez. (ÆON anahtarsız ve sınırsızdır.)</span>';
    s+='</div>';
  } else {
    s+='<div class="pm-thread" id="pm-luna-thread" style="max-height:360px;">';
    var prev=null;
    qa.forEach(function(x){ if(!x) return;
      var t=x.ts||x.date;
      var ds=""; try{ var dd=new Date(t); if(!isNaN(dd.getTime())) ds=fmt(dd); }catch(e){}
      if(ds && ds!==prev){ s+='<div class="pm-daydiv">'+esc(pmDay(t))+'</div>'; prev=ds; }
      s+=pmRow("in",null,x.question,'<span>Şeyma · '+esc(pmClock(t))+'</span>',false);
      if(x.answer) s+=pmRow("out","luna",x.answer,'<span style="color:#C9AEEA;font-weight:800;display:inline-flex;align-items:center;gap:3px;">'+icon('moon',11)+' Luna</span><span>'+esc(pmClock(t))+'</span>',false);
    });
    s+='</div>';
  }
  s+='</div>';
  return s;
}
function setRange(n){ UI.range=n; render(); } window.setRange=setRange;
function setDensityP(mode){ mode=['quick','standard','audit'].indexOf(mode)>=0?mode:'standard'; UI.density=mode; try{ localStorage.setItem(DENSITYKEY,mode); }catch(e){} render(); }
window.setDensityP=setDensityP;
function setSelectedDate(v){ UI.selectedDate=v||today(); UI.month=monthKey(UI.selectedDate); render(); } window.setSelectedDate=setSelectedDate;
function setMonth(v){ UI.month=v||monthKey(today()); render(); } window.setMonth=setMonth;
function pickDay(d){ if(!d)return; UI.selectedDate=d; UI.month=monthKey(d); render(); } window.pickDay=pickDay;

// ── Jump-nav: bölüme kaydır + scroll-spy (aktif bölümü şeritte vurgula) ──
function jumpToSection(id){
  var el=document.getElementById(id); if(!el) return;
  var reduce=false;
  try{ reduce=!!(window.matchMedia&&window.matchMedia('(prefers-reduced-motion: reduce)').matches); }catch(e){}
  el.scrollIntoView({behavior:reduce?'auto':'smooth',block:'start'});
}
window.jumpToSection=jumpToSection;
var _secSpyBound=null;
function initSectionScrollSpy(){
  var page=document.querySelector('.page'); var nav=document.getElementById('jumpnav');
  if(!page||!nav) return;
  var headers=SECTIONS.map(function(sec){ return document.getElementById(sec.id); }).filter(Boolean);
  var btns=nav.querySelectorAll('button');
  function update(){
    var pageTop=page.getBoundingClientRect().top, activeId=headers.length?headers[0].id:null;
    headers.forEach(function(hEl){ if(hEl.getBoundingClientRect().top-pageTop<=60) activeId=hEl.id; });
    btns.forEach(function(b){
      var active=b.getAttribute('data-sec')===activeId;
      b.classList.toggle('active',active);
      b.setAttribute('aria-current',active?'true':'false');
    });
  }
  if(_secSpyBound) page.removeEventListener('scroll',_secSpyBound);
  _secSpyBound=update; page.addEventListener('scroll',update,{passive:true});
  update();
}
// ── Sohbet auto-scroll: kullanıcı dibe yakınsa yeni mesajda dibe kaydır ──────
var PMSTICK={aeon:true,luna:true};
function pmBindThread(id,key){
  var el=document.getElementById(id); if(!el) return;
  if(PMSTICK[key]!==false) el.scrollTop=el.scrollHeight;
  el.addEventListener('scroll',function(){
    var nearBottom=(el.scrollHeight-el.scrollTop-el.clientHeight)<40;
    PMSTICK[key]=nearBottom;
  },{passive:true});
}
function initChatScroll(){ pmBindThread('pm-aeon-thread','aeon'); pmBindThread('pm-luna-thread','luna'); }
// Uzun balon 3 satırı aşıyorsa "Tümünü göster" düğmesini görünür yap (taşma tespiti).
function initClampButtons(){
  var list=document.querySelectorAll('.pm-clamp');
  for(var i=0;i<list.length;i++){
    var el=list[i], btn=el.nextElementSibling;
    if(!btn||!btn.classList||!btn.classList.contains('pm-more')) continue;
    if(el.classList.contains('pm-collapsed')) btn.style.display=(el.scrollHeight-el.clientHeight>2)?'':'none';
  }
}
window.pmToggleMsg=function(btn){
  var wrap=btn.previousElementSibling; if(!wrap) return;
  if(wrap.classList.contains('pm-collapsed')){ wrap.classList.remove('pm-collapsed'); btn.textContent='Daha az göster ⌃'; }
  else { wrap.classList.add('pm-collapsed'); btn.textContent='Tümünü göster ⌄'; }
};

function wxP(code,isDay){
  var c=Number(code);
  if(c===0) return {e:isDay?icon('sun',22):icon('moon',22),l:isDay?'Açık':'Açık gece'};
  if(c===1) return {e:isDay?icon('cloud-sun',22):icon('moon',22),l:'Az bulutlu'};
  if(c===2) return {e:icon('cloud-sun',22),l:'Parçalı bulutlu'};
  if(c===3) return {e:icon('cloud',22),l:'Bulutlu'};
  if(c===45||c===48) return {e:icon('cloud-fog',22),l:'Sisli'};
  if(c>=51&&c<=57) return {e:icon('cloud-drizzle',22),l:'Çiseli'};
  if(c>=61&&c<=67) return {e:icon('cloud-rain',22),l:'Yağmurlu'};
  if(c>=71&&c<=77) return {e:icon('cloud-snow',22),l:'Karlı'};
  if(c>=80&&c<=82) return {e:icon('cloud-rain',22),l:'Sağanak'};
  if(c>=85&&c<=86) return {e:icon('cloud-snow',22),l:'Kar sağanağı'};
  if(c>=95) return {e:icon('cloud-lightning',22),l:'Gök gürültülü'};
  return {e:icon('thermometer',22),l:'—'};
}
function weatherSpotIconName(sp){ return (sp&&sp.iconName)||(sp&&sp.key==="live"?"map-pin":(sp&&sp.key==="is"?"building-2":"house")); }
function weatherSpotIcon(sp,size){ return icon(weatherSpotIconName(sp),size||16); }
// Panel canlı hava durumu — senkron D.weather'a bağlı kalmadan, Şeyma'nın son GPS
// konumundan (D.location) doğrudan Open-Meteo'dan çekilir. Böylece panel her zaman
// kullanıcının bulunduğu yerin havasını gösterir; sabit "Ev/Kazan" verisine takılmaz.
var PWX={coords:null,spot:null,fetchedAt:0,fetching:false,name:''};
function pwxStale(lat,lng){
  if(PWX.fetching) return false;
  if(!PWX.spot||!PWX.coords) return true;
  if(haversineKm(PWX.coords,{lat:lat,lng:lng})>2.5) return true;   // ~2.5 km oynadıysa tazele
  return (Date.now()-PWX.fetchedAt)>30*60000;                      // ya da 30 dk geçtiyse
}
function pwxReverseGeocode(lat,lng){
  if(typeof fetch!=="function") return;
  fetch("https://api.bigdatacloud.net/data/reverse-geocode-client?latitude="+lat+"&longitude="+lng+"&localityLanguage=tr")
    .then(function(r){ return r.ok?r.json():Promise.reject(0); }).then(function(j){
      var nm=j.locality||j.city||j.principalSubdivision||"";
      if(nm){ PWX.name=nm; if(PWX.spot) PWX.spot.place=nm; render(); }
    }).catch(function(){});
}
function fetchPanelWeather(lat,lng){
  if(typeof fetch!=="function"||PWX.fetching) return;
  PWX.fetching=true;
  var far=(PWX.coords&&haversineKm(PWX.coords,{lat:lat,lng:lng})>2.5);
  if(far) PWX.name="";   // yeni bölge → adı yeniden çöz
  var url="https://api.open-meteo.com/v1/forecast?latitude="+lat+"&longitude="+lng
    +"&current=temperature_2m,relative_humidity_2m,apparent_temperature,is_day,precipitation,weather_code,wind_speed_10m"
    +"&daily=weather_code,temperature_2m_max,temperature_2m_min,sunrise,sunset,uv_index_max,precipitation_probability_max"
    +"&timezone=auto&forecast_days=1";
  fetch(url).then(function(r){ return r.ok?r.json():Promise.reject(r.status); }).then(function(w){
    if(!w||!w.current){ PWX.fetching=false; return; }
    var dl=w.daily||{};
    PWX.spot={
      key:"live", label:"Konumun", place:PWX.name||((D&&D.weather&&D.weather.liveName)||""), iconName:"map-pin",
      temp:Math.round(w.current.temperature_2m), feels:Math.round(w.current.apparent_temperature),
      hum:w.current.relative_humidity_2m, wind:Math.round(w.current.wind_speed_10m),
      precip:w.current.precipitation, code:w.current.weather_code, isDay:w.current.is_day===1,
      hi:(dl.temperature_2m_max?Math.round(dl.temperature_2m_max[0]):null),
      lo:(dl.temperature_2m_min?Math.round(dl.temperature_2m_min[0]):null),
      uv:(dl.uv_index_max?Math.round(dl.uv_index_max[0]):null),
      pop:(dl.precipitation_probability_max?dl.precipitation_probability_max[0]:null),
      sunrise:(dl.sunrise?dl.sunrise[0]:null), sunset:(dl.sunset?dl.sunset[0]:null)
    };
    PWX.coords={lat:lat,lng:lng}; PWX.fetchedAt=Date.now(); PWX.fetching=false;
    if(!PWX.name) pwxReverseGeocode(lat,lng);
    render();
  }).catch(function(){ PWX.fetching=false; });
}
function ensurePanelWeather(loc){
  if(!loc||typeof loc.lat!=="number"||typeof loc.lng!=="number") return;
  if(pwxStale(loc.lat,loc.lng)) fetchPanelWeather(loc.lat,loc.lng);
}
function weatherCardHTML(){
  var loc=panelLocationP();
  if(loc) ensurePanelWeather(loc);   // kullanıcının bulunduğu yerin havasını panelin kendisi çeker
  var wx=D&&D.weather?D.weather:null;
  var syncedSpots=(wx&&Array.isArray(wx.spots)&&wx.spots.length)?wx.spots:null;
  // Öncelik: panelin canlı konumdan çektiği hava; yoksa uygulamanın senkron verisine düş.
  var spots=null, fetchedAt=0;
  if(loc && PWX.spot && PWX.coords){ spots=[PWX.spot]; fetchedAt=PWX.fetchedAt; }
  else if(syncedSpots){ spots=syncedSpots; fetchedAt=(wx&&wx.fetchedAt)?new Date(wx.fetchedAt).getTime():0; }
  var s='<div class="card lift span-12 pad" style="order:10;">';
  var upd='';
  if(fetchedAt){ var am=Math.round((Date.now()-fetchedAt)/60000); upd=am<1?'az önce':am<60?am+'dk önce':am<1440?Math.round(am/60)+'sa önce':Math.round(am/1440)+'g önce'; }
  s+='<div class="lbl" style="display:flex;align-items:center;gap:6px;">'+icon('sun',14)+' Günışığı · Hava'+(spots?'<span style="margin-left:auto;font-size:var(--f2);color:var(--t3);font-weight:700;letter-spacing:0;text-transform:none;">'+esc(upd)+'</span>':'')+'</div>';
  if(!spots){
    var wMsg=(loc&&PWX.fetching)?'Konumundan hava çekiliyor…':'Hava verisi bekleniyor';
    var wSub=loc?'Şeyma’nın son konumundan güncelleniyor':'Uygulama Bugün ekranında açıldığında gelir';
    s+='<div class="empty" style="flex:1;"><span class="ei">'+icon('cloud-sun',20)+'</span>'+wMsg+'<span style="font-size:var(--f2);color:var(--t4);">'+wSub+'</span></div></div>'; return s;
  }
  s+='<div style="display:flex;gap:12px;flex-wrap:wrap;">';
  for(var i=0;i<spots.length;i++){
    var sp=spots[i]; var m=wxP(sp.code,sp.isDay);
    s+='<div style="flex:1;min-width:190px;background:var(--bd2);border:1px solid var(--bd);border-radius:14px;padding:13px 15px;">';
    s+='<div style="display:flex;align-items:center;gap:9px;">';
    s+='<span style="display:inline-flex;line-height:1;">'+m.e+'</span>';
    s+='<div style="flex:1;min-width:0;"><div style="font-size:var(--f2);font-weight:800;color:var(--t2);display:flex;align-items:center;gap:5px;flex-wrap:wrap;">'+weatherSpotIcon(sp,15)+'<span>'+esc(sp.label)+(sp.place?' · '+esc(sp.place):'')+'</span></div><div style="font-size:var(--f3);color:var(--t3);font-weight:600;">'+esc(m.l)+'</div></div>';
    s+='<div style="font-size:26px;font-weight:800;color:var(--gold);line-height:1;">'+(sp.temp!=null?sp.temp+'°':'—')+'</div>';
    s+='</div>';
    s+='<div style="display:flex;gap:10px;flex-wrap:wrap;margin-top:10px;font-size:var(--f3);color:var(--t3);font-weight:600;">';
    s+='<span style="display:inline-flex;align-items:center;gap:3px;">'+icon('thermometer',13)+' '+(sp.feels!=null?sp.feels+'°':'—')+'</span>';
    s+='<span style="display:inline-flex;align-items:center;gap:3px;">'+icon('droplet',13)+' %'+(sp.hum!=null?sp.hum:'—')+'</span>';
    s+='<span style="display:inline-flex;align-items:center;gap:3px;">'+icon('wind',13)+' '+(sp.wind!=null?sp.wind+' km/sa':'—')+'</span>';
    s+='<span style="display:inline-flex;align-items:center;gap:3px;">'+icon('sun',13)+' UV '+(sp.uv!=null?sp.uv:'—')+'</span>';
    if(sp.hi!=null) s+='<span style="display:inline-flex;align-items:center;gap:3px;">'+icon('arrow-up-down',13)+' '+sp.hi+'°/'+sp.lo+'°</span>';
    s+='</div></div>';
  }
  s+='</div></div>';
  return s;
}
// ── Menstrüasyon Döngüsü kartı (salt-gözlem) ────────────────────────────────
// Uygulamadaki cycleStats() ile birebir aynı hesap; panelde regl kayıtlarını
// (başlangıç–bitiş), faz/tahminleri ve HER GÜNÜN akış+belirti dökümünü gösterir.
function panelSortedPeriods(){
  var ps=(D&&D.cycle&&Array.isArray(D.cycle.periods))?D.cycle.periods:[];
  return ps.filter(function(p){return p&&p.start;}).slice().sort(function(a,b){return a.start<b.start?-1:(a.start>b.start?1:0);});
}
function panelCycleStats(){
  var ps=panelSortedPeriods(); var starts=ps.map(function(p){return p.start;});
  var lens=[]; for(var i=1;i<starts.length;i++){ var dl=diff(starts[i-1],starts[i]); if(dl>=15&&dl<=60) lens.push(dl); }
  var storedC=(D&&D.cycle&&typeof D.cycle.avgCycle==="number")?D.cycle.avgCycle:28;
  var avgCycle=lens.length?Math.round(lens.reduce(function(a,b){return a+b;},0)/lens.length):storedC; avgCycle=Math.max(21,Math.min(40,avgCycle));
  var plens=[]; ps.forEach(function(p){ if(p.start&&p.end){ var d=diff(p.start,p.end)+1; if(d>0&&d<15) plens.push(d); } });
  var storedP=(D&&D.cycle&&typeof D.cycle.avgPeriod==="number")?D.cycle.avgPeriod:5;
  var avgPeriod=plens.length?Math.round(plens.reduce(function(a,b){return a+b;},0)/plens.length):storedP; avgPeriod=Math.max(2,Math.min(10,avgPeriod));
  var last=starts.length?starts[starts.length-1]:null; var td=today();
  var next=null,ovu=null,fS=null,fE=null,dayInCycle=null,phase=null;
  if(last){ var since=diff(last,td); if(since>=0) dayInCycle=(since%avgCycle)+1;
    next=addDays(last,avgCycle); var guard=0; while(diff(next,td)>0&&guard<60){ next=addDays(next,avgCycle); guard++; }
    ovu=addDays(next,-14); fS=addDays(ovu,-5); fE=addDays(ovu,1);
    if(dayInCycle){ var ovuDay=avgCycle-14; if(dayInCycle<=avgPeriod) phase="menstrual"; else if(dayInCycle<ovuDay-1) phase="follicular"; else if(dayInCycle<=ovuDay+1) phase="ovulation"; else phase="luteal"; }
  }
  return {ps:ps,avgCycle:avgCycle,avgPeriod:avgPeriod,last:last,next:next,ovu:ovu,fertileStart:fS,fertileEnd:fE,dayInCycle:dayInCycle,phase:phase,sampleCount:lens.length};
}
function cycleCardHTML(){
  var st=panelCycleStats(); var hasAny=st.ps.length>0; var ph=st.phase?CYCPHASES[st.phase]:null; var td=today();
  // ── Özet (her zaman görünür) ──
  var sum;
  if(hasAny){
    var bits=[];
    if(ph) bits.push('<span style="color:'+ph.color+';font-weight:800;">'+ph.emoji+' '+esc(ph.label)+'</span>');
    if(st.dayInCycle) bits.push('Döngü <b style="color:var(--t1);">'+st.dayInCycle+'. gün</b>');
    if(st.next) bits.push('Sonraki regl <b style="color:var(--t1);">~'+fmtTR(st.next)+'</b>');
    bits.push('<span style="color:var(--t3);">'+st.ps.length+' kayıt</span>');
    sum=bits.join(' · ');
  } else {
    sum='Henüz regl kaydı yok — Şeyma uygulamadan ilk gününü ekleyince faz, tahminler ve günlük akış burada belirir.';
  }
  // ── Detay ──
  var det='';
  if(ph){
    det+='<div style="background:'+ph.color+'14;border:1px solid '+ph.color+'55;border-radius:12px;padding:12px 13px;margin-bottom:12px;">';
    det+='<div style="font-size:var(--f4);font-weight:800;color:'+ph.color+';margin-bottom:3px;">'+ph.emoji+' '+esc(ph.label)+(st.dayInCycle?' · Döngü '+st.dayInCycle+'. gün':'')+'</div>';
    det+='<div style="font-size:var(--f3);color:var(--t2);line-height:1.5;">'+esc(ph.note)+'</div></div>';
  }
  if(st.last){
    var cells=[
      ['Sonraki regl (tahmini)',fmtTR(st.next)],
      ['Doğurganlık penceresi',fmtTR(st.fertileStart)+' – '+fmtTR(st.fertileEnd)],
      ['Ovülasyon (tahmini)',fmtTR(st.ovu)],
      ['Ortalama döngü',st.avgCycle+' gün'],
      ['Ortalama regl süresi',st.avgPeriod+' gün'],
      ['Son regl başlangıcı',fmtTR(st.last)]
    ];
    det+='<div class="cyc-grid" style="display:grid;grid-template-columns:repeat(3,1fr);gap:8px;margin-bottom:14px;">';
    cells.forEach(function(c){ det+='<div style="background:var(--s1);border:1px solid var(--bd2);border-radius:11px;padding:10px 11px;"><div style="font-size:var(--f1);color:var(--t4);font-weight:700;line-height:1.25;">'+esc(c[0])+'</div><div style="font-size:var(--f4);font-weight:800;color:var(--t1);margin-top:4px;">'+esc(c[1])+'</div></div>'; });
    det+='</div>';
    if(st.sampleCount<1) det+='<div style="font-size:var(--f2);color:var(--t4);line-height:1.4;margin:-6px 0 12px;">Şimdilik tek başlangıç var; tahminler '+st.avgCycle+' günlük ortalamaya göre. Her yeni kayıt tahmini daha isabetli yapar.</div>';
  }
  // ── Regl kayıtları (başlangıç – bitiş + süre) + günlük akış/belirti dökümü ──
  det+='<div style="font-size:var(--f3);font-weight:800;color:var(--t2);margin-bottom:8px;display:flex;align-items:center;gap:7px;flex-wrap:wrap;"><span style="display:inline-flex;align-items:center;gap:5px;">'+icon('droplet',15)+' Regl Kayıtları</span><span style="font-size:var(--f1);color:var(--t4);font-weight:700;">başlangıç · bitiş · günlük akış &amp; belirti</span></div>';
  if(!hasAny){
    det+='<div style="font-size:var(--f3);color:var(--t4);line-height:1.5;">Kayıt yok.</div>';
  } else {
    st.ps.slice().reverse().forEach(function(p){
      var end=p.end||null;
      var lastDay=end||td;
      var lenDays=diff(p.start,lastDay)+1; if(lenDays<1) lenDays=1;
      var ongoing=!end;
      var head='<b style="color:var(--t1);">'+fmtTR(p.start)+' '+dowTR(p.start)+'</b> – '+(end?('<b style="color:var(--t1);">'+fmtTR(end)+' '+dowTR(end)+'</b>'):'<span style="color:var(--amber);font-weight:800;">sürüyor</span>');
      det+='<div style="border:1px solid var(--bd2);border-radius:12px;padding:11px 12px;margin-bottom:9px;background:var(--s1);">';
      det+='<div style="display:flex;align-items:baseline;gap:8px;flex-wrap:wrap;font-size:var(--f3);"><span>'+head+'</span><span style="margin-left:auto;font-size:var(--f1);color:var(--t3);font-weight:800;">'+(ongoing?('~'+lenDays+'. gün'):(lenDays+' gün'))+'</span></div>';
      var span=Math.min(lenDays,15); if(span<1) span=1;
      var dayRows='';
      for(var i=0;i<span;i++){
        var ds=addDays(p.start,i);
        var rec=(D&&D.days&&D.days[ds])?D.days[ds]:null;
        var fl=(rec&&rec.flow)?rec.flow:null;
        var sy=(rec&&Array.isArray(rec.symptoms))?rec.symptoms:[];
        var flTxt=fl?((FLOWEMO[fl]||'')+' '+esc(FLOW[fl]||fl)):'<span style="color:var(--t4);font-weight:600;">akış girilmemiş</span>';
        var syTxt=sy.length?sy.map(function(x){return esc(SYM[x]||x);}).join(', '):'';
        dayRows+='<div style="display:flex;gap:8px;align-items:baseline;font-size:var(--f2);line-height:1.5;padding:4px 0;border-top:1px solid var(--bd);">';
        dayRows+='<span style="flex-shrink:0;color:var(--t4);font-weight:800;min-width:70px;">G'+(i+1)+' · '+shortD(ds)+'</span>';
        dayRows+='<span style="flex-shrink:0;color:var(--t1);font-weight:700;min-width:82px;">'+flTxt+'</span>';
        dayRows+='<span style="color:var(--t3);font-weight:600;flex:1;min-width:0;word-break:break-word;">'+(syTxt?(icon('flower-2',12)+' '+syTxt):'')+'</span></div>';
      }
      det+='<div style="margin-top:8px;">'+dayRows+'</div>';
      det+='</div>';
    });
  }
  // ── 4 faz mini-lejant + uyarı ──
  det+='<div style="border-top:1px solid var(--bd);margin-top:6px;padding-top:10px;">';
  det+='<div style="font-size:var(--f2);font-weight:800;color:var(--t3);margin-bottom:7px;display:flex;align-items:center;gap:5px;">4 faz kısaca '+icon('microscope',13)+'</div>';
  ['menstrual','follicular','ovulation','luteal'].forEach(function(k){ var pp=CYCPHASES[k]; det+='<div style="display:flex;gap:7px;margin-bottom:5px;font-size:var(--f2);line-height:1.4;"><span style="flex-shrink:0;">'+pp.emoji+'</span><span><b style="color:'+pp.color+';">'+esc(pp.label)+'</b> — '+esc(pp.note)+'</span></div>'; });
  det+='<div style="font-size:var(--f1);color:var(--t4);line-height:1.5;margin-top:6px;">Hesaplamalar takvim/ortalama yöntemine dayanır (luteal faz ~14 gün kabulü); tahmindir, tıbbi karar için tek başına kullanılmamalıdır.</div>';
  det+='</div>';
  return cardWrap({key:'cycle',icon:icon('flower-2',18),title:'Menstrüasyon Döngüsü',span:12,order:20,summary:sum,details:det});
}

function cyclePhaseForDate(d,st){
  if(!st||!st.last) return null;
  var since=diff(st.last,d);
  if(since<0) return null;
  var dayInCycle=(since%st.avgCycle)+1;
  var ovuDay=st.avgCycle-14;
  if(dayInCycle<=st.avgPeriod) return 'menstrual';
  if(dayInCycle<ovuDay-1) return 'follicular';
  if(dayInCycle<=ovuDay+1) return 'ovulation';
  return 'luteal';
}

// ── Magnezyum Hatırlatıcısı kartı (salt-gözlem) ─────────────────────────
function panelMagnesiumStats(){
  var td=today(), totalMg=0, totalDays=0, avg=0, streak=0;
  var d=td;
  while(D.days[d]){
    var m=D.days[d]&&D.days[d].magnesium;
    if(m&&m.taken){ totalDays++; totalMg+=Math.max(0,Number(m.mg)||0); }
    d=addDays(d,-1);
  }
  if(totalDays>0) avg=Math.round(totalMg/totalDays);
  d=td;
  while(true){
    var m=D.days[d]&&D.days[d].magnesium;
    if(m&&m.taken){ streak++; d=addDays(d,-1); }
    else break;
  }
  return {totalMg:totalMg,totalDays:totalDays,avgDose:avg,streak:streak};
}

function magnesiumPanelCardHTML(){
  var mgSet=(D&&D.settings&&D.settings.magnesium)||{};
  var td=today();
  var week=[], days=[];
  for(var i=6;i>=0;i--) week.push(addDays(td,-i));
  for(var i=29;i>=0;i--) days.push(addDays(td,-i));
  function mgRec(d){ var r=recOf(d); return (r&&r.magnesium&&typeof r.magnesium==="object")?r.magnesium:null; }
  function takenCount(arr){ return arr.reduce(function(a,d){ var m=mgRec(d); return a+(m&&m.taken?1:0); },0); }
  var curTaken=takenCount(week), curTot=Math.max(1,week.length);
  var monthTaken=takenCount(days), monthTot=Math.max(1,days.length);
  var stats=panelMagnesiumStats();
  var pct7=Math.round((curTaken/curTot)*100);
  var pct30=Math.round((monthTaken/monthTot)*100);
  var color=(pct7>=70?'#8FBF8A':(pct7>=40?'#E8A53C':'#E58B9B'));
  var avgTargetHit=0; var totalTargetHit=0;
  for(var i=0;i<days.length;i++){ var m=mgRec(days[i]); if(m&&m.taken&&typeof m.mg==='number'){ totalTargetHit++; avgTargetHit+=Math.min(100,Math.round(m.mg/400*100)); } }
  if(totalTargetHit>0) avgTargetHit=Math.round(avgTargetHit/totalTargetHit);
  var mgModel=(D&&D.magnesiumModel)||{};
  var hitRate=(typeof mgModel.lutealHitRate==='number')?mgModel.lutealHitRate:null;
  var currentMode=mgSet.mode||'adaptive';
  var MODE_LABELS={adaptive:'Adaptif',lutealOnly:'Sadece lüteal',off:'Kapalı'};
  var modeLabel=MODE_LABELS[currentMode]||currentMode;
  var sum='<div style="display:flex;gap:12px;flex-wrap:wrap;align-items:center;">';
  sum+='<span style="font-size:var(--f4);font-weight:800;color:'+color+';">'+pct7+'%</span>';
  sum+='<span style="font-size:var(--f2);color:var(--t3);">Son 7 gün · '+curTaken+'/'+curTot+'</span>';
  if(stats.totalDays>0) sum+='<span style="font-size:var(--f2);color:var(--t3);">Toplam '+stats.totalDays+' gün · '+stats.totalMg+' mg</span>';
  sum+='</div>';
  function kpiBox(label,val){ return '<div style="flex:1;min-width:90px;background:var(--s1);border:1px solid var(--bd2);border-radius:10px;padding:8px 10px;"><div style="font-size:var(--f1);color:var(--t3);font-weight:700;">'+esc(label)+'</div><div style="font-size:var(--f4);font-weight:800;color:var(--accent,var(--gold));margin-top:2px;">'+val+'</div></div>'; }
  var det='<div style="display:flex;gap:10px;flex-wrap:wrap;margin-bottom:12px;">';
  det+=kpiBox('Toplam gün',stats.totalDays);
  det+=kpiBox('Toplam mg',stats.totalMg+' mg');
  det+=kpiBox('Ortalama doz',stats.avgDose?(stats.avgDose+' mg'):'—');
  det+=kpiBox('Güncel seri',stats.streak+' gün');
  det+='</div>';
  det+='<div style="display:flex;gap:10px;flex-wrap:wrap;margin-bottom:12px;">';
  det+=kpiBox('Son 7 gün',pct7+'%');
  det+=kpiBox('Son 30 gün',pct30+'%');
  det+=kpiBox('Hedef 400 mg tutturma',avgTargetHit+'%');
  det+=kpiBox('Güncel seri',stats.streak+' gün');
  det+='</div>';
  det+='<div style="display:flex;align-items:center;gap:8px;font-size:var(--f2);color:var(--t3);background:var(--s1);border:1px solid var(--bd2);border-radius:10px;padding:8px 10px;margin-bottom:10px;">'+icon('sliders-horizontal',14)+' <b>Günlük hedef:</b> 400 mg elementer magnezyum · <span style="color:var(--t4);">'+esc(modeLabel)+' modu çalışıyor.</span></div>';
  if(mgSet.kidneyDisease) det+='<div style="font-size:var(--f2);color:#c98b8b;line-height:1.5;margin-bottom:6px;display:flex;align-items:center;gap:6px;">'+icon('triangle-alert',14)+' Böbrek rahatsızlığı bildirilmiş; uygulama önerileri filtreleniyor ve doktor onayı öneriliyor.</div>';
  if(mgSet.tolerated===false) det+='<div style="font-size:var(--f2);color:#c98b8b;line-height:1.5;margin-bottom:6px;display:flex;align-items:center;gap:6px;">'+icon('triangle-alert',14)+' Magnezyum toleransı düşük olarak işaretlenmiş; form/doz seçimlerinde dikkatli olunmalı.</div>';
  // Son response log kayıtları (son 5)
  var log=Array.isArray(mgModel.responseLog)?mgModel.responseLog.slice(-5).reverse():[];
  if(log.length>0){
    var ACTION_TR={taken:'Alındı',skipped:'Atlandı',feedback:'Geri bildirim',snoozed:'Ertelendi',modeChange:'Mod değişti'};
    det+='<div style="font-size:var(--f1);color:var(--t3);font-weight:700;margin-bottom:6px;">Son hareketler</div>';
    det+='<div style="display:flex;flex-direction:column;gap:6px;margin-bottom:10px;">';
    log.forEach(function(e){
      var act=ACTION_TR[e.action]||e.action;
      var when=e.ts?tsShort(e.ts):'—';
      var extra='';
      if(e.action==='taken'&&typeof e.mg==='number') extra=' · '+e.mg+' mg'+(e.form?(' '+esc(e.form)):'');
      if(e.action==='feedback') extra=' · '+(e.improved?'Fayda göründü':'Fark görülmedi');
      if(e.action==='modeChange'&&e.mode) extra=' → '+esc(MODE_LABELS[e.mode]||e.mode);
      if(e.action==='skipped'&&e.reason) extra=' · '+esc(e.reason);
      det+='<div style="font-size:var(--f1);color:var(--t4);background:var(--s1);border:1px solid var(--bd2);border-radius:8px;padding:6px 8px;display:flex;align-items:center;gap:6px;"><span style="font-weight:700;color:var(--accent,var(--gold));">'+esc(act)+'</span><span style="margin-left:auto;color:var(--t5);">'+esc(when)+'</span>'+extra+'</div>';
    });
    det+='</div>';
  }
  det+='<div style="font-size:var(--f1);color:var(--t4);line-height:1.5;">Veriler Şeyma uygulamasından gelir; panel yalnızca gözlemdir. Tıbbi karar için kullanılmamalı.</div>';
  return cardWrap({key:'magnesium',icon:icon('pill',18),title:'Magnezyum Hatırlatıcısı',span:6,order:22,summary:sum,details:det});
}

function psychCardDataP(){
  var P=(D&&D.psych)?D.psych:null, done=P&&P.completedAt&&P.scores;
  if(!done) return {done:false};
  var sc=P.scores;
  var at=sc.attention.band, atTone=at==='yüksek uyum'?'bad':(at==='sınırda'?'mid':'good');
  var stl=sc.attachment.style, stTone=stl==='Güvenli'?'good':'mid';
  var an=sc.anxiety.band, anTone=(an==='orta'||an==='yüksek')?'bad':(an==='hafif'?'mid':'good');
  var dp=sc.depression.band, dpTone=(dp==='minimal')?'good':(dp==='hafif'?'mid':'bad');
  var wb=sc.wellbeing.band, wbTone=wb==='iyi'?'good':(wb==='düşük'?'mid':'bad');
  var scz=sc.selfCompassion.band, sczTone=scz==='yüksek'?'good':(scz==='orta'?'mid':'bad');
  // ── Zaman içinde karşılaştırma (trend) — iki haftalık ölçümlerin geçmişi ──
  var hist=Array.isArray(P.history)?P.history.filter(function(h){return h&&h.scores;}):[];
  if(!hist.length && P.scores) hist=[{completedAt:P.completedAt,scores:P.scores}];
  var METRICS=[
    {iconName:'target',label:'Dikkat/Odak (ASRS-6)',get:function(s){return s.attention?s.attention.shaded:0;},max:6,hib:false,unit:'/6'},
    {iconName:'heart-handshake',label:'Bağlanma kaygısı (ECR)',get:function(s){return s.attachment?s.attachment.anxiety:0;},max:7,hib:false,unit:'/7'},
    {iconName:'heart-handshake',label:'Bağlanma kaçınması (ECR)',get:function(s){return s.attachment?s.attachment.avoidance:0;},max:7,hib:false,unit:'/7'},
    {iconName:'wind',label:'Kaygı (GAD-7)',get:function(s){return s.anxiety?s.anxiety.sum:0;},max:21,hib:false,unit:'/21'},
    {iconName:'cloud-rain',label:'Duygudurum (PHQ-9)',get:function(s){return s.depression?s.depression.sum:0;},max:27,hib:false,unit:'/27'},
    {iconName:'sun',label:'İyi oluş (WHO-5)',get:function(s){return s.wellbeing?s.wellbeing.score:0;},max:100,hib:true,unit:'/100'},
    {iconName:'feather',label:'Öz-şefkat (SCS-SF)',get:function(s){return s.selfCompassion?s.selfCompassion.mean:0;},max:5,hib:true,unit:'/5'}
  ];
  var trendReady=hist.length>=2, trendMetrics=null, trendSummary=null;
  if(trendReady){
    trendMetrics=METRICS.map(function(m){
      var series=hist.map(function(h){return Math.round(m.get(h.scores)*10)/10;});
      return {iconName:m.iconName,label:m.label,unit:m.unit,max:m.max,hib:m.hib,series:series,cur:series[series.length-1],prev:series.length>=2?series[series.length-2]:null};
    });
    var imp=[],wor=[];
    METRICS.forEach(function(m){
      var series=hist.map(function(h){return m.get(h.scores);});
      var cur=series[series.length-1], prev=series[series.length-2];
      if(prev==null) return; var d=cur-prev; if(d===0) return;
      (( m.hib?(d>0):(d<0) )?imp:wor).push(m.label.replace(/ \(.*\)/,''));
    });
    trendSummary={imp:imp,wor:wor};
  }
  // ── Tüm soru & cevaplar (denormalize edilmiş qa dizisi) ──
  return {done:true,sc:sc,at:at,atTone:atTone,stl:stl,stTone:stTone,an:an,anTone:anTone,dp:dp,dpTone:dpTone,wb:wb,wbTone:wbTone,scz:scz,sczTone:sczTone,
    hist:hist,trendReady:trendReady,trendMetrics:trendMetrics,trendSummary:trendSummary,qa:Array.isArray(P.qa)?P.qa:[],completedAt:P.completedAt};
}
function psychCardHTML(){
  var PD=psychCardDataP();
  if(!PD.done){
    return cardWrap({key:'psych',icon:icon('brain',18),title:'Psikolojik Profil',span:12,order:20,
      summary:'Henüz tamamlanmadı — Şeyma tanıma anketini doldurunca dikkat, bağlanma/güven, kaygı, duygudurum, iyi oluş ve öz-şefkat profili ile tüm soru & cevapları burada belirir.',
      details:'<div style="font-size:var(--f2);color:var(--t4);line-height:1.5;">Öz-bildirim tarama araçları: ASRS-6 · ECR-12 · GAD-7 · PHQ-9 · WHO-5 · SCS-SF. Klinik tanı değildir. İki haftada bir yenilenir.</div>'});
  }
  var sc=PD.sc, at=PD.at, atTone=PD.atTone, stl=PD.stl, stTone=PD.stTone, an=PD.an, anTone=PD.anTone, dp=PD.dp, dpTone=PD.dpTone, wb=PD.wb, wbTone=PD.wbTone, scz=PD.scz, sczTone=PD.sczTone, hist=PD.hist;
  function col(tone){ return tone==='bad'?'#e08a8a':(tone==='mid'?'#e6c15a':'#6bbf7a'); }
  function chip(ico,txt,tone){ if(tone==null){ tone=txt; txt=ico; ico=''; } var c=col(tone); return '<span style="display:inline-flex;align-items:center;gap:4px;font-size:var(--f1);font-weight:800;padding:3px 9px;border-radius:999px;background:'+c+'22;border:1px solid '+c+'66;color:'+c+';white-space:nowrap;">'+(ico?ico:'')+esc(txt)+'</span>'; }
  function bar(pct,tone){ var c=col(tone); pct=Math.max(0,Math.min(100,pct)); return '<div style="height:7px;border-radius:999px;background:rgba(255,255,255,0.10);overflow:hidden;"><div style="height:100%;width:'+pct+'%;background:'+c+';border-radius:999px;"></div></div>'; }
  var sum='<div style="display:flex;flex-wrap:wrap;gap:6px;">'
    +chip(icon('target',12),'Dikkat: '+at,atTone)+chip(icon('heart-handshake',12),stl,stTone)+chip(icon('wind',12),'Kaygı: '+an,anTone)
    +chip(icon('cloud-rain',12),'Duygudurum: '+dp,dpTone)+chip(icon('sun',12),'İyi oluş: '+wb,wbTone)+chip(icon('feather',12),'Öz-şefkat: '+scz,sczTone)
    +(sc.depression.alert?' <span style="display:inline-flex;align-items:center;gap:4px;font-size:var(--f1);font-weight:800;padding:3px 9px;border-radius:999px;background:#e08a8a22;border:1px solid #e08a8a66;color:#e08a8a;">'+icon('triangle-alert',12)+' dikkat</span>':'')
    +'</div>';
  function drow(icon,title,chipTxt,tone,valTxt,pct,desc){
    var r='<div style="border:1px solid var(--bd2);border-radius:12px;padding:11px 12px;margin-bottom:9px;background:var(--s1);">';
    r+='<div style="display:flex;align-items:center;gap:8px;margin-bottom:8px;"><span style="font-size:var(--f4);">'+icon+'</span><span style="flex:1;font-size:var(--f3);font-weight:800;color:var(--t1);">'+esc(title)+'</span>'+chip(chipTxt,tone)+'</div>';
    r+=bar(pct,tone);
    r+='<div style="display:flex;justify-content:space-between;align-items:baseline;margin-top:6px;gap:8px;"><span style="font-size:var(--f2);color:var(--t3);line-height:1.45;flex:1;">'+esc(desc)+'</span><span style="font-size:var(--f1);color:var(--t4);font-weight:800;white-space:nowrap;">'+esc(valTxt)+'</span></div></div>';
    return r;
  }
  function fmtd(iso){ try{ return fmtTR(String(iso).slice(0,10)); }catch(e){ return String(iso||'').slice(0,10); } }
  function spark(vals,max){
    var n=vals.length; if(!n) return '';
    var w=150,h=32,pad=4;
    function xs(i){ return n<=1?w/2:pad+i*(w-2*pad)/(n-1); }
    function ys(v){ var t=Math.max(0,Math.min(1,(v||0)/max)); return h-pad-t*(h-2*pad); }
    var pts=vals.map(function(v,i){return xs(i)+','+ys(v);}).join(' ');
    var s='<svg width="'+w+'" height="'+h+'" viewBox="0 0 '+w+' '+h+'" preserveAspectRatio="none" style="display:block;overflow:visible;">';
    if(n>1) s+='<polyline points="'+pts+'" fill="none" stroke="#e6c15a" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>';
    vals.forEach(function(v,i){ s+='<circle cx="'+xs(i)+'" cy="'+ys(v)+'" r="'+(i===n-1?3.2:2)+'" fill="'+(i===n-1?'#e6c15a':'rgba(230,193,90,0.45)')+'"/>'; });
    return s+'</svg>';
  }
  function delta(cur,prev,hib){
    if(prev==null||cur==null) return '<span style="font-size:var(--f1);color:var(--t4);font-weight:800;">yeni</span>';
    var d=Math.round((cur-prev)*10)/10;
    if(d===0) return '<span style="font-size:var(--f1);color:var(--t3);font-weight:800;">→ değişim yok</span>';
    var improved=hib?(d>0):(d<0), c=improved?'#6bbf7a':'#e08a8a', arrow=(d>0?'▲':'▼');
    return '<span style="font-size:var(--f1);color:'+c+';font-weight:800;white-space:nowrap;">'+arrow+' '+Math.abs(d)+' · '+(improved?'iyi yönde':'dikkat')+'</span>';
  }
  var trend='';
  if(PD.trendReady){
    var first=hist[0], last=hist[hist.length-1];
    trend+='<div style="border:1px solid var(--bd2);border-radius:12px;padding:12px 13px;margin-bottom:12px;background:var(--s1);">';
    trend+='<div style="font-size:var(--f3);font-weight:800;color:var(--t2);margin-bottom:6px;display:flex;align-items:center;gap:7px;flex-wrap:wrap;"><span style="display:inline-flex;align-items:center;gap:5px;">'+icon('trending-up',15)+' Zaman içinde karşılaştırma</span><span style="font-size:var(--f1);color:var(--t4);font-weight:700;">'+hist.length+' ölçüm · '+fmtd(first.completedAt)+' → '+fmtd(last.completedAt)+'</span></div>';
    trend+='<div style="display:flex;flex-wrap:wrap;gap:5px;margin-bottom:6px;">';
    hist.forEach(function(h,i){ trend+='<span style="font-size:var(--f1);font-weight:700;padding:2px 8px;border-radius:999px;background:'+(i===hist.length-1?'#e6c15a22':'rgba(255,255,255,0.05)')+';border:1px solid '+(i===hist.length-1?'#e6c15a66':'var(--bd2)')+';color:'+(i===hist.length-1?'#e6c15a':'var(--t3)')+';">'+(i+1)+'. '+fmtd(h.completedAt)+'</span>'; });
    trend+='</div>';
    PD.trendMetrics.forEach(function(m){
      trend+='<div style="padding:9px 0;border-top:1px solid var(--bd);">';
      trend+='<div style="display:flex;align-items:baseline;gap:8px;"><span style="font-size:var(--f3);">'+icon(m.iconName,15)+'</span><span style="flex:1;font-size:var(--f2);font-weight:700;color:var(--t2);min-width:0;">'+esc(m.label)+'</span><span style="font-size:var(--f3);font-weight:800;color:var(--t1);white-space:nowrap;">'+m.cur+'<span style="font-size:var(--f1);color:var(--t4);">'+m.unit+'</span></span></div>';
      trend+='<div style="display:flex;align-items:center;gap:12px;margin-top:6px;flex-wrap:wrap;"><div style="flex-shrink:0;">'+spark(m.series,m.max)+'</div>'+delta(m.cur,m.prev,m.hib)+'</div>';
      trend+='</div>';
    });
    var yorum='';
    if(PD.trendSummary.imp.length) yorum+='<b style="color:#6bbf7a;">İyi yönde:</b> '+esc(PD.trendSummary.imp.join(', '))+'. ';
    if(PD.trendSummary.wor.length) yorum+='<b style="color:#e08a8a;">Dikkat:</b> '+esc(PD.trendSummary.wor.join(', '))+'. ';
    if(!yorum) yorum='Son iki ölçüm arasında belirgin değişim yok. ';
    trend+='<div style="border-top:1px solid var(--bd);margin-top:2px;padding-top:9px;font-size:var(--f2);color:var(--t3);line-height:1.5;">'+yorum+'<span style="color:var(--t4);">Kaygı/duygudurum/dikkat/bağlanmada düşüş, iyi oluş/öz-şefkatte artış olumludur. Bu bir tarama karşılaştırmasıdır; klinik tanı değildir.</span></div>';
    trend+='</div>';
  } else {
    trend+='<div style="border:1px dashed var(--bd2);border-radius:12px;padding:12px 13px;margin-bottom:12px;background:var(--s1);font-size:var(--f2);color:var(--t3);line-height:1.5;display:flex;gap:6px;"><span style="flex-shrink:0;">'+icon('trending-up',15)+'</span><span><b>Karşılaştırma yakında:</b> bu ilk ölçüm. İkinci anket (≈2 hafta sonra) tamamlandığında her alanın zaman içindeki değişimi, trend grafikleri ve otomatik yorum burada belirir.</span></div>';
  }
  var det=trend;
  det+='<div style="font-size:var(--f3);font-weight:800;color:var(--t2);margin-bottom:9px;display:flex;align-items:center;gap:6px;">'+icon('compass',15)+' Son ölçümün ayrıntısı</div>';
  det+=drow(icon('target',16),'Dikkat & Odaklanma',at,atTone,sc.attention.shaded+'/6 eşik',sc.attention.shaded/6*100,'ASRS-6 tarama: '+(at==='yüksek uyum'?'DEHB ile yüksek uyum':(at==='sınırda'?'sınırda':'düşük eğilim')));
  det+=drow(icon('heart-handshake',16),'Bağlanma & Güven',stl,stTone,'kaygı '+sc.attachment.anxiety+' · kaçınma '+sc.attachment.avoidance,Math.max(sc.attachment.anxiety,sc.attachment.avoidance)/7*100,'ECR: kaygı '+sc.attachment.anxiety+'/7, kaçınma '+sc.attachment.avoidance+'/7');
  det+=drow(icon('wind',16),'Kaygı',an,anTone,sc.anxiety.sum+'/21',sc.anxiety.sum/21*100,'GAD-7 tarama puanı');
  det+=drow(icon('cloud-rain',16),'Duygudurum',dp,dpTone,sc.depression.sum+'/27',sc.depression.sum/27*100,'PHQ-9 tarama puanı'+(sc.depression.alert?' · dikkat gerektiren düzey':''));
  det+=drow(icon('sun',16),'İyi Oluş',wb,wbTone,sc.wellbeing.score+'/100',sc.wellbeing.score,'WHO-5 (yüksek daha iyidir)');
  det+=drow(icon('feather',16),'Öz-Şefkat',scz,sczTone,sc.selfCompassion.mean+'/5',sc.selfCompassion.mean/5*100,'SCS-SF ortalaması');
  if(PD.qa.length){
    det+='<div style="border-top:1px solid var(--bd);margin-top:6px;padding-top:11px;">';
    det+='<div style="font-size:var(--f3);font-weight:800;color:var(--t2);margin-bottom:8px;display:flex;align-items:center;gap:7px;flex-wrap:wrap;"><span style="display:inline-flex;align-items:center;gap:5px;">'+icon('file-text',15)+' Tüm soru & cevaplar</span><span style="font-size:var(--f1);color:var(--t4);font-weight:700;">'+PD.qa.length+' madde</span></div>';
    var curScale=null;
    PD.qa.forEach(function(item){
      if(item.scale!==curScale){ curScale=item.scale; det+='<div style="font-size:var(--f2);font-weight:800;color:var(--t3);margin:11px 0 4px;">'+esc(item.icon||'')+' '+esc(item.scale)+'</div>'; }
      det+='<div style="display:flex;gap:9px;align-items:baseline;font-size:var(--f2);line-height:1.5;padding:5px 0;border-top:1px solid var(--bd);">';
      det+='<span style="flex:1;color:var(--t2);min-width:0;word-break:break-word;">'+esc(item.q)+'</span>';
      det+='<span style="flex-shrink:0;color:var(--t1);font-weight:800;white-space:normal;max-width:140px;text-align:right;">'+esc(item.a)+'</span></div>';
    });
    det+='</div>';
  }
  var nextTxt=''; try{ var t=Date.parse(PD.completedAt); if(!isNaN(t)){ var nd=new Date(t+14*24*3600*1000); nextTxt=' · sonraki ~'+esc(nd.toISOString().slice(0,10)); } }catch(e){}
  det+='<div style="font-size:var(--f1);color:var(--t4);line-height:1.5;margin-top:8px;border-top:1px solid var(--bd);padding-top:9px;">Öz-bildirim TARAMA araçları (ASRS-6 · ECR-12 · GAD-7 · PHQ-9 · WHO-5 · SCS-SF); klinik tanı değildir. İki haftada bir yenilenir. Son tamamlanma: '+esc(String(PD.completedAt).slice(0,10))+nextTxt+'.</div>';
  return cardWrap({key:'psych',icon:icon('brain',18),title:'Psikolojik Profil',span:12,order:20,summary:sum,details:det});
}
// ── Faz 11: Bilimsel Profil Değerlendirmesi (tek oturum, 174 madde) kartı ──
// D.profileAssessment — data.psych'ten TAMAMEN ayrı. Tamamlanmış profil özeti
// panelde doğrudan gösterilir; bu panel kullanıcının kendi gözlem panosudur.
// Ham cevap, hassas ilişki maddeleri, dikkat kontrol ayrıntıları, yanıt süreleri
// ve tanı etiketleri ASLA gösterilmez. Eksik/eski veride güvenli boş durum.
function profileAssessmentDataP(){
  var PA=(D&&D.profileAssessment)?D.profileAssessment:null;
  // Eski kullanıcıda alan yok → güvenli boş durum
  if(!PA||typeof PA!=='object') return {state:'missing'};
  var isCompleted=PA.status==='completed';
  // Tamamlanmamış → kesin yorum gösterme
  if(!isCompleted){
    var statusTxt=PA.status==='active'?'Devam ediyor':'Başlanmadı';
    var progressTxt='';
    if(typeof PA.currentItemIndex==='number'){
      var total=174; // bilinen madde sayısı
      var pct=Math.round((PA.currentItemIndex/total)*100);
      progressTxt=' · %'+pct+' ('+PA.currentItemIndex+'/'+total+')';
    }
    return {state:'incomplete',statusTxt:statusTxt,progressTxt:progressTxt};
  }
  // Tamamlanmış → özet göster
  var ps=(PA.panelSummary&&typeof PA.panelSummary==='object')?PA.panelSummary:{};
  var scores=PA.scores||{};
  var report=PA.report||{};
  var quality=PA.quality||{};
  // Güven puanı/kategorisi
  var confScore=ps.confidenceScore!=null?ps.confidenceScore:(quality.score!=null?quality.score:null);
  var confCat=ps.confidenceCategory||quality.category||null;
  var completedDate=PA.completedAt?fmtTR(String(PA.completedAt).slice(0,10)):'—';
  var bf=ps.bigFive||{};
  var bfHasData=Object.keys(bf).some(function(k){return bf[k]&&bf[k].mean!=null;});
  var shortReport=ps.shortReport||(report&&report.sections&&report.sections.characterSummary?report.sections.characterSummary.body:'');
  return {state:'completed',ps:ps,scores:scores,report:report,quality:quality,confScore:confScore,confCat:confCat,completedDate:completedDate,bf:bf,bfHasData:bfHasData,shortReport:shortReport};
}
function profileAssessmentCardHTML(){
  var PD=profileAssessmentDataP();
  if(PD.state==='missing'){
    return cardWrap({key:'profileAssessment',icon:icon('brain',18),title:'Bilimsel Profil Değerlendirmesi',span:12,order:19,
      summary:'Henüz başlanmadı — Şeyma 174 maddelik bilimsel profil değerlendirmesini tamamladığında boyutsal özet burada belirir.',
      details:'<div style="font-size:var(--f2);color:var(--t4);line-height:1.5;">Bu, tek oturumluk bilimsel bir profil değerlendirmesidir (Big Five, RAISEC, değerler, motivasyon, bilişsel stil, bağlanma, duygu düzenleme). Klinik tanı değildir; öz-bildirime dayalı bir profildir. Veriler seyma-data reposuna senkronize edilir.</div>'});
  }
  if(PD.state==='incomplete'){
    return cardWrap({key:'profileAssessment',icon:icon('brain',18),title:'Bilimsel Profil Değerlendirmesi',span:12,order:19,
      summary:esc(PD.statusTxt+PD.progressTxt)+' — tamamlandığında boyutsal özet burada belirir.',
      details:'<div style="font-size:var(--f2);color:var(--t4);line-height:1.5;">Değerlendirme tamamlanmadan profil özeti gösterilmez. Şeyma kaldığı yerden devam edebilir.</div>'});
  }
  var ps=PD.ps, confScore=PD.confScore, confCat=PD.confCat, completedDate=PD.completedDate, bf=PD.bf, bfHasData=PD.bfHasData, shortReport=PD.shortReport, report=PD.report;
  // Özet chip'leri
  function chip(txt,col){ return '<span style="display:inline-flex;align-items:center;gap:4px;font-size:var(--f1);font-weight:800;padding:3px 9px;border-radius:999px;background:'+col+'22;border:1px solid '+col+'66;color:'+col+';white-space:nowrap;">'+esc(txt)+'</span>'; }
  var confCol=confCat==='high'?'#6bbf7a':(confCat==='low'?'#e08a8a':'#e6c15a');
  var sumChips='<div style="display:flex;flex-wrap:wrap;gap:6px;">';
  sumChips+=chip('Güven: '+(confCat||'—'),confCol);
  if(ps.riasec&&Array.isArray(ps.riasec.topThree)&&ps.riasec.topThree.length){
    var RIASEC_TR={realistic:'Gerçekçi',investigative:'Araştırmacı',artistic:'Sanatsal',social:'Sosyal',enterprising:'Girişimci',conventional:'Düzenleyici'};
    sumChips+=chip('RAISEC: '+ps.riasec.topThree.map(function(c){return RIASEC_TR[c]||c;}).join(', '),'#C9B8FF');
  }
  if(ps.values&&Array.isArray(ps.values.topThree)&&ps.values.topThree.length){
    sumChips+=chip('Değerler: '+ps.values.topThree.join(', '),'#E9899F');
  }
  sumChips+='</div>';
  // Detay bölümleri
  var det='';
  // Tamamlanma + güven
  det+='<div style="font-size:var(--f3);font-weight:800;color:var(--t2);margin-bottom:9px;display:flex;align-items:center;gap:7px;flex-wrap:wrap;">'+icon('check',15)+' Tamamlandı · '+esc(completedDate)+'</div>';
  det+='<div style="border:1px solid var(--bd2);border-radius:12px;padding:11px 12px;margin-bottom:11px;background:var(--s1);">';
  det+='<div style="display:flex;align-items:center;gap:8px;margin-bottom:6px;"><span style="font-size:var(--f4);">'+icon('star',15)+'</span><span style="flex:1;font-size:var(--f3);font-weight:800;color:var(--t1);">Ölçüm Güveni</span>'+chip(confCat||'—',confCol)+'</div>';
  det+='<div style="font-size:var(--f2);color:var(--t3);line-height:1.5;">'+(confScore!=null?('0-100 üzerinden '+confScore):'Güven skoru mevcut değil')+'. Bu değerlendirme klinik bir tanı değildir; öz-bildirime dayalı bir profildir.</div>';
  det+='</div>';
  // Big Five özeti
  var B5_LABELS={conscientiousness:'Öz-yönetim ve düzen',negative_emotionality:'Duygusal hassasiyet',extraversion:'Sosyal enerji',agreeableness:'Uyum ve şefkat',open_mindedness:'Açık fikirlilik'};
  var B5_BAND={high:'belirgin yüksek',low:'ortalama altı',moderate:'dengeli/orta'};
  if(bfHasData){
    det+='<div style="font-size:var(--f3);font-weight:800;color:var(--t2);margin-bottom:8px;display:flex;align-items:center;gap:6px;">'+icon('chart-column',15)+' Big Five Alanları</div>';
    Object.keys(B5_LABELS).forEach(function(c){
      var v=bf[c]; if(!v||v.mean==null) return;
      var band=B5_BAND[v.band]||'—';
      det+='<div style="display:flex;justify-content:space-between;align-items:baseline;padding:6px 0;border-top:1px solid var(--bd);"><span style="font-size:var(--f2);color:var(--t2);font-weight:700;flex:1;">'+esc(B5_LABELS[c])+'</span><span style="font-size:var(--f2);color:var(--t3);">'+esc(band)+' <span style="color:var(--t4);font-weight:800;">'+v.mean.toFixed(1)+'/7</span></span></div>';
    });
    det+='<div style="height:6px;"></div>';
  }
  // RAISEC ilk üç
  if(ps.riasec&&Array.isArray(ps.riasec.topThree)&&ps.riasec.topThree.length){
    var RIASEC_FULL={realistic:'Gerçekçi (uygulamalı/teknik)',investigative:'Araştırmacı',artistic:'Sanatsal',social:'Sosyal',enterprising:'Girişimci',conventional:'Düzenleyici (yapılandırılmış)'};
    det+='<div style="border:1px solid var(--bd2);border-radius:12px;padding:11px 12px;margin-bottom:11px;background:var(--s1);">';
    det+='<div style="font-size:var(--f3);font-weight:800;color:var(--t2);margin-bottom:6px;display:flex;align-items:center;gap:6px;">'+icon('compass',15)+' RAISEC İlgi Alanları</div>';
    det+='<div style="font-size:var(--f2);color:var(--t3);line-height:1.5;">Öne çıkan ilk üç alan: '+ps.riasec.topThree.map(function(c){return '<b style="color:var(--t1);">'+esc(RIASEC_FULL[c]||c)+'</b>';}).join(', ')+'.</div>';
    det+='</div>';
  }
  // Değer öncelikleri
  if(ps.values&&Array.isArray(ps.values.topThree)&&ps.values.topThree.length){
    det+='<div style="border:1px solid var(--bd2);border-radius:12px;padding:11px 12px;margin-bottom:11px;background:var(--s1);">';
    det+='<div style="font-size:var(--f3);font-weight:800;color:var(--t2);margin-bottom:6px;display:flex;align-items:center;gap:6px;">'+icon('heart',15)+' Değer Öncelikleri</div>';
    det+='<div style="font-size:var(--f2);color:var(--t3);line-height:1.5;">Öne çıkan öncelikler: <b style="color:var(--t1);">'+ps.values.topThree.map(esc).join(', ')+'</b>. Bu bir "daha iyi insan" sıralaması değildir; kişinin kendi içindeki göreli önceliği yansıtır.</div>';
    det+='</div>';
  }
  // Bağlanma kaygı ve kaçınma
  var att=ps.attachment||{};
  if(att.anxiety!=null||att.avoidance!=null){
    det+='<div style="border:1px solid var(--bd2);border-radius:12px;padding:11px 12px;margin-bottom:11px;background:var(--s1);">';
    det+='<div style="font-size:var(--f3);font-weight:800;color:var(--t2);margin-bottom:6px;display:flex;align-items:center;gap:6px;">'+icon('heart-handshake',15)+' Bağlanma</div>';
    if(att.anxiety!=null) det+='<div style="font-size:var(--f2);color:var(--t3);line-height:1.5;">Bağlanma kaygısı: <b style="color:var(--t1);">'+att.anxiety.toFixed(1)+'/7</b></div>';
    if(att.avoidance!=null) det+='<div style="font-size:var(--f2);color:var(--t3);line-height:1.5;">Bağlanma kaçınması: <b style="color:var(--t1);">'+att.avoidance.toFixed(1)+'/7</b></div>';
    det+='<div style="font-size:var(--f1);color:var(--t4);margin-top:4px;">İki eksen ayrı ayrı değerlendirilir; kategori zorunlu değildir.</div>';
    det+='</div>';
  }
  // Kısa rapor özeti
  if(shortReport){
    det+='<div style="border:1px solid var(--bd2);border-radius:12px;padding:11px 12px;margin-bottom:11px;background:var(--s1);">';
    det+='<div style="font-size:var(--f3);font-weight:800;color:var(--t2);margin-bottom:6px;display:flex;align-items:center;gap:6px;">'+icon('file-text',15)+' Kısa Karakter Özeti</div>';
    det+='<div style="font-size:var(--f2);color:var(--t3);line-height:1.55;">'+esc(shortReport)+'</div>';
    det+='</div>';
  }
  // Sınırlamalar
  det+='<div style="font-size:var(--f1);color:var(--t4);line-height:1.5;margin-top:8px;border-top:1px solid var(--bd);padding-top:9px;">Bu rapor öz-bildirime dayalıdır, tek bir zaman noktasını yansıtır ve klinik tanı değildir; bir uzmanın değerlendirmesinin yerini tutmaz. Ham yanıtlar panelde gösterilmez.</div>';
  return cardWrap({key:'profileAssessment',icon:icon('brain',18),title:'Bilimsel Profil Değerlendirmesi',span:12,order:19,summary:sumChips,details:det});
}
// ── Terapi Odası: uygulamaya çekilen bilimsel profil özeti ──
function scientificProfileLightCardHTML(){
  var SP=(D&&D.scientificProfile)?D.scientificProfile:null;
  if(!SP||typeof SP!=='object'){
    return cardWrap({key:'sciProfileLight',icon:icon('sparkles',18),title:'Bilimsel Profil Işığı',span:12,order:18,
      summary:'Henüz Terapi Odası profili çekilmemiş. Uygulamada Profilim sekmesinden raporu yükleyince burada parlayacak.',
      details:'<div style="font-size:var(--f2);color:var(--t4);line-height:1.5;">Bu kart, Şeyma veri reposundaki bilimsel profil özetini uygulamada görüntülediğinde aktive olur. Gözlemciye rehber ışık verir: güçlü yönler, dikkat alanları ve nazik iletişim önerileri.</div>'});
  }
  var riasec=(SP.riasec||[]).slice(0,3).map(function(c){ return ({social:'Sosyal',conventional:'Düzenleyici',enterprising:'Girişimci',artistic:'Sanatsal',investigative:'Araştırmacı',realistic:'Gerçekçi'})[String(c).toLowerCase()]||esc(c); });
  var values=(SP.values||[]).slice(0,3).map(function(v){ return ({security:'Güvenilirlik',benevolence:'İyilikseverlik',achievement:'Başarı',conformity:'Uyum',self_direction:'Özgünlük'})[String(v).toLowerCase()]||esc(v); });
  function chip(txt,col){ return '<span style="display:inline-flex;align-items:center;gap:4px;font-size:var(--f1);font-weight:800;padding:3px 9px;border-radius:999px;background:'+col+'22;border:1px solid '+col+'66;color:'+col+';white-space:nowrap;">'+esc(txt)+'</span>'; }
  var sum='<div style="display:flex;flex-wrap:wrap;gap:6px;">';
  if(SP.confidence!=null) sum+=chip('%'+SP.confidence+' güven','var(--gold)');
  if(riasec.length) sum+=chip('RIASEC: '+riasec.join(' · '),'var(--purple)');
  if(values.length) sum+=chip('Değerler: '+values.join(' · '),'var(--rose)');
  sum+='</div>';
  var det='';
  if(SP.strengths&&SP.strengths.length){
    det+='<div style="border:1px solid var(--bd2);border-radius:12px;padding:11px 12px;margin-bottom:10px;background:var(--s1);">';
    det+='<div style="font-size:var(--f3);font-weight:800;color:var(--t2);margin-bottom:6px;display:flex;align-items:center;gap:6px;">'+icon('zap',14)+' Güçlü yönler</div>';
    det+='<ul style="margin:0;padding-left:18px;font-size:var(--f2);color:var(--t3);line-height:1.45;">'+SP.strengths.map(function(s){return '<li>'+esc(s)+'</li>';}).join('')+'</ul></div>';
  }
  if(SP.risks&&SP.risks.length){
    det+='<div style="border:1px solid var(--bd2);border-radius:12px;padding:11px 12px;margin-bottom:10px;background:var(--s1);">';
    det+='<div style="font-size:var(--f3);font-weight:800;color:var(--t2);margin-bottom:6px;display:flex;align-items:center;gap:6px;">'+icon('triangle-alert',14)+' Dikkat alanları</div>';
    det+='<ul style="margin:0;padding-left:18px;font-size:var(--f2);color:var(--t3);line-height:1.45;">'+SP.risks.map(function(r){return '<li>'+esc(r)+'</li>';}).join('')+'</ul></div>';
  }
  det+='<div style="border:1px solid var(--bd2);border-radius:12px;padding:11px 12px;background:var(--s1);">';
  det+='<div style="font-size:var(--f3);font-weight:800;color:var(--t2);margin-bottom:6px;display:flex;align-items:center;gap:6px;">'+icon('heart-handshake',14)+' Gözlemciye kısa rehber</div>';
  det+='<div style="font-size:var(--f2);color:var(--t3);line-height:1.55;">Küçük başarıları takdir et, zor anlarda duraklat, başlamada destek ol. Kontrolcü çizgiye düşürmeden nazik hatırlatmalar ver. “Şu an zor hissediyorum” sinyalini görünce sakin ve net bir cümleyle yanıt ver.</div>';
  det+='</div>';
  if(SP.note) det+='<div style="font-size:var(--f1);color:var(--t4);line-height:1.45;margin-top:8px;">'+esc(SP.note)+'</div>';
  return cardWrap({key:'sciProfileLight',icon:icon('sparkles',18),title:'Bilimsel Profil Işığı',span:12,order:18,summary:sum,details:det});
}
// ---- Motivasyon V2.1 (120 günlük program) — panel D.motivation.history'yi okur; aktif gün bilgisi motivationProgramV2.js'den alınır ----
function panelMotivationActiveDay(){
  var mp=(typeof window!=='undefined'&&window.MotivationProgramV2)?window.MotivationProgramV2:null;
  if(!mp||!mp.getProgramDay) return null;
  var cur=1;
  if(D&&D.motivation&&D.motivation.currentProgramDay) cur=Number(D.motivation.currentProgramDay);
  return mp.getProgramDay(cur);
}

function motivationEntries(){
  var hist=(D&&D.motivation&&D.motivation.history)?D.motivation.history:null;
  if(!hist) return [];
  return Object.keys(hist).map(function(k){ return hist[k]; }).filter(Boolean).sort(function(a,b){ return String(a.date||'').localeCompare(String(b.date||'')); });
}
function motivationStats(){
  var m=(D&&D.motivation)?D.motivation:null;
  var st=(m&&m.stats)?m.stats:{};
  return {
    currentProgramDay:m?(m.currentProgramDay||1):1,
    totalDays:120,
    programComplete:!!(m&&m.completedAt),
    completedAt:(m&&m.completedAt)||null,
    pathStreak:Number(st.pathStreak||0),
    bestPathStreak:Number(st.bestPathStreak||0),
    courageEvidence:Number(st.courageEvidence||0),
    returnCount:Number(st.returnCount||0),
    completedTotal:Number(st.completedTotal||0),
    minimumTotal:Number(st.minimumTotal||0)
  };
}
function motivationIsCourageDomain(domain){
  return domain==="destek"||domain==="sinir"||domain==="onarim"||domain==="yakinlik";
}
function motivationEntryMatchesFilter(x,filter){
  if(!x) return false;
  if(filter==="standard") return x.status==="completed";
  if(filter==="minimum") return x.status==="minimum_completed";
  if(filter==="courage") return motivationIsCourageDomain(x.domain);
  if(filter==="reflection") return !!(x.reflection&&String(x.reflection).trim());
  return true; // "all"
}
function setMotivationFilter(f){ UI.motivationFilter=f; render(); }
window.setMotivationFilter=setMotivationFilter;
function motivationEvidenceSummaryHTML(rows,st){
  var bits=[];
  bits.push((st.completedTotal||0)+' toplam tamamlama');
  if(st.minimumTotal>0) bits.push(st.minimumTotal+' minimum sürüm');
  if(st.courageEvidence>0) bits.push(st.courageEvidence+' cesaret kanıtı');
  if(st.returnCount>0) bits.push(st.returnCount+' ara verip dönüş');
  return '<div style="font-size:var(--f2);color:var(--t3);line-height:1.5;margin-bottom:11px;">'+esc(bits.join(' · '))+' — hepsi gerçek davranış verisi, eksik günler üzerinden değil.</div>';
}
function motivationPanelCardHTML(){
  var allEntries=motivationEntries().slice().reverse(); // ters kronolojik
  var st=motivationStats();
  var filter=UI.motivationFilter||"all";
  var entries=allEntries.filter(function(x){ return motivationEntryMatchesFilter(x,filter); });
  function tone(status){ return status==='completed'?'var(--green)':(status==='minimum_completed'?'var(--gold)':'var(--t3)'); }
  function statusLabel(status){ return status==='completed'?'Tamamlandı':(status==='minimum_completed'?'Minimum':(status==='paused'?'Ara verildi':'Aktif')); }
  function chip(txt,col){ return '<span style="font-size:var(--f1);font-weight:800;padding:2px 8px;border-radius:999px;color:'+col+';background:'+col+'22;border:1px solid '+col+'44;white-space:nowrap;">'+esc(txt)+'</span>'; }
  function entryRow(e){
    var c=tone(e.status);
    var r='<div style="background:var(--s1);border:1px solid var(--bd2);border-radius:12px;padding:10px 12px;">';
    r+='<div style="display:flex;align-items:center;gap:8px;flex-wrap:wrap;">';
    r+='<b style="color:var(--t1);font-weight:800;font-size:var(--f3);">'+esc(fmtTR(e.date))+'</b>';
    r+='<span style="font-size:var(--f1);color:var(--t3);font-weight:700;">Gün '+esc(e.programDay)+'/120</span>';
    r+=chip(statusLabel(e.status),c);
    r+='</div>';
    r+='<div style="font-size:var(--f1);color:var(--t3);margin-top:4px;">'+esc(e.phaseCode||'')+' · '+esc(e.domain||'')+'</div>';
    if(e.quote) r+='<div style="font-size:var(--f2);color:var(--t2);margin-top:6px;line-height:1.45;display:flex;gap:6px;"><span style="flex-shrink:0;opacity:0.55;">'+icon('quote',13)+'</span><span>'+esc(e.quote)+'</span></div>';
    if(e.status==='minimum_completed'&&e.minimumTask) r+='<div style="font-size:var(--f1);color:var(--t3);margin-top:5px;"><b style="color:var(--t2);">Minimum görev:</b> '+esc(e.minimumTask)+'</div>';
    else if(e.standardTask) r+='<div style="font-size:var(--f1);color:var(--t3);margin-top:5px;"><b style="color:var(--t2);">Görev:</b> '+esc(e.standardTask)+'</div>';
    if(e.successMeaning) r+='<div style="font-size:var(--f1);color:var(--t4);margin-top:4px;">'+esc(e.successMeaning)+'</div>';
    if(e.reflection) r+='<div style="font-size:var(--f1);color:var(--t3);margin-top:6px;border-top:1px solid var(--bd);padding-top:6px;"><b style="color:var(--t2);">Not:</b> '+esc(e.reflection)+'</div>';
    r+='</div>';
    return r;
  }
  var act=panelMotivationActiveDay();
  var sum='';
  if(st.programComplete){
    sum+='<div style="background:linear-gradient(90deg,var(--gb),transparent);border:1px solid var(--bd-gold);border-radius:12px;padding:8px 12px;margin-bottom:10px;font-size:var(--f2);color:var(--gold);font-weight:800;display:flex;align-items:center;gap:8px;">'+icon('check',15)+' 120 günlük program tamamlandı · '+esc(fmtTR(String(st.completedAt||'').slice(0,10)))+'</div>';
  }
  if(act){
    sum+='<div style="background:var(--s1);border:1px solid var(--bd2);border-radius:12px;padding:10px 12px;margin-bottom:10px;">';
    sum+='<div style="display:flex;align-items:center;gap:8px;flex-wrap:wrap;margin-bottom:5px;">';
    sum+='<span style="font-size:var(--f2);font-weight:800;color:var(--gold);">Gün '+esc(act.day)+'/120</span>';
    if(act.phaseTitle||act.domainLabel) sum+='<span style="font-size:var(--f1);color:var(--t3);font-weight:700;">'+esc(act.phaseTitle||'')+(act.phaseTitle&&act.domainLabel?' · ':'')+esc(act.domainLabel||'')+'</span>';
    sum+='</div>';
    if(act.quote) sum+='<div style="font-size:var(--f2);color:var(--t2);line-height:1.45;margin-bottom:6px;display:flex;gap:6px;"><span style="flex-shrink:0;opacity:0.55;">'+icon('quote',13)+'</span><span>'+esc(act.quote)+'</span></div>';
    if(act.standardTask) sum+='<div style="font-size:var(--f2);color:var(--t1);line-height:1.45;margin-bottom:6px;display:flex;gap:6px;"><span style="flex-shrink:0;opacity:0.55;">'+icon('clipboard-list',13)+'</span><span><b style="color:var(--gold);">Görev:</b> '+esc(act.standardTask)+'</span></div>';
    if(act.minimumTask) sum+='<div style="font-size:var(--f2);color:var(--t1);line-height:1.45;margin-bottom:6px;display:flex;gap:6px;"><span style="flex-shrink:0;opacity:0.55;">'+icon('shield',13)+'</span><span><b style="color:var(--gold);">Minimum:</b> '+esc(act.minimumTask)+'</span></div>';
    if(act.successMeaning) sum+='<div style="font-size:var(--f2);color:var(--t2);line-height:1.45;margin-bottom:6px;display:flex;gap:6px;"><span style="flex-shrink:0;opacity:0.55;">'+icon('sparkles',13)+'</span><span><b style="color:var(--t2);">Anlam:</b> '+esc(act.successMeaning)+'</span></div>';
    if(act.reflectionQuestion) sum+='<div style="font-size:var(--f2);color:var(--t2);line-height:1.45;margin-bottom:6px;display:flex;gap:6px;"><span style="flex-shrink:0;opacity:0.55;">'+icon('help-circle',13)+'</span><span><b style="color:var(--t2);">Soru:</b> '+esc(act.reflectionQuestion)+'</span></div>';
    if(act.reflectionExamples && act.reflectionExamples.length){
      sum+='<div style="font-size:var(--f2);color:var(--t2);line-height:1.45;margin-bottom:6px;display:flex;flex-direction:column;gap:4px;">';
      sum+='<div style="display:flex;align-items:center;gap:6px;color:var(--gold);font-weight:800;"><span style="flex-shrink:0;opacity:0.7;">'+icon('pen-tool',13)+'</span><span>Örnek yansımalar</span></div>';
      act.reflectionExamples.forEach(function(ex){
        sum+='<div style="padding-left:19px;font-size:var(--f2);color:var(--t3);line-height:1.45;">• '+esc(ex)+'</div>';
      });
      sum+='</div>';
    }
    sum+='</div>';
  }
  sum+='<div class="dstats" style="grid-template-columns:repeat(4,1fr);margin-bottom:0;">'
    +'<div style="text-align:center;"><div style="font-size:var(--f5);font-weight:800;color:var(--gold);">'+st.currentProgramDay+'</div><div style="font-size:var(--f1);color:var(--t3);font-weight:700;">Gün/120</div></div>'
    +'<div style="text-align:center;"><div style="font-size:var(--f5);font-weight:800;color:var(--green);">'+st.pathStreak+'</div><div style="font-size:var(--f1);color:var(--t3);font-weight:700;">Yol</div></div>'
    +'<div style="text-align:center;"><div style="font-size:var(--f5);font-weight:800;color:var(--purple);">'+st.courageEvidence+'</div><div style="font-size:var(--f1);color:var(--t3);font-weight:700;">Cesaret</div></div>'
    +'<div style="text-align:center;"><div style="font-size:var(--f5);font-weight:800;color:var(--t1);">'+allEntries.length+'</div><div style="font-size:var(--f1);color:var(--t3);font-weight:700;">Kayıt</div></div>'
    +'</div>';
  var pct=st.programComplete?100:Math.min(100,Math.round(((st.currentProgramDay-1)/Math.max(1,st.totalDays))*100));
  sum+='<div style="margin-top:10px;height:6px;background:var(--s2);border-radius:999px;overflow:hidden;"><div style="width:'+pct+'%;height:100%;background:var(--ggrad);border-radius:999px;"></div></div>';
  sum+='<div style="font-size:var(--f1);color:var(--t3);margin-top:4px;text-align:right;font-weight:700;">%'+pct+' ilerleme</div>';
  var det='<div class="dstats" style="grid-template-columns:repeat(3,1fr);margin-bottom:11px;">'
    +'<div style="text-align:center;"><div style="font-size:var(--f4);font-weight:800;color:var(--t1);">'+st.bestPathStreak+'</div><div style="font-size:var(--f1);color:var(--t3);font-weight:700;">En iyi yol</div></div>'
    +'<div style="text-align:center;"><div style="font-size:var(--f4);font-weight:800;color:var(--t1);">'+st.returnCount+'</div><div style="font-size:var(--f1);color:var(--t3);font-weight:700;">Dönüş</div></div>'
    +'<div style="text-align:center;"><div style="font-size:var(--f4);font-weight:800;color:var(--t1);">'+st.minimumTotal+'</div><div style="font-size:var(--f1);color:var(--t3);font-weight:700;">Minimum</div></div>'
    +'</div>';
  det+=motivationEvidenceSummaryHTML(allEntries,st);
  var filterDefs=[['all','Tümü'],['standard','Standart'],['minimum','Minimum'],['courage','Cesaret'],['reflection','Notlu']];
  det+='<div class="seg" style="margin-bottom:11px;flex-wrap:wrap;">'+filterDefs.map(function(f){
    return '<button class="'+(filter===f[0]?"active":"")+'" onclick="setMotivationFilter(\''+f[0]+'\')">'+esc(f[1])+'</button>';
  }).join('')+'</div>';
  det+='<div class="scroll" style="max-height:340px;display:flex;flex-direction:column;gap:8px;">';
  if(entries.length) det+=entries.map(entryRow).join('');
  else if(allEntries.length) det+='<div class="empty"><span class="ei">'+icon('compass',20)+'</span>Bu filtreye uyan kayıt yok</div>';
  else det+='<div class="empty"><span class="ei">'+icon('compass',20)+'</span>Henüz kayıt yok</div>';
  det+='</div>';
  var badge='<span style="font-size:var(--f2);color:var(--t3);font-weight:700;">'+st.completedTotal+' tamam</span>';
  return cardWrap({key:'motivation',icon:icon('compass',18),title:'Motivasyon Programı',span:12,order:21,badge:badge,summary:sum,details:det});
}
// ── Saygı Seçkisi (100 kişi) — panelde bugünkü kişi + okuma ilerlemesi ──
var SAYGI_EPOCH='2026-07-13';
function saygiPanelPeople(){ return (typeof window!=='undefined' && window.SaygiPeople && Array.isArray(window.SaygiPeople)) ? window.SaygiPeople : []; }
function saygiPanelPositiveMod(n,m){ return ((n%m)+m)%m; }
function saygiPanelPersonForDate(date){ var people=saygiPanelPeople(); if(!people.length) return null; return people[saygiPanelPositiveMod(diff(SAYGI_EPOCH,date),people.length)]; }
function saygiPanelReadStats(){
  var people=saygiPanelPeople();
  var seen={};
  if(D && D.days){
    for(var dk in D.days){
      var d=D.days[dk];
      if(!d) continue;
      if(d.saygi && d.saygi.readAt && d.saygi.personId) seen[d.saygi.personId]=true;
      var en=(d.reading && Array.isArray(d.reading.entries)) ? d.reading.entries : [];
      en.forEach(function(e){ if(e && e.source==='saygi' && e.personId) seen[e.personId]=true; });
    }
  }
  return { total:people.length, readCount:Object.keys(seen).length };
}
function saygiPanelCardHTML(){
  var todayStr=today();
  var person=saygiPanelPersonForDate(todayStr);
  var rec=recOf(todayStr) || {};
  var readToday=!!(rec.saygi && rec.saygi.readAt);
  if(!readToday){
    var en=(rec.reading && Array.isArray(rec.reading.entries)) ? rec.reading.entries : [];
    if(en.some(function(e){ return e && e.source==='saygi'; })) readToday=true;
  }
  var st=saygiPanelReadStats();
  var pct=st.total ? Math.min(100,Math.round((st.readCount/st.total)*100)) : 0;
  var sum='';
  if(person){
    sum+='<div class="dstats" style="grid-template-columns:1fr auto;align-items:center;margin-bottom:0;">';
    sum+='<div style="min-width:0;">';
    sum+='<div style="font-size:var(--f5);font-weight:800;color:var(--t1);white-space:nowrap;overflow:hidden;text-overflow:ellipsis;">'+esc(person.name)+'</div>';
    sum+='<div style="font-size:var(--f2);color:var(--t3);line-height:1.4;">'+esc(person.field)+' · '+esc(person.era)+'</div>';
    sum+='</div>';
    sum+='<div style="text-align:center;">';
    sum+='<div style="font-size:var(--f5);font-weight:800;color:'+(readToday?'var(--green)':'var(--gold)')+';">'+(readToday?'✓':'○')+'</div>';
    sum+='<div style="font-size:var(--f1);color:var(--t3);font-weight:700;">'+(readToday?'Okundu':'Bugün')+'</div>';
    sum+='</div>';
    sum+='</div>';
  } else {
    sum+='<div class="empty"><span class="ei">'+icon('heart-handshake',20)+'</span>Saygı seçkisi yüklenemedi</div>';
  }
  sum+='<div style="margin-top:10px;height:6px;background:var(--s2);border-radius:999px;overflow:hidden;">';
  sum+='<div style="width:'+pct+'%;height:100%;background:linear-gradient(90deg,var(--teal),var(--green));border-radius:999px;"></div>';
  sum+='</div>';
  sum+='<div style="font-size:var(--f1);color:var(--t3);margin-top:4px;text-align:right;font-weight:700;">'+st.readCount+' / '+st.total+' kişi · %'+pct+'</div>';
  var det='';
  if(person){
    det+='<div style="background:var(--s1);border:1px solid var(--bd2);border-radius:12px;padding:10px 12px;margin-bottom:11px;">';
    det+='<div style="font-size:var(--f3);font-weight:800;color:var(--t2);margin-bottom:5px;">Bugünkü kişi</div>';
    det+='<div style="font-size:var(--f4);font-weight:800;color:var(--t1);margin-bottom:3px;">'+esc(person.name)+'</div>';
    det+='<div style="font-size:var(--f2);color:var(--t3);margin-bottom:6px;">'+esc(person.field)+' · '+esc(person.kind||'')+' · '+esc(person.era)+'</div>';
    det+='<div style="font-size:var(--f2);color:'+(readToday?'var(--green)':'var(--gold)')+';font-weight:800;display:flex;align-items:center;gap:6px;">'+(readToday?(icon('check',14)+' Bugün okundu'):(icon('circle',14)+' Henüz okunmadı'))+'</div>';
    det+='</div>';
  }
  var recent=[];
  if(D && D.days){
    var keys=Object.keys(D.days).sort().reverse();
    for(var i=0;i<keys.length && recent.length<7;i++){
      var d=D.days[keys[i]];
      if(!d || !d.saygi || !d.saygi.readAt || !d.saygi.personId) continue;
      var p=saygiPanelPeople().find(function(x){return x && x.id===d.saygi.personId;});
      if(!p) continue;
      recent.push({date:keys[i],person:p});
    }
  }
  if(recent.length){
    det+='<div style="font-size:var(--f3);font-weight:800;color:var(--t2);margin-bottom:8px;">Son okunanlar</div>';
    det+='<div style="display:flex;flex-direction:column;gap:6px;">';
    recent.forEach(function(r){
      det+='<div style="display:flex;justify-content:space-between;align-items:baseline;padding:6px 8px;background:var(--s1);border:1px solid var(--bd2);border-radius:9px;">';
      det+='<span style="font-size:var(--f2);color:var(--t1);font-weight:700;min-width:0;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;">'+esc(r.person.name)+'</span>';
      det+='<span style="font-size:var(--f1);color:var(--t3);font-weight:700;white-space:nowrap;">'+esc(fmtTR(r.date))+'</span>';
      det+='</div>';
    });
    det+='</div>';
  } else {
    det+='<div class="empty"><span class="ei">'+icon('heart-handshake',20)+'</span>Henüz okuma kaydı yok</div>';
  }
  return cardWrap({key:'saygi',icon:icon('heart-handshake',18),title:'Saygı Seçkisi',span:6,order:22,summary:sum,details:det});
}

// ── Vücut ölçüleri (kilo/boy/BMI) + Tahliller (kan/idrar · foto/PDF) — app ile ayna ──
function discomfortTrendCardHTMLP(){
  var t=discomfortTrendP();
  var h='<div class="card lift span-6 pad" style="order:35;display:flex;flex-direction:column;">';
  h+='<div class="lbl">'+icon('bandage',14)+' Ağrı/Rahatsızlık Trendi'+(t.totalDaysWithPain?('<span style="margin-left:auto;font-size:var(--f2);color:var(--t3);font-weight:800;">'+t.totalDaysWithPain+' gün</span>'):'')+'</div>';
  if(!t.totalDaysWithPain){
    h+='<div class="empty" style="flex:1;"><span class="ei">'+icon('bandage',20)+'</span>Son 30 günde ağrı kaydı yok<span style="font-size:var(--f2);color:var(--t4);">Uygulamada vücut haritasından bölge işaretlenince gelir</span></div>';
  } else {
    h+='<div style="font-size:var(--f1);font-weight:800;letter-spacing:.5px;color:var(--t3);text-transform:uppercase;margin-bottom:6px;">En sık işaretlenen bölgeler</div>';
    h+='<div style="display:flex;flex-direction:column;gap:8px;">';
    t.topRegions.forEach(function(r){
      var pct=Math.max(6,Math.round((r.count/30)*100));
      h+='<div><div style="display:flex;align-items:center;gap:8px;margin-bottom:3px;"><span style="flex:1;font-size:var(--f3);color:var(--t1);font-weight:700;">'+esc(r.label)+'</span><span style="font-size:var(--f2);color:var(--t3);font-weight:800;">'+r.count+' gün</span></div><div style="height:6px;border-radius:999px;background:var(--s1);overflow:hidden;"><div style="height:100%;width:'+pct+'%;border-radius:999px;background:linear-gradient(90deg,#F4C152,#E25B6A);"></div></div></div>';
    });
    h+='</div><div style="font-size:var(--f1);color:var(--t4);margin-top:8px;line-height:1.4;">Son 30 gün · yalnız bölge ve sayım gösterilir, not metni taşınmaz.</div>';
  }
  h+='</div>';
  return h;
}
function panelBodyCardHTML(){
  var b=(D&&D.body)?D.body:null;
  var weights=(b&&Array.isArray(b.weights))?b.weights:[];
  var heightCm=(b&&typeof b.heightCm==="number")?b.heightCm:null;
  var lw=weights.length?weights[weights.length-1]:null;
  var bmi=(heightCm&&lw)?(lw.kg/Math.pow(heightCm/100,2)):null, cat=null;
  if(bmi!=null){ if(bmi<18.5)cat={l:"Zayıf",c:"var(--amber)"}; else if(bmi<25)cat={l:"Normal",c:"var(--green)"}; else if(bmi<30)cat={l:"Fazla kilolu",c:"var(--amber)"}; else cat={l:"Obez",c:"var(--red)"}; }
  var h='<div class="card lift span-6 pad" style="order:35;display:flex;flex-direction:column;">';
  h+='<div class="lbl">'+icon('activity',14)+' Vücut Ölçüleri</div>';
  if(bmi==null&&!weights.length&&heightCm==null){
    h+='<div class="empty" style="flex:1;"><span class="ei">'+icon('activity',20)+'</span>Ölçüm bekleniyor<span style="font-size:var(--f2);color:var(--t4);">Uygulamada boy/kilo girilince gelir</span></div>';
  } else {
    h+='<div class="dstats" style="grid-template-columns:repeat(3,1fr);margin-bottom:11px;">';
    h+='<div class="dstat"><div class="dv">'+(heightCm!=null?heightCm:"—")+'</div><div class="dl">boy cm</div></div>';
    h+='<div class="dstat"><div class="dv">'+(lw?lw.kg:"—")+'</div><div class="dl">kilo kg</div></div>';
    h+='<div class="dstat"><div class="dv" style="color:'+(cat?cat.c:"var(--t1)")+';">'+(bmi!=null?(Math.round(bmi*10)/10).toFixed(1):"—")+'</div><div class="dl">'+(cat?cat.l:"BMI")+'</div></div>';
    h+='</div>';
    if(weights.length){
      var ws=weights.slice(-8), vals=ws.map(function(w){return w.kg;});
      var mn=Math.min.apply(null,vals), mx=Math.max.apply(null,vals), rng=Math.max(0.5,mx-mn);
      var delta=ws.length>=2?(ws[ws.length-1].kg-ws[ws.length-2].kg):0;
      var dCol=delta<0?"var(--green)":(delta>0?"var(--red)":"var(--t4)");
      h+='<div style="display:flex;justify-content:space-between;align-items:baseline;margin-bottom:6px;"><span style="font-size:var(--f1);font-weight:800;letter-spacing:.5px;color:var(--t3);text-transform:uppercase;">Kilo trendi</span>'+(ws.length>=2?'<span style="font-size:var(--f2);font-weight:800;color:'+dCol+';">'+(delta>0?"+":"")+(Math.round(delta*10)/10)+' kg</span>':'')+'</div>';
      h+='<div style="display:flex;align-items:flex-end;gap:4px;height:44px;">';
      ws.forEach(function(w){ var hh=Math.round(8+((w.kg-mn)/rng)*34); h+='<div style="flex:1;display:flex;flex-direction:column;justify-content:flex-end;height:44px;" title="'+esc(w.kg)+' kg">'+'<div style="height:'+hh+'px;border-radius:4px;background:linear-gradient(180deg,#7BA7D0,#4b6f9e);"></div></div>'; });
      h+='</div>';
      h+='<div style="display:flex;gap:4px;margin-top:4px;">'+ws.map(function(w){ return '<span style="flex:1;text-align:center;font-size:9px;color:var(--t4);">'+new Date(w.ts).toLocaleDateString("tr-TR",{day:"2-digit",month:"2-digit"})+'</span>'; }).join('')+'</div>';
      h+='<details style="margin-top:10px;"><summary style="cursor:pointer;font-size:var(--f2);font-weight:800;color:var(--t3);">Tüm kilo kayıtları · '+weights.length+'</summary><div class="scroll" style="max-height:180px;margin-top:7px;display:flex;flex-direction:column;gap:4px;">';
      weights.slice().reverse().forEach(function(w){ h+='<div class="srow"><span class="k">'+new Date(w.ts).toLocaleString("tr-TR",{day:"2-digit",month:"2-digit",year:"2-digit",hour:"2-digit",minute:"2-digit"})+'</span><span class="v mono">'+esc(w.kg)+' kg</span></div>'; });
      h+='</div></details>';
    }
    if(bmi!=null) h+='<div style="font-size:var(--f1);color:var(--t4);margin-top:8px;line-height:1.4;">BMI bilgi amaçlıdır; tıbbi teşhis değildir.</div>';
  }
  h+='</div>';
  return h;
}
function panelLabCardHTML(){
  var results=(D&&Array.isArray(D.labResults))?D.labResults:[];
  var h='<div class="card lift span-6 pad" style="order:35;display:flex;flex-direction:column;">';
  h+='<div class="lbl">'+icon('microscope',14)+' Tahliller'+(results.length?('<span style="margin-left:auto;font-size:var(--f2);color:var(--t3);font-weight:800;">'+results.length+'</span>'):'')+'</div>';
  if(!results.length){
    h+='<div class="empty" style="flex:1;"><span class="ei">'+icon('microscope',20)+'</span>Tahlil bekleniyor<span style="font-size:var(--f2);color:var(--t4);">Uygulamadan kan/idrar sonucu eklenince gelir</span></div>';
  } else {
    h+='<div style="display:flex;flex-direction:column;gap:9px;">';
    results.slice().reverse().forEach(function(r){
      var kindLbl=r.kind==="blood"?"Kan":"İdrar";
      var when=r.ts?new Date(r.ts).toLocaleDateString("tr-TR",{day:"2-digit",month:"2-digit",year:"2-digit"}):"";
      var files=Array.isArray(r.files)?r.files:[];
      var statusLbl=r.status==="reviewed"?"İncelendi":"Analiz ediliyor", statusCls=r.status==="reviewed"?"b-ok":"b-warn";
      h+='<div style="background:var(--s2);border:1px solid var(--bd);border-radius:12px;padding:10px 11px;">';
      h+='<div style="display:flex;align-items:center;gap:8px;margin-bottom:8px;"><span style="display:inline-flex;color:'+(r.kind==="blood"?"#E28A6A":"#E0A93C")+';">'+icon(r.kind==="blood"?"droplet":"microscope",15)+'</span><div style="flex:1;min-width:0;"><div style="font-size:var(--f3);font-weight:800;color:var(--t1);">'+kindLbl+' tahlili</div><div style="font-size:var(--f1);color:var(--t4);">'+when+' · '+files.length+' dosya</div></div><span class="badge '+statusCls+'">'+statusLbl+'</span></div>';
      h+='<div style="display:flex;flex-wrap:wrap;gap:7px;">';
      files.forEach(function(f){
        if(/^image\//.test(f.mime||"")){
          h+='<div id="pm-media-'+esc(f.mediaId)+'" class="pm-media-slot" data-media-id="'+esc(f.mediaId)+'" data-media-kind="image" onclick="aeonOpenImageP('+esc(jsArgP(f.mediaId))+')" style="width:78px;height:78px;border-radius:9px;overflow:hidden;background:var(--s3);display:flex;align-items:center;justify-content:center;cursor:pointer;color:var(--t3);"><span style="font-size:9px;opacity:.7;">…</span></div>';
        } else {
          h+='<button onclick="openPdfP('+esc(jsArgP(f.mediaId))+','+esc(jsArgP(String(f.name||"tahlil.pdf")))+')" style="display:inline-flex;align-items:center;gap:6px;background:var(--s3);border:1px solid var(--bd);color:var(--t1);border-radius:9px;padding:8px 11px;font:inherit;font-size:var(--f2);font-weight:700;cursor:pointer;">'+icon('book',14)+' PDF aç</button>';
        }
      });
      h+='</div></div>';
    });
    h+='</div>';
    h+='<div style="font-size:var(--f1);color:var(--t4);margin-top:9px;line-height:1.4;">Belgeler gizli veri deposunda; fotoğrafa dokun büyüt, PDF\'i yeni sekmede aç.</div>';
  }
  h+='</div>';
  return h;
}
function render(){
  var all=allDays(), saved=lastSavedAt(), opened=lastOpenedAt(), fresh=syncFreshnessP(SYNC_RECEIPT,PANEL_POLL_AT), selected=UI.selectedDate&&recOf(UI.selectedDate)?UI.selectedDate:today();
  if(!UI.month) UI.month=monthKey(selected);
  UI.selectedDate=selected;
  var srec=recOf(selected)||{};
  var cur=windowDays(UI.range,today()), prev=windowDays(UI.range,addDays(today(),-UI.range));
  var curAvg=avg(cur,function(d){return cnt(recOf(d));}), prevAvg=avg(prev,function(d){return cnt(recOf(d));});
  var curSos=sum(cur,function(d){var r=recOf(d);return r&&r.cravingSOSCount?Number(r.cravingSOSCount):0;}), prevSos=sum(prev,function(d){var r=recOf(d);return r&&r.cravingSOSCount?Number(r.cravingSOSCount):0;});
  var stepFn=function(d){var r=recOf(d);return effStepsP(r).steps;};
  var stepDays=cur.filter(function(d){return stepFn(d)>0;});
  var curSteps=stepDays.length?stepDays.reduce(function(a,d){return a+stepFn(d);},0)/stepDays.length:0;
  var stepPeak=cur.reduce(function(m,d){return Math.max(m,stepFn(d));},0);
  var lastStepDate=null; for(var sIdx=cur.length-1;sIdx>=0;sIdx--){ if(stepFn(cur[sIdx])>0){ lastStepDate=cur[sIdx]; break; } }
  var lastStepVal=lastStepDate?stepFn(lastStepDate):0;
  function avgWhere(days,valFn){ var s=0,c=0; days.forEach(function(d){ var v=valFn(recOf(d)); if(v!=null&&!isNaN(v)){ s+=v; c++; } }); return c?s/c:0; }
  var sleepVal=function(r){ return r&&r.sleep&&r.sleep.hours!=null&&r.sleep.hours!==""?Number(r.sleep.hours):null; };
  var curSleep=avgWhere(cur,sleepVal), prevSleep=avgWhere(prev,sleepVal);
  var waterVal=function(r){ return r&&typeof r.water==='number'&&r.water>0?Number(r.water):null; };
  var energyVal=function(r){ return r&&r.energy!=null?Number(r.energy):null; };
  var curWater=avgWhere(cur,waterVal), prevWater=avgWhere(prev,waterVal);
  var waterDays=cur.filter(function(d){return waterVal(recOf(d))!=null;}).length;
  var curEnergy=avgWhere(cur,energyVal), prevEnergy=avgWhere(prev,energyVal);
  var energyDays=cur.filter(function(d){return energyVal(recOf(d))!=null;}).length;
  var rsk=risk(cur,saved);
  var moodDist={"cok-iyi":0,"iyi":0,"normal":0,"zorlandim":0,"cok-zorlandim":0};
  cur.forEach(function(d){var r=recOf(d); if(r&&r.mood&&moodDist[r.mood]!=null) moodDist[r.mood]++;});
  var noteRows=all.slice().reverse().filter(function(d){var r=recOf(d);return r&&( (r.note&&String(r.note).trim()) || (r.journal&&r.journal.text&&String(r.journal.text).trim()) );});
  var sosRows=all.slice().reverse().filter(function(d){var r=recOf(d);return r&&r.cravingSOSCount&&Number(r.cravingSOSCount)>0;});
  var curSess=sessionStats(cur);
  var curRit=readingRecap(cur);
  var srPr=panelReadiness(srec);
  var srMed=(srec.sleep&&srec.sleep.med&&srec.sleep.med.type)?(SLEEP_MED[srec.sleep.med.type]||srec.sleep.med.type):null;
  var syms=(srec.symptoms||[]).map(function(x){return SYM[x]||x;}).join(" · ");
  var loc=panelLocationP();
  var locHist=panelLocationHistoryP();
  var locAgeMin=loc?Math.round((Date.now()-new Date(loc.ts).getTime())/60000):null;
  var locBadgeClass=!loc?"b-dim badge":locAgeMin<120?"badge loc-live":locAgeMin<1440?"badge loc-old":"badge loc-old";
  var locBadgeTxt=!loc?"Konum yok":locAgeMin<60?locAgeMin+"dk önce":locAgeMin<1440?Math.round(locAgeMin/60)+"sa önce":Math.round(locAgeMin/1440)+"g önce";
  var freshClass=fresh.klass==="ok"?"b-ok":fresh.klass==="warn"?"b-warn":"b-danger";
  var rskClass=rsk.klass==="ok"?"b-ok":rsk.klass==="warn"?"b-warn":"b-danger";
  var usePat=usagePattern(cur);
  var lastAct=latestActivityAt(cur);
  var idleMin=lastAct?Math.max(0,Math.round((Date.now()-new Date(lastAct).getTime())/60000)):null;
  var locSum=locationSummary(locHist);
  var todayRec=(D&&D.days)?D.days[today()]:null;
  var mv=todayRec&&todayRec.movement?todayRec.movement:null;
  var mvMode=(D&&D.settings&&D.settings.locationMode)?D.settings.locationMode:'auto';
  var risk7=risk(windowDays(7,today()),saved);
  var risk14=risk(windowDays(14,today()),saved);
  var risk30=risk(windowDays(30,today()),saved);
  var readingRate=cur.length?Math.round((curRit.readDays/cur.length)*100):0;
  var syncLagMin=saved?Math.max(0,Math.round((Date.now()-new Date(saved).getTime())/60000)):null;
  var missingInRange=missingDays(cur);
  var dzMohDays=windowDays(30,today()).reduce(function(a,d){ var r=recOf(d); var ms=r&&r.discomfort&&Array.isArray(r.discomfort.meds)?r.discomfort.meds:[]; return a+(ms.some(function(m){return m&&isAnalgesic(m.name);})?1:0); },0);
  var canonical=canonicalStatusP(SYNC_RECEIPT,PROJECTION.state);

  if(UI.showAuditPage){
    document.getElementById("app").innerHTML=auditPageHTMLP();
    setTimeout(function(){ if(typeof initClampButtons==='function') initClampButtons(); },0);
    return;
  }

  var h="";

  // trend-chip helper
  function tc(now,prev,goodUp){
    var d=now-prev, a=Math.abs(d);
    if(a<0.05) return '<span class="tchip fl">→ 0</span>';
    var good=(d>0)===(goodUp!==false), cls=good?"up":"dn", arr=d>0?"↑":"↓";
    return '<span class="tchip '+cls+'">'+arr+' '+a.toFixed(1)+'</span>';
  }

  // ── D2 COMMAND CENTER ─────────────────────────────────────
  h+='<header class="topbar" data-component="command-center" role="banner" aria-label="ÆON komuta merkezi">';
  h+='<div class="topbar-brand"><div class="brand"><span class="brand-mark" style="color:#1a1404;font-weight:800;">⬡</span><span class="brand-name">ÆON</span></div><span class="brand-context">Observer · Command Center</span></div>';
  h+='<div class="topbar-status" aria-live="polite">'+d2StatusBadgeP(canonical.label,canonical.kind,canonical.cls)+'<span class="topbar-status-detail">'+esc(canonical.detail)+'</span>'+(DEMO_MODE?'<span class="badge status-pending b-warn">Demo · ağ kapalı</span>':'')+(UI.newChanges>0?'<button type="button" class="new-changes-chip" data-component="new-changes" aria-label="'+UI.newChanges+' yeni değişikliği görüntüle" onclick="viewNewChangesP()">'+UI.newChanges+' yeni değişiklik</button>':'')+'</div>';
  h+='<div class="topbar-actions" role="toolbar" aria-label="Panel eylemleri"><div class="density-toggle" data-component="density-toggle" role="group" aria-label="Görünüm yoğunluğu">'+[['quick','Hızlı'],['standard','Standart'],['audit','Audit']].map(function(x){return '<button type="button" aria-pressed="'+(UI.density===x[0]?'true':'false')+'" class="'+(UI.density===x[0]?'active':'')+'" onclick="setDensityP(\''+x[0]+'\')">'+x[1]+'</button>';}).join('')+'</div><button type="button" class="btn command-action" aria-label="Paneli yenile" title="Yenile" onclick="load()">'+icon('rotate-ccw',15)+'<span class="sr-only">Yenile</span></button><button type="button" class="btn command-action" aria-label="Panelden çıkış yap" title="Çıkış" onclick="resetPanelToken()">'+icon('lock',15)+'<span class="sr-only">Çıkış</span></button></div>';
  h+='</header>';

  // ── PAGE ────────────────────────────────────────────────────
  h+='<main class="page density-'+esc(UI.density)+'" data-density="'+esc(UI.density)+'" aria-label="ÆON gözlem paneli">';
  h+=syncRibbonHTMLP(SYNC_RECEIPT,PANEL_POLL_AT,PROJECTION.state);
  h+=commandCenterHeroesHTMLP([
    {key:'ruh',label:'Ruh',icon:'♡',value:srec.mood?esc(MOOD_LABEL[srec.mood]||srec.mood):'Kayıt bekleniyor',detail:'Seçili gün · '+(journalStreak()?journalStreak()+' gün günlük sürekliliği':'günlük ritmi başlat')},
    {key:'beden',label:'Beden',icon:'✦',value:curSleep>0?(Math.round(curSleep*10)/10).toFixed(1)+' sa uyku':'Veri bekleniyor',detail:(curWater>0?'Su '+(Math.round(curWater*10)/10)+'/8':'Su kaydı yok')+(curEnergy>0?' · enerji '+(Math.round(curEnergy*10)/10)+'/5':'')},
    {key:'sureklilik',label:'Süreklilik',icon:'↗',value:currentStreak()+' gün',detail:cur.filter(function(d){return cnt(recOf(d))>0;}).length+'/'+cur.length+' gün kayıt · '+curSess.sessionCount+' oturum'},
    {key:'senkron',label:'Senkron',icon:'⇄',value:d2StatusBadgeP(canonical.label,canonical.kind,canonical.cls),detail:'revision · '+esc(canonical.revision?String(canonical.revision).slice(0,12):'—')+' · '+esc(canonical.detail)}
  ]);
  h+=commandRiskHTMLP(rsk,canonical,PROJECTION.state);
  var naTh=(PROJECTION.sections&&PROJECTION.sections.therapyProvenance)||{status:'missing',thoughts:[],windDown:{status:'missing',events:[]}};
  h+=milestoneRibbonHTMLP(currentStreak(),bestStreak(all),naTh.thoughtCount||0,sosFreeStreakP());
  h+=coverageRibbonHTMLP(PROJECTION.state);
  // REM-60: reminder gözlem durumu kaynak / receipt / capability / privacy /
  // cihaz boyutlarına ayrılmış tek kart olarak gösterilir; tek yeşil rozetle
  // maskeleme yok, working-claim yalnız üç kanıt birlikteyse doğrulanır.
  h+=reminderStatusCardHTMLP(SYNC_RECEIPT,PANEL_POLL_AT,PROJECTION.state,PROJECTION.sectionFetchState);

  // ── erişilebilir hızlı yönlendirme ─────────────────────────
  h+='<div class="d2-controls" data-component="command-actions">';
  h+='<div class="seg" role="group" aria-label="Görüntülenecek zaman aralığı">';
  h+=[7,14,30,90].map(function(n){return '<button type="button" aria-pressed="'+(UI.range===n?'true':'false')+'" class="'+(UI.range===n?"active":"")+'" onclick="setRange('+n+')">'+n+' gün</button>';}).join("");
  h+='</div>';
  h+='<span class="d2-range-label">'+UI.range+' günlük pencere</span>';
  h+='<label class="d2-date-label" for="panel-date">Tarih</label><input id="panel-date" type="date" aria-label="Panel tarihi" value="'+esc(selected)+'" onchange="setSelectedDate(this.value)">';
  h+='</div>';

  // ── JUMP-NAV: 5 bölüme atlama şeridi ──
  h+='<div class="jumpnav" id="jumpnav" data-component="section-navigation" aria-label="Bölüm navigasyonu">';
  SECTIONS.forEach(function(sec){ h+='<button type="button" data-sec="'+sec.id+'" aria-controls="'+sec.id+'" aria-current="false" onclick="jumpToSection(\''+sec.id+'\')">'+sec.ico+' '+sec.title+'</button>'; });
  h+='</div>';

  // ── BENTO GRID ──────────────────────────────────────────────
  h+='<div class="bento">';
  h+=coreStripHTML();
  h+=needsAttentionCardHTMLP(rsk,moodDist,sosRows,missingInRange,curSleep,prevSleep,therapyRecencyTextP(naTh));
  h+=weeklyDigestCardHTMLP(curAvg,prevAvg,curSleep,prevSleep,curSos,prevSos,curSess);
  h+=monthlyHeatmapCardHTMLP(UI.month);
  h+=curatedChangeLogCardHTMLP();
  // 5 sabit bölüm başlığı — CSS "order" ile doğru sıraya yerleşir, kartların DOM sırası/verisi değişmez (sıfır veri kaybı)
  SECTIONS.forEach(function(sec){
    h+='<div class="section-header" id="'+sec.id+'" role="region" aria-labelledby="'+sec.id+'-title" style="order:'+(sec.ord-1)+';"><span class="sh-ico" aria-hidden="true">'+sec.ico+'</span><span class="sh-title" id="'+sec.id+'-title">'+sec.title+'</span><span class="sh-sub">'+sec.sub+'</span></div>';
  });

  // D2 ayrıntı metrikleri — ilk bakış dört hero’da; tam sayısal döküm burada.
  h+='<section class="d2-detail-metrics span-12" data-component="detail-metrics" aria-label="Ayrıntılı metrikler"><div class="d2-detail-head"><b>Ayrıntılı metrikler</b><span>'+UI.range+' günlük pencere · Audit modunda tam görünür</span></div>';
  function kpi(label,val,accent,extra,spark,caption){
    var s='<div class="card lift kpi span-2" style="--accent:'+accent+';order:10;">';
    s+='<div class="kpi-top"><span class="kpi-l">'+label+'</span>'+(extra||'')+'</div>';
    s+='<div class="kpi-v mono">'+val+'</div>';
    if(spark) s+='<div class="kpi-spark">'+spark+'</div>';
    if(caption) s+='<div style="font-size:var(--f1);color:var(--t4);font-weight:600;margin-top:5px;display:flex;gap:10px;flex-wrap:wrap;line-height:1.3;">'+caption+'</div>';
    return s+'</div>';
  }
  h+=kpi('Aktif Seri',currentStreak()+'<small>g</small>','var(--gold)','<span class="tchip fl">en iyi '+bestStreak(all)+'g</span>');
  h+=kpi('Tik Ort',curAvg.toFixed(1)+'<small>/'+HT+'</small>','var(--green)',tc(curAvg,prevAvg,true),sparkLine(cur,function(d){return cnt(recOf(d));},HT,"#4ade80",30));
  h+=kpi('SOS',String(curSos),'var(--red)',tc(curSos,prevSos,false),sparkBar(cur,function(d){var r=recOf(d);return r&&r.cravingSOSCount?Number(r.cravingSOSCount):0;},Math.max(1,curSos),"#fb7185",30));
  h+=kpi('Uyku Ort',(Math.round(curSleep*10)/10).toFixed(1)+'<small>sa</small>','var(--purple)',tc(curSleep,prevSleep,true),sparkLine(cur,function(d){var r=recOf(d);return r&&r.sleep&&r.sleep.hours?Number(r.sleep.hours):0;},10,"#a78bfa",30));
  var stepExtra='<span class="tchip fl">'+stepDays.length+'/'+cur.length+' gün</span>';
  var stepCap='';
  if(stepPeak>0) stepCap+='<span>Tepe <b style="color:var(--t2);">'+Math.round(stepPeak).toLocaleString("tr-TR")+'</b></span>';
  if(lastStepVal>0) stepCap+='<span>Son <b style="color:var(--t2);">'+Math.round(lastStepVal).toLocaleString("tr-TR")+'</b> · '+shortD(lastStepDate)+'</span>';
  h+=kpi('Adım Ort',Math.round(curSteps).toLocaleString("tr-TR"),'var(--amber)',stepExtra,sparkBar(cur,stepFn,Math.max(1,stepPeak),"#fbbf24",30),stepCap);
  var upDays=Math.max(1,diff(D.startDate,today())+1);
  var regFmt=D.startDate?new Date(D.startDate+"T00:00:00").toLocaleDateString("tr-TR",{day:"2-digit",month:"2-digit",year:"2-digit"}):"—";
  var openedShort=opened?new Date(opened).toLocaleString("tr-TR",{hour:"2-digit",minute:"2-digit",day:"2-digit",month:"2-digit"}):"—";
  var useCap='<span>Kayıt <b style="color:var(--t2);">'+regFmt+'</b> · '+upDays+'. gün</span><span>Açılış <b style="color:var(--t2);">'+openedShort+'</b></span>';
  h+=kpi('Kullanım',formatDuration(curSess.totalActive),'var(--gold)','<span class="tchip fl">'+curSess.sessionCount+' oturum</span>',null,useCap);
  h+=kpi('Su Ort',(Math.round(curWater*10)/10).toFixed(1)+'<small>/8</small>','#6Fb1e8',tc(curWater,prevWater,true),sparkBar(cur,function(d){var v=waterVal(recOf(d));return v||0;},8,"#6Fb1e8",30),'<span>'+waterDays+'/'+cur.length+' gün</span>');
  h+=kpi('Enerji Ort',curEnergy>0?(Math.round(curEnergy*10)/10).toFixed(1)+'<small>/5</small>':'—','#E0A93C',tc(curEnergy,prevEnergy,true),sparkLine(cur,function(d){var v=energyVal(recOf(d));return v||0;},5,"#E0A93C",30),'<span>'+energyDays+'/'+cur.length+' gün</span>');
  var mvFn=function(d){var r=recOf(d);return r&&r.movement?Number(r.movement.totalM||0)/1000:0;};
  var mvDays=cur.filter(function(d){return mvFn(d)>0;});
  var mvMax=Math.max.apply(null,[0.5].concat(cur.map(mvFn)));
  var mvTodayKm=mv?Number(mv.totalM||0)/1000:0;
  h+=kpi('Mesafe Bugün',mvTodayKm.toFixed(2)+'<small>km</small>','#7DD389','<span class="tchip fl">'+mvDays.length+'/'+cur.length+' gün</span>',sparkLine(cur,mvFn,mvMax,"#7DD389",30),(mv?('<span style="display:inline-flex;align-items:center;gap:3px;">'+icon('footprints',12)+' '+fmtKmM(mv.walkM)+'</span><span style="display:inline-flex;align-items:center;gap:3px;">'+icon('car',12)+' '+fmtKmM(mv.vehicleM)+'</span>'):''));
  h+='</section>';

  // ROW 1.65: Tatil Modu — uygulamadaki tatil durakları ve su hedefi
  (function(){
    var v=vacationSettingsP(), active=v.enabled&&isVacationDayP(), totalDays=v.enabled&&v.startAt&&v.endAt?(diff(v.endAt,v.startAt)+1):0, pastDays=v.enabled&&v.startAt?Math.max(0,diff(today(),v.startAt)+1):0, left=Math.max(0,totalDays-pastDays);
    var vLabel=v.enabled?(active?'Aktif':(today()<v.startAt?'Yakında':'Bitti')):'Kapalı';
    var vVal=active?left+'<small>g kaldı</small>':'—';
    var vExtra='<span class="tchip fl">'+esc(vLabel)+'</span>';
    var vCap='';
    if(v.enabled&&v.startAt&&v.endAt) vCap+='<span>'+esc(shortD(v.startAt))+'–'+esc(shortD(v.endAt))+'</span>';
    if(v.reason) vCap+='<span style="color:var(--vacation);font-weight:800;">'+esc(v.reason)+'</span>';
    if(v.enabled&&v.enabledAt) vCap+='<span>Açıldı: <b style="color:var(--vacation);">'+esc(trTime(v.enabledAt))+' (TR)</b></span>';
    vCap+='<span>Su hedefi <b style="color:var(--t2);">'+(active?10:8)+'</b> bardak</span>';
    h+=kpi('Tatil Modu',vVal,'var(--vacation)',vExtra,null,vCap);
  })();

  // ROW 1.7: Zihin-Beden Beslenmesi — pilates/ney/binicilik arşiv + haftalık pratik özeti
  (function(){
    ensureSoulArchiveP();
    // Tek kaynak: başlıktaki toplam ve tür kırılımı, aşağıdaki "son kayıtlar"
    // listesiyle AYNI ham günlük seans dizisinden (allSoulArchiveSessionsP)
    // hesaplanır — ayrı, kendi başına artan bir sayaç önbelleği
    // (D.soulArchive.items.totalSessions/.totalMinutes) kullanılmıyor. Böylece
    // "174 sa" gibi bir toplam her zaman görünen kayıtların birebir toplamıdır,
    // ayrı bir önbellekten kayıp/kayma (drift) ile gelemez.
    var allSessions=allSoulArchiveSessionsP();
    var byType={}, totalMins=0;
    allSessions.forEach(function(s){
      var m=Number(s.duration); if(isNaN(m)||m<0) m=0;
      if(!byType[s.type]) byType[s.type]={count:0,mins:0};
      byType[s.type].count++; byType[s.type].mins+=m;
      totalMins+=m;
    });
    var totalSessions=allSessions.length;
    var val=(totalMins>0)?fmtDurationP(totalMins):'—';
    // tür chip'leri
    var parts=[];
    SOUL_ACTIVITY_CATALOG_P.forEach(function(cat){
      var t=byType[cat.id];
      if(t&&t.count>0) parts.push(cat.label+' '+t.count+'x'+(t.mins>0?' '+fmtDurationP(t.mins):''));
    });
    var cap=parts.length?parts.map(function(s){return '<span>'+s+'</span>';}).join('')+(totalSessions>0?'<span style="color:var(--t3);">toplam '+esc(totalSessions+' seans · '+val)+'</span>':''):'<span>Arşivde kayıt yok · uygulamadan pratik eklendiğinde dolar</span>';
    h+='<div class="card lift kpi span-2" style="--accent:var(--soul);order:18;cursor:pointer;" onclick="toggleSoulArchiveP()">';
    h+='<div class="kpi-top"><span class="kpi-l">Zihin-Beden Arşivi</span><span class="tchip fl">'+icon(UI.soulArchiveExpanded?'chevron-up':'chevron-down',12)+' '+esc(UI.soulArchiveExpanded?'kapat':'aç')+'</span></div>';
    h+='<div class="kpi-v mono">'+val+'</div>';
    h+='<div style="font-size:var(--f1);color:var(--t4);font-weight:600;margin-top:5px;display:flex;gap:10px;flex-wrap:wrap;line-height:1.3;">'+cap+'</div>';
    if(UI.soulArchiveExpanded){
      // tür filtre chip'leri
      var typeChips='';
      typeChips+='<button onclick="setSoulArchiveTypeP(null);event.stopPropagation();" class="tchip '+(UI.soulArchiveType===null?'fl':'')+'" style="border:none;background:transparent;cursor:pointer;font:inherit;">Tümü</button>';
      SOUL_ACTIVITY_CATALOG_P.forEach(function(cat){
        var t=byType[cat.id];
        var active=UI.soulArchiveType===cat.id;
        if(t&&t.count>0){
          typeChips+='<button onclick="setSoulArchiveTypeP(\''+cat.id+'\');event.stopPropagation();" class="tchip '+(active?'fl':'')+'" style="border:none;background:transparent;cursor:pointer;font:inherit;color:'+(active?'var(--soul)':'')+';">'+cat.label+' '+t.count+'x</button>';
        }
      });
      h+='<div style="margin-top:10px;display:flex;gap:6px;flex-wrap:wrap;align-items:center;">'+typeChips+'</div>';
      // son kayıt listesi
      var sessions=allSoulArchiveSessionsP().filter(function(s){ return UI.soulArchiveType===null || s.type===UI.soulArchiveType; }).slice(0,12);
      if(sessions.length){
        h+='<div style="margin-top:10px;display:flex;flex-direction:column;gap:6px;max-height:260px;overflow-y:auto;">';
        sessions.forEach(function(s){
          var cat=soulActivityByIdP(s.type);
          var dstr=''; try{ dstr=new Date(s.date+'T00:00:00').toLocaleDateString('tr-TR',{day:'2-digit',month:'2-digit',weekday:'short'}); }catch(e){ dstr=String(s.date); }
          h+='<div style="display:flex;align-items:center;gap:8px;padding:8px 10px;border-radius:10px;background:var(--s1);border:1px solid var(--bd2);">';
          h+='<span style="display:inline-flex;color:'+(cat?cat.color:'var(--soul)')+';">'+icon(cat?cat.icon:'heart-handshake',14)+'</span>';
          h+='<div style="flex:1;min-width:0;">';
          h+='<div style="font-size:var(--f3);font-weight:800;color:var(--t1);">'+(cat?cat.label:esc(s.type))+'</div>';
          h+='<div style="font-size:var(--f1);color:var(--t4);font-weight:600;">'+esc(dstr)+(s.duration?(' · '+fmtDurationP(s.duration)):'')+'</div>';
          if(s.note) h+='<div style="font-size:var(--f1);color:var(--t3);margin-top:2px;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;">'+esc(s.note)+'</div>';
          h+='</div>';
          h+='</div>';
        });
        h+='</div>';
      } else {
        h+='<div style="margin-top:10px;font-size:var(--f2);color:var(--t4);padding:10px;border-radius:10px;background:var(--s1);">Seçili türde arşiv kaydı yok.</div>';
      }
    }
    h+='</div>';
  })();

  // ROW 1.6: Günlük Işığı — serbest günlük refleksiyonu
  (function(){
    var jStreak=journalStreak(), jWords=totalJournalWords(), jLast=lastJournalDate(), jMonth=journalDaysThisMonth();
    var jVal=jStreak>0?jStreak+'<small>g</small>':'—';
    var jExtra='<span class="tchip fl">'+jMonth+'/'+Math.max(1,cur.length)+' gün</span>';
    var jCap=jWords>0?('<span>Toplam <b style="color:var(--t2);">'+jWords.toLocaleString('tr-TR')+'</b> kelime</span><span>Son <b style="color:var(--t2);">'+(jLast?shortD(jLast):'—')+'</b></span>'):'<span>Henüz günlük yok</span>';
    var phase=journalActivePhaseP();
    if(phase&&phase.phaseCode) jCap+='<span style="color:var(--journal);font-weight:800;">'+esc(phase.phaseCode)+' · Gün '+esc(String(phase.dayInPhase||'—'))+'</span>';
    h+=kpi('Günlük Işığı',jVal,'var(--journal)',jExtra,null,jCap);
  })();

  // ROW 1.7: İman Köşesi — namaz takibi (Diyanet vakitleri + konum)
  (function(){
    var tRec=recOf(today())||{}; var p=ensurePrayerDayP(tRec); var ps=prayerDaySummaryP(p);
    var rng=prayerSummaryRangeP(addDays(today(),-6),today());
    var val=ps.total>0?(ps.performed+'<small>/'+ps.total+'</small>'):'—';
    var loc=prayerLocationP();
    var locTxt=(loc&&loc.cityName)?esc(loc.cityName):((loc&&loc.lat)?'Konum ayarlı':'Konum bekleniyor');
    var extra='<span class="tchip fl">'+prayerStreakP()+'g seri</span>';
    var cap=[];
    if(rng.days>0) cap.push('<span>'+rng.performed+'/'+rng.total+' son '+rng.days+' gün</span>');
    if(ps.congregation>0) cap.push('<span><b style="color:var(--t2);">'+ps.congregation+'</b> cemaat</span>');
    if(ps.late>0) cap.push('<span><b style="color:var(--amber);">'+ps.late+'</b> geç</span>');
    if(ps.madeUp>0) cap.push('<span><b style="color:var(--t2);">'+ps.madeUp+'</b> kaza</span>');
    cap.push('<span style="color:var(--faith);font-weight:700;">'+locTxt+'</span>');
    h+=kpi('İman Köşesi',val,'var(--faith)',extra,sparkLine(cur,function(d){ var r=recOf(d); return r?prayerPerformedCountP(ensurePrayerDayP(r)):0; },6,'var(--faith)',30),cap.join(''));
  })();

  // ROW 1.7b: Zikirmatik + İbadet Haftası — panel aynası
  (function(){
    if(!ZIKR_V2_VISIBLE_P) return;
    var zday=zikrDayTotalP(today()), zsets=zikrDaySetsP(today()), streak=zikrStreakP(), znotes=zikrReflectionsP(today());
    var k=faithWeekKPIsP(today()), js=zikrJourneySummaryP();
    var val=zday>0?(zday+'<small>zikir</small>'):'—';
    var extra='<span class="tchip fl">'+streak+'g seri</span>';
    var cap=[];
    if(js&&js.kind==='esma'){
      cap.push('<span><b style="color:var(--zikr);">'+esc(js.name)+'</b> · '+js.cycleNo+'. tur</span>');
      cap.push('<span><b style="color:var(--t2);">'+js.count.toLocaleString('tr-TR')+'</b> / '+js.target.toLocaleString('tr-TR')+' Ebced²</span>');
    }
    if(zsets>0) cap.push('<span><b style="color:var(--t2);">'+zsets+'</b> set bugün</span>');
    if(k.zikr>0) cap.push('<span>Haftada <b style="color:var(--t2);">'+k.zikr+'</b></span>');
    if(js&&js.completedHatims>0) cap.push('<span><b style="color:var(--faith);">'+js.completedHatims+'</b> tam hatim</span>');
    if(js&&js.lifetime>0) cap.push('<span><b style="color:var(--t2);">'+js.lifetime.toLocaleString('tr-TR')+'</b> ömürlük</span>');
    if(znotes.length) cap.push('<span><b style="color:var(--zikr);">'+znotes.length+'</b> tefekkür notu</span>');
    if(k.prays>0) cap.push('<span><b style="color:var(--faith);">'+k.prays+'/'+k.max+'</b> vakit</span>');
    if(k.cong>0) cap.push('<span><b style="color:var(--t2);">'+k.cong+'</b> cemaat</span>');
    h+=kpi('Zikirmatik · Ebced²',val,'var(--zikr)',extra,null,cap.join(''));
  })();
  h+=faithAnnualPanelCardP();
  h+=hijriPanelCardP();
  h+=quranJourneyPanelCardHTML();

  // ROW 1.5: Luna sohbeti (salt-izleme) + ÆON sohbeti (etkileşimli) — WhatsApp thread'leri
  h+=lunaThreadCardHTML();
  h+=aeonThreadCardHTML();

  // Günışığı hava durumu (uygulama Bugün ekranından senkronlanır)
  h+=weatherCardHTML();

  // ROW 2: Map (span-5) + Selected Day (span-4) + Mood (span-3)

  // Map card
  h+='<div class="card lift span-5 pad" style="min-height:248px;display:flex;flex-direction:column;order:30;">';
  h+='<div class="lbl" style="margin-bottom:10px;display:flex;align-items:center;gap:6px;">'+icon('map-pin',14)+' Canlı Konum';
  if(loc){
    var mapsUrl=googleMapsUrlP(loc.lat,loc.lng);
    h+='<a href="'+mapsUrl+'" target="_blank" style="margin-left:auto;font-size:var(--f2);color:var(--gold);text-decoration:none;font-weight:800;letter-spacing:.3px;">Google Maps →</a>';
  }
  h+='</div>';
  if(loc){
    h+='<div id="loc-map" style="flex:1;min-height:170px;"></div>';
    h+='<div id="loc-address" style="font-size:var(--f3);color:var(--t3);margin-top:9px;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;font-weight:600;">Adres çözümleniyor…</div>';
  } else {
    h+='<div class="empty" style="flex:1;"><span class="ei">'+icon('map-pin',20)+'</span>Konum verisi bekleniyor<span style="font-size:var(--f2);color:var(--t4);">Uygulama açıldığında otomatik gelir</span></div>';
  }
  h+='</div>';

  // Konum geçmişi — seçili günün tarihli & zamanlı hareket izi (movement.track)
  (function(){
    var trk=panelMovementTrackP(selected);
    var dTxt=(function(){ try{ return new Date(selected+'T00:00:00').toLocaleDateString('tr-TR',{day:'numeric',month:'long',weekday:'short'}); }catch(e){ return String(selected); } })();
    h+='<div class="card span-12 pad" style="order:31;display:flex;flex-direction:column;">';
    h+='<div class="lbl" style="margin-bottom:10px;display:flex;align-items:center;gap:6px;">'+icon('route',14)+' Konum Geçmişi <span style="margin-left:auto;font-size:var(--f2);color:var(--t4);font-weight:700;">'+esc(dTxt)+'</span></div>';
    if(!trk.length){
      h+='<div class="empty"><span class="ei">'+icon('route',20)+'</span>Bu gün için konum izi yok<span style="font-size:var(--f2);color:var(--t4);">Uygulama açıkken canlı takip ile birikir</span></div>';
    } else {
      var segs=[], curS=null, GAP=8*60000;
      for(var gi=0;gi<trk.length;gi++){ var pt=trk[gi]; var tt=new Date(pt.ts).getTime(); if(isNaN(tt)||pt.lat==null||pt.lng==null) continue;
        if(!curS||curS.mode!==pt.mode||(tt-curS.endT)>GAP){ if(curS) segs.push(curS); curS={mode:pt.mode,startT:tt,endT:tt,dist:0,end:pt,n:1}; }
        else { curS.dist+=haversineKm(curS.end,pt)*1000; curS.endT=tt; curS.end=pt; curS.n++; }
      }
      if(curS) segs.push(curS);
      var hm=function(ms){ return new Date(ms).toLocaleTimeString("tr-TR",{hour:"2-digit",minute:"2-digit"}); };
      var shown=segs.slice(-24).reverse();
      h+='<div style="display:flex;flex-direction:column;max-height:340px;overflow-y:auto;">';
      shown.forEach(function(s){
        var isVeh=s.mode==='vehicle', col=isVeh?'var(--purple)':'var(--green)', ic=isVeh?'car':'footprints', lbl=isVeh?'Araç':'Yürüyüş';
        var maps=googleMapsUrlP(s.end.lat,s.end.lng);
        h+='<div style="display:flex;gap:11px;align-items:flex-start;padding:9px 0;border-bottom:1px solid var(--bd2);">';
        h+='<span style="width:26px;height:26px;border-radius:8px;flex-shrink:0;margin-top:2px;display:inline-flex;align-items:center;justify-content:center;color:'+col+';background:rgba(255,255,255,.05);border:1px solid var(--bd2);">'+icon(ic,14)+'</span>';
        h+='<div style="flex:1;min-width:0;">';
        h+='<div style="display:flex;align-items:baseline;gap:7px;flex-wrap:wrap;"><b class="mono" style="color:var(--t1);font-size:var(--f3);">'+hm(s.startT)+(s.endT>s.startT?' \u2013 '+hm(s.endT):'')+'</b><span style="font-size:var(--f2);color:'+col+';font-weight:800;">'+lbl+'</span>'+(s.dist>30?'<span style="font-size:var(--f2);color:var(--t3);">'+fmtKmM(s.dist)+'</span>':'')+'</div>';
        h+='<div style="font-size:var(--f2);color:var(--t4);margin-top:2px;">'+Number(s.end.lat).toFixed(4)+', '+Number(s.end.lng).toFixed(4)+' \u00b7 <a href="'+maps+'" target="_blank" style="color:var(--gold);text-decoration:none;font-weight:700;">haritada \u2192</a></div>';
        h+='</div></div>';
      });
      h+='</div>';
      if(segs.length>shown.length) h+='<div style="font-size:var(--f2);color:var(--t4);margin-top:8px;text-align:center;">+ '+(segs.length-shown.length)+' \u00f6nceki segment</div>';
      var totM=segs.reduce(function(a,s){return a+s.dist;},0);
      h+='<div style="margin-top:10px;padding-top:9px;border-top:1px solid var(--bd);display:flex;gap:12px;flex-wrap:wrap;font-size:var(--f2);color:var(--t3);"><span>'+trk.length+' nokta</span><span>'+segs.length+' segment</span><span>~'+fmtKmM(totM)+'</span></div>';
    }
    h+='</div>';
  })();

  // Konum Kayıtları — data.locationHistory'nin ham, kronolojik dökümü (son ≤60 GPS
  // örneği, harita üzerindeki noktaların metin listesi). Yukarıdaki "Konum Geçmişi"
  // kartından farklı: o, seçili günün movement.track'inden türetilmiş yürüyüş/araç
  // segmentlerini gösterir; bu ise ham konum örneklerinin kendisini, tarihe bağlı
  // olmadan (biriktiği sırayla) listeler.
  (function(){
    var hist=panelLocationHistoryP();
    h+='<div class="card span-12 pad" style="order:32;display:flex;flex-direction:column;">';
    h+='<div class="lbl" style="margin-bottom:10px;display:flex;align-items:center;gap:6px;">'+icon('map-pin',14)+' Konum Kayıtları <span style="margin-left:auto;font-size:var(--f2);color:var(--t4);font-weight:700;">son '+hist.length+' nokta</span></div>';
    if(!hist.length){
      h+='<div class="empty"><span class="ei">'+icon('map-pin',20)+'</span>Henüz konum kaydı yok<span style="font-size:var(--f2);color:var(--t4);">Uygulama konum açıkken canlı biriktirir</span></div>';
    } else {
      var rows=hist.slice().reverse();
      h+='<div style="display:flex;flex-direction:column;max-height:320px;overflow-y:auto;">';
      rows.forEach(function(p){
        if(!p||p.lat==null||p.lng==null) return;
        var maps=googleMapsUrlP(p.lat,p.lng);
        var when=''; try{ when=new Date(p.ts).toLocaleString('tr-TR',{day:'2-digit',month:'2-digit',hour:'2-digit',minute:'2-digit'}); }catch(e){ when=String(p.ts||''); }
        h+='<div style="display:flex;gap:11px;align-items:center;padding:7px 0;border-bottom:1px solid var(--bd2);">';
        h+='<span style="width:22px;height:22px;border-radius:7px;flex-shrink:0;display:inline-flex;align-items:center;justify-content:center;color:var(--gold);background:rgba(255,255,255,.05);border:1px solid var(--bd2);">'+icon('map-pin',12)+'</span>';
        h+='<div style="flex:1;min-width:0;display:flex;align-items:baseline;gap:8px;flex-wrap:wrap;">';
        h+='<b class="mono" style="color:var(--t1);font-size:var(--f2);">'+esc(when)+'</b>';
        h+='<span style="font-size:var(--f2);color:var(--t4);">'+Number(p.lat).toFixed(4)+', '+Number(p.lng).toFixed(4)+(p.acc!=null?' · ±'+Math.round(p.acc)+'m':'')+'</span>';
        h+='<a href="'+maps+'" target="_blank" style="margin-left:auto;font-size:var(--f2);color:var(--gold);text-decoration:none;font-weight:700;">haritada →</a>';
        h+='</div></div>';
      });
      h+='</div>';
    }
    h+='</div>';
  })();

  // Selected day card — cardWrap() ile özet (dstats+habit chip'leri) her zaman görünür,
  // detay (öğün/semptom/kayıt/not blokları) chevron ile açılır. Üretim mantığı aynen
  // korunur; h'ye eklenen parçalar sonradan slice ile ayrıştırılıp cardWrap'e sarılır —
  // veri/gözlem kaybı yok, yalnızca varsayılan görünürlük değişir.
  var sdMarkStart=h.length;
  h+='<div class="dstats">';
  [
    [cnt(srec)+'<small style="font-size:var(--f3);color:var(--t3);">/'+htOn(selected)+'</small>','Tik','var(--gold)'],
    [srec.mood?(moodIcon(srec.mood,24)||'—'):'—','Mod','var(--t1)'],
    [String(srec.cravingSOSCount||0),'SOS','var(--red)'],
    [srec.sleep&&srec.sleep.hours!=null?srec.sleep.hours+'<small style="font-size:var(--f3);color:var(--t3);">sa</small>':'—','Uyku','var(--purple)'],
    [(typeof srec.water==='number'&&srec.water>0)?srec.water+'<small style="font-size:var(--f3);color:var(--t3);">/8</small>':'—','Su','#6Fb1e8'],
    [srec.energy!=null?srec.energy+'<small style="font-size:var(--f3);color:var(--t3);">/5</small>':'—','Enerji','#E0A93C'],
    [srec.stress!=null?srec.stress+'<small style="font-size:var(--f3);color:var(--t3);">/5</small>':'—','Stres','#C77FB0']
  ].forEach(function(d){
    h+='<div class="dstat"><div class="dv mono" style="color:'+d[2]+';">'+d[0]+'</div><div class="dl">'+d[1]+'</div></div>';
  });
  h+='</div>';
  // habit chips
  h+='<div class="habits">';
  var CRIT={vitaminD:1,water:1,protein:1,sleepReg:1,magnesium:1};
  HABITS.forEach(function(hb){
    var ok=!!(srec.habits&&srec.habits[hb[0]]);
    var derived=DERIVED_P[hb[0]];
    // türetilmiş tikler (su/uyku/yürüyüş) kırmızı uyarı taşımaz — sakin, veri-güdümlü; ilerlemeyi gösterir
    var warn=(!ok && CRIT[hb[0]] && !derived && selected===today());
    var extra='';
    if(derived && !ok){ var p=habitProgP(srec,hb[0],UI.selectedDate); var ac=DERIVED_ACCENT_P[hb[0]]; extra='<span class="hprog" style="color:'+ac+';">'+habitProgLabel(hb[0],p)+'</span>'; }
    h+='<span class="hchip'+(ok?' on':'')+(warn?' warn':'')+(derived&&!ok?' auto':'')+'"'+(warn?' title="'+hb[1]+' bugün işaretlenmedi"':(derived&&!ok?' title="'+hb[1]+' — veri girildiğinde otomatik yeşillenir"':''))+'><span class="habit-dot"></span>'+hb[1]+extra+'</span>';
  });
  h+='</div>';
  // Tatil Modu chip'i seçili gün özetinde
  if(isVacationDayP(UI.selectedDate)){
    var v=vacationSettingsP();
    h+='<div style="margin-top:8px;display:flex;align-items:center;gap:8px;flex-wrap:wrap;">';
    h+='<span class="hchip on" style="--vacation-chip-bg:var(--vacation-bg);background:var(--vacation-chip-bg);border-color:var(--vacation);color:var(--vacation);"><span class="habit-dot" style="background:var(--vacation);box-shadow:0 0 8px var(--vacation);"></span>🌴 Tatil · su hedefi 10</span>';
    if(v.reason) h+='<span class="hchip" style="background:var(--vacation-bg);border-color:var(--vacation);color:var(--vacation);">'+esc(v.reason)+'</span>';
    h+='</div>';
  }
  // Günlük Işığı chip'i seçili gün özetinde
  if(srec.journal&&srec.journal.text&&String(srec.journal.text).trim()){
    var jwc=(typeof srec.journal.wordCount==='number'&&srec.journal.wordCount>0)?srec.journal.wordCount:String(srec.journal.text).trim().split(/\s+/).filter(Boolean).length;
    var jModeLbl=srec.journal.mode?journalModeLabel(srec.journal.mode):'Günlük Işığı';
    h+='<div style="margin-top:8px;display:flex;align-items:center;gap:8px;flex-wrap:wrap;">';
    h+='<span class="hchip on" style="--journal-chip-bg:var(--journal-bg);background:var(--journal-chip-bg);border-color:var(--journal);color:var(--journal);"><span class="habit-dot" style="background:var(--journal);box-shadow:0 0 8px var(--journal);"></span>'+jModeLbl+' · '+jwc+' kelime</span>';
    if(srec.journal.metGoal) h+='<span class="hchip" style="background:var(--journal-bg);border-color:var(--journal);color:var(--journal);">✓ hedef</span>';
    h+='</div>';
  }
  var sdSumEnd=h.length; // özet (dstats+chip) burada biter; bundan sonrası detay olarak sarılır
  // ── Ne yedi? (öğün içerikleri) ──
  var mealRows="";
  var mealIsToday=(selected===today());
  MEALS.forEach(function(m){
    var v=srec.meals&&srec.meals[m[0]]!=null?String(srec.meals[m[0]]).trim():"";
    if(v){
      mealRows+='<div style="display:flex;gap:7px;align-items:baseline;font-size:var(--f3);line-height:1.45;">'
        +'<span style="flex-shrink:0;">'+m[1]+'</span>'
        +'<b style="color:var(--t3);font-weight:800;flex-shrink:0;">'+m[2]+'</b>'
        +'<span style="color:var(--t1);font-weight:600;flex:1;word-break:break-word;">'+esc(v)+'</span></div>';
    } else {
      var gapCol=mealIsToday?'var(--red)':'var(--t4)';
      mealRows+='<div style="display:flex;gap:7px;align-items:baseline;font-size:var(--f3);line-height:1.45;opacity:.85;">'
        +'<span style="flex-shrink:0;filter:grayscale(1);opacity:.55;">'+m[1]+'</span>'
        +'<b style="color:var(--t4);font-weight:800;flex-shrink:0;">'+m[2]+'</b>'
        +'<span style="color:'+gapCol+';font-weight:700;flex:1;">— girilmedi</span></div>';
    }
  });
  h+='<div class="divider"></div>';
  h+='<div class="lbl" style="display:flex;align-items:center;gap:6px;">'+icon('utensils',14)+' Ne Yedi</div>';
  h+=mealRows?'<div style="display:flex;flex-direction:column;gap:7px;">'+mealRows+'</div>'
            :'<div style="font-size:var(--f3);color:var(--t4);font-weight:600;">Bu güne öğün kaydı yok</div>';
  var mealItemRows=[];
  MEALS.forEach(function(m){
    var items=srec.mealItems&&Array.isArray(srec.mealItems[m[0]])?srec.mealItems[m[0]]:[];
    items.filter(function(it){return it&&String(it.name||"").trim();}).forEach(function(it){
      var qty=(it.qty==null||it.qty==="")?"":String(it.qty), unit=it.unit==="gr"?" gr":(it.unit==="adet"?" adet":" tabak");
      mealItemRows.push('<span style="display:inline-flex;gap:5px;align-items:center;padding:4px 8px;border-radius:999px;background:var(--s1);border:1px solid var(--bd2);font-size:var(--f2);color:var(--t2);"><b>'+esc(m[2])+'</b> '+esc((qty?qty+unit+" ":"")+String(it.name).trim())+'</span>');
    });
  });
  if(mealItemRows.length) h+='<div style="display:flex;flex-wrap:wrap;gap:5px;margin-top:8px;">'+mealItemRows.join("")+'</div>';
  // ── Makro özeti (uygulamada Atwater ile hesaplanıp güne yazılır: srec.nutri) ──
  var nmac=srec.nutri;
  if(nmac && ((nmac.calories||0)>0 || (nmac.protein||0)>0)){
    var pC=4*(nmac.protein||0), cC=4*(nmac.carbs||0), fC=9*(nmac.fat||0), tC=pC+cC+fC;
    var mw=function(x){ return tC>0?(x/tC*100):0; };
    h+='<div style="margin-top:9px;background:var(--s1);border:1px solid var(--bd2);border-radius:12px;padding:10px 11px;">';
    h+='<div style="display:flex;align-items:baseline;justify-content:space-between;margin-bottom:7px;"><span style="font-size:var(--f2);font-weight:800;color:var(--t2);">Makro özeti</span><span style="font-size:var(--f3);font-weight:800;color:var(--t1);">'+(nmac.calories||0)+' <small style="color:var(--t4);font-weight:700;">kcal</small></span></div>';
    h+='<div style="height:10px;border-radius:999px;overflow:hidden;display:flex;background:var(--s2);margin-bottom:7px;">';
    if(tC>0){ h+='<div style="width:'+mw(pC)+'%;background:#e08a8a;"></div><div style="width:'+mw(cC)+'%;background:#e6c15a;"></div><div style="width:'+mw(fC)+'%;background:#a78bfa;"></div>'; }
    h+='</div>';
    h+='<div style="display:flex;gap:12px;flex-wrap:wrap;font-size:var(--f1);color:var(--t3);">';
    h+='<span style="display:flex;align-items:center;gap:5px;"><span style="width:8px;height:8px;border-radius:2px;background:#e08a8a;"></span>Protein <b style="color:var(--t1);">'+(nmac.protein||0)+'g</b></span>';
    h+='<span style="display:flex;align-items:center;gap:5px;"><span style="width:8px;height:8px;border-radius:2px;background:#e6c15a;"></span>Karbonhidrat <b style="color:var(--t1);">'+(nmac.carbs||0)+'g</b></span>';
    h+='<span style="display:flex;align-items:center;gap:5px;"><span style="width:8px;height:8px;border-radius:2px;background:#a78bfa;"></span>Yağ <b style="color:var(--t1);">'+(nmac.fat||0)+'g</b></span>';
    h+='</div>';
    var tg=(D&&D.settings&&D.settings.targets)||{};
    var hasTg=(typeof tg.calories==='number'&&typeof tg.protein==='number');
    if(hasTg){
      var calPct=Math.min(100,Math.round(((nmac.calories||0)/tg.calories)*100));
      var proPct=Math.min(100,Math.round(((nmac.protein||0)/tg.protein)*100));
      var carbPct=Math.min(100,Math.round(((nmac.carbs||0)/(tg.carbs||1))*100));
      var fatPct=Math.min(100,Math.round(((nmac.fat||0)/(tg.fat||1))*100));
      h+='<div style="display:flex;gap:10px;flex-wrap:wrap;margin-top:7px;font-size:var(--f1);color:var(--t3);">';
      h+='<span style="display:flex;align-items:center;gap:5px;"><span style="width:8px;height:8px;border-radius:2px;background:#9dc08b;"></span>Kalori hedef <b style="color:var(--t1);">'+tg.calories+' kcal</b> · %'+calPct+'</span>';
      h+='<span style="display:flex;align-items:center;gap:5px;">Protein hedef <b style="color:var(--t1);">'+tg.protein+'g</b> · %'+proPct+'</span>';
      h+='<span style="display:flex;align-items:center;gap:5px;">Karb hedef <b style="color:var(--t1);">'+tg.carbs+'g</b> · %'+carbPct+'</span>';
      h+='<span style="display:flex;align-items:center;gap:5px;">Yağ hedef <b style="color:var(--t1);">'+tg.fat+'g</b> · %'+fatPct+'</span>';
      h+='<span style="display:flex;align-items:center;gap:5px;">Lif hedef <b style="color:var(--t1);">'+tg.fiber+'g</b></span>';
      h+='</div>';
      h+='<div style="margin-top:6px;font-size:var(--f1);color:var(--t3);line-height:1.6;background:var(--s1);border:1px solid var(--bd2);border-radius:10px;padding:8px 10px;">';
      h+='Su <b style="color:var(--t1);">'+tg.waterCups+' bardak</b> · Adım <b style="color:var(--t1);">'+tg.steps.toLocaleString('tr-TR')+'</b> · Uyku <b style="color:var(--t1);">'+tg.sleepHours+' saat</b> · Kafein ≤ <b style="color:var(--t1);">'+tg.caffeineMaxMg+' mg</b> · Magnezyum <b style="color:var(--t1);">'+tg.magnesiumMg+' mg</b> · Demir <b style="color:var(--t1);">'+tg.ironMg+' mg</b> · Omega-3 <b style="color:var(--t1);">'+tg.omega3Mg+' mg</b> · D vitamini <b style="color:var(--t1);">'+tg.vitaminDIU+' IU</b>';
      h+='</div>';
    }
    h+='</div>';
  }
  h+=syms?'<div style="font-size:var(--f3);color:var(--t3);margin-top:10px;font-weight:600;display:flex;align-items:center;gap:5px;">'+icon('flower-2',13)+' '+esc(syms)+'</div>':'<div style="font-size:var(--f3);color:var(--t4);margin-top:10px;font-weight:600;display:flex;align-items:center;gap:5px;">'+icon('flower-2',13)+' Belirti kaydı yok</div>';
  // ── Şeyma'nın diğer girdileri (eksiksiz, girdiği şekliyle) ──
  var exRows="";
  function exRow(label,val){ return '<div style="display:flex;gap:8px;align-items:baseline;font-size:var(--f3);line-height:1.45;"><b style="color:var(--t3);font-weight:800;flex-shrink:0;">'+label+'</b><span style="color:var(--t1);font-weight:600;flex:1;word-break:break-word;white-space:pre-wrap;">'+val+'</span></div>'; }
  // Gözlemci: kullanıcının uygulamada gördüğü her başlık — veri olmasa da görünür (boş ise "—")
  var EMPTY='<span style="color:var(--t4);font-weight:600;">—</span>';
  function exRowAlways(label,val){ return exRow(label, val||EMPTY); }
  exRows+=exRowAlways(icon('target',13)+' Niyet', (srec.intention&&String(srec.intention).trim())?esc(String(srec.intention).trim()):"");
  var sl=srec.sleep||{};
  var sleepBits=[];
  if(sl.hours!=null&&sl.hours!=="") sleepBits.push(esc(String(sl.hours))+' sa');
  if(sl.quality&&SLEEPQ[sl.quality]) sleepBits.push(SLEEPQ[sl.quality]);
  if(sl.med&&sl.med.type&&sl.med.type!=="none"){ var ml=SLEEP_MED[sl.med.type]||sl.med.type; if(sl.med.note&&String(sl.med.note).trim()) ml+=" ("+String(sl.med.note).trim()+")"; sleepBits.push(icon('pill',12)+" "+esc(ml)); }
  var targetBed=(D&&D.settings&&D.settings.targetBed)?String(D.settings.targetBed).trim():"";
  if(targetBed) sleepBits.push(icon('alarm-clock',12)+" Yatma hedefi "+esc(targetBed));
  exRows+=exRowAlways(icon('moon',13)+' Uyku', sleepBits.join(" · "));
  var wd=sl.windDown||{}, wdSteps=wd.steps||{}, wdNames={light:"Işığı kıstı",breath:"4-7-8 nefes",dump:"Zihin boşaltma",cool:"Odayı serinletti"}, wdDone=[];
  if(Array.isArray(wdSteps)) wdSteps.forEach(function(x){ if(x&&x.done) wdDone.push(wdNames[x.key]||x.label||x.key); });
  else Object.keys(wdNames).forEach(function(k){ if(wdSteps[k]) wdDone.push(wdNames[k]); });
  var wdBits=wdDone.slice(); if(wd.lastMinutes!=null) wdBits.push(wd.lastMinutes+" dk"); if(Array.isArray(wd.sessions)&&wd.sessions.length) wdBits.push(wd.sessions.length+" oturum");
  exRows+=exRowAlways(icon('sparkles',13)+' Uyku hazırlığı', wdBits.map(esc).join(" · "));
  exRows+=exRowAlways(icon('pen-line',13)+' Zihin boşaltma', wd.offloadNote&&String(wd.offloadNote).trim()?esc(String(wd.offloadNote).trim()):"");
  var wk=srec.walk||{}, wkBits=[];
  var esP=effStepsP(srec);
  if(esP.steps>0) wkBits.push(esP.steps.toLocaleString("tr-TR")+" adım"+(esP.source==="tracked"?"~":esP.source==="health"?" "+icon('apple',12):""));
  if(wk.minutes!=null&&wk.minutes!=="") wkBits.push(esc(String(wk.minutes))+" dk");
  exRows+=exRowAlways(icon('footprints',13)+' Yürüyüş', wkBits.join(" · "));
  exRows+=exRowAlways(icon('droplet',13)+' Regl', (srec.flow&&FLOW[srec.flow])?FLOW[srec.flow]:"");
  (function(){
    var p=ensurePrayerDayP(srec);
    var bits=[];
    PRAYER_ORDER_P.forEach(function(k){
      var e=p[k]; var name=PRAYER_NAMES_P[k];
      var icons=[]; if(e.performed) icons.push('✓'); if(e.inCongregation) icons.push('🕌'); if(e.madeUp) icons.push('🌙'); if(e.late) icons.push('⏱'); if(e.nafile>0) icons.push('+'+e.nafile);
      var txt=(e.performed?(name+' '+icons.join('')):name);
      bits.push('<span style="display:inline-flex;align-items:center;gap:3px;">'+txt+'</span>');
    });
    var ps=prayerDaySummaryP(p);
    var cap=(ps.performed>0)?(ps.performed+'/'+ps.total+' vakit · '+(ps.congregation?' '+ps.congregation+' cemaat':'')+(ps.madeUp?' · '+ps.madeUp+' kaza':'')+(ps.late?' · '+ps.late+' geç':'')+(ps.nafile?' · '+ps.nafile+' nafile':'')):'Henüz namaz kaydı yok';
    exRows+=exRowAlways(icon('sunrise',13)+' İman Köşesi', '<div style="display:flex;flex-wrap:wrap;gap:6px 10px;line-height:1.4;">'+bits.join('')+'</div><div style="margin-top:4px;font-size:var(--f1);color:var(--t4);font-weight:700;">'+cap+'</div>');
  })();
  (function(){
    var notes=zikrReflectionsP(UI.selectedDate);
    var body=notes.map(function(n){
      var parts=[];
      if(n.mood) parts.push('<span style="display:inline-block;padding:3px 7px;border-radius:99px;background:var(--s2);color:var(--zikr);font-size:var(--f1);font-weight:850;">'+esc(n.mood)+'</span>');
      var text='';
      if(n.feelings) text+='<div style="margin-top:6px;white-space:pre-wrap;word-break:break-word;"><b style="color:var(--zikr);">Hislerim</b><br>'+esc(n.feelings)+'</div>';
      if(n.thoughts) text+='<div style="margin-top:6px;white-space:pre-wrap;word-break:break-word;"><b style="color:var(--zikr);">Düşüncelerim</b><br>'+esc(n.thoughts)+'</div>';
      if(n.intention) text+='<div style="margin-top:6px;white-space:pre-wrap;word-break:break-word;"><b style="color:var(--amber);">Duam · niyetim</b><br>'+esc(n.intention)+'</div>';
      return '<div style="padding:8px 0;border-top:1px solid var(--bd2);"><div style="display:flex;align-items:center;justify-content:space-between;gap:8px;"><strong style="color:var(--t1);">'+esc(n.presetName||((zikrPresetP(n.presetId)||{}).name)||n.presetId)+'</strong>'+parts.join('')+'</div>'+text+'<div style="margin-top:6px;color:var(--t4);font-size:var(--f1);font-weight:700;">'+(Number(n.wordCount)||0)+' kelime · '+esc(String(n.updatedAt||'').slice(11,16))+'</div></div>';
    }).join('');
    exRows+=exRowAlways(icon('pen-line',13)+' Zikir tefekkürleri', body);
  })();
  var caf=(srec.caffeine&&typeof srec.caffeine==='object')?srec.caffeine:null;
  var cafBits=[];
  if(caf){
    var ci=caffeineInfoP(srec,UI.selectedDate), drinks=ci.drinks;
    if(ci.total>0) cafBits.push(ci.total+" mg");
    if(ci.last) cafBits.push("son "+esc(String(ci.last)));
    if(ci.residue>0) cafBits.push("yat. kalıntı "+ci.residue+" mg");
    if(caf.cups!=null&&caf.cups!==""&&!drinks.length) cafBits.push(esc(String(caf.cups))+" fincan");
    if(isVacationDayP(UI.selectedDate)) cafBits.push("limit "+ci.limit+" mg (tatil)");
  }
  var cafTitle=icon('coffee',13)+' Kafein'+(isVacationDayP(UI.selectedDate)?' · tatilde esnetildi':'');
  exRows+=exRowAlways(cafTitle, cafBits.join(" · "));
  if(caf&&Array.isArray(caf.drinks)&&caf.drinks.length){
    var cafDetail=caf.drinks.map(function(d){ var q=Math.max(1,Number(d&&d.qty)||1); return esc((CAFFEINE_LABEL_P[d&&d.type]||d.type||"Kafein")+(q>1?" ×"+q:"")+(d&&d.time?" · "+d.time:"")); }).join(" · ");
    exRows+=exRowAlways(icon('clock',13)+' Kafein ayrıntısı', cafDetail);
  }
  exRows+=exRowAlways(icon('life-buoy',13)+' Kriz (SOS)', (Array.isArray(srec.cravingOptionsUsed)&&srec.cravingOptionsUsed.length)?srec.cravingOptionsUsed.map(function(x){return esc(cleanEmojiText(x));}).filter(Boolean).join(" · "):"");
  var TRIG={tired:"Yorgun",bored:"Sıkıldı",hungry:"Aç",stress:"Stres",habit:"Alışkanlık",emotional:"Duygusal",lowenergy:"Enerji dibi",social:"Keyif/sosyal"};
  var trg=(Array.isArray(srec.cravingTriggers))?srec.cravingTriggers.map(function(x){var k=(x&&x.trigger)?x.trigger:x, bits=[TRIG[k]||String(k)]; if(x&&x.kind) bits.push(x.kind==='sweet'?"tatlı":(x.kind==='food'?"yemek":(x.kind==='coffee'?"kahve":x.kind))); if(x&&x.ts){ try{ bits.push(new Date(x.ts).toLocaleTimeString("tr-TR",{hour:"2-digit",minute:"2-digit"})); }catch(e){} } return esc(bits.join(" · "));}).filter(Boolean):[];
  exRows+=exRowAlways(icon('zap',13)+' Tetik', trg.join(" · "));
  // Yönetilen krizler (bugünün tiklerini besleyen) + serbest tetik notu
  var doneChip=function(){ return '<span style="color:var(--green);display:inline-flex;align-items:center;gap:4px;">'+icon('check',12)+' Yönetildi</span>'; };
  exRows+=exRowAlways(icon('cookie',13)+' Tatlı krizi', srec.craving10MinDone?doneChip():"");
  exRows+=exRowAlways(icon('utensils',13)+' Yemek krizi', srec.foodCravingDone?doneChip():"");
  exRows+=exRowAlways(icon('coffee',13)+' Kahve krizi', srec.coffeeCravingDone?doneChip():"");
  exRows+=exRowAlways(icon('pen-line',13)+' Tetik notu', (srec.cravingTriggerNote&&String(srec.cravingTriggerNote).trim())?esc(String(srec.cravingTriggerNote).trim()):"");
  // Okuma (reading): bugün okunan kitaplar + toplam sayfa/süre
  var rdEn=(srec.reading&&Array.isArray(srec.reading.entries))?srec.reading.entries:[];
  var rdTitles=rdEn.map(function(e){ var t=String(e&&e.title||"").trim(); if(!t) return ""; return e&&e.author?(esc(t)+" — "+esc(String(e.author).trim())):esc(t); }).filter(Boolean);
  exRows+=exRowAlways(icon('book-open',13)+' Okuma', rdTitles.join(" · "));
  var rdBits=[];
  var rdPages=rdEn.reduce(function(a,e){ var p=Number(e&&e.pages); return a+((!isNaN(p)&&p>0)?p:0); },0);
  var rdMins=rdEn.reduce(function(a,e){ var m=Number(e&&e.minutes); return a+((!isNaN(m)&&m>0)?m:0); },0);
  if(rdEn.length>0) rdBits.push(rdEn.length+" kitap");
  if(rdPages>0) rdBits.push(rdPages+" sayfa");
  if(rdMins>0) rdBits.push(rdMins+" dk");
  exRows+=exRowAlways(icon('file-text',13)+' Sayfa', rdBits.join(" · "));
  // İzleme (watching): bugün izlenen film/dizi + bölüm/dk
  var wtEn=(srec.watching&&Array.isArray(srec.watching.entries))?srec.watching.entries:[];
  var wtTitles=wtEn.map(function(e){ var t=String(e&&e.title||"").trim(); if(!t) return ""; var kind=(e&&e.kind==='dizi')?'Dizi':'Film'; return esc(t)+' <span style="color:var(--t4);font-weight:600;">('+kind+')</span>'; }).filter(Boolean);
  exRows+=exRowAlways(icon('clapperboard',13)+' İzleme', wtTitles.join(" · "));
  var wtBits=[];
  var wtEps=wtEn.reduce(function(a,e){ var p=Number(e&&e.episodes); return a+((!isNaN(p)&&p>0)?p:0); },0);
  var wtMins=wtEn.reduce(function(a,e){ var m=Number(e&&e.minutes); return a+((!isNaN(m)&&m>0)?m:0); },0);
  if(wtEn.length>0) wtBits.push(wtEn.length+" kayıt");
  if(wtEps>0) wtBits.push(wtEps+" bölüm");
  if(wtMins>0) wtBits.push(wtMins+" dk");
  exRows+=exRowAlways(icon('clock',13)+' Süre', wtBits.join(" · "));
  // Dinleme (listening): bugün dinlenen şarkı/albüm/podcast + dk
  var lsEn=(srec.listening&&Array.isArray(srec.listening.entries))?srec.listening.entries:[];
  var LKIND={sarki:'Şarkı',album:'Albüm',podcast:'Podcast'};
  var lsTitles=lsEn.map(function(e){ var t=String(e&&e.title||"").trim(); if(!t) return ""; var kind=LKIND[e&&e.kind]||'Şarkı'; return esc(t)+(e&&e.artist?' <span style="color:var(--t4);font-weight:600;">— '+esc(String(e.artist).trim())+'</span>':'')+' <span style="color:var(--t4);font-weight:600;">('+kind+')</span>'; }).filter(Boolean);
  exRows+=exRowAlways(icon('headphones',13)+' Dinleme', lsTitles.join(" · "));
  var lsBits=[];
  var lsMins=lsEn.reduce(function(a,e){ var m=Number(e&&e.minutes); return a+((!isNaN(m)&&m>0)?m:0); },0);
  if(lsEn.length>0) lsBits.push(lsEn.length+" kayıt");
  if(lsMins>0) lsBits.push(lsMins+" dk");
  exRows+=exRowAlways(icon('music',13)+' Süre', lsBits.join(" · "));
  // Öğrenme (learning): bugün öğrenilenler
  var lnEn=(srec.learning&&Array.isArray(srec.learning.entries))?srec.learning.entries:[];
  var lnTitles=lnEn.map(function(e){ var t=String(e&&e.topic||"").trim(); if(!t) return ""; var x=esc(t)+(e&&e.source?' <span style="color:var(--t4);font-weight:600;">— '+esc(String(e.source).trim())+'</span>':''); if(e&&e.note&&String(e.note).trim()) x+='<span style="display:block;color:var(--t3);font-weight:600;margin-top:2px;">'+esc(String(e.note).trim())+'</span>'; return x; }).filter(Boolean);
  exRows+=exRowAlways(icon('brain',13)+' Öğrenme', lnTitles.join(" · "));
  // Zihin-Beden Beslenmesi (soulActivities): kurs & pratik kayıtları
  var saEn=(Array.isArray(srec.soulActivities))?srec.soulActivities:[];
  var saTitles=saEn.map(function(a){ var act=soulActivityByIdP(a.type); var lbl=act?act.label:ucfirst(a.type||''); var dur=fmtDurationP(a.duration); return esc(lbl)+(dur?' <span style="color:var(--soul);font-weight:700;">'+dur+'</span>':'')+(a.note?' <span style="display:block;color:var(--t3);font-weight:600;margin-top:2px;">'+esc(String(a.note).trim())+'</span>':''); }).filter(Boolean);
  exRows+=exRowAlways(icon('heart-handshake',13)+' Zihin-Beden', saTitles.join(" · "));
  var health=srec.health&&typeof srec.health==="object"?srec.health:null;
  if(health){ var hb=[]; if(Number(health.steps)>0) hb.push(Number(health.steps).toLocaleString("tr-TR")+" adım"); if(Number(health.walkM)>0) hb.push(fmtKmM(Number(health.walkM))); if(health.updatedAt){ try{ hb.push("güncelleme "+new Date(health.updatedAt).toLocaleString("tr-TR",{day:"2-digit",month:"2-digit",hour:"2-digit",minute:"2-digit"})); }catch(e){} } exRows+=exRowAlways(icon('activity',13)+' Sağlık senkronu', hb.join(" · ")); }
  var daySessions=Array.isArray(srec.sessions)?srec.sessions.slice():[]; if(srec.liveSession) daySessions.push(srec.liveSession);
  if(daySessions.length){ var sessTxt=daySessions.map(function(s){ var st=s&&s.start?new Date(s.start):null, tm=st&&!isNaN(st.getTime())?st.toLocaleTimeString("tr-TR",{hour:"2-digit",minute:"2-digit"}):"—"; return tm+" · "+formatDuration(Math.round(Number(s&&s.activeSeconds)||0)); }).join(" · "); exRows+=exRowAlways(icon('clock',13)+' Uygulama oturumları', esc(sessTxt)); }
  if(srec.saygi&&srec.saygi.personId){ var sg=srec.saygi, se=rdEn.find(function(e){return e&&e.id===sg.readingEntryId;}); var sb=[se&&se.title?se.title:sg.personId]; if(sg.readAt){ try{ sb.push(new Date(sg.readAt).toLocaleString("tr-TR",{hour:"2-digit",minute:"2-digit"})); }catch(e){} } if(se&&se.sourceLabel) sb.push(se.sourceLabel); exRows+=exRowAlways(icon('heart-handshake',13)+' Saygı', sb.map(esc).join(" · ")); }
  // Şükran (gratitude): bugünün güzel şeyleri
  var grEn=(Array.isArray(srec.gratitude))?srec.gratitude.map(function(g){return String(g==null?"":g).trim();}).filter(Boolean):[];
  exRows+=exRowAlways(icon('heart-handshake',13)+' Şükran', grEn.map(function(g){return esc(g);}).join(" · "));
  // Magnezyum (magnesium): bugün alınan destek ve sebepleri
  var mgRec=srec.magnesium&&typeof srec.magnesium==="object"?srec.magnesium:null;
  if(mgRec){
    var MGFORM_LABELS={glycinate:'Glisinat',citrate:'Sitrat',oxide:'Oksit',sulfate:'Sülfat',unknown:'Belirtilmemiş'};
    var mgBits=[];
    if(mgRec.taken){ var formLabel=mgRec.form?esc(MGFORM_LABELS[mgRec.form]||mgRec.form):'bir form'; mgBits.push(formLabel+(mgRec.mg?', ~'+esc(String(mgRec.mg))+' mg':'')); if(mgRec.time) mgBits.push('saat '+esc(String(mgRec.time))); }
    else if(mgRec.skipped) mgBits.push('önerildi ama alınmadı');
    if(Array.isArray(mgRec.reason)&&mgRec.reason.length) mgBits.push('sinyal: '+mgRec.reason.map(esc).join('+'));
    if(mgRec.effectNote) mgBits.push('etki: '+esc(String(mgRec.effectNote)));
    exRows+=exRowAlways(icon('pill',13)+' Magnezyum', mgBits.join(" · "));
  }
  // Bir yıl önce — seçili günün geçmiş yıllardaki aynı gününden en yakını (salt-okunur nostalji)
  (function(){
    var selMMDD=String(selected).slice(5), selY=parseInt(String(selected).slice(0,4),10), best=null;
    for(var k in D.days){ if(String(k).slice(5)!==selMMDD) continue; var y=parseInt(String(k).slice(0,4),10); if(isNaN(y)||y>=selY) continue; var r=D.days[k]; if(!r) continue;
      var hasG=Array.isArray(r.gratitude)&&r.gratitude.some(function(g){return String(g||"").trim();});
      var has=(cnt(r)>0)||r.mood||(r.note&&String(r.note).trim())||(r.intention&&String(r.intention).trim())||hasG;
      if(!has) continue; if(!best||k>best) best=k;
    }
    var val="";
    if(best){ var br=D.days[best], bits=[]; bits.push(shortD(best)+"."+String(best).slice(0,4));
      if(br.mood&&moodIcon(br.mood,12)) bits.push(moodIcon(br.mood,12));
      bits.push(icon('circle-check',12)+" "+cnt(br)+"/"+htOn(best));
      if(br.intention&&String(br.intention).trim()) bits.push(icon('target',12)+" "+esc(String(br.intention).trim()));
      val=bits.join(" · ");
    }
    exRows+=exRowAlways(icon('lamp',13)+' Bir yıl önce', val);
  })();
  h+='<div class="divider"></div>'; h+='<div style="display:flex;flex-direction:column;gap:7px;">'+exRows+'</div>';
  // ── Bugünün okuma & izleme kayıtları (not dahil tüm detay) ──
  if(rdEn.length>0 || wtEn.length>0 || lsEn.length>0){
    h+='<div class="divider"></div><div class="lbl" style="display:flex;align-items:center;gap:6px;">'+icon('archive',14)+' Okuma & İzleme & Dinleme Kayıtları</div>';
    h+='<div style="display:flex;flex-direction:column;gap:6px;margin-top:2px;">';
    rdEn.forEach(function(e){
      var meta=[]; var p=Number(e&&e.pages); if(!isNaN(p)&&p>0) meta.push(p+' sayfa'); var m=Number(e&&e.minutes); if(!isNaN(m)&&m>0) meta.push(m+' dk');
      h+='<div style="background:var(--s1);border:1px solid var(--bd2);border-radius:10px;border-left:3px solid var(--purple);padding:8px 11px;">'
        +'<div style="display:flex;align-items:baseline;gap:7px;flex-wrap:wrap;"><span style="display:inline-flex;">'+icon('book-open',15)+'</span><b style="color:var(--t1);font-weight:800;font-size:var(--f3);">'+esc(String(e&&e.title||"(başlıksız)").trim())+'</b>'
        +(e&&e.author?'<span style="color:var(--t3);font-size:var(--f2);font-weight:600;">'+esc(String(e.author).trim())+'</span>':'')
        +(meta.length?'<span style="color:var(--purple);font-size:var(--f2);font-weight:700;margin-left:auto;">'+meta.join(' · ')+'</span>':'')+'</div>'
        +((e&&e.note&&String(e.note).trim())?'<div style="color:var(--t2);font-size:var(--f2);line-height:1.45;margin-top:5px;word-break:break-word;white-space:pre-wrap;">“'+esc(String(e.note).trim())+'”</div>':'')
        +'</div>';
    });
    wtEn.forEach(function(e){
      var kind=(e&&e.kind==='dizi')?'Dizi':'Film'; var meta=[]; var ep=Number(e&&e.episodes); if(!isNaN(ep)&&ep>0) meta.push(ep+' bölüm'); var m=Number(e&&e.minutes); if(!isNaN(m)&&m>0) meta.push(m+' dk');
      h+='<div style="background:var(--s1);border:1px solid var(--bd2);border-radius:10px;border-left:3px solid var(--amber);padding:8px 11px;">'
        +'<div style="display:flex;align-items:baseline;gap:7px;flex-wrap:wrap;"><span style="display:inline-flex;">'+(kind==='Dizi'?icon('clapperboard',15):icon('clapperboard',15))+'</span><b style="color:var(--t1);font-weight:800;font-size:var(--f3);">'+esc(String(e&&e.title||"(başlıksız)").trim())+'</b>'
        +'<span style="color:var(--t3);font-size:var(--f2);font-weight:600;">'+kind+'</span>'
        +(meta.length?'<span style="color:var(--amber);font-size:var(--f2);font-weight:700;margin-left:auto;">'+meta.join(' · ')+'</span>':'')+'</div>'
        +((e&&e.note&&String(e.note).trim())?'<div style="color:var(--t2);font-size:var(--f2);line-height:1.45;margin-top:5px;word-break:break-word;white-space:pre-wrap;">“'+esc(String(e.note).trim())+'”</div>':'')
        +'</div>';
    });
    lsEn.forEach(function(e){
      var kind=LKIND[e&&e.kind]||'Şarkı'; var kIco=(e&&e.kind==='podcast')?icon('mic',15):((e&&e.kind==='album')?icon('disc',15):icon('music',15)); var meta=[]; var m=Number(e&&e.minutes); if(!isNaN(m)&&m>0) meta.push(m+' dk');
      h+='<div style="background:var(--s1);border:1px solid var(--bd2);border-radius:10px;border-left:3px solid var(--teal);padding:8px 11px;">'
        +'<div style="display:flex;align-items:baseline;gap:7px;flex-wrap:wrap;"><span style="display:inline-flex;color:var(--teal);">'+kIco+'</span><b style="color:var(--t1);font-weight:800;font-size:var(--f3);">'+esc(String(e&&e.title||"(başlıksız)").trim())+'</b>'
        +((e&&e.artist)?'<span style="color:var(--t3);font-size:var(--f2);font-weight:600;">'+esc(String(e.artist).trim())+'</span>':'')
        +'<span style="color:var(--t3);font-size:var(--f2);font-weight:600;">'+kind+'</span>'
        +(meta.length?'<span style="color:var(--teal);font-size:var(--f2);font-weight:700;margin-left:auto;">'+meta.join(' · ')+'</span>':'')+'</div>'
        +((e&&e.note&&String(e.note).trim())?'<div style="color:var(--t2);font-size:var(--f2);line-height:1.45;margin-top:5px;word-break:break-word;white-space:pre-wrap;">“'+esc(String(e.note).trim())+'”</div>':'')
        +'</div>';
    });
    h+='</div>';
  }
  // ── Bugünün Zihin-Beden pratikleri (soulActivities detay) ──
  if(saEn.length>0){
    h+='<div class="divider"></div><div class="lbl" style="display:flex;align-items:center;gap:6px;">'+icon('heart-handshake',14)+' Zihin-Beden Pratikleri</div>';
    h+='<div style="display:flex;flex-direction:column;gap:6px;margin-top:2px;">';
    saEn.forEach(function(a){
      var act=soulActivityByIdP(a.type);
      var dur=fmtDurationP(a.duration);
      h+='<div style="background:var(--soul-bg);border:1px solid color-mix(in srgb,var(--soul) 22%, var(--bd2));border-radius:10px;padding:8px 11px;">'
        +'<div style="display:flex;align-items:center;gap:8px;flex-wrap:wrap;"><span style="width:28px;height:28px;border-radius:8px;display:inline-flex;align-items:center;justify-content:center;color:#fff;background:linear-gradient(135deg,var(--soul),var(--soul2));flex-shrink:0;">'+icon(act?act.icon:'sparkles',15)+'</span><b style="color:var(--t1);font-weight:800;font-size:var(--f3);">'+(act?act.label:ucfirst(a.type||'(belirsiz)'))+'</b>'+(dur?'<span style="color:var(--soul);font-size:var(--f2);font-weight:700;margin-left:auto;">'+dur+'</span>':'')+'</div>'
        +((a.note&&String(a.note).trim())?'<div style="color:var(--t2);font-size:var(--f2);line-height:1.45;margin-top:5px;word-break:break-word;white-space:pre-wrap;">“'+esc(String(a.note).trim())+'”</div>':'')
        +'</div>';
    });
    h+='</div>';
  }
  // ── Bugünün 3 güzel şeyi (şükran) ──
  if(grEn.length>0){
    h+='<div class="divider"></div><div class="lbl" style="display:flex;align-items:center;gap:6px;">'+icon('heart-handshake',14)+' Bugünün 3 Güzel Şeyi</div>';
    h+='<div style="display:flex;flex-direction:column;gap:6px;margin-top:2px;">';
    grEn.forEach(function(g,i){
      h+='<div style="display:flex;align-items:center;gap:9px;background:var(--s1);border:1px solid var(--bd2);border-radius:10px;border-left:3px solid var(--amber);padding:8px 11px;">'
        +'<span style="width:20px;height:20px;flex-shrink:0;border-radius:50%;background:var(--amber);color:#3a2a10;font-size:var(--f1);font-weight:800;display:flex;align-items:center;justify-content:center;">'+(i+1)+'</span>'
        +'<span style="color:var(--t1);font-size:var(--f3);line-height:1.4;word-break:break-word;">'+esc(g)+'</span></div>';
    });
    h+='</div>';
  }
  var dz=(srec.discomfort&&typeof srec.discomfort==='object')?srec.discomfort:null;
  var dzRegs=dz&&dz.regions?Object.keys(dz.regions).filter(function(k){return dz.regions[k]&&dz.regions[k].level>0;}):[];
  var dzMeds=dz&&Array.isArray(dz.meds)?dz.meds.filter(function(m){return m&&(m.name||m.dose||m.time);}):[];
  var dzNote=dz&&dz.note?String(dz.note).trim():"";
  {
    h+='<div class="divider"></div><div class="lbl" style="display:flex;align-items:center;gap:6px;">'+icon('bandage',14)+' Fiziksel Rahatsızlık & İlaç</div>';
    if(dzRegs.length){
      h+='<div style="display:flex;flex-wrap:wrap;gap:6px;margin-top:2px;">';
      dzRegs.sort(function(a,b){return dz.regions[b].level-dz.regions[a].level;}).forEach(function(k){
        var lv=dz.regions[k].level, col=dzCol(lv);
        h+='<span style="display:inline-flex;align-items:center;gap:6px;padding:4px 10px;border-radius:999px;font-size:var(--f3);font-weight:700;background:'+col+'22;border:1px solid '+col+';color:var(--t1);"><span style="width:8px;height:8px;border-radius:50%;background:'+col+';"></span>'+esc(dzRegLabel(k))+' · '+(DZLEVEL[lv-1]?DZLEVEL[lv-1].label:lv)+'</span>';
      });
      h+='</div>';
    } else { h+='<div style="font-size:var(--f3);color:var(--t4);font-weight:600;margin-top:2px;">Ağrı bölgesi işaretlenmedi</div>'; }
    if(dzNote) h+='<div style="font-size:var(--f3);color:var(--t2);margin-top:8px;line-height:1.45;white-space:pre-wrap;word-break:break-word;display:flex;gap:5px;"><span style="flex-shrink:0;">'+icon('pen-line',13)+'</span><span>'+esc(dzNote)+'</span></div>';
    if(dzMeds.length){
      h+='<div style="display:flex;flex-direction:column;gap:5px;margin-top:8px;">';
      dzMeds.forEach(function(m){
        var bits=[]; if(m.dose&&String(m.dose).trim()) bits.push(esc(String(m.dose).trim())); if(m.time&&String(m.time).trim()) bits.push(esc(String(m.time).trim()));
        h+='<div style="display:flex;gap:7px;align-items:baseline;font-size:var(--f3);line-height:1.4;"><span style="flex-shrink:0;display:inline-flex;">'+icon('pill',14)+'</span><b style="color:var(--t1);font-weight:800;">'+esc(String(m.name||'İlaç').trim())+'</b>'+(bits.length?'<span style="color:var(--t3);font-weight:600;">'+bits.join(' · ')+'</span>':'')+'</div>';
      });
      h+='</div>';
    } else { h+='<div style="font-size:var(--f3);color:var(--t4);font-weight:600;margin-top:8px;display:flex;align-items:center;gap:5px;">'+icon('pill',13)+' İlaç kaydı yok</div>'; }
    if(dzMohDays>=10){
      h+='<div style="margin-top:9px;padding:8px 11px;border-radius:10px;background:rgba(226,91,106,0.12);border:1px solid rgba(226,91,106,0.4);font-size:var(--f2);color:#E58B96;line-height:1.45;font-weight:600;display:flex;gap:6px;"><span style="flex-shrink:0;">'+icon('triangle-alert',14)+'</span><span>Son 30 günde '+dzMohDays+' gün ağrı kesici kaydı var. Sık kullanım (ayda 10-15+ gün) ilaç aşırı kullanımı baş ağrısını tetikleyebilir — hekime danışmak iyi olur.</span></div>';
    }
  }
  // ── Terapi Odası kayıtları (günlük mini araçlar) ──
  var th=srec.therapy||{};
  var thItems=[];
  if(th.dailyWin&&th.dailyWin.text) thItems.push({ic:'sparkles',col:'var(--gold)',t:'Bugünün kazanımı',v:'“'+esc(th.dailyWin.text)+'”'});
  if(th.firstStep&&th.firstStep.text) thItems.push({ic:'footprints',col:'var(--purple)',t:'İlk adım',v:'“'+esc(th.firstStep.text)+'”'});
  if(th.selfCompassion&&th.selfCompassion.note) thItems.push({ic:'heart',col:'var(--rose)',t:'Öz-şefkat',v:'“'+esc(th.selfCompassion.note)+'”'});
  if(th.breath&&th.breath.seconds>0) thItems.push({ic:'wind',col:'var(--teal)',t:'Nefes pratiği',v:Math.round(th.breath.seconds)+' sn'});
  if(th.decision&&th.decision.choice) thItems.push({ic:'scale',col:'var(--purple)',t:'Karar',v:esc(th.decision.choice)});
  if(th.thoughts&&Array.isArray(th.thoughts)&&th.thoughts.length) thItems.push({ic:'brain',col:'var(--rose)',t:'Düşünce kaydı',v:th.thoughts.length+' adet'});
  if(th.share&&th.share.sentAt) thItems.push({ic:'send',col:'var(--gold)',t:'Güvenli paylaşım',v:fmtTime(th.share.sentAt)});
  if(thItems.length){
    h+='<div class="divider"></div><div class="lbl" style="display:flex;align-items:center;gap:6px;">'+icon('heart-handshake',14)+' Terapi Odası</div>';
    h+='<div style="display:flex;flex-direction:column;gap:5px;margin-top:2px;">';
    thItems.forEach(function(it){
      h+='<div style="display:flex;align-items:flex-start;gap:8px;background:var(--s1);border:1px solid var(--bd2);border-radius:10px;border-left:3px solid '+it.col+';padding:7px 10px;">'
        +'<span style="display:inline-flex;flex-shrink:0;color:'+it.col+';">'+icon(it.ic,13)+'</span>'
        +'<div style="min-width:0;"><span style="font-size:var(--f2);font-weight:800;color:var(--t3);text-transform:uppercase;letter-spacing:.3px;">'+it.t+'</span>'
        +'<div style="font-size:var(--f3);color:var(--t1);line-height:1.35;word-break:break-word;">'+it.v+'</div></div></div>';
    });
    h+='</div>';
  }
  h+='<div class="divider"></div><div class="lbl" style="display:flex;align-items:center;gap:6px;">'+icon('pen-line',14)+' Günün Notu / Günlük Işığı</div>';
  var sdHasNote=srec.note&&String(srec.note).trim();
  var sdHasJournal=srec.journal&&srec.journal.text&&String(srec.journal.text).trim();
  if(sdHasNote){
    h+='<div style="margin-top:6px;padding:9px 11px;border-radius:10px;background:var(--s2);font-size:var(--f3);color:var(--t2);line-height:1.45;border:1px solid var(--bd2);border-left:3px solid var(--gold);word-break:break-word;white-space:pre-wrap;">'+esc(String(srec.note).trim())+'</div>';
  }
  if(sdHasJournal){
    var jwc2=(typeof srec.journal.wordCount==='number'&&srec.journal.wordCount>0)?srec.journal.wordCount:String(srec.journal.text).trim().split(/\s+/).filter(Boolean).length;
    var jMode2=srec.journal.mode?journalModeLabel(srec.journal.mode):'Günlük Işığı';
    h+='<div style="margin-top:6px;padding:9px 11px;border-radius:10px;background:var(--journal-bg);font-size:var(--f3);color:var(--t2);line-height:1.45;border:1px solid var(--journal);border-left:3px solid var(--journal);word-break:break-word;white-space:pre-wrap;">';
    h+='<div style="display:flex;align-items:center;gap:6px;margin-bottom:4px;font-size:var(--f2);color:var(--journal);font-weight:800;">'+icon('sparkles',13)+' '+jMode2+' · '+jwc2+' kelime'+(srec.journal.metGoal?' · ✓ hedef':'')+'</div>';
    h+=esc(String(srec.journal.text).trim());
    h+='</div>';
  }
  if(!sdHasNote&&!sdHasJournal){ h+='<div style="font-size:var(--f3);color:var(--t4);font-weight:600;margin-top:4px;">Not veya günlük yazılmadı</div>'; }
  (function(){
    var sdSum=h.slice(sdMarkStart,sdSumEnd);
    var sdDet=h.slice(sdSumEnd);
    h=h.slice(0,sdMarkStart);
    h+=cardWrap({key:'selected-day',icon:icon('calendar',18),title:shortD(selected)+' · Seçili Gün',span:4,order:10,summary:sdSum,details:sdDet});
  })();

  // Mood + Reading card
  h+='<div class="card lift span-3 pad" style="order:20;">';
  h+='<div class="lbl">Mod Dağılımı · '+UI.range+'g</div>';
  var moodColor={"cok-iyi":"#4ade80","iyi":"#a3e635","normal":"#fbbf24","zorlandim":"#fb923c","cok-zorlandim":"#fb7185"};
  var moodTotal=Object.keys(moodDist).reduce(function(a,k){return a+moodDist[k];},0);
  h+='<div class="moodseg">';
  if(moodTotal){
    Object.keys(moodDist).forEach(function(k){
      if(!moodDist[k]) return;
      var pct=moodDist[k]/moodTotal*100;
      h+='<span style="flex:'+moodDist[k]+';background:'+moodColor[k]+';" title="'+(MOOD_LABEL[k]||k)+': '+moodDist[k]+'">'+(pct>=18?'<b class="mono" style="font-size:var(--f1);color:rgba(7,7,9,.68);">'+moodDist[k]+'</b>':"")+'</span>';
    });
  } else {
    h+='<span style="flex:1;background:var(--s3);color:var(--t4);">veri yok</span>';
  }
  h+='</div>';
  h+='<div class="moodlegend">';
  Object.keys(moodDist).forEach(function(k){
    h+='<span class="mlg"><span class="mdot" style="background:'+moodColor[k]+';"></span><span style="font-size:var(--f1);color:var(--t3);font-weight:800;">'+esc(MOOD_LABEL[k]||k)+'</span> <b class="mono">'+moodDist[k]+'</b></span>';
  });
  h+='</div>';
  h+='<div class="divider"></div>';
  h+='<div class="lbl">Okuma & Hazırlık</div>';
  [
    ['Bugün okuma', srPr.readCount>0?'<span style="color:var(--green);display:inline-flex;align-items:center;gap:4px;">'+icon('check',12)+' '+srPr.readCount+' kitap</span>':'<span style="color:var(--t3);">—</span>'],
    ['Bugün sayfa', srPr.readPages>0?(srPr.readPages+' sayfa'):'—'],
    ['Hazırlık skoru', srPr.score+'<span style="color:var(--t3);font-size:var(--f2);">/100</span>'],
    ['İlaç', srMed||"—"],
    ['Okuma · '+UI.range+'g', curRit.readDays+' gün'],
    ['Sayfa · '+UI.range+'g', curRit.totalPages.toLocaleString("tr-TR")]
  ].forEach(function(x){
    h+='<div class="srow"><span class="k">'+x[0]+'</span><span class="v mono">'+x[1]+'</span></div>';
  });
  h+='</div>';

  // ROW 3: Tik trend (span-8) + Dönem Özeti (span-4)
  h+=moodHeatmapCardHTML();
  h+=cycleCardHTML();
  h+=psychCardHTML();
  h+=profileAssessmentCardHTML();
  h+=scientificProfileLightCardHTML();
  h+=motivationPanelCardHTML();
  h+=magnesiumPanelCardHTML();
  h+=saygiPanelCardHTML();
  h+=zikrDetailCardP();
  h+=zikrReflectionArchiveCardP();
  h+='<div class="card lift span-8 pad" style="order:20;">';
  h+='<div class="lbl">Tik Trendi · '+UI.range+'g<span style="margin-left:auto;font-size:var(--f3);color:var(--t3);font-weight:700;letter-spacing:0;text-transform:none;">ort '+curAvg.toFixed(1)+'</span><span style="margin-left:8px;">'+tc(curAvg,prevAvg,true)+'</span></div>';
  h+=sparkLine(cur,function(d){return cnt(recOf(d));},HT,"#e6c15a",76);
  h+='</div>';

  h+='<div class="card lift span-4 pad" style="order:40;">';
  h+='<div class="lbl">Dönem Özeti · '+UI.range+'g</div>';
  [
    ['Tik ortalama',  curAvg.toFixed(1)+' '+trend(curAvg,prevAvg)],
    ['SOS toplam',    curSos+' <span style="color:var(--t3);font-size:var(--f2);">(önce '+prevSos+')</span>'],
    ['Adım ortalama', Math.round(curSteps).toLocaleString("tr-TR")],
    ['Uyku ortalama', (Math.round(curSleep*10)/10).toFixed(1)+' sa'],
    ['Oturum',        curSess.sessionCount+' kez'],
    ['Okuma günü',   curRit.readDays+' gün']
  ].forEach(function(x){
    h+='<div class="srow"><span class="k">'+x[0]+'</span><span class="v mono">'+x[1]+'</span></div>';
  });
  h+='</div>';

  // ROW 4: SOS chart (span-4) + Notes (span-4) + SOS list (span-4)
  h+='<div class="card lift span-4 pad" style="order:40;">';
  h+='<div class="lbl">SOS Yoğunluğu · '+UI.range+'g<span style="margin-left:auto;font-size:var(--f3);color:var(--red);font-weight:800;letter-spacing:0;text-transform:none;">'+curSos+' toplam</span></div>';
  h+=sparkBar(cur,function(d){var r=recOf(d);return r&&r.cravingSOSCount?Number(r.cravingSOSCount):0;},Math.max(1,curSos),"#fb7185",62);
  h+='</div>';

  h+='<div class="card lift span-4 pad" style="order:40;">';
  h+='<div class="lbl">Son Notlar'+(noteRows.length?'<span style="margin-left:auto;font-size:var(--f3);color:var(--t3);font-weight:700;letter-spacing:0;text-transform:none;">'+noteRows.length+'</span>':'')+'</div>';
  h+='<div class="scroll" style="max-height:240px;display:flex;flex-direction:column;gap:7px;">';
  h+=noteRows.length?noteRows.map(function(d){var r=recOf(d);var nt=String(r.note||'').trim();var jt=(r.journal&&r.journal.text)?String(r.journal.text).trim():'';var txt=jt||nt;var isJournal=!!jt;var jMode=(r.journal&&r.journal.mode)?String(r.journal.mode):'';var jLbl=(isJournal?(jMode?('🪶 '+journalModeLabel(jMode)):'🪶 Günlük Işığı'):'📝 Not');return '<div onclick="pickDay(\''+d+'\')" style="cursor:pointer;background:var(--s1);border:1px solid var(--bd2);border-radius:10px;padding:8px 10px;"><div style="display:flex;align-items:center;gap:6px;font-size:var(--f1);color:var(--t4);font-weight:700;margin-bottom:3px;"><span>'+shortD(d)+'</span><span style="font-size:var(--f2);color:var(--journal);font-weight:800;">'+jLbl+'</span></div><div style="color:var(--t2);font-size:var(--f3);line-height:1.45;word-break:break-word;white-space:pre-wrap;">'+esc(txt)+'</div></div>';}).join(""):'<div class="empty"><span class="ei">'+icon('file-text',20)+'</span>Not yok</div>';
  h+='</div></div>';

  h+='<div class="card lift span-4 pad" style="order:40;">';
  h+='<div class="lbl">SOS Geçmişi'+(sosRows.length?'<span style="margin-left:auto;font-size:var(--f3);color:var(--red);font-weight:800;letter-spacing:0;text-transform:none;">'+sosRows.length+' gün</span>':'')+'</div>';
  h+='<div class="scroll" style="max-height:240px;display:flex;flex-direction:column;gap:7px;">';
  h+=sosRows.length?sosRows.map(function(d){var r=recOf(d);var opts=(Array.isArray(r.cravingOptionsUsed)&&r.cravingOptionsUsed.length)?'<div style="color:var(--t2);font-size:var(--f2);line-height:1.4;margin-top:3px;word-break:break-word;white-space:pre-wrap;">'+r.cravingOptionsUsed.map(function(x){return esc(cleanEmojiText(x));}).filter(Boolean).join(" · ")+'</div>':'';return '<div onclick="pickDay(\''+d+'\')" style="cursor:pointer;background:var(--s1);border:1px solid var(--bd2);border-radius:10px;padding:8px 10px;"><div style="display:flex;align-items:center;gap:8px;"><span class="rd mono" style="color:var(--t4);font-weight:700;font-size:var(--f1);">'+shortD(d)+'</span><span style="color:var(--red);font-weight:800;font-size:var(--f3);">SOS ×'+r.cravingSOSCount+'</span></div>'+opts+'</div>';}).join(""):'<div class="empty"><span class="ei">'+icon('life-buoy',20)+'</span>Kriz kaydı yok</div>';
  h+='</div></div>';

  // ROW 5: Pro insights — 4 ayrı kart (Kullanım/Konum/Hareket/Risk) tek "Gelişmiş
  // İçgörüler" akordiyonunda birleşti (Faz 3). Veri kaybı yok: özet şeridi her
  // kategoriden birer öne çıkan metrik gösterir; detayda .seg sekmeleriyle 4
  // kategorinin TÜM satırlarına ulaşılır (render() tetiklemeden sekme değişimi).
  function insRows(rows){
    return rows.map(function(x){ return '<div class="srow"><span class="k">'+x[0]+'</span><span class="v mono">'+x[1]+'</span></div>'; }).join("");
  }
  var usageRows=[
    ['Yoğun saat', usePat.peakHour==null?"—":pad(usePat.peakHour)+':00–'+pad((usePat.peakHour+1)%24)+':00'],
    ['Akşam payı', '%'+usePat.eveningPct],
    ['Ort. oturum', formatDuration(curSess.avgActive||0)],
    ['Boşta süresi', idleMin==null?"—":(idleMin<60?idleMin+' dk':Math.round(idleMin/60)+' sa')]
  ];
  var locEnabled=!!(D&&D.settings&&D.settings.locationEnabled);
  var locAudit=[];
  if(D&&D.settings&&D.settings.locationEnabledAt) locAudit.push('Açıldı: '+fmtIsoShort(D.settings.locationEnabledAt)+' ('+(D.settings.locationEnabledReason||'—')+')');
  if(D&&D.settings&&D.settings.locationDisabledAt) locAudit.push('Kapandı: '+fmtIsoShort(D.settings.locationDisabledAt)+' ('+(D.settings.locationDisabledReason||'—')+')');
  var locRows=[
    ['Durum', locEnabled?icon('toggle-right',13)+' Açık':icon('toggle-left',13)+' Kapalı'],
    ['Nokta sayısı', String(locSum.recentCount)],
    ['Farklı bölge', String(locSum.zoneCount)],
    ['Yaklaşık hareket', locSum.distanceKm.toFixed(1)+' km'],
    ['Doğruluk ort.', locSum.avgAcc==null?"—":"±"+Math.round(locSum.avgAcc)+" m"]
  ].concat(locAudit.map(function(a){ return ['Audit', a]; }));
  var hth=todayRec&&todayRec.health?todayRec.health:null;
  var moveRows=[
    ['Toplam', mv?fmtKmM(mv.totalM):'—'],
    [icon('footprints',13)+' Yürüyüş', mv?fmtKmM(mv.walkM):'—'],
    [icon('car',13)+' Araç', mv?fmtKmM(mv.vehicleM):'—'],
    [icon('clock',13)+' Ayakta süre', mv?fmtDurP(mv.walkSec):'—'],
    [icon('clock',13)+' Yolda süre', mv?fmtDurP(mv.vehicleSec):'—'],
    ['Maks hız', mv&&mv.maxSpeed?Math.round(mv.maxSpeed*3.6)+' km/sa':'—'],
    ['Seçili mod', mvMode==='walk'?(icon('footprints',13)+' Yürüyüş'):mvMode==='vehicle'?(icon('car',13)+' Araç'):(icon('sparkles',13)+' Oto')]
  ];
  if(hth&&(hth.steps>0||hth.walkM>0)) moveRows.push([icon('apple',13)+' Sağlık senkronu', (hth.steps>0?hth.steps.toLocaleString("tr-TR")+' adım':'')+(hth.steps>0&&hth.walkM>0?' · ':'')+(hth.walkM>0?fmtKmM(hth.walkM):'')]);
  var rkc=function(r){return r.klass==="ok"?"var(--green)":r.klass==="warn"?"var(--amber)":"var(--red)";};
  var riskRows=[
    ['Risk trendi','<span style="color:'+rkc(risk7)+'">7g</span> · <span style="color:'+rkc(risk14)+'">14g</span> · <span style="color:'+rkc(risk30)+'">30g</span>'],
    ['Okuma oranı', '%'+readingRate],
    ['Sync gecikmesi', syncLagMin==null?"—":(syncLagMin<60?syncLagMin+" dk":Math.round(syncLagMin/60)+" sa")],
    ['Eksik gün', missingInRange+'/'+cur.length]
  ];
  var insTabs=[
    {key:'usage',ico:icon('clock',13),label:'Kullanım',rows:usageRows},
    {key:'loc',ico:icon('map-pin',13),label:'Konum',rows:locRows},
    {key:'move',ico:icon('footprints',13),label:'Hareket',rows:moveRows},
    {key:'risk',ico:icon('compass',13),label:'Risk',rows:riskRows}
  ];
  var insActive=UI.insightTab||'usage';
  if(!insTabs.some(function(t){return t.key===insActive;})) insActive='usage';
  var insSummary='<div style="display:flex;gap:18px;flex-wrap:wrap;">'+insTabs.map(function(t){
    return '<div style="display:flex;flex-direction:column;gap:2px;min-width:90px;"><span style="font-size:var(--f1);color:var(--t4);font-weight:700;">'+t.ico+' '+t.label+'</span><span class="mono" style="font-size:var(--f3);font-weight:800;">'+String(t.rows[0][1]).replace(/<[^>]+>/g,'')+'</span></div>';
  }).join("")+'</div>';
  var insDetails='<div class="seg ins-seg" style="margin-bottom:10px;">'+insTabs.map(function(t){
    return '<button data-ins-btn="'+t.key+'" class="'+(t.key===insActive?'active':'')+'" onclick="switchInsightPane(\''+t.key+'\')">'+t.ico+' '+t.label+'</button>';
  }).join("")+'</div>';
  insDetails+=insTabs.map(function(t){
    return '<div class="ins-pane" data-ins="'+t.key+'" style="'+(t.key===insActive?'':'display:none;')+'">'+insRows(t.rows)+'</div>';
  }).join("");
  h+=cardWrap({key:'insights',icon:icon('search',18),title:'Gelişmiş İçgörüler',span:12,order:30,summary:insSummary,details:insDetails});


  // ═════════ KÜTÜPHANE · İZLEME ARŞİVİ · ALINTILAR ═════════
  (function(){
    var LIB=(D&&D.library&&Array.isArray(D.library.books))?D.library.books:[];
    var WL=(D&&D.watchlist&&Array.isArray(D.watchlist.items))?D.watchlist.items:[];
    var LG=(D&&D.library&&D.library.goal)?D.library.goal:{};
    var WG=(D&&D.watchlist&&D.watchlist.goal)?D.watchlist.goal:{};
    var yr=new Date().getFullYear();
    function pbar(pct,col){ pct=Math.max(0,Math.min(100,Math.round(pct||0))); return '<div style="height:6px;border-radius:999px;background:var(--s3);overflow:hidden;margin-top:6px;"><div style="height:100%;width:'+pct+'%;background:'+col+';border-radius:999px;"></div></div>'; }
    function chip(txt,col){ return '<span style="font-size:var(--f1);font-weight:800;padding:2px 8px;border-radius:999px;color:'+col+';background:'+col+'22;border:1px solid '+col+'44;white-space:nowrap;">'+txt+'</span>'; }
    function stars(r){ if(!r) return ''; return '<span style="color:var(--gold);font-size:var(--f2);letter-spacing:1px;white-space:nowrap;">'+Array(r+1).join('★')+'<span style="color:var(--t4);">'+Array(6-r).join('★')+'</span></span>'; }
    function finDate(iso){ if(!iso) return ''; try{ var d=new Date(iso); return shortD(fmt(d)); }catch(e){ return ''; } }

    function bookRow(b){
      var st={reading:['Okunuyor','var(--purple)'],finished:['Bitti','var(--green)'],dropped:['Ara verildi','var(--amber)']}[b.status]||['Okunuyor','var(--purple)'];
      var total=Number(b.totalPages)||0, cur=Number(b.currentPage)||0;
      var pct=b.status==='finished'?100:(total>0?(cur/total*100):0);
      var meta=[]; if(b.author) meta.push(esc(String(b.author).trim())); if(b.genre) meta.push(esc(String(b.genre).trim()));
      var qn=(Array.isArray(b.quotes)?b.quotes.length:0);
      var s='<div style="background:var(--s1);border:1px solid var(--bd2);border-radius:12px;padding:10px 12px;">';
      s+='<div style="display:flex;align-items:flex-start;gap:9px;">';
      s+='<span style="line-height:1.1;flex-shrink:0;display:inline-flex;color:var(--purple);">'+icon('book-open',20)+'</span>';
      s+='<div style="flex:1;min-width:0;"><div style="display:flex;align-items:center;gap:7px;flex-wrap:wrap;"><b style="color:var(--t1);font-weight:800;font-size:var(--f3);">'+esc(String(b.title||'').trim())+'</b>'+chip(st[0],st[1])+'</div>';
      if(meta.length) s+='<div style="color:var(--t3);font-size:var(--f1);margin-top:1px;">'+meta.join(' · ')+(qn?' · '+icon('quote',11)+' '+qn:'')+'</div>';
      s+='</div>'+(b.rating?stars(b.rating):'')+'</div>';
      if(b.status!=='finished'){
        s+=pbar(pct,'linear-gradient(90deg,var(--purple),#e9afc1)');
        s+='<div style="display:flex;justify-content:space-between;color:var(--t3);font-size:var(--f1);font-weight:700;margin-top:4px;"><span>'+cur+(total?' / '+total+' sf':' sf')+'</span><span>%'+Math.round(pct)+'</span></div>';
      } else {
        s+='<div style="color:var(--t4);font-size:var(--f1);font-weight:600;margin-top:5px;display:flex;align-items:center;gap:4px;">'+icon('trophy',12)+' '+(finDate(b.finishedAt)?finDate(b.finishedAt)+' tarihinde bitti':'Tamamlandı')+(total?' · '+total+' sayfa':'')+'</div>';
      }
      return s+'</div>';
    }
    function titleRow(t){
      var st={watching:['İzleniyor','var(--amber)'],finished:['Bitti','var(--green)'],dropped:['Yarıda','var(--purple)']}[t.status]||['İzleniyor','var(--amber)'];
      var total=Number(t.totalEp)||0, cur=Number(t.watchedEp)||0;
      var pct=t.status==='finished'?100:(total>0?(cur/total*100):0);
      var meta=[t.kind==='dizi'?'Dizi':'Film']; if(t.genre) meta.push(esc(String(t.genre).trim()));
      var qn=(Array.isArray(t.quotes)?t.quotes.length:0);
      var s='<div style="background:var(--s1);border:1px solid var(--bd2);border-radius:12px;padding:10px 12px;">';
      s+='<div style="display:flex;align-items:flex-start;gap:9px;">';
      s+='<span style="line-height:1.1;flex-shrink:0;display:inline-flex;color:var(--amber);">'+icon('clapperboard',20)+'</span>';
      s+='<div style="flex:1;min-width:0;"><div style="display:flex;align-items:center;gap:7px;flex-wrap:wrap;"><b style="color:var(--t1);font-weight:800;font-size:var(--f3);">'+esc(String(t.title||'').trim())+'</b>'+chip(st[0],st[1])+'</div>';
      s+='<div style="color:var(--t3);font-size:var(--f1);margin-top:1px;">'+meta.join(' · ')+(qn?' · '+icon('quote',11)+' '+qn:'')+'</div>';
      s+='</div>'+(t.rating?stars(t.rating):'')+'</div>';
      if(t.status!=='finished' && t.kind==='dizi'){
        s+=pbar(pct,'linear-gradient(90deg,var(--amber),#e9afc1)');
        s+='<div style="display:flex;justify-content:space-between;color:var(--t3);font-size:var(--f1);font-weight:700;margin-top:4px;"><span>'+cur+(total?' / '+total+' bölüm':' bölüm')+'</span><span>%'+Math.round(pct)+'</span></div>';
      } else if(t.status==='finished'){
        s+='<div style="color:var(--t4);font-size:var(--f1);font-weight:600;margin-top:5px;display:flex;align-items:center;gap:4px;">'+icon('trophy',12)+' '+(finDate(t.finishedAt)?finDate(t.finishedAt)+' tarihinde bitti':'Tamamlandı')+'</div>';
      }
      return s+'</div>';
    }
    function orderBy(arr,key){ var o=key==='book'?{reading:0,finished:1,dropped:2}:{watching:0,finished:1,dropped:2}; return arr.slice().sort(function(a,b){ return (o[a.status]-o[b.status])||String(b.createdAt||'').localeCompare(String(a.createdAt||'')); }); }

    // ---- Kütüphane ----
    var libFin=LIB.filter(function(b){return b.status==='finished';}).length;
    var libRead=LIB.filter(function(b){return b.status==='reading';}).length;
    var libFinYear=LIB.filter(function(b){return b.status==='finished'&&b.finishedAt&&new Date(b.finishedAt).getFullYear()===yr;}).length;
    var libPages=0; for(var dk in D.days){ var rr=D.days[dk]; var en=(rr&&rr.reading&&Array.isArray(rr.reading.entries))?rr.reading.entries:[]; en.forEach(function(e){ var p=Number(e&&e.pages); if(!isNaN(p)&&p>0) libPages+=p; }); }
    var libSum='<div class="dstats" style="grid-template-columns:repeat(4,1fr);margin-bottom:0;">'
      +'<div style="text-align:center;"><div style="font-size:var(--f5);font-weight:800;color:var(--purple);">'+libRead+'</div><div style="font-size:var(--f1);color:var(--t3);font-weight:700;">Okunuyor</div></div>'
      +'<div style="text-align:center;"><div style="font-size:var(--f5);font-weight:800;color:var(--green);">'+libFin+'</div><div style="font-size:var(--f1);color:var(--t3);font-weight:700;">Bitti</div></div>'
      +'<div style="text-align:center;"><div style="font-size:var(--f5);font-weight:800;color:var(--gold);">'+libPages.toLocaleString("tr-TR")+'</div><div style="font-size:var(--f1);color:var(--t3);font-weight:700;">Sayfa</div></div>'
      +'<div style="text-align:center;"><div style="font-size:var(--f5);font-weight:800;color:var(--t1);">'+libFinYear+(LG.yearlyBooks?'<span style="color:var(--t4);font-size:var(--f2);">/'+LG.yearlyBooks+'</span>':'')+'</div><div style="font-size:var(--f1);color:var(--t3);font-weight:700;">'+yr+'</div></div>'
      +'</div>';
    var libDet='<div class="scroll" style="max-height:340px;display:flex;flex-direction:column;gap:8px;">';
    libDet+= LIB.length? orderBy(LIB,'book').map(bookRow).join('') : '<div class="empty"><span class="ei">'+icon('book',20)+'</span>Kitaplık boş</div>';
    libDet+='</div>';
    h+=cardWrap({key:'lib-archive',icon:icon('book',18),title:'Kütüphane',badge:'<span style="font-size:var(--f2);color:var(--t3);font-weight:700;">'+LIB.length+' kitap</span>',span:6,order:50,summary:libSum,details:libDet});

    // ---- İzleme Arşivi ----
    var wFin=WL.filter(function(t){return t.status==='finished';}).length;
    var wWatch=WL.filter(function(t){return t.status==='watching';}).length;
    var wFinYear=WL.filter(function(t){return t.status==='finished'&&t.finishedAt&&new Date(t.finishedAt).getFullYear()===yr;}).length;
    var wMin=0; for(var dk2 in D.days){ var rr2=D.days[dk2]; var en2=(rr2&&rr2.watching&&Array.isArray(rr2.watching.entries))?rr2.watching.entries:[]; en2.forEach(function(e){ var m=Number(e&&e.minutes); if(!isNaN(m)&&m>0) wMin+=m; }); }
    var wHours=wMin>=60?(Math.floor(wMin/60)+' sa'+(wMin%60?' '+(wMin%60)+' dk':'')):(wMin+' dk');
    var wSum='<div class="dstats" style="grid-template-columns:repeat(4,1fr);margin-bottom:0;">'
      +'<div style="text-align:center;"><div style="font-size:var(--f5);font-weight:800;color:var(--amber);">'+wWatch+'</div><div style="font-size:var(--f1);color:var(--t3);font-weight:700;">İzleniyor</div></div>'
      +'<div style="text-align:center;"><div style="font-size:var(--f5);font-weight:800;color:var(--green);">'+wFin+'</div><div style="font-size:var(--f1);color:var(--t3);font-weight:700;">Bitti</div></div>'
      +'<div style="text-align:center;"><div style="font-size:var(--f5);font-weight:800;color:var(--gold);">'+esc(wHours)+'</div><div style="font-size:var(--f1);color:var(--t3);font-weight:700;">Süre</div></div>'
      +'<div style="text-align:center;"><div style="font-size:var(--f5);font-weight:800;color:var(--t1);">'+wFinYear+(WG.yearlyTitles?'<span style="color:var(--t4);font-size:var(--f2);">/'+WG.yearlyTitles+'</span>':'')+'</div><div style="font-size:var(--f1);color:var(--t3);font-weight:700;">'+yr+'</div></div>'
      +'</div>';
    var wDet='<div class="scroll" style="max-height:340px;display:flex;flex-direction:column;gap:8px;">';
    wDet+= WL.length? orderBy(WL,'title').map(titleRow).join('') : '<div class="empty"><span class="ei">'+icon('clapperboard',20)+'</span>Arşiv boş</div>';
    wDet+='</div>';
    h+=cardWrap({key:'watch-archive',icon:icon('clapperboard',18),title:'İzleme Arşivi',badge:'<span style="font-size:var(--f2);color:var(--t3);font-weight:700;">'+WL.length+' yapım</span>',span:6,order:50,summary:wSum,details:wDet});

    // ---- Dinleme Arşivi (müzik favorileri) ----
    var MUS=(D&&D.music&&Array.isArray(D.music.items))?D.music.items:[];
    function trackRow(x){
      var kindLbl={sarki:'Şarkı',album:'Albüm',podcast:'Podcast'}[x.kind]||'Şarkı';
      var meta=[kindLbl]; if(x.artist) meta.push(esc(String(x.artist).trim())); if(x.genre) meta.push(esc(String(x.genre).trim()));
      var qn=(Array.isArray(x.quotes)?x.quotes.length:0);
      var s='<div style="background:var(--s1);border:1px solid var(--bd2);border-radius:12px;padding:10px 12px;">';
      s+='<div style="display:flex;align-items:flex-start;gap:9px;">';
      s+='<span style="line-height:1.1;flex-shrink:0;display:inline-flex;color:var(--teal);">'+icon('music',20)+'</span>';
      s+='<div style="flex:1;min-width:0;"><div style="display:flex;align-items:center;gap:7px;flex-wrap:wrap;"><b style="color:var(--t1);font-weight:800;font-size:var(--f3);">'+esc(String(x.title||'').trim())+'</b>'+chip(kindLbl,'var(--teal)')+'</div>';
      s+='<div style="color:var(--t3);font-size:var(--f1);margin-top:1px;">'+meta.join(' · ')+(qn?' · '+icon('quote',11)+' '+qn:'')+'</div>';
      s+='</div>'+(x.rating?stars(x.rating):'')+'</div>';
      return s+'</div>';
    }
    var musSong=MUS.filter(function(x){return x.kind==='sarki';}).length;
    var musAlbum=MUS.filter(function(x){return x.kind==='album';}).length;
    var musPod=MUS.filter(function(x){return x.kind==='podcast';}).length;
    var lMin=0; for(var dk3 in D.days){ var rr3=D.days[dk3]; var en3=(rr3&&rr3.listening&&Array.isArray(rr3.listening.entries))?rr3.listening.entries:[]; en3.forEach(function(e){ var m=Number(e&&e.minutes); if(!isNaN(m)&&m>0) lMin+=m; }); }
    var lHours=lMin>=60?(Math.floor(lMin/60)+' sa'+(lMin%60?' '+(lMin%60)+' dk':'')):(lMin+' dk');
    var mSum='<div class="dstats" style="grid-template-columns:repeat(4,1fr);margin-bottom:0;">'
      +'<div style="text-align:center;"><div style="font-size:var(--f5);font-weight:800;color:var(--teal);">'+musSong+'</div><div style="font-size:var(--f1);color:var(--t3);font-weight:700;">Şarkı</div></div>'
      +'<div style="text-align:center;"><div style="font-size:var(--f5);font-weight:800;color:var(--purple);">'+musAlbum+'</div><div style="font-size:var(--f1);color:var(--t3);font-weight:700;">Albüm</div></div>'
      +'<div style="text-align:center;"><div style="font-size:var(--f5);font-weight:800;color:var(--pink);">'+musPod+'</div><div style="font-size:var(--f1);color:var(--t3);font-weight:700;">Podcast</div></div>'
      +'<div style="text-align:center;"><div style="font-size:var(--f5);font-weight:800;color:var(--gold);">'+esc(lHours)+'</div><div style="font-size:var(--f1);color:var(--t3);font-weight:700;">Süre</div></div>'
      +'</div>';
    var mDet='<div class="scroll" style="max-height:340px;display:flex;flex-direction:column;gap:8px;">';
    mDet+= MUS.length? MUS.slice().sort(function(a,b){ return String(b.createdAt||'').localeCompare(String(a.createdAt||'')); }).map(trackRow).join('') : '<div class="empty"><span class="ei">'+icon('headphones',20)+'</span>Dinleme arşivi boş</div>';
    mDet+='</div>';
    h+=cardWrap({key:'music-archive',icon:icon('headphones',18),title:'Dinleme Arşivi',badge:'<span style="font-size:var(--f2);color:var(--t3);font-weight:700;">'+MUS.length+' parça</span>',span:6,order:50,summary:mSum,details:mDet});

    // ---- Alıntılar & Replikler ----
    var quotes=[]; LIB.forEach(function(b){ (Array.isArray(b.quotes)?b.quotes:[]).forEach(function(q){ quotes.push({kind:'book',ico:icon('book-open',12),title:b.title,text:q.text,page:q.page,ts:q.ts,col:'var(--purple)'}); }); });
    var reps=[]; WL.forEach(function(t){ (Array.isArray(t.quotes)?t.quotes:[]).forEach(function(q){ reps.push({kind:'title',ico:icon('clapperboard',12),title:t.title,text:q.text,ts:q.ts,col:'var(--amber)'}); }); });
    var lyr=[]; MUS.forEach(function(x){ (Array.isArray(x.quotes)?x.quotes:[]).forEach(function(q){ lyr.push({kind:'track',ico:icon('music',12),title:String(x.title||'').trim()+(x.artist?' — '+String(x.artist).trim():''),text:q.text,ts:q.ts,col:'var(--teal)'}); }); });
    var allq=quotes.concat(reps).concat(lyr).sort(function(a,b){ return String(b.ts||'').localeCompare(String(a.ts||'')); });
    if(allq.length){
      var qSum='<span>'+quotes.length+' alıntı · '+reps.length+' replik · '+lyr.length+' söz</span>';
      var qDet='<div style="display:grid;grid-template-columns:repeat(auto-fill,minmax(280px,1fr));gap:9px;">';
      allq.forEach(function(q){
        qDet+='<div style="background:var(--s1);border:1px solid var(--bd2);border-left:3px solid '+q.col+';border-radius:12px;padding:11px 13px;position:relative;overflow:hidden;">'
          +'<div style="position:absolute;top:-4px;right:8px;font-size:40px;color:'+q.col+';opacity:.14;line-height:1;font-weight:800;">”</div>'
          +'<div style="font-size:var(--f3);color:var(--t1);line-height:1.5;font-style:italic;position:relative;word-break:break-word;">“'+esc(String(q.text||'').trim())+'”</div>'
          +'<div style="font-size:var(--f1);color:var(--t3);font-weight:700;margin-top:7px;display:flex;align-items:center;gap:4px;">'+q.ico+' '+esc(String(q.title||'').trim())+(q.kind==='book'&&q.page?' · s.'+q.page:'')+'</div>'
          +'</div>';
      });
      qDet+='</div>';
      h+=cardWrap({key:'quotes-archive',icon:icon('quote',18),title:'Alıntılar · Replikler · Sözler',span:12,order:50,summary:qSum,details:qDet});
    }
  })();


  // Vücut & Tahlil bölümü (order:35 → Hareket ile İçgörü arası)
  h+=panelBodyCardHTML();
  h+=panelLabCardHTML();
  h+=discomfortTrendCardHTMLP();

  h+='</div>'; // end bento

  h+='<div style="display:flex;align-items:center;justify-content:center;gap:8px;font-size:var(--f2);color:var(--t4);padding:14px 0 4px;font-weight:700;letter-spacing:.5px;"><span class="badge '+(DEMO_MODE?'b-warn':'b-ok pulse')+' nodot" style="padding:3px 8px;"></span>'+(DEMO_MODE?'ÆON DEMO · SENTETİK VERİ · AĞ KAPALI':'ÆON ÇEKİRDEĞİ · CANLI · OTOMATİK YENİLENİR')+'</div>';
  h+='</div>'; // end page

  document.getElementById("app").innerHTML=h;
  setTimeout(initLocMap,0);
  setTimeout(initSectionScrollSpy,0);
  setTimeout(initChatScroll,0);
  setTimeout(initClampButtons,0);
  setTimeout(aeonLoadVisibleMediaP,0);
  try{ maybeMarkReviewing(); }catch(e){}
}

// ---------- Leaflet harita başlatma ----------
var _locMap=null, _locMarker=null, _locHistLayer=null, _locAccuracyCircle=null;
function initLocMap(){
  var loc=panelLocationP();
  var hist=panelLocationHistoryP();
  var container=document.getElementById("loc-map");
  if(!container||!loc) return;
  if(typeof L==="undefined") return;

  // innerHTML yenilendikten sonra eski map nesnesi geçersiz olur — sıfırla
  if(_locMap&&(!_locMap._container||!document.body.contains(_locMap._container))){
    _locMap=null; _locMarker=null; _locHistLayer=null; _locAccuracyCircle=null;
  }

  if(!_locMap){
    _locMap=L.map(container,{zoomControl:true,attributionControl:true});
    L.tileLayer("https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png",{maxZoom:19,attribution:'© <a href="https://www.openstreetmap.org/copyright">OSM</a> © <a href="https://carto.com/attributions">CARTO</a>'}).addTo(_locMap);
  }

  _locMap.setView([loc.lat,loc.lng],15);
  try{ _locMap.invalidateSize({pan:false}); }catch(e){}

  // önceki marker/history temizle
  if(_locMarker){ _locMap.removeLayer(_locMarker); _locMarker=null; }
  if(_locHistLayer){ _locMap.removeLayer(_locHistLayer); _locHistLayer=null; }
  if(_locAccuracyCircle){ _locMap.removeLayer(_locAccuracyCircle); _locAccuracyCircle=null; }

  // geçmiş noktalar (küçük daireler)
  var histGroup=L.layerGroup();
  hist.slice(0,-1).forEach(function(p){
    L.circleMarker([p.lat,p.lng],{radius:5,fillColor:"#b79a60",color:"#8c6f2d",weight:1.5,fillOpacity:0.55}).addTo(histGroup);
  });
  // bugünün hareket rotası (moda göre renkli segmentler)
  var mvTrk=panelMovementTrackP(UI.selectedDate||today());
  for(var ti=1;ti<mvTrk.length;ti++){
    if(typeof mvTrk[ti].lat!=="number"||typeof mvTrk[ti-1].lat!=="number") continue;
    var segCol=mvTrk[ti].mode==="vehicle"?"#B39DDB":"#7DD389";
    L.polyline([[mvTrk[ti-1].lat,mvTrk[ti-1].lng],[mvTrk[ti].lat,mvTrk[ti].lng]],{color:segCol,weight:4,opacity:0.85,lineJoin:"round"}).addTo(histGroup);
  }
  histGroup.addTo(_locMap);
  _locHistLayer=histGroup;

  // son konum marker (flamingo pin)
  var flamingoIcon=L.divIcon({
    className:"",
    html:'<div style="width:36px;height:36px;border-radius:50% 50% 50% 0;background:linear-gradient(135deg,#E9899F,#C9B8FF);border:3px solid #fff;box-shadow:0 3px 12px rgba(180,100,140,0.45);transform:rotate(-45deg);display:flex;align-items:center;justify-content:center;"><span style="transform:rotate(45deg);font-size:14px;line-height:1;color:#fff;font-weight:900;">S</span></div>',
    iconSize:[36,36],
    iconAnchor:[18,36],
    popupAnchor:[0,-38]
  });
  var ts=new Date(loc.ts).toLocaleString("tr-TR");
  _locMarker=L.marker([loc.lat,loc.lng],{icon:flamingoIcon})
    .bindPopup('<div style="font-size:13px;font-weight:700;line-height:1.5;">Şeyma<br><span style="font-weight:400;color:#69645d;">'+ts+'</span><br><span style="font-weight:400;color:#8b847d;">±'+loc.acc+'m doğruluk</span></div>',{maxWidth:220})
    .addTo(_locMap);

  // doğruluk dairesi
  _locAccuracyCircle=L.circle([loc.lat,loc.lng],{radius:loc.acc||0,color:"#b79a60",fillColor:"#E9899F",fillOpacity:0.08,weight:1.5}).addTo(_locMap);

  var invalidate=function(){ try{ if(_locMap&&_locMap._container&&document.body.contains(_locMap._container)) _locMap.invalidateSize({pan:false}); }catch(e){} };
  setTimeout(invalidate,0);
  if(typeof requestAnimationFrame==='function') requestAnimationFrame(invalidate);

  // adres çöz (Nominatim)
  var addrEl=document.getElementById("loc-address");
  if(addrEl){
    fetch("https://nominatim.openstreetmap.org/reverse?lat="+loc.lat+"&lon="+loc.lng+"&format=json",{headers:{"Accept-Language":"tr"}})
      .then(function(r){return r.json();})
      .then(function(geo){
        if(!addrEl.isConnected) return;
        var a=geo&&geo.address?geo.address:{};
        var parts=[a.road||a.pedestrian,a.neighbourhood||a.suburb,a.town||a.city||a.village,a.state].filter(Boolean);
        addrEl.textContent=parts.length?parts.join(", "):(geo.display_name||"Adres bulunamadı");
      })
      .catch(function(){ if(addrEl.isConnected) addrEl.textContent="Adres çözümlenemedi"; });
  }
}

function fail(msg){
  var safeMsg=typeof safePanelErrorTextP==='function'?safePanelErrorTextP(msg):'İşlem tamamlanamadı.';
  document.getElementById("app").innerHTML='<div style="max-width:420px;margin:80px auto;padding:0 16px;"><div class="card" style="padding:24px;"><div style="font-weight:800;font-size:17px;margin-bottom:6px;color:var(--t1);">Bağlantı bekleniyor</div><div style="font-size:12px;line-height:1.5;color:var(--t2);margin-bottom:14px;">Veri okunamadı.</div><div style="display:flex;gap:6px;"><button class="btn" onclick="load()" style="padding:8px 16px;font-size:12px;background:linear-gradient(135deg,#6b4e13,#d4af37);border:none;color:#fff;">Tekrar Dene</button><button class="btn" onclick="resetPanelToken()" style="padding:8px 16px;font-size:12px;">Yeni Anahtar</button></div><div style="font-size:9px;color:var(--t3);margin-top:10px;font-variant-numeric:tabular-nums;">'+esc(safeMsg)+'</div></div></div>';
}
window.savePanelToken=function(){
  var v=normalizeToken((document.getElementById("ptok")||{}).value||""); if(!v) return;
  PTOKEN=v; try{ localStorage.setItem(PTKEY,v); }catch(e){}
  document.getElementById("app").innerHTML='<div class="card" style="padding:18px;text-align:center;margin:40px 16px;">Yukleniyor…</div>'; load();
};
window.resetPanelToken=function(){ try{ localStorage.removeItem(PTKEY);}catch(e){} PTOKEN=""; tokenPrompt(); };
function tokenPrompt(msg){
  document.getElementById("app").innerHTML='<div style="max-width:380px;margin:80px auto;padding:0 16px;"><div class="card" style="padding:24px;"><div style="font-size:17px;font-weight:800;margin-bottom:4px;">ÆON · Giriş</div><div style="font-size:11px;line-height:1.5;color:var(--t2);margin-bottom:12px;">GitHub token gir — panel yakın takibe geçer.</div>'+(msg?'<div class="badge b-warn" style="margin-bottom:10px;border-radius:7px;padding:6px 10px;font-size:10px;">'+esc(msg)+'</div>':'')+'<input id="ptok" type="password" placeholder="github_pat_…" style="width:100%;margin-bottom:8px;padding:9px 10px;font-size:12px;"><button class="btn" onclick="savePanelToken()" style="width:100%;padding:10px;font-size:12px;font-weight:700;background:linear-gradient(135deg,#6b4e13,#d4af37);border:none;color:#fff;border-radius:7px;cursor:pointer;">Başlat</button></div></div>';
}
function fetchLatest(repo,branch){
  var p=repo.split("/"); if(p.length!==2||!p[0]||!p[1]) throw new Error("Repo bicimi gecersiz.");
  var api="https://api.github.com/repos/"+p[0]+"/"+p[1]+"/contents/data/latest.json?ref="+branch, H={"Accept":"application/vnd.github.raw","Authorization":"Bearer "+PTOKEN,"X-GitHub-Api-Version":"2022-11-28"};
  if(PANEL_LATEST_CACHE.etag) H["If-None-Match"]=PANEL_LATEST_CACHE.etag;
  return fetch(api,{headers:H,cache:"no-store"})
    .then(function(r){
      var etag=responseHeaderP(r,"ETag"), decision=pollConditionalDecisionP(PANEL_LATEST_CACHE,r.status,etag);
      if(decision.kind==='not_modified') return {notModified:true,meta:{etag:decision.etag,completedAt:new Date().toISOString()}};
      if(r.status===401||r.status===403) throw new Error("Token gecersiz veya yetkisiz.");
      if(r.status===404){ var e=new Error("data/latest.json bulunamadi."); e.notFound=true; throw e; }
      if(!r.ok) throw new Error("Sunucu hatasi: "+r.status);
      return r.json().then(function(data){ PANEL_LATEST_CACHE.etag=etag; PANEL_LATEST_CACHE.sourceRevision=(data&&data.syncReceipt&&data.syncReceipt.snapshotRevision)||null; PANEL_LATEST_CACHE.sourceUpdatedAt=(data&&data.syncReceipt&&data.syncReceipt.sourceUpdatedAt)||null; PANEL_POLL_STATE.conditionalMode=etag?'etag':'uncached'; return {notModified:false,data:data,meta:{etag:etag,completedAt:new Date().toISOString()}}; });
    });
}
// ---------- observer → kullanici mesaj kanali (data/observer-inbox.json) ----------
function b64enc(str){ var bytes=new TextEncoder().encode(str); var bin=""; for(var i=0;i<bytes.length;i++) bin+=String.fromCharCode(bytes[i]); return btoa(bin); }
function b64dec(b64){ var bin=atob(String(b64||"").replace(/\s/g,"")); var bytes=new Uint8Array(bin.length); for(var i=0;i<bin.length;i++) bytes[i]=bin.charCodeAt(i); return new TextDecoder("utf-8").decode(bytes); }
function inboxApi(){ var p=REPO.split("/"); return "https://api.github.com/repos/"+encodeURIComponent(p[0])+"/"+encodeURIComponent(p[1])+"/contents/data/observer-inbox.json"; }
function ghJsonHeaders(){ return {"Authorization":"Bearer "+PTOKEN,"Accept":"application/vnd.github+json","X-GitHub-Api-Version":"2022-11-28"}; }
function loadInbox(){
  return fetch(inboxApi()+"?ref="+encodeURIComponent(BRANCH)+"&t="+Date.now(),{headers:ghJsonHeaders()})
    .then(function(r){
      if(r.status===404) return {messages:[],receipts:{},sha:null};
      if(!r.ok) throw new Error("inbox "+r.status);
      return r.json().then(function(g){ var obj={messages:[]}; try{ obj=JSON.parse(b64dec(g.content)); }catch(e){} return {messages:Array.isArray(obj.messages)?obj.messages:[],receipts:(obj.receipts&&typeof obj.receipts==="object")?obj.receipts:{},sha:g.sha}; });
    });
}
function putInbox(messages,sha,receipts){
  var payload={messages:messages}; if(receipts&&typeof receipts==="object"&&Object.keys(receipts).length) payload.receipts=receipts;
  // REM-63: observer inbox yalnız ÆON mesaj kanalıdır; reminder payload'ı
  // (preference / occurrence / snooze / mute / delivery) buraya yazılamaz.
  var g=panelWriteGuardP('inbox',payload);
  if(!g.ok) return Promise.reject(new Error("panel write engellendi: "+g.reason));
  var body={message:"observer: mesaj guncelle",content:b64enc(JSON.stringify(payload,null,2)),branch:BRANCH};
  if(sha) body.sha=sha;
  var H=ghJsonHeaders(); H["Content-Type"]="application/json";
  return fetch(inboxApi(),{method:"PUT",headers:H,body:JSON.stringify(body)}).then(function(r){ if(!r.ok) return r.text().then(function(t){ throw new Error(r.status+" "+t.slice(0,120)); }); });
}
window.aeonChatDraft=function(el){
  var v=(el&&el.value)||"";
  UI.msgDraft=v;
  try{ if(el){ el.style.height="auto"; el.style.height=Math.min(el.scrollHeight,120)+"px"; } }catch(e){}
  var hasText=!!String(v||"").trim();
  var btn=document.getElementById("pm-aeon-send");
  if(btn){ btn.className="pm-send"+((!hasText||UI.msgSending)?" is-disabled":""); btn.style.display=hasText?"flex":"none"; }
  var mic=document.getElementById("pm-aeon-mic"); if(mic) mic.style.display=hasText?"none":"flex";
};
window.pmAeonKeydown=function(e){
  if(e && e.key==="Enter" && !e.shiftKey){ e.preventDefault(); window.sendAeonChat(); }
};
// app.js'teki App.toggleAeonSearch/filterAeonSearch ile aynı desen: tam render
// TETİKLEMEDEN DOM'da satır bazlı filtreler, veri silinmez.
window.togglePmSearch=function(){
  var bar=document.getElementById("pm-search-bar"); if(!bar) return;
  var show=bar.style.display==="none";
  bar.style.display=show?"block":"none";
  if(show){ var inp=document.getElementById("pm-search-input"); if(inp) inp.focus(); }
  else window.clearPmSearch();
};
window.clearPmSearch=function(){
  var inp=document.getElementById("pm-search-input"); if(inp) inp.value="";
  window.filterPmSearch({value:""});
};
window.filterPmSearch=function(el){
  var q=String((el&&el.value)||"").trim().toLowerCase();
  var thread=document.getElementById("pm-aeon-thread"); if(!thread) return;
  var groups=[], current=null, totalMatches=0;
  Array.prototype.forEach.call(thread.children,function(node){
    if(!node.classList) return;
    if(node.classList.contains("pm-daydiv")){ current={div:node,rows:[]}; groups.push(current); }
    else if(node.classList.contains("pm-row")){
      if(!current){ current={div:null,rows:[]}; groups.push(current); }
      current.rows.push(node);
    }
  });
  groups.forEach(function(g){
    var groupHasMatch=false;
    g.rows.forEach(function(row){
      var match=!q || row.textContent.toLowerCase().indexOf(q)!==-1;
      row.style.display=match?"":"none";
      if(match) groupHasMatch=true;
    });
    totalMatches+=g.rows.filter(function(r){ return r.style.display!=="none"; }).length;
    if(g.div) g.div.style.display=groupHasMatch?"":"none";
  });
  var hint=document.getElementById("pm-search-noresult");
  if(q && totalMatches===0){
    if(!hint){
      hint=document.createElement("div"); hint.id="pm-search-noresult";
      hint.style.cssText="text-align:center;padding:16px 10px;color:var(--t4);font-size:var(--f3);font-weight:600;";
      hint.textContent="Eşleşen mesaj bulunamadı";
      thread.appendChild(hint);
    }
  } else if(hint){ hint.remove(); }
};
window.sendAeonChat=function(){
  if(DEMO_MODE){ alert("Demo modu: ağ ve mesaj yazımı kapalı."); return; }
  if(UI.msgSending) return;
  var ta=document.getElementById("pm-aeon-input");
  var txt=ta?ta.value.trim():String(UI.msgDraft||"").trim();
  if(!txt) return;
  // En eski cevaplanmamış ÆON sorusunu bul; varsa onu yanıtla (replyTo), yoksa proaktif gönder.
  var pending=null;
  try{
    var qa=(D&&D.aeon&&Array.isArray(D.aeon.qa))?D.aeon.qa.slice():[];
    qa.sort(function(a,b){ return String(a&&(a.ts||a.date)||"").localeCompare(String(b&&(b.ts||b.date)||"")); });
    for(var i=0;i<qa.length;i++){ if(qa[i]&&qa[i].id&&!qa[i].answer){ pending=qa[i]; break; } }
  }catch(e){}
  UI.msgSending=true; PMSTICK.aeon=true; render();
  loadInbox()
    .then(function(res){
      var msgs=(res.messages||[]).slice();
      var m={id:"m_"+Date.now().toString(36)+"_"+Math.random().toString(36).slice(2,7),text:txt,ts:new Date().toISOString()};
      if(pending&&pending.id) m.replyTo=pending.id;
      msgs.push(m);
      return putInbox(msgs,res.sha,res.receipts);
    })
    .then(function(){ UI.msgDraft=""; UI.msgSending=false; return load(); })
    .catch(function(e){ UI.msgSending=false; render(); alert("Mesaj gönderilemedi: "+safePanelErrorTextP(e)); });
};
window.delObserverMsg=function(id){
  if(DEMO_MODE){ alert("Demo modu: silme/yazma kapalı."); return; }
  if(UI.msgSending) return;
  if(!confirm("Bu mesaji kanaldan kaldir? (Kullanicinin cihazinda kayitliysa orada kalir.)")) return;
  UI.msgSending=true; render();
  loadInbox()
    .then(function(res){ var msgs=(res.messages||[]).filter(function(m){ return m&&m.id!==id; }); return putInbox(msgs,res.sha,res.receipts); })
    .then(function(){ UI.msgSending=false; return load(); })
    .catch(function(e){ UI.msgSending=false; render(); alert("Silinemedi: "+safePanelErrorTextP(e)); });
};
// ---------- ÆON ek gönderme sayfası (fotoğraf/belge/ses dosyası) — pm-lightbox ile aynı
// imperatif desen (deklaratif modal sistemi yok, doğrudan document.body'e eklenip kaldırılır) ----------
window.openAttachSheetP=function(){
  if(UI.msgSending||aeonRecP) return;
  window.closeAttachSheetP();
  var items=[
    {ic:"camera",label:"Fotoğraf",sub:"Bilgisayarından bir görsel seç",fn:"aeonPickPhotoP"},
    {ic:"file-text",label:"Belge",sub:"PDF, Word, Excel ve diğer dosyalar",fn:"aeonPickFileP"},
    {ic:"music",label:"Ses dosyası",sub:"Hazır bir ses kaydı yükle",fn:"aeonPickAudioFileP"}
  ];
  var d=document.createElement("div"); d.id="pm-attach-sheet";
  d.style.cssText="position:fixed;inset:0;z-index:900;background:rgba(3,3,5,0.6);display:flex;align-items:center;justify-content:center;padding:20px;";
  var inner='<div style="width:100%;max-width:360px;background:var(--s1);border:1px solid var(--bd2);border-radius:16px;padding:8px;box-shadow:0 20px 60px rgba(0,0,0,0.5);">'
    +'<div style="padding:10px 10px 8px;font-size:var(--f1);font-weight:800;letter-spacing:.4px;color:var(--t4);text-transform:uppercase;">Şeyma’ya gönder</div>';
  items.forEach(function(it){
    inner+='<button onclick="'+it.fn+'();window.closeAttachSheetP();" style="display:flex;align-items:center;gap:12px;text-align:left;border:none;background:none;cursor:pointer;padding:10px;border-radius:11px;width:100%;color:var(--t1);">'
      +'<span style="width:38px;height:38px;border-radius:11px;flex-shrink:0;display:flex;align-items:center;justify-content:center;background:var(--ggrad);color:#1a1404;">'+icon(it.ic,17)+'</span>'
      +'<div style="flex:1;min-width:0;"><div style="font-size:var(--f3);font-weight:800;">'+it.label+'</div><div style="font-size:var(--f1);color:var(--t4);margin-top:1px;">'+it.sub+'</div></div>'
      +'</button>';
  });
  inner+='<button onclick="window.closeAttachSheetP()" style="margin-top:4px;border:1px solid var(--bd2);background:var(--s2);color:var(--t3);font-weight:800;font-size:var(--f2);padding:10px;border-radius:10px;cursor:pointer;width:100%;">Vazgeç</button></div>';
  d.innerHTML=inner;
  d.onclick=function(e){ if(e.target===d) window.closeAttachSheetP(); };
  document.body.appendChild(d);
};
window.closeAttachSheetP=function(){ var ex=document.getElementById("pm-attach-sheet"); if(ex) ex.remove(); };
// ---------- ÆON medya (ses notu / fotoğraf) — data/aeon-media/<id>.json, panelin kendi PUT/GET'i ----------
// app.js tarafıyla aynı mantık: ana veri (data/latest.json) her save'de tümüyle yeniden
// yüklendiği için medya oraya gömülmez; her ses/foto kendi tek seferlik dosyasında durur.
function aeonMediaIdP(prefix){ return (prefix||"am")+"_"+Date.now().toString(36)+"_"+Math.random().toString(36).slice(2,7); }
function aeonMediaApiP(id){ var p=REPO.split("/"); return "https://api.github.com/repos/"+encodeURIComponent(p[0])+"/"+encodeURIComponent(p[1])+"/contents/data/aeon-media/"+id+".json"; }
function putAeonMediaP(id,payloadObj){
  // REM-63: ÆON medya yalnız mime/data/peaks gibi medya alanları taşır;
  // reminder-namespace anahtarı (preference / occurrence / delivery) içeren
  // bir payload bu yazma yolundan geçemez.
  var g=panelWriteGuardP('aeon_media',payloadObj);
  if(!g.ok) return Promise.reject(new Error("panel write engellendi: "+g.reason));
  var body={message:"aeon-media: "+id,content:b64enc(JSON.stringify(payloadObj)),branch:BRANCH};
  var H=ghJsonHeaders(); H["Content-Type"]="application/json";
  return fetch(aeonMediaApiP(id),{method:"PUT",headers:H,body:JSON.stringify(body)}).then(function(r){ if(!r.ok) return r.text().then(function(t){ throw new Error(r.status+" "+t.slice(0,160)); }); });
}
var aeonMediaCacheP={};
function fetchAeonMediaP(id){
  if(aeonMediaCacheP[id]) return Promise.resolve(aeonMediaCacheP[id]);
  return fetch(aeonMediaApiP(id)+"?ref="+encodeURIComponent(BRANCH)+"&t="+Date.now(),{headers:{"Authorization":"Bearer "+PTOKEN,"Accept":"application/vnd.github.raw","X-GitHub-Api-Version":"2022-11-28"}})
    .then(function(r){ if(!r.ok) throw new Error(String(r.status)); return r.json(); })
    .then(function(j){ aeonMediaCacheP[id]=j; return j; });
}
function aeonRecTimeStrP(sec){ sec=Math.max(0,Math.round(Number(sec)||0)); var m=Math.floor(sec/60), s=sec%60; return (m<10?"0":"")+m+":"+(s<10?"0":"")+s; }
function aeonEnsureMediaLoadedP(mediaId,kind,elId){
  var el=document.getElementById(elId); if(!el||!mediaId) return;
  function paint(m){
    if(!m){ el.innerHTML='<span style="opacity:.6;display:inline-flex;">'+icon('triangle-alert',15)+'</span>'; return; }
    var uri="data:"+(m.mime||"")+";base64,"+m.data;
    if(kind==="image") el.innerHTML='<img src="'+esc(uri)+'" style="width:100%;height:100%;object-fit:cover;display:block;">';
    else if(kind==="voice") aeonPaintVoicePlayerP(el,mediaId,m,uri);
    else if(kind==="file") aeonPaintFileCardP(el,mediaId,m);
  }
  if(aeonMediaCacheP[mediaId]){ paint(aeonMediaCacheP[mediaId]); return; }
  fetchAeonMediaP(mediaId).then(paint).catch(function(){ paint(null); });
}
function aeonLoadVisibleMediaP(){
  var els=document.querySelectorAll(".pm-media-slot");
  for(var i=0;i<els.length;i++){ var el=els[i]; aeonEnsureMediaLoadedP(el.getAttribute("data-media-id"),el.getAttribute("data-media-kind"),el.id); }
}
var aeonAudioElsP={};
function aeonPaintVoicePlayerP(container,mediaId,m,uri){
  var peaks=(m.peaks&&m.peaks.length)?m.peaks:[.3,.5,.4,.6,.35,.55,.45,.65,.3,.5,.4,.6,.35,.55,.45,.65];
  var bars=peaks.map(function(v){ return '<span style="flex:1;min-width:2px;border-radius:2px;background:currentColor;opacity:.55;height:'+Math.max(3,Math.round(v*20))+'px;"></span>'; }).join("");
  container.innerHTML='<div style="display:flex;align-items:center;gap:9px;">'
    +'<button onclick="aeonToggleVoiceP('+esc(jsArgP(mediaId))+')" id="pm-voice-btn-'+esc(mediaId)+'" aria-label="Oynat/duraklat" style="flex-shrink:0;border:none;cursor:pointer;width:30px;height:30px;border-radius:50%;background:currentColor;display:flex;align-items:center;justify-content:center;"><span id="pm-voice-icon-'+esc(mediaId)+'" style="color:var(--bg);font-size:11px;">▶</span></button>'
    +'<div style="flex:1;display:flex;align-items:center;gap:1.5px;height:22px;min-width:0;">'+bars+'</div>'
    +'<span id="pm-voice-time-'+esc(mediaId)+'" style="flex-shrink:0;font-size:var(--f1);opacity:.75;font-variant-numeric:tabular-nums;">'+aeonRecTimeStrP(m.durationSec)+'</span>'
    +'</div>';
  if(!aeonAudioElsP[mediaId]) aeonAudioElsP[mediaId]={uri:uri,audio:null,durationSec:m.durationSec};
}
function aeonSetVoiceIconP(mediaId,ic){ var el=document.getElementById("pm-voice-icon-"+mediaId); if(el) el.textContent=ic; }
window.aeonToggleVoiceP=function(mediaId){
  var st=aeonAudioElsP[mediaId]; if(!st) return;
  Object.keys(aeonAudioElsP).forEach(function(k){ if(k!==mediaId&&aeonAudioElsP[k].audio&&!aeonAudioElsP[k].audio.paused){ aeonAudioElsP[k].audio.pause(); aeonSetVoiceIconP(k,"▶"); } });
  if(!st.audio){
    st.audio=new Audio(st.uri);
    st.audio.addEventListener("ended",function(){ aeonSetVoiceIconP(mediaId,"▶"); var t=document.getElementById("pm-voice-time-"+mediaId); if(t) t.textContent=aeonRecTimeStrP(st.durationSec); });
    st.audio.addEventListener("timeupdate",function(){ var t=document.getElementById("pm-voice-time-"+mediaId); if(t) t.textContent=aeonRecTimeStrP(st.audio.currentTime); });
  }
  if(st.audio.paused){ st.audio.play().catch(function(){ alert("Ses oynatılamadı"); }); aeonSetVoiceIconP(mediaId,"❚❚"); }
  else { st.audio.pause(); aeonSetVoiceIconP(mediaId,"▶"); }
};
function aeonPaintFileCardP(container,mediaId,m){
  var name=m.name||"Belge", size=m.size!=null?humanFileSizeP(m.size):"";
  container.setAttribute("onclick","window.openPdfP("+jsArgP(mediaId)+","+jsArgP(name)+")");
  container.style.cursor="pointer";
  container.innerHTML='<div style="display:flex;align-items:center;gap:10px;min-width:190px;max-width:260px;">'
    +'<span style="flex-shrink:0;width:34px;height:34px;border-radius:10px;display:flex;align-items:center;justify-content:center;background:currentColor;"><span style="display:flex;color:var(--bg);">'+icon('file-text',16)+'</span></span>'
    +'<div style="flex:1;min-width:0;"><div style="font-size:var(--f2);font-weight:800;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;">'+esc(name)+'</div>'
    +'<div style="font-size:var(--f1);opacity:.7;margin-top:1px;">'+(size?esc(size)+" · ":"")+'aç / indir</div></div>'
    +'<span style="flex-shrink:0;display:inline-flex;opacity:.75;">'+icon('download',14)+'</span>'
    +'</div>';
}
window.openPdfP=function(mediaId,name){
  fetchAeonMediaP(mediaId).then(function(m){
    try{
      var bin=atob(String(m.data||"").replace(/\s+/g,""));
      var by=new Uint8Array(bin.length); for(var i=0;i<bin.length;i++) by[i]=bin.charCodeAt(i);
      var url=URL.createObjectURL(new Blob([by],{type:m.mime||"application/pdf"}));
      var w=window.open(url,"_blank");
      if(!w){ var a=document.createElement("a"); a.href=url; a.download=name||"tahlil.pdf"; document.body.appendChild(a); a.click(); a.remove(); }
      setTimeout(function(){ URL.revokeObjectURL(url); },60000);
    }catch(e){ alert("Belge açılamadı"); }
  }).catch(function(){ alert("Belge yüklenemedi"); });
};
window.aeonOpenImageP=function(mediaId){
  var m=aeonMediaCacheP[mediaId]; if(!m) return;
  var uri="data:"+(m.mime||"")+";base64,"+m.data;
  var ext=(m.mime&&m.mime.indexOf("png")>=0)?"png":(m.mime&&m.mime.indexOf("gif")>=0)?"gif":(m.mime&&m.mime.indexOf("webp")>=0)?"webp":"jpg";
  var ex=document.getElementById("pm-lightbox"); if(ex) ex.remove();
  var d=document.createElement("div"); d.id="pm-lightbox";
  d.style.cssText="position:fixed;inset:0;z-index:900;background:rgba(3,3,5,0.94);display:flex;align-items:center;justify-content:center;padding:20px;overflow:auto;";
  d.innerHTML='<img id="pm-lightbox-img" src="'+esc(uri)+'" style="max-width:100%;max-height:100%;border-radius:12px;box-shadow:0 20px 60px rgba(0,0,0,0.6);cursor:zoom-in;transition:transform .18s ease;">'
    +'<div style="position:absolute;top:16px;right:16px;display:flex;gap:8px;">'
    +'<a href="'+esc(uri)+'" download="aeon-foto.'+esc(ext)+'" aria-label="İndir" style="border:none;background:rgba(255,255,255,0.12);color:#fff;width:38px;height:38px;border-radius:50%;cursor:pointer;display:flex;align-items:center;justify-content:center;">'+icon('download',16)+'</a>'
    +'<button aria-label="Kapat" style="border:none;background:rgba(255,255,255,0.12);color:#fff;width:38px;height:38px;border-radius:50%;cursor:pointer;display:flex;align-items:center;justify-content:center;">'+icon('x',16)+'</button>'
    +'</div>';
  d.onclick=function(e){ if(e.target===d||e.target.tagName==="BUTTON"){ d.remove(); } };
  var img=document.getElementById("pm-lightbox-img"), zoomed=false;
  img.onclick=function(e){ e.stopPropagation(); zoomed=!zoomed; img.style.transform=zoomed?"scale(1.8)":"scale(1)"; img.style.cursor=zoomed?"zoom-out":"zoom-in"; };
  document.body.appendChild(d);
};
// ---------- ÆON ses kaydı (panel tarafı) ----------
var aeonRecP=null;
var AEON_REC_MAX_SEC_P=120;
function aeonPickAudioMimeP(){
  var cands=["audio/webm;codecs=opus","audio/webm","audio/mp4","audio/aac"];
  for(var i=0;i<cands.length;i++){ if(window.MediaRecorder&&MediaRecorder.isTypeSupported&&MediaRecorder.isTypeSupported(cands[i])) return cands[i]; }
  return "";
}
function downsamplePeaksP(arr,n){
  if(!arr||!arr.length) return [];
  if(arr.length<=n) return arr.map(function(v){ return Math.round(v*100)/100; });
  var out=[],step=arr.length/n;
  for(var i=0;i<n;i++) out.push(Math.round(arr[Math.floor(i*step)]*100)/100);
  return out;
}
function aeonRecPaintBarsP(){
  var wrap=document.getElementById("pm-rec-wave"); if(!wrap||!aeonRecP) return;
  var bars=aeonRecP.peaks.slice(-28);
  wrap.innerHTML=bars.map(function(v){ return '<span style="flex:1;min-width:2px;border-radius:2px;background:#1a1404;opacity:.75;height:'+Math.max(3,Math.round(v*22))+'px;"></span>'; }).join("");
}
function aeonRecSampleP(){
  if(!aeonRecP||!aeonRecP.analyser) return;
  var arr=new Uint8Array(aeonRecP.analyser.frequencyBinCount);
  function step(){
    if(!aeonRecP||!aeonRecP.analyser) return;
    aeonRecP.analyser.getByteFrequencyData(arr);
    var sum=0; for(var i=0;i<arr.length;i++) sum+=arr[i];
    aeonRecP.peaks.push(sum/arr.length/255);
    if(aeonRecP.peaks.length>500) aeonRecP.peaks.shift();
    aeonRecPaintBarsP();
    aeonRecP.raf=requestAnimationFrame(step);
  }
  aeonRecP.raf=requestAnimationFrame(step);
}
window.aeonMicTapP=function(){
  if(aeonRecP||UI.msgSending) return;
  if(!navigator.mediaDevices||!navigator.mediaDevices.getUserMedia){ alert("Bu tarayıcı ses kaydını desteklemiyor"); return; }
  navigator.mediaDevices.getUserMedia({audio:true}).then(function(stream){
    var mime=aeonPickAudioMimeP(), recorder;
    try{ recorder=mime?new MediaRecorder(stream,{mimeType:mime}):new MediaRecorder(stream); }
    catch(e){ alert("Kayıt başlatılamadı"); stream.getTracks().forEach(function(t){ t.stop(); }); return; }
    var chunks=[];
    recorder.ondataavailable=function(e){ if(e.data&&e.data.size>0) chunks.push(e.data); };
    var ctx=null,analyser=null;
    try{ ctx=new (window.AudioContext||window.webkitAudioContext)(); analyser=ctx.createAnalyser(); analyser.fftSize=256; var src=ctx.createMediaStreamSource(stream); src.connect(analyser); }catch(e){ ctx=null; analyser=null; }
    aeonRecP={stream:stream,recorder:recorder,chunks:chunks,mime:recorder.mimeType||mime||"audio/webm",startTs:Date.now(),audioCtx:ctx,analyser:analyser,raf:null,peaks:[],timerId:null};
    recorder.start(250);
    UI.aeonRecActiveP=true; PMSTICK.aeon=true; render();
    aeonRecSampleP();
    aeonRecP.timerId=setInterval(function(){
      if(!aeonRecP) return;
      var sec=Math.floor((Date.now()-aeonRecP.startTs)/1000);
      var el=document.getElementById("pm-rec-time"); if(el) el.textContent=aeonRecTimeStrP(sec);
      if(sec>=AEON_REC_MAX_SEC_P) window.aeonRecStopP(true);
    },500);
  }).catch(function(){ alert("Mikrofon izni verilmedi"); });
};
window.aeonRecCancelP=function(){ window.aeonRecStopP(false); };
window.aeonRecStopP=function(send){
  if(!aeonRecP) return;
  var rec=aeonRecP; aeonRecP=null; UI.aeonRecActiveP=false;
  if(rec.raf) cancelAnimationFrame(rec.raf);
  if(rec.timerId) clearInterval(rec.timerId);
  var durationSec=Math.round((Date.now()-rec.startTs)/1000);
  function cleanup(){ try{ rec.stream.getTracks().forEach(function(t){ t.stop(); }); }catch(e){} try{ if(rec.audioCtx) rec.audioCtx.close(); }catch(e){} }
  if(!send){ try{ rec.recorder.stop(); }catch(e){} cleanup(); render(); return; }
  rec.recorder.onstop=function(){
    cleanup();
    if(durationSec<1){ alert("Kayıt çok kısa"); render(); return; }
    var blob=new Blob(rec.chunks,{type:rec.mime});
    var fr=new FileReader();
    fr.onload=function(){
      var dataUrl=String(fr.result||""), comma=dataUrl.indexOf(","), b64=comma>=0?dataUrl.slice(comma+1):"";
      var peaks=downsamplePeaksP(rec.peaks,40);
      window.sendAeonMediaP("voice",b64,rec.mime,{durationSec:durationSec,peaks:peaks});
    };
    fr.onerror=function(){ alert("Kayıt okunamadı"); render(); };
    fr.readAsDataURL(blob);
  };
  try{ rec.recorder.stop(); }catch(e){ cleanup(); render(); }
  render();
};
// ---------- ÆON fotoğraf gönderme (panel tarafı) ----------
window.aeonPickPhotoP=function(){ if(UI.msgSending||aeonRecP) return; var el=document.getElementById("pm-photo-input"); if(el) el.click(); };
window.aeonPhotoChosenP=function(el){
  var f=el.files&&el.files[0]; el.value="";
  if(!f) return;
  if(!/^image\//.test(f.type)){ alert("Bu bir görsel değil"); return; }
  var reader=new FileReader();
  reader.onload=function(){
    var img=new Image();
    img.onload=function(){
      var MAXD=1280, w=img.naturalWidth||1, h=img.naturalHeight||1;
      var scale=Math.min(1,MAXD/Math.max(w,h));
      var cw=Math.max(1,Math.round(w*scale)), ch=Math.max(1,Math.round(h*scale));
      var cv=document.createElement("canvas"); cv.width=cw; cv.height=ch;
      var cx=cv.getContext("2d"); cx.drawImage(img,0,0,cw,ch);
      var dataUrl=cv.toDataURL("image/jpeg",0.72);
      var comma=dataUrl.indexOf(","), b64=comma>=0?dataUrl.slice(comma+1):"";
      window.sendAeonMediaP("image",b64,"image/jpeg",{w:cw,h:ch});
    };
    img.onerror=function(){ alert("Fotoğraf okunamadı"); };
    img.src=String(reader.result||"");
  };
  reader.onerror=function(){ alert("Fotoğraf okunamadı"); };
  reader.readAsDataURL(f);
};
function readFileB64P(file){ return new Promise(function(resolve,reject){ var r=new FileReader(); r.onload=function(){ var url=String(r.result||""); var c=url.indexOf(","); resolve(c>=0?url.slice(c+1):""); }; r.onerror=function(){ reject(new Error("dosya okunamadı")); }; r.readAsDataURL(file); }); }
function humanFileSizeP(bytes){
  bytes=Number(bytes)||0;
  if(bytes<1024) return bytes+" B";
  if(bytes<1024*1024) return Math.round(bytes/1024)+" KB";
  return (Math.round(bytes/1024/1024*10)/10)+" MB";
}
// ---------- ÆON belge gönderme (panel tarafı) ----------
window.aeonPickFileP=function(){ if(UI.msgSending||aeonRecP) return; var el=document.getElementById("pm-file-input"); if(el) el.click(); };
window.aeonFileChosenP=function(el){
  var f=el.files&&el.files[0]; el.value="";
  if(!f) return;
  if(f.size>4*1024*1024) alert("Belge büyük (>4MB) — gönderim biraz sürebilir");
  readFileB64P(f).then(function(b64){
    window.sendAeonMediaP("file",b64,f.type||"application/octet-stream",{name:f.name,size:f.size});
  }).catch(function(){ alert("Belge okunamadı"); });
};
// ---------- ÆON hazır ses dosyası gönderme (panel tarafı) — canlı kayıttan farklı, mevcut
// 'voice' oynatıcısını (peaks olmadan da çalışan düz dalga formuyla) aynen yeniden kullanır ----------
window.aeonPickAudioFileP=function(){ if(UI.msgSending||aeonRecP) return; var el=document.getElementById("pm-audio-input"); if(el) el.click(); };
window.aeonAudioFileChosenP=function(el){
  var f=el.files&&el.files[0]; el.value="";
  if(!f) return;
  if(!/^audio\//.test(f.type)){ alert("Bu bir ses dosyası değil"); return; }
  if(f.size>4*1024*1024) alert("Ses dosyası büyük (>4MB) — gönderim biraz sürebilir");
  var probe=document.createElement("audio"), probeUrl=URL.createObjectURL(f);
  function finish(durationSec){
    URL.revokeObjectURL(probeUrl);
    readFileB64P(f).then(function(b64){
      window.sendAeonMediaP("voice",b64,f.type||"audio/mpeg",{durationSec:durationSec,name:f.name,viaUpload:true});
    }).catch(function(){ alert("Ses dosyası okunamadı"); });
  }
  probe.preload="metadata";
  probe.onloadedmetadata=function(){ finish(isFinite(probe.duration)?Math.round(probe.duration):0); };
  probe.onerror=function(){ finish(0); };
  probe.src=probeUrl;
};
// Ses/foto: önce data/aeon-media/<id>.json'a yükler, sonra observer-inbox.json'a hafif
// bir referans mesajı ekler (sendAeonChat ile aynı replyTo mantığı: bekleyen soru varsa
// ona yanıt, yoksa proaktif mesaj). Kendi gönderdiğin medya aeonMediaCacheP'te önceden
// olduğu için karşı taraftan cevap gelmeden de anında görünür.
window.sendAeonMediaP=function(kind,base64,mime,extra){
  if(DEMO_MODE){ alert("Demo modu: medya yazımı kapalı."); return; }
  if(UI.msgSending) return;
  var id=aeonMediaIdP(kind==="voice"?"av":(kind==="file"?"af":"ai"));
  var payload={mime:mime,data:base64}; if(extra) for(var k in extra){ if(extra[k]!=null) payload[k]=extra[k]; }
  aeonMediaCacheP[id]=payload;
  var pending=null;
  try{
    var qa=(D&&D.aeon&&Array.isArray(D.aeon.qa))?D.aeon.qa.slice():[];
    qa.sort(function(a,b){ return String(a&&(a.ts||a.date)||"").localeCompare(String(b&&(b.ts||b.date)||"")); });
    for(var i=0;i<qa.length;i++){ if(qa[i]&&qa[i].id&&!qa[i].answer){ pending=qa[i]; break; } }
  }catch(e){}
  UI.msgSending=true; PMSTICK.aeon=true; render();
  putAeonMediaP(id,payload).then(function(){
    return loadInbox().then(function(res){
      var msgs=(res.messages||[]).slice();
      var m={id:"m_"+Date.now().toString(36)+"_"+Math.random().toString(36).slice(2,7),text:(kind==="file"?("Belge: "+(extra&&extra.name||"")):(kind==="voice"?((extra&&extra.viaUpload)?("Ses dosyası: "+(extra&&extra.name||"")):"Sesli mesaj"):"Fotoğraf")),ts:new Date().toISOString(),kind:kind,mediaId:id,mediaMime:mime};
      if(extra){ if(extra.durationSec!=null) m.durationSec=extra.durationSec; if(extra.peaks) m.peaks=extra.peaks; if(extra.w) m.w=extra.w; if(extra.h) m.h=extra.h; if(extra.name) m.name=extra.name; if(extra.size!=null) m.size=extra.size; }
      if(pending&&pending.id) m.replyTo=pending.id;
      msgs.push(m);
      return putInbox(msgs,res.sha,res.receipts);
    });
  }).then(function(){ UI.msgSending=false; return load(); })
  .catch(function(e){ delete aeonMediaCacheP[id]; UI.msgSending=false; render(); alert((kind==="file"?"Belge":(kind==="voice"?"Ses":"Fotoğraf"))+" gönderilemedi: "+safePanelErrorTextP(e)); });
};
// Gözlemci paneli açıp kullanıcının cevaplanmamış ÆON sorusunu gördüğünde, kullanıcı tarafında
// "⬡ AEON // EVALUATING INPUT…" durumu görünsün diye observer-inbox.json'a okundu (receipt) yazarız.
function markReviewWrite(ids){
  if(DEMO_MODE) return;
  if(!ids||!ids.length) return;
  loadInbox().then(function(res){
    var rc=res.receipts||{}, now=new Date().toISOString(), changed=false;
    ids.forEach(function(id){ if(!rc[id]){ rc[id]={status:"reviewing",ts:now}; changed=true; } });
    if(!changed){ OBSRECEIPTS=rc; return; }
    return putInbox(res.messages||[],res.sha,rc).then(function(){ OBSRECEIPTS=rc; });
  }).catch(function(){ ids.forEach(function(id){ delete MARKED_REVIEW[id]; }); });
}
function maybeMarkReviewing(){
  if(!D||!D.aeon||!Array.isArray(D.aeon.qa)) return;
  var pending=[];
  D.aeon.qa.forEach(function(x){
    if(!x||!x.id||x.answer) return;
    if(OBSRECEIPTS[x.id]||MARKED_REVIEW[x.id]) return;
    MARKED_REVIEW[x.id]=true; pending.push(x.id);
  });
  if(pending.length) markReviewWrite(pending);
}
function demoData(){
  var td=today(), start=addDays(td,-9), days={}, moods=["iyi","normal","cok-iyi","iyi","zorlandim"];
  for(var i=0;i<10;i++){
    var ds=addDays(start,i), h=7.2+(i%4)*.3;
    days[ds]={habits:{sweetManaged:i%3===0,foodManaged:i%4===0,coffeeManaged:i%5===0,eveningControl:i%2===0,walked20:true,protein:true,water:i%2===0,vitaminD:i%3!==1,sleepReg:h>=7.5,journaled:true,mediaFed:i%2===0,freshAir:true,selfKind:true,caffeineOk:true},mood:moods[i%moods.length],cravingSOSCount:(i%4===0||i===9)?1:0,cravingOptionsUsed:(i%4===0||i===9)?["Bir bardak su içtim","10 dakika bekledim"]:[],cravingTriggers:(i%4===0||i===9)?[{trigger:"stress",kind:"sweet",ts:ds+"T16:20:00+03:00"}]:[],craving10MinDone:i%3===0,foodCravingDone:i%4===0,coffeeCravingDone:i%5===0,cravingTriggerNote:(i%4===0||i===9)?"Yoğun bir günün ardından geldi.":"",note:"Demo günlüğü · küçük adımlar da ilerlemedir.",intention:"Bugün kendime nazik davranacağım.",savedAt:ds+"T21:10:00+03:00",meals:{breakfast:"1 adet yumurta, peynir",lunch:"1 tabak tavuklu salata",dinner:"1 tabak çorba",snack:"1 adet elma"},mealItems:{breakfast:[{name:"Yumurta",qty:1,unit:"adet"}],lunch:[{name:"Tavuklu salata",qty:1,unit:"tabak"}],dinner:[{name:"Mercimek çorbası",qty:1,unit:"tabak"}],snack:[{name:"Elma",qty:1,unit:"adet"}]},water:7+i%3,caffeine:{last:"13:20",cups:2,drinks:[{type:"turk",time:"09:10",qty:1},{type:"green-tea",time:"13:20",qty:1}]},energy:3+i%3,stress:2+i%3,sleep:{hours:h,quality:i%3===0?"good":"ok",med:{type:"none",note:""},windDown:{steps:{light:true,breath:i%2===0,dump:true,cool:false},lastMinutes:18,offloadNote:"Yarının üç işini yazdım, gerisini bıraktım.",events:[],sessions:[{ts:ds+"T22:30:00+03:00",minutes:18}]}},walk:{steps:5200+i*180,minutes:42},flow:null,symptoms:i===4?["yorgun"]:[],discomfort:{regions:i===4?{bas:{level:1}}:{},note:i===4?"Hafif baş ağrısı":"",meds:[]},sessions:[{start:new Date(ds+"T09:00:00+03:00").getTime(),end:new Date(ds+"T09:08:00+03:00").getTime(),activeSeconds:360}],movement:{walkM:3800+i*80,vehicleM:0,totalM:3800+i*80,maxSpeed:1.7,samples:24,walkSec:2500,vehicleSec:0,track:[]},reading:{entries:i%2===0?[{id:"r"+i,title:"Kendine Ait Bir Oda",author:"Virginia Woolf",pages:8,minutes:20,note:"Sessizlik ve alan üzerine düşündürdü.",ts:ds+"T20:00:00+03:00"}]:[]},watching:{entries:[]},listening:{entries:i%3===0?[{id:"l"+i,title:"Demo Çalma Listesi",artist:"Günışığı",kind:"album",minutes:24,note:"Yürüyüşe iyi eşlik etti.",ts:ds+"T18:00:00+03:00"}]:[]},learning:{entries:i===9?[{id:"ln1",topic:"Uyku ve kafein ilişkisi",source:"Okuma notu",note:"Kafeinin yarı ömrünün yaklaşık beş saat olduğunu öğrendim.",ts:ds+"T17:00:00+03:00"}]:[]},gratitude:["Sabah ışığı","Sakin bir yürüyüş","Güzel bir sohbet"],health:{steps:5200+i*180,walkM:3800+i*80,updatedAt:ds+"T20:55:00+03:00"},nutri:{calories:1760,protein:92,carbs:185,fat:62},saygi:i===9?{personId:"demo-kisi",readAt:ds+"T20:00:00+03:00",readingEntryId:"r"+i}:null};
  }
  return {version:2,startDate:start,lastOpenedDate:td,lastOpenedAt:new Date().toISOString(),days:days,notifications:[],settings:{nickname:"Demo Günışığı",lunaConnected:true,locationMode:"auto",caffeineMode:"standard",targetBed:"23:30"},luna:{qa:[{date:td,ts:td+"T10:00:00+03:00",question:"Bugün enerjin nasıl?",answer:"Sakin ve dengeli görünüyor; ritmini koru."}]},aeon:{qa:[{id:"demo-aeon",date:td,ts:td+"T11:00:00+03:00",question:"Bugünkü verilerimde öne çıkan ne?",answer:"Uyku, su ve yürüyüş birlikte güçlü bir temel oluşturmuş.",answeredAt:td+"T11:02:00+03:00"}]},cycle:{periods:[{start:addDays(td,-18),end:addDays(td,-14)}],avgCycle:28,avgPeriod:5},weather:{fetchedAt:new Date().toISOString(),spots:[{key:"ev",label:"Ev",place:"Demo",iconName:"house",code:1,isDay:true,temp:24,feels:24,hum:46,wind:8,uv:3,hi:26,lo:15}]},library:{goal:{dailyPages:20,yearlyBooks:12},books:[{id:"b1",title:"Kendine Ait Bir Oda",author:"Virginia Woolf",genre:"Deneme",totalPages:160,currentPage:72,status:"reading",rating:5,quotes:[{id:"q1",text:"Kendine ait bir alan, düşünceye nefes verir.",page:36,ts:td+"T20:00:00+03:00"}],createdAt:start+"T10:00:00+03:00"}]},watchlist:{goal:{dailyMinutes:40,yearlyTitles:24},items:[{id:"w1",title:"Demo Belgesel",kind:"film",genre:"Belgesel",status:"finished",watchedEp:1,totalEp:null,rating:4,quotes:[],finishedAt:addDays(td,-2)+"T21:00:00+03:00",createdAt:start+"T10:00:00+03:00"}]},music:{goal:{dailyMinutes:30,yearlyTitles:null},items:[{id:"m1",title:"Demo Çalma Listesi",artist:"Günışığı",kind:"album",genre:"Sakin",rating:5,quotes:[],createdAt:start+"T10:00:00+03:00"}]},body:{heightCm:165,heightSetAt:start+"T09:00:00+03:00",weights:Array.from({length:10},function(_,i){return {ts:addDays(start,i)+"T08:00:00+03:00",kg:68.4-i*.12};})},labResults:[],motivation:{currentProgramDay:3,stats:{pathStreak:2,bestPathStreak:2,courageEvidence:1,returnCount:0,completedTotal:2,minimumTotal:1},history:{demo1:{date:addDays(td,-1),programDay:2,phaseCode:"F1",domain:"destek",status:"minimum_completed",reflection:"Küçük sürümü yapmak devam etmemi sağladı.",quote:"Küçük adım da yoldur.",minimumTask:"Bir kişiye kısa bir mesaj gönder.",successMeaning:"Bağ kurmayı seçtin."}}}};
}
function load(){
  if(!DEMO_MODE&&(UI.msgSending||panelBusyTyping())){ markPollSkippedP(UI.msgSending?'skipped_input':'skipped_input'); return Promise.resolve(D); }
  var pollStartedAt=Date.now();
  if(!DEMO_MODE){ PANEL_POLL_STATE.fetchCount++; PANEL_POLL_STATE.status='fetching'; PANEL_POLL_STATE.lastFetchStartedAt=new Date(pollStartedAt).toISOString(); }
  if(DEMO_MODE){
    var demo=demoData();
    setPanelLocationContextP(demo);
    SYNC_RECEIPT=normalizeSyncReceiptP({status:'accepted',snapshotRevision:'d'.repeat(40),sourceUpdatedAt:new Date(Date.now()-30000).toISOString(),submittedAt:new Date(Date.now()-25000).toISOString(),acceptedAt:new Date(Date.now()-10000).toISOString(),sourceLatestSha:'e'.repeat(40)});
    var DP=window.PanelCoverageV1;
    if(DP&&typeof DP.buildObserverSnapshot==='function'&&typeof DP.chooseProjection==='function'){
      var ds=DP.buildObserverSnapshot(demo,SYNC_RECEIPT), dd=DP.chooseProjection(ds,demo,SYNC_RECEIPT);
      D=dd.data; PROJECTION.snapshot=dd.snapshot; PROJECTION.state=dd; PROJECTION.sections=dd.sections||{}; EVENT_LOG_STATE=buildEventLogStateP(D,[]);
    }else{ D=demo; PROJECTION.snapshot=null; PROJECTION.state={source:'none',reason:'projection_unavailable',snapshot:null,data:D,coverage:null}; PROJECTION.sections={}; }
    PROJECTION.sectionFetchState={ok:true,lastError:null,failedAt:null};
    PANEL_POLL_AT=new Date().toISOString(); OBSINBOX=[]; OBSRECEIPTS={}; updatePollRevisionsP(D,SYNC_RECEIPT,PROJECTION.state); PANEL_POLL_STATE.lastOutcome='demo'; if(!UI.selectedDate)UI.selectedDate=today(); if(!UI.month)UI.month=monthKey(UI.selectedDate); render(); return Promise.resolve(D);
  }
  PTOKEN=normalizeToken(PTOKEN); if(!PTOKEN){ tokenPrompt(); return; }
  return fetchLatest(REPO,BRANCH)
    .catch(function(e){ if(e&&e.notFound&&BRANCH!=="main"){ BRANCH="main"; return fetchLatest(REPO,BRANCH);} throw e; })
    .then(function(j){
      var pollMeta=j&&j.meta||{}, pollCompleted=pollMeta.completedAt||new Date().toISOString();
      if(j&&j.notModified){
        PANEL_POLL_AT=pollCompleted; updatePollRevisionsP(D,SYNC_RECEIPT,PROJECTION.state); PANEL_POLL_STATE.notModifiedCount++;
        // 304 yaniti: section fetch state'ini sifirla (önceki hata varsa uyari sönsün).
        PROJECTION.sectionFetchState={ok:true,lastError:null,failedAt:null};
        var pollSig=panelSig();
        if(panelDraftActiveP()){ markPollSkippedP('deferred_draft'); PANEL_POLL_STATE.pendingRender=true; return D; }
        var hadPending=PANEL_POLL_STATE.pendingRender; PANEL_POLL_STATE.pendingRender=false; pollRecordP('not_modified',pollStartedAt,pollMeta); if(hadPending){ if(panelInteractionActiveP()){ PANEL_POLL_STATE.pendingRender=true; return D; } LASTSIG=pollSig; LAST_RENDERED_POLL_OUTCOME='not_modified'; render(); } else { LAST_RENDERED_POLL_OUTCOME='not_modified'; updatePollRibbonP(); } return D;
      }
      var latestLegacy=j&&j.data?j.data:j; SYNC_RECEIPT=null; if(!latestLegacy||!latestLegacy.days||!latestLegacy.startDate) throw new Error("Beklenen veri yapisi yok.");
      setPanelLocationContextP(latestLegacy);
      if(!UI.selectedDate) UI.selectedDate=today(); if(!UI.month) UI.month=monthKey(UI.selectedDate);
      QTRANSPORT={delivery:'idle',responses:'idle',errors:[]};
      var previousEventRows=EVENT_LOG_STATE&&Array.isArray(EVENT_LOG_STATE.events)?EVENT_LOG_STATE.events.slice():[], hadPreviousSnapshot=!!D;
      Promise.all([loadInbox(), loadDeliveryP(), loadResponsesP(), loadSyncReceiptP(), loadObserverProjectionP(), loadEventLogP(latestLegacy)]).then(function(res){
        var ib=res[0]||{};
        OBSINBOX=ib.messages||[]; OBSSHA=ib.sha; OBSRECEIPTS=ib.receipts||{};
        var incomingEventState=res[5]||buildEventLogStateP(latestLegacy,[]), newEventCount=countNewEventChangesP(previousEventRows,incomingEventState.events);
        EVENT_LOG_STATE=incomingEventState;
        SYNC_RECEIPT=res[3]||null;
        var P=window.PanelCoverageV1, projection=res[4]&&res[4].snapshot||null;
        if(P&&typeof P.chooseProjection==='function'){
          var chosen=P.chooseProjection(projection,latestLegacy,SYNC_RECEIPT);
          chosen=projectionSourceStateP(chosen,res[4]);
          PROJECTION.state=chosen||{source:'legacy_fallback',reason:'projection_invalid',snapshot:null,data:latestLegacy,coverage:null};
          D=PROJECTION.state.data||P.redactForObserver(latestLegacy);
          PROJECTION.snapshot=PROJECTION.state.snapshot||null;
          PROJECTION.sections=PROJECTION.state.sections||{};
        }else{
          D=latestLegacy; PROJECTION.snapshot=null; PROJECTION.state={source:'none',reason:'projection_unavailable',snapshot:null,data:D,coverage:null}; PROJECTION.sections={};
        }
        PANEL_POLL_AT=new Date().toISOString(); updatePollRevisionsP(D,SYNC_RECEIPT,PROJECTION.state);
        // Basarili yükleme: section fetch state'ini sifirla (önceki hata varsa
        // uyari metni sönsün, bir sonraki poll'da tekrar hata olursa yeniden
        // set edilecek).
        PROJECTION.sectionFetchState={ok:true,lastError:null,failedAt:null};
        // Sunucu verisi bir önceki turla birebir aynıysa yeniden çizme: gözlemcinin
        // açtığı "Tümünü göster" balonları kapanmasın, akış titremesin (anlık poll'a rağmen).
        var sig=panelSig();
        var changed=sig===null||sig!==LASTSIG;
        if(hadPreviousSnapshot&&changed) UI.newChanges=Math.min(99,Math.max(1,newEventCount));
        applyPollRenderP(sig,changed,changed?'changed':'unchanged',pollStartedAt,{etag:pollMeta.etag,completedAt:PANEL_POLL_AT});
      }).catch(function(err){
        pollRecordP('error',pollStartedAt,{errorCode:'network'});
        var P=window.PanelCoverageV1;
        SYNC_RECEIPT=null;
        D=P&&typeof P.redactForObserver==='function'?P.redactForObserver(latestLegacy):latestLegacy;
        PROJECTION.snapshot=null; PROJECTION.state={source:'legacy_fallback',reason:'projection_load_failed',snapshot:null,data:D,coverage:P&&P.coverageForData?P.coverageForData(latestLegacy):null};
        // REM-59: yan-kanal (section) fetch hatasında önceki sağlıklı sections
        // KORUNUR ve yalnızca sabit bir hata KODU tutulur (ham network hatası /
        // token / kişisel ayrıntı asla panel durumuna girmez). İlk yüklemede
        // (hiç section yokken) normal "missing" davranışı korunur.
        var fx=applySectionFailureP(PROJECTION.sections,err);
        PROJECTION.sections=fx.sections;
        PROJECTION.sectionFetchState=fx.sectionFetchState;
        EVENT_LOG_STATE=buildEventLogStateP(latestLegacy,[]);
        if(panelDraftActiveP()){ PANEL_POLL_STATE.pendingRender=true; return; }
        render();
      });
    })
    .catch(function(e){
      pollRecordP('error',pollStartedAt,{errorCode:e&&e.code||'network'});
      var m=String(e&&e.message||e);
      if(/headers.+RequestInit|non ISO-8859-1|String contains/i.test(m)){ tokenPrompt("Anahtar bicimi hatali, yeniden yapistir."); return; }
      if(/gecersiz|yetkisiz/i.test(m)){ tokenPrompt("Anahtar gecersiz veya yetki yok."); return; }
      if(panelDraftActiveP()){ PANEL_POLL_STATE.pendingRender=true; markPollSkippedP('deferred_draft'); return; }
      fail(m);
    });
}
// Yeniden-çizim imzası: yalnızca sunucudan gelen veriye bağlı (D + inbox + receipts).
// UI-içi durum (sekme, kart açma) render'ı doğrudan çağırır; bu imza yalnızca poll turunda kullanılır.
var LASTSIG=null;
function panelSig(){ try{ return JSON.stringify(D)+"\u0001"+JSON.stringify(PANEL_LOCATION_CONTEXT)+"\u0001"+JSON.stringify(SYNC_RECEIPT)+"\u0001"+JSON.stringify(PROJECTION)+"\u0001"+JSON.stringify(OBSINBOX)+"\u0001"+JSON.stringify(OBSRECEIPTS)+"\u0001"+JSON.stringify(QDELIVERY)+"\u0001"+JSON.stringify(QRESPONSES)+"\u0001"+JSON.stringify(QTRANSPORT)+"\u0001"+JSON.stringify(EVENT_LOG_STATE); }catch(e){ return null; } }
window.load=load;
// Boot watchdog iptali: panel.js IIFE'si buraya ulaştıysa çekirdek ayakta —
// panel.html'deki watchdog'ın (seyma-panel-watchdog) yer tutucuyu değiştirmesine
// gerek yok, normal boot akışı devam eder.
try{ if(typeof localStorage!=="undefined") localStorage.removeItem("seyma-panel-watchdog"); }catch(e){}
try{ if(typeof document!=="undefined"&&document.getElementById){ var __pa=document.getElementById("app"); if(__pa&&__pa.dataset) __pa.dataset.panelReady="1"; } }catch(e){}
try{
  if(!DEMO_MODE){
    PTOKEN=normalizeToken(localStorage.getItem(PTKEY)||"");
    var raw=localStorage.getItem(APPKEY);
    if(raw){
      var app=JSON.parse(raw), s=app&&app.settings?app.settings:{};
      if(!qs.get("repo")&&s.ghRepo) REPO=s.ghRepo;
      if(!qs.get("branch")&&s.ghBranch) BRANCH=s.ghBranch;
      if(!PTOKEN&&s.ghToken) PTOKEN=normalizeToken(s.ghToken);
    }
    if(PTOKEN&&!localStorage.getItem(PTKEY)) localStorage.setItem(PTKEY,PTOKEN);
  }
  var expRaw=localStorage.getItem(CARDEXPKEY);
  if(expRaw) UI.expandedCards=JSON.parse(expRaw)||{};
  var insRaw=localStorage.getItem(INSTABKEY);
  if(insRaw) UI.insightTab=insRaw;
  var densityRaw=localStorage.getItem(DENSITYKEY);
  if(['quick','standard','audit'].indexOf(densityRaw)>=0) UI.density=densityRaw;
  var auditRaw=localStorage.getItem(AUDITTABKEY);
  if(['root','provenance','modules','events'].indexOf(auditRaw)>=0) UI.auditTab=auditRaw;
}catch(e){}
load();
initDevModeUrlTriggerP();
// Panel otomatik yenileme: ~15 sn'de bir (mesajlar mümkün olduğunca anlık gelsin),
// ama gözlemci bir metin alanına yazarken (ya da gönderim sürerken) o turu atla —
// yanıt yazarken imleç/taslak kesilmesin. Veri değişmediyse load() zaten render etmez.
function panelBusyTyping(){ var el=document.activeElement; if(!el) return false; var tag=(el.tagName||"").toUpperCase(); return tag==="TEXTAREA"||tag==="INPUT"; }
setInterval(function(){ if(DEMO_MODE||!PTOKEN) return; if(UI.msgSending||panelBusyTyping()){ markPollSkippedP(UI.msgSending?'skipped_input':'skipped_input'); return; } load(); },5000);
// Sekme arka plana alınıp geri dönüldüğünde bir sonraki 5sn'lik turu
// beklemeden anında yenile — "eş zamanlı" hissi asıl burada kurulur, çünkü
// gözlemci genelde panele "az önce ne oldu" diye bakmak için döner.
// ETag/conditional GET (pollConditionalDecisionP) sayesinde veri
// değişmediyse bu ekstra istek ucuzdur (304, gövde indirilmez).
if(typeof document!=='undefined'&&typeof document.addEventListener==='function'){
  document.addEventListener('visibilitychange',function(){
    if(document.visibilityState==='visible'&&!DEMO_MODE&&PTOKEN&&!UI.msgSending&&!panelBusyTyping()) load();
  });
}
document.addEventListener("keydown",eventDrawerKeydownP);
document.addEventListener("visibilitychange",function(){ if(!DEMO_MODE&&!document.hidden&&PTOKEN){ if(UI.msgSending||panelBusyTyping()){ markPollSkippedP('skipped_input'); return; } load(); } });
window.addEventListener("focus",function(){ if(!DEMO_MODE&&PTOKEN){ if(UI.msgSending||panelBusyTyping()){ markPollSkippedP('skipped_input'); return; } load(); } });
})();
