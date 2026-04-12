import { useMemo } from 'react'
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts'
import type { ContributionWithMember } from '../../types/contributions'
import type { Expense } from '../../types/expenses'

interface FundSummaryChartProps {
  contributions: ContributionWithMember[]
  expenses:      Expense[]
}

const formatMonth = (dateStr: string) => {
  return new Date(dateStr).toLocaleDateString('en-PH', {
    month: 'short',
    year:  '2-digit',
  })
}

const FundSummaryChart = ({ contributions, expenses }: FundSummaryChartProps) => {
  const data = useMemo(() => {
    // Collect all unique months from both contributions and expenses
    const monthSet = new Set<string>()

    contributions.forEach((c) => {
      const d = new Date(c.created_at)
      monthSet.add(`${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`)
    })

    expenses.forEach((e) => {
      const d = new Date(e.date)
      monthSet.add(`${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`)
    })

    // Sort months ascending
    const months = Array.from(monthSet).sort()

    return months.map((month) => {
      const [year, mon] = month.split('-').map(Number)

      const contributed = contributions
        .filter((c) => {
          const d = new Date(c.created_at)
          return d.getFullYear() === year && d.getMonth() + 1 === mon
        })
        .reduce((sum, c) => sum + c.amount, 0)

      const spent = expenses
        .filter((e) => {
          const d = new Date(e.date)
          return d.getFullYear() === year && d.getMonth() + 1 === mon
        })
        .reduce((sum, e) => sum + e.amount, 0)

      return {
        month:         formatMonth(`${month}-01`),
        Contributions: contributed,
        Expenses:      spent,
      }
    })
  }, [contributions, expenses])

  if (data.length === 0) {
    return (
      <div className="flex items-center justify-center h-48">
        <p className="text-sm text-stone-400">
          No data yet — add contributions or expenses to see the chart
        </p>
      </div>
    )
  }

  return (
    <ResponsiveContainer width="100%" height={260}>
      <AreaChart data={data} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
        <defs>
          <linearGradient id="colorContrib" x1="0" y1="0" x2="0" y2="1">
            <stop offset="5%"  stopColor="#22c55e" stopOpacity={0.15} />
            <stop offset="95%" stopColor="#22c55e" stopOpacity={0} />
          </linearGradient>
          <linearGradient id="colorExpense" x1="0" y1="0" x2="0" y2="1">
            <stop offset="5%"  stopColor="#ef4444" stopOpacity={0.15} />
            <stop offset="95%" stopColor="#ef4444" stopOpacity={0} />
          </linearGradient>
        </defs>
        <CartesianGrid strokeDasharray="3 3" stroke="#f1f0ed" />
        <XAxis
          dataKey="month"
          tick={{ fontSize: 11, fill: '#a8a29e' }}
          axisLine={false}
          tickLine={false}
        />
        <YAxis
          tick={{ fontSize: 11, fill: '#a8a29e' }}
          axisLine={false}
          tickLine={false}
          tickFormatter={(v) => `₱${v.toLocaleString()}`}
          width={70}
        />
        <Tooltip
            formatter={(value) =>
                [`₱${Number(value ?? 0).toLocaleString()}`]
            }
            contentStyle={{
                backgroundColor: '#ffffff',
                border:          '1px solid #e7e5e4',
                borderRadius:    '8px',
                fontSize:        '12px',
            }}
        />
        <Legend
          wrapperStyle={{ fontSize: '12px', paddingTop: '12px' }}
        />
        <Area
          type="monotone"
          dataKey="Contributions"
          stroke="#22c55e"
          strokeWidth={2}
          fill="url(#colorContrib)"
          dot={false}
          activeDot={{ r: 4 }}
        />
        <Area
          type="monotone"
          dataKey="Expenses"
          stroke="#ef4444"
          strokeWidth={2}
          fill="url(#colorExpense)"
          dot={false}
          activeDot={{ r: 4 }}
        />
      </AreaChart>
    </ResponsiveContainer>
  )
}

export default FundSummaryChart