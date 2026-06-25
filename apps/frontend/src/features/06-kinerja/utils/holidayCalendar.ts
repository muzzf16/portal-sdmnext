export const getEffectiveWorkingDays = (start: string, end: string, customHolidays: string[] = []): number => {
  const startObj = new Date(start + 'T00:00:00');
  const endObj = new Date(end + 'T00:00:00');
  let count = 0;
  let cur = new Date(startObj.getTime());

  while (cur <= endObj) {
    const dayOfWeek = cur.getDay(); // 0=Min, 6=Sab
    const year = cur.getFullYear();
    const month = String(cur.getMonth() + 1).padStart(2, '0');
    const day = String(cur.getDate()).padStart(2, '0');
    const dateStr = `${year}-${month}-${day}`;

    const isWeekend = dayOfWeek === 0 || dayOfWeek === 6;
    const isHoliday = customHolidays.includes(dateStr);

    if (!isWeekend && !isHoliday) {
      count++;
    }
    cur.setDate(cur.getDate() + 1);
  }

  return count > 0 ? count : 1;
};

export const getHolidaysInRange = (start: string, end: string, customHolidays: string[] = []): string[] => {
  const startObj = new Date(start + 'T00:00:00');
  const endObj = new Date(end + 'T00:00:00');
  const result: string[] = [];
  let cur = new Date(startObj.getTime());

  while (cur <= endObj) {
    const year = cur.getFullYear();
    const month = String(cur.getMonth() + 1).padStart(2, '0');
    const day = String(cur.getDate()).padStart(2, '0');
    const dateStr = `${year}-${month}-${day}`;
    if (customHolidays.includes(dateStr)) {
      result.push(dateStr);
    }
    cur.setDate(cur.getDate() + 1);
  }

  return result;
};
