import type { AvailableTime, Budget, EnergyLevel, Mood, SelectionOption } from '../types/preferences'

export const moodOptions: readonly SelectionOption<Mood>[] = [
  { value: 'bored', label: 'Bored' },
  { value: 'relaxed', label: 'Relaxed' },
  { value: 'productive', label: 'Productive' },
  { value: 'social', label: 'Social' },
  { value: 'adventurous', label: 'Adventurous' },
]

export const energyOptions: readonly SelectionOption<EnergyLevel>[] = [
  { value: 'low', label: 'Low' },
  { value: 'medium', label: 'Medium' },
  { value: 'high', label: 'High' },
]

export const availableTimeOptions: readonly SelectionOption<AvailableTime>[] = [
  { value: '10-minutes', label: '10 minutes' },
  { value: '30-minutes', label: '30 minutes' },
  { value: '1-hour', label: '1 hour' },
  { value: '2-plus-hours', label: '2+ hours' },
]

export const budgetOptions: readonly SelectionOption<Budget>[] = [
  { value: 'free', label: 'Free' },
  { value: 'low', label: 'Low' },
  { value: 'flexible', label: 'Flexible' },
]
