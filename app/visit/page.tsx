"use client"

import { useState, useEffect, useMemo } from 'react'
import Link from 'next/link'
import { Input } from "@/components/ui/input"
import { Card, CardContent } from "@/components/ui/card"
import { Search, MapPin, ChevronLeft, Plus, Phone, MessageCircle, Clock, Package, Filter, Check, Navigation, Edit, Map } from 'lucide-react'
import { Button } from "@/components/ui/button"
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
    DialogFooter,
} from "@/components/ui/dialog"
import {
    Select,
    SelectContent,
    SelectGroup,
    SelectItem,
    SelectLabel,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select"
import { Label } from "@/components/ui/label"
import { supabase } from '@/lib/supabaseClient'

const OMAN_LOCATIONS = {
    "مسقط": ["المعبيلة", "الخوض", "الموالح", "العذيبة", "الغبرة", "القرم", "بوشر", "روي", "العامرات"],
    "الباطنة": ["صحار", "الرستاق", "بركاء", "المصنعة"],
    "الداخلية": ["نزوى", "بهلاء", "إزكي"],
    "الشرقية": ["صور", "إبراء", "بدية"],
    "ظفار": ["صلالة", "طاقة", "مرباط"]
}

export default function ClientList() {
    const [searchTerm, setSearchTerm] = useState('')
    const [sortOrder, setSortOrder] = useState('newest_visit')
    const [locationFilter, setLocationFilter] = useState('all')
    const [clients, setClients] = useState<any[]>([])
    const [loading, setLoading] = useState(true)

    // Dialog State
    const [isDialogOpen, setIsDialogOpen] = useState(false)
    const [editingId, setEditingId] = useState<string | null>(null)

    const [formData, setFormData] = useState({
        name: '',
        address: '',
        phone: '',
        maps_link: ''
    })

    useEffect(() => {
        fetchClients()
    }, [])

    const fetchClients = async () => {
        try {
            setLoading(true)
            const { data, error } = await supabase
                .from('clients')
                .select('*')
                .order('created_at', { ascending: false })

            if (error) throw error
            setClients(data || [])
        } catch (error) {
            console.error('Error fetching clients:', error)
        } finally {
            setLoading(false)
        }
    }

    // -- Helpers --
    const getTimeSince = (dateString: string) => {
        if (!dateString) return 'لم تتم الزيارة'
        const date = new Date(dateString)
        const now = new Date()
        const diffTime = Math.abs(now.getTime() - date.getTime())
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))

        if (diffDays === 0 || diffDays === 1) return 'اليوم'
        if (diffDays === 2) return 'أمس'
        if (diffDays < 30) return `منذ ${diffDays} يوم`
        const diffMonths = Math.floor(diffDays / 30)
        return `منذ ${diffMonths} شهر`
    }

    // Dynamic Location List for Filter
    const availableLocations = useMemo(() => {
        const locs = new Set(clients.map(c => c.address).filter(Boolean))
        return Array.from(locs).sort()
    }, [clients])

    // Filter Logic
    const filteredClients = clients.filter(client => {
        const matchesSearch = client.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
            (client.address && client.address.toLowerCase().includes(searchTerm.toLowerCase()))

        const matchesLocation = locationFilter === 'all' || client.address === locationFilter

        return matchesSearch && matchesLocation
    })

    // Sort
    const sortedClients = [...filteredClients].sort((a, b) => {
        switch (sortOrder) {
            case 'newest_visit':
                // Handle nulls by putting them last
                if (!a.last_visited) return 1
                if (!b.last_visited) return -1
                return new Date(b.last_visited).getTime() - new Date(a.last_visited).getTime()
            case 'oldest_visit':
                if (!a.last_visited) return 1
                if (!b.last_visited) return -1
                return new Date(a.last_visited).getTime() - new Date(b.last_visited).getTime()
            // case 'high_stock': ... (Needs logic if we track stock on client level)
            default:
                return 0
        }
    })

    // Handlers
    const handleAddNew = () => {
        setEditingId(null)
        setFormData({ name: '', address: '', phone: '', maps_link: '' })
        setIsDialogOpen(true)
    }

    const handleEdit = (client: any) => {
        setEditingId(client.id)
        setFormData({
            name: client.name,
            address: client.address || '',
            phone: client.phone || '',
            maps_link: client.maps_link || ''
        })
        setIsDialogOpen(true)
    }

    const handleSave = async () => {
        if (!formData.name) return

        try {
            if (editingId) {
                // Edit Mode
                const { error } = await supabase
                    .from('clients')
                    .update(formData)
                    .eq('id', editingId)

                if (error) throw error

                // Optimistic Update
                setClients(clients.map(c => c.id === editingId ? { ...c, ...formData } : c))
            } else {
                // Create Mode
                const { data, error } = await supabase
                    .from('clients')
                    .insert([formData])
                    .select()

                if (error) throw error

                if (data) {
                    setClients([data[0], ...clients])
                }
            }
            setIsDialogOpen(false)
        } catch (error) {
            console.error('Error saving client:', error)
        }
    }

    return (
        <div className="min-h-screen pb-32" dir="rtl">

            {/* 1. Curved Header Background */}
            <div className="bg-curve-header pb-12 pt-8 px-6 shadow-xl relative z-10 text-white">
                <div className="flex items-center justify-between mb-8">
                    <h1 className="text-3xl font-extrabold tracking-tight">قائمة العملاء</h1>

                    <Button size="icon" onClick={handleAddNew} className="bg-white/20 hover:bg-white/30 text-white rounded-full h-12 w-12 backdrop-blur-md border border-white/10 shadow-lg">
                        <Plus className="h-6 w-6" />
                    </Button>
                </div>

                <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                    <DialogContent className="sm:max-w-md rounded-[2.5rem]" dir="rtl">
                        <DialogHeader className="text-right">
                            <DialogTitle className="font-extrabold text-2xl">
                                {editingId ? 'تعديل بيانات المقهى' : 'إضافة مقهى جديد'}
                            </DialogTitle>
                        </DialogHeader>
                        <div className="space-y-4 py-4">
                            <div className="space-y-2">
                                <Label htmlFor="name" className="text-gray-500 font-bold">اسم المتجر</Label>
                                <Input
                                    id="name"
                                    placeholder="مثال: قهوة الصباح"
                                    className="h-14 bg-gray-100 border-transparent focus:bg-white transition-all rounded-2xl text-right"
                                    value={formData.name}
                                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="address" className="text-gray-500 font-bold">موقع المتجر</Label>
                                <Select
                                    value={formData.address}
                                    onValueChange={(val) => setFormData({ ...formData, address: val })}
                                >
                                    <SelectTrigger className="h-14 bg-gray-100 border-transparent focus:bg-white transition-all rounded-2xl text-right" dir="rtl">
                                        <SelectValue placeholder="اختر المنطقة" />
                                    </SelectTrigger>
                                    <SelectContent dir="rtl" className="max-h-[300px] rounded-2xl">
                                        {Object.entries(OMAN_LOCATIONS).map(([region, cities]) => (
                                            <SelectGroup key={region}>
                                                <SelectLabel className="font-bold text-green-700">{region}</SelectLabel>
                                                {cities.map(city => (
                                                    <SelectItem key={city} value={city} className="cursor-pointer">{city}</SelectItem>
                                                ))}
                                            </SelectGroup>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="phone" className="text-gray-500 font-bold">رقم الهاتف</Label>
                                <Input
                                    id="phone"
                                    placeholder="مثال: 99123456"
                                    className="h-14 bg-gray-100 border-transparent focus:bg-white transition-all rounded-2xl text-right"
                                    value={formData.phone}
                                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                                />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="maps" className="text-gray-500 font-bold">رابط جوجل ماب (اختياري)</Label>
                                <Input
                                    id="maps"
                                    placeholder="https://maps.google.com/..."
                                    className="h-14 bg-gray-100 border-transparent focus:bg-white transition-all rounded-2xl text-right dir-ltr"
                                    value={formData.maps_link}
                                    onChange={(e) => setFormData({ ...formData, maps_link: e.target.value })}
                                />
                            </div>
                        </div>
                        <DialogFooter>
                            <Button type="submit" onClick={handleSave} className="w-full h-14 rounded-2xl bg-green-700 hover:bg-green-800 text-white font-bold text-lg">
                                {editingId ? 'حفظ التعديلات' : 'إضافة العميل'}
                            </Button>
                        </DialogFooter>
                    </DialogContent>
                </Dialog>

                {/* Search Pill: Floating half-in header */}
                <div className="relative group">
                    <div className="absolute inset-y-0 right-0 pr-4 flex items-center pointer-events-none">
                        <Search className="h-5 w-5 text-white/70" />
                    </div>
                    <Input
                        placeholder="بحث عن مقهى..."
                        className="pl-4 pr-12 h-14 bg-white/10 border-white/20 text-white placeholder:text-white/60 rounded-full backdrop-blur-sm focus:bg-white/20 transition-all text-lg font-medium"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                </div>
            </div>

            <div className="px-6 -mt-6 relative z-20 space-y-6">

                {/* Filters Row - White Pills floating over content */}
                <div className="flex gap-3 overflow-x-auto pb-2 no-scrollbar">
                    <Select value={sortOrder} onValueChange={setSortOrder}>
                        <SelectTrigger className="w-auto min-w-[140px] h-12 rounded-full border-none bg-white text-green-900 font-bold text-sm shadow-lg shadow-green-900/5 hover:scale-105 transition-transform" dir="rtl">
                            <SelectValue placeholder="الترتيب" />
                        </SelectTrigger>
                        <SelectContent dir="rtl" className="rounded-2xl border-none shadow-xl">
                            <SelectItem value="newest_visit" className="rounded-xl my-1">الأحدث زيارة</SelectItem>
                            <SelectItem value="oldest_visit" className="rounded-xl my-1">الأقدم زيارة</SelectItem>
                        </SelectContent>
                    </Select>

                    <Select value={locationFilter} onValueChange={setLocationFilter}>
                        <SelectTrigger className="w-auto min-w-[130px] h-12 rounded-full border-none bg-white text-green-900 font-bold text-sm shadow-lg shadow-green-900/5 hover:scale-105 transition-transform" dir="rtl">
                            <SelectValue placeholder="المنطقة" />
                        </SelectTrigger>
                        <SelectContent dir="rtl" className="rounded-2xl border-none shadow-xl">
                            <SelectItem value="all" className="rounded-xl my-1">كل المناطق</SelectItem>
                            {/* Dynamic Locations from Client List */}
                            {availableLocations.map(loc => (
                                <SelectItem key={loc as string} value={loc as string} className="rounded-xl my-1">{loc as string}</SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                </div>

                {/* Content */}
                <div className="space-y-5">
                    <div className="flex justify-between items-center px-2">
                        <p className="text-xs font-bold text-gray-400 uppercase tracking-widest">
                            {sortedClients.length} موقع
                        </p>
                    </div>

                    {loading ? (
                        <div className="text-center py-12 text-gray-400">جاري تحميل البيانات...</div>
                    ) : sortedClients.length === 0 ? (
                        <div className="text-center py-12 text-gray-400">لا يوجد عملاء. أضف واحداً جديداً!</div>
                    ) : (
                        sortedClients.map((client) => (
                            <Card key={client.id} className="group border-none shadow-polish-md hover:shadow-float transition-all duration-300 bg-white rounded-[2rem] overflow-hidden relative">
                                <CardContent className="p-6">
                                    <div className="flex justify-between items-start mb-6">
                                        <Link href={`/visit/${client.id}`} className="flex items-start gap-4 flex-1">
                                            <div className={`mt-2 h-14 w-14 rounded-2xl flex items-center justify-center ${client.status === 'green' ? 'bg-green-100 text-green-600' : 'bg-red-100 text-red-600'}`}>
                                                <span className="text-2xl font-bold">{client.name.charAt(0)}</span>
                                            </div>

                                            <div className="mt-1">
                                                <h3 className="text-xl font-bold text-gray-900 leading-tight mb-1">{client.name}</h3>
                                                <div className="flex items-center text-sm font-medium text-gray-400">
                                                    <MapPin className="h-4 w-4 ml-1.5 opacity-60" />
                                                    {client.address}
                                                </div>
                                            </div>
                                        </Link>

                                        {/* Actions Group: Chevron & Edit */}
                                        <div className="flex flex-col gap-2">
                                            <Button size="icon" variant="ghost" className="h-10 w-10 text-gray-300 hover:text-green-600 hover:bg-green-50 rounded-full" onClick={() => handleEdit(client)}>
                                                <Edit className="h-5 w-5" />
                                            </Button>
                                        </div>
                                    </div>

                                    <Link href={`/visit/${client.id}`} className="block">
                                        {/* Stats Row - Distinct Gray Pills */}
                                        <div className="flex gap-3 mb-6">
                                            <div className="flex items-center gap-2 bg-gray-50 px-4 py-3 rounded-2xl w-full justify-center">
                                                <Clock className="h-4 w-4 text-green-600" />
                                                <span className="text-sm font-bold text-gray-600">
                                                    {getTimeSince(client.last_visited)}
                                                </span>
                                            </div>
                                            {/* Note: Total Stock Logic would need a new table or query. Hiding for now or can default to 0 */}
                                            {/* <div className="flex items-center gap-2 bg-gray-50 px-4 py-3 rounded-2xl w-full justify-center">
                                                <Package className="h-4 w-4 text-green-600" />
                                                <span className="text-sm font-bold text-gray-600">
                                                    -- وحدة
                                                </span>
                                            </div> */}
                                        </div>
                                    </Link>

                                    {/* Actions Footer - Dark Buttons */}
                                    <div className="flex gap-3">
                                        <Button className="flex-1 h-14 rounded-2xl bg-gray-900 hover:bg-black text-green-400 font-bold text-lg shadow-lg active:scale-95 transition-all" asChild>
                                            <a href={`tel:${client.phone}`}>
                                                <Phone className="h-5 w-5 ml-2 fill-current" />
                                                اتصال
                                            </a>
                                        </Button>
                                        <Button className="flex-1 h-14 rounded-2xl bg-gray-900 hover:bg-black text-green-400 font-bold text-lg shadow-lg active:scale-95 transition-all" asChild>
                                            <a href={`https://wa.me/${client.phone}`} target="_blank" rel="noopener noreferrer">
                                                <MessageCircle className="h-5 w-5 ml-2 fill-current" />
                                                واتساب
                                            </a>
                                        </Button>
                                    </div>

                                    {/* Optional Google Maps Button - Sleek & Slick */}
                                    {client.maps_link && (
                                        <Button className="w-full mt-3 h-14 rounded-2xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-lg shadow-lg shadow-blue-900/20 active:scale-95 transition-all" asChild>
                                            <a href={client.maps_link} target="_blank" rel="noopener noreferrer">
                                                <Navigation className="h-5 w-5 ml-2 fill-current" />
                                                موقع المحل (Google Maps)
                                            </a>
                                        </Button>
                                    )}
                                </CardContent>
                            </Card>
                        ))
                    )}
                </div>
            </div>
        </div>
    )
}

