import { ArrowPathIcon } from '@heroicons/react/24/outline'
import { useShipments } from '../../context/ShipmentsContext'
import { useLocation } from 'react-router-dom'

const breadcrumbs = {
  '/':          ['Dashboard', 'Overview'],
  '/shipments': ['Dashboard', 'Shipments'],
  '/customs':   ['Dashboard', 'Customs Status'],
  '/trucking':  ['Dashboard', 'Trucking'],
  '/reports':   ['Dashboard', 'Reports'],
}

export default function Navbar() {
  const { lastUpdated, refresh, loading } = useShipments()
  const location = useLocation()
  const crumbs = breadcrumbs[location.pathname] ?? ['Dashboard']

  const formattedTime = lastUpdated
    ? lastUpdated.toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit', second: '2-digit' })
    : '—'

  return (
    <header className="card mb-6 flex items-center justify-between px-6 py-3 sticky top-4 z-20">
      {/* Breadcrumb */}
      <div>
        <p className="text-xs text-gray-400">
          {crumbs.slice(0, -1).join(' / ')}
        </p>
        <p className="text-sm font-semibold text-primary">{crumbs[crumbs.length - 1]}</p>
      </div>

      {/* Right side */}
      <div className="flex items-center gap-3">
        <span className="text-xs text-gray-400">
          Last updated: <span className="font-medium text-gray-600">{formattedTime}</span>
        </span>
        <button
          onClick={refresh}
          disabled={loading}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-gray-100 hover:bg-gray-200 text-xs font-medium text-gray-600 transition-colors disabled:opacity-50"
        >
          <ArrowPathIcon className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
          Refresh
        </button>
      </div>
    </header>
  )
}
