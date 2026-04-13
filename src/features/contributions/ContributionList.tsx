import { useMemo, useState } from 'react'
import { ChevronLeft, ChevronRight, Search } from 'lucide-react'
import type { ContributionWithMember } from '../../types/contributions'
import { formatCurrency } from '../../utils/formatCurrency'
import { formatDate } from '../../utils/formatDate'

interface ContributionListProps {
  contributions: ContributionWithMember[]
  onDelete: (contribution: ContributionWithMember) => void
}

const PAGE_SIZE = 10

const ContributionList = ({ contributions, onDelete }: ContributionListProps) => {
  const [search, setSearch]       = useState('')
  const [currentPage, setCurrentPage] = useState(1)

  const filtered = useMemo(() => {
    const query = search.trim().toLowerCase()
    if (!query) return contributions
    return contributions.filter((c) =>
      c.member_name.toLowerCase().includes(query) ||
      (c.payment_method ?? '').toLowerCase().includes(query)
    )
  }, [contributions, search])

  const totalPages    = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE))
  const safePage      = Math.min(currentPage, totalPages)
  const startIndex    = (safePage - 1) * PAGE_SIZE
  const visibleItems  = filtered.slice(startIndex, startIndex + PAGE_SIZE)

  const handleSearchChange = (value: string) => {
    setSearch(value)
    setCurrentPage(1)
  }

  return (
    <section className="space-y-3">

      {/* Search toolbar */}
      <div className="rounded-xl border border-slate-200 bg-white p-3 shadow-sm">
        <div className="relative">
          <Search
            size={15}
            className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
          />
          <input
            type="text"
            placeholder="Search member or payment method…"
            value={search}
            onChange={(e) => handleSearchChange(e.target.value)}
            className="h-10 w-full rounded-lg border border-slate-200 bg-slate-50 pl-9 pr-3 text-sm text-slate-800 outline-none transition placeholder:text-slate-400 focus:border-emerald-300 focus:bg-white focus:ring-2 focus:ring-emerald-100"
          />
        </div>
      </div>

      {filtered.length === 0 ? (
        <div className="flex flex-col items-center justify-center rounded-xl border border-slate-200 bg-white py-12 text-center shadow-sm">
          <div className="mb-3 flex h-11 w-11 items-center justify-center rounded-xl bg-slate-100 text-slate-400">
            <Search size={20} />
          </div>
          <p className="text-sm font-medium text-slate-900">No contributions found</p>
          <p className="mt-1 text-sm text-slate-400">Try a different search or filter.</p>
        </div>
      ) : (
        <>
          {/* Desktop Table */}
          <div className="hidden overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm md:block">
            <div className="overflow-x-auto">
              <table className="w-full min-w-[640px]">
                <thead>
                  <tr className="border-b border-slate-100 bg-slate-50/80">
                    {['Member', 'Eyeball', 'Method', 'Amount', 'Date', ''].map((h, i) => (
                      <th
                        key={`${h}-${i}`}
                        className={`px-5 py-3 text-[11px] font-medium uppercase tracking-widest text-slate-400 ${
                          i >= 3 ? 'text-right' : 'text-left'
                        }`}
                      >
                        {h}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {visibleItems.map((c) => (
                    <tr key={c.id} className="transition-colors hover:bg-slate-50/60 group">
                      <td className="px-5 py-3.5">
                        <div className="flex items-center gap-3">
                          <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-emerald-50 text-xs font-semibold text-emerald-600">
                            {c.member_name.charAt(0).toUpperCase()}
                          </div>
                          <p className="text-sm font-medium text-slate-900">{c.member_name}</p>
                        </div>
                      </td>
                      <td className="px-5 py-3.5">
                        {c.eyeball_id ? (
                          <span className="inline-flex items-center gap-1.5 rounded-full bg-indigo-50 px-2.5 py-1 text-xs font-medium text-indigo-600">
                            <span className="h-1.5 w-1.5 rounded-full bg-indigo-400" />
                            Linked
                          </span>
                        ) : (
                          <span className="text-sm text-slate-300">—</span>
                        )}
                      </td>
                      <td className="px-5 py-3.5">
                        {c.payment_method ? (
                          <span className="rounded-full bg-slate-100 px-2.5 py-1 text-xs font-medium text-slate-500">
                            {c.payment_method}
                          </span>
                        ) : (
                          <span className="text-sm text-slate-300">—</span>
                        )}
                      </td>
                      <td className="px-5 py-3.5 text-right">
                        <span className="text-sm font-semibold text-emerald-600">
                          {formatCurrency(c.amount)}
                        </span>
                      </td>
                      <td className="px-5 py-3.5 text-right">
                        <span className="text-xs text-slate-400">{formatDate(c.created_at)}</span>
                      </td>
                      <td className="px-5 py-3.5 text-right">
                        <button
                          onClick={() => onDelete(c)}
                          className="rounded-lg px-2.5 py-1.5 text-xs font-medium text-red-400 opacity-0 transition hover:bg-red-50 hover:text-red-600 group-hover:opacity-100"
                        >
                          Delete
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
                <tfoot>
                  <tr className="border-t border-slate-100 bg-slate-50/80">
                    <td colSpan={3} className="px-5 py-3 text-sm font-semibold text-slate-700">
                      Total ({contributions.length} records)
                    </td>
                    <td className="px-5 py-3 text-right text-sm font-bold text-emerald-600">
                      {formatCurrency(contributions.reduce((sum, c) => sum + c.amount, 0))}
                    </td>
                    <td colSpan={2} />
                  </tr>
                </tfoot>
              </table>
            </div>
          </div>

          {/* Mobile Cards */}
          <div className="space-y-2 md:hidden">
            {visibleItems.map((c) => (
              <article
                key={c.id}
                className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm"
              >
                <div className="p-4">
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex min-w-0 items-start gap-3">
                      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-emerald-50 text-sm font-semibold text-emerald-600">
                        {c.member_name.charAt(0).toUpperCase()}
                      </div>
                      <div className="min-w-0">
                        <h3 className="truncate text-sm font-semibold text-slate-950">
                          {c.member_name}
                        </h3>
                        <p className="mt-0.5 text-xs text-slate-400">{formatDate(c.created_at)}</p>
                      </div>
                    </div>
                    <span className="shrink-0 text-base font-bold text-emerald-600">
                      {formatCurrency(c.amount)}
                    </span>
                  </div>

                  <div className="mt-3 flex items-center gap-2 rounded-lg bg-slate-50 px-3 py-2">
                    <div className="flex flex-1 items-center gap-2 flex-wrap">
                      {c.payment_method ? (
                        <span className="rounded-full bg-white border border-slate-200 px-2.5 py-0.5 text-xs font-medium text-slate-500">
                          {c.payment_method}
                        </span>
                      ) : null}
                      {c.eyeball_id ? (
                        <span className="inline-flex items-center gap-1 rounded-full bg-indigo-50 px-2.5 py-0.5 text-xs font-medium text-indigo-600">
                          <span className="h-1.5 w-1.5 rounded-full bg-indigo-400" />
                          Linked
                        </span>
                      ) : null}
                      {!c.payment_method && !c.eyeball_id && (
                        <span className="text-xs text-slate-300">No details</span>
                      )}
                    </div>
                  </div>
                </div>

                <div className="border-t border-slate-100">
                  <button
                    onClick={() => onDelete(c)}
                    className="flex w-full min-h-10 items-center justify-center gap-1.5 text-xs font-medium text-red-400 transition hover:bg-red-50 hover:text-red-600"
                  >
                    Delete
                  </button>
                </div>
              </article>
            ))}

            {/* Mobile Total */}
            <div className="flex items-center justify-between rounded-xl border border-emerald-100 bg-emerald-50 px-4 py-3.5">
              <span className="text-sm font-semibold text-slate-600">
                Total · {contributions.length} records
              </span>
              <span className="text-base font-bold text-emerald-600">
                {formatCurrency(contributions.reduce((sum, c) => sum + c.amount, 0))}
              </span>
            </div>
          </div>

          {/* Pagination — exact same pattern as MemberTable */}
          <div className="flex items-center justify-between rounded-xl border border-slate-200 bg-white px-4 py-2.5 shadow-sm">
            <p className="text-xs text-slate-400">
              {startIndex + 1}–{Math.min(startIndex + PAGE_SIZE, filtered.length)} of{' '}
              {filtered.length}
              {filtered.length !== contributions.length
                ? ` (filtered from ${contributions.length})`
                : ''}{' '}
              records
            </p>
            <div className="flex items-center gap-2">
              <button
                type="button"
                disabled={safePage <= 1}
                onClick={() => setCurrentPage(safePage - 1)}
                className="flex h-8 items-center gap-1 rounded-lg border border-slate-200 px-2.5 text-xs font-medium text-slate-600 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-40"
              >
                <ChevronLeft size={14} />
                Prev
              </button>
              <span className="min-w-12 rounded-lg bg-slate-50 px-3 py-1.5 text-center text-xs font-medium text-slate-500">
                {safePage} / {totalPages}
              </span>
              <button
                type="button"
                disabled={safePage >= totalPages}
                onClick={() => setCurrentPage(safePage + 1)}
                className="flex h-8 items-center gap-1 rounded-lg border border-slate-200 px-2.5 text-xs font-medium text-slate-600 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-40"
              >
                Next
                <ChevronRight size={14} />
              </button>
            </div>
          </div>
        </>
      )}
    </section>
  )
}

export default ContributionList