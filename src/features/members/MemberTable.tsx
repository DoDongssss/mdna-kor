import { useMemo, useState } from 'react'
import {
  Pencil,
  Phone,
  Search,
  Trash2,
  UserCheck,
  UserX,
} from 'lucide-react'
import type { Member } from '../../types/members'
import Pagination from '@/components/common/Pagination'

type FilterType = 'all' | 'active' | 'inactive'

interface MemberTableProps {
  members: Member[]
  onEdit: (member: Member) => void
  onToggleActive: (member: Member) => void
  onDelete: (member: Member) => void
}

const PAGE_SIZE = 10

const FILTERS: { label: string; value: FilterType }[] = [
  { label: 'All', value: 'all' },
  { label: 'Active', value: 'active' },
  { label: 'Inactive', value: 'inactive' },
]

const getInitial = (name: string) => (name || 'M').charAt(0).toUpperCase()

const MemberTable = ({ members, onEdit, onToggleActive, onDelete }: MemberTableProps) => {
  const [filter, setFilter] = useState<FilterType>('all')
  const [search, setSearch] = useState('')
  const [currentPage, setCurrentPage] = useState(1)

  const filtered = useMemo(() => {
    const query = search.trim().toLowerCase()
    return members
      .filter((m) => {
        if (filter === 'active') return m.is_active
        if (filter === 'inactive') return !m.is_active
        return true
      })
      .filter((m) => {
        if (!query) return true
        return (
          m.name.toLowerCase().includes(query) ||
          (m.nickname ?? '').toLowerCase().includes(query) ||
          (m.contact_number ?? '').toLowerCase().includes(query)
        )
      })
  }, [members, filter, search])

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE))
  const safePage = Math.min(currentPage, totalPages)
  const startIndex = (safePage - 1) * PAGE_SIZE
  const visibleMembers = filtered.slice(startIndex, startIndex + PAGE_SIZE)

  const handleSearchChange = (value: string) => {
    setSearch(value)
    setCurrentPage(1)
  }

  const handleFilterChange = (value: FilterType) => {
    setFilter(value)
    setCurrentPage(1)
  }

  return (
    <section className="space-y-3">

      {/* Toolbar */}
      <div className="rounded-xl border border-slate-200 bg-white p-3 shadow-sm">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
          {/* Search */}
          <div className="relative flex-1">
            <Search
              size={15}
              className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
            />
            <input
              type="text"
              placeholder="Search member…"
              value={search}
              onChange={(e) => handleSearchChange(e.target.value)}
              className="h-10 w-full rounded-lg border border-slate-200 bg-slate-50 pl-9 pr-3 text-sm text-slate-800 outline-none transition placeholder:text-slate-400 focus:border-sky-300 focus:bg-white focus:ring-2 focus:ring-sky-100"
            />
          </div>

          {/* Filter tabs */}
          <div className="flex gap-1 rounded-lg bg-slate-100 p-1">
            {FILTERS.map((item) => (
              <button
                key={item.value}
                type="button"
                onClick={() => handleFilterChange(item.value)}
                className={`flex-1 rounded-md px-4 py-1.5 text-xs font-medium transition-all ${
                  filter === item.value
                    ? 'bg-white text-slate-900 shadow-sm'
                    : 'text-slate-500 hover:text-slate-800'
                }`}
              >
                {item.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {filtered.length === 0 ? (
        <div className="flex flex-col items-center justify-center rounded-xl border border-slate-200 bg-white py-12 text-center shadow-sm">
          <div className="mb-3 flex h-11 w-11 items-center justify-center rounded-xl bg-slate-100 text-slate-400">
            <Search size={20} />
          </div>
          <p className="text-sm font-medium text-slate-900">No members found</p>
          <p className="mt-1 text-sm text-slate-400">Try a different search or filter.</p>
        </div>
      ) : (
        <>
          {/* Mobile card list */}
          <div className="space-y-2 md:hidden">
            {visibleMembers.map((member) => (
              <article
                key={member.id}
                className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm"
              >
                <div className="p-4">
                  {/* Top row */}
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex min-w-0 items-start gap-3">
                      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-sky-50 text-sm font-semibold text-sky-600">
                        {getInitial(member.name)}
                      </div>
                      <div className="min-w-0">
                        <h3 className="truncate text-sm font-semibold text-slate-950">
                          {member.name}
                        </h3>
                        <p className="mt-0.5 text-xs text-slate-400">
                          {member.nickname || 'No nickname'}
                        </p>
                      </div>
                    </div>
                    <span
                      className={`inline-flex shrink-0 items-center gap-1.5 rounded-full px-2.5 py-1 text-[11px] font-medium ${
                        member.is_active
                          ? 'bg-emerald-50 text-emerald-700'
                          : 'bg-slate-100 text-slate-500'
                      }`}
                    >
                      <span
                        className={`h-1.5 w-1.5 rounded-full ${
                          member.is_active ? 'bg-emerald-500' : 'bg-slate-400'
                        }`}
                      />
                      {member.is_active ? 'Active' : 'Inactive'}
                    </span>
                  </div>

                  {/* Contact row */}
                  <div className="mt-3 flex items-center gap-2 rounded-lg bg-slate-50 px-3 py-2">
                    <Phone size={13} className="shrink-0 text-slate-400" />
                    <span className="min-w-0 truncate text-xs text-slate-500">
                      {member.contact_number || 'No contact number'}
                    </span>
                  </div>
                </div>

                {/* Action bar */}
                <div className="grid grid-cols-3 border-t border-slate-100">
                  <button
                    type="button"
                    onClick={() => onEdit(member)}
                    className="flex min-h-11 items-center justify-center gap-1.5 text-xs font-medium text-slate-500 transition hover:bg-slate-50 hover:text-slate-900"
                  >
                    <Pencil size={13} />
                    Edit
                  </button>
                  <button
                    type="button"
                    onClick={() => onToggleActive(member)}
                    className="flex min-h-11 items-center justify-center gap-1.5 border-x border-slate-100 text-xs font-medium text-slate-500 transition hover:bg-slate-50 hover:text-slate-900"
                  >
                    {member.is_active ? <UserX size={13} /> : <UserCheck size={13} />}
                    {member.is_active ? 'Deactivate' : 'Activate'}
                  </button>
                  <button
                    type="button"
                    onClick={() => onDelete(member)}
                    className="flex min-h-11 items-center justify-center gap-1.5 text-xs font-medium text-red-400 transition hover:bg-red-50 hover:text-red-600"
                  >
                    <Trash2 size={13} />
                    Delete
                  </button>
                </div>
              </article>
            ))}
          </div>

          {/* Desktop table */}
          <div className="hidden overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm md:block">
            <div className="overflow-x-auto">
              <table className="w-full min-w-[680px]">
                <thead>
                  <tr className="border-b border-slate-100 bg-slate-50/80">
                    {['Member', 'Nickname', 'Contact', 'Status', 'Actions'].map((h, i) => (
                      <th
                        key={h}
                        className={`px-5 py-3 text-[11px] font-medium uppercase tracking-widest text-slate-400 ${
                          i === 4 ? 'text-right' : 'text-left'
                        }`}
                      >
                        {h}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {visibleMembers.map((member) => (
                    <tr key={member.id} className="transition-colors hover:bg-slate-50/60">
                      <td className="px-5 py-3.5">
                        <div className="flex min-w-0 items-center gap-3">
                          <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-sky-50 text-xs font-semibold text-sky-600">
                            {getInitial(member.name)}
                          </div>
                          <p className="truncate text-sm font-medium text-slate-900">{member.name}</p>
                        </div>
                      </td>
                      <td className="px-5 py-3.5">
                        <span className="text-sm text-slate-500">{member.nickname || '—'}</span>
                      </td>
                      <td className="px-5 py-3.5">
                        <span className="text-sm text-slate-500">{member.contact_number || '—'}</span>
                      </td>
                      <td className="px-5 py-3.5">
                        <span
                          className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-medium ${
                            member.is_active
                              ? 'bg-emerald-50 text-emerald-700'
                              : 'bg-slate-100 text-slate-500'
                          }`}
                        >
                          <span
                            className={`h-1.5 w-1.5 rounded-full ${
                              member.is_active ? 'bg-emerald-500' : 'bg-slate-400'
                            }`}
                          />
                          {member.is_active ? 'Active' : 'Inactive'}
                        </span>
                      </td>
                      <td className="px-5 py-3.5">
                        <div className="flex items-center justify-end gap-1">
                          <button
                            type="button"
                            onClick={() => onEdit(member)}
                            className="flex h-8 items-center gap-1.5 rounded-lg px-2.5 text-xs font-medium text-slate-500 transition hover:bg-slate-100 hover:text-slate-900"
                          >
                            <Pencil size={13} />
                            Edit
                          </button>
                          <button
                            type="button"
                            onClick={() => onToggleActive(member)}
                            className="flex h-8 items-center gap-1.5 rounded-lg px-2.5 text-xs font-medium text-slate-500 transition hover:bg-slate-100 hover:text-slate-900"
                          >
                            {member.is_active ? <UserX size={13} /> : <UserCheck size={13} />}
                            {member.is_active ? 'Deactivate' : 'Activate'}
                          </button>
                          <button
                            type="button"
                            onClick={() => onDelete(member)}
                            className="flex h-8 items-center gap-1.5 rounded-lg px-2.5 text-xs font-medium text-red-400 transition hover:bg-red-50 hover:text-red-600"
                          >
                            <Trash2 size={13} />
                            Delete
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Pagination */}
          <Pagination
            currentPage={safePage}
            totalPages={totalPages}
            totalItems={members.length}
            filteredItems={filtered.length}
            pageSize={PAGE_SIZE}
            onPageChange={setCurrentPage}
          />
        </>
      )}
    </section>
  )
}

export default MemberTable