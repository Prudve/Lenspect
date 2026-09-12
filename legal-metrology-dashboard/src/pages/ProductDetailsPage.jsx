import React, { useRef } from 'react';
import InspectionHeader from '../components/product-details/InspectionHeader';
import EvidenceViewer from '../components/product-details/EvidenceViewer';
import ExtractedInformation from '../components/product-details/ExtractedInformation';
import DeclarationChecklist from '../components/product-details/DeclarationChecklist';
import ViolationDetails from '../components/product-details/ViolationDetails';
import InspectorDetailsCard from '../components/product-details/InspectorDetailsCard';
import InspectionTimeline from '../components/product-details/InspectionTimeline';
import SupervisorActionArea from '../components/product-details/SupervisorActionArea';

import { getInspectionDetail } from '../data/productDetailsMockData';
import './ProductDetailsPage.css';

function ProductDetailsPage({ product, onBack }) {
  const evidenceRef = useRef(null);

  if (!product) return null;

  // Retrieve comprehensive mock inspection details
  const detail = getInspectionDetail(product.inspectionId) || {
    ...product,
    extractedData: {},
    checklist: [],
    violations: [],
    timeline: []
  };

  const isCompliant = detail.status === 'Compliant';

  const scrollToEvidence = () => {
    evidenceRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <div className="product-details-page">
      {/* TOP & ROW 1: Breadcrumb, Inspection ID, Product Identity & Compliance Status */}
      <InspectionHeader 
        detail={detail} 
        onBack={onBack} 
        backLabel="Inspection History" 
      />

      {/* ROW 2: Package Evidence Viewer & Extracted Package Information */}
      <div className="details-grid-two-col" ref={evidenceRef}>
        <div className="grid-evidence-col">
          <EvidenceViewer detail={detail} />
        </div>
        <div className="grid-extracted-col">
          <ExtractedInformation 
            extractedData={detail.extractedData} 
            isCompliant={isCompliant} 
          />
        </div>
      </div>

      {/* ROW 3: Mandatory Declaration Compliance Checklist */}
      <div className="details-full-row">
        <DeclarationChecklist checklist={detail.checklist} />
      </div>

      {/* ROW 4: Detected Violations Section */}
      <div className="details-full-row">
        <ViolationDetails 
          violations={detail.violations} 
          isCompliant={isCompliant} 
        />
      </div>

      {/* ROW 5: Field Inspector Information & Process Timeline */}
      <div className="details-grid-two-col">
        <div className="grid-inspector-col">
          <InspectorDetailsCard detail={detail} />
        </div>
        <div className="grid-timeline-col">
          <InspectionTimeline timeline={detail.timeline} />
        </div>
      </div>

      {/* BOTTOM: Supervisory Action Area */}
      <div className="details-full-row">
        <SupervisorActionArea 
          detail={detail} 
          onBack={onBack} 
          onScrollToEvidence={scrollToEvidence} 
        />
      </div>
    </div>
  );
}

export default ProductDetailsPage;
