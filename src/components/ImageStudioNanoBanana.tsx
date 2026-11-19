/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * 
 * Image Studio for Creation & Editing using gemini-nano-banana-2.1
 * Proxied via /api/gemini/image.
 * Enforces mandatory DEMO_SYNTHETIC provenance stamp and rights disclaimer.
 */

import React, { useState } from 'react';
import { VisualAssetProposal } from '../types';
import { 
  Sparkles, 
  Image as ImageIcon, 
  Edit3, 
  Loader2, 
  Check, 
  AlertTriangle, 
  Maximize2, 
  Plus, 
  Layers,
  ArrowRight
} from 'lucide-react';

interface ImageStudioNanoBananaProps {
  currentProposals: VisualAssetProposal[];
  onAddProposal: (proposal: VisualAssetProposal) => void;
}

export const ImageStudioNanoBanana: React.FC<ImageStudioNanoBananaProps> = ({
  currentProposals,
  onAddProposal,
}) => {
  const [mode, setMode] = useState<'create' | 'edit'>('create');
  const [prompt, setPrompt] = useState('Fotograma de archivo de laboratorio subterráneo con bóveda abovedada de piedra, aparato de resonancia acústica de latón y mesa de roble macizo con tubos de vacío tenues.');
  const [aspectRatio, setAspectRatio] = useState<'1:1' | '16:9' | '4:5' | '9:16'>('16:9');
  const [selectedBaseAssetId, setSelectedBaseAssetId] = useState<string>(currentProposals[0]?.id || '');
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedImageBase64, setGeneratedImageBase64] = useState<string | null>(null);
  const [generatedMimeType, setGeneratedMimeType] = useState<string>('image/png');
  const [outputText, setOutputText] = useState<string>('');
  const [error, setError] = useState<string | null>(null);
  const [isAdded, setIsAdded] = useState(false);

  const selectedBaseAsset = currentProposals.find((p) => p.id === selectedBaseAssetId) || currentProposals[0];

  const handleGenerate = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!prompt.trim()) return;

    setIsGenerating(true);
    setError(null);
    setIsAdded(false);

    try {
      let base64ImageToSend: string | undefined = undefined;
      let mimeTypeToSend: string | undefined = undefined;

      if (mode === 'edit' && selectedBaseAsset) {
        // If image URL is base64 or remote, attempt to fetch/extract
        if (selectedBaseAsset.imageUrl.startsWith('data:')) {
          const parts = selectedBaseAsset.imageUrl.split(',');
          mimeTypeToSend = parts[0].split(':')[1].split(';')[0];
          base64ImageToSend = parts[1];
        } else {
          // Fetch image and convert to base64
          try {
            const resp = await fetch(selectedBaseAsset.imageUrl);
            const blob = await resp.blob();
            const reader = new FileReader();
            const b64Promise = new Promise<string>((resolve) => {
              reader.onloadend = () => {
                const b64 = (reader.result as string).split(',')[1];
                resolve(b64);
              };
            });
            reader.readAsDataURL(blob);
            base64ImageToSend = await b64Promise;
            mimeTypeToSend = blob.type || 'image/jpeg';
          } catch {
            console.warn('No se pudo descargar la imagen base; se procesará como generación de concepto nuevo.');
          }
        }
      }

      const res = await fetch('/api/gemini/image', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          prompt,
          base64Image: base64ImageToSend,
          mimeType: mimeTypeToSend,
          aspectRatio,
        }),
      });

      const data = await res.json();
      if (data.error) {
        setError(data.error);
      } else {
        if (data.imageBase64) {
          setGeneratedImageBase64(`data:${data.mimeType || 'image/png'};base64,${data.imageBase64}`);
          setGeneratedMimeType(data.mimeType || 'image/png');
        } else if (data.isSimulated) {
          // In simulated air-gap mode without API key, use fallback high-res demo artifact
          setGeneratedImageBase64(selectedBaseAsset?.imageUrl || 'https://images.unsplash.com/photo-1579783900882-c0d3dad7b119?auto=format&fit=crop&w=1200&q=80');
          setOutputText(data.notes || 'Especificación de render generada con gemini-nano-banana-2.1 en modo simulación.');
        }
        if (data.outputText) {
          setOutputText(data.outputText);
        }
      }
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : String(err);
      setError(`Error en la generación de imagen: ${msg}`);
    } finally {
      setIsGenerating(false);
    }
  };

  const handleAddAsProposal = () => {
    if (!generatedImageBase64) return;

    const newId = `prop-banana-${Date.now()}`;
    const newProposal: VisualAssetProposal = {
      id: newId,
      title: `Concepto Generado (${mode === 'create' ? 'Texto' : 'Edición'} Banana 2.1)`,
      caption: `Propuesta sintética formulada con gemini-nano-banana-2.1. Directiva: "${prompt.slice(0, 100)}..."`,
      visualType: 'concepto_artistico',
      provenanceRecord: 'DEMO_SYNTHETIC',
      isDemoSynthetic: true,
      status: 'activo_sintetico_renderizado',
      rightsWarning: 'AVISO JURÍDICO OBLIGATORIO: Generado con gemini-nano-banana-2.1 bajo régimen DEMO_SYNTHETIC. Sin auto-atribución de derechos de autor ni licencias abiertas.',
      imageUrl: generatedImageBase64,
      technicalSpecs: {
        aspect: aspectRatio,
        lighting: 'Modelado procedural de estudio PBR / cálido key y cool fill',
        palette: 'Tonos neutros ámbar y zinc con iluminación tenue',
        optics: 'Lente fija 50mm, f/2.8, encuadre de laboratorio',
      },
      platformAdaptations: {
        instagram: {
          formatName: 'Instagram Feed (1:1)',
          aspectRatio: '1:1',
          cropFocus: 'Centro del aparato',
          dimensions: '1080x1080',
          technicalNote: 'Encuadre cuadrado conservando cartela DEMO_SYNTHETIC.',
        },
        tiktok: {
          formatName: 'TikTok (9:16 Vertical)',
          aspectRatio: '9:16',
          cropFocus: 'Eje vertical de instrumentos',
          dimensions: '1080x1920',
          technicalNote: 'Zona segura superior e inferior respetada.',
        },
        youtube: {
          formatName: 'YouTube HD (16:9)',
          aspectRatio: '16:9',
          cropFocus: 'Plano general del banco',
          dimensions: '1920x1080',
          technicalNote: 'Miniatura y fotograma con marca obligatoria.',
        },
        facebook: {
          formatName: 'Facebook Share (1.91:1)',
          aspectRatio: '1.91:1',
          cropFocus: 'Composición horizontal',
          dimensions: '1200x628',
          technicalNote: 'Tarjeta de vista previa sin atribución de archivo canónico.',
        },
        linkedin: {
          formatName: 'LinkedIn Post (4:5)',
          aspectRatio: '4:5',
          cropFocus: 'Enfoque técnico',
          dimensions: '1080x1350',
          technicalNote: 'Formato editorial para cuaderno didáctico.',
        },
        web: {
          formatName: 'Web Archive Deep-Zoom',
          aspectRatio: aspectRatio,
          cropFocus: 'Detalle de inspección',
          dimensions: '1920x1080',
          technicalNote: 'Visor con zoom y metadatos de procedencia sintética.',
        },
      },
      editablePrompt: prompt,
      preferredSelection: false,
      preferenceRationale: 'Generado desde el Taller IA Banana 2.1.',
      preferenceEpistemicNature: 'SIMULACION',
    };

    onAddProposal(newProposal);
    setIsAdded(true);
  };

  return (
    <div className="bg-neutral-900/40 border border-neutral-800 rounded-lg p-6 space-y-6">
      {/* Title */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 border-b border-neutral-800 pb-4">
        <div>
          <div className="flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-amber-400" />
            <h3 className="text-base font-serif font-medium text-neutral-100">
              Taller de Generación & Edición de Imagen (gemini-nano-banana-2.1)
            </h3>
          </div>
          <p className="text-xs text-neutral-400 mt-1 max-w-2xl font-sans">
            Crea conceptos visuales o edita imágenes existentes mediante instrucciones. 
            <strong className="text-neutral-200"> Todos los resultados portan la marca permanente DEMO_SYNTHETIC.</strong>
          </p>
        </div>

        {/* Mode Selector */}
        <div className="flex items-center gap-1 p-1 bg-neutral-950 border border-neutral-800 rounded-lg shrink-0">
          <button
            onClick={() => setMode('create')}
            className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-mono uppercase rounded transition-colors ${
              mode === 'create'
                ? 'bg-amber-950/70 text-amber-200 border border-amber-800/80 font-medium'
                : 'text-neutral-400 hover:text-neutral-200'
            }`}
          >
            <ImageIcon className="w-3.5 h-3.5" />
            <span>Crear desde Texto</span>
          </button>
          <button
            onClick={() => setMode('edit')}
            className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-mono uppercase rounded transition-colors ${
              mode === 'edit'
                ? 'bg-amber-950/70 text-amber-200 border border-amber-800/80 font-medium'
                : 'text-neutral-400 hover:text-neutral-200'
            }`}
          >
            <Edit3 className="w-3.5 h-3.5" />
            <span>Editar Imagen</span>
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Form & Configuration */}
        <div className="lg:col-span-6 space-y-4">
          {mode === 'edit' && (
            <div className="space-y-2">
              <label className="text-xs font-mono uppercase tracking-wider text-neutral-400 block">
                Seleccionar Imagen Base para Edición:
              </label>
              <div className="grid grid-cols-4 gap-2">
                {currentProposals.map((asset) => (
                  <button
                    key={asset.id}
                    type="button"
                    onClick={() => setSelectedBaseAssetId(asset.id)}
                    className={`relative aspect-video rounded overflow-hidden border transition-all ${
                      asset.id === selectedBaseAssetId
                        ? 'border-amber-500 ring-2 ring-amber-500/30'
                        : 'border-neutral-800 opacity-60 hover:opacity-100'
                    }`}
                  >
                    <img
                      src={asset.imageUrl}
                      alt={asset.title}
                      className="w-full h-full object-cover"
                    />
                    <span className="absolute bottom-0 inset-x-0 bg-neutral-950/80 text-[7px] font-mono text-neutral-300 truncate px-1">
                      {asset.title}
                    </span>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Aspect Ratio */}
          <div className="space-y-1.5">
            <label className="text-xs font-mono uppercase tracking-wider text-neutral-400 block">
              Relación de Aspecto:
            </label>
            <div className="flex gap-2">
              {(['16:9', '1:1', '4:5', '9:16'] as const).map((ar) => (
                <button
                  key={ar}
                  type="button"
                  onClick={() => setAspectRatio(ar)}
                  className={`px-3 py-1 text-xs font-mono rounded border transition-colors ${
                    aspectRatio === ar
                      ? 'bg-neutral-800 text-neutral-100 border-amber-500 font-semibold'
                      : 'bg-neutral-950 border-neutral-800 text-neutral-400 hover:text-neutral-200'
                  }`}
                >
                  {ar}
                </button>
              ))}
            </div>
          </div>

          {/* Prompt */}
          <div className="space-y-1.5">
            <label className="text-xs font-mono uppercase tracking-wider text-neutral-400 block">
              {mode === 'create'
                ? 'Prompt de Creación Visual (gemini-nano-banana-2.1):'
                : 'Instrucción de Edición Visual:'}
            </label>
            <textarea
              rows={4}
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              placeholder={
                mode === 'create'
                  ? 'Describe detalladamente el aparato, entorno de laboratorio, iluminación y materiales...'
                  : 'Indica los cambios a aplicar sobre la imagen base (ej. aumentar contraste de sombras, atenuar reflejos de latón)...'
              }
              className="w-full bg-neutral-950 border border-neutral-800 rounded p-3 text-xs text-neutral-100 font-mono leading-relaxed focus:outline-none focus:border-amber-500"
            />
          </div>

          <div className="flex items-center justify-between pt-2">
            <span className="text-[11px] font-mono text-neutral-500">
              Modelo: <strong className="text-amber-400">gemini-nano-banana-2.1</strong>
            </span>

            <button
              onClick={handleGenerate}
              disabled={isGenerating || !prompt.trim()}
              className="flex items-center gap-2 px-4 py-2 bg-amber-500 hover:bg-amber-400 text-neutral-950 font-mono uppercase text-xs font-medium rounded transition-colors disabled:opacity-50 shadow-sm"
            >
              {isGenerating ? (
                <>
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  <span>Procesando...</span>
                </>
              ) : (
                <>
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>{mode === 'create' ? 'Generar Imagen' : 'Aplicar Edición'}</span>
                </>
              )}
            </button>
          </div>

          {error && (
            <div className="p-3 bg-rose-950/40 border border-rose-900/60 rounded text-rose-300 flex items-center gap-2 text-xs">
              <AlertTriangle className="w-3.5 h-3.5 text-rose-400 shrink-0" />
              <span>{error}</span>
            </div>
          )}
        </div>

        {/* Right Column: Visual Result & Epistemic Stamp */}
        <div className="lg:col-span-6 space-y-4">
          <div className="bg-neutral-950 rounded-lg border border-neutral-800 p-4 flex flex-col items-center justify-center min-h-[300px] relative overflow-hidden">
            {generatedImageBase64 ? (
              <div className="space-y-3 w-full">
                <div className="relative aspect-video bg-neutral-900 rounded overflow-hidden border border-neutral-800 flex items-center justify-center">
                  <img
                    src={generatedImageBase64}
                    alt="Resultado generado"
                    className="w-full h-full object-contain"
                  />

                  {/* Mandatory Epistemic Watermark */}
                  <div className="absolute top-2 left-2 bg-neutral-950/90 border border-amber-800 px-2 py-0.5 rounded text-[10px] font-mono text-amber-300 shadow-md flex items-center gap-1">
                    <AlertTriangle className="w-3 h-3 text-amber-400" />
                    <span>DEMOSTRACIÓN / ACTIVO SINTÉTICO (DEMO_SYNTHETIC)</span>
                  </div>

                  <div className="absolute bottom-2 right-2 bg-neutral-950/90 border border-neutral-800 px-2 py-0.5 rounded text-[9px] font-mono text-neutral-400">
                    gemini-nano-banana-2.1 · {aspectRatio}
                  </div>
                </div>

                <div className="flex items-center justify-between pt-1">
                  <div className="text-[11px] font-mono text-neutral-400 truncate max-w-xs">
                    Régimen: <span className="text-amber-400">DEMO_SYNTHETIC</span> (Sin auto-aprobación)
                  </div>

                  <button
                    onClick={handleAddAsProposal}
                    disabled={isAdded}
                    className="flex items-center gap-1.5 px-3 py-1.5 bg-neutral-800 hover:bg-neutral-700 text-neutral-100 font-mono text-xs uppercase rounded transition-colors disabled:opacity-50"
                  >
                    {isAdded ? (
                      <>
                        <Check className="w-3.5 h-3.5 text-emerald-400" />
                        <span>Añadido al Catálogo</span>
                      </>
                    ) : (
                      <>
                        <Plus className="w-3.5 h-3.5 text-amber-400" />
                        <span>Añadir a Biblioteca de Propuestas</span>
                      </>
                    )}
                  </button>
                </div>
              </div>
            ) : (
              <div className="text-center p-8 space-y-2">
                <ImageIcon className="w-10 h-10 text-neutral-700 mx-auto" />
                <p className="text-xs font-mono text-neutral-500">
                  El resultado generado con gemini-nano-banana-2.1 aparecerá aquí con la marca de agua obligatoria DEMO_SYNTHETIC.
                </p>
              </div>
            )}
          </div>

          {outputText && (
            <div className="bg-neutral-950/60 border border-neutral-800 rounded p-3 text-xs text-neutral-400 font-mono">
              <span className="text-[10px] text-neutral-500 block uppercase">Respuesta del Modelo:</span>
              <p className="text-neutral-300 mt-0.5">{outputText}</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
