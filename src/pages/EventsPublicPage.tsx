import { useState, useEffect } from 'react'
import { getUpcomingEvents, getPastEvents } from '../lib/events'
import type { ClubEvent, EventType } from '../types/events'
import { formatDate } from '../utils/formatDate'
import LoadingSpinner from '../components/common/LoadingSpinner'
import EmptyState from '../components/common/EmptyState'

const EVENT_TYPE_STYLES: Record<EventType, string> = {
  meetup:       'bg-stone-100 text-stone-600',
  charity_ride: 'bg-blue-50 text-blue-600',
  announcement: 'bg-amber-50 text-amber-600',
  other:        'bg-stone-100 text-stone-400',
}

const EVENT_TYPE_LABELS: Record<EventType, string> = {
  meetup:       'Meetup',
  charity_ride: 'Charity Ride',
  announcement: 'Announcement',
  other:        'Other',
}

const EventCard = ({ event }: { event: ClubEvent }) => (
  <div className="bg-white rounded-xl border border-stone-200 p-5 hover:border-stone-300 transition-colors">
    <div className="flex items-start justify-between gap-4 mb-3">
      <div className="flex-1">
        <h3 className="text-sm font-medium text-[#1a1a18]">
          {event.title}
        </h3>
        {event.description && (
          <p className="text-xs text-stone-400 mt-1 line-clamp-2">
            {event.description}
          </p>
        )}
      </div>
      <span className={`shrink-0 inline-block text-xs px-2.5 py-1 rounded-full ${
        EVENT_TYPE_STYLES[event.type]
      }`}>
        {EVENT_TYPE_LABELS[event.type]}
      </span>
    </div>

    <div className="flex flex-col gap-1.5 pt-3 border-t border-stone-50">
      <div className="flex items-center gap-2">
        <span className="text-stone-300 text-xs">📅</span>
        <span className="text-xs text-stone-500">{formatDate(event.date)}</span>
      </div>
      {event.location && (
        <div className="flex items-center gap-2">
          <span className="text-stone-300 text-xs">📍</span>
          <span className="text-xs text-stone-500">{event.location}</span>
        </div>
      )}
    </div>
  </div>
)

const EventsPublicPage = () => {
  const [upcoming, setUpcoming]   = useState<ClubEvent[]>([])
  const [past, setPast]           = useState<ClubEvent[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [tab, setTab]             = useState<'upcoming' | 'past'>('upcoming')

  useEffect(() => {
    const fetch = async () => {
      try {
        setIsLoading(true)
        const [upcomingData, pastData] = await Promise.all([
          getUpcomingEvents(),
          getPastEvents(),
        ])
        setUpcoming(upcomingData)
        setPast(pastData)
      } catch (err) {
        console.error(err)
      } finally {
        setIsLoading(false)
      }
    }

    fetch()
  }, [])

  const displayEvents = tab === 'upcoming' ? upcoming : past

  return (
    <div className="max-w-3xl mx-auto px-4 py-12">

      {/* Header */}
      <div className="mb-8">
        <h1 className="text-2xl font-medium text-[#1a1a18]">Club Events</h1>
        <p className="text-sm text-stone-400 mt-1">
          Upcoming rides, meetups, and announcements from MNDA SOX MC
        </p>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 bg-stone-100 rounded-lg p-1 w-fit mb-6">
        {(['upcoming', 'past'] as const).map((t) => (
          <button
            key={t}
            onClick={() => setTab(t)}
            className={`px-5 py-2 rounded-md text-sm font-medium transition-colors capitalize ${
              tab === t
                ? 'bg-white text-[#1a1a18] shadow-sm'
                : 'text-stone-400 hover:text-stone-600'
            }`}
          >
            {t}
            {t === 'upcoming' && upcoming.length > 0 && (
              <span className="ml-2 text-xs bg-[#1a1a18] text-white px-1.5 py-0.5 rounded-full">
                {upcoming.length}
              </span>
            )}
          </button>
        ))}
      </div>

      {/* Content */}
      {isLoading ? (
        <LoadingSpinner />
      ) : displayEvents.length === 0 ? (
        <EmptyState
          title={
            tab === 'upcoming'
              ? 'No upcoming events'
              : 'No past events'
          }
          description={
            tab === 'upcoming'
              ? 'Check back soon for upcoming rides and announcements'
              : 'Past events will appear here'
          }
        />
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {displayEvents.map((event) => (
            <EventCard key={event.id} event={event} />
          ))}
        </div>
      )}

    </div>
  )
}

export default EventsPublicPage