import React from 'react';

function Slider({ label, value, min = 0, max = 1, step = 0.01, onChange, suffix = '' }) {
  return (
    <div className="flex flex-col gap-2">
      <div className="flex items-center justify-between text-sm">
        <span className="text-gray-700 font-medium">{label}</span>
        <span className="text-gray-500">{(Math.round(value * 100) / 100).toString()} {suffix}</span>
      </div>
      <input
        type="range"
        min={min}
        max={max}
        step={step}
        value={value}
        onChange={(e) => onChange(parseFloat(e.target.value))}
        className="w-full accent-indigo-600"
      />
    </div>
  );
}

export default function EnhanceControls({ settings, setSettings, onProcess, busy }) {
  const set = (k, v) => setSettings({ ...settings, [k]: v });

  return (
    <div className="w-full bg-white rounded-xl border p-4 md:p-5 space-y-4">
      <div>
        <h3 className="text-base md:text-lg font-semibold text-gray-900">Enhancement Controls</h3>
        <p className="text-sm text-gray-500">Tune the look before upscaling. Processing happens locally in your browser.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-4">
          <div>
            <label className="text-sm text-gray-700 font-medium">Upscale Factor</label>
            <div className="mt-2 grid grid-cols-4 gap-2">
              {[1, 1.5, 2, 4].map((f) => (
                <button
                  key={f}
                  className={`px-3 py-2 text-sm rounded-md border transition ${settings.scale === f ? 'bg-gray-900 text-white border-gray-900' : 'bg-white hover:bg-gray-50'}`}
                  onClick={() => set('scale', f)}
                >
                  {f}x
                </button>
              ))}
            </div>
          </div>

          <Slider label="Sharpness" value={settings.sharpen} min={0} max={1.5} step={0.05} onChange={(v) => set('sharpen', v)} />
          <Slider label="Denoise" value={settings.denoise} min={0} max={1} step={0.05} onChange={(v) => set('denoise', v)} />
        </div>
        <div className="space-y-4">
          <Slider label="Brightness" value={settings.brightness} min={0.5} max={1.5} step={0.01} onChange={(v) => set('brightness', v)} />
          <Slider label="Contrast" value={settings.contrast} min={0.5} max={1.5} step={0.01} onChange={(v) => set('contrast', v)} />
          <Slider label="Saturation" value={settings.saturation} min={0} max={2} step={0.01} onChange={(v) => set('saturation', v)} />
        </div>
      </div>

      <div className="flex flex-wrap items-center gap-3 pt-2">
        <button
          onClick={onProcess}
          disabled={busy}
          className={`inline-flex items-center justify-center px-4 py-2 rounded-md text-white text-sm font-medium shadow ${busy ? 'bg-gray-400 cursor-not-allowed' : 'bg-indigo-600 hover:bg-indigo-500'}`}
        >
          {busy ? 'Processing…' : 'Enhance & Upscale'}
        </button>
        <p className="text-xs text-gray-500">Tip: Start with 2x, then try 4x for maximum detail.</p>
      </div>
    </div>
  );
}
