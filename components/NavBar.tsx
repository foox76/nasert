"use client"

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { Home, Users, Package, ShoppingBag } from 'lucide-react'

export default function NavBar() {
    const pathname = usePathname()

    const isActive = (path: string) => {
        if (path === '/' && pathname === '/') return true
        if (path !== '/' && pathname.startsWith(path)) return true
        return false
    }

    const navItems = [
        { label: 'الرئيسية', path: '/', icon: Home },
        { label: 'العملاء', path: '/visit', icon: Users },
        { label: 'المخزون', path: '/inventory', icon: Package },
        { label: 'المنتجات', path: '/products', icon: ShoppingBag },
    ]

    return (
        <div className="fixed bottom-6 left-0 right-0 z-50 pointer-events-none px-6">
            <div className="max-w-md mx-auto">
                {/* Vibrant Floating Dock: Solid Deep Green to contrast with Mint BG */}
                <nav className="bg-[#14532d] shadow-2xl shadow-green-900/40 rounded-[2rem] pointer-events-auto flex justify-between items-center h-20 px-8 relative overflow-hidden">

                    {/* Decorative Glow */}
                    <div className="absolute top-0 inset-x-0 h-px bg-white/20"></div>

                    {navItems.map((item) => {
                        const active = isActive(item.path)
                        return (
                            <Link
                                key={item.label}
                                href={item.path}
                                className={`group flex flex-col items-center justify-center relative transition-all duration-500 ${active ? 'text-white' : 'text-green-200/60 hover:text-green-100'
                                    }`}
                            >
                                {/* Icon */}
                                <item.icon
                                    className={`relative z-10 w-7 h-7 transition-all duration-300 ${active ? 'scale-110 drop-shadow-md' : 'group-hover:scale-110'}`}
                                    strokeWidth={active ? 2.5 : 2}
                                />
                            </Link>
                        )
                    })}
                </nav>
            </div>
        </div>
    )
}
