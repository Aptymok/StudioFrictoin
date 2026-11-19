/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * 
 * MÓDULO 3: LABORATORIO VISUAL
 * Interfaz para examinar imágenes con procedencia DEMO_SYNTHETIC,
 * generar conceptos visuales y prompts editables, crear versiones multi-plataforma
 * (Instagram, TikTok, YouTube, Facebook, LinkedIn, Web), preparar storyboards/carruseles
 * y registrar preferencias fundamentadas sin auto-atribuir derechos ni fingir historicidad.
 */

import React, { useState } from 'react';
import { VisualAssetProposal, PlatformFormat, PlatformSpec } from '../types';
import { ThreeSubterraneanChamber } from './ThreeSubterraneanChamber';
import { ImageStudioNanoBanana } from './ImageStudioNanoBanana';
import { ImageLayerInteractiveEditor } from './ImageLayerInteractiveEditor';
import { 
  Eye, 
  Sparkles, 
  Layers, 
  Copy, 
  Check, 
  Sliders, 
  ThumbsUp, 
  FileCheck2,
  Info,
  AlertTriangle,
  Lock,
  Box,
  Image as ImageIcon
} from 'lucide-react';

interface ModuleVisualLabProps {
  proposals: VisualAssetProposal[];
  onUpdateProposal: (updated: VisualAssetProposal) => void;
  onAddProposal?: (proposal: VisualAssetProposal) => void;
}

const PLATFORM_NAMES: Record<PlatformFormat, string> = {
  instagram: 'Instagram (1:1 / 4:5)',
  tiktok: 'TikTok (9:16 Vertical)',
  youtube: 'YouTube (16:9 HD)',
  facebook: 'Facebook (1.91:1 Link)',
  linkedin: 'LinkedIn (4:5 / 1:1)',
  web: 'Web / Archivo Deep-Zoom',
};

export const ModuleVisualLab: React.FC<ModuleVisualLabProps> = ({
  proposals,
  onUpdateProposal,
  onAddProposal,
}) => {
  const [selectedAssetId, setSelectedAssetId] = useState<string>(proposals[0]?.id || '');
  const [activePlatform, setActivePlatform] = useState<PlatformFormat>('youtube');
  const [activeViewMode, setActiveViewMode] = useState<'catalog' | 'scene3d' | 'image_ai' | 'editor_capas' | 'storyboard' | 'carousel' | 'spec_generator'>('catalog');
  const [copiedPromptId, setCopiedPromptId] = useState<string | null>(null);
  const [snapshotSuccessNotice, setSnapshotSuccessNotice] = useState<string | null>(null);

  // Editable prompt state
  const currentAsset = proposals.find((p) => p.id === selectedAssetId) || proposals[0];
  const [editablePromptText, setEditablePromptText] = useState(currentAsset?.editablePrompt || '');
  const [preferenceNote, setPreferenceNote] = useState(currentAsset?.preferenceRationale || '');

  const handleSelectAsset = (asset: VisualAssetProposal) => {
    setSelectedAssetId(asset.id);
    setEditablePromptText(asset.editablePrompt || '');
    setPreferenceNote(asset.preferenceRationale || '');
  };

  const handleCopyPrompt = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedPromptId(id);
    setTimeout(() => setCopiedPromptId(null), 2000);
  };

  const handleSavePreference = () => {
    if (!currentAsset) return;
    const updated: VisualAssetProposal = {
      ...currentAsset,
      preferredSelection: true,
      preferenceRationale: preferenceNote,
      editablePrompt: editablePromptText || currentAsset.editablePrompt,
      preferenceEpistemicNature: 'SIMULACION',
    };
    onUpdateProposal(updated);
  };

  const handleCaptureSnapshot = (dataUrl: string) => {
    const newProposal: VisualAssetProposal = {
      id: `prop-3d-snap-${Date.now()}`,
      title: 'Fotograma de Cámara Subterránea (Captura 3D Three.js)',
      caption: 'Instantánea de inspección del Aparato A renderizada en tiempo real mediante Three.js PBR. Procedencia DEMO_SYNTHETIC.',
      visualType: 'reconstruccion_3d',
      provenanceRecord: 'DEMO_SYNTHETIC',
      isDemoSynthetic: true,
      status: 'activo_sintetico_renderizado',
      rightsWarning: 'AVISO: Captura sintetizada proceduralmente en Three.js. Clasificada como DEMO_SYNTHETIC. Sin auto-atribución de derechos de autor.',
      imageUrl: dataUrl,
      technicalSpecs: {
        aspect: '16:9',
        lighting: 'Studio PBR con RoomEnvironment y reflejos PMREM',
        palette: 'Madera de roble, latón bruñido y hierro fundido',
        optics: 'Perspectiva 45° FOV con cámara amortiguada',
      },
      platformAdaptations: {
        instagram: {
          formatName: 'Instagram Feed (1:1)',
          aspectRatio: '1:1',
          cropFocus: 'Péndulo de resonancia 35.2 Hz',
          dimensions: '1080x1080',
          technicalNote: 'Encuadre centrado con marca de agua ineludible.',
        },
        tiktok: {
          formatName: 'TikTok (9:16 Vertical)',
          aspectRatio: '9:16',
          cropFocus: 'Trompeta de latón y escala',
          dimensions: '1080x1920',
          technicalNote: 'Formato vertical respetando márgenes de seguridad.',
        },
        youtube: {
          formatName: 'YouTube HD (16:9)',
          aspectRatio: '16:9',
          cropFocus: 'Plano general del banco de roble',
          dimensions: '1920x1080',
          technicalNote: 'Miniatura y fotograma con indicativo DEMOSTRACIÓN.',
        },
        facebook: {
          formatName: 'Facebook Share (1.91:1)',
          aspectRatio: '1.91:1',
          cropFocus: 'Composición panorámica',
          dimensions: '1200x628',
          technicalNote: 'Tarjeta de vista previa sin atribución documental canónica.',
        },
        linkedin: {
          formatName: 'LinkedIn Post (4:5)',
          aspectRatio: '4:5',
          cropFocus: 'Enfoque técnico',
          dimensions: '1080x1350',
          technicalNote: 'Cuaderno didáctico de instrumentación física.',
        },
        web: {
          formatName: 'Web Archive Deep-Zoom',
          aspectRatio: '16:9',
          cropFocus: 'Visor interactivo con despiece',
          dimensions: '1920x1080',
          technicalNote: 'Encuadre exportado desde el visor 3D en tiempo real.',
        },
      },
      editablePrompt: 'Escena 3D procedural de Aparato A y Bóveda Subterránea de 1934 con mesa de roble y trompeta de latón.',
      preferredSelection: false,
      preferenceRationale: 'Capturado en tiempo real desde la simulación Three.js.',
      preferenceEpistemicNature: 'SIMULACION',
    };

    if (onAddProposal) {
      onAddProposal(newProposal);
    }
    setSelectedAssetId(newProposal.id);
    setSnapshotSuccessNotice('¡Fotograma 3D capturado y agregado al catálogo de propuestas!');
    setTimeout(() => setSnapshotSuccessNotice(null), 3500);
  };

  const handleAddAiProposal = (proposal: VisualAssetProposal) => {
    if (onAddProposal) {
      onAddProposal(proposal);
    }
    setSelectedAssetId(proposal.id);
    setSnapshotSuccessNotice('¡Activo sintético de Gemini Nano Banana agregado al catálogo!');
    setTimeout(() => setSnapshotSuccessNotice(null), 3500);
  };

  return (
    <div className="space-y-8 max-w-6xl mx-auto py-6">
      {/* Module Title */}
      <div className="border-b border-neutral-800 pb-6 flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <span className="text-xs font-mono uppercase tracking-widest text-cyan-400 block mb-1 font-semibold">
            IMAGE LAYER · OBSERVATORIO VISUAL, ESCENA 3D & DIRECCIÓN DE ARTE
          </span>
          <h1 className="text-2xl md:text-3xl font-serif font-bold text-neutral-100">
            Inspección de Activos, Escena 3D Three.js & Taller IA (Banana 2.1)
          </h1>
          <p className="text-sm text-neutral-400 mt-1 max-w-3xl">
            Inspecciona imágenes con procedencia <strong className="text-amber-400 font-mono">DEMO_SYNTHETIC</strong>, 
            explora el aparato en la escena 3D PBR (Three.js), genera conceptos con Gemini Nano Banana 2.1 y formula adaptaciones multicanal. 
            <strong className="text-neutral-200"> Ningún material se auto-atribuye derechos de autor ni licencias abiertas.</strong>
          </p>
        </div>

        {/* View Mode Segmented Switch */}
        <div className="flex flex-wrap items-center gap-1 p-1 bg-neutral-900 border border-neutral-800 rounded-lg shrink-0">
          <button
            onClick={() => setActiveViewMode('catalog')}
            className={`px-3 py-1.5 text-xs font-medium rounded transition-colors ${
              activeViewMode === 'catalog'
                ? 'bg-neutral-800 text-neutral-100 shadow-sm'
                : 'text-neutral-400 hover:text-neutral-200'
            }`}
          >
            Ficha & Plataformas
          </button>
          <button
            onClick={() => setActiveViewMode('scene3d')}
            className={`flex items-center gap-1 px-3 py-1.5 text-xs font-medium rounded transition-colors ${
              activeViewMode === 'scene3d'
                ? 'bg-amber-950/70 text-amber-200 border border-amber-800/80 font-semibold'
                : 'text-neutral-400 hover:text-neutral-200'
            }`}
          >
            <Box className="w-3.5 h-3.5 text-amber-400" />
            <span>Escena 3D (Three.js)</span>
          </button>
          <button
            onClick={() => setActiveViewMode('image_ai')}
            className={`flex items-center gap-1 px-3 py-1.5 text-xs font-medium rounded transition-colors ${
              activeViewMode === 'image_ai'
                ? 'bg-amber-950/70 text-amber-200 border border-amber-800/80 font-semibold'
                : 'text-neutral-400 hover:text-neutral-200'
            }`}
          >
            <Sparkles className="w-3.5 h-3.5 text-amber-400" />
            <span>Taller IA (Banana 2.1)</span>
          </button>
          <button
            onClick={() => setActiveViewMode('editor_capas')}
            className={`flex items-center gap-1 px-3 py-1.5 text-xs font-medium rounded transition-colors ${
              activeViewMode === 'editor_capas'
                ? 'bg-cyan-950/70 text-cyan-200 border border-cyan-700/80 font-semibold'
                : 'text-neutral-400 hover:text-neutral-200'
            }`}
          >
            <Layers className="w-3.5 h-3.5 text-cyan-400" />
            <span>Editor Capas (Mover / Swap)</span>
          </button>
          <button
            onClick={() => setActiveViewMode('storyboard')}
            className={`px-3 py-1.5 text-xs font-medium rounded transition-colors ${
              activeViewMode === 'storyboard'
                ? 'bg-neutral-800 text-neutral-100 shadow-sm'
                : 'text-neutral-400 hover:text-neutral-200'
            }`}
          >
            Storyboard
          </button>
          <button
            onClick={() => setActiveViewMode('carousel')}
            className={`px-3 py-1.5 text-xs font-medium rounded transition-colors ${
              activeViewMode === 'carousel'
                ? 'bg-neutral-800 text-neutral-100 shadow-sm'
                : 'text-neutral-400 hover:text-neutral-200'
            }`}
          >
            Carrusel Educativo
          </button>
          <button
            onClick={() => setActiveViewMode('spec_generator')}
            className={`px-3 py-1.5 text-xs font-medium rounded transition-colors ${
              activeViewMode === 'spec_generator'
                ? 'bg-neutral-800 text-neutral-100 shadow-sm'
                : 'text-neutral-400 hover:text-neutral-200'
            }`}
          >
            Generador de Prompts
          </button>
        </div>
      </div>

      {snapshotSuccessNotice && (
        <div className="p-3 bg-emerald-950/50 border border-emerald-800/80 rounded-lg text-xs text-emerald-200 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Check className="w-4 h-4 text-emerald-400 shrink-0" />
            <span>{snapshotSuccessNotice}</span>
          </div>
          <button
            onClick={() => setActiveViewMode('catalog')}
            className="underline underline-offset-4 font-mono text-[11px] hover:text-emerald-100"
          >
            Ver en Catálogo &rarr;
          </button>
        </div>
      )}

      {/* Main Catalog & Platform Adapter View */}
      {activeViewMode === 'catalog' && currentAsset && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          {/* Left Column: Asset Selection Thumbnails & Provenance */}
          <div className="lg:col-span-4 space-y-4">
            <span className="text-xs font-mono uppercase tracking-wider text-neutral-400 block">
              Biblioteca de Activos ({proposals.length} Sintéticos)
            </span>

            <div className="space-y-3">
              {proposals.map((asset) => {
                const isSelected = asset.id === currentAsset.id;
                return (
                  <button
                    key={asset.id}
                    onClick={() => handleSelectAsset(asset)}
                    className={`w-full text-left p-3 rounded-lg border transition-all flex items-start gap-3 relative ${
                      isSelected
                        ? 'bg-neutral-900 border-amber-600/70 ring-1 ring-amber-600/30'
                        : 'bg-neutral-900/40 border-neutral-800 hover:border-neutral-700'
                    }`}
                  >
                    <div className="relative w-16 h-16 shrink-0 rounded overflow-hidden border border-neutral-800 bg-neutral-950">
                      <img
                        src={asset.imageUrl}
                        alt={asset.title}
                        referrerPolicy="no-referrer"
                        className="w-full h-full object-cover"
                      />
                      <span className="absolute bottom-0 inset-x-0 bg-neutral-950/90 text-[8px] font-mono text-amber-400 text-center py-0.2">
                        DEMO
                      </span>
                    </div>

                    <div className="space-y-1 min-w-0">
                      <div className="flex items-center gap-1.5">
                        <span className="text-[10px] font-mono uppercase tracking-wider text-amber-500 truncate">
                          {asset.visualType.replace(/_/g, ' ')}
                        </span>
                        {asset.preferredSelection && (
                          <span className="text-[9px] font-mono px-1 py-0.2 bg-emerald-950 text-emerald-400 border border-emerald-800 rounded">
                            PREFERIDO
                          </span>
                        )}
                      </div>
                      <h4 className="text-xs font-medium text-neutral-200 truncate">
                        {asset.title}
                      </h4>
                      <p className="text-[10px] text-amber-400/80 font-mono truncate">
                        PROCEDENCIA: {asset.provenanceRecord}
                      </p>
                    </div>
                  </button>
                );
              })}
            </div>

            {/* Provenance & Rights Disclaimer Card */}
            <div className="bg-neutral-950/80 border border-neutral-800 rounded-lg p-4 space-y-2.5 text-xs">
              <span className="font-mono uppercase tracking-wider text-neutral-400 flex items-center gap-1.5 text-[11px]">
                <FileCheck2 className="w-3.5 h-3.5 text-amber-500" />
                <span>Régimen Jurídico & Procedencia</span>
              </span>

              <div className="bg-amber-950/30 border border-amber-900/50 rounded p-2.5 text-[11px] text-amber-200/90 font-mono">
                {currentAsset.rightsWarning}
              </div>

              <div className="pt-2 border-t border-neutral-800 text-[11px] text-neutral-400 font-mono space-y-1">
                <div>Procedencia: <span className="text-amber-400 font-bold">{currentAsset.provenanceRecord}</span></div>
                <div>Condición: <span className="text-purple-300">SIMULACIÓN DIDÁCTICA</span></div>
                <div>Iluminación modelada: <span className="text-neutral-400">{currentAsset.technicalSpecs.lighting}</span></div>
              </div>
            </div>
          </div>

          {/* Right Column: High-Res Viewer & Multi-Platform Adaptation */}
          <div className="lg:col-span-8 space-y-6">
            {/* Visual Viewer with Inescapable Watermark */}
            <div className="bg-neutral-900/40 border border-neutral-800 rounded-lg p-4 space-y-4">
              <div className="relative aspect-video bg-neutral-950 rounded-lg overflow-hidden border border-neutral-800 flex items-center justify-center">
                <img
                  src={currentAsset.imageUrl}
                  alt={currentAsset.title}
                  referrerPolicy="no-referrer"
                  className="w-full h-full object-contain"
                />

                {/* Permanent Epistemic Watermark */}
                <div className="absolute top-3 left-3 bg-neutral-950/90 border border-amber-700/80 px-2.5 py-1 rounded text-[10px] font-mono text-amber-300 tracking-wider uppercase shadow-md flex items-center gap-1.5">
                  <AlertTriangle className="w-3 h-3 text-amber-400" />
                  <span>DEMOSTRACIÓN / ACTIVO SINTÉTICO (DEMO_SYNTHETIC)</span>
                </div>

                <div className="absolute bottom-3 left-3 bg-neutral-950/85 backdrop-blur-sm border border-neutral-800 px-3 py-1.5 rounded text-xs text-neutral-300 font-mono flex items-center gap-2">
                  <span className="text-amber-500 uppercase">{currentAsset.technicalSpecs.aspect}</span>
                  <span>·</span>
                  <span>{currentAsset.title}</span>
                </div>
              </div>

              <div className="space-y-2">
                <p className="text-sm font-serif text-neutral-200 italic leading-relaxed">
                  «{currentAsset.caption}»
                </p>
              </div>
            </div>

            {/* Multi-Platform Adaptation Tabs */}
            <div className="bg-neutral-900/40 border border-neutral-800 rounded-lg p-5 space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-neutral-800 pb-3">
                <div className="flex items-center gap-2">
                  <Layers className="w-4 h-4 text-amber-500" />
                  <h3 className="text-sm font-serif font-medium text-neutral-100">
                    Adaptación Multi-Canal (Watermark DEMO_SYNTHETIC Obligatorio)
                  </h3>
                </div>
                <span className="text-xs font-mono text-neutral-500">
                  Formato activo: {PLATFORM_NAMES[activePlatform]}
                </span>
              </div>

              {/* Platform Selector Buttons */}
              <div className="flex flex-wrap gap-1.5">
                {(Object.keys(PLATFORM_NAMES) as PlatformFormat[]).map((platform) => {
                  const isActive = activePlatform === platform;
                  return (
                    <button
                      key={platform}
                      onClick={() => setActivePlatform(platform)}
                      className={`px-3 py-1 text-xs font-mono uppercase tracking-wider rounded border transition-colors ${
                        isActive
                          ? 'bg-amber-950/60 border-amber-600 text-amber-200 font-semibold'
                          : 'bg-neutral-950 border-neutral-800 text-neutral-400 hover:text-neutral-200'
                      }`}
                    >
                      {platform}
                    </button>
                  );
                })}
              </div>

              {/* Platform Spec Detail */}
              {currentAsset.platformAdaptations[activePlatform] && (
                <div className="bg-neutral-950/90 border border-neutral-800/80 rounded p-4 text-xs space-y-3">
                  {(() => {
                    const spec: PlatformSpec = currentAsset.platformAdaptations[activePlatform];
                    return (
                      <>
                        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 border-b border-neutral-800/70 pb-3">
                          <div>
                            <span className="text-neutral-500 font-mono uppercase block text-[10px]">
                              Relación de Aspecto
                            </span>
                            <span className="text-neutral-200 font-mono font-medium text-sm">
                              {spec.aspectRatio}
                            </span>
                          </div>
                          <div>
                            <span className="text-neutral-500 font-mono uppercase block text-[10px]">
                              Resolución de Exportación
                            </span>
                            <span className="text-neutral-200 font-mono font-medium text-sm">
                              {spec.dimensions}
                            </span>
                          </div>
                          <div>
                            <span className="text-neutral-500 font-mono uppercase block text-[10px]">
                              Corte & Puntos de Interés
                            </span>
                            <span className="text-amber-400 font-mono text-sm">
                              {spec.cropFocus}
                            </span>
                          </div>
                        </div>

                        <div>
                          <span className="text-neutral-500 font-mono uppercase block text-[10px] mb-1">
                            Directiva de Adaptación Visual:
                          </span>
                          <p className="text-neutral-300 leading-relaxed font-sans">
                            {spec.technicalNote}
                          </p>
                        </div>
                      </>
                    );
                  })()}
                </div>
              )}
            </div>

            {/* Preference Recording & Decision Log */}
            <div className="bg-neutral-900/40 border border-neutral-800 rounded-lg p-5 space-y-4">
              <div className="flex items-center gap-2">
                <ThumbsUp className="w-4 h-4 text-amber-400" />
                <h3 className="text-sm font-serif font-medium text-neutral-100">
                  Registro de Preferencia Visual [SIMULACIÓN DIDÁCTICA]
                </h3>
              </div>

              <div className="space-y-2">
                <label className="text-xs font-mono text-neutral-400 block">
                  Fundamento de la preferencia (criterio didáctico y estético sin afirmar autenticidad histórica):
                </label>
                <textarea
                  rows={2}
                  value={preferenceNote}
                  onChange={(e) => setPreferenceNote(e.target.value)}
                  placeholder="Explica qué aspecto de legibilidad o rigor didáctico justifica la preferencia..."
                  className="w-full bg-neutral-950 border border-neutral-800 rounded p-3 text-xs text-neutral-100 focus:outline-none focus:border-amber-500 font-sans"
                />
              </div>

              <button
                onClick={handleSavePreference}
                className="flex items-center gap-2 px-3.5 py-2 text-xs font-medium uppercase tracking-wider bg-neutral-800 hover:bg-neutral-700 text-neutral-200 rounded transition-colors"
              >
                <Check className="w-3.5 h-3.5 text-emerald-400" />
                <span>Registrar Selección en Expediente Demo</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Storyboard Mode */}
      {activeViewMode === 'storyboard' && (
        <div className="space-y-6">
          <div className="bg-neutral-900/40 border border-neutral-800 rounded-lg p-4 flex items-center justify-between">
            <div>
              <h3 className="text-base font-serif font-medium text-neutral-100">
                Storyboard Secuencial [DEMO_SYNTHETIC]
              </h3>
              <p className="text-xs text-neutral-400">
                Estructura de 4 viñetas didácticas con marcas permanentes de simulación.
              </p>
            </div>
            <span className="text-xs font-mono text-amber-500">4 Cuadros Sintéticos</span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {proposals.map((asset, idx) => (
              <div
                key={asset.id}
                className="bg-neutral-900/50 border border-neutral-800 rounded-lg overflow-hidden flex flex-col justify-between"
              >
                <div>
                  <div className="relative aspect-video bg-neutral-950 border-b border-neutral-800">
                    <img
                      src={asset.imageUrl}
                      alt={asset.title}
                      referrerPolicy="no-referrer"
                      className="w-full h-full object-cover"
                    />
                    <div className="absolute top-2 left-2 bg-neutral-950/80 px-2 py-0.5 rounded text-[10px] font-mono text-amber-400">
                      CUADRO {idx + 1}
                    </div>
                    <div className="absolute bottom-1 right-1 bg-neutral-950/90 text-[8px] font-mono text-neutral-400 px-1 rounded">
                      DEMO_SYNTHETIC
                    </div>
                  </div>
                  <div className="p-3 space-y-2">
                    <h4 className="text-xs font-semibold text-neutral-200 leading-snug">
                      {asset.title}
                    </h4>
                    <p className="text-[11px] text-neutral-400 line-clamp-3 leading-relaxed">
                      {asset.caption}
                    </p>
                  </div>
                </div>

                <div className="p-3 border-t border-neutral-800/80 text-[10px] font-mono text-neutral-500">
                  <span>Enfoque: {asset.technicalSpecs.optics}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Carousel Mode */}
      {activeViewMode === 'carousel' && (
        <div className="bg-neutral-900/40 border border-neutral-800 rounded-lg p-6 space-y-6">
          <div>
            <h3 className="text-base font-serif font-medium text-neutral-100">
              Carrusel Educativo para Redes (Formato 4:5 / 1:1)
            </h3>
            <p className="text-xs text-neutral-400 mt-0.5">
              Simulación de secuencia didáctica rotulada con la salvaguarda obligatoria DEMO_SYNTHETIC.
            </p>
          </div>

          <div className="flex gap-4 overflow-x-auto pb-4">
            {proposals.map((asset, idx) => (
              <div
                key={asset.id}
                className="w-64 shrink-0 bg-neutral-950 border border-neutral-800 rounded-lg p-4 flex flex-col justify-between space-y-3"
              >
                <div>
                  <div className="flex items-center justify-between text-[10px] font-mono text-neutral-500 mb-2">
                    <span>DIAPOSITIVA {idx + 1} DE {proposals.length}</span>
                    <span className="text-amber-500 font-bold">DEMO_SYNTHETIC</span>
                  </div>
                  <div className="aspect-square bg-neutral-900 rounded overflow-hidden mb-3 border border-neutral-800 relative">
                    <img
                      src={asset.imageUrl}
                      alt={asset.title}
                      referrerPolicy="no-referrer"
                      className="w-full h-full object-cover"
                    />
                    <div className="absolute top-1 left-1 bg-neutral-950/90 text-[8px] font-mono text-amber-400 px-1 rounded">
                      [SIMULACIÓN]
                    </div>
                  </div>
                  <h4 className="text-xs font-serif font-medium text-neutral-200 mb-1">
                    {asset.title}
                  </h4>
                  <p className="text-[11px] text-neutral-400 leading-relaxed">
                    {asset.caption}
                  </p>
                </div>
                <div className="pt-2 border-t border-neutral-900 text-[10px] font-mono text-neutral-600 truncate">
                  Ref: {asset.provenanceRecord}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Prompt & Technical Spec Generator Mode */}
      {activeViewMode === 'spec_generator' && (
        <div className="bg-neutral-900/40 border border-neutral-800 rounded-lg p-6 space-y-6">
          <div className="flex items-start justify-between gap-4">
            <div>
              <h3 className="text-base font-serif font-medium text-neutral-100">
                Generador de Prompts y Especificaciones Técnicas
              </h3>
              <p className="text-xs text-neutral-400 mt-0.5 max-w-2xl">
                Cuando falten activos o se preparen nuevas tomas, produce especificaciones y prompts editables. 
                <strong className="text-neutral-300"> Regla SFI: Nunca afirmar que un archivo fue generado cuando sólo existe una propuesta.</strong>
              </p>
            </div>
            <span className="text-xs font-mono uppercase tracking-wider text-amber-500 bg-amber-950/40 border border-amber-800/60 px-2 py-1 rounded">
              MODO ESPECIFICACIÓN EDITABLE
            </span>
          </div>

          <div className="space-y-4">
            <div>
              <label className="text-xs font-mono uppercase tracking-wider text-neutral-400 block mb-1">
                Prompt Técnico Editable para Activos Nuevos (DEMO_SYNTHETIC)
              </label>
              <textarea
                rows={4}
                value={editablePromptText}
                onChange={(e) => setEditablePromptText(e.target.value)}
                className="w-full bg-neutral-950 border border-neutral-800 rounded p-3 text-xs text-neutral-100 font-mono leading-relaxed focus:outline-none focus:border-amber-500"
              />
            </div>

            <div className="flex items-center justify-between">
              <span className="text-xs text-neutral-500">
                Formato recomendado: Aspecto 16:9 o 4:3 · Iluminación neutra · Sin estilos futuristas descontextualizados.
              </span>

              <button
                onClick={() => handleCopyPrompt(editablePromptText, 'spec-prompt')}
                className="flex items-center gap-2 px-3 py-1.5 text-xs font-mono uppercase tracking-wider bg-neutral-800 hover:bg-neutral-700 text-neutral-200 rounded transition-colors"
              >
                {copiedPromptId === 'spec-prompt' ? (
                  <>
                    <Check className="w-3.5 h-3.5 text-emerald-400" />
                    <span>Copiado</span>
                  </>
                ) : (
                  <>
                    <Copy className="w-3.5 h-3.5" />
                    <span>Copiar Prompt</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 3D Scene Mode (Three.js PBR Studio) */}
      {activeViewMode === 'scene3d' && (
        <div className="space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-neutral-800 pb-3">
            <div>
              <h3 className="text-base font-serif font-medium text-neutral-100 flex items-center gap-2">
                <Box className="w-4 h-4 text-amber-500" />
                <span>Escena 3D: Cámara Subterránea & Aparato A (Three.js PBR)</span>
              </h3>
              <p className="text-xs text-neutral-400 mt-0.5">
                Modelo procedural compuesto (mesa de roble, placa de fundición, trompeta de latón, escala milimétrica, tubos de vacío y péndulo 35.2 Hz).
              </p>
            </div>
            <span className="text-xs font-mono text-amber-500 bg-amber-950/40 border border-amber-800/60 px-2 py-1 rounded">
              PROCEDENCIA: DEMO_SYNTHETIC
            </span>
          </div>

          <ThreeSubterraneanChamber onCaptureSnapshot={handleCaptureSnapshot} />
        </div>
      )}

      {/* Image AI Studio Mode (gemini-nano-banana-2.1) */}
      {activeViewMode === 'image_ai' && (
        <ImageStudioNanoBanana
          currentProposals={proposals}
          onAddProposal={handleAddAiProposal}
        />
      )}

      {/* Interactive Image Layer Editor (Select / Move / Swap / Delete + AI & Upload) */}
      {activeViewMode === 'editor_capas' && (
        <ImageLayerInteractiveEditor
          proposals={proposals}
          onAddProposal={handleAddAiProposal}
        />
      )}
    </div>
  );
};
