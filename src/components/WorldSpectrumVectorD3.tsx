/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 *
 * WORLD SPECTRUM VECTOR (D3.js)
 * Gráfica radial multiaxial construida con D3 que compara las variables clave
 * del proyecto frente a los vectores de referencia institucionales SFI,
 * representando explícitamente la desviación de [HIPÓTESIS] vs [OBSERVADO / SIMULACIÓN].
 */

import React, { useEffect, useRef, useState } from 'react';
import * as d3 from 'd3';
import { WorldSpectrumAxis } from '../types';
import { Globe2, RotateCcw, Sliders } from 'lucide-react';

interface WorldSpectrumVectorD3Props {
  initialAxes?: WorldSpectrumAxis[];
  onAxesChange?: (axes: WorldSpectrumAxis[]) => void;
}

const DEFAULT_AXES: WorldSpectrumAxis[] = [
  {
    key: 'friccion_semantica',
    label: 'Fricción Semántica',
    referenceVal: 72,
    hypothesisVal: 78,
    observedVal: 82,
    targetVal: 70,
    unit: '%',
  },
  {
    key: 'resonancia_hz',
    label: 'Resonancia 35.2 Hz',
    referenceVal: 88,
    hypothesisVal: 95,
    observedVal: 91,
    targetVal: 92,
    unit: 'idx',
  },
  {
    key: 'amortiguamiento_q',
    label: 'Amortiguamiento Q',
    referenceVal: 66,
    hypothesisVal: 60,
    observedVal: 68,
    targetVal: 70,
    unit: 'Q',
  },
  {
    key: 'cohesion_doc',
    label: 'Cohesión Documental',
    referenceVal: 90,
    hypothesisVal: 85,
    observedVal: 74,
    targetVal: 88,
    unit: 'idx',
  },
  {
    key: 'transposicion_vis',
    label: 'Transposición Visual',
    referenceVal: 75,
    hypothesisVal: 72,
    observedVal: 84,
    targetVal: 80,
    unit: 'pbr',
  },
  {
    key: 'rigor_epistemico',
    label: 'Rigor Epistémico',
    referenceVal: 96,
    hypothesisVal: 98,
    observedVal: 96,
    targetVal: 95,
    unit: 'sfi',
  },
];

export const WorldSpectrumVectorD3: React.FC<WorldSpectrumVectorD3Props> = ({
  initialAxes,
  onAxesChange,
}) => {
  const [axes, setAxes] = useState<WorldSpectrumAxis[]>(
    initialAxes && initialAxes.length > 0 ? initialAxes : DEFAULT_AXES
  );
  const [showReference, setShowReference] = useState(true);
  const [showHypothesis, setShowHypothesis] = useState(true);
  const [showObserved, setShowObserved] = useState(true);
  const [showDeviations, setShowDeviations] = useState(true);
  const [hoveredAxisKey, setHoveredAxisKey] = useState<string>(axes[0].key);

  const svgRef = useRef<SVGSVGElement | null>(null);

  const handleReset = () => {
    setAxes(DEFAULT_AXES);
    if (onAxesChange) onAxesChange(DEFAULT_AXES);
  };

  const handleUpdateAxis = (
    key: string,
    field: 'hypothesisVal' | 'observedVal',
    val: number
  ) => {
    const updated = axes.map((a) => (a.key === key ? { ...a, [field]: val } : a));
    setAxes(updated);
    if (onAxesChange) onAxesChange(updated);
  };

  // Compute global RMS deviation between Hypothesis and Observed/Simulation
  const rmsDeviation = Math.sqrt(
    axes.reduce((sum, a) => sum + Math.pow(a.observedVal - a.hypothesisVal, 2), 0) /
      Math.max(1, axes.length)
  );

  const hoveredAxis = axes.find((a) => a.key === hoveredAxisKey) || axes[0];

  useEffect(() => {
    const svgEl = svgRef.current;
    if (!svgEl) return;

    const width = 380;
    const height = 360;
    const radius = 124;
    const levels = 4;

    const svg = d3.select(svgEl);
    svg.selectAll('*').remove();

    const g = svg
      .attr('viewBox', `0 0 ${width} ${height}`)
      .append('g')
      .attr('transform', `translate(${width / 2}, ${height / 2})`);

    const rScale = d3.scaleLinear().domain([0, 100]).range([0, radius]);
    const angleSlice = (Math.PI * 2) / axes.length;

    // 1. Concentric grid rings + scale labels
    for (let lvl = 1; lvl <= levels; lvl++) {
      const r = (radius / levels) * lvl;
      g.append('circle')
        .attr('r', r)
        .attr('fill', 'none')
        .attr('stroke', lvl === levels ? '#334155' : '#1e293b')
        .attr('stroke-width', 1)
        .attr('stroke-dasharray', lvl === levels ? 'none' : '3,3');

      g.append('text')
        .attr('x', 4)
        .attr('y', -r + 10)
        .attr('fill', '#64748b')
        .attr('font-size', '9px')
        .attr('font-family', 'ui-monospace, SFMono-Regular, Menlo, monospace')
        .text(`${(lvl * 25)}`);
    }

    // 2. Radial axis lines & labels
    axes.forEach((axis, i) => {
      const angle = angleSlice * i - Math.PI / 2;
      const x2 = rScale(100) * Math.cos(angle);
      const y2 = rScale(100) * Math.sin(angle);
      const lx = rScale(116) * Math.cos(angle);
      const ly = rScale(116) * Math.sin(angle);

      g.append('line')
        .attr('x1', 0)
        .attr('y1', 0)
        .attr('x2', x2)
        .attr('y2', y2)
        .attr('stroke', axis.key === hoveredAxisKey ? '#38bdf8' : '#1e293b')
        .attr('stroke-width', axis.key === hoveredAxisKey ? 1.5 : 1);

      g.append('text')
        .attr('x', lx)
        .attr('y', ly)
        .attr('text-anchor', Math.abs(Math.cos(angle)) < 0.2 ? 'middle' : Math.cos(angle) > 0 ? 'start' : 'end')
        .attr('dominant-baseline', 'middle')
        .attr('fill', axis.key === hoveredAxisKey ? '#e2e8f0' : '#94a3b8')
        .attr('font-size', '9.5px')
        .attr('font-weight', axis.key === hoveredAxisKey ? '700' : '500')
        .attr('font-family', 'ui-monospace, SFMono-Regular, Menlo, monospace')
        .style('cursor', 'pointer')
        .text(axis.label.toUpperCase())
        .on('mouseenter', () => setHoveredAxisKey(axis.key))
        .on('click', () => setHoveredAxisKey(axis.key));
    });

    // D3 radial line generator
    const radialLine = d3
      .lineRadial<number>()
      .radius((d) => rScale(d))
      .angle((_, i) => i * angleSlice)
      .curve(d3.curveLinearClosed);

    const drawSeries = (
      values: number[],
      stroke: string,
      fill: string,
      fillOpacity: number,
      strokeWidth: number,
      dashArray?: string
    ) => {
      g.append('path')
        .datum(values)
        .attr('d', radialLine as unknown as string)
        .attr('fill', fill)
        .attr('fill-opacity', fillOpacity)
        .attr('stroke', stroke)
        .attr('stroke-width', strokeWidth)
        .attr('stroke-dasharray', dashArray || 'none');
    };

    // Layer A: Institutional Reference SFI Vector
    if (showReference) {
      drawSeries(
        axes.map((a) => a.referenceVal),
        '#a855f7',
        '#a855f7',
        0.07,
        1.5,
        '4,4'
      );
    }

    // Layer B: Hypothesis Vector
    if (showHypothesis) {
      drawSeries(
        axes.map((a) => a.hypothesisVal),
        '#06b6d4',
        '#06b6d4',
        0.14,
        2
      );
    }

    // Layer C: Observed / Simulation Vector
    if (showObserved) {
      drawSeries(
        axes.map((a) => a.observedVal),
        '#f59e0b',
        '#f59e0b',
        0.18,
        2.2
      );
    }

    // Layer D: Deviation Vectors (Delta between Hypothesis & Observed)
    if (showDeviations && showHypothesis && showObserved) {
      axes.forEach((axis, i) => {
        const angle = angleSlice * i - Math.PI / 2;
        const hx = rScale(axis.hypothesisVal) * Math.cos(angle);
        const hy = rScale(axis.hypothesisVal) * Math.sin(angle);
        const ox = rScale(axis.observedVal) * Math.cos(angle);
        const oy = rScale(axis.observedVal) * Math.sin(angle);

        const diff = axis.observedVal - axis.hypothesisVal;
        g.append('line')
          .attr('x1', hx)
          .attr('y1', hy)
          .attr('x2', ox)
          .attr('y2', oy)
          .attr('stroke', Math.abs(diff) >= 10 ? '#f43f5e' : '#10b981')
          .attr('stroke-width', 2.5);
      });
    }

    // Interactive Vertex Nodes
    axes.forEach((axis, i) => {
      const angle = angleSlice * i - Math.PI / 2;
      if (showHypothesis) {
        g.append('circle')
          .attr('cx', rScale(axis.hypothesisVal) * Math.cos(angle))
          .attr('cy', rScale(axis.hypothesisVal) * Math.sin(angle))
          .attr('r', axis.key === hoveredAxisKey ? 5 : 3.5)
          .attr('fill', '#06b6d4')
          .attr('stroke', '#09090b')
          .attr('stroke-width', 1.5)
          .style('cursor', 'pointer')
          .on('mouseenter', () => setHoveredAxisKey(axis.key));
      }
      if (showObserved) {
        g.append('circle')
          .attr('cx', rScale(axis.observedVal) * Math.cos(angle))
          .attr('cy', rScale(axis.observedVal) * Math.sin(angle))
          .attr('r', axis.key === hoveredAxisKey ? 5 : 3.5)
          .attr('fill', '#f59e0b')
          .attr('stroke', '#09090b')
          .attr('stroke-width', 1.5)
          .style('cursor', 'pointer')
          .on('mouseenter', () => setHoveredAxisKey(axis.key));
      }
    });

    // Center hub
    g.append('circle').attr('r', 2.5).attr('fill', '#cbd5e1');
  }, [axes, showReference, showHypothesis, showObserved, showDeviations, hoveredAxisKey]);

  const deltaHovered = hoveredAxis.observedVal - hoveredAxis.hypothesisVal;
  const deltaRef = hoveredAxis.observedVal - hoveredAxis.referenceVal;

  return (
    <div className="bg-neutral-950 border border-neutral-800 rounded-2xl p-6 space-y-5">
      {/* Header Ribbon */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 border-b border-neutral-800 pb-4">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <Globe2 className="w-4 h-4 text-cyan-400" />
            <span className="text-xs font-mono uppercase tracking-widest text-cyan-400 font-semibold">
              WORLD SPECTRUM VECTOR (D3 RADIAL ANALYZER)
            </span>
          </div>
          <h2 className="text-lg font-serif font-bold text-neutral-100">
            Desviación Multiaxial: Hipótesis vs Datos Observados/Simulados vs Referencia SFI
          </h2>
        </div>

        <div className="flex flex-wrap items-center gap-2 text-[11px] font-mono">
          <button
            onClick={() => setShowReference(!showReference)}
            className={`px-2.5 py-1 rounded border transition-colors ${
              showReference
                ? 'bg-purple-950/60 border-purple-600 text-purple-200'
                : 'bg-neutral-900 border-neutral-800 text-neutral-500'
            }`}
          >
            Ref. Institucional SFI
          </button>
          <button
            onClick={() => setShowHypothesis(!showHypothesis)}
            className={`px-2.5 py-1 rounded border transition-colors ${
              showHypothesis
                ? 'bg-cyan-950/60 border-cyan-600 text-cyan-200'
                : 'bg-neutral-900 border-neutral-800 text-neutral-500'
            }`}
          >
            [HIPÓTESIS]
          </button>
          <button
            onClick={() => setShowObserved(!showObserved)}
            className={`px-2.5 py-1 rounded border transition-colors ${
              showObserved
                ? 'bg-amber-950/60 border-amber-600 text-amber-200'
                : 'bg-neutral-900 border-neutral-800 text-neutral-500'
            }`}
          >
            [OBSERVADO / SIMULACIÓN]
          </button>
          <button
            onClick={() => setShowDeviations(!showDeviations)}
            className={`px-2.5 py-1 rounded border transition-colors ${
              showDeviations
                ? 'bg-emerald-950/60 border-emerald-600 text-emerald-200'
                : 'bg-neutral-900 border-neutral-800 text-neutral-500'
            }`}
          >
            Vectores Δ
          </button>
          <button
            onClick={handleReset}
            title="Restablecer vectores de referencia"
            className="p-1.5 rounded border border-neutral-800 bg-neutral-900 text-neutral-400 hover:text-neutral-200"
          >
            <RotateCcw className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Main Split Console: D3 SVG Chart + Calibration/Deviation Inspector */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left: D3 Radial Chart + Live Crosshair HUD */}
        <div className="lg:col-span-6 flex flex-col items-center bg-[#090b10] border border-neutral-800/80 rounded-xl p-4 space-y-3">
          <svg
            ref={svgRef}
            className="w-full max-w-[380px] h-[340px] select-none overflow-visible"
          />

          {/* Axis Crosshair Telemetry Readout */}
          <div className="w-full grid grid-cols-4 gap-2 pt-3 border-t border-neutral-800/80 text-center font-mono">
            <div className="bg-neutral-950 border border-neutral-800 rounded p-2">
              <span className="text-[9px] uppercase text-neutral-500 block">Eje Activo</span>
              <span className="text-[11px] font-bold text-neutral-200 truncate block">
                {hoveredAxis.label.split(' ')[0]}
              </span>
            </div>
            <div className="bg-neutral-950 border border-neutral-800 rounded p-2">
              <span className="text-[9px] uppercase text-cyan-400 block">[HIPÓTESIS]</span>
              <span className="text-sm font-bold tabular-nums text-cyan-300">
                {hoveredAxis.hypothesisVal}
              </span>
            </div>
            <div className="bg-neutral-950 border border-neutral-800 rounded p-2">
              <span className="text-[9px] uppercase text-amber-400 block">[OBSERVADO]</span>
              <span className="text-sm font-bold tabular-nums text-amber-300">
                {hoveredAxis.observedVal}
              </span>
            </div>
            <div className="bg-neutral-950 border border-neutral-800 rounded p-2">
              <span className="text-[9px] uppercase text-neutral-400 block">Desviación Δ</span>
              <span
                className={`text-sm font-bold tabular-nums ${
                  Math.abs(deltaHovered) >= 10 ? 'text-rose-400' : 'text-emerald-400'
                }`}
              >
                {deltaHovered >= 0 ? `+${deltaHovered}` : deltaHovered}
              </span>
            </div>
          </div>
        </div>

        {/* Right: RMS Deviation Summary & Interactive Calibration Matrix */}
        <div className="lg:col-span-6 space-y-4">
          <div className="grid grid-cols-2 gap-3">
            <div className="bg-neutral-900/60 border border-neutral-800 rounded-xl p-3.5">
              <span className="text-[10px] font-mono uppercase text-neutral-400 block">
                Desviación RMS (Hipótesis vs Observado)
              </span>
              <div className="flex items-baseline gap-2 mt-1">
                <span className="text-2xl font-mono font-bold tabular-nums text-amber-400">
                  {rmsDeviation.toFixed(2)}
                </span>
                <span className="text-[11px] font-mono text-neutral-500">pts · DEMO_SYNTHETIC</span>
              </div>
            </div>

            <div className="bg-neutral-900/60 border border-neutral-800 rounded-xl p-3.5">
              <span className="text-[10px] font-mono uppercase text-neutral-400 block">
                Brecha vs Vector Ref. SFI ({hoveredAxis.label.split(' ')[0]})
              </span>
              <div className="flex items-baseline gap-2 mt-1">
                <span
                  className={`text-2xl font-mono font-bold tabular-nums ${
                    Math.abs(deltaRef) >= 10 ? 'text-rose-400' : 'text-emerald-400'
                  }`}
                >
                  {deltaRef >= 0 ? `+${deltaRef}` : deltaRef}
                </span>
                <span className="text-[11px] font-mono text-neutral-500">
                  Ref: {hoveredAxis.referenceVal} {hoveredAxis.unit}
                </span>
              </div>
            </div>
          </div>

          {/* Interactive Dimension Calibration Controls */}
          <div className="bg-neutral-900/40 border border-neutral-800 rounded-xl p-4 space-y-3">
            <div className="flex items-center justify-between border-b border-neutral-800 pb-2">
              <span className="text-xs font-mono uppercase text-neutral-300 flex items-center gap-1.5">
                <Sliders className="w-3.5 h-3.5 text-cyan-400" />
                <span>Calibración Interactiva de Variables</span>
              </span>
              <span className="text-[10px] font-mono text-neutral-500">
                Pasa el cursor o ajusta para medir Δ
              </span>
            </div>

            <div className="space-y-2.5 max-h-[260px] overflow-y-auto pr-1">
              {axes.map((axis) => {
                const diff = axis.observedVal - axis.hypothesisVal;
                const isActive = axis.key === hoveredAxisKey;
                return (
                  <div
                    key={axis.key}
                    onMouseEnter={() => setHoveredAxisKey(axis.key)}
                    className={`p-2.5 rounded-lg border transition-colors ${
                      isActive
                        ? 'bg-neutral-900 border-cyan-700/70'
                        : 'bg-neutral-950/70 border-neutral-800/80'
                    }`}
                  >
                    <div className="flex items-center justify-between text-[11px] font-mono mb-1.5">
                      <span className="text-neutral-200 font-semibold">{axis.label}</span>
                      <div className="flex items-center gap-2 tabular-nums">
                        <span className="text-purple-400">Ref:{axis.referenceVal}</span>
                        <span className="text-cyan-400">Hip:{axis.hypothesisVal}</span>
                        <span className="text-amber-400">Obs:{axis.observedVal}</span>
                        <span
                          className={`font-bold ${
                            Math.abs(diff) >= 10 ? 'text-rose-400' : 'text-emerald-400'
                          }`}
                        >
                          Δ{diff >= 0 ? `+${diff}` : diff}
                        </span>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-3 text-[10px] font-mono">
                      <label className="flex items-center gap-2 text-cyan-400">
                        <span>H:</span>
                        <input
                          type="range"
                          min={10}
                          max={100}
                          value={axis.hypothesisVal}
                          onChange={(e) =>
                            handleUpdateAxis(axis.key, 'hypothesisVal', Number(e.target.value))
                          }
                          className="w-full accent-cyan-500 h-1 bg-neutral-800 rounded cursor-pointer"
                        />
                      </label>
                      <label className="flex items-center gap-2 text-amber-400">
                        <span>O:</span>
                        <input
                          type="range"
                          min={10}
                          max={100}
                          value={axis.observedVal}
                          onChange={(e) =>
                            handleUpdateAxis(axis.key, 'observedVal', Number(e.target.value))
                          }
                          className="w-full accent-amber-500 h-1 bg-neutral-800 rounded cursor-pointer"
                        />
                      </label>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          <div className="text-[11px] font-mono text-neutral-500 bg-neutral-900/30 border border-neutral-800/80 rounded-lg px-3 py-2">
            Salvaguarda: Los valores observados locales representan mediciones de prueba o <strong className="text-amber-400">DEMO_SYNTHETIC</strong> y no sustituyen al dictamen FAD canónico de SFI.
          </div>
        </div>
      </div>
    </div>
  );
};
