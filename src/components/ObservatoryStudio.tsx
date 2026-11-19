/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * 
 * SFI CREATIVE COMPANION — OBSERVATORY: STUDIO
 * Central command cockpit of System Friction Institute:
 * - Live telemetry & World Spectrum Vector overview
 * - Creative observatories launchpad: Frequency, Multimedia, Image, Friction Map
 * - Epistemic Ledger status & Air-gap verification
 * - Non-destructive project goal & hypothesis calibration
 */

import React from 'react';
import { ProjectData } from '../types';
import { WorldSpectrumVectorD3 } from './WorldSpectrumVectorD3';
import { CampaignOrchestratorStudio } from './CampaignOrchestratorStudio';
import { 
  Compass, 
  Radio, 
  Film, 
  Image as ImageIcon, 
  ArrowRight, 
  RotateCcw,
  MessageSquare,
} from 'lucide-react';

interface ObservatoryStudioProps {
  project: ProjectData;
  onNavigate: (tab: string) => void;
  onResetDemo: () => void;
  onCaptureSnapshot?: (dataUrl: string) => void;
}

export const ObservatoryStudio: React.FC<ObservatoryStudioProps> = ({
  project,
  onNavigate,
  onResetDemo,
  onCaptureSnapshot,
}) => {
  return (
    <div className="space-y-8">
      {/* Hero Observatory Cockpit */}
      <div className="bg-neutral-900/70 border border-neutral-800 rounded-2xl p-6 md:p-8 relative overflow-hidden">
        <div className="relative z-10 flex flex-col lg:flex-row lg:items-center justify-between gap-6 border-b border-neutral-800/80 pb-6">
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <span className="text-xs font-mono uppercase tracking-widest text-emerald-400 font-semibold">
                ● NOMINAL · SYSTEM FRICTION INSTITUTE · OBSERVATORIO CREATIVO CENTRAL
              </span>
            </div>
            <h1 className="text-3xl md:text-4xl font-serif font-bold text-neutral-100 tracking-tight">
              {project.name}
            </h1>
            <p className="text-sm text-neutral-400 max-w-3xl font-sans leading-relaxed">
              {project.objective}
            </p>
          </div>

          <div className="flex items-center gap-3 shrink-0">
            <button
              onClick={onResetDemo}
              className="flex items-center gap-1.5 px-3 py-2 text-xs font-mono uppercase bg-neutral-900 hover:bg-neutral-800 text-neutral-300 border border-neutral-800 rounded-lg transition-colors"
              title="Restablecer valores de calibración demo"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Restablecer Demo</span>
            </button>

            <button
              onClick={() => onNavigate('export')}
              className="flex items-center gap-2 px-4 py-2 text-xs font-mono uppercase bg-amber-400 hover:bg-amber-300 text-neutral-950 font-bold rounded-lg transition-colors shadow-sm"
            >
              <span>Exportar a SFI</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        {/* Live Observatory Telemetry Bar */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 pt-6">
          <div className="bg-neutral-950/70 border border-neutral-800/80 rounded-xl p-4">
            <span className="text-[10px] font-mono uppercase text-neutral-500 block mb-1">
              Frecuencia de Laboratorio
            </span>
            <div className="flex items-baseline gap-1.5">
              <span className="text-2xl font-mono font-bold tabular-nums text-amber-400">35.2</span>
              <span className="text-xs font-mono text-neutral-400">Hz (Resonancia)</span>
            </div>
            <span className="text-[10px] font-mono text-emerald-400 mt-1 block">Estable · PBR Three.js</span>
          </div>

          <div className="bg-neutral-950/70 border border-neutral-800/80 rounded-xl p-4">
            <span className="text-[10px] font-mono uppercase text-neutral-500 block mb-1">
              Activos Sintéticos Activos
            </span>
            <div className="flex items-baseline gap-1.5">
              <span className="text-2xl font-mono font-bold tabular-nums text-cyan-400">{project.visualProposals.length}</span>
              <span className="text-xs font-mono text-neutral-400">propuestas</span>
            </div>
            <span className="text-[10px] font-mono text-amber-400 mt-1 block">DEMO_SYNTHETIC</span>
          </div>

          <div className="bg-neutral-950/70 border border-neutral-800/80 rounded-xl p-4">
            <span className="text-[10px] font-mono uppercase text-neutral-500 block mb-1">
              Guión & Planos de Video
            </span>
            <div className="flex items-baseline gap-1.5">
              <span className="text-2xl font-mono font-bold tabular-nums text-purple-400">{project.audiovisualScenes.length}</span>
              <span className="text-xs font-mono text-neutral-400">escenas</span>
            </div>
            <span className="text-[10px] font-mono text-purple-300 mt-1 block">Omni Flash 16:9 / 9:16</span>
          </div>

          <div className="bg-neutral-950/70 border border-neutral-800/80 rounded-xl p-4">
            <span className="text-[10px] font-mono uppercase text-neutral-500 block mb-1">
              Gobernanza Canónica SFI
            </span>
            <div className="flex items-baseline gap-1.5">
              <span className="text-lg font-mono font-bold text-rose-400">hasReceivedFad: false</span>
            </div>
            <span className="text-[10px] font-mono text-neutral-400 mt-1 block">Air-gap Desconectado</span>
          </div>
        </div>
      </div>

      {/* D3 World Spectrum Vector Radial Deviation Analyzer */}
      <WorldSpectrumVectorD3 />

      {/* Unified Campaign Orchestrator (includes toggleable 3D Chamber Object & All AI Views) */}
      <CampaignOrchestratorStudio
        project={project}
        onNavigate={onNavigate}
        onCaptureSnapshot={onCaptureSnapshot}
      />

      {/* Observatories Launchpad Cards (Independent Observable Studio Views) */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <span className="text-xs font-mono uppercase tracking-widest text-neutral-400">
            VISTAS INDEPENDIENTES DE INTELIGENCIA ARTIFICIAL & OBSERVATORIOS
          </span>
          <span className="text-xs font-mono text-neutral-500">
            Selecciona una vista observable para creación, edición y orquestación
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {/* Card 1: FREQUENCY LAYER */}
          <div
            onClick={() => onNavigate('frequency')}
            className="group bg-neutral-900/40 hover:bg-neutral-900/80 border border-neutral-800 hover:border-amber-600/60 rounded-xl p-6 cursor-pointer transition-all space-y-4"
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="p-2.5 bg-amber-950/50 border border-amber-800/60 rounded-lg text-amber-400">
                  <Radio className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-serif font-bold text-neutral-100 group-hover:text-amber-200 transition-colors">
                    FREQUENCY LAYER
                  </h3>
                  <span className="text-[11px] font-mono text-neutral-400">DAW · Canal · Instrumento · Lyria 3</span>
                </div>
              </div>
              <ArrowRight className="w-4 h-4 text-neutral-600 group-hover:text-amber-400 transition-colors" />
            </div>

            <p className="text-xs text-neutral-300 font-sans leading-relaxed">
              Plataforma de edición musical y osciloscopio con selección de canal, instrumento, frecuencia Hz, segmentación WAV y generación <strong className="text-neutral-100">Lyria 3</strong>.
            </p>
          </div>

          {/* Card 2: IMAGE LAYER */}
          <div
            onClick={() => onNavigate('image')}
            className="group bg-neutral-900/40 hover:bg-neutral-900/80 border border-neutral-800 hover:border-cyan-600/60 rounded-xl p-6 cursor-pointer transition-all space-y-4"
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="p-2.5 bg-cyan-950/50 border border-cyan-800/60 rounded-lg text-cyan-400">
                  <ImageIcon className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-serif font-bold text-neutral-100 group-hover:text-cyan-200 transition-colors">
                    IMAGE LAYER
                  </h3>
                  <span className="text-[11px] font-mono text-neutral-400">Banana 2.1 · Capas · Escena 3D</span>
                </div>
              </div>
              <ArrowRight className="w-4 h-4 text-neutral-600 group-hover:text-cyan-400 transition-colors" />
            </div>

            <p className="text-xs text-neutral-300 font-sans leading-relaxed">
              Generación de imagen IA, carga de archivos, cámara 3D Three.js y editor interactivo de capas (Seleccionar, Mover, Intercambiar, Eliminar).
            </p>
          </div>

          {/* Card 3: MULTIMEDIA LAYER (VIDEO) */}
          <div
            onClick={() => onNavigate('multimedia')}
            className="group bg-neutral-900/40 hover:bg-neutral-900/80 border border-neutral-800 hover:border-emerald-600/60 rounded-xl p-6 cursor-pointer transition-all space-y-4"
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="p-2.5 bg-emerald-950/50 border border-emerald-800/60 rounded-lg text-emerald-400">
                  <Film className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-serif font-bold text-neutral-100 group-hover:text-emerald-200 transition-colors">
                    MULTIMEDIA LAYER (VIDEO)
                  </h3>
                  <span className="text-[11px] font-mono text-neutral-400">Editor Video · Waveform · Omni Flash</span>
                </div>
              </div>
              <ArrowRight className="w-4 h-4 text-neutral-600 group-hover:text-emerald-400 transition-colors" />
            </div>

            <p className="text-xs text-neutral-300 font-sans leading-relaxed">
              Editor audiovisual completo con segmentador de forma de onda (WAV) vinculado a escenas y estudio integrado para añadir/generar canción, imagen o video.
            </p>
          </div>

          {/* Card 4: FRICTION MAP */}
          <div
            onClick={() => onNavigate('friction_map')}
            className="group bg-neutral-900/40 hover:bg-neutral-900/80 border border-neutral-800 hover:border-purple-600/60 rounded-xl p-6 cursor-pointer transition-all space-y-4"
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="p-2.5 bg-purple-950/50 border border-purple-800/60 rounded-lg text-purple-400">
                  <Compass className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-serif font-bold text-neutral-100 group-hover:text-purple-200 transition-colors">
                    FRICTION MAP
                  </h3>
                  <span className="text-[11px] font-mono text-neutral-400">Nodos Térmicos · Campañas 15d/90d</span>
                </div>
              </div>
              <ArrowRight className="w-4 h-4 text-neutral-600 group-hover:text-purple-400 transition-colors" />
            </div>

            <p className="text-xs text-neutral-300 font-sans leading-relaxed">
              Mapa térmico de cámaras subterráneas, comparación de hipótesis y matriz de decisión experimental (Mantener / Modificar / Detener).
            </p>
          </div>

          {/* Card 5: GEMINI AI CHATBOT */}
          <div
            onClick={() => onNavigate('chatbot')}
            className="group bg-neutral-900/40 hover:bg-neutral-900/80 border border-neutral-800 hover:border-blue-600/60 rounded-xl p-6 cursor-pointer transition-all space-y-4 md:col-span-2 lg:col-span-2"
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="p-2.5 bg-blue-950/50 border border-blue-800/60 rounded-lg text-blue-400">
                  <MessageSquare className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-serif font-bold text-neutral-100 group-hover:text-blue-200 transition-colors">
                    GEMINI AI CHATBOT (OBSERVATORIO MULTI-TURNO)
                  </h3>
                  <span className="text-[11px] font-mono text-neutral-400">
                    gemini-4-carbon · gemini-4-argon · gemini-4-hydrogen · gemini-3.1-flash-lite
                  </span>
                </div>
              </div>
              <ArrowRight className="w-4 h-4 text-neutral-600 group-hover:text-blue-400 transition-colors" />
            </div>

            <p className="text-xs text-neutral-300 font-sans leading-relaxed">
              Asistente conversacional multi-turno con selector de modelo y rol institucional para redactar guiones, auditar hipótesis falsables y coordinar piezas de campaña sin contaminar la evidencia canónica.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
