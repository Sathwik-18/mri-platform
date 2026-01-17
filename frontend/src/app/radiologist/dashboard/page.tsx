'use client';

import { Navbar } from '@/components/shared/Navbar';
import { RadiologistDashboard } from '@/components/dashboards/RadiologistDashboard';

export default function RadiologistDashboardPage() {
  return (
    <>
      <Navbar />
      <div className="min-h-screen bg-gray-50 dark:bg-gray-950 pt-24">
        <RadiologistDashboard />
      </div>
    </>
  );
}
