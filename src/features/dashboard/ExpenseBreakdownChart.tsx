import { useMemo } from 'react'
import {
  PieChart,
  Pie,
  Cell,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts'
import type { Expense } from '../../types/expenses'

interface ExpenseBreakdownChartProps {
  expenses: Expense[]
}

const COLORS = [
  '#1a1a18',
  '#a8a29e',
  '#d6d3d1',
  '#ef4444',
  '#f97316',
  '#eab308',
  '#22c55e',
]

const ExpenseBreakdownChart = ({ expenses }: ExpenseBreakdownChartProps) => {
  const data = useMemo(() => {
    const grouped: Record<string, number> = {}

    expenses.forEach((e) => {
      const key = e.title
      grouped[key] = (grouped[key] ?? 0) + e.amount
    })

    return Object.entries(grouped)
      .map(([name, value]) => ({ name, value }))
      .sort((a, b) => b.value - a.value)
      .slice(0, 7) // Top 7
  }, [expenses])

  if (data.length === 0) {
    return (
      <div className="flex items-center justify-center h-48">
        <p className="text-sm text-stone-400">
          No expenses yet
        </p>
      </div>
    )
  }

  return (
    <ResponsiveContainer width="100%" height={260}>
      <PieChart>
        <Pie
          data={data}
          cx="50%"
          cy="50%"
          innerRadius={60}
          outerRadius={90}
          paddingAngle={3}
          dataKey="value"
        >
          {data.map((_, index) => (
            <Cell
              key={`cell-${index}`}
              fill={COLORS[index % COLORS.length]}
            />
          ))}
        </Pie>
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
          wrapperStyle={{ fontSize: '11px' }}
          formatter={(value) =>
            value.length > 20 ? value.slice(0, 20) + '…' : value
          }
        />
      </PieChart>
    </ResponsiveContainer>
  )
}

export default ExpenseBreakdownChart