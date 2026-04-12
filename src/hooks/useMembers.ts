import { useState, useEffect, useCallback } from 'react'
import { getMembersIncludeInactive } from '../lib/members'
import type { Member } from '../types/members'

export const useMembers = () => {
  const [members, setMembers]   = useState<Member[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError]       = useState<string | null>(null)

  
  const fetchMembers = useCallback(async () => {
    try {
      setIsLoading(true)
      setError(null)
      const data = await getMembersIncludeInactive()
      setMembers(data)
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (err: any) {
      setError(err.message ?? 'Failed to load members')
    } finally {
      setIsLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchMembers()
  }, [fetchMembers])

  return { members, isLoading, error, refetch: fetchMembers }
}