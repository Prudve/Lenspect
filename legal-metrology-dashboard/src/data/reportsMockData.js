export const REPORT_SUMMARY = {
  totalInspections: 1284,
  compliant: 1012,
  nonCompliant: 272,
  complianceRate: 78.8,
  activeInspectors: 18
};

export const COMPLIANCE_TREND_DATA = [
  { date: '06 Sep', inspections: 168, compliant: 134, nonCompliant: 34 },
  { date: '07 Sep', inspections: 176, compliant: 140, nonCompliant: 36 },
  { date: '08 Sep', inspections: 181, compliant: 143, nonCompliant: 38 },
  { date: '09 Sep', inspections: 174, compliant: 137, nonCompliant: 37 },
  { date: '10 Sep', inspections: 192, compliant: 154, nonCompliant: 38 },
  { date: '11 Sep', inspections: 188, compliant: 149, nonCompliant: 39 },
  { date: '12 Sep', inspections: 205, compliant: 155, nonCompliant: 50 }
];

export const VIOLATION_CATEGORY_DATA = [
  {
    category: 'MRP / Price Declaration',
    count: 94,
    percentage: 34.5
  },
  {
    category: 'Net Quantity',
    count: 68,
    percentage: 25.0
  },
  {
    category: 'Manufacturer / Packer Details',
    count: 46,
    percentage: 16.9
  },
  {
    category: 'Consumer Care Details',
    count: 32,
    percentage: 11.8
  },
  {
    category: 'Date of Packing / Manufacture',
    count: 21,
    percentage: 7.7
  },
  {
    category: 'Unit Sale Price',
    count: 11,
    percentage: 4.0
  }
];

export const INSPECTOR_REPORT_DATA = [
  {
    id: 'LM-701',
    name: 'Anil Kumar',
    inspections: 286,
    compliant: 226,
    nonCompliant: 60,
    complianceRate: 79.0
  },
  {
    id: 'LM-702',
    name: 'Priya Nair',
    inspections: 251,
    compliant: 201,
    nonCompliant: 50,
    complianceRate: 80.1
  },
  {
    id: 'LM-704',
    name: 'Vikram Sharma',
    inspections: 268,
    compliant: 211,
    nonCompliant: 57,
    complianceRate: 78.7
  },
  {
    id: 'LM-705',
    name: 'Rahul Mehta',
    inspections: 243,
    compliant: 188,
    nonCompliant: 55,
    complianceRate: 77.4
  },
  {
    id: 'LM-706',
    name: 'Sneha Reddy',
    inspections: 236,
    compliant: 186,
    nonCompliant: 50,
    complianceRate: 78.8
  }
];

export const MANUFACTURER_REPORT_DATA = [
  {
    name: 'Apex Agro Commodities Ltd',
    inspections: 74,
    violations: 18,
    status: 'Repeat Violations'
  },
  {
    name: 'Bharat Foods & Oils Pvt Ltd',
    inspections: 61,
    violations: 11,
    status: 'Under Review'
  },
  {
    name: 'Nature Fresh Agro Pvt Ltd',
    inspections: 57,
    violations: 8,
    status: 'Monitored'
  },
  {
    name: 'Golden Harvest Foods',
    inspections: 49,
    violations: 6,
    status: 'Monitored'
  },
  {
    name: 'Eastern Tea Company',
    inspections: 43,
    violations: 5,
    status: 'Compliant Trend'
  }
];

export const REPORT_PERIODS = [
  'Last 7 Days',
  'Last 30 Days',
  'Last 3 Months',
  'Year to Date'
];