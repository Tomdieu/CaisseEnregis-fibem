'use client'

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const router = useRouter();

  useEffect(() => {
    // Redirect to the POS dashboard as the main entry point for the cash register system
    router.push('/dashboard/pos');
  }, [router]);

  return (
    <div>
      {children}
    </div>
  );
}