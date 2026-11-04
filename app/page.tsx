'use client';

import { useState, useEffect } from 'react';
import { supabase, DropLocation } from '@/lib/supabase';
import Map from '@/components/Map';
import AddDropModal from '@/components/AddDropModal';
import { Crosshair, RefreshCw } from 'lucide-react';

export default function Home() {
  const [locations, setLocations] = useState<DropLocation[]>([]);
  const [gpsCoord, setGpsCoord] = useState<{ lat: number; lng: number } | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isLocating, setIsLocating] = useState(false);

  const fetchLocations = async () => {
    const { data, error } = await supabase
      .from('drop_locations')
      .select('*')
      .order('created_at', { ascending: false });

    if (!error && data) {
      setLocations(data);
    }
  };

  useEffect(() => {
    fetchLocations();
  }, []);

  const handleCurrentPosition = () => {
    if (!navigator.geolocation) {
      alert('Geolocation not supported by device');
      return;
    }
    setIsLocating(true);
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setGpsCoord({ lat: pos.coords.latitude, lng: pos.coords.longitude });
        setIsModalOpen(true);
        setIsLocating(false);
      },
      (err) => {
        alert(`Location error: ${err.message}`);
        setIsLocating(false);
      },
      { enableHighAccuracy: true }
    );
  };

  return (
    <main className="relative w-screen h-[100dvh] flex flex-col overflow-hidden bg-slate-950">
      <header className="absolute top-4 left-4 right-4 z-20 flex items-center justify-between pointer-events-none">
        <div className="bg-slate-900/90 backdrop-blur-md px-3.5 py-2 rounded-xl border border-slate-800 shadow-lg pointer-events-auto">
          <h1 className="text-sm font-bold text-white flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            Keg Drop Guide
          </h1>
          <p className="text-[10px] text-slate-400">{locations.length} venues mapped</p>
        </div>

        <button
          onClick={fetchLocations}
          className="bg-slate-900/90 backdrop-blur-md p-2.5 rounded-xl border border-slate-800 shadow-lg pointer-events-auto text-slate-300 hover:text-white"
        >
          <RefreshCw size={16} />
        </button>
      </header>

      {/* Full Screen Map */}
      <div className="relative flex-1 w-full h-full min-h-[400px] z-0">
        <Map
          locations={locations}
          onSelectCoords={(lat, lng) => {
            setGpsCoord({ lat, lng });
            setIsModalOpen(true);
          }}
          selectedCoord={gpsCoord}
        />
      </div>

      <div className="absolute bottom-6 left-4 right-4 z-20 flex gap-3 pointer-events-none">
        <button
          onClick={handleCurrentPosition}
          disabled={isLocating}
          className="w-full pointer-events-auto flex items-center justify-center gap-2 py-4 px-4 bg-amber-500 hover:bg-amber-400 text-slate-950 rounded-xl font-bold text-sm shadow-xl active:scale-95 transition-all"
        >
          <Crosshair size={18} className={isLocating ? 'animate-spin' : ''} />
          {isLocating ? 'Finding Dock...' : 'Log Current Location'}
        </button>
      </div>

      {isModalOpen && gpsCoord ? (
        <AddDropModal
          coord={gpsCoord}
          onClose={() => {
            setIsModalOpen(false);
            setGpsCoord(null);
          }}
          onSuccess={fetchLocations}
        />
      ) : null}
    </main>
  );
}