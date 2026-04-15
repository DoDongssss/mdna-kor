import { useMemo, useState } from 'react'
import { useAdminToast } from '../../hooks/useAdminToast'
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
  const { toast } = useAdminToast()
  const { members, isLoading, error, refetch } = useMembers()

  const [formOpen, setFormOpen] = useState(false)
  const [selectedMember, setSelectedMember] = useState<Member | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)

  const [confirmOpen, setConfirmOpen] = useState(false)
  const [memberToDelete, setMemberToDelete] = useState<Member | null>(null)

  const memberStats = useMemo(() => {
    const active = members.filter((m) => m.is_active).length
    return { total: members.length, active, inactive: members.length - active }
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
        toast('Member updated successfully')
      } else {
        await createMember(data)
        toast('Member added successfully')
      }
      await refetch()
      handleClose()
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (err: any) {
      toast(err.message ?? 'Something went wrong', 'error')
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleToggleActive = async (member: Member) => {
    try {
      await toggleActive(member.id, member.is_active)
      await refetch()
      toast(`${member.name} marked as ${member.is_active ? 'inactive' : 'active'}`)
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (err: any) {
      toast(err.message ?? 'Something went wrong', 'error')
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
      toast('Member removed successfully')
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (err: any) {
      toast(err.message ?? 'Something went wrong', 'error')
    } finally {
      setConfirmOpen(false)
      setMemberToDelete(null)
    }
  }

  return (
    <div className="space-y-5">

      {/* Page header */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div className="min-w-0">
          <p className="text-[10px] font-medium uppercase tracking-widest text-sky-500">Members</p>
          <h1 className="mt-1 text-2xl font-semibold tracking-tight text-slate-950 sm:text-3xl">
            Club Members
          </h1>
          <p className="mt-1 max-w-xl text-sm leading-6 text-slate-500">
            Manage active and inactive members, contact details, and roster status.
          </p>
        </div>
        <button
          type="button"
          onClick={handleAdd}
          className="flex h-10 w-full items-center justify-center gap-2 rounded-xl bg-sky-500 px-4 text-sm font-medium text-white transition hover:bg-sky-600 active:scale-[0.98] sm:w-auto"
        >
          <Plus size={15} strokeWidth={2.5} />
          Add member
        </button>
      </div>

      {/* Stats */}
      <section className="grid grid-cols-3 gap-3">
        <div className="rounded-xl border border-slate-200 bg-white p-3.5 shadow-sm">
          <div className="mb-2 flex h-8 w-8 items-center justify-center rounded-lg bg-sky-50 text-sky-500">
            <Users size={16} />
          </div>
          <p className="text-2xl font-semibold tracking-tight text-slate-950">{memberStats.total}</p>
          <p className="mt-0.5 text-xs text-slate-400">Total</p>
        </div>
        <div className="rounded-xl border border-slate-200 bg-white p-3.5 shadow-sm">
          <div className="mb-2 flex h-8 w-8 items-center justify-center rounded-lg bg-sky-50 text-sky-500">
            <UserCheck size={16} />
          </div>
          <p className="text-2xl font-semibold tracking-tight text-slate-950">{memberStats.active}</p>
          <p className="mt-0.5 text-xs text-slate-400">Active</p>
        </div>
        <div className="rounded-xl border border-slate-200 bg-white p-3.5 shadow-sm">
          <div className="mb-2 flex h-8 w-8 items-center justify-center rounded-lg bg-slate-100 text-slate-400">
            <UserX size={16} />
          </div>
          <p className="text-2xl font-semibold tracking-tight text-slate-950">{memberStats.inactive}</p>
          <p className="mt-0.5 text-xs text-slate-400">Inactive</p>
        </div>
      </section>

      {/* Content */}
      {isLoading ? (
        <section className="flex min-h-64 items-center justify-center rounded-2xl border border-slate-200 bg-white shadow-sm">
          <LoadingSpinner />
        </section>
      ) : error ? (
        <section className="rounded-2xl border border-red-100 bg-red-50/60 p-6">
          <div className="mx-auto max-w-sm text-center">
            <div className="mx-auto mb-3 flex h-11 w-11 items-center justify-center rounded-xl bg-red-100 text-red-500">
              <AlertCircle size={20} />
            </div>
            <EmptyState
              title="Failed to load members"
              description={error}
              action={
                <button
                  type="button"
                  onClick={refetch}
                  className="inline-flex items-center gap-2 rounded-xl bg-red-500 px-4 py-2 text-sm font-medium text-white transition hover:bg-red-600"
                >
                  <RefreshCw size={14} />
                  Try again
                </button>
              }
            />
          </div>
        </section>
      ) : members.length === 0 ? (
        <section className="rounded-2xl border border-dashed border-slate-300 bg-white p-8">
          <EmptyState
            title="No members yet"
            description="Add your first club member to start building the roster."
            action={
              <button
                type="button"
                onClick={handleAdd}
                className="inline-flex items-center gap-2 rounded-xl bg-sky-500 px-4 py-2 text-sm font-medium text-white transition hover:bg-sky-600 active:scale-[0.98]"
              >
                <Plus size={15} />
                Add member
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
        title="Delete member"
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