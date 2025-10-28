import React from 'react';
import { Rocket, ImageUp, Sparkles } from 'lucide-react';

export default function Header() {
  return (
    <header className="w-full sticky top-0 z-20 backdrop-blur supports-[backdrop-filter]:bg-white/60 bg-white/80 border-b border-gray-200">
      <div className="max-w-6xl mx-auto px-4 py-4 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="h-9 w-9 rounded-lg bg-gradient-to-br from-fuchsia-500 to-indigo-600 flex items-center justify-center text-white shadow">
            <Sparkles size={18} />
          </div>
          <div>
            <h1 className="text-lg font-semibold tracking-tight text-gray-900">Ultra Enhance</h1>
            <p className="text-xs text-gray-500 -mt-0.5">AI-inspired image enhancement & upscaling</p>
          </div>
        </div>
        <a
          href="#"
          className="inline-flex items-center gap-2 rounded-md bg-gray-900 text-white px-3 py-2 text-sm font-medium shadow hover:bg-gray-800 transition"
        >
          <Rocket size={16} />
          Boost Quality
        </a>
      </div>
    </header>
  );
}
