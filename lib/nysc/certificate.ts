import { jsPDF } from "jspdf";
import { readFile } from "fs/promises";
import path from "path";

// Brand palette (mirrors the app's design tokens + NYSC green) expressed as
// jsPDF RGB triples since jsPDF has no CSS variable support.
const DEEPTALENT_BLUE: [number, number, number] = [59, 91, 219]; // #3B5BDB
const DEEPTALENT_BLUE_DARK: [number, number, number] = [30, 41, 99]; // deep navy for headings
const NYSC_GREEN: [number, number, number] = [15, 122, 61]; // #0F7A3D
const NYSC_GREEN_DARK: [number, number, number] = [11, 77, 39]; // #0b4d27
const INK: [number, number, number] = [17, 24, 39]; // #111827
const MUTED: [number, number, number] = [107, 114, 128]; // #6B7280
const PAPER: [number, number, number] = [255, 255, 253];
const GOLD: [number, number, number] = [180, 140, 45];

export interface NyscCertificateData {
  certificateNumber: string;
  fullName: string;
  callUpNumber: string | null;
  stateCode: string | null;
  stateOfOrigin: string | null;
  completedAt: Date;
  issuedAt: Date;
}

let cachedLogos: { deepTalent: string; nysc: string } | null = null;

async function loadLogos() {
  if (cachedLogos) return cachedLogos;
  const publicDir = path.join(process.cwd(), "public", "images");
  const [deepTalentBuf, nyscBuf] = await Promise.all([
    readFile(path.join(publicDir, "logo-2d.png")),
    readFile(path.join(publicDir, "nysc-logo.png")),
  ]);
  cachedLogos = {
    deepTalent: `data:image/png;base64,${deepTalentBuf.toString("base64")}`,
    nysc: `data:image/png;base64,${nyscBuf.toString("base64")}`,
  };
  return cachedLogos;
}

function formatDate(d: Date) {
  return d.toLocaleDateString("en-GB", { day: "numeric", month: "long", year: "numeric" });
}

/**
 * Generates the "DeepTalent x NYSC Global Workforce Readiness Programme"
 * completion certificate as a PDF. Returns raw PDF bytes suitable for either
 * a download response or an email attachment.
 */
export async function generateNyscCertificatePdf(data: NyscCertificateData): Promise<Uint8Array> {
  const logos = await loadLogos();

  const doc = new jsPDF({ orientation: "landscape", unit: "mm", format: "a4" });
  const pageW = doc.internal.pageSize.getWidth(); // 297
  const pageH = doc.internal.pageSize.getHeight(); // 210

  // ---- Background -------------------------------------------------------
  doc.setFillColor(...PAPER);
  doc.rect(0, 0, pageW, pageH, "F");

  // Faint corner wash, top-left blue / bottom-right green, to nod at both brands
  // without competing with the border ornamentation.
  doc.setFillColor(59, 91, 219);
  doc.setGState(new (doc as any).GState({ opacity: 0.05 }));
  doc.circle(10, 8, 60, "F");
  doc.setFillColor(...NYSC_GREEN);
  doc.circle(pageW - 10, pageH - 8, 60, "F");
  doc.setGState(new (doc as any).GState({ opacity: 1 }));

  // ---- Border frame -------------------------------------------------------
  const outerMargin = 8;
  doc.setDrawColor(...DEEPTALENT_BLUE_DARK);
  doc.setLineWidth(1.1);
  doc.rect(outerMargin, outerMargin, pageW - outerMargin * 2, pageH - outerMargin * 2);

  const innerMargin = 12;
  doc.setDrawColor(...NYSC_GREEN);
  doc.setLineWidth(0.5);
  doc.rect(innerMargin, innerMargin, pageW - innerMargin * 2, pageH - innerMargin * 2);

  const goldMargin = 14.5;
  doc.setDrawColor(...GOLD);
  doc.setLineWidth(0.25);
  doc.rect(goldMargin, goldMargin, pageW - goldMargin * 2, pageH - goldMargin * 2);

  // Corner ornaments (simple mitred flourish at each inner corner)
  const cornerLen = 9;
  const corners: Array<[number, number, number, number]> = [
    [innerMargin, innerMargin, 1, 1],
    [pageW - innerMargin, innerMargin, -1, 1],
    [innerMargin, pageH - innerMargin, 1, -1],
    [pageW - innerMargin, pageH - innerMargin, -1, -1],
  ];
  doc.setDrawColor(...GOLD);
  doc.setLineWidth(0.5);
  for (const [x, y, dx, dy] of corners) {
    doc.line(x, y, x + cornerLen * dx, y);
    doc.line(x, y, x, y + cornerLen * dy);
  }

  // ---- Header: dual logos + programme line -------------------------------
  const headerY = 24;
  doc.addImage(logos.deepTalent, "PNG", 24, headerY - 7, 15, 15);
  doc.addImage(logos.nysc, "PNG", pageW - 24 - 15, headerY - 7, 15, 15);

  doc.setFont("helvetica", "bold");
  doc.setFontSize(9.5);
  doc.setTextColor(...NYSC_GREEN_DARK);
  doc.text("NATIONAL YOUTH SERVICE CORPS", pageW / 2, headerY - 3, { align: "center" });
  doc.setFont("helvetica", "normal");
  doc.setFontSize(8.5);
  doc.setTextColor(...MUTED);
  doc.text("Global Workforce Readiness Programme", pageW / 2, headerY + 2.5, { align: "center" });

  // ---- Title --------------------------------------------------------------
  doc.setFont("times", "bold");
  doc.setFontSize(30);
  doc.setTextColor(...DEEPTALENT_BLUE_DARK);
  doc.text("Certificate of Completion", pageW / 2, 56, { align: "center" });

  doc.setDrawColor(...GOLD);
  doc.setLineWidth(0.4);
  doc.line(pageW / 2 - 22, 60, pageW / 2 + 22, 60);

  // ---- Body copy ------------------------------------------------------------
  doc.setFont("helvetica", "normal");
  doc.setFontSize(11.5);
  doc.setTextColor(...MUTED);
  doc.text("This is to certify that", pageW / 2, 74, { align: "center" });

  doc.setFont("times", "bolditalic");
  doc.setFontSize(26);
  doc.setTextColor(...INK);
  doc.text(data.fullName, pageW / 2, 88, { align: "center" });

  doc.setDrawColor(...DEEPTALENT_BLUE);
  doc.setLineWidth(0.3);
  const nameWidth = Math.min(160, doc.getTextWidth(data.fullName) + 20);
  doc.line(pageW / 2 - nameWidth / 2, 91.5, pageW / 2 + nameWidth / 2, 91.5);

  doc.setFont("helvetica", "normal");
  doc.setFontSize(11.5);
  doc.setTextColor(...MUTED);
  const bodyText =
    "a corps member of the National Youth Service Corps, has successfully completed the DeepTalent Global Workforce Readiness Programme, demonstrating the professional standards, communication skills, and remote-work competencies required of the modern international workforce.";
  const bodyLines = doc.splitTextToSize(bodyText, 190);
  doc.text(bodyLines, pageW / 2, 100, { align: "center", lineHeightFactor: 1.5 });

  // ---- Detail strip (Call-Up No / State Code / Completion Date) -----------
  const detailY = 128;
  const details: Array<[string, string]> = [
    ["CALL-UP NUMBER", data.callUpNumber || "\u2014"],
    ["STATE CODE", data.stateCode || "\u2014"],
    ["DATE COMPLETED", formatDate(data.completedAt)],
  ];
  const colWidth = 70;
  const totalWidth = colWidth * details.length;
  const startX = pageW / 2 - totalWidth / 2;

  details.forEach(([label, value], i) => {
    const cx = startX + colWidth * i + colWidth / 2;
    doc.setFont("helvetica", "bold");
    doc.setFontSize(7.5);
    doc.setTextColor(...NYSC_GREEN_DARK);
    doc.text(label, cx, detailY, { align: "center" });
    doc.setFont("helvetica", "normal");
    doc.setFontSize(11);
    doc.setTextColor(...INK);
    doc.text(value, cx, detailY + 6, { align: "center" });
    if (i > 0) {
      doc.setDrawColor(210, 210, 210);
      doc.setLineWidth(0.2);
      doc.line(startX + colWidth * i, detailY - 4, startX + colWidth * i, detailY + 8);
    }
  });

  // ---- Signature / issuer block -------------------------------------------
  const sigY = pageH - 34;
  doc.addImage(logos.deepTalent, "PNG", pageW / 2 - 9, sigY - 16, 18, 18);
  doc.setDrawColor(...INK);
  doc.setLineWidth(0.3);
  doc.line(pageW / 2 - 34, sigY, pageW / 2 + 34, sigY);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(10);
  doc.setTextColor(...INK);
  doc.text("DeepTalent", pageW / 2, sigY + 5.5, { align: "center" });
  doc.setFont("helvetica", "normal");
  doc.setFontSize(7.5);
  doc.setTextColor(...MUTED);
  doc.text("Issuing Organization", pageW / 2, sigY + 10, { align: "center" });

  // ---- Footer: certificate number + issue date -----------------------------
  doc.setFont("helvetica", "normal");
  doc.setFontSize(8);
  doc.setTextColor(...MUTED);
  doc.text(`Certificate No. ${data.certificateNumber}`, 22, pageH - 18);
  doc.text(`Issued ${formatDate(data.issuedAt)}`, pageW - 22, pageH - 18, { align: "right" });

  return doc.output("arraybuffer") as unknown as Uint8Array;
}

/** Generates a unique, human-legible certificate number, e.g. DT-NYSC-2026-4F82K1. */
export function generateCertificateNumber(): string {
  const year = new Date().getFullYear();
  const random = Math.random().toString(36).slice(2, 8).toUpperCase();
  return `DT-NYSC-${year}-${random}`;
}
