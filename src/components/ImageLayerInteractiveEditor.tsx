/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 *
 * IMAGE LAYER — INTERACTIVE COMPOSITOR & AI IMAGE STUDIO
 * Soporta:
 * 1. Generación de imagen desde texto con gemini-nano-banana-2.1
 * 2. Carga de imagen local (<input type="file" accept="image/*">)
 * 3. Editor interactivo de capas sobre lienzo con herramientas:
 *    - Seleccionar (Select)
 *    - Mover de lugar (Drag & Move X/Y)
 *    - Intercambiar imagen / orden (Swap)
 *    - Eliminar capa (Delete)
 * 4. Exportación de composición a biblioteca con procedencia DEMO_SYNTHETIC.
 */

import React, { useState, useRef } from 'react';
import { VisualAssetProposal } from '../types';
import {
  MousePointer2,
  Move,
  ArrowLeftRight,
  Trash2,
  Upload,
  Sparkles,
  Plus,
  Loader2,
  Check,
  AlertTriangle,
  Layers,
  Image as ImageIcon,
  ArrowUp,
  ArrowDown,
} from 'lucide-react';

type EditorTool = 'select' | 'move' | 'swap' | 'delete';

interface CanvasLayer {
  id: string;
  label: string;
  imageUrl: string;
  x: number; // % 0-100
  y: number; // % 0-100
  widthPct: number; // % 10-100
  opacity: number; // 0.1-1
  rotation: number; // deg
}

interface ImageLayerInteractiveEditorProps {
  proposals: VisualAssetProposal[];
  onAddProposal: (proposal: VisualAssetProposal) => void;
}

export const ImageLayerInteractiveEditor: React.FC<ImageLayerInteractiveEditorProps> = ({
  proposals,
  onAddProposal,
}) => {
  const [activeTool, setActiveTool] = useState<EditorTool>('select');
  const [layers, setLayers] = useState<CanvasLayer[]>(() => {
    const initial: CanvasLayer[] = [];
    if (proposals[0]) {
      initial.push({
        id: 'layer-base',
        label: `Base: ${proposals[0].title.slice(0, 26)}`,
        imageUrl: proposals[0].imageUrl,
        x: 50,
        y: 50,
        widthPct: 92,
        opacity: 1,
        rotation: 0,
      });
    }
    if (proposals[1]) {
      initial.push({
        id: 'layer-overlay-1',
        label: `Inserto: ${proposals[1].title.slice(0, 24)}`,
        imageUrl: proposals[1].imageUrl,
        x: 74,
        y: 28,
        widthPct: 32,
        opacity: 0.92,
        rotation: 0,
      });
    }
    return initial;
  });

  const [selectedLayerId, setSelectedLayerId] = useState<string>(layers[0]?.id || '');
  const [prompt, setPrompt] = useState(
    'Aparato acústico de latón bruñido de 1934 sobre mesa de roble en bóveda de piedra, luz cenital suave, estética científica documental.'
  );
  const [aspectRatio, setAspectRatio] = useState<'16:9' | '1:1' | '4:5' | '9:16'>('16:9');
  const [isGenerating, setIsGenerating] = useState(false);
  const [aiError, setAiError] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);

  const stageRef = useRef<HTMLDivElement | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const dragStateRef = useRef<{ layerId: string; offsetX: number; offsetY: number } | null>(null);

  const selectedLayer = layers.find((l) => l.id === selectedLayerId) || layers[0];

  const showToast = (msg: string) => {
    setNotice(msg);
    setTimeout(() => setNotice(null), 3500);
  };

  // Upload local image and insert as editable canvas layer
  const handleUploadLocalImage = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = () => {
      const dataUrl = reader.result as string;
      const newLayer: CanvasLayer = {
        id: `layer-upload-${Date.now()}`,
        label: `Carga: ${file.name.slice(0, 24)}`,
        imageUrl: dataUrl,
        x: 50,
        y: 50,
        widthPct: layers.length === 0 ? 92 : 42,
        opacity: 1,
        rotation: 0,
      };
      setLayers((prev) => [...prev, newLayer]);
      setSelectedLayerId(newLayer.id);
      showToast(`Imagen "${file.name}" cargada como capa editable (DEMO_SYNTHETIC).`);
    };
    reader.readAsDataURL(file);
  };

  // Text-to-Image generation using gemini-nano-banana-2.1
  const handleGenerateImage = async () => {
    if (!prompt.trim() || isGenerating) return;
    setIsGenerating(true);
    setAiError(null);

    try {
      const res = await fetch('/api/gemini/image', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ prompt, aspectRatio }),
      });

      const data = await res.json();
      if (!res.ok || data.error) {
        setAiError(data.error || `Error HTTP ${res.status}`);
      } else if (data.imageBase64) {
        const dataUrl = `data:${data.mimeType || 'image/png'};base64,${data.imageBase64}`;
        const newLayer: CanvasLayer = {
          id: `layer-ai-${Date.now()}`,
          label: `Banana 2.1: ${prompt.slice(0, 20)}...`,
          imageUrl: dataUrl,
          x: 50,
          y: 50,
          widthPct: layers.length === 0 ? 92 : 48,
          opacity: 1,
          rotation: 0,
        };
        setLayers((prev) => [...prev, newLayer]);
        setSelectedLayerId(newLayer.id);
        showToast('Imagen generada con gemini-nano-banana-2.1 e insertada al lienzo (DEMO_SYNTHETIC).');
      } else if (data.isSimulated) {
        setAiError(
          data.notes ||
            'Modo sin GEMINI_API_KEY activa: usa el botón Cargar Imagen o selecciona un activo del catálogo.'
        );
      }
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : String(err);
      setAiError(`Fallo de conexión: ${msg}`);
    } finally {
      setIsGenerating(false);
    }
  };

  // Canvas pointer handling for Select, Move, and Delete tools
  const handleLayerPointerDown = (
    e: React.PointerEvent<HTMLDivElement>,
    layer: CanvasLayer
  ) => {
    e.stopPropagation();

    if (activeTool === 'delete') {
      handleDeleteLayer(layer.id);
      return;
    }

    setSelectedLayerId(layer.id);

    if (activeTool === 'move' && stageRef.current) {
      const rect = stageRef.current.getBoundingClientRect();
      const pointerXPct = ((e.clientX - rect.left) / rect.width) * 100;
      const pointerYPct = ((e.clientY - rect.top) / rect.height) * 100;
      dragStateRef.current = {
        layerId: layer.id,
        offsetX: pointerXPct - layer.x,
        offsetY: pointerYPct - layer.y,
      };
      (e.currentTarget as HTMLElement).setPointerCapture(e.pointerId);
    }
  };

  const handleStagePointerMove = (e: React.PointerEvent<HTMLDivElement>) => {
    if (!dragStateRef.current || !stageRef.current || activeTool !== 'move') return;
    const { layerId, offsetX, offsetY } = dragStateRef.current;
    const rect = stageRef.current.getBoundingClientRect();
    const rawX = ((e.clientX - rect.left) / rect.width) * 100 - offsetX;
    const rawY = ((e.clientY - rect.top) / rect.height) * 100 - offsetY;

    const clampedX = Math.max(5, Math.min(95, Number(rawX.toFixed(1))));
    const clampedY = Math.max(5, Math.min(95, Number(rawY.toFixed(1))));

    setLayers((prev) =>
      prev.map((l) => (l.id === layerId ? { ...l, x: clampedX, y: clampedY } : l))
    );
  };

  const handleStagePointerUp = () => {
    dragStateRef.current = null;
  };

  const handleDeleteLayer = (id: string) => {
    setLayers((prev) => {
      const filtered = prev.filter((l) => l.id !== id);
      if (selectedLayerId === id) {
        setSelectedLayerId(filtered[0]?.id || '');
      }
      return filtered;
    });
    showToast('Capa eliminada del lienzo.');
  };

  // Swap selected layer Z-order or swap its image with a chosen catalog asset
  const handleSwapOrder = (id: string, dir: 'up' | 'down') => {
    setLayers((prev) => {
      const idx = prev.findIndex((l) => l.id === id);
      if (idx === -1) return prev;
      const targetIdx = dir === 'up' ? idx + 1 : idx - 1;
      if (targetIdx < 0 || targetIdx >= prev.length) return prev;
      const copy = [...prev];
      const temp = copy[idx];
      copy[idx] = copy[targetIdx];
      copy[targetIdx] = temp;
      return copy;
    });
    showToast('Orden de capas intercambiado.');
  };

  const handleSwapLayerImage = (asset: VisualAssetProposal) => {
    if (!selectedLayer) return;
    setLayers((prev) =>
      prev.map((l) =>
        l.id === selectedLayer.id
          ? {
              ...l,
              imageUrl: asset.imageUrl,
              label: `Intercambio: ${asset.title.slice(0, 22)}`,
            }
          : l
      )
    );
    showToast(`Imagen de la capa intercambiada por "${asset.title}".`);
  };

  const handleAddCatalogAssetAsLayer = (asset: VisualAssetProposal) => {
    const newLayer: CanvasLayer = {
      id: `layer-cat-${Date.now()}`,
      label: asset.title.slice(0, 24),
      imageUrl: asset.imageUrl,
      x: 42 + (layers.length % 3) * 8,
      y: 45 + (layers.length % 3) * 6,
      widthPct: 40,
      opacity: 0.95,
      rotation: 0,
    };
    setLayers((prev) => [...prev, newLayer]);
    setSelectedLayerId(newLayer.id);
    showToast(`Activo "${asset.title}" añadido como nueva capa.`);
  };

  // Flatten composite onto an offscreen canvas and export to proposals library
  const handleExportCompositeToLibrary = async () => {
    if (layers.length === 0) return;

    const canvas = document.createElement('canvas');
    canvas.width = 1280;
    canvas.height = 720;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    ctx.fillStyle = '#090b10';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    for (const layer of layers) {
      try {
        const img = new Image();
        img.crossOrigin = 'anonymous';
        await new Promise<void>((resolve, reject) => {
          img.onload = () => resolve();
          img.onerror = () => reject(new Error('Image load error'));
          img.src = layer.imageUrl;
        });

        const drawW = (layer.widthPct / 100) * canvas.width;
        const aspect = img.naturalHeight / Math.max(1, img.naturalWidth);
        const drawH = drawW * aspect;
        const cx = (layer.x / 100) * canvas.width;
        const cy = (layer.y / 100) * canvas.height;

        ctx.save();
        ctx.globalAlpha = layer.opacity;
        ctx.translate(cx, cy);
        ctx.rotate((layer.rotation * Math.PI) / 180);
        ctx.drawImage(img, -drawW / 2, -drawH / 2, drawW, drawH);
        ctx.restore();
      } catch {
        // Skip tainted/unreadable external frames safely
      }
    }

    // Stamp unavoidable DEMO_SYNTHETIC watermark on exported composite
    ctx.fillStyle = 'rgba(9, 11, 16, 0.85)';
    ctx.fillRect(16, 16, 330, 26);
    ctx.fillStyle = '#fbbf24';
    ctx.font = 'bold 12px monospace';
    ctx.fillText('DEMOSTRACIÓN · DEMO_SYNTHETIC (COMPOSICIÓN)', 26, 34);

    let compositeDataUrl = layers[0].imageUrl;
    try {
      compositeDataUrl = canvas.toDataURL('image/png');
    } catch {
      compositeDataUrl = layers[layers.length - 1].imageUrl;
    }

    const baseTemplate = proposals[0];
    const newProposal: VisualAssetProposal = {
      id: `prop-comp-${Date.now()}`,
      title: `Composición Multicapa (${layers.length} capas)`,
      caption: `Composición visual editada en Image Layer Studio con ${layers.length} elementos posicionados.`,
      visualType: 'concepto_artistico',
      provenanceRecord: 'DEMO_SYNTHETIC',
      isDemoSynthetic: true,
      status: 'activo_sintetico_renderizado',
      rightsWarning:
        'AVISO: Composición sintética creada en Image Layer Interactive Editor. Clasificada como DEMO_SYNTHETIC. Sin auto-atribución de derechos.',
      imageUrl: compositeDataUrl,
      technicalSpecs: {
        aspect: '16:9',
        lighting: 'Composición multicapa de estudio',
        palette: 'Neutral SFI Obsidian / Ámbar',
        optics: 'Plano compuesto 1280x720',
      },
      platformAdaptations: baseTemplate.platformAdaptations,
      editablePrompt: prompt,
      preferredSelection: false,
      preferenceRationale: 'Composición manual e IA desde Editor de Capas.',
      preferenceEpistemicNature: 'SIMULACION',
    };

    onAddProposal(newProposal);
    showToast('¡Composición guardada en la Biblioteca de Propuestas como DEMO_SYNTHETIC!');
  };

  return (
    <div className="bg-neutral-900/40 border border-neutral-800 rounded-xl p-6 space-y-6">
      {/* Toolbar Header */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 border-b border-neutral-800 pb-4">
        <div>
          <span className="text-xs font-mono uppercase tracking-widest text-cyan-400 font-semibold block">
            EDITOR INTERACTIVO DE IMAGEN Y CAPAS · DEMO_SYNTHETIC
          </span>
          <h3 className="text-lg font-serif font-bold text-neutral-100">
            Lienzo de Composición: Seleccionar, Mover, Intercambiar, Eliminar y Generar IA
          </h3>
        </div>

        {/* Interactive Tool Palette */}
        <div className="flex flex-wrap items-center gap-1.5 bg-neutral-950 p-1.5 rounded-lg border border-neutral-800">
          <button
            onClick={() => setActiveTool('select')}
            className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-mono uppercase rounded transition-colors ${
              activeTool === 'select'
                ? 'bg-cyan-500 text-neutral-950 font-bold'
                : 'text-neutral-400 hover:text-neutral-200'
            }`}
          >
            <MousePointer2 className="w-3.5 h-3.5" />
            <span>Seleccionar</span>
          </button>
          <button
            onClick={() => setActiveTool('move')}
            className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-mono uppercase rounded transition-colors ${
              activeTool === 'move'
                ? 'bg-amber-500 text-neutral-950 font-bold'
                : 'text-neutral-400 hover:text-neutral-200'
            }`}
          >
            <Move className="w-3.5 h-3.5" />
            <span>Mover</span>
          </button>
          <button
            onClick={() => setActiveTool('swap')}
            className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-mono uppercase rounded transition-colors ${
              activeTool === 'swap'
                ? 'bg-purple-500 text-neutral-950 font-bold'
                : 'text-neutral-400 hover:text-neutral-200'
            }`}
          >
            <ArrowLeftRight className="w-3.5 h-3.5" />
            <span>Intercambiar</span>
          </button>
          <button
            onClick={() => setActiveTool('delete')}
            className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-mono uppercase rounded transition-colors ${
              activeTool === 'delete'
                ? 'bg-rose-600 text-white font-bold'
                : 'text-neutral-400 hover:text-rose-400'
            }`}
          >
            <Trash2 className="w-3.5 h-3.5" />
            <span>Eliminar</span>
          </button>
        </div>
      </div>

      {notice && (
        <div className="p-3 bg-emerald-950/50 border border-emerald-800 rounded-lg text-xs text-emerald-200 flex items-center gap-2">
          <Check className="w-4 h-4 text-emerald-400 shrink-0" />
          <span>{notice}</span>
        </div>
      )}

      {aiError && (
        <div className="p-3 bg-rose-950/40 border border-rose-800 rounded-lg text-xs text-rose-200 flex items-center gap-2">
          <AlertTriangle className="w-4 h-4 text-rose-400 shrink-0" />
          <span>{aiError}</span>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Main Interactive Stage (Left 8 cols) */}
        <div className="lg:col-span-8 space-y-4">
          <div
            ref={stageRef}
            onPointerMove={handleStagePointerMove}
            onPointerUp={handleStagePointerUp}
            onPointerLeave={handleStagePointerUp}
            className={`relative aspect-video bg-[#080a0f] border border-neutral-800 rounded-xl overflow-hidden select-none ${
              activeTool === 'move'
                ? 'cursor-grab active:cursor-grabbing'
                : activeTool === 'delete'
                ? 'cursor-not-allowed'
                : 'cursor-crosshair'
            }`}
          >
            {/* Subtle alignment grid */}
            <div
              className="absolute inset-0 pointer-events-none opacity-20"
              style={{
                backgroundImage:
                  'linear-gradient(to right, #1e293b 1px, transparent 1px), linear-gradient(to bottom, #1e293b 1px, transparent 1px)',
                backgroundSize: '40px 40px',
              }}
            />

            {layers.length === 0 && (
              <div className="absolute inset-0 flex flex-col items-center justify-center text-neutral-500 font-mono text-xs gap-2">
                <ImageIcon className="w-8 h-8 text-neutral-700" />
                <span>Lienzo vacío. Carga una imagen, añade del catálogo o genera con Nano Banana 2.1.</span>
              </div>
            )}

            {layers.map((layer) => {
              const isSelected = layer.id === selectedLayerId;
              return (
                <div
                  key={layer.id}
                  onPointerDown={(e) => handleLayerPointerDown(e, layer)}
                  style={{
                    left: `${layer.x}%`,
                    top: `${layer.y}%`,
                    width: `${layer.widthPct}%`,
                    opacity: layer.opacity,
                    transform: `translate(-50%, -50%) rotate(${layer.rotation}deg)`,
                  }}
                  className={`absolute transition-shadow ${
                    isSelected
                      ? 'ring-2 ring-amber-400 shadow-[0_0_20px_rgba(245,158,11,0.25)]'
                      : 'hover:ring-1 hover:ring-cyan-400/60'
                  }`}
                >
                  <img
                    src={layer.imageUrl}
                    alt={layer.label}
                    draggable={false}
                    className="w-full h-auto rounded pointer-events-none block"
                  />
                  {isSelected && (
                    <span className="absolute -top-5 left-0 bg-amber-500 text-neutral-950 font-mono text-[9px] font-bold px-1.5 py-0.5 rounded-t whitespace-nowrap">
                      {layer.label} ({layer.x}%, {layer.y}%)
                    </span>
                  )}
                </div>
              );
            })}

            {/* Inescapable DEMO_SYNTHETIC watermark */}
            <div className="absolute top-3 left-3 bg-neutral-950/90 border border-amber-700/80 px-2.5 py-1 rounded text-[10px] font-mono text-amber-300 pointer-events-none">
              LIENZO INTERACTIVO · DEMO_SYNTHETIC
            </div>

            <div className="absolute bottom-3 right-3 bg-neutral-950/90 border border-neutral-800 px-2.5 py-1 rounded text-[10px] font-mono text-neutral-300 pointer-events-none">
              Herramienta: <strong className="text-cyan-400 uppercase">{activeTool}</strong>
            </div>
          </div>

          {/* Text-to-Image + Local Upload Bar */}
          <div className="bg-neutral-950 border border-neutral-800 rounded-xl p-4 space-y-3">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <span className="text-xs font-mono uppercase text-amber-400 font-semibold flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5" />
                <span>Generar Nueva Capa (Texto a Imagen · gemini-nano-banana-2.1) o Cargar Archivo</span>
              </span>

              <div className="flex items-center gap-2">
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  onChange={handleUploadLocalImage}
                  className="hidden"
                />
                <button
                  onClick={() => fileInputRef.current?.click()}
                  className="flex items-center gap-1.5 px-3 py-1.5 bg-neutral-900 hover:bg-neutral-800 border border-neutral-700 rounded text-xs font-mono text-neutral-200 transition-colors"
                >
                  <Upload className="w-3.5 h-3.5 text-cyan-400" />
                  <span>Cargar Imagen Local</span>
                </button>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row gap-2">
              <input
                type="text"
                value={prompt}
                onChange={(e) => setPrompt(e.target.value)}
                placeholder="Describe la imagen o elemento a generar con gemini-nano-banana-2.1..."
                className="flex-1 bg-neutral-900 border border-neutral-800 rounded-lg px-3 py-2 text-xs text-neutral-100 font-mono focus:outline-none focus:border-amber-500"
              />
              <select
                value={aspectRatio}
                onChange={(e) => setAspectRatio(e.target.value as '16:9' | '1:1' | '4:5' | '9:16')}
                className="bg-neutral-900 border border-neutral-800 rounded-lg px-2.5 py-2 text-xs font-mono text-neutral-200"
              >
                <option value="16:9">16:9</option>
                <option value="1:1">1:1</option>
                <option value="4:5">4:5</option>
                <option value="9:16">9:16</option>
              </select>
              <button
                onClick={handleGenerateImage}
                disabled={isGenerating || !prompt.trim()}
                className="flex items-center justify-center gap-1.5 px-4 py-2 bg-amber-500 hover:bg-amber-400 text-neutral-950 font-mono text-xs uppercase font-bold rounded-lg transition-colors disabled:opacity-50 shrink-0"
              >
                {isGenerating ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Sparkles className="w-3.5 h-3.5" />}
                <span>Generar IA</span>
              </button>
            </div>
          </div>
        </div>

        {/* Right Panel: Layer Stack, Properties & Swap Picker (Right 4 cols) */}
        <div className="lg:col-span-4 space-y-4">
          {/* Layer Stack */}
          <div className="bg-neutral-950 border border-neutral-800 rounded-xl p-4 space-y-3">
            <div className="flex items-center justify-between border-b border-neutral-800 pb-2">
              <span className="text-xs font-mono uppercase text-neutral-300 flex items-center gap-1.5">
                <Layers className="w-3.5 h-3.5 text-cyan-400" />
                <span>Capas Activas ({layers.length})</span>
              </span>
              <button
                onClick={handleExportCompositeToLibrary}
                disabled={layers.length === 0}
                className="flex items-center gap-1 px-2.5 py-1 bg-emerald-500 hover:bg-emerald-400 text-neutral-950 font-mono text-[10px] uppercase font-bold rounded disabled:opacity-40"
              >
                <Plus className="w-3 h-3" />
                <span>Guardar en Biblioteca</span>
              </button>
            </div>

            <div className="space-y-2 max-h-44 overflow-y-auto pr-1">
              {[...layers].reverse().map((layer) => {
                const isSelected = layer.id === selectedLayerId;
                return (
                  <div
                    key={layer.id}
                    onClick={() => setSelectedLayerId(layer.id)}
                    className={`flex items-center justify-between gap-2 p-2 rounded-lg border cursor-pointer text-xs font-mono ${
                      isSelected
                        ? 'bg-neutral-900 border-amber-500 text-neutral-100'
                        : 'bg-neutral-900/40 border-neutral-800 text-neutral-400 hover:text-neutral-200'
                    }`}
                  >
                    <div className="flex items-center gap-2 min-w-0">
                      <img
                        src={layer.imageUrl}
                        alt={layer.label}
                        className="w-8 h-8 rounded object-cover border border-neutral-800 shrink-0"
                      />
                      <span className="truncate text-[11px]">{layer.label}</span>
                    </div>
                    <div className="flex items-center gap-1 shrink-0">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleSwapOrder(layer.id, 'up');
                        }}
                        className="p-1 hover:text-cyan-400"
                        title="Subir capa"
                      >
                        <ArrowUp className="w-3 h-3" />
                      </button>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleSwapOrder(layer.id, 'down');
                        }}
                        className="p-1 hover:text-cyan-400"
                        title="Bajar capa"
                      >
                        <ArrowDown className="w-3 h-3" />
                      </button>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleDeleteLayer(layer.id);
                        }}
                        className="p-1 hover:text-rose-400"
                        title="Eliminar capa"
                      >
                        <Trash2 className="w-3 h-3" />
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Selected Layer Geometry Controls */}
          {selectedLayer && (
            <div className="bg-neutral-950 border border-neutral-800 rounded-xl p-4 space-y-3 text-xs font-mono">
              <span className="text-[11px] uppercase text-amber-400 font-semibold block border-b border-neutral-800 pb-2">
                Ajuste de Capa Seleccionada
              </span>

              <div className="space-y-2">
                <label className="flex justify-between text-[10px] text-neutral-400">
                  <span>Tamaño (% Ancho)</span>
                  <span className="text-neutral-200 tabular-nums">{selectedLayer.widthPct}%</span>
                </label>
                <input
                  type="range"
                  min={12}
                  max={100}
                  value={selectedLayer.widthPct}
                  onChange={(e) =>
                    setLayers((prev) =>
                      prev.map((l) =>
                        l.id === selectedLayer.id ? { ...l, widthPct: Number(e.target.value) } : l
                      )
                    )
                  }
                  className="w-full accent-amber-500 h-1 bg-neutral-800 rounded cursor-pointer"
                />

                <label className="flex justify-between text-[10px] text-neutral-400">
                  <span>Opacidad</span>
                  <span className="text-neutral-200 tabular-nums">
                    {Math.round(selectedLayer.opacity * 100)}%
                  </span>
                </label>
                <input
                  type="range"
                  min={15}
                  max={100}
                  value={Math.round(selectedLayer.opacity * 100)}
                  onChange={(e) =>
                    setLayers((prev) =>
                      prev.map((l) =>
                        l.id === selectedLayer.id
                          ? { ...l, opacity: Number(e.target.value) / 100 }
                          : l
                      )
                    )
                  }
                  className="w-full accent-cyan-500 h-1 bg-neutral-800 rounded cursor-pointer"
                />

                <label className="flex justify-between text-[10px] text-neutral-400">
                  <span>Rotación</span>
                  <span className="text-neutral-200 tabular-nums">{selectedLayer.rotation}°</span>
                </label>
                <input
                  type="range"
                  min={-45}
                  max={45}
                  value={selectedLayer.rotation}
                  onChange={(e) =>
                    setLayers((prev) =>
                      prev.map((l) =>
                        l.id === selectedLayer.id ? { ...l, rotation: Number(e.target.value) } : l
                      )
                    )
                  }
                  className="w-full accent-purple-500 h-1 bg-neutral-800 rounded cursor-pointer"
                />
              </div>
            </div>
          )}

          {/* Swap / Insert From Catalog */}
          <div className="bg-neutral-950 border border-neutral-800 rounded-xl p-4 space-y-2.5">
            <span className="text-[11px] font-mono uppercase text-neutral-400 block">
              {activeTool === 'swap'
                ? 'Haz clic para INTERCAMBIAR la capa seleccionada:'
                : 'Añadir o Intercambiar desde Biblioteca:'}
            </span>
            <div className="grid grid-cols-3 gap-2 max-h-36 overflow-y-auto">
              {proposals.map((asset) => (
                <button
                  key={asset.id}
                  onClick={() =>
                    activeTool === 'swap' && selectedLayer
                      ? handleSwapLayerImage(asset)
                      : handleAddCatalogAssetAsLayer(asset)
                  }
                  className="group relative aspect-video rounded overflow-hidden border border-neutral-800 hover:border-cyan-400 transition-colors"
                  title={
                    activeTool === 'swap'
                      ? `Intercambiar capa por ${asset.title}`
                      : `Añadir ${asset.title} como capa`
                  }
                >
                  <img
                    src={asset.imageUrl}
                    alt={asset.title}
                    className="w-full h-full object-cover"
                  />
                  <span className="absolute inset-0 bg-neutral-950/60 opacity-0 group-hover:opacity-100 flex items-center justify-center text-[9px] font-mono text-cyan-200 transition-opacity">
                    {activeTool === 'swap' ? 'INTERCAMBIAR' : '+ CAPA'}
                  </span>
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
