import { useState } from 'react'
import Sidebar from './Sidebar'
import Navbar from './Navbar'

export default function Layout({ children }) {
  const [collapsed, setCollapsed] = useState(false)
  const sidebarWidth = collapsed ? '4rem' : '16rem'

  return (
    <div className="min-h-screen bg-bg-app flex">
      <Sidebar collapsed={collapsed} onToggle={() => setCollapsed(c => !c)} />
      <main
        className="flex-1 transition-all duration-300 p-6"
        style={{ marginLeft: sidebarWidth }}
      >
        <Navbar />
        {children}
      </main>
    </div>
  )
}
