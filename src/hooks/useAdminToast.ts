import { useOutletContext } from 'react-router-dom'
import type { ToastType } from '../hooks/useToast'

interface AdminContext {
  toast: (message: string, type?: ToastType) => void
}

export const useAdminToast = () => {
  return useOutletContext<AdminContext>()
}