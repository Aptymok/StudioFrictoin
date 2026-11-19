/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * 
 * Music Studio using Lyria models:
 * - lyria-3-clip-preview for <= 30s clips / audio cues / loops
 * - lyria-3-pro-preview for full tracks
 * Proxied via /api/gemini/music.
 * Retains strict DEMO_SYNTHETIC provenance and rights warning.
 */

import React, { useState } from 'react';
import { 
  Music, 
  Play, 
  Pause, 
  Volume2, 
  Sparkles, 
  Loader2, 
  AlertTriangle, 
  Download, 
  Check, 
  Disc,
  Radio
} from 'lucide-react';

interface MusicStudioLyriaProps {
  onAssignAudioCue?: (cueName: string) => void;
}

export const MusicStudioLyria: React.FC<MusicStudioLyriaProps> = ({ onAssignAudioCue }) => {
  const [modelType, setModelType] = useState<'clip' | 'pro'>('clip');
  const [prompt, setPrompt] = useState('Resonancia armónica sutil a 35.2 Hz, notas amortiguadas de violonchelo con campana de latón, reverberación de bóveda de piedra caliza, atmósfera sobria y científica.');
  const [isGenerating, setIsGenerating] = useState(false);
  const [audioBase64, setAudioBase64] = useState<string | null>(null);
  const [mimeType, setMimeType] = useState<string>('audio/wav');
  const [lyrics, setLyrics] = useState<string>('');
  const [notes, setNotes] = useState<string>('');
  const [error, setError] = useState<string | null>(null);
  const [isAssigned, setIsAssigned] = useState(false);

  // Audio playback state
  const [isPlaying, setIsPlaying] = useState(false);
  const audioRef = React.useRef<HTMLAudioElement | null>(null);

  const presets = [
    {
      label: 'Resonancia 35.2 Hz Bóveda',
      text: 'Ondas senoidales de 35.2 Hz combinadas con campanadas de latón atenuadas y reverberación acústica en cámara de piedra subterránea.',
    },
    {
      label: 'Tubos de Vacío y Oscilador',
      text: 'Zumbido de baja frecuencia de filamentos eléctricos de 1934, clics mecánicos de conmutación y textura electro-acústica estática.',
    },
    {
      label: 'Péndulo Amortiguado en Aceite',
      text: 'Pulsos rítmicos muy graves y lentos a 0.5 Hz con sobretonos armónicos cristalinos de cuarzo y campana metálica lejana.',
    },
  ];

  const handleGenerate = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!prompt.trim()) return;

    setIsGenerating(true);
    setError(null);
    setIsAssigned(false);

    try {
      const res = await fetch('/api/gemini/music', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          prompt,
          modelType,
        }),
      });

      const data = await res.json();
      if (data.error) {
        setError(data.error);
      } else {
        if (data.audioBase64) {
          setAudioBase64(`data:${data.mimeType || 'audio/wav'};base64,${data.audioBase64}`);
          setMimeType(data.mimeType || 'audio/wav');
        } else if (data.isSimulated) {
          // Synthetic procedural audio descriptor in air-gap mode
          setNotes(data.notes || '[SIMULACIÓN SINTÉTICA DEMO]: Descriptor armónico registrado.');
          setLyrics('Resonancia modal en 35.2 Hz · Amortiguamiento crítico 0.04 · Cuerda de latón');
        }
        if (data.lyrics) setLyrics(data.lyrics);
      }
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : String(err);
      setError(`Error en la generación de música: ${msg}`);
    } finally {
      setIsGenerating(false);
    }
  };

  const handleTogglePlay = () => {
    if (!audioRef.current) return;
    if (isPlaying) {
      audioRef.current.pause();
      setIsPlaying(false);
    } else {
      audioRef.current.play();
      setIsPlaying(true);
    }
  };

  const handleAssignToProject = () => {
    if (onAssignAudioCue) {
      const cue = `Lyria (${modelType === 'clip' ? 'Clip 30s' : 'Pro 90s'}) - 35.2Hz Resonancia`;
      onAssignAudioCue(cue);
      setIsAssigned(true);
      setTimeout(() => setIsAssigned(false), 2500);
    }
  };

  return (
    <div className="bg-neutral-900/40 border border-neutral-800 rounded-lg p-6 space-y-6">
      {/* Title */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 border-b border-neutral-800 pb-4">
        <div>
          <div className="flex items-center gap-2">
            <Music className="w-4 h-4 text-amber-400" />
            <h3 className="text-base font-serif font-medium text-neutral-100">
              Generador de Banda Sonora Acústica (Lyria 3)
            </h3>
          </div>
          <p className="text-xs text-neutral-400 mt-1 max-w-2xl font-sans">
            Produce pistas ambientales y cues sonoros autorizados utilizando los modelos <strong className="text-neutral-300 font-mono">lyria-3-clip-preview</strong> (&le;30s) y <strong className="text-neutral-300 font-mono">lyria-3-pro-preview</strong>.
          </p>
        </div>

        {/* Model Switcher */}
        <div className="flex items-center gap-1 p-1 bg-neutral-950 border border-neutral-800 rounded-lg shrink-0">
          <button
            onClick={() => setModelType('clip')}
            className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-mono uppercase rounded transition-colors ${
              modelType === 'clip'
                ? 'bg-amber-950/70 text-amber-200 border border-amber-800/80 font-medium'
                : 'text-neutral-400 hover:text-neutral-200'
            }`}
          >
            <Radio className="w-3.5 h-3.5" />
            <span>lyria-3-clip-preview (&le;30s)</span>
          </button>
          <button
            onClick={() => setModelType('pro')}
            className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-mono uppercase rounded transition-colors ${
              modelType === 'pro'
                ? 'bg-amber-950/70 text-amber-200 border border-amber-800/80 font-medium'
                : 'text-neutral-400 hover:text-neutral-200'
            }`}
          >
            <Disc className="w-3.5 h-3.5" />
            <span>lyria-3-pro-preview (Completo)</span>
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Presets & Prompt */}
        <div className="lg:col-span-7 space-y-4">
          <div className="space-y-1.5">
            <span className="text-[10px] font-mono uppercase text-neutral-400 block">
              Ajustes Didácticos Predefinidos:
            </span>
            <div className="flex flex-wrap gap-1.5">
              {presets.map((p, idx) => (
                <button
                  key={idx}
                  type="button"
                  onClick={() => setPrompt(p.text)}
                  className="px-2.5 py-1 text-[11px] font-mono bg-neutral-950 hover:bg-neutral-800 border border-neutral-800 rounded text-neutral-300 transition-colors"
                >
                  {p.label}
                </button>
              ))}
            </div>
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-mono uppercase tracking-wider text-neutral-400 block">
              Prompt Musical Descriptivo (Lyria 3):
            </label>
            <textarea
              rows={4}
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              placeholder="Describe instrumentación, frecuencia de resonancia (35.2 Hz), tempo y acústica de sala..."
              className="w-full bg-neutral-950 border border-neutral-800 rounded p-3 text-xs text-neutral-100 font-mono leading-relaxed focus:outline-none focus:border-amber-500"
            />
          </div>

          <div className="flex items-center justify-between pt-1">
            <span className="text-[11px] font-mono text-neutral-500">
              Modelo en uso: <strong className="text-amber-400">{modelType === 'clip' ? 'lyria-3-clip-preview' : 'lyria-3-pro-preview'}</strong>
            </span>

            <button
              onClick={handleGenerate}
              disabled={isGenerating || !prompt.trim()}
              className="flex items-center gap-2 px-4 py-2 bg-amber-500 hover:bg-amber-400 text-neutral-950 font-mono uppercase text-xs font-medium rounded transition-colors disabled:opacity-50"
            >
              {isGenerating ? (
                <>
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  <span>Sintetizando Audio...</span>
                </>
              ) : (
                <>
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>Generar Pista Lyria</span>
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

        {/* Right Column: Audio Output & Player */}
        <div className="lg:col-span-5 space-y-4">
          <div className="bg-neutral-950 rounded-lg border border-neutral-800 p-5 space-y-4">
            <div className="flex items-center justify-between border-b border-neutral-800/80 pb-3">
              <span className="text-xs font-mono uppercase text-neutral-400 flex items-center gap-1.5">
                <Volume2 className="w-3.5 h-3.5 text-amber-500" />
                <span>Reproductor de Pista Acústica</span>
              </span>
              <span className="text-[10px] font-mono uppercase bg-neutral-900 border border-amber-800/50 text-amber-400 px-2 py-0.5 rounded">
                DEMO_SYNTHETIC
              </span>
            </div>

            {audioBase64 ? (
              <div className="space-y-3">
                <audio
                  ref={audioRef}
                  src={audioBase64}
                  onEnded={() => setIsPlaying(false)}
                  controls
                  className="w-full"
                />

                <div className="flex items-center justify-between pt-2">
                  <a
                    href={audioBase64}
                    download={`lyria-${modelType}-${Date.now()}.wav`}
                    className="flex items-center gap-1 px-3 py-1.5 bg-neutral-900 hover:bg-neutral-800 text-neutral-300 text-xs font-mono rounded border border-neutral-800 transition-colors"
                  >
                    <Download className="w-3.5 h-3.5" />
                    <span>Descargar WAV</span>
                  </a>

                  {onAssignAudioCue && (
                    <button
                      onClick={handleAssignToProject}
                      disabled={isAssigned}
                      className="flex items-center gap-1.5 px-3 py-1.5 bg-amber-500 hover:bg-amber-400 text-neutral-950 text-xs font-mono uppercase rounded transition-colors"
                    >
                      {isAssigned ? (
                        <>
                          <Check className="w-3.5 h-3.5" />
                          <span>Pista Asignada</span>
                        </>
                      ) : (
                        <span>Asignar como Pista</span>
                      )}
                    </button>
                  )}
                </div>
              </div>
            ) : (
              <div className="text-center p-6 space-y-2">
                <Music className="w-8 h-8 text-neutral-700 mx-auto" />
                <p className="text-xs font-mono text-neutral-500">
                  {notes || 'Sintetiza un clip de audio de 30s o una pista completa de 90s con Lyria 3.'}
                </p>
                {lyrics && (
                  <div className="mt-3 p-3 bg-neutral-900 rounded border border-neutral-800 text-xs font-mono text-neutral-300 text-left">
                    <span className="text-[10px] text-amber-400 block uppercase">Notación Armónica / Descriptor:</span>
                    <p className="mt-1">{lyrics}</p>
                  </div>
                )}
              </div>
            )}

            {/* Epistemic disclaimer */}
            <div className="p-3 bg-amber-950/20 border border-amber-900/40 rounded text-[11px] text-amber-300/80 font-sans leading-relaxed">
              <strong>Aviso de Propiedad & Procedencia:</strong> Todas las frecuencias y pistas sintetizadas por Lyria portan marca inmutable <span className="font-mono text-amber-400">DEMO_SYNTHETIC</span>. No constituyen registros sonoros históricos reales ni fonogramas canónicos de SFI.
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
