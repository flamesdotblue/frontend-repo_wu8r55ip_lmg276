import React, { useRef } from 'react';
import { ImageUp, Upload } from 'lucide-react';

export default function UploadArea({ onImageSelected }) {
  const fileRef = useRef(null);

  const handleFiles = (files) => {
    if (!files || !files[0]) return;
    const file = files[0];
    const reader = new FileReader();
    reader.onload = (e) => {
      const img = new Image();
      img.onload = () => onImageSelected(img);
      img.src = e.target.result;
    };
    reader.readAsDataURL(file);
  };

  return (
    <div className="w-full">
      <div
        className="relative border-2 border-dashed rounded-xl p-6 md:p-8 text-center bg-gradient-to-br from-gray-50 to-white hover:from-white hover:to-gray-50 transition cursor-pointer"
        onClick={() => fileRef.current?.click()}
        onDragOver={(e) => { e.preventDefault(); }}
        onDrop={(e) => { e.preventDefault(); handleFiles(e.dataTransfer.files); }}
      >
        <input
          ref={fileRef}
          type="file"
          accept="image/*"
          className="hidden"
          onChange={(e) => handleFiles(e.target.files)}
        />
        <div className="mx-auto h-16 w-16 rounded-full bg-white shadow flex items-center justify-center border mb-4">
          <ImageUp className="text-gray-700" />
        </div>
        <p className="text-gray-900 font-medium">Drag & drop an image here</p>
        <p className="text-gray-500 text-sm mt-1">PNG, JPG up to ~20MB</p>
        <div className="mt-4 inline-flex items-center gap-2 bg-gray-900 text-white px-4 py-2 rounded-md text-sm">
          <Upload size={16} />
          Browse Files
        </div>
      </div>
    </div>
  );
}
