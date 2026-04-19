import { Outlet } from 'react-router-dom'

const PublicLayout = () => {
  return (
    <>
      <Outlet />
    </>
    // <div className="min-h-screen bg-[#f7f5f2] flex flex-col">

    //   {/* Navbar */}
    //   <header className="h-14 bg-white border-b border-stone-200 flex items-center justify-between px-6">
    //     <Link to="/" className="font-serif text-lg text-[#1a1a18]">
    //       MDNA : ZONE KORONADAL
    //     </Link>
    //     <nav className="flex items-center gap-6">
    //       <Link to="/events"       className="text-sm text-stone-500 hover:text-[#1a1a18] transition-colors">Events</Link>
    //       <Link to="/transparency" className="text-sm text-stone-500 hover:text-[#1a1a18] transition-colors">Transparency</Link>
    //       <Link to="/login"        className="text-sm bg-[#1a1a18] text-white px-4 py-1.5 rounded-lg hover:bg-stone-800 transition-colors">Admin</Link>
    //     </nav>
    //   </header>

    //   {/* Page content */}
    //   <main className="flex-1">
    //     <Outlet />
    //   </main>

    //   {/* Footer */}
    //   <footer className="border-t border-stone-200 bg-white px-6 py-4">
    //     <p className="text-xs text-stone-400 text-center">
    //       MDNA KORONADAL © {new Date().getFullYear()} — Build to inspire.
    //     </p>
    //   </footer>

    // </div>
  )
}

export default PublicLayout