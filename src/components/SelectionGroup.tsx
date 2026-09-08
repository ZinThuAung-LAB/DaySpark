import type { SelectionOption } from '../types/preferences'

type SelectionGroupProps<T extends string> = {
  description: string
  legend: string
  name: string
  onChange: (value: T) => void
  options: readonly SelectionOption<T>[]
  value: T | null
}

export function SelectionGroup<T extends string>({
  description,
  legend,
  name,
  onChange,
  options,
  value,
}: SelectionGroupProps<T>) {
  const descriptionId = `${name}-description`

  return (
    <fieldset className="border-0 p-0" aria-describedby={descriptionId}>
      <legend className="text-lg font-semibold text-slate-900">{legend}</legend>
      <p id={descriptionId} className="mt-1 text-sm text-slate-600">
        {description}
      </p>
      <div className="mt-3 grid grid-cols-2 gap-3 sm:grid-cols-3">
        {options.map((option) => {
          const inputId = `${name}-${option.value}`

          return (
            <label
              className={`cursor-pointer rounded-xl border bg-white px-4 py-3 text-center text-sm font-medium shadow-sm transition hover:border-amber-400 hover:bg-amber-50 focus-within:ring-2 focus-within:ring-amber-500 focus-within:ring-offset-2 ${
                value === option.value
                  ? 'border-amber-500 bg-amber-100 text-amber-950'
                  : 'border-slate-200 text-slate-700'
              }`}
              htmlFor={inputId}
              key={option.value}
            >
              <input
                checked={value === option.value}
                className="peer sr-only"
                id={inputId}
                name={name}
                onChange={() => onChange(option.value)}
                type="radio"
                value={option.value}
              />
              {option.label}
            </label>
          )
        })}
      </div>
    </fieldset>
  )
}
