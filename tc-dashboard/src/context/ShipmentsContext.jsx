import { createContext, useContext, useState, useEffect, useCallback } from 'react'
import { fetchShipments } from '../api/sheets'

const ShipmentsContext = createContext(null)

const REFRESH_INTERVAL = 30 * 1000 // 30 seconds for near-real-time updates

export function ShipmentsProvider({ children }) {
  const [shipments, setShipments] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [lastUpdated, setLastUpdated] = useState(null)

  const loadData = useCallback(async () => {
    try {
      const data = await fetchShipments()
      setShipments(data)
      setLastUpdated(new Date())
      setError(null)
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    loadData()
    const interval = setInterval(loadData, REFRESH_INTERVAL)
    return () => clearInterval(interval)
  }, [loadData])

  return (
    <ShipmentsContext.Provider value={{ shipments, loading, error, lastUpdated, refresh: loadData }}>
      {children}
    </ShipmentsContext.Provider>
  )
}

export function useShipments() {
  return useContext(ShipmentsContext)
}
