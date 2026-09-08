export type Mood = 'bored' | 'relaxed' | 'productive' | 'social' | 'adventurous'

export type EnergyLevel = 'low' | 'medium' | 'high'

export type AvailableTime = '10-minutes' | '30-minutes' | '1-hour' | '2-plus-hours'

export type Budget = 'free' | 'low' | 'flexible'

export type Preferences = {
  mood: Mood | null
  energy: EnergyLevel | null
  availableTime: AvailableTime | null
  budget: Budget | null
}

export type CompletePreferences = {
  mood: Mood
  energy: EnergyLevel
  availableTime: AvailableTime
  budget: Budget
}

export type SelectionOption<T extends string> = {
  label: string
  value: T
}
