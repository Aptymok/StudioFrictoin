/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * 
 * SFI CREATIVE COMPANION — OBSERVATORY: FRICTION MAP
 * Visual scientific tracking, World Spectrum Vector projection & campaign decision matrices:
 * - Interactive World Spectrum Vector polar radar projection (Hipótesis vs Simulación vs Objetivo)
 * - Resonance & Conceptual Friction Heatmap Matrix
 * - 15-day calibration vs 90-day evolutionary strategy visual comparison
 * - Decision engine: Mantener / Modificar / Detener with falsation thresholds
 * - Visual exportable scientific report card
 */

import React, { useState } from 'react';
import { CampaignCycle } from '../types';
import { 
  Compass, 
  Target, 
  Activity, 
  Sliders, 
  Layers, 
  AlertTriangle, 
  Download, 
  Check, 
  HelpCircle, 
  ShieldCheck,
  TrendingUp,
  FileSpreadsheet,
  Globe2,
  RefreshCw
} from 'lucide-react';

interface VectorDimension {
  key: string;
  label: string;
  hypothesisVal: number; // 0-100
  simulationVal: number; // 0-100
  targetVal: number;     // 0-100
  unit: string;
}

interface ResonanceNode {
  id: string;
  name: string;
  chamberRef: string;
  frictionPercent: number;
  acousticHz: number;
  status: 'calibrando' | 'estable' | 'alerta_friccion';
  falsationRisk: string;
}

interface ObservatoryFrictionMapProps {
  campaigns: CampaignCycle[];
  onAddCampaign?: (campaign: CampaignCycle) => void;
}

export const ObservatoryFrictionMap: React.FC<ObservatoryFrictionMapProps> = ({
  campaigns,
  onAddCampaign,
}) => {
  const [activeCycleTab, setActiveCycleTab] = useState<'15_dias' | '90_dias'>('15_dias');
  const [selectedNodeId, setSelectedNodeId] = useState<string>('node-1');
  const [showLayerHypothesis, setShowLayerHypothesis] = useState(true);
  const [showLayerSimulation, setShowLayerSimulation] = useState(true);
  const [showLayerTarget, setShowLayerTarget] = useState(true);
  const [activeDecision, setActiveDecision] = useState<'mantener' | 'modificar' | 'detener'>('mantener');
  const [generatedReportNotice, setGeneratedReportNotice] = useState<string | null>(null);

  // World Spectrum Vector Dimensions
  const [dimensions, setDimensions] = useState<VectorDimension[]>([
    { key: 'dim_fric', label: 'Fricción Semántica', hypothesisVal: 78, simulationVal: 82, targetVal: 65, unit: '%' },
    { key: 'dim_res', label: 'Resonancia 35.2 Hz', hypothesisVal: 95, simulationVal: 92, targetVal: 90, unit: 'Hz eq' },
    { key: 'dim_damp', label: 'Amortiguamiento Q', hypothesisVal: 60, simulationVal: 68, targetVal: 70, unit: 'Q factor' },
    { key: 'dim_doc', label: 'Cohesión Documental', hypothesisVal: 85, simulationVal: 75, targetVal: 88, unit: 'idx' },
    { key: 'dim_vis', label: 'Transposición Visual', hypothesisVal: 70, simulationVal: 84, targetVal: 80, unit: 'pbr' },
    { key: 'dim_epist', label: 'Rigor Epistémico SFI', hypothesisVal: 98, simulationVal: 96, targetVal: 95, unit: 'score' },
  ]);

  // Conceptual & Subterranean Resonance Nodes
  const nodes: ResonanceNode[] = [
    {
      id: 'node-1',
      name: 'Bóveda Central de Resonancia',
      chamberRef: 'CAM-SUB-01',
      frictionPercent: 82.4,
      acousticHz: 35.2,
      status: 'estable',
      falsationRisk: 'Desfase modal si la temperatura del aceite excede 22°C.',
    },
    {
      id: 'node-2',
      name: 'Galería de Amortiguamiento Activo',
      chamberRef: 'CAM-SUB-02',
      frictionPercent: 63.8,
      acousticHz: 17.6,
      status: 'calibrando',
      falsationRisk: 'Atenuación incompleta en frecuencias submúltiplos.',
    },
    {
      id: 'node-3',
      name: 'Subestación de Tubos de Vacío',
      chamberRef: 'CAM-SUB-03',
      frictionPercent: 44.1,
      acousticHz: 70.4,
      status: 'estable',
      falsationRisk: 'Ruido estático en captación galvanométrica.',
    },
    {
      id: 'node-4',
      name: 'Banco de Fundición e Instrumentos',
      chamberRef: 'CAM-SUB-04',
      frictionPercent: 91.2,
      acousticHz: 35.2,
      status: 'alerta_friccion',
      falsationRisk: 'Tensión mecánica en fijaciones de roble macizo.',
    },
  ];

  const selectedNode = nodes.find((n) => n.id === selectedNodeId) || nodes[0];

  // Radar Polygon Mathematics
  const radius = 120;
  const centerX = 160;
  const centerY = 160;
  const totalAxes = dimensions.length;

  const getCoordinates = (value: number, index: number) => {
    const angle = (Math.PI * 2 / totalAxes) * index - Math.PI / 2;
    const r = (value / 100) * radius;
    const x = centerX + r * Math.cos(angle);
    const y = centerY + r * Math.sin(angle);
    return { x, y };
  };

  const getPolygonPoints = (valKey: 'hypothesisVal' | 'simulationVal' | 'targetVal') => {
    return dimensions
      .map((dim, idx) => {
        const { x, y } = getCoordinates(dim[valKey], idx);
        return `${x.toFixed(1)},${y.toFixed(1)}`;
      })
      .join(' ');
  };

  const handleDimensionChange = (key: string, valKey: 'hypothesisVal' | 'simulationVal' | 'targetVal', newVal: number) => {
    setDimensions(
      dimensions.map((d) => (d.key === key ? { ...d, [valKey]: newVal } : d))
    );
  };

  const handleGenerateReport = () => {
    setGeneratedReportNotice('Reporte científico del World Spectrum Vector generado con sello inmutable DEMO_SYNTHETIC.');
    setTimeout(() => setGeneratedReportNotice(null), 4000);
  };

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="bg-neutral-900/60 border border-neutral-800 rounded-xl p-6 relative overflow-hidden backdrop-blur-md">
        <div className="absolute top-0 right-0 w-96 h-96 bg-cyan-500/5 rounded-full blur-3xl pointer-events-none" />

        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-neutral-800/80 pb-5">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <Compass className="w-5 h-5 text-cyan-400" />
              <span className="text-xs font-mono uppercase tracking-widest text-cyan-400 font-semibold">
                FRICTION MAP · OBSERVATORIO DE CAMPAÑAS & WORLD SPECTRUM VECTOR
              </span>
            </div>
            <h1 className="text-2xl md:text-3xl font-serif font-bold text-neutral-100">
              Proyección Polar Multivectorial, Nodos de Resonancia & Criterios de Falsación
            </h1>
            <p className="text-xs text-neutral-400 max-w-3xl font-sans">
              Proyecta vectores de fricción y acústica con el <strong className="text-cyan-300 font-mono">World Spectrum Vector</strong>, supervisa ciclos de calibración (15 días) y estrategia evolutiva (90 días) y ejecuta decisiones fundamentadas (Mantener / Modificar / Detener).
            </p>
          </div>

          <button
            onClick={handleGenerateReport}
            className="flex items-center gap-2 px-3.5 py-2 text-xs font-mono uppercase bg-neutral-950 border border-neutral-700 hover:border-cyan-500 text-neutral-200 rounded-lg transition-colors shadow-sm shrink-0"
          >
            <Download className="w-3.5 h-3.5 text-cyan-400" />
            <span>Exportar Reporte Científico</span>
          </button>
        </div>

        {generatedReportNotice && (
          <div className="mt-4 p-3 bg-cyan-950/40 border border-cyan-800/70 rounded-lg text-xs text-cyan-200 flex items-center gap-2">
            <Check className="w-4 h-4 text-cyan-400 shrink-0" />
            <span>{generatedReportNotice}</span>
          </div>
        )}
      </div>

      {/* Main Grid: World Spectrum Vector (Left) + Friction Heatmap (Right) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: World Spectrum Vector Visual Engine */}
        <div className="lg:col-span-7 bg-neutral-950 border border-neutral-800 rounded-xl p-5 space-y-5">
          <div className="flex items-center justify-between border-b border-neutral-800/80 pb-3">
            <div className="flex items-center gap-2">
              <Globe2 className="w-4 h-4 text-cyan-400" />
              <h3 className="text-sm font-serif font-semibold text-neutral-100">
                Proyección Multiaxial: World Spectrum Vector
              </h3>
            </div>

            {/* Layer Toggles */}
            <div className="flex items-center gap-2 text-[10px] font-mono">
              <button
                onClick={() => setShowLayerHypothesis(!showLayerHypothesis)}
                className={`flex items-center gap-1 px-2 py-0.5 rounded border transition-colors ${
                  showLayerHypothesis
                    ? 'bg-cyan-950/60 border-cyan-600 text-cyan-300'
                    : 'bg-neutral-900 border-neutral-800 text-neutral-500'
                }`}
              >
                <span className="w-2 h-2 rounded-full bg-cyan-400" />
                <span>[HIPÓTESIS]</span>
              </button>

              <button
                onClick={() => setShowLayerSimulation(!showLayerSimulation)}
                className={`flex items-center gap-1 px-2 py-0.5 rounded border transition-colors ${
                  showLayerSimulation
                    ? 'bg-amber-950/60 border-amber-600 text-amber-300'
                    : 'bg-neutral-900 border-neutral-800 text-neutral-500'
                }`}
              >
                <span className="w-2 h-2 rounded-full bg-amber-400" />
                <span>[SIMULACIÓN]</span>
              </button>

              <button
                onClick={() => setShowLayerTarget(!showLayerTarget)}
                className={`flex items-center gap-1 px-2 py-0.5 rounded border transition-colors ${
                  showLayerTarget
                    ? 'bg-purple-950/60 border-purple-600 text-purple-300'
                    : 'bg-neutral-900 border-neutral-800 text-neutral-500'
                }`}
              >
                <span className="w-2 h-2 rounded-full bg-purple-400" />
                <span>[OBJETIVO]</span>
              </button>
            </div>
          </div>

          {/* SVG Radar Visualization & Dimensions Controls */}
          <div className="grid grid-cols-1 md:grid-cols-12 gap-4 items-center">
            {/* SVG Polar Radar */}
            <div className="md:col-span-7 flex justify-center py-2">
              <svg width="320" height="320" className="overflow-visible select-none">
                {/* Concentric Reference Rings */}
                {[0.25, 0.5, 0.75, 1.0].map((ring, idx) => (
                  <circle
                    key={idx}
                    cx={centerX}
                    cy={centerY}
                    r={radius * ring}
                    fill="none"
                    stroke="#1e1e2d"
                    strokeWidth="1"
                    strokeDasharray={idx === 3 ? 'none' : '3 3'}
                  />
                ))}

                {/* Axes and Labels */}
                {dimensions.map((dim, idx) => {
                  const angle = (Math.PI * 2 / totalAxes) * idx - Math.PI / 2;
                  const edgeX = centerX + radius * Math.cos(angle);
                  const edgeY = centerY + radius * Math.sin(angle);
                  const labelX = centerX + (radius + 24) * Math.cos(angle);
                  const labelY = centerY + (radius + 24) * Math.sin(angle);

                  return (
                    <g key={dim.key}>
                      <line
                        x1={centerX}
                        y1={centerY}
                        x2={edgeX}
                        y2={edgeY}
                        stroke="#27273a"
                        strokeWidth="1"
                      />
                      <text
                        x={labelX}
                        y={labelY + 4}
                        textAnchor="middle"
                        className="text-[9px] fill-neutral-400 font-mono tracking-tight"
                      >
                        {dim.label.split(' ')[0]}
                      </text>
                    </g>
                  );
                })}

                {/* Layer 1: Target Polygon (Dashed Purple) */}
                {showLayerTarget && (
                  <polygon
                    points={getPolygonPoints('targetVal')}
                    fill="#a855f7"
                    fillOpacity="0.1"
                    stroke="#a855f7"
                    strokeWidth="1.5"
                    strokeDasharray="4 4"
                  />
                )}

                {/* Layer 2: Hypothesis Polygon (Cyan) */}
                {showLayerHypothesis && (
                  <polygon
                    points={getPolygonPoints('hypothesisVal')}
                    fill="#06b6d4"
                    fillOpacity="0.15"
                    stroke="#06b6d4"
                    strokeWidth="2"
                  />
                )}

                {/* Layer 3: Simulation Polygon (Amber) */}
                {showLayerSimulation && (
                  <polygon
                    points={getPolygonPoints('simulationVal')}
                    fill="#f59e0b"
                    fillOpacity="0.25"
                    stroke="#f59e0b"
                    strokeWidth="2.2"
                  />
                )}

                {/* Center Core Dot */}
                <circle cx={centerX} cy={centerY} r="3" fill="#ffffff" opacity="0.6" />
              </svg>
            </div>

            {/* Dimension Sliders for Real-time Exploration */}
            <div className="md:col-span-5 space-y-3 text-xs font-mono">
              <span className="text-[10px] text-neutral-500 uppercase block tracking-wider">
                Ajuste Dinámico de Simulación (0-100):
              </span>

              {dimensions.map((dim) => (
                <div key={dim.key} className="space-y-1 bg-neutral-900/60 p-2 rounded border border-neutral-800/80">
                  <div className="flex justify-between items-center text-[10px]">
                    <span className="text-neutral-300 font-medium truncate max-w-[120px]">{dim.label}</span>
                    <span className="text-amber-400 font-bold">{dim.simulationVal}{dim.unit}</span>
                  </div>
                  <input
                    type="range"
                    min="10"
                    max="100"
                    value={dim.simulationVal}
                    onChange={(e) => handleDimensionChange(dim.key, 'simulationVal', parseInt(e.target.value, 10))}
                    className="w-full accent-amber-500 h-1 bg-neutral-800 rounded cursor-pointer"
                  />
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Right Column: Resonance Nodes & Friction Heatmap */}
        <div className="lg:col-span-5 bg-neutral-950 border border-neutral-800 rounded-xl p-5 space-y-4">
          <div className="flex items-center justify-between border-b border-neutral-800/80 pb-3">
            <div className="flex items-center gap-2">
              <Activity className="w-4 h-4 text-amber-500" />
              <h3 className="text-sm font-serif font-semibold text-neutral-100">
                Matriz de Nodos & Fricción Térmica
              </h3>
            </div>
            <span className="text-[10px] font-mono uppercase text-neutral-400">
              4 Cámaras Modeladas
            </span>
          </div>

          {/* Node Selector Heat Grid */}
          <div className="grid grid-cols-2 gap-2.5">
            {nodes.map((node) => {
              const isSelected = node.id === selectedNodeId;
              const isHigh = node.frictionPercent > 80;

              return (
                <button
                  key={node.id}
                  onClick={() => setSelectedNodeId(node.id)}
                  className={`p-3 rounded-lg border text-left transition-all ${
                    isSelected
                      ? 'bg-neutral-900 border-amber-500 ring-1 ring-amber-500/40 shadow-sm'
                      : 'bg-neutral-900/40 border-neutral-800 hover:border-neutral-700'
                  }`}
                >
                  <div className="flex items-center justify-between text-[10px] font-mono text-neutral-500 mb-1">
                    <span>{node.chamberRef}</span>
                    <span className={isHigh ? 'text-rose-400 font-bold' : 'text-emerald-400'}>
                      {node.status}
                    </span>
                  </div>
                  <div className="text-xs font-semibold text-neutral-200 truncate">
                    {node.name}
                  </div>
                  <div className="flex items-center justify-between mt-2 pt-1 border-t border-neutral-800/60 text-[11px] font-mono">
                    <span className="text-neutral-400">{node.acousticHz} Hz</span>
                    <span className={isHigh ? 'text-amber-400 font-bold' : 'text-neutral-300'}>
                      {node.frictionPercent}%
                    </span>
                  </div>
                </button>
              );
            })}
          </div>

          {/* Selected Node Diagnostic Card */}
          <div className="bg-neutral-900/70 border border-neutral-800 rounded-lg p-4 space-y-2.5 text-xs font-mono">
            <div className="flex items-center justify-between border-b border-neutral-800 pb-2">
              <span className="text-amber-400 font-semibold">{selectedNode.name}</span>
              <span className="text-neutral-400">{selectedNode.chamberRef}</span>
            </div>

            <div className="grid grid-cols-2 gap-2 text-[11px]">
              <div>
                <span className="text-neutral-500 block uppercase text-[9px]">Índice de Fricción:</span>
                <span className="text-sm font-bold text-amber-300">{selectedNode.frictionPercent}% [SIMULACIÓN]</span>
              </div>
              <div>
                <span className="text-neutral-500 block uppercase text-[9px]">Frecuencia Modal:</span>
                <span className="text-sm font-bold text-cyan-300">{selectedNode.acousticHz} Hz</span>
              </div>
            </div>

            <div className="pt-2 border-t border-neutral-800/80">
              <span className="text-neutral-500 block uppercase text-[9px] mb-0.5">Criterio de Falsación Científica:</span>
              <p className="text-neutral-300 font-sans text-xs leading-relaxed">
                {selectedNode.falsationRisk}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom Section: Campaign Cycles & Decision Cockpit */}
      <div className="bg-neutral-950 border border-neutral-800 rounded-xl p-6 space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-neutral-800 pb-4">
          <div>
            <span className="text-xs font-mono uppercase tracking-widest text-amber-500 block mb-1">
              SEGUIMIENTO DE CAMPAÑAS DIDÁCTICAS & DECISIÓN
            </span>
            <h3 className="text-lg font-serif font-bold text-neutral-100">
              Ciclos Experimentales: 15 Días (Calibración) vs 90 Días (Evolutivo)
            </h3>
          </div>

          {/* Cycle Toggle */}
          <div className="flex items-center gap-1 p-1 bg-neutral-900 border border-neutral-800 rounded-lg">
            <button
              onClick={() => setActiveCycleTab('15_dias')}
              className={`px-3 py-1.5 text-xs font-mono uppercase rounded transition-colors ${
                activeCycleTab === '15_dias'
                  ? 'bg-amber-950/70 border border-amber-600 text-amber-200 font-semibold'
                  : 'text-neutral-400 hover:text-neutral-200'
              }`}
            >
              Ciclo 15 Días (Calibración)
            </button>
            <button
              onClick={() => setActiveCycleTab('90_dias')}
              className={`px-3 py-1.5 text-xs font-mono uppercase rounded transition-colors ${
                activeCycleTab === '90_dias'
                  ? 'bg-amber-950/70 border border-amber-600 text-amber-200 font-semibold'
                  : 'text-neutral-400 hover:text-neutral-200'
              }`}
            >
              Ciclo 90 Días (Evolutivo)
            </button>
          </div>
        </div>

        {/* Active Campaign Detail */}
        {campaigns.length > 0 && (() => {
          const currentCamp = campaigns.find((c) => c.cycleType === activeCycleTab) || campaigns[0];
          return (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-xs font-mono">
              {/* Hypothesis & Observable Outcome */}
              <div className="bg-neutral-900/50 border border-neutral-800 rounded-lg p-4 space-y-3">
                <span className="text-[10px] uppercase text-cyan-400 font-semibold block">
                  1. Hipótesis & Objetivo Observable
                </span>
                <div>
                  <span className="text-neutral-500 text-[9px] block uppercase">Hipótesis Falsable:</span>
                  <p className="text-neutral-200 font-sans text-xs mt-0.5 leading-relaxed">
                    {currentCamp.hypothesis}
                  </p>
                </div>
                <div>
                  <span className="text-neutral-500 text-[9px] block uppercase">Indicador Observable Medible:</span>
                  <p className="text-amber-300 font-mono text-xs mt-0.5">
                    {currentCamp.observableIndicator}
                  </p>
                </div>
              </div>

              {/* Necessary Evidence & Channel */}
              <div className="bg-neutral-900/50 border border-neutral-800 rounded-lg p-4 space-y-3">
                <span className="text-[10px] uppercase text-amber-400 font-semibold block">
                  2. Canal, Formato & Evidencia Requerida
                </span>
                <div className="space-y-1">
                  <div>Canal: <strong className="text-neutral-200">{currentCamp.channel}</strong></div>
                  <div>Formato: <strong className="text-neutral-200">{currentCamp.format}</strong></div>
                  <div>Público Objetivo: <strong className="text-neutral-200">{currentCamp.targetAudience}</strong></div>
                </div>
                <div>
                  <span className="text-neutral-500 text-[9px] block uppercase">Evidencia Requerida:</span>
                  <p className="text-neutral-300 font-sans text-xs mt-0.5 leading-relaxed">
                    {currentCamp.necessaryEvidence}
                  </p>
                </div>
              </div>

              {/* Decision Cockpit: Mantener, Modificar o Detener */}
              <div className="bg-neutral-900/50 border border-neutral-800 rounded-lg p-4 space-y-3">
                <span className="text-[10px] uppercase text-emerald-400 font-semibold block">
                  3. Decisión Estratégica Científica
                </span>

                <div className="flex gap-1.5">
                  <button
                    onClick={() => setActiveDecision('mantener')}
                    className={`flex-1 py-1.5 rounded text-[11px] font-mono uppercase border transition-colors ${
                      activeDecision === 'mantener'
                        ? 'bg-emerald-950 border-emerald-600 text-emerald-300 font-bold'
                        : 'bg-neutral-950 border-neutral-800 text-neutral-500'
                    }`}
                  >
                    Mantener
                  </button>
                  <button
                    onClick={() => setActiveDecision('modificar')}
                    className={`flex-1 py-1.5 rounded text-[11px] font-mono uppercase border transition-colors ${
                      activeDecision === 'modificar'
                        ? 'bg-amber-950 border-amber-600 text-amber-300 font-bold'
                        : 'bg-neutral-950 border-neutral-800 text-neutral-500'
                    }`}
                  >
                    Modificar
                  </button>
                  <button
                    onClick={() => setActiveDecision('detener')}
                    className={`flex-1 py-1.5 rounded text-[11px] font-mono uppercase border transition-colors ${
                      activeDecision === 'detener'
                        ? 'bg-rose-950 border-rose-600 text-rose-300 font-bold'
                        : 'bg-neutral-950 border-neutral-800 text-neutral-500'
                    }`}
                  >
                    Detener
                  </button>
                </div>

                <div className="p-2.5 bg-neutral-950 rounded border border-neutral-800 text-[11px] font-sans text-neutral-300 leading-relaxed">
                  {activeDecision === 'mantener' && `Criterio Mantener: ${currentCamp.decisionCriteria.maintain}`}
                  {activeDecision === 'modificar' && `Criterio Modificar: ${currentCamp.decisionCriteria.modify}`}
                  {activeDecision === 'detener' && `Criterio Detener: ${currentCamp.decisionCriteria.halt}`}
                </div>
              </div>
            </div>
          );
        })()}
      </div>
    </div>
  );
};
