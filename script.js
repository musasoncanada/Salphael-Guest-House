// Google Apps Script endpoint that serves JSON like:
// { updated: "...", blocked: ["YYYY-MM-DD", ...] }
const AVAILABILITY_ENDPOINT = 'https://script.google.com/macros/s/AKfycbwUa4ILpm3lWizeoamDiCpAYzpq6oPIFfZtgfm-XjXQ574dAsrLxY9uvirfniaUG0T9Wg/exec';

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
let AVAIL_API = 'https://script.google.com/macros/s/AKfycbwUa4ILpm3lWizeoamDiCpAYzpq6oPIFfZtgfm-XjXQ574dAsrLxY9uvirfniaUG0T9Wg/exec';
// Optional: allow quick setup via URL param (?avail=EXEC_URL) or localStorage
(function(){try{const u=new URL(location.href);const p=u.searchParams.get('avail');if(p){localStorage.setItem('Salphael_AVAIL_API',p);}const s=localStorage.getItem('Salphael_AVAIL_API');if(s){AVAIL_API=s;}}catch(e){}})();
let BLOCKED_DATES=[];
async function loadBlockedDates(){
  if(!document.getElementById('calendar')) return;
  try{
    const r=await fetch(AVAIL_API,{cache:'no-store'});
    const d=await r.json();
    BLOCKED_DATES=Array.isArray(d.blocked)?d.blocked:[];
  }catch(e){
    console.warn('Availability API error', e);
    BLOCKED_DATES=[];
  }
}
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


// === Availability calendar (Home + Availability page) ===
function formatMonth(y,m){return new Date(y,m,1).toLocaleString(undefined,{month:'long',year:'numeric'});}
function daysInMonth(y,m){return new Date(y,m+1,0).getDate();}
function renderMonth(container, y, m, blockedSet){
  const wrap=document.createElement('div'); wrap.className='cal-month';
  const head=document.createElement('div'); head.className='cal-head';
  head.innerHTML='<span>'+formatMonth(y,m)+'</span><span class="cal-legend">Red = unavailable</span>';
  wrap.appendChild(head);

  const grid=document.createElement('div'); grid.className='cal-grid';
  const dows=['Sun','Mon','Tue','Wed','Thu','Fri','Sat'];
  dows.forEach(d=>{const el=document.createElement('div'); el.className='dow'; el.textContent=d; grid.appendChild(el);});

  const firstDow=new Date(y,m,1).getDay();
  for(let i=0;i<firstDow;i++) grid.appendChild(document.createElement('div'));

  const today=new Date(); today.setHours(0,0,0,0);

  for(let d=1; d<=daysInMonth(y,m); d++){
    const el=document.createElement('div'); el.className='cal-day'; el.textContent=d;
    const iso=y+'-'+String(m+1).padStart(2,'0')+'-'+String(d).padStart(2,'0');
    if(blockedSet.has(iso)) el.classList.add('blocked');
    const cur=new Date(y,m,d);
    if(cur.getFullYear()===today.getFullYear() && cur.getMonth()===today.getMonth() && cur.getDate()===today.getDate()) el.classList.add('today');
    grid.appendChild(el);
  }

  wrap.appendChild(grid);
  container.appendChild(wrap);
}

async function loadMiniCalendar(){
  const root=document.getElementById('miniCalendar');
  if(!root) return;
  try{
    const res=await fetch(AVAILABILITY_ENDPOINT + '?_=' + Date.now(), {cache:'no-store'});
    const data=await res.json();
    const blockedSet=new Set((data.blocked||[]));
    const now=new Date(); const y=now.getFullYear(); const m=now.getMonth();
    root.innerHTML='';
    renderMonth(root, y, m, blockedSet);
    const nextM=(m+1)%12, nextY=(m===11?y+1:y);
    renderMonth(root, nextY, nextM, blockedSet);
    const upd=document.getElementById('calUpdated');
    if(upd) upd.textContent = data.updated ? new Date(data.updated).toLocaleString() : '–';
  }catch(e){
    console.error('Availability API error', e);
    root.textContent='Calendar unavailable right now.';
  }
}
document.addEventListener('DOMContentLoaded', loadMiniCalendar);
// --- Salphael WhatsApp (site-wide) ---
(function () {
  const WA_URL =
    "https://api.whatsapp.com/send?phone=2349021173726&text=Hello%20Salphael%20Guest%20House.%20I%20would%20like%20to%20book%20a%20room.%20Please%20send%20availability%20and%20rates.";

  // Update all WhatsApp links on the page (footer, contact cards, etc.)
  document.querySelectorAll('a[href*="wa.me/"], a[href*="api.whatsapp.com/send"], a[href*="whatsapp.com/send"]').forEach(a => {
    a.href = WA_URL;
    a.target = "_blank";
    a.rel = "noopener";
  });

  // Update any visible phone text if it matches old numbers
  document.querySelectorAll("a").forEach(a => {
    const t = (a.textContent || "").replace(/\s+/g, " ").trim();
    if (t.includes("+234 803 584 7866") || t.includes("+234 814 614 4201")) {
      a.textContent = "+234 902 117 3726";
    }
  });

  // Add floating WhatsApp button site-wide (if not already present)
  if (!document.querySelector(".whatsapp-float")) {
    const btn = document.createElement("a");
    btn.className = "whatsapp-float";
    btn.href = WA_URL;
    btn.target = "_blank";
    btn.rel = "noopener";
    btn.setAttribute("aria-label", "Book on WhatsApp");
    btn.innerHTML = `<span class="wa-icon" aria-hidden="true">🟢</span> Book on WhatsApp`;
    document.body.appendChild(btn);
  }

  // Add button styles once
  if (!document.getElementById("wa-float-style")) {
    const style = document.createElement("style");
    style.id = "wa-float-style";
    style.textContent = `
      .whatsapp-float{
        position:fixed;
        right:18px;
        bottom:18px;
        display:flex;
        align-items:center;
        gap:10px;
        padding:12px 16px;
        border-radius:999px;
        background:#25D366;
        color:#fff;
        font-family: Inter, Arial, sans-serif;
        font-weight:700;
        text-decoration:none;
        box-shadow:0 10px 25px rgba(0,0,0,.18);
        z-index:9999;
        transition:transform .15s ease, box-shadow .15s ease, background .15s ease;
      }
      .whatsapp-float:hover{
        transform:translateY(-2px);
        box-shadow:0 14px 30px rgba(0,0,0,.22);
        background:#1ebe5d;
      }
      .wa-icon{
        width:22px;
        height:22px;
        display:inline-flex;
        align-items:center;
        justify-content:center;
        font-size:18px;
        line-height:1;
      }
      @media (max-width:520px){
        .whatsapp-float{
          right:12px;
          bottom:12px;
          padding:12px 14px;
          font-size:14px;
        }
      }
    `;
    document.head.appendChild(style);
  }
})();
