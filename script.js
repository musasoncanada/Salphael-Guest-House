
function parseYMD(s){
  // Avoid timezone shift from new Date('YYYY-MM-DD') which is parsed as UTC in many browsers
  if(!s) return null;
  const parts = s.split('-').map(Number);
  if(parts.length!==3) return null;
  const [y,m,d] = parts;
  return new Date(y, (m||1)-1, d||1);
}
function ymd(date){
  const y=date.getFullYear();
  const m=String(date.getMonth()+1).padStart(2,'0');
  const d=String(date.getDate()).padStart(2,'0');
  return `${y}-${m}-${d}`;
}


const yearSpan=document.getElementById('year'); if(yearSpan) yearSpan.textContent=new Date().getFullYear();
const toggle=document.querySelector('.menu-toggle'), drawer=document.getElementById('drawer'); if(toggle&&drawer){toggle.addEventListener('click',()=>drawer.classList.toggle('open'));}

// Availability via Google Apps Script
let AVAIL_API = 'https://script.google.com/macros/s/AKfycbyZnuRqo-kE86h-XzPeHg5euKEDRVhR1i85LizHkhjOGzTzxbF1A8IYDqfMC5U019jM/exec';
// Optional: allow quick setup via URL param (?avail=EXEC_URL) or localStorage
(function(){try{const u=new URL(location.href);const p=u.searchParams.get('avail');if(p){localStorage.setItem('Salphael_AVAIL_API',p);}const s=localStorage.getItem('Salphael_AVAIL_API');if(s){AVAIL_API=s;}}catch(e){}})();
let BLOCKED_DATES=[];
async function loadBlockedDates(){ if(!document.getElementById('calendar')) return; try{ const r=await fetch(AVAIL_API,{cache:'no-store'}); const d=await r.json(); BLOCKED_DATES=Array.isArray(d.blocked)?d.blocked:[]; }catch(e){ console.warn('Availability API error', e); BLOCKED_DATES=[]; }}
function ymd(d){return ymd(d);}
async function buildCalendar(){ await loadBlockedDates(); const cal=document.getElementById('calendar'); const title=document.getElementById('calTitle'); if(!cal) return; let cursor=new Date(); cursor.setDate(1);
  function render(){ cal.innerHTML=''; const y=cursor.getFullYear(), m=cursor.getMonth(); if(title) title.textContent=cursor.toLocaleString(undefined,{month:'long',year:'numeric'});
    const heads=['Sun','Mon','Tue','Wed','Thu','Fri','Sat']; for(const h of heads){const el=document.createElement('div'); el.className='head'; el.textContent=h; cal.appendChild(el);}
    const first=new Date(y,m,1).getDay(), days=new Date(y,m+1,0).getDate(); for(let i=0;i<first;i++){const b=document.createElement('div'); b.className='day'; cal.appendChild(b);}
    for(let d=1; d<=days; d++){ const date=new Date(y,m,d); const iso=ymd(date); const cell=document.createElement('div'); cell.className='day ' + (BLOCKED_DATES.includes(iso)?'blocked':'free'); if(iso===ymd(new Date())) cell.classList.add('today'); cell.textContent=d; cal.appendChild(cell); }
  }
  render(); const prev=document.getElementById('prevMonth'), next=document.getElementById('nextMonth'); if(prev) prev.onclick=()=>{cursor.setMonth(cursor.getMonth()-1); render();}; if(next) next.onclick=()=>{cursor.setMonth(cursor.getMonth()+1); render();};
}
document.addEventListener('DOMContentLoaded', buildCalendar);

// Reservation: Formspree + WhatsApp
const FORMSPREE_ENDPOINT='https://formspree.io/f/mwpnveej'; // provided by you
async function sendFormspree(data){ if(!FORMSPREE_ENDPOINT) return; const form=new FormData(); for(const [k,v] of Object.entries(data)) form.append(k,v); form.append('_subject','New reservation request from Salphael website'); try{ await fetch(FORMSPREE_ENDPOINT,{method:'POST', body:form, headers:{'Accept':'application/json'}});}catch(e){console.warn('Formspree error',e);}}
function datesOverlapBlocked(checkin, checkout){ if(!BLOCKED_DATES||!BLOCKED_DATES.length) return false; const start=parseYMD(checkin), end=parseYMD(checkout); for(let d=new Date(start); d<end; d.setDate(d.getDate()+1)){ if(BLOCKED_DATES.includes(ymd(d))) return true; } return false; }
function submitReservation(e){ e.preventDefault(); const formEl=document.getElementById('bookingForm'); if(!formEl) return false; const data=Object.fromEntries(new FormData(formEl).entries());
  const inDate=parseYMD(data.checkin), outDate=parseYMD(data.checkout); if(isNaN(inDate)||isNaN(outDate)||outDate<=inDate){ alert('Please choose valid check-in and check-out dates.'); return false; }
  if(datesOverlapBlocked(data.checkin, data.checkout)){ alert('Selected period includes unavailable dates. Please choose different dates.'); return false; }
  sendFormspree(data);
  const msg = `Hello Salphael, I would like to reserve:\n\nName: ${data.name}\nPhone: ${data.phone}\n${data.email?`Email: ${data.email}\n`:''}Check-in: ${data.checkin}\nCheck-out: ${data.checkout}\nGuests: ${data.guests}\nBedrooms: ${data.bedrooms}\n${data.notes?`Requests: ${data.notes}\n`:''}\nPlease confirm availability. Thank you.`;
  window.open('https://wa.me/2348146144201?text='+encodeURIComponent(msg),'_blank'); return false;
}
