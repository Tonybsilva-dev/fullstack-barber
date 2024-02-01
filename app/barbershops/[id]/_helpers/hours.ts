import { addMinutes, format, setHours, setMinutes } from "date-fns";


export function GenerateDayTimeList(date: Date): string[] {
  const startTime = setMinutes(setHours(date,9), 0) // set start time to 09:00
  const endTime = setMinutes(setHours(date, 21), 0) // set end time to 21:00
  const interval = 45 // interval in minutes
  const timeList: string[] = []

  let currentTime = startTime

  while (currentTime <= endTime) {
    timeList.push(format(currentTime, "HH:mm"));
    currentTime = addMinutes(currentTime, interval)
  }

  return timeList
}