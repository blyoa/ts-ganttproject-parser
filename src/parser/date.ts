import type { Calendar } from "./elem_types.ts";
import { CalendarEventType } from "./elem_types.ts";

export function isHoliday(date: Date, calendar: Calendar): boolean {
  return calendar.events?.some((event) =>
    (event.year === undefined || event.year === date.getFullYear()) &&
    event.month === date.getMonth() + 1 &&
    event.day === date.getDate() &&
    event.type === CalendarEventType.Holiday
  ) ?? false;
}

const dayOfWeeks = [
  "sunday",
  "monday",
  "tuesday",
  "wednesday",
  "thursday",
  "friday",
  "saturday",
] as const;
export function isWeekend(date: Date, calendar: Calendar): boolean {
  const dayOfWeek = date.getDay();

  const nameOfDayOfWeek = dayOfWeeks[dayOfWeek];
  return calendar.dayTypeConfig.defaultWeek.weekendDays[nameOfDayOfWeek];
}

export function addWorkdays(
  startDate: Date,
  days: number,
  calendar: Calendar,
): Date {
  const date = new Date(startDate);
  let workdays = 0;
  while (workdays < days) {
    date.setDate(date.getDate() + 1);
    if (
      (calendar.dayTypeConfig.isTaskRunnableOnWeekends ||
        !isWeekend(date, calendar)) &&
      !isHoliday(date, calendar)
    ) {
      workdays++;
    }
  }
  return date;
}
