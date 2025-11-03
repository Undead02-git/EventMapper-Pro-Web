"use client";

import jsPDF from "jspdf";
import "jspdf-autotable";
import html2canvas from "html2canvas";
import type { Floor, Tag } from "@/lib/types";

// Extend jsPDF with the autoTable plugin
interface jsPDFWithAutoTable extends jsPDF {
    autoTable: (options: any) => jsPDFWithAutoTable;
}

export function usePdfExport() {
    const exportToPdf = async (floorData: Floor, allTags: Tag[]) => {
        const mapElement = document.getElementById("map-container-for-export");

        if (!mapElement) {
            console.error("Map container element not found for export.");
            return;
        }

        mapElement.classList.add('pdf-export-capture');

        let canvas;
        try {
            canvas = await html2canvas(mapElement, {
                scale: 2, // Higher scale for better quality
                useCORS: true,
                backgroundColor: null, // Transparent background
                // No fixed width or height, so it captures the element's natural size
                ignoreElements: (element) => element.hasAttribute("data-html2canvas-ignore"),
            });
        } finally {
            mapElement.classList.remove('pdf-export-capture');
        }

        const imgData = canvas.toDataURL("image/png");

        const doc = new jsPDF({
            orientation: "landscape",
            unit: "mm",
            format: "a4",
        }) as jsPDFWithAutoTable;

        const pdfWidth = doc.internal.pageSize.getWidth();
        const pdfHeight = doc.internal.pageSize.getHeight();
        const margin = 15;

        // --- Page 1: Map and Legend ---

        // Title
        doc.setFont("helvetica", "bold");
        doc.setFontSize(20);
        doc.text(`Event Map - ${floorData.name}`, margin, margin + 5);

        // Define layout areas based on 85/15 split
        const availableWidth = pdfWidth - margin * 2;
        const mapMaxWidth = availableWidth * 0.85;
        const legendWidth = availableWidth * 0.15;
        const contentStartY = margin + 20;
        const contentMaxHeight = pdfHeight - contentStartY - margin;

        // Map Image Calculation and Placement
        const imgProps = doc.getImageProperties(imgData);
        const aspectRatio = imgProps.width / imgProps.height;

        let imgWidth = mapMaxWidth;
        let imgHeight = imgWidth / aspectRatio;

        if (imgHeight > contentMaxHeight) {
            imgHeight = contentMaxHeight;
            imgWidth = imgHeight * aspectRatio;
        }

        const mapX = margin;
        const mapY = contentStartY;
        doc.addImage(imgData, "PNG", mapX, mapY, imgWidth, imgHeight);

        // Legend (Vertical list on the right)
        const legendX = pdfWidth - margin - legendWidth;
        const legendTitleY = contentStartY;
        doc.setFont("helvetica", "bold");
        doc.setFontSize(14);
        doc.text("Legend", legendX, legendTitleY);

        doc.setFontSize(10);
        doc.setFont("helvetica", "normal");

        let currentY = legendTitleY + 10;
        const legendItemHeight = 8;
        const legendBoxSize = 4;

        for (const tag of allTags) {
            if (currentY > pdfHeight - margin) break; // Prevent overflow
            doc.setFillColor(tag.color);
            doc.rect(legendX, currentY - legendBoxSize + 1, legendBoxSize, legendBoxSize, 'F');
            doc.text(tag.name, legendX + legendBoxSize + 3, currentY);
            currentY += legendItemHeight;
        }

        // --- Page 2: Room Index ---
        doc.addPage();

        doc.setFont("helvetica", "bold");
        doc.setFontSize(16);
        doc.text(`Room Index - ${floorData.name}`, margin, margin + 15);

        const tagsById = new Map(allTags.map(tag => [tag.id, tag]));

        const tableData = floorData.rooms.map((room) => {
            const roomTags = room.tagIds.map(id => tagsById.get(id)?.name || id).join(", ");
            return [
                room.id,
                roomTags,
                room.status,
                room.statusRemark || '',
            ];
        });

        doc.autoTable({
            head: [["Room ID", "Tags", "Status", "Remark"]],
            body: tableData,
            startY: margin + 25,
            margin: { left: margin, right: margin },
            headStyles: {
                fillColor: [63, 81, 181], // A professional blue
                textColor: 255,
                fontStyle: 'bold',
            },
            alternateRowStyles: {
                fillColor: [240, 240, 240]
            },
            styles: {
                cellPadding: 2,
                fontSize: 10,
            }
        });

        doc.save(`EventMapper-Pro-${floorData.name.replace(/\s+/g, '-')}.pdf`);
    };

    return { exportToPdf };
}
