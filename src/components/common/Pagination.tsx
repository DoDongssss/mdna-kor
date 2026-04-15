import { ChevronLeft, ChevronRight } from 'lucide-react'

interface PaginationProps {
  currentPage: number
  totalPages: number
  totalItems: number
  filteredItems: number
  pageSize: number
  onPageChange: (page: number) => void
}

const Pagination = ({
  currentPage,
  totalPages,
  totalItems,
  filteredItems,
  pageSize,
  onPageChange,
}: PaginationProps) => {
  const safePage   = Math.min(currentPage, totalPages)
  const startIndex = (safePage - 1) * pageSize

  return (
    <div className="flex items-center justify-between rounded-xl border border-slate-200 bg-white px-4 py-2.5 shadow-sm">
      <p className="text-xs text-slate-400">
        {startIndex + 1}–{Math.min(startIndex + pageSize, filteredItems)} of {filteredItems}
        {filteredItems !== totalItems ? ` (filtered from ${totalItems})` : ''} records
      </p>

      <div className="flex items-center gap-2">
        <button
          type="button"
          disabled={safePage <= 1}
          onClick={() => onPageChange(safePage - 1)}
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
          onClick={() => onPageChange(safePage + 1)}
          className="flex h-8 items-center gap-1 rounded-lg border border-slate-200 px-2.5 text-xs font-medium text-slate-600 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-40"
        >
          Next
          <ChevronRight size={14} />
        </button>
      </div>
    </div>
  )
}

export default Pagination