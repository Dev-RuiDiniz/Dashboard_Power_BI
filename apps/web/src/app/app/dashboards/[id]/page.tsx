'use client';

import { useRouter } from 'next/navigation';
import { useState } from 'react';

import { DashboardDetail } from '@/components/dashboard/dashboard-detail';
import { AddWidgetModal } from '@/components/dashboard/add-widget-modal';
import { EditDashboardModal } from '@/components/dashboard/edit-dashboard-modal';
import type { UserDashboard } from '@/lib/platform-api';

export default function DashboardDetailPage({ params }: { params: { id: string } }) {
  const router = useRouter();
  const [showAddWidget, setShowAddWidget] = useState(false);
  const [showEdit, setShowEdit] = useState(false);
  const [refreshKey, setRefreshKey] = useState(0);

  return (
    <>
      <DashboardDetail
        key={refreshKey}
        dashboardId={params.id}
        onBack={() => router.push('/app/dashboards')}
        onEdit={() => setShowEdit(true)}
        onAddWidget={() => setShowAddWidget(true)}
      />

      {showAddWidget && (
        <AddWidgetModal
          dashboardId={params.id}
          onClose={() => setShowAddWidget(false)}
          onSuccess={() => {
            setShowAddWidget(false);
            setRefreshKey((k) => k + 1);
          }}
        />
      )}

      {showEdit && (
        <EditDashboardModal
          dashboardId={params.id}
          onClose={() => setShowEdit(false)}
          onSuccess={() => {
            setShowEdit(false);
            setRefreshKey((k) => k + 1);
          }}
        />
      )}
    </>
  );
}
