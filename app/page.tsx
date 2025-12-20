"use client"

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Plus, Package, DollarSign, TrendingUp, ChevronLeft } from 'lucide-react'
import { supabase } from '@/lib/supabaseClient'

export default function Home() {
  const [stats, setStats] = useState({
    totalRevenue: 0,
    totalStock: 0,
    activeSites: 0
  })
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function fetchStats() {
      try {
        setLoading(true)

        // 1. Total Revenue (Sum of all completed visits)
        // Note: For large datasets, use .count() or SQL function. For now, fetch & sum is fine for small scale.
        const { data: visits } = await supabase
          .from('visits')
          .select('total_due')
          .eq('status', 'completed')

        const totalRevenue = visits?.reduce((acc, curr) => acc + (curr.total_due || 0), 0) || 0

        // 2. Total Stock (Sum of inventory stock)
        const { data: inventory } = await supabase
          .from('inventory')
          .select('stock')

        const totalStock = inventory?.reduce((acc, curr) => acc + (curr.stock || 0), 0) || 0

        // 3. Active Sites (Clients visited at least once? Or just total clients?)
        // Let's just show Total Clients for now
        const { count: clientCount } = await supabase
          .from('clients')
          .select('*', { count: 'exact', head: true })

        setStats({
          totalRevenue,
          totalStock,
          activeSites: clientCount || 0
        })

      } catch (error) {
        console.error('Error fetching dashboard stats:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchStats()
  }, [])

  return (
    <main className="min-h-screen relative font-sans text-right" dir="rtl">

      {/* Header */}
      <header className="px-6 pt-12 pb-6 flex justify-between items-end">
        <div>
          <p className="text-sm font-medium text-green-800/60 uppercase tracking-widest mb-1">مرحباً بك مجدداً</p>
          <h1 className="text-2xl font-serif font-bold text-green-900">Luqman Dawood Al Hadrami</h1>
        </div>
        <div className="h-12 w-12 rounded-full bg-green-900 text-white flex items-center justify-center font-serif text-xl border-2 border-green-100 shadow-md">
          ل
        </div>
      </header>

      <div className="px-6 space-y-6">
        {/* Total Revenue Card - Premium Look */}
        <Card className="border-none shadow-soft overflow-hidden relative group rounded-3xl h-48">
          <div className="absolute inset-0 bg-gradient-to-br from-green-900 to-green-800 transition-all duration-500 group-hover:scale-105" />
          <div className="absolute left-0 top-0 h-40 w-40 bg-green-700/30 rounded-full -ml-10 -mt-10 blur-3xl" />
          <div className="absolute right-0 bottom-0 h-32 w-32 bg-yellow-500/10 rounded-full -mr-10 -mb-10 blur-2xl" />

          <CardContent className="relative p-7 text-white flex flex-col justify-between h-full">
            <div className="flex justify-between items-start">
              <div>
                <p className="text-green-100/80 text-sm font-medium mb-1">إجمالي الإيرادات (الكل)</p>
                <h2 className="text-4xl font-bold text-white tracking-tight flex items-baseline gap-1">
                  {loading ? '...' : stats.totalRevenue.toFixed(3)} <span className="text-lg text-green-200/80 font-normal">ر.ع.</span>
                </h2>
              </div>
              <div className="bg-white/10 p-2.5 rounded-2xl backdrop-blur-md border border-white/5">
                <DollarSign className="h-6 w-6 text-green-50" />
              </div>
            </div>

            <div className="flex items-center gap-2 text-green-50 text-xs bg-green-800/40 w-fit px-3 py-1.5 rounded-full border border-green-700/30 backdrop-blur-sm">
              <TrendingUp className="h-3.5 w-3.5" />
              <span>مبيعات موثقة</span>
            </div>
          </CardContent>
        </Card>

        {/* Stock Status Card */}
        <div className="grid grid-cols-1 gap-4">
          <Card className="border-none shadow-soft glass-card rounded-3xl">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-bold text-gray-500 uppercase tracking-wider">
                المخزون المتوفر
              </CardTitle>
              <Package className="h-5 w-5 text-green-700" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-green-900 font-serif">
                {loading ? '...' : stats.totalStock} وحدة
              </div>
              <p className="text-sm text-gray-500 mt-1">
                {loading ? '...' : `لدى ${stats.activeSites} عملاء`}
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Quick Actions */}
        <div className="pt-2">
          <h3 className="text-lg font-bold text-green-900 mb-4 font-serif">إجراءات سريعة</h3>
          <Link href="/visit">
            <Button size="lg" className="w-full h-20 bg-white hover:bg-green-50/50 text-green-950 border-0 shadow-soft rounded-3xl flex items-center justify-between group transition-all duration-300 px-6">
              <span className="flex items-center gap-4">
                <span className="bg-green-100 p-3 rounded-2xl text-green-700 group-hover:bg-green-200 transition-colors shadow-inner">
                  <Plus className="h-6 w-6" />
                </span>
                <span className="font-bold text-lg">زيارة جديدة</span>
              </span>
              <ChevronLeft className="h-5 w-5 text-gray-300 group-hover:text-green-600 transition-colors" />
            </Button>
          </Link>
        </div>
      </div>
    </main>
  )
}
