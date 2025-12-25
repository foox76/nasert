import { jsPDF } from "jspdf";
import html2canvas from "html2canvas";

export const generateInvoice = async (element: HTMLElement, fileName: string) => {
    console.time("generateInvoice");
    try {
        const canvas = await html2canvas(element, {
            scale: 2,
            useCORS: true,
            logging: true, // Enable logging for debugging
            backgroundColor: "#ffffff"
        });

        const imgData = canvas.toDataURL("image/png");
        const pdf = new jsPDF({
            orientation: "portrait",
            unit: "mm",
            format: "a4"
        });

        const imgProps = pdf.getImageProperties(imgData);
        const pdfWidth = pdf.internal.pageSize.getWidth();
        const pdfHeight = (imgProps.height * pdfWidth) / imgProps.width;

        pdf.addImage(imgData, "PNG", 0, 0, pdfWidth, pdfHeight);
        pdf.save(`${fileName}.pdf`);
        console.timeEnd("generateInvoice");
    } catch (error) {
        console.error("Error generating PDF:", error);
        console.timeEnd("generateInvoice");
        throw error; // Re-throw so the caller knows it failed
    }
};
