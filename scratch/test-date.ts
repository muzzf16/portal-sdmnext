import { getEffectiveWorkingDays } from "../apps/frontend/src/features/06-kinerja/utils/holidayCalendar";
console.log(getEffectiveWorkingDays('2026-05-01', '2026-05-31', ['2026-05-01', '2026-05-14', '2026-05-29']));
