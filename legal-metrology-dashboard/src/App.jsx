import React, { useState, useEffect } from 'react';
import MainLayout from './components/layout/MainLayout';
import OverviewPage from './pages/OverviewPage';
import ScannedProductsPage from './pages/ScannedProductsPage';
import InspectorsPage from './pages/InspectorsPage';
import ViolationsPage from './pages/ViolationsPage';
import ComplianceReportsPage from './pages/ComplianceReportsPage';
import InspectionHistoryPage from './pages/InspectionHistoryPage';
import ProductDetailsPage from './pages/ProductDetailsPage';
import { INSPECTION_HISTORY_DATA } from './data/inspectionHistoryMockData';

import {
  LayoutDashboard,
  PackageCheck,
  AlertTriangle,
  FileBarChart,
  Users,
  History,
  ShieldAlert,
  Info
} from 'lucide-react';

const SECTIONS_CONFIG = {
  overview: {
    title: 'Overview',
    subtitle: 'Compliance monitoring and inspection overview',
    headline: 'Supervisor Dashboard',
    description: 'Real-time compliance monitoring and inspection overview across designated jurisdictions.',
    stepInfo: 'Scheduled for Step 3',
    details: 'This section will house high-level compliance metrics (Total Inspected, Compliant, Non-Compliant), statutory violation distribution, and recent scans feed.',
    icon: LayoutDashboard
  },

  'scanned-products': {
    title: 'Scanned Products',
    subtitle: 'Enforcement records of packaged commodities inspected by field officers',
    headline: 'Scanned Products Directory',
    description: 'Searchable repository of all commodities scanned by mobile field inspectors.',
    stepInfo: 'Scheduled for Step 4',
    details: 'Will display tabular and filterable views of scanned packages, commodity categories, brands, manufacturers, and immediate compliance statuses.',
    icon: PackageCheck
  },

  violations: {
    title: 'Violations',
    subtitle: 'Detailed breakdown of Legal Metrology declaration breaches',
    headline: 'Violations & Enforcement Actions',
    description: 'Enforcement tracking for missing or non-compliant mandatory declarations under PC Rules, 2011.',
    stepInfo: 'Scheduled for Step 6',
    details: 'Will track missing declarations (MRP, Net Quantity, Mfg Date, Consumer Care, Manufacturer details) and repeat-offender patterns.',
    icon: AlertTriangle
  },

  'compliance-reports': {
    title: 'Compliance Reports',
    subtitle: 'Statutory reporting and audit summaries under PC Rules, 2011',
    headline: 'Compliance Reports & Analytics',
    description: 'Official enforcement analytics and exportable compliance summaries.',
    stepInfo: 'Scheduled for Step 7',
    details: 'Enables supervisors to generate official compliance reports, zone summaries, and audit exports for the Department of Consumer Affairs.',
    icon: FileBarChart
  },

  inspectors: {
    title: 'Inspectors',
    subtitle: 'Field inspector workforce deployment and scanning performance',
    headline: 'Field Inspector Monitoring',
    description: 'Field officer directory, active inspection locations, and scanning productivity.',
    stepInfo: 'Scheduled for Step 8',
    details: 'Tracks field inspectors, their assigned districts/markets, total scans performed, and verification accuracy.',
    icon: Users
  },

  'inspection-history': {
    title: 'Inspection History',
    subtitle: 'Chronological audit trail of all commodity scans and verification actions',
    headline: 'Inspection Audit Trail',
    description: 'Complete chronological history and timestamped audit logs of all past inspections.',
    stepInfo: 'Scheduled for Step 9',
    details: 'Provides a tamper-evident record of all historical scans, supervisor reviews, and enforcement actions taken.',
    icon: History
  }
};

function App() {
  const getRouteFromHash = () => {
    const hash = window.location.hash.replace('#', '');

    if (hash.startsWith('product-details/')) {
      return 'product-details';
    }

    return SECTIONS_CONFIG[hash] ? hash : 'overview';
  };

  const getInspectionFromHash = () => {
    const hash = window.location.hash.replace('#', '');

    if (!hash.startsWith('product-details/')) {
      return null;
    }

    const inspectionId = hash.split('/')[1];

    return (
      INSPECTION_HISTORY_DATA.find(
        (item) => item.id === inspectionId
      ) || null
    );
  };

  const [currentSection, setCurrentSection] = useState(getRouteFromHash);
  const [selectedInspection, setSelectedInspection] = useState(
    getInspectionFromHash
  );

  useEffect(() => {
    const handleHashChange = () => {
      const route = getRouteFromHash();

      if (route === 'product-details') {
        setSelectedInspection(getInspectionFromHash());
      } else {
        setSelectedInspection(null);
        setCurrentSection(route);
      }
    };

    window.addEventListener('hashchange', handleHashChange);

    return () => {
      window.removeEventListener('hashchange', handleHashChange);
    };
  }, []);

  const handleSelectSection = (sectionId) => {
    setSelectedInspection(null);
    setCurrentSection(sectionId);
    window.location.hash = sectionId;
  };

  const handleViewInspection = (inspectionId) => {
    const inspection = INSPECTION_HISTORY_DATA.find(
      (item) => item.id === inspectionId
    );

    setSelectedInspection(inspection || null);
    window.location.hash = `product-details/${inspectionId}`;
  };

  const handleBackToHistory = () => {
    setSelectedInspection(null);
    setCurrentSection('inspection-history');
    window.location.hash = 'inspection-history';
  };

  const activeMeta =
    SECTIONS_CONFIG[currentSection] ||
    SECTIONS_CONFIG.overview;

  const SectionIcon = activeMeta.icon;

  return (
    <MainLayout
      currentSection={currentSection}
      onSelectSection={handleSelectSection}
      sectionMeta={activeMeta}
    >
      {selectedInspection ? (
        <ProductDetailsPage
          product={{
            ...selectedInspection,
            inspectionId: selectedInspection.id
          }}
          onBack={handleBackToHistory}
        />
      ) : currentSection === 'overview' ? (
        <OverviewPage />
      ) : currentSection === 'scanned-products' ? (
        <ScannedProductsPage />
      ) : currentSection === 'violations' ? (
        <ViolationsPage />
      ) : currentSection === 'compliance-reports' ? (
        <ComplianceReportsPage />
      ) : currentSection === 'inspectors' ? (
        <InspectorsPage />
      ) : currentSection === 'inspection-history' ? (
        <InspectionHistoryPage
          onViewInspection={handleViewInspection}
        />
      ) : (
        <div className="placeholder-container">
          <div className="placeholder-card">
            <div className="placeholder-header">
              <div className="placeholder-title-group">
                <div
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.75rem',
                    marginBottom: '0.25rem'
                  }}
                >
                  <SectionIcon
                    size={24}
                    color="var(--color-primary)"
                  />

                  <h2 className="placeholder-title">
                    {activeMeta.headline}
                  </h2>
                </div>

                <p className="placeholder-desc">
                  {activeMeta.description}
                </p>
              </div>

              <span className="placeholder-step-badge">
                {activeMeta.stepInfo}
              </span>
            </div>

            <div className="placeholder-info-box">
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.5rem',
                  marginBottom: '0.5rem',
                  color: 'var(--color-primary)',
                  fontWeight: 600
                }}
              >
                <Info size={16} />
                <span>Section Scope & Roadmap:</span>
              </div>

              <p>{activeMeta.details}</p>
            </div>

            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '0.5rem',
                fontSize: '0.8rem',
                color: 'var(--color-text-muted)',
                marginTop: '0.5rem'
              }}
            >
              <ShieldAlert
                size={15}
                color="var(--color-text-subtle)"
              />

              <span>
                Legal Metrology (Packaged Commodities) Rules, 2011
                Compliance System &bull; Active Layout Shell
              </span>
            </div>
          </div>
        </div>
      )}
    </MainLayout>
  );
}

export default App;