#!/usr/bin/env node
import { readFile } from 'node:fs/promises'

const base = (process.env.TREK_BASE_URL || 'http://localhost:3000').replace(/\/$/, '')
const email = process.env.TREK_EMAIL
const password = process.env.TREK_PASSWORD
if (!email || !password) {
  throw new Error('Set TREK_EMAIL and TREK_PASSWORD before running this importer.')
}

const fixtureUrl = new URL('./fixtures/macau-zhuhai-2026.json', import.meta.url)
const fixture = JSON.parse(await readFile(fixtureUrl, 'utf8'))

async function raw(path, options = {}) {
  const response = await fetch(`${base}/api${path}`, {
    ...options,
    headers: { 'content-type': 'application/json', authorization: token ? `Bearer ${token}` : '', ...options.headers },
  })
  const body = await response.json().catch(() => ({}))
  if (!response.ok) throw new Error(`${options.method || 'GET'} ${path}: ${body.error || response.statusText}`)
  return body
}

let token = ''
const login = await raw('/auth/login', { method: 'POST', body: JSON.stringify({ email, password }) })
if (login.mfa_required) throw new Error('This account requires MFA; use a temporary fixture account without MFA.')
token = login.token

await raw('/settings/bulk', { method: 'POST', body: JSON.stringify({ settings: {
  personal_mode: true,
  language: 'zh-TW',
  appearance: { schemeId: 'journal', transparency: false },
} }) })

const tripRows = (await raw('/trips')).trips || []
let trip = tripRows.find((row) => row.title === fixture.trip.title && row.start_date === fixture.trip.start_date)
if (!trip) trip = (await raw('/trips', { method: 'POST', body: JSON.stringify(fixture.trip) })).trip

const dayResult = await raw(`/trips/${trip.id}/days`)
const days = dayResult.days || dayResult
const placeResult = await raw(`/trips/${trip.id}/places`)
const existingPlaces = placeResult.places || []
const placesByName = new Map(existingPlaces.map((place) => [place.name, place]))

for (const spec of fixture.places) {
  let place = placesByName.get(spec.name)
  if (!place) {
    place = (await raw(`/trips/${trip.id}/places`, { method: 'POST', body: JSON.stringify({
      name: spec.name, address: spec.address, lat: spec.lat, lng: spec.lng, notes: spec.notes || null,
    }) })).place
    placesByName.set(place.name, place)
  }
  const day = days[spec.day - 1]
  if (day) {
    const assignments = (await raw(`/trips/${trip.id}/days/${day.id}/assignments`)).assignments || []
    if (!assignments.some((assignment) => assignment.place_id === place.id)) {
      await raw(`/trips/${trip.id}/days/${day.id}/assignments`, { method: 'POST', body: JSON.stringify({ place_id: place.id, notes: spec.notes || null }) })
    }
  }
}

const reservations = (await raw(`/trips/${trip.id}/reservations`)).reservations || []
for (const spec of fixture.reservations || []) {
  if (reservations.some((row) => row.title === spec.title && row.reservation_time === spec.reservation_time)) continue
  const place = placesByName.get(spec.place_name)
  await raw(`/trips/${trip.id}/reservations`, { method: 'POST', body: JSON.stringify({
    title: spec.title,
    type: spec.type,
    reservation_time: spec.reservation_time,
    location: spec.location,
    notes: spec.notes,
    day_id: days[0]?.id,
    place_id: place?.id,
  }) })
}

const accommodations = (await raw(`/trips/${trip.id}/accommodations`)).accommodations || []
for (const spec of fixture.places.filter((place) => place.accommodation)) {
  const place = placesByName.get(spec.name)
  if (!place || accommodations.some((row) => row.place_id === place.id)) continue
  const stay = spec.accommodation
  await raw(`/trips/${trip.id}/accommodations`, { method: 'POST', body: JSON.stringify({
    place_id: place.id, start_day_id: days[stay.start_day - 1].id, end_day_id: days[stay.end_day - 1].id,
    check_in: stay.check_in, check_out: stay.check_out, notes: spec.notes || null,
  }) })
}

const todos = (await raw(`/trips/${trip.id}/todo`)).items || []
for (const item of fixture.todos) if (!todos.some((row) => row.name === item.name)) {
  await raw(`/trips/${trip.id}/todo`, { method: 'POST', body: JSON.stringify(item) })
}
const packing = (await raw(`/trips/${trip.id}/packing`)).items || []
for (const item of fixture.packing) if (!packing.some((row) => row.name === item.name)) {
  await raw(`/trips/${trip.id}/packing`, { method: 'POST', body: JSON.stringify(item) })
}
const budget = (await raw(`/trips/${trip.id}/budget`)).items || []
for (const item of fixture.budget) if (!budget.some((row) => row.name === item.name)) {
  await raw(`/trips/${trip.id}/budget`, { method: 'POST', body: JSON.stringify(item) })
}

try {
  const collectionResult = await raw('/addons/collections')
  const collections = collectionResult.collections || []
  for (const listSpec of fixture.saved_lists) {
    let list = collections.find((row) => row.name === listSpec.name)
    if (!list) list = await raw('/addons/collections', { method: 'POST', body: JSON.stringify({ name: listSpec.name }) })
    const detail = await raw(`/addons/collections/${list.id}`)
    const names = new Set((detail.places || []).map((place) => place.name))
    for (const place of listSpec.places) if (!names.has(place.name)) {
      await raw('/addons/collections/places', { method: 'POST', body: JSON.stringify({ collection_id: list.id, status: 'want', ...place }) })
    }
  }
} catch (error) {
  console.warn(`Saved lists were skipped: ${error.message}`)
}

console.log(`Fixture ready: ${fixture.trip.title} (trip ${trip.id})`)
