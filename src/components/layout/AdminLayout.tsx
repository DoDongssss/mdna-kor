import { useState } from 'react'
import { NavLink, Outlet, useLocation, useNavigate } from 'react-router-dom'
import {
  CalendarCheck,
  CalendarDays,
  Eye,
  LayoutDashboard,
  LogOut,
  Menu,
  Receipt,
  Users,
  Wallet,
  X,
  ShoppingBag,
} from 'lucide-react'
import { useAuthStore } from '../../stores/auth.store'
import { useToast } from '../../hooks/useToast'
import ToastContainer from '../common/ToastContainer'

const NAV_ITEMS = [
  { label: 'Dashboard', path: '/admin', icon: LayoutDashboard },
  { label: 'Members', path: '/admin/members', icon: Users },
  { label: 'Eyeballs', path: '/admin/eyeballs', icon: Eye },
  { label: 'Attendance', path: '/admin/attendance', icon: CalendarCheck },
  { label: 'Contributions', path: '/admin/contributions', icon: Wallet },
  { label: 'Expenses', path: '/admin/expenses', icon: Receipt },
  { label: 'Events', path: '/admin/events', icon: CalendarDays },
  { label: 'Orders', path: '/admin/orders', icon: ShoppingBag },
]

const AdminLayout = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const logout = useAuthStore((state) => state.logout)
  const navigate = useNavigate()
  const location = useLocation()
  const { toasts, toast, close } = useToast()

  const handleLogout = async () => {
    await logout()
    navigate('/login')
  }

  const currentTitle =
    NAV_ITEMS.find((item) =>
      item.path === '/admin'
        ? location.pathname === '/admin'
        : location.pathname.startsWith(item.path),
    )?.label || 'Admin'

  return (
    <div className="h-[100dvh] overflow-hidden bg-slate-50 text-slate-950">
      <div className="flex h-full min-w-0">

        {/* Overlay */}
        {sidebarOpen && (
          <button
            type="button"
            aria-label="Close sidebar"
            className="fixed inset-0 z-40 bg-slate-950/30 backdrop-blur-[2px] lg:hidden"
            onClick={() => setSidebarOpen(false)}
          />
        )}

        {/* Sidebar */}
        <aside
          className={`fixed inset-y-0 left-0 z-50 flex h-[100dvh] w-64 flex-col border-r border-slate-200 bg-white transition-transform duration-250 ease-out lg:static lg:z-auto lg:translate-x-0 lg:shadow-none ${
            sidebarOpen ? 'translate-x-0 shadow-xl shadow-slate-900/10' : '-translate-x-full'
          }`}
        >
          {/* Sidebar Header */}
          <div className="flex h-14 shrink-0 items-center justify-between border-b border-slate-100 px-4">
            <div>
              <h1 className="text-base font-semibold tracking-tight text-slate-950">
                MDNA<span className="text-sky-500"> KORONADAL</span>
              </h1>
              <p className="text-[10px] text-slate-400 mt-0.5">Admin Console</p>
            </div>
            <button
              type="button"
              aria-label="Close sidebar"
              className="flex h-8 w-8 items-center justify-center rounded-lg border border-slate-200 text-slate-400 transition hover:bg-slate-50 hover:text-slate-700 lg:hidden"
              onClick={() => setSidebarOpen(false)}
            >
              <X size={16} />
            </button>
          </div>

          {/* Nav */}
          <nav className="min-h-0 flex-1 overflow-y-auto px-3 py-3">
            <p className="mb-2 px-2 text-[10px] font-medium uppercase tracking-widest text-slate-400">
              Navigation
            </p>
            <div className="space-y-0.5">
              {NAV_ITEMS.map((item) => {
                const Icon = item.icon
                return (
                  <NavLink
                    key={item.path}
                    to={item.path}
                    end={item.path === '/admin'}
                    onClick={() => setSidebarOpen(false)}
                    className={({ isActive }) =>
                      `group relative flex min-w-0 items-center gap-2.5 rounded-lg px-3 py-2.5 text-sm transition-all ${
                        isActive
                          ? 'bg-sky-50 text-sky-700 font-medium'
                          : 'text-slate-500 hover:bg-slate-50 hover:text-slate-900'
                      }`
                    }
                  >
                    {({ isActive }) => (
                      <>
                        <span
                          className={`absolute left-0 top-1/2 h-5 w-0.5 -translate-y-1/2 rounded-full transition-all ${
                            isActive ? 'bg-sky-500' : 'bg-transparent'
                          }`}
                        />
                        <Icon
                          size={16}
                          strokeWidth={isActive ? 2 : 1.75}
                          className={`shrink-0 transition-colors ${
                            isActive ? 'text-sky-500' : 'text-slate-400 group-hover:text-slate-600'
                          }`}
                        />
                        <span className="truncate">{item.label}</span>
                        {isActive && (
                          <span className="ml-auto h-1.5 w-1.5 rounded-full bg-sky-400" />
                        )}
                      </>
                    )}
                  </NavLink>
                )
              })}
            </div>
          </nav>

          {/* Sidebar Footer */}
          <div className="shrink-0 border-t border-slate-100 p-3 space-y-2">
            <div className="flex items-center gap-3 rounded-lg bg-slate-50 px-3 py-2.5">
              <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-sky-500 text-xs font-semibold text-white">
                A
              </div>
              <div className="min-w-0">
                <p className="truncate text-sm font-medium text-slate-900">Admin User</p>
                <p className="truncate text-xs text-slate-400">MDNA : ZONE Koronadal</p>
              </div>
            </div>
            <button
              type="button"
              onClick={handleLogout}
              className="flex w-full items-center justify-center gap-2 rounded-lg border border-slate-200 bg-white px-4 py-2 text-sm text-slate-500 transition hover:border-red-100 hover:bg-red-50 hover:text-red-600"
            >
              <LogOut size={15} />
              Sign out
            </button>
          </div>
        </aside>

        {/* Main */}
        <div className="flex min-w-0 flex-1 flex-col">

        {/* Topbar */}
        <header className="flex h-14 shrink-0 items-center justify-between gap-3 border-b border-slate-200 bg-white px-4 sm:px-6">
          <div className="flex min-w-0 items-center gap-3">
            <button
              type="button"
              aria-label="Open sidebar"
              className="flex h-9 w-9 items-center justify-center rounded-lg border border-slate-200 bg-white text-slate-500 transition hover:bg-slate-50 hover:text-slate-900 lg:hidden"
              onClick={() => setSidebarOpen(true)}
            >
              <Menu size={18} />
            </button>
            <div className="min-w-0">
              <h2 className="truncate text-base font-semibold tracking-tight text-slate-950 sm:text-lg leading-tight">
                {currentTitle}
              </h2>
              <p className="text-[11px] text-slate-400 italic tracking-wide">
                We build to inspire, not to impress.
              </p>
            </div>
          </div>

          <div className="flex shrink-0 items-center gap-3">
            <div className="hidden text-right sm:block">
              <p className="text-sm font-medium text-slate-900">Admin User</p>
              <p className="text-xs text-slate-400">MDNA KOR</p>
            </div>
            <div className="flex h-9 w-9 items-center justify-center rounded-full bg-sky-500 text-sm font-semibold text-white">
              A
            </div>
          </div>
        </header>

          {/* Page Content */}
          <main className="min-h-0 flex-1 overflow-y-auto overflow-x-hidden">
            <div className="mx-auto w-full max-w-6xl px-4 py-5 sm:px-6 sm:py-6">
              <Outlet context={{ toast }} />
            </div>
          </main>
        </div>
      </div>

      <ToastContainer toasts={toasts} onClose={close} />
    </div>
  )
}

export default AdminLayout