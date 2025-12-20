"use client"

import { useState, useEffect } from 'react'
import { Plus, DollarSign, Image as ImageIcon, MoreVertical, Pencil, Trash2, Package } from 'lucide-react'
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog"
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import { Card, CardContent } from "@/components/ui/card"
import { supabase } from '@/lib/supabaseClient'
import { useToast } from "@/hooks/use-toast"
import { Toaster } from "@/components/ui/toaster"

export default function ProductsPage() {
    const { toast } = useToast()
    const [products, setProducts] = useState<any[]>([])
    const [loading, setLoading] = useState(true)

    // Edit/Create State
    const [editingProduct, setEditingProduct] = useState<{ id: string | null, name: string, price: string, category: string } | null>(null)
    const [isDialogOpen, setIsDialogOpen] = useState(false)
    const [deleteId, setDeleteId] = useState<string | null>(null)

    useEffect(() => {
        fetchProducts()
    }, [])

    const fetchProducts = async () => {
        try {
            setLoading(true)
            const { data, error } = await supabase
                .from('inventory')
                .select('*')
                .order('name')

            if (error) throw error
            setProducts(data || [])
        } catch (error) {
            console.error('Error fetching products:', error)
        } finally {
            setLoading(false)
        }
    }

    const handleSaveProduct = async () => {
        if (!editingProduct?.name) return

        try {
            const productData = {
                name: editingProduct.name,
                price: parseFloat(editingProduct.price) || 0,
                // Default values for required fields in 'inventory' that might not be in this form
                category: editingProduct.category || 'General',
                stock: 0, // Default stock for new items
                min_level: 5,
                unit: 'pcs',
                status: 'good'
            }

            // Only update specific fields if editing, don't overwrite stock
            if (editingProduct.id) {
                const { error } = await supabase
                    .from('inventory')
                    .update({
                        name: productData.name,
                        price: productData.price,
                        category: productData.category
                        // Don't touch stock/min_level/unit here unless we add fields for them
                    })
                    .eq('id', editingProduct.id)

                if (error) throw error

                // Optimistic Update
                setProducts(products.map(p => p.id === editingProduct.id ? { ...p, ...productData } : p))
                toast({ title: "تم التحديث", description: "تم تحديث بيانات المنتج بنجاح." })
            } else {
                // Create
                const { data, error } = await supabase
                    .from('inventory')
                    .insert([productData])
                    .select()

                if (error) throw error
                if (data) {
                    setProducts([...products, data[0]])
                    toast({ title: "تمت الإضافة", description: "تم إضافة المنتج الجديد بنجاح." })
                }
            }

            setEditingProduct(null)
            setIsDialogOpen(false)
        } catch (error) {
            console.error('Error saving product:', error)
            toast({ variant: "destructive", title: "خطأ", description: "حدث خطأ أثناء حفظ المنتج." })
        }
    }

    const handleDelete = async () => {
        if (deleteId) {
            try {
                const { error } = await supabase
                    .from('inventory')
                    .delete()
                    .eq('id', deleteId)

                if (error) throw error

                setProducts(products.filter(p => p.id !== deleteId))
                setDeleteId(null)
                toast({ title: "تم الحذف", description: "تم حذف المنتج بنجاح." })
            } catch (error) {
                console.error('Error deleting product:', error)
                toast({ variant: "destructive", title: "خطأ", description: "حدث خطأ أثناء حذف المنتج." })
            }
        }
    }

    const openNew = () => {
        setEditingProduct({ id: null, name: '', price: '', category: 'General' })
        setIsDialogOpen(true)
    }

    const openEdit = (product: any) => {
        setEditingProduct({
            id: product.id,
            name: product.name,
            price: product.price?.toString() || '0',
            category: product.category || 'General'
        })
        setIsDialogOpen(true)
    }

    return (
        <div className="min-h-screen pb-24" dir="rtl">
            <Toaster />
            {/* Header */}
            <div className="bg-white/60 backdrop-blur-xl p-6 border-b border-white/20 sticky top-0 z-10 flex justify-between items-center">
                <div>
                    <h1 className="text-xl font-serif font-bold text-green-950 tracking-tight">المنتجات</h1>
                    <p className="text-sm text-gray-500 mt-1">إدارة الكتالوج والأسعار.</p>
                </div>

                <Button onClick={openNew} size="icon" className="rounded-full bg-green-900 hover:bg-green-800 shadow-lg h-10 w-10 border-2 border-green-100">
                    <Plus className="h-5 w-5 text-white" />
                </Button>
            </div>

            <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                <DialogContent className="sm:max-w-md rounded-3xl" dir="rtl">
                    <DialogHeader className="text-right">
                        <DialogTitle className="font-serif text-2xl text-green-900">
                            {editingProduct?.id ? 'تعديل المنتج' : 'إضافة منتج جديد'}
                        </DialogTitle>
                        <DialogDescription className="text-right">
                            {editingProduct?.id ? 'تحديث بيانات المنتج.' : 'سيظهر هذا المنتج أيضاً في قائمة المخزون.'}
                        </DialogDescription>
                    </DialogHeader>
                    <div className="space-y-4 py-4">
                        <div className="space-y-2">
                            <Label htmlFor="name" className="text-gray-500 font-bold">اسم المنتج</Label>
                            <Input
                                id="name"
                                placeholder="مثال: علبة ماتشا فاخرة"
                                className="h-12 border-gray-200 rounded-xl text-right"
                                value={editingProduct?.name || ''}
                                onChange={(e) => setEditingProduct(prev => prev ? ({ ...prev, name: e.target.value }) : null)}
                            />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="category" className="text-gray-500 font-bold">التصنيف</Label>
                            <Input
                                id="category"
                                placeholder="مثال: مواد خام"
                                className="h-12 border-gray-200 rounded-xl text-right"
                                value={editingProduct?.category || ''}
                                onChange={(e) => setEditingProduct(prev => prev ? ({ ...prev, category: e.target.value }) : null)}
                            />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="price" className="text-gray-500 font-bold">سعر الوحدة (ر.ع.)</Label>
                            <Input
                                id="price"
                                type="number"
                                placeholder="0.000"
                                className="h-12 border-gray-200 rounded-xl font-mono text-left ltr"
                                value={editingProduct?.price || ''}
                                onChange={(e) => setEditingProduct(prev => prev ? ({ ...prev, price: e.target.value }) : null)}
                            />
                        </div>
                    </div>
                    <DialogFooter className="gap-2 sm:gap-0">
                        <Button type="button" variant="secondary" onClick={() => setIsDialogOpen(false)} className="rounded-xl h-12 flex-1">إلغاء</Button>
                        <Button type="submit" onClick={handleSaveProduct} className="bg-green-900 hover:bg-green-800 rounded-xl h-12 px-8 flex-1">
                            {editingProduct?.id ? 'حفظ' : 'إضافة'}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            <AlertDialog open={!!deleteId} onOpenChange={(open) => !open && setDeleteId(null)}>
                <AlertDialogContent className="rounded-3xl" dir="rtl">
                    <AlertDialogHeader className="text-right">
                        <AlertDialogTitle className="text-green-900 font-serif text-xl">حذف المنتج؟</AlertDialogTitle>
                        <AlertDialogDescription className="text-right">
                            سيتم إزالة هذا المنتج من الكتالوج ومن المخزون نهائياً.
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter className="gap-2 sm:gap-0">
                        <AlertDialogCancel className="rounded-xl h-10 flex-1">إلغاء</AlertDialogCancel>
                        <AlertDialogAction onClick={handleDelete} className="rounded-xl h-10 bg-red-600 hover:bg-red-700 text-white flex-1">حذف</AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>

            <div className="p-6 grid gap-4 grid-cols-1 md:grid-cols-2">
                {loading ? (
                    <div className="col-span-full text-center py-10 text-gray-400">تحميل المنتجات...</div>
                ) : products.length === 0 ? (
                    <div className="col-span-full text-center py-10 text-gray-400">لا توجد منتجات. أضف أول منتج!</div>
                ) : (
                    products.map((product) => (
                        <Card key={product.id} className="border-none shadow-soft rounded-2xl overflow-hidden group hover:shadow-md transition-all duration-300 glass-card">
                            <CardContent className="p-0 flex flex-row-reverse">
                                <div className="w-24 bg-green-50/50 flex items-center justify-center text-green-200 border-r border-green-100/50">
                                    <Package className="h-8 w-8" />
                                </div>
                                <div className="p-4 flex-1 flex justify-between items-center bg-white/40">
                                    <div className="text-right">
                                        <h3 className="font-bold text-green-950 text-lg mb-1">{product.name}</h3>
                                        <div className="flex flex-wrap gap-2">
                                            <div className="flex items-center text-green-800 font-bold bg-green-50/80 w-fit px-2.5 py-1 rounded-lg text-sm border border-green-100">
                                                {(product.price || 0).toFixed(3)} ر.ع.
                                            </div>
                                            <div className="flex items-center text-gray-500 font-medium bg-gray-50 w-fit px-2 py-1 rounded-lg text-xs">
                                                {product.category}
                                            </div>
                                        </div>
                                    </div>
                                    <DropdownMenu>
                                        <DropdownMenuTrigger asChild>
                                            <Button variant="ghost" size="icon" className="h-8 w-8 text-gray-400">
                                                <MoreVertical className="h-4 w-4" />
                                            </Button>
                                        </DropdownMenuTrigger>
                                        <DropdownMenuContent align="end" className="rounded-xl">
                                            <DropdownMenuItem onClick={() => openEdit(product)} className="gap-2 p-2.5 cursor-pointer text-right">
                                                <Pencil className="h-4 w-4 text-gray-500" /> تعديل
                                            </DropdownMenuItem>
                                            <DropdownMenuItem onClick={() => setDeleteId(product.id)} className="gap-2 p-2.5 cursor-pointer text-red-600 focus:text-red-700 focus:bg-red-50 text-right">
                                                <Trash2 className="h-4 w-4" /> حذف
                                            </DropdownMenuItem>
                                        </DropdownMenuContent>
                                    </DropdownMenu>
                                </div>
                            </CardContent>
                        </Card>
                    ))
                )}

                {/* Add New Placeholder Card */}
                {!loading && (
                    <div
                        onClick={openNew}
                        className="border-2 border-dashed border-green-200 rounded-2xl p-6 flex flex-col items-center justify-center text-center gap-2 cursor-pointer hover:bg-green-50/30 hover:border-green-400 transition-colors py-10"
                    >
                        <div className="bg-green-100 p-3 rounded-full text-green-700">
                            <Plus className="h-6 w-6" />
                        </div>
                        <span className="font-bold text-green-900/60">إضافة منتج جديد</span>
                    </div>
                )}
            </div>
        </div>
    )
}
