import React, { useCallback, useMemo, useRef, useState } from 'react';
import Header from './components/Header';
import UploadArea from './components/UploadArea';
import EnhanceControls from './components/EnhanceControls';
import PreviewPane from './components/PreviewPane';

function applyAdjustmentsToImageData(imageData, { brightness = 1, contrast = 1, saturation = 1 }) {
  const data = imageData.data;
  const factor = (259 * (contrast * 255 + 255)) / (255 * (259 - contrast * 255));
  for (let i = 0; i < data.length; i += 4) {
    // brightness & contrast on RGB
    let r = data[i] * brightness;
    let g = data[i + 1] * brightness;
    let b = data[i + 2] * brightness;

    r = factor * (r - 128) + 128;
    g = factor * (g - 128) + 128;
    b = factor * (b - 128) + 128;

    // saturation via HSL-ish approach
    const avg = (r + g + b) / 3;
    r = avg + (r - avg) * saturation;
    g = avg + (g - avg) * saturation;
    b = avg + (b - avg) * saturation;

    data[i] = Math.max(0, Math.min(255, r));
    data[i + 1] = Math.max(0, Math.min(255, g));
    data[i + 2] = Math.max(0, Math.min(255, b));
  }
  return imageData;
}

function convolve(imageData, kernel, divisor = 1, bias = 0) {
  const { width, height, data } = imageData;
  const output = new ImageData(width, height);
  const o = output.data;
  const side = Math.sqrt(kernel.length);
  const half = Math.floor(side / 2);

  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      let r = 0, g = 0, b = 0;
      for (let ky = 0; ky < side; ky++) {
        for (let kx = 0; kx < side; kx++) {
          const px = Math.min(width - 1, Math.max(0, x + kx - half));
          const py = Math.min(height - 1, Math.max(0, y + ky - half));
          const idx = (py * width + px) * 4;
          const kval = kernel[ky * side + kx];
          r += data[idx] * kval;
          g += data[idx + 1] * kval;
          b += data[idx + 2] * kval;
        }
      }
      const i = (y * width + x) * 4;
      o[i] = Math.min(255, Math.max(0, r / divisor + bias));
      o[i + 1] = Math.min(255, Math.max(0, g / divisor + bias));
      o[i + 2] = Math.min(255, Math.max(0, b / divisor + bias));
      o[i + 3] = data[i + 3];
    }
  }
  return output;
}

function gaussianBlur(imageData) {
  // 3x3 Gaussian kernel
  const kernel = [1, 2, 1, 2, 4, 2, 1, 2, 1];
  return convolve(imageData, kernel, 16, 0);
}

function unsharpMask(imageData, amount = 0.5) {
  // Unsharp mask: original + amount * (original - blurred)
  const blurred = gaussianBlur(imageData);
  const out = new ImageData(imageData.width, imageData.height);
  for (let i = 0; i < imageData.data.length; i += 4) {
    const r = imageData.data[i];
    const g = imageData.data[i + 1];
    const b = imageData.data[i + 2];

    const br = blurred.data[i];
    const bg = blurred.data[i + 1];
    const bb = blurred.data[i + 2];

    out.data[i] = Math.max(0, Math.min(255, r + (r - br) * amount));
    out.data[i + 1] = Math.max(0, Math.min(255, g + (g - bg) * amount));
    out.data[i + 2] = Math.max(0, Math.min(255, b + (b - bb) * amount));
    out.data[i + 3] = imageData.data[i + 3];
  }
  return out;
}

function denoise(imageData, strength = 0.2) {
  // Simple bilateral-like: interpolate between original and blurred
  const blurred = gaussianBlur(imageData);
  const out = new ImageData(imageData.width, imageData.height);
  const s = Math.max(0, Math.min(1, strength));
  for (let i = 0; i < imageData.data.length; i += 4) {
    out.data[i] = imageData.data[i] * (1 - s) + blurred.data[i] * s;
    out.data[i + 1] = imageData.data[i + 1] * (1 - s) + blurred.data[i + 1] * s;
    out.data[i + 2] = imageData.data[i + 2] * (1 - s) + blurred.data[i + 2] * s;
    out.data[i + 3] = imageData.data[i + 3];
  }
  return out;
}

export default function App() {
  const [imgEl, setImgEl] = useState(null);
  const [busy, setBusy] = useState(false);
  const [resultUrl, setResultUrl] = useState(null);
  const [settings, setSettings] = useState({
    scale: 2,
    sharpen: 0.6,
    denoise: 0.2,
    brightness: 1,
    contrast: 1,
    saturation: 1,
  });

  const originalUrl = useMemo(() => (imgEl ? imgEl.src : null), [imgEl]);

  const processImage = useCallback(async () => {
    if (!imgEl) return;
    setBusy(true);
    try {
      const scale = Number(settings.scale) || 1;
      const width = Math.max(1, Math.round(imgEl.naturalWidth * scale));
      const height = Math.max(1, Math.round(imgEl.naturalHeight * scale));

      const canvas = document.createElement('canvas');
      canvas.width = width;
      canvas.height = height;
      const ctx = canvas.getContext('2d');
      ctx.imageSmoothingEnabled = true;
      ctx.imageSmoothingQuality = 'high';

      // Step 1: upscale with high-quality interpolation
      ctx.drawImage(imgEl, 0, 0, width, height);

      // Step 2: extract and process pixels
      let imgData = ctx.getImageData(0, 0, width, height);
      imgData = applyAdjustmentsToImageData(imgData, {
        brightness: settings.brightness,
        contrast: settings.contrast,
        saturation: settings.saturation,
      });

      if (settings.denoise > 0) {
        imgData = denoise(imgData, settings.denoise);
      }

      if (settings.sharpen > 0) {
        imgData = unsharpMask(imgData, settings.sharpen);
      }

      ctx.putImageData(imgData, 0, 0);
      const url = canvas.toDataURL('image/png');
      setResultUrl(url);
    } catch (e) {
      console.error(e);
      alert('Failed to process image. Please try with a smaller file.');
    } finally {
      setBusy(false);
    }
  }, [imgEl, settings]);

  const handleDownload = () => {
    if (!resultUrl) return;
    const a = document.createElement('a');
    a.href = resultUrl;
    a.download = 'enhanced.png';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-white to-gray-50">
      <Header />

      <main className="max-w-6xl mx-auto px-4 py-8 md:py-10 space-y-6">
        {!imgEl && (
          <section className="rounded-2xl overflow-hidden border bg-white">
            <div className="grid grid-cols-1 lg:grid-cols-5">
              <div className="p-6 md:p-8 lg:col-span-2 border-b lg:border-b-0 lg:border-r">
                <h2 className="text-2xl font-semibold tracking-tight text-gray-900">Enhance any image in seconds</h2>
                <p className="text-gray-600 mt-2">Upscale up to 4x with crisp edges, reduce noise, and balance tone — right in your browser.</p>
                <ul className="mt-4 text-sm text-gray-600 list-disc list-inside space-y-1">
                  <li>High-quality upscaling (1.5x, 2x, 4x)</li>
                  <li>Sharpening and de-noising controls</li>
                  <li>Brightness, contrast, saturation</li>
                </ul>
              </div>
              <div className="p-6 md:p-8 lg:col-span-3">
                <UploadArea onImageSelected={setImgEl} />
              </div>
            </div>
          </section>
        )}

        {imgEl && (
          <section className="grid grid-cols-1 lg:grid-cols-5 gap-6">
            <div className="lg:col-span-2 space-y-6">
              <UploadArea onImageSelected={setImgEl} />
              <EnhanceControls
                settings={settings}
                setSettings={setSettings}
                onProcess={processImage}
                busy={busy}
              />
            </div>
            <div className="lg:col-span-3">
              <PreviewPane original={originalUrl} result={resultUrl} onDownload={handleDownload} />
            </div>
          </section>
        )}
      </main>

      <footer className="border-t py-6 text-center text-sm text-gray-500">
        Processed locally for privacy. For best results, start with the highest-quality source image available.
      </footer>
    </div>
  );
}
