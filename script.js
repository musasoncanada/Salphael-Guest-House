
// price estimator
const RATE_MAP={standard:40000,deluxe:60000,family_down:100000,family_up:120000};
function days(a,b){const ms=86400000; if(!a||!b) return 0; return Math.max(0,Math.round((new Date(b)-new Date(a))/ms));}
function updateEstimate(){const f=document.getElementById('bookingForm'); if(!f) return; const n=days(f.checkin.value,f.checkout.value); const r=RATE_MAP[f.room_type.value]||0; const t=n*r; const out=document.getElementById('est_total'); if(out) out.textContent='₦'+t.toLocaleString();}
document.addEventListener('input',updateEstimate);document.addEventListener('change',updateEstimate);document.addEventListener('DOMContentLoaded',updateEstimate);

// === Formspree submission (non-WhatsApp booking) ===
const FORMSPREE_ENDPOINT = 'https://formspree.io/f/mwpnveej';
document.addEventListener('DOMContentLoaded', () => {
  const btn = document.getElementById('submitForm');
  const form = document.getElementById('bookingForm');
  const out = document.getElementById('submitResult');
  function payload(f){
    const nights = (function(){const s=(v)=>v?new Date(v):null; const a=s(f.checkin.value), b=s(f.checkout.value); if(!a||!b) return 0; return Math.max(0, Math.round((b-a)/86400000));})();
    const rateMap = {standard:40000,deluxe:60000,family_down:100000,family_up:120000};
    const est = nights*(rateMap[f.room_type.value]||0);
    return {
      name: f.name.value, phone: f.phone.value, email: f.email.value,
      room_type: f.room_type.value, checkin: f.checkin.value, checkout: f.checkout.value,
      nights: nights, estimated_total: '₦'+est.toLocaleString(), source: 'Salphael website'
    };
  }
  if(btn){
    btn.addEventListener('click', async () => {
      if(!form.checkValidity()){ form.reportValidity(); return; }
      out.textContent = 'Submitting...';
      try{
        const res = await fetch(FORMSPREE_ENDPOINT, {
          method: 'POST',
          headers: { 'Accept': 'application/json', 'Content-Type': 'application/json' },
          body: JSON.stringify(payload(form))
        });
        if(res.ok){
          out.textContent = 'Thanks! Your booking request has been sent. We’ll contact you shortly.';
          form.reset(); updateEstimate();
        } else {
          out.textContent = 'Could not submit right now. You can also email us: asalphaelguesthouse@gmail.com or call +234 814 614 4201.';
        }
      }catch(e){
        out.textContent = 'Network error. Please try again, or email/call us.';
      }
    });
  }
});
