import { RouterProvider } from 'react-router-dom'
import { useAuth } from './hooks/useAuth'
import { router } from './router'

const AppInner = () => {
  useAuth()
  return <RouterProvider router={router} />
}

const App = () => <AppInner />

export default App