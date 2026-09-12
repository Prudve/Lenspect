import PDFDocument from "pdfkit";
import fs from "fs";

/**
 * Generates a formal legal violation notice PDF using PDFKit.
 * 
 * @param {Object} noticeData - Metadata (noticeNumber, inspection details, violations, inspector)
 * @param {string} outputPath - Local temp path where PDF file will be written
 * @returns {Promise<string>} Resolves with the generated PDF file path
 */
export const generateNoticePDF = async (noticeData, outputPath) => {
    return new Promise((resolve, reject) => {
        try {
            const doc = new PDFDocument({ margin: 50, size: "A4" });
            const writeStream = fs.createWriteStream(outputPath);

            doc.pipe(writeStream);

            // Document Header
            doc.fillColor("#1A365D")
               .fontSize(18)
               .text("LEGAL METROLOGY COMPLIANCE DEPARTMENT", { align: "center", bold: true });
            
            doc.fontSize(14)
               .fillColor("#C53030")
               .text("FORMAL NOTICE OF NON-COMPLIANCE", { align: "center" });

            doc.moveDown(1.5);
            doc.strokeColor("#E2E8F0").lineWidth(1).moveTo(50, doc.y).lineTo(545, doc.y).stroke();
            doc.moveDown(1.5);

            // Notice Metadata
            doc.fillColor("#2D3748").fontSize(10);
            doc.text(`Notice Number: ${noticeData.noticeNumber}`);
            doc.text(`Date Issued: ${new Date(noticeData.createdAt).toLocaleDateString("en-IN")}`);
            doc.text(`Issuing Authority / Inspector ID: ${noticeData.inspectorId}`);
            doc.text(`Target Inspection ID: ${noticeData.inspectionId}`);

            doc.moveDown();
            doc.strokeColor("#E2E8F0").lineWidth(0.5).moveTo(50, doc.y).lineTo(545, doc.y).stroke();
            doc.moveDown();

            // Extracted Package Declarations Summary
            doc.fontSize(12).fillColor("#1A365D").text("1. Extracted Package Declarations:", { underline: true });
            doc.moveDown(0.5);

            doc.fontSize(10).fillColor("#4A5568");
            const ext = noticeData.extractedData || {};
            doc.text(`• MRP Value: ${ext.mrp_val ? `₹${ext.mrp_val}` : "NOT DETECTED / MISSING"}`);
            doc.text(`• Unit / Weight Symbol: ${ext.unit_symbol || "NOT DETECTED / MISSING"}`);
            doc.text(`• Manufacturing Date: ${ext.mfg_date ? new Date(ext.mfg_date).toLocaleDateString("en-IN") : "NOT DETECTED / MISSING"}`);
            doc.text(`• Country of Origin: ${ext.country_origin || "NOT DETECTED / MISSING"}`);

            doc.moveDown();

            // Established Violations
            doc.fontSize(12).fillColor("#1A365D").text("2. Established Statutory Violations (LMPC Rules):", { underline: true });
            doc.moveDown(0.5);

            doc.fontSize(10).fillColor("#9B2C2C");
            if (noticeData.violations && noticeData.violations.length > 0) {
                noticeData.violations.forEach((v, index) => {
                    doc.text(`${index + 1}. [${v.rule}] ${v.description}`);
                });
            } else {
                doc.text("• General Violation: Non-compliance with statutory package display declarations.");
            }

            doc.moveDown(2);

            // Footer Statement
            doc.fontSize(9).fillColor("#718096").text(
                "This is a system-generated legal document under the Legal Metrology (Packaged Commodities) Rules. " +
                "This notice incorporates validated computer vision evidence overlays stored in official registries.",
                { align: "justify" }
            );

            doc.end();

            writeStream.on("finish", () => resolve(outputPath));
            writeStream.on("error", (err) => reject(err));
        } catch (error) {
            reject(error);
        }
    });
};