import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { getUpcomingEvents } from '../lib/events'
import type { ClubEvent, EventType } from '../types/events'
import { formatDate } from '../utils/formatDate'
import { formatCurrency } from '../utils/formatCurrency'
import { supabase } from '../supabase/client'

const EVENT_TYPE_LABELS: Record<EventType, string> = {
  meetup:       'Meetup',
  charity_ride: 'Charity Ride',
  announcement: 'Announcement',
  other:        'Other',
}

const LandingPage = () => {
  const [events, setEvents]           = useState<ClubEvent[]>([])
  const [netBalance, setNetBalance]   = useState<number>(0)
  const [memberCount, setMemberCount] = useState<number>(0)
  const [isLoading, setIsLoading]     = useState(true)

  useEffect(() => {
    const fetch = async () => {
      try {
        setIsLoading(true)
        const [eventsData, fundData, membersData] = await Promise.all([
          getUpcomingEvents(),
          supabase.from('fund_summary').select('*').single(),
          supabase
            .from('members')
            .select('id', { count: 'exact' })
            .is('deleted_at', null)
            .eq('is_active', true),
        ])

        setEvents(eventsData.slice(0, 3))
        setNetBalance(fundData.data?.net_balance ?? 0)
        setMemberCount(membersData.count ?? 0)
      } catch (err) {
        console.error(err)
      } finally {
        setIsLoading(false)
      }
    }

    fetch()
  }, [])

  return (
    <div>

      {/* Hero */}
      <section className="bg-[#1a1a18] text-white py-20 px-6">
        <div className="max-w-3xl mx-auto text-center">
          <p className="text-[11px] text-stone-500 tracking-widest uppercase mb-4">
            Est. Libungan, Cotabato
          </p>
          <h1 className="font-serif text-5xl md:text-6xl mb-4 leading-tight">
            MNDA SOX
          </h1>
          <p className="text-stone-400 text-base max-w-md mx-auto mb-8">
            A brotherhood of riders united by passion, respect, and the open road.
          </p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Link
              to="/events"
              className="bg-white text-[#1a1a18] text-sm font-medium px-6 py-2.5 rounded-lg hover:bg-stone-100 transition-colors"
            >
              View Events
            </Link>
            <Link
              to="/transparency"
              className="border border-stone-700 text-stone-300 text-sm px-6 py-2.5 rounded-lg hover:border-stone-500 hover:text-white transition-colors"
            >
              Fund Transparency
            </Link>
          </div>
        </div>
      </section>

      {/* Stats */}
      <section className="border-b border-stone-200 bg-white">
        <div className="max-w-3xl mx-auto px-6 py-8 grid grid-cols-2 sm:grid-cols-3 gap-6 text-center">
          <div>
            <p className="text-2xl font-medium text-[#1a1a18]">
              {isLoading ? '—' : memberCount}
            </p>
            <p className="text-xs text-stone-400 uppercase tracking-widest mt-1">
              Active Members
            </p>
          </div>
          <div>
            <p className="text-2xl font-medium text-[#1a1a18]">
              {isLoading ? '—' : formatCurrency(netBalance)}
            </p>
            <p className="text-xs text-stone-400 uppercase tracking-widest mt-1">
              Club Fund
            </p>
          </div>
          <div className="col-span-2 sm:col-span-1">
            <p className="text-2xl font-medium text-[#1a1a18]">
              {isLoading ? '—' : events.length}
            </p>
            <p className="text-xs text-stone-400 uppercase tracking-widest mt-1">
              Upcoming Events
            </p>
          </div>
        </div>
      </section>

      {/* About */}
      <section className="max-w-3xl mx-auto px-6 py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-10 items-center">
          <div>
            <p className="text-[11px] text-stone-400 tracking-widest uppercase mb-3">
              About Us
            </p>
            <h2 className="text-2xl font-medium text-[#1a1a18] mb-4">
              Ride with honor
            </h2>
            <p className="text-sm text-stone-500 leading-relaxed mb-4">
              MNDA SOX Motorcycle Club is a community of passionate riders
              based in Libungan, Cotabato. We ride together, support each
              other, and give back to our community through charity events
              and local outreach.
            </p>
            <p className="text-sm text-stone-500 leading-relaxed">
              Our club is built on trust and transparency — every peso
              contributed by our members is tracked and reported openly.
            </p>
          </div>
          <div className="bg-stone-100 rounded-2xl h-48 md:h-64 flex items-center justify-center">
            <p className="text-stone-400 text-sm">Club photo coming soon</p>
          </div>
        </div>
      </section>

      {/* Upcoming Events preview */}
      {events.length > 0 && (
        <section className="bg-stone-50 border-t border-stone-200 py-16 px-6">
          <div className="max-w-3xl mx-auto">
            <div className="flex items-center justify-between mb-6">
              <div>
                <p className="text-[11px] text-stone-400 tracking-widest uppercase mb-1">
                  What's Coming
                </p>
                <h2 className="text-xl font-medium text-[#1a1a18]">
                  Upcoming Events
                </h2>
              </div>
              <Link
                to="/events"
                className="text-sm text-stone-500 hover:text-[#1a1a18] transition-colors"
              >
                View all →
              </Link>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              {events.map((event) => (
                <div
                  key={event.id}
                  className="bg-white rounded-xl border border-stone-200 p-4"
                >
                  <span className="text-[10px] text-stone-400 uppercase tracking-widest">
                    {EVENT_TYPE_LABELS[event.type]}
                  </span>
                  <h3 className="text-sm font-medium text-[#1a1a18] mt-1 mb-2">
                    {event.title}
                  </h3>
                  <p className="text-xs text-stone-400">
                    {formatDate(event.date)}
                  </p>
                  {event.location && (
                    <p className="text-xs text-stone-400 mt-0.5">
                      📍 {event.location}
                    </p>
                  )}
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Fund teaser */}
      <section className="max-w-3xl mx-auto px-6 py-16">
        <div className="bg-[#1a1a18] rounded-2xl p-8 text-center">
          <p className="text-[11px] text-stone-500 tracking-widest uppercase mb-3">
            Full Transparency
          </p>
          <h2 className="text-xl font-medium text-white mb-2">
            Club Fund Balance
          </h2>
          <p className="text-4xl font-medium text-white my-4">
            {isLoading ? '...' : formatCurrency(netBalance)}
          </p>
          <p className="text-sm text-stone-400 mb-6 max-w-sm mx-auto">
            Every contribution and expense is recorded and made publicly
            available. Nothing hidden.
          </p>
          <Link
            to="/transparency"
            className="inline-block bg-white text-[#1a1a18] text-sm font-medium px-6 py-2.5 rounded-lg hover:bg-stone-100 transition-colors"
          >
            View Full Report →
          </Link>
        </div>
      </section>

    </div>
  )
}

export default LandingPage