import AdminDashboard from '@/components/AdminDashboard';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Admin Dashboard | Course Registrations',
  description: 'Manage AI-Powered Frontend Developer course registrations and payment verification.',
};

export default function AdminRegistrationsPage() {
  return (
    <main className="flex-1">
      <AdminDashboard />
    </main>
  );
}
