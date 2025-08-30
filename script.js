
// rates + estimator
const RATE_MAP={standard:40000,deluxe:60000,family_down:100000,family_up:120000};
function days(a,b){const ms=86400000; if(!a||!b) return 0; return Math.max(0,Math.round((new Date(b)-new Date(a))/ms));}
function updateEstimate(){const f=document.getElementById('bookingForm'); if(!f) return; const n=days(f.checkin.value,f.checkout.value); const r=RATE_MAP[f.room_type.value]||0; const t=n*r; const out=document.getElementById('est_total'); if(out) out.textContent='₦'+t.toLocaleString();}
document.addEventListener('input',updateEstimate);document.addEventListener('change',updateEstimate);document.addEventListener('DOMContentLoaded',updateEstimate);
// mini availability calendar (home)
const AVAILABILITY_ENDPOINT = 'https://script.googleusercontent.com/macros/echo?user_content_key=AehSKLgMe-Nak29ayJl_NJ_QaHbm7hVVmecuzQaXiM2k6ZP7mOdEfvD1upd0r-GqdyX1QmTftQ_bql32KhfDXk7MDSIZ4A1Jkj4BFgCJaHoiM6L5dZgH1HHtVXGckTRB3mFCMloE7sHA3IGIRgXuB-SxGmr-MffyA2pjVUaPo1r5Yb5dWkfeA6gZBpwIoZam8v12Qd67hn-fchG9ErSQl73QmCmhcR4mRif9mM363T9bj2I9kDcFoZs2j0jVhxDiedhkakhuGB0kLe8LZlI0PBtNOsOPFR9oHA&lib=MOui0lULrpOxQVN1t84WAQzKgCMnDg4Op';
function formatMonth(y,m){return new Date(y,m,1).toLocaleString(undefined,{month:'long',year:'numeric'});}
function daysInMonth(y,m){return new Date(y,m+1,0).getDate();}
function renderMonth(container, y, m, blockedSet){
  const wrap=document.createElement('div'); wrap.className='cal-month';
  const head=document.createElement('div'); head.className='cal-head'; head.innerHTML='<span>'+formatMonth(y,m)+'</span><span class="cal-legend">Red = unavailable</span>';
  wrap.appendChild(head);
  const grid=document.createElement('div'); grid.className='cal-grid';
  const dows=['Sun','Mon','Tue','Wed','Thu','Fri','Sat']; dows.forEach(d=>{const el=document.createElement('div'); el.className='dow'; el.textContent=d; grid.appendChild(el);});
  const firstDow=new Date(y,m,1).getDay(); for(let i=0;i<firstDow;i++){const pad=document.createElement('div'); grid.appendChild(pad);}
  const today=new Date(); today.setHours(0,0,0,0);
  for(let d=1; d<=daysInMonth(y,m); d++){ 
    const el=document.createElement('div'); el.className='cal-day'; el.textContent=d;
    const iso=y+'-'+String(m+1).padStart(2,'0')+'-'+String(d).padStart(2,'0');
    if(blockedSet.has(iso)) el.classList.add('blocked');
    const cur=new Date(y,m,d);
    if(cur.getFullYear()===today.getFullYear() && cur.getMonth()===today.getMonth() && cur.getDate()===today.getDate()) el.classList.add('today');
    grid.appendChild(el);
  }
  wrap.appendChild(grid); container.appendChild(wrap);
}
async function loadMiniCalendar(){
  const root=document.getElementById('miniCalendar'); if(!root) return;
  try{ const res=await fetch(AVAILABILITY_ENDPOINT, {cache:'no-store'}); const data=await res.json();
    const blockedSet=new Set((data.blocked||[]));
    const now=new Date(); const y=now.getFullYear(); const m=now.getMonth();
    renderMonth(root, y, m, blockedSet);
    const nextM = (m+1)%12; const nextY = m===11?y+1:y;
    renderMonth(root, nextY, nextM, blockedSet);
    const upd=document.getElementById('calUpdated'); if(upd) upd.textContent = data.updated ? new Date(data.updated).toLocaleString() : '–';
  }catch(e){ const root=document.getElementById('miniCalendar'); if(root) root.textContent='Calendar unavailable right now.'; }
}
document.addEventListener('DOMContentLoaded', loadMiniCalendar);
