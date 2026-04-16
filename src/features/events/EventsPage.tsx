import { useState } from 'react'
import { useEvents } from '../../hooks/useEvents'
import { createEvent, updateEvent, deleteEvent } from '../../lib/events'
import type { ClubEvent, EventType } from '../../types/events'
import type { EventFormData } from '../../schemas/event.schema'
import PageHeader    from '../../components/common/PageHeader'
import LoadingSpinner from '../../components/common/LoadingSpinner'
import EmptyState    from '../../components/common/EmptyState'
import ConfirmDialog from '../../components/common/ConfirmDialog'
import EventForm     from './EventForm'
import { formatDate } from '../../utils/formatDate'

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

const EventsPage = () => {
  const { events, upcomingEvents, pastEvents, isLoading, error, refetch } = useEvents()

  const [formOpen, setFormOpen]             = useState(false)
  const [selectedEvent, setSelectedEvent]   = useState<ClubEvent | null>(null)
  const [isSubmitting, setIsSubmitting]     = useState(false)
  const [confirmOpen, setConfirmOpen]       = useState(false)
  const [eventToDelete, setEventToDelete]   = useState<ClubEvent | null>(null)
  const [tab, setTab]                       = useState<'upcoming' | 'past'>('upcoming')

  // ── Handlers ──────────────────────────────────

  const handleAdd = () => {
    setSelectedEvent(null)
    setFormOpen(true)
  }

  const handleEdit = (event: ClubEvent) => {
    setSelectedEvent(event)
    setFormOpen(true)
  }

  const handleClose = () => {
    setFormOpen(false)
    setSelectedEvent(null)
  }

  const handleSubmit = async (data: EventFormData) => {
    try {
      setIsSubmitting(true)
      if (selectedEvent) {
        await updateEvent(selectedEvent.id, data)
      } else {
        await createEvent(data)
      }
      await refetch()
      handleClose()
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (err: any) {
      console.error(err.message)
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleDeleteClick = (event: ClubEvent) => {
    setEventToDelete(event)
    setConfirmOpen(true)
  }

  const handleDeleteConfirm = async () => {
    if (!eventToDelete) return
    try {
      await deleteEvent(eventToDelete.id)
      await refetch()
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (err: any) {
      console.error(err.message)
    } finally {
      setConfirmOpen(false)
      setEventToDelete(null)
    }
  }

  // ── Render ────────────────────────────────────

  const displayEvents = tab === 'upcoming' ? upcomingEvents : pastEvents

  return (
    <div>
      <PageHeader
        title="Events"
        subtitle="Manage public club events and announcements"
        action={
          <button
            onClick={handleAdd}
            className="bg-sky-600 text-white text-sm px-4 py-2 rounded-lg hover:bg-sky-800 transition-colors"
          >
            + New Event
          </button>
        }
      />

      {/* Summary */}
      <div className="grid grid-cols-2 gap-3 mb-6">
        <div className="bg-white rounded-xl border border-stone-200 px-5 py-4">
          <p className="text-[11px] text-stone-400 uppercase tracking-widest mb-1">
            Upcoming
          </p>
          <p className="text-2xl font-medium text-[#1a1a18]">
            {upcomingEvents.length}
          </p>
        </div>
        <div className="bg-white rounded-xl border border-stone-200 px-5 py-4">
          <p className="text-[11px] text-stone-400 uppercase tracking-widest mb-1">
            Total Events
          </p>
          <p className="text-2xl font-medium text-[#1a1a18]">
            {events.length}
          </p>
        </div>
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
          </button>
        ))}
      </div>

      {/* Content */}
      {isLoading ? (
        <LoadingSpinner />
      ) : error ? (
        <EmptyState
          title="Failed to load events"
          description={error}
          action={
            <button onClick={refetch} className="text-sm text-stone-500 underline">
              Try again
            </button>
          }
        />
      ) : displayEvents.length === 0 ? (
        <EmptyState
          title={tab === 'upcoming' ? 'No upcoming events' : 'No past events'}
          description={
            tab === 'upcoming'
              ? 'Create an event to show it publicly on the club website'
              : 'Past events will appear here'
          }
          action={
            tab === 'upcoming' ? (
              <button
                onClick={handleAdd}
                className="bg-sky-600 text-white text-sm px-4 py-2 rounded-lg hover:bg-sky-800 transition-colors"
              >
                + New Event
              </button>
            ) : undefined
          }
        />
      ) : (
        <div className="bg-white rounded-xl border border-stone-200 overflow-hidden">
          <table className="w-full">
            <thead>
              <tr className="border-b border-stone-100">
                <th className="text-left text-[11px] font-medium text-stone-400 tracking-widest uppercase px-5 py-3">
                  Event
                </th>
                <th className="text-left text-[11px] font-medium text-stone-400 tracking-widest uppercase px-5 py-3 hidden sm:table-cell">
                  Type
                </th>
                <th className="text-left text-[11px] font-medium text-stone-400 tracking-widest uppercase px-5 py-3 hidden md:table-cell">
                  Location
                </th>
                <th className="text-left text-[11px] font-medium text-stone-400 tracking-widest uppercase px-5 py-3">
                  Date
                </th>
                <th className="text-right text-[11px] font-medium text-stone-400 tracking-widest uppercase px-5 py-3">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-stone-50">
              {displayEvents.map((event) => (
                <tr key={event.id} className="hover:bg-stone-50 transition-colors">

                  {/* Event title */}
                  <td className="px-5 py-3.5">
                    <p className="text-sm font-medium text-[#1a1a18]">
                      {event.title}
                    </p>
                    {event.description && (
                      <p className="text-xs text-stone-400 mt-0.5 line-clamp-1">
                        {event.description}
                      </p>
                    )}
                  </td>

                  {/* Type */}
                  <td className="px-5 py-3.5 hidden sm:table-cell">
                    <span className={`inline-block text-xs px-2.5 py-1 rounded-full ${
                      EVENT_TYPE_STYLES[event.type]
                    }`}>
                      {EVENT_TYPE_LABELS[event.type]}
                    </span>
                  </td>

                  {/* Location */}
                  <td className="px-5 py-3.5 hidden md:table-cell">
                    <span className="text-sm text-stone-400">
                      {event.location ?? '—'}
                    </span>
                  </td>

                  {/* Date */}
                  <td className="px-5 py-3.5">
                    <span className="text-xs text-stone-500">
                      {formatDate(event.date)}
                    </span>
                  </td>

                  {/* Actions */}
                  <td className="px-5 py-3.5 text-right">
                    <div className="flex items-center justify-end gap-2">
                      <button
                        onClick={() => handleEdit(event)}
                        className="text-xs text-stone-400 hover:text-[#1a1a18] px-3 py-1.5 rounded-lg hover:bg-stone-100 transition-colors"
                      >
                        Edit
                      </button>
                      <button
                        onClick={() => handleDeleteClick(event)}
                        className="text-xs text-red-300 hover:text-red-500 px-3 py-1.5 rounded-lg hover:bg-red-50 transition-colors"
                      >
                        Delete
                      </button>
                    </div>
                  </td>

                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Form */}
      <EventForm
        open={formOpen}
        event={selectedEvent}
        onSubmit={handleSubmit}
        onClose={handleClose}
        isSubmitting={isSubmitting}
      />

      {/* Delete Confirm */}
      <ConfirmDialog
        open={confirmOpen}
        title="Delete Event"
        description={`Are you sure you want to delete "${eventToDelete?.title}"? It will be removed from the public events page.`}
        confirmLabel="Delete"
        variant="danger"
        onConfirm={handleDeleteConfirm}
        onCancel={() => {
          setConfirmOpen(false)
          setEventToDelete(null)
        }}
      />
    </div>
  )
}

export default EventsPage