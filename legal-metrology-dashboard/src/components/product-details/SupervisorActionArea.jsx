import React, { useState } from 'react';
import { ArrowLeft, CheckCircle2, BookmarkPlus, Download, Info } from 'lucide-react';
import './SupervisorActionArea.css';

function SupervisorActionArea({ detail, onBack, onScrollToEvidence }) {
  const [reviewStatus, setReviewStatus] = useState(null); // 'marked' | 'endorsed' | null
  const [feedbackMessage, setFeedbackMessage] = useState('');

  const handleMarkForReview = () => {
    setReviewStatus('marked');
    setFeedbackMessage(`Inspection ${detail.inspectionId} has been marked for supervisory compliance hearing (Mock UI state).`);
    setTimeout(() => setFeedbackMessage(''), 5000);
  };

  const handleEndorseRecord = () => {
    setReviewStatus('endorsed');
    setFeedbackMessage(`Inspection ${detail.inspectionId} verified and endorsed by Senior Enforcement Officer (Mock UI state).`);
    setTimeout(() => setFeedbackMessage(''), 5000);
  };

  const handleMockDownload = () => {
    setFeedbackMessage(`Generating statutory inspection dossier for ${detail.inspectionId}... (Mock download demo)`);
    setTimeout(() => setFeedbackMessage(''), 4000);
  };

  return (
    <div className="supervisor-actions-card">
      <div className="actions-header">
        <h4 className="actions-title">Supervisory Disposition & Actions</h4>
        <span className="actions-mock-note">Demonstration Console &bull; UI State Only</span>
      </div>

      {feedbackMessage && (
        <div className="action-feedback-toast">
          <Info size={15} />
          <span>{feedbackMessage}</span>
        </div>
      )}

      <div className="actions-row">
        <div className="actions-left-group">
          {detail.status === 'Non-Compliant' ? (
            <button
              type="button"
              className={`act-btn act-primary ${reviewStatus === 'marked' ? 'act-active' : ''}`}
              onClick={handleMarkForReview}
              title="Flag record for formal compounding / explanation memo"
            >
              <BookmarkPlus size={16} />
              <span>{reviewStatus === 'marked' ? '✓ Flagged for Supervisor Hearing' : 'Mark for Supervisory Review'}</span>
            </button>
          ) : (
            <button
              type="button"
              className={`act-btn act-success ${reviewStatus === 'endorsed' ? 'act-active' : ''}`}
              onClick={handleEndorseRecord}
              title="Endorse and archive compliant inspection record"
            >
              <CheckCircle2 size={16} />
              <span>{reviewStatus === 'endorsed' ? '✓ Record Endorsed by Officer' : 'Endorse Inspection Record'}</span>
            </button>
          )}

          <button
            type="button"
            className="act-btn act-secondary"
            onClick={onScrollToEvidence}
            title="Jump to high-resolution evidence viewer"
          >
            <span>View Scanned Evidence</span>
          </button>

          <button
            type="button"
            className="act-btn act-secondary"
            onClick={handleMockDownload}
            title="Generate exportable verification dossier (demonstration)"
          >
            <Download size={15} />
            <span>Download Statutory Dossier</span>
          </button>
        </div>

        <button
          type="button"
          className="act-btn act-back"
          onClick={onBack}
        >
          <ArrowLeft size={16} />
          <span>Return to Scanned Products</span>
        </button>
      </div>

      <div className="actions-disclaimer">
        <Info size={13} />
        <span>
          Statutory Note: Supervisory endorsements and review flags in this interface operate in demonstration state. No external regulatory notifications or enforcement notices are dispatched.
        </span>
      </div>
    </div>
  );
}

export default SupervisorActionArea;
