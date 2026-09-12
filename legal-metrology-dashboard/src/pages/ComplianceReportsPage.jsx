import React, { useMemo, useState } from 'react';
import {
  FileBarChart,
  Download,
  TrendingUp,
  AlertTriangle,
  CheckCircle2,
  Users,
  Building2
} from 'lucide-react';

import {
  REPORT_SUMMARY,
  COMPLIANCE_TREND_DATA,
  VIOLATION_CATEGORY_DATA,
  INSPECTOR_REPORT_DATA,
  MANUFACTURER_REPORT_DATA,
  REPORT_PERIODS
} from '../data/reportsMockData';

import './ComplianceReportsPage.css';

function ComplianceReportsPage() {
  const [selectedPeriod, setSelectedPeriod] = useState('Last 7 Days');

  const trendTotal = useMemo(
    () =>
      COMPLIANCE_TREND_DATA.reduce(
        (total, item) => total + item.inspections,
        0
      ),
    []
  );

  const trendCompliant = useMemo(
    () =>
      COMPLIANCE_TREND_DATA.reduce(
        (total, item) => total + item.compliant,
        0
      ),
    []
  );

  const trendRate = ((trendCompliant / trendTotal) * 100).toFixed(1);
  const handleExport = () => {
  const rows = [
    ['Legal Metrology Compliance Report'],
    ['Report Period', selectedPeriod],
    [],
    ['Summary'],
    ['Total Inspections', REPORT_SUMMARY.totalInspections],
    ['Compliant', REPORT_SUMMARY.compliant],
    ['Non-Compliant', REPORT_SUMMARY.nonCompliant],
    ['Compliance Rate', `${REPORT_SUMMARY.complianceRate}%`],
    ['Active Inspectors', REPORT_SUMMARY.activeInspectors],
    [],
    ['Violation Category', 'Count', 'Percentage'],
    ...VIOLATION_CATEGORY_DATA.map(item => [
      item.category,
      item.count,
      `${item.percentage}%`
    ]),
    [],
    ['Inspector Performance'],
    ['Inspector ID', 'Inspector Name', 'Inspections', 'Compliant', 'Non-Compliant', 'Compliance Rate'],
    ...INSPECTOR_REPORT_DATA.map(item => [
      item.id,
      item.name,
      item.inspections,
      item.compliant,
      item.nonCompliant,
      `${item.complianceRate}%`
    ]),
    [],
    ['Manufacturer Compliance Summary'],
    ['Manufacturer', 'Inspections', 'Violations', 'Status'],
    ...MANUFACTURER_REPORT_DATA.map(item => [
      item.name,
      item.inspections,
      item.violations,
      item.status
    ])
  ];

  const csvContent = rows
    .map(row =>
      row
        .map(value => `"${String(value).replace(/"/g, '""')}"`)
        .join(',')
    )
    .join('\n');

  const blob = new Blob([csvContent], {
    type: 'text/csv;charset=utf-8;'
  });

  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');

  link.href = url;
  link.download = `legal-metrology-report-${selectedPeriod
    .toLowerCase()
    .replace(/\s+/g, '-')}.csv`;

  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);

  URL.revokeObjectURL(url);
};

  return (
    <div className="reports-page">
      {/* Page Header */}
      <div className="reports-page-header">
        <div>
          <div className="reports-title-row">
            <div className="reports-title-icon">
              <FileBarChart size={21} />
            </div>
            <div>
              <h2>Compliance Reports</h2>
              <p>
                Generate compliance summaries and enforcement reports
                from field inspection data.
              </p>
            </div>
          </div>
        </div>

        <div className="reports-actions">
          <select
            value={selectedPeriod}
            onChange={(e) => setSelectedPeriod(e.target.value)}
          >
            {REPORT_PERIODS.map((period) => (
              <option key={period} value={period}>
                {period}
              </option>
            ))}
          </select>

          <button className="export-report-button" onClick={handleExport}>
            <Download size={16} />
            Export Report
          </button>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="report-summary-grid">
        <div className="report-summary-card">
          <div className="report-card-icon total">
            <FileBarChart size={19} />
          </div>
          <div>
            <span>Total Inspections</span>
            <strong>{REPORT_SUMMARY.totalInspections.toLocaleString()}</strong>
            <small>All recorded inspections</small>
          </div>
        </div>

        <div className="report-summary-card">
          <div className="report-card-icon compliant">
            <CheckCircle2 size={19} />
          </div>
          <div>
            <span>Compliant</span>
            <strong>{REPORT_SUMMARY.compliant.toLocaleString()}</strong>
            <small>Packages meeting requirements</small>
          </div>
        </div>

        <div className="report-summary-card">
          <div className="report-card-icon non-compliant">
            <AlertTriangle size={19} />
          </div>
          <div>
            <span>Non-Compliant</span>
            <strong>{REPORT_SUMMARY.nonCompliant.toLocaleString()}</strong>
            <small>Inspections requiring attention</small>
          </div>
        </div>

        <div className="report-summary-card">
          <div className="report-card-icon rate">
            <TrendingUp size={19} />
          </div>
          <div>
            <span>Compliance Rate</span>
            <strong>{REPORT_SUMMARY.complianceRate}%</strong>
            <small>Overall recorded rate</small>
          </div>
        </div>

        <div className="report-summary-card">
          <div className="report-card-icon inspectors">
            <Users size={19} />
          </div>
          <div>
            <span>Active Inspectors</span>
            <strong>{REPORT_SUMMARY.activeInspectors}</strong>
            <small>Currently assigned officers</small>
          </div>
        </div>
      </div>

      {/* Trend + Violation Distribution */}
      <div className="reports-two-column">
        <section className="report-panel">
          <div className="report-panel-header">
            <div>
              <h3>Compliance Trend</h3>
              <p>Inspection results recorded over the selected reporting period.</p>
            </div>
            <span className="trend-rate">{trendRate}%</span>
          </div>

          <div className="trend-chart">
            <div className="chart-y-labels">
              <span>220</span>
              <span>165</span>
              <span>110</span>
              <span>55</span>
              <span>0</span>
            </div>

            <div className="chart-area">
              <div className="chart-grid-line line-1" />
              <div className="chart-grid-line line-2" />
              <div className="chart-grid-line line-3" />
              <div className="chart-grid-line line-4" />

              <div className="bars">
                {COMPLIANCE_TREND_DATA.map((item) => {
                  const totalHeight = (item.inspections / 220) * 100;
                  const compliantHeight =
                    (item.compliant / item.inspections) * totalHeight;

                  return (
                    <div className="chart-bar-group" key={item.date}>
                      <div className="chart-bar-container">
                        <div
                          className="chart-bar total-bar"
                          style={{ height: `${totalHeight}%` }}
                          title={`${item.inspections} inspections`}
                        >
                          <div
                            className="chart-bar-compliant"
                            style={{ height: `${compliantHeight}%` }}
                          />
                        </div>
                      </div>
                      <span>{item.date}</span>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>

          <div className="chart-legend">
            <span>
              <i className="legend-box compliant-box" />
              Compliant
            </span>
            <span>
              <i className="legend-box non-compliant-box" />
              Non-Compliant
            </span>
          </div>
        </section>

        <section className="report-panel">
          <div className="report-panel-header">
            <div>
              <h3>Violations by Category</h3>
              <p>Distribution of detected declaration issues.</p>
            </div>
          </div>

          <div className="violation-distribution">
            {VIOLATION_CATEGORY_DATA.map((item) => (
              <div className="distribution-row" key={item.category}>
                <div className="distribution-info">
                  <span>{item.category}</span>
                  <strong>{item.count}</strong>
                </div>

                <div className="distribution-bar">
                  <div
                    className="distribution-fill"
                    style={{ width: `${item.percentage}%` }}
                  />
                </div>

                <span className="distribution-percent">
                  {item.percentage}%
                </span>
              </div>
            ))}
          </div>
        </section>
      </div>

      {/* Inspector Performance */}
      <section className="report-panel full-width-panel">
        <div className="report-panel-header">
          <div>
            <h3>Inspector Performance Summary</h3>
            <p>
              Inspection volume and compliance results by field inspector.
            </p>
          </div>
        </div>

        <div className="report-table-wrapper">
          <table className="report-table">
            <thead>
              <tr>
                <th>Inspector</th>
                <th>Inspector ID</th>
                <th>Total Inspections</th>
                <th>Compliant</th>
                <th>Non-Compliant</th>
                <th>Compliance Rate</th>
              </tr>
            </thead>

            <tbody>
              {INSPECTOR_REPORT_DATA.map((inspector) => (
                <tr key={inspector.id}>
                  <td>
                    <div className="person-cell">
                      <div className="person-icon">
                        <Users size={15} />
                      </div>
                      <strong>{inspector.name}</strong>
                    </div>
                  </td>
                  <td>
                    <span className="report-id">{inspector.id}</span>
                  </td>
                  <td>{inspector.inspections}</td>
                  <td>
                    <span className="table-positive">
                      {inspector.compliant}
                    </span>
                  </td>
                  <td>
                    <span className="table-negative">
                      {inspector.nonCompliant}
                    </span>
                  </td>
                  <td>
                    <div className="rate-cell">
                      <span>{inspector.complianceRate}%</span>
                      <div className="mini-progress">
                        <div
                          style={{
                            width: `${inspector.complianceRate}%`
                          }}
                        />
                      </div>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      {/* Manufacturer Summary */}
      <section className="report-panel full-width-panel">
        <div className="report-panel-header">
          <div>
            <h3>Manufacturer Compliance Summary</h3>
            <p>
              Manufacturers with notable inspection and violation activity.
            </p>
          </div>
        </div>

        <div className="manufacturer-grid">
          {MANUFACTURER_REPORT_DATA.map((manufacturer) => (
            <div className="manufacturer-card" key={manufacturer.name}>
              <div className="manufacturer-icon">
                <Building2 size={18} />
              </div>

              <div className="manufacturer-content">
                <strong>{manufacturer.name}</strong>

                <div className="manufacturer-stats">
                  <span>
                    Inspections <b>{manufacturer.inspections}</b>
                  </span>
                  <span>
                    Violations <b>{manufacturer.violations}</b>
                  </span>
                </div>

                <span
                  className={`manufacturer-status status-${manufacturer.status
                    .toLowerCase()
                    .replace(/\s+/g, '-')}`}
                >
                  {manufacturer.status}
                </span>
              </div>
            </div>
          ))}
        </div>
      </section>

      <div className="reports-demo-note">
        <FileBarChart size={15} />
        <span>
          Report values shown above are prototype data for the SIH dashboard.
          Live values will be populated from the inspection backend.
        </span>
      </div>
    </div>
  );
}

export default ComplianceReportsPage;