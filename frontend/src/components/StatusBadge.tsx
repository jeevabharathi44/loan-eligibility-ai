import React from 'react';
import { ApplicationStatus } from '../types';
import { CheckCircle2, Clock, AlertTriangle, XCircle } from 'lucide-react';

interface StatusBadgeProps {
  status: ApplicationStatus | string;
}

export const StatusBadge: React.FC<StatusBadgeProps> = ({ status }) => {
  switch (status) {
    case 'APPROVED':
      return (
        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold bg-ok/15 text-ok border border-ok/30">
          <CheckCircle2 className="w-3.5 h-3.5" />
          Approved
        </span>
      );
    case 'NEEDS_REVIEW':
      return (
        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold bg-warn/15 text-warn border border-warn/30">
          <AlertTriangle className="w-3.5 h-3.5" />
          Needs Review
        </span>
      );
    case 'DECLINED':
      return (
        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold bg-bad/15 text-bad border border-bad/30">
          <XCircle className="w-3.5 h-3.5" />
          Declined
        </span>
      );
    case 'PENDING':
    default:
      return (
        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold bg-mute/15 text-mute border border-line">
          <Clock className="w-3.5 h-3.5" />
          Pending
        </span>
      );
  }
};

export const RiskBadge: React.FC<{ risk: string }> = ({ risk }) => {
  switch (risk) {
    case 'Low':
      return (
        <span className="px-2 py-0.5 rounded text-[11px] font-bold bg-ok/15 text-ok border border-ok/30">
          Low Risk
        </span>
      );
    case 'Moderate':
      return (
        <span className="px-2 py-0.5 rounded text-[11px] font-bold bg-warn/15 text-warn border border-warn/30">
          Moderate Risk
        </span>
      );
    case 'High':
    default:
      return (
        <span className="px-2 py-0.5 rounded text-[11px] font-bold bg-bad/15 text-bad border border-bad/30">
          High Risk
        </span>
      );
  }
};
