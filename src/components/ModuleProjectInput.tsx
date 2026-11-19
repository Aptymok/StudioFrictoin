/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * 
 * MÓDULO 1: ENTRADA DE PROYECTOS
 * Permite recibir y parametrizar el contexto documental, fuentes verificables,
 * materiales autorizados, restricciones e hipótesis creativas.
 * Distingue inequívocamente: OBJETIVO | HIPÓTESIS | SIMULACIÓN | RESULTADO OBSERVADO.
 * Todos los registros de demostración tienen procedencia obligatoria DEMO_SYNTHETIC.
 */

import React, { useState } from 'react';
import { ProjectData, VerifiableSource, PlatformFormat, EpistemicStatusType } from '../types';
import { 
  FileText, 
  ShieldAlert, 
  CheckCircle2, 
  Plus, 
  Layers, 
  Target, 
  Info,
  RotateCcw,
  Lock,
  Tag
} from 'lucide-react';

interface ModuleProjectInputProps {
  project: ProjectData;
  onUpdateProject: (updated: ProjectData) => void;
  onResetDemo: () => void;
}

const EPISTEMIC_BADGES: Record<EpistemicStatusType, { label: string; bg: string; text: string; border: string }> = {
  OBJETIVO: {
    label: 'OBJETIVO',
    bg: 'bg-blue-950/40',
    text: 'text-blue-300',
    border: 'border-blue-800/60',
  },
  HIPOTESIS: {
    label: 'HIPÓTESIS',
    bg: 'bg-amber-950/40',
    text: 'text-amber-300',
    border: 'border-amber-800/60',
  },
  SIMULACION: {
    label: 'SIMULACIÓN',
    bg: 'bg-purple-950/40',
    text: 'text-purple-300',
    border: 'border-purple-800/60',
  },
  RESULTADO_OBSERVADO: {
    label: 'RESULTADO OBSERVADO',
    bg: 'bg-emerald-950/40',
    text: 'text-emerald-300',
    border: 'border-emerald-800/60',
  },
};

export const ModuleProjectInput: React.FC<ModuleProjectInputProps> = ({
  project,
  onUpdateProject,
  onResetDemo,
}) => {
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState<ProjectData>(project);
  const [newSourceTitle, setNewSourceTitle] = useState('');
  const [newSourceRef, setNewSourceRef] = useState('');
  const [newSourceCustodian, setNewSourceCustodian] = useState('');
  const [newSourceNature, setNewSourceNature] = useState<EpistemicStatusType>('SIMULACION');

  const handleSave = () => {
    onUpdateProject(formData);
    setIsEditing(false);
  };

  const handleAddSource = () => {
    if (!newSourceTitle || !newSourceRef) return;
    const newSource: VerifiableSource = {
      id: `src-${Date.now()}`,
      title: newSourceTitle,
      archiveReference: newSourceRef,
      year: new Date().getFullYear(),
      custodian: newSourceCustodian || 'Fondo de Demostración Didáctica SFI-CC',
      institutionalVerification: 'DEMO_SYNTHETIC',
      provenance: 'DEMO_SYNTHETIC',
      epistemicNature: newSourceNature,
      accessStatus: 'simulacion_demo',
      sourceQuote: 'Documento ficticio incorporado para análisis creativo complementario.',
    };
    const updated = {
      ...formData,
      verifiableSources: [...formData.verifiableSources, newSource],
    };
    setFormData(updated);
    onUpdateProject(updated);
    setNewSourceTitle('');
    setNewSourceRef('');
    setNewSourceCustodian('');
  };

  const togglePlatform = (p: PlatformFormat) => {
    const current = formData.targetPlatforms;
    const next = current.includes(p) ? current.filter((x) => x !== p) : [...current, p];
    const updated = { ...formData, targetPlatforms: next };
    setFormData(updated);
    onUpdateProject(updated);
  };

  return (
    <div className="space-y-8 max-w-6xl mx-auto py-6">
      {/* Module Title & Institutional Notice */}
      <div className="border-b border-neutral-800 pb-6 flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <span className="text-xs font-mono uppercase tracking-widest text-amber-500/90 block mb-1">
            Módulo 1 — Recepción & Parametrización
          </span>
          <h1 className="text-2xl md:text-3xl font-serif text-neutral-100">
            Entrada de Proyecto y Procedencia Estricta
          </h1>
          <p className="text-sm text-neutral-400 mt-1 max-w-3xl">
            Registra los antecedentes del caso. 
            <strong className="text-neutral-200"> Todos los registros ficticios poseen procedencia DEMO_SYNTHETIC </strong> 
            y diferencian inequívocamente Objetivos, Hipótesis, Simulaciones y Resultados Observados.
          </p>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <button
            onClick={onResetDemo}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs text-neutral-400 hover:text-neutral-200 border border-neutral-800 rounded hover:bg-neutral-900 transition-colors"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Restaurar DEMO</span>
          </button>
          <button
            onClick={() => setIsEditing(!isEditing)}
            className="px-3.5 py-1.5 text-xs font-medium tracking-wide uppercase bg-neutral-800 hover:bg-neutral-700 text-neutral-100 rounded transition-colors"
          >
            {isEditing ? 'Cerrar Edición' : 'Editar Parámetros'}
          </button>
        </div>
      </div>

      {/* Mandatory DEMO_SYNTHETIC Banner */}
      <div className="bg-amber-950/20 border-2 border-amber-600/60 rounded-lg p-4 flex items-start gap-3 text-amber-200/90 text-xs">
        <Info className="w-4 h-4 shrink-0 text-amber-400 mt-0.5" />
        <div className="space-y-1">
          <span className="font-semibold block text-amber-300 font-mono tracking-wider">
            SALVAGUARDA DE PROCEDENCIA DEMO_SYNTHETIC:
          </span>
          <p>
            Ningún documento, imagen o medición de este caso pertenece al archivo canónico real de SFI. 
            Se prohíbe auto-atribuir derechos, licencias de dominio público o dictámenes FAD. 
            Todos los elementos conservan su procedencia <strong className="font-mono text-amber-400">DEMO_SYNTHETIC</strong> inalterable.
          </p>
        </div>
      </div>

      {/* Epistemic Status Ribbon */}
      <div className="bg-neutral-900/50 border border-neutral-800 rounded-lg p-3 flex flex-wrap items-center justify-between gap-3 text-xs">
        <div className="flex items-center gap-2 text-neutral-400 font-mono">
          <Tag className="w-3.5 h-3.5 text-amber-500" />
          <span>Taxonomía Epistemológica Activa:</span>
        </div>
        <div className="flex flex-wrap gap-2">
          {(Object.keys(EPISTEMIC_BADGES) as EpistemicStatusType[]).map((type) => {
            const b = EPISTEMIC_BADGES[type];
            return (
              <span
                key={type}
                className={`px-2 py-0.5 rounded border text-[10px] font-mono tracking-wider uppercase ${b.bg} ${b.text} ${b.border}`}
              >
                {b.label}
              </span>
            );
          })}
        </div>
      </div>

      {/* Core Project Metadata Card */}
      <div className="bg-neutral-900/40 border border-neutral-800/80 rounded-lg p-6 space-y-6">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-4">
            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="text-xs uppercase font-mono tracking-wider text-neutral-500">
                  Nombre del Proyecto
                </label>
                <span className="text-[10px] font-mono px-1.5 py-0.5 bg-neutral-950 border border-amber-800/50 text-amber-400 rounded">
                  PROCEDENCIA: DEMO_SYNTHETIC
                </span>
              </div>
              {isEditing ? (
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full bg-neutral-950 border border-neutral-700 rounded px-3 py-2 text-sm text-neutral-100 focus:outline-none focus:border-amber-500"
                />
              ) : (
                <h2 className="text-xl font-serif text-neutral-100">{formData.name}</h2>
              )}
            </div>

            <div>
              <label className="text-xs uppercase font-mono tracking-wider text-neutral-500 block mb-1">
                Objetivo Central (Diferenciado como OBJETIVO)
              </label>
              {isEditing ? (
                <textarea
                  rows={3}
                  value={formData.objective}
                  onChange={(e) => setFormData({ ...formData, objective: e.target.value })}
                  className="w-full bg-neutral-950 border border-neutral-700 rounded px-3 py-2 text-sm text-neutral-100 focus:outline-none focus:border-amber-500"
                />
              ) : (
                <p className="text-sm text-neutral-300 leading-relaxed font-sans">{formData.objective}</p>
              )}
            </div>

            <div>
              <label className="text-xs uppercase font-mono tracking-wider text-neutral-500 block mb-1">
                Resumen Histórico y Contextual (Diferenciado como SIMULACIÓN)
              </label>
              {isEditing ? (
                <textarea
                  rows={3}
                  value={formData.historicalSummary}
                  onChange={(e) => setFormData({ ...formData, historicalSummary: e.target.value })}
                  className="w-full bg-neutral-950 border border-neutral-700 rounded px-3 py-2 text-sm text-neutral-100 focus:outline-none focus:border-amber-500"
                />
              ) : (
                <p className="text-sm text-neutral-400 leading-relaxed">{formData.historicalSummary}</p>
              )}
            </div>
          </div>

          {/* Code, Identity & Measurable Goal */}
          <div className="space-y-4 border-t lg:border-t-0 lg:border-l border-neutral-800/80 lg:pl-6">
            <div>
              <span className="text-xs font-mono uppercase tracking-wider text-neutral-500 block">
                Código de Expediente
              </span>
              <span className="text-sm font-mono text-amber-400 mt-1 block">
                {formData.code}
              </span>
            </div>

            <div>
              <span className="text-xs font-mono uppercase tracking-wider text-neutral-500 block mb-2">
                Paleta de Identidad Visual
              </span>
              <div className="flex items-center gap-2">
                {formData.visualIdentity.palette.map((color, idx) => (
                  <div
                    key={idx}
                    className="w-7 h-7 rounded border border-neutral-700 flex items-center justify-center text-[9px] font-mono"
                    style={{ backgroundColor: color }}
                    title={color}
                  />
                ))}
              </div>
              <p className="text-xs text-neutral-400 mt-2 italic">
                {formData.visualIdentity.stylisticTone}
              </p>
            </div>

            <div className="bg-neutral-950/70 border border-neutral-800/80 rounded p-3 text-xs space-y-1.5">
              <span className="font-semibold text-neutral-300 flex items-center gap-1.5">
                <Target className="w-3.5 h-3.5 text-blue-400" />
                <span>Metas Aspiracionales (OBJETIVOS NO MEDIDOS):</span>
              </span>
              <p className="text-neutral-400 leading-normal font-sans">{formData.measurableGoal}</p>
            </div>

            {isEditing && (
              <button
                onClick={handleSave}
                className="w-full py-2 bg-amber-500 hover:bg-amber-400 text-neutral-950 font-medium text-xs rounded transition-colors"
              >
                Guardar Modificaciones
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Verifiable Sources Section */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <FileText className="w-4 h-4 text-amber-400" />
            <h3 className="text-base font-serif font-medium text-neutral-100">
              Fuentes Documentales Catalogadas
            </h3>
            <span className="text-xs font-mono text-neutral-500">
              ({formData.verifiableSources.length} con procedencia DEMO_SYNTHETIC)
            </span>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {formData.verifiableSources.map((source) => {
            const badge = EPISTEMIC_BADGES[source.epistemicNature];
            return (
              <div
                key={source.id}
                className="bg-neutral-900/30 border border-neutral-800 rounded p-4 space-y-2 hover:border-neutral-700 transition-colors"
              >
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <span className="text-[11px] font-mono text-amber-500 block">
                      {source.archiveReference} · {source.year}
                    </span>
                    <h4 className="text-sm font-medium text-neutral-200 mt-0.5">
                      {source.title}
                    </h4>
                  </div>
                  <div className="flex flex-col items-end gap-1">
                    <span className="text-[10px] font-mono tracking-wider px-1.5 py-0.5 rounded border border-amber-900/60 bg-amber-950/40 text-amber-400">
                      DEMO_SYNTHETIC
                    </span>
                    <span className={`text-[9px] font-mono px-1 py-0.2 rounded border ${badge.border} ${badge.bg} ${badge.text}`}>
                      [{badge.label}]
                    </span>
                  </div>
                </div>

                <p className="text-xs text-neutral-400 italic">
                  Custodio referencial: {source.custodian}
                </p>

                {source.sourceQuote && (
                  <div className="bg-neutral-950/80 rounded p-2.5 text-xs text-neutral-300 font-serif border-l-2 border-amber-600/60">
                    «{source.sourceQuote}»
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {/* Add Source Input Bar */}
        <div className="bg-neutral-950/60 border border-dashed border-neutral-800 rounded-lg p-4 space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-mono uppercase tracking-wider text-neutral-400 block">
              Incorporar Nuevo Registro a la Biblioteca de Casos
            </span>
            <span className="text-[10px] font-mono text-amber-500">
              Procedencia automática: DEMO_SYNTHETIC
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-4 gap-2">
            <input
              type="text"
              placeholder="Título del documento..."
              value={newSourceTitle}
              onChange={(e) => setNewSourceTitle(e.target.value)}
              className="bg-neutral-900 border border-neutral-700 text-xs px-3 py-2 rounded text-neutral-100 placeholder:text-neutral-600 sm:col-span-2"
            />
            <input
              type="text"
              placeholder="Signatura / Referencia..."
              value={newSourceRef}
              onChange={(e) => setNewSourceRef(e.target.value)}
              className="bg-neutral-900 border border-neutral-700 text-xs px-3 py-2 rounded text-neutral-100 placeholder:text-neutral-600"
            />
            <select
              value={newSourceNature}
              onChange={(e) => setNewSourceNature(e.target.value as EpistemicStatusType)}
              className="bg-neutral-900 border border-neutral-700 text-xs px-3 py-2 rounded text-neutral-100"
            >
              <option value="SIMULACION">SIMULACIÓN</option>
              <option value="HIPOTESIS">HIPÓTESIS</option>
              <option value="OBJETIVO">OBJETIVO</option>
              <option value="RESULTADO_OBSERVADO">RESULTADO OBSERVADO</option>
            </select>
          </div>

          <button
            onClick={handleAddSource}
            disabled={!newSourceTitle || !newSourceRef}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-neutral-800 hover:bg-neutral-700 disabled:opacity-50 text-neutral-200 text-xs rounded transition-colors"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Añadir Fuente (DEMO_SYNTHETIC)</span>
          </button>
        </div>
      </div>

      {/* Target Platforms, Audience & Strict Restrictions */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Platforms & Target Audience */}
        <div className="bg-neutral-900/30 border border-neutral-800 rounded p-5 space-y-4">
          <h3 className="text-sm font-serif font-medium text-neutral-100 flex items-center gap-2">
            <Layers className="w-4 h-4 text-amber-400" />
            <span>Plataformas de Destino & Audiencias</span>
          </h3>

          <div>
            <span className="text-xs font-mono uppercase tracking-wider text-neutral-500 block mb-2">
              Plataformas Seleccionadas (Conmutar)
            </span>
            <div className="flex flex-wrap gap-2">
              {(['instagram', 'tiktok', 'youtube', 'facebook', 'linkedin', 'web'] as PlatformFormat[]).map(
                (p) => {
                  const active = formData.targetPlatforms.includes(p);
                  return (
                    <button
                      key={p}
                      onClick={() => togglePlatform(p)}
                      className={`px-2.5 py-1 text-xs font-mono uppercase tracking-wider rounded border transition-colors ${
                        active
                          ? 'bg-amber-950/40 border-amber-600 text-amber-200'
                          : 'bg-neutral-900 border-neutral-800 text-neutral-500 hover:text-neutral-300'
                      }`}
                    >
                      {p}
                    </button>
                  );
                }
              )}
            </div>
          </div>

          <div>
            <span className="text-xs font-mono uppercase tracking-wider text-neutral-500 block mb-2">
              Público Objetivo Catalogado
            </span>
            <ul className="space-y-1.5 text-xs text-neutral-300">
              {formData.targetAudiences.map((aud, i) => (
                <li key={i} className="flex items-start gap-2">
                  <span className="text-amber-500 font-mono mt-0.5">·</span>
                  <span>{aud}</span>
                </li>
              ))}
            </ul>
          </div>

          <div className="pt-2 border-t border-neutral-800">
            <span className="text-xs font-mono uppercase tracking-wider text-amber-500 block mb-1">
              Hipótesis Creativa Inicial (Diferenciada como HIPÓTESIS)
            </span>
            <p className="text-xs text-neutral-300 leading-relaxed italic">
              «{formData.creativeHypothesis}»
            </p>
          </div>
        </div>

        {/* Fundamental Restrictions Card */}
        <div className="bg-neutral-900/30 border border-neutral-800 rounded p-5 space-y-4">
          <h3 className="text-sm font-serif font-medium text-neutral-100 flex items-center gap-2">
            <ShieldAlert className="w-4 h-4 text-amber-500" />
            <span>Salvaguardas Epistemológicas Activas</span>
          </h3>

          <div className="space-y-2.5">
            {formData.restrictions.map((rst, idx) => (
              <div
                key={idx}
                className="bg-neutral-950/70 border border-neutral-800/80 rounded p-3 text-xs flex items-start gap-2 text-neutral-300"
              >
                <CheckCircle2 className="w-3.5 h-3.5 text-amber-500 shrink-0 mt-0.5" />
                <span className="leading-relaxed">{rst}</span>
              </div>
            ))}
          </div>

          <div className="text-[11px] text-neutral-500 pt-2 border-t border-neutral-800 font-mono flex items-center gap-1.5">
            <Lock className="w-3.5 h-3.5 text-emerald-400" />
            <span>Validador epistemológico activo: Se bloquea la exportación de activos que omitan DEMO_SYNTHETIC.</span>
          </div>
        </div>
      </div>
    </div>
  );
};
