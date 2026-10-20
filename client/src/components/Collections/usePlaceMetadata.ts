import { useCallback, useState } from 'react'
import type { CollectionPlace, CollectionPlaceUpdateRequest } from '@trek/shared'

type Metadata = Pick<CollectionPlace, 'area' | 'favorite' | 'priority' | 'opening_hours' | 'recommended_dishes'>

const seed = (value: Metadata | null) => ({
  area: value?.area ?? '',
  favorite: value?.favorite ?? false,
  priority: value?.priority ?? 0,
  opening_hours: value?.opening_hours ?? '',
  recommended_dishes: value?.recommended_dishes ?? '',
})

export default function usePlaceMetadata(place: Metadata | null) {
  const [value, setValue] = useState(() => seed(place))
  const reset = useCallback((next: Metadata | null) => setValue(seed(next)), [])
  const patch: CollectionPlaceUpdateRequest = {
    area: value.area.trim() || null,
    favorite: value.favorite,
    priority: value.priority,
    opening_hours: value.opening_hours.trim() || null,
    recommended_dishes: value.recommended_dishes.trim() || null,
  }
  return { value, setValue, reset, patch }
}

