/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * 
 * MÓDULO 4: LABORATORIO AUDIOVISUAL
 * Espacio para convertir investigaciones en guiones, organizar planos y duraciones,
 * sincronizar audio (con generador de frecuencia Web Audio 35.2 Hz local),
 * preparar subtítulos, adaptar formato horizontal/vertical, generar directivas
 * para renderizadores externos y visualizar el estado de recepción FAD de SFI.
 * FAD pertenece a SFI: hasReceivedFadData es false hasta recepción canónica real.
 */

import React, { useState, useEffect, useRef } from 'react';
import {
  AudiovisualScene,
  FadRecommendationViewer,
  VisualAssetProposal,
  AudioWaveformSegment,
} from '../types';
import { MusicStudioLyria } from './MusicStudioLyria';
import { VideoStudioOmniFlash } from './VideoStudioOmniFlash';
import { AudioTranscriberMic } from './AudioTranscriberMic';
import { AudioWaveformSegmenter } from './AudioWaveformSegmenter';
import { ImageStudioNanoBanana } from './ImageStudioNanoBanana';
import { 
  Film, 
  Play, 
  Pause, 
  Volume2, 
  VolumeX, 
  Smartphone, 
  Monitor, 
  ShieldAlert, 
  Copy, 
  Check, 
  Layers,
  Music,
  Video,
  AudioWaveform,
  Image as ImageIcon,
  Clapperboard
} from 'lucide-react';

interface ModuleAudiovisualLabProps {
  scenes: AudiovisualScene[];
  fadData: FadRecommendationViewer;
  proposals?: VisualAssetProposal[];
  audioSegments?: AudioWaveformSegment[];
  onUpdateScenes: (scenes: AudiovisualScene[]) => void;
  onUpdateAudioSegments?: (segments: AudioWaveformSegment[]) => void;
  onAddProposal?: (proposal: VisualAssetProposal) => void;
}

export const ModuleAudiovisualLab: React.FC<ModuleAudiovisualLabProps> = ({
  scenes,
  fadData,
  proposals = [],
  audioSegments = [],
  onUpdateScenes,
  onUpdateAudioSegments,
  onAddProposal,
}) => {
  const [activeSceneIndex, setActiveSceneIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [isMuted, setIsMuted] = useState(false);
  const [aspectMode, setAspectMode] = useState<'16:9' | '9:16'>('16:9');
  const [activeSubTab, setActiveSubTab] = useState<'script' | 'audio_waveform' | 'video_editor' | 'music_lyria' | 'video_omni' | 'subtitles' | 'render_spec' | 'fad_advisory'>('script');
  const [copiedText, setCopiedText] = useState(false);
  const [cueNotice, setCueNotice] = useState<string | null>(null);
  const [localSegments, setLocalSegments] = useState<AudioWaveformSegment[]>(audioSegments);
  const [videoEditorCreateTool, setVideoEditorCreateTool] = useState<'video' | 'image' | 'music'>('video');
  const [attachedSongLabel, setAttachedSongLabel] = useState<string>(
    scenes[0]?.authorizedAudioCue || 'Lyria 3 · 35.2 Hz Resonancia Subterránea'
  );
  const [attachedImageId, setAttachedImageId] = useState<string>(proposals[0]?.id || '');

  const effectiveSegments = onUpdateAudioSegments ? audioSegments : localSegments;
  const handleSegmentsChange = (nextSegments: AudioWaveformSegment[]) => {
    if (onUpdateAudioSegments) {
      onUpdateAudioSegments(nextSegments);
    } else {
      setLocalSegments(nextSegments);
    }
  };

  // Web Audio Context for synthesized 35.2 Hz resonance tone
  const audioContextRef = useRef<AudioContext | null>(null);
  const oscillatorRef = useRef<OscillatorNode | null>(null);
  const gainNodeRef = useRef<GainNode | null>(null);

  const totalDuration = scenes.reduce((acc, s) => acc + s.durationSeconds, 0);
  const currentScene = scenes[activeSceneIndex] || scenes[0];

  useEffect(() => {
    let accumulated = 0;
    for (let i = 0; i < scenes.length; i++) {
      accumulated += scenes[i].durationSeconds;
      if (currentTime <= accumulated) {
        setActiveSceneIndex(i);
        break;
      }
    }
  }, [currentTime, scenes]);

  useEffect(() => {
    if (isPlaying) {
      try {
        const AudioCtx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
        if (!audioContextRef.current) {
          audioContextRef.current = new AudioCtx();
        }
        if (audioContextRef.current.state === 'suspended') {
          audioContextRef.current.resume();
        }

        const ctx = audioContextRef.current;
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();

        // 35.2 Hz local procedural sine tone
        osc.type = 'sine';
        osc.frequency.setValueAtTime(35.2, ctx.currentTime);

        gain.gain.setValueAtTime(isMuted ? 0 : 0.15, ctx.currentTime);

        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start();

        oscillatorRef.current = osc;
        gainNodeRef.current = gain;
      } catch (err) {
        console.warn('Web Audio initialized passively:', err);
      }
    } else {
      if (oscillatorRef.current) {
        try {
          oscillatorRef.current.stop();
          oscillatorRef.current.disconnect();
        } catch {
          // Cleaned up
        }
        oscillatorRef.current = null;
      }
    }

    return () => {
      if (oscillatorRef.current) {
        try {
          oscillatorRef.current.stop();
          oscillatorRef.current.disconnect();
        } catch {
          // Cleaned up
        }
        oscillatorRef.current = null;
      }
    };
  }, [isPlaying, isMuted]);

  useEffect(() => {
    let timer: number | null = null;
    if (isPlaying) {
      timer = window.setInterval(() => {
        setCurrentTime((prev) => {
          if (prev >= totalDuration) {
            setIsPlaying(false);
            return 0;
          }
          return Math.round((prev + 0.1) * 10) / 10;
        });
      }, 100);
    }
    return () => {
      if (timer) clearInterval(timer);
    };
  }, [isPlaying, totalDuration]);

  const togglePlay = () => {
    setIsPlaying(!isPlaying);
  };

  const handleSeek = (time: number) => {
    setCurrentTime(time);
  };

  const generateSrt = () => {
    let srt = '';
    let accumulated = 0;
    scenes.forEach((scene, idx) => {
      const start = accumulated;
      const end = accumulated + scene.durationSeconds;
      accumulated = end;

      const formatTime = (secs: number) => {
        const m = Math.floor(secs / 60);
        const s = Math.floor(secs % 60);
        const ms = Math.floor((secs % 1) * 1000);
        return `00:${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')},${ms.toString().padStart(3, '0')}`;
      };

      srt += `${idx + 1}\n${formatTime(start)} --> ${formatTime(end)}\n[DEMO] ${scene.subtitleText}\n\n`;
    });
    return srt;
  };

  const copySubtitles = () => {
    navigator.clipboard.writeText(generateSrt());
    setCopiedText(true);
    setTimeout(() => setCopiedText(false), 2000);
  };

  const handleInsertVoiceover = (text: string) => {
    const updated = scenes.map((s, idx) => {
      if (idx === activeSceneIndex) {
        return {
          ...s,
          audioVoiceover: text,
          subtitleText: text,
        };
      }
      return s;
    });
    onUpdateScenes(updated);
    setCueNotice(`¡Locución insertada en Escena ${scenes[activeSceneIndex].sceneNumber}!`);
    setTimeout(() => setCueNotice(null), 3500);
  };

  const handleAssignAudioCue = (cue: string) => {
    const updated = scenes.map((s, idx) => {
      if (idx === activeSceneIndex) {
        return {
          ...s,
          authorizedAudioCue: cue,
        };
      }
      return s;
    });
    onUpdateScenes(updated);
    setCueNotice(`Pista Lyria asignada a Escena ${scenes[activeSceneIndex].sceneNumber}`);
    setTimeout(() => setCueNotice(null), 3500);
  };

  const handleBindVideo = (videoUrl: string, promptText: string) => {
    const updated = scenes.map((s, idx) => {
      if (idx === activeSceneIndex) {
        return {
          ...s,
          visualDescription: `Video generado con gemini-omni-1.2-flash: "${promptText.slice(0, 80)}..."`,
          externalRenderInstructions: {
            ...s.externalRenderInstructions,
            promptText,
          },
        };
      }
      return s;
    });
    onUpdateScenes(updated);
    setCueNotice(`Video Omni Flash vinculado a Escena ${scenes[activeSceneIndex].sceneNumber}`);
    setTimeout(() => setCueNotice(null), 3500);
  };

  return (
    <div className="space-y-8 max-w-6xl mx-auto py-6">
      {/* Module Title */}
      <div className="border-b border-neutral-800 pb-6 flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <span className="text-xs font-mono uppercase tracking-widest text-emerald-400 block mb-1 font-semibold">
            MULTIMEDIA LAYER (VIDEO) · OBSERVATORIO CINEMATOGRÁFICO & OMNI FLASH
          </span>
          <h1 className="text-2xl md:text-3xl font-serif font-bold text-neutral-100">
            Guionización Técnica, Video Omni Flash & Sincronización Temporal
          </h1>
          <p className="text-sm text-neutral-400 mt-1 max-w-3xl">
            Convierte investigaciones en guiones técnicos didácticos, genera video con <strong className="text-emerald-300 font-mono">gemini-omni-1.2-flash</strong> (Interactions API), adapta relaciones de aspecto 16:9 / 9:16 y sincroniza audio de laboratorio.
            <strong className="text-neutral-200"> Todos los planos son clasificados como DEMO_SYNTHETIC. FAD pertenece a SFI y hasReceivedFadData es false.</strong>
          </p>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <div className="flex items-center gap-1 p-1 bg-neutral-900 border border-neutral-800 rounded-lg">
            <button
              onClick={() => setAspectMode('16:9')}
              className={`flex items-center gap-1 px-3 py-1.5 text-xs font-mono uppercase rounded transition-colors ${
                aspectMode === '16:9'
                  ? 'bg-neutral-800 text-neutral-100 font-semibold'
                  : 'text-neutral-500 hover:text-neutral-300'
              }`}
            >
              <Monitor className="w-3.5 h-3.5" />
              <span>16:9</span>
            </button>
            <button
              onClick={() => setAspectMode('9:16')}
              className={`flex items-center gap-1 px-3 py-1.5 text-xs font-mono uppercase rounded transition-colors ${
                aspectMode === '9:16'
                  ? 'bg-neutral-800 text-neutral-100 font-semibold'
                  : 'text-neutral-500 hover:text-neutral-300'
              }`}
            >
              <Smartphone className="w-3.5 h-3.5" />
              <span>9:16</span>
            </button>
          </div>
        </div>
      </div>

      {cueNotice && (
        <div className="p-3 bg-emerald-950/50 border border-emerald-800/80 rounded-lg text-xs text-emerald-200 flex items-center gap-2">
          <Check className="w-4 h-4 text-emerald-400 shrink-0" />
          <span>{cueNotice}</span>
        </div>
      )}

      {/* Synchronized Player & Waveform Timeline */}
      <div className="bg-neutral-900/40 border border-neutral-800 rounded-lg p-6 space-y-6">
        {/* Visual Monitor Viewport */}
        <div className="flex flex-col lg:flex-row items-center gap-6 justify-center">
          <div
            className={`relative bg-neutral-950 rounded-lg overflow-hidden border border-neutral-800 flex items-center justify-center transition-all ${
              aspectMode === '16:9'
                ? 'w-full max-w-2xl aspect-video'
                : 'w-64 aspect-[9/16]'
            }`}
          >
            {/* Epistemic synthetic watermark */}
            <div className="absolute top-3 left-3 bg-neutral-950/90 border border-amber-800 px-2 py-0.5 rounded text-[10px] font-mono text-amber-400">
              ESCENA DEMO_SYNTHETIC
            </div>

            {/* Visual simulation overlay */}
            <div className="absolute inset-0 bg-gradient-to-t from-neutral-950 via-neutral-950/20 to-transparent flex flex-col justify-end p-5">
              <span className="text-[10px] font-mono uppercase tracking-widest text-amber-500 bg-neutral-950/80 px-2 py-0.5 rounded w-max border border-amber-900/50 mb-2">
                ESCENA {currentScene.sceneNumber} · PLANO {currentScene.shotNumber} ({currentScene.shotType})
              </span>
              <p className="text-sm font-serif text-neutral-200 leading-snug">
                «{currentScene.subtitleText}»
              </p>
              <span className="text-[11px] font-mono text-neutral-500 mt-1">
                Audio cue: {currentScene.authorizedAudioCue}
              </span>
            </div>

            {/* Visualizer wave pulses */}
            <div className="flex items-center gap-1 opacity-25">
              {[...Array(24)].map((_, i) => (
                <div
                  key={i}
                  className="w-1 bg-amber-400 rounded-full transition-all duration-150"
                  style={{
                    height: isPlaying ? `${Math.sin((currentTime * 4) + i) * 20 + 28}px` : '10px',
                  }}
                />
              ))}
            </div>

            {/* Timecode Badge */}
            <div className="absolute top-3 right-3 bg-neutral-950/90 border border-neutral-800 font-mono text-xs px-2.5 py-1 rounded text-neutral-300">
              {currentTime.toFixed(1)}s / {totalDuration.toFixed(1)}s
            </div>
          </div>
        </div>

        {/* Transport Controls Bar */}
        <div className="space-y-3 pt-2 border-t border-neutral-800">
          <div className="flex items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <button
                onClick={togglePlay}
                className="p-3 bg-amber-500 hover:bg-amber-400 text-neutral-950 rounded-full transition-colors"
                title={isPlaying ? 'Pausar' : 'Reproducir'}
              >
                {isPlaying ? <Pause className="w-4 h-4 fill-current" /> : <Play className="w-4 h-4 fill-current ml-0.5" />}
              </button>

              <button
                onClick={() => setIsMuted(!isMuted)}
                className="p-2 text-neutral-400 hover:text-neutral-200 border border-neutral-800 rounded transition-colors"
                title={isMuted ? 'Activar oscilador' : 'Silenciar'}
              >
                {isMuted ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4 text-amber-500" />}
              </button>

              <div className="text-xs font-mono text-neutral-400">
                <span>Oscilador Acústico Local: </span>
                <span className="text-amber-400 font-semibold">35.2 Hz senoidal (Síntesis Procedural)</span>
              </div>
            </div>

            <div className="text-xs font-mono text-neutral-500">
              Plano: <strong className="text-neutral-300">{currentScene.shotType}</strong> ({currentScene.durationSeconds}s)
            </div>
          </div>

          {/* Interactive Timeline Rail with Segmented Scenes */}
          <div className="space-y-1">
            <div className="relative w-full h-8 bg-neutral-950 rounded border border-neutral-800 overflow-hidden flex cursor-pointer">
              {scenes.map((sc, i) => {
                const widthPercent = (sc.durationSeconds / totalDuration) * 100;
                const isCurrent = i === activeSceneIndex;
                return (
                  <div
                    key={sc.id}
                    onClick={() => {
                      let acc = 0;
                      for (let j = 0; j < i; j++) acc += scenes[j].durationSeconds;
                      handleSeek(acc);
                    }}
                    style={{ width: `${widthPercent}%` }}
                    className={`h-full border-r border-neutral-800 p-1 flex items-center justify-between text-[10px] font-mono transition-colors ${
                      isCurrent
                        ? 'bg-amber-950/40 text-amber-200 font-semibold'
                        : 'bg-neutral-900/60 text-neutral-500 hover:bg-neutral-900'
                    }`}
                  >
                    <span className="truncate">T{sc.sceneNumber}.{sc.shotNumber}</span>
                    <span className="text-[9px] opacity-75">{sc.durationSeconds}s</span>
                  </div>
                );
              })}

              <div
                className="absolute top-0 bottom-0 w-0.5 bg-amber-400 pointer-events-none shadow-[0_0_8px_rgba(251,191,36,0.8)]"
                style={{ left: `${(currentTime / totalDuration) * 100}%` }}
              />
            </div>

            <div className="flex justify-between text-[10px] font-mono text-neutral-500">
              <span>00:00</span>
              <span>Línea temporal total: {totalDuration} segundos · Procedencia: DEMO_SYNTHETIC</span>
              <span>00:{totalDuration}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Audiovisual Tabs */}
      <div className="bg-neutral-900/40 border border-neutral-800 rounded-lg p-6 space-y-6">
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-neutral-800 pb-3">
          <div className="flex flex-wrap items-center gap-1">
            <button
              onClick={() => setActiveSubTab('script')}
              className={`px-3 py-1.5 text-xs font-medium rounded transition-colors ${
                activeSubTab === 'script'
                  ? 'bg-neutral-800 text-neutral-100 font-semibold'
                  : 'text-neutral-400 hover:text-neutral-200'
              }`}
            >
              Guión Técnico & Planos
            </button>
            <button
              onClick={() => setActiveSubTab('audio_waveform')}
              className={`flex items-center gap-1 px-3 py-1.5 text-xs font-medium rounded transition-colors ${
                activeSubTab === 'audio_waveform'
                  ? 'bg-cyan-950/70 text-cyan-200 border border-cyan-700/80 font-semibold'
                  : 'text-neutral-400 hover:text-neutral-200'
              }`}
            >
              <AudioWaveform className="w-3.5 h-3.5 text-cyan-400" />
              <span>Segmentador Waveform</span>
            </button>
            <button
              onClick={() => setActiveSubTab('video_editor')}
              className={`flex items-center gap-1 px-3 py-1.5 text-xs font-medium rounded transition-colors ${
                activeSubTab === 'video_editor'
                  ? 'bg-emerald-950/70 text-emerald-200 border border-emerald-700/80 font-semibold'
                  : 'text-neutral-400 hover:text-neutral-200'
              }`}
            >
              <Clapperboard className="w-3.5 h-3.5 text-emerald-400" />
              <span>Editor Video (Canción / Img / IA)</span>
            </button>
            <button
              onClick={() => setActiveSubTab('music_lyria')}
              className={`flex items-center gap-1 px-3 py-1.5 text-xs font-medium rounded transition-colors ${
                activeSubTab === 'music_lyria'
                  ? 'bg-amber-950/70 text-amber-200 border border-amber-800/80 font-semibold'
                  : 'text-neutral-400 hover:text-neutral-200'
              }`}
            >
              <Music className="w-3.5 h-3.5 text-amber-400" />
              <span>Banda Sonora (Lyria 3)</span>
            </button>
            <button
              onClick={() => setActiveSubTab('video_omni')}
              className={`flex items-center gap-1 px-3 py-1.5 text-xs font-medium rounded transition-colors ${
                activeSubTab === 'video_omni'
                  ? 'bg-emerald-950/70 text-emerald-300 border border-emerald-800/80 font-semibold'
                  : 'text-neutral-400 hover:text-neutral-200'
              }`}
            >
              <Video className="w-3.5 h-3.5 text-emerald-400" />
              <span>Video IA (Omni Flash)</span>
            </button>
            <button
              onClick={() => setActiveSubTab('subtitles')}
              className={`px-3 py-1.5 text-xs font-medium rounded transition-colors ${
                activeSubTab === 'subtitles'
                  ? 'bg-neutral-800 text-neutral-100 font-semibold'
                  : 'text-neutral-400 hover:text-neutral-200'
              }`}
            >
              Subtítulos (SRT / VTT)
            </button>
            <button
              onClick={() => setActiveSubTab('render_spec')}
              className={`px-3 py-1.5 text-xs font-medium rounded transition-colors ${
                activeSubTab === 'render_spec'
                  ? 'bg-neutral-800 text-neutral-100 font-semibold'
                  : 'text-neutral-400 hover:text-neutral-200'
              }`}
            >
              Instrucciones Render Externo
            </button>
            <button
              onClick={() => setActiveSubTab('fad_advisory')}
              className={`px-3 py-1.5 text-xs font-medium rounded transition-colors flex items-center gap-1.5 ${
                activeSubTab === 'fad_advisory'
                  ? 'bg-amber-950/60 text-amber-200 border border-amber-800/80 font-semibold'
                  : 'text-amber-500 hover:text-amber-400'
              }`}
            >
              <ShieldAlert className="w-3.5 h-3.5" />
              <span>Gobernanza FAD (SFI)</span>
            </button>
          </div>
        </div>

        {/* Tab 1: Script & Shot Breakdown Table */}
        {activeSubTab === 'script' && (
          <div className="space-y-4">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="border-b border-neutral-800 text-[11px] font-mono text-neutral-500 uppercase">
                    <th className="py-2.5 px-3">Escena / Plano</th>
                    <th className="py-2.5 px-3">Duración</th>
                    <th className="py-2.5 px-3">Descripción Visual</th>
                    <th className="py-2.5 px-3">Voz en Off / Locución</th>
                    <th className="py-2.5 px-3">Procedencia</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-neutral-900 text-neutral-300">
                  {scenes.map((sc, i) => (
                    <tr
                      key={sc.id}
                      onClick={() => setActiveSceneIndex(i)}
                      className={`hover:bg-neutral-800/40 cursor-pointer transition-colors ${
                        i === activeSceneIndex ? 'bg-neutral-800/60 font-medium text-neutral-100' : ''
                      }`}
                    >
                      <td className="py-3 px-3 font-mono text-amber-400 whitespace-nowrap">
                        T{sc.sceneNumber}.{sc.shotNumber} ({sc.shotType})
                      </td>
                      <td className="py-3 px-3 font-mono tabular-nums whitespace-nowrap">
                        {sc.durationSeconds} seg
                      </td>
                      <td className="py-3 px-3 max-w-xs leading-relaxed font-sans">
                        {sc.visualDescription}
                      </td>
                      <td className="py-3 px-3 max-w-xs font-serif italic text-neutral-300">
                        «{sc.audioVoiceover}»
                      </td>
                      <td className="py-3 px-3 text-[11px] text-amber-400/90 font-mono whitespace-nowrap">
                        {sc.provenance}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* In-Lab Audio Dictation with gemini-3.5-transcribe */}
            <div className="pt-2">
              <AudioTranscriberMic
                targetLabel={`Escena ${currentScene.sceneNumber}`}
                onInsertTranscript={handleInsertVoiceover}
              />
            </div>
          </div>
        )}

        {/* Tab: Audio Segmentation & Waveform Tool (DEMO_SYNTHETIC auto-tagged) */}
        {activeSubTab === 'audio_waveform' && (
          <AudioWaveformSegmenter
            scenes={scenes}
            segments={effectiveSegments}
            onSegmentsChange={handleSegmentsChange}
            onBindAnnotationToScene={(sceneId, annotation, audioFileName) => {
              const updated = scenes.map((sc) =>
                sc.id === sceneId
                  ? {
                      ...sc,
                      authorizedAudioCue: `${audioFileName} [DEMO_SYNTHETIC]`,
                      subtitleText: annotation,
                    }
                  : sc
              );
              onUpdateScenes(updated);
              setCueNotice(`Anotación de "${audioFileName}" vinculada a escena con sello DEMO_SYNTHETIC.`);
              setTimeout(() => setCueNotice(null), 3500);
            }}
          />
        )}

        {/* Tab: Unified Video Editor (Add Song, Add Image, Generate Video / Image / Song inline) */}
        {activeSubTab === 'video_editor' && (() => {
          const attachedImage = proposals.find((p) => p.id === attachedImageId) || proposals[0];
          return (
            <div className="space-y-6">
              {/* Top Multi-Track Montage Assembly Strip */}
              <div className="bg-neutral-950 border border-neutral-800 rounded-xl p-5 space-y-4">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 border-b border-neutral-800 pb-3">
                  <div>
                    <span className="text-xs font-mono uppercase text-emerald-400 font-semibold block">
                      EDITOR DE VIDEO UNIFICADO · MONTAJE MULTIPANTALLA
                    </span>
                    <h3 className="text-base font-serif font-bold text-neutral-100">
                      Añadir Canción, Añadir Imagen y Generar Video / Imagen / Música desde el Editor
                    </h3>
                  </div>
                  <span className="text-[11px] font-mono text-amber-400 bg-amber-950/40 border border-amber-800/70 px-2.5 py-1 rounded">
                    Escena Activa: T{currentScene.sceneNumber}.{currentScene.shotNumber} · DEMO_SYNTHETIC
                  </span>
                </div>

                {/* 3-Track Summary Cards: Video + Image + Song */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
                  {/* Track 1: Image Overlay Selector */}
                  <div className="bg-neutral-900/50 border border-neutral-800 rounded-lg p-3.5 space-y-2">
                    <span className="text-[10px] font-mono uppercase text-cyan-400 flex items-center gap-1.5">
                      <ImageIcon className="w-3.5 h-3.5" />
                      <span>Pista de Imagen Vinculada</span>
                    </span>
                    <select
                      value={attachedImageId}
                      onChange={(e) => setAttachedImageId(e.target.value)}
                      className="w-full bg-neutral-950 border border-neutral-800 rounded px-2.5 py-1.5 font-mono text-neutral-200"
                    >
                      {proposals.map((p) => (
                        <option key={p.id} value={p.id}>
                          {p.title}
                        </option>
                      ))}
                    </select>
                    {attachedImage && (
                      <div className="aspect-video rounded overflow-hidden border border-neutral-800 bg-neutral-950 relative">
                        <img
                          src={attachedImage.imageUrl}
                          alt={attachedImage.title}
                          className="w-full h-full object-cover"
                        />
                        <span className="absolute bottom-1 right-1 bg-neutral-950/90 text-[9px] font-mono text-amber-300 px-1.5 rounded">
                          DEMO_SYNTHETIC
                        </span>
                      </div>
                    )}
                  </div>

                  {/* Track 2: Song / Audio Track Selector */}
                  <div className="bg-neutral-900/50 border border-neutral-800 rounded-lg p-3.5 space-y-2">
                    <span className="text-[10px] font-mono uppercase text-amber-400 flex items-center gap-1.5">
                      <Music className="w-3.5 h-3.5" />
                      <span>Pista de Canción / Audio</span>
                    </span>
                    <input
                      type="text"
                      value={attachedSongLabel}
                      onChange={(e) => setAttachedSongLabel(e.target.value)}
                      className="w-full bg-neutral-950 border border-neutral-800 rounded px-2.5 py-1.5 font-mono text-neutral-200"
                    />
                    <button
                      onClick={() => handleAssignAudioCue(attachedSongLabel)}
                      className="w-full py-1.5 bg-amber-500 hover:bg-amber-400 text-neutral-950 font-mono text-[11px] uppercase font-bold rounded transition-colors"
                    >
                      Sincronizar Canción con Escena {currentScene.sceneNumber}
                    </button>
                    <p className="text-[11px] text-neutral-400 font-sans">
                      Cue actual: <strong className="text-neutral-200">{currentScene.authorizedAudioCue}</strong>
                    </p>
                  </div>

                  {/* Track 3: Inline AI Generator Switcher */}
                  <div className="bg-neutral-900/50 border border-neutral-800 rounded-lg p-3.5 space-y-2">
                    <span className="text-[10px] font-mono uppercase text-emerald-400 flex items-center gap-1.5">
                      <Layers className="w-3.5 h-3.5" />
                      <span>Generar Activo Directo desde Video Editor</span>
                    </span>
                    <div className="flex flex-col gap-1.5">
                      <button
                        onClick={() => setVideoEditorCreateTool('video')}
                        className={`flex items-center gap-2 px-3 py-1.5 rounded text-xs font-mono border transition-colors ${
                          videoEditorCreateTool === 'video'
                            ? 'bg-emerald-950/70 border-emerald-500 text-emerald-200 font-semibold'
                            : 'bg-neutral-950 border-neutral-800 text-neutral-400 hover:text-neutral-200'
                        }`}
                      >
                        <Video className="w-3.5 h-3.5 text-emerald-400" />
                        <span>Generar Video (Omni Flash)</span>
                      </button>
                      <button
                        onClick={() => setVideoEditorCreateTool('image')}
                        className={`flex items-center gap-2 px-3 py-1.5 rounded text-xs font-mono border transition-colors ${
                          videoEditorCreateTool === 'image'
                            ? 'bg-cyan-950/70 border-cyan-500 text-cyan-200 font-semibold'
                            : 'bg-neutral-950 border-neutral-800 text-neutral-400 hover:text-neutral-200'
                        }`}
                      >
                        <ImageIcon className="w-3.5 h-3.5 text-cyan-400" />
                        <span>Generar Imagen (Banana 2.1)</span>
                      </button>
                      <button
                        onClick={() => setVideoEditorCreateTool('music')}
                        className={`flex items-center gap-2 px-3 py-1.5 rounded text-xs font-mono border transition-colors ${
                          videoEditorCreateTool === 'music'
                            ? 'bg-amber-950/70 border-amber-500 text-amber-200 font-semibold'
                            : 'bg-neutral-950 border-neutral-800 text-neutral-400 hover:text-neutral-200'
                        }`}
                      >
                        <Music className="w-3.5 h-3.5 text-amber-400" />
                        <span>Generar Canción (Lyria 3)</span>
                      </button>
                    </div>
                  </div>
                </div>
              </div>

              {/* Active Inline AI Workbench */}
              {videoEditorCreateTool === 'video' && (
                <VideoStudioOmniFlash
                  proposals={proposals}
                  onBindVideoToScene={handleBindVideo}
                />
              )}
              {videoEditorCreateTool === 'image' && (
                <ImageStudioNanoBanana
                  currentProposals={proposals}
                  onAddProposal={(newProp) => {
                    if (onAddProposal) onAddProposal(newProp);
                    setAttachedImageId(newProp.id);
                    setCueNotice(`Imagen "${newProp.title}" generada y añadida al Video Editor (DEMO_SYNTHETIC).`);
                    setTimeout(() => setCueNotice(null), 3500);
                  }}
                />
              )}
              {videoEditorCreateTool === 'music' && (
                <MusicStudioLyria
                  onAssignAudioCue={(cue) => {
                    setAttachedSongLabel(cue);
                    handleAssignAudioCue(cue);
                  }}
                />
              )}
            </div>
          );
        })()}

        {/* Tab: Music Generation with Lyria 3 */}
        {activeSubTab === 'music_lyria' && (
          <MusicStudioLyria onAssignAudioCue={handleAssignAudioCue} />
        )}

        {/* Tab: Video Generation & Animation with Omni Flash */}
        {activeSubTab === 'video_omni' && (
          <VideoStudioOmniFlash
            proposals={proposals}
            onBindVideoToScene={handleBindVideo}
          />
        )}

        {/* Tab 2: Subtitle SRT Viewer */}
        {activeSubTab === 'subtitles' && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-xs font-mono text-neutral-400">
                Pista de Subtítulos con marcas de [DEMO] (Formato SubRip .SRT)
              </span>
              <button
                onClick={copySubtitles}
                className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-mono uppercase bg-neutral-800 hover:bg-neutral-700 text-neutral-200 rounded transition-colors"
              >
                {copiedText ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                <span>{copiedText ? 'Copiado' : 'Copiar SRT'}</span>
              </button>
            </div>

            <pre className="bg-neutral-950 border border-neutral-800 rounded p-4 text-xs font-mono text-neutral-300 overflow-x-auto leading-relaxed max-h-72">
              {generateSrt()}
            </pre>
          </div>
        )}

        {/* Tab 3: External Video Render Instructions */}
        {activeSubTab === 'render_spec' && (
          <div className="space-y-4 text-xs">
            <div className="bg-neutral-950/80 border border-neutral-800 rounded p-4 space-y-3">
              <span className="text-xs font-mono uppercase tracking-wider text-amber-400 block">
                Directivas Técnicas de Render Sintético (Plano {currentScene.shotNumber})
              </span>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-neutral-300 font-mono">
                <div>
                  <span className="text-neutral-500 uppercase block text-[10px]">Movimiento de Cámara:</span>
                  <span>{currentScene.externalRenderInstructions.cameraMotion}</span>
                </div>
                <div>
                  <span className="text-neutral-500 uppercase block text-[10px]">LUT / Color Grading:</span>
                  <span>{currentScene.externalRenderInstructions.colorGradeLUT}</span>
                </div>
                <div>
                  <span className="text-neutral-500 uppercase block text-[10px]">Tasa de Bits Objetivo:</span>
                  <span>{currentScene.externalRenderInstructions.targetBitrate}</span>
                </div>
                <div>
                  <span className="text-neutral-500 uppercase block text-[10px]">Marca de Agua Exigida:</span>
                  <span className="text-amber-400">[DEMOSTRACIÓN / DEMO_SYNTHETIC]</span>
                </div>
              </div>
            </div>

            <div>
              <label className="text-xs font-mono text-neutral-400 block mb-1">
                Prompt de Render Externo (Incluye directiva de cartela sintética):
              </label>
              <textarea
                readOnly
                rows={3}
                value={currentScene.externalRenderInstructions.promptText}
                className="w-full bg-neutral-950 border border-neutral-800 rounded p-3 text-neutral-200 font-mono text-xs focus:outline-none"
              />
            </div>
          </div>
        )}

        {/* Tab 4: FAD Status Viewer (Corrected: hasReceivedFadData is false) */}
        {activeSubTab === 'fad_advisory' && (
          <div className="space-y-5">
            <div className="bg-neutral-950/80 border border-neutral-800 rounded-lg p-5 space-y-4">
              <div className="flex items-start justify-between gap-4">
                <div className="flex items-center gap-2">
                  <ShieldAlert className="w-5 h-5 text-amber-500" />
                  <div>
                    <h4 className="text-sm font-serif font-semibold text-neutral-100">
                      Estado de Integración FAD (System Friction Institute)
                    </h4>
                    <span className="text-xs font-mono text-neutral-400">
                      hasReceivedFadData: <strong className="text-rose-400">false</strong> (A la espera de dictamen canónico verificado)
                    </span>
                  </div>
                </div>
                <span className="text-[10px] font-mono tracking-widest uppercase bg-neutral-900 border border-neutral-700 text-neutral-400 px-2 py-1 rounded">
                  ESTADO: SIN TRANSMISIÓN
                </span>
              </div>

              <div className="bg-neutral-900/60 rounded border border-neutral-800 p-4 text-xs font-mono text-neutral-300 space-y-2">
                <div className="text-amber-400 font-semibold">
                  Índice de Fricción FAD: NO TRANSMITIDO
                </div>
                <p className="text-neutral-400 font-sans text-xs leading-relaxed">
                  Esta aplicación complementaria no tiene autorización para ejecutar el modelo matemático FAD de SFI ni simular sus evaluaciones de fricción. 
                  El contenedor permanece a la espera de un sobre criptográfico firmado por los servidores autorizados de SFI.
                </p>
              </div>

              <div className="p-3 bg-amber-950/20 border border-amber-900/40 rounded text-xs text-amber-200/90 leading-relaxed font-sans">
                {fadData.systemDisclaimer}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
