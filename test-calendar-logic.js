const contentData = [
  { id: '1', status: '✅ Ready', publishedPlan: '2026-08-11' },
  { id: '2', status: '✅ Ready', publishedPlan: '2026-08-11T00:00:00.000Z' },
  { id: '3', status: '✅ Ready', publishedDate: '11/08/2026' },
  { id: '4', status: '✅ Ready', publishedPlan: '2026-08-15' },
];

function testLogic(data, year, month, statusFilter = new Set(['ALL'])) {
  return data.filter(c => {
    const targetDateStr = c.publishedPlan || c.publishedDate || c.plannedDate || c.date || '';
    if (!targetDateStr) return false;

    // Test 1: Date Object Parse
    const d = new Date(targetDateStr);
    if (isNaN(d.getTime())) return false;

    const matchesMonth = d.getFullYear() === year && d.getMonth() === month;
    
    let matchesStatus = false;
    if (statusFilter && typeof statusFilter.has === 'function') {
      matchesStatus = statusFilter.has('ALL') || statusFilter.size === 0 || statusFilter.has(c.status);
    } else {
      matchesStatus = statusFilter === 'ALL' || c.status === statusFilter;
    }

    return matchesMonth && matchesStatus;
  }).map(c => {
    const val = c.publishedPlan || c.publishedDate || c.plannedDate || c.date || '';
    const d = new Date(val);
    let finalActiveDate = val;
    if (!isNaN(d.getTime())) {
      const yStr = d.getFullYear();
      const mStr = String(d.getMonth() + 1).padStart(2, '0');
      const dayStr = String(d.getDate()).padStart(2, '0');
      finalActiveDate = `${yStr}-${mStr}-${dayStr}`;
    }
    return { ...c, activeDate: finalActiveDate };
  });
}

const result1 = testLogic(contentData, 2026, 7); // Aug is month 7
console.log("Result (new Date logic):", JSON.stringify(result1, null, 2));

function testLogic2(data, year, month, statusFilter = new Set(['ALL'])) {
  return data.filter(c => {
    const targetDateStr = c.publishedPlan || c.publishedDate || c.plannedDate || c.date || '';
    if (!targetDateStr) return false;

    const parts = targetDateStr.split('-');
    if (parts.length < 3) return false;

    const y = parseInt(parts[0], 10);
    const m = parseInt(parts[1], 10) - 1;

    const matchesMonth = y === year && m === month;
    
    let matchesStatus = false;
    if (statusFilter && typeof statusFilter.has === 'function') {
      matchesStatus = statusFilter.has('ALL') || statusFilter.size === 0 || statusFilter.has(c.status);
    } else {
      matchesStatus = statusFilter === 'ALL' || c.status === statusFilter;
    }

    return matchesMonth && matchesStatus;
  }).map(c => {
    const val = c.publishedPlan || c.publishedDate || c.plannedDate || c.date || '';
    const dateOnly = val.split('T')[0].split(' ')[0]; 
    let finalActiveDate = val;
    const p = dateOnly.split('-');
    if (p.length >= 3) {
      const dStr = parseInt(p[2], 10).toString().padStart(2, '0');
      const mStr = parseInt(p[1], 10).toString().padStart(2, '0');
      finalActiveDate = `${p[0]}-${mStr}-${dStr}`;
    }
    return { ...c, activeDate: finalActiveDate };
  });
}

const result2 = testLogic2(contentData, 2026, 7); // Aug is month 7
console.log("Result (String parse logic):", JSON.stringify(result2, null, 2));
