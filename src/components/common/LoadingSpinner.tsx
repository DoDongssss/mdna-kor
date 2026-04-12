const LoadingSpinner = ({ label = 'Loading...' }: { label?: string }) => {
  return (
    <div className="flex flex-col items-center justify-center py-20">
      <div className="w-5 h-5 border-2 border-[#1a1a18] border-t-transparent rounded-full animate-spin mb-3" />
      <p className="text-xs text-stone-400 tracking-widest uppercase">{label}</p>
    </div>
  )
}

export default LoadingSpinner