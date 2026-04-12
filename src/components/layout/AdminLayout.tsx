import { useState } from 'react'
import { NavLink, Outlet, useLocation, useNavigate } from 'react-router-dom'
import {
  LayoutDashboard,
  Users,
  Eye,
  CalendarCheck,
  Wallet,
  Receipt,
  CalendarDays,
  LogOut,
  Menu,
  X,
} from 'lucide-react'
import { useAuthStore } from '../../stores/auth.store'

const NAV_ITEMS = [
  { label: 'Dashboard', path: '/admin', icon: LayoutDashboard },
  { label: 'Members', path: '/admin/members', icon: Users },
  { label: 'Eyeballs', path: '/admin/eyeballs', icon: Eye },
  { label: 'Attendance', path: '/admin/attendance', icon: CalendarCheck },
  { label: 'Contributions', path: '/admin/contributions', icon: Wallet },
  { label: 'Expenses', path: '/admin/expenses', icon: Receipt },
  { label: 'Events', path: '/admin/events', icon: CalendarDays },
]

const AdminLayout = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false)

  const logout = useAuthStore((s) => s.logout)
  const navigate = useNavigate()
  const location = useLocation()

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
    <div className="h-dvh overflow-hidden bg-slate-50 text-slate-950">
      <div className="flex h-full min-w-0">
        {sidebarOpen && (
          <button
            type="button"
            aria-label="Close sidebar"
            className="fixed inset-0 z-40 bg-slate-950/30 backdrop-blur-sm lg:hidden"
            onClick={() => setSidebarOpen(false)}
          />
        )}

        <aside
          className={`
            fixed inset-y-0 left-0 z-50 flex h-dvh w-72 flex-col
            border-r border-slate-200 bg-white shadow-2xl shadow-slate-200/60
            transition-transform duration-300 ease-out
            lg:static lg:z-auto lg:w-72 lg:translate-x-0 lg:shadow-none
            ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'}
          `}
        >
          <div className="flex h-20 shrink-0 items-center justify-between border-b border-slate-100 px-5">
            <div className="min-w-0">
              <h1 className="truncate text-xl font-black tracking-tight text-slate-950">
                MNDA<span className="text-sky-500">SOX</span>
              </h1>
              <p className="mt-0.5 text-xs font-medium text-slate-400">
                Admin Console
              </p>
            </div>

            <button
              type="button"
              aria-label="Close sidebar"
              className="rounded-xl p-2 text-slate-400 transition hover:bg-slate-100 hover:text-slate-700 lg:hidden"
              onClick={() => setSidebarOpen(false)}
            >
              <X size={20} />
            </button>
          </div>

          <nav className="min-h-0 flex-1 overflow-y-auto px-4 py-4">
            <p className="mb-2 px-3 text-[10px] font-bold uppercase tracking-[0.18em] text-slate-400">
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
                    className={({ isActive }) => `
                      group relative flex min-w-0 items-center gap-2.5 rounded-xl px-3 py-2
                      text-[13px] font-medium transition-all duration-200
                      ${
                        isActive
                          ? 'bg-sky-50 text-sky-700'
                          : 'text-slate-500 hover:bg-slate-50 hover:text-slate-900'
                      }
                    `}
                  >
                    {({ isActive }) => (
                      <>
                        <span
                          className={`
                            absolute left-0 top-1/2 h-5 w-0.5 -translate-y-1/2 rounded-full
                            ${isActive ? 'bg-sky-500' : 'bg-transparent'}
                          `}
                        />

                        <Icon
                          size={16}
                          strokeWidth={isActive ? 2.25 : 2}
                          className={`
                            shrink-0 transition-colors
                            ${
                              isActive
                                ? 'text-sky-600'
                                : 'text-slate-400 group-hover:text-slate-700'
                            }
                          `}
                        />

                        <span className="truncate">{item.label}</span>
                      </>
                    )}
                  </NavLink>
                )
              })}
            </div>
          </nav>

          <div className="shrink-0 border-t border-slate-100 p-4">
            <div className="mb-3 rounded-2xl bg-slate-50 p-3">
              <div className="flex items-center gap-3">
                <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-linear-to-br from-sky-500 to-blue-600 text-xs font-bold text-white shadow-sm">
                  A
                </div>

                <div className="min-w-0">
                  <p className="truncate text-sm font-bold text-slate-900">
                    Admin User
                  </p>
                  <p className="truncate text-xs font-medium text-slate-400">
                    MNDA SOX MC
                  </p>
                </div>
              </div>
            </div>

            <button
              type="button"
              onClick={handleLogout}
              className="
                flex w-full items-center justify-center gap-2 rounded-xl border border-slate-200
                bg-white px-4 py-2.5 text-[13px] font-semibold text-slate-600 transition-all
                hover:border-red-100 hover:bg-red-50 hover:text-red-600
              "
            >
              <LogOut size={16} />
              Sign out
            </button>
          </div>
        </aside>

        <div className="flex min-w-0 flex-1 flex-col">
          <header className="flex h-20 shrink-0 items-center justify-between gap-4 border-b border-slate-200 bg-white/90 px-4 backdrop-blur-xl sm:px-6 lg:px-8">
            <div className="flex min-w-0 items-center gap-3">
              <button
                type="button"
                aria-label="Open sidebar"
                className="rounded-xl border border-slate-200 bg-white p-2.5 text-slate-600 shadow-sm transition hover:bg-slate-50 hover:text-slate-950 lg:hidden"
                onClick={() => setSidebarOpen(true)}
              >
                <Menu size={20} />
              </button>

              <div className="min-w-0">
                <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-sky-500">
                  Admin
                </p>
                <h2 className="truncate text-xl font-black tracking-tight text-slate-950 sm:text-2xl">
                  {currentTitle}
                </h2>
              </div>
            </div>

            <div className="flex shrink-0 items-center gap-3">
              <div className="hidden text-right sm:block">
                <p className="text-sm font-bold text-slate-900">Admin User</p>
                <p className="text-xs font-medium text-slate-400">
                  MNDA SOX MC
                </p>
              </div>

              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-linear-to-br from-sky-500 to-blue-600 text-sm font-black text-white shadow-sm shadow-sky-200">
                A
              </div>
            </div>
          </header>

          <main className="min-h-0 flex-1 overflow-y-auto overflow-x-hidden">
            <div className="mx-auto w-full max-w-7xl px-4 py-5 sm:px-6 sm:py-6 lg:px-8 lg:py-8">
              <Outlet />
            </div>
          </main>
        </div>
      </div>
    </div>
  )
}

export default AdminLayout