'use client';

import { Navbar } from '@/components/shared/Navbar';
import { PatientDashboard } from '@/components/dashboards/PatientDashboard';

export default function PatientDashboardPage() {
  return (
    <>
      <Navbar />
      <div className="min-h-screen bg-gray-50 dark:bg-gray-950 pt-24">
        <PatientDashboard />
      </div>
    </>
  );
}
