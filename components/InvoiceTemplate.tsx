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
        <div className="print:block print:w-full bg-white p-12 font-sans text-slate-900" dir="ltr">
            {/* Header: Clean & Spaced */}
            <div className="flex justify-between items-start border-b border-slate-100 pb-10 mb-10">
                <div>
                    <h1 className="text-5xl font-black text-green-700 tracking-tighter mb-2">INVOICE</h1>
                    <p className="text-slate-400 text-xs font-bold uppercase tracking-widest">Original Document</p>
                </div>
                <div className="text-right">
                    <h2 className="text-2xl font-black text-slate-900 leading-tight">Luqman Dawood<br />Al Hadrami</h2>
                    <div className="mt-4 space-y-1 text-slate-500 text-sm font-medium">
                        <p>Sultanate of Oman, Muscat</p>
                        <p>Phone: +968 1234 5678</p>
                        <p>info@loqmancoffee.com</p>
                    </div>
                </div>
            </div>

            {/* Info Grid: Minimalist */}
            <div className="grid grid-cols-2 gap-20 mb-16">
                <div>
                    <label className="block text-[10px] font-black text-slate-300 uppercase tracking-[0.2em] mb-3">Bill To</label>
                    <p className="text-2xl font-black text-slate-900">{data.clientName}</p>
                </div>
                <div className="flex justify-end gap-12 text-right">
                    <div>
                        <label className="block text-[10px] font-black text-slate-300 uppercase tracking-[0.2em] mb-2">Invoice No</label>
                        <p className="text-lg font-black text-slate-900">{data.invoiceNumber}</p>
                    </div>
                    <div>
                        <label className="block text-[10px] font-black text-slate-300 uppercase tracking-[0.2em] mb-2">Issue Date</label>
                        <p className="text-lg font-black text-slate-900">{data.date}</p>
                    </div>
                </div>
            </div>

            {/* Table: Modern Layout */}
            <div className="mb-16">
                <table className="w-full">
                    <thead>
                        <tr className="border-b-2 border-slate-900">
                            <th className="py-4 text-left text-[10px] font-black text-slate-900 uppercase tracking-widest">Description</th>
                            <th className="py-4 text-center text-[10px] font-black text-slate-900 uppercase tracking-widest">Qty</th>
                            <th className="py-4 text-center text-[10px] font-black text-slate-900 uppercase tracking-widest">Price</th>
                            <th className="py-4 text-right text-[10px] font-black text-slate-900 uppercase tracking-widest">Total</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                        {data.items.map((item, idx) => (
                            <tr key={idx}>
                                <td className="py-6 text-base font-bold text-slate-900">{item.name}</td>
                                <td className="py-6 text-center text-base font-medium text-slate-500">{item.qty}</td>
                                <td className="py-6 text-center text-base font-medium text-slate-500">{item.price.toFixed(3)}</td>
                                <td className="py-6 text-right text-base font-black text-slate-900">{item.total.toFixed(3)}</td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            {/* Summary Section: Off-center for better balance */}
            <div className="flex justify-end">
                <div className="w-80 space-y-4">
                    <div className="flex justify-between items-baseline pt-4 border-t-4 border-green-600">
                        <span className="text-sm font-black text-slate-400 uppercase tracking-widest">Total Due</span>
                        <span className="text-4xl font-black text-green-700">{data.totalDue.toFixed(3)} <span className="text-xs">OMR</span></span>
                    </div>
                    <div className="bg-slate-50 p-4 rounded-xl">
                        <p className="text-[10px] text-center text-slate-400 font-bold uppercase tracking-widest">Payment Terms: Due upon receipt</p>
                    </div>
                </div>
            </div>

            {/* Global Footer: Integrated Design */}
            <div className="fixed bottom-12 left-12 right-12 text-center border-t border-slate-100 pt-8">
                <p className="text-green-700 font-black text-sm uppercase tracking-[0.25em] mb-1">Thank you for choosing Luqman Coffee</p>
                <p className="text-slate-300 text-[10px] font-bold uppercase tracking-widest">Premium Matcha Distributor • Sultanate of Oman</p>
            </div>
        </div>
    )
}
