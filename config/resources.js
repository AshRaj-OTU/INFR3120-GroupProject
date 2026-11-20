// Build Cisco Pod 1 to Cisco Pod 16. Pod 6 keeps its different setup.
var pods = [];
for (var i = 1; i <= 16; i++) {
  pods.push({
    id: 'pod-' + i,
    name: 'Cisco Pod ' + i,
    details: i === 6 ? '3 routers, 1 switch' : '2 routers, 2 switches, console cables'
  });
}

module.exports = {
  daysAhead: 8, roomMaxMinutes: 120, equipmentMaxMinutes: 180,
  labs: [
    { id: 'net-lab', name: 'Networking Lab', items: pods },
    { id: 'ce-lab', name: 'Computer Engineering Lab', items: [
      { id: 'sci-3100u', name: 'SCI 3100U', details: '' },
      { id: 'sci-3200u', name: 'SCI 3200U', details: '' },
      { id: 'sci-3300u', name: 'SCI 3300U', details: '' },
      { id: 'sci-3400u', name: 'SCI 3400U', details: '' },
      { id: 'shaw-0100u', name: 'SHAW 0100U', details: '' },
      { id: 'shaw-0200u', name: 'SHAW 0200U', details: '' },
      { id: 'shaw-0300u', name: 'SHAW 0300U', details: '' },
      { id: 'shaw-0400u', name: 'SHAW 0400U', details: '' } ] }
  ]
};