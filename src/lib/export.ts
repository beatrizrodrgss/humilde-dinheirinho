import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';

/**
 * Temporarily remove overflow constraints for better capture
 */
function prepareForExport(element: HTMLElement): () => void {
    const elementsToRestore: Array<{ element: HTMLElement, overflow: string, maxHeight: string }> = [];

    // Find all elements with overflow constraints
    const allElements = element.querySelectorAll('*');
    allElements.forEach((el) => {
        const htmlEl = el as HTMLElement;
        const computedStyle = window.getComputedStyle(htmlEl);

        if (computedStyle.overflow !== 'visible' ||
            computedStyle.overflowY !== 'visible' ||
            computedStyle.overflowX !== 'visible' ||
            computedStyle.maxHeight !== 'none') {

            elementsToRestore.push({
                element: htmlEl,
                overflow: htmlEl.style.overflow,
                maxHeight: htmlEl.style.maxHeight
            });

            htmlEl.style.overflow = 'visible';
            htmlEl.style.maxHeight = 'none';
        }
    });

    // Return cleanup function
    return () => {
        elementsToRestore.forEach(({ element, overflow, maxHeight }) => {
            element.style.overflow = overflow;
            element.style.maxHeight = maxHeight;
        });
    };
}

/**
 * Export an element as PNG image
 */
export async function exportAsPNG(elementId: string, filename: string): Promise<void> {
    const element = document.getElementById(elementId);
    if (!element) {
        throw new Error(`Element with id "${elementId}" not found`);
    }

    // Scroll to top before capturing
    window.scrollTo(0, 0);
    await new Promise(resolve => setTimeout(resolve, 100));

    // Prepare element for export
    const cleanup = prepareForExport(element);

    try {
        // Capture element as canvas
        const canvas = await html2canvas(element, {
            scale: 2,
            backgroundColor: '#ffffff',
            logging: false,
            useCORS: true,
            allowTaint: true,
            scrollY: 0,
            scrollX: 0,
            windowWidth: element.scrollWidth,
            windowHeight: element.scrollHeight
        });

        // Convert to blob and trigger download
        canvas.toBlob((blob) => {
            if (!blob) return;
            const url = URL.createObjectURL(blob);
            const link = document.createElement('a');
            link.href = url;
            link.download = `${filename}.png`;
            link.click();
            URL.revokeObjectURL(url);
        });
    } finally {
        // Restore original styles
        cleanup();
    }
}

/**
 * Export an element as PDF
 */
export async function exportAsPDF(elementId: string, filename: string): Promise<void> {
    const element = document.getElementById(elementId);
    if (!element) {
        throw new Error(`Element with id "${elementId}" not found`);
    }

    // Scroll to top before capturing
    window.scrollTo(0, 0);
    await new Promise(resolve => setTimeout(resolve, 100));

    // Prepare element for export
    const cleanup = prepareForExport(element);

    try {
        // Capture element as canvas
        const canvas = await html2canvas(element, {
            scale: 2,
            backgroundColor: '#ffffff',
            logging: false,
            useCORS: true,
            allowTaint: true,
            scrollY: 0,
            scrollX: 0,
            windowWidth: element.scrollWidth,
            windowHeight: element.scrollHeight
        });

        const imgData = canvas.toDataURL('image/png');

        // Calculate PDF dimensions - use landscape for wide content
        const imgRatio = canvas.width / canvas.height;
        const isLandscape = imgRatio > 1.2;

        const pdf = new jsPDF({
            orientation: isLandscape ? 'landscape' : 'portrait',
            unit: 'mm',
            format: 'a4'
        });

        const pageWidth = pdf.internal.pageSize.getWidth();
        const pageHeight = pdf.internal.pageSize.getHeight();

        // Calculate image dimensions to fit page with margins
        const margins = 10;
        const maxWidth = pageWidth - (2 * margins);
        const maxHeight = pageHeight - (2 * margins);

        let imgWidth = maxWidth;
        let imgHeight = (canvas.height * imgWidth) / canvas.width;

        // If image is too tall for one page, scale it down slightly
        if (imgHeight > maxHeight) {
            const ratio = maxHeight / imgHeight;
            imgHeight = maxHeight;
            imgWidth = imgWidth * ratio;
        }

        const fullImgHeight = (canvas.height * imgWidth) / canvas.width;
        let heightLeft = fullImgHeight;
        let position = margins;
        let page = 1;

        // Add first page
        pdf.addImage(imgData, 'PNG', margins, position, imgWidth, fullImgHeight);
        heightLeft -= (pageHeight - 2 * margins);

        // Add additional pages if content is taller
        while (heightLeft > 0) {
            pdf.addPage();
            page++;
            position = -(pageHeight * (page - 1)) + margins;
            pdf.addImage(imgData, 'PNG', margins, position, imgWidth, fullImgHeight);
            heightLeft -= pageHeight;
        }

        // Save PDF
        pdf.save(`${filename}.pdf`);
    } finally {
        // Restore original styles
        cleanup();
    }
}
