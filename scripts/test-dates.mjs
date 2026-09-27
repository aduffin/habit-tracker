import assert from 'node:assert/strict'
import {
  addLocalDays,
  formatLocalDate,
  getLocalMonthGrid,
  getLocalMonthRange,
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

const octoberGrid = getLocalMonthGrid('2026-10-01')
assert.equal(octoberGrid[0][4], '2026-10-01')
assert.equal(octoberGrid.length, 5)
assert.deepEqual(octoberGrid[0].slice(0, 4), [null, null, null, null])
assert.deepEqual(getLocalMonthRange('2026-10-01'), {
  startDate: '2026-10-01',
  endDate: '2026-10-31',
})

const septemberGrid = getLocalMonthGrid('2026-09-01')
assert.equal(septemberGrid.length, 5)
assert.deepEqual(septemberGrid[4].slice(-3), [null, null, null])
assert.equal(getLocalMonthGrid('2026-08-01').length, 6)

console.log('Local date and month grid checks passed.')