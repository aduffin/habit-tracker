export function formatLocalDate(date) {
  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const day = String(date.getDate()).padStart(2, '0')
  return `${year}-${month}-${day}`
}

export function parseLocalDate(dateString) {
  const [year, month, day] = dateString.split('-').map(Number)
  return new Date(year, month - 1, day)
}

export function addLocalDays(dateString, numberOfDays) {
  const date = parseLocalDate(dateString)
  date.setDate(date.getDate() + numberOfDays)
  return formatLocalDate(date)
}

export function getLocalWeekRange(dateString) {
  const weekStart = parseLocalDate(dateString)
  weekStart.setDate(weekStart.getDate() - weekStart.getDay())

  const weekEnd = new Date(weekStart)
  weekEnd.setDate(weekEnd.getDate() + 6)

  return {
    startDate: formatLocalDate(weekStart),
    endDate: formatLocalDate(weekEnd),
  }
}

export function addLocalMonths(dateString, numberOfMonths) {
  const date = parseLocalDate(dateString)
  date.setDate(1)
  date.setMonth(date.getMonth() + numberOfMonths)
  return formatLocalDate(date)
}

export function getLocalMonthRange(dateString) {
  const monthStart = parseLocalDate(dateString)
  monthStart.setDate(1)
  const monthEnd = new Date(monthStart.getFullYear(), monthStart.getMonth() + 1, 0)

  return {
    startDate: formatLocalDate(monthStart),
    endDate: formatLocalDate(monthEnd),
  }
}

export function getLocalMonthGrid(dateString) {
  const monthStart = parseLocalDate(dateString)
  monthStart.setDate(1)
  const year = monthStart.getFullYear()
  const month = monthStart.getMonth()
  const firstWeekday = monthStart.getDay()
  const daysInMonth = new Date(year, month + 1, 0).getDate()
  const totalCells = Math.ceil((firstWeekday + daysInMonth) / 7) * 7

  return Array.from({ length: totalCells / 7 }, (_, weekIndex) => (
    Array.from({ length: 7 }, (_, weekdayIndex) => {
      const day = weekIndex * 7 + weekdayIndex - firstWeekday + 1
      if (day < 1 || day > daysInMonth) return null
      return formatLocalDate(new Date(year, month, day))
    })
  ))
}