interface EmptyStateProps {
  title: string
  description?: string
  action?: React.ReactNode
}

const EmptyState = ({ title, description, action }: EmptyStateProps) => {
  return (
    <div className="flex flex-col items-center justify-center py-20 text-center">
      <div className="w-12 h-12 rounded-full bg-stone-100 flex items-center justify-center mb-4">
        <span className="text-stone-400 text-xl">—</span>
      </div>
      <h3 className="text-sm font-medium text-[#1a1a18] mb-1">{title}</h3>
      {description && (
        <p className="text-sm text-stone-400 mb-4 max-w-xs">{description}</p>
      )}
      {action && <div>{action}</div>}
    </div>
  )
}

export default EmptyState