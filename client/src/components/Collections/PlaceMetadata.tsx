import type usePlaceMetadata from './usePlaceMetadata'
import type { CollectionPlace } from '@trek/shared'
import type { TranslationFn } from '../../types'

type Metadata = Pick<CollectionPlace, 'area' | 'favorite' | 'priority' | 'opening_hours' | 'recommended_dishes'>


interface Props {
  value: Metadata
  onChange?: (value: ReturnType<typeof usePlaceMetadata>['value']) => void
  t: TranslationFn
  mobile?: boolean
}

/** Shared fields inside the existing desktop detail and mobile sheet. */
export default function PlaceMetadata({ value, onChange, t, mobile = false }: Props) {
  const input = mobile
    ? 'w-full min-w-0 rounded-[12px] border border-[color:var(--m-rowbr)] bg-[color:var(--m-sheet)] p-3 text-m-ink'
    : 'col-detail-input w-full min-w-0'
  const label = mobile ? 'text-xs font-semibold text-m-muted' : 'col-detail-label'
  const current = {
    area: value.area ?? '', favorite: value.favorite ?? false, priority: value.priority ?? 0,
    opening_hours: value.opening_hours ?? '', recommended_dishes: value.recommended_dishes ?? '',
  }
  const priorities = ['none', 'low', 'medium', 'high']
  const fields = ['area', 'opening_hours', 'recommended_dishes'] as const
  return (
    <div className="my-3 grid min-w-0 gap-3">
      {onChange ? (
        <>
          <label className="flex items-center gap-2 text-sm">
            <input type="checkbox" checked={current.favorite} onChange={e => onChange({ ...current, favorite: e.target.checked })} />
            {t('collections.metadata.favorite')}
          </label>
          <label className="grid min-w-0 gap-1">
            <span className={label}>{t('collections.metadata.priority')}</span>
            <select className={input} value={current.priority} onChange={e => onChange({ ...current, priority: Number(e.target.value) })}>
              {priorities.map((key, index) => <option key={key} value={index}>{t(`collections.metadata.priority.${key}`)}</option>)}
            </select>
          </label>
          {fields.map(key => (
            <label key={key} className="grid min-w-0 gap-1">
              <span className={label}>{t(`collections.metadata.${key}`)}</span>
              {key === 'area'
                ? <input className={input} value={current[key]} onChange={e => onChange({ ...current, [key]: e.target.value })} />
                : <textarea className={`${input} resize-y`} rows={2} value={current[key]} onChange={e => onChange({ ...current, [key]: e.target.value })} />}
            </label>
          ))}
        </>
      ) : (
        <dl className="grid min-w-0 gap-2 text-sm">
          <div><dt className={label}>{t('collections.metadata.favorite')}</dt><dd>{t(current.favorite ? 'common.yes' : 'common.no')}</dd></div>
          <div><dt className={label}>{t('collections.metadata.priority')}</dt><dd>{t(`collections.metadata.priority.${priorities[current.priority]}`)}</dd></div>
          {fields.map(key => current[key] && (
            <div key={key}><dt className={label}>{t(`collections.metadata.${key}`)}</dt><dd className="whitespace-pre-wrap break-words">{current[key]}</dd></div>
          ))}
        </dl>
      )}
    </div>
  )
}
