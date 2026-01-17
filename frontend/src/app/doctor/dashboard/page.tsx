'use client';

import { Navbar } from '@/components/shared/Navbar';
import { DoctorDashboard } from '@/components/dashboards/DoctorDashboard';

export default function DoctorDashboardPage() {
  return (
    <>
      <Navbar />
      <div className="min-h-screen bg-gray-50 dark:bg-gray-950 pt-24">
        <DoctorDashboard />
      </div>
    </>
  );
}
