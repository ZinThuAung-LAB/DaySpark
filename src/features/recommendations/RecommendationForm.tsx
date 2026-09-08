import { useState, type FormEvent } from 'react'
import { SelectionGroup } from '../../components/SelectionGroup'
import { availableTimeOptions, budgetOptions, energyOptions, moodOptions } from '../../data/preference-options'
import type { AvailableTime, Budget, CompletePreferences, EnergyLevel, Mood, Preferences } from '../../types/preferences'
import { hasCompletePreferences, initialPreferences } from './recommendation-form.utils'

type RecommendationFormProps = {
  onSuggest: (preferences: CompletePreferences) => void
}

export function RecommendationForm({ onSuggest }: RecommendationFormProps) {
  const [preferences, setPreferences] = useState<Preferences>(initialPreferences)
  const canSuggestActivities = hasCompletePreferences(preferences)

  function updatePreference<Key extends keyof Preferences>(key: Key, value: Preferences[Key]) {
    setPreferences((currentPreferences) => ({ ...currentPreferences, [key]: value }))
  }

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()

    if (hasCompletePreferences(preferences)) {
      onSuggest(preferences)
    }
  }

  return (
    <form className="mt-10 space-y-8" onSubmit={handleSubmit}>
      <SelectionGroup<Mood>
        description="Choose the feeling that best matches your moment."
        legend="How are you feeling?"
        name="mood"
        onChange={(value) => updatePreference('mood', value)}
        options={moodOptions}
        value={preferences.mood}
      />
      <SelectionGroup<EnergyLevel>
        description="Pick the amount of energy you want to use."
        legend="What is your energy level?"
        name="energy"
        onChange={(value) => updatePreference('energy', value)}
        options={energyOptions}
        value={preferences.energy}
      />
      <SelectionGroup<AvailableTime>
        description="Tell us how long you have available."
        legend="How much time do you have?"
        name="available-time"
        onChange={(value) => updatePreference('availableTime', value)}
        options={availableTimeOptions}
        value={preferences.availableTime}
      />
      <SelectionGroup<Budget>
        description="Choose how much you would like to spend."
        legend="What is your budget?"
        name="budget"
        onChange={(value) => updatePreference('budget', value)}
        options={budgetOptions}
        value={preferences.budget}
      />
      <button
        className="w-full rounded-xl bg-amber-500 px-5 py-3 font-semibold text-slate-950 shadow-sm transition hover:bg-amber-400 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-amber-600 disabled:cursor-not-allowed disabled:bg-slate-200 disabled:text-slate-500"
        disabled={!canSuggestActivities}
        type="submit"
      >
        Suggest Activities
      </button>
    </form>
  )
}
