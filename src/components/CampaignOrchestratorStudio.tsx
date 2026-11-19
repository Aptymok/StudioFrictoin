/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 *
 * CAMPAIGN ORCHESTRATOR STUDIO
 * Orquestador unificado que enlaza todas las capacidades del Observatorio:
 * - Objeto 3D interactivo (Three.js Aparato A & Bóveda Subterránea)
 * - Frequency Layer (Música Lyria 3 / Pistas 35.2 Hz)
 * - Image Layer (Propuestas visuales Banana 2.1 / Capturas 3D)
 * - Multimedia Layer (Guión audiovisual, segmentación y Video Omni Flash)
 * - Friction Map & World Spectrum Vector (Campaña 15d / 90d)
 * - Exportación revisable SFI (BORRADOR DEMO_SYNTHETIC)
 */

import React, { useState } from 'react';
import { ProjectData } from '../types';
import { ThreeSubterraneanChamber } from './ThreeSubterraneanChamber';
import {
  Layers,
  Box,
  Radio,
  Image as ImageIcon,
  Film,
  Compass,
  MessageSquare,
  Download,
  ArrowRight,
  CheckCircle2,
  Eye,
  EyeOff,
} from 'lucide-react';

interface CampaignOrchestratorStudioProps {
  project: ProjectData;
  onNavigate: (tab: string) => void;
  onCaptureSnapshot?: (dataUrl: string) => void;
}

export const CampaignOrchestratorStudio: React.FC<CampaignOrchestratorStudioProps> = ({
  project,
  onNavigate,
  onCaptureSnapshot,
}) => {
  const [show3DViewport, setShow3DViewport] = useState(false);
  const [selectedCampaignId, setSelectedCampaignId] = useState<string>(
    project.campaigns[0]?.id || ''
  );

  const activeCampaign =
    project.campaigns.find((c) => c.id === selectedCampaignId) || project.campaigns[0];
  const preferredAssets = project.visualProposals.filter((p) => p.preferredSelection);
  const totalVideoSeconds = project.audiovisualScenes.reduce(
    (sum, s) => sum + s.durationSeconds,
    0
  );

  return (
    <div className="bg-neutral-950 border border-neutral-800 rounded-2xl p-6 space-y-6">
      {/* Header */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 border-b border-neutral-800 pb-4">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <Layers className="w-4 h-4 text-amber-400" />
            <span className="text-xs font-mono uppercase tracking-widest text-amber-400 font-semibold">
              ORQUESTADOR DE CAMPAÑA MULTICAPA · SFI STUDIO
            </span>
          </div>
          <h2 className="text-xl font-serif font-bold text-neutral-100">
            Integración de Objeto 3D, Audio, Imagen, Video Omni Flash y Decisión Experimental
          </h2>
          <p className="text-xs text-neutral-400 font-sans max-w-3xl">
            Coordina todos los activos generados en las vistas independientes de IA y verifica su trazabilidad <strong className="text-amber-300 font-mono">DEMO_SYNTHETIC</strong> antes de emitir el paquete de revisión.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2 shrink-0">
          <button
            onClick={() => setShow3DViewport(!show3DViewport)}
            className="flex items-center gap-1.5 px-3 py-2 bg-neutral-900 hover:bg-neutral-800 border border-amber-700/60 text-amber-300 rounded-lg text-xs font-mono uppercase transition-colors"
          >
            {show3DViewport ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
            <span>{show3DViewport ? 'Ocultar Objeto 3D' : 'Inspeccionar Objeto 3D'}</span>
          </button>

          <button
            onClick={() => onNavigate('export')}
            className="flex items-center gap-1.5 px-4 py-2 bg-amber-400 hover:bg-amber-300 text-neutral-950 font-mono text-xs uppercase font-bold rounded-lg transition-colors"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Ensamblar Paquete SFI</span>
          </button>
        </div>
      </div>

      {/* Integrated 3D Chamber Object Stage (when toggled open) */}
      {show3DViewport && (
        <div className="space-y-2">
          <div className="flex items-center justify-between text-xs font-mono text-neutral-400">
            <span className="flex items-center gap-1.5 text-amber-400">
              <Box className="w-3.5 h-3.5" />
              <span>Objeto 3D Enlazado: Bóveda Subterránea & Aparato A (Three.js PBR)</span>
            </span>
            <span>Captura un fotograma para enviarlo directo al Image Layer</span>
          </div>
          <ThreeSubterraneanChamber onCaptureSnapshot={onCaptureSnapshot} />
        </div>
      )}

      {/* Campaign Selector Strip */}
      {project.campaigns.length > 0 && (
        <div className="flex flex-wrap items-center justify-between gap-3 bg-neutral-900/50 border border-neutral-800 rounded-xl p-4">
          <div className="space-y-1">
            <span className="text-[10px] font-mono uppercase text-neutral-500 block">
              Ciclo de Campaña Activo para Orquestación:
            </span>
            <div className="flex flex-wrap gap-2">
              {project.campaigns.map((camp) => (
                <button
                  key={camp.id}
                  onClick={() => setSelectedCampaignId(camp.id)}
                  className={`px-3 py-1.5 rounded-lg border text-xs font-mono transition-colors ${
                    camp.id === activeCampaign?.id
                      ? 'bg-purple-950/60 border-purple-500 text-purple-200 font-semibold'
                      : 'bg-neutral-950 border-neutral-800 text-neutral-400 hover:text-neutral-200'
                  }`}
                >
                  {camp.title} ({camp.cycleType === '15_dias' ? '15d' : '90d'})
                </button>
              ))}
            </div>
          </div>

          {activeCampaign && (
            <div className="text-right font-mono text-xs">
              <span className="text-[10px] text-neutral-500 block uppercase">Canal & Formato</span>
              <span className="text-neutral-200">
                {activeCampaign.channel} · {activeCampaign.format}
              </span>
            </div>
          )}
        </div>
      )}

      {/* 5-Layer Orchestration Pipeline Matrix */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-3">
        {/* Layer 1: Frequency & Music */}
        <div
          onClick={() => onNavigate('frequency')}
          className="bg-neutral-900/50 hover:bg-neutral-900 border border-neutral-800 hover:border-amber-600/60 rounded-xl p-4 cursor-pointer transition-all flex flex-col justify-between space-y-3"
        >
          <div className="space-y-1.5">
            <div className="flex items-center justify-between">
              <Radio className="w-4 h-4 text-amber-400" />
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
            </div>
            <h4 className="text-xs font-mono uppercase font-bold text-neutral-100">
              1. Frequency Layer
            </h4>
            <p className="text-[11px] text-neutral-400 font-sans">
              DAW multicanal, instrumento y generador musical Lyria 3 a 35.2 Hz.
            </p>
          </div>
          <div className="pt-2 border-t border-neutral-800 text-[10px] font-mono text-amber-400 flex items-center justify-between">
            <span>{project.audiovisualScenes[0]?.authorizedAudioCue.slice(0, 20)}...</span>
            <ArrowRight className="w-3 h-3" />
          </div>
        </div>

        {/* Layer 2: Image & 3D Object */}
        <div
          onClick={() => onNavigate('image')}
          className="bg-neutral-900/50 hover:bg-neutral-900 border border-neutral-800 hover:border-cyan-600/60 rounded-xl p-4 cursor-pointer transition-all flex flex-col justify-between space-y-3"
        >
          <div className="space-y-1.5">
            <div className="flex items-center justify-between">
              <ImageIcon className="w-4 h-4 text-cyan-400" />
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
            </div>
            <h4 className="text-xs font-mono uppercase font-bold text-neutral-100">
              2. Image & Objeto 3D
            </h4>
            <p className="text-[11px] text-neutral-400 font-sans">
              {project.visualProposals.length} activos ({preferredAssets.length} preferidos) + Aparato A 3D + Editor de Capas.
            </p>
          </div>
          <div className="pt-2 border-t border-neutral-800 text-[10px] font-mono text-cyan-400 flex items-center justify-between">
            <span>Banana 2.1 + Capas</span>
            <ArrowRight className="w-3 h-3" />
          </div>
        </div>

        {/* Layer 3: Multimedia Video Editor */}
        <div
          onClick={() => onNavigate('multimedia')}
          className="bg-neutral-900/50 hover:bg-neutral-900 border border-neutral-800 hover:border-emerald-600/60 rounded-xl p-4 cursor-pointer transition-all flex flex-col justify-between space-y-3"
        >
          <div className="space-y-1.5">
            <div className="flex items-center justify-between">
              <Film className="w-4 h-4 text-emerald-400" />
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
            </div>
            <h4 className="text-xs font-mono uppercase font-bold text-neutral-100">
              3. Video & Waveform
            </h4>
            <p className="text-[11px] text-neutral-400 font-sans">
              {project.audiovisualScenes.length} escenas ({totalVideoSeconds}s) + {(project.audioSegments || []).length} segmentos WAV anotados.
            </p>
          </div>
          <div className="pt-2 border-t border-neutral-800 text-[10px] font-mono text-emerald-400 flex items-center justify-between">
            <span>Omni Flash 16:9/9:16</span>
            <ArrowRight className="w-3 h-3" />
          </div>
        </div>

        {/* Layer 4: Friction Map */}
        <div
          onClick={() => onNavigate('friction_map')}
          className="bg-neutral-900/50 hover:bg-neutral-900 border border-neutral-800 hover:border-purple-600/60 rounded-xl p-4 cursor-pointer transition-all flex flex-col justify-between space-y-3"
        >
          <div className="space-y-1.5">
            <div className="flex items-center justify-between">
              <Compass className="w-4 h-4 text-purple-400" />
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
            </div>
            <h4 className="text-xs font-mono uppercase font-bold text-neutral-100">
              4. Friction Map
            </h4>
            <p className="text-[11px] text-neutral-400 font-sans">
              {project.campaigns.length} ciclos experimentales y criterios Mantener / Modificar / Detener.
            </p>
          </div>
          <div className="pt-2 border-t border-neutral-800 text-[10px] font-mono text-purple-400 flex items-center justify-between">
            <span>Matriz de Fricción</span>
            <ArrowRight className="w-3 h-3" />
          </div>
        </div>

        {/* Layer 5: Gemini Chatbot */}
        <div
          onClick={() => onNavigate('chatbot')}
          className="bg-neutral-900/50 hover:bg-neutral-900 border border-neutral-800 hover:border-blue-500/60 rounded-xl p-4 cursor-pointer transition-all flex flex-col justify-between space-y-3"
        >
          <div className="space-y-1.5">
            <div className="flex items-center justify-between">
              <MessageSquare className="w-4 h-4 text-blue-400" />
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
            </div>
            <h4 className="text-xs font-mono uppercase font-bold text-neutral-100">
              5. Gemini Copiloto
            </h4>
            <p className="text-[11px] text-neutral-400 font-sans">
              Asistente multi-turno (Carbon / Argon / Hydrogen / Flash-Lite) para revisión epistémica.
            </p>
          </div>
          <div className="pt-2 border-t border-neutral-800 text-[10px] font-mono text-blue-400 flex items-center justify-between">
            <span>Abrir Diálogo IA</span>
            <ArrowRight className="w-3 h-3" />
          </div>
        </div>
      </div>

      {/* Active Campaign Summary & Readiness Bar */}
      {activeCampaign && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 bg-neutral-900/40 border border-neutral-800 rounded-xl p-4 text-xs">
          <div className="lg:col-span-5 space-y-1">
            <span className="text-[10px] font-mono uppercase text-cyan-400 block">
              [HIPÓTESIS] DE CAMPAÑA ORQUESTADA
            </span>
            <p className="text-neutral-200 font-sans leading-relaxed">
              {activeCampaign.hypothesis}
            </p>
          </div>
          <div className="lg:col-span-4 space-y-1">
            <span className="text-[10px] font-mono uppercase text-amber-400 block">
              [OBJETIVO] INDICADOR OBSERVABLE
            </span>
            <p className="text-neutral-300 font-mono leading-relaxed">
              {activeCampaign.observableIndicator}
            </p>
          </div>
          <div className="lg:col-span-3 flex flex-col justify-between bg-neutral-950 border border-neutral-800 rounded-lg p-3 font-mono">
            <span className="text-[10px] uppercase text-neutral-500">Estado de Salida</span>
            <span className="text-amber-400 font-bold text-[11px]">
              BORRADOR (DEMO_SYNTHETIC)
            </span>
            <span className="text-[10px] text-rose-400">hasReceivedFadData: false</span>
          </div>
        </div>
      )}
    </div>
  );
};
