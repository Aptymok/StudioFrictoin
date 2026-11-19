/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * 
 * Top Bar Contract:
 * [Brand title, one line] — [4–5 nav links, 1–2 word labels, single-line] — [1 primary action]
 */

import React from 'react';
import { ShieldCheck, Download, AlertTriangle } from 'lucide-react';

interface HeaderProps {
  activeTab: string;
  onTabChange: (tab: string) => void;
  onOpenExport: () => void;
  onOpenGovernance: () => void;
  isDemo: boolean;
}

export const Header: React.FC<HeaderProps> = ({
  activeTab,
  onTabChange,
  onOpenExport,
  onOpenGovernance,
  isDemo,
}) => {
  return (
    <header className="sticky top-0 z-40 bg-neutral-950/90 backdrop-blur-md border-b border-neutral-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between gap-8 h-16">
          {/* Zone 1: Brand wordmark (single text element) */}
          <div className="flex items-center gap-3 shrink-0">
            <button
              onClick={() => onTabChange('studio')}
              className="text-left font-serif text-lg tracking-wider text-neutral-100 hover:text-amber-200 transition-colors whitespace-nowrap shrink-0"
            >
              SYSTEM FRICTION INSTITUTE
            </button>
            {isDemo && (
              <span className="text-[10px] font-mono tracking-widest text-amber-400/90 border border-amber-600/30 px-1.5 py-0.5 rounded-sm">
                OBSERVATORIO DEMO
              </span>
            )}
          </div>

          {/* Zone 2: Requested Visual Observatory Pages Navigation */}
          <nav className="hidden lg:flex items-center gap-5 text-xs tracking-wider uppercase font-medium text-neutral-400">
            <button
              onClick={() => onTabChange('studio')}
              className={`hover:text-neutral-100 transition-colors whitespace-nowrap shrink-0 pb-1 ${
                activeTab === 'studio'
                  ? 'text-neutral-100 border-b border-amber-500 font-semibold'
                  : ''
              }`}
            >
              STUDIO
            </button>
            <button
              onClick={() => onTabChange('frequency')}
              className={`hover:text-neutral-100 transition-colors whitespace-nowrap shrink-0 pb-1 ${
                activeTab === 'frequency'
                  ? 'text-neutral-100 border-b border-amber-500 font-semibold'
                  : ''
              }`}
            >
              FREQUENCY LAYER
            </button>
            <button
              onClick={() => onTabChange('multimedia')}
              className={`hover:text-neutral-100 transition-colors whitespace-nowrap shrink-0 pb-1 ${
                activeTab === 'multimedia'
                  ? 'text-neutral-100 border-b border-amber-500 font-semibold'
                  : ''
              }`}
            >
              MULTIMEDIA LAYER
            </button>
            <button
              onClick={() => onTabChange('image')}
              className={`hover:text-neutral-100 transition-colors whitespace-nowrap shrink-0 pb-1 ${
                activeTab === 'image'
                  ? 'text-neutral-100 border-b border-amber-500 font-semibold'
                  : ''
              }`}
            >
              IMAGE LAYER
            </button>
            <button
              onClick={() => onTabChange('friction_map')}
              className={`hover:text-neutral-100 transition-colors whitespace-nowrap shrink-0 pb-1 ${
                activeTab === 'friction_map'
                  ? 'text-neutral-100 border-b border-amber-500 font-semibold'
                  : ''
              }`}
            >
              FRICTION MAP
            </button>
            <button
              onClick={() => onTabChange('chatbot')}
              className={`hover:text-neutral-100 transition-colors whitespace-nowrap shrink-0 pb-1 ${
                activeTab === 'chatbot'
                  ? 'text-neutral-100 border-b border-amber-500 font-semibold'
                  : ''
              }`}
            >
              AI CHATBOT
            </button>
          </nav>

          {/* Zone 3: 1 primary action */}
          <div className="flex items-center gap-3 shrink-0">
            <button
              onClick={onOpenGovernance}
              title="Verificar desconexión de SFI y restricciones"
              className="hidden lg:flex items-center gap-1.5 px-2.5 py-1.5 text-xs text-neutral-400 hover:text-neutral-200 border border-neutral-800 rounded hover:border-neutral-700 transition-colors whitespace-nowrap shrink-0"
            >
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-500" />
              <span>Desconectado de SFI</span>
            </button>
            <button
              onClick={onOpenExport}
              className="flex items-center gap-2 px-3.5 py-2 text-xs font-medium tracking-wide uppercase text-neutral-950 bg-amber-400 hover:bg-amber-300 rounded transition-colors whitespace-nowrap shrink-0 shadow-sm"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Exportar a SFI</span>
            </button>
          </div>
        </div>
      </div>

      {/* Operational Sub-Ribbon: Archival rigor notice */}
      <div className="bg-neutral-900/60 border-t border-neutral-900 text-[11px] text-neutral-400 px-4 py-1.5">
        <div className="max-w-7xl mx-auto flex flex-wrap items-center justify-between gap-2">
          <div className="flex items-center gap-3">
            <span className="text-neutral-500 font-mono">AUTONOMÍA INSTRUMENTAL:</span>
            <span>Herramienta complementaria · SFI es la única autoridad canónica (MIHM / FAD / Reality Chain)</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-amber-500/90 flex items-center gap-1">
              <AlertTriangle className="w-3 h-3" />
              <span>Estado de exportación: BORRADOR PARA REVISIÓN</span>
            </span>
          </div>
        </div>
      </div>
    </header>
  );
};
