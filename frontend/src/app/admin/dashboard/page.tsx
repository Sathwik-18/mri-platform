'use client';

import { Navbar } from '@/components/shared/Navbar';
import { AdminDashboard } from '@/components/dashboards/AdminDashboard';

export default function AdminDashboardPage() {
  return (
    <>
      <Navbar />
      <div className="min-h-screen bg-gray-50 dark:bg-gray-950 pt-24">
        <AdminDashboard />
      </div>
    </>
  );
}
