import { useMemo } from 'react'
import {
  PieChart,
  Pie,
  Cell,
  Tooltip,
  ResponsiveContainer,
} from 'recharts'
import type { Expense } from '../../types/expenses'

interface ExpenseBreakdownChartProps {
  expenses: Expense[]
}

// Refined, cohesive palette
const COLORS = [
  '#0f172a', // slate-900
  '#0ea5e9', // sky-500
  '#6366f1', // indigo-500
  '#f43f5e', // rose-500
  '#f97316', // orange-500
  '#eab308', // yellow-500
  '#10b981', // emerald-500
]

const CustomTooltip = ({ active, payload }: any) => {
  if (!active || !payload?.length) return null
  const { name, value } = payload[0].payload
  return (
    <div className="rounded-xl border border-slate-200 bg-white px-3.5 py-2.5 shadow-sm text-xs">
      <p className="font-medium text-slate-950 mb-0.5 max-w-[160px] truncate">{name}</p>
      <p className="text-slate-500">₱{Number(value).toLocaleString()}</p>
    </div>
  )
}

const ExpenseBreakdownChart = ({ expenses }: ExpenseBreakdownChartProps) => {
  const data = useMemo(() => {
    const grouped: Record<string, number> = {}
    ;(expenses ?? []).forEach((e) => {
      grouped[e.title] = (grouped[e.title] ?? 0) + e.amount
    })
    return Object.entries(grouped)
      .map(([name, value]) => ({ name, value }))
      .sort((a, b) => b.value - a.value)
      .slice(0, 7)
  }, [expenses])

  const total = data.reduce((s, d) => s + d.value, 0)

  if (data.length === 0) {
    return (
      <div className="flex h-48 items-center justify-center">
        <p className="text-sm text-slate-400">No expenses yet</p>
      </div>
    )
  }

  return (
    <div className="flex flex-col gap-4">
      <ResponsiveContainer width="100%" height={180}>
        <PieChart>
          <Pie
            data={data}
            cx="50%"
            cy="50%"
            innerRadius={52}
            outerRadius={78}
            paddingAngle={3}
            dataKey="value"
            strokeWidth={0}
          >
            {data.map((_, i) => (
              <Cell key={i} fill={COLORS[i % COLORS.length]} />
            ))}
          </Pie>
          <Tooltip content={<CustomTooltip />} />
        </PieChart>
      </ResponsiveContainer>

      {/* Custom legend as bar list */}
      <div className="space-y-2">
        {data.map((item, i) => {
          const pct = total > 0 ? (item.value / total) * 100 : 0
          return (
            <div key={i} className="flex items-center gap-2.5">
              <span
                className="h-2 w-2 shrink-0 rounded-full"
                style={{ background: COLORS[i % COLORS.length] }}
              />
              <span className="min-w-0 flex-1 truncate text-xs text-slate-500">
                {item.name.length > 22 ? item.name.slice(0, 22) + '…' : item.name}
              </span>
              <span className="shrink-0 text-xs font-medium text-slate-950">
                {pct.toFixed(0)}%
              </span>
            </div>
          )
        })}
      </div>
    </div>
  )
}

export default ExpenseBreakdownChart