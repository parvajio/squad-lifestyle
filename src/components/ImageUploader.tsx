'use client';

import React, { useRef, useState } from 'react';
import Image from 'next/image';
import { X, Link as LinkIcon, Plus, Upload, Loader2 } from 'lucide-react';
import { useUploadThing } from '@/lib/uploadthing';

interface ImageUploaderProps {
  images: string[];
  onChange: (images: string[]) => void;
}

export default function ImageUploader({ images, onChange }: ImageUploaderProps) {
  const [urlInput, setUrlInput] = useState('');
  const [showUrlField, setShowUrlField] = useState(false);
  const [uploadError, setUploadError] = useState('');
  const [progress, setProgress] = useState(0);
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const { startUpload, isUploading } = useUploadThing('imageUploader', {
    onUploadProgress: (p) => setProgress(p),
    onClientUploadComplete: (res) => {
      setUploadError('');
      setProgress(0);
      if (res && res.length > 0) {
        const urls = res.map((f) => f.url).filter(Boolean);
        onChange([...images, ...urls]);
      }
    },
    onUploadError: (err) => {
      console.error('UploadThing error:', err);
      setProgress(0);
      // Surface the real server message (e.g. FORBIDDEN vs invalid token)
      const msg =
        err.message === 'XHR failed'
          ? 'Upload rejected by server (400). Check server terminal for UploadThing middleware/token error, and restart `next dev` after .env changes.'
          : err.message;
      setUploadError(`${msg} — must be logged in as admin.`);
    },
  });

  const handleFiles = async (files: FileList | File[] | null) => {
    if (!files || files.length === 0) return;
    setUploadError('');
    setProgress(0);
    const fileArray = Array.from(files);
    // Client-side guards matching server (6 max, 4MB each, images only)
    const valid = fileArray.filter((f) => {
      if (!f.type.startsWith('image/')) {
        setUploadError(`"${f.name}" is not an image.`);
        return false;
      }
      if (f.size > 4 * 1024 * 1024) {
        setUploadError(`"${f.name}" exceeds 4MB.`);
        return false;
      }
      return true;
    });
    if (valid.length === 0) return;
    if (images.length + valid.length > 6) {
      setUploadError('Maximum 6 images per product.');
      return;
    }
    // Auto-upload immediately on select/drop — no second click needed
    await startUpload(valid);
    // Reset input so the same file can be picked again
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const handleAddUrl = (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = urlInput.trim();
    if (!trimmed) return;
    if (!/^https?:\/\/.+/.test(trimmed)) {
      setUploadError('URL must start with http:// or https://');
      return;
    }
    setUploadError('');
    onChange([...images, trimmed]);
    setUrlInput('');
  };

  const handleRemoveImage = (indexToRemove: number) => {
    onChange(images.filter((_, idx) => idx !== indexToRemove));
  };

  return (
    <div className="space-y-4">
      <label className="block text-xs font-bold uppercase tracking-wider text-black dark:text-white">
        Product Images (Uploadthing / URL)
      </label>

      {uploadError && (
        <div className="p-3 bg-red-50 dark:bg-red-950/80 border border-red-200 dark:border-red-800 text-red-600 dark:text-red-400 text-xs font-bold uppercase rounded-xl">
          {uploadError}
        </div>
      )}

      {/* Image Previews */}
      {images.length > 0 && (
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          {images.map((url, idx) => {
            const isBlob = url.startsWith('blob:');
            return (
              <div
                key={`${url}-${idx}`}
                className="relative aspect-square rounded-lg border border-neutral-300 dark:border-neutral-700 overflow-hidden group bg-neutral-100 dark:bg-neutral-800"
              >
                <Image
                  src={url}
                  alt={`Uploaded image ${idx + 1}`}
                  fill
                  unoptimized={isBlob}
                  className="object-cover"
                />
                {isBlob && (
                  <span className="absolute bottom-1 left-1 px-1.5 py-0.5 bg-amber-500 text-white text-[9px] font-bold uppercase rounded">
                    Unsaved preview — re-upload
                  </span>
                )}
                <button
                  type="button"
                  onClick={() => handleRemoveImage(idx)}
                  className="absolute top-2 right-2 p-1.5 bg-black/80 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                  aria-label="Remove image"
                >
                  <X size={14} />
                </button>
              </div>
            );
          })}
        </div>
      )}

      {/* Auto-upload dropzone: select/drop -> uploads immediately */}
      <div
        role="button"
        tabIndex={0}
        aria-label="Upload product images"
        onClick={() => fileInputRef.current?.click()}
        onKeyDown={(e) => {
          if (e.key === 'Enter' || e.key === ' ') fileInputRef.current?.click();
        }}
        onDragOver={(e) => {
          e.preventDefault();
          setIsDragging(true);
        }}
        onDragLeave={() => setIsDragging(false)}
        onDrop={(e) => {
          e.preventDefault();
          setIsDragging(false);
          void handleFiles(e.dataTransfer.files);
        }}
        className={`flex flex-col items-center justify-center p-6 border-2 border-dashed rounded-lg text-center cursor-pointer transition-colors bg-neutral-50 dark:bg-neutral-900/50 ${
          isDragging
            ? 'border-black dark:border-white bg-neutral-100 dark:bg-neutral-800'
            : 'border-neutral-300 dark:border-neutral-700 hover:border-black dark:hover:border-white'
        } ${isUploading ? 'opacity-70 pointer-events-none' : ''}`}
      >
        {isUploading ? (
          <>
            <Loader2 className="w-6 h-6 mb-2 text-neutral-500 animate-spin" />
            <span className="text-xs font-bold uppercase tracking-wider text-black dark:text-white">
              Uploading… {progress}%
            </span>
            <div className="w-full max-w-xs h-1.5 mt-3 bg-neutral-200 dark:bg-neutral-700 rounded-full overflow-hidden">
              <div
                className="h-full bg-black dark:bg-white transition-all"
                style={{ width: `${progress}%` }}
              />
            </div>
          </>
        ) : (
          <>
            <Upload className="w-6 h-6 mb-2 text-neutral-500" />
            <span className="text-xs font-bold uppercase tracking-wider text-black dark:text-white">
              {isDragging ? 'Drop images to auto-upload' : 'Click or drag images here to auto-upload'}
            </span>
            <span className="text-[10px] text-neutral-400 mt-1">
              Images only, max 6, 4MB each — uploads instantly via Uploadthing
            </span>
          </>
        )}
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          multiple
          disabled={isUploading}
          onChange={(e) => void handleFiles(e.target.files)}
          className="hidden"
        />
      </div>

      <div className="flex flex-col sm:flex-row gap-3">
        <button
          type="button"
          onClick={() => setShowUrlField(!showUrlField)}
          className="flex items-center justify-center gap-2 px-4 py-3 border border-neutral-300 dark:border-neutral-700 rounded-lg text-xs font-bold uppercase tracking-wider hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors"
        >
          <LinkIcon size={16} />
          <span>Add via URL</span>
        </button>
      </div>

      {/* Direct URL Input */}
      {showUrlField && (
        <form onSubmit={handleAddUrl} className="flex gap-2">
          <input
            type="url"
            value={urlInput}
            onChange={(e) => setUrlInput(e.target.value)}
            placeholder="Paste image URL (e.g. https://images.unsplash.com/...)"
            className="flex-1 px-3 py-2 text-xs border border-neutral-300 dark:border-neutral-700 rounded-lg bg-white dark:bg-neutral-900 text-black dark:text-white focus:outline-none focus:ring-2 focus:ring-black dark:focus:ring-white"
          />
          <button
            type="submit"
            className="px-4 py-2 bg-black text-white dark:bg-white dark:text-black font-bold text-xs uppercase tracking-wider rounded-lg hover:bg-neutral-800 dark:hover:bg-neutral-200 transition-colors flex items-center gap-1"
          >
            <Plus size={14} />
            <span>Add</span>
          </button>
        </form>
      )}
    </div>
  );
}
