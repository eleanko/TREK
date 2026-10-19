import type { Settings } from '../types'

/**
 * Personal mode is a presentation preference. It keeps every route and API
 * available while reducing the primary navigation to the planner and saved
 * places used by a single traveller.
 */
export function isPersonalMode(settings: Pick<Settings, 'personal_mode'>): boolean {
  return settings.personal_mode === true
}

export const PERSONAL_GLOBAL_ADDONS = new Set(['collections'])

