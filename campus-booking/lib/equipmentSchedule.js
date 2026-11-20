// Equipment schedule helpers: dates, time slots, durations and the booking grid. Times are minutes after midnight.
var OPEN = 540, CLOSE = 1260, STEP = 60;
function pad(n) { return String(n).padStart(2, '0'); }
function toDateString(d) { return d.getFullYear() + '-' + pad(d.getMonth() + 1) + '-' + pad(d.getDate()); }
function todayString() { return toDateString(new Date()); }
function upcomingDates() {
  var out = [];
  for (var i = 0; i < 7; i++) { var d = new Date(); d.setDate(d.getDate() + i);
    out.push({ value: toDateString(d), label: d.toDateString() }); }
  return out;
}
function isBookableDate(date) { return upcomingDates().some(function (d) { return d.value === date; }); }
function slotStarts() { var s = []; for (var t = OPEN; t < CLOSE; t += STEP) s.push(t); return s; }
function busy(bookings, resourceId, from, to) {
  return bookings.some(function (b) { return b.resourceId === resourceId && b.start < to && b.end > from; });
}
function durationChoices(bookings, start, max) {
  var out = [];
  for (var m = STEP; m <= max && start + m <= CLOSE; m += STEP) {
    if (busy(bookings, bookings.length ? bookings[0].resourceId : null, start, start + m)) break;
    out.push({ minutes: m, label: m + ' min' });
  }
  return out;
}
function buildGrid(items, bookings, date, hrefFor) {
  return slotStarts().map(function (t) {
    return { time: t, cells: items.map(function (item) {
      var b = bookings.find(function (x) { return x.resourceId === item.id && x.start <= t && x.end > t; });
      return b ? { booked: true, title: b.title } : { booked: false, href: hrefFor(item, t) };
    }) };
  });
}
module.exports = { todayString, upcomingDates, isBookableDate, slotStarts, durationChoices, buildGrid };
