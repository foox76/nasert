"use client"

import { useState, useEffect } from 'react'
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
        // Fetch inventory items to sell/restock
        const { data, error } = await supabase
            .from('inventory')
            .select('*')
            .order('name')
        if (!error && data) {
            // Add 'expected' property for UI logic (default 0 for new visit)
            // In a real advanced app, we would look up the LAST visit's stock for this client
            setProducts(data.map(p => ({ ...p, expected: 0 })))
        }
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
        // Simple logic: If we expected 10 and count 5 -> Sold 5.
        // For now, since we don't track 'expected' per client perfectly yet,
        // we can assume 'expected' is what they SHOULD have, but if it starts at 0, this logic is tricky.
        // simplified workflow: User just enters "Sold" or "Restock" directly?
        // OR: User enters "Count (Actual)". If Expected=0, then Sold=0.

        // Let's stick to the UI: User enters "Actual". 
        // If we don't know expected, we can't calc sold automatically unless user updates expected.
        // For this V1, let's assume 'expected' is 0, so 'sold' is 0 unless we manually override?
        // Actually, let's change the logic slightly for usability:
        // Audit Tab: "Previous Stock" (Expected) vs "Current Count" (Actual) -> Sold
        // Since we don't have previous stock yet, let's just allow them to input "Sold" directly?
        // No, the UI shows "Actual".

        // Temporary fix: Expected is 0. If Actual is entered, we just record Actual.
        // Sold = Expected - Actual. If Expected < Actual, maybe they bought from elsewhere?

        const actual = parseInt(counts[pId] || '')
        if (isNaN(actual)) return 0
        return Math.max(0, expected - actual)
    }

    const getRestockQty = (pId: string) => {
        const qty = parseInt(restocks[pId] || '0')
        return isNaN(qty) ? 0 : qty
    }

    const getTotalDue = () => {
        let total = 0
        products.forEach(p => {
            // Price check
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
                    const actual = parseInt(counts[p.id] || '0')
                    const restock = parseInt(restocks[p.id] || '0')
                    const sold = getSoldQty(p.id, p.expected)

                    if (actual === 0 && restock === 0 && sold === 0) return null

                    return {
                        visit_id: visitId,
                        product_id: p.id,
                        expected_qty: p.expected,
                        actual_qty: actual,
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
        // Save first
        await handleSaveVisit()

        // Then generate PDF
        const items = getReviewItems()
        const invoiceData = {
            clientName: client?.name || 'Client',
            date: new Date().toLocaleDateString('en-US'),
            items: items,
            totalDue: getTotalDue(),
            notes: notes
        }
        await generateInvoice(invoiceData)
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
                                    <div className="flex items-center gap-3 bg-gray-50 p-1.5 rounded-2xl">
                                        <Button size="icon" variant="ghost" className="h-10 w-10 rounded-xl hover:bg-white hover:text-red-500 text-gray-400" onClick={() => {
                                            const curr = parseInt(restocks[p.id] || '0')
                                            if (curr > 0) setRestocks({ ...restocks, [p.id]: (curr - 1).toString() })
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
                                            const curr = parseInt(restocks[p.id] || '0') || 0
                                            setRestocks({ ...restocks, [p.id]: (curr + 1).toString() })
                                        }}>
                                            <Plus className="h-5 w-5" />
                                        </Button>
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

        </div>
    )
}
