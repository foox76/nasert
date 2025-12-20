"use client"

import { useState, useEffect } from 'react'
import { Plus, Search, Filter, ArrowUpDown, MoreHorizontal, AlertCircle, Trash2, Edit, Minus } from 'lucide-react'
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { supabase } from '@/lib/supabaseClient'
import { useToast } from "@/hooks/use-toast"
import { Toaster } from "@/components/ui/toaster"

export default function InventoryPage() {
    const { toast } = useToast()
    const [items, setItems] = useState<any[]>([])
    const [loading, setLoading] = useState(true)
    const [searchTerm, setSearchTerm] = useState('')
    const [editingItem, setEditingItem] = useState<any>(null)
    const [editStock, setEditStock] = useState('')

    useEffect(() => {
        fetchItems()
    }, [])

    const fetchItems = async () => {
        try {
            setLoading(true)
            const { data, error } = await supabase
                .from('inventory')
                .select('*')
                .order('name')

            if (error) {
                console.error('Error fetching inventory:', error)
            } else {
                setItems(data || [])
            }
        } catch (error) {
            console.error('Unexpected error:', error)
        } finally {
            setLoading(false)
        }
    }

    const openEdit = (item: any) => {
        setEditingItem(item)
        setEditStock(item.stock.toString())
    }

    const handleSaveStock = async () => {
        if (!editingItem) return

        try {
            const newStock = parseInt(editStock)
            const { error } = await supabase
                .from('inventory')
                .update({ stock: newStock })
                .eq('id', editingItem.id)

            if (error) {
                console.error('Error updating stock:', error)
                toast({ variant: "destructive", title: "خطأ", description: "فشل تحديث المخزون" })
            } else {
                setItems(items.map(item =>
                    item.id === editingItem.id ? { ...item, stock: newStock } : item
                ))
                toast({ title: "تم التحديث", description: "تم تحديث مستوى المخزون بنجاح" })
            }
        } catch (error) {
            console.error('Error in handleSaveStock:', error)
        }

        setEditingItem(null)
    }

    const handleDelete = async () => {
        if (!editingItem) return

        if (!confirm("هل أنت متأكد من حذف هذا الصنف نهائياً؟")) return

        try {
            const { error } = await supabase
                .from('inventory')
                .delete()
                .eq('id', editingItem.id)

            if (error) {
                console.error('Error deleting item:', error)
                toast({ variant: "destructive", title: "خطأ", description: "فشل حذف الصنف" })
            } else {
                setItems(items.filter(item => item.id !== editingItem.id))
                toast({ title: "تم الحذف", description: "تم حذف الصنف بنجاح" })
                setEditingItem(null)
            }
        } catch (error) {
            console.error('Error deleting:', error)
        }
    }

    const filteredItems = items.filter(item =>
        item.name.toLowerCase().includes(searchTerm.toLowerCase())
    )

    return (
        <div className="min-h-screen pb-32" dir="rtl">
            <Toaster />

            {/* 1. Curved Header Background */}
            <div className="bg-curve-header pb-12 pt-8 px-6 shadow-xl relative z-10 text-white">
                <div className="flex items-center justify-between mb-8">
                    <h1 className="text-3xl font-extrabold tracking-tight">إدارة المخزون</h1>

                    <div className="flex gap-2">
                        <Button size="icon" className="bg-white/20 hover:bg-white/30 text-white rounded-full h-12 w-12 backdrop-blur-md border border-white/10 shadow-lg">
                            <Filter className="h-5 w-5" />
                        </Button>
                        <Button size="icon" className="bg-white/20 hover:bg-white/30 text-white rounded-full h-12 w-12 backdrop-blur-md border border-white/10 shadow-lg">
                            <ArrowUpDown className="h-5 w-5" />
                        </Button>
                    </div>
                </div>

                {/* Search Pill */}
                <div className="relative group">
                    <div className="absolute inset-y-0 right-0 pr-4 flex items-center pointer-events-none">
                        <Search className="h-5 w-5 text-white/70" />
                    </div>
                    <Input
                        placeholder="بحث في المخزون..."
                        className="pl-4 pr-12 h-14 bg-white/10 border-white/20 text-white placeholder:text-white/60 rounded-full backdrop-blur-sm focus:bg-white/20 transition-all text-lg font-medium"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                </div>
            </div>

            <div className="px-6 -mt-6 relative z-20 space-y-6">

                {/* Stats Cards Row */}
                <div className="flex gap-4 overflow-x-auto pb-2 no-scrollbar">
                    <Card className="min-w-[140px] border-none shadow-polish-sm bg-white rounded-[1.5rem] p-4 flex flex-col justify-between h-32">
                        <div className="h-8 w-8 rounded-full bg-red-100 flex items-center justify-center text-red-600 mb-2">
                            <AlertCircle className="h-5 w-5" />
                        </div>
                        <div>
                            <p className="text-2xl font-extrabold text-gray-900">
                                {items.filter(i => i.status === 'critical').length}
                            </p>
                            <p className="text-xs font-bold text-gray-400 uppercase">نواقص حرجة</p>
                        </div>
                    </Card>
                    <Card className="min-w-[140px] border-none shadow-polish-sm bg-white rounded-[1.5rem] p-4 flex flex-col justify-between h-32">
                        <div className="h-8 w-8 rounded-full bg-green-100 flex items-center justify-center text-green-600 mb-2">
                            <Badge variant="outline" className="border-none p-0 text-green-600"><Plus className="h-5 w-5" /></Badge>
                        </div>
                        <div>
                            <p className="text-2xl font-extrabold text-gray-900">{items.length}</p>
                            <p className="text-xs font-bold text-gray-400 uppercase">إجمالي الأصناف</p>
                        </div>
                    </Card>
                </div>

                {/* Content List */}
                <div className="space-y-4">
                    <div className="flex justify-between items-center px-2">
                        <p className="text-xs font-bold text-gray-400 uppercase tracking-widest">
                            {filteredItems.length} صنف
                        </p>
                    </div>

                    {loading ? (
                        <div className="text-center py-10 text-gray-400">تحميل البيانات...</div>
                    ) : filteredItems.length === 0 ? (
                        <div className="text-center py-10 text-gray-400">لا توجد أصناف. (يمكنك إضافتها من صفحة المنتجات)</div>
                    ) : (
                        filteredItems.map((item) => (
                            <Card key={item.id} className="group border-none shadow-polish-md bg-white rounded-[2rem] overflow-hidden" onClick={() => openEdit(item)}>
                                <CardContent className="p-0">
                                    {/* Card Header Strip */}
                                    <div className={`h-1.5 w-full ${item.status === 'good' ? 'bg-green-400' : item.status === 'low' ? 'bg-amber-400' : 'bg-red-500'}`}></div>

                                    <div className="p-5 flex justify-between items-center">
                                        <div className="flex items-center gap-4">
                                            {/* Icon Placeholder */}
                                            <div className="h-12 w-12 rounded-2xl bg-gray-50 flex items-center justify-center border border-gray-100">
                                                <span className="text-xl font-bold text-gray-400">{item.name?.charAt(0)}</span>
                                            </div>
                                            <div>
                                                <h3 className="text-lg font-bold text-gray-900">{item.name}</h3>
                                                <p className="text-sm font-bold text-gray-400">{item.category}</p>
                                            </div>
                                        </div>
                                        <div className="text-left">
                                            <p className="text-xl font-extrabold text-gray-800">{item.stock}</p>
                                            <p className="text-xs font-bold text-gray-400 uppercase">{item.unit}</p>
                                        </div>
                                    </div>

                                    {/* Hidden Actions - could be swipe or expand */}
                                </CardContent>
                            </Card>
                        ))
                    )}
                </div>
            </div>

            <Dialog open={!!editingItem} onOpenChange={(open) => !open && setEditingItem(null)}>
                <DialogContent className="sm:max-w-md rounded-[2.5rem]" dir="rtl">
                    <DialogHeader className="text-right">
                        <DialogTitle className="font-extrabold text-2xl text-gray-900">تعديل المخزون</DialogTitle>
                        <DialogDescription className="text-right">
                            تحديث الكمية الحالية للصنف: {editingItem?.name}
                        </DialogDescription>
                    </DialogHeader>
                    <div className="space-y-6 py-6">
                        <div className="flex items-center justify-center gap-4">
                            <Button variant="outline" size="icon" className="h-14 w-14 rounded-2xl" onClick={() => setEditStock((prev) => (parseInt(prev || '0') - 1).toString())}>
                                <Minus className="h-6 w-6" />
                            </Button>
                            <div className="flex-1">
                                <Label htmlFor="stock" className="sr-only">Stock</Label>
                                <Input
                                    id="stock"
                                    type="number"
                                    className="h-16 text-center text-3xl font-extrabold border-none bg-gray-100 rounded-2xl"
                                    value={editStock}
                                    onChange={(e) => setEditStock(e.target.value)}
                                />
                            </div>
                            <Button variant="outline" size="icon" className="h-14 w-14 rounded-2xl" onClick={() => setEditStock((prev) => (parseInt(prev || '0') + 1).toString())}>
                                <Plus className="h-6 w-6" />
                            </Button>
                        </div>
                    </div>
                    <DialogFooter className="gap-2">
                        <Button variant="destructive" onClick={handleDelete} className="h-14 rounded-2xl flex-1 font-bold">
                            <Trash2 className="ml-2 h-5 w-5" /> حذف
                        </Button>
                        <Button type="submit" onClick={handleSaveStock} className="h-14 rounded-2xl bg-green-700 hover:bg-green-800 flex-[2] font-bold text-lg">حفظ التغييرات</Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    )
}
