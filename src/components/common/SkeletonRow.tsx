const SkeletonRow = ({ cols = 4 }: { cols?: number }) => (
  <tr>
    {Array.from({ length: cols }).map((_, i) => (
      <td key={i} className="px-5 py-4">
        <div className="h-3 bg-stone-100 rounded animate-pulse" />
      </td>
    ))}
  </tr>
)

export const TableSkeleton = ({ rows = 5, cols = 4 }: { rows?: number; cols?: number }) => (
  <div className="bg-white rounded-xl border border-stone-200 overflow-hidden">
    <table className="w-full">
      <tbody className="divide-y divide-stone-50">
        {Array.from({ length: rows }).map((_, i) => (
          <SkeletonRow key={i} cols={cols} />
        ))}
      </tbody>
    </table>
  </div>
)

export const CardSkeleton = () => (
  <div className="bg-white rounded-xl border border-stone-200 p-5 space-y-3">
    <div className="h-3 bg-stone-100 rounded animate-pulse w-1/2" />
    <div className="h-3 bg-stone-100 rounded animate-pulse w-3/4" />
    <div className="h-3 bg-stone-100 rounded animate-pulse w-1/3" />
  </div>
)

export const StatCardSkeleton = () => (
  <div className="bg-white rounded-xl border border-stone-200 px-5 py-4 space-y-2">
    <div className="h-2 bg-stone-100 rounded animate-pulse w-1/2" />
    <div className="h-6 bg-stone-100 rounded animate-pulse w-2/3" />
  </div>
)