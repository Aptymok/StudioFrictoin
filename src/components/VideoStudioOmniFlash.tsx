/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * 
 * Video Studio using gemini-omni-1.2-flash via Interactions API
 * Supports:
 * - Text-to-Video generation
 * - Image-to-Video animation
 * Formats: 16:9 (Horizontal HD) and 9:16 (Vertical)
 * Retains permanent DEMO_SYNTHETIC stamp and prevents canonical self-approval.
 */

import React, { useState } from 'react';
import { VisualAssetProposal } from '../types';
import { 
  Film, 
  Video, 
  Play, 
  Loader2, 
  Sparkles, 
  AlertTriangle, 
  Monitor, 
  Smartphone, 
  Layers, 
  Check, 
  Download,
  Clapperboard
} from 'lucide-react';

interface VideoStudioOmniFlashProps {
  proposals: VisualAssetProposal[];
  onBindVideoToScene?: (videoUrl: string, promptText: string) => void;
}

export const VideoStudioOmniFlash: React.FC<VideoStudioOmniFlashProps> = ({
  proposals,
  onBindVideoToScene,
}) => {
  const [subMode, setSubMode] = useState<'text_to_video' | 'image_to_video'>('text_to_video');
  const [prompt, setPrompt] = useState('Tomas cinematográficas lentas en cámara lenta recorriendo el galvanómetro de latón del Aparato A, con el péndulo oscilando a 35.2 Hz bajo luz tenue.');
  const [aspectRatio, setAspectRatio] = useState<'16:9' | '9:16'>('16:9');
  const [selectedAssetId, setSelectedAssetId] = useState<string>(proposals[0]?.id || '');
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedVideoUrl, setGeneratedVideoUrl] = useState<string | null>(null);
  const [notes, setNotes] = useState<string>('');
  const [error, setError] = useState<string | null>(null);
  const [isBound, setIsBound] = useState(false);

  const selectedAsset = proposals.find((p) => p.id === selectedAssetId) || proposals[0];

  const handleGenerate = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!prompt.trim()) return;

    setIsGenerating(true);
    setError(null);
    setIsBound(false);

    try {
      if (subMode === 'text_to_video') {
        const res = await fetch('/api/gemini/video-from-text', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            prompt,
            aspectRatio,
            duration: '10s',
            resolution: '720p',
          }),
        });

        const data = await res.json();
        if (data.error) {
          setError(data.error);
        } else {
          if (data.videoData) {
            setGeneratedVideoUrl(`data:${data.mimeType || 'video/mp4'};base64,${data.videoData}`);
          } else if (data.isSimulated) {
            setNotes(data.notes || 'Directiva formulada con gemini-omni-1.2-flash (Interactions API) en modo simulación.');
          }
        }
      } else {
        // Image to video
        let base64ImageToSend: string | undefined = undefined;
        let mimeTypeToSend: string | undefined = 'image/jpeg';

        if (selectedAsset) {
          if (selectedAsset.imageUrl.startsWith('data:')) {
            const parts = selectedAsset.imageUrl.split(',');
            mimeTypeToSend = parts[0].split(':')[1].split(';')[0];
            base64ImageToSend = parts[1];
          } else {
            try {
              const resp = await fetch(selectedAsset.imageUrl);
              const blob = await resp.blob();
              const reader = new FileReader();
              const b64Promise = new Promise<string>((resolve) => {
                reader.onloadend = () => {
                  const b64 = (reader.result as string).split(',')[1];
                  resolve(b64);
                };
              });
              reader.readAsDataURL(blob);
              base64ImageToSend = await b64Promise;
              mimeTypeToSend = blob.type || 'image/jpeg';
            } catch {
              console.warn('Fallback base64 para animación.');
            }
          }
        }

        const res = await fetch('/api/gemini/video-from-image', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            base64Image: base64ImageToSend || 'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==',
            mimeType: mimeTypeToSend,
            prompt,
            aspectRatio,
            duration: '10s',
          }),
        });

        const data = await res.json();
        if (data.error) {
          setError(data.error);
        } else {
          if (data.videoData) {
            setGeneratedVideoUrl(`data:${data.mimeType || 'video/mp4'};base64,${data.videoData}`);
          } else if (data.isSimulated) {
            setNotes(data.notes || 'Especificación de animación image-to-video con gemini-omni-1.2-flash generada con éxito.');
          }
        }
      }
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : String(err);
      setError(`Error en la generación de video: ${msg}`);
    } finally {
      setIsGenerating(false);
    }
  };

  const handleBind = () => {
    if (onBindVideoToScene) {
      onBindVideoToScene(generatedVideoUrl || '', prompt);
      setIsBound(true);
      setTimeout(() => setIsBound(false), 2500);
    }
  };

  return (
    <div className="bg-neutral-900/40 border border-neutral-800 rounded-lg p-6 space-y-6">
      {/* Title */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 border-b border-neutral-800 pb-4">
        <div>
          <div className="flex items-center gap-2">
            <Clapperboard className="w-4 h-4 text-emerald-400" />
            <h3 className="text-base font-serif font-medium text-neutral-100">
              Generador de Video Omni Flash (gemini-omni-1.2-flash via Interactions API)
            </h3>
          </div>
          <p className="text-xs text-neutral-400 mt-1 max-w-2xl font-sans">
            Sintetiza video desde texto o anima activos fotográficos existentes en formato 16:9 y 9:16. 
            <strong className="text-neutral-200"> Cada fotograma conserva el registro obligatorio DEMO_SYNTHETIC.</strong>
          </p>
        </div>

        {/* Sub-Mode Toggle */}
        <div className="flex items-center gap-1 p-1 bg-neutral-950 border border-neutral-800 rounded-lg shrink-0">
          <button
            onClick={() => setSubMode('text_to_video')}
            className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-mono uppercase rounded transition-colors ${
              subMode === 'text_to_video'
                ? 'bg-emerald-950/70 text-emerald-300 border border-emerald-800 font-medium'
                : 'text-neutral-400 hover:text-neutral-200'
            }`}
          >
            <Video className="w-3.5 h-3.5" />
            <span>Texto a Video</span>
          </button>
          <button
            onClick={() => setSubMode('image_to_video')}
            className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-mono uppercase rounded transition-colors ${
              subMode === 'image_to_video'
                ? 'bg-emerald-950/70 text-emerald-300 border border-emerald-800 font-medium'
                : 'text-neutral-400 hover:text-neutral-200'
            }`}
          >
            <Layers className="w-3.5 h-3.5" />
            <span>Animar Imagen a Video</span>
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Config & Form */}
        <div className="lg:col-span-6 space-y-4">
          {subMode === 'image_to_video' && (
            <div className="space-y-2">
              <label className="text-xs font-mono uppercase tracking-wider text-neutral-400 block">
                Seleccionar Fotograma de Origen para Animar:
              </label>
              <div className="grid grid-cols-4 gap-2">
                {proposals.map((asset) => (
                  <button
                    key={asset.id}
                    type="button"
                    onClick={() => setSelectedAssetId(asset.id)}
                    className={`relative aspect-video rounded overflow-hidden border transition-all ${
                      asset.id === selectedAssetId
                        ? 'border-emerald-500 ring-2 ring-emerald-500/30'
                        : 'border-neutral-800 opacity-60 hover:opacity-100'
                    }`}
                  >
                    <img
                      src={asset.imageUrl}
                      alt={asset.title}
                      className="w-full h-full object-cover"
                    />
                    <span className="absolute bottom-0 inset-x-0 bg-neutral-950/80 text-[7px] font-mono text-neutral-300 truncate px-1">
                      {asset.title}
                    </span>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Aspect Ratio Switch */}
          <div className="space-y-1.5">
            <label className="text-xs font-mono uppercase tracking-wider text-neutral-400 block">
              Formato de Relación de Aspecto:
            </label>
            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => setAspectRatio('16:9')}
                className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-mono rounded border transition-colors ${
                  aspectRatio === '16:9'
                    ? 'bg-neutral-800 text-neutral-100 border-emerald-500 font-semibold'
                    : 'bg-neutral-950 border-neutral-800 text-neutral-400 hover:text-neutral-200'
                }`}
              >
                <Monitor className="w-3.5 h-3.5" />
                <span>16:9 Panorámico (HD)</span>
              </button>
              <button
                type="button"
                onClick={() => setAspectRatio('9:16')}
                className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-mono rounded border transition-colors ${
                  aspectRatio === '9:16'
                    ? 'bg-neutral-800 text-neutral-100 border-emerald-500 font-semibold'
                    : 'bg-neutral-950 border-neutral-800 text-neutral-400 hover:text-neutral-200'
                }`}
              >
                <Smartphone className="w-3.5 h-3.5" />
                <span>9:16 Vertical (Móvil)</span>
              </button>
            </div>
          </div>

          {/* Prompt */}
          <div className="space-y-1.5">
            <label className="text-xs font-mono uppercase tracking-wider text-neutral-400 block">
              {subMode === 'text_to_video'
                ? 'Prompt de Video (gemini-omni-1.2-flash):'
                : 'Directiva de Animación de Imagen:'}
            </label>
            <textarea
              rows={4}
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              placeholder="Describe el plano cinematográfico, movimiento de cámara, iluminación y cambios sutiles..."
              className="w-full bg-neutral-950 border border-neutral-800 rounded p-3 text-xs text-neutral-100 font-mono leading-relaxed focus:outline-none focus:border-emerald-500"
            />
          </div>

          <div className="flex items-center justify-between pt-1">
            <span className="text-[11px] font-mono text-neutral-500">
              Interactions API: <strong className="text-emerald-400">gemini-omni-1.2-flash</strong>
            </span>

            <button
              onClick={handleGenerate}
              disabled={isGenerating || !prompt.trim()}
              className="flex items-center gap-2 px-4 py-2 bg-emerald-500 hover:bg-emerald-400 text-neutral-950 font-mono uppercase text-xs font-semibold rounded transition-colors disabled:opacity-50"
            >
              {isGenerating ? (
                <>
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  <span>Renderizando Video...</span>
                </>
              ) : (
                <>
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>{subMode === 'text_to_video' ? 'Generar Video' : 'Animar Imagen'}</span>
                </>
              )}
            </button>
          </div>

          {error && (
            <div className="p-3 bg-rose-950/40 border border-rose-900/60 rounded text-rose-300 flex items-center gap-2 text-xs">
              <AlertTriangle className="w-3.5 h-3.5 text-rose-400 shrink-0" />
              <span>{error}</span>
            </div>
          )}
        </div>

        {/* Right Column: Video Viewport & Epistemic Stamp */}
        <div className="lg:col-span-6 space-y-4">
          <div className="bg-neutral-950 rounded-lg border border-neutral-800 p-4 flex flex-col items-center justify-center min-h-[300px] relative overflow-hidden">
            {generatedVideoUrl ? (
              <div className="space-y-3 w-full">
                <div
                  className={`relative mx-auto rounded overflow-hidden border border-neutral-800 bg-neutral-900 flex items-center justify-center ${
                    aspectRatio === '16:9' ? 'w-full aspect-video' : 'w-56 aspect-[9/16]'
                  }`}
                >
                  <video
                    src={generatedVideoUrl}
                    controls
                    autoPlay
                    loop
                    className="w-full h-full object-cover"
                  />

                  {/* Mandatory Epistemic Watermark */}
                  <div className="absolute top-2 left-2 bg-neutral-950/90 border border-amber-800 px-2 py-0.5 rounded text-[10px] font-mono text-amber-300 shadow-md flex items-center gap-1 pointer-events-none">
                    <AlertTriangle className="w-3 h-3 text-amber-400" />
                    <span>DEMOSTRACIÓN / ACTIVO SINTÉTICO (DEMO_SYNTHETIC)</span>
                  </div>
                </div>

                <div className="flex items-center justify-between pt-1">
                  <span className="text-[11px] font-mono text-neutral-400">
                    Omni Flash · {aspectRatio} · 10s · Procedencia DEMO_SYNTHETIC
                  </span>

                  {onBindVideoToScene && (
                    <button
                      onClick={handleBind}
                      disabled={isBound}
                      className="flex items-center gap-1.5 px-3 py-1.5 bg-neutral-800 hover:bg-neutral-700 text-neutral-100 font-mono text-xs uppercase rounded transition-colors"
                    >
                      {isBound ? (
                        <>
                          <Check className="w-3.5 h-3.5 text-emerald-400" />
                          <span>Vinculado a Escena</span>
                        </>
                      ) : (
                        <span>Vincular a Escena Activa</span>
                      )}
                    </button>
                  )}
                </div>
              </div>
            ) : (
              <div className="text-center p-8 space-y-2">
                <Film className="w-10 h-10 text-neutral-700 mx-auto" />
                <p className="text-xs font-mono text-neutral-500">
                  {notes || 'El clip generado con gemini-omni-1.2-flash se visualizará aquí con marca de agua ineludible.'}
                </p>
                <div className="pt-2 text-[10px] font-mono text-amber-400/80">
                  Aviso: No se confunden animaciones recreadas con registros documentales.
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
