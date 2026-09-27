import assert from 'node:assert/strict'
import {
  addLocalDays,
  formatLocalDate,
  getLocalWeekRange,
} from '../src/utils/localDates.js'

process.env.TZ = 'America/Los_Angeles'

const lateEvening = new Date(2026, 8, 27, 20, 30)
assert.equal(formatLocalDate(lateEvening), '2026-09-27')
assert.equal(lateEvening.toISOString().slice(0, 10), '2026-09-28')

assert.deepEqual(getLocalWeekRange('2026-09-30'), {
  startDate: '2026-09-27',
  endDate: '2026-10-03',
})
assert.equal(addLocalDays('2026-09-27', 1), '2026-09-28')

console.log('Local date checks passed.')