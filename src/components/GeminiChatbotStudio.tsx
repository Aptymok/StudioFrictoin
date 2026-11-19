/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 *
 * GEMINI MULTI-TURN CHATBOT STUDIO
 * Vista observable independiente para asistencia creativa, revisión epistémica y guionización
 * con historial multi-turno, selector de rol (systemInstruction) y selector de modelos:
 * - gemini-4-carbon (razonamiento profundo)
 * - gemini-4-argon (tareas interactivas complejas)
 * - gemini-4-hydrogen (uso general)
 * - gemini-3.1-flash-lite (rápido)
 */

import React, { useState, useRef, useEffect } from 'react';
import { ProjectData } from '../types';
import {
  MessageSquare,
  Send,
  Loader2,
  Trash2,
  AlertTriangle,
  Cpu,
  ShieldCheck,
  Sparkles,
  Copy,
  Check,
} from 'lucide-react';

type GeminiChatModel =
  | 'gemini-4-hydrogen'
  | 'gemini-4-argon'
  | 'gemini-4-carbon'
  | 'gemini-3.1-flash-lite';

interface ChatTurn {
  id: string;
  role: 'user' | 'model';
  text: string;
  model?: string;
  timestamp: string;
}

interface GeminiChatbotStudioProps {
  project: ProjectData;
}

const MODEL_OPTIONS: Array<{ id: GeminiChatModel; label: string; badge: string }> = [
  { id: 'gemini-4-hydrogen', label: 'Gemini 4 Hydrogen', badge: 'General' },
  { id: 'gemini-4-argon', label: 'Gemini 4 Argon', badge: 'Interactivo Complejo' },
  { id: 'gemini-4-carbon', label: 'Gemini 4 Carbon', badge: 'Razonamiento Profundo' },
  { id: 'gemini-3.1-flash-lite', label: 'Gemini 3.1 Flash-Lite', badge: 'Rápido' },
];

const SYSTEM_ROLES = [
  {
    id: 'epistemic_auditor',
    label: 'Auditor Epistémico SFI',
    instruction:
      'Eres el auditor metodológico de System Friction Institute (SFI Creative Companion). Separa estrictamente hechos observados, hipótesis, simulaciones sintéticas (DEMO_SYNTHETIC) y objetivos medibles. Nunca valides evidencia ficticia como canónica ni inventes dictámenes FAD.',
  },
  {
    id: 'acoustic_engineer',
    label: 'Ingeniero Acústico 35.2 Hz',
    instruction:
      'Eres especialista en acústica experimental y síntesis espectral para SFI Creative Companion. Propón configuraciones de canales, frecuencias armónicas (fundamental 35.2 Hz, 70.4 Hz, 140.8 Hz), instrumentación sobria y cortes WAV etiquetados como DEMO_SYNTHETIC.',
  },
  {
    id: 'audiovisual_director',
    label: 'Director Audiovisual & Guionista',
    instruction:
      'Eres director audiovisual de divulgación científica en SFI. Ayudas a redactar guiones por escena, prompts de imagen para Nano Banana 2.1 y planos para Omni Flash en 16:9 y 9:16 manteniendo las cartelas de demostración.',
  },
  {
    id: 'campaign_strategist',
    label: 'Estratega de Campañas 15d/90d',
    instruction:
      'Eres estratega de experimentos de comunicación científica. Evalúas hipótesis falsables en ciclos de 15 y 90 días, propones indicadores observables y criterios de decisión (Mantener / Modificar / Detener).',
  },
];

export const GeminiChatbotStudio: React.FC<GeminiChatbotStudioProps> = ({ project }) => {
  const [selectedModel, setSelectedModel] = useState<GeminiChatModel>('gemini-4-hydrogen');
  const [selectedRoleId, setSelectedRoleId] = useState<string>(SYSTEM_ROLES[0].id);
  const [messages, setMessages] = useState<ChatTurn[]>([
    {
      id: 'welcome-turn',
      role: 'model',
      text: `Observatorio de Asistencia Gemini activo sobre el expediente "${project.name}" (${project.code}). Selecciona el modelo adecuado (Hydrogen, Argon, Carbon o Flash-Lite) y plantea consultas sobre hipótesis, guión audiovisual, frecuencias o diseño de campaña. Todo borrador generado mantiene clasificación DEMO_SYNTHETIC.`,
      model: 'sistema',
      timestamp: new Date().toLocaleTimeString(),
    },
  ]);
  const [inputText, setInputText] = useState('');
  const [isSending, setIsSending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const threadEndRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    threadEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const activeRole = SYSTEM_ROLES.find((r) => r.id === selectedRoleId) || SYSTEM_ROLES[0];

  const handleSendMessage = async (customText?: string) => {
    const textToSend = (customText ?? inputText).trim();
    if (!textToSend || isSending) return;

    const userTurn: ChatTurn = {
      id: `user-${Date.now()}`,
      role: 'user',
      text: textToSend,
      timestamp: new Date().toLocaleTimeString(),
    };

    const historyForApi = messages
      .filter((m) => m.id !== 'welcome-turn')
      .map((m) => ({ role: m.role, text: m.text }));

    setMessages((prev) => [...prev, userTurn]);
    if (!customText) setInputText('');
    setIsSending(true);
    setError(null);

    try {
      const res = await fetch('/api/gemini/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: textToSend,
          history: historyForApi,
          model: selectedModel,
          systemInstruction: activeRole.instruction,
        }),
      });

      const data = await res.json();
      if (!res.ok || data.error) {
        setError(data.error || `Error del servidor (${res.status})`);
      } else {
        const modelTurn: ChatTurn = {
          id: `model-${Date.now()}`,
          role: 'model',
          text: data.text || '(Sin respuesta de texto)',
          model: data.model || selectedModel,
          timestamp: new Date().toLocaleTimeString(),
        };
        setMessages((prev) => [...prev, modelTurn]);
      }
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : String(err);
      setError(`Fallo de conexión con /api/gemini/chat: ${msg}`);
    } finally {
      setIsSending(false);
    }
  };

  const handleClearChat = () => {
    setMessages([
      {
        id: 'welcome-turn',
        role: 'model',
        text: `Historial reiniciado. Expediente activo: "${project.name}". Pregunta manteniendo la separación entre hechos observados, hipótesis y simulaciones DEMO_SYNTHETIC.`,
        model: 'sistema',
        timestamp: new Date().toLocaleTimeString(),
      },
    ]);
    setError(null);
  };

  const handleCopyTurn = (id: string, text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const quickPrompts = [
    `Analiza la hipótesis creativa de "${project.name}": "${project.creativeHypothesis}" y propón criterios de falsación verificables.`,
    `Redacta 3 variaciones de locución sobria para la escena "${project.audiovisualScenes[0]?.shotType || 'Plano 1'}" respetando la etiqueta DEMO_SYNTHETIC.`,
    `Sugiere una instrumentación musical en 35.2 Hz para acompañar el Aparato A en la bóveda subterránea.`,
  ];

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="bg-neutral-900/60 border border-neutral-800 rounded-xl p-6 space-y-4">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 border-b border-neutral-800 pb-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <MessageSquare className="w-5 h-5 text-cyan-400" />
              <span className="text-xs font-mono uppercase tracking-widest text-cyan-400 font-semibold">
                ASISTENTE MULTI-TURNO GEMINI · OBSERVATORIO DE DIÁLOGO
              </span>
            </div>
            <h2 className="text-2xl font-serif font-bold text-neutral-100">
              Copiloto Epistémico, Creativo y de Orquestación SFI
            </h2>
            <p className="text-xs text-neutral-400 max-w-3xl font-sans">
              Conversación con memoria multi-turno respaldada por los modelos Gemini 4 y Flash-Lite. Todo texto sugerido conserva procedencia <strong className="text-amber-400 font-mono">DEMO_SYNTHETIC</strong> hasta su revisión humana en SFI.
            </p>
          </div>

          <button
            onClick={handleClearChat}
            className="flex items-center gap-1.5 px-3 py-2 bg-neutral-950 hover:bg-neutral-900 border border-neutral-800 text-neutral-300 text-xs font-mono uppercase rounded-lg transition-colors shrink-0"
          >
            <Trash2 className="w-3.5 h-3.5 text-neutral-400" />
            <span>Limpiar Historial</span>
          </button>
        </div>

        {/* Model Selector & System Role */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
          <div className="lg:col-span-7 space-y-1.5">
            <span className="text-[10px] font-mono uppercase text-neutral-400 flex items-center gap-1.5">
              <Cpu className="w-3.5 h-3.5 text-amber-400" />
              <span>Selector de Modelo Gemini:</span>
            </span>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
              {MODEL_OPTIONS.map((m) => (
                <button
                  key={m.id}
                  onClick={() => setSelectedModel(m.id)}
                  className={`p-2 rounded-lg border text-left transition-colors ${
                    selectedModel === m.id
                      ? 'bg-cyan-950/60 border-cyan-500 text-cyan-100'
                      : 'bg-neutral-950 border-neutral-800 text-neutral-400 hover:text-neutral-200'
                  }`}
                >
                  <div className="text-[11px] font-mono font-semibold truncate">{m.label}</div>
                  <div className="text-[10px] font-mono text-neutral-400">{m.badge}</div>
                </button>
              ))}
            </div>
          </div>

          <div className="lg:col-span-5 space-y-1.5">
            <span className="text-[10px] font-mono uppercase text-neutral-400 flex items-center gap-1.5">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
              <span>Rol de Sistema (systemInstruction):</span>
            </span>
            <select
              value={selectedRoleId}
              onChange={(e) => setSelectedRoleId(e.target.value)}
              className="w-full bg-neutral-950 border border-neutral-800 rounded-lg px-3 py-2.5 text-xs font-mono text-neutral-100 focus:outline-none focus:border-cyan-500"
            >
              {SYSTEM_ROLES.map((r) => (
                <option key={r.id} value={r.id}>
                  {r.label}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Chat Viewport */}
      <div className="bg-neutral-950 border border-neutral-800 rounded-xl flex flex-col h-[520px] overflow-hidden">
        {/* Scrollable Thread */}
        <div className="flex-1 overflow-y-auto p-5 space-y-4">
          {messages.map((turn) => {
            const isUser = turn.role === 'user';
            return (
              <div
                key={turn.id}
                className={`flex flex-col ${isUser ? 'items-end' : 'items-start'}`}
              >
                <div
                  className={`max-w-[85%] rounded-xl p-4 space-y-2 border ${
                    isUser
                      ? 'bg-cyan-950/40 border-cyan-800/70 text-neutral-100'
                      : 'bg-neutral-900/70 border-neutral-800 text-neutral-200'
                  }`}
                >
                  <div className="flex items-center justify-between gap-4 text-[10px] font-mono text-neutral-400">
                    <span>
                      {isUser ? 'INVESTIGADOR' : `GEMINI (${turn.model || selectedModel})`}
                    </span>
                    <div className="flex items-center gap-2">
                      <span>{turn.timestamp}</span>
                      {!isUser && (
                        <button
                          onClick={() => handleCopyTurn(turn.id, turn.text)}
                          className="text-neutral-500 hover:text-neutral-200"
                          title="Copiar respuesta"
                        >
                          {copiedId === turn.id ? (
                            <Check className="w-3 h-3 text-emerald-400" />
                          ) : (
                            <Copy className="w-3 h-3" />
                          )}
                        </button>
                      )}
                    </div>
                  </div>
                  <div className="text-xs font-sans leading-relaxed whitespace-pre-wrap">
                    {turn.text}
                  </div>
                </div>
              </div>
            );
          })}

          {isSending && (
            <div className="flex items-center gap-2 text-xs font-mono text-cyan-400 p-2">
              <Loader2 className="w-4 h-4 animate-spin" />
              <span>Consultando {selectedModel}...</span>
            </div>
          )}
          <div ref={threadEndRef} />
        </div>

        {/* Error Display */}
        {error && (
          <div className="mx-5 mb-3 p-3 bg-rose-950/50 border border-rose-800 rounded-lg text-xs text-rose-200 flex items-center gap-2">
            <AlertTriangle className="w-4 h-4 text-rose-400 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {/* Quick Context Prompts + Input Bar */}
        <div className="border-t border-neutral-800 bg-neutral-900/50 p-4 space-y-3">
          <div className="flex flex-wrap gap-1.5">
            {quickPrompts.map((qp, idx) => (
              <button
                key={idx}
                onClick={() => setInputText(qp)}
                className="flex items-center gap-1 px-2.5 py-1 bg-neutral-950 hover:bg-neutral-800 border border-neutral-800 rounded text-[11px] font-mono text-neutral-300 transition-colors"
              >
                <Sparkles className="w-3 h-3 text-amber-400 shrink-0" />
                <span className="truncate max-w-[240px]">{qp}</span>
              </button>
            ))}
          </div>

          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleSendMessage();
            }}
            className="flex gap-2"
          >
            <input
              type="text"
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              placeholder={`Escribe tu consulta para ${selectedModel} (rol: ${activeRole.label})...`}
              className="flex-1 bg-neutral-950 border border-neutral-800 rounded-lg px-4 py-2.5 text-xs text-neutral-100 focus:outline-none focus:border-cyan-500"
            />
            <button
              type="submit"
              disabled={isSending || !inputText.trim()}
              className="flex items-center gap-2 px-4 py-2.5 bg-cyan-500 hover:bg-cyan-400 text-neutral-950 font-mono text-xs uppercase font-semibold rounded-lg transition-colors disabled:opacity-50"
            >
              <Send className="w-3.5 h-3.5" />
              <span>Enviar</span>
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};
