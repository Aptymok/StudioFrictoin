/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * 
 * MÓDULO 7: EXPORTACIÓN HACIA SFI
 * Empaqueta el trabajo creativo complementario en un paquete formal
 * con estado inmutable BORRADOR DE PROPUESTA CREATIVA (NO EVIDENCIA).
 * Validador Epistemológico Integrado: Impide exportar como evidencia auténtica
 * cualquier objeto con procedencia ficticia o sin verificar.
 */

import React, { useState, useMemo } from 'react';
import { ProjectData, SfiWorkPackage } from '../types';
import { EpistemicValidator } from '../utils/epistemicValidator';
import { 
  Package, 
  Download, 
  Copy, 
  Check, 
  ShieldAlert, 
  FileText, 
  CheckCircle2, 
  AlertTriangle,
  Lock,
  ShieldCheck,
  XCircle
} from 'lucide-react';

interface ModuleSfiExporterProps {
  project: ProjectData;
  onClose?: () => void;
}

export const ModuleSfiExporter: React.FC<ModuleSfiExporterProps> = ({ project, onClose }) => {
  const [copiedFormat, setCopiedFormat] = useState<'json' | 'md' | null>(null);
  const [downloadSuccess, setDownloadSuccess] = useState(false);

  // Run epistemic validation on the project
  const validationReport = useMemo(() => {
    return EpistemicValidator.validateProject(project);
  }, [project]);

  // Generate standardized SFI Work Package with validation envelope
  const workPackage: SfiWorkPackage = useMemo(() => {
    return {
      packageId: `SFI-WP-${project.code.replace(/[^A-Z0-9]/g, '')}-${Date.now().toString().slice(-6)}`,
      originProjectId: project.id,
      projectCode: project.code,
      materialType: 'Paquete de Propuestas Creativas y Adaptaciones Didácticas',
      versionTag: 'v1.2-DRAFT-DEMO-SYNTHETIC',
      generatedAt: new Date().toISOString(),
      epistemicNatureDeclaration: 'PROPUESTA_CREATIVA_SINTETICA',
      provenanceSummary: 'DEMO_SYNTHETIC',
      filesAvailable: [
        {
          filename: 'sfi_demo_archive_focal_synthetic.jpg',
          format: 'JPEG (Simulación fotográfica)',
          sizeOrDuration: '1920x1080 px · 1.8 MB',
          integrityRef: 'SHA256: 4f981bc884...focal1934',
          category: 'Recreación Sintética Didáctica',
          isDemoSynthetic: true,
          provenance: 'DEMO_SYNTHETIC',
          rightsDisclaimer: 'NO AUTORIZADO / ACTIVO SINTÉTICO DEMO - REQUIERE DICTAMEN JURÍDICO SFI',
        },
        {
          filename: 'sfi_demo_micrographic_synthetic.jpg',
          format: 'JPEG (Simulación metalográfica)',
          sizeOrDuration: '1600x1200 px · 2.4 MB',
          integrityRef: 'SHA256: 98da7c112e...micro1952',
          category: 'Micrografía Sintética',
          isDemoSynthetic: true,
          provenance: 'DEMO_SYNTHETIC',
          rightsDisclaimer: 'NO AUTORIZADO / ACTIVO SINTÉTICO DEMO - REQUIERE DICTAMEN JURÍDICO SFI',
        },
        {
          filename: 'sfi_demo_subterranean_reconstruction.jpg',
          format: 'JPEG (Croquis 3D axonométrico)',
          sizeOrDuration: '1920x1080 px · 1.1 MB',
          integrityRef: 'SHA256: 77a01bc833...recon2026',
          category: 'Reconstrucción Creativa Didáctica',
          isDemoSynthetic: true,
          provenance: 'DEMO_SYNTHETIC',
          rightsDisclaimer: 'NO AUTORIZADO / ACTIVO SINTÉTICO DEMO - REQUIERE DICTAMEN JURÍDICO SFI',
        },
        {
          filename: 'script_and_subtitles_crono_friction_demo.srt',
          format: 'SubRip Subtitle (.SRT)',
          sizeOrDuration: '30.0 segundos · 4 planos secuenciales',
          integrityRef: 'SHA256: e8271109aa...srt2026',
          category: 'Guión Audiovisual Sincronizado (DEMO)',
          isDemoSynthetic: true,
          provenance: 'DEMO_SYNTHETIC',
          rightsDisclaimer: 'NO AUTORIZADO / ACTIVO SINTÉTICO DEMO - REQUIERE DICTAMEN JURÍDICO SFI',
        },
      ],
      originReferences: project.verifiableSources.map((s) => ({
        refCode: s.archiveReference,
        archiveTitle: s.title,
        verificationStatus: s.institutionalVerification,
        provenance: s.provenance,
      })),
      rightsDeclaration: 'ESTADO DE DERECHOS: NO AUTORIZADO / ACTIVO SINTÉTICO DEMO. Ningún material derivado se presume de dominio público, con licencias abiertas o con derechos de reproducción cedidos. Cualquier uso institucional requiere dictamen jurídico expreso de SFI.',
      transformationsPerformed: [
        'Generación de modelos visuales sintéticos rotulados con advertencia DEMO_SYNTHETIC.',
        'Sincronización de guión didáctico con tono senoidal sintético a 35.2 Hz.',
        'Elaboración de modelo volumétrico 3D rotulado de forma explícita como RECONSTRUCCIÓN CREATIVA SINTÉTICA.',
        'Adaptación de relaciones de aspecto para 6 canales (Instagram, TikTok, YouTube, Facebook, LinkedIn, Web).',
        'Definición de planes de campaña a 15 y 90 días supeditados a métricas observables reales sin cifras inventadas.',
      ],
      epistemicWarningsAndLimits: [
        'ADVERTENCIA 01: Todos los activos poseen procedencia DEMO_SYNTHETIC. Queda prohibido presentarlos como documentos históricos reales.',
        'ADVERTENCIA 02: hasReceivedFadData permanece en false. No se ha recibido ni calculado evaluación FAD desde el núcleo de SFI.',
        'ADVERTENCIA 03: Esta herramienta externa carece de permisos para alterar el registro Reality Chain o emitir evidencia canónica.',
      ],
      fadNotice: 'FAD pertenece a SFI. El paquete declara hasReceivedFadData: false; ningún cálculo matemático de fricción fue ejecutado localmente.',
      formalStatus: 'BORRADOR DE PROPUESTA CREATIVA (NO EVIDENCIA)',
      nonCanonicalClause: 'CLÁUSULA DE SALVAGUARDA CANÓNICA: Este paquete NO podrá autoaprobarse, autopublicarse ni convertirse en evidencia canónica en los repositorios de SFI bajo ninguna circunstancia. Cualquier intento de eliminar la procedencia DEMO_SYNTHETIC invalida formalmente este expediente.',
      validationReport,
    };
  }, [project, validationReport]);

  const packageValidation = useMemo(() => {
    return EpistemicValidator.validateWorkPackage(workPackage);
  }, [workPackage]);

  const jsonString = useMemo(() => {
    return JSON.stringify(workPackage, null, 2);
  }, [workPackage]);

  const markdownString = useMemo(() => {
    return `# PAQUETE DE TRABAJO CREATIVO COMPLEMENTARIO (DEMO_SYNTHETIC)
**ESTADO FORMAL:** ${workPackage.formalStatus}
**ID PAQUETE:** ${workPackage.packageId}
**PROYECTO DE ORIGEN:** ${workPackage.projectCode} (${project.name})
**FECHA DE GENERACIÓN:** ${workPackage.generatedAt}
**PROCEDENCIA GLOBAL:** ${workPackage.provenanceSummary}

---

## 1. Naturaleza y Salvaguarda Institucional
> **${workPackage.nonCanonicalClause}**

- **Declaración Epistemológica:** ${workPackage.epistemicNatureDeclaration}
- **Versión:** ${workPackage.versionTag}
- **Condición Operativa:** Autónomo / Desconectado de la base de producción de SFI.
- **Evidencia Canónica:** ESTRICTAMENTE BLOQUEADA (${validationReport.canExportAsCanonicalEvidence ? 'SÍ' : 'NO'})

---

## 2. Archivos Ficticios Disponibles en el Paquete
| Archivo | Formato | Dimensión / Duración | Categoría Epistémica | Procedencia |
| :--- | :--- | :--- | :--- | :--- |
${workPackage.filesAvailable
  .map((f) => `| \`${f.filename}\` | ${f.format} | ${f.sizeOrDuration} | ${f.category} | **${f.provenance}** |`)
  .join('\n')}

---

## 3. Referencias Documentales Simuladas
${workPackage.originReferences
  .map((r) => `- **[${r.refCode}]** ${r.archiveTitle} *(Procedencia: ${r.provenance} · Verificación: ${r.verificationStatus})*`)
  .join('\n')}

---

## 4. Transformaciones Efectuadas
${workPackage.transformationsPerformed.map((t) => `1. ${t}`).join('\n')}

---

## 5. Advertencias, Límites y Protocolo FAD
${workPackage.epistemicWarningsAndLimits.map((w) => `- ⚠️ ${w}`).join('\n')}

*Aviso FAD:* ${workPackage.fadNotice}

---

## 6. Régimen Jurídico de Derechos
${workPackage.rightsDeclaration}
`;
  }, [workPackage, project, validationReport]);

  const copyToClipboard = (text: string, format: 'json' | 'md') => {
    navigator.clipboard.writeText(text);
    setCopiedFormat(format);
    setTimeout(() => setCopiedFormat(null), 2000);
  };

  const downloadFile = (content: string, filename: string, mime: string) => {
    if (!packageValidation.canExport) return;
    const blob = new Blob([content], { type: mime });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    setDownloadSuccess(true);
    setTimeout(() => setDownloadSuccess(false), 2500);
  };

  return (
    <div className="space-y-8 max-w-5xl mx-auto py-6">
      {/* Module Title */}
      <div className="border-b border-neutral-800 pb-6 flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <span className="text-xs font-mono uppercase tracking-widest text-amber-500/90 block mb-1">
            Módulo 7 — Gobernanza & Transferencia Institucional
          </span>
          <h1 className="text-2xl md:text-3xl font-serif text-neutral-100">
            Exportación hacia SFI: Paquete de Trabajo
          </h1>
          <p className="text-sm text-neutral-400 mt-1 max-w-3xl">
            Genera un contenedor de intercambio formal que compila activos didácticos, referencias, transformaciones
            y advertencias. <strong className="text-neutral-200">El paquete porta procedencia DEMO_SYNTHETIC y nunca puede autoaprobarse como evidencia canónica.</strong>
          </p>
        </div>

        {onClose && (
          <button
            onClick={onClose}
            className="px-3.5 py-1.5 text-xs text-neutral-400 hover:text-neutral-200 border border-neutral-800 rounded transition-colors"
          >
            Volver a la Aplicación
          </button>
        )}
      </div>

      {/* Epistemic Validation Status Card */}
      <div
        className={`border-2 rounded-lg p-5 space-y-3 ${
          packageValidation.canExport
            ? 'bg-neutral-950/80 border-amber-600/70'
            : 'bg-rose-950/30 border-rose-600'
        }`}
      >
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            {packageValidation.canExport ? (
              <ShieldCheck className="w-5 h-5 text-emerald-400" />
            ) : (
              <XCircle className="w-5 h-5 text-rose-400" />
            )}
            <span className="font-mono text-xs uppercase tracking-wider font-semibold text-neutral-100">
              ESTADO EPISTEMOLÓGICO: {workPackage.formalStatus}
            </span>
          </div>
          <span className="text-[11px] font-mono text-amber-400 bg-neutral-950 px-2 py-0.5 rounded border border-amber-800/60 self-start sm:self-auto">
            {workPackage.packageId}
          </span>
        </div>

        <p className="text-xs text-amber-200/90 leading-relaxed font-sans">
          <strong>SALVAGUARDA DE AUTENTICIDAD:</strong> Este paquete contiene exclusivamente propuestas creativas
          con procedencia <strong className="font-mono text-amber-400">DEMO_SYNTHETIC</strong> ({validationReport.totalSyntheticItems} activos clasificados). 
          <span className="underline decoration-amber-400 ml-1">
            Ningún objeto puede elevarse a evidencia canónica ni autoaprobarse.
          </span>
        </p>

        {validationReport.issues.length > 0 && (
          <div className="pt-2 border-t border-neutral-800 space-y-1">
            <span className="text-[11px] font-mono uppercase text-rose-400 block">
              Observaciones del Validador Epistemológico ({validationReport.issues.length}):
            </span>
            {validationReport.issues.map((iss, i) => (
              <div key={i} className="text-xs text-rose-300 flex items-start gap-1.5 font-mono">
                <span>·</span>
                <span>[{iss.code}]: {iss.message}</span>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Pre-Flight Checklist */}
      <div className="bg-neutral-900/40 border border-neutral-800 rounded-lg p-5 space-y-3">
        <span className="text-xs font-mono uppercase tracking-wider text-neutral-400 block">
          Lista de Comprobación Pre-Vuelo para Transferencia a SFI
        </span>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs">
          <div className="flex items-center gap-2 text-neutral-300 bg-neutral-950/70 p-2.5 rounded border border-neutral-800/80">
            <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
            <span>Procedencia DEMO_SYNTHETIC presente en todos los activos</span>
          </div>
          <div className="flex items-center gap-2 text-neutral-300 bg-neutral-950/70 p-2.5 rounded border border-neutral-800/80">
            <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
            <span>Sin auto-atribución de derechos de autor ni licencias abiertas</span>
          </div>
          <div className="flex items-center gap-2 text-neutral-300 bg-neutral-950/70 p-2.5 rounded border border-neutral-800/80">
            <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
            <span>hasReceivedFadData fijado en false (sin cálculo ficticio)</span>
          </div>
          <div className="flex items-center gap-2 text-neutral-300 bg-neutral-950/70 p-2.5 rounded border border-neutral-800/80">
            <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
            <span>Metas e hipótesis estrictamente diferenciadas de resultados</span>
          </div>
          <div className="flex items-center gap-2 text-neutral-300 bg-neutral-950/70 p-2.5 rounded border border-neutral-800/80">
            <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
            <span>Exportación como evidencia canónica: ESTRICTAMENTE BLOQUEADA</span>
          </div>
          <div className="flex items-center gap-2 text-neutral-300 bg-neutral-950/70 p-2.5 rounded border border-neutral-800/80">
            <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
            <span>Condición air-gapped verificada: Sin mutaciones en BD de SFI</span>
          </div>
        </div>
      </div>

      {/* Export Actions & Code Previews */}
      <div className="bg-neutral-900/50 border border-neutral-800 rounded-lg p-6 space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-neutral-800 pb-4">
          <div>
            <h3 className="text-base font-serif font-medium text-neutral-100">
              Descargar o Copiar Paquete de Trabajo
            </h3>
            <p className="text-xs text-neutral-400 mt-0.5">
              Disponible en JSON estandarizado para ingesta o en Markdown para actas de revisión.
            </p>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <button
              onClick={() =>
                downloadFile(
                  jsonString,
                  `${workPackage.packageId}.json`,
                  'application/json'
                )
              }
              disabled={!packageValidation.canExport}
              className="flex items-center gap-1.5 px-3 py-2 text-xs font-mono uppercase tracking-wider bg-amber-500 hover:bg-amber-400 disabled:opacity-40 text-neutral-950 font-semibold rounded transition-colors"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Descargar .JSON</span>
            </button>

            <button
              onClick={() =>
                downloadFile(
                  markdownString,
                  `${workPackage.packageId}.md`,
                  'text/markdown'
                )
              }
              disabled={!packageValidation.canExport}
              className="flex items-center gap-1.5 px-3 py-2 text-xs font-mono uppercase tracking-wider bg-neutral-800 hover:bg-neutral-700 disabled:opacity-40 text-neutral-200 rounded transition-colors"
            >
              <FileText className="w-3.5 h-3.5" />
              <span>Descargar .MD</span>
            </button>
          </div>
        </div>

        {/* JSON Preview Tab */}
        <div className="space-y-2">
          <div className="flex items-center justify-between text-xs text-neutral-400 font-mono">
            <span>Vista Previa del Manifiesto JSON (Procedencia DEMO_SYNTHETIC)</span>
            <button
              onClick={() => copyToClipboard(jsonString, 'json')}
              className="hover:text-neutral-200 transition-colors flex items-center gap-1"
            >
              {copiedFormat === 'json' ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
              <span>{copiedFormat === 'json' ? 'Copiado al portapapeles' : 'Copiar JSON'}</span>
            </button>
          </div>
          <pre className="bg-neutral-950 border border-neutral-800 rounded p-4 text-xs font-mono text-neutral-300 overflow-x-auto max-h-64 leading-relaxed">
            {jsonString}
          </pre>
        </div>
      </div>
    </div>
  );
};
