/* ---------- Availability (Mini Calendar) ---------- */
const AVAILABILITY_ENDPOINT =
  'https://script.google.com/macros/s/AKfycbyZnuRqo-kE86h-XzPeHg5euKEDRVhR1i85LizHkhjOGzTzxbF1A8IYDqfMC5U019jM/exec';

function formatMonth(y,m){
  return new Date(y,m,1).toLocaleString(undefined,{month:'long',year:'numeric'});
}
function daysInMonth(y,m){ return new Date(y,m+1,0).getDate(); }

function renderMonth(container, y, m, blockedSet){
  const wrap=document.createElement('div'); wrap.className='cal-month';
  const head=document.createElement('div'); head.className='cal-head';
  head.innerHTML = '<span>'+formatMonth(y,m)+'</span><span class="cal-legend">Red = unavailable</span>';
  wrap.appendChild(head);

  const grid=document.createElement('div'); grid.className='cal-grid';
  const dows=['Sun','Mon','Tue','Wed','Thu','Fri','Sat'];
  dows.forEach(d=>{ const el=document.createElement('div'); el.className='dow'; el.textContent=d; grid.appendChild(el); });

  // pad start
  const firstDow=new Date(y,m,1).getDay();
  for(let i=0;i<firstDow;i++){ grid.appendChild(document.createElement('div')); }

  const today=new Date(); today.setHours(0,0,0,0);

  for(let d=1; d<=daysInMonth(y,m); d++){
    const el=document.createElement('div'); el.className='cal-day'; el.textContent=d;
    const iso = y+'-'+String(m+1).padStart(2,'0')+'-'+String(d).padStart(2,'0');
    if(blockedSet.has(iso)) el.classList.add('blocked');
    const cur=new Date(y,m,d);
    if(cur.getFullYear()===today.getFullYear() && cur.getMonth()===today.getMonth() && cur.getDate()===today.getDate()){
      el.classList.add('today');
    }
    grid.appendChild(el);
  }
  wrap.appendChild(grid);
  container.appendChild(wrap);
}

async function loadMiniCalendar(){
  const root = document.getElementById('miniCalendar');
  if(!root) return;

  try{
    // Cache-bust with timestamp in case Netlify/CDN caches JSON
    const res = await fetch(AVAILABILITY_ENDPOINT + '?_=' + Date.now(), { cache:'no-store' });
    const data = await res.json();

    // Expecting: { "updated": "...", "blocked": ["YYYY-MM-DD", ...] }
    const blockedSet = new Set(data.blocked || []);
    const now = new Date();
    const y = now.getFullYear(), m = now.getMonth();

    renderMonth(root, y, m, blockedSet);
    const nextM = (m+1)%12, nextY = m===11 ? y+1 : y;
    renderMonth(root, nextY, nextM, blockedSet);

    const upd = document.getElementById('calUpdated');
    if(upd) upd.textContent = data.updated ? new Date(data.updated).toLocaleString() : '–';
  }catch(e){
    console.error('Availability API error', e);
    root.textContent = 'Calendar unavailable right now.';
  }
}
document.addEventListener('DOMContentLoaded', loadMiniCalendar);
