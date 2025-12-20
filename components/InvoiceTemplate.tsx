"use client"

import React from 'react'

interface InvoiceProps {
    data: {
        clientName: string;
        date: string;
        invoiceNumber: string;
        items: Array<{ name: string; qty: number; price: number; total: number }>;
        totalDue: number;
        notes?: string;
    }
}

export function InvoiceTemplate({ data }: InvoiceProps) {
    return (
        <div className="hidden print:block print:w-full bg-white p-10 font-sans text-gray-900" dir="rtl">
            {/* Header */}
            <div className="flex justify-between items-start border-b border-gray-100 pb-8 mb-8">
                <div className="text-right">
                    <h1 className="text-4xl font-extrabold text-green-800 tracking-tight mb-2">فاتورة ضريبية</h1>
                    <p className="text-gray-500 text-sm">نسخة أصلية</p>
                </div>
                <div className="text-left">
                    <h2 className="text-2xl font-bold text-gray-900">Luqman Dawood Al Hadrami</h2>
                    <p className="text-gray-500 text-sm mt-1">Sultanate of Oman, Muscat</p>
                    <p className="text-gray-500 text-sm">هاتف: 96812345678+</p>
                    <p className="text-gray-500 text-sm">info@loqmancoffee.com</p>
                </div>
            </div>

            {/* Info Grid */}
            <div className="grid grid-cols-2 gap-12 mb-12">
                <div className="space-y-4">
                    <div>
                        <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-1">بيانات العميل (Bill To)</p>
                        <p className="text-xl font-bold text-gray-900">{data.clientName}</p>
                    </div>
                </div>
                <div className="space-y-4 text-left">
                    <div className="flex justify-between border-b border-gray-50 pb-2">
                        <span className="text-gray-500 font-medium">رقم الفاتورة:</span>
                        <span className="font-bold text-gray-900">{data.invoiceNumber}</span>
                    </div>
                    <div className="flex justify-between border-b border-gray-50 pb-2">
                        <span className="text-gray-500 font-medium">تاريخ الإصدار:</span>
                        <span className="font-bold text-gray-900">{data.date}</span>
                    </div>
                </div>
            </div>

            {/* Table */}
            <div className="mb-12">
                <table className="w-full">
                    <thead>
                        <tr className="bg-green-50/50 border-b border-green-100">
                            <th className="py-4 px-4 text-right text-sm font-bold text-green-800 w-1/2">البيان / الصنف</th>
                            <th className="py-4 px-4 text-center text-sm font-bold text-green-800">الكمية</th>
                            <th className="py-4 px-4 text-center text-sm font-bold text-green-800">السعر</th>
                            <th className="py-4 px-4 text-left text-sm font-bold text-green-800">الإجمالي</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-50">
                        {data.items.map((item, idx) => (
                            <tr key={idx}>
                                <td className="py-4 px-4 text-gray-900 font-medium">{item.name}</td>
                                <td className="py-4 px-4 text-center text-gray-500">{item.qty}</td>
                                <td className="py-4 px-4 text-center text-gray-500">{item.price.toFixed(3)}</td>
                                <td className="py-4 px-4 text-left font-bold text-gray-900">{item.total.toFixed(3)}</td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            {/* Totals */}
            <div className="flex justify-end mb-12">
                <div className="w-1/2 bg-gray-50 rounded-2xl p-6 space-y-3">
                    <div className="flex justify-between items-center pb-3 border-b border-gray-200">
                        <span className="text-lg font-bold text-gray-900">الإجمالي المستحق</span>
                        <span className="text-2xl font-extrabold text-green-700">{data.totalDue.toFixed(3)} <span className="text-sm">ر.ع.</span></span>
                    </div>
                    <p className="text-xs text-gray-400 text-center pt-2">شروط الدفع: فور الاستلام</p>
                </div>
            </div>

            {/* Footer */}
            <div className="text-center border-t border-gray-100 pt-8 mt-auto">
                <p className="text-green-800 font-bold mb-1">شكراً لتعاملكم مع لقمان</p>
                <p className="text-gray-400 text-sm">نتطلع لخدمتكم مرة أخرى قريباً</p>
            </div>
        </div>
    )
}
