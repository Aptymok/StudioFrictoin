/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * 
 * SFI CREATIVE COMPANION — Epistemic Integrity Validator
 * 
 * Reglas de Validación Institucional SFI:
 * 1. Todo registro ficticio o de demostración DEBE tener procedencia 'DEMO_SYNTHETIC'.
 * 2. Bloquea cualquier intento de marcar elementos ficticios como 'canonical_sfi', 'external_archive' o 'alta_verificada'.
 * 3. 'hasReceivedFadData' no puede ser 'true' sin un sobre criptográfico verificado por SFI.
 * 4. Ningún activo generado puede auto-atribuirse licencias abiertas o dominio público.
 * 5. Impide exportar como evidencia canónica cualquier objeto de procedencia sintética.
 */

import { ProjectData, EpistemicValidationReport, ValidationIssue, SfiWorkPackage } from '../types';

export class EpistemicValidator {
  /**
   * Valida integralmente el estado epistemológico de un proyecto.
   */
  public static validateProject(project: ProjectData): EpistemicValidationReport {
    const issues: ValidationIssue[] = [];
    let syntheticSourcesCount = 0;
    let syntheticMediaCount = 0;
    let hasAttemptedCanonicalPromotion = false;
    let hasFadClaimWithoutVerification = false;

    // 1. Validar Fuentes Documentales
    project.verifiableSources.forEach((src) => {
      if (src.provenance === 'DEMO_SYNTHETIC') {
        syntheticSourcesCount++;
        // Violación si una fuente sintética intenta clasificarse como canónica
        if (src.institutionalVerification === 'canonical_sfi_verified') {
          hasAttemptedCanonicalPromotion = true;
          issues.push({
            severity: 'CRITICAL_BLOCKER',
            code: 'ERR_SYNTHETIC_CANONICAL_PROMOTION',
            message: `La fuente ficticia "${src.title}" [${src.archiveReference}] intenta falsamente declararse como canónica de SFI. Procedencia obligatoria: DEMO_SYNTHETIC.`,
            targetId: src.id,
          });
        }
      } else if (src.provenance !== 'SFI_CANONICAL_ENVELOPE') {
        issues.push({
          severity: 'CRITICAL_BLOCKER',
          code: 'ERR_INVALID_PROVENANCE_TAG',
          message: `La fuente "${src.title}" tiene un identificador de procedencia no autorizado: "${src.provenance}". Debe ser DEMO_SYNTHETIC.`,
          targetId: src.id,
        });
      }
    });

    // 2. Validar Material Multimedia Autorizado
    project.authorizedMedia.forEach((media) => {
      if (media.provenance === 'DEMO_SYNTHETIC') {
        syntheticMediaCount++;

        // Detección de auto-atribución de derechos de autor o dominio público
        const rightsLower = media.rightsDeclared.toLowerCase();
        if (
          rightsLower.includes('dominio público') ||
          rightsLower.includes('licencia abierta institucional') ||
          rightsLower.includes('creative commons')
        ) {
          issues.push({
            severity: 'CRITICAL_BLOCKER',
            code: 'ERR_UNAUTHORIZED_RIGHTS_SELF_ATTRIBUTION',
            message: `El activo "${media.title}" se auto-atribuye derechos o licencias sin dictamen jurídico de SFI. Debe catalogarse como NO AUTORIZADO / DEMO_SYNTHETIC.`,
            targetId: media.id,
          });
        }
      }
    });

    // 3. Validar Hitos de Línea Temporal
    project.timelineEvents.forEach((event) => {
      if (event.provenance === 'DEMO_SYNTHETIC') {
        if (event.certaintyLevel === 'alta_verificada_sfi') {
          hasAttemptedCanonicalPromotion = true;
          issues.push({
            severity: 'CRITICAL_BLOCKER',
            code: 'ERR_SYNTHETIC_CERTAINTY_ELEVATION',
            message: `El hito "${event.title}" [${event.year}] declara "alta_verificada_sfi" pero su procedencia es DEMO_SYNTHETIC. Debe ser "simulacion_teorica_demo".`,
            targetId: event.id,
          });
        }
      }
    });

    // 4. Validar Dictamen FAD
    if (project.fadIntegration.hasReceivedFadData) {
      if (!project.fadIntegration.canonicalReportReference?.startsWith('SFI-AUTHENTICATED-SIG-')) {
        hasFadClaimWithoutVerification = true;
        issues.push({
          severity: 'CRITICAL_BLOCKER',
          code: 'ERR_UNVERIFIED_FAD_RECEPTION_CLAIM',
          message: 'La aplicación afirma haber recibido datos FAD canónicos (hasReceivedFadData: true) sin firma criptográfica válida de SFI. Debe mantenerse en false.',
        });
      }
    }

    // 5. Validar Propuestas Visuales (Watermark y estado sintético)
    project.visualProposals.forEach((prop) => {
      if (prop.provenanceRecord !== 'DEMO_SYNTHETIC') {
        issues.push({
          severity: 'CRITICAL_BLOCKER',
          code: 'ERR_VISUAL_MISSING_DEMO_TAG',
          message: `La propuesta visual "${prop.title}" carece del registro obligatorio DEMO_SYNTHETIC.`,
          targetId: prop.id,
        });
      }
    });

    // 6. Validar Segmentos de Audio Importados / Anotados (Multimedia Layer)
    (project.audioSegments || []).forEach((seg) => {
      if (seg.provenance !== 'DEMO_SYNTHETIC' || !seg.isDemoSynthetic) {
        hasAttemptedCanonicalPromotion = true;
        issues.push({
          severity: 'CRITICAL_BLOCKER',
          code: 'ERR_AUDIO_SEGMENT_MISSING_DEMO_TAG',
          message: `El segmento de audio "${seg.audioFileName}" (${seg.startTime}s-${seg.endTime}s) debe portar procedencia obligatoria DEMO_SYNTHETIC e isDemoSynthetic: true.`,
          targetId: seg.id,
        });
      }
    });

    const totalSyntheticItems =
      syntheticSourcesCount +
      syntheticMediaCount +
      project.timelineEvents.filter((e) => e.provenance === 'DEMO_SYNTHETIC').length +
      project.visualProposals.filter((p) => p.provenanceRecord === 'DEMO_SYNTHETIC').length +
      (project.audioSegments || []).filter((s) => s.provenance === 'DEMO_SYNTHETIC').length;

    const hasBlockers = issues.some((i) => i.severity === 'CRITICAL_BLOCKER');

    return {
      isValidForReviewExport: !hasBlockers,
      canExportAsCanonicalEvidence: false, // Siempre falso: Creative Companion jamás produce evidencia canónica
      issues,
      totalSyntheticItems,
      syntheticSourcesCount,
      syntheticMediaCount,
      hasAttemptedCanonicalPromotion,
      hasFadClaimWithoutVerification,
      validatedAt: new Date().toISOString(),
    };
  }

  /**
   * Valida un paquete de trabajo antes de permitir su exportación.
   * Si detecta datos sintéticos intentando pasar como evidencia canónica, bloquea la exportación.
   */
  public static validateWorkPackage(pkg: SfiWorkPackage): {
    canExport: boolean;
    reason?: string;
  } {
    if (pkg.formalStatus !== 'BORRADOR DE PROPUESTA CREATIVA (NO EVIDENCIA)') {
      return {
        canExport: false,
        reason: 'Violación de estado: El paquete no puede declararse como evidencia canónica o aprobada.',
      };
    }

    if (pkg.epistemicNatureDeclaration !== 'PROPUESTA_CREATIVA_SINTETICA') {
      return {
        canExport: false,
        reason: 'Violación de naturaleza: Todo paquete generado por Creative Companion debe declararse como PROPUESTA_CREATIVA_SINTETICA.',
      };
    }

    const report = pkg.validationReport;
    if (!report.isValidForReviewExport) {
      return {
        canExport: false,
        reason: `Existen ${report.issues.length} bloqueadores críticos de integridad epistemológica pendientes de corrección.`,
      };
    }

    return { canExport: true };
  }
}
