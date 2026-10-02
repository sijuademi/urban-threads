import { useCallback, useEffect, useState } from 'react'
import { getOrders } from './orderService'

export function useOrders(user) {
  const [orders, setOrders] = useState([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const refresh = useCallback(async () => {
    if (!user) return
    setLoading(true); setError('')
    try { setOrders(await getOrders()) } catch (requestError) { setError(requestError.message) } finally { setLoading(false) }
  }, [user])
  useEffect(() => { refresh() }, [refresh])
  return { orders, loading, error, refresh }
}
