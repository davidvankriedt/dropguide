'use client';

import { useState } from 'react';
import { supabase } from '@/lib/supabase';
import { Camera, X, Loader2 } from 'lucide-react';

interface AddDropModalProps {
  coord: { lat: number; lng: number };
  onClose: () => void;
  onSuccess: () => void;
}

export default function AddDropModal({ coord, onClose, onSuccess }: AddDropModalProps) {
  const [venueName, setVenueName] = useState('');
  const [address, setAddress] = useState('');
  const [instructions, setInstructions] = useState('');
  const [file, setFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!venueName) return;
    setUploading(true);

    try {
      let imageUrl = null;

      if (file) {
        const fileExt = file.name.split('.').pop();
        const fileName = `${Date.now()}-${Math.random().toString(36).substring(7)}.${fileExt}`;
        const { error: uploadError } = await supabase.storage
          .from('drop-photos')
          .upload(fileName, file);

        if (uploadError) throw uploadError;

        const { data: publicUrlData } = supabase.storage
          .from('drop-photos')
          .getPublicUrl(fileName);

        imageUrl = publicUrlData.publicUrl;
      }

      const { error: insertError } = await supabase.from('drop_locations').insert([
        {
          venue_name: venueName,
          address,
          dock_instructions: instructions,
          lat: coord.lat,
          lng: coord.lng,
          image_url: imageUrl,
        },
      ]);

      if (insertError) throw insertError;

      onSuccess();
      onClose();
    } catch (err: any) {
      alert(err.message || 'Error saving drop location');
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/70 flex items-end sm:items-center justify-center p-0 sm:p-4">
      <div className="w-full sm:max-w-md bg-slate-900 border border-slate-800 rounded-t-2xl sm:rounded-2xl p-5 shadow-2xl max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-lg font-bold text-white">Add Keg Drop Point</h2>
          <button onClick={onClose} className="p-1 text-slate-400 hover:text-white">
            <X size={20} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-3.5">
          <div>
            <label className="text-xs font-medium text-slate-300">Venue Name *</label>
            <input
              type="text"
              required
              placeholder="e.g. The Oaks Hotel"
              value={venueName}
              onChange={(e) => setVenueName(e.target.value)}
              className="w-full mt-1 px-3 py-2 bg-slate-800 border border-slate-700 rounded-lg text-sm text-white focus:outline-none focus:border-amber-500"
            />
          </div>

          <div>
            <label className="text-xs font-medium text-slate-300">Address / Cross Street</label>
            <input
              type="text"
              placeholder="e.g. 118 Military Rd (Laneway entrance)"
              value={address}
              onChange={(e) => setAddress(e.target.value)}
              className="w-full mt-1 px-3 py-2 bg-slate-800 border border-slate-700 rounded-lg text-sm text-white focus:outline-none focus:border-amber-500"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs font-medium text-slate-300">Coordinates</label>
              <div className="mt-1 px-3 py-2 bg-slate-950 border border-slate-800 rounded-lg text-xs font-mono text-slate-400 truncate">
                {coord.lat.toFixed(4)}, {coord.lng.toFixed(4)}
              </div>
            </div>
          </div>

          <div>
            <label className="text-xs font-medium text-slate-300">Dock & Keg Room Instructions</label>
            <textarea
              rows={2}
              placeholder="e.g. Back in from rear alley. Keg cellar door is around left of cool room."
              value={instructions}
              onChange={(e) => setInstructions(e.target.value)}
              className="w-full mt-1 px-3 py-2 bg-slate-800 border border-slate-700 rounded-lg text-sm text-white focus:outline-none focus:border-amber-500"
            />
          </div>

          <div>
            <label className="text-xs font-medium text-slate-300">Dock / Access Photo</label>
            <label className="mt-1 flex items-center justify-center gap-2 px-4 py-3 bg-slate-800 border border-dashed border-slate-700 hover:border-slate-500 rounded-lg cursor-pointer">
              <Camera size={18} className="text-amber-500" />
              <span className="text-xs text-slate-300">
                {file ? file.name : 'Take Photo or Choose File'}
              </span>
              <input
                type="file"
                accept="image/*"
                capture="environment"
                onChange={(e) => e.target.files?.[0] && setFile(e.target.files[0])}
                className="hidden"
              />
            </label>
          </div>

          <button
            type="submit"
            disabled={uploading}
            className="w-full mt-4 flex items-center justify-center gap-2 py-3 bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold rounded-lg transition-colors text-sm disabled:opacity-50"
          >
            {uploading ? (
              <>
                <Loader2 size={16} className="animate-spin" /> Saving Drop Location...
              </>
            ) : (
              'Save Drop Location'
            )}
          </button>
        </form>
      </div>
    </div>
  );
}