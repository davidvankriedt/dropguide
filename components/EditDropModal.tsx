'use client';

import { useState } from 'react';
import { supabase, DropLocation } from '@/lib/supabase';
import { X, Save, Loader2, Camera, Image as ImageIcon } from 'lucide-react';

interface EditDropModalProps {
  location: DropLocation;
  onClose: () => void;
  onSuccess: () => void;
}

export default function EditDropModal({ location, onClose, onSuccess }: EditDropModalProps) {
  const [title, setTitle] = useState(location.title || '');
  const [dockInstructions, setDockInstructions] = useState(location.dock_instructions || '');
  
  // Track existing photo URL and any new file selected
  const [currentImageUrl, setCurrentImageUrl] = useState<string | null>(location.image_url || null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(location.image_url || null);

  const [saving, setSaving] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setSelectedFile(file);
      setPreviewUrl(URL.createObjectURL(file)); // Show instant local preview
    }
  };

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setErrorMsg('');

    let finalImageUrl = currentImageUrl;

    // 1. If driver picked a new image, upload to Supabase Storage first
    if (selectedFile) {
      const fileExt = selectedFile.name.split('.').pop();
      const fileName = `${Date.now()}-${Math.random().toString(36).substring(2)}.${fileExt}`;
      const filePath = `docks/${fileName}`;

      const { error: uploadError } = await supabase.storage
        .from('dock-photos') // Ensure this matches your bucket name
        .upload(filePath, selectedFile, { upsert: true });

      if (uploadError) {
        setSaving(false);
        setErrorMsg(`Failed to upload photo: ${uploadError.message}`);
        return;
      }

      // Retrieve public URL for the newly uploaded photo
      const { data: publicUrlData } = supabase.storage
        .from('dock-photos')
        .getPublicUrl(filePath);

      finalImageUrl = publicUrlData.publicUrl;
    }

    // 2. Update drop_locations row in Postgres
    const { error: dbError } = await supabase
      .from('drop_locations')
      .update({
        title,
        dock_instructions: dockInstructions,
        image_url: finalImageUrl,
      })
      .eq('id', location.id);

    setSaving(false);

    if (dbError) {
      setErrorMsg(dbError.message);
      return;
    }

    onSuccess();
    onClose();
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

        <form onSubmit={handleUpdate} className="mt-4 space-y-3.5">
          {/* Photo Preview & Upload */}
          <div>
            <label className="text-xs font-semibold text-slate-300 block mb-1.5">Dock Photo</label>
            <div className="flex items-center gap-3">
              <div className="relative w-20 h-20 rounded-xl bg-slate-950 border border-slate-800 overflow-hidden flex items-center justify-center shrink-0">
                {previewUrl ? (
                  <img src={previewUrl} alt="Dock preview" className="w-full h-full object-cover" />
                ) : (
                  <ImageIcon size={24} className="text-slate-600" />
                )}
              </div>

              <label className="flex-1 cursor-pointer flex items-center justify-center gap-2 py-3 px-3 rounded-xl border border-dashed border-slate-700 bg-slate-950 hover:bg-slate-800 text-xs font-semibold text-slate-300 transition-colors">
                <Camera size={16} className="text-amber-500" />
                <span>{previewUrl ? 'Replace Photo' : 'Take / Upload Photo'}</span>
                <input
                  type="file"
                  accept="image/*"
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