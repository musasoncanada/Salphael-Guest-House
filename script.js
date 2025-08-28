const yearSpan=document.getElementById('year'); if (yearSpan) yearSpan.textContent=new Date().getFullYear();

// Blocked dates list (YYYY-MM-DD). Update as needed.
const BLOCKED_DATES = [
  // '2025-09-25','2025-09-26'
];

function ymd(d){ return d.toISOString().slice(0,10); }

function buildCalendar(){
  const cal = document.getElementById('calendar');
  const title = document.getElementById('calTitle');
  if(!cal) return;
  let cursor = new Date(); cursor.setDate(1);

  function render(){
    cal.innerHTML = '';
    const y = cursor.getFullYear(), m = cursor.getMonth();
    title.textContent = cursor.toLocaleString(undefined,{month:'long', year:'numeric'});

    const heads = ['Sun','Mon','Tue','Wed','Thu','Fri','Sat'];
    for(const h of heads){ const el=document.createElement('div'); el.className='head'; el.textContent=h; cal.appendChild(el); }
    const first = new Date(y,m,1).getDay();
    const days = new Date(y,m+1,0).getDate();
    for(let i=0;i<first;i++){ const b=document.createElement('div'); b.className='day'; cal.appendChild(b); }
    for(let d=1; d<=days; d++){
      const date = new Date(y,m,d);
      const cell = document.createElement('div');
      cell.className = 'day';
      const iso = ymd(date);
      if (BLOCKED_DATES.includes(iso)) cell.classList.add('blocked'); else cell.classList.add('free');
      if (iso === ymd(new Date())) cell.classList.add('today');
      cell.textContent = d;
      cal.appendChild(cell);
    }
  }
  render();
  document.getElementById('prevMonth').onclick = ()=>{cursor.setMonth(cursor.getMonth()-1); render();}
  document.getElementById('nextMonth').onclick = ()=>{cursor.setMonth(cursor.getMonth()+1); render();}
}
document.addEventListener('DOMContentLoaded', buildCalendar);

// Formspree endpoint (replace with your real ID)
const FORMSPREE_ENDPOINT = 'https://formspree.io/f/your-id-here';

async function sendFormspree(data){
  if (!FORMSPREE_ENDPOINT || FORMSPREE_ENDPOINT.includes('your-id-here')){
    console.warn('Formspree not configured yet.');
    return;
  }
  try{
    const form = new FormData();
    for (const [k,v] of Object.entries(data)) form.append(k, v);
    form.append('_subject', 'New reservation request from Salphael website');
    await fetch(FORMSPREE_ENDPOINT, { method:'POST', body: form, headers:{'Accept':'application/json'} });
  }catch(e){ console.error('Formspree error', e); }
}

function submitReservation(e){
  e.preventDefault();
  const formEl = document.getElementById('bookingForm');
  const data = Object.fromEntries(new FormData(formEl).entries());

  const inDate = new Date(data.checkin), outDate = new Date(data.checkout);
  if (isNaN(inDate) || isNaN(outDate) || outDate <= inDate){
    alert('Please choose valid check-in and check-out dates.');
    return false;
  }
  const inISO = data.checkin, outISO = data.checkout;
  if (BLOCKED_DATES.includes(inISO) || BLOCKED_DATES.includes(outISO)){
    alert('Selected dates include unavailable days. Please choose different dates.');
    return false;
  }

  // Send to Formspree (email) in background
  sendFormspree(data);

  // Open WhatsApp for quick confirmation
  const msg = `Hello Salphael, I would like to reserve:\n\n` +
              `Name: ${data.name}\n` +
              `Phone: ${data.phone}\n` +
              (data.email ? `Email: ${data.email}\n` : '') +
              `Check-in: ${data.checkin}\n` +
              `Check-out: ${data.checkout}\n` +
              `Guests: ${data.guests}\n` +
              `Bedrooms: ${data.bedrooms}\n` +
              (data.notes ? `Requests: ${data.notes}\n` : '') +
              `\nPlease confirm availability. Thank you.`;
  const waURL = `https://wa.me/2348146144201?text=${encodeURIComponent(msg)}`;
  window.open(waURL, '_blank');
  return false;
}
