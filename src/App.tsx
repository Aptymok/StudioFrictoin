/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * 
 * SFI CREATIVE COMPANION
 * Aplicación web audiovisual, independiente y modular, como herramienta complementaria de System Friction Institute.
 */

import React, { useState } from 'react';
import { DEMO_PROJECT } from './data/demoProject';
import { 
  ProjectData, 
  EpistemicTimelineEvent, 
  VisualAssetProposal, 
  AudiovisualScene, 
  CampaignCycle, 
  VersionComparisonData,
  AudioWaveformSegment
} from './types';
import { Header } from './components/Header';
import { ObservatoryStudio } from './components/ObservatoryStudio';
import { ObservatoryFrequencyLayer } from './components/ObservatoryFrequencyLayer';
import { ObservatoryFrictionMap } from './components/ObservatoryFrictionMap';
import { GeminiChatbotStudio } from './components/GeminiChatbotStudio';
import { ModuleProjectInput } from './components/ModuleProjectInput';
import { ModuleTimeline } from './components/ModuleTimeline';
import { ModuleVisualLab } from './components/ModuleVisualLab';
import { ModuleAudiovisualLab } from './components/ModuleAudiovisualLab';
import { ModuleCampaignLab } from './components/ModuleCampaignLab';
import { ModuleVersionComparator } from './components/ModuleVersionComparator';
import { ModuleSfiExporter } from './components/ModuleSfiExporter';
import { TechnicalStatusModal } from './components/TechnicalStatusModal';
import { 
  History, 
  Image as ImageIcon, 
  Film, 
  GitCompare, 
  Download, 
  Radio,
  Compass,
  LayoutDashboard,
  MessageSquare
} from 'lucide-react';

export default function App() {
  const [project, setProject] = useState<ProjectData>(DEMO_PROJECT);
  const [activeTab, setActiveTab] = useState<string>('studio');
  const [showGovernanceModal, setShowGovernanceModal] = useState<boolean>(false);

  // Update handlers
  const handleUpdateProject = (updated: ProjectData) => {
    setProject(updated);
  };

  const handleResetDemo = () => {
    setProject({ ...DEMO_PROJECT });
  };

  const handleAddTimelineEvent = (event: EpistemicTimelineEvent) => {
    setProject((prev) => ({
      ...prev,
      timelineEvents: [...prev.timelineEvents, event].sort((a, b) => {
        const yearA = parseInt(a.year.slice(0, 4)) || 0;
        const yearB = parseInt(b.year.slice(0, 4)) || 0;
        return yearA - yearB;
      }),
    }));
  };

  const handleUpdateVisualProposal = (updated: VisualAssetProposal) => {
    setProject((prev) => ({
      ...prev,
      visualProposals: prev.visualProposals.map((p) =>
        p.id === updated.id ? updated : p
      ),
    }));
  };

  const handleAddVisualProposal = (proposal: VisualAssetProposal) => {
    setProject((prev) => ({
      ...prev,
      visualProposals: [proposal, ...prev.visualProposals],
    }));
  };

  const handleUpdateScenes = (scenes: AudiovisualScene[]) => {
    setProject((prev) => ({
      ...prev,
      audiovisualScenes: scenes,
    }));
  };

  const handleAddCampaign = (campaign: CampaignCycle) => {
    setProject((prev) => ({
      ...prev,
      campaigns: [campaign, ...prev.campaigns],
    }));
  };

  const handleUpdateComparison = (updated: VersionComparisonData) => {
    setProject((prev) => ({
      ...prev,
      versionComparisons: prev.versionComparisons.map((c) =>
        c.id === updated.id ? updated : c
      ),
    }));
  };

  const handleUpdateAudioSegments = (segments: AudioWaveformSegment[]) => {
    setProject((prev) => ({
      ...prev,
      audioSegments: segments,
    }));
  };

  const handleStudioSnapshot = (dataUrl: string) => {
    const baseTemplate = project.visualProposals[0];
    const snapshotProposal: VisualAssetProposal = {
      id: `prop-studio-3d-${Date.now()}`,
      title: 'Captura 3D Orquestador (Aparato A)',
      caption: 'Fotograma capturado desde Three.js en el Orquestador de Campaña. Procedencia DEMO_SYNTHETIC.',
      visualType: 'reconstruccion_3d',
      provenanceRecord: 'DEMO_SYNTHETIC',
      isDemoSynthetic: true,
      status: 'activo_sintetico_renderizado',
      rightsWarning: 'AVISO: Captura sintética Three.js. Clasificada como DEMO_SYNTHETIC. Sin auto-atribución de derechos.',
      imageUrl: dataUrl,
      technicalSpecs: {
        aspect: '16:9',
        lighting: 'Studio PBR RoomEnvironment',
        palette: 'Madera de roble, latón bruñido y fundición',
        optics: 'Perspectiva 45° FOV',
      },
      platformAdaptations: baseTemplate.platformAdaptations,
      editablePrompt: 'Escena 3D procedural de Aparato A.',
      preferredSelection: true,
      preferenceRationale: 'Seleccionada desde Orquestador de Campaña.',
      preferenceEpistemicNature: 'SIMULACION',
    };
    handleAddVisualProposal(snapshotProposal);
    setActiveTab('image');
  };

  return (
    <div className="min-h-screen bg-[#0a0a0c] text-neutral-100 flex flex-col font-sans selection:bg-amber-900/40 selection:text-amber-100">
      {/* Top Bar Contract Compliant Header */}
      <Header
        activeTab={activeTab}
        onTabChange={(tab) => setActiveTab(tab)}
        onOpenExport={() => setActiveTab('export')}
        onOpenGovernance={() => setShowGovernanceModal(true)}
        isDemo={project.isDemo}
      />

      {/* Main Container */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-6">
        {/* Quick Action Navigation Bar */}
        <div className="mb-6 p-2 bg-neutral-900/60 border border-neutral-800 rounded-lg flex items-center justify-between gap-2 overflow-x-auto text-xs">
          <div className="flex items-center gap-1.5 shrink-0">
            <span className="text-[11px] font-mono uppercase tracking-wider text-neutral-500 mr-2 hidden sm:inline">
              Observatorio:
            </span>
            <button
              onClick={() => setActiveTab('studio')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded transition-colors whitespace-nowrap ${
                activeTab === 'studio'
                  ? 'bg-neutral-800 text-neutral-100 font-bold shadow-sm'
                  : 'text-neutral-400 hover:text-neutral-200'
              }`}
            >
              <LayoutDashboard className="w-3.5 h-3.5 text-amber-500" />
              <span>STUDIO</span>
            </button>
            <button
              onClick={() => setActiveTab('frequency')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded transition-colors whitespace-nowrap ${
                activeTab === 'frequency'
                  ? 'bg-neutral-800 text-neutral-100 font-bold shadow-sm'
                  : 'text-neutral-400 hover:text-neutral-200'
              }`}
            >
              <Radio className="w-3.5 h-3.5 text-amber-400" />
              <span>FREQUENCY LAYER</span>
            </button>
            <button
              onClick={() => setActiveTab('multimedia')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded transition-colors whitespace-nowrap ${
                activeTab === 'multimedia'
                  ? 'bg-neutral-800 text-neutral-100 font-bold shadow-sm'
                  : 'text-neutral-400 hover:text-neutral-200'
              }`}
            >
              <Film className="w-3.5 h-3.5 text-emerald-400" />
              <span>MULTIMEDIA LAYER</span>
            </button>
            <button
              onClick={() => setActiveTab('image')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded transition-colors whitespace-nowrap ${
                activeTab === 'image'
                  ? 'bg-neutral-800 text-neutral-100 font-bold shadow-sm'
                  : 'text-neutral-400 hover:text-neutral-200'
              }`}
            >
              <ImageIcon className="w-3.5 h-3.5 text-cyan-400" />
              <span>IMAGE LAYER</span>
            </button>
            <button
              onClick={() => setActiveTab('friction_map')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded transition-colors whitespace-nowrap ${
                activeTab === 'friction_map'
                  ? 'bg-neutral-800 text-neutral-100 font-bold shadow-sm'
                  : 'text-neutral-400 hover:text-neutral-200'
              }`}
            >
              <Compass className="w-3.5 h-3.5 text-purple-400" />
              <span>FRICTION MAP</span>
            </button>
            <button
              onClick={() => setActiveTab('chatbot')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded transition-colors whitespace-nowrap ${
                activeTab === 'chatbot'
                  ? 'bg-neutral-800 text-neutral-100 font-bold shadow-sm'
                  : 'text-neutral-400 hover:text-neutral-200'
              }`}
            >
              <MessageSquare className="w-3.5 h-3.5 text-blue-400" />
              <span>AI CHATBOT</span>
            </button>
            <button
              onClick={() => setActiveTab('timeline')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded transition-colors whitespace-nowrap ${
                activeTab === 'timeline'
                  ? 'bg-neutral-800 text-neutral-100 font-medium'
                  : 'text-neutral-400 hover:text-neutral-200'
              }`}
            >
              <History className="w-3.5 h-3.5 text-blue-400" />
              <span>Línea Epistémica</span>
            </button>
            <button
              onClick={() => setActiveTab('comparisons')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded transition-colors whitespace-nowrap ${
                activeTab === 'comparisons'
                  ? 'bg-neutral-800 text-neutral-100 font-medium'
                  : 'text-neutral-400 hover:text-neutral-200'
              }`}
            >
              <GitCompare className="w-3.5 h-3.5 text-indigo-400" />
              <span>Comparador</span>
            </button>
          </div>

          <button
            onClick={() => setActiveTab('export')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded border transition-colors whitespace-nowrap shrink-0 ${
              activeTab === 'export'
                ? 'bg-amber-400 text-neutral-950 font-semibold border-amber-400'
                : 'bg-neutral-950 border-neutral-700 text-neutral-300 hover:text-neutral-100'
            }`}
          >
            <Download className="w-3.5 h-3.5" />
            <span>Exportar a SFI</span>
          </button>
        </div>

        {/* Dynamic Observatory Pages */}
        {activeTab === 'studio' && (
          <ObservatoryStudio
            project={project}
            onNavigate={(tab) => setActiveTab(tab)}
            onResetDemo={handleResetDemo}
            onCaptureSnapshot={handleStudioSnapshot}
          />
        )}

        {activeTab === 'frequency' && (
          <ObservatoryFrequencyLayer
            onAssignAudioCue={(cue) => {
              handleUpdateScenes(
                project.audiovisualScenes.map((s) => ({ ...s, authorizedAudioCue: cue }))
              );
            }}
          />
        )}

        {activeTab === 'multimedia' && (
          <ModuleAudiovisualLab
            scenes={project.audiovisualScenes}
            fadData={project.fadIntegration}
            proposals={project.visualProposals}
            audioSegments={project.audioSegments || []}
            onUpdateScenes={handleUpdateScenes}
            onUpdateAudioSegments={handleUpdateAudioSegments}
            onAddProposal={handleAddVisualProposal}
          />
        )}

        {activeTab === 'image' && (
          <ModuleVisualLab
            proposals={project.visualProposals}
            onUpdateProposal={handleUpdateVisualProposal}
            onAddProposal={handleAddVisualProposal}
          />
        )}

        {activeTab === 'friction_map' && (
          <ObservatoryFrictionMap
            campaigns={project.campaigns}
            onAddCampaign={handleAddCampaign}
          />
        )}

        {activeTab === 'chatbot' && (
          <GeminiChatbotStudio project={project} />
        )}

        {activeTab === 'project' && (
          <ModuleProjectInput
            project={project}
            onUpdateProject={handleUpdateProject}
            onResetDemo={handleResetDemo}
          />
        )}

        {activeTab === 'timeline' && (
          <ModuleTimeline
            events={project.timelineEvents}
            onAddEvent={handleAddTimelineEvent}
          />
        )}

        {activeTab === 'comparisons' && (
          <ModuleVersionComparator
            comparisons={project.versionComparisons}
            onUpdateComparison={handleUpdateComparison}
          />
        )}

        {activeTab === 'export' && (
          <ModuleSfiExporter
            project={project}
            onClose={() => setActiveTab('studio')}
          />
        )}
      </main>

      {/* Sober Institutional Footer */}
      <footer className="border-t border-neutral-900 bg-neutral-950/70 py-6 mt-12 text-xs text-neutral-500">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="space-y-1 text-center md:text-left">
            <div className="font-serif text-sm text-neutral-300">
              SFI Creative Companion · System Friction Institute
            </div>
            <p className="text-[11px] text-neutral-600">
              Herramienta complementaria independiente · Sin acceso directo a producción · Paquetes inmutables como BORRADOR PARA REVISIÓN.
            </p>
          </div>

          <div className="flex items-center gap-4 text-xs font-mono">
            <button
              onClick={() => setShowGovernanceModal(true)}
              className="hover:text-neutral-300 underline underline-offset-4 transition-colors"
            >
              Auditoría Air-Gap & 10 Salvaguardas Epistemológicas
            </button>
            <span>·</span>
            <span className="text-neutral-600">Entorno Autónomo Desconectado (DEMO_SYNTHETIC)</span>
          </div>
        </div>
      </footer>

      {/* Governance & Technical Status Modal */}
      <TechnicalStatusModal
        isOpen={showGovernanceModal}
        onClose={() => setShowGovernanceModal(false)}
      />
    </div>
  );
}
