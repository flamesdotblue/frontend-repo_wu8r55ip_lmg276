import React, { useRef } from 'react';
import { Download, Split, Maximize2 } from 'lucide-react';

export default function PreviewPane({ original, result, onDownload }) {
  const linkRef = useRef(null);

  return (
    <div className="w-full bg-white rounded-xl border overflow-hidden">
      <div className="flex items-center justify-between px-4 py-3 border-b bg-gray-50">
        <div className="flex items-center gap-2 text-sm text-gray-700">
          <Split size={16} />
          <span>Before / After Preview</span>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={onDownload}
            disabled={!result}
            className={`inline-flex items-center gap-2 px-3 py-2 rounded-md text-sm font-medium border bg-white hover:bg-gray-100 transition ${!result ? 'opacity-50 cursor-not-allowed' : ''}`}
          >
            <Download size={16} /> Download
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2">
        <div className="relative aspect-video bg-gray-100 flex items-center justify-center">
          {original ? (
            <img src={original} alt="Original" className="max-h-full max-w-full object-contain" />
          ) : (
            <div className="text-gray-500 text-sm">Upload an image to begin</div>
          )}
        </div>
        <div className="relative aspect-video bg-gray-100 flex items-center justify-center">
          {result ? (
            <img src={result} alt="Enhanced" className="max-h-full max-w-full object-contain" />
          ) : (
            <div className="text-gray-500 text-sm">Your enhanced result will appear here</div>
          )}
        </div>
      </div>
    </div>
  );
}
