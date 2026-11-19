/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * 
 * MÓDULO 2: HISTORIA Y RECONSTRUCCIÓN CREATIVA
 * Línea temporal epistemológica interactiva que distingue con rigor:
 * Hechos observados, Decisiones documentadas, Inferencias, Hipótesis,
 * Reconstrucciones creativas y Ausencia de evidencia.
 * Todo dato ficticio porta procedencia inalterable DEMO_SYNTHETIC.
 */

import React, { useState } from 'react';
import { EpistemicTimelineEvent, EpistemicCategory, EpistemicStatusType, CertaintyLevel } from '../types';
import { SearchGroundingPanel } from './SearchGroundingPanel';
import { AudioTranscriberMic } from './AudioTranscriberMic';
import { 
  History, 
  HelpCircle, 
  FileCheck, 
  Compass, 
  Lightbulb, 
  Palette, 
  AlertOctagon, 
  Plus, 
  Filter,
  EyeOff,
  ShieldCheck,
  Tag,
  Globe
} from 'lucide-react';

interface ModuleTimelineProps {
  events: EpistemicTimelineEvent[];
  onAddEvent: (event: EpistemicTimelineEvent) => void;
}

const CATEGORY_CONFIG: Record<
  EpistemicCategory,
  { label: string; description: string; color: string; border: string; bg: string; icon: React.FC<{ className?: string }> }
> = {
  hecho_observado: {
    label: 'Hecho Observado',
    description: 'En este caso demo: Hecho hipotético en el modelo teórico.',
    color: 'text-emerald-400',
    border: 'border-emerald-600/40',
    bg: 'bg-emerald-950/20',
    icon: FileCheck,
  },
  decision_documentada: {
    label: 'Decisión Documentada',
    description: 'Resolución simulada en actas ficticias del modelo de laboratorio.',
    color: 'text-blue-400',
    border: 'border-blue-600/40',
    bg: 'bg-blue-950/20',
    icon: Compass,
  },
  inferencia: {
    label: 'Inferencia',
    description: 'Deducción lógica a partir de indicios materiales simulados.',
    color: 'text-amber-400',
    border: 'border-amber-600/40',
    bg: 'bg-amber-950/20',
    icon: HelpCircle,
  },
  hipotesis: {
    label: 'Hipótesis',
    description: 'Proposición teórica formulada para ser sometida a contrastación o falsación.',
    color: 'text-indigo-400',
    border: 'border-indigo-600/40',
    bg: 'bg-indigo-950/20',
    icon: Lightbulb,
  },
  reconstruccion_creativa: {
    label: 'Reconstrucción Creativa',
    description: 'Modelo visual o sonoro con fines de divulgación; NO constituye evidencia histórica.',
    color: 'text-purple-400',
    border: 'border-purple-600/40',
    bg: 'bg-purple-950/20',
    icon: Palette,
  },
  ausencia_de_evidencia: {
    label: 'Ausencia de Evidencia',
    description: 'Período o aspecto sin registros conservados; el vacío se declara formalmente.',
    color: 'text-rose-400',
    border: 'border-rose-600/40',
    bg: 'bg-rose-950/20',
    icon: EyeOff,
  },
};

const EPISTEMIC_NATURE_BADGES: Record<EpistemicStatusType, { label: string; color: string }> = {
  OBJETIVO: { label: 'OBJETIVO', color: 'text-blue-400 border-blue-800 bg-blue-950/40' },
  HIPOTESIS: { label: 'HIPÓTESIS', color: 'text-amber-400 border-amber-800 bg-amber-950/40' },
  SIMULACION: { label: 'SIMULACIÓN', color: 'text-purple-400 border-purple-800 bg-purple-950/40' },
  RESULTADO_OBSERVADO: { label: 'RESULTADO OBSERVADO', color: 'text-emerald-400 border-emerald-800 bg-emerald-950/40' },
};

export const ModuleTimeline: React.FC<ModuleTimelineProps> = ({ events, onAddEvent }) => {
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [showAddModal, setShowAddModal] = useState(false);
  const [showSearchGrounding, setShowSearchGrounding] = useState(false);

  // Form State
  const [newEventYear, setNewEventYear] = useState('');
  const [newEventTitle, setNewEventTitle] = useState('');
  const [newEventDesc, setNewEventDesc] = useState('');
  const [newEventCat, setNewEventCat] = useState<EpistemicCategory>('reconstruccion_creativa');
  const [newEventNature, setNewEventNature] = useState<EpistemicStatusType>('SIMULACION');
  const [newEventShift, setNewEventShift] = useState('');
  const [newEventContradiction, setNewEventContradiction] = useState('');
  const [newEventSource, setNewEventSource] = useState('');

  const filteredEvents = events.filter((ev) => {
    if (selectedCategory === 'all') return true;
    return ev.epistemicCategory === selectedCategory;
  });

  const handleCreateEvent = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newEventYear || !newEventTitle || !newEventDesc) return;

    const event: EpistemicTimelineEvent = {
      id: `tl-${Date.now()}`,
      year: newEventYear,
      title: newEventTitle,
      description: newEventDesc,
      epistemicCategory: newEventCat,
      epistemicNature: newEventNature,
      provenance: 'DEMO_SYNTHETIC',
      isCreativeRecreation: newEventCat === 'reconstruccion_creativa' || newEventNature === 'SIMULACION',
      transitionOrIdentityShift: newEventShift || undefined,
      contradictoryNote: newEventContradiction || undefined,
      primarySources: newEventSource ? [newEventSource] : ['DEMO-REF-MANUAL-SFI-CC'],
      certaintyLevel:
        newEventCat === 'ausencia_de_evidencia'
          ? 'vacio_critico_declarado'
          : newEventCat === 'reconstruccion_creativa'
          ? 'propuesta_creativa_demo'
          : 'simulacion_teorica_demo',
    };

    onAddEvent(event);
    setShowAddModal(false);
    // Reset
    setNewEventYear('');
    setNewEventTitle('');
    setNewEventDesc('');
    setNewEventShift('');
    setNewEventContradiction('');
    setNewEventSource('');
  };

  const handleAddSourceFromSearch = (title: string, url: string) => {
    setNewEventSource(`${title} (${url})`);
    setShowAddModal(true);
  };

  return (
    <div className="space-y-8 max-w-6xl mx-auto py-6">
      {/* Module Header */}
      <div className="border-b border-neutral-800 pb-6 flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <span className="text-xs font-mono uppercase tracking-widest text-amber-500/90 block mb-1">
            Módulo 2 — Línea Temporal Epistemológica
          </span>
          <h1 className="text-2xl md:text-3xl font-serif text-neutral-100">
            Historia y Reconstrucción Creativa
          </h1>
          <p className="text-sm text-neutral-400 mt-1 max-w-3xl">
            Distingue de forma inequívoca hechos modelados, hipótesis, decisiones e inferencias. 
            <strong className="text-neutral-200"> Todos los hitos ficticios portan procedencia DEMO_SYNTHETIC y niveles de certeza que impiden confundir recreaciones con hechos históricos.</strong>
          </p>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <button
            onClick={() => setShowSearchGrounding(!showSearchGrounding)}
            className={`flex items-center gap-2 px-3.5 py-2 text-xs font-medium tracking-wide uppercase rounded border transition-colors ${
              showSearchGrounding
                ? 'bg-blue-950/70 border-blue-600 text-blue-200 font-semibold'
                : 'bg-neutral-900 border-neutral-800 text-neutral-300 hover:text-neutral-100'
            }`}
          >
            <Globe className="w-3.5 h-3.5 text-blue-400" />
            <span>{showSearchGrounding ? 'Ocultar Grounding' : 'Grounding Web (Google Search)'}</span>
          </button>

          <button
            onClick={() => setShowAddModal(true)}
            className="flex items-center gap-2 px-3.5 py-2 text-xs font-medium tracking-wide uppercase bg-neutral-800 hover:bg-neutral-700 text-neutral-100 rounded transition-colors shrink-0"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Añadir Hito (DEMO_SYNTHETIC)</span>
          </button>
        </div>
      </div>

      {/* Optional Google Search Grounding Panel */}
      {showSearchGrounding && (
        <SearchGroundingPanel onAddAsSource={handleAddSourceFromSearch} />
      )}

      {/* Epistemic Category Taxonomy Ribbon */}
      <div className="bg-neutral-900/40 border border-neutral-800 rounded-lg p-4 space-y-3">
        <div className="flex items-center justify-between">
          <span className="text-xs font-mono uppercase tracking-wider text-neutral-400 flex items-center gap-1.5">
            <Filter className="w-3.5 h-3.5 text-amber-500" />
            <span>Filtro por Criterio Epistemológico</span>
          </span>
          <span className="text-xs text-neutral-500 font-mono">
            Mostrando {filteredEvents.length} de {events.length} hitos (todos DEMO_SYNTHETIC)
          </span>
        </div>

        <div className="flex flex-wrap gap-2">
          <button
            onClick={() => setSelectedCategory('all')}
            className={`px-3 py-1.5 text-xs font-mono uppercase tracking-wider rounded border transition-colors ${
              selectedCategory === 'all'
                ? 'bg-neutral-100 text-neutral-950 font-semibold border-neutral-100'
                : 'bg-neutral-900 border-neutral-800 text-neutral-400 hover:text-neutral-200'
            }`}
          >
            Todos ({events.length})
          </button>

          {(Object.keys(CATEGORY_CONFIG) as EpistemicCategory[]).map((cat) => {
            const cfg = CATEGORY_CONFIG[cat];
            const count = events.filter((e) => e.epistemicCategory === cat).length;
            const Icon = cfg.icon;
            const isActive = selectedCategory === cat;

            return (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-mono uppercase tracking-wider rounded border transition-colors ${
                  isActive
                    ? `${cfg.bg} ${cfg.border} ${cfg.color} font-semibold`
                    : 'bg-neutral-900 border-neutral-800 text-neutral-400 hover:text-neutral-200'
                }`}
              >
                <Icon className="w-3.5 h-3.5" />
                <span>{cfg.label}</span>
                <span className="opacity-60 text-[10px]">({count})</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Visual Timeline Stream */}
      <div className="relative pl-6 sm:pl-8 border-l border-neutral-800 space-y-8 my-8">
        {filteredEvents.map((ev) => {
          const cfg = CATEGORY_CONFIG[ev.epistemicCategory];
          const Icon = cfg.icon;
          const natureBadge = EPISTEMIC_NATURE_BADGES[ev.epistemicNature];

          return (
            <div key={ev.id} className="relative group">
              {/* Timeline Node Point */}
              <div
                className={`absolute -left-[31px] sm:-left-[39px] top-1.5 w-5 h-5 rounded-full border-2 bg-neutral-950 flex items-center justify-center ${cfg.border}`}
              >
                <div className={`w-2 h-2 rounded-full ${cfg.color.replace('text-', 'bg-')}`} />
              </div>

              {/* Event Card */}
              <div
                className={`rounded-lg border p-5 transition-all ${cfg.bg} ${cfg.border} space-y-3`}
              >
                {/* Header Row: Year, Category Label, Status */}
                <div className="flex flex-wrap items-center justify-between gap-2 border-b border-neutral-800/80 pb-2.5">
                  <div className="flex items-center gap-3">
                    <span className="text-base font-serif font-bold text-neutral-100 tracking-wider">
                      {ev.year}
                    </span>
                    {ev.exactDate && (
                      <span className="text-xs font-mono text-neutral-500">
                        [{ev.exactDate}]
                      </span>
                    )}
                    <span className="text-neutral-600">·</span>
                    <span className={`text-xs font-mono uppercase tracking-wider flex items-center gap-1 ${cfg.color}`}>
                      <Icon className="w-3.5 h-3.5" />
                      <span>{cfg.label}</span>
                    </span>
                  </div>

                  <div className="flex items-center gap-2">
                    <span className="text-[10px] font-mono tracking-widest uppercase bg-amber-950/60 text-amber-300 border border-amber-800/60 px-2 py-0.5 rounded">
                      DEMO_SYNTHETIC
                    </span>
                    <span className={`text-[10px] font-mono tracking-widest uppercase px-2 py-0.5 rounded border ${natureBadge.color}`}>
                      [{natureBadge.label}]
                    </span>
                  </div>
                </div>

                {/* Title & Description */}
                <div>
                  <h3 className="text-lg font-serif font-medium text-neutral-100">
                    {ev.title}
                  </h3>
                  <p className="text-sm text-neutral-300 leading-relaxed mt-1">
                    {ev.description}
                  </p>
                </div>

                {/* Identity Shift / Transition Alert */}
                {ev.transitionOrIdentityShift && (
                  <div className="bg-neutral-950/80 border border-amber-800/40 rounded p-2.5 text-xs text-amber-200/90 flex items-start gap-2">
                    <Compass className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
                    <div>
                      <span className="font-semibold block">TRANSICIÓN / CAMBIO DE ENFOQUE TEÓRICO:</span>
                      <span>{ev.transitionOrIdentityShift}</span>
                    </div>
                  </div>
                )}

                {/* Contradiction / Conflict Note */}
                {ev.contradictoryNote && (
                  <div className="bg-rose-950/30 border border-rose-900/40 rounded p-2.5 text-xs text-rose-200/90 flex items-start gap-2">
                    <AlertOctagon className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
                    <div>
                      <span className="font-semibold block">DECLARACIÓN DE VACÍO / LÍMITE DOCUMENTAL:</span>
                      <span>{ev.contradictoryNote}</span>
                    </div>
                  </div>
                )}

                {/* Sources Footer */}
                <div className="flex flex-wrap items-center justify-between text-xs text-neutral-500 pt-2 border-t border-neutral-800/60 font-mono">
                  <div className="flex items-center gap-1.5">
                    <span>Referencias simuladas:</span>
                    {ev.primarySources.map((s, i) => (
                      <span key={i} className="text-neutral-400 bg-neutral-950 px-1.5 py-0.5 rounded border border-neutral-800">
                        {s}
                      </span>
                    ))}
                  </div>

                  <span className="text-[11px] text-neutral-400 font-mono">
                    Nivel de certeza: <strong className="text-amber-400/90">{ev.certaintyLevel.replace(/_/g, ' ')}</strong>
                  </span>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Add Timeline Event Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 bg-neutral-950/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-neutral-900 border border-neutral-800 rounded-lg max-w-xl w-full p-6 space-y-4 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-neutral-800 pb-3">
              <h2 className="text-lg font-serif text-neutral-100">
                Añadir Hito a la Línea Temporal (DEMO_SYNTHETIC)
              </h2>
              <button
                onClick={() => setShowAddModal(false)}
                className="text-neutral-500 hover:text-neutral-300 text-sm"
              >
                Cerrar
              </button>
            </div>

            <form onSubmit={handleCreateEvent} className="space-y-4 text-xs">
              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="text-neutral-400 font-mono block mb-1">Año / Fecha</label>
                  <input
                    type="text"
                    required
                    placeholder="Ej. 1942"
                    value={newEventYear}
                    onChange={(e) => setNewEventYear(e.target.value)}
                    className="w-full bg-neutral-950 border border-neutral-700 rounded px-3 py-2 text-neutral-100"
                  />
                </div>
                <div>
                  <label className="text-neutral-400 font-mono block mb-1">Categoría</label>
                  <select
                    value={newEventCat}
                    onChange={(e) => setNewEventCat(e.target.value as EpistemicCategory)}
                    className="w-full bg-neutral-950 border border-neutral-700 rounded px-3 py-2 text-neutral-100"
                  >
                    {(Object.keys(CATEGORY_CONFIG) as EpistemicCategory[]).map((c) => (
                      <option key={c} value={c}>
                        {CATEGORY_CONFIG[c].label}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="text-neutral-400 font-mono block mb-1">Naturaleza Epistémica</label>
                  <select
                    value={newEventNature}
                    onChange={(e) => setNewEventNature(e.target.value as EpistemicStatusType)}
                    className="w-full bg-neutral-950 border border-neutral-700 rounded px-3 py-2 text-neutral-100"
                  >
                    <option value="SIMULACION">SIMULACIÓN</option>
                    <option value="HIPOTESIS">HIPÓTESIS</option>
                    <option value="OBJETIVO">OBJETIVO</option>
                    <option value="RESULTADO_OBSERVADO">RESULTADO OBSERVADO</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="text-neutral-400 font-mono block mb-1">Título del Hito Simulado</label>
                <input
                  type="text"
                  required
                  placeholder="Ej. Modelo de desacoplamiento por amortiguación activa"
                  value={newEventTitle}
                  onChange={(e) => setNewEventTitle(e.target.value)}
                  className="w-full bg-neutral-950 border border-neutral-700 rounded px-3 py-2 text-neutral-100"
                />
              </div>

              <div>
                <label className="text-neutral-400 font-mono block mb-1">Descripción</label>
                <textarea
                  rows={3}
                  required
                  placeholder="Detallar lo modelado en la simulación..."
                  value={newEventDesc}
                  onChange={(e) => setNewEventDesc(e.target.value)}
                  className="w-full bg-neutral-950 border border-neutral-700 rounded px-3 py-2 text-neutral-100"
                />
                <div className="mt-2">
                  <AudioTranscriberMic
                    targetLabel="Descripción del Hito"
                    onInsertTranscript={(transcriptText) =>
                      setNewEventDesc((prev) => (prev ? `${prev} ${transcriptText}` : transcriptText))
                    }
                  />
                </div>
              </div>

              <div>
                <label className="text-neutral-400 font-mono block mb-1">Referencia Ficticia</label>
                <input
                  type="text"
                  placeholder="Ej. DEMO-REF-1942-MOD"
                  value={newEventSource}
                  onChange={(e) => setNewEventSource(e.target.value)}
                  className="w-full bg-neutral-950 border border-neutral-700 rounded px-3 py-2 text-neutral-100"
                />
              </div>

              <div className="pt-3 border-t border-neutral-800 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-4 py-2 bg-neutral-800 text-neutral-300 rounded hover:bg-neutral-700"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-amber-500 text-neutral-950 font-medium rounded hover:bg-amber-400"
                >
                  Guardar Hito (DEMO_SYNTHETIC)
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
