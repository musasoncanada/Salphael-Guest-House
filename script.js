
// price estimator
const RATE_MAP={standard:40000,deluxe:60000,family_down:100000,family_up:120000};
function days(a,b){const ms=86400000; if(!a||!b) return 0; return Math.max(0,Math.round((new Date(b)-new Date(a))/ms));}
function updateEstimate(){const f=document.getElementById('bookingForm'); if(!f) return; const n=days(f.checkin.value,f.checkout.value); const r=RATE_MAP[f.room_type.value]||0; const t=n*r; const out=document.getElementById('est_total'); if(out) out.textContent='₦'+t.toLocaleString();}
document.addEventListener('input',updateEstimate);document.addEventListener('change',updateEstimate);document.addEventListener('DOMContentLoaded',updateEstimate);
