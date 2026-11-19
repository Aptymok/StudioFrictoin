/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * 
 * MÓDULO 5: LABORATORIO DE CAMPAÑAS
 * Planificación rigurosa de ciclos de 15 días (calibración experimental)
 * y 90 días (estrategia evolutiva quincenal), especificando hipótesis,
 * indicadores observables reales, riesgos y criterios de mantener/modificar/detener.
 * Prohibido inventar métricas sociales, clientes inexistentes o vanity metrics.
 */

import React, { useState } from 'react';
import { CampaignCycle } from '../types';
import { 
  Clock, 
  AlertTriangle, 
  CheckCircle, 
  StopCircle, 
  RefreshCw, 
  Plus
} from 'lucide-react';

interface ModuleCampaignLabProps {
  campaigns: CampaignCycle[];
  onAddCampaign: (campaign: CampaignCycle) => void;
}

export const ModuleCampaignLab: React.FC<ModuleCampaignLabProps> = ({
  campaigns,
  onAddCampaign,
}) => {
  const [selectedCampaignId, setSelectedCampaignId] = useState<string>(campaigns[0]?.id || '');
  const [showNewModal, setShowNewModal] = useState(false);

  // Form states for new campaign
  const [newTitle, setNewTitle] = useState('');
  const [newCycleType, setNewCycleType] = useState<'15_dias' | '90_dias'>('15_dias');
  const [newHypothesis, setNewHypothesis] = useState('');
  const [newAudience, setNewAudience] = useState('');
  const [newChannel, setNewChannel] = useState('');
  const [newFormat, setNewFormat] = useState('');
  const [newMaterials, setNewMaterials] = useState('');
  const [newIndicator, setNewIndicator] = useState('');
  const [newEvidence, setNewEvidence] = useState('');
  const [newRisks, setNewRisks] = useState('');
  const [newCritMaintain, setNewCritMaintain] = useState('');
  const [newCritModify, setNewCritModify] = useState('');
  const [newCritHalt, setNewCritHalt] = useState('');

  const currentCampaign = campaigns.find((c) => c.id === selectedCampaignId) || campaigns[0];

  const handleCreateCampaign = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle || !newHypothesis) return;

    const created: CampaignCycle = {
      id: `cmp-${Date.now()}`,
      title: newTitle,
      cycleType: newCycleType,
      hypothesis: `[HIPÓTESIS]: ${newHypothesis}`,
      targetAudience: newAudience,
      channel: newChannel,
      format: newFormat,
      requiredMaterial: newMaterials.split('\n').filter(Boolean),
      observableIndicator: `[OBJETIVO DE MEDICIÓN]: ${newIndicator}`,
      necessaryEvidence: newEvidence,
      identifiedRisks: newRisks.split('\n').filter(Boolean),
      decisionCriteria: {
        maintain: newCritMaintain || 'Mantener si los indicadores observables cumplen la cota mínima.',
        modify: newCritModify || 'Modificar el formato si la evidencia de lectura no progresa.',
        halt: newCritHalt || 'Detener si surgen inconsistencias históricas o éticas.',
      },
      schedule: [
        {
          periodLabel: newCycleType === '15_dias' ? 'Días 01 a 07' : 'Quincena 1 (Días 01-15)',
          focus: 'Lanzamiento experimental con activo DEMO_SYNTHETIC rotulado',
          actionableGate: 'Revisión técnica de recepción y comprobación de marcas de agua',
        },
        {
          periodLabel: newCycleType === '15_dias' ? 'Días 08 a 15' : 'Quincena 2 (Días 16-30)',
          focus: 'Evaluación de datos observables reales y decisión de continuidad',
          actionableGate: 'Dictamen de mantener, modificar o detener',
        },
      ],
    };

    onAddCampaign(created);
    setSelectedCampaignId(created.id);
    setShowNewModal(false);
  };

  return (
    <div className="space-y-8 max-w-6xl mx-auto py-6">
      {/* Module Title */}
      <div className="border-b border-neutral-800 pb-6 flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <span className="text-xs font-mono uppercase tracking-widest text-amber-500/90 block mb-1">
            Módulo 5 — Estrategia de Difusión & Experimentación
          </span>
          <h1 className="text-2xl md:text-3xl font-serif text-neutral-100">
            Laboratorio de Campañas & Ciclos de Decisión
          </h1>
          <p className="text-sm text-neutral-400 mt-1 max-w-3xl">
            Estructura ciclos de 15 días (calibración experimental) y 90 días (estrategia evolutiva quincenal). 
            <strong className="text-neutral-200"> Diferencia con rigor: Hipótesis de difusión frente a Objetivos de medición. Cero audiencias inventadas.</strong>
          </p>
        </div>

        <button
          onClick={() => setShowNewModal(true)}
          className="flex items-center gap-2 px-3.5 py-2 text-xs font-medium tracking-wide uppercase bg-neutral-800 hover:bg-neutral-700 text-neutral-100 rounded transition-colors shrink-0"
        >
          <Plus className="w-3.5 h-3.5" />
          <span>Nueva Propuesta de Ciclo</span>
        </button>
      </div>

      {/* Campaign Selector Tabs */}
      <div className="flex gap-2 border-b border-neutral-800 pb-3 overflow-x-auto">
        {campaigns.map((cmp) => {
          const isSelected = cmp.id === currentCampaign.id;
          return (
            <button
              key={cmp.id}
              onClick={() => setSelectedCampaignId(cmp.id)}
              className={`px-4 py-2 text-xs font-mono uppercase tracking-wider rounded border transition-colors flex items-center gap-2 shrink-0 ${
                isSelected
                  ? 'bg-amber-950/60 border-amber-600 text-amber-200 font-semibold'
                  : 'bg-neutral-900/60 border-neutral-800 text-neutral-400 hover:text-neutral-200'
              }`}
            >
              <Clock className="w-3.5 h-3.5 text-amber-500" />
              <span>{cmp.title}</span>
              <span className="text-[10px] opacity-75">
                ({cmp.cycleType === '15_dias' ? '15 Días' : '90 Días'})
              </span>
            </button>
          );
        })}
      </div>

      {currentCampaign && (
        <div className="space-y-6">
          {/* Main Campaign Card */}
          <div className="bg-neutral-900/40 border border-neutral-800 rounded-lg p-6 space-y-6">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 border-b border-neutral-800/80 pb-4">
              <div>
                <span className="text-[10px] font-mono uppercase tracking-widest text-amber-500 block">
                  {currentCampaign.cycleType === '15_dias' ? 'CICLO DE CALIBRACIÓN EXPERIMENTAL (15 DÍAS)' : 'ESTRATEGIA EVOLUTIVA ACUMULADA (90 DÍAS)'}
                </span>
                <h2 className="text-xl font-serif font-medium text-neutral-100 mt-0.5">
                  {currentCampaign.title}
                </h2>
              </div>
              <div className="text-xs font-mono text-neutral-400 bg-neutral-950 border border-neutral-800 px-3 py-1.5 rounded self-start md:self-auto">
                Canal: <strong className="text-neutral-200">{currentCampaign.channel}</strong>
              </div>
            </div>

            {/* Core Hypothesis & Audience */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="bg-neutral-950/80 border border-neutral-800/80 rounded p-4 space-y-2">
                <span className="text-xs font-mono uppercase tracking-wider text-amber-400 block">
                  Hipótesis de Trabajo (Formulada para Contrastación)
                </span>
                <p className="text-xs text-neutral-200 font-serif leading-relaxed italic">
                  «{currentCampaign.hypothesis}»
                </p>
              </div>

              <div className="bg-neutral-950/80 border border-neutral-800/80 rounded p-4 space-y-2">
                <span className="text-xs font-mono uppercase tracking-wider text-neutral-400 block">
                  Público Objetivo & Formato de Contenido
                </span>
                <div className="text-xs text-neutral-300 space-y-1">
                  <div><strong>Destinatarios:</strong> {currentCampaign.targetAudience}</div>
                  <div><strong>Formato:</strong> {currentCampaign.format}</div>
                </div>
              </div>
            </div>

            {/* Required Materials & Observable Indicator */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="bg-neutral-950/60 border border-neutral-800/70 rounded p-4 space-y-2 text-xs">
                <span className="font-mono uppercase tracking-wider text-neutral-400 block">
                  Materiales Estrictamente Requeridos (DEMO_SYNTHETIC)
                </span>
                <ul className="space-y-1.5 text-neutral-300">
                  {currentCampaign.requiredMaterial.map((mat, i) => (
                    <li key={i} className="flex items-start gap-2">
                      <span className="text-amber-500 font-mono mt-0.5">·</span>
                      <span>{mat}</span>
                    </li>
                  ))}
                </ul>
              </div>

              <div className="bg-neutral-950/60 border border-neutral-800/70 rounded p-4 space-y-2 text-xs">
                <span className="font-mono uppercase tracking-wider text-blue-400 block">
                  Objetivo de Medición Observable (Sin Métricas Falsas)
                </span>
                <p className="text-neutral-200 leading-relaxed font-sans">
                  {currentCampaign.observableIndicator}
                </p>
                <div className="pt-2 border-t border-neutral-900 text-neutral-400">
                  <strong>Evidencia necesaria para comprobar:</strong> {currentCampaign.necessaryEvidence}
                </div>
              </div>
            </div>

            {/* Decision Protocol: Maintain / Modify / Halt */}
            <div className="space-y-3 pt-2 border-t border-neutral-800">
              <span className="text-xs font-mono uppercase tracking-wider text-neutral-400 block">
                Protocolo de Gobernanza & Criterios de Decisión
              </span>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
                {/* Maintain */}
                <div className="bg-emerald-950/20 border border-emerald-900/40 rounded p-3.5 space-y-1.5">
                  <div className="flex items-center gap-1.5 text-emerald-400 font-mono font-medium">
                    <CheckCircle className="w-3.5 h-3.5" />
                    <span>MANTENER CAMPAÑA</span>
                  </div>
                  <p className="text-neutral-300 leading-relaxed font-sans">
                    {currentCampaign.decisionCriteria.maintain}
                  </p>
                </div>

                {/* Modify */}
                <div className="bg-amber-950/20 border border-amber-900/40 rounded p-3.5 space-y-1.5">
                  <div className="flex items-center gap-1.5 text-amber-400 font-mono font-medium">
                    <RefreshCw className="w-3.5 h-3.5" />
                    <span>MODIFICAR ENFOQUE</span>
                  </div>
                  <p className="text-neutral-300 leading-relaxed font-sans">
                    {currentCampaign.decisionCriteria.modify}
                  </p>
                </div>

                {/* Halt */}
                <div className="bg-rose-950/20 border border-rose-900/40 rounded p-3.5 space-y-1.5">
                  <div className="flex items-center gap-1.5 text-rose-400 font-mono font-medium">
                    <StopCircle className="w-3.5 h-3.5" />
                    <span>DETENER INMEDIATAMENTE</span>
                  </div>
                  <p className="text-neutral-300 leading-relaxed font-sans">
                    {currentCampaign.decisionCriteria.halt}
                  </p>
                </div>
              </div>
            </div>

            {/* Identified Risks */}
            {currentCampaign.identifiedRisks.length > 0 && (
              <div className="bg-neutral-950/80 border border-neutral-800 rounded p-4 text-xs space-y-2">
                <span className="font-mono uppercase tracking-wider text-rose-400 flex items-center gap-1.5">
                  <AlertTriangle className="w-3.5 h-3.5" />
                  <span>Riesgos Epistemológicos Identificados & Mitigación</span>
                </span>
                <ul className="space-y-1 text-neutral-300">
                  {currentCampaign.identifiedRisks.map((risk, i) => (
                    <li key={i} className="flex items-start gap-2">
                      <span className="text-rose-500 font-mono mt-0.5">·</span>
                      <span>{risk}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* Schedule & Evaluation Gates */}
            {currentCampaign.schedule && currentCampaign.schedule.length > 0 && (
              <div className="space-y-3 pt-2 border-t border-neutral-800">
                <span className="text-xs font-mono uppercase tracking-wider text-neutral-400 block">
                  Cronograma & Compuertas de Evaluación
                </span>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                  {currentCampaign.schedule.map((item, idx) => (
                    <div
                      key={idx}
                      className="bg-neutral-950 border border-neutral-800 rounded p-3 text-xs space-y-1.5"
                    >
                      <div className="text-[10px] font-mono text-amber-500 font-semibold uppercase">
                        {item.periodLabel}
                      </div>
                      <div className="text-neutral-200 font-medium">
                        {item.focus}
                      </div>
                      <div className="text-neutral-400 text-[11px] pt-1 border-t border-neutral-900">
                        Compuerta: {item.actionableGate}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* New Campaign Proposal Modal */}
      {showNewModal && (
        <div className="fixed inset-0 z-50 bg-neutral-950/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-neutral-900 border border-neutral-800 rounded-lg max-w-2xl w-full p-6 space-y-4 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-neutral-800 pb-3">
              <h2 className="text-lg font-serif text-neutral-100">
                Formular Propuesta de Campaña
              </h2>
              <button
                onClick={() => setShowNewModal(false)}
                className="text-neutral-500 hover:text-neutral-300 text-sm"
              >
                Cerrar
              </button>
            </div>

            <form onSubmit={handleCreateCampaign} className="space-y-3 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-neutral-400 font-mono block mb-1">Título de la Campaña</label>
                  <input
                    type="text"
                    required
                    placeholder="Ej. Difusión Didáctica de Placas Sintéticas"
                    value={newTitle}
                    onChange={(e) => setNewTitle(e.target.value)}
                    className="w-full bg-neutral-950 border border-neutral-700 rounded px-3 py-2 text-neutral-100"
                  />
                </div>
                <div>
                  <label className="text-neutral-400 font-mono block mb-1">Tipo de Ciclo</label>
                  <select
                    value={newCycleType}
                    onChange={(e) => setNewCycleType(e.target.value as '15_dias' | '90_dias')}
                    className="w-full bg-neutral-950 border border-neutral-700 rounded px-3 py-2 text-neutral-100"
                  >
                    <option value="15_dias">Ciclo 15 Días (Calibración Experimental)</option>
                    <option value="90_dias">Ciclo 90 Días (Estrategia Evolutiva)</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="text-neutral-400 font-mono block mb-1">Hipótesis a Contrastar</label>
                <textarea
                  rows={2}
                  required
                  placeholder="¿Qué efecto observable verificable se postula?"
                  value={newHypothesis}
                  onChange={(e) => setNewHypothesis(e.target.value)}
                  className="w-full bg-neutral-950 border border-neutral-700 rounded px-3 py-2 text-neutral-100"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-neutral-400 font-mono block mb-1">Canal de Difusión</label>
                  <input
                    type="text"
                    placeholder="Ej. LinkedIn + Portal Didáctico"
                    value={newChannel}
                    onChange={(e) => setNewChannel(e.target.value)}
                    className="w-full bg-neutral-950 border border-neutral-700 rounded px-3 py-2 text-neutral-100"
                  />
                </div>
                <div>
                  <label className="text-neutral-400 font-mono block mb-1">Público Destinatario</label>
                  <input
                    type="text"
                    placeholder="Ej. Docentes e historiadores de la técnica"
                    value={newAudience}
                    onChange={(e) => setNewAudience(e.target.value)}
                    className="w-full bg-neutral-950 border border-neutral-700 rounded px-3 py-2 text-neutral-100"
                  />
                </div>
              </div>

              <div>
                <label className="text-neutral-400 font-mono block mb-1">Objetivo de Medición Observable (Real, Cero Vanity)</label>
                <input
                  type="text"
                  placeholder="Ej. Solicitud formal de fichas didácticas descargadas"
                  value={newIndicator}
                  onChange={(e) => setNewIndicator(e.target.value)}
                  className="w-full bg-neutral-950 border border-neutral-700 rounded px-3 py-2 text-neutral-100"
                />
              </div>

              <div>
                <label className="text-neutral-400 font-mono block mb-1">Criterio para Detener la Campaña</label>
                <input
                  type="text"
                  placeholder="Ej. Si se detecta distorsión o confusión sobre autenticidad"
                  value={newCritHalt}
                  onChange={(e) => setNewCritHalt(e.target.value)}
                  className="w-full bg-neutral-950 border border-neutral-700 rounded px-3 py-2 text-neutral-100"
                />
              </div>

              <div className="pt-3 border-t border-neutral-800 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowNewModal(false)}
                  className="px-4 py-2 bg-neutral-800 text-neutral-300 rounded hover:bg-neutral-700"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-amber-500 text-neutral-950 font-medium rounded hover:bg-amber-400"
                >
                  Guardar Propuesta de Campaña
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
