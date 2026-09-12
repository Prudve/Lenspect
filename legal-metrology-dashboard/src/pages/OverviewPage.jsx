import React from 'react';
import { Link } from 'react-router-dom';
import { Flame, ArrowUpRight } from 'lucide-react';
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

      {/* 2. REPEAT VIOLATION ALERT (Supervisory Enforcement Notice) */}
      <section className="overview-section" aria-label="Enforcement Alerts">
        <RepeatViolationAlert alertData={REPEAT_VIOLATION_ALERT} />
      </section>

      {/* 3. GEOGRAPHICAL HOTSPOT INTELLIGENCE CARD */}
      <section className="overview-section" aria-label="Geographical Hotspot Surveillance">
        <div className="hotspot-summary-card">
          <div className="hotspot-summary-header">
            <div className="hotspot-summary-left">
              <div className="hotspot-icon-badge">
                <Flame size={20} color="#EA580C" />
              </div>
              <div>
                <h3 className="hotspot-title">Active Jurisdiction Hotspots</h3>
                <p className="hotspot-desc">High-offence clusters requiring supervisory enforcement deployment under PC Rules, 2011</p>
              </div>
            </div>
            <Link to="/hotspot-map" className="hotspot-cta-btn">
              <span>View Interactive GIS Heatmap</span>
              <ArrowUpRight size={16} />
            </Link>
          </div>

          <div className="hotspot-pills-row">
            <div className="hotspot-cluster-pill">
              <span className="cluster-dot red" />
              <div className="cluster-info">
                <span className="cluster-name">Chandni Chowk Hub (110006)</span>
                <span className="cluster-stat">14 Violations • Rule 6(11) Overwriting</span>
              </div>
            </div>

            <div className="hotspot-cluster-pill">
              <span className="cluster-dot orange" />
              <div className="cluster-info">
                <span className="cluster-name">Okhla Industrial Area (110020)</span>
                <span className="cluster-stat">9 Violations • Rule 9 Missing Mfg Date</span>
              </div>
            </div>

            <div className="hotspot-cluster-pill">
              <span className="cluster-dot amber" />
              <div className="cluster-info">
                <span className="cluster-name">Pitampura Commercial (110034)</span>
                <span className="cluster-stat">7 Violations • Rule 6(1)(e) Net Qty Discrepancy</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 4. MIDDLE: Compliance Trend & Violation Distribution */}
      <section className="overview-section middle-grid" aria-label="Compliance Analytics">
        <div className="trend-column">
          <ComplianceTrendChart data={COMPLIANCE_TREND_DATA} />
        </div>
        <div className="summary-column">
          <ViolationSummaryCard categories={VIOLATION_SUMMARY_DATA} />
        </div>
      </section>

      {/* 5. BOTTOM: Recent Inspection Activity & Flagged Violations */}
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
