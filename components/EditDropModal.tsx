'use client';

import { useState } from 'react';
import { supabase, DropLocation } from '@/lib/supabase';
import { X, Save, Loader2, Camera, Trash2, Plus } from 'lucide-react';

interface EditDropModalProps {
  location: DropLocation;
  onClose: () => void;
  onSuccess: () => void;
}

export default function EditDropModal({ location, onClose, onSuccess }: EditDropModalProps) {
  const [title, setTitle] = useState(location.venue_name || '');
  const [dockInstructions, setDockInstructions] = useState(location.dock_instructions || '');

  // Pre-load existing photos (check image_urls array first, fallback to legacy image_url)
  const initialImages = location.image_urls?.length 
    ? location.image_urls 
    : (location.image_url ? [location.image_url] : []);

  const [existingImages, setExistingImages] = useState<string[]>(initialImages);
  const [newFiles, setNewFiles] = useState<File[]>([]);
  const [saving, setSaving] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const selected = Array.from(e.target.files);
      setNewFiles((prev) => [...prev, ...selected]);
    }
  };

  const removeExistingImage = (urlToRemove: string) => {
    setExistingImages((prev) => prev.filter((url) => url !== urlToRemove));
  };

  const removeNewFile = (indexToRemove: number) => {
    setNewFiles((prev) => prev.filter((_, idx) => idx !== indexToRemove));
  };

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setErrorMsg('');

    try {
      // 1. Upload all newly added files in parallel
      const uploadPromises = newFiles.map(async (file) => {
        const fileExt = file.name.split('.').pop();
        const fileName = `${Date.now()}-${Math.random().toString(36).substring(2)}.${fileExt}`;
        const filePath = `docks/${fileName}`;

        const { error: uploadError } = await supabase.storage
          .from('dock-photos')
          .upload(filePath, file, { upsert: true });

        if (uploadError) throw uploadError;

        const { data } = supabase.storage
          .from('dock-photos')
          .getPublicUrl(filePath);

        return data.publicUrl;
      });

      const uploadedUrls = await Promise.all(uploadPromises);
      const combinedUrls = [...existingImages, ...uploadedUrls];

      // 2. Persist updated array to Supabase
      const { error: dbError } = await supabase
        .from('drop_locations')
        .update({
          venue_name: title,
          dock_instructions: dockInstructions,
          image_urls: combinedUrls,
          image_url: combinedUrls[0] || null, // Keep primary image populated for backward compatibility
        })
        .eq('id', location.id);

      if (dbError) throw dbError;

      onSuccess();
      onClose();
    } catch (err: any) {
      setErrorMsg(err.message || 'Error saving changes');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/60 backdrop-blur-sm p-4">
      <div className="w-full max-w-lg bg-slate-900 border border-slate-800 rounded-2xl p-5 text-white shadow-2xl max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between pb-3 border-b border-slate-800">
          <h2 className="text-base font-bold">Edit Dock Details</h2>
          <button onClick={onClose} className="p-1 rounded-lg text-slate-400 hover:text-white">
            <X size={18} />
          </button>
        </div>

        {errorMsg && (
          <p className="mt-3 text-xs text-rose-400 bg-rose-950/40 border border-rose-900 p-2 rounded-lg">
            {errorMsg}
          </p>
        )}

        <form onSubmit={handleUpdate} className="mt-4 space-y-4">
          {/* Multi-Photo Grid */}
          <div>
            <label className="text-xs font-semibold text-slate-300 block mb-2">
              Dock Photos ({existingImages.length + newFiles.length})
            </label>
            
            <div className="grid grid-cols-3 gap-2">
              {/* Existing Uploaded Photos */}
              {existingImages.map((url, i) => (
                <div key={url} className="relative aspect-square rounded-xl bg-slate-950 border border-slate-800 overflow-hidden group">
                  <img src={url} alt={`Dock ${i + 1}`} className="w-full h-full object-cover" />
                  <button
                    type="button"
                    onClick={() => removeExistingImage(url)}
                    className="absolute top-1 right-1 p-1 bg-rose-600/90 rounded-md text-white hover:bg-rose-500"
                  >
                    <Trash2 size={12} />
                  </button>
                </div>
              ))}

              {/* Newly Staged Photos (Pending Upload) */}
              {newFiles.map((file, i) => (
                <div key={i} className="relative aspect-square rounded-xl bg-slate-950 border border-amber-500/50 overflow-hidden">
                  <img src={URL.createObjectURL(file)} alt="Staged" className="w-full h-full object-cover opacity-80" />
                  <span className="absolute bottom-1 left-1 bg-amber-500 text-slate-950 text-[9px] font-bold px-1 rounded">
                    NEW
                  </span>
                  <button
                    type="button"
                    onClick={() => removeNewFile(i)}
                    className="absolute top-1 right-1 p-1 bg-rose-600/90 rounded-md text-white"
                  >
                    <Trash2 size={12} />
                  </button>
                </div>
              ))}

              {/* Add Photo Button */}
              <label className="aspect-square flex flex-col items-center justify-center gap-1 rounded-xl border border-dashed border-slate-700 bg-slate-950 hover:bg-slate-800 cursor-pointer text-slate-400 hover:text-white transition-colors">
                <Plus size={20} className="text-amber-500" />
                <span className="text-[10px] font-semibold">Add Photo</span>
                <input
                  type="file"
                  accept="image/*"
                  multiple
                  capture="environment"
                  onChange={handleFileChange}
                  className="hidden"
                />
              </label>
            </div>
          </div>

          <div>
            <label className="text-xs font-semibold text-slate-300">Venue Name</label>
            <input
              type="text"
              required
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="mt-1 w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-sm text-white focus:outline-none focus:border-amber-500"
            />
          </div>

          <div>
            <label className="text-xs font-semibold text-slate-300">Dock & Delivery Instructions</label>
            <textarea
              rows={3}
              value={dockInstructions}
              onChange={(e) => setDockInstructions(e.target.value)}
              placeholder="e.g. Ramp via rear lane, ring bell twice, beware low clearance"
              className="mt-1 w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-sm text-white focus:outline-none focus:border-amber-500"
            />
          </div>

          <div className="pt-2 flex gap-2">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 py-2.5 rounded-xl border border-slate-800 text-xs font-semibold text-slate-300 hover:bg-slate-800"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={saving}
              className="flex-1 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 text-xs font-bold flex items-center justify-center gap-1.5 active:scale-95 transition-all"
            >
              {saving ? <Loader2 size={14} className="animate-spin" /> : <Save size={14} />}
              Save Changes
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}