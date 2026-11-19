/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * 
 * MÓDULO 6: COMPARADOR DE VERSIONES
 * Muestra dos versiones creativas lado a lado y desglosa:
 * - Qué se mantiene
 * - Qué cambió
 * - Qué evidencia motivó el cambio (distinguiendo HIPÓTESIS de RESULTADO OBSERVADO)
 * - Qué se espera comprobar (OBJETIVO)
 * - Qué resultado invalidaría la nueva hipótesis (CRITERIO DE FALSACIÓN)
 * Prohibido emplear porcentajes de éxito predictivo sin modelos contrastados.
 */

import React, { useState } from 'react';
import { VersionComparisonData } from '../types';
import { 
  GitCompare, 
  Check, 
  RefreshCw, 
  Flame, 
  ThumbsUp, 
  AlertTriangle
} from 'lucide-react';

interface ModuleVersionComparatorProps {
  comparisons: VersionComparisonData[];
  onUpdateComparison: (updated: VersionComparisonData) => void;
}

export const ModuleVersionComparator: React.FC<ModuleVersionComparatorProps> = ({
  comparisons,
  onUpdateComparison,
}) => {
  const [selectedCompId, setSelectedCompId] = useState<string>(comparisons[0]?.id || '');
  const current = comparisons.find((c) => c.id === selectedCompId) || comparisons[0];

  const [preferenceSelection, setPreferenceSelection] = useState<'version_a' | 'version_b' | 'reiterar'>(
    current?.recordedPreference || 'version_b'
  );
  const [preferenceRationale, setPreferenceRationale] = useState<string>(
    current?.preferenceRationale || ''
  );
  const [savedSuccess, setSavedSuccess] = useState(false);

  const handleSavePreference = () => {
    if (!current) return;
    const updated: VersionComparisonData = {
      ...current,
      recordedPreference: preferenceSelection,
      preferenceRationale: preferenceRationale,
      updatedAt: new Date().toISOString().replace('T', ' ').slice(0, 19) + ' UTC',
    };
    onUpdateComparison(updated);
    setSavedSuccess(true);
    setTimeout(() => setSavedSuccess(false), 2500);
  };

  return (
    <div className="space-y-8 max-w-6xl mx-auto py-6">
      {/* Module Title */}
      <div className="border-b border-neutral-800 pb-6 flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <span className="text-xs font-mono uppercase tracking-widest text-amber-500/90 block mb-1">
            Módulo 6 — Evaluación Comparativa & Falsación
          </span>
          <h1 className="text-2xl md:text-3xl font-serif text-neutral-100">
            Comparador de Versiones Creativas
          </h1>
          <p className="text-sm text-neutral-400 mt-1 max-w-3xl">
            Inspecciona dos tratamientos sintéticos lado a lado, examinando qué se mantiene, qué cambió,
            qué hipótesis motivó la variación y qué resultado invalidaría la nueva conjetura.
            <strong className="text-neutral-200"> Sin porcentajes predictivos especulativos. Las estimaciones de diseño no se confunden con mediciones reales.</strong>
          </p>
        </div>
      </div>

      {current && (
        <div className="space-y-8">
          {/* Header comparison title */}
          <div className="bg-neutral-900/40 border border-neutral-800 rounded-lg p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <span className="text-xs font-mono uppercase tracking-wider text-amber-500 block">
                Eje de Análisis: {current.focusArea}
              </span>
              <h2 className="text-lg font-serif font-medium text-neutral-100 mt-0.5">
                {current.title}
              </h2>
            </div>
            <div className="text-xs font-mono text-neutral-400 bg-neutral-950 border border-neutral-800 px-3 py-1.5 rounded self-start sm:self-auto">
              Estado de registro: <span className="text-emerald-400 uppercase font-semibold">{current.recordedPreference || 'PENDIENTE'}</span>
            </div>
          </div>

          {/* Side-by-Side Visual Comparison Cards */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Version A Card */}
            <div className="bg-neutral-900/50 border border-neutral-800 rounded-lg overflow-hidden flex flex-col justify-between space-y-4">
              <div className="space-y-4">
                <div className="relative aspect-video bg-neutral-950 border-b border-neutral-800">
                  <img
                    src={current.versionA.imageUrl}
                    alt={current.versionA.label}
                    referrerPolicy="no-referrer"
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute top-3 left-3 bg-neutral-950/90 border border-neutral-800 font-mono text-xs px-2.5 py-1 rounded text-amber-400">
                    {current.versionA.tag}
                  </div>
                  <div className="absolute bottom-2 right-2 bg-neutral-950/90 border border-amber-800 text-[9px] font-mono text-amber-300 px-1.5 py-0.5 rounded">
                    DEMO_SYNTHETIC
                  </div>
                </div>

                <div className="p-5 space-y-3">
                  <h3 className="text-base font-serif font-medium text-neutral-100">
                    {current.versionA.label}
                  </h3>
                  <p className="text-xs text-neutral-300 leading-relaxed font-sans">
                    {current.versionA.description}
                  </p>

                  <div className="bg-neutral-950/80 rounded p-3 text-xs border border-neutral-800/80 space-y-1">
                    <span className="font-mono text-amber-400 uppercase text-[10px] block">
                      Hipótesis Artística de Trabajo:
                    </span>
                    <p className="text-neutral-200 italic font-serif leading-relaxed">
                      «{current.versionA.hypothesis}»
                    </p>
                  </div>

                  <div className="text-xs text-neutral-400 font-mono">
                    <strong>Enfoque formal:</strong> {current.versionA.creativeApproach}
                  </div>
                </div>
              </div>

              <div className="p-5 border-t border-neutral-800/80 bg-neutral-950/40">
                <button
                  onClick={() => setPreferenceSelection('version_a')}
                  className={`w-full py-2 px-3 text-xs font-mono uppercase tracking-wider rounded border transition-colors ${
                    preferenceSelection === 'version_a'
                      ? 'bg-amber-950/60 border-amber-600 text-amber-200 font-semibold'
                      : 'bg-neutral-900 border-neutral-800 text-neutral-400 hover:text-neutral-200'
                  }`}
                >
                  {preferenceSelection === 'version_a' ? '✓ Seleccionada como Preferida' : 'Elegir Versión A'}
                </button>
              </div>
            </div>

            {/* Version B Card */}
            <div className="bg-neutral-900/50 border border-neutral-800 rounded-lg overflow-hidden flex flex-col justify-between space-y-4">
              <div className="space-y-4">
                <div className="relative aspect-video bg-neutral-950 border-b border-neutral-800">
                  <img
                    src={current.versionB.imageUrl}
                    alt={current.versionB.label}
                    referrerPolicy="no-referrer"
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute top-3 left-3 bg-neutral-950/90 border border-neutral-800 font-mono text-xs px-2.5 py-1 rounded text-purple-400">
                    {current.versionB.tag}
                  </div>
                  <div className="absolute bottom-2 right-2 bg-neutral-950/90 border border-purple-800 text-[9px] font-mono text-purple-300 px-1.5 py-0.5 rounded">
                    DEMO_SYNTHETIC
                  </div>
                </div>

                <div className="p-5 space-y-3">
                  <h3 className="text-base font-serif font-medium text-neutral-100">
                    {current.versionB.label}
                  </h3>
                  <p className="text-xs text-neutral-300 leading-relaxed font-sans">
                    {current.versionB.description}
                  </p>

                  <div className="bg-neutral-950/80 rounded p-3 text-xs border border-neutral-800/80 space-y-1">
                    <span className="font-mono text-purple-400 uppercase text-[10px] block">
                      Hipótesis Artística de Trabajo:
                    </span>
                    <p className="text-neutral-200 italic font-serif leading-relaxed">
                      «{current.versionB.hypothesis}»
                    </p>
                  </div>

                  <div className="text-xs text-neutral-400 font-mono">
                    <strong>Enfoque formal:</strong> {current.versionB.creativeApproach}
                  </div>
                </div>
              </div>

              <div className="p-5 border-t border-neutral-800/80 bg-neutral-950/40">
                <button
                  onClick={() => setPreferenceSelection('version_b')}
                  className={`w-full py-2 px-3 text-xs font-mono uppercase tracking-wider rounded border transition-colors ${
                    preferenceSelection === 'version_b'
                      ? 'bg-purple-950/60 border-purple-600 text-purple-200 font-semibold'
                      : 'bg-neutral-900 border-neutral-800 text-neutral-400 hover:text-neutral-200'
                  }`}
                >
                  {preferenceSelection === 'version_b' ? '✓ Seleccionada como Preferida' : 'Elegir Versión B'}
                </button>
              </div>
            </div>
          </div>

          {/* Deep Comparative Analysis: Qué se mantiene vs Qué cambió */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-neutral-900/40 border border-neutral-800 rounded-lg p-5 space-y-3">
              <span className="text-xs font-mono uppercase tracking-wider text-emerald-400 flex items-center gap-1.5">
                <Check className="w-4 h-4" />
                <span>Qué se mantiene inalterado (Invariantes de Rigor)</span>
              </span>
              <ul className="space-y-2 text-xs text-neutral-300">
                {current.maintainedElements.map((el, i) => (
                  <li key={i} className="flex items-start gap-2 bg-neutral-950/60 p-2.5 rounded border border-neutral-900">
                    <span className="text-emerald-500 font-mono mt-0.5">·</span>
                    <span className="leading-relaxed">{el}</span>
                  </li>
                ))}
              </ul>
            </div>

            <div className="bg-neutral-900/40 border border-neutral-800 rounded-lg p-5 space-y-3">
              <span className="text-xs font-mono uppercase tracking-wider text-amber-400 flex items-center gap-1.5">
                <RefreshCw className="w-4 h-4" />
                <span>Qué cambió y se transformó creativamente</span>
              </span>
              <ul className="space-y-2 text-xs text-neutral-300">
                {current.changedElements.map((el, i) => (
                  <li key={i} className="flex items-start gap-2 bg-neutral-950/60 p-2.5 rounded border border-neutral-900">
                    <span className="text-amber-500 font-mono mt-0.5">·</span>
                    <span className="leading-relaxed">{el}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>

          {/* Scientific Rationale: Evidencia motriz + Validación + Falsación */}
          <div className="bg-neutral-900/40 border border-neutral-800 rounded-lg p-6 space-y-4">
            <h3 className="text-sm font-serif font-medium text-neutral-100 flex items-center gap-2">
              <GitCompare className="w-4 h-4 text-amber-500" />
              <span>Matriz Epistemológica de la Variación Creativa</span>
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
              <div className="bg-neutral-950 p-4 rounded border border-neutral-800 space-y-1.5">
                <span className="font-mono text-amber-400 uppercase text-[10px] block">
                  1. Razón del Cambio [HIPÓTESIS DE MODELADO]
                </span>
                <p className="text-neutral-300 leading-relaxed font-sans">
                  {current.evidenceDrivingChange}
                </p>
              </div>

              <div className="bg-neutral-950 p-4 rounded border border-neutral-800 space-y-1.5">
                <span className="font-mono text-blue-400 uppercase text-[10px] block">
                  2. Qué se Espera Comprobar [OBJETIVO]
                </span>
                <p className="text-neutral-300 leading-relaxed font-sans">
                  {current.expectedValidation}
                </p>
              </div>

              <div className="bg-rose-950/20 p-4 rounded border border-rose-900/40 space-y-1.5">
                <span className="font-mono text-rose-400 uppercase text-[10px] block flex items-center gap-1">
                  <Flame className="w-3.5 h-3.5" />
                  <span>3. Criterio de Falsación</span>
                </span>
                <p className="text-neutral-300 leading-relaxed font-sans">
                  {current.falsificationCriteria}
                </p>
              </div>
            </div>
          </div>

          {/* Decision Rationale & Log Saving */}
          <div className="bg-neutral-900/40 border border-neutral-800 rounded-lg p-5 space-y-4">
            <h3 className="text-sm font-serif font-medium text-neutral-100 flex items-center gap-2">
              <ThumbsUp className="w-4 h-4 text-amber-400" />
              <span>Acta de Selección de Versión para el Paquete SFI</span>
            </h3>

            <div className="space-y-2">
              <label className="text-xs font-mono text-neutral-400 block">
                Fundamento de la decisión [SIMULACIÓN DIDÁCTICA]:
              </label>
              <textarea
                rows={2}
                value={preferenceRationale}
                onChange={(e) => setPreferenceRationale(e.target.value)}
                placeholder="Indica las razones por las que la versión elegida equilibra mejor el rigor didáctico y la inteligibilidad..."
                className="w-full bg-neutral-950 border border-neutral-800 rounded p-3 text-xs text-neutral-100 focus:outline-none focus:border-amber-500 font-sans"
              />
            </div>

            <div className="flex items-center justify-between">
              <span className="text-[11px] text-neutral-500 font-mono">
                {current.updatedAt ? `Última actualización: ${current.updatedAt}` : 'Pendiente de confirmación'}
              </span>

              <button
                onClick={handleSavePreference}
                className="flex items-center gap-2 px-4 py-2 text-xs font-medium uppercase tracking-wider bg-amber-500 hover:bg-amber-400 text-neutral-950 rounded transition-colors"
              >
                {savedSuccess ? (
                  <>
                    <Check className="w-3.5 h-3.5" />
                    <span>Decisión Registrada (DEMO_SYNTHETIC)</span>
                  </>
                ) : (
                  <>
                    <span>Guardar Decisión en el Proyecto</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
