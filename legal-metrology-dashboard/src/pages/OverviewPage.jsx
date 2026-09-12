import React from 'react';
import StatCard from '../components/dashboard/StatCard';
import RepeatViolationAlert from '../components/dashboard/RepeatViolationAlert';
import ComplianceTrendChart from '../components/dashboard/ComplianceTrendChart';
import ViolationSummaryCard from '../components/dashboard/ViolationSummaryCard';
import RecentInspectionsTable from '../components/dashboard/RecentInspectionsTable';
import RecentViolationsTable from '../components/dashboard/RecentViolationsTable';

import { 
  KPI_DATA, 
  COMPLIANCE_TREND_DATA, 
  VIOLATION_SUMMARY_DATA, 
  RECENT_INSPECTIONS_DATA, 
  RECENT_VIOLATIONS_DATA, 
  REPEAT_VIOLATION_ALERT 
} from '../data/overviewMockData';

import './OverviewPage.css';

function OverviewPage() {
  return (
    <div className="overview-page">
      {/* 1. TOP: KPI Summary Cards */}
      <section className="overview-section" aria-label="Key Performance Indicators">
        <div className="kpi-grid">
          {KPI_DATA.map((kpi) => (
            <StatCard key={kpi.id} item={kpi} />
          ))}
        </div>
      </section>

      {/* 2. REPEAT VIOLATION ALERT (Critical Supervisory Notice) */}
      <section className="overview-section" aria-label="Enforcement Alerts">
        <RepeatViolationAlert alertData={REPEAT_VIOLATION_ALERT} />
      </section>

      {/* 3. MIDDLE: Compliance Trend & Violation Distribution */}
      <section className="overview-section middle-grid" aria-label="Compliance Analytics">
        <div className="trend-column">
          <ComplianceTrendChart data={COMPLIANCE_TREND_DATA} />
        </div>
        <div className="summary-column">
          <ViolationSummaryCard categories={VIOLATION_SUMMARY_DATA} />
        </div>
      </section>

      {/* 4. BOTTOM: Recent Inspection Activity & Flagged Violations */}
      <section className="overview-section bottom-grid" aria-label="Recent Operational Activity">
        <div className="table-column">
          <RecentInspectionsTable inspections={RECENT_INSPECTIONS_DATA} />
        </div>
        <div className="table-column">
          <RecentViolationsTable violations={RECENT_VIOLATIONS_DATA} />
        </div>
      </section>
    </div>
  );
}

export default OverviewPage;
