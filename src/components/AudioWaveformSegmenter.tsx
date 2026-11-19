/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 *
 * MULTIMEDIA LAYER — AUDIO SEGMENTATION & WAVEFORM EDITOR
 * Permite importar archivos de audio reales (MP3/WAV/OGG/WEBM) o generar un buffer de prueba 35.2 Hz,
 * decodificar y visualizar la forma de onda (waveform) mediante Web Audio API + Canvas,
 * reproducir segmentos y realizar anotaciones temporales vinculadas a escenas específicas.
 * Garantiza automáticamente la procedencia DEMO_SYNTHETIC en todo material importado o anotado.
 */

import React, { useState, useRef, useEffect } from 'react';
import { AudiovisualScene, AudioWaveformSegment } from '../types';
import {
  Upload,
  Play,
  Pause,
  Scissors,
  Plus,
  Trash2,
  AudioWaveform,
  Link2,
  Check,
  AlertTriangle,
  Radio,
} from 'lucide-react';

interface AudioWaveformSegmenterProps {
  scenes: AudiovisualScene[];
  segments: AudioWaveformSegment[];
  onSegmentsChange: (segments: AudioWaveformSegment[]) => void;
  onBindAnnotationToScene?: (sceneId: string, annotation: string, audioFileName: string) => void;
}

export const AudioWaveformSegmenter: React.FC<AudioWaveformSegmenterProps> = ({
  scenes,
  segments,
  onSegmentsChange,
  onBindAnnotationToScene,
}) => {
  const [audioFileName, setAudioFileName] = useState<string>('muestra_resonancia_35_2hz_demo.wav');
  const [duration, setDuration] = useState<number>(12.0);
  const [peaks, setPeaks] = useState<number[]>([]);
  const [isPlaying, setIsPlaying] = useState(false);
  const [playheadTime, setPlayheadTime] = useState(0);

  // Segment drafting state
  const [startMarker, setStartMarker] = useState<number>(0.0);
  const [endMarker, setEndMarker] = useState<number>(3.5);
  const [selectedSceneId, setSelectedSceneId] = useState<string>(scenes[0]?.id || '');
  const [annotationInput, setAnnotationInput] = useState<string>(
    'Acople armónico inicial a 35.2 Hz antes de la transición visual.'
  );
  const [syncNotice, setSyncNotice] = useState<string | null>(null);
  const [decodeError, setDecodeError] = useState<string | null>(null);

  const audioCtxRef = useRef<AudioContext | null>(null);
  const audioBufferRef = useRef<AudioBuffer | null>(null);
  const sourceNodeRef = useRef<AudioBufferSourceNode | null>(null);
  const playbackTimerRef = useRef<number | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  // Extract normalized amplitude peaks from an AudioBuffer
  const extractPeaksFromBuffer = (buffer: AudioBuffer, targetBars = 180): number[] => {
    const channelData = buffer.getChannelData(0);
    const step = Math.max(1, Math.floor(channelData.length / targetBars));
    const extracted: number[] = [];

    for (let i = 0; i < targetBars; i++) {
      let maxAmp = 0;
      const start = i * step;
      const end = Math.min(channelData.length, start + step);
      for (let j = start; j < end; j++) {
        const abs = Math.abs(channelData[j]);
        if (abs > maxAmp) maxAmp = abs;
      }
      extracted.push(Math.min(1, maxAmp));
    }
    return extracted;
  };

  // Generate an authentic offline Web Audio buffer (35.2 Hz + harmonics + pulsed envelope) for immediate testing
  const buildSyntheticDemoBuffer = () => {
    try {
      const AudioCtx =
        window.AudioContext ||
        (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      if (!audioCtxRef.current) {
        audioCtxRef.current = new AudioCtx();
      }
      const ctx = audioCtxRef.current;
      const sampleRate = ctx.sampleRate || 44100;
      const dur = 12.0;
      const buffer = ctx.createBuffer(1, Math.floor(sampleRate * dur), sampleRate);
      const data = buffer.getChannelData(0);

      for (let i = 0; i < data.length; i++) {
        const t = i / sampleRate;
        const envelope = 0.45 + 0.45 * Math.sin(t * 1.4) * Math.cos(t * 0.35);
        const f0 = Math.sin(2 * Math.PI * 35.2 * t) * 0.55;
        const f1 = Math.sin(2 * Math.PI * 140.8 * t) * 0.25;
        const f2 = Math.sin(2 * Math.PI * 281.6 * t) * (Math.sin(t * 2.5) > 0.3 ? 0.2 : 0.04);
        data[i] = Math.max(-0.95, Math.min(0.95, (f0 + f1 + f2) * envelope));
      }

      audioBufferRef.current = buffer;
      setDuration(dur);
      setAudioFileName('muestra_resonancia_35_2hz_demo.wav');
      setPeaks(extractPeaksFromBuffer(buffer, 180));
      setPlayheadTime(0);
      setStartMarker(0.0);
      setEndMarker(3.5);
      setDecodeError(null);
    } catch (err) {
      console.warn('No se pudo inicializar el sintetizador Web Audio:', err);
    }
  };

  useEffect(() => {
    buildSyntheticDemoBuffer();
    return () => {
      stopPlayback();
      if (audioCtxRef.current && audioCtxRef.current.state !== 'closed') {
        audioCtxRef.current.close().catch(() => {});
      }
    };
  }, []);

  // Import local audio file and decode real waveform via Web Audio API
  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    stopPlayback();
    setDecodeError(null);

    try {
      const AudioCtx =
        window.AudioContext ||
        (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      if (!audioCtxRef.current) {
        audioCtxRef.current = new AudioCtx();
      }
      if (audioCtxRef.current.state === 'suspended') {
        await audioCtxRef.current.resume();
      }

      const arrayBuffer = await file.arrayBuffer();
      const decodedBuffer = await audioCtxRef.current.decodeAudioData(arrayBuffer);

      audioBufferRef.current = decodedBuffer;
      setAudioFileName(file.name);
      setDuration(decodedBuffer.duration);
      setPeaks(extractPeaksFromBuffer(decodedBuffer, 180));
      setPlayheadTime(0);
      setStartMarker(0);
      setEndMarker(Math.min(4.0, Number(decodedBuffer.duration.toFixed(1))));

      setSyncNotice(
        `Audio "${file.name}" importado y etiquetado automáticamente como DEMO_SYNTHETIC (${decodedBuffer.duration.toFixed(1)}s).`
      );
      setTimeout(() => setSyncNotice(null), 4000);
    } catch (err) {
      const msg = err instanceof Error ? err.message : String(err);
      setDecodeError(`No se pudo decodificar el archivo de audio: ${msg}`);
    }
  };

  const stopPlayback = () => {
    if (playbackTimerRef.current) {
      clearInterval(playbackTimerRef.current);
      playbackTimerRef.current = null;
    }
    if (sourceNodeRef.current) {
      try {
        sourceNodeRef.current.stop();
        sourceNodeRef.current.disconnect();
      } catch {
        // Ignore stopped node errors
      }
      sourceNodeRef.current = null;
    }
    setIsPlaying(false);
  };

  const playAudioRange = (fromTime: number, untilTime?: number) => {
    const ctx = audioCtxRef.current;
    const buffer = audioBufferRef.current;
    if (!ctx || !buffer) return;

    if (ctx.state === 'suspended') {
      ctx.resume();
    }

    stopPlayback();

    const safeStart = Math.max(0, Math.min(fromTime, buffer.duration));
    const maxEnd = untilTime !== undefined ? Math.min(untilTime, buffer.duration) : buffer.duration;
    const playLen = Math.max(0.1, maxEnd - safeStart);

    const source = ctx.createBufferSource();
    source.buffer = buffer;
    source.connect(ctx.destination);
    source.start(0, safeStart, playLen);
    sourceNodeRef.current = source;

    setPlayheadTime(safeStart);
    setIsPlaying(true);

    const startedAt = performance.now();
    playbackTimerRef.current = window.setInterval(() => {
      const elapsed = (performance.now() - startedAt) / 1000;
      const nextTime = safeStart + elapsed;
      if (nextTime >= maxEnd) {
        stopPlayback();
        setPlayheadTime(maxEnd >= buffer.duration ? 0 : safeStart);
      } else {
        setPlayheadTime(nextTime);
      }
    }, 40);
  };

  const togglePlay = () => {
    if (isPlaying) {
      stopPlayback();
    } else {
      playAudioRange(playheadTime);
    }
  };

  // Draw waveform canvas with segment highlights & playhead
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const width = canvas.width;
    const height = canvas.height;
    const midY = height / 2;

    ctx.fillStyle = '#090b10';
    ctx.fillRect(0, 0, width, height);

    // Subtle time grid
    ctx.strokeStyle = '#181824';
    ctx.lineWidth = 1;
    for (let x = 0; x < width; x += 60) {
      ctx.beginPath();
      ctx.moveTo(x, 0);
      ctx.lineTo(x, height);
      ctx.stroke();
    }
    ctx.beginPath();
    ctx.moveTo(0, midY);
    ctx.lineTo(width, midY);
    ctx.stroke();

    // Render annotated segment bands
    segments.forEach((seg) => {
      if (duration <= 0) return;
      const sx = (seg.startTime / duration) * width;
      const ex = (seg.endTime / duration) * width;
      ctx.fillStyle = 'rgba(16, 185, 129, 0.16)';
      ctx.fillRect(sx, 0, Math.max(2, ex - sx), height);
      ctx.strokeStyle = 'rgba(16, 185, 129, 0.7)';
      ctx.beginPath();
      ctx.moveTo(sx, 0);
      ctx.lineTo(sx, height);
      ctx.moveTo(ex, 0);
      ctx.lineTo(ex, height);
      ctx.stroke();
    });

    // Draft selection band
    if (duration > 0 && endMarker > startMarker) {
      const dx1 = (startMarker / duration) * width;
      const dx2 = (endMarker / duration) * width;
      ctx.fillStyle = 'rgba(245, 158, 11, 0.15)';
      ctx.fillRect(dx1, 0, dx2 - dx1, height);
    }

    // Waveform amplitude bars
    if (peaks.length > 0) {
      const barW = width / peaks.length;
      peaks.forEach((amp, idx) => {
        const barH = Math.max(3, amp * (height * 0.84));
        const barTime = (idx / peaks.length) * duration;
        const isPassed = barTime <= playheadTime;
        ctx.fillStyle = isPassed ? '#f59e0b' : '#22d3ee';
        ctx.fillRect(idx * barW, midY - barH / 2, Math.max(1.5, barW - 1.5), barH);
      });
    }

    // Playhead cursor
    if (duration > 0) {
      const px = (playheadTime / duration) * width;
      ctx.strokeStyle = '#fbbf24';
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(px, 0);
      ctx.lineTo(px, height);
      ctx.stroke();
    }
  }, [peaks, segments, startMarker, endMarker, playheadTime, duration]);

  const handleCanvasClick = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas || duration <= 0) return;
    const rect = canvas.getBoundingClientRect();
    const clickRatio = Math.max(0, Math.min(1, (e.clientX - rect.left) / rect.width));
    const targetTime = Number((clickRatio * duration).toFixed(2));
    setPlayheadTime(targetTime);
    if (isPlaying) {
      playAudioRange(targetTime);
    }
  };

  // Enforces automatic DEMO_SYNTHETIC tagging on every created segment
  const handleCreateSegment = () => {
    const cleanStart = Math.max(0, Math.min(startMarker, duration));
    const cleanEnd = Math.max(cleanStart + 0.2, Math.min(endMarker, duration));

    const newSegment: AudioWaveformSegment = {
      id: `aud-seg-${Date.now()}`,
      audioFileName,
      startTime: Number(cleanStart.toFixed(2)),
      endTime: Number(cleanEnd.toFixed(2)),
      linkedSceneId: selectedSceneId || scenes[0]?.id || 'sc-1',
      annotation: annotationInput.trim() || 'Anotación temporal de audio',
      provenance: 'DEMO_SYNTHETIC',
      isDemoSynthetic: true,
      createdAt: new Date().toISOString(),
    };

    onSegmentsChange([newSegment, ...segments]);

    if (onBindAnnotationToScene && newSegment.linkedSceneId) {
      onBindAnnotationToScene(newSegment.linkedSceneId, newSegment.annotation, audioFileName);
    }

    setSyncNotice(
      `Segmento (${newSegment.startTime}s–${newSegment.endTime}s) vinculado a escena con sello obligatorio DEMO_SYNTHETIC.`
    );
    setTimeout(() => setSyncNotice(null), 4000);
  };

  const handleDeleteSegment = (id: string) => {
    onSegmentsChange(segments.filter((s) => s.id !== id));
  };

  return (
    <div className="bg-neutral-950 border border-neutral-800 rounded-xl p-6 space-y-5">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-neutral-800 pb-4">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <AudioWaveform className="w-4 h-4 text-cyan-400" />
            <span className="text-xs font-mono uppercase tracking-widest text-cyan-400 font-semibold">
              SEGMENTADOR DE AUDIO & EDITOR WAVEFORM
            </span>
          </div>
          <h3 className="text-base font-serif font-semibold text-neutral-100">
            Importación de Pistas WAV/MP3, Visualización de Onda & Anotaciones por Escena
          </h3>
          <p className="text-xs text-neutral-400 font-sans">
            Importa un archivo de audio o usa la muestra resonante 35.2 Hz, selecciona intervalos en la forma de onda y vincula anotaciones temporales a las escenas del guión. <strong className="text-amber-300">Todo material importado y segmentado recibe automáticamente procedencia DEMO_SYNTHETIC.</strong>
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2 shrink-0">
          <input
            ref={fileInputRef}
            type="file"
            accept="audio/*"
            onChange={handleFileUpload}
            className="hidden"
          />
          <button
            onClick={() => fileInputRef.current?.click()}
            className="flex items-center gap-1.5 px-3.5 py-2 bg-cyan-500 hover:bg-cyan-400 text-neutral-950 font-mono text-xs uppercase font-semibold rounded-lg transition-colors"
          >
            <Upload className="w-3.5 h-3.5" />
            <span>Importar Audio</span>
          </button>
          <button
            onClick={buildSyntheticDemoBuffer}
            className="flex items-center gap-1.5 px-3 py-2 bg-neutral-900 hover:bg-neutral-800 text-neutral-300 border border-neutral-700 font-mono text-xs uppercase rounded-lg transition-colors"
          >
            <Radio className="w-3.5 h-3.5 text-amber-400" />
            <span>Cargar Demo 35.2 Hz</span>
          </button>
        </div>
      </div>

      {decodeError && (
        <div className="p-3 bg-rose-950/40 border border-rose-800 rounded-lg text-xs text-rose-300 flex items-center gap-2">
          <AlertTriangle className="w-4 h-4 text-rose-400 shrink-0" />
          <span>{decodeError}</span>
        </div>
      )}

      {syncNotice && (
        <div className="p-3 bg-emerald-950/40 border border-emerald-800 rounded-lg text-xs text-emerald-200 flex items-center gap-2">
          <Check className="w-4 h-4 text-emerald-400 shrink-0" />
          <span>{syncNotice}</span>
        </div>
      )}

      {/* Waveform Canvas Viewport */}
      <div className="space-y-3">
        <div className="flex flex-wrap items-center justify-between gap-2 text-xs font-mono">
          <div className="flex items-center gap-2">
            <span className="text-neutral-400">Archivo:</span>
            <span className="text-neutral-100 font-semibold">{audioFileName}</span>
            <span className="px-2 py-0.5 bg-amber-950/60 border border-amber-700/70 text-amber-300 text-[10px] rounded">
              DEMO_SYNTHETIC
            </span>
          </div>
          <div className="text-neutral-400 tabular-nums">
            Cursor: <strong className="text-amber-400">{playheadTime.toFixed(2)}s</strong> / {duration.toFixed(2)}s
          </div>
        </div>

        <div className="relative border border-neutral-800 rounded-lg overflow-hidden bg-[#090b10]">
          <canvas
            ref={canvasRef}
            width={920}
            height={150}
            onClick={handleCanvasClick}
            className="w-full h-[150px] cursor-crosshair block"
            title="Haz clic sobre la forma de onda para mover el cursor temporal"
          />
          <div className="absolute top-2 right-2 bg-neutral-950/85 border border-neutral-800 px-2 py-0.5 rounded text-[10px] font-mono text-neutral-400 pointer-events-none">
            Clic para posicionar · Verde: Segmentos · Ámbar: Selección
          </div>
        </div>

        {/* Transport & Marker Bar */}
        <div className="flex flex-wrap items-center justify-between gap-3 pt-1">
          <div className="flex items-center gap-2">
            <button
              onClick={togglePlay}
              className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded font-mono text-xs uppercase font-semibold transition-colors ${
                isPlaying
                  ? 'bg-rose-600 hover:bg-rose-500 text-white'
                  : 'bg-amber-500 hover:bg-amber-400 text-neutral-950'
              }`}
            >
              {isPlaying ? <Pause className="w-3.5 h-3.5" /> : <Play className="w-3.5 h-3.5" />}
              <span>{isPlaying ? 'Pausar' : 'Reproducir Pista'}</span>
            </button>
            <button
              onClick={() => setStartMarker(Number(playheadTime.toFixed(2)))}
              className="px-2.5 py-1.5 bg-neutral-900 hover:bg-neutral-800 border border-neutral-700 rounded text-[11px] font-mono text-neutral-300"
            >
              [ Marcar Inicio ({playheadTime.toFixed(1)}s)
            </button>
            <button
              onClick={() => setEndMarker(Number(Math.max(startMarker + 0.3, playheadTime).toFixed(2)))}
              className="px-2.5 py-1.5 bg-neutral-900 hover:bg-neutral-800 border border-neutral-700 rounded text-[11px] font-mono text-neutral-300"
            >
              Marcar Fin ({playheadTime.toFixed(1)}s) ]
            </button>
          </div>

          <button
            onClick={() => playAudioRange(startMarker, endMarker)}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-neutral-900 hover:bg-neutral-800 border border-amber-700/70 text-amber-300 text-xs font-mono rounded"
          >
            <Scissors className="w-3.5 h-3.5" />
            <span>Previsualizar Intervalo ({startMarker.toFixed(1)}s–{endMarker.toFixed(1)}s)</span>
          </button>
        </div>
      </div>

      {/* Create Scene-Linked Temporal Annotation */}
      <div className="bg-neutral-900/50 border border-neutral-800 rounded-xl p-4 space-y-4">
        <div className="flex items-center justify-between border-b border-neutral-800 pb-2">
          <span className="text-xs font-mono uppercase text-emerald-400 font-semibold flex items-center gap-1.5">
            <Link2 className="w-3.5 h-3.5" />
            <span>Vincular Anotación Temporal a Escena</span>
          </span>
          <span className="text-[10px] font-mono text-neutral-500">
            Auto-etiqueta: DEMO_SYNTHETIC
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-3 text-xs font-mono">
          <div>
            <label className="text-[10px] uppercase text-neutral-400 block mb-1">Inicio (s)</label>
            <input
              type="number"
              step="0.1"
              min="0"
              max={duration}
              value={startMarker}
              onChange={(e) => setStartMarker(Number(e.target.value) || 0)}
              className="w-full bg-neutral-950 border border-neutral-800 rounded px-3 py-2 text-neutral-100 tabular-nums"
            />
          </div>
          <div>
            <label className="text-[10px] uppercase text-neutral-400 block mb-1">Fin (s)</label>
            <input
              type="number"
              step="0.1"
              min="0.2"
              max={duration}
              value={endMarker}
              onChange={(e) => setEndMarker(Number(e.target.value) || 0.5)}
              className="w-full bg-neutral-950 border border-neutral-800 rounded px-3 py-2 text-neutral-100 tabular-nums"
            />
          </div>
          <div className="md:col-span-2">
            <label className="text-[10px] uppercase text-neutral-400 block mb-1">Escena Destino del Guión</label>
            <select
              value={selectedSceneId}
              onChange={(e) => setSelectedSceneId(e.target.value)}
              className="w-full bg-neutral-950 border border-neutral-800 rounded px-3 py-2 text-neutral-100"
            >
              {scenes.map((sc) => (
                <option key={sc.id} value={sc.id}>
                  Escena {sc.sceneNumber}.{sc.shotNumber} — {sc.shotType} ({sc.durationSeconds}s)
                </option>
              ))}
            </select>
          </div>
        </div>

        <div className="flex flex-col sm:flex-row gap-3">
          <input
            type="text"
            value={annotationInput}
            onChange={(e) => setAnnotationInput(e.target.value)}
            placeholder="Describe la nota acústica, cue de transición o frase en este intervalo..."
            className="flex-1 bg-neutral-950 border border-neutral-800 rounded px-3 py-2 text-xs text-neutral-100 font-sans focus:outline-none focus:border-emerald-500"
          />
          <button
            onClick={handleCreateSegment}
            className="flex items-center justify-center gap-1.5 px-4 py-2 bg-emerald-500 hover:bg-emerald-400 text-neutral-950 font-mono text-xs uppercase font-semibold rounded transition-colors shrink-0"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Guardar Segmento</span>
          </button>
        </div>
      </div>

      {/* Saved Segments Registry */}
      <div className="space-y-2">
        <span className="text-[11px] font-mono uppercase text-neutral-400 block">
          Registro de Segmentos Anotados ({segments.length})
        </span>
        {segments.length === 0 ? (
          <div className="p-4 border border-dashed border-neutral-800 rounded-lg text-center text-xs font-mono text-neutral-500">
            Aún no hay segmentos anotados. Marca inicio y fin sobre la forma de onda para vincularlos a una escena.
          </div>
        ) : (
          <div className="space-y-2">
            {segments.map((seg) => {
              const linkedScene = scenes.find((s) => s.id === seg.linkedSceneId);
              return (
                <div
                  key={seg.id}
                  className="bg-neutral-900/50 border border-neutral-800 rounded-lg p-3 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs"
                >
                  <div className="space-y-1">
                    <div className="flex flex-wrap items-center gap-2 font-mono">
                      <span className="text-emerald-400 font-bold tabular-nums">
                        {seg.startTime.toFixed(2)}s → {seg.endTime.toFixed(2)}s
                      </span>
                      <span className="text-neutral-500">·</span>
                      <span className="text-cyan-300">
                        {linkedScene
                          ? `Escena ${linkedScene.sceneNumber}.${linkedScene.shotNumber} (${linkedScene.shotType})`
                          : seg.linkedSceneId}
                      </span>
                      <span className="px-1.5 py-0.5 bg-amber-950/60 border border-amber-800/70 text-amber-300 text-[10px] rounded">
                        {seg.provenance}
                      </span>
                    </div>
                    <p className="text-neutral-200 font-sans">{seg.annotation}</p>
                    <span className="text-[10px] font-mono text-neutral-500 block">
                      Fuente: {seg.audioFileName}
                    </span>
                  </div>

                  <div className="flex items-center gap-2 shrink-0">
                    <button
                      onClick={() => playAudioRange(seg.startTime, seg.endTime)}
                      className="flex items-center gap-1 px-2.5 py-1 bg-neutral-950 hover:bg-neutral-800 border border-neutral-700 rounded text-[11px] font-mono text-amber-300"
                    >
                      <Play className="w-3 h-3" />
                      <span>Escuchar</span>
                    </button>
                    <button
                      onClick={() => handleDeleteSegment(seg.id)}
                      className="p-1.5 text-neutral-500 hover:text-rose-400 transition-colors"
                      title="Eliminar segmento"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};
