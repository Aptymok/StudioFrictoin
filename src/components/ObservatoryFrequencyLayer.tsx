/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * 
 * SFI CREATIVE COMPANION — OBSERVATORY: FREQUENCY LAYER
 * Professional acoustic, spectral & waveform observatory:
 * - Real-time Web Audio Oscilloscope & Fourier FFT Spectrogram (35.2 Hz resonance & harmonics)
 * - Interactive WAV Waveform Multi-segmenter & Phrase Slicer ("partes, frases, segmentación para WAVs")
 * - Generative Music Engine with Lyria 3 (lyria-3-clip-preview & lyria-3-pro-preview)
 * - Live Microphone Dictation & Transcription with gemini-3.5-transcribe
 * - Inescapable DEMO_SYNTHETIC provenance stamp
 */

import React, { useState, useEffect, useRef } from 'react';
import { MusicChannelConfig } from '../types';
import { MusicStudioLyria } from './MusicStudioLyria';
import { AudioTranscriberMic } from './AudioTranscriberMic';
import { 
  Activity, 
  Volume2, 
  VolumeX, 
  Play, 
  Pause, 
  Scissors, 
  Plus, 
  Trash2, 
  Sparkles, 
  Radio, 
  Sliders, 
  Clock, 
  Check, 
  AlertTriangle,
  FileAudio,
  Layers
} from 'lucide-react';

interface AudioSlice {
  id: string;
  name: string;
  startTime: number;
  endTime: number;
  phraseText: string;
  harmonicNote: string;
  isLoop: boolean;
}

interface ObservatoryFrequencyLayerProps {
  onAssignAudioCue?: (cueName: string) => void;
}

export const ObservatoryFrequencyLayer: React.FC<ObservatoryFrequencyLayerProps> = ({
  onAssignAudioCue,
}) => {
  const [isPlayingOscillator, setIsPlayingOscillator] = useState(false);
  const [oscillatorFreq, setOscillatorFreq] = useState(35.2);
  const [gainLevel, setGainLevel] = useState(0.2);
  const [activeHarmonicPreset, setActiveHarmonicPreset] = useState<'35.2' | '70.4' | '105.6' | '140.8'>('35.2');
  const [activeTool, setActiveTool] = useState<'spectrogram' | 'daw_mixer' | 'slicer' | 'lyria_engine' | 'dictation'>('spectrogram');

  // Multi-channel Music & Song Editing DAW Console State
  const [channels, setChannels] = useState<MusicChannelConfig[]>([
    {
      id: 'ch-1',
      name: 'Canal 1 · Base Resonante',
      instrument: 'Oscilador Senoidal Puro',
      frequencyHz: 35.2,
      pan: 0,
      gain: 0.75,
      muted: false,
      solo: false,
    },
    {
      id: 'ch-2',
      name: 'Canal 2 · Cuerda Sub-Grave',
      instrument: 'Violonchelo Sub-Grave',
      frequencyHz: 70.4,
      pan: -0.3,
      gain: 0.55,
      muted: false,
      solo: false,
    },
    {
      id: 'ch-3',
      name: 'Canal 3 · Bronce & Cámara',
      instrument: 'Trompa de Latón 1934',
      frequencyHz: 140.8,
      pan: 0.35,
      gain: 0.45,
      muted: false,
      solo: false,
    },
    {
      id: 'ch-4',
      name: 'Canal 4 · Textura Vacío',
      instrument: 'Tubos de Vacío & Relé',
      frequencyHz: 211.2,
      pan: 0.1,
      gain: 0.35,
      muted: false,
      solo: false,
    },
  ]);
  const [selectedChannelId, setSelectedChannelId] = useState<string>('ch-1');
  const [isAuditioningMix, setIsAuditioningMix] = useState<boolean>(false);
  const mixNodesRef = useRef<OscillatorNode[]>([]);

  // Multi-segment slices state for WAV editing
  const [slices, setSlices] = useState<AudioSlice[]>([
    {
      id: 'slice-1',
      name: 'Frase A: Impulso Inicial de Vacío',
      startTime: 0.0,
      endTime: 4.8,
      phraseText: 'Aparato A estabilizado a 35.2 Hz en cámara subterránea.',
      harmonicNote: 'Fundamental F0 (35.2 Hz)',
      isLoop: false,
    },
    {
      id: 'slice-2',
      name: 'Frase B: Acoplamiento de Filamentos',
      startTime: 4.8,
      endTime: 12.4,
      phraseText: 'Resonancia acústica amortiguada por aceite mineral en base de fundición.',
      harmonicNote: 'Primer Armónico (70.4 Hz)',
      isLoop: true,
    },
    {
      id: 'slice-3',
      name: 'Frase C: Atenuación Crítica',
      startTime: 12.4,
      endTime: 18.0,
      phraseText: 'Desacoplamiento mecánico completado. Registro archivado.',
      harmonicNote: 'Sub-armónico 17.6 Hz',
      isLoop: false,
    },
  ]);
  const [selectedSliceId, setSelectedSliceId] = useState<string>('slice-1');
  const [playheadTime, setPlayheadTime] = useState(0);
  const [isPlayingSlices, setIsPlayingSlices] = useState(false);

  // Web Audio Context & Analyzer references
  const audioCtxRef = useRef<AudioContext | null>(null);
  const oscillatorNodeRef = useRef<OscillatorNode | null>(null);
  const gainNodeRef = useRef<GainNode | null>(null);
  const analyserNodeRef = useRef<AnalyserNode | null>(null);
  const canvasOscRef = useRef<HTMLCanvasElement | null>(null);
  const canvasFftRef = useRef<HTMLCanvasElement | null>(null);
  const animFrameRef = useRef<number | null>(null);

  // Initialize Web Audio
  useEffect(() => {
    return () => {
      if (animFrameRef.current) cancelAnimationFrame(animFrameRef.current);
      if (audioCtxRef.current && audioCtxRef.current.state !== 'closed') {
        audioCtxRef.current.close().catch(() => {});
      }
    };
  }, []);

  const ensureAudioContext = () => {
    if (!audioCtxRef.current) {
      const AudioCtx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      const ctx = new AudioCtx();
      const analyser = ctx.createAnalyser();
      analyser.fftSize = 512;
      analyser.smoothingTimeConstant = 0.85;

      const gain = ctx.createGain();
      gain.gain.setValueAtTime(0, ctx.currentTime);

      gain.connect(analyser);
      analyser.connect(ctx.destination);

      audioCtxRef.current = ctx;
      gainNodeRef.current = gain;
      analyserNodeRef.current = analyser;
    }
    if (audioCtxRef.current.state === 'suspended') {
      audioCtxRef.current.resume();
    }
  };

  const toggleOscillator = () => {
    ensureAudioContext();
    const ctx = audioCtxRef.current;
    if (!ctx) return;

    if (isPlayingOscillator) {
      if (gainNodeRef.current) {
        gainNodeRef.current.gain.setTargetAtTime(0, ctx.currentTime, 0.05);
      }
      setTimeout(() => {
        if (oscillatorNodeRef.current) {
          try {
            oscillatorNodeRef.current.stop();
            oscillatorNodeRef.current.disconnect();
          } catch {}
          oscillatorNodeRef.current = null;
        }
      }, 60);
      setIsPlayingOscillator(false);
    } else {
      const osc = ctx.createOscillator();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(oscillatorFreq, ctx.currentTime);

      if (gainNodeRef.current) {
        osc.connect(gainNodeRef.current);
        gainNodeRef.current.gain.setTargetAtTime(gainLevel, ctx.currentTime, 0.05);
      }

      osc.start();
      oscillatorNodeRef.current = osc;
      setIsPlayingOscillator(true);
    }
  };

  const setHarmonicPreset = (freqStr: '35.2' | '70.4' | '105.6' | '140.8') => {
    setActiveHarmonicPreset(freqStr);
    const f = parseFloat(freqStr);
    setOscillatorFreq(f);
    if (oscillatorNodeRef.current && audioCtxRef.current) {
      oscillatorNodeRef.current.frequency.setTargetAtTime(f, audioCtxRef.current.currentTime, 0.03);
    }
  };

  // Real-time Visualizer Canvas Loop
  useEffect(() => {
    const draw = () => {
      animFrameRef.current = requestAnimationFrame(draw);

      // 1. Oscilloscope Time-Domain
      const canvasOsc = canvasOscRef.current;
      const analyser = analyserNodeRef.current;
      if (canvasOsc) {
        const ctx = canvasOsc.getContext('2d');
        if (ctx) {
          const width = canvasOsc.width;
          const height = canvasOsc.height;
          ctx.fillStyle = '#0a0a0f';
          ctx.fillRect(0, 0, width, height);

          // Grid lines
          ctx.strokeStyle = '#181824';
          ctx.lineWidth = 1;
          for (let y = 0; y <= height; y += 25) {
            ctx.beginPath();
            ctx.moveTo(0, y);
            ctx.lineTo(width, y);
            ctx.stroke();
          }
          for (let x = 0; x <= width; x += 40) {
            ctx.beginPath();
            ctx.moveTo(x, 0);
            ctx.lineTo(x, height);
            ctx.stroke();
          }

          if (analyser && isPlayingOscillator) {
            const bufferLength = analyser.frequencyBinCount;
            const dataArray = new Uint8Array(bufferLength);
            analyser.getByteTimeDomainData(dataArray);

            ctx.lineWidth = 2.5;
            ctx.strokeStyle = '#f59e0b';
            ctx.shadowBlur = 8;
            ctx.shadowColor = '#d97706';
            ctx.beginPath();

            const sliceWidth = width / bufferLength;
            let x = 0;
            for (let i = 0; i < bufferLength; i++) {
              const v = dataArray[i] / 128.0;
              const y = (v * height) / 2;
              if (i === 0) ctx.moveTo(x, y);
              else ctx.lineTo(x, y);
              x += sliceWidth;
            }
            ctx.stroke();
            ctx.shadowBlur = 0;
          } else {
            // Idle simulated baseline with subtle jitter
            ctx.lineWidth = 1.5;
            ctx.strokeStyle = '#40404f';
            ctx.beginPath();
            const mid = height / 2;
            ctx.moveTo(0, mid);
            for (let x = 0; x < width; x += 10) {
              const noise = isPlayingSlices ? Math.sin((x * 0.05) + (Date.now() * 0.005)) * 12 : 0;
              ctx.lineTo(x, mid + noise);
            }
            ctx.stroke();
          }
        }
      }

      // 2. FFT Frequency Spectrogram
      const canvasFft = canvasFftRef.current;
      if (canvasFft) {
        const ctx = canvasFft.getContext('2d');
        if (ctx) {
          const width = canvasFft.width;
          const height = canvasFft.height;
          ctx.fillStyle = '#0a0a0f';
          ctx.fillRect(0, 0, width, height);

          if (analyser && isPlayingOscillator) {
            const bufferLength = analyser.frequencyBinCount;
            const freqData = new Uint8Array(bufferLength);
            analyser.getByteFrequencyData(freqData);

            const barWidth = (width / (bufferLength / 2)) * 2.2;
            let barX = 0;
            for (let i = 0; i < bufferLength / 2; i++) {
              const barHeight = (freqData[i] / 255) * height;
              const grad = ctx.createLinearGradient(0, height, 0, height - barHeight);
              grad.addColorStop(0, '#06b6d4');
              grad.addColorStop(0.6, '#f59e0b');
              grad.addColorStop(1, '#ef4444');

              ctx.fillStyle = grad;
              ctx.fillRect(barX, height - barHeight, barWidth - 1, barHeight);
              barX += barWidth;
            }
          } else {
            // Simulated spectral signature bars
            const bars = 48;
            const barW = width / bars;
            for (let b = 0; b < bars; b++) {
              const isPeak = b === 7 || b === 14 || b === 21; // 35.2 Hz peak markers
              const h = isPeak ? (isPlayingSlices ? 60 : 35) : (b % 4) * 5 + 4;
              ctx.fillStyle = isPeak ? '#f59e0b' : '#272735';
              ctx.fillRect(b * barW, height - h, barW - 2, h);
            }
          }
        }
      }
    };

    draw();
    return () => {
      if (animFrameRef.current) cancelAnimationFrame(animFrameRef.current);
    };
  }, [isPlayingOscillator, isPlayingSlices]);

  // Slices playback timer simulation
  useEffect(() => {
    let interval: number | null = null;
    if (isPlayingSlices) {
      interval = window.setInterval(() => {
        setPlayheadTime((prev) => {
          if (prev >= 18.0) {
            setIsPlayingSlices(false);
            return 0;
          }
          return Math.round((prev + 0.1) * 10) / 10;
        });
      }, 100);
    }
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [isPlayingSlices]);

  const handleAddNewSlice = () => {
    const lastEnd = slices[slices.length - 1]?.endTime || 0;
    const newSlice: AudioSlice = {
      id: `slice-${Date.now()}`,
      name: `Frase ${String.fromCharCode(65 + slices.length)}: Segmento Nuevo`,
      startTime: lastEnd,
      endTime: lastEnd + 5.0,
      phraseText: 'Frase oral transcripta o generada para sincronización sonora.',
      harmonicNote: 'Armónico secundario variable',
      isLoop: false,
    };
    setSlices([...slices, newSlice]);
    setSelectedSliceId(newSlice.id);
  };

  const handleDeleteSlice = (id: string) => {
    if (slices.length <= 1) return;
    setSlices(slices.filter((s) => s.id !== id));
    if (selectedSliceId === id) {
      setSelectedSliceId(slices[0].id);
    }
  };

  const handleUpdateCurrentSlice = (key: keyof AudioSlice, val: any) => {
    setSlices(
      slices.map((s) => (s.id === selectedSliceId ? { ...s, [key]: val } : s))
    );
  };

  const selectedSlice = slices.find((s) => s.id === selectedSliceId) || slices[0];

  return (
    <div className="space-y-6">
      {/* Top Observatory Banner */}
      <div className="bg-neutral-900/60 border border-neutral-800 rounded-xl p-6 relative overflow-hidden backdrop-blur-md">
        <div className="absolute top-0 right-0 w-96 h-96 bg-amber-500/5 rounded-full blur-3xl pointer-events-none" />
        
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-neutral-800/80 pb-5">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <Radio className="w-5 h-5 text-amber-500" />
              <span className="text-xs font-mono uppercase tracking-widest text-amber-500 font-semibold">
                FREQUENCY LAYER · OBSERVATORIO ACÚSTICO & ESPECTRAL
              </span>
            </div>
            <h1 className="text-2xl md:text-3xl font-serif font-bold text-neutral-100">
              Laboratorio de Frecuencias, Segmentación de WAVs & Generación Lyria 3
            </h1>
            <p className="text-xs text-neutral-400 max-w-3xl font-sans">
              Oscilador espectral de 35.2 Hz en tiempo real, segmentador visual de frases sonoras para pistas WAV, transcripción oral con <strong className="text-neutral-200">gemini-3.5-transcribe</strong> y composición ambiental con <strong className="text-amber-400">Lyria 3</strong>.
            </p>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <span className="px-2.5 py-1 text-[11px] font-mono uppercase tracking-wider bg-neutral-950 border border-amber-800/80 text-amber-300 rounded shadow-sm">
              DEMO_SYNTHETIC · 35.2 Hz
            </span>
          </div>
        </div>

        {/* Navigation Tabs for Frequency Layer */}
        <div className="flex flex-wrap items-center gap-2 pt-4">
          <button
            onClick={() => setActiveTool('spectrogram')}
            className={`flex items-center gap-1.5 px-3.5 py-2 text-xs font-mono uppercase rounded-lg border transition-all ${
              activeTool === 'spectrogram'
                ? 'bg-amber-950/70 border-amber-600 text-amber-200 font-semibold shadow-md'
                : 'bg-neutral-950 border-neutral-800 text-neutral-400 hover:text-neutral-200'
            }`}
          >
            <Activity className="w-4 h-4 text-amber-500" />
            <span>Osciloscopio & FFT (35.2 Hz)</span>
          </button>
          <button
            onClick={() => setActiveTool('daw_mixer')}
            className={`flex items-center gap-1.5 px-3.5 py-2 text-xs font-mono uppercase rounded-lg border transition-all ${
              activeTool === 'daw_mixer'
                ? 'bg-amber-950/70 border-amber-600 text-amber-200 font-semibold shadow-md'
                : 'bg-neutral-950 border-neutral-800 text-neutral-400 hover:text-neutral-200'
            }`}
          >
            <Sliders className="w-4 h-4 text-emerald-400" />
            <span>Consola DAW (Canales / Instrumentos)</span>
          </button>
          <button
            onClick={() => setActiveTool('slicer')}
            className={`flex items-center gap-1.5 px-3.5 py-2 text-xs font-mono uppercase rounded-lg border transition-all ${
              activeTool === 'slicer'
                ? 'bg-amber-950/70 border-amber-600 text-amber-200 font-semibold shadow-md'
                : 'bg-neutral-950 border-neutral-800 text-neutral-400 hover:text-neutral-200'
            }`}
          >
            <Scissors className="w-4 h-4 text-cyan-400" />
            <span>Segmentador de WAVs & Frases</span>
          </button>
          <button
            onClick={() => setActiveTool('lyria_engine')}
            className={`flex items-center gap-1.5 px-3.5 py-2 text-xs font-mono uppercase rounded-lg border transition-all ${
              activeTool === 'lyria_engine'
                ? 'bg-amber-950/70 border-amber-600 text-amber-200 font-semibold shadow-md'
                : 'bg-neutral-950 border-neutral-800 text-neutral-400 hover:text-neutral-200'
            }`}
          >
            <Sparkles className="w-4 h-4 text-amber-400" />
            <span>Generador Lyria 3 (Clip & Pro)</span>
          </button>
          <button
            onClick={() => setActiveTool('dictation')}
            className={`flex items-center gap-1.5 px-3.5 py-2 text-xs font-mono uppercase rounded-lg border transition-all ${
              activeTool === 'dictation'
                ? 'bg-amber-950/70 border-amber-600 text-amber-200 font-semibold shadow-md'
                : 'bg-neutral-950 border-neutral-800 text-neutral-400 hover:text-neutral-200'
            }`}
          >
            <Volume2 className="w-4 h-4 text-emerald-400" />
            <span>Dictado & Transcripción Mic</span>
          </button>
        </div>
      </div>

      {/* Tool 1: Real-time Oscilloscope & FFT Spectrum Analyzer */}
      {activeTool === 'spectrogram' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Main Visual Display */}
          <div className="lg:col-span-8 bg-neutral-950 border border-neutral-800 rounded-xl p-5 space-y-4">
            <div className="flex items-center justify-between border-b border-neutral-800/80 pb-3">
              <div className="flex items-center gap-2">
                <Activity className="w-4 h-4 text-amber-500" />
                <span className="text-xs font-mono uppercase tracking-wider text-neutral-200">
                  Osciloscopio Temporal & Espectro de Fourier (FFT)
                </span>
              </div>
              <span className="text-[11px] font-mono text-neutral-500">
                Frecuencia Fundamental: <strong className="text-amber-400">{oscillatorFreq} Hz</strong>
              </span>
            </div>

            {/* Twin Visualizer Canvases */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <span className="text-[10px] font-mono uppercase text-neutral-400 block">
                  Dominio Temporal (Onda Senoidal):
                </span>
                <div className="border border-neutral-800 rounded-lg overflow-hidden bg-[#0a0a0f] relative aspect-video flex items-center justify-center">
                  <canvas
                    ref={canvasOscRef}
                    width={400}
                    height={220}
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute bottom-2 left-2 text-[9px] font-mono text-neutral-500 bg-neutral-950/80 px-1.5 py-0.5 rounded">
                    35.2 Hz Resonancia Bóveda
                  </div>
                </div>
              </div>

              <div className="space-y-1.5">
                <span className="text-[10px] font-mono uppercase text-neutral-400 block">
                  Dominio Espectral (FFT Armónicos):
                </span>
                <div className="border border-neutral-800 rounded-lg overflow-hidden bg-[#0a0a0f] relative aspect-video flex items-center justify-center">
                  <canvas
                    ref={canvasFftRef}
                    width={400}
                    height={220}
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute bottom-2 left-2 text-[9px] font-mono text-neutral-500 bg-neutral-950/80 px-1.5 py-0.5 rounded">
                    Armónicos F0, F1, F2
                  </div>
                </div>
              </div>
            </div>

            {/* Oscillator Hardware Transport */}
            <div className="pt-2 border-t border-neutral-800/80 flex flex-wrap items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <button
                  onClick={toggleOscillator}
                  className={`flex items-center gap-2 px-4 py-2 text-xs font-mono uppercase font-semibold rounded-lg transition-colors shadow-sm ${
                    isPlayingOscillator
                      ? 'bg-rose-600 hover:bg-rose-500 text-white'
                      : 'bg-amber-500 hover:bg-amber-400 text-neutral-950'
                  }`}
                >
                  {isPlayingOscillator ? (
                    <>
                      <Pause className="w-3.5 h-3.5 fill-current" />
                      <span>Detener Tono (35.2 Hz)</span>
                    </>
                  ) : (
                    <>
                      <Play className="w-3.5 h-3.5 fill-current" />
                      <span>Activar Tono Resonante</span>
                    </>
                  )}
                </button>

                <div className="flex items-center gap-2 text-xs font-mono text-neutral-400">
                  <Volume2 className="w-4 h-4 text-neutral-500" />
                  <input
                    type="range"
                    min="0"
                    max="0.5"
                    step="0.02"
                    value={gainLevel}
                    onChange={(e) => {
                      const val = parseFloat(e.target.value);
                      setGainLevel(val);
                      if (gainNodeRef.current && audioCtxRef.current) {
                        gainNodeRef.current.gain.setTargetAtTime(val, audioCtxRef.current.currentTime, 0.05);
                      }
                    }}
                    className="w-24 accent-amber-500 cursor-pointer"
                  />
                  <span>{Math.round(gainLevel * 200)}%</span>
                </div>
              </div>

              {/* Harmonic Multiplier Shortcuts */}
              <div className="flex items-center gap-1.5">
                <span className="text-[10px] font-mono uppercase text-neutral-500 mr-1">Armónico:</span>
                {(['35.2', '70.4', '105.6', '140.8'] as const).map((h) => (
                  <button
                    key={h}
                    onClick={() => setHarmonicPreset(h)}
                    className={`px-2.5 py-1 text-[11px] font-mono rounded border transition-colors ${
                      activeHarmonicPreset === h
                        ? 'bg-amber-950/70 border-amber-600 text-amber-200 font-bold'
                        : 'bg-neutral-900 border-neutral-800 text-neutral-400 hover:text-neutral-200'
                    }`}
                  >
                    {h} Hz
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Right Column: Mathematical & Acoustic Metadata Card */}
          <div className="lg:col-span-4 bg-neutral-950 border border-neutral-800 rounded-xl p-5 space-y-4">
            <span className="text-xs font-mono uppercase tracking-wider text-neutral-300 flex items-center gap-1.5">
              <Sliders className="w-4 h-4 text-amber-500" />
              <span>Constantes Acústicas Modeladas</span>
            </span>

            <div className="space-y-3 text-xs font-mono">
              <div className="bg-neutral-900/60 p-3 rounded-lg border border-neutral-800 space-y-1">
                <span className="text-[10px] text-neutral-500 block">FRECUENCIA FUNDAMENTAL</span>
                <span className="text-amber-400 text-lg font-bold">{oscillatorFreq} Hz</span>
                <p className="text-[11px] text-neutral-400 font-sans mt-0.5">
                  Longitud de onda en aire seco a 18°C: ~9.74 metros. Corresponde a la diagonal modal de la bóveda subterránea.
                </p>
              </div>

              <div className="bg-neutral-900/60 p-3 rounded-lg border border-neutral-800 space-y-1">
                <span className="text-[10px] text-neutral-500 block">COEFICIENTE DE AMORTIGUAMIENTO (Q)</span>
                <span className="text-cyan-400 text-sm font-semibold">Q = 24.8 (Aceite Mineral #4)</span>
                <p className="text-[11px] text-neutral-400 font-sans mt-0.5">
                  Atenuación crítica alcanzada tras 3.2 periodos oscilatorios en el péndulo del Aparato A.
                </p>
              </div>

              <div className="p-3 bg-amber-950/20 border border-amber-900/50 rounded-lg text-[11px] text-amber-200/90 font-sans leading-relaxed">
                <strong>Salvaguarda SFI:</strong> Las mediciones son simulaciones sintéticas con propósito didáctico y creativo. Portan clasificación permanente <span className="font-mono text-amber-400">DEMO_SYNTHETIC</span>.
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Tool 1B: Multi-Channel Music Studio & Song Editing DAW Console */}
      {activeTool === 'daw_mixer' && (() => {
        const activeCh = channels.find((c) => c.id === selectedChannelId) || channels[0];
        const INSTRUMENTS = [
          'Oscilador Senoidal Puro',
          'Violonchelo Sub-Grave',
          'Trompa de Latón 1934',
          'Tubos de Vacío & Relé',
          'Piano Preparado Sordo',
          'Péndulo Electromagnético',
        ];
        const WAVE_BY_INST: Record<string, OscillatorType> = {
          'Oscilador Senoidal Puro': 'sine',
          'Violonchelo Sub-Grave': 'sawtooth',
          'Trompa de Latón 1934': 'triangle',
          'Tubos de Vacío & Relé': 'square',
          'Piano Preparado Sordo': 'triangle',
          'Péndulo Electromagnético': 'sine',
        };

        const stopMixAudition = () => {
          mixNodesRef.current.forEach((n) => {
            try {
              n.stop();
              n.disconnect();
            } catch {}
          });
          mixNodesRef.current = [];
          setIsAuditioningMix(false);
        };

        const toggleMixAudition = () => {
          if (isAuditioningMix) {
            stopMixAudition();
            return;
          }
          ensureAudioContext();
          const ctx = audioCtxRef.current;
          if (!ctx) return;

          const hasSolo = channels.some((c) => c.solo);
          const created: OscillatorNode[] = [];

          channels.forEach((ch) => {
            if (ch.muted || (hasSolo && !ch.solo)) return;
            const osc = ctx.createOscillator();
            const g = ctx.createGain();
            const panner = ctx.createStereoPanner();
            osc.type = WAVE_BY_INST[ch.instrument] || 'sine';
            osc.frequency.setValueAtTime(ch.frequencyHz, ctx.currentTime);
            g.gain.setValueAtTime(ch.gain * 0.12, ctx.currentTime);
            panner.pan.setValueAtTime(ch.pan, ctx.currentTime);
            osc.connect(g);
            g.connect(panner);
            panner.connect(ctx.destination);
            osc.start();
            created.push(osc);
          });

          mixNodesRef.current = created;
          setIsAuditioningMix(true);
        };

        const updateChannel = (id: string, patch: Partial<MusicChannelConfig>) => {
          setChannels((prev) => prev.map((c) => (c.id === id ? { ...c, ...patch } : c)));
        };

        const mixSummaryCue = channels
          .filter((c) => !c.muted)
          .map((c) => `${c.instrument} (${c.frequencyHz}Hz)`)
          .join(' + ');

        return (
          <div className="space-y-6">
            <div className="bg-neutral-950 border border-neutral-800 rounded-xl p-6 space-y-5">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-neutral-800 pb-4">
                <div>
                  <span className="text-xs font-mono uppercase text-emerald-400 font-semibold block">
                    CONSOLA DE PRODUCCIÓN MUSICAL MULTICANAL · FREQUENCY LAYER
                  </span>
                  <h3 className="text-base font-serif font-bold text-neutral-100">
                    Selección de Canal, Instrumento, Frecuencia Hz y Mezcla para Lyria 3
                  </h3>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={toggleMixAudition}
                    className={`flex items-center gap-1.5 px-3.5 py-2 rounded-lg font-mono text-xs uppercase font-semibold transition-colors ${
                      isAuditioningMix
                        ? 'bg-rose-600 hover:bg-rose-500 text-white'
                        : 'bg-emerald-500 hover:bg-emerald-400 text-neutral-950'
                    }`}
                  >
                    {isAuditioningMix ? <Pause className="w-3.5 h-3.5" /> : <Play className="w-3.5 h-3.5" />}
                    <span>{isAuditioningMix ? 'Detener Mezcla' : 'Audicionar Mezcla WebAudio'}</span>
                  </button>
                  {onAssignAudioCue && (
                    <button
                      onClick={() => onAssignAudioCue(`DAW Mix [DEMO_SYNTHETIC]: ${mixSummaryCue}`)}
                      className="px-3 py-2 bg-neutral-900 hover:bg-neutral-800 border border-amber-700/70 text-amber-300 font-mono text-xs uppercase rounded-lg"
                    >
                      Asignar Mezcla a Escenas
                    </button>
                  )}
                </div>
              </div>

              {/* Channel Strip Selector Grid */}
              <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
                {channels.map((ch) => {
                  const isSel = ch.id === activeCh.id;
                  return (
                    <div
                      key={ch.id}
                      onClick={() => setSelectedChannelId(ch.id)}
                      className={`p-4 rounded-xl border cursor-pointer transition-all space-y-3 ${
                        isSel
                          ? 'bg-neutral-900 border-amber-500 ring-1 ring-amber-500/30'
                          : 'bg-neutral-900/40 border-neutral-800 hover:border-neutral-700'
                      }`}
                    >
                      <div className="flex items-center justify-between text-[11px] font-mono">
                        <span className="text-amber-400 font-bold">{ch.name}</span>
                        <div className="flex gap-1">
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              updateChannel(ch.id, { muted: !ch.muted });
                            }}
                            className={`px-1.5 py-0.5 rounded text-[10px] border ${
                              ch.muted
                                ? 'bg-rose-950 border-rose-600 text-rose-300'
                                : 'bg-neutral-950 border-neutral-700 text-neutral-400'
                            }`}
                          >
                            M
                          </button>
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              updateChannel(ch.id, { solo: !ch.solo });
                            }}
                            className={`px-1.5 py-0.5 rounded text-[10px] border ${
                              ch.solo
                                ? 'bg-amber-950 border-amber-500 text-amber-300'
                                : 'bg-neutral-950 border-neutral-700 text-neutral-400'
                            }`}
                          >
                            S
                          </button>
                        </div>
                      </div>

                      <div className="text-xs text-neutral-200 font-sans font-medium truncate">
                        {ch.instrument}
                      </div>

                      <div className="flex items-center justify-between text-[11px] font-mono tabular-nums text-cyan-400">
                        <span>{ch.frequencyHz} Hz</span>
                        <span>Gain {Math.round(ch.gain * 100)}%</span>
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Active Channel Inspector */}
              <div className="bg-neutral-900/50 border border-neutral-800 rounded-xl p-5 grid grid-cols-1 md:grid-cols-4 gap-4 text-xs font-mono">
                <div>
                  <label className="text-[10px] uppercase text-neutral-400 block mb-1">
                    Instrumento del {activeCh.name}
                  </label>
                  <select
                    value={activeCh.instrument}
                    onChange={(e) => updateChannel(activeCh.id, { instrument: e.target.value })}
                    className="w-full bg-neutral-950 border border-neutral-800 rounded px-3 py-2 text-neutral-100"
                  >
                    {INSTRUMENTS.map((inst) => (
                      <option key={inst} value={inst}>
                        {inst}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="text-[10px] uppercase text-neutral-400 block mb-1">
                    Frecuencia Central ({activeCh.frequencyHz} Hz)
                  </label>
                  <input
                    type="range"
                    min={17.6}
                    max={440}
                    step={0.4}
                    value={activeCh.frequencyHz}
                    onChange={(e) =>
                      updateChannel(activeCh.id, { frequencyHz: Number(e.target.value) })
                    }
                    className="w-full accent-cyan-500 mt-2"
                  />
                </div>

                <div>
                  <label className="text-[10px] uppercase text-neutral-400 block mb-1">
                    Ganancia de Canal ({Math.round(activeCh.gain * 100)}%)
                  </label>
                  <input
                    type="range"
                    min={0}
                    max={1}
                    step={0.05}
                    value={activeCh.gain}
                    onChange={(e) => updateChannel(activeCh.id, { gain: Number(e.target.value) })}
                    className="w-full accent-amber-500 mt-2"
                  />
                </div>

                <div>
                  <label className="text-[10px] uppercase text-neutral-400 block mb-1">
                    Paneo Estéreo ({activeCh.pan === 0 ? 'Centro' : activeCh.pan < 0 ? `L ${Math.abs(activeCh.pan)}` : `R ${activeCh.pan}`})
                  </label>
                  <input
                    type="range"
                    min={-1}
                    max={1}
                    step={0.1}
                    value={activeCh.pan}
                    onChange={(e) => updateChannel(activeCh.id, { pan: Number(e.target.value) })}
                    className="w-full accent-purple-500 mt-2"
                  />
                </div>
              </div>
            </div>

            {/* Integrated Lyria 3 Studio below DAW mixer */}
            <MusicStudioLyria onAssignAudioCue={onAssignAudioCue} />
          </div>
        );
      })()}

      {/* Tool 2: Interactive WAV Slicer & Phrase Segmenter */}
      {activeTool === 'slicer' && (
        <div className="bg-neutral-950 border border-neutral-800 rounded-xl p-6 space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-neutral-800 pb-4">
            <div>
              <div className="flex items-center gap-2">
                <Scissors className="w-4 h-4 text-cyan-400" />
                <h3 className="text-base font-serif font-medium text-neutral-100">
                  Segmentación de WAVs: Partes, Frases & Puntos de Sincronía
                </h3>
              </div>
              <p className="text-xs text-neutral-400 mt-1 font-sans">
                Segmenta pistas de audio en frases orales y eventos armónicos con marcadores de inicio/fin y puntos de corte.
              </p>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={() => setIsPlayingSlices(!isPlayingSlices)}
                className="flex items-center gap-1.5 px-3 py-1.5 bg-neutral-900 hover:bg-neutral-800 text-neutral-200 border border-neutral-700 text-xs font-mono uppercase rounded transition-colors"
              >
                {isPlayingSlices ? <Pause className="w-3.5 h-3.5 text-amber-400" /> : <Play className="w-3.5 h-3.5 text-emerald-400" />}
                <span>{isPlayingSlices ? 'Pausar Playhead' : 'Reproducir Slices'}</span>
              </button>

              <button
                onClick={handleAddNewSlice}
                className="flex items-center gap-1.5 px-3 py-1.5 bg-cyan-600 hover:bg-cyan-500 text-neutral-950 font-mono text-xs uppercase font-semibold rounded transition-colors"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Añadir Frase / Slice</span>
              </button>
            </div>
          </div>

          {/* Interactive Multi-segment Timeline Rail */}
          <div className="space-y-2">
            <div className="flex justify-between text-[11px] font-mono text-neutral-400">
              <span>Línea de Tiempo WAV (0.0s - 18.0s)</span>
              <span className="text-amber-400">Playhead: {playheadTime.toFixed(1)}s</span>
            </div>

            {/* Visual Waveform track with segments */}
            <div className="relative w-full h-16 bg-[#0c0c12] rounded-lg border border-neutral-800 overflow-hidden flex select-none">
              {/* Synthetic visual audio wave peaks */}
              <div className="absolute inset-0 flex items-center justify-around opacity-20 pointer-events-none px-2">
                {[...Array(60)].map((_, i) => (
                  <div
                    key={i}
                    className="w-1 bg-cyan-400 rounded-full"
                    style={{ height: `${Math.sin(i * 0.4) * 22 + 26}px` }}
                  />
                ))}
              </div>

              {/* Segment blocks */}
              {slices.map((slice) => {
                const totalDur = 18.0;
                const widthPct = ((slice.endTime - slice.startTime) / totalDur) * 100;
                const isSelected = slice.id === selectedSliceId;

                return (
                  <div
                    key={slice.id}
                    onClick={() => {
                      setSelectedSliceId(slice.id);
                      setPlayheadTime(slice.startTime);
                    }}
                    style={{ width: `${widthPct}%` }}
                    className={`h-full border-r border-neutral-700/80 p-2 flex flex-col justify-between cursor-pointer transition-all relative ${
                      isSelected
                        ? 'bg-cyan-950/40 border-b-2 border-b-cyan-400'
                        : 'bg-neutral-900/40 hover:bg-neutral-900/80'
                    }`}
                  >
                    <div className="flex items-center justify-between text-[10px] font-mono">
                      <span className="font-semibold text-neutral-200 truncate">{slice.name.split(':')[0]}</span>
                      <span className="text-neutral-400 text-[9px]">{(slice.endTime - slice.startTime).toFixed(1)}s</span>
                    </div>

                    <p className="text-[10px] font-serif italic text-neutral-400 truncate">
                      «{slice.phraseText}»
                    </p>
                  </div>
                );
              })}

              {/* Scrubber Playhead */}
              <div
                className="absolute top-0 bottom-0 w-0.5 bg-amber-400 pointer-events-none shadow-[0_0_10px_rgba(251,191,36,0.9)]"
                style={{ left: `${(playheadTime / 18.0) * 100}%` }}
              />
            </div>
          </div>

          {/* Selected Slice Inspector & Phrase Editor */}
          {selectedSlice && (
            <div className="bg-neutral-900/40 border border-neutral-800 rounded-lg p-5 space-y-4">
              <div className="flex items-center justify-between border-b border-neutral-800/80 pb-3">
                <span className="text-xs font-mono uppercase text-cyan-400 font-semibold flex items-center gap-1.5">
                  <Scissors className="w-3.5 h-3.5" />
                  <span>Editor de la Frase: {selectedSlice.name}</span>
                </span>

                <button
                  onClick={() => handleDeleteSlice(selectedSlice.id)}
                  disabled={slices.length <= 1}
                  className="flex items-center gap-1 text-[11px] font-mono text-neutral-500 hover:text-rose-400 disabled:opacity-30 transition-colors"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  <span>Eliminar Slice</span>
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs font-mono">
                <div>
                  <label className="text-neutral-400 uppercase text-[10px] block mb-1">Nombre / Identificador</label>
                  <input
                    type="text"
                    value={selectedSlice.name}
                    onChange={(e) => handleUpdateCurrentSlice('name', e.target.value)}
                    className="w-full bg-neutral-950 border border-neutral-800 rounded px-3 py-2 text-neutral-100"
                  />
                </div>

                <div>
                  <label className="text-neutral-400 uppercase text-[10px] block mb-1">Inicio (segundos)</label>
                  <input
                    type="number"
                    step="0.1"
                    value={selectedSlice.startTime}
                    onChange={(e) => handleUpdateCurrentSlice('startTime', parseFloat(e.target.value) || 0)}
                    className="w-full bg-neutral-950 border border-neutral-800 rounded px-3 py-2 text-neutral-100"
                  />
                </div>

                <div>
                  <label className="text-neutral-400 uppercase text-[10px] block mb-1">Fin (segundos)</label>
                  <input
                    type="number"
                    step="0.1"
                    value={selectedSlice.endTime}
                    onChange={(e) => handleUpdateCurrentSlice('endTime', parseFloat(e.target.value) || 0)}
                    className="w-full bg-neutral-950 border border-neutral-800 rounded px-3 py-2 text-neutral-100"
                  />
                </div>
              </div>

              <div>
                <label className="text-neutral-400 uppercase text-[10px] font-mono block mb-1">
                  Texto de la Frase / Locución Transcripta:
                </label>
                <textarea
                  rows={2}
                  value={selectedSlice.phraseText}
                  onChange={(e) => handleUpdateCurrentSlice('phraseText', e.target.value)}
                  className="w-full bg-neutral-950 border border-neutral-800 rounded p-3 text-xs text-neutral-100 font-serif leading-relaxed focus:outline-none focus:border-cyan-500"
                />
              </div>

              <div className="flex items-center justify-between pt-2">
                <span className="text-[11px] font-mono text-neutral-400">
                  Armónico Asociado: <strong className="text-amber-400">{selectedSlice.harmonicNote}</strong>
                </span>

                <div className="flex items-center gap-2">
                  <span className="text-[10px] font-mono text-neutral-500 uppercase">
                    Procedencia: DEMO_SYNTHETIC
                  </span>
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Tool 3: Lyria 3 Generative Music Engine */}
      {activeTool === 'lyria_engine' && (
        <MusicStudioLyria onAssignAudioCue={onAssignAudioCue} />
      )}

      {/* Tool 4: Audio Dictation with Microphone & Gemini 3.5 Transcribe */}
      {activeTool === 'dictation' && (
        <div className="space-y-4">
          <AudioTranscriberMic
            targetLabel="Frase Activa del WAV"
            onInsertTranscript={(transcriptText) => {
              handleUpdateCurrentSlice('phraseText', transcriptText);
              setActiveTool('slicer');
            }}
          />
        </div>
      )}
    </div>
  );
};
