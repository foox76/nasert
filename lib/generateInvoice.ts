import { jsPDF } from "jspdf";

interface InvoiceItem {
    name: string;
    qty: number;
    price: number;
    total: number;
}

interface InvoiceData {
    clientName: string;
    date: string;
    items: InvoiceItem[];
    totalDue: number;
    notes?: string;
}

export const generateInvoice = async (data: InvoiceData) => {
    const doc = new jsPDF();

    // Font settings
    doc.setFont("helvetica", "normal");

    // Header / Logo Placeholder
    doc.setFontSize(22);
    doc.setTextColor(35, 93, 58); // Deep Matcha Green
    doc.text("ConsignKeep", 20, 20);

    doc.setFontSize(10);
    doc.setTextColor(100);
    doc.text("Premium Matcha Distributor", 20, 26);

    // Divider
    doc.setDrawColor(200);
    doc.line(20, 30, 190, 30);

    // Bill To
    doc.setFontSize(12);
    doc.setTextColor(0);
    doc.text("Bill To:", 20, 45);
    doc.setFont("helvetica", "bold");
    doc.text(data.clientName, 20, 52);
    doc.setFont("helvetica", "normal");

    // Invoice Details
    doc.text(`Date: ${data.date}`, 140, 45);
    doc.text(`Invoice #: INV-${Date.now().toString().slice(-6)}`, 140, 52);

    // Table Header
    const startY = 70;
    doc.setFillColor(240, 250, 240); // Light Green bg
    doc.rect(20, startY, 170, 10, "F");
    doc.setFont("helvetica", "bold");
    doc.text("Description", 25, startY + 7);
    doc.text("Qty", 100, startY + 7);
    doc.text("Price", 130, startY + 7);
    doc.text("Total", 160, startY + 7);

    // Table Rows
    let currentY = startY + 20;
    doc.setFont("helvetica", "normal");

    data.items.forEach((item) => {
        doc.text(`${item.name}`, 25, currentY);
        doc.text(item.qty.toString(), 100, currentY);
        doc.text(`${item.price.toFixed(3)} OMR`, 130, currentY); // Updated to OMR with 3 decimals usually used in Oman, but user just said OMR. Let's stick to 3 decimals for OMR standard.
        doc.text(`${item.total.toFixed(3)} OMR`, 160, currentY);
        currentY += 10;
    });

    // Total
    currentY += 10;
    doc.setDrawColor(200);
    doc.line(20, currentY - 10, 190, currentY - 10);

    doc.setFont("helvetica", "bold");
    doc.setFontSize(14);
    doc.text("Total Due:", 120, currentY);
    doc.text(`${data.totalDue.toFixed(3)} OMR`, 155, currentY); // Adjusted X for longer currency string

    // Notes if any
    if (data.notes) {
        currentY += 20;
        doc.setFontSize(10);
        doc.setFont("helvetica", "italic");
        doc.text(`Notes: ${data.notes}`, 20, currentY);
    }

    // Footer / Terms
    doc.setFontSize(10);
    doc.setFont("helvetica", "normal");
    doc.setTextColor(100);

    const bottomY = 280;
    doc.text("Payment Terms: Due upon receipt", 20, bottomY);
    doc.text("Thank you for your business!", 20, bottomY + 6);

    doc.save(`Invoice_${data.clientName.replace(/\s+/g, '_')}_${data.date}.pdf`);
};
