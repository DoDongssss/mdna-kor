import { useMemo, useState } from 'react'
import {
  Pencil,
  Phone,
  Power,
  Search,
  Trash2,
  UserCheck,
  UserX,
} from 'lucide-react'
import type { Member } from '../../types/members'

type FilterType = 'all' | 'active' | 'inactive'

interface MemberTableProps {
  members: Member[]
  onEdit: (member: Member) => void
  onToggleActive: (member: Member) => void
  onDelete: (member: Member) => void
}

const FILTERS: { label: string; value: FilterType }[] = [
  { label: 'All', value: 'all' },
  { label: 'Active', value: 'active' },
  { label: 'Inactive', value: 'inactive' },
]

const MemberTable = ({
  members,
  onEdit,
  onToggleActive,
  onDelete,
}: MemberTableProps) => {
  const [filter, setFilter] = useState<FilterType>('all')
  const [search, setSearch] = useState('')

  const filtered = useMemo(() => {
    const query = search.trim().toLowerCase()

    return members
      .filter((member) => {
        if (filter === 'active') return member.is_active
        if (filter === 'inactive') return !member.is_active
        return true
      })
      .filter((member) => {
        if (!query) return true

        return (
          member.name.toLowerCase().includes(query) ||
          (member.nickname ?? '').toLowerCase().includes(query) ||
          (member.contact_number ?? '').toLowerCase().includes(query)
        )
      })
  }, [members, filter, search])

  return (
    <section className="space-y-3 sm:space-y-4">
      <div className="rounded-2xl border border-slate-200 bg-white p-3 shadow-sm sm:rounded-3xl sm:p-4">
        <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
          <div className="relative w-full lg:max-w-md">
            <Search
              size={16}
              className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
            />

            <input
              type="text"
              placeholder="Search by name, nickname, or contact..."
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              className="h-11 w-full rounded-xl border border-slate-200 bg-slate-50 pl-9 pr-3 text-sm font-medium text-slate-800 outline-none transition placeholder:text-slate-400 focus:border-sky-300 focus:bg-white focus:ring-4 focus:ring-sky-100"
            />
          </div>

          <div className="grid grid-cols-3 gap-1 rounded-xl bg-slate-100 p-1 sm:flex sm:w-fit">
            {FILTERS.map((item) => (
              <button
                key={item.value}
                type="button"
                onClick={() => setFilter(item.value)}
                className={`rounded-lg px-3 py-2 text-xs font-bold transition-colors sm:px-4 ${
                  filter === item.value
                    ? 'bg-white text-slate-950 shadow-sm'
                    : 'text-slate-500 hover:text-slate-900'
                }`}
              >
                {item.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {filtered.length === 0 ? (
        <div className="rounded-2xl border border-slate-200 bg-white p-8 text-center shadow-sm sm:rounded-3xl">
          <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-2xl bg-slate-100 text-slate-400">
            <Search size={22} />
          </div>

          <p className="text-sm font-bold text-slate-900">No members found</p>
          <p className="mt-1 text-sm text-slate-400">
            Try a different search term or filter.
          </p>
        </div>
      ) : (
        <>
          <div className="grid grid-cols-1 gap-3 md:hidden">
            {filtered.map((member) => (
              <article
                key={member.id}
                className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm"
              >
                <div className="p-4">
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex min-w-0 items-center gap-3">
                      <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-sky-50 text-sm font-black text-sky-700 ring-1 ring-sky-100">
                        {(member.name || 'M').charAt(0).toUpperCase()}
                      </div>

                      <div className="min-w-0">
                        <h3 className="wrap-break-word text-base font-black tracking-tight text-slate-950">
                          {member.name}
                        </h3>

                        <p className="mt-0.5 text-sm font-medium text-slate-400">
                          {member.nickname || 'No nickname'}
                        </p>
                      </div>
                    </div>

                    <span
                      className={`inline-flex shrink-0 items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-bold ${
                        member.is_active
                          ? 'bg-emerald-50 text-emerald-700 ring-1 ring-emerald-100'
                          : 'bg-slate-100 text-slate-500 ring-1 ring-slate-200'
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

                  <div className="mt-4 rounded-2xl bg-slate-50 p-3">
                    <div className="flex items-center gap-2 text-sm font-medium text-slate-500">
                      <Phone size={15} className="shrink-0 text-slate-400" />
                      <span className="min-w-0 truncate">
                        {member.contact_number || 'No contact number'}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-3 border-t border-slate-100 bg-slate-50/70">
                  <button
                    type="button"
                    onClick={() => onEdit(member)}
                    className="inline-flex items-center justify-center gap-1.5 px-2 py-3 text-xs font-bold text-slate-500 transition hover:bg-white hover:text-slate-950"
                  >
                    <Pencil size={14} />
                    Edit
                  </button>

                  <button
                    type="button"
                    onClick={() => onToggleActive(member)}
                    className="inline-flex items-center justify-center gap-1.5 border-x border-slate-100 px-2 py-3 text-xs font-bold text-slate-500 transition hover:bg-white hover:text-slate-950"
                  >
                    <Power size={14} />
                    {member.is_active ? 'Off' : 'On'}
                  </button>

                  <button
                    type="button"
                    onClick={() => onDelete(member)}
                    className="inline-flex items-center justify-center gap-1.5 px-2 py-3 text-xs font-bold text-red-400 transition hover:bg-red-50 hover:text-red-600"
                  >
                    <Trash2 size={14} />
                    Delete
                  </button>
                </div>
              </article>
            ))}
          </div>

          <div className="hidden overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm md:block">
            <div className="overflow-x-auto">
              <table className="w-full min-w-195">
                <thead>
                  <tr className="border-b border-slate-100 bg-slate-50/80">
                    <th className="px-5 py-3 text-left text-[11px] font-bold uppercase tracking-[0.16em] text-slate-400">
                      Member
                    </th>
                    <th className="px-5 py-3 text-left text-[11px] font-bold uppercase tracking-[0.16em] text-slate-400">
                      Nickname
                    </th>
                    <th className="px-5 py-3 text-left text-[11px] font-bold uppercase tracking-[0.16em] text-slate-400">
                      Contact
                    </th>
                    <th className="px-5 py-3 text-left text-[11px] font-bold uppercase tracking-[0.16em] text-slate-400">
                      Status
                    </th>
                    <th className="px-5 py-3 text-right text-[11px] font-bold uppercase tracking-[0.16em] text-slate-400">
                      Actions
                    </th>
                  </tr>
                </thead>

                <tbody className="divide-y divide-slate-100">
                  {filtered.map((member) => (
                    <tr
                      key={member.id}
                      className="transition-colors hover:bg-slate-50/70"
                    >
                      <td className="px-5 py-4">
                        <div className="flex min-w-0 items-center gap-3">
                          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-2xl bg-sky-50 text-xs font-black text-sky-700 ring-1 ring-sky-100">
                            {(member.name || 'M').charAt(0).toUpperCase()}
                          </div>

                          <div className="min-w-0">
                            <p className="truncate text-sm font-bold text-slate-950">
                              {member.name}
                            </p>

                            <p className="mt-0.5 text-xs font-medium text-slate-400">
                              Club member
                            </p>
                          </div>
                        </div>
                      </td>

                      <td className="px-5 py-4">
                        <span className="text-sm font-medium text-slate-500">
                          {member.nickname || '—'}
                        </span>
                      </td>

                      <td className="px-5 py-4">
                        <span className="text-sm font-medium text-slate-500">
                          {member.contact_number || '—'}
                        </span>
                      </td>

                      <td className="px-5 py-4">
                        <span
                          className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-bold ${
                            member.is_active
                              ? 'bg-emerald-50 text-emerald-700 ring-1 ring-emerald-100'
                              : 'bg-slate-100 text-slate-500 ring-1 ring-slate-200'
                          }`}
                        >
                          <span
                            className={`h-1.5 w-1.5 rounded-full ${
                              member.is_active
                                ? 'bg-emerald-500'
                                : 'bg-slate-400'
                            }`}
                          />
                          {member.is_active ? 'Active' : 'Inactive'}
                        </span>
                      </td>

                      <td className="px-5 py-4">
                        <div className="flex items-center justify-end gap-1">
                          <button
                            type="button"
                            onClick={() => onEdit(member)}
                            className="inline-flex h-8 items-center justify-center gap-1.5 rounded-xl px-2.5 text-xs font-bold text-slate-500 transition hover:bg-slate-100 hover:text-slate-950"
                          >
                            <Pencil size={14} />
                            Edit
                          </button>

                          <button
                            type="button"
                            onClick={() => onToggleActive(member)}
                            className="inline-flex h-8 items-center justify-center gap-1.5 rounded-xl px-2.5 text-xs font-bold text-slate-500 transition hover:bg-slate-100 hover:text-slate-950"
                          >
                            {member.is_active ? (
                              <UserX size={14} />
                            ) : (
                              <UserCheck size={14} />
                            )}
                            {member.is_active ? 'Deactivate' : 'Activate'}
                          </button>

                          <button
                            type="button"
                            onClick={() => onDelete(member)}
                            className="inline-flex h-8 items-center justify-center gap-1.5 rounded-xl px-2.5 text-xs font-bold text-red-400 transition hover:bg-red-50 hover:text-red-600"
                          >
                            <Trash2 size={14} />
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

          <p className="px-1 text-xs font-medium text-slate-400">
            Showing {filtered.length} of {members.length} members
          </p>
        </>
      )}
    </section>
  )
}

export default MemberTable