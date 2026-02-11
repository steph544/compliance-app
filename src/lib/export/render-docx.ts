import {
  Document,
  Packer,
  Paragraph,
  TextRun,
  Table,
  TableRow,
  TableCell,
  HeadingLevel,
} from "docx";
import type { SectionContent } from "./types";

function blockToDocxChildren(block: SectionContent["blocks"][number]): (Paragraph | Table)[] {
  switch (block.type) {
    case "heading": {
      const level =
        block.level === 1
          ? HeadingLevel.HEADING_1
          : block.level === 2
            ? HeadingLevel.HEADING_2
            : HeadingLevel.HEADING_3;
      return [
        new Paragraph({
          text: block.content,
          heading: level,
          spacing: { after: 120 },
        }),
      ];
    }
    case "text":
      return [
        new Paragraph({
          children: [new TextRun(block.content)],
          spacing: { after: 120 },
        }),
      ];
    case "table": {
      const rows = [
        new TableRow({
          children: block.headers.map(
            (h) =>
              new TableCell({
                children: [
                  new Paragraph({
                    children: [new TextRun({ text: h, bold: true })],
                  }),
                ],
              })
          ),
        }),
        ...block.rows.map(
          (row) =>
            new TableRow({
              children: row.map(
                (cell) =>
                  new TableCell({
                    children: [
                      new Paragraph({
                        children: [new TextRun(String(cell ?? ""))],
                      }),
                    ],
                  })
              ),
            })
        ),
      ];
      return [
        new Table({
          rows,
          width: { size: 100, type: "PERCENTAGE" },
        }),
      ];
    default: {
      return [];
    }
  }
}

export async function renderSectionsToDocxBuffer(
  sections: SectionContent[]
): Promise<Buffer> {
  const children: (Paragraph | Table)[] = [];

  for (const section of sections) {
    for (const block of section.blocks) {
      children.push(...blockToDocxChildren(block));
    }
  }

  const doc = new Document({
    sections: [
      {
        properties: {},
        children,
      },
    ],
  });

  const buffer = await Packer.toBuffer(doc);
  return Buffer.from(buffer);
}
