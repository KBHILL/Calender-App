// --- Calendar Logic ---
let events = JSON.parse(localStorage.getItem('events')) || [];
let currentDate = new Date();
let currentMonth = currentDate.getMonth();
let currentYear = currentDate.getFullYear();
const months = [
  "Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"
];

function generateYearRange(start, end) {
  let years = "";
  for (let year = start; year <= end; year++) {
    years += `<option value="${year}">${year}</option>`;
  }
  document.getElementById("year").innerHTML = years;
}

function addEvent() {
  const date = document.getElementById('eventDate').value;
  const title = document.getElementById('eventTitle').value.trim();
  const desc = document.getElementById('eventDescription').value.trim();
  const color = document.getElementById('eventColor').value;
  if (date && title) {
    const id = Date.now();
    events.push({ id, date, title, desc, color });
    localStorage.setItem('events', JSON.stringify(events));
    showCalendar(currentMonth, currentYear);
    displayReminders();
    document.getElementById('eventDate').value = '';
    document.getElementById('eventTitle').value = '';
    document.getElementById('eventDescription').value = '';
  } else {
    alert('Please enter event date and title!');
  }
}

function deleteEvent(id) {
  events = events.filter(e => e.id !== id);
  localStorage.setItem('events', JSON.stringify(events));
  showCalendar(currentMonth, currentYear);
  displayReminders();
}

function previous() {
  currentYear = currentMonth === 0 ? currentYear - 1 : currentYear;
  currentMonth = currentMonth === 0 ? 11 : currentMonth - 1;
  showCalendar(currentMonth, currentYear);
}

function next() {
  currentYear = currentMonth === 11 ? currentYear + 1 : currentYear;
  currentMonth = (currentMonth + 1) % 12;
  showCalendar(currentMonth, currentYear);
}

function jump() {
  currentYear = parseInt(document.getElementById('year').value);
  currentMonth = parseInt(document.getElementById('month').value);
  showCalendar(currentMonth, currentYear);
}

// Calendar Table
function showCalendar(month, year) {
  let firstDay = new Date(year, month).getDay();
  let daysInMonth = 32 - new Date(year, month, 32).getDate();

  document.getElementById("monthAndYear").innerText = `${months[month]} ${year}`;
  let tbl = document.getElementById("calendar-body");
  tbl.innerHTML = "";
  document.getElementById("month").value = month;
  document.getElementById("year").value = year;
  
  // Head Row
  if (!document.getElementById("thead-month").children.length) {
    const thead = document.getElementById("thead-month");
    const row = document.createElement("tr");
    ["Sun","Mon","Tue","Wed","Thu","Fri","Sat"].forEach(day => {
      let th = document.createElement("th");
      th.innerText = day;
      row.appendChild(th);
    });
    thead.appendChild(row);
  }
  
  let date = 1;
  for (let i = 0; i < 6; i++) {
    let row = document.createElement("tr");
    for (let j = 0; j < 7; j++) {
      let cell = document.createElement("td");
      if (i === 0 && j < firstDay) {
        cell.innerHTML = "";
      } else if (date > daysInMonth) {
        break;
      } else {
        cell.innerHTML = `<span>${date}</span>`;
        let cellDate = `${year}-${String(month+1).padStart(2,'0')}-${String(date).padStart(2,'0')}`;
        let todaysEvents = events.filter(e => e.date === cellDate);
        todaysEvents.forEach(e => {
          let marker = document.createElement("span");
          marker.className = "event-marker";
          marker.style.background = e.color;
          marker.title = `${e.title}: ${e.desc}`;
          cell.appendChild(marker);
        });
        if (date === currentDate.getDate() && month === currentDate.getMonth() && year === currentDate.getFullYear()) {
          cell.className = "today";
        }
        cell.onclick = () => {
          if (todaysEvents.length) {
            let eventDetails = todaysEvents.map(e =>
              `<strong style="color:${e.color}">${e.title}</strong><br>${e.desc}<br>${e.date} <button onclick="deleteEvent(${e.id})" class="delete-event">Delete</button>`
            ).join("<hr>");
            showEventModal(eventDetails);
          }
        }
        date++;
      }
      row.appendChild(cell);
    }
    tbl.appendChild(row);
  }
}

function showEventModal(html) {
  let modal = document.createElement("div");
  modal.innerHTML = `<div style="
    position:fixed;top:0;left:0;right:0;bottom:0;
    background:rgba(52,73,94,0.22);display:flex;align-items:center;justify-content:center;z-index:1000;">
    <div style="background:#fff;padding:24px;border-radius:12px;min-width:320px;max-width:420px;">
      ${html}
      <div style="text-align:right;margin-top:18px;">
        <button onclick="this.parentElement.parentElement.parentElement.remove()" style="background:#6c63ff;color:#fff;border:none;border-radius:6px;padding:8px 18px;">Close</button>
      </div>
    </div>
  </div>`;
  document.body.appendChild(modal.firstChild);
}

function displayReminders() {
  let list = document.getElementById("reminderList");
  list.innerHTML = "";
  let upcoming = events.filter(e => new Date(e.date) >= new Date()).sort((a,b) => new Date(a.date)-new Date(b.date));
  upcoming.slice(0,7).forEach(e => {
    let li = document.createElement("li");
    li.innerHTML = `<span style="color:${e.color};font-weight:600;">${e.title}</span>
      - ${e.desc} on ${e.date} 
      <button class="delete-event" onclick="deleteEvent(${e.id})">Delete</button>`;
    list.appendChild(li);
  });
}

function initCalendar() {
  generateYearRange(currentYear-7, currentYear+7);
  showCalendar(currentMonth, currentYear);
  displayReminders();
}
document.addEventListener("DOMContentLoaded", initCalendar);
