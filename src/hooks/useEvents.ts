import { useState, useEffect, useCallback } from 'react'
import { getEvents } from '../lib/events'
import type { ClubEvent } from '../types/events'

export const useEvents = () => {
  const [events, setEvents]       = useState<ClubEvent[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError]         = useState<string | null>(null)

  const fetchEvents = useCallback(async () => {
    try {
      setIsLoading(true)
      setError(null)
      const data = await getEvents()
      setEvents(data)
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (err: any) {
      setError(err.message ?? 'Failed to load events')
    } finally {
      setIsLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchEvents()
  }, [fetchEvents])

  const today          = new Date().toISOString().split('T')[0]
  const upcomingEvents = events.filter((e) => e.date >= today)
  const pastEvents     = events.filter((e) => e.date <  today)

  return {
    events,
    upcomingEvents,
    pastEvents,
    isLoading,
    error,
    refetch: fetchEvents,
  }
}