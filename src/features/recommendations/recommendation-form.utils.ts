import type { CompletePreferences, Preferences } from '../../types/preferences'

export const initialPreferences: Preferences = {
  mood: null,
  energy: null,
  availableTime: null,
  budget: null,
}

export function hasCompletePreferences(preferences: Preferences): preferences is CompletePreferences {
  return Object.values(preferences).every((value) => value !== null)
}
