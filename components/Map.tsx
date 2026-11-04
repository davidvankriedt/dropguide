'use client';

import dynamic from 'next/dynamic';
import { DropLocation } from '@/lib/supabase';

const MapInner = dynamic(() => import('./MapInner'), {
  ssr: false,
  loading: () => (
    <div className="w-full h-full flex items-center justify-center bg-slate-900 text-slate-400 text-sm font-medium">
      Loading map...
    </div>
  ),
});

interface MapProps {
  locations: DropLocation[];
  onSelectCoords: (lat: number, lng: number) => void;
  selectedCoord: { lat: number; lng: number } | null;
}

export default function Map(props: MapProps) {
  return <MapInner {...props} />;
}