import { activities } from './activities'

describe('activities', () => {
  it('contains a baseline catalog of unique activity IDs', () => {
    const ids = activities.map((activity) => activity.id)

    expect(activities).toHaveLength(41)
    expect(new Set(ids)).toHaveLength(activities.length)
  })
})
