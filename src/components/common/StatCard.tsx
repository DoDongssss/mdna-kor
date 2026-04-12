interface StatCardProps {
  label:     string
  value:     string
  sublabel?: string
  variant?:  'default' | 'success' | 'danger' | 'warning'
}

const VARIANTS = {
  default: {
    card:  'bg-white border-stone-200',
    value: 'text-[#1a1a18]',
    sub:   'text-stone-400',
  },
  success: {
    card:  'bg-green-50 border-green-100',
    value: 'text-green-600',
    sub:   'text-green-400',
  },
  danger: {
    card:  'bg-red-50 border-red-100',
    value: 'text-red-500',
    sub:   'text-red-300',
  },
  warning: {
    card:  'bg-amber-50 border-amber-100',
    value: 'text-amber-600',
    sub:   'text-amber-400',
  },
}

const StatCard = ({
  label,
  value,
  sublabel,
  variant = 'default',
}: StatCardProps) => {
  const styles = VARIANTS[variant]

  return (
    <div className={`rounded-xl border px-5 py-4 ${styles.card}`}>
      <p className="text-[11px] text-stone-400 uppercase tracking-widest mb-2">
        {label}
      </p>
      <p className={`text-2xl font-medium ${styles.value}`}>
        {value}
      </p>
      {sublabel && (
        <p className={`text-xs mt-1 ${styles.sub}`}>
          {sublabel}
        </p>
      )}
    </div>
  )
}

export default StatCard