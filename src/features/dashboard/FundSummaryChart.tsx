import { useMemo } from 'react'
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts'
import type { ContributionWithMember } from '../../types/contributions'
import type { Expense } from '../../types/expenses'

interface FundSummaryChartProps {
  contributions: ContributionWithMember[]
  expenses:      Expense[]
}

const formatMonth = (dateStr: string) =>
  new Date(dateStr).toLocaleDateString('en-PH', { month: 'short', year: '2-digit' })

// Custom tooltip
const CustomTooltip = ({ active, payload, label }: any) => {
  if (!active || !payload?.length) return null
  return (
    <div className="rounded-xl border border-slate-200 bg-white px-3.5 py-3 shadow-sm text-xs">
      <p className="text-slate-400 mb-2 font-medium">{label}</p>
      {payload.map((p: any) => (
        <div key={p.dataKey} className="flex items-center justify-between gap-6">
          <span className="flex items-center gap-1.5 text-slate-500">
            <span
              className="h-1.5 w-1.5 rounded-full"
              style={{ background: p.color }}
            />
            {p.dataKey}
          </span>
          <span className="font-semibold text-slate-950">
            ₱{Number(p.value ?? 0).toLocaleString()}
          </span>
        </div>
      ))}
    </div>
  )
}

const FundSummaryChart = ({ contributions, expenses }: FundSummaryChartProps) => {
  const data = useMemo(() => {
    const safeContributions = contributions ?? []
    const safeExpenses = expenses ?? []
    const monthSet = new Set<string>()
    safeContributions.forEach((c) => {
      const d = new Date(c.created_at)
      monthSet.add(`${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`)
    })
    safeExpenses.forEach((e) => {
      const d = new Date(e.date)
      monthSet.add(`${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`)
    })

    return Array.from(monthSet)
      .sort()
      .map((month) => {
        const [year, mon] = month.split('-').map(Number)
        const contributed = safeContributions
          .filter((c) => {
            const d = new Date(c.created_at)
            return d.getFullYear() === year && d.getMonth() + 1 === mon
          })
          .reduce((sum, c) => sum + c.amount, 0)
        const spent = safeExpenses
          .filter((e) => {
            const d = new Date(e.date)
            return d.getFullYear() === year && d.getMonth() + 1 === mon
          })
          .reduce((sum, e) => sum + e.amount, 0)
        return { month: formatMonth(`${month}-01`), Contributions: contributed, Expenses: spent }
      })
  }, [contributions, expenses])

  if (data.length === 0) {
    return (
      <div className="flex h-48 items-center justify-center">
        <p className="text-sm text-slate-400">No data yet</p>
      </div>
    )
  }

  return (
    <ResponsiveContainer width="100%" height={240}>
      <AreaChart data={data} margin={{ top: 4, right: 4, left: 0, bottom: 0 }}>
        <defs>
          <linearGradient id="fillContrib" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%"   stopColor="#10b981" stopOpacity={0.12} />
            <stop offset="100%" stopColor="#10b981" stopOpacity={0} />
          </linearGradient>
          <linearGradient id="fillExpense" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%"   stopColor="#f43f5e" stopOpacity={0.12} />
            <stop offset="100%" stopColor="#f43f5e" stopOpacity={0} />
          </linearGradient>
        </defs>
        <CartesianGrid strokeDasharray="2 4" stroke="#f1f5f9" vertical={false} />
        <XAxis
          dataKey="month"
          tick={{ fontSize: 11, fill: '#94a3b8' }}
          axisLine={false}
          tickLine={false}
          dy={6}
        />
        <YAxis
          tick={{ fontSize: 11, fill: '#94a3b8' }}
          axisLine={false}
          tickLine={false}
          tickFormatter={(v) => `₱${(v / 1000).toFixed(0)}k`}
          width={44}
        />
        <Tooltip content={<CustomTooltip />} cursor={{ stroke: '#e2e8f0', strokeWidth: 1 }} />
        <Area
          type="monotone"
          dataKey="Contributions"
          stroke="#10b981"
          strokeWidth={2}
          fill="url(#fillContrib)"
          dot={false}
          activeDot={{ r: 4, fill: '#10b981', strokeWidth: 0 }}
        />
        <Area
          type="monotone"
          dataKey="Expenses"
          stroke="#f43f5e"
          strokeWidth={2}
          fill="url(#fillExpense)"
          dot={false}
          activeDot={{ r: 4, fill: '#f43f5e', strokeWidth: 0 }}
        />
      </AreaChart>
    </ResponsiveContainer>
  )
}

export default FundSummaryChart