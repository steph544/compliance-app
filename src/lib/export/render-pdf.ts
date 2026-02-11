import { jsPDF } from "jspdf";
import autoTable, { applyPlugin } from "jspdf-autotable";
import type { SectionContent } from "./types";

applyPlugin(jsPDF);

const MARGIN = 20;
const PAGE_WIDTH = 210;
const LINE_HEIGHT = 6;
const MAX_WIDTH = PAGE_WIDTH - 2 * MARGIN;

export function renderSectionsToPdfBuffer(sections: SectionContent[]): Buffer {
  const doc = new jsPDF({ unit: "mm", format: "a4" });
  let y = MARGIN;

  for (const section of sections) {
    for (const block of section.blocks) {
      if (y > 270) {
        doc.addPage();
        y = MARGIN;
      }

      switch (block.type) {
        case "heading": {
          const size = block.level === 1 ? 16 : block.level === 2 ? 14 : 12;
          doc.setFontSize(size);
          doc.setFont("helvetica", "bold");
          const lines = doc.splitTextToSize(block.content, MAX_WIDTH);
          for (const line of lines) {
            doc.text(line, MARGIN, y);
            y += LINE_HEIGHT;
          }
          y += 2;
          doc.setFont("helvetica", "normal");
          doc.setFontSize(11);
          break;
        }
        case "text": {
          doc.setFontSize(11);
          const lines = doc.splitTextToSize(block.content, MAX_WIDTH);
          for (const line of lines) {
            if (y > 270) {
              doc.addPage();
              y = MARGIN;
            }
            doc.text(line, MARGIN, y);
            y += LINE_HEIGHT;
          }
          y += 2;
          break;
        }
        case "table": {
          if (y > 200) {
            doc.addPage();
            y = MARGIN;
          }
          autoTable(doc, {
            head: [block.headers],
            body: block.rows,
            startY: y,
            margin: { left: MARGIN },
            styles: { fontSize: 9 },
            headStyles: { fillColor: [220, 220, 220] },
          });
          const table = (doc as unknown as { lastAutoTable: { finalY: number } }).lastAutoTable;
          y = table.finalY + 8;
          break;
        }
      }
    }
    y += 8;
  }

  return Buffer.from(doc.output("arraybuffer"));
}
