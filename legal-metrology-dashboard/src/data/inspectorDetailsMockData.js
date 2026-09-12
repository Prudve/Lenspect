export const INSPECTOR_DETAILS = {
  'LM-701': {
    id: 'LM-701',
    name: 'Anil Kumar',
    division: 'North Division',
    assignedArea: 'Sector 1 Market',
    status: 'Active',
    totalInspections: 286,
    compliant: 226,
    nonCompliant: 60,
    complianceRate: 79.0,
    recentInspections: [
      {
        id: 'INSP-2026-9118',
        product: 'Packaged Atta',
        date: '12 Sep 2026, 10:15 AM',
        status: 'Compliant'
      },
      {
        id: 'INSP-2026-9097',
        product: 'Refined Sunflower Oil',
        date: '12 Sep 2026, 09:30 AM',
        status: 'Non-Compliant'
      },
      {
        id: 'INSP-2026-9064',
        product: 'Turmeric Powder',
        date: '11 Sep 2026, 04:20 PM',
        status: 'Compliant'
      }
    ],
    violationSummary: [
      { type: 'MRP / Price Declaration', count: 21 },
      { type: 'Net Quantity', count: 15 },
      { type: 'Manufacturer Details', count: 10 },
      { type: 'Consumer Care Details', count: 8 },
      { type: 'Other', count: 6 }
    ]
  },

  'LM-702': {
    id: 'LM-702',
    name: 'Priya Nair',
    division: 'North Division',
    assignedArea: 'Sector 2 Market',
    status: 'Active',
    totalInspections: 251,
    compliant: 201,
    nonCompliant: 50,
    complianceRate: 80.1,
    recentInspections: [
      {
        id: 'INSP-2026-9112',
        product: 'Garam Masala',
        date: '12 Sep 2026, 09:55 AM',
        status: 'Compliant'
      },
      {
        id: 'INSP-2026-9071',
        product: 'Butter Cookies',
        date: '11 Sep 2026, 02:40 PM',
        status: 'Compliant'
      },
      {
        id: 'INSP-2026-9039',
        product: 'Tea Pack',
        date: '10 Sep 2026, 11:30 AM',
        status: 'Non-Compliant'
      }
    ],
    violationSummary: [
      { type: 'MRP / Price Declaration', count: 18 },
      { type: 'Net Quantity', count: 12 },
      { type: 'Manufacturer Details', count: 9 },
      { type: 'Consumer Care Details', count: 6 },
      { type: 'Other', count: 5 }
    ]
  },

  'LM-704': {
    id: 'LM-704',
    name: 'Vikram Sharma',
    division: 'North Division',
    assignedArea: 'Sector 1 Market',
    status: 'Active',
    totalInspections: 268,
    compliant: 211,
    nonCompliant: 57,
    complianceRate: 78.7,
    recentInspections: [
      {
        id: 'INSP-2026-9101',
        product: 'Swarna Sharbati Whole Wheat Atta (5 kg)',
        date: '12 Sep 2026, 09:40 AM',
        status: 'Compliant'
      },
      {
        id: 'INSP-2026-9078',
        product: 'Refined Sunflower Oil',
        date: '11 Sep 2026, 03:15 PM',
        status: 'Non-Compliant'
      },
      {
        id: 'INSP-2026-9042',
        product: 'Turmeric Powder',
        date: '10 Sep 2026, 01:20 PM',
        status: 'Compliant'
      }
    ],
    violationSummary: [
      { type: 'MRP / Price Declaration', count: 20 },
      { type: 'Net Quantity', count: 14 },
      { type: 'Manufacturer Details', count: 9 },
      { type: 'Consumer Care Details', count: 8 },
      { type: 'Other', count: 6 }
    ]
  }
};

export function getInspectorDetail(inspectorId) {
  return INSPECTOR_DETAILS[inspectorId];
}