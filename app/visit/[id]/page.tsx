"use client"

import { useState, useEffect, useRef } from 'react'
import { useParams, useRouter } from 'next/navigation'
import Link from 'next/link'
import { ChevronRight, Share2, Plus, Minus, History, ClipboardList, PenLine, Save, ArrowRight } from 'lucide-react'
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { generateInvoice } from '@/lib/generateInvoice'
import { Textarea } from "@/components/ui/textarea"
import {
    Drawer,
    DrawerClose,
    DrawerContent,
    DrawerDescription,
    DrawerFooter,
    DrawerHeader,
    DrawerTitle,
    DrawerTrigger,
} from "@/components/ui/drawer"
import { Badge } from "@/components/ui/badge"
import { useToast } from "@/hooks/use-toast"
import { Toaster } from "@/components/ui/toaster"
import { supabase } from '@/lib/supabaseClient'
import { InvoiceTemplate } from '@/components/InvoiceTemplate'

export default function VisitPage() {
    const params = useParams()
    const router = useRouter()
    const { toast } = useToast()
    const clientId = params.id as string

    // State
    const [client, setClient] = useState<any>(null)
    const [products, setProducts] = useState<any[]>([])
    const [history, setHistory] = useState<any[]>([])
    const [counts, setCounts] = useState<{ [key: string]: string }>({})
    const [restocks, setRestocks] = useState<{ [key: string]: string }>({})
    const [notes, setNotes] = useState('')
    const [isSubmitOpen, setIsSubmitOpen] = useState(false)
    const [loading, setLoading] = useState(true)
    const invoiceRef = useRef<HTMLDivElement>(null)

    // Load Data
    useEffect(() => {
        const loadall = async () => {
            setLoading(true)
            await Promise.all([fetchClient(), fetchProducts(), fetchHistory()])
            setLoading(false)
        }
        if (clientId) loadall()
    }, [clientId])

    const fetchClient = async () => {
        const { data, error } = await supabase
            .from('clients')
            .select('*')
            .eq('id', clientId)
            .single()
        if (!error && data) setClient(data)
    }

    const fetchProducts = async () => {
        // 1. Fetch inventory items
        const { data: inventoryData, error: inventoryError } = await supabase
            .from('inventory')
            .select('*')
            .order('name')

        if (inventoryError || !inventoryData) {
            console.error('Error fetching inventory:', inventoryError)
            return
        }

        // 2. Fetch the LAST visit for this client
        const { data: lastVisitData, error: lastVisitError } = await supabase
            .from('visits')
            .select('id')
            .eq('client_id', clientId)
            .order('visit_date', { ascending: false })
            .limit(1)
            .single()

        let lastVisitItems: any[] = []

        if (!lastVisitError && lastVisitData) {
            // 3. Fetch items from that last visit
            const { data: itemsData, error: itemsError } = await supabase
                .from('visit_items')
                .select('*')
                .eq('visit_id', lastVisitData.id)

            if (!itemsError && itemsData) {
                lastVisitItems = itemsData
            }
        }

        // 4. Merge data
        const mergedProducts = inventoryData.map(p => {
            const lastItem = lastVisitItems.find(item => item.product_id === p.id)
            // Expected = Last Actual + Last Restock. Default to 0 if no history.
            const expected = lastItem ? (lastItem.actual_qty + lastItem.restock_qty) : 0
            return {
                ...p,
                expected: expected
            }
        })

        setProducts(mergedProducts)
    }

    const fetchHistory = async () => {
        const { data, error } = await supabase
            .from('visits')
            .select('*')
            .eq('client_id', clientId)
            .order('visit_date', { ascending: false })
            .limit(5)
        if (!error && data) setHistory(data)
    }

    // Calculations
    const getSoldQty = (pId: string, expected: number) => {
        const val = counts[pId]
        if (val === undefined || val === '') return 0
        const actual = parseInt(val)
        if (isNaN(actual)) return 0
        return Math.max(0, expected - actual)
    }

    const getRestockQty = (pId: string) => {
        const val = restocks[pId]
        if (!val) return 0
        const qty = parseInt(val)
        return isNaN(qty) ? 0 : qty
    }

    const getTotalDue = () => {
        let total = 0
        products.forEach(p => {
            const price = p.price || 0
            const sold = getSoldQty(p.id, p.expected)
            total += sold * price
        })
        return total
    }

    const getReviewItems = () => {
        const items: any[] = []
        products.forEach(p => {
            const sold = getSoldQty(p.id, p.expected)
            const price = p.price || 0
            if (sold > 0) items.push({ name: `${p.name} (Sold)`, qty: sold, price: price, total: sold * price })

            const restock = getRestockQty(p.id)
            if (restock > 0) items.push({ name: `${p.name} (Restock)`, qty: restock, price: 0, total: 0 })
        })
        return items
    }

    const handleSaveVisit = async () => {
        try {
            const totalDue = getTotalDue()

            // 1. Create Visit Record
            const { data: visitData, error: visitError } = await supabase
                .from('visits')
                .insert([{
                    client_id: clientId,
                    notes: notes,
                    total_due: totalDue,
                    status: 'completed',
                    visit_date: new Date().toISOString()
                }])
                .select()
                .single()

            if (visitError) throw visitError
            const visitId = visitData.id

            // 2. Create Visit Items
            const visitItems = products
                .map(p => {
                    const countInput = counts[p.id]
                    const restock = getRestockQty(p.id)

                    // Logic: If user didn't enter an actual count, assume nothing sold (Actual = Expected)
                    const actualStock = (countInput === undefined || countInput === '')
                        ? p.expected
                        : parseInt(countInput)

                    const sold = Math.max(0, p.expected - actualStock)

                    if (countInput === '' && restock === 0 && sold === 0) return null

                    return {
                        visit_id: visitId,
                        product_id: p.id,
                        expected_qty: p.expected,
                        actual_qty: actualStock,
                        restock_qty: restock,
                        sold_qty: sold
                    }
                })
                .filter(Boolean)

            if (visitItems.length > 0) {
                const { error: itemsError } = await supabase
                    .from('visit_items')
                    .insert(visitItems)
                if (itemsError) throw itemsError
            }

            // 3. Update Client Last Visit
            await supabase
                .from('clients')
                .update({ last_visited: new Date().toISOString() })
                .eq('id', clientId)

            toast({
                title: "تم حفظ الزيارة!",
                description: "تم تسجيل البيانات بنجاح في قاعدة البيانات.",
                className: "bg-green-700 text-white rounded-2xl"
            })

            // Refresh history
            fetchHistory()

            // REAL-TIME UPDATE: 
            // Update local products state so 'expected' reflects what we just saved.
            // This allows the user to see the "New Total" as the new "Current" stock immediately.
            setProducts(prevProducts => prevProducts.map(p => {
                const item = visitItems.find(vi => vi?.product_id === p.id)
                if (item) {
                    return { ...p, expected: item.actual_qty! + item.restock_qty! }
                }
                return p
            }))

            // Reset inputs for the "next" possible interaction on this profile
            setCounts({})
            setRestocks({})
            setNotes('')
            setIsSubmitOpen(false)

        } catch (error) {
            console.error('Error saving visit:', error)
            toast({
                title: "خطأ",
                description: "حدث خطأ أثناء حفظ الزيارة.",
                variant: "destructive"
            })
        }
    }

    const handleInvoice = async () => {
        if (!invoiceRef.current) return

        try {
            toast({
                title: "Generating Invoice...",
                description: "Creating your professional PDF. Please wait.",
                className: "bg-blue-600 text-white rounded-2xl"
            })

            const fileName = `Invoice_${client?.name.replace(/\s+/g, '_') || 'Client'}_${new Date().toLocaleDateString('en-GB').replace(/\//g, '-')}`

            // Execute invoice generation first while data is still in state
            await generateInvoice(invoiceRef.current, fileName)

            // Then save the visit (which clears state and refreshes history)
            await handleSaveVisit()

        } catch (error) {
            console.error('Invoice generation failed:', error)
            toast({
                title: "Download Failed",
                description: "We couldn't generate the PDF. Please try again.",
                variant: "destructive"
            })
        }
    }

    if (loading) return <div className="min-h-screen flex items-center justify-center text-gray-400">تحميل...</div>
    if (!client) return <div className="min-h-screen flex items-center justify-center text-gray-400">لم يتم العثور على العميل</div>

    return (
        <div className="min-h-screen pb-40" dir="rtl">
            <Toaster />

            {/* 1. Curved Header Section */}
            <div className="bg-curve-header pb-12 pt-8 px-6 shadow-xl relative z-10 text-white">
                <div className="flex items-start justify-between mb-2">
                    <div>
                        <Link href="/visit">
                            <Button variant="ghost" size="sm" className="bg-white/10 hover:bg-white/20 text-white rounded-full pr-2 pl-4 h-10 backdrop-blur-md mb-4 border border-white/10">
                                <ArrowRight className="h-4 w-4 ml-2" />
                                العودة للقائمة
                            </Button>
                        </Link>
                        <h1 className="text-3xl font-extrabold tracking-tight mb-1">{client.name}</h1>
                        <div className="flex items-center text-green-100 opacity-90 text-sm font-medium">
                            <span className="ml-2">{client.address}</span>
                            <span className="w-1.5 h-1.5 rounded-full bg-green-300 inline-block mr-2"></span>
                            <span className="mr-2">زيارة نشطة</span>
                        </div>
                    </div>

                    <div className="bg-white/20 w-12 h-12 rounded-2xl flex items-center justify-center text-2xl font-bold backdrop-blur-sm border border-white/10">
                        {client.name.charAt(0)}
                    </div>
                </div>
            </div>

            <div className="px-6 -mt-8 relative z-20">

                {/* Tabs - Floating White Pill Style */}
                <Tabs defaultValue="audit" className="w-full">
                    <TabsList className="grid w-full grid-cols-4 h-16 bg-white shadow-float rounded-[2rem] p-2 mb-6 border border-gray-100/50">
                        <TabsTrigger value="audit" className="rounded-[1.5rem] font-bold text-xs data-[state=active]:bg-green-100 data-[state=active]:text-green-800 data-[state=active]:shadow-none transition-all h-full">الجرد</TabsTrigger>
                        <TabsTrigger value="restock" className="rounded-[1.5rem] font-bold text-xs data-[state=active]:bg-green-100 data-[state=active]:text-green-800 data-[state=active]:shadow-none transition-all h-full">التعبئة</TabsTrigger>
                        <TabsTrigger value="notes" className="rounded-[1.5rem] font-bold text-xs data-[state=active]:bg-green-100 data-[state=active]:text-green-800 data-[state=active]:shadow-none transition-all h-full">الملاحظات</TabsTrigger>
                        <TabsTrigger value="history" className="rounded-[1.5rem] font-bold text-xs data-[state=active]:bg-green-100 data-[state=active]:text-green-800 data-[state=active]:shadow-none transition-all h-full">السجل</TabsTrigger>
                    </TabsList>

                    <TabsContent value="audit" className="space-y-4">
                        <div className="px-2 mb-2 flex justify-between items-end">
                            <p className="text-sm text-gray-400 font-bold uppercase tracking-widest">فحص المخزون</p>
                        </div>
                        {products.map(p => (
                            <Card key={p.id} className="border-none shadow-polish-md hover:shadow-float transition-all bg-white rounded-[2rem] overflow-hidden">
                                <CardContent className="p-0">
                                    <div className="p-5 border-b border-gray-50 flex justify-between items-center bg-gray-50/30">
                                        <span className="font-bold text-lg text-gray-900">{p.name}</span>
                                        <Badge variant="secondary" className="bg-green-100 text-green-700 font-bold border-none px-3 py-1 rounded-xl">المتوقع: {p.expected}</Badge>
                                    </div>
                                    <div className="p-6 flex items-center justify-between gap-6">
                                        <div className="space-y-2 text-center w-1/3">
                                            <Label className="text-xs text-gray-400 font-bold uppercase">العدد الفعلي</Label>
                                            <Input
                                                type="number"
                                                inputMode="numeric"
                                                className="h-14 w-full text-center text-xl font-bold border-none bg-gray-100 rounded-2xl focus:ring-4 focus:ring-green-100 transition-all"
                                                placeholder="0"
                                                value={counts[p.id] || ''}
                                                onChange={(e) => setCounts({ ...counts, [p.id]: e.target.value })}
                                            />
                                        </div>
                                        <div className="flex-1 text-left pl-2 bg-green-50/50 p-3 rounded-2xl border border-green-50">
                                            <p className="text-xs text-green-800/60 font-bold uppercase mb-1">المبيعات المحسوبة</p>
                                            <p className="text-3xl font-extrabold text-green-700">{getSoldQty(p.id, p.expected)}</p>
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>
                        ))}
                    </TabsContent>

                    <TabsContent value="restock" className="space-y-4">
                        <div className="px-2 mb-2">
                            <p className="text-sm text-gray-400 font-bold uppercase tracking-widest">تجديد المخزون</p>
                        </div>
                        {products.map(p => (
                            <Card key={p.id} className="border-none shadow-polish-md hover:shadow-float transition-all bg-white rounded-[2rem] overflow-hidden">
                                <div className="p-5 flex justify-between items-center">
                                    <div className="flex-1">
                                        <span className="font-bold text-lg text-gray-900 block mb-1">{p.name}</span>
                                        <span className="text-sm text-gray-400 font-bold bg-gray-100 px-2 py-1 rounded-lg">الحالي: {p.expected} وحدة</span>
                                    </div>
                                    <div className="flex flex-col items-end gap-2">
                                        <div className="flex items-center gap-3 bg-gray-50 p-1.5 rounded-2xl">
                                            <Button size="icon" variant="ghost" className="h-10 w-10 rounded-xl hover:bg-white hover:text-red-500 text-gray-400" onClick={() => {
                                                const curr = getRestockQty(p.id)
                                                setRestocks({ ...restocks, [p.id]: (curr - 1).toString() })
                                            }}>
                                                <Minus className="h-5 w-5" />
                                            </Button>
                                            <Input
                                                className="h-10 w-16 text-center border-none bg-white rounded-xl font-bold text-lg shadow-sm"
                                                type="number"
                                                inputMode="numeric"
                                                value={restocks[p.id] || ''}
                                                placeholder="0"
                                                onChange={(e) => setRestocks({ ...restocks, [p.id]: e.target.value })}
                                            />
                                            <Button size="icon" variant="ghost" className="h-10 w-10 rounded-xl hover:bg-white hover:text-green-600 text-gray-400" onClick={() => {
                                                const curr = getRestockQty(p.id)
                                                setRestocks({ ...restocks, [p.id]: (curr + 1).toString() })
                                            }}>
                                                <Plus className="h-5 w-5" />
                                            </Button>
                                        </div>
                                        {/* New Total Preview */}
                                        <div className="text-left">
                                            {(() => {
                                                const base = counts[p.id] === undefined || counts[p.id] === '' ? p.expected : parseInt(counts[p.id])
                                                const restock = getRestockQty(p.id)
                                                if (restock !== 0) {
                                                    return (
                                                        <p className="text-[10px] font-bold text-green-600 bg-green-50 px-2 py-0.5 rounded-full">
                                                            {base} (Current) + {restock} (Adjustment) = {base + restock} Total
                                                        </p>
                                                    )
                                                }
                                                return null
                                            })()}
                                        </div>
                                    </div>
                                </div>
                            </Card>
                        ))}
                    </TabsContent>

                    <TabsContent value="notes">
                        <Card className="border-none shadow-polish-md bg-white rounded-[2rem]">
                            <CardContent className="p-6 space-y-3">
                                <Label className="text-gray-500 font-bold">ملاحظات الزيارة</Label>
                                <Textarea
                                    placeholder="اكتب ملاحظاتك هنا..."
                                    className="min-h-[150px] border-none bg-gray-100 rounded-2xl resize-none text-right focus:ring-0 text-lg p-4"
                                    value={notes}
                                    onChange={(e) => setNotes(e.target.value)}
                                />
                            </CardContent>
                        </Card>
                    </TabsContent>

                    <TabsContent value="history" className="space-y-4">
                        {history.length === 0 ? (
                            <div className="text-center text-gray-400 py-10">لا يوجد سجل زيارات سابق.</div>
                        ) : (
                            history.map(h => (
                                <Card key={h.id} className="border-none shadow-polish-sm bg-white rounded-[2rem]">
                                    <div className="p-6 flex justify-between items-center">
                                        <div>
                                            <p className="font-bold text-lg text-gray-900 mb-1">{new Date(h.visit_date).toLocaleDateString('en-GB')}</p>
                                            <p className="text-sm text-gray-400 font-bold bg-gray-50 px-2 py-1 rounded-lg inline-block">مكتملة</p>
                                        </div>
                                        <div className="text-left">
                                            <p className="font-bold text-xl text-green-700">{(h.total_due || 0).toFixed(3)} ر.ع.</p>
                                        </div>
                                    </div>
                                </Card>
                            ))
                        )}
                    </TabsContent>
                </Tabs>
            </div>

            {/* Footer / Complete Action */}
            <div className="fixed bottom-28 left-6 right-6 z-20">
                <Drawer open={isSubmitOpen} onOpenChange={setIsSubmitOpen}>
                    <DrawerTrigger asChild>
                        <div className="bg-[#1a1f1c] rounded-[2rem] p-3 shadow-2xl flex items-center justify-between pr-8 pl-3 cursor-pointer transition-transform active:scale-95 border border-white/5 hover:shadow-black/20">
                            <div>
                                <p className="text-green-400/80 text-xs uppercase tracking-wider font-bold mb-0.5 text-right">المبلغ المستحق</p>
                                <p className="text-2xl font-bold text-white text-right">{getTotalDue().toFixed(3)} <span className="text-sm font-normal text-green-400">ر.ع.</span></p>
                            </div>
                            <Button
                                size="lg"
                                className="h-14 px-8 rounded-[1.5rem] bg-[#00d775] hover:bg-[#00c068] text-green-950 shadow-lg pointer-events-none"
                            >
                                <span className="font-bold text-base ml-2">إنهاء</span>
                                <ClipboardList className="h-5 w-5" />
                            </Button>
                        </div>
                    </DrawerTrigger>
                    <DrawerContent className="bg-gray-50 rounded-t-[3rem]" dir="rtl">
                        <div className="mx-auto w-full max-w-sm">
                            <DrawerHeader className="mb-4">
                                <DrawerTitle className="font-extrabold text-3xl text-center text-gray-900">ملخص الزيارة</DrawerTitle>
                            </DrawerHeader>
                            <div className="px-4 pb-4 space-y-4">
                                <Card className="border-none shadow-polish-sm bg-white rounded-3xl">
                                    <CardContent className="p-6 space-y-3">
                                        <div className="flex justify-between text-sm text-gray-400 border-b border-gray-100 pb-2 font-bold uppercase tracking-wider">
                                            <span>الصنف</span>
                                            <span>الإجمالي</span>
                                        </div>
                                        {getReviewItems().map((item, idx) => (
                                            <div key={idx} className="flex justify-between font-bold text-gray-700 text-lg">
                                                <span>{item.qty}x {item.name}</span>
                                                <span>{item.total.toFixed(3)}</span>
                                            </div>
                                        ))}
                                        {getReviewItems().length === 0 && <p className="text-center text-gray-400 py-4 font-medium">لا توجد مبيعات.</p>}
                                        <div className="flex justify-between border-t border-gray-100 pt-3 text-xl font-extrabold text-green-700">
                                            <span>المجموع</span>
                                            <span>{getTotalDue().toFixed(3)} ر.ع.</span>
                                        </div>
                                    </CardContent>
                                </Card>
                            </div>
                            <DrawerFooter className="gap-3">
                                <Button onClick={handleInvoice} className="h-16 rounded-[2rem] bg-green-700 hover:bg-green-800 text-xl shadow-lg font-bold text-white">
                                    <Share2 className="ml-2 h-6 w-6" /> مشاركة الفاتورة وحفظ
                                </Button>
                                <Button onClick={handleSaveVisit} variant="outline" className="h-14 rounded-[2rem] border-none bg-white text-gray-500 font-bold hover:bg-gray-100">
                                    حفظ فقط
                                </Button>
                            </DrawerFooter>
                        </div>
                    </DrawerContent>
                </Drawer>
            </div>

            {/* Hidden Invoice Template for PDF generation */}
            <div className="fixed -left-[2000px] top-0">
                <div ref={invoiceRef}>
                    <InvoiceTemplate
                        data={{
                            clientName: client?.name || 'Client',
                            date: new Date().toLocaleDateString('en-GB'),
                            invoiceNumber: `INV-${Date.now().toString().slice(-6)}`,
                            items: getReviewItems().map(item => ({
                                name: item.name,
                                qty: item.qty,
                                price: item.price,
                                total: item.total
                            })),
                            totalDue: getTotalDue(),
                            notes: notes
                        }}
                    />
                </div>
            </div>
        </div>
    )
}
