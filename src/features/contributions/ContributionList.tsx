import type { ContributionWithMember } from '../../types/contributions'
import { formatCurrency } from '../../utils/formatCurrency'
import { formatDate } from '../../utils/formatDate'

interface ContributionListProps {
  contributions: ContributionWithMember[]
  onDelete: (contribution: ContributionWithMember) => void
}

const ContributionList = ({ contributions, onDelete }: ContributionListProps) => {
  return (
    <div className="bg-white rounded-xl border border-stone-200 overflow-hidden">
      <table className="w-full">
        <thead>
          <tr className="border-b border-stone-100">
            <th className="text-left text-[11px] font-medium text-stone-400 tracking-widest uppercase px-5 py-3">
              Member
            </th>
            <th className="text-left text-[11px] font-medium text-stone-400 tracking-widest uppercase px-5 py-3 hidden md:table-cell">
              Eyeball
            </th>
            <th className="text-left text-[11px] font-medium text-stone-400 tracking-widest uppercase px-5 py-3 hidden sm:table-cell">
              Method
            </th>
            <th className="text-right text-[11px] font-medium text-stone-400 tracking-widest uppercase px-5 py-3">
              Amount
            </th>
            <th className="text-right text-[11px] font-medium text-stone-400 tracking-widest uppercase px-5 py-3 hidden sm:table-cell">
              Date
            </th>
            <th className="text-right text-[11px] font-medium text-stone-400 tracking-widest uppercase px-5 py-3">
              Actions
            </th>
          </tr>
        </thead>
        <tbody className="divide-y divide-stone-50">
          {contributions.map((c) => (
            <tr key={c.id} className="hover:bg-stone-50 transition-colors">

              {/* Member */}
              <td className="px-5 py-3.5">
                <div className="flex items-center gap-3">
                  <div className="w-7 h-7 rounded-full bg-stone-100 flex items-center justify-center shrink-0">
                    <span className="text-xs font-medium text-stone-500">
                      {c.member_name.charAt(0).toUpperCase()}
                    </span>
                  </div>
                  <span className="text-sm text-[#1a1a18]">{c.member_name}</span>
                </div>
              </td>

              {/* Eyeball */}
              <td className="px-5 py-3.5 hidden md:table-cell">
                <span className="text-sm text-stone-400">
                  {c.eyeball_id ? 'Linked to meetup' : '—'}
                </span>
              </td>

              {/* Payment Method */}
              <td className="px-5 py-3.5 hidden sm:table-cell">
                {c.payment_method ? (
                  <span className="inline-block text-xs bg-stone-100 text-stone-500 px-2.5 py-1 rounded-full">
                    {c.payment_method}
                  </span>
                ) : (
                  <span className="text-sm text-stone-300">—</span>
                )}
              </td>

              {/* Amount */}
              <td className="px-5 py-3.5 text-right">
                <span className="text-sm font-medium text-green-600">
                  {formatCurrency(c.amount)}
                </span>
              </td>

              {/* Date */}
              <td className="px-5 py-3.5 text-right hidden sm:table-cell">
                <span className="text-xs text-stone-400">
                  {formatDate(c.created_at)}
                </span>
              </td>

              {/* Actions */}
              <td className="px-5 py-3.5 text-right">
                <button
                  onClick={() => onDelete(c)}
                  className="text-xs text-red-300 hover:text-red-500 px-3 py-1.5 rounded-lg hover:bg-red-50 transition-colors"
                >
                  Delete
                </button>
              </td>

            </tr>
          ))}
        </tbody>

        {/* Total row */}
        <tfoot>
          <tr className="border-t border-stone-200 bg-stone-50">
            <td colSpan={3} className="px-5 py-3 text-sm font-medium text-[#1a1a18]">
              Total
            </td>
            <td className="px-5 py-3 text-right text-sm font-medium text-green-600">
                {formatCurrency(
                contributions.reduce((sum: number, c: ContributionWithMember) => sum + c.amount, 0)
                )}
            </td>
            <td colSpan={2} className="hidden sm:table-cell" />
          </tr>
        </tfoot>
      </table>
    </div>
  )
}

export default ContributionList