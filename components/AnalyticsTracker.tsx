'use client';

import { Suspense } from 'react';
import { Analytics } from '@vercel/analytics/react';

export default function AnalyticsTracker() {
  return (
    <Suspense fallback={null}>
      <Analytics />
    </Suspense>
  );
}