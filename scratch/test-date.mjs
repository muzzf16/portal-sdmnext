export const getEffectiveWorkingDays = (start, end, customHolidays = []) => {
  const startObj = new Date(start + 'T00:00:00');
  const endObj = new Date(end + 'T00:00:00');
  let count = 0;
  let cur = new Date(startObj.getTime());

  while (cur <= endObj) {
    const dayOfWeek = cur.getDay(); // 0=Min, 6=Sab
    const dateStr = cur.toISOString().slice(0, 10);
    console.log(dateStr); // Let's log it

    const isWeekend = dayOfWeek === 0 || dayOfWeek === 6;
    const isHoliday = customHolidays.includes(dateStr);

    if (!isWeekend && !isHoliday) {
      count++;
    }
    cur.setDate(cur.getDate() + 1);
  }

  return count > 0 ? count : 1;
};

console.log("Total: ", getEffectiveWorkingDays('2026-05-01', '2026-05-31', ['2026-05-01']));
