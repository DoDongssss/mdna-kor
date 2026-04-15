import { useState, useMemo } from 'react'
import { ChevronLeft, ChevronRight, Search } from 'lucide-react'

// ── Types ──────────────────────────────────────────────────────────────────

export interface Column<T> {
  key:        string
  label:      string
  align?:     'left' | 'right' | 'center'
  className?: string
  /** Render a custom cell. Receives the row item. */
  render:     (item: T) => React.ReactNode
}

export interface PaginatedTableProps<T> {
  /** All rows. Filtering/pagination is handled internally. */
  data: T[]

  /** Column definitions (order matters). */
  columns: Column<T>[]

  /** Unique key extractor per row. */
  rowKey: (item: T) => string

  // ── Search ──────────────────────────────────────────────────────────────
  /** If provided, a search input appears and rows are filtered by this fn. */
  searchable?: boolean
  searchPlaceholder?: string
  /** Called per row + current query — return true to include the row. */
  onSearch?: (item: T, query: string) => boolean

  // ── Filter tabs ─────────────────────────────────────────────────────────
  filters?: { label: string; value: string }[]
  /** Called per row + current filter value. Return true to include. */
  onFilter?: (item: T, filter: string) => boolean
  defaultFilter?: string

  // ── Pagination ──────────────────────────────────────────────────────────
  defaultPageSize?: number

  // ── Empty state ─────────────────────────────────────────────────────────
  emptyTitle?:       string
  emptyDescription?: string

  // ── Mobile card ─────────────────────────────────────────────────────────
  /** If provided, renders this instead of auto table rows on mobile. */
  renderMobileCard?: (item: T) => React.ReactNode

  className?: string
}

// ── Component ──────────────────────────────────────────────────────────────

function PaginatedTable<T>({
  data,
  columns,
  rowKey,
  searchable        = false,
  searchPlaceholder = 'Search…',
  onSearch,
  filters,
  onFilter,
  defaultFilter     = filters?.[0]?.value ?? '',
  defaultPageSize   = 10,
  emptyTitle        = 'No results found',
  emptyDescription  = 'Try a different search or filter.',
  renderMobileCard,
  className         = '',
}: PaginatedTableProps<T>) {
  const [search,      setSearch]      = useState('')
  const [activeFilter, setActiveFilter] = useState(defaultFilter)
  const [page,        setPage]        = useState(1)
  const [pageSize,    setPageSize]    = useState(defaultPageSize)

  const PAGE_SIZE_OPTIONS = [10, 25, 50]

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase()
    return data
      .filter((item) => (onFilter && activeFilter) ? onFilter(item, activeFilter) : true)
      .filter((item) => (onSearch && q) ? onSearch(item, q) : true)
  }, [data, search, activeFilter, onSearch, onFilter])

  const totalPages = Math.max(1, Math.ceil(filtered.length / pageSize))
  const safePage   = Math.min(page, totalPages)
  const start      = (safePage - 1) * pageSize
  const visible    = filtered.slice(start, start + pageSize)

  const handleSearch = (val: string) => { setSearch(val); setPage(1) }
  const handleFilter = (val: string) => { setActiveFilter(val); setPage(1) }
  const handlePageSize = (n: number) => { setPageSize(n); setPage(1) }

  const hasToolbar = searchable || (filters && filters.length > 0)

  return (
    <section className={`space-y-3 ${className}`}>

      {/* ── Toolbar ── */}
      {hasToolbar && (
        <div className="rounded-xl border border-slate-200 bg-white p-3 shadow-sm">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center">

            {searchable && (
              <div className="relative flex-1">
                <Search
                  size={15}
                  className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
                />
                <input
                  type="text"
                  placeholder={searchPlaceholder}
                  value={search}
                  onChange={(e) => handleSearch(e.target.value)}
                  className="h-10 w-full rounded-lg border border-slate-200 bg-slate-50 pl-9 pr-3 text-sm text-slate-800 outline-none transition placeholder:text-slate-400 focus:border-sky-300 focus:bg-white focus:ring-2 focus:ring-sky-100"
                />
              </div>
            )}

            {filters && filters.length > 0 && (
              <div className="flex gap-1 rounded-lg bg-slate-100 p-1">
                {filters.map((f) => (
                  <button
                    key={f.value}
                    type="button"
                    onClick={() => handleFilter(f.value)}
                    className={`flex-1 rounded-md px-4 py-1.5 text-xs font-medium transition-all ${
                      activeFilter === f.value
                        ? 'bg-white text-slate-900 shadow-sm'
                        : 'text-slate-500 hover:text-slate-800'
                    }`}
                  >
                    {f.label}
                  </button>
                ))}
              </div>
            )}

          </div>
        </div>
      )}

      {/* ── Empty state ── */}
      {filtered.length === 0 ? (
        <div className="flex flex-col items-center justify-center rounded-xl border border-slate-200 bg-white py-12 text-center shadow-sm">
          <div className="mb-3 flex h-11 w-11 items-center justify-center rounded-xl bg-slate-100 text-slate-400">
            <Search size={20} />
          </div>
          <p className="text-sm font-medium text-slate-900">{emptyTitle}</p>
          <p className="mt-1 text-sm text-slate-400">{emptyDescription}</p>
        </div>
      ) : (
        <>
          {/* ── Mobile card list ── */}
          {renderMobileCard && (
            <div className="space-y-2 md:hidden">
              {visible.map((item) => (
                <div key={rowKey(item)}>{renderMobileCard(item)}</div>
              ))}
            </div>
          )}

          {/* ── Desktop table ── */}
          <div className={`overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm ${renderMobileCard ? 'hidden md:block' : 'block'}`}>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-slate-100 bg-slate-50/80">
                    {columns.map((col) => (
                      <th
                        key={col.key}
                        className={`px-5 py-3 text-[11px] font-medium uppercase tracking-widest text-slate-400 ${col.className ?? ''} ${
                          col.align === 'right'  ? 'text-right'  :
                          col.align === 'center' ? 'text-center' : 'text-left'
                        }`}
                      >
                        {col.label}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {visible.map((item) => (
                    <tr key={rowKey(item)} className="transition-colors hover:bg-slate-50/60">
                      {columns.map((col) => (
                        <td
                          key={col.key}
                          className={`px-5 py-3.5 ${col.className ?? ''} ${
                            col.align === 'right'  ? 'text-right'  :
                            col.align === 'center' ? 'text-center' : ''
                          }`}
                        >
                          {col.render(item)}
                        </td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* ── Pagination bar ── */}
          <div className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-slate-200 bg-white px-4 py-2.5 shadow-sm">

            {/* Left: count + page-size picker */}
            <div className="flex items-center gap-4">
              <p className="text-xs text-slate-400">
                {start + 1}–{Math.min(start + pageSize, filtered.length)} of {filtered.length}
                {filtered.length !== data.length
                  ? ` (filtered from ${data.length})`
                  : ''}
              </p>
              <div className="flex items-center gap-1.5">
                <span className="text-xs text-slate-400">Rows:</span>
                <div className="flex gap-1">
                  {PAGE_SIZE_OPTIONS.map((n) => (
                    <button
                      key={n}
                      type="button"
                      onClick={() => handlePageSize(n)}
                      className={`rounded px-2 py-0.5 text-xs transition-colors ${
                        pageSize === n
                          ? 'bg-slate-900 text-white'
                          : 'text-slate-400 hover:bg-slate-100 hover:text-slate-800'
                      }`}
                    >
                      {n}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Right: prev / page indicator / next */}
            {totalPages > 1 && (
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  disabled={safePage <= 1}
                  onClick={() => setPage(safePage - 1)}
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
                  onClick={() => setPage(safePage + 1)}
                  className="flex h-8 items-center gap-1 rounded-lg border border-slate-200 px-2.5 text-xs font-medium text-slate-600 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-40"
                >
                  Next
                  <ChevronRight size={14} />
                </button>
              </div>
            )}

          </div>
        </>
      )}
    </section>
  )
}

export default PaginatedTable