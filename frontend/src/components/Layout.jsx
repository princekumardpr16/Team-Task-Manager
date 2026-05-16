import { Outlet, NavLink, useNavigate } from 'react-router-dom'
import { LayoutDashboard, FolderKanban, LogOut, Zap } from 'lucide-react'
import useAuthStore from '../store/authStore'

export default function Layout() {
  const { user, logout } = useAuthStore()
  const navigate = useNavigate()

  const handleLogout = () => {
    logout()
    navigate('/login')
  }

  return (
    <div className="flex h-screen overflow-hidden">
      {/* Sidebar */}
      <aside className="w-60 bg-[#111111] border-r border-[#2a2a2a] flex flex-col shrink-0">
        {/* Logo */}
        <div className="p-6 border-b border-[#2a2a2a]">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-green-500 rounded-lg flex items-center justify-center">
              <Zap size={16} className="text-black" fill="black" />
            </div>
            <span className="text-white font-bold text-lg tracking-tight">TaskFlow</span>
          </div>
        </div>

        {/* Nav */}
        <nav className="flex-1 p-4 space-y-1">
          <NavLink
            to="/dashboard"
            className={({ isActive }) =>
              `flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all ${
                isActive
                  ? 'bg-green-500/10 text-green-400'
                  : 'text-neutral-400 hover:text-white hover:bg-white/5'
              }`
            }
          >
            <LayoutDashboard size={18} />
            Dashboard
          </NavLink>
          <NavLink
            to="/projects"
            className={({ isActive }) =>
              `flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all ${
                isActive
                  ? 'bg-green-500/10 text-green-400'
                  : 'text-neutral-400 hover:text-white hover:bg-white/5'
              }`
            }
          >
            <FolderKanban size={18} />
            Projects
          </NavLink>
        </nav>

        {/* User */}
        <div className="p-4 border-t border-[#2a2a2a]">
          <div className="flex items-center gap-3 mb-3 px-2">
            <div className="w-8 h-8 rounded-full bg-green-500/20 border border-green-500/30 flex items-center justify-center text-green-400 text-sm font-bold shrink-0">
              {user?.name?.[0]?.toUpperCase()}
            </div>
            <div className="min-w-0">
              <p className="text-sm font-medium text-white truncate">{user?.name}</p>
              <p className="text-xs text-neutral-500 truncate">{user?.email}</p>
            </div>
          </div>
          <button onClick={handleLogout} className="btn-ghost w-full justify-start text-sm text-neutral-500">
            <LogOut size={16} />
            Sign out
          </button>
        </div>
      </aside>

      {/* Main */}
      <main className="flex-1 overflow-auto bg-[#0a0a0a]">
        <Outlet />
      </main>
    </div>
  )
}
