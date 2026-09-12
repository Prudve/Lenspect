/**
 * Legal Metrology (Packaged Commodities) Rules, 2011 Compliance System
 * Detailed Inspection Data for Product Details View (Step 5)
 */

import { SCANNED_PRODUCTS_DATA } from './scannedProductsMockData';

// Specific detailed records for primary demonstration
const DETAILED_OVERRIDE_RECORDS = {
  'INSP-2026-9102': {
    inspectionId: 'INSP-2026-9102',
    productName: 'SunGold Refined Sunflower Oil (1 L)',
    category: 'Food',
    manufacturer: 'Vedic Oils & Extracts Ltd',
    packerAddress: 'Plot 42, GIDC Industrial Estate, Sector 9, Vadodara, Gujarat - 390010',
    inspector: 'Insp. Kavita Nair',
    inspectorId: 'LM-812',
    jurisdiction: 'Zone: North Division &bull; Sector 4 Circle',
    inspectionDate: '12 Sep 2026',
    inspectionTime: '09:15 AM',
    deviceModel: 'Samsung Galaxy XCover 5 (Gov Android Build v2.4.1)',
    status: 'Non-Compliant',
    violationCount: 2,
    overallScore: '64% Statutory Match',
    
    // Extracted OCR fields
    extractedData: {
      productName: 'SunGold Refined Sunflower Oil',
      manufacturer: 'Vedic Oils & Extracts Ltd, Plot 42, GIDC Vadodara',
      mrp: 'Not Detected (Missing on secondary panel)',
      unitSalePrice: 'Not Detected',
      netQuantity: '1 L (at 30°C)',
      unitOfMeasurement: 'L (Litre - Standard SI Unit)',
      batchNumber: 'VOE-0941 (Partially Blurred)',
      dateOfPacking: '08/2026',
      consumerCare: 'care@vedicoils.com, Tel: 1800-202-0941'
    },

    // Statutory Declaration Checklist under Legal Metrology (PC) Rules, 2011
    checklist: [
      {
        declaration: 'Maximum Retail Price (MRP)',
        ruleReference: 'Rule 6(1)(e)',
        extractedValue: 'Missing / Unreadable',
        status: 'Missing',
        remarks: 'Mandatory price declaration was omitted from the principal label panel.'
      },
      {
        declaration: 'Unit Sale Price (USP)',
        ruleReference: 'Rule 6(1)(g)',
        extractedValue: 'Not Found',
        status: 'Missing',
        remarks: 'Commodity packaged above 1 L must carry price per litre/kg under 2022 Amendment.'
      },
      {
        declaration: 'Net Quantity',
        ruleReference: 'Rule 6(1)(f) & Rule 12',
        extractedValue: '1 L (at 30°C)',
        status: 'Present',
        remarks: 'Valid standard unit of volume with declared reference temperature.'
      },
      {
        declaration: 'Manufacturer / Packer Name & Address',
        ruleReference: 'Rule 6(1)(a)',
        extractedValue: 'Vedic Oils & Extracts Ltd, Plot 42, GIDC Vadodara',
        status: 'Present',
        remarks: 'Full registered business and warehouse address identified.'
      },
      {
        declaration: 'Month and Year of Manufacture / Packing',
        ruleReference: 'Rule 6(1)(d)',
        extractedValue: '08/2026',
        status: 'Present',
        remarks: 'Declaration is decipherable and within statutory time limit.'
      },
      {
        declaration: 'Consumer Care Helpline & Contact',
        ruleReference: 'Rule 6(1)(n)',
        extractedValue: 'care@vedicoils.com, Tel: 1800-202-0941',
        status: 'Present',
        remarks: 'Telephone number and valid email address verified.'
      }
    ],

    // Specific Violations
    violations: [
      {
        id: 'VIO-9102-1',
        title: 'Mandatory Maximum Retail Price (MRP) Declaration Missing',
        severity: 'Critical',
        ruleReference: 'Rule 6(1)(e) of PC Rules, 2011',
        explanation: 'Package principal display panel failed to display "Maximum Retail Price inclusive of all taxes" or "MRP ₹...". Scanned OCR bounding box detected no price numerals.',
        status: 'Statutory Notice Drafted',
        demonstrationNote: 'Rule reference based on Rule 6(1)(e) under Packaged Commodities Rules, 2011 for demonstration purposes.'
      },
      {
        id: 'VIO-9102-2',
        title: 'Unit Sale Price (USP) Omission',
        severity: 'High',
        ruleReference: 'Rule 6(1)(g) of PC Rules, 2011',
        explanation: 'Packages containing more than 1 kg or 1 litre are required to prominently declare unit sale price per kg/litre. No unit price found on container face.',
        status: 'Pending Supervisory Endorsement',
        demonstrationNote: 'Statutory reference for demonstration purposes.'
      }
    ],

    // Timeline of automated and field inspection steps
    timeline: [
      { step: 'Field Inspection Initiated', time: '12 Sep 2026, 09:12 AM', actor: 'Insp. Kavita Nair', status: 'completed' },
      { step: 'Package Label Captured & Preprocessed', time: '12 Sep 2026, 09:14 AM', actor: 'Mobile OCR Engine', status: 'completed' },
      { step: 'Declaration Text Extraction', time: '12 Sep 2026, 09:14 AM', actor: 'Automated Parser', status: 'completed' },
      { step: 'Rule Cross-Check: 2 Breaches Flagged', time: '12 Sep 2026, 09:15 AM', actor: 'Rule Engine', status: 'alert' },
      { step: 'Transmitted to Supervisor Console', time: '12 Sep 2026, 09:16 AM', actor: 'Sync Service', status: 'completed' },
      { step: 'Supervisory Review & Legal Action', time: 'Awaiting Action', actor: 'Supervisor (Rajesh Kumar)', status: 'pending' }
    ]
  },

  'INSP-2026-9101': {
    inspectionId: 'INSP-2026-9101',
    productName: 'Swarna Sharbati Whole Wheat Atta (5 kg)',
    category: 'Food',
    manufacturer: 'Aura Agro Mills Pvt Ltd',
    packerAddress: 'Industrial Area Phase 2, Baddi, Solan, Himachal Pradesh - 173205',
    inspector: 'Insp. Vikram Sharma',
    inspectorId: 'LM-704',
    jurisdiction: 'Zone: North Division &bull; Sector 1 Market',
    inspectionDate: '12 Sep 2026',
    inspectionTime: '09:40 AM',
    deviceModel: 'Motorola Defy Rugged (Gov Enforce Build v2.4.1)',
    status: 'Compliant',
    violationCount: 0,
    overallScore: '100% Fully Compliant',
    
    extractedData: {
      productName: 'Swarna Sharbati Whole Wheat Atta',
      manufacturer: 'Aura Agro Mills Pvt Ltd, Phase 2, Baddi, HP',
      mrp: '₹265.00 (Incl. of all taxes)',
      unitSalePrice: '₹53.00 / kg',
      netQuantity: '5 kg (when packed)',
      unitOfMeasurement: 'kg (Kilogram - Standard SI Unit)',
      batchNumber: 'AAM-2609-08',
      dateOfPacking: '09/2026',
      consumerCare: 'support@auraagro.in, Helpline: 1800-111-9988'
    },

    checklist: [
      {
        declaration: 'Maximum Retail Price (MRP)',
        ruleReference: 'Rule 6(1)(e)',
        extractedValue: '₹265.00 (Incl. of all taxes)',
        status: 'Present',
        remarks: 'Proper formatting, clear numeral font size, tax inclusivity stated.'
      },
      {
        declaration: 'Unit Sale Price (USP)',
        ruleReference: 'Rule 6(1)(g)',
        extractedValue: '₹53.00 / kg',
        status: 'Present',
        remarks: 'Correctly stated in ₹ per kilogram.'
      },
      {
        declaration: 'Net Quantity',
        ruleReference: 'Rule 6(1)(f)',
        extractedValue: '5 kg (when packed)',
        status: 'Present',
        remarks: 'Standard approved unit; complies with Second Schedule weight norms.'
      },
      {
        declaration: 'Manufacturer / Packer Details',
        ruleReference: 'Rule 6(1)(a)',
        extractedValue: 'Aura Agro Mills Pvt Ltd, Baddi, HP',
        status: 'Present',
        remarks: 'Complete registered business name and location.'
      },
      {
        declaration: 'Month and Year of Packing',
        ruleReference: 'Rule 6(1)(d)',
        extractedValue: '09/2026',
        status: 'Present',
        remarks: 'Legible date format compliant with Rule 6(1)(d).'
      },
      {
        declaration: 'Consumer Care Contact',
        ruleReference: 'Rule 6(1)(n)',
        extractedValue: 'support@auraagro.in, Helpline: 1800-111-9988',
        status: 'Present',
        remarks: 'Name, email, and phone contact clearly legible on back panel.'
      }
    ],

    violations: [],

    timeline: [
      { step: 'Field Inspection Initiated', time: '12 Sep 2026, 09:38 AM', actor: 'Insp. Vikram Sharma', status: 'completed' },
      { step: 'Package Label Captured & Preprocessed', time: '12 Sep 2026, 09:39 AM', actor: 'Mobile OCR Engine', status: 'completed' },
      { step: 'Declaration Text Extraction', time: '12 Sep 2026, 09:39 AM', actor: 'Automated Parser', status: 'completed' },
      { step: 'Rule Cross-Check: 6/6 Mandatory Rules Met', time: '12 Sep 2026, 09:40 AM', actor: 'Rule Engine', status: 'completed' },
      { step: 'Record Archived as Compliant', time: '12 Sep 2026, 09:41 AM', actor: 'Enforcement Portal', status: 'completed' }
    ]
  }
};

/**
 * Returns full detailed record for any inspectionId, generating realistic
 * fallback data from SCANNED_PRODUCTS_DATA if an explicit override is not defined.
 */
export function getInspectionDetail(inspectionId) {
  if (DETAILED_OVERRIDE_RECORDS[inspectionId]) {
    return DETAILED_OVERRIDE_RECORDS[inspectionId];
  }

  const base = SCANNED_PRODUCTS_DATA.find((p) => p.inspectionId === inspectionId);
  if (!base) return null;

  const isCompliant = base.status === 'Compliant';
  const isUnderReview = base.status === 'Under Review';

  return {
    inspectionId: base.inspectionId,
    productName: base.productName,
    category: base.category,
    manufacturer: base.manufacturer,
    packerAddress: `Industrial Zone Plot ${Math.floor(Math.random() * 80 + 10)}, Phase ${Math.floor(Math.random() * 4 + 1)}, New Delhi - 110020`,
    inspector: base.inspector,
    inspectorId: base.inspectorId,
    jurisdiction: 'Zone: North Division &bull; Sector Monitoring Post',
    inspectionDate: base.displayDate.split(',')[0],
    inspectionTime: base.displayDate.split(',')[1]?.trim() || '10:00 AM',
    deviceModel: 'Field Officer Rugged Mobile Device (v2.4.1)',
    status: base.status,
    violationCount: base.violationCount,
    overallScore: isCompliant ? '100% Compliant' : isUnderReview ? '82% Under Review' : '65% Non-Compliant',

    extractedData: {
      productName: base.productName,
      manufacturer: base.manufacturer,
      mrp: isCompliant ? base.mrp : `${base.mrp} (Verification Incomplete)`,
      unitSalePrice: isCompliant ? 'Declared' : 'Pending Verification',
      netQuantity: base.netQuantity,
      unitOfMeasurement: base.netQuantity.replace(/[^a-zA-Z]/g, '') || 'g',
      batchNumber: base.batchNumber,
      dateOfPacking: '09/2026',
      consumerCare: `care@${base.manufacturer.toLowerCase().replace(/[^a-z]/g, '').slice(0, 10)}.com`
    },

    checklist: [
      {
        declaration: 'Maximum Retail Price (MRP)',
        ruleReference: 'Rule 6(1)(e)',
        extractedValue: base.mrp,
        status: isCompliant ? 'Present' : isUnderReview ? 'Needs Review' : 'Missing',
        remarks: isCompliant ? 'Valid format inclusive of all taxes.' : 'Requires supervisory cross-examination.'
      },
      {
        declaration: 'Net Quantity',
        ruleReference: 'Rule 6(1)(f)',
        extractedValue: base.netQuantity,
        status: 'Present',
        remarks: 'Standard metric measurement identified.'
      },
      {
        declaration: 'Unit of Measurement Standard',
        ruleReference: 'Rule 13',
        extractedValue: base.netQuantity.replace(/[^a-zA-Z]/g, ''),
        status: isUnderReview ? 'Needs Review' : 'Present',
        remarks: 'Standard SI metric notation checked.'
      },
      {
        declaration: 'Manufacturer / Packer Details',
        ruleReference: 'Rule 6(1)(a)',
        extractedValue: base.manufacturer,
        status: 'Present',
        remarks: 'Registered company entity verified.'
      },
      {
        declaration: 'Date of Packing / Manufacture',
        ruleReference: 'Rule 6(1)(d)',
        extractedValue: '09/2026',
        status: 'Present',
        remarks: 'Month and year declared on consumer facing packaging.'
      },
      {
        declaration: 'Consumer Care Contact Helpline',
        ruleReference: 'Rule 6(1)(n)',
        extractedValue: `care@contact.in`,
        status: isCompliant ? 'Present' : 'Needs Review',
        remarks: 'Customer redressal information verified on back panel.'
      }
    ],

    violations: isCompliant ? [] : [
      {
        id: `VIO-${base.inspectionId.slice(-4)}-1`,
        title: `${base.status === 'Under Review' ? 'Declaration Under Verification' : 'Mandatory Declaration Discrepancy'}`,
        severity: base.status === 'Under Review' ? 'Medium' : 'High',
        ruleReference: 'Rule 6(1) of Packaged Commodities Rules, 2011',
        explanation: `Label analysis flagged potential non-conformity in consumer declarations for ${base.productName}.`,
        status: base.status === 'Under Review' ? 'Pending Senior Review' : 'Statutory Notice Recommended',
        demonstrationNote: 'Statutory reference for demonstration purposes.'
      }
    ],

    timeline: [
      { step: 'Field Inspection Initiated', time: `${base.displayDate}`, actor: base.inspector, status: 'completed' },
      { step: 'Label Image Processed', time: `${base.displayDate}`, actor: 'Mobile OCR Engine', status: 'completed' },
      { step: 'Statutory Checklist Validated', time: `${base.displayDate}`, actor: 'Rule Engine', status: isCompliant ? 'completed' : 'alert' },
      { step: 'Supervisor Record Ready', time: `${base.displayDate}`, actor: 'Enforcement Portal', status: 'completed' }
    ]
  };
}
