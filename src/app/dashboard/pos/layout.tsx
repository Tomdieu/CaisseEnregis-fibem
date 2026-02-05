'use client'

import { useState } from 'react'
import { useSession } from 'next-auth/react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import {
  LayoutDashboard,
  ShoppingCart,
  Settings,
  LogOut,
  BarChart3,
  Package,
  Users,
  Receipt
} from 'lucide-react'

// POS-specific sidebar items
const posSidebarItems = [
  { icon: LayoutDashboard, label: 'Tableau de bord', href: '/dashboard/pos' },
  { icon: ShoppingCart, label: 'Nouvelle vente', href: '/dashboard/pos/sales' },
  { icon: Package, label: 'Gestion des produits', href: '/dashboard/pos/products' },
  { icon: Users, label: 'Clients', href: '/dashboard/pos/customers' },
  { icon: BarChart3, label: 'Rapports', href: '/dashboard/pos/reports' },
  { icon: Receipt, label: 'Reçus', href: '/dashboard/pos/receipts' },
  { icon: Settings, label: 'Paramètres', href: '/dashboard/pos/settings' },
]

export default function POSDashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const { data: session } = useSession()
  const pathname = usePathname()
  const [sidebarOpen, setSidebarOpen] = useState(false)

  const handleLogout = async () => {
    const { signOut } = await import('next-auth/react')
    signOut({ redirectTo: '/connexion' })
  }

  // Function to check if the current route matches the item's href or is a child route
  const isActiveRoute = (href: string) => {
    // Check if pathname is defined before using startsWith
    if (!pathname) return false;
    // Check if the current path starts with the href (for parent/child relationships)
    return pathname === href || pathname.startsWith(href + '/');
  };

  return (
    <div className="min-h-screen bg-gray-100 flex">
      {/* Sidebar */}
      <aside className={`fixed inset-y-0 left-0 z-50 w-64 bg-white shadow-lg transform ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'} lg:translate-x-0 transition-transform duration-200`}>
        <div className="h-full flex flex-col">
          <div className="p-4 border-b">
            <Link href="/" className="flex items-center gap-2">
              <div className="w-10 h-10 bg-blue-600 rounded-lg flex items-center justify-center">
                <span className="text-white font-bold">FB</span>
              </div>
              <div>
                <h1 className="text-blue-600 font-bold">FIBEM POS</h1>
                <p className="text-xs text-gray-500">Caisse enregistreuse</p>
              </div>
            </Link>
          </div>

          <nav className="flex-1 p-4 overflow-y-auto">
            <ul className="space-y-1">
              {posSidebarItems.map((item) => {
                const isActive = isActiveRoute(item.href);
                return (
                  <li key={item.label}>
                    <Link
                      href={item.href}
                      className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${
                        isActive
                          ? 'bg-blue-100 text-blue-600 border-l-4 border-l-blue-600'
                          : 'text-gray-600 hover:bg-gray-100'
                      }`}
                    >
                      <item.icon className={`w-5 h-5 ${isActive ? 'text-blue-600' : ''}`} />
                      <span className="flex-1">{item.label}</span>
                    </Link>
                  </li>
                );
              })}
            </ul>
          </nav>

          <div className="p-4 border-t space-y-4">
            <Link href={"/dashboard/pos"} className="flex items-center gap-3">
              <div className="w-10 h-10 bg-blue-600 rounded-full flex items-center justify-center text-white font-bold">
                {session?.user?.first_name?.[0]}{session?.user?.last_name?.[0]}
              </div>
              <div>
                <p className="font-medium text-gray-800 text-sm">
                  {session?.user?.first_name} {session?.user?.last_name}
                </p>
                <p className="text-xs text-gray-500">POS Admin</p>
              </div>
            </Link>
            <button
              onClick={handleLogout}
              className="w-full flex items-center gap-3 px-4 cursor-pointer py-2 rounded-lg text-red-600 hover:bg-red-50 transition-colors text-sm"
            >
              <LogOut className="w-4 h-4" />
              Déconnexion
            </button>
          </div>
        </div>
      </aside>

      {/* Mobile sidebar backdrop */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/50 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Main content */}
      <main className="flex-1 lg:ml-64">
        {/* Top bar */}
        <div className="bg-white shadow-sm p-4 flex items-center justify-between sticky top-0 z-30">
          <button
            className="lg:hidden p-2"
            onClick={() => setSidebarOpen(!sidebarOpen)}
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          </button>
          <h2 className="text-xl font-bold text-gray-800">Caisse enregistreuse</h2>
          <div className="flex items-center gap-4">
            <div className="flex items-center text-sm text-gray-600">
              <div className="w-2 h-2 rounded-full bg-green-500 mr-2"></div>
              En ligne
            </div>
          </div>
        </div>

        <div className="p-6">
          {children}
        </div>
      </main>
    </div>
  )
}