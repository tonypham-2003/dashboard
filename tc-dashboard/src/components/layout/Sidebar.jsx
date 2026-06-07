import { NavLink } from 'react-router-dom'
import {
  HomeIcon,
  TableCellsIcon,
  ClipboardDocumentCheckIcon,
  TruckIcon,
  ChartBarIcon,
} from '@heroicons/react/24/outline'

const navItems = [
  { to: '/',          label: 'Dashboard',       icon: HomeIcon },
  { to: '/shipments', label: 'Shipments',        icon: TableCellsIcon },
  { to: '/customs',   label: 'Customs Status',   icon: ClipboardDocumentCheckIcon },
  { to: '/trucking',  label: 'Trucking',         icon: TruckIcon },
  { to: '/reports',   label: 'Reports',          icon: ChartBarIcon },
]

export default function Sidebar({ collapsed, onToggle }) {
  return (
    <aside
      className={`sidebar-bg fixed top-0 left-0 h-full z-30 flex flex-col transition-all duration-300 ${collapsed ? 'w-16' : 'w-64'}`}
    >
      {/* Logo */}
      <div className="flex items-center gap-3 px-4 py-5 border-b border-white/10">
        <div className="w-8 h-8 rounded-lg gradient-info flex items-center justify-center flex-shrink-0">
          <span className="text-white font-bold text-sm">DP</span>
        </div>
        {!collapsed && (
          <div>
            <p className="text-white font-semibold text-sm leading-tight">DP World</p>
            <p className="text-white/60 text-xs">T&C Dashboard</p>
          </div>
        )}
        <button
          onClick={onToggle}
          className="ml-auto text-white/60 hover:text-white transition-colors"
          aria-label="Toggle sidebar"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
              d={collapsed ? 'M9 5l7 7-7 7' : 'M15 19l-7-7 7-7'} />
          </svg>
        </button>
      </div>

      {/* Nav */}
      <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
        {navItems.map(({ to, label, icon: Icon }) => (
          <NavLink
            key={to}
            to={to}
            end={to === '/'}
            className={({ isActive }) =>
              `flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all ${
                isActive
                  ? 'bg-white/20 text-white shadow-sm'
                  : 'text-white/70 hover:bg-white/10 hover:text-white'
              }`
            }
          >
            <Icon className="w-5 h-5 flex-shrink-0" />
            {!collapsed && <span>{label}</span>}
          </NavLink>
        ))}
      </nav>

      {/* Footer */}
      {!collapsed && (
        <div className="px-4 py-4 border-t border-white/10">
          <p className="text-white/40 text-xs text-center">DP World © 2026</p>
        </div>
      )}
    </aside>
  )
}
