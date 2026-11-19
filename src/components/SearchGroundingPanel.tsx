/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * 
 * Search Grounding Panel using gemini-3.8-flash with googleSearch tool
 * Proxied via /api/gemini/search-grounding.
 * Strictly respects epistemic boundary: external web search is for reference contrast only;
 * does not constitute canonical SFI evidence.
 */

import React, { useState } from 'react';
import { Search, Globe, ExternalLink, Loader2, BookOpen, AlertTriangle, Check, Copy } from 'lucide-react';

interface SearchGroundingPanelProps {
  onAddAsSource?: (title: string, url: string) => void;
}

export const SearchGroundingPanel: React.FC<SearchGroundingPanelProps> = ({ onAddAsSource }) => {
  const [query, setQuery] = useState('Experimentos acústicos de resonancia subterránea física 1930s');
  const [isLoading, setIsLoading] = useState(false);
  const [groundedText, setGroundedText] = useState<string | null>(null);
  const [searchResults, setSearchResults] = useState<Array<{ title: string; url: string }>>([]);
  const [error, setError] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  const handleSearch = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!query.trim()) return;

    setIsLoading(true);
    setError(null);
    setGroundedText(null);
    setSearchResults([]);

    try {
      const res = await fetch('/api/gemini/search-grounding', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ query }),
      });

      const data = await res.json();
      if (data.error) {
        setError(data.error);
      } else {
        setGroundedText(data.groundedText || '');
        if (data.searchResults && Array.isArray(data.searchResults)) {
          setSearchResults(data.searchResults);
        } else if (data.groundingMetadata?.searchSources) {
          setSearchResults(data.groundingMetadata.searchSources);
        }
      }
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : String(err);
      setError(`Error en la consulta de búsqueda: ${msg}`);
    } finally {
      setIsLoading(false);
    }
  };

  const handleCopy = () => {
    if (!groundedText) return;
    navigator.clipboard.writeText(groundedText);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="bg-neutral-900/40 border border-neutral-800 rounded-lg p-5 space-y-4 text-xs">
      {/* Title & Epistemic Guardrail */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-neutral-800 pb-3">
        <div className="flex items-center gap-2">
          <Globe className="w-4 h-4 text-blue-400" />
          <h3 className="text-sm font-serif font-medium text-neutral-100">
            Contraste de Fuentes & Grounding Web (gemini-3.8-flash + Google Search)
          </h3>
        </div>
        <span className="text-[10px] font-mono uppercase bg-neutral-950 border border-neutral-800 text-neutral-400 px-2 py-0.5 rounded">
          CONTRASTE EXTERNO (NO CANÓNICO SFI)
        </span>
      </div>

      <p className="text-[11px] text-neutral-400 font-sans leading-relaxed">
        Consulta fuentes académicas, históricas y documentales públicas con <strong className="text-neutral-300 font-mono">gemini-3.8-flash</strong> utilizando la herramienta nativa Google Search. 
        <span className="text-amber-400/90 block mt-1 font-mono">
          Advertencia SFI: Las referencias recuperadas de la web abierta sirven de contraste contextual; no constituyen validación canónica de SFI ni modifican el núcleo institucional.
        </span>
      </p>

      {/* Query Input */}
      <form onSubmit={handleSearch} className="flex gap-2">
        <div className="relative flex-1">
          <Search className="w-3.5 h-3.5 absolute left-3 top-3 text-neutral-500" />
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Introduce tema de investigación o archivo histórico..."
            className="w-full bg-neutral-950 border border-neutral-800 rounded pl-9 pr-3 py-2 text-xs text-neutral-100 focus:outline-none focus:border-blue-500 font-sans"
          />
        </div>
        <button
          type="submit"
          disabled={isLoading}
          className="flex items-center gap-2 px-4 py-2 bg-neutral-800 hover:bg-neutral-700 text-neutral-100 font-mono uppercase text-[11px] rounded transition-colors disabled:opacity-50 shrink-0"
        >
          {isLoading ? (
            <>
              <Loader2 className="w-3.5 h-3.5 animate-spin text-blue-400" />
              <span>Buscando...</span>
            </>
          ) : (
            <>
              <Search className="w-3.5 h-3.5 text-blue-400" />
              <span>Buscar Fuentes</span>
            </>
          )}
        </button>
      </form>

      {error && (
        <div className="p-3 bg-rose-950/40 border border-rose-900/60 rounded text-rose-300 flex items-center gap-2 text-[11px]">
          <AlertTriangle className="w-3.5 h-3.5 text-rose-400 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* Results */}
      {groundedText && (
        <div className="bg-neutral-950/90 border border-neutral-800 rounded p-4 space-y-3">
          <div className="flex items-center justify-between border-b border-neutral-800/80 pb-2">
            <span className="font-mono text-[11px] text-blue-400 uppercase tracking-wider flex items-center gap-1.5">
              <BookOpen className="w-3.5 h-3.5" />
              <span>Síntesis Contrastada con Google Search</span>
            </span>
            <button
              onClick={handleCopy}
              className="flex items-center gap-1 text-[11px] font-mono text-neutral-400 hover:text-neutral-200 transition-colors"
            >
              {copied ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
              <span>{copied ? 'Copiado' : 'Copiar Síntesis'}</span>
            </button>
          </div>

          <div className="text-neutral-200 leading-relaxed font-sans text-xs space-y-2 whitespace-pre-wrap">
            {groundedText}
          </div>

          {searchResults.length > 0 && (
            <div className="pt-3 border-t border-neutral-800 space-y-2">
              <span className="text-[10px] font-mono uppercase tracking-wider text-neutral-400 block">
                Fuentes Citadas en el Grounding:
              </span>
              <div className="flex flex-wrap gap-2">
                {searchResults.map((source, idx) => (
                  <div
                    key={idx}
                    className="flex items-center gap-1.5 bg-neutral-900 border border-neutral-800 px-2.5 py-1 rounded text-[11px] text-neutral-300 hover:border-neutral-700 transition-colors"
                  >
                    <ExternalLink className="w-3 h-3 text-blue-400 shrink-0" />
                    <span className="truncate max-w-xs">{source.title || source.url}</span>
                    {onAddAsSource && (
                      <button
                        onClick={() => onAddAsSource(source.title, source.url)}
                        className="ml-1 text-[9px] font-mono uppercase bg-neutral-800 hover:bg-neutral-700 px-1 py-0.5 rounded text-neutral-300"
                        title="Vincular como referencia al proyecto"
                      >
                        Vincular
                      </button>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
