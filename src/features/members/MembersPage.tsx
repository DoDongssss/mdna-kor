import { useMemo, useState } from 'react'
import {
  AlertCircle,
  Plus,
  RefreshCw,
  UserCheck,
  UserX,
  Users,
} from 'lucide-react'
import { useMembers } from '../../hooks/useMembers'
import {
  createMember,
  updateMember,
  toggleActive,
  softDeleteMember,
} from '../../lib/members'
import type { Member } from '../../types/members'
import type { MemberFormData } from '../../schemas/member.schema'
import LoadingSpinner from '../../components/common/LoadingSpinner'
import EmptyState from '../../components/common/EmptyState'
import ConfirmDialog from '../../components/common/ConfirmDialog'
import MemberTable from './MemberTable'
import MemberForm from './MemberForm'

const MembersPage = () => {
  const { members, isLoading, error, refetch } = useMembers()

  const [formOpen, setFormOpen] = useState(false)
  const [selectedMember, setSelectedMember] = useState<Member | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)

  const [confirmOpen, setConfirmOpen] = useState(false)
  const [memberToDelete, setMemberToDelete] = useState<Member | null>(null)

  const memberStats = useMemo(() => {
    const active = members.filter((member) => member.is_active).length
    const inactive = members.length - active

    return {
      total: members.length,
      active,
      inactive,
    }
  }, [members])

  const handleAdd = () => {
    setSelectedMember(null)
    setFormOpen(true)
  }

  const handleEdit = (member: Member) => {
    setSelectedMember(member)
    setFormOpen(true)
  }

  const handleClose = () => {
    setFormOpen(false)
    setSelectedMember(null)
  }

  const handleSubmit = async (data: MemberFormData) => {
    try {
      setIsSubmitting(true)

      if (selectedMember) {
        await updateMember(selectedMember.id, data)
      } else {
        await createMember(data)
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

  const handleToggleActive = async (member: Member) => {
    try {
      await toggleActive(member.id, member.is_active)
      await refetch()
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (err: any) {
      console.error(err.message)
    }
  }

  const handleDeleteClick = (member: Member) => {
    setMemberToDelete(member)
    setConfirmOpen(true)
  }

  const handleDeleteConfirm = async () => {
    if (!memberToDelete) return

    try {
      await softDeleteMember(memberToDelete.id)
      await refetch()
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (err: any) {
      console.error(err.message)
    } finally {
      setConfirmOpen(false)
      setMemberToDelete(null)
    }
  }

  return (
    <div className="space-y-4 sm:space-y-5 lg:space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div className="min-w-0">
          <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-sky-500">
            Members
          </p>

          <h1 className="mt-1 text-2xl font-black tracking-tight text-slate-950 sm:text-3xl">
            Club Roster
          </h1>

          <p className="mt-1 max-w-2xl text-sm leading-6 text-slate-500">
            Manage active and inactive members, contact details, nicknames, and
            roster status.
          </p>
        </div>

        <button
          type="button"
          onClick={handleAdd}
          className="inline-flex h-11 w-full items-center justify-center gap-2 rounded-xl bg-sky-600 px-4 text-sm font-semibold text-white shadow-sm shadow-sky-200 transition-all hover:bg-sky-700 active:scale-[0.98] sm:w-auto"
        >
          <Plus size={16} strokeWidth={2.4} />
          Add Member
        </button>
      </div>

      <section className="grid grid-cols-1 gap-3 sm:grid-cols-3">
        <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl bg-sky-50 text-sky-600 ring-1 ring-sky-100">
              <Users size={18} />
            </div>

            <div className="min-w-0">
              <p className="text-xs font-medium text-slate-400">
                Total members
              </p>
              <p className="text-2xl font-black tracking-tight text-slate-950">
                {memberStats.total}
              </p>
            </div>
          </div>
        </div>

        <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl bg-emerald-50 text-emerald-600 ring-1 ring-emerald-100">
              <UserCheck size={18} />
            </div>

            <div className="min-w-0">
              <p className="text-xs font-medium text-slate-400">
                Active members
              </p>
              <p className="text-2xl font-black tracking-tight text-slate-950">
                {memberStats.active}
              </p>
            </div>
          </div>
        </div>

        <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl bg-slate-100 text-slate-500 ring-1 ring-slate-200">
              <UserX size={18} />
            </div>

            <div className="min-w-0">
              <p className="text-xs font-medium text-slate-400">
                Inactive members
              </p>
              <p className="text-2xl font-black tracking-tight text-slate-950">
                {memberStats.inactive}
              </p>
            </div>
          </div>
        </div>
      </section>

      {isLoading ? (
        <section className="flex min-h-65 items-center justify-center rounded-2xl border border-slate-200 bg-white shadow-sm sm:min-h-80 sm:rounded-3xl">
          <LoadingSpinner />
        </section>
      ) : error ? (
        <section className="rounded-2xl border border-red-100 bg-red-50/70 p-5 shadow-sm sm:rounded-3xl sm:p-6">
          <div className="mx-auto max-w-md text-center">
            <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-2xl bg-red-100 text-red-600">
              <AlertCircle size={22} />
            </div>

            <EmptyState
              title="Failed to load members"
              description={error}
              action={
                <button
                  type="button"
                  onClick={refetch}
                  className="inline-flex items-center justify-center gap-2 rounded-xl bg-red-600 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-red-700"
                >
                  <RefreshCw size={15} />
                  Try again
                </button>
              }
            />
          </div>
        </section>
      ) : members.length === 0 ? (
        <section className="rounded-2xl border border-dashed border-slate-300 bg-white p-6 shadow-sm sm:rounded-3xl sm:p-8">
          <EmptyState
            title="No members yet"
            description="Add your first club member to start building the roster."
            action={
              <button
                type="button"
                onClick={handleAdd}
                className="inline-flex items-center justify-center gap-2 rounded-xl bg-sky-600 px-4 py-2.5 text-sm font-semibold text-white shadow-sm shadow-sky-200 transition-all hover:bg-sky-700 active:scale-[0.98]"
              >
                <Plus size={16} />
                Add Member
              </button>
            }
          />
        </section>
      ) : (
        <MemberTable
          members={members}
          onEdit={handleEdit}
          onToggleActive={handleToggleActive}
          onDelete={handleDeleteClick}
        />
      )}

      <MemberForm
        open={formOpen}
        member={selectedMember}
        onSubmit={handleSubmit}
        onClose={handleClose}
        isSubmitting={isSubmitting}
      />

      <ConfirmDialog
        open={confirmOpen}
        title="Delete Member"
        description={`Are you sure you want to remove ${memberToDelete?.name}? This action cannot be undone.`}
        confirmLabel="Delete"
        variant="danger"
        onConfirm={handleDeleteConfirm}
        onCancel={() => {
          setConfirmOpen(false)
          setMemberToDelete(null)
        }}
      />
    </div>
  )
}

export default MembersPage