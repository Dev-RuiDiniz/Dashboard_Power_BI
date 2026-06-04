'use client';

import { useState } from 'react';

import { ReportCatalogContainer } from '@/components/reports/report-catalog-container';
import { ReportDetail } from '@/components/reports/report-detail';

export default function ReportsPage() {
  const [selectedReportId, setSelectedReportId] = useState<string | null>(null);

  if (selectedReportId) {
    return <ReportDetail reportId={selectedReportId} onBack={() => setSelectedReportId(null)} />;
  }

  return <ReportCatalogContainer onSelectReport={setSelectedReportId} />;
}
