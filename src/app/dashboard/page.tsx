'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function DashboardPage() {
  const router = useRouter();

  useEffect(() => {
    // Redirect to the POS dashboard as the main entry point for the cash register system
    router.push('/dashboard/pos');
  }, [router]);

  return null; // Render nothing since we're redirecting
}