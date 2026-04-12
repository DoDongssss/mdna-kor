import { Navigate } from 'react-router-dom'
import { useAuthStore } from '../../stores/auth.store'

const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {
  const { isAdmin, isLoading } = useAuthStore()

  if (isLoading) {
    return (
      <div className="min-h-screen bg-[#f7f5f2] flex items-center justify-center">
        <div className="text-center">
          <div className="w-6 h-6 border-2 border-[#1a1a18] border-t-transparent rounded-full animate-spin mx-auto mb-3" />
          <p className="text-xs text-stone-400 tracking-widest uppercase">Loading</p>
        </div>
      </div>
    )
  }

  if (!isAdmin) return <Navigate to="/login" replace />

  return <>{children}</>
}

export default ProtectedRoute