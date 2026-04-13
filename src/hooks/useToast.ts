import { useState, useEffect, useCallback } from 'react'

export type ToastType = 'success' | 'error' | 'warning'

export interface Toast {
  id:      string
  message: string
  type:    ToastType
}

export const useToast = () => {
  const [toasts, setToasts] = useState<Toast[]>([])

  const toast = useCallback((message: string, type: ToastType = 'success') => {
    const id = Math.random().toString(36).slice(2)
    setToasts((prev) => [...prev, { id, message, type }])
  }, [])

  const close = useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id))
  }, [])

  useEffect(() => {
    if (toasts.length === 0) return
    const timer = setTimeout(() => {
      setToasts((prev) => prev.slice(1))
    }, 3000)
    return () => clearTimeout(timer)
  }, [toasts])

  return { toasts, toast, close }
}