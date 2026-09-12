/**
 * Legal Metrology (Packaged Commodities) Rules, 2011 Compliance System
 * Mock Data Repository for Supervisor Overview Dashboard (Step 3)
 */

export const KPI_DATA = [
  {
    id: 'scanned-total',
    title: 'Total Products Scanned',
    value: '1,284',
    subtext: '+124 commodities today across all zones',
    trend: '+8.4% vs last week',
    trendType: 'neutral',
    iconName: 'Package',
    accentColor: '#1e3a8a'
  },
  {
    id: 'compliant-count',
    title: 'Compliant Products',
    value: '1,012',
    subtext: 'Meets all mandatory Chapter II declarations',
    trend: '78.8% baseline',
    trendType: 'positive',
    iconName: 'CheckCircle2',
    accentColor: '#16a34a'
  },
  {
    id: 'non-compliant-count',
    title: 'Non-Compliant Products',
    value: '272',
    subtext: 'Flagged for statutory rule violations',
    trend: '21.2% breach rate',
    trendType: 'negative',
    iconName: 'AlertOctagon',
    accentColor: '#dc2626'
  },
  {
    id: 'compliance-rate',
    title: 'Compliance Rate',
    value: '78.8%',
    subtext: 'Target threshold: 85.0%',
    trend: '+1.8% from previous cycle',
    trendType: 'positive',
    iconName: 'Percent',
    accentColor: '#2563eb'
  },
  {
    id: 'active-inspectors',
    title: 'Active Inspectors',
    value: '18',
    subtext: 'Deployed across 6 enforcement circles',
    trend: '100% attendance',
    trendType: 'neutral',
    iconName: 'UserCheck',
    accentColor: '#0f172a'
  }
];

export const COMPLIANCE_TREND_DATA = [
  { day: 'Mon', date: '06 Sep', rate: 74.0, totalScanned: 165, nonCompliant: 43 },
  { day: 'Tue', date: '07 Sep', rate: 76.0, totalScanned: 182, nonCompliant: 44 },
  { day: 'Wed', date: '08 Sep', rate: 75.0, totalScanned: 174, nonCompliant: 43 },
  { day: 'Thu', date: '09 Sep', rate: 79.0, totalScanned: 195, nonCompliant: 41 },
  { day: 'Fri', date: '10 Sep', rate: 77.0, totalScanned: 210, nonCompliant: 48 },
  { day: 'Sat', date: '11 Sep', rate: 81.0, totalScanned: 198, nonCompliant: 38 },
  { day: 'Sun', date: '12 Sep', rate: 78.8, totalScanned: 160, nonCompliant: 34 }
];

export const VIOLATION_SUMMARY_DATA = [
  {
    category: 'MRP / Price Declaration',
    rule: 'Rule 6(1)(e)',
    count: 94,
    percentage: 34.5,
    severity: 'Critical'
  },
  {
    category: 'Net Quantity & Unit Sale Price',
    rule: 'Rule 6(1)(f) & (g)',
    count: 68,
    percentage: 25.0,
    severity: 'High'
  },
  {
    category: 'Manufacturer / Packer Details',
    rule: 'Rule 6(1)(a)',
    count: 46,
    percentage: 16.9,
    severity: 'Medium'
  },
  {
    category: 'Consumer Care Helpline Details',
    rule: 'Rule 6(1)(n)',
    count: 32,
    percentage: 11.8,
    severity: 'Medium'
  },
  {
    category: 'Date of Packing / Import',
    rule: 'Rule 6(1)(d)',
    count: 21,
    percentage: 7.7,
    severity: 'High'
  },
  {
    category: 'Non-Standard Unit of Measurement',
    rule: 'Rule 13',
    count: 11,
    percentage: 4.1,
    severity: 'Low'
  }
];

export const RECENT_INSPECTIONS_DATA = [
  {
    id: 'INSP-2026-9101',
    product: 'Royal Sharbati Atta (5 kg)',
    category: 'Packaged Foodgrains',
    manufacturer: 'Aashirvaad Mills Pvt Ltd',
    inspector: 'Insp. Vikram Sharma',
    inspectorId: 'LM-704',
    timestamp: '12 Sep 2026, 09:40 AM',
    status: 'Compliant'
  },
  {
    id: 'INSP-2026-9102',
    product: 'Fortune Sunlite Refined Oil (1 L)',
    category: 'Edible Oils',
    manufacturer: 'Adani Wilmar Ltd',
    inspector: 'Insp. Kavita Nair',
    inspectorId: 'LM-812',
    timestamp: '12 Sep 2026, 09:15 AM',
    status: 'Non-Compliant'
  },
  {
    id: 'INSP-2026-9103',
    product: 'Everest Garam Masala (100 g)',
    category: 'Condiments & Spices',
    manufacturer: 'Everest Food Products',
    inspector: 'Insp. Prakash Deshmukh',
    inspectorId: 'LM-650',
    timestamp: '12 Sep 2026, 08:55 AM',
    status: 'Compliant'
  },
  {
    id: 'INSP-2026-9104',
    product: 'Good Day Butter Cookies (200 g)',
    category: 'Bakery & Confectionery',
    manufacturer: 'Britannia Industries Ltd',
    inspector: 'Insp. Sandeep Rao',
    inspectorId: 'LM-903',
    timestamp: '11 Sep 2026, 05:20 PM',
    status: 'Under Review'
  },
  {
    id: 'INSP-2026-9105',
    product: 'Tata Salt Vacuum Evaporated (1 kg)',
    category: 'Edible Salt',
    manufacturer: 'Tata Consumer Products',
    inspector: 'Insp. Vikram Sharma',
    inspectorId: 'LM-704',
    timestamp: '11 Sep 2026, 04:45 PM',
    status: 'Compliant'
  },
  {
    id: 'INSP-2026-9106',
    product: 'Catch Pure Turmeric Powder (200 g)',
    category: 'Spices & Seasonings',
    manufacturer: 'Dharampal Satyapal Group',
    inspector: 'Insp. Amit Mishra',
    inspectorId: 'LM-512',
    timestamp: '11 Sep 2026, 03:10 PM',
    status: 'Non-Compliant'
  },
  {
    id: 'INSP-2026-9107',
    product: 'Amul Gold Homogenised Milk (500 ml)',
    category: 'Dairy Products',
    manufacturer: 'GCMMF Ltd (Amul)',
    inspector: 'Insp. Kavita Nair',
    inspectorId: 'LM-812',
    timestamp: '11 Sep 2026, 01:30 PM',
    status: 'Compliant'
  }
];

export const RECENT_VIOLATIONS_DATA = [
  {
    id: 'VIO-2026-0841',
    product: 'Fortune Sunlite Refined Oil (1 L)',
    violation: 'MRP & Unit Sale Price declaration missing on secondary panel',
    ruleBreached: 'Rule 6(1)(e) & Rule 6(1)(g)',
    severity: 'Critical',
    inspector: 'Insp. Kavita Nair',
    timestamp: '12 Sep 2026, 09:15 AM',
    actionStatus: 'Statutory Notice Issued'
  },
  {
    id: 'VIO-2026-0842',
    product: 'Catch Pure Turmeric Powder (200 g)',
    violation: 'Net quantity font height below statutory minimum (height < 4mm)',
    ruleBreached: 'Rule 7 & Rule 8',
    severity: 'High',
    inspector: 'Insp. Amit Mishra',
    timestamp: '11 Sep 2026, 03:10 PM',
    actionStatus: 'Under Supervisor Review'
  },
  {
    id: 'VIO-2026-0843',
    product: 'Apex Royal Basmati Rice (10 kg)',
    violation: 'Incomplete registered office address of packer; missing pin code',
    ruleBreached: 'Rule 6(1)(a)',
    severity: 'Medium',
    inspector: 'Insp. Prakash Deshmukh',
    timestamp: '11 Sep 2026, 11:20 AM',
    actionStatus: 'Explanation Called'
  },
  {
    id: 'VIO-2026-0844',
    product: 'Crispy Wave Potato Wafers (85 g)',
    violation: 'Consumer Care email/telephone absent from principal display panel',
    ruleBreached: 'Rule 6(1)(n)',
    severity: 'Medium',
    inspector: 'Insp. Sandeep Rao',
    timestamp: '10 Sep 2026, 04:35 PM',
    actionStatus: 'Rectification Advised'
  },
  {
    id: 'VIO-2026-0845',
    product: 'NutriFit Soya Chunks (250 g)',
    violation: 'Month & Year of Manufacture blurred and indecipherable',
    ruleBreached: 'Rule 6(1)(d)',
    severity: 'High',
    inspector: 'Insp. Vikram Sharma',
    timestamp: '10 Sep 2026, 02:15 PM',
    actionStatus: 'Seizure Memo Filed'
  }
];

export const REPEAT_VIOLATION_ALERT = {
  manufacturer: 'Apex Agro Commodities & Packagers Ltd',
  product: 'Apex Royal Basmati Rice & Grain Series',
  violationCount: 3,
  monitoringPeriod: 'Current Monitoring Period (Sep 2026)',
  primaryBreaches: 'Repeated omission of Unit Sale Price (Rule 6) and incomplete packer address across 3 separate retail inspections.',
  severity: 'Critical',
  lastInspectionDate: '11 Sep 2026',
  inspectingOfficer: 'Insp. Prakash Deshmukh (Circle-3)',
  statutoryReference: 'Section 51 of Legal Metrology Act, 2009 (Subsequent Offence)',
  recommendedAction: 'Summon Authorized Representative / Escalate for Compounding or Prosecution'
};
