import { createBrowserRouter } from 'react-router-dom'
import AdminLayout from './components/layout/AdminLayout'
import MembersPage from './features/members/MembersPage'
import EyeballsPage from './features/eyeballs/EyeballsPage'
import EyeballDetail from './features/eyeballs/EyeballDetail'
import AttendancePage from './features/attendance/AttendancePage'
import ContributionsPage from './features/contributions/ContributionPage'
import ExpensesPage from './features/expenses/ExpensesPage'
import DashboardPage from './features/dashboard/DashboardPage'
import EventsPage from './features/events/EventsPage'

import OrdersPage from './features/orders/OrdersPage'
import OrderDetail from './features/orders/OrderDetail'


import EventsPublicPage from './pages/EventsPublicPage'
import LandingPage from './pages/LandingPage'
import TransparencyPage from './pages/TransparencyPage'

import PublicLayout from './components/layout/PublicLayout'
import ProtectedRoute from './features/auth/ProtectedRoute'
import LoginPage from './features/auth/LoginPage'

export const router = createBrowserRouter([

  { path: '/login', element: <LoginPage /> },

  {
    element: <PublicLayout />,
    children: [
      { path: '/',             element: <LandingPage /> },
      { path: '/events',       element: <EventsPublicPage /> },
      { path: '/transparency', element: <TransparencyPage /> },
    ],
  },

  {
    element: (
      <ProtectedRoute>
        <AdminLayout />
      </ProtectedRoute>
    ),
    children: [
      { path: '/admin',                element: <DashboardPage /> },
      { path: '/admin/members',        element: <MembersPage /> },
      { path: '/admin/eyeballs',       element: <EyeballsPage /> },
      { path: '/admin/eyeballs/:id',   element: <EyeballDetail /> },
      { path: '/admin/attendance',     element: <AttendancePage /> },
      { path: '/admin/contributions',  element: <ContributionsPage /> },
      { path: '/admin/expenses',       element: <ExpensesPage /> },
      { path: '/admin/events',         element: <EventsPage /> },
      { path: '/admin/orders',     element: <OrdersPage /> },
      { path: '/admin/orders/:id', element: <OrderDetail /> },
    ],
  },
])