var ROOMS = [
  { id: 'SR-201A', minPeople: 2, maxPeople: 4 },
  { id: 'SR-201B', minPeople: 2, maxPeople: 4 },
  { id: 'SR-201C', minPeople: 2, maxPeople: 4 },
  { id: 'SR-301', minPeople: 3, maxPeople: 8 },
  { id: 'SR-302', minPeople: 3, maxPeople: 8 },
  { id: 'SR-303', minPeople: 3, maxPeople: 8 },
  { id: 'SR-304', minPeople: 3, maxPeople: 8 },
  { id: 'SR-305', minPeople: 3, maxPeople: 8 }
];

var FORFEIT_MINUTES = 15;

// Date and time
function toDateString(date) {
  if (!date) date = new Date();
  var year = date.getFullYear();
  var month = String(date.getMonth() + 1).padStart(2, '0');
  var day = String(date.getDate()).padStart(2, '0');
  return year + '-' + month + '-' + day;
}

function todayString() {
  return toDateString();
}

function at(date, minutes) {
  var parts = date.split('-');
  return new Date(Number(parts[0]), Number(parts[1]) - 1,
    Number(parts[2]), 0, minutes);
}

function addDays(date, days) {
  var result = at(date, 0);
  result.setDate(result.getDate() + days);
  return toDateString(result);
}

function formatDate(date) {
  return at(date, 0).toDateString();
}

function formatMinutes(minutes) {
  var hour = Math.floor(minutes / 60);
  var min = String(minutes % 60).padStart(2, '0');
  return (hour % 12 || 12) + ':' + min + (hour < 12 ? ' AM' : ' PM');
}

function minutesToValue(minutes) {
  return String(Math.floor(minutes / 60)).padStart(2, '0') +
    ':' + String(minutes % 60).padStart(2, '0');
}

function formatDuration(minutes) {
  return minutes + ' minutes';
}

// Booking dates
function isDateBookable(date) {
  if (!date || !/^\d{4}-\d{2}-\d{2}$/.test(date)) return false;
  return toDateString(at(date, 0)) === date &&
    date >= todayString() && date <= addDays(todayString(), 7);
}

function getBookableDates() {
  var dates = [];
  for (var i = 0; i <= 7; i++) {
    var date = addDays(todayString(), i);
    dates.push({ value: date, label: formatDate(date) });
  }
  return dates;
}

// Check if a room is already booked
function overlaps(booking, start, end) {
  return new Date(booking.startTime) < end &&
    new Date(booking.endTime) > start;
}

// Create schedule table
function buildGrid(date, bookings) {
  var rows = [];

  for (var time = 540; time < 1260; time += 30) {
    var cells = [];

    ROOMS.forEach(function(room) {
      var start = at(date, time);
      var booking = bookings.find(function(b) {
        return b.roomId === room.id &&
          overlaps(b, start, at(date, time + 30));
      });

      cells.push({
        roomId: room.id,
        status: booking ? 'booked' : start <= new Date() ? 'past' : 'free',
        start: minutesToValue(time),
        groupName: booking ? booking.userName : ''
      });
    });

    rows.push({ label: formatMinutes(time), cells: cells });
  }
  return { rooms: ROOMS, rows: rows };
}

// Check how long a room is available
function maxDurationFor(roomId, date, startMin, bookings) {
  if (at(date, startMin) <= new Date()) return 0;

  var duration = 0;
  for (var i = 30; i <= 120 && startMin + i <= 1260; i += 30) {
    var taken = bookings.some(function(b) {
      return b.roomId === roomId &&
        overlaps(b, at(date, startMin), at(date, startMin + i));
    });
    if (taken) break;
    duration = i;
  }
  return duration;
}

function durationOptions(max) {
  var options = [];
  for (var i = 30; i <= max && i <= 120; i += 30) {
    options.push({ value: i, label: formatDuration(i) });
  }
  return options;
}

// Check selected room and time
function parseSlot(input) {
  var errors = [];
  var room = ROOMS.find(function(r) { return r.id === input.room; });
  var parts = (input.start || '').split(':');
  var time = Number(parts[0]) * 60 + Number(parts[1]);

  if (!room) errors.push('Invalid room.');
  if (!isDateBookable(input.date)) errors.push('Invalid date.');
  if (!/^\d{2}:\d{2}$/.test(input.start || '') ||
      time < 540 || time >= 1260 || time % 30 !== 0)
    errors.push('Invalid time.');
  if (!errors.length && at(input.date, time) <= new Date())
    errors.push('Time has passed.');

  return { errors: errors, room: room, date: input.date, startMin: time };
}

// Check booking form
function validateRoomRequest(input) {
  var slot = parseSlot(input);
  var errors = slot.errors;
  var duration = Number(input.duration);
  var people = Number(input.people);
  var name = String(input.groupName || '').trim();
  var email = String(input.email || '').trim();

  if (![30, 60, 90, 120].includes(duration) ||
      slot.startMin + duration > 1260) errors.push('Invalid duration.');
  if (slot.room && (!Number.isInteger(people) ||
      people < slot.room.minPeople || people > slot.room.maxPeople))
    errors.push('Invalid group size.');
  if (name.length < 2) errors.push('Enter a group name.');
  if (!email.includes('@')) errors.push('Enter a valid email.');

  if (errors.length) return { errors: errors, value: null };

  return { errors: [], value: {
    room: slot.room, date: slot.date, startMin: slot.startMin,
    duration: duration, people: people, groupName: name, email: email,
    startTime: at(slot.date, slot.startMin),
    endTime: at(slot.date, slot.startMin + duration)
  }};
}

module.exports = {
  ROOMS, FORFEIT_MINUTES, todayString, toDateString, at, addDays,
  formatDate, formatMinutes, minutesToValue, formatDuration,
  isDateBookable, getBookableDates, overlaps, buildGrid,
  maxDurationFor, durationOptions, parseSlot, validateRoomRequest
};