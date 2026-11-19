/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * 
 * Audio Transcriber via Microphone Input using gemini-3.5-transcribe
 * Records microphone audio with MediaRecorder, encodes to base64,
 * and calls the server proxy endpoint /api/gemini/transcribe.
 * Provenance: DEMO_SYNTHETIC.
 */

import React, { useState, useRef } from 'react';
import { Mic, Square, Loader2, Copy, Check, FileText, AlertTriangle } from 'lucide-react';

interface AudioTranscriberMicProps {
  onInsertTranscript?: (text: string) => void;
  targetLabel?: string;
}

export const AudioTranscriberMic: React.FC<AudioTranscriberMicProps> = ({
  onInsertTranscript,
  targetLabel = 'Voz en Off / Nota',
}) => {
  const [isRecording, setIsRecording] = useState(false);
  const [recordingSeconds, setRecordingSeconds] = useState(0);
  const [audioBlob, setAudioBlob] = useState<Blob | null>(null);
  const [audioUrl, setAudioUrl] = useState<string | null>(null);
  const [isTranscribing, setIsTranscribing] = useState(false);
  const [transcript, setTranscript] = useState<string>('');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isCopied, setIsCopied] = useState(false);

  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const timerRef = useRef<number | null>(null);

  const startRecording = async () => {
    setErrorMessage(null);
    audioChunksRef.current = [];
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mediaRecorder = new MediaRecorder(stream);
      mediaRecorderRef.current = mediaRecorder;

      mediaRecorder.ondataavailable = (e) => {
        if (e.data.size > 0) {
          audioChunksRef.current.push(e.data);
        }
      };

      mediaRecorder.onstop = () => {
        const blob = new Blob(audioChunksRef.current, { type: 'audio/webm' });
        setAudioBlob(blob);
        const url = URL.createObjectURL(blob);
        setAudioUrl(url);
        stream.getTracks().forEach((track) => track.stop());
      };

      mediaRecorder.start();
      setIsRecording(true);
      setRecordingSeconds(0);

      timerRef.current = window.setInterval(() => {
        setRecordingSeconds((prev) => prev + 1);
      }, 1000);
    } catch (err: unknown) {
      console.error('Error al acceder al micrófono:', err);
      setErrorMessage('No se pudo acceder al micrófono. Verifique los permisos del navegador.');
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
      if (timerRef.current) {
        clearInterval(timerRef.current);
        timerRef.current = null;
      }
    }
  };

  const handleTranscribe = async () => {
    if (!audioBlob) return;
    setIsTranscribing(true);
    setErrorMessage(null);

    try {
      const reader = new FileReader();
      reader.readAsDataURL(audioBlob);
      reader.onloadend = async () => {
        const base64Data = (reader.result as string).split(',')[1];
        const res = await fetch('/api/gemini/transcribe', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            base64Audio: base64Data,
            mimeType: audioBlob.type || 'audio/webm',
            language: 'es',
          }),
        });

        const data = await res.json();
        if (data.error) {
          setErrorMessage(data.error);
        } else {
          setTranscript(data.transcript || '');
        }
        setIsTranscribing(false);
      };
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : String(err);
      setErrorMessage(`Error en la transcripción: ${msg}`);
      setIsTranscribing(false);
    }
  };

  const handleCopy = () => {
    if (!transcript) return;
    navigator.clipboard.writeText(transcript);
    setIsCopied(true);
    setTimeout(() => setIsCopied(false), 2000);
  };

  return (
    <div className="bg-neutral-950/80 border border-neutral-800 rounded-lg p-4 space-y-3">
      <div className="flex items-center justify-between border-b border-neutral-800/80 pb-2">
        <div className="flex items-center gap-2">
          <Mic className="w-4 h-4 text-amber-500" />
          <span className="text-xs font-serif font-medium text-neutral-200">
            Dictado por Micrófono & Transcripción (gemini-3.5-transcribe)
          </span>
        </div>
        <span className="text-[10px] font-mono uppercase bg-neutral-900 border border-neutral-800 text-amber-400 px-2 py-0.5 rounded">
          DEMO_SYNTHETIC
        </span>
      </div>

      <p className="text-[11px] text-neutral-400 leading-relaxed font-sans">
        Graba notas de campo o locución oral. El audio se procesa con <strong className="text-neutral-300 font-mono">gemini-3.5-transcribe</strong> y se clasifica bajo estricta procedencia sintética.
      </p>

      {errorMessage && (
        <div className="p-2 bg-rose-950/40 border border-rose-900/60 rounded text-[11px] text-rose-300 flex items-center gap-2">
          <AlertTriangle className="w-3.5 h-3.5 text-rose-400 shrink-0" />
          <span>{errorMessage}</span>
        </div>
      )}

      {/* Recording Controls */}
      <div className="flex flex-wrap items-center gap-3">
        {!isRecording ? (
          <button
            onClick={startRecording}
            className="flex items-center gap-2 px-3 py-1.5 text-xs font-mono uppercase bg-amber-500 hover:bg-amber-400 text-neutral-950 font-medium rounded transition-colors"
          >
            <Mic className="w-3.5 h-3.5" />
            <span>Iniciar Grabación</span>
          </button>
        ) : (
          <button
            onClick={stopRecording}
            className="flex items-center gap-2 px-3 py-1.5 text-xs font-mono uppercase bg-rose-600 hover:bg-rose-500 text-white font-medium rounded transition-colors animate-pulse"
          >
            <Square className="w-3.5 h-3.5" />
            <span>Detener ({recordingSeconds}s)</span>
          </button>
        )}

        {audioUrl && !isRecording && (
          <div className="flex items-center gap-2">
            <audio src={audioUrl} controls className="h-8 max-w-xs" />
            <button
              onClick={handleTranscribe}
              disabled={isTranscribing}
              className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-mono uppercase bg-neutral-800 hover:bg-neutral-700 text-neutral-200 border border-neutral-700 rounded transition-colors disabled:opacity-50"
            >
              {isTranscribing ? (
                <>
                  <Loader2 className="w-3.5 h-3.5 animate-spin text-amber-400" />
                  <span>Transcribiendo...</span>
                </>
              ) : (
                <>
                  <FileText className="w-3.5 h-3.5 text-amber-400" />
                  <span>Transcribir Audio</span>
                </>
              )}
            </button>
          </div>
        )}
      </div>

      {/* Transcript Result Box */}
      {transcript && (
        <div className="mt-3 bg-neutral-900/90 border border-neutral-800 rounded p-3 space-y-2 text-xs">
          <div className="flex items-center justify-between text-[11px] font-mono text-neutral-400 border-b border-neutral-800/80 pb-1.5">
            <span className="text-amber-400">Transcripción Obtenida (gemini-3.5-transcribe):</span>
            <div className="flex items-center gap-2">
              <button
                onClick={handleCopy}
                className="flex items-center gap-1 text-neutral-400 hover:text-neutral-200 transition-colors"
              >
                {isCopied ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                <span>{isCopied ? 'Copiado' : 'Copiar'}</span>
              </button>
              {onInsertTranscript && (
                <button
                  onClick={() => onInsertTranscript(transcript)}
                  className="px-2 py-0.5 bg-amber-500 hover:bg-amber-400 text-neutral-950 font-medium rounded text-[10px] uppercase tracking-wider"
                >
                  Insertar en {targetLabel}
                </button>
              )}
            </div>
          </div>
          <p className="text-neutral-200 font-serif italic leading-relaxed">
            «{transcript}»
          </p>
        </div>
      )}
    </div>
  );
};
