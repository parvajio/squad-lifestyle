import React from 'react';
import { getServerSession } from 'next-auth';
import { redirect } from 'next/navigation';
import { authOptions } from '../api/auth/[...nextauth]/route';
import AdminShell from './components/AdminShell';

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const session = await getServerSession(authOptions);

  // Protected Route Guard: Admin Only
  if (!session || session.user?.role !== 'ADMIN') {
    redirect('/login');
  }

  return <AdminShell userEmail={session.user.email ?? 'admin'}>{children}</AdminShell>;
}
